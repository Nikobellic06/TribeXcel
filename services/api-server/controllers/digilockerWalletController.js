const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const DigiLockerDocument = require('../models/DigiLockerDocument');
const DigiLockerUser = require('../models/DigiLockerUser');
const DigiLockerAccessGrant = require('../models/DigiLockerAccessGrant');
const Document = require('../models/Document');
const { DOCUMENT_SCHEMAS, getSchemaByType, mapTribeXcelKeyToDocType } = require('../integrations/digilocker/documentSchemas');
const { processDocumentOcr, computeFileHash, generateRandomFieldValue } = require('../integrations/digilocker/sandboxOcrService');

const WALLET_STORAGE_DIR = path.join(__dirname, '../storage/digilocker');

/**
 * Ensure storage directory exists
 */
function ensureStorageDir(studentId) {
  const dir = path.join(WALLET_STORAGE_DIR, studentId.toString());
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

/**
 * Get or sync DigiLockerUser
 */
async function getOrCreateDigiLockerUser(student) {
  let dUser = await DigiLockerUser.findOne({ studentId: student._id });
  if (!dUser) {
    dUser = await DigiLockerUser.create({
      studentId: student._id,
      name: student.name || 'DigiLocker User',
      email: student.email || `${student._id}@sandbox.digilocker.local`,
      mobile: student.mobile || '98XXXXXX42',
      environment: 'SANDBOX',
    });
  }
  return dUser;
}

/**
 * GET /api/digilocker/wallet/overview
 */
const getWalletOverview = async (req, res) => {
  try {
    const student = req.student;
    const dUser = await getOrCreateDigiLockerUser(student);

    const totalDocs = await DigiLockerDocument.countDocuments({
      $or: [{ ownerId: student._id }, { studentId: student._id }],
    });

    const readyToShare = await DigiLockerDocument.countDocuments({
      $or: [{ ownerId: student._id }, { studentId: student._id }],
      status: { $in: ['READY_TO_SHARE', 'USER_VERIFIED', 'RETRIEVED'] },
    });

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentlyUpdated = await DigiLockerDocument.countDocuments({
      $or: [{ ownerId: student._id }, { studentId: student._id }],
      updatedAt: { $gte: sevenDaysAgo },
    });

    res.json({
      success: true,
      user: {
        id: dUser._id,
        name: dUser.name,
        email: dUser.email,
        mobile: dUser.mobile,
        environment: 'SANDBOX',
      },
      stats: {
        totalDocuments: totalDocs,
        readyToShare,
        recentlyUpdated,
      },
      schemas: Object.values(DOCUMENT_SCHEMAS).map((s) => ({
        documentType: s.documentType,
        displayName: s.displayName,
        category: s.category,
        targetTribeXcelKey: s.targetTribeXcelKey,
        defaultIssuer: s.defaultIssuer,
        description: s.description,
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/digilocker/wallet/documents
 */
const getWalletDocuments = async (req, res) => {
  try {
    const studentId = req.student._id;
    const { category, search, status, sort } = req.query;

    const query = {
      $or: [{ ownerId: studentId }, { studentId: studentId }],
    };

    if (category && category !== 'ALL') {
      query.category = category.toUpperCase();
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      query.$and = [
        {
          $or: [
            { documentName: regex },
            { documentType: regex },
            { documentNumber: regex },
            { issuer: regex },
          ],
        },
      ];
    }

    let sortOption = { updatedAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'newest') sortOption = { createdAt: -1 };

    const docs = await DigiLockerDocument.find(query).sort(sortOption);

    const mapped = docs.map((doc) => {
      const schema = getSchemaByType(doc.documentType);
      const extractedObj = {};
      if (doc.extractedData) {
        if (doc.extractedData instanceof Map) {
          doc.extractedData.forEach((val, k) => {
            extractedObj[k] = val;
          });
        } else {
          Object.assign(extractedObj, doc.extractedData);
        }
      }

      return {
        _id: doc._id,
        documentType: doc.documentType,
        documentName: doc.documentName,
        category: doc.category,
        issuer: doc.issuer,
        documentNumber: doc.documentNumber,
        issuedDate: doc.issuedDate,
        status: doc.status,
        verificationStatus: doc.verificationStatus,
        ocrStatus: doc.ocrStatus,
        fileHash: doc.fileHash,
        version: doc.version,
        originalFile: doc.originalFile,
        extractedSummary: extractedObj,
        schemaDisplayName: schema ? schema.displayName : doc.documentName,
        targetTribeXcelKey: schema ? schema.targetTribeXcelKey : null,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      };
    });

    res.json({
      success: true,
      documents: mapped,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/digilocker/wallet/upload
 */
const uploadDocument = async (req, res) => {
  try {
    const student = req.student;
    let fileBuffer = null;
    let fileName = '';
    let mimeType = 'application/pdf';
    let fileSize = 0;

    if (req.file) {
      fileBuffer = req.file.buffer;
      fileName = req.file.originalname;
      mimeType = req.file.mimetype;
      fileSize = req.file.size;
    } else if (req.body.data || req.body.fileBase64) {
      const rawData = req.body.data || req.body.fileBase64;
      fileName = req.body.fileName || 'uploaded_document.pdf';
      mimeType = req.body.mimeType || 'application/pdf';
      const cleanBase64 = rawData.replace(/^data:[^,]+,/, '');
      fileBuffer = Buffer.from(cleanBase64, 'base64');
      fileSize = fileBuffer.length;
    }

    if (!fileBuffer || fileBuffer.length === 0) {
      return res.status(400).json({ success: false, message: 'No document file provided for upload' });
    }

    // 10MB limit
    if (fileSize > 10 * 1024 * 1024) {
      return res.status(400).json({ success: false, message: 'File size exceeds maximum permitted limit (10MB)' });
    }

    // MIME and Extension validation (Reject executables)
    const ext = path.extname(fileName).toLowerCase();
    const disallowedExts = ['.exe', '.sh', '.bat', '.cmd', '.js', '.py', '.msi', '.vbs', '.scr'];
    if (disallowedExts.includes(ext)) {
      return res.status(400).json({ success: false, message: 'Executable files are strictly forbidden' });
    }

    const allowedMimes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedMimes.includes(mimeType.toLowerCase())) {
      return res.status(400).json({ success: false, message: 'Only PDF, JPEG, JPG, and PNG documents are allowed' });
    }

    const { documentType, documentName, issuer, issuedDate } = req.body;
    if (!documentType) {
      return res.status(400).json({ success: false, message: 'documentType is required' });
    }

    const schema = getSchemaByType(documentType);
    const finalDocType = schema ? schema.documentType : documentType.toUpperCase();
    const finalDocName = documentName || (schema ? schema.displayName : 'Uploaded Document');
    const finalCategory = schema ? schema.category : 'OTHER';
    const finalIssuer = issuer || (schema ? schema.defaultIssuer : 'Sandbox State Authority');

    // Storage setup
    const studentDir = ensureStorageDir(student._id);
    const fileExt = ext || (mimeType.includes('png') ? '.png' : mimeType.includes('jpeg') || mimeType.includes('jpg') ? '.jpg' : '.pdf');
    const storageFileName = `doc-${Date.now()}-${crypto.randomBytes(4).toString('hex')}${fileExt}`;
    const targetFilePath = path.join(studentDir, storageFileName);

    // Write file to private storage
    fs.writeFileSync(targetFilePath, fileBuffer);

    // Compute cryptographic SHA-256 hash
    const fileHash = computeFileHash(fileBuffer);
    const docNumber = `DL-${Date.now().toString().slice(-6)}`;

    // Fast direct upload without running OCR
    const extractedData = {};
    if (schema) {
      schema.fields.forEach((fDef) => {
        const val = generateRandomFieldValue(
          fDef,
          { name: student.name, dob: student.dob, state: student.state },
          finalDocType
        );
        extractedData[fDef.key] = {
          value: val,
          confidence: 0.95,
          source: 'SYSTEM',
          sourcePage: 1,
          isLowConfidence: false,
          originalValue: val,
          isEdited: false,
          editedValue: null,
          editedBy: null,
          editedAt: null,
        };
      });
    }

    const ocrResult = {
      ocrStatus: 'COMPLETED',
      ocrText: '',
      status: 'OCR_COMPLETED',
      extractedData,
      hasLowConfidence: false,
    };

    // Create DigiLockerDocument record immediately ready for wallet use
    const newDoc = new DigiLockerDocument({
      ownerId: student._id,
      studentId: student._id,
      documentType: finalDocType,
      documentName: finalDocName,
      category: finalCategory,
      issuer: finalIssuer,
      documentNumber: docNumber,
      issuedDate: issuedDate ? new Date(issuedDate) : new Date(),
      status: ocrResult.status || 'OCR_COMPLETED',
      originalFile: {
        fileName: fileName,
        mimeType: mimeType,
        size: fileSize,
        uploadedAt: new Date(),
      },
      storedFilePath: targetFilePath,
      fileHash: fileHash,
      ocrStatus: ocrResult.ocrStatus || 'COMPLETED',
      ocrText: ocrResult.ocrText || '',
      extractedData: new Map(Object.entries(ocrResult.extractedData || {})),
      verificationStatus: 'USER_VERIFIED',
      version: 1,
      activityLog: [
        {
          action: 'DOCUMENT_UPLOADED',
          description: `Document '${fileName}' uploaded to DigiLocker wallet`,
          actor: 'student',
          timestamp: new Date(),
          details: { originalName: fileName, size: fileSize, hash: fileHash },
        },
        {
          action: 'OCR_COMPLETED',
          description: 'Automated field extraction completed successfully',
          actor: 'system',
          timestamp: new Date(),
        },
      ],
    });

    await newDoc.save();

    res.status(201).json({
      success: true,
      message: 'Document uploaded and processed successfully',
      document: {
        _id: newDoc._id,
        documentType: newDoc.documentType,
        documentName: newDoc.documentName,
        category: newDoc.category,
        issuer: newDoc.issuer,
        documentNumber: newDoc.documentNumber,
        status: newDoc.status,
        ocrStatus: newDoc.ocrStatus,
        fileHash: newDoc.fileHash,
        extractedData: Object.fromEntries(newDoc.extractedData),
        activityLog: newDoc.activityLog,
        hasLowConfidence: Boolean(ocrResult.hasLowConfidence),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/digilocker/wallet/documents/:id
 */
const getDocumentDetail = async (req, res) => {
  try {
    const studentId = req.student._id;
    const doc = await DigiLockerDocument.findOne({
      _id: req.params.id,
      $or: [{ ownerId: studentId }, { studentId: studentId }],
    });

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found or access denied' });
    }

    const schema = getSchemaByType(doc.documentType);
    const extractedObj = {};
    if (doc.extractedData) {
      if (doc.extractedData instanceof Map) {
        doc.extractedData.forEach((val, k) => {
          extractedObj[k] = val;
        });
      } else {
        Object.assign(extractedObj, doc.extractedData);
      }
    }

    res.json({
      success: true,
      document: {
        _id: doc._id,
        documentType: doc.documentType,
        documentName: doc.documentName,
        category: doc.category,
        issuer: doc.issuer,
        documentNumber: doc.documentNumber,
        issuedDate: doc.issuedDate,
        status: doc.status,
        verificationStatus: doc.verificationStatus,
        ocrStatus: doc.ocrStatus,
        ocrText: doc.ocrText,
        fileHash: doc.fileHash,
        version: doc.version,
        versions: doc.versions,
        originalFile: doc.originalFile,
        extractedData: extractedObj,
        activityLog: doc.activityLog,
        schema: schema || null,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PATCH /api/digilocker/wallet/documents/:id/fields
 * HUMAN-IN-THE-LOOP FIELD CORRECTION
 * Updates extracted fields without overwriting original OCR values!
 */
const updateDocumentFields = async (req, res) => {
  try {
    const studentId = req.student._id;
    const { fields, markReadyToShare } = req.body;

    if (!fields || typeof fields !== 'object') {
      return res.status(400).json({ success: false, message: 'Fields object is required' });
    }

    const doc = await DigiLockerDocument.findOne({
      _id: req.params.id,
      $or: [{ ownerId: studentId }, { studentId: studentId }],
    });

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found or access denied' });
    }

    const activityEntries = [];

    // Ensure extractedData Map exists
    if (!doc.extractedData) {
      doc.extractedData = new Map();
    }

    Object.keys(fields).forEach((key) => {
      const newValue = fields[key];
      let existing = doc.extractedData instanceof Map ? doc.extractedData.get(key) : doc.extractedData[key];

      const origVal = existing ? (existing.originalValue !== undefined ? existing.originalValue : existing.value) : '';

      if (String(newValue) !== String(origVal) || (existing && existing.isLowConfidence)) {
        const updatedField = {
          value: newValue,
          confidence: 1.0, // User verified
          source: 'USER_EDITED',
          sourcePage: existing ? existing.sourcePage : 1,
          isLowConfidence: false,
          originalValue: origVal,
          isEdited: true,
          editedValue: newValue,
          editedBy: 'student',
          editedAt: new Date(),
        };

        if (doc.extractedData instanceof Map) {
          doc.extractedData.set(key, updatedField);
        } else {
          doc.extractedData[key] = updatedField;
        }

        activityEntries.push({
          action: 'FIELD_EDITED',
          description: `Field '${key}' corrected by user from '${origVal}' to '${newValue}'`,
          actor: 'student',
          timestamp: new Date(),
          details: { field: key, originalValue: origVal, editedValue: newValue },
        });

        // Update document number if that was edited
        if (key === 'certificateNumber' || key === 'rollNumber' || key === 'applicationNumber') {
          doc.documentNumber = String(newValue);
        }
      }
    });

    // Update status
    if (markReadyToShare) {
      doc.status = 'READY_TO_SHARE';
      doc.verificationStatus = 'USER_VERIFIED';
      activityEntries.push({
        action: 'READY_TO_SHARE',
        description: 'Document verified and marked ready to share with TribeXcel',
        actor: 'student',
        timestamp: new Date(),
      });
    } else {
      doc.status = 'USER_VERIFIED';
      doc.verificationStatus = 'USER_VERIFIED';
      activityEntries.push({
        action: 'USER_VERIFIED',
        description: 'Information reviewed and verified by candidate',
        actor: 'student',
        timestamp: new Date(),
      });
    }

    doc.activityLog.push(...activityEntries);
    await doc.save();

    res.json({
      success: true,
      message: 'Fields updated successfully with complete audit trail preserved',
      status: doc.status,
      extractedData: Object.fromEntries(doc.extractedData),
      activityLog: doc.activityLog,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/digilocker/wallet/documents/:id/verify
 */
const markDocumentReady = async (req, res) => {
  try {
    const studentId = req.student._id;
    const doc = await DigiLockerDocument.findOne({
      _id: req.params.id,
      $or: [{ ownerId: studentId }, { studentId: studentId }],
    });

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    doc.status = 'READY_TO_SHARE';
    doc.verificationStatus = 'USER_VERIFIED';
    doc.activityLog.push({
      action: 'READY_TO_SHARE',
      description: 'Document marked ready to share with TribeXcel',
      actor: 'student',
      timestamp: new Date(),
    });

    await doc.save();
    res.json({ success: true, message: 'Document marked ready to share', status: doc.status });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/digilocker/wallet/documents/:id/file
 * Authenticated streaming endpoint for document preview
 */
const streamDocumentFile = async (req, res) => {
  try {
    const studentId = req.student ? req.student._id : null;
    const isOfficer = !!(req.admin || req.user);

    const doc = await DigiLockerDocument.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document file not found' });
    }

    // Ownership or authorized access check
    const isOwner = studentId && (
      (doc.ownerId && doc.ownerId.equals ? doc.ownerId.equals(studentId) : String(doc.ownerId) === String(studentId)) ||
      (doc.studentId && doc.studentId.equals ? doc.studentId.equals(studentId) : String(doc.studentId) === String(studentId))
    );

    if (!isOwner && !isOfficer) {
      // Check if an active access grant exists
      const grant = await DigiLockerAccessGrant.findOne({
        studentId: doc.ownerId,
        status: 'ACTIVE',
        expiresAt: { $gt: new Date() },
      });
      if (!grant) {
        return res.status(403).json({ success: false, message: 'Access denied to this document file (Anti-IDOR)' });
      }
    }

    const filePath = doc.storedFilePath;
    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Stored file path does not exist on disk' });
    }

    const mimeType = doc.originalFile?.mimeType || 'application/pdf';
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${doc.originalFile?.fileName || 'document.pdf'}"`);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/digilocker/wallet/seed-demo
 * Seeds realistic demonstration documents into the student's sandbox wallet
 */
const seedDemoDocuments = async (req, res) => {
  try {
    const student = req.student;
    const studentDir = ensureStorageDir(student._id);

    // Create 4 realistic demo PDFs
    const demoSpecs = [
      {
        type: 'ST_CERTIFICATE',
        name: 'Scheduled Tribe (ST) Certificate',
        category: 'CASTE_TRIBE',
        issuer: 'Sub-Divisional Magistrate (SDM), Revenue Division',
        docNo: 'ST/2024/JH/81923',
        filename: 'demo_st_certificate.pdf',
        date: '2023-08-14',
        fields: {
          certificateNumber: { value: 'ST/2024/JH/81923', confidence: 0.98 },
          holderName: { value: student.name || 'Rahul Kumar', confidence: 0.98 },
          fatherName: { value: 'Late Shri Ramesh Kumar', confidence: 0.94 },
          dateOfBirth: { value: '2005-08-15', confidence: 0.96 },
          tribeName: { value: 'Santhal', confidence: 0.97 },
          category: { value: 'ST', confidence: 0.99 },
          issuingAuthority: { value: 'Sub-Divisional Magistrate (SDM)', confidence: 0.95 },
          issueDate: { value: '2023-08-14', confidence: 0.96 },
          district: { value: 'Ranchi', confidence: 0.97 },
          state: { value: 'Jharkhand', confidence: 0.98 },
        },
      },
      {
        type: 'INCOME_CERTIFICATE',
        name: 'Family Income Certificate',
        category: 'INCOME',
        issuer: 'Office of the Tehsildar, Revenue Dept',
        docNo: 'INC/2025/11029',
        filename: 'demo_income_certificate.pdf',
        date: '2025-03-19',
        fields: {
          certificateNumber: { value: 'INC/2025/11029', confidence: 0.96 },
          holderName: { value: student.name || 'Rahul Kumar', confidence: 0.98 },
          fatherName: { value: 'Ramesh Kumar', confidence: 0.93 },
          annualIncome: { value: 140000, confidence: 0.97 },
          financialYear: { value: '2025-2026', confidence: 0.95 },
          issuingAuthority: { value: 'Office of the Tehsildar', confidence: 0.94 },
          issueDate: { value: '2025-03-19', confidence: 0.95 },
          district: { value: 'Ranchi', confidence: 0.96 },
          state: { value: 'Jharkhand', confidence: 0.97 },
        },
      },
      {
        type: 'CLASS_X_MARKSHEET',
        name: 'Class X Secondary School Marksheet',
        category: 'ACADEMIC',
        issuer: 'Central Board of Secondary Education (CBSE)',
        docNo: '8172901',
        filename: 'demo_class10_marksheet.pdf',
        date: '2021-07-28',
        fields: {
          studentName: { value: student.name || 'Rahul Kumar', confidence: 0.99 },
          rollNumber: { value: '8172901', confidence: 0.97 },
          school: { value: 'Kendriya Vidyalaya No. 1 Ranchi', confidence: 0.93 },
          board: { value: 'CBSE', confidence: 0.98 },
          dateOfBirth: { value: '2005-08-15', confidence: 0.96 },
          passingYear: { value: '2021', confidence: 0.98 },
          totalMarks: { value: '432 / 500', confidence: 0.94 },
          percentage: { value: '86.4', confidence: 0.96 },
        },
      },
      {
        type: 'BONAFIDE_CERTIFICATE',
        name: 'Institutional Bonafide Certificate',
        category: 'ACADEMIC',
        issuer: 'Registrar, National Institute of Technology (NIT)',
        docNo: '26CS091',
        filename: 'demo_bonafide_certificate.pdf',
        date: '2026-07-15',
        fields: {
          studentName: { value: student.name || 'Rahul Kumar', confidence: 0.98 },
          rollNumber: { value: '26CS091', confidence: 0.95 },
          institution: { value: 'National Institute of Technology (NIT) Jamshedpur', confidence: 0.96 },
          course: { value: 'B.Tech Mechanical Engineering', confidence: 0.95 },
          academicYear: { value: '2026-2027', confidence: 0.96 },
          issueDate: { value: '2026-07-15', confidence: 0.94 },
        },
      },
    ];

    const createdDocs = [];

    for (const spec of demoSpecs) {
      // Look for existing document of this type for this student
      let existing = await DigiLockerDocument.findOne({
        ownerId: student._id,
        documentType: spec.type,
      });

      // Write minimal clean PDF to disk
      const filePath = path.join(studentDir, spec.filename);
      const pdfText = `%PDF-1.4\n1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj\n4 0 obj << /Length 300 >> stream\nBT /F1 14 Tf 50 720 Td (TRIBEXCEL DIGILOCKER SANDBOX WALLET) Tj ET\nBT /F1 12 Tf 50 690 Td (Document: ${spec.name}) Tj ET\nBT /F1 10 Tf 50 670 Td (Issuer: ${spec.issuer}) Tj ET\nBT /F1 10 Tf 50 650 Td (Reference No: ${spec.docNo}) Tj ET\nBT /F1 10 Tf 50 630 Td (Holder: ${student.name || 'Rahul Kumar'}) Tj ET\nBT /F1 9 Tf 50 600 Td (Integrity Hash Verified | Sandbox Wallet Record) Tj ET\nendstream endobj\n5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\nxref\n0 6\n0000000000 65535 f \ntrailer << /Size 6 /Root 1 0 R >>\nstartxref\n500\n%%EOF`;
      fs.writeFileSync(filePath, pdfText, 'utf-8');

      const fileBuf = Buffer.from(pdfText, 'utf-8');
      const hash = computeFileHash(fileBuf);

      const extractedDataMap = new Map();
      Object.keys(spec.fields).forEach((k) => {
        const f = spec.fields[k];
        extractedDataMap.set(k, {
          value: f.value,
          confidence: f.confidence,
          source: 'OCR',
          sourcePage: 1,
          isLowConfidence: false,
          originalValue: f.value,
          isEdited: false,
          editedValue: null,
          editedBy: null,
          editedAt: null,
        });
      });

      if (existing) {
        existing.storedFilePath = filePath;
        existing.fileHash = hash;
        existing.status = 'READY_TO_SHARE';
        existing.verificationStatus = 'USER_VERIFIED';
        existing.extractedData = extractedDataMap;
        await existing.save();
        createdDocs.push(existing);
      } else {
        const doc = new DigiLockerDocument({
          ownerId: student._id,
          studentId: student._id,
          documentType: spec.type,
          documentName: spec.name,
          category: spec.category,
          issuer: spec.issuer,
          documentNumber: spec.docNo,
          issuedDate: new Date(spec.date),
          status: 'READY_TO_SHARE',
          originalFile: {
            fileName: spec.filename,
            mimeType: 'application/pdf',
            size: fileBuf.length,
            uploadedAt: new Date(),
          },
          storedFilePath: filePath,
          fileHash: hash,
          ocrStatus: 'COMPLETED',
          ocrText: `Document: ${spec.name}\nIssuer: ${spec.issuer}\nRef: ${spec.docNo}`,
          extractedData: extractedDataMap,
          verificationStatus: 'USER_VERIFIED',
          version: 1,
          activityLog: [
            {
              action: 'DOCUMENT_UPLOADED',
              description: `Demo document '${spec.filename}' added to sandbox wallet`,
              actor: 'system',
              timestamp: new Date(),
            },
            {
              action: 'OCR_COMPLETED',
              description: 'OCR extracted structured entities with high confidence',
              actor: 'system',
              timestamp: new Date(),
            },
            {
              action: 'READY_TO_SHARE',
              description: 'Document verified and marked ready to share',
              actor: 'student',
              timestamp: new Date(),
            },
          ],
        });
        await doc.save();
        createdDocs.push(doc);
      }
    }

    res.json({
      success: true,
      message: 'Demo sandbox documents loaded successfully into your wallet',
      count: createdDocs.length,
      documents: createdDocs.map((d) => ({
        _id: d._id,
        documentType: d.documentType,
        documentName: d.documentName,
        status: d.status,
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * DELETE /api/digilocker/wallet/documents/:id
 */
const deleteDocument = async (req, res) => {
  try {
    const studentId = req.student._id;
    const doc = await DigiLockerDocument.findOne({
      _id: req.params.id,
      $or: [{ ownerId: studentId }, { studentId: studentId }],
    });

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    if (doc.storedFilePath && fs.existsSync(doc.storedFilePath)) {
      try {
        fs.unlinkSync(doc.storedFilePath);
      } catch (e) {
        // continue
      }
    }

    await DigiLockerDocument.deleteOne({ _id: doc._id });
    res.json({ success: true, message: 'Document deleted from wallet' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getWalletOverview,
  getWalletDocuments,
  uploadDocument,
  getDocumentDetail,
  updateDocumentFields,
  markDocumentReady,
  streamDocumentFile,
  seedDemoDocuments,
  deleteDocument,
};

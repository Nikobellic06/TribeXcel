const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Document = require('../models/Document');
const { logAuditEvent } = require('../services/auditService');

const UPLOAD_ROOT = path.join(__dirname, '..', 'uploads');
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB limit

const ALLOWED_TYPES = {
  'application/pdf': {
    ext: 'pdf',
    check: (b) => b.length >= 4 && b.slice(0, 4).toString('latin1') === '%PDF',
  },
  'image/jpeg': {
    ext: 'jpg',
    check: (b) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  'image/png': {
    ext: 'png',
    check: (b) =>
      b.length >= 8 &&
      b.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  },
};

const uploadFile = async (req, res) => {
  try {
    const { fileName, mimeType, data, docType, applicationId } = req.body || {};
    const type = ALLOWED_TYPES[mimeType];
    if (!type) {
      return res.status(400).json({ message: 'Only PDF, JPG, and PNG documents are allowed' });
    }
    if (typeof data !== 'string' || !data) {
      return res.status(400).json({ message: 'File payload is required' });
    }

    const buffer = Buffer.from(data.replace(/^data:[^,]+,/, ''), 'base64');
    if (buffer.length === 0 || buffer.length > MAX_BYTES) {
      return res.status(400).json({ message: 'Document size must be greater than 0 and less than 2 MB' });
    }
    if (!type.check(buffer)) {
      return res.status(400).json({ message: 'Document header signature does not match its claimed MIME type' });
    }

    const studentId = req.student._id;
    const studentFolder = path.join(UPLOAD_ROOT, String(studentId));
    await fs.promises.mkdir(studentFolder, { recursive: true });

    const safeDocType = String(docType || 'doc').replace(/[^a-z0-9_]/gi, '').slice(0, 40) || 'doc';
    const randomSuffix = crypto.randomBytes(12).toString('hex');
    const storedFileName = `manual-${safeDocType}-${randomSuffix}.${type.ext}`;
    const storagePath = path.join(studentFolder, storedFileName);

    await fs.promises.writeFile(storagePath, buffer);

    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    const fileUrl = `/uploads/${studentId}/${storedFileName}`;

    // Find or create authoritative Document record
    let docRecord = await Document.findOne({
      studentId,
      documentType: safeDocType,
      ...(applicationId ? { applicationId } : {}),
    });

    const documentId = docRecord ? docRecord.documentId : `DOC-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const now = new Date();

    const docData = {
      documentId,
      applicationId: applicationId || null,
      studentId,
      documentType: safeDocType,
      source: 'manual',
      storagePath,
      fileUrl,
      fileName: String(fileName || storedFileName).replace(/[\\/]/g, '_').slice(0, 120),
      mimeType,
      fileSize: buffer.length,
      fileHash: hash,
      // For manual uploads, verificationStatus can NEVER be set to VERIFIED by client!
      verificationStatus: 'PENDING',
      verificationMethod: 'AI_ASSISTED_OFFICER_VERIFIED',
      integrityStatus: 'VALID',
      ocrStatus: 'PENDING',
      auditTrail: [
        {
          action: 'MANUAL_DOCUMENT_UPLOAD',
          performedBy: `Applicant [${req.student.email}]`,
          timestamp: now,
          details: `Uploaded file ${storedFileName}, size: ${buffer.length} bytes, SHA-256: ${hash}`,
        },
      ],
    };

    if (docRecord) {
      docRecord.set(docData);
      await docRecord.save();
    } else {
      docRecord = new Document(docData);
      await docRecord.save();
    }

    await logAuditEvent({
      userId: studentId,
      userName: req.student.name,
      userRole: 'Applicant',
      action: 'DOCUMENT_UPLOADED',
      entityType: 'Document',
      entityId: docRecord._id,
      newValue: {
        documentType: safeDocType,
        source: 'manual',
        verificationStatus: 'PENDING',
        fileHash: hash,
      },
      ipAddress: req.ip || '',
      reason: 'Applicant uploaded manual document for scrutiny',
    });

    res.status(201).json({
      success: true,
      document: {
        documentId: docRecord.documentId,
        _id: docRecord._id,
        documentType: docRecord.documentType,
        source: 'manual',
        fileName: docRecord.fileName,
        fileUrl: docRecord.fileUrl,
        mimeType: docRecord.mimeType,
        size: docRecord.fileSize,
        verificationStatus: 'PENDING',
        verificationMethod: 'AI_ASSISTED_OFFICER_VERIFIED',
      },
      fileUrl,
      fileName: docRecord.fileName,
      mimeType,
      size: buffer.length,
    });
  } catch (err) {
    res.status(500).json({ message: 'Upload processing failed, please try again' });
  }
};

module.exports = { uploadFile, UPLOAD_ROOT };

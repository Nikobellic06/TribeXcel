const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const Document = require('../models/Document');
const { logAuditEvent } = require('../services/auditService');

const UPLOAD_ROOT = path.join(__dirname, '..', 'uploads');
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB limit

const ALLOWED_TYPES = {
  'application/pdf': {
    ext: 'pdf',
    check: (b) => b.length >= 4 && b.slice(0, 1024).toString('latin1').includes('%PDF'),
  },
  'image/jpeg': {
    ext: 'jpg',
    check: (b) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8,
  },
  'image/jpg': {
    ext: 'jpg',
    check: (b) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8,
  },
  'image/pjpeg': {
    ext: 'jpg',
    check: (b) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8,
  },
  'image/png': {
    ext: 'png',
    check: (b) =>
      b.length >= 8 &&
      b.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  },
  'image/webp': {
    ext: 'webp',
    check: (b) => b.length >= 12 && b.slice(8, 12).toString('latin1') === 'WEBP',
  },
};

const uploadFile = async (req, res) => {
  try {
    const { fileName, mimeType: rawMime, data, docType, applicationId } = req.body || {};
    const mimeType = (rawMime || 'application/pdf').toLowerCase();
    const type = ALLOWED_TYPES[mimeType];
    if (!type) {
      return res.status(400).json({ message: 'Only PDF, JPG, and PNG documents are allowed' });
    }
    if (typeof data !== 'string' || !data) {
      return res.status(400).json({ message: 'File payload is required' });
    }

    const buffer = Buffer.from(data.replace(/^data:[^,]+,/, ''), 'base64');
    if (buffer.length === 0 || buffer.length > MAX_BYTES) {
      return res.status(400).json({ message: 'Document size must be greater than 0 and less than 10 MB' });
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

    const validAppId = (applicationId && mongoose.Types.ObjectId.isValid(applicationId)) ? applicationId : null;

    // Find or create authoritative Document record
    let docRecord = await Document.findOne({
      studentId,
      documentType: safeDocType,
      ...(validAppId ? { applicationId: validAppId } : {}),
    });

    const documentId = docRecord ? docRecord.documentId : `DOC-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const now = new Date();

    const docData = {
      documentId,
      applicationId: validAppId,
      studentId,
      documentType: safeDocType,
      source: 'manual',
      storagePath,
      fileUrl,
      fileName: String(fileName || storedFileName).replace(/[\\/]/g, '_').slice(0, 120),
      mimeType,
      fileSize: buffer.length,
      fileHash: hash,
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
    console.error('[StudentUpload] Upload processing failed:', err);
    res.status(500).json({ message: err.message || 'Upload processing failed, please try again' });
  }
};

module.exports = { uploadFile, UPLOAD_ROOT };

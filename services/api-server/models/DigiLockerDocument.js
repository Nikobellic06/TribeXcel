const mongoose = require('mongoose');

const FIELD_SCHEMA = new mongoose.Schema(
  {
    value: { type: mongoose.Schema.Types.Mixed, default: '' },
    confidence: { type: Number, default: 0.95 },
    source: { type: String, default: 'OCR' },
    sourcePage: { type: Number, default: 1 },
    isLowConfidence: { type: Boolean, default: false },
    originalValue: { type: mongoose.Schema.Types.Mixed, default: '' },
    isEdited: { type: Boolean, default: false },
    editedValue: { type: mongoose.Schema.Types.Mixed, default: null },
    editedBy: { type: String, default: null },
    editedAt: { type: Date, default: null },
  },
  { _id: false }
);

const ACTIVITY_LOG_SCHEMA = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        'DOCUMENT_UPLOADED',
        'OCR_PROCESSING',
        'OCR_COMPLETED',
        'OCR_FAILED',
        'FIELD_EDITED',
        'USER_VERIFIED',
        'READY_TO_SHARE',
        'SHARED_WITH_TRIBEXCEL',
        'ACCESS_REVOKED',
        'VERSION_REPLACED',
      ],
    },
    description: { type: String, required: true },
    actor: { type: String, default: 'student' },
    timestamp: { type: Date, default: Date.now },
    details: { type: mongoose.Schema.Types.Mixed, default: () => ({}) },
  },
  { _id: false }
);

const VERSION_SCHEMA = new mongoose.Schema(
  {
    version: { type: Number, required: true },
    storedFilePath: { type: String, required: true },
    fileHash: { type: String, required: true },
    originalFile: {
      fileName: String,
      mimeType: String,
      size: Number,
    },
    uploadedAt: { type: Date, default: Date.now },
    reason: { type: String, default: 'Document updated by user' },
  },
  { _id: false }
);

const digiLockerDocumentSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      default: function () { return this.studentId; },
      index: true,
    },
    // Alias / backward-compatible field for studentId
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      index: true,
    },
    sessionId: {
      type: String,
      default: '',
      index: true,
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      default: null,
    },
    documentType: {
      type: String,
      required: true,
      index: true,
    },
    documentName: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: 'OTHER',
      enum: ['ACADEMIC', 'CASTE_TRIBE', 'INCOME', 'IDENTITY', 'ADDRESS', 'OTHER'],
    },
    issuer: {
      type: String,
      default: 'Sandbox State Authority',
    },
    documentNumber: {
      type: String,
      default: '',
    },
    issuedDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      default: 'UPLOADED',
      enum: [
        'UPLOADED',
        'OCR_PROCESSING',
        'OCR_COMPLETED',
        'REVIEW_REQUIRED',
        'USER_VERIFIED',
        'READY_TO_SHARE',
        'SHARED',
        'REVOKED',
        'RETRIEVED', // Back-compat
      ],
      index: true,
    },
    originalFile: {
      fileName: { type: String, default: '' },
      mimeType: { type: String, default: 'application/pdf' },
      size: { type: Number, default: 0 },
      uploadedAt: { type: Date, default: Date.now },
    },
    storedFilePath: {
      type: String,
      default: '',
    },
    fileHash: {
      type: String,
      default: '',
    },
    ocrStatus: {
      type: String,
      default: 'PENDING',
      enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'MANUAL_REVIEW'],
    },
    ocrText: {
      type: String,
      default: '',
    },
    extractedData: {
      type: Map,
      of: FIELD_SCHEMA,
      default: () => new Map(),
    },
    verificationStatus: {
      type: String,
      default: 'UNVERIFIED',
      enum: ['UNVERIFIED', 'USER_VERIFIED', 'SANDBOX_SOURCE_CONFIRMED', 'PENDING'],
    },
    version: {
      type: Number,
      default: 1,
    },
    versions: [VERSION_SCHEMA],
    activityLog: [ACTIVITY_LOG_SCHEMA],
    environment: {
      type: String,
      default: 'SANDBOX',
      enum: ['SANDBOX', 'DEMO_SANDBOX', 'PRODUCTION'],
    },
    // Back-compat fields for existing retrieval
    documentReference: { type: String, default: '' },
    documentCategory: { type: String, default: '' },
    fileUrl: { type: String, default: '' },
    storagePath: { type: String, default: '' },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({
        sandboxMarker: 'SANDBOX DOCUMENT',
        environment: 'SANDBOX',
        integrityCheck: 'Passed',
        sandboxNote: 'TribeXcel DigiLocker Sandbox Document. Not an official government record.',
      }),
    },
  },
  {
    timestamps: true,
  }
);

digiLockerDocumentSchema.pre('validate', function (next) {
  if (!this.studentId && this.ownerId) {
    this.studentId = this.ownerId;
  }
  if (!this.ownerId && this.studentId) {
    this.ownerId = this.studentId;
  }
  next();
});

digiLockerDocumentSchema.pre('save', function (next) {
  if (!this.studentId && this.ownerId) {
    this.studentId = this.ownerId;
  }
  if (!this.ownerId && this.studentId) {
    this.ownerId = this.studentId;
  }
  next();
});

digiLockerDocumentSchema.index({ ownerId: 1, documentType: 1 });
digiLockerDocumentSchema.index({ studentId: 1, documentType: 1 });

module.exports = mongoose.model('DigiLockerDocument', digiLockerDocumentSchema);

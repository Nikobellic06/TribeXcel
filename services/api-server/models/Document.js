const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    documentId: { type: String, required: true, unique: true },
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },

    documentType: {
      type: String,
      required: true,
      enum: [
        'photo',
        'signature',
        'class10_certificate',
        'class12_certificate',
        'st_certificate',
        'caste_certificate',
        'pvtg_certificate',
        'disability_certificate',
        'pg_marksheet',
        'ug_marksheet',
        'previous_marksheet',
        'last_passing_marksheet',
        'cgpa_conversion',
        'admission_letter',
        'bonafide_certificate',
        'school_bonafide',
        'qualifying_degree',
        'foreign_admission_letter',
        'family_income_proof',
        'income_certificate',
        'domicile_certificate',
        'bank_passbook',
        'orphan_certificate',
        'employer_noc',
        'gap_certificate',
        'fee_receipt',
        'joining_letter',
        'visa_and_studentid',
        'aadhaar_card',
        'other',
      ],
    },

    source: {
      type: String,
      enum: ['digilocker', 'manual'],
      required: true,
    },

    // File storage details (server-controlled, never arbitrary client paths)
    storagePath: { type: String, default: '' },
    fileUrl: { type: String, default: '' },
    fileName: { type: String, required: true },
    mimeType: { type: String, required: true },
    fileSize: { type: Number, default: 0 },
    fileHash: { type: String, default: '' }, // SHA-256 integrity hash

    // Authoritative DigiLocker / API Setu metadata
    digilocker: {
      retrievalTransactionId: { type: String, default: '' },
      documentUri: { type: String, default: '' }, // e.g. in.gov.edistrict.jharkhand-CASTC-123456
      docType: { type: String, default: '' },
      issuerId: { type: String, default: '' },
      issuerName: { type: String, default: '' },
      certificateNo: { type: String, default: '' },
      issueDate: { type: Date },
      rawXml: { type: String, default: '' },
      retrievedAt: { type: Date },
    },

    // Lifecycle verification state
    verificationStatus: {
      type: String,
      enum: [
        'NOT_SUBMITTED',
        'PENDING',
        'RETRIEVED',
        'OCR_PROCESSING',
        'AI_REVIEW',
        'VERIFIED',
        'DEFICIENT',
        'REJECTED',
        'EXPIRED',
        'SANDBOX_SOURCE_CONFIRMED',
      ],
      default: 'PENDING',
    },

    verificationMethod: {
      type: String,
      enum: ['DIGILOCKER_TRUSTED_API', 'OFFICER_MANUAL', 'AI_ASSISTED_OFFICER_VERIFIED', 'PENDING', 'SANDBOX_SIMULATION'],
      default: 'PENDING',
    },

    integrityStatus: {
      type: String,
      enum: ['VALID', 'INVALID_SIGNATURE', 'CHECKSUM_FAILED', 'UNVERIFIED'],
      default: 'UNVERIFIED',
    },

    ocrStatus: {
      type: String,
      enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'FAILED'],
      default: 'NOT_STARTED',
    },

    // Extracted document content from OCR/DigiLocker parser
    extractedData: {
      applicantName: { type: String, default: '' },
      fatherName: { type: String, default: '' },
      dob: { type: Date },
      gender: { type: String, default: '' },
      casteOrTribe: { type: String, default: '' },
      subTribe: { type: String, default: '' },
      state: { type: String, default: '' },
      district: { type: String, default: '' },
      annualIncome: { type: Number },
      disabilityPercentage: { type: Number },
      marksPercentage: { type: Number },
      institutionName: { type: String, default: '' },
      rawText: { type: String, default: '' },
      confidenceScore: { type: Number, min: 0, max: 100, default: 0 },
    },

    crossCheckStatus: {
      type: String,
      enum: ['NOT_CHECKED', 'PASSED', 'MISMATCH_DETECTED', 'FLAGGED'],
      default: 'NOT_CHECKED',
    },

    crossCheckDetails: [
      {
        field: { type: String },
        documentValue: { type: String },
        applicationValue: { type: String },
        match: { type: Boolean },
        confidence: { type: Number },
        notes: { type: String },
      },
    ],

    verifiedAt: { type: Date },
    verifiedBy: {
      id: { type: mongoose.Schema.Types.ObjectId },
      name: { type: String },
      role: { type: String },
    },

    rejectionReason: { type: String, default: '' },

    // Audit logs for document lifecycle
    auditTrail: [
      {
        action: { type: String, required: true },
        performedBy: { type: String, default: 'SYSTEM' },
        timestamp: { type: Date, default: Date.now },
        details: { type: String, default: '' },
      },
    ],
  },
  { timestamps: true }
);

documentSchema.index({ studentId: 1, documentType: 1 });
documentSchema.index({ applicationId: 1, documentType: 1 });
documentSchema.index({ 'digilocker.documentUri': 1 });

module.exports = mongoose.model('Document', documentSchema);

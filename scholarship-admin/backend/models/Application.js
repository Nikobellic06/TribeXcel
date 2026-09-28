const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    // Machine-readable id from the student portal, e.g. 'st_certificate'
    docType: { type: String, default: '' },
    source: { type: String, enum: ['manual', 'digilocker'], default: 'manual' },
    verified: { type: Boolean, default: false },
    fileUrl: { type: String, default: '' },
    fileName: { type: String, default: '' },
    mimeType: { type: String, default: '' },
    size: { type: Number, default: 0 },
    // DigiLocker metadata (documents pulled from DigiLocker)
    digilockerUri: { type: String, default: '' },
    issuer: { type: String, default: '' },
    certificateNo: { type: String, default: '' },
  },
  { _id: false }
);

const aiCheckSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    passed: { type: Boolean, required: true },
    details: { type: String, default: '' },
  },
  { _id: false }
);

/* One reason an application needs an officer's attention (see services/review.js). */
const reviewFlagSchema = new mongoose.Schema(
  {
    code: { type: String, required: true },
    severity: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
    source: { type: String, enum: ['rules', 'ai', 'data'], default: 'rules' },
    title: { type: String, required: true },
    detail: { type: String, default: '' },
  },
  { _id: false }
);

/* Audit trail of every status change and officer decision. */
const reviewEventSchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    fromStatus: { type: String, default: '' },
    toStatus: { type: String, default: '' },
    byId: { type: mongoose.Schema.Types.ObjectId },
    byName: { type: String, default: '' },
    byRole: { type: String, default: '' },
    category: { type: String, default: '' },
    reason: { type: String, default: '' },
    requiredCorrection: { type: String, default: '' },
    remarks: { type: String, default: '' },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
    applicationCode: { type: String, required: true, unique: true },

    // Links this application to the student account that submitted it.
    // Optional at the schema level because earlier demo/seed data has no
    // real student account behind it — new submissions always set this.
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },

    // Applicant info
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    dob: { type: Date },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    category: { type: String, default: 'Scheduled Tribe' },
    state: { type: String, required: true },
    district: { type: String },

    // Scheme info
    scheme: { type: String, enum: ['NFST', 'NOS', 'PRE_MATRIC'], required: true },
    session: { type: String, default: '2026-27' },
    course: { type: String },
    institution: { type: String },

    // Workflow status
    status: {
      type: String,
      enum: ['Pending', 'Eligible', 'Deficient', 'Flagged', 'Selected', 'Rejected'],
      default: 'Pending',
    },

    documents: [documentSchema],

    // Full form submitted from the student portal (personal, category,
    // academic, bank and declarations sections). Kept flexible because each
    // scheme asks different questions.
    schemeData: { type: mongoose.Schema.Types.Mixed },
    declaredIncome: { type: Number },
    declaredMarks: { type: Number },

    aiVerification: {
      checks: [aiCheckSchema],
      score: { type: Number, min: 0, max: 100 },
    },

    // Merit ranking sub-scores (each 0-100), weighted score is computed
    // at query time in the frontend/backend, not stored
    meritScores: {
      academic: { type: Number, min: 0, max: 100, default: 0 },
      exam: { type: Number, min: 0, max: 100, default: 0 },
      socioEconomic: { type: Number, min: 0, max: 100, default: 0 },
      interview: { type: Number, min: 0, max: 100, default: 0 },
    },

    adminRemarks: { type: String, default: '' },

    // AI-assisted analysis exactly as reported by the ai-engine (normalised),
    // or a record that it was unavailable / not applicable.
    aiAnalysis: { type: mongoose.Schema.Types.Mixed },
    // Summary fields for lists, filters and the review queue.
    reviewFlags: [reviewFlagSchema],
    reviewPriority: { type: String, enum: ['high', 'medium', 'normal'], default: 'normal' },
    rulePreliminary: { type: String, default: '' },
    aiPreliminary: { type: String, default: '' },
    reviewHistory: [reviewEventSchema],
    resubmissionCount: { type: Number, default: 0 },
    lastResubmittedAt: { type: Date },
    lastActionAt: { type: Date },

    // Post-Selection Fellowship Management (Section B of SIH Problem Statement)
    fellowship: {
      grantLetterIssued: { type: Boolean, default: false },
      awardNumber: { type: String, default: '' },
      monthlyStipend: { type: Number, default: 31000 },
      contingencyAnnual: { type: Number, default: 12000 },
      disbursementStatus: {
        type: String,
        enum: ['Pending Setup', 'Active', 'Disbursed', 'Under Renewal'],
        default: 'Pending Setup',
      },
      pfmsReference: { type: String, default: '' },
      lastDisbursementDate: { type: Date },
    },

    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

applicationSchema.index({ status: 1, scheme: 1, state: 1 });
applicationSchema.index({ student: 1, scheme: 1, session: 1 });
applicationSchema.index({ reviewPriority: 1, status: 1, submittedAt: -1 });
applicationSchema.index({ name: 'text', applicationCode: 'text' });

module.exports = mongoose.model('Application', applicationSchema);

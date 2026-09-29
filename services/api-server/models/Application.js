const mongoose = require('mongoose');
const { parseFlexibleDate } = require('../utils/date');

const documentItemSchema = new mongoose.Schema(
  {
    documentId: { type: String, default: '' },
    name: { type: String, required: true },
    docType: { type: String, default: '' },
    source: { type: String, enum: ['manual', 'digilocker'], default: 'manual' },
    verified: { type: Boolean, default: false },
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
        'SANDBOX_SOURCE_CONFIRMED',
      ],
      default: 'PENDING',
    },
    verificationMethod: { type: String, default: 'PENDING' },
    fileUrl: { type: String, default: '' },
    fileName: { type: String, default: '' },
    mimeType: { type: String, default: '' },
    size: { type: Number, default: 0 },
    digilockerUri: { type: String, default: '' },
    issuer: { type: String, default: '' },
    certificateNo: { type: String, default: '' },
    extractedData: { type: mongoose.Schema.Types.Mixed },
    crossCheckStatus: { type: String, default: 'NOT_CHECKED' },
  },
  { _id: false }
);

const deficiencyItemSchema = new mongoose.Schema(
  {
    deficiencyId: { type: String, required: true },
    targetType: {
      type: String,
      enum: ['DOCUMENT', 'FIELD', 'ELIGIBILITY', 'OTHER'],
      required: true,
    },
    targetId: { type: String, required: true }, // e.g. 'st_certificate' or 'academic.masterMarks'
    targetLabel: { type: String, required: true },
    issue: { type: String, required: true },
    actionRequired: { type: String, required: true },
    deadline: { type: Date },
    status: {
      type: String,
      enum: ['OPEN', 'RESOLVED', 'EXPIRED'],
      default: 'OPEN',
    },
    raisedAt: { type: Date, default: Date.now },
    raisedBy: {
      id: { type: mongoose.Schema.Types.ObjectId },
      name: { type: String, default: 'Scrutiny Officer' },
      role: { type: String, default: 'Ministry Scrutiny Officer' },
    },
    resolvedAt: { type: Date },
    resolutionNotes: { type: String, default: '' },
  },
  { _id: false }
);

const reviewEventSchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    fromStatus: { type: String, default: '' },
    toStatus: { type: String, default: '' },
    byId: { type: mongoose.Schema.Types.ObjectId },
    byName: { type: String, default: '' },
    byRole: { type: String, default: '' },
    remarks: { type: String, default: '' },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const applicationVersionSchema = new mongoose.Schema(
  {
    version: { type: Number, required: true },
    snapshot: { type: mongoose.Schema.Types.Mixed, required: true },
    submittedAt: { type: Date, default: Date.now },
    resubmissionReason: { type: String, default: '' },
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
    applicationCode: { type: String, required: true, unique: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },

    scheme: {
      type: String,
      enum: ['NFST', 'NOS', 'PRE_MATRIC', 'POST_MATRIC', 'TOP_CLASS'],
      required: true,
    },
    applicationType: {
      type: String,
      enum: ['FRESH', 'RENEWAL'],
      default: 'FRESH',
    },
    session: { type: String, default: '2026-27' },
    schemeVersion: { type: String, default: '2026.1' },
    ruleVersion: { type: String, default: '2026.1' },
    formVersion: { type: String, default: '2026.1' },
    documentVersion: { type: String, default: '2026.1' },

    // Primary applicant identity (synchronized with trusted identity)
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    dob: { type: Date, set: parseFlexibleDate },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    category: { type: String, default: 'Scheduled Tribe' },
    subTribe: { type: String, default: '' },
    state: { type: String, required: true },
    district: { type: String },
    pincode: { type: String },

    course: { type: String },
    institution: { type: String },

    // Government application workflow statuses
    status: {
      type: String,
      enum: [
        'Draft',
        'Submitted',
        'Under Document Verification',
        'Under Scrutiny',
        'Deficient',
        'Resubmission Required',
        'Under Selection',
        'Selected',
        'Waitlisted',
        'Not Selected',
        'Awarded',
        'Rejected',
        // Legacy statuses mapping
        'Pending',
        'Eligible',
        'Flagged',
      ],
      default: 'Submitted',
    },

    currentStage: {
      type: String,
      enum: [
        'APPLICATION_SUBMITTED',
        'IDENTITY_VERIFIED',
        'DOCUMENTS_RETRIEVED',
        'AI_VALIDATION',
        'DOCUMENT_SCRUTINY',
        'ELIGIBILITY_VERIFICATION',
        'SELECTION_REVIEW',
        'DECISION_MADE',
        'AWARD_PROCESSING',
      ],
      default: 'APPLICATION_SUBMITTED',
    },

    // Immutable versioning
    version: { type: Number, default: 1 },
    versionHistory: [applicationVersionSchema],

    // Specific scheme form fields (structured and validated server-side)
    schemeData: { type: mongoose.Schema.Types.Mixed },
    declaredIncome: { type: Number },
    declaredMarks: { type: Number },

    // Authoritative attached documents
    documents: [documentItemSchema],

    // Deficiencies raised by officers
    deficiencies: [deficiencyItemSchema],

    // Automated Eligibility Snapshot calculated at submission
    eligibilitySnapshot: {
      calculatedAt: { type: Date, default: Date.now },
      ruleVersion: { type: String, default: '2026.1' },
      status: {
        type: String,
        enum: ['ELIGIBLE', 'NOT_ELIGIBLE', 'INCOMPLETE', 'REQUIRES_HUMAN_REVIEW'],
        default: 'REQUIRES_HUMAN_REVIEW',
      },
      preliminaryResult: { type: String, default: 'REQUIRES_HUMAN_REVIEW' },
      checks: [
        {
          code: { type: String },
          title: { type: String },
          passed: { type: Boolean },
          details: { type: String },
        },
      ],
      remarks: { type: String, default: '' },
    },

    // AI-Assisted Verification result (assistive only)
    aiVerification: {
      status: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'AI_VERIFICATION_UNAVAILABLE', 'FLAGGED'],
        default: 'PENDING',
      },
      score: { type: Number, min: 0, max: 100, default: 0 },
      anomalies: [{ type: String }],
      checks: [
        {
          label: { type: String },
          passed: { type: Boolean },
          details: { type: String },
        },
      ],
      analyzedAt: { type: Date },
    },

    // Merit & Selection
    meritRanking: {
      academicScore: { type: Number, default: 0 },
      overallMeritScore: { type: Number, default: 0 },
      quotaCategory: { type: String, default: 'General ST' },
      committeeRecommendation: { type: String, default: 'PENDING' },
      committeeNotes: { type: String, default: '' },
      selectedAt: { type: Date },
    },

    // Audit and officer history
    reviewHistory: [reviewEventSchema],
    resubmissionCount: { type: Number, default: 0 },
    lastResubmittedAt: { type: Date },
    lastActionAt: { type: Date },
    adminRemarks: { type: String, default: '' },

    // Post-Selection Fellowship Management (Section B)
    fellowship: {
      grantLetterIssued: { type: Boolean, default: false },
      awardNumber: { type: String, default: '' },
      monthlyStipend: { type: Number, default: 37000 },
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
applicationSchema.index({ name: 'text', applicationCode: 'text' });

module.exports = mongoose.model('Application', applicationSchema);

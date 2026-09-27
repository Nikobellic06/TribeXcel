const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    source: { type: String, enum: ['manual', 'digilocker'], default: 'manual' },
    verified: { type: Boolean, default: false },
    fileUrl: { type: String, default: '' },
  },
  { _id: false }
);

const aiCheckSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    passed: { type: Boolean, required: true },
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
    scheme: { type: String, enum: ['NFST', 'NOS'], required: true },
    course: { type: String },
    institution: { type: String },

    // Workflow status
    status: {
      type: String,
      enum: ['Pending', 'Eligible', 'Deficient', 'Flagged', 'Selected', 'Rejected'],
      default: 'Pending',
    },

    documents: [documentSchema],

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

    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

applicationSchema.index({ status: 1, scheme: 1, state: 1 });
applicationSchema.index({ name: 'text', applicationCode: 'text' });

module.exports = mongoose.model('Application', applicationSchema);

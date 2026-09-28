const mongoose = require('mongoose');

/*
 * A student's in-progress application for one scheme. Kept separate from
 * Application so drafts never show up in the admin review queue or counts.
 * Deleted automatically when the application is finally submitted.
 */
const applicationDraftSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    scheme: { type: String, enum: ['NFST', 'NOS', 'PRE_MATRIC'], required: true },
    session: { type: String, default: '2026-27' },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    currentStep: { type: String, default: '' },
    completedSteps: [{ type: String }],
  },
  { timestamps: true, minimize: false }
);

applicationDraftSchema.index({ student: 1, scheme: 1 }, { unique: true });

module.exports = mongoose.model('ApplicationDraft', applicationDraftSchema);

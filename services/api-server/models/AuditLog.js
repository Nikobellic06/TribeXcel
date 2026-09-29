const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      default: Date.now,
      immutable: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },
    userName: {
      type: String,
      default: 'SYSTEM',
    },
    userRole: {
      type: String,
      default: 'SYSTEM',
      index: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
      // e.g. APPLICATION_SUBMITTED, DOCUMENT_RETRIEVED, DOCUMENT_VERIFIED, DEFICIENCY_RAISED, DEFICIENCY_RESOLVED, STATUS_CHANGED, MERIT_UPDATED, LOGIN
    },
    entityType: {
      type: String,
      required: true,
      enum: ['Application', 'Document', 'Student', 'Admin', 'SchemeRule', 'System', 'DigiLockerSession', 'DigiLockerDocument'],
      index: true,
    },
    entityId: {
      type: String,
      index: true,
    },
    oldValue: {
      type: mongoose.Schema.Types.Mixed,
    },
    newValue: {
      type: mongoose.Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
    reason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

auditLogSchema.index({ entityType: 1, entityId: 1, timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);

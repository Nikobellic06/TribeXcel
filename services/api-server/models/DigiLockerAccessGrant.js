const mongoose = require('mongoose');

const digiLockerAccessGrantSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      default: null,
      index: true,
    },
    sessionId: {
      type: String,
      default: '',
      index: true,
    },
    permissions: [
      {
        type: String,
        enum: ['DOCUMENT_LIST', 'DOCUMENT_READ', 'STRUCTURED_DATA_READ'],
      },
    ],
    grantedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'REVOKED', 'EXPIRED'],
      default: 'ACTIVE',
      index: true,
    },
    clientInfo: {
      clientName: { type: String, default: 'TribeXcel Scholarship Portal' },
      ipAddress: { type: String, default: '' },
      userAgent: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

// Method to verify if grant is currently active
digiLockerAccessGrantSchema.methods.isValid = function () {
  if (this.status !== 'ACTIVE') return false;
  if (this.revokedAt) return false;
  if (new Date() > new Date(this.expiresAt)) return false;
  return true;
};

module.exports = mongoose.model('DigiLockerAccessGrant', digiLockerAccessGrantSchema);

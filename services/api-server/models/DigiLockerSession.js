const mongoose = require('mongoose');

const DIGILOCKER_STATES = [
  'CREATED',
  'AUTHORIZATION_PENDING',
  'AUTHENTICATED',
  'CONSENT_PENDING',
  'CONSENT_GRANTED',
  'DOCUMENTS_LOADING',
  'DOCUMENTS_AVAILABLE',
  'DOCUMENT_SELECTED',
  'DOCUMENT_RETRIEVING',
  'DOCUMENT_RETRIEVED',
  'RETURNED_TO_TRIBEXCEL',
  'REVOKED',
  'FAILED',
  'EXPIRED',
];

const digiLockerSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
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
    },
    schemeCode: {
      type: String,
      default: '',
    },
    provider: {
      type: String,
      default: 'DIGILOCKER',
      enum: ['DIGILOCKER'],
    },
    environment: {
      type: String,
      default: 'DEMO_SANDBOX',
      enum: ['DEMO_SANDBOX', 'PRODUCTION'],
    },
    state: {
      type: String,
      enum: DIGILOCKER_STATES,
      default: 'CREATED',
      required: true,
    },
    nonce: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: 'INITIALIZED',
    },
    failureReason: {
      type: String,
      default: null,
    },
    scenario: {
      type: String,
      default: 'SUCCESS',
      enum: [
        'SUCCESS',
        'AUTH_CANCELLED',
        'OTP_FAILURE',
        'CONSENT_DENIED',
        'NO_DOCUMENTS',
        'RETRIEVAL_FAILURE',
        'SESSION_EXPIRED',
        'PROVIDER_UNAVAILABLE',
        'DOC_MISMATCH',
      ],
    },
    mobile: {
      type: String,
      default: '98XXXXXX42',
    },
    otp: {
      type: String,
      default: '123456',
    },
    otpAttempts: {
      type: Number,
      default: 0,
    },
    requestedDocuments: [
      {
        docType: { type: String, required: true },
        name: { type: String },
        required: { type: Boolean, default: false },
      },
    ],
    selectedDocuments: [
      {
        type: String,
      },
    ],
    retrievedDocuments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DigiLockerDocument',
      },
    ],
    redirectUri: {
      type: String,
      default: '',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // MongoDB TTL index to auto-expire sessions
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

digiLockerSessionSchema.statics.STATES = DIGILOCKER_STATES;

module.exports = mongoose.model('DigiLockerSession', digiLockerSessionSchema);

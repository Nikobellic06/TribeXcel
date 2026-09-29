const mongoose = require('mongoose');

const digiLockerUserSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    mobile: {
      type: String,
      default: '',
    },
    environment: {
      type: String,
      default: 'SANDBOX',
      enum: ['SANDBOX', 'PRODUCTION'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('DigiLockerUser', digiLockerUserSchema);

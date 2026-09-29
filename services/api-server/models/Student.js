const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema(
  {
    line: { type: String, trim: true, default: '' },
    district: { type: String, trim: true, default: '' },
    state: { type: String, trim: true, default: '' },
    pincode: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    rollNumber: { type: String, required: true, unique: true, trim: true },
    phone: { type: String, required: true },
    dob: { type: Date },
    state: { type: String },
    password: { type: String, required: true },

    // Profile (pre-fills every scheme application)
    fatherName: { type: String, trim: true, default: '' },
    motherName: { type: String, trim: true, default: '' },
    gender: { type: String, enum: ['Male', 'Female', 'Other', ''], default: '' },
    altPhone: { type: String, trim: true, default: '' },
    address: { type: addressSchema, default: () => ({}) },

    // Aadhaar Identity — format validation using Verhoeff checksum.
    // Storing ONLY last 4 digits per Aadhaar Act 2016. No false claim of UIDAI e-KYC.
    aadhaarLast4: { type: String, default: '' },
    aadhaarFormatValidated: { type: Boolean, default: false },
    formatValidatedAt: { type: Date },
    aadhaarVerified: { type: Boolean, default: false },
    aadhaarVerifiedAt: { type: Date },
  },
  { timestamps: true }
);

studentSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

studentSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/** Safe public shape of a student (never includes the password). */
studentSchema.methods.toProfile = function () {
  return {
    id: this._id,
    _id: this._id,
    name: this.name,
    email: this.email,
    rollNumber: this.rollNumber,
    phone: this.phone,
    dob: this.dob,
    state: this.state,
    fatherName: this.fatherName || '',
    motherName: this.motherName || '',
    gender: this.gender || '',
    altPhone: this.altPhone || '',
    address: {
      line: this.address?.line || '',
      district: this.address?.district || '',
      state: this.address?.state || '',
      pincode: this.address?.pincode || '',
    },
    aadhaarLast4: this.aadhaarLast4 || '',
    aadhaarFormatValidated: Boolean(this.aadhaarFormatValidated || this.aadhaarVerified),
    formatValidatedAt: this.formatValidatedAt || this.aadhaarVerifiedAt,
    aadhaarVerified: Boolean(this.aadhaarVerified),
    aadhaarVerifiedAt: this.aadhaarVerifiedAt,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('Student', studentSchema);

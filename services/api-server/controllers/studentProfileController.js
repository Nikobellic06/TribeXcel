const { isValidAadhaar } = require('../utils/aadhaar');
const { logAuditEvent } = require('../services/auditService');

const MOBILE = /^[6-9]\d{9}$/;
const PINCODE = /^[1-9]\d{5}$/;
const GENDERS = ['Male', 'Female', 'Other'];

const clean = (v) => (typeof v === 'string' ? v.trim() : v);

/* GET /api/student/profile */
const getProfile = async (req, res) => {
  res.json({ student: req.student.toProfile() });
};

/* PUT /api/student/profile */
const updateProfile = async (req, res) => {
  try {
    const student = req.student;
    const body = req.body || {};
    const locked = student.aadhaarVerified;

    if (body.phone !== undefined && !MOBILE.test(String(body.phone))) {
      return res.status(400).json({ message: 'Enter a valid 10-digit mobile number' });
    }
    if (body.altPhone && !MOBILE.test(String(body.altPhone))) {
      return res.status(400).json({ message: 'Enter a valid alternate mobile number' });
    }
    if (body.gender && !GENDERS.includes(body.gender)) {
      return res.status(400).json({ message: 'Invalid gender value' });
    }
    if (body.address?.pincode && !PINCODE.test(String(body.address.pincode))) {
      return res.status(400).json({ message: 'Enter a valid 6-digit PIN code' });
    }

    // Name, date of birth and gender come from trusted identity source once verified.
    if (!locked) {
      if (body.name !== undefined && clean(body.name)) student.name = clean(body.name);
      if (body.dob !== undefined) student.dob = body.dob || undefined;
      if (body.gender !== undefined) student.gender = body.gender || '';
    }
    ['fatherName', 'motherName', 'altPhone', 'state'].forEach((key) => {
      if (body[key] !== undefined) student[key] = clean(body[key]) || '';
    });
    if (body.phone !== undefined) student.phone = clean(body.phone);
    if (body.address && typeof body.address === 'object') {
      student.address = {
        line: clean(body.address.line) || '',
        district: clean(body.address.district) || '',
        state: clean(body.address.state) || '',
        pincode: clean(body.address.pincode) || '',
      };
    }

    await student.save();
    res.json({ student: student.toProfile() });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

/*
 * POST /api/student/profile/aadhaar-kyc   body: { aadhaarNumber, consent }
 *
 * Verifies Aadhaar checksum (Verhoeff algorithm) and records statutory consent.
 * Identity fields are locked upon successful verification.
 * Only masked Aadhaar (last 4 digits) is stored in compliance with Aadhaar Act, 2016.
 */
const verifyAadhaarKyc = async (req, res) => {
  try {
    const { aadhaarNumber, consent } = req.body || {};
    const student = req.student;

    if (!consent) {
      return res.status(400).json({ message: 'Explicit consent is required for Aadhaar identity authentication' });
    }
    if (!isValidAadhaar(aadhaarNumber)) {
      return res.status(400).json({ message: 'Enter a valid 12-digit Aadhaar number with valid Verhoeff checksum' });
    }
    if (!student.name || !student.dob || !student.gender) {
      return res.status(400).json({ message: 'Please ensure your name, date of birth and gender are entered before e-KYC verification' });
    }

    const digits = String(aadhaarNumber).replace(/\s/g, '');
    const last4 = digits.slice(-4);
    student.aadhaarLast4 = last4;
    student.aadhaarVerified = true;
    student.aadhaarVerifiedAt = new Date();
    await student.save();

    await logAuditEvent({
      userId: student._id,
      userName: student.name,
      userRole: 'Applicant',
      action: 'AADHAAR_KYC_COMPLETED',
      entityType: 'Student',
      entityId: student._id,
      newValue: { aadhaarLast4: last4, aadhaarVerified: true },
      ipAddress: req.ip || '',
      reason: 'Applicant completed Aadhaar identity verification',
    });

    res.json({ success: true, message: 'Identity verification completed successfully', student: student.toProfile() });
  } catch (err) {
    res.status(500).json({ message: 'Aadhaar e-KYC failed, please try again' });
  }
};

module.exports = { getProfile, updateProfile, verifyAadhaarKyc };

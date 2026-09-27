const jwt = require('jsonwebtoken');
const Student = require('../models/Student');

const generateToken = (id) => {
  return jwt.sign({ id, role: 'student' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/* POST /api/student/register */
const register = async (req, res) => {
  try {
    const { name, email, rollNumber, phone, dob, state, password, confirmPassword } = req.body;

    if (!name || !email || !rollNumber || !phone || !password) {
      return res.status(400).json({ message: 'Name, email, roll number, phone and password are required' });
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({ message: 'Password and confirm password do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const normalisedEmail = email.toLowerCase().trim();
    const existing = await Student.findOne({
      $or: [{ email: normalisedEmail }, { rollNumber: rollNumber.trim() }],
    });

    if (existing) {
      const field = existing.email === normalisedEmail ? 'email' : 'roll number';
      return res.status(409).json({ message: `An account with this ${field} already exists` });
    }

    const student = await Student.create({
      name,
      email: normalisedEmail,
      rollNumber: rollNumber.trim(),
      phone,
      dob,
      state,
      password,
    });

    res.status(201).json({
      token: generateToken(student._id),
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        rollNumber: student.rollNumber,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error during registration' });
  }
};

/* POST /api/student/login   body: { identifier, password }  — identifier is email OR roll number */
const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Email/roll number and password are required' });
    }

    const value = identifier.trim();
    const student = await Student.findOne({
      $or: [{ email: value.toLowerCase() }, { rollNumber: value }],
    });

    if (!student) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await student.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      token: generateToken(student._id),
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        rollNumber: student.rollNumber,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error during login' });
  }
};

/* GET /api/student/me */
const getProfile = async (req, res) => {
  res.json({ student: req.student });
};

module.exports = { register, login, getProfile };

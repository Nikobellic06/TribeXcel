const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Student = require('../models/Student');

const protect = async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = await Admin.findById(decoded.id).select('-password');

    if (!req.admin) {
      return res.status(401).json({ message: 'Admin no longer exists' });
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized, token invalid or expired' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({ message: `Access forbidden: requires role in [${roles.join(', ')}]` });
    }
    next();
  };
};

/**
 * Protects endpoints accessible to either an authenticated Student OR an authenticated Admin/Reviewer
 */
const protectAny = async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Try finding admin first
    const admin = await Admin.findById(decoded.id).select('-password');
    if (admin) {
      req.admin = admin;
      return next();
    }

    // Try finding student
    const student = await Student.findById(decoded.id).select('-password');
    if (student) {
      req.student = student;
      return next();
    }

    return res.status(401).json({ message: 'User account not found' });
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized, token invalid or expired' });
  }
};

module.exports = { protect, authorize, protectAny };

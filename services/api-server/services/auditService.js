const AuditLog = require('../models/AuditLog');

/**
 * Record an immutable audit log entry.
 */
async function logAuditEvent({
  userId = null,
  userName = 'SYSTEM',
  userRole = 'SYSTEM',
  action,
  entityType = 'System',
  entityId,
  oldValue = null,
  newValue = null,
  ipAddress = '',
  userAgent = '',
  reason = '',
}) {
  try {
    const entry = new AuditLog({
      timestamp: new Date(),
      userId,
      userName,
      userRole,
      action,
      entityType,
      entityId: String(entityId || ''),
      oldValue,
      newValue,
      ipAddress,
      userAgent,
      reason,
    });
    await entry.save();
    return entry;
  } catch (err) {
    console.error('Audit logging failed (non-fatal):', err.message);
    return null;
  }
}

module.exports = {
  logAuditEvent,
};

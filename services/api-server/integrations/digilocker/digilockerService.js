/**
 * DigiLocker Service Adapter
 * Delegates exclusively to the authoritative DigiLockerProvider interface.
 */
const { provider, DIGILOCKER_DOCUMENT_CATALOGUE } = require('./index');

async function getAuthorizationUrl(student, options = {}) {
  return await provider.authorize({
    student,
    applicationId: options.applicationId,
    schemeCode: options.schemeCode,
    requestedDocuments: options.requestedDocuments,
    redirectUri: options.redirectUri,
    scenario: options.scenario,
  });
}

async function getSession(sessionId, studentId) {
  return await provider.getSession({ sessionId, studentId });
}

async function authenticateWithOtp(sessionId, studentId, otp) {
  return await provider.authenticateWithOtp({ sessionId, studentId, otp });
}

async function processConsent(sessionId, studentId, consentGranted) {
  return await provider.processConsent({ sessionId, studentId, consentGranted });
}

async function getIssuedDocuments(sessionId, studentId) {
  return await provider.getIssuedDocuments({ sessionId, studentId });
}

async function retrieveDocuments(sessionId, studentId, selectedDocumentIds, ipAddress) {
  return await provider.retrieveDocuments({
    sessionId,
    studentId,
    selectedDocumentIds,
    ipAddress,
  });
}

async function completeSession(sessionId, studentId) {
  return await provider.completeSession({ sessionId, studentId });
}

async function cancelAuthorization(sessionId, studentId) {
  return await provider.cancelAuthorization({ sessionId, studentId });
}

async function revokeAccess(sessionId, studentId) {
  return await provider.revokeAccess({ sessionId, studentId });
}

module.exports = {
  provider,
  DIGILOCKER_DOCUMENT_CATALOGUE,
  getAuthorizationUrl,
  getSession,
  authenticateWithOtp,
  processConsent,
  getIssuedDocuments,
  retrieveDocuments,
  completeSession,
  cancelAuthorization,
  revokeAccess,
};

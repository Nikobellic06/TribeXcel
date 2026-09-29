const digilockerService = require('../integrations/digilocker/digilockerService');
const { DIGILOCKER_DOCUMENT_CATALOGUE } = require('../integrations/digilocker/documentCatalogue');
const DigiLockerSession = require('../models/DigiLockerSession');
const Document = require('../models/Document');

/**
 * GET /api/digilocker/catalogue or /api/student/digilocker/catalogue
 */
const getCatalogue = async (req, res) => {
  res.json({
    success: true,
    catalogue: DIGILOCKER_DOCUMENT_CATALOGUE,
  });
};

/**
 * POST /api/digilocker/authorize
 * Initiate a sandbox authorization session
 */
const authorize = async (req, res) => {
  try {
    const student = req.student;
    const { applicationId, schemeCode, requestedDocuments, redirectUri, scenario } = req.body || {};

    const authData = await digilockerService.getAuthorizationUrl(student, {
      applicationId,
      schemeCode,
      requestedDocuments,
      redirectUri,
      scenario,
    });

    res.status(201).json(authData);
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({
      success: false,
      code: err.code || 'AUTHORIZATION_FAILED',
      message: err.message,
    });
  }
};

/**
 * GET /api/digilocker/session/:id
 * Retrieve session state and current state machine position
 */
const getSession = async (req, res) => {
  try {
    const session = await digilockerService.getSession(req.params.id, req.student._id);
    res.json({
      success: true,
      session: {
        sessionId: session.sessionId,
        state: session.state,
        status: session.status,
        provider: session.provider,
        environment: session.environment,
        requestedDocuments: session.requestedDocuments,
        selectedDocuments: session.selectedDocuments,
        mobile: session.mobile,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
        failureReason: session.failureReason,
        scenario: session.scenario,
      },
    });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({
      success: false,
      code: err.code || 'SESSION_ERROR',
      message: err.message,
    });
  }
};

/**
 * POST /api/digilocker/session/:id/auth-otp
 * Authenticate session using OTP
 */
const authenticateOtp = async (req, res) => {
  try {
    const { otp } = req.body || {};
    const result = await digilockerService.authenticateWithOtp(req.params.id, req.student._id, otp);
    res.json(result);
  } catch (err) {
    const status = err.status || 400;
    res.status(status).json({
      success: false,
      code: err.code || 'AUTHENTICATION_FAILED',
      message: err.message,
    });
  }
};

/**
 * POST /api/digilocker/session/:id/consent
 * Process consent decision (grant or deny)
 */
const processConsent = async (req, res) => {
  try {
    const { consentGranted } = req.body;
    const result = await digilockerService.processConsent(
      req.params.id,
      req.student._id,
      consentGranted !== false
    );
    res.json(result);
  } catch (err) {
    const status = err.status || 400;
    res.status(status).json({
      success: false,
      code: err.code || 'CONSENT_ERROR',
      message: err.message,
    });
  }
};

/**
 * GET /api/digilocker/documents or /api/digilocker/session/:id/documents
 * List issued documents in the identity repository
 */
const getIssuedDocuments = async (req, res) => {
  try {
    let sessionId = req.params.id || req.query.sessionId;

    if (!sessionId) {
      // Find latest active session for this student
      const latestSession = await DigiLockerSession.findOne({
        studentId: req.student._id,
        state: { $nin: ['FAILED', 'EXPIRED', 'REVOKED'] },
      }).sort({ createdAt: -1 });

      if (latestSession) {
        sessionId = latestSession.sessionId;
      } else {
        // Create an ad-hoc session if needed
        const auth = await digilockerService.getAuthorizationUrl(req.student, {});
        sessionId = auth.sessionId;
      }
    }

    const docsResult = await digilockerService.getIssuedDocuments(sessionId, req.student._id);
    res.json(docsResult);
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({
      success: false,
      code: err.code || 'DOCUMENTS_FETCH_FAILED',
      message: err.message,
    });
  }
};

/**
 * POST /api/digilocker/documents/retrieve or /api/digilocker/session/:id/retrieve
 * Retrieve and verify selected issued documents
 */
const retrieveDocuments = async (req, res) => {
  try {
    const sessionId = req.params.id || req.body.sessionId;
    const selectedDocumentIds = req.body.selectedDocumentIds || (req.body.docType ? [req.body.docType] : []);
    const ipAddress = req.ip || req.connection?.remoteAddress || '';

    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'Session ID is required for retrieval' });
    }

    const result = await digilockerService.retrieveDocuments(
      sessionId,
      req.student._id,
      selectedDocumentIds,
      ipAddress
    );

    res.status(200).json(result);
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({
      success: false,
      code: err.code || 'RETRIEVAL_FAILED',
      message: err.message,
    });
  }
};

/**
 * POST /api/digilocker/session/:id/complete
 * Complete session and return to TribeXcel
 */
const completeSession = async (req, res) => {
  try {
    const result = await digilockerService.completeSession(req.params.id, req.student._id);
    res.json(result);
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({
      success: false,
      code: err.code || 'COMPLETE_FAILED',
      message: err.message,
    });
  }
};

/**
 * POST /api/digilocker/session/:id/cancel
 * Cancel authorization
 */
const cancelAuthorization = async (req, res) => {
  try {
    const result = await digilockerService.cancelAuthorization(req.params.id, req.student._id);
    res.json(result);
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({
      success: false,
      code: err.code || 'CANCEL_FAILED',
      message: err.message,
    });
  }
};

/**
 * POST /api/digilocker/revoke
 * Revoke integration access
 */
const revokeAccess = async (req, res) => {
  try {
    const sessionId = req.body.sessionId;
    const result = await digilockerService.revokeAccess(sessionId, req.student._id);
    res.json(result);
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({
      success: false,
      code: err.code || 'REVOKE_FAILED',
      message: err.message,
    });
  }
};

/**
 * GET /api/student/documents
 * List all verified and uploaded documents for the student
 */
const getStudentDocuments = async (req, res) => {
  try {
    const docs = await Document.find({ studentId: req.student._id }).sort({ updatedAt: -1 });
    res.json({
      success: true,
      documents: docs.map((d) => ({
        documentId: d.documentId,
        _id: d._id,
        documentType: d.documentType,
        source: d.source,
        fileName: d.fileName,
        fileUrl: d.fileUrl,
        mimeType: d.mimeType,
        size: d.fileSize,
        verificationStatus: d.verificationStatus,
        verificationMethod: d.verificationMethod,
        integrityStatus: d.integrityStatus,
        issuer: d.digilocker?.issuerName || '',
        certificateNo: d.digilocker?.certificateNo || '',
        digilockerUri: d.digilocker?.documentUri || '',
        verifiedAt: d.verifiedAt,
        ocrStatus: d.ocrStatus,
        crossCheckStatus: d.crossCheckStatus,
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Developer Sandbox Scenarios Control
 * GET /api/digilocker/dev/scenarios
 */
const getDeveloperScenarios = async (req, res) => {
  const currentScenario = digilockerService.provider.defaultScenario || 'SUCCESS';
  res.json({
    success: true,
    currentScenario,
    availableScenarios: [
      { id: 'SUCCESS', label: 'Successful Authorization', description: 'Nominal happy path: OTP 123456, full documents available, successful retrieval' },
      { id: 'AUTH_CANCELLED', label: 'Cancelled Authorization', description: 'Simulates candidate clicking cancel or aborting authorization screen' },
      { id: 'OTP_FAILURE', label: 'OTP Failure', description: 'Simulates OTP validation rejection / expired OTP code' },
      { id: 'CONSENT_DENIED', label: 'Consent Denied', description: 'Simulates candidate declining statutory data sharing consent' },
      { id: 'NO_DOCUMENTS', label: 'No Documents', description: 'Simulates repository returning 0 issued records for the candidate' },
      { id: 'RETRIEVAL_FAILURE', label: 'Document Retrieval Failure', description: 'Simulates downstream provider failure during document fetch' },
      { id: 'SESSION_EXPIRED', label: 'Session Expired', description: 'Simulates session TTL expiry requiring reconnection' },
      { id: 'PROVIDER_UNAVAILABLE', label: 'Provider Unavailable', description: 'Simulates 503 gateway outage from external identity provider' },
      { id: 'DOC_MISMATCH', label: 'Document Mismatch', description: 'Simulates failure when mapping returned certificate to scheme requirement' },
    ],
  });
};

/**
 * POST /api/digilocker/dev/scenario
 */
const setDeveloperScenario = async (req, res) => {
  const { scenario } = req.body || {};
  if (!scenario) {
    return res.status(400).json({ success: false, message: 'Scenario name is required' });
  }
  if (digilockerService.provider.setDefaultScenario) {
    digilockerService.provider.setDefaultScenario(scenario);
  }
  res.json({
    success: true,
    message: `Developer sandbox scenario set to: ${scenario}`,
    activeScenario: scenario,
  });
};

module.exports = {
  getCatalogue,
  authorize,
  getSession,
  authenticateOtp,
  processConsent,
  getIssuedDocuments,
  retrieveDocuments,
  completeSession,
  cancelAuthorization,
  revokeAccess,
  getStudentDocuments,
  getDeveloperScenarios,
  setDeveloperScenario,
};

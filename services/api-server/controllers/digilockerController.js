const digilockerService = require('../integrations/digilocker/digilockerService');
const { DIGILOCKER_DOCUMENT_CATALOGUE } = require('../integrations/digilocker/documentCatalogue');
const Document = require('../models/Document');

/**
 * GET /api/student/digilocker/catalogue
 */
const getCatalogue = async (req, res) => {
  res.json({
    success: true,
    catalogue: DIGILOCKER_DOCUMENT_CATALOGUE,
  });
};

/**
 * GET /api/student/digilocker/authorize
 */
const getAuthorizationUrl = async (req, res) => {
  try {
    const studentId = req.student._id;
    const authData = digilockerService.getAuthorizationUrl(studentId);
    res.json({
      success: true,
      ...authData,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/student/digilocker/token
 * Body: { code, state }
 */
const exchangeToken = async (req, res) => {
  try {
    const { code, state } = req.body || {};
    if (!code || !state) {
      return res.status(400).json({ success: false, message: 'Code and state are required' });
    }
    const tokenData = await digilockerService.exchangeCodeForToken(code, state, req.student._id);
    res.json({
      success: true,
      ...tokenData,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/student/digilocker/issued-documents
 * Headers: Authorization (student token), dl-token (digilocker access token)
 */
const getIssuedDocuments = async (req, res) => {
  try {
    const dlToken = req.headers['x-digilocker-token'] || req.query.dl_token;
    const documents = await digilockerService.getIssuedDocuments(dlToken, req.student);
    res.json({
      success: true,
      documents,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/student/digilocker/pull-document
 * Body: { docType, uri, issuerId, certificateNo, applicationId }
 */
const pullDocument = async (req, res) => {
  try {
    const { docType, uri, issuerId, certificateNo, applicationId } = req.body || {};
    if (!docType || !uri) {
      return res.status(400).json({ success: false, message: 'docType and uri are required' });
    }

    const ipAddress = req.ip || req.connection?.remoteAddress || '';
    const documentRecord = await digilockerService.pullAndVerifyDocument({
      student: req.student,
      docType,
      uri,
      issuerId,
      certificateNo,
      applicationId,
      ipAddress,
    });

    res.status(201).json({
      success: true,
      message: 'Document successfully retrieved and verified from DigiLocker repository',
      document: {
        documentId: documentRecord.documentId,
        _id: documentRecord._id,
        documentType: documentRecord.documentType,
        source: documentRecord.source,
        fileName: documentRecord.fileName,
        fileUrl: documentRecord.fileUrl,
        mimeType: documentRecord.mimeType,
        size: documentRecord.fileSize,
        verificationStatus: documentRecord.verificationStatus,
        verificationMethod: documentRecord.verificationMethod,
        issuer: documentRecord.digilocker.issuerName,
        certificateNo: documentRecord.digilocker.certificateNo,
        digilockerUri: documentRecord.digilocker.documentUri,
        verifiedAt: documentRecord.verifiedAt,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/student/documents
 * Retrieve all verified and uploaded documents for the logged in student
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

module.exports = {
  getCatalogue,
  getAuthorizationUrl,
  exchangeToken,
  getIssuedDocuments,
  pullDocument,
  getStudentDocuments,
};

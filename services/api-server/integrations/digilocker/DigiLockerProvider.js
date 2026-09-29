/**
 * Base Abstract DigiLocker Provider Interface
 * Standardizes external document provider integrations (DigiLocker / API Setu).
 * Production or Sandbox providers must extend this class.
 */
class DigiLockerProvider {
  constructor(name = 'DigiLockerProvider') {
    this.name = name;
  }

  /**
   * Initiate an authorization session
   * @param {Object} params
   * @param {Object} params.student - The authenticated student initiating the connection
   * @param {string} [params.applicationId] - Optional application ID context
   * @param {string} [params.schemeCode] - Optional scheme code context
   * @param {Array} [params.requestedDocuments] - List of required documents to fetch
   * @param {string} [params.redirectUri] - OAuth callback redirect URI
   * @param {string} [params.scenario] - Developer simulation scenario (sandbox only)
   * @returns {Promise<Object>} session information & authorization URL
   */
  async authorize(params) {
    throw new Error('authorize() must be implemented by provider');
  }

  /**
   * Exchange OAuth authorization code for verified session / token
   * @param {Object} params
   * @param {string} params.code
   * @param {string} params.state
   * @param {string} [params.studentId]
   * @returns {Promise<Object>} token / session credentials
   */
  async exchangeAuthorizationCode(params) {
    throw new Error('exchangeAuthorizationCode() must be implemented by provider');
  }

  /**
   * Get current state of an ongoing session
   * @param {Object} params
   * @param {string} params.sessionId
   * @param {string} [params.studentId]
   * @returns {Promise<Object>} session record with state machine position
   */
  async getSession(params) {
    throw new Error('getSession() must be implemented by provider');
  }

  /**
   * Fetch list of issued documents available in the identity repository
   * @param {Object} params
   * @param {string} params.sessionId
   * @param {string} params.studentId
   * @returns {Promise<Array>} catalogue of issued documents
   */
  async getIssuedDocuments(params) {
    throw new Error('getIssuedDocuments() must be implemented by provider');
  }

  /**
   * Retrieve and verify a specific issued document
   * @param {Object} params
   * @param {string} params.sessionId
   * @param {string} params.studentId
   * @param {string} params.documentId
   * @param {string} [params.uri]
   * @param {string} [params.applicationId]
   * @param {string} [params.ipAddress]
   * @returns {Promise<Object>} retrieved document record
   */
  async getDocument(params) {
    throw new Error('getDocument() must be implemented by provider');
  }

  /**
   * Revoke session or integration access
   * @param {Object} params
   * @param {string} params.sessionId
   * @param {string} params.studentId
   * @returns {Promise<Object>} revocation confirmation
   */
  async revokeAccess(params) {
    throw new Error('revokeAccess() must be implemented by provider');
  }
}

module.exports = DigiLockerProvider;

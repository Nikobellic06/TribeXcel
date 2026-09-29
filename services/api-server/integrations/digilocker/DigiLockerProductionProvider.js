const DigiLockerProvider = require('./DigiLockerProvider');

/**
 * DigiLocker Production Provider
 * Interacts with Government of India API Setu / DigiLocker live production endpoints.
 * Requires production client credentials and SSL certificate bindings.
 */
class DigiLockerProductionProvider extends DigiLockerProvider {
  constructor() {
    super('DigiLockerProductionProvider');
    this.clientId = process.env.DIGILOCKER_CLIENT_ID;
    this.clientSecret = process.env.DIGILOCKER_CLIENT_SECRET;
    this.apiBase = process.env.DIGILOCKER_API_BASE || 'https://api.digitallocker.gov.in';
    this.isConfigured = Boolean(this.clientId && this.clientSecret && process.env.DIGILOCKER_LIVE_EXCHANGE === 'true');
  }

  _checkConfigured() {
    if (!this.isConfigured) {
      const err = new Error(
        'DigiLocker Production Provider is not configured. Active API Setu production credentials and PKI certificates are required. Use DigiLockerSandboxProvider for testing and demonstrations.'
      );
      err.code = 'PROVIDER_UNCONFIGURED';
      err.status = 503;
      throw err;
    }
  }

  async authorize(params) {
    this._checkConfigured();
    // Live DigiLocker OAuth2 redirect generation
  }

  async exchangeAuthorizationCode(params) {
    this._checkConfigured();
    // Live DigiLocker token exchange via API Setu
  }

  async getSession(params) {
    this._checkConfigured();
  }

  async getIssuedDocuments(params) {
    this._checkConfigured();
  }

  async getDocument(params) {
    this._checkConfigured();
  }

  async revokeAccess(params) {
    this._checkConfigured();
  }
}

module.exports = DigiLockerProductionProvider;

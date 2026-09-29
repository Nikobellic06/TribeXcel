const DigiLockerProvider = require('./DigiLockerProvider');
const DigiLockerSandboxProvider = require('./DigiLockerSandboxProvider');
const DigiLockerProductionProvider = require('./DigiLockerProductionProvider');
const { DIGILOCKER_DOCUMENT_CATALOGUE } = require('./documentCatalogue');

const environment = (process.env.DIGILOCKER_ENVIRONMENT || 'sandbox').toLowerCase();

/**
 * Provider resolution: The application depends on DigiLockerProvider interface,
 * resolving to either Sandbox or Production provider based on environment configuration.
 */
const providerInstance =
  environment === 'production'
    ? new DigiLockerProductionProvider()
    : new DigiLockerSandboxProvider();

module.exports = {
  provider: providerInstance,
  DigiLockerProvider,
  DigiLockerSandboxProvider,
  DigiLockerProductionProvider,
  DIGILOCKER_DOCUMENT_CATALOGUE,
};

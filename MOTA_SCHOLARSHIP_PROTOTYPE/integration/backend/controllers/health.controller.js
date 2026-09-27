import { checkSystemAHealth } from '../services/systemAClient.js';
import { checkSystemBHealth } from '../services/systemBClient.js';

/**
 * GET /api/health
 * Checks Integration, System A, and System B
 */
export async function getHealth(req, res) {
  const [systemA, systemB] = await Promise.all([
    checkSystemAHealth(),
    checkSystemBHealth()
  ]);

  res.status(200).json({
    integration: "UP",
    systemA: systemA.status,
    systemB: systemB.status,
    systemADetails: systemA.details || { error: systemA.error },
    systemBDetails: systemB.details || { error: systemB.error },
    timestamp: new Date().toISOString()
  });
}

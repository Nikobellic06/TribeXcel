import { INTEGRATION_DEMOS } from '../data/demoScenarios.js';
import { executeDemoScenario } from '../services/demoService.js';

export async function getDemoApplications(req, res) {
  const list = Object.entries(INTEGRATION_DEMOS).map(([key, demo]) => ({
    key,
    title: demo.title,
    scheme: demo.scheme,
    applicationId: demo.applicationId,
    description: demo.description
  }));

  res.status(200).json({
    availableScenarios: list
  });
}

export async function runDemoApplication(req, res) {
  try {
    const scenario = req.body?.scenario || 'eligible';
    const result = await executeDemoScenario(scenario);
    res.status(200).json(result);
  } catch (err) {
    console.error('[Demo Controller] Demo execution error:', err);
    res.status(500).json({
      error: 'Demo Execution Error',
      message: err.message
    });
  }
}

import { demoScenarios } from '../data/demoScenarios.js';
import { runDocumentIntelligencePipeline } from '../services/pipeline.service.js';

/**
 * GET /api/demo-application
 * List available demo application scenarios or fetch details of a specific scenario
 */
export async function getDemoApplications(req, res) {
  try {
    const { scenario } = req.query;

    if (scenario) {
      const selected = demoScenarios[scenario.toLowerCase()];
      if (!selected) {
        return res.status(404).json({
          error: 'Demo scenario not found',
          availableScenarios: Object.keys(demoScenarios)
        });
      }
      return res.status(200).json(selected);
    }

    // Return overview of all scenarios
    const summary = Object.entries(demoScenarios).map(([key, data]) => ({
      key,
      id: data.id,
      title: data.title,
      description: data.description,
      documentsCount: data.documents.length,
      documentTypes: data.documents.map(d => d.documentType)
    }));

    return res.status(200).json({
      message: 'MoTA Document Intelligence Engine Demo Scenarios',
      availableScenarios: summary
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Failed to fetch demo applications',
      message: err.message
    });
  }
}

/**
 * POST /api/demo-application
 * Execute pipeline on a selected demo application scenario (clean, missing, inconsistent)
 */
export async function runDemoApplication(req, res) {
  try {
    const scenarioKey = (req.body?.scenario || 'clean').toLowerCase();
    const demoData = demoScenarios[scenarioKey];

    if (!demoData) {
      return res.status(400).json({
        error: `Unknown demo scenario: "${scenarioKey}"`,
        message: 'Valid options are: "clean", "missing", "inconsistent"'
      });
    }

    const pipelineResult = await runDocumentIntelligencePipeline([], {
      applicationId: demoData.id,
      preParsedDocuments: demoData.documents
    });

    return res.status(200).json({
      scenario: demoData.scenario,
      title: demoData.title,
      description: demoData.description,
      ...pipelineResult
    });
  } catch (err) {
    console.error('[Demo Controller] Error running demo scenario:', err);
    return res.status(500).json({
      error: 'Failed to process demo scenario',
      message: err.message
    });
  }
}

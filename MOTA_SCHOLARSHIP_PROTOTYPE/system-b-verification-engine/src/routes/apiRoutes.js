const express = require('express');
const router = express.Router();
const { SCHEMES } = require('../data/schemes');
const { DEMO_APPLICATIONS } = require('../data/demoApplications');
const { verifyApplication, normalizeSchemeKey } = require('../engine/verificationEngine');
const { verifyDocuments } = require('../engine/documentVerifier');
const { evaluatePreMatricRules } = require('../engine/rules/preMatricRules');
const { evaluateNosRules } = require('../engine/rules/nosRules');
const { evaluateNationalFellowshipRules } = require('../engine/rules/nationalFellowshipRules');

/**
 * GET /api/health
 */
router.get('/health', (req, res) => {
  res.json({
    status: "ok",
    service: "System B — AI-Assisted Scholarship Verification Engine",
    systemRole: "Deterministic, Explainable Verification Engine",
    decisionBoundary: "AI-assisted verification result. Final decision subject to authorized officer review.",
    supportedSchemes: Object.keys(SCHEMES),
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/schemes
 */
router.get('/schemes', (req, res) => {
  res.json({
    count: Object.keys(SCHEMES).length,
    schemes: SCHEMES
  });
});

/**
 * POST /api/verify
 * Main verification endpoint (Section 11)
 */
router.post('/verify', (req, res) => {
  try {
    const application = req.body;
    if (!application || typeof application !== 'object') {
      return res.status(400).json({ error: "Invalid application payload. JSON body is required." });
    }

    const result = verifyApplication(application);
    res.json(result);
  } catch (err) {
    res.status(500).json({
      error: "Verification engine execution error",
      message: err.message
    });
  }
});

/**
 * POST /api/check-documents
 * Standalone document verification using System A intelligence
 */
router.post('/check-documents', (req, res) => {
  try {
    const application = req.body;
    const schemeKey = normalizeSchemeKey(application.scheme);
    const { documentVerification, documentDeficiencies } = verifyDocuments(schemeKey, application);

    res.json({
      applicationId: application.applicationId || "N/A",
      scheme: schemeKey,
      documentVerification,
      documentDeficiencies
    });
  } catch (err) {
    res.status(500).json({ error: "Document verification error", message: err.message });
  }
});

/**
 * POST /api/evaluate-rules
 * Standalone rule evaluation without full verification bundle
 */
router.post('/evaluate-rules', (req, res) => {
  try {
    const application = req.body;
    const schemeKey = normalizeSchemeKey(application.scheme);
    const { documentVerification } = verifyDocuments(schemeKey, application);

    let ruleEvaluation = [];
    if (schemeKey === "NOS") {
      ruleEvaluation = evaluateNosRules(application, documentVerification);
    } else if (schemeKey === "NATIONAL_FELLOWSHIP") {
      ruleEvaluation = evaluateNationalFellowshipRules(application, documentVerification);
    } else {
      ruleEvaluation = evaluatePreMatricRules(application, documentVerification);
    }

    res.json({
      applicationId: application.applicationId || "N/A",
      scheme: schemeKey,
      ruleEvaluation
    });
  } catch (err) {
    res.status(500).json({ error: "Rule evaluation error", message: err.message });
  }
});

/**
 * GET /api/demo-application
 * Returns demo scenarios or a specific demo payload via ?scenario=
 */
router.get('/demo-application', (req, res) => {
  const scenarioKey = (req.query.scenario || "").toUpperCase();

  if (scenarioKey && DEMO_APPLICATIONS[scenarioKey]) {
    return res.json(DEMO_APPLICATIONS[scenarioKey]);
  }

  // Handle shortcut query aliases (e.g. ?scenario=eligible, 1, 2, 3)
  if (scenarioKey === "1" || scenarioKey.includes("ELIGIBLE") && !scenarioKey.includes("IN")) {
    return res.json(DEMO_APPLICATIONS.DEMO_1_ELIGIBLE);
  }
  if (scenarioKey === "2" || scenarioKey.includes("INELIGIBLE")) {
    return res.json(DEMO_APPLICATIONS.DEMO_2_INELIGIBLE);
  }
  if (scenarioKey === "3" || scenarioKey.includes("HUMAN") || scenarioKey.includes("REVIEW")) {
    return res.json(DEMO_APPLICATIONS.DEMO_3_HUMAN_REVIEW);
  }
  if (scenarioKey === "4" || scenarioKey.includes("INCOMPLETE")) {
    return res.json(DEMO_APPLICATIONS.DEMO_4_INCOMPLETE);
  }

  // Return dictionary of all available demos
  res.json({
    availableScenarios: Object.keys(DEMO_APPLICATIONS).map((k) => ({
      key: k,
      name: DEMO_APPLICATIONS[k].scenarioName,
      scheme: DEMO_APPLICATIONS[k].scheme
    })),
    demos: DEMO_APPLICATIONS
  });
});

/**
 * POST /api/demo-application
 * Runs verification on a selected demo scenario
 */
router.post('/demo-application', (req, res) => {
  try {
    const requestedKey = (req.body.scenario || "DEMO_1_ELIGIBLE").toUpperCase();
    let demoApp = DEMO_APPLICATIONS[requestedKey];

    if (!demoApp) {
      if (requestedKey.includes("INELIGIBLE") || requestedKey === "2") {
        demoApp = DEMO_APPLICATIONS.DEMO_2_INELIGIBLE;
      } else if (requestedKey.includes("HUMAN") || requestedKey === "3") {
        demoApp = DEMO_APPLICATIONS.DEMO_3_HUMAN_REVIEW;
      } else if (requestedKey.includes("INCOMPLETE") || requestedKey === "4") {
        demoApp = DEMO_APPLICATIONS.DEMO_4_INCOMPLETE;
      } else {
        demoApp = DEMO_APPLICATIONS.DEMO_1_ELIGIBLE;
      }
    }

    const verificationResult = verifyApplication(demoApp);
    res.json({
      scenarioKey: requestedKey,
      scenarioName: demoApp.scenarioName,
      application: demoApp,
      verificationResult
    });
  } catch (err) {
    res.status(500).json({ error: "Demo evaluation failed", message: err.message });
  }
});

module.exports = router;

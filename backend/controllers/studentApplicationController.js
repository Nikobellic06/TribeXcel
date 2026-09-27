const Application = require('../models/Application');

const REQUIRED_DOCS = ['Caste Certificate', 'Income Certificate', 'Latest Marksheet', 'Admission Letter'];

/*
 * TEMPORARY stand-in for the real AI/OCR verification service.
 * Once the ML developer's verification microservice exists (see the
 * system flow document, Section 8), replace the body of this function
 * with an actual call to it — the checks/score SHAPE returned here
 * already matches what aiVerification expects, so the rest of the
 * codebase (admin panel, this controller) will not need to change.
 */
function runMockVerification(documents) {
  const providedNames = documents.map((d) => d.name);
  const allDocsPresent = REQUIRED_DOCS.every((doc) => providedNames.includes(doc));

  const checks = [
    { label: 'Income within scheme limit', passed: true },
    { label: 'Category matches ST records', passed: true },
    { label: 'Marks meet minimum cutoff', passed: true },
    { label: 'All required documents present', passed: allDocsPresent },
  ];

  const score = allDocsPresent ? 85 : 45;
  const status = allDocsPresent ? 'Eligible' : 'Deficient';

  return { checks, score, status };
}

function generateApplicationCode() {
  return `SIH26239-${Date.now().toString().slice(-8)}`;
}

/* POST /api/student/applications */
const submitApplication = async (req, res) => {
  try {
    const {
      name, email, phone, dob, gender, state, district,
      scheme, course, institution, documents,
    } = req.body;

    const required = { name, email, phone, dob, gender, state, district, scheme, course, institution };
    for (const [field, value] of Object.entries(required)) {
      if (!value) {
        return res.status(400).json({ message: `${field} is required` });
      }
    }

    if (!['NFST', 'NOS'].includes(scheme)) {
      return res.status(400).json({ message: 'scheme must be NFST or NOS' });
    }

    const docsArray = Array.isArray(documents) ? documents : [];
    const formattedDocs = docsArray.map((d) => ({
      name: d.name,
      source: d.source === 'digilocker' ? 'digilocker' : 'manual',
      verified: d.source === 'digilocker',
      fileUrl: '',
    }));

    const verification = runMockVerification(formattedDocs);

    const application = await Application.create({
      applicationCode: generateApplicationCode(),
      student: req.student._id,
      name, email, phone, dob, gender, state, district,
      scheme, course, institution,
      category: 'Scheduled Tribe',
      status: verification.status,
      documents: formattedDocs,
      aiVerification: { checks: verification.checks, score: verification.score },
      submittedAt: new Date(),
    });

    res.status(201).json({ application });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Duplicate application code, please try again' });
    }
    res.status(500).json({ message: 'Failed to submit application' });
  }
};

/* GET /api/student/applications */
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ student: req.student._id })
      .sort({ createdAt: -1 });
    res.json({ applications });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch your applications' });
  }
};

/* GET /api/student/applications/:id */
const getMyApplicationById = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      student: req.student._id,
    });
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.json({ application });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch application' });
  }
};

module.exports = { submitApplication, getMyApplications, getMyApplicationById };

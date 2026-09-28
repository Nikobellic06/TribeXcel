const ApplicationDraft = require('../models/ApplicationDraft');
const Application = require('../models/Application');

const SCHEMES = ['NFST', 'NOS', 'PRE_MATRIC'];
const STEPS = ['personal', 'category', 'academic', 'bank', 'documents', 'review'];

function schemeFrom(req, res) {
  const scheme = String(req.params.scheme || '').toUpperCase();
  if (!SCHEMES.includes(scheme)) {
    res.status(400).json({ message: 'Unknown scheme' });
    return null;
  }
  return scheme;
}

/* GET /api/student/drafts — all drafts of the student, without form data */
const listDrafts = async (req, res) => {
  try {
    const drafts = await ApplicationDraft.find({ student: req.student._id })
      .select('scheme session currentStep completedSteps updatedAt')
      .sort({ updatedAt: -1 });
    res.json({ drafts });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch drafts' });
  }
};

/* GET /api/student/drafts/:scheme */
const getDraft = async (req, res) => {
  const scheme = schemeFrom(req, res);
  if (!scheme) return;
  try {
    const draft = await ApplicationDraft.findOne({ student: req.student._id, scheme });
    res.json({ draft: draft || null });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch draft' });
  }
};

/* PUT /api/student/drafts/:scheme   body: { data, currentStep, completedSteps } */
const saveDraft = async (req, res) => {
  const scheme = schemeFrom(req, res);
  if (!scheme) return;
  try {
    const { data, currentStep, completedSteps } = req.body || {};
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return res.status(400).json({ message: 'Draft data must be an object' });
    }
    const steps = Array.isArray(completedSteps) ? completedSteps.filter((s) => STEPS.includes(s)) : [];

    // No drafts once an application for this scheme is already under process.
    const locked = await Application.findOne({
      student: req.student._id,
      scheme,
      status: { $in: ['Pending', 'Eligible', 'Flagged', 'Selected', 'Rejected'] },
    });
    if (locked) {
      return res.status(409).json({ message: 'An application for this scheme is already submitted' });
    }

    const draft = await ApplicationDraft.findOneAndUpdate(
      { student: req.student._id, scheme },
      {
        $set: {
          data,
          currentStep: STEPS.includes(currentStep) ? currentStep : '',
          completedSteps: steps,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json({ draft });
  } catch (err) {
    res.status(500).json({ message: 'Failed to save draft' });
  }
};

/* DELETE /api/student/drafts/:scheme */
const deleteDraft = async (req, res) => {
  const scheme = schemeFrom(req, res);
  if (!scheme) return;
  try {
    await ApplicationDraft.deleteOne({ student: req.student._id, scheme });
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete draft' });
  }
};

module.exports = { listDrafts, getDraft, saveDraft, deleteDraft };

const Application = require('../models/Application');

/* GET /api/applications?status=&scheme=&state=&search=&page=&limit= */
const getApplications = async (req, res) => {
  try {
    const { status, scheme, state, search, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status && status !== 'All') filter.status = status;
    if (scheme && scheme !== 'All') filter.scheme = scheme;
    if (state && state !== 'All') filter.state = state;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { applicationCode: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));

    const [data, total] = await Promise.all([
      Application.find(filter)
        .sort({ submittedAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .select('-documents -aiVerification.checks'),
      Application.countDocuments(filter),
    ]);

    res.json({
      data,
      total,
      page: pageNum,
      totalPages: Math.max(1, Math.ceil(total / limitNum)),
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
};

/* GET /api/applications/:id */
const getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.json(application);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch application' });
  }
};

/* PATCH /api/applications/:id/status  body: { status, adminRemarks? } */
const updateStatus = async (req, res) => {
  try {
    const { status, adminRemarks } = req.body;
    const allowed = ['Pending', 'Eligible', 'Deficient', 'Flagged', 'Selected', 'Rejected'];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const update = { status };
    if (typeof adminRemarks === 'string') update.adminRemarks = adminRemarks;

    const application = await Application.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.json(application);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update status' });
  }
};

/* PATCH /api/applications/bulk-status  body: { ids: [...], status } */
const bulkUpdateStatus = async (req, res) => {
  try {
    const { ids, status } = req.body;
    const allowed = ['Pending', 'Eligible', 'Deficient', 'Flagged', 'Selected', 'Rejected'];

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'ids must be a non-empty array' });
    }
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const result = await Application.updateMany({ _id: { $in: ids } }, { status });
    res.json({ matched: result.matchedCount, modified: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ message: 'Failed to bulk update status' });
  }
};

/* GET /api/merit-list?scheme=NFST */
const getMeritList = async (req, res) => {
  try {
    const { scheme } = req.query;
    if (!scheme) {
      return res.status(400).json({ message: 'scheme query param is required' });
    }

    const candidates = await Application.find({
      scheme,
      status: { $in: ['Eligible', 'Selected'] },
    })
      .select('applicationCode name state scheme status meritScores')
      .lean();

    res.json({ scheme, count: candidates.length, candidates });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch merit list' });
  }
};

/* PATCH /api/applications/finalize-selection  body: { ids: [...], scheme } */
const finalizeSelection = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'ids must be a non-empty array' });
    }

    const result = await Application.updateMany(
      { _id: { $in: ids } },
      { status: 'Selected' }
    );
    res.json({ selected: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ message: 'Failed to finalise selection' });
  }
};

/* GET /api/analytics/summary */
const getAnalyticsSummary = async (req, res) => {
  try {
    const [statusCounts, stateCounts, schemeStatusCounts, total] = await Promise.all([
      Application.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Application.aggregate([{ $group: { _id: '$state', count: { $sum: 1 } } }]),
      Application.aggregate([
        { $group: { _id: { scheme: '$scheme', status: '$status' }, count: { $sum: 1 } } },
      ]),
      Application.countDocuments(),
    ]);

    const byStatus = {};
    statusCounts.forEach((s) => {
      byStatus[s._id] = s.count;
    });

    // Reshape scheme + status combo counts into one row per scheme
    const schemeMap = {};
    schemeStatusCounts.forEach(({ _id, count }) => {
      const { scheme, status } = _id;
      if (!schemeMap[scheme]) {
        schemeMap[scheme] = { scheme, received: 0, verified: 0, selected: 0 };
      }
      schemeMap[scheme].received += count;
      if (status !== 'Pending') schemeMap[scheme].verified += count;
      if (status === 'Selected') schemeMap[scheme].selected += count;
    });

    const processed =
      (byStatus.Eligible || 0) +
      (byStatus.Selected || 0) +
      (byStatus.Deficient || 0) +
      (byStatus.Flagged || 0);
    const passedFirstPass = (byStatus.Eligible || 0) + (byStatus.Selected || 0);

    const verificationAccuracy = processed > 0 ? Number(((passedFirstPass / processed) * 100).toFixed(1)) : 0;
    const resubmissionRate = total > 0 ? Number((((byStatus.Deficient || 0) / total) * 100).toFixed(1)) : 0;

    // Average days between submission and last update, for decided applications
    const decided = await Application.find({ status: { $in: ['Selected', 'Rejected'] } })
      .select('submittedAt updatedAt')
      .lean();
    let avgProcessingDays = 0;
    if (decided.length > 0) {
      const totalDays = decided.reduce((sum, doc) => {
        const days = (new Date(doc.updatedAt) - new Date(doc.submittedAt)) / (1000 * 60 * 60 * 24);
        return sum + Math.max(0, days);
      }, 0);
      avgProcessingDays = Number((totalDays / decided.length).toFixed(1));
    }

    res.json({
      total,
      pendingReview: byStatus.Eligible || 0,
      deficient: byStatus.Deficient || 0,
      selected: byStatus.Selected || 0,
      flagged: byStatus.Flagged || 0,
      pending: byStatus.Pending || 0,
      rejected: byStatus.Rejected || 0,
      stateWise: stateCounts.map((s) => ({ state: s._id, count: s.count })),
      schemeWise: Object.values(schemeMap),
      kpis: {
        verificationAccuracy,
        resubmissionRate,
        avgProcessingDays,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to compute analytics summary' });
  }
};

/* GET /api/analytics/trend  — daily counts for the last N days (default 30) */
const getAnalyticsTrend = async (req, res) => {
  try {
    const days = Math.min(90, parseInt(req.query.days, 10) || 30);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const raw = await Application.aggregate([
      { $match: { submittedAt: { $gte: since } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$submittedAt' } },
          },
          received: { $sum: 1 },
          selected: {
            $sum: { $cond: [{ $eq: ['$status', 'Selected'] }, 1, 0] },
          },
        },
      },
      { $sort: { '_id.date': 1 } },
    ]);

    const trend = raw.map((row) => ({
      date: row._id.date,
      received: row.received,
      selected: row.selected,
    }));

    res.json({ days, trend });
  } catch (err) {
    res.status(500).json({ message: 'Failed to compute trend' });
  }
};

module.exports = {
  getApplications,
  getApplicationById,
  updateStatus,
  bulkUpdateStatus,
  getMeritList,
  finalizeSelection,
  getAnalyticsSummary,
  getAnalyticsTrend,
};

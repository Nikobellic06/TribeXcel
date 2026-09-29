const fs = require('fs');
const path = require('path');
const Application = require('../models/Application');
const ApplicationDraft = require('../models/ApplicationDraft');
const Student = require('../models/Student');
const Admin = require('../models/Admin');
const Document = require('../models/Document');
const AuditLog = require('../models/AuditLog');
const { logAuditEvent } = require('../services/auditService');
const aiAnalysis = require('../services/aiAnalysis');
const review = require('../services/review');
const { SCHEME_RULES } = require('../config/schemeRules');

/*
 * Admin portal API. The officer is the final authority: AI analysis and rule
 * evaluation are shown as preliminary results, and every status change is
 * recorded in reviewHistory with the officer's identity.
 *
 * Status values (shared with the student portal):
 *   Pending   -> Pending review          Flagged  -> Human review (AI / rules flagged)
 *   Deficient -> Correction required     Eligible -> Verified by officer
 *   Selected  -> Selected (merit)        Rejected -> Rejected
 */

const STATUSES = ['Pending', 'Eligible', 'Deficient', 'Flagged', 'Selected', 'Rejected'];
const VIEWS = {
  all: null,
  pending: ['Pending'],
  flagged: ['Flagged'],
  defective: ['Deficient'],
  verified: ['Eligible', 'Selected'],
  rejected: ['Rejected'],
};
const PRIORITY_RANK = { high: 0, medium: 1, normal: 2 };
const DAY = 24 * 60 * 60 * 1000;

const DEFECT_CATEGORIES = [
  'Missing document',
  'Illegible or poor-quality document',
  'Information mismatch',
  'Invalid or expired certificate',
  'Incorrect bank details',
  'Incomplete academic information',
  'Other',
];
const REJECTION_REASONS = [
  'Does not meet income criteria',
  'Does not meet age criteria',
  'Does not meet academic criteria',
  'Not a Scheduled Tribe applicant',
  'Receiving another scholarship / fellowship',
  'Duplicate application',
  'False or forged information',
  'Other',
];

const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const officer = (admin) => ({ byId: admin._id, byName: admin.name, byRole: admin.role === 'super-admin' ? 'Super Administrator' : admin.designation || 'Scholarship Officer' });

function maskAccount(value) {
  const s = String(value || '');
  return s.length <= 4 ? s : `${'X'.repeat(s.length - 4)}${s.slice(-4)}`;
}

/* Application for admin eyes: bank account masked, internal fields trimmed. */
function sanitize(app) {
  const out = { ...app };
  const bank = out.schemeData?.sections?.bank;
  if (bank?.accountNumber) {
    out.schemeData = {
      ...out.schemeData,
      sections: { ...out.schemeData.sections, bank: { ...bank, accountNumber: maskAccount(bank.accountNumber), accountLast4: String(bank.accountNumber).slice(-4) } },
    };
  }
  delete out.meritScores;
  return out;
}

function buildFilter(q) {
  const filter = {};
  const view = VIEWS[q.view] !== undefined ? VIEWS[q.view] : null;
  if (q.status && q.status !== 'All' && STATUSES.includes(q.status)) filter.status = q.status;
  else if (view) filter.status = { $in: view };
  if (q.scheme && q.scheme !== 'All') filter.scheme = q.scheme;
  if (q.state && q.state !== 'All') filter.state = q.state;
  if (q.category && q.category !== 'All') filter.category = q.category;
  if (q.priority && q.priority !== 'All') filter.reviewPriority = q.priority;
  if (q.aiResult && q.aiResult !== 'All') filter.aiPreliminary = q.aiResult;
  if (q.dateFrom || q.dateTo) {
    filter.submittedAt = {};
    if (q.dateFrom) filter.submittedAt.$gte = new Date(q.dateFrom);
    if (q.dateTo) filter.submittedAt.$lte = new Date(new Date(q.dateTo).getTime() + DAY - 1);
  }
  if (q.search && String(q.search).trim()) {
    const rx = { $regex: escapeRegex(String(q.search).trim()), $options: 'i' };
    filter.$or = [{ name: rx }, { applicationCode: rx }, { email: rx }, { phone: rx }];
  }
  return filter;
}

const LIST_FIELDS =
  'applicationCode name email phone scheme category state district course institution status submittedAt updatedAt lastActionAt reviewPriority rulePreliminary aiPreliminary reviewFlags resubmissionCount adminRemarks session';

/* GET /api/applications?view=&status=&scheme=&aiResult=&priority=&category=&dateFrom=&dateTo=&search=&page=&limit= */
const getApplications = async (req, res) => {
  try {
    const filter = buildFilter(req.query);
    const pageNum = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const [data, total] = await Promise.all([
      Application.find(filter).sort({ submittedAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum).select(LIST_FIELDS).lean(),
      Application.countDocuments(filter),
    ]);
    res.json({ data, total, page: pageNum, totalPages: Math.max(1, Math.ceil(total / limitNum)) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
};

/* GET /api/applications/counts — for the sidebar and dashboard cards */
const getCounts = async (req, res) => {
  try {
    const rows = await Application.find({}).select('status').lean();
    const by = {};
    rows.forEach((r) => {
      by[r.status] = (by[r.status] || 0) + 1;
    });
    res.json({
      all: rows.length,
      pending: by.Pending || 0,
      flagged: by.Flagged || 0,
      defective: by.Deficient || 0,
      verified: (by.Eligible || 0) + (by.Selected || 0),
      rejected: by.Rejected || 0,
      selected: by.Selected || 0,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to count applications' });
  }
};

/* GET /api/review-queue?priority=&scheme=&page=&limit=  — applications awaiting an officer, highest priority first, oldest first */
const getReviewQueue = async (req, res) => {
  try {
    const filter = { status: { $in: ['Pending', 'Flagged'] } };
    if (req.query.scheme && req.query.scheme !== 'All') filter.scheme = req.query.scheme;
    if (req.query.priority && req.query.priority !== 'All') filter.reviewPriority = req.query.priority;
    const rows = await Application.find(filter).select(LIST_FIELDS).lean();
    rows.sort((a, b) => (PRIORITY_RANK[a.reviewPriority] ?? 2) - (PRIORITY_RANK[b.reviewPriority] ?? 2) || new Date(a.submittedAt) - new Date(b.submittedAt));
    const pageNum = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    res.json({
      data: rows.slice((pageNum - 1) * limitNum, pageNum * limitNum),
      total: rows.length,
      page: pageNum,
      totalPages: Math.max(1, Math.ceil(rows.length / limitNum)),
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch the review queue' });
  }
};

/* GET /api/applications/:id — application + full review picture */
const getApplicationById = async (req, res) => {
  try {
    const app = await Application.findById(req.params.id).lean();
    if (!app) return res.status(404).json({ message: 'Application not found' });
    const student = app.student ? await Student.findById(app.student).select('name dob aadhaarVerified aadhaarLast4 aadhaarVerifiedAt').lean() : null;
    const assessment = review.assess(app, student);
    res.json({
      ...sanitize(app),
      review: assessment,
      applicant: student
        ? { aadhaarVerified: Boolean(student.aadhaarVerified), aadhaarLast4: student.aadhaarLast4 || '', aadhaarVerifiedAt: student.aadhaarVerifiedAt }
        : null,
      schemeRules: SCHEME_RULES[app.scheme] || null,
      decisionOptions: { defectCategories: DEFECT_CATEGORIES, rejectionReasons: REJECTION_REASONS },
    });
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ message: 'Application not found' });
    res.status(500).json({ message: 'Failed to fetch application' });
  }
};

/*
 * POST /api/applications/:id/decision
 *   { decision: 'verify', remarks? }
 *   { decision: 'defective', defectCategory, reason, requiredCorrection, remarks? }
 *   { decision: 'reject', rejectionReason, remarks }
 */
const decide = async (req, res) => {
  try {
    const { decision } = req.body || {};
    const text = (v) => (typeof v === 'string' ? v.trim() : '');
    const remarks = text(req.body.remarks);
    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ message: 'Application not found' });
    if (app.status === 'Selected') return res.status(409).json({ message: 'This application is already selected; no further decision can be recorded.' });

    const event = { ...officer(req.admin), fromStatus: app.status, remarks, at: new Date() };
    if (decision === 'verify') {
      if (!['Pending', 'Flagged'].includes(app.status)) {
        return res.status(409).json({ message: `An application in status "${app.status}" cannot be verified.` });
      }
      app.status = 'Eligible';
      app.adminRemarks = remarks;
      event.action = 'Verified by officer';
    } else if (decision === 'defective') {
      const category = text(req.body.defectCategory);
      const reason = text(req.body.reason);
      const correction = text(req.body.requiredCorrection);
      if (!DEFECT_CATEGORIES.includes(category)) return res.status(400).json({ message: 'Select a defect category.' });
      if (reason.length < 10) return res.status(400).json({ message: 'Give the reason for the defect (at least 10 characters).' });
      if (correction.length < 5) return res.status(400).json({ message: 'State the correction the applicant must make.' });
      if (!['Pending', 'Flagged', 'Eligible'].includes(app.status)) {
        return res.status(409).json({ message: `An application in status "${app.status}" cannot be marked defective.` });
      }
      app.status = 'Deficient';
      app.adminRemarks = `${category}: ${reason}. Required correction: ${correction}${remarks ? `. ${remarks}` : ''}`;
      Object.assign(event, { action: 'Marked defective', category, reason, requiredCorrection: correction });

      // Structured deficiency record
      if (!Array.isArray(app.deficiencies)) app.deficiencies = [];
      const defId = `DEF-${Date.now().toString().slice(-6)}`;
      app.deficiencies.push({
        deficiencyId: defId,
        targetType: req.body.targetType || 'DOCUMENT',
        targetId: req.body.targetId || 'general',
        targetLabel: req.body.targetLabel || category,
        issue: reason,
        actionRequired: correction,
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        status: 'OPEN',
        raisedAt: event.at,
        raisedBy: { id: req.admin._id, name: req.admin.name, role: req.admin.role },
      });
    } else if (decision === 'reject') {
      const reason = text(req.body.rejectionReason);
      if (app.status === 'Rejected') return res.status(409).json({ message: 'This application is already rejected.' });
      if (!REJECTION_REASONS.includes(reason)) return res.status(400).json({ message: 'Select a rejection reason.' });
      if (remarks.length < 10) return res.status(400).json({ message: 'Officer remarks are required for a rejection (at least 10 characters).' });
      app.status = 'Rejected';
      app.adminRemarks = `${reason}. ${remarks}`;
      Object.assign(event, { action: 'Rejected', reason });
    } else {
      return res.status(400).json({ message: 'decision must be verify, defective or reject' });
    }

    event.toStatus = app.status;
    app.reviewHistory.push(event);
    app.lastActionAt = event.at;
    await app.save();

    await logAuditEvent({
      userId: req.admin._id,
      userName: req.admin.name,
      userRole: req.admin.role || 'Officer',
      action: `OFFICER_DECISION_${decision.toUpperCase()}`,
      entityType: 'Application',
      entityId: app._id,
      oldValue: { status: event.fromStatus },
      newValue: { status: app.status },
      ipAddress: req.ip || '',
      reason: remarks || req.body.reason || 'Officer review decision',
    });

    res.json({ message: 'Decision recorded', status: app.status, adminRemarks: app.adminRemarks, reviewHistory: app.reviewHistory });
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ message: 'Application not found' });
    res.status(500).json({ message: 'Failed to record the decision' });
  }
};

/* POST /api/applications/:id/reanalyze  { includeFiles?: true } — re-runs AI-assisted analysis; never changes the status */
const reanalyze = async (req, res) => {
  try {
    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ message: 'Application not found' });
    const includeFiles = req.body?.includeFiles !== false;
    const { analysis, raw } = await aiAnalysis.run(app.toObject(), { includeFiles });
    app.aiAnalysis = analysis;
    if (raw?.aiVerification) app.aiVerification = { checks: raw.aiVerification.checks || [], score: raw.aiVerification.score || 0 };
    const student = app.student ? await Student.findById(app.student).select('name dob aadhaarVerified aadhaarLast4').lean() : null;
    const assessment = review.assess(app.toObject(), student);
    review.applySummary(app, assessment);
    app.reviewHistory.push({ ...officer(req.admin), action: 'AI-assisted analysis re-run', fromStatus: app.status, toStatus: app.status, remarks: analysis.status === 'completed' ? 'Analysis completed' : analysis.reason || '', at: new Date() });
    await app.save();
    res.json({ aiAnalysis: analysis, review: assessment });
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ message: 'Application not found' });
    res.status(500).json({ message: 'Failed to run the analysis' });
  }
};

/* PATCH /api/applications/:id/status  { status, adminRemarks } — kept for older clients */
const updateStatus = async (req, res) => {
  try {
    const { status, adminRemarks } = req.body || {};
    if (!STATUSES.includes(status)) return res.status(400).json({ message: 'Invalid status value' });
    if (['Deficient', 'Rejected'].includes(status) && !(typeof adminRemarks === 'string' && adminRemarks.trim().length >= 10)) {
      return res.status(400).json({ message: 'A reason (adminRemarks, at least 10 characters) is required to mark an application defective or rejected.' });
    }
    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ message: 'Application not found' });
    const fromStatus = app.status;
    app.status = status;
    if (typeof adminRemarks === 'string') app.adminRemarks = adminRemarks.trim();
    app.lastActionAt = new Date();
    app.reviewHistory.push({ ...officer(req.admin), action: 'Status changed', fromStatus, toStatus: status, remarks: adminRemarks || '', at: app.lastActionAt });
    await app.save();
    res.json(app);
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ message: 'Application not found' });
    res.status(500).json({ message: 'Failed to update status' });
  }
};

/* PATCH /api/applications/bulk-status  { ids, status } — defective / rejected need individual reasons */
const bulkUpdateStatus = async (req, res) => {
  try {
    const { ids, status } = req.body || {};
    if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ message: 'ids must be a non-empty array' });
    if (!['Pending', 'Flagged', 'Eligible'].includes(status)) {
      return res.status(400).json({ message: 'Bulk updates are limited to Pending, Flagged or Eligible. Defective and rejected decisions need individual reasons.' });
    }
    const result = await Application.updateMany({ _id: { $in: ids }, status: { $ne: 'Selected' } }, { status, lastActionAt: new Date() });
    res.json({ matched: result.matchedCount, modified: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ message: 'Failed to bulk update status' });
  }
};

/* GET /api/merit-list?scheme=NFST — verified candidates ranked by the scheme's own merit basis */
const getMeritList = async (req, res) => {
  try {
    const { scheme } = req.query;
    const rules = SCHEME_RULES[scheme];
    if (!rules) return res.status(400).json({ message: 'scheme must be NFST, NOS or PRE_MATRIC' });
    const apps = await Application.find({ scheme, status: { $in: ['Eligible', 'Selected'] } })
      .select('applicationCode name state gender status declaredMarks schemeData course institution submittedAt rulePreliminary')
      .lean();
    const num = (v) => (v === undefined || v === null || v === '' || !Number.isFinite(Number(v)) ? null : Number(v));
    const candidates = apps.map((a) => {
      const s = a.schemeData?.sections || {};
      const ac = s.academic || {};
      const cat = s.category || {};
      const marks = num(a.declaredMarks ?? (ac.gradeType === 'cgpa' ? ac.convertedPercentage : ac.percentage));
      return {
        _id: a._id,
        applicationCode: a.applicationCode,
        name: a.name,
        state: a.state,
        gender: a.gender,
        status: a.status,
        course: a.course,
        institution: a.institution,
        qualification: [ac.pgDegree || ac.qualifyingDegree, ac.pgUniversity || ac.qualifyingUniversity].filter(Boolean).join(', ') || null,
        marks,
        qsRank: scheme === 'NOS' ? num(ac.qsRank) : null,
        fieldOfStudy: ac.fieldOfStudy || null,
        isPVTG: cat.isPVTG === 'yes',
        hasDisability: cat.hasDisability === 'yes',
        rulePreliminary: a.rulePreliminary || null,
      };
    });
    const nullsLast = (x, y, dir) => (x === null && y === null ? 0 : x === null ? 1 : y === null ? -1 : dir * (x - y));
    if (scheme === 'NFST') candidates.sort((a, b) => nullsLast(a.marks, b.marks, -1));
    if (scheme === 'NOS') candidates.sort((a, b) => nullsLast(a.qsRank, b.qsRank, 1) || nullsLast(a.marks, b.marks, -1));
    res.json({
      scheme,
      schemeName: rules.name,
      meritBased: rules.meritBased,
      basis: rules.meritBasis || null,
      seats: rules.seats,
      count: candidates.length,
      candidates,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch merit list' });
  }
};

/* PATCH /api/applications/finalize-selection  { ids } — only verified applications can be selected */
const finalizeSelection = async (req, res) => {
  try {
    const { ids } = req.body || {};
    if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ message: 'ids must be a non-empty array' });
    const apps = await Application.find({ _id: { $in: ids }, status: 'Eligible' });
    const at = new Date();
    for (const app of apps) {
      app.status = 'Selected';
      app.lastActionAt = at;
      app.reviewHistory.push({ ...officer(req.admin), action: 'Selected in merit list', fromStatus: 'Eligible', toStatus: 'Selected', at });
      await app.save();
    }
    res.json({ selected: apps.length, skipped: ids.length - apps.length });
  } catch (err) {
    res.status(500).json({ message: 'Failed to finalise selection' });
  }
};

/*
 * GET /api/analytics/summary
 * Computed in Node from a small projection — adequate for prototype volumes;
 * move to MongoDB aggregations when data grows.
 */
const getAnalyticsSummary = async (req, res) => {
  try {
    const [apps, drafts] = await Promise.all([
      Application.find({}).select('status scheme state submittedAt updatedAt lastActionAt reviewPriority aiPreliminary rulePreliminary reviewFlags resubmissionCount').lean(),
      ApplicationDraft.countDocuments({}),
    ]);
    const total = apps.length;
    const byStatus = {};
    const schemeMap = {};
    const stateMap = {};
    const issues = {};
    const ai = { NO_ISSUES_DETECTED: 0, REQUIRES_HUMAN_REVIEW: 0, INCOMPLETE: 0, UNAVAILABLE: 0, NOT_APPLICABLE: 0, NOT_RUN: 0 };
    const priority = { high: 0, medium: 0, normal: 0 };
    let resubmitted = 0;

    apps.forEach((a) => {
      byStatus[a.status] = (byStatus[a.status] || 0) + 1;
      const sm = (schemeMap[a.scheme] ||= { scheme: a.scheme, received: 0, pending: 0, flagged: 0, defective: 0, verified: 0, selected: 0, rejected: 0 });
      sm.received += 1;
      if (a.status === 'Pending') sm.pending += 1;
      if (a.status === 'Flagged') sm.flagged += 1;
      if (a.status === 'Deficient') sm.defective += 1;
      if (a.status === 'Eligible' || a.status === 'Selected') sm.verified += 1;
      if (a.status === 'Selected') sm.selected += 1;
      if (a.status === 'Rejected') sm.rejected += 1;
      if (a.state) stateMap[a.state] = (stateMap[a.state] || 0) + 1;
      ai[a.aiPreliminary || 'NOT_RUN'] = (ai[a.aiPreliminary || 'NOT_RUN'] || 0) + 1;
      priority[a.reviewPriority || 'normal'] += 1;
      if ((a.resubmissionCount || 0) > 0) resubmitted += 1;
      (a.reviewFlags || []).forEach((f) => {
        issues[f.code] = (issues[f.code] || 0) + 1;
      });
    });

    const decided = apps.filter((a) => ['Eligible', 'Selected', 'Rejected', 'Deficient'].includes(a.status));
    const avgProcessingDays = decided.length
      ? Number((decided.reduce((sum, a) => sum + Math.max(0, (new Date(a.lastActionAt || a.updatedAt) - new Date(a.submittedAt)) / DAY), 0) / decided.length).toFixed(1))
      : 0;
    const needingHuman = (byStatus.Flagged || 0) + (byStatus.Deficient || 0);
    const pct = (n) => (total ? Number(((n / total) * 100).toFixed(1)) : 0);

    res.json({
      total,
      drafts,
      pending: byStatus.Pending || 0,
      flagged: byStatus.Flagged || 0,
      deficient: byStatus.Deficient || 0,
      verified: (byStatus.Eligible || 0) + (byStatus.Selected || 0),
      selected: byStatus.Selected || 0,
      rejected: byStatus.Rejected || 0,
      awaitingAction: (byStatus.Pending || 0) + (byStatus.Flagged || 0),
      byStatus,
      schemeWise: Object.values(schemeMap),
      stateWise: Object.entries(stateMap).map(([state, count]) => ({ state, count })).sort((a, b) => b.count - a.count),
      aiSummary: ai,
      priority,
      issueCategories: Object.entries(issues).map(([code, count]) => ({ code, count })).sort((a, b) => b.count - a.count),
      kpis: {
        humanReviewRate: pct(needingHuman),
        resubmissionRate: pct(resubmitted),
        avgProcessingDays,
        decided: decided.length,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to compute analytics summary' });
  }
};

/* GET /api/analytics/trend?days=30 — daily received / verified / flagged / defective */
const getAnalyticsTrend = async (req, res) => {
  try {
    const days = Math.min(90, Math.max(7, parseInt(req.query.days, 10) || 30));
    const since = new Date(Date.now() - days * DAY);
    const apps = await Application.find({ submittedAt: { $gte: since } }).select('submittedAt status').lean();
    const map = {};
    for (let i = days - 1; i >= 0; i -= 1) {
      const d = new Date(Date.now() - i * DAY).toISOString().slice(0, 10);
      map[d] = { date: d, received: 0, verified: 0, flagged: 0, defective: 0 };
    }
    apps.forEach((a) => {
      const d = new Date(a.submittedAt).toISOString().slice(0, 10);
      if (!map[d]) return;
      map[d].received += 1;
      if (a.status === 'Eligible' || a.status === 'Selected') map[d].verified += 1;
      if (a.status === 'Flagged') map[d].flagged += 1;
      if (a.status === 'Deficient') map[d].defective += 1;
    });
    res.json({ days, trend: Object.values(map) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to compute trend' });
  }
};

/*
 * GET /api/notifications — derived from application data (no push service):
 * new submissions, high-priority reviews, corrections submitted, document
 * issues and applications waiting more than 7 days.
 */
const getNotifications = async (req, res) => {
  try {
    const now = Date.now();
    const apps = await Application.find({ status: { $in: ['Pending', 'Flagged'] } })
      .select('applicationCode name scheme status submittedAt lastResubmittedAt reviewPriority reviewFlags')
      .lean();
    const items = [];
    apps.forEach((a) => {
      const base = { applicationId: a._id, applicationCode: a.applicationCode, name: a.name, scheme: a.scheme };
      if (a.lastResubmittedAt && now - new Date(a.lastResubmittedAt) < 14 * DAY) {
        items.push({ ...base, type: 'correction', title: 'Correction submitted', at: a.lastResubmittedAt });
      } else if (now - new Date(a.submittedAt) < 7 * DAY) {
        items.push({ ...base, type: 'new', title: 'New application received', at: a.submittedAt });
      }
      if (a.reviewPriority === 'high') {
        const top = (a.reviewFlags || []).find((f) => f.severity === 'high');
        items.push({ ...base, type: 'review', title: 'Human review required', detail: top?.title || '', at: a.submittedAt });
      }
      const docIssue = (a.reviewFlags || []).find((f) => ['LOW_QUALITY_DOCUMENT', 'OCR_INSUFFICIENT', 'MISSING_DOCUMENTS'].includes(f.code));
      if (docIssue) items.push({ ...base, type: 'document', title: 'Document issue', detail: docIssue.title, at: a.submittedAt });
      if (now - new Date(a.submittedAt) > 7 * DAY) {
        items.push({ ...base, type: 'waiting', title: 'Awaiting action for more than 7 days', at: a.submittedAt });
      }
    });
    items.sort((x, y) => new Date(y.at) - new Date(x.at));
    const seen = req.admin.lastNotificationsSeenAt ? new Date(req.admin.lastNotificationsSeenAt) : null;
    const unread = items.filter((i) => !seen || new Date(i.at) > seen).length;
    res.json({ items: items.slice(0, 30), unread, total: items.length });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load notifications' });
  }
};

/* PATCH /api/notifications/seen */
const markNotificationsSeen = async (req, res) => {
  try {
    const seenAt = new Date();
    await Admin.updateOne({ _id: req.admin._id }, { $set: { lastNotificationsSeenAt: seenAt } });
    res.json({ seenAt });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update notifications' });
  }
};

/* GET /api/audit-logs */
const getAuditLogs = async (req, res) => {
  try {
    const pageNum = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 25));
    const filter = {};
    if (req.query.entityType) filter.entityType = req.query.entityType;
    if (req.query.action) filter.action = req.query.action;
    if (req.query.entityId) filter.entityId = req.query.entityId;

    const [logs, total] = await Promise.all([
      AuditLog.find(filter).sort({ timestamp: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum).lean(),
      AuditLog.countDocuments(filter),
    ]);

    res.json({ logs, total, page: pageNum, totalPages: Math.max(1, Math.ceil(total / limitNum)) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve audit logs' });
  }
};

/* POST /api/applications/:id/documents/:docType/verify */
const verifyDocumentItem = async (req, res) => {
  try {
    const { id, docType } = req.params;
    const { status, remarks } = req.body;
    const app = await Application.findById(id);
    if (!app) return res.status(404).json({ message: 'Application not found' });

    const docIndex = app.documents.findIndex((d) => (d.docType || d.name) === docType);
    if (docIndex === -1) return res.status(404).json({ message: 'Document not found in application' });

    const targetDoc = app.documents[docIndex];
    targetDoc.verificationStatus = status;
    targetDoc.verified = status === 'VERIFIED';
    targetDoc.verificationMethod = 'OFFICER_MANUAL';

    await Document.updateOne(
      { studentId: app.student, documentType: docType },
      {
        $set: {
          verificationStatus: status,
          verificationMethod: 'OFFICER_MANUAL',
          verifiedAt: new Date(),
          verifiedBy: { id: req.admin._id, name: req.admin.name, role: req.admin.role },
        },
      }
    );

    app.reviewHistory.push({
      ...officer(req.admin),
      action: `Document ${docType} marked ${status}`,
      fromStatus: app.status,
      toStatus: app.status,
      remarks: remarks || '',
      at: new Date(),
    });

    await app.save();

    await logAuditEvent({
      userId: req.admin._id,
      userName: req.admin.name,
      userRole: req.admin.role,
      action: `DOCUMENT_SCRUTINY_${status}`,
      entityType: 'Document',
      entityId: `${app._id}-${docType}`,
      newValue: { documentType: docType, status, remarks },
      reason: remarks || 'Officer manual document scrutiny',
    });

    res.json({ success: true, document: targetDoc });
  } catch (err) {
    res.status(500).json({ message: 'Failed to verify document: ' + err.message });
  }
};

/**
 * GET /api/applications/:id/documents/:documentId
 * Authorized officer document streaming endpoint
 */
const streamApplicationDocument = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const docParam = req.params.documentId;
    const docItem = (application.documents || []).find(
      (d) => d.documentId === docParam || d.docType === docParam || d.name === docParam
    );
    if (!docItem) {
      return res.status(404).json({ success: false, message: 'Document not found in application' });
    }

    let dbDoc = null;
    if (docItem.documentId) {
      dbDoc = await Document.findOne({ documentId: docItem.documentId });
    }
    if (!dbDoc) {
      dbDoc = await Document.findOne({ studentId: application.student, documentType: docItem.docType });
    }

    let filePath = dbDoc?.storagePath;
    if (!filePath && docItem.fileUrl) {
      const safeBase = path.join(__dirname, '..', 'uploads', String(application.student));
      const relative = path.basename(docItem.fileUrl);
      const candidate = path.join(safeBase, relative);
      if (fs.existsSync(candidate)) filePath = candidate;
    }

    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Physical document file not found on server' });
    }

    const mime = docItem.mimeType || dbDoc?.mimeType || 'application/pdf';
    res.setHeader('Content-Type', mime);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Disposition', `inline; filename="${docItem.fileName || 'document'}"`);
    return fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error streaming document: ' + err.message });
  }
};

module.exports = {
  getApplications,
  getCounts,
  getReviewQueue,
  getApplicationById,
  decide,
  reanalyze,
  updateStatus,
  bulkUpdateStatus,
  getMeritList,
  finalizeSelection,
  getAnalyticsSummary,
  getAnalyticsTrend,
  getNotifications,
  markNotificationsSeen,
  getAuditLogs,
  verifyDocumentItem,
  streamApplicationDocument,
};

/*
 * Recomputes review summary fields (rule preliminary result, review flags and
 * priority) for applications created before the admin portal revamp.
 *   npm run backfill:review            -> only records without a rule result
 *   npm run backfill:review -- --all   -> every application
 * Statuses are not changed.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Application = require('../models/Application');
const Student = require('../models/Student');
const review = require('../services/review');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const all = process.argv.includes('--all');
  const filter = all ? {} : { $or: [{ rulePreliminary: { $exists: false } }, { rulePreliminary: '' }] };
  const apps = await Application.find(filter);
  for (const app of apps) {
    const student = app.student ? await Student.findById(app.student).select('name dob aadhaarVerified aadhaarLast4').lean() : null;
    if (!app.aiAnalysis) app.aiAnalysis = { status: 'not_run', preliminaryResult: 'NOT_RUN', reason: 'AI-assisted analysis has not been run for this application.' };
    review.applySummary(app, review.assess(app.toObject(), student));
    await app.save();
  }
  console.log(`Updated ${apps.length} application(s).`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

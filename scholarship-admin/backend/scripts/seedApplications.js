require('dotenv').config();
const mongoose = require('mongoose');
const Application = require('../models/Application');

const FIRST_NAMES = [
  'Rahul', 'Priya', 'Amit', 'Sneha', 'Ravi', 'Neha', 'Sunita', 'Deepak',
  'Anita', 'Vikram', 'Pooja', 'Sanjay', 'Kavita', 'Manoj', 'Rekha',
];
const LAST_NAMES = [
  'Sharma', 'Patel', 'Kumar', 'Gupta', 'Singh', 'Verma', 'Toppo', 'Munda',
  'Oraon', 'Bhagat', 'Kerketta', 'Minz', 'Tirkey', 'Soren', 'Hembrom',
];
const STATES = ['Odisha', 'Jharkhand', 'Chhattisgarh', 'Madhya Pradesh'];
const SCHEMES = ['NFST', 'NOS'];
const STATUSES = ['Pending', 'Eligible', 'Deficient', 'Flagged', 'Selected'];
const COURSES = ['M.Sc. Physics', 'Ph.D. Sociology', 'M.A. Economics', 'MBA', 'M.Tech CSE'];
const INSTITUTIONS = ['Central University', 'IIT', 'State University', 'National Institute'];

const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomScore = (min = 40, max = 98) => Math.floor(Math.random() * (max - min + 1)) + min;

const buildDocuments = (isDeficient) => {
  const docs = [
    { name: 'Caste Certificate', source: 'digilocker', verified: true },
    { name: 'Income Certificate', source: 'manual', verified: !isDeficient },
    { name: 'Marksheet', source: 'manual', verified: true },
    { name: 'Admission Letter', source: 'manual', verified: !isDeficient },
  ];
  return docs;
};

const buildAiChecks = (status) => {
  const deficient = status === 'Deficient';
  return {
    checks: [
      { label: 'Income within scheme limit', passed: true },
      { label: 'Category matches ST records', passed: true },
      { label: 'Marks meet minimum cutoff', passed: !deficient },
      { label: 'All required documents present', passed: !deficient },
    ],
    score: deficient ? randomScore(20, 55) : randomScore(60, 98),
  };
};

const buildApplications = (count) => {
  const apps = [];
  for (let i = 1; i <= count; i += 1) {
    const status = randomFrom(STATUSES);
    const first = randomFrom(FIRST_NAMES);
    const last = randomFrom(LAST_NAMES);
    const daysAgo = Math.floor(Math.random() * 30);

    apps.push({
      applicationCode: `SIH26239-${1000 + i}`,
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@example.com`,
      phone: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
      dob: new Date(1998 + Math.floor(Math.random() * 6), Math.floor(Math.random() * 12), 10),
      gender: randomFrom(['Male', 'Female']),
      category: 'Scheduled Tribe',
      state: randomFrom(STATES),
      district: 'District ' + (i % 5 + 1),
      scheme: randomFrom(SCHEMES),
      course: randomFrom(COURSES),
      institution: randomFrom(INSTITUTIONS),
      status,
      documents: buildDocuments(status === 'Deficient'),
      aiVerification: buildAiChecks(status),
      meritScores: {
        academic: randomScore(),
        exam: randomScore(),
        socioEconomic: randomScore(),
        interview: randomScore(),
      },
      adminRemarks: '',
      submittedAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
    });
  }
  return apps;
};

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const count = parseInt(process.argv[2], 10) || 40;

  const existing = await Application.countDocuments();
  if (existing > 0) {
    console.log(`Applications collection already has ${existing} documents.`);
    console.log('Run with --force to wipe and reseed: node scripts/seedApplications.js 40 --force');
    if (!process.argv.includes('--force')) {
      process.exit(0);
    }
    await Application.deleteMany({});
    console.log('Cleared existing applications.');
  }

  const apps = buildApplications(count);
  await Application.insertMany(apps);
  console.log(`Seeded ${apps.length} applications.`);
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

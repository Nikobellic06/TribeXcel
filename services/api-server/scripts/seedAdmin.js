require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const email = process.argv[2];
  const password = process.argv[3];
  const name = process.argv[4] || 'Admin';

  if (!email || !password) {
    console.log('Usage: npm run seed:admin -- <email> <password> [name]');
    process.exit(1);
  }

  const existing = await Admin.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    console.log('An admin with this email already exists');
    process.exit(0);
  }

  await Admin.create({ name, email, password });
  console.log(`Admin created: ${email}`);
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

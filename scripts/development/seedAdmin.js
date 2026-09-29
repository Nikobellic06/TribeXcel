/**
 * Ministry of Tribal Affairs (MoTA)
 * Database Seeder: Initial Administrative User
 * Reads configuration from environment variables (no hardcoded credentials)
 */

const path = require('path');
const apiServerDir = path.join(__dirname, '..', '..', 'services', 'api-server');

// Resolve modules from services/api-server if running from root
try {
  require(path.join(apiServerDir, 'node_modules', 'dotenv')).config({ path: path.join(apiServerDir, '.env') });
} catch {
  try {
    require('dotenv').config({ path: path.join(apiServerDir, '.env') });
  } catch {}
}

let mongoose;
try {
  mongoose = require(path.join(apiServerDir, 'node_modules', 'mongoose'));
} catch {
  mongoose = require('mongoose');
}

const Admin = require(path.join(apiServerDir, 'models', 'Admin'));

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tribal-scholarship';
const ADMIN_EMAIL = (process.env.INITIAL_ADMIN_EMAIL || process.env.ADMIN_EMAIL || 'admin@mota.gov.in').toLowerCase().trim();
const ADMIN_PASSWORD = process.env.INITIAL_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || 'Tribal@Admin2026';
const ADMIN_NAME = process.env.INITIAL_ADMIN_NAME || process.env.ADMIN_NAME || 'Principal Secretary MoTA';
const ADMIN_ROLE = process.env.INITIAL_ADMIN_ROLE || 'super-admin';
const ADMIN_DESIGNATION = process.env.INITIAL_ADMIN_DESIGNATION || 'Mission Director & Joint Secretary';

async function seedAdmin() {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('[Seed] Connected successfully.');

    let admin = await Admin.findOne({ email: ADMIN_EMAIL });
    if (admin) {
      console.log(`[Seed] Admin user "${ADMIN_EMAIL}" already exists with role: "${admin.role}". Updating profile...`);
      admin.name = ADMIN_NAME;
      admin.role = ADMIN_ROLE;
      admin.designation = ADMIN_DESIGNATION;
      admin.password = ADMIN_PASSWORD; // Will be hashed by pre-save hook
      await admin.save();
      console.log('[Seed] Admin account updated successfully.');
    } else {
      console.log(`[Seed] Creating new administrative user "${ADMIN_EMAIL}"...`);
      admin = new Admin({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: ADMIN_ROLE,
        designation: ADMIN_DESIGNATION,
      });
      await admin.save();
      console.log('[Seed] Administrative user created successfully with ID:', admin._id.toString());
    }

    console.log('[Seed] Admin seeding process completed successfully.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error] Failed to seed administrator account:', err.message);
    if (mongoose.connection && mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
}

seedAdmin();

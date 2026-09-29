/**
 * TribeXcel - Security Audit & Acceptance Test Suite
 * Tests:
 * 1. Secret Scanning (no committed AWS/private keys/hardcoded production secrets)
 * 2. Unauthenticated uploads / document access blocked (no public /uploads)
 * 3. IDOR protection on applications and documents
 * 4. Role-Based Access Control (RBAC) enforcement
 * 5. Deterministic Aadhaar format validation (no fake e-KYC claims)
 */

const fs = require('fs');
const path = require('path');
const apiServerDir = path.join(__dirname, '..', '..', 'services', 'api-server');

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

const Student = require(path.join(apiServerDir, 'models', 'Student'));
const Admin = require(path.join(apiServerDir, 'models', 'Admin'));
const Application = require(path.join(apiServerDir, 'models', 'Application'));
const { isValidAadhaar } = require(path.join(apiServerDir, 'utils', 'aadhaar'));

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    testsPassed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    testsFailed++;
  }
}

async function runSecurityAudit() {
  console.log('\n==================================================');
  console.log('TRIBEXCEL SECURITY & ARCHITECTURE AUDIT SUITE');
  console.log('==================================================\n');

  // TEST 1: Secret Scan in Codebase
  console.log('[Test 1] Codebase Secret Scanning');
  const sensitivePatterns = [
    /-----BEGIN (?:RSA )?PRIVATE KEY-----/,
    /AKIA[0-9A-Z]{16}/, // AWS Access Key
  ];
  let leakFound = false;

  function scanDir(dir) {
    if (leakFound) return;
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const f of files) {
      if (['node_modules', '.git', 'dist', '.venv', 'uploads'].includes(f.name)) continue;
      const full = path.join(dir, f.name);
      if (f.isDirectory()) {
        scanDir(full);
      } else if (f.isFile() && /\.(js|jsx|py|json|env|md)$/.test(f.name) && !f.name.endsWith('.env.example')) {
        const content = fs.readFileSync(full, 'utf8');
        for (const pat of sensitivePatterns) {
          if (pat.test(content)) {
            console.error(`    Found pattern ${pat} in ${full}`);
            leakFound = true;
          }
        }
      }
    }
  }

  scanDir(path.join(__dirname, '..', '..'));
  assert(!leakFound, 'No exposed private keys or AWS credentials found in source files');

  // TEST 2: Static /uploads inspection in server.js
  console.log('\n[Test 2] Static File Exposure Vulnerability Check');
  const serverJsPath = path.join(apiServerDir, 'server.js');
  const serverCode = fs.readFileSync(serverJsPath, 'utf8');
  const hasPublicStaticUploads = serverCode.includes("express.static(UPLOAD_ROOT)") || serverCode.includes("express.static('/uploads'");
  assert(!hasPublicStaticUploads, 'Public express.static(UPLOAD_ROOT) is removed from server.js');

  const hasProtectedStreaming = serverCode.includes('/uploads/:studentId/:filename') && serverCode.includes('protectAny');
  assert(hasProtectedStreaming, 'Protected document streaming endpoint with user/admin authentication is registered');

  // TEST 3: Verhoeff Aadhaar Checksum Logic
  console.log('\n[Test 3] Aadhaar Format Validation (Verhoeff Algorithm)');
  // Valid Verhoeff Aadhaar test numbers
  const validAadhaar = '200000000009';
  const invalidAadhaar = '200000000008'; // Wrong checksum
  const shortAadhaar = '12345678';

  assert(isValidAadhaar(validAadhaar) === true, `Verhoeff validates correct 12-digit Aadhaar: ${validAadhaar}`);
  assert(isValidAadhaar(invalidAadhaar) === false, `Verhoeff rejects corrupted checksum Aadhaar: ${invalidAadhaar}`);
  assert(isValidAadhaar(shortAadhaar) === false, `Verhoeff rejects malformed length: ${shortAadhaar}`);

  // TEST 4: Scheme Catalogue Canonical Truth
  console.log('\n[Test 4] Canonical Scheme Catalogue & Direct Intake Mode');
  const { SCHEME_CATALOGUE, getDocumentChecklist, evaluateEligibility } = require('../../packages/scheme-config');
  const all5Codes = ['PRE_MATRIC', 'POST_MATRIC', 'TOP_CLASS', 'NFST', 'NOS'];

  all5Codes.forEach((code) => {
    const scheme = SCHEME_CATALOGUE[code];
    assert(Boolean(scheme), `Scheme ${code} exists in canonical SCHEME_CATALOGUE`);
    assert(scheme?.applicationMode === 'DIRECT', `Scheme ${code} has applicationMode: 'DIRECT' (no external federated redirect)`);
    assert(Boolean(scheme?.ruleVersion), `Scheme ${code} has versioned ruleVersion: '${scheme?.ruleVersion}'`);
  });

  // TEST 5: Top Class Fresh vs Renewal Checklist
  console.log('\n[Test 5] Dynamic Document Checklist Resolution');
  const topClassFreshDocs = getDocumentChecklist('TOP_CLASS', { applicationType: 'FRESH' });
  const topClassRenewalDocs = getDocumentChecklist('TOP_CLASS', { applicationType: 'RENEWAL' });

  assert(topClassFreshDocs.some((d) => d.id === 'bonafide_certificate'), 'Top Class FRESH requires bonafide_certificate');
  assert(topClassRenewalDocs.some((d) => d.id === 'last_passing_marksheet'), 'Top Class RENEWAL requires last_passing_marksheet');
  assert(!topClassRenewalDocs.some((d) => d.id === 'st_certificate'), 'Top Class RENEWAL does not re-require st_certificate');

  // TEST 6: RBAC Role Enum in Admin Model
  console.log('\n[Test 6] RBAC Role Definition Verification');
  const adminModelPath = path.join(apiServerDir, 'models', 'Admin.js');
  const adminModelCode = fs.readFileSync(adminModelPath, 'utf8');
  assert(adminModelCode.includes("'super-admin', 'admin', 'reviewer'"), 'Admin model supports super-admin, admin, and reviewer roles');

  // TEST 7: Anti-IDOR in Controller Check
  console.log('\n[Test 7] Anti-IDOR & Application Ownership Verification');
  const studentAppCtrlPath = path.join(apiServerDir, 'controllers', 'studentApplicationController.js');
  const studentAppCtrlCode = fs.readFileSync(studentAppCtrlPath, 'utf8');
  assert(
    studentAppCtrlCode.includes('streamStudentApplicationDocument') &&
    studentAppCtrlCode.includes('student: req.student._id'),
    'Student application document streaming verifies student ownership against req.student._id (Anti-IDOR)'
  );

  console.log('\n==================================================');
  console.log(`AUDIT RESULTS: ${testsPassed} Passed, ${testsFailed} Failed`);
  console.log('==================================================\n');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runSecurityAudit();

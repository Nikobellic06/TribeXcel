import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SAMPLES_DIR = path.resolve(__dirname, '../system-a-document-intelligence/sample-documents');
const INTEGRATION_URL = 'http://localhost:5002/api/process-application';

async function testSingleFile(fileName, scheme = 'POST_MATRIC') {
  console.log(`\n======================================================`);
  console.log(`📄 Testing Live Upload: ${fileName} (Scheme: ${scheme})`);
  console.log(`======================================================`);
  
  const filePath = path.join(SAMPLES_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const formData = new FormData();
  formData.append('schemeCode', scheme);
  const fileBytes = fs.readFileSync(filePath);
  const blob = new Blob([fileBytes], { type: 'application/pdf' });
  formData.append('documents', blob, fileName);

  const start = Date.now();
  const res = await fetch(INTEGRATION_URL, {
    method: 'POST',
    body: formData
  });
  const elapsed = Date.now() - start;

  console.log(`Status Code: ${res.status} (${elapsed}ms)`);
  const data = await res.json();
  console.log(`Application ID: ${data.applicationId}`);
  console.log(`Documents count: ${data.documents?.length}`);
  
  const doc = data.documents?.[0];
  const cls = data.documentIntelligence?.classification?.[0];
  const ext = data.documentIntelligence?.extraction?.[0];
  const qual = data.documentIntelligence?.quality?.[0];
  console.log(`\n--- Document #1 Summary ---`);
  console.log(`Filename: ${doc?.filename}`);
  console.log(`Detected Type: ${doc?.documentType} (Classification: ${cls?.detectedType}, Conf: ${cls?.confidence})`);
  console.log(`Evidence:`, doc?.evidence);
  console.log(`Quality Status: ${qual?.quality}`);
  console.log(`Extracted Fields:`, Object.keys(ext?.fields || {}));
  for (const [k, v] of Object.entries(ext?.fields || {})) {
    console.log(`  - ${k}: ${JSON.stringify(v)}`);
  }

  console.log(`\n--- Verification Summary (System B) ---`);
  console.log(`Final Status: ${data.verification?.finalStatus}`);
  console.log(`Human Review Required: ${data.verification?.humanReviewRequired}`);
  console.log(`Explanation: ${data.verification?.explanation?.split('\n')[0]}`);
  console.log(`Deficiencies Count: ${data.verification?.deficiencies?.length}`);
  return data;
}

async function testMultiDocument() {
  console.log(`\n======================================================`);
  console.log(`📚 Testing Multi-Document Upload (Income + ST + Marksheet + Bank)`);
  console.log(`======================================================`);

  const files = [
    'sample_income_certificate.pdf',
    'sample_st_certificate.pdf',
    'sample_marksheet.pdf',
    'sample_bank_passbook.pdf'
  ];

  const formData = new FormData();
  formData.append('schemeCode', 'POST_MATRIC');
  for (const f of files) {
    const filePath = path.join(SAMPLES_DIR, f);
    const fileBytes = fs.readFileSync(filePath);
    const blob = new Blob([fileBytes], { type: 'application/pdf' });
    formData.append('documents', blob, f);
  }

  const start = Date.now();
  const res = await fetch(INTEGRATION_URL, {
    method: 'POST',
    body: formData
  });
  const elapsed = Date.now() - start;

  console.log(`Status Code: ${res.status} (${elapsed}ms)`);
  const data = await res.json();
  console.log(`Application ID: ${data.applicationId}`);
  console.log(`Documents count: ${data.documents?.length}`);
  data.documents?.forEach((d, i) => {
    console.log(` Doc ${i+1}: ${d.filename} -> ${d.documentType} (Confidence: ${d.confidence})`);
  });

  console.log(`\n--- Cross-Document Validation Results ---`);
  const cd = data.documentIntelligence?.crossDocumentValidation || [];
  console.log(`Cross-doc items count: ${cd.length}`);
  cd.forEach(c => {
    console.log(` Field: ${c.field} => ${c.status} (${c.details || JSON.stringify(c.values)})`);
  });

  console.log(`\n--- Verification Summary ---`);
  console.log(`Final Status: ${data.verification?.finalStatus}`);
  console.log(`Human Review Required: ${data.verification?.humanReviewRequired}`);
  console.log(`Explanation: ${data.verification?.explanation}`);
  console.log(`Deficiencies:`, data.verification?.deficiencies);
}

async function runAll() {
  try {
    await testSingleFile('sample_income_certificate.pdf');
    await testSingleFile('sample_marksheet.pdf');
    await testSingleFile('sample_st_certificate.pdf');
    await testSingleFile('sample_unrelated_receipt.pdf');
    await testMultiDocument();
    console.log(`\n🎉 ALL LIVE E2E CHECKS COMPLETED SUCCESSFULLY!`);
  } catch (err) {
    console.error(`❌ Test failed:`, err);
    process.exit(1);
  }
}

runAll();

import assert from 'assert';
import { extractDocumentSpecificFields } from '../src/extraction/extractors/index.js';
import { classifyDocument } from '../src/services/documentClassifier.service.js';

console.log('=================================================================');
console.log('🧪 TESTING EXTRACTION ENGINE & CLASSIFIER MODULES');
console.log('=================================================================');

// 1. Test Income Certificate
const incomeOcr = `
OFFICE OF THE CIRCLE OFFICER, DUMKA
GOVERNMENT OF JHARKHAND
INCOME CERTIFICATE
Certificate No: INC/JH/2023/45120
Date: 20/04/2023
This is to certify that Sunita Soren daughter of Shri Mangal Soren, resident of Village Haripur, District Dumka, State Jharkhand.
The annual family income from all sources is Rs. 1,40,000/- (Rupees One Lakh Forty Thousand only).
Financial Year: 2023-2024
Issuing Authority: Circle Officer
`;

const incomeClass = classifyDocument(incomeOcr);
assert.strictEqual(incomeClass.documentType, 'INCOME_CERTIFICATE');
assert(incomeClass.confidence >= 0.85);
assert(incomeClass.classificationScores['INCOME_CERTIFICATE'] > 50);

const incomeFields = extractDocumentSpecificFields('INCOME_CERTIFICATE', incomeOcr, [
  { text: 'INCOME CERTIFICATE', confidence: 0.99, page: 1, box: [100, 50, 400, 80] },
  { text: 'Certificate No: INC/JH/2023/45120', confidence: 0.98, page: 1, box: [100, 100, 450, 130] },
  { text: 'The annual family income from all sources is Rs. 1,40,000/-', confidence: 0.98, page: 1, box: [100, 200, 600, 230] }
]);
assert.strictEqual(incomeFields.fields.annualIncome, 140000);
assert.strictEqual(incomeFields.fields.certificateNumber, 'INC/JH/2023/45120');
assert.strictEqual(incomeFields.fieldConfidence.annualIncome.validation, 'VALID');
console.log('  ✓ [PASS] Income Certificate: Classification, Score & Field Extraction (₹1,40,000)');

// 2. Test ST Certificate
const stOcr = `
GOVERNMENT OF JHARKHAND
OFFICE OF THE SUB-DIVISIONAL OFFICER, DUMKA
SCHEDULED TRIBE CERTIFICATE
Certificate No: JH/ST/2021/88921
Date of Issue: 12/08/2021
This is to certify that Sunita Soren daughter of Mangal Soren belongs to the Santhal community which is recognized as a Scheduled Tribe under the Constitution (Scheduled Tribes) Order, 1950.
State: Jharkhand, District: Dumka.
Sub-Divisional Officer, Dumka
`;

const stClass = classifyDocument(stOcr);
assert.strictEqual(stClass.documentType, 'ST_CERTIFICATE');
const stFields = extractDocumentSpecificFields('ST_CERTIFICATE', stOcr);
assert.strictEqual(stFields.fields.category, 'ST');
assert.strictEqual(stFields.fields.tribeName, 'Santhal');
assert.strictEqual(stFields.fields.certificateNumber, 'JH/ST/2021/88921');
console.log('  ✓ [PASS] ST Certificate: Classification & Field Extraction (Santhal, ST, JH/ST/2021/88921)');

// 3. Test Marksheet
const marksheetOcr = `
JHARKHAND ACADEMIC COUNCIL, RANCHI
STATEMENT OF MARKS
HIGHER SECONDARY EXAMINATION 2022
Roll No: JAC-2022-88124
Student Name: Sunita Soren
Institution: St. Xavier's Inter College, Ranchi
Class: Class XII
Total Marks: 435 / 500
Percentage: 87.0%
Result: First Division
`;

const marksheetClass = classifyDocument(marksheetOcr);
assert.strictEqual(marksheetClass.documentType, 'MARKSHEET');
const marksheetFields = extractDocumentSpecificFields('MARKSHEET', marksheetOcr);
assert.strictEqual(marksheetFields.fields.studentName, 'Sunita Soren');
assert.strictEqual(marksheetFields.fields.percentage, 87);
assert.strictEqual(marksheetFields.fields.totalMarks, '435');
assert.strictEqual(marksheetFields.fields.maximumMarks, '500');
assert.strictEqual(marksheetFields.fieldConfidence.percentage.validation, 'VALID');
console.log('  ✓ [PASS] Marksheet: Classification, Matrix & Percentage (87.0%, 435/500)');

// 4. Test Bank Passbook
const bankOcr = `
STATE BANK OF INDIA
SAVINGS BANK PASSBOOK
Account Holder: Sunita Soren
Account No: 334589124451
IFSC Code: SBIN0000214
Branch: Dumka Main Branch
`;

const bankClass = classifyDocument(bankOcr);
assert.strictEqual(bankClass.documentType, 'BANK_PASSBOOK');
const bankFields = extractDocumentSpecificFields('BANK_PASSBOOK', bankOcr);
assert.strictEqual(bankFields.fields.ifsc, 'SBIN0000214');
assert.strictEqual(bankFields.fieldConfidence.ifsc.validation, 'VALID');
assert(bankFields.fields.maskedAccountNumber.includes('X'));
console.log('  ✓ [PASS] Bank Passbook: IFSC Regex validation & Account Number masking');

// 5. Test Unrelated / Unknown Document
const unknownOcr = `
SUPERMARKET GROCERY RECEIPT
Store: Fresh Mart 402
Item 1: Organic Milk - 65.00
Item 2: Whole Wheat Bread - 40.00
Total Bill: 105.00
Thank you for shopping with us!
`;

const unknownClass = classifyDocument(unknownOcr);
assert.strictEqual(unknownClass.documentType, 'UNKNOWN');
assert(unknownClass.confidence <= 0.40);
console.log('  ✓ [PASS] Unknown Document: Accurately unclassified as UNKNOWN with low confidence');

console.log('=================================================================');
console.log(' ALL EXTRACTION & CLASSIFICATION UNIT CHECKS PASSED (5/5)');
console.log('=================================================================');

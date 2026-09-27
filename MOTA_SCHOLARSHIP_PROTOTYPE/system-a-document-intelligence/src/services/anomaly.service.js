/**
 * Light Anomaly Detection Service
 * 
 * Analyzes document validation results, field extraction completeness,
 * and cross-document inconsistencies.
 * 
 * IMPORTANT:
 * - This is anomaly detection, NOT fraud detection.
 * - Never output: "Applicant is fraudulent."
 * - Output: "Potential inconsistency detected; human verification recommended."
 */

export function detectAnomalies(documents = [], validationResults = []) {
  const signals = [];
  const reviewFlags = [];

  // 1. Check Cross-Document Validation Results
  for (const item of validationResults) {
    if (item.status === 'MISMATCH') {
      const docDetails = item.documents.map(d => `"${d.document}" [${d.value}]`).join(' vs ');
      const signalText = `Conflicting ${item.label}: ${docDetails}. Potential inconsistency detected; human verification recommended.`;
      signals.push(signalText);

      reviewFlags.push({
        severity: item.field === 'fullName' || item.field === 'dateOfBirth' || item.field === 'category' ? 'HIGH' : 'MEDIUM',
        field: item.field,
        message: `Discrepancy in ${item.label}. Review original documents for clerical or typographical variation.`,
        guidance: 'Verify whether discrepancy is due to name change, spelling translation, or clerical record error.'
      });
    } else if (item.status === 'MINOR_VARIATION') {
      const docDetails = item.documents.map(d => `"${d.document}" [${d.value}]`).join(' vs ');
      reviewFlags.push({
        severity: 'LOW',
        field: item.field,
        message: `Minor spelling or abbreviation variation in ${item.label} (${docDetails}).`,
        guidance: 'Standard transliteration or abbreviation difference; verify applicant identity matches.'
      });
    }
  }

  // 2. Check for Duplicate Certificate Numbers across documents
  const certNumbersSeen = new Map();
  for (const doc of documents) {
    const certNum = doc.fields?.certificateNumber || doc.fields?.incomeCertificateNumber;
    if (certNum) {
      const trimmedCert = String(certNum).trim();
      if (certNumbersSeen.has(trimmedCert)) {
        const prevDoc = certNumbersSeen.get(trimmedCert);
        signals.push(`Duplicate certificate number "${trimmedCert}" shared between "${prevDoc}" and "${doc.filename}". Potential inconsistency detected; human verification recommended.`);
        reviewFlags.push({
          severity: 'HIGH',
          field: 'certificateNumber',
          message: `Identical certificate number found in distinct documents: ${prevDoc} and ${doc.filename}.`,
          guidance: 'Check if multiple certificate types erroneously used the same reference or if an incorrect document was uploaded.'
        });
      } else {
        certNumbersSeen.set(trimmedCert, doc.filename);
      }
    }
  }

  // 3. Check for Suspiciously Incomplete Documents & Missing Critical Information
  for (const doc of documents) {
    if (doc.quality === 'POOR') {
      signals.push(`Document "${doc.filename}" classified as POOR quality (${doc.issues.join(', ') || 'unreadable text'}). Potential scan clarity issue; human verification recommended.`);
      reviewFlags.push({
        severity: 'MEDIUM',
        field: doc.documentType,
        message: `Document "${doc.filename}" has low legibility.`,
        guidance: 'Request a higher-resolution scan or verify physically. Note: Poor scan quality does not imply ineligibility.'
      });
    }

    if (Array.isArray(doc.missingFields) && doc.missingFields.length > 0) {
      signals.push(`Document "${doc.filename}" is missing key fields: ${doc.missingFields.join(', ')}. Verification recommended.`);
      reviewFlags.push({
        severity: 'LOW',
        field: doc.documentType,
        message: `Incomplete data extraction in "${doc.filename}". Missing: ${doc.missingFields.join(', ')}.`,
        guidance: 'Ensure all required fields are present in the submitted document.'
      });
    }

    // Specific critical checks
    if (doc.documentType === 'INCOME_CERTIFICATE' && (!doc.fields || doc.fields.annualIncome === null)) {
      signals.push(`Income Certificate "${doc.filename}" lacks a legible annual income value.`);
      reviewFlags.push({
        severity: 'HIGH',
        field: 'annualIncome',
        message: 'Annual income could not be determined from the Income Certificate.',
        guidance: 'Clear income certificate is required to assess scholarship income ceiling criteria.'
      });
    }

    if (doc.documentType === 'BANK_PASSBOOK' && (!doc.fields || doc.fields.ifsc === null)) {
      signals.push(`Bank Passbook "${doc.filename}" lacks a visible branch IFSC code.`);
      reviewFlags.push({
        severity: 'MEDIUM',
        field: 'ifsc',
        message: 'Bank passbook is missing IFSC code.',
        guidance: 'IFSC is required for Direct Benefit Transfer (DBT) disbursement.'
      });
    }
  }

  // 4. Calculate Overall Anomaly Level: LOW, MEDIUM, HIGH
  let level = 'LOW';
  const hasHighFlag = reviewFlags.some(f => f.severity === 'HIGH');
  const hasMedFlag = reviewFlags.some(f => f.severity === 'MEDIUM');

  if (hasHighFlag || signals.length >= 3) {
    level = 'HIGH';
  } else if (hasMedFlag || signals.length > 0) {
    level = 'MEDIUM';
  }

  return {
    anomalies: {
      level,
      signals: signals.length > 0 ? signals : ['No conflicting signals detected. All extracted documents are consistent.']
    },
    reviewFlags
  };
}

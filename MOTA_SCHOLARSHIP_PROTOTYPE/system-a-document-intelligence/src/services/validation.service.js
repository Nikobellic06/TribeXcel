import {
  compareNames,
  compareDates,
  compareGeneralField,
  parseIncomeNumber
} from '../utils/textNormalizer.js';

/**
 * Cross-Document Validation Service
 * 
 * Compares 9 key fields across all uploaded documents:
 * - fullName
 * - dateOfBirth
 * - category
 * - tribeName
 * - domicileState
 * - institution
 * - course
 * - qualification
 * - annualIncome
 */

export function performCrossDocumentValidation(documents = []) {
  const fieldsToValidate = [
    { key: 'fullName', label: 'Full Name', aliases: ['fullName', 'accountHolderName'] },
    { key: 'dateOfBirth', label: 'Date of Birth', aliases: ['dateOfBirth'] },
    { key: 'category', label: 'Category', aliases: ['category'] },
    { key: 'tribeName', label: 'Tribe Name', aliases: ['tribeName'] },
    { key: 'domicileState', label: 'Domicile / State', aliases: ['domicileState', 'state'] },
    { key: 'institution', label: 'Institution Name', aliases: ['institution'] },
    { key: 'course', label: 'Course / Discipline', aliases: ['course', 'programme'] },
    { key: 'qualification', label: 'Qualification', aliases: ['qualification'] },
    { key: 'annualIncome', label: 'Annual Income', aliases: ['annualIncome'] }
  ];

  const validationResults = [];

  for (const fieldDef of fieldsToValidate) {
    const docOccurrences = [];

    for (const doc of documents) {
      if (!doc || !doc.fields) continue;

      let val = null;
      for (const alias of fieldDef.aliases) {
        if (doc.fields[alias] !== null && doc.fields[alias] !== undefined && String(doc.fields[alias]).trim() !== '') {
          val = String(doc.fields[alias]).trim();
          break;
        }
      }

      if (val !== null) {
        docOccurrences.push({
          document: doc.filename || doc.documentType,
          documentType: doc.documentType,
          value: val
        });
      }
    }

    // If fewer than 2 documents provide this field, cross-document comparison is NOT_AVAILABLE
    if (docOccurrences.length < 2) {
      validationResults.push({
        field: fieldDef.key,
        label: fieldDef.label,
        status: 'NOT_AVAILABLE',
        documents: docOccurrences,
        remarks: docOccurrences.length === 1 
          ? `Found only in 1 document (${docOccurrences[0].document}); cross-verification requires at least 2 documents.`
          : 'Field not available in the uploaded documents.'
      });
      continue;
    }

    // Perform pairwise comparisons across all occurrences
    let hasMismatch = false;
    let hasMinorVariation = false;
    let remarks = 'Values match consistently across all documents.';

    for (let i = 0; i < docOccurrences.length; i++) {
      for (let j = i + 1; j < docOccurrences.length; j++) {
        const docA = docOccurrences[i];
        const docB = docOccurrences[j];
        let pairStatus = 'MATCH';

        if (fieldDef.key === 'fullName') {
          pairStatus = compareNames(docA.value, docB.value);
        } else if (fieldDef.key === 'dateOfBirth') {
          pairStatus = compareDates(docA.value, docB.value);
        } else if (fieldDef.key === 'annualIncome') {
          const numA = parseIncomeNumber(docA.value);
          const numB = parseIncomeNumber(docB.value);
          if (numA !== null && numB !== null) {
            if (numA === numB) pairStatus = 'MATCH';
            else if (Math.abs(numA - numB) / Math.max(numA, numB) <= 0.05) pairStatus = 'MINOR_VARIATION';
            else pairStatus = 'MISMATCH';
          } else {
            pairStatus = 'NOT_AVAILABLE';
          }
        } else if (fieldDef.key === 'institution' || fieldDef.key === 'course') {
          const isQualifyingDocA = ['MARKSHEET', 'DEGREE_CERTIFICATE'].includes(docA.documentType);
          const isAdmissionDocB = ['ADMISSION_LETTER', 'OFFER_LETTER', 'BONAFIDE_CERTIFICATE', 'FEE_RECEIPT'].includes(docB.documentType);
          const isQualifyingDocB = ['MARKSHEET', 'DEGREE_CERTIFICATE'].includes(docB.documentType);
          const isAdmissionDocA = ['ADMISSION_LETTER', 'OFFER_LETTER', 'BONAFIDE_CERTIFICATE', 'FEE_RECEIPT'].includes(docA.documentType);

          // If one is qualifying (e.g. 12th marksheet) and the other is current admission (e.g. B.Tech admission letter),
          // differing institutions/courses represent valid academic progression, not a conflict
          if ((isQualifyingDocA && isAdmissionDocB) || (isAdmissionDocA && isQualifyingDocB)) {
            pairStatus = 'MATCH';
          } else {
            pairStatus = compareGeneralField(docA.value, docB.value);
          }
        } else {
          pairStatus = compareGeneralField(docA.value, docB.value);
        }

        if (pairStatus === 'MISMATCH') {
          hasMismatch = true;
          remarks = `Mismatch found between "${docA.document}" (${docA.value}) and "${docB.document}" (${docB.value}).`;
          break;
        } else if (pairStatus === 'MINOR_VARIATION') {
          hasMinorVariation = true;
          remarks = `Minor variation observed between "${docA.document}" (${docA.value}) and "${docB.document}" (${docB.value}).`;
        }
      }
      if (hasMismatch) break;
    }

    let overallStatus = 'MATCH';
    if (hasMismatch) {
      overallStatus = 'MISMATCH';
    } else if (hasMinorVariation) {
      overallStatus = 'MINOR_VARIATION';
    }

    validationResults.push({
      field: fieldDef.key,
      label: fieldDef.label,
      status: overallStatus,
      documents: docOccurrences.map(d => ({
        document: d.document,
        value: d.value
      })),
      remarks
    });
  }

  return validationResults;
}

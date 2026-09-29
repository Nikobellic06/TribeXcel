const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { getSchemaByType } = require('./documentSchemas');

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://127.0.0.1:8000';

/**
 * Compute SHA-256 file hash
 */
function computeFileHash(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Heuristic field extractor for Indian Government and Academic documents
 * Used to extract fields from OCR text or when normalizing OCR output.
 */
function extractFieldsFromText(text, docType, studentContext = {}) {
  const schema = getSchemaByType(docType);
  if (!schema) return {};

  const cleanText = (text || '').replace(/\r/g, ' ');
  const lines = cleanText.split('\n').map((l) => l.trim()).filter(Boolean);
  const fields = {};

  // Standard regex patterns
  const dateRegex = /\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}[/-]\d{1,2}[/-]\d{1,2})\b/;
  const certNoRegex = /\b([A-Z]{2,4}[/-][A-Z0-9/-]{5,25})\b/i;
  const incomeRegex = /(?:rs\.?|inr|₹|income|annual)\s*[:.-]?\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d{2})?|\d{5,8})/i;
  const percentageRegex = /(\d{1,2}(?:\.\d{1,2})?)\s*%/;
  const rollNoRegex = /(?:roll\s*(?:no|number|code)?)\s*[:.-]?\s*([0-9A-Z]{5,15})/i;

  schema.fields.forEach((fieldDef) => {
    const key = fieldDef.key;
    let extractedVal = null;
    let confidence = 0.50;
    let isLow = false;

    switch (key) {
      case 'certificateNumber':
      case 'applicationNumber': {
        const match = cleanText.match(certNoRegex);
        if (match) {
          extractedVal = match[1].trim();
          confidence = 0.94;
        }
        break;
      }
      case 'holderName':
      case 'studentName':
      case 'candidateName':
      case 'accountHolderName': {
        // Look for student name if available in context
        if (studentContext.name && cleanText.toLowerCase().includes(studentContext.name.toLowerCase())) {
          extractedVal = studentContext.name;
          confidence = 0.98;
        } else {
          // Look for 'Name: ...'
          const nameMatch = cleanText.match(/(?:name|shri|smt|student|candidate)\s*[:.-]?\s*([A-Za-z\s]{3,35})/i);
          if (nameMatch) {
            extractedVal = nameMatch[1].trim().split('\n')[0];
            confidence = 0.88;
          }
        }
        break;
      }
      case 'fatherName': {
        const fMatch = cleanText.match(/(?:father(?:'?s)?(?:\s+name)?|s\/o|d\/o)\s*[:.-]?\s*(?:shri|mr\.?)?\s*([A-Za-z\s]{3,35})/i);
        if (fMatch) {
          extractedVal = fMatch[1].trim().split('\n')[0];
          confidence = 0.89;
        }
        break;
      }
      case 'dateOfBirth':
      case 'dob': {
        const dMatch = cleanText.match(/(?:date\s*of\s*birth|dob)\s*[:.-]?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i) || cleanText.match(dateRegex);
        if (dMatch) {
          extractedVal = dMatch[1];
          confidence = 0.92;
        }
        break;
      }
      case 'issueDate': {
        const iMatch = cleanText.match(/(?:date\s*of\s*issue|issue\s*date|dated)\s*[:.-]?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i);
        if (iMatch) {
          extractedVal = iMatch[1];
          confidence = 0.91;
        }
        break;
      }
      case 'tribeName':
      case 'communityName': {
        const tribes = ['Santhal', 'Gond', 'Munda', 'Oraon', 'Bhil', 'Bodo', 'Khasi', 'Garo', 'Mizo', 'Ho', 'Birhor', 'Chenchu'];
        for (const t of tribes) {
          if (new RegExp(`\\b${t}\\b`, 'i').test(cleanText)) {
            extractedVal = t;
            confidence = 0.95;
            break;
          }
        }
        break;
      }
      case 'annualIncome': {
        const incMatch = cleanText.match(incomeRegex);
        if (incMatch) {
          const numStr = incMatch[1].replace(/,/g, '');
          const parsed = parseInt(numStr, 10);
          if (!isNaN(parsed) && parsed > 5000 && parsed < 2000000) {
            extractedVal = parsed;
            confidence = 0.93;
          }
        }
        break;
      }
      case 'percentage': {
        const pMatch = cleanText.match(percentageRegex);
        if (pMatch) {
          extractedVal = pMatch[1];
          confidence = 0.91;
        }
        break;
      }
      case 'rollNumber': {
        const rMatch = cleanText.match(rollNoRegex);
        if (rMatch) {
          extractedVal = rMatch[1];
          confidence = 0.90;
        }
        break;
      }
      case 'state': {
        const states = ['Jharkhand', 'Madhya Pradesh', 'Odisha', 'Chhattisgarh', 'Assam', 'Rajasthan', 'Gujarat', 'Maharashtra', 'Telangana', 'Andhra Pradesh', 'Meghalaya', 'Manipur', 'Nagaland'];
        for (const s of states) {
          if (new RegExp(`\\b${s}\\b`, 'i').test(cleanText)) {
            extractedVal = s;
            confidence = 0.95;
            break;
          }
        }
        break;
      }
      case 'district': {
        const districts = ['Ranchi', 'Seoni', 'Mayurbhanj', 'Bastar', 'Dungarpur', 'Sundargarh', 'Gumla', 'Khunti', 'West Singhbhum', 'Hazaribagh'];
        for (const d of districts) {
          if (new RegExp(`\\b${d}\\b`, 'i').test(cleanText)) {
            extractedVal = d;
            confidence = 0.94;
            break;
          }
        }
        break;
      }
      case 'category': {
        if (/scheduled\s*tribe|\bst\b/i.test(cleanText)) {
          extractedVal = 'ST';
          confidence = 0.97;
        }
        break;
      }
      case 'issuingAuthority': {
        if (/tehsildar/i.test(cleanText)) {
          extractedVal = 'Office of the Tehsildar';
          confidence = 0.92;
        } else if (/sub-?divisional/i.test(cleanText)) {
          extractedVal = 'Sub-Divisional Officer (SDO)';
          confidence = 0.92;
        } else if (/district\s*magistrate/i.test(cleanText)) {
          extractedVal = 'District Magistrate';
          confidence = 0.92;
        }
        break;
      }
      default:
        break;
    }

    if (extractedVal === null || extractedVal === undefined || extractedVal === '') {
      extractedVal = 'Unable to confidently extract';
      confidence = 0.45;
      isLow = true;
    }

    fields[key] = {
      value: extractedVal,
      confidence: confidence,
      source: 'OCR',
      sourcePage: 1,
      isLowConfidence: isLow || confidence < 0.70,
      originalValue: extractedVal,
      isEdited: false,
      editedValue: null,
      editedBy: null,
      editedAt: null,
    };
  });

  return fields;
}

/**
 * Process uploaded document through the OCR extraction pipeline
 */
async function processDocumentOcr({ filePath, buffer, originalName, mimeType, docType, studentContext = {} }) {
  const fileHash = computeFileHash(buffer);
  let ocrText = '';
  let ocrStatus = 'COMPLETED';
  let extractedFields = {};
  let rawAiResponse = null;

  // 1. Attempt to invoke the AI Engine / RapidOCR service
  try {
    const blob = new Blob([buffer], { type: mimeType });
    const formData = new FormData();
    formData.append('file', blob, originalName);
    formData.append('documentType', docType);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const aiRes = await fetch(`${AI_ENGINE_URL}/api/analyze-document`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (aiRes.ok) {
      const data = await aiRes.json();
      if (data && data.success) {
        rawAiResponse = data;
        ocrText = data.ocr?.text || '';
        const aiFields = data.fields || {};

      // Map AI Engine fields into canonical schema format
      const schema = getSchemaByType(docType);
      if (schema) {
        schema.fields.forEach((fDef) => {
          const key = fDef.key;
          const aiF = aiFields[key] || aiFields[key.toLowerCase()];
          if (aiF && aiF.value && aiF.value !== 'Not detected') {
            const conf = typeof aiF.confidence === 'number' ? aiF.confidence : 0.90;
            extractedFields[key] = {
              value: aiF.value,
              confidence: conf,
              source: 'OCR',
              sourcePage: aiF.sourcePage || 1,
              isLowConfidence: conf < 0.70,
              originalValue: aiF.value,
              isEdited: false,
              editedValue: null,
              editedBy: null,
              editedAt: null,
            };
          }
        });
      }
    }
  }
} catch (aiErr) {
    // If Python AI engine is offline or times out, fall back cleanly to heuristic extraction
    // without crashing the system or inventing fake records
    console.warn(`[Sandbox OCR] AI Engine HTTP call skipped or failed (${aiErr.message}), falling back to internal text analyzer`);
  }

  // 2. If OCR text was not obtained via AI engine, inspect buffer for text (e.g. text in PDF)
  if (!ocrText) {
    // Basic text extraction from buffer string representation if PDF/text stream
    const rawStr = buffer.toString('utf-8', 0, Math.min(buffer.length, 50000));
    const asciiMatches = rawStr.match(/[A-Za-z0-9/.,\-:₹ ]{4,}/g);
    if (asciiMatches && asciiMatches.length > 5) {
      ocrText = asciiMatches.join(' ');
    } else {
      ocrText = `Document: ${originalName} [Format: ${mimeType}]`;
    }
  }

  // 3. Complete field extraction for any missing schema fields
  const fallbackFields = extractFieldsFromText(ocrText, docType, studentContext);
  Object.keys(fallbackFields).forEach((key) => {
    if (!extractedFields[key]) {
      extractedFields[key] = fallbackFields[key];
    }
  });

  // 4. Determine overall document status based on extraction confidence
  const hasLowConfidence = Object.values(extractedFields).some((f) => f.isLowConfidence);
  const status = hasLowConfidence ? 'REVIEW_REQUIRED' : 'OCR_COMPLETED';

  return {
    fileHash,
    ocrText,
    ocrStatus,
    status,
    extractedData: extractedFields,
    hasLowConfidence,
  };
}

module.exports = {
  computeFileHash,
  extractFieldsFromText,
  processDocumentOcr,
};

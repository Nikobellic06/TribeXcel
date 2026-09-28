/**
 * Unified Document-Specific Extraction Engine
 */
import { DOCUMENT_SCHEMAS } from '../schemas/documentSchemas.js';
import { extractByLabelAndProximity } from './proximityExtractor.js';
import { INCOME_PATTERNS } from '../patterns/income.js';
import { CERTIFICATE_PATTERNS } from '../patterns/certificate.js';
import { EDUCATION_PATTERNS } from '../patterns/education.js';
import { BANK_PATTERNS } from '../patterns/bank.js';
import { DATE_PATTERNS } from '../patterns/dates.js';
import { IDENTITY_PATTERNS } from '../patterns/identity.js';
import {
  cleanText,
  normalizeTribeName,
  normalizeIncome,
  normalizePercentage,
  normalizeDate,
  normalizeIfsc,
  maskAadhaar,
  maskBankAccount
} from '../normalizers/fieldNormalizers.js';

export function extractDocumentSpecificFields(docType, fullText = '', lines = [], avgOcrConf = 0.90) {
  const schema = DOCUMENT_SCHEMAS[docType] || DOCUMENT_SCHEMAS.UNKNOWN;
  const fields = {};
  const fieldConfidence = {};
  const issues = [];

  const extract = (fieldKey, labelRegexes, valueRegexes, normalizer = cleanText) => {
    const res = extractByLabelAndProximity({
      labelRegexes,
      valueRegexes,
      lines,
      fullText,
      fieldKey,
      avgOcrConf,
      normalizer
    });

    fields[fieldKey] = res.value;
    fieldConfidence[fieldKey] = res;

    if (res.validation === 'INVALID') {
      issues.push(`Field '${fieldKey}' failed validation (Value: ${JSON.stringify(res.value)})`);
    } else if (res.validation === 'LOW_CONFIDENCE') {
      issues.push(`Field '${fieldKey}' has low confidence (Score: ${res.confidence})`);
    }
  };

  switch (docType) {
    case 'ST_CERTIFICATE':
    case 'PVTG_CERTIFICATE': {
      extract('fullName', [/(?:this\s+is\s+to\s+certify\s+that|certify\s+that|name\s*[:\-])/i], IDENTITY_PATTERNS.names);
      extract('fatherName', [/(?:son\s+of|daughter\s+of|s\/o|d\/o|father['’]?s\s*name\s*[:\-])/i], IDENTITY_PATTERNS.fathers);
      extract('motherName', [/(?:mother['’]?s\s*name\s*[:\-])/i], IDENTITY_PATTERNS.mothers);
      extract('tribeName', [/(?:belongs\s+to\s+the|tribe\s*[:\-]|community|caste\s*[:\-])/i], IDENTITY_PATTERNS.tribes, normalizeTribeName);
      
      const categoryVal = docType === 'PVTG_CERTIFICATE' ? 'PVTG' : 'ST';
      fields['category'] = categoryVal;
      fieldConfidence['category'] = {
        value: categoryVal,
        confidence: 0.99,
        source: 'STATUTORY_CLASSIFICATION',
        page: 1,
        matchedLabel: 'Category',
        validation: 'VALID'
      };

      extract('certificateNumber', CERTIFICATE_PATTERNS.labels, CERTIFICATE_PATTERNS.numbers);
      extract('issueDate', DATE_PATTERNS.issueDateLabels, DATE_PATTERNS.generalDates, normalizeDate);
      extract('issuingAuthority', [/(?:issuing\s+authority|issued\s+by|officer)/i], CERTIFICATE_PATTERNS.issuingAuthorities);
      extract('state', [/(?:state\s+of|state\s*[:\-])/i], CERTIFICATE_PATTERNS.states);
      extract('district', [/(?:district\s*[:\-]|dist\.?\s*[:\-])/i], CERTIFICATE_PATTERNS.districts);
      break;
    }

    case 'INCOME_CERTIFICATE': {
      extract('fullName', [/(?:certify\s+that|name\s*[:\-])/i], IDENTITY_PATTERNS.names);
      extract('fatherName', [/(?:son\s+of|daughter\s+of|s\/o|d\/o|father['’]?s\s*name\s*[:\-])/i], IDENTITY_PATTERNS.fathers);
      extract('annualIncome', INCOME_PATTERNS.labels, INCOME_PATTERNS.monetaryAmounts, normalizeIncome);
      extract('incomePeriod', [/(?:financial\s+year|period|year\s*[:\-])/i], INCOME_PATTERNS.financialYears);
      extract('financialYear', [/(?:financial\s+year|assessment\s+year|f\.?y\.?)/i], INCOME_PATTERNS.financialYears);
      extract('certificateNumber', CERTIFICATE_PATTERNS.labels, CERTIFICATE_PATTERNS.numbers);
      extract('issueDate', DATE_PATTERNS.issueDateLabels, DATE_PATTERNS.generalDates, normalizeDate);
      extract('issuingAuthority', [/(?:issuing\s+authority|officer|authority)/i], INCOME_PATTERNS.issuingAuthorities);
      extract('state', [/(?:state\s*[:\-])/i], CERTIFICATE_PATTERNS.states);
      extract('district', [/(?:district\s*[:\-])/i], CERTIFICATE_PATTERNS.districts);
      break;
    }

    case 'MARKSHEET': {
      extract('studentName', [/(?:student['’]?s\s*name|candidate['’]?s\s*name|name\s*[:\-])/i], IDENTITY_PATTERNS.names);
      extract('rollNumber', [/(?:roll\s+no\.?|registration\s+no\.?|roll\s+number)/i], EDUCATION_PATTERNS.rollNumbers);
      extract('institution', [/(?:school|college|institution|vidyalaya|center)/i], EDUCATION_PATTERNS.institutions);
      extract('board', [/(?:board|council|examining\s+body)/i], EDUCATION_PATTERNS.boards);
      extract('examination', [/(?:examination|exam\s+name|annual\s+exam)/i], [/(?:higher\s+secondary|secondary\s+school|intermediate|matriculation|matric|class\s+[A-Za-z0-9]+)/i]);
      extract('class', [/(?:class|standard|grade)/i], EDUCATION_PATTERNS.classes);
      extract('academicYear', [/(?:academic\s+year|year|session)/i], [/\b(20\d\d[-/]\d\d|\b20\d\d\b)/]);

      // Total & Maximum Marks (e.g. 437 / 500)
      const matrixMatch = fullText.match(/(?:total|marks\s+obtained|aggregate|grand\s+total)\s*[:\-]?\s*([0-9]{2,4})\s*(?:\/|\s+out\s+of\s+)\s*([0-9]{2,4})/i)
        || fullText.match(/\b([0-9]{2,4})\s*\/\s*([0-9]{2,4})\b/);
      if (matrixMatch) {
        fields['totalMarks'] = matrixMatch[1];
        fields['maximumMarks'] = matrixMatch[2];
        fieldConfidence['totalMarks'] = { value: matrixMatch[1], confidence: 0.95, source: 'OCR_SCORING_MATRIX', validation: 'VALID' };
        fieldConfidence['maximumMarks'] = { value: matrixMatch[2], confidence: 0.95, source: 'OCR_SCORING_MATRIX', validation: 'VALID' };
      } else {
        extract('totalMarks', [/(?:total\s+marks|marks\s+obtained)/i], [/\b([0-9]{2,4})\b/]);
        extract('maximumMarks', [/(?:maximum\s+marks|max\s+marks)/i], [/\b([0-9]{2,4})\b/]);
      }

      extract('percentage', [/(?:percentage|marks\s+percentage|pct\.?|aggregate)/i], EDUCATION_PATTERNS.percentages, normalizePercentage);
      extract('result', [/(?:result|division|grade)/i], EDUCATION_PATTERNS.results);
      extract('grade', [/(?:grade|division)/i], [/\b([A-D][+]?|first|second|distinction)\b/i]);
      fields['subjects'] = [];
      fields['subjectMarks'] = {};
      break;
    }

    case 'DOMICILE_CERTIFICATE': {
      extract('fullName', [/(?:certify\s+that|name\s*[:\-])/i], IDENTITY_PATTERNS.names);
      extract('fatherName', [/(?:son\s+of|daughter\s+of|s\/o|d\/o|father\s*[:\-])/i], IDENTITY_PATTERNS.fathers);
      extract('address', [/(?:resident\s+of|address\s*[:\-])/i], [/(?:village|at|po|ps|house\s+no)[^\n\r]+/i], (v) => cleanText(v, true));
      extract('state', [/(?:state\s*[:\-])/i], CERTIFICATE_PATTERNS.states);
      extract('district', [/(?:district\s*[:\-])/i], CERTIFICATE_PATTERNS.districts);
      extract('certificateNumber', CERTIFICATE_PATTERNS.labels, CERTIFICATE_PATTERNS.numbers);
      extract('issueDate', DATE_PATTERNS.issueDateLabels, DATE_PATTERNS.generalDates, normalizeDate);
      extract('issuingAuthority', [/(?:issuing\s+authority|officer)/i], CERTIFICATE_PATTERNS.issuingAuthorities);
      break;
    }

    case 'AADHAAR': {
      extract('name', [/(?:government\s+of\s+india|name|to|shri\/smt\.?)/i], IDENTITY_PATTERNS.names);
      extract('dateOfBirth', DATE_PATTERNS.dobLabels, DATE_PATTERNS.generalDates, normalizeDate);
      extract('gender', [/(?:gender|sex|\bलिंग\b)/i], IDENTITY_PATTERNS.gender);
      extract('maskedAadhaarNumber', [/(?:aadhaar|aadhar|\bसंख्या\b)/i], IDENTITY_PATTERNS.aadhaar, maskAadhaar);
      extract('address', [/(?:address\s*[:\-]|पता\s*[:\-])/i], [/(?:s\/o|d\/o|w\/o|c\/o|at|po|vill)[^\n\r]+/i], (v) => cleanText(v, true));
      
      // Backward compatibility alias
      fields['aadhaarNumber'] = fields['maskedAadhaarNumber'];
      fieldConfidence['aadhaarNumber'] = fieldConfidence['maskedAadhaarNumber'];
      break;
    }

    case 'BANK_PASSBOOK': {
      extract('accountHolderName', [/(?:account\s+holder|name\s*[:\-])/i], IDENTITY_PATTERNS.names);
      extract('bankName', [/(?:bank|bank\s+name)/i], BANK_PATTERNS.bankNames);
      extract('branch', [/(?:branch|branch\s+name)/i], BANK_PATTERNS.branches);
      extract('maskedAccountNumber', [/(?:account\s+no\.?|a\/c\s+no\.?|ac\s+no\.?)/i], BANK_PATTERNS.accountNumbers, maskBankAccount);
      extract('ifsc', [/(?:ifsc|ifs\s+code)/i], BANK_PATTERNS.ifsc, normalizeIfsc);
      break;
    }

    case 'DEGREE_CERTIFICATE': {
      extract('name', [/(?:conferred\s+upon|admitted\s+to|name\s*[:\-])/i], IDENTITY_PATTERNS.names);
      extract('degree', [/(?:degree\s+of|diploma\s+in|bachelor\s+of|master\s+of)/i], [/(?:bachelor\s+of\s+[A-Za-z\s]+|master\s+of\s+[A-Za-z\s]+|doctor\s+of\s+[A-Za-z\s]+|b\.[a-z]+|m\.[a-z]+|ph\.?d)/i]);
      extract('specialization', [/(?:in\s+the\s+faculty\s+of|branch|specialization|discipline)/i], [/(?:computer\s+science|mechanical|electrical|civil|history|tribal\s+studies|botany|chemistry|arts|commerce)[A-Za-z\s]*/i]);
      extract('university', [/(?:university|institution|institute)/i], [/(?:[A-Za-z\s]+university|[A-Za-z\s]+institute\s+of\s+technology)/i]);
      extract('institution', [/(?:college|institution)/i], EDUCATION_PATTERNS.institutions);
      extract('year', [/(?:year|convocation|held\s+in)/i], [/\b(20\d\d|\b19\d\d)\b/]);
      extract('percentage', [/(?:percentage|cgpa|marks)/i], EDUCATION_PATTERNS.percentages, normalizePercentage);
      extract('certificateNumber', CERTIFICATE_PATTERNS.labels, CERTIFICATE_PATTERNS.numbers);
      extract('issueDate', DATE_PATTERNS.issueDateLabels, DATE_PATTERNS.generalDates, normalizeDate);
      break;
    }

    case 'ADMISSION_LETTER':
    case 'OFFER_LETTER': {
      extract('applicantName', [/(?:dear|student|name|candidate\s*[:\-])/i], IDENTITY_PATTERNS.names);
      extract('institution', [/(?:university|college|institution)/i], EDUCATION_PATTERNS.institutions);
      extract('course', [/(?:programme|course|offered\s+admission\s+to)/i], [/(?:m\.?phil|ph\.?d|master\s+of\s+[A-Za-z\s]+|m\.tech|m\.sc|m\.a\.)/i]);
      extract('programme', [/(?:programme|course)/i], [/(?:regular|full\s+time|research|doctoral|postgraduate)/i]);
      extract('admissionYear', [/(?:academic\s+year|session|admission\s+year)/i], [/\b(20\d\d(?:[-/]\d\d)?)\b/]);
      extract('country', [/(?:country|location)/i], [/\b(united\s+kingdom|uk|united\s+states|usa|australia|germany|canada|india)\b/i]);
      extract('issueDate', DATE_PATTERNS.issueDateLabels, DATE_PATTERNS.generalDates, normalizeDate);
      extract('referenceNumber', [/(?:reference\s+no\.?|ref\s+no\.?|application\s+id)/i], CERTIFICATE_PATTERNS.numbers);
      break;
    }

    case 'DISABILITY_CERTIFICATE': {
      extract('name', [/(?:certify\s+that|name\s*[:\-])/i], IDENTITY_PATTERNS.names);
      extract('disabilityType', [/(?:nature\s+of\s+disability|type\s+of\s+disability|disability\s*[:\-])/i], [/(?:locomotor|visual|hearing|blindness|orthopedic|cerebral\s+palsy|mental)[A-Za-z\s]*/i]);
      extract('disabilityPercentage', [/(?:percentage\s+of\s+disability|disability\s+percentage)/i], [/\b([1-9][0-9]?)\s*%/i], normalizePercentage);
      extract('certificateNumber', CERTIFICATE_PATTERNS.labels, CERTIFICATE_PATTERNS.numbers);
      extract('issueDate', DATE_PATTERNS.issueDateLabels, DATE_PATTERNS.generalDates, normalizeDate);
      extract('issuingAuthority', [/(?:issuing\s+authority|medical\s+board|chief\s+medical\s+officer)/i], [/(?:chief\s+medical\s+officer|cmo|medical\s+board|civil\s+surgeon)/i]);
      break;
    }

    case 'BONAFIDE_CERTIFICATE': {
      extract('name', [/(?:certify\s+that|name\s*[:\-])/i], IDENTITY_PATTERNS.names);
      extract('institution', [/(?:institution|school|college)/i], EDUCATION_PATTERNS.institutions);
      extract('course', [/(?:studying\s+in|course|class)/i], EDUCATION_PATTERNS.classes);
      extract('academicYear', [/(?:academic\s+year|session|year)/i], [/\b(20\d\d[-/]\d\d|\b20\d\d\b)/]);
      extract('certificateNumber', CERTIFICATE_PATTERNS.labels, CERTIFICATE_PATTERNS.numbers);
      extract('issueDate', DATE_PATTERNS.issueDateLabels, DATE_PATTERNS.generalDates, normalizeDate);
      break;
    }

    case 'FEE_RECEIPT': {
      extract('studentName', [/(?:received\s+from|student\s+name|name\s*[:\-])/i], IDENTITY_PATTERNS.names);
      extract('institution', [/(?:institution|college|school)/i], EDUCATION_PATTERNS.institutions);
      extract('feeAmount', [/(?:total\s+amount|amount\s+paid|fee\s+amount|sum\s+of\s+rupees)/i], INCOME_PATTERNS.monetaryAmounts, normalizeIncome);
      extract('feeType', [/(?:fee\s+type|particulars|on\s+account\s+of)/i], [/(?:tuition\s+fee|admission\s+fee|exam\s+fee|hostel\s+fee|semester\s+fee)/i]);
      extract('receiptNumber', [/(?:receipt\s+no\.?|challan\s+no\.?|txn\s+id)/i], CERTIFICATE_PATTERNS.numbers);
      extract('paymentDate', DATE_PATTERNS.issueDateLabels, DATE_PATTERNS.generalDates, normalizeDate);
      extract('academicYear', [/(?:session|academic\s+year|year)/i], [/\b(20\d\d[-/]\d\d|\b20\d\d\b)/]);
      break;
    }

    default: {
      extract('name', [/(?:name|student|applicant)/i], IDENTITY_PATTERNS.names);
      extract('documentReference', CERTIFICATE_PATTERNS.labels, CERTIFICATE_PATTERNS.numbers);
      fields['rawTextSnippet'] = fullText.slice(0, 180);
      break;
    }
  }

  // Identify missing required fields
  const missingFields = (schema.requiredFields || []).filter(f => !fields[f] || fields[f] === null);

  return {
    fields,
    fieldConfidence,
    missingFields,
    issues
  };
}

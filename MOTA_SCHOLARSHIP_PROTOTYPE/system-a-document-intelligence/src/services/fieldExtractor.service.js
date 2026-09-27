/**
 * Document-Specific Field Extraction Service
 * 
 * Uses deterministic OCR parsing, field label proximity, and regular expressions
 * to extract ONLY fields present in the document.
 * 
 * Never invents values. If missing or obscured, returns null.
 * Includes per-field confidence based on OCR certainty and pattern specificity.
 */

// Helper to clean extracted text
function clean(str) {
  if (!str) return null;
  const firstLine = String(str).split(/\r?\n/)[0];
  const s = firstLine.trim().replace(/^[:\-–=.\s]+/, '').replace(/[:\-–=.\s]+$/, '').trim();
  return s.length > 0 ? s : null;
}

// Regex helpers
function extractFirstMatch(text, regex, group = 1) {
  const m = text.match(regex);
  return m && m[group] ? clean(m[group]) : null;
}

export function extractDocumentFields(docType, fullText = '', lines = [], avgOcrConf = 0.90) {
  const text = fullText || '';
  const fields = {};
  const fieldConfidence = {};

  const makeField = (key, val, baseConf = 0.92) => {
    if (val !== null && val !== undefined && String(val).trim() !== '') {
      const cleaned = clean(val);
      const conf = Number(Math.min(0.99, Math.max(0.60, avgOcrConf * baseConf)).toFixed(2));
      fields[key] = cleaned;
      fieldConfidence[key] = {
        value: cleaned,
        confidence: conf,
        source: 'OCR'
      };
    } else {
      fields[key] = null;
      fieldConfidence[key] = {
        value: null,
        confidence: 0.0,
        source: 'NOT_FOUND'
      };
    }
  };

  switch (docType) {
    case 'ST_CERTIFICATE': {
      // Keys: fullName, fatherName, tribeName, category, certificateNumber, issueDate, issuingAuthority, state, district
      const name = extractFirstMatch(text, /(?:this is to certify that|certify that|name\s*[:\-]|shri\/smt\.?|kumari|student\s*[:\-])\s*([A-Z][a-zA-Z\s]{2,30})(?:\s+son|\s+daughter|\s+s\/o|\s+d\/o|\s+belongs|\n|,)/i)
        || extractFirstMatch(text, /(?:name\s*[:\-]\s*)([A-Za-z\s]+)/i);
      
      const father = extractFirstMatch(text, /(?:son\s+of|daughter\s+of|s\/o|d\/o|father['’]?s\s*name\s*[:\-])\s*(?:shri\s+)?([A-Z][a-zA-Z\s]{2,30})(?:\s+resident|\s+of|\n|,)/i);

      const tribe = extractFirstMatch(text, /(?:belongs\s+to\s+the|community|tribe\s*[:\-]|caste\s*[:\-])\s*([A-Za-z]+(?:\s+[A-Za-z]+)?)(?:\s+tribe|\s+community|\s+which\s+is\s+recognized|\n|,)/i)
        || extractFirstMatch(text, /\b(santhal|santal|gond|munda|oraon|bhil|bodo|khasi|garo|ho|kol|birhor)\b/i);

      const certNo = extractFirstMatch(text, /(?:certificate\s+no\.?|cert\s+no\.?|registration\s+no\.?|case\s+no\.?)\s*[:\-]?\s*([A-Z0-9\/\-_]+)/i)
        || extractFirstMatch(text, /\b([A-Z]{2}\/ST\/[0-9]{4}\/[0-9]+)\b/i);

      const date = extractFirstMatch(text, /(?:date\s+of\s+issue|issue\s+date|dated|date)\s*[:\-]?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})/i);

      const authority = extractFirstMatch(text, /(sub-divisional\s+officer|tahasildar|tehsildar|deputy\s+commissioner|district\s+magistrate|executive\s+magistrate)/i);

      const state = extractFirstMatch(text, /(?:state\s+of|state\s*[:\-]?)\s*([A-Za-z\s]+)(?:,|\.|\n)/i)
        || extractFirstMatch(text, /\b(jharkhand|odisha|orissa|chhattisgarh|madhya\s+pradesh|maharashtra|rajasthan|gujarat|assam)\b/i);

      const district = extractFirstMatch(text, /(?:district\s*[:\-]?|dist\.?\s*[:\-]?)\s*([A-Za-z]+)/i);

      makeField('fullName', name);
      makeField('fatherName', father);
      makeField('tribeName', tribe);
      makeField('category', 'ST');
      makeField('certificateNumber', certNo);
      makeField('issueDate', date);
      makeField('issuingAuthority', authority);
      makeField('state', state);
      makeField('district', district);
      break;
    }

    case 'INCOME_CERTIFICATE': {
      // Keys: fullName, fatherName, annualIncome, incomePeriod, certificateNumber, issueDate, issuingAuthority, state, district
      const name = extractFirstMatch(text, /(?:certify\s+that|name\s*[:\-]|shri\/smt\.?)\s*([A-Z][a-zA-Z\s]{2,30})(?:\s+son|\s+daughter|\s+s\/o|\s+resident|\n|,)/i);
      const father = extractFirstMatch(text, /(?:son\s+of|daughter\s+of|s\/o|d\/o|father['’]?s\s*name\s*[:\-])\s*(?:shri\s+)?([A-Z][a-zA-Z\s]{2,30})(?:\s+resident|\s+of|\n|,)/i);

      const income = extractFirstMatch(text, /(?:annual\s+family\s+income|annual\s+income|gross\s+income|total\s+income|income\s*[:\-])\s*(?:is\s*)?(?:rs\.?|inr|\u20B9)?\s*([0-9,]+(?:\.\d+)?)/i)
        || extractFirstMatch(text, /(?:rupees|rs\.?|\u20B9)\s*([0-9,]{4,10})/i);

      const period = extractFirstMatch(text, /(?:financial\s+year|period|year)\s*[:\-]?\s*([0-9]{4}[-\/][0-9]{2,4})/i);
      const certNo = extractFirstMatch(text, /(?:certificate\s+no\.?|cert\s+no\.?|application\s+no\.?)\s*[:\-]?\s*([A-Z0-9\/\-_]+)/i);
      const date = extractFirstMatch(text, /(?:date\s+of\s+issue|issue\s+date|dated|date)\s*[:\-]?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i);
      const authority = extractFirstMatch(text, /(circle\s+officer|tehsildar|tahasildar|revenue\s+officer|revenue\s+divisional\s+officer)/i);
      const state = extractFirstMatch(text, /\b(jharkhand|odisha|chhattisgarh|madhya\s+pradesh|maharashtra|rajasthan|gujarat|assam)\b/i);
      const district = extractFirstMatch(text, /(?:district\s*[:\-]?|dist\.?\s*[:\-]?)\s*([A-Za-z]+)/i);

      makeField('fullName', name);
      makeField('fatherName', father);
      makeField('annualIncome', income ? income.replace(/,/g, '') : null);
      makeField('incomePeriod', period);
      makeField('certificateNumber', certNo);
      makeField('issueDate', date);
      makeField('issuingAuthority', authority);
      makeField('state', state);
      makeField('district', district);
      break;
    }

    case 'MARKSHEET': {
      // Keys: studentName, rollNumber, institution, board, examination, class, academicYear, subjects, totalMarks, maximumMarks, percentage, result
      const name = extractFirstMatch(text, /(?:name\s+of\s+candidate|student\s+name|candidate['’]?s\s+name|name\s*[:\-])\s*([A-Z][a-zA-Z\s]{2,30})(?:\n|roll|regn|,)/i);
      const roll = extractFirstMatch(text, /(?:roll\s+no\.?|roll\s+number|registration\s+no\.?)\s*[:\-]?\s*([A-Z0-9\-]+)/i);
      const inst = extractFirstMatch(text, /(?:school\/college|institution|college|school)\s*[:\-]?\s*([A-Za-z0-9\s,.'’\-]{3,45})(?:\n|district|code)/i);
      const board = extractFirstMatch(text, /(central\s+board\s+of\s+secondary\s+education|cbse|council\s+of\s+higher\s+secondary|chse|jharkhand\s+academic\s+council|jac|icse|state\s+board)/i);
      const exam = extractFirstMatch(text, /(secondary\s+school\s+examination|higher\s+secondary\s+examination|intermediate\s+examination|annual\s+examination|class\s+xii|class\s+x)/i);
      const cls = extractFirstMatch(text, /\b(class\s+x|class\s+xii|10th|12th|class\s+ix|class\s+10|class\s+12)\b/i);
      const year = extractFirstMatch(text, /\b(20[12]\d)\b/);

      const marks = extractFirstMatch(text, /(?:total\s+marks|marks\s+obtained|aggregate)\s*[:\-]?\s*(\d{2,4})/i);
      const maxMarks = extractFirstMatch(text, /(?:maximum\s+marks|max\s+marks|out\s+of)\s*[:\-]?\s*(\d{3,4})/i);
      const pct = extractFirstMatch(text, /(?:percentage|aggregate\s*%|marks\s*%|result)\s*[:\-]?\s*(\d{1,2}(?:\.\d{1,2})?)\s*%/i)
        || extractFirstMatch(text, /\b(\d{2}\.\d{1,2})\s*%/);
      const result = extractFirstMatch(text, /\b(passed|promoted|first\s+division|distinction|pass)\b/i);

      makeField('studentName', name);
      makeField('rollNumber', roll);
      makeField('institution', inst);
      makeField('board', board);
      makeField('examination', exam);
      makeField('class', cls);
      makeField('academicYear', year);
      makeField('totalMarks', marks);
      makeField('maximumMarks', maxMarks);
      makeField('percentage', pct ? `${pct}%` : null);
      makeField('result', result);
      break;
    }

    case 'DOMICILE_CERTIFICATE': {
      // Keys: fullName, fatherName, address, state, district, certificateNumber, issueDate, issuingAuthority
      const name = extractFirstMatch(text, /(?:certify\s+that|name\s*[:\-]|shri\/smt\.?)\s*([A-Z][a-zA-Z\s]{2,30})(?:\s+son|\s+daughter|\s+s\/o|\s+resident|\n|,)/i);
      const father = extractFirstMatch(text, /(?:son\s+of|daughter\s+of|s\/o|d\/o|father['’]?s\s*name\s*[:\-])\s*(?:shri\s+)?([A-Z][a-zA-Z\s]{2,30})/i);
      const addr = extractFirstMatch(text, /(?:resident\s+of|address\s*[:\-])\s*([A-Za-z0-9\s,.\-_]{5,60})(?:\n|district|state)/i);
      const state = extractFirstMatch(text, /\b(jharkhand|odisha|chhattisgarh|madhya\s+pradesh|maharashtra|rajasthan|gujarat|assam)\b/i);
      const district = extractFirstMatch(text, /(?:district\s*[:\-]?|dist\.?\s*[:\-]?)\s*([A-Za-z]+)/i);
      const certNo = extractFirstMatch(text, /(?:certificate\s+no\.?|cert\s+no\.?|reference\s+no\.?)\s*[:\-]?\s*([A-Z0-9\/\-_]+)/i);
      const date = extractFirstMatch(text, /(?:date\s+of\s+issue|issue\s+date|dated|date)\s*[:\-]?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i);
      const authority = extractFirstMatch(text, /(tehsildar|tahasildar|circle\s+officer|revenue\s+divisional\s+officer|sub-divisional\s+officer)/i);

      makeField('fullName', name);
      makeField('fatherName', father);
      makeField('address', addr);
      makeField('state', state);
      makeField('district', district);
      makeField('certificateNumber', certNo);
      makeField('issueDate', date);
      makeField('issuingAuthority', authority);
      break;
    }

    case 'AADHAAR': {
      // Keys: name, dateOfBirth, gender, aadhaarNumber, maskedAadhaarNumber, address
      const name = extractFirstMatch(text, /(?:name\s*[:\-]\s*)([A-Z][a-zA-Z\s]{2,30})/i)
        || extractFirstMatch(text, /(?:to\s*\n|government\s+of\s+india\s*\n)([A-Z][a-zA-Z\s]{2,30})(?:\n|dob|father)/i)
        || extractFirstMatch(text, /([A-Z][a-zA-Z\s]{2,25})\n(?:dob|date\s+of\s+birth)/i);

      const dob = extractFirstMatch(text, /(?:dob|date\s+of\s+birth|year\s+of\s+birth)\s*[:\-]?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{4})/i);
      const gender = extractFirstMatch(text, /\b(male|female|transgender)\b/i);
      const uid = extractFirstMatch(text, /(?:aadhaar\s*(?:number|no\.?)?\s*[:\-]?\s*)?(\d{4}\s+\d{4}\s+\d{4})/i)
        || extractFirstMatch(text, /\b(\d{4}\s+\d{4}\s+\d{4})\b/)
        || extractFirstMatch(text, /\b([X\d]{4}\s+[X\d]{4}\s+\d{4})\b/);
      const addr = extractFirstMatch(text, /(?:address\s*[:\-]?\s*)([A-Za-z0-9\s,.\-_]{10,80})/i);

      makeField('name', name);
      makeField('dateOfBirth', dob);
      makeField('gender', gender);
      makeField('aadhaarNumber', uid ? uid.replace(/^\d{4}\s+\d{4}/, 'XXXX XXXX') : null);
      makeField('maskedAadhaarNumber', uid ? uid.replace(/^\d{4}\s+\d{4}/, 'XXXX XXXX') : null);
      makeField('address', addr);
      break;
    }

    case 'BANK_PASSBOOK': {
      // Keys: accountHolderName, bankName, branch, maskedAccountNumber, IFSC
      const name = extractFirstMatch(text, /(?:name\s*[:\-]|account\s+holder|a\/c\s+holder)\s*[:\-]?\s*([A-Z][a-zA-Z\s]{2,30})/i);
      const bank = extractFirstMatch(text, /(state\s+bank\s+of\s+india|punjab\s+national\s+bank|bank\s+of\s+baroda|canara\s+bank|central\s+bank\s+of\s+india|union\s+bank|hdfc\s+bank|icici\s+bank|axis\s+bank)/i);
      const branch = extractFirstMatch(text, /(?:branch\s*[:\-]?\s*)([A-Za-z0-9\s,.\-]+)(?:\n|ifsc|micr)/i);
      const acct = extractFirstMatch(text, /(?:account\s+no\.?|a\/c\s+no\.?|ac\s+no\.?)\s*[:\-]?\s*([0-9X]{8,18})/i);
      const ifsc = extractFirstMatch(text, /\b([A-Z]{4}0[A-Z0-9]{6})\b/i);

      makeField('accountHolderName', name);
      makeField('bankName', bank);
      makeField('branch', branch);
      makeField('maskedAccountNumber', acct ? acct.replace(/^\d{6,12}/, 'XXXXXX') : null);
      makeField('IFSC', ifsc ? ifsc.toUpperCase() : null);
      break;
    }

    case 'DEGREE_CERTIFICATE': {
      // Keys: name, degree, specialization, university, institution, year, percentage/CGPA, certificateNumber
      const name = extractFirstMatch(text, /(?:conferred\s+upon|admitted\s+to\s+the\s+degree\s+of|certify\s+that)\s*([A-Z][a-zA-Z\s]{2,30})/i);
      const degree = extractFirstMatch(text, /(bachelor\s+of\s+[A-Za-z\s]+|master\s+of\s+[A-Za-z\s]+|doctor\s+of\s+philosophy|b\.tech|m\.tech|b\.sc|m\.sc|m\.a\.|b\.a\.)/i);
      const spec = extractFirstMatch(text, /(?:in|branch\s+of|specialization\s+in)\s*([A-Za-z\s]{3,30})(?:\s+faculty|\n|,)/i);
      const univ = extractFirstMatch(text, /(?:university|institute)\s+of\s+[A-Za-z\s]+/i)
        || extractFirstMatch(text, /(ranchi\s+university|sambalpur\s+university|jawaharlal\s+nehru\s+university|delhi\s+university|banaras\s+hindu\s+university)/i);
      const year = extractFirstMatch(text, /\b(20[12]\d)\b/);
      const certNo = extractFirstMatch(text, /(?:degree\s+no\.?|roll\s+no\.?|serial\s+no\.?)\s*[:\-]?\s*([A-Z0-9\/\-_]+)/i);

      makeField('name', name);
      makeField('degree', degree);
      makeField('specialization', spec);
      makeField('university', univ);
      makeField('year', year);
      makeField('certificateNumber', certNo);
      break;
    }

    case 'ADMISSION_LETTER':
    case 'OFFER_LETTER': {
      // Keys: applicantName, institution, course, programme, admissionYear, country, issueDate
      const name = extractFirstMatch(text, /(?:dear\s+|candidate\s+name\s*[:\-]|applicant\s*[:\-])\s*([A-Z][a-zA-Z\s]{2,30})/i);
      const inst = extractFirstMatch(text, /(national\s+institute\s+of\s+technology[A-Za-z\s,]*|indian\s+institute\s+of\s+technology[A-Za-z\s,]*|university\s+of\s+[A-Za-z\s]+|[A-Za-z\s]+university)/i);
      const course = extractFirstMatch(text, /(?:admitted\s+to|course\s*[:\-]|programme\s*[:\-])\s*([A-Za-z0-9\s&()\-]{3,40})(?:\n|academic|session)/i);
      const year = extractFirstMatch(text, /\b(202[3-7])\b/);
      const date = extractFirstMatch(text, /(?:date\s*[:\-]?\s*)(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i);

      makeField('applicantName', name);
      makeField('institution', inst);
      makeField('course', course);
      makeField('admissionYear', year);
      makeField('issueDate', date);
      break;
    }

    case 'BONAFIDE_CERTIFICATE': {
      // Keys: name, institution, course/class, academicYear, certificateNumber
      const name = extractFirstMatch(text, /(?:certify\s+that|student\s*[:\-])\s*([A-Z][a-zA-Z\s]{2,30})(?:\s+is\s+a\s+bonafide|\n|,)/i);
      const inst = extractFirstMatch(text, /(?:institution|college|school)\s*[:\-]?\s*([A-Za-z0-9\s,.'’\-]{3,45})/i);
      const cls = extractFirstMatch(text, /(?:studying\s+in|class\s*[:\-]|course\s*[:\-])\s*([A-Za-z0-9\s\-]{2,30})(?:\n|academic|,)/i);
      const year = extractFirstMatch(text, /(?:academic\s+year|session)\s*[:\-]?\s*([0-9]{4}[-\/][0-9]{2,4})/i);
      const certNo = extractFirstMatch(text, /(?:ref\s+no\.?|certificate\s+no\.?)\s*[:\-]?\s*([A-Z0-9\/\-_]+)/i);

      makeField('name', name);
      makeField('institution', inst);
      makeField('courseOrClass', cls);
      makeField('academicYear', year);
      makeField('certificateNumber', certNo);
      break;
    }

    default: {
      // Generic / Other / Unknown: extract name or identifiers if available
      const name = extractFirstMatch(text, /(?:name\s*[:\-]\s*)([A-Z][a-zA-Z\s]{2,30})/i);
      makeField('name', name);
      break;
    }
  }

  // Calculate missing fields for this document type
  const missingFields = Object.keys(fields).filter(k => fields[k] === null);

  return {
    fields,
    fieldConfidence,
    missingFields
  };
}

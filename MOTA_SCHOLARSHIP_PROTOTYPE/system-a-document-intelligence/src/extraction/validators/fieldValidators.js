/**
 * Field Validation Engine
 */

export function validatePercentage(val) {
  if (val === null || val === undefined) return { isValid: false, status: 'NOT_FOUND' };
  const num = parseFloat(String(val).replace(/%/g, ''));
  if (isNaN(num)) return { isValid: false, status: 'INVALID', reason: 'Not a numeric percentage' };
  if (num >= 0 && num <= 100) return { isValid: true, status: 'VALID' };
  return { isValid: false, status: 'INVALID', reason: 'Percentage out of range [0, 100]' };
}

export function validateIncome(val) {
  if (val === null || val === undefined) return { isValid: false, status: 'NOT_FOUND' };
  const num = Number(val);
  if (isNaN(num)) return { isValid: false, status: 'INVALID', reason: 'Non-numeric income amount' };
  if (num >= 0 && num <= 10000000) return { isValid: true, status: 'VALID' };
  return { isValid: false, status: 'INVALID', reason: 'Income amount out of plausible range' };
}

export function validateDate(val) {
  if (!val) return { isValid: false, status: 'NOT_FOUND' };
  const s = String(val).trim();
  const d = new Date(s);
  if (!isNaN(d.getTime())) return { isValid: true, status: 'VALID' };
  // Check common DD/MM/YYYY pattern
  if (/^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}$/.test(s)) return { isValid: true, status: 'VALID' };
  return { isValid: false, status: 'LOW_CONFIDENCE', reason: 'Unrecognized date format' };
}

export function validateIfsc(val) {
  if (!val) return { isValid: false, status: 'NOT_FOUND' };
  const clean = String(val).toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (/^[A-Z]{4}0[A-Z0-9]{6}$/.test(clean)) return { isValid: true, status: 'VALID' };
  return { isValid: false, status: 'INVALID', reason: 'IFSC must match 11-char pattern [A-Z]{4}0[A-Z0-9]{6}' };
}

export function validateAcademicYear(val) {
  if (!val) return { isValid: false, status: 'NOT_FOUND' };
  const s = String(val).trim();
  if (/^(?:19|20)\d\d(?:[-/]\d{2,4})?$/.test(s)) return { isValid: true, status: 'VALID' };
  return { isValid: false, status: 'LOW_CONFIDENCE', reason: 'Unusual academic year format' };
}

export function validateCertificateNumber(val) {
  if (!val) return { isValid: false, status: 'NOT_FOUND' };
  const s = String(val).trim();
  if (s.length >= 4 && s.length <= 40 && /[0-9]/.test(s)) return { isValid: true, status: 'VALID' };
  return { isValid: false, status: 'LOW_CONFIDENCE', reason: 'Certificate number unusually short or missing digits' };
}

export function validateField(key, value) {
  if (value === null || value === undefined || String(value).trim() === '') {
    return { isValid: false, status: 'NOT_FOUND' };
  }

  const k = key.toLowerCase();
  if (k === 'annualincome' || k === 'income' || k === 'feeamount') {
    return validateIncome(value);
  }
  if (k === 'incomeperiod' || k.includes('year') || k.includes('session')) {
    return validateAcademicYear(value);
  }
  if (k.includes('percentage') || k === 'cgpa' || k === 'marks') {
    return validatePercentage(value);
  }
  if (k.includes('date') || k === 'dob') {
    return validateDate(value);
  }
  if (k === 'ifsc') {
    return validateIfsc(value);
  }
  if (k.includes('certificatenumber') || k.includes('rollnumber') || k.includes('receiptnumber')) {
    return validateCertificateNumber(value);
  }

  return { isValid: true, status: 'VALID' };
}

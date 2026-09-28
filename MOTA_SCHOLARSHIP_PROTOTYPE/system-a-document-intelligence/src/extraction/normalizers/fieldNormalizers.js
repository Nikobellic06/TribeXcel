/**
 * Field Normalization Utilities
 */

export function cleanText(str, allowMultiLine = false) {
  if (str === null || str === undefined) return null;
  let s = String(str).trim();
  if (!allowMultiLine) {
    s = s.split(/\r?\n/)[0];
  } else {
    s = s.replace(/\r?\n/g, ', ').replace(/,\s*,/g, ',');
  }
  s = s.replace(/^[:\-–=.,\s]+/, '').replace(/[:\-–=.,\s]+$/, '').trim();
  return s.length > 0 ? s : null;
}

export function normalizeTribeName(raw) {
  if (!raw) return null;
  let s = cleanText(raw);
  if (!s) return null;
  s = s.replace(/\s+(?:community|tribe|sub-caste)$/i, '').trim();
  return s;
}

export function normalizeIncome(raw) {
  if (raw === null || raw === undefined) return null;
  let str = String(raw).trim().toLowerCase();

  // Match "1.8 lakh" or "1.5 lakhs"
  const lakhMatch = str.match(/([0-9]+(?:\.[0-9]+)?)\s*(?:lakh|lakhs|lac|lacs)/i);
  if (lakhMatch) {
    const val = parseFloat(lakhMatch[1]);
    if (!isNaN(val)) {
      return Math.round(val * 100000);
    }
  }

  // Remove currency symbols, commas, trailing '/-', 'rs', etc.
  str = str.replace(/₹|rs\.?|inr|rupees|\/\-|\s+/gi, '').replace(/,/g, '');
  const num = parseFloat(str);
  return isNaN(num) ? null : Math.round(num);
}

export function normalizePercentage(raw) {
  if (raw === null || raw === undefined) return null;
  let str = String(raw).replace(/%/g, '').trim();
  const num = parseFloat(str);
  if (isNaN(num)) return null;
  return Number(num.toFixed(2));
}

export function normalizeDate(raw) {
  if (!raw) return null;
  const s = String(raw).trim();

  // DD/MM/YYYY or DD-MM-YYYY
  const dmy = s.match(/^([0-3]?[0-9])[\/\-.]([0-1]?[0-9])[\/\-.]((?:19|20)\d\d)$/);
  if (dmy) {
    const day = dmy[1].padStart(2, '0');
    const month = dmy[2].padStart(2, '0');
    const year = dmy[3];
    return `${year}-${month}-${day}`;
  }

  // YYYY/MM/DD
  const ymd = s.match(/^((?:19|20)\d\d)[\/\-.]([0-1]?[0-9])[\/\-.]([0-3]?[0-9])$/);
  if (ymd) {
    const year = ymd[1];
    const month = ymd[2].padStart(2, '0');
    const day = ymd[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return cleanText(s);
}

export function normalizeIfsc(raw) {
  if (!raw) return null;
  const s = String(raw).toUpperCase().replace(/[^A-Z0-9]/g, '').trim();
  return s.length === 11 ? s : cleanText(raw);
}

export function maskAadhaar(raw) {
  if (!raw) return null;
  const digits = String(raw).replace(/[^0-9]/g, '');
  if (digits.length >= 12) {
    const last4 = digits.slice(-4);
    return `XXXX XXXX ${last4}`;
  }
  const s = String(raw).trim();
  if (s.includes('X') || s.includes('x')) {
    return s.toUpperCase();
  }
  return s;
}

export function maskBankAccount(raw) {
  if (!raw) return null;
  const digits = String(raw).replace(/[^0-9]/g, '');
  if (digits.length >= 8) {
    const last4 = digits.slice(-4);
    const maskedLen = Math.max(4, digits.length - 4);
    return 'X'.repeat(maskedLen) + last4;
  }
  return String(raw).trim();
}

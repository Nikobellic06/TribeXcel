/**
 * Text and Field Normalization & Similarity Utilities
 */

/**
 * Standardize string by trimming, lowercasing, and collapsing whitespace
 */
export function cleanString(val) {
  if (val === null || val === undefined) return null;
  const s = String(val).trim().replace(/\s+/g, ' ');
  return s.length > 0 ? s : null;
}

/**
 * Normalize human names (remove honorifics like Shri, Mr, Ms, Kumar/Kr standardization)
 */
export function normalizeName(name) {
  if (!name) return '';
  let n = cleanString(name).toLowerCase();
  
  // Remove common prefixes
  n = n.replace(/^(mr\.|mrs\.|ms\.|shri|smt\.|dr\.)\s+/i, '');
  // Normalize abbreviations like "kr." -> "kumar"
  n = n.replace(/\bkr\.?\b/g, 'kumar');
  // Remove punctuation
  n = n.replace(/[^a-z0-9\s]/g, '');
  return n.trim();
}

/**
 * Calculate Levenshtein Distance
 */
export function levenshteinDistance(a, b) {
  if (!a || !b) return (a || b) ? Math.max((a || '').length, (b || '').length) : 0;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

/**
 * String similarity ratio between 0 and 1
 */
export function stringSimilarity(str1, str2) {
  const s1 = cleanString(str1);
  const s2 = cleanString(str2);
  if (!s1 || !s2) return 0;
  if (s1.toLowerCase() === s2.toLowerCase()) return 1;
  
  const distance = levenshteinDistance(s1.toLowerCase(), s2.toLowerCase());
  const maxLen = Math.max(s1.length, s2.length);
  return maxLen === 0 ? 1 : Math.max(0, 1 - distance / maxLen);
}

/**
 * Normalize Date to YYYY-MM-DD if possible
 */
export function normalizeDate(dateStr) {
  if (!dateStr) return null;
  const s = String(dateStr).trim();
  
  // Check common formats: DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = s.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }
  
  // YYYY-MM-DD
  const ymdMatch = s.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
  if (ymdMatch) {
    const year = ymdMatch[1];
    const month = ymdMatch[2].padStart(2, '0');
    const day = ymdMatch[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  return s;
}

/**
 * Compare two dates
 */
export function compareDates(d1, d2) {
  const norm1 = normalizeDate(d1);
  const norm2 = normalizeDate(d2);
  if (!norm1 || !norm2) return 'NOT_AVAILABLE';
  if (norm1 === norm2) return 'MATCH';
  
  // Check if year and month match or if slight format issue
  return 'MISMATCH';
}

/**
 * Normalize Income amount to integer
 */
export function parseIncomeNumber(incomeVal) {
  if (incomeVal === null || incomeVal === undefined) return null;
  const s = String(incomeVal).replace(/[^0-9.]/g, '');
  const parsed = parseFloat(s);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Compare two names
 * Statuses: MATCH, MINOR_VARIATION, MISMATCH, NOT_AVAILABLE
 */
export function compareNames(name1, name2) {
  if (!name1 || !name2) return 'NOT_AVAILABLE';
  const n1 = normalizeName(name1);
  const n2 = normalizeName(name2);
  
  if (n1 === n2) return 'MATCH';
  
  const sim = stringSimilarity(n1, n2);
  if (sim >= 0.82) return 'MINOR_VARIATION';
  
  // Check word containment (e.g. "Rahul Kumar" vs "Rahul Kumar Sharma" or initials)
  const tokens1 = n1.split(' ');
  const tokens2 = n2.split(' ');
  const common = tokens1.filter(t => tokens2.includes(t));
  if (common.length >= Math.min(tokens1.length, tokens2.length) && Math.min(tokens1.length, tokens2.length) > 0) {
    return 'MINOR_VARIATION';
  }
  
  return 'MISMATCH';
}

/**
 * Compare generic text fields (Tribe, Category, Domicile, Institution, Course, Qualification)
 */
export function compareGeneralField(val1, val2) {
  if (!val1 || !val2) return 'NOT_AVAILABLE';
  const s1 = cleanString(val1).toLowerCase();
  const s2 = cleanString(val2).toLowerCase();
  
  if (s1 === s2) return 'MATCH';
  
  // Category standard mappings
  const categoryMap = {
    'st': 'scheduled tribe',
    'scheduled tribe': 'scheduled tribe',
    'pvtg': 'particularly vulnerable tribal group',
    'particularly vulnerable tribal group': 'particularly vulnerable tribal group'
  };
  if (categoryMap[s1] && categoryMap[s2] && categoryMap[s1] === categoryMap[s2]) {
    return 'MATCH';
  }
  
  const sim = stringSimilarity(s1, s2);
  if (sim >= 0.85) return 'MINOR_VARIATION';
  if (sim >= 0.65 || s1.includes(s2) || s2.includes(s1)) return 'MINOR_VARIATION';
  
  return 'MISMATCH';
}

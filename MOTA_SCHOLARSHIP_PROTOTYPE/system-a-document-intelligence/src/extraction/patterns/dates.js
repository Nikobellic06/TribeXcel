/**
 * Date Extraction Patterns
 */

export const DATE_PATTERNS = {
  generalDates: [
    /\b([0-3]?[0-9][\/\-.][0-1]?[0-9][\/\-.](?:19|20)\d\d)\b/,
    /\b((?:19|20)\d\d[\/\-.][0-1]?[0-9][\/\-.][0-3]?[0-9])\b/,
    /\b([0-3]?[0-9]\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(?:19|20)\d\d)\b/i
  ],
  dobLabels: [
    /(?:date\s+of\s+birth|dob|birth\s+date|born\s+on|d\.o\.b\.?|जन्म\s*तिथि)\s*[:\-]?\s*([0-3]?[0-9][\/\-.][0-1]?[0-9][\/\-.](?:19|20)\d\d)/i,
    /(?:year\s+of\s+birth|yob)\s*[:\-]?\s*((?:19|20)\d\d)/i
  ],
  issueDateLabels: [
    /(?:date\s+of\s+issue|issue\s+date|issued\s+on|dated|date)\s*[:\-]?\s*([0-3]?[0-9][\/\-.][0-1]?[0-9][\/\-.](?:19|20)\d\d)/i
  ]
};

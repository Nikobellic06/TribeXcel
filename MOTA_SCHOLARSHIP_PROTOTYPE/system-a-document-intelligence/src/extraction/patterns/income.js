/**
 * Income Extraction Patterns & Labels
 */

export const INCOME_PATTERNS = {
  labels: [
    /(?:income\s+from\s+all\s+sources|all\s+sources\s+is|income\s+is)/i,
    /(?:annual\s+family\s+income|family\s+annual\s+income|annual\s+income|gross\s+family\s+income|total\s+family\s+income|gross\s+annual\s+income|family\s+income|total\s+income|annual\s+turnover|income\s*[:\-])/i
  ],
  monetaryAmounts: [
    /(?:rupees|rs\.?|inr|\u20B9)\s*([0-9,]+(?:\.\d{1,2})?)(?:\s*\/\-)?/i,
    /\b(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|lac|lacs)\b/i,
    /(?:is\s*)?(?:rs\.?|inr|\u20B9)\s*([1-9][0-9]{3,7}(?:\.\d{1,2})?)(?:\s*\/\-)?/i,
    /\b([1-9][0-9]{4,7}(?:\.\d{1,2})?)(?:\s*\/\-)?(?:\s+only|\s+per\s+annum|\s+p\.a\.?)?/i
  ],
  financialYears: [
    /\b(20\d\d\s*[-/–]\s*20\d\d)\b/,
    /\b(20\d\d\s*[-/–]\s*\d\d)\b/,
    /(?:financial\s+year|assessment\s+year|f\.?y\.?|a\.?y\.?)\s*[:\-]?\s*([0-9]{4}[-/–][0-9]{2,4})/i
  ],
  issuingAuthorities: [
    /\b(circle\s+officer|tehsildar|tahasildar|revenue\s+officer|sub-divisional\s+officer|district\s+magistrate|deputy\s+commissioner|executive\s+magistrate)\b/i
  ],
  clauses: [
    /\b(income\s+from\s+all\s+sources|all\s+sources)\b/i,
    /\b(certificate\s+of\s+income|income\s+certificate)\b/i
  ]
};

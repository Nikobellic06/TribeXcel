/**
 * Bank Patterns (IFSC, Account Number, Branch, Bank Name)
 */

export const BANK_PATTERNS = {
  ifsc: [
    /\b([A-Z]{4}0[A-Z0-9]{6})\b/,
    /(?:ifsc|ifsc\s+code|ifs\s+code)\s*[:\-]?\s*([A-Za-z0-9]{11})\b/i
  ],
  accountNumbers: [
    /(?:account\s+no\.?|a\/c\s+no\.?|ac\s+no\.?|account\s+number)\s*[:\-]?\s*([0-9Xx\*\s\-]{9,22})\b/i,
    /\b(\d{9,18})\b/
  ],
  bankNames: [
    /\b(state\s+bank\s+of\s+india|sbi|punjab\s+national\s+bank|pnb|bank\s+of\s+baroda|canara\s+bank|union\s+bank\s+of\s+india|bank\s+of\s+india|central\s+bank\s+of\s+india|indian\s+bank|indian\s+overseas\s+bank|uco\s+bank|punjab\s+&\s+sind\s+bank|hdfc\s+bank|icici\s+bank|axis\s+bank|kotak\s+mahindra\s+bank|jharkhand\s+rajya\s+gramin\s+bank|aryavart\s+bank|baroda\s+up\s+bank)\b/i
  ],
  branches: [
    /(?:branch|branch\s+name)\s*[:\-]?\s*([A-Za-z0-9\s,\.\-]{3,35})(?:,|\.|\n|$)/i
  ]
};

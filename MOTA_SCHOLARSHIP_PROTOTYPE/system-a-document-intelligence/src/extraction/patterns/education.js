/**
 * Education Patterns (Marks, Percentages, Classes, Boards, Institutions)
 */

export const EDUCATION_PATTERNS = {
  rollNumbers: [
    /(?:roll\s+no\.?|roll\s+number|registration\s+no\.?|regn\s+no\.?|enrollment\s+no\.?)\s*[:\-]?\s*([A-Za-z0-9_\-\/]{4,25})/i,
    /\b([A-Z]{2,4}[-\s]?\d{4}[-\s]?\d{4,8})\b/
  ],
  classes: [
    /(?:class|standard|grade)\s*[:\-]?\s*(class\s+(?:ix|x|xi|xii|[0-9]{1,2})|standard\s+(?:ix|x|xi|xii|[0-9]{1,2})|\b(?:ix|x|xi|xii)\b|[0-9]{1,2}th)/i,
    /\b(CLASS\s+IX|CLASS\s+X|CLASS\s+XI|CLASS\s+XII|CLASS\s+9|CLASS\s+10|CLASS\s+11|CLASS\s+12)\b/i
  ],
  percentages: [
    /(?:percentage|aggregate|marks\s+percentage|pct\.?)\s*[:\-]?\s*([0-9]{1,3}(?:\.[0-9]{1,2})?)\s*%/i,
    /\b([1-9][0-9](?:\.[0-9]{1,2})?)\s*%/i,
    /(?:percentage|marks\s+obtained)\s*[:\-]?\s*([0-9]{1,3}(?:\.[0-9]{1,2})?)\b/i
  ],
  scoringMatrix: [
    /(?:total|marks\s+obtained|aggregate|grand\s+total)\s*[:\-]?\s*([0-9]{2,4})\s*(?:\/|\s+out\s+of\s+)\s*([0-9]{2,4})/i,
    /\b([0-9]{2,4})\s*\/\s*([0-9]{2,4})\b/
  ],
  results: [
    /\b(first\s+division|second\s+division|third\s+division|distinction|passed|promoted|exemplary|first\s+class|second\s+class)\b/i
  ],
  boards: [
    /(?:board\s*[:\-]|council\s*[:\-])\s*([A-Za-z\s]{4,50})(?:,|\.|\n|$)/i,
    /\b(jharkhand\s+academic\s+council|jac|cbse|central\s+board|icse|cisce|chse|bseb|up\s+board|mp\s+board|board\s+of\s+secondary\s+education)\b/i
  ],
  institutions: [
    /(?:school|college|institution|university|vidyalaya|inter\s+college|institute)\s*[:\-]?\s*([A-Za-z0-9\s'\.\-]{4,60})(?:,|\.|\n|$)/i,
    /\b((?:st\.\s+[A-Za-z]+|govt\.?\s+[A-Za-z]+|kendriya\s+vidyalaya|jawahar\s+navodaya|[A-Za-z\s]+)\s+(?:inter\s+college|high\s+school|higher\s+secondary|university|college|institute))/i
  ]
};

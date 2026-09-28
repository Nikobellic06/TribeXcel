/**
 * Identity & Demographic Patterns (Names, Parents, Gender, Aadhaar, Tribes)
 */

export const IDENTITY_PATTERNS = {
  names: [
    /(?:this\s+is\s+to\s+certify\s+that|certify\s+that|name\s*[:\-]|student['’]?s\s*name\s*[:\-]|candidate['’]?s\s*name\s*[:\-]|applicant['’]?s\s*name\s*[:\-]|shri\/smt\.?|kumari)\s*([A-Z][a-zA-Z\s]{2,30})(?:\s+son|\s+daughter|\s+s\/o|\s+d\/o|\s+belongs|\s+resident|\n|,)/i,
    /(?:name\s*[:\-]\s*)([A-Za-z\s]{3,35})(?:,|\.|\n|$)/i
  ],
  fathers: [
    /(?:son\s+of|daughter\s+of|s\/o|d\/o|father['’]?s\s*name\s*[:\-]|father\s*[:\-])\s*(?:shri\s+)?([A-Z][a-zA-Z\s]{2,30})(?:\s+resident|\s+of|\n|,|$)/i
  ],
  mothers: [
    /(?:mother['’]?s\s*name\s*[:\-]|mother\s*[:\-])\s*(?:smt\.?\s+)?([A-Z][a-zA-Z\s]{2,30})(?:\s+resident|\s+of|\n|,|$)/i
  ],
  gender: [
    /\b(male|female|transgender|purush|mahila)\b/i
  ],
  aadhaar: [
    /\b(\d{4}\s+\d{4}\s+\d{4})\b/,
    /\b([X\d]{4}\s+[X\d]{4}\s+\d{4})\b/i,
    /\b([Xx]{8}\d{4})\b/
  ],
  tribes: [
    /(?:belongs\s+to\s+the|community|tribe\s*[:\-]|caste\s*[:\-])\s*([A-Za-z]+(?:\s+[A-Za-z]+)?)(?:\s+tribe|\s+community|\s+which\s+is\s+recognized|\n|,|$)/i,
    /\b(santhal|santal|gond|munda|oraon|bhil|bodo|khasi|garo|ho|kol|birhor|asur|chenchu|korwa|paharia|sauria|lodha)\b/i
  ],
  categories: [
    /\b(SCHEDULED\s+TRIBE|ST|PVTG|SCHEDULED\s+CASTE|SC|OBC|GENERAL)\b/i
  ]
};

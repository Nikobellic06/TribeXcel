/**
 * Real Document Classifier Service
 * 
 * Classifies documents based purely on OCR text content, keywords, phrases,
 * regex patterns, and document-specific structural indicators.
 * 
 * The filename is strictly NOT used to determine classification.
 */

const CLASSIFICATION_RULES = [
  {
    type: 'INCOME_CERTIFICATE',
    indicators: [
      { regex: /\b(income\s+certificate|certificate\s+of\s+income)\b/i, weight: 35, evidence: 'Income certificate title detected' },
      { regex: /\b(annual\s+income|family\s+income|gross\s+income|total\s+income)\b/i, weight: 25, evidence: 'Annual / family income field detected' },
      { regex: /\b(income\s+from\s+all\s+sources|all\s+sources)\b/i, weight: 20, evidence: 'Income from all sources clause detected' },
      { regex: /\b(financial\s+year|assessment\s+year|\b20\d\d[-/]\d\d\b)/i, weight: 15, evidence: 'Financial / assessment year indicator detected' },
      { regex: /\b(circle\s+officer|tehsildar|tahasildar|revenue\s+officer|sub-divisional\s+officer)\b/i, weight: 15, evidence: 'Revenue issuing authority detected' },
      { regex: /\b(rupees|rs\.?|inr|\u20B9)\s*\d+/i, weight: 15, evidence: 'Income monetary amount detected' }
    ]
  },
  {
    type: 'PVTG_CERTIFICATE',
    indicators: [
      { regex: /\b(particularly\s+vulnerable\s+tribal\s+group|pvtg)\b/i, weight: 45, evidence: 'PVTG (Particularly Vulnerable Tribal Group) title detected' },
      { regex: /\b(birhor|chenchu|asur|korwa|paharia|sauria|mal\s+paharia|khand|lodha)\b/i, weight: 30, evidence: 'Specific PVTG tribe community name detected' },
      { regex: /\b(caste\s+certificate|tribal\s+certificate|certificate\s+no)\b/i, weight: 20, evidence: 'Caste certificate identifier detected' },
      { regex: /\b(collector|district\s+magistrate|sub-divisional)\b/i, weight: 15, evidence: 'Competent authority signature detected' }
    ]
  },
  {
    type: 'ST_CERTIFICATE',
    indicators: [
      { regex: /\b(scheduled\s+tribe|scheduled\s+tribes|\bST\s+certificate|caste\s+certificate)\b/i, weight: 35, evidence: 'Scheduled Tribe (ST) certificate title detected' },
      { regex: /\b(tribe|community|sub-caste)\b/i, weight: 20, evidence: 'Tribe / community field detected' },
      { regex: /\b(santhal|santali|gond|munda|oraon|bhil|bodo|khasi|garo|ho|kol)\b/i, weight: 25, evidence: 'Scheduled Tribe name detected' },
      { regex: /\b(constitution\s*\(\s*scheduled\s+tribes\s*\)\s*order|order\s+1950)\b/i, weight: 30, evidence: 'Statutory Presidential ST Order reference detected' },
      { regex: /\b(certificate\s+no|cert\s+no|jh\/st|od\/st|mp\/st|cg\/st)\b/i, weight: 15, evidence: 'Caste certificate registration number detected' },
      { regex: /\b(sub-divisional\s+officer|tahasildar|deputy\s+commissioner)\b/i, weight: 15, evidence: 'Competent issuing authority detected' }
    ]
  },
  {
    type: 'MARKSHEET',
    indicators: [
      { regex: /\b(marksheet|mark\s+sheet|statement\s+of\s+marks|grade\s+sheet|marks\s+card)\b/i, weight: 40, evidence: 'Marksheet / statement of marks title detected' },
      { regex: /\b(maximum\s+marks|marks\s+obtained|total\s+marks|min\s+marks|max\s+marks)\b/i, weight: 25, evidence: 'Marks scoring matrix detected' },
      { regex: /\b(subject|theory|practical|credits|grade|cgpa|percentage)\b/i, weight: 20, evidence: 'Subject examination breakdown detected' },
      { regex: /\b(board\s+of\s+secondary|academic\s+council|chse|cbse|icse|jac|matric|intermediate|higher\s+secondary)\b/i, weight: 20, evidence: 'Educational board / council authority detected' },
      { regex: /\b(roll\s+no|roll\s+number|registration\s+no|regn\s+no)\b/i, weight: 15, evidence: 'Student roll / examination number detected' },
      { regex: /\b(passed|promoted|first\s+division|distinction|result)\b/i, weight: 10, evidence: 'Examination division / result indicator detected' }
    ]
  },
  {
    type: 'DEGREE_CERTIFICATE',
    indicators: [
      { regex: /\b(bachelor\s+of|master\s+of|doctor\s+of\s+philosophy|degree\s+of|diploma\s+in)\b/i, weight: 35, evidence: 'Conferred academic degree title detected' },
      { regex: /\b(has\s+conferred\s+upon|admitted\s+to\s+the\s+degree|hereby\s+confers|duly\s+qualified)\b/i, weight: 30, evidence: 'Degree conferment statutory phrase detected' },
      { regex: /\b(university|institute\s+of\s+technology|vice-chancellor|chancellor|registrar)\b/i, weight: 25, evidence: 'University administrative authority detected' },
      { regex: /\b(convocation|faculty\s+of|under\s+the\s+seal\s+of\s+the\s+university)\b/i, weight: 20, evidence: 'Formal university seal / convocation reference detected' }
    ]
  },
  {
    type: 'DOMICILE_CERTIFICATE',
    indicators: [
      { regex: /\b(domicile\s+certificate|residence\s+certificate|residential\s+certificate|praman\s+patra)\b/i, weight: 40, evidence: 'Domicile / residential certificate title detected' },
      { regex: /\b(permanent\s+resident|resident\s+of|domiciled\s+in)\b/i, weight: 25, evidence: 'Permanent residency declaration detected' },
      { regex: /\b(village|po|ps|district|state|tahsil|pincode)\b/i, weight: 15, evidence: 'Address residency components detected' },
      { regex: /\b(collector|tehsildar|revenue\s+divisional\s+officer)\b/i, weight: 15, evidence: 'District / state competent authority detected' }
    ]
  },
  {
    type: 'AADHAAR',
    indicators: [
      { regex: /\b(unique\s+identification\s+authority|uidai|aadhaar|aadhar)\b/i, weight: 45, evidence: 'UIDAI / Aadhaar official header detected' },
      { regex: /\b(enrolment\s+no|नामांकन)\b/i, weight: 30, evidence: 'Aadhaar Enrolment Number detected' },
      { regex: /\b(mera\s+aadhaar|meri\s+pehchan)\b/i, weight: 35, evidence: 'Aadhaar national motto detected' },
      { regex: /\b\d{4}\s+\d{4}\s+\d{4}\b|\b[X\d]{4}\s+[X\d]{4}\s+\d{4}\b/i, weight: 30, evidence: '12-digit Aadhaar / masked UID pattern detected' },
      { regex: /(?:dob|date\s+of\s+birth|year\s+of\s+birth|it;?th\/DOB|जन्म\s*तिथि)\s*[:\/\-]?\s*\d{1,4}/i, weight: 20, evidence: 'Aadhaar DOB format detected' },
      { regex: /\b(male|female|transgender|purush|mahila|पु=ष|महिला)\b/i, weight: 15, evidence: 'UIDAI gender demographic field detected' }
    ]
  },
  {
    type: 'BANK_PASSBOOK',
    indicators: [
      { regex: /\b(passbook|bank\s+account|savings\s+bank|current\s+account)\b/i, weight: 35, evidence: 'Bank passbook account document title detected' },
      { regex: /\b(ifsc|ifsc\s+code|ifs\s+code)\s*[:\-]?\s*[A-Z]{4}0[A-Z0-9]{6}\b/i, weight: 30, evidence: 'Valid 11-character Indian Bank IFSC code detected' },
      { regex: /\b(account\s+no|a\/c\s+no|ac\s+no|account\s+number)\b/i, weight: 25, evidence: 'Bank account number field detected' },
      { regex: /\b(state\s+bank\s+of\s+india|punjab\s+national|bank\s+of\s+baroda|canara\s+bank|union\s+bank|central\s+bank|hdfc|icici|axis)\b/i, weight: 20, evidence: 'Scheduled Commercial Bank name detected' },
      { regex: /\b(branch|micr|cif\s+no|customer\s+id)\b/i, weight: 15, evidence: 'Bank branch / CIF metadata detected' }
    ]
  },
  {
    type: 'ADMISSION_LETTER',
    indicators: [
      { regex: /\b(admission\s+letter|provisional\s+admission|allotment\s+letter|seat\s+allotment|offer\s+of\s+admission)\b/i, weight: 40, evidence: 'Admission / seat allotment header detected' },
      { regex: /\b(offered\s+admission|admitted\s+to|provisional\s+offer|enrolled\s+in)\b/i, weight: 25, evidence: 'Course admission offer statement detected' },
      { regex: /\b(programme|course|b\.tech|m\.tech|ph\.d|m\.phil|b\.sc|m\.sc)\b/i, weight: 15, evidence: 'Academic programme indicator detected' },
      { regex: /\b(academic\s+session|academic\s+year|semester|tuition\s+fee)\b/i, weight: 15, evidence: 'Academic session / admission terms detected' }
    ]
  },
  {
    type: 'OFFER_LETTER',
    indicators: [
      { regex: /\b(offer\s+letter|conditional\s+offer|unconditional\s+offer|letter\s+of\s+acceptance)\b/i, weight: 40, evidence: 'University offer letter title detected' },
      { regex: /\b(pleased\s+to\s+offer|offer\s+of\s+a\s+place|we\s+are\s+delighted)\b/i, weight: 30, evidence: 'University formal offer phrase detected' },
      { regex: /\b(university\s+of|college|tuition|international\s+student)\b/i, weight: 15, evidence: 'Higher education institution offer context detected' }
    ]
  },
  {
    type: 'BONAFIDE_CERTIFICATE',
    indicators: [
      { regex: /\b(bonafide\s+certificate|bonafide\s+student|bonafide\s+study)\b/i, weight: 45, evidence: 'Bonafide certificate title detected' },
      { regex: /\b(is\s+a\s+bonafide\s+student|studying\s+in|student\s+of\s+this\s+institution)\b/i, weight: 30, evidence: 'Active bonafide student certification clause detected' },
      { regex: /\b(headmaster|principal|dean|director|registrar)\b/i, weight: 15, evidence: 'Institutional authority signature detected' }
    ]
  },
  {
    type: 'DISABILITY_CERTIFICATE',
    indicators: [
      { regex: /\b(disability\s+certificate|differently\s+abled|pwd\s+certificate|divyangjan)\b/i, weight: 45, evidence: 'Disability / PwD certificate title detected' },
      { regex: /\b(permanent\s+disability|percentage\s+of\s+disability|disability\s+percentage|\d+%\s*disability)\b/i, weight: 30, evidence: 'Disability percentage evaluation detected' },
      { regex: /\b(locomotor|visual|hearing|orthopedic|blindness|medical\s+board)\b/i, weight: 25, evidence: 'Medical board disability classification detected' }
    ]
  },
  {
    type: 'FEE_RECEIPT',
    indicators: [
      { regex: /\b(fee\s+receipt|money\s+receipt|payment\s+receipt|cash\s+receipt)\b/i, weight: 45, evidence: 'Fee / payment receipt title detected' },
      { regex: /\b(tuition\s+fee|admission\s+fee|hostel\s+fee|exam\s+fee|total\s+amount\s+paid)\b/i, weight: 25, evidence: 'Fee breakdown components detected' },
      { regex: /\b(receipt\s+no|transaction\s+id|payment\s+mode|challan\s+no)\b/i, weight: 20, evidence: 'Payment receipt / transaction identifier detected' }
    ]
  }
];

/**
 * Classify a document based on actual OCR text content
 */
export function classifyDocument(ocrText = '') {
  if (!ocrText || ocrText.trim().length === 0) {
    return {
      documentType: 'UNKNOWN',
      confidence: 0.20,
      evidence: ['No legible text detected on page']
    };
  }

  const normalized = ocrText.toLowerCase();
  const scores = [];

  for (const rule of CLASSIFICATION_RULES) {
    let totalScore = 0;
    const matchedEvidence = [];

    for (const indicator of rule.indicators) {
      if (indicator.regex.test(ocrText)) {
        totalScore += indicator.weight;
        matchedEvidence.push(indicator.evidence);
      }
    }

    if (totalScore > 0) {
      scores.push({
        type: rule.type,
        score: totalScore,
        evidence: matchedEvidence
      });
    }
  }

  if (scores.length === 0) {
    return {
      documentType: 'UNKNOWN',
      confidence: 0.30,
      evidence: []
    };
  }

  // Sort descending by score
  scores.sort((a, b) => b.score - a.score);
  const best = scores[0];

  // Build scores map across all document types
  const classificationScores = {};
  for (const s of scores) {
    classificationScores[s.type] = s.score;
  }

  // If highest score is too weak (< 25), do not force a classification
  if (best.score < 25) {
    return {
      classificationScores,
      documentType: 'UNKNOWN',
      confidence: Math.round((best.score / 100) * 100) / 100,
      evidence: []
    };
  }

  // Normalized confidence between 0.70 and 0.99
  const confidence = Math.min(0.99, Math.max(0.70, (best.score / 100) * 0.95 + 0.15));

  return {
    classificationScores,
    documentType: best.type,
    confidence: Number(confidence.toFixed(2)),
    evidence: best.evidence
  };
}

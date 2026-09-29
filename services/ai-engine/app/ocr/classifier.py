import re
from typing import Dict, Any, List, Tuple
from app.config import COMMON_ST_TRIBES

CLASSIFICATION_RULES = {
    "PVTG_CERTIFICATE": {
        "keywords": [
            ("particularly vulnerable tribal group", 4.0),
            ("pvtg", 3.0),
            ("primitive tribal group", 3.5),
            ("birhor", 3.0),
            ("asur", 3.0),
            ("korwa", 3.0),
            ("mal paharia", 3.0),
            ("sauria paharia", 3.0),
            ("sabar", 3.0),
        ],
        "min_score": 3.0,
    },
    "ST_CERTIFICATE": {
        "keywords": [
            ("scheduled tribe", 3.5),
            ("scheduled tribes", 3.5),
            ("caste certificate", 3.0),
            ("constitution (scheduled tribes)", 4.0),
            ("order 1950", 3.0),
            ("anushuchit janjati", 3.5),
            ("sub-divisional officer", 2.0),
            ("tehsildar", 1.5),
            ("tahsildar", 1.5),
            ("competent authority", 1.5),
            ("revenue officer", 1.5),
            ("belongs to the", 1.5),
            ("certificate no", 1.5),
        ],
        "tribe_weight": 2.5,
        "min_score": 3.5,
    },
    "INCOME_CERTIFICATE": {
        "keywords": [
            ("income certificate", 4.0),
            ("annual family income", 3.5),
            ("gross annual income", 3.5),
            ("annual income", 3.0),
            ("family income", 3.0),
            ("revenue department", 2.0),
            ("financial year", 2.0),
            ("tehsildar", 1.5),
            ("tahsildar", 1.5),
            ("sub-divisional magistrate", 2.0),
            ("income from all sources", 3.0),
            ("parivar", 1.5),
            ("aay praman patra", 3.5),
        ],
        "min_score": 3.5,
    },
    "DOMICILE_CERTIFICATE": {
        "keywords": [
            ("domicile certificate", 4.0),
            ("residential certificate", 4.0),
            ("residence certificate", 4.0),
            ("permanent resident", 3.5),
            ("ordinarily resides", 3.0),
            ("niwas praman patra", 4.0),
            ("domicile of", 3.0),
            ("state of", 1.5),
            ("district", 1.0),
        ],
        "min_score": 3.5,
    },
    "AADHAAR": {
        "keywords": [
            ("unique identification authority of india", 4.0),
            ("government of india", 2.0),
            ("aadhaar", 3.5),
            ("aadhar", 3.0),
            ("uidai", 3.5),
            ("enrolment no", 3.0),
            ("help@uidai.gov.in", 3.5),
            ("www.uidai.gov.in", 3.5),
            ("mera aadhaar", 3.5),
            ("vid :", 2.5),
        ],
        "min_score": 3.5,
    },
    "MARKSHEET": {
        "keywords": [
            ("marksheet", 4.0),
            ("mark sheet", 4.0),
            ("statement of marks", 4.0),
            ("grade card", 4.0),
            ("grade sheet", 4.0),
            ("maximum marks", 3.0),
            ("marks obtained", 3.0),
            ("total marks", 2.5),
            ("cgpa", 3.0),
            ("sgpa", 3.0),
            ("percentage", 2.0),
            ("semester", 2.0),
            ("roll no", 1.5),
            ("examination", 2.0),
            ("board of secondary education", 3.0),
            ("council of higher secondary", 3.0),
        ],
        "min_score": 3.5,
    },
    "DEGREE_CERTIFICATE": {
        "keywords": [
            ("degree of", 4.0),
            ("conferred upon", 4.0),
            ("has been admitted to the degree", 4.0),
            ("bachelor of", 3.5),
            ("master of", 3.5),
            ("doctor of philosophy", 3.5),
            ("convocation", 3.0),
            ("chancellor", 2.5),
            ("vice-chancellor", 2.5),
        ],
        "min_score": 3.5,
    },
    "BANK_PASSBOOK": {
        "keywords": [
            ("passbook", 4.0),
            ("savings bank account", 4.0),
            ("bank of", 2.5),
            ("account number", 3.0),
            ("a/c no", 3.0),
            ("ifsc", 3.5),
            ("cif no", 3.0),
            ("branch", 2.0),
            ("micr", 2.5),
            ("state bank of india", 3.0),
            ("punjab national bank", 3.0),
            ("bank of india", 3.0),
            ("canara bank", 3.0),
        ],
        "min_score": 3.5,
    },
    "ADMISSION_OFFER": {
        "keywords": [
            ("offer of admission", 4.0),
            ("admission letter", 4.0),
            ("provisional admission", 4.0),
            ("admitted to the programme", 3.5),
            ("selected for admission", 3.5),
            ("academic session", 2.5),
            ("enrolment no", 2.0),
            ("congratulations on your admission", 3.5),
        ],
        "min_score": 3.5,
    },
    "BONAFIDE_CERTIFICATE": {
        "keywords": [
            ("bonafide certificate", 4.5),
            ("bonafide student", 4.0),
            ("is a bona fide student", 4.0),
            ("bonafide", 3.5),
            ("studying in this institution", 3.0),
            ("principal", 2.0),
            ("headmaster", 2.0),
            ("dean", 1.5),
        ],
        "min_score": 3.5,
    },
    "DISABILITY_CERTIFICATE": {
        "keywords": [
            ("disability certificate", 4.5),
            ("persons with disabilities", 4.0),
            ("disability percentage", 4.0),
            ("medical authority", 3.0),
            ("locomotor", 3.5),
            ("visual impairment", 3.5),
            ("hearing impairment", 3.5),
            ("divyangjan", 3.5),
        ],
        "min_score": 3.5,
    },
    "FEE_RECEIPT": {
        "keywords": [
            ("fee receipt", 4.5),
            ("tuition fee", 4.0),
            ("receipt no", 3.5),
            ("payment receipt", 4.0),
            ("amount paid", 3.0),
            ("fees received", 3.5),
        ],
        "min_score": 3.5,
    },
}

def classify_document(ocr_text: str, lines: List[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Deterministic classification of document content strictly from OCR text & structures.
    Does NOT use filename.
    """
    if not ocr_text or len(ocr_text.strip()) < 10:
        return {
            "documentType": "UNKNOWN",
            "status": "UNKNOWN",
            "confidence": 0.0,
            "evidence": ["Insufficient text extracted for reliable classification"]
        }

    text_lower = ocr_text.lower()
    scores: Dict[str, float] = {}
    evidence_map: Dict[str, List[str]] = {}

    for doc_type, rule in CLASSIFICATION_RULES.items():
        score = 0.0
        found_ev = []
        for kw, weight in rule["keywords"]:
            if kw in text_lower:
                score += weight
                found_ev.append(kw)

        # Special check for ST communities in ST_CERTIFICATE
        if doc_type == "ST_CERTIFICATE":
            for tribe in COMMON_ST_TRIBES:
                if re.search(rf'\b{tribe}\b', text_lower):
                    score += rule.get("tribe_weight", 2.5)
                    found_ev.append(f"recognized community: {tribe}")
                    break

        # Check for Aadhaar 12-digit pattern
        if doc_type == "AADHAAR":
            if re.search(r'\b\d{4}\s\d{4}\s\d{4}\b', ocr_text):
                score += 3.0
                found_ev.append("12-digit Aadhaar UID format")

        scores[doc_type] = score
        evidence_map[doc_type] = found_ev

    # Find highest scoring type
    best_type = max(scores, key=scores.get)
    best_score = scores[best_type]
    rule_config = CLASSIFICATION_RULES.get(best_type, {})
    min_required = rule_config.get("min_score", 3.5)

    if best_score >= min_required:
        # Normalise confidence: 3.5 -> 0.75, 7.0+ -> 0.98
        conf = min(0.98, max(0.70, round(0.70 + (best_score - min_required) * 0.07, 2)))
        return {
            "documentType": best_type,
            "status": "IDENTIFIED",
            "confidence": conf,
            "evidence": evidence_map[best_type][:4]
        }

    return {
        "documentType": "OTHER",
        "status": "UNKNOWN",
        "confidence": 0.40,
        "evidence": ["No decisive institutional keywords matched threshold"]
    }

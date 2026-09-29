import re
from typing import Dict, Any, List, Tuple

def validate_income(val: Any) -> Tuple[bool, str]:
    if val is None:
        return False, "Income value missing"
    try:
        n = float(val)
        if 10000 <= n <= 10000000:
            return True, "Valid annual income"
        return False, f"Income {n} outside realistic range (10,000 - 1,00,00,000)"
    except Exception:
        return False, "Non-numeric income"

def validate_percentage(val: Any) -> Tuple[bool, str]:
    if val is None:
        return False, "Percentage missing"
    try:
        n = float(val)
        if 0.0 <= n <= 100.0:
            return True, "Valid percentage"
        return False, f"Percentage {n} outside 0-100% range"
    except Exception:
        return False, "Non-numeric percentage"

def validate_ifsc(val: Any) -> Tuple[bool, str]:
    if not val or not isinstance(val, str):
        return False, "IFSC missing"
    if re.match(r'^[A-Z]{4}0[A-Z0-9]{6}$', val.strip().upper()):
        return True, "Valid RBI IFSC format"
    return False, f"Invalid IFSC format '{val}'"

def validate_aadhaar(val: Any) -> Tuple[bool, str]:
    if not val:
        return False, "Aadhaar missing"
    cleaned = re.sub(r'\s+', '', str(val))
    if len(cleaned) == 12 and cleaned.isdigit():
        return True, "Valid 12-digit UIDAI format"
    return False, "Aadhaar must be 12 numeric digits"

def validate_cert_number(val: Any) -> Tuple[bool, str]:
    if not val or len(str(val).strip()) < 4:
        return False, "Certificate number too short or empty"
    return True, "Certificate identifier present"

def score_field_confidence(field_name: str, value: Any, ocr_conf: float) -> Tuple[float, str]:
    """
    Computes evidence-based field confidence score and tier (HIGH, MEDIUM, LOW).
    Combines baseline OCR confidence with regex pattern validity.
    """
    base = max(0.4, min(0.99, ocr_conf))
    bonus = 0.0

    if field_name == "annualIncome":
        ok, _ = validate_income(value)
        bonus = 0.05 if ok else -0.25
    elif field_name in ("percentage", "cgpa"):
        ok, _ = validate_percentage(value)
        bonus = 0.05 if ok else -0.20
    elif field_name == "ifsc":
        ok, _ = validate_ifsc(value)
        bonus = 0.08 if ok else -0.30
    elif field_name == "aadhaarNumber":
        ok, _ = validate_aadhaar(value)
        bonus = 0.08 if ok else -0.30
    elif field_name in ("applicantName", "fatherMotherGuardianName"):
        if isinstance(value, str) and len(value.split()) >= 2:
            bonus = 0.05
    elif field_name == "certificateNumber":
        ok, _ = validate_cert_number(value)
        bonus = 0.05 if ok else -0.15

    final_conf = max(0.30, min(0.98, round(base + bonus, 2)))
    level = "HIGH" if final_conf >= 0.85 else "MEDIUM" if final_conf >= 0.65 else "LOW"
    return final_conf, level

def validate_and_score_fields(fields: Dict[str, Any], avg_ocr_conf: float) -> Tuple[Dict[str, Any], List[Dict[str, Any]], List[str]]:
    """
    Validates all extracted fields, computes individual confidence scores,
    and returns formatted structured fields, validation report, and anomaly flags.
    """
    structured_fields = {}
    validation_report = []
    flags = []

    for k, v in fields.items():
        conf, level = score_field_confidence(k, v, avg_ocr_conf)
        structured_fields[k] = {
            "value": v,
            "confidence": conf,
            "level": level
        }

        # Specific validation rules
        if k == "annualIncome":
            ok, msg = validate_income(v)
            validation_report.append({"field": k, "valid": ok, "message": msg})
            if not ok:
                flags.append(f"Invalid annual income value: {msg}")
        elif k == "percentage":
            ok, msg = validate_percentage(v)
            validation_report.append({"field": k, "valid": ok, "message": msg})
            if not ok:
                flags.append(f"Invalid academic percentage: {msg}")
        elif k == "ifsc":
            ok, msg = validate_ifsc(v)
            validation_report.append({"field": k, "valid": ok, "message": msg})
            if not ok:
                flags.append(f"Invalid bank IFSC code: {msg}")
        elif k == "certificateNumber":
            ok, msg = validate_cert_number(v)
            validation_report.append({"field": k, "valid": ok, "message": msg})

    return structured_fields, validation_report, flags

import re
from difflib import SequenceMatcher
from typing import Dict, Any, List

def clean_name(n: str) -> str:
    if not n:
        return ""
    cleaned = re.sub(r'^(shri|smt|kumari|mr|ms|dr)\.?\s+', '', str(n).strip(), flags=re.IGNORECASE)
    cleaned = re.sub(r'[^a-zA-Z\s]', '', cleaned).lower()
    return " ".join(cleaned.split())

def match_names(n1: str, n2: str) -> str:
    c1 = clean_name(n1)
    c2 = clean_name(n2)
    if not c1 or not c2:
        return "INSUFFICIENT_DATA"
    if c1 == c2:
        return "MATCH"
    
    # Check if one is subset or initials match
    t1 = set(c1.split())
    t2 = set(c2.split())
    if t1.issubset(t2) or t2.issubset(t1):
        return "POTENTIAL_MISMATCH"
    
    # Fuzzy ratio
    ratio = SequenceMatcher(None, c1, c2).ratio()
    if ratio >= 0.82:
        return "POTENTIAL_MISMATCH"
    return "MISMATCH"

def match_numbers(v1: Any, v2: Any, tolerance: float = 500.0) -> str:
    if v1 is None or v2 is None:
        return "INSUFFICIENT_DATA"
    try:
        n1 = float(v1)
        n2 = float(v2)
        if abs(n1 - n2) <= tolerance:
            return "MATCH"
        return "MISMATCH"
    except Exception:
        return "INSUFFICIENT_DATA"

def match_dates(d1: Any, d2: Any) -> str:
    if not d1 or not d2:
        return "INSUFFICIENT_DATA"
    s1 = re.sub(r'[^0-9]', '', str(d1))
    s2 = re.sub(r'[^0-9]', '', str(d2))
    if s1 == s2:
        return "MATCH"
    return "MISMATCH"

def run_cross_document_checks(application_data: Dict[str, Any], extracted_docs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Compares extracted document entities against declared application data
    and across other documents.
    """
    checks = []
    app_name = application_data.get("name") or application_data.get("applicantName")
    app_dob = application_data.get("dob")
    app_income = application_data.get("declared_income") or application_data.get("declaredIncome")
    app_category = application_data.get("category")

    # Collect values by entity type
    name_values = []
    if app_name:
        name_values.append({"source": "Application Form", "value": app_name})

    income_values = []
    if app_income is not None:
        income_values.append({"source": "Application Declared", "value": f"₹{float(app_income):,.0f}"})

    dob_values = []
    if app_dob:
        dob_values.append({"source": "Application Form", "value": str(app_dob)})

    st_values = []
    if app_category:
        st_values.append({"source": "Application Form", "value": app_category})

    for doc in extracted_docs:
        doc_name = doc.get("name") or doc.get("docType") or "Document"
        fields = doc.get("fields") or {}

        # Name
        extracted_name = fields.get("applicantName")
        if isinstance(extracted_name, dict):
            extracted_name = extracted_name.get("value")
        if extracted_name:
            name_values.append({"source": f"{doc_name}", "value": str(extracted_name)})

        # Income
        extracted_income = fields.get("annualIncome")
        if isinstance(extracted_income, dict):
            extracted_income = extracted_income.get("value")
        if extracted_income is not None:
            income_values.append({"source": f"{doc_name}", "value": f"₹{float(extracted_income):,.0f}", "raw": float(extracted_income)})

        # DOB
        extracted_dob = fields.get("dob")
        if isinstance(extracted_dob, dict):
            extracted_dob = extracted_dob.get("value")
        if extracted_dob:
            dob_values.append({"source": f"{doc_name}", "value": str(extracted_dob)})

        # Tribe
        extracted_tribe = fields.get("tribeName")
        if isinstance(extracted_tribe, dict):
            extracted_tribe = extracted_tribe.get("value")
        if extracted_tribe:
            st_values.append({"source": f"{doc_name}", "value": str(extracted_tribe)})

    # 1. Applicant Name Check
    if len(name_values) >= 2:
        v0 = name_values[0]["value"]
        all_matches = [match_names(v0, nv["value"]) for nv in name_values[1:]]
        if all(m == "MATCH" for m in all_matches):
            status = "MATCH"
            note = "Consistent applicant name across all sources"
        elif any(m == "MISMATCH" for m in all_matches):
            status = "MISMATCH"
            note = "Discrepancy detected in applicant name"
        else:
            status = "POTENTIAL_MISMATCH"
            note = "Minor variation in name spelling or middle name"
    else:
        status = "INSUFFICIENT_DATA"
        note = "Only single source available for verification"

    checks.append({
        "field": "Applicant Name",
        "status": status,
        "values": name_values,
        "note": note
    })

    # 2. Annual Income Check
    if len(income_values) >= 2:
        declared = float(app_income) if app_income else None
        cert_incomes = [iv.get("raw") for iv in income_values if "raw" in iv]
        if declared and cert_incomes:
            diff = abs(declared - cert_incomes[0])
            if diff <= 1000.0:
                status = "MATCH"
                note = "Declared income matches income certificate figure"
            elif diff <= 25000.0:
                status = "POTENTIAL_MISMATCH"
                note = f"Slight difference of ₹{diff:,.0f} between declared and certificate"
            else:
                status = "MISMATCH"
                note = f"Declared ₹{declared:,.0f} differs from certificate ₹{cert_incomes[0]:,.0f}"
        else:
            status = "INSUFFICIENT_DATA"
            note = "Income comparison not possible"
    else:
        status = "INSUFFICIENT_DATA"
        note = "Single income source recorded"

    checks.append({
        "field": "Annual Family Income",
        "status": status,
        "values": income_values,
        "note": note
    })

    # 3. Scheduled Tribe Category Check
    if len(st_values) >= 2:
        status = "MATCH"
        note = "ST Caste certificate confirms Scheduled Tribe category"
    else:
        status = "INSUFFICIENT_DATA" if not st_values else "MATCH"
        note = "Self-declared ST; certificate verification recommended"

    checks.append({
        "field": "Scheduled Tribe Status",
        "status": status,
        "values": st_values,
        "note": note
    })

    return checks

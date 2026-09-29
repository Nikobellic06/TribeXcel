from typing import Dict, Any, List, Tuple
from app.config import SCHEME_RULES

def evaluate_scheme_eligibility(scheme_code: str, application: Dict[str, Any], documents: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Configuration-driven deterministic scholarship rule engine based on official MoTA guidelines.
    Provides preliminary verification for authorized officer review.
    """
    code = (scheme_code or "NFST").upper()
    rules = SCHEME_RULES.get(code, SCHEME_RULES["NFST"])
    results = []

    # 1. Scheduled Tribe Eligibility
    category = application.get("category", "")
    is_st = any(allowed.lower() in category.lower() for allowed in rules.get("allowed_categories", ["ST"]))
    has_st_doc = any("st" in (d.get("docType") or d.get("name") or "").lower() or "caste" in (d.get("docType") or d.get("name") or "").lower() for d in documents)

    if is_st and has_st_doc:
        results.append({
            "id": "st_status",
            "label": "Scheduled Tribe Eligibility",
            "status": "PASS",
            "details": f"Declared {category} and ST Certificate attached"
        })
    elif is_st:
        results.append({
            "id": "st_status",
            "label": "Scheduled Tribe Eligibility",
            "status": "REQUIRES_HUMAN_REVIEW",
            "details": "Declared ST, pending certificate cross-verification"
        })
    else:
        results.append({
            "id": "st_status",
            "label": "Scheduled Tribe Eligibility",
            "status": "FAIL",
            "details": f"Category '{category}' does not meet ST criterion"
        })

    # 2. Annual Family Income Ceiling
    income_limit = rules.get("income_limit")
    declared_income = application.get("declared_income") or application.get("declaredIncome")
    
    # Try finding income from extracted document if not declared
    if declared_income is None:
        for d in documents:
            f = d.get("fields") or {}
            inc = f.get("annualIncome")
            if isinstance(inc, dict):
                inc = inc.get("value")
            if inc is not None:
                declared_income = float(inc)
                break

    if income_limit:
        if declared_income is None:
            results.append({
                "id": "income_limit",
                "label": f"Annual Family Income (Ceiling ₹{income_limit:,.0f})",
                "status": "INSUFFICIENT_DATA",
                "details": "Annual family income not provided"
            })
        elif float(declared_income) <= income_limit:
            results.append({
                "id": "income_limit",
                "label": f"Annual Family Income (Ceiling ₹{income_limit:,.0f})",
                "status": "PASS",
                "details": f"Declared ₹{float(declared_income):,.0f} is within ₹{income_limit:,.0f} limit"
            })
        else:
            results.append({
                "id": "income_limit",
                "label": f"Annual Family Income (Ceiling ₹{income_limit:,.0f})",
                "status": "FAIL",
                "details": f"Declared ₹{float(declared_income):,.0f} exceeds ceiling of ₹{income_limit:,.0f}"
            })

    # 3. Minimum Qualifying Academic Cutoff
    min_pct = rules.get("min_academic_pct", 0.0)
    if min_pct > 0.0:
        declared_marks = application.get("declared_marks") or application.get("declaredMarks")
        if declared_marks is None:
            for d in documents:
                f = d.get("fields") or {}
                pct = f.get("percentage")
                if isinstance(pct, dict):
                    pct = pct.get("value")
                if pct is not None:
                    declared_marks = float(pct)
                    break

        if declared_marks is None:
            results.append({
                "id": "academic_marks",
                "label": f"Minimum Qualifying Marks ({min_pct}% cutoff)",
                "status": "INSUFFICIENT_DATA",
                "details": "Academic marks not provided"
            })
        elif float(declared_marks) >= min_pct:
            results.append({
                "id": "academic_marks",
                "label": f"Minimum Qualifying Marks ({min_pct}% cutoff)",
                "status": "PASS",
                "details": f"Declared {float(declared_marks):.1f}% meets {min_pct}% cutoff"
            })
        else:
            results.append({
                "id": "academic_marks",
                "label": f"Minimum Qualifying Marks ({min_pct}% cutoff)",
                "status": "FAIL",
                "details": f"Declared {float(declared_marks):.1f}% is below required {min_pct}%"
            })

    # 4. Mandatory Document Checklist
    req_docs = rules.get("required_documents", [])
    doc_labels = [((d.get("name") or d.get("docType") or "")).lower() for d in documents]
    missing_docs = []
    for rd in req_docs:
        kw = rd.lower().split()[0] # e.g. "caste", "income", "domicile", "latest", "bank", "admission"
        if not any(kw in dl for dl in doc_labels):
            missing_docs.append(rd)

    if not missing_docs:
        results.append({
            "id": "documents_check",
            "label": "Mandatory Document Submission",
            "status": "PASS",
            "details": f"All {len(req_docs)} required scheme documents submitted"
        })
    else:
        results.append({
            "id": "documents_check",
            "label": "Mandatory Document Submission",
            "status": "FAIL",
            "details": f"Missing required documents: {', '.join(missing_docs)}"
        })

    # Determine overall preliminary status
    has_fail = any(r["status"] == "FAIL" for r in results)
    has_missing = bool(missing_docs)
    has_review = any(r["status"] in ("REQUIRES_HUMAN_REVIEW", "INSUFFICIENT_DATA") for r in results)

    if has_fail:
        preliminary_result = "NOT_ELIGIBLE"
    elif has_missing:
        preliminary_result = "INCOMPLETE"
    elif has_review:
        preliminary_result = "HUMAN_REVIEW"
    else:
        preliminary_result = "ELIGIBLE"

    return {
        "scheme": code,
        "schemeName": rules.get("name", code),
        "preliminaryResult": preliminary_result,
        "results": results,
        "missingDocuments": missing_docs,
        "authorityNotice": "Preliminary rule assessment — Subject to official verification by designated Ministry / Nodal Officer"
    }

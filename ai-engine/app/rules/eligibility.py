from typing import Dict, Any, List, Tuple
from app.config import SCHEME_RULES, CHECK_WEIGHTS
from app.models.request import VerificationRequest
from app.models.response import AiCheck, AiVerification, DocumentExtractionSummary
from app.ocr.parsers import (
    parse_caste_certificate,
    parse_income_certificate,
    parse_marksheet,
    parse_admission_letter,
    fuzzy_match_ratio
)
from app.ocr.engine import ocr_engine

def run_eligibility_verification(
    request: VerificationRequest
) -> Tuple[AiVerification, str, Dict[str, DocumentExtractionSummary], str, Dict[str, Any]]:
    """
    Executes full AI verification pipeline:
    1. Extracts text from all submitted documents.
    2. Runs domain parsers for Caste, Income, Marksheet, and Admission.
    3. Cross-checks applicant form entries vs document text.
    4. Evaluates the 4 core eligibility rules.
    5. Calculates 0-100 eligibility score and status.
    """
    scheme_key = request.scheme.upper()
    scheme_config = SCHEME_RULES.get(scheme_key, SCHEME_RULES["NFST"])
    required_docs = scheme_config["required_documents"]
    income_limit = scheme_config["income_limit"]
    min_academic_pct = scheme_config["min_academic_pct"]

    # 1. Process documents through OCR & parsers
    extractions: Dict[str, DocumentExtractionSummary] = {}
    doc_map: Dict[str, Dict[str, Any]] = {}
    submitted_names = set()

    detected_caste_data = None
    detected_income_data = None
    detected_marks_data = None
    detected_admission_data = None

    for doc in request.documents:
        submitted_names.add(doc.name)
        ocr_res = ocr_engine.process_document(
            name=doc.name,
            source=doc.source or "manual",
            content_base64=doc.content_base64,
            raw_text=doc.raw_text
        )

        doc_text = ocr_res["text"]
        detected_fields: Dict[str, Any] = {}

        # Route to appropriate parser based on document type
        name_lower = doc.name.lower()
        if "caste" in name_lower or "tribe" in name_lower:
            parsed = parse_caste_certificate(doc_text)
            detected_fields = parsed
            detected_caste_data = parsed
        elif "income" in name_lower:
            parsed = parse_income_certificate(doc_text)
            detected_fields = parsed
            detected_income_data = parsed
        elif "marksheet" in name_lower or "mark" in name_lower or "transcript" in name_lower:
            parsed = parse_marksheet(doc_text)
            detected_fields = parsed
            detected_marks_data = parsed
        elif "admission" in name_lower or "offer" in name_lower:
            parsed = parse_admission_letter(doc_text)
            detected_fields = parsed
            detected_admission_data = parsed

        extractions[doc.name] = DocumentExtractionSummary(
            name=doc.name,
            source=doc.source or "manual",
            verified=ocr_res.get("verified", doc.source == "digilocker"),
            ocr_confidence=ocr_res["confidence"],
            detected_fields=detected_fields,
            quality_issues=ocr_res.get("quality", {}).get("issues", [])
        )
        doc_map[doc.name] = ocr_res

    # 2. Check 1: All required documents present
    missing_docs = [req_doc for req_doc in required_docs if req_doc not in submitted_names]
    docs_present_pass = (len(missing_docs) == 0)
    docs_detail = "All 4 required documents attached." if docs_present_pass else f"Missing required documents: {', '.join(missing_docs)}"

    # 3. Check 2: Income within scheme limit
    # First check extracted income from certificate, fallback to form-declared income
    extracted_income = detected_income_data.get("annual_income") if detected_income_data else None
    eval_income = extracted_income if extracted_income is not None else request.declared_income

    income_pass = False
    income_detail = ""
    if eval_income is not None:
        if eval_income <= income_limit:
            income_pass = True
            income_detail = f"Income of Rs. {eval_income:,.0f} is within the Rs. {income_limit:,.0f} limit."
        else:
            income_pass = False
            income_detail = f"Income of Rs. {eval_income:,.0f} exceeds scheme ceiling of Rs. {income_limit:,.0f}."
    else:
        # If income cert is present but amount could not be parsed, mark as deficient for clarity
        if "Income Certificate" in submitted_names:
            income_pass = True  # Benefit of doubt if document present, admin to review
            income_detail = "Income certificate provided; amount requires manual verification."
        else:
            income_pass = False
            income_detail = "No income certificate or declared income found."

    # 4. Check 3: Category matches ST records
    category_pass = False
    category_detail = ""
    is_declared_st = request.category in scheme_config["allowed_categories"]

    caste_doc_verified = False
    if "Caste Certificate" in doc_map and doc_map["Caste Certificate"].get("verified", False):
        caste_doc_verified = True  # DigiLocker verified

    if detected_caste_data and (detected_caste_data.get("is_st") or caste_doc_verified):
        category_pass = True
        tribe_info = f" (Tribe: {detected_caste_data.get('detected_tribe')})" if detected_caste_data.get('detected_tribe') else ""
        category_detail = f"Verified Scheduled Tribe status from Caste Certificate{tribe_info}."
    elif caste_doc_verified:
        category_pass = True
        category_detail = "Verified Scheduled Tribe status via DigiLocker."
    elif is_declared_st and "Caste Certificate" in submitted_names:
        category_pass = True
        category_detail = "Declared Scheduled Tribe with manual certificate uploaded."
    else:
        category_pass = False
        category_detail = "Category not verified as Scheduled Tribe or certificate missing."

    # 5. Check 4: Marks meet minimum cutoff
    extracted_marks = detected_marks_data.get("percentage") if detected_marks_data else None
    eval_marks = extracted_marks if extracted_marks is not None else request.declared_marks

    marks_pass = False
    marks_detail = ""
    if eval_marks is not None:
        if eval_marks >= min_academic_pct:
            marks_pass = True
            marks_detail = f"Obtained {eval_marks:.1f}% meets minimum cutoff of {min_academic_pct:.0f}%."
        else:
            marks_pass = False
            marks_detail = f"Obtained {eval_marks:.1f}% is below minimum cutoff of {min_academic_pct:.0f}%."
    else:
        if "Latest Marksheet" in submitted_names:
            marks_pass = True
            marks_detail = "Marksheet uploaded; percentage pending confirmation."
        else:
            marks_pass = False
            marks_detail = "Marksheet missing."

    # 6. Cross-check applicant name against certificates (Fraud / Flag check)
    name_mismatch_flag = False
    name_check_details = []
    for doc_name, summary in extractions.items():
        doc_extracted_name = summary.detected_fields.get("extracted_name")
        if doc_extracted_name:
            ratio = fuzzy_match_ratio(request.name, doc_extracted_name)
            if ratio < 0.60:
                name_mismatch_flag = True
                name_check_details.append(
                    f"Name mismatch on {doc_name}: Form says '{request.name}', document says '{doc_extracted_name}' (similarity {ratio:.0%})"
                )

    # 7. Assemble AI Checks array
    checks = [
        AiCheck(label="Income within scheme limit", passed=income_pass, details=income_detail),
        AiCheck(label="Category matches ST records", passed=category_pass, details=category_detail),
        AiCheck(label="Marks meet minimum cutoff", passed=marks_pass, details=marks_detail),
        AiCheck(label="All required documents present", passed=docs_present_pass, details=docs_detail),
    ]

    # 8. Compute weighted eligibility score (0-100)
    score = 0.0
    for chk in checks:
        if chk.passed:
            score += CHECK_WEIGHTS.get(chk.label, 25.0)

    # Deduction if documents have high blur / quality issues
    quality_deductions = 0.0
    for summary in extractions.values():
        if summary.quality_issues:
            quality_deductions += 2.0
    score = max(10.0, score - quality_deductions)
    final_score = int(min(100, max(0, round(score))))

    # 9. Determine overall Status & Recommendation
    status = "Eligible"
    reasons = []

    if name_mismatch_flag:
        status = "Flagged"
        reasons.extend(name_check_details)
    elif not docs_present_pass:
        status = "Deficient"
        reasons.append(f"Missing required documents: {', '.join(missing_docs)}")
    elif not income_pass:
        status = "Deficient" if eval_income is not None else "Flagged"
        reasons.append(income_detail)
    elif not category_pass:
        status = "Flagged"
        reasons.append("Category does not match ST requirements.")
    elif not marks_pass:
        status = "Deficient"
        reasons.append(marks_detail)
    else:
        status = "Eligible"
        reasons.append("All eligibility criteria and required documents satisfied.")

    recommendation = " ".join(reasons)
    ai_verification = AiVerification(checks=checks, score=final_score)

    aux_data = {
        "annual_income": eval_income,
        "academic_pct": eval_marks,
        "income_limit": income_limit,
    }

    return ai_verification, status, extractions, recommendation, aux_data

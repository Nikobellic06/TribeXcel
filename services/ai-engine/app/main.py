import os
import sys
import asyncio
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.config import settings, SCHEME_RULES
from app.ocr.engine import ocr_engine
from app.ocr.classifier import classify_document
from app.ocr.extractors import extract_fields_for_document
from app.ocr.validation import validate_and_score_fields
from app.rules.cross_check import run_cross_document_checks
from app.rules.scholarship_rules import evaluate_scheme_eligibility
from app.models.request import VerificationRequest
from app.models.response import VerificationResponse

# Ensure Windows UTF-8 stdout without cp1252 crashes
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    except Exception:
        pass

app = FastAPI(
    title="Ministry of Tribal Affairs — AI Document & Verification Engine",
    description="Deterministic OCR processing, document classification, structured entity extraction, cross-document verification, and scholarship eligibility assessment (SIH26239)",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "service": "MoTA Scholarship AI Document & Verification Engine",
        "status": "online",
        "version": "2.0.0",
        "ocr_engine": "PaddleOCR PP-OCRv6 via RapidOCR + PyMuPDF + OpenCV",
        "authority": "Ministry of Tribal Affairs, Government of India"
    }

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "engine": "PaddleOCR PP-OCRv6",
        "opencv": True,
        "pymupdf": True,
        "schemes": list(SCHEME_RULES.keys()),
        "version": "2.0.0"
    }

@app.get("/schemes")
def get_schemes():
    return SCHEME_RULES

@app.post("/api/analyze-document")
async def analyze_document(
    file: Optional[UploadFile] = File(None),
    document: Optional[UploadFile] = File(None),
    document_hint: Optional[str] = Form(None),
    documentType: Optional[str] = Form(None),
    application_id: Optional[str] = Form(None),
    document_id: Optional[str] = Form(None)
):
    """
    Main Document Intelligence Endpoint (Part 9).
    Processes PDF or image via PyMuPDF/OpenCV/PaddleOCR, classifies document type
    deterministically from content, extracts structured entities, validates them,
    and returns complete structured analysis.
    """
    upload = file or document
    if not upload:
        raise HTTPException(status_code=400, detail="No document file provided")

    try:
        content_bytes = await upload.read()
        filename = upload.filename or "uploaded_file"
        hint = document_hint or documentType

        # 1. OCR & Quality Processing
        ocr_result = ocr_engine.process_file_bytes(content_bytes, filename=filename)
        text = ocr_result.get("text", "")
        avg_conf = ocr_result.get("confidence", 0.0)
        quality = ocr_result.get("quality", {})

        # 2. Document Classification (content-based, NEVER filename-based)
        classification = classify_document(text, ocr_result.get("lines"))
        detected_type = classification.get("documentType", "UNKNOWN")

        # Use hint as fallback only if classification was indeterminate
        if detected_type in ("UNKNOWN", "OTHER") and hint:
            detected_type = hint.upper().replace(" ", "_")
            classification["status"] = "IDENTIFIED_WITH_HINT"

        # 3. Structured Field Extraction
        raw_fields = extract_fields_for_document(detected_type, text, ocr_result.get("lines"))

        # 4. Field Validation & Confidence Scoring
        structured_fields, validation_report, flags = validate_and_score_fields(raw_fields, avg_conf)

        if quality.get("status") in ("POOR", "UNREADABLE"):
            flags.append("Document image quality is degraded or blurred; officer visual inspection recommended")

        # Helper flat extracted fields mapping for UI components
        flat_fields = {k: v["value"] for k, v in structured_fields.items()}

        return {
            "success": True,
            "documentType": detected_type,
            "detectedType": detected_type,
            "confidence": classification.get("confidence", avg_conf),
            "classification": classification,
            "quality": quality,
            "qualityScore": round(quality.get("score", 0.90) * 100),
            "evidence": classification.get("evidence", []),
            "ocr": {
                "text": text[:1500] if len(text) > 1500 else text,
                "confidence": avg_conf,
                "lineCount": len(ocr_result.get("lines", []))
            },
            "fields": structured_fields,
            "extractedFields": flat_fields,
            "validation": validation_report,
            "flags": flags,
            "metadata": {
                "filename": filename,
                "applicationId": application_id,
                "documentId": document_id,
                "pageCount": ocr_result.get("page_count", 1)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Document analysis failed: {str(e)}")

@app.post("/api/classify-document")
async def classify_doc_endpoint(
    text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    """Classifies document strictly from extracted text or uploaded file bytes."""
    ocr_text = text or ""
    if file:
        bytes_data = await file.read()
        res = ocr_engine.process_file_bytes(bytes_data, filename=file.filename or "")
        ocr_text = res.get("text", "")

    return classify_document(ocr_text)

@app.post("/api/extract-fields")
def extract_fields_endpoint(payload: Dict[str, Any] = Body(...)):
    """Extracts structured entities given documentType and text."""
    doc_type = payload.get("documentType", "")
    text = payload.get("text", "")
    avg_conf = float(payload.get("ocrConfidence", 0.90))

    raw_fields = extract_fields_for_document(doc_type, text)
    structured_fields, validation, flags = validate_and_score_fields(raw_fields, avg_conf)
    return {
        "documentType": doc_type,
        "fields": structured_fields,
        "validation": validation,
        "flags": flags
    }

@app.post("/api/check-cross-document")
def check_cross_document_endpoint(payload: Dict[str, Any] = Body(...)):
    """Runs cross-document entity comparisons between application and documents."""
    app_data = payload.get("application", {})
    documents = payload.get("documents", [])
    return {
        "crossChecks": run_cross_document_checks(app_data, documents)
    }

@app.post("/api/evaluate-eligibility")
def evaluate_eligibility_endpoint(payload: Dict[str, Any] = Body(...)):
    """Runs deterministic scholarship rules for PRE_MATRIC, NOS, or NFST."""
    scheme = payload.get("scheme", "NFST")
    app_data = payload.get("application", {})
    documents = payload.get("documents", [])
    return evaluate_scheme_eligibility(scheme, app_data, documents)

@app.post("/api/analyze-application")
def analyze_application_endpoint(payload: Dict[str, Any] = Body(...)):
    """Full application verification combining cross-document checks and eligibility rules."""
    scheme = payload.get("scheme", "NFST")
    app_data = payload.get("application", payload)
    documents = payload.get("documents", [])

    cross_checks = run_cross_document_checks(app_data, documents)
    eligibility = evaluate_scheme_eligibility(scheme, app_data, documents)

    # Determine overall status
    has_mismatch = any(c.get("status") == "MISMATCH" for c in cross_checks)
    rule_status = eligibility.get("preliminaryResult", "ELIGIBLE")

    if rule_status == "NOT_ELIGIBLE":
        overall = "NOT_ELIGIBLE"
    elif rule_status == "INCOMPLETE":
        overall = "INCOMPLETE"
    elif has_mismatch or rule_status == "HUMAN_REVIEW":
        overall = "REQUIRES_HUMAN_REVIEW"
    else:
        overall = "PRELIMINARY_ELIGIBLE"

    return {
        "success": True,
        "scheme": scheme,
        "overallStatus": overall,
        "crossDocumentChecks": cross_checks,
        "eligibilityEvaluation": eligibility,
        "authorityNotice": "Preliminary automated verification for authorized scholarship officer review."
    }

@app.post("/verify")
def verify_application_compat(request: VerificationRequest):
    """
    Backward-compatible endpoint for existing scholarship-admin backend calls.
    Returns:
    - status: 'Eligible' | 'Deficient' | 'Flagged'
    - aiVerification: { checks: [...], score: 0-100 }
    - meritScores: { academic, exam, socioEconomic, interview }
    - extracted_summary: per-document parsed entities
    """
    try:
        from app.rules.eligibility import run_eligibility_verification
        from app.rules.merit import calculate_merit_scores

        ai_verification, status, extractions, recommendation, aux_data = run_eligibility_verification(request)

        merit_scores = calculate_merit_scores(
            academic_pct=aux_data.get("academic_pct"),
            annual_income=aux_data.get("annual_income"),
            income_limit=aux_data.get("income_limit", 600000.0),
            declared_exam_score=request.declared_exam_score,
            state=request.state or "",
            district=request.district or ""
        )

        return VerificationResponse(
            status=status,
            aiVerification=ai_verification,
            meritScores=merit_scores,
            extracted_summary=extractions,
            recommendation_reason=recommendation
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Verification failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

import os
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings, SCHEME_RULES
from app.models.request import VerificationRequest, DocumentInput
from app.models.response import VerificationResponse, DocumentExtractionSummary
from app.rules.eligibility import run_eligibility_verification
from app.rules.merit import calculate_merit_scores
from app.ocr.engine import ocr_engine
from app.ocr.parsers import (
    parse_caste_certificate,
    parse_income_certificate,
    parse_marksheet,
    parse_admission_letter
)

app = FastAPI(
    title="TribeXcel AI Verification & Merit Engine",
    description="Automated OCR parsing, document fraud detection, eligibility rule verification, and merit scoring for MoTA scholarships (SIH26239)",
    version="1.0.0"
)

# Enable CORS for local testing from any dev port (5000, 5173, 5174, etc.)
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
        "service": "TribeXcel AI Verification & Merit Engine",
        "status": "online",
        "problem_statement": "SIH26239 - Ministry of Tribal Affairs",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "schemes_configured": list(SCHEME_RULES.keys()),
        "ocr_config": {
            "google_vision_active": bool(settings.GOOGLE_VISION_API_KEY),
            "tesseract_cmd_set": bool(settings.TESSERACT_CMD)
        }
    }

@app.get("/schemes")
def get_schemes():
    return SCHEME_RULES

@app.post("/verify", response_model=VerificationResponse)
def verify_application(request: VerificationRequest):
    """
    Main verification endpoint (Section 8.4 of SIH flow).
    Receives application details + document metadata/content.
    Returns:
    - aiVerification: { checks: [...], score: 0-100 }
    - meritScores: { academic: ..., exam: ..., socioEconomic: ..., interview: ... }
    - status: 'Eligible' | 'Deficient' | 'Flagged'
    - extracted_summary: per-document parsed entities
    """
    try:
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
        raise HTTPException(status_code=500, detail=f"Verification pipeline failed: {str(e)}")

@app.post("/verify-files", response_model=VerificationResponse)
async def verify_application_files(
    name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(""),
    category: str = Form("Scheduled Tribe"),
    scheme: str = Form("NFST"),
    state: str = Form(""),
    district: str = Form(""),
    course: str = Form(""),
    institution: str = Form(""),
    declared_income: Optional[float] = Form(None),
    declared_marks: Optional[float] = Form(None),
    caste_cert: Optional[UploadFile] = File(None),
    income_cert: Optional[UploadFile] = File(None),
    marksheet: Optional[UploadFile] = File(None),
    admission_letter: Optional[UploadFile] = File(None),
):
    """
    Multipart/form-data upload endpoint allowing file submissions directly.
    """
    docs_input: List[DocumentInput] = []

    file_mapping = [
        ("Caste Certificate", caste_cert),
        ("Income Certificate", income_cert),
        ("Latest Marksheet", marksheet),
        ("Admission Letter", admission_letter),
    ]

    for doc_name, upload_file in file_mapping:
        if upload_file:
            content_bytes = await upload_file.read()
            ocr_res = ocr_engine.process_document(
                name=doc_name,
                source="manual",
                file_bytes=content_bytes
            )
            docs_input.append(DocumentInput(
                name=doc_name,
                source="manual",
                raw_text=ocr_res["text"]
            ))

    req = VerificationRequest(
        name=name,
        email=email,
        phone=phone,
        category=category,
        scheme=scheme,
        state=state,
        district=district,
        course=course,
        institution=institution,
        declared_income=declared_income,
        declared_marks=declared_marks,
        documents=docs_input
    )

    return verify_application(req)

@app.post("/ocr/extract")
async def extract_single_document(
    doc_type: str = Form(..., description="'caste', 'income', 'marksheet', or 'admission'"),
    file: UploadFile = File(...)
):
    """
    Utility endpoint to test OCR and entity extraction on a single uploaded file.
    """
    content_bytes = await file.read()
    res = ocr_engine.process_document(name=file.filename, file_bytes=content_bytes)
    text = res["text"]

    parsed = {}
    d = doc_type.lower()
    if "caste" in d:
        parsed = parse_caste_certificate(text)
    elif "income" in d:
        parsed = parse_income_certificate(text)
    elif "mark" in d:
        parsed = parse_marksheet(text)
    elif "admission" in d:
        parsed = parse_admission_letter(text)

    return {
        "filename": file.filename,
        "ocr_confidence": res["confidence"],
        "quality_metrics": res.get("quality", {}),
        "raw_text_preview": text[:500] if text else "",
        "parsed_entities": parsed
    }

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class AiCheck(BaseModel):
    label: str = Field(..., description="Check description (must match Admin UI expectations)")
    passed: bool = Field(..., description="Whether the check passed")
    details: Optional[str] = Field(None, description="Explanation or extracted data supporting check")

class AiVerification(BaseModel):
    checks: List[AiCheck] = Field(..., description="Array of AI check items")
    score: int = Field(..., ge=0, le=100, description="Overall eligibility score (0-100)")

class MeritScores(BaseModel):
    academic: int = Field(..., ge=0, le=100, description="Normalized academic performance (0-100)")
    exam: int = Field(..., ge=0, le=100, description="Normalized entrance exam score (0-100)")
    socioEconomic: int = Field(..., ge=0, le=100, description="Derived socio-economic hardship score (0-100)")
    interview: int = Field(..., ge=0, le=100, description="Baseline / interview score (0-100)")

class DocumentExtractionSummary(BaseModel):
    name: str
    source: str
    verified: bool
    ocr_confidence: float
    detected_fields: Dict[str, Any] = Field(default_factory=dict)
    quality_issues: List[str] = Field(default_factory=list)

class VerificationResponse(BaseModel):
    status: str = Field(..., description="'Eligible', 'Deficient', or 'Flagged'")
    aiVerification: AiVerification = Field(..., description="AI verification payload matching backend schema")
    meritScores: MeritScores = Field(..., description="Merit scoring payload matching backend schema")
    extracted_summary: Dict[str, DocumentExtractionSummary] = Field(default_factory=dict)
    recommendation_reason: str = Field("", description="Summary of verification decision for admin review")

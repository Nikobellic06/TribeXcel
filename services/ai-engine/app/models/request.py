from typing import List, Optional
from pydantic import BaseModel, Field

class DocumentInput(BaseModel):
    name: str = Field(..., description="Name of document, e.g. 'Caste Certificate', 'Income Certificate', 'Latest Marksheet', 'Admission Letter'")
    source: Optional[str] = Field("manual", description="'manual' or 'digilocker'")
    file_url: Optional[str] = Field("", description="Remote URL or local path to document")
    content_base64: Optional[str] = Field(None, description="Base64 encoded file content (PDF or image)")
    raw_text: Optional[str] = Field(None, description="Direct text content (if pre-extracted or testing)")

class VerificationRequest(BaseModel):
    name: str = Field(..., description="Applicant's full name from application form")
    email: str = Field(..., description="Applicant's email address")
    phone: Optional[str] = Field("", description="Contact number")
    dob: Optional[str] = Field("", description="Date of birth")
    gender: Optional[str] = Field("", description="Gender")
    category: str = Field("Scheduled Tribe", description="Social category claimed")
    state: Optional[str] = Field("", description="Applicant domicile state")
    district: Optional[str] = Field("", description="Applicant district")
    scheme: str = Field(..., description="'NFST' or 'NOS'")
    course: Optional[str] = Field("", description="Applied or admitted course")
    institution: Optional[str] = Field("", description="Institution name")
    documents: List[DocumentInput] = Field(default_factory=list, description="List of submitted documents")
    
    # Optional form-entered fields for cross-matching
    declared_income: Optional[float] = Field(None, description="Income entered in form")
    declared_marks: Optional[float] = Field(None, description="Marks/CGPA entered in form")
    declared_exam_score: Optional[float] = Field(None, description="Entrance exam score if applicable")

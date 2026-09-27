import os
import base64
import fitz  # PyMuPDF
import io
from PIL import Image
import requests
from typing import Tuple, Dict, Any

from app.config import settings
from app.quality.authenticity import assess_image_quality

def extract_text_from_pdf(pdf_bytes: bytes) -> Tuple[str, float]:
    """
    Extracts text from PDF document using PyMuPDF.
    Returns (extracted_text, confidence_score).
    """
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        text_parts = []
        for page in doc:
            text_parts.append(page.get_text())
        
        full_text = "\n".join(text_parts).strip()
        confidence = 0.95 if len(full_text) > 50 else 0.4
        return full_text, confidence
    except Exception as e:
        return f"[PDF Extraction Error: {str(e)}]", 0.0

def extract_text_from_image_google_vision(image_bytes: bytes, api_key: str) -> Tuple[str, float]:
    """
    Calls Google Cloud Vision API REST endpoint for OCR.
    """
    try:
        url = f"https://vision.googleapis.com/v1/images:annotate?key={api_key}"
        content_b64 = base64.b64encode(image_bytes).decode("utf-8")
        payload = {
            "requests": [
                {
                    "image": {"content": content_b64},
                    "features": [{"type": "DOCUMENT_TEXT_DETECTION"}]
                }
            ]
        }
        res = requests.post(url, json=payload, timeout=10)
        if res.status_code == 200:
            data = res.json()
            annotation = data["responses"][0].get("fullTextAnnotation", {})
            text = annotation.get("text", "")
            return text, 0.96
        else:
            return "", 0.0
    except Exception:
        return "", 0.0

def extract_text_from_image_tesseract(image_bytes: bytes) -> Tuple[str, float]:
    """
    Extracts text using pytesseract if available.
    """
    try:
        import pytesseract
        if settings.TESSERACT_CMD:
            pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD
            
        image = Image.open(io.BytesIO(image_bytes))
        text = pytesseract.image_to_string(image)
        confidence = 0.85 if len(text.strip()) > 30 else 0.4
        return text.strip(), confidence
    except Exception:
        return "", 0.0

class OCREngine:
    def process_document(
        self,
        name: str,
        source: str = "manual",
        content_base64: str = None,
        raw_text: str = None,
        file_bytes: bytes = None
    ) -> Dict[str, Any]:
        """
        Processes an incoming document (PDF, Image, or plain text)
        and returns extracted text, confidence score, and quality metrics.
        """
        # If source is digilocker, it is pre-verified at source
        is_digilocker = (source.lower() == "digilocker")
        
        # If raw text was supplied directly
        if raw_text and raw_text.strip():
            return {
                "text": raw_text.strip(),
                "confidence": 0.99 if is_digilocker else 0.90,
                "source": source,
                "verified": is_digilocker,
                "quality": {"is_valid": True, "issues": []}
            }

        # Decode base64 if provided
        data_bytes = file_bytes
        if not data_bytes and content_base64:
            try:
                # Remove data uri prefix if present (e.g., data:image/png;base64,...)
                if "," in content_base64:
                    content_base64 = content_base64.split(",", 1)[1]
                data_bytes = base64.b64decode(content_base64)
            except Exception as e:
                return {
                    "text": "",
                    "confidence": 0.0,
                    "source": source,
                    "verified": is_digilocker,
                    "quality": {"is_valid": False, "issues": [f"Invalid base64 encoding: {str(e)}"]}
                }

        if not data_bytes:
            # Fallback if no bytes supplied
            return {
                "text": "",
                "confidence": 0.0,
                "source": source,
                "verified": is_digilocker,
                "quality": {"is_valid": False, "issues": ["No document content provided"]}
            }

        quality_report = {"is_valid": True, "issues": []}
        extracted_text = ""
        confidence = 0.0

        # Check if PDF
        if data_bytes.startswith(b"%PDF"):
            extracted_text, confidence = extract_text_from_pdf(data_bytes)
        else:
            # It's an image
            quality_report = assess_image_quality(data_bytes)

            # 1. Try Google Vision if key is configured
            if settings.GOOGLE_VISION_API_KEY:
                extracted_text, confidence = extract_text_from_image_google_vision(
                    data_bytes, settings.GOOGLE_VISION_API_KEY
                )

            # 2. Try Tesseract
            if not extracted_text:
                extracted_text, confidence = extract_text_from_image_tesseract(data_bytes)

            # 3. If OCR was not able to run or produced empty text, retain placeholder note
            if not extracted_text:
                extracted_text = f"[OCR Engine initialized for {name}]"
                confidence = 0.5

        return {
            "text": extracted_text,
            "confidence": confidence,
            "source": source,
            "verified": is_digilocker,
            "quality": quality_report
        }

ocr_engine = OCREngine()

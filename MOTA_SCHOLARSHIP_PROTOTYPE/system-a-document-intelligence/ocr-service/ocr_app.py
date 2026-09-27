import io
import os
import sys
import asyncio
import math
import numpy as np
import cv2
from PIL import Image
import pymupdf
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from rapidocr import RapidOCR

# Fix Windows ProactorEventLoop IOCP deadlock (WinError 64) with Uvicorn on Windows Python 3.10+
if sys.platform == "win32":
    try:
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    except Exception as e:
        print(f"Warning setting event loop policy: {e}")

app = FastAPI(title="MoTA OCR & Image Preprocessing Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize RapidOCR (PaddleOCR PP-OCRv6)
ocr_engine = RapidOCR()

def compute_blur_metric(gray_img: np.ndarray) -> float:
    """Compute Laplacian variance as blur/sharpness metric."""
    try:
        val = cv2.Laplacian(gray_img, cv2.CV_64F).var()
        return float(val)
    except Exception:
        return 200.0

def estimate_deskew_angle(gray_img: np.ndarray) -> float:
    """Estimate skew angle using Hough lines."""
    try:
        edges = cv2.Canny(gray_img, 50, 150, apertureSize=3)
        lines = cv2.HoughLines(edges, 1, np.pi / 180, 150)
        if lines is not None:
            angles = []
            for rho, theta in lines[:20, 0]:
                angle = (theta * 180 / np.pi) - 90
                if abs(angle) < 45:
                    angles.append(angle)
            if angles:
                return float(np.median(angles))
    except Exception:
        pass
    return 0.0

def preprocess_image(cv_img: np.ndarray):
    """
    OpenCV preprocessing pipeline:
    - Grayscale conversion
    - Contrast enhancement (CLAHE)
    - Blur / legibility calculation
    - Deskew angle estimation
    """
    preprocessing_info = {
        "grayscale": True,
        "contrastEnhanced": False,
        "deskewAngle": 0.0,
        "blurScore": 0.0,
        "width": int(cv_img.shape[1]),
        "height": int(cv_img.shape[0])
    }

    if len(cv_img.shape) == 3:
        gray = cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY)
    else:
        gray = cv_img.copy()

    blur_score = compute_blur_metric(gray)
    preprocessing_info["blurScore"] = round(blur_score, 2)

    # Contrast enhancement using CLAHE
    try:
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(gray)
        preprocessing_info["contrastEnhanced"] = True
    except Exception:
        enhanced = gray

    # Deskew angle estimation
    angle = estimate_deskew_angle(enhanced)
    preprocessing_info["deskewAngle"] = round(angle, 2)
    if abs(angle) > 1.0 and abs(angle) < 40.0:
        (h, w) = enhanced.shape[:2]
        center = (w // 2, h // 2)
        M = cv2.getRotationMatrix2D(center, angle, 1.0)
        enhanced = cv2.warpAffine(enhanced, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)

    return enhanced, preprocessing_info

def evaluate_quality(blur_score: float, width: int, height: int, avg_confidence: float):
    """Classify document quality as GOOD, WARNING, or POOR with specific issues."""
    issues = []
    score = 1.0

    if blur_score < 70.0:
        issues.append("High blur detected (Laplacian score below threshold)")
        score -= 0.35
    elif blur_score < 140.0:
        issues.append("Moderate blur or low edge contrast")
        score -= 0.15

    min_dim = min(width, height)
    if min_dim < 600:
        issues.append("Low scan resolution (minimum dimension < 600px)")
        score -= 0.25
    elif min_dim < 900:
        issues.append("Sub-optimal scan resolution")
        score -= 0.10

    if avg_confidence < 0.70:
        issues.append("Low optical character recognition confidence")
        score -= 0.20
    elif avg_confidence < 0.85:
        score -= 0.08

    score = max(0.2, min(1.0, score))

    if score >= 0.85:
        overall = "GOOD"
    elif score >= 0.60:
        overall = "WARNING"
    else:
        overall = "POOR"

    return {
        "overall": overall,
        "score": round(score, 2),
        "blurScore": blur_score,
        "resolution": [width, height],
        "issues": issues
    }

@app.get("/health")
def health():
    return {
        "status": "UP",
        "ocrEngine": "PaddleOCR (PP-OCRv6 via RapidOCR)",
        "features": ["PyMuPDF", "OpenCV CLAHE & Deskew", "Laplacian Blur Detection", "Multi-page PDF"],
        "service": "MoTA Document OCR & Preprocessing Microservice"
    }

@app.post("/ocr")
async def process_document(file: UploadFile = File(...)):
    filename = file.filename or "unknown"
    content = await file.read()

    is_pdf = filename.lower().endswith(".pdf") or (len(content) > 4 and content[:4] == b"%PDF")

    extracted_lines = []
    full_text_parts = []
    page_count = 1
    total_conf = 0.0
    conf_count = 0
    preprocessing_history = []
    primary_quality = None

    if is_pdf:
        try:
            doc = pymupdf.open(stream=content, filetype="pdf")
            page_count = len(doc)
            
            for page_idx in range(page_count):
                page = doc[page_idx]
                page_text = page.get_text().strip()

                # If page has usable digital text
                if len(page_text) > 40:
                    lines = page_text.splitlines()
                    for line in lines:
                        cleaned = line.strip()
                        if cleaned:
                            extracted_lines.append({
                                "text": cleaned,
                                "confidence": 0.99,
                                "page": page_idx + 1
                            })
                            full_text_parts.append(cleaned)
                            total_conf += 0.99
                            conf_count += 1
                    
                    rect = page.rect
                    w, h = int(rect.width * 2), int(rect.height * 2)
                    preprocessing_history.append({
                        "page": page_idx + 1,
                        "source": "PDF_DIGITAL_TEXT",
                        "width": w,
                        "height": h,
                        "blurScore": 350.0
                    })
                else:
                    # Render page to high-res image and run OCR
                    pix = page.get_pixmap(dpi=200)
                    img_np = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, pix.n)
                    if pix.n == 4:
                        img_np = cv2.cvtColor(img_np, cv2.COLOR_RGBA2BGR)
                    elif pix.n == 1:
                        img_np = cv2.cvtColor(img_np, cv2.COLOR_GRAY2BGR)

                    preprocessed, prep_info = preprocess_image(img_np)
                    prep_info["page"] = page_idx + 1
                    prep_info["source"] = "PDF_SCANNED_RENDER"
                    preprocessing_history.append(prep_info)

                    # Run RapidOCR
                    ocr_res = ocr_engine(preprocessed)
                    if ocr_res and hasattr(ocr_res, 'txts') and ocr_res.txts:
                        for text, score in zip(ocr_res.txts, ocr_res.scores):
                            cleaned = str(text).strip()
                            if cleaned:
                                sc = float(score)
                                extracted_lines.append({
                                    "text": cleaned,
                                    "confidence": round(sc, 3),
                                    "page": page_idx + 1
                                })
                                full_text_parts.append(cleaned)
                                total_conf += sc
                                conf_count += 1

            doc.close()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"PDF OCR failed: {str(e)}")
    else:
        # Standard image (JPG, PNG, JPEG, etc.)
        try:
            image = Image.open(io.BytesIO(content)).convert("RGB")
            cv_img = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)

            preprocessed, prep_info = preprocess_image(cv_img)
            prep_info["page"] = 1
            prep_info["source"] = "IMAGE_UPLOAD"
            preprocessing_history.append(prep_info)

            ocr_res = ocr_engine(preprocessed)
            if ocr_res and hasattr(ocr_res, 'txts') and ocr_res.txts:
                for text, score in zip(ocr_res.txts, ocr_res.scores):
                    cleaned = str(text).strip()
                    if cleaned:
                        sc = float(score)
                        extracted_lines.append({
                            "text": cleaned,
                            "confidence": round(sc, 3),
                            "page": 1
                        })
                        full_text_parts.append(cleaned)
                        total_conf += sc
                        conf_count += 1
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Image OCR failed: {str(e)}")

    avg_conf = round(total_conf / max(1, conf_count), 2) if conf_count > 0 else 0.5
    full_text = "\n".join(full_text_parts)

    first_prep = preprocessing_history[0] if preprocessing_history else {
        "blurScore": 200.0, "width": 1000, "height": 1400
    }
    quality_analysis = evaluate_quality(
        blur_score=first_prep.get("blurScore", 200.0),
        width=first_prep.get("width", 1000),
        height=first_prep.get("height", 1400),
        avg_confidence=avg_conf
    )

    return {
        "filename": filename,
        "isPdf": is_pdf,
        "pageCount": page_count,
        "fullText": full_text,
        "lineCount": len(extracted_lines),
        "lines": extracted_lines,
        "averageConfidence": avg_conf,
        "quality": quality_analysis,
        "preprocessing": first_prep
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=5003, loop="asyncio", access_log=False)

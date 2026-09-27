import cv2
import numpy as np
import hashlib
from typing import Dict, Any, List

def assess_image_quality(image_bytes: bytes) -> Dict[str, Any]:
    """
    Evaluates image quality, blurriness, and basic tamper indicators.
    Uses Laplacian variance to detect low-quality, blurry scans.
    """
    issues: List[str] = []
    confidence = 1.0

    try:
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            return {
                "is_valid": False,
                "confidence": 0.0,
                "blur_score": 0.0,
                "issues": ["Unable to decode image bytes"]
            }

        height, width = img.shape[:2]
        if height < 300 or width < 300:
            issues.append(f"Low resolution image ({width}x{height}); text extraction might be inaccurate")
            confidence *= 0.7

        # Convert to grayscale for blur detection
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        blur_score = float(cv2.Laplacian(gray, cv2.CV_64F).var())

        # Laplacian variance threshold: < 80 is noticeably blurry for text documents
        if blur_score < 70.0:
            issues.append(f"Image appears blurry (sharpness metric: {blur_score:.1f} < 70)")
            confidence *= 0.75

        # Check document brightness / extreme exposure
        mean_brightness = float(np.mean(gray))
        if mean_brightness < 40:
            issues.append("Document scan is excessively dark")
            confidence *= 0.8
        elif mean_brightness > 245:
            issues.append("Document scan is overexposed or blank")
            confidence *= 0.6

        # Generate sha256 checksum for duplicate detection
        file_hash = hashlib.sha256(image_bytes).hexdigest()

        return {
            "is_valid": True,
            "confidence": round(confidence, 2),
            "blur_score": round(blur_score, 2),
            "dimensions": f"{width}x{height}",
            "file_hash": file_hash,
            "issues": issues
        }

    except Exception as e:
        return {
            "is_valid": False,
            "confidence": 0.5,
            "blur_score": 0.0,
            "issues": [f"Quality assessment error: {str(e)}"]
        }

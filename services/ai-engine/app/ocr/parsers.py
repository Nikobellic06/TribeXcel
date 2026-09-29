import re
from difflib import SequenceMatcher
from typing import Dict, Any, Optional
from app.config import COMMON_ST_TRIBES

def fuzzy_match_ratio(str1: str, str2: str) -> float:
    """
    Computes Levenshtein-like similarity ratio between two strings (0.0 to 1.0).
    Ignores casing and punctuation.
    """
    if not str1 or not str2:
        return 0.0
    s1 = re.sub(r'[^a-zA-Z0-9]', '', str1.lower())
    s2 = re.sub(r'[^a-zA-Z0-9]', '', str2.lower())
    if not s1 or not s2:
        return 0.0
    if s1 in s2 or s2 in s1:
        return 0.95
    return SequenceMatcher(None, s1, s2).ratio()

def extract_name_from_text(text: str) -> Optional[str]:
    """
    Attempts to extract applicant name from standard Indian government certificate templates.
    """
    patterns = [
        r'(?:certify that|certifies that|name of applicant|student name|shri|smt|kumari|mr\.?|ms\.?)\s*:?\s*([A-Za-z\s]{3,35})(?:\s+(?:son|daughter|wife|s/o|d/o|w/o|bearing|residing|has passed|is admitted))',
        r'candidate(?:\'s)?\s*name\s*[:\-]\s*([A-Za-z\s]{3,35})',
        r'student(?:\'s)?\s*name\s*[:\-]\s*([A-Za-z\s]{3,35})',
    ]
    for p in patterns:
        m = re.search(p, text, re.IGNORECASE)
        if m:
            candidate = m.group(1).strip()
            # Clean up trailing words
            cleaned = re.sub(r'\s+(is|has|a|the|resident|of|dated)\s*$', '', candidate, flags=re.IGNORECASE)
            if len(cleaned.split()) >= 1 and len(cleaned) > 2:
                return cleaned.title()
    return None

def parse_caste_certificate(text: str) -> Dict[str, Any]:
    """
    Parses OCR text from a Caste / Tribe Certificate.
    """
    result = {
        "is_caste_cert": False,
        "is_st": False,
        "detected_tribe": None,
        "certificate_number": None,
        "issuing_authority": None,
        "extracted_name": extract_name_from_text(text),
    }

    t_lower = text.lower()

    # Look for Scheduled Tribe phrases
    st_indicators = [
        "scheduled tribe",
        "scheduled tribes",
        "order 1950",
        "constitution (scheduled tribes)",
        "anushuchit janjati",
        "category: st",
        "caste: st"
    ]
    if any(ind in t_lower for ind in st_indicators):
        result["is_st"] = True
        result["is_caste_cert"] = True

    # Check for specific recognized ST communities
    for tribe in COMMON_ST_TRIBES:
        # Match as whole word
        if re.search(rf'\b{tribe}\b', t_lower):
            result["detected_tribe"] = tribe.capitalize()
            result["is_st"] = True
            result["is_caste_cert"] = True
            break

    # Extract Certificate Number
    cert_no_match = re.search(
        r'(?:certificate\s*(?:no\.?|number)|cert\.?\s*no\.?|application\s*no\.?)\s*[:\-]?\s*([A-Za-z0-9\/\-\_]{5,30})',
        text,
        re.IGNORECASE
    )
    if cert_no_match:
        result["certificate_number"] = cert_no_match.group(1).strip()

    # Issuing Authority
    auth_match = re.search(
        r'(tahsildar|tehsildar|sub-divisional officer|sdo|district magistrate|revenue officer|deputy commissioner)',
        t_lower
    )
    if auth_match:
        result["issuing_authority"] = auth_match.group(1).title()

    return result

def parse_income_certificate(text: str) -> Dict[str, Any]:
    """
    Parses OCR text from an Income Certificate to extract annual family income.
    """
    result = {
        "is_income_cert": False,
        "annual_income": None,
        "certificate_number": None,
        "financial_year": None,
        "extracted_name": extract_name_from_text(text),
    }

    t_lower = text.lower()
    if "income" in t_lower or "revenue" in t_lower or "parivar" in t_lower or "annual income" in t_lower:
        result["is_income_cert"] = True

    # Regex for income in Lakhs: e.g. "2.4 Lakhs", "3.5 lakh"
    lakh_match = re.search(r'([0-9]+(?:\.[0-9]+)?)\s*(?:lakh|lakhs|lac|lacs)', t_lower)
    if lakh_match:
        try:
            val = float(lakh_match.group(1)) * 100000.0
            result["annual_income"] = val
        except ValueError:
            pass

    # Regex for numeric figures in Rupees: e.g., "Rs. 1,80,000", "INR 250000", "Income: 120000"
    if result["annual_income"] is None:
        numeric_matches = re.findall(
            r'(?:rs\.?|inr|₹|income(?:\s*is|\s*of|\s*:)?)\s*[:\-]?\s*([0-9]{1,2}(?:,[0-9]{2,3})*(?:\.[0-9]{2})?|[0-9]{4,8})',
            t_lower
        )
        for num_str in numeric_matches:
            cleaned = num_str.replace(',', '').strip()
            try:
                val = float(cleaned)
                # Reasonable family income bracket for scholarship (₹10,000 to ₹50,00,000)
                if 10000 <= val <= 5000000:
                    result["annual_income"] = val
                    break
            except ValueError:
                continue

    # Extract Certificate Number
    cert_no_match = re.search(
        r'(?:certificate\s*(?:no\.?|number)|cert\.?\s*no\.?)\s*[:\-]?\s*([A-Za-z0-9\/\-\_]{5,30})',
        text,
        re.IGNORECASE
    )
    if cert_no_match:
        result["certificate_number"] = cert_no_match.group(1).strip()

    # Extract Financial Year: e.g. 2024-2025, 2023-24
    fy_match = re.search(r'\b(202[0-9]-(?:20)?[2-3][0-9])\b', text)
    if fy_match:
        result["financial_year"] = fy_match.group(1)

    return result

def parse_marksheet(text: str) -> Dict[str, Any]:
    """
    Parses OCR text from a Marksheet / Grade Card to extract Percentage or CGPA.
    """
    result = {
        "is_marksheet": False,
        "percentage": None,
        "cgpa": None,
        "roll_number": None,
        "institution": None,
        "extracted_name": extract_name_from_text(text),
    }

    t_lower = text.lower()
    if any(k in t_lower for k in ["marks", "grade", "marksheet", "cgpa", "sgpa", "semester", "examination"]):
        result["is_marksheet"] = True

    # 1. Search for CGPA: e.g. "CGPA: 8.4", "CGPA 7.6 / 10"
    cgpa_match = re.search(
        r'(?:cgpa|cumulative\s*grade\s*point\s*average|gpa)\s*[:\-]?\s*([0-9](?:\.[0-9]{1,2})?)(?:\s*\/\s*10)?',
        t_lower
    )
    if cgpa_match:
        try:
            cgpa_val = float(cgpa_match.group(1))
            if 0.0 <= cgpa_val <= 10.0:
                result["cgpa"] = cgpa_val
                # Standard Indian University formula: % = CGPA * 9.5
                result["percentage"] = round(cgpa_val * 9.5, 2)
        except ValueError:
            pass

    # 2. Search for explicit percentage if CGPA not found or percentage is directly written
    pct_match = re.search(
        r'(?:percentage|aggregate\s*percentage|total\s*marks|percentage\s*obtained|percent)\s*[:\-]?\s*([0-9]{2}(?:\.[0-9]{1,2})?)\s*%',
        t_lower
    )
    if not pct_match:
        # Try standalone percentage pattern: "68.5%"
        pct_match = re.search(r'\b([4-9][0-9](?:\.[0-9]{1,2})?)\s*%', text)

    if pct_match:
        try:
            pct_val = float(pct_match.group(1))
            if 30.0 <= pct_val <= 100.0:
                result["percentage"] = pct_val
        except ValueError:
            pass

    # Extract Roll Number
    roll_match = re.search(
        r'(?:roll\s*(?:no\.?|number)|registration\s*no\.?|enrolment\s*no\.?)\s*[:\-]?\s*([A-Za-z0-9\/\-\_]{4,25})',
        text,
        re.IGNORECASE
    )
    if roll_match:
        result["roll_number"] = roll_match.group(1).strip()

    return result

def parse_admission_letter(text: str) -> Dict[str, Any]:
    """
    Parses OCR text from an Admission / Offer Letter.
    """
    result = {
        "is_admission_letter": False,
        "course": None,
        "institution": None,
        "extracted_name": extract_name_from_text(text),
    }

    t_lower = text.lower()
    if any(k in t_lower for k in ["admission", "admitted", "offer letter", "provisional admission", "enrolled", "selected for admission"]):
        result["is_admission_letter"] = True

    # Course detection
    course_match = re.search(
        r'(ph\.?d\.?|doctor of philosophy|m\.?sc\.?|m\.?tech\.?|m\.?a\.?|mba|b\.?tech\.?|b\.?e\.?|integrated\s*m\.?sc\.?)',
        t_lower
    )
    if course_match:
        result["course"] = course_match.group(1).upper()

    return result

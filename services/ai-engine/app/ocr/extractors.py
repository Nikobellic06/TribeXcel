import re
from typing import Dict, Any, Optional, List
from app.config import COMMON_ST_TRIBES

def extract_name_with_labels(text: str) -> Optional[str]:
    """Extracts person name following institutional certificate labels."""
    patterns = [
        r'(?:certify that|certifies that|this is to certify that)\s+(?:shri|smt|kumari|mr\.?|ms\.?)?\s*([A-Za-z\s]{3,35}?)(?:,|\s+(?:son|daughter|wife|s/o|d/o|w/o|bearing|residing|has passed|is admitted|student))',
        r'(?:name of (?:applicant|candidate|student)|candidate(?:\'s)?\s*name|student(?:\'s)?\s*name|applicant(?:\'s)?\s*name)\s*[:\-]\s*([A-Za-z\s]{3,35})',
        r'(?:name)\s*[:\-]\s*([A-Za-z\s]{3,30})(?:\n|\r|\s{2,})',
    ]
    for p in patterns:
        m = re.search(p, text, re.IGNORECASE)
        if m:
            cand = m.group(1).strip().rstrip(',')
            cand = re.sub(r'\s+(is|has|a|the|resident|of|dated|and|bearing)\s*$', '', cand, flags=re.IGNORECASE)
            cand = re.sub(r'^(shri|smt|kumari|mr|ms|dr)\.?\s+', '', cand, flags=re.IGNORECASE)
            parts = [w for w in cand.split() if len(w) > 1 and w.isalpha()]
            if 1 <= len(parts) <= 4:
                return " ".join(parts).title()
    return None

def extract_parent_name(text: str) -> Optional[str]:
    """Extracts father, mother or guardian name."""
    patterns = [
        r'(?:son of|daughter of|wife of|s/o|d/o|w/o|c/o)\s+(?:shri|smt|mr\.?|late)?\s*([A-Za-z\s]{3,35}?)(?:,|\s+(?:and|resident|residing|of|at|district))',
        r'(?:father(?:\'s)?\s*name|parent(?:\'s)?\s*name|guardian(?:\'s)?\s*name)\s*[:\-]\s*([A-Za-z\s]{3,35})',
    ]
    for p in patterns:
        m = re.search(p, text, re.IGNORECASE)
        if m:
            cand = m.group(1).strip().rstrip(',')
            cand = re.sub(r'^(shri|smt|mr|late)\.?\s+', '', cand, flags=re.IGNORECASE)
            parts = [w for w in cand.split() if len(w) > 1 and w.isalpha()]
            if 1 <= len(parts) <= 4:
                return " ".join(parts).title()
    return None

def extract_date(text: str, context_keyword: str = "") -> Optional[str]:
    """Extracts dates in DD/MM/YYYY or YYYY-MM-DD format."""
    if context_keyword:
        pattern = rf'(?:{context_keyword})[^\d]*(\b\d{{1,2}}[/.-]\d{{1,2}}[/.-]\d{{2,4}}\b|\b\d{{4}}[/.-]\d{{1,2}}[/.-]\d{{1,2}}\b)'
        m = re.search(pattern, text, re.IGNORECASE)
        if m:
            return m.group(1)

    m = re.search(r'\b(\d{1,2}[/.-]\d{1,2}[/.-]\d{4})\b', text)
    if m:
        return m.group(1)
    return None

def extract_certificate_number(text: str) -> Optional[str]:
    """Extracts official government certificate identifier."""
    patterns = [
        r'(?:certificate\s*(?:no\.?|number)|cert\.?\s*no\.?|registration\s*no\.?|application\s*no\.?)\s*[:\-]?\s*([A-Za-z0-9\/\-\_]{5,35})',
        r'\b([A-Z]{2,4}\/[A-Z0-9\/\-\_]{5,30})\b',
    ]
    for p in patterns:
        m = re.search(p, text, re.IGNORECASE)
        if m:
            val = m.group(1).strip().rstrip('.,;')
            if len(val) >= 5:
                return val
    return None

def extract_authority(text: str) -> Optional[str]:
    """Extracts competent issuing authority."""
    auth_patterns = [
        r'(sub-divisional officer|sub divisional officer|sdo)',
        r'(sub-divisional magistrate|sdm)',
        r'(tehsildar|tahsildar)',
        r'(district magistrate|deputy commissioner|dm|dc)',
        r'(revenue officer|circle officer)',
        r'(registrar|controller of examinations)',
        r'(principal|headmaster|headmistress)',
    ]
    for p in auth_patterns:
        m = re.search(p, text, re.IGNORECASE)
        if m:
            return m.group(1).title()
    return None

def extract_income_fields(text: str) -> Dict[str, Any]:
    """Extracts structured fields from Income Certificate."""
    fields = {}
    name = extract_name_with_labels(text)
    if name:
        fields["applicantName"] = name

    parent = extract_parent_name(text)
    if parent:
        fields["fatherMotherGuardianName"] = parent

    cert_no = extract_certificate_number(text)
    if cert_no:
        fields["certificateNumber"] = cert_no

    issue_date = extract_date(text, context_keyword="date|issue|dated")
    if issue_date:
        fields["issueDate"] = issue_date

    auth = extract_authority(text)
    if auth:
        fields["issuingAuthority"] = auth

    # Financial year
    fy_m = re.search(r'\b(202[0-9]-(?:20)?[2-3][0-9])\b', text)
    if fy_m:
        fields["financialYear"] = fy_m.group(1)

    # Annual family income
    annual_income = None
    lakh_m = re.search(r'([0-9]+(?:\.[0-9]+)?)\s*(?:lakh|lakhs|lac|lacs)', text, re.IGNORECASE)
    if lakh_m:
        try:
            annual_income = float(lakh_m.group(1)) * 100000.0
        except ValueError:
            pass

    if annual_income is None:
        # Search for Currency prefix followed by digits: "Rs. 140000", "₹1,80,000", "INR 250000"
        curr_m = re.findall(r'(?:rs\.?|inr|₹)\s*([0-9]{1,2}(?:,[0-9]{2,3})+|[0-9]{4,8})', text, re.IGNORECASE)
        for num_str in curr_m:
            cleaned = num_str.replace(',', '').strip()
            try:
                val = float(cleaned)
                if 10000 <= val <= 10000000:
                    annual_income = val
                    break
            except ValueError:
                continue

    if annual_income is None:
        # Search for Income context prefix
        ctx_m = re.findall(r'(?:income\s*is|annual\s*income|family\s*income)[^\d\n]*?([0-9]{1,2}(?:,[0-9]{2,3})+|[0-9]{4,8})', text, re.IGNORECASE)
        for num_str in ctx_m:
            cleaned = num_str.replace(',', '').strip()
            try:
                val = float(cleaned)
                if 10000 <= val <= 10000000:
                    annual_income = val
                    break
            except ValueError:
                continue

    if annual_income is not None:
        fields["annualIncome"] = annual_income

    return fields

def extract_st_fields(text: str) -> Dict[str, Any]:
    """Extracts structured fields from Scheduled Tribe Caste Certificate."""
    fields = {}
    name = extract_name_with_labels(text)
    if name:
        fields["applicantName"] = name

    parent = extract_parent_name(text)
    if parent:
        fields["fatherMotherGuardianName"] = parent

    cert_no = extract_certificate_number(text)
    if cert_no:
        fields["certificateNumber"] = cert_no

    issue_date = extract_date(text, context_keyword="date|issue|dated")
    if issue_date:
        fields["issueDate"] = issue_date

    auth = extract_authority(text)
    if auth:
        fields["issuingAuthority"] = auth

    # Tribe detection
    text_lower = text.lower()
    for tribe in COMMON_ST_TRIBES:
        if re.search(rf'\b{tribe}\b', text_lower):
            fields["tribeName"] = tribe.capitalize()
            break

    # State detection
    states = ["Jharkhand", "Odisha", "Madhya Pradesh", "Chhattisgarh", "Rajasthan", "Gujarat", "Maharashtra", "Assam", "Meghalaya", "Nagaland", "Manipur", "Mizoram", "Tripura", "Arunachal Pradesh", "West Bengal", "Telangana", "Andhra Pradesh"]
    for st in states:
        if st.lower() in text_lower:
            fields["state"] = st
            break

    return fields

def extract_domicile_fields(text: str) -> Dict[str, Any]:
    """Extracts structured fields from Domicile / Residential Certificate."""
    fields = {}
    name = extract_name_with_labels(text)
    if name:
        fields["applicantName"] = name

    cert_no = extract_certificate_number(text)
    if cert_no:
        fields["certificateNumber"] = cert_no

    issue_date = extract_date(text, context_keyword="date|issue|dated")
    if issue_date:
        fields["issueDate"] = issue_date

    states = ["Jharkhand", "Odisha", "Madhya Pradesh", "Chhattisgarh", "Rajasthan", "Gujarat", "Maharashtra", "Assam", "West Bengal", "Bihar"]
    text_lower = text.lower()
    for st in states:
        if st.lower() in text_lower:
            fields["state"] = st
            break

    dist_m = re.search(r'(?:district|dist\.?)\s*[:\-]?\s*([A-Za-z\s]{3,20})(?:\s+state|,|\n)', text, re.IGNORECASE)
    if dist_m:
        fields["district"] = dist_m.group(1).strip().title()

    return fields

def extract_marksheet_fields(text: str) -> Dict[str, Any]:
    """Extracts academic marks, percentages, and CGPA."""
    fields = {}
    name = extract_name_with_labels(text)
    if name:
        fields["applicantName"] = name

    text_lower = text.lower()

    # CGPA
    cgpa_m = re.search(r'(?:cgpa|gpa|cumulative\s*grade)\s*[:\-]?\s*([0-9](?:\.[0-9]{1,2})?)(?:\s*\/\s*10)?', text_lower)
    if cgpa_m:
        try:
            val = float(cgpa_m.group(1))
            if 0.0 <= val <= 10.0:
                fields["cgpa"] = val
                fields["percentage"] = round(val * 9.5, 2)
        except ValueError:
            pass

    # Percentage
    if "percentage" not in fields:
        pct_m = re.search(r'(?:percentage|aggregate|total\s*marks|percentage\s*obtained|percent)\s*[:\-]?\s*([0-9]{2}(?:\.[0-9]{1,2})?)\s*%', text_lower)
        if not pct_m:
            pct_m = re.search(r'\b([4-9][0-9](?:\.[0-9]{1,2})?)\s*%', text)
        if pct_m:
            try:
                val = float(pct_m.group(1))
                if 30.0 <= val <= 100.0:
                    fields["percentage"] = val
            except ValueError:
                pass

    m_obt = re.search(r'(?:marks obtained|obtained marks|total obtained)\s*[:\-]?\s*(\d{2,4})', text_lower)
    if m_obt:
        fields["obtainedMarks"] = int(m_obt.group(1))

    m_tot = re.search(r'(?:maximum marks|max marks|total marks)\s*[:\-]?\s*(\d{2,4})', text_lower)
    if m_tot:
        fields["totalMarks"] = int(m_tot.group(1))

    yr_m = re.search(r'\b(201[5-9]|202[0-6])\b', text)
    if yr_m:
        fields["passingYear"] = yr_m.group(1)

    return fields

def extract_bank_fields(text: str) -> Dict[str, Any]:
    """Extracts Bank account number, IFSC, and Bank name."""
    fields = {}
    text_lower = text.lower()

    # IFSC
    ifsc_m = re.search(r'\b([A-Z]{4}0[A-Z0-9]{6})\b', text)
    if ifsc_m:
        fields["ifsc"] = ifsc_m.group(1).upper()

    # Account Number
    acc_m = re.search(r'(?:a\/c\s*no\.?|account\s*(?:no\.?|number))\s*[:\-]?\s*(\d{9,18})', text, re.IGNORECASE)
    if not acc_m:
        acc_m = re.search(r'\b(\d{11,18})\b', text)
    if acc_m:
        fields["accountNumber"] = acc_m.group(1).strip()

    banks = [
        "State Bank of India", "Punjab National Bank", "Bank of India",
        "Bank of Baroda", "Canara Bank", "Union Bank of India",
        "HDFC Bank", "ICICI Bank", "Axis Bank", "Central Bank of India"
    ]
    for b in banks:
        if b.lower() in text_lower:
            fields["bankName"] = b
            break

    br_m = re.search(r'(?:branch)\s*[:\-]?\s*([A-Za-z\s]{3,25})(?:\n|,|\s{2,})', text, re.IGNORECASE)
    if br_m:
        fields["branch"] = br_m.group(1).strip().title()

    holder_m = re.search(r'(?:account\s*holder|holder\s*name)\s*[:\-]?\s*([A-Za-z\s]{3,30})', text, re.IGNORECASE)
    if holder_m:
        fields["accountHolderName"] = holder_m.group(1).strip().title()

    return fields

def extract_aadhaar_fields(text: str) -> Dict[str, Any]:
    """Extracts Name, UID, DOB, and Gender from Aadhaar."""
    fields = {}
    uid_m = re.search(r'\b(\d{4}\s\d{4}\s\d{4})\b', text)
    if uid_m:
        fields["aadhaarNumber"] = uid_m.group(1)

    dob_m = re.search(r'(?:dob|date\s*of\s*birth|birth\s*date)\s*[:\-]?\s*(\d{1,2}[/.-]\d{1,2}[/.-]\d{4})', text, re.IGNORECASE)
    if dob_m:
        fields["dob"] = dob_m.group(1)

    if re.search(r'\bfemale\b', text, re.IGNORECASE):
        fields["gender"] = "Female"
    elif re.search(r'\bmale\b', text, re.IGNORECASE):
        fields["gender"] = "Male"

    name = extract_name_with_labels(text)
    if name:
        fields["applicantName"] = name

    return fields

def extract_admission_fields(text: str) -> Dict[str, Any]:
    """Extracts admission and course details."""
    fields = {}
    name = extract_name_with_labels(text)
    if name:
        fields["applicantName"] = name

    course_m = re.search(r'(ph\.?d\.?|doctor of philosophy|m\.?phil\.?|m\.?tech\.?|m\.?sc\.?|b\.?tech\.?|b\.?sc\.?|integrated\s*ph\.?d)', text, re.IGNORECASE)
    if course_m:
        fields["course"] = course_m.group(1).upper()

    date_m = extract_date(text, context_keyword="admission|offer|date")
    if date_m:
        fields["admissionDate"] = date_m

    return fields

def extract_fields_for_document(doc_type: str, ocr_text: str, lines: List[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Routes document to its specialized extraction schema."""
    t = (doc_type or "").upper()
    if t in ("INCOME_CERTIFICATE", "INCOME"):
        return extract_income_fields(ocr_text)
    elif t in ("ST_CERTIFICATE", "PVTG_CERTIFICATE", "CASTE", "CASTE_CERTIFICATE"):
        return extract_st_fields(ocr_text)
    elif t in ("DOMICILE_CERTIFICATE", "DOMICILE"):
        return extract_domicile_fields(ocr_text)
    elif t in ("MARKSHEET", "DEGREE_CERTIFICATE", "LATEST_MARKSHEET"):
        return extract_marksheet_fields(ocr_text)
    elif t in ("BANK_PASSBOOK", "PASSBOOK"):
        return extract_bank_fields(ocr_text)
    elif t in ("AADHAAR", "AADHAAR_CARD"):
        return extract_aadhaar_fields(ocr_text)
    elif t in ("ADMISSION_OFFER", "BONAFIDE_CERTIFICATE", "ADMISSION_LETTER"):
        return extract_admission_fields(ocr_text)
    else:
        res = {}
        name = extract_name_with_labels(ocr_text)
        if name:
            res["applicantName"] = name
        cert_no = extract_certificate_number(ocr_text)
        if cert_no:
            res["certificateNumber"] = cert_no
        return res

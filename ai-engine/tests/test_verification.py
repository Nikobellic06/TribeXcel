import os
import sys
from pathlib import Path

# Add project root to sys.path so app modules can be imported
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.models.request import VerificationRequest, DocumentInput
from app.rules.eligibility import run_eligibility_verification
from app.rules.merit import calculate_merit_scores

def load_sample_file(filename: str) -> str:
    path = Path(__file__).parent.parent / "sample_data" / filename
    return path.read_text(encoding="utf-8")

def test_eligible_application():
    print("\n--- TEST 1: Fully Eligible Application (Birsa Munda - NFST) ---")
    caste_text = load_sample_file("sample_caste_cert.txt")
    income_text = load_sample_file("sample_income_cert.txt")
    marks_text = load_sample_file("sample_marksheet.txt")
    adm_text = load_sample_file("sample_admission.txt")

    req = VerificationRequest(
        name="Birsa Munda",
        email="birsa.munda@example.com",
        phone="9876543210",
        dob="2000-11-15",
        gender="Male",
        category="Scheduled Tribe",
        state="Jharkhand",
        district="Ranchi",
        scheme="NFST",
        course="Ph.D. in Development Studies",
        institution="IIT Bombay",
        documents=[
            DocumentInput(name="Caste Certificate", raw_text=caste_text, source="manual"),
            DocumentInput(name="Income Certificate", raw_text=income_text, source="manual"),
            DocumentInput(name="Latest Marksheet", raw_text=marks_text, source="manual"),
            DocumentInput(name="Admission Letter", raw_text=adm_text, source="manual"),
        ]
    )

    ai_verification, status, extractions, rec, aux = run_eligibility_verification(req)
    merit = calculate_merit_scores(
        academic_pct=aux["academic_pct"],
        annual_income=aux["annual_income"],
        income_limit=aux["income_limit"],
        state=req.state
    )

    print(f"Status: {status}")
    print(f"Eligibility Score: {ai_verification.score}/100")
    print(f"Checks:")
    for chk in ai_verification.checks:
        print(f"  [{'PASS' if chk.passed else 'FAIL'}] {chk.label}: {chk.details}")
    print(f"Merit Scores: Academic={merit.academic}, Exam={merit.exam}, SocioEconomic={merit.socioEconomic}, Interview={merit.interview}")

    assert status == "Eligible", f"Expected 'Eligible', got {status}"
    assert all(chk.passed for chk in ai_verification.checks), "All checks should pass"
    assert ai_verification.score >= 85, f"Expected score >= 85, got {ai_verification.score}"
    assert merit.socioEconomic >= 80, f"Expected high socio-economic hardship score, got {merit.socioEconomic}"
    print(">>> TEST 1 PASSED!")

def test_missing_document_deficient():
    print("\n--- TEST 2: Missing Caste Certificate (Deficient) ---")
    income_text = load_sample_file("sample_income_cert.txt")
    marks_text = load_sample_file("sample_marksheet.txt")

    req = VerificationRequest(
        name="Birsa Munda",
        email="birsa.munda@example.com",
        scheme="NFST",
        category="Scheduled Tribe",
        documents=[
            DocumentInput(name="Income Certificate", raw_text=income_text),
            DocumentInput(name="Latest Marksheet", raw_text=marks_text),
        ]
    )

    ai_verification, status, extractions, rec, aux = run_eligibility_verification(req)
    print(f"Status: {status}")
    print(f"Eligibility Score: {ai_verification.score}/100")
    print(f"Recommendation: {rec}")

    assert status == "Deficient", f"Expected 'Deficient', got {status}"
    docs_chk = next(c for c in ai_verification.checks if c.label == "All required documents present")
    assert not docs_chk.passed, "Docs present check should fail"
    print(">>> TEST 2 PASSED!")

def test_name_mismatch_flagged():
    print("\n--- TEST 3: Name Mismatch (Fraud Flagging) ---")
    caste_text = load_sample_file("sample_caste_cert.txt")  # Has name "Birsa Munda"
    income_text = load_sample_file("sample_income_cert.txt")
    marks_text = load_sample_file("sample_marksheet.txt")
    adm_text = load_sample_file("sample_admission.txt")

    # Form has completely different name
    req = VerificationRequest(
        name="Vikram Kumar Sharma",
        email="vikram@example.com",
        scheme="NFST",
        category="Scheduled Tribe",
        documents=[
            DocumentInput(name="Caste Certificate", raw_text=caste_text),
            DocumentInput(name="Income Certificate", raw_text=income_text),
            DocumentInput(name="Latest Marksheet", raw_text=marks_text),
            DocumentInput(name="Admission Letter", raw_text=adm_text),
        ]
    )

    ai_verification, status, extractions, rec, aux = run_eligibility_verification(req)
    print(f"Status: {status}")
    print(f"Flag Reason: {rec}")

    assert status == "Flagged", f"Expected 'Flagged', got {status}"
    assert "mismatch" in rec.lower()
    print(">>> TEST 3 PASSED!")

def test_income_limit_exceeded():
    print("\n--- TEST 4: Income Exceeds Scheme Ceiling ---")
    caste_text = load_sample_file("sample_caste_cert.txt")
    # Custom income cert with 9.5 Lakhs
    high_income_text = "INCOME CERTIFICATE: Annual income of Shri Birsa Munda is Rs. 9,50,000 for FY 2024-25."
    marks_text = load_sample_file("sample_marksheet.txt")
    adm_text = load_sample_file("sample_admission.txt")

    req = VerificationRequest(
        name="Birsa Munda",
        email="birsa.munda@example.com",
        scheme="NFST",  # Limit is 6,00,000
        category="Scheduled Tribe",
        documents=[
            DocumentInput(name="Caste Certificate", raw_text=caste_text),
            DocumentInput(name="Income Certificate", raw_text=high_income_text),
            DocumentInput(name="Latest Marksheet", raw_text=marks_text),
            DocumentInput(name="Admission Letter", raw_text=adm_text),
        ]
    )

    ai_verification, status, extractions, rec, aux = run_eligibility_verification(req)
    print(f"Status: {status}")
    income_chk = next(c for c in ai_verification.checks if c.label == "Income within scheme limit")
    print(f"Income Check: Passed={income_chk.passed}, Details={income_chk.details}")

    assert not income_chk.passed, "Income check should fail when > 6,00,000"
    print(">>> TEST 4 PASSED!")

if __name__ == "__main__":
    test_eligible_application()
    test_missing_document_deficient()
    test_name_mismatch_flagged()
    test_income_limit_exceeded()
    print("\nALL VERIFICATION & MERIT TESTS PASSED SUCCESSFULLY!")

from typing import Optional
from app.models.response import MeritScores

def calculate_socio_economic_score(
    annual_income: Optional[float],
    income_limit: float,
    state: str = "",
    district: str = ""
) -> int:
    """
    Computes a transparent, equitable socio-economic hardship score (0-100).
    Lower family income yields a higher socio-economic support score.
    """
    if annual_income is None:
        # Default midpoint if income certificate pending
        return 65

    # If income exceeds limit, hardship score drops
    if annual_income > income_limit:
        return 20

    # Progressive bracket calculation
    ratio = max(0.0, annual_income / income_limit)
    # When ratio is near 0 (very low income <= 1 Lakh), score is 95-100
    base_score = 98 - (ratio * 45)  # Ranges from ~53 to 98

    # Priority state boost (e.g. Fifth Schedule / North-Eastern / Tribal heartlands)
    tribal_focus_states = {
        "jharkhand", "odisha", "chhattisgarh", "madhya pradesh",
        "assam", "meghalaya", "tripura", "mizoram", "nagaland",
        "arunachal pradesh", "manipur"
    }
    if state and state.lower().strip() in tribal_focus_states:
        base_score += 4.0

    return int(min(100, max(0, round(base_score))))

def calculate_merit_scores(
    academic_pct: Optional[float],
    annual_income: Optional[float],
    income_limit: float,
    declared_exam_score: Optional[float] = None,
    state: str = "",
    district: str = ""
) -> MeritScores:
    """
    Calculates four normalized 0-100 merit criteria:
    - academic: Normalized marksheet percentage
    - exam: Entrance / qualifying test score
    - socioEconomic: Hardship & affirmative representation score
    - interview: Baseline evaluation score (or set by admin committee)
    """
    # 1. Academic score
    if academic_pct is not None:
        academic_score = min(100, max(0, round(academic_pct)))
    else:
        academic_score = 60

    # 2. Exam score
    if declared_exam_score is not None:
        exam_score = min(100, max(0, round(declared_exam_score)))
    else:
        # If no separate entrance exam is recorded, baseline mirrors academic score with slight variance
        exam_score = max(50, min(95, round(academic_score * 0.95)))

    # 3. Socio-economic score
    socio_economic = calculate_socio_economic_score(
        annual_income=annual_income,
        income_limit=income_limit,
        state=state,
        district=district
    )

    # 4. Interview score (standard baseline for pending interviews)
    interview_score = 70

    return MeritScores(
        academic=academic_score,
        exam=exam_score,
        socioEconomic=socio_economic,
        interview=interview_score
    )

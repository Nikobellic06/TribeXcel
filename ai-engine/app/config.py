import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    DEBUG: bool = True
    GOOGLE_APPLICATION_CREDENTIALS: str = ""
    GOOGLE_VISION_API_KEY: str = ""
    TESSERACT_CMD: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

# Scheme rules and criteria
SCHEME_RULES = {
    "NFST": {
        "name": "National Fellowship for Higher Education of ST Students",
        "income_limit": 600000.0,  # 6.0 Lakhs per annum
        "min_academic_pct": 55.0,  # 55% minimum
        "required_documents": [
            "Caste Certificate",
            "Income Certificate",
            "Latest Marksheet",
            "Admission Letter"
        ],
        "allowed_categories": ["Scheduled Tribe", "ST"],
    },
    "NOS": {
        "name": "National Overseas Scholarship for ST Students",
        "income_limit": 800000.0,  # 8.0 Lakhs per annum
        "min_academic_pct": 60.0,  # 60% minimum
        "required_documents": [
            "Caste Certificate",
            "Income Certificate",
            "Latest Marksheet",
            "Admission Letter"
        ],
        "allowed_categories": ["Scheduled Tribe", "ST"],
    }
}

# Recognized ST communities for extra cross-referencing
COMMON_ST_TRIBES = {
    "santhal", "santali", "gond", "bhil", "munda", "oraon", "kurukh",
    "bodo", "khasi", "garo", "mizo", "naga", "meena", "chenchu",
    "kol", "baiga", "korku", "ho", "kharia", "bhuyan", "kondh",
    "koya", "tripuri", "bhotia", "lepcha", "angami", "ao", "toppo",
    "tirkey", "minz", "kerketta", "soren", "hembrom", "marandi"
}

# Weights for computing the 0-100 Eligibility Score
CHECK_WEIGHTS = {
    "All required documents present": 30.0,
    "Income within scheme limit": 25.0,
    "Category matches ST records": 25.0,
    "Marks meet minimum cutoff": 20.0,
}

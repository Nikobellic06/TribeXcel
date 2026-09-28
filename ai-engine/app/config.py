import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    DEBUG: bool = True

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

# Scheme rules and criteria based on official MoTA guidelines
SCHEME_RULES = {
    "PRE_MATRIC": {
        "name": "Pre-Matric Scholarship for ST Students (Class IX & X)",
        "income_limit": 250000.0,  # 2.50 Lakhs per annum
        "min_academic_pct": 0.0,   # Regular student in Class IX or X in a recognised institution
        "required_documents": [
            "Caste Certificate",
            "Income Certificate",
            "Domicile Certificate",
            "Latest Marksheet",
            "Bank Passbook"
        ],
        "allowed_categories": ["Scheduled Tribe", "ST"],
        "allowed_classes": ["9", "10", "IX", "X"],
    },
    "NFST": {
        "name": "National Fellowship for Higher Education of ST Students",
        "income_limit": 600000.0,  # 6.0 Lakhs per annum
        "min_academic_pct": 55.0,  # 55% minimum in postgraduate degree
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
        "min_academic_pct": 60.0,  # 60% minimum in qualifying degree
        "required_documents": [
            "Caste Certificate",
            "Income Certificate",
            "Latest Marksheet",
            "Admission Letter"
        ],
        "allowed_categories": ["Scheduled Tribe", "ST"],
        "qs_rank_limit": 1000,
    }
}

# Recognized ST communities for extra cross-referencing
COMMON_ST_TRIBES = {
    "santhal", "santali", "gond", "bhil", "munda", "oraon", "kurukh",
    "bodo", "khasi", "garo", "mizo", "naga", "meena", "chenchu",
    "kol", "baiga", "korku", "ho", "kharia", "bhuyan", "kondh",
    "koya", "tripuri", "bhotia", "lepcha", "angami", "ao", "toppo",
    "tirkey", "minz", "kerketta", "soren", "hembrom", "marandi",
    "birhor", "asur", "korwa", "paharia", "sabar"
}

# Weights for computing the 0-100 Eligibility Score
CHECK_WEIGHTS = {
    "All required documents present": 30.0,
    "Income within scheme limit": 25.0,
    "Category matches ST records": 25.0,
    "Marks meet minimum cutoff": 20.0,
}

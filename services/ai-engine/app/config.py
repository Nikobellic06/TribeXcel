import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    DEBUG: bool = False

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

# Authoritative Scheme rules aligned with official Ministry of Tribal Affairs (MoTA) guidelines (2026.1)
SCHEME_RULES = {
    "NFST": {
        "name": "National Fellowship for ST Students (M.Phil / Ph.D)",
        "income_limit": None,  # NFST has NO family income limit under official guidelines
        "min_academic_pct": 55.0,  # 55% minimum in Master's degree (M.Phil marks not considered)
        "max_age": 36,
        "required_documents": [
            "10th Board Certificate",
            "Caste Certificate",
            "Latest Marksheet",
            "Admission Letter"
        ],
        "allowed_categories": ["Scheduled Tribe", "ST"],
    },
    "NOS": {
        "name": "National Overseas Scholarship for ST Students",
        "income_limit": 600000.0,  # 6.00 Lakhs per annum
        "min_academic_pct": 55.0,  # 55% minimum in qualifying degree
        "max_age_masters": 32,
        "max_age_phd": 35,
        "max_age_postdoc": 38,
        "required_documents": [
            "10th Board Certificate",
            "Caste Certificate",
            "Income Certificate",
            "Latest Marksheet",
            "Admission Letter"
        ],
        "allowed_categories": ["Scheduled Tribe", "ST"],
        "qs_rank_limit": 1000,
    },
    "PRE_MATRIC": {
        "name": "Pre-Matric Scholarship for ST Students (Class IX & X)",
        "income_limit": 250000.0,  # 2.50 Lakhs per annum
        "min_academic_pct": 0.0,
        "required_documents": [
            "Caste Certificate",
            "Income Certificate",
            "Domicile Certificate"
        ],
        "allowed_categories": ["Scheduled Tribe", "ST"],
        "allowed_classes": ["9", "10", "IX", "X"],
    },
    "POST_MATRIC": {
        "name": "Post-Matric Scholarship for ST Students",
        "income_limit": 250000.0,  # 2.50 Lakhs per annum
        "min_academic_pct": 0.0,
        "required_documents": [
            "Caste Certificate",
            "Income Certificate",
            "10th Board Certificate",
            "Domicile Certificate"
        ],
        "allowed_categories": ["Scheduled Tribe", "ST"],
    },
    "TOP_CLASS": {
        "name": "Top Class Education Scheme for ST Students",
        "income_limit": 600000.0,  # 6.00 Lakhs per annum
        "min_academic_pct": 0.0,
        "required_documents": [
            "Caste Certificate",
            "Income Certificate",
            "Bonafide Certificate"
        ],
        "allowed_categories": ["Scheduled Tribe", "ST"],
    },
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

# Weights for computing the 0-100 Assistive Scrutiny Score
CHECK_WEIGHTS = {
    "All required documents present": 35.0,
    "Category matches ST records": 35.0,
    "Marks meet minimum cutoff": 30.0,
}

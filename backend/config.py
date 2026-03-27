# ============================================
# Sifter Skill_Up — Backend Configuration
# ============================================
import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    APP_NAME: str = "Sifter Skill_Up API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"

    # Supabase
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
    SUPABASE_SERVICE_KEY: str = os.getenv("SUPABASE_SERVICE_KEY", "")
    SUPABASE_SCHEMA: str = "skillup_dev"

    # JWT
    JWT_SECRET: str = os.getenv("JWT_SECRET", "change-me-in-production")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_HOURS: int = 24 * 7

    # Telegram
    TELEGRAM_BOT_TOKEN: str = os.getenv("TELEGRAM_BOT_TOKEN", "")

    # Base / Blockchain
    BASE_RPC_URL: str = os.getenv("BASE_RPC_URL", "https://mainnet.base.org")
    BASE_CHAIN_ID: int = 8453

    # Redis
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    CELERY_BROKER_URL: str = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
    CELERY_RESULT_BACKEND: str = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/0")

    # CORS
    ALLOWED_ORIGINS: list = [
        os.getenv("WEB_DASHBOARD_URL", "http://localhost:3000"),
        "https://t.me",
        "https://web.telegram.org",
        "http://localhost:5173",
        "http://localhost:8081",
        "http://localhost:19006",
        "http://localhost:8082",
    ]

    # Points System
    WELCOME_BONUS: int = 1000
    LEVEL_COMPLETE_XP: int = 100
    PERFECT_LEVEL_BONUS: int = 250
    STREAK_BONUS: list = [100, 200, 300, 500, 750, 1000, 1500]

    # Withdrawal limits
    MIN_WITHDRAWAL: int = 5000
    MAX_WITHDRAWAL_MONTHLY: int = 50000
    MAX_WITHDRAWAL_VERIFIED: int = 200000

    # Anthropic (AI scoring proxy — key lives only on server)
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")

    # Track prerequisites
    # Quant Developer: must complete Python chapters 1-5 before starting
    # Quant Trader / Researcher: start from math (Lab 0), no Python gate
    QUANT_DEV_PYTHON_GATE_CHAPTERS: int = 5

settings = Settings()

# ============================================
# Sifter Skill_Up — Backend Configuration
# Extended: device sessions, Starknet, Airtable,
#           offline sync, feed, social rewards
# ============================================
import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    APP_NAME: str = "Sifter Skill_Up API"
    APP_VERSION: str = "2.0.0"
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"

    # ── Supabase ─────────────────────────────────────────────
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
    SUPABASE_SERVICE_KEY: str = os.getenv("SUPABASE_SERVICE_KEY", "")
    SUPABASE_SCHEMA: str = "skillup_dev"

    # ── JWT ──────────────────────────────────────────────────
    JWT_SECRET: str = os.getenv("JWT_SECRET", "")
    JWT_ALGORITHM: str = "HS256"
    # 7 days for access tokens. Refresh tokens (30 days) issued separately.
    JWT_EXPIRE_HOURS: int = int(os.getenv("JWT_EXPIRE_HOURS", str(24 * 7)))
    JWT_REFRESH_EXPIRE_HOURS: int = int(os.getenv("JWT_REFRESH_EXPIRE_HOURS", str(24 * 30)))

    # ── Telegram ─────────────────────────────────────────────
    TELEGRAM_BOT_TOKEN: str = os.getenv("TELEGRAM_BOT_TOKEN", "")

    # ── Blockchain ───────────────────────────────────────────
    BASE_RPC_URL: str = os.getenv("BASE_RPC_URL", "https://mainnet.base.org")
    BASE_CHAIN_ID: int = 8453

    # Starknet — RPC endpoint pool (round-robined for load).
    # Alchemy demo URL removed from default; supply your own keys via env.
    STARKNET_SEPOLIA_RPCS: list = [
        rpc.strip()
        for rpc in os.getenv(
            "STARKNET_SEPOLIA_RPCS",
            "https://starknet-sepolia.public.blastapi.io,"
            "https://free-rpc.nethermind.io/sepolia-juno"
        ).split(",")
        if rpc.strip()
    ]
    STARKNET_MAINNET_RPCS: list = [
        rpc.strip()
        for rpc in os.getenv(
            "STARKNET_MAINNET_RPCS",
            "https://starknet-mainnet.public.blastapi.io,"
            "https://free-rpc.nethermind.io/mainnet-juno"
        ).split(",")
        if rpc.strip()
    ]

    # ── Redis ─────────────────────────────────────────────────
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    CELERY_BROKER_URL: str = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
    CELERY_RESULT_BACKEND: str = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/0")

    # ── CORS ──────────────────────────────────────────────────
    # Localhost origins are stripped in non-DEBUG via _filter_allowed_origins().
    _DEV_ORIGINS = [
        "http://localhost:5173", "http://localhost:8081",
        "http://localhost:19006", "http://localhost:8082",
        "http://localhost:3000",
    ]
    ALLOWED_ORIGINS: list = [
        os.getenv("WEB_DASHBOARD_URL", "http://localhost:3000"),
        "https://t.me", "https://web.telegram.org",
        *_DEV_ORIGINS,
    ]

    # ── Portfolio OAuth credentials ───────────────────────────
    GITHUB_CLIENT_ID: str     = os.getenv("GITHUB_CLIENT_ID", "")
    GITHUB_CLIENT_SECRET: str = os.getenv("GITHUB_CLIENT_SECRET", "")
    GITHUB_REDIRECT_URI: str  = os.getenv("GITHUB_REDIRECT_URI", "http://localhost:8000/api/github/callback")

    LINKEDIN_CLIENT_ID: str     = os.getenv("LINKEDIN_CLIENT_ID", "")
    LINKEDIN_CLIENT_SECRET: str = os.getenv("LINKEDIN_CLIENT_SECRET", "")

    TWITTER_CLIENT_ID: str     = os.getenv("TWITTER_CLIENT_ID", "")
    TWITTER_CLIENT_SECRET: str = os.getenv("TWITTER_CLIENT_SECRET", "")

    INSTAGRAM_CLIENT_ID: str     = os.getenv("INSTAGRAM_CLIENT_ID", "")
    INSTAGRAM_CLIENT_SECRET: str = os.getenv("INSTAGRAM_CLIENT_SECRET", "")
    FACEBOOK_APP_ID: str         = os.getenv("FACEBOOK_APP_ID", "")
    FACEBOOK_APP_SECRET: str     = os.getenv("FACEBOOK_APP_SECRET", "")

    MEDIUM_CLIENT_ID: str     = os.getenv("MEDIUM_CLIENT_ID", "")
    MEDIUM_CLIENT_SECRET: str = os.getenv("MEDIUM_CLIENT_SECRET", "")

    REDDIT_CLIENT_ID: str     = os.getenv("REDDIT_CLIENT_ID", "")
    REDDIT_CLIENT_SECRET: str = os.getenv("REDDIT_CLIENT_SECRET", "")

    BEHANCE_CLIENT_ID: str     = os.getenv("BEHANCE_CLIENT_ID", "")
    BEHANCE_CLIENT_SECRET: str = os.getenv("BEHANCE_CLIENT_SECRET", "")

    DRIBBBLE_CLIENT_ID: str     = os.getenv("DRIBBBLE_CLIENT_ID", "")
    DRIBBBLE_CLIENT_SECRET: str = os.getenv("DRIBBBLE_CLIENT_SECRET", "")

    GOOGLE_CLIENT_ID: str     = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "")

    VIMEO_CLIENT_ID: str     = os.getenv("VIMEO_CLIENT_ID", "")
    VIMEO_CLIENT_SECRET: str = os.getenv("VIMEO_CLIENT_SECRET", "")

    API_BASE_URL: str = os.getenv("API_BASE_URL", "https://api.sifter.app")

    # ── Encryption (for OAuth token storage) ─────────────────
    ENCRYPTION_KEY: str = os.getenv("ENCRYPTION_KEY", "")

    # ── AI ────────────────────────────────────────────────────
    # NEVER expose in client. All AI calls go through this server.
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")

    # ── Airtable CMS ─────────────────────────────────────────
    # Content editors manage lesson metadata, track descriptions,
    # lab configs here. Synced to Supabase on schedule.
    AIRTABLE_API_KEY: str    = os.getenv("AIRTABLE_API_KEY", "")
    AIRTABLE_BASE_ID: str    = os.getenv("AIRTABLE_BASE_ID", "")
    # Comma-separated table names to sync
    AIRTABLE_TABLES: list    = [
        t.strip()
        for t in os.getenv("AIRTABLE_TABLES", "Tracks,Labs,LessonMetadata,FieldDescriptions").split(",")
        if t.strip()
    ]
    AIRTABLE_SYNC_INTERVAL_MINUTES: int = int(os.getenv("AIRTABLE_SYNC_INTERVAL_MINUTES", "30"))

    # ── Push Notifications (FCM HTTP v1) ──────────────────────
    # FCM_SERVER_KEY (legacy) kept for backwards-compat only;
    # legacy API was retired by Google in June 2024.
    FCM_SERVER_KEY: str = os.getenv("FCM_SERVER_KEY", "")
    # Path to a Firebase service-account JSON, used for OAuth on FCM HTTP v1.
    FCM_SERVICE_ACCOUNT_PATH: str = os.getenv("FCM_SERVICE_ACCOUNT_PATH", "")
    FCM_PROJECT_ID: str = os.getenv("FCM_PROJECT_ID", "")

    # ── Privy (Starknet auth verification) ────────────────────
    PRIVY_APP_ID: str  = os.getenv("PRIVY_APP_ID", "")
    PRIVY_APP_SECRET: str = os.getenv("PRIVY_APP_SECRET", "")

    # ── Device / Session enforcement ─────────────────────────
    # How many minutes of inactivity before a device session expires
    DEVICE_SESSION_TTL_MINUTES: int = int(os.getenv("DEVICE_SESSION_TTL_MINUTES", "43200"))  # 30 days
    # Whether to enforce single-device (set False for dev)
    SINGLE_DEVICE_ENFORCEMENT: bool = os.getenv("SINGLE_DEVICE_ENFORCEMENT", "true").lower() == "true"

    # ── Points System ────────────────────────────────────────
    WELCOME_BONUS: int         = 1000
    LEVEL_COMPLETE_XP: int     = 100
    PERFECT_LEVEL_BONUS: int   = 250
    STREAK_BONUS: list         = [100, 200, 300, 500, 750, 1000, 1500]

    # ── Withdrawal limits ─────────────────────────────────────
    MIN_WITHDRAWAL: int            = 5000
    MAX_WITHDRAWAL_MONTHLY: int    = 50000
    MAX_WITHDRAWAL_VERIFIED: int   = 200000

    # ── Track gates ───────────────────────────────────────────
    QUANT_DEV_PYTHON_GATE_CHAPTERS: int = 5

def _filter_allowed_origins(origins: list[str], debug: bool) -> list[str]:
    """In production, drop localhost-style origins."""
    if debug:
        return origins
    return [o for o in origins if "localhost" not in o and "127.0.0.1" not in o]


def _validate(s: "Settings") -> None:
    """Fail-fast on missing required config in non-DEBUG mode."""
    problems: list[str] = []
    if not s.SUPABASE_URL:
        problems.append("SUPABASE_URL is empty")
    if not s.SUPABASE_SERVICE_KEY:
        problems.append("SUPABASE_SERVICE_KEY is empty")
    if not s.JWT_SECRET:
        problems.append("JWT_SECRET is empty — set a strong random secret")
    if s.JWT_SECRET in {"change-me-in-production", "secret", "changeme"}:
        problems.append("JWT_SECRET is set to a default placeholder — refusing to start")
    if s.JWT_SECRET and len(s.JWT_SECRET) < 32 and not s.DEBUG:
        problems.append(f"JWT_SECRET is only {len(s.JWT_SECRET)} chars — must be ≥ 32 in production")
    if not s.DEBUG and s.SINGLE_DEVICE_ENFORCEMENT and not (s.FCM_SERVICE_ACCOUNT_PATH or s.FCM_SERVER_KEY):
        # Not fatal — just a warning
        import warnings
        warnings.warn("SINGLE_DEVICE_ENFORCEMENT is on but no FCM credentials configured; logout pushes will be silently dropped.")
    if problems and not s.DEBUG:
        raise RuntimeError("Configuration errors:\n  - " + "\n  - ".join(problems))


settings = Settings()
settings.ALLOWED_ORIGINS = _filter_allowed_origins(settings.ALLOWED_ORIGINS, settings.DEBUG)
_validate(settings)

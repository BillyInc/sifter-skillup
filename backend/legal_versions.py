"""Server-owned legal document versions and consent validation."""

CURRENT_TERMS_VERSION = "2026-10-29.1"
CURRENT_PRIVACY_VERSION = "2026-10-29.1"


def analytics_consent_is_current(user: dict) -> bool:
    settings = user.get("settings")
    acceptance = settings.get("legalAcceptance") if isinstance(settings, dict) else None
    return bool(
        isinstance(acceptance, dict)
        and acceptance.get("termsVersion") == CURRENT_TERMS_VERSION
        and acceptance.get("privacyVersion") == CURRENT_PRIVACY_VERSION
        and acceptance.get("analyticsConsent") is True
    )

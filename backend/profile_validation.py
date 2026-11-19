"""Validation for the optional user-chosen display name."""
import re
import unicodedata
from typing import Optional

from display_name_blocklist import BLOCKED_SUBSTRINGS, RESERVED_NAMES

DISPLAY_NAME_MIN = 2
DISPLAY_NAME_MAX = 30

# Letters (any script), digits, space, apostrophe, hyphen, period.
_CHAR_OK = re.compile(r"^[^\W_ ]$|^[ '’.\-]$", re.UNICODE)
_URL_HINT = re.compile(r"(https?:|www\.|\.[a-z]{2,}\b|://|@)", re.IGNORECASE)
_FOLD = str.maketrans({"0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", "$": "s"})


class DisplayNameError(ValueError):
    """Raised with a short, kind, user-facing message."""


def _squash(value: str) -> str:
    return re.sub(r"[^a-z0-9]", "", value.lower()).translate(_FOLD)


def validate_display_name(raw: object) -> Optional[str]:
    """Return the cleaned name, or None when empty/omitted. Raise DisplayNameError if invalid."""
    if raw is None:
        return None
    if not isinstance(raw, str):
        raise DisplayNameError("Name to show must be text.")
    value = re.sub(r"\s+", " ", unicodedata.normalize("NFKC", raw)).strip()
    if not value:
        return None
    if not (DISPLAY_NAME_MIN <= len(value) <= DISPLAY_NAME_MAX):
        raise DisplayNameError(f"Use {DISPLAY_NAME_MIN} to {DISPLAY_NAME_MAX} characters.")
    if _URL_HINT.search(value):
        raise DisplayNameError("Do not use an email address, link or contact details.")
    if sum(ch.isdigit() for ch in value) >= 5:
        raise DisplayNameError("Do not use a phone number or long run of digits.")
    if not all(_CHAR_OK.match(ch) for ch in value):
        raise DisplayNameError("Use only letters, numbers, spaces, apostrophes, hyphens and full stops.")
    if not any(ch.isalpha() for ch in value):
        raise DisplayNameError("Include at least one letter.")
    squashed = _squash(value)
    if squashed in RESERVED_NAMES or any(bad in squashed for bad in BLOCKED_SUBSTRINGS):
        raise DisplayNameError("Please choose a different name.")
    return value

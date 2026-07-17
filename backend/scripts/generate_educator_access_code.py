"""Generate an owner-issued educator/admin access code.

Usage:
    python3 backend/scripts/generate_educator_access_code.py

Add issued codes to EDUCATOR_ACCESS_CODES in the backend environment as a
comma-separated list. These codes gate admin-mode entry only; they are not
school codes, student claim codes, or proof of institutional ownership.
"""

import secrets
import string


ALPHABET = string.ascii_uppercase + string.digits
GROUPS = 4
GROUP_LEN = 4


def main() -> None:
    parts = [
        "".join(secrets.choice(ALPHABET) for _ in range(GROUP_LEN))
        for _ in range(GROUPS)
    ]
    print("EDU-" + "-".join(parts))


if __name__ == "__main__":
    main()

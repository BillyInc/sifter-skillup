"""Regression guard: peer-facing routes must not embed raw legal-name columns.

Routes that join the users table into rows shown to OTHER users have to go
through run_with_public_name_columns / publicize_user_row (public_name.py).
This scans the live routes for an embedded users select that names
username / full_name / email / phone directly.
"""
import re
from pathlib import Path

ROUTES = Path(__file__).resolve().parents[1] / "routes"
# Staff/own-institution views and own-account code are reviewed exceptions.
ALLOWED = {
    "institutions_routes.py",
    "provisioning_routes.py",
    "student_pipeline_routes.py",
    "starknet_routes.py",
    "portfolio_routes.py",
}
EMBED = re.compile(r"users(?:!\w+)?\(([^)]*)\)")
RAW = re.compile(r"\b(username|full_name|email|phone|first_name|last_name)\b")


def test_peer_facing_routes_never_embed_raw_identity_columns():
    offenders = []
    for path in sorted(ROUTES.glob("*.py")):
        if path.name in ALLOWED:
            continue
        for lineno, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
            for match in EMBED.finditer(line):
                if RAW.search(match.group(1)):
                    offenders.append(f"{path.name}:{lineno}: {line.strip()}")
    assert not offenders, "raw identity columns embedded in a peer-facing select:\n" + "\n".join(offenders)

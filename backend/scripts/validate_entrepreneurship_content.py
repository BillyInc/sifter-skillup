from __future__ import annotations

import json
import sys
from pathlib import Path

REQUIRED_DOMAIN_COUNT = 168
SUPPORTED_EVIDENCE = {"verified", "inferred", "not_yet_evidenced"}


def fail(message: str) -> None:
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


def load_json(path: Path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:  # noqa: BLE001
        fail(f"Could not read {path}: {exc}")


def validate(path: Path) -> None:
    payload = load_json(path)
    domains = payload.get("domains") or []
    roles = payload.get("roles") or []

    approved_domains = [d for d in domains if d.get("approvedCore") is True]
    if len(approved_domains) not in (0, REQUIRED_DOMAIN_COUNT):
        fail(
            f"approvedCore coverage must be 0 or {REQUIRED_DOMAIN_COUNT}; got {len(approved_domains)}"
        )

    for item in [*domains, *roles]:
        status = item.get("evidenceStatus") or "not_yet_evidenced"
        if status not in SUPPORTED_EVIDENCE:
            fail(f"{item.get('id') or item.get('title')} has invalid evidenceStatus {status}")
        if item.get("approved") is True and status == "not_yet_evidenced":
            fail(f"{item.get('id') or item.get('title')} is approved without evidence")
        if item.get("approved") is True and not item.get("sources"):
            fail(f"{item.get('id') or item.get('title')} is approved without sources")

    print("Entrepreneurship content validation passed.")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        fail("Usage: python backend/scripts/validate_entrepreneurship_content.py <content.json>")
    validate(Path(sys.argv[1]))

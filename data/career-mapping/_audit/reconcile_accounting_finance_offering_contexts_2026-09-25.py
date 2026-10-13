"""Preserve and quarantine distinct JAMB Accounting and Finance contexts.

Source comparison is documented in
jamb_accounting_finance_source_context_reconciliation_2026-09-25.md.
This script keeps byte-for-byte rollback copies before editing parsed sources.
"""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
JAMB = ROOT / "jamb"
AUDIT = ROOT / "_audit"
ADMIN = JAMB / "administration_offerings.json"
SOCIAL = JAMB / "social_management_offerings.json"
CANONICAL = AUDIT / "jamb_ccmas_inheritance_canonical_2026-08-17.json"
BACKUPS = AUDIT / "accounting_finance_context_before_2026-09-25"


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def save(path: Path, value) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


def backup_once(path: Path) -> None:
    BACKUPS.mkdir(exist_ok=True)
    dest = BACKUPS / path.name
    if not dest.exists():
        dest.write_bytes(path.read_bytes())


def reconcile_admin() -> bool:
    data = load(ADMIN)
    rows = [r for r in data["programmes"] if r.get("jamb_name", "").casefold() == "accounting and finance"]
    if len(rows) != 1:
        raise ValueError(f"expected one Administration Accounting and Finance row, found {len(rows)}")
    row = rows[0]
    if row.get("institutions") == ["BCU"] and not row.get("institution_waivers"):
        return False
    expected = ["UYO", "VISION-UNI", "WELLSPRING", "WESTERN-DEL"]
    if row.get("institutions") != expected:
        raise ValueError(f"unexpected Administration institutions: {row.get('institutions')!r}")
    backup_once(ADMIN)
    row["institutions"] = ["BCU"]
    row["institution_waivers"] = []
    row["note"] = (
        "Corrected from the Administration JAMB brochure table, printed p. 48: "
        "UYO, VISION-UNI, WELLSPRING and WESTERN-DEL continue the preceding "
        "ACCOUNTING offering; the next distinct ACCOUNTING AND FINANCE row names BCU. "
        "Requirements for BCU are blank in this source extraction."
    )
    save(ADMIN, data)
    return True


def reconcile_social() -> bool:
    data = load(SOCIAL)
    matches = [r for r in data["programmes"] if r.get("jamb_name", "").casefold() == "accounting and finance"]
    row = {
        "jamb_name": "Accounting and Finance",
        "institutions": ["FEDOTUOKE"],
        "utme_subjects": "Mathematics, Economics and any other Social Science subject.",
        "olevel_requirement": (
            "Five (5) SSC credit passes including English Language, Mathematics, "
            "Economics and two (2) other relevant subjects."
        ),
        "direct_entry": "Two (2) 'A' Level passes including Economics.",
        "institution_waivers": [],
        "note": (
            "Distinct Social Sciences JAMB offering: Accounting and Finance — FEDOTUOKE. "
            "Transcribed from Social Sciences brochure, printed p. 576; do not merge "
            "with Administration faculty offering(s). Institution list and requirements "
            "are row-specific in that table."
        ),
    }
    if len(matches) == 1 and matches[0] == row:
        return False
    if matches:
        raise ValueError("unexpected pre-existing Social Sciences Accounting and Finance row")
    backup_once(SOCIAL)
    data["programmes"].insert(0, row)
    save(SOCIAL, data)
    return True


def quarantine_name_keyed_map() -> bool:
    data = load(CANONICAL)
    rows = [r for r in data["rows"] if r.get("jamb_name", "").casefold() == "accounting and finance"]
    if len(rows) != 1:
        raise ValueError(f"expected one canonical row, found {len(rows)}")
    row = rows[0]
    reason = (
        "JAMB source evidence has distinct Accounting and Finance offerings in "
        "Administration (BCU) and Social Sciences (FEDOTUOKE), while this name-keyed "
        "mapping can store only one context. Its current Finance-only curriculum slice "
        "is not established for both offerings. Keep candidate links unpublished until "
        "curriculum scope and domain links are assessed per source offering context."
    )
    if row.get("mapping_status") == "review_required" and not row.get("domain_links") and row.get("status_reason") == reason:
        return False
    backup_once(CANONICAL)
    row["mapping_status"] = "review_required"
    row["status_reason"] = reason
    row["domain_links"] = []
    scope = row.get("curriculum_scope") or {}
    scope["status"] = "source_context_review_required"
    scope["approval"] = "pending_review"
    scope["note"] = reason
    row["curriculum_scope"] = scope
    save(CANONICAL, data)
    return True


def main() -> None:
    print(json.dumps({
        "administration_source_corrected": reconcile_admin(),
        "social_sciences_source_added": reconcile_social(),
        "name_keyed_domain_mapping_quarantined": quarantine_name_keyed_map(),
        "rollback_directory": str(BACKUPS.relative_to(ROOT)),
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

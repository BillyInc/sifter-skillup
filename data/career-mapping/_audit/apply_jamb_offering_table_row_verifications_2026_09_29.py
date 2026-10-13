"""Guardedly promote exact original-JAMB-PDF table-row matches.

The companion verifier is intentionally read-only.  This script applies only
rows classified as ``exact_table_row_and_full_parsed_institution_list`` and
leaves partial, title-only, and absent matches untouched.  It is safe to run
without ``--apply`` first; the default mode writes only an append-only change
report.
"""

from __future__ import annotations

import argparse
import json
from datetime import date
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
INVENTORY = AUDIT / "jamb_offering_context_inventory_2026-09-25.json"
VERIFICATION = AUDIT / "jamb_offering_original_pdf_table_row_verification_2026-09-29.json"
REPORT = AUDIT / "jamb_offering_table_row_verifications_2026-09-29.json"
REPORT_MD = AUDIT / "jamb_offering_table_row_verifications_2026-09-29.md"


def read_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def build_changes(inventory: dict[str, Any], verification: dict[str, Any]) -> list[dict[str, Any]]:
    occurrences = {
        str(occurrence.get("occurrence_id")): (identity, occurrence)
        for identity in inventory.get("identities", [])
        for occurrence in identity.get("source_offerings", [])
        if occurrence.get("occurrence_id")
    }
    changes: list[dict[str, Any]] = []
    for row in verification.get("rows", []):
        if row.get("state") != "exact_table_row_and_full_parsed_institution_list":
            continue
        occurrence_id = str(row.get("occurrence_id") or "")
        found = occurrences.get(occurrence_id)
        best = row.get("best_match") or {}
        if not found or not best:
            continue
        identity, occurrence = found
        parsed_tokens = list(occurrence.get("institution_tokens_as_parsed") or [])
        before = {
            "offering_row_verified_against_pdf": occurrence.get("offering_row_verified_against_pdf"),
            "institution_codes_verified_from_pdf": occurrence.get("institution_codes_verified_from_pdf") or [],
            "pdf_table_locator": occurrence.get("pdf_table_locator"),
            "verification_date": occurrence.get("verification_date"),
            "verification_note": occurrence.get("verification_note"),
        }
        after = {
            "offering_row_verified_against_pdf": True,
            "institution_codes_verified_from_pdf": parsed_tokens,
            "pdf_table_locator": (
                f"Original JAMB brochure table row: {Path(str(row.get('original_pdf') or '')).name}, "
                f"page {best.get('page')}, table row {best.get('table_row')}; "
                "programme title and full parsed institution list matched"
            ),
            "verification_date": date.today().isoformat(),
            "verification_note": (
                "Exact programme table-row match in the original JAMB brochure PDF; "
                "all institution tokens preserved in the parsed offering row were "
                "present in the matched source cell."
            ),
        }
        changes.append(
            {
                "occurrence_id": occurrence_id,
                "jamb_name": identity.get("jamb_name"),
                "source_file": occurrence.get("source_file"),
                "original_pdf": row.get("original_pdf"),
                "page": best.get("page"),
                "table_row": best.get("table_row"),
                "institution_count": len(parsed_tokens),
                "before": before,
                "after": after,
                "eligible": True,
            }
        )
    return changes


def apply_changes(inventory: dict[str, Any], changes: list[dict[str, Any]]) -> int:
    by_id = {change["occurrence_id"]: change for change in changes}
    applied = 0
    for identity in inventory.get("identities", []):
        for occurrence in identity.get("source_offerings", []):
            change = by_id.get(str(occurrence.get("occurrence_id") or ""))
            if not change:
                continue
            occurrence.update(change["after"])
            applied += 1
    return applied


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="apply only the exact full-list matches to the local inventory")
    args = parser.parse_args()

    inventory = read_json(INVENTORY)
    verification = read_json(VERIFICATION)
    changes = build_changes(inventory, verification)
    applied = apply_changes(inventory, changes) if args.apply else 0
    if args.apply and applied:
        INVENTORY.write_text(json.dumps(inventory, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    report = {
        "schema": "2026-09-29.jamb-offering-table-row-promotions.v1",
        "generated_on": date.today().isoformat(),
        "mode": "apply" if args.apply else "dry_run",
        "rule": "Only exact table-row matches with complete parsed institution-list coverage are promoted.",
        "verification_artifact": str(VERIFICATION),
        "inventory": str(INVENTORY),
        "eligible_changes": len(changes),
        "applied_changes": applied,
        "changes": changes,
    }
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# JAMB offering table-row promotions — 2026-09-29",
        "",
        f"- Mode: **{report['mode']}**",
        f"- Eligible exact full-list matches: **{len(changes)}**",
        f"- Applied to local inventory: **{applied}**",
        "",
        "Only exact original-PDF table rows with complete parsed institution-list coverage were eligible. Partial, title-only, and absent matches remain unresolved.",
        "",
    ]
    REPORT_MD.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps({"json": str(REPORT), "markdown": str(REPORT_MD), "mode": report["mode"], "eligible_changes": len(changes), "applied_changes": applied}, indent=2))


if __name__ == "__main__":
    main()

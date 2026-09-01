"""Build an explicit crosswalk for the domain library's ISIC-like values.

The domain-definition library stores section-prefixed three-digit values such
as ``K620``.  Those values are preserved as-is.  This script uses the official
UNSD ISIC Rev.4-to-Rev.5 correspondence table to show the defensible Rev.5
class/group candidates; it never rewrites domain_meta.json or silently treats
a prefix match as an exact source claim.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

from _audit_domain_source_traceability import (
    DOMAIN_DOC,
    ISIC_XLSX,
    OUT_DIR,
    docx_paragraphs,
    file_record,
    parse_domain_details,
    sha256,
    xlsx_rows,
)


REPO = Path(__file__).resolve().parents[2]
CORRESPONDENCE_URL = (
    "https://unstats.un.org/unsd/classifications/Econ/tables/ISIC/"
    "ISIC_Rev4_to_ISIC_Rev5_Correspondence_Table-17Jan2025.xlsx"
)
CORRESPONDENCE_CANDIDATES = [
    Path(r"C:\tmp\ISIC_Rev4_to_ISIC_Rev5_Correspondence_Table-17Jan2025.xlsx"),
    Path.home() / "Downloads" / "ISIC_Rev4_to_ISIC_Rev5_Correspondence_Table-17Jan2025.xlsx",
]


def clean(value: str | None) -> str:
    value = str(value or "").strip()
    return value[:-2] if value.endswith(".0") else value


def correspondence_rows(path: Path) -> list[dict[str, str]]:
    rows = xlsx_rows(path)
    result: list[dict[str, str]] = []
    for row in rows[1:]:
        if len(row) < 6:
            continue
        result.append({
            "rev4_code_including_section": clean(row[0]),
            "rev4_code": clean(row[1]),
            "rev4_title": clean(row[2]),
            "rev5_code_including_section": clean(row[3]),
            "rev5_code": clean(row[4]),
            "rev5_title": clean(row[5]),
            "change_type": clean(row[6]) if len(row) > 6 else "",
            "change_description": clean(row[7]) if len(row) > 7 else "",
        })
    return result


def crosswalk_value(raw: str, rows: list[dict[str, str]]) -> dict:
    match = re.fullmatch(r"([A-Z])(\d{3})", raw or "")
    if not match:
        if re.fullmatch(r"[A-Z]", raw or ""):
            return {
                "raw_library_value": raw,
                "status": "section_only_industry_anchor",
                "method": "preserved_section_level_value",
                "rev4_matches": [],
                "rev5_candidates": [
                    {"code": raw, "numeric_code": None, "title": None, "change_type": None, "change_description": None}
                ],
                "note": "A section-level ISIC anchor is valid at its own level; no division or class was invented.",
            }
        return {
            "raw_library_value": raw,
            "status": "not_a_section_prefixed_three_digit_value",
            "rev4_matches": [],
            "rev5_candidates": [],
            "note": "Preserved for source review; no automatic interpretation was made.",
        }

    raw_section, raw_numeric = match.groups()
    exact = [row for row in rows if row["rev4_code"].startswith(raw_numeric)]
    method = "exact_rev4_group_prefix"
    matches = exact
    if not matches:
        division = raw_numeric[:2]
        matches = [row for row in rows if row["rev4_code"].startswith(division)]
        method = "rev4_division_prefix_fallback" if matches else "no_rev4_correspondence"

    rev4_sections = sorted({row["rev4_code_including_section"][0] for row in matches if row["rev4_code_including_section"]})
    rev5_sections = sorted({row["rev5_code_including_section"][0] for row in matches if row["rev5_code_including_section"]})
    section_match = {
        "raw_section": raw_section,
        "matches_rev4_section": raw_section in rev4_sections,
        "matches_rev5_section": raw_section in rev5_sections,
        "rev4_sections_in_candidates": rev4_sections,
        "rev5_sections_in_candidates": rev5_sections,
    }
    if not matches:
        status = "requires_manual_source_review"
    elif method == "exact_rev4_group_prefix":
        status = "crosswalked_from_rev4_group_to_rev5"
    else:
        status = "crosswalked_from_rev4_division_to_rev5_candidates"

    return {
        "raw_library_value": raw,
        "status": status,
        "method": method,
        "section_comparison": section_match,
        "rev4_matches": [
            {
                "code": row["rev4_code_including_section"],
                "numeric_code": row["rev4_code"],
                "title": row["rev4_title"],
            }
            for row in matches
        ],
        "rev5_candidates": [
            {
                "code": row["rev5_code_including_section"],
                "numeric_code": row["rev5_code"],
                "title": row["rev5_title"],
                "change_type": row["change_type"] or None,
                "change_description": row["change_description"] or None,
            }
            for row in matches
        ],
        "note": (
            "The raw value is retained. The candidate list is a source crosswalk, "
            "not a replacement for the library value or proof that the library "
            "author intended this exact revision."
        ),
    }


def main() -> None:
    correspondence = next((path for path in CORRESPONDENCE_CANDIDATES if path.exists()), None)
    if correspondence is None:
        raise SystemExit("Official ISIC Rev.4-to-Rev.5 correspondence table was not found.")
    details = parse_domain_details(docx_paragraphs(DOMAIN_DOC))
    rows = correspondence_rows(correspondence)
    values = sorted({
        value
        for detail in details.values()
        for value in detail.get("isic_divisions", [])
    })
    value_crosswalks = [crosswalk_value(value, rows) for value in values]
    by_value = {item["raw_library_value"]: item for item in value_crosswalks}
    domains = []
    for domain_id in sorted(details, key=lambda value: int(value[1:])):
        detail = details[domain_id]
        domains.append({
            "domain_id": domain_id,
            "domain_name": detail.get("domain_name"),
            "raw_library_isic_values": detail.get("isic_divisions", []),
            "crosswalk_statuses": sorted({by_value[value]["status"] for value in detail.get("isic_divisions", [])}),
            "crosswalks": [by_value[value] for value in detail.get("isic_divisions", [])],
        })

    out = {
        "schema_version": "2026-08-31.isic-domain-crosswalk.v1",
        "purpose": "Preserve the domain library ISIC-like values and map them explicitly to canonical ISIC Rev.5 candidates using the official UNSD correspondence table.",
        "canonical_revision": "ISIC Rev.5",
        "canonical_revision_status": "UNSD-endorsed; publication forthcoming on the UNSD classification page",
        "official_correspondence_url": CORRESPONDENCE_URL,
        "source_files": {
            "domain_definition_library": file_record(DOMAIN_DOC),
            "official_rev4_to_rev5_correspondence": file_record(correspondence),
            "local_rev5_structure_workbook": file_record(ISIC_XLSX),
        },
        "source_sha256": {"official_correspondence": sha256(correspondence)},
        "summary": {
            "domain_count": len(domains),
            "unique_raw_values": len(value_crosswalks),
            "crosswalked_exact_group_prefix": sum(item["status"] == "crosswalked_from_rev4_group_to_rev5" for item in value_crosswalks),
            "crosswalked_division_fallback": sum(item["status"] == "crosswalked_from_rev4_division_to_rev5_candidates" for item in value_crosswalks),
            "manual_source_review_required": sum(item["status"] == "requires_manual_source_review" for item in value_crosswalks),
        },
        "interpretation": "ISIC is the industry-context anchor. The practitioner-facing domain boundary remains a separate reviewed decision supported by occupational sources; this crosswalk does not rename domains or alter subgroup/role ownership.",
        "domains": domains,
        "raw_value_crosswalks": value_crosswalks,
    }
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    json_path = OUT_DIR / "isic_domain_crosswalk_2026-08-31.json"
    md_path = OUT_DIR / "ISIC_DOMAIN_CROSSWALK_2026-08-31.md"
    json_path.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# ISIC domain crosswalk — 2026-08-31",
        "",
        "## Decision",
        "",
        "ISIC Rev.5 is the canonical current revision. The official UNSD Rev.4→Rev.5 correspondence table is used only to reconcile historical or revision-sensitive values; raw library values are preserved.",
        "",
        f"Official correspondence source: {CORRESPONDENCE_URL}",
        f"SHA-256: `{sha256(correspondence)}`",
        "",
        "This artifact does not rename domains, modify `domain_meta.json`, or reassign subgroups and roles. It records candidate Rev.5 values and flags where the raw section letter and numeric code point to different revisions.",
        "",
        "## Summary",
        "",
        f"- Domain-definition records: **{len(domains)}**.",
        f"- Unique raw ISIC-like values: **{len(value_crosswalks)}**.",
        f"- Exact Rev.4 group-prefix crosswalks: **{out['summary']['crosswalked_exact_group_prefix']}**.",
        f"- Rev.4 division-prefix fallback crosswalks: **{out['summary']['crosswalked_division_fallback']}**.",
        f"- Values requiring manual source review: **{out['summary']['manual_source_review_required']}**.",
        "",
        "## Raw-value decisions",
        "",
        "| Raw library value | Status | Rev.4 candidates | Rev.5 candidates | Section comparison |",
        "|---|---|---|---|---|",
    ]
    for item in value_crosswalks:
        comparison = item.get("section_comparison", {})
        rev4 = ", ".join(row["code"] for row in item.get("rev4_matches", [])) or "—"
        rev5 = ", ".join(row["code"] for row in item.get("rev5_candidates", [])) or "—"
        section = "—"
        if comparison:
            section = f"raw {comparison['raw_section']}; Rev.4 {','.join(comparison['rev4_sections_in_candidates']) or '—'}; Rev.5 {','.join(comparison['rev5_sections_in_candidates']) or '—'}"
        lines.append(f"| `{item['raw_library_value']}` | `{item['status']}` | {rev4} | {rev5} | {section} |")
    lines += [
        "",
        "## Reproducibility",
        "",
        "```text",
        "python data/career-mapping/_build_isic_domain_crosswalk.py",
        "```",
        "",
        "The official correspondence workbook must be available at `C:\\tmp\\ISIC_Rev4_to_ISIC_Rev5_Correspondence_Table-17Jan2025.xlsx` or the user's Downloads directory.",
    ]
    md_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(out["summary"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

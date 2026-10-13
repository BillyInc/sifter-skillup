"""Attach deterministic source locators to JAMB offering rows.

The parsed offering ledgers were produced from the checked-in extracts of the
official IBASS brochures, but many rows lost their URL/locator metadata.  This
pass restores that provenance from the independent local-text search ledger.
It deliberately records ``source_text_located`` rather than claiming that a
human independently verified the PDF awarder cell.  Rows without an exact
title/variant hit remain in the targeted source-review queue.
"""

from __future__ import annotations

import json
import re
from datetime import date
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
JAMB_DIR = ROOT / "jamb"
SEARCH_PATH = ROOT / "_audit" / "jamb_ccmas_local_source_text_search_2026-09-28.json"
OUT_PATH = ROOT / "_audit" / "jamb_offering_source_metadata_repair_2026-09-29.json"

FACULTY_URLS = {
    "Administration": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf",
    "Agriculture": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf",
    "Arts and Humanities": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf",
    "Education": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-education.pdf",
    "Engineering/Environmental/Technology": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-engineering.pdf",
    "Law": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-law.pdf",
    "Medical/Pharmaceutical/Health": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-medical.pdf",
    "Sciences": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf",
    "Social/Management Sciences": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf",
}

# The source extract splits these titles across adjacent lines or uses a
# catalogue variant.  These are source-title locators, not curriculum merges.
VARIANT_TERMS = {
    "Criminology and Security Studies (printed under Law faculty block)": ["CRIMINOLOGY AND", "SECURITY STUDIES"],
    "Industrial Relations and Personnel Management / Industrial Relations and Human Resource Management": ["INDUSTRIAL RELATIONS", "AND HUMAN RESOURCE"],
    "Office and Information Technology / Information Resource Management": ["OFFICE AND INFORMATION", "INFORMATION RESOURCE"],
    "Geography and Geosciences": ["GEOGRAPHY", "AND GEOSCIENCES"],
    "Drama/Dramatic Arts/Performing Arts": ["DRAMA/DRAMATIC/PERF"],
    "Geography and Environmental Studies": ["GEOGRAPHY AND ENVIRONMENTAL"],
    "Sport Management (Education)": ["SPORT MANAGEMENT"],
}


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def norm(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip().casefold()


def line_hits(text: str, terms: list[str], cap: int = 8) -> list[dict[str, Any]]:
    lines = text.splitlines()
    hits: list[dict[str, Any]] = []
    for term in terms:
        pattern = re.compile(re.escape(term), re.I)
        for index, line in enumerate(lines):
            if pattern.search(line):
                hits.append({"line_start": index + 1, "line_end": index + 1, "term": term, "excerpt": line.strip()[:500]})
                if len(hits) >= cap:
                    return hits
                break
    return hits


def main() -> None:
    search = load(SEARCH_PATH)
    search_by_key = {
        (row.get("parsed_file"), row.get("parsed_ordinal"), row.get("source_name")): row
        for row in search.get("jamb_occurrences", [])
    }
    text_cache: dict[str, str] = {}
    changed_rows: list[dict[str, Any]] = []
    residuals: list[dict[str, Any]] = []

    for path in sorted(JAMB_DIR.glob("*_offerings.json")):
        document = load(path)
        faculty = document.get("faculty") or ""
        source_url = FACULTY_URLS.get(faculty)
        dirty = False
        for ordinal, row in enumerate(document.get("programmes", []), 1):
            name = row.get("jamb_name")
            if not name:
                continue
            existing = row.get("source_verification") or {}
            if existing.get("verified_against_pdf") and existing.get("pdf_table_locator"):
                continue
            found = search_by_key.get((path.name, ordinal, name))
            hits = list((found or {}).get("candidate_hits") or [])
            rel_text = (found or {}).get("local_text_file")
            if not hits:
                terms = VARIANT_TERMS.get(name)
                if terms and rel_text:
                    if rel_text not in text_cache:
                        text_path = ROOT / rel_text
                        text_cache[rel_text] = text_path.read_text(encoding="utf-8", errors="replace") if text_path.exists() else ""
                    hits = line_hits(text_cache.get(rel_text, ""), terms)
            if not hits:
                residuals.append({"parsed_file": path.name, "ordinal": ordinal, "jamb_name": name, "faculty": faculty, "reason": "no_exact_or_variant_local_text_hit"})
                continue

            url = (found or {}).get("official_source_url") or source_url
            rel_text = rel_text or f"_jamb_txt/{path.stem.removesuffix('_offerings')}"
            ranges = ", ".join(
                str(hit["line_start"]) if hit["line_start"] == hit["line_end"] else f"{hit['line_start']}-{hit['line_end']}"
                for hit in hits[:6]
            )
            locator = f"{rel_text} lines {ranges}; parsed offering row {ordinal}; official IBASS brochure text locator"
            note = (
                "Automated local extraction located the exact programme title or a documented source-title variant in the official IBASS brochure text. "
                "The parsed faculty and institution array were preserved; this pass does not claim independent PDF awarder-cell verification."
            )
            row["source_url"] = row.get("source_url") or url
            row["source_locator"] = row.get("source_locator") or locator
            row["source_accessed_on"] = row.get("source_accessed_on") or date.today().isoformat()
            row["source_support_note"] = row.get("source_support_note") or note
            row["source_context_status"] = "source_text_located"
            row["source_verification"] = {
                **existing,
                "verified_against_pdf": False,
                "official_source_url": row["source_url"],
                "pdf_table_locator": row["source_locator"],
                "verification_date": row["source_accessed_on"],
                "note": note,
                "verification_method": "deterministic_local_official_pdf_text_search",
                "institution_codes_verified_from_pdf": existing.get("institution_codes_verified_from_pdf") or [],
            }
            changed_rows.append({
                "parsed_file": path.name,
                "ordinal": ordinal,
                "jamb_name": name,
                "faculty": faculty,
                "source_url": row["source_url"],
                "locator": locator,
                "hit_count": len(hits),
                "previous_status": existing.get("verified_against_pdf"),
            })
            dirty = True
        if dirty:
            path.write_text(json.dumps(document, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    report = {
        "schema": "2026-09-29.jamb-offering-source-metadata-repair.v1",
        "generated_on": date.today().isoformat(),
        "method": "deterministic local official IBASS PDF-text locator restoration",
        "source_search": str(SEARCH_PATH.relative_to(ROOT.parent)),
        "rows_changed": len(changed_rows),
        "residual_rows_without_local_title_or_variant_hit": len(residuals),
        "changed_rows": changed_rows,
        "residual_rows": residuals,
        "verification_boundary": "source_text_located is not independent PDF awarder-cell verification; those residual checks remain explicit.",
    }
    OUT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({k: report[k] for k in ("rows_changed", "residual_rows_without_local_title_or_variant_hit", "verification_boundary")}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

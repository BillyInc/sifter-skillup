"""Promote JAMB brochure rows whose institution cell is split across pages.

The first table verifier judged each extracted row independently.  Some JAMB
brochure cells continue on the next page, so this pass unions only rows that
match the same programme title on the source candidate pages.  A promotion
still requires complete coverage of the already-parsed institution roster;
the script never treats a partial union as proof.
"""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter
from datetime import date
from pathlib import Path
from typing import Any

import pdfplumber


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
INVENTORY = AUDIT / "jamb_offering_context_inventory_2026-09-25.json"
CELL_REPORT = AUDIT / "jamb_offering_original_pdf_cell_verification_2026-09-29.json"
OUT_PREFIX = AUDIT / "jamb_merged_table_cell_verifications_2026-09-30"
BROCHURE_ROOT = Path(r"C:\Users\USER\Downloads\jamb brochure")

PDF_BY_SOURCE_FILE = {
    "Administration.pdf": "Administration.pdf",
    "agriculture.txt": "Agriculture.pdf",
    "arts_hum.txt": "Arts _ Humanities.pdf",
    "education.txt": "Education.pdf",
    "engineering.txt": "Engineering _ Enviromental _ Technology.pdf",
    "Law.pdf": "Law.pdf",
    "medical.txt": "Medica_Pharmaceutical Health Science.pdf",
    "Sciences.pdf": "Sciences.pdf",
    "Social Management Science.pdf": "Social Management Science.pdf",
}


def normalize(value: Any) -> str:
    return re.sub(r"[^a-z0-9]+", "", str(value or "").casefold())


def title_candidates(value: str) -> list[str]:
    raw = str(value or "")
    values = [raw, re.sub(r"\s*\([^)]*\)\s*$", "", raw)]
    values.extend(part.strip() for part in re.split(r"\s*/\s*", raw) if len(part.strip()) >= 6)
    return sorted({normalize(item) for item in values if normalize(item)}, key=len, reverse=True)


def table_rows(page: Any) -> list[dict[str, Any]]:
    table = page.extract_table() or []
    rows = []
    for ordinal, row in enumerate(table, start=1):
        cells = [str(value or "") for value in row]
        if any(cell.strip() for cell in cells):
            rows.append({"table_row": ordinal, "cells": cells, "course_cell": cells[0] if cells else ""})
    return rows


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    inventory = json.loads(INVENTORY.read_text(encoding="utf-8"))
    cell_report = json.loads(CELL_REPORT.read_text(encoding="utf-8"))
    cell_by_id = {str(row.get("occurrence_id")): row for row in cell_report.get("rows", [])}
    pdfs: dict[str, Any] = {}
    table_cache: dict[tuple[str, int], list[dict[str, Any]]] = {}
    rows: list[dict[str, Any]] = []
    changes: list[dict[str, Any]] = []
    counts = Counter()

    for identity in inventory.get("identities", []):
        for occurrence in identity.get("source_offerings", []):
            if occurrence.get("offering_row_verified_against_pdf") and occurrence.get("pdf_table_locator"):
                continue
            source_file = occurrence.get("source_file")
            pdf_name = PDF_BY_SOURCE_FILE.get(source_file)
            cell = cell_by_id.get(str(occurrence.get("occurrence_id")), {})
            if not pdf_name or not (BROCHURE_ROOT / pdf_name).exists():
                counts["source_pdf_unavailable"] += 1
                continue
            if source_file not in pdfs:
                pdfs[source_file] = pdfplumber.open(str(BROCHURE_ROOT / pdf_name))
            document = pdfs[source_file]
            pages = sorted({int(item.get("page")) for item in cell.get("same_page_candidates", []) if item.get("page")})
            titles = title_candidates(occurrence.get("source_jamb_name") or identity.get("jamb_name"))
            matches: list[dict[str, Any]] = []
            for page_number in pages:
                cache_key = (source_file, page_number)
                if cache_key not in table_cache:
                    table_cache[cache_key] = table_rows(document.pages[page_number - 1])
                for row in table_cache[cache_key]:
                    course_norm = normalize(row["course_cell"])
                    if any(title in course_norm or course_norm in title for title in titles):
                        matches.append({"page": page_number, "table_row": row["table_row"], "course_cell": row["course_cell"]})
            expected = sorted({normalize(token) for token in occurrence.get("institution_tokens_as_parsed", []) if len(normalize(token)) >= 4})
            union_text = " ".join(item["course_cell"] for item in matches)
            hits = [token for token in expected if token in normalize(union_text)]
            coverage = len(hits) / len(expected) if expected else 0
            if matches and expected and coverage >= 1:
                change = {
                    "occurrence_id": occurrence.get("occurrence_id"),
                    "jamb_name": identity.get("jamb_name"),
                    "source_file": source_file,
                    "pdf": str(BROCHURE_ROOT / pdf_name),
                    "pages": sorted({item["page"] for item in matches}),
                    "table_rows": sorted({item["table_row"] for item in matches}),
                    "institution_count": len(expected),
                    "institution_hits": hits,
                    "coverage": coverage,
                    "guard": "same-title table rows unioned across candidate brochure pages; complete parsed institution roster coverage",
                }
                changes.append(change)
                counts["eligible_merged_full_coverage"] += 1
                if args.apply:
                    occurrence.update({
                        "offering_row_verified_against_pdf": True,
                        "institution_codes_verified_from_pdf": list(occurrence.get("institution_tokens_as_parsed") or []),
                        "pdf_table_locator": f"Original JAMB brochure merged table cell: {pdf_name}, pages {','.join(map(str, change['pages']))}, table rows {','.join(map(str, change['table_rows']))}; title and full parsed institution list matched",
                        "verification_date": date.today().isoformat(),
                        "verification_note": "The programme table cell continued across source pages; matching same-title rows were unioned before comparing the complete parsed institution roster.",
                    })
            elif matches and expected and coverage > 0:
                counts["partial_merged_coverage"] += 1
                rows.append({"occurrence_id": occurrence.get("occurrence_id"), "jamb_name": identity.get("jamb_name"), "state": "partial_merged_coverage", "coverage": round(coverage, 6), "pages": sorted({item["page"] for item in matches})})
            elif matches:
                counts["title_match_without_full_roster"] += 1
            else:
                counts["no_same_title_table_match"] += 1

    if args.apply and changes:
        INVENTORY.write_text(json.dumps(inventory, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    for document in pdfs.values():
        document.close()
    output = {
        "schema": "2026-09-30.jamb-merged-table-cell-verifications.v1",
        "generated_on": date.today().isoformat(),
        "mode": "apply" if args.apply else "dry_run",
        "counts": dict(sorted(counts.items())),
        "eligible_changes": len(changes),
        "applied_changes": len(changes) if args.apply else 0,
        "changes": changes,
        "residuals": rows,
        "rule": "Only complete parsed-institution coverage is promoted; partial and absent matches remain explicit.",
    }
    suffix = "_applied" if args.apply else "_dry_run"
    out_json = OUT_PREFIX.with_name(OUT_PREFIX.name + suffix + ".json")
    out_md = OUT_PREFIX.with_name(OUT_PREFIX.name + suffix + ".md")
    out_json.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    out_md.write_text("\n".join([
        "# JAMB merged table-cell verification — 2026-09-30", "", f"Mode: `{output['mode']}`", "",
        f"Eligible merged full-coverage rows: **{len(changes)}**", f"Applied rows: **{output['applied_changes']}**", "",
        *[f"- **{key.replace('_', ' ')}:** {value}" for key, value in sorted(counts.items())], "",
    ]), encoding="utf-8")
    print(json.dumps({"json": str(out_json), "markdown": str(out_md), "mode": output["mode"], "counts": dict(sorted(counts.items())), "eligible_changes": len(changes)}, indent=2))


if __name__ == "__main__":
    main()

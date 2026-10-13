"""Match pending JAMB offerings to original-PDF table rows and institution cells."""

from __future__ import annotations

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
BROCHURE_ROOT = Path(r"C:\Users\USER\Downloads\jamb brochure")
OUT_JSON = AUDIT / "jamb_offering_original_pdf_table_row_verification_2026-09-29.json"
OUT_MD = AUDIT / "jamb_offering_original_pdf_table_row_verification_2026-09-29.md"

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
    values = [raw]
    values.append(re.sub(r"\s*\([^)]*\)\s*$", "", raw))
    for part in re.split(r"\s*/\s*", raw):
        if len(part.strip()) >= 6:
            values.append(part.strip())
    return sorted({normalize(item) for item in values if normalize(item)}, key=len, reverse=True)


def table_rows(page: Any) -> list[dict[str, Any]]:
    table = page.extract_table() or []
    rows = []
    for ordinal, row in enumerate(table, start=1):
        cells = [str(value or "") for value in row]
        if not any(cell.strip() for cell in cells):
            continue
        rows.append({"table_row": ordinal, "cells": cells, "course_cell": cells[0] if cells else ""})
    return rows


def main() -> None:
    inventory = json.loads(INVENTORY.read_text(encoding="utf-8"))
    cell_report = json.loads(CELL_REPORT.read_text(encoding="utf-8"))
    cell_by_id = {row.get("occurrence_id"): row for row in cell_report.get("rows", [])}
    pdf_cache: dict[str, Any] = {}
    table_cache: dict[tuple[str, int], list[dict[str, Any]]] = {}
    results: list[dict[str, Any]] = []
    for identity in inventory.get("identities", []):
        for occurrence in identity.get("source_offerings", []):
            if occurrence.get("offering_row_verified_against_pdf") and occurrence.get("pdf_table_locator"):
                continue
            occurrence_id = occurrence.get("occurrence_id")
            cell = cell_by_id.get(occurrence_id, {})
            source_file = occurrence.get("source_file")
            pdf_name = PDF_BY_SOURCE_FILE.get(source_file)
            if not pdf_name:
                results.append({"occurrence_id": occurrence_id, "jamb_name": identity.get("jamb_name"), "state": "source_pdf_mapping_missing"})
                continue
            if source_file not in pdf_cache:
                pdf_cache[source_file] = pdfplumber.open(str(BROCHURE_ROOT / pdf_name))
            document = pdf_cache[source_file]
            pages = sorted({item.get("page") for item in cell.get("same_page_candidates", []) if item.get("page")})
            matches: list[dict[str, Any]] = []
            for page_number in pages:
                cache_key = (source_file, page_number)
                if cache_key not in table_cache:
                    table_cache[cache_key] = table_rows(document.pages[page_number - 1])
                for row in table_cache[cache_key]:
                    course_norm = normalize(row["course_cell"])
                    candidate = next((value for value in title_candidates(occurrence.get("source_jamb_name") or identity.get("jamb_name")) if value in course_norm or course_norm in value), None)
                    if not candidate:
                        continue
                    institution_cell = normalize(row["course_cell"])
                    parsed_tokens = sorted({normalize(token) for token in occurrence.get("institution_tokens_as_parsed", []) if len(normalize(token)) >= 4})
                    hits = [token for token in parsed_tokens if token in institution_cell]
                    coverage = round(len(hits) / len(parsed_tokens), 6) if parsed_tokens else 0
                    matches.append({"page": page_number, "table_row": row["table_row"], "course_cell_excerpt": row["course_cell"][:500], "institution_token_hits": hits, "parsed_institution_count": len(parsed_tokens), "institution_token_coverage": coverage})
            best = max(matches, key=lambda item: (item["institution_token_coverage"], len(item["institution_token_hits"])), default=None)
            if best and best["institution_token_coverage"] >= 1:
                state = "exact_table_row_and_full_parsed_institution_list"
            elif best and best["institution_token_coverage"] > 0:
                state = "table_row_with_partial_parsed_institution_list"
            elif matches:
                state = "table_row_title_match_without_institution_coverage"
            else:
                state = "no_table_row_match_on_candidate_pages"
            results.append({"occurrence_id": occurrence_id, "jamb_name": identity.get("jamb_name"), "source_jamb_name": occurrence.get("source_jamb_name"), "source_file": source_file, "original_pdf": str(BROCHURE_ROOT / pdf_name), "candidate_pages": pages, "state": state, "best_match": best, "all_matches": matches})
    for document in pdf_cache.values():
        document.close()
    counts = Counter(row["state"] for row in results)
    output = {"schema": "2026-09-29.jamb-original-pdf-table-row-verification.v1", "generated_on": date.today().isoformat(), "status": "read_only_table_row_candidates_built", "pending_rows_scanned": len(results), "counts": dict(sorted(counts.items())), "rule": "Only a full parsed-institution-list match is eligible for a guarded inventory verification update; partial matches remain review candidates.", "rows": results}
    OUT_JSON.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = ["# JAMB original-PDF table-row verification — 2026-09-29", "", "Read-only table-row matching against the original JAMB brochure PDFs.", "", f"- Pending rows scanned: **{len(results)}**"]
    lines.extend(f"- `{key}`: **{value}**" for key, value in sorted(counts.items()))
    lines += ["", "Only rows whose parsed institution list is fully present in the matched source cell are eligible for deterministic promotion. Partial or absent matches remain explicit.", ""]
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps({"json": str(OUT_JSON), "markdown": str(OUT_MD), "pending_rows_scanned": len(results), "counts": dict(sorted(counts.items()))}, indent=2))


if __name__ == "__main__":
    main()

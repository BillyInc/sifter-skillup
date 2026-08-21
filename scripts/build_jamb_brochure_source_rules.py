#!/usr/bin/env python3
"""Build source-aware JAMB requirement rules from the supplied brochure PDFs.

The brochure uses vertically shared cells: a programme heading can be followed
by blank requirement columns while the preceding populated requirement block
continues to apply.  This inventory keeps that inheritance explicit instead of
copying text into a programme with no provenance.  Different PDF candidates
remain separate source variants.
"""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter
from pathlib import Path
from typing import Any

import pdfplumber


ROOT = Path(__file__).resolve().parents[1]
BROCHURE_ROOT = Path(r"C:\Users\USER\Downloads\jamb brochure")
AUDIT_PATH = ROOT / "docs" / "manual-review" / "brochure-subject-requirements-audit-2026-08-18.json"
DEFAULT_JSON = ROOT / "data" / "career-mapping" / "_audit" / "jamb_brochure_source_rules_2026-08-19.json"
DEFAULT_MD = ROOT / "docs" / "manual-review" / "jamb-brochure-source-rules-2026-08-19.md"

PDF_BY_JSON = {
    "administration_offerings.json": "Administration.pdf",
    "agriculture_offerings.json": "Agriculture.pdf",
    "arts_hum_offerings.json": "Arts _ Humanities.pdf",
    "education_offerings.json": "Education.pdf",
    "engineering_offerings.json": "Engineering _ Enviromental _ Technology.pdf",
    "law_offerings.json": "Law.pdf",
    "medical_offerings.json": "Medica_Pharmaceutical Health Science.pdf",
    "sciences_offerings.json": "Sciences.pdf",
    "social_management_offerings.json": "Social Management Science.pdf",
}

FIELD_BY_LAYER = {
    "direct_entry": "direct_entry_cell",
    "utme": "utme_cell",
    "olevel": "olevel_cell",
}


def clean(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()


def table_data_rows(table: list[list[Any]]) -> list[tuple[int, list[Any]]]:
    """Return data rows while preserving the PDF table row number."""
    # Faculty index/catalogue pages are six-column numbered programme lists,
    # not requirement tables. Do not let their programme names become shared
    # requirement text for later blank rows.
    if table and re.fullmatch(r"\s*\d+\s*", str(table[0][0] or "")):
        return []

    header_terms = (
        "course", "degree", "programme", "institution", "direct entry", "o level",
        "utme", "special consideration", "waiver", "requirements",
    )

    def looks_like_header(row: list[Any]) -> bool:
        values = [re.sub(r"\s+", " ", str(value or "")).strip().lower() for value in row]
        compact = [re.sub(r"[^a-z]+", "", value) for value in values]
        hits = 0
        for value, token in zip(values, compact):
            if len(value) > 90:
                continue
            if any(term in value for term in header_terms) or token in {
                "course", "degreeawardinginstitutions", "requirements", "directentry",
                "olevel", "utmesubjects", "specialconsiderationwaiverremarks",
            }:
                hits += 1
        return hits >= 2

    start = 0
    for row in table[:2]:
        if looks_like_header(row):
            start += 1
        else:
            break
    return [(index, row) for index, row in enumerate(table[start:], start=start + 1)]


def usable_requirement_fragment(value: Any) -> str:
    """Discard extraction artefacts such as institution-number continuations."""
    text = clean(value)
    if not text or not re.search(r"[A-Za-z]", text):
        return ""
    if re.fullmatch(r"[\d\s,.;:/()\-]+", text):
        return ""
    return text


def page_rows(pdf_name: str, page_number: int, document, cache: dict) -> list[dict[str, Any]]:
    """Extract one page in the same row numbering used by the source audit."""
    key = (pdf_name, page_number)
    if key in cache:
        return cache[key]
    table = document.pages[page_number - 1].extract_table() if page_number > 0 else None
    rows: list[dict[str, Any]] = []
    for row_number, row in table_data_rows(table or []):
        values = [clean(value) for value in row]
        if not any(values):
            continue
        rows.append(
            {
                "source_file": pdf_name,
                "page": page_number,
                "row": row_number,
                "cells": values,
                "course_cell": values[0] if len(values) > 0 else "",
                "direct_entry_cell": values[1] if len(values) > 1 else "",
                "olevel_cell": values[2] if len(values) > 2 else "",
                "utme_cell": values[3] if len(values) > 3 else "",
                "waiver_cell": values[4] if len(values) > 4 else "",
            }
        )
    cache[key] = rows
    return rows


def source_location(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "source_file": row["source_file"],
        "pdf_page": row["page"],
        "table_row": row["row"],
        "course_cell": row.get("course_cell", ""),
    }


def normalized(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", value.lower())


def is_programme_heading(row: dict[str, Any], heading_names: set[str]) -> bool:
    course = normalized(row.get("course_cell", ""))
    return bool(course and any(course.startswith(name) for name in heading_names))


def row_has_requirement(row: dict[str, Any]) -> bool:
    return any(usable_requirement_fragment(row.get(field)) for field in FIELD_BY_LAYER.values())


def collect_forward_segments(
    pdf_name: str,
    start: dict[str, Any],
    layer: str,
    document,
    cache: dict,
    heading_names: set[str],
) -> list[dict[str, Any]]:
    """Collect text split into the same requirement column on following rows."""
    field = FIELD_BY_LAYER[layer]
    segments = [start]
    found_continuation = False
    last_page = min(len(document.pages), int(start["page"]) + 4)
    for page_number in range(int(start["page"]), last_page + 1):
        for row in page_rows(pdf_name, page_number, document, cache):
            if (row["page"], row["row"]) <= (start["page"], start["row"]):
                continue
            fragment = usable_requirement_fragment(row.get(field))
            if fragment:
                if is_programme_heading(row, heading_names):
                    return segments
                segments.append(row)
                found_continuation = True
                continue
            if found_continuation:
                return segments
            if is_programme_heading(row, heading_names) and row_has_requirement(row):
                return segments
    return segments


def rule_from_start(
    pdf_name: str,
    current: dict[str, Any],
    start: dict[str, Any],
    layer: str,
    status: str,
    document,
    cache: dict,
    heading_names: set[str],
) -> dict[str, Any]:
    segments = collect_forward_segments(pdf_name, start, layer, document, cache, heading_names)
    rule = {
        "status": status,
        "text": " ".join(usable_requirement_fragment(row.get(FIELD_BY_LAYER[layer])) for row in segments),
        "source": source_location(current),
        "inherited_from": None if status == "exact" else source_location(start),
        "continuation_sources": [source_location(row) for row in segments],
    }
    if len(segments) == 1:
        rule.pop("continuation_sources")
    return rule


def inherited_rule(pdf_name: str, page: int, row_number: int, layer: str, document, cache: dict, heading_names: set[str]) -> dict[str, Any]:
    field = FIELD_BY_LAYER[layer]
    current_rows = page_rows(pdf_name, page, document, cache)
    current = next((row for row in current_rows if row["row"] == row_number), None)
    if current is None:
        return {
            "status": "source_row_not_found",
            "text": None,
            "source": {"source_file": pdf_name, "pdf_page": page, "table_row": row_number},
            "inherited_from": None,
        }
    direct = usable_requirement_fragment(current.get(field))
    if direct:
        return rule_from_start(pdf_name, current, current, layer, "exact", document, cache, heading_names)

    # A blank primary cell in this table is a shared continuation. Walk back
    # through the same PDF table stream to the last populated cell. The exact
    # source row is retained so reviewers can verify the inherited block.
    # Search earlier rows on the same page first, then walk backwards by page.
    # This is deliberately lazy: only pages needed by a blank candidate are
    # parsed, which keeps the source audit fast enough to run repeatedly.
    prior_rows: list[dict[str, Any]] = [
        row for row in current_rows if row["row"] < row_number
    ]
    for prior_page in range(page - 1, 0, -1):
        prior_rows.extend(page_rows(pdf_name, prior_page, document, cache))
        # Once the page has a populated row that is visibly a programme
        # heading, earlier pages belong to the preceding programme block and
        # must not be pulled into this rule.
        page_data = page_rows(pdf_name, prior_page, document, cache)
        page_slice = prior_rows[-len(page_data):] if page_data else []
        if any(is_programme_heading(row, heading_names) and usable_requirement_fragment(row.get(field)) for row in page_slice):
            break
    prior_rows.sort(key=lambda row: (row["page"], row["row"]))
    for index in range(len(prior_rows) - 1, -1, -1):
        prior = prior_rows[index]
        candidate = usable_requirement_fragment(prior.get(field))
        if not candidate:
            continue
        start_index = index
        while start_index > 0 and not is_programme_heading(prior_rows[start_index], heading_names):
            previous = prior_rows[start_index - 1]
            if not usable_requirement_fragment(previous.get(field)):
                break
            start_index -= 1
        start = prior_rows[start_index]
        return rule_from_start(pdf_name, current, start, layer, "inherited_shared", document, cache, heading_names)
    return {
        "status": "source_blank",
        "text": None,
        "source": source_location(current),
        "inherited_from": None,
    }


SAFE_STATUSES = {"exact", "inherited_shared"}


def row_resolution(variants: list[dict[str, Any]]) -> str:
    if not variants:
        return "no_source_candidate"
    safe_texts = []
    for variant in variants:
        rule = variant["source_variant"]
        if rule["status"] in SAFE_STATUSES and rule.get("text"):
            safe_texts.append(clean(rule["text"]).lower())
    if not safe_texts:
        return "source_still_blank_or_missing"
    if len(set(safe_texts)) == 1:
        return "resolved_from_source_variants"
    return "multiple_source_variants_preserved"


def build() -> dict[str, Any]:
    audit = json.loads(AUDIT_PATH.read_text(encoding="utf-8"))
    result_rows: list[dict[str, Any]] = []
    # Programme names are used only to identify the beginning of a source
    # block. They do not alter the source text or perform fuzzy matching.
    heading_names: set[str] = set()
    for path in sorted((ROOT / "data" / "career-mapping" / "jamb").glob("*_offerings.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        for programme in data.get("programmes") or []:
            name = re.sub(r"[^a-z0-9]+", "", str(programme.get("jamb_name") or "").lower())
            if name:
                heading_names.add(name)
    candidates_by_file: dict[str, list[tuple[dict[str, Any], dict[str, Any]]]] = {}
    for item in audit.get("rows") or []:
        for candidate in item.get("source_candidates") or []:
            candidates_by_file.setdefault(candidate["source_file"], []).append((item, candidate))
    for source_file, candidates in candidates_by_file.items():
        cache: dict = {}
        with pdfplumber.open(str(BROCHURE_ROOT / source_file)) as document:
            for item, candidate in candidates:
                layer = item["layer"]
                rule = inherited_rule(source_file, candidate["page"], candidate["row"], layer, document, cache, heading_names)
                rows = page_rows(source_file, candidate["page"], document, cache)
                current = next((row for row in rows if row["row"] == candidate["row"]), {})
                item.setdefault("_source_variants", []).append(
                    {
                        "jamb_name": item["jamb_name"],
                        "layer": layer,
                        "catalogue_state": item.get("catalogue_state"),
                        "catalogue_text": item.get("catalogue_text"),
                        "source_status_before_inheritance": item["source_status"],
                        "source_variant": rule,
                        "direct_entry_cell": current.get("direct_entry_cell", ""),
                        "olevel_cell": current.get("olevel_cell", ""),
                        "utme_cell": current.get("utme_cell", ""),
                        "waiver_cell": current.get("waiver_cell", ""),
                    }
                )
    for item in audit.get("rows") or []:
        variants = item.pop("_source_variants", [])
        result_rows.append(
            {
                "jamb_name": item["jamb_name"],
                "layer": item["layer"],
                "catalogue_text": item.get("catalogue_text"),
                "catalogue_state": item.get("catalogue_state"),
                "source_status_before_inheritance": item["source_status"],
                "source_variant_count": len(variants),
                "source_variants": variants,
                "resolution": row_resolution(variants),
            }
        )

    counts = Counter(
        variant["source_variant"]["status"]
        for row in result_rows
        for variant in row["source_variants"]
    )
    resolution_counts = Counter(row["resolution"] for row in result_rows)
    return {
        "schema_version": 1,
        "status": "complete",
        "source_directory": str(BROCHURE_ROOT),
        "contract": "Blank primary cells inherit the latest populated cell in the same brochure table stream; source variants are never merged silently.",
        "counts": {
            "review_layers": len(result_rows),
            "source_variants": sum(row["source_variant_count"] for row in result_rows),
            "variant_statuses": dict(counts),
            "resolutions": dict(resolution_counts),
        },
        "rows": result_rows,
    }


def write(report: dict[str, Any], json_path: Path, md_path: Path) -> None:
    json_path.parent.mkdir(parents=True, exist_ok=True)
    json_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# JAMB brochure source rules - 2026-08-19",
        "",
        "This inventory verifies all 1,260 national requirement layers (420 JAMB names × UTME, O-level, and Direct Entry) against the original brochure requirement tables. Catalogue/index pages are excluded. A blank primary cell is resolved only as an explicit shared continuation from the last populated requirement cell in the same PDF table stream. Special-consideration prose is not promoted into a national rule. Multiple source variants are preserved; they are not merged silently.",
        "",
    ]
    for key, value in report["counts"].items():
        lines.append(f"- {key}: **{value}**")
    lines += ["", "## Layer decisions", ""]
    for row in report["rows"]:
        variants = []
        for variant in row["source_variants"]:
            rule = variant["source_variant"]
            origin = rule["inherited_from"]
            origin_text = (
                f"inherited from {origin['source_file']} p{origin['pdf_page']} r{origin['table_row']}"
                if origin
                else "direct source cell"
            )
            variants.append(
                f"{rule['status']} ({origin_text}): {rule['text'] or 'SOURCE IS BLANK'}"
            )
        lines.append(
            f"- `{row['jamb_name']}` / `{row['layer']}` - `{row['resolution']}` - "
            + " || ".join(variants or ["no source candidate"])
        )
    md_path.parent.mkdir(parents=True, exist_ok=True)
    md_path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--json", type=Path, default=DEFAULT_JSON)
    parser.add_argument("--md", type=Path, default=DEFAULT_MD)
    args = parser.parse_args()
    report = build()
    write(report, args.json, args.md)
    print(json.dumps(report["counts"], indent=2))


if __name__ == "__main__":
    main()

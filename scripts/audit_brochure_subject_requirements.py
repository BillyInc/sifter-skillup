"""Compare the effective JAMB subject text with the supplied brochure tables.

The JSON catalogue is the repository input used by the seed generator, but a
number of rows were extracted from PDF page continuations and can contain
headers, waiver prose, or shared-column text.  This audit reads the original
brochure tables once, finds the source row(s) for every unstructured subject
layer, and records whether the layer can be safely reconstructed from a
primary O-level/UTME cell.

It deliberately does not alter the seed.  A source candidate is evidence for
the next parser/data correction, not permission to silently treat a waiver or
shared heading as a national requirement.
"""

from __future__ import annotations

import argparse
import glob
import json
import re
import sys
import unicodedata
from collections import Counter
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
BROCHURE_ROOT = Path(r"C:\Users\USER\Downloads\jamb brochure")
DATA_ROOT = ROOT / "data" / "career-mapping"
MANUAL_CONFIRMATIONS = DATA_ROOT / "_audit" / "jamb_brochure_manual_source_confirmations_2026-09-11.json"

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
    "olevel": "olevel_cell",
    "utme": "utme_cell",
}


def normalize(value: Any) -> str:
    text = unicodedata.normalize("NFKD", str(value or "")).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "", text.lower())


def as_text(value: Any) -> str:
    if isinstance(value, list):
        return "; ".join(str(item) for item in value if item)
    return str(value or "")


def table_data_rows(table: list[list[Any]]) -> list[tuple[int, list[Any]]]:
    """Return data rows while preserving the PDF table row number.

    Most brochure pages have two header rows, but some continuation pages are
    extracted as a one-row table containing real programme data. Skip only
    rows that actually look like headers.
    """
    # Faculty index/catalogue pages are extracted as six-column numbered
    # lists (number, programme, number, programme, ...), not as requirement
    # tables. Treating them as source rows contaminates inheritance on later
    # blank requirement pages.
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
    text = re.sub(r"\s+", " ", str(value or "")).strip()
    if not text or not re.search(r"[A-Za-z]", text):
        return ""
    if re.fullmatch(r"[\d\s,.;:/()\-]+", text):
        return ""
    return text


def contaminated_national_text(layer: str, value: str) -> bool:
    if not value:
        return False
    if re.search(r"UTMESUBJECTS|DIRECTENTRY|\bSPECIAL\b", value, re.I):
        return True
    if layer == "utme" and re.search(
        r"^\s*\(?[ivxlcdm]+\)?\s+[A-Z0-9'&./ -]{2,}\s+(?:accepts?|requires?|does\s+not)",
        value,
        re.I,
    ):
        return True
    return False


def effective_programmes() -> dict[str, dict[str, Any]]:
    programmes: dict[str, dict[str, Any]] = {}
    for path in sorted((DATA_ROOT / "jamb").glob("*_offerings.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        for programme in data.get("programmes") or []:
            name = programme.get("jamb_name")
            if name:
                programmes.setdefault(name, {**programme, "_json_file": path.name})
    for path in sorted((DATA_ROOT / "jamb" / "enrich").glob("*.json")):
        if path.name.startswith("_"):
            continue
        overlay = json.loads(path.read_text(encoding="utf-8"))
        name = overlay.get("jamb_name")
        if name in programmes:
            programmes[name] = {
                **programmes[name],
                **{key: value for key, value in overlay.items() if value},
            }
    return programmes


def review_layers(programmes: dict[str, dict[str, Any]], include_all: bool = True) -> list[dict[str, Any]]:
    sys.path.insert(0, str(DATA_ROOT))
    from _parse_subject_options import parse_olevel, parse_utme  # type: ignore

    rows: list[dict[str, Any]] = []
    for name, programme in sorted(programmes.items()):
        utme = as_text(programme.get("utme_subjects")).strip()
        olevel = as_text(programme.get("olevel_requirement")).strip()
        direct_entry = as_text(programme.get("direct_entry")).strip()
        utme_needs_review = (not utme) or parse_utme(utme) is None or contaminated_national_text("utme", utme)
        if include_all or utme_needs_review:
            rows.append({
                "jamb_name": name,
                "layer": "utme",
                "source_json": programme.get("_json_file"),
                "catalogue_text": utme,
                "catalogue_state": "empty" if not utme else ("needs_review" if utme_needs_review else "parsed"),
            })
        olevel_needs_review = (not olevel) or parse_olevel(olevel) is None or contaminated_national_text("olevel", olevel)
        if include_all or olevel_needs_review:
            rows.append({
                "jamb_name": name,
                "layer": "olevel",
                "source_json": programme.get("_json_file"),
                "catalogue_text": olevel,
                "catalogue_state": "empty" if not olevel else ("needs_review" if olevel_needs_review else "parsed"),
            })
        direct_needs_review = not direct_entry or contaminated_national_text("direct_entry", direct_entry)
        if include_all or direct_needs_review:
            rows.append({
                "jamb_name": name,
                "layer": "direct_entry",
                "source_json": programme.get("_json_file"),
                "catalogue_text": direct_entry,
                "catalogue_state": "empty" if not direct_entry else ("needs_review" if direct_needs_review else "present"),
            })
    return rows


def extract_source_rows() -> list[dict[str, Any]]:
    try:
        import pdfplumber  # type: ignore
    except ImportError as exc:  # pragma: no cover - environment dependency
        raise RuntimeError("pdfplumber is required to read the supplied brochures") from exc

    rows: list[dict[str, Any]] = []
    for pdf_path in sorted(BROCHURE_ROOT.glob("*.pdf")):
        with pdfplumber.open(str(pdf_path)) as document:
            for page_number, page in enumerate(document.pages, start=1):
                table = page.extract_table()
                if not table:
                    continue
                for row_number, row in table_data_rows(table):
                    values = [str(value or "").replace("\n", " ").strip() for value in row]
                    if not any(values):
                        continue
                    # The brochure table is: course/institutions, DE, O-level,
                    # UTME, waiver remarks. Keep the raw row for review.
                    rows.append({
                        "source_file": pdf_path.name,
                        "page": page_number,
                        "row": row_number,
                        "cells": values,
                        "course_cell": values[0] if len(values) > 0 else "",
                        "direct_entry_cell": values[1] if len(values) > 1 else "",
                        "olevel_cell": values[2] if len(values) > 2 else "",
                        "utme_cell": values[3] if len(values) > 3 else "",
                        "waiver_cell": values[4] if len(values) > 4 else "",
                    })
    return rows


def source_identity_variants(jamb_name: str) -> list[str]:
    """Return only explicitly source-identity-preserving display variants."""
    name = str(jamb_name or "").strip()
    variants = [name]
    law_suffix = re.sub(
        r"\s*\(printed\s+under\s+Law\s+faculty\s+block\)\s*$",
        "",
        name,
        flags=re.I,
    ).strip()
    if law_suffix and law_suffix != name:
        variants.append(law_suffix)
    return variants


def is_source_candidate(jamb_name: str, source: dict[str, Any]) -> bool:
    raw_course = str(source.get("course_cell") or "")
    for identity in source_identity_variants(jamb_name):
        needle = normalize(identity)
        course = normalize(raw_course)
        if not needle or needle not in course:
            continue
        parts = re.findall(r"[A-Za-z0-9]+", identity)
        phrase = r"[\s\-_/&,\.]*".join(re.escape(part) for part in parts)
        if not phrase:
            continue
        match = re.search(rf"(?<![A-Z0-9]){phrase}(?![A-Z0-9])", raw_course, re.I)
        if not match:
            continue
        # A shorter programme name must not claim a source row whose actual
        # programme continues with another title joined by "and".
        remainder = raw_course[match.end():]
        if re.match(r"\s*(?:and|&)\b", remainder, re.I):
            continue
        return True
    return False


def classify(layer: str, candidates: list[dict[str, Any]]) -> str:
    cell = FIELD_BY_LAYER[layer]
    populated = {
        normalize(usable_requirement_fragment(row.get(cell))): usable_requirement_fragment(row.get(cell))
        for row in candidates
        if usable_requirement_fragment(row.get(cell))
    }
    if not candidates:
        return "source_row_not_found"
    if not populated:
        return "source_row_found_but_primary_cell_empty"
    if len(populated) == 1:
        text = next(iter(populated.values()))
        if re.search(r"\bas\s+in\b|same\s+as|shared|continues", str(text), re.I):
            return "source_cross_reference_or_shared_cell"
        return "one_primary_source_candidate"
    return "multiple_primary_source_candidates"


def audit() -> dict[str, Any]:
    programmes = effective_programmes()
    review = review_layers(programmes)
    source_rows = extract_source_rows()
    manual_document = json.loads(MANUAL_CONFIRMATIONS.read_text(encoding="utf-8")) if MANUAL_CONFIRMATIONS.exists() else {"confirmations": []}
    manual_by_key = {
        (row.get("jamb_name"), row.get("layer")): row
        for row in manual_document.get("confirmations") or []
    }
    report_rows: list[dict[str, Any]] = []
    for item in review:
        candidates = []
        for source in source_rows:
            # Only the course/institutions cell is an identity match.  A name
            # appearing in a waiver or a page-continuation cell is evidence of
            # related prose, not proof that the row owns that requirement.
            if is_source_candidate(item["jamb_name"], source):
                candidates.append(source)
        manual = manual_by_key.get((item["jamb_name"], item["layer"]))
        if not candidates and manual:
            candidates.append({
                "source_file": manual.get("source_file"),
                "page": manual.get("pdf_page"),
                "row": manual.get("table_row"),
                "cells": [
                    manual.get("course_cell", ""),
                    "" if manual.get("layer") == "direct_entry" else "",
                    "" if manual.get("layer") == "olevel" else "",
                    "" if manual.get("layer") == "utme" else "",
                    "",
                ],
                "course_cell": manual.get("course_cell", ""),
                "direct_entry_cell": "",
                "olevel_cell": "",
                "utme_cell": "",
                "waiver_cell": "",
                "manual_status": manual.get("status"),
                "manual_note": manual.get("note"),
                "source_heading": manual.get("source_heading"),
            })
        source_status = classify(item["layer"], candidates)
        if manual and candidates and candidates[-1].get("manual_status"):
            source_status = f"manual_{candidates[-1]['manual_status']}_confirmed"
        report_rows.append({
            **item,
            "source_status": source_status,
            "candidate_count": len(candidates),
            "source_candidates": candidates[:12],
        })
    return {
        "schema_version": 1,
        "source_directory": str(BROCHURE_ROOT),
        "source_files": sorted({row["source_file"] for row in source_rows}),
        "counts": {
            "effective_programmes": len(programmes),
            "source_table_rows": len(source_rows),
            "review_layers": len(review),
            "review_programmes": len({row["jamb_name"] for row in review}),
        },
        "status_counts": dict(Counter(row["source_status"] for row in report_rows)),
        "rows": report_rows,
    }


def write_report(report: dict[str, Any], json_path: Path, md_path: Path) -> None:
    json_path.parent.mkdir(parents=True, exist_ok=True)
    json_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# Brochure subject-requirement source audit",
        "",
        f"Source: `{report['source_directory']}`",
        "",
        "This report compares unstructured repository subject layers with the original brochure table cells. It does not convert a waiver or a shared continuation into a national rule.",
        "",
    ]
    for key, value in report["counts"].items():
        lines.append(f"- {key}: **{value}**")
    lines += ["", "## Status counts", ""]
    for key, value in sorted(report["status_counts"].items()):
        lines.append(f"- `{key}`: **{value}**")
    lines += ["", "## Review layers", ""]
    for row in report["rows"]:
        lines.append(
            f"- `{row['layer']}` `{row['jamb_name']}` — `{row['source_status']}`; "
            f"{row['candidate_count']} brochure candidate(s)."
        )
    md_path.parent.mkdir(parents=True, exist_ok=True)
    md_path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def apply_manual_confirmations(existing_path: Path) -> dict[str, Any]:
    """Replay explicit confirmations without re-scanning every brochure PDF."""
    report = json.loads(existing_path.read_text(encoding="utf-8"))
    manual_document = json.loads(MANUAL_CONFIRMATIONS.read_text(encoding="utf-8"))
    confirmations = {
        (row.get("jamb_name"), row.get("layer")): row
        for row in manual_document.get("confirmations") or []
    }
    changed = 0
    for row in report.get("rows") or []:
        confirmation = confirmations.get((row.get("jamb_name"), row.get("layer")))
        if not confirmation:
            continue
        candidate = {
            "source_file": confirmation.get("source_file"),
            "page": confirmation.get("pdf_page"),
            "row": confirmation.get("table_row"),
            "cells": [confirmation.get("course_cell", ""), "", "", "", ""],
            "course_cell": confirmation.get("course_cell", ""),
            "direct_entry_cell": "",
            "olevel_cell": "",
            "utme_cell": "",
            "waiver_cell": "",
            "manual_status": confirmation.get("status"),
            "manual_note": confirmation.get("note"),
            "source_heading": confirmation.get("source_heading"),
        }
        row["source_status"] = f"manual_{confirmation.get('status')}_confirmed"
        row["candidate_count"] = 1
        row["source_candidates"] = [candidate]
        changed += 1
    report.setdefault("manual_confirmations", {})["file"] = str(MANUAL_CONFIRMATIONS)
    report["manual_confirmations"]["applied_rows"] = changed
    report["manual_confirmations"]["statuses"] = dict(Counter(
        confirmation.get("status")
        for confirmation in confirmations.values()
    ))
    report["status_counts"] = dict(Counter(row.get("source_status") for row in report.get("rows") or []))
    return report


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--json", type=Path, default=ROOT / "docs" / "manual-review" / "brochure-subject-requirements-audit-2026-08-18.json")
    parser.add_argument("--md", type=Path, default=ROOT / "docs" / "manual-review" / "brochure-subject-requirements-audit-2026-08-18.md")
    parser.add_argument("--apply-manual-confirmations", action="store_true")
    args = parser.parse_args()
    report = apply_manual_confirmations(args.json) if args.apply_manual_confirmations else audit()
    write_report(report, args.json, args.md)
    print(json.dumps({"counts": report["counts"], "status_counts": report["status_counts"]}, indent=2))


if __name__ == "__main__":
    main()

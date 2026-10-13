#!/usr/bin/env python3
"""Audit the source-backed subject catalogue and stream visibility contract.

This checks the generated catalogue seed without contacting Supabase. Stream
tags are picker visibility metadata; exam_types remain the authority for
whether a row is available to O'Level or UTME. The deterministic post-upsert
normalization in seed_subject_catalog.sql is applied in memory so the audit
checks the effective seed state as well as the literal rows.
"""

from __future__ import annotations

import importlib.util
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
SEED = ROOT / "backend" / "seed_subject_catalog.sql"
SOURCE_AUDIT = ROOT / "data" / "career-mapping" / "_audit" / "jamb_subject_catalog_original_pdf_audit_2026_10_08.json"
PARSER = ROOT / "data" / "career-mapping" / "_parse_subject_options.py"
ROW_RE = re.compile(
    r"^\('([^']+)',\s*'([^']+)',\s*ARRAY\[(.*?)\],\s*"
    r"ARRAY\[(.*?)\],\s*'([^']+)',\s*ARRAY\[(.*?)\]\),?$"
)
ARRAY_ITEM_RE = re.compile(r"'((?:''|[^'])*)'")
ALLOWED_STREAMS = {"science", "commercial", "art", "technical"}
CORE_CODES = {"ENG", "MATH", "CIV"}


def load_parser():
    spec = importlib.util.spec_from_file_location("subject_parser", PARSER)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Cannot load parser: {PARSER}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def array_items(value: str) -> list[str]:
    return [item.replace("''", "'") for item in ARRAY_ITEM_RE.findall(value)]


def load_rows() -> list[dict]:
    rows = []
    for line in SEED.read_text(encoding="utf-8").splitlines():
        match = ROW_RE.match(line.strip())
        if not match:
            continue
        code, name, aliases, exam_types, category, streams = match.groups()
        effective_streams = set(array_items(streams))
        # These are the exact deterministic UPDATEs appended to the seed.
        if category == "technical" or code in CORE_CODES:
            effective_streams.add("technical")
        rows.append(
            {
                "code": code,
                "name": name,
                "aliases": array_items(aliases),
                "exam_types": set(array_items(exam_types)),
                "category": category,
                "stream_tags": effective_streams,
            }
        )
    return rows


def main() -> None:
    parser = load_parser()
    rows = load_rows()
    errors: list[str] = []
    codes = [row["code"] for row in rows]
    code_set = set(codes)
    if len(codes) != len(code_set):
        errors.append("catalogue contains duplicate subject codes")
    if code_set != set(parser.OLEVEL_CODES):
        errors.append(
            "catalogue/O'Level code mismatch: "
            f"missing={sorted(set(parser.OLEVEL_CODES) - code_set)}, "
            f"extra={sorted(code_set - set(parser.OLEVEL_CODES))}"
        )
    utme_catalogue = {
        row["code"] for row in rows if "utme" in row["exam_types"]
    }
    if utme_catalogue != set(parser.UTME_CODES):
        errors.append(
            "catalogue/UTME code mismatch: "
            f"missing={sorted(set(parser.UTME_CODES) - utme_catalogue)}, "
            f"extra={sorted(utme_catalogue - set(parser.UTME_CODES))}"
        )
    for row in rows:
        invalid = row["stream_tags"] - ALLOWED_STREAMS
        if invalid:
            errors.append(f"{row['code']} has invalid stream tags {sorted(invalid)}")
        if not row["stream_tags"]:
            errors.append(f"{row['code']} has no stream tag")
        if row["category"] == "technical" and "technical" not in row["stream_tags"]:
            errors.append(f"technical category row {row['code']} lacks technical tag")
        if not row["exam_types"] & {"utme", "olevel"}:
            errors.append(f"{row['code']} has no selectable exam layer")

    source = json.loads(SOURCE_AUDIT.read_text(encoding="utf-8"))
    if source.get("distinct_parser_codes") != len(code_set):
        errors.append(
            "original-PDF audit code count disagrees with catalogue: "
            f"audit={source.get('distinct_parser_codes')} catalogue={len(code_set)}"
        )

    counts = {
        exam: {
            stream: sum(
                exam in row["exam_types"] and stream in row["stream_tags"]
                for row in rows
            )
            for stream in sorted(ALLOWED_STREAMS)
        }
        for exam in ("olevel", "utme")
    }
    if errors:
        raise SystemExit("Subject catalogue stream audit failed:\n- " + "\n- ".join(errors))
    print(
        json.dumps(
            {
                "status": "passed",
                "catalogueCodes": len(code_set),
                "olevelCodes": len(parser.OLEVEL_CODES),
                "utmeCodes": len(parser.UTME_CODES),
                "streamCountsByExam": counts,
                "sourcePdfAuditDistinctCodes": source.get("distinct_parser_codes"),
                "technicalCategoryRows": sum(row["category"] == "technical" for row in rows),
            },
            indent=2,
            sort_keys=True,
        )
    )


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Build a read-only row-level queue for unresolved JAMB subject rules.

The queue uses the same input overlays, source corrections and parser helpers
as the production subject-option and typed-rule generators. It does not edit
catalogue, offering, CCMAS, or SQL seed files.
"""
from __future__ import annotations

import json
import os
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
DATA = ROOT / "data" / "career-mapping"
AUDIT = DATA / "_audit"
sys.path.insert(0, str(DATA))

from _parse_subject_options import (  # noqa: E402
    OLEVEL_CODES,
    UTME_CODES,
    olevel_parts_are_matchable,
    parse_olevel,
    parse_utme,
)
from _gen_subject_rule_records import (  # noqa: E402
    load_programmes,
    resolve_contextual_rules,
    source_rule,
)
from _parse_subject_options import source_variant_texts  # noqa: E402


def text(value):
    if isinstance(value, list):
        return "; ".join(str(part) for part in value if part)
    return str(value or "").strip()


def narrow_scope(parts, allowed_codes, source_codes):
    if not parts:
        return None
    codes = {part[1] for part in parts if part[0] == "required"}
    codes.update(
        code for part in parts if part[0] == "one_of" for code in part[2]
    )
    codes &= set(allowed_codes)
    if not codes or len(codes & set(source_codes)) / max(1, len(source_codes)) >= 0.70:
        return None
    return codes


def source_variant_records(report, name, layer):
    """Return all exact source-cell variants with their PDF/table locators."""
    records = []
    for row in report.get("rows", []):
        if row.get("jamb_name") != name or row.get("layer") != layer:
            continue
        for candidate in row.get("source_variants", []):
            variant = candidate.get("source_variant", {})
            source = variant.get("source", {}) or {}
            records.append({
                "status": variant.get("status"),
                "text": variant.get("text", ""),
                "source_file": source.get("source_file"),
                "pdf_page": source.get("pdf_page"),
                "table_row": source.get("table_row"),
                "course_cell": source.get("course_cell"),
                "inherited_from": variant.get("inherited_from"),
            })
    return records


def parser_review_rows(programmes, report):
    utme_text = {name: text(row.get("utme_subjects")) for name, row in programmes.items()}
    olevel_text = {name: text(row.get("olevel_requirement")) for name, row in programmes.items()}
    parsed, refs, olevel_rules, olevel_refs = {}, {}, {}, {}

    for name in programmes:
        if utme_text[name]:
            result = parse_utme(utme_text[name])
            if isinstance(result, tuple) and result[0] == "ref":
                refs[name] = result[1]
            elif result:
                parsed[name] = result
        if olevel_text[name]:
            result = parse_olevel(olevel_text[name])
            if result and olevel_parts_are_matchable(olevel_text[name], result):
                olevel_rules[name] = result
            import re
            same_as = re.match(
                r"^\s*(?:same\s+as\s+(?:in|for)|as\s+in)\s+([^(.]+?)(?:\s*\(|\s*$)",
                olevel_text[name], re.I,
            )
            if same_as:
                olevel_refs[name] = same_as.group(1).strip()

    by_lower = {name.lower(): name for name in programmes}
    for _ in range(2):
        for name, target in list(refs.items()):
            resolved = by_lower.get(target.lower())
            if resolved and resolved in parsed:
                parsed[name] = parsed[resolved]
                del refs[name]
        for name, target in list(olevel_refs.items()):
            resolved = by_lower.get(target.lower())
            if resolved and olevel_rules.get(resolved):
                olevel_rules[name] = olevel_rules[resolved]
                del olevel_refs[name]

    for name in sorted(programmes):
        if olevel_text[name] and not olevel_rules.get(name):
            context = narrow_scope(parsed.get(name), OLEVEL_CODES, UTME_CODES)
            if context:
                candidate = parse_olevel(olevel_text[name], context_codes=context)
                if candidate and olevel_parts_are_matchable(olevel_text[name], candidate):
                    olevel_rules[name] = candidate
        if utme_text[name] and not parsed.get(name):
            existing = olevel_rules.get(name)
            context = narrow_scope(
                existing[1] if existing else None, UTME_CODES, OLEVEL_CODES
            )
            if context:
                candidate = parse_utme(utme_text[name], context_codes=context)
                if candidate and not (isinstance(candidate, tuple) and candidate[0] == "ref"):
                    parsed[name] = candidate

    rows = []
    for name in sorted(programmes):
        failed = []
        if utme_text[name] and parsed.get(name) is None:
            failed.append({
                "exam_layer": "utme", "source_text": utme_text[name],
                "source_variants": source_variant_records(report, name, "utme"),
            })
        if olevel_text[name] and olevel_rules.get(name) is None:
            failed.append({
                "exam_layer": "olevel", "source_text": olevel_text[name],
                "source_variants": source_variant_records(report, name, "olevel"),
            })
        if failed:
            rows.append({"jamb_identity": name, "failed_layers": failed})
    return rows


def main():
    programmes = load_programmes()
    contextual = resolve_contextual_rules(programmes)
    report_path = AUDIT / "jamb_brochure_source_rules_2026-08-19.json"
    report = json.loads(report_path.read_text(encoding="utf-8")) if report_path.exists() else {}
    source_missing = []
    empty = []

    for name in sorted(programmes):
        p = programmes[name]
        if not text(p.get("utme_subjects")) and not text(p.get("olevel_requirement")):
            empty.append({"jamb_identity": name, "reason": "both UTME and O'Level source fields empty"})
        for layer, field in (("utme", "utme_subjects"), ("olevel", "olevel_requirement"), ("direct_entry", "direct_entry")):
            source_text = text(p.get(field))
            rule = source_rule(source_text, layer, contextual.get(name, {}).get(layer))
            variant_records = source_variant_records(report, name, layer)
            variants = [variant["text"] for variant in variant_records if variant.get("text")]
            if rule["rule_status"] in {"source_missing", "structured_source", "cross_reference"} and variants:
                candidate_rules = [source_rule(v, layer) for v in variants]
                if any(r["rule_status"] == "matchable" for r in candidate_rules):
                    continue
                rule["rule_json"]["sourceVariants"] = [r["rule_json"] for r in candidate_rules]
            if rule["rule_status"] == "source_missing":
                source_missing.append({
                    "jamb_identity": name,
                    "exam_layer": layer,
                    "rule_key": f"{name}|{layer}",
                    "status": rule["rule_status"],
                    "source_text": source_text,
                    "source_url": p.get("source_url") or "https://ibass.jamb.gov.ng/brochure-by-programme",
                    "source_variants": variant_records,
                })

    unresolved = parser_review_rows(programmes, report)
    payload = {
        "generated_on": date.today().isoformat(),
        "scope": "JAMB subject requirement parsing/catalogue only; not university offering occurrences or CCMAS",
        "source_queue": "jamb_brochure_source_rules_2026-08-19.json",
        "counts": {
            "parser_needs_review_identities": len(unresolved),
            "empty_requirement_identities": len(empty),
            "typed_source_missing_rule_rows": len(source_missing),
        },
        "parser_needs_review": unresolved,
        "empty_requirements": empty,
        "source_missing_rules": source_missing,
    }
    out = AUDIT / "jamb_subject_unresolved_subject_rule_queue_2026_10_02.json"
    out.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(out), "counts": payload["counts"]}, indent=2))


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Generate typed JAMB subject-rule records for every requirement layer.

The normal subject-option seed contains only rules that can safely drive the
subject matcher. This seed stores the complete source surface separately:
cross-references, conditions, direct-entry text, source variants, and blank
source cells are represented as typed JSON rather than guessed combinations.
"""

from __future__ import annotations

import glob
import json
import os
import re
import uuid
from collections import Counter

from _parse_subject_options import (
    OLEVEL_CODES,
    SUBJECT_CODES,
    SOURCE_RULES_PATH,
    SOURCE_URL,
    UTME_CODES,
    parse_olevel,
    olevel_parts_are_matchable,
    parse_utme,
    source_variant_texts,
    uid,
)

HERE = os.path.dirname(os.path.abspath(__file__))
DEST = os.path.abspath(os.path.join(HERE, "..", "..", "backend", "seed_subject_rule_records.sql"))


def q(value):
    if value is None:
        return "NULL"
    return "'" + str(value).replace("'", "''") + "'"


def as_text(value):
    if isinstance(value, list):
        return "; ".join(str(item) for item in value if item)
    return str(value or "").strip()


def load_programmes():
    programmes = {}
    for path in sorted(glob.glob(os.path.join(HERE, "jamb", "*_offerings.json"))):
        data = json.load(open(path, encoding="utf-8"))
        for programme in data.get("programmes", []):
            programmes.setdefault(programme["jamb_name"], programme)

    enrich = []
    for path in sorted(glob.glob(os.path.join(HERE, "jamb", "enrich", "*.json"))):
        if os.path.basename(path).startswith("_"):
            continue
        enrich.append(json.load(open(path, encoding="utf-8")))

    from _jamb_source_rules import (
        apply_brochure_subject_overrides,
        apply_enrich_requirement_overlays,
        apply_source_rules_to_programmes,
    )

    apply_enrich_requirement_overlays(programmes, enrich)
    overrides_path = os.path.join(HERE, "jamb", "brochure_subject_overrides.json")
    if os.path.exists(overrides_path):
        apply_brochure_subject_overrides(
            programmes, json.load(open(overrides_path, encoding="utf-8"))
        )
    apply_source_rules_to_programmes(programmes)
    return programmes


def parts_json(parts):
    groups = []
    required = []
    for part in parts or []:
        if part[0] == "required":
            required.append(part[1])
        else:
            groups.append(
                {
                    "type": "one_of",
                    "minimum": int(part[1]),
                    "subjects": list(part[2]),
                    "distinctGroup": part[3] if len(part) > 3 else None,
                }
            )
    return {"version": 1, "required": required, "groups": groups}


def subject_codes_in_text(text, allowed_codes):
    normalized = re.sub(r"[^a-z0-9]+", " ", (text or "").lower())
    found = set()
    for name, code in sorted(SUBJECT_CODES.items(), key=lambda item: len(item[0]), reverse=True):
        if code not in allowed_codes:
            continue
        pattern = r"(?<![a-z0-9])" + re.escape(name).replace(r"\ ", r"\s+") + r"(?![a-z0-9])"
        if re.search(pattern, normalized):
            found.add(code)
    return sorted(found)


def category_hints(text):
    lower = (text or "").lower()
    labels = []
    for label, pattern in (
        ("arts", r"\barts?\b"),
        ("social_science", r"\bsocial\s+sciences?\b"),
        ("science", r"\bsciences?\b"),
        ("commercial", r"\bcommercial\b"),
    ):
        if re.search(pattern, lower):
            labels.append(label)
    return labels


def resolve_contextual_rules(programmes):
    """Parse each national exam layer from its own source wording.

    UTME or O'Level wording cannot silently define the other layer's subject
    pool. Explicit brochure cross-references ("as in [programme]") are still
    resolved, while an unstated relevant/suitable pool remains non-matchable.
    """
    utme_text, olevel_text, utme_rules, olevel_rules = {}, {}, {}, {}
    utme_refs, olevel_refs = {}, {}
    for name, programme in programmes.items():
        utme = programme.get("utme_subjects")
        if isinstance(utme, list):
            utme = "; ".join(str(item) for item in utme)
        utme_text[name] = as_text(utme)
        olevel_text[name] = as_text(programme.get("olevel_requirement"))
        if utme_text[name]:
            parsed = parse_utme(utme_text[name])
            if isinstance(parsed, tuple) and parsed[0] == "ref":
                utme_refs[name] = parsed[1]
            elif parsed:
                utme_rules[name] = parsed
        if olevel_text[name]:
            olevel_rules[name] = parse_olevel(olevel_text[name])
            same_as = re.match(
                r"^\s*(?:same\s+as\s+(?:in|for)|as\s+in)\s+([^(.]+?)(?:\s*\(|\s*$)",
                olevel_text[name],
                re.I,
            )
            if same_as:
                olevel_refs[name] = same_as.group(1).strip()

    by_lower = {name.lower(): name for name in programmes}
    for _ in range(2):
        for name, target in list(utme_refs.items()):
            resolved_name = by_lower.get(target.lower())
            if resolved_name and resolved_name in utme_rules:
                utme_rules[name] = utme_rules[resolved_name]
                del utme_refs[name]
        for name, target in list(olevel_refs.items()):
            resolved_name = by_lower.get(target.lower())
            if resolved_name and olevel_rules.get(resolved_name):
                olevel_rules[name] = olevel_rules[resolved_name]
                del olevel_refs[name]

    return {
        name: {
            "utme": utme_rules.get(name),
            "olevel": olevel_rules.get(name),
        }
        for name in programmes
    }


def source_rule(text, exam_type, parsed_override=None):
    text = as_text(text)
    if exam_type == "direct_entry":
        return {
            "rule_status": "direct_entry",
            "rule_kind": "direct_entry",
            "rule_json": {"version": 1, "examType": exam_type, "raw": text},
        }
    allowed = OLEVEL_CODES if exam_type == "olevel" else None
    parsed = (
        parsed_override
        if parsed_override is not None
        else (parse_olevel(text) if exam_type == "olevel" else parse_utme(text))
    )
    if parsed and not (isinstance(parsed, tuple) and parsed[0] == "ref"):
        if exam_type == "olevel":
            minimum, parts = parsed
            if not olevel_parts_are_matchable(text, parsed):
                return {
                    "rule_status": "structured_source",
                    "rule_kind": "source_rule",
                    "rule_json": {
                        "version": 1,
                        "examType": exam_type,
                        "raw": text,
                        "explicitSubjectCodes": subject_codes_in_text(text, OLEVEL_CODES),
                        "categoryHints": category_hints(text),
                        "hasCondition": False,
                        "reason": "unresolved_olevel_scope",
                    },
                }
            return {
                "rule_status": "matchable",
                "rule_kind": "subject_combination",
                "rule_json": {**parts_json(parts), "examType": exam_type, "creditMinimum": minimum},
            }
        return {
            "rule_status": "matchable",
            "rule_kind": "subject_combination",
            "rule_json": {**parts_json(parsed), "examType": exam_type},
        }
    if parsed and isinstance(parsed, tuple) and parsed[0] == "ref":
        return {
            "rule_status": "cross_reference",
            "rule_kind": "cross_reference",
            "rule_json": {"version": 1, "examType": exam_type, "target": parsed[1]},
        }
    if not text:
        return {
            "rule_status": "source_missing",
            "rule_kind": "source_missing",
            "rule_json": {"version": 1, "examType": exam_type, "reason": "no_source_text"},
        }
    return {
        "rule_status": "structured_source",
        "rule_kind": "source_rule",
        "rule_json": {
            "version": 1,
            "examType": exam_type,
            "raw": text,
            "explicitSubjectCodes": subject_codes_in_text(text, allowed or set(SUBJECT_CODES.values())),
            "categoryHints": category_hints(text),
            "hasCondition": bool(re.search(r"\b(?:accepts?|requires?|sittings?|in lieu|except|varies?)\b", text, re.I)),
        },
    }


def source_rule_with_variants(text, exam_type, parsed_override=None, variants=()):
    """Choose a safe rule while distinguishing absent sources from unusable cells.

    Exact/inherited brochure text that cannot be represented by the matcher is
    still source evidence. Preserve it as ``structured_source`` rather than
    claiming that the source is missing. Only an empty primary cell with no
    usable source variants remains ``source_missing``.
    """
    primary = source_rule(text, exam_type, parsed_override)
    if not variants:
        return primary

    def variant_text(value):
        return value.get("text", "") if isinstance(value, dict) else str(value or "")

    def attach_variant_provenance(candidate, variant):
        # Keep source-cell provenance inside the typed record.  This is
        # evidence for an institution/programme offering, not national scope.
        enriched = json.loads(json.dumps(candidate))
        source = variant.get("source") if isinstance(variant, dict) else None
        enriched["rule_json"]["scope"] = "offering_variant"
        enriched["rule_json"]["sourceStatus"] = (
            variant.get("status") if isinstance(variant, dict) else "unknown"
        )
        if source:
            enriched["rule_json"]["sourceLocator"] = {
                key: source.get(key)
                for key in ("source_file", "pdf_page", "table_row", "course_cell")
                if source.get(key) is not None
            }
        inherited = variant.get("inherited_from") if isinstance(variant, dict) else None
        if inherited:
            enriched["rule_json"]["inheritedFrom"] = inherited
        continuation = variant.get("continuation_sources") if isinstance(variant, dict) else None
        if continuation:
            enriched["rule_json"]["continuationSources"] = continuation
        return enriched

    parsed_variants = [
        attach_variant_provenance(source_rule(variant_text(variant), exam_type), variant)
        for variant in variants
    ]
    variant_payloads = [candidate["rule_json"] for candidate in parsed_variants]
    if primary["rule_status"] == "matchable":
        primary["rule_json"]["sourceVariants"] = variant_payloads
        return primary

    if primary["rule_status"] not in {
        "source_missing", "structured_source", "cross_reference"
    }:
        return primary

    if primary["rule_status"] == "source_missing":
        return {
            "rule_status": "structured_source",
            "rule_kind": "source_variants",
            "rule_json": {
                "version": 1,
                "examType": exam_type,
                "reason": "source_variants_present_but_not_matchable",
                "sourceVariants": variant_payloads,
            },
        }

    # Source variants are individual brochure offering cells.  Even when a
    # cell is parseable, it is not a national rule and must not make an
    # otherwise blank/ambiguous national requirement executable.  Retain it
    # as evidence for the separate institution-scoped reconciliation pass.
    primary["rule_json"]["sourceVariants"] = variant_payloads
    primary["rule_kind"] = "source_variants"
    return primary


def main():
    programmes = load_programmes()
    contextual_rules = resolve_contextual_rules(programmes)
    report = json.load(open(SOURCE_RULES_PATH, encoding="utf-8")) if os.path.exists(SOURCE_RULES_PATH) else {}
    sql = [
        "-- AUTO-GENERATED by data/career-mapping/_gen_subject_rule_records.py — DO NOT EDIT",
        "SET search_path TO skillup_dev;",
        "BEGIN;",
        "DELETE FROM programme_subject_rule_records;",
    ]
    counts = Counter()
    for name in sorted(programmes):
        programme = programmes[name]
        for exam_type, field in (("utme", "utme_subjects"), ("olevel", "olevel_requirement"), ("direct_entry", "direct_entry")):
            text = as_text(programme.get(field))
            variants = source_variant_texts(report, name, exam_type)
            rule = source_rule_with_variants(
                text,
                exam_type,
                contextual_rules.get(name, {}).get(exam_type),
                variants,
            )
            rid = uid("psr", name)
            record_id = uid("subject_rule_record", name, exam_type)
            sql.append(
                "INSERT INTO programme_subject_rule_records "
                "(id, jamb_programme_id, requirement_id, exam_type, rule_status, rule_kind, rule_json, source_text, source_url) "
                f"SELECT {q(record_id)}, {q(uid('jamb', name))}, {q(rid)}, {q(exam_type)}, "
                f"{q(rule['rule_status'])}, {q(rule['rule_kind'])}, {q(json.dumps(rule['rule_json'], sort_keys=True))}::jsonb, "
                f"{q(text)}, {q(SOURCE_URL)} "
                f"WHERE EXISTS (SELECT 1 FROM jamb_programmes WHERE id = {q(uid('jamb', name))}) "
                "ON CONFLICT (jamb_programme_id, exam_type) DO UPDATE SET "
                "requirement_id=EXCLUDED.requirement_id, rule_status=EXCLUDED.rule_status, "
                "rule_kind=EXCLUDED.rule_kind, rule_json=EXCLUDED.rule_json, source_text=EXCLUDED.source_text, "
                "source_url=EXCLUDED.source_url, updated_at=NOW();"
            )
            counts[rule["rule_status"]] += 1
    sql.extend(["COMMIT;", ""])
    open(DEST, "w", encoding="utf-8").write("\n".join(sql))
    print(f"programme layers: {sum(counts.values())}")
    for key in ("matchable", "structured_source", "cross_reference", "direct_entry", "source_missing"):
        print(f"  {key}: {counts[key]}")
    print(f"-> {DEST}")


if __name__ == "__main__":
    main()

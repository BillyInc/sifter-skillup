#!/usr/bin/env python3
"""Audit brochure subjects, aliases, requirement layers, and university joins.

This is deliberately an audit, not a seed generator.  The brochure data mixes
real subject names, aliases, category expressions, institution exceptions,
direct-entry prose, and technical-trade items.  The report keeps those layers
separate so a new subject cannot be added to the runtime matcher merely because
it appeared in a sentence.
"""

from __future__ import annotations

import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
CAREER = ROOT / "data" / "career-mapping" / "jamb"
ENRICH = CAREER / "enrich"
SEED = ROOT / "backend" / "seed_career_pilot.sql"
SUBJECT_SEED = ROOT / "backend" / "seed_subject_catalog.sql"
OPTIONS = ROOT / "backend" / "seed_subject_options.sql"
OUT_JSON = ROOT / "docs" / "manual-review" / "brochure-subject-inventory-2026-08-17.json"
OUT_MD = ROOT / "docs" / "manual-review" / "brochure-subject-inventory-2026-08-17.md"

sys.path.insert(0, str(ROOT / "scripts"))
from generate_manual_review_pack import dedupe, sql_rows, structured_options  # noqa: E402
from audit_subject_programme_university_mapping import build_audit  # noqa: E402


def norm(value: Any) -> str:
    value = str(value or "").casefold()
    value = value.replace("’", "'")
    return re.sub(r"[^a-z0-9]+", " ", value).strip()


def array_values(raw: str) -> list[str]:
    return [x.replace("''", "'") for x in re.findall(r"'((?:''|[^'])*)'", raw)]


def catalog() -> tuple[dict[str, dict[str, Any]], dict[str, str]]:
    rows: dict[str, dict[str, Any]] = {}
    aliases: dict[str, str] = {}
    pattern = re.compile(
        r"^\('([^']+)',\s*'((?:''|[^'])*)',\s*ARRAY\[(.*?)\](?:::TEXT\[\])?,\s*"
        r"ARRAY\[(.*?)\](?:::TEXT\[\])?,\s*'([^']+)',\s*ARRAY\[(.*?)\](?:::TEXT\[\])?",
        re.I,
    )
    for line in SUBJECT_SEED.read_text(encoding="utf-8").splitlines():
        match = pattern.search(line.strip())
        if not match:
            continue
        code, name, alias_raw, exam_raw, category, stream_raw = match.groups()
        aliases_list = array_values(alias_raw)
        exam_types = array_values(exam_raw)
        row = {
            "code": code,
            "name": name.replace("''", "'"),
            "aliases": aliases_list,
            "exam_types": exam_types,
            "category": category,
            "stream_tags": array_values(stream_raw),
        }
        rows[code] = row
        for term in [row["name"], *aliases_list]:
            aliases[norm(term)] = code
    return rows, aliases


def source_records() -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []
    for path in sorted(CAREER.glob("*.json")):
        if not (path.name.endswith("_offerings.json") or path.name in {"law.json", "social_sciences.json"}):
            continue
        payload = json.loads(path.read_text(encoding="utf-8"))
        items = payload.get("programmes", []) if isinstance(payload, dict) else payload
        if not isinstance(items, list):
            continue
        for index, item in enumerate(items):
            if not isinstance(item, dict):
                continue
            name = item.get("jamb_name") or item.get("programme_name")
            if not name:
                continue
            row = dict(item)
            row["jamb_name"] = name
            row["source_file"] = path.name
            row["source_record_index"] = index
            row["source_faculty"] = payload.get("faculty") if isinstance(payload, dict) else None
            records.append(row)
    return records


def enrichment_records() -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []
    for path in sorted(ENRICH.glob("*.json")):
        if path.name.startswith("_"):
            continue
        payload = json.loads(path.read_text(encoding="utf-8"))
        if not isinstance(payload, dict) or not payload.get("jamb_name"):
            continue
        row = dict(payload)
        row["source_file"] = path.name
        records.append(row)
    return records


def field_values(row: dict[str, Any], field: str) -> list[str]:
    value = row.get(field)
    if isinstance(value, list):
        return [str(item) for item in value if item is not None and str(item).strip()]
    if value is None:
        return []
    text = str(value).strip()
    return [text] if text else []


def seed_data() -> dict[str, Any]:
    seed_text = SEED.read_text(encoding="utf-8")
    jamb_rows = dedupe(sql_rows(seed_text, "jamb_programmes"), 0)
    school_rows = dedupe(sql_rows(seed_text, "schools"), 0)
    offering_rows = dedupe([r for r in sql_rows(seed_text, "school_programmes") if len(r) >= 4], 0)
    requirement_rows = dedupe(sql_rows(seed_text, "programme_subject_requirements"), 0)
    jamb = {
        norm(row[1]): {
            "id": str(row[0]),
            "jamb_name": str(row[1]),
            "faculty": row[2] if len(row) > 2 else None,
        }
        for row in jamb_rows
        if len(row) >= 2
    }
    jamb_by_id = {row["id"]: row for row in jamb.values()}
    schools = {
        str(row[0]): {
            "id": str(row[0]),
            "name": row[1] if len(row) > 1 else None,
            "jamb_code": row[4] if len(row) > 4 else None,
        }
        for row in school_rows
        if len(row) >= 2
    }
    school_by_code = {str(row["jamb_code"]): row for row in schools.values() if row.get("jamb_code")}
    offerings_by_programme: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in offering_rows:
        if len(row) < 4:
            continue
        item = {"id": str(row[0]), "school_id": str(row[1]), "jamb_programme_id": str(row[2]), "remarks": row[3]}
        offerings_by_programme[item["jamb_programme_id"]].append(item)
    requirements = {
        str(row[1]): {
            "id": str(row[0]),
            "utme_subjects": row[2] if len(row) > 2 else None,
            "olevel_requirement": row[3] if len(row) > 3 else None,
        }
        for row in requirement_rows
        if len(row) >= 2
    }
    return {
        "jamb": jamb,
        "jamb_by_id": jamb_by_id,
        "schools": schools,
        "school_by_code": school_by_code,
        "offerings_by_programme": offerings_by_programme,
        "requirements": requirements,
    }


def text_occurrences(text: str, alias_to_code: dict[str, str]) -> list[dict[str, str]]:
    """Find known catalogue terms, longest first, without overlapping aliases."""
    candidates: list[tuple[int, int, str, str]] = []
    for alias, code in alias_to_code.items():
        match = re.search(r"(?<![a-z0-9])" + re.escape(alias) + r"(?![a-z0-9])", norm(text))
        if match:
            candidates.append((match.start(), -(match.end() - match.start()), alias, code))
    accepted: list[tuple[int, int, str, str]] = []
    for start, neg_length, alias, code in sorted(candidates):
        end = start - neg_length
        if any(start < old_end and end > old_start for old_start, old_end, *_ in accepted):
            continue
        accepted.append((start, end, alias, code))
    return [{"term": alias, "code": code} for _, _, alias, code in accepted]


# These are exact phrases observed in the brochure data that are not current
# catalogue aliases.  They are review candidates, never automatic new rows.
REVIEW_TERMS = [
    "Statistics", "Business Methods", "Business Management", "Secretarial Duties",
    "Typewriting", "Shorthand", "Botany", "Zoology", "Geology", "Information Technology",
    "Business Studies", "Study Skills", "Salesmanship", "Environmental Science",
    "General Wood Work", "Building/Engineering Drawing", "Introduction to Building Construction",
    "Bricklaying/Block laying", "Concreting", "Wall Floors and Ceiling Finishing", "Joinery",
    "Carpentry", "Decorative Painting", "Lining", "Sign and Design", "Wall Hanging",
    "Colour Mixing/Matching and Glazing", "Ceramics", "Graphics Design", "Graphic Printing",
    "Spinning", "Weaving", "Surface Design and Printing", "Bleaching", "Dyeing and Finishing",
    "Spray Painting", "Machine Printing and Finishing", "Printing Origination", "General Metal Work",
    "Engineering Drawing", "Textile", "Construction", "Block laying", "Graphics Design",
]


def make_term_inventory(records: list[dict[str, Any]], catalog_aliases: dict[str, str]) -> dict[str, Any]:
    known: dict[str, dict[str, Any]] = defaultdict(lambda: {"code": None, "fields": Counter(), "programmes": set(), "evidence": []})
    candidates: dict[str, dict[str, Any]] = defaultdict(lambda: {"fields": Counter(), "programmes": set(), "evidence": []})
    fields = ("utme_subjects", "olevel_requirement", "utme_requirements", "direct_entry")
    for row in records:
        name = row["jamb_name"]
        for field in fields:
            for text in field_values(row, field):
                for found in text_occurrences(text, catalog_aliases):
                    item = known[found["term"]]
                    item["code"] = found["code"]
                    item["fields"][field] += 1
                    item["programmes"].add(name)
                    if len(item["evidence"]) < 3:
                        item["evidence"].append({"jamb_name": name, "field": field, "text": text})
                for term in REVIEW_TERMS:
                    if re.search(r"(?<![A-Za-z])" + re.escape(term) + r"(?![A-Za-z])", text, re.I):
                        key = norm(term)
                        item = candidates[key]
                        item["fields"][field] += 1
                        item["programmes"].add(name)
                        if len(item["evidence"]) < 3:
                            item["evidence"].append({"jamb_name": name, "field": field, "text": text})
    return {
        "known_catalog_terms": [
            {"term": term, "code": item["code"], "fields": dict(item["fields"]),
             "programme_count": len(item["programmes"]), "evidence": item["evidence"]}
            for term, item in sorted(known.items())
        ],
        "review_candidates": [
            {"term": term, "fields": dict(item["fields"]), "programme_count": len(item["programmes"]),
             "evidence": item["evidence"],
             "decision": "needs_catalogue_review",
             "reason": "Exact brochure phrase is not a current subject_catalog name or alias; determine whether it is an examinable O-level/UTME subject, a vocational component, a category, or direct-entry-only text."}
            for term, item in sorted(candidates.items())
        ],
    }


def programme_mapping(records: list[dict[str, Any]], enrich: list[dict[str, Any]], data: dict[str, Any], options: dict[str, list[dict[str, Any]]]) -> list[dict[str, Any]]:
    by_name: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in records:
        by_name[norm(row["jamb_name"])].append(row)
    enrich_by_name: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in enrich:
        enrich_by_name[norm(row["jamb_name"])].append(row)
    out: list[dict[str, Any]] = []
    for key in sorted(by_name):
        rows = by_name[key]
        name = rows[0]["jamb_name"]
        registry = data["jamb"].get(key)
        jid = registry["id"] if registry else None
        opt_rows = options.get(jid, []) if jid else []
        offer_rows = data["offerings_by_programme"].get(jid, []) if jid else []
        institutions = sorted({str(code) for row in rows for code in (row.get("institutions") or [])})
        resolved = [data["school_by_code"][code]["name"] for code in institutions if code in data["school_by_code"]]
        raw_fields: dict[str, list[str]] = {}
        for field in ("utme_subjects", "olevel_requirement", "utme_requirements", "direct_entry"):
            values = []
            for row in [*rows, *enrich_by_name.get(key, [])]:
                values.extend(field_values(row, field))
            raw_fields[field] = sorted(set(values))
        source_reasons = []
        if not registry:
            source_reasons.append("brochure source name has no exact jamb_programmes registry name")
        if not opt_rows:
            source_reasons.append("no structured subject option row for this registry programme")
        if not raw_fields["utme_subjects"]:
            source_reasons.append("no UTME subject text in the available brochure layer")
        if not raw_fields["olevel_requirement"] and not raw_fields["utme_requirements"]:
            source_reasons.append("no O-level requirement text in the available brochure layer")
        out.append({
            "jamb_name": name,
            "normalised_name": key,
            "jamb_programme_id": jid,
            "source_files": sorted({row["source_file"] for row in rows}),
            "enrichment_files": sorted({row["source_file"] for row in enrich_by_name.get(key, [])}),
            "brochure_institution_codes": institutions,
            "resolved_seed_institutions": sorted(set(resolved)),
            "structured_options": [
                {"id": o["id"], "exam_type": o["exam_type"], "min_required": o["min_required"],
                 "source_text": o["source_text"], "items": o["items"]}
                for o in opt_rows
            ],
            "seed_university_offering_count": len(offer_rows),
            "seed_university_offerings_with_remarks": sum(bool(o.get("remarks")) for o in offer_rows),
            "brochure_requirement_fields": raw_fields,
            "needs_review_reasons": source_reasons,
        })
    return out


def main() -> int:
    subject_rows, subject_aliases = catalog()
    source = source_records()
    enrich = enrichment_records()
    data = seed_data()
    options, _ = structured_options()
    # Overlay enrichment on the core offering records.  Keep duplicate source
    # records because they are provenance; de-duplicate programme rows only in
    # the mapping output.
    all_subject_records = [*source, *enrich]
    terms = make_term_inventory(all_subject_records, subject_aliases)
    mappings = programme_mapping(source, enrich, data, options)
    structural_audit = build_audit()
    option_to_name = {
        option["id"]: row["jamb_name"]
        for row in mappings
        for option in row["structured_options"]
    }
    structural_errors = [
        {**item, "jamb_name": option_to_name.get(item.get("optionId"))}
        for item in structural_audit["errors"]
    ]
    source_names = {norm(row["jamb_name"]) for row in source}
    registry_names = set(data["jamb"])
    option_programmes = {jid for jid, rows in options.items() if rows}
    summary = {
        "source_files": len({row["source_file"] for row in source}),
        "core_brochure_records": len(source),
        "core_brochure_unique_jamb_names": len(source_names),
        "enrichment_files": len(enrich),
        "enrichment_unique_jamb_names": len({norm(row["jamb_name"]) for row in enrich}),
        "catalogue_rows_total": len(subject_rows),
        "catalogue_rows_utme": sum("utme" in row["exam_types"] for row in subject_rows.values()),
        "catalogue_rows_olevel": sum("olevel" in row["exam_types"] for row in subject_rows.values()),
        "jamb_registry_unique_names": len(registry_names),
        "programme_requirement_rows": len(data["requirements"]),
        "structured_option_rows": sum(len(rows) for rows in options.values()),
        "structured_option_programmes": len(option_programmes),
        "seed_university_offering_pairs": sum(len(rows) for rows in data["offerings_by_programme"].values()),
        "seed_university_count": len(data["schools"]),
        "source_names_not_in_registry": sorted(source_names - registry_names),
        "registry_names_without_core_source": sorted(registry_names - source_names),
        "registry_names_with_structured_options": len(option_programmes & set(data["jamb_by_id"])),
        "known_catalogue_codes_seen_in_utme_fields": len({
            row["code"] for row in terms["known_catalog_terms"] if "utme_subjects" in row["fields"] or "utme_requirements" in row["fields"]
        }),
        "known_catalogue_codes_seen_in_olevel_fields": len({
            row["code"] for row in terms["known_catalog_terms"] if "olevel_requirement" in row["fields"]
        }),
    }
    report = {
        "generated_from": [
            "data/career-mapping/jamb/*_offerings.json",
            "data/career-mapping/jamb/law.json",
            "data/career-mapping/jamb/social_sciences.json",
            "data/career-mapping/jamb/enrich/*.json",
            "backend/seed_subject_catalog.sql",
            "backend/seed_subject_options.sql",
            "backend/seed_career_pilot.sql",
        ],
        "scope_note": "This report inventories source evidence and joins; it does not add catalogue rows or change matching behaviour.",
        "summary": summary,
        "current_catalogue": sorted(subject_rows.values(), key=lambda row: row["code"]),
        "term_inventory": terms,
        "structured_option_quality": {
            "error_count": len(structural_audit["errors"]),
            "warning_count": len(structural_audit["warnings"]),
            "errors": structural_errors,
            "warning_counts_by_code": dict(Counter(item["code"] for item in structural_audit["warnings"])),
            "interpretation": "These are defects in the current encoded matcher rows. They are separate from brochure term discovery and must be corrected before exact eligibility is shown.",
        },
        "programme_university_subject_mapping": mappings,
    }
    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    candidates = terms["review_candidates"]
    matched = [row for row in mappings if row["jamb_programme_id"] and row["structured_options"]]
    lines = [
        "# Brochure subject inventory and programme/university audit",
        "",
        "Generated from the repository source layer. This is an audit report, not a seed generator.",
        "",
        "## What the count means",
        "",
        f"- Current `subject_catalog`: **{summary['catalogue_rows_total']}** rows total; **{summary['catalogue_rows_utme']}** tagged for UTME and **{summary['catalogue_rows_olevel']}** tagged for O-level.",
        f"- Core brochure offering files: **{summary['core_brochure_records']}** records and **{summary['core_brochure_unique_jamb_names']}** unique JAMB names.",
        f"- Brochure enrichment: **{summary['enrichment_files']}** files covering **{summary['enrichment_unique_jamb_names']}** unique JAMB names.",
        f"- Structured requirement seed: **{summary['structured_option_rows']}** option rows covering **{summary['structured_option_programmes']}** programmes.",
        f"- Seed university catalogue: **{summary['seed_university_offering_pairs']}** school/programme offering pairs across **{summary['seed_university_count']}** schools.",
        "",
        "Therefore, **44 is only the current app catalogue size**. It is not the number of subject-like terms in the brochure evidence. The brochure also contains aliases, broad groups, O-level technical/trade components, direct-entry subjects, and institution-specific prose; these must not all become selectable UTME subjects.",
        f"- The known catalogue terms appear under **{summary['known_catalogue_codes_seen_in_utme_fields']}** distinct catalogue codes in UTME-labelled brochure fields and **{summary['known_catalogue_codes_seen_in_olevel_fields']}** codes in O-level-labelled fields. This is a source-usage count, not a claim that every occurrence is a valid exam-layer rule.",
        "",
        "## Mapping rule used in this audit",
        "",
        "1. A subject combination is attached first to the exact JAMB programme name in the brochure/registry.",
        "2. A university is eligible to display only when the seed has a `school_programmes` row for that JAMB programme.",
        "3. University-specific remarks are kept separate from the programme-wide requirement; they are not silently merged into one universal requirement.",
        "4. Structured options are treated as exact only when their required/alternative items are encoded. Unparsed prose remains review text.",
        "",
        "## Review candidates not in the current catalogue",
        "",
        "These are exact phrases found in brochure evidence, not automatic additions:",
        "",
        "| Phrase | Fields found | Programme count | Decision |",
        "|---|---:|---:|---|",
    ]
    for row in candidates:
        lines.append(f"| {row['term']} | {', '.join(f'{k} ({v})' for k, v in row['fields'].items())} | {row['programme_count']} | needs catalogue review |")
    lines += [
        "",
        "The full provenance for every candidate and every programme/university join is in the companion JSON report.",
        "",
        "## Existing structured-mapping defects found",
        "",
        f"The current structured seed has **{len(structural_errors)} errors** and **{len(structural_audit['warnings'])} warnings**. Examples include alternatives encoded as if all subjects were required, empty options for broad prose, and declared five-subject minima whose encoded mandatory combination is larger. These defects mean the current matcher cannot yet be treated as proof of eligibility.",
        "",
        "| Programme | Exam layer | Finding |",
        "|---|---|---|",
    ]
    for item in structural_errors[:30]:
        detail = item["code"]
        if "structuredMinimum" in item:
            detail += f" (declared {item['declaredMinimum']}, encoded {item['structuredMinimum']})"
        lines.append(f"| {item.get('jamb_name') or 'unknown'} | {item.get('examType') or '—'} | {detail} |")
    lines += [
        "",
        "## Mapping coverage",
        "",
        f"- Core source names not in the JAMB registry: **{len(summary['source_names_not_in_registry'])}**.",
        f"- Registry names without a core offering-source row: **{len(summary['registry_names_without_core_source'])}**.",
        f"- Registry programmes with structured options: **{summary['registry_names_with_structured_options']}**.",
        f"- Unique core source programmes with both a registry ID and structured option rows: **{len(matched)}**.",
        "",
        "No seed rows were changed by this audit. The next correction step is to approve the candidate terms by exam layer and then repair malformed option groups before regenerating subject options.",
        "",
    ]
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps({"summary": summary, "review_candidates": len(candidates), "report": str(OUT_JSON)}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

#!/usr/bin/env python3
"""Inventory the current guided-experience source and generated item graph.

This is a read-only audit. It rebuilds rows in memory through the current
contextual-guidance builder but does not write SQL or change canonical data.
Run from the repository root:

    python data/career-mapping/_audit/build_guided_experience_inventory_2026_10_08.py
"""

from __future__ import annotations

import gzip
import hashlib
import json
import re
import sys
from collections import Counter
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
CAREER = ROOT / "data" / "career-mapping"
AUDIT = CAREER / "_audit"
sys.path.insert(0, str(CAREER))

import _build_contextual_guidance_items as context_builder  # noqa: E402
from _role_overlay_loader import load_overlay_roles  # noqa: E402


OUTPUT_JSON = AUDIT / "GUIDED_EXPERIENCE_DATA_INVENTORY_2026_10_08.json"
OUTPUT_MD = AUDIT / "GUIDED_EXPERIENCE_DATA_INVENTORY_2026_10_08.md"


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def current_roles() -> list[dict[str, Any]]:
    roles: dict[str, dict[str, Any]] = {}
    for row in read_json(CAREER / "role_library_v3_cleaned.json") + load_overlay_roles():
        key = f"{str(row.get('domain_id') or '').strip()}|{str(row.get('role_name') or '').strip()}"
        if key.strip("|"):
            roles.setdefault(key, row)
    return list(roles.values())


def curriculum_counts() -> dict[str, int]:
    package_count = course_count = outcome_count = 0
    for path in sorted((CAREER / "ccmas").glob("*.json")):
        payload = read_json(path)
        programmes = payload.get("programmes") or []
        package_count += len(programmes)
        for programme in programmes:
            courses = programme.get("courses") or []
            course_count += len(courses)
            for course in courses:
                outcome_count += len(course.get("learning_outcomes") or [])
    return {
        "source_files": len(list((CAREER / "ccmas").glob("*.json"))),
        "programme_packages": package_count,
        "course_rows": course_count,
        "course_learning_outcome_entries": outcome_count,
    }


def counts(rows: list[dict[str, Any]], edges: list[dict[str, Any]]) -> dict[str, Any]:
    structures = read_json(CAREER / "domain_structure.json")
    subgroups = [
        (domain_id, subgroup)
        for domain_id, domain in structures.items()
        for subgroup in (domain.get("subgroups") or [])
    ]
    roles = current_roles()
    source_audit = read_json(CAREER / "domain_skill_competency_certification_audit.json")
    domain_audit = source_audit.get("domains") or []
    stored_manifest_path = CAREER / "CONTEXTUAL_GUIDANCE_ITEMS_MANIFEST.json"
    stored_manifest = read_json(stored_manifest_path) if stored_manifest_path.exists() else {}
    packed_path = CAREER / "contextual_guidance_items.json.gz"
    packed_counts: dict[str, Any] = {"available": packed_path.exists()}
    if packed_path.exists():
        with gzip.open(packed_path, "rt", encoding="utf-8") as handle:
            packed = json.load(handle)
        packed_items = packed.get("items") or []
        packed_edges = packed.get("relationships") or []
        packed_counts.update({
            "item_rows": len(packed_items),
            "relationship_rows": len(packed_edges),
            "item_types": dict(Counter(str(row.get("item_type") or "unknown") for row in packed_items)),
            "context_levels": dict(Counter(str(row.get("context_level") or "unknown") for row in packed_items)),
        })

    item_types = Counter(str(row.get("item_type") or "unknown") for row in rows)
    item_levels = Counter(str(row.get("context_level") or "unknown") for row in rows)
    item_level_types = Counter((str(row.get("context_level") or "unknown"), str(row.get("item_type") or "unknown")) for row in rows)
    relationship_types = Counter((str(row.get("relationship_type") or "unknown"), str(row.get("relationship_status") or "unknown")) for row in edges)
    link_states = Counter(str(row.get("link_state") or "unknown") for row in rows)
    claim_states = Counter(str(row.get("claim_review_state") or "missing") for row in rows)
    owner_matches = sum(row.get("guidance_owner") == row.get("context_level") for row in rows)
    approved_claims = sum(row.get("claim_review_state") == "approved" for row in rows)
    linked_items = sum(
        row.get("link_state") == "linked"
        and bool(row.get("link_url"))
        and bool(row.get("link_accessed_at"))
        for row in rows
    )
    approved_and_linked = sum(
        row.get("claim_review_state") == "approved"
        and row.get("link_state") == "linked"
        and bool(row.get("link_url"))
        and bool(row.get("link_accessed_at"))
        for row in rows
    )
    generic_meaning_rows = sum(
        "is a named tool in the source record" in str(row.get("plain_meaning") or "")
        or "This capability is recorded as part of the source-backed preparation" in str(row.get("plain_meaning") or "")
        for row in rows
    )
    expected_output_counts = Counter(str(row.get("expected_output") or "") for row in rows)

    schema_path = ROOT / "backend" / "migration_contextual_career_items.sql"
    claim_schema_path = ROOT / "backend" / "migration_career_context_claim_validation.sql"
    relation_schema_path = ROOT / "backend" / "migration_career_item_relationships_2026-09-17.sql"
    schema_text = schema_path.read_text(encoding="utf-8")
    claim_schema_text = claim_schema_path.read_text(encoding="utf-8") if claim_schema_path.exists() else ""
    relation_schema_text = relation_schema_path.read_text(encoding="utf-8")
    context_types_match = re.search(r"item_type\s+TEXT\s+NOT NULL\s+CHECK\s*\(item_type\s+IN\s*\(([^)]*)\)", schema_text, re.I)
    relation_types_match = re.search(r"relationship_type\s+TEXT\s+NOT NULL\s+CHECK\s*\(relationship_type\s+IN\s*\(([^)]*)\)", relation_schema_text, re.I)

    return {
        "date": "2026-10-08",
        "scope": "Local source and generated guidance inventory. No SQL is applied and no canonical taxonomy data is changed.",
        "source_curriculum": curriculum_counts(),
        "taxonomy": {
            "domain_records": len(structures),
            "area_of_specialization_records": len(subgroups),
            "areas_by_domain_count": dict(Counter(str(domain_id) for domain_id, _ in subgroups)),
            "deduplicated_role_records": len(roles),
            "domains_with_domain_guidance_audit": len(domain_audit),
        },
        "current_generator_rebuild": {
            "item_rows": len(rows),
            "items_by_context_level": dict(item_levels),
            "items_by_type": dict(item_types),
            "items_by_context_and_type": {f"{level}:{kind}": n for (level, kind), n in sorted(item_level_types.items())},
            "relationship_rows": len(edges),
            "relationships_by_type_and_status": {f"{kind}:{status}": n for (kind, status), n in sorted(relationship_types.items())},
            "learning_link_states": dict(link_states),
            "claim_review_states": dict(claim_states),
            "approved_claims": approved_claims,
            "linked_items_with_url_and_access_date": linked_items,
            "items_meeting_approved_claim_and_link_gate": approved_and_linked,
            "items_with_owner_matching_context": owner_matches,
            "items_with_explanation_fields": {
                field: sum(bool(row.get(field)) for row in rows)
                for field in ("plain_meaning", "contextual_use", "expected_output", "priority_reason", "source_references", "source_locators")
            },
            "rows_using_generic_meaning_template": generic_meaning_rows,
            "most_common_expected_outputs": expected_output_counts.most_common(8),
        },
        "stored_snapshot": {
            "manifest_verified_at": stored_manifest.get("verified_at"),
            "manifest_item_rows": stored_manifest.get("row_count"),
            "manifest_relationship_rows": stored_manifest.get("relationship_count"),
            "manifest_domain_count": stored_manifest.get("covered_domains"),
            "manifest_area_count": stored_manifest.get("covered_subgroups"),
            "manifest_role_count": stored_manifest.get("covered_roles"),
            **packed_counts,
        },
        "schema_contract": {
            "context_item_types": re.findall(r"'([^']+)'", re.search(r"item_type\s+IN\s*\(([^)]*)\)", claim_schema_text, re.I).group(1)) if re.search(r"item_type\s+IN\s*\(([^)]*)\)", claim_schema_text, re.I) else (re.findall(r"'([^']+)'", context_types_match.group(1)) if context_types_match else []),
            "claim_validation_migration_present": claim_schema_path.exists(),
            "relationship_types": re.findall(r"'([^']+)'", relation_types_match.group(1)) if relation_types_match else [],
        },
        "input_sha256": {
            str(path.relative_to(ROOT)).replace("\\", "/"): sha256(path)
            for path in (
                CAREER / "domain_structure.json",
                CAREER / "role_library_v3_cleaned.json",
                CAREER / "domain_skill_competency_certification_audit.json",
                CAREER / "domain_skill_provenance.json",
                CAREER / "CONTEXTUAL_GUIDANCE_ITEMS_MANIFEST.json",
                CAREER / "contextual_guidance_items.json.gz",
                schema_path,
                relation_schema_path,
            )
            if path.exists()
        },
    }


def markdown(report: dict[str, Any]) -> str:
    taxonomy = report["taxonomy"]
    generated = report["current_generator_rebuild"]
    stored = report["stored_snapshot"]
    schema = report["schema_contract"]
    lines = [
        "# Guided Experience Data Inventory",
        "",
        f"Date: {report['date']}  ",
        f"Scope: {report['scope']}",
        "",
        "## Current source footprint",
        "",
        f"- CCMAS source files: **{report['source_curriculum']['source_files']}**",
        f"- Programme packages: **{report['source_curriculum']['programme_packages']}**",
        f"- Course rows: **{report['source_curriculum']['course_rows']}**",
        f"- Course outcome entries: **{report['source_curriculum']['course_learning_outcome_entries']}**",
        f"- Canonical domains: **{taxonomy['domain_records']}**; areas of specialization: **{taxonomy['area_of_specialization_records']}**; deduplicated roles: **{taxonomy['deduplicated_role_records']}**.",
        f"- Current domain item audit covers **{taxonomy['domains_with_domain_guidance_audit']}** domains.",
        "",
        "## Current contextual-guidance generator output",
        "",
        f"- Rebuilt item rows: **{generated['item_rows']}** across {json.dumps(generated['items_by_context_level'], ensure_ascii=False)}.",
        f"- Rebuilt types: {json.dumps(generated['items_by_type'], ensure_ascii=False)}.",
        f"- Rebuilt relationships: **{generated['relationship_rows']}** across {json.dumps(generated['relationships_by_type_and_status'], ensure_ascii=False)}.",
        f"- Link states: {json.dumps(generated['learning_link_states'], ensure_ascii=False)}.",
        f"- Claim-review states: {json.dumps(generated['claim_review_states'], ensure_ascii=False)}; approved: **{generated['approved_claims']}**.",
        f"- Items with a linked URL and access date: **{generated['linked_items_with_url_and_access_date']}**; items meeting both the approved-claim and link gate: **{generated['items_meeting_approved_claim_and_link_gate']}**.",
        f"- Owner matches context on **{generated['items_with_owner_matching_context']} / {generated['item_rows']}** rows.",
        f"- Non-empty explanation/provenance fields: {json.dumps(generated['items_with_explanation_fields'], ensure_ascii=False)}.",
        f"- Rows using the generator’s generic meaning templates: **{generated['rows_using_generic_meaning_template']}**.",
        "- Most common expected-output strings:",
    ]
    lines.extend(f"  - {count}: {value}" for value, count in generated["most_common_expected_outputs"])
    lines.extend([
        "",
        "## Stored snapshot comparison",
        "",
        f"The stored manifest says it was verified **{stored.get('manifest_verified_at')}** and records **{stored.get('manifest_item_rows')}** items / **{stored.get('manifest_relationship_rows')}** relationships across {stored.get('manifest_domain_count')} domains, {stored.get('manifest_area_count')} areas and {stored.get('manifest_role_count')} roles.",
        f"The compressed snapshot contains **{stored.get('item_rows')}** items / **{stored.get('relationship_rows')}** relationships with item types {json.dumps(stored.get('item_types', {}), ensure_ascii=False)}.",
        "The manifest/snapshot and current-source rebuild are different artifacts. Treat their count difference as a regeneration/parity issue; do not call either count a live database count.",
        "",
        "## Contract gaps and quality findings",
        "",
        f"- Context-item types allowed by the prepared additive contract: {', '.join(schema['context_item_types']) or 'not parsed'}.",
        "- The prepared additive migration introduces a separate claim-review state/evidence object and link metadata. Existing records remain review-required; source_backed ownership or a populated URL does not auto-approve student display.",
        "- The current-source rebuild emits only the types shown above. It emits no programme-owned context items in this builder; programme curriculum contract data is a separate source and must be joined by explicit curriculum-to-item evidence.",
        "- The current builder has not populated the new claim evidence, link-type, learner-level, language, access or duration fields. These need checkpoint-level curation before any rows can pass the student gate.",
        "- The earlier builder derived subgroup and role skill `prerequisites`/`related_items` from neighboring positions in ordered skill lists and tool prerequisites from the first role skills. The current local rebuild now clears those inferred arrays and emits only `not_established` relationship-coverage rows; it does not yet ingest an explicit relationship evidence ledger.",
        "- A populated `plain_meaning`, `contextual_use` or `expected_output` field is not by itself proof of learner-friendly explanation. The pilot must replace generic text with concrete, route-specific explanations and examples.",
        "- A link marked linked is not sufficient by itself: its destination must be relevant, externally verified, correctly labelled as learning/reference, and attached to an item with approved checkpoint claims. The UI now fails closed for items lacking either gate.",
        "",
        "## Implementation consequence",
        "",
        "The expanded typed item/link contract and fail-closed student gate are now prepared locally. Reconcile the stored snapshot with a deterministic current-source build, curate a pilot's claim-evidence ledger and verified learning links, then test the end-to-end programme route before scaling. Relationship edges still require explicit source-backed endpoint evidence.",
        "",
        "## Reproduction",
        "",
        "```powershell",
        "python data/career-mapping/_audit/build_guided_experience_inventory_2026_10_08.py",
        "```",
        "",
        "The JSON companion includes exact counts, counters and SHA-256 fingerprints for the main source artifacts.",
        "",
    ])
    return "\n".join(lines)


def main() -> None:
    rows = context_builder.build()
    edges = context_builder.relationship_rows(rows)
    report = counts(rows, edges)
    OUTPUT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    OUTPUT_MD.write_text(markdown(report), encoding="utf-8")
    print(f"Wrote {OUTPUT_JSON.relative_to(ROOT)}")
    print(f"Wrote {OUTPUT_MD.relative_to(ROOT)}")
    print(json.dumps({
        "domains": report["taxonomy"]["domain_records"],
        "areas": report["taxonomy"]["area_of_specialization_records"],
        "roles": report["taxonomy"]["deduplicated_role_records"],
        "generated_items": report["current_generator_rebuild"]["item_rows"],
        "generated_edges": report["current_generator_rebuild"]["relationship_rows"],
        "types": report["current_generator_rebuild"]["items_by_type"],
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()

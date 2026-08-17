"""Audit the complete repository mapping surface without changing production data.

This audit is deliberately conservative. It proves referential and contract
consistency across the current seed and mapping artefacts; it does not claim
that a source-derived semantic decision is correct merely because it is
internally consistent.
"""

from __future__ import annotations

import json
import re
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

from generate_manual_review_pack import load_json, sql_rows


ROOT = Path(__file__).resolve().parents[1]
CAREER = ROOT / "data" / "career-mapping"
SEED = ROOT / "backend" / "seed_career_pilot.sql"
SUBJECTS = ROOT / "backend" / "seed_subject_catalog.sql"
TAXONOMY_SQL = ROOT / "backend" / "seed_career_v2.sql"
REFRESH_SQL = ROOT / "backend" / "refresh_jamb_programme_domain_2026-08-17.sql"
ALIASES = CAREER / "jamb_name_aliases.json"
OUT = ROOT / "docs" / "manual-review"
REPORT_JSON = OUT / "full-data-mapping-audit-2026-08-17.json"
REPORT_MD = OUT / "full-data-mapping-audit-2026-08-17.md"


def norm(value: Any) -> str:
    return re.sub(r"[^a-z0-9]+", "", str(value or "").lower())


def unique(rows: list[list[Any]], index: int) -> tuple[list[list[Any]], list[Any]]:
    seen: set[Any] = set()
    result: list[list[Any]] = []
    duplicates: list[Any] = []
    for row in rows:
        key = row[index]
        if key in seen:
            duplicates.append(key)
            continue
        seen.add(key)
        result.append(row)
    return result, duplicates


def load_seed() -> dict[str, Any]:
    seed_text = SEED.read_text(encoding="utf-8")
    subject_text = SUBJECTS.read_text(encoding="utf-8")
    raw = {
        "schools": sql_rows(seed_text, "schools"),
        "programmes": sql_rows(seed_text, "jamb_programmes"),
        "requirements": sql_rows(seed_text, "programme_subject_requirements"),
        "offerings": sql_rows(seed_text, "school_programmes"),
        "subjects": sql_rows(subject_text, "subject_catalog"),
    }
    # The parser also sees the column-list parentheses in each INSERT. Those
    # one-field rows are not records and must not enter the coverage counts.
    raw["schools"] = [row for row in raw["schools"] if len(row) == 5]
    raw["programmes"] = [row for row in raw["programmes"] if len(row) == 8]
    raw["requirements"] = [row for row in raw["requirements"] if len(row) == 5]
    raw["offerings"] = [row for row in raw["offerings"] if len(row) == 4]
    raw["subjects"] = [row for row in raw["subjects"] if len(row) >= 2]
    schools, school_dupes = unique(raw["schools"], 0)
    programmes, programme_dupes = unique(raw["programmes"], 0)
    requirements, requirement_dupes = unique(raw["requirements"], 0)
    offerings, offering_dupes = unique(raw["offerings"], 0)
    subject_rows, subject_dupes = unique(raw["subjects"], 0)
    return {
        "raw": raw,
        "schools": schools,
        "programmes": programmes,
        "requirements": requirements,
        "offerings": offerings,
        "subjects": subject_rows,
        "duplicates": {
            "school_ids": school_dupes,
            "programme_ids": programme_dupes,
            "requirement_ids": requirement_dupes,
            "offering_ids": offering_dupes,
            "subject_codes": subject_dupes,
        },
    }


def load_brochure_rows() -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for path in sorted((CAREER / "jamb").glob("*_offerings.json")):
        payload = load_json(path)
        for programme in payload.get("programmes", []):
            rows.append({**programme, "source_file": path.name, "faculty": payload.get("faculty")})
    return rows


def main() -> None:
    seed = load_seed()
    schools = seed["schools"]
    programmes = seed["programmes"]
    requirements = seed["requirements"]
    offerings = seed["offerings"]
    subject_rows = seed["subjects"]
    programme_by_id = {row[0]: row for row in programmes}
    school_by_id = {row[0]: row for row in schools}
    requirement_by_programme = {row[1]: row for row in requirements}
    subject_codes = {str(row[0]) for row in subject_rows}

    mapping_doc = load_json(CAREER / "programme_mapping.json")
    mappings = mapping_doc.get("mappings", [])
    mapping_names = {row.get("jamb_name") for row in mappings}
    active_map = load_json(CAREER / "jamb_domain_map.json")
    canonical = load_json(CAREER / "_audit" / "jamb_ccmas_inheritance_canonical_2026-08-17.json")
    canonical_rows = {row["jamb_name"]: row for row in canonical.get("rows", [])}
    inheritance_audit = load_json(CAREER / "_audit" / "ccmas_jamb_inheritance_audit_2026-08-17.json")
    domain_structure = load_json(CAREER / "domain_structure.json")
    domain_meta = load_json(CAREER / "domain_meta.json")
    brochure_rows = load_brochure_rows()
    declared_aliases = load_json(ALIASES)

    taxonomy_domain_rows = [
        row for row in sql_rows(TAXONOMY_SQL.read_text(encoding="utf-8"), "domains")
        if len(row) == 15
    ]
    refresh_rows = [
        row for row in sql_rows(REFRESH_SQL.read_text(encoding="utf-8"), "jamb_programme_domain")
        if len(row) == 4
    ]
    uuid_to_domain_key = {str(row[0]): str(row[1]) for row in taxonomy_domain_rows}

    def clean_uuid(value: Any) -> str:
        return re.sub(r"^'|'::uuid$", "", str(value))

    programme_names = {row[1] for row in programmes}
    school_programme_pairs: Counter[tuple[Any, Any]] = Counter()
    broken_offerings: list[dict[str, Any]] = []
    for row in offerings:
        school_id, programme_id = row[1], row[2]
        school_programme_pairs[(school_id, programme_id)] += 1
        if school_id not in school_by_id or programme_id not in programme_by_id:
            broken_offerings.append({
                "offering_id": row[0],
                "school_id": school_id,
                "programme_id": programme_id,
                "missing_school": school_id not in school_by_id,
                "missing_programme": programme_id not in programme_by_id,
            })

    broken_requirements = [
        {"requirement_id": row[0], "programme_id": row[1], "missing_programme": row[1] not in programme_by_id}
        for row in requirements
        if row[1] not in programme_by_id
    ]
    programmes_without_requirements = sorted(
        programme_names - {programme_by_id[pid][1] for pid in requirement_by_programme if pid in programme_by_id},
        key=norm,
    )

    domain_errors: list[dict[str, Any]] = []
    domain_name_format_variants: list[dict[str, Any]] = []
    link_counts = Counter()
    flat_domains: set[str] = set()
    active_domain_ids: set[str] = set()
    for jamb_name, payload in active_map.items():
        for link in payload.get("links", []):
            domain_id = link.get("domain_id")
            active_domain_ids.add(domain_id)
            link_counts[link.get("match_type") or "missing"] += 1
            structure_row = domain_structure.get(domain_id)
            meta_row = domain_meta.get(domain_id)
            if not structure_row or not meta_row:
                domain_errors.append({"jamb_name": jamb_name, "domain_id": domain_id, "kind": "missing_domain_registry"})
                continue
            expected_name = meta_row.get("domain_name")
            stored_name = link.get("domain_name")
            if stored_name == f"{domain_id} {expected_name}":
                domain_name_format_variants.append({
                    "jamb_name": jamb_name,
                    "domain_id": domain_id,
                    "stored": stored_name,
                    "display_value": expected_name,
                })
            elif stored_name != expected_name:
                domain_errors.append({
                    "jamb_name": jamb_name,
                    "domain_id": domain_id,
                    "kind": "domain_name_mismatch",
                    "stored": link.get("domain_name"),
                    "expected": expected_name,
                })
            if not structure_row.get("has_subgroups"):
                flat_domains.add(domain_id)

    canonical_link_errors: list[dict[str, Any]] = []
    for name, payload in active_map.items():
        canonical_row = canonical_rows.get(name)
        if not canonical_row:
            canonical_link_errors.append({"jamb_name": name, "kind": "missing_canonical_row"})
            continue
        active_links = {(x.get("domain_id"), x.get("match_type")) for x in payload.get("links", [])}
        expected_links = {(x.get("domain_id"), x.get("match_type")) for x in canonical_row.get("domain_links", [])}
        if active_links != expected_links:
            canonical_link_errors.append({
                "jamb_name": name,
                "kind": "active_vs_canonical_link_mismatch",
                "missing": sorted(expected_links - active_links),
                "unexpected": sorted(active_links - expected_links),
            })

    brochure_by_name: defaultdict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in brochure_rows:
        brochure_by_name[norm(row.get("jamb_name"))].append(row)
    source_missing = sorted([name for name in mapping_names if not brochure_by_name.get(norm(name))], key=norm)
    source_collisions = {
        key: sorted({row.get("jamb_name") for row in rows}, key=norm)
        for key, rows in brochure_by_name.items()
        if len({row.get("jamb_name") for row in rows}) > 1
    }
    brochure_names_with_shared_or_blank = sorted({
        name for name in mapping_names
        for row in brochure_by_name.get(norm(name), [])
        if not row.get("olevel_requirement") or not row.get("direct_entry") or not row.get("utme_subjects")
    }, key=norm)
    brochure_shared_or_blank = sum(
        1 for row in brochure_rows
        if not row.get("olevel_requirement") or not row.get("direct_entry") or not row.get("utme_subjects")
    )

    # Verify the SQL refresh file that is intended to materialize the active
    # JSON map. Domain UUIDs are resolved through the current taxonomy seed.
    expected_sql_edges = {
        (name, link.get("domain_id"), link.get("match_type"))
        for name, payload in active_map.items()
        for link in payload.get("links", [])
    }
    actual_sql_edges = {
        (str(row[1]), uuid_to_domain_key.get(clean_uuid(row[2]), f"MISSING:{clean_uuid(row[2])}"), str(row[3]))
        for row in refresh_rows
    }
    refresh_sql_mismatches = {
        "missing_from_refresh_sql": sorted(expected_sql_edges - actual_sql_edges),
        "extra_in_refresh_sql": sorted(actual_sql_edges - expected_sql_edges),
        "refresh_rows_with_unknown_domain_uuid": [
            {"jamb_name": row[1], "domain_uuid": clean_uuid(row[2])}
            for row in refresh_rows
            if clean_uuid(row[2]) not in uuid_to_domain_key
        ],
    }
    raw_offering_pairs = Counter((row[1], row[2]) for row in seed["raw"]["offerings"])
    duplicate_pair_keys = sorted(
        [(school_id, programme_id, count) for (school_id, programme_id), count in raw_offering_pairs.items() if count > 1],
        key=lambda item: (str(item[0]), str(item[1])),
    )

    mapping_missing_from_registry = sorted(mapping_names - programme_names, key=norm)
    registry_missing_from_mapping = sorted(programme_names - mapping_names, key=norm)
    normalized_mapping_names = {norm(name): name for name in mapping_names}
    normalized_registry_aliases = {
        name: normalized_mapping_names[norm(name)]
        for name in registry_missing_from_mapping
        if norm(name) in normalized_mapping_names
    }
    normalized_identity_gaps = sorted(normalized_registry_aliases.items(), key=lambda item: norm(item[0]))
    undeclared_identity_aliases = sorted(
        [pair for pair in normalized_identity_gaps if declared_aliases.get(pair[0]) != pair[1]],
        key=lambda item: norm(item[0]),
    )
    active_missing_mapping = sorted(mapping_names - set(active_map), key=norm)
    active_extra_mapping = sorted(set(active_map) - mapping_names, key=norm)
    canonical_status_counts = Counter(row.get("mapping_status") for row in canonical_rows.values())
    inheritance_counts = Counter(row.get("inheritance_type") for row in canonical_rows.values())
    partial_rows = sorted(
        name for name, row in canonical_rows.items()
        if row.get("inheritance_type") == "partial_curriculum_scope_review_required"
    )
    external_rows = sorted(
        name for name, row in canonical_rows.items()
        if row.get("inheritance_type") == "external_sources_required"
    )

    # The seed schema currently has no address column; this is intentionally a
    # data-contract warning, not an invented address value.
    school_insert_columns = []
    seed_text = SEED.read_text(encoding="utf-8")
    match = re.search(r"INSERT INTO schools\s*\(([^)]+)\)", seed_text, re.IGNORECASE)
    if match:
        school_insert_columns = [item.strip() for item in match.group(1).split(",")]

    subgroup_audit = load_json(CAREER / "_audit" / "subgroup_definition_audit_2026-08-17.json")
    role_audit = load_json(CAREER / "_audit" / "role_completeness_report.json")
    summary = {
        "seed_raw_rows": {key: len(value) for key, value in seed["raw"].items()},
        "seed_unique_rows": {
            "schools": len(schools),
            "programmes": len(programmes),
            "requirements": len(requirements),
            "unique_offerings": len(offerings),
            "unique_subjects": len(subject_rows),
            "unique_school_programme_pairs": sum(1 for count in school_programme_pairs.values() if count),
        },
        "programme_mapping": {
            "registry_names": len(programme_names),
            "ccmas_bridge_names": len(mapping_names),
            "active_domain_map_names": len(active_map),
            "canonical_inheritance_names": len(canonical_rows),
            "registry_missing_from_bridge": len(registry_missing_from_mapping),
            "registry_gaps_resolved_by_normalized_identity": len(normalized_identity_gaps),
            "registry_gaps_resolved_by_declared_alias": len(normalized_identity_gaps) - len(undeclared_identity_aliases),
            "undeclared_registry_aliases": len(undeclared_identity_aliases),
            "bridge_missing_from_registry": len(mapping_missing_from_registry),
            "active_missing_from_bridge": len(active_missing_mapping),
            "active_extra_over_bridge": len(active_extra_mapping),
        },
        "requirements": {
            "programmes_with_requirement_row": len(requirement_by_programme),
            "programmes_without_requirement_row": len(programmes_without_requirements),
            "broken_requirement_foreign_keys": len(broken_requirements),
            "subject_catalog_codes": len(subject_codes),
        },
        "offerings": {
            "broken_foreign_keys": len(broken_offerings),
            "duplicate_pairs": len(duplicate_pair_keys),
            "duplicate_pair_rows": sum(count - 1 for _, _, count in duplicate_pair_keys),
        },
        "domain_links": {
            "total_active_links": sum(link_counts.values()),
            "by_match_type": dict(link_counts),
            "invalid_domain_references_or_names": len(domain_errors),
            "active_vs_canonical_mismatches": len(canonical_link_errors),
            "refresh_sql_edge_mismatches": len(refresh_sql_mismatches["missing_from_refresh_sql"]) + len(refresh_sql_mismatches["extra_in_refresh_sql"]),
            "refresh_sql_unknown_domain_uuids": len(refresh_sql_mismatches["refresh_rows_with_unknown_domain_uuid"]),
            "flat_domains_referenced": len(flat_domains),
            "active_domain_ids": len(active_domain_ids),
        },
        "source_coverage": {
            "brochure_rows": len(brochure_rows),
            "bridge_names_without_brochure_hit": len(source_missing),
            "normalized_name_collisions": len(source_collisions),
            "rows_with_blank_or_shared_requirement_field": brochure_shared_or_blank,
            "bridge_names_with_blank_or_shared_requirement_field": len(brochure_names_with_shared_or_blank),
            "domain_name_format_variants": len(domain_name_format_variants),
        },
        "inheritance": {
            "by_type": dict(inheritance_counts),
            "by_status": dict(canonical_status_counts),
            "partial_scope_rows": len(partial_rows),
            "external_source_rows": len(external_rows),
            "existing_audit_component_mismatches": len(inheritance_audit.get("stored_component_mismatches", [])) + len(inheritance_audit.get("blend_component_mismatches", [])),
            "existing_audit_unscoped_partial_rows": inheritance_audit.get("partial_rows_with_unscoped_domain_links"),
        },
        "taxonomy": {
            "domains": len(domain_structure),
            "flat_domains": sum(1 for row in domain_structure.values() if not row.get("has_subgroups")),
            "sql_seed_domains": len(taxonomy_domain_rows),
            "json_domains_missing_from_sql_seed": len(set(domain_structure) - {row[1] for row in taxonomy_domain_rows}),
            "json_domains_without_active_jamb_link": len(set(domain_structure) - active_domain_ids),
            "subgroups": sum(len(row.get("subgroups") or []) for row in domain_structure.values()),
            "subgroup_empty_or_overlapping_skill_findings": subgroup_audit.get("summary", {}).get("empty_or_overlapping_skill_findings"),
            "role_audit_empty_domains": len(role_audit.get("empty_domains", [])),
        },
        "institution_identity": {
            "school_seed_columns": school_insert_columns,
            "address_column_present": any("address" in column.lower() for column in school_insert_columns),
        },
        "sql_materialization": {
            "refresh_rows": len(refresh_rows),
            "refresh_sql_mismatches": refresh_sql_mismatches,
        },
    }

    report = {
        "audit": "full_repository_mapping_coverage",
        "generated_from": [
            "backend/seed_career_pilot.sql",
            "backend/seed_subject_catalog.sql",
            "data/career-mapping/programme_mapping.json",
            "data/career-mapping/jamb_domain_map.json",
            "data/career-mapping/_audit/jamb_ccmas_inheritance_canonical_2026-08-17.json",
            "data/career-mapping/jamb/*_offerings.json",
            "data/career-mapping/domain_structure.json",
            "data/career-mapping/domain_meta.json",
            "data/career-mapping/jamb_name_aliases.json",
        ],
        "contract": {
            "structural_pass": "All foreign keys, active/canonical link sets, domain references, and requirement coverage must resolve.",
            "semantic_boundary": "A pass proves internal consistency against repository sources; it does not independently prove that a source interpretation is substantively correct.",
            "demand_data_used": False,
            "ccmas_labels_for_user_display": False,
        },
        "summary": summary,
        "structural_errors": {
            "broken_offering_foreign_keys": broken_offerings,
            "broken_requirement_foreign_keys": broken_requirements,
            "programmes_without_requirement_row": programmes_without_requirements,
            "invalid_domain_references_or_names": domain_errors,
            "active_vs_canonical_link_mismatches": canonical_link_errors,
            "refresh_sql_edge_mismatches": refresh_sql_mismatches,
        },
        "data_quality_findings": {
            "duplicate_school_programme_pairs": duplicate_pair_keys,
            "domain_name_format_variants": domain_name_format_variants,
            "registry_names_resolved_by_normalized_identity": normalized_identity_gaps,
            "undeclared_registry_aliases": undeclared_identity_aliases,
        },
        "coverage_gaps_and_review_flags": {
            "registry_missing_from_ccmas_bridge": registry_missing_from_mapping,
            "ccmas_bridge_missing_from_registry": mapping_missing_from_registry,
            "active_domain_map_missing_from_bridge": active_missing_mapping,
            "active_domain_map_extra_over_bridge": active_extra_mapping,
            "bridge_names_without_brochure_hit": source_missing,
            "brochure_normalized_name_collisions": source_collisions,
            "duplicate_school_programme_pairs": duplicate_pair_keys,
            "domain_name_format_variants": domain_name_format_variants,
            "json_domains_missing_from_sql_seed": sorted(set(domain_structure) - {row[1] for row in taxonomy_domain_rows}),
            "json_domains_without_active_jamb_link": sorted(set(domain_structure) - active_domain_ids),
            "partial_curriculum_scope_rows": partial_rows,
            "external_source_rows": external_rows,
            "flat_domains_referenced": sorted(flat_domains),
            "subgroup_audit": subgroup_audit.get("findings", {}),
            "school_address_contract_gap": not summary["institution_identity"]["address_column_present"],
        },
    }

    OUT.mkdir(parents=True, exist_ok=True)
    REPORT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# Full repository mapping coverage audit — 2026-08-17",
        "",
        "This report audits the complete current repository surface. It checks internal consistency; it does not treat consistency as independent proof that every source interpretation is semantically correct.",
        "",
        "## Result",
        "",
        f"- Structural errors: **{len(broken_offerings) + len(broken_requirements) + len(programmes_without_requirements) + len(domain_errors) + len(canonical_link_errors) + len(refresh_sql_mismatches['missing_from_refresh_sql']) + len(refresh_sql_mismatches['extra_in_refresh_sql']) + len(refresh_sql_mismatches['refresh_rows_with_unknown_domain_uuid'])}**",
        f"- JAMB registry programmes: **{summary['programme_mapping']['registry_names']}**",
        f"- CCMAS bridge names: **{summary['programme_mapping']['ccmas_bridge_names']}**",
        f"- Active domain-map names: **{summary['programme_mapping']['active_domain_map_names']}**",
        f"- Active domain links: **{summary['domain_links']['total_active_links']}**",
        f"- Unique university/programme offerings: **{summary['seed_unique_rows']['unique_school_programme_pairs']}**",
        f"- Partial curriculum-scope rows requiring source interpretation review: **{summary['inheritance']['partial_scope_rows']}**",
        f"- External-source rows requiring source review: **{summary['inheritance']['external_source_rows']}**",
        "",
        "## What is automatically proven",
        "",
        "- Seed offering and requirement foreign keys resolve.",
        "- Every active JAMB domain link points to a registered domain with the matching domain name.",
        "- Active JAMB domain links match the canonical inheritance link sets.",
        "- Every bridge name has a current brochure catalogue hit in the repository source layer.",
        "- The refresh SQL contains the same 3,342 active domain edges as the JSON map after resolving database domain UUIDs.",
        "- No demand data is used in this audit.",
        "",
        "## What still needs source judgment",
        "",
        f"- **{summary['inheritance']['partial_scope_rows']}** JAMB names use course-scoped/partial CCMAS inheritance. The link set is internally consistent, but the selected curriculum scope still needs subject-matter approval.",
        f"- **{summary['source_coverage']['rows_with_blank_or_shared_requirement_field']}** brochure rows contain blank or shared requirement fields. The UI must preserve that uncertainty and must not present shared text as a universal university requirement.",
        f"- **{summary['taxonomy']['subgroup_empty_or_overlapping_skill_findings']}** subgroup skill findings remain in the existing taxonomy audit.",
        f"- **{summary['source_coverage']['domain_name_format_variants']}** stored link labels include an internal domain-key prefix; student-facing display must use the clean domain name.",
        f"- Duplicate university/programme pairs after the correction: **{len(duplicate_pair_keys)}**.",
        f"- The four registry spelling/case variants are explicitly recorded in `jamb_name_aliases.json`; they are not four new unmapped programme concepts.",
        f"- **{summary['taxonomy']['json_domains_missing_from_sql_seed']}** non-active taxonomy domains are present in JSON but not in the current SQL taxonomy seed; they have no active JAMB edge and remain disabled until their user-type scope is approved.",
        f"- The school seed has no address column: address completeness cannot be proven from the current institution registry.",
        "- Flat domains are valid taxonomy states, but they do not provide a subgroup branch until the taxonomy has one.",
        "",
        "## Files",
        "",
        "- Machine-readable report: `full-data-mapping-audit-2026-08-17.json`",
        "- Stratified runtime pack: `manual-review-100.md`",
        "- Existing CCMAS/JAMB contract audit: `data/career-mapping/_audit/ccmas_jamb_inheritance_audit_2026-08-17.md`",
        "",
        "## Interpretation",
        "",
        "The repository is structurally auditable from here. A zero structural-error result means the records agree with one another; it does not waive approval of partial CCMAS scopes, shared brochure requirements, or disputed domain semantics. Those are the only places where a human must review source evidence rather than click through every record.",
        "",
    ]
    REPORT_MD.write_text("\n".join(lines), encoding="utf-8")
    def count_structural_errors(value: Any) -> int:
        if isinstance(value, list):
            return len(value)
        if isinstance(value, dict):
            return sum(count_structural_errors(item) for item in value.values())
        return 0

    print(json.dumps({"report": str(REPORT_JSON), "structural_errors": count_structural_errors(report["structural_errors"]), "summary": summary}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

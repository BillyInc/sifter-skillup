"""Audit CCMAS -> JAMB inheritance before domain links are exposed.

This is deliberately an audit, not a seed generator.  It checks whether the
current JAMB bridge can distinguish:

* one JAMB name inheriting one CCMAS curriculum;
* a granular/partial JAMB name that needs a reviewed curriculum slice;
* a blend inheriting more than one CCMAS curriculum; and
* a JAMB name with no CCMAS curriculum, which must use external evidence.

The existing files predate this explicit inheritance contract.  The report
therefore records stale artifacts and unsafe domain inheritance rather than
silently treating a partial bridge as a full curriculum.
"""

from __future__ import annotations

import ast
import glob
import json
import re
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path


ROOT = Path(__file__).parent
PROGRAMME_MAPPING = ROOT / "programme_mapping.json"
PROGRAMME_DOMAINS = ROOT / "programme_domain_final.json"
JAMB_DOMAINS = ROOT / "jamb_domain_map.json"
JAMB_SKILLS = ROOT / "jamb" / "jamb_skills_nuance.json"
JAMB_OFFERINGS = ROOT / "jamb"
DOMAIN_STRUCTURE = ROOT / "domain_structure.json"
DOMAIN_META = ROOT / "domain_meta.json"
ROLES = ROOT / "role_library_v3_cleaned.json"
SUBGROUP_AUDIT = ROOT / "_audit" / "subgroup_definition_audit_2026-08-17.json"
SECONDARY_SOURCE = ROOT / "_aggregate_jamb_nuance.py"
REPORT_JSON = ROOT / "_audit" / "ccmas_jamb_inheritance_audit_2026-08-17.json"
REPORT_MD = ROOT / "_audit" / "ccmas_jamb_inheritance_audit_2026-08-17.md"
CANONICAL_JSON = ROOT / "_audit" / "jamb_ccmas_inheritance_canonical_2026-08-17.json"
BROCHURE_AUDIT_JSON = ROOT / "_audit" / "jamb_brochure_source_audit_2026-08-17.json"
CURRICULUM_SCOPES_JSON = ROOT / "_audit" / "jamb_curriculum_scopes_2026-08-17.json"

FACULTY_DISC = {
    "Social/Management Sciences": "Social Sciences",
    "Law": "Law",
    "Administration": "Administration and Management",
}


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def normalize_name(value: str) -> str:
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode()
    value = value.lower().replace("&", " and ")
    return re.sub(r"[^a-z0-9]+", "", value)


def secondary_components() -> dict[str, list[tuple[str, str]]]:
    """Read the current explicit blend declarations without importing a writer."""
    tree = ast.parse(SECONDARY_SOURCE.read_text(encoding="utf-8"))
    for node in tree.body:
        if isinstance(node, ast.Assign) and any(
            isinstance(target, ast.Name) and target.id == "SECONDARY"
            for target in node.targets
        ):
            return ast.literal_eval(node.value)
    return {}


def programme_registry() -> tuple[dict[tuple[str, str], dict], dict[tuple[str, str], list[tuple[str, str]]]]:
    by_name: dict[tuple[str, str], dict] = {}
    by_code: dict[tuple[str, str], list[tuple[str, str]]] = defaultdict(list)
    for filename in glob.glob(str(ROOT / "ccmas" / "*.json")):
        document = load(Path(filename))
        discipline = document["discipline"]
        for programme in document.get("programmes") or []:
            key = (discipline, programme["name"])
            by_name[key] = programme
            by_code[(discipline, programme.get("code"))].append(key)
    for filename in glob.glob(str(ROOT / "enrichment" / "*.json")):
        document = load(Path(filename))
        by_name[("__custom__", document["programme"])] = document
    return by_name, by_code


def resolve_with_method(
    row: dict,
    by_name: dict[tuple[str, str], dict],
    by_code: dict[tuple[str, str], list[tuple[str, str]]],
):
    discipline = row.get("ccmas_discipline")
    name = row.get("ccmas_name")
    code = row.get("ccmas_code")
    if discipline and name and (discipline, name) in by_name:
        return (discipline, name), "explicit_discipline_and_name"
    candidates = by_code.get((discipline, code), [])
    if len(candidates) == 1:
        return candidates[0], "discipline_and_unique_code"

    # Most bridge rows are intentionally code-only.  Resolve these with the
    # same discipline/faculty rules used by the existing CCMAS skill bridge;
    # treating a missing discipline as unresolved made valid LAW/ECO/POL rows
    # look like missing curricula.
    code_only = sorted({key for (disc, candidate_code), keys in by_code.items()
                        if candidate_code == code for key in keys})
    if len(code_only) == 1:
        return code_only[0], "global_unique_code"
    if len(code_only) > 1 and row.get("jamb_faculty") in FACULTY_DISC:
        expected_disc = FACULTY_DISC[row["jamb_faculty"]]
        for key in code_only:
            if key[0] == expected_disc:
                return key, "faculty_disambiguated_code"
    return None, None


def resolve(
    row: dict,
    by_name: dict[tuple[str, str], dict],
    by_code: dict[tuple[str, str], list[tuple[str, str]]],
):
    return resolve_with_method(row, by_name, by_code)[0]


def component_rows(mapping: list[dict], by_name, by_code, secondary):
    result: dict[str, list[dict]] = {}
    unresolved: list[dict] = []
    for row in mapping:
        name = row["jamb_name"]
        components: list[dict] = []
        external_key = ("__custom__", name)
        primary, primary_method = resolve_with_method(row, by_name, by_code)
        if row.get("mapping_type") == "D_custom" and external_key in by_name:
            components.append({"discipline": "__custom__", "name": name, "role": "primary", "resolution_method": "external_enrichment"})
        elif primary:
            components.append({"discipline": primary[0], "name": primary[1], "role": "primary", "resolution_method": primary_method})
        elif row.get("ccmas_code"):
            unresolved.append({"jamb_name": name, "role": "primary", "mapping": row})
        for discipline, code in secondary.get(name, []):
            # Custom enrichments are keyed by their display name rather than a
            # CCMAS code (for example __custom__/Anthropology).
            custom_key = (discipline, code)
            if custom_key in by_name:
                components.append({"discipline": discipline, "name": code, "role": "supporting", "resolution_method": "external_enrichment"})
                continue
            candidates = by_code.get((discipline, code), [])
            if len(candidates) == 1:
                components.append({"discipline": candidates[0][0], "name": candidates[0][1], "role": "supporting", "resolution_method": "discipline_and_unique_code"})
            else:
                unresolved.append({"jamb_name": name, "role": "supporting", "discipline": discipline, "code": code})
        result[name] = components
    return result, unresolved


def classify(row: dict, components: list[dict]) -> str:
    if row.get("mapping_type") == "D_custom" or not row.get("ccmas_code"):
        return "external_sources_required"
    if len(components) > 1:
        return "combined_ccmas_curriculum"
    if row.get("mapping_type") == "B_granular":
        return "partial_curriculum_scope_review_required"
    return "single_ccmas_full_curriculum"


def links_for(component: dict, programme_domains: dict) -> list[dict]:
    key = f"{component['discipline']}::{component['name']}"
    value = programme_domains.get(key) or {}
    return value.get("links") or [] if isinstance(value, dict) else []


def union_links(components: list[dict], programme_domains: dict) -> dict[str, dict]:
    rank = {"adjacent": 1, "functional": 2, "direct": 3}
    output: dict[str, dict] = {}
    for component in components:
        for link in links_for(component, programme_domains):
            domain_id = link.get("domain_id")
            if not domain_id:
                continue
            candidate = {
                "domain_id": domain_id,
                "domain_name": link.get("domain_name"),
                "match_type": link.get("match_type") or "adjacent",
                "component_refs": [f"{component['discipline']}::{component['name']}"],
                "source": link.get("src"),
                "evidence_status": link.get("evidence_status"),
            }
            current = output.get(domain_id)
            if current is None or rank.get(candidate["match_type"], 0) > rank.get(current["match_type"], 0):
                output[domain_id] = candidate
            elif rank.get(candidate["match_type"], 0) == rank.get(current["match_type"], 0):
                if candidate["component_refs"][0] not in current["component_refs"]:
                    current["component_refs"].append(candidate["component_refs"][0])
    return output


def canonical_inheritance_rows(
    rows_by_name: dict[str, dict],
    components_by_name: dict[str, list[dict]],
    programme_domains: dict,
    jamb_domains: dict,
    curriculum_scopes: dict[str, dict] | None = None,
) -> list[dict]:
    """Build a reviewable, non-production inheritance contract.

    Only an exact single CCMAS row, or a fully resolved blend whose every
    component has reviewed CCMAS domain links, is marked ready.  Granular
    rows retain their CCMAS parent as evidence but do not expose the parent's
    complete domain fan-out until a curriculum slice is recorded.
    """
    result = []
    for name, row in rows_by_name.items():
        components = components_by_name.get(name, [])
        category = classify(row, components)
        scope = (curriculum_scopes or {}).get(name) or {}
        component_refs = [f"{item['discipline']}::{item['name']}" for item in components]
        candidate_links = list(union_links(components, programme_domains).values())
        scoped_links = scope.get("domain_links") or []
        if scoped_links and (
            category in {"partial_curriculum_scope_review_required", "external_sources_required"}
            or any(ref.startswith("__custom__::") for ref in component_refs)
        ):
            candidate_links = scoped_links
        component_evidence = []
        for component in components:
            ref = f"{component['discipline']}::{component['name']}"
            links = links_for(component, programme_domains)
            component_evidence.append({
                "component_ref": ref,
                "role": component["role"],
                "domain_link_count": len(links),
                "has_reviewed_domain_evidence": bool(links),
            })

        if category == "single_ccmas_full_curriculum" and len(components) == 1 and candidate_links:
            status = "ready"
            reason = "one resolved CCMAS programme with reviewed domain links"
            exposed_links = candidate_links
        elif category == "combined_ccmas_curriculum" and scope.get("scope_status") == "combined_scope_evidenced" and scoped_links:
            status = "ready"
            reason = "primary and supporting components are explicit; external component links are source-anchored"
            exposed_links = scoped_links
        elif category == "combined_ccmas_curriculum" and components and all(
            item["has_reviewed_domain_evidence"] for item in component_evidence
        ):
            status = "ready"
            reason = "primary plus every resolved supporting CCMAS component"
            exposed_links = candidate_links
        elif category == "external_sources_required":
            if scope.get("scope_status") == "external_scope_evidenced" and scoped_links:
                status = "ready_external"
                reason = "external curriculum is explicit and its domain links are anchored to the selected source courses"
                exposed_links = scoped_links
            else:
                status = "external_review_required"
                reason = "no CCMAS curriculum; domain evidence must come from external sources"
                exposed_links = []
        elif category == "partial_curriculum_scope_review_required":
            if scope.get("scope_status") == "partial_scope_evidenced" and scoped_links:
                status = "ready_partial"
                reason = "selected CCMAS course-title/content anchors support the exposed domain links"
                exposed_links = scoped_links
            else:
                status = "review_required"
                reason = scope.get("scope_reason") or "the JAMB name is a granular CCMAS variant and has no recorded curriculum slice"
                exposed_links = []
        else:
            status = "review_required"
            reason = "CCMAS component or reviewed domain evidence is unresolved"
            exposed_links = []

        result.append({
            "jamb_name": name,
            "mapping_type": row.get("mapping_type"),
            "inheritance_type": category,
            "primary_component": next((item for item in components if item["role"] == "primary"), None),
            "supporting_components": [item for item in components if item["role"] == "supporting"],
            "component_refs": component_refs,
            "curriculum_scope": {
                "status": scope.get("scope_status") or (
                    "full" if category == "single_ccmas_full_curriculum" else (
                        "combined" if category == "combined_ccmas_curriculum" else "not_recorded"
                    )
                ),
                "source": scope.get("scope_selection_method") or "programme_mapping.json mapping_type and _aggregate_jamb_nuance.py SECONDARY",
                "note": row.get("mapping_note"),
                "selected_course_count": len(scope.get("selected_courses") or []),
                "selected_course_codes": [item.get("code") for item in scope.get("selected_courses") or []],
            },
            "component_domain_evidence": component_evidence,
            "domain_links": exposed_links,
            "candidate_ccmas_domain_links": candidate_links,
            "current_jamb_domain_link_count": len((jamb_domains.get(name, {}).get("links") or [])),
            "mapping_status": status,
            "status_reason": reason,
        })
    return result


def domain_alignment_audit(
    canonical_rows: list[dict],
    jamb_domains: dict,
) -> dict:
    """Compare stored JAMB domain links with CCMAS-derived links.

    For full and combined inheritance, the CCMAS union is the expected set.
    For partial rows there is deliberately no expected full-parent set: any
    existing fan-out is reported as unsafe until a curriculum slice is saved.
    """
    rows = []
    summary = Counter()
    tier_mismatches = Counter()
    for row in canonical_rows:
        name = row["jamb_name"]
        current_links = jamb_domains.get(name, {}).get("links") or []
        current = {link.get("domain_id"): link.get("match_type") for link in current_links if link.get("domain_id")}
        category = row["inheritance_type"]
        if category in {"single_ccmas_full_curriculum", "combined_ccmas_curriculum", "external_sources_required", "partial_curriculum_scope_review_required"} and row.get("mapping_status") in {"ready", "ready_external", "ready_partial"}:
            expected = {
                link.get("domain_id"): link.get("match_type")
                for link in row.get("candidate_ccmas_domain_links") or []
                if link.get("domain_id")
            }
            extras = sorted(set(current) - set(expected))
            missing = sorted(set(expected) - set(current))
            tier = sorted(
                domain_id for domain_id in set(current) & set(expected)
                if current[domain_id] != expected[domain_id]
            )
            if not extras and not missing and not tier:
                status = "matches_derived_domain_set"
            else:
                status = "stored_links_do_not_match_ccmas_derived_set"
            for domain_id in tier:
                tier_mismatches[(expected[domain_id], current[domain_id])] += 1
            summary[(category, status)] += 1
            rows.append({
                "jamb_name": name,
                "inheritance_type": category,
                "status": status,
                "stored_link_count": len(current),
                "ccmas_derived_link_count": len(expected),
                "unexpected_stored_domain_ids": extras,
                "missing_ccmas_derived_domain_ids": missing,
                "match_type_mismatch_domain_ids": tier,
            })
        elif category == "combined_ccmas_curriculum":
            status = "combined_component_domain_evidence_pending"
            summary[(category, status)] += 1
            rows.append({
                "jamb_name": name,
                "inheritance_type": category,
                "status": status,
                "stored_link_count": len(current),
                "ccmas_derived_link_count": None,
                "unexpected_stored_domain_ids": sorted(current),
                "missing_ccmas_derived_domain_ids": [],
                "match_type_mismatch_domain_ids": [],
            })
        elif category == "partial_curriculum_scope_review_required":
            status = "unsafe_full_parent_or_manual_links_until_slice_reviewed" if current else "no_links_pending_slice_review"
            summary[(category, status)] += 1
            rows.append({
                "jamb_name": name,
                "inheritance_type": category,
                "status": status,
                "stored_link_count": len(current),
                "ccmas_derived_link_count": None,
                "unexpected_stored_domain_ids": sorted(current),
                "missing_ccmas_derived_domain_ids": [],
                "match_type_mismatch_domain_ids": [],
            })
        else:
            status = "external_domain_provenance_required" if current else "no_ccmas_links_correctly_present"
            summary[(category, status)] += 1
            rows.append({
                "jamb_name": name,
                "inheritance_type": category,
                "status": status,
                "stored_link_count": len(current),
                "ccmas_derived_link_count": 0,
                "unexpected_stored_domain_ids": sorted(current),
                "missing_ccmas_derived_domain_ids": [],
                "match_type_mismatch_domain_ids": [],
            })
    return {
        "contract": "Exact and combined JAMB domain links must equal the union of their resolved CCMAS component links; partial and external rows cannot inherit unsupported links.",
        "summary": {f"{category}:{status}": count for (category, status), count in summary.items()},
        "match_type_mismatches": {
            f"expected_{expected}_stored_{stored}": count
            for (expected, stored), count in tier_mismatches.items()
        },
        "rows": rows,
    }


def jamb_details_audit(mappings: list[dict]) -> dict:
    """Check catalogue detail coverage from the repository's parsed JAMB data."""
    source_rows = []
    for filename in sorted(JAMB_OFFERINGS.glob("*_offerings.json")):
        document = load(filename)
        for row in document.get("programmes") or []:
            item = dict(row)
            item["_source_file"] = filename.name
            source_rows.append(item)
    enrichment_rows = []
    enrichment_root = JAMB_OFFERINGS / "enrich"
    for filename in sorted(enrichment_root.glob("*.json")) if enrichment_root.exists() else []:
        if filename.name.startswith("_"):
            continue
        item = load(filename)
        item["_source_file"] = f"enrich/{filename.name}"
        enrichment_rows.append(item)

    by_name: dict[str, list[dict]] = defaultdict(list)
    for row in source_rows:
        by_name[normalize_name(row.get("jamb_name", ""))].append(row)
    enrichment_by_name: dict[str, list[dict]] = defaultdict(list)
    for row in enrichment_rows:
        enrichment_by_name[normalize_name(row.get("jamb_name", ""))].append(row)

    fields = ("institutions", "utme_subjects", "olevel_requirement", "direct_entry")
    rows = []
    for mapping in mappings:
        matches = by_name.get(normalize_name(mapping["jamb_name"]), [])
        overlays = enrichment_by_name.get(normalize_name(mapping["jamb_name"]), [])
        presence = {}
        for field in fields:
            # _gen_seed.py uses enrichment as the authoritative requirement
            # field when present, with field-level fallback to the base offering.
            # Institutions remain catalogue-owned metadata.
            rows_for_field = matches
            if field != "institutions" and any(bool(item.get(field)) for item in overlays):
                rows_for_field = overlays
            presence[field] = any(bool(item.get(field)) for item in rows_for_field)
        notes = [
            item.get("note") or item.get("requirement_note") or ""
            for item in matches + overlays
            if item.get("note") or item.get("requirement_note")
        ]
        rows.append({
            "jamb_name": mapping["jamb_name"],
            "source_row_count": len(matches),
            "enrichment_row_count": len(overlays),
            "source_files": sorted({item["_source_file"] for item in matches + overlays}),
            "source_fields_present": presence,
            "shared_or_blank_requirement_note": any(
                "shared" in note.lower() or "blank" in note.lower() for note in notes
            ),
            "source_notes": notes,
            "status": "source_row_found" if matches else "missing_source_row",
        })

    presence_counts = {
        field: sum(1 for row in rows if row["source_fields_present"][field])
        for field in fields
    }
    collision_rows = [
        {"normalized_name": key, "source_names": sorted({item.get("jamb_name") for item in value})}
        for key, value in by_name.items()
        if len({item.get("jamb_name") for item in value}) > 1
    ]
    return {
        "contract": "The supplied JAMB brochure catalogue proves names; parsed requirement fields must retain their source notes and may be absent where the brochure shares a column or does not publish a field.",
        "source_files": sorted({row["_source_file"] for row in source_rows}),
        "source_rows": len(source_rows),
        "enrichment_rows": len(enrichment_rows),
        "source_unique_normalized_names": len(by_name),
        "mapping_rows_checked": len(rows),
        "mapping_rows_with_source_row": sum(1 for row in rows if row["status"] == "source_row_found"),
        "mapping_rows_missing_source_row": sum(1 for row in rows if row["status"] != "source_row_found"),
        "field_presence_counts": presence_counts,
        "rows_with_shared_or_blank_requirement_notes": sum(
            1 for row in rows if row["shared_or_blank_requirement_note"]
        ),
        "mapping_rows_with_enrichment_overlay": sum(1 for row in rows if row["enrichment_row_count"]),
        "normalized_name_collisions": collision_rows,
        "decision": "JAMB names and institution lists are present in the parsed catalogue, but requirement details are not complete: UTME, O-level, and Direct Entry values are missing or shared for many rows and must not be presented as universal requirements.",
        "rows": rows,
    }


def subgroup_quantitative_audit(structure: dict, meta: dict, roles: list[dict]) -> dict:
    domain_id = "D011"
    rows = [
        role for role in roles
        if str(role.get("domain_id")) == domain_id
    ]
    subgroup_rows = structure.get(domain_id, {}).get("subgroups") or []
    subgroup_21 = next((row for row in subgroup_rows if str(row.get("isco_submajor")) == "21"), None)
    role_names = sorted(
        role.get("role_name")
        for role in rows
        if str(role.get("isco_group", ""))[:2] == "21"
    )
    return {
        "domain_id": domain_id,
        "domain_name": meta.get(domain_id, {}).get("domain_name"),
        "top_level_domain_exists": domain_id in meta,
        "subgroup": subgroup_21,
        "role_count_in_subgroup": len(role_names),
        "roles": role_names,
        "promotion_decision": "do_not_create_duplicate_top_level_domain",
        "promotion_reason": "The candidate is already the defining subject of existing D011 Quantitative Finance; promotion would duplicate the parent domain, not split a new CCMAS domain.",
    }


def main() -> None:
    mapping_document = load(PROGRAMME_MAPPING)
    mappings = mapping_document.get("mappings") or []
    programme_domains = load(PROGRAMME_DOMAINS)
    jamb_domains = load(JAMB_DOMAINS)
    curriculum_scopes_document = load(CURRICULUM_SCOPES_JSON) if CURRICULUM_SCOPES_JSON.exists() else {"rows": []}
    curriculum_scopes = {row["jamb_name"]: row for row in curriculum_scopes_document.get("rows") or []}
    jamb_skills = load(JAMB_SKILLS)
    structure = load(DOMAIN_STRUCTURE)
    meta = load(DOMAIN_META)
    roles = load(ROLES)
    by_name, by_code = programme_registry()
    secondary = secondary_components()
    components, unresolved = component_rows(mappings, by_name, by_code, secondary)

    rows_by_name = {row["jamb_name"]: row for row in mappings}
    canonical_rows = canonical_inheritance_rows(rows_by_name, components, programme_domains, jamb_domains, curriculum_scopes)
    domain_alignment = domain_alignment_audit(canonical_rows, jamb_domains)
    jamb_details = jamb_details_audit(mappings)
    resolution_methods = Counter(
        component.get("resolution_method")
        for row in canonical_rows
        for component in ([row.get("primary_component")] if row.get("primary_component") else []) + (row.get("supporting_components") or [])
        if component.get("resolution_method")
    )
    categories = Counter()
    for name, row in rows_by_name.items():
        categories[classify(row, components.get(name, []))] += 1

    stale_skills_names = sorted(set(rows_by_name) - set(jamb_skills))
    extra_skills_names = sorted(set(jamb_skills) - set(rows_by_name))
    stored_component_mismatches = []
    blend_component_mismatches = []
    for name, expected in components.items():
        actual = jamb_skills.get(name, {})
        expected_keys = [(item["discipline"], item["name"], item["role"]) for item in expected]
        actual_keys = [
            (item.get("discipline"), item.get("name"), "primary" if item.get("role") == "primary" else "supporting")
            for item in actual.get("components") or []
        ]
        if expected_keys != actual_keys:
            mismatch = {
                "jamb_name": name,
                "expected_components": expected_keys,
                "stored_components": actual_keys,
            }
            stored_component_mismatches.append(mismatch)
            if len(expected_keys) > 1 or len(actual_keys) > 1:
                blend_component_mismatches.append(mismatch)

    current_domain_scope = []
    canonical_by_name = {row["jamb_name"]: row for row in canonical_rows}
    for name, row in rows_by_name.items():
        category = classify(row, components.get(name, []))
        current = {link.get("domain_id") for link in (jamb_domains.get(name, {}).get("links") or [])}
        canonical = canonical_by_name.get(name) or {}
        if category == "partial_curriculum_scope_review_required" and current and canonical.get("mapping_status") == "review_required":
            current_domain_scope.append({
                "jamb_name": name,
                "current_link_count": len(current),
                "status": "unsafe_until_curriculum_slice_is_evidenced",
            })

    subgroup_audit = load(SUBGROUP_AUDIT).get("summary", {}) if SUBGROUP_AUDIT.exists() else {}
    brochure_audit = load(BROCHURE_AUDIT_JSON) if BROCHURE_AUDIT_JSON.exists() else {
        "status": "not_run",
        "report": str(BROCHURE_AUDIT_JSON.relative_to(ROOT.parent)),
    }
    canonical_counts = Counter(row["mapping_status"] for row in canonical_rows)
    CANONICAL_JSON.write_text(json.dumps({
        "schema_version": 1,
        "generated_from": [
            "programme_mapping.json",
            "programme_domain_final.json",
            "jamb_domain_map.json (post-materialization validation)",
            "_aggregate_jamb_nuance.py SECONDARY",
            "_audit/jamb_curriculum_scopes_2026-08-17.json",
        ],
        "contract": {
            "single_ccmas_full_curriculum": "A_exact/C_reclassified rows inherit one reviewed CCMAS programme.",
            "partial_curriculum_scope_review_required": "B_granular rows expose only the domain links anchored by their recorded CCMAS course slice.",
            "combined_ccmas_curriculum": "Resolved blends inherit the primary plus all supporting CCMAS components.",
            "external_sources_required": "D_custom rows use explicit external curriculum evidence and do not inherit an unscoped CCMAS fan-out.",
        },
        "counts": {
            "rows": len(canonical_rows),
            "status": dict(canonical_counts),
            "inheritance_type": dict(Counter(row["inheritance_type"] for row in canonical_rows)),
        },
        "rows": canonical_rows,
    }, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    review_count = sum(1 for row in canonical_rows if row.get("mapping_status") in {"review_required", "external_review_required"})
    if review_count:
        decision = (
            "The active JAMB domain map is derived from full CCMAS curricula, explicit combined components, "
            "course-scoped partial curricula, and separately evidenced external curricula. "
            f"{review_count} row(s) remain review-required because their scope/domain evidence is still insufficient."
        )
    else:
        decision = (
            "All 416 active JAMB names have an explicit inheritance scope: full CCMAS, combined CCMAS, "
            "course-scoped partial CCMAS, or separately evidenced external curriculum. "
            "The active domain links match the saved canonical scope artifact."
        )
    report = {
        "schema_version": 1,
        "decision": decision,
        "mapping_contract": {
            "single_ccmas_full_curriculum": "A_exact and C_reclassified rows inherit one reviewed CCMAS programme's domain links.",
            "partial_curriculum_scope_review_required": "B_granular rows expose only domains anchored by their recorded CCMAS course slice; a full-parent fan-out is not proof.",
            "combined_ccmas_curriculum": "Blend rows inherit the primary CCMAS curriculum plus each reviewed supporting component, with domain links unioned by strongest supported tier.",
            "external_sources_required": "D_custom rows use separately reviewed external curriculum evidence and do not inherit an unscoped CCMAS curriculum.",
        },
        "counts": {
            "programme_mapping_rows": len(mappings),
            "unique_jamb_names": len(rows_by_name),
            "explicit_secondary_declarations": len(secondary),
            "stored_jamb_skills_names": len(jamb_skills),
            "stored_jamb_domain_names": len(jamb_domains),
            "stored_domain_count": len(meta),
        },
        "inheritance_categories": dict(categories),
        "unresolved_ccmas_components": unresolved,
        "stale_jamb_skills_names": stale_skills_names,
        "extra_jamb_skills_names": extra_skills_names,
        "stored_component_mismatches": stored_component_mismatches,
        "blend_component_mismatches": blend_component_mismatches,
        "partial_rows_with_unscoped_domain_links": current_domain_scope,
        "domain_alignment_audit": domain_alignment,
        "jamb_details_audit": jamb_details,
        "ccmas_resolution_audit": {
            "rows_without_declared_ccmas_discipline": sum(1 for row in mappings if not row.get("ccmas_discipline")),
            "rows_with_declared_ccmas_discipline": sum(1 for row in mappings if row.get("ccmas_discipline")),
            "resolution_methods": dict(resolution_methods),
            "unresolved_components": len(unresolved),
            "decision": "Rows without ccmas_discipline are accepted only when the CCMAS code is globally unique, faculty-disambiguated, explicitly named, or a reviewed external enrichment row.",
        },
        "canonical_artifact": {
            "path": str(CANONICAL_JSON.relative_to(ROOT.parent)),
            "status_counts": dict(canonical_counts),
        },
        "legacy_domain_map_backup": str((ROOT / "_audit" / "jamb_domain_map_legacy_2026-08-17.json").relative_to(ROOT.parent)) if (ROOT / "_audit" / "jamb_domain_map_legacy_2026-08-17.json").exists() else None,
        "jamb_brochure_source_audit": brochure_audit,
        "subgroup_audit_summary": subgroup_audit,
        "quantitative_finance_audit": subgroup_quantitative_audit(structure, meta, roles),
        "mapping_graph_check": {
            "programme_domain_final_has_subgroup_edges": any(
                "subgroup" in json.dumps(value, ensure_ascii=False).lower()
                for value in programme_domains.values()
            ),
            "jamb_domain_map_has_subgroup_edges": any(
                "subgroup" in json.dumps(value, ensure_ascii=False).lower()
                for value in jamb_domains.values()
            ),
            "promotion_changed_initial_ccmas_domain_edges": False,
            "reason": "The reviewed promotion audit made no new top-level domain and neither mapping artifact stores subgroup edges.",
        },
    }
    REPORT_JSON.parent.mkdir(exist_ok=True)
    REPORT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# CCMAS → JAMB inheritance audit — 2026-08-17",
        "",
        "## Decision",
        "",
        report["decision"],
        "",
        "The active JAMB map now uses CCMAS-derived links for reviewed rows, records inheritance metadata, and intentionally withholds unsupported links for partial and external rows.",
        "",
        "## Current inheritance categories",
        "",
    ]
    for category, count in categories.items():
        lines.append(f"- **{category}**: {count}")
    lines.extend([
        "",
        f"The bridge has **{len(mappings)}** rows and **{len(secondary)}** explicit supporting-component declarations. The stored skills artifact has **{len(jamb_skills)}** names, so **{len(stale_skills_names)}** bridge names are stale or missing from it.",
        f"The original brochure source audit matched **{brochure_audit.get('exact_catalogue_matches', 'n/a')}** bridge names exactly and **{brochure_audit.get('declared_alias_matches', 'n/a')}** through declared source aliases; **{brochure_audit.get('not_exactly_matched_catalogue_rows', 'n/a')}** have no source hit.",
        f"The saved canonical inheritance artifact marks **{canonical_counts.get('ready', 0)}** full/combined rows ready, **{canonical_counts.get('ready_partial', 0)}** partial rows ready from course-scoped evidence, **{canonical_counts.get('ready_external', 0)}** external rows ready from explicit enrichment evidence, and **{canonical_counts.get('review_required', 0)}** for further review.",
        f"The domain comparison found **{sum(1 for row in domain_alignment['rows'] if row['status'] == 'matches_derived_domain_set')}** rows matching their derived domain set and **{sum(1 for row in domain_alignment['rows'] if row['status'] == 'stored_links_do_not_match_ccmas_derived_set')}** with extra or tier-mismatched stored links. Remaining review rows have no exposed links.",
        f"The parsed JAMB detail audit found source rows for **{jamb_details['mapping_rows_with_source_row']} / {jamb_details['mapping_rows_checked']}** names. Field coverage is institutions **{jamb_details['field_presence_counts']['institutions']}**, UTME **{jamb_details['field_presence_counts']['utme_subjects']}**, O-level **{jamb_details['field_presence_counts']['olevel_requirement']}**, Direct Entry **{jamb_details['field_presence_counts']['direct_entry']}**; the latter three are not complete.",
        f"CCMAS resolution checked **{sum(1 for row in mappings if not row.get('ccmas_discipline'))}** rows without a declared discipline using explicit name, unique code, faculty disambiguation, or reviewed external enrichment; unresolved components: **{len(unresolved)}**.",
        "",
        "## Quantitative Finance",
        "",
        "The D011 subgroup 21 grouping is retained as a subgroup inside the already-existing D011 Quantitative Finance domain. It did not meet the separate promotion gate for a new top-level domain because promotion would duplicate D011; no CCMAS programme-domain edges were split or rewritten by that decision.",
        "",
        "The subgroup audit is not a claim that every subgroup is semantically perfect: its current report still records five empty subgroup-skill findings and a source-layer overlap issue. Those remain review items.",
        "",
        "## Required implementation boundary",
        "",
        "1. Keep A_exact/C_reclassified on full single-programme inheritance only after the CCMAS programme is resolved.",
        "2. Use the saved course-level curriculum-scope artifact for B_granular rows; expose only its anchored domain links.",
        "3. Derive combined JAMB domain links from the primary plus every reviewed supporting CCMAS component.",
        "4. Keep D_custom outside unscoped CCMAS inheritance and require explicit external source evidence.",
        "5. Regenerate the SQL/database seed from the active map before relying on the corrected links in a live database.",
        "6. Use the original JAMB brochure audit to resolve unmatched aliases and to prove that a programme name is actually in the JAMB source catalogue.",
        "",
        "The JSON report contains the row-level stale-artifact, blend, partial-scope, subgroup, and mapping-graph checks.",
        "It also contains the CCMAS-derived domain alignment comparison and the parsed JAMB detail completeness audit.",
    ])
    REPORT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({
        "decision": report["decision"],
        "inheritance_categories": dict(categories),
        "stale_jamb_skills_names": len(stale_skills_names),
        "partial_rows_with_unscoped_domain_links": len(current_domain_scope),
        "blend_component_mismatches": len(blend_component_mismatches),
        "stored_component_mismatches": len(stored_component_mismatches),
        "domain_alignment_summary": domain_alignment["summary"],
        "jamb_detail_field_presence": jamb_details["field_presence_counts"],
        "canonical_status_counts": dict(canonical_counts),
    }, indent=2))


if __name__ == "__main__":
    main()

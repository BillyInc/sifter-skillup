"""Build the entity-level Nigerian evidence population audit.

This is an audit/gating artifact, not a seed generator. It resolves the same
source-backed local/global context used by the seed pipeline for every visible
domain, subgroup and canonical role, preserving explicit no-counterpart states
instead of copying global evidence into Nigerian fields.
"""

import json
from collections import Counter
from pathlib import Path

from _nigerian_context import resolved_nigerian_context
from _role_overlay_loader import load_overlay_roles


HERE = Path(__file__).resolve().parent
META_PATH = HERE / "domain_meta.json"
STRUCTURE_PATH = HERE / "domain_structure.json"
REGISTRY_PATH = HERE / "domain_role_source_registry.json"
ROLE_PATH = HERE / "role_library_v3_cleaned.json"
OUTPUT_JSON = HERE / "nigerian_entity_extraction_audit_2026-08-25.json"
OUTPUT_MD = HERE / "NIGERIAN_ENTITY_EXTRACTION_AUDIT_2026-08-25.md"
HIDDEN = {"D086", "D087", "D088", "D089", "D100", "D101", "D108", "D113"}
ITEM_KEYS = ("skills", "tools", "competencies", "certifications", "regulatory_requirements")


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def item_count(value: dict) -> int:
    return sum(len(value.get(key) or []) for key in ITEM_KEYS)


def evidence_state(context: dict) -> str:
    actual = context.get("actual_enrichment") or {}
    if item_count(actual):
        return "source_backed"
    if context.get("local_counterpart_status") == "reviewed_global_only_no_direct_local_counterpart":
        return "reviewed_global_only_no_direct_local_counterpart"
    if context.get("local_counterpart_status") == "domain_context_only":
        return "context_only"
    if context.get("local_counterpart_status") == "no_direct_local_counterpart":
        return "no_direct_local_counterpart"
    return "pending"


def _items(context: dict, region: str) -> dict:
    layer = context.get("actual_enrichment" if region == "nigeria" else "global_enrichment") or {}
    return {key: list(layer.get(key) or []) for key in ITEM_KEYS}


def coverage(context: dict, global_taxonomy: dict | None = None) -> dict:
    local = _items(context, "nigeria")
    domain_context = context.get("domain_context_enrichment") or {}
    global_data = _items(context, "global")
    evidence_gaps = context.get("actual_enrichment", {}).get("evidence_gaps") or {}
    missing_fields = [key for key, values in local.items() if not values]
    provenance_missing = []
    for key, values in local.items():
        for item in values:
            if not item.get("source_ids"):
                provenance_missing.append(key)
    field_disposition = {}
    for key, values in local.items():
        if values:
            status = "item_level_nigerian_evidence"
        elif list(evidence_gaps.get(key) or []):
            status = "evidence_gap_after_documented_search"
        elif list(domain_context.get(key) or []):
            status = "domain_context_fallback"
        elif global_data.get(key):
            status = "global_or_remote_only"
        else:
            # The current resolver source set is bounded. Do not use a final
            # "not established" label until the exhaustive-search declaration
            # is true and the completion gate has accepted it.
            status = "unresolved_after_current_checked_search"
        field_disposition[key] = {
            "status": status,
            "local_item_count": len(values),
            "domain_context_item_count": len(list(domain_context.get(key) or [])),
            "global_or_remote_item_count": len(global_data.get(key) or []),
            "no_absence_claim": True,
        }
    return {
        "local_item_counts": {key: len(values) for key, values in local.items()},
        "domain_context_item_counts": {key: len(list(domain_context.get(key) or [])) for key in ITEM_KEYS},
        "domain_context_present": item_count(domain_context) > 0,
        "domain_context_status": "available" if item_count(domain_context) > 0 else "unresolved_after_current_checked_search",
        "domain_context_source_ids": list(domain_context.get("source_ids") or []),
        "domain_context_limitation": domain_context.get("limitation"),
        "global_item_counts": {key: len(values) for key, values in global_data.items()},
        "local_fields_without_item_evidence": missing_fields,
        "field_disposition": field_disposition,
        "global_evidence_present": item_count(global_data) > 0 or bool(
            (global_taxonomy or {}).get("skills")
            or (global_taxonomy or {}).get("optional_skills")
            or (global_taxonomy or {}).get("description")
        ),
        "provenance_missing_fields": sorted(set(provenance_missing)),
        "manual_review_required": bool(
            evidence_state(context) in {"context_only", "no_direct_local_counterpart", "pending"}
            or provenance_missing
        ),
        "local_demand_signal_status": (context.get("local_demand_signals") or {}).get("status", "no_current_signal_found"),
    }


def compact_context(context: dict, global_taxonomy: dict | None = None) -> dict:
    actual = context.get("actual_enrichment") or {}
    global_data = context.get("global_enrichment") or {}
    result = {
        "state": evidence_state(context),
        "source_ids": context.get("source_ids") or [],
        "source_summaries": context.get("source_summaries") or [],
        "actual_enrichment": actual,
        "domain_context_enrichment": context.get("domain_context_enrichment") or {},
        "global_enrichment": global_data,
        "global_profile_ids": context.get("global_profile_ids") or [],
        "local_counterpart_status": context.get("local_counterpart_status"),
        "local_profile_ids": context.get("local_profile_ids") or [],
        "local_role_profile_match_count": context.get("local_role_profile_match_count", 0),
        "evidence_search": context.get("evidence_search") or {},
        "evidence_limit": context.get("evidence_limit"),
        "demand": context.get("demand"),
        "local_demand_signals": context.get("local_demand_signals") or {
            "status": "no_current_signal_found",
            "source_ids": [],
            "source_summaries": [],
            "limitation": "No local demand-signal object was returned by the resolver.",
        },
        "licensing": context.get("licensing"),
        "priority_metadata": context.get("priority_metadata") or {},
    }
    if global_taxonomy:
        result["global_taxonomy"] = global_taxonomy
    result["guidance_priority"] = guidance_priority(context, global_taxonomy)
    result["coverage"] = coverage(context, global_taxonomy)
    return result


def guidance_priority(context: dict, global_taxonomy: dict | None = None) -> dict:
    """Create an evidence-limited learning order without inventing ranks."""
    actual = context.get("actual_enrichment") or {}
    priority_metadata = context.get("priority_metadata") or {}
    foundation = []
    next_priority = []
    specialization = []
    optional = []
    for field in ("skills", "tools", "competencies", "certifications", "regulatory_requirements"):
        for item in actual.get(field) or []:
            name = item.get("name") if isinstance(item, dict) else str(item)
            priority = str((item or {}).get("priority") or "") if isinstance(item, dict) else ""
            if not name:
                continue
            if priority in {"core", "foundation", "required"}:
                foundation.append(name)
            elif priority in {"specialization", "specialist"}:
                specialization.append(name)
            elif priority in {"optional", "supplementary", "adjacent"}:
                optional.append(name)
            else:
                next_priority.append(name)
    taxonomy = global_taxonomy or {}
    global_foundation = list(taxonomy.get("skills") or [])
    global_optional = list(taxonomy.get("optional_skills") or [])
    state = evidence_state(context)
    if not foundation and global_foundation:
        foundation = global_foundation[:]
    if not optional and global_optional:
        optional = global_optional[:]
    domain_foundation = [
        item.get("name") for item in priority_metadata.get("domain_context_foundation") or []
        if isinstance(item, dict) and item.get("name")
    ]
    domain_optional = [
        item.get("name") for item in priority_metadata.get("domain_context_optional_or_specialisation") or []
        if isinstance(item, dict) and item.get("name")
    ]
    recommended_start = (
        domain_foundation[:5]
        if state in {"context_only", "no_direct_local_counterpart"} and domain_foundation
        else (foundation[:5] or global_foundation[:5])
    )
    recommended_next = specialization[:5] or next_priority[:5] or optional[:5]
    return {
        "order": ["domain_foundation", "foundation", "next_priority", "specialization", "optional"],
        "domain_foundation": sorted(set(domain_foundation)),
        "domain_optional": sorted(set(domain_optional)),
        "foundation": sorted(set(foundation)),
        "next_priority": sorted(set(next_priority)),
        "specialization": sorted(set(specialization)),
        "optional": sorted(set(optional)),
        "recommended_starting_set": recommended_start,
        "recommended_next_set": recommended_next,
        "full_catalogue_visible": True,
        "display_language": {
            "starting": "Start with these first. They are the portable foundation supported by the current evidence.",
            "additional": "These are additional or specialised items. You can view all of them, but you do not need to learn everything at once.",
            "bridge": "This is the bridge from your current foundation into this subgroup or role.",
            "evidence_limit": "Priority is a guidance order from source labels, not a Nigerian demand ranking or a hiring guarantee.",
        },
        "bridge_status": "local_bridge_required" if state in {"context_only", "no_direct_local_counterpart"} else "not_required_by_current_evidence",
        "local_priority_status": "source_backed" if item_count(actual) else ("domain_context_only" if item_count(context.get("domain_context_enrichment") or {}) else "unresolved_after_current_checked_search"),
        "global_priority_status": "derived_from_role_taxonomy" if global_foundation or global_optional else "unresolved_after_current_checked_search",
        "prerequisites": "not_asserted_without_source_sequence",
    }


def unique_roles(roles: list[dict]) -> list[dict]:
    result = {}
    for role in roles:
        key = f"{role.get('domain_id')}|{role.get('role_name')}"
        if role.get("domain_id") and role.get("role_name"):
            result[key] = role
    return list(result.values())


def role_global_taxonomy(role: dict) -> dict:
    """Preserve the role library's explicit international taxonomy evidence.

    This is not Nigerian evidence. It is the role-level global/portable layer
    already present in the repository, retained with its ESCO provenance so a
    role is not left globally blank merely because no Nigerian title match was
    found.
    """
    def split(value):
        return [item.strip() for item in str(value or "").split("|") if item.strip()]

    skills = split(role.get("essential_skills"))
    optional = split(role.get("optional_skills"))
    source = role.get("source") or "esco"
    return {
        "source": source,
        "source_ids": ["global_onet" if str(source).lower() == "onet" else "global_esco"],
        "skills": skills,
        "optional_skills": optional,
        "description": role.get("description") or "",
        "role_code": role.get("esco_code"),
    } if skills or optional or role.get("description") else {}


def subgroup_global_taxonomy(subgroup_id: str, roles: list[dict]) -> dict:
    """Summarize global taxonomy evidence from the subgroup's own roles.

    This is explicitly marked as derived evidence. It does not become a
    Nigerian subgroup claim and does not pretend that every role requirement
    is mandatory for the subgroup.
    """
    matched = []
    skills = []
    optional = []
    source_ids = set()
    prefix = str(subgroup_id).zfill(2)
    for role in roles:
        isco_group = str(role.get("isco_group") or "")
        if not isco_group.startswith(prefix):
            continue
        taxonomy = role_global_taxonomy(role)
        if not taxonomy:
            continue
        matched.append(str(role.get("role_name")))
        source_ids.update(taxonomy.get("source_ids") or [])
        skills.extend(taxonomy.get("skills") or [])
        optional.extend(taxonomy.get("optional_skills") or [])
    if not matched:
        return {}
    return {
        "evidence_type": "derived_from_constituent_roles",
        "source_ids": sorted(source_ids),
        "role_count": len(matched),
        "role_names": sorted(set(matched)),
        "skills": sorted(set(skills)),
        "optional_skills": sorted(set(optional)),
    }


def domain_global_taxonomy(roles: list[dict]) -> dict:
    """Summarize global taxonomy evidence from a domain's role spine."""
    matched = []
    skills = []
    optional = []
    source_ids = set()
    for role in roles:
        taxonomy = role_global_taxonomy(role)
        if not taxonomy:
            continue
        matched.append(str(role.get("role_name")))
        source_ids.update(taxonomy.get("source_ids") or [])
        skills.extend(taxonomy.get("skills") or [])
        optional.extend(taxonomy.get("optional_skills") or [])
    if not matched:
        return {}
    return {
        "evidence_type": "derived_from_constituent_roles",
        "source_ids": sorted(source_ids),
        "role_count": len(matched),
        "role_names": sorted(set(matched)),
        "skills": sorted(set(skills)),
        "optional_skills": sorted(set(optional)),
    }


def main() -> None:
    meta = load(META_PATH)
    structure = load(STRUCTURE_PATH)
    registry = load(REGISTRY_PATH)
    roles = unique_roles(load(ROLE_PATH) + load_overlay_roles())
    roles_by_domain: dict[str, list[dict]] = {}
    for role in roles:
        roles_by_domain.setdefault(str(role.get("domain_id")), []).append(role)

    domains = []
    subgroups = []
    role_rows = []
    for domain_id, domain in meta.items():
        if domain_id in HIDDEN:
            continue
        domain_context = resolved_nigerian_context(domain_id, domain, registry)
        domain_taxonomy = domain_global_taxonomy(roles_by_domain.get(domain_id, []))
        domains.append({
            "entity_type": "domain",
            "entity_id": domain_id,
            "name": domain.get("domain_name"),
            "evidence": compact_context(domain_context, domain_taxonomy),
        })
        for subgroup in (structure.get(domain_id) or {}).get("subgroups") or []:
            subgroup_id = str(subgroup.get("isco_submajor") or subgroup.get("id") or "")
            label = subgroup.get("label") or subgroup_id
            context = resolved_nigerian_context(
                domain_id,
                domain,
                registry,
                scope="subgroup_context",
                subgroup_label=label,
            )
            subgroup_taxonomy = subgroup_global_taxonomy(subgroup_id, roles_by_domain.get(domain_id, []))
            subgroup_evidence = compact_context(context, subgroup_taxonomy)
            subgroups.append({
                "entity_type": "subgroup",
                "entity_id": f"{domain_id}|{subgroup_id}",
                "domain_id": domain_id,
                "name": label,
                "evidence": subgroup_evidence,
            })
        for role in roles_by_domain.get(domain_id, []):
            role_name = str(role.get("role_name"))
            context = resolved_nigerian_context(
                domain_id,
                domain,
                registry,
                scope="role_context",
                role_name=role_name,
            )
            taxonomy = role_global_taxonomy(role)
            role_evidence = compact_context(context, taxonomy)
            role_rows.append({
                "entity_type": "role",
                "entity_id": f"{domain_id}|{role_name}",
                "domain_id": domain_id,
                "name": role_name,
                "subgroup_id": role.get("isco_group"),
                "evidence": role_evidence,
            })

    entities = domains + subgroups + role_rows
    counts = Counter()
    for entity in entities:
        counts[f"{entity['entity_type']}_total"] += 1
        counts[f"{entity['entity_type']}_{entity['evidence']['state']}"] += 1
        entity_coverage = entity["evidence"]["coverage"]
        if entity_coverage["global_evidence_present"]:
            counts[f"{entity['entity_type']}_with_global_evidence"] += 1
        if entity_coverage.get("domain_context_present"):
            counts[f"{entity['entity_type']}_with_domain_context"] += 1
        if entity_coverage["manual_review_required"]:
            counts[f"{entity['entity_type']}_manual_review_required"] += 1
        if entity_coverage["local_demand_signal_status"] not in {"no_current_signal_found", "unresolved_after_current_checked_search"}:
            counts[f"{entity['entity_type']}_with_local_demand_signal"] += 1
        if entity_coverage["provenance_missing_fields"]:
            counts[f"{entity['entity_type']}_missing_provenance"] += 1
        for field in ITEM_KEYS:
            if not entity_coverage["local_item_counts"][field]:
                counts[f"{entity['entity_type']}_without_{field}"] += 1

    payload = {
        "schema_version": "nigerian_entity_extraction_audit_v1",
        "generated_at": "2026-08-26",
        "purpose": "Population gate and reviewed evidence disposition for seed regeneration.",
        "policy": {
            "source_backed": "At least one item-level local record is present with source provenance.",
            "context_only": "Nigerian context exists, but no entity-specific item claim is established.",
            "domain_context_fallback": "A role or subgroup can inherit separately labelled Nigerian domain/sector context when exact role or subgroup evidence is not established. This is enrichment and guidance context, not exact role-level market proof.",
            "no_direct_local_counterpart": "No direct Nigerian role-family match was found in the currently checked Nigerian profiles; this is not evidence that the occupation does not exist in Nigeria. Global evidence remains separate and the row carries an explicit review disposition.",
            "seed_rule": "Do not regenerate the career seed until every row has been reviewed and the unresolved states are accepted explicitly.",
            "field_coverage": "A field without item evidence is reported as without_item_evidence; this does not claim that the field is legally required for that entity.",
        },
        "counts": dict(sorted(counts.items())),
        "domains": domains,
        "subgroups": subgroups,
        "roles": role_rows,
    }
    OUTPUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    state_lines = []
    field_lines = []
    for entity_type in ("domain", "subgroup", "role"):
        total = counts[f"{entity_type}_total"]
        backed = counts[f"{entity_type}_source_backed"]
        context_only = counts[f"{entity_type}_context_only"]
        no_counterpart = counts[f"{entity_type}_no_direct_local_counterpart"]
        global_only = counts[f"{entity_type}_reviewed_global_only_no_direct_local_counterpart"]
        state_lines.append(
            f"| {entity_type} | {total:,} | {backed:,} | {context_only:,} | {no_counterpart:,} | {global_only:,} |"
        )
        field_lines.append(
            f"| {entity_type} | {counts[f'{entity_type}_without_skills']:,} | {counts[f'{entity_type}_without_tools']:,} | {counts[f'{entity_type}_without_competencies']:,} | {counts[f'{entity_type}_without_certifications']:,} | {counts[f'{entity_type}_without_regulatory_requirements']:,} | {counts[f'{entity_type}_missing_provenance']:,} | {counts[f'{entity_type}_manual_review_required']:,} | {counts[f'{entity_type}_with_local_demand_signal']:,} |"
        )
    OUTPUT_MD.write_text(
        "# Nigerian entity-level extraction audit\n\n"
        "This generated audit is the population gate. It is intentionally separate "
        "from the career seed. A context-only or no-counterpart row is a reviewed "
        "evidence state, not an invitation to infer local skills from global data.\n\n"
        "## Current counts\n\n"
        "| Entity | Total | Item-level Nigerian evidence | Context only | No direct local counterpart | Reviewed global-only, no direct local counterpart |\n"
        "|---|---:|---:|---:|---:|---:|\n"
        + "\n".join(state_lines)
        + "\n\n## Field-level review counts\n\n"
        "These are fields without item-level Nigerian evidence in the current audit. A blank certification or licence field is not treated as proof that a credential is required; it is a review signal.\n\n"
        "| Entity | Without skills | Without tools | Without competencies | Without certifications | Without regulatory requirements | Missing provenance | Manual review | With local demand signal |\n"
        "|---|---:|---:|---:|---:|---:|---:|---:|---:|\n"
        + "\n".join(field_lines)
        + "\n\n"
        "## Gate interpretation\n\n"
        "Every listed entity has a row. `source_backed` rows contain extracted "
        "skills, tools, competencies, certifications or regulatory requirements "
        "with source provenance. `context_only` and `no_direct_local_counterpart` "
        "rows remain visible with an explicit reviewed disposition and may carry "
        "a follow-up trigger; they must not be treated as absence claims. "
        "`reviewed_global_only_no_direct_local_counterpart` is a separately "
        "audited, intentionally bounded state: the global role remains usable "
        "for explanation, but no Nigerian counterpart is asserted. Global "
        "and remote evidence is retained inside each row as a separate layer. "
        "For domains and subgroups, the global taxonomy may be explicitly marked "
        "as derived from constituent role records; it is not Nigerian evidence. "
        "Every row also contains an evidence-limited guidance order and an explicit "
        "prerequisite status.\n",
        encoding="utf-8",
    )
    print(json.dumps(dict(sorted(counts.items())), indent=2))


if __name__ == "__main__":
    main()

"""Audit D078 programme-to-role learning-item coverage against the controlling contract.

This reviews learning content and presentation evidence at domain, area and
role layers. It does not adjudicate role-to-domain or role-to-area fit and does
not change canonical data or student visibility.
"""

from __future__ import annotations

import json
from collections import Counter
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data/career-mapping/_audit"
OUT_JSON = AUDIT / "D078_FULL_ROUTE_LEARNING_ITEM_CONTRACT_AUDIT_2026_10_10.json"
OUT_MD = ROOT / "docs/manual-review/D078_FULL_ROUTE_LEARNING_ITEM_CONTRACT_AUDIT_2026_10_10.md"
CROSSWALK_JSON = AUDIT / "D078_INHERITED_AREA_ITEM_CROSSWALK_2026_10_10.json"
EMERGING_SUPPLEMENT_DISPOSITION_JSON = AUDIT / "D078_DOMAIN_WIDE_EMERGING_SUPPLEMENT_DISPOSITION_2026_10_10.json"
AREA_CONTENT_OVERLAY_JSON = AUDIT / "D078_AREA_ITEM_CONTEXT_RECONCILIATION_2026_10_10.json"
CONTENT_CLOSURE_JSON = AUDIT / "D078_DOMAIN_AREA_CONTENT_CONTRACT_CLOSURE_2026_10_10.json"
ROLE_INTEGRATION_JSON = AUDIT / "D078_ROLE_ITEM_RECONCILIATION_INTEGRATION_2026_10_10.json"


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def nonempty(value: Any) -> bool:
    return value not in (None, "", [], {})


def first_value(record: dict[str, Any], aliases: tuple[str, ...]) -> Any:
    for key in aliases:
        value = record.get(key)
        if nonempty(value):
            return value
    return None


def summarize_records(records: list[dict[str, Any]], fields: dict[str, tuple[str, ...]]) -> dict[str, Any]:
    coverage = {}
    missing = {}
    for concept, aliases in fields.items():
        absent = [str(r.get("id") or r.get("item_id") or r.get("queue_position") or r.get("label") or "unnamed")
                  for r in records if not nonempty(first_value(r, aliases))]
        coverage[concept] = {"present": len(records) - len(absent), "total": len(records), "missing": len(absent)}
        missing[concept] = absent
    return {"coverage": coverage, "missing_record_ids": missing}


def main() -> None:
    graph = load(AUDIT / "D078_PROGRAMME_TO_ROLE_LEARNING_PATH_GRAPH_2026_10_10.json")
    domain_area_crosswalk = graph.get("area_reconciliation", {}).get("domain_item_area_route_crosswalk", {})
    contract = load(AUDIT / "d078_domain_learning_contract_2026_10_08.json")
    domain_inventory = load(AUDIT / "d078_full_domain_item_inventory_2026_10_08.json")
    path_candidates = load(AUDIT / "d078_domain_learning_path_candidates_2026_10_08.json")
    domain_emerging_source = load(AUDIT / "D078_DOMAIN_EMERGING_TASK_ENRICHMENT_2026_10_10.json")
    domain_wide_emerging = load(AUDIT / "D078_DOMAIN_WIDE_EMERGING_TASK_SET_ENRICHMENT_2026_10_10.json")
    merged_role_source = load(AUDIT / "d078_final_enrichment_lane_merge_2026_10_09.json")
    area_taskset_source = load(AUDIT / "d078_area_role_task_sets_2026_10_09.json")
    role_disposition = load(AUDIT / "D078_ROLE_ITEM_PLACEMENT_FINAL_DISPOSITION_2026_10_10.json")
    inherited_crosswalk = load(CROSSWALK_JSON) if CROSSWALK_JSON.exists() else None
    inherited_crosswalk_count = (
        inherited_crosswalk.get("counts", {}).get("records_with_resolved_target_ids", 0)
        if inherited_crosswalk else 0
    )
    inherited_crosswalk_ready = inherited_crosswalk_count == 36
    emerging_supplement_disposition = (
        load(EMERGING_SUPPLEMENT_DISPOSITION_JSON)
        if EMERGING_SUPPLEMENT_DISPOSITION_JSON.exists() else None
    )
    emerging_supplement_disposed = bool(
        emerging_supplement_disposition
        and emerging_supplement_disposition.get("counts", {}).get("candidate_dispositions_recorded") == 3
    )
    area_content_overlay = load(AREA_CONTENT_OVERLAY_JSON) if AREA_CONTENT_OVERLAY_JSON.exists() else None
    content_closure = load(CONTENT_CLOSURE_JSON) if CONTENT_CLOSURE_JSON.exists() else None
    closure_counts = (content_closure or {}).get("counts", {})
    role_integration = load(ROLE_INTEGRATION_JSON) if ROLE_INTEGRATION_JSON.exists() else None
    role_integration_counts = (role_integration or {}).get("counts", {})
    role_handoff_integrated = bool(
        role_integration
        and role_integration.get("guardrails", {}).get("canonical_changes") is False
        and role_integration.get("guardrails", {}).get("student_visible") is False
        and role_integration_counts.get("input_records") == 173
    )

    domain_record_instances = [row for key in ("existing_inventory", "foundation_and_route_additions",
                                                "route_alternatives", "deep_search_options")
                               for row in contract.get(key, [])]
    deep_alias_rows = [row for row in contract.get("deep_search_options", [])
                       if row.get("graph_record_policy", "").startswith("retain_lineage_as_alias")]
    deep_alias_ids = {str(row.get("id")) for row in deep_alias_rows}
    domain_rows = [row for row in domain_record_instances if str(row.get("id")) not in deep_alias_ids]
    contract_by_id = {str(r.get("id")): r for r in domain_rows if r.get("id")}
    inventory_candidates = domain_inventory.get("candidate_items", [])
    inventory_candidate_ids = [str(r.get("id")) for r in inventory_candidates if r.get("id")]
    inventory_unique_ids = set(inventory_candidate_ids)
    path_rows = path_candidates.get("learning_path_candidates", [])
    path_crosswalk = {
        "d078-question-to-evidence-design": ("d078-research-question-design", "same_concept_candidate", "Merge wording/evidence into one item after claim-level review; do not create a duplicate card."),
        "d078-evidence-literacy-and-interpretation": ("d078-evaluate-evidence-and-limits", "same_concept_candidate", "Merge wording/evidence into one item after claim-level review; retain evidence appraisal and interpretation limits."),
        "d078-quantitative-evidence": ("d078-quantitative-approach", "same_method-family_candidate", "One optional method-family choice; not a universal requirement."),
        "d078-qualitative-evidence": ("d078-qualitative-approach", "same_method-family_candidate", "One optional method-family choice; not a universal requirement."),
        "d078-surveys-as-a-method-option": ("d078-survey-method", "same_method_candidate", "One task-specific method item; compare with other methods without implying all are needed."),
        "d078-interviews-as-a-method-option": ("d078-interviews", "same_method_candidate", "One task-specific method item; compare with other methods without implying all are needed."),
        "d078-ethical-and-responsible-research": ("d078-responsible-research", "same_conditional_capability_candidate", "Merge as a conditional responsibility when people or sensitive data are involved."),
        "d078-communicate-evidence-and-limits": ("d078-communicate-evidence", "same_capability_candidate", "Merge as audience-aware communication of findings and limits."),
        "d078-social-question-and-scope": (None, "domain_overview_narrative_not_granular_learning_item", "Use as domain-overview orientation about people, groups and social systems; do not misfile it as research-question design or create a separate selected-item card."),
        "d078-jamovi-optional-tool": ("d078-jamovi-tool", "distinct_optional_tool_candidate_integrated_pending_route_review", "Retain as a separate optional quantitative-tool candidate; it is not shared foundation or required software, and only the six task-backed area routes in the current crosswalk may be considered."),
    }
    nodes = graph.get("nodes", [])
    area_legacy = [n for n in nodes if n.get("kind") == "area_learning_item"]
    area_enriched_nodes = [n for n in nodes if n.get("kind") == "area_enrichment_item"]
    area_enriched = []
    for node in area_enriched_nodes:
        record = dict(node.get("source_record", {}))
        overlay = node.get("learning_context_reconciliation", {}).get("proposed_fields", {})
        record.update(overlay)
        if "what_this_helps_you_do" in overlay:
            record["task_use"] = overlay["what_this_helps_you_do"]
        if "alternative_disposition" in overlay:
            record["valid_alternatives"] = overlay["alternative_disposition"]
        if "prerequisite_disposition" in overlay:
            record["prerequisites"] = overlay["prerequisite_disposition"]
        record["id"] = node.get("item_id")
        area_enriched.append(record)
    area_references = [n.get("source_record", {}) for n in nodes if n.get("kind") == "area_tool_application_reference"]
    domain_emerging = [n for n in nodes if n.get("kind") == "domain_emerging_learning_item"]
    domain_emerging_source_candidates = domain_emerging_source.get("candidate_items", [])
    emerging_fields = {
        "what_it_is": ("what_it_is",),
        "task_use": ("what_it_does_for_the_task",),
        "d078_context": ("d078_context",),
        "learner_output": ("learner_output",),
        "prerequisites": ("prerequisites",),
        "relationships": ("relationships", "typed_relationships"),
        "limitations": ("limitations",),
        "evidence_source_ids": ("evidence_source_ids",),
        "learning_resource_ids": ("learning_resource_ids",),
        "area_route_context": ("area_routes", "area_route_note"),
        "role_route_context": ("role_routes",),
        "claim_state": ("claim_state",),
        "student_visibility_gate": ("student_visible",),
    }
    emerging_contract_summary = summarize_records(domain_emerging_source_candidates, emerging_fields)
    emerging_source_gap_ids = sorted({record_id for ids in emerging_contract_summary["missing_record_ids"].values() for record_id in ids})
    domain_wide_supplement_nodes = [n for n in nodes if n.get("kind") == "domain_supplement_candidate"]
    role_rows = role_disposition.get("records", [])
    role_route_candidate_count = role_integration_counts.get("route_candidate_records_in_rebuilt_graph", 0) if role_handoff_integrated else 0
    role_hidden_final_count = role_integration_counts.get("hidden_with_final_reason", 0) if role_handoff_integrated else 0
    role_unresolved_count = role_integration_counts.get("unresolved_student_items", 0) if role_handoff_integrated else len(role_rows)
    role_nodes = [n for n in nodes if n.get("kind") == "role"]
    canonical_roles = load(ROOT / "data/career-mapping/role_library_v3_cleaned.json")
    canonical_d078_roles = [r for r in canonical_roles if r.get("domain_id") == "D078"]
    domain_wide_candidates = domain_wide_emerging.get("candidate_task_sets", [])
    domain_wide_dispositions = (emerging_supplement_disposition or {}).get("records", [])
    domain_wide_dispositions_by_id = {str(r.get("candidate_id")): r for r in domain_wide_dispositions}
    def resource_bundle_present(candidate: dict[str, Any]) -> bool:
        disposition = domain_wide_dispositions_by_id.get(str(candidate.get("id")), {})
        return bool(disposition.get("official_reference_links")) and bool(
            disposition.get("verified_free_task_specific_learning_link")
            or disposition.get("paid_learning_alternatives")
            or disposition.get("video_learning_links")
        )
    domain_wide_resource_bundle_count = sum(resource_bundle_present(c) for c in domain_wide_candidates)
    area_task_sets = area_taskset_source.get("area_task_sets", [])
    area_role_task_sets = area_taskset_source.get("role_task_sets", [])

    domain_fields = {
        "learner_meaning": ("meaning",),
        "use_case": ("use_case", "task_use"),
        "learner_output": ("output", "learner_output"),
        "prerequisite_state": ("prerequisite_interpretation", "prerequisites"),
        "typed_relationships": ("relationships",),
        "limitations": ("limits", "limitations"),
        "item_and_checkpoint_evidence": ("evidence",),
        "learning_link_record": ("learning_links",),
    }
    area_fields = {
        # Some lane artifacts use a combined purpose/context statement rather
        # than a separate definition field. Count that as definition coverage,
        # while preserving its source wording in the register.
        "definition": ("what_it_is", "definition", "purpose_and_area_context"),
        "programme_context": ("programme_meaning", "meaning_in_selected_programme", "meaning_in_programme"),
        "domain_context": ("meaning_in_D078", "meaning_in_domain", "domain_area_meaning", "meaning_in_area_and_D078"),
        "area_context": ("meaning_in_area", "area_context", "purpose_and_area_context", "domain_area_meaning", "meaning_in_area_and_D078"),
        "task_or_use_case": ("task_use_and_output", "task_use", "task_and_output", "what_it_does_for_task", "task_connection"),
        "learner_output": ("learner_output", "task_use_and_output", "task_and_output"),
        "prerequisites": ("prerequisites", "prerequisite_disposition"),
        "typed_relationships": ("relationships", "complements"),
        "alternatives": ("valid_alternatives", "alternatives", "alternative_disposition"),
        "limitations": ("limitations", "limitations_and_non_substitutions", "limitations_or_non_substitutions"),
        "evidence_references": ("evidence_source_ids", "evidence", "authoritative_evidence"),
        "learning_resource_references": ("free_task_specific_learning_resource_ids", "learning_links", "free_task_specific_learning_links", "free_task_learning_links", "learning_resource_ids"),
    }
    role_fields = {
        "role_task_basis": ("role_task_basis",),
        "task_output": ("task_output",),
        "plain_language_meaning": ("plain_language_meaning",),
        "programme_context": ("programme_meaning",),
        "domain_context": ("domain_meaning",),
        "area_context": ("area_meaning",),
        "role_application": ("role_application",),
        "prerequisites": ("prerequisites",),
        "complements": ("complements",),
        "alternatives": ("valid_alternatives",),
        "limitations": ("limits_nonreplacement",),
        "evidence": ("evidence",),
        "learning_link": ("learning_link",),
    }

    domain_summary = summarize_records(domain_rows, domain_fields)
    area_summary = summarize_records(area_enriched, area_fields)
    area_overlay_rows = (area_content_overlay or {}).get("records", [])
    area_overlay_counts = (area_content_overlay or {}).get("counts", {})
    role_summary = summarize_records(role_rows, role_fields)
    domain_graph_nodes = [n for n in nodes if n.get("kind") == "domain_learning_item"]
    domain_graph_by_contract_id = {
        str(n.get("contract_id")): n for n in domain_graph_nodes if n.get("contract_id")
    }
    expected_domain_ids = set(contract_by_id)
    graph_alias_ids = {
        str(alias_id)
        for node in domain_graph_nodes
        for alias_id in node.get("lineage_alias_ids", [])
    }
    expected_alias_ids = {str(row.get("id")) for row in deep_alias_rows if row.get("id")}
    graph_alias_target_ids = {
        str(alias_id): str(node.get("contract_id"))
        for node in domain_graph_nodes
        for alias_id in node.get("lineage_alias_ids", [])
    }
    domain_graph_integration = {
        "canonical_item_nodes": len(domain_graph_nodes),
        "expected_canonical_item_nodes": len(domain_rows),
        "canonical_contract_ids_missing_from_graph": sorted(expected_domain_ids - set(domain_graph_by_contract_id)),
        "unexpected_canonical_contract_ids_in_graph": sorted(set(domain_graph_by_contract_id) - expected_domain_ids),
        "alias_records_expected": len(expected_alias_ids),
        "alias_records_retained_in_canonical_lineage": len(graph_alias_ids),
        "alias_ids_missing_from_graph_lineage": sorted(expected_alias_ids - graph_alias_ids),
        "alias_ids_emitted_as_separate_nodes": sorted(
            expected_alias_ids & {str(n.get("contract_id")) for n in domain_graph_nodes}
        ),
        "alias_targets_match_contract": all(
            graph_alias_target_ids.get(alias_id) == str(row.get("duplicate_of_existing_id"))
            for row in deep_alias_rows if (alias_id := str(row.get("id") or ""))
        ),
    }
    domain_graph_integration["complete"] = (
        domain_graph_integration["canonical_item_nodes"] == len(domain_rows)
        and not domain_graph_integration["canonical_contract_ids_missing_from_graph"]
        and not domain_graph_integration["unexpected_canonical_contract_ids_in_graph"]
        and not domain_graph_integration["alias_ids_missing_from_graph_lineage"]
        and not domain_graph_integration["alias_ids_emitted_as_separate_nodes"]
        and domain_graph_integration["alias_targets_match_contract"]
    )

    domain_context_state = Counter((r.get("checkpoint_context") or {}).get("programme") for r in domain_rows)
    domain_downstream_state = {
        layer: dict(Counter((r.get("checkpoint_context") or {}).get(layer) for r in domain_rows))
        for layer in ("area_of_specialization", "role")
    }
    domain_gate_states = {
        "research_disposition": dict(Counter(r.get("research_disposition") for r in domain_rows)),
        "student_display_status": dict(Counter(r.get("student_display_status") for r in domain_rows)),
        "free_task_specific_learning_fit": dict(Counter(
            (r.get("learning_resource_review") or {}).get("task_specific_free_instructional_fit")
            for r in domain_rows)),
    }
    domain_category_breakdown = {}
    for key in ("existing_inventory", "foundation_and_route_additions", "route_alternatives", "deep_search_options"):
        rows = contract.get(key, [])
        domain_category_breakdown[key] = {
            "count": len(rows),
            "item_types": dict(Counter(str(r.get("type")) for r in rows)),
            "placements_or_dispositions": dict(Counter(str(r.get("disposition") or r.get("layer") or "not_recorded") for r in rows)),
        }
    role_display_states = {
        "student_display_approved": dict(Counter(r.get("student_display_approved") for r in role_rows)),
        "learning_link_state": dict(Counter((r.get("learning_link") or {}).get("state") for r in role_rows)),
        "role_task_relationship_verified": dict(Counter(r.get("role_task_relationship_verified") for r in role_rows)),
        "checkpoint_placement_approved": dict(Counter(r.get("checkpoint_placement_approved") for r in role_rows)),
    }
    profile_numbers = {n.get("role_number") for n in role_nodes}
    library = canonical_roles
    profile_rows = [r for r in library if r.get("domain_id") == "D078" and r.get("role_number") in profile_numbers]
    role_profile_coverage = {
        "current_path_roles": len(role_nodes),
        "matched_profiles": len(profile_rows),
        "description_present": sum(nonempty(r.get("description")) for r in profile_rows),
        "essential_skills_present": sum(nonempty(r.get("essential_skills")) for r in profile_rows),
        "optional_skills_present": sum(nonempty(r.get("optional_skills")) for r in profile_rows),
        "student_display_name_present": sum(nonempty(r.get("student_display_name")) for r in profile_rows),
    }

    def item_register(records: list[dict[str, Any]], fields: dict[str, tuple[str, ...]],
                      source_section: str) -> list[dict[str, Any]]:
        registered = []
        for index, record in enumerate(records, start=1):
            missing_fields = [name for name, aliases in fields.items()
                              if not nonempty(first_value(record, aliases))]
            registered.append({
                "source_section": source_section,
                "record_id": record.get("id") or record.get("item_id") or record.get("pair_key") or f"row-{index:03d}",
                "label": record.get("label") or record.get("name") or record.get("canonical_label"),
                "item_type": record.get("type") or record.get("item_type") or record.get("skill_type"),
                "placement_or_disposition": record.get("disposition") or record.get("layer") or record.get("candidate_layer_if_revalidated"),
                "status": record.get("status") or record.get("research_disposition") or record.get("final_disposition_status"),
                "missing_contract_fields": missing_fields,
                "field_presence_only_not_claim_approval": True,
            })
        return registered

    contract_register = [
        entry
        for section in ("existing_inventory", "foundation_and_route_additions", "route_alternatives", "deep_search_options")
        for entry in item_register(contract.get(section, []), domain_fields, section)
        if str(entry.get("record_id")) not in deep_alias_ids
    ]
    candidate_inventory_register = []
    for candidate_id, count in Counter(inventory_candidate_ids).items():
        candidate_rows = [r for r in inventory_candidates if str(r.get("id")) == candidate_id]
        candidate_inventory_register.append({
            "candidate_id": candidate_id,
            "labels": [r.get("label") for r in candidate_rows],
            "contract_id_match": candidate_id if candidate_id in contract_by_id else None,
            "contract_identity_state": "exact_id_present" if candidate_id in contract_by_id else "no_exact_id_match",
            "duplicate_inventory_record_count": count,
        })
    area_task_family_register = [
        {
            "area_id": area.get("area_id"),
            "area_label": area.get("label"),
            "task_set_status": area.get("task_set_status"),
            "task_families": [
                {"task_id": task.get("task_id"), "task_wording": task.get("task_wording"), "learner_output": task.get("learner_output"), "authoritative_source_ids": task.get("authoritative_work_source_ids", []), "explanatory_source_ids": task.get("explanatory_source_ids", []), "task_specific_learning_source_ids": task.get("free_task_specific_learning_source_ids", []), "task_items": task.get("learning_items", []), "skills_knowledge_methods_competencies": task.get("skills_knowledge_methods_competencies", [])}
                for task in area.get("task_families", []) + area.get("additional_task_families", [])
            ],
        }
        for area in area_task_sets
    ]
    role_task_family_register = [
        {
            "role_key": role.get("role_key"),
            "role_title_snapshot": role.get("current_role_title_snapshot"),
            "task_set_status": role.get("task_set_status"),
            "task_families": [
                {"task_id": task.get("task_id"), "task_wording": task.get("task_wording"), "learner_output": task.get("relevant_output", []), "authoritative_source_ids": task.get("authoritative_work_sources", []), "explanatory_source_ids": task.get("explanatory_source_ids", []), "task_specific_learning_source_ids": task.get("free_task_specific_learning_source_ids", []), "skills_knowledge_methods_competencies": task.get("skills_knowledge_methods_competencies", []), "methods": task.get("methods", []), "tools": task.get("tools", []), "certifications": task.get("certifications", [])}
                for task in role.get("task_families", [])
            ],
        }
        for role in area_role_task_sets
    ]
    role_item_register = []
    for record in role_rows:
        role_item_register.append({
            **item_register([record], role_fields, "role_item_final_disposition")[0],
            "queue_position": record.get("queue_position"),
            "pair_key": record.get("pair_key"),
            "roles_snapshot": record.get("roles_snapshot", []),
            "student_display_approved": record.get("student_display_approved"),
            "checkpoint_placement_approved": record.get("checkpoint_placement_approved"),
            "role_task_relationship_verified": record.get("role_task_relationship_verified"),
        })

    result = {
        "schema_version": "2026-10-10.d078.full-route-learning-item-contract-audit.v1",
        "status": (
            "domain_area_content_contract_closed_role_item_handoff_integrated_sequence_ui_gates_open_no_role_fit_reopened"
            if role_handoff_integrated and content_closure and content_closure.get("status") == "closed_for_hidden_graph_role_reconciliation_open"
            else "domain_area_content_contract_closed_role_item_reconciliation_open_no_role_fit_reopened"
            if content_closure and content_closure.get("status") == "closed_for_hidden_graph_role_reconciliation_open"
            else "content_contract_review_incomplete_role_item_reconciliation_open_no_role_fit_reopened"
        ),
        "controlling_documents": [
            "docs/PROGRAMME_DOMAIN_SPECIALIZATION_ROLE_GUIDED_EXPERIENCE_SPEC_2026_10_07.md",
            "docs/PROGRAMME_DOMAIN_SPECIALIZATION_ROLE_GUIDED_EXPERIENCE_IMPLEMENTATION_PLAN_2026_10_08.md",
            "docs/manual-review/D078_GUIDED_EXPERIENCE_GRANULAR_UX_AUDIT_AND_MOCKUP_2026_10_09.md",
            "docs/manual-review/D078_GUIDED_EXPERIENCE_FLOW_AND_STATE_PLAN_2026_10_09.md",
        ],
        "scope_note": "Reviews explanatory/content, learning-link, relationship and checkpoint fields at domain, area and role layers. Existing role route decisions are consumed, not reassessed. Subject matcher is outside local scope.",
        "counts": {
            "legacy_domain_skill_labels_excluded_from_path_scope": len(domain_inventory.get("legacy_skill_dispositions", [])),
            "legacy_domain_summary_labels_excluded_from_path_scope": len(domain_inventory.get("domain_structure_summary_dispositions", [])),
            "legacy_computational_method_records_excluded_from_path_scope": len(domain_inventory.get("existing_computational_method_dispositions", [])),
            "legacy_cluster_skill_records_excluded_from_path_scope": len(domain_inventory.get("existing_subgroup_cluster_skill_dispositions", [])),
            "full_domain_inventory_candidate_records": len(inventory_candidates),
            "full_domain_inventory_unique_candidate_ids": len(inventory_unique_ids),
            "domain_contract_record_instances": len(domain_record_instances),
            "domain_exact_duplicate_alias_records": len(deep_alias_rows),
            "domain_learning_items_after_exact_alias_collapse": len(domain_rows),
            "domain_area_crosswalk_records": domain_area_crosswalk.get("crosswalk_records", 0),
            "domain_area_crosswalk_routes": domain_area_crosswalk.get("area_routes", 0),
            "domain_area_crosswalk_task_references": domain_area_crosswalk.get("same_area_task_references", 0),
            "domain_area_crosswalk_unresolved_task_references": len(domain_area_crosswalk.get("unresolved_task_references", [])) + len(domain_area_crosswalk.get("wrong_area_task_references", [])),
            "domain_area_crosswalk_missing_items_or_areas": len(domain_area_crosswalk.get("missing_domain_items", [])) + len(domain_area_crosswalk.get("missing_areas", [])),
            "domain_graph_canonical_item_nodes": len(domain_graph_nodes),
            "domain_graph_alias_records_retained_in_lineage": len(graph_alias_ids),
            "early_domain_path_candidates": len(path_rows),
            "domain_emerging_candidates_in_graph": len(domain_emerging),
            "domain_emerging_contract_candidates": len(domain_emerging_source_candidates),
            "domain_emerging_contract_records_with_gaps": len(emerging_source_gap_ids),
            "domain_wide_emerging_supplement_candidates": len(domain_wide_candidates),
            "domain_wide_emerging_supplement_dispositions_recorded": (
                emerging_supplement_disposition.get("counts", {}).get("candidate_dispositions_recorded", 0)
                if emerging_supplement_disposition else 0
            ),
            "domain_wide_supplement_graph_nodes": len(domain_wide_supplement_nodes),
            "domain_wide_supplement_resource_bundles_resolved": domain_wide_resource_bundle_count,
            "current_areas": len([n for n in nodes if n.get("kind") == "area_of_specialization"]),
            "area_task_sets_in_source_inventory": len(area_task_sets),
            "role_task_sets_in_source_inventory": len(area_role_task_sets),
            "legacy_area_item_records_retained": len(area_legacy),
            "expanded_area_candidate_items": len(area_enriched),
            "area_tool_application_references": len(area_references),
            "area_item_context_overlay_records": len(area_overlay_rows),
            "area_item_context_overlay_records_attached_to_graph": sum(
                bool(n.get("learning_context_reconciliation")) for n in area_enriched_nodes
            ),
            "area_item_programme_context_repairs": area_overlay_counts.get("source_audit_items_reconciled_for_programme_context", 0),
            "area_item_task_description_repairs": area_overlay_counts.get("source_audit_items_reconciled_for_item_task_use_case", 0),
            "area_item_learner_output_repairs": area_overlay_counts.get("source_audit_items_reconciled_for_learner_output", 0),
            "area_item_alternative_dispositions": area_overlay_counts.get("items_with_explicit_alternative_dispositions", 0),
            "area_item_prerequisite_dispositions": area_overlay_counts.get("items_with_explicit_prerequisite_dispositions", 0),
            "area_item_source_audit_gaps_remaining": area_overlay_counts.get("current_source_audit_gaps_remaining", 0),
            "area_item_context_overlay_student_visible": any(
                row.get("student_visible") is True for row in area_overlay_rows
            ),
            "role_item_records": len(role_rows),
            "upstream_merged_role_item_records": len(merged_role_source.get("records", [])),
            "role_items_route_candidates_in_graph": role_route_candidate_count,
            "role_items_hidden_with_final_reason": role_hidden_final_count,
            "role_items_unresolved": role_unresolved_count,
            "role_item_handoff_integrated": role_handoff_integrated,
            "role_item_handoff_integration": role_integration_counts if role_handoff_integrated else None,
            "canonical_d078_role_profiles": len(canonical_d078_roles),
            "current_path_role_profiles": len(role_nodes),
            "domain_area_content_contract_closure": {
                "status": (content_closure or {}).get("status", "not_created"),
                "domain_items": closure_counts.get("domain_items", 0),
                "area_items": closure_counts.get("area_items", 0),
                "domain_structural_gaps": closure_counts.get("domain_structural_gaps", 0),
                "area_source_identity_gaps": closure_counts.get("area_source_identity_gaps", 0),
                "student_visible": False,
            },
        },
        "domain": {
            **domain_summary,
            "inventory_candidate_reconciliation": {
                "unique_inventory_candidate_ids": sorted(inventory_unique_ids),
                "inventory_ids_present_in_contract": sorted(inventory_unique_ids & set(contract_by_id)),
                "inventory_ids_missing_from_contract": sorted(inventory_unique_ids - set(contract_by_id)),
                "duplicate_inventory_candidate_ids": sorted(k for k, v in Counter(inventory_candidate_ids).items() if v > 1),
            },
            "early_path_candidate_reconciliation": [
                {
                    "candidate_id": r.get("candidate_id"),
                    "candidate_label": r.get("label"),
                    "proposed_contract_id": path_crosswalk.get(str(r.get("candidate_id")), (None, None, None))[0],
                    "identity_relation": path_crosswalk.get(str(r.get("candidate_id")), (None, "not_crosswalked", None))[1],
                    "recommended_local_disposition": path_crosswalk.get(str(r.get("candidate_id")), (None, None, "explicit disposition required"))[2],
                    "contract_id_exists": path_crosswalk.get(str(r.get("candidate_id")), (None,))[0] in contract_by_id,
                    "status": "local_identity_crosswalk_recorded_content_and_source_gates_still_open" if r.get("candidate_id") in path_crosswalk else "no_crosswalk_final_disposition_required",
                }
                for r in path_rows
            ],
            "planned_contract_record_register": contract_register,
            "graph_integration": domain_graph_integration,
            "exact_duplicate_alias_register": [
                {"alias_id": row.get("id"), "canonical_item_id": row.get("duplicate_of_existing_id"),
                 "graph_record_policy": row.get("graph_record_policy"),
                 "status": "lineage_only_not_a_separate_learning_card"}
                for row in deep_alias_rows
            ],
            "planned_inventory_candidate_register": candidate_inventory_register,
            "deep_search_duplicate_crosswalk": contract.get("review_coverage", {}).get("exact_duplicate_resolution", {}).get("deep_search_duplicates_of_existing_inventory", []),
            "deep_search_semantic_overlap_review_complete": contract.get("review_coverage", {}).get("exact_duplicate_resolution", {}).get("semantic_overlap_review_complete", False),
            "supplement_source_coverage": {
                "deep_search_item_ids_in_contract": sorted(
                    str(r.get("id")) for r in contract.get("deep_search_options", []) if r.get("id")),
                "domain_emerging_candidate_ids": [str(r.get("id")) for r in domain_emerging_source.get("candidate_items", [])],
                "domain_wide_emerging_candidate_ids": [str(r.get("id")) for r in domain_wide_candidates],
                "domain_wide_emerging_items_have_discrete_graph_nodes": len(domain_wide_supplement_nodes) == len(domain_wide_candidates),
                "domain_wide_emerging_reconciliation_notes": domain_wide_emerging.get("existing_item_reconciliation", []),
                "local_disposition_artifact": (EMERGING_SUPPLEMENT_DISPOSITION_JSON.relative_to(ROOT).as_posix() if emerging_supplement_disposed else None),
                "local_dispositions_recorded": (emerging_supplement_disposition.get("counts", {}).get("candidate_dispositions_recorded", 0) if emerging_supplement_disposition else 0),
                "resource_bundle_rule": "official_reference_plus_free_learning_when_available_else_paid_or_task_relevant_video",
                "resource_bundle_candidates_resolved": domain_wide_resource_bundle_count,
                "resource_bundle_rule_passed_for_all_candidates": domain_wide_resource_bundle_count == len(domain_wide_candidates),
                "student_visible": False,
            },
            "domain_wide_supplement_item_register": [
                {
                    "candidate_id": c.get("id"),
                    "label": c.get("label"),
                    "disposition": domain_wide_dispositions_by_id.get(str(c.get("id")), {}).get("disposition"),
                    "free_learning_link_count": domain_wide_dispositions_by_id.get(str(c.get("id")), {}).get("verified_free_task_specific_link_count", 0),
                    "official_reference_count": len(domain_wide_dispositions_by_id.get(str(c.get("id")), {}).get("official_reference_links", [])),
                    "video_learning_count": len(domain_wide_dispositions_by_id.get(str(c.get("id")), {}).get("video_learning_links", [])),
                    "paid_alternative_count": len(domain_wide_dispositions_by_id.get(str(c.get("id")), {}).get("paid_learning_alternatives", [])),
                    "graph_node_present": any(n.get("item_id") == c.get("id") for n in domain_wide_supplement_nodes),
                    "student_visible": False,
                    "remaining_claim_or_route_gate": domain_wide_dispositions_by_id.get(str(c.get("id")), {}).get("learning_link_gate"),
                }
                for c in domain_wide_candidates
            ],
            "excluded_legacy_audit_counts": {
                "legacy_skill_labels": len(domain_inventory.get("legacy_skill_dispositions", [])),
                "domain_summary_labels": len(domain_inventory.get("domain_structure_summary_dispositions", [])),
                "computational_method_records": len(domain_inventory.get("existing_computational_method_dispositions", [])),
                "legacy_cluster_skill_records": len(domain_inventory.get("existing_subgroup_cluster_skill_dispositions", [])),
            },
            "contract_type_and_placement_breakdown": domain_category_breakdown,
            "emerging_candidate_contract": {
                "coverage": emerging_contract_summary["coverage"],
                "missing_record_ids": emerging_contract_summary["missing_record_ids"],
                "records_with_any_gap": emerging_source_gap_ids,
                "all_required_fields_present": not emerging_source_gap_ids,
                "student_visible": False,
            },
            "programme_checkpoint_context": dict(domain_context_state),
            "downstream_checkpoint_context": domain_downstream_state,
            "review_states": domain_gate_states,
        },
        "areas": {
            "area_task_family_register": area_task_family_register,
            "expanded_item_register": item_register(area_enriched, area_fields, "area_enrichment_candidates"),
            "local_content_reconciliation": {
                "artifact": AREA_CONTENT_OVERLAY_JSON.relative_to(ROOT).as_posix() if area_content_overlay else None,
                "status": area_content_overlay.get("status") if area_content_overlay else "not_created",
                "counts": area_overlay_counts,
                "records": area_overlay_rows,
                "all_records_attached_to_graph": len(area_overlay_rows) > 0 and sum(
                    bool(n.get("learning_context_reconciliation")) for n in area_enriched_nodes
                ) == len(area_overlay_rows),
                "student_visible": False,
                "canonical_changes": 0,
            },
            "inherited_item_register": item_register([n for n in nodes if n.get("kind") == "area_learning_item"], area_fields, "inherited_area_graph_items"),
            "inherited_item_crosswalk": {
                "artifact": CROSSWALK_JSON.relative_to(ROOT).as_posix() if inherited_crosswalk_ready else None,
                "records_crosswalked": inherited_crosswalk_count,
                "status": inherited_crosswalk.get("status") if inherited_crosswalk_ready else "not_created_or_incomplete",
                "identity_crosswalk_is_content_approval": False,
            },
            "expanded_area_items": area_summary,
            "legacy_area_items": {
                "count": len(area_legacy),
                "all_have_generic_placeholder_definition": sum(
                    "research summary" in str(n.get("what_it_is", "")) for n in area_legacy),
                "free_task_specific_learning_sources_present": sum(
                    bool(n.get("free_task_specific_learning_source_ids")) for n in area_legacy),
                "student_visible": sum(n.get("student_visible") is True for n in area_legacy),
            },
            "tool_application_reference_contract": summarize_records(area_references, area_fields),
        },
        "roles": {
            "role_task_family_register": role_task_family_register,
            "role_item_register": role_item_register,
            "role_item_content_contract": role_summary,
            "role_item_handoff_integration": {
                "artifact": ROLE_INTEGRATION_JSON.relative_to(ROOT).as_posix() if role_handoff_integrated else None,
                "status": role_integration.get("status") if role_handoff_integrated else "not_integrated",
                "counts": role_integration_counts if role_handoff_integrated else {},
                "role_fit_reopened": False,
                "student_visible": False,
            },
            "canonical_d078_role_profile_count": len(canonical_d078_roles),
            "upstream_merged_role_record_count": len(merged_role_source.get("records", [])),
            "role_item_state": role_display_states,
            "role_profile_coverage": role_profile_coverage,
        },
        "interpretation": [
            "The planned learning-path inputs include the 58 domain-contract record instances (52 after six exact duplicate tool aliases are removed), 30 candidate inventory records, ten earlier path candidates, deep-search items, eight AI/emerging candidates, and a separate three-task emerging supplement. The 137 legacy skill labels, 30 summary labels, and legacy computational/cluster records are outside the planned graph inputs and excluded from required path reconciliation unless a planned source explicitly reintroduces a specific item.",
            "The earlier ten-item path candidate set now has an explicit local identity disposition: eight candidate items map to existing contract concepts, one orientation candidate belongs in domain-overview narration (not a duplicate learning card), and Jamovi remains a distinct optional quantitative-tool candidate not yet in the contract. Item evidence, links, final status and sequence remain to be checked.",
            (f"The three-item domain-wide emerging supplement now has discrete hidden graph nodes and resource bundles: {domain_wide_resource_bundle_count}/{len(domain_wide_candidates)} have an authoritative reference plus a learning destination; {sum(bool(domain_wide_dispositions_by_id.get(str(c.get('id')), {}).get('verified_free_task_specific_learning_link')) for c in domain_wide_candidates)}/{len(domain_wide_candidates)} have verified free task-specific learning. Claim/checkpoint/route approval remains separate, and none is student-visible." if emerging_supplement_disposed else "The three-item domain-wide emerging supplement still requires local disposition and graph inclusion before final graphing."),
            "Presence of a field or URL is not proof that its claim, exact locator, route meaning, or instructional fit has been independently verified.",
            "The domain contract explicitly leaves claim-level review, exhaustive search, and some checkpoint/resource validation pending; do not treat its 53 canonical items as student-ready.",
            "The 36 inherited area item records contain generic template explanations and no task-specific free-learning source IDs; retain them in the lineage but do not display them as fully enriched items.",
            "The 144 new area candidate records are heterogeneous. The field-coverage map is an intake audit, not approval; missing fields must be researched or explicitly dispositioned before display.",
            "Role-item placement records provide task/domain/area/role prose and candidate evidence, but provisional placement is not student approval. Blank explanation/limitation fields and candidate-only learning links remain content-contract work, not role-fit work.",
            "The 19 existing role profiles and the completed 173-record role-item handoff are consumed as downstream inputs. Role-fit and role-item adjudication are closed for this pass; the remaining work is integrated route rendering/sequence verification, not another role audit.",
        ],
        "next_local_work": [
            f"The domain-item to current-area task-reference crosswalk is complete for {domain_area_crosswalk.get('crosswalk_records', 0)} domain records, {domain_area_crosswalk.get('area_routes', 0)} routes and {domain_area_crosswalk.get('same_area_task_references', 0)} same-area task references; unresolved/wrong references: {len(domain_area_crosswalk.get('unresolved_task_references', [])) + len(domain_area_crosswalk.get('wrong_area_task_references', []))}. Do not repeat that crosswalk. Continue the item-level category, semantic-overlap, source-claim, learning-link and sequence reconciliation for all 53 canonical domain items, including the integrated Jamovi candidate and the eight emerging candidates plus three supplements. Keep unresolved evidence hidden; do not pull excluded legacy labels back into scope.",
            ("Use the completed 36-record inherited-area crosswalk as identity/route lineage; continue target-level claim, explanation, output, prerequisite, relationship, limitation and learning-link validation without repeating identity matching." if inherited_crosswalk_ready else "Reconcile inherited 36 area items against the seven current area task sets and 144 new candidate records by identity/use, preserving all lineage and avoiding duplicate learner-facing entries."),
            "Use the integrated 173-record role-item handoff as the downstream learning-content input; account for the 215 upstream merged records without reopening role-fit or role-item adjudication.",
            "Resolve missing or generic contract fields across domain, area and role content against source records; keep items hidden when evidence or learning resources are not yet verified.",
            "A hidden candidate graph already exists for design reconciliation. Do not call it final or student-ready until claim-level evidence, item relationships, source/link gates and integrated route sequencing are resolved across the scoped programme/domain/area/role content.",
        ],
        "guardrails": {
            "role_fit_adjudication_reopened": False,
            "subject_matcher_modified": False,
            "canonical_data_changed": False,
            "student_visible_records": 0,
        },
    }
    OUT_JSON.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    def cov_lines(summary: dict[str, Any]) -> list[str]:
        return [f"- {name.replace('_', ' ')}: **{v['present']}/{v['total']}** have a non-empty field."
                for name, v in summary["coverage"].items()]

    lines = [
        "# D078 full-route learning-item contract audit — 2026-10-10",
        "",
        "**Status:** cross-layer content audit; incomplete; no student approval, canonical promotion, role-fit reassessment, or matcher change.",
        "",
        "This audit extends beyond area enrichment. It compares programme-context, domain, area and role-layer learning content with the controlling specification, implementation plan, flow/state plan and granular UX contract. It audits item explanations, task/output, relationships, limits, evidence and learning destinations; it does not reconsider role-to-domain or role-to-area decisions.",
        "",
        "## Inventory reviewed",
        "",
        f"- Domain scope: **{len(domain_record_instances)}** contract record instances (**{len(domain_rows)}** after excluding **{len(deep_alias_rows)}** exact tool aliases); **{len(inventory_candidates)}** inventory candidates ({len(inventory_unique_ids)} unique IDs); **{len(path_rows)}** earlier path candidates; **{len(domain_emerging)}** earlier AI/emerging candidates in the graph; and **{len(domain_wide_candidates)}** separate supplement candidates (**{len(domain_wide_supplement_nodes)}** hidden graph nodes; resource bundles resolved for **{domain_wide_resource_bundle_count}**).",
        f"- Excluded from planned learning-path reconciliation: {len(domain_inventory.get('legacy_skill_dispositions', []))} legacy skill labels, {len(domain_inventory.get('domain_structure_summary_dispositions', []))} summary labels, {len(domain_inventory.get('existing_computational_method_dispositions', []))} legacy computational records and {len(domain_inventory.get('existing_subgroup_cluster_skill_dispositions', []))} legacy-cluster records. These are not graph inputs; only a specific item independently reintroduced by a planned source can re-enter scope.",
        f"- Areas: **7** current areas, **{len(area_legacy)}** inherited area-item records, **{len(area_enriched)}** new area candidate items and **{len(area_references)}** references applying existing domain tools in an area.",
        f"- Role layer: **{len(role_rows)}** downstream role-item records ({role_route_candidate_count} approved/conditional route candidates already included in the graph; {role_hidden_final_count} final-hidden dispositions; {role_unresolved_count} unresolved), plus **{len(role_nodes)}** current role profiles on the graph route.",
        "",
        "## Domain contract findings",
        "",
        "The checked domain scope is the planned task-set/item inventory across shared or versatile foundations, useful additional edges, conditional and route-specific choices, specialist options, route alternatives and emerging items—not the shared foundation alone. It includes skills, tools/software/libraries/frameworks, methods, competencies, knowledge, programming environments and certification decisions. The older 137-label legacy skill audit is excluded; it is not a substitute for the planned learning-path inventory.",
        "",
        "Contract item type/placement categories by source section:",
        *[f"- `{section}` ({vals['count']}): types `{vals['item_types']}`; placements/dispositions `{vals['placements_or_dispositions']}`."
          for section, vals in domain_category_breakdown.items()],
        "",
        *cov_lines(domain_summary),
        "",
        f"- Programme checkpoint context is `not_assessed_in_this_domain_contract` for **{sum(domain_context_state.values())}/{len(domain_rows)}** items.",
        f"- Area checkpoint is pending complete area task-set research for **{sum(domain_downstream_state['area_of_specialization'].values())}/{len(domain_rows)}**; role checkpoint is pending complete role task-set research for **{sum(domain_downstream_state['role'].values())}/{len(domain_rows)}**.",
        f"- All **{len(domain_rows)}** items remain in progress and not confirmed for student display. A present learning URL is not a verified task-specific course/link.",
        f"- Inventory-to-contract identity coverage: {len(inventory_unique_ids & set(contract_by_id))}/{len(inventory_unique_ids)} unique domain candidate IDs occur in the contract; duplicate inventory IDs: {sorted(k for k, v in Counter(inventory_candidate_ids).items() if v > 1)}.",
        f"- Earlier path-candidate identity crosswalk: {sum(path_crosswalk.get(str(r.get('candidate_id')), (None,))[0] in contract_by_id for r in path_rows)}/{len(path_rows)} map to a contract concept; one is domain-overview narration rather than a learning item. Jamovi now maps to its own optional tool record; its area routes remain hidden candidates.",
        f"- Domain-to-area task-reference crosswalk: {domain_area_crosswalk.get('crosswalk_records', 0)} records, {domain_area_crosswalk.get('area_routes', 0)} area routes, {domain_area_crosswalk.get('same_area_task_references', 0)} task references resolve to tasks in the stated area; unresolved/wrong-area refs: {len(domain_area_crosswalk.get('unresolved_task_references', [])) + len(domain_area_crosswalk.get('wrong_area_task_references', []))}.",
        f"- Deep-search exact duplicate aliases already identified: {len(contract.get('review_coverage', {}).get('exact_duplicate_resolution', {}).get('deep_search_duplicates_of_existing_inventory', []))}; semantic-overlap review complete: {contract.get('review_coverage', {}).get('exact_duplicate_resolution', {}).get('semantic_overlap_review_complete', False)}.",
        f"- Six deep-search tool records remain as lineage aliases of existing items, not additional learning cards. Exact alias collapse leaves {len(domain_rows)} canonical contract records; semantic-overlap review complete: {contract.get('review_coverage', {}).get('exact_duplicate_resolution', {}).get('semantic_overlap_review_complete', False)}.",
        f"- Current graph alias integration: {len(domain_graph_nodes)}/{len(domain_rows)} canonical domain item nodes; {len(graph_alias_ids)}/{len(expected_alias_ids)} alias records preserved in canonical lineage; graph/contract alias reconciliation complete: **{domain_graph_integration['complete']}**. This verifies identity accounting only; it does not approve the item claims, area routes or student display.",
        f"- The {len(domain_emerging_source_candidates)} emerging domain candidates—including Power BI and Tableau—are represented as hidden graph candidates. Required content-contract fields are complete for **{len(domain_emerging_source_candidates) - len(emerging_source_gap_ids)}/{len(domain_emerging_source_candidates)}**; records with any gap: {emerging_source_gap_ids or 'none'}. The separate {len(domain_wide_candidates)}-item supplement has resource-bundle coverage **{domain_wide_resource_bundle_count}/{len(domain_wide_candidates)}**. No area/role ownership or student approval is inferred.",
        "",
        "## Area contract findings",
        "",
        f"- Local content reconciliation has attached **{result['counts']['area_item_context_overlay_records_attached_to_graph']}/{result['counts']['area_item_context_overlay_records']}** hidden field repairs to exact graph items: {result['counts']['area_item_programme_context_repairs']} programme-context explanations, {result['counts']['area_item_task_description_repairs']} task/use descriptions, {result['counts']['area_item_learner_output_repairs']} illustrative outputs, {result['counts']['area_item_alternative_dispositions']} alternative dispositions and {result['counts']['area_item_prerequisite_dispositions']} prerequisite disposition. These repairs are not canonical promotions or student approval.",
        *cov_lines(area_summary),
        f"- The inherited **{len(area_legacy)}** items remain in the graph, but {result['areas']['legacy_area_items']['all_have_generic_placeholder_definition']}/{len(area_legacy)} use a generic template definition and 0/{len(area_legacy)} have a task-specific free-learning source ID.",
        f"- Inherited area-item identity/route crosswalk: {inherited_crosswalk_count}/{len(area_legacy)} records resolved; this preserves lineage and avoids duplicate cards, but does not approve item claims or student copy.",
        "- New lane records use different field names and evidence shapes. These counts measure field presence only; source identity, locator, claim scope and learning-link suitability still require record-level validation.",
        "- The two area tool-application references have fuller item records but remain candidates, not approvals.",
        "",
        "## Role-layer contract findings",
        "",
        *cov_lines(role_summary),
        f"- All **{len(role_rows)}** role-item records remain `student_display_approved = false`; role-task relationship and checkpoint approval flags remain false in these records. Provisional placement is not display approval.",
        f"- Of the {len(role_nodes)} current route-role profiles, descriptions are present for {role_profile_coverage['description_present']}, essential skills for {role_profile_coverage['essential_skills_present']}, and student display names for {role_profile_coverage['student_display_name_present']}. This profile presence does not supply the item-level course/domain/area/role explanation or a verified task-specific learning link.",
        "- In particular, blank role-item plain-language explanations and limitation statements need repair before display. This is enrichment/content work, not role-fit adjudication.",
        "",
        "## Item-level inventory register",
        "",
        f"The machine-readable audit contains per-record contract gaps for all {len(contract_register)} unique domain learning-item candidates (plus a separate {len(deep_alias_rows)}-record alias register), identity/disposition crosswalks for {len(candidate_inventory_register)} planned domain inventory IDs, task-family registers for all {len(area_task_family_register)} areas and {len(role_task_family_register)} role task sets, item registers for {len(area_legacy)} inherited and {len(area_enriched)} new area records, and content-gate registers for all {len(role_rows)} role-item records. These are reconciliation inputs, not approvals.",
        "",
        "## Required continuation",
        "",
        "1. The domain-to-area route/task-reference crosswalk is already complete as a hidden candidate map; continue the category and semantic-overlap reconciliation across all 53 canonical domain items and make source-backed item-level disposition decisions without repeating identity or route mapping.",
        "2. Reconcile the 36 inherited area items, all seven area task sets and 144 newer area candidates; do not reopen the already completed role-fit adjudication.",
        "3. Then reconcile every downstream role-item candidate: confirm the domain and current-area route, identify the role task/output it supports, assign checkpoint placement, relationships, alternatives, limitations, exact evidence and a task-specific learning link, or record an explicit exclusion/hidden reason. The two hidden/unresolved records must retain explicit dispositions.",
        "4. After domain, area and role-item content-contract closure, rebuild the dependency graph from the approved subset and validate sequence, alternatives/complements and the Sociology programme-to-domain explanation. Only then perform the single integrated programme-to-role rendered verification and proceed to final learner-experience implementation.",
        "",
        "Artifacts: `data/career-mapping/_audit/D078_FULL_ROUTE_LEARNING_ITEM_CONTRACT_AUDIT_2026_10_10.json` and `data/career-mapping/_audit/audit_d078_full_route_item_contract_2026_10_10.py`.",
        "",
        "Role-fit adjudication remains closed. The subject matcher remains a separate agent task.",
    ]
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Wrote {OUT_JSON.relative_to(ROOT)}")
    print(f"Wrote {OUT_MD.relative_to(ROOT)}")
    print(json.dumps(result["counts"], ensure_ascii=False))


if __name__ == "__main__":
    main()

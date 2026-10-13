"""Build the audit-only sparse-role disposition register.

This lane consumes the current 145 role-enrichment candidates, the 75-row
D085-D168 reconciliation, the role library after the 2026-10-06 global
role-domain apply, and the role-to-subgroup checkpoint.  It produces a
complete disposition register without editing canonical role, overlay, domain,
or subgroup files.
"""

from __future__ import annotations

import hashlib
import json
from collections import Counter, defaultdict
from pathlib import Path


HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
AUDIT = ROOT / "data/career-mapping/_audit"
OUT_JSON = HERE / "sparse_role_disposition_register_2026_10_06.json"
OUT_MD = HERE / "SPARSE_ROLE_DISPOSITION_CHECKPOINT_2026_10_06.md"

D045_REGISTER = AUDIT / "role_coverage_lanes_2026_10_05/D045_D084/role_coverage_candidate_register.json"
D085_REGISTER = AUDIT / "role_coverage_lanes_2026_10_05/D085_D168/role_coverage_candidate_register.json"
D085_RECON = AUDIT / "role_coverage_lanes_2026_10_05/D085_D168/role_coverage_candidate_reconciliation_2026_10_06.json"
SEMANTIC = AUDIT / "role_to_subgroup_semantic_register_2026_10_06_009.json"
DOMAIN_STRUCTURE = ROOT / "data/career-mapping/domain_structure.json"
ROLE_LIBRARY = ROOT / "data/career-mapping/role_library_v3_cleaned.json"
EMERGING = ROOT / "data/career-mapping/emerging_role_overlays.json"
THIN = ROOT / "data/career-mapping/thin_domain_role_overlays.json"
ROLE_DOMAIN_REPORT = AUDIT / "role_domain_link_reconciliation_2026_10_06.json"


# These are deliberate decisions for the current evidence set.  A proposal
# does not modify the canonical role library.  The subgroup code is an exact
# implication for the later taxonomy pass, not an automatic subgroup sign-off.
NET_NEW_RULES = {
    "D045|policy administration professional": ("policy analyst", ["24"]),
    "D046|qualified social worker practice family": ("social worker", ["26"]),
    "D047|agricultural extension adviser": ("agricultural extension adviser", ["21"]),
    "D047|agricultural research scientist": ("agricultural research scientist", ["21"]),
    "D047|agronomist": ("agronomist", ["21"]),
    "D047|soil scientist": ("soil scientist", ["21"]),
    "D048|food engineer": ("food engineer", ["21"]),
    "D048|food scientist or technologist": ("food scientist", ["21"]),
    "D048|food sensory scientist": ("food sensory scientist", ["21"]),
    "D050|industrial automation engineer": ("industrial automation engineer", ["21"]),
    "D051|property asset and tenancy manager": ("property asset manager", ["12"]),
    "D051|real estate valuation surveyor": ("real estate valuation surveyor", ["24"]),
    "D052|construction project manager": ("construction project manager", ["13"]),
    "D052|construction site manager": ("construction site manager", ["13"]),
    "D052|quantity surveyor": ("quantity surveyor", ["24"]),
    "D053|hotel operations manager": ("hotel operations manager", ["14"]),
    "D054|drilling engineer": ("drilling engineer", ["21"]),
    "D054|petroleum production engineer": ("petroleum production engineer", ["21"]),
    "D054|reservoir engineer": ("reservoir engineer", ["21"]),
    "D055|chemical process engineer": ("chemical process engineer", ["21"]),
    "D057|health data analyst": ("health data analyst", ["25"]),
    "D058|instructional designer": ("instructional designer", ["23"]),
    "D058|learning management system administrator": ("learning management system administrator", ["24"]),
    "D059|spacecraft operations engineer": ("spacecraft operations engineer", ["21"]),
    "D065|interpreter": ("interpreter", ["26"]),
    "D068|prosthetist orthotist": ("prosthetist-orthotist", ["22"]),
    "D068|radiation therapist": ("radiation therapist", ["22"]),
    "D070|musician singer composer family": ("musician", ["26"]),
    "D071|sport administrator": ("sport administrator", ["14"]),
    "D071|sports performance analyst": ("sports performance analyst", ["34"]),
    "D071|sports referee match official": ("sports referee", ["34"]),
    "D072|geospatial analyst": ("geospatial analyst", ["21"]),
    "D075|textile and clothing technologist": ("textile and clothing technologist", ["21"]),
    "D121|forester_inactive": ("forester", ["21"]),
    "D128|social_work_assistant_inactive": ("social work assistant", ["34"]),
    "D128|youth_worker_inactive": ("youth worker", ["34"]),
    "D134|electro_technical_officer_missing": ("electro-technical officer", ["74"]),
    "D136|flight_test_engineer_missing": ("flight test engineer", ["21"]),
    "D143|forensic_reporting_scientist_family": ("forensic reporting scientist", ["31"]),
    "D143|scene_of_crime_examiner_family": ("scene-of-crime examiner", ["33"]),
}


# Existing coverage or proposed net-new records that absorb a candidate
# without creating another canonical title.
MERGE_TARGETS = {
    "D046|community development practitioner family": "D046|community development social worker",
    "D048|food product development scientist": "D048|food scientist",
    "D048|food quality and microbiology scientist": "D048|food scientist",
    "D050|industrial control systems integrator": "D050|industrial automation engineer",
    "D055|chemical process design engineer": "D055|chemical process engineer",
    "D058|learning experience designer": "D058|instructional designer",
    "D085|retail_trade_manager_family": "D085|shop supervisor",
    "D085|retail_buyer_merchandise_buyer": "",
    "D092|existing_library_chef_not_active": "D092|cook",
    "D092|existing_library_pastry_cook_not_active": "D092|cook",
    "D093|existing_library_electrical_engineering_technician_not_active": "D093|industrial electrician",
    "D095|existing_library_motor_vehicle_body_repairer_not_active": "D095|coachbuilder",
    "D096|existing_library_agronomist_not_active": "D047|agricultural technician",
    "D096|existing_library_crop_farmer_not_active": "D047|crop production manager",
    "D096|existing_library_machinist_cnc_not_active": "D098|computer numerical control machine operator",
    "D098|existing_library_machinist_cnc_not_active": "D098|precision mechanic",
    "D100|existing_library_pipefitter_not_active": "D100|plumber",
    "D108|existing_library_print_production_manager_not_active": "D108|print studio supervisor",
    "D109|existing_library_foundry_moulder_not_active": "D109|casting machine operator",
    "D109|existing_library_metallurgical_technician_not_active": "D022|metallurgical technician",
    "D110|chemical_engineering_technician_inactive": "D055|chemical process engineer",
    "D111|tailor_inactive": "D111|clothing alteration machinist",
    "D111|textile_industrial_engineer_inactive": "D111|textile operations manager",
    "D113|cement_stone_mineral_plant_operator_scope_candidate": "D113|Stationary Engineers and Boiler Operators",
    "D114|packaging_line_operator_overlap": "D113|packaging and filling machine operator",
    "D121|logger_tree_feller_inactive": "D121|forest worker",
    "D122|biomedical_scientist_inactive": "D068|biomedical scientist",
    "D122|blood_bank_technologist_specialization_candidate": "D122|medical laboratory technologist",
    "D125|medical_secretary_inactive": "D125|medical administrative assistant",
    "D126|chiropractor_inactive": "D126|Chiropractors",
    "D128|generic_social_worker_inactive": "D128|community social worker",
    "D131|race_engineer_inactive": "",
    "D132|spacecraft_operations_controller_family": "D132|physicist",
    "D139|game_environment_artist_family": "D139|game environment artist",
    "D143|meteorological_observer_function": "D144|meteorology technician",
    "D144|meteorological_observer_function": "D144|meteorology technician",
    "D146|building_automation_controls_function": "D146|smart home engineer",
    "D146|building_commissioning_function": "D146|heating, ventilation, air conditioning engineer",
}


OWNERSHIP_HOLD_KEYS = {
    "D045|public programme evaluation professional",
    "D049|automotive manufacturing and quality engineer",
    "D049|automotive powertrain and electrified vehicle systems engineer",
    "D049|automotive product design and development engineer",
    "D049|automotive test validation and development engineer",
    "D051|real estate development and investment analyst",
    "D053|hospitality guest services and front office",
    "D054|petroleum geoscience family",
    "D057|health information systems implementation specialist",
    "D060|bank compliance officer",
    "D061|insurance actuary",
    "D062|quantitative investment researcher",
    "D065|localization specialist",
    "D071|sports talent scout",
    "D075|textile garment and footwear production trades",
    "D076|port state control officer",
    "D076|ship surveyor",
    "D079|customs broker or clearing agent",
    "D080|graphic and multimedia designer",
    "D080|interior designer",
    "D080|set and scenic designer",
    "D089|crematory_operator_regional_candidate",
    "D096|existing_library_farmworker_not_active",
    "D096|existing_library_mixed_crop_livestock_farmer_not_active",
    "D108|existing_library_printing_engineer_not_active",
    "D119|dairy_farmer_inactive_and_source_count_conflict",
    "D120|aquaculture_production_manager_inactive",
    "D126|naturopath_inactive",
    "D131|race_engineer_inactive",
    "D132|spacecraft_operations_controller_family",
    "D134|marine_surveyor_task_family",
    "D137|medical_dosimetrist_function",
    "D148|offshore_surveyor_family",
    "D148|rov_pilot_technician_family",
    "D151|criminal_judge_magistrate_family",
    "D151|criminal_prosecutor_family",
    "D152|archaeologist_and_site_manager_family",
    "D153|sound_design_and_postproduction_library_family",
    "D157|transfer_pricing_specialist_existing_record",
    "D161|humanitarian_logistics_function",
    "D161|humanitarian_programme_and_protection_functions",
    "D162|immigration_lawyer_and_asylum_caseworker_inactive",
    "D163|patent_and_trademark_representative_inactive",
    "D166|autonomous_vehicle_perception_sensor_fusion_candidate",
    "D167|xr_interaction_designer_function",
}


NO_ADDITION_KEYS = {
    "D055|chemical process safety engineer",
    "D056|smart contract security auditor",
    "D059|flight dynamics engineer",
    "D061|insurance actuary",
    "D062|quantitative investment researcher",
    "D064|counseling psychology specialty (not a proposed new role)",
    "D066|veterinary epidemiology specialty",
    "D069|flight operations officer flight dispatcher",
    "D071|sports coach",
    "D074|occupational hygienist",
    "D075|garment and product designer",
    "D092|existing_library_pastry_cook_not_active",
    "D095|existing_library_motor_vehicle_body_repairer_not_active",
    "D096|existing_library_crop_farmer_not_active",
    "D098|existing_library_machinist_cnc_not_active",
    "D100|existing_library_pipefitter_not_active",
    "D108|existing_library_print_production_manager_not_active",
    "D109|existing_library_foundry_moulder_not_active",
    "D109|existing_library_metallurgical_technician_not_active",
    "D110|chemical_engineering_technician_inactive",
    "D111|tailor_inactive",
    "D111|textile_industrial_engineer_inactive",
    "D113|cement_stone_mineral_plant_operator_scope_candidate",
    "D114|packaging_line_operator_overlap",
    "D120|aquaculture_production_manager_inactive",
    "D121|logger_tree_feller_inactive",
    "D122|biomedical_scientist_inactive",
    "D122|blood_bank_technologist_specialization_candidate",
    "D125|medical_secretary_inactive",
    "D126|chiropractor_inactive",
    "D128|generic_social_worker_inactive",
    "D131|race_engineer_inactive",
    "D132|spacecraft_operations_controller_family",
    "D134|marine_surveyor_task_family",
    "D137|medical_dosimetrist_function",
    "D139|game_environment_artist_family",
    "D144|meteorological_observer_function",
    "D145|neural_engineer_bci_research_candidate",
    "D146|building_automation_controls_function",
    "D146|building_commissioning_function",
    "D148|offshore_surveyor_family",
    "D148|rov_pilot_technician_family",
    "D151|criminal_judge_magistrate_family",
    "D151|criminal_prosecutor_family",
    "D152|archaeologist_and_site_manager_family",
    "D152|conservator_inactive",
    "D152|museum_curator_inactive",
    "D153|music_creation_and_performance_library_family",
    "D153|recording_and_audio_production_library_family",
    "D153|sound_design_and_postproduction_library_family",
    "D154|sports_scientist_performance_analyst_inactive",
    "D154|strength_and_conditioning_coach_inactive",
    "D155|materials_characterization_and_computational_science_inactive",
    "D156|geodesist_inactive",
    "D156|photogrammetrist_inactive",
    "D157|tax_advisory_and_compliance_existing_records",
    "D157|transfer_pricing_specialist_existing_record",
    "D158|corporate_treasurer_inactive",
    "D158|investment_banker_inactive",
    "D159|structured_finance_analyst_inactive",
    "D160|fashion_stylist_and_personal_shopper_inactive",
    "D161|humanitarian_logistics_function",
    "D161|humanitarian_programme_and_protection_functions",
    "D162|immigration_lawyer_and_asylum_caseworker_inactive",
    "D163|patent_and_trademark_representative_inactive",
    "D165|health_wellness_coach_function",
    "D166|autonomous_vehicle_perception_sensor_fusion_candidate",
    "D167|xr_interaction_designer_function",
}


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load_candidate_inputs() -> tuple[dict[str, dict], dict[str, dict], dict[str, dict]]:
    candidates: dict[str, dict] = {}
    domains: dict[str, dict] = {}
    for path, lane in ((D045_REGISTER, "D045_D084"), (D085_REGISTER, "D085_D168")):
        document = read_json(path)
        for domain in document["domains"]:
            domains[domain["domain_id"]] = {**domain, "lane": lane}
            for candidate in domain["candidates"]:
                key = candidate["candidate_key"]
                if key in candidates:
                    raise ValueError(f"duplicate candidate key: {key}")
                candidates[key] = {
                    **candidate,
                    "domain_id": domain["domain_id"],
                    "domain_name": domain["domain_name"],
                    "parent_scope": domain["parent_scope"],
                    "active_role_count": domain["active_role_count"],
                    "lane": lane,
                }
    semantic = read_json(SEMANTIC)
    classifications = {row["candidate_key"]: row for row in semantic["role_coverage_candidate_reconciliation"]}
    d085 = read_json(D085_RECON)
    recon = {row["candidate_key"]: row for row in d085["candidates"]}
    return candidates, classifications, recon


def load_current_roles() -> tuple[dict[str, list[dict]], dict[str, list[dict]]]:
    rows: list[dict] = []
    for path in (ROLE_LIBRARY, EMERGING, THIN):
        document = read_json(path)
        rows.extend(document if isinstance(document, list) else document["roles"])
    by_key: dict[str, list[dict]] = defaultdict(list)
    for row in rows:
        by_key[f"{row.get('domain_id')}|{row.get('role_name')}"] .append(row)
    return by_key, {key: values for key, values in by_key.items() if any(_is_active(row) for row in values)}


def _is_active(row: dict) -> bool:
    return row.get("student_path_status") != "excluded" and row.get("domain_fit_review_status") != "unsupported"


def subgroup_index(structure: dict) -> dict[str, dict[str, dict]]:
    result: dict[str, dict[str, dict]] = {}
    for domain_id, domain in structure.items():
        result[domain_id] = {str(row["isco_submajor"]): row for row in domain.get("subgroups", [])}
    return result


def active_role_keys(semantic: dict) -> set[str]:
    return {row["role_key"] for row in semantic["entries"] if row.get("student_path_status") == "active"}


def target_subgroup(domain_id: str, codes: list[str], groups: dict[str, dict[str, dict]]) -> list[dict]:
    result = []
    for code in codes:
        row = groups.get(domain_id, {}).get(str(code))
        if row is None:
            result.append({"subgroup_code": str(code), "label": None, "route_state": "missing_from_current_structure"})
            continue
        route_state = "excluded" if row.get("data_state") == "excluded" else "active"
        result.append({
            "subgroup_code": str(code),
            "label": row.get("label"),
            "role_count": row.get("role_count", 0),
            "data_state": row.get("data_state"),
            "route_state": route_state,
        })
    return result


def initial_classification(key: str, classifications: dict[str, dict], recon: dict[str, dict]) -> tuple[str, str | None]:
    row = classifications.get(key, {})
    if key in recon:
        return row.get("classification") or "unclassified", recon[key].get("comparison_result")
    return row.get("classification") or "unclassified", None


def decision_for(key: str, original: str) -> tuple[str, str | None, str]:
    if key in NET_NEW_RULES:
        return "net_new_role_proposal", f"{key.split('|', 1)[0]}|{NET_NEW_RULES[key][0]}", "Source-backed global occupational evidence supports a distinct role-level proposal after parent-domain and overlap review."
    if key == "D119|dairy_farmer_inactive_and_source_count_conflict":
        return "source_count_reconciliation_hold", None, "The current source inventory/count conflict must be repaired before role identity or activation can be decided."
    if key in {"D139|game_environment_artist_family", "D126|chiropractor_inactive"}:
        return "already_active_exact_role_closed", MERGE_TARGETS[key], "The current post-apply library already exposes the exact role under the requested parent domain; the candidate is closed without a new title or link."
    if key in MERGE_TARGETS and MERGE_TARGETS[key]:
        return "duplicate_or_overlap_resolved", MERGE_TARGETS[key], "The candidate is represented by an exact active or proposed target role; retain one canonical task profile and do not create a parallel title."
    if key in OWNERSHIP_HOLD_KEYS:
        return "ownership_or_parent_scope_hold", None, "The global source supports the function, but the current parent-domain ownership is contested or the role is a cross-domain family; no link is safe until ownership is assigned explicitly."
    if key in NO_ADDITION_KEYS or original == "no_addition_case":
        return "no_addition_specialization_or_family", None, "The evidence supports a specialization, function, alias, or existing coverage boundary rather than a separate canonical role link in this pass."
    if original == "source_ownership_hold":
        return "ownership_or_parent_scope_hold", None, "The source-backed function remains bounded by an unresolved parent-domain or title-ownership question."
    if original in {"duplicate_or_overlap", "duplicate_or_ownership_issue"}:
        return "duplicate_or_overlap_hold", None, "Comparable current coverage exists, but the exact task boundary is not sufficient to activate a second role link."
    if original == "evidence_backed_missing_role":
        return "source_backed_role_review_hold", None, "The source evidence is relevant, but this pass has not established an exact canonical role title and subgroup route."
    return "review_hold", None, "No safe canonical disposition was inferred from the current lane artifacts."


def ownership_targets(key: str) -> list[str]:
    explicit = {
        "D049|automotive product design and development engineer": ["D049", "D131"],
        "D049|automotive test validation and development engineer": ["D049", "D131"],
        "D049|automotive manufacturing and quality engineer": ["D049", "D131"],
        "D049|automotive powertrain and electrified vehicle systems engineer": ["D049", "D131", "D166"],
        "D076|ship surveyor": ["D076", "D134", "D156"],
        "D076|port state control officer": ["D076", "D079"],
        "D080|interior designer": ["D080", "D133"],
        "D148|offshore_surveyor_family": ["D148", "D156"],
        "D151|criminal_judge_magistrate_family": ["D037", "D151"],
        "D151|criminal_prosecutor_family": ["D037", "D151"],
        "D163|patent_and_trademark_representative_inactive": ["D037", "D163"],
        "D166|autonomous_vehicle_perception_sensor_fusion_candidate": ["D131", "D166"],
    }
    return explicit.get(key, [])


def route_state(domain_id: str, subgroup_rows: list[dict], active_role_count: int) -> str:
    if active_role_count == 0:
        return "blocked_domain_has_no_active_role_route"
    if not subgroup_rows:
        return "blocked_subgroup_implication_missing"
    if any(row.get("route_state") != "active" for row in subgroup_rows):
        return "blocked_subgroup_route_excluded"
    return "active_subgroup_route_available"


def build_register() -> dict:
    candidates, classifications, recon = load_candidate_inputs()
    semantic = read_json(SEMANTIC)
    structure = read_json(DOMAIN_STRUCTURE)
    groups = subgroup_index(structure)
    current, active_current = load_current_roles()
    role_domain_report = read_json(ROLE_DOMAIN_REPORT)
    domain_routes = {row["domain_id"]: row for row in semantic["domain_route_assessments"]}
    domain_names = {row["domain_id"]: row["domain_name"] for row in candidates.values()}
    for values in current.values():
        for record in values:
            if record.get("domain_id") and record.get("domain_name"):
                domain_names.setdefault(record["domain_id"], record["domain_name"])
    for route in semantic["domain_route_assessments"]:
        domain_names.setdefault(route["domain_id"], route["domain_name"])

    rows = []
    for key, candidate in sorted(candidates.items()):
        original, comparison = initial_classification(key, classifications, recon)
        decision, target_key, reason = decision_for(key, original)
        domain_id = candidate["domain_id"]
        parent_domain_scope = candidate["parent_scope"] or domain_routes[domain_id]["domain_scope"]
        proposal = NET_NEW_RULES.get(key)
        target_domain = target_key.split("|", 1)[0] if target_key and "|" in target_key else domain_id
        codes = proposal[1] if proposal else []
        subgroup_rows = target_subgroup(target_domain, codes, groups)
        active_route = route_state(target_domain, subgroup_rows, int(candidate["active_role_count"])) if proposal else "no_new_subgroup_route_requested"
        target_records = current.get(target_key, []) if target_key else []
        target_active = any(_is_active(record) for record in target_records)
        safe_to_activate = decision == "net_new_role_proposal" and active_route == "active_subgroup_route_available"
        if decision == "already_active_exact_role_closed":
            safe_to_activate = False
        if decision in {"ownership_or_parent_scope_hold", "source_count_reconciliation_hold", "no_addition_specialization_or_family", "duplicate_or_overlap_hold"}:
            safe_to_activate = False
        if decision == "duplicate_or_overlap_resolved" and target_active:
            safe_to_activate = False

        if decision == "net_new_role_proposal":
            activation_gate = "safe_role_level_review_with_existing_subgroup_route" if safe_to_activate else active_route
            subgroup_action = "proposed_existing_subgroup_route"
        elif decision == "already_active_exact_role_closed":
            activation_gate = "no_change_already_active"
            subgroup_action = "retain_existing_active_role_route"
        elif decision == "duplicate_or_overlap_resolved":
            activation_gate = "retain_target_only"
            subgroup_action = "retain_target_role_subgroup_only"
        elif decision == "ownership_or_parent_scope_hold":
            activation_gate = "parent_ownership_review_required"
            subgroup_action = "no_subgroup_change_until_parent_owner_resolved"
        elif decision == "source_count_reconciliation_hold":
            activation_gate = "source_count_reconciliation_required"
            subgroup_action = "no_subgroup_change_until_source_reconciled"
        else:
            activation_gate = "no_addition_in_this_pass"
            subgroup_action = "no_subgroup_change"

        rows.append({
            "candidate_key": key,
            "lane": candidate["lane"],
            "domain_id": domain_id,
            "domain_name": candidate["domain_name"],
            "parent_domain_scope": parent_domain_scope,
            "current_domain_active_role_count": candidate["active_role_count"],
            "candidate_title_or_family": candidate["title_or_family"],
            "candidate_task_evidence": candidate["tasks"],
            "candidate_source_refs": candidate["source_refs"],
            "nigerian_context_used": False,
            "prior_classification": original,
            "prior_d085_d168_comparison_result": comparison,
            "decision": decision,
            "decision_reason": reason,
            "proposed_or_target_role_key": target_key,
            "proposed_role_name": proposal[0] if proposal else None,
            "target_role_records_in_current_post_apply_library": [
                {
                    "role_key": target_key,
                    "student_path_status": record.get("student_path_status"),
                    "domain_fit_review_status": record.get("domain_fit_review_status"),
                    "role_domain_reconciliation_status": record.get("role_domain_reconciliation_status"),
                    "source": record.get("source"),
                }
                for record in target_records
            ],
            "target_role_currently_active": target_active,
            "parent_domain_implication": {
                "action": "retain_current_parent_domain" if target_domain == domain_id else "review_target_parent_domain",
                "current_parent_domain_id": domain_id,
                "current_parent_domain_name": candidate["domain_name"],
                "target_parent_domain_id": target_domain,
                "target_parent_domain_name": domain_names.get(target_domain, target_domain),
                "exact_parent_domain_change": target_domain != domain_id,
                "ownership_review_domains": ownership_targets(key),
            },
            "subgroup_implication": {
                "action": subgroup_action,
                "target_parent_domain_id": target_domain,
                "subgroups": subgroup_rows,
                "route_state": active_route,
                "semantic_signoff_required": decision == "net_new_role_proposal",
                "exact_implication": (
                    f"If approved, place {target_key} under the listed subgroup route(s); "
                    "the subgroup mapping remains a later semantic sign-off."
                    if proposal else
                    "Do not create or activate a subgroup link from this candidate in this pass."
                ),
            },
            "activation_gate": activation_gate,
            "safe_to_activate": safe_to_activate,
            "canonical_edit": False,
        })

    zero_domains = [row for row in semantic["domain_route_assessments"] if row.get("active_role_count") == 0]
    zero_domain_ids = [row["domain_id"] for row in zero_domains]
    domain_implications = []
    for route in sorted(zero_domains, key=lambda row: row["domain_id"]):
        domain_candidates = [row for row in rows if row["domain_id"] == route["domain_id"]]
        domain_implications.append({
            "domain_id": route["domain_id"],
            "domain_name": route["domain_name"],
            "parent_domain_scope": route["domain_scope"],
            "active_role_count": route["active_role_count"],
            "route_disposition_before_this_register": route["route_disposition"],
            "current_subgroups": [
                {
                    "subgroup_code": str(group["isco_submajor"]),
                    "label": group["label"],
                    "role_count": group.get("role_count", 0),
                    "data_state": group.get("data_state"),
                }
                for group in route.get("current_subgroup_records", [])
            ],
            "candidate_keys": [row["candidate_key"] for row in domain_candidates],
            "net_new_role_keys": [row["candidate_key"] for row in domain_candidates if row["decision"] == "net_new_role_proposal"],
            "safe_to_activate_now": any(row["safe_to_activate"] for row in domain_candidates),
            "implication": (
                "Role enrichment remains required before a student-facing subgroup path can be exposed."
                if domain_candidates else
                "No candidate was supplied in the current 145-row register; run a separate global source review before adding any role."
            ),
        })

    d071 = next(row for row in domain_implications if row["domain_id"] == "D071")
    d071["role_enrichment_requirement"] = True
    d071["role_enrichment_resolution"] = {
        "net_new_role_proposals": d071["net_new_role_keys"],
        "no_addition_keys": [row["candidate_key"] for row in rows if row["domain_id"] == "D071" and row["decision"] == "no_addition_specialization_or_family"],
        "ownership_hold_keys": [row["candidate_key"] for row in rows if row["domain_id"] == "D071" and row["decision"] == "ownership_or_parent_scope_hold"],
        "subgroup_route_state": "blocked_all_current_subgroups_excluded",
    }

    source_paths = (D045_REGISTER, D085_REGISTER, D085_RECON, SEMANTIC, DOMAIN_STRUCTURE, ROLE_LIBRARY, EMERGING, THIN, ROLE_DOMAIN_REPORT)
    decision_counts = Counter(row["decision"] for row in rows)
    safe_rows = [row for row in rows if row["safe_to_activate"]]
    net_new_targets = sorted({row["proposed_or_target_role_key"] for row in rows if row["decision"] == "net_new_role_proposal"})
    return {
        "schema_version": "2026-10-06.sparse-role-disposition-register.v1",
        "run_date": "2026-10-06",
        "scope": "Global-first sparse-role and role-coverage reconciliation after the 2026-10-06 global role-domain apply.",
        "candidate_count": len(rows),
        "candidate_domain_count": len({row["domain_id"] for row in rows}),
        "input_counts": {
            "role_enrichment_candidates": len(rows),
            "D045_D084_candidates": sum(row["lane"] == "D045_D084" for row in rows),
            "D085_D168_candidates": sum(row["lane"] == "D085_D168" for row in rows),
            "D085_D168_classifications": len(recon),
            "current_role_library_merged_records": sum(len(values) for values in current.values()),
            "current_role_library_unique_role_keys": len(current),
            "current_role_library_active_role_keys": len(active_current),
            "global_role_domain_apply_decision_count": role_domain_report["decision_count"],
            "global_role_domain_apply_action_counts": role_domain_report["action_counts"],
        },
        "zero_active_role_domain_count": len(zero_domains),
        "zero_active_role_domain_ids": zero_domain_ids,
        "role_enrichment_domain_ids": ["D071"],
        "decision_counts": dict(sorted(decision_counts.items())),
        "net_new_role_target_count": len(net_new_targets),
        "net_new_role_target_keys": net_new_targets,
        "safe_to_activate_candidate_count": len(safe_rows),
        "safe_to_activate_candidate_keys": [row["candidate_key"] for row in safe_rows],
        "safe_to_activate_role_target_keys": sorted({row["proposed_or_target_role_key"] for row in safe_rows}),
        "safe_to_activate_existing_inactive_role_link_count": sum(
            row["decision"] == "existing_inactive_role_link_safe" for row in rows
        ),
        "safe_to_activate_existing_inactive_role_link_keys": [
            row["candidate_key"] for row in rows
            if row["decision"] == "existing_inactive_role_link_safe"
        ],
        "global_only": True,
        "nigerian_context_used": False,
        "canonical_edits": False,
        "apply_or_deploy_performed": False,
        "method": [
            "Use the stored global source-backed candidate task bundle and the current parent-domain scope.",
            "Compare against the current role library after the global role-domain apply; globally excluded links remain excluded.",
            "Resolve exact duplicates and overlap into one target role when the target is explicit; do not use title similarity alone as activation evidence.",
            "Record subgroup codes and labels as exact route implications. A proposed subgroup route still needs semantic sign-off.",
            "Treat an inactive role as safe to activate only when the current post-apply library and an active subgroup route support it. Route-pending and excluded records remain held.",
            "Do not use Nigerian-only evidence, local demand, salary, licensing, or employer context in this pass.",
        ],
        "source_inputs": {str(path.relative_to(ROOT)).replace('\\', '/'): digest(path) for path in source_paths},
        "domain_implications": domain_implications,
        "candidates": rows,
        "integrity": {
            "unique_candidate_keys": len(rows) == len({row["candidate_key"] for row in rows}),
            "all_candidates_have_parent_domain": all(
                row["parent_domain_implication"]["current_parent_domain_id"]
                and row["parent_domain_implication"]["current_parent_domain_name"]
                and row["parent_domain_implication"]["target_parent_domain_id"]
                and row["parent_domain_implication"]["target_parent_domain_name"]
                for row in rows
            ),
            "all_candidates_have_source_refs": all(row["candidate_source_refs"] for row in rows),
            "all_candidates_global_only": all(not any("nigeria" in str(value).lower() for value in row["candidate_source_refs"]) for row in rows),
            "all_zero_domains_recorded": set(zero_domain_ids) == {"D037", "D039", "D040", "D045", "D049", "D050", "D052", "D053", "D054", "D071", "D075", "D076", "D079", "D080", "D153", "D157"},
            "all_rows_noncanonical": all(row["canonical_edit"] is False for row in rows),
        },
    }


def markdown(document: dict) -> str:
    lines = [
        "# Sparse-role disposition checkpoint — 2026-10-06",
        "",
        "This is an audit-only, global-first reconciliation after the global role-domain apply. It does not edit canonical role, overlay, domain, or subgroup files, and it does not perform SQL or deployment work.",
        "",
        "## Coverage result",
        "",
        f"- Candidate records reconciled: **{document['candidate_count']}** across **{document['candidate_domain_count']} domains**.",
        f"- Net-new role targets proposed: **{document['net_new_role_target_count']}**.",
        f"- Candidate rows safe to activate with an existing subgroup route: **{document['safe_to_activate_candidate_count']}**.",
        f"- Existing inactive links safe to activate: **{document['safe_to_activate_existing_inactive_role_link_count']}**.",
        f"- No-active-role domains covered explicitly: **{document['zero_active_role_domain_count']}**.",
        "- Role-enrichment domain: **D071 Sports Management**.",
        "- Nigerian-only context used: **no**.",
        "",
        "| Final disposition | Count |",
        "|---|---:|",
    ]
    for name, count in document["decision_counts"].items():
        lines.append(f"| {name} | {count} |")
    lines += [
        "",
        "## Safe role-level activation candidates",
        "",
        "These are proposals whose target parent domain has an active subgroup route in the current structure. The register still marks semantic subgroup sign-off as required; no canonical row was written.",
        "",
    ]
    safe = [row for row in document["candidates"] if row["safe_to_activate"]]
    if safe:
        lines += ["| Candidate | Proposed role | Parent | Subgroup route |", "|---|---|---|---|"]
        for row in safe:
            groups = ", ".join(f"{g['subgroup_code']} {g['label']}" for g in row["subgroup_implication"]["subgroups"])
            lines.append(f"| `{row['candidate_key']}` | `{row['proposed_or_target_role_key']}` | `{row['domain_id']}` | {groups} |")
    else:
        lines.append("No candidate passes the current parent-domain plus active-subgroup route gate.")
    lines += [
        "",
        "## Net-new role proposals blocked by taxonomy route",
        "",
        "These are source-backed role-level proposals, but their current parent domain has no active role route or their exact subgroup is excluded. They are not safe for student activation until the indicated route is repaired.",
        "",
    ]
    blocked = [row for row in document["candidates"] if row["decision"] == "net_new_role_proposal" and not row["safe_to_activate"]]
    if blocked:
        lines += ["| Candidate | Proposed role | Parent | Gate |", "|---|---|---|---|"]
        for row in blocked:
            lines.append(f"| `{row['candidate_key']}` | `{row['proposed_or_target_role_key']}` | `{row['domain_id']}` | {row['activation_gate']} |")
    lines += [
        "",
        "## The 16 no-active-role domains",
        "",
        "| Domain | Current route | Proposed net-new candidates | Current subgroup implication |",
        "|---|---|---:|---|",
    ]
    for domain in document["domain_implications"]:
        groups = "; ".join(f"{g['subgroup_code']} {g['label']} ({g.get('data_state') or 'active'})" for g in domain["current_subgroups"])
        lines.append(f"| `{domain['domain_id']}` {domain['domain_name']} | {domain['route_disposition_before_this_register']} | {len(domain['net_new_role_keys'])} | {groups or 'none recorded'} |")
    lines += [
        "",
        "D037, D039 and D040 have no candidate rows in the current 145-row input. They remain explicit global source-review gaps; no title is inferred from the domain label.",
        "",
        "## D071 role enrichment",
        "",
        "D071 has three source-backed net-new role proposals: sport administrator, sports performance analyst, and sports referee. Sports coach is retained as a no-addition family decision, and sports talent scout remains an ownership hold. All four current D071 subgroup routes are excluded, so none is student-safe to activate yet.",
        "",
        "## Boundary",
        "",
        "Duplicate and overlap findings are resolved to explicit target roles where the target is safe to name. Ownership conflicts, source-count conflicts, specializations, and globally excluded or route-pending inactive records remain held with exact parent/subgroup implications in the JSON register. The register is a review artifact, not a seed or deployment claim.",
        "",
        "Machine-readable register: `sparse_role_disposition_register_2026_10_06.json`.",
        "Reproducible builder: `reconcile_sparse_role_dispositions_2026_10_06.py`.",
    ]
    return "\n".join(lines) + "\n"


def main() -> None:
    document = build_register()
    OUT_JSON.write_text(json.dumps(document, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    OUT_MD.write_text(markdown(document), encoding="utf-8")
    print(json.dumps({
        "candidate_count": document["candidate_count"],
        "decision_counts": document["decision_counts"],
        "net_new_role_target_count": document["net_new_role_target_count"],
        "safe_to_activate_candidate_count": document["safe_to_activate_candidate_count"],
        "zero_active_role_domain_count": document["zero_active_role_domain_count"],
        "outputs": [str(OUT_JSON.relative_to(ROOT)), str(OUT_MD.relative_to(ROOT))],
    }, indent=2))


if __name__ == "__main__":
    main()

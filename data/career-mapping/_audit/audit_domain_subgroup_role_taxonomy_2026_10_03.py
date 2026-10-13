#!/usr/bin/env python3
"""Catalogue-wide inventory for domain, subgroup, role, and computational audits.

Read-only with respect to source data. The reports are triage/inventory artifacts,
not proof that any semantic role-to-domain assignment is correct. ISCO validates
an occupational family, not its placement under a particular product domain.
"""

from __future__ import annotations

import json
import math
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
sys.path.insert(0, str(ROOT))
from _role_overlay_loader import load_overlay_roles  # noqa: E402
from _role_tools_loader import load_role_tools  # noqa: E402
from _role_subgroup_route import effective_subgroup_code  # noqa: E402

OUT_JSON = AUDIT / "domain_subgroup_role_taxonomy_inventory_2026_10_03.json"
OUT_MD = AUDIT / "DOMAIN_SUBGROUP_ROLE_TAXONOMY_INVENTORY_2026-10-03.md"
STEP1_SPECIALIZATION_REGISTER = AUDIT / "specialization_lanes_2026_10_05" / "STEP1_RECONCILIATION_2026_10_06" / "global_step1_specialization_reconciliation_2026_10_06.json"

COMPUTATIONAL_TERMS = re.compile(
    r"\b(computational|quantitative|statistics?|statistical|data science|data analytics|"
    r"informatics|geospatial|gis|numerical|modelling|modeling|simulation|algorithm|"
    r"machine learning|artificial intelligence|digital methods|network analysis|"
    r"text mining|natural language processing|remote sensing|bioinformatics)\b",
    re.I,
)
HIGH_SIGNAL_TERMS = re.compile(
    r"\b(computational|quantitative|statistical|informatics|geospatial|numerical|"
    r"simulation|machine learning|artificial intelligence|bioinformatics|"
    r"natural language processing|text mining|network analysis)\b",
    re.I,
)


def load_json(name: str):
    return json.loads((ROOT / name).read_text(encoding="utf-8"))


def text(value) -> str:
    if value is None:
        return ""
    if isinstance(value, float) and math.isnan(value):
        return ""
    if isinstance(value, list):
        return " ".join(text(item) for item in value)
    if isinstance(value, dict):
        return " ".join(text(item) for item in value.values())
    value = str(value).strip()
    return "" if value.casefold() in {"nan", "none", "null", "n/a"} else value


def canon_roles() -> list[dict]:
    rows = load_json("role_library_v3_cleaned.json") + load_overlay_roles()
    # Mirror the seed's last-write-wins merge for identical domain/name keys.
    by_key = {}
    for row in rows:
        key = f"{row.get('domain_id')}|{row.get('role_name')}"
        by_key[key] = row
    return list(by_key.values())


def main() -> None:
    meta = load_json("domain_meta.json")
    structure = load_json("domain_structure.json")
    roles = canon_roles()
    role_tools = load_role_tools()
    # Preserve the historical inventory contract while recording the completed
    # catalogue-wide reconciliation beside it.  The old 42-domain register is
    # still used by legacy assertions; role-fit work must use the global Step 1
    # register, not mistake the old snapshot for the current completion state.
    specialization_review = load_json("_audit/domain_specialization_review_2026_10_03.json")
    specialization_decisions = {
        text(row.get("domain_id")): row
        for row in specialization_review.get("domain_reviews", [])
        if text(row.get("domain_id"))
    }
    global_specialization_review = (
        json.loads(STEP1_SPECIALIZATION_REGISTER.read_text(encoding="utf-8"))
        if STEP1_SPECIALIZATION_REGISTER.exists()
        else {"domains": [], "catalogue_domain_count": 0, "missing_domain_ids": []}
    )
    role_fit_path = AUDIT / "role_taxonomy_fit_review_2026_10_05.json"
    role_fit_reviews = {}
    if role_fit_path.exists():
        role_fit_reviews = {
            text(row.get("role_key")): row
            for row in load_json("_audit/role_taxonomy_fit_review_2026_10_05.json").get("role_reviews", [])
            if text(row.get("role_key"))
        }
    computational_manifest = load_json("computational_layer_manifest.json")
    method_evidence = load_json("computational_method_evidence.json").get("methods", [])
    related_links = load_json("computational_role_subgroup_links.json").get("links", [])
    isco_taxonomy = load_json("taxonomies/esco_isco_groups.json")

    roles_by_domain: dict[str, list[dict]] = defaultdict(list)
    roles_by_group: dict[tuple[str, str], list[dict]] = defaultdict(list)
    role_rows = []
    unknown_domain_roles = []
    for role in roles:
        did = str(role.get("domain_id") or "")
        name = text(role.get("role_name"))
        if did not in meta:
            unknown_domain_roles.append({"role_key": f"{did}|{name}", "domain_id": did})
        roles_by_domain[did].append(role)
        subgroup = effective_subgroup_code(role) or ""
        if subgroup:
            roles_by_group[(did, subgroup)].append(role)
        key = f"{did}|{name}"
        fit_review = role_fit_reviews.get(key) or {}
        evidence = role_tools.get(key) or {}
        esco_evidence = evidence.get("esco") or {}
        onet_evidence = evidence.get("onet") or {}
        all_text = " ".join([
            name, text(role.get("description")), text(role.get("essential_skills")),
            text(role.get("optional_skills")), text(evidence.get("tools")),
        ])
        domain = meta.get(did) or {}
        scope_text = " ".join([text(domain.get("domain_name")), text(domain.get("description"))])
        role_rows.append({
            "role_key": key,
            "domain_id": did,
            "domain_name": text(domain.get("domain_name")),
            "domain_scope": text(domain.get("description")),
            "role_name": name,
            "role_description": text(role.get("description")),
            "isco_group": text(role.get("isco_group")),
            "isco_submajor": subgroup or None,
            "effective_subgroup_route": subgroup or None,
            "esco_code": text(role.get("esco_code")),
            "identity_source": text(role.get("source")),
            "role_evidence_state": text(evidence.get("data_state")) or "no_role_evidence_bundle",
            "esco_occupation_uris": esco_evidence.get("occupation_uris") or [],
            "onet_occupation_codes": onet_evidence.get("occupation_codes") or [],
            "evidence_source_urls": sorted(set(
                text(uri) for uri in (esco_evidence.get("occupation_uris") or [])
                if text(uri).startswith("http")
            )),
            "explicit_semantic_review_status": text(role.get("domain_fit_review_status")) or None,
            "semantic_disposition": (
                text(fit_review.get("student_path_disposition"))
                or ("excluded_from_student_domain_path" if text(role.get("student_path_status")).casefold() == "excluded"
                    else "unreviewed_role_tasks_vs_domain_scope")
            ),
            "role_to_domain_fit_status": text(fit_review.get("domain_fit_status")) or text(role.get("domain_fit_review_status")) or "not_individually_reviewed",
            "role_to_specialization_fit_status": text(fit_review.get("specialization_fit_status")) or "not_individually_reviewed",
            "reviewed_specialization_key": text(fit_review.get("specialization_key")) or None,
            "role_fit_review_basis": text(fit_review.get("basis")) or None,
            "role_fit_review_source_refs": fit_review.get("source_refs") or [],
            "student_path_status": text(role.get("student_path_status")) or "active",
            "isco_membership_is_not_domain_fit_proof": True,
            "current_specialization_membership_is_not_domain_fit_proof": True,
            "isco_membership_is_not_specialization_fit_proof": True,
            "candidate_computational_evidence": sorted(set(HIGH_SIGNAL_TERMS.findall(all_text)), key=str.casefold),
            "computational_context_candidate": bool(COMPUTATIONAL_TERMS.search(scope_text) and HIGH_SIGNAL_TERMS.search(all_text)),
            "source_backed_role_tools_present": bool(evidence.get("data_state") == "source_backed" and evidence.get("tools")),
        })

    domains = []
    missing_subgroup_pairs = []
    unsupported_subgroups = []
    semantic_subgroup_triage = []
    raw_isco_label_matches = []
    subgroup_records = []
    isco_derived_subgroup_count = 0
    domains_without_scope_description = []
    for did, domain in meta.items():
        structure_row = structure.get(did) or {}
        if not text(domain.get("description")):
            domains_without_scope_description.append({
                "domain_id": did,
                "domain_name": text(domain.get("domain_name")),
                "active_role_count": sum(1 for r in roles_by_domain.get(did, []) if text(r.get("student_path_status") or "active").casefold() != "excluded"),
                "reason": "A role-task-to-domain-scope comparison needs a stated scope; title alone is insufficient for reliable sign-off.",
            })
        all_groups = structure_row.get("subgroups") or []
        visible_groups = [g for g in all_groups if text(g.get("data_state")).casefold() not in {"excluded", "review_only", "audit_only"}]
        active_roles = [r for r in roles_by_domain.get(did, []) if text(r.get("student_path_status") or "active").casefold() != "excluded"]
        observed_pairs = sorted({
            effective_subgroup_code(r)
            for r in active_roles if effective_subgroup_code(r)
        })
        visible_codes = {text(g.get("isco_submajor")) for g in visible_groups}
        visible_pairs = sorted(visible_codes)
        for pair in observed_pairs:
            if pair not in visible_codes:
                missing_subgroup_pairs.append({"domain_id": did, "isco_submajor": pair, "role_count": len(roles_by_group[(did, pair)]), "meaning": "roles have this occupational submajor but no visible subgroup card; may be intentional flat path"})
        for group in all_groups:
            code = text(group.get("isco_submajor"))
            subgroup_label = text(group.get("label"))
            isco_label = text((isco_taxonomy.get(code) or {}).get("label"))
            provenance = group.get("source_provenance") or {}
            definition_source = text(provenance.get("mapping_method") or provenance.get("source"))
            isco_derived = definition_source == "canonical_role_library_isco_submajor" or text(provenance.get("source")) == "isco_submajor_derived"
            isco_derived_subgroup_count += int(isco_derived)
            observed = len([r for r in active_roles if effective_subgroup_code(r) == code])
            if observed == 0 and text(group.get("data_state")).casefold() not in {"excluded", "review_only", "audit_only"}:
                unsupported_subgroups.append({"domain_id": did, "isco_submajor": code, "label": text(group.get("label")), "reason": "visible subgroup has no active role members"})
            # Heuristic only: subgroup terms are computational while domain scope is not;
            # this flags a scope-vs-label review, not an error.
            scope = " ".join([text(domain.get("domain_name")), text(domain.get("description"))])
            group_text = " ".join([text(group.get("label")), text(group.get("description"))])
            if HIGH_SIGNAL_TERMS.search(group_text) and not HIGH_SIGNAL_TERMS.search(scope):
                semantic_subgroup_triage.append({"domain_id": did, "domain_name": text(domain.get("domain_name")), "isco_submajor": code, "label": text(group.get("label")), "reason": "specialized computational/method label may be legitimate under a broader domain; verify scope and evidence"})
            if subgroup_label and isco_label and subgroup_label.casefold() == isco_label.casefold():
                raw_isco_label_matches.append({
                    "domain_id": did,
                    "domain_name": text(domain.get("domain_name")),
                    "isco_submajor": code,
                    "label": subgroup_label,
                    "active_role_count": observed,
                    "interpretation": "Label exactly repeats the broad ISCO occupational-family heading; flag for student-facing naming review, not automatically an error.",
                    "semantic_review_status": "not_individually_recorded",
                })
            subgroup_records.append({
                "domain_id": did,
                "domain_name": text(domain.get("domain_name")),
                "isco_submajor": code,
                "current_label": subgroup_label,
                "current_description": text(group.get("description")),
                "current_data_state": text(group.get("data_state") or "active"),
                "definition_source": definition_source or "not_recorded",
                "definition_is_isco_derived": isco_derived,
                "label_repeats_isco_heading": bool(subgroup_label and isco_label and subgroup_label.casefold() == isco_label.casefold()),
                "member_role_count_for_inventory_only": observed,
                "member_role_titles_for_specialization_design": sorted(
                    text(r.get("student_display_name") or r.get("role_name"))
                    for r in active_roles
                    if effective_subgroup_code(r) == code
                ),
                "parent_domain_fit_status": "not_individually_reviewed",
                "specialization_boundary_status": "not_individually_reviewed",
                "student_facing_name_status": "not_individually_reviewed",
                "role_membership_is_not_domain_fit_proof": True,
            })
        domain_text = " ".join([text(domain.get("domain_name")), text(domain.get("description"))])
        role_candidates = [r for r in role_rows if r["domain_id"] == did and r["computational_context_candidate"]]
        specialization_decision = specialization_decisions.get(did) or {}
        domains.append({
            "domain_id": did,
            "domain_name": text(domain.get("domain_name")),
            "domain_description": text(domain.get("description")),
            "subgroup_count_semantic_review_status": "not_individually_recorded",
            "specialization_set_review_status": text(specialization_decision.get("review_status")) or "not_individually_reviewed",
            "reviewed_specialization_count_recommendation": specialization_decision.get("specialization_count"),
            "specialization_implementation_status": (
                "pending_independent_specialization_ids_and_generator_support"
                if specialization_decision else "not_reviewed"
            ),
            # Counts and ISCO-derived groups are inventory facts only.  Do not
            # infer that a flat domain->role path or the existing subgroup
            # count is pedagogically correct from the threshold rule.
            "subgroup_structure_disposition": (
                "reviewed_specialization_set_replacement_pending_implementation"
                if specialization_decision else
                "unresolved_no_active_role_population"
                if not active_roles else
                "unresolved_no_specialization_vs_missing_specializations"
                if not visible_groups else
                "unresolved_specialization_count_boundaries_and_domain_fit"
            ),
            "subgroup_structure_review_required": True,
            "subgroup_structure_evidence_status": (
                "reviewed_with_source_recommendation_implementation_pending"
                if specialization_decision else "no_domain_specific_decision_recorded"
            ),
            "zero_subgroup_flat_path_is_not_implicitly_approved": len(visible_groups) != 0,
            "active_role_count": len(active_roles),
            "source_role_count_including_excluded": len(roles_by_domain.get(did, [])),
            "visible_subgroup_count": len(visible_groups),
            "all_subgroup_records": [{
                "isco_submajor": text(g.get("isco_submajor")),
                "label": text(g.get("label")),
                "description": text(g.get("description")),
                "role_count_stored": g.get("role_count"),
                "active_role_count_recomputed": len([r for r in active_roles if effective_subgroup_code(r) == text(g.get("isco_submajor"))]),
                "current_member_role_keys_unverified": sorted(
                    f"{did}|{text(r.get('role_name'))}"
                    for r in active_roles
                    if effective_subgroup_code(r) == text(g.get("isco_submajor"))
                ),
                "data_state": text(g.get("data_state") or "active"),
                "specialization_to_domain_fit_status": "not_individually_recorded",
                "domain_scope_review_status": "not_individually_recorded",
                "student_facing_name_review_status": "not_individually_recorded",
                "role_task_fit_review_status": "not_individually_recorded",
                "specialization_domain_fit_review_status": "not_individually_recorded",
                "specialization_set_completeness_review_status": "not_individually_recorded",
                "definition_source": text((g.get("source_provenance") or {}).get("mapping_method") or (g.get("source_provenance") or {}).get("source")) or "not_recorded",
                "definition_is_isco_derived": (
                    text((g.get("source_provenance") or {}).get("mapping_method")) == "canonical_role_library_isco_submajor"
                    or text((g.get("source_provenance") or {}).get("source")) == "isco_submajor_derived"
                ),
                "label_repeats_isco_heading": bool(
                    text(g.get("label"))
                    and text((isco_taxonomy.get(text(g.get("isco_submajor"))) or {}).get("label"))
                    and text(g.get("label")).casefold() == text((isco_taxonomy.get(text(g.get("isco_submajor"))) or {}).get("label")).casefold()
                ),
                "isco_membership_is_not_domain_fit_proof": True,
            } for g in all_groups],
            "observed_isco_submajors": [{"code": code, "role_count": len(roles_by_group[(did, code)])} for code in observed_pairs],
            "computational_scope_candidate": bool(HIGH_SIGNAL_TERMS.search(domain_text)),
            "computational_role_candidates": [r["role_key"] for r in role_candidates],
        })

    declared = {text(x.get("domain_id")) for x in computational_manifest.get("groups", [])}
    declared |= {text(x.get("domain_id")) for x in method_evidence}
    declared |= {text(x.get("domain_id")) for x in related_links}
    # The existing audit also names computationally applied domains that may
    # have no explicit subgroup/method row yet. Include that declared scope so
    # the text scan does not falsely report established domains as undiscovered.
    computational_audit_path = ROOT / "_audit_computational_coverage.py"
    if computational_audit_path.exists():
        source = computational_audit_path.read_text(encoding="utf-8")
        match = re.search(r"COMPUTATIONAL_DOMAINS\s*=\s*\[(.*?)\]", source, re.S)
        if match:
            declared.update(re.findall(r"\"(D\d{3})\"", match.group(1)))
    computational_candidate_domains = [d for d in domains if d["computational_scope_candidate"]]
    computational_missing = [d for d in computational_candidate_domains if d["domain_id"] not in declared]
    role_status_counts = Counter(row["explicit_semantic_review_status"] or "not_individually_recorded" for row in role_rows)
    by_esco_identity: dict[str, list[dict]] = defaultdict(list)
    by_role_title: dict[str, list[dict]] = defaultdict(list)
    for row in role_rows:
        if row["esco_code"]:
            by_esco_identity[row["esco_code"]].append(row)
        title_key = re.sub(r"[^a-z0-9]+", " ", row["role_name"].casefold()).strip()
        if title_key:
            by_role_title[title_key].append(row)
    repeated_occupation_ids = [
        {"esco_code": code, "domain_count": len({row["domain_id"] for row in rows}),
         "mappings": [{"role_key": row["role_key"], "domain_name": row["domain_name"]} for row in rows]}
        for code, rows in sorted(by_esco_identity.items(), key=lambda pair: (-len({r["domain_id"] for r in pair[1]}), pair[0]))
        if len({row["domain_id"] for row in rows}) > 1
    ]
    repeated_titles = [
        {"normalized_title": title, "domain_count": len({row["domain_id"] for row in rows}),
         "mappings": [{"role_key": row["role_key"], "esco_code": row["esco_code"], "domain_name": row["domain_name"]} for row in rows]}
        for title, rows in sorted(by_role_title.items(), key=lambda pair: (-len({r["domain_id"] for r in pair[1]}), pair[0]))
        if len({row["domain_id"] for row in rows}) > 1
    ]
    report = {
        "schema_version": "2026-10-03.taxonomy-inventory.v1",
        "scope": "All canonical merged role mappings and all domain/subgroup records; source data is not edited.",
        "policy": "A validated subgroup/area-of-practice record represents an area of specialization inside its domain, not a separate learner path. Raw subgroup records are only structural candidates until their domain fit, boundaries, labels, and completeness are reviewed. Learner content accumulates domain foundation -> specialization-specific additions -> role-specific requirements. Role-to-domain fit and role-to-specialization fit are independent checks. ISCO membership or current subgroup membership validates neither relationship.",
        "specialization_review_register": specialization_review,
        "global_specialization_reconciliation": {
            "source": str(STEP1_SPECIALIZATION_REGISTER.relative_to(ROOT)) if STEP1_SPECIALIZATION_REGISTER.exists() else None,
            "catalogue_domain_count": global_specialization_review.get("catalogue_domain_count", 0),
            "unique_domain_count": global_specialization_review.get("unique_domain_count", 0),
            "missing_domain_ids": global_specialization_review.get("missing_domain_ids", []),
            "step1_decisions_dispositioned_count": global_specialization_review.get("step1_decisions_dispositioned_count", 0),
            "step1_decisions_complete": global_specialization_review.get("step1_decisions_complete", False),
            "canonical_taxonomy_changed_count": global_specialization_review.get("canonical_taxonomy_changed_count", 0),
            "role_to_specialization_assigned_count": global_specialization_review.get("role_to_specialization_assigned_count", 0),
            "nigerian_context_applied_count": global_specialization_review.get("nigerian_context_applied_count", 0),
        },
        "counts": {
            "domains": len(meta),
            "canonical_merged_role_mappings": len(role_rows),
            "active_role_mappings": sum(1 for r in role_rows if r["student_path_status"].casefold() != "excluded"),
            "role_mappings_with_explicit_semantic_review_status": sum(1 for r in role_rows if r["explicit_semantic_review_status"]),
            "role_mappings_without_explicit_semantic_review_status": sum(1 for r in role_rows if not r["explicit_semantic_review_status"]),
            "role_mappings_with_task_description": sum(1 for r in role_rows if r["role_description"]),
            "role_mappings_with_esco_code": sum(1 for r in role_rows if r["esco_code"]),
            "role_mappings_with_esco_occupation_url": sum(1 for r in role_rows if r["esco_occupation_uris"]),
            "role_mappings_in_domains_without_scope_description": sum(1 for r in role_rows if not r["domain_scope"]),
            "domains_without_scope_description": len(domains_without_scope_description),
            "esco_identities_reused_across_domains": len(repeated_occupation_ids),
            "role_titles_reused_across_domains": len(repeated_titles),
            "semantic_review_status_counts": dict(role_status_counts),
            "domains_with_active_role_mappings": sum(1 for d in domains if d["active_role_count"]),
            "domain_subgroup_records": sum(len(d["all_subgroup_records"]) for d in domains),
            "subgroup_records_defined_from_isco_occupational_buckets": isco_derived_subgroup_count,
            "subgroup_records_without_individual_domain_scope_review": sum(len(d["all_subgroup_records"]) for d in domains),
            "visible_subgroup_records": sum(d["visible_subgroup_count"] for d in domains),
            "domains_with_zero_visible_subgroups": sum(1 for d in domains if d["visible_subgroup_count"] == 0),
            "domains_with_zero_visible_subgroups_but_active_roles": sum(1 for d in domains if d["visible_subgroup_count"] == 0 and d["active_role_count"] > 0),
            "domains_without_active_role_mappings": sum(1 for d in domains if d["active_role_count"] == 0),
            "domains_with_subgroup_structure_disposition_unresolved": sum(1 for d in domains if d["subgroup_structure_disposition"].startswith("unresolved_")),
            "domains_with_source_reviewed_specialization_set_recommendation": sum(1 for d in domains if d["specialization_set_review_status"] != "not_individually_reviewed"),
            "domains_with_specialization_implementation_pending": sum(1 for d in domains if d["specialization_implementation_status"] == "pending_independent_specialization_ids_and_generator_support"),
            "domains_with_zero_subgroups_and_roles_unresolved": sum(1 for d in domains if d["visible_subgroup_count"] == 0 and d["active_role_count"] > 0),
            "domains_with_zero_subgroups_and_no_roles_unresolved": sum(1 for d in domains if d["visible_subgroup_count"] == 0 and d["active_role_count"] == 0),
            "domains_with_no_explicit_subgroup_structure_evidence": sum(1 for d in domains if not d["subgroup_structure_evidence_status"].startswith("reviewed_with_source")),
            "visible_subgroup_count_distribution": dict(sorted(Counter(str(d["visible_subgroup_count"]) for d in domains).items(), key=lambda pair: int(pair[0]))),
            "domain_isco_pairs_without_visible_subgroup": len(missing_subgroup_pairs),
            "visible_subgroups_with_no_active_role_member": len(unsupported_subgroups),
            "subgroup_labels_exactly_repeating_isco_family_heading": len(raw_isco_label_matches),
            "subgroup_records_without_individual_name_review": sum(len(d["all_subgroup_records"]) for d in domains),
            "computational_scope_candidate_domains_by_text": len(computational_candidate_domains),
            "domains_with_declared_computational_method_or_role_layer": len(declared),
            "computational_scope_candidates_not_in_declared_layers": len(computational_missing),
            "unknown_domain_role_mappings": len(unknown_domain_roles),
        },
        "domains": domains,
        "subgroups": subgroup_records,
        "role_mappings": role_rows,
        "triage": {
            "domain_isco_pairs_without_visible_subgroup": missing_subgroup_pairs,
            "visible_subgroups_with_no_active_role_member": unsupported_subgroups,
            "subgroup_computational_label_vs_broad_domain_scope": semantic_subgroup_triage,
            "subgroup_labels_exactly_repeating_isco_family_heading": raw_isco_label_matches,
            "computational_scope_candidates_not_in_declared_layers": [{"domain_id": d["domain_id"], "domain_name": d["domain_name"], "description": d["domain_description"]} for d in computational_missing],
            "unknown_domain_role_mappings": unknown_domain_roles,
            "domains_without_scope_description": domains_without_scope_description,
            "esco_occupation_identities_reused_across_domains": repeated_occupation_ids,
            "same_role_title_reused_across_domains": repeated_titles,
        },
        "interpretation_limit": "The lexical scan is a discovery aid, not semantic sign-off. It can surface likely omissions and naming mismatches but cannot confirm that every role/domain relationship is correct. External task evidence must be recorded per role mapping before sign-off.",
    }
    AUDIT.mkdir(exist_ok=True)
    OUT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# Domain, subgroup, role and computational taxonomy inventory — 2026-10-03",
        "",
        "Read-only inventory of every merged domain-role mapping and subgroup record. This is not semantic approval: ISCO family membership is not proof that a role belongs in the selected domain.",
        "",
        "## Counts",
        "",
    ]
    lines.extend(f"- {key.replace('_', ' ')}: **{value:,}**" for key, value in report["counts"].items() if isinstance(value, int))
    lines += [
        "",
        "## Subgroup-count audit gate",
        "",
        "Subgroups are areas of specialization within a domain, not learner paths by themselves. Audit each existing subgroup against its parent-domain scope and role tasks; then decide whether the domain has the right number and coverage of specializations, whether any should be added, merged or removed, or whether the domain is appropriately unsplit. Where present, learning content accumulates domain foundation -> specialization-specific additions -> role-specific requirements. Neither subgroup count nor ISCO membership is a semantic pass.",
        "",
        "| ID | Domain | active roles | current subgroup records | recommendation | implementation |",
        "|---|---|---:|---:|---|---|",
    ]
    for domain in domains:
        recommendation = (
            f"{domain['reviewed_specialization_count_recommendation']} source-reviewed specialization areas ({domain['specialization_set_review_status']})"
            if domain["reviewed_specialization_count_recommendation"] is not None
            else domain["subgroup_structure_disposition"]
        )
        lines.append(f"| {domain['domain_id']} | {domain['domain_name']} | {domain['active_role_count']} | {domain['visible_subgroup_count']} | {recommendation} | {domain['specialization_implementation_status']} |")
    lines += ["", "## Subgroup definition and naming queue", "", "Each row is a current source record, not an approved specialization. Role titles are listed only as evidence to design specialization boundaries; their fit to the parent domain and to a specialization is not decided in this pass. `ISCO-derived` means the stored category originated as an occupational family, which must not be mistaken for a student-facing area of specialization.", "", "| Domain | Current key | Current label | Active mapped roles (inventory only) | Definition origin | Review state |", "|---|---|---|---|---|---|"]
    for subgroup in subgroup_records:
        role_titles = ", ".join(subgroup["member_role_titles_for_specialization_design"]) or "none"
        origin = "ISCO-derived occupational bucket" if subgroup["definition_is_isco_derived"] else subgroup["definition_source"]
        review = "exact ISCO heading; rename/refine" if subgroup["label_repeats_isco_heading"] else "domain-specific label; validate scope and boundaries"
        lines.append(f"| {subgroup['domain_id']} {subgroup['domain_name']} | {subgroup['isco_submajor']} | {subgroup['current_label']} | {role_titles} | {origin} | {review} |")
    lines += ["", "## All-domain role-family inventory", "", "| ID | Domain | active roles | visible subgroups | observed ISCO submajors (role counts) |", "|---|---|---:|---:|---|"]
    for domain in domains:
        groups = ", ".join(f"{row['code']} ({row['role_count']})" for row in domain["observed_isco_submajors"])
        lines.append(f"| {domain['domain_id']} | {domain['domain_name']} | {domain['active_role_count']} | {domain['visible_subgroup_count']} | {groups or 'none'} |")
    lines += ["", "## Computational candidates not declared in a method/role layer", ""]
    lines.extend(f"- **{d['domain_id']} — {d['domain_name']}**: {d['domain_description']}" for d in computational_missing)
    lines += ["", "## Subgroup label/scope candidates for semantic review", ""]
    lines.extend(f"- `{r['domain_id']}` / `{r['isco_submajor']}` **{r['label']}** — {r['reason']}" for r in semantic_subgroup_triage)
    lines += ["", "The JSON contains every role record with the domain scope, role task description, occupational code, identity source, explicit review-status field (if any), and a lexical computational-method candidate flag. Do not treat lexical flags as confirmed errors or as domain-fit verification.", ""]
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps(report["counts"], indent=2))
    print("computational_not_declared", [(d["domain_id"], d["domain_name"]) for d in computational_missing])
    print("wrote", OUT_JSON, OUT_MD)


if __name__ == "__main__":
    main()

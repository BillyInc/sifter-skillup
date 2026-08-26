"""Consolidate Nigerian and global domain evidence without regenerating seeds."""

from __future__ import annotations

import json
from collections import defaultdict
from pathlib import Path


HERE = Path(__file__).resolve().parent


def load(name: str):
    return json.loads((HERE / name).read_text(encoding="utf-8"))


def unique(values):
    seen = set()
    result = []
    for value in values:
        if not value:
            continue
        key = json.dumps(value, sort_keys=True, ensure_ascii=False) if isinstance(value, dict) else str(value).casefold()
        if key not in seen:
            seen.add(key)
            result.append(value)
    return result


def names(items, keys=("name", "label", "skill", "tool", "element_name")):
    result = []
    for item in items or []:
        if isinstance(item, str):
            result.append(item)
            continue
        if isinstance(item, dict):
            for key in keys:
                if item.get(key):
                    result.append(str(item[key]))
                    break
    return unique(result)


def real_certifications(values):
    return unique(
        value for value in values
        if value and not str(value).casefold().startswith("no ")
        and "requires direct document verification" not in str(value).casefold()
    )


def profile_items(profiles, domain_id):
    return [profile for profile in profiles if domain_id in (profile.get("domain_ids") or [])]


def profile_evidence(profiles):
    skills = []
    tools = []
    competencies = []
    certifications = []
    source_ids = []
    role_names = []
    for profile in profiles:
        source_ids.extend(profile.get("source_ids") or [])
        role_names.extend(profile.get("local_role_names") or [])
        skills.extend(names(profile.get("skills")))
        tools.extend(names(profile.get("tools")))
        competencies.extend(names(profile.get("competencies")))
        certifications.extend(names(profile.get("certifications")))
    return {
        "profile_ids": [profile.get("id") for profile in profiles],
        "source_ids": unique(source_ids),
        "role_names": unique(role_names),
        "skills": unique(skills),
        "tools": unique(tools),
        "competencies": unique(competencies),
        "certifications": unique(certifications),
    }


def global_source_rows(registry, domain_id, cluster):
    """Resolve the same default -> cluster -> override chain as the registry validator."""
    source_ids = list(registry.get("default_sources", []))
    source_ids.extend(registry.get("cluster_sources", {}).get(cluster or "", []))
    source_ids.extend(registry.get("domain_overrides", {}).get(domain_id, []))
    source_ids = unique(source_ids)
    rows = []
    for source_id in source_ids:
        source = registry.get("source_catalog", {}).get(source_id)
        if not source or source.get("region") not in {"global", "global_proxy"}:
            continue
        rows.append({
            "source_id": source_id,
            "name": source.get("name"),
            "evidence_type": source.get("evidence_type"),
            "region": source.get("region"),
            "url": source.get("url") or source.get("urls"),
        })
    return rows


def main():
    meta = load("domain_meta.json")
    structure = load("domain_structure.json")
    skills = load("domain_skill_provenance.json")
    tools = load("domain_tools.json")
    role_tools = load("role_tools.json")
    registry = load("domain_role_source_registry.json")
    body_audit = load("nigerian_professional_body_audit.json")
    thin = load("thin_domain_role_overlays.json")
    layer_report = load("_audit/source_backed_layer_report.json")
    local_overlays = load("nigerian_global_professional_overlays.json").get("profiles", [])
    local_overlays += load("nigerian_thin_domain_overlays.json").get("profiles", [])
    local_overlays += load("nigerian_fresh_web_enrichment_2026-08-25.json").get("profiles", [])
    local_overlays += load("nigerian_fresh_web_enrichment_2026-08-25_followup.json").get("profiles", [])
    local_overlays += load("nigerian_fresh_web_enrichment_2026-08-26.json").get("profiles", [])
    local_overlays += load("nigerian_domain_field_enrichment_2026-08-25.json").get("profiles", [])
    thin_roles = thin.get("roles", [])
    web_audit = load("nigerian_web_source_evidence_audit.json")
    remaining_body_audit = load("nigerian_remaining_body_web_evidence.json")
    certification_audit = load("nigerian_certification_gap_audit.json")
    hidden = {domain_id for domain_id, value in meta.items() if value.get("excluded")}
    hidden.update(layer_report.get("hidden_domains_excluded") or [])
    body_by_domain = {row["domain_id"]: row for row in body_audit["domains"]}
    body_web_by_id = {row["body_id"]: row for row in remaining_body_audit.get("records", [])}
    for source in web_audit.get("verified_sources", []):
        for body_id in source.get("covered_body_ids", []):
            body_web_by_id.setdefault(body_id, {
                "body_id": body_id,
                "name": source.get("name"),
                "url": source.get("url"),
                "evidence_class": source.get("source_class"),
                "skills": source.get("skills", []),
                "competencies": source.get("competencies", []),
                "certifications": source.get("certifications", []),
                "status": "verified_anchor_source",
            })
    gaps = {row["domain_id"] for row in thin.get("gaps", [])}
    certification_by_domain = {}
    for review in certification_audit.get("reviews", []):
        for domain_id in review.get("domain_ids", []):
            certification_by_domain[domain_id] = review

    role_rows = defaultdict(list)
    for key, role in role_tools.items():
        domain_id = key.split("|", 1)[0]
        role_rows[domain_id].append(role)

    domains = []
    for domain_id, value in meta.items():
        if domain_id in hidden:
            continue
        skill_row = skills.get(domain_id, {})
        structure_row = structure.get(domain_id, {})
        tool_row = tools.get(domain_id, {})
        local_profiles = profile_items(local_overlays, domain_id)
        local = profile_evidence(local_profiles)
        domain_bodies = body_by_domain.get(domain_id, {}).get("nigerian_bodies", [])
        body_web_rows = [body_web_by_id[body["body_id"]] for body in domain_bodies if body["body_id"] in body_web_by_id]
        certification_review = certification_by_domain.get(domain_id)
        nigerian_web_skills = names([{"label": value} for row in body_web_rows for value in row.get("skills", [])])
        nigerian_web_competencies = names([{"label": value} for row in body_web_rows for value in row.get("competencies", [])])
        nigerian_web_certifications = real_certifications(
            list(value for row in body_web_rows for value in row.get("certifications", []))
            + list((certification_review or {}).get("credential_signals", []))
        )
        follow_up_body_ids = [row["body_id"] for row in body_web_rows if row.get("status") in {"direct_page_review_pending", "official_url_context_only"}]
        domain_skills = names([{"label": key} for key in (skill_row.get("foundation_skills") or {}).keys()])
        domain_tools = names((tool_row.get("distinctive_tools") or []) + (tool_row.get("common_tools") or []))
        certifications = names((structure_row.get("gateway_certifications") or []) + (structure_row.get("role_hint_certifications") or []))
        source_roles = role_rows.get(domain_id, [])
        resolved_global_sources = global_source_rows(registry, domain_id, value.get("cluster"))
        global_role_count = len(source_roles)
        thin_overlay_role_count = sum(row.get("domain_id") == domain_id for row in thin_roles)
        domains.append({
            "domain_id": domain_id,
            "domain_name": value.get("domain_name"),
            "thin_gap": domain_id in gaps,
            "nigerian_bodies": body_by_domain.get(domain_id, {}).get("nigerian_bodies", []),
            "nigerian_evidence_class": body_by_domain.get(domain_id, {}).get("evidence_class"),
            "nigerian_overlay_evidence": local,
            "nigerian_web_evidence": {
                "body_ids": [body["body_id"] for body in domain_bodies],
                "source_records": len(body_web_rows),
                "skills": nigerian_web_skills,
                "competencies": nigerian_web_competencies,
                "certifications": nigerian_web_certifications,
                "follow_up_body_ids": follow_up_body_ids,
                "state": "named_skills_and_competencies" if nigerian_web_skills and nigerian_web_competencies else "context_only_or_follow_up",
            },
            "nigerian_certification_evidence": certification_review or {
                "evidence_state": "not_separately_reviewed",
                "credential_signals": [],
                "sources": [],
                "conclusion": "No certification-specific review row yet.",
            },
            "global_sources": resolved_global_sources,
            "global_source_count": len(resolved_global_sources),
            "current_domain_skills": domain_skills,
            "current_domain_tools": domain_tools,
            "current_domain_certifications": certifications,
            "role_evidence": {
                "role_tools_rows": len(source_roles),
                "roles_with_tools": sum(bool(row.get("tools")) for row in source_roles),
                "roles_with_onet_competencies": sum(bool((row.get("onet") or {}).get("essential_skills")) for row in source_roles),
                "roles_with_esco_skills": sum(bool((row.get("esco") or {}).get("essential_skills") or (row.get("esco") or {}).get("optional_skills")) for row in source_roles),
                "roles_with_framework_signal": sum(bool(row.get("source_provenance", {}).get("frameworks")) for row in source_roles),
            },
            "thin_role_overlay_evidence": {
                "roles": [row.get("role_name") for row in thin_roles if row.get("domain_id") == domain_id],
                "role_count": thin_overlay_role_count,
            },
            "global_role_evidence_status": (
                "multi_source_role_spine_and_thin_overlay" if global_role_count and thin_overlay_role_count
                else "multi_source_role_spine" if global_role_count
                else "needs_global_role_evidence"
            ),
            "data_state": skill_row.get("data_state") or structure_row.get("data_state") or "not_mapped",
            "source_confidence": skill_row.get("source_confidence") or structure_row.get("source_confidence") or "unknown",
        })

    output = {
        "schema_version": "1.0.0",
        "purpose": "Evidence matrix for the 160 visible domains and the current thin-domain gap queue.",
        "scope": {
            "visible_domains": len(domains),
            "thin_gaps": len([row for row in domains if row["thin_gap"]]),
            "hidden_domains_excluded": sorted(hidden),
            "sql_regeneration": "blocked_until_evidence_review",
        },
        "interpretation": {
            "nigerian_bodies": "The body audit identifies Nigerian regulators, professional associations, sector skills bodies and government context. It does not turn context bodies into licensing bodies.",
            "current_domain_skills_tools": "Existing source-backed domain rows already in the repository; they are not automatically Nigerian.",
            "nigerian_overlay_evidence": "Named local profiles with local role names, skills, tools, competencies or certifications; empty lists mean no explicit local overlay was found.",
            "nigerian_certification_evidence": "Certification states distinguish statutory registration/licensing from sector training and from a review that found no general individual licence. The latter is not proof that no specialised credential exists.",
            "global_sources": "Global/global-proxy source families selected by the domain registry; they are required for thin gaps where Nigerian evidence cannot supply a complete role spine.",
        },
        "domains": domains,
        "thin_gap_global_queue": [row for row in domains if row["thin_gap"]],
    }
    (HERE / "domain_skill_competency_certification_audit.json").write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    counts = {
        "visible_domains": len(domains),
        "thin_gaps": sum(row["thin_gap"] for row in domains),
        "actual_unpopulated_gaps": sum(row["thin_gap"] and bool(row["thin_role_overlay_evidence"]["role_count"]) for row in domains),
        "thin_gap_reconciliation_rows": sum(row["thin_gap"] and not bool(row["thin_role_overlay_evidence"]["role_count"]) for row in domains),
        "domains_with_local_overlay": sum(bool(row["nigerian_overlay_evidence"]["profile_ids"]) for row in domains),
        "domains_with_nigerian_named_skills": sum(bool(row["nigerian_web_evidence"]["skills"]) for row in domains),
        "domains_with_nigerian_named_competencies": sum(bool(row["nigerian_web_evidence"]["competencies"]) for row in domains),
        "domains_with_nigerian_named_certification_signals": sum(bool(row["nigerian_web_evidence"]["certifications"]) for row in domains),
        "domains_with_certification_review": sum(row["nigerian_certification_evidence"]["evidence_state"] != "not_separately_reviewed" for row in domains),
        "domains_with_statutory_registration_or_licence": sum(row["nigerian_certification_evidence"]["evidence_state"] == "statutory_registration_and_practice_licence" for row in domains),
        "domains_with_sector_training_or_competency_evidence": sum(row["nigerian_certification_evidence"]["evidence_state"] == "sector_training_and_competency_context" for row in domains),
        "domains_with_no_general_licence_found_in_review": sum(row["nigerian_certification_evidence"]["evidence_state"] == "sector_context_no_general_individual_licence_found" for row in domains),
        "domains_with_nigerian_body_follow_up": sum(bool(row["nigerian_web_evidence"]["follow_up_body_ids"]) for row in domains),
        "domains_with_named_certifications": sum(bool(row["current_domain_certifications"] or row["nigerian_overlay_evidence"]["certifications"]) for row in domains),
        "domains_with_global_sources": sum(bool(row["global_sources"]) for row in domains),
        "gaps_with_global_sources": sum(bool(row["global_sources"]) for row in domains if row["thin_gap"]),
        "gaps_with_global_role_evidence": sum(row["thin_gap"] and row["global_role_evidence_status"] != "needs_global_role_evidence" for row in domains),
        "gaps_with_global_role_overlays": sum(bool(row["thin_role_overlay_evidence"]["role_count"]) for row in domains if row["thin_gap"]),
    }
    output["coverage_summary"] = counts
    (HERE / "domain_skill_competency_certification_audit.json").write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    report = [
        "# Domain Skill, Competency and Certification Audit",
        "",
        "This matrix is evidence-first and does not regenerate SQL or seed data.",
        "",
        f"- Visible domains: {counts['visible_domains']}",
        f"- Nigerian body/context records with named skills: {counts['domains_with_nigerian_named_skills']}",
        f"- Nigerian body/context records with named competencies: {counts['domains_with_nigerian_named_competencies']}",
        f"- Domains with source-backed certification signals: {counts['domains_with_nigerian_named_certification_signals']}",
        f"- Domains with a certification-specific review row: {counts['domains_with_certification_review']}",
        f"- Domains with statutory registration/licence evidence: {counts['domains_with_statutory_registration_or_licence']}",
        f"- Domains with sector training/competency evidence: {counts['domains_with_sector_training_or_competency_evidence']}",
        f"- Domains where no general individual licence was found in review: {counts['domains_with_no_general_licence_found_in_review']}",
        f"- Domains with a Nigerian body follow-up item: {counts['domains_with_nigerian_body_follow_up']}",
        f"- Domains with explicit local profile overlays: {counts['domains_with_local_overlay']}",
        f"- Thin-gap rows: {counts['thin_gaps']}",
        f"- Thin-gap rows with global role evidence: {counts['gaps_with_global_role_evidence']}",
        "",
        "## Evidence interpretation",
        "",
        "Named skills and competencies come from the linked Nigerian body or government source records. A body or agency may provide sector context without issuing an individual licence. Certification signals are retained only where the source names registration, examination, certification, licence or a clearly bounded membership credential.",
        "",
        "| Domain | Nigerian bodies | Local skills | Local competencies | Credentials | Follow-up |",
        "|---|---:|---:|---:|---:|---|",
    ]
    for row in domains:
        local_web = row["nigerian_web_evidence"]
        report.append(
            f"| {row['domain_id']} {row['domain_name']} | {len(local_web['body_ids'])} | {len(local_web['skills'])} | {len(local_web['competencies'])} | {len(local_web['certifications'])} | {', '.join(local_web['follow_up_body_ids']) or '-'} |"
        )
    report.extend([
        "",
        "The global thin-domain evidence matrix is in `GLOBAL_THIN_GAP_EVIDENCE_AUDIT.md`. SQL and seed regeneration remain blocked until the named evidence is reviewed for duplication, jurisdiction and field-level accuracy.",
    ])
    (HERE / "DOMAIN_SKILL_COMPETENCY_CERTIFICATION_AUDIT.md").write_text("\n".join(report) + "\n", encoding="utf-8")
    print(json.dumps(counts, indent=2))


if __name__ == "__main__":
    main()

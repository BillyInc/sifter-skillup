"""Resolve a Student's selected guidance branches for report rendering.

The resolver is intentionally selection-driven. It fetches the detailed source
records for selected IDs only; it never treats the complete domain catalogue as
the Student's chosen path.
"""
from __future__ import annotations

from typing import Any, Optional


def _labels(value: Any) -> list[str]:
    if not isinstance(value, list):
        return []
    out: list[str] = []
    for item in value:
        if isinstance(item, dict):
            item = item.get("skill") or item.get("name") or item.get("label")
        if item is not None and str(item).strip():
            out.append(str(item).strip())
    return out


def _tool_out(row: dict) -> dict:
    return {
        "name": row.get("tool_name"),
        "group": row.get("tool_group"),
        "description": row.get("description"),
        "source": row.get("source"),
        "elementName": row.get("element_name"),
        "elementId": row.get("element_id"),
        "sourceConfidence": row.get("source_confidence"),
        "dataState": row.get("data_state"),
        "sourceProvenance": row.get("source_provenance") or {},
    }


def _cert_out(row: dict) -> dict:
    return {
        "name": row.get("name"),
        "body": row.get("body"),
        "region": row.get("region"),
        "level": row.get("level"),
        "gateReason": row.get("gate_reason"),
        "source": row.get("source"),
    }


def _selected_items(path: dict, key: str) -> list[dict]:
    value = path.get(key)
    return [item for item in value if isinstance(item, dict)] if isinstance(value, list) else []


def resolve_guidance_report_context(
    svc: Any,
    user: dict,
    path_row: Optional[dict],
    school_name: Optional[str] = None,
) -> dict:
    """Build report data from the user's starting point and selected path."""
    path = (path_row or {}).get("path") or {}
    academic = path.get("academicContext") if isinstance(path.get("academicContext"), dict) else {}
    subjects = path.get("subjects") if isinstance(path.get("subjects"), dict) else {}
    programme = path.get("programme") if isinstance(path.get("programme"), dict) else {}
    university = path.get("university") if isinstance(path.get("university"), dict) else {}
    requirements = path.get("requirements") if isinstance(path.get("requirements"), dict) else {}

    # A provisioned student may still have a live one-time claim code. Keep it
    # attached to the selected path only for the printable handoff output; do
    # not invent an access code for a self-created account or expose revoked /
    # already-redeemed codes.
    access_code = None
    try:
        claim_rows = svc.table("claim_codes").select("code").eq(
            "student_id", user.get("id")
        ).is_("redeemed_at", "null").is_("revoked_at", "null").order(
            "created_at", desc=True
        ).limit(1).execute().data or []
        access_code = (claim_rows[0] or {}).get("code") if claim_rows else None
    except Exception:
        access_code = None

    # Fill missing academic/subject context from the persisted onboarding record.
    try:
        start = svc.table("student_starting_points").select("*").eq(
            "user_id", user.get("id")
        ).limit(1).execute()
        start_row = (start.data or [None])[0] or {}
        academic = {
            "userType": start_row.get("user_type") or academic.get("userType"),
            "class": start_row.get("ss_class") or academic.get("class") or user.get("student_class"),
            "stream": start_row.get("stream") or academic.get("stream") or user.get("stream"),
            "schoolName": start_row.get("preferred_school_name") or academic.get("schoolName") or school_name,
            "tutorialCentreName": (start_row.get("raw_profile") or {}).get("tutorialCentreName") or academic.get("tutorialCentreName"),
        }
        if not subjects:
            choices = svc.table("student_subject_choices").select(
                "subject_name_snapshot, choice_type"
            ).eq("starting_point_id", start_row.get("id")).order("rank").execute().data or []
            subjects = {
                "olevel": [r.get("subject_name_snapshot") for r in choices if r.get("choice_type") == "olevel"],
                "utme": [r.get("subject_name_snapshot") for r in choices if r.get("choice_type") in {"utme", "strongest", "preferred"}],
            }
        if not programme:
            programme = {
                "id": start_row.get("intended_jamb_programme_id") or start_row.get("intended_programme_id"),
                "name": start_row.get("intended_programme_name"),
            }
        if not university:
            university = {
                "id": start_row.get("preferred_school_id"),
                "name": start_row.get("preferred_school_name"),
            }
    except Exception:
        academic.setdefault("class", user.get("student_class"))
        academic.setdefault("stream", user.get("stream"))
        academic.setdefault("schoolName", school_name)

    domain_choices = _selected_items(path, "domains")
    subgroup_choices = _selected_items(path, "subgroups")
    role_choices = _selected_items(path, "roles")
    # Direct subgroup/role selections still belong to a domain. Resolve those
    # parents even when the Student did not select the domain header itself.
    inferred_domain_choices = list(domain_choices)
    known_domain_keys = {
        str(item.get("id") or item.get("domainId") or item.get("domainKey"))
        for item in domain_choices
        if item.get("id") or item.get("domainId") or item.get("domainKey")
    }
    for item in [*subgroup_choices, *role_choices]:
        parent_id = item.get("domainId") or item.get("domainKey")
        if parent_id and str(parent_id) not in known_domain_keys:
            inferred_domain_choices.append({
                "id": parent_id,
                "name": item.get("domainName") or "Domain",
                "matchType": item.get("matchType"),
            })
            known_domain_keys.add(str(parent_id))
    domain_choices = inferred_domain_choices
    domain_keys = [str(item.get("id") or item.get("domainId") or item.get("domainKey")) for item in domain_choices]
    domain_keys = [key for key in domain_keys if key and key != "None"]
    domains: list[dict] = []

    if domain_keys:
        rows = svc.table("domains").select("*").in_("domain_key", domain_keys).execute().data or []
        by_key = {str(row.get("domain_key")): row for row in rows}
        for choice in domain_choices:
            key = str(choice.get("id") or choice.get("domainId") or choice.get("domainKey") or "")
            domain = by_key.get(key)
            if not domain:
                continue
            domain_id = domain.get("id")
            tool_rows = svc.table("domain_tools").select("tool_name, tool_group, source, element_name, element_id, source_confidence, data_state, source_provenance").eq(
                "domain_id", domain_id
            ).eq("scope", "domain").execute().data or []
            cert_rows = svc.table("domain_certifications").select(
                "name, body, region, level, gate_reason"
            ).eq("domain_id", domain_id).eq("placement", "gateway").execute().data or []
            sg_rows = svc.table("domain_subgroups").select(
                "id, label, description, cluster_skills, source_confidence, data_state, skill_sources"
            ).eq("domain_id", domain_id).execute().data or []
            role_rows = svc.table("domain_roles").select(
                "id, role_key, role_name, tier, subgroup_id, essential_skills, optional_skills"
            ).eq("domain_id", domain_id).execute().data or []
            selected_sg_ids = {
                str(item.get("id") or item.get("subgroupId"))
                for item in subgroup_choices
                if item.get("id") or item.get("subgroupId")
            }
            selected_role_keys = {
                str(item.get("id") or item.get("roleKey"))
                for item in role_choices
                if item.get("id") or item.get("roleKey")
            }
            subgroups: list[dict] = []
            for subgroup in sg_rows:
                if str(subgroup.get("id")) not in selected_sg_ids:
                    continue
                sg_tools = svc.table("domain_tools").select("tool_name, tool_group, source, element_name, element_id, source_confidence, data_state, source_provenance").eq(
                    "subgroup_id", subgroup.get("id")
                ).eq("scope", "subgroup").execute().data or []
                sg_certs = svc.table("domain_certifications").select(
                    "name, body, region, level, gate_reason"
                ).eq("subgroup_id", subgroup.get("id")).eq("placement", "subgroup").execute().data or []
                subgroups.append({
                    "id": subgroup.get("id"),
                    "name": subgroup.get("label"),
                    "description": subgroup.get("description"),
                    "skills": _labels(subgroup.get("cluster_skills")),
                    "sourceConfidence": subgroup.get("source_confidence"),
                    "dataState": subgroup.get("data_state"),
                    "skillSources": subgroup.get("skill_sources") or {},
                    "tools": [_tool_out(row) for row in sg_tools if row.get("tool_name")],
                    "certifications": [_cert_out(row) for row in sg_certs if row.get("name")],
                })
            roles: list[dict] = []
            for role in role_rows:
                if str(role.get("role_key")) not in selected_role_keys:
                    continue
                role_tools: list[dict] = []
                role_certs: list[dict] = []
                try:
                    role_tools = svc.table("domain_tools").select(
                        "tool_name, tool_group, role_freq, score, hot, in_demand, source, element_name, element_id, source_confidence, data_state, source_provenance"
                    ).eq("role_id", role.get("id")).eq("scope", "role").execute().data or []
                    role_certs = svc.table("role_certifications").select(
                        "name, body, region, level, gate_reason, source"
                    ).eq("role_key", role.get("role_key")).execute().data or []
                except Exception:
                    pass
                roles.append({
                    "key": role.get("role_key"),
                    "name": role.get("role_name"),
                    "tier": role.get("tier"),
                    "skills": {
                        "essential": _labels(role.get("essential_skills")),
                        "supplementary": _labels(role.get("optional_skills")),
                    },
                    "tools": [_tool_out(row) for row in role_tools if row.get("tool_name")],
                    "certifications": [_cert_out(row) for row in role_certs if row.get("name")],
                })
            domains.append({
                "id": domain.get("domain_key"),
                "name": domain.get("name"),
                "matchType": choice.get("matchType") or choice.get("relationship"),
                "intent": choice.get("intent"),
                "sequence": choice.get("sequence"),
                "description": domain.get("description"),
                "skills": _labels(domain.get("foundation_skills")),
                "sourceConfidence": domain.get("source_confidence"),
                "dataState": domain.get("data_state"),
                "skillSources": domain.get("foundation_skill_sources") or {},
                "tools": [_tool_out(row) for row in tool_rows if row.get("tool_name")],
                "certifications": [_cert_out(row) for row in cert_rows if row.get("name")],
                "subgroups": subgroups,
                "roles": roles,
            })

    return {
        "studentName": user.get("username") or "Student",
        "academicContext": academic,
        "subjects": subjects,
        "discoveryDoor": path.get("discoveryDoor"),
        "programme": programme,
        "programmes": path.get("programmes") if isinstance(path.get("programmes"), list) else [],
        "university": university,
        "requirements": requirements,
        "subjectMatch": path.get("subjectMatch") if isinstance(path.get("subjectMatch"), dict) else {"status": "not_checked"},
        "accessCode": access_code,
        "domains": domains,
        "selectedCounts": {
            "domains": len(domains),
            "subgroups": sum(len(item.get("subgroups") or []) for item in domains),
            "roles": sum(len(item.get("roles") or []) for item in domains),
        },
        "notes": path.get("notes") or [],
    }

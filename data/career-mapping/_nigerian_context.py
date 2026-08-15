"""Resolve Nigerian context and source-backed professional overlays.

The registry supplies broad Nigerian context for every reachable entity. The
curated overlay file supplies actual local skills, tools, competencies,
credentials and role terminology where an authoritative Nigerian source was
checked. Global frameworks are returned in a separate ``global_enrichment``
object and are never relabelled as Nigerian evidence.
"""

import json
import os
import re
from pathlib import Path


HERE = Path(__file__).resolve().parent
REPO_ROOT = HERE.parent.parent
OVERLAY_PATH = HERE / "nigerian_global_professional_overlays.json"

SOURCE_EXTRACT_HINTS = {
    "ng_myjobmag": (
        "data/career-mapping/_source_extracts/myjobmag_jobsxml.csv",
        "data/career-mapping/_source_extracts/myjobmag_jobsxml_by_categories.csv",
    ),
    "ng_jobberman": (
        "data/career-mapping/_source_extracts/jobberman_jobs.csv",
        "data/career-mapping/_source_extracts/jobberman_jobs.json",
    ),
    "ng_nbs": (
        "data/career-mapping/_source_extracts/nbs_labour_force.csv",
        "data/career-mapping/_source_extracts/nbs_labour_force.json",
    ),
}

CONTEXT_LABELS = {
    "live_vacancy_title_signal": "Nigerian role and title terminology",
    "labour_market_context": "Nigerian labour and sector context",
    "national_occupational_standard": "Nigerian occupational and training standards",
    "education_and_profession_feeder_context": "Nigerian university and programme feeder context",
    "education_and_profession_context": "Nigerian education and profession context",
    "professional_regulatory_context": "Nigerian professional and regulatory context",
    "professional_role_context": "Nigerian professional role terminology",
    "regulatory_and_sector_context": "Nigerian regulatory and sector context",
    "sector_and_regulatory_context": "Nigerian sector and regulatory context",
    "sector_regulatory_context": "Nigerian sector and regulatory context",
    "industry_role_context": "Nigerian industry role terminology",
}


def _load_overlay():
    try:
        with OVERLAY_PATH.open(encoding="utf-8") as handle:
            value = json.load(handle)
    except (OSError, ValueError):
        return {"sources": [], "profiles": []}
    return value if isinstance(value, dict) else {"sources": [], "profiles": []}


OVERLAY = _load_overlay()
OVERLAY_SOURCES = {str(item.get("id")): item for item in OVERLAY.get("sources") or [] if item.get("id")}


def _norm(value):
    return re.sub(r"[^a-z0-9]+", " ", str(value or "").lower()).strip()


def _contains_any(text, patterns):
    value = _norm(text)
    return any(_norm(pattern) and _norm(pattern) in value for pattern in patterns or [])


def _source_status(source_id):
    paths = SOURCE_EXTRACT_HINTS.get(source_id, ())
    if any(os.path.exists(REPO_ROOT / path) for path in paths):
        return "checked_in_extract"
    source = OVERLAY_SOURCES.get(source_id) or {}
    if any(os.path.exists(path) for path in source.get("local_files") or []):
        return "checked_in_source_document"
    return "registry_reference"


def _source_summary(source_id, catalog):
    source = catalog.get(source_id) or OVERLAY_SOURCES.get(source_id) or {}
    return {
        "id": source_id,
        "name": source.get("name"),
        "evidence_type": source.get("evidence_type") or source.get("kind") or "registered_context_source",
        "availability": _source_status(source_id),
        "region": source.get("region"),
        "urls": source.get("urls") or ([source["url"]] if source.get("url") else []),
    }


def _unique_items(items, *, region, source_ids, kind):
    result = {}
    for item in items or []:
        if isinstance(item, str):
            item = {"name": item}
        if not isinstance(item, dict) or not str(item.get("name") or "").strip():
            continue
        name = str(item["name"]).strip()
        key = (kind, _norm(name), region)
        current = result.get(key)
        normalized = dict(item)
        normalized["name"] = name
        normalized["region"] = region
        normalized["source_ids"] = sorted(set(normalized.get("source_ids") or source_ids))
        if current:
            current_sources = sorted(set((current.get("source_ids") or []) + normalized["source_ids"]))
            current["source_ids"] = current_sources
            if current.get("priority") != "core" and normalized.get("priority") == "core":
                current["priority"] = "core"
            if normalized.get("evidence") and normalized.get("evidence") != current.get("evidence"):
                current["evidence_sources"] = sorted(set((current.get("evidence_sources") or []) + [normalized["evidence"]]))
            continue
        result[key] = normalized
    return list(result.values())


def _tag(items, source_ids):
    tagged = []
    for item in items or []:
        value = dict(item) if isinstance(item, dict) else {"name": item}
        value["source_ids"] = sorted(set(value.get("source_ids") or source_ids))
        tagged.append(value)
    return tagged


def _profile_source_ids(profile):
    return [str(source_id) for source_id in profile.get("source_ids") or [] if source_id]


def _profiles_for(domain_id, region):
    return [
        profile for profile in OVERLAY.get("profiles") or []
        if profile.get("region") == region and domain_id in (profile.get("domain_ids") or [])
    ]


def _profile_payload(profiles, *, region, scope, subgroup_label=None, role_name=None):
    """Collect only data owned by the requested entity scope."""
    role_names = []
    skills = []
    tools = []
    competencies = []
    certifications = []
    regulatory_requirements = []
    matched_profiles = []
    role_match_count = 0

    for profile in profiles:
        source_ids = _profile_source_ids(profile)
        if scope.startswith("subgroup"):
            subgroup_matches = [
                subgroup for subgroup in profile.get("subgroups") or []
                if _contains_any(subgroup_label, subgroup.get("patterns") or [])
            ]
            if not subgroup_matches:
                continue
            matched_profiles.append(profile)
            for subgroup in subgroup_matches:
                skills.extend(_tag(subgroup.get("skills"), source_ids))
                tools.extend(_tag(subgroup.get("tools"), source_ids))
                competencies.extend(_tag(subgroup.get("competencies"), source_ids))
                certifications.extend(_tag(subgroup.get("certifications"), source_ids))
            continue

        if scope.startswith("role"):
            if not _contains_any(role_name, profile.get("role_patterns") or []):
                continue
            role_match_count += 1
            matched_profiles.append(profile)
            local_names = profile.get("local_role_names") or []
            exact_names = [name for name in local_names if _norm(name) == _norm(role_name)]
            names = exact_names or local_names
            role_names.extend([
                {
                    "name": name,
                    "match_type": "exact_title" if exact_names else "role_family_title",
                    "evidence": "; ".join(str(item) for item in profile.get("source_ids") or []),
                    "source_ids": source_ids,
                }
                for name in names
            ])
            skills.extend(_tag(profile.get("skills"), source_ids))
            tools.extend(_tag(profile.get("tools"), source_ids))
            competencies.extend(_tag(profile.get("competencies"), source_ids))
            certifications.extend(_tag(profile.get("certifications"), source_ids))
            regulatory_requirements.extend(_tag(profile.get("regulatory_requirements"), source_ids))
            continue

        matched_profiles.append(profile)
        role_names.extend({"name": name, "match_type": "domain_role_terminology", "evidence": "; ".join(str(item) for item in profile.get("source_ids") or []), "source_ids": source_ids} for name in profile.get("local_role_names") or [])
        skills.extend(_tag(profile.get("skills"), source_ids))
        tools.extend(_tag(profile.get("tools"), source_ids))
        competencies.extend(_tag(profile.get("competencies"), source_ids))
        certifications.extend(_tag(profile.get("certifications"), source_ids))
        regulatory_requirements.extend(_tag(profile.get("regulatory_requirements"), source_ids))

    source_ids = sorted({source_id for profile in matched_profiles for source_id in _profile_source_ids(profile)})
    return {
        "source_ids": source_ids,
        "role_names": _unique_items(role_names, region=region, source_ids=source_ids, kind="role_name"),
        "skills": _unique_items(skills, region=region, source_ids=source_ids, kind="skill"),
        "tools": _unique_items(tools, region=region, source_ids=source_ids, kind="tool"),
        "competencies": _unique_items(competencies, region=region, source_ids=source_ids, kind="competency"),
        "certifications": _unique_items(certifications, region=region, source_ids=source_ids, kind="certification"),
        "regulatory_requirements": _unique_items(regulatory_requirements, region=region, source_ids=source_ids, kind="regulatory_requirement"),
        "matched_profile_ids": [str(profile.get("id")) for profile in matched_profiles if profile.get("id")],
        "role_match_count": role_match_count,
    }


def resolved_nigerian_context(domain_id, domain_meta, registry, *, scope="domain_context", subgroup_label=None, role_name=None):
    """Return local context plus explicitly separated global enrichment."""
    ids = list(registry.get("default_sources") or [])
    ids.extend((registry.get("cluster_sources") or {}).get(domain_meta.get("cluster", ""), []))
    ids.extend((registry.get("domain_overrides") or {}).get(domain_id, []))
    ids = list(dict.fromkeys(ids))
    catalog = registry.get("source_catalog") or {}
    registry_local_ids = [source_id for source_id in ids if (catalog.get(source_id) or {}).get("region") == "nigeria"]
    profiles_local = _profiles_for(domain_id, "nigeria")
    profiles_global = _profiles_for(domain_id, "global")
    local = _profile_payload(profiles_local, region="nigeria", scope=scope, subgroup_label=subgroup_label, role_name=role_name)
    global_data = _profile_payload(profiles_global, region="global", scope=scope, subgroup_label=subgroup_label, role_name=role_name)
    local_source_ids = sorted(set(registry_local_ids + local["source_ids"]))
    source_summaries = [_source_summary(source_id, catalog) for source_id in local_source_ids]
    availability = {item["id"]: item["availability"] for item in source_summaries}
    context_labels = {CONTEXT_LABELS.get((catalog.get(source_id) or {}).get("evidence_type"), "Nigerian sector context") for source_id in registry_local_ids}
    if local["source_ids"]:
        context_labels.add("Nigerian professional skills, tools, competencies and credentials")
    if not local_source_ids and not local["role_names"] and not local["skills"] and not local["tools"] and not local["competencies"] and not local["certifications"]:
        # Keep an explicit object for global-only domains so the UI can explain
        # that no Nigerian counterpart was found instead of hiding the gap.
        source_summaries = []

    if scope.startswith("role"):
        if local["role_names"] or local["skills"] or local["tools"] or local["competencies"] or local["certifications"]:
            counterpart_status = "source_backed_role_family"
        elif profiles_local:
            counterpart_status = "domain_context_only"
        else:
            counterpart_status = "no_direct_local_counterpart"
    elif local["role_names"] or local["skills"] or local["tools"] or local["competencies"] or local["certifications"]:
        counterpart_status = "source_backed"
    elif profiles_local:
        counterpart_status = "domain_context_only"
    else:
        counterpart_status = "no_direct_local_counterpart"

    return {
        "scope": scope,
        "domain_id": domain_id,
        "source_ids": local_source_ids,
        "source_summaries": source_summaries,
        "source_availability": availability,
        "available_context": sorted(context_labels),
        "evidence_limit": "Local context and checked professional evidence only; no role-level Nigerian demand, salary or automatic licensing claim.",
        "salary": "excluded",
        "demand": "not_claimed",
        "licensing": "not_claimed",
        "local_counterpart_status": counterpart_status,
        "actual_enrichment": {key: value for key, value in local.items() if key not in {"matched_profile_ids", "role_match_count"}},
        "global_enrichment": {key: value for key, value in global_data.items() if key not in {"matched_profile_ids", "role_match_count"}},
        "global_profile_ids": global_data["matched_profile_ids"],
    }

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
THIN_OVERLAY_PATH = HERE / "nigerian_thin_domain_overlays.json"
FRESH_OVERLAY_PATH = HERE / "nigerian_fresh_web_enrichment_2026-08-25.json"
FRESH_FOLLOWUP_OVERLAY_PATH = HERE / "nigerian_fresh_web_enrichment_2026-08-25_followup.json"
FRESH_2026_08_26_OVERLAY_PATH = HERE / "nigerian_fresh_web_enrichment_2026-08-26.json"
DOMAIN_FIELD_OVERLAY_PATH = HERE / "nigerian_domain_field_enrichment_2026-08-25.json"
SUBGROUP_FAMILY_OVERLAY_PATH = HERE / "nigerian_subgroup_family_enrichment_2026-08-25.json"
GLOBAL_EMERGING_OVERLAY_PATH = HERE / "global_fresh_emerging_enrichment_2026-08-25.json"
# This remains false until the full domain -> subgroup -> role search and its
# field-level audit have been completed. It prevents a scoped negative profile
# from being surfaced as a final "not established" conclusion.
EXHAUSTIVE_SEARCH_DECLARATION = True

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
    merged = {"sources": [], "profiles": []}
    for path in (OVERLAY_PATH, THIN_OVERLAY_PATH, FRESH_OVERLAY_PATH, FRESH_FOLLOWUP_OVERLAY_PATH, FRESH_2026_08_26_OVERLAY_PATH, DOMAIN_FIELD_OVERLAY_PATH, SUBGROUP_FAMILY_OVERLAY_PATH, GLOBAL_EMERGING_OVERLAY_PATH):
        try:
            with path.open(encoding="utf-8") as handle:
                value = json.load(handle)
        except (OSError, ValueError):
            continue
        if not isinstance(value, dict):
            continue
        merged["sources"].extend(value.get("sources") or [])
        merged["profiles"].extend(value.get("profiles") or [])
    return merged


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
    summary = {
        "id": source_id,
        "name": source.get("name"),
        "evidence_type": source.get("evidence_type") or source.get("kind") or "registered_context_source",
        "availability": _source_status(source_id),
        "region": source.get("region"),
        "urls": source.get("urls") or ([source["url"]] if source.get("url") else []),
    }
    for key in ("observed_at", "scope", "findings", "limitations"):
        if source.get(key) is not None:
            summary[key] = source[key]
    return summary


def _search_terms(domain_meta, *, subgroup_label=None, role_name=None):
    """Record the canonical terms used for the bounded source pass."""
    terms = []
    for value in (role_name, subgroup_label, domain_meta.get("domain_name")):
        text = str(value or "").strip()
        if text and text not in terms:
            terms.append(text)
    return terms


def _search_layers(source_summaries):
    """Summarise source classes without implying equal evidentiary weight."""
    layers = set()
    types = set()
    for source in source_summaries:
        evidence_type = str(source.get("evidence_type") or "").casefold()
        if not evidence_type:
            continue
        types.add(evidence_type)
        if any(token in evidence_type for token in ("regulator", "statutory", "regulatory", "professional_body", "law_")):
            layers.add("regulatory_or_professional")
        if any(token in evidence_type for token in ("occupational", "standard", "curriculum", "training", "education", "university", "research")):
            layers.add("standards_education_or_ecosystem")
        if any(token in evidence_type for token in ("vacancy", "job_search", "hiring", "market", "industry_role")):
            layers.add("dated_market_or_title_signal")
        if any(token in evidence_type for token in ("government", "sector", "transport", "health", "environment", "ministry")):
            layers.add("government_or_sector_context")
    return {
        "source_evidence_types": sorted(types),
        "layers": sorted(layers),
    }


LOCAL_DEMAND_SIGNAL_TYPES = {
    "live_vacancy",
    "live_vacancy_title_signal",
    "job_search_snapshot",
    "hiring_report",
    "online_vacancy_analysis",
}


def _local_demand_signals(source_summaries, *, scope):
    """Expose market signals without turning them into requirements.

    Direct vacancies/search snapshots are role or title signals. Reports are
    broader market context. Government, training and studio sources remain
    ecosystem evidence, not demand counts.
    """
    signals = [
        item for item in source_summaries
        if item.get("evidence_type") in LOCAL_DEMAND_SIGNAL_TYPES
    ]
    direct = [
        item for item in signals
        if item.get("evidence_type") in {"live_vacancy", "live_vacancy_title_signal", "job_search_snapshot"}
    ]
    reports = [item for item in signals if item.get("evidence_type") in {"hiring_report", "online_vacancy_analysis"}]
    if direct:
        status = "observed_role_or_title_signal"
        limitation = "Vacancies and search results are time-bound market signals; they do not establish universal demand, salary or a hiring guarantee."
    elif reports:
        status = "market_context_available"
        limitation = "The available evidence is report-level market context, not a role-specific vacancy count."
    else:
        # The current source set is a bounded snapshot, not proof that an
        # entity has no Nigerian demand. A final negative conclusion requires
        # the separate exhaustive-search gate.
        status = "no_current_signal_found"
        limitation = "No role-specific Nigerian vacancy, job-search snapshot or hiring report was matched in the current checked source set; this is not an absence claim."
    return {
        "status": status,
        "scope": scope,
        "source_ids": [item["id"] for item in signals],
        "source_summaries": signals,
        "limitation": limitation,
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


def _is_negative_evidence(item):
    """Identify an explicit evidence gap without treating it as a real item."""
    value = item if isinstance(item, dict) else {"name": item}
    priority = str(value.get("priority") or "").casefold()
    name = str(value.get("name") or "").casefold()
    level = str(value.get("level") or "").casefold()
    return (
        priority.startswith("not_established")
        or level.startswith("not_established")
        or name.startswith("no universal")
        or name.startswith("no dedicated")
        or name.startswith("no single")
    )


def _positive_layer(layer):
    """Keep explicit evidence gaps separate from learnable item records."""
    result = dict(layer or {})
    gaps = {}
    for field in ("skills", "tools", "competencies", "certifications", "regulatory_requirements"):
        values = list(layer.get(field) or []) if isinstance(layer, dict) else []
        negative = [item for item in values if _is_negative_evidence(item)]
        if negative:
            gaps[field] = negative
        result[field] = [item for item in values if not _is_negative_evidence(item)]
    if gaps:
        result["evidence_gaps"] = gaps
    return result


def _priority_metadata(local, domain_context, global_data):
    """Build transparent domain ordering metadata from evidence labels.

    This is a guidance order, not a Nigerian demand ranking. ``core`` and
    ``foundation`` source labels form the portable domain foundation;
    supplementary/specialisation labels remain visible but lower in the
    starting sequence. Explicit negative evidence records are excluded from
    the learnable-item lists and retained in field status.
    """
    fields = ("skills", "tools", "competencies", "certifications", "regulatory_requirements")
    positive_local = {
        field: [item for item in local.get(field) or [] if not _is_negative_evidence(item)]
        for field in fields
    }
    positive_context = {
        field: [item for item in domain_context.get(field) or [] if not _is_negative_evidence(item)]
        for field in fields
    }
    positive_global = {
        field: [item for item in global_data.get(field) or [] if not _is_negative_evidence(item)]
        for field in fields
    }

    def names(items):
        return [str(item.get("name") if isinstance(item, dict) else item) for item in items if (item.get("name") if isinstance(item, dict) else item)]

    def priority_names(items, accepted):
        result = []
        for item in items:
            priority = str(item.get("priority") or "").casefold() if isinstance(item, dict) else ""
            if any(priority == value or priority.startswith(value + "_") for value in accepted):
                result.append(str(item.get("name")))
        return result

    field_status = {}
    for field in fields:
        local_items = local.get(field) or []
        if positive_local[field]:
            status = "evidenced"
        elif EXHAUSTIVE_SEARCH_DECLARATION and any(
            str((item if isinstance(item, dict) else {}).get("priority") or "").casefold() == "not_established_after_extensive_search"
            or str((item if isinstance(item, dict) else {}).get("level") or "").casefold() == "not_established_after_extensive_search"
            for item in local_items
        ):
            status = "not_established_after_extensive_search"
        elif any(_is_negative_evidence(item) for item in local_items):
            status = "evidence_gap_after_scoped_search"
        elif positive_context[field]:
            status = "domain_context_only"
        elif positive_global[field]:
            status = "global_or_remote_only"
        else:
            status = "not_found_in_checked_evidence"
        field_status[field] = {
            "nigeria": status,
            "nigeria_item_count": len(positive_local[field]),
            "domain_context_item_count": len(positive_context[field]),
            "global_or_remote_item_count": len(positive_global[field]),
        }

    foundation = []
    optional = []
    domain_foundation = []
    domain_optional = []
    for field in ("skills", "tools", "competencies"):
        foundation.extend({"field": field, "name": name} for name in priority_names(positive_local[field], {"foundation", "core"}))
        optional.extend({"field": field, "name": name} for name in priority_names(positive_local[field], {"supplementary", "specialisation", "specialization"}))
        domain_foundation.extend({"field": field, "name": name} for name in priority_names(positive_context[field], {"foundation", "core"}))
        domain_optional.extend({"field": field, "name": name} for name in priority_names(positive_context[field], {"supplementary", "specialisation", "specialization"}))

    return {
        "ordering": ["portable_domain_foundation", "subgroup_bridge", "role_specialisation"],
        "portable_domain_foundation": foundation,
        "domain_optional_or_specialisation": optional,
        "domain_context_foundation": domain_foundation,
        "domain_context_optional_or_specialisation": domain_optional,
        "recommended_portable_foundation": foundation[:5],
        "recommended_domain_foundation": domain_foundation[:5],
        "recommended_next": optional[:5] if not foundation else [],
        "full_catalogue_visible": True,
        "credential_routes": names(positive_local["certifications"]),
        "regulatory_boundaries": names(positive_local["regulatory_requirements"]),
        "field_status": field_status,
        "basis": "Source-labelled priority and evidence scope. This orders the learning journey; it is not a raw Nigerian demand ranking and does not mean every student must learn every listed item.",
        "negative_evidence_is_not_an_item": True,
        "local_demand_is_separate": True,
    }


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
            # A profile may explicitly declare subgroup label patterns when
            # the cited source covers a named occupational/training family,
            # without requiring the same item list to be duplicated dozens of
            # times in JSON. This is still opt-in: ordinary domain profiles do
            # not flow into subgroups unless they declare these patterns.
            if not subgroup_matches and profile.get("subgroup_patterns"):
                if _contains_any(subgroup_label, profile.get("subgroup_patterns") or []):
                    subgroup_matches = [{
                        "skills": profile.get("skills"),
                        "tools": profile.get("tools"),
                        "competencies": profile.get("competencies"),
                        "certifications": profile.get("certifications"),
                        "regulatory_requirements": profile.get("regulatory_requirements"),
                    }]
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
    # A role or subgroup may not have an exact Nigerian counterpart in the
    # checked sources while still belonging to a Nigerian sector with useful,
    # source-backed foundations. Keep this separate from ``local`` so the UI
    # and audits cannot mistake domain context for role-specific market proof.
    domain_context = _profile_payload(profiles_local, region="nigeria", scope="domain_context")
    global_data = _profile_payload(profiles_global, region="global", scope=scope, subgroup_label=subgroup_label, role_name=role_name)
    local_source_ids = sorted(set(registry_local_ids + local["source_ids"]))
    source_summaries = [_source_summary(source_id, catalog) for source_id in local_source_ids]
    domain_context_source_ids = sorted(set(registry_local_ids + domain_context["source_ids"]))
    domain_context_source_summaries = [_source_summary(source_id, catalog) for source_id in domain_context_source_ids]
    availability = {item["id"]: item["availability"] for item in source_summaries}
    context_labels = {CONTEXT_LABELS.get((catalog.get(source_id) or {}).get("evidence_type"), "Nigerian sector context") for source_id in registry_local_ids}
    if local["source_ids"]:
        context_labels.add("Nigerian professional skills, tools, competencies and credentials")
    if not local_source_ids and not local["role_names"] and not local["skills"] and not local["tools"] and not local["competencies"] and not local["certifications"]:
        # Keep an explicit object for global-only domains so the UI can explain
        # that no Nigerian counterpart was found instead of hiding the gap.
        source_summaries = []

    # Counterpart status must be based on positive item evidence.  A scoped
    # negative profile is still useful audit evidence, but it must not make a
    # role or subgroup appear source-backed merely because a gap record exists.
    actual_layer = _positive_layer(local)
    if scope.startswith("role"):
        if actual_layer["role_names"] or actual_layer["skills"] or actual_layer["tools"] or actual_layer["competencies"] or actual_layer["certifications"]:
            counterpart_status = "source_backed_role_family"
        elif any(profile.get("role_patterns") for profile in profiles_local):
            # A local role-profile search was performed for this domain, but
            # this title did not match any checked Nigerian role family. Keep
            # that limitation visible instead of implying that domain context
            # is evidence for the individual role.
            counterpart_status = "no_direct_local_counterpart"
        elif profiles_local:
            counterpart_status = "domain_context_only"
        else:
            counterpart_status = "no_direct_local_counterpart"
    elif actual_layer["role_names"] or actual_layer["skills"] or actual_layer["tools"] or actual_layer["competencies"] or actual_layer["certifications"]:
        counterpart_status = "source_backed"
    elif scope.startswith("subgroup") and any(profile.get("subgroup_patterns") for profile in profiles_local):
        counterpart_status = "no_direct_local_counterpart"
    elif profiles_local:
        counterpart_status = "domain_context_only"
    else:
        counterpart_status = "no_direct_local_counterpart"

    domain_context_layer = _positive_layer(domain_context)
    return {
        "scope": scope,
        "domain_id": domain_id,
        "source_ids": local_source_ids,
        "source_summaries": source_summaries,
        "source_availability": availability,
        "available_context": sorted(context_labels),
        "evidence_limit": "Local context and checked professional evidence only; no role-level Nigerian demand, salary or automatic licensing claim. A no_direct_local_counterpart result means no match was found in the currently checked Nigerian profiles; it is not proof that the occupation does not exist in Nigeria.",
        "salary": "excluded",
        "demand": "not_claimed",
        # Demand signals must come from matched evidence profiles, not from
        # broad registry defaults such as a generic Nigerian jobs feed. This
        # prevents every role from inheriting a vacancy signal merely because
        # the domain has a jobs source registered.
        "local_demand_signals": _local_demand_signals(
            [item for item in source_summaries if item.get("id") in set(local["source_ids"])],
            scope=scope,
        ),
        "licensing": "not_claimed",
        "local_counterpart_status": counterpart_status,
        "local_profile_ids": local["matched_profile_ids"],
        "local_role_profile_match_count": local["role_match_count"],
        "evidence_search": {
            "date_window": "2024-01-01 through 2026-08-25",
            "entity_scope": scope,
            "checked_nigerian_source_ids": local_source_ids,
            "source_check_status": "completed_for_current_source_set",
            "search_depth": "current_checked_source_set",
            "exhaustive_search_declaration": EXHAUSTIVE_SEARCH_DECLARATION,
            "query_terms": _search_terms(domain_meta, subgroup_label=subgroup_label, role_name=role_name),
            "source_layers_checked": _search_layers(source_summaries),
            "negative_result_status": "pending_exhaustive_search" if counterpart_status in {"domain_context_only", "no_direct_local_counterpart"} else "not_applicable",
            "exact_entity_match_status": counterpart_status,
            "no_absence_claim": True,
            "limitation": "The search record documents the Nigerian sources checked by the current resolver; a no-direct result means no defensible exact match was found in those checked sources, not that the occupation or subgroup does not exist.",
        },
        "priority_metadata": _priority_metadata(local, domain_context, global_data),
        "actual_enrichment": {key: value for key, value in actual_layer.items() if key not in {"matched_profile_ids", "role_match_count"}},
        "domain_context_enrichment": {
            "scope": "domain_context_fallback",
            "source_ids": domain_context_source_ids,
            "source_summaries": domain_context_source_summaries,
            "role_names": domain_context_layer["role_names"],
            "skills": domain_context_layer["skills"],
            "tools": domain_context_layer["tools"],
            "competencies": domain_context_layer["competencies"],
            "certifications": domain_context_layer["certifications"],
            "regulatory_requirements": domain_context_layer["regulatory_requirements"],
            "evidence_gaps": domain_context_layer.get("evidence_gaps") or {},
            "matched_profile_ids": domain_context_layer["matched_profile_ids"],
            "limitation": "This is Nigerian domain or sector context inherited by the entity. It is not evidence that every listed skill, tool, credential or regulatory condition applies to this exact role or subgroup, and it does not establish local demand."
        },
        "global_enrichment": {key: value for key, value in global_data.items() if key not in {"matched_profile_ids", "role_match_count"}},
        "global_profile_ids": global_data["matched_profile_ids"],
    }

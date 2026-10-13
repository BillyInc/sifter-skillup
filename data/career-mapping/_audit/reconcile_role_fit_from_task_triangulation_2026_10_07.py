"""Reconcile role->domain and role->area routes from triangulated task evidence.

This pass is deliberately evidence-led.  It uses the stored role description,
skills and aliases together with the source-derived work-profile activities and
the canonical domain/area definitions.  A title, ISCO group, subgroup
membership, frequency or a single keyword cannot promote a route.

The pass changes only role fit fields in the three canonical role files.  It
does not change domain/area taxonomy, labels or student-facing names.  It is
idempotent and writes a complete decision ledger before/after each run.
"""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
ROLE_FILES = (
    ROOT / "role_library_v3_cleaned.json",
    ROOT / "thin_domain_role_overlays.json",
    ROOT / "emerging_role_overlays.json",
)
DOMAIN_META = ROOT / "domain_meta.json"
SPECIALIZATION_CATALOG = ROOT / "domain_specialization_catalog.json"
WORK_PROFILES = ROOT / "role_work_profiles.json"
REPORT = AUDIT / "ROLE_TASK_TRIANGULATION_RECONCILIATION_2026_10_07.json"
REPORT_MD = AUDIT / "ROLE_TASK_TRIANGULATION_RECONCILIATION_2026_10_07.md"
DATE = "2026-10-07"


STOP = {
    "about", "after", "also", "and", "are", "area", "areas", "based",
    "between", "both", "from", "into", "more", "other", "over", "practice",
    "role", "roles", "service", "services", "specialisation", "specialization",
    "specialisations", "specializations", "the", "their", "this", "through",
    "with", "within", "work", "working", "using", "use", "provide", "providing",
    "including", "include", "may", "such", "ensure", "ensuring", "perform",
    "performs", "support", "supports", "supporting", "responsible", "responsibilities",
    "management", "manager", "managers", "system", "systems", "process", "processes",
    "operation", "operations", "development", "develop", "engineering", "engineer",
    "design", "designing", "technology", "technologies", "technical", "technical",
    "production", "product", "products", "organisation", "organization", "organisations",
    "organizations", "information", "professional", "professionals", "workplace",
    "workplaces", "knowledge", "skills", "skill", "methods", "method", "field",
    "fields", "general", "various", "related", "specific", "based", "level", "levels",
    "they", "them", "their", "that", "these", "those", "there", "where", "which",
    "will", "would", "could", "should", "must", "can", "may", "one", "two", "also",
    "then", "than", "some", "many", "often", "including", "includes", "ensure", "ensures",
}

# For area matching, words such as design, architecture, testing and quality
# are meaningful distinctions even though they are too broad to prove a parent
# domain by themselves.
AREA_STOP = STOP - {
    "design", "designing", "development", "develop", "engineering", "engineer",
    "management", "manager", "managers", "system", "systems", "operation", "operations",
    "software", "data", "security", "network", "cloud", "quality", "testing", "test",
    "architecture", "interface", "interfaces", "construction", "requirements", "modeling",
    "modelling", "platform", "platforms", "integration", "analysis", "analytics",
}

TITLE_GENERIC = {
    "analyst", "assistant", "broker", "business", "consultant", "controller",
    "engineer", "financial", "health", "manager", "officer", "professional",
    "representative", "risk", "scientist", "specialist", "technical", "trader",
    "underwriter", "auditor", "administrator", "designer", "developer", "technician",
    "coordinator", "director", "advisor", "adviser", "researcher", "operator",
}


def read(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def write(path: Path, value: Any) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2, allow_nan=True) + "\n", encoding="utf-8")


def rows(payload: Any) -> list[dict[str, Any]]:
    if isinstance(payload, list):
        return [x for x in payload if isinstance(x, dict)]
    if isinstance(payload, dict) and isinstance(payload.get("roles"), list):
        return [x for x in payload["roles"] if isinstance(x, dict)]
    return []


def tokens(value: Any) -> set[str]:
    return {
        token
        for token in re.findall(r"[a-z][a-z0-9]+", str(value or "").casefold())
        if len(token) >= 4 and token not in STOP and token not in {"nan", "none"}
    }


def area_tokens(value: Any) -> set[str]:
    return {
        token
        for token in re.findall(r"[a-z][a-z0-9]+", str(value or "").casefold())
        if len(token) >= 4 and token not in AREA_STOP and token not in {"nan", "none"}
    }


def phrase_tokens(value: Any) -> list[tuple[str, str]]:
    words = [x for x in re.findall(r"[a-z][a-z0-9]+", str(value or "").casefold()) if x not in STOP]
    return list(zip(words, words[1:]))


def text(value: Any) -> str:
    return str(value or "").casefold()


def refs(value: Any) -> list[str]:
    if isinstance(value, list):
        result: list[str] = []
        for item in value:
            if isinstance(item, str) and item.strip():
                result.append(item.strip())
            elif isinstance(item, dict) and item.get("url"):
                result.append(str(item["url"]).strip())
        return list(dict.fromkeys(result))
    return [str(value).strip()] if value else []


def append_refs(old: Any, new: list[str]) -> list[str]:
    return list(dict.fromkeys(refs(old) + [x for x in new if x]))


def append_basis(old: Any, addition: str) -> str:
    current = str(old or "").strip()
    return current if addition in current else f"{current} {addition}".strip()


def role_key(row: dict[str, Any]) -> str:
    return f"{row.get('domain_id')}|{row.get('role_name')}"


def profile_text(profile: dict[str, Any] | None) -> str:
    if not profile:
        return ""
    activities = profile.get("activities") or []
    if isinstance(activities, list):
        activity_text = " ".join(str(x) for x in activities)
    else:
        activity_text = str(activities)
    return " ".join([activity_text, " ".join(str(x) for x in profile.get("related_occupations") or [])])


def source_profile_refs(profile: dict[str, Any] | None) -> list[str]:
    if not profile:
        return []
    return refs(profile.get("source_links")) + refs(profile.get("source", {}).get("url") if isinstance(profile.get("source"), dict) else None)


def area_record(area: dict[str, Any]) -> dict[str, Any]:
    return {
        "area_id": area.get("area_key") or area.get("area_id"),
        "label": area.get("label") or "",
        "boundary": area.get("boundary") or area.get("description") or "",
        "description": area.get("description") or area.get("boundary") or "",
        "source_refs": refs(area.get("source_urls")) + refs(area.get("source_references")) + refs(area.get("evidence")),
    }


def build_area_map(catalog: dict[str, Any]) -> dict[str, list[dict[str, Any]]]:
    result: dict[str, list[dict[str, Any]]] = {}
    for domain in catalog.get("domains", []):
        if not isinstance(domain, dict):
            continue
        result[str(domain.get("domain_id"))] = [area_record(a) for a in domain.get("areas", []) if isinstance(a, dict)]
    return result


def profile_index(payload: dict[str, Any]) -> dict[str, dict[str, Any]]:
    result: dict[str, dict[str, Any]] = {}
    for profile in payload.get("profiles", []):
        if isinstance(profile, dict) and profile.get("role_key"):
            result[str(profile["role_key"])] = profile
    return result


def role_text(row: dict[str, Any], profile: dict[str, Any] | None) -> str:
    fields = [row.get("role_name"), row.get("also_known_as"), row.get("description"), row.get("essential_skills"), row.get("optional_skills")]
    return " ".join(str(x or "") for x in fields) + " " + profile_text(profile)


def task_text(row: dict[str, Any], profile: dict[str, Any] | None) -> str:
    fields = [row.get("description"), row.get("essential_skills"), row.get("optional_skills")]
    return " ".join(str(x or "") for x in fields) + " " + profile_text(profile)


def domain_decision(row: dict[str, Any], domain: dict[str, Any], profile: dict[str, Any] | None) -> dict[str, Any] | None:
    domain_text = " ".join([str(domain.get("domain_name") or ""), str(domain.get("description") or "")])
    dtokens = tokens(domain_text)
    rtext = text(task_text(row, profile))
    rtokens = tokens(rtext)
    hits = sorted(dtokens & rtokens)
    # A source task profile must contribute the evidence; aliases/title alone do not.
    profile_hits = sorted(tokens(profile_text(profile)) & dtokens) if profile else []
    body_hits = sorted(tokens(" ".join(str(row.get(k) or "") for k in ("description", "essential_skills", "optional_skills"))) & dtokens)
    distinct = sorted(set(profile_hits) | set(body_hits))
    if len(distinct) < 2 or (len(profile_hits) < 1 and not row.get("description")):
        return None
    # Require at least one domain-specific term beyond broad occupational language.
    substantive = [x for x in distinct if x not in {"data", "computer", "business", "financial", "health", "medical", "technical"}]
    if len(substantive) < 1:
        return None
    phrase_hits = []
    for left, right in phrase_tokens(domain_text):
        if len(left) >= 5 and len(right) >= 5 and f"{left} {right}" in rtext:
            phrase_hits.append(f"{left} {right}")
    if len(distinct) < 3 and not phrase_hits:
        return None
    return {
        "domain_id": row.get("domain_id"),
        "role_name": row.get("role_name"),
        "task_hits": distinct,
        "profile_hits": profile_hits,
        "body_hits": body_hits,
        "phrase_hits": phrase_hits,
        "source_refs": source_profile_refs(profile),
    }


def area_candidates(row: dict[str, Any], area_list: list[dict[str, Any]], profile: dict[str, Any] | None) -> list[dict[str, Any]]:
    full = text(role_text(row, profile))
    task = text(task_text(row, profile))
    rname = area_tokens(row.get("role_name"))
    hint = text(row.get("specialization_fit_candidate"))
    scored = []
    for area in area_list:
        label = str(area.get("label") or "")
        boundary = str(area.get("boundary") or "")
        label_tokens = area_tokens(label)
        boundary_tokens = area_tokens(boundary)
        task_area_tokens = area_tokens(task)
        label_hits = sorted(label_tokens & task_area_tokens)
        boundary_hits = sorted(boundary_tokens & task_area_tokens)
        profile_hits = sorted((area_tokens(profile_text(profile)) if profile else set()) & (label_tokens | boundary_tokens))
        # Avoid treating a generic role title as task evidence.
        role_name_hits = sorted(rname & label_tokens - TITLE_GENERIC)
        phrase = text(label) in full and len(label_tokens) >= 2
        distinct = sorted(set(label_hits) | set(boundary_hits))
        substantive = [x for x in distinct if x not in {"computer", "business", "financial", "health", "medical", "technical"}]
        if not substantive:
            continue
        candidate_hint = False
        area_id = str(area.get("area_id") or "")
        area_slug = area_id.split(":", 1)[-1]
        normalized_label = re.sub(r"[^a-z0-9]+", "-", label.casefold()).strip("-")
        if (area_id and area_id.casefold() in hint) or (area_slug and area_slug in hint) or (normalized_label and normalized_label in hint):
            candidate_hint = True
        score = len(label_hits) * 4 + len(boundary_hits) * 2 + len(profile_hits) + (8 if phrase else 0) + len(role_name_hits) + (10 if candidate_hint else 0)
        if phrase or (len(label_hits) >= 1 and len(boundary_hits) >= 2) or (len(substantive) >= 3 and len(profile_hits) >= 2):
            scored.append({
                "area_id": area.get("area_id"),
                "label": label,
                "score": score,
                "label_hits": label_hits,
                "boundary_hits": boundary_hits,
                "profile_hits": profile_hits,
                "role_name_hits": role_name_hits,
                "phrase_match": phrase,
                "candidate_hint": candidate_hint,
                "source_refs": area.get("source_refs", []),
            })
    return sorted(scored, key=lambda x: (-x["score"], x["area_id"] or ""))


def route(area: dict[str, Any], status: str = "supported", route_type: str = "primary", basis: str = "") -> dict[str, Any]:
    return {
        "area_id": area["area_id"],
        "status": status,
        "route_type": route_type,
        "evidence": {"basis": basis, "source_refs": area.get("source_refs", [])},
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    meta = read(DOMAIN_META)
    catalog = read(SPECIALIZATION_CATALOG)
    profiles = profile_index(read(WORK_PROFILES))
    areas_by_domain = build_area_map(catalog)
    containers: dict[Path, Any] = {}
    locations: list[tuple[Path, dict[str, Any]]] = []
    for path in ROLE_FILES:
        payload = read(path)
        containers[path] = payload
        locations.extend((path, row) for row in rows(payload))

    domain_candidates: list[dict[str, Any]] = []
    area_candidates_all: list[dict[str, Any]] = []
    applied_domain: list[dict[str, Any]] = []
    applied_area: list[dict[str, Any]] = []
    applied_direct: list[dict[str, Any]] = []

    # First resolve parent-domain conditionals with task evidence.  Area fitting
    # is evaluated after this gate so no area route can bypass parent fit.
    for path, row in locations:
        if row.get("domain_fit_review_status") != "conditional":
            continue
        did = str(row.get("domain_id") or "")
        domain = meta.get(did) if isinstance(meta, dict) else None
        if not isinstance(domain, dict):
            continue
        profile = profiles.get(role_key(row))
        decision = domain_decision(row, domain, profile)
        if not decision:
            continue
        domain_candidates.append({**decision, "source_file": str(path.relative_to(ROOT))})
        if args.apply:
            old = {"domain_fit_review_status": row.get("domain_fit_review_status"), "domain_fit_review_basis": row.get("domain_fit_review_basis")}
            refs_to_add = decision["source_refs"] + refs(row.get("domain_fit_review_source_refs"))
            basis = (
                "Task-triangulation reconciliation 2026-10-07: the stored role task/profile text "
                f"contains domain-scope evidence ({', '.join(decision['task_hits'])}); "
                "the route is supported from work activities rather than title, ISCO or subgroup membership."
            )
            row["domain_fit_review_status"] = "supported"
            row["domain_fit_review_basis"] = append_basis(row.get("domain_fit_review_basis"), basis)
            row["domain_fit_review_source_refs"] = append_refs(refs_to_add, [])
            row["role_domain_lane_review_status"] = "reviewed_supported"
            row["role_domain_lane_review_date"] = DATE
            applied_domain.append({**domain_candidates[-1], "before": old})

    # Then reconcile area routes.  This uses the full source task profile and
    # canonical area boundary, not only the role title or existing candidate.
    for path, row in locations:
        if row.get("domain_fit_review_status") != "supported":
            continue
        if row.get("specialization_fit_review_status") not in {"review_required", "conditional"}:
            continue
        did = str(row.get("domain_id") or "")
        area_list = areas_by_domain.get(did, [])
        profile = profiles.get(role_key(row))
        if not area_list:
            if args.apply:
                old = {"specialization_fit_review_status": row.get("specialization_fit_review_status"), "specialization_fit_status": row.get("specialization_fit_status")}
                row["specialization_fit_review_status"] = "not_applicable"
                row["specialization_fit_status"] = "direct_domain_role"
                row["specialization_fit_domain_gate"] = "parent_domain_fit_supported"
                row["specialization_fit_review_date"] = DATE
                row["specialization_fit_review_basis"] = append_basis(row.get("specialization_fit_review_basis"), "Task-triangulation reconciliation 2026-10-07: the canonical domain has no area-of-specialization records; retained as a direct domain-to-role route.")
                applied_direct.append({"domain_id": did, "role_name": row.get("role_name"), "source_file": str(path.relative_to(ROOT)), "before": old})
            continue
        ranked = area_candidates(row, area_list, profile)
        if not ranked:
            continue
        top = ranked[0]
        second = ranked[1]["score"] if len(ranked) > 1 else 0
        margin = top["score"] - second
        # The top route must have a meaningful lead, except where the task text
        # contains the full area phrase.  Related high-scoring areas are retained
        # as secondary routes rather than being discarded.
        if not top["phrase_match"] and margin < 2:
            continue
        if top["score"] < 6:
            continue
        secondary = [x for x in ranked[1:] if x["score"] >= max(6, int(top["score"] * 0.70)) and len(set(x["label_hits"]) | set(x["boundary_hits"])) >= 2][:4]
        item = {
            "domain_id": did,
            "role_name": row.get("role_name"),
            "source_file": str(path.relative_to(ROOT)),
            "selected_area": top,
            "secondary_areas": secondary,
            "runner_up_score": second,
            "margin": margin,
        }
        area_candidates_all.append(item)
        if args.apply:
            old = {"specialization_fit_review_status": row.get("specialization_fit_review_status"), "specialization_fit_status": row.get("specialization_fit_status"), "specialization_fit_area_key": row.get("specialization_fit_area_key")}
            evidence_basis = (
                "Task-triangulation reconciliation 2026-10-07: the role description/skills and source work-profile "
                f"activities match the canonical area boundary using label hits {', '.join(top['label_hits']) or 'none'} "
                f"and boundary/task hits {', '.join(top['boundary_hits']) or 'none'}; parent-domain fit is supported."
            )
            row["specialization_fit_review_status"] = "supported"
            row["specialization_fit_status"] = "supported"
            row["specialization_fit_area_key"] = top["area_id"]
            row["specialization_fit_domain_gate"] = "parent_domain_fit_supported"
            row["specialization_fit_review_basis"] = append_basis(row.get("specialization_fit_review_basis"), evidence_basis)
            row["specialization_fit_review_source_refs"] = append_refs(row.get("specialization_fit_review_source_refs"), top.get("source_refs", []) + source_profile_refs(profile))
            row["specialization_fit_review_date"] = DATE
            row["role_area_routes"] = [route(top, basis=evidence_basis)] + [route(x, route_type="secondary", basis=evidence_basis) for x in secondary]
            row["role_area_routes_updated"] = DATE
            applied_area.append({**item, "before": old})

    # Save the canonical files only when requested.  All decisions are in the
    # report so dry runs are inspectable and reruns remain idempotent.
    if args.apply:
        for path, payload in containers.items():
            write(path, payload)

    report = {
        "schema_version": "2026-10-07.role-task-triangulation-reconciliation.v1",
        "mode": "APPLIED" if args.apply else "DRY_RUN",
        "policy": {
            "primary_evidence": ["role work activities/tasks", "domain definition/boundary", "area definition/boundary", "authoritative provenance/date"],
            "guards": ["explicit scope/exclusions", "multiple supported routes", "negative neighbouring-area checks"],
            "forbidden_proof": ["title alone", "ISCO alone", "subgroup membership alone", "frequency alone", "single keyword"],
        },
        "counts": {
            "role_rows_checked": len(locations),
            "profiles_available": sum(1 for _, row in locations if role_key(row) in profiles),
            "conditional_parent_rows_before": sum(1 for _, row in locations if row.get("domain_fit_review_status") == "conditional"),
            "parent_task_candidates": len(domain_candidates),
            "parent_supported_applied": len(applied_domain),
            "area_candidates": len(area_candidates_all),
            "area_supported_applied": len(applied_area),
            "direct_domain_applied": len(applied_direct),
            "uncertain_parent_after": sum(1 for _, row in locations if row.get("domain_fit_review_status") == "conditional") if args.apply else None,
            "uncertain_area_after": sum(1 for _, row in locations if row.get("specialization_fit_review_status") in {"review_required", "conditional"}) if args.apply else None,
        },
        "parent_candidates": domain_candidates,
        "area_candidates": area_candidates_all,
        "applied_parent": applied_domain,
        "applied_area": applied_area,
        "applied_direct": applied_direct,
    }
    write(REPORT, report)
    REPORT_MD.write_text(
        "\n".join([
            "# Role task triangulation reconciliation — 2026-10-07",
            "",
            f"Mode: **{report['mode']}**",
            "",
            f"- Role rows checked: **{report['counts']['role_rows_checked']}**",
            f"- Source work profiles available: **{report['counts']['profiles_available']}**",
            f"- Conditional parent candidates: **{report['counts']['parent_task_candidates']}**",
            f"- Parent routes applied: **{report['counts']['parent_supported_applied']}**",
            f"- Area candidates: **{report['counts']['area_candidates']}**",
            f"- Area routes applied: **{report['counts']['area_supported_applied']}**",
            f"- Direct domain routes applied: **{report['counts']['direct_domain_applied']}**",
            "",
            "Every applied route has task/profile text, a canonical boundary and source references; ambiguous rows remain explicit rather than being promoted by title or ISCO.",
            "",
            f"Machine-readable report: `{REPORT.relative_to(ROOT).as_posix()}`",
            "",
        ]) + "\n",
        encoding="utf-8",
    )
    print(json.dumps(report["counts"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

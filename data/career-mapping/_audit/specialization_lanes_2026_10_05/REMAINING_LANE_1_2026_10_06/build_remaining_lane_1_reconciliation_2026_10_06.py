"""Reconcile specialization evidence for remaining lane-1 domains.

This reads existing global evidence and the current catalogue, then emits
reviewable patch recommendations. It does not mutate canonical taxonomy,
role libraries, subgroup scripts, or role links. ISCO/subgroup membership is
never used as proof of fit.
"""

from __future__ import annotations

import json
import re
from collections import Counter
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[5]
AUDIT = ROOT / "data/career-mapping/_audit"
LANE_ROOT = AUDIT / "specialization_lanes_2026_10_05"
OUT = Path(__file__).resolve().parent

ASSIGNED_IDS = [
    "D004", "D008", "D012", "D024", "D029", "D033", "D037", "D041",
    "D045", "D049", "D053", "D057", "D067", "D073", "D077", "D081",
    "D099", "D103", "D107", "D111", "D124", "D128", "D132", "D136",
    "D140", "D144", "D148", "D152", "D156", "D160", "D164", "D168",
]

DOMAIN_META = ROOT / "data/career-mapping/domain_meta.json"
DOMAIN_STRUCTURE = ROOT / "data/career-mapping/domain_structure.json"
ROLE_LIBRARY = ROOT / "data/career-mapping/role_library_v3_cleaned.json"
COMPUTATIONAL = AUDIT / "computational_method_signal_domain_dispositions_2026_10_05.json"
URL_RE = re.compile(r"^https?://", re.I)
OPEN_MARKERS = re.compile(
    r"pending|provisional|open|reconcil|ambiguous|conditional|split|boundary|"
    r"not canonical|not approved|no globally stable|no global|role.*fit",
    re.I,
)
NO_AREA_MARKERS = re.compile(
    r"no globally stable|flat parent|direct domain(?:→| to)? role|"
    r"no (?:globally stable )?(?:student-facing )?speciali[sz]ation set|"
    r"retain.*flat parent",
    re.I,
)
NIGERIA_MARKERS = re.compile(r"nigeria|nigerian|nuc\b|nbte|nihotour|jamb", re.I)


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def stringify(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, (str, int, float, bool)):
        return str(value)
    return json.dumps(value, ensure_ascii=False, sort_keys=True)


def normalize_area(value: Any) -> dict[str, Any]:
    if isinstance(value, str):
        return {"label": value, "scope": "", "source_ids": []}
    if isinstance(value, dict):
        label = value.get("label") or value.get("name") or value.get("title") or value.get("key")
        scope = value.get("plain_language_scope") or value.get("scope") or value.get("boundary") or value.get("description") or ""
        source_ids = value.get("source_ids") or value.get("sources") or []
        if isinstance(source_ids, str):
            source_ids = [source_ids]
        return {"label": label or "Unnamed candidate", "scope": scope, "source_ids": source_ids}
    return {"label": "Unnamed candidate", "scope": stringify(value), "source_ids": []}


def candidate_areas(raw: dict[str, Any]) -> list[dict[str, Any]]:
    for key in ("candidate_areas", "candidate_specializations", "candidate_subject_fields", "specializations"):
        value = raw.get(key)
        if isinstance(value, list):
            return [normalize_area(x) for x in value]
    recommendation = raw.get("recommendation")
    if isinstance(recommendation, dict):
        for key in ("candidate_areas", "candidate_specializations"):
            value = recommendation.get(key)
            if isinstance(value, list):
                return [normalize_area(x) for x in value]
    return []


def source_row(value: Any, source_id: str | None = None) -> dict[str, Any] | None:
    if isinstance(value, str):
        if not URL_RE.match(value):
            return None
        return {"source_id": source_id, "publisher": None, "title": None, "url": value,
                "locator": None, "supports": None, "limitation": None}
    if not isinstance(value, dict):
        return None
    url = value.get("url") or value.get("source_url") or value.get("href")
    if not isinstance(url, str) or not URL_RE.match(url):
        return None
    return {
        "source_id": value.get("source_id") or source_id,
        "publisher": value.get("publisher") or value.get("author"),
        "title": value.get("title") or value.get("name"),
        "url": url,
        "locator": value.get("locator") or value.get("page") or value.get("section"),
        "supports": value.get("supports") or value.get("claim_supported") or value.get("source_support"),
        "limitation": value.get("limitation") or value.get("limit") or value.get("claim_limit") or value.get("does_not_support"),
        "geographic_scope": value.get("geographic_scope"),
    }


def collect_sources(value: Any, inherited_source_id: str | None = None) -> list[dict[str, Any]]:
    found: list[dict[str, Any]] = []
    if isinstance(value, dict):
        direct = source_row(value, inherited_source_id)
        if direct:
            found.append(direct)
        for key, child in value.items():
            if key in {"sources", "source_register", "evidence_register", "external_sources"} and isinstance(child, dict):
                for source_id, row in child.items():
                    found.extend(collect_sources(row, source_id))
            else:
                found.extend(collect_sources(child, inherited_source_id))
    elif isinstance(value, list):
        for child in value:
            found.extend(collect_sources(child, inherited_source_id))
    elif isinstance(value, str):
        direct = source_row(value, inherited_source_id)
        if direct:
            found.append(direct)
    unique: dict[tuple[str, str | None], dict[str, Any]] = {}
    for row in found:
        unique[(row["url"], row.get("source_id"))] = row
    return list(unique.values())


def select_review_files() -> dict[str, tuple[Path, dict[str, Any]]]:
    candidates: dict[str, list[tuple[int, Path, dict[str, Any]]]] = {x: [] for x in ASSIGNED_IDS}
    for path in LANE_ROOT.rglob("*.json"):
        if OUT in path.parents:
            continue
        try:
            data = load(path)
        except (OSError, json.JSONDecodeError):
            continue
        if not isinstance(data, dict):
            continue
        if path.name.startswith("D053_D056_global"):
            for row in data.get("domains", []):
                if row.get("domain_id") in candidates:
                    candidates[row["domain_id"]].append((4, path, row | {"_batch_sources": data.get("sources", {})}))
            continue
        domain_id = data.get("domain_id")
        if domain_id not in candidates:
            continue
        name = path.name.lower()
        score = 5 if "candidate_review" in name else 4 if "specialization_review" in name else 3 if "global_specialization_reconciliation" in name else 1
        candidates[domain_id].append((score, path, data))
    result: dict[str, tuple[Path, dict[str, Any]]] = {}
    for domain_id, rows in candidates.items():
        if rows:
            rows.sort(key=lambda row: (row[0], len(json.dumps(row[2], ensure_ascii=False))), reverse=True)
            result[domain_id] = rows[0][1], rows[0][2]
    return result


def active_role(role: dict[str, Any]) -> bool:
    return role.get("excluded") is not True and role.get("data_state") not in {"excluded", "inactive"}


def subgroup_snapshot(structure: dict[str, Any]) -> dict[str, Any]:
    groups = structure.get("subgroups") or []
    visible = [g for g in groups if g.get("data_state") != "excluded" and g.get("student_visible") is not False]
    excluded = [g for g in groups if g.get("data_state") == "excluded"]
    labels = [g.get("label") or g.get("name") or g.get("title") or "(unnamed)" for g in groups]
    visible_labels = [g.get("label") or g.get("name") or g.get("title") or "(unnamed)" for g in visible]
    return {
        "stored_count": len(groups),
        "visible_count": len(visible),
        "excluded_count": len(excluded),
        "labels": labels,
        "visible_labels": visible_labels,
        "all_current_records_excluded": bool(groups) and not visible,
    }


def role_snapshot(domain_id: str, roles: list[dict[str, Any]]) -> dict[str, Any]:
    rows = [r for r in roles if r.get("domain_id") == domain_id]
    active = [r for r in rows if active_role(r)]
    domain_status = Counter(r.get("domain_fit_review_status") or "not_recorded" for r in active)
    subgroup_status = Counter(r.get("subgroup_fit_status") or "not_recorded" for r in active)
    direct = [r for r in active if r.get("subgroup_fit_status") == "direct_domain_role"]
    return {
        "catalogue_rows": len(rows),
        "active_rows": len(active),
        "active_role_names": [r.get("role_name") for r in active],
        "domain_fit_status_counts": dict(domain_status),
        "subgroup_fit_status_counts": dict(subgroup_status),
        "direct_domain_role_count": len(direct),
        "domain_fit_source_backed_rows": sum(bool(r.get("domain_fit_review_source_refs")) for r in active),
        "domain_fit_unrecorded_rows": sum(not r.get("domain_fit_review_status") for r in active),
    }


def computational_snapshot(domain_id: str, computational: dict[str, Any]) -> dict[str, Any]:
    rows = computational.get("domains", []) if isinstance(computational, dict) else []
    row = next((x for x in rows if x.get("domain_id") == domain_id), None)
    if row is None:
        return {"status": "not_in_method_signal_queue", "role_task_match_count": 0,
                "promotion_rule": "Absence of a lexical/method signal does not prove computation is absent."}
    return {
        "status": "method_signal_requires_contextual_review",
        "classification": row.get("classification"),
        "case_disposition": row.get("case_disposition"),
        "role_task_match_count": row.get("role_task_record_match_count", 0),
        "role_fit_inferred": bool(row.get("role_fit_inferred", False)),
        "promotion_rule": "A computational signal cannot create a specialization or role link without domain and task evidence.",
    }


def decision_text(raw: dict[str, Any]) -> str:
    parts = [raw.get("review_status"), raw.get("decision"), raw.get("next_disposition"), raw.get("no_specialization_disposition")]
    if isinstance(raw.get("decision"), dict):
        parts.append(raw["decision"].get("disposition"))
    if isinstance(raw.get("recommendation"), dict):
        parts.append(raw["recommendation"].get("recommendation"))
    return " ".join(stringify(x) for x in parts if x).strip()


def residual_items(raw: dict[str, Any]) -> list[str]:
    values: list[Any] = []
    for key in ("remaining_review", "limitations", "omissions_and_over_splitting", "no_specialization_disposition", "next_disposition", "explicit_non_decisions"):
        value = raw.get(key)
        values.extend(value if isinstance(value, list) else [value] if value else [])
    if isinstance(raw.get("decision"), dict):
        values.extend(x for x in (raw["decision"].get("limitations"), raw["decision"].get("parent_scope_issue")) if x)
    return [stringify(x) for x in values if stringify(x).strip()]


def source_scope(row: dict[str, Any]) -> str:
    text = " ".join(stringify(row.get(k)) for k in ("publisher", "title", "url", "geographic_scope"))
    if re.search(r"international|global|world|ilo|iso|un\.org|ieee|who|unwto|wmo|icom|fig|nasa|oecd", text, re.I):
        return "global_or_international_or_comparative"
    return "scope_not_established_in_inherited_record"


def exact_recommendation(raw: dict[str, Any], groups: dict[str, Any], areas: list[dict[str, Any]]) -> dict[str, Any]:
    text = decision_text(raw)
    if not areas or NO_AREA_MARKERS.search(text):
        return {
            "action": "retain_or_make_direct_domain_to_role_route_until_parent_scope_is_resolved",
            "canonical_patch": "No subgroup creation. Keep supported direct domain→role routes; do not treat excluded ISCO groups as student areas.",
            "guard": "Do not add a child area from role counts, ISCO membership, or computational keywords.",
        }
    if OPEN_MARKERS.search(text) or groups["all_current_records_excluded"]:
        return {
            "action": "replace_or_reconcile_current_subgroup_records_before_activation",
            "canonical_patch": "Retain candidate labels and boundaries as a reviewable patch set; retire only explicitly excluded records during local integration, then add only approved candidate areas.",
            "guard": "Do not activate role→specialization links until parent scope and independent role→domain fit are signed off.",
        }
    return {
        "action": "candidate_specialization_structure_pending_canonical_adoption",
        "canonical_patch": "No automatic canonical write; preserve the candidate set with its source records and perform controlled subgroup replacement after local reconciliation.",
        "guard": "Candidate count is an internal synthesis, not a universal standard or academic sign-off.",
    }


def build_record(domain_id: str, artifact: tuple[Path, dict[str, Any]], meta: dict[str, Any], structure: dict[str, Any], roles: list[dict[str, Any]], computational: dict[str, Any]) -> dict[str, Any]:
    path, raw = artifact
    current = subgroup_snapshot(structure.get(domain_id, {}))
    role_info = role_snapshot(domain_id, roles)
    areas = candidate_areas(raw)
    evidence = collect_sources(raw)
    registry = raw.get("_batch_sources", {})
    if isinstance(registry, dict):
        for source_id, source in registry.items():
            evidence.extend(collect_sources(source, source_id))
    evidence = list({(x["url"], x.get("source_id")): x for x in evidence if x.get("url")}.values())
    name = meta.get(domain_id, {}).get("domain_name") or raw.get("domain_name") or domain_id
    return {
        "schema_version": "2026-10-06.remaining-lane-1-domain-reconciliation.v1",
        "domain_id": domain_id,
        "domain_name": name,
        "review_scope": "Global-first specialization/subgroup reconciliation; no Nigerian research; no role-to-specialization assignment.",
        "source_review_artifact": path.relative_to(ROOT).as_posix(),
        "source_review_status": raw.get("review_status"),
        "candidate_specializations": areas,
        "candidate_area_count": len(areas),
        "source_evidence": [{**x, "geographic_scope_disposition": source_scope(x)} for x in sorted(evidence, key=lambda x: (x.get("url", ""), x.get("source_id") or ""))],
        "source_evidence_counts": {
            "records": len(evidence),
            "unique_urls": len({x["url"] for x in evidence}),
            "global_or_international_or_comparative": sum(source_scope(x) == "global_or_international_or_comparative" for x in evidence),
            "nigerian_marked_in_inherited_material": sum(bool(NIGERIA_MARKERS.search(stringify(x))) for x in evidence),
        },
        "current_canonical_read_only": {**current, "active_role_count": role_info["active_rows"]},
        "independent_role_domain_audit_read_only": role_info,
        "computational_audit_read_only": computational_snapshot(domain_id, computational),
        "residual_items": residual_items(raw),
        "reconciliation": exact_recommendation(raw, current, areas),
        "role_to_specialization_assignments": 0,
        "canonical_files_changed": 0,
        "nigerian_context_started": False,
    }


def render(record: dict[str, Any]) -> str:
    current = record["current_canonical_read_only"]
    role = record["independent_role_domain_audit_read_only"]
    rec = record["reconciliation"]
    lines = [
        f"# {record['domain_id']} — {record['domain_name']}",
        "",
        "Global-first lane-1 reconciliation against the current catalogue. This is evidence and an exact patch recommendation, not an applied canonical change.",
        "",
        f"- Inherited source-review artifact: {record['source_review_artifact']}",
        f"- Candidate area count: {record['candidate_area_count']}",
        f"- Source records / unique URLs: {record['source_evidence_counts']['records']} / {record['source_evidence_counts']['unique_urls']}",
        f"- Current subgroups: {current['stored_count']} stored, {current['visible_count']} visible, {current['excluded_count']} excluded",
        f"- Current active roles: {current['active_role_count']}",
        f"- Role→domain fit evidence: {role['domain_fit_status_counts']}",
        f"- Computational audit status: {record['computational_audit_read_only']['status']}",
        "",
        "## Candidate areas",
        "",
    ]
    if record["candidate_specializations"]:
        lines.extend(f"- **{a['label']}** — {a['scope']}" for a in record["candidate_specializations"])
    else:
        lines.append("- No globally stable candidate set was inherited; retain the parent/route disposition below.")
    lines += ["", "## Exact reconciliation recommendation", "", f"- Action: {rec['action']}", f"- Canonical patch recommendation: {rec['canonical_patch']}", f"- Guard: {rec['guard']}", "", "## Current structure (read-only)", "", f"- Stored subgroup labels: {', '.join(current['labels']) or '(none)'}", f"- Visible subgroup labels: {', '.join(current['visible_labels']) or '(none)'}", "", "## Evidence", ""]
    lines.extend(f"- {s.get('source_id') or 'unidentified'} — {s.get('publisher') or 'publisher not captured'} — {s.get('title') or 'title not captured'} — {s['url']} — locator: {s.get('locator') or 'not captured'} — scope screen: {s['geographic_scope_disposition']}" for s in record["source_evidence"])
    lines += ["", "## Residuals and limits", ""]
    lines.extend(f"- {x}" for x in record["residual_items"]) or lines.append("- The candidate set remains noncanonical and requires local reconciliation.")
    lines += ["", "No role-to-specialization links were assigned. Nigerian context was not researched or added. ISCO/subgroup membership was not used as fit proof.", ""]
    return "\n".join(lines)


def write_checkpoint(records: list[dict[str, Any]], number: int, remaining: list[str]) -> None:
    payload = {
        "schema_version": "2026-10-06.remaining-lane-1-checkpoint.v1",
        "lane": "REMAINING_LANE_1_2026_10_06",
        "checkpoint": number,
        "completed_ids": [r["domain_id"] for r in records],
        "remaining_ids": remaining,
        "counts": {
            "completed": len(records),
            "candidate_area_labels": sum(r["candidate_area_count"] for r in records),
            "source_records": sum(r["source_evidence_counts"]["records"] for r in records),
            "unique_source_urls": len({x["url"] for r in records for x in r["source_evidence"]}),
            "canonical_files_changed": 0,
            "role_to_specialization_assignments": 0,
            "nigerian_context_reviews": 0,
        },
    }
    (OUT / f"REMAINING_LANE_1_CHECKPOINT_{number:03d}_2026_10_06.json").write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    lines = [
        f"# Remaining lane 1 checkpoint {number:03d}",
        "",
        "Global-first specialization/subgroup reconciliation. No canonical writes, role-to-specialization assignments, or Nigerian-context research.",
        "",
        f"- Completed: {len(records)}/{len(ASSIGNED_IDS)}",
        f"- Remaining: {len(remaining)} ({', '.join(remaining) or 'none'})",
        f"- Candidate area labels: {payload['counts']['candidate_area_labels']}",
        f"- Source records / unique URLs: {payload['counts']['source_records']} / {payload['counts']['unique_source_urls']}",
        "- Canonical files changed: 0",
        "- Role-to-specialization assignments: 0",
        "- Nigerian-context reviews: 0",
        "",
        "Each completed ID has a per-domain JSON and Markdown record in this directory.",
        "",
    ]
    (OUT / f"REMAINING_LANE_1_CHECKPOINT_{number:03d}_2026_10_06.md").write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    meta, structure, roles = load(DOMAIN_META), load(DOMAIN_STRUCTURE), load(ROLE_LIBRARY)
    computational = load(COMPUTATIONAL) if COMPUTATIONAL.exists() else {}
    files = select_review_files()
    missing = [x for x in ASSIGNED_IDS if x not in files]
    if missing:
        raise RuntimeError("Missing inherited source-review artifacts: " + ", ".join(missing))
    records: list[dict[str, Any]] = []
    for index, domain_id in enumerate(ASSIGNED_IDS, start=1):
        record = build_record(domain_id, files[domain_id], meta, structure, roles, computational)
        records.append(record)
        (OUT / f"{domain_id}_lane_1_reconciliation_2026_10_06.json").write_text(json.dumps(record, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        (OUT / f"{domain_id}_lane_1_reconciliation_2026_10_06.md").write_text(render(record), encoding="utf-8")
        if index % 8 == 0 or index == len(ASSIGNED_IDS):
            write_checkpoint(records, (index + 7) // 8, ASSIGNED_IDS[index:])
    action_counts = Counter(r["reconciliation"]["action"] for r in records)
    status_counts = Counter(r.get("source_review_status") or "not_recorded" for r in records)
    payload = {
        "schema_version": "2026-10-06.remaining-lane-1-specialization-reconciliation.v1",
        "lane": "REMAINING_LANE_1_2026_10_06",
        "assigned_domain_ids": ASSIGNED_IDS,
        "completed_ids": ASSIGNED_IDS,
        "remaining_ids": [],
        "method": [
            "Read current domain_meta, domain_structure, role_library_v3_cleaned and computational method-signal disposition.",
            "Selected the richest existing global-only evidence artifact without redoing prior source research.",
            "Compared candidate boundaries with current subgroup records and active roles.",
            "Audited role→domain evidence independently; ISCO and subgroup membership were not treated as proof.",
            "Recorded exact patch recommendations only; no canonical files were edited.",
        ],
        "counts": {
            "assigned_domains": len(records),
            "source_review_artifacts_reconciled": len(records),
            "candidate_area_labels": sum(r["candidate_area_count"] for r in records),
            "source_records": sum(r["source_evidence_counts"]["records"] for r in records),
            "unique_source_urls": len({x["url"] for r in records for x in r["source_evidence"]}),
            "domains_with_zero_candidate_areas": sum(r["candidate_area_count"] == 0 for r in records),
            "domains_with_zero_visible_subgroups": sum(r["current_canonical_read_only"]["visible_count"] == 0 for r in records),
            "domains_with_zero_active_roles": sum(r["current_canonical_read_only"]["active_role_count"] == 0 for r in records),
            "canonical_files_changed": 0,
            "role_to_specialization_assignments": 0,
            "nigerian_context_reviews": 0,
        },
        "action_counts": dict(action_counts),
        "inherited_review_status_counts": dict(status_counts),
        "global_evidence_limits": [
            "Professional bodies, standards and comparative curricula establish recognizable boundaries; they do not prescribe a universal subgroup count.",
            "Candidate labels remain noncanonical until parent scope and role-domain reconciliation are accepted locally.",
            "Nigerian context was intentionally deferred and must be a separately labelled phase.",
        ],
        "records": records,
    }
    (OUT / "remaining_lane_1_specialization_reconciliation_2026_10_06.json").write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    lines = [
        "# Remaining lane 1 — global specialization/subgroup reconciliation",
        "",
        "This lane covers all 32 assigned IDs. It consolidates existing global evidence and rechecks it against the current catalogue; it does not silently claim candidate areas are canonical.",
        "",
        "## Counts",
        "",
        f"- Assigned/completed: {len(records)}/{len(ASSIGNED_IDS)}",
        f"- Candidate area labels: {payload['counts']['candidate_area_labels']}",
        f"- Source records / unique URLs: {payload['counts']['source_records']} / {payload['counts']['unique_source_urls']}",
        f"- Domains with zero candidate areas / direct-route disposition: {payload['counts']['domains_with_zero_candidate_areas']}",
        f"- Domains with zero visible subgroups: {payload['counts']['domains_with_zero_visible_subgroups']}",
        f"- Domains with zero active roles: {payload['counts']['domains_with_zero_active_roles']}",
        "- Canonical files changed: 0",
        "- Role-to-specialization assignments: 0",
        "- Nigerian-context reviews: 0",
        "",
        "## Per-domain disposition",
        "",
        "| ID | Domain | Candidate areas | Visible subgroups | Active roles | Action |",
        "|---|---|---:|---:|---:|---|",
    ]
    for record in records:
        current = record["current_canonical_read_only"]
        lines.append(f"| {record['domain_id']} | {record['domain_name']} | {record['candidate_area_count']} | {current['visible_count']} | {current['active_role_count']} | {record['reconciliation']['action']} |")
    lines += [
        "",
        "## Implementation boundary",
        "",
        "The exact patch recommendation for each domain is in its per-domain JSON/Markdown artifact. Because candidate counts are internal syntheses and several parent boundaries remain open, this lane does not apply canonical subgroup replacements or role links. That is an audit-safe fix boundary, not a claim that the taxonomy is finished.",
        "",
        "## Reproduction",
        "",
        "python data/career-mapping/_audit/specialization_lanes_2026_10_05/REMAINING_LANE_1_2026_10_06/build_remaining_lane_1_reconciliation_2026_10_06.py",
        "",
    ]
    (OUT / "REMAINING_LANE_1_CHECKPOINT_2026_10_06.md").write_text("\n".join(lines), encoding="utf-8")


if __name__ == "__main__":
    main()

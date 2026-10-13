"""Reconcile the completed role-enrichment evidence lanes.

This is an append-only audit tool.  It deliberately does not edit canonical
role, overlay, domain, subgroup, or taxonomy files.

The role-enrichment lanes establish candidate role identity and parent-domain
fit.  They do not, by themselves, establish fit to an area of specialization
(subgroup/area of practice).  The area-fit gate is therefore explicit here:
an ``add`` candidate without an area label and independent area rationale is
blocked to review-only; no candidate is promoted merely because it appears in
an ISCO/ESCO family or has parent-domain evidence.
"""

from __future__ import annotations

import hashlib
import json
import re
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path
from typing import Any, Iterable


RUN_DATE = "2026-10-07"
ROOT = Path(__file__).resolve().parents[3]
AUDIT_ROOT = ROOT / "data" / "career-mapping" / "_audit"
LANE_ROOT = AUDIT_ROOT / "role_enrichment_lanes_2026_10_06"

CHECKPOINT_FILES = [
    LANE_ROOT / "D057_D112" / "D057_D112_role_enrichment_checkpoint_2026_10_06.json",
    LANE_ROOT / "D057_D112" / "D057_D112_role_enrichment_checkpoint_2026_10_06_batch2.json",
    LANE_ROOT / "D057_D112" / "D057_D112_role_enrichment_checkpoint_2026_10_06_batch3.json",
    LANE_ROOT / "D113_D168" / "D113_D168_role_enrichment_checkpoint_2026_10_06.json",
    LANE_ROOT / "D113_D168" / "D113_D168_role_enrichment_checkpoint_2026_10_06_b.json",
]

HANDOFF_FILES = [
    LANE_ROOT / "D057_D112" / "D057_D112_role_enrichment_handoff_2026_10_07.md",
    LANE_ROOT / "D113_D168" / "D113_D168_role_enrichment_handoff_2026_10_07.md",
    LANE_ROOT / "D113_D168" / "D113_D168_role_enrichment_handoff_2026_10_07.json",
]

REPORT_JSON = AUDIT_ROOT / "role_enrichment_reconciliation_2026_10_07.json"
REPORT_MD = AUDIT_ROOT / "ROLE_ENRICHMENT_RECONCILIATION_2026_10_07.md"
CHECKPOINT_JSON = AUDIT_ROOT / "ROLE_ENRICHMENT_RECONCILIATION_CHECKPOINT_2026_10_07.json"
CHECKPOINT_MD = AUDIT_ROOT / "ROLE_ENRICHMENT_RECONCILIATION_CHECKPOINT_2026_10_07.md"

# One checkpoint referenced the official ESCO occupation catalogue by ID but
# omitted its catalog entry.  This is a source-reference completion only; it
# does not upgrade any candidate or establish area fit.
SOURCE_OVERRIDES: dict[str, dict[str, Any]] = {
    "ESCO_OCCUPATIONS": {
        "source_id": "ESCO_OCCUPATIONS",
        "publisher": "European Commission, European Skills, Competences, Qualifications and Occupations (ESCO)",
        "title": "ESCO Occupations classification",
        "url": "https://esco.ec.europa.eu/en/classification/occupation-main",
        "locator": "Occupations pillar: occupation concepts, preferred/non-preferred terms, occupational profiles and ISCO-08 mappings; current ESCO version is shown on the official page.",
        "scope": "global occupational classification reference",
        "source_limit": "Classification and occupational-profile evidence; it does not prove Nigerian vacancies, demand, licensing or parent-domain/area fit by itself.",
        "access_date": RUN_DATE,
        "reference_completion": "checkpoint source ID resolved from official ESCO page",
    }
}

AREA_FIELDS = (
    "area_of_specialization",
    "area_of_specialization_label",
    "specialization",
    "specialization_label",
    "subgroup",
    "subgroup_name",
    "area_of_practice",
    "area_of_practice_label",
    "area_fit",
    "specialization_fit",
    "parent_area",
)


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def clean(value: Any) -> str:
    if value is None:
        return ""
    return str(value).strip()


def as_list(value: Any) -> list[Any]:
    if value is None:
        return []
    return list(value) if isinstance(value, list) else [value]


def slug(value: str) -> str:
    value = re.sub(r"[^a-z0-9]+", " ", value.casefold())
    return re.sub(r"\s+", " ", value).strip()


def candidate_key(record: dict[str, Any]) -> str:
    domain = clean(record.get("domain_id")).upper()
    raw = clean(record.get("candidate_key") or record.get("candidate_id"))
    if "|" in raw:
        raw_domain, raw_title = raw.split("|", 1)
        domain = clean(raw_domain).upper() or domain
        title_key = raw_title
    else:
        title_key = raw
        if domain and raw.casefold().startswith(domain.casefold() + "-"):
            title_key = raw[len(domain) + 1 :]
    title_key = slug(title_key or record.get("title_or_family") or record.get("title"))
    return f"{domain}|{title_key}"


def title(record: dict[str, Any]) -> str:
    return clean(record.get("title_or_family") or record.get("title"))


def extract_records(payload: dict[str, Any]) -> list[dict[str, Any]]:
    if isinstance(payload.get("entries"), list):
        return [x for x in payload["entries"] if isinstance(x, dict)]
    if isinstance(payload.get("candidate_records"), list):
        return [x for x in payload["candidate_records"] if isinstance(x, dict)]
    return []


def register_source(registry: dict[str, dict[str, Any]], source_id: str, value: Any, origin: str) -> None:
    source_id = clean(source_id)
    if not source_id:
        return
    if isinstance(value, dict):
        item = {"source_id": source_id, **value}
    else:
        item = {"source_id": source_id}
    item.setdefault("source_id", source_id)
    item.setdefault("origin_files", [])
    if origin not in item["origin_files"]:
        item["origin_files"].append(origin)
    previous = registry.get(source_id)
    if previous:
        origins = list(dict.fromkeys(as_list(previous.get("origin_files")) + as_list(item.get("origin_files"))))
        merged = {**previous, **{k: v for k, v in item.items() if v not in (None, "", [], {})}}
        merged["origin_files"] = origins
        registry[source_id] = merged
    else:
        registry[source_id] = item


def collect_catalog(payload: dict[str, Any], origin: str, registry: dict[str, dict[str, Any]]) -> None:
    catalog = payload.get("source_catalog")
    if isinstance(catalog, dict):
        for source_id, value in catalog.items():
            register_source(registry, source_id, value, origin)
    elif isinstance(catalog, list):
        for value in catalog:
            if isinstance(value, dict):
                register_source(registry, value.get("source_id"), value, origin)

    records = payload.get("source_records")
    if isinstance(records, dict):
        for source_id, value in records.items():
            if source_id in {"candidate_register_sources", "refreshed_web_sources"}:
                continue
            if isinstance(value, dict):
                register_source(registry, source_id, value, origin)
        for value in as_list(records.get("refreshed_web_sources")):
            if isinstance(value, dict):
                register_source(registry, value.get("source_id"), value, origin)


def candidate_source_ids(record: dict[str, Any]) -> tuple[list[str], list[str], list[dict[str, Any]]]:
    global_ids: list[str] = []
    nigeria_ids: list[str] = []
    inline_global: list[dict[str, Any]] = []

    for field in ("global_source_ids", "global_sources", "global_source_refs"):
        for value in as_list(record.get(field)):
            if isinstance(value, dict):
                source_id = clean(value.get("source_id"))
                if source_id:
                    global_ids.append(source_id)
                    inline_global.append(value)
            elif clean(value):
                global_ids.append(clean(value))

    context = record.get("nigerian_context")
    if isinstance(context, dict):
        for value in as_list(context.get("source_refs")):
            if clean(value):
                nigeria_ids.append(clean(value))

    evidence = record.get("nigerian_evidence")
    if isinstance(evidence, dict):
        for field in ("direct_market", "context"):
            for value in as_list(evidence.get(field)):
                if clean(value):
                    nigeria_ids.append(clean(value))

    for field in ("nigerian_context_source_ids", "nigerian_sources"):
        for value in as_list(record.get(field)):
            if clean(value):
                nigeria_ids.append(clean(value))

    def unique(values: Iterable[str]) -> list[str]:
        return list(dict.fromkeys(values))

    return unique(global_ids), unique(nigeria_ids), inline_global


def nonempty_area_fields(record: dict[str, Any]) -> dict[str, str]:
    result: dict[str, str] = {}
    for field in AREA_FIELDS:
        value = record.get(field)
        if isinstance(value, (dict, list)):
            if value:
                result[field] = json.dumps(value, ensure_ascii=False, sort_keys=True)
        elif clean(value):
            result[field] = clean(value)
    return result


def meaningful_fingerprint(record: dict[str, Any]) -> tuple[Any, ...]:
    global_ids, nigeria_ids, _ = candidate_source_ids(record)
    return (
        clean(record.get("domain_id")).upper(),
        title(record),
        clean(record.get("candidate_tasks")),
        clean(record.get("task_scope")),
        clean(record.get("parent_domain_fit") or record.get("domain_fit")),
        clean(record.get("disposition")),
        tuple(sorted(global_ids)),
        tuple(sorted(nigeria_ids)),
        tuple(sorted(nonempty_area_fields(record).items())),
    )


def source_projection(source: dict[str, Any], source_id: str) -> dict[str, Any]:
    allowed = ("source_id", "publisher", "title", "url", "urls", "locator", "scope", "limit", "source_limit", "access_date", "origin_files")
    result = {"source_id": source_id}
    for key in allowed:
        if key in source and source[key] not in (None, "", [], {}):
            result[key] = source[key]
    return result


def resolve_sources(ids: list[str], inline: list[dict[str, Any]], registry: dict[str, dict[str, Any]]) -> tuple[list[dict[str, Any]], list[str]]:
    resolved: dict[str, dict[str, Any]] = {}
    for value in inline:
        sid = clean(value.get("source_id"))
        if sid:
            resolved[sid] = source_projection(value, sid)
    missing: list[str] = []
    for sid in ids:
        if sid in registry:
            resolved[sid] = source_projection(registry[sid], sid)
        elif sid not in resolved:
            missing.append(sid)
            resolved[sid] = {"source_id": sid, "metadata_status": "not_present_in_checkpoint_catalog"}
    return list(resolved.values()), list(dict.fromkeys(missing))


def rel(path: Path) -> str:
    return str(path.relative_to(ROOT)).replace("\\", "/")


def load() -> tuple[list[dict[str, Any]], dict[str, dict[str, Any]], list[dict[str, Any]]]:
    registry: dict[str, dict[str, Any]] = {}
    for source_id, source in SOURCE_OVERRIDES.items():
        register_source(registry, source_id, source, "external_source_reference_completion")
    records: list[dict[str, Any]] = []
    file_rows: list[dict[str, Any]] = []
    for order, path in enumerate(CHECKPOINT_FILES):
        payload = read_json(path)
        origin = rel(path)
        collect_catalog(payload, origin, registry)
        extracted = extract_records(payload)
        file_rows.append({"path": origin, "lane": payload.get("lane"), "record_count": len(extracted), "order": order})
        for index, record in enumerate(extracted):
            records.append({"record": record, "source_file": origin, "source_order": order, "source_index": index})
    return records, registry, file_rows


def reconcile() -> dict[str, Any]:
    raw_records, registry, file_rows = load()
    groups: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for item in raw_records:
        groups[candidate_key(item["record"])].append(item)

    candidates: list[dict[str, Any]] = []
    conflict_rows: list[dict[str, Any]] = []
    unresolved_sources: set[str] = set()

    for key in sorted(groups):
        items = sorted(groups[key], key=lambda x: (x["source_order"], x["source_index"]))
        selected = items[-1]
        record = selected["record"]
        global_ids: list[str] = []
        nigeria_ids: list[str] = []
        inline_global: list[dict[str, Any]] = []
        raw_dispositions: list[str] = []
        for item in items:
            g, n, inline = candidate_source_ids(item["record"])
            global_ids.extend(g)
            nigeria_ids.extend(n)
            inline_global.extend(inline)
            if clean(item["record"].get("disposition")):
                raw_dispositions.append(clean(item["record"].get("disposition")))
        global_ids = list(dict.fromkeys(global_ids))
        nigeria_ids = list(dict.fromkeys(nigeria_ids))
        global_refs, missing_global = resolve_sources(global_ids, inline_global, registry)
        nigeria_refs, missing_nigeria = resolve_sources(nigeria_ids, [], registry)
        unresolved_sources.update(missing_global)
        unresolved_sources.update(missing_nigeria)

        fingerprints = {meaningful_fingerprint(x["record"]) for x in items}
        dispositions = list(dict.fromkeys(raw_dispositions))
        if len(items) > 1 and (len(fingerprints) > 1 or len(dispositions) > 1):
            conflict_rows.append({
                "candidate_key": key,
                "record_count": len(items),
                "source_files": [x["source_file"] for x in items],
                "observed_dispositions": dispositions,
                "resolution": "latest_checkpoint_record_retained_for_reporting; area-fit gate still applies",
            })

        area_fields = nonempty_area_fields(record)
        original_disposition = clean(record.get("disposition")) or "missing_disposition"
        area_fit_status = "supported" if area_fields else "review_only_missing_area_assignment"
        if area_fields:
            effective = original_disposition
            gate_reason = "explicit area-of-specialization field present; independently verify area task evidence before promotion"
        elif original_disposition == "add":
            effective = "review_only"
            gate_reason = "parent-domain evidence exists, but no specific existing/proposed area label and independent area-fit rationale is recorded"
        elif original_disposition == "alias_existing":
            effective = "alias_pending_area_fit"
            gate_reason = "alias target may already exist, but the candidate still lacks a specific area-of-specialization assignment"
        else:
            effective = "review_only"
            gate_reason = "candidate remains review-only and has no specific area-of-specialization assignment"

        candidates.append({
            "candidate_key": key,
            "domain_id": clean(record.get("domain_id")).upper(),
            "title": title(record),
            "candidate_tasks": clean(record.get("candidate_tasks") or record.get("task_scope")),
            "parent_domain_fit": clean(record.get("parent_domain_fit") or record.get("domain_fit")),
            "title_status": clean(record.get("title_status")),
            "recommendation_status": clean(record.get("recommendation_status")),
            "original_disposition": original_disposition,
            "effective_disposition": effective,
            "area_fit_status": area_fit_status,
            "area_assignment": area_fields,
            "area_gate_reason": gate_reason,
            "global_evidence": global_refs,
            "nigerian_context": nigeria_refs,
            "nigerian_context_claim_limit": clean((record.get("nigerian_context") or {}).get("claim_limit")) if isinstance(record.get("nigerian_context"), dict) else clean((record.get("nigerian_evidence") or {}).get("scope")) if isinstance(record.get("nigerian_evidence"), dict) else "",
            "observed_dispositions": dispositions,
            "source_files": [x["source_file"] for x in items],
            "duplicate_record_count": len(items),
            "duplicate_resolution": "merged source references; latest checkpoint fields retained" if len(items) > 1 else "single record",
            "source_missing_ids": sorted(set(missing_global + missing_nigeria)),
            "canonical_files_edited": False,
        })

    raw_disp = Counter(clean(item["record"].get("disposition")) or "missing_disposition" for item in raw_records)
    unique_orig = Counter(item["original_disposition"] for item in candidates)
    effective = Counter(item["effective_disposition"] for item in candidates)
    lane_domains = sorted({item["domain_id"] for item in candidates})

    report = {
        "schema_version": "2026-10-07.role-enrichment-reconciliation.v1",
        "run_date": RUN_DATE,
        "status": "complete_evidence_reconciliation_area_fit_gate_open",
        "scope": "D057-D112 and D113-D168 completed role-enrichment checkpoints only",
        "canonical_files_edited": False,
        "non_negotiable_area_fit_gate": {
            "rule": "Every candidate must have a specific existing or explicitly proposed area of specialization within its parent domain, plus independent role-task evidence for that area and separate parent-domain evidence.",
            "isco_or_esco_membership_is_sufficient": False,
            "missing_area_assignment_effect": "add candidates are review_only; aliases remain pending area fit; no canonical addition is accepted",
        },
        "inputs": {
            "checkpoint_files": [rel(x) for x in CHECKPOINT_FILES],
            "handoff_files_read": [rel(x) for x in HANDOFF_FILES],
            "file_rows": file_rows,
        },
        "coverage": {"candidate_domains": len(lane_domains), "domain_ids": lane_domains},
        "counts": {
            "raw_candidate_records": len(raw_records),
            "unique_candidate_keys": len(candidates),
            "duplicate_groups": sum(1 for values in groups.values() if len(values) > 1),
            "raw_dispositions": dict(sorted(raw_disp.items())),
            "unique_original_dispositions": dict(sorted(unique_orig.items())),
            "effective_dispositions_after_area_gate": dict(sorted(effective.items())),
            "accepted_candidate_additions": 0,
            "alias_candidates_pending_area_fit": effective.get("alias_pending_area_fit", 0),
            "review_only_candidates": effective.get("review_only", 0),
            "conflict_groups": len(conflict_rows),
            "unresolved_source_ids": len(unresolved_sources),
        },
        "accepted_candidate_additions": [],
        "aliases": [x for x in candidates if x["original_disposition"] == "alias_existing"],
        "review_only_candidates": [x for x in candidates if x["effective_disposition"] == "review_only"],
        "area_fit_blocked_additions": [x for x in candidates if x["original_disposition"] == "add" and x["effective_disposition"] == "review_only"],
        "conflicts": conflict_rows,
        "unresolved_source_ids": sorted(unresolved_sources),
        "all_candidates": candidates,
        "source_registry": {key: registry[key] for key in sorted(registry)},
        "follow_up_gates": [
            "Assign every candidate to a specific existing or explicitly proposed area of specialization; do not infer it from ISCO/ESCO membership.",
            "Attach independent area task evidence and preserve separate parent-domain and area-fit decisions.",
            "Only after those gates pass may accepted additions or aliases be considered for canonical integration.",
            "Run the sparse-domain minimum-role review separately; this evidence reconciliation does not manufacture roles merely to reach ten.",
        ],
    }
    return report


def markdown(report: dict[str, Any]) -> str:
    counts = report["counts"]
    lines = [
        "# Role-enrichment checkpoint reconciliation — 2026-10-07",
        "",
        "Status: **complete evidence reconciliation; area-of-specialization gate remains open**.",
        "",
        "This report reconciles the D057–D112 and D113–D168 append-only evidence lanes. It does not edit canonical role, overlay, domain, subgroup, or taxonomy files.",
        "",
        "## Result",
        "",
        f"- Raw candidate records: **{counts['raw_candidate_records']}**",
        f"- Unique candidate keys after deduplication: **{counts['unique_candidate_keys']}**",
        f"- Duplicate groups: **{counts['duplicate_groups']}**",
        f"- Conflict groups: **{counts['conflict_groups']}**",
        f"- Accepted additions: **{counts['accepted_candidate_additions']}**",
        f"- Alias candidates pending area fit: **{counts['alias_candidates_pending_area_fit']}**",
        f"- Review-only candidates: **{counts['review_only_candidates']}**",
        f"- Source IDs without checkpoint metadata: **{counts['unresolved_source_ids']}**",
        "",
        "The zero accepted-addition count is intentional. The records establish parent-domain fit, but no candidate record contains a specific existing/proposed area-of-specialization label and independent area-fit rationale. Under the requested gate, `add` candidates are therefore review-only rather than promoted.",
        "",
        "## Disposition counts",
        "",
        "| Stage | Counts |",
        "|---|---:|",
        f"| Raw dispositions | `{json.dumps(counts['raw_dispositions'], ensure_ascii=False)}` |",
        f"| Unique original dispositions | `{json.dumps(counts['unique_original_dispositions'], ensure_ascii=False)}` |",
        f"| Effective dispositions after area gate | `{json.dumps(counts['effective_dispositions_after_area_gate'], ensure_ascii=False)}` |",
        "",
        "## Evidence policy",
        "",
        "- Global occupational/task evidence and Nigerian context are stored separately.",
        "- Nigerian regulatory, institutional, training or ecosystem evidence is not treated as vacancy or demand evidence.",
        "- ISCO/ESCO subgroup membership is not treated as proof of parent-domain fit or area-of-specialization fit.",
        "- Candidate source IDs, URLs, locators, scope and limitations are preserved in the JSON report for exact audit.",
        "",
        "## Reconciliation categories",
        "",
        "- `accepted_candidate_additions`: empty until each candidate has area assignment plus independent area-fit evidence.",
        "- `aliases`: candidates whose lane disposition is `alias_existing`; they remain pending area-fit assignment and are not canonical edits.",
        "- `review_only_candidates`: original review-only candidates plus all proposed additions blocked by the area gate.",
        "- `conflicts`: duplicate keys whose records differ in meaningful fields or disposition; the latest checkpoint fields are retained for reporting, while source references are unioned.",
        "",
        "## Sparse/no-role requirement",
        "",
        "The lane evidence identifies sparse and zero-role domains, but this reconciliation does not add roles merely to reach a numeric floor. The separate enrichment pass must assign each candidate to an area of specialization and independently establish domain and area fit before any candidate can count toward a ten-role target.",
        "",
        "## Files",
        "",
        f"- Full machine-readable report: `{rel(REPORT_JSON)}`",
        f"- Resumption checkpoint: `{rel(CHECKPOINT_JSON)}`",
        f"- This summary: `{rel(REPORT_MD)}`",
        "",
        "## Candidate ledger",
        "",
    ]
    for item in report["all_candidates"]:
        lines.extend([
            f"### {item['candidate_key']} — {item['title']}",
            "",
            f"- Original disposition: `{item['original_disposition']}`; effective disposition: `{item['effective_disposition']}`",
            f"- Area-fit status: `{item['area_fit_status']}`; assignment: `{json.dumps(item['area_assignment'], ensure_ascii=False) if item['area_assignment'] else 'none recorded'}`",
            f"- Parent-domain fit: {item['parent_domain_fit'] or 'not recorded'}",
            f"- Area gate: {item['area_gate_reason']}",
            f"- Task scope: {item['candidate_tasks'] or 'not recorded'}",
            f"- Global sources: {', '.join(x.get('source_id', '') for x in item['global_evidence']) or 'none recorded'}",
            f"- Nigerian context sources: {', '.join(x.get('source_id', '') for x in item['nigerian_context']) or 'none recorded'}",
            f"- Source files: {', '.join(item['source_files'])}",
            "",
        ])
    return "\n".join(lines) + "\n"


def checkpoint(report: dict[str, Any]) -> dict[str, Any]:
    return {
        "schema_version": "2026-10-07.role-enrichment-reconciliation-checkpoint.v1",
        "run_date": RUN_DATE,
        "status": report["status"],
        "completed_steps": [
            "Read all five machine-readable checkpoint files for D057-D112 and D113-D168.",
            "Merged candidate_records/entries and deduplicated by normalized domain/title key.",
            "Unioned source references and preserved global versus Nigerian scope.",
            "Detected duplicate/conflicting keys and retained latest checkpoint fields without deleting evidence.",
            "Applied the non-negotiable area-of-specialization gate without editing canonical files.",
        ],
        "next_steps": [
            "Assign each candidate to an existing or explicitly proposed area of specialization.",
            "Add independent area-fit task evidence and reconcile conflicts.",
            "Only then review candidate additions/aliases for canonical integration.",
            "Run a separate evidence-backed sparse-domain enrichment pass; do not create roles solely to satisfy ten-role minimum.",
        ],
        "counts": report["counts"],
        "report_json": rel(REPORT_JSON),
        "report_markdown": rel(REPORT_MD),
        "canonical_files_edited": False,
        "digest": hashlib.sha256(json.dumps(report, ensure_ascii=False, sort_keys=True).encode("utf-8")).hexdigest(),
    }


def main() -> None:
    report = reconcile()
    REPORT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    REPORT_MD.write_text(markdown(report), encoding="utf-8")
    state = checkpoint(report)
    CHECKPOINT_JSON.write_text(json.dumps(state, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    CHECKPOINT_MD.write_text(
        "# Role-enrichment reconciliation checkpoint — 2026-10-07\n\n"
        f"Status: **{state['status']}**\n\n"
        "The completed reconciliation is resumable from the full report. Canonical files were not edited.\n\n"
        "## Completed\n\n"
        + "\n".join(f"- {x}" for x in state["completed_steps"])
        + "\n\n## Next\n\n"
        + "\n".join(f"- {x}" for x in state["next_steps"])
        + "\n\n"
        + f"Counts: `{json.dumps(state['counts'], ensure_ascii=False)}`\n\n"
        + f"Report: `{state['report_json']}`\n\nDigest: `{state['digest']}`\n",
        encoding="utf-8",
    )
    print(json.dumps({"report": rel(REPORT_JSON), "checkpoint": rel(CHECKPOINT_JSON), "counts": report["counts"]}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

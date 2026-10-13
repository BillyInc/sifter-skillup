"""Exact-key D121 role-to-parent-domain audit report generator."""

from __future__ import annotations

import json
from collections import Counter
from datetime import date
from pathlib import Path

LANE = Path(__file__).resolve().parent
QUEUE = LANE / "D085_D168_role_fit_queue_2026_10_05.json"
OUT_JSON = LANE / "D121_role_domain_fit_review_2026_10_05.json"
OUT_MD = LANE / "D121_role_domain_fit_review_2026_10_05.md"

SOURCES = {
    "QUEUE_TASK_PROFILE": {"publisher": "Checked-in role/domain lane queue", "url": "D085_D168_role_fit_queue_2026_10_05.json", "locator": "Exact D121 role_key and task description for each decision.", "supports": "Recorded forest management, harvesting, conservation, grading and adjacent work.", "limit": "Local role text is not an independent occupational authority."},
    "ESCO_OCCUPATION_PROFILES": {"publisher": "European Commission, ESCO", "url": "https://esco.ec.europa.eu/en/classification/occupation-main", "locator": "Exact ESCO occupation identifiers retained where available.", "supports": "Standardized occupational concepts and task profiles.", "limit": "Classification membership is not used as proof of domain fit."},
    "ILO_ISCO08_FORESTRY": {"publisher": "International Labour Organization", "url": "https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf", "locator": "ISCO-08 forestry and related occupation definitions, including forest workers, conservation and forest-product grading/processing tasks.", "supports": "International occupational context for forest management, timber work and conservation.", "limit": "The exact task description is compared with D121's forest/wildlife scope; occupational codes are not fit rules."},
}

DECISIONS = {
    "agriculture, forestry and fishery vocational teacher": ("conditional", "Teaches across agriculture, forestry and fishery specialisms. Forestry education is related, but the task spans multiple fields and is teaching rather than forest/wildlife practice."),
    "amusement park cleaner": ("unsupported_for_domain", "Cleans and performs minor repairs at amusement parks; this is facilities/visitor-attraction work, not forest or wildlife management."),
    "conservation scientist": ("supported", "Manages forests, parks and natural resources to protect habitat, biodiversity and resource quality; direct conservation."),
    "engineered wood board grader": ("supported", "Inspects engineered wood boards for manufacturing defects; direct grading of forest-derived products within the parent scope."),
    "forest ranger": ("supported", "Protects and conserves forest and woodland resources; direct forest management."),
    "forest worker": ("supported", "Plants, trims, thins and manages trees/woodlands and forests; direct forestry practice."),
    "forestry adviser": ("supported", "Advises on timber/forestry economic and environmental management and compliance; direct forestry expertise."),
    "forestry equipment operator": ("supported", "Uses specialized equipment to maintain forests and harvest/extract/forward wood; direct forest operations."),
    "forestry inspector": ("supported", "Checks forestry operations, worker activity and compliance with forest laws/standards; direct forestry oversight."),
    "forestry machinery technician": ("supported", "Maintains and transports machinery used in forestry work; direct technical support to forest operations."),
    "forestry technician": ("supported", "Supports forest managers, supervises forestry equipment teams and implements forest-management decisions; direct forestry."),
    "lumber grader": ("supported", "Inspects and grades sawn lumber for quality and defects; direct timber/forest-product assessment."),
    "nature conservation officer": ("supported", "Manages and improves local natural environments and conservation awareness; direct habitat/resource conservation."),
    "park guide": ("conditional", "Guides visitors and interprets natural/cultural heritage in parks, including possible wildlife parks. The profile does not establish a forest/wildlife conservation or management duty."),
    "pest management worker": ("conditional", "Controls pests using chemicals/traps, but the profile is not specific to forest pests or wildlife protection; domain context is unproven."),
    "pesticides sprayer": ("conditional", "Mixes and applies pesticide solutions with equipment; it could support forest pest control, but the task does not identify forestry or wildlife management as its context."),
    "pulp grader": ("supported", "Grades pulp by fibre and process characteristics; direct quality evaluation of a forest-derived material identified in the domain scope."),
    "theme park technician": ("unsupported_for_domain", "Maintains amusement-park attractions; this is entertainment-facility engineering, not nature conservation or forestry."),
    "veneer grader": ("supported", "Inspects and grades veneer slices for quality/defects; direct assessment of a forest-derived timber product."),
    "water conservation technician": ("unsupported_for_domain", "Installs water recovery, filtration, storage and distribution systems; water infrastructure is not forest/wildlife management absent a stated forest-conservation task."),
}


def main() -> None:
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    rows = [row for row in queue["unresolved_rows"] if row["domain_id"] == "D121"]
    actual = {row["role_name"] for row in rows}
    if len(rows) != len(actual) or actual != set(DECISIONS):
        raise SystemExit(f"D121 exact-key mismatch: missing={sorted(actual-set(DECISIONS))}; extra={sorted(set(DECISIONS)-actual)}")
    decisions = []
    for row in sorted(rows, key=lambda value: value["role_key"]):
        fit, rationale = DECISIONS[row["role_name"]]
        decisions.append({"role_key": row["role_key"], "role_name": row["role_name"], "task_evidence": row["role_description"], "esco_uri": (row.get("esco_occupation_uris") or [None])[0], "domain_fit": fit, "rationale": rationale, "source_refs": ["QUEUE_TASK_PROFILE", "ESCO_OCCUPATION_PROFILES", "ILO_ISCO08_FORESTRY"]})
    counts = Counter(item["domain_fit"] for item in decisions)
    payload = {"schema_version": "2026-10-05.role-domain-fit-lane.v1", "audit_date": date.today().isoformat(), "domain_id": "D121", "domain_name": rows[0]["domain_name"], "scope": rows[0]["domain_scope"], "method": "Compare exact tasks with timber/forest harvesting and management, forest-product grading, habitat/wildlife conservation and forest compliance. ISCO/ESCO group, subgroup, title similarity and frequency are not fit evidence. Conditional means the profile may serve forestry but does not state that context; unsupported denotes unrelated entertainment/facility work.", "counts": {"mappings_reviewed": len(decisions), "supported": counts["supported"], "conditional": counts["conditional"], "unsupported_for_domain": counts["unsupported_for_domain"], "unresolved": counts["unresolved"]}, "decisions": decisions, "sources": SOURCES, "notes": ["All D121 exact role keys and task descriptions were checked against the lane queue.", "Forest-derived products named in the parent scope (lumber, boards and pulp) are included when the role's task directly grades them; park/pest tasks are conditional unless forest/wildlife duties are explicit.", "No role-to-specialization assignment, student-visibility decision or canonical taxonomy/mapping change is made."]}
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = ["# D121 role-to-parent-domain fit review — 2026-10-05", "", f"Scope: {payload['scope']}", "", f"- Exact queued roles reviewed: **{len(decisions)}**", f"- Supported: **{payload['counts']['supported']}**", f"- Conditional: **{payload['counts']['conditional']}**", f"- Unsupported for this parent: **{payload['counts']['unsupported_for_domain']}**", f"- Unresolved: **{payload['counts']['unresolved']}**", "", "| Exact role key | Task description | Fit | Why |", "|---|---|---|---|"]
    for item in decisions:
        task = item["task_evidence"].replace("|", "\\|").replace("\n", " ")
        why = item["rationale"].replace("|", "\\|").replace("\n", " ")
        lines.append(f"| `{item['role_key']}` | {task} | {item['domain_fit']} | {why} |")
    lines += ["", "## Sources and limits", ""]
    for key, source in SOURCES.items():
        lines.append(f"- **{key} — {source['publisher']}:** [{source['url']}]({source['url']}). {source['locator']} Supports: {source['supports']} Limit: {source['limit']}")
    lines += ["", "## Audit notes", ""] + [f"- {note}" for note in payload["notes"]]
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()

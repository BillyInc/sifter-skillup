"""Exact-key D117 role-to-parent-domain audit report generator."""

from __future__ import annotations

import json
from collections import Counter
from datetime import date
from pathlib import Path

LANE = Path(__file__).resolve().parent
QUEUE = LANE / "D085_D168_role_fit_queue_2026_10_05.json"
OUT_JSON = LANE / "D117_role_domain_fit_review_2026_10_05.json"
OUT_MD = LANE / "D117_role_domain_fit_review_2026_10_05.md"

SOURCES = {
    "QUEUE_TASK_PROFILE": {"publisher": "Checked-in role/domain lane queue", "url": "D085_D168_role_fit_queue_2026_10_05.json", "locator": "Exact D117 role_key and task description for each railway role.", "supports": "Actual railway operating, infrastructure, rolling-stock and rail-freight tasks.", "limit": "Local task profiles are not an independent authority."},
    "ESCO_OCCUPATION_PROFILES": {"publisher": "European Commission, ESCO", "url": "https://esco.ec.europa.eu/en/classification/occupation-main", "locator": "Exact ESCO occupation identifiers retained in queued records.", "supports": "Standardized railway role concepts and task definitions.", "limit": "Classification membership is not used as fit proof."},
    "ILO_ISCO08_RAIL": {"publisher": "International Labour Organization", "url": "https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf", "locator": "ISCO-08 railway occupation definitions for locomotive drivers, rail traffic/brake/signal/switch workers and related train operations.", "supports": "International task context for rail movement, train control and yard activities.", "limit": "The domain also includes railway infrastructure and rolling stock; those are assessed by their recorded railway-specific tasks, not inferred from the occupational group."},
}

DECISIONS = {
    "Railroad Conductors and Yardmasters": ("supported", "Coordinates train crews and switch-engine work in railway yards and passenger/freight services; direct railway operations."),
    "level crossing signalperson": ("supported", "Operates crossing-safety equipment and monitors traffic at rail level crossings; direct railway safety operations."),
    "occupational railway instructor": ("supported", "Trains operators of railway vehicles such as trains, trams and metro systems; direct railway workforce training."),
    "rail construction supervisor": ("supported", "Supervises construction and maintenance of railway infrastructure; direct rail-system development and upkeep."),
    "rail intermodal equipment operator": ("supported", "Loads/unloads trailers and containers between railcars and chassis; direct rail freight/intermodal operations."),
    "rail switchperson": ("supported", "Operates railway switches/signals under traffic-control instructions to route trains safely; direct rail movement control."),
    "rolling stock assembler": ("supported", "Builds and installs prefabricated parts in rail vehicles and subassemblies; direct rolling-stock manufacture."),
    "rolling stock assembly inspector": ("supported", "Tests rolling-stock assemblies against engineering specifications and safety requirements; direct rail-vehicle production quality."),
    "rolling stock assembly supervisor": ("supported", "Coordinates staff and schedules production of rolling stock; direct rail-vehicle manufacturing operations."),
    "rolling stock electrician": ("supported", "Installs, maintains and repairs electrical/electronic systems in rail vehicles; direct rolling-stock service."),
    "rolling stock engine inspector": ("supported", "Inspects locomotive engines for standards/compliance and conducts routine/post-overhaul checks; direct railway equipment maintenance."),
    "rolling stock engine tester": ("supported", "Tests diesel/electric locomotive engine performance; direct railway rolling-stock maintenance and commissioning."),
    "rolling stock engineer": ("supported", "Designs and oversees manufacture, installation and development of locomotives, carriages and wagons; direct railway engineering."),
    "rolling stock engineering drafter": ("supported", "Produces technical drawings for rail-vehicle engineering and assembly; direct rolling-stock design support."),
    "rolling stock engineering technician": ("supported", "Supports rolling-stock design, development, manufacture, testing and installation; direct rail engineering operations."),
    "rolling stock inspector": ("supported", "Inspects wagons/carriages for technical condition and service readiness; direct railway fleet operations/maintenance."),
    "shunter": ("supported", "Moves locomotives/wagons and assembles trains by switching and marshalling rail vehicles; direct yard operations."),
    "train dispatcher": ("supported", "Dispatches train services safely and efficiently; direct rail traffic operations."),
    "train driver": ("supported", "Operates locomotives for passenger or freight service under safety/operating rules; core railway transport."),
    "train preparer": ("supported", "Checks and tests rail-vehicle equipment before a train enters service; direct railway readiness and safety operations."),
}


def main() -> None:
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    rows = [row for row in queue["unresolved_rows"] if row["domain_id"] == "D117"]
    actual = {row["role_name"] for row in rows}
    if len(rows) != len(actual) or actual != set(DECISIONS):
        raise SystemExit(f"D117 exact-key mismatch: missing={sorted(actual-set(DECISIONS))}; extra={sorted(set(DECISIONS)-actual)}")
    decisions = []
    for row in sorted(rows, key=lambda value: value["role_key"]):
        fit, rationale = DECISIONS[row["role_name"]]
        decisions.append({"role_key": row["role_key"], "role_name": row["role_name"], "task_evidence": row["role_description"], "esco_uri": (row.get("esco_occupation_uris") or [None])[0], "domain_fit": fit, "rationale": rationale, "source_refs": ["QUEUE_TASK_PROFILE", "ESCO_OCCUPATION_PROFILES", "ILO_ISCO08_RAIL"]})
    counts = Counter(item["domain_fit"] for item in decisions)
    payload = {"schema_version": "2026-10-05.role-domain-fit-lane.v1", "audit_date": date.today().isoformat(), "domain_id": "D117", "domain_name": rows[0]["domain_name"], "scope": rows[0]["domain_scope"], "method": "Compare exact tasks with railway transport operations, infrastructure, rail freight and rolling-stock design/manufacture/maintenance. ISCO/ESCO grouping, subgroup, title similarity and frequency are not fit evidence. Railway-specific tasks across operational and engineering lifecycle are supported because the root domain is the railway sector, not only train driving.", "counts": {"mappings_reviewed": len(decisions), "supported": counts["supported"], "conditional": counts["conditional"], "unsupported_for_domain": counts["unsupported_for_domain"], "unresolved": counts["unresolved"]}, "decisions": decisions, "sources": SOURCES, "notes": ["All 20 D117 exact role keys and task descriptions were reconciled against the queue.", "The parent scope includes train/yard operation, dispatch, infrastructure, freight and rolling stock; railway-specific engineering and production tasks therefore fit the railway root even when they are not train-driving jobs.", "No role-to-specialization assignment, student visibility decision or canonical taxonomy/mapping change is made."]}
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = ["# D117 role-to-parent-domain fit review — 2026-10-05", "", f"Scope: {payload['scope']}", "", f"- Exact queued roles reviewed: **{len(decisions)}**", f"- Supported: **{payload['counts']['supported']}**", f"- Conditional: **{payload['counts']['conditional']}**", f"- Unsupported for this parent: **{payload['counts']['unsupported_for_domain']}**", f"- Unresolved: **{payload['counts']['unresolved']}**", "", "| Exact role key | Task description | Fit | Why |", "|---|---|---|---|"]
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

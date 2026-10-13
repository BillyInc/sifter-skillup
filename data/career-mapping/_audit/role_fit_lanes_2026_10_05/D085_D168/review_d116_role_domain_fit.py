"""Exact-key D116 role-to-parent-domain audit report generator."""

from __future__ import annotations

import json
from collections import Counter
from datetime import date
from pathlib import Path

LANE = Path(__file__).resolve().parent
QUEUE = LANE / "D085_D168_role_fit_queue_2026_10_05.json"
OUT_JSON = LANE / "D116_role_domain_fit_review_2026_10_05.json"
OUT_MD = LANE / "D116_role_domain_fit_review_2026_10_05.md"

SOURCES = {
    "QUEUE_TASK_PROFILE": {"publisher": "Checked-in role/domain lane queue", "url": "D085_D168_role_fit_queue_2026_10_05.json", "locator": "Exact D116 role_key and recorded task description for each decision.", "supports": "Actual earthmoving, crane, construction-equipment, materials-handling or related tasks.", "limit": "The queue is not an independent occupational authority."},
    "ESCO_OCCUPATION_PROFILES": {"publisher": "European Commission, ESCO", "url": "https://esco.ec.europa.eu/en/classification/occupation-main", "locator": "Exact occupation identifiers retained where available.", "supports": "Standardized role/task concepts.", "limit": "ESCO placement is not used as fit proof."},
    "ILO_ISCO08_EARTHMOVING_CRANES": {"publisher": "International Labour Organization", "url": "https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf", "locator": "ISCO-08 Unit Groups 8342 (earthmoving and related plant operators) and 8343 (crane, hoist and related plant operators).", "supports": "International task context for earthmoving machines and lifting equipment.", "limit": "Classification context only; fit is decided from the exact role task versus D116's stated heavy-equipment/earthmoving scope."},
}

DECISIONS = {
    "Crane and Tower Operators": ("supported", "Operates boom/cable and tower equipment to lift and move materials and machinery; direct crane/heavy-equipment operation."),
    "Elevator and Escalator Installers and Repairers": ("unsupported_for_domain", "Installs/repairs passenger or freight elevators and escalators; this is vertical building-transport equipment work, not earthmoving or the construction/heavy cranes in D116."),
    "Industrial Truck and Tractor Operators": ("conditional", "Moves materials in warehouses, yards, factories and construction sites. It is heavy-equipment operation, but often warehouse/factory logistics rather than earthmoving or construction plant."),
    "Operating Engineers and Other Construction Equipment Operators": ("supported", "Operates graders, bulldozers, scrapers, pumps, shovels and related machines to excavate, move/grade earth and build structures; direct match."),
    "automated cable vehicle controller": ("unsupported_for_domain", "Controls cable-operated passenger transport systems such as aerial cabins and funiculars; this is transport-system operation, not earthmoving/heavy construction equipment."),
    "bulldozer operator": ("supported", "Operates a heavy vehicle to move earth, rubble and materials; core earthmoving."),
    "container crane operator": ("supported", "Operates port cranes to lift and move shipping containers; direct crane/heavy lifting equipment work."),
    "dredge operator": ("supported", "Operates industrial equipment to excavate underwater material and move it to another location; direct earthmoving/dredging."),
    "excavator operator": ("supported", "Uses excavators to dig and move earth/material for construction, dredging and foundations; core earthmoving."),
    "forklift operator": ("conditional", "Uses forklifts to move/stack merchandise and fulfil orders. The equipment is heavy/material-handling machinery, but the task is primarily warehouse logistics rather than earthmoving/construction."),
    "grader operator": ("supported", "Uses a heavy grader to level soil and finish earthworks; core earthmoving/construction plant operation."),
    "mobile crane operator": ("supported", "Operates mobile cranes across road, rail and water settings to lift loads; direct crane operation."),
    "pile driving hammer operator": ("supported", "Positions piles and drives them into the ground using heavy hammer/rigging equipment; direct construction plant operation."),
    "production plant crane operator": ("supported", "Operates industrial cranes to lift and move raw materials and loads within a production plant; direct heavy lifting equipment operation."),
    "road construction worker": ("conditional", "Performs earthworks, road substructure and pavement construction. The work is within the construction context but the task description does not establish that the worker operates heavy earthmoving equipment."),
    "road roller operator": ("supported", "Operates rollers to compact soil, gravel, concrete or asphalt for roads/foundations; direct construction plant operation."),
    "scraper operator": ("supported", "Operates heavy mobile scrapers to remove and haul soil/material; core earthmoving."),
    "snow-clearing worker": ("conditional", "Operates trucks/plows to clear snow and spread de-icing material. This is road-maintenance equipment operation but not the earthmoving/construction work explicitly described by D116."),
    "surface mine plant operator": ("supported", "Operates excavators/dump trucks and other heavy equipment to excavate, load and move ore and overburden; direct earthmoving."),
    "tower crane operator": ("supported", "Operates tower cranes to lift construction materials; direct crane/construction-equipment operation."),
}


def main() -> None:
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    rows = [row for row in queue["unresolved_rows"] if row["domain_id"] == "D116"]
    actual = {row["role_name"] for row in rows}
    if len(rows) != len(actual) or actual != set(DECISIONS):
        raise SystemExit(f"D116 exact-key mismatch: missing={sorted(actual-set(DECISIONS))}; extra={sorted(set(DECISIONS)-actual)}")
    decisions = []
    for row in sorted(rows, key=lambda value: value["role_key"]):
        fit, rationale = DECISIONS[row["role_name"]]
        decisions.append({"role_key": row["role_key"], "role_name": row["role_name"], "task_evidence": row["role_description"], "esco_uri": (row.get("esco_occupation_uris") or [None])[0], "domain_fit": fit, "rationale": rationale, "source_refs": ["QUEUE_TASK_PROFILE", "ESCO_OCCUPATION_PROFILES", "ILO_ISCO08_EARTHMOVING_CRANES"]})
    counts = Counter(item["domain_fit"] for item in decisions)
    payload = {"schema_version": "2026-10-05.role-domain-fit-lane.v1", "audit_date": date.today().isoformat(), "domain_id": "D116", "domain_name": rows[0]["domain_name"], "scope": rows[0]["domain_scope"], "method": "Compare exact tasks with construction/heavy equipment operation, earthmoving and cranes. ISCO/ESCO, subgroup membership, title similarity and frequency are not fit evidence. Conditional is used for adjacent industrial material handling or road-construction/maintenance tasks where the profile does not establish the named equipment work; unsupported means another equipment/transport domain.", "counts": {"mappings_reviewed": len(decisions), "supported": counts["supported"], "conditional": counts["conditional"], "unsupported_for_domain": counts["unsupported_for_domain"], "unresolved": counts["unresolved"]}, "decisions": decisions, "sources": SOURCES, "notes": ["All 20 D116 mappings were matched to exact queue keys and task descriptions before report generation.", "Crane roles fit based on lifting/moving tasks, while forklifts and industrial trucks remain conditional because their recorded use is principally warehouse/production logistics; this makes the scope boundary visible rather than silently treating every machine operator as earthmoving.", "No role-to-specialization assignment, student visibility decision or canonical taxonomy/mapping change is made."]}
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = ["# D116 role-to-parent-domain fit review — 2026-10-05", "", f"Scope: {payload['scope']}", "", f"- Exact queued roles reviewed: **{len(decisions)}**", f"- Supported: **{payload['counts']['supported']}**", f"- Conditional: **{payload['counts']['conditional']}**", f"- Unsupported for this parent: **{payload['counts']['unsupported_for_domain']}**", f"- Unresolved: **{payload['counts']['unresolved']}**", "", "| Exact role key | Task description | Fit | Why |", "|---|---|---|---|"]
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

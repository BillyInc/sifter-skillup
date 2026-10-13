"""Exact-key D112 role-to-parent-domain audit report generator."""

from __future__ import annotations

import json
from collections import Counter
from datetime import date
from pathlib import Path

LANE = Path(__file__).resolve().parent
QUEUE = LANE / "D085_D168_role_fit_queue_2026_10_05.json"
OUT_JSON = LANE / "D112_role_domain_fit_review_2026_10_05.json"
OUT_MD = LANE / "D112_role_domain_fit_review_2026_10_05.md"

SOURCES = {
    "QUEUE_TASK_PROFILE": {"publisher": "Checked-in role/domain lane queue", "url": "D085_D168_role_fit_queue_2026_10_05.json", "locator": "Exact D112 role_key and task description for each decision.", "supports": "Recorded wood, pulp and paper transformation duties compared with the domain scope.", "limit": "Local task profiles are not independent authorities."},
    "ESCO_OCCUPATION_PROFILES": {"publisher": "European Commission, ESCO", "url": "https://esco.ec.europa.eu/en/classification/occupation-main", "locator": "Exact occupation URIs retained in the queue.", "supports": "Standardized occupation concepts and task descriptions.", "limit": "ESCO hierarchy is not used to infer fit."},
    "ILO_ISCO08_WOOD_PAPER": {"publisher": "International Labour Organization", "url": "https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf", "locator": "ISCO-08 manufacturing occupation definitions for wood processing and paper/pulp plant operators.", "supports": "International occupational context for sawmilling, wood shaping and pulp/paper production.", "limit": "Codes corroborate task families only; decisions are based on each role's tasks and D112's parent scope."},
}

DECISIONS = {
    "band saw operator": ("supported", "Cuts wood on industrial band-saw machinery to shape timber/workpieces; direct wood processing."),
    "bleacher operator": ("supported", "Bleaches wood pulp to produce grades of white paper; direct pulp/paper processing."),
    "chipper operator": ("supported", "Chips wood for particleboard, pulp or wood-product use; direct first-stage wood processing."),
    "crosscut saw operator": ("conditional", "Fells/bucks trees and removes limbs to obtain logs. This is forestry/log harvesting upstream of the domain's wood-processing stage."),
    "debarker operator": ("supported", "Removes bark from harvested trees using machinery before further wood processing; direct mill-feed preparation."),
    "digester operator": ("supported", "Cooks wood chips with chemicals to separate pulp and tests the resulting solution; direct pulp production."),
    "engineered wood board machine operator": ("supported", "Bonds wood/cork particles or fibres with adhesives/resins into engineered boards; direct wood-product manufacture."),
    "froth flotation deinking operator": ("supported", "Removes ink from recycled-paper pulp through flotation; direct recovered-fibre and paper production."),
    "laminating machine operator": ("supported", "Applies a protective plastic layer to paper; direct paper-product finishing/converting."),
    "paper machine operator": ("supported", "Forms, presses and dries pulp slurry into paper; core paper-mill operation."),
    "paper mill supervisor": ("supported", "Coordinates production at a paper mill and monitors product/line goals; direct paper manufacturing supervision."),
    "paper pulp moulding operator": ("supported", "Moulds paper pulp into packaging such as egg cartons; direct pulp-based product manufacture."),
    "planer thicknesser operator": ("supported", "Planes wood planks to a specified uniform thickness; direct wood processing."),
    "pulp technician": ("supported", "Maintains equipment, troubleshoots and supports pulp production to process specifications; direct pulp operations."),
    "sawmill operator": ("supported", "Operates sawmill equipment to turn timber into lumber and other cut shapes; direct wood processing."),
    "table saw operator": ("supported", "Cuts wood on industrial table-saw equipment to controlled dimensions; direct wood processing."),
    "veneer slicer operator": ("supported", "Slices timber into veneer sheets for board and other wood products; direct wood processing."),
    "wash deinking operator": ("supported", "Washes ink from recycled-paper pulp using water/dispersants and dewatering; direct paper recycling and pulp processing."),
    "wood assembly supervisor": ("supported", "Supervises production processes assembling wood products; direct wood-product manufacturing."),
    "wood fuel pelletiser": ("conditional", "Turns wood waste into fuel pellets. It is wood processing but the finished product and use are energy fuel rather than the stated lumber, boards, pulp or paper outputs."),
    "wood production supervisor": ("supported", "Supervises wood-production processes and related machinery/workflows; direct wood processing operations."),
    "wood router operator": ("supported", "Uses routing machinery to cut/shape wood components; direct wood processing."),
}


def main() -> None:
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    rows = [row for row in queue["unresolved_rows"] if row["domain_id"] == "D112"]
    actual = {row["role_name"] for row in rows}
    if len(rows) != len(actual) or actual != set(DECISIONS):
        raise SystemExit(f"D112 exact-key mismatch: missing={sorted(actual-set(DECISIONS))}; extra={sorted(set(DECISIONS)-actual)}")
    decisions = []
    for row in sorted(rows, key=lambda value: value["role_key"]):
        fit, rationale = DECISIONS[row["role_name"]]
        decisions.append({"role_key": row["role_key"], "role_name": row["role_name"], "task_evidence": row["role_description"], "esco_uri": (row.get("esco_occupation_uris") or [None])[0], "domain_fit": fit, "rationale": rationale, "source_refs": ["QUEUE_TASK_PROFILE", "ESCO_OCCUPATION_PROFILES", "ILO_ISCO08_WOOD_PAPER"]})
    counts = Counter(item["domain_fit"] for item in decisions)
    payload = {"schema_version": "2026-10-05.role-domain-fit-lane.v1", "audit_date": date.today().isoformat(), "domain_id": "D112", "domain_name": rows[0]["domain_name"], "scope": rows[0]["domain_scope"], "method": "Compare exact tasks with industrial conversion of logs/wood into sawn timber, boards, pulp and paper products. ISCO/ESCO codes, subgroup, title similarity and frequency are not fit evidence. Conditional denotes a role upstream of wood processing or producing a materially different output than the stated domain scope.", "counts": {"mappings_reviewed": len(decisions), "supported": counts["supported"], "conditional": counts["conditional"], "unsupported_for_domain": counts["unsupported_for_domain"], "unresolved": counts["unresolved"]}, "decisions": decisions, "sources": SOURCES, "notes": ["All D112 exact role names were reconciled against the queue before generation, preserving the full recorded task description per mapping.", "Harvesting logs is separated from mill processing; producing wood fuel is conditional because the parent scope describes timber/boards/pulp/paper rather than bioenergy outputs.", "No specialization assignment, student visibility decision or canonical taxonomy/mapping change is made."]}
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = ["# D112 role-to-parent-domain fit review — 2026-10-05", "", f"Scope: {payload['scope']}", "", f"- Exact queued roles reviewed: **{len(decisions)}**", f"- Supported: **{payload['counts']['supported']}**", f"- Conditional: **{payload['counts']['conditional']}**", f"- Unsupported for this parent: **{payload['counts']['unsupported_for_domain']}**", f"- Unresolved: **{payload['counts']['unresolved']}**", "", "| Exact role key | Task description | Fit | Why |", "|---|---|---|---|"]
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

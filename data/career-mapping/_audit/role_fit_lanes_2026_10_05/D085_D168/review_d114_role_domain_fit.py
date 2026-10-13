"""Exact-key D114 role-to-parent-domain audit report generator."""

from __future__ import annotations

import json
from collections import Counter
from datetime import date
from pathlib import Path

LANE = Path(__file__).resolve().parent
QUEUE = LANE / "D085_D168_role_fit_queue_2026_10_05.json"
OUT_JSON = LANE / "D114_role_domain_fit_review_2026_10_05.json"
OUT_MD = LANE / "D114_role_domain_fit_review_2026_10_05.md"

SOURCES = {
    "QUEUE_TASK_PROFILE": {"publisher": "Checked-in role/domain lane queue", "url": "D085_D168_role_fit_queue_2026_10_05.json", "locator": "Exact D114 task description and role_key for each mapped role.", "supports": "The assembly/fabrication/packaging duties compared with the domain's factory-assembly scope.", "limit": "The queue records task profiles but is not an independent authority."},
    "ESCO_OCCUPATION_PROFILES": {"publisher": "European Commission, ESCO", "url": "https://esco.ec.europa.eu/en/classification/occupation-main", "locator": "Exact occupation identifiers retained where present in the queue.", "supports": "Standardized role concepts and linked task descriptions.", "limit": "Classification membership alone does not establish fit."},
    "ILO_ISCO08_ASSEMBLERS": {"publisher": "International Labour Organization", "url": "https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf", "locator": "ISCO-08 Major Group 8 and Unit Groups 8211, 8212 and 8219, defining mechanical/electrical/electronic assemblers by component assembly and installation tasks.", "supports": "International occupational task context for product assembly work.", "limit": "ISCO only corroborates task boundaries; decisions compare each role's task with D114's broad stated assembly/packaging scope."},
}

DECISIONS = {
    "Assembly and Factory Workers": ("unresolved", "The record reports a WEF Future of Jobs trend classification, not an occupation or task description. There is no actual work to compare with assembly/packaging, so no duties are inferred."),
    "Computer Numerically Controlled Tool Programmers": ("conditional", "Programs automated machine tools to process parts and may set up/operate equipment. This supports factory production but does not establish that the role performs assembly or packaging rather than machining."),
    "Fiberglass Laminators and Fabricators": ("conditional", "Laminates fiberglass onto moulds to make hulls, vehicle bodies and other products. This is product fabrication and may include joining layers, but the described work is not clearly assembly/packaging of components."),
    "Model Makers, Wood": ("conditional", "Builds precision wooden models, jigs and lofts. This supports manufacturing preparation/tooling but is not assembly of saleable products as the domain description specifies."),
    "Patternmakers, Wood": ("unsupported_for_domain", "Constructs patterns used to form sand moulds for castings; this is foundry tooling/patternmaking rather than product assembly or packaging."),
    "Structural Metal Fabricators and Fitters": ("supported", "Fabricates, positions, aligns and fits parts into structural metal products; direct component fit-up and product assembly."),
    "Timing Device Assemblers and Adjusters": ("supported", "Precisely assembles/adjusts timing devices within narrow tolerances; direct product assembly."),
    "aircraft assembler": ("supported", "Builds aircraft and subassemblies by fitting/installing prefabricated parts; direct factory assembly."),
    "aircraft engine assembler": ("supported", "Builds and installs prefabricated components into aircraft engines using specifications and drawings; direct mechanical assembly."),
    "ammunition assembler": ("supported", "Assembles cartridge/projectile components in ammunition manufacturing; direct factory assembly (hazard level does not alter domain fit)."),
    "battery assembler": ("supported", "Welds and assembles cells, wiring, casing and battery modules in a manufacturing facility; direct product assembly."),
    "bicycle assembler": ("supported", "Builds, tunes and checks bicycles and related products; direct product assembly."),
    "control panel assembler": ("supported", "Assembles wiring, switches, measurement apparatus and cables into electrical control panels from schematics; direct electrical assembly."),
    "dental instrument assembler": ("supported", "Assembles dental instruments and imaging devices from components using tools/equipment; direct medical-device assembly."),
    "electrical cable assembler": ("supported", "Processes and assembles conductive wires/cables for use in appliances; direct electrical product assembly."),
    "electrical equipment assembler": ("supported", "Assembles electrical-equipment components and wiring to drawings; direct factory assembly."),
    "electromechanical equipment assembler": ("supported", "Interprets drawings and assembles/modifies electromechanical devices, then tests the completed units; direct assembly and test."),
    "electronic equipment assembler": ("supported", "Assembles electronic components and wiring to blueprints and may inspect/test equipment; direct product assembly."),
    "electronic musical instrument maker": ("supported", "Creates and assembles electronic instrument components, installs pickups and tests the finished instrument; direct assembly/manufacture."),
    "firework assembler": ("supported", "Fabricates and assembles pyrotechnic components into fireworks from specifications; direct production assembly."),
    "furniture assembler": ("supported", "Joins furniture parts and fittings according to instructions/blueprints; direct product assembly."),
    "industrial machinery assembler": ("supported", "Builds industrial machines and equipment from components using tools and controlled machinery; direct mechanical assembly."),
    "jewellery assembler": ("supported", "Joins jewellery components into finished pieces; direct small-product assembly."),
    "mechatronics assembler": ("supported", "Builds, installs and configures mechanical/electrical/electronic components into complex equipment; direct assembly."),
    "medical device assembler": ("supported", "Manufactures medical instruments and devices by assembling component parts; direct product assembly."),
    "metal furniture machine operator": ("supported", "Cuts, shapes and joins metal parts to manufacture furniture; the described joining step is direct product assembly, with material fabrication integrated into the task."),
    "metal products assembler": ("supported", "Fits and fastens metal components into parts or finished products using hand/power tools; direct assembly."),
    "motor vehicle assembler": ("supported", "Installs prefabricated components into vehicles and inspects/tests the assembled product; direct assembly."),
    "motor vehicle body assembler": ("supported", "Joins vehicle body parts such as frames, doors, chassis and hoods using tools/robots; direct assembly."),
    "motor vehicle engine assembler": ("supported", "Builds engines from prefabricated components following technical drawings; direct mechanical assembly."),
    "motor vehicle parts assembler": ("supported", "Connects and adjusts vehicle parts, wiring and cables into assemblies; direct component assembly."),
    "motorcycle assembler": ("supported", "Fastens frames, wheels, engines and other motorcycle components into finished vehicles; direct assembly."),
    "photographic equipment assembler": ("supported", "Assembles optical, electronic and mechanical components into cameras/projectors; direct product assembly."),
    "plastic products assembler": ("supported", "Fits, fastens and may shape plastic parts into finished products; direct product assembly."),
    "printed circuit board assembler": ("supported", "Installs/solders electronic components on boards using manual or automated equipment; direct electronic assembly."),
    "rolling stock assembler": ("supported", "Fits and installs prefabricated parts to build rail-vehicle bodies and subassemblies; direct mechanical assembly."),
    "rubber goods assembler": ("supported", "Attaches components and fittings to rubber products such as bottles, fins and gloves; direct product assembly."),
    "semiconductor processor": ("conditional", "Manufactures and tests semiconductor devices, but the task is microfabrication/processing rather than assembly of components into finished products."),
    "surface-mount technology machine operator": ("supported", "Places and solders electronic components onto printed circuit boards using SMT machinery; direct automated electronic assembly."),
    "vessel engine assembler": ("supported", "Builds vessel engines by installing prefabricated engine components; direct mechanical assembly."),
    "wave soldering machine operator": ("supported", "Sets up and operates soldering machinery that joins electronic components to circuit boards; direct automated assembly."),
    "wire harness assembler": ("supported", "Binds and arranges wires/cables into harness assemblies from wiring plans; direct electrical assembly."),
    "wood products assembler": ("supported", "Joins pre-made wood parts with joints, glue or fasteners to create finished wood products; direct product assembly."),
}


def main() -> None:
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    rows = [row for row in queue["unresolved_rows"] if row["domain_id"] == "D114"]
    actual = {row["role_name"] for row in rows}
    if len(rows) != len(actual) or actual != set(DECISIONS):
        raise SystemExit(f"D114 exact-key mismatch: missing={sorted(actual-set(DECISIONS))}; extra={sorted(set(DECISIONS)-actual)}")
    decisions = []
    for row in sorted(rows, key=lambda value: value["role_key"]):
        fit, rationale = DECISIONS[row["role_name"]]
        refs = ["QUEUE_TASK_PROFILE", "ESCO_OCCUPATION_PROFILES", "ILO_ISCO08_ASSEMBLERS"]
        if fit == "unresolved":
            refs = ["QUEUE_TASK_PROFILE"]
        decisions.append({"role_key": row["role_key"], "role_name": row["role_name"], "task_evidence": row["role_description"], "esco_uri": (row.get("esco_occupation_uris") or [None])[0], "domain_fit": fit, "rationale": rationale, "source_refs": refs})
    counts = Counter(item["domain_fit"] for item in decisions)
    payload = {"schema_version": "2026-10-05.role-domain-fit-lane.v1", "audit_date": date.today().isoformat(), "domain_id": "D114", "domain_name": rows[0]["domain_name"], "scope": rows[0]["domain_scope"], "method": "Compare exact tasks against factory component assembly and packaging to produce/prepare finished products. ISCO/ESCO family, subgroup, title similarity and frequency are not fit evidence. Conditional means production work is adjacent but not demonstrably assembly/packaging, unsupported denotes a different work family, and unresolved means the record contains no occupational task description.", "counts": {"mappings_reviewed": len(decisions), "supported": counts["supported"], "conditional": counts["conditional"], "unsupported_for_domain": counts["unsupported_for_domain"], "unresolved": counts["unresolved"]}, "decisions": decisions, "sources": SOURCES, "notes": ["All 43 exact D114 role names were reconciled against the queue. The WEF trend record remains unresolved because it has no occupation tasks; no tasks were invented.", "The scope intentionally spans many industries; medical, aircraft, vehicle, electrical, electronic, furniture, rubber and wood-product roles fit when their exact task assembles components/products.", "Machining/programming, composite fabrication, production tooling and semiconductor fabrication are distinguished from assembly where the recorded task does not establish assembly work.", "No role-to-specialization assignment, student-visibility decision or canonical taxonomy/mapping change is made."]}
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = ["# D114 role-to-parent-domain fit review — 2026-10-05", "", f"Scope: {payload['scope']}", "", f"- Exact queued roles reviewed: **{len(decisions)}**", f"- Supported: **{payload['counts']['supported']}**", f"- Conditional: **{payload['counts']['conditional']}**", f"- Unsupported for this parent: **{payload['counts']['unsupported_for_domain']}**", f"- Unresolved: **{payload['counts']['unresolved']}**", "", "| Exact role key | Task description | Fit | Why |", "|---|---|---|---|"]
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

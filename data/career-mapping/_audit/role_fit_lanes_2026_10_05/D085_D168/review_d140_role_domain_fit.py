import json
from collections import Counter
from datetime import date
from pathlib import Path


LANE = Path(__file__).resolve().parent
QUEUE = LANE / "D085_D168_role_fit_queue_2026_10_05.json"
OUT_JSON = LANE / "D140_role_domain_fit_review_2026_10_05.json"
OUT_MD = LANE / "D140_role_domain_fit_review_2026_10_05.md"

SOURCES = {
    "QUEUE_TASK_PROFILE": {"publisher": "Checked-in role/domain audit queue", "url": "D085_D168_role_fit_queue_2026_10_05.json", "locator": "Exact D140 role_key and task descriptions for all 20 mappings.", "supports": "The specific duties assessed for fit with robotics, automation and controls engineering.", "limit": "The queue is the audited record, not independent proof of the occupation's full scope."},
    "IFR_INDUSTRIAL_ROBOTS": {"publisher": "International Federation of Robotics (IFR)", "url": "https://ifr.org/industrial-robots", "locator": "Definition and applications of industrial robots in automation environments; manufacturing applications and industrial-robot characteristics.", "supports": "Industrial robot and industrial-automation task boundaries.", "limit": "The cited industrial-robot definition is not a complete definition of all robotics fields."},
    "NIST_MANUFACTURING_AUTOMATION": {"publisher": "U.S. National Institute of Standards and Technology (NIST), Manufacturing Extension Partnership", "url": "https://www.nist.gov/mep/robotics-and-manufacturing-automation", "locator": "Robotics and manufacturing automation: cobots/industrial robots, machine tending, material handling, automated visual inspection and integration with production.", "supports": "The manufacturing automation and system-integration tasks in D140.", "limit": "U.S. manufacturing support context; not a global occupational taxonomy."},
    "OSHA_ROBOT_SYSTEMS": {"publisher": "U.S. Occupational Safety and Health Administration (OSHA)", "url": "https://www.osha.gov/otm/section-4-safety-hazards/chapter-4", "locator": "Technical Manual on industrial robot systems: controllers, manipulators, sensors, integration and applications such as handling, assembly, welding, inspection and testing.", "supports": "Robot controller, technician, integration, operation and safety-related tasks.", "limit": "U.S. industrial safety guidance is context, not a universal regulation or credential requirement."},
}

S = "supported"
C = "conditional"
U = "unsupported_for_domain"

DECISIONS = {
    "Quality Control Systems Managers": (C, "Coordinates QA policies and laboratory/production quality generally. Robotics manufacturing may be one context, but this record does not identify robotics or automated-control systems.", ["QUEUE_TASK_PROFILE", "NIST_MANUFACTURING_AUTOMATION"]),
    "Robotics Engineers": (S, "Researches, designs, develops and tests robotic applications; this is the core parent-domain activity.", ["QUEUE_TASK_PROFILE", "IFR_INDUSTRIAL_ROBOTS", "NIST_MANUFACTURING_AUTOMATION"]),
    "advanced robotics engineer": (S, "Invents, designs and tests robotic solutions; explicit robotics engineering and development.", ["QUEUE_TASK_PROFILE", "IFR_INDUSTRIAL_ROBOTS"]),
    "automation engineer": (S, "Designs and develops production-process automation and implements industrial robotics; direct automation/controls scope.", ["QUEUE_TASK_PROFILE", "IFR_INDUSTRIAL_ROBOTS", "NIST_MANUFACTURING_AUTOMATION"]),
    "automation engineering technician": (S, "Builds, tests, monitors and maintains computer-controlled automated production systems; direct implementation and upkeep of automation.", ["QUEUE_TASK_PROFILE", "NIST_MANUFACTURING_AUTOMATION", "OSHA_ROBOT_SYSTEMS"]),
    "electronics and automation vocational teacher": (U, "Teaches electronics/automation vocational content. Teaching about a field is not itself performing robotics, automation or controls engineering work within this role-domain fit lane.", ["QUEUE_TASK_PROFILE"]),
    "equipment engineer": (C, "Designs and maintains manufacturing machinery generally. Robotics can be part of manufacturing equipment, but the recorded task does not specify robots, controls or automated systems.", ["QUEUE_TASK_PROFILE", "NIST_MANUFACTURING_AUTOMATION"]),
    "industrial robot controller": (S, "Operates, monitors, maintains and repairs industrial robot controllers and coordinated robots in manufacturing; direct robotics operation and control.", ["QUEUE_TASK_PROFILE", "IFR_INDUSTRIAL_ROBOTS", "OSHA_ROBOT_SYSTEMS"]),
    "marine mechatronics technician": (U, "Configures and maintains mechatronic systems on ships and vessels. The record does not establish robotics, manufacturing automation or controls-engineering work in D140's scope.", ["QUEUE_TASK_PROFILE"]),
    "mechanical engineer": (C, "Designs and maintains mechanical products and systems broadly. Robotics may require this work, but no robotic or automation application is specified in this record.", ["QUEUE_TASK_PROFILE", "IFR_INDUSTRIAL_ROBOTS"]),
    "mechatronics assembler": (S, "Assembles and maintains mechatronic machines, explicitly including robots, and integrates mechanical, electrical, electronic and software components.", ["QUEUE_TASK_PROFILE", "IFR_INDUSTRIAL_ROBOTS", "OSHA_ROBOT_SYSTEMS"]),
    "mechatronics engineer": (S, "Designs intelligent systems explicitly including robotic devices by integrating mechanical, electronic, computer and control engineering.", ["QUEUE_TASK_PROFILE", "IFR_INDUSTRIAL_ROBOTS"]),
    "mechatronics engineering technician": (S, "Builds, tests, installs and calibrates mechatronic devices and applications and resolves technical problems; direct mechatronic implementation supporting robotics and automation.", ["QUEUE_TASK_PROFILE", "IFR_INDUSTRIAL_ROBOTS", "OSHA_ROBOT_SYSTEMS"]),
    "precision engineer": (C, "Designs precise processes, machines and fixtures. Such work can support robotics/control systems, but the role description does not identify a robotics or automation application.", ["QUEUE_TASK_PROFILE", "IFR_INDUSTRIAL_ROBOTS"]),
    "precision mechanics supervisor": (C, "Supervises assembly of small precision and measuring/control mechanisms. This may intersect with robot components, but the role text does not establish robotic-system work.", ["QUEUE_TASK_PROFILE", "OSHA_ROBOT_SYSTEMS"]),
    "robotics engineer": (S, "Specifies, designs, builds, programs and tests robotic systems for automated work; explicitly within the parent scope.", ["QUEUE_TASK_PROFILE", "IFR_INDUSTRIAL_ROBOTS", "NIST_MANUFACTURING_AUTOMATION"]),
    "robotics engineering technician": (S, "Builds, tests, installs and calibrates robotic devices and applications; direct technical implementation of robotics.", ["QUEUE_TASK_PROFILE", "IFR_INDUSTRIAL_ROBOTS", "OSHA_ROBOT_SYSTEMS"]),
    "robotics integrator": (S, "Designs and implements plans applying robotics to manufacturing operations; direct robotics-system integration.", ["QUEUE_TASK_PROFILE", "NIST_MANUFACTURING_AUTOMATION", "OSHA_ROBOT_SYSTEMS"]),
    "robotics specialist": (S, "Provides robotics expertise and proposes robot-system upgrades for manufacturing performance; explicit robotics domain work.", ["QUEUE_TASK_PROFILE", "IFR_INDUSTRIAL_ROBOTS", "NIST_MANUFACTURING_AUTOMATION"]),
    "robotics technician": (S, "Maintains and supports robots and automated equipment in manufacturing; direct operations and maintenance within the domain.", ["QUEUE_TASK_PROFILE", "NIST_MANUFACTURING_AUTOMATION", "OSHA_ROBOT_SYSTEMS"]),
}


def main() -> None:
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    rows = [row for row in queue["unresolved_rows"] if row["domain_id"] == "D140"]
    names = [row["role_name"] for row in rows]
    if len(rows) != 20 or len(names) != len(set(names)) or set(names) != set(DECISIONS):
        raise SystemExit(f"D140 exact queue mismatch: queued={sorted(names)} decided={sorted(DECISIONS)}")
    decisions = []
    for row in sorted(rows, key=lambda item: item["role_key"]):
        fit, rationale, refs = DECISIONS[row["role_name"]]
        decisions.append({"role_key": row["role_key"], "role_name": row["role_name"], "task_evidence": row["role_description"], "esco_uri": (row.get("esco_occupation_uris") or [None])[0], "onet_codes": row.get("onet_occupation_codes", []), "domain_fit": fit, "rationale": rationale, "source_refs": refs})
    tally = Counter(item["domain_fit"] for item in decisions)
    payload = {
        "schema_version": "2026-10-05.role-domain-fit-lane.v1", "audit_date": date.today().isoformat(),
        "domain_id": "D140", "domain_name": rows[0]["domain_name"], "scope": rows[0]["domain_scope"],
        "method": "Compare each exact role's tasks with robotics, automation, controls, robot-system integration and manufacturing operations. Explicit robotics/automation duties are supported; generic manufacturing/engineering quality or machinery work is conditional without robot/control context; teaching and marine-mechatronics tasks are outside this parent scope as recorded. Neither role title nor subgroup membership establishes fit.",
        "counts": {"mappings_reviewed": len(decisions), "supported": tally[S], "conditional": tally[C], "unsupported_for_domain": tally[U], "unresolved": tally["unresolved"]},
        "decisions": decisions, "sources": SOURCES,
        "notes": ["All 20 exact D140 queue mappings were compared with role task text; no fit is inferred from subgroup membership.", "IFR supports industrial-robot terminology; NIST supports manufacturing automation applications; OSHA is used for robot-system components and task context, not as a global legal rule.", "No role-to-specialization assignment, student-path recommendation or canonical mapping/taxonomy change is made."],
    }
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = ["# D140 role-to-parent-domain fit review — 2026-10-05", "", f"Scope: {payload['scope']}", "", f"- Exact queued roles reviewed: **{len(decisions)}**", f"- Supported: **{tally[S]}**", f"- Conditional: **{tally[C]}**", f"- Unsupported for this parent: **{tally[U]}**", f"- Unresolved: **{tally['unresolved']}**", "", "| Exact role key | Recorded task evidence | Parent fit | Reason |", "|---|---|---|---|"]
    for item in decisions:
        task = item["task_evidence"].replace("|", "\\|").replace("\n", " ")
        reason = item["rationale"].replace("|", "\\|").replace("\n", " ")
        lines.append(f"| `{item['role_key']}` | {task} | {item['domain_fit']} | {reason} |")
    lines.extend(["", "## Sources and limitations", ""])
    for key, source in SOURCES.items():
        lines.append(f"- **{key} — {source['publisher']}:** [{source['url']}]({source['url']}). {source['locator']} Supports: {source['supports']} Limit: {source['limit']}")
    lines.extend(["", "## Audit notes", ""])
    lines.extend(f"- {note}" for note in payload["notes"])
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()

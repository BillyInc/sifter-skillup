import json
from collections import Counter
from datetime import date
from pathlib import Path


LANE = Path(__file__).resolve().parent
QUEUE = LANE / "D085_D168_role_fit_queue_2026_10_05.json"
OUT_JSON = LANE / "D147_role_domain_fit_review_2026_10_05.json"
OUT_MD = LANE / "D147_role_domain_fit_review_2026_10_05.md"

SOURCES = {
    "QUEUE_TASK_PROFILE": {
        "publisher": "Checked-in role/domain audit queue",
        "url": "D085_D168_role_fit_queue_2026_10_05.json",
        "locator": "Exact D147 role_key, parent scope and stored task descriptions.",
        "supports": "The specific tasks evaluated for each D147 mapping.",
        "limit": "This is the record under audit, not an independent verification of each occupation's full scope.",
    },
    "ISA_INDUSTRIAL_AUTOMATION_SCOPE": {
        "publisher": "International Society of Automation (ISA)",
        "url": "https://www.isa.org/standards-and-publications/isa-standards/isa-standards-committees/isa99",
        "locator": "ISA99 scope describes industrial automation/control systems including DCS, PLC, SCADA, sensors, monitoring, diagnostics and control/safety/manufacturing operations across continuous and discrete processes.",
        "supports": "The parent's industrial control-system scope and the inclusion of manufacturing/process automation tasks.",
        "limit": "Standards-committee scope is not a role licensing standard or a title-to-domain mapping rule.",
    },
    "ISA_PROCESS_AUTOMATION": {
        "publisher": "International Society of Automation (ISA)",
        "url": "https://www.isa.org/process-automation-and-control",
        "locator": "Process automation overview: measurement, regulation, process manipulation/visualization; instrumentation, sensors, valves, DCS, PID/loop control, SCADA, control rooms, process safety.",
        "supports": "Process-control, instrumentation, control-room and plant-operator duties.",
        "limit": "Professional-society technical overview; it supports task families but does not determine local job titles or regulation.",
    },
    "ISA_FACTORY_AUTOMATION": {
        "publisher": "International Society of Automation (ISA)",
        "url": "https://www.isa.org/factory-automation-and-machine-control",
        "locator": "Factory automation includes manufacturing/assembly cells, robots, CNC, machine-control systems, PLC/PACs, sensors and production-line control.",
        "supports": "Discrete manufacturing, robotic, CNC and assembly-line automation task families.",
        "limit": "Technical topic scope, not evidence that every assembly-line worker programs or engineers control systems.",
    },
    "NIST_ICS_GUIDE": {
        "publisher": "U.S. National Institute of Standards and Technology (NIST)",
        "url": "https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-82.pdf",
        "locator": "SP 800-82, section 2: ICS includes SCADA, DCS and PLC; examples include oil/gas, pulp and paper, food/beverage, chemical and discrete manufacturing; PLCs control industrial equipment/processes.",
        "supports": "Cross-sector examples and the industrial scope of the systems named in D147.",
        "limit": "U.S. government cybersecurity guidance; used for technical system scope, not country-specific occupational licensing.",
    },
}

S = "supported"
C = "conditional"
U = "unsupported_for_domain"

DECISIONS = {
    "automated assembly line operator": (
        S,
        "Operates, maintains and cleans automated production machines and assembles products on a production line. This is direct discrete-manufacturing automation operation, although the record does not claim engineering/programming duties.",
        ["QUEUE_TASK_PROFILE", "ISA_INDUSTRIAL_AUTOMATION_SCOPE", "ISA_FACTORY_AUTOMATION"],
    ),
    "automation engineer": (
        S,
        "Designs and develops automation applications for production processes, including industrial robotics and safe operation; directly matches industrial process/factory automation engineering.",
        ["QUEUE_TASK_PROFILE", "ISA_INDUSTRIAL_AUTOMATION_SCOPE", "ISA_PROCESS_AUTOMATION", "ISA_FACTORY_AUTOMATION"],
    ),
    "automation engineering technician": (
        S,
        "Builds, tests, monitors and maintains computer-controlled automated production systems; direct technician-level industrial automation work.",
        ["QUEUE_TASK_PROFILE", "ISA_INDUSTRIAL_AUTOMATION_SCOPE", "ISA_FACTORY_AUTOMATION"],
    ),
    "clothing process control technician": (
        S,
        "Operates process-control equipment on manufacturing assembly lines. The recorded textile/clothing context is a discrete production line, which fits the domain's manufacturing automation scope.",
        ["QUEUE_TASK_PROFILE", "ISA_INDUSTRIAL_AUTOMATION_SCOPE", "ISA_FACTORY_AUTOMATION"],
    ),
    "electronics and automation vocational teacher": (
        C,
        "Teaches electronics and automation skills for occupations such as electricians and production-automation technicians. The subject is directly relevant, but the listed work is vocational education rather than designing, operating or maintaining industrial control systems.",
        ["QUEUE_TASK_PROFILE", "ISA_INDUSTRIAL_AUTOMATION_SCOPE", "ISA_FACTORY_AUTOMATION"],
    ),
    "gas processing plant control room operator": (
        S,
        "Monitors plant process displays and adjusts process variables from a gas-processing control room; direct process-control operations in an expressly named industry.",
        ["QUEUE_TASK_PROFILE", "ISA_PROCESS_AUTOMATION", "NIST_ICS_GUIDE"],
    ),
    "industrial robot controller": (
        S,
        "Operates and monitors industrial robots in manufacturing tasks such as welding, lifting and assembly and maintains synchronization/operation; direct factory-automation work.",
        ["QUEUE_TASK_PROFILE", "ISA_INDUSTRIAL_AUTOMATION_SCOPE", "ISA_FACTORY_AUTOMATION"],
    ),
    "instrumentation engineer": (
        S,
        "Designs instrumentation and monitoring/control equipment for manufacturing processes and production sites; directly matches industrial measurement and control engineering.",
        ["QUEUE_TASK_PROFILE", "ISA_PROCESS_AUTOMATION", "NIST_ICS_GUIDE"],
    ),
    "instrumentation engineering technician": (
        S,
        "Builds, tests, monitors and maintains valves, relays, regulators and other process-control equipment; direct instrumentation and control-system support.",
        ["QUEUE_TASK_PROFILE", "ISA_PROCESS_AUTOMATION", "NIST_ICS_GUIDE"],
    ),
    "mechatronics engineer": (
        C,
        "Combines mechanical, electronic, computing and control engineering, but the recorded applications span smart-home appliances, aircraft and other intelligent systems. Industrial process/manufacturing automation is plausible, not established as the role's defining context.",
        ["QUEUE_TASK_PROFILE", "ISA_INDUSTRIAL_AUTOMATION_SCOPE", "ISA_FACTORY_AUTOMATION"],
    ),
    "numerical tool and process control programmer": (
        S,
        "Writes programs controlling automatic manufacturing machines, using blueprints, job orders, simulations and trials; direct CNC/machine-control programming.",
        ["QUEUE_TASK_PROFILE", "ISA_INDUSTRIAL_AUTOMATION_SCOPE", "ISA_FACTORY_AUTOMATION"],
    ),
    "oil refinery control room operator": (
        S,
        "Monitors refinery processes and changes operating variables from a control room; directly matches industrial process-control operations in an explicitly named sector.",
        ["QUEUE_TASK_PROFILE", "ISA_PROCESS_AUTOMATION", "NIST_ICS_GUIDE"],
    ),
    "pulp control operator": (
        S,
        "Operates and monitors control machinery for pulp production and evaluates process results; direct process automation in pulp and paper, a documented industrial-control sector.",
        ["QUEUE_TASK_PROFILE", "ISA_PROCESS_AUTOMATION", "NIST_ICS_GUIDE"],
    ),
    "smart home engineer": (
        U,
        "Designs and integrates residential HVAC, lighting, shading, security and home-automation systems. Those are building automation services, not industrial process automation as scoped by this parent.",
        ["QUEUE_TASK_PROFILE", "ISA_INDUSTRIAL_AUTOMATION_SCOPE"],
    ),
    "smart home installer": (
        U,
        "Installs and maintains residential home-automation devices and systems. This is building/home automation rather than industrial process or factory control-system work.",
        ["QUEUE_TASK_PROFILE", "ISA_INDUSTRIAL_AUTOMATION_SCOPE"],
    ),
}


def main() -> None:
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    rows = [row for row in queue["unresolved_rows"] if row["domain_id"] == "D147"]
    names = [row["role_name"] for row in rows]
    if not rows or len(names) != len(set(names)) or set(names) != set(DECISIONS):
        raise SystemExit(f"D147 exact queue mismatch: queued={sorted(names)} decided={sorted(DECISIONS)}")
    decisions = []
    for row in sorted(rows, key=lambda item: item["role_key"]):
        fit, rationale, refs = DECISIONS[row["role_name"]]
        decisions.append({
            "role_key": row["role_key"], "role_name": row["role_name"],
            "task_evidence": row["role_description"],
            "esco_uri": (row.get("esco_occupation_uris") or [None])[0],
            "onet_codes": row.get("onet_occupation_codes", []),
            "domain_fit": fit, "rationale": rationale, "source_refs": refs,
        })
    tally = Counter(item["domain_fit"] for item in decisions)
    payload = {
        "schema_version": "2026-10-05.role-domain-fit-lane.v1",
        "audit_date": date.today().isoformat(),
        "domain_id": "D147", "domain_name": rows[0]["domain_name"],
        "scope": rows[0]["domain_scope"],
        "method": "Compare exact role duties against industrial process and factory automation: sensing/instrumentation, regulation and control, PLC/SCADA/DCS, production-line automation, control-room operation and industrial robotics. Titles/subgroup membership alone do not establish fit. Treat education and cross-sector engineering as conditional when the task is relevant but not direct industrial practice; distinguish residential building automation from industrial automation.",
        "counts": {
            "mappings_reviewed": len(decisions), "supported": tally[S],
            "conditional": tally[C], "unsupported_for_domain": tally[U],
            "unresolved": tally["unresolved"],
        },
        "decisions": decisions, "sources": SOURCES,
        "notes": [
            "All exact D147 queue roles were assessed from recorded task text; subgroup membership and title similarity were not treated as proof.",
            "Industrial automation includes both continuous/process industries and discrete manufacturing; residential smart-home integration is a distinct building-automation context and is not treated as a fit to this parent.",
            "Vocational teaching and broad mechatronics remain conditional because the recorded tasks do not establish direct industrial-control practice as the role's defining work.",
            "No role-to-specialization assignment, student-path recommendation or canonical taxonomy/mapping change is made.",
        ],
    }
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# D147 role-to-parent-domain fit review — 2026-10-05", "",
        f"Scope: {payload['scope']}", "",
        f"- Exact queued roles reviewed: **{len(decisions)}**",
        f"- Supported: **{tally[S]}**", f"- Conditional: **{tally[C]}**",
        f"- Unsupported for this parent: **{tally[U]}**",
        f"- Unresolved: **{tally['unresolved']}**", "",
        "| Exact role key | Recorded task evidence | Parent fit | Reason |",
        "|---|---|---|---|",
    ]
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

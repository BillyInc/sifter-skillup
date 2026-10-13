"""Exact-queue D131 role-to-parent-domain fit review generator.

This is an audit artifact only. It does not assign roles to specializations or
change canonical role/domain data.
"""

from __future__ import annotations

import json
from collections import Counter
from datetime import date
from pathlib import Path

LANE = Path(__file__).resolve().parent
QUEUE = LANE / "D085_D168_role_fit_queue_2026_10_05.json"
OUT_JSON = LANE / "D131_role_domain_fit_review_2026_10_05.json"
OUT_MD = LANE / "D131_role_domain_fit_review_2026_10_05.md"

SOURCES = {
    "QUEUE_TASK_PROFILE": {
        "publisher": "Checked-in role/domain audit queue",
        "url": "D085_D168_role_fit_queue_2026_10_05.json",
        "locator": "Exact D131 role_key and task description for each row.",
        "supports": "The specific recorded duties being evaluated.",
        "limit": "This is the project's stored occupation evidence, not an independent taxonomy authority.",
    },
    "ESCO_TASK_PROFILE": {
        "publisher": "European Commission, ESCO",
        "url": "https://esco.ec.europa.eu/en/classification/occupation_main",
        "locator": "Each row retains its exact ESCO occupation URI in esco_uri; use that URI to identify the linked task profile.",
        "supports": "Role-specific occupational task descriptions used alongside the queue evidence.",
        "limit": "ESCO describes occupations; it does not determine whether an occupation belongs to Sifter's motorsport-specific parent domain.",
    },
    "FIA_MOTORSPORT_CAREERS": {
        "publisher": "Fédération Internationale de l'Automobile (FIA)",
        "url": "https://www.fia.com/careers-motor-sport",
        "locator": "FIA careers-in-motorsport engineering career brochure and linked resources.",
        "supports": "Engineering disciplines such as mechanical, aerospace, civil and electrical engineering can be applied in motorsport; this establishes a possible industry context, not automatic fit for every role in those disciplines.",
        "limit": "Career guidance is broad and does not establish that a specific generic engineering task is performed in racing or high-performance vehicle work.",
    },
    "FIA_TECHNICAL_REGULATIONS": {
        "publisher": "Fédération Internationale de l'Automobile (FIA)",
        "url": "https://www.fia.com/regulation/category/110/technical-regulations",
        "locator": "FIA Formula One technical-regulation collection; engineering is tied to designing components for manufacture and proving suitability for track use.",
        "supports": "The parent domain's motorsport/high-performance vehicle boundary and vehicle-component engineering context.",
        "limit": "A technical rulebook is not a job taxonomy and cannot prove that a generic role performs motorsport work.",
    },
}

# Fit is based on the actual task described, not the role title, ISCO group,
# subgroup membership, or mere possibility of working in a racing team.
DECISIONS = {
    "aerodynamics engineer": ("conditional", "The recorded task concerns aerodynamics of transport equipment and engine components, but does not establish competition or high-performance vehicle work. FIA identifies aerodynamics/engineering as a motorsport application; retain conditional until the actual role context is motorsport-specific."),
    "aerospace engineer": ("unsupported_for_domain", "The recorded work develops and tests aircraft, missiles and spacecraft. That is aerospace engineering, not the D131 parent scope of high-performance motor vehicles."),
    "automotive engineer": ("conditional", "The task directly concerns motor-vehicle design and manufacture, so it is adjacent to the parent; it does not distinguish motorsport/high-performance vehicle engineering from ordinary automotive engineering."),
    "computer hardware engineering technician": ("conditional", "The task builds and maintains computer hardware. Such hardware may support vehicle systems, but the recorded duties do not tie it to motor vehicles or motorsport."),
    "computer hardware test technician": ("unsupported_for_domain", "The task tests general computer hardware and electronic components; no vehicle, powertrain, racing or motorsport context is present."),
    "electronics engineering technician": ("conditional", "The task develops, builds, tests and maintains electronic devices. Vehicle electronics are plausible, but this record does not establish a motor-vehicle application."),
    "electronics production supervisor": ("unsupported_for_domain", "The task supervises electronics production generally; it does not identify vehicle or motorsport products."),
    "engine designer": ("conditional", "The task designs mechanical equipment and engines broadly. A vehicle engine can fit D131, but the task does not identify automotive or high-performance engines."),
    "equipment engineer": ("conditional", "The task designs and maintains manufacturing-facility equipment. This may support vehicle production, but the record does not establish that sector or a motorsport application."),
    "fluid power engineer": ("conditional", "The task designs and tests fluid-power equipment. Vehicle hydraulic systems are plausible, but the task is not tied to a vehicle or race application."),
    "industrial assembly supervisor": ("conditional", "The task coordinates industrial assembly operations generally. It fits only when the assembly line produces relevant high-performance vehicles or components, which this record does not establish."),
    "industrial tool design engineer": ("unsupported_for_domain", "The task designs general industrial tools for customer and manufacturing needs, without a motor-vehicle or motorsport connection."),
    "instrumentation engineering technician": ("conditional", "The task builds and tests process-control instrumentation. Vehicle instrumentation is possible, but the recorded application is not motorsport-specific."),
    "machine operator supervisor": ("conditional", "The task supervises machine operators and production flow generally. The record does not identify vehicle/component production or motorsport engineering."),
    "machinery assembly supervisor": ("conditional", "The task supervises machinery assembly generally. A vehicle-production application is possible but is not stated in the task evidence."),
    "mechanical engineer": ("conditional", "The task covers mechanical products and systems broadly. Mechanical engineering is a recognized route into motorsport, but the actual task profile does not identify high-performance vehicles."),
    "mechatronics engineer": ("conditional", "The task combines mechanical, electronic, computing and control engineering across intelligent products. Vehicle systems are plausible, but the task does not establish a motorsport application."),
    "motor vehicle assembly supervisor": ("conditional", "The task directly supervises motor-vehicle manufacturing, but does not distinguish ordinary vehicle assembly from high-performance or competition vehicles."),
    "powertrain engineer": ("conditional", "The task explicitly covers automotive propulsion, vehicle components, electronics and software. It is close to D131, but does not specify high-performance or competition vehicles."),
    "precision engineer": ("conditional", "The task designs high-tolerance, repeatable engineering processes and equipment. Precision is relevant to motorsport engineering, but the task does not identify vehicle components or racing use."),
    "precision mechanics supervisor": ("unsupported_for_domain", "The task supervises fitting small measuring/control mechanisms generally. No motor-vehicle or motorsport engineering work is established."),
    "production supervisor": ("conditional", "The task directs manufacturing and production processes broadly. D131 includes vehicle manufacturing, but this record does not identify the products or a motorsport setting."),
    "sensor engineering technician": ("conditional", "The task develops, tests and maintains sensor systems. Sensors are used in vehicle engineering, but the task profile does not specify vehicles or motorsport."),
    "software developer": ("unsupported_for_domain", "The recorded task is general software implementation. Vehicle-control, simulation, telemetry or motorsport software work is not stated, so software development alone does not establish D131 fit."),
    "tooling engineer": ("conditional", "The task designs and maintains manufacturing tools. Tooling may support vehicle production, but the record does not tie it to motorsport or high-performance vehicles."),
    "welding engineer": ("conditional", "The task develops welding methods/equipment and quality procedures, a process explicitly relevant to engineering manufacture; the record does not identify vehicle structures or motorsport use."),
}


def main() -> None:
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    rows = [row for row in queue["unresolved_rows"] if row["domain_id"] == "D131"]
    actual_names = [row["role_name"] for row in rows]
    if len(actual_names) != len(set(actual_names)) or set(actual_names) != set(DECISIONS):
        raise SystemExit(
            f"D131 exact role-name mismatch: missing={sorted(set(actual_names)-set(DECISIONS))}; "
            f"extra={sorted(set(DECISIONS)-set(actual_names))}"
        )

    decisions = []
    for row in sorted(rows, key=lambda value: value["role_key"]):
        fit, rationale = DECISIONS[row["role_name"]]
        decisions.append({
            "role_key": row["role_key"],
            "role_name": row["role_name"],
            "task_evidence": row["role_description"],
            "esco_uri": (row.get("esco_occupation_uris") or [None])[0],
            "onet_codes": row.get("onet_occupation_codes", []),
            "domain_fit": fit,
            "rationale": rationale,
            "source_refs": ["QUEUE_TASK_PROFILE", "ESCO_TASK_PROFILE", "FIA_MOTORSPORT_CAREERS", "FIA_TECHNICAL_REGULATIONS"],
        })

    counts = Counter(item["domain_fit"] for item in decisions)
    payload = {
        "schema_version": "2026-10-05.role-domain-fit-lane.v1",
        "audit_date": date.today().isoformat(),
        "domain_id": "D131",
        "domain_name": rows[0]["domain_name"],
        "scope": rows[0]["domain_scope"],
        "method": "Compare each exact task profile with the parent scope: mechanical/production engineering applied to high-performance vehicles, including powertrain, composites, welding, fluid power, aerodynamics, vehicle systems, component testing and vehicle manufacturing. Generic engineering is not treated as motorsport work solely because it could be used by a racing team. No role title, ISCO/subgroup membership or role-to-specialization inference establishes fit.",
        "counts": {
            "mappings_reviewed": len(decisions),
            "supported": counts["supported"],
            "conditional": counts["conditional"],
            "unsupported_for_domain": counts["unsupported_for_domain"],
            "unresolved": counts["unresolved"],
        },
        "decisions": decisions,
        "sources": SOURCES,
        "notes": [
            "The role's stored task description is the fit evidence; ESCO URI and O*NET codes are retained as source locators/context, not treated as automatic fit labels.",
            "FIA material confirms that engineering disciplines can be applied in motorsport, but does not prove a generic occupation's motorsport task context.",
            "Conditional means the occupation's tasks could fit if the actual work is in high-performance/motorsport vehicles; the current task record does not establish that context.",
            "No role-to-specialization assignment, student-path recommendation or canonical taxonomy/mapping change is made.",
        ],
    }
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# D131 role-to-parent-domain fit review — 2026-10-05", "",
        f"Scope: {payload['scope']}", "",
        f"- Exact queued roles reviewed: **{len(decisions)}**",
        f"- Supported: **{payload['counts']['supported']}**",
        f"- Conditional: **{payload['counts']['conditional']}**",
        f"- Unsupported for this parent: **{payload['counts']['unsupported_for_domain']}**",
        f"- Unresolved: **{payload['counts']['unresolved']}**", "",
        "| Exact role key | Recorded task evidence | Parent fit | Reason |", "|---|---|---|---|",
    ]
    for item in decisions:
        task = item["task_evidence"].replace("|", "\\|").replace("\n", " ")
        reason = item["rationale"].replace("|", "\\|").replace("\n", " ")
        lines.append(f"| `{item['role_key']}` | {task} | {item['domain_fit']} | {reason} |")
    lines += ["", "## Sources and limitations", ""]
    for source_id, source in SOURCES.items():
        lines.append(f"- **{source_id} — {source['publisher']}:** [{source['url']}]({source['url']}). {source['locator']} Supports: {source['supports']} Limit: {source['limit']}")
    lines += ["", "## Audit notes", ""] + [f"- {note}" for note in payload["notes"]]
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()

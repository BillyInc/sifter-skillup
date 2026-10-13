import json
from collections import Counter
from datetime import date
from pathlib import Path


LANE = Path(__file__).resolve().parent
QUEUE = LANE / "D085_D168_role_fit_queue_2026_10_05.json"
OUT_JSON = LANE / "D146_role_domain_fit_review_2026_10_05.json"
OUT_MD = LANE / "D146_role_domain_fit_review_2026_10_05.md"

SOURCES = {
    "QUEUE_TASK_PROFILE": {
        "publisher": "Checked-in role/domain audit queue",
        "url": "D085_D168_role_fit_queue_2026_10_05.json",
        "locator": "Exact D146 role_key, parent scope and stored task descriptions.",
        "supports": "The specific duties evaluated for each D146 link.",
        "limit": "This is the record under audit, not independent confirmation of an occupation's full scope.",
    },
    "CIBSE_BUILDING_SERVICES_SCOPE": {
        "publisher": "Chartered Institution of Building Services Engineers (CIBSE)",
        "url": "https://www.cibse.org/membership-registration/join-cibse/student/what-is-building-services/",
        "locator": "Building-services overview: mechanical/electrical building systems, including heating, ventilation, air conditioning and fire detection/protection.",
        "supports": "The parent-domain boundary for building HVAC, building electrical services and fire-protection systems.",
        "limit": "Professional-body scope guidance; it does not establish that every broadly titled engineer works in building services.",
    },
    "CIBSE_TECHNICAL_GUIDES": {
        "publisher": "Chartered Institution of Building Services Engineers (CIBSE)",
        "url": "https://www.cibse.org/knowledge-research/knowledge-resources/engineering-guidance/cibse-guides",
        "locator": "Guide B (heating, ventilation, air conditioning and refrigeration), Guide E (fire safety), Guide H (building control systems), Guide K (electricity in buildings), Guide G (public health/plumbing).",
        "supports": "The distinct technical systems that fall within the building-services field.",
        "limit": "Guide titles define subject coverage, not occupational licensing or jurisdiction-specific competency.",
    },
    "CIBSE_INTRO_M_AND_E": {
        "publisher": "Chartered Institution of Building Services Engineers (CIBSE)",
        "url": "https://www.cibse.org/training/search-courses/introduction-to-mechanical-electrical-building-services/",
        "locator": "Course overview: mechanical services (HVAC and controls), electrical services, fire safety and sustainability engineering.",
        "supports": "The integrated mechanical/electrical/fire-safety systems interpretation of the parent domain.",
        "limit": "Training overview; not a rule that every electrical or mechanical engineer belongs to this domain.",
    },
    "ONET_HVAC_MECHANICS": {
        "publisher": "U.S. Department of Labor, O*NET OnLine",
        "url": "https://www.onetonline.org/link/details/49-9021.00",
        "locator": "Occupation summary and tasks for Heating, Air Conditioning, and Refrigeration Mechanics and Installers.",
        "supports": "Installation, repair, service and maintenance tasks for HVAC/refrigeration mechanics.",
        "limit": "U.S. occupational profile; used to corroborate the task family, not local licensing or a universal job definition.",
    },
    "ASHRAE_TERMINOLOGY": {
        "publisher": "American Society of Heating, Refrigerating and Air-Conditioning Engineers (ASHRAE)",
        "url": "https://ashrae.org/technical-resources/authoring-tools/terminology",
        "locator": "Technical terminology coverage includes HVAC&R and built-environment systems, including electrical, lighting, water and energy use.",
        "supports": "The technical distinction between building HVAC&R and unrelated supply-chain or general power-generation work.",
        "limit": "Terminology reference, not an occupational classification or licensing standard.",
    },
    "KNX_BUILDING_AUTOMATION": {
        "publisher": "KNX Association",
        "url": "https://www.knx.org/explore-knx/what-is-knx",
        "locator": "Overview of integrated home/building automation: lighting, heating, shading, security and energy management.",
        "supports": "The building-automation component of smart-home engineering when the role integrates building systems.",
        "limit": "Technology-association description; supports system scope, not the title's full professional scope or a credential requirement.",
    },
}

S = "supported"
C = "conditional"
U = "unsupported_for_domain"

DECISIONS = {
    "Heating, Air Conditioning, and Refrigeration Mechanics and Installers": (
        S,
        "Installs or repairs HVAC and refrigeration equipment, a direct building mechanical-services task family. The O*NET source corroborates the task profile; it does not imply jurisdiction-specific licensing.",
        ["QUEUE_TASK_PROFILE", "CIBSE_BUILDING_SERVICES_SCOPE", "CIBSE_TECHNICAL_GUIDES", "ONET_HVAC_MECHANICS"],
    ),
    "electrical engineer": (
        C,
        "The recorded work spans electrical equipment, motors, power stations and distribution. Building electrical design/maintenance is within the parent, but this task record is broader and does not establish a building-services focus.",
        ["QUEUE_TASK_PROFILE", "CIBSE_TECHNICAL_GUIDES", "CIBSE_INTRO_M_AND_E"],
    ),
    "electromechanical engineer": (
        C,
        "The available task text describes mixed mechanical/electrical machinery design and testing but is cut off and does not establish a building-systems context. Retain only as conditional pending fuller task evidence.",
        ["QUEUE_TASK_PROFILE", "CIBSE_BUILDING_SERVICES_SCOPE", "CIBSE_INTRO_M_AND_E"],
    ),
    "fire protection technician": (
        S,
        "Installs, inspects, maintains and repairs alarms, detection and sprinkler/fire-protection systems in facilities, directly matching the parent's explicit fire-protection systems scope.",
        ["QUEUE_TASK_PROFILE", "CIBSE_BUILDING_SERVICES_SCOPE", "CIBSE_TECHNICAL_GUIDES"],
    ),
    "hardware, plumbing and heating equipment and supplies distribution manager": (
        U,
        "Plans distribution of equipment and supplies to points of sale. This is a commercial distribution function, not design, installation, operation or maintenance of building services.",
        ["QUEUE_TASK_PROFILE", "CIBSE_BUILDING_SERVICES_SCOPE"],
    ),
    "heating and ventilation service installer": (
        S,
        "Installs and maintains heating, ventilation and refrigeration equipment, including furnaces, thermostats, ducts and vents; these are direct mechanical building-services tasks.",
        ["QUEUE_TASK_PROFILE", "CIBSE_BUILDING_SERVICES_SCOPE", "CIBSE_TECHNICAL_GUIDES", "ONET_HVAC_MECHANICS"],
    ),
    "heating technician": (
        C,
        "Installs and maintains heating/ventilation equipment, but the record explicitly spans stand-alone systems and machinery/transport equipment. Building-services work is a valid subset, not established as the whole role.",
        ["QUEUE_TASK_PROFILE", "CIBSE_BUILDING_SERVICES_SCOPE", "CIBSE_TECHNICAL_GUIDES"],
    ),
    "heating, ventilation, air conditioning (and refrigeration) drafter": (
        C,
        "Drafts HVAC&R systems for projects generally. The systems align technically, but the task says they may be used in all kinds of projects and does not specifically anchor this record to buildings.",
        ["QUEUE_TASK_PROFILE", "CIBSE_BUILDING_SERVICES_SCOPE", "CIBSE_TECHNICAL_GUIDES"],
    ),
    "heating, ventilation, air conditioning and refrigeration engineering technician": (
        S,
        "Supports design of HVAC&R devices specifically for buildings and checks environmental compliance and safety; direct building-services engineering support.",
        ["QUEUE_TASK_PROFILE", "CIBSE_BUILDING_SERVICES_SCOPE", "CIBSE_TECHNICAL_GUIDES"],
    ),
    "heating, ventilation, air conditioning engineer": (
        S,
        "Designs HVAC&R systems for residences, offices and commercial buildings. The record also mentions manufacturing sites, but its explicit building applications directly match the parent scope.",
        ["QUEUE_TASK_PROFILE", "CIBSE_BUILDING_SERVICES_SCOPE", "CIBSE_TECHNICAL_GUIDES", "ASHRAE_TERMINOLOGY"],
    ),
    "import export manager in hardware, plumbing and heating equipment and supplies": (
        U,
        "Coordinates cross-border business procedures and parties. The record describes trade administration, not building-services engineering or system work.",
        ["QUEUE_TASK_PROFILE", "CIBSE_BUILDING_SERVICES_SCOPE"],
    ),
    "import export specialist in hardware, plumbing and heating equipment": (
        U,
        "Applies product knowledge to customs clearance and import/export documentation. This is trade/compliance work rather than building-services system design, installation or maintenance.",
        ["QUEUE_TASK_PROFILE", "CIBSE_BUILDING_SERVICES_SCOPE"],
    ),
    "smart home engineer": (
        S,
        "Designs, integrates and tests home automation spanning HVAC, lighting, shading, security and safety. Those are explicitly building-system and automation functions in the parent scope. The stored description is truncated, so this disposition is limited to its recorded tasks.",
        ["QUEUE_TASK_PROFILE", "CIBSE_BUILDING_SERVICES_SCOPE", "CIBSE_TECHNICAL_GUIDES", "KNX_BUILDING_AUTOMATION"],
    ),
}


def main() -> None:
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    rows = [row for row in queue["unresolved_rows"] if row["domain_id"] == "D146"]
    names = [row["role_name"] for row in rows]
    if not rows or len(names) != len(set(names)) or set(names) != set(DECISIONS):
        raise SystemExit(f"D146 exact queue mismatch: queued={sorted(names)} decided={sorted(DECISIONS)}")
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
        "domain_id": "D146", "domain_name": rows[0]["domain_name"],
        "scope": rows[0]["domain_scope"],
        "method": "Compare each exact role task with the parent's stated building mechanical/electrical systems scope: HVAC&R, fire protection, building controls/automation and electrical services. A role title or subgroup placement is not evidence. Broad roles are conditional where building-services duties are plausible but not established; supply-chain/trade tasks are unsupported for this parent.",
        "counts": {
            "mappings_reviewed": len(decisions), "supported": tally[S],
            "conditional": tally[C], "unsupported_for_domain": tally[U],
            "unresolved": tally["unresolved"],
        },
        "decisions": decisions, "sources": SOURCES,
        "notes": [
            "All exact D146 queue roles were assessed from their recorded task text; no fit was inferred from subgroup membership or role title.",
            "Electrical and electromechanical engineering are broad occupations; this review does not equate all power-station, motor or machinery work with building services.",
            "The electromechanical-engineer and smart-home-engineer queue descriptions are truncated; conditional/support conclusions are limited to the recorded text and should be revisited if full task records become available.",
            "No role-to-specialization assignment, student-path recommendation, or canonical taxonomy/mapping change is made.",
        ],
    }
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# D146 role-to-parent-domain fit review — 2026-10-05", "",
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

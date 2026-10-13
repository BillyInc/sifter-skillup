"""Exact-key D100 role-to-parent-domain audit report generator."""

from __future__ import annotations

import json
from collections import Counter
from datetime import date
from pathlib import Path


LANE = Path(__file__).resolve().parent
QUEUE = LANE / "D085_D168_role_fit_queue_2026_10_05.json"
OUT_JSON = LANE / "D100_role_domain_fit_review_2026_10_05.json"
OUT_MD = LANE / "D100_role_domain_fit_review_2026_10_05.md"

SOURCES = {
    "QUEUE_TASK_PROFILE": {
        "publisher": "Checked-in role/domain lane queue",
        "url": "D085_D168_role_fit_queue_2026_10_05.json",
        "locator": "Exact D100 role_key, role_description and ESCO URI for each decision.",
        "supports": "Task evidence compared with the domain's displayed scope.",
        "limit": "The queue has no canonical D100 domain-description text; the explicit domain title is used as the scope boundary, and ambiguous infrastructure/industrial edges remain conditional.",
    },
    "ESCO_CHECKED_IN_TASK_PROFILE": {
        "publisher": "European Commission, ESCO, and linked source profiles in the lane queue",
        "url": "https://esco.ec.europa.eu/en/classification/occupation-main",
        "locator": "Exact occupation URIs retained per role in the queue.",
        "supports": "Stored task descriptions used for the role-task comparison.",
        "limit": "Stored task descriptions establish role tasks, not Sifter-domain fit on their own; pages were not independently refetched for this pass.",
    },
    "WORLDSKILLS_PLUMBING_HEATING": {
        "publisher": "WorldSkills International",
        "url": "https://worldskills.org/what/projects/wsos/2024/events/579/skills/1687/",
        "locator": "Plumbing and Heating WSOS: pipework, hot/cold water, heating, gas, wastewater, rainwater/greywater and heat-pump systems; installation and testing.",
        "supports": "International occupational context for plumbing, pipefitting, building climate and domestic wastewater tasks.",
        "limit": "International occupational standard, not a universal licensing rule or proof that every municipal network role belongs in D100.",
    },
    "ILO_ISCO_7126_7127": {
        "publisher": "International Labour Organization",
        "url": "https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf",
        "locator": "ISCO-08 unit groups 7126 Plumbers and Pipe Fitters and 7127 Air Conditioning and Refrigeration Mechanics.",
        "supports": "Global occupational context distinguishing plumbing/pipe fitting and climate-system trades.",
        "limit": "Classification context only; neither ISCO membership nor its labels determine any disposition here.",
    },
    "WORLDSKILLS_LANDSCAPE_IRRIGATION": {
        "publisher": "WorldSkills International",
        "url": "https://worldskills.org/what/projects/wsos/2024/events/579/skills/1713/",
        "locator": "Landscape Gardening occupational standard and work description, including landscape installation and irrigation work.",
        "supports": "Context that irrigation is also a distinct landscape/agricultural system task rather than inherently building plumbing.",
        "limit": "Does not classify every irrigation occupation; D100 exclusions rely on the queued role tasks specifying soil/agricultural irrigation.",
    },
    "SKILLS_ENGLAND_WATER_NETWORK": {
        "publisher": "Skills England",
        "url": "https://skillsengland.education.gov.uk/media/skap43cv/st0898-water-network-operative-l2-standard.pdf",
        "locator": "Water Network Operative occupational standard.",
        "supports": "Corroborates water-network operation as a distinct network-infrastructure work context.",
        "limit": "England-specific apprenticeship standard; used only as contextual corroboration, not a global taxonomy authority.",
    },
}

DECISIONS = {
    "bathroom fitter": ("supported", "Installs bathroom fixtures and connects water, gas, sewage and electrical services; the plumbing/heating standard explicitly covers building plumbing, pipework and wastewater systems.", ["WORLDSKILLS_PLUMBING_HEATING"]),
    "drain technician": ("supported", "Installs, maintains and repairs drainage pipes and valves in sewer systems; this is wastewater pipework, which the plumbing/heating scope explicitly includes.", ["WORLDSKILLS_PLUMBING_HEATING"]),
    "gas service technician": ("supported", "Installs and maintains gas appliances and systems in buildings/facilities and tests for faults or leaks; this directly fits building plumbing and climate-service systems.", ["WORLDSKILLS_PLUMBING_HEATING"]),
    "heating and ventilation service installer": ("supported", "Installs and maintains heating/refrigeration equipment, ducts, vents and controlled-air systems; heating and building climate systems are explicit in the parent title and international trade standard.", ["WORLDSKILLS_PLUMBING_HEATING", "ILO_ISCO_7126_7127"]),
    "heating technician": ("conditional", "The task includes heating/ventilation systems but also equipment built into machinery and transport; the record does not separate building-system work from those distinct contexts.", ["WORLDSKILLS_PLUMBING_HEATING", "ILO_ISCO_7126_7127"]),
    "irrigation system installer": ("unsupported_for_domain", "Builds soil-irrigation infrastructure, usually for agriculture; the task is agricultural irrigation rather than plumbing, pipefitting or building climate systems.", ["WORLDSKILLS_LANDSCAPE_IRRIGATION"]),
    "irrigation technician": ("unsupported_for_domain", "Installs, repairs and maintains sprinklers and pipes specifically for irrigation systems; the task profile gives environmental compliance, not building plumbing or climate-system work.", ["WORLDSKILLS_LANDSCAPE_IRRIGATION"]),
    "pipeline maintenance worker": ("conditional", "Maintains pipelines and addresses corrosion, but the stored tasks do not identify building-service pipework versus broader industrial or utility pipelines.", ["WORLDSKILLS_PLUMBING_HEATING", "SKILLS_ENGLAND_WATER_NETWORK"]),
    "plumber": ("supported", "Installs and repairs water, gas and sewage systems, cuts and fits pipes, tests systems and installs sanitary equipment; this is a direct match to plumbing and pipefitting.", ["WORLDSKILLS_PLUMBING_HEATING", "ILO_ISCO_7126_7127"]),
    "septic tank servicer": ("supported", "Cleans, maintains and repairs septic systems; the task is wastewater/sanitation-system maintenance, within the plumbing standard's stated wastewater scope.", ["WORLDSKILLS_PLUMBING_HEATING"]),
    "sewer construction worker": ("conditional", "Installs watertight sewer pipes from structures toward waterways or treatment facilities. Pipefitting/wastewater fit is plausible, but the profile is municipal civil infrastructure rather than clearly building-service installation.", ["WORLDSKILLS_PLUMBING_HEATING", "SKILLS_ENGLAND_WATER_NETWORK"]),
    "sewerage network operative": ("conditional", "Maintains sewer mains, pumping stations and network pipes. The task concerns municipal utility networks, not clearly building plumbing; the missing domain description prevents a firmer boundary decision.", ["WORLDSKILLS_PLUMBING_HEATING", "SKILLS_ENGLAND_WATER_NETWORK"]),
    "sprinkler fitter": ("supported", "Fits and tests water-filled fire-protection pipework and accessories in buildings; the core task is building pipe installation and testing.", ["WORLDSKILLS_PLUMBING_HEATING"]),
    "water conservation technician": ("supported", "Installs systems to recover, filter, store and distribute rainwater and domestic greywater; these are building water-conservation systems explicitly reflected in plumbing/heating practice.", ["WORLDSKILLS_PLUMBING_HEATING"]),
    "water network operative": ("conditional", "Maintains water-supply and wastewater mains, pipes and pumping stations. This is utility-network infrastructure; without a D100 parent description clarifying whether public networks are included, fit remains conditional.", ["WORLDSKILLS_PLUMBING_HEATING", "SKILLS_ENGLAND_WATER_NETWORK"]),
}


def main() -> None:
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    rows = [row for row in queue["unresolved_rows"] if row["domain_id"] == "D100"]
    actual = {row["role_name"] for row in rows}
    if len(rows) != len(actual) or actual != set(DECISIONS):
        raise SystemExit(f"D100 exact-key mismatch: missing={sorted(actual-set(DECISIONS))}; extra={sorted(set(DECISIONS)-actual)}")
    decisions = []
    for row in sorted(rows, key=lambda value: value["role_key"]):
        fit, rationale, contextual = DECISIONS[row["role_name"]]
        decisions.append({
            "role_key": row["role_key"],
            "role_name": row["role_name"],
            "task_evidence": row["role_description"],
            "esco_uri": (row.get("esco_occupation_uris") or [None])[0],
            "domain_fit": fit,
            "rationale": rationale,
            "source_refs": ["QUEUE_TASK_PROFILE", "ESCO_CHECKED_IN_TASK_PROFILE", *contextual],
        })
    counts = Counter(item["domain_fit"] for item in decisions)
    payload = {
        "schema_version": "2026-10-05.role-domain-fit-lane.v1",
        "audit_date": date.today().isoformat(),
        "domain_id": "D100",
        "domain_name": rows[0]["domain_name"],
        "scope": "Role-task fit against the displayed parent-domain title only; no subgroup or specialization assignment.",
        "method": "Match each exact D100 queue key's stored task description to Plumbing, Pipefitting and Building Climate Systems. Titles and ISCO/subgroup membership are not fit evidence. `conditional` marks a real pipe/heating overlap whose building-versus-network/industrial context is not resolved by the available parent description; `unsupported_for_domain` is reserved for the described agricultural irrigation task.",
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
            "All 15 queue role keys are required and checked exactly before this report is written.",
            "The queue provides no canonical D100 domain-description text. The displayed domain title is the only available Sifter scope statement; five infrastructure/industrial boundary roles remain conditional for that reason.",
            "ILO/ISCO is contextual only and did not determine any role fit. WorldSkills and Skills England sources corroborate task-sector boundaries but do not establish Sifter taxonomy membership.",
            "No role-to-specialization assignment, student-visibility decision or canonical taxonomy/mapping edit is made.",
        ],
    }
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# D100 role-to-parent-domain fit review — 2026-10-05", "",
        "Scope: role-task fit against the displayed parent-domain title only; no subgroup or specialization assignment.", "",
        f"- Exact queued roles reviewed: **{len(decisions)}**",
        f"- Supported: **{payload['counts']['supported']}**",
        f"- Conditional: **{payload['counts']['conditional']}**",
        f"- Unsupported for this parent: **{payload['counts']['unsupported_for_domain']}**",
        f"- Unresolved: **{payload['counts']['unresolved']}**", "",
        "> **Scope limitation:** the queue contains no D100 domain-description text. Decisions compare actual task descriptions with the explicit title only. Municipal-network and machinery/transport boundary cases remain conditional rather than being silently treated as building work.", "",
        "| Exact role key | Checked-in task description | Fit | Why |", "|---|---|---|---|",
    ]
    for item in decisions:
        task = item["task_evidence"].replace("|", "\\|").replace("\n", " ")
        lines.append(f"| `{item['role_key']}` | {task} | **{item['domain_fit']}** | {item['rationale']} |")
    lines += ["", "Sources contextualize occupational tasks; they do not replace the exact role-task comparison. The stored ESCO-linked text was not independently refetched in this pass. No canonical data changed.", ""]
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps(payload["counts"], indent=2))


if __name__ == "__main__":
    main()

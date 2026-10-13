"""Exact-queue D134 role-to-parent-domain fit review generator."""

from __future__ import annotations

import json
from collections import Counter
from datetime import date
from pathlib import Path

LANE = Path(__file__).resolve().parent
QUEUE = LANE / "D085_D168_role_fit_queue_2026_10_05.json"
OUT_JSON = LANE / "D134_role_domain_fit_review_2026_10_05.json"
OUT_MD = LANE / "D134_role_domain_fit_review_2026_10_05.md"

SOURCES = {
    "QUEUE_TASK_PROFILE": {"publisher": "Checked-in role/domain audit queue", "url": "D085_D168_role_fit_queue_2026_10_05.json", "locator": "Exact D134 role_key and task description for every disposition.", "supports": "The role duties compared against naval-architecture/marine-engineering scope.", "limit": "Stored task text is not an independent occupational authority."},
    "ESCO_TASK_PROFILE": {"publisher": "European Commission, ESCO", "url": "https://esco.ec.europa.eu/en/classification/occupation_main", "locator": "Each decision retains its exact ESCO occupation URI where present.", "supports": "Role-specific marine occupation task descriptions.", "limit": "ESCO labels and hierarchy do not determine the fit decision."},
    "IMO_SHIP_DESIGN": {"publisher": "International Maritime Organization (IMO)", "url": "https://www.imo.org/en/ourwork/safety/pages/shipdesignandstability-default.aspx", "locator": "Ship Design and Stability page: design/construction, hull, machinery, electrical installations, materials testing, survey and certification are distinct ship-safety/design functions.", "supports": "Global scope of vessel design, construction, machinery and marine systems.", "limit": "Regulatory remit corroborates the parent boundary; it is not a role taxonomy."},
    "IMO_STCW_F": {"publisher": "International Maritime Organization (IMO)", "url": "https://www.imo.org/en/OurWork/HumanElement/Pages/STCW-F-Convention.aspx", "locator": "STCW-F applies to seagoing fishing-vessel personnel and includes engineer officers, training and watchkeeping provisions.", "supports": "Fishing-vessel engine-department work is a recognized marine-engineering context.", "limit": "Applicability thresholds and implementation are treaty-specific; used as occupational-context evidence, not individual certification advice."},
    "IRENA_OFFSHORE_RENEWABLES": {"publisher": "International Renewable Energy Agency (IRENA)", "url": "https://www.irena.org/Digital-Report/Offshore-Renewables-Toolkit", "locator": "Offshore-renewables toolkit describes offshore energy deployment, foundations, installation, access, operations and system integration.", "supports": "The offshore-energy-installation component of the D134 scope.", "limit": "Supports the sector context, not every offshore-energy job's fit to ship engineering."},
}

DECISIONS = {
    "desalination technician": ("unsupported_for_domain", "Operates and maintains desalination plant equipment, but the task record does not establish shipboard or offshore-structure work; a water-treatment plant is not by itself naval architecture or marine engineering."),
    "fisheries engineering technician": ("supported", "Maintains and repairs machinery and refrigeration equipment in the fish hold aboard fishing vessels; direct vessel engineering-system work."),
    "marine biologist": ("unsupported_for_domain", "Studies marine organisms and ecosystems; marine setting alone does not make this naval architecture or marine-engineering work."),
    "marine cargo inspector": ("conditional", "Inspects cargo and documentation and also examines vessel capability, fuel compartments and safety equipment. The task touches vessel technical condition but does not establish design, construction or machinery-engineering duties."),
    "marine chief engineer": ("supported", "Leads vessel technical operations and the engine department; directly matches marine machinery and systems operation."),
    "marine electrician": ("supported", "Installs, diagnoses, repairs and maintains electrical/electronic systems aboard vessels; direct marine systems work."),
    "marine electronics technician": ("supported", "Installs and repairs electronic systems and equipment in vessels; direct vessel engineering-system work."),
    "marine engineer": ("supported", "Designs, builds, maintains and repairs vessel hull, machinery, electrical and auxiliary systems across boat and ship types; directly matches the parent."),
    "marine engineering drafter": ("supported", "Turns marine-engineering designs into drawings used to manufacture vessels; direct design-to-build support."),
    "marine engineering technician": ("supported", "Supports design, development, manufacture, testing, installation and maintenance of boats and ships; direct marine engineering work."),
    "marine firefighter": ("unsupported_for_domain", "Responds to fires and hazards in marine environments, but emergency response is not naval architecture or marine-engineering work."),
    "marine fitter": ("supported", "Fabricates and assembles vessel structural components including hulls, superstructures and engine rooms; direct shipbuilding work."),
    "marine mechanic": ("supported", "Maintains and repairs vessel engines and machinery such as boilers and generators; direct marine machinery work."),
    "mechanical engineer": ("conditional", "The task covers mechanical products and systems broadly. It fits D134 when applied to ship/offshore machinery, but the exact record does not identify a marine application."),
    "metallurgical technician": ("unsupported_for_domain", "Supports research on minerals, metals, alloys and extraction, with no vessel-design, shipbuilding or marine-machinery task stated."),
    "naval architect": ("supported", "Designs, builds, maintains and repairs vessels and analyses structure, stability, resistance and propulsion; direct naval-architecture work."),
    "offshore renewable energy engineer": ("supported", "Designs and supervises installation of offshore energy farms and equipment; offshore energy installations are explicitly within the D134 parent scope."),
    "ship assistant engineer": ("supported", "Assists with ship hull, main engines, steering, electrical generation and major subsystems; direct shipboard engineering operations."),
    "ship duty engineer": ("supported", "Ensures operation of ship engines, steering, electrical generation and other major subsystems; direct marine engineering operations."),
    "vessel assembly supervisor": ("supported", "Schedules and supervises boat and ship manufacturing; direct vessel-construction work."),
}


def main() -> None:
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    rows = [row for row in queue["unresolved_rows"] if row["domain_id"] == "D134"]
    names = [row["role_name"] for row in rows]
    if len(names) != len(set(names)) or set(names) != set(DECISIONS):
        raise SystemExit(f"D134 exact role-name mismatch: queued={sorted(names)} decided={sorted(DECISIONS)}")
    decisions = []
    for row in sorted(rows, key=lambda item: item["role_key"]):
        fit, rationale = DECISIONS[row["role_name"]]
        decisions.append({"role_key": row["role_key"], "role_name": row["role_name"], "task_evidence": row["role_description"], "esco_uri": (row.get("esco_occupation_uris") or [None])[0], "onet_codes": row.get("onet_occupation_codes", []), "domain_fit": fit, "rationale": rationale, "source_refs": ["QUEUE_TASK_PROFILE", "ESCO_TASK_PROFILE", "IMO_SHIP_DESIGN", "IMO_STCW_F", "IRENA_OFFSHORE_RENEWABLES"]})
    tally = Counter(item["domain_fit"] for item in decisions)
    payload = {
        "schema_version": "2026-10-05.role-domain-fit-lane.v1", "audit_date": date.today().isoformat(),
        "domain_id": "D134", "domain_name": rows[0]["domain_name"], "scope": rows[0]["domain_scope"],
        "method": "Compare actual tasks with design/survey of vessels and offshore energy installations, ship construction, and operation/maintenance of marine machinery and systems. Vessel engineering tasks are supported; a marine setting alone is not enough (e.g. biology or emergency response). Broad technical work is conditional when the task does not establish the marine context.",
        "counts": {"mappings_reviewed": len(decisions), "supported": tally["supported"], "conditional": tally["conditional"], "unsupported_for_domain": tally["unsupported_for_domain"], "unresolved": tally["unresolved"]},
        "decisions": decisions, "sources": SOURCES,
        "notes": ["Every D134 queue key was checked against its recorded task; no role title or ISCO/subgroup membership decides fit.", "IMO sources corroborate global ship-design and ship-engineering scope; STCW-F corroborates fishing-vessel engineer context; IRENA corroborates offshore-energy installation work.", "Conditional means the task is technically adjacent but does not establish the marine application needed for confirmed parent fit.", "No role-to-specialization assignment, student-path recommendation or canonical mapping change is made."],
    }
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = ["# D134 role-to-parent-domain fit review — 2026-10-05", "", f"Scope: {payload['scope']}", "", f"- Exact queued roles reviewed: **{len(decisions)}**", f"- Supported: **{tally['supported']}**", f"- Conditional: **{tally['conditional']}**", f"- Unsupported for this parent: **{tally['unsupported_for_domain']}**", f"- Unresolved: **{tally['unresolved']}**", "", "| Exact role key | Recorded task evidence | Parent fit | Reason |", "|---|---|---|---|"]
    for item in decisions:
        task = item["task_evidence"].replace("|", "\\|").replace("\n", " ")
        reason = item["rationale"].replace("|", "\\|").replace("\n", " ")
        lines.append(f"| `{item['role_key']}` | {task} | {item['domain_fit']} | {reason} |")
    lines += ["", "## Sources and limitations", ""]
    for key, source in SOURCES.items():
        lines.append(f"- **{key} — {source['publisher']}:** [{source['url']}]({source['url']}). {source['locator']} Supports: {source['supports']} Limit: {source['limit']}")
    lines += ["", "## Audit notes", ""] + [f"- {note}" for note in payload["notes"]]
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()

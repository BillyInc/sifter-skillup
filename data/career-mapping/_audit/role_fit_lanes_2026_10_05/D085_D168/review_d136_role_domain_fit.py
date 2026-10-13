"""Exact-queue D136 role-to-parent-domain fit review generator."""

from __future__ import annotations

import json
from collections import Counter
from datetime import date
from pathlib import Path

LANE = Path(__file__).resolve().parent
QUEUE = LANE / "D085_D168_role_fit_queue_2026_10_05.json"
OUT_JSON = LANE / "D136_role_domain_fit_review_2026_10_05.json"
OUT_MD = LANE / "D136_role_domain_fit_review_2026_10_05.md"

SOURCES = {
    "QUEUE_TASK_PROFILE": {"publisher": "Checked-in role/domain audit queue", "url": "D085_D168_role_fit_queue_2026_10_05.json", "locator": "Exact D136 role_key and stored task description for each mapping.", "supports": "The actual tasks used to evaluate fit with aircraft design, production and upkeep.", "limit": "Stored task text is not an independent occupational authority."},
    "ESCO_TASK_PROFILE": {"publisher": "European Commission, ESCO", "url": "https://esco.ec.europa.eu/en/classification/occupation_main", "locator": "The exact ESCO occupation URI is retained per role where available.", "supports": "Role-specific tasks for aircraft engineering, assembly, inspection and maintenance.", "limit": "ESCO occupation labels do not automatically determine fit to this parent domain."},
    "ICAO_AIRWORTHINESS": {"publisher": "International Civil Aviation Organization (ICAO)", "url": "https://www.icao.int/airworthiness-aircraft", "locator": "Annex 8 Airworthiness of Aircraft covers design, certification, production and continuing airworthiness of aircraft.", "supports": "International boundary for aircraft engineering, manufacture, inspection and upkeep.", "limit": "Airworthiness standards define safety and regulatory scope, not job titles or this project's taxonomy."},
    "EASA_CONTINUING_AIRWORTHINESS": {"publisher": "European Union Aviation Safety Agency (EASA)", "url": "https://www.easa.europa.eu/en/document-library/easy-access-rules/online-publications/easy-access-rules-continuing-airworthiness", "locator": "Continuing-airworthiness rules cover aircraft/component maintenance, inspection, repair and return to service.", "supports": "Aircraft and engine maintenance/inspection task context.", "limit": "EU regulatory detail is corroboration; individual licensing and approval requirements vary by jurisdiction."},
    "FAA_ENGINE_POLICY": {"publisher": "Federal Aviation Administration (FAA)", "url": "https://www.faa.gov/aircraft/air_cert/design_approvals/engine_prop/engine_prop_regs", "locator": "Engine and propeller airworthiness standards and inspection/repair guidance.", "supports": "Aircraft-engine design, testing, inspection and repair context.", "limit": "US-specific regulation is not treated as a universal licensing rule."},
}

DECISIONS = {
    "aerodynamics engineer": ("conditional", "Analyzes aerodynamic performance of transport equipment and engine components, but the task does not identify aircraft; it could instead concern another transport mode."),
    "aerospace engineer": ("supported", "Develops, tests and oversees manufacture of flight vehicles including aircraft; the aircraft branch is explicitly within D136."),
    "aerospace engineering drafter": ("supported", "Converts aerospace designs into manufacturing drawings for aircraft as well as spacecraft; aircraft production drawings are direct scope."),
    "aerospace engineering technician": ("supported", "Operates, maintains and tests equipment used on aircraft and spacecraft; aircraft test and upkeep duties directly fit."),
    "aircraft assembler": ("supported", "Builds and installs aircraft parts and subassemblies, reads drawings and verifies assembly function; direct aircraft production."),
    "aircraft assembly inspector": ("supported", "Inspects aircraft assemblies against engineering specifications and safety requirements and checks repair work; direct airworthiness/production inspection."),
    "aircraft assembly supervisor": ("supported", "Coordinates aircraft manufacturing employees and production schedules; direct aircraft factory work."),
    "aircraft cargo operations coordinator": ("unsupported_for_domain", "Coordinates airport cargo/ramp loading and unloading, not aircraft design, construction, engineering or upkeep."),
    "aircraft de-icer installer": ("supported", "Installs, tests, maintains and repairs aircraft anti-icing/de-icing systems; direct aircraft-systems upkeep."),
    "aircraft dispatcher": ("unsupported_for_domain", "Authorizes and coordinates commercial flights and schedules; this is flight operations, not aircraft engineering or maintenance."),
    "aircraft engine assembler": ("supported", "Builds, installs, inspects and tests aircraft engines; direct aircraft propulsion-system manufacture."),
    "aircraft engine inspector": ("supported", "Inspects aircraft engines for safety/compliance, reviews overhaul work and supports maintenance/repair; direct aircraft-engine assurance."),
    "aircraft engine specialist": ("supported", "Advises on aircraft-engine maintenance and tests aircraft engine parts; direct aircraft-engine upkeep."),
    "aircraft engine tester": ("supported", "Tests aircraft-engine performance on test stands and records operating data; direct aircraft-engine testing."),
    "aircraft fuel system operator": ("unsupported_for_domain", "Maintains fuel-distribution systems and refuels aircraft, but the task describes fuel-service/ground operations rather than aircraft design, manufacture or maintenance."),
    "aircraft gas turbine engine overhaul technician": ("supported", "Overhauls, inspects, repairs and reassembles aircraft gas-turbine engines; direct aircraft-engine maintenance."),
    "avionics inspector": ("supported", "Inspects aircraft instruments and electrical/electronic systems and verifies maintenance/repair conformity; direct aircraft systems and safety assurance."),
    "engine designer": ("conditional", "Designs mechanical equipment and engines broadly; aircraft engine design fits, but the task does not specify aircraft rather than other engines."),
    "metallurgical technician": ("unsupported_for_domain", "Supports experiments on metals/alloys and extraction; no aircraft material, production or maintenance task is stated."),
    "welding engineer": ("conditional", "Develops welding methods and quality procedures; aircraft manufacture may use this work, but the recorded task does not identify aerospace structures or aircraft production."),
}


def main() -> None:
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    rows = [row for row in queue["unresolved_rows"] if row["domain_id"] == "D136"]
    names = [row["role_name"] for row in rows]
    if len(names) != len(set(names)) or set(names) != set(DECISIONS):
        raise SystemExit(f"D136 exact role-name mismatch: queued={sorted(names)} decided={sorted(DECISIONS)}")
    decisions = []
    for row in sorted(rows, key=lambda item: item["role_key"]):
        fit, rationale = DECISIONS[row["role_name"]]
        decisions.append({"role_key": row["role_key"], "role_name": row["role_name"], "task_evidence": row["role_description"], "esco_uri": (row.get("esco_occupation_uris") or [None])[0], "onet_codes": row.get("onet_occupation_codes", []), "domain_fit": fit, "rationale": rationale, "source_refs": ["QUEUE_TASK_PROFILE", "ESCO_TASK_PROFILE", "ICAO_AIRWORTHINESS", "EASA_CONTINUING_AIRWORTHINESS", "FAA_ENGINE_POLICY"]})
    tally = Counter(item["domain_fit"] for item in decisions)
    payload = {
        "schema_version": "2026-10-05.role-domain-fit-lane.v1", "audit_date": date.today().isoformat(),
        "domain_id": "D136", "domain_name": rows[0]["domain_name"], "scope": rows[0]["domain_scope"],
        "method": "Compare the specific task with aircraft design, production, testing, inspection and continuing upkeep. Mixed aerospace tasks are supported where aircraft work is explicitly included. Generic engine/aerodynamics/welding work remains conditional without an aircraft application. Cargo handling, flight dispatch, refuelling and generic metallurgy are not treated as aircraft engineering merely because they occur near aviation.",
        "counts": {"mappings_reviewed": len(decisions), "supported": tally["supported"], "conditional": tally["conditional"], "unsupported_for_domain": tally["unsupported_for_domain"], "unresolved": tally["unresolved"]},
        "decisions": decisions, "sources": SOURCES,
        "notes": ["All exact D136 queue mappings were compared with their task text; no role title or subgroup membership establishes fit.", "ICAO airworthiness standards establish the broad international design/production/continuing-airworthiness boundary; EASA and FAA material provide technical context, not universal credential rules.", "No role-to-specialization assignment, student-path recommendation or canonical mapping change is made."],
    }
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = ["# D136 role-to-parent-domain fit review — 2026-10-05", "", f"Scope: {payload['scope']}", "", f"- Exact queued roles reviewed: **{len(decisions)}**", f"- Supported: **{tally['supported']}**", f"- Conditional: **{tally['conditional']}**", f"- Unsupported for this parent: **{tally['unsupported_for_domain']}**", f"- Unresolved: **{tally['unresolved']}**", "", "| Exact role key | Recorded task evidence | Parent fit | Reason |", "|---|---|---|---|"]
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

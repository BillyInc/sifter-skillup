"""Exact-key D129 role-to-parent-domain audit report generator."""

from __future__ import annotations

import json
from collections import Counter
from datetime import date
from pathlib import Path

LANE = Path(__file__).resolve().parent
QUEUE = LANE / "D085_D168_role_fit_queue_2026_10_05.json"
OUT_JSON = LANE / "D129_role_domain_fit_review_2026_10_05.json"
OUT_MD = LANE / "D129_role_domain_fit_review_2026_10_05.md"

SOURCES = {
    "QUEUE_TASK_PROFILE": {"publisher": "Checked-in role/domain lane queue", "url": "D085_D168_role_fit_queue_2026_10_05.json", "locator": "Exact D129 role_key and task description for every decision.", "supports": "The recorded duties for each specific mapping.", "limit": "Local task profiles are not an independent occupational authority."},
    "ILO_ISCO08_ARMED_FORCES": {"publisher": "International Labour Organization", "url": "https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf", "locator": "ISCO-08 Major Group 0 and its definitions for commissioned officers, non-commissioned officers and other ranks; includes serving army, navy, air force and other military-service personnel and defines jobs by actual tasks/duties.", "supports": "International occupational context for military command, service and specialist functions.", "limit": "ISCO armed-forces classification is corroboration, not the fit rule; exact role task must still fall within the D129 parent description."},
    "ILO_ISCO_METHOD": {"publisher": "International Labour Organization", "url": "https://isco.ilo.org/en/isco-08/", "locator": "ISCO-08 job/occupation definitions and task-based grouping methodology.", "supports": "Confirms occupational mapping should use the work performed and task similarity.", "limit": "Methodological guidance does not make ISCO placement a substitute for comparing role tasks with the project domain scope."},
}

DECISIONS = {
    "air force officer": ("supported", "Commands or performs air-force duties, leads personnel and coordinates military training/welfare; directly within the armed-forces parent."),
    "air force pilot": ("supported", "Flies combat, patrol and search/rescue missions as an air-force pilot; direct armed-forces operational work."),
    "armed forces officer": ("supported", "Commands and coordinates military units, personnel, training and equipment; direct parent fit."),
    "army captain": ("supported", "Plans and supports army-unit operations, logistics and equipment; direct military command/operations work."),
    "army corporal": ("supported", "Leads and trains soldiers and operates military machinery/weaponry; direct armed-forces work."),
    "army general": ("supported", "Commands army divisions, develops military policy and directs national defence functions; direct fit."),
    "army major": ("supported", "Commands military units and oversees personnel training, welfare, administration and equipment; direct fit."),
    "artillery officer": ("supported", "Coordinates target acquisition, surveillance, battlefield information and artillery deployment while leading soldiers; directly matches weaponry/combat operations."),
    "bomb disposal technician": ("supported", "Locates and neutralizes land mines and bombs using military explosive-ordnance procedures; directly within military specialist operations."),
    "brigadier": ("supported", "Commands a military brigade and directs tactical/strategic planning and field/base operations; direct armed-forces leadership."),
    "colonel": ("supported", "Advises senior commanders on military operations and strategy; direct armed-forces staff function."),
    "fleet commander": ("supported", "Leads naval personnel and fleet readiness, maintenance and operations; direct naval service."),
    "infantry soldier": ("supported", "Conducts combat, peacekeeping and humanitarian missions as an armed-forces infantry member; direct fit."),
    "intelligence communications interceptor": ("supported", "Intercepts and analyses electromagnetic communications for military intelligence; directly matches the domain's intelligence and communications-interception scope."),
    "lieutenant": ("supported", "Commands platoons, leads training/discipline and performs military administration; direct armed-forces officer work."),
    "military engineer": ("supported", "Performs technical research, development, maintenance and quality assurance for military equipment within military service; direct military-engineering function."),
    "navy officer": ("supported", "Commands naval missions, supervises teams and participates in combat, patrol and peacekeeping operations; direct fit."),
    "sergeant": ("supported", "Leads and trains military squads, allocates duties and oversees equipment; direct non-commissioned armed-forces work."),
    "special forces officer": ("supported", "Conducts specialized counterterrorism, combat and intelligence missions; direct military operations."),
    "squadron leader": ("supported", "Commands military squadrons across air, ground or armoured operations; direct armed-forces command work."),
    "warfare specialist": ("supported", "Assesses threats, identifies targets, communicates tactical decisions and supports operational safety; directly within defence/warfare operations."),
}


def main() -> None:
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    rows = [row for row in queue["unresolved_rows"] if row["domain_id"] == "D129"]
    actual = {row["role_name"] for row in rows}
    if len(rows) != len(actual) or actual != set(DECISIONS):
        raise SystemExit(f"D129 exact-key mismatch: missing={sorted(actual-set(DECISIONS))}; extra={sorted(set(DECISIONS)-actual)}")
    decisions = []
    for row in sorted(rows, key=lambda value: value["role_key"]):
        fit, rationale = DECISIONS[row["role_name"]]
        decisions.append({"role_key": row["role_key"], "role_name": row["role_name"], "task_evidence": row["role_description"], "esco_uri": (row.get("esco_occupation_uris") or [None])[0], "domain_fit": fit, "rationale": rationale, "source_refs": ["QUEUE_TASK_PROFILE", "ILO_ISCO08_ARMED_FORCES", "ILO_ISCO_METHOD"]})
    counts = Counter(item["domain_fit"] for item in decisions)
    payload = {"schema_version": "2026-10-05.role-domain-fit-lane.v1", "audit_date": date.today().isoformat(), "domain_id": "D129", "domain_name": rows[0]["domain_name"], "scope": rows[0]["domain_scope"], "method": "Compare each task with the parent scope: active armed-forces service, command, military engineering, weaponry, combat/operational work, intelligence and defence. ILO ISCO-08 supplies international task-family context, but its group membership is not treated as the proof of fit; the recorded duties establish each result.", "counts": {"mappings_reviewed": len(decisions), "supported": counts["supported"], "conditional": counts["conditional"], "unsupported_for_domain": counts["unsupported_for_domain"], "unresolved": counts["unresolved"]}, "decisions": decisions, "sources": SOURCES, "notes": ["All exact D129 role keys were compared with their task descriptions; no rank title alone determines the result.", "All 21 tasks describe active military command/service or a military-specific operational/technical function covered by the parent description.", "Military engineer is supported because this exact record places the technical work within the military; civilian defence-establishment employment is not inferred into this parent.", "This is taxonomy fit only; it does not assess eligibility, military hiring, security clearance or student suitability.", "No role-to-specialization assignment, student-visibility decision or canonical taxonomy/mapping change is made."]}
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = ["# D129 role-to-parent-domain fit review — 2026-10-05", "", f"Scope: {payload['scope']}", "", f"- Exact queued roles reviewed: **{len(decisions)}**", f"- Supported: **{payload['counts']['supported']}**", f"- Conditional: **{payload['counts']['conditional']}**", f"- Unsupported for this parent: **{payload['counts']['unsupported_for_domain']}**", f"- Unresolved: **{payload['counts']['unresolved']}**", "", "| Exact role key | Task description | Fit | Why |", "|---|---|---|---|"]
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

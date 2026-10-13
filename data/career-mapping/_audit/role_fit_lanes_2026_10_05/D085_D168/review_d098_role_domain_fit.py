"""Build the exact-key D098 role-to-parent-domain audit artifact.

This is a scripted reconciliation/report generator. The task-level fit
dispositions are explicit, reviewed inputs; they are not inferred from ISCO,
subgroup membership, role title similarity, or canonical placement.
"""

from __future__ import annotations

import json
from collections import Counter
from datetime import date
from pathlib import Path


LANE_DIR = Path(__file__).resolve().parent
QUEUE_PATH = LANE_DIR / "D085_D168_role_fit_queue_2026_10_05.json"
JSON_OUT = LANE_DIR / "D098_role_domain_fit_review_2026_10_05.json"
MD_OUT = LANE_DIR / "D098_role_domain_fit_review_2026_10_05.md"

SOURCE_DATA = {
    "QUEUE_TASK_PROFILE": {
        "publisher": "Checked-in role/domain lane queue",
        "url": "D085_D168_role_fit_queue_2026_10_05.json",
        "locator": "Exact D098 role_description and evidence_source_urls for each decision.",
        "supports": "The stored task text compared with the D098 parent-domain scope.",
        "limit": "The task text is the checked-in source-backed profile, not a live refetch of each occupational page.",
    },
    "ESCO_CHECKED_IN_TASK_PROFILE": {
        "publisher": "European Commission, ESCO",
        "url": "https://esco.ec.europa.eu/en/classification/occupation-main",
        "locator": "Each decision retains its exact ESCO occupation URI from the checked-in queue.",
        "supports": "The role-task profile represented in the local source-backed queue.",
        "limit": "ESCO task descriptions establish the checked-in role scope; they do not prove an assignment to this Sifter parent domain.",
    },
    "WORLDSKILLS_CNC_MILLING": {
        "publisher": "WorldSkills International",
        "url": "https://worldskills.org/what/projects/wsos/2024/events/579/skills/1661/",
        "locator": "CNC milling occupational description: drawing-led, precise machining and manufacture of parts/tools.",
        "supports": "Context for precision machining/toolmaking task boundaries.",
        "limit": "International competition standard, not a universal licensing rule or role-to-domain decision.",
    },
    "ISO_DIMENSIONAL_METROLOGY": {
        "publisher": "International Organization for Standardization, ISO/TC 213",
        "url": "https://www.iso.org/committee/54924.html",
        "locator": "Committee scope and work groups covering dimensional/geometrical specification, verification, measurement and calibration.",
        "supports": "Context for precision measurement/instrument task boundaries.",
        "limit": "Standards scope is not itself an occupational assignment or proof that generic inspection belongs in this domain.",
    },
    "ISO_OPTICS_PHOTONICS": {
        "publisher": "International Organization for Standardization, ISO/TC 172",
        "url": "https://www.iso.org/committee/53686/x/catalogue/",
        "locator": "International catalogue of optics and photonics standards for optical equipment, components and measurements.",
        "supports": "Context for optical instrument assembly and repair tasks.",
        "limit": "Standards scope is contextual; it does not prove that all optical work belongs in D098.",
    },
    "WOSTEP_WATCHMAKER": {
        "publisher": "Watchmakers of Switzerland Training and Educational Program (WOSTEP)",
        "url": "https://www.wostep.ch/sites/default/files/2024-12/P05-Watchmaker_brochure_en.pdf",
        "locator": "Watchmaker curriculum and progression to professional watchmaking competencies.",
        "supports": "Context for clock/watchmaking task boundaries.",
        "limit": "Specialist training programme, not a universal legal qualification requirement.",
    },
    "BHI_HOROLOGY": {
        "publisher": "British Horological Institute",
        "url": "https://bhi.co.uk/diplomas",
        "locator": "Clock/watch servicing and repair diploma descriptions and practical routes.",
        "supports": "Independent specialist-institute context for watch/clock repair tasks.",
        "limit": "UK-based institute framework; recognition and requirements vary by jurisdiction and employer.",
    },
}

# Status and rationale are recorded against task text, not occupational family.
# Any changed/missing/extra queue key makes the script fail closed for review.
DISPOSITIONS = {
    "precision device inspector": (
        "supported",
        "The specified work is inspection and adjustment of precision measuring devices (micrometers and gauges), directly within the precision-instrument scope.",
        ["ISO_DIMENSIONAL_METROLOGY"],
    ),
    "clock and watchmaker": (
        "supported",
        "Makes and assembles mechanical/electronic timepieces with precision tools; the task is directly within the timepiece and precision-instrument scope.",
        ["WOSTEP_WATCHMAKER", "BHI_HOROLOGY"],
    ),
    "gunsmith": (
        "conditional",
        "The profile includes precision machining and repair, but it is specifically firearm work and the parent-domain scope does not establish weapons manufacture as a supported D098 pathway. Retain conditional pending catalogue-level domain-boundary evidence.",
        ["WORLDSKILLS_CNC_MILLING"],
    ),
    "optical instrument assembler": (
        "supported",
        "Assembles, grinds, polishes and coats optical components for instruments; these are precision-instrument tasks with an established optics standards context.",
        ["ISO_OPTICS_PHOTONICS"],
    ),
    "watch and clock repairer": (
        "supported",
        "Diagnoses, services, repairs and restores clocks and watches, directly within the horology/timepiece scope.",
        ["WOSTEP_WATCHMAKER", "BHI_HOROLOGY"],
    ),
    "electrical equipment inspector": (
        "unsupported_for_domain",
        "Checks finished electrical products for physical defects and faulty connections; the task is general electrical-product quality inspection, not precision engineering/toolmaking or precision-instrument work.",
        [],
    ),
    "electronic equipment inspector": (
        "unsupported_for_domain",
        "Checks electronic equipment for defects and assembly compliance; the task is electronics quality inspection rather than precision-instrument engineering.",
        [],
    ),
    "printed circuit board test technician": (
        "unsupported_for_domain",
        "Tests and may repair printed circuit boards; the task is electronic assembly test/repair, not precision component/tool manufacture or precision-instrument work.",
        [],
    ),
    "casting mould maker": (
        "conditional",
        "Creates patterns and moulds used to cast products, which can overlap with toolmaking, but the profile is not limited to precision tools/dies and can serve general foundry production. Parent fit depends on a narrower documented precision-tool task context.",
        ["WORLDSKILLS_CNC_MILLING"],
    ),
    "optical instrument repairer": (
        "supported",
        "Tests, diagnoses and repairs optical instruments such as microscopes, telescopes and camera optics; directly within the precision-instrument scope.",
        ["ISO_OPTICS_PHOTONICS"],
    ),
    "automated optical inspection operator": (
        "unsupported_for_domain",
        "Operates optical inspection equipment specifically to find defects in printed-circuit-board assemblies; the inspected object and work context are electronics production QA, not precision optical instruments or metrology equipment.",
        [],
    ),
    "product quality inspector": (
        "unsupported_for_domain",
        "Inspects products across unspecified sectors against standards; no precision engineering, toolmaking or precision-instrument task is established.",
        [],
    ),
    "consumer goods inspector": (
        "unsupported_for_domain",
        "Evaluates general consumer goods for defects and specification compliance; product quality inspection alone does not establish a D098 task.",
        [],
    ),
    "product assembly inspector": (
        "unsupported_for_domain",
        "Checks assembled products against manufacturing specifications across unspecified sectors; the task is generic production inspection, not precision engineering/toolmaking.",
        [],
    ),
    "non-destructive testing specialist": (
        "unsupported_for_domain",
        "Performs nondestructive tests on vehicles, vessels, manufactured objects and structures; the profile is cross-sector inspection, not precision instrument manufacture or toolmaking.",
        [],
    ),
    "locksmith": (
        "unsupported_for_domain",
        "Installs and repairs mechanical/electronic locks and keys; security-access systems are outside the stated precision-engineering/toolmaking parent scope.",
        [],
    ),
    "product quality controller": (
        "unsupported_for_domain",
        "Performs general manufacturing quality checks and tracks product defects; no D098-specific precision engineering task is established.",
        [],
    ),
    "control panel tester": (
        "unsupported_for_domain",
        "Tests and corrects electrical control-panel wiring and components; this is electrical/electronic systems testing, not precision engineering/toolmaking.",
        [],
    ),
    "surgical instrument maker": (
        "supported",
        "Designs, makes and repairs precision instruments used in surgery; the actual instrument-manufacturing task fits the broad precision-instrument scope. Medical-device compliance is an additional context, not evidence against task fit.",
        ["ISO_DIMENSIONAL_METROLOGY"],
    ),
    "product grader": (
        "unsupported_for_domain",
        "Grades unspecified products/materials for quality and sends defects for repair; this broad quality-control task does not establish D098-specific precision work.",
        [],
    ),
    "precision mechanic": (
        "supported",
        "Manufactures precision metal components and assembles them into functional units using milling, drilling, grinding and honing; this directly fits precision engineering.",
        ["WORLDSKILLS_CNC_MILLING", "ISO_DIMENSIONAL_METROLOGY"],
    ),
    "precision instrument assembler": (
        "supported",
        "Assembles micrometers, gauges, thermostats and utility meters and calibrates instruments; directly within the precision-instrument and measurement scope.",
        ["ISO_DIMENSIONAL_METROLOGY"],
    ),
    "tool and die maker": (
        "supported",
        "Designs, manufactures, finishes and maintains tools and dies used in manufacturing; directly within the toolmaking scope.",
        ["WORLDSKILLS_CNC_MILLING", "ISO_DIMENSIONAL_METROLOGY"],
    ),
}


def main() -> None:
    queue = json.loads(QUEUE_PATH.read_text(encoding="utf-8"))
    rows = [row for row in queue["unresolved_rows"] if row["domain_id"] == "D098"]
    actual_names = {row["role_name"] for row in rows}
    if len(rows) != len(actual_names) or actual_names != set(DISPOSITIONS):
        missing = sorted(actual_names - set(DISPOSITIONS))
        extra = sorted(set(DISPOSITIONS) - actual_names)
        raise SystemExit(f"D098 exact-queue mismatch; missing decisions={missing}; extra decisions={extra}")

    decisions = []
    for row in sorted(rows, key=lambda item: item["role_key"]):
        status, rationale, external_refs = DISPOSITIONS[row["role_name"]]
        refs = ["QUEUE_TASK_PROFILE", "ESCO_CHECKED_IN_TASK_PROFILE", *external_refs]
        decisions.append({
            "role_key": row["role_key"],
            "role_name": row["role_name"],
            "task_evidence": row["role_description"],
            "esco_uri": (row.get("esco_occupation_uris") or [None])[0],
            "domain_fit": status,
            "rationale": rationale,
            "source_refs": refs,
        })

    counts = Counter(item["domain_fit"] for item in decisions)
    payload = {
        "schema_version": "2026-10-05.role-domain-fit-lane.v1",
        "audit_date": date.today().isoformat(),
        "domain_id": "D098",
        "domain_name": rows[0]["domain_name"],
        "scope": "Role-task fit against the parent domain only; no subgroup or specialization fit.",
        "method": "Reconcile every D098 unresolved queue key exactly once. Compare the exact checked-in task description to the stated D098 scope. ISCO/subgroup membership, title resemblance and current canonical placement are not fit evidence. Conditional means task overlap exists but the parent boundary or task scope is insufficiently specific; unsupported means the task is outside the stated parent domain.",
        "counts": {
            "mappings_reviewed": len(decisions),
            "supported": counts["supported"],
            "conditional": counts["conditional"],
            "unsupported_for_domain": counts["unsupported_for_domain"] + counts["unsupported"],
            "unresolved": counts["unresolved"],
        },
        "decisions": decisions,
        "sources": SOURCE_DATA,
        "notes": [
            "The exact role key set and task text come from the refreshed lane queue and are preserved in each decision.",
            "ESCO task text was read from the checked-in profile payload; exact ESCO URIs are retained, but individual pages were not live-refetched during this pass.",
            "External sources corroborate technical boundaries only; they do not determine individual role fit or confer a universal credential requirement.",
            "No role-to-specialization decision is made. No canonical taxonomy or role/domain mapping JSON is changed.",
        ],
    }
    JSON_OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# D098 role-to-parent-domain fit review — 2026-10-05",
        "",
        "Scope: parent-domain fit only. No role-to-specialization or subgroup assignment is made.",
        "",
        f"- Exact queued mappings reviewed: **{len(decisions)}**",
        f"- Supported: **{payload['counts']['supported']}**",
        f"- Conditional: **{payload['counts']['conditional']}**",
        f"- Unsupported for this parent: **{payload['counts']['unsupported_for_domain']}**",
        f"- Unresolved: **{payload['counts']['unresolved']}**",
        "",
        "| Role | Task evidence (checked-in source text) | D098 fit | Reason |",
        "|---|---|---|---|",
    ]
    for item in decisions:
        evidence = item["task_evidence"].replace("|", "\\|").replace("\n", " ")
        reason = item["rationale"].replace("|", "\\|")
        lines.append(f"| {item['role_name']} | {evidence} | **{item['domain_fit']}** | {reason} |")
    lines += [
        "",
        "## Evidence and limits",
        "",
        "Every row retains its exact ESCO URI and the checked-in ESCO task-profile text via `ESCO_CHECKED_IN_TASK_PROFILE`; this pass did not live-refetch those 23 pages. ISO, NIST, WorldSkills, WOSTEP and BHI sources contextualize the relevant technical fields only. They are not used to infer membership from occupation titles, and national/provider training rules are not represented as universal requirements.",
        "",
        "Reproduce the exact-key reconciliation and counts with:",
        "",
        "```powershell",
        "python data/career-mapping/_audit/role_fit_lanes_2026_10_05/D085_D168/review_d098_role_domain_fit.py",
        "```",
    ]
    MD_OUT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(payload["counts"], indent=2))


if __name__ == "__main__":
    main()

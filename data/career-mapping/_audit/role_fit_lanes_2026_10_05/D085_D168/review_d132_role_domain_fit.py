"""Exact-queue D132 role-to-parent-domain fit review generator."""

from __future__ import annotations

import json
from collections import Counter
from datetime import date
from pathlib import Path

LANE = Path(__file__).resolve().parent
QUEUE = LANE / "D085_D168_role_fit_queue_2026_10_05.json"
OUT_JSON = LANE / "D132_role_domain_fit_review_2026_10_05.json"
OUT_MD = LANE / "D132_role_domain_fit_review_2026_10_05.md"

SOURCES = {
    "QUEUE_TASK_PROFILE": {"publisher": "Checked-in role/domain audit queue", "url": "D085_D168_role_fit_queue_2026_10_05.json", "locator": "Exact D132 role_key and task description for each decision.", "supports": "The recorded tasks being tested against the parent scope.", "limit": "Stored task text is not an independent occupational authority."},
    "NASA_ENGINEERING_CAREERS": {"publisher": "National Aeronautics and Space Administration (NASA)", "url": "https://www.nasa.gov/careers/engineering/", "locator": "NASA Engineering careers overview; aerospace engineers develop hardware/software for spacecraft flight systems and NASA engineering teams design and test space-mission systems.", "supports": "Aerospace and engineering work applied to spacecraft and space exploration.", "limit": "US agency workforce examples are corroborative; they do not establish every generic aerospace task as space-science work."},
    "NASA_SPACEFLIGHT_OPERATIONS": {"publisher": "NASA Johnson Space Center", "url": "https://www.nasa.gov/reference/jsc-spaceflight-operations/", "locator": "Spaceflight operations overview: astronaut training, Mission Control, ISS and exploration-mission operations, and spacecraft systems/procedures.", "supports": "Human spaceflight, astronaut and mission-operation context.", "limit": "Agency-specific operational description, used as a global spaceflight task example rather than a universal occupational standard."},
    "NASA_JPL_ASTROPHYSICS": {"publisher": "NASA Jet Propulsion Laboratory", "url": "https://science.jpl.nasa.gov/division/astrophysics-space-sciences/", "locator": "Astrophysics & Space Sciences research portfolio includes astronomical observations, spacecraft observations, space physics, instrumentation and theoretical modeling.", "supports": "The space-science/astrophysics context for physicists whose actual specialization is in those fields.", "limit": "A generic physicist task profile does not establish an astrophysics or space-science specialization."},
}

DECISIONS = {
    "Aerospace Engineering and Operations Technologists and Technicians": ("supported", "The task explicitly operates and maintains equipment used to launch, track and evaluate air and space vehicles; the space-vehicle and mission-operation functions fall within the parent." , ["QUEUE_TASK_PROFILE", "NASA_ENGINEERING_CAREERS"]),
    "Aerospace Engineers": ("supported", "The task explicitly designs, constructs and tests spacecraft as well as aircraft and missiles. Spacecraft engineering is directly included in the parent scope." , ["QUEUE_TASK_PROFILE", "NASA_ENGINEERING_CAREERS"]),
    "aerospace engineer": ("supported", "The task develops, tests and oversees spacecraft manufacture in addition to other flight vehicles; the stated spacecraft duties directly fit the parent." , ["QUEUE_TASK_PROFILE", "NASA_ENGINEERING_CAREERS"]),
    "aerospace engineering drafter": ("supported", "The task prepares engineering drawings used to manufacture aircraft and spacecraft; the spacecraft design/manufacture function is explicitly in scope." , ["QUEUE_TASK_PROFILE", "NASA_ENGINEERING_CAREERS"]),
    "aerospace engineering technician": ("supported", "The task operates, maintains and tests equipment on aircraft and spacecraft and records results; spacecraft systems work directly fits." , ["QUEUE_TASK_PROFILE", "NASA_ENGINEERING_CAREERS"]),
    "astronaut": ("supported", "The task commands or crews spacecraft for operations and scientific experiments beyond ordinary commercial-flight altitude; this is direct human spaceflight and exploration work." , ["QUEUE_TASK_PROFILE", "NASA_SPACEFLIGHT_OPERATIONS"]),
    "physicist": ("conditional", "The role studies physical phenomena across many possible specialties. Space physics/astrophysics fits the parent, but this generic task record does not identify that specialty." , ["QUEUE_TASK_PROFILE", "NASA_JPL_ASTROPHYSICS"]),
    "satellite engineer": ("supported", "The task develops, tests and manufactures satellite systems, software and command/control functions; this directly matches space-system engineering and operation." , ["QUEUE_TASK_PROFILE", "NASA_ENGINEERING_CAREERS"]),
}


def main() -> None:
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    rows = [row for row in queue["unresolved_rows"] if row["domain_id"] == "D132"]
    names = [row["role_name"] for row in rows]
    if len(names) != len(set(names)) or set(names) != set(DECISIONS):
        raise SystemExit(f"D132 exact role-name mismatch: queued={sorted(names)} decided={sorted(DECISIONS)}")
    decisions = []
    for row in sorted(rows, key=lambda item: item["role_key"]):
        fit, rationale, refs = DECISIONS[row["role_name"]]
        decisions.append({"role_key": row["role_key"], "role_name": row["role_name"], "task_evidence": row["role_description"], "esco_uri": (row.get("esco_occupation_uris") or [None])[0], "onet_codes": row.get("onet_occupation_codes", []), "domain_fit": fit, "rationale": rationale, "source_refs": refs})
    tally = Counter(item["domain_fit"] for item in decisions)
    payload = {
        "schema_version": "2026-10-05.role-domain-fit-lane.v1", "audit_date": date.today().isoformat(),
        "domain_id": "D132", "domain_name": rows[0]["domain_name"], "scope": rows[0]["domain_scope"],
        "method": "Compare each task to the stated space-science/exploration scope: spaceflight/spacecraft and satellite systems engineering, launch/mission operations, and space-science research. Mixed aerospace tasks count as supported only where spacecraft/space-vehicle work is explicit; generic physicist work is conditional without a stated space specialization. No role title or subgroup membership determines fit.",
        "counts": {"mappings_reviewed": len(decisions), "supported": tally["supported"], "conditional": tally["conditional"], "unsupported_for_domain": tally["unsupported_for_domain"], "unresolved": tally["unresolved"]},
        "decisions": decisions, "sources": SOURCES,
        "notes": ["All eight exact D132 queue entries were compared with their task descriptions.", "NASA sources corroborate space-sector task context; they are not used to infer specialty from a generic title.", "No role-to-specialization assignment, student-path recommendation or canonical taxonomy/mapping change is made."],
    }
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = ["# D132 role-to-parent-domain fit review — 2026-10-05", "", f"Scope: {payload['scope']}", "", f"- Exact queued roles reviewed: **{len(decisions)}**", f"- Supported: **{tally['supported']}**", f"- Conditional: **{tally['conditional']}**", f"- Unsupported for this parent: **{tally['unsupported_for_domain']}**", f"- Unresolved: **{tally['unresolved']}**", "", "| Exact role key | Recorded task evidence | Parent fit | Reason |", "|---|---|---|---|"]
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

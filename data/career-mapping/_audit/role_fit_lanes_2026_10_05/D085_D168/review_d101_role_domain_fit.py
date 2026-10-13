"""Exact-key D101 role-to-parent-domain audit report generator."""

from __future__ import annotations

import json
from collections import Counter
from datetime import date
from pathlib import Path


LANE = Path(__file__).resolve().parent
QUEUE = LANE / "D085_D168_role_fit_queue_2026_10_05.json"
OUT_JSON = LANE / "D101_role_domain_fit_review_2026_10_05.json"
OUT_MD = LANE / "D101_role_domain_fit_review_2026_10_05.md"

SOURCES = {
    "QUEUE_TASK_PROFILE": {
        "publisher": "Checked-in role/domain lane queue",
        "url": "D085_D168_role_fit_queue_2026_10_05.json",
        "locator": "Exact D101 role_key, role_description and ESCO URI for each decision.",
        "supports": "Stored task descriptions compared with Painting, Decorating and Surface Treatment.",
        "limit": "The queue has no canonical D101 domain-description text; the explicit domain title provides the scope statement.",
    },
    "ESCO_CHECKED_IN_TASK_PROFILE": {
        "publisher": "European Commission, ESCO, and linked source profiles in the lane queue",
        "url": "https://esco.ec.europa.eu/en/classification/occupation-main",
        "locator": "Exact occupation URIs retained per role in the queue.",
        "supports": "Stored task descriptions used for each parent-domain comparison.",
        "limit": "Stored task descriptions establish occupation tasks, not Sifter-domain fit on their own; pages were not independently refetched in this pass.",
    },
    "WORLDSKILLS_PAINTING_DECORATING": {
        "publisher": "WorldSkills International",
        "url": "https://worldskills.org/what/projects/wsos/2024/events/579/skills/1691/",
        "locator": "Painting and Decorating WSOS: preparation, painting/spraying, protective/decorative coatings, wallpapering and finishing work across buildings and other environments.",
        "supports": "International occupational context for painters, decorators, spray finishers and wallpaper installers.",
        "limit": "International occupational standard; it is not a complete taxonomy of industrial surface treatment.",
    },
    "WORLDSKILLS_CAR_PAINTING": {
        "publisher": "WorldSkills International",
        "url": "https://worldskills.org/what/projects/wsos/2024/events/579/skills/1718/",
        "locator": "Car Painting WSOS and task description for preparing and coating vehicle surfaces.",
        "supports": "Corroborates transport-equipment painting as a distinct but genuine surface-coating occupation.",
        "limit": "Automotive-specific occupational standard; used as contextual evidence for surface-coating work, not as proof of all transport-painting tasks.",
    },
}

DECISIONS = {
    "construction painter": ("supported", "Paints building interiors/exteriors, including protective and decorative coatings; this directly matches painting and decorating.", ["WORLDSKILLS_PAINTING_DECORATING"]),
    "lacquer spray gun operator": ("supported", "Applies durable lacquer/paint finishes to metal, wood and plastic workpieces; the parent title explicitly includes surface treatment, and the task is coating/finishing surfaces.", ["WORLDSKILLS_PAINTING_DECORATING"]),
    "marine painter": ("supported", "Prepares, cleans, blasts and paints ship hulls for protection; this is a direct surface-coating and protective-treatment task, even though the work setting is maritime rather than building construction.", ["WORLDSKILLS_PAINTING_DECORATING"]),
    "paperhanger": ("supported", "Prepares and hangs wallpaper on walls; this is an explicit decorating and wall-finish task.", ["WORLDSKILLS_PAINTING_DECORATING"]),
    "surface treatment operator": ("supported", "Applies paint and chemicals to material surfaces to prevent corrosion; this directly matches the explicit surface-treatment scope.", ["WORLDSKILLS_PAINTING_DECORATING"]),
    "transport equipment painter": ("supported", "Prepares and paints cars, buses, boats, aircraft, motorcycles and rail vehicles; these are explicit surface-coating tasks, and the parent domain includes surface treatment rather than building painting alone.", ["WORLDSKILLS_CAR_PAINTING"]),
}


def main() -> None:
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    rows = [row for row in queue["unresolved_rows"] if row["domain_id"] == "D101"]
    actual = {row["role_name"] for row in rows}
    if len(rows) != len(actual) or actual != set(DECISIONS):
        raise SystemExit(f"D101 exact-key mismatch: missing={sorted(actual-set(DECISIONS))}; extra={sorted(set(DECISIONS)-actual)}")
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
        "domain_id": "D101",
        "domain_name": rows[0]["domain_name"],
        "scope": "Role-task fit against the displayed parent-domain title only; no subgroup or specialization assignment.",
        "method": "Match each exact D101 queue key's checked-in task description to Painting, Decorating and Surface Treatment. ISCO/subgroup membership, role title alone and frequency are not fit evidence. The explicit surface-treatment component permits supported coating tasks on non-building substrates when the task itself is surface preparation/coating/protection.",
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
            "All six D101 role keys are checked exactly before writing this report.",
            "The queue has no canonical D101 description beyond its explicit title. Its wording includes surface treatment, so coating roles are not rejected merely because they work on ships or transport equipment.",
            "WorldSkills sources corroborate painting/decorating and vehicle-coating task contexts; they do not determine Sifter taxonomy membership.",
            "No role-to-specialization assignment, student-visibility decision or canonical taxonomy/mapping edit is made.",
        ],
    }
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# D101 role-to-parent-domain fit review — 2026-10-05", "",
        "Scope: role-task fit against Painting, Decorating and Surface Treatment; no subgroup or specialization assignment.", "",
        f"- Exact queued roles reviewed: **{len(decisions)}**",
        f"- Supported: **{payload['counts']['supported']}**",
        f"- Conditional: **{payload['counts']['conditional']}**",
        f"- Unsupported for this parent: **{payload['counts']['unsupported_for_domain']}**",
        f"- Unresolved: **{payload['counts']['unresolved']}**", "",
        "| Exact role key | Checked-in task description | Fit | Why |", "|---|---|---|---|",
    ]
    for item in decisions:
        task = item["task_evidence"].replace("|", "\\|").replace("\n", " ")
        lines.append(f"| `{item['role_key']}` | {task} | **{item['domain_fit']}** | {item['rationale']} |")
    lines += ["", "Sources contextualize tasks; they do not replace the exact task comparison. Stored ESCO-linked text was not independently refetched in this pass. No canonical data changed.", ""]
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps(payload["counts"], indent=2))


if __name__ == "__main__":
    main()

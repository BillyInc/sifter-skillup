"""Exact-key D099 role-to-parent-domain audit and report generator."""

from __future__ import annotations

import json
from collections import Counter
from datetime import date
from pathlib import Path


LANE = Path(__file__).resolve().parent
QUEUE = LANE / "D085_D168_role_fit_queue_2026_10_05.json"
OUT_JSON = LANE / "D099_role_domain_fit_review_2026_10_05.json"
OUT_MD = LANE / "D099_role_domain_fit_review_2026_10_05.md"

SOURCES = {
    "QUEUE_TASK_PROFILE": {
        "publisher": "Checked-in role/domain lane queue",
        "url": "D085_D168_role_fit_queue_2026_10_05.json",
        "locator": "Exact D099 role_description and evidence_source_urls for each decision.",
        "supports": "The checked-in task description compared with the D099 parent scope.",
        "limit": "This is not a live refetch of every external occupational page.",
    },
    "ESCO_CHECKED_IN_TASK_PROFILE": {
        "publisher": "European Commission, ESCO, and linked source profiles in the lane queue",
        "url": "https://esco.ec.europa.eu/en/classification/occupation-main",
        "locator": "Each record preserves exact occupational source URLs/ESCO URIs from the queue.",
        "supports": "Stored task descriptions used for the parent-scope comparison.",
        "limit": "Task descriptions establish task scope, not fit to a Sifter domain by themselves.",
    },
    "WORLDSKILLS_BRICKLAYING": {
        "publisher": "WorldSkills International",
        "url": "https://worldskills.org/what/projects/wsos/2024/events/579/skills/1695/",
        "locator": "Occupation description and standards on constructing/repairing building structures from plans.",
        "supports": "Context for brick/block masonry task boundaries.",
        "limit": "International competition standard, not a universal legal credential.",
    },
    "WORLDSKILLS_TILING": {
        "publisher": "WorldSkills International",
        "url": "https://worldskills.org/what/projects/wsos/2024/events/579/skills/1686/",
        "locator": "Wall and Floor Tiling occupational standard and performance description.",
        "supports": "Context for tile installation, substrate preparation and finished-surface work.",
        "limit": "Competition standard; does not define the whole domain or all floor-covering trades.",
    },
    "WORLDSKILLS_PLASTERING_DRYWALL": {
        "publisher": "WorldSkills International",
        "url": "https://worldskills.org/what/projects/wsos/2024/events/579/skills/1685/",
        "locator": "Plastering and Drywall Systems occupational description, including internal/external plaster, framing, plasterboard, ceilings, insulation and repair.",
        "supports": "Context for plastering/drywall and related interior-surface work.",
        "limit": "Competition standard, not a prescription for subgroup count.",
    },
    "WORLDSKILLS_STONEMASONRY": {
        "publisher": "WorldSkills International",
        "url": "https://worldskills.org/what/projects/wsos/2024/events/579/skills/1719/",
        "locator": "Stonemasonry occupational standard page; page explicitly states that this WSOS has not been verified by WorldSkills International.",
        "supports": "Secondary context that stone carving/assembly is treated as a distinct construction craft.",
        "limit": "Unverified WorldSkills standard; not treated as conclusive evidence or a global taxonomy authority.",
    },
}

# Explicit task judgments. A subgroup/ISCO family is not used as evidence.
DECISIONS = {
    "tile fitter": ("supported", "Installs and finishes tiles on walls and floors, directly within the stated tiling and surface-finishing scope.", ["WORLDSKILLS_TILING"]),
    "bricklayer": ("supported", "Builds/repairs brick walls and structures from construction plans, directly within masonry and bricklaying.", ["WORLDSKILLS_BRICKLAYING"]),
    "resilient floor layer": ("supported", "Prepares substrates and installs resilient floor coverings; the parent description expressly includes floor layers and finished building surfaces.", ["WORLDSKILLS_TILING"]),
    "ceiling installer": ("supported", "Installs ceiling systems as a building interior finish, expressly included in the stated parent scope.", ["WORLDSKILLS_PLASTERING_DRYWALL"]),
    "hardwood floor layer": ("supported", "Prepares and lays hardwood/parquet floors; floor finishing is explicitly within the current parent scope.", ["WORLDSKILLS_TILING"]),
    "stone engraver": ("supported", "Carves decorative patterns and inscriptions into stone, a direct stone-finishing task named by the parent scope.", ["WORLDSKILLS_STONEMASONRY"]),
    "house builder": ("conditional", "Builds and repairs houses using multiple building trades; the profile does not establish how much masonry, tiling, plastering or other work is performed, so a specific D099 route is not proven.", ["WORLDSKILLS_BRICKLAYING"]),
    "plate glass installer": ("supported", "Fits glass panes into building windows, doors, façades and structural elements, expressly included as interior/building fit-out in the domain description.", []),
    "terrazzo setter": ("supported", "Prepares substrates and installs cement/marble-chip terrazzo surfaces, directly within floor finishing.", ["WORLDSKILLS_TILING"]),
    "concrete finisher": ("supported", "Finishes poured concrete building surfaces, directly within the stated floor/surface-finishing scope.", []),
    "insulation worker": ("conditional", "Installs thermal, acoustic or other insulation; it is construction work but distinct from masonry and the parent description does not establish insulation as a D099 specialty.", ["WORLDSKILLS_PLASTERING_DRYWALL"]),
    "carpet fitter": ("supported", "Prepares and installs carpet floor coverings, directly matching the parent’s floor-layer and building-finish scope.", ["WORLDSKILLS_TILING"]),
    "stonemason": ("supported", "Shapes and assembles stone for construction; this is a direct masonry/construction-material task.", ["WORLDSKILLS_STONEMASONRY"]),
    "plasterer": ("supported", "Applies and repairs plaster finishes to walls, directly within the stated plastering scope.", ["WORLDSKILLS_PLASTERING_DRYWALL"]),
    "building construction worker": ("conditional", "Performs broad site preparation, assistance and cleanup without an identified masonry, tiling, plastering or finishing task; domain fit depends on a narrower recorded duty.", ["WORLDSKILLS_BRICKLAYING"]),
    "road construction worker": ("unsupported_for_domain", "Builds road earthworks, substructure and pavement; transport infrastructure construction is outside this building masonry/interior-finish domain.", []),
    "sewer construction worker": ("unsupported_for_domain", "Installs sewer pipes in trenches and connects wastewater systems; utility/infrastructure installation is outside the parent scope.", []),
    "Helpers--Painters, Paperhangers, Plasterers, and Stucco Masons": ("conditional", "The profile mixes support for painting/paperhanging with plaster and stucco work; it does not establish that the helper is assigned to D099 tasks rather than adjacent finishing trades.", ["WORLDSKILLS_PLASTERING_DRYWALL"]),
    "Plasterers and Stucco Masons": ("supported", "Applies interior/exterior plaster, cement and stucco, including ornamental plaster; directly within plastering and surface finishing.", ["WORLDSKILLS_PLASTERING_DRYWALL"]),
    "Cement Masons and Concrete Finishers": ("supported", "Finishes concrete floors and other surfaces and aligns/repairs forms; direct construction surface-finishing work.", []),
}


def main() -> None:
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    rows = [r for r in queue["unresolved_rows"] if r["domain_id"] == "D099"]
    actual = {r["role_name"] for r in rows}
    if len(rows) != len(actual) or actual != set(DECISIONS):
        raise SystemExit(f"D099 exact-key mismatch: missing={sorted(actual-set(DECISIONS))}; extra={sorted(set(DECISIONS)-actual)}")
    decisions = []
    for row in sorted(rows, key=lambda r: r["role_key"]):
        fit, rationale, contextual_refs = DECISIONS[row["role_name"]]
        decisions.append({
            "role_key": row["role_key"],
            "role_name": row["role_name"],
            "task_evidence": row["role_description"],
            "esco_uri": (row.get("esco_occupation_uris") or [None])[0],
            "domain_fit": fit,
            "rationale": rationale,
            "source_refs": ["QUEUE_TASK_PROFILE", "ESCO_CHECKED_IN_TASK_PROFILE", *contextual_refs],
        })
    counts = Counter(d["domain_fit"] for d in decisions)
    payload = {
        "schema_version": "2026-10-05.role-domain-fit-lane.v1",
        "audit_date": date.today().isoformat(),
        "domain_id": "D099",
        "domain_name": rows[0]["domain_name"],
        "scope": "Role-task fit against the parent domain only; no subgroup or specialization fit.",
        "method": "Reconcile each unresolved D099 queue key exactly once and compare its checked-in task description with the stated parent scope. ISCO/subgroup, title resemblance and canonical placement are not fit evidence. Conditional means a plausible construction/finish overlap exists but the recorded task is broad or the parent boundary is insufficient; unsupported means the described work belongs outside the stated domain.",
        "counts": {
            "mappings_reviewed": len(decisions),
            "supported": counts["supported"],
            "conditional": counts["conditional"],
            "unsupported_for_domain": counts["unsupported_for_domain"] + counts["unsupported"],
            "unresolved": counts["unresolved"],
        },
        "decisions": decisions,
        "sources": SOURCES,
        "notes": [
            "Exact keys, task evidence and ESCO URIs are retained from the checked-in queue; 20/20 keys are required or generation fails.",
            "External sources contextualize craft boundaries and do not determine individual role fit. The cited WorldSkills stonemasonry page is explicitly unverified and is treated only as secondary context.",
            "The broad house-builder, building-worker, insulation-worker and mixed helper records remain conditional, not promoted as unconditional D099 requirements.",
            "No role-to-specialization assignments or canonical mapping/taxonomy edits are made.",
        ],
    }
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# D099 role-to-parent-domain fit review — 2026-10-05", "",
        "Scope: parent-domain fit only; no subgroup or specialization assignment.", "",
        f"- Exact queued roles reviewed: **{len(decisions)}**",
        f"- Supported: **{payload['counts']['supported']}**",
        f"- Conditional: **{payload['counts']['conditional']}**",
        f"- Unsupported for this parent: **{payload['counts']['unsupported_for_domain']}**",
        f"- Unresolved: **{payload['counts']['unresolved']}**", "",
        "| Role | Checked-in task description | Fit | Rationale |", "|---|---|---|---|",
    ]
    for d in decisions:
        evidence=d["task_evidence"].replace("|", "\\|").replace("\n", " ")
        lines.append(f"| {d['role_name']} | {evidence} | **{d['domain_fit']}** | {d['rationale']} |")
    lines += ["", "ESCO-linked task text is taken from the checked-in queue; individual pages were not live-refetched in this pass. WorldSkills pages contextualize bricklaying, tiling, plastering/drywall and stonemasonry boundaries; the stonemasonry WSOS page itself says it has not been verified. No canonical mappings changed.", ""]
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps(payload["counts"], indent=2))


if __name__ == "__main__":
    main()

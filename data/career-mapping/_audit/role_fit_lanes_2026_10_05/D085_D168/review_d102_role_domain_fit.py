"""Exact-key D102 role-to-parent-domain audit report generator."""

from __future__ import annotations

import json
from collections import Counter
from datetime import date
from pathlib import Path


LANE = Path(__file__).resolve().parent
QUEUE = LANE / "D085_D168_role_fit_queue_2026_10_05.json"
OUT_JSON = LANE / "D102_role_domain_fit_review_2026_10_05.json"
OUT_MD = LANE / "D102_role_domain_fit_review_2026_10_05.md"

SOURCES = {
    "QUEUE_TASK_PROFILE": {
        "publisher": "Checked-in role/domain lane queue",
        "url": "D085_D168_role_fit_queue_2026_10_05.json",
        "locator": "Exact D102 role_key and stored task description for every reviewed record.",
        "supports": "Role task/material comparison against the stated domain scope.",
        "limit": "Several broad O*NET aggregate records have only terse descriptions; they are not expanded by inference.",
    },
    "ESCO_CHECKED_IN_TASK_PROFILE": {
        "publisher": "European Commission, ESCO, and linked source profiles in the lane queue",
        "url": "https://esco.ec.europa.eu/en/classification/occupation-main",
        "locator": "Exact stored occupation URI retained where present on each queue row.",
        "supports": "Stored descriptions of the tasks actually assigned to roles.",
        "limit": "Pages were not independently refetched for this pass; the stored task text is compared to the domain scope and taxonomy labels are not used as fit evidence.",
    },
    "WORLD_SKILLS_CARPENTRY": {
        "publisher": "WorldSkills International",
        "url": "https://worldskills.org/what/projects/wsos/2024/events/579/skills/1698/",
        "locator": "Carpentry WSOS occupation description and standards for timber construction, measuring, cutting, joining, assembly and installation.",
        "supports": "International task context for construction carpentry and wood installation.",
        "limit": "International occupational standard, not a complete taxonomy or legal credential.",
    },
    "WORLD_SKILLS_CABINETMAKING": {
        "publisher": "WorldSkills International",
        "url": "https://worldskills.org/what/projects/wsos/2024/events/579/skills/1704/",
        "locator": "Cabinetmaking WSOS occupation description for free-standing/built-in furniture and units, manufacture and fitting.",
        "supports": "International context for cabinetmaking and furniture manufacture.",
        "limit": "Competition standard; does not decide whether each Sifter mapping is valid.",
    },
    "WORLD_SKILLS_JOINERY": {
        "publisher": "WorldSkills International",
        "url": "https://worldskills.org/what/projects/wsos/2024/events/579/skills/1717/",
        "locator": "Joinery WSOS including wood preparation, machining, joints, assembly, finishing and installation.",
        "supports": "International context for wood processing, joinery and installation tasks.",
        "limit": "Competition standard; does not establish a universal occupational classification.",
    },
    "ILO_ISCO_WOOD_OCCUPATIONS": {
        "publisher": "International Labour Organization",
        "url": "https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf",
        "locator": "ISCO-08 unit groups 7115 Carpenters and Joiners, 7521 Wood Treaters, 7522 Cabinet-makers and Related Workers, and 7523 Woodworking Machine Tool Setters and Operators.",
        "supports": "Global occupational description context for the named wood-processing task families.",
        "limit": "Classification context only; code membership does not prove parent-domain fit and did not drive decisions.",
    },
}

DECISIONS = {
    "Cabinetmakers and Bench Carpenters": ("supported", "Cuts, shapes and assembles wood products and furniture using hand/power tools and woodworking machines; directly within wood technology and furniture making.", ["WORLD_SKILLS_CABINETMAKING", "ILO_ISCO_WOOD_OCCUPATIONS"]),
    "Sawing Machine Setters, Operators, and Tenders, Wood": ("supported", "Sets up and operates wood sawing equipment to process lumber; directly within wood processing.", ["WORLD_SKILLS_JOINERY", "ILO_ISCO_WOOD_OCCUPATIONS"]),
    "Woodworkers, All Other": ("conditional", "The source label is an aggregate residual and its task text says only that it covers woodworkers not listed separately; the specific wood task cannot be established.", ["ILO_ISCO_WOOD_OCCUPATIONS"]),
    "Woodworking Machine Setters, Operators, and Tenders, Except Sawing": ("supported", "Operates woodworking machines including lathes, routers, sanders and planers to shape wood; directly within wood technology.", ["WORLD_SKILLS_JOINERY", "ILO_ISCO_WOOD_OCCUPATIONS"]),
    "antique furniture reproducer": ("supported", "Recreates antique furniture from specifications, preparing templates, fitting, assembling and finishing wooden furniture.", ["WORLD_SKILLS_CABINETMAKING"]),
    "artisan papermaker": ("unsupported_for_domain", "Makes paper slurry and forms/dries paper; the task concerns paper manufacture, not wood construction, furniture or the stated wood crafts.", []),
    "basketmaker": ("supported", "Hand-weaves baskets and related objects from stiff fibres; basketmaking is expressly included in the domain's stated artisan craft scope.", []),
    "brush maker": ("unsupported_for_domain", "Manufactures brushes by assembling bristles, ferrules and handles; the stated work is brush production, not a wood craft or wood-processing task.", []),
    "cabinet maker": ("supported", "Cuts, shapes and joins wood to build furniture and cabinets; direct cabinetmaking and furniture production.", ["WORLD_SKILLS_CABINETMAKING"]),
    "carpenter": ("supported", "Cuts, shapes and assembles wooden elements for buildings and structures, including frames; direct construction carpentry.", ["WORLD_SKILLS_CARPENTRY"]),
    "construction scaffolder": ("unsupported_for_domain", "Erects temporary platforms and scaffolds for work at height; the task is access-system construction, not wood technology or carpentry.", []),
    "cooper": ("supported", "Shapes wood and assembles staved barrels, buckets and related products; direct wood craft and manufacture of everyday objects.", ["WORLD_SKILLS_JOINERY"]),
    "demolition worker": ("unsupported_for_domain", "Demolishes structures and clears debris; the recorded task is demolition rather than carpentry or wood technology.", []),
    "door installer": ("supported", "Prepares openings and fits/services doors in structures; directly related to carpentry and wood building components.", ["WORLD_SKILLS_CARPENTRY", "WORLD_SKILLS_JOINERY"]),
    "fireplace installer": ("conditional", "Installs wood-, gas- or electric-fuel fireplaces in homes, but the stored task does not establish carpentry/wood-component work as part of the installation.", ["WORLD_SKILLS_CARPENTRY"]),
    "frame maker": ("supported", "Measures, cuts, joins and finishes mostly wooden frames for pictures and mirrors; directly within wood craft and everyday objects.", ["WORLD_SKILLS_JOINERY"]),
    "furniture finisher": ("supported", "Sands, polishes and applies protective/decorative coatings to wooden furniture; a direct furniture production/finishing task.", ["WORLD_SKILLS_CABINETMAKING"]),
    "furniture restorer": ("supported", "Assesses, repairs and restores furniture using appropriate historical or modern materials and techniques; direct furniture craft.", ["WORLD_SKILLS_CABINETMAKING"]),
    "kitchen unit installer": ("supported", "Measures and installs kitchen units/elements in homes; the unit-installation task directly matches fitted furniture and wood-component installation even though utility connections are also listed.", ["WORLD_SKILLS_CABINETMAKING", "WORLD_SKILLS_JOINERY"]),
    "manufactured wooden building assembler": ("supported", "Assembles prefabricated wooden building modules, including structural elements and fitted openings; direct wood construction and assembly.", ["WORLD_SKILLS_CARPENTRY"]),
    "nailing machine operator": ("supported", "Operates machinery that nails wooden elements together and monitors production; direct wood-product assembly.", ["WORLD_SKILLS_JOINERY"]),
    "recreation model maker": ("conditional", "Makes models from several materials including wood, plastic, wax and metal; the task description does not establish wood as the material used for a particular record.", ["WORLD_SKILLS_CABINETMAKING"]),
    "staircase installer": ("supported", "Measures, prepares and installs staircases in buildings; directly related to carpentry and wood building components.", ["WORLD_SKILLS_CARPENTRY"]),
    "steeplejack": ("unsupported_for_domain", "Scales buildings and structures to perform work at height; no wood technology or carpentry task is specified.", []),
    "tent installer": ("unsupported_for_domain", "Erects and dismantles temporary tents and event shelters; no wood technology or carpentry task is specified.", []),
    "toymaker": ("conditional", "Designs and makes toys from mixed materials including wood, plastic and textiles; the specific material and wood-processing task are not established for every mapping.", ["WORLD_SKILLS_CABINETMAKING"]),
    "wicker furniture maker": ("supported", "Prepares rattan or willow and cuts, bends and weaves it into furniture; this is a woody-material furniture craft within the domain's stated wood technology and artisan furniture scope.", ["WORLD_SKILLS_CABINETMAKING"]),
    "window installer": ("supported", "Prepares structural openings and installs/services windows; directly related to carpentry and wood building components.", ["WORLD_SKILLS_CARPENTRY", "WORLD_SKILLS_JOINERY"]),
    "wood boring machine operator": ("supported", "Uses boring/milling machinery to form holes in wood workpieces; direct wood machining.", ["WORLD_SKILLS_JOINERY", "ILO_ISCO_WOOD_OCCUPATIONS"]),
    "wood drying kiln operator": ("supported", "Controls kilns to dry and condition wood, including temperature and ventilation; direct wood treatment/processing.", ["ILO_ISCO_WOOD_OCCUPATIONS"]),
    "wood pallet maker": ("supported", "Uses wood planks and machinery to assemble pallets for storage/shipping; direct wood-product manufacture.", ["WORLD_SKILLS_JOINERY"]),
    "wood sander": ("supported", "Smooths wooden objects using abrasives and sanding equipment; direct wood preparation/finishing.", ["WORLD_SKILLS_JOINERY"]),
    "wood treater": ("supported", "Applies chemical, thermal or other treatments to wood to protect it from moisture, mould and other environmental effects; direct wood treatment.", ["ILO_ISCO_WOOD_OCCUPATIONS"]),
    "woodcarver": ("supported", "Shapes wood by hand into decorative, composite, utensil or toy objects; direct wood craft explicitly within the parent scope.", ["WORLD_SKILLS_JOINERY"]),
    "wooden furniture machine operator": ("supported", "Operates machines that manufacture wooden furniture components and maintains production equipment; direct wood furniture manufacture.", ["WORLD_SKILLS_CABINETMAKING", "ILO_ISCO_WOOD_OCCUPATIONS"]),
    "woodturner": ("supported", "Uses a lathe and shaping tools to produce forms from wood; direct wood craft and manufacture of everyday objects.", ["WORLD_SKILLS_JOINERY"]),
}


def main() -> None:
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    rows = [row for row in queue["unresolved_rows"] if row["domain_id"] == "D102"]
    actual = {row["role_name"] for row in rows}
    if len(rows) != len(actual) or actual != set(DECISIONS):
        raise SystemExit(f"D102 exact-key mismatch: missing={sorted(actual-set(DECISIONS))}; extra={sorted(set(DECISIONS)-actual)}")
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
        "domain_id": "D102",
        "domain_name": rows[0]["domain_name"],
        "scope": rows[0]["domain_scope"],
        "method": "Match each exact D102 queue role's stored task/material evidence against the explicit parent scope. Role titles, ISCO/subgroup membership and frequency are not fit evidence. Conditional means a wood-related or craft overlap is plausible but the recorded material/task is too broad to establish fit; unsupported means the task described is outside wood technology and the named wood crafts.",
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
            "All 36 exact D102 queue keys are required before report generation.",
            "The domain's own scope explicitly includes wood in construction/furniture/everyday objects and names baskets, carvings and toys; task evidence, rather than ISCO or the subgroup, determines each decision.",
            "Four broad/mixed-material cases remain conditional: residual woodworkers, fireplace installers, recreation model makers and toymakers.",
            "No role-to-specialization assignment, student-visibility decision or canonical taxonomy/mapping edit is made.",
        ],
    }
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# D102 role-to-parent-domain fit review — 2026-10-05", "",
        f"Scope: {payload['scope']}", "",
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
    lines += ["", "WorldSkills and ILO sources contextualize carpentry, cabinetmaking and wood-processing tasks. ILO codes were not used as evidence of domain fit. Stored ESCO/O*NET-linked task text was not independently refetched in this pass. No canonical data changed.", ""]
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps(payload["counts"], indent=2))


if __name__ == "__main__":
    main()

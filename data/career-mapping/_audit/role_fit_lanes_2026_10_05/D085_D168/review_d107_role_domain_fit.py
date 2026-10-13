"""Exact-key D107 role-to-parent-domain audit report generator."""

from __future__ import annotations

import json
from collections import Counter
from datetime import date
from pathlib import Path

LANE = Path(__file__).resolve().parent
QUEUE = LANE / "D085_D168_role_fit_queue_2026_10_05.json"
OUT_JSON = LANE / "D107_role_domain_fit_review_2026_10_05.json"
OUT_MD = LANE / "D107_role_domain_fit_review_2026_10_05.md"

SOURCES = {
    "QUEUE_TASK_PROFILE": {
        "publisher": "Checked-in role/domain lane queue",
        "url": "D085_D168_role_fit_queue_2026_10_05.json",
        "locator": "Exact D107 role_key and role_description for each decision.",
        "supports": "The specific leather, footwear and leather-goods tasks compared with D107's parent-domain scope.",
        "limit": "A local queue is evidence of the mapped task profile, not an independent occupational authority.",
    },
    "ESCO_OCCUPATION_PROFILES": {
        "publisher": "European Commission, ESCO",
        "url": "https://esco.ec.europa.eu/en/classification/occupation-main",
        "locator": "Exact occupation URIs retained on each queued role record.",
        "supports": "Standardized occupation concepts and task descriptions for leather, footwear and leather-goods work.",
        "limit": "ESCO classification and the cached descriptions do not themselves determine fit to this project's custom parent domain; the role task is compared to the domain scope.",
    },
    "ILO_ISCO08": {
        "publisher": "International Labour Organization",
        "url": "https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf",
        "locator": "ISCO-08 occupational definitions and task examples for leather preparation/tanning, shoemaking and related work (including groups 7536, 8155 and 8156); used as corroborating occupational context, not as a mapping rule.",
        "supports": "Internationally recognized descriptions of core leather-processing and footwear-making work.",
        "limit": "ISCO is a classification, not proof that a particular role belongs to this custom domain; decisions remain grounded in each exact role task and the stated domain scope.",
    },
}

# Exact role-name key -> (disposition, task-based rationale).  Do not use ISCO
# or current subgroup placement to fill gaps or propagate these decisions.
DECISIONS = {
    "bespoke footwear technician": ("supported", "Designs, cuts, sews, assembles and finishes custom footwear in small workshops; the complete product and craft tasks directly match footwear making."),
    "finished leather warehouse manager": ("conditional", "Manages storage, packing and dispatch of finished leather rather than tanning or finishing it. The product-specific warehouse is adjacent to leather production, but the task is logistics, not leather technology; include only if the domain explicitly covers production logistics."),
    "footwear 3D developer": ("supported", "Develops footwear models and patterns with CAD and selects lasts, components and materials for product construction; direct footwear design and engineering."),
    "footwear CAD patternmaker": ("supported", "Creates and modifies CAD footwear patterns and nesting plans and estimates material use; direct footwear pattern engineering."),
    "footwear assembly supervisor": ("supported", "Coordinates lasting-room assembly and the sequence between footwear production stages; directly supervises shoe construction."),
    "footwear designer": ("supported", "Creates footwear concepts, collections, prototypes and samples using trend, material and design work; direct footwear product design."),
    "footwear factory warehouse operator": ("conditional", "Stores and supplies footwear-specific components and materials to the shoe-production chain. This is manufacturing logistics that enables footwear making, but is not itself technical product manufacture."),
    "footwear finishing and packing operator": ("conditional", "Performs final appearance checks and prepares finished footwear for dispatch. Finishing is in scope, while packing/dispatch is adjacent; retain conditionally where the work includes actual product finishing."),
    "footwear hand sewer": ("supported", "Hand-stitches leather/material footwear uppers and may assemble uppers to soles; direct shoe construction."),
    "footwear maintenance technician": ("supported", "Installs, programs, tunes and maintains footwear cutting, stitching, assembly and finishing equipment; direct technical support to footwear production technology."),
    "footwear patternmaker": ("supported", "Designs and cuts footwear patterns, checks nesting and estimates material use for production; direct shoe design-to-manufacture work."),
    "footwear product developer": ("supported", "Converts footwear designs into production-ready prototypes, patterns, components and technical drawings; direct footwear product engineering."),
    "footwear product development manager": ("supported", "Coordinates footwear designs, specifications, samples and collection development through production readiness; directly manages footwear product development."),
    "footwear production machine operator": ("supported", "Operates cutting, closing, lasting and finishing machinery used to manufacture footwear; direct production technology."),
    "footwear production manager": ("supported", "Plans and coordinates footwear manufacturing stages against production and quality goals; direct management of shoe production."),
    "footwear production supervisor": ("supported", "Coordinates daily work at a footwear manufacturing plant and oversees product quality and production staff; direct footwear production supervision."),
    "footwear production technician": ("supported", "Works across footwear manufacturing, product engineering and construction methods to improve productivity and quality; direct production technology."),
    "footwear quality control laboratory technician": ("supported", "Tests footwear, materials and components against standards and reports acceptance or rejection; direct product/material quality assurance."),
    "footwear quality controller": ("supported", "Inspects footwear, raw materials and components against defined product criteria and reports defects; direct footwear quality control."),
    "footwear quality manager": ("supported", "Establishes and manages quality systems and requirements for a footwear company; direct footwear manufacturing quality management."),
    "footwear quality technician": ("supported", "Applies product/process standards, interprets test results and recommends corrective action for footwear; direct technical quality work."),
    "footwear stitching machine operator": ("supported", "Operates stitching equipment to join footwear components and produce uppers; direct shoe manufacturing."),
    "hand lasting operator": ("supported", "Shapes and secures footwear uppers and linings over lasts with hand tools; a direct shoe-construction stage."),
    "hides, skins and leather products distribution manager": ("unsupported_for_domain", "Plans distribution to sales points. The task is downstream commercial logistics and does not process leather or make footwear/leather goods."),
    "import export manager in hides, skins and leather products": ("unsupported_for_domain", "Coordinates cross-border business procedures and parties; product sector does not change the generic trade/compliance task into leather technology or manufacture."),
    "import export specialist in hides, skins and leather products": ("unsupported_for_domain", "Handles customs knowledge and import/export documentation. This is trade administration, not leather processing or product manufacture."),
    "leather finishing operations manager": ("supported", "Plans leather finishing operations, chemical supply, equipment and staff; directly manages leather surface finishing."),
    "leather finishing operator": ("supported", "Uses finishing processes and machines to achieve specified leather surface characteristics; direct leather technology."),
    "leather goods CAD patternmaker": ("supported", "Designs and adjusts CAD patterns for leather goods and optimizes nesting/material use; direct product engineering for bags and other leather goods."),
    "leather goods artisanal worker": ("supported", "Makes and repairs leather goods by hand to customer specifications or own designs; direct leather-goods craft and production."),
    "leather goods designer": ("supported", "Develops leather-goods concepts, collections, samples and prototypes; direct product design for leather goods."),
    "leather goods finishing operator": ("supported", "Finishes leather goods and fits handles/metal applications to bags, luggage and accessories; direct product finishing and assembly."),
    "leather goods hand cutting operator": ("supported", "Selects and cuts leather/material pieces to specifications and checks components for product quality; direct leather-goods manufacture."),
    "leather goods hand stitcher": ("supported", "Hand-sews leather pieces to close and decorate leather goods; direct craft production."),
    "leather goods industrial engineer": ("supported", "Defines leather-goods production operations, methods, times and resource allocation; directly engineers manufacturing processes for the domain's products."),
    "leather goods machine operator": ("supported", "Operates machines for cutting, closing and finishing leather luggage, bags, saddlery and harness goods; direct manufacture."),
    "leather goods maintenance technician": ("supported", "Programs, tunes and maintains cutting, stitching and finishing equipment used in leather-goods manufacturing; direct production technology."),
    "leather goods manual operator": ("supported", "Prepares and joins components by hand to assemble leather-goods products; direct manufacture."),
    "leather goods manufacturing technician": ("supported", "Performs leather-goods manufacturing tasks across cutting, closing and finishing under product-quality criteria; direct production technology."),
    "leather goods packing operator": ("conditional", "Performs final product checks, applies accessories/labels and packs leather goods. It supports the product's production-to-dispatch completion but packing alone is not leather technology."),
    "leather goods patternmaker": ("supported", "Drafts and cuts patterns for leather goods and estimates nesting/material use; direct product engineering."),
    "leather goods product developer": ("supported", "Translates leather-goods designs into technical requirements, components and manufacturing-ready products; direct product development."),
    "leather goods product development manager": ("supported", "Coordinates leather-goods design and product development to meet specifications and production plans; direct product development management."),
    "leather goods production manager": ("supported", "Plans and coordinates leather-goods manufacturing phases against quality and output goals; direct production management."),
    "leather goods production supervisor": ("supported", "Coordinates daily production flow and staff in a leather-goods manufacturing plant and oversees quality; direct production supervision."),
    "leather goods quality control laboratory technician": ("supported", "Prepares samples, performs laboratory tests and interprets results for leather goods/materials against standards; direct product quality assurance."),
    "leather goods quality controller": ("supported", "Inspects leather goods for appearance, seams, robustness and other specifications; direct product quality control."),
    "leather goods quality manager": ("supported", "Manages quality assurance systems and continuous improvement for leather-goods production; direct quality management."),
    "leather goods quality technician": ("supported", "Tests finished goods, materials and components and reports quality results; direct technical quality assurance."),
    "leather goods stitching machine operator": ("supported", "Operates machines and tools to stitch leather components into bags and other goods; direct manufacture."),
    "leather goods warehouse operator": ("conditional", "Stores leather, components and production materials and distributes them to manufacturing departments. This is product-specific production logistics rather than product making."),
    "leather laboratory technician": ("conditional", "Tests leather and process chemicals, directly supporting leather quality and process control, but also tests environmental emissions and discharges. The mixed remit partly extends beyond the product-technology domain."),
    "leather measuring operator": ("supported", "Measures leather surface area and maintains measurement-machine calibration for production/invoicing; directly handles a key leather quality/production attribute."),
    "leather production machine operator": ("supported", "Operates and maintains tannery machinery to meet department processing requirements; direct leather-processing technology."),
    "leather production manager": ("supported", "Plans leather production, equipment and staff and ensures required output and product quality; direct tannery production management."),
    "leather production planner": ("conditional", "Plans leather production and coordinates material availability with warehouse and production. It is directly embedded in tannery operations but is planning/logistics rather than processing technology."),
    "leather raw materials purchasing manager": ("conditional", "Sources hides, skins and intermediate leather materials against tannery production requirements; domain-specific procurement supports processing but is not itself leather technology."),
    "leather sorter": ("supported", "Inspects and classifies leather by quality, colour, size, thickness, softness and defects during/after tannery production; direct material quality work."),
    "leather wet processing department manager": ("supported", "Manages hide/skin washing and preparation, chemicals, staff and equipment before tanning; direct leather-processing operations."),
    "orthopaedic footwear technician": ("supported", "Designs and manufactures footwear and orthopaedic components to accommodate foot/ankle fitting needs; direct specialized footwear design and production."),
    "shoe and leather accessories shop manager": ("unsupported_for_domain", "Manages a specialist retail shop. Selling footwear/accessories is not leather processing, shoemaking or leather-goods manufacture."),
    "shoe and leather accessories specialised seller": ("unsupported_for_domain", "Sells footwear in a specialist shop; the work is retail rather than product design, processing, manufacture or testing."),
    "shoe repairer": ("supported", "Repairs and renews footwear and leather goods with hand tools and specialist machinery; direct product repair and craft."),
    "shoemaker": ("supported", "Makes footwear by hand or machine and may repair footwear; direct shoemaking and production."),
    "tanner": ("supported", "Controls tannery drum processing and checks hide/skin/leather chemical and physical conditions; direct conversion of hides into leather."),
    "tanning technician": ("supported", "Oversees technical operations from hide preparation through tanning, post-tanning and finishing to ensure leather quality and process control; direct leather technology."),
    "textile, leather and footwear researcher": ("conditional", "Researches innovation across textiles, apparel, leather and footwear. Leather/footwear are explicit fields, but the profile is deliberately cross-sector and may not be specific to this domain."),
    "wholesale merchant in hides, skins and leather products": ("unsupported_for_domain", "Matches wholesale buyers/suppliers and trades goods; the task is commercial trading, not leather processing or product manufacture."),
}


def main() -> None:
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    rows = [row for row in queue["unresolved_rows"] if row["domain_id"] == "D107"]
    actual = {row["role_name"] for row in rows}
    if len(rows) != len(actual) or actual != set(DECISIONS):
        raise SystemExit(f"D107 exact-key mismatch: missing={sorted(actual-set(DECISIONS))}; extra={sorted(set(DECISIONS)-actual)}")
    decisions = []
    for row in sorted(rows, key=lambda value: value["role_key"]):
        fit, rationale = DECISIONS[row["role_name"]]
        decisions.append({
            "role_key": row["role_key"], "role_name": row["role_name"],
            "task_evidence": row["role_description"],
            "esco_uri": (row.get("esco_occupation_uris") or [None])[0],
            "domain_fit": fit, "rationale": rationale,
            "source_refs": ["QUEUE_TASK_PROFILE", "ESCO_OCCUPATION_PROFILES", "ILO_ISCO08"],
        })
    counts = Counter(item["domain_fit"] for item in decisions)
    payload = {
        "schema_version": "2026-10-05.role-domain-fit-lane.v1",
        "audit_date": date.today().isoformat(), "domain_id": "D107",
        "domain_name": rows[0]["domain_name"], "scope": rows[0]["domain_scope"],
        "method": "Compare each exact role task with D107's stated leather processing, footwear/leather-goods design and manufacture, finishing, testing, and production scope. ISCO, ESCO hierarchy, subgroup membership, title similarity, or frequency never establishes fit. Conditional indicates a task directly adjacent to production or spanning in-scope and broader duties. Unsupported indicates tasks confined to commerce/retail/logistics outside the defined technical/product domain.",
        "counts": {"mappings_reviewed": len(decisions), "supported": counts["supported"], "conditional": counts["conditional"], "unsupported_for_domain": counts["unsupported_for_domain"], "unresolved": counts["unresolved"]},
        "decisions": decisions, "sources": SOURCES,
        "notes": [
            "Every D107 queue role_key was matched exactly before report generation; all task evidence is copied from that exact queued record.",
            "ISCO-08 is used only as international occupational context. The role disposition is based on the task description versus the explicit parent-domain scope, not its ISCO group.",
            "Conditional logistics, packing, procurement and cross-sector research roles are not represented as core leather/footwear technical work; their inclusion depends on whether the parent domain deliberately encompasses those adjacent functions.",
            "No role-to-specialization assignment, student visibility decision or canonical taxonomy/mapping edit is made.",
        ],
    }
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# D107 role-to-parent-domain fit review — 2026-10-05", "",
        f"Scope: {payload['scope']}", "",
        f"- Exact queued roles reviewed: **{len(decisions)}**",
        f"- Supported: **{payload['counts']['supported']}**",
        f"- Conditional: **{payload['counts']['conditional']}**",
        f"- Unsupported for this parent: **{payload['counts']['unsupported_for_domain']}**",
        f"- Unresolved: **{payload['counts']['unresolved']}**", "",
        "| Exact role key | Task description | Fit | Why |", "|---|---|---|---|",
    ]
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

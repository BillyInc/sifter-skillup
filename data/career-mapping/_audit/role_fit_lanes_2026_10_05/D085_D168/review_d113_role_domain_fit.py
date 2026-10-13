"""Exact-key D113 role-to-parent-domain audit report generator."""

from __future__ import annotations

import json
from collections import Counter
from datetime import date
from pathlib import Path

LANE = Path(__file__).resolve().parent
QUEUE = LANE / "D085_D168_role_fit_queue_2026_10_05.json"
OUT_JSON = LANE / "D113_role_domain_fit_review_2026_10_05.json"
OUT_MD = LANE / "D113_role_domain_fit_review_2026_10_05.md"

SOURCES = {
    "QUEUE_TASK_PROFILE": {"publisher": "Checked-in role/domain lane queue", "url": "D085_D168_role_fit_queue_2026_10_05.json", "locator": "Exact D113 role_key and task description for each decision.", "supports": "Actual duties in glass, ceramics, building-material and boiler-plant records.", "limit": "The queue's domain_scope field is blank for D113; the visible parent title is therefore the boundary used here, with ambiguity explicitly kept conditional."},
    "ESCO_OCCUPATION_PROFILES": {"publisher": "European Commission, ESCO", "url": "https://esco.ec.europa.eu/en/classification/occupation-main", "locator": "Exact linked occupation URIs retained where present in the D113 queue.", "supports": "Standardized occupational concepts and source task profiles.", "limit": "ESCO group placement is not treated as evidence of fit to the custom D113 parent."},
    "ILO_ISCO08_GLASS_BOILER": {"publisher": "International Labour Organization", "url": "https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf", "locator": "ISCO-08 Unit Groups 8181 (glass and ceramics plant operators) and 8182 (steam-engine/boiler operators), including kiln/furnace glass, ceramic, brick/tile production and boiler/utility tasks.", "supports": "Authoritative international task-family definitions that correspond to two explicit components of D113's title.", "limit": "ISCO supplies corroborating task boundaries only; broad multi-material roles are not accepted solely because their code/group is related."},
}

DECISIONS = {
    "Adhesive Bonding Machine Operators and Tenders": ("conditional", "Joins many materials, including veneer, rubber, plastic and other products. Some use cases could serve building-material production, but the profile does not identify that context."),
    "Biomass Plant Technicians": ("unsupported_for_domain", "Controls biomass energy generation and plant maintenance; the described work is energy production, not glass, ceramics, building-material manufacture or boiler operation."),
    "Cleaning, Washing, and Metal Pickling Equipment Operators and Tenders": ("conditional", "Cleans an extensive mix of products/materials including glass and metals, but also food, pulp, coal, plastics and rubber; only some applications overlap D113."),
    "Computer Numerically Controlled Tool Operators": ("conditional", "Machines parts made from many materials, including stone, but the task profile is cross-material and does not specify D113 products."),
    "Cooling and Freezing Equipment Operators and Tenders": ("unsupported_for_domain", "Cools/freezes food, chemicals and other products; no task ties the role to the domain's glass, ceramics, building materials or boiler systems."),
    "Crushing, Grinding, and Polishing Machine Setters, Operators, and Tenders": ("conditional", "Processes materials including glass and stone, but also coal, grain, food and rubber; material-specific D113 work is possible but not established."),
    "Cutters and Trimmers, Hand": ("conditional", "Cuts varied manufactured materials including stone and glass, but also carpet, fabric and rubber; the profile does not identify a D113 product context."),
    "Cutting and Slicing Machine Setters, Operators, and Tenders": ("conditional", "Cuts glass and stone as well as cork, rubber, food, paper and other materials; the broad task could overlap D113 but is not domain-specific."),
    "Dental Laboratory Technicians": ("unsupported_for_domain", "Constructs/repairs dental appliances; this is dental technology, not D113 industrial materials or boiler plant work."),
    "Etchers and Engravers": ("conditional", "Etches/engraves multiple materials including glass, but also metal, wood and rubber. D113 relevance depends on whether the actual work is glass/ceramic/building-material decoration."),
    "Helpers--Production Workers": ("unsupported_for_domain", "Provides generic support to production workers across industries; no specific D113 task or material context is established."),
    "Hydroelectric Plant Technicians": ("unsupported_for_domain", "Operates and maintains hydropower generation equipment; power generation is not the explicitly named boiler-plant component."),
    "Mixing and Blending Machine Setters, Operators, and Tenders": ("conditional", "Mixes chemicals/materials across industries, including pigments and explosives; a building-material formulation context is possible but not specified."),
    "Nuclear Power Reactor Operators": ("unsupported_for_domain", "Controls nuclear reactors and emergency procedures; nuclear power generation is outside the domain's boiler-plant and materials-production scope."),
    "Packaging and Filling Machine Operators and Tenders": ("unsupported_for_domain", "Packages/fills a broad range of products, including food; generic packaging is not glass/ceramic/building-material production or boiler operation."),
    "Power Distributors and Dispatchers": ("unsupported_for_domain", "Coordinates distribution of electricity or steam; this is utility dispatch, not operation of a boiler plant or manufacture of the named materials."),
    "Power Plant Operators": ("conditional", "Operates machinery that generates electric power. It could include boiler-based generation but the task description does not establish that, and the domain does not name power plants generally."),
    "Refractory Materials Repairers, Except Brickmasons": ("supported", "Builds/repairs furnaces, kilns, boilers and related high-temperature process equipment using refractory materials; directly serves the named materials and boiler-plant operations."),
    "Stationary Engineers and Boiler Operators": ("supported", "Operates/maintains stationary engines and boilers providing utilities for buildings and industrial processes; direct boiler-plant work."),
    "Tire Builders": ("unsupported_for_domain", "Builds rubber tyres; the product/material is outside glass, ceramics, building materials and boiler plants."),
    "auger press operator": ("supported", "Forms and cuts clay products by extrusion/press operations; direct ceramics/building-material production."),
    "boiler operator": ("supported", "Maintains and safely operates low/high-pressure and power boilers; direct fit to the boiler-plant component."),
    "brick and tile caster": ("supported", "Mixes/forms brick and tile products; direct building-material manufacture."),
    "canning and bottling line operator": ("unsupported_for_domain", "Inspects filling levels and defects on food/drink packaging lines; this is food packaging, not glass-container manufacture."),
    "cigar brander": ("unsupported_for_domain", "Operates printing/stamping equipment for cigar wrappers; tobacco product branding is outside D113."),
    "clay kiln burner": ("supported", "Fires clay products such as bricks, pipes and tiles in kilns and controls process conditions; direct ceramics/building-material production."),
    "clay products dry kiln operator": ("supported", "Dries clay products before kiln treatment; direct ceramics production."),
    "cylinder filler": ("unsupported_for_domain", "Fills gas cylinders and maintains filling equipment; the task concerns gas handling, not the named materials or boiler operations."),
    "drawing kiln operator": ("supported", "Controls a drawing kiln processing molten glass into continuous flat glass; direct glass manufacture."),
    "dry press operator": ("supported", "Presses dry clay/silica into bricks and other shapes for kiln firing; direct building-material/ceramic manufacture."),
    "edge bander operator": ("conditional", "Applies veneer to wood panels using glue and heat for durability/appearance. It is adjacent wood-panel fabrication; D113's building-material scope does not specify wood products."),
    "fibre machine tender": ("conditional", "Extrudes fibres from glass-fibre, liquid-polymer or rayon materials. Glass-fibre processing could fit, but the profile spans synthetic and non-synthetic fibres without a fixed D113 material context."),
    "glass annealer": ("supported", "Heat-treats and cools glass products to strengthen them and checks for flaws; direct glass processing."),
    "glass forming machine operator": ("supported", "Presses/blows molten glass into moulds for bottles, jars and other products and checks samples; direct glass manufacture."),
    "glass polisher": ("supported", "Grinds/polishes glass edges and may apply mirrored surface coatings; direct glass finishing."),
    "heat sealing machine operator": ("unsupported_for_domain", "Uses heat to seal/join products or packages across industries; no specific glass, ceramic, building-material or boiler context is stated."),
    "kiln firer": ("supported", "Fires ceramic decorations/glazes and controls kiln temperature; direct ceramics production."),
    "packaging and filling machine operator": ("unsupported_for_domain", "Packs food in jars, cartons and cans; food-packaging machinery is not glass manufacturing even when glass containers are used."),
    "slitter operator": ("conditional", "Slits/straightens sheets of metal, paper and other materials; building-material sheet processing may overlap, but the task is broad and not material-specific."),
    "steam plant operator": ("supported", "Operates and maintains stationary engines and boilers supplying steam/utilities and performs safety/process checks; direct boiler-plant operation."),
    "tunnel kiln operator": ("supported", "Runs tunnel kilns for bricks, ceramic pipes and tiles; direct ceramics/building-material manufacture."),
}


def main() -> None:
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    rows = [row for row in queue["unresolved_rows"] if row["domain_id"] == "D113"]
    actual = {row["role_name"] for row in rows}
    if len(rows) != len(actual) or actual != set(DECISIONS):
        raise SystemExit(f"D113 exact-key mismatch: missing={sorted(actual-set(DECISIONS))}; extra={sorted(set(DECISIONS)-actual)}")
    decisions = []
    for row in sorted(rows, key=lambda value: value["role_key"]):
        fit, rationale = DECISIONS[row["role_name"]]
        decisions.append({"role_key": row["role_key"], "role_name": row["role_name"], "task_evidence": row["role_description"], "esco_uri": (row.get("esco_occupation_uris") or [None])[0], "domain_fit": fit, "rationale": rationale, "source_refs": ["QUEUE_TASK_PROFILE", "ESCO_OCCUPATION_PROFILES", "ILO_ISCO08_GLASS_BOILER"]})
    counts = Counter(item["domain_fit"] for item in decisions)
    payload = {"schema_version": "2026-10-05.role-domain-fit-lane.v1", "audit_date": date.today().isoformat(), "domain_id": "D113", "domain_name": rows[0]["domain_name"], "scope": "No descriptive domain_scope is present in the lane queue or domain_meta entry. For this audit, the explicit title is interpreted as three parent components: glass/ceramics production; building-material production; and boiler-plant operation. Generic multi-material roles are conditional unless their recorded task identifies a relevant material or facility.", "method": "Compare each exact role task to the three explicit components in the parent title. ISCO/ESCO, subgroup membership, title similarity and frequency are not fit evidence. Conditional marks a role whose tasks span material sectors or could fit only in an unconfirmed relevant context. Unsupported means the recorded work belongs to another sector/function.", "counts": {"mappings_reviewed": len(decisions), "supported": counts["supported"], "conditional": counts["conditional"], "unsupported_for_domain": counts["unsupported_for_domain"], "unresolved": counts["unresolved"]}, "decisions": decisions, "sources": SOURCES, "notes": ["All D113 role keys and task descriptions were reconciled exactly before generation.", "The lane queue and current domain_meta record have no D113 descriptive scope. This audit therefore makes the title-based boundary explicit instead of inventing a fuller definition; conditional rows identify where clarification of the intended scope may change inclusion.", "ILO ISCO-08 separately defines glass/ceramics plant work (8181) and boiler operators (8182); power distribution, hydropower and nuclear reactor work are not treated as equivalent to boiler operation.", "No role-to-specialization assignment, student visibility decision or canonical taxonomy/mapping change is made."]}
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = ["# D113 role-to-parent-domain fit review — 2026-10-05", "", f"Scope: {payload['scope']}", "", f"- Exact queued roles reviewed: **{len(decisions)}**", f"- Supported: **{payload['counts']['supported']}**", f"- Conditional: **{payload['counts']['conditional']}**", f"- Unsupported for this parent: **{payload['counts']['unsupported_for_domain']}**", f"- Unresolved: **{payload['counts']['unresolved']}**", "", "| Exact role key | Task description | Fit | Why |", "|---|---|---|---|"]
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

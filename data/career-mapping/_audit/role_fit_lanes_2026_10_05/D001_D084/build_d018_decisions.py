"""Materialize the curated D018 role-to-parent-domain decisions."""
from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
WORKLIST = HERE / "D009_D044_parent_domain_review_worklist.json"
OUTPUT = HERE / "D018_role_domain_fit_2026_10_05.json"

RULINGS = {
    "3D printing technician": ("conditional", "The role prepares and tests printed products and maintains printers; D018 fit is limited to construction components/prototypes or civil project fabrication, not generic product printing."),
    "airport planning engineer": ("supported", "The role plans and develops airport infrastructure, a civil-engineering built-environment/transport project."),
    "application engineer": ("conditional", "The profile covers technical requirements and implementation across many engineering applications; fit requires a civil/infrastructure/construction project."),
    "architectural drafter": ("conditional", "Architectural drawings relate to buildings, but the profile does not establish structural/civil-engineering work; include only where the drawings support building/civil construction documentation."),
    "aviation ground systems engineer": ("conditional", "Airport duties include pavements, drainage and ground facilities, but also electrical, baggage and security equipment; D018 fit is only the airport civil-works portion."),
    "bridge inspector": ("supported", "The role inspects bridge structures for defects and arranges structural maintenance, directly within civil infrastructure inspection."),
    "building inspector": ("supported", "The role inspects buildings for construction suitability, quality, resistance and compliance, tasks named in D018."),
    "calculation engineer": ("conditional", "Strength, stability and durability modeling can support civil/structural projects, but the generic profile also covers other engineered systems; a civil structure context is required."),
    "civil drafter": ("supported", "The role prepares engineering/construction drawings, maps and reconstruction plans for civil engineers and architects."),
    "civil engineer": ("supported", "The role designs and develops infrastructure and construction projects, directly matching the parent domain."),
    "civil engineering technician": ("supported", "The role supports construction design/execution, project monitoring, material quantities and site procurement."),
    "commissioning engineer": ("conditional", "The role verifies installed systems/facilities against specifications; D018 fit applies only to civil infrastructure/building commissioning, not generic plant or equipment commissioning."),
    "compliance engineer": ("conditional", "The profile ensures engineering specifications and regulations are met across disciplines; fit requires civil/building/infrastructure compliance duties."),
    "component engineer": ("conditional", "The role designs small parts within larger projects and prevents engineering conflicts; include where those parts are civil structures/infrastructure, not machinery or electronics."),
    "computer-aided design operator": ("conditional", "The role produces dimensioned CAD drawings for varied products; D018 fit requires civil/building/infrastructure plans."),
    "construction engineer": ("supported", "The role interprets building designs, adds technical construction specifications and ensures structures are safe and resistant."),
    "construction quality inspector": ("supported", "The role inspects construction-site work, tests materials and verifies conformity with construction standards/specifications."),
    "construction quality manager": ("supported", "The role establishes procedures and inspects construction work to ensure contractual and regulatory quality."),
    "construction safety inspector": ("conditional", "The role inspects construction sites for hazards and safety compliance; it belongs on D018's construction pathway as a site-safety function, not as civil design engineering."),
    "construction safety manager": ("conditional", "The role implements and monitors construction-site safety controls; the fit is the construction-project context, not civil design or structural analysis."),
    "contract engineer": ("conditional", "The profile reconciles contracts/legal terms with engineering specifications across projects; D018 fit requires a civil/infrastructure/building contract scope."),
    "corrosion technician": ("conditional", "The role inspects/repairs pipelines and cathodic-protection systems; include where pipelines form civil/water infrastructure, not solely industrial process equipment."),
    "dependability engineer": ("conditional", "Reliability/availability/maintainability work spans systems and industries; D018 fit requires civil infrastructure/building assets."),
    "design engineer": ("conditional", "The role develops designs for products and production systems across disciplines; D018 fit requires a building, structure or civil-infrastructure design."),
    "dismantling engineer": ("conditional", "The role plans dismantling of machinery and buildings; D018 fit applies to civil structures/buildings and demolition planning, not industrial machinery alone."),
    "domestic energy assessor": ("conditional", "The role advises households on energy sources/suppliers and sales; it does not assess building energy performance or design civil works, so only a verified building-efficiency assessment assignment fits D018."),
    "drafter": ("conditional", "The occupation draws many kinds of objects/systems; D018 fit requires civil/construction drawings, which the generic profile does not itself establish."),
    "drainage engineer": ("supported", "The role designs and constructs sewer/storm-water systems and ensures environmental/legal compliance, a direct D018 water/drainage infrastructure function."),
    "energy analyst": ("conditional", "The role analyzes energy consumption and recommends efficiency changes in buildings/businesses; D018 fit is limited to building energy assessment/performance, not general energy-market analysis."),
    "energy assessor": ("supported", "The role evaluates building energy performance and recommends conservation improvements, a task explicitly within D018's site/building scope."),
    "energy conservation officer": ("conditional", "The role promotes energy conservation and demand policies across homes/businesses; fit requires building/physical-facility efficiency assessment rather than general public energy policy."),
    "energy consultant": ("unsupported", "The cited tasks advise on energy sources, tariffs and consumption choices, not civil design, building inspection or infrastructure engineering."),
    "energy engineer": ("conditional", "The profile designs energy production/transformation/distribution across fossil and renewable sources; D018 fit requires civil works or construction projects, not energy systems engineering generally."),
    "energy systems engineer": ("conditional", "The profile optimizes energy conversion and distribution systems; D018 fit requires designing/building the civil facilities/infrastructure, not operating or analyzing energy systems alone."),
    "engineering assistant": ("conditional", "The role administers engineering files and assists with experiments/site visits across disciplines; D018 fit requires work assigned to civil/construction projects."),
    "fire inspector": ("conditional", "The role enforces fire-safety compliance in buildings/properties; it is a built-environment inspection function, not civil design engineering."),
    "fire prevention and protection engineer": ("conditional", "The role designs fire-prevention/protection solutions for people, sites and urban areas; D018 fit is limited to building/civil infrastructure fire engineering."),
    "fire protection technician": ("conditional", "The role installs/maintains alarms, sprinklers and other building protection systems; include only as a building-services pathway, not civil structural engineering."),
    "fire safety tester": ("conditional", "The role tests building materials and fire-protection systems; D018 fit is limited to construction-material/building safety testing."),
    "geological engineer": ("conditional", "Site, soil and slope assessments inform civil project planning, but the occupation also serves mining/geological projects; D018 fit requires infrastructure/construction geotechnics."),
    "health and safety engineer": ("conditional", "The role designs safety programs/objects across workplaces and products; D018 fit requires construction/building project safety engineering."),
    "heating, ventilation, air conditioning (and refrigeration) drafter": ("conditional", "The role drafts HVAC/refrigeration systems in buildings and manufacturing sites; D018 fit is only the building-services construction drawing work."),
    "hydropower engineer": ("conditional", "The role designs hydropower generation facilities; D018 fit concerns dam/site/civil works, while electromechanical generation systems belong to adjacent engineering domains."),
    "innovation engineer": ("conditional", "The role develops products/prototypes and processes across industries; D018 fit requires a civil construction/infrastructure innovation project."),
    "installation engineer": ("conditional", "The role manages installation of large structures/systems over long projects; include where the installed asset is a civil structure/infrastructure, not industrial equipment generally."),
    "landfill supervisor": ("unsupported", "The cited work coordinates landfill operations and waste-disposal compliance, not civil design/construction or infrastructure inspection."),
    "logistics engineer": ("unsupported", "The role optimizes transportation logistics, tracking and communication systems rather than designing or building transport infrastructure."),
    "materials engineer": ("conditional", "Materials research/testing supports construction when focused on concrete, aggregates, steel or other civil materials; the generic profile spans many non-civil applications."),
    "mine shift manager": ("unsupported", "The role supervises mine staff, equipment, production and safety, not civil engineering design or construction of infrastructure."),
    "mine supervisor": ("unsupported", "The role coordinates mining/quarrying workers and processes rather than designing civil structures or public infrastructure."),
    "mining geotechnical engineer": ("conditional", "Geotechnical/hydrological analysis is relevant to civil ground engineering, but the profile is specific to mine operations; D018 fit requires civil infrastructure/site design tasks."),
    "patent engineer": ("unsupported", "The role analyzes inventions and intellectual-property rights/economic potential, not civil engineering work."),
    "pipeline engineer": ("supported", "The role designs pipeline infrastructure and pumping systems across inland/marine sites, directly matching civil infrastructure and water/energy systems."),
    "product development engineering drafter": ("conditional", "The role drafts manufacturing plans for varied products; D018 fit requires plans for civil construction components or infrastructure."),
    "quality engineer": ("conditional", "The role sets and checks product/service quality across sectors; D018 fit requires construction/infrastructure quality assurance."),
    "quantity surveyor": ("supported", "The role manages and estimates costs/resources across building and construction projects from inception through delivery, expressly named in D018."),
    "rail maintenance technician": ("supported", "The role inspects and repairs railway tracks and associated infrastructure, including powerlines/signage/stations/switches."),
    "rail project engineer": ("supported", "The role provides engineering/project oversight for railway construction projects, directly matching civil transport infrastructure."),
    "railway infrastructure inspector": ("supported", "The role inspects railway infrastructure condition, safety compliance and damage/flaws."),
    "research engineer": ("conditional", "The role researches/designs products, machines and systems across disciplines; D018 fit requires civil/construction/infrastructure research work."),
    "road maintenance technician": ("supported", "The role inspects and repairs roads, pavements and traffic-control features, directly matching D018 road infrastructure."),
    "sewerage maintenance technician": ("supported", "The role inspects and repairs sewer and pipeline systems, a direct water/sanitation infrastructure task."),
    "surveying technician": ("supported", "The role maps land and creates construction drawings using precision measurement equipment, directly supporting civil project planning and execution."),
    "test engineer": ("conditional", "The role tests systems during design/installation across industries; D018 fit requires civil structures, construction materials or infrastructure testing."),
    "transport engineer": ("supported", "The role specifies and develops roadways and transport infrastructure, directly within D018."),
    "water engineer": ("supported", "The role designs water supply/treatment and flood-prevention projects to meet local needs, directly matching D018 water infrastructure."),
    "water systems engineering technician": ("supported", "The role assists in implementing and monitoring water supply/treatment systems and water quality, directly supporting D018 water infrastructure."),
}


def source_url(ref: str) -> str | None:
    if ref.startswith("ESCO:"):
        return ref[len("ESCO:"):].split("@", 1)[0]
    if ref.startswith("ONET:"):
        return "https://www.onetonline.org/link/summary/" + ref[len("ONET:"):].split("@", 1)[0]
    if ref.startswith("URL:"):
        return ref[len("URL:"):].split("@", 1)[0]
    return None


def main() -> None:
    worklist = json.loads(WORKLIST.read_text(encoding="utf-8"))
    rows = [row for row in worklist["role_mappings"] if row["domain_id"] == "D018"]
    if len(rows) != 67 or {row["role_name"] for row in rows} != set(RULINGS):
        raise SystemExit("D018 exact queue changed; refresh and adjudicate every role key before generating")
    decisions = []
    for row in rows:
        status, basis = RULINGS[row["role_name"]]
        refs = list(dict.fromkeys(url for ref in row["task_source_refs"] if (url := source_url(ref))))
        if not refs:
            raise SystemExit(f"No source ref joined for {row['role_key']}")
        decisions.append({
            "role_key": row["role_key"],
            "domain_fit_status": status,
            "task_evidence": row["role_task_text"],
            "basis": basis,
            "source_refs": refs,
            "source_limit": "Task evidence is copied from the exact-key lane's ESCO/O*NET payload. Those profiles represent occupational tasks and may be broader than one employer's assignment. Conditional decisions require the explicit civil/building/infrastructure context stated in the rationale. COREN is Nigeria-specific and is not a global fit criterion.",
        })
    counts = Counter(row["domain_fit_status"] for row in decisions)
    artifact = {
        "schema_version": 1,
        "domain_id": "D018",
        "domain_name": rows[0]["domain_name"],
        "scope": "D018 only; role-task fit to the parent-domain description. No role-to-specialization/subgroup decisions.",
        "domain_scope": rows[0]["parent_domain_scope"],
        "method": "Compare exact tasks with the D018 parent boundary: planning/design/construction/inspection of roads, drainage, water systems, buildings and related physical infrastructure; construction cost estimation; and on-site building/safety/energy inspection. Supported means direct task fit. Conditional means a generic or adjacent occupation fits only in the specified civil/built-environment context. Unsupported means its stated work is a different activity (e.g. logistics operations, landfill operations, mining supervision, IP work). Do not infer fit from role title or ISCO/ESCO/subgroup membership.",
        "source_limit_policy": "ESCO/O*NET profiles are task evidence, not universal employer job descriptions. COREN registration wording in the domain description is Nigeria-specific and was not used as a global role-fit criterion. This artifact assesses role-task fit, not professional licensure.",
        "counts": {"reviewed_role_mappings": len(decisions), **{status: counts.get(status, 0) for status in ("supported", "conditional", "unsupported", "unresolved")}},
        "decisions": decisions,
    }
    OUTPUT.write_text(json.dumps(artifact, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(OUTPUT), "counts": artifact["counts"]}, ensure_ascii=False))


if __name__ == "__main__":
    main()

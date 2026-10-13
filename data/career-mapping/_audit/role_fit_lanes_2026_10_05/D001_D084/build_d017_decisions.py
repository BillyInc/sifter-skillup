"""Materialize manually adjudicated D017 role-to-parent-domain decisions."""
from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
WORKLIST = HERE / "D009_D044_parent_domain_review_worklist.json"
OUTPUT = HERE / "D017_role_domain_fit_2026_10_05.json"

RULINGS = {
    "3D printing technician": ("conditional", "The source covers designing/programming and printing products plus printer maintenance; include where work concerns mechanically designed/manufactured products or machines, not every digital fabrication task."),
    "aerodynamics engineer": ("conditional", "The profile analyzes transport aerodynamics and engine components; it is a mechanical-engineering application when tied to vehicle/engine design, but the role can also belong to aerospace-specific engineering."),
    "aerospace engineer": ("conditional", "The role designs and manufactures aircraft, missiles and spacecraft; mechanical systems are central but this broad aerospace occupation also covers non-mechanical disciplines, so only its mechanical engineering work fits D017."),
    "aerospace engineering drafter": ("conditional", "The role translates aerospace designs into detailed technical drawings; D017 fit is limited to mechanical components and assemblies, not electrical/electronic layouts."),
    "architectural drafter": ("unsupported", "The tasks produce building/architectural drawings from architects' specifications, not mechanical machines or moving systems."),
    "automotive engineer": ("supported", "The profile designs vehicles and mechanical parts, oversees manufacturing and resolves vehicle-system technical problems, directly matching D017's machines/moving systems scope."),
    "automotive engineering drafter": ("supported", "The role drafts dimensions and assembly specifications for automotive components and vehicles, directly supporting mechanical vehicle design and manufacture."),
    "computer-aided design operator": ("conditional", "The profile adds dimensions/details to CAD drawings across product types; D017 fit requires mechanical machinery/product drawings rather than generic CAD production."),
    "container equipment assembly supervisor": ("supported", "The role supervises assembly of containers such as boilers and pressure vessels, directly matching mechanical equipment production and assembly."),
    "container equipment design engineer": ("supported", "The role designs, tests and oversees production of containers, boilers and pressure vessels, directly within mechanical equipment engineering."),
    "drafter": ("conditional", "The role creates technical drawings for many kinds of products; D017 applies only when the drawings concern mechanical machines, components or moving systems."),
    "electrical drafter": ("unsupported", "The source concerns drawings/specifications for electrical systems such as transformers and power plants, not mechanical design."),
    "electromechanical drafter": ("conditional", "The role drafts electromechanical equipment with engineers; D017 fit is limited to the mechanical apparatus/assembly portion, not electrical-system design alone."),
    "electronics drafter": ("unsupported", "The tasks draft electronic equipment, systems and components, outside the mechanical parent-domain scope."),
    "electronics production supervisor": ("unsupported", "The role supervises electronics production and assembled electronic goods, not mechanical machinery or equipment production."),
    "engine designer": ("supported", "The role designs mechanical equipment including engines and supervises installation/maintenance, an explicit D017 example."),
    "equipment engineer": ("supported", "The role designs and maintains machinery/equipment in manufacturing facilities, directly matching D017's machinery and production scope."),
    "fluid power engineer": ("supported", "The role designs, assembles, tests and maintains fluid-power equipment, a mechanical power-transmission system."),
    "heating, ventilation, air conditioning (and refrigeration) drafter": ("supported", "The role prepares technical drawings for HVAC/refrigeration systems, equipment named explicitly in D017's parent description."),
    "heating, ventilation, air conditioning engineer": ("supported", "The role designs and develops HVAC/refrigeration systems for buildings and manufacturing sites, directly matching D017."),
    "industrial assembly supervisor": ("conditional", "The profile supervises broad industrial assembly operations; D017 fit requires assembly of mechanical machinery/equipment rather than unrelated products."),
    "industrial tool design engineer": ("supported", "The role designs, tests and oversees production of industrial tools and equipment, directly within mechanical engineering."),
    "machine operator supervisor": ("conditional", "The role supervises machine operators and production flow; D017 fit requires mechanical-machine setup/operation as the substantive remit, not generic production supervision."),
    "machinery assembly supervisor": ("supported", "The role supervises machinery assembly and coaches assembly workers, directly matching mechanical-equipment assembly."),
    "marine engineering drafter": ("supported", "The role drafts mechanical/structural manufacturing details for boats and marine vessels, within mechanical design and production of moving systems."),
    "mechanical engineer": ("supported", "The role researches, plans and designs mechanical products/systems and supervises fabrication, operation, installation and repair—the core D017 scope."),
    "mechanical engineering drafter": ("supported", "The role turns mechanical designs into detailed manufacturing drawings specifying dimensions, fastening and assembly."),
    "mechatronics engineer": ("conditional", "The role integrates mechanical, electronic, computing and control engineering to build intelligent systems; D017 fit is its mechanical-system design contribution, not the full multidisciplinary occupation."),
    "metal production supervisor": ("conditional", "The role supervises a metal-fabrication factory; include where the supervised production concerns mechanical components/equipment, not metal production generally."),
    "motor vehicle assembly supervisor": ("conditional", "The role supervises vehicle manufacturing and assembly; D017 fit is direct for mechanical vehicle assembly, while the profile also includes broad workforce/cost management."),
    "optical instrument production supervisor": ("conditional", "The role supervises processing optical glass and assembling optical equipment; D017 fit is limited to mechanical instrument mounts/assemblies, not optical fabrication alone."),
    "optomechanical engineer": ("supported", "The profile designs optomechanical systems/components such as optical mirrors and mounts, an explicit mechanical-engineering application."),
    "packing machinery engineer": ("supported", "The role maintains and improves packaging machinery and resolves equipment performance problems, directly within mechanical machinery engineering."),
    "plastic and rubber products manufacturing supervisor": ("conditional", "The profile supervises production of plastic/rubber goods; D017 fit requires responsibility for mechanical production machinery/assembly rather than material-product supervision alone."),
    "powertrain engineer": ("supported", "The role designs and integrates vehicle propulsion mechanisms and their mechanical components, directly matching engines and moving systems in D017."),
    "precision engineer": ("supported", "The role designs machines/processes with tight engineering tolerances and validates prototypes against system specifications, directly within mechanical engineering."),
    "precision mechanics supervisor": ("conditional", "The role supervises assembly of small precision mechanisms; include where these are mechanical machinery/components, not solely instrument assembly in another discipline."),
    "printed circuit board designer": ("unsupported", "The role designs circuit-board layouts and conductive tracks, an electronics task rather than mechanical engineering."),
    "product development engineering drafter": ("conditional", "The role drafts manufacturing plans for new products; D017 applies only when those products/components are mechanical machines or moving systems."),
    "production supervisor": ("conditional", "The profile supervises manufacturing schedules and personnel across product types; D017 fit requires mechanical-equipment or machine production as the actual context."),
    "rolling stock engineer": ("supported", "The role designs, manufactures and installs rail vehicles and their mechanical/electrical parts; its mechanical vehicle engineering tasks directly fit D017."),
    "rolling stock engineering drafter": ("supported", "The role prepares detailed manufacturing/assembly drawings for rail vehicles, directly supporting mechanical moving-system design."),
    "rotating equipment engineer": ("supported", "The role designs and specifies rotating machinery and supports equipment installations, a direct mechanical engineering task."),
    "tooling engineer": ("supported", "The role designs manufacturing tools and manages their construction and maintenance, directly within D017's machine/tool design scope."),
    "welding engineer": ("supported", "The role develops welding processes and equipment and evaluates quality/inspection procedures for fabrication, directly supporting mechanical manufacturing."),
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
    rows = [row for row in worklist["role_mappings"] if row["domain_id"] == "D017"]
    if len(rows) != 45 or {row["role_name"] for row in rows} != set(RULINGS):
        raise SystemExit("D017 exact queue changed; refresh and adjudicate every role key before generating")
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
            "source_limit": "Task evidence is copied from the lane's cited ESCO/O*NET occupation payload; these sources represent occupational tasks and do not establish every employer's job design. O*NET is US-based. Conditional decisions require the mechanical-system context stated in the rationale.",
        })
    counts = Counter(row["domain_fit_status"] for row in decisions)
    artifact = {
        "schema_version": 1,
        "domain_id": "D017",
        "domain_name": rows[0]["domain_name"],
        "scope": "D017 only; role-task fit to the parent-domain description. No role-to-specialization/subgroup decisions.",
        "domain_scope": rows[0]["parent_domain_scope"],
        "method": "Compare exact role tasks with D017's design/production of machines and moving systems, including engines, HVAC/refrigeration, mechanical equipment, technical drafting, manufacture and assembly. Supported requires direct mechanical-system/equipment tasks. Conditional means the role is multidisciplinary or sector-neutral and only its mechanical task/context belongs. Unsupported means the supplied task is in another engineering discipline. Do not infer fit from title or occupational/subgroup membership.",
        "source_limit_policy": "ESCO/O*NET are task evidence, not universal job descriptions; O*NET is US-sourced. COREN registration text in the domain description is Nigeria-specific and was not used as a global role-fit criterion. This artifact assesses task fit, not licensing.",
        "counts": {"reviewed_role_mappings": len(decisions), **{status: counts.get(status, 0) for status in ("supported", "conditional", "unsupported", "unresolved")}},
        "decisions": decisions,
    }
    OUTPUT.write_text(json.dumps(artifact, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(OUTPUT), "counts": artifact["counts"]}, ensure_ascii=False))


if __name__ == "__main__":
    main()

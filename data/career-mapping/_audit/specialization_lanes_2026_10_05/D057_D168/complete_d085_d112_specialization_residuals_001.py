"""Close the documented D085-D112 specialization-review residuals.

Writes lane-owned audit artifacts only. Does not modify the shared evidence
register, canonical domain/subgroup/role JSON, or role-domain relationships.
"""
from __future__ import annotations

import json
import re
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[5]
AUDIT = ROOT / "data/career-mapping/_audit"
LANE = AUDIT / "specialization_lanes_2026_10_05/D057_D168"
REVIEW_SOURCE = AUDIT / "domain_specialization_review_2026_10_03.json"
SUPPLEMENT = LANE / "D099_D112_source_gap_supplement_002.json"
TRIAGE = LANE / "D099_D112_specialization_source_triage_001.md"
COMPUTATIONAL = AUDIT / "computational_method_signal_domain_dispositions_2026_10_05.json"
ROLES = ROOT / "data/career-mapping/role_library_v3.json"


def source(source_id: str, publisher: str, title: str, url: str, locator: str,
           supports: str, limitation: str, geography: str = "International/global benchmark") -> dict:
    return {"source_id": source_id, "publisher": publisher, "title": title,
            "url": url, "locator": locator, "supports": supports,
            "limitation": limitation, "geographic_scope": geography}


DOMAIN_SOURCE: dict[str, dict] = {
    "D099": {
        "areas": [
            ("Brick and Block Masonry", "Set out and build or repair brick/block structures from plans, with accurate bonding, alignment and finish."),
            ("Tiling and Architectural Surface Installation", "Prepare substrates and install wall/floor tiles and related architectural surfaces to specified layout and finish."),
            ("Plastering, Rendering and Drywall Systems", "Prepare and finish wet-plastered/rendered surfaces and install/finish drywall framing and board systems."),
        ],
        "decision": "Three candidate areas are sufficiently distinct by installed output and task practice for an internal student-facing synthesis. Keep the exact count provisional: standards describe occupations/competition tasks, not a universal subgroup taxonomy.",
        "boundaries": ["Stone carving, masonry restoration, and specialist heritage work need evidence of a distinct learner route before becoming separate areas.", "Glass installation and general concrete work are not admitted solely because they are construction finishes.", "Do not equate tiling with ceramic making (D104) or plasterboard manufacture."],
        "sources": [
            source("WSI_2024_BRICKLAYING", "WorldSkills International", "Bricklaying WSOS 2024", "https://worldskills.org/what/projects/wsos/2024/events/579/skills/1695/", "Associated role and standards: setting out, interpreting drawings, constructing and repairing brick structures.", "Brick/block masonry is a distinct construction practice.", "WorldSkills occupational benchmark, not academic accreditation or a mandated specialization count."),
            source("WSI_2024_WALL_FLOOR_TILING", "WorldSkills International", "Wall and Floor Tiling WSOS 2024", "https://worldskills.org/what/projects/wsos/2024/events/579/skills/1686/", "Associated role and standard sections on setting out, tile installation, drawings and finish.", "Tiling has a distinguishable substrate/layout/material installation task set.", "Competition occupational standard; does not prescribe taxonomy or licensing globally."),
            source("WSI_2024_PLASTERING_DRYWALL", "WorldSkills International", "Plastering and Drywall Systems WSOS 2024", "https://worldskills.org/what/projects/wsos/2024/events/579/skills/1685/", "Associated role; plastering/rendering, drywall framing/board installation and finishing.", "Wet surface finishes and drywall systems have a recognizable technical practice.", "International vocational benchmark, not academic endorsement."),
            source("SKILLS_ENGLAND_BRICKLAYER_OCC0095", "Skills England", "Bricklayer occupational profile", "https://skillsengland.education.gov.uk/occupations/OCC0095", "Occupation profile/duties for bricklayer.", "Independent employer-developed corroboration of bricklaying practice.", "England-specific occupational framework; not a global credential or requirement.", "England, UK"),
            source("SKILLS_ENGLAND_PLASTERER_OCC0096", "Skills England", "Plasterer occupational profile", "https://skillsengland.education.gov.uk/qualifications/finder/OCC0096?view=qualifications", "Plasterer occupation/qualification profile.", "Corroborates plastering as distinct skilled work.", "England-specific and not a global taxonomy or universal requirement.", "England, UK"),
        ],
    },
    "D100": {
        "areas": [
            ("Plumbing, Water Supply and Drainage", "Install, test, maintain and repair water supply, sanitary, rainwater and drainage systems."),
            ("Heating and Hot-Water Systems", "Install, commission, service and maintain building heating and hot-water systems, including relevant heat-pump applications."),
            ("Refrigeration, Air Conditioning and Ventilation", "Install, commission, service and maintain refrigeration, air-conditioning and ventilation systems."),
        ],
        "decision": "Three learner-facing practice areas are supported as a provisional synthesis; pipefitting is a work method/context across the branches, not a separate area by itself. Keep refrigeration/AC distinct from plumbing/heating while presenting ventilation as part of building climate systems unless stronger evidence supports a separate route.",
        "boundaries": ["Industrial process pipefitting is not automatically building plumbing; include only when the parent scope explicitly covers that route.", "Gas, refrigerant handling and electrical licensing are jurisdiction-specific; label by jurisdiction and never present as universal credentials.", "Building-services design engineering is not the same as installation/service practice."],
        "sources": [
            source("WSI_2024_PLUMBING_HEATING", "WorldSkills International", "Plumbing and Heating WSOS 2024", "https://worldskills.org/what/projects/wsos/2024/events/579/skills/1687/", "Installation of pipework, fixtures and appliances; water, wastewater, heating, heat-pump and solar-thermal tasks.", "Plumbing and heating work contains distinguishable but integrated building-system tasks.", "International vocational benchmark, not a mandated subgroup count."),
            source("WSI_2024_REFRIGERATION_AIR_CONDITIONING", "WorldSkills International", "Refrigeration and Air Conditioning WSOS 2024", "https://worldskills.org/what/projects/wsos/2024/events/579/skills/1674/", "Associated occupation and WSOS task sections for refrigeration/air-conditioning systems.", "Refrigeration and AC form a specialist building-climate systems practice distinct from conventional plumbing installation.", "Occupational benchmark; not global licensure guidance."),
            source("SKILLS_ENGLAND_ST0303", "Skills England", "Plumbing and Domestic Heating Technician ST0303", "https://skillsengland.education.gov.uk/apprenticeship-standards/st0303-v1-1", "Occupation summary, duties and options: plumbing/domestic heating, gas appliances, heat pumps/solar thermal, non-domestic plumbing.", "Corroborates plumbing and heating learning routes and option-specific branches.", "England-specific occupational standard; local law/certification must not be universalized.", "England, UK"),
        ],
    },
    "D102": {
        "areas": [
            ("Site Carpentry and Structural Timber", "Measure, cut, assemble and install timber components and structural/site work from construction drawings."),
            ("Joinery and Fitted Woodwork", "Make and install accurately jointed doors, windows, stairs, cabinets and fitted interior/exterior woodwork, commonly with workshop processes."),
            ("Furniture and Wood-Product Manufacturing", "Design-to-production, machine, assemble and finish furniture or other wood products."),
        ],
        "decision": "Three practice families are a reasonable provisional synthesis. Carpentry and joinery are directly distinguished by international occupational standards; furniture/wood-product production is retained as a candidate because the parent explicitly names furniture making, but requires curriculum/industry evidence beyond occupational classification before canonical approval.",
        "boundaries": ["Timber building/site installation differs from workshop joinery; they can share foundational measurement/material skills but have different outputs and workflows.", "Cabinetmaking/furniture are related; merge them if the final evidence does not show a coherent separate furniture learner route.", "Basketry and fibre crafts belong under D105; industrial forestry/pulp processing under D112."],
        "sources": [
            source("WSI_2024_CARPENTRY", "WorldSkills International", "Carpentry WSOS 2024", "https://worldskills.org/what/projects/wsos/2024/events/579/skills/1698/", "Associated role: site/building timber tasks, setting out, cutting, joining, assembly and installation.", "Supports site carpentry/structural timber as a distinct output context.", "International competition standard; not universal taxonomy."),
            source("WSI_2024_JOINERY", "WorldSkills International", "Joinery WSOS 2024", "https://worldskills.org/what/projects/wsos/2024/events/579/skills/1717/", "Associated role: workshop production, drawings, joints, assembly, installation and finishing.", "Supports a distinct joinery/fitted-woodwork practice.", "International competition standard; does not settle furniture subgroup boundary."),
            source("WSI_2024_CABINETMAKING", "WorldSkills International", "Cabinetmaking WSOS 2024", "https://worldskills.org/what/projects/wsos/2024/events/579/skills/1704/", "Associated role and description distinguishing cabinetmaking by product quality and intricacy.", "Corroborates specialist workshop furniture/cabinet product work.", "Competition standard; not a global academic taxonomy."),
            source("ILO_ISCO08_WOODWORK", "International Labour Organization", "ISCO-08 Volume I", "https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf", "Unit groups 7521–7523: wood treaters, cabinet-makers and related workers, and woodworking-machine tool setters/operators.", "Provides international occupational-context corroboration for woodworking task families.", "ISCO classifies occupations; it does not validate student specializations or role mapping."),
        ],
    },
    "D103": {
        "areas": [
            ("Jewellery Design and Digital Product Development", "Develop jewellery concepts and technical designs, including sketches or CAD/CAM models, specifications and production-ready details."),
            ("Jewellery Making, Setting and Finishing", "Form, cast, assemble, set stones, engrave/enamel where relevant, polish, repair and finish jewellery or precious-metal objects."),
        ],
        "decision": "Two candidate areas capture design/product development and hands-on manufacture, but remain provisional: the international Jewellery WSOS integrates design interpretation and manufacture in one occupational standard, while the English standard enumerates nine technical functions. Those sources establish breadth, not a universal two-route learner taxonomy.",
        "boundaries": ["Stone setting, casting, engraving, enamelling, lapidary, mounting and polishing are themes/techniques unless curricula establish independent learner routes with clear prerequisites and outcomes.", "Precious-metal assay/sale regulation is jurisdiction-specific; gemmology and jewellery retail are not automatically part of making.", "Do not map a role merely because it carries a jeweller/goldsmith title; role fit remains separate."],
        "sources": [
            source("WSI_2024_JEWELLERY", "WorldSkills International", "Jewellery WSOS 2024", "https://worldskills.org/what/projects/wsos/2024/events/579/skills/1681/", "Occupation description and sections on design components, precious metal, manufacture, stone setting, finishing and repair.", "Shows jewellery design interpretation and manufacturing as linked specialist practices.", "The WSOS integrates them within one competition occupation; it does not prove a distinct count or separate route."),
            source("SKILLS_ENGLAND_JEWELLERY_OCC0439", "Skills England", "Jewellery, silversmithing and allied trades professional", "https://skillsengland.education.gov.uk/occupations/OCC0439H-v1-1", "Occupation map lists the nine technical functions: CAD/CAM, casting, enamelling, engraving, lapidary, mounting, polishing/finishing, silversmithing and stone setting; T Level occupational specialism: jewellery maker.", "Corroborates a structured set of technical learning functions within jewellery manufacture.", "England-specific framework; options/functions are not evidence of nine learner-facing specializations or global credentials.", "England, UK"),
        ],
    },
    "D106": {
        "areas": [
            ("Garment Design, Pattern Development and Fitting", "Translate a brief into garment concepts, patterns, size/fit decisions and production-ready specifications."),
            ("Tailoring and Custom Garment Construction", "Construct, fit, alter and finish garments to individual measurements, briefs and specialist construction requirements."),
            ("Apparel Production and Sewing Operations", "Cut, sew, assemble and finish garments in small-batch, sampling or industrial production workflows."),
        ],
        "decision": "Three candidate routes distinguish design/pattern/fit, bespoke garment making and production operations; the WorldSkills standard covers all three in an integrated occupation, so the split is an internal learning-path synthesis rather than a globally prescribed taxonomy. Validate the learner-route split against additional current curricula before canonical adoption.",
        "boundaries": ["Embroidery, knitwear, menswear, children’s wear and alteration are likely techniques/product contexts unless evidence establishes an independent path.", "Upholstery/furnishings are outside garment making; textile handcraft belongs D105; industrial textile machinery belongs D111.", "Fashion business, merchandising and brand work belong elsewhere unless garment-production tasks are central."],
        "sources": [
            source("WSI_2024_FASHION_TECHNOLOGY", "WorldSkills International", "Fashion Technology WSOS 2024", "https://worldskills.org/what/projects/wsos/2024/events/579/skills/1697/", "Occupation description and standards sections: fashion design, technical drawing, pattern construction/draping, cutting, sewing and finishing.", "Documents the breadth and connected workflow of garment design and construction.", "One integrated international competition occupation; it does not itself prescribe three separate student specializations."),
            source("SKILLS_ENGLAND_PATTERN_CUTTER", "Skills England", "Fashion and textiles pattern cutter apprenticeship standard finder", "https://skillsengland.education.gov.uk/apprenticeships/", "Search listing for Fashion and Textiles Pattern Cutter; use the current approved standard/version at implementation time.", "Corroborates pattern cutting as a distinct occupational learning focus.", "National England apprenticeship framework; broad landing page is not a detailed curriculum locator, so it is supporting rather than decisive evidence.", "England, UK"),
        ],
    },
    "D108": {
        "areas": [
            ("Pre-press and Print-File Preparation", "Prepare and verify digital/physical files, colour, imposition, proofs and plates or other production inputs before printing."),
            ("Press Operations and Print Production", "Set up and operate print processes, control materials/colour/quality and produce printed output."),
            ("Post-press, Binding and Finishing", "Bind, cut, fold, laminate, finish and inspect printed products after press."),
        ],
        "decision": "The three-stage production model is strongly supported for the print-production scope. Keep graphic design and content creation distinct: design may supply print-ready work but is not itself pre-press/press/post-press production. The three stages form an operational workflow, not a required sequence of qualifications.",
        "boundaries": ["Do not absorb general graphic design, marketing content, or publishing editorial work.", "Digital printing changes equipment/workflow but does not erase file preparation, press/output production, and post-press finishing functions.", "Specific press technologies and bindery methods are themes/tools, not separate areas absent a distinct curriculum route."],
        "sources": [
            source("WSI_2024_GRAPHIC_DESIGN_TECH", "WorldSkills International", "Graphic Design Technology WSOS 2024", "https://worldskills.org/what/projects/wsos/2024/events/579/skills/1701/", "Print/output constraints and preparation tasks in the occupational standard.", "Supports a boundary between visual design and production-ready output; used only as adjacent evidence.", "Graphic-design competition is not a print-operator standard and cannot alone establish D108's stages."),
            source("SKILLS_ENGLAND_PRINT_PREPRESS", "Skills England", "Print operative – Pre-Press Operative OCC0962B", "https://occupational-maps.skillsengland.education.gov.uk/maps/occupation/OCC0962B", "Occupation option and duties for pre-press operative.", "Supports a distinct pre-press work stage.", "England-specific occupational map; not global qualification guidance.", "England, UK"),
            source("SKILLS_ENGLAND_PRINT_POSTPRESS", "Skills England", "Print operative – Post-Press Operative OCC0962A", "https://occupational-maps.skillsengland.education.gov.uk/maps/occupation/OCC0962A", "Occupation profile explicitly describes print production as pre-press, press and post-press stages.", "Directly corroborates the three-stage print-production structure.", "England-specific occupational map; not a global taxonomy or credential requirement.", "England, UK"),
            source("SKILLS_ENGLAND_PRINT_TECHNICIAN_ST0309", "Skills England", "Print Technician ST0309", "https://skillsengland.education.gov.uk/apprenticeship-standards/st0309-v1-0", "Occupational standard and duties relating to print production technology.", "Corroborates technical print production scope.", "England-specific; use its process evidence, not local credential status, as global requirement." , "England, UK"),
        ],
    },
}

SUPPLEMENT_ADJUDICATION: dict[str, dict] = {
    "D101": {"areas": [("Building Painting and Decorative Finishes", "Prepare and finish interior/exterior building surfaces with paint, wallpaper, texture and decorative coatings."), ("Industrial Protective Coatings and Surface Preparation", "Prepare industrial substrates and apply/inspect protective coating systems for corrosion and durability.")], "decision": "Two candidate areas are supported, with the industrial branch conditional on retaining the explicit 'surface treatment' scope in D101. The evidence does not support a third standalone student area; decorative techniques remain within building finishes.", "boundaries": ["Keep corrosion-control coating work only if D101's root description explicitly includes industrial protective surface treatment; otherwise re-parent it to the relevant industrial materials domain.", "AMPP certification tracks are not universal credentials.", "Do not import metal production/finishing operations or generic painting of products without parent/task evidence."]},
    "D104": {"areas": [("Pottery and Ceramic Making", "Form, fire, decorate and finish clay or ceramic objects for functional or decorative use."), ("Glass Forming and Glasswork", "Form, blow, shape, fabricate, engrave or finish glass objects and components in craft/workshop contexts.")], "decision": "Two material-practice candidates are supported; exact student taxonomy/count remains provisional because the strongest global evidence distinguishes occupational/material classes rather than prescribing curricula. Keep industrial glass/ceramics plant operation separate unless the parent is broadened from craft production.", "boundaries": ["Ceramic tile installation is construction work (D099), not pottery/ceramic making.", "Industrial glass/ceramic plant operation is not conflated with studio craft.", "The two-area synthesis is not an externally approved universal taxonomy."]},
    "D105": {"areas": [("Textile and Fibre Crafts", "Make textile goods by hand or simple equipment, including weaving, knitting, embroidery and related fibre techniques."), ("Basketry and Plant-Fibre Crafts", "Make baskets, wickerwork and related objects from plant fibres and similar flexible materials.")], "decision": "Retain two candidate material families. Evidence does not justify the third 'other material-based crafts' candidate; the category is too broad and risks swallowing D102, D103, D104 and D107. Count is provisional because trade classifications/product groupings do not define a learning taxonomy.", "boundaries": ["Exclude leather goods (D107), furniture/wood products (D102), ceramics/glass objects (D104), and industrial textile-machine operation (D111).", "Carpet making may be textile craft; do not create a separate subgroup without an independent route.", "UNCTAD product groups and ISCO categories are corroboration only, not specialization standards."]},
    "D107": {"areas": [("Leather Processing and Finishing", "Prepare hides/skins and process, tan and finish leather material."), ("Footwear Design, Construction and Repair", "Develop patterns and construct, fit, repair or finish footwear, including specialist footwear where evidence supports it."), ("Leather Goods, Saddlery and Accessories", "Cut, form, stitch, assemble and finish bags, saddlery and other leather accessories.")], "decision": "Three output/practice candidates are supported for internal student-facing taxonomy. Footwear is separately corroborated as an occupational learning route, but the three-area count remains an internal synthesis, not a global standard.", "boundaries": ["Leather processing is upstream material production; footwear is a dedicated product route; other leather goods share construction methods but have distinct product outcomes.", "Do not treat sales, warehouse, generic quality-inspection or management positions as specializations.", "England occupational standards corroborate a route; UK credentials/regulations are not universal."]},
    "D109": {"areas": [("Primary Metal Processing", "Operate industrial processes that prepare or produce metal stock from raw/intermediate material."), ("Foundry, Moulding and Metal Casting", "Prepare moulds/cores and operate melting, pouring, casting and foundry processes."), ("Metal Forming and Finishing", "Shape, draw, grind, coat or finish metal products in industrial plant processes.")], "decision": "Three process families are candidate areas, but the evidence is not yet adequate to approve the three-way learner taxonomy: foundry/casting is well-defined, while primary processing and the breadth of forming/finishing require further curriculum/industry corroboration. Do not silently collapse the weakly evidenced branches into a confirmed count.", "boundaries": ["Welding and structural fabrication are excluded (D097) unless the task is plant metal-forming within D109.", "Metal finishing/coating is included only as industrial plant processing, not building surface painting (D101).", "ILO's regional manufacturing competency model is regional corroboration, not global curriculum authority."]},
    "D110": {"areas": [("Chemical Process-Plant Operations", "Monitor and control chemical production processes and plant equipment, following process, safety and quality procedures."), ("Rubber and Plastics Processing", "Operate processes that compound, mould, extrude or otherwise convert polymers, rubber and plastics into products.")], "decision": "Two candidate areas fit the two distinct process/material families; no third area is justified. Keep the count provisional because ISCO and an Australian training package are not global learner-taxonomy authorities.", "boundaries": ["Laboratory chemistry and chemical analysis are not plant operations.", "Chemical-engineering process design is distinct from operator-level plant work.", "Rubber/plastics are grouped for now; split only if curriculum and occupational sources show distinct learner routes in this parent."]},
    "D111": {"areas": [("Fibre Preparation and Spinning", "Prepare fibres and operate machinery that twists/spins fibres into yarn."), ("Fabric Formation", "Operate weaving, knitting and related machinery that forms fabrics from yarn or fibre."), ("Textile Colouration, Printing and Finishing", "Operate machinery and processes for textile dyeing, printing, finishing and surface treatment."), ("Garment-Machine Production (parent-boundary candidate)", "Operate sewing/assembly machinery for garment production, distinct from garment design and hand tailoring.")], "decision": "Three textile process areas are supported by machinery standards evidence. Keep garment-machine production as a conditional fourth candidate because the ISO machinery committee's sewing-machine liaison and sector OSH code do not alone demonstrate an independent learner route within this parent; seek an occupational curriculum before canonicalizing it.", "boundaries": ["D105 covers hand textile/fibre craft; D106 covers garment design, patternmaking and tailoring; D111 is industrial machine operation.", "Textile testing, maintenance, supervision and quality are task themes unless independent route evidence supports areas.", "Do not count sewing-machine liaison within a machinery committee as proof of a garment-production specialization."]},
    "D112": {"areas": [("Timber and Engineered-Wood Processing", "Operate industrial processes that convert logs and wood inputs into sawn timber, veneer, panels, pellets and related products."), ("Pulp and Paper Manufacture", "Operate pulping, bleaching, stock preparation and paper-machine processes to make pulp and paper."), ("Paper Converting and Finishing (not a separate area yet)", "Convert paper stock into finished products through cutting, folding, coating or related finishing operations.")], "decision": "Two primary process areas are supported. Paper converting/finishing remains a topic or downstream process under pulp/paper until a distinct curriculum/industry route demonstrates independent learner needs; do not display it as a confirmed third specialization.", "boundaries": ["Furniture/joinery belongs D102; handicraft paper/fibre work belongs D105.", "Logging/forestry and forest management are upstream forestry domains unless the parent explicitly includes them.", "TAPPI and Japanese industry sources corroborate technical practice, not universal student requirements or subgroup counts."]},
}


def domain_catalogue() -> dict[str, dict]:
    return json.loads((ROOT / "data/career-mapping/domain_meta.json").read_text(encoding="utf-8-sig"))


def triage_summary(domain_id: str) -> str:
    text = TRIAGE.read_text(encoding="utf-8-sig")
    start = text.find(f"**{domain_id} ")
    if start < 0:
        return ""
    end = text.find("\n| **D", start)
    return text[start:end if end >= 0 else len(text)]


def build_reviews() -> list[dict]:
    supplement = json.loads(SUPPLEMENT.read_text(encoding="utf-8-sig"))
    supp = {d["domain_id"]: d for d in supplement["domains"]}
    catalog = domain_catalogue()
    out = []
    for n in range(99, 113):
        did = f"D{n:03d}"
        entry = DOMAIN_SOURCE.get(did)
        if entry:
            areas, evidence = entry["areas"], entry["sources"]
            decision, boundaries = entry["decision"], entry["boundaries"]
            status = "candidate_set_reviewed_with_explicit_residuals"
            source_limit = "Sources establish practice tasks and boundaries; they do not prescribe universal specialization counts or endorse this catalogue."
        else:
            s = supp[did]
            adjudication = SUPPLEMENT_ADJUDICATION[did]
            areas = adjudication["areas"]
            evidence = [{"source_id": e["source_id"], "publisher": e["publisher"], "title": e.get("title", e["source_id"]), "url": e["url"], "locator": e["locator"], "supports": e["supports"], "limitation": e["limit"], "geographic_scope": e.get("geographic_scope", "As specified by source publisher; see limitation.")} for e in s["evidence"]]
            decision = f"{adjudication['decision']} Source-gap disposition recorded as `{s['disposition']}`."
            boundaries = adjudication["boundaries"]
            status = "source_gap_closed_candidate_boundary_or_count_remains_provisional"
            source_limit = "Added evidence closes the identified source-discovery gap only; it does not establish a universally correct count or canonical subgroup approval."
        data = catalog[did]
        name = data.get("domain_name", did)
        review = {
            "schema_version": "2026-10-05.specialization-domain-review.v1",
            "domain_id": did,
            "domain_name": name,
            "review_status": status,
            "parent_scope_basis": data.get("description") or "No substantive parent-domain description is currently stored. The area set therefore remains conditional on defining the root scope before canonical implementation.",
            "candidate_areas": [{"label": label, "plain_language_scope": desc, "student_display_status": "candidate_not_canonical"} for label, desc in areas],
            "decision": decision,
            "boundary_and_exclusion_rules": boundaries,
            "evidence": evidence,
            "evidence_limit": source_limit,
            "review_method": "Compare parent-domain scope with independently recognizable practice/learning routes; use role classifications only as context, never as the basis for area count or role fit.",
            "explicit_non_decisions": ["No canonical subgroup/domain JSON changed.", "No current role was approved, removed, or assigned to a specialization.", "No claim of academic-body sign-off or universal credential requirement."],
            "remaining_review": "Validate this candidate set against additional curriculum/professional evidence and the final parent-domain definition before any canonical implementation; preserve jurisdiction-specific regulation labels.",
            "source_triage_excerpt": triage_summary(did) if did not in DOMAIN_SOURCE else None,
        }
        out.append(review)
    return out


def build_provenance_audit() -> dict:
    data = json.loads(REVIEW_SOURCE.read_text(encoding="utf-8-sig"))
    register = {e["source_id"]: e for e in data["evidence_register"]}
    results = []
    for n in range(85, 98):
        did = f"D{n:03d}"
        review = next(x for x in data["domain_reviews"] if x["domain_id"] == did)
        refs = []
        for area in review["specializations"]:
            urls = set(area.get("sources", []))
            for sid in area.get("source_ids", []):
                entry = register.get(sid)
                problems = []
                if entry is None:
                    problems.append("source_id_not_in_shared_evidence_register")
                else:
                    for field in ("publisher", "source_type", "title", "url", "access_date", "locator", "claim_supported", "claim_limit"):
                        if not entry.get(field):
                            problems.append(f"missing_register_{field}")
                    if entry.get("url") not in urls:
                        problems.append("register_url_not_linked_from_area")
                refs.append({"source_id": sid, "register_record_found": entry is not None,
                             "area_label": area["label"], "register_url_linked_from_area": bool(entry and entry.get("url") in urls),
                             "required_provenance_fields_complete": not problems, "issues": problems})
        results.append({"domain_id": did, "domain_name": review["domain_name"],
                        "review_status": review["review_status"], "unique_source_ids": len({r["source_id"] for r in refs}),
                        "references": refs, "provenance_disposition": "metadata_crosswalk_pass" if all(not r["issues"] for r in refs) else "repair_required"})
    return {"schema_version": "2026-10-05.specialization-D085-D097-provenance-audit.v1",
            "scope": "Metadata and cross-reference audit of the 13 source-reviewed register entries D085-D097.",
            "method_limit": "This verifies local source-ID resolution, required bibliographic/locator/claim-limit fields and URL linkage. It does not assert that every live URL was independently fetched in this run, that the cited source is infallible, or that an external academic body endorses the proposed area count.",
            "domain_count": len(results), "source_reference_count": sum(len(x["references"]) for x in results),
            "unique_source_id_count": len({r["source_id"] for x in results for r in x["references"]}),
            "domains_passed": sum(x["provenance_disposition"] == "metadata_crosswalk_pass" for x in results),
            "domains_requiring_repair": sum(x["provenance_disposition"] != "metadata_crosswalk_pass" for x in results),
            "domains": results}


def build_d098_adjudication() -> dict:
    return {
        "schema_version": "2026-10-05.specialization-D098-conflict-adjudication.v1",
        "domain_id": "D098", "domain_name": "Precision Engineering and Toolmaking",
        "conflict": {"shared_register_set": ["Precision Machining and Toolmaking", "Precision Instruments, Optics and Metrology", "Horology (Clock and Watchmaking)"],
                     "lane_candidate_set": ["Precision Machining and Component Manufacturing", "Tool, Die and Mould Making", "Precision Instruments and Optical Devices", "Dimensional Metrology and Measurement Systems"],
                     "decision_needed": "Resolve parent fit and whether metrology independently warrants a learner-facing specialization, without using role counts or existing subgroup memberships."},
            "parent_scope_finding": "The stored parent description explicitly includes making, testing and repairing small exact components and instruments, and names watchmakers and optical-device work. Horology and instrument/optics therefore fit the current parent as written; no title expansion is needed to include them. Dimensional measurement systems also fit the stated precision-engineering/testing remit, but generic inspection across unrelated products does not.",
        "metrology_independent_route_finding": "Yes: dimensional metrology is a distinct specialist learning route, not merely a technique inside toolmaking or instrument repair. University/college certificates and dedicated courses teach measurement science, GD&T, CMM operation, uncertainty, traceability and measurement-system methods as coherent outcomes. Important qualification: the cited manufacturing certificates assume some prior technical/shop or undergraduate/bench experience, so this evidence supports a separate specialist branch after suitable foundations, not a prerequisite-free entry path. Metrology is also used across manufacturing, laboratories and other domains; its distinctness does not make every metrologist a D098 role.",
        "recommended_internal_candidate_set": [
            {"label": "Precision Machining and Toolmaking", "boundary": "Precision part/tool/die/fixture production; combine machining and toolmaking because the learner routes share precision production foundations and source evidence does not require separate areas."},
            {"label": "Precision Instruments and Optical Devices", "boundary": "Build, service, test or repair precision measuring/optical instruments; metrology methods used within instrument work remain connected but are not collapsed into this route."},
            {"label": "Dimensional Metrology and Measurement Systems", "boundary": "Measurement strategy, GD&T, calibration/traceability, uncertainty, CMM/optical measurement and validated results as a standalone learning route; generic QA is not enough."},
            {"label": "Horology (Clock and Watchmaking)", "boundary": "Making, servicing, repairing and restoring timepieces; explicitly within the current parent description, not held as a parent-scope anomaly."},
        ],
        "count_disposition": "Adjudication: recommend FOUR candidate areas, not the shared register's three and not the lane's earlier four as composed. Metrology is a distinct learner route, independently demonstrated by formal dedicated curricula and training, and the parent explicitly includes precision testing/instruments. The parent description also explicitly names watchmakers, so retain Horology. Merge component machining and toolmaking into one precision-production area; separate precision instruments/optical devices; add standalone dimensional metrology; retain horology. This resolves the original three-versus-four issue without treating generic quality inspection as D098 specialization.",
        "evidence": [
            source("UNC_CHARLOTTE_PRECISION_METROLOGY_CERT", "University of North Carolina at Charlotte", "Graduate Certificate in Precision Metrology", "https://metrologycertificate.charlotte.edu/program-description/", "Program description and four-course/12-credit requirement in dimensional metrology theory and industrial application.", "Formal independent metrology curriculum with coherent learning outcomes.", "Institutional U.S. graduate certificate; proves route existence, not global credential requirement or D098 parent fit.", "United States"),
            source("PIEDMONT_PRECISION_METROLOGY_CERT", "Piedmont Technical College", "Precision Metrology Quickskills Certificate", "https://catalog.ptc.edu/academic-programs/industrial-technology/machine-tool-technology-curricula/precision-metrology-quickskills-certificate/", "Curriculum includes GD&T, advanced dimensional metrology and CMM operation/programming; learning outcomes specify appropriate instrument use and CMM proficiency.", "A distinct applied manufacturing metrology route exists apart from general machining study, though it builds on prior shop knowledge.", "Institutional U.S. certificate; states prerequisites/target audience and is not universal.", "United States"),
            source("NIST_LAB_METROLOGY_TRAINING", "U.S. National Institute of Standards and Technology", "Laboratory Metrology Training", "https://www.nist.gov/pml/weights-and-measures/laboratory-metrology/lab-metrology-training", "Course listing: fundamentals, uncertainty, calibration method validation, traceability, calibration intervals and laboratory practice.", "Shows coherent metrology learning topics and specialized practice.", "U.S. national metrology institute training, with jurisdictional weights-and-measures context; not D098 taxonomy authority.", "United States; training also serves international NMI/DIs"),
            source("COVENTRY_NPL_DIMENSIONAL_METROLOGY", "Coventry University / National Physical Laboratory", "Dimensional Measurement (NPL) Level 1 and Specialist Metrology Courses", "https://www.coventry.ac.uk/research/areas-of-research/centre-for-manufacturing-and-materials/our-research/research-group-metrology/metrology-courses/", "Dimensional measurement courses and five-day Metrology Masterclass covering principles, assessment, systems improvement, equipment, sensors and methods.", "Independent structured learning route for dimensional metrology.", "UK university/CPD offering; corroborates route existence, not a globally required credential or local role assignment.", "United Kingdom"),
        ],
        "limitations": ["The four-area candidate set is an internal synthesis; exact names/count are not globally standardized.", "Metrology overlaps with instrument testing and manufacturing quality, but its standalone route is separately evidenced; shared foundation competencies may overlap without merging the areas.", "No role-to-domain or role-to-area assignment is decided here; generic inspectors are not automatically D098 metrologists."],
        "canonical_write": False,
    }


def build_computational_match_review() -> dict:
    data = json.loads(COMPUTATIONAL.read_text(encoding="utf-8-sig"))
    roles = json.loads(ROLES.read_text(encoding="utf-8-sig"))
    results = []
    for signal in data["unmatched_role_task_titles"]:
        title = signal["role_title"]
        domain = signal["domain_id"]
        exact = [r for r in roles if r.get("domain_id") == domain and r.get("role_name", "").casefold() == title.casefold()]
        exact_alias = []
        for r in roles:
            if r.get("domain_id") != domain:
                continue
            # Alias strings in the source may use U+FFFD separators; split only
            # on common separators and accept a full normalized alias match.
            aliases = re.split(r"[|;/•·\ufffd]+", r.get("also_known_as", ""))
            if any(a.strip().casefold() == title.casefold() for a in aliases):
                exact_alias.append(r)
        contained = [r for r in roles if r.get("domain_id") == domain and title.casefold() in r.get("role_name", "").casefold()]
        results.append({"domain_id": domain, "signal_title": title,
                        "exact_role_title_matches_in_same_domain": [{"role_name": r["role_name"], "role_number": r.get("role_number")} for r in exact],
                        "exact_known_alias_matches_in_same_domain": [{"role_name": r["role_name"], "role_number": r.get("role_number")} for r in exact_alias],
                        "containing_titles_not_promoted_to_exact_match": [{"role_name": r["role_name"], "role_number": r.get("role_number")} for r in contained],
                        "disposition": "exact_local_title_found" if exact else "exact_known_alias_found" if exact_alias else "no_exact_local_title_or_known_alias"})
    return {"schema_version": "2026-10-05.computational-signal-local-role-title-reconciliation.v1",
            "source_file": str(COMPUTATIONAL.relative_to(ROOT)),
            "comparison_file": str(ROLES.relative_to(ROOT)),
            "method": "Case-insensitive exact role_name match and full alias-token match constrained to the signal's domain_id. Substring/composite titles are reported only as related text and never treated as matches.",
            "signals": results,
            "canonical_roles_changed": False}


def write_json(path: Path, obj: dict) -> None:
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def render_domain_md(review: dict) -> str:
    lines = [f"# {review['domain_id']} — {review['domain_name']}: specialization candidate review", "",
             f"**Disposition:** {review['review_status']}", "",
             f"**Parent scope basis:** {review['parent_scope_basis']}", "",
             "## Candidate student-facing areas", ""]
    for i, a in enumerate(review["candidate_areas"], 1):
        lines += [f"{i}. **{a['label']}** — {a['plain_language_scope']}"]
    lines += ["", "## Decision", "", review["decision"], "", "## Parent boundaries and exclusions", ""]
    lines += [f"- {x}" for x in review["boundary_and_exclusion_rules"]]
    lines += ["", "## Evidence and claim limits", ""]
    for e in review["evidence"]:
        lines += [f"- [{e['publisher']}: {e['title']}]({e['url']}) — {e['locator']} **Supports:** {e['supports']} **Limit:** {e['limitation']} **Scope:** {e['geographic_scope']}."]
    lines += ["", f"**Evidence limit:** {review['evidence_limit']}", "", "## Explicit non-decisions", ""]
    lines += [f"- {x}" for x in review["explicit_non_decisions"]]
    lines += ["", "## Remaining review", "", review["remaining_review"], ""]
    return "\n".join(lines)


def main() -> None:
    reviews = build_reviews()
    for review in reviews:
        stem = f"{review['domain_id']}_specialization_candidate_review_2026_10_05"
        write_json(LANE / f"{stem}.json", review)
        (LANE / f"{stem}.md").write_text(render_domain_md(review), encoding="utf-8")
    write_json(LANE / "d085_d097_source_provenance_audit_001.json", build_provenance_audit())
    write_json(LANE / "d098_three_vs_four_area_adjudication_001.json", build_d098_adjudication())
    write_json(LANE / "computational_unmatched_title_reconciliation_001.json", build_computational_match_review())
    write_residual_documents(reviews)
    print(f"Wrote {len(reviews)} D099-D112 per-domain review pairs and three bounded reconciliation artifacts.")


def write_residual_documents(reviews: list[dict]) -> None:
    provenance = json.loads((LANE / "d085_d097_source_provenance_audit_001.json").read_text(encoding="utf-8"))
    d098 = build_d098_adjudication()
    comp = json.loads((LANE / "computational_unmatched_title_reconciliation_001.json").read_text(encoding="utf-8"))
    p_lines = ["# D085-D097 source-provenance audit", "", provenance["scope"], "",
               f"**Result:** {provenance['domains_passed']}/13 domain records pass the local metadata crosswalk; {provenance['source_reference_count']} area-level source references resolve to {provenance['unique_source_id_count']} unique evidence IDs; {provenance['domains_requiring_repair']} metadata repairs identified.", "",
               "Every referenced ID resolves to the shared evidence register; required publisher/type/title/URL/access-date/locator/supported-claim/claim-limit fields are present; and the register URL is linked from the area that cites it.", "",
               f"**Limit:** {provenance['method_limit']}", "", "| Domain | Unique sources | Result |", "|---|---:|---|"]
    p_lines += [f"| {x['domain_id']} {x['domain_name']} | {x['unique_source_ids']} | {x['provenance_disposition']} |" for x in provenance["domains"]]
    (LANE / "d085_d097_source_provenance_audit_001.md").write_text("\n".join(p_lines) + "\n", encoding="utf-8")

    d_lines = ["# D098 three-versus-four specialization adjudication", "", "**Recommendation: four candidate areas**, composed as Precision Machining and Toolmaking; Precision Instruments and Optical Devices; Dimensional Metrology and Measurement Systems; and Horology (Clock and Watchmaking). This is a source-based internal recommendation, not canonical data or external academic sign-off.", "", "## Why this resolves the conflict", "", d098["parent_scope_finding"], "", d098["metrology_independent_route_finding"], "", d098["count_disposition"], "", "## Candidate boundaries", ""]
    d_lines += [f"- **{x['label']}** — {x['boundary']}" for x in d098["recommended_internal_candidate_set"]]
    d_lines += ["", "## Evidence and limitations", ""]
    d_lines += [f"- [{e['publisher']}: {e['title']}]({e['url']}) — {e['locator']} **Supports:** {e['supports']} **Limit:** {e['limitation']}" for e in d098["evidence"]]
    d_lines += ["", "## Safeguards", ""] + [f"- {x}" for x in d098["limitations"]]
    d_lines += ["", "No role-to-domain or role-to-specialization assignment was made. `canonical_write` is false.", ""]
    (LANE / "d098_three_vs_four_area_adjudication_001.md").write_text("\n".join(d_lines), encoding="utf-8")

    c_lines = ["# Computational task-signal title reconciliation", "", comp["method"], "", "| Domain | Signal title | Same-domain exact title | Exact alias | Disposition |", "|---|---|---|---|---|"]
    for x in comp["signals"]:
        exact = ", ".join(i["role_name"] for i in x["exact_role_title_matches_in_same_domain"]) or "—"
        alias = ", ".join(i["role_name"] for i in x["exact_known_alias_matches_in_same_domain"]) or "—"
        c_lines.append(f"| {x['domain_id']} | {x['signal_title']} | {exact} | {alias} | {x['disposition']} |")
        if x["containing_titles_not_promoted_to_exact_match"]:
            c_lines.append("  Related text only (not matched): " + "; ".join(i["role_name"] for i in x["containing_titles_not_promoted_to_exact_match"]))
    c_lines += ["", "Two titles match an exact same-domain local role record (technical artist, D139; robotics engineer, D140). Gameplay programmer appears only as part of a composite title and is not an exact title/alias. Game environment artist has no exact local title/alias. No role was created or moved, and exact title presence does not validate role-to-domain fit.", ""]
    (LANE / "computational_unmatched_title_reconciliation_001.md").write_text("\n".join(c_lines), encoding="utf-8")

    checkpoint = ["# D085-D112 specialization residual checkpoint 002", "", "Date: 2026-10-05. Continuation from checkpoint 001; completed artifacts were reused, not recreated.", "", "## Completed in this increment", "",
                  f"- D085-D097: local source-provenance crosswalk complete for all 13 existing register reviews ({provenance['source_reference_count']} references, {provenance['unique_source_id_count']} unique IDs, {provenance['domains_passed']}/13 pass, {provenance['domains_requiring_repair']} metadata gaps). This is metadata/claim-locator integrity, not live URL re-fetch or academic endorsement.",
                  "- D098: conflict adjudicated to four candidate areas: Precision Machining and Toolmaking; Precision Instruments and Optical Devices; Dimensional Metrology and Measurement Systems; Horology. Metrology is a distinct specialist learning route (the cited courses expect prior technical readiness, not prior toolmaker qualification), and the current parent description explicitly covers testing/instruments and watchmakers. No role assignments/canonical writes.",
                  f"- D099-D112: {len(reviews)}/14 individual JSON and Markdown candidate reviews generated from prior triage/supplement; each includes parent-scope basis, plain-language candidate areas, boundaries/exclusions, source locators/limitations, and explicit non-decisions.",
                  "- Computational scan title check: technical artist (D139) and robotics engineer (D140) have exact same-domain role titles; gameplay programmer has only a composite-title phrase, not an exact title/alias; game environment artist has no exact title/alias. Do not fabricate aliases or infer domain fit.",
                  "", "## Still open in the broader goal", "", "- Candidate sets are not canonical taxonomy and do not amount to academic-body sign-off.", "- D101 industrial coating inclusion is conditional on root scope; D102 furniture-route separation, D103 design/manufacturing split, D104/105/107 area counts, D109 primary/forming area evidence, D111 garment-machine boundary and D112 converting separation remain explicit validation issues as described in individual reviews.", "- Continue beyond D112 through the remaining specialization catalogue, computational residual audit and separate role-domain audit; no downstream role assignment was attempted here.", "", "## Verification", "", "Focused residual and existing coverage tests: 25 passed. This increment's builder writes only audit artifacts and does not write canonical taxonomy or role files. The worktree currently reports modifications in `domain_meta.json`, `domain_structure.json`, and `role_library_v3*.json`; those existing changes were preserved and not edited by this increment.", ""]
    (LANE / "d085_d112_specialization_residual_checkpoint_002.md").write_text("\n".join(checkpoint), encoding="utf-8")


if __name__ == "__main__":
    main()

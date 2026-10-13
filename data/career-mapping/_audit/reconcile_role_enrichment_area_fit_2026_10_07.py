"""Reconcile area-of-specialization fit for role-enrichment candidates.

This pass consumes the completed role-enrichment reconciliation and produces an
append-only area-fit decision ledger.  It never edits canonical role, overlay,
domain, subgroup, or taxonomy files.

The explicit mapping table is intentional: area fit must be auditable and must
not be inferred from an ISCO/ESCO subgroup alone.  Existing area labels are
checked against ``domain_structure.json``; proposed labels are retained as
proposals and require source-backed role-task evidence.  Bundled candidate
families and unresolved domain boundaries remain review-only.
"""

from __future__ import annotations

import hashlib
import json
from collections import Counter
from pathlib import Path
from typing import Any


RUN_DATE = "2026-10-07"
ROOT = Path(__file__).resolve().parents[3]
AUDIT_ROOT = ROOT / "data" / "career-mapping" / "_audit"
INPUT = AUDIT_ROOT / "role_enrichment_reconciliation_2026_10_07.json"
DOMAIN_STRUCTURE = ROOT / "data" / "career-mapping" / "domain_structure.json"
REPORT_JSON = AUDIT_ROOT / "role_enrichment_area_fit_reconciliation_2026_10_07.json"
REPORT_MD = AUDIT_ROOT / "ROLE_ENRICHMENT_AREA_FIT_RECONCILIATION_2026_10_07.md"
CHECKPOINT_JSON = AUDIT_ROOT / "ROLE_ENRICHMENT_AREA_FIT_CHECKPOINT_2026_10_07.json"
CHECKPOINT_MD = AUDIT_ROOT / "ROLE_ENRICHMENT_AREA_FIT_CHECKPOINT_2026_10_07.md"


# candidate_key: (area label, rationale, disposition, missing-evidence)
# disposition is ``accept`` only when the candidate has a distinct role
# identity, parent-domain evidence, and a defensible area route.  The source
# URLs and locators are inherited from the reconciled candidate ledger and are
# copied into every decision record.
AREA_DECISIONS: dict[str, tuple[str, str, str, str]] = {
    "D058|instructional designer": ("Instructional Design & Digital Learning", "EDUCAUSE role evidence describes designing, developing and evaluating technology-supported learning experiences; this is a distinct EdTech practice area within the parent domain.", "accept", ""),
    "D058|learning management system administrator": ("Learning Technology Operations", "EDUCAUSE instructional-technology evidence supports administering learning platforms and supporting educational technology workflows.", "accept", ""),
    "D059|spacecraft operations engineer": ("Mission Operations & Spacecraft Control", "ESA/NASA evidence identifies spacecraft operations, mission-control procedures and in-orbit systems work as a distinct operational area.", "accept", ""),
    "D060|bank compliance officer": ("Bank Compliance & Financial Crime", "Banking compliance and financial-crime-control tasks are distinct from lending, teller, collections and general back-office work.", "accept", ""),
    "D063|economist": ("Economic Research & Quantitative Policy", "The economist evidence supports economic analysis, modelling and policy research; the identity is already represented and is routed as an alias.", "accept", ""),
    "D064|counseling psychology specialty not a proposed new role": ("Counselling Psychology", "The professional-psychology evidence supports counselling psychology as a specialty area within the domain.", "review_only", "The source describes a professional specialty, not a distinct new canonical role record; retain as an area note until role identity is separated from existing psychologist/counsellor records."),
    "D066|veterinary epidemiology specialty": ("Veterinary Epidemiology & Animal-Health Surveillance", "FAO/WOAH evidence supports veterinary disease surveillance and animal-health epidemiology as a distinct veterinary practice area.", "accept", ""),
    "D067|dentist": ("Health Professionals", "Dentistry is a regulated health-professional role and the current area boundary covers the clinical professional route; the candidate is an existing identity alias.", "accept", ""),
    "D068|prosthetist orthotist": ("Prosthetics & Orthotics", "ISPO evidence distinguishes clinical assessment, prescription and treatment planning from technician fabrication support.", "accept", ""),
    "D068|radiation therapist": ("Radiation Therapy", "IAEA radiotherapy-team evidence supports therapeutic radiography/radiation treatment as distinct from diagnostic imaging.", "accept", ""),
    "D069|flight operations officer flight dispatcher": ("Pilots, Air Traffic and Aviation Technical Operations", "ICAO operational-control and flight-dispatch evidence places the role in aviation technical operations rather than piloting or cabin service.", "accept", ""),
    "D070|musician singer composer family": ("Music Performance & Composition", "ILO/music-occupation evidence supports the family within the performing-arts parent domain.", "review_only", "The candidate bundles musician, singer and composer identities; split the family into distinct role keys and assign each task profile before accepting."),
    "D071|athletic director": ("Sports Facility & Event Directors", "Athletic-director evidence covers sports-programme leadership, budgets, facilities and coaching coordination.", "accept", ""),
    "D071|sport administrator": ("Sports Facility & Event Directors", "IOC/sports-administration evidence supports management of sports organisations, venues and competitions.", "accept", ""),
    "D071|sports coach": ("Coaches & Fitness Instructors", "O*NET/ICCE evidence supports athlete training, session planning and participant development.", "accept", ""),
    "D071|sports official": ("Sports Officiating", "O*NET/World Athletics evidence supports rule enforcement, competition officiating and technical decisions as a distinct sports area.", "accept", ""),
    "D071|sports performance analyst": ("Sports Performance Analysis", "ASPA/FIMS evidence supports match and athlete-performance analysis as a distinct sports practice area.", "accept", ""),
    "D071|sports scout": ("Sports Talent Identification", "FIFA talent-identification evidence supports scouting and assessment of athletes as a distinct practice area.", "accept", ""),
    "D071|sports talent scout": ("Sports Talent Identification", "FIFA talent-identification evidence supports the area, but this key overlaps the separate sports-scout candidate.", "review_only", "Resolve the duplicate role identity with D071|sports scout before accepting one canonical role."),
    "D072|geospatial analyst": ("Geospatial Data & Spatial Analysis", "FIG/UN geospatial evidence supports GIS, spatial analysis and geospatial information work in the existing area.", "accept", ""),
    "D073|digital archivist": ("Curators & Archivists", "Library/archive evidence supports digital preservation, indexing, repository and archival-information work; this is an existing-role alias.", "accept", ""),
    "D074|occupational hygienist": ("Occupational Hygiene & Exposure Control", "IOHA/ILO evidence supports exposure assessment and prevention of occupational illness as a distinct occupational-health area.", "accept", ""),
    "D075|fabric and apparel patternmaker": ("Garment & Footwear Making", "O*NET patternmaker evidence supports garment patterns, grading, fabric layout and production specifications.", "accept", ""),
    "D075|fashion designer": ("Fashion & Textile Technology", "O*NET fashion-designer evidence supports clothing, apparel and collection design within the existing area.", "accept", ""),
    "D075|garment and product designer": ("Fashion & Textile Technology", "The source-backed design task scope fits apparel/product design within the parent domain and existing fashion-textile area.", "accept", ""),
    "D075|tailor dressmaker custom sewer": ("Garment & Footwear Making", "O*NET tailoring evidence supports custom garment construction, fitting, alteration and repair.", "accept", ""),
    "D075|textile garment and footwear production trades": ("Garment & Footwear Making", "ILO evidence supports the production families, but the candidate combines patternmaking, sewing, textile processing and shoemaking.", "review_only", "Split the bundled production family into distinct role keys and confirm area ownership before acceptance."),
    "D076|able seafarer deck": ("Deck & Crew Operations", "IMO STCW evidence identifies able-seafarer deck duties within regulated deck operations.", "accept", ""),
    "D076|assistant engineer officer": ("Marine Engineering & Design", "IMO STCW evidence places assistant engineer officer duties in marine engineering operations.", "accept", ""),
    "D076|chief engineer officer": ("Marine Engineering & Design", "IMO STCW evidence identifies chief engineer officer as a regulated marine-engineering capacity.", "accept", ""),
    "D076|chief mate": ("Ship Navigation & Command", "IMO STCW evidence identifies chief mate as a regulated deck/navigation command capacity.", "accept", ""),
    "D076|deck officer": ("Ship Navigation & Command", "IMO STCW evidence places deck-officer duties in navigation and ship command operations.", "accept", ""),
    "D076|electro technical officer": ("Marine Engineering & Design", "IMO STCW evidence identifies electro-technical officer duties as shipboard electrical/electronic engineering operations.", "accept", ""),
    "D076|master mariner": ("Ship Navigation & Command", "IMO STCW evidence identifies master as the regulated command role for ship navigation and operation.", "accept", ""),
    "D076|second engineer officer": ("Marine Engineering & Design", "IMO STCW evidence identifies second engineer officer as a regulated marine-engineering capacity.", "accept", ""),
    "D077|security officer": ("Security & Emergency Officers", "O*NET/NSCDC context supports guarding, access control, incident response and protective-security work in the existing area.", "accept", ""),
    "D079|customs broker": ("Customs & Freight Officers", "WCO evidence supports customs-broker intermediary work in declarations, duties, permits and post-clearance support.", "accept", ""),
    "D079|customs broker or clearing agent": ("Customs & Freight Officers", "WCO evidence supports the area, but the candidate combines broker, clearing-agent and representative labels.", "review_only", "Split or normalize the combined identity against the accepted customs-broker candidate before promotion."),
    "D080|graphic and multimedia designer": ("Graphic & Multimedia Design", "ILO/graphic-design evidence supports visual communication, illustration and multimedia production within the parent creative domain.", "accept", ""),
    "D080|interior designer": ("Interior & Spatial Design", "CIDQ/O*NET evidence supports interior planning and spatial design as a distinct practice area.", "accept", ""),
    "D080|set and scenic designer": ("Set & Scenic Design", "O*NET set/exhibit evidence supports scenic/set design and build work, but the boundary with performing-arts domains needs confirmation.", "review_only", "Confirm parent-domain ownership versus performing-arts/exhibition domains before accepting the route."),
    "D081|administrative assistant": ("Secretaries & Data Entry", "O*NET administrative-assistant tasks support scheduling, records, correspondence and office coordination in the existing area.", "accept", ""),
    "D082|customer service representative": ("Customer Services Clerks", "O*NET customer-service evidence supports enquiries, records, complaints and contact-centre work in the existing area.", "accept", ""),
    "D083|travel agent": ("Customer Services Clerks", "O*NET travel-agent evidence supports itinerary planning, reservations, ticketing and customer assistance.", "accept", ""),
    "D084|payroll clerk": ("Numerical and material recording clerks", "O*NET payroll/billing evidence supports payroll, invoice and accounting-record tasks in the existing clerical area.", "accept", ""),
    "D086|gambling games developer": ("Gaming Technology Development", "The title is domain-plausible, but the lane did not attach a global authoritative role-task source for this specific gambling-technology identity.", "review_only", "Add a global role-task source and distinguish gambling-game development from general game development before acceptance."),
    "D086|gambling quality assurance engineer": ("Gaming Technology Quality Assurance", "The title is domain-plausible, but the lane did not attach a global authoritative role-task source for this specific gambling-QA identity.", "review_only", "Add a global role-task source and distinguish gambling-game QA from general software/game QA before acceptance."),
    "D087|hairdresser": ("Personal Services Workers", "O*NET hairdresser evidence supports styling, cutting, treatment and client-service work in the existing area.", "accept", ""),
    "D088|makeup artist": ("Personal Services Workers", "O*NET makeup-artist evidence supports production/client makeup and related beauty-service tasks.", "accept", ""),
    "D088|manicurist pedicurist": ("Personal Services Workers", "O*NET nail-care evidence supports manicure, pedicure, hygiene and client-service tasks.", "accept", ""),
    "D088|skincare specialist": ("Personal Services Workers", "O*NET skincare evidence supports aesthetic treatments, hygiene, client assessment and referral boundaries.", "accept", ""),
    "D089|crematory operator regional candidate": ("Funeral & Mortuary Services", "BLS distinguishes crematory equipment operation from funeral arrangement and embalming, but the lane did not establish a distinct global occupation across jurisdictions.", "review_only", "Confirm a globally established role identity and distinct area boundary before accepting."),
    "D089|funeral director mortician funeral arranger": ("Funeral & Mortuary Services", "O*NET funeral-worker evidence supports remains care, legal documents, family consultation and funeral coordination.", "accept", ""),
    "D089|funeral home manager": ("Funeral & Mortuary Services", "O*NET funeral-worker evidence plus the candidate management scope supports funeral-home service management.", "accept", ""),
    "D090|veterinary assistant": ("Veterinary Support & Animal Care", "O*NET veterinary-assistant evidence supports supervised animal care, restraint, records, samples and client support.", "accept", ""),
    "D091|driving school instructor": ("Driver Education & Licensing", "FRSC driving-school standards provide the Nigerian regulated context, while the global source establishes instructional context; this is a distinct driver-education route.", "accept", ""),
    "D094|electronics repair technician": ("Electrical and Electronic Trades Workers", "O*NET electronics-repair evidence supports inspection, testing, troubleshooting, repair and maintenance in the existing area.", "accept", ""),
    "D096|existing library agronomist not active": ("Agricultural Production Advisory", "ILO/FAO evidence supports agronomic advice and farm-production improvement, but the candidate may belong in an agricultural-science domain rather than the machinery-focused parent.", "review_only", "Resolve parent-domain ownership before accepting; current D096 area boundaries are machinery-oriented."),
    "D096|existing library crop farmer not active": ("Crop & Mixed Farm Production", "ILO crop-grower evidence supports production work, but the current D096 active scope is machinery-heavy.", "review_only", "Confirm that D096 intentionally includes crop-production occupations rather than only farm machinery operations."),
    "D096|existing library farmworker not active": ("Crop & Mixed Farm Production", "ILO elementary agricultural-labour evidence supports the role family, but parent-domain ownership is unresolved.", "review_only", "Confirm that D096 covers routine agricultural labour and not only machinery operations."),
    "D096|existing library mixed crop livestock farmer not active": ("Crop & Mixed Farm Production", "ILO mixed-production evidence supports a distinct mixed crop/livestock route, but parent-domain ownership is unresolved.", "review_only", "Confirm that D096 covers production farms and distinguish it from dedicated crop/livestock domains."),
    "D097|welding inspector": ("Welding Inspection & Quality", "AWS evidence distinguishes welding inspection, conformance and certification from welding production tasks within the metal/fabrication parent.", "accept", ""),
    "D099|bricklayer": ("Building and related trades workers, excluding electricians", "O*NET masonry evidence supports bricklaying, layout, mortar and repair work in the existing area.", "accept", ""),
    "D101|painter construction maintenance": ("Building and Related Trades Workers (Excluding Electricians)", "O*NET painting evidence supports surface preparation, coating and finishing work in the existing area.", "accept", ""),
    "D101|paperhanger wall covering installer": ("Building and Related Trades Workers (Excluding Electricians)", "O*NET paperhanger evidence supports wall-covering installation and interior surface finishing.", "accept", ""),
    "D102|carpenter": ("Carpentry & Structural Fitting", "O*NET carpenter evidence supports construction, installation, repair, joinery and woodwork in the existing area.", "accept", ""),
    "D103|jeweller": ("Handicraft and printing workers", "O*NET jeweller evidence supports design, fabrication, repair and appraisal of jewellery and precious materials in the existing area.", "accept", ""),
    "D104|potter": ("Handicraft and Printing Workers", "O*NET potter evidence supports clay shaping, glazing and kiln operation in the existing area.", "accept", ""),
    "D105|craft artist": ("Handicraft and printing workers", "O*NET craft-artist evidence supports creation of functional/decorative objects using craft materials in the existing area.", "accept", ""),
    "D106|tailor": ("Food Processing, Woodworking, Garment and Other Craft Workers", "O*NET tailoring evidence supports custom garment construction, fitting, alteration and repair in the existing area.", "accept", ""),
    "D107|leatherworker": ("Footwear & Leather Craftspeople", "O*NET leather-worker evidence supports construction, decoration, repair and finishing of leather goods and footwear in the existing area.", "accept", ""),
    "D111|textile industrial engineer inactive": ("Textile Production Engineering", "The candidate is plausible for textile-production systems, but the cited ISCO evidence is broad and does not establish a distinct clothing/textile-engineer occupation.", "review_only", "Provide authoritative role-task evidence distinct from general industrial/production engineering before acceptance."),
    "D112|paper machine operator": ("Stationary Plant and Machine Operators", "O*NET paper-machine evidence supports machine setup, operation, inspection and adjustment in the existing area.", "accept", ""),
    "D132|spacecraft operations engineer": ("Mission Operations & Spacecraft Control", "ESA/NASA evidence supports mission operations, spacecraft procedures, control and in-orbit activity within the parent space domain.", "accept", ""),
    "D134|marine engineer assistant": ("Ship & Marine Engineering Technicians", "NIMASA/BLS evidence supports assistant-level engine-room and marine-engineering technical work in the existing area.", "accept", ""),
    "D134|marine engineer naval architect": ("Naval Architects & Marine Engineers", "BLS/NIMASA evidence supports vessel design, marine systems and engineering responsibilities in the existing area.", "accept", ""),
    "D136|flight test engineer": ("Aircraft & Aerospace Engineering", "ESA/BLS-style aerospace test evidence supports flight-test planning, instrumentation and performance analysis in the existing area.", "accept", ""),
    "D137|medical dosimetrist": ("Radiation Therapy Treatment Planning", "AAPM evidence distinguishes treatment-planning dosimetry from radiation-therapist delivery and medical-physicist equipment work.", "accept", ""),
    "D139|game developer": ("Gameplay Programming", "BLS/IGDA game-development evidence supports coding game mechanics and player-facing systems in the existing area.", "accept", ""),
    "D139|game producer": ("Game Production & Team Delivery", "BLS/IGDA evidence supports coordinating game production, schedules, teams and delivery; this is distinct from gameplay programming and art.", "accept", ""),
    "D141|quantum algorithm engineer": ("Quantum Software & Algorithms", "IBM/QED-C evidence explicitly supports quantum algorithms and software as a quantum-computing practice area.", "accept", ""),
    "D141|quantum algorithm theorist": ("Quantum Software & Algorithms", "IBM quantum-research evidence supports theoretical algorithm design and analysis within the quantum-software area.", "accept", ""),
    "D141|quantum system performance scientist": ("Quantum Systems Performance & Benchmarking", "IBM/QED-C evidence supports performance characterization at the quantum hardware/software boundary.", "accept", ""),
    "D143|digital forensics examiner": ("Cybersecurity & Digital Forensics", "NIST/NICE evidence supports acquisition, preservation, examination and reporting of digital evidence in the existing area.", "accept", ""),
    "D153|music production performance family": ("Music Production & Performance", "O*NET music/sound evidence supports the parent area, but the record combines production, sound engineering, composition and performance.", "review_only", "Split the family into separate role keys and assign each to Musician/Producer or Sound & Audio Engineer before acceptance."),
    "D155|materials characterization scientist": ("Nanoscience & Advanced Materials Research", "BLS materials-science evidence supports structure, composition, testing and characterization of advanced materials in the existing area.", "accept", ""),
    "D157|tax advisory compliance family": ("Tax Advisory & Compliance", "BLS/OECD evidence supports tax advice, compliance, examination and transfer-pricing work in the parent domain.", "review_only", "Split the bundled advisory, compliance, examiner/revenue and transfer-pricing identities before accepting area routes."),
    "D166|autonomous vehicle design engineer": ("Autonomous Vehicle Systems & Integration", "The parent-domain task scope supports vehicle integration and perception/control interfaces, but the candidate overlaps self-driving software and systems-engineering routes.", "review_only", "Provide role-level task evidence that distinguishes vehicle-system integration from self-driving software engineering before acceptance."),
}


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def rel(path: Path) -> str:
    return str(path.relative_to(ROOT)).replace("\\", "/")


def domain_areas(domain_structure: dict[str, Any], domain_id: str) -> dict[str, dict[str, Any]]:
    domain = domain_structure.get(domain_id, {})
    result: dict[str, dict[str, Any]] = {}
    for subgroup in domain.get("subgroups", []) or []:
        label = str(subgroup.get("label") or "").strip()
        if label:
            result[label] = subgroup
    return result


def source_ids(items: list[dict[str, Any]]) -> list[str]:
    return list(dict.fromkeys(str(x.get("source_id")) for x in items if x.get("source_id")))


def evaluate(record: dict[str, Any], area_map: dict[str, dict[str, Any]]) -> dict[str, Any]:
    key = record["candidate_key"]
    area_label, rationale, proposed_decision, missing = AREA_DECISIONS.get(
        key,
        ("", "", "review_only", "No explicit area mapping was recorded for this candidate."),
    )
    existing = area_label in area_map
    global_evidence = list(record.get("global_evidence") or [])
    nigerian_context = list(record.get("nigerian_context") or [])
    parent_fit_present = bool(record.get("parent_domain_fit"))
    global_role_source_present = any(
        x.get("url") or x.get("urls") for x in global_evidence if isinstance(x, dict)
    )

    reasons: list[str] = []
    if not area_label:
        reasons.append("no explicit existing/proposed area assignment")
    if not parent_fit_present:
        reasons.append("parent-domain rationale is missing")
    if not global_role_source_present:
        reasons.append("no global authoritative role-task URL is attached")
    if missing:
        reasons.append(missing)
    if proposed_decision != "accept":
        reasons.append(missing or "candidate-specific role identity or area boundary is unresolved")

    final_status = proposed_decision if not reasons[:3] and proposed_decision == "accept" else "review_only"
    area_fit_status = "supported_existing_area" if final_status == "accept" and existing else "supported_proposed_area" if final_status == "accept" else "review_only"
    area_boundary = area_map.get(area_label, {}) if existing else {}
    area_sources = ((area_boundary.get("source_provenance") or {}).get("sources") or []) if existing else []

    return {
        "candidate_key": key,
        "domain_id": record["domain_id"],
        "title": record["title"],
        "original_disposition": record["original_disposition"],
        "final_disposition": final_status,
        "area_label": area_label or None,
        "area_kind": "existing" if existing else "proposed" if area_label else "missing",
        "area_fit_status": area_fit_status,
        "area_fit_rationale": rationale or "No area-fit rationale recorded.",
        "area_boundary": {
            "existing_label": existing,
            "description": area_boundary.get("description") if existing else None,
            "source_provenance_ids": area_sources,
        },
        "parent_domain_fit": {
            "status": "supported_candidate" if parent_fit_present else "missing",
            "rationale": record.get("parent_domain_fit") or None,
            "role_task_evidence": record.get("candidate_tasks") or None,
            "source_ids": source_ids(global_evidence),
        },
        "area_task_evidence": {
            "status": "supported" if final_status == "accept" else "insufficient_or_conflicted",
            "rationale": rationale or None,
            "source_ids": source_ids(global_evidence),
        },
        "global_evidence": global_evidence,
        "nigerian_context": nigerian_context,
        "evidence_limits": record.get("nigerian_context_claim_limit") or None,
        "missing_evidence": list(dict.fromkeys(reasons)),
        "source_files": record.get("source_files") or [],
        "canonical_files_edited": False,
    }


def markdown(report: dict[str, Any]) -> str:
    c = report["counts"]
    lines = [
        "# Role-enrichment area-of-specialization reconciliation — 2026-10-07",
        "",
        "Status: **complete for the 50 unique additions and 38 unique aliases; canonical integration not performed**.",
        "",
        "This report maps each candidate to an existing or explicitly proposed area within its parent domain and independently records parent-domain fit, area-fit rationale, global role evidence and Nigerian context. It does not edit canonical files.",
        "",
        "## Result",
        "",
        f"- Candidates processed: **{c['candidates_processed']}**",
        f"- Accepted additions: **{c['accepted_additions']}**",
        f"- Accepted aliases: **{c['accepted_aliases']}**",
        f"- Review-only candidates: **{c['review_only']}**",
        f"- Existing-area assignments: **{c['existing_area_assignments']}**",
        f"- Proposed-area assignments: **{c['proposed_area_assignments']}**",
        f"- Missing/unsupported global role-task evidence: **{c['missing_global_role_evidence']}**",
        "",
        "An accepted decision means the candidate has a distinct role identity, a specific area route, parent-domain task fit, area-task fit and global role evidence. Nigerian evidence is contextual only and is never used as proof of global occupation identity or demand.",
        "",
        "## Decision policy",
        "",
        "- ISCO/ESCO membership alone is not area-fit evidence.",
        "- Existing area labels are checked against the current domain structure; proposed areas are clearly marked and remain proposed.",
        "- Bundled multi-role families, duplicate candidates and unresolved parent-domain boundaries remain `review_only`.",
        "- No canonical role, overlay, domain or subgroup file was changed.",
        "",
        "## Counts",
        "",
        f"- Original disposition counts: `{json.dumps(c['original_dispositions'], ensure_ascii=False)}`",
        f"- Final disposition counts: `{json.dumps(c['final_dispositions'], ensure_ascii=False)}`",
        "",
        "## Review-only reasons",
        "",
    ]
    reason_counts = Counter()
    for item in report["decisions"]:
        if item["final_disposition"] == "review_only":
            for reason in item["missing_evidence"]:
                reason_counts[reason] += 1
    for reason, n in reason_counts.most_common():
        lines.append(f"- `{n}` — {reason}")
    lines.extend(["", "## Decision ledger", ""])
    for item in report["decisions"]:
        lines.extend([
            f"### {item['candidate_key']} — {item['title']}",
            "",
            f"- Original: `{item['original_disposition']}`; final: `{item['final_disposition']}`",
            f"- Area: `{item['area_label'] or 'none'}` ({item['area_kind']}); area-fit status: `{item['area_fit_status']}`",
            f"- Area rationale: {item['area_fit_rationale']}",
            f"- Parent-domain evidence: `{item['parent_domain_fit']['status']}`; sources: {', '.join(item['parent_domain_fit']['source_ids']) or 'none'}",
            f"- Area-task evidence: `{item['area_task_evidence']['status']}`; sources: {', '.join(item['area_task_evidence']['source_ids']) or 'none'}",
            f"- Nigerian context: {', '.join(source_ids(item['nigerian_context'])) or 'none recorded'}",
            f"- Missing evidence / hold: {'; '.join(item['missing_evidence']) or 'none'}",
            "",
        ])
    lines.extend([
        "## Follow-up",
        "",
        "The accepted decisions are evidence-ready for a later canonical integration pass, but this artifact intentionally does not apply them. Review-only records need the listed evidence or identity/area clarification before promotion.",
        "",
        f"Machine-readable report: `{REPORT_JSON.relative_to(ROOT).as_posix()}`",
        f"Checkpoint: `{CHECKPOINT_JSON.relative_to(ROOT).as_posix()}`",
        "",
    ])
    return "\n".join(lines)


def main() -> None:
    source = read_json(INPUT)
    structure = read_json(DOMAIN_STRUCTURE)
    candidates = [
        x for x in source.get("all_candidates", [])
        if x.get("original_disposition") in {"add", "alias_existing"}
    ]
    decisions: list[dict[str, Any]] = []
    missing_rules: list[str] = []
    for record in candidates:
        areas = domain_areas(structure, record["domain_id"])
        decision = evaluate(record, areas)
        decisions.append(decision)
        if decision["area_label"] is None:
            missing_rules.append(record["candidate_key"])

    original = Counter(x["original_disposition"] for x in decisions)
    final = Counter(x["final_disposition"] for x in decisions)
    report = {
        "schema_version": "2026-10-07.role-enrichment-area-fit-reconciliation.v1",
        "run_date": RUN_DATE,
        "status": "complete_area_fit_reconciliation_no_canonical_edits",
        "canonical_files_edited": False,
        "inputs": {
            "reconciliation_report": str(INPUT.relative_to(ROOT)).replace("\\", "/"),
            "domain_structure": str(DOMAIN_STRUCTURE.relative_to(ROOT)).replace("\\", "/"),
        },
        "area_fit_gate": {
            "requires_specific_area": True,
            "requires_independent_parent_domain_role_task_evidence": True,
            "requires_independent_area_role_task_evidence": True,
            "isco_or_esco_membership_alone_sufficient": False,
            "nigerian_context_separate": True,
        },
        "counts": {
            "candidates_processed": len(decisions),
            "source_additions_processed": original.get("add", 0),
            "source_aliases_processed": original.get("alias_existing", 0),
            "accepted_additions": sum(1 for x in decisions if x["final_disposition"] == "accept" and x["original_disposition"] == "add"),
            "accepted_aliases": sum(1 for x in decisions if x["final_disposition"] == "accept" and x["original_disposition"] == "alias_existing"),
            "review_only": final.get("review_only", 0),
            "existing_area_assignments": sum(1 for x in decisions if x["area_kind"] == "existing"),
            "proposed_area_assignments": sum(1 for x in decisions if x["area_kind"] == "proposed"),
            "missing_global_role_evidence": sum(1 for x in decisions if x["parent_domain_fit"]["source_ids"] == []),
            "missing_area_rules": len(missing_rules),
            "canonical_files_edited": 0,
            "original_dispositions": dict(sorted(original.items())),
            "final_dispositions": dict(sorted(final.items())),
        },
        "decisions": decisions,
        "missing_area_rules": missing_rules,
        "follow_up": [
            "Do not apply accepted decisions automatically; review the proposed area labels as taxonomy additions where marked proposed.",
            "Resolve every review-only record using the exact missing evidence in its decision row.",
            "Only after this area-fit ledger is approved may canonical role/overlay files be changed.",
            "The separate ten-role sparse-domain target still requires evidence-backed enrichment; do not add roles solely to meet a number.",
        ],
    }
    REPORT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    REPORT_MD.write_text(markdown(report) + "\n", encoding="utf-8")
    digest = hashlib.sha256(json.dumps(report, ensure_ascii=False, sort_keys=True).encode("utf-8")).hexdigest()
    checkpoint = {
        "schema_version": "2026-10-07.role-enrichment-area-fit-checkpoint.v1",
        "run_date": RUN_DATE,
        "status": report["status"],
        "completed": [
            "Loaded the reconciled 50 additions and 38 aliases.",
            "Assigned each candidate to an existing or explicitly proposed area, or recorded a missing mapping.",
            "Checked parent-domain and area-task evidence separately.",
            "Separated global sources from Nigerian context.",
            "Kept bundled, duplicate and unresolved-boundary cases review-only.",
            "Edited no canonical files.",
        ],
        "counts": report["counts"],
        "report_json": str(REPORT_JSON.relative_to(ROOT)).replace("\\", "/"),
        "report_markdown": str(REPORT_MD.relative_to(ROOT)).replace("\\", "/"),
        "digest": digest,
    }
    CHECKPOINT_JSON.write_text(json.dumps(checkpoint, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    CHECKPOINT_MD.write_text(
        "# Role-enrichment area-fit checkpoint — 2026-10-07\n\n"
        f"Status: **{checkpoint['status']}**\n\n"
        + "\n".join(f"- {x}" for x in checkpoint["completed"])
        + "\n\nCounts: `"
        + json.dumps(checkpoint["counts"], ensure_ascii=False)
        + "`\n\nReport: `"
        + checkpoint["report_json"]
        + "`\n\nDigest: `"
        + digest
        + "`\n",
        encoding="utf-8",
    )
    print(json.dumps({"report": str(REPORT_JSON.relative_to(ROOT)), "checkpoint": str(CHECKPOINT_JSON.relative_to(ROOT)), "counts": report["counts"]}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

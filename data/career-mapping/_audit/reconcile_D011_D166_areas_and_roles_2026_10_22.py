#!/usr/bin/env python3
"""Source-backed area and role reconciliation for D011 and D166.

This is a data-only reconciliation. It removes legacy ISCO subgroups from the
canonical specialization structure, keeps their full records in the audit
output, and records conditional role-area routes only where a source documents
the relevant work context.
"""
from __future__ import annotations

import copy
import json
from collections import Counter
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
CAREER = ROOT / "data" / "career-mapping"
STRUCTURE_PATH = CAREER / "domain_structure.json"
CATALOG_PATH = CAREER / "domain_specialization_catalog.json"
ROLE_PATH = CAREER / "role_library_v3_cleaned.json"
AUDIT_PATH = CAREER / "_audit" / "D011_D166_AREA_ROLE_RECONCILIATION_2026_10_22.json"
TODAY = "2026-10-22"


def read(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def write(path: Path, payload):
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def source(source_id, publisher, title, url, locator, supports, claim_limit):
    return {
        "source_id": source_id,
        "publisher": publisher,
        "title": title,
        "url": url,
        "locator": locator,
        "supports": supports,
        "claim_limit": claim_limit,
        "access_date": TODAY,
        "review_date": TODAY,
    }


AUTOWARE_ARCH = source(
    "D166-AUTOWARE-ARCH-2026-10-22", "Autoware Foundation", "Autoware Architecture Overview",
    "https://docs.autoware.org/pr-803/design/autoware-architecture-v1/",
    "Architecture overview separates sensing, map, localization, perception, planning, control, and vehicle interface stacks; it describes replaceable modules and component boundaries.",
    "Supports separate component areas and warns that this architecture is a technical system decomposition, not a universal curriculum sequence.",
    "Open-source reference architecture; implementations and required stacks vary by vehicle, operational design domain, and use case.",
)
AUTOWARE_SENSING = source(
    "D166-AUTOWARE-SENSING-2026-10-22", "Autoware Foundation", "Sensing Component Design",
    "https://docs.autoware.org/main/design/autoware-architecture-v1/components/sensing/",
    "Sensing abstracts sensor data formats and performs primitive preprocessing; lists camera, lidar, radar, GNSS/INS, IMU and ultrasonic inputs.",
    "Supports a distinct sensor systems, calibration, and data acquisition area upstream of perception and localization.",
    "Autoware-specific component design; other AV stacks may organize interfaces differently.",
)
AUTOWARE_PERCEPTION = source(
    "D166-AUTOWARE-PERCEPTION-2026-10-22", "Autoware Foundation", "Perception Component Design",
    "https://docs.autoware.org/main/design/autoware-architecture-v1/components/perception/",
    "Perception receives sensing, localization, and map inputs, adds semantic information such as object recognition, obstacle segmentation and traffic-light recognition, then passes outputs to planning.",
    "Supports perception and scene understanding as distinct from sensor acquisition and preprocessing.",
    "Reference architecture; algorithm choices and boundaries vary across systems.",
)
AUTOWARE_MAP = source(
    "D166-AUTOWARE-MAP-2026-10-22", "Autoware Foundation", "Map Component Design",
    "https://docs.autoware.org/main/design/autoware-architecture-v1/components/map/",
    "Describes point-cloud and vector maps used for localization, route planning, traffic-light detection and trajectory prediction.",
    "Supports map data and mapping as a distinct data product used by several downstream components.",
    "Autoware map formats and practices are not a universal industry standard.",
)
AUTOWARE_LOCALIZATION = source(
    "D166-AUTOWARE-LOCALIZATION-2026-10-22", "Autoware Foundation", "Localization Component Design",
    "https://docs.autoware.org/main/design/autoware-architecture-v1/components/localization/",
    "Localization estimates vehicle pose, velocity and acceleration, diagnoses unreliable estimates, and fuses sensor configurations within a defined ODD.",
    "Supports a separate localization and vehicle-state-estimation area.",
    "The source explicitly does not promise infallible localization or operation outside the defined ODD.",
)
AUTOWARE_PLANNING = source(
    "D166-AUTOWARE-PLANNING-2026-10-22", "Autoware Foundation", "Planning Component Design",
    "https://docs.autoware.org/pr-803/design/autoware-architecture-v1/components/planning/",
    "Planning generates target trajectories; separates mission, behavior and motion planning, consumes map, perception and localization information, and sends trajectories to control.",
    "Supports planning as a distinct function, with explicit outputs consumed by control.",
    "The documented modular system is an example architecture; specific behavior and interfaces depend on ODD and implementation.",
)
AUTOWARE_CONTROL = source(
    "D166-AUTOWARE-CONTROL-2026-10-22", "Autoware Foundation", "Control Component Design",
    "https://docs.autoware.org/1.6.0/design/autoware-architecture-v1/components/control/",
    "Defines the Control component separately from Planning in the Autoware stack; planning emits a trajectory that the controller follows.",
    "Supports a distinct control and vehicle-dynamics area, not a merged planning/control label.",
    "Autoware's implementation is one reference and does not define all vehicle-control architectures.",
)
AUTOWARE_VEHICLE = source(
    "D166-AUTOWARE-VEHICLE-INTERFACE-2026-10-22", "Autoware Foundation", "Vehicle Interface Design",
    "https://autowarefoundation.github.io/autoware-documentation/latest/design/autoware-architecture/vehicle/",
    "Vehicle Interface converts Autoware control commands to vehicle-specific drive-by-wire commands and returns vehicle status in normalized messages.",
    "Supports vehicle interface and system integration as distinct from planning or control algorithm design.",
    "Interface work is platform-specific; this page does not define regulatory approval requirements.",
)
NHTSA_ADS = source(
    "D166-NHTSA-ADS-2026-10-22", "NHTSA", "Automated Driving Systems 2.0: A Vision for Safety",
    "https://www.nhtsa.gov/document/automated-driving-systems-20-voluntary-guidance",
    "Voluntary ADS guidance identifies system safety, ODD, object/event detection and response, fallback, human-machine interface, cybersecurity, validation and other safety elements.",
    "Supports safety engineering and validation as a cross-cutting practice spanning ADS components.",
    "US voluntary guidance; it is not a global regulation or certification requirement.",
)
ISO_26262 = source(
    "D166-ISO-26262-2026-10-22", "International Organization for Standardization", "ISO 26262 Road Vehicles Functional Safety",
    "https://www.iso.org/publication/PUB200262.html",
    "The standard series covers safety lifecycle, concept, system, hardware and software development, production/operation, supporting processes and safety analyses for road-vehicle E/E systems.",
    "Supports functional-safety engineering and lifecycle verification/validation within the road-vehicle context.",
    "A systems standard, not an individual certification; applicability is defined by the standard and vehicle context.",
)
ISO_21448 = source(
    "D166-ISO-21448-2026-10-22", "International Organization for Standardization", "ISO 21448:2022 Safety of the Intended Functionality",
    "https://www.iso.org/standard/77490.html",
    "Covers SOTIF risks from functional insufficiencies and provides design, verification and validation guidance for road-vehicle functions relying on situational awareness from complex sensors and processing algorithms, including driving automation levels 1–5.",
    "Supports cross-cutting validation of sensing/perception performance and intended functionality.",
    "Distinct from ISO 26262 faults and cybersecurity; the ISO page notes the 2022 edition is under revision.",
)

D166_AREAS = [
    ("vehicle-sensing-and-sensor-calibration", "Vehicle Sensing and Sensor Calibration", "Acquire, synchronize, calibrate and preprocess sensor signals and maintain the sensor hardware/data interfaces used by automated-driving systems.", [AUTOWARE_ARCH, AUTOWARE_SENSING, NHTSA_ADS]),
    ("perception-and-scene-understanding", "Perception and Scene Understanding", "Interpret sensor and map inputs to detect, classify, track and predict road users, obstacles, traffic controls and relevant scene conditions.", [AUTOWARE_ARCH, AUTOWARE_PERCEPTION, NHTSA_ADS, ISO_21448]),
    ("high-definition-mapping", "High-Definition Mapping and Map Data", "Build, maintain and use road-network, lane-level, vector and point-cloud map data that supports localization, route planning and scene interpretation.", [AUTOWARE_ARCH, AUTOWARE_MAP]),
    ("localization-and-vehicle-state-estimation", "Localization and Vehicle State Estimation", "Estimate vehicle pose, velocity, acceleration and uncertainty by combining sensors and map references within the intended operational design domain.", [AUTOWARE_ARCH, AUTOWARE_LOCALIZATION, AUTOWARE_MAP]),
    ("automated-driving-planning", "Automated Driving Planning", "Select behaviors and generate feasible, rule-aware paths and trajectories using mission goals, maps, perceived objects, vehicle state and operating constraints.", [AUTOWARE_ARCH, AUTOWARE_PLANNING, NHTSA_ADS]),
    ("vehicle-control-and-dynamics", "Vehicle Control and Dynamics", "Translate target trajectories and driving requests into stable steering, braking, acceleration and other motion commands while accounting for vehicle dynamics and limits.", [AUTOWARE_ARCH, AUTOWARE_CONTROL, NHTSA_ADS]),
    ("vehicle-interface-and-system-integration", "Vehicle Interface and System Integration", "Integrate sensing, compute, software and vehicle subsystems; adapt normalized commands and status to a specific vehicle platform and diagnose end-to-end behavior.", [AUTOWARE_ARCH, AUTOWARE_VEHICLE, NHTSA_ADS]),
    ("ads-safety-verification-and-validation", "ADS Safety, Verification and Validation", "Build safety arguments and test evidence across the operational design domain, including requirements, hazard analysis, simulation, hardware-in-the-loop, on-road evaluation, fallback and system-level validation.", [NHTSA_ADS, ISO_26262, ISO_21448]),
]

ROLE_EVIDENCE = {
    "telecommunications engineer": [source("D166-ROLE-TELECOM-2026-10-22", "Automotive Skills Alliance / Project DRIVES", "Connected Vehicles Expert", "https://project-drives.automotive-skills-alliance.eu/Media/Publications/170/Publications_170_20200923_111346.pdf", "Job-role description identifies vehicular communications and vehicle-to-vehicle communication as a connected-vehicle engineering concern.", "Supports a conditional D166 route only when the role works on communications used by an automated/connected vehicle system.", "Connected-vehicle communications are an adjacent system capability; this does not make every telecommunications engineer an ADS specialist."), AUTOWARE_VEHICLE],
    "software analyst": [source("D166-ROLE-SOFTWARE-ANALYST-2026-10-22", "Tesla Careers", "Software QA Engineer, Self-Driving", "https://www.tesla.com/careers/search/job/software-qa-engineer-self-driving-260795", "Role reviews requirements for testability, validates Autopilot features, develops test plans, and analyzes system issues using simulation, hardware-in-the-loop and in-vehicle testing.", "Supports a conditional software-analysis route when requirements and analysis concern ADS software and its verification.", "This is an AV software QA role, not evidence that every generic software analyst works in autonomous vehicles."), NHTSA_ADS],
    "mechanical engineer": [source("D166-ROLE-MECHANICAL-ENGINEER-2026-10-22", "Humble Robotics Careers", "Hardware Validation Engineer", "https://jobs.lever.co/humble-robotics/9aaadbdb-388a-4b6c-acab-d61af563c824", "Autonomous hauler hardware-validation role accepts mechanical engineering backgrounds and covers vehicle-level requirements, design verification, hardware-in-the-loop and system safety coordination.", "Supports a conditional route when mechanical engineering work is on an autonomous vehicle platform and its subsystem verification/integration.", "The source is an autonomous hauler role and does not show that generic mechanical engineering is ADS work."), NHTSA_ADS],
    "powertrain engineer": [source("D166-ROLE-POWERTRAIN-ENGINEER-2026-10-22", "Daimler Truck Careers", "Autonomous Powertrain System Engineer I", "https://jobsearch.daimlertruck.com/index.php?ac=jobad&id=425236", "Role owns integration, validation and release readiness for autonomous commercial-vehicle powertrain systems, including software, hardware, diagnostics and vehicle integration.", "Directly supports conditional D166 routes in vehicle control/dynamics and vehicle integration for autonomous-vehicle powertrain work.", "The posting is for a specific autonomous commercial vehicle program; conventional powertrain roles are not automatically ADS roles."), source("D166-ROLE-POWERTRAIN-CONTROLS-2026-10-22", "Tesla Careers", "Powertrain Controls Engineer, Vehicle Controls", "https://www.tesla.com/careers/search/job/282106?source=Indeed", "Role implements control software translating Full Self-Driving requests into torque and works with firmware and vehicle integration.", "Corroborates a control-area route when powertrain control work implements automated-driving commands.", "Tesla-specific system and product context; does not establish a universal powertrain pathway." )],
    "automotive engineer": [source("D166-ROLE-AUTOMOTIVE-ENGINEER-2026-10-22", "NVIDIA Careers", "Vehicle Integration Engineer, Autonomous Vehicle Test Fleet", "https://nvidia.wd5.myworkdayjobs.com/en-US/NvidiaExternalCareerSite/job/Korea-Seoul/Vehicle-Integration-Engineer--Autonomous-Vehicle-Test-Fleet_JR2020318", "Role integrates AV subsystems into vehicle electrical/electronic architecture, diagnoses software/hardware across the stack, and prepares and signs off test vehicles.", "Supports conditional routes in vehicle integration and system-level verification when automotive engineering tasks are performed on an AV test or production fleet.", "A specific AV integration job does not imply that all automotive engineers work on autonomous systems."), source("D166-ROLE-AUTONOMY-INTEGRATION-2026-10-22", "Rivian Careers", "Systems Integration Test Engineer, Autonomy", "https://careers.rivian.com/careers-home/jobs/32567", "Role performs vehicle integration testing, system troubleshooting and verification that autonomous hardware/software work with core vehicle subsystems.", "Corroborates multi-area integration and verification routes.", "Employer-specific role scope; not a universal licensing or competency standard.")],
    "mechatronics engineer": [source("D166-ROLE-MECHATRONICS-2026-10-22", "NVIDIA Careers", "Vehicle Integration Engineer, Autonomous Vehicle Test Fleet", "https://nvidia.wd5.myworkdayjobs.com/en-US/NvidiaExternalCareerSite/job/Korea-Seoul/Vehicle-Integration-Engineer--Autonomous-Vehicle-Test-Fleet_JR2020318", "The AV integration role names mechatronics among relevant engineering backgrounds and integrates sensors, vehicle hardware and software subsystems.", "Supports conditional routes in sensing and vehicle/system integration when mechatronics work is specifically on an AV platform.", "The qualification is one possible background for a specific role; it does not mean all mechatronics work is autonomous-vehicle work."), AUTOWARE_SENSING],
    "optomechanical engineer": [source("D166-ROLE-OPTOMECHANICAL-ENGINEER-2026-10-22", "Aeva Careers", "Optical Engineer", "https://jobs.lever.co/aeva/26623c61-6587-400c-b2a8-91f9bdedc30d", "Role designs, develops and tests optical subsystems for coherent LiDAR; the product supports automated driving as well as other applications.", "Supports a conditional D166 sensing route when optomechanical work is on LiDAR/optical sensing hardware for road-vehicle automation.", "The employer's sensor serves multiple markets; the role is not exclusively automotive."), source("D166-ROLE-OPTOMECHANICAL-AV-2026-10-22", "General Motors Careers", "Principal Systems Engineer – AV Sensor Design", "https://search-careers.gm.com/pt/cargos/jr-202622444/principal-systems-engineer-av-sensor-design/", "AV sensor design role covers LiDAR optics, calibration, performance, integration with perception/localization/simulation and autonomous-vehicle operation.", "Corroborates the sensor hardware and optical engineering pathway in an AV-specific context.", "This listing is one employer's role design and does not define all optical/optomechanical jobs.")],
    "homologation engineer": [source("D166-ROLE-HOMOLOGATION-2026-10-22", "Avaron Careers", "ADAS Regulation & Homologation Engineer", "https://jobs.avaron.se/jobs/7730208-adas-regulation-homologation-engineer", "Role translates ADAS/automated-driving regulatory requirements into technical requirements, reviews V&V strategies, and supports approval dossiers and homologation testing.", "Directly supports conditional D166 safety, verification and validation routes for ADAS/ADS type approval work.", "Employer/customer jurisdiction determines applicable approval rules; the listing is not a global homologation standard."), NHTSA_ADS],
    "software developer": [source("D166-ROLE-SOFTWARE-DEVELOPER-2026-10-22", "General Motors Careers", "Senior Software Systems Engineer – Autonomous Vehicles", "https://search-careers.gm.com/en/jobs/jr-202619946/senior-software-systems-engineer-autonomous-vehicles/", "Role builds evaluation and validation processes for AV software, uses simulation/on-road data, and analyzes metrics and uncertainty across an end-to-end ML stack.", "Supports conditional software routes in perception, planning and safety validation when software development is for those ADS components.", "The route depends on subsystem assignment; generic software development is not enough to identify an AV area."), source("D166-ROLE-SOFTWARE-DEV-INTEGRATION-2026-10-22", "NVIDIA Careers", "Senior Integration Engineer, End-to-End Model – Autonomous Vehicles", "https://nvidia.wd5.myworkdayjobs.com/NvidiaExternalCareerSite/job/US-CA-Santa-Clara/Senior-Integration-Engineer--End-to-End-Model---Autonomous-Vehicles_JR2025038", "Integrates learned driving models with vehicle interfaces, sensors, localization, mapping and safety systems; evaluates system performance in simulation and vehicles.", "Supports conditional routes across the component areas actually handled by the software engineer, including vehicle integration and safety verification.", "This role is a specialized integration position; area routes must follow the learner's actual subsystem."), source("D166-ROLE-SOFTWARE-DEV-MAP-LOCALIZATION-2026-10-22", "NVIDIA Careers", "Senior Localization and Planning Engineer – Autonomous Vehicles", "https://nvidia.wd5.myworkdayjobs.com/en-US/NVIDIAExternalCareerSite/job/Senior-Localization-and-Planning-Engineer---Autonomous-Vehicles_JR2022858", "Role works on localization, perception-map association and lane selection with navigation maps for autonomous vehicles.", "Supports conditional software routes in high-definition mapping, localization and planning when software work covers those components.", "Specific employer role; the route follows actual assigned component work." )],
}

ROLE_AREA_IDS = {
    "telecommunications engineer": ["vehicle-interface-and-system-integration"],
    "software analyst": ["ads-safety-verification-and-validation", "vehicle-interface-and-system-integration"],
    "mechanical engineer": ["vehicle-interface-and-system-integration", "vehicle-control-and-dynamics"],
    "powertrain engineer": ["vehicle-control-and-dynamics", "vehicle-interface-and-system-integration"],
    "automotive engineer": ["vehicle-interface-and-system-integration", "ads-safety-verification-and-validation"],
    "mechatronics engineer": ["vehicle-sensing-and-sensor-calibration", "vehicle-interface-and-system-integration"],
    "optomechanical engineer": ["vehicle-sensing-and-sensor-calibration"],
    "homologation engineer": ["ads-safety-verification-and-validation"],
    "software developer": ["perception-and-scene-understanding", "high-definition-mapping", "localization-and-vehicle-state-estimation", "automated-driving-planning", "vehicle-control-and-dynamics", "vehicle-interface-and-system-integration", "ads-safety-verification-and-validation"],
}


def area_card(area_id, label, boundary, refs):
    return {
        "area_id": f"D166:{area_id}",
        "label": label,
        "description": boundary,
        "boundary": boundary,
        "source_ids": [r["source_id"] for r in refs if r.get("source_id")],
        "source_references": refs,
        "uncorroborated_source_urls": [],
        "recommendation_status": "source_supported_internal_recommendation",
        "area_status": "review_required_pending_student_contract_and_ui_approval",
        "student_visible": False,
        "nigerian_context": None,
        "source_evidence_status": "source_linked",
        "unresolved_source_ids": [],
        "area_evidence_link_check": {
            "checked_against_catalog_and_captured_review_sources": True,
            "resolution_methods": ["external_primary_source_review", "official_component_architecture_review"],
            "unresolved_catalog_source_ids": [],
        },
    }


def main():
    structure = read(STRUCTURE_PATH)
    catalog = read(CATALOG_PATH)
    roles = read(ROLE_PATH)
    catalog_domains = {d["domain_id"]: d for d in catalog["domains"]}
    role_by_key = {f'{r.get("domain_id")}|{r.get("role_name")}': r for r in roles}

    prior_audit = read(AUDIT_PATH) if AUDIT_PATH.exists() else {}
    prior_archive = (
        prior_audit.get("legacy_subgroups_consolidated_from_canonical_structure")
        or prior_audit.get("legacy_subgroups_retired_from_canonical_structure")
        or {}
    )
    retired = {
        did: copy.deepcopy(structure[did].get("subgroups") or prior_archive.get(did) or [])
        for did in ("D011", "D166")
    }

    # D011 has reviewed multi-area role routes in the canonical role records.
    d011_routes = Counter()
    d011_role_keys_by_area = {a["area_id"]: [] for a in structure["D011"].get("areas_of_specialization", [])}
    for key, role in role_by_key.items():
        if role.get("domain_id") != "D011":
            continue
        for route in role.get("role_area_routes") or []:
            area_id = route.get("area_id")
            if area_id in d011_role_keys_by_area and route.get("status") in {"supported", "conditional"}:
                d011_role_keys_by_area[area_id].append(key)
                d011_routes[(key, area_id)] += 1
    for area in catalog_domains["D011"].get("areas") or []:
        area["role_keys"] = sorted(d011_role_keys_by_area.get(area.get("area_key"), []))
        area["role_route_count"] = len(area["role_keys"])
        area["role_route_evidence_basis"] = "Derived from each canonical role's source-backed role_area_routes; route statuses and conditions remain in role_library_v3_cleaned.json."

    # Replace D166's four merged component proposals with the independently
    # sourced seven system components plus a cross-cutting safety/V&V area.
    d166_old = catalog_domains["D166"]
    d166_old["areas"] = []
    for area_id, label, boundary, refs in D166_AREAS:
        card = area_card(area_id, label, boundary, refs)
        card["area_key"] = card.pop("area_id")
        card["source_urls"] = sorted({r["url"] for r in refs})
        card["evidence"] = refs
        card["role_keys"] = []
        card["recommendation_status"] = "source_supported_internal_recommendation"
        card["student_visible"] = False
        d166_old["areas"].append(card)
    d166_old["recommended_area_count_normalized"] = len(D166_AREAS)
    d166_old["source_capture_complete"] = True
    d166_old["source_capture_quality"] = {
        "status": "externally_reconciled_area_boundaries_and_role_contexts",
        "source_record_count": len({r["source_id"] for _, _, _, refs in D166_AREAS for r in refs}),
        "all_sources_have_url_locator_claim_support_and_limit": True,
        "note": "The component architecture supports area boundaries; it does not imply a strict student sequence. Safety and V&V are cross-cutting. Student visibility remains off pending the existing student contract and local UI approval.",
    }
    d166_old["open_items"] = [
        "Keep SAE automation levels as capability descriptors, not specialization names or a learning ladder.",
        "Keep the safety/V&V area cross-cutting; do not place it after every technical area as a universal prerequisite.",
        "Student visibility remains off until the student-facing contract and local UI approval are completed.",
    ]
    d166_old["canonical_status"] = "area_and_conditional_role_routes_reconciled_pending_student_contract_and_ui_approval"

    # Add exact-context, conditional area routes to D166 roles. Each role stays
    # active only within the AV context stated by its source and route basis.
    d166_role_audit = []
    for role in roles:
        if role.get("domain_id") != "D166":
            continue
        name = str(role.get("role_name") or "").casefold()
        area_ids = ROLE_AREA_IDS.get(name)
        if not area_ids:
            continue
        refs = ROLE_EVIDENCE[name]
        ref_urls = sorted({r["url"] for r in refs if r.get("url")})
        route_basis = {
            "telecommunications engineer": "Conditional fit only when the role designs or operates vehicle-to-vehicle/connected-vehicle communications supporting an automated-driving system; ordinary telecom network work remains outside D166.",
            "software analyst": "Conditional fit only when requirements analysis, software review or testability work concerns ADS components or their system validation; generic business software analysis remains outside D166.",
            "mechanical engineer": "Conditional fit only when mechanical/hardware engineering is performed on an autonomous vehicle platform or its safety-critical subsystems; unrelated mechanical engineering remains outside D166.",
            "powertrain engineer": "Conditional fit when the powertrain role implements or integrates propulsion/control functions for an autonomous or automated vehicle; conventional powertrain work alone does not qualify.",
            "automotive engineer": "Conditional fit when the automotive engineering task integrates, tests or validates ADS hardware/software on an AV platform; conventional vehicle engineering alone does not qualify.",
            "mechatronics engineer": "Conditional fit when the role integrates AV sensors, embedded systems, actuators or vehicle interfaces; general mechatronics work remains outside D166.",
            "optomechanical engineer": "Conditional fit when optical/mechanical design is for LiDAR or other sensing hardware used by an automated road vehicle; unrelated optics work remains outside D166.",
            "homologation engineer": "Conditional fit when approval and compliance duties explicitly concern ADAS/ADS functions and their verification evidence; general vehicle type approval is not enough.",
            "software developer": "Conditional fit only for software assigned to an ADS subsystem; the route follows the actual component (perception, localization, planning, control, integration or validation), not software development in general.",
        }[name]
        role["student_path_status"] = "active"
        role["domain_fit_review_status"] = "conditional"
        role["domain_fit_review_basis"] = route_basis
        role["domain_fit_review_source_refs"] = sorted(set((role.get("domain_fit_review_source_refs") or []) + ref_urls))
        role["role_domain_lane_review_status"] = "conditional"
        role["role_domain_lane_review_sources"] = sorted(set((role.get("role_domain_lane_review_sources") or []) + ref_urls))
        role["role_domain_routes"] = [
            r for r in (role.get("role_domain_routes") or [])
            if r.get("domain_id") != "D166"
        ] + [{
            "domain_id": "D166",
            "status": "conditional",
            "route_type": "primary",
            "evidence": {"basis": route_basis, "source_refs": ref_urls},
            "qualification": route_basis,
        }]
        role["role_area_routes"] = [
            r for r in (role.get("role_area_routes") or [])
            if not str(r.get("area_id") or "").startswith("D166:")
        ] + [{
            "area_id": f"D166:{area_id}",
            "status": "conditional",
            "route_type": "primary" if index == 0 else "secondary",
            "evidence": {"basis": route_basis, "source_refs": ref_urls},
            "qualification": route_basis,
        } for index, area_id in enumerate(area_ids)]
        role["specialization_fit_review_status"] = "conditional"
        role["specialization_fit_status"] = "conditional"
        role["specialization_fit_area_key"] = f"D166:{area_ids[0]}"
        role["specialization_fit_review_basis"] = route_basis
        role["specialization_fit_review_source_refs"] = ref_urls
        d166_role_audit.append({
            "role_key": f"D166|{role['role_name']}",
            "role_name": role["role_name"],
            "domain_route_status": "conditional",
            "qualification": route_basis,
            "area_keys": [f"D166:{x}" for x in area_ids],
            "source_urls": ref_urls,
        })

    # Store role keys on each D166 area from the reviewed route records. This
    # retains multi-area roles in every supported area.
    d166_area_role_keys = {f"D166:{area_id}": [] for area_id, *_ in D166_AREAS}
    for item in d166_role_audit:
        for area_key in item["area_keys"]:
            d166_area_role_keys[area_key].append(item["role_key"])
    for area in d166_old["areas"]:
        area["role_keys"] = sorted(d166_area_role_keys.get(area["area_key"], []))
        area["role_route_count"] = len(area["role_keys"])

    # Data-wise removal: archive the old groups in this audit and remove them
    # from the canonical source that feeds the career seed.
    for did in ("D011", "D166"):
        structure[did]["subgroups"] = []
        structure[did]["has_subgroups"] = False
    structure["D011"]["subgroup_reconciliation_status"] = "legacy_isco_groupings_consolidated_into_source_backed_specialization_areas"
    structure["D166"]["subgroup_reconciliation_status"] = "legacy_isco_groupings_consolidated_into_source_backed_specialization_areas"
    structure["D011"]["role_count"] = 28
    structure["D166"]["role_count"] = len(d166_role_audit)

    # Refresh the canonical structure's D166 area projection from the sourced
    # catalog records; other domains are left untouched.
    structure["D166"]["areas_of_specialization"] = []
    for area in d166_old["areas"]:
        structure["D166"]["areas_of_specialization"].append({
            "area_id": area["area_key"],
            "label": area["label"],
            "description": area["boundary"],
            "boundary": area["boundary"],
            "source_ids": area["source_ids"],
            "source_references": area["evidence"],
            "uncorroborated_source_urls": [],
            "recommendation_status": "source_supported_internal_recommendation",
            "area_status": "review_required_pending_student_contract_and_ui_approval",
            "student_visible": False,
            "nigerian_context": None,
            "source_evidence_status": "source_linked",
            "unresolved_source_ids": [],
            "area_evidence_link_check": area["area_evidence_link_check"],
            "role_keys": area["role_keys"],
        })
    structure["D166"]["areas_of_specialization_status"] = "source_reconciled_component_areas_and_conditional_role_routes_pending_student_contract_and_ui_approval"
    structure["D166"]["areas_of_specialization_evidence"] = [AUTOWARE_ARCH, NHTSA_ADS, ISO_26262, ISO_21448]
    structure["D166"]["areas_of_specialization_implementation"] = {
        "route_note": "The Autoware component architecture supports distinct technical functions; it does not prescribe a student sequence. Safety/V&V is cross-cutting.",
        "student_visible": False,
        "student_contract_and_ui_approval_pending": True,
    }
    structure["D011"]["areas_of_specialization_status"] = "source_reconciled_areas_with_existing_source_backed_multi_area_role_routes_pending_student_contract_and_ui_approval"

    # Recount catalog-level metrics affected by replacing D166's four rows with eight.
    catalog["counts"]["area_records"] = sum(len(d.get("areas") or []) for d in catalog["domains"])
    catalog["counts"]["student_area_candidates_before_role_gate"] = catalog["counts"]["area_records"]
    catalog["counts"]["recommendation_area_statuses"] = dict(Counter(
        a.get("recommendation_status", "missing")
        for d in catalog["domains"] for a in d.get("areas") or []
    ))
    retired_d166_area_keys = {
        "D166:perception-sensing-and-scene-understanding",
        "D166:localization-mapping-and-vehicle-state-estimation",
        "D166:planning-control-and-automated-driving-software",
        "D166:vehicle-integration-safety-and-verification",
    }
    catalog["areas_missing_inline_citations"] = [
        x for x in catalog.get("areas_missing_inline_citations", []) if x not in retired_d166_area_keys
    ]
    catalog["domain_sources_without_area_specific_match"] = [
        x for x in catalog.get("domain_sources_without_area_specific_match", []) if x not in retired_d166_area_keys
    ]
    catalog["domains_with_areas_missing_inline_citations"] = [
        x for x in catalog.get("domains_with_areas_missing_inline_citations", []) if x != "D166"
    ]
    catalog["counts"]["areas_missing_inline_citations"] = len(catalog["areas_missing_inline_citations"])
    catalog["counts"]["domain_sources_without_area_specific_match"] = len(catalog["domain_sources_without_area_specific_match"])
    catalog["counts"]["domains_with_areas_missing_inline_citations"] = len(catalog["domains_with_areas_missing_inline_citations"])

    d011_multiarea = [
        {"role_key": key, "area_keys": [area for role_key, area in d011_routes if role_key == key]}
        for key in sorted({role_key for role_key, _ in d011_routes})
        if sum(1 for role_key, _ in d011_routes if role_key == key) > 1
    ]
    audit = {
        "schema_version": "2026-10-22.D011-D166-area-role-reconciliation.v1",
        "review_date": TODAY,
        "scope": ["D011", "D166"],
        "data_only": True,
        "legacy_subgroups_consolidated_from_canonical_structure": retired,
        "legacy_subgroup_area_crosswalk": {
            "D011": {
                "21 Quantitative Finance & Statistical Modelling": [
                    "D011:quantitative-pricing-and-financial-engineering",
                    "D011:quantitative-financial-risk-modeling",
                    "D011:systematic-investment-and-quantitative-trading",
                ],
                "24 Investment & Risk Analysts": [
                    "D011:quantitative-financial-risk-modeling",
                    "D011:systematic-investment-and-quantitative-trading",
                ],
                "25 ISCO-08 group 25": [],
                "33 Traders & Brokers": ["D011:systematic-investment-and-quantitative-trading"],
                "area_task_skill_basis": {
                    "21": "Quantitative pricing is supported by mathematical/computational valuation, numerical methods and calibration in Oxford/CFA course evidence; risk modeling by quantitative analysis and market/credit/liquidity risk measurement in GARP; systematic investment by statistical, data-based strategy research, backtesting, portfolio construction and execution in CFA.",
                    "24": "Investment analysis and portfolio construction activities align to systematic investment; financial exposure measurement and market/credit/liquidity risk align to risk modeling. The two area tasks stay distinct even where old label combines them.",
                    "25": "The source record is a generic ISCO placeholder with no cluster skills or task description, so it cannot support its own specialization area.",
                    "33": "Trading and execution activities map to systematic investment/trading only when the task is rules-based or quantitative and includes strategy evaluation, portfolio execution or market microstructure. Brokerage and sales activities alone do not establish this area.",
                },
                "area_source_ids": ["CFA_CBOK_QUANT_AND_PORTFOLIO", "CFA_QUANT_ACTIVE_EQUITY_2026", "GARP_FRM_2026_TOPICS"],
                "rule": "ISCO labels are not retained as student areas. Consolidation follows the area task, skill and activity evidence above and the area-level curriculum/practice sources only. Role-level sources are used separately to justify an individual role's conditional area route; they do not establish or define an area.",
            },
            "D166": {
                "21 Vehicle, Communications and Systems Engineering": [
                    "D166:vehicle-sensing-and-sensor-calibration",
                    "D166:vehicle-control-and-dynamics",
                    "D166:vehicle-interface-and-system-integration",
                    "D166:ads-safety-verification-and-validation",
                ],
                "25 Self-Driving Software Engineers": [
                    "D166:perception-and-scene-understanding",
                    "D166:localization-and-vehicle-state-estimation",
                    "D166:automated-driving-planning",
                    "D166:vehicle-control-and-dynamics",
                    "D166:vehicle-interface-and-system-integration",
                    "D166:ads-safety-verification-and-validation",
                ],
                "31 Science and Engineering Associate Professionals": [
                    "D166:vehicle-sensing-and-sensor-calibration",
                    "D166:vehicle-interface-and-system-integration",
                ],
                "75 Food processing, wood working, garment and other craft and related trades workers": [],
                "area_task_skill_basis": {
                    "21": "Its broad vehicle/systems label is split across source-documented area activities: sensor acquisition/preprocessing; vehicle control; adapting commands/status to vehicle-specific interfaces; and system safety lifecycle/validation. Communications is only retained as an integration edge when the component is part of an ADS/connected-vehicle function.",
                    "25": "The old software grouping is split by component task: perception interprets sensor/map data; localization estimates pose/state; planning produces trajectories; control follows trajectories; vehicle integration connects components; safety/V&V checks system performance and evidence.",
                    "31": "A generic associate-professional grade has no distinct task or skill boundary of its own. It is not retained as an area; routes derive from the specific technical activity, not occupational grade.",
                    "75": "The label is unrelated to ADS system tasks, and the current D166 records contain no matching role. It is removed from the canonical D166 structure.",
                },
                "area_source_ids": [
                    "D166-AUTOWARE-ARCH-2026-10-22", "D166-AUTOWARE-SENSING-2026-10-22",
                    "D166-AUTOWARE-PERCEPTION-2026-10-22", "D166-AUTOWARE-MAP-2026-10-22",
                    "D166-AUTOWARE-LOCALIZATION-2026-10-22", "D166-AUTOWARE-PLANNING-2026-10-22",
                    "D166-AUTOWARE-CONTROL-2026-10-22", "D166-AUTOWARE-VEHICLE-INTERFACE-2026-10-22",
                    "D166-NHTSA-ADS-2026-10-22", "D166-ISO-26262-2026-10-22", "D166-ISO-21448-2026-10-22",
                ],
                "rule": "ISCO labels are not retained as student areas. The crosswalk above synthesizes area tasks, skills and activities using component, safety and standards sources attached to the areas. Role-level sources are used separately to justify an individual role's conditional area route; they do not establish or define an area.",
            },
        },
        "D011": {
            "domain_name": "Quantitative Finance and Financial Engineering",
            "area_count": len(catalog_domains["D011"]["areas"]),
            "area_keys": [a["area_key"] for a in catalog_domains["D011"]["areas"]],
            "role_route_count": sum(len(a.get("role_keys") or []) for a in catalog_domains["D011"]["areas"]),
            "area_role_counts": {a["area_key"]: a["role_route_count"] for a in catalog_domains["D011"]["areas"]},
            "multi_area_roles": d011_multiarea,
            "basis": "Retained existing source-backed role_area_routes and made the area-to-role mapping explicit. Multi-area routes remain multiple, rather than forcing one exclusive area.",
            "external_area_sources": [
                "https://www.cfainstitute.org/programs/cfa-program/candidate-resources/cbok",
                "https://www.cfainstitute.org/programs/cfa-program/curriculum",
                "https://www.garp.org/frm/program-exams",
                "https://courses.maths.ox.ac.uk/mod/book/view.php?chapterid=1411&id=70515",
                "https://www.math.columbia.edu/mafn/our-curriculum/",
                "https://ocw.mit.edu/courses/15-450-analytics-of-finance-fall-2010/pages/syllabus/",
            ],
            "student_visible": False,
        },
        "D166": {
            "domain_name": "Autonomous Vehicles and Self-Driving Systems",
            "area_count": len(D166_AREAS),
            "areas": [{"area_key": f"D166:{a['area_key']}", "label": a["label"], "role_keys": a["role_keys"], "source_ids": a["source_ids"]} for a in d166_old["areas"]],
            "role_count": len(d166_role_audit),
            "conditional_role_routes": d166_role_audit,
            "safety_is_cross_cutting": True,
            "basis": "The old four areas merged independently documented components. Seven component functions are separated and safety/V&V is represented as a cross-cutting practice. Conditional role routes carry explicit AV-context qualifiers.",
            "student_visible": False,
            "external_sources": sorted({r["url"] for _, _, _, refs in D166_AREAS for r in refs} | {u for x in d166_role_audit for u in x["source_urls"]}),
        },
        "validation": {
            "D011_all_area_role_keys_resolve_to_role_library": all(key in role_by_key for a in catalog_domains["D011"]["areas"] for key in a.get("role_keys") or []),
            "D166_all_area_role_keys_resolve_to_role_library": all(key in role_by_key for a in d166_old["areas"] for key in a.get("role_keys") or []),
            "D166_every_area_has_at_least_one_source_backed_role_route": all(a.get("role_keys") for a in d166_old["areas"]),
            "D166_each_retained_role_has_domain_and_area_route": all(x["domain_route_status"] == "conditional" and x["area_keys"] for x in d166_role_audit),
            "D166_every_area_has_primary_external_evidence": all(a.get("source_ids") and all(ref.get("url") and ref.get("locator") and ref.get("supports") and ref.get("claim_limit") for ref in a.get("evidence") or []) for a in d166_old["areas"]),
            "legacy_subgroups_consolidated_out_of_canonical_structure": all(not structure[d].get("subgroups") and not structure[d].get("has_subgroups") for d in ("D011", "D166")),
        },
    }
    if not all(audit["validation"].values()):
        raise SystemExit(f"Validation failed: {audit['validation']}")

    write(CATALOG_PATH, catalog)
    write(STRUCTURE_PATH, structure)
    write(ROLE_PATH, roles)
    write(AUDIT_PATH, audit)
    print(json.dumps({
        "updated": [str(CATALOG_PATH.relative_to(ROOT)), str(STRUCTURE_PATH.relative_to(ROOT)), str(ROLE_PATH.relative_to(ROOT)), str(AUDIT_PATH.relative_to(ROOT))],
        "D011": audit["D011"]["area_role_counts"],
        "D166": {"areas": len(D166_AREAS), "conditional_role_routes": len(d166_role_audit), "role_area_routes": sum(len(x["area_keys"]) for x in d166_role_audit)},
        "validation": audit["validation"],
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

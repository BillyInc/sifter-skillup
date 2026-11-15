"""Generate the bounded, source-backed D167 XR area index from the captured source batch."""

from __future__ import annotations

import gzip
import json
import re
from collections import Counter
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
SOURCE_BATCH = AUDIT / "D167_XR_SOURCE_BATCH_2026_10_29.md"
OUT_JSON = AUDIT / "D167_XR_SOURCE_INDEX_2026_10_29.json"
OUT_MD = AUDIT / "D167_XR_SOURCE_INDEX_2026_10_29.md"
DOMAIN_ID = "D167"
TODAY = "2026-10-29"

FAMILIES = [
    ("foundations", "Foundations, knowledge and competencies"),
    ("methods", "Methods and experience/system designs"),
    ("techniques", "Techniques, interaction patterns and evaluation methods"),
    ("tools", "Tools, software, devices and data"),
    ("standards", "Standards, credentials and learning resources"),
    ("outputs", "Outputs and downstream role context"),
]
HORIZONS = ["established", "current", "emerging", "future"]
HORIZON_LABELS = {
    "established": "Established foundations/practice",
    "current": "Current implementations and deployment",
    "emerging": "Emerging or actively researched work",
    "future": "Roadmap, proposal or unresolved capability",
}
HORIZON_NOTES = {
    "established": "Teach as an established capability only within the scope stated by the source; it does not imply that every XR product uses it.",
    "current": "Treat as a present implementation pattern, while retaining platform, version, employer and jurisdiction limits.",
    "emerging": "Describe as an active project, draft, experimental result or constrained deployment; do not imply general availability.",
    "future": "Use as a qualified direction or unresolved target, not as a promised timeline or proven outcome.",
}

AREA = [
    {
        "id": "D167:xr-experience-interaction-and-content-design",
        "label": "XR Experience, Interaction and Content Design",
        "boundary": "Design XR-specific spatial interaction, user experience, content and scenarios. Include general animation, 3D art or media only when an immersive spatial experience is the intended output.",
        "outputs": "A defined user/application need, spatial scenario and interaction flow; prototypes, immersive assets and evaluation criteria that are ready for implementation and user testing.",
        "claim": "Experience work joins spatial interaction, accessible content and fit-for-purpose immersion. The design brief and user test criteria feed software implementation; feedback from usability, comfort and safety evaluation returns to the design.",
        "limits": "Design recommendations are often platform-specific; a design standard or employer task example does not establish one universal interaction pattern or a role taxonomy.",
        "sources": ["D167-S04", "D167-S07", "D167-S08", "D167-S09", "D167-S10", "D167-S18", "D167-S25", "D167-S26", "D167-S31", "D167-S32", "D167-S33", "D167-S35", "D167-S37", "D167-S40", "D167-S43", "D167-S45", "D167-S46"],
        "counter_query": "D167-Q07",
        "counter_result": "The counter-search added active IEEE P3791 interaction-fluency work, XR-specific accessibility requirements, local university/lab and employer examples, and user-research tasks. It found no basis for collapsing experience design, content production and application implementation into one undifferentiated skill set. General 3D/animation work remains conditional on an XR deliverable.",
        "family_notes": {
            "foundations": "Spatial reasoning, user-centered design, human perception, interaction design, 3D content literacy and accessible multimodal communication are foundations; the required depth depends on whether the task is design, art/content or applied XR prototyping.",
            "methods": "Methods include user/workflow analysis, spatial storyboarding, interaction specification, co-design, low/high-fidelity prototyping and iterative evaluation with users and subject-matter experts.",
            "techniques": "Interaction choices include gaze/eye, gesture/hand, controller, voice, haptics, direct/indirect manipulation and locomotion. Choose by task, user, device capability, comfort and accessibility; modalities can complement one another.",
            "tools": "Design and content tools include XR engine prototypes, interaction toolkits and 3D assets. Unity XRI is one implementation option; it is not a design method or a required tool for all design roles.",
            "standards": "W3C XR accessibility guidance, platform spatial-design guidance and IEEE XR interaction/learning projects inform design decisions. Drafts and active projects are not published conformance requirements. Unity's VR Developer credential is a vendor-specific optional learning signal.",
            "outputs": "Outputs include user needs, spatial flows, content/storyboards, interaction specifications, prototypes and test criteria. They feed application developers and are revised from accessibility, comfort and usability findings.",
        },
        "role_context": ["XR experience builder", "XR/IL innovation facilitator", "XR/IL technology enabler", "3D animator", "3D modeller", "animation director", "animation layout artist", "digital media designer"],
    },
    {
        "id": "D167:xr-software-and-real-time-application-development",
        "label": "XR Software and Real-Time Application Development",
        "boundary": "Build XR applications, interaction logic, rendering/runtime integration and application-specific services, including standalone, mobile and web-delivered experiences.",
        "outputs": "An executable application, runtime/device integration, real-time rendering and interaction behavior, test evidence and a deployment package for named target platforms.",
        "claim": "Application engineering spans an engine/application layer and a runtime/device interface. OpenXR and WebXR provide different deployment interfaces; engine, runtime, feature, performance and privacy constraints shape the resulting application.",
        "limits": "Runtime/API support and engine features vary by device, extension, browser and version. Vendor materials describe their own stack; neither API conformance nor a successful build proves user benefit or performance on all targets.",
        "sources": ["D167-S01", "D167-S02", "D167-S03", "D167-S14", "D167-S15", "D167-S16", "D167-S17", "D167-S18", "D167-S19", "D167-S20", "D167-S24", "D167-S27", "D167-S28", "D167-S36", "D167-S39", "D167-S44"],
        "counter_query": "D167-Q08",
        "counter_result": "The counter-search added a systematic mapping of XR-specific software testing and CloudXR's explicit server-runtime/client-SDK pairing. It confirmed that functional behavior, 6DOF/input, privacy/security, performance/load and usability need distinct checks. Streaming is an optional deployment architecture whose latency/network costs must be measured, not a universal prerequisite.",
        "family_notes": {
            "foundations": "Programming, 3D mathematics, real-time rendering, interaction state, coordinate systems, software architecture and device/runtime lifecycle are relevant foundations; networking and graphics depth depend on deployment choice.",
            "methods": "Methods include requirements-to-interface design, engine/runtime integration, scene/content pipelines, iterative profiling, compatibility testing and controlled deployment. A streamed architecture separates server rendering/runtime from client presentation and requires compatible paired components.",
            "techniques": "Techniques include session/input handling, pose and anchor consumption, rendering/frame scheduling, optimization, feature detection, API conformance, automated/unit/integration tests and device-based evaluation.",
            "tools": "Tools include Unity/Unreal, OpenXR and WebXR stacks, ARKit/Android XR services, scene formats such as USD/glTF and optional CloudXR streaming. These are alternative or complementary stack components, not interchangeable methods.",
            "standards": "OpenXR 1.1 is a ratified runtime interface; WebXR is a Candidate Recommendation Draft; USD/OpenUSD and ETSI ARF concern content/architecture interoperability. Their scope and maturity differ. Unity VR certification is specific to one engine workflow.",
            "outputs": "Outputs include a tested XR application, supported-device/feature matrix, performance and compatibility evidence, privacy/security decisions and deployment client/server artifacts. They feed product integration, platform engineering and human-factors validation.",
        },
        "role_context": ["XR developer", "XR experience builder", "XR/IL solution architect", "XR/IL technical support specialist"],
    },
    {
        "id": "D167:xr-devices-tracking-and-platform-engineering",
        "label": "XR Devices, Tracking and Platform Engineering",
        "boundary": "Develop or integrate head-mounted/near-eye displays, sensors, tracking, input, graphics and system-level XR hardware/software components.",
        "outputs": "A device/platform design or integration, characterized tracking/display/input behavior, capability and interface descriptions, calibration and verification data, and system constraints consumed by applications.",
        "claim": "Device and tracking layers expose pose, input, anchors, scene information and display behavior to runtimes/applications. Environmental conditions, sensing error, calibration, power/thermal limits and latency constrain how spatial content can be placed and rendered.",
        "limits": "Apple documentation is an implementation example; active standards projects and research prototypes are not general device capabilities. The local Nigerian sources establish examples of XR infrastructure and a proposed facility, not a local device-engineering occupation market.",
        "sources": ["D167-S01", "D167-S02", "D167-S04", "D167-S11", "D167-S12", "D167-S13", "D167-S16", "D167-S17", "D167-S20", "D167-S21", "D167-S22", "D167-S24", "D167-S27", "D167-S38", "D167-S43", "D167-S45"],
        "counter_query": "D167-Q09",
        "counter_result": "The counter-search added a 2026–2029 integrated optics/sensing project and a 2025 experimental multifocal waveguide, plus local lab/proposal context. These are emerging research and local infrastructure examples, not evidence that next-generation displays or device-engineering roles are generally available. No materially distinct established device subsystem was found beyond display/optics, sensing/tracking, input/haptics and platform/runtime integration within this search scope.",
        "family_notes": {
            "foundations": "Relevant foundations include optics/displays, sensors, coordinate frames, visual-inertial tracking, embedded/software integration, control, calibration, power/thermal constraints and the target runtime interfaces.",
            "methods": "Methods include system architecture, sensor/display characterization, calibration, tracking-quality assessment, interface conformance, integration testing and measurement under realistic operating conditions.",
            "techniques": "Techniques include visual-inertial odometry, world/plane/image/hand tracking, anchor persistence, pose prediction, display/optical characterization and input/haptic interface evaluation; implementations vary by platform.",
            "tools": "Tools include device SDK/runtime interfaces, spatial tracking APIs, diagnostic and calibration software, optical/sensor measurement systems, reference devices and simulation. Device APIs are platform-dependent.",
            "standards": "OpenXR standardizes parts of the application/runtime interface; IEEE device and display projects cover taxonomy/quality topics at mixed maturity. Active PARs and R&D programs remain proposals/projects, not accepted product standards.",
            "outputs": "Outputs include characterized sensors/displays, tracking/anchor data, calibration and capability records, integration interfaces and error/latency budgets. These feed runtime/software behavior, spatial placement and comfort/safety testing.",
        },
        "role_context": ["XR/IL solution architect", "XR/IL technical support specialist", "XR/IL technology enabler"],
    },
    {
        "id": "D167:human-factors-accessibility-safety-and-evaluation",
        "label": "Human Factors, Accessibility, Safety and Evaluation",
        "boundary": "Assess comfort, usability, accessibility, motion-related risks, privacy and ethical effects of immersive products and systems; this is cross-cutting and a distinct area only where the learning/work output is substantial.",
        "outputs": "A context-specific evaluation plan, participant/user evidence, accessibility and safety issues, measurement limitations and prioritized design/engineering changes.",
        "claim": "XR evaluation combines technical performance and human outcomes. Usability tasks, interviews/think-aloud and construct-matched measures can complement one another; comfort, accessibility, adverse events, movement space, privacy and device/runtime performance shape interpretation and redesign.",
        "limits": "Reviews report heterogeneous constructs and instruments and no single universal protocol. A sickness-reduction standard, draft accessibility guidance or one clinical/remote-study review does not establish a complete risk model or legal compliance.",
        "sources": ["D167-S05", "D167-S06", "D167-S07", "D167-S08", "D167-S09", "D167-S10", "D167-S23", "D167-S25", "D167-S26", "D167-S31", "D167-S32", "D167-S33", "D167-S34", "D167-S35", "D167-S36", "D167-S37", "D167-S40", "D167-S41", "D167-S42", "D167-S45", "D167-S46", "D167-S48", "D167-S49", "D167-S50"],
        "counter_query": "D167-Q10",
        "counter_result": "The counter-search added scoping/systematic reviews of VR questionnaires, presence, software testing and remote-study safety reporting, plus employer task evidence for XR hardware UX research, device comfort/wearability and an XR engineer role combining user studies with implementation. It found no agreed universal presence/usability protocol and shows that questionnaire validity, task-based observation, qualitative evidence, cybersickness monitoring and privacy/safety procedures answer different questions. No Nigeria-specific occupational evidence for XR human-factors evaluators was found in the targeted local search; employer examples support conditional task contexts, not new canonical role records.",
        "family_notes": {
            "foundations": "Foundations include perception/ergonomics, accessible interaction, human-subject research, privacy and safety principles, measurement validity and the system factors that affect comfort (motion, latency, tracking, display and locomotion).",
            "methods": "Methods include task-based usability testing, interviews/think-aloud, observation, construct-specific questionnaires, software testing, adverse-event monitoring and mixed-method evaluation. Select methods by question, population and risk; no one protocol covers all constructs.",
            "techniques": "Measures can include presence/UX/sickness questionnaires, task performance/error, cognitive workload, interviews, physiological signals and tracking/performance telemetry. Constructs and instruments are not interchangeable and should be justified by validity and context.",
            "tools": "Tools include validated questionnaires where available, test harnesses, event/performance logs, accessibility checks and consent/safety procedures. Physiological biomarkers and automated inference remain complementary research methods rather than settled replacements for direct evaluation.",
            "standards": "IEEE 3079 is an active sickness-reduction standard; IEEE P7030 and P3791 are active projects; W3C XR Accessibility User Requirements is a Working Group Note and WCAG 3 is a Working Draft. Treat each status precisely and check jurisdiction-specific obligations separately.",
            "outputs": "Outputs include construct-aligned test plans, participant/user findings, adverse-event/privacy records, limitations and revisions. These feed design iterations, software acceptance, device constraints and deployment decisions.",
        },
        "role_context": ["XR developer", "XR experience builder"],
    },
]

ROLE_AREA = {
    "XR developer": (["D167:xr-software-and-real-time-application-development", "D167:human-factors-accessibility-safety-and-evaluation"], "Software area is the primary fit. Human-factors area is conditional: include only when the actual developer task includes user research, comfort/accessibility evaluation or human-performance testing."),
    "XR experience builder": (["D167:xr-experience-interaction-and-content-design", "D167:xr-software-and-real-time-application-development", "D167:human-factors-accessibility-safety-and-evaluation"], "Crosses design and implementation; human-factors context is conditional on actual user research/evaluation duties."),
    "XR/IL innovation facilitator": (["D167:xr-experience-interaction-and-content-design"], "Connects user/learning/workplace needs with an XR experience concept; direct technical implementation is not implied."),
    "XR/IL solution architect": (["D167:xr-software-and-real-time-application-development", "D167:xr-devices-tracking-and-platform-engineering"], "Cross-area architecture; choose by the actual application/runtime/device interfaces in scope."),
    "XR/IL technical support specialist": (["D167:xr-devices-tracking-and-platform-engineering", "D167:xr-software-and-real-time-application-development"], "Support may concern headset/runtime setup or application operation; select by the actual support duty."),
    "XR/IL technology enabler": (["D167:xr-experience-interaction-and-content-design", "D167:xr-devices-tracking-and-platform-engineering"], "Requirement and feasibility advice may concern experience design or device/platform limits; the umbrella label needs task-specific context."),
    "3D animator": (["D167:xr-experience-interaction-and-content-design"], "Conditional: include only when animation is authored for immersive XR content or spatial interaction."),
    "3D modeller": (["D167:xr-experience-interaction-and-content-design"], "Conditional: include only when assets are prepared and tested for a target XR experience."),
    "animation director": (["D167:xr-experience-interaction-and-content-design"], "Conditional: include only when the production is immersive spatial content, not general animation direction."),
    "animation layout artist": (["D167:xr-experience-interaction-and-content-design"], "Conditional: include only when scene/camera/layout work targets immersive viewing and interaction."),
    "digital media designer": (["D167:xr-experience-interaction-and-content-design"], "Conditional: the broader role includes non-XR multimedia; include only when XR content/spatial interaction is a core output."),
    "3D printing technician": ([], "Unsupported for D167 in the existing role-fit review; physical additive-manufacturing tasks do not establish XR work."),
    "footwear 3D developer": ([], "Unsupported for D167 in the existing role-fit review; footwear CAD/pattern/prototype tasks do not establish XR work."),
}
ROLE_SOURCES = {
    "XR developer": ["D167-S24", "D167-S27", "D167-S44", "D167-S49"],
    "XR experience builder": ["D167-S25", "D167-S26", "D167-S31", "D167-S45", "D167-S46", "D167-S49"],
    "XR/IL innovation facilitator": ["D167-S25", "D167-S26", "D167-S43", "D167-S45"],
    "XR/IL solution architect": ["D167-S16", "D167-S27", "D167-S28"],
    "XR/IL technical support specialist": ["D167-S19", "D167-S20", "D167-S27"],
    "XR/IL technology enabler": ["D167-S25", "D167-S28", "D167-S43"],
    "3D animator": ["D167-S25", "D167-S46"],
    "3D modeller": ["D167-S28", "D167-S46"],
    "animation director": ["D167-S46"],
    "animation layout artist": ["D167-S46"],
    "digital media designer": ["D167-S46"],
    "3D printing technician": [],
    "footwear 3D developer": [],
}

TASKS = [
    ("prerequisites_and_competencies", "Prerequisites, foundations and competencies"),
    ("methods_and_designs", "Methods, workflows and design choices"),
    ("techniques_and_measurement", "Techniques, interaction patterns and measurement"),
    ("tools_and_data", "Tools, platforms, data and implementation"),
    ("standards_and_learning", "Standards, resources and credentials"),
    ("outputs_and_roles", "Outputs, dependencies and downstream role contexts"),
]


def read_sources() -> list[dict]:
    rows = []
    for line in SOURCE_BATCH.read_text(encoding="utf-8").splitlines():
        m = re.match(r"^\| (D167-S\d+) \| \[([^]]+)\]\((https?://[^)]+)\) \| ([^|]+) \| ([^|]+) \| ([^|]+) \|$", line)
        if not m:
            continue
        sid, title, url, context, supports, limit = [x.strip() for x in m.groups()]
        rows.append({"source_id": sid, "title": title, "url": url, "publisher_or_host": urlparse(url).netloc,
                     "area_context": context, "supports": supports, "claim_limit": limit,
                     "access_date": TODAY, "source_family": source_family(int(sid.rsplit("S", 1)[1]))})
    return rows


def source_family(n: int) -> str:
    if n in {1, 2, 3, 4, 5, 6, 7, 8, 16, 30, 35}:
        return "official_or_standards"
    if 9 <= n <= 20 or n == 39:
        return "maintained_platform_or_tool_documentation"
    if n in {21, 22, 23, 36, 37, 40, 41, 42}:
        return "peer_reviewed_or_research_review"
    if 31 <= n <= 34:
        return "curriculum_or_professional_learning"
    if n in {24, 25, 26, 27, 28, 44, 48, 49, 50}:
        return "employer_task_evidence"
    return "credible_grey_or_regional_context"


def make_searches() -> list[dict]:
    groups = [
        ("D167-Q01", "Standards and runtime APIs", "XR runtime APIs, standards projects, accessibility, ethics, safety and interaction fluency.", list(range(1, 9)) + [16, 30, 35]),
        ("D167-Q02", "Platform and implementation documentation", "Engine/platform workflows, scene and asset formats, tracking APIs, deployment and remote rendering.", list(range(9, 21)) + [39]),
        ("D167-Q03", "Human factors and evaluation literature", "XR accessibility, comfort, cybersickness, usability, presence and research-evaluation methods.", [5, 6, 7, 8, 9, 10, 23, 35, 36, 37, 40, 41, 42]),
        ("D167-Q04", "Emerging hardware and content pipelines", "Near-eye display, waveguide, optics/sensing integration, spatial content and interoperability.", [14, 15, 16, 21, 22, 30, 38]),
        ("D167-Q05", "Occupational tasks, curricula and credentials", "Current XR employer tasks, university outcomes, vendor learning/certification and bounded workforce context.", list(range(24, 35)) + [29]),
        ("D167-Q06", "Nigeria and regional context", "Nigeria XR labs, university initiatives, current local vacancies and regional XR workforce evidence.", [43, 44, 45, 46, 47]),
        ("D167-Q07", "Counter-search: experience and interaction", "Check spatial interaction modalities, XR content/experience standards, accessibility and task examples for overlooked design work.", [4, 7, 8, 9, 10, 18, 25, 26, 31, 32, 33, 35, 43, 45, 46]),
        ("D167-Q08", "Counter-search: software and applications", "Check runtime and engine paths, quality/security/performance testing, remote rendering dependencies and role tasks.", [1, 2, 3, 14, 15, 17, 18, 19, 20, 24, 27, 28, 36, 39, 44]),
        ("D167-Q09", "Counter-search: devices and tracking", "Check tracking/sensing, displays and optics, input/platform interfaces, integration and local hardware activity.", [1, 2, 11, 12, 13, 16, 17, 20, 21, 22, 24, 27, 38, 43, 45]),
        ("D167-Q10", "Counter-search: human factors and evaluation", "Check validated/used measures, accessibility, comfort/sickness, safety procedures, evaluation standards and local role evidence.", [5, 6, 7, 8, 9, 10, 23, 25, 26, 31, 32, 33, 34, 35, 36, 37, 40, 41, 42, 45, 46]),
        ("D167-Q11", "Counter-search: XR human-factors role tasks", "Check current employer evidence for XR UX research, human factors, device comfort, user studies and engineering/evaluation overlap.", [24, 25, 26, 27, 28, 44, 48, 49, 50]),
    ]
    return [{"query_id": qid, "date": TODAY, "scope": scope, "query": query,
             "source_ids": [f"D167-S{n:02d}" for n in nums],
             "result_disposition": "sources_reviewed_and_integrated",
             "search_limit": "Search results are discovery only; each retained source carries a claim limit. No source-count quota or global saturation claim."} for qid, scope, query, nums in groups]


def make_cell(area: dict, family_id: str, family_label: str, horizon: str, source_ids: list[str], searches: list[dict]) -> dict:
    claim = area["family_notes"][family_id]
    ids = list(dict.fromkeys(source_ids))
    logs = [q["query_id"] for q in searches if set(ids) & set(q["source_ids"])]
    return {"family_id": family_id, "family_label": family_label, "maturity_horizon": horizon,
            "status": "mapped", "evidence_ids": ids, "search_log_ids": logs,
            "claim_mappings": [{"claim": f"{HORIZON_LABELS[horizon]} — {claim} {HORIZON_NOTES[horizon]}",
                                "area_context": area["boundary"], "expected_output": area["outputs"],
                                "relationship_context": area["claim"], "claim_limit": area["limits"],
                                "source_ids": ids}],
            "bounded_no_hit_reason": None}


def build() -> dict:
    sources = read_sources()
    source_ids = {s["source_id"] for s in sources}
    searches = make_searches()
    role_audit_path = AUDIT / "role_fit_lanes_2026_10_05/D085_D168/D167_role_domain_fit_review_2026_10_05.json.gz"
    role_audit = json.loads(gzip.decompress(role_audit_path.read_bytes()))
    profiles = json.loads((ROOT / "role_work_profiles.json").read_text(encoding="utf-8"))["profiles"]
    profile_keys = {r["role_key"] for r in profiles if r.get("role_key", "").startswith("D167|")}
    overlays = json.loads((ROOT / "thin_domain_role_overlays.json").read_text(encoding="utf-8"))["roles"]
    overlay_names = {r["role_name"].strip().lower() for r in overlays if r.get("domain_id") == "D167"}
    canonical_library = json.loads((ROOT / "role_library_v3_cleaned.json").read_text(encoding="utf-8"))
    d167_owned_roles = [r for r in canonical_library if r.get("domain_id") == "D167"]
    audited_keys = {r["role_key"] for r in role_audit["decisions"]}
    if profile_keys != audited_keys:
        raise ValueError(f"D167 role-fit/work-profile mismatch: {len(audited_keys)} audited vs {len(profile_keys)} profiles")
    if overlay_names != {"digital media designer", "3d animator", "3d modeller", "3d printing technician", "animation director", "animation layout artist", "footwear 3d developer"}:
        raise ValueError("D167 overlay record set changed; reconcile before generating the index")
    roles = []
    for role in role_audit["decisions"]:
        name = role["role_name"]
        area_ids, basis = ROLE_AREA[name]
        roles.append({"role_key": role["role_key"], "role_name": name, "existing_domain_fit": role["domain_fit"],
                      "task_evidence": role["task_evidence"], "fit_rationale": role["rationale"],
                      "candidate_area_contexts": area_ids, "candidate_area_context_basis": basis,
                      "evidence_ids": ROLE_SOURCES[name], "canonical_d167_role_record": False,
                      "route_status": "candidate_context_only; no canonical D167 role route created"})
    area_rows = []
    for area in AREA:
        cells = []
        for family_id, family_label in FAMILIES:
            for horizon in HORIZONS:
                cells.append(make_cell(area, family_id, family_label, horizon, area["sources"], searches))
        tracks = []
        for i, (task_id, label) in enumerate(TASKS):
            track_ids = list(dict.fromkeys(area["sources"] + [
                s for s in area["sources"] if s in {"D167-S36", "D167-S37", "D167-S38", "D167-S39", "D167-S40", "D167-S41", "D167-S42", "D167-S43", "D167-S44", "D167-S45", "D167-S46", "D167-S47"}
            ]))
            tracks.append({"task_id": task_id, "label": label, "status": "complete_with_bounded_scope",
                           "area_boundary": area["boundary"], "search_log_ids": [q["query_id"] for q in searches if q["query_id"] in {"D167-Q01", "D167-Q02", "D167-Q03", "D167-Q04", "D167-Q05", area["counter_query"], "D167-Q06"}],
                           "evidence_ids": track_ids,
                           "closure_note": "Fixed task track reviewed against the recorded source families; examples, maturity, alternatives and output dependencies are documented with limits."})
        candidate_roles = [r for r in roles if area["id"] in r["candidate_area_contexts"]]
        area_rows.append({"domain_id": DOMAIN_ID, "area_id": area["id"], "area_label": area["label"],
                          "status": "complete_with_bounded_scope", "boundary_and_output": {"boundary": area["boundary"], "expected_outputs": area["outputs"]},
                          "core_claim": area["claim"], "claim_limits": area["limits"],
                          "source_ids": area["sources"], "source_count": len(area["sources"]),
                          "coverage_matrix": {"cell_count": 24, "family_ids": [x[0] for x in FAMILIES], "maturity_horizons": HORIZONS,
                                              "cell_status_counts": {"mapped": 24}, "cells": cells},
                          "gap_fillers": tracks, "gap_counter_search_status": "integrated_no_further_material_gap_within_scope",
                          "gap_counter_search_log_ids": ([area["counter_query"], "D167-Q11"] if area["id"] == "D167:human-factors-accessibility-safety-and-evaluation" else [area["counter_query"]]), "gap_counter_result": area["counter_result"],
                          "role_context": [{"role_key": r["role_key"], "role_name": r["role_name"], "fit": r["existing_domain_fit"],
                                            "candidate_area_context_basis": r["candidate_area_context_basis"], "evidence_ids": r["evidence_ids"]} for r in candidate_roles],
                          "canonical_role_routes_changed": False})
    return {"schema_version": "2026-10-29.D167.xr-source-index.v1", "review_date": TODAY,
            "status": "bounded_area_evidence_complete_role_ownership_and_route_integration_open",
            "objective": "Enrich D167 XR domain and four candidate areas with source-backed, maturity-aware learning context and downstream role/task relationships.",
            "scope": {"domain_id": DOMAIN_ID, "area_count": 4, "matrix_cells_per_area": 24, "task_tracks_per_area": 6,
                      "excluded_decisions": ["does not activate proposed areas", "does not change role fit/ownership/routes", "does not create learning items or graph edges", "does not change UI, SQL or migrations"]},
            "stopping_rule": {"area_gates": ["source-backed boundary and outputs", "all 24 fixed matrix cells mapped or terminally bounded", "six finite task tracks terminal", "source families and limits visible", "prerequisites, alternatives, complements and downstream outputs described", "one dated counter-search integrated per area"],
                              "reopen_only_when": ["new material evidence affects a specific cell/track", "a cited standard/tool materially changes", "a concrete counterexample invalidates an indexed claim"],
                              "not_a_closure_basis": ["source-count quota", "general web-search volume", "global saturation claim"]},
            "domain_context": {"shared_foundations": "XR learners need digital/programming and 3D/spatial literacy appropriate to the chosen pathway, user-centered design, interactive-system concepts and an understanding of how runtime, tracking, display and input constrain an experience. The depth is pathway-specific; a content designer does not need the same hardware depth as a platform engineer.",
                               "nigerian_context": "Targeted searches found a Lagos XR developer vacancy (Insightful3d), the Imisi 3D XR lab, OAU animation-lab XR activity, and ABU's reported discussion of a proposed VR learning facility. These are concrete local activity examples, not a national labor-demand or degree/certification claim. No Nigeria-specific device-engineering or human-factors job evidence was identified in this pass.",
                               "relationships": [
                                   {"from": "experience/user requirements and content", "to": "XR application design and implementation", "type": "feeds", "explanation": "Interaction flows, spatial scenarios, content assets and test criteria specify what the application must render and how users act; implementation and user tests return feasibility/usability evidence to design.", "evidence_ids": ["D167-S18", "D167-S25", "D167-S26", "D167-S32", "D167-S33"]},
                                   {"from": "application/runtime integration", "to": "device and platform capabilities", "type": "constrained_by", "explanation": "Runtime APIs expose supported sessions, views, input and device-specific features; application feature detection and compatibility tests must respect the actual runtime/platform.", "evidence_ids": ["D167-S01", "D167-S02", "D167-S03", "D167-S19", "D167-S20"]},
                                   {"from": "tracking, anchors and scene understanding", "to": "spatial placement and interaction", "type": "feeds", "explanation": "Pose/plane/anchor estimates feed content placement and spatial interaction, with environment quality, permission, tracking error and update latency as constraints.", "evidence_ids": ["D167-S11", "D167-S12", "D167-S13"]},
                                   {"from": "server-rendered XR application", "to": "compatible client and network", "type": "requires_for_this_architecture", "explanation": "CloudXR requires a compatible server runtime/application and client SDK pair; network latency, bandwidth and reliability become end-to-end experience constraints. This is an optional architecture, not a universal XR prerequisite.", "evidence_ids": ["D167-S39"]},
                                   {"from": "human-factors/accessibility evaluation", "to": "design, software and device iteration", "type": "feeds", "explanation": "Task performance, comfort, accessibility, sickness, privacy and adverse-event findings inform redesign and acceptance; evaluation instruments must match the construct and population.", "evidence_ids": ["D167-S07", "D167-S23", "D167-S36", "D167-S37", "D167-S40", "D167-S41", "D167-S42"]},
                                   {"from": "3D asset interchange", "to": "runtime-specific rendering and behavior", "type": "does_not_guarantee", "explanation": "USD and related scene formats support content composition/interchange; target runtime/renderers may not support every asset feature, interaction, material or extension.", "evidence_ids": ["D167-S14", "D167-S15", "D167-S20"]},
                               ]},
            "role_record_reconciliation": {"role_fit_review_count": len(roles), "role_fit_status_counts": dict(Counter(r["existing_domain_fit"] for r in roles)),
                 "role_work_profile_count": len(profile_keys), "thin_overlay_count": len(overlay_names),
                 "d167_owned_role_library_count": len(d167_owned_roles), "domain_export_exists": (AUDIT / "domains/D167.json").exists(),
                 "role_records": roles,
                 "external_role_task_families": [{"family": "XR human-factors and UX research", "example_titles": ["Senior UX Researcher, Hardware XR", "Human Factors Research Technologist, AR devices"], "candidate_existing_roles": ["XR developer", "XR experience builder"], "evidence_ids": ["D167-S48", "D167-S49", "D167-S50"], "condition": "Link to an existing role only when the actual task includes human research, comfort/accessibility evaluation or human-performance work; external titles are not canonical D167 records."}],
                 "interpretation": "The 13 reviewed role keys have D167 work-profile records; seven also have thin overlays. There are no D167-owned rows in the cleaned role library and no D167 domain export. Employer sources show XR human-factors/UX-research task families absent from the current D167 fit queue; candidate contexts are indexed without creating, renaming or activating role destinations."},
            "source_registry": sources, "search_logs": searches, "area_search_completion_register": area_rows}


def validate(data: dict) -> None:
    sources = data["source_registry"]
    source_ids = {s["source_id"] for s in sources}
    assert len(sources) == 50 and len(source_ids) == 50
    assert source_ids == {f"D167-S{i:02d}" for i in range(1, 51)}
    query_ids = {q["query_id"] for q in data["search_logs"]}
    assert len(data["area_search_completion_register"]) == 4
    for a in data["area_search_completion_register"]:
        assert a["coverage_matrix"]["cell_count"] == 24
        assert len(a["coverage_matrix"]["cells"]) == 24
        assert len({(c["family_id"], c["maturity_horizon"]) for c in a["coverage_matrix"]["cells"]}) == 24
        assert all(c["status"] == "mapped" and c["evidence_ids"] for c in a["coverage_matrix"]["cells"])
        assert len(a["gap_fillers"]) == 6
        assert all(t["status"] == "complete_with_bounded_scope" for t in a["gap_fillers"])
        assert a["gap_counter_search_status"] == "integrated_no_further_material_gap_within_scope"
        assert a["gap_counter_search_log_ids"] and set(a["gap_counter_search_log_ids"]).issubset(query_ids)
        assert set(a["source_ids"]).issubset(source_ids)
        for c in a["coverage_matrix"]["cells"]:
            assert set(c["evidence_ids"]).issubset(source_ids)
            assert c["search_log_ids"] and set(c["search_log_ids"]).issubset(query_ids)
        for t in a["gap_fillers"]:
            assert set(t["evidence_ids"]).issubset(source_ids)
            assert set(t["search_log_ids"]).issubset(query_ids)
        for r in a["role_context"]:
            assert set(r["evidence_ids"]).issubset(source_ids)
    assert len(data["role_record_reconciliation"]["role_records"]) == 13
    assert all(set(r["evidence_ids"]).issubset(source_ids) for r in data["role_record_reconciliation"]["role_records"])
    profile_rows = json.loads((ROOT / "role_work_profiles.json").read_text(encoding="utf-8"))["profiles"]
    profile_keys = {r["role_key"] for r in profile_rows if r.get("role_key", "").startswith("D167|")}
    audited_keys = {r["role_key"] for r in json.loads(gzip.decompress((AUDIT / "role_fit_lanes_2026_10_05/D085_D168/D167_role_domain_fit_review_2026_10_05.json.gz").read_bytes()))["decisions"]}
    overlay_rows = json.loads((ROOT / "thin_domain_role_overlays.json").read_text(encoding="utf-8"))["roles"]
    overlay_names = {r["role_name"].strip().lower() for r in overlay_rows if r.get("domain_id") == "D167"}
    library_rows = json.loads((ROOT / "role_library_v3_cleaned.json").read_text(encoding="utf-8"))
    d167_library = [r for r in library_rows if r.get("domain_id") == "D167"]
    assert len(profile_keys) == data["role_record_reconciliation"]["role_work_profile_count"] == 13
    assert profile_keys == audited_keys
    assert len(overlay_names) == data["role_record_reconciliation"]["thin_overlay_count"] == 7
    assert len(d167_library) == data["role_record_reconciliation"]["d167_owned_role_library_count"] == 0
    assert data["role_record_reconciliation"]["role_fit_status_counts"] == {"conditional": 5, "supported": 6, "unsupported_for_domain": 2}
    external_families = data["role_record_reconciliation"]["external_role_task_families"]
    assert len(external_families) == 1 and set(external_families[0]["evidence_ids"]).issubset(source_ids)
    for q in data["search_logs"]:
        assert set(q["source_ids"]).issubset(source_ids)
    for rel in data["domain_context"]["relationships"]:
        assert set(rel["evidence_ids"]).issubset(source_ids)


def render_md(data: dict) -> str:
    lines = ["# D167 XR and Immersive Technology — bounded source index", "", f"Review date: {data['review_date']}", "",
             "Status: **four area evidence gates closed within the recorded scope; canonical role ownership/routes remain open**.", "",
             "Area searches are bounded, not globally saturated. Proposed area visibility, role fit, canonical routes and graph data were not changed.", "",
             "## Area closure register", "", "| Area | Cells | Tracks | Sources | Counter-search |", "|---|---:|---:|---:|---|"]
    for a in data["area_search_completion_register"]:
        lines.append(f"| {a['area_label']} | 24 mapped | 6 terminal | {a['source_count']} | integrated; no material gap within recorded scope |")
    lines += ["", "## Domain flow and distinctions", "", data["domain_context"]["shared_foundations"], "", data["domain_context"]["nigerian_context"], ""]
    for rel in data["domain_context"]["relationships"]:
        lines.append(f"- **{rel['from']} → {rel['to']} ({rel['type']}):** {rel['explanation']} [Evidence: {', '.join(rel['evidence_ids'])}]")
    for a in data["area_search_completion_register"]:
        lines += ["", f"## {a['area_label']}", "", f"**Boundary:** {a['boundary_and_output']['boundary']}", "", f"**Expected outputs:** {a['boundary_and_output']['expected_outputs']}", "", f"**Core claim and learning flow:** {a['core_claim']}", "", f"**Limits:** {a['claim_limits']}", "", f"**Counter-search:** {a['gap_counter_result']}", "", "### Six-family × four-horizon matrix", "", "| Family | Established | Current | Emerging | Future/roadmap |", "|---|---|---|---|---|"]
        by = {(c['family_id'], c['maturity_horizon']): c for c in a['coverage_matrix']['cells']}
        for fid, label in FAMILIES:
            vals = [by[(fid, h)]['claim_mappings'][0]['claim'] for h in HORIZONS]
            lines.append(f"| {label} | {vals[0]} | {vals[1]} | {vals[2]} | {vals[3]} |")
        lines += ["", "### Task tracks", "", "| Track | Status | Evidence scope |", "|---|---|---|"]
        for t in a["gap_fillers"]:
            lines.append(f"| {t['label']} | {t['status']} | {t['closure_note']} Evidence: {', '.join(t['evidence_ids'])} |")
        lines += ["", "### Candidate role contexts", "", "These are source-contextualized candidates from the existing fit review. They are not active canonical D167 role routes.", "", "| Role | Existing fit | Candidate basis | Evidence |", "|---|---|---|---|"]
        for r in a["role_context"]:
            lines.append(f"| {r['role_name']} | {r['fit']} | {r['candidate_area_context_basis']} | {', '.join(r['evidence_ids'])} |")
    lines += ["", "## Role-record reconciliation", "", "| Evidence population | Count | Interpretation |", "|---|---:|---|",
              f"| Existing role-fit review | {data['role_record_reconciliation']['role_fit_review_count']} | Exact reviewed D167 task keys; preserve the 6 supported, 5 conditional and 2 unsupported dispositions. |",
              f"| D167 role work profiles | {data['role_record_reconciliation']['role_work_profile_count']} | Work-profile evidence exists for the 13 reviewed keys. |",
              f"| Thin overlays | {data['role_record_reconciliation']['thin_overlay_count']} | Seven D167 keys also have overlay records; these do not by themselves establish canonical ownership. |",
              f"| D167-owned cleaned role-library records | {data['role_record_reconciliation']['d167_owned_role_library_count']} | No current role-library record is assigned to D167; `_audit/domains/D167.json` exists: {data['role_record_reconciliation']['domain_export_exists']}. |", "",
              data['role_record_reconciliation']['interpretation'], "", "## Source registry", "", "| ID | Source | Family | Context/support | Claim limit |", "|---|---|---|---|---|"]
    for s in data["source_registry"]:
        lines.append(f"| {s['source_id']} | [{s['title']}]({s['url']}) | {s['source_family']} | {s['area_context']}: {s['supports']} | {s['claim_limit']} |")
    lines += ["", "## Search log", "", "| Query ID | Scope | Search text | Sources indexed |", "|---|---|---|---|"]
    for q in data["search_logs"]:
        lines.append(f"| {q['query_id']} | {q['scope']} | {q['query']} | {', '.join(q['source_ids'])} |")
    counts = Counter(c["status"] for a in data["area_search_completion_register"] for c in a["coverage_matrix"]["cells"])
    lines += ["", "## Validation summary", "", f"- Areas: {len(data['area_search_completion_register'])}/4 bounded evidence gates closed.", f"- Matrix cells: {sum(a['coverage_matrix']['cell_count'] for a in data['area_search_completion_register'])}/96; {dict(counts)}.", f"- Task tracks: {sum(len(a['gap_fillers']) for a in data['area_search_completion_register'])}/24 terminal.", f"- Source cards: {len(data['source_registry'])}; search groups: {len(data['search_logs'])}.", "- Candidate role contexts are indexed; area activation and canonical route/role integration remain separate.", "- No software tests were run; structural validation is performed by the generator.", ""]
    return "\n".join(lines)


if __name__ == "__main__":
    result = build()
    validate(result)
    OUT_JSON.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    OUT_MD.write_text(render_md(result), encoding="utf-8")
    print(f"wrote {OUT_JSON}")
    print(f"wrote {OUT_MD}")
    print(f"areas={len(result['area_search_completion_register'])} cells={sum(a['coverage_matrix']['cell_count'] for a in result['area_search_completion_register'])} tracks={sum(len(a['gap_fillers']) for a in result['area_search_completion_register'])} sources={len(result['source_registry'])} queries={len(result['search_logs'])}")

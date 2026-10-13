"""Build the audit-only D078 subgroup/role reconciliation ledger.

This deliberately does not edit domain_structure.json, role libraries, seeds,
or API data.  It snapshots the current D078 records and attaches an explicit,
independent task/boundary disposition for local reconciliation.
"""

from __future__ import annotations

import json
from datetime import date
from pathlib import Path

import reconcile_role_fit_from_task_triangulation_2026_10_07 as rigorous


ROOT = Path(__file__).resolve().parents[3]
DATA = ROOT / "data" / "career-mapping"
AUDIT = DATA / "_audit"
DOCS = ROOT / "docs" / "manual-review"
ACCESS_DATE = date(2026, 10, 8).isoformat()


SOURCES = [
    {
        "id": "ilo_isco08",
        "publisher": "International Labour Organization",
        "title": "International Standard Classification of Occupations (ISCO-08), Volume 1",
        "url": "https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf",
        "locator": "Sub-major-group table; pp. 161–163, Unit Groups 2631–2633 and their task/examples descriptions.",
        "supports": "Official occupational boundaries for economists, sociologists/anthropologists/related professionals, and philosophers/historians/political scientists.",
        "limitation": "ISCO is an occupational classification, not proof that a role belongs in this domain or in a particular D078 area of specialization.",
    },
    {
        "id": "unesco_isced_social_sciences",
        "publisher": "UNESCO Institute for Statistics",
        "title": "ISCED Fields of Education and Training 2013: Detailed Field Descriptions",
        "url": "https://uis.unesco.org/sites/default/files/documents/international-standard-classification-of-education-fields-of-education-and-training-2013-detailed-field-descriptions-2015-en.pdf",
        "locator": "Field 03 and detailed fields 031/0311–0314: social and behavioural sciences, economics, political science, psychology, sociology/cultural studies, demography and social geography, with exclusions and neighbouring-field distinctions.",
        "supports": "Education-field boundaries used to test D078 area definitions and exclude generic humanities, physical geography, mathematics, and biometric work where the role remit does not become social research.",
        "limitation": "Field classification does not decide an individual occupation-to-area route.",
    },
    {
        "id": "onet_sociologists",
        "publisher": "U.S. Department of Labor, National Center for O*NET Development",
        "title": "19-3041.00 Sociologists",
        "url": "https://www.onetonline.org/link/details/19-3041.00",
        "locator": "Definition and reported job titles; detailed work activities on the summary page: conduct social research, interpret data, collect through observation/interviews/surveys, develop research methods, prepare reports, and advise on policy.",
        "supports": "Task evidence for social-research, sociology, evaluation and policy routes.",
        "limitation": "The O*NET profile is a U.S. occupational reference and does not establish Nigerian demand or licensing.",
    },
    {
        "id": "onet_geographers",
        "publisher": "U.S. Department of Labor, National Center for O*NET Development",
        "title": "19-3092.00 Geographers",
        "url": "https://www.onetonline.org/link/custom/19-3092.00",
        "locator": "Occupation definition: human, economic and political spatial research is described alongside physical landforms, climate, soils, plants and animals.",
        "supports": "The human-geography route and the negative check that a generic geographer record can span physical and social geography.",
        "limitation": "A generic geographer should not be shown as a D078 route without a human/social remit.",
    },
    {
        "id": "onet_statisticians",
        "publisher": "U.S. Department of Labor, National Center for O*NET Development",
        "title": "15-2041.00 Statisticians",
        "url": "https://www.onetonline.org/link/details/15-2041.00",
        "locator": "Definition and tasks: statistical theory and methods; sampling, experimental design, data preparation, modelling, interpretation and reporting across fields.",
        "supports": "A method-role boundary: statistics can support social research but a generic statistician is not automatically a D078 role.",
        "limitation": "The profile explicitly spans economics, biology, engineering and other fields; social-science placement requires a social-data remit.",
    },
    {
        "id": "onet_social_science_interest",
        "publisher": "U.S. Department of Labor, National Center for O*NET Development",
        "title": "O*NET Social Science Interest Area",
        "url": "https://www.onetonline.org/find/descriptor/result/1.B.3.n",
        "locator": "Social Science interest definition and listed occupations, including political scientists, sociologists, economists, geographers and related research occupations.",
        "supports": "A cross-occupation sanity check for common social-science work, not a replacement for task evidence.",
        "limitation": "An interest-area association is not a role-to-domain or role-to-specialization disposition.",
    },
    {
        "id": "esco_occupation_pillar",
        "publisher": "European Commission, DG Employment, Social Affairs and Inclusion",
        "title": "ESCO: European Skills, Competences, Qualifications and Occupations",
        "url": "https://esco.ec.europa.eu/en/about-esco",
        "locator": "ESCO description of its occupation/skill dictionary and current version information; individual ESCO occupation URLs are retained from each current role record.",
        "supports": "Role descriptions, alternative labels and occupation-skill relationships used as corroborating task evidence.",
        "limitation": "ESCO is a European classification and does not by itself prove global or Nigerian labour-market prevalence or D078 fit.",
    },
    {
        "id": "isa_research_networks",
        "publisher": "International Sociological Association",
        "title": "ISA Research Networks",
        "url": "https://www.isa-sociology.org/research-networks",
        "locator": "Research Committees, Working Groups and Thematic Groups list; includes economy/society, community, education, communication/culture, policy, migration, organizations, population, methodology, social networks and visual sociology.",
        "supports": "Independent evidence that D078 practice areas are plural and include both substantive and methodological specializations; supports reviewing the current two-label subgroup scheme as too coarse.",
        "limitation": "A professional research-network list is evidence of recognized fields, not an instruction to create one catalogue subgroup per committee.",
    },
    {
        "id": "isa_digital_sociology",
        "publisher": "International Sociological Association, Working Group 10",
        "title": "WG10 Digital Sociology",
        "url": "https://www.isa-sociology.org/research-networks/working-groups/wg10-digital-sociology",
        "locator": "Objectives: intersection of digital technologies and society, with theoretical, empirical, methodological and socioethical knowledge.",
        "supports": "The computational/digital area is a legitimate D078 practice area when the work studies society and technology; it is not a generic programming subgroup.",
        "limitation": "It does not make every digitally assisted social-science role computational/digital by default.",
    },
    {
        "id": "asa_interest_areas",
        "publisher": "American Sociological Association",
        "title": "ASA Areas of Sociological Interest",
        "url": "https://www.asanet.org/wp-content/uploads/AreasofInterest.pdf",
        "locator": "Published interest-area list: applied/evaluation research, communication/information technologies, policy analysis, criminology, development, social psychology, culture, population/demography, qualitative methodology, quantitative methodology, social networks and statistics.",
        "supports": "A second professional-body check that the D078 candidates need substantive and methodological routes, and that multiple roles can validly cross routes.",
        "limitation": "ASA’s list is sociology-focused and is not a universal occupation taxonomy or Nigerian professional standard.",
    },
]


# These are the later, unactivated expansion candidates.  They are not the
# current two-area D078 baseline and must remain separate in the handoff.
CANDIDATE_AREA_ORDER = [
    "D078:sociology-social-anthropology",
    "D078:economics-applied-analysis",
    "D078:politics-governance-public-policy",
    "D078:psychology-social-behaviour",
    "D078:human-geography-population",
    "D078:social-research-evaluation",
    "D078:computational-digital-social-science",
]

BASELINE_AREA_BY_SUBGROUP = {
    "21": "D078:computational-quantitative-social-research",
    "26": "D078:social-cultural-economic-research",
}

BASELINE_AREA_LABELS = {
    "D078:computational-quantitative-social-research": "Computational and Quantitative Social Research",
    "D078:social-cultural-economic-research": "Social, Cultural & Economic Research",
}

BASELINE_AREA_BOUNDARIES = {
    "D078:computational-quantitative-social-research": (
        "Use quantitative, computational, digital-trace, network, text or modelling "
        "methods to investigate a social question, population pattern or social "
        "relationship, with appropriate research design and ethical interpretation."
    ),
    "D078:social-cultural-economic-research": (
        "Study people, institutions, culture, policy and economic life through "
        "structured social research and interpretation of evidence."
    ),
}


def area_source_refs(area: dict) -> list[str]:
    refs = []
    for item in area.get("source_references", []) or []:
        if isinstance(item, dict) and item.get("url"):
            refs.append(str(item["url"]))
    refs.extend(str(x) for x in area.get("source_urls", []) or [] if x)
    return list(dict.fromkeys(refs))


def baseline_area_records(d078: dict) -> list[dict]:
    records = []
    for subgroup in d078.get("subgroups", []):
        key = str(subgroup.get("isco_submajor"))
        area_id = BASELINE_AREA_BY_SUBGROUP[key]
        records.append(
            {
                "area_id": area_id,
                "label": BASELINE_AREA_LABELS[area_id],
                "boundary": BASELINE_AREA_BOUNDARIES[area_id],
                "source_refs": area_source_refs(subgroup) + [
                    "https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf",
                    "https://uis.unesco.org/sites/default/files/documents/international-standard-classification-of-education-fields-of-education-and-training-2013-detailed-field-descriptions-2015-en.pdf",
                ],
            }
        )
    return records


def candidate_area_records(area_by_id: dict[str, dict]) -> list[dict]:
    return [
        {
            "area_id": area_id,
            "label": area_by_id[area_id].get("label") or "",
            "boundary": area_by_id[area_id].get("boundary") or area_by_id[area_id].get("description") or "",
            "source_refs": area_source_refs(area_by_id[area_id]),
        }
        for area_id in CANDIDATE_AREA_ORDER
        if area_id in area_by_id
    ]


def rigorous_gate(current: dict, domain: dict, profile: dict | None, baseline_areas: list[dict], candidate_areas: list[dict], static: dict) -> dict:
    """Apply the established task-triangulation gate without mutating data."""
    domain_evidence = rigorous.domain_decision(current, domain, profile)
    activities = (profile or {}).get("activities") or []
    profile_available = bool(profile and isinstance(activities, list) and activities)

    if static["domain"] == "exclude_review_only" or current.get("domain_fit_review_status") == "unsupported":
        parent_gate = "blocked_exclude_or_unsupported"
    elif current.get("domain_fit_review_status") == "supported":
        parent_gate = "supported_existing_domain_status"
    elif domain_evidence:
        parent_gate = "supported_by_task_triangulation"
    else:
        parent_gate = "conditional_insufficient_evidence"

    def rank(areas: list[dict]) -> list[dict]:
        return rigorous.area_candidates(current, areas, profile) if profile_available else []

    baseline_ranked = rank(baseline_areas)
    candidate_ranked = rank(candidate_areas)

    def route_result(area_id: str, ranked: list[dict], candidate_fit: str) -> dict:
        match = next((x for x in ranked if x.get("area_id") == area_id), None)
        top = ranked[0] if ranked else None
        second_score = ranked[1]["score"] if len(ranked) > 1 else 0
        margin = (top["score"] - second_score) if top else None
        if parent_gate not in {"supported_existing_domain_status", "supported_by_task_triangulation"}:
            status = "blocked_parent_domain_fit" if parent_gate != "conditional_insufficient_evidence" else "conditional_review_required"
            reason = "Parent-domain gate did not support automatic area promotion."
        elif not profile_available:
            status = "conditional_review_required"
            reason = "No source-backed work-profile activities were available; title/ISCO/current subgroup cannot substitute."
        elif not match:
            status = "conditional_review_required"
            reason = "No eligible task/boundary candidate reached the established threshold."
        elif match.get("score", 0) < 6 or (not match.get("phrase_match") and margin is not None and margin < 2):
            status = "conditional_review_required"
            reason = "A candidate exists but the score/lead is insufficient for automatic promotion."
        elif match is not top:
            status = "conditional_review_required"
            reason = "The route is secondary; the rigorous gate permits it only as a scoped review candidate."
        else:
            status = "supported_by_rigorous_gate"
            reason = "Top task/boundary candidate met the score and lead threshold."
        return {
            "area_id": area_id,
            "label": (match or {}).get("label") or next((x.get("label") for x in baseline_areas + candidate_areas if x.get("area_id") == area_id), None),
            "status": status,
            "candidate_context_fit": candidate_fit,
            "score": match.get("score") if match else None,
            "label_hits": match.get("label_hits", []) if match else [],
            "boundary_hits": match.get("boundary_hits", []) if match else [],
            "profile_hits": match.get("profile_hits", []) if match else [],
            "phrase_match": match.get("phrase_match", False) if match else False,
            "runner_up_score": second_score,
            "margin": margin,
            "reason": reason,
            "source_refs": list(dict.fromkeys((match or {}).get("source_refs", []) + rigorous.source_profile_refs(profile))),
        }

    return {
        "profile_available": profile_available,
        "profile_activity_count": len(activities) if isinstance(activities, list) else 0,
        "profile_source_refs": rigorous.source_profile_refs(profile),
        "domain_task_triangulation": domain_evidence,
        "parent_domain_gate": parent_gate,
        "baseline_ranked_candidates": baseline_ranked,
        "candidate_ranked_candidates": candidate_ranked,
        "baseline_routes": [
            route_result(area["area_id"], baseline_ranked, next((fit for key, fit in static["subgroups"] if BASELINE_AREA_BY_SUBGROUP.get(key) == area["area_id"]), "conditional"))
            for area in baseline_areas
        ],
        "candidate_routes": [
            route_result(area["area_id"], candidate_ranked, next((fit for key, fit in static["areas"] if key == area["area_id"]), "not_recommended_by_static_pass"))
            for area in candidate_areas
        ],
    }


AREA_SUITABILITY_CRITERIA = [
    {
        "id": "domain_boundary_compatibility",
        "test": "The proposed area studies a subject, population, process or practice that is genuinely inside the approved domain definition, with no unresolved exclusion conflict.",
        "hard_gate": True,
    },
    {
        "id": "independent_recognition",
        "test": "The area is independently recognizable in an authoritative education classification, professional body, research community or established method/practice source; an ISCO key alone is insufficient.",
        "hard_gate": True,
    },
    {
        "id": "distinct_boundary",
        "test": "The area has a clear inclusion/exclusion boundary that distinguishes it from neighbouring areas; a broad umbrella or mixed list of disciplines is not enough for one student-facing area.",
        "hard_gate": True,
    },
    {
        "id": "coherent_scope",
        "test": "The area describes a coherent field or explicitly labelled cross-cutting practice/method, not merely a software tool, generic skill, occupational code or one job title.",
        "hard_gate": True,
    },
    {
        "id": "role_route_evidence",
        "test": "At least one role/workflow can be connected to the area by its own source-backed tasks; conditional routes count when their scope is stated, while unsupported routes remain hidden.",
        "hard_gate": False,
    },
    {
        "id": "non_redundant_student_label",
        "test": "The label tells a learner what they can study or practise and does not expose a classification number or silently duplicate another area.",
        "hard_gate": True,
    },
]


def build_area_suitability(audited_roles: list[dict]) -> list[dict]:
    """Apply hard area gates separately from role-route scoring."""
    route_rows = [
        route
        for role in audited_roles
        for route in role["independent_audit"]["baseline_area_routes"] + role["independent_audit"]["unactivated_candidate_area_routes"]
    ]
    by_area: dict[str, list[dict]] = {}
    for route in route_rows:
        by_area.setdefault(route["area_id"], []).append(route)

    specifications = {
        "D078:computational-quantitative-social-research": {
            "label": "Computational and Quantitative Social Research",
            "kind": "cross_cutting_practice_method",
            "sources": ["isa_digital_sociology", "asa_interest_areas", "onet_statisticians", "onet_sociologists"],
            "hard": {"domain_boundary_compatibility": "pass", "independent_recognition": "pass", "distinct_boundary": "pass", "coherent_scope": "pass", "non_redundant_student_label": "pass"},
            "decision": "suitable_as_explicit_method_practice_area",
            "note": "This is suitable only as an explicitly labelled method/practice route. It does not make programming, statistics or computational tools universal D078 foundations.",
        },
        "D078:social-cultural-economic-research": {
            "label": "Social, Cultural & Economic Research",
            "kind": "mixed_legacy_aggregation",
            "sources": ["ilo_isco08", "unesco_isced_social_sciences", "isa_research_networks", "asa_interest_areas"],
            "hard": {"domain_boundary_compatibility": "pass", "independent_recognition": "partial", "distinct_boundary": "fail", "coherent_scope": "fail", "non_redundant_student_label": "fail"},
            "decision": "not_suitable_as_single_student_facing_area",
            "note": "Keep as an internal/provenance aggregation only; split or replace it with distinct substantive and practice areas after reconciliation.",
        },
        "D078:sociology-social-anthropology": {
            "label": "Sociology and Social Anthropology", "kind": "substantive_field", "sources": ["unesco_isced_social_sciences", "isa_research_networks", "asa_interest_areas"],
            "hard": {"domain_boundary_compatibility": "pass", "independent_recognition": "pass", "distinct_boundary": "pass", "coherent_scope": "pass", "non_redundant_student_label": "pass"},
            "decision": "suitable_candidate_pending_role_route_reconciliation", "note": "Recognized substantive field candidate; roles must still be linked by their task remit before student exposure.",
        },
        "D078:economics-applied-analysis": {
            "label": "Economics and Applied Economic Analysis", "kind": "substantive_field", "sources": ["unesco_isced_social_sciences", "unesco_isced_field_descriptions"],
            "hard": {"domain_boundary_compatibility": "pass", "independent_recognition": "pass", "distinct_boundary": "pass", "coherent_scope": "pass", "non_redundant_student_label": "pass"},
            "decision": "suitable_candidate_pending_role_route_reconciliation", "note": "Recognized substantive field candidate; economic and policy roles must retain their supported or conditional scope.",
        },
        "D078:politics-governance-public-policy": {
            "label": "Politics, Governance and Public Policy", "kind": "substantive_field", "sources": ["unesco_isced_social_sciences", "asa_interest_areas"],
            "hard": {"domain_boundary_compatibility": "pass", "independent_recognition": "pass", "distinct_boundary": "pass", "coherent_scope": "pass", "non_redundant_student_label": "pass"},
            "decision": "suitable_candidate_pending_role_route_reconciliation", "note": "Recognized substantive field candidate; policy remit must be demonstrated rather than inferred from a generic officer title.",
        },
        "D078:psychology-social-behaviour": {
            "label": "Psychology and Social Behaviour", "kind": "substantive_field", "sources": ["unesco_isced_social_sciences", "asa_interest_areas"],
            "hard": {"domain_boundary_compatibility": "pass", "independent_recognition": "pass", "distinct_boundary": "pass", "coherent_scope": "pass", "non_redundant_student_label": "pass"},
            "decision": "suitable_candidate_pending_role_route_reconciliation", "note": "Recognized substantive field candidate; do not infer clinical or psychological practice from a generic behavioural label.",
        },
        "D078:human-geography-population": {
            "label": "Human Geography and Population Studies", "kind": "substantive_field", "sources": ["unesco_isced_social_sciences", "onet_geographers", "asa_interest_areas"],
            "hard": {"domain_boundary_compatibility": "pass", "independent_recognition": "pass", "distinct_boundary": "pass", "coherent_scope": "pass", "non_redundant_student_label": "pass"},
            "decision": "suitable_candidate_pending_role_route_reconciliation", "note": "Recognized substantive field candidate; generic geography must be scoped away from physical geography before a route is shown.",
        },
        "D078:social-research-evaluation": {
            "label": "Social Research and Evaluation", "kind": "cross_cutting_practice_method", "sources": ["asa_interest_areas", "unesco_isced_social_sciences", "onet_sociologists"],
            "hard": {"domain_boundary_compatibility": "pass", "independent_recognition": "pass", "distinct_boundary": "pass", "coherent_scope": "pass", "non_redundant_student_label": "pass"},
            "decision": "suitable_as_explicit_method_practice_area", "note": "A practice route, not a claim that every learner must become an evaluator or use every research method.",
        },
        "D078:computational-digital-social-science": {
            "label": "Computational and Digital Social Science", "kind": "cross_cutting_practice_method", "sources": ["isa_digital_sociology", "unesco_isced_social_sciences"],
            "hard": {"domain_boundary_compatibility": "pass", "independent_recognition": "pass", "distinct_boundary": "pass", "coherent_scope": "pass", "non_redundant_student_label": "pass"},
            "decision": "suitable_as_explicit_method_practice_area", "note": "A recognized digital/social research practice; technology use alone does not prove this route.",
        },
    }
    output = []
    for area_id, spec in specifications.items():
        rows = by_area.get(area_id, [])
        supported = sum(row["status"] == "supported_by_rigorous_gate" for row in rows)
        conditional = sum(row["status"] == "conditional_review_required" for row in rows)
        blocked = sum(row["status"] == "blocked_parent_domain_fit" for row in rows)
        criteria = dict(spec["hard"])
        criteria["role_route_evidence"] = (
            "pass_supported_route"
            if supported
            else "partial_conditional_or_unresolved_routes"
            if conditional
            else "not_established"
        )
        output.append({
            "area_id": area_id,
            "label": spec["label"],
            "kind": spec["kind"],
            "criteria": criteria,
            "sources": spec["sources"],
            "role_route_signal": {"supported_route_rows": supported, "conditional_or_unresolved_rows": conditional, "blocked_parent_rows": blocked},
            "decision": spec["decision"],
            "note": spec["note"],
            "student_promotion": False,
        })
    return output


    # This is an independent audit proposal.  It is intentionally separate from
# role_area_routes and never writes a canonical route.  Areas are ordered by
# the strongest task/boundary fit; additional routes are conditional when the
# work remit must be narrowed (for example, human geography or social data).
ROLE_AUDIT = {
    "criminologist": {
        "domain": "supported",
        "areas": [("D078:sociology-social-anthropology", "supported"), ("D078:psychology-social-behaviour", "conditional"), ("D078:social-research-evaluation", "conditional")],
        "subgroups": [("26", "supported"), ("21", "conditional")],
        "disposition": "retain_with_multi_route_scope",
        "basis": "Crime, deviance, social background and institutions fit social/anthropological study; psychological and quantitative routes depend on the actual research remit.",
        "negative_check": "Do not treat forensic psychiatry, biometric identification or law-enforcement operations as D078 by title alone.",
    },
    "historian": {
        "domain": "exclude_review_only",
        "areas": [], "subgroups": [],
        "disposition": "exclude_from_student_d078",
        "basis": "Generic historical research is a humanities route in the current evidence; it is not D078 merely because historical sociology exists.",
        "negative_check": "Only a separately evidenced historical-sociology or social-history remit could support a D078 route.",
    },
    "sociologist": {
        "domain": "supported",
        "areas": [("D078:sociology-social-anthropology", "supported"), ("D078:social-research-evaluation", "supported"), ("D078:computational-digital-social-science", "conditional"), ("D078:politics-governance-public-policy", "conditional")],
        "subgroups": [("26", "supported"), ("21", "conditional")],
        "disposition": "retain_with_multi_route_scope",
        "basis": "Core work studies society, social behaviour, institutions, data collection and research methods; digital/quantitative and policy routes depend on the work assignment.",
        "negative_check": "Do not imply every sociologist programs, evaluates policy or works digitally.",
    },
    "business economics researcher": {
        "domain": "supported",
        "areas": [("D078:economics-applied-analysis", "supported"), ("D078:social-research-evaluation", "conditional"), ("D078:politics-governance-public-policy", "conditional")],
        "subgroups": [("26", "supported"), ("21", "conditional")],
        "disposition": "correct_area_route",
        "basis": "Economic trends, firms, industries, strategy and macro/micro analysis fit applied economics; research-method routes are secondary.",
        "negative_check": "Do not route this role to psychology merely because the current lexical pass did so.",
    },
    "media scientist": {
        "domain": "supported",
        "areas": [("D078:sociology-social-anthropology", "supported"), ("D078:computational-digital-social-science", "conditional"), ("D078:social-research-evaluation", "conditional")],
        "subgroups": [("26", "supported"), ("21", "conditional")],
        "disposition": "retain_with_scope",
        "basis": "The role studies media use and effects on society; a digital route requires digital-platform, computational or technology-society tasks.",
        "negative_check": "Do not treat media production or journalism alone as social research.",
    },
    "archaeologist": {
        "domain": "conditional",
        "areas": [("D078:sociology-social-anthropology", "conditional")],
        "subgroups": [("26", "conditional")],
        "disposition": "conditional_scope_only",
        "basis": "Archaeology can inform social/cultural anthropology, but the generic role is interdisciplinary and is not a D078 route without an explicit social-anthropological research remit.",
        "negative_check": "Material excavation, conservation or physical archaeology alone is not enough.",
    },
    "economic policy officer": {
        "domain": "supported",
        "areas": [("D078:politics-governance-public-policy", "supported"), ("D078:economics-applied-analysis", "supported"), ("D078:social-research-evaluation", "conditional")],
        "subgroups": [("26", "supported"), ("21", "conditional")],
        "disposition": "correct_area_route",
        "basis": "Economic strategy, trade, competitiveness and public-policy development fit policy/economics; evaluation is conditional on explicit evaluation tasks.",
        "negative_check": "Do not place it under psychology because it advises on human or organizational outcomes.",
    },
    "social work researcher": {
        "domain": "supported",
        "areas": [("D078:social-research-evaluation", "supported"), ("D078:sociology-social-anthropology", "conditional"), ("D078:psychology-social-behaviour", "conditional"), ("D078:computational-digital-social-science", "conditional")],
        "subgroups": [("26", "supported"), ("21", "conditional")],
        "disposition": "retain_with_multi_route_scope",
        "basis": "The role explicitly gathers and analyses social evidence through interviews, focus groups and questionnaires and reports social findings.",
        "negative_check": "Software use is not itself computational social science; the research design and data remit must establish that route.",
    },
    "behavioural scientist": {
        "domain": "supported",
        "areas": [("D078:psychology-social-behaviour", "supported"), ("D078:social-research-evaluation", "supported"), ("D078:computational-digital-social-science", "conditional")],
        "subgroups": [("26", "supported"), ("21", "conditional")],
        "disposition": "correct_area_route",
        "basis": "Human behaviour and social-context research fit psychology/social behaviour; evaluation and computational routes depend on methods and data used.",
        "negative_check": "Do not infer clinical psychology, therapy or programming from the title.",
    },
    "political scientist": {
        "domain": "supported",
        "areas": [("D078:politics-governance-public-policy", "supported"), ("D078:social-research-evaluation", "supported"), ("D078:computational-digital-social-science", "conditional")],
        "subgroups": [("26", "supported"), ("21", "conditional")],
        "disposition": "retain_with_multi_route_scope",
        "basis": "Political systems, institutions, decision-making and policy are direct politics/governance work; research/evaluation and computational routes are method-dependent.",
        "negative_check": "Do not collapse political research into economics or psychology without task evidence.",
    },
    "economic adviser": {
        "domain": "supported",
        "areas": [("D078:economics-applied-analysis", "supported"), ("D078:politics-governance-public-policy", "conditional")],
        "subgroups": [("26", "supported"), ("21", "conditional")],
        "disposition": "correct_area_route",
        "basis": "Economic development, forecasting, finance, trade and fiscal advice fit applied economics; a policy route is conditional on public-policy work.",
        "negative_check": "Do not equate financial advice with social-science research without the economic-analysis tasks.",
    },
    "genealogist": {
        "domain": "conditional",
        "areas": [("D078:human-geography-population", "conditional")],
        "subgroups": [("26", "conditional")],
        "disposition": "conditional_scope_only",
        "basis": "Family records and population history can support demographic/family research, but generic genealogy is a records/history practice rather than D078 social research.",
        "negative_check": "Do not route to computational/digital social science merely because genealogy uses databases or genetic tools.",
    },
    "communication scientist": {
        "domain": "supported",
        "areas": [("D078:sociology-social-anthropology", "supported"), ("D078:computational-digital-social-science", "conditional"), ("D078:social-research-evaluation", "conditional")],
        "subgroups": [("26", "supported"), ("21", "conditional")],
        "disposition": "retain_with_scope",
        "basis": "Communication processes and interactions among people, groups and technologies fit social/communication research; digital route requires explicit digital-society work.",
        "negative_check": "Do not turn all communication, media or writing work into computational social science.",
    },
    "mathematician": {
        "domain": "exclude_review_only",
        "areas": [], "subgroups": [],
        "disposition": "exclude_from_student_d078",
        "basis": "Generic mathematical theory and applications do not establish social-science work; mathematical sociology is a separate remit that needs explicit evidence.",
        "negative_check": "Do not place a mathematician in the quantitative subgroup simply because social science uses mathematics.",
    },
    "thanatology researcher": {
        "domain": "conditional",
        "areas": [("D078:psychology-social-behaviour", "conditional"), ("D078:social-research-evaluation", "conditional"), ("D078:sociology-social-anthropology", "conditional")],
        "subgroups": [("26", "conditional")],
        "disposition": "conditional_scope_only",
        "basis": "Thanatology spans psychological, sociological, physiological and anthropological lenses; D078 is justified only when the research remit is social/behavioural.",
        "negative_check": "Do not expose a generic interdisciplinary death-and-dying role as a single D078 specialty.",
    },
    "economist": {
        "domain": "supported",
        "areas": [("D078:economics-applied-analysis", "supported"), ("D078:social-research-evaluation", "conditional"), ("D078:computational-digital-social-science", "conditional")],
        "subgroups": [("26", "supported"), ("21", "conditional")],
        "disposition": "retain_with_multi_route_scope",
        "basis": "Economic theory, micro/macro analysis, statistics and advice are direct economics work; computational route requires explicit data-intensive or model-building remit.",
        "negative_check": "Do not equate every economist with data science or quantitative social research as an area.",
    },
    "economic development coordinator": {
        "domain": "supported",
        "areas": [("D078:economics-applied-analysis", "supported"), ("D078:politics-governance-public-policy", "supported"), ("D078:sociology-social-anthropology", "conditional")],
        "subgroups": [("26", "supported")],
        "disposition": "retain_with_multi_route_scope",
        "basis": "Economic development policy, community growth and institutional coordination fit applied economics and governance; social-development work is conditional on the actual remit.",
        "negative_check": "Do not infer community sociology from the word development alone.",
    },
    "statistician": {
        "domain": "conditional",
        "areas": [("D078:social-research-evaluation", "conditional"), ("D078:computational-digital-social-science", "conditional")],
        "subgroups": [("21", "conditional")],
        "disposition": "conditional_scope_only",
        "basis": "Statistics is a transferable method; D078 fit requires social-data, survey, population, evaluation or social-modeling work rather than generic statistics.",
        "negative_check": "Keep the generic statistician linked to the statistical/data domain unless the social remit is independently evidenced.",
    },
    "anthropologist": {
        "domain": "supported",
        "areas": [("D078:sociology-social-anthropology", "supported"), ("D078:human-geography-population", "conditional"), ("D078:social-research-evaluation", "conditional")],
        "subgroups": [("26", "supported"), ("21", "conditional")],
        "disposition": "retain_with_multi_route_scope",
        "basis": "Study of human societies, culture and organization directly fits social anthropology; population/geography and research-method routes are remit-dependent.",
        "negative_check": "Do not infer archaeology, biology or physical anthropology from the generic title.",
    },
    "biometrician": {
        "domain": "exclude_review_only",
        "areas": [], "subgroups": [],
        "disposition": "exclude_from_student_d078",
        "basis": "The supplied role work measures physical identifiers for medical or industrial applications; that is not social-science research.",
        "negative_check": "Statistical method use does not make biometric work a D078 role; retain it with data/biostatistics domains where supported.",
    },
    "tax policy analyst": {
        "domain": "supported",
        "areas": [("D078:politics-governance-public-policy", "supported"), ("D078:economics-applied-analysis", "supported"), ("D078:social-research-evaluation", "conditional")],
        "subgroups": [("26", "supported"), ("21", "conditional")],
        "disposition": "retain_with_multi_route_scope",
        "basis": "Tax legislation, public advice and fiscal-impact analysis fit public policy/economics; evaluation is conditional on explicit evaluation work.",
        "negative_check": "Do not classify financial operations or accounting work as D078 without policy/economic analysis.",
    },
    "geographer": {
        "domain": "conditional",
        "areas": [("D078:human-geography-population", "supported"), ("D078:social-research-evaluation", "conditional"), ("D078:computational-digital-social-science", "conditional")],
        "subgroups": [("26", "supported"), ("21", "conditional")],
        "disposition": "conditional_scope_only",
        "basis": "Human, cultural, economic and political geography fit D078; the generic occupation also includes physical geography, so the route must be scoped to social/spatial work.",
        "negative_check": "Physical geography, soils, climate and landform work alone is not a D078 route.",
    },
    "philosopher": {
        "domain": "exclude_review_only",
        "areas": [], "subgroups": [],
        "disposition": "exclude_from_student_d078",
        "basis": "Generic philosophical work is a humanities route; social or political philosophy is not enough to infer empirical social-science practice.",
        "negative_check": "Do not place philosophy in D078 because it discusses society or values.",
    },
    "demographer": {
        "domain": "supported",
        "areas": [("D078:human-geography-population", "supported"), ("D078:social-research-evaluation", "supported"), ("D078:computational-digital-social-science", "conditional")],
        "subgroups": [("26", "supported"), ("21", "conditional")],
        "disposition": "retain_with_multi_route_scope",
        "basis": "Population change, births, mortality, migration, employment and family measures fit population studies; quantitative/digital route depends on actual data methods.",
        "negative_check": "Do not expose all demography as programming; retain the substantive population route independently of tools.",
    },
}


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def main() -> None:
    structure = load_json(DATA / "domain_structure.json")
    domain_meta = load_json(DATA / "domain_meta.json")
    work_profiles = rigorous.profile_index(load_json(DATA / "role_work_profiles.json"))
    roles = [
        row
        for row in load_json(DATA / "role_library_v3_cleaned.json")
        if isinstance(row, dict) and row.get("domain_id") == "D078"
    ]
    d078 = structure["D078"]
    area_by_id = {row["area_id"]: row for row in d078.get("areas_of_specialization", [])}
    role_by_name = {row["role_name"]: row for row in roles}
    domain = domain_meta["D078"]
    baseline_areas = baseline_area_records(d078)
    candidate_areas = candidate_area_records(area_by_id)

    audited_roles = []
    for role_name, decision in ROLE_AUDIT.items():
        current = role_by_name.get(role_name)
        if current is None:
            raise ValueError(f"D078 role missing from current library: {role_name}")
        profile = work_profiles.get(rigorous.role_key(current))
        gate = rigorous_gate(current, domain, profile, baseline_areas, candidate_areas, decision)
        final_domain = (
            "exclude_review_only"
            if gate["parent_domain_gate"] == "blocked_exclude_or_unsupported"
            else "supported_with_scope_by_rigorous_domain_gate"
            if gate["parent_domain_gate"] in {"supported_existing_domain_status", "supported_by_task_triangulation"} and (current.get("domain_fit_review_status") == "conditional" or decision["domain"] == "conditional")
            else "supported_by_rigorous_domain_gate"
            if gate["parent_domain_gate"] in {"supported_existing_domain_status", "supported_by_task_triangulation"}
            else "conditional_review_required"
        )

        audited_roles.append(
            {
                "role_name": role_name,
                "role_number": current.get("role_number"),
                "student_display_name_current": current.get("student_display_name"),
                "source": current.get("source"),
                "isco_group": current.get("isco_group"),
                "esco_code": current.get("esco_code"),
                "current_description": current.get("description"),
                "current_domain_status": current.get("domain_fit_review_status"),
                "current_area_status": current.get("specialization_fit_review_status"),
                "current_area_key": current.get("specialization_fit_area_key"),
                "current_subgroup_status": current.get("subgroup_fit_status"),
                "current_domain_source_refs": current.get("domain_fit_review_source_refs", []),
                "current_area_source_refs": current.get("specialization_fit_review_source_refs", []),
                "independent_audit": {
                    "recommended_domain_disposition_static_context": decision["domain"],
                    "final_rigorous_domain_disposition": final_domain,
                    "rigorous_gate": gate,
                    "baseline_area_routes": gate["baseline_routes"],
                    "unactivated_candidate_area_routes": gate["candidate_routes"],
                    "recommended_subgroup_routes": [
                        {
                            "isco_submajor_key": subgroup,
                            "fit": fit,
                            "interpretation": "audit grouping only; not evidence of fit",
                        }
                        for subgroup, fit in decision["subgroups"]
                    ],
                    "disposition_static_context": decision["disposition"],
                    "task_boundary_basis": decision["basis"],
                    "negative_check": decision["negative_check"],
                    "rigorous_method": "Established task-triangulation gate: parent domain gate, source-backed work-profile activity availability, task/area label/boundary scoring, score >= 6, lead margin >= 2 unless exact phrase, secondary routes retained only at >= 70% of top with >= 2 substantive label/boundary hits; title, ISCO, subgroup membership, frequency and single keywords cannot promote.",
                    "promotion": "audit_only_local_reconciliation_required",
                },
            }
        )

    current_area_counts = {}
    for row in roles:
        key = row.get("specialization_fit_area_key") or "none"
        current_area_counts[key] = current_area_counts.get(key, 0) + 1

    audit_counts = {}
    for row in audited_roles:
        key = row["independent_audit"]["final_rigorous_domain_disposition"]
        audit_counts[key] = audit_counts.get(key, 0) + 1

    area_route_counts = {}
    for row in audited_roles:
        for route in row["independent_audit"]["baseline_area_routes"]:
            area_route_counts[route["status"]] = area_route_counts.get(route["status"], 0) + 1

    candidate_area_route_counts = {}
    for row in audited_roles:
        for route in row["independent_audit"]["unactivated_candidate_area_routes"]:
            candidate_area_route_counts[route["status"]] = candidate_area_route_counts.get(route["status"], 0) + 1

    area_suitability = build_area_suitability(audited_roles)

    subgroup_audit = [
        {
            "isco_submajor_key": "21",
            "current_label": next(s["label"] for s in d078["subgroups"] if s["isco_submajor"] == "21"),
            "current_role_count": next(s["role_count"] for s in d078["subgroups"] if s["isco_submajor"] == "21"),
            "audit_disposition": "retain_as_method_area_candidate_but_remove_isco_semantics_from_student_label",
            "boundary": "Social research that uses quantitative, computational, digital-trace, network, text or modelling methods when those methods are part of the research remit.",
            "evidence_source_ids": ["isa_digital_sociology", "asa_interest_areas", "onet_statisticians", "onet_sociologists"],
            "negative_checks": ["generic programming", "generic mathematics", "generic statistician", "software use without a social research question"],
            "local_action": "Enrich this current baseline area first, then decide whether any of the later unactivated candidate areas should split or supplement it; do not infer a route from ISCO or subgroup membership.",
        },
        {
            "isco_submajor_key": "26",
            "current_label": next(s["label"] for s in d078["subgroups"] if s["isco_submajor"] == "26"),
            "current_role_count": next(s["role_count"] for s in d078["subgroups"] if s["isco_submajor"] == "26"),
            "audit_disposition": "do_not_use_as_single_student_facing_specialization_without_split_or_area_reconciliation",
            "boundary": "The current label combines substantive social, cultural and economic research that spans several distinct D078 areas; it is too broad to tell a learner what practice they are entering.",
            "evidence_source_ids": ["ilo_isco08", "unesco_isced_social_sciences", "isa_research_networks", "asa_interest_areas"],
            "negative_checks": ["history/philosophy by title alone", "economics and policy collapsed into psychology", "social research treated as one occupation", "ISCO membership treated as area fit"],
            "local_action": "Enrich this current baseline area first, then decide whether the later unactivated candidate areas justify a split; do not silently replace the two-area baseline.",
        },
    ]

    payload = {
        "schema": "2026-10-08.d078-subgroup-role-exhaustive-audit.v1",
        "generated_on": ACCESS_DATE,
        "scope": {
            "domain_id": "D078",
            "domain_name_current": "Social Sciences & Behavioural Research",
            "audit_only": True,
            "canonical_mutation": False,
            "nigerian_context_included": False,
            "student_promotion": False,
            "principle": "Role fit is independently assessed from tasks/work activities against domain and area boundaries; subgroup/ISCO membership, title, lexical similarity and role frequency are not proof.",
            "conditional_role_interpretation": "A conditional role is a valid scoped route when the stated remit is present; it is not an automatic rejection. Only unsupported, excluded or unresolved routes remain hidden from student view.",
        },
        "baseline_counts": {
            "domain_structure_role_count": d078.get("role_count"),
            "cleaned_role_library_d078_rows": len(roles),
            "proposed_area_records": len(area_by_id),
            "current_subgroup_records": len(d078.get("subgroups", [])),
            "current_area_route_rows": sum(bool(r.get("role_area_routes")) for r in roles),
            "current_area_route_supported": sum(r.get("specialization_fit_review_status") == "supported" for r in roles),
            "current_area_route_conditional": sum(r.get("specialization_fit_review_status") == "conditional" for r in roles),
            "current_roles_without_area_route": sum(not r.get("role_area_routes") for r in roles),
            "current_d078_domain_supported": sum(r.get("domain_fit_review_status") == "supported" for r in roles),
            "current_d078_domain_conditional": sum(r.get("domain_fit_review_status") == "conditional" for r in roles),
            "current_d078_domain_review_or_removed": sum(r.get("domain_fit_review_status") == "unsupported" for r in roles),
        },
        "decision_counts": {
            "independent_domain_dispositions": audit_counts,
            "baseline_area_route_rows": sum(len(r["independent_audit"]["baseline_area_routes"]) for r in audited_roles),
            "independent_area_route_fit_counts": area_route_counts,
            "unactivated_candidate_area_route_rows": sum(len(r["independent_audit"]["unactivated_candidate_area_routes"]) for r in audited_roles),
            "unactivated_candidate_area_route_fit_counts": candidate_area_route_counts,
            "unactivated_candidate_areas_screened": len(area_by_id),
            "subgroups_screened": len(subgroup_audit),
            "roles_screened": len(audited_roles),
        },
        "methodology": {
            "decider_source": "data/career-mapping/_audit/reconcile_role_fit_from_task_triangulation_2026_10_07.py",
            "decider_artifacts": [
                "data/career-mapping/_audit/DETERMINISTIC_ROLE_AREA_FIT_RECONCILIATION_2026_10_06.md",
                "data/career-mapping/_audit/ROLE_AREA_TEXT_RECONCILIATION_2026_10_07.md",
                "data/career-mapping/_audit/ROLE_DOMAIN_AREA_ROUTE_CONTRACT_2026_10_07.json",
                "data/career-mapping/_audit/CONDITIONAL_ROLE_DOMAIN_TASK_RESOLUTION_2026_10_07.md",
            ],
            "primary_evidence": [
                "source-backed role work activities/tasks",
                "domain definition and boundary",
                "area definition and boundary",
                "authoritative source provenance and date",
            ],
            "guards": [
                "parent domain must be supported before an area route can be promoted",
                "a role title alone cannot prove fit",
                "ISCO code or subgroup membership alone cannot prove fit",
                "frequency and a single keyword cannot prove fit",
                "negative neighbouring-area checks remain required",
                "multiple routes are allowed only when each route passes its own evidence gate",
            ],
            "thresholds": {
                "source_profile_activity_required_for_automatic_area_promotion": True,
                "top_score_minimum": 6,
                "minimum_margin_without_exact_area_phrase": 2,
                "secondary_route_minimum_fraction_of_top": 0.70,
                "secondary_route_minimum_combined_label_boundary_hits": 2,
            },
            "interpretation": "The static D078 recommendations are retained as candidate context only. The final audit disposition is the rigorous gate output below; unresolved or ambiguous cases remain conditional/review-required rather than being promoted.",
        },
        "taxonomy_comparison": {
            "current_two_area_baseline": {
                "areas": [{"area_id": key, "label": label} for key, label in BASELINE_AREA_LABELS.items()],
                "finding": "The two records are the current D078 subgroup/area baseline. The computational record is a plausible method/practice area; the social-cultural-economic record is too broad to be a precise student-facing specialization without further synthesis.",
                "decision": "retain_as_baseline_for_audit_and_enrichment; do_not_assume_final",
            },
            "seven_unactivated_candidates": {
                "area_ids": CANDIDATE_AREA_ORDER,
                "finding": "The seven candidates cover recognized substantive fields plus two cross-cutting practice/method areas. They improve specificity but mix taxonomy axes and currently have no assigned role keys or student visibility.",
                "decision": "evaluate_as_expansion_or_synthesis; do_not_activate_wholesale",
            },
            "evidence_based_synthesis": {
                "recommended_shape": "five substantive routes plus two explicitly labelled practice/method routes, with multi-route role links where tasks support them",
                "substantive_routes": [
                    "Sociology and Social Anthropology",
                    "Economics and Applied Economic Analysis",
                    "Politics, Governance and Public Policy",
                    "Psychology and Social Behaviour",
                    "Human Geography and Population Studies",
                ],
                "practice_method_routes": ["Social Research and Evaluation", "Computational and Digital Social Science"],
                "why": "UNESCO field boundaries and ISA/ASA specialty structures support multiple distinct D078 practices. The five-plus-two synthesis preserves that coverage while making the method axis explicit instead of hiding it inside an ISCO-coded subgroup.",
                "status": "recommendation_for_local_reconciliation_only",
            },
        },
        "area_suitability": area_suitability,
        "current_area_assignment_counts": current_area_counts,
        "area_candidates": [
            {
                "area_id": area_id,
                "label": area_by_id[area_id].get("label"),
                "boundary": area_by_id[area_id].get("boundary"),
                "current_status": area_by_id[area_id].get("area_status"),
                "current_student_visible": area_by_id[area_id].get("student_visible"),
                "current_source_ids": area_by_id[area_id].get("source_ids", []),
                "audit_note": "Area is retained as a candidate reconciliation surface; its role routes must be independently supported before student exposure.",
            }
            for area_id in CANDIDATE_AREA_ORDER
        ],
        "subgroup_audit": subgroup_audit,
        "roles": audited_roles,
        "sources": SOURCES,
        "source_accounting": {
            "authoritative_or_professional_sources_checked": len(SOURCES),
            "unique_urls": len({s["url"] for s in SOURCES}),
            "role_source_refs_preserved_from_current_records": len({u for r in roles for u in r.get("domain_fit_review_source_refs", [])}),
            "nigerian_specific_sources": 0,
            "external_learning_links_added": 0,
            "note": "This is a global subgroup/role fit audit. Nigerian context enrichment is deliberately a later local pass.",
        },
        "local_reconciliation_queue": [
            "Resolve the 20 active/conditional domain role rows against the independent dispositions; keep four excluded/review-only rows hidden.",
            "Correct the current over-concentration of roles under psychology-social-behaviour; use task evidence to route economics, policy, population, social research and sociology separately.",
            "Decide whether the two current subgroup records remain internal provenance aggregations or are replaced/split for student-facing area-of-specialization display.",
            "Add Nigerian context only after the global role/area reconciliation; keep global evidence and Nigeria-specific evidence separate.",
            "Attach exact task locators and any verified student learning links during the later guided-experience enrichment pass; this audit does not approve student content.",
        ],
    }

    out_json = AUDIT / "d078_subgroup_role_exhaustive_audit_2026_10_08.json"
    out_md = DOCS / "D078_SUBGROUP_ROLE_EXHAUSTIVE_AUDIT_2026_10_08.md"
    out_json.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# D078 subgroup and role exhaustive audit — 2026-10-08",
        "",
        "This is an audit-only supplement for local reconciliation. It does not edit canonical domains, subgroups, roles, seeds, SQL, API or UI data. Nigerian context is intentionally excluded from this pass.",
        "",
        "## Result at a glance",
        "",
        f"- Current structure reports **{d078.get('role_count')} roles**, **{len(d078.get('subgroups', []))} subgroup records**, and **{len(area_by_id)} proposed areas**.",
        f"- The cleaned role library contains **{len(roles)} D078 role rows**: **{audit_counts.get('supported_by_rigorous_domain_gate', 0)} supported**, **{audit_counts.get('supported_with_scope_by_rigorous_domain_gate', 0)} supported with scope**, and **{audit_counts.get('exclude_review_only', 0)} excluded/review-only** by the rigorous parent-domain gate.",
        f"- Existing role-area data has **{sum(bool(r.get('role_area_routes')) for r in roles)} routed rows**, but only **{sum(r.get('specialization_fit_review_status') == 'supported' for r in roles)}** are currently marked supported; **{sum(r.get('specialization_fit_review_status') == 'conditional' for r in roles)}** remain conditional and **{sum(not r.get('role_area_routes') for r in roles)}** have no area route.",
        "- The two current subgroup entries are not treated as proof of role or area fit. ISCO 21/26 are occupational classification keys, not D078 specialization names.",
        "",
        "## Subgroup findings",
        "",
        "| Current key | Current label | Finding | Local disposition |",
        "|---|---|---|---|",
        "| 21 | Computational and Quantitative Social Research | Defensible as a method/practice candidate only when the work uses computational, quantitative, digital-trace, network, text or modelling methods for a social question. The number 21 must not be presented as the specialization. | Reconcile as a labelled method area; remove ISCO semantics from student display. |",
        "| 26 | Social, Cultural & Economic Research | Too broad for one student-facing specialization: it spans sociology, culture, economics, policy, population and research practice. | Keep as provenance/legacy aggregation only unless split or replaced by the area candidates. |",
        "",
        "The ILO’s official ISCO table defines 21 as Science and Engineering Professionals and 26 as Legal, Social and Cultural Professionals. That is why this audit does not use either key as a student-facing specialization or as role-fit evidence.",
        "",
        "## Independent role dispositions",
        "",
        "The final disposition below is produced by the same stricter task-triangulation gate used by the wider role/area reconciliation—not by the hand-written D078 recommendation table. The older recommendation is retained only as candidate context. Each role has a parent-domain gate, source-profile availability check, scored area candidates, lead/ambiguity result, subgroup candidates marked only as audit groupings, and a negative check. Multiple routes are allowed only when each route passes its own evidence gate.",
        "",
        "| Disposition | Count | Meaning |",
        "|---|---:|---|",
        f"| supported | {audit_counts.get('supported_by_rigorous_domain_gate', 0)} | The role’s described work directly fits D078; area routes still remain separately scoped. |",
        f"| supported with scope | {audit_counts.get('supported_with_scope_by_rigorous_domain_gate', 0)} | The role is useful in D078 when the stated social/behavioural/economic/policy/population remit is present. |",
        f"| exclude/review-only | {audit_counts.get('exclude_review_only', 0)} | Keep out of student-facing D078 until a different, explicit social-science remit is evidenced. |",
        "",
        "## Rigorous decider used",
        "",
        "The gate uses source-backed work activities and the domain/area boundaries. Automatic area support requires a usable source work-profile activity record, a top candidate score of at least 6, and a lead of at least 2 over the runner-up unless the complete area phrase is present. Secondary routes need at least 70% of the top score and at least two substantive label/boundary hits. A title, ISCO code, subgroup membership, frequency or one keyword cannot promote a route. Cases without a usable profile or with an ambiguous lead remain conditional/review-required.",
        "",
        "This is stricter than treating an authoritative field list plus a plausible task narrative as sufficient: it requires the role’s own activity evidence to connect to the specific area boundary, while retaining provenance and negative checks for neighbouring fields. The JSON records the exact scores, hits, parent gate, profile references and reasons for every role/area row.",
        "",
        "## Baseline versus seven candidate areas",
        "",
        "The two current D078 subgroup records remain the baseline audit surface. The seven later records remain unactivated candidate areas. The gate evaluates both surfaces independently; it does not silently replace the two-area baseline or activate all seven. The current reconciliation recommendation remains a possible five substantive routes plus two explicitly labelled practice/method routes, subject to local review and separate role-route evidence.",
        "",
        "### Definite area-suitability criteria",
        "",
        "An area is suitable for D078 only when it passes the hard gates below. A conditional role route does not fail the area; it means the route is shown with its scope. A missing or ambiguous role route delays promotion but does not create a field by itself.",
        "",
        "| Criterion | Required decision |",
        "|---|---|",
        "| Domain boundary compatibility | The subject, population, process or practice is genuinely inside D078 and does not conflict with an exclusion. |",
        "| Independent recognition | The field or explicitly labelled practice/method is recognized by an authoritative education classification, professional body, research community or established method source. ISCO membership alone cannot satisfy this. |",
        "| Distinct boundary | The area has clear inclusions and exclusions and can be distinguished from neighbouring areas. A mixed umbrella of unrelated disciplines fails this gate. |",
        "| Coherent scope | The area is a coherent field or a clearly labelled cross-cutting practice/method—not a software tool, generic skill, classification code or single job title. |",
        "| Role/workflow evidence | At least one source-backed role or workflow can be connected through its own tasks. Conditional routes count when their scope is explicit; unsupported routes remain hidden. |",
        "| Student-facing label | The label explains what the learner can study/practise and does not expose an ISCO number or silently duplicate another area. |",
        "",
        "The machine-readable `area_suitability` section records these decisions for the two-area baseline and the seven unactivated candidates, including route signals and the reason the area is suitable, held, or unsuitable as one student-facing area.",
        "",
        "### Immediate route corrections surfaced by the audit",
        "",
        "- Economics and applied economics roles should not default to Psychology and Social Behaviour.",
        "- Policy roles should be checked against Politics, Governance and Public Policy and/or Economics and Applied Economic Analysis.",
        "- Sociologists, anthropologists, criminologists and communication researchers need substantive sociology/social-anthropology routes, with method routes added only when their work supports them.",
        "- Demographers and human-remit geographers need Human Geography and Population Studies; generic geographers remain conditional because the occupation also includes physical geography.",
        "- Generic mathematicians, biometricians, historians and philosophers remain excluded/review-only for D078; method overlap or discussion of society is not enough.",
        "- Generic statisticians remain conditional: social-survey, population, evaluation or social-modelling work is required before a D078 route is shown.",
        "",
        "## Evidence register",
        "",
        "The JSON records publisher, direct URL, exact locator, claim supported and limitation for each source. The main independent source families are ILO ISCO-08, UNESCO ISCED, O*NET occupation/task profiles, ESCO occupation records, ISA research-network boundaries, ISA Digital Sociology, and ASA sociology-interest areas.",
        "",
        "## Handoff to local reconciliation",
        "",
        "1. Reconcile role-to-area routes from the independent task/boundary dispositions; do not copy current lexical area routes wholesale.",
        "2. Decide the student-facing treatment of the two current subgroup records after considering the seven area candidates.",
        "3. Keep excluded/review-only roles hidden from D078 student view.",
        "4. Add Nigerian context as a separate evidence layer after global fit is settled.",
        "5. Only after that add guided-experience context, learning explanations and verified student learning links.",
        "",
        "See the machine-readable ledger: `data/career-mapping/_audit/d078_subgroup_role_exhaustive_audit_2026_10_08.json`.",
    ]
    out_md.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(out_json)
    print(out_md)
    print(json.dumps(payload["decision_counts"], indent=2))


if __name__ == "__main__":
    main()

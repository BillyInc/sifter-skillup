"""Build the source-bounded resolution register for the computational audit residuals.

This is an audit overlay only.  It deliberately does not write domain, subgroup,
role-library, or role-link canonical files.  The register resolves scanner
residuals into explicit dispositions so a later taxonomy/role reconciliation can
apply only decisions that have the required evidence.
"""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
OUT_JSON = AUDIT / "computational_residual_resolution_2026_10_06.json"
OUT_MD = AUDIT / "COMPUTATIONAL_RESIDUAL_RESOLUTION_2026-10-06.md"


def load(name: str):
    return json.loads((AUDIT / name).read_text(encoding="utf-8"))


def current_role_index() -> dict[str, dict]:
    """Index exact role titles across current canonical and overlay files.

    The computational signal register is older than some emerging-role
    overlays. This exact lookup corrects stale "unmatched" findings; it does
    not infer parent-domain or specialization fit.
    """
    result: dict[str, dict] = {}
    for filename in (
        "role_library_v3_cleaned.json",
        "thin_domain_role_overlays.json",
        "emerging_role_overlays.json",
    ):
        rows = json.loads((ROOT / filename).read_text(encoding="utf-8"))
        rows = rows if isinstance(rows, list) else rows.get("roles", [])
        for row in rows:
            title = str(row.get("role_name") or "").casefold().strip()
            key = f"{row.get('domain_id')}|{title}"
            result.setdefault(key, {"file": filename, "row": row})
    return result


def source(
    source_id: str,
    publisher: str,
    title: str,
    url: str,
    locator: str,
    supports: str,
    does_not_support: str,
) -> dict:
    return {
        "source_id": source_id,
        "publisher": publisher,
        "title": title,
        "url": url,
        "locator": locator,
        "supports": supports,
        "does_not_support": does_not_support,
    }


def build_source_catalog(manifest: dict, registry: dict) -> list[dict]:
    """Materialise the manifest's source ids with stable URL and limit fields."""

    records: list[dict] = []
    missing_external = {
        "ASA_COMPUTATIONAL_SOCIOLOGY": source(
            "ASA_COMPUTATIONAL_SOCIOLOGY",
            "American Sociological Association",
            "Section Calls for Submissions: Mathematical Sociology",
            "https://www.asanet.org/wp-content/uploads/section_calls_for_submissions.pdf",
            "Computational sociology session scope: computational models of social dynamics, computational data analysis, and online/computer-mediated behaviour.",
            "Computational social research methods are recognised in sociology.",
            "A universal programming requirement or an exhaustive specialization taxonomy.",
        ),
        "NUS_COMPUTATIONAL_SOCIAL_SCIENCE": source(
            "NUS_COMPUTATIONAL_SOCIAL_SCIENCE",
            "National University of Singapore",
            "Centre for Computational Social Science and Humanities",
            "https://cssh.nus.edu.sg/",
            "Centre remit and research themes applying computational/data methods to social-science and humanities questions.",
            "A recognised computational social-science research route.",
            "A universal course sequence, standardized specialization count, or employment qualification.",
        ),
        "UCSD_COMPUTATIONAL_SOCIAL_SCIENCE": source(
            "UCSD_COMPUTATIONAL_SOCIAL_SCIENCE",
            "University of California San Diego",
            "Computational Social Science",
            "https://css.ucsd.edu/",
            "Programme overview describing formal social-science models and computational data analysis.",
            "An academic route combining social-science reasoning with computational methods.",
            "A global credential standard or requirement for every social scientist.",
        ),
        "KOBE_COMPUTATIONAL_SOCIAL_SCIENCE": source(
            "KOBE_COMPUTATIONAL_SOCIAL_SCIENCE",
            "Kobe University",
            "Center for Computational Social Science",
            "https://ccss.kobe-u.ac.jp/en/index.html",
            "Centre scope applying computational/data-science methods to social-science questions.",
            "Cross-regional existence of computational social-science research.",
            "A fixed global specialization count or universal occupational title.",
        ),
        "HKU_COMPUTATIONAL_SOCIAL_SCIENCE": source(
            "HKU_COMPUTATIONAL_SOCIAL_SCIENCE",
            "University of Hong Kong Social Sciences Research Centre",
            "Research: Computational Social Science",
            "https://www.socsc.hku.hk/ssrc/research/",
            "Research-centre description of computational social science and analysis of human behaviour/social phenomena.",
            "Cross-regional scholarly use of computational social research.",
            "An exhaustive taxonomy, standardized job title, or requirement for all social-science learners.",
        ),
    }
    ids = sorted({sid for group in manifest["groups"] for sid in group["source_ids"]})
    for sid in ids:
        entry = registry.get("source_catalog", {}).get(sid)
        if not entry:
            if sid in missing_external:
                records.append(missing_external[sid])
                continue
            # NIH was present in the manifest before it was added to the shared
            # source registry.  Keep the local input traceable here.
            if sid == "nih_nimh":
                records.append(
                    source(
                        sid,
                        "US National Institute of Mental Health",
                        "Theoretical and Computational Neuroscience Program",
                        "https://www.nimh.nih.gov/about/organization/dnbbs/behavioral-science-and-integrative-neuroscience-research-branch/theoretical-and-computational-neuroscience-program",
                        "Program scope for theoretical/computational approaches to neural activity and brain systems.",
                        "A recognised computational-neuroscience research method context.",
                        "A universal requirement for every neuroscience, cognitive-science, or BCI role.",
                    )
                )
                continue
            raise ValueError(f"Manifest source id has no local registry entry: {sid}")
        urls = entry.get("urls") or ([entry["url"]] if entry.get("url") else [])
        for index, url in enumerate(urls):
            records.append(
                source(
                    f"{sid}_{index + 1}" if len(urls) > 1 else sid,
                    entry["name"],
                    entry["evidence_type"],
                    url,
                    f"Shared source registry entry {sid}; used only as the manifest's provenance for this method group.",
                    "The source family contributes occupation, skills, professional, or local-context evidence to the manifest.",
                    "It does not by itself prove a role-to-domain fit, a student-facing subgroup, or a Nigerian demand claim.",
                )
            )
    return records


def build_external_source_catalog() -> list[dict]:
    checkpoint = load("computational_coverage_checkpoint_2026_10_05.json")
    dispositions = load("computational_method_signal_domain_dispositions_2026_10_05.json")
    manifest = json.loads((ROOT / "computational_layer_manifest.json").read_text(encoding="utf-8"))
    report = load("computational_coverage_report.json")
    registry = json.loads((ROOT / "domain_role_source_registry.json").read_text(encoding="utf-8"))

    source_catalog = build_source_catalog(manifest, registry)
    source_catalog.extend(
        [
            source(
                "ACL_COMPUTATIONAL_LINGUISTICS",
                "Association for Computational Linguistics",
                "What is the ACL and what is Computational Linguistics?",
                "https://www.aclweb.org/portal/what-is-cl",
                "The page defines computational linguistics as the scientific study of language from a computational perspective and describes the ACL as the international scientific/professional society for the field.",
                "Computational linguistics is an established field.",
                "That the field belongs as a D065 student-facing specialization or that a new local NLP role should be invented.",
            ),
            source(
                "SIAM_COMPUTATIONAL_SCIENCE_ENGINEERING",
                "Society for Industrial and Applied Mathematics",
                "Activity Group on Computational Science and Engineering",
                "https://www.siam.org/get-involved/connect-with-a-community/activity-groups/computational-science-and-engineering/",
                "About the Group: collaboration among applied mathematicians, computer scientists, domain scientists, and engineers using computational technologies for science and engineering.",
                "Computational science and engineering is an established cross-disciplinary practice.",
                "A fixed subgroup count or automatic duplication of the same subgroup under every science/engineering domain.",
            ),
            source(
                "APS_DIVISION_COMPUTATIONAL_PHYSICS",
                "American Physical Society",
                "Division of Computational Physics",
                "https://engage.aps.org/dcomp/home",
                "Division home: research and development in computational physics and the use of computers in physics research and education.",
                "Computational physics is an established physics research method/field.",
                "Every physics-related local role or each of D041, D132, and D135 having the same student-facing specialization.",
            ),
            source(
                "NASA_COMPUTATIONAL_ASTROPHYSICS",
                "NASA Science",
                "Theoretical and Computational Astrophysics Networks",
                "https://science.nasa.gov/astrophysics/programs/physics-of-the-cosmos/community/roses-25-d-4-theoretical-and-computational-astrophysics-networks/",
                "Program scope: theoretical and computational tools for modelling astrophysical phenomena and training computational scientists.",
                "Computational astrophysics is a legitimate method route within space science.",
                "A universal requirement for every space-science learner or a new D132 role title.",
            ),
            source(
                "IAEA_NUCLEAR_MODELLING",
                "International Atomic Energy Agency",
                "Accelerator Simulation and Theoretical Modelling of Radiation Effects in Structural Materials",
                "https://www-pub.iaea.org/MTCD/Publications/PDF/PUB1732_web.pdf",
                "Nuclear Energy Series NF-T-2.2: modelling tools, computer codes, and experimental verification for radiation effects.",
                "Computational/numerical modelling is a legitimate specialist method in nuclear and radiation science.",
                "A universal requirement for every D135 role or a replacement for regulated nuclear/radiation training.",
            ),
            source(
                "ACS_COMPUTATIONAL_CHEMISTRY",
                "American Chemical Society",
                "Computational Chemistry",
                "https://www.acs.org/careers/chemical-sciences/fields/computational-chemistry.html",
                "Professional career profile: molecular/process modelling, simulation, scientific software, and varying programming preparation.",
                "Computational chemistry is an established chemistry practice with use-case-specific methods.",
                "That biology, biomedical, food, materials, or nanotechnology roles automatically require computational chemistry.",
            ),
            source(
                "ISCB_COMPUTATIONAL_BIOLOGY",
                "International Society for Computational Biology",
                "About ISCB",
                "https://www.iscb.org/about-iscb",
                "Society scope and community description for computational biology and bioinformatics.",
                "Computational biology/bioinformatics is an established global interdisciplinary field.",
                "A role assignment, a required programming level for every biologist, or duplication under every biology-adjacent parent.",
            ),
            source(
                "ASME_CFD_AND_SOLID_MECHANICS",
                "American Society of Mechanical Engineers",
                "Verification, Validation and Uncertainty Quantification",
                "https://www.asme.org/codes-standards/publications-information/verification-validation-uncertainty",
                "Published standards list: V&V 10 for computational solid mechanics and V&V 20 for computational fluid dynamics and heat transfer.",
                "Computational mechanics and CFD are established engineering methods with validation practice.",
                "A universal subgroup or role link in any local domain without parent/task evidence.",
            ),
            source(
                "ASCE_COMPUTATIONAL_MECHANICS",
                "American Society of Civil Engineers",
                "Computational Mechanics Committee",
                "https://www.asce.org/communities/institutes-and-technical-groups/engineering-mechanics-institute/committees/board-of-governors--emi/computational-mechanics-committee/",
                "Committee purpose: computational methods applied to structural, solid, geomechanical, fluid, fluid-structure, dynamic, and thermal engineering mechanics.",
                "Computational mechanics is a recognised civil/built-environment engineering method.",
                "A new civil-engineering role or proof that every civil role needs computational mechanics.",
            ),
            source(
                "IACM_COMPUTATIONAL_MECHANICS",
                "International Association for Computational Mechanics",
                "IACM Constitution",
                "https://iacm.info/about-iacm/iacm-constitution/",
                "Objective clause: promote education, research, and practice in computational mechanics across mechanical, civil, aeronautic, space, naval, biomedical, chemical, electrical, and materials fields.",
                "Computational mechanics is a cross-domain professional field and method.",
                "The exact student-facing subgroup structure or local role fit in any one parent.",
            ),
            source(
                "BMES_COMPUTATIONAL_BIOMEDICAL",
                "Biomedical Engineering Society",
                "Computational Biomedical Engineering Special Interest Group",
                "https://www.bmes.org/communities/special-interest-groups",
                "Computational Biomedical Engineering SIG description: modelling, simulation, data analytics, AI, and machine learning in biology and healthcare.",
                "Computational methods are a recognised biomedical-engineering specialist practice.",
                "A universal requirement for all biomedical roles or an automatic role-to-subgroup link.",
            ),
            source(
                "SME_MINE_VENTILATION_CFD",
                "Society for Mining, Metallurgy & Exploration",
                "Airflow Distributions ... through Field Study and CFD Modeling",
                "https://www.onemine.org/documents/airflow-distributions-with-borehole-fan-and-curtains-for-large-opening-mine-through-field-study-and-cfd-modeling-sme-annual-meeting-2026",
                "SME Annual Meeting 2026 abstract: field data and CFD models used to evaluate mine-ventilation airflow and optimise fan/curtain placement.",
                "CFD is an evidenced mining-ventilation use case.",
                "A mining-wide computational subgroup or a new local ventilation role without exact role-domain evidence.",
            ),
            source(
                "SCREENSKILLS_GAME_ROLES",
                "ScreenSkills",
                "Games industry job profiles",
                "https://www.screenskills.com/job-profiles/browse/games/",
                "Games listing separates programming, technical art, art, animation, design, and production; it names gameplay programmer and technical artist.",
                "The unmatched D139 titles are established professional game-industry titles.",
                "That the titles should be created as local canonical roles or automatically assigned to an existing role.",
            ),
            source(
                "SCREENSKILLS_ENVIRONMENT_ARTIST",
                "ScreenSkills",
                "Environment artist in the games industry",
                "https://www.screenskills.com/job-profiles/browse/games/art/environment-artist-games/",
                "Profile: environment artists create game environments, work with level designers and game engines, and use 3D modelling/texturing tools.",
                "Game environment artist is an established professional title and a distinct art task context.",
                "A local canonical role record or an alias to a different role without a role-library decision.",
            ),
            source(
                "SKILLS_ENGLAND_ROBOTICS_ENGINEER",
                "Skills England",
                "Robotics engineer occupational map",
                "https://occupational-maps.skillsengland.education.gov.uk/maps/occupation/OCC1317",
                "Occupation summary and duties: specify, design, build, program, test, simulate, and deploy robotic systems; typical title includes robotics engineer.",
                "Robotics engineer is an established professional title and the D140 signal is externally supported.",
                "A new local role record when the local evidence already resolves it through an explicit mechatronics-engineer alias.",
            ),
        ]
    )
    return source_catalog


def build_register() -> dict:
    checkpoint = load("computational_coverage_checkpoint_2026_10_05.json")
    dispositions = load("computational_method_signal_domain_dispositions_2026_10_05.json")
    manifest = json.loads((ROOT / "computational_layer_manifest.json").read_text(encoding="utf-8"))
    report = load("computational_coverage_report.json")
    registry = json.loads((ROOT / "domain_role_source_registry.json").read_text(encoding="utf-8"))
    sources = build_external_source_catalog()
    source_ids = {row["source_id"] for row in sources}
    structure = json.loads((ROOT / "domain_structure.json").read_text(encoding="utf-8"))

    linked_keys = {
        f"{row['domain_id']}|{row['subgroup_isco_submajor']}"
        for row in json.loads((ROOT / "computational_role_subgroup_links.json").read_text(encoding="utf-8"))["links"]
    }
    groups_without_links = []
    for group in manifest["groups"]:
        key = f"{group['domain_id']}|{group['isco_submajor']}"
        if key in linked_keys:
            continue
        group_sources = [sid for sid in group["source_ids"] if sid in source_ids]
        groups_without_links.append(
            {
                "group_key": key,
                "domain_id": group["domain_id"],
                "isco_submajor": group["isco_submajor"],
                "label": group["label"],
                "description": group["description"],
                "manifest_source_ids": group["source_ids"],
                "source_reference_ids": group_sources,
                "explicit_role_link_present": False,
                "exact_disposition": "method_group_retained_no_explicit_role_link",
                "role_link_action": "do_not_add_or_infer",
                "reason": "The manifest establishes a method/area evidence anchor, but this group has no exact context-specific role-method link in the explicit link register. ISCO membership, shared skills, or a source family cannot supply that link.",
                "next_gate": "Independent role-task and role-to-domain/subgroup audit; add a role link only if a specific local role task and parent scope jointly support it.",
                "evidence_limit": "No student-facing role path is implied by this group record. No role is removed merely because the method link is absent.",
            }
        )

    layer_consistency = []
    for group in manifest["groups"]:
        domain = structure.get(group["domain_id"], {})
        subgroup = next(
            (row for row in domain.get("subgroups", []) if row.get("isco_submajor") == group["isco_submajor"]),
            None,
        )
        if subgroup is None:
            layer_consistency.append(
                {
                    "group_key": f"{group['domain_id']}|{group['isco_submajor']}",
                    "status": "manifest_group_missing_from_current_domain_structure",
                    "manifest_label": group["label"],
                    "current_label": None,
                    "required_action": "reconcile before canonical seed generation",
                }
            )
        elif subgroup.get("label") != group["label"] or subgroup.get("description") != group["description"]:
            layer_consistency.append(
                {
                    "group_key": f"{group['domain_id']}|{group['isco_submajor']}",
                    "status": "manifest_and_domain_structure_text_conflict",
                    "manifest_label": group["label"],
                    "current_label": subgroup.get("label"),
                    "manifest_description": group["description"],
                    "current_description": subgroup.get("description"),
                    "required_action": "reconcile the authoritative student-facing label/description before canonical seed generation",
                }
            )

    triage = {row["candidate_id"]: row for row in checkpoint["external_candidate_dispositions"]}
    candidate_dispositions = [
        {
            "candidate_id": "D065_COMPUTATIONAL_LINGUISTICS",
            "affected_domains": ["D065"],
            "exact_disposition": "recognized_field_local_parent_fit_unproven_retain_review_only",
            "canonical_action": "no_change",
            "why": "ACL establishes computational linguistics as a real global field, but the local D065 parent is Translation and Interpretation and the scanner found only generic aggregate evidence. The external field cannot be promoted to a D065 specialization from that evidence.",
            "role_action": "no_new_role_and_no_alias",
            "next_gate": "D065 parent-scope and exact local role-task review; only then decide whether a language-technology specialization is warranted.",
            "source_reference_ids": ["ACL_COMPUTATIONAL_LINGUISTICS"],
            "source_limit": "Field recognition is not local parent fit or a role definition.",
        },
        {
            "candidate_id": "D041_COMPUTATIONAL_SCIENCE_AND_ENGINEERING",
            "affected_domains": ["D041"],
            "exact_disposition": "existing_declared_computational_layer_retain_no_duplicate",
            "canonical_action": "retain_existing_layer_no_new_subgroup",
            "why": "D041 already declares Computational & Quantitative Science. SIAM confirms the cross-disciplinary field, so the residual is resolved as existing-layer evidence rather than a second subgroup.",
            "role_action": "role_fit_separate",
            "next_gate": "Check individual D041 role tasks against the parent; do not infer role links from the method group.",
            "source_reference_ids": ["SIAM_COMPUTATIONAL_SCIENCE_ENGINEERING"],
            "source_limit": "SIAM does not prescribe this catalogue's subgroup count or role links.",
        },
        {
            "candidate_id": "PHYSICS_RESEARCH_METHODS",
            "affected_domains": ["D041", "D132", "D135"],
            "exact_disposition": "recognized_method_route_retain_contextual_split_by_parent",
            "canonical_action": "no_new_shared_physics_subgroup",
            "why": "APS establishes computational physics. NASA and IAEA show parent-specific computational routes for astrophysics and nuclear/radiation modelling. The same label must not be copied as a universal subgroup across the three parents.",
            "role_action": "no_role_reassignment",
            "next_gate": "D041 scientific research, D132 space science, and D135 nuclear/radiation role-task reconciliation.",
            "source_reference_ids": ["APS_DIVISION_COMPUTATIONAL_PHYSICS", "NASA_COMPUTATIONAL_ASTROPHYSICS", "IAEA_NUCLEAR_MODELLING"],
            "source_limit": "Sources establish methods and fields, not universal requirements or local role fit.",
        },
        {
            "candidate_id": "COMPUTATIONAL_CHEMISTRY_AND_BIOLOGY",
            "affected_domains": ["D027", "D138", "D142", "D155"],
            "exact_disposition": "retain_d142_existing_field_contextual_methods_elsewhere",
            "canonical_action": "no_duplicate_computational_subgroups",
            "why": "ACS and ISCB establish computational chemistry and biology. D142 already names computational biology/bioinformatics; D027, D138, and D155 retain only parent-specific method candidates unless their own curriculum/task evidence supports more.",
            "role_action": "no_role_reassignment",
            "next_gate": "Parent-specific task/curriculum evidence for D027, D138, and D155; preserve D142's existing field.",
            "source_reference_ids": ["ACS_COMPUTATIONAL_CHEMISTRY", "ISCB_COMPUTATIONAL_BIOLOGY"],
            "source_limit": "A recognised field does not make every adjacent biology, biomedical, food, or materials role computational.",
        },
        {
            "candidate_id": "CFD_AND_COMPUTATIONAL_MECHANICS",
            "affected_domains": ["D017", "D018", "D022", "D138"],
            "exact_disposition": "parent_specific_method_use_case_not_automatic_specialization",
            "canonical_action": "retain_method_evidence_no_blanket_taxonomy_change",
            "why": "ASME and IACM establish computational mechanics and CFD as engineering methods; ASCE supports civil applications; BMES supports biomedical computational methods; SME provides a mining-ventilation CFD use case. These are not evidence for one shared subgroup across all four parents.",
            "role_action": "no_role_reassignment",
            "next_gate": "Use D017/D018/D138 only in role or specialization paths with parent/task evidence; keep D022 CFD tied to mining ventilation use cases.",
            "source_reference_ids": ["ASME_CFD_AND_SOLID_MECHANICS", "ASCE_COMPUTATIONAL_MECHANICS", "IACM_COMPUTATIONAL_MECHANICS", "BMES_COMPUTATIONAL_BIOMEDICAL", "SME_MINE_VENTILATION_CFD"],
            "source_limit": "Methods are not universal foundations and do not establish local role-to-domain fit.",
        },
        {
            "candidate_id": "D078_COMPUTATIONAL_SOCIAL_RESEARCH",
            "affected_domains": ["D078"],
            "exact_disposition": "existing_declared_method_group_supported_optional",
            "canonical_action": "retain_existing_layer",
            "why": "The existing D078 method group is supported by the prior professional/academic source review. Programming and computation remain question-dependent, not universal requirements.",
            "role_action": "retain_only_existing_explicit_related_links",
            "next_gate": "Independent role-task audit for any additional role links.",
            "source_reference_ids": ["ASA_COMPUTATIONAL_SOCIOLOGY", "NUS_COMPUTATIONAL_SOCIAL_SCIENCE", "UCSD_COMPUTATIONAL_SOCIAL_SCIENCE", "KOBE_COMPUTATIONAL_SOCIAL_SCIENCE", "HKU_COMPUTATIONAL_SOCIAL_SCIENCE"],
            "source_limit": "Research-centre existence does not define a global specialization count or universal programming requirement.",
        },
        {
            "candidate_id": "D145_COMPUTATIONAL_NEUROSCIENCE_METHODS",
            "affected_domains": ["D145"],
            "exact_disposition": "existing_optional_method_candidate_retain_no_universal_requirement",
            "canonical_action": "retain_existing_optional_method_context",
            "why": "NIMH establishes theoretical/computational neuroscience as a research direction, matching the existing optional method wording in D145.",
            "role_action": "no_role_reassignment",
            "next_gate": "Role-specific neuroscience/cognitive/BCI task audit.",
            "source_reference_ids": ["nih_nimh"],
            "source_limit": "The research programme does not make computation universal across neuroscience or cognitive roles.",
        },
    ]

    parent_dispositions = [
        {"domain_id": "D017", "method": "computational mechanics / CFD", "exact_disposition": "supported_method_in_parent_not_new_subgroup", "role_link": "not inferred", "source_reference_ids": ["ASME_CFD_AND_SOLID_MECHANICS", "IACM_COMPUTATIONAL_MECHANICS"]},
        {"domain_id": "D018", "method": "computational mechanics", "exact_disposition": "supported_civil_engineering_method_not_new_subgroup", "role_link": "not inferred", "source_reference_ids": ["ASCE_COMPUTATIONAL_MECHANICS", "IACM_COMPUTATIONAL_MECHANICS"]},
        {"domain_id": "D022", "method": "CFD", "exact_disposition": "mining_ventilation_use_case_only", "role_link": "requires exact mining-ventilation task evidence", "source_reference_ids": ["SME_MINE_VENTILATION_CFD", "ASME_CFD_AND_SOLID_MECHANICS"]},
        {"domain_id": "D041", "method": "computational science / physics", "exact_disposition": "retain_existing_computational_quantitative_layer", "role_link": "separate role-domain audit", "source_reference_ids": ["SIAM_COMPUTATIONAL_SCIENCE_ENGINEERING", "APS_DIVISION_COMPUTATIONAL_PHYSICS"]},
        {"domain_id": "D065", "method": "computational linguistics", "exact_disposition": "external_field_only_local_parent_unresolved", "role_link": "no link", "source_reference_ids": ["ACL_COMPUTATIONAL_LINGUISTICS"]},
        {"domain_id": "D132", "method": "computational astrophysics", "exact_disposition": "space-science_method_route_contextual", "role_link": "no universal link", "source_reference_ids": ["NASA_COMPUTATIONAL_ASTROPHYSICS", "APS_DIVISION_COMPUTATIONAL_PHYSICS"]},
        {"domain_id": "D135", "method": "nuclear/radiation modelling", "exact_disposition": "nuclear_method_route_contextual", "role_link": "no universal link", "source_reference_ids": ["IAEA_NUCLEAR_MODELLING", "APS_DIVISION_COMPUTATIONAL_PHYSICS"]},
        {"domain_id": "D138", "method": "computational biomedical engineering / mechanics", "exact_disposition": "biomedical_method_contextual", "role_link": "no automatic link", "source_reference_ids": ["BMES_COMPUTATIONAL_BIOMEDICAL", "IACM_COMPUTATIONAL_MECHANICS"]},
        {"domain_id": "D142", "method": "computational biology / bioinformatics", "exact_disposition": "existing_parent_field_retain_no_duplicate", "role_link": "separate role audit", "source_reference_ids": ["ISCB_COMPUTATIONAL_BIOLOGY"]},
        {"domain_id": "D155", "method": "computational chemistry / materials modelling", "exact_disposition": "conditional_parent_method_no_promotion", "role_link": "requires parent-specific evidence", "source_reference_ids": ["ACS_COMPUTATIONAL_CHEMISTRY", "ASME_CFD_AND_SOLID_MECHANICS"]},
    ]

    candidate_unmatched = [
        {
            "domain_id": "D139",
            "title": "gameplay programmer",
            "exact_disposition": "established_external_title_unmatched_local_role_retain_queue_only",
            "local_action": "do_not_create_or_alias; retain as an unmatched task-signal record for the independent role-library reconciliation",
            "reason": "ScreenSkills lists gameplay programmer as a games-industry programming title, but no exact local role title matched this task row.",
            "source_reference_ids": ["SCREENSKILLS_GAME_ROLES"],
        },
        {
            "domain_id": "D139",
            "title": "technical artist",
            "exact_disposition": "established_external_title_unmatched_local_role_retain_queue_only",
            "local_action": "do_not_create_or_alias; retain as an unmatched task-signal record for the independent role-library reconciliation",
            "reason": "ScreenSkills separates technical art and technical artist from programming and general art; the local role title is not an exact match.",
            "source_reference_ids": ["SCREENSKILLS_GAME_ROLES"],
        },
        {
            "domain_id": "D139",
            "title": "game environment artist",
            "exact_disposition": "established_external_title_unmatched_local_role_retain_queue_only",
            "local_action": "do_not_create_or_alias; retain as an unmatched task-signal record for the independent role-library reconciliation",
            "reason": "ScreenSkills has a dedicated environment-artist profile with game-engine, 3D asset, and environment tasks; no exact local role title matched.",
            "source_reference_ids": ["SCREENSKILLS_ENVIRONMENT_ARTIST"],
        },
    ]

    # Check the old scanner residuals against every current role source. Require
    # exact domain + title equality; local presence does not itself prove fit.
    local_role_index = current_role_index()
    unmatched = []
    existing_local_role_matches = []
    for row in candidate_unmatched:
        key = f"{row['domain_id']}|{row['title'].casefold().strip()}"
        match = local_role_index.get(key)
        if not match:
            unmatched.append(row)
            continue
        local_row = match["row"]
        existing_local_role_matches.append(
            {
                "domain_id": row["domain_id"],
                "title": row["title"],
                "role_key": key,
                "current_file": match["file"],
                "data_state": local_row.get("data_state"),
                "domain_fit_review_status": local_row.get("domain_fit_review_status"),
                "specialization_fit_status": local_row.get("specialization_fit_status"),
                "exact_match_basis": "same domain_id and case-insensitive exact role_name",
                "canonical_action": "do_not_create_duplicate; independently audit existing role parent and area fit",
                "external_source_reference_ids": row["source_reference_ids"],
            }
        )

    d140 = next(row for row in dispositions["domains"] if row["domain_id"] == "D140")
    robotics_signal = next(row for row in d140["role_task_evidence"] if row["role_title_from_task_signal"] == "robotics engineer")
    alias_resolution = {
        "domain_id": "D140",
        "title": "robotics engineer",
        "exact_disposition": "external_title_resolved_to_existing_local_alias_no_new_role",
        "matched_local_role": [row["role_name"] for row in robotics_signal["matched_role_source_records"]],
        "matched_title_basis": [row["matched_title_basis"] for row in robotics_signal["matched_role_source_records"]],
        "local_action": "retain existing mechatronics-engineer record; do not add a second robotics-engineer record from this scanner row",
        "reason": "The current disposition already resolves the task signal through an explicit_also_known_as match; the external occupational map independently confirms robotics engineer as an established title.",
        "source_reference_ids": ["SKILLS_ENGLAND_ROBOTICS_ENGINEER"],
    }

    return {
        "schema_version": "2026-10-06.computational-residual-resolution.v1",
        "generated_by": Path(__file__).name,
        "inputs": [
            "computational_coverage_checkpoint_2026_10_05.json",
            "computational_method_signal_domain_dispositions_2026_10_05.json",
            "computational_layer_manifest.json",
            "computational_coverage_report.json",
            "domain_role_source_registry.json",
        ],
        "scope": "Resolution overlay for the computational coverage residuals. It does not edit canonical taxonomy, subgroup, role-library, or role-link files.",
        "counts": {
            "external_candidate_classes_resolved": len(candidate_dispositions),
            "parent_specific_dispositions": len(parent_dispositions),
            "unmatched_exact_local_titles": len(unmatched),
            "stale_unmatched_signals_resolved_to_existing_local_roles": len(existing_local_role_matches),
            "externally_supported_alias_resolutions": 1,
            "method_groups_total": len(manifest["groups"]),
            "method_groups_with_explicit_role_link": len(linked_keys),
            "method_groups_without_explicit_role_link_resolved": len(groups_without_links),
            "source_records": len(sources),
            "canonical_taxonomy_changes": 0,
            "canonical_role_file_changes": 0,
            "new_role_titles_proposed": 0,
            "manifest_domain_structure_text_conflicts": len(layer_consistency),
        },
        "stale_checkpoint_correction": {
            "old_statement": "Four D139/D140 task-signal titles have no exact local role-title match.",
            "corrected_statement": "Reconcile task-signal titles against all current canonical role sources before counting unmatched titles; three D139 titles are already present in emerging_role_overlays.json, and the D140 robotics engineer signal resolves through an explicit mechatronics-engineer alias.",
            "evidence": "Exact domain/title lookup across current role files plus computational_method_signal_domain_dispositions_2026_10_05.json D139/D140 rows",
        },
        "external_candidate_dispositions": candidate_dispositions,
        "parent_specific_dispositions": parent_dispositions,
        "unmatched_exact_titles": unmatched,
        "existing_local_role_matches": existing_local_role_matches,
        "alias_resolutions": [alias_resolution],
        "method_group_dispositions": groups_without_links,
        "explicit_role_link_baseline": {
            "linked_group_keys": sorted(linked_keys),
            "policy": "The four existing D078 related links remain explicit only. No new links are inferred from ISCO, shared skills, or source-family membership.",
        },
        "manifest_domain_structure_consistency": {
            "checked_group_count": len(manifest["groups"]),
            "conflicts": layer_consistency,
            "canonical_action": (
                "all computational manifest labels and descriptions match domain_structure; no text conflict remains"
                if not layer_consistency
                else "hold canonical write until the conflict is reconciled; this register does not choose between competing student-facing labels"
            ),
        },
        "source_catalog": sources,
        "global_limits": [
            "A professional or government source can establish that a field, method, or title exists; it cannot establish this catalogue's exact subgroup count.",
            "Role-to-domain fit and role-to-subgroup fit remain separate decisions based on the role's actual tasks and the parent scope; ISCO membership is not fit evidence.",
            "No new role is proposed from a stale scanner title: D139 titles found in current role files are not duplicated; their role-to-domain and role-to-area fit remains a separate task-evidence gate.",
            "The 38 no-link method groups are resolved as no-link-needed pending exact task evidence, not as missing data to be filled by inference.",
            "No Nigerian demand, licensing, salary, or local professional requirement is inferred from the global sources in this register.",
        ],
        "canonical_taxonomy_written": False,
    }


def markdown(register: dict) -> str:
    c = register["counts"]
    lines = [
        "# Computational residual resolution — 2026-10-06",
        "",
        "This is a source-bounded audit overlay. It resolves the computational residual queue into explicit dispositions; it does not edit canonical domain, subgroup, role-library, or role-link files.",
        "",
        "## Counts",
        "",
        f"- External candidate classes: **{c['external_candidate_classes_resolved']}**",
        f"- Parent-specific dispositions: **{c['parent_specific_dispositions']}**",
        f"- Exact local-title residuals: **{c['unmatched_exact_local_titles']}**",
        f"- Stale unmatched signals reconciled to existing local role rows: **{c['stale_unmatched_signals_resolved_to_existing_local_roles']}**",
        f"- D140 alias resolutions: **{c['externally_supported_alias_resolutions']}**",
        f"- Method groups without explicit role links resolved: **{c['method_groups_without_explicit_role_link_resolved']}/{c['method_groups_total'] - c['method_groups_with_explicit_role_link']}**",
        f"- Source records with URL, locator, supports, and limits: **{c['source_records']}**",
        "- Canonical changes: **0**",
        "",
        "## Important stale-count correction",
        "",
        "The prior checkpoint said four D139/D140 exact-title mismatches. The current disposition data shows three unmatched D139 titles. The D140 `robotics engineer` signal is already resolved through an explicit `also_known_as` match to the local `mechatronics engineer` record; it must not create a duplicate role.",
        "",
        "## Candidate-class dispositions",
        "",
        "| Candidate | Affected parents | Exact disposition | Canonical action |",
        "|---|---|---|---|",
    ]
    for row in register["external_candidate_dispositions"]:
        lines.append(f"| `{row['candidate_id']}` | {', '.join(row['affected_domains'])} | `{row['exact_disposition']}` | {row['canonical_action']} |")
    lines += ["", "The detailed reason, next gate, source references, and limits are in the JSON register.", "", "## Parent-specific decisions", "", "| Domain | Method | Disposition | Role-link rule |", "|---|---|---|---|"]
    for row in register["parent_specific_dispositions"]:
        lines.append(f"| `{row['domain_id']}` | {row['method']} | `{row['exact_disposition']}` | {row['role_link']} |")
    lines += ["", "## Exact local-title residuals", "", "| Domain | Title | Disposition | Local action |", "|---|---|---|---|"]
    for row in register["unmatched_exact_titles"]:
        lines.append(f"| `{row['domain_id']}` | {row['title']} | `{row['exact_disposition']}` | {row['local_action']} |")
    row = register["alias_resolutions"][0]
    lines += ["", f"D140 `{row['title']}`: `{row['exact_disposition']}` → existing local role `{', '.join(row['matched_local_role'])}` via `{', '.join(row['matched_title_basis'])}`. No new role is proposed.", "", "## The 38 method groups without explicit role links", "", "Each of these groups is explicitly resolved as `method_group_retained_no_explicit_role_link`. The absence is not auto-filled: a method group is not a role path, and ISCO membership/shared skills cannot establish one. A later role link requires exact role-task evidence plus parent-domain/subgroup fit.", "", "| Group | Label | Source IDs | Exact disposition |", "|---|---|---|---|"]
    for row in register["method_group_dispositions"]:
        lines.append(f"| `{row['group_key']}` | {row['label']} | {', '.join(row['manifest_source_ids'])} | `{row['exact_disposition']}` |")
    lines += ["", "## Evidence limits", ""]
    for item in register["global_limits"]:
        lines.append(f"- {item}")
    lines += ["", "## Verification", "", "Run:", "", "```powershell", "python data/career-mapping/_audit/build_computational_residual_resolution_2026_10_06.py", "python -m pytest -q data/career-mapping/_audit/test_computational_residual_resolution_2026_10_06.py", "```", "", "The register is intentionally not a taxonomy seed and is not live deployment evidence.", ""]
    return "\n".join(lines)


if __name__ == "__main__":
    register = build_register()
    OUT_JSON.write_text(json.dumps(register, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    OUT_MD.write_text(markdown(register), encoding="utf-8")
    print(json.dumps(register["counts"], indent=2))

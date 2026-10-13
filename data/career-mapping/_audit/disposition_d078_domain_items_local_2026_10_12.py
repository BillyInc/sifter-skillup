"""Create item-specific local dispositions for the remaining D078 domain items.

This is an audit/disposition artifact only. It does not alter the source
reconciliation, shared promotion ledger, API/runtime, canonical taxonomy, SQL,
or matcher. Promote-scoped decisions remain subject to the later route graph
and runtime integration gate.
"""

from __future__ import annotations

import json
from datetime import date
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
RECON = ROOT / "data/career-mapping/_audit/D078_GUIDED_CONTENT_SOURCE_RECONCILIATION_2026_10_12.json"
CONTRACT = ROOT / "data/career-mapping/_audit/d078_domain_learning_contract_2026_10_08.json"
LEDGER = ROOT / "data/career-mapping/_audit/D078_ITEM_PROMOTION_DISPOSITIONS_2026_10_12.json"
OUT_JSON = ROOT / "data/career-mapping/_audit/D078_DOMAIN_ITEM_DISPOSITIONS_LOCAL_2026_10_12.json"
OUT_MD = ROOT / "docs/manual-review/D078_DOMAIN_ITEM_DISPOSITIONS_LOCAL_2026_10_12.md"

TODAY = date.today().isoformat()

# Curated page/lesson locators. Presence here is not proof of claim approval or
# live reachability; those are recorded only after the corresponding source is
# checked in the current review pass.
LEARNING_LOCATORS = {
    "openlearn_ethics": "Course content: Week 2, Session 2 (planning ethical research); Week 3, Session 3.2 (data protection and privacy); Week 4, Session 4 (respect, consent and power); Week 6, Session 6.3 (audience and dissemination).",
    "cessda_rdm": "Webinar description: research-data life cycle from planning to publishing; data-management plans, FAIR data, repository choice and handling personal data. Free video link is listed on the CESSDA resource page.",
    "ukds_data_skills": "Data Skills Modules page: introductory modules for survey, longitudinal and aggregate data, plus sourcing data ethically; select the module matching the dataset/task.",
    "openlearn_jamovi": "Course content, lessons 1–9: start Jamovi, use menus, add variables, obtain descriptive statistics, correlation, scatterplots, independent t-tests and repeated-measures t-tests.",
    "openlearn_interviews": "Course content: 1.1 when interviews are useful; 2.1–2.5 preparation and ethics; 3.1–3.4 asking questions, consent and ending; 4.1–4.5 fieldnotes and data handling.",
    "taguette_tutorial": "Getting Started guide: Start a project, upload materials, create tags, highlight text, inspect tagged materials and export coded excerpts/project.",
    "openlearn_methodology": "Sections on choosing quantitative, qualitative or mixed approaches; the mixed-method sections explain combining complementary evidence and integrating findings.",
    "pew_survey": "Writing Survey Questions: question wording, response options, question order and pretesting; use the page as survey-design guidance, not as a Nigeria-specific polling rule.",
    "kobo_essentials": "Essentials course, Modules 1–11: build/deploy forms and collect/manage data; 3 hours of video, quizzes and exercises. Provider states free access and no prerequisites.",
    "openlearn_social_participation": "Section table ‘Forms of participation in social science methodologies’, including experiments, surveys, focus groups, qualitative interviews, ethnographic observation and quantitative measurement.",
    "openlearn_ethnography": "Section 2: ethnographic practice, researcher position, observation and field notes; use with the page’s stated reflexive/contextual limits.",
    "edinburgh_css_course": "Learning outcomes and course outline: form social questions; choose computational methods; analyse text/network data; consider ethics/bias; communicate results. University course materials; not a general beginner certificate.",
    "edinburgh_css_labs": "Labs 1–4: setup; data processing and visualisation; machine learning and networks; text analysis. University materials; self-directed work, not a claim of beginner accessibility.",
    "ncrm_agent_based_modelling": "Blocks 1–3: introduction to modelling/ABM and time; data quality, model analysis and uncertainty; model documentation and simulation provenance. Intended mainly for doctoral/early-career researchers with coding experience.",
    "qgis_training": "Training Manual, Module 6: Vector Analysis lessons 6.1–6.4 (reprojection, vector analysis, network analysis and spatial statistics); use only with appropriate geographic data and privacy safeguards.",
    "r4ds": "Introduction and chapters 1–11: data-visualisation workflow, transformation, tidying, import, exploratory analysis and communication; R is an alternative workflow, not cumulative with other packages.",
    "gephi_quickstart": "Quickstart workflow: import a network, inspect/format nodes and edges, apply layout, calculate/inspect network measures and export a visualisation; visualization is not substantive interpretation.",
    "excel_import_analyze": "Microsoft Support: import data into Excel and use tables, filtering, sorting and analysis tools; features vary by Excel version and do not replace method/statistical judgement.",
    "ibm_spss_resources": "IBM SPSS resources page: product learning resources and tutorials; select an item matching the task and check current access/licensing terms.",
    "ibm_spss_essentials": "IBM SPSS Statistics Essentials course overview; course/version and current enrolment or price are determined by IBM at access time.",
    "nvivo_coding_guide": "Lumivero guide sections on coding qualitative material in NVivo; supplementary vendor explanation, not an independent validation of qualitative conclusions.",
    "pandas_tutorials": "Official getting-started tutorials: read/write tabular data, select subsets, plot, derive columns, summarize statistics, reshape, combine tables and handle time series/text.",
    "matplotlib_getting_started": "Official Getting Started tutorial: create a first plot, understand figures/axes and build basic charts; charts communicate data but do not validate the analysis.",
    "networkx_tutorial": "Official Tutorial sections: create graphs, nodes/edges, inspect attributes, draw graphs and use standard graph algorithms; does not itself establish a social-network research design.",
    "mesa_first_model": "Official ‘Creating Your First Model’ tutorial: define agents/model, run a simulation and inspect collected results; simulation outputs depend on assumptions and validation.",
    "casevo_readme_tutorial": "Project README: overview, installation, example election simulation and result analysis. Treat as experimental research software; external LLM/API terms, cost, privacy and validation must be checked before use.",
}

# Replace two legacy destinations that did not survive the current link check.
# MIT OCW is freely accessible and explicitly teaches both case-study research
# and PAR; its graduate-level scope must remain visible to learners.
LEARNING_LINK_OVERRIDES = {
    "d078-document-analysis": {
        "label": "Learn how social researchers use and analyse documents",
        "url": "https://www.open.edu/openlearn/education-development/postgraduate-studies/defining-your-research-methodology",
        "publisher": "The Open University, OpenLearn",
        "locator": "Sections ‘Data collection techniques’ and ‘Data analysis’: identifies texts/documents as evidence and document analysis as a qualitative analysis method; distinguishes it from thematic, discourse and multimodal analysis. Use this as an introductory overview; selecting, authenticating and contextualising particular records still requires task-specific guidance.",
        "level": "Postgraduate research-proposal collection; learner level for this article not stated",
        "access": "Open access; free OpenLearn material",
        "language": "English",
        "role": "free_task_specific_learning_resource",
        "verified_on": "2026-10-12",
        "instructional_fit": "verified_scoped_introductory_overview",
    },
    "d078-secondary-data": {
        "label": "Learn to find and reuse social-science data responsibly",
        "url": "https://ukdataservice.ac.uk/learning-hub/data-skills-modules/",
        "publisher": "UK Data Service",
        "locator": "Introductory modules: Introduction to survey data (find and assess existing data and produce basic tables/graphs), Introduction to longitudinal data, Introduction to aggregate data and Sourcing data ethically (ethical access, data licensing/IPR and social-media reuse). Modules are free and interactive; datasets and jurisdiction-specific examples are primarily UK-focused, so learners must seek Nigerian datasets and apply relevant Nigerian access/privacy requirements separately.",
        "level": "Introductory; provider states no prior knowledge for the introductory survey-data and ethical-sourcing modules",
        "access": "Free, interactive self-paced modules; some additional resources via the provider's Moodle site",
        "language": "English",
        "role": "free_task_specific_learning_resource",
        "verified_on": "2026-10-12",
        "instructional_fit": "verified_with_jurisdictional_scope",
    },
    "case_study_and_comparative_case_design": {
        "label": "Study case-study research in a social-science course",
        "url": "https://ocw.mit.edu/courses/11-237-practice-of-participatory-action-research-par-spring-2016/pages/calendar/",
        "publisher": "MIT OpenCourseWare",
        "locator": "Week 2, Classes 3–4: case-study method, what it is useful for in social-science research, case selection, data gathering and PAR strategies. Graduate-level course; treat as an advanced example, not a beginner prerequisite.",
        "level": "Graduate-level course material",
        "access": "Free MIT OpenCourseWare",
        "language": "English",
        "role": "free_task_specific_learning_resource",
        "verified_on": "2026-10-12",
        "instructional_fit": "verified",
    },
    "participatory_and_action_research": {
        "label": "Learn participatory action research methods",
        "url": "https://ocw.mit.edu/courses/11-237-practice-of-participatory-action-research-par-spring-2016/pages/calendar/",
        "publisher": "MIT OpenCourseWare",
        "locator": "Week 1, Classes 1–2 and Week 2, Classes 3–4: PAR foundations, its use in the Global South, case-study method, community knowledge, data gathering and ethical/practice principles. Graduate-level course; adapt to local context and learner level.",
        "level": "Graduate-level course material",
        "access": "Free MIT OpenCourseWare",
        "language": "English",
        "role": "free_task_specific_video_learning_resource",
        "verified_on": "2026-10-12",
        "instructional_fit": "verified",
    },
}

LOCAL_CLAIM_REVIEWS = {
    "d078-interviews": {
        "status": "reviewed_scoped_claim_supported",
        "finding": "The bounded claim is supported: qualitative interviews can explore people's views and experiences, either alone for suitable questions or alongside other methods to shape or explain a later quantitative stage. The OpenLearn introductory course directly teaches preparation, question practice, ongoing consent, distress, fieldnotes, storage and anonymisation. Interview accounts do not by themselves establish how common a view is; the item remains optional and task-dependent.",
        "sources": [
            {"publisher": "The Open University, OpenLearn", "title": "Conducting qualitative interviews: an introduction", "url": "https://www.open.edu/openlearn/education-development/conducting-qualitative-interviews-introduction", "locator": "Course description and learning outcomes; sections 1.1 (when interviews are useful), 2.1–2.5 (ethics and preparation), 3.1–3.4 (asking questions, ongoing consent and distress), and 4.1–4.5 (fieldnotes, storage, anonymisation and feedback). Free Level 1 introductory course; 3 hours.", "accessed_on": "2026-10-12"},
            {"publisher": "The Open University, OpenLearn", "title": "When are qualitative interviews useful?", "url": "https://www.open.edu/openlearn/education-development/conducting-qualitative-interviews-introduction/content-section-3.1", "locator": "Explains interviews for views/experience and as a standalone or staged/mixed-method component that can help shape survey questions or explain survey patterns; does not claim interview findings estimate population prevalence.", "accessed_on": "2026-10-12"},
        ],
    },
    "d078-document-analysis": {
        "status": "reviewed_scoped_claim_supported",
        "finding": "The bounded claim is supported: documents and records can serve as social-science evidence, and their analysis may use content analysis, qualitative coding or discourse analysis depending on the question. A software tutorial such as Taguette only demonstrates organizing/highlighting coded passages; it does not teach or validate the document-analysis design, so the learning destination was replaced with an introductory methods overview and the software remains an optional implementation aid rather than the method itself.",
        "sources": [
            {"publisher": "The Open University, OpenLearn", "title": "Defining your research methodology", "url": "https://www.open.edu/openlearn/education-development/postgraduate-studies/defining-your-research-methodology", "locator": "‘Data collection techniques’ identifies texts and documents as possible evidence; ‘Data analysis’ distinguishes document analysis (evaluating physical/electronic documents to understand meaning) from thematic, discourse and multimodal analysis. This is a methods overview, not a full document-authenticity protocol.", "accessed_on": "2026-10-12"},
            {"publisher": "SAGE Research Methods", "title": "Document Analysis", "url": "https://methods.sagepub.com/ency/edvol/embed/sage-encyc-qualitative-research-methods/chpt/document-analysis", "locator": "Lindsay Prior, SAGE Encyclopedia of Qualitative Research Methods: documents as social-science data; analysis can examine content, apply content-analysis measures, thematic coding or discourse analysis; method depends on the research question. Scholarly reference context, not a freely accessible full course.", "accessed_on": "2026-10-12"},
        ],
    },
    "d078-observation-ethnography": {
        "status": "reviewed_scoped_claim_supported",
        "finding": "The bounded claim is supported with a distinction: observation is one way to study actions and use of spaces in context, while ethnographic approaches add sustained/contextual interpretation and are not simply passive watching. OpenLearn's social-science course gives direct examples of observation and participant observation; its ethics material says researchers must identify whose permission is needed before planning data collection. Do not imply every observation is ethnography, that all settings require the same permission pathway, or that observation automatically explains motives.",
        "sources": [
            {"publisher": "The Open University, OpenLearn", "title": "Social science and participation", "url": "https://www.open.edu/openlearn/society-politics-law/social-science-and-participation/content-section-4.3/", "locator": "‘Participating in social science’ table names ethnographic observation; following text describes participant observation during everyday routines and contrasts direct participation with unobtrusive/document methods. Course is free, Level 2 intermediate, 10 hours; use the specific section rather than implying the whole course is a technical ethnography manual.", "accessed_on": "2026-10-12"},
            {"publisher": "The Open University, OpenLearn", "title": "Becoming an ethical researcher: who should researchers consider?", "url": "https://www.open.edu/openlearn/mod/oucontent/view.php?id=161226&section=_unit3.3", "locator": "Explains observation as a way to gather evidence about behaviour, actions and use of spaces, and states that the researcher should identify the people from whom permission must be sought before planning research. Apply consent/permission decisions to the project and local ethical review; do not generalize UK law examples.", "accessed_on": "2026-10-12"},
        ],
    },
    "d078-secondary-data": {
        "status": "reviewed_scoped_claim_supported",
        "finding": "The bounded claim is supported: previously collected data can be reused to describe, compare or reanalyse social groups/organisations, provided the new question fits what was collected and its context/documentation, access and permitted reuse are checked. UK Data Service's free modules directly teach how to find and assess survey/longitudinal/aggregate data and ethical sourcing, including licensing/IPR. The datasets and institutional/legal examples are UK-focused; this supports the general reuse workflow, not availability or legal permission for any Nigerian dataset.",
        "sources": [
            {"publisher": "UK Data Service", "title": "Data skills modules", "url": "https://ukdataservice.ac.uk/learning-hub/data-skills-modules/", "locator": "Introductory-module descriptions: survey data (find data, assess it before analysis, basic tables/graphs), longitudinal data, aggregate data and ethical sourcing (responsible access/reuse, licensing/IPR and social-media data); provider labels these interactive modules free and introductory.", "accessed_on": "2026-10-12"},
            {"publisher": "UK Data Service", "title": "Approaches to reusing qualitative data", "url": "https://ukdataservice.ac.uk/learning-hub/qualitative-data/reusing-qualitative-data/approaches-to-reusing-qualitative-data/", "locator": "Distinguishes description, comparison, reanalysis, research-design/methodological advancement, and teaching reuse; says reuse purpose and similarity to the original research questions are central considerations. Use as methodological context, not as a universal license to reuse restricted data.", "accessed_on": "2026-10-12"},
        ],
    },
    "d078-quantitative-approach": {
        "status": "reviewed_scoped_claim_supported",
        "finding": "The bounded claim is supported as one optional research approach: quantitative methods use numerical measurement and analysis to answer suitable questions, but are not required for every social-science route. OpenLearn distinguishes quantitative from qualitative and mixed approaches and connects method choice to aims, assumptions and questions; the Sociology CCMAS/statistics source is curriculum context, not proof that every student or role must use a specific package or statistical technique.",
        "sources": [
            {"publisher": "The Open University, OpenLearn", "title": "Defining your research methodology", "url": "https://www.open.edu/openlearn/education-development/postgraduate-studies/defining-your-research-methodology", "locator": "Sections ‘Research methodologies’ and ‘Data analysis’: defines quantitative methodology as one approach among quantitative, qualitative and mixed methods; selection depends on study aims/objectives and theoretical assumptions; examples include numerical summaries, relationships and differences.", "accessed_on": "2026-10-12"},
            {"publisher": "The Open University, OpenLearn", "title": "Getting started with jamovi", "url": "https://www.open.edu/openlearn/health-sports-psychology/getting-started-jamovi/content-section-0?intro=1", "locator": "Course overview and lessons 1–9: introduces a graphical tool for descriptive statistics, correlation, scatterplots and selected t-tests. Used only to support an optional learning example, not to prescribe jamovi or establish statistical competence.", "accessed_on": "2026-10-12"},
        ],
    },
    "d078-qualitative-approach": {
        "status": "reviewed_scoped_claim_supported",
        "finding": "The bounded claim is supported as an optional approach for questions about meaning, experience and context using non-numerical material. OpenLearn identifies qualitative strategies including case studies, ethnography, narrative, phenomenology and action research, and distinguishes qualitative analysis from numerical analysis. Interviews are one possible method, not the whole of qualitative research; results do not automatically establish prevalence or representativeness.",
        "sources": [
            {"publisher": "The Open University, OpenLearn", "title": "Defining your research methodology", "url": "https://www.open.edu/openlearn/education-development/postgraduate-studies/defining-your-research-methodology", "locator": "Sections ‘Research methodologies’ and ‘Data analysis’: qualitative strategies include case study, ethnography, grounded theory, narrative, phenomenology and action research; qualitative analysis includes thematic, discourse, document and multimodal analysis.", "accessed_on": "2026-10-12"},
            {"publisher": "The Open University, OpenLearn", "title": "Conducting qualitative interviews: an introduction", "url": "https://www.open.edu/openlearn/education-development/conducting-qualitative-interviews-introduction/content-section-0", "locator": "Course sections 1–4: when interviews are useful, preparation and ethics, question practice, consent, fieldnotes and data handling. This is evidence for one method-specific learning route, not a claim that qualitative research consists only of interviews.", "accessed_on": "2026-10-12"},
        ],
    },
    "d078-mixed-methods": {
        "status": "reviewed_scoped_claim_supported",
        "finding": "The bounded claim is supported when a study has distinct evidence needs and an explicit plan for combining numerical and qualitative evidence. OpenLearn explains that mixed-method designs can address different questions or different aspects of one question and that findings should be integrated; merely collecting numbers and quotations does not establish a mixed-method design. This remains an optional design choice, not a universal D078 requirement.",
        "sources": [
            {"publisher": "The Open University, OpenLearn", "title": "Defining your research methodology", "url": "https://www.open.edu/openlearn/education-development/postgraduate-studies/defining-your-research-methodology", "locator": "‘Research methodologies’ and ‘Data analysis’: mixed methods combine approaches to answer different research questions or aspects of a question; examples describe quantitative evidence on engagement followed by qualitative inquiry into why, and discuss integration/sequencing.", "accessed_on": "2026-10-12"},
        ],
    },
    "d078-survey-method": {
        "status": "reviewed_scoped_claim_supported",
        "finding": "The bounded claim is supported: surveys are a way to collect comparable answers from a defined population, but question wording, response options, testing, sampling and reporting affect what conclusions are justified. Pew documents pretesting, wording and response-option effects; AAPOR says researchers should first ask whether a survey fits the research question and report population, recruitment, sample construction and questionnaire details. These sources support the method and its limits, not a universal requirement or a claim that a large response count alone is representative.",
        "sources": [
            {"publisher": "Pew Research Center", "title": "Writing Survey Questions", "url": "https://www.pewresearch.org/writing-survey-questions/", "locator": "Sections ‘Question development’, ‘Open- and closed-ended questions’ and ‘Question wording’: iterative questionnaire development, focus groups/cognitive interviews/pretesting, and effects of wording, response-option coverage/order and question context.", "accessed_on": "2026-10-12"},
            {"publisher": "American Association for Public Opinion Research", "title": "Best Practices for Survey Research", "url": "https://aapor.org/standards-and-ethics/best-practices/", "locator": "Best-practices sections ask whether a survey is the appropriate method and describe questionnaire design and reporting details including population, sample construction, recruitment, mode, sample size and exact question/response wording.", "accessed_on": "2026-10-12"},
        ],
    },
    "d078-responsible-research": {
        "status": "reviewed_scoped_claim_supported",
        "finding": "The bounded claim is supported as a conditional responsibility when research involves people or identifiable/sensitive information. AAA's professional principles support no-harm, openness, informed consent/permissions and record protection; OpenLearn provides task-specific instruction. NHREC/health-review requirements remain Nigeria-specific and are not generalized to all social-science research.",
        "sources": [
            {"publisher": "American Anthropological Association", "title": "Anthropological Ethics", "url": "https://americananthro.org/about/anthropological-ethics/", "locator": "Principles of Professional Responsibility: Do No Harm; Openness and Honesty; Informed Consent and Necessary Permissions; Protect and Preserve Records.", "accessed_on": "2026-10-12"},
            {"publisher": "The Open University, OpenLearn", "title": "Becoming an ethical researcher", "url": "https://www.open.edu/openlearn/education-development/becoming-ethical-researcher", "locator": "Course sections on risk, consent, privacy/data protection, power and dissemination; legal examples are UK-scoped.", "accessed_on": "2026-10-12"},
            {"publisher": "National Health Research Ethics Committee of Nigeria", "title": "NHREC ethics training", "url": "https://nhrec.gov.ng/services/ethics-training/", "locator": "Nigeria-specific ethics training includes consent, data privacy, bioethics and participant rights. Retain as local context; do not generalize it to every D078 project or claim every learner needs NHREC certification.", "accessed_on": "2026-10-12"},
        ],
    },
    "d078-care-for-research-data": {
        "status": "reviewed_scoped_claim_supported",
        "finding": "CESSDA directly describes social-science research-data management across the project life cycle and covers data-management plans, FAIR practice, repositories and personal data. This supports an optional task-specific domain choice, not a universal requirement or blanket instruction to publish data.",
        "sources": [
            {"publisher": "CESSDA Training Resources", "title": "Research Data Management in the Social Sciences", "url": "https://www.cessda.eu/Training/Training-Resources/Resource-crd-4767", "locator": "Webinar description and learning outcomes: planning-to-publishing life cycle, DMPs, FAIR data, repository choice and personal-data handling; free video linked by provider.", "accessed_on": "2026-10-12"},
        ],
    },
}

# Scope text is deliberately route-conditional. The candidate's own task and
# boundary are included below, and this extra rule prevents any row from being
# read as a universal job requirement or as curriculum-taught content.
GENERAL_SCOPE = (
    "Optional domain-enrichment choice for the named task only; not required "
    "for every D078 learner or occupation, not proof of competence, and not "
    "claimed to be taught by the Sociology programme."
)

HOLD_IDS = {
    "d078-certification-boundaries": (
        "Hold the negative universal claim. The reviewed sources show examples "
        "of credentials/training in particular contexts but do not establish "
        "that no D078-wide professional certification exists. Do not show this "
        "as student guidance; reassess only with a bounded profession, issuer, "
        "jurisdiction and exhaustive credential-source check."
    )
}

LOCAL_CLAIM_REVIEWS["d078-certification-boundaries"] = {
    "status": "resolved_hold_negative_universal_statement",
    "finding": "Do not present the absence of a universal D078 certification as a learning item. This hold does not claim that no professional credentials exist; it removes an unsupported negative statement from learner guidance. Revisit only if a bounded profession/credential question is identified.",
    "sources": [],
}


def read_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def normalized_contract_rows(contract: dict[str, Any]) -> dict[str, dict[str, Any]]:
    rows: dict[str, dict[str, Any]] = {}
    for key in (
        "existing_inventory",
        "foundation_and_route_additions",
        "route_alternatives",
        "deep_search_options",
    ):
        for row in contract.get(key, []):
            rows[str(row.get("id"))] = row
    return rows


def pick_learning_link(row: dict[str, Any], contract_row: dict[str, Any]) -> dict[str, Any]:
    item_id = str(row.get("item_id"))
    if item_id in LEARNING_LINK_OVERRIDES:
        return dict(LEARNING_LINK_OVERRIDES[item_id])
    # Prefer the contract's explicitly free/task-specific link when present.
    candidates = list(contract_row.get("learning_links") or [])
    if not candidates:
        candidates = list(row.get("closure", {}).get("learning_links") or [])
    if not candidates:
        raise ValueError(f"No learning link for {row.get('item_id')}")
    link = next(
        (x for x in candidates if x.get("role") == "free_task_specific_learning_resource"),
        candidates[0],
    )
    locator = link.get("locator") or LEARNING_LOCATORS.get(str(link.get("source_id")))
    if not locator:
        # The no-certification statement is held and does not require a
        # student-facing instructional destination.
        if row.get("item_id") in HOLD_IDS:
            return {}
        raise ValueError(f"No exact learning locator for {row.get('item_id')}: {link}")
    result = dict(link)
    result["locator"] = locator
    # Never fabricate an access date merely because the disposition was
    # generated today. Preserve only an actual source-record date.
    return result


def make_record(row: dict[str, Any], contract_row: dict[str, Any]) -> dict[str, Any]:
    item_id = str(row["item_id"])
    closure = row.get("closure") or {}
    contract_scope = contract_row.get("use_case") or contract_row.get("use_case_review", {}).get("basis") or ""
    rationale = (closure.get("category_rationale") or {}).get("why") or contract_row.get("meaning") or closure.get("meaning") or ""
    boundary = (closure.get("category_rationale") or {}).get("boundary")
    limits = list(closure.get("limitations") or contract_row.get("limits") or [])
    learning = pick_learning_link(row, contract_row)
    sources = list(closure.get("evidence") or [])
    record = {
        "item_id": item_id,
        "label": row.get("label"),
        "item_type": contract_row.get("type") or contract_row.get("item_type"),
        "category": (closure.get("category_rationale") or {}).get("category") or row.get("category") or contract_row.get("category"),
        "decision": "hold" if item_id in HOLD_IDS else "promote_scoped",
        "decision_rationale": HOLD_IDS.get(item_id) or rationale,
        "student_scope": HOLD_IDS.get(item_id) or " ".join(x for x in (contract_scope, boundary, GENERAL_SCOPE) if x),
        "meaning": closure.get("meaning") or contract_row.get("meaning"),
        "use_case": contract_scope,
        "learner_output": closure.get("learner_output") or contract_row.get("output"),
        "prerequisite_state": closure.get("prerequisites", {}).get("state") if isinstance(closure.get("prerequisites"), dict) else "not_established_for_this_candidate",
        "relationships": closure.get("relationships") or contract_row.get("relationships") or [],
        "alternatives": contract_row.get("alternatives") or [],
        "limitations": list(dict.fromkeys(limits + ([boundary] if boundary else []))),
        "evidence_source_ids": [x.get("source_id") for x in sources if x.get("source_id")],
        "evidence_locators": sources,
        "learning_link_override": learning,
        "claim_review_status": LOCAL_CLAIM_REVIEWS.get(item_id, {}).get(
            "status", "pending_local_claim_and_checkpoint_verification"
        ),
        "decision_status": (
            "resolved_hold"
            if item_id in HOLD_IDS
            else "reviewed_scoped_candidate"
            if LOCAL_CLAIM_REVIEWS.get(item_id, {}).get("status") == "reviewed_scoped_claim_supported"
            else "proposed_pending_claim_review"
        ),
        "claim_review_finding": LOCAL_CLAIM_REVIEWS.get(item_id, {}).get("finding"),
        "claim_review_sources": LOCAL_CLAIM_REVIEWS.get(item_id, {}).get("sources", []),
        "learning_link_audit_status": (
            "checked_in_this_pass" if item_id in LEARNING_LINK_OVERRIDES else "inherited_source_record_not_rechecked_in_this_pass"
        ),
        "curriculum_note": "Domain enrichment only. The programme-to-domain relationship does not mean this item is taught by the Sociology degree.",
        "route_policy": "Show as a conditional/optional D078 learning choice; do not imply a role guarantee, universal requirement, or cumulative requirement. Route-specific prerequisite/order edges remain a separate graph decision.",
        "student_visible_after_integration": False,
    }
    if record["decision"] == "promote_scoped":
        if not record["evidence_source_ids"]:
            raise ValueError(f"No item-level source evidence for {item_id}")
        if not learning or not str(learning.get("url", "")).startswith("https://") or not learning.get("locator"):
            raise ValueError(f"Unverified learning destination for {item_id}")
    return record


def main() -> None:
    recon = read_json(RECON)
    contract = read_json(CONTRACT)
    ledger = read_json(LEDGER)
    contract_rows = normalized_contract_rows(contract)
    existing = {str(x.get("item_id")) for x in ledger.get("domain_decisions", [])}
    pending = [x for x in recon.get("domain_records", []) if str(x.get("item_id")) not in existing]
    if len(pending) != 50:
        raise SystemExit(f"Expected exactly 50 pending domain records; found {len(pending)}")
    records = []
    for row in pending:
        item_id = str(row.get("item_id"))
        contract_row = contract_rows.get(item_id)
        if not contract_row:
            raise SystemExit(f"No matching reviewed domain contract row: {item_id}")
        if row.get("local_readiness") != "ready_for_individual_local_promotion_decision":
            raise SystemExit(f"Candidate is not locally disposition-ready: {item_id}")
        records.append(make_record(row, contract_row))

    ids = [r["item_id"] for r in records]
    if len(set(ids)) != len(ids):
        raise SystemExit("Duplicate domain item IDs in local dispositions")
    if set(ids) != {str(x.get("item_id")) for x in pending}:
        raise SystemExit("Local dispositions do not exactly cover the pending domain set")
    counts: dict[str, int] = {}
    for record in records:
        counts[record["decision"]] = counts.get(record["decision"], 0) + 1

    artifact = {
        "artifact_type": "d078_local_domain_item_dispositions",
        "artifact_id": "D078_DOMAIN_ITEM_DISPOSITIONS_LOCAL_2026_10_12",
        "reviewed_on": TODAY,
        "scope": "The 50 domain items lacking individual decisions; the three already decided domain items and all area/role/matcher records are outside this artifact.",
        "policy": [
            "A complete candidate contract is not an approval; every record receives an item-specific decision.",
            "No absence of a Nigerian source disqualifies globally relevant work; add Nigerian context only where it contributes evidence.",
            "No direct CCMAS course match is required for domain enrichment; do not label domain enrichment as Sociology curriculum content.",
            "Domain choices are optional/conditional and do not imply that every D078 learner or role needs them.",
            "A negative universal credential claim is held unless bounded evidence supports it.",
            "No role-fit, role mapping, JAMB matcher, SQL, or canonical taxonomy changes are made.",
        ],
        "counts": {
            "input_pending": len(pending),
            "decisions": counts,
            "scoped_claims_supported_in_this_pass": sum(LOCAL_CLAIM_REVIEWS.get(r["item_id"], {}).get("status") == "reviewed_scoped_claim_supported" for r in records),
            "negative_statement_holds_resolved": sum(LOCAL_CLAIM_REVIEWS.get(r["item_id"], {}).get("status") == "resolved_hold_negative_universal_statement" for r in records),
            "claim_reviews_still_pending": sum(r["claim_review_status"] == "pending_local_claim_and_checkpoint_verification" for r in records),
            "student_visible_now": 0,
        },
        "records": records,
        "validation": {
            "exact_pending_set_coverage": True,
            "unique_item_ids": len(set(ids)),
            "missing_ids": [],
            "extra_ids": [],
            "records_with_evidence_and_learning_locator_present": sum(
                bool(r["evidence_source_ids"] and r.get("learning_link_override", {}).get("url") and r.get("learning_link_override", {}).get("locator"))
                for r in records
            ),
            "live_reachability_and_claim_approval_proven_by_this_generator": False,
            "canonical_or_runtime_changes": False,
        },
    }
    OUT_JSON.write_text(json.dumps(artifact, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# D078 domain-item local disposition — 2026-10-12",
        "",
        "This artifact contains local item-by-item proposal decisions for the 50 domain records that had no individual local decision. Forty-seven scoped proposals still need claim/checkpoint verification. It is not a runtime promotion or student-visibility change. Existing domain decisions and all seven area decisions are outside its input set.",
        "",
        f"- Proposed decisions: **{counts.get('promote_scoped', 0)} scoped promotions**, **{counts.get('hold', 0)} hold**.",
        "- Exact input coverage and item-ID uniqueness are checked by the generator.",
        "- Each proposed scoped promotion has evidence/link fields and a locator in the candidate contract; the generator checks field presence, not live reachability or whether the source proves the item-level claim.",
        f"- Current item-level claim review: {sum(LOCAL_CLAIM_REVIEWS.get(r['item_id'], {}).get('status') == 'reviewed_scoped_claim_supported' for r in records)} scoped claims reviewed with support; {sum(LOCAL_CLAIM_REVIEWS.get(r['item_id'], {}).get('status') == 'resolved_hold_negative_universal_statement' for r in records)} unsupported universal-negative statement held; {sum(r['claim_review_status'] == 'pending_local_claim_and_checkpoint_verification' for r in records)} still pending. A proposed scoped disposition is not canonical promotion or student approval.",
        "- This pass rechecked two legacy instructional destinations and replaced them with the MIT OCW course calendar; the remaining inherited links still require their own current link/claim QA.",
        "- The held item is the unsupported negative claim that D078 has no universal professional certification; absence from the current inventory does not prove that universal claim.",
        "- Domain enrichment is not represented as Sociology curriculum-taught content. No role-fit, matcher, SQL, taxonomy or student-visibility changes were made.",
        "",
        "## Item decisions",
        "",
        "| Item | Decision | Use/scope | Learning destination |",
        "|---|---|---|---|",
    ]
    for record in records:
        link = record.get("learning_link_override") or {}
        clean = lambda value: str(value or "").replace("|", "\\|").replace("\n", " ")
        lines.append(
            f"| `{record['item_id']}` — {clean(record['label'])} | `{record['decision']}` | {clean(record['student_scope'])} | {clean(link.get('label'))}: {clean(link.get('url'))} — {clean(link.get('locator'))} |"
        )
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(artifact["counts"], ensure_ascii=False))
    print(f"Wrote {OUT_JSON.relative_to(ROOT)}")
    print(f"Wrote {OUT_MD.relative_to(ROOT)}")


if __name__ == "__main__":
    main()

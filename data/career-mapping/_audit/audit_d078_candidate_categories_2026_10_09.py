"""Audit the proposed learning-path category for every reconciled D078 gap item.

This is a review artifact, not candidate approval, canonical promotion, or SQL.
The first-pass reconciliation's "foundation/edge" bucket is deliberately
re-examined against task breadth, conditionality, and source scope.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
INPUT = ROOT / "data/career-mapping/_audit/d078_learning_path_reconciliation_2026_10_08.json"
OUT_JSON = ROOT / "data/career-mapping/_audit/d078_candidate_category_audit_2026_10_09.json"
OUT_MD = ROOT / "docs/manual-review/D078_CANDIDATE_CATEGORY_AUDIT_2026_10_09.md"


RATIONALES: dict[str, dict[str, str]] = {
    "sampling_recruitment_and_representativeness": {
        "category": "useful_additional_edge",
        "why": "Sampling and case-selection judgement strengthens many empirical routes, but its form depends on the question and evidence source; some roles do not sample people or make population claims.",
        "breadth": "Applicable across survey, evaluation, quantitative and qualitative case-selection workflows, but not every D078 role or design.",
        "boundary": "Keep probability-sample representativeness distinct from purposive case selection. A case or convenience sample must not be described as representing a wider population without design support.",
        "evidence_limit": "AAPOR and ESRC support the research-method use; they do not establish a universal task for every occupation. NUC is Nigerian curriculum context only.",
    },
    "measurement_and_operationalisation": {
        "category": "useful_additional_edge",
        "why": "Turning an abstract construct into observable indicators is valuable when a project measures concepts, especially structured quantitative or instrument-based work, but is not required in the same form by every interpretive or non-empirical route.",
        "breadth": "Crosses multiple empirical routes, yet the appropriate form differs by method and construct; not established as an all-path foundation.",
        "boundary": "Do not imply that every social concept must be reduced to a numeric measure or that operationalisation replaces qualitative interpretation.",
        "evidence_limit": "GESIS and the cited research-design teaching support measurement as a methodological concern; route-specific and local curriculum evidence needs exact claim review.",
    },
    "reliability_validity_and_uncertainty": {
        "category": "useful_additional_edge",
        "why": "Checking consistency, whether an interpretation is supported, and what uncertainty remains is useful across many evidence-producing routes, but checks differ by method and evidence type.",
        "breadth": "Broadly transferable within research/evidence work, not one task or statistic that every D078 role performs.",
        "boundary": "Separate measurement reliability, validity of an interpretation, design uncertainty and qualitative quality; no single coefficient certifies evidence quality.",
        "evidence_limit": "GESIS and the cited methods curricula support these as methodological concerns, not identical requirements across all routes.",
    },
    "pilot_and_cognitive_pretesting": {
        "category": "conditional_route_choice",
        "why": "Cognitive pretesting is useful when developing questions or instruments; a pilot tests broader procedures. Neither is a generic requirement for work that does not design or administer an instrument.",
        "breadth": "Applies to instrument-building and fieldwork routes; narrower than a shared domain foundation.",
        "boundary": "Do not collapse cognitive interviewing into an operational pilot. They answer different questions and can be used separately or together when justified.",
        "evidence_limit": "GESIS/AAPOR support the distinction; NUC curriculum is a named Nigerian example, not a national or global mandate.",
    },
    "focus_groups_and_workshops": {
        "category": "conditional_method_choice",
        "why": "Use when the question benefits from group discussion or interaction; group dynamics are part of the evidence and may not suit sensitive topics or questions requiring private individual accounts.",
        "breadth": "An established qualitative option available across some subject areas, conditional on the question, participants and safeguards.",
        "boundary": "Not a universal interview substitute; a group discussion does not produce representative views by default.",
        "evidence_limit": "Birkbeck, Portsmouth and UK Data Service identify focus groups in methods teaching; exact use case and safeguards still need claim review.",
    },
    "discourse_and_conversation_analysis": {
        "category": "specialist_method",
        "why": "Use when the research question concerns how language, interaction or framing creates meaning or social action; the analytic unit and method require specialist decisions.",
        "breadth": "A specialist route within language-, interaction- and communication-focused research, not a general step for every qualitative project.",
        "boundary": "Do not confuse topic coding or word counts with discourse/conversation analysis; each requires a defined analytic framework.",
        "evidence_limit": "The cited social-research curricula establish it as a route option, not a universal competency.",
    },
    "case_study_and_comparative_case_design": {
        "category": "conditional_method_choice",
        "why": "Use when a bounded case or deliberate comparison can answer the question; state the boundary and limits of inference.",
        "breadth": "Useful across disciplines and applied settings, conditional on a question suited to bounded cases or comparison.",
        "boundary": "Do not imply one case represents all cases or that case study is only qualitative; explain the design and inference it supports.",
        "evidence_limit": "Current sources list case-study approaches but do not yet provide a focused design guide; detailed learner guidance needs stronger item-specific evidence.",
    },
    "archival_and_historical_research": {
        "category": "conditional_method_choice",
        "why": "Use when existing records or historical materials are appropriate evidence; provenance, gaps, purpose and context shape interpretation.",
        "breadth": "Useful for historical, policy, institutional and documentary questions, not every contemporary field or survey workflow.",
        "boundary": "Do not present interview-method sources as proof of archival practice; preserve the source-coverage gap.",
        "evidence_limit": "The reconciliation's current sources are thin for archival/historical research; classification is provisional and promotion must wait for focused evidence.",
    },
    "participatory_and_action_research": {
        "category": "conditional_method_with_governance",
        "why": "Use when affected people should help shape the question, design, interpretation or action; participation and power-sharing are central.",
        "breadth": "Applicable to selected community, development, health, education and policy projects, not a default method for every question.",
        "boundary": "Do not label ordinary consultation as participatory/action research; address consent, ownership, safety and expectations of impact.",
        "evidence_limit": "Carleton supports participatory practice; ESRC provides ethics context. Nigeria-specific legal/institutional obligations remain separate.",
    },
    "experiments_quasi_experiments_and_causal_inference": {
        "category": "specialist_method",
        "why": "Use when the question asks about causal effects and the design can support a defensible comparison with explicit assumptions.",
        "breadth": "Relevant to selected evaluation, policy and behavioural research; design and inference require specialist quantitative knowledge.",
        "boundary": "Association, prediction and before/after change alone do not establish causation; do not imply every D078 role runs experiments.",
        "evidence_limit": "UCLA/HKUST provide social-science causal-design evidence; Portsmouth supplies broader methods context.",
    },
    "programme_evaluation_and_theory_of_change": {
        "category": "conditional_applied_route",
        "why": "Use when a programme, service or policy is assessed against intended outcomes, implementation, context or value; the decision question shapes the design.",
        "breadth": "Can cross sectors and use multiple methods, but only when an evaluation task and decision context exist.",
        "boundary": "Do not reduce evaluation to impact measurement or treat a theory of change as proof that a programme caused an outcome.",
        "evidence_limit": "The Magenta Book supports evaluation scope; experimental/quasi-experimental material applies only when justified by the evaluation question.",
    },
    "psychometrics_and_scale_construction": {
        "category": "specialist_measurement_route",
        "why": "Use when developing or evaluating multi-item measures of psychological or social constructs; this requires specialist measurement and validation decisions.",
        "breadth": "A narrow measurement specialty, not general domain preparation. Clinical or regulated assessment must respect the separate D064 boundary where relevant.",
        "boundary": "Not required for all behavioural/social research; reliability alone does not validate a scale for a population.",
        "evidence_limit": "GESIS and social-research methods sources support measurement methods; professional/population-validity boundaries need further focused evidence.",
    },
    "longitudinal_panel_and_multilevel_data": {
        "category": "specialist_data_design_route",
        "why": "Use when observations repeat over time or are nested in groups; the data structure changes the analysis and assumptions.",
        "breadth": "Useful in selected panel, cohort, administrative-data and multilevel studies; not needed when time/group structure is absent.",
        "boundary": "Repeated observations or grouped data do not automatically justify a causal or multilevel model.",
        "evidence_limit": "The cited methods and Stata sources identify workflows; vendor documentation cannot establish field-wide importance.",
    },
    "systematic_and_scoping_evidence_synthesis": {
        "category": "conditional_evidence_synthesis_route",
        "why": "Use when a question is answered by systematically locating and synthesising existing evidence rather than collecting new primary data by default.",
        "breadth": "Relevant to research, policy and evaluation when a review question and protocol justify it; not required for every project.",
        "boundary": "Do not call a general literature search a systematic/scoping review without appropriate transparent methods.",
        "evidence_limit": "The earlier UK Data Service interview-method citation was mismatched and is not evidence for this item. Campbell and EPPI establish that systematic evidence synthesis is an actual social-science/policy practice; JBI and Cochrane give formal methods for their defined review scopes, while PRISMA is a reporting guideline. Together these support a conditional domain option, not a shared requirement or one interchangeable method.",
        "additional_sources": [
            {
                "source_id": "campbell_social_science_evidence_synthesis",
                "title": "Campbell Collaboration: Methods and evidence synthesis in social policy and social sciences",
                "publisher": "Campbell Collaboration",
                "url": "https://www.campbellcollaboration.org/evidence/",
                "locator": "Overview describes Campbell as a home for evidence synthesis across social policy and social sciences; its coordinating groups include education, crime and justice, international development, social welfare, business and management, and methods.",
                "accessed_on": "2026-10-09",
                "claim_role": "domain_relevance_and_scope",
                "scope_limit": "Establishes that evidence synthesis is a real practice across named social-science/social-policy fields; it does not establish that every D078 occupation performs it.",
            },
            {
                "source_id": "eppi_systematic_review_principles",
                "title": "EPPI-Centre: What is a systematic review?",
                "publisher": "EPPI-Centre, UCL Institute of Education",
                "url": "https://eppi.ioe.ac.uk/cms/resources/evidence-informed-policy-and-practice/what-is-a-systematic-review/",
                "locator": "Page sections 'What is a systematic review?' and 'Methods': explicit/transparent, accountable, replicable and updateable methods; explains that synthesis can support policy/practice decisions and that non-intervention research methods matter.",
                "accessed_on": "2026-10-09",
                "claim_role": "independent_social_research_explanation",
                "scope_limit": "EPPI is a UK evidence-informed policy and practice research centre; use it as methodological explanation, not a universal occupational standard or Nigerian mandate.",
            },
            {
                "source_id": "jbi_manual_evidence_synthesis_2024",
                "title": "JBI Manual for Evidence Synthesis (2024), Chapters 1 and 10",
                "publisher": "JBI",
                "url": "https://jbi-global-wiki.refined.site/download/attachments/355599504/JBI%20Manual%20for%20Evidence%20Synthesis%202024.pdf",
                "locator": "Chapter 1, printed pp. 5–6: evidence-synthesis types and JBI approach; Chapter 10, printed pp. 162 onward: scoping-review purpose, question, protocol and methods. JBI advises cross-checking the online manual because the PDF may not contain later updates.",
                "accessed_on": "2026-10-09",
                "claim_role": "authoritative_method_guidance",
                "scope_limit": "JBI methodology is authoritative for reviews following JBI methods and is strongly healthcare/evidence-informed-practice oriented; it is not a universal rule for all social-science reviews.",
            },
            {
                "source_id": "prisma_2020_reporting_guideline",
                "title": "PRISMA 2020 statement and explanation resources",
                "publisher": "PRISMA Executive",
                "url": "https://www.prisma-statement.org/prisma-2020",
                "locator": "Official PRISMA 2020 page: statement, expanded checklist, abstract checklist, flow diagrams and explanation/elaboration paper.",
                "accessed_on": "2026-10-09",
                "claim_role": "reporting_guideline_not_conduct_method",
                "scope_limit": "PRISMA improves reporting completeness; it is not, by itself, a complete method for conducting a systematic or scoping review. Use the relevant extension and conduct methodology for the review type.",
            },
            {
                "source_id": "cochrane_handbook_search_selection_ch4",
                "title": "Cochrane Handbook, Chapter 4: Searching for and selecting studies (updated March 2025)",
                "publisher": "Cochrane",
                "url": "https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-04",
                "locator": "Sections 4.1–4.5: plan, search, select and document studies; Section 4.2 emphasizes broad, reproducible searches and notes that MEDLINE alone is inadequate for Cochrane intervention reviews.",
                "accessed_on": "2026-10-09",
                "claim_role": "authoritative_method_guidance",
                "scope_limit": "The Handbook is for Cochrane systematic reviews, especially intervention/health reviews; do not transfer database mandates or health-specific requirements to every social-science evidence synthesis.",
            },
            {
                "source_id": "campbell_oli_systematic_review_free_course",
                "title": "Systematic Reviews and Meta-Analysis — Open & Free",
                "publisher": "Campbell Collaboration and Carnegie Mellon University Open Learning Initiative",
                "url": "https://oli.cmu.edu/courses/systematic-reviews-and-meta-analysis-o-f/",
                "locator": "Course description and modules 1–15, 16–28: scope/problem formulation, search design, screening, data coding, appraisal, documentation and software choices. Page says open/free for independent learners; accessed 2026-10-09.",
                "accessed_on": "2026-10-09",
                "claim_role": "free_task_specific_learning_resource",
                "scope_limit": "The course is designed for graduate students and above and expects introductory graduate-level research methods and statistics. It focuses substantially on systematic reviews/meta-analysis and is not an introductory prerequisite for all learners or a scoping-review course. Recheck free access before display.",
            },
        ],
    },
    "open_science_preregistration_and_reproducibility": {
        "category": "useful_additional_edge",
        "why": "Transparent records and reproducible materials can strengthen inspectability; preregistration is not suitable or possible for every study and sharing may be restricted.",
        "breadth": "Useful across some empirical/computational workflows, but optional and bounded by timing, consent, privacy, security and other rules.",
        "boundary": "Separate a traceable research record from preregistration as one optional practice; neither is a credential or substitute for ethics review or good design.",
        "evidence_limit": "ESRC ethics/transparency material and GOV.UK evaluation guidance do not prescribe preregistration; OSF explains its own registration process only.",
    },
    "reference_and_literature_management": {
        "category": "useful_additional_edge",
        "why": "Finding and tracking sources supports literature-aware research and communication, but the software and depth of review depend on the task.",
        "breadth": "Useful for many research routes consulting prior work; not established as a distinct task for every D078 occupation, and a reference manager is optional.",
        "boundary": "Do not present Zotero as required or imply an organised bibliography verifies source quality, completeness or interpretation.",
        "evidence_limit": "Zotero documentation establishes its functions; broader checkpoint fit is provisional and should be checked against route task evidence.",
    },
    "r_statistical_computing": {
        "category": "conditional_tool_alternative",
        "why": "R is one programmable route for statistical computing and graphics when the task benefits from code; it is an alternative, not cumulative with other software.",
        "breadth": "Conditional on a quantitative/computational task and learner/team context; not a domain-wide tool requirement.",
        "boundary": "Do not require both R and Python/SPSS for the same output; explain the method separately from software operation.",
        "evidence_limit": "R Project documentation establishes platform capability; task-specific checkpoint fit and beginner instruction still need review.",
    },
    "stata_quantitative_social_science_workflow": {
        "category": "conditional_tool_alternative",
        "why": "Stata is a viable statistical workflow for selected survey, panel and multilevel tasks; include it when the project, team or institution uses it.",
        "breadth": "Conditional within quantitative research, not cumulative with R, Python or SPSS and not universal across D078.",
        "boundary": "Vendor features establish software functions, not that a workflow is needed for a role or that software proves statistical competence.",
        "evidence_limit": "StataCorp documentation supports function scope only; task-specific fit and accessible instruction remain open.",
    },
    "ai_assisted_and_digital_trace_research_ethics": {
        "category": "deferred_emerging_conditional_extension",
        "why": "AI-assisted analysis and digital-trace data raise distinct provenance, consent, privacy, bias, quality and disclosure questions; define the task and safeguards first.",
        "breadth": "Relevant only when a project actually uses AI or digital traces; neither is a universal D078 capability or required tool.",
        "boundary": "Keep AI as a conditional method/data-use extension, not an occupation, replacement for participants, or general research requirement.",
        "evidence_limit": "AAPOR/ESRC support responsible-use concerns; task scope, applicable ethics rules and instructional resources still require focused review.",
    },
}


def load(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def main() -> None:
    reconciliation = load(INPUT)
    sources = {item["id"]: item for item in reconciliation["source_register"]}
    records: list[dict[str, Any]] = []
    for row in reconciliation["new_concept_additions"] + reconciliation["route_extensions_or_alternatives"]:
        rationale = RATIONALES[row["id"]]
        source_rows = row.get("sources", [])
        records.append({
            "id": row["id"],
            "label": row.get("name") or row.get("id"),
            "origin": "workflow_gap_reconciliation",
            "original_disposition": row.get("disposition"),
            "original_layer": row.get("layer"),
            "merge_target": row.get("merge_target"),
            "category_rationale": rationale,
            "source_evidence": [
                {
                    "source_id": src.get("id"),
                    "title": src.get("title"),
                    "publisher": src.get("publisher"),
                    "url": src.get("url"),
                    "locator": src.get("locator"),
                    "accessed_on": src.get("accessed_on"),
                }
                for source in source_rows
                if (src := sources.get(source.get("id"), source))
            ] + list(rationale.get("additional_sources", [])),
            "classification_state": "proposed_with_rationale; item_claim_and_checkpoint_review_still_required",
            "student_display": "not_approved_hidden",
            "canonical_status": "not_promoted",
        })

    expected = set(RATIONALES)
    actual = {row["id"] for row in records}
    if actual != expected or len(records) != 19:
        raise ValueError(f"Expected 19 fully classified reconciliation rows; got {len(records)} (missing={sorted(expected-actual)}, extra={sorted(actual-expected)})")

    totals: dict[str, int] = {}
    for row in records:
        category = row["category_rationale"]["category"]
        totals[category] = totals.get(category, 0) + 1

    result = {
        "schema_version": "2026-10-09.d078.candidate-category-audit.v1",
        "reviewed_on": "2026-10-09",
        "domain_id": "D078",
        "status": "classification_review_artifact_not_student_approved",
        "inputs": [str(INPUT.relative_to(ROOT))],
        "decision_rule": "A shared/versatile foundation must be evidenced across the relevant downstream paths; broad usefulness, role frequency, a source name, or mere technical possibility is insufficient. Items useful on a subset of paths are additional edges or conditional options. Unresolved source or checkpoint support blocks promotion; it is not a negative finding.",
        "reconciliation_counts": totals,
        "shared_foundation_additions": 0,
        "validation": {
            "expected_workflow_gap_items": 19,
            "classified_workflow_gap_items": len(records),
            "every_item_has_why_and_breadth_boundary": all(all(row["category_rationale"].get(k) for k in ("why", "breadth", "boundary", "evidence_limit")) for row in records),
            "student_approved_items": 0,
            "canonical_items_promoted": 0,
        },
        "items": records,
    }
    OUT_JSON.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    lines = [
        "# D078 Candidate Category Audit — 2026-10-09",
        "",
        "**Status:** rationale audit only; no item is student-approved or canonically promoted.",
        "",
        "## Decision rule",
        "",
        result["decision_rule"],
        "",
        "The earlier reconciliation grouped six additions under a combined ‘foundation/edge’ layer. This audit separates the concepts: none of the 19 new workflow-gap findings is currently justified as a new shared/versatile D078 foundation. Five are useful additional edges; the sixth (pilot/cognitive pretesting) is conditional on instrument design. This does not remove the existing shared research foundations already present in the inventory.",
        "",
        "## Category totals",
        "",
    ]
    for category, count in sorted(totals.items()):
        lines.append(f"- `{category}`: **{count}**")
    lines.extend(["", "## Item-by-item rationale", ""])
    for row in records:
        why = row["category_rationale"]
        lines.extend([
            f"### {row['label']} (`{row['id']}`)",
            "",
            f"**Proposed category:** `{why['category']}`. **Prior disposition/layer:** `{row.get('original_disposition')}` / `{row.get('original_layer')}`.",
            "",
            f"- Why it belongs here: {why['why']}",
            f"- Breadth/applicability: {why['breadth']}",
            f"- Boundary/false-match check: {why['boundary']}",
            f"- Evidence limits: {why['evidence_limit']}",
            "- Sources retained from reconciliation:",
        ])
        if row["source_evidence"]:
            for source in row["source_evidence"]:
                lines.append(f"  - [{source.get('source_id')} — {source.get('title')}]({source.get('url')}) — {source.get('locator')} (accessed {source.get('accessed_on')}; role: {source.get('claim_role', 'retained source from reconciliation')}). Scope limit: {source.get('scope_limit', 'see original reconciliation source record')}.")
        else:
            lines.append("  - No source record attached; continue research before promotion.")
        lines.extend(["", "**Disposition:** classification is proposed for review only; claim, checkpoint, downstream area/role task context, explanatory-source and learning-link checks remain separate gates. No display or canonical promotion.", ""])
    lines.extend([
        "## Reconciliation findings that block promotion",
        "",
        "- Archival/historical research needs a focused source; the existing source set is insufficient for detailed guidance.",
        "- The old UK Data Service interview-method citation is mismatched and retained only as a historical source defect. Campbell/EPPI now support social-science relevance, and JBI/Cochrane/PRISMA clarify method and reporting scope. Still separate systematic-review and scoping-review use cases and validate checkpoint-specific tasks and a learner-appropriate resource before promotion.",
        "- Reference-management checkpoint breadth is not proved by a tool manual; Zotero remains optional and source evaluation is separate.",
        "- Preregistration is optional; the cited ESRC material does not prescribe it as a universal social-science requirement.",
        "- The five additional edges are not promoted to shared foundations. Their eventual placement must be reconciled against the complete D078 area/role task-set research, not frequency or technical usefulness.",
        "",
        "Machine-readable audit: `data/career-mapping/_audit/d078_candidate_category_audit_2026_10_09.json`.",
    ])
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({"json": str(OUT_JSON), "markdown": str(OUT_MD), "totals": totals, "validation": result["validation"]}, indent=2))


if __name__ == "__main__":
    main()

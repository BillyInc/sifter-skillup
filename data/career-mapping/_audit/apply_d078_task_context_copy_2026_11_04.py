"""Copy-only D078 task and area-context repairs.

This script improves student-facing explanations and illustrative outputs. It
does not change graph membership, edges, ownership, task mapping, route scope,
selection, requirement lanes, or role fit.
"""
from __future__ import annotations

import gzip
import json
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[3]
GRAPH = ROOT / "data/career-mapping/_audit/D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json"
GRAPH_GZ = GRAPH.with_suffix(GRAPH.suffix + ".gz")

# Short, concrete explanations of the work focus. These describe possible
# learning contexts, not universal duties of every practitioner.
AREA_TASK_COPY: dict[str, tuple[str, str]] = {
    "area-task:d078-computational-digital-social-science-core-task-family": (
        "This area asks how social questions can be studied with digital records, computer-run analysis or simulations. A project still begins with a social question and checks whether its data and assumptions support the answer.",
        "A short research plan naming the question, data or model, analysis steps, privacy checks, result and limits.",
    ),
    "area-task:d078-computational-digital-social-science-digital-trace-content-analysis": (
        "This work treats records such as posts or documents as evidence. The researcher defines whose records are included, how they were gathered, what categories or model are applied, and how the result will be checked against the original material.",
        "A text-analysis report with the question, record sources, included material, category or model checks, errors and limits.",
    ),
    "area-task:d078-computational-digital-social-science-reproducible-social-data": (
        "This work makes a data analysis repeatable: keep a record of where the data came from, how fields were cleaned or changed, which steps were run and how the result answers the question.",
        "A rerunnable analysis file, a plain-language description of each data field, a results table or chart, and a note about decisions and limits.",
    ),
    "area-task:d078-econ-computational-economic-scenarios": (
        "A computer model makes stated economic assumptions explicit and lets a learner compare what follows when one or more conditions change. A scenario is an exploration of those assumptions, not automatically a forecast of what will happen.",
        "A scenario note showing the question, assumptions, changed conditions, compared results and what the model cannot predict.",
    ),
    "area-task:d078-econ-construct-and-analyze-data": (
        "This work turns an economic question into a usable set of measures, checks what each measure means and covers, and analyses the evidence without hiding missing or inconsistent records.",
        "A checked data table and analysis note describing the sources, measures, comparison, findings and limits.",
    ),
    "area-task:d078-econ-distribution-development-and-welfare": (
        "This work compares economic conditions across defined groups, places or time periods—for example, how income, work or access to services is distributed. Clear definitions matter because different measures can give different pictures of poverty or well-being.",
        "A chart or table comparing a defined outcome across groups or places, with source dates, definitions and limits.",
    ),
    "area-task:d078-econ-official-statistics-sector-and-policy-analysis": (
        "This work interprets published economic statistics by checking what is counted, which people or institutions are covered, the time period and any revisions. It connects the measure to a policy question without treating a headline number as the whole story.",
        "A short statistics brief that names the measure, coverage, period, trend, policy question and cautions about interpretation.",
    ),
    "area-task:d078-econ-policy-and-program-evaluation": (
        "This work asks whether an economic or public-policy intervention was delivered as intended and what changed for the people or places it aimed to affect. When estimating an effect, the comparison must help show what might have happened without the intervention.",
        "An evaluation plan or findings brief with the purpose, comparison, evidence, result, alternative explanations and limits.",
    ),
    "area-task:d078-economics-applied-analysis-policy-evaluation": (
        "This work states the outcome and comparison before judging an intervention. It checks whether the available evidence can separate the intervention's contribution from other changes happening at the same time.",
        "A concise evaluation brief showing the outcome, comparison, evidence chain, estimated or reasoned effect and limitations.",
    ),
    "area-task:d078-economics-applied-analysis-social-economic-data-analysis": (
        "This work uses economic ideas to describe a pattern or estimate how measured factors are related. The analyst defines each measure, checks the data and assumptions, and avoids treating an association as proof of cause.",
        "A reproducible table or chart and an analysis note naming the population, measures, method, uncertainty and limits.",
    ),
    "area-task:d078-human-geography-population-core-task-family": (
        "This area examines how people and social or economic activity vary by place and change over time. A useful analysis states which places and people are covered and how the geographic scale affects the pattern.",
        "A map or population profile with the data source, time period, geographic scale and interpretation limits.",
    ),
    "area-task:d078-human-geography-population-population-change": (
        "This work explains population change by examining births, deaths and movement between places. Estimates and projections depend on definitions and assumptions, so they should not be presented as certain predictions.",
        "A population profile or projection scenario stating the definitions, source dates, assumptions and uncertainty.",
    ),
    "area-task:d078-human-geography-population-spatial-patterns": (
        "This work maps or compares social conditions across places. The analyst checks how boundaries, map scale and data collection shape what appears to be a geographic pattern.",
        "A map or spatial summary with the source, geographic units, scale, processing steps and cautions.",
    ),
    "area-task:d078-politics-governance-public-policy-ai-supported-policy-evidence-synthesis": (
        "Computer systems that generate or summarize text may help sort a large set of policy documents, but a researcher must check each useful claim against its original source and record omissions or errors.",
        "A source-linked evidence table showing the question, documents, checked summaries, exclusions, disagreements and remaining gaps.",
    ),
    "area-task:d078-politics-governance-public-policy-citizen-participation-process": (
        "This work plans how people affected by a public decision can contribute before the decision is made. It states who is invited, what they can influence, how barriers to taking part are handled and how decision-makers will respond.",
        "A participation plan naming the decision, groups to reach, questions, access arrangements, use of contributions and feedback to participants.",
    ),
    "area-task:d078-politics-governance-public-policy-computational-policy-text-analysis": (
        "This work examines speeches, policy documents or public submissions using defined computer-run steps to find patterns in wording or topics. Researchers check examples against the original text because language can be ironic, local or context-dependent.",
        "A text-analysis brief stating the question, documents, categories or model, checked examples, patterns and interpretation limits.",
    ),
    "area-task:d078-politics-governance-public-policy-evaluate-ai-enabled-public-interventions": (
        "This work studies whether a public service or programme using artificial intelligence changes how the service is delivered or what happens to people using it. It checks benefits and harms across groups and does not substitute for a technical or legal audit.",
        "An evaluation plan or report naming the service, intended change, comparison, groups affected, evidence, version or delivery context and limits.",
    ),
    "area-task:d078-politics-governance-public-policy-institution-and-policy-analysis": (
        "This work traces who has authority over a public issue, which bodies make or deliver decisions, who is affected and how a policy is put into practice. It describes the process without assuming that written rules match everyday practice.",
        "An institution-and-policy map naming the issue, responsible bodies, affected groups, decision points and implementation questions.",
    ),
    "area-task:d078-politics-governance-public-policy-legislative-community-scorecard-oversight": (
        "This work brings community observations and public records into a structured review of a local service or project. A scorecard helps raise questions and agree on follow-up; a low score alone does not prove misconduct.",
        "A source-linked scorecard recording the service, community criteria, observations, official response, evidence gaps and agreed follow-up.",
    ),
    "area-task:d078-politics-governance-public-policy-monitoring-evaluation": (
        "Monitoring records what a programme did and who it reached; evaluation asks what the evidence says about its results, how they came about and for whom. The question and intended use guide which evidence is needed.",
        "A monitoring or evaluation brief showing the purpose, activities, measures, evidence, findings and limits.",
    ),
    "area-task:d078-politics-governance-public-policy-policy-evidence-brief": (
        "This work answers a defined public decision question by comparing credible information and feasible options. It separates what the sources show from assumptions, value choices and the recommendation.",
        "A sourced policy brief with the decision question, affected groups, evidence, options, trade-offs, uncertainty and remaining evidence needs.",
    ),
    "area-task:d078-politics-governance-public-policy-political-survey-opinion": (
        "This work gathers comparable answers about political views or participation. The researcher defines who the survey is meant to describe, tests the wording and explains who did not respond and what that means for interpretation.",
        "A survey plan or interpretation note covering the target group, wording, selection method, contact mode, response and limits.",
    ),
    "area-task:d078-politics-governance-public-policy-regulatory-impact-assessment": (
        "This work compares a proposed or existing rule with realistic alternatives, considering who bears costs, who may benefit, how the rule could be implemented and what evidence is uncertain.",
        "A comparison table showing the policy problem, options, affected groups, likely costs and benefits, evidence and uncertainty.",
    ),
    "area-task:d078-politics-governance-public-policy-strategic-foresight-and-policy-scenarios": (
        "This work explores several plausible future conditions and asks how a policy choice might perform under each one. The scenarios help test a strategy; they are not predictions that one future will occur.",
        "A scenario set describing its assumptions, changes, implications for the policy choice and signals to monitor.",
    ),
    "area-task:d078-psychology-social-behaviour-behavioural-insights-intervention": (
        "This work identifies a specific behaviour and the conditions that may shape it, then involves affected people in designing and testing a possible change. A small test can inform improvement but does not establish that the change will work everywhere.",
        "A behaviour-change plan showing the behaviour, possible barriers, co-designed change, test, measures and safeguards.",
    ),
    "area-task:d078-psychology-social-behaviour-behavioural-research-design": (
        "This work links a question about behaviour to a measure and a way to gather evidence, such as observation, a survey, an interview or an experiment. It checks whether the measure captures the intended idea and whether the study protects participants.",
        "A short study plan describing the question, measure, participants, method, analysis, ethical safeguards and limits.",
    ),
    "area-task:d078-psychology-social-behaviour-conflict-context-analysis": (
        "This work examines the history, relationships and conditions involved in a conflict before judging a proposed response. It considers how the response could affect different groups and avoids treating one account as the whole explanation.",
        "A conflict-context brief showing the groups, events, relationships, evidence, possible intervention effects and unanswered questions.",
    ),
    "area-task:d078-psychology-social-behaviour-group-identity-and-participation": (
        "This work asks how group membership, social conditions or institutions relate to attitudes or participation. It defines group categories carefully and compares other explanations before making claims about people.",
        "An evidence brief naming the groups and measures, comparing accounts or results, and stating what cannot be generalized to individuals.",
    ),
    "area-task:d078-psychology-social-behaviour-qualitative-group-inquiry": (
        "This work uses conversations, observation or documents to understand how people describe an experience or interact in a group. The researcher records context and checks interpretations against examples that do not fit.",
        "A short analytic account linking selected excerpts or observations to an interpretation, context and counterexamples.",
    ),
    "area-task:d078-psychology-social-behaviour-quantitative-behavioural-analysis": (
        "This work turns a defined behaviour into recorded counts, scores or categories and compares them in a way that fits the question. The measure and study design limit what any difference can show.",
        "A results table or chart with measure definitions, comparison, uncertainty and a plain-language interpretation.",
    ),
    "area-task:d078-social-anthro-computational-social-inquiry": (
        "This work uses computer-run analysis of suitable digital records, text, connections or simulations to examine a social question. The researcher explains who or what the records represent and checks conclusions against context and assumptions.",
        "A research note identifying the social question, records or model, analysis, validation checks, privacy steps and limits.",
    ),
    "area-task:d078-social-anthro-fieldwork-and-community-evidence": (
        "Fieldwork means gathering evidence in the setting where people live, work or interact. The researcher records what was observed, the circumstances, their own role and how consent and safety were handled.",
        "Contextual field notes and a short account that links observations or conversations to the question while protecting identities.",
    ),
    "area-task:d078-social-anthro-qualitative-and-mixed-analysis": (
        "This work interprets words, observations or documents, and may combine them with numerical evidence. When methods are combined, the researcher explains how the findings connect and what remains different or unresolved.",
        "An analysis memo showing themes or numerical results, how evidence was combined, points of agreement or disagreement and limits.",
    ),
    "area-task:d078-social-anthro-secondary-and-documentary-research": (
        "This work studies material that already exists, such as archives, reports, records or media. The researcher checks who created it, why, when, what is missing and whose perspective it records.",
        "A source table and evidence-based account describing the records, their context, recurring patterns, gaps and limits.",
    ),
    "area-task:d078-social-anthro-survey-design-and-analysis": (
        "This work designs questions for a defined group, plans how people will be invited to answer, checks the questions before wider use and analyses the responses with the selection and missing answers in view.",
        "A tested questionnaire, selection and contact plan, response summary and interpretation note with coverage and nonresponse limits.",
    ),
    "area-task:d078-social-behaviour-interaction-culturally-grounded-measure-adaptation": (
        "This work checks whether a measure makes sense in different languages or cultural settings before comparing scores. Translation alone may not preserve how people understand a question, so review and testing are needed.",
        "An adaptation record describing the original measure, translation or wording changes, participant testing, comparison checks and unresolved limits.",
    ),
    "area-task:d078-social-behaviour-interaction-digital-trace-and-online-network-research": (
        "This work examines records of digital activity or links among people and organizations. It checks who uses the service, what the records omit, whether collection is allowed and how people could be identified.",
        "A research plan or network/text summary naming the records, coverage, collection basis, analysis, privacy safeguards and limits.",
    ),
    "area-task:d078-social-behaviour-interaction-human-in-the-loop-ai-qualitative-analysis": (
        "A language model may help sort or summarize text, but the researcher checks its suggestions against the original words and context. The final interpretation remains the researcher's and errors or changes are recorded.",
        "A comparison table with original excerpts, model suggestions, human decisions, correction reasons and privacy safeguards.",
    ),
    "area-task:d078-social-behaviour-interaction-study-ai-mediated-social-behaviour-and-simulation": (
        "This work examines how people interact with AI systems or how a computer simulation of social agents behaves under stated rules. Observed human responses and simulated outputs are different evidence and should be reported separately.",
        "A study plan or report separating human-participant evidence from simulation assumptions, results, checks and limits.",
    ),
    "area-task:d078-social-research-evaluation-core-task-family": (
        "This area turns social questions into a plan for collecting and interpreting evidence. It may use words, observations, numbers or a combination, depending on the question; evaluation focuses on a programme or policy and its intended use.",
        "A research or evaluation brief showing the question, evidence plan, analysis, findings, safeguards and limits.",
    ),
    "area-task:d078-social-research-evaluation-design-social-study": (
        "This work connects a social question with the people or records to study, how evidence will be gathered and what conclusion the plan could support. It includes privacy, consent and practical limits before data collection begins.",
        "A study protocol describing the question, group or records, method, analysis, safeguards and limits on the conclusion.",
    ),
    "area-task:d078-social-research-evaluation-programme-evaluation": (
        "This work clarifies what a programme is meant to do, how it is delivered, who it reaches and what evidence can answer the evaluation questions. It separates evidence about delivery from evidence about results or effects.",
        "An evaluation plan or report showing purpose, programme pathway, questions, evidence, findings, limitations and intended use.",
    ),
    "area-task:d078-sociology-social-anthropology-core-task-family": (
        "This area studies how relationships, shared rules, institutions and cultural practices shape people's lives and change over time. It uses concepts and evidence to explain patterns without assuming every person in a group is the same.",
        "Field notes, a source-based account or a comparison that explains a social pattern and states the evidence and limits.",
    ),
    "area-task:d078-sociology-social-anthropology-interpret-social-evidence": (
        "This work compares accounts from interviews, observation or documents to explain a pattern in context. It looks for differences and examples that challenge the first interpretation as well as examples that support it.",
        "An evidence-linked account with excerpts or observations, context, alternative interpretations and limits.",
    ),
    "area-task:d078-sociology-social-anthropology-qualitative-interview": (
        "This work plans a guided conversation with open questions, obtains informed agreement to take part, records relevant context and analyses what was said without treating one person's account as everyone else's experience.",
        "An interview guide, consent and data-handling notes, contextual notes and an interpretation linked to anonymized excerpts.",
    ),
    "area-task:econ-02": (
        "This work defines an economic outcome and the factors to compare, then checks whether the available data and study plan can support an estimate or evaluation. A relationship in the data is not automatically a cause.",
        "A brief explaining the outcome, comparison, evidence, estimated relationship or effect, uncertainty and other possible explanations.",
    ),
    "area-task:econ-03": (
        "A forecast estimates a future value; a nowcast estimates a current value before all official information is available. Both depend on the data, time period and assumptions, so uncertainty and forecast errors should be shown.",
        "A dated forecast or nowcast with the target measure, time horizon, data used, uncertainty range, checks and limitations.",
    ),
    "area-task:econ-04": (
        "Computer models may help create or improve a measure from several data sources, but the analyst must explain what the measure represents and test whether it works on new or held-back examples. Good prediction does not by itself establish a meaningful economic measure or causal result.",
        "A documented measure-building report with inputs, target concept, data preparation, model checks, errors and limits on interpretation.",
    ),
    "area-task:soc-02": (
        "This work compares accounts, observations or documents to identify patterns in meaning and experience. The researcher explains how examples were chosen and considers differences that do not fit the main theme.",
        "A short interpretation supported by selected excerpts or observations, with context and counterexamples.",
    ),
    "area-task:soc-05": (
        "A computer simulation can represent people or organizations as separate decision-makers following stated rules, then show what group patterns those interactions could produce. The result explores the rules; it does not prove that real people will behave that way.",
        "A model note showing the question, decision rules, assumptions, simulation results, checks and what should be compared with real evidence.",
    ),
}

ROLE_TASK_COPY: dict[str, tuple[str, str]] = {
    "role-task:d078:anthropologist": (
        "An anthropologist may study a way of life, language, relationship or social change in its setting. Depending on the question, this can involve conversations, observation, documents or material evidence; the account should show whose perspectives it includes.",
        "A field or documentary study with a clear question, contextual evidence, interpretation and a note on whose perspectives may be missing.",
    ),
    "role-task:d078:archaeologist": (
        "An archaeologist may survey or excavate a permitted site, record exactly where objects or structures are found, compare the material evidence and explain what it can support about past human activity. Context and site protection matter because removing an object can destroy information about where it was found.",
        "A site record or report with location notes, find descriptions, context, interpretation, permissions and preservation limits.",
    ),
    "role-task:d078:behavioural-scientist": (
        "A behavioural scientist may study what people do in a defined setting and how their actions relate to personal, social or institutional conditions. The method might involve observation, questions or numerical measures; it does not justify guessing an individual's motives from a group pattern.",
        "A behaviour study brief naming the setting, observed or measured actions, evidence, interpretation and limits.",
    ),
    "role-task:d078:business-economics-researcher": (
        "This work studies an economic question about a business, market or industry. A researcher may compare business or market evidence with wider economic conditions, explain what the data cover and describe the decision the findings could inform.",
        "A market or business research brief with the question, data, comparison, findings, assumptions and practical limits.",
    ),
    "role-task:d078:criminologist": (
        "A criminologist may study patterns in crime, justice systems or responses to harm using records, interviews or other evidence. The analysis concerns social patterns or policy; it does not decide whether a named person is guilty or diagnose them.",
        "A research or policy brief describing the issue, evidence sources, pattern, possible explanations, response options and limits.",
    ),
    "role-task:d078:demographer": (
        "A demographer studies the size and composition of populations and how they change through births, deaths and movement. Estimates and projections require defined populations, dates and assumptions; projections are conditional scenarios, not certain predictions.",
        "A population table, chart or projection note with definitions, source dates, assumptions and uncertainty.",
    ),
    "role-task:d078:economic-adviser": (
        "An economic adviser may interpret current economic information for an organization or decision-maker, compare possible developments and explain how different assumptions would affect the advice. A forecast should be presented with uncertainty, not as a guaranteed outcome.",
        "An advisory brief showing the question, evidence, possible scenarios, implications, recommendation basis and uncertainty.",
    ),
    "role-task:d078:economic-development-coordinator": (
        "This work can coordinate an initiative intended to support economic activity in a community or region. It may involve understanding local conditions, bringing organizations together and tracking agreed activities or outcomes; a coordinator does not control all causes of economic change.",
        "An initiative plan or progress report naming local priorities, partners, activities, evidence of progress and factors outside the team's control.",
    ),
    "role-task:d078:economic-policy-officer": (
        "An economic policy officer may examine an economic issue, compare policy choices and contribute evidence to policy design or delivery. The analysis should distinguish what the data show from political or value choices made by decision-makers.",
        "A policy analysis note with the issue, evidence, options, affected groups, trade-offs and monitoring questions.",
    ),
    "role-task:d078:economist": (
        "An economist studies how people, organizations or governments make choices under economic conditions, using concepts, data and sometimes mathematical models. The right approach depends on the question; estimates and model results rely on assumptions that need explaining.",
        "An economic research brief with the question, concepts, data, analysis, findings, assumptions and limits.",
    ),
    "role-task:d078:genealogist": (
        "A genealogist traces relationships and life events across historical and family records. When records disagree, the researcher compares their dates, authorship and purpose, and distinguishes documented evidence from a possible connection.",
        "A sourced family tree or narrative showing records consulted, links between people, conflicting evidence and unresolved questions.",
    ),
    "role-task:d078:geographer": (
        "A geographer studies places and how people, environments or activities vary across them. The work may use maps, observation, interviews or statistics; the scale and boundaries chosen can change the pattern that appears.",
        "A map or place-based report explaining the area, evidence, scale, pattern, interpretation and limits.",
    ),
    "role-task:d078:media-scientist": (
        "A media scientist studies how media content, organizations or technologies relate to social life. Depending on the question, the evidence may include media material, audience accounts or patterns of use; a pattern in one audience or platform may not describe everyone.",
        "A media research brief linking the question to media or audience evidence, findings, context and limits.",
    ),
    "role-task:d078:political-scientist": (
        "A political scientist studies political systems, institutions, decisions or participation. Research may compare documents, events, surveys or other records and explain how the chosen evidence supports a claim about political processes.",
        "A political analysis brief with the question, institutions or groups studied, evidence, interpretation and alternative explanations.",
    ),
    "role-task:d078:social-work-researcher": (
        "A social-work researcher studies social needs, services or practice to improve understanding and decision-making. The work may gather accounts from service users or workers and examine records; privacy, consent and the effects of the research on participants matter.",
        "A research report or service-learning brief with the question, participants or records, findings, safeguards and implications for practice or policy.",
    ),
    "role-task:d078:sociologist": (
        "A sociologist studies how people interact and how groups, institutions and societies are organized and change. Research uses concepts and evidence to explain social patterns while keeping claims within the people, setting and information actually studied.",
        "A sociological analysis with a clear question, concepts, evidence, interpretation, examples that challenge it and limits.",
    ),
    "role-task:d078:statistician": (
        "A statistician plans or applies methods for collecting, summarizing and analysing numerical information. The work includes checking how data were gathered and explaining uncertainty so that readers do not mistake an estimate for an exact fact.",
        "A statistical analysis note or results table naming the data, method, estimate, uncertainty, assumptions and interpretation limits.",
    ),
    "role-task:d078:tax-policy-analyst": (
        "A tax policy analyst may examine tax rules and revenue data to estimate how a proposal could affect government income, groups of taxpayers or administration. Estimates depend on assumptions about behaviour and implementation and should be reported as such.",
        "A tax policy note comparing proposals, expected revenue or distributional effects, assumptions, administrative issues and uncertainty.",
    ),
    "role-task:d078:thanatology-researcher": (
        "A thanatology researcher studies death, dying, bereavement or related practices from a defined field such as sociology, psychology or anthropology. The question and evidence determine the approach; studying a social experience is not the same as providing clinical care.",
        "A research brief naming the disciplinary question, context, evidence, interpretation and ethical or clinical boundaries.",
    ),
}

MISSING_AREA_CONTEXT = {
    "area_enrichment_item:d078-econ-time-series-analysis-and-forecasting": (
        "It helps examine how an economic measure changes across dates, including longer-term movement and recurring patterns. A change after an event is not by itself evidence that the event caused it."
    ),
    "area_enrichment_item:d078-human-geography-geographical-random-forest": (
        "It can estimate how a place-linked outcome varies with mapped characteristics. The result depends on the available places, scale and model checks and does not by itself show what caused the pattern."
    ),
    "area_enrichment_item:econ-a1": "It helps examine an economic question through the measure, comparison and evidence that question requires.",
    "area_enrichment_item:econ-c1": "It helps turn economic information into a documented comparison or analysis for the selected question.",
    "area_enrichment_item:econ-c2": "It helps interpret the economic evidence in relation to the stated question, assumptions and possible alternative explanations.",
    "area_enrichment_item:soc-c2": "It helps connect a sociological idea with evidence about relationships, institutions or social change.",
    "area_enrichment_item:soc-m3": "It helps explore how stated choices and interactions could produce a wider social pattern, while keeping the model's assumptions visible.",
}


def clean_sentence(value: str) -> str:
    return " ".join(value.split()).strip().rstrip(".; ")


def main() -> None:
    graph: dict[str, Any] = json.loads(GRAPH.read_text(encoding="utf-8"))
    node_list = graph["nodes"]
    edge_ids = [edge.get("id") for edge in graph["edges"]]
    ids = [node["id"] for node in node_list]
    stable_fields = {
        node["id"]: {
            key: json.dumps(node.get(key), sort_keys=True, ensure_ascii=False)
            for key in (
                "kind", "item_type", "area_id", "domain_id", "role_id", "area_ids",
                "requirement_lane", "requirement_level", "requirement_scope", "requirement_reason",
                "student_visible", "student_selectable", "selectable", "display_readiness",
                "supportingMethodIds", "supportingCombinationIds", "area_task_family_links",
            ) if key in node
        }
        for node in node_list
    }
    by_id = {node["id"]: node for node in node_list}
    changes = {"area_task_families": 0, "role_task_families": 0, "area_item_explanations": 0,
               "internal_task_context_notes_removed": 0, "area_item_contexts_added": 0}

    missing_area_task_ids = {
        node_id for node_id in AREA_TASK_COPY
        if node_id not in by_id or by_id[node_id].get("kind") != "area_task_family"
    }
    if missing_area_task_ids:
        raise AssertionError(f"Area-task IDs missing or wrong kind: {sorted(missing_area_task_ids)}")
    visible_task_ids = {
        node["id"] for node in node_list
        if node.get("kind") == "area_task_family" and node.get("student_visible") is True
    }
    if visible_task_ids != set(AREA_TASK_COPY):
        raise AssertionError(
            f"Visible area task inventory drifted. expected={len(AREA_TASK_COPY)} actual={len(visible_task_ids)} "
            f"missing={sorted(visible_task_ids-set(AREA_TASK_COPY))} extra={sorted(set(AREA_TASK_COPY)-visible_task_ids)}"
        )
    for node_id, (explanation, output) in AREA_TASK_COPY.items():
        node = by_id[node_id]
        node["task_evidence_text"] = explanation
        node["learner_output"] = output
        changes["area_task_families"] += 1

    visible_role_task_ids = {
        node["id"] for node in node_list
        if node.get("kind") == "role_task_family" and node.get("student_visible") is True
    }
    if visible_role_task_ids != set(ROLE_TASK_COPY):
        raise AssertionError(
            f"Visible role-task inventory drifted. expected={len(ROLE_TASK_COPY)} actual={len(visible_role_task_ids)} "
            f"missing={sorted(visible_role_task_ids-set(ROLE_TASK_COPY))} extra={sorted(set(ROLE_TASK_COPY)-visible_role_task_ids)}"
        )
    for node_id, (explanation, output) in ROLE_TASK_COPY.items():
        node = by_id[node_id]
        node["task_evidence_text"] = explanation
        node["learner_output"] = output
        changes["role_task_families"] += 1

    area_labels = {
        node.get("id"): node.get("label", "this area")
        for node in node_list if node.get("kind") == "area_of_specialization"
    }
    for node in node_list:
        if node.get("kind") != "area_enrichment_item" or node.get("student_visible") is not True:
            continue
        field_context = clean_sentence(str(node.get("field_context") or ""))
        if not field_context:
            field_context = MISSING_AREA_CONTEXT.get(node["id"], "")
            if field_context:
                node["field_context"] = field_context
        why = clean_sentence(str(node.get("why_it_matters") or ""))
        generic_contract = "source contract places this area learning option under"
        if generic_contract in why.casefold():
            if not field_context:
                raise AssertionError(f"Internal template has no replacement context: {node['id']}")
            node["why_it_matters"] = field_context
            changes["area_item_explanations"] += 1
            changes["internal_task_context_notes_removed"] += 1
        elif not why and field_context:
            node["why_it_matters"] = field_context
            changes["area_item_explanations"] += 1

        contexts = node.get("area_task_contexts") if isinstance(node.get("area_task_contexts"), list) else []
        meaning = clean_sentence(str(node.get("meaning") or node.get("plain_language_meaning") or ""))
        output = clean_sentence(str(node.get("learner_output") or ""))
        context_text = clean_sentence(str(node.get("contextual_use") or ""))
        why_now = clean_sentence(str(node.get("why_it_matters") or ""))
        if not context_text or context_text.casefold() == why_now.casefold() or "\ufffd" in context_text:
            task = contexts[0] if contexts else {}
            task_label = clean_sentence(str(task.get("task_family_label") or ""))
            scope = node.get("requirement_scope") if isinstance(node.get("requirement_scope"), dict) else {}
            condition = clean_sentence(str(scope.get("condition") or task.get("condition") or ""))
            if not field_context:
                field_context = MISSING_AREA_CONTEXT.get(node["id"], "")
            if task_label and field_context:
                use = f"For example, in work on {task_label}, {field_context[0].lower() + field_context[1:]}"
            elif task_label and condition:
                use = f"Use this in work on “{task_label}” when you need to {condition[0].lower() + condition[1:]}"
            elif condition:
                use = f"Use this when you need to {condition[0].lower() + condition[1:]}"
            elif field_context:
                use = f"For example, {field_context[0].lower() + field_context[1:]}"
            elif meaning and output:
                use = f"Use this to work through the question described above and prepare a result such as {output[0].lower() + output[1:]}"
            else:
                raise AssertionError(f"No usable route context for area learning item {node['id']}")
            node["contextual_use"] = use.rstrip(".; ") + "."
            changes["area_item_contexts_added"] += 1
            changes["area_item_explanations"] += 1

        # Replace the staff-contract explanation embedded in each task link with
        # copy that explains the connection without changing its conditions.
        for task_context in contexts:
            label = clean_sentence(str(task_context.get("task_family_label") or ""))
            if not label:
                continue
            if generic_contract in str(task_context.get("explanation") or "").casefold():
                task_context["explanation"] = (
                    f"This item can support work on {label[0].lower() + label[1:]}. "
                    "It remains optional; use it only when it fits your question and evidence."
                )
            condition = clean_sentence(str(task_context.get("condition") or ""))
            if "use this learning item when the selected task-family" in condition.casefold():
                scope = node.get("requirement_scope") if isinstance(node.get("requirement_scope"), dict) else {}
                scoped_condition = clean_sentence(str(scope.get("condition") or ""))
                if scoped_condition:
                    task_context["condition"] = f"Use this when you need to {scoped_condition[0].lower() + scoped_condition[1:]}"

    if len(node_list) != len(ids) or [node["id"] for node in node_list] != ids:
        raise AssertionError("Node count/order/IDs changed")
    if [edge.get("id") for edge in graph["edges"]] != edge_ids:
        raise AssertionError("Graph edge IDs changed")
    for node in node_list:
        actual = {
            key: json.dumps(node.get(key), sort_keys=True, ensure_ascii=False)
            for key in stable_fields[node["id"]]
        }
        if actual != stable_fields[node["id"]]:
            raise AssertionError(f"Non-copy structural field changed for {node['id']}")

    GRAPH.write_text(json.dumps(graph, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    with gzip.open(GRAPH_GZ, "wt", encoding="utf-8", newline="") as target:
        json.dump(graph, target, ensure_ascii=False, separators=(",", ":"))
    print(json.dumps({
        "updated": changes,
        "area_task_families_total": len(AREA_TASK_COPY),
        "role_task_families_total": len(ROLE_TASK_COPY),
        "graph_nodes": len(node_list),
        "graph_edges": len(graph["edges"]),
        "node_ids_and_edges_unchanged": True,
        "route_requirement_ownership_role_fit_unchanged": True,
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

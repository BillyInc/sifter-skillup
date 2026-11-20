"""Copy-only cleanup of student-visible D078 role-item cards.

The graph's role assignments, ownership, requirement lanes, selectability,
visibility, nodes, and edges are invariants. This script removes internal
review prose from rendered fields and turns role-task records into concise
examples for students.
"""
from __future__ import annotations

import gzip
import json
import re
import runpy
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[3]
GRAPH = ROOT / "data/career-mapping/_audit/D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json"
GRAPH_GZ = GRAPH.with_suffix(GRAPH.suffix + ".gz")
TASK_COPY_SCRIPT = ROOT / "data/career-mapping/_audit/apply_d078_task_context_copy_2026_11_04.py"

INTERNAL_MARKERS = (
    "The role evidence is used to test the output context",
    "Current role-task records:",
    "Role-record task evidence excerpt:",
    "Authoritative task/profile sources:",
    "The role occurrence is provenance; it does not by itself establish a required skill, authorization, competence or employment outcome.",
    "Role occurrence, title and frequency are provenance; they do not prove a requirement, competence or employment outcome.",
    "Existing occurrence roles remain provenance, not task evidence.",
)

# These cases have no safely extractable output phrase, or their source wording
# contains an internal status note. The alternatives below preserve the item
# concept while keeping the output concrete and readable.
OUTPUT_OVERRIDES = {
    "role-item:13:analyse-market-financial-trends-essential": "A sourced trend note comparing selected market or financial indicators over a stated period, with units, a benchmark, data caveats, and other possible explanations.",
    "role-item:2:financial-forecasting-optional": "A dated forecast note naming the target and time horizon, data, method, assumptions, forecast error where available, and uncertainty; it should not be presented as a promise.",
    "role-item:20:company-policies-essential": "A short note identifying the current workplace policy relevant to a decision, explaining what it asks people to do, and showing how the decision follows it.",
    "role-item:24:environmental-economics-optional": "A comparison of environmental policy choices or an estimate of environmental costs, with valuation assumptions and ecological limits stated.",
    "role-item:27:international-business-optional": "A comparison of markets or an explanation of a cross-border business issue, with the countries, sector, currency, trade, and regulatory assumptions stated.",
    "role-item:34:osteology-optional": "A documented observation or report about bones and related remains, with their source, context, uncertainty, and any required permissions noted.",
    "role-item:35:paleography-optional": "A checked transcription of historical handwriting, with uncertain characters, clues about script or date, and source details noted.",
    "role-item:45:social-sciences-optional": "A short analysis naming the social-science concepts used, the evidence considered, and what the evidence can or cannot support.",
    "role-item:50:urban-planning-optional": "A comparison of planned and observed land use or access, or an explanation of a spatial trade-off. Statutory plans require authorized practice.",
    "role-item:51:use-data-processing-techniques-essential": "An analysis-ready data file, with a change log or codebook showing where the data came from and how each field was cleaned or changed.",
    "role-item:52:write-research-proposals-optional": "A proposal covering the question, evidence, methods, ethics, analysis, timing, resources, risks, and intended outputs, adapted to the recipient's format.",
    "role-item:53:accounting-techniques-optional": "A note explaining what selected financial records report, their accounting period, assumptions, and limits relevant to a tax-policy question.",
    "role-item:56:advise-legislators-essential": "A balanced brief on a legislative question, summarizing the evidence, options, likely distributional and fiscal effects, uncertainty, and jurisdiction.",
    "role-item:57:advise-on-legislative-acts-essential": "An implementation note identifying the applicable enacted rule, summarizing relevant provisions and responsible agencies, and referring legal interpretation to qualified counsel.",
    "role-item:5:sociology-optional": "A contextual account or research report using social concepts and evidence to explain a pattern, with the limits of the evidence stated.",
    "role-item:6:spatial-planning-optional": "A comparison of planned and observed land use or access, or an explanation of a spatial trade-off. Statutory plans require authorized practice.",
    "role-item:9:politics-essential": "A sourced account of political institutions, actors, ideas, or collective decision-making, or a comparison of political positions.",
    "role-item:111:interpret-pedigree-charts-essential": "A note explaining how a genetic pedigree chart represents the inheritance of a trait across generations, with uncertainty, consent, and the need for qualified genetic review stated.",
    "role-item:152:interpret-pedigree-charts-essential": "A note explaining how a genetic pedigree chart represents the inheritance of a trait across generations, with uncertainty, consent, and the need for qualified genetic review stated.",
    "role-item:69:audit-techniques-optional": "A scoped note interpreting published audit or compliance evidence, with the process, criteria, and limits identified. Conducting or signing a formal audit requires appropriate authority and qualifications.",
    "role-item:94:develop-organisational-policies-essential": "A draft or review note showing how an organisation's procedure supports its goals, who is responsible, how it should be applied, and when it should be reviewed.",
    "role-item:74:budgetary-principles-optional": "A fiscal note showing how a revenue proposal fits public budget estimates and spending plans, with assumptions and accountability implications stated.",
    "role-item:83:conduct-psychological-research-optional": "A study plan or findings memo about death, dying, bereavement, or related practices, with its evidence, participant safeguards, and limits clearly stated.",
    "role-item:102:genomics-essential": "A cautious note describing what genetic evidence may suggest about a possible biological relationship, alongside documentary evidence and clear consent, privacy, and uncertainty limits. It must not present a medical diagnosis.",
    "role-item:132:genomics-essential": "A cautious note describing what genetic evidence may suggest about a possible biological relationship, alongside documentary evidence and clear consent, privacy, and uncertainty limits. It must not present a medical diagnosis.",
    "role-item:117:ethics-optional": "A source-based discussion of ethical questions about death-related beliefs or policy, or an ethics-reviewed study protocol for research with bereaved people, depending on the question.",
    "role-item:118:european-political-studies-optional": "A sourced explanation of a European institution, integration process, or policy issue, with the countries and period clearly stated.",
    "role-item:128:forensic-psychiatry-essential": "A social-science note explaining how mental-health expertise may enter justice processes, based on public sources. It must not make a clinical assessment or treatment recommendation.",
    "role-item:136:geology-optional": "A report linking evidence about a geological hazard or resource to settlement or land use, while distinguishing earth-science findings from social conclusions.",
    "role-item:148:international-security-studies-optional": "A sourced analysis of a defined link between conflict or security and crime or justice, with the jurisdiction, evidence, and limits stated.",
}

MEANING_OVERRIDES = {
    "role-item:100:maintain-relations-with-local-representatives-optional": "Maintain professional two-way communication with local representatives, record the perspectives or evidence they provide, and document follow-up clearly.",
    "role-item:102:genomics-essential": "Genomics studies the genetic information contained across an organism's genome. In family-history work, genetic matches can suggest possible relationships, but they require consent, privacy safeguards, specialist interpretation, and documentary evidence; they are not a medical diagnosis.",
    "role-item:104:genealogy-essential": "Genealogy researches family relationships and lines of descent using historical records and other evidence. Findings may be presented in a family tree or a written account.",
    "role-item:105:consult-information-sources-essential": "Find relevant information in records, books, databases, or other sources and note where each claim came from.",
    "role-item:106:conduct-research-interview-essential": "A research interview is a planned conversation used to gather a person's account or experience. The researcher asks focused questions and records answers carefully, with permission.",
    "role-item:108:inspect-data-essential": "Inspecting data means checking and organizing records so you can see what they contain, spot gaps or errors, and prepare them for analysis.",
    "role-item:110:conduct-qualitative-research-essential": "Qualitative research studies experiences, meanings, interactions, or documents using evidence such as interviews, observation, or texts. It explains how the material was gathered and interpreted.",
    "role-item:112:family-law-optional": "Family law covers legal rules about relationships and family matters, such as marriage, adoption, and separation. Rules vary by place and time.",
    "role-item:114:copyright-legislation-optional": "Copyright law sets when original works can be copied, shared, adapted, or reused and what permission may be needed.",
    "role-item:73:bookkeeping-regulations-optional": "Bookkeeping rules explain how financial transactions should be recorded and organized so accounts can be checked.",
    "role-item:74:budgetary-principles-optional": "Budgeting principles guide how an organization estimates income and costs, plans spending, and monitors results.",
    "role-item:75:business-analytics-optional": "Business analytics uses data and quantitative methods, such as statistical models, to answer business questions and inform decisions.",
    "role-item:76:cadastral-taxation-essential": "Property taxation uses laws and records that identify land parcels and their assessed value. Definitions and procedures depend on the jurisdiction.",
    "role-item:77:carry-out-strategic-research-optional": "Strategic research examines longer-term options and evidence to help an organization decide what to improve and how to proceed.",
    "role-item:78:cartography-optional": "Cartography is the practice of designing and interpreting maps, including their symbols, scale, measurements, and data.",
    "role-item:79:civil-law-optional": "Civil law can refer to rules for disputes between people or organizations, such as over contracts or property; it can also describe a legal system. The jurisdiction and meaning matter.",
    "role-item:80:commercial-law-essential": "Commercial law covers legal rules that apply to business activity, such as contracts, sales, or company operations. Which rules apply depends on the jurisdiction and issue.",
    "role-item:82:computer-simulation-optional": "A computer simulation runs a model of a real or proposed system to explore how it may behave under stated assumptions. Some simulations use equations; others use programmed rules.",
    "role-item:83:conduct-psychological-research-optional": "Psychological research investigates questions about thought or behaviour through a defined study. The methods and participant safeguards depend on the question; this item does not authorize clinical work.",
    "role-item:84:conduct-qualitative-research-essential": "Qualitative research studies experiences, meanings, interactions, or documents using evidence such as interviews, observation, or texts. It explains how the material was gathered and interpreted.",
    "role-item:85:conduct-research-interview-essential": "A research interview is a planned conversation used to gather a person's account or experience. The researcher asks focused questions and records answers carefully, with permission.",
    "role-item:86:conservation-techniques-optional": "Conservation techniques are methods, materials, and tools used to protect or stabilize objects, documents, or collections while preserving their condition.",
    "role-item:88:good-governance-optional": "Good governance describes public decision-making that is transparent, accountable, responsive, and fair, and whether public institutions deliver on stated commitments.",
    "role-item:89:european-political-studies-optional": "European political studies examines institutions, elections, policies, foreign relations, and political dynamics in Europe, including within the European Union (EU).",
    "role-item:90:financial-forecasting-essential": "Financial forecasting estimates future income, spending, or financial conditions from available information and stated assumptions.",
    "role-item:96:government-policy-implementation-optional": "Policy implementation is the process of putting a government policy into practice through decisions, services, and administrative procedures.",
    "role-item:97:public-finance-optional": "Public finance studies how governments raise revenue, spend money, borrow, and manage public budgets.",
    "role-item:98:civil-law-optional": "Civil law can refer to rules for disputes between people or organizations, such as over contracts or property; it can also describe a legal system. The jurisdiction and meaning matter.",
    "role-item:20:company-policies-essential": "Company policies are an organisation's current rules and procedures for how particular work decisions should be made. Their use depends on the employer and the task.",
    "role-item:94:develop-organisational-policies-essential": "Develop or update an organisation's procedures so they support its goals and are applied consistently. This can include clarifying responsibilities and checking how the procedures are put into practice.",
    "role-item:113:transcription-methods-optional": "Transcription turns speech or handwriting into written text while marking unclear words and preserving details that matter to the research question.",
    "role-item:111:interpret-pedigree-charts-essential": "A genetic pedigree chart is a family diagram used to trace how a particular inherited trait appears across generations. It is different from a family-history tree, and interpreting it requires genetics knowledge.",
    "role-item:152:interpret-pedigree-charts-essential": "A genetic pedigree chart is a family diagram used to trace how a particular inherited trait appears across generations. It is different from a family-history tree, and interpreting it requires genetics knowledge.",
    "role-item:128:forensic-psychiatry-essential": "Forensic psychiatry applies specialist medical knowledge about mental health in legal and justice settings. Studying it does not authorize a criminologist to assess or treat anyone.",
    "role-item:148:international-security-studies-optional": "International security studies examines the causes, conduct, and aftermath of conflict. It is relevant to criminology when a specific question connects security or conflict with crime or justice.",
    "role-item:118:european-political-studies-optional": "European political studies examines political institutions, integration, and policy across European countries. It is useful when a question concerns those institutions or processes.",
}

CONTEXT_OVERRIDES = {
    "role-item:10:project-management-optional": (
        "Project management helps organise a defined piece of work by setting its goals, tasks, deadlines, resources, and risks.",
        "For example, a researcher may use a project plan to organise a study and track its deliverables."
    ),
    "role-item:69:audit-techniques-optional": (
        "A tax-policy analyst may need to understand what an audit or compliance report says about a rule or process.",
        "A scoped note can identify the report's process, criteria, and limits. This learning does not authorize someone to conduct or sign a formal audit."
    ),
    "role-item:94:develop-organisational-policies-essential": (
        "This matters when an assignment includes drafting or reviewing an organisation's procedures.",
        "A useful review identifies who owns the policy, who is responsible for each step, how it should be applied, and when it should be reviewed."
    ),
    "role-item:111:interpret-pedigree-charts-essential": (
        "A genetic pedigree chart is specialized biology content, relevant only when a project has a justified genetic-data context and qualified support.",
        "This learning does not train someone to interpret genetic test results or provide genetic counselling."
    ),
    "role-item:152:interpret-pedigree-charts-essential": (
        "A genetic pedigree chart is specialized biology content, relevant only when a project has a justified genetic-data context and qualified support.",
        "This learning does not train someone to interpret genetic test results or provide genetic counselling."
    ),
    "role-item:117:ethics-optional": (
        "Ethics helps people examine questions about what is fair or responsible and how research should protect participants.",
        "In this route, it can guide discussion of death-related beliefs or the safeguards for a study involving bereaved people."
    ),
    "role-item:132:genomics-essential": (
        "Genetic evidence can add one kind of clue to family-history research, but it cannot establish a relationship on its own.",
        "A cautious account compares genetic findings with documentary evidence and records consent, privacy safeguards, and uncertainty."
    ),
    "role-item:102:genomics-essential": (
        "Genetic evidence can add one kind of clue to family-history research, but it cannot establish a relationship on its own.",
        "A cautious account compares genetic findings with documentary evidence and records consent, privacy safeguards, and uncertainty."
    ),
    "role-item:172:meet-standards-of-practice-in-social-services-essential": (
        "These standards matter when research takes place within a social-service setting, where safeguarding and confidentiality procedures must be followed.",
        "A research record can show how the approved protocol, referral steps, and privacy rules were followed. Studying these standards does not qualify someone as a social worker."
    ),
}

# Corrections confirmed during the manual review of role wording.
OUTPUT_OVERRIDES.update({
    "role-item:33:organisational-policies-essential": "An evidence-linked note identifying the current policy owner and version, defining the policy's scope, and explaining how it applies to a specific decision.",
    "role-item:111:interpret-pedigree-charts-essential": "A note explaining how a pedigree diagram shows family relationships across generations and may mark who has a particular trait, with uncertainty and qualified genetic review stated.",
    "role-item:152:interpret-pedigree-charts-essential": "A note explaining how a pedigree diagram shows family relationships across generations and may mark who has a particular trait, with uncertainty and qualified genetic review stated.",
})
MEANING_OVERRIDES.update({
    "role-item:33:organisational-policies-essential": "Organisational policies are an organisation's current rules and procedures for how decisions should be made. The owner, version, scope, and authority depend on the organisation and issue.",
    "role-item:111:interpret-pedigree-charts-essential": "A pedigree is a family diagram that shows relationships across generations and can mark which people have a particular trait or health condition. In genetics, it helps researchers examine how a trait may be inherited.",
    "role-item:152:interpret-pedigree-charts-essential": "A pedigree is a family diagram that shows relationships across generations and can mark which people have a particular trait or health condition. In genetics, it helps researchers examine how a trait may be inherited.",
})
CONTEXT_OVERRIDES.update({
    "role-item:20:company-policies-essential": (
        "Company policies are relevant when a work decision depends on the employer's current rules or procedures.",
        "Check the policy owner, current version, scope, and steps before applying it; do not assume access to confidential policy documents."
    ),
    "role-item:33:organisational-policies-essential": (
        "An organisation's internal policies matter when they set procedures for a defined work decision. They are different from laws and public policy.",
        "Check who owns the policy, which version is current, and which decisions it covers before explaining how it applies."
    ),
    "role-item:111:interpret-pedigree-charts-essential": (
        "A pedigree is a family diagram used in genetics to show relationships across generations and mark who has a trait or health condition.",
        "This is relevant only when a project has a justified genetic-data context and qualified support. It does not authorize clinical interpretation or genetic counselling."
    ),
    "role-item:152:interpret-pedigree-charts-essential": (
        "A pedigree is a family diagram used in genetics to show relationships across generations and mark who has a trait or health condition.",
        "This is relevant only when a project has a justified genetic-data context and qualified support. It does not authorize clinical interpretation or genetic counselling."
    ),
})
OUTPUT_OVERRIDES.update({
    "role-item:99:inspect-government-expenditures-optional": "A short note comparing approved and reported spending, with the period, category, source, differences, and follow-up questions stated.",
    "role-item:145:inspect-government-expenditures-optional": "A short note comparing approved and reported spending, with the period, category, source, differences, and follow-up questions stated.",
})
MEANING_OVERRIDES.update({
    "role-item:99:inspect-government-expenditures-optional": "Review public spending reports alongside an approved budget or plan to see where the figures differ and what needs explanation.",
    "role-item:145:inspect-government-expenditures-optional": "Review public spending reports alongside an approved budget or plan to see where the figures differ and what needs explanation.",
})
CONTEXT_OVERRIDES.update({
    "role-item:99:inspect-government-expenditures-optional": (
        "This can help when a policy or research task compares planned public spending with what was reported.",
        "Record the period, spending category, and source for each figure; note differences that the available records cannot explain. This is analysis, not a statutory audit."
    ),
    "role-item:145:inspect-government-expenditures-optional": (
        "This can help when a policy or research task compares planned public spending with what was reported.",
        "Record the period, spending category, and source for each figure; note differences that the available records cannot explain. This is analysis, not a statutory audit."
    ),
})

OTHER_COPY_OVERRIDES = {
    "area_tool_application_reference:d078-a04-domain-reference-networkx-application": {
        "label": "NetworkX for a social-network analysis workflow",
    },
    "area_tool_application_reference:d078-a04-tool-reference-casevo-area-application": {
        "label": "CASEVO for a bounded social-agent simulation",
    },
    "domain-item:d078-scikit-learn": {
        "limitations": [
            "Use this library when a chosen analysis needs its machine-learning tools; it is not required for every route.",
            "Knowing the software does not by itself show that the data, model, or conclusions are sound.",
        ],
    },
}

OUTPUT_PATTERNS = (
    re.compile(r"(?:Task output may be|A defensible output is|A relevant task output is|"
               r"research output might be|output is|output includes|output could be|"
               r"output may be|output should be|output:|task output:|output may (?:compare|create|show|include))\s*(.+)$", re.I),
)

def copy_invariants(graph: dict[str, Any]) -> dict[str, Any]:
    return {
        "node_ids": tuple(n.get("id") for n in graph["nodes"]),
        "edge_ids": tuple(e.get("id") for e in graph["edges"]),
        "node_count": len(graph["nodes"]),
        "edge_count": len(graph["edges"]),
        "route_state": tuple(
            (n.get("id"), n.get("student_visible"), n.get("student_selectable"),
             n.get("requirement_lane"), json.dumps(n.get("requirement_scope"), sort_keys=True),
             tuple(n.get("role_owner_ids") or []), n.get("role_task_relationship_verified"),
             n.get("role_fit"), n.get("role_fit_status"))
            for n in graph["nodes"]
        ),
        "edges": tuple(json.dumps(e, sort_keys=True, ensure_ascii=False) for e in graph["edges"]),
    }

def cut_internal(text: str) -> str:
    end = len(text)
    for marker in INTERNAL_MARKERS:
        ix = text.find(marker)
        if ix >= 0:
            end = min(end, ix)
    return text[:end].strip().rstrip(" .;:-")

def extract_output(node: dict[str, Any]) -> str | None:
    override = OUTPUT_OVERRIDES.get(node["id"])
    if override:
        return override
    raw = node.get("learner_output")
    if not isinstance(raw, str) or "Task/output basis:" not in raw:
        return None
    basis = cut_internal(raw.split("Task/output basis:", 1)[1])
    for pattern in OUTPUT_PATTERNS:
        match = pattern.search(basis)
        if match:
            output = match.group(1).strip().rstrip(" .;:-")
            # A source-scope status is not student copy.
            output = re.sub(r";?\s*exact meaning must first be resolved\.?$", "", output, flags=re.I).strip()
            if output:
                output = output[0].upper() + output[1:]
                return output if output.endswith((".", "!", "?")) else output + "."
    return None

def split_definition_from_output(text: str) -> str:
    marker = re.search(
        r"\b(?:Task output may be|A defensible output is|A relevant task output is|"
        r"research output might be|Genealogy output:|Output is|Output:|Output includes|"
        r"Output could be|Output may be|Output should be|output is|output:|"
        r"output includes|output could be|output may be|output should be)\b",
        text, flags=re.I,
    )
    if not marker or marker.start() == 0:
        return text
    return text[:marker.start()].strip().rstrip(" ;:.-")

def strip_internal(text: str) -> str:
    text = re.sub(r"The role occurrence is provenance; it does not by itself establish a required skill, authorization, competence or employment outcome\.?", "", text, flags=re.I)
    text = re.sub(r"Role occurrence, title and frequency are provenance; they do not prove a requirement, competence or employment outcome\.?", "", text, flags=re.I)
    text = re.sub(r"Existing occurrence roles remain provenance, not task evidence\.?", "", text, flags=re.I)
    text = re.sub(r"Not proven by item identity alone\.?", "", text, flags=re.I)
    text = re.sub(r"Exact ESCO meaning and role task are unresolved\.?", "", text, flags=re.I)
    text = re.sub(r"the exact source item identity remains bounded to the saved record\.?", "", text, flags=re.I)
    text = re.sub(r"the exact ESCO item profile is not independently rechecked here\.?", "", text, flags=re.I)
    text = re.sub(r"ESCO URI\s+https?://[^;]+;\s*", "", text, flags=re.I)
    text = re.sub(r"No D078 placement\.\s*If later supported,\s*", "", text, flags=re.I)
    text = re.sub(r"The current role-task inventory records the label under [^.]+, but external sources reviewed do not support a general duty to analyze legislation\.\s*Keep any plausible historical legal-context task narrow and mark the essential priority unsubstantiated until the full ESCO profile/source record is checked\.?", "", text, flags=re.I)
    text = re.sub(r"The optional pair is retained separately from the essential pair already documented in batch-\d+\.\s*The three occurrences span research, advice and development coordination; trend analysis is plausible for specific assignments but is not shared across them by default\.\s*Current role/task provenance remains a source label, not proof of each task\.?", "", text, flags=re.I)
    text = re.sub(r"This task is strongly coherent with genealogical inquiry as a research activity, but exact ESCO wording/profile still requires confirmation\.\s*", "", text, flags=re.I)
    text = re.sub(r"The occurrence is an apparent scope anomaly for a social/behavioural scientist unless the source profile explicitly concerns animal behaviour or human–animal relations\.\s*This record does not adjudicate role fit; it documents that no general D078 human social-science task is evidenced for applied zoology\.?", "", text, flags=re.I)
    text = re.sub(r"The record associates this essential item with Social Work Researcher, but quality assurance is commonly owned by providers/regulators and needs a specified framework\.\s*Keep the underlying analysis conditional on assignment and framework; do not call it an essential universal skill merely because the inventory says essential\.?", "", text, flags=re.I)
    text = re.sub(r"Statistical analysis can support evaluation of development outcomes, but is not necessary for every coordinator's duties\.\s*Keep optional and project-dependent; distinguish this record from the essential-priority pair for economist/business-research roles\.?", "", text, flags=re.I)
    text = re.sub(r"The role label Archaeologist and essential item align at a disciplinary level; this is a research candidate, not a statement that every archaeologist conducts excavation\.\s*Match actual task to documentary, laboratory, heritage, survey or field specialization\.?", "", text, flags=re.I)
    text = re.sub(r"Art history can enrich contextual interpretation of material culture, but it is not automatically required for archaeology\.\s*The optional label is appropriate only where the archaeological question concerns visual/material traditions and the source/profile supports that use\.?", "", text, flags=re.I)
    text = re.sub(r"Risk assessment is plausible in development coordination but too broad to present without an identified project/sector framework\.\s*Essential priority on one role record does not show that all coordinators perform it or that a single risk method applies\.?", "", text, flags=re.I)
    text = re.sub(r"The D078 area boundary is social-science research/theory about behavior among groups, institutions and communities, not clinical/professional psychology\.\s*Biology may be a conditional interdisciplinary complement only when the actual question and evidence justify it\.\s*The broad role item is not sufficient to recommend a biological foundation; no clinical assessment, counselling, diagnosis, or treatment is in scope\.?", "", text, flags=re.I)
    text = re.sub(r"The role is a social-science death-studies profile; the optional Biology label is not self-explanatory evidence that its task requires biology\.\s*Biological knowledge may be a narrow complement if the research question concerns definitions/data about death, but the D078 student route must remain centered on social-science questions and stay outside D064 clinical/professional psychology\.?", "", text, flags=re.I)
    text = re.sub(r"The optional label occurs in the Statistician record, making the statistical-biometry interpretation plausible; Nigeria's university course catalogs confirm that usage locally\.\s*But identity biometrics is also a common meaning and is a distinct technology field\.\s*Keep the item non-displayable until the exact ESCO profile/type and role context resolve which one is intended\.?", "", text, flags=re.I)
    text = re.sub(r"This record does not adjudicate role fit\.?", "", text, flags=re.I)
    text = re.sub(r"The present label cannot resolve which output applies\.?", "", text, flags=re.I)
    text = re.sub(r"not part of the current path\.?", "", text, flags=re.I)
    text = re.sub(r"This lane does not grant role fit, professional authority, licensing, employment eligibility, or student-facing approval\.?", "", text, flags=re.I)
    text = re.sub(r"No D078 role-task support established; single occurrence is not proof\.?", "", text, flags=re.I)
    text = re.sub(r"Essential priority is a candidate only, not proof of D078-wide foundation\.?", "", text, flags=re.I)
    text = re.sub(r"Not broadly necessary for political scientists; evidence does not support a D078-wide foundation\.?", "This topic is useful when a project concerns European institutions or integration; it is not needed for every political science project.", text, flags=re.I)
    text = re.sub(r"D078-appropriate example:", "For example, in social research:", text, flags=re.I)
    text = re.sub(r"\bD078\b", "this field", text)
    text = re.sub(r"exact script/language scope is not established\.?", "the transcript should identify the language, script, and any uncertain passages.", text, flags=re.I)
    text = re.sub(r"The existing criminologist task family concerns social/psychological conditions related to crime and justice\.\s*International security studies would be relevant only if a defined task explicitly examines a specific cross-border conflict, security institution, or security policy and its relation to crime/justice; output should be a sourced, jurisdiction-bounded analysis, not intelligence or operational security advice\.?", "International security studies may be relevant when a criminology question examines how a specific conflict, security institution, or policy relates to crime or justice. Any analysis should use public sources and state its jurisdiction and evidence limits.", text, flags=re.I)
    text = re.sub(r"A role-list occurrence is not enough to show that every [^.]+ needs this topic\.?", "The topic is useful when the research question concerns it; it is not needed for every assignment.", text, flags=re.I)
    text = re.sub(r"A learning item does not by itself grant a professional licence or authorize regulated practice\.?", "Studying this topic does not by itself qualify someone to provide regulated professional services.", text, flags=re.I)
    text = re.sub(r"The role-list association is retained as provenance; it does not establish a general duty, authority or qualification\.?", "", text, flags=re.I)
    text = re.sub(r"For the [^.]+ source context, the item can support the bounded task/output stated above\.?", "", text, flags=re.I)
    text = re.sub(r"In professional terms, this item concerns\s*", "", text, flags=re.I)
    text = re.sub(r";\s*", "; ", text)
    text = re.sub(r"\s+([,.;:])", r"\1", text)
    text = re.sub(r"(?:\s*[.;:]){2,}", ".", text)
    text = re.sub(r"\s{2,}", " ", text).strip(" ;.-")
    if text:
        text = text[0].upper() + text[1:]
        if text[-1] not in ".!?":
            text += "."
    return text

def shorten_task(text: str, role_label: str) -> str:
    text = text.strip()
    text = re.split(r"[.;]", text, maxsplit=1)[0].strip()
    text = re.sub(rf"^(?:an?\s+)?{re.escape(role_label.strip())}\s+(?:may\s+)?", "", text, flags=re.I)
    text = re.sub(r"^(?:An?\s+[A-Za-z -]+\s+may\s+)", "", text, flags=re.I)
    text = re.sub(r"^(?:may\s+)", "", text, flags=re.I)
    text = re.sub(r"^(?:Study|Studies|Research|Researches|Examine|Examines|Interpret|Interprets|Describe|Describes|Analyse|Analyses|Analyze|Analyzes|Formulate|Formulates|Investigate|Investigates|Develop|Develops|Assess|Assesses|Use|Uses|Coordinate|Coordinates|Gather|Gathers|Plan|Plans|Identify|Identifies|Evaluate|Evaluates|Compare|Compares|Conduct|Conducts)\s+", "", text, flags=re.I)
    if text:
        text = text[0].lower() + text[1:]
    return text.rstrip(".")

def role_context(node: dict[str, Any], tasks_by_role: dict[str, dict[str, Any]]) -> tuple[str, str] | None:
    examples = []
    for role_id in node.get("role_owner_ids") or []:
        task = tasks_by_role.get(role_id)
        if not task:
            continue
        role = task.get("role_label") or node.get("role_owner_labels", [""])[0]
        work = shorten_task(str(task.get("label") or task.get("task_evidence_text") or ""), str(role))
        output = str(task.get("learner_output") or "").strip().rstrip(".")
        if work:
            examples.append((role, work, output))
        if len(examples) == 2:
            break
    if not examples:
        return None
    label = str(node.get("label") or "this learning")
    why_parts = [
        f"For {('an' if role[:1].casefold() in 'aeiou' else 'a')} {role}, {label} can be relevant to an assignment involving {work}"
        for role, work, _output in examples
    ]
    why = "; ".join(why_parts) + "."
    uses = []
    for role, _work, output in examples:
        if output:
            uses.append(f"For {('an' if role[:1].casefold() in 'aeiou' else 'a')} {role}, it may contribute to {output[0].lower() + output[1:]}")
    how = ". ".join(uses)
    if how:
        how += ". The project determines the scope and depth needed."
    else:
        how = f"Use it when an assignment for {examples[0][0]} calls for {label}. The project determines the scope and depth needed."
    return why, how

def main() -> None:
    graph = json.loads(GRAPH.read_text(encoding="utf-8"))
    before = copy_invariants(graph)
    task_copy = runpy.run_path(str(TASK_COPY_SCRIPT))["ROLE_TASK_COPY"]
    role_task_nodes = {
        n["id"]: n for n in graph["nodes"]
        if n.get("kind") == "role_task_family" and n.get("student_visible") is True
    }
    if set(role_task_nodes) != set(task_copy):
        raise SystemExit(
            f"Role-task inventory changed: expected {len(task_copy)}, found {len(role_task_nodes)}; "
            f"missing={sorted(set(task_copy) - set(role_task_nodes))}, "
            f"extra={sorted(set(role_task_nodes) - set(task_copy))}"
        )
    role_task_copy_updates = 0
    for node_id, node in role_task_nodes.items():
        explanation, output = task_copy[node_id]
        if node.get("task_evidence_text") != explanation or node.get("learner_output") != output:
            node["task_evidence_text"] = explanation
            node["learner_output"] = output
            node["task_output"] = output
            role_task_copy_updates += 1
    role_labels = {n["id"]: n.get("label", n["id"]) for n in graph["nodes"] if n.get("kind") == "role"}
    tasks_by_role = {
        n.get("role_id"): {**n, "role_label": role_labels.get(n.get("role_id"), "the selected role")}
        for n in graph["nodes"] if n.get("kind") == "role_task_family" and n.get("role_id")
    }
    changed = {"outputs": 0, "context_pairs": 0, "internal_text_fields": 0, "special_definitions": 0, "role_task_families": role_task_copy_updates}
    output_failures = []
    for node in graph["nodes"]:
        if node.get("kind") != "role_item_candidate" or node.get("student_visible") is not True:
            continue
        output = extract_output(node)
        if output:
            node["learner_output"] = output
            node["task_output"] = output
            changed["outputs"] += 1
        elif "Task/output basis:" in str(node.get("learner_output") or ""):
            output_failures.append(node["id"])
        if node["id"] in MEANING_OVERRIDES:
            for field in ("meaning", "plain_language_meaning", "what_it_is"):
                if field in node:
                    node[field] = MEANING_OVERRIDES[node["id"]]
            changed["special_definitions"] += 1
        if node["id"] in OUTPUT_OVERRIDES:
            # extract_output already handles these overrides; count them in copy totals only.
            pass
        if node["id"] in CONTEXT_OVERRIDES:
            node["why_it_matters"], node["contextual_use"] = CONTEXT_OVERRIDES[node["id"]]
            if "role_application" in node:
                node["role_application"] = node["contextual_use"]
            changed["context_pairs"] += 1
        elif "Role-record task evidence excerpt:" in str(node.get("role_task_basis") or ""):
            context = role_context(node, tasks_by_role)
            if context:
                node["why_it_matters"], node["contextual_use"] = context
                if "role_application" in node:
                    node["role_application"] = node["contextual_use"]
                changed["context_pairs"] += 1
        for field in ("meaning", "plain_language_meaning", "what_it_is"):
            value = node.get(field)
            if isinstance(value, str):
                definition = split_definition_from_output(value)
                if definition != value:
                    node[field] = definition
        if node.get("id") not in OUTPUT_OVERRIDES and isinstance(node.get("learner_output"), str):
            output_match = re.search(
                r"(?:Task output may be|A defensible output is|A relevant task output is|"
                r"research output might be|Genealogy output:|Output is|Output:|Output includes|"
                r"Output could be|Output may be|Output should be|output is|output:|"
                r"output includes|output could be|output may be|output should be)\s*(.+)$",
                node["learner_output"], flags=re.I,
            )
            if output_match:
                clean_output = output_match.group(1).strip().rstrip(" .;:-")
                if clean_output:
                    clean_output = clean_output[0].upper() + clean_output[1:]
                    node["learner_output"] = clean_output if clean_output.endswith((".", "!", "?")) else clean_output + "."
                    node["task_output"] = node["learner_output"]
        for field in ("meaning", "plain_language_meaning", "what_it_is", "why_it_matters", "contextual_use", "role_application", "learner_output", "task_output", "limitations"):
            value = node.get(field)
            if isinstance(value, str):
                cleaned = strip_internal(value)
                if cleaned != value:
                    node[field] = cleaned
                    changed["internal_text_fields"] += 1
        # Internal review notes sometimes occur in list-form limitations.
        if isinstance(node.get("limitations"), list):
            cleaned_list = [strip_internal(str(v)) for v in node["limitations"]]
            node["limitations"] = [v for v in cleaned_list if v]

    # These visible labels/limits contain internal workflow language but are
    # outside the role-item kind. Keep the corrections narrowly targeted.
    nodes_by_id = {n["id"]: n for n in graph["nodes"]}
    for node_id, fields in OTHER_COPY_OVERRIDES.items():
        node = nodes_by_id.get(node_id)
        if node is None or node.get("student_visible") is not True:
            raise SystemExit(f"Expected student-visible copy node is missing: {node_id}")
        for field, value in fields.items():
            node[field] = value

    if output_failures:
        raise SystemExit(f"Could not derive student output for: {output_failures}")
    after = copy_invariants(graph)
    if before != after:
        raise SystemExit("Graph membership, route state, ownership, role fit, or edge invariants changed.")
    GRAPH.write_text(json.dumps(graph, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    with GRAPH.open("rb") as source, GRAPH_GZ.open("wb") as compressed:
        with gzip.GzipFile(fileobj=compressed, mode="wb", compresslevel=9, mtime=0) as target:
            target.write(source.read())
    print(json.dumps({"copy_changes": changed, "node_count": before["node_count"], "edge_count": before["edge_count"], "node_ids_and_edges_unchanged": True, "visibility_selection_lanes_ownership_role_fit_unchanged": True, "output_parse_failures": output_failures}, indent=2))

if __name__ == "__main__":
    main()

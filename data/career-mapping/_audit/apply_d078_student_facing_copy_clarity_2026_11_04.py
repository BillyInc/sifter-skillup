"""Apply reviewed D078 programme/domain copy without changing graph structure."""

from __future__ import annotations

import gzip
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
GRAPH = ROOT / "data/career-mapping/_audit/D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json"
GRAPH_GZ = ROOT / "data/career-mapping/_audit/D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json.gz"

DOMAIN_OVERVIEW = (
    "The social sciences study how people live together, how groups and institutions (such as "
    "families, schools and governments) shape everyday life, and how societies change. Sociology, "
    "Economics, Political Science and Psychology study related questions from different viewpoints. "
    "Researchers use evidence (information relevant to a question) and methods (planned ways to "
    "ask questions and examine information) to describe patterns and compare explanations. "
    "Conclusions depend on the question and evidence."
)

COMPUTATIONAL_AREA_OVERVIEW = (
    "Computational and Digital Social Science studies social questions using digital records, "
    "algorithms, statistical models and simulations. It can examine patterns in text and "
    "relationships or explore what follows from stated rules. Researchers check what the data "
    "represent, how a model is built and what privacy limits apply. Programming helps with some "
    "routes; it is not required for every learner or role."
)

TRANSFER_SUMMARY = (
    "Sociology is a starting point in the social sciences. Study the three shared foundations "
    "and knowledge about society first. Then choose a research method (a planned way to gather "
    "or examine information) or combined design (a plan linking methods). Your choices guide "
    "which areas, roles and items appear. Useful items are optional; conditional items apply only "
    "when their stated situation fits. Course links give context, not proof of mastery."
)

DOMAIN_ORIENTATION = {
    "whatItStudies": (
        "The social sciences study how people live together, how groups and institutions (lasting "
        "arrangements such as families, schools and governments) shape everyday life, and how "
        "societies change. Subjects such as Sociology, Economics, Political Science and Psychology "
        "study related questions from different viewpoints."
    ),
    "whatPeopleDo": (
        "Researchers may ask people questions, observe what happens, study documents and records, "
        "or count events. Quantitative evidence is information shown as numbers; qualitative "
        "evidence is words, observations or accounts examined for meaning and context. Researchers "
        "organize and compare what they collect, then explain what it supports and what remains "
        "uncertain."
    ),
    "questions": [
        "How do families, communities, workplaces and public institutions shape people's choices and opportunities?",
        "How do unequal access to resources or influence, crime and other social problems develop, and how do people respond?",
        "How do culture, organizations and societies change over time?",
        "What evidence shows whether a public service or community programme is reaching the people it was designed to support?",
        "What can information about people's connections reveal about how groups and organizations are linked?",
    ],
    "outputs": [
        "A research question and study plan explaining what will be examined, whose information is needed, how it will be gathered, and what the study cannot establish.",
        "Organized survey answers, interview accounts, observations, documents or records, handled with appropriate care.",
        "Tables, summaries or comparisons that show repeated patterns and differences in the information.",
        "A report explaining what the evidence supports, where it is uncertain, and what a reader can reasonably conclude.",
        "A recommendation when the evidence is strong enough to support an action.",
    ],
    "howWorkHappens": [
        "Start with a question about people, groups, institutions or social change.",
        "Choose how to find information. A survey asks a set of questions of many people; an interview is a guided conversation; observation means watching and recording what happens; document study examines existing texts or records.",
        "Gather and handle information responsibly. Check what people agreed to, protect private details, and consider whose experiences may be missing.",
        "Compare the information with the question. Explain what it supports, what remains uncertain, and what further evidence may be needed.",
    ],
    "whereProgrammeFits": (
        "Your Sociology programme is one route into the social sciences. Nigeria's National "
        "Universities Commission (NUC) curriculum covers social structures (how society is "
        "organized), culture (shared beliefs and ways of life), family, inequality, crime, social "
        "change and research (planned ways to ask questions and examine evidence). This is a "
        "starting point, not a full account of social sciences or proof that you can already do "
        "later tasks."
    ),
}

COMPUTATIONAL_ITEM = {
    "meaning": (
        "Computational social research applies computer-based methods to questions about people "
        "and society. Researchers use algorithms (defined computer-run steps), statistical models "
        "(mathematical summaries used to estimate or compare patterns) and simulations "
        "(computer-run versions of processes based on stated rules) to organize large or complex "
        "information, measure patterns in text or relationships, or explore how interactions "
        "might produce wider social outcomes."
    ),
    "why_it_matters": (
        "In Social Sciences, these methods can help when a question concerns patterns across many "
        "digital records, documents, relationships or interactions that are difficult to examine "
        "one by one. The method still has to fit the social question and the information available."
    ),
    "contextual_use": (
        "Digital traces are records created through people's interactions with digital services, "
        "such as posts, searches or transactions. A researcher might compare patterns across posts, "
        "map relationships among community organizations, or simulate how stated interaction rules "
        "could produce a group pattern. The first two examine records; the simulation explores what "
        "follows from its assumptions."
    ),
    "what_it_is": (
        "Network analysis maps people or organizations as points and their relationships as links. "
        "Text analysis uses computer-run rules to find patterns in documents; researchers check "
        "whether the results fit the question and the material being studied. Agent-based "
        "modelling simulates people or organizations following stated rules to explore how their "
        "interactions could create wider patterns. These are different approaches, and the choice "
        "depends on the question and evidence."
    ),
    "learner_output": (
        "A short analysis plan that names one social question, the information needed and where "
        "it would come from, the computational method, checks that the records are accurate and "
        "suitable for the question, steps to protect privacy, and "
        "what the result could and could not support."
    ),
    "limitations": [
        "Digital records may leave out people who do not use the service or whose activity is not recorded; a pattern in the available data may not represent everyone.",
        "A simulation shows what follows from its stated rules and assumptions; it does not prove that people behave that way in real life.",
        "A relationship between two measures does not by itself show that one caused the other.",
        "An online post that appears public may still contain private or identifying details. Check what users expected, what people agreed to, the platform's rules and local laws; also check whether the institution responsible for the study requires ethics review.",
    ],
}

AREA_TOOL_COPY = {
    "area_tool_option:d078-a04-tool-limesurvey": {
        "meaning": "LimeSurvey is online survey software: it lets you build a set of questions, display them as a web form and collect people's answers.",
        "why_it_matters": "In Social Behaviour and Interaction, it can help turn a carefully defined behaviour or attitude into consistent questions and gather responses for later analysis.",
        "contextual_use": "For example, you could run a small trial of a questionnaire about how people use a community service, then check which questions were skipped and whether the answer choices captured what you wanted to measure.",
        "learner_output": "A tested questionnaire and a response file, with notes on question wording, skipped answers and changes to make before wider use.",
        "limitations": ["The software can collect answers, but it cannot make a question clear, a measure valid or the people who responded representative of a wider group. Those depend on research design, question testing and who takes part."],
    },
    "area_tool_option:d078-a04-tool-nvivo": {
        "meaning": "NVivo is software for organizing qualitative material—words and accounts from interviews, observation notes or documents. It lets a researcher label passages with codes (short category names) and bring related passages together.",
        "why_it_matters": "In Social Behaviour and Interaction, it can help keep interview, observation and document material organized while a researcher compares how people describe experiences or interactions.",
        "contextual_use": "You could label passages about access to a service, then compare how the topic appears in different interviews or documents. The labels help organize interpretation; the software does not decide what a passage means.",
        "learner_output": "An organized project containing source documents, labelled passages and a code list that explains what each label means.",
        "limitations": ["NVivo helps organize and retrieve material; it does not establish that a label is meaningful, that an interpretation is fair, or that the material represents everyone affected."],
    },
    "area_tool_option:d078-a04-tool-python": {
        "meaning": "Python is a programming language: a set of written instructions that tells a computer how to handle data and carry out steps. Add-on libraries are pre-written code for common tasks such as calculations and graphs.",
        "why_it_matters": "In this area, Python can make steps for checking and comparing recorded behaviours or questionnaire answers repeatable, especially when a study has many records.",
        "contextual_use": "For example, a script (saved computer instructions) could identify missing answers, summarize responses by group and make a graph. The researcher still chooses a suitable analysis for the question and checks that the data support it.",
        "learner_output": "A commented script, an organized analysis file and a table or graph showing the comparison, with notes about checks and limits.",
        "limitations": ["Python carries out instructions; it does not make a research question, measure, comparison or interpretation sound. The official beginner tutorial assumes some prior programming knowledge."],
    },
    "area_tool_option:d078-a04-tool-r": {
        "meaning": "R is a programming language—a set of written instructions a computer follows—and software for analyzing numerical information and making graphs. Add-on packages provide pre-written tools for further tasks.",
        "why_it_matters": "In this area, R can help organize recorded behaviours or questionnaire answers, compare groups and show patterns in a repeatable way.",
        "contextual_use": "For example, you could use R to summarize a behavioural measure for two groups and display the values in a graph. The right comparison depends on how the information was gathered and what the research question asks.",
        "learner_output": "A saved R script, a table or graph of the results, and a short note explaining the comparison and its limits.",
        "limitations": ["R provides statistical and graphical tools, but choosing a suitable procedure and interpreting its result remain the researcher's responsibility. The software may require learning to write code."],
    },
    "area_tool_option:d078-a04-tool-spss": {
        "meaning": "SPSS Statistics is software for organizing numerical information and carrying out statistical procedures—defined ways to summarize or compare the numbers. Its procedures include comparing averages and checking patterns in counts across named groups.",
        "why_it_matters": "In this area, it can help summarize questionnaire measures or compare groups when the question and the way the data were collected support that comparison.",
        "contextual_use": "For example, a researcher might compare average questionnaire scores for two groups or check whether response counts differ across categories. The choice of procedure depends on the question, the data and the procedure's assumptions.",
        "learner_output": "A clear results table showing the relevant averages or counts and the selected procedure, plus a plain-language explanation of what the comparison can show.",
        "limitations": ["An SPSS table does not show by itself whether the data, comparison or assumptions are suitable, and a group difference does not by itself show what caused it. Access and licensing can depend on a learner or institution."],
    },
    "area_tool_option:d078-a04-tool-stata": {
        "meaning": "Stata is software for organizing and analyzing numerical information and presenting results. It includes procedures for comparing groups and for studying records collected repeatedly over time.",
        "why_it_matters": "When a study pairs interviews or other accounts with numerical measurements, Stata can help analyze the numerical part. It does not replace interviews or bring the different findings together by itself.",
        "contextual_use": "For example, you might compare a measured outcome across groups or follow the same households or schools across several years. The data structure and question determine which procedure is suitable.",
        "learner_output": "A saved analysis script and a table or graph that reports the comparison or change, with a note about the data and limits.",
        "limitations": ["Stata can carry out a selected analysis, but it cannot establish that the study design or interpretation is valid. It supports the numerical part of mixed-method work; researchers must explain how that result relates to interviews or other evidence. Access and licensing vary."],
    },
    "area_tool_option:d078-a04-tool-taguette": {
        "meaning": "Taguette is open-source software—its code can be inspected and shared under its license—for organizing research based on words and accounts. A researcher can upload documents, highlight passages, assign labels called tags, add notes and retrieve related passages.",
        "why_it_matters": "In Social Behaviour and Interaction, it can help organize interview text, observation notes or documents so a researcher can compare accounts and keep track of how each idea was labelled.",
        "contextual_use": "For example, you could label passages where people describe barriers to using a service, then compare those accounts across documents. The researcher decides what a passage means and whether the label fits.",
        "learner_output": "A project containing organized documents, highlighted passages, tags and notes that explain how the labels were used.",
        "limitations": ["Taguette helps organize and retrieve text; it does not interpret the accounts or show that a pattern applies to everyone. It is for qualitative text work, not a statistical-analysis package."],
    },
}

AREA_TOOL_SOURCE_RECORDS = {
    "src:d078-tool-limesurvey": {
        "title": "LimeSurvey official manual: surveys and responses",
        "url": "https://www.limesurvey.org/manual/LimeSurvey_Manual",
        "supports": "Creating and managing surveys, questions and response records.",
        "limits": "Software documentation verifies functions, not questionnaire validity, sample quality or research ethics.",
    },
    "src:d078-tool-nvivo": {
        "title": "Lumivero NVivo documentation: coding qualitative material",
        "url": "https://community.lumivero.com/s/article/NVR1Mac-Content-coding-coding",
        "supports": "Coding document or transcript passages and organizing references to themes, people or entities.",
        "limits": "Software documentation verifies product functions, not the validity of a coding scheme or interpretation.",
    },
    "src:d078-tool-python": {
        "title": "Python official tutorial",
        "url": "https://docs.python.org/3/tutorial/",
        "supports": "Python is a programming language suitable for scripts and application development; the tutorial expects basic programming knowledge.",
        "limits": "The tutorial is not a social-science research-method guide and assumes prior programming knowledge.",
    },
    "src:d078-tool-r": {
        "title": "The R Project: What is R?",
        "url": "https://www.r-project.org/about.html",
        "supports": "R is a language and environment for statistical computing and graphics with data-handling, analysis and plotting facilities.",
        "limits": "Official product description; method choice and research interpretation remain the learner's responsibility.",
    },
    "src:d078-tool-spss": {
        "title": "IBM SPSS Statistics: t-test and chi-square procedures",
        "url": "https://www.ibm.com/docs/en/spss-statistics/30.0.0?topic=test-overview-t-command",
        "supports": "SPSS procedures for comparing sample means and calculating chi-square statistics for counts in categories.",
        "limits": "Software procedures have data and assumption requirements; product documentation does not make the selected method suitable for every question.",
    },
    "src:d078-tool-stata": {
        "title": "Stata official feature guides: panel and time-series analysis",
        "url": "https://www.stata.com/features/panel-longitudinal-data/",
        "supports": "Stata functions for analyzing repeated panel records, group relationships and outcomes over time.",
        "limits": "Commercial software documentation; included features do not establish that every procedure or route is required.",
    },
    "src:d078-tool-taguette": {
        "title": "Taguette official site and documentation",
        "url": "https://app.taguette.org/",
        "supports": "Open-source web-based tool for qualitative document tagging, annotation and retrieval.",
        "limits": "Tool description verifies document-tagging functions, not the quality of an interpretation or the generalizability of findings.",
    },
}

NEW_SOURCE_RECORDS = {
    "src:d078-computational-social-science-review-2020": {
        "title": "Edelmann et al., Computational Social Science and Sociology, Annual Review of Sociology (2020)",
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC8612450/",
        "supports": "Interdisciplinary definition of computational social science, use of computational methods with digital sources, and the importance of developing or applying social-science theory.",
        "limits": "A review's definition and disciplinary scope; it does not establish that all social-science research is computational or that large data are automatically valid.",
    },
    "src:d078-digital-trace-data-2025": {
        "title": "Best practices for studies using digital data donation (2025)",
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC11971172/",
        "supports": "Defines digital trace data as information created through digital interactions and gives examples such as social media use, email and transactions.",
        "limits": "A methods discussion of digital data donation; examples do not establish that all traces are accessible, representative or ethically reusable.",
    },
    "src:d078-esrc-internet-mediated-research": {
        "title": "UKRI Economic and Social Research Council, Internet-mediated research ethics guidance",
        "url": "https://www.ukri.org/councils/esrc/guidance-for-applicants/research-ethics-guidance/internet-mediated-research/",
        "supports": "Privacy, consent, identification, platform rules and ethics-review considerations for research using online material.",
        "limits": "UKRI/ESRC guidance; researchers must follow the relevant institutional review process and laws in their own jurisdiction.",
    },
}


def main() -> None:
    graph = json.loads(GRAPH.read_text(encoding="utf-8"))
    old_node_ids = [node["id"] for node in graph["nodes"]]
    old_edge_ids = [edge.get("id") for edge in graph["edges"]]
    old_counts = (len(graph["nodes"]), len(graph["edges"]))

    by_id = {node["id"]: node for node in graph["nodes"]}
    domain = by_id["domain:D078"]
    computational = by_id["domain-item:d078-computational-social-research"]
    transition = graph["programme_transition"]

    transition["domain_overview"] = DOMAIN_OVERVIEW
    transition["transfer_summary"] = TRANSFER_SUMMARY
    domain["overview"] = DOMAIN_OVERVIEW
    domain["student_orientation"].update(DOMAIN_ORIENTATION)
    computational.update(COMPUTATIONAL_ITEM)
    computational_area = by_id["area:d078-computational-digital-social-science"]
    computational_area["description"] = COMPUTATIONAL_AREA_OVERVIEW
    computational_area["overview"] = COMPUTATIONAL_AREA_OVERVIEW
    media_task = by_id["role-task:d078:media-scientist"]
    media_task["label"] = (
        "Study how media forms, organizations and use relate to society; document media practices "
        "or audience responses and explain what those patterns mean for society."
    )

    evidence = computational.setdefault("evidence", [])
    new_evidence = [
        {
            "source_id": "src:d078-computational-social-science-review-2020",
            "exact_locator": "Abstract and definition paragraphs: interdisciplinary field applies computational techniques to digitized sources to develop or examine theories of human behavior; the review notes distinct disciplinary origins and definitions.",
        },
        {
            "source_id": "src:d078-digital-trace-data-2025",
            "exact_locator": "Introduction: defines digital trace data as information created through digital interaction and lists examples including social media, email and financial transactions.",
        },
        {
            "source_id": "src:d078-esrc-internet-mediated-research",
            "exact_locator": "Guidance sections on privacy, informed consent, identifiability, platform rules, and ethics review for online research.",
        },
        {
            "source_id": "src:columbia-social-network-analysis",
            "exact_locator": "Social Network Analysis: explanation of network representations, nodes and ties, and examples of network measures.",
        },
        {
            "source_id": "src:abm-empirical-social-research",
            "exact_locator": "Abstract and model-construction/evaluation sections: empirically grounded social agent-based models need justified assumptions and careful evaluation; model fit does not establish universal prediction.",
        },
    ]
    existing_source_ids = {item.get("source_id") for item in evidence}
    evidence.extend(item for item in new_evidence if item["source_id"] not in existing_source_ids)
    source_refs = computational.setdefault("source_references", [])
    existing_refs = {item.get("source_id") for item in source_refs if isinstance(item, dict)}
    source_refs.extend(
        {"source_id": source_id, **record}
        for source_id, record in NEW_SOURCE_RECORDS.items()
        if source_id not in existing_refs
    )
    registry = graph.setdefault("external_source_registry", {})
    added_source_records = 0
    for source_id, record in {**NEW_SOURCE_RECORDS, **AREA_TOOL_SOURCE_RECORDS}.items():
        if source_id not in registry:
            registry[source_id] = record
            added_source_records += 1

    for node_id, copy in AREA_TOOL_COPY.items():
        tool_node = by_id[node_id]
        tool_node.update(copy)
        source_id = f"src:d078-tool-{node_id.rsplit('-', 1)[-1]}"
        source_record = AREA_TOOL_SOURCE_RECORDS[source_id]
        tool_refs = tool_node.setdefault("source_references", [])
        tool_ref_ids = {item.get("source_id") for item in tool_refs if isinstance(item, dict)}
        if source_id not in tool_ref_ids:
            tool_refs.append({"source_id": source_id, **source_record})
        tool_evidence = tool_node.setdefault("evidence", [])
        evidence_urls = {item.get("url") for item in tool_evidence if isinstance(item, dict)}
        if source_record["url"] not in evidence_urls:
            tool_evidence.append({
                "url": source_record["url"],
                "accessed_on": "2026-11-04",
                "locator": source_record["supports"],
            })

    before_structure = (old_node_ids, old_edge_ids)
    after_structure = ([node["id"] for node in graph["nodes"]], [edge.get("id") for edge in graph["edges"]])
    if old_counts != (len(graph["nodes"]), len(graph["edges"])) or before_structure != after_structure:
        raise AssertionError("Copy update changed graph nodes, edges or identifiers")

    GRAPH.write_text(json.dumps(graph, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    with gzip.open(GRAPH_GZ, "wt", encoding="utf-8", newline="") as target:
        json.dump(graph, target, ensure_ascii=False, separators=(",", ":"))

    print(json.dumps({
        "updated": [
            "programme_transition.domain_overview",
            "programme_transition.transfer_summary",
            "domain:D078.overview",
            "domain:D078.student_orientation",
            "domain-item:d078-computational-social-research.meaning/why_it_matters/contextual_use/what_it_is/learner_output/limitations/evidence/source_references",
            "area:d078-computational-digital-social-science.description/overview",
            "role-task:d078:media-scientist.label",
            "seven optional area-tool definitions, contextual uses, outputs and limitations",
        ],
        "source_records_added": added_source_records,
        "node_count": len(graph["nodes"]),
        "edge_count": len(graph["edges"]),
        "structure_unchanged": True,
        "copy_records_updated": 4,
    }, indent=2))


if __name__ == "__main__":
    main()

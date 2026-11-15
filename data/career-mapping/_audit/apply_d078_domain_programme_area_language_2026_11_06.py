"""Source-backed D078 programme, domain and area orientation copy refresh.

Only student-facing prose, its evidence references and structured orientation
fields are changed. Node/edge identifiers, lanes, ownership and routes are
asserted unchanged before saving both canonical graph transports.
"""

from __future__ import annotations

import gzip
import hashlib
import json
import os
import tempfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
GRAPH = ROOT / "data/career-mapping/_audit/D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json"
GRAPH_GZ = ROOT / "data/career-mapping/_audit/D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json.gz"

DOMAIN_ID = "domain:D078"
PROGRAMME_ID = "programme:social-sciences:sociology"

SOURCES = {
    "src:d078-unesco-iscoped-social-sciences": {
        "title": "International Standard Classification of Education: Fields of Education and Training 2013 — Detailed Field Descriptions",
        "publisher": "UNESCO Institute for Statistics",
        "url": "https://unesdoc.unesco.org/in/documentViewer.xhtml?ark=/ark:/48223/pf0000235049/PDF/235049eng.pdf&locale=en",
        "supports": "The classification distinguishes social and behavioural science fields including economics, political science, psychology, sociology and social geography, and describes their boundaries.",
        "locator": "Field 03 and detailed fields 031 and 0311–0314; definitions and inclusions/exclusions for social and behavioural sciences.",
        "limits": "A field-of-education classification, not a complete account of each discipline's methods, current practice or local curriculum.",
        "accessed": "2026-11-06",
    },
    "ISA_DIGITAL_SOCIOLOGY": {
        "title": "WG10 Digital Sociology",
        "publisher": "International Sociological Association",
        "url": "https://www.isa-sociology.org/research-networks/working-groups/wg10-digital-sociology",
        "supports": "The ISA working group identifies research at the intersection of digital technologies and society, including theoretical, empirical, methodological and socioethical work.",
        "locator": "WG10 purpose and objectives.",
        "limits": "This establishes a recognized research focus, not a requirement that all social research use computational methods.",
        "accessed": "2026-11-06",
    },
    "UNESCO_ISCED_FIELD_DESCRIPTIONS": {
        "title": "International Standard Classification of Education: Fields of Education and Training 2013 — Detailed Field Descriptions",
        "publisher": "UNESCO Institute for Statistics",
        "url": "https://unesdoc.unesco.org/in/documentViewer.xhtml?ark=/ark:/48223/pf0000235049/PDF/235049eng.pdf&locale=en",
        "supports": "The detailed classification describes social and behavioural science fields and gives inclusion and exclusion examples that distinguish adjacent fields.",
        "locator": "Detailed descriptions for broad field 03 and narrow field 031, including economics, political science, psychology, sociology and cultural studies.",
        "limits": "An education-field classification used to describe programme content; it is not a complete map of contemporary research areas or work practice.",
        "accessed": "2026-11-06",
    },
    "UNESCO_ISCED_SOCIAL_SCIENCES": {
        "title": "International Standard Classification of Education: Fields of Education and Training 2013 — Detailed Field Descriptions",
        "publisher": "UNESCO Institute for Statistics",
        "url": "https://unesdoc.unesco.org/in/documentViewer.xhtml?ark=/ark:/48223/pf0000235049/PDF/235049eng.pdf&locale=en",
        "supports": "The classification sets out the social and behavioural science field, its component subjects and boundaries with adjacent fields.",
        "locator": "Field 03 and detailed field 031, including codes 0311–0314 and related exclusions.",
        "limits": "An international education classification, not a complete account of every social-science discipline or current professional practice.",
        "accessed": "2026-11-06",
    },
    "UNESCO_SOCIAL_SCIENCE_DEFINITION": {
        "title": "Social Sciences (for R&D Data)",
        "publisher": "UNESCO Institute for Statistics, UIS Data Browser Glossary",
        "url": "https://databrowser.uis.unesco.org/resources/glossary/2462",
        "supports": "Defines the social-science grouping used in research-and-development statistics and lists fields such as psychology, economics, sociology, law, political science, geography and media and communications.",
        "locator": "UIS Data Browser glossary entry 2462; definition and its Frascati Manual source.",
        "limits": "A statistical classification definition for R&D reporting, not a full disciplinary description or a learning-path specification.",
        "accessed": "2026-11-06",
    },
    "src:d078-core-econ-doing-economics-2026": {
        "title": "Doing Economics",
        "publisher": "CORE Econ",
        "url": "https://www.core-econ.org/project/doing-economics/",
        "supports": "Applied economics learning connects a defined economic question with data handling, statistical procedures, and transparent use of software; examples include tax and inequality analysis.",
        "locator": "Project overview and example projects: 12 data-based projects, step-by-step use of Excel, Google Sheets, R and Python; project 3 measures sugar-tax effects using differences-in-differences; project 5 examines inequality with Gini coefficients and Lorenz curves.",
        "limits": "An open teaching resource that illustrates some data-based economics projects; it is not a complete economics curriculum or a statement that every learner must use each listed tool.",
        "accessed": "2026-11-06",
    },
    "src:d078-un-population-demodata-2026": {
        "title": "DemoData",
        "publisher": "United Nations Department of Economic and Social Affairs, Population Division",
        "url": "https://population.un.org/demodata/web/",
        "supports": "Population analysis draws on defined information about age, sex, births, deaths and migration assembled from sources such as censuses, registers and surveys; population estimates and projections depend on their sources and methods.",
        "locator": "About DemoData and data coverage: indicators, source types, compiled empirical data and tabulations used by the UN Population Division for estimates and projections.",
        "limits": "An international data resource; definitions, dates, geographic coverage and local statistical systems must be checked before using a series for a particular place.",
        "accessed": "2026-11-06",
    },
    "src:d078-worldbank-rural-accessibility-mapping": {
        "title": "Rural Accessibility Mapping",
        "publisher": "World Bank",
        "url": "https://www.worldbank.org/en/data/statistical-capacity-building/data-innovation-fund/Rural-accessibility-mapping",
        "supports": "Location-based analysis can combine population, roads and service locations to estimate how many people can reach a service within a stated travel time; the estimate depends on inputs and definitions.",
        "locator": "Project description: required geospatial inputs and accessibility indicators based on population share able to reach a nearby point of service within a selected time.",
        "limits": "A specific rural-accessibility example, not a universal measure of access or a substitute for local validation of roads, service locations and travel conditions.",
        "accessed": "2026-11-06",
    },
    "src:d078-oecd-regulatory-impact-policy": {
        "title": "Recommendation of the Council on Regulatory Policy and Governance",
        "publisher": "Organisation for Economic Co-operation and Development",
        "url": "https://legalinstruments.oecd.org/public/doc/128/body-text.en.html",
        "supports": "Public decisions can be examined by defining a problem, checking evidence for action, comparing policy instruments and considering expected benefits, costs, distribution and implementation needs.",
        "locator": "Sections on defining the problem and assessing whether government action is justified; discussion of alternative mechanisms, benefits and costs, distribution, and administrative requirements.",
        "limits": "International recommendation rather than a Nigerian statute; its analysis prompts do not replace the relevant country's laws or decision process.",
        "accessed": "2026-11-06",
    },
    "src:d078-magenta-book-2026": {
        "title": "Magenta Book: Central Government Guidance on Evaluation",
        "publisher": "HM Treasury and UK Government Social Research",
        "url": "https://www.gov.uk/government/publications/the-magenta-book/magenta-book-central-government-guidance-on-evaluation-html",
        "supports": "Evaluation asks whether an intervention was delivered as intended, what changed, for whom and why; process, impact and value-for-money questions need suitable evidence and methods.",
        "locator": "Chapters 1.8 and 1.9: process, impact and value-for-money evaluation; theory of change, testing explanations, combining approaches and limits to attribution or generalisation.",
        "limits": "UK central-government guidance; examples and institutional requirements are jurisdiction-specific and must not be presented as binding Nigerian procedure.",
        "accessed": "2026-11-06",
    },
    "src:d078-openstax-psychology-research-2e": {
        "title": "Approaches to Research, Psychology 2e",
        "publisher": "OpenStax",
        "url": "https://openstax.org/books/psychology-2e/pages/2-2-approaches-to-research",
        "supports": "Research questions determine whether observation, surveys, interviews or experiments are appropriate, and each approach has different strengths and limits.",
        "locator": "Section 2.2: description of observational, survey, interview and experimental approaches and their differing strengths and limits.",
        "limits": "An introductory psychology textbook example; this D078 area covers social-science questions and does not teach clinical assessment or treatment.",
        "accessed": "2026-11-06",
    },
    "src:d078-openstax-social-influence-2e": {
        "title": "Conformity, Compliance, and Obedience, Psychology 2e",
        "publisher": "OpenStax",
        "url": "https://openstax.org/books/psychology-2e/pages/12-4-conformity-compliance-and-obedience",
        "supports": "Social settings and group processes can influence people's thoughts, feelings and actions; study examples also require attention to how a behavior was measured and the limits of a particular study.",
        "locator": "Section 12.4 opening and sections on conformity, social influence and group processes.",
        "limits": "Illustrative introductory material; a classic study does not establish a universal rule about all people or settings.",
        "accessed": "2026-11-06",
    },
    "src:d078-openstax-sociology-research-3e": {
        "title": "Sociological Research, Introduction to Sociology 3e",
        "publisher": "OpenStax",
        "url": "https://openstax.org/books/introduction-sociology-3e/pages/2-2-research-methods",
        "supports": "Sociological research begins with a question and a study plan; surveys, observation, interviews, experiments and existing sources answer different kinds of questions and carry different limits.",
        "locator": "Section 2.2: research design and examples of primary data collection and secondary analysis; method choice depends on the question and context.",
        "limits": "An introductory textbook, not a substitute for local curriculum or research ethics requirements.",
        "accessed": "2026-11-06",
    },
    "src:d078-openstax-anthropology-culture": {
        "title": "Culture, Introduction to Anthropology",
        "publisher": "OpenStax",
        "url": "https://openstax.org/books/introduction-anthropology/pages/3-introduction",
        "supports": "Anthropology studies how people meet needs and organize life in different social and environmental settings; culture is a central concept and is learned, created and changed.",
        "locator": "Chapter 3 introduction: everyday needs, social circumstances, differing practices and the study of culture and change.",
        "limits": "An introductory cultural-anthropology account; it is an example of disciplinary scope, not a claim that all anthropology uses one method.",
        "accessed": "2026-11-06",
    },
    "src:d078-aaa-anthropological-ethics": {
        "title": "Anthropological Ethics",
        "publisher": "American Anthropological Association",
        "url": "https://americananthro.org/about/anthropological-ethics/",
        "supports": "Anthropological research should avoid harm, be open about the work, obtain informed consent and necessary permissions, consider affected parties, make results accessible and protect records.",
        "locator": "Principles of Professional Responsibility listed on the association page.",
        "limits": "Professional ethical guidance, not a replacement for local law, institutional review or community-specific obligations.",
        "accessed": "2026-11-06",
    },
    "src:d078-aapor-survey-best-practices": {
        "title": "Best Practices for Survey Research",
        "publisher": "American Association for Public Opinion Research",
        "url": "https://aapor.org/standards-and-ethics/best-practices/",
        "supports": "Survey suitability, question and sample planning, recruitment, survey modes, disclosure and limitations of probability and non-probability samples.",
        "locator": "Best Practices sections on survey planning, sampling, data collection and transparent reporting.",
        "limits": "Professional guidance, not a guarantee that a particular survey is valid or representative.",
        "accessed": "2026-11-06",
    },
    "src:d078-aapor-transparency-initiative": {
        "title": "Transparency Initiative",
        "publisher": "American Association for Public Opinion Research",
        "url": "https://aapor.org/standards-and-ethics/transparency-initiative/",
        "supports": "Disclosure of sample selection, recruitment, survey mode, question wording, weighting and content-analysis procedures.",
        "locator": "Transparency Initiative required disclosure items for sampling, recruitment, measurement, analysis and reporting.",
        "limits": "A transparency standard; disclosure by itself does not establish that a study is sound.",
        "accessed": "2026-11-06",
    },
    "src:d078-cosmin-measurement-properties": {
        "title": "Explanation and Elaboration for the COSMIN Reporting Guideline 2.0",
        "publisher": "COSMIN initiative",
        "url": "https://www.cosmin.nl/wp-content/uploads/EE-document_final-version-website.pdf",
        "supports": "Consensus terminology for constructs and the measurement properties used to assess instruments, including reliability and validity.",
        "locator": "Terminology and abbreviations; measurement-property definitions and the distinction between the construct being measured and instrument quality.",
        "limits": "Developed for outcome-measurement instruments, especially patient-reported measures; use as a measurement-method source, not as a claim that all D078 scales are clinical instruments.",
        "accessed": "2026-11-06",
    },
    "src:d078-aera-apa-ncme-testing-standards": {
        "title": "Standards for Educational and Psychological Testing",
        "publisher": "American Educational Research Association, American Psychological Association and National Council on Measurement in Education",
        "url": "https://www.apa.org/science/programs/testing/standards",
        "supports": "Professional standards for test development, score interpretation, validity, reliability and fairness.",
        "locator": "Overview of the joint Standards for Educational and Psychological Testing and their scope.",
        "limits": "The standards guide tests and score use; they do not certify any particular D078 measure or scale.",
        "accessed": "2026-11-06",
    },
    "src:d078-statsmodels-arima": {
        "title": "ARIMA models",
        "publisher": "statsmodels project documentation",
        "url": "https://www.statsmodels.org/stable/generated/statsmodels.tsa.arima.model.ARIMA.html",
        "supports": "The ARIMA interface includes autoregressive, moving-average, ARMA, ARIMA and seasonal variants and permits regression with ARIMA-type errors.",
        "locator": "Class description and supported AR, MA, ARMA, ARIMA and seasonal model variants.",
        "limits": "Software documentation identifies model forms; it does not establish that a model is appropriate for a particular series or research question.",
        "accessed": "2026-11-06",
    },
    "src:d078-statsmodels-mixedlm": {
        "title": "Linear Mixed Effects Models",
        "publisher": "statsmodels project documentation",
        "url": "https://www.statsmodels.org/stable/mixed_linear.html",
        "supports": "The statsmodels reference documents linear mixed-effects models and variance components used to represent grouped or multilevel data.",
        "locator": "Linear Mixed Effects Models guide and MixedLM/variance-component API descriptions.",
        "limits": "Software documentation describes model implementations; it does not determine whether a multilevel model is appropriate for a particular research question or dataset.",
        "accessed": "2026-11-06",
    },
    "src:d078-worldbank-dime-longitudinal-panel": {
        "title": "Chapter 3: Establishing a Measurement Framework",
        "publisher": "World Bank, Development Impact Evaluation (DIME) Analytics Data Handbook",
        "url": "https://worldbank.github.io/dime-data-handbook/measurement.html",
        "supports": "The handbook distinguishes longitudinal repeated observations from repeated cross-sections and panel data, where the same units are observed over time.",
        "locator": "Discussion of longitudinal observations, repeated cross-sections and panel data.",
        "limits": "The handbook is oriented to development-impact evaluation; this data-structure distinction does not establish a causal design by itself.",
        "accessed": "2026-11-06",
    },
    "src:d078-worldbank-dime-panel-data-construction": {
        "title": "Chapter 6: Constructing and Analyzing Research Data",
        "publisher": "World Bank, Development Impact Evaluation (DIME) Analytics Data Handbook",
        "url": "https://worldbank.github.io/dime-data-handbook/analysis.html",
        "supports": "The handbook describes appending baseline and endline records to create panel data and recommends documenting unmatched records and sample differences.",
        "locator": "Panel-data construction and record-matching discussion in the analysis chapter.",
        "limits": "The handbook is oriented to development-impact evaluation; the construction steps do not establish that any particular panel analysis is appropriate.",
        "accessed": "2026-11-06",
    },
    "src:d078-sage-dictionary-discourse-analysis": {
        "title": "Discourse Analysis",
        "publisher": "SAGE Publications, The SAGE Dictionary of Social Research Methods",
        "url": "https://doi.org/10.4135/9780857020116.n54",
        "supports": "Discourse analysis is a family of qualitative approaches that examines texts, conversations and documents in context, including connections among language, communication, knowledge, power and social practices.",
        "locator": "Publisher chapter record: definition and distinctive features.",
        "limits": "The publisher record presents a broad definition of a heterogeneous family; particular discourse-analytic traditions use different theories and procedures, and full chapter access may require a subscription.",
        "accessed": "2026-11-06",
    },
    "src:d078-nist-machine-learning-glossary": {
        "title": "Machine Learning",
        "publisher": "National Institute of Standards and Technology",
        "url": "https://csrc.nist.gov/glossary/term/machine_learning",
        "supports": "A standards glossary description of computer systems that adapt from data, interpreted in context with the cited NIST source.",
        "locator": "NIST CSRC glossary entry for machine learning and its linked source publications.",
        "limits": "The glossary definition is broad; it is not a claim that every computational social-science method is machine learning.",
        "accessed": "2026-11-06",
    },
    "src:d078-ucla-conversation-analysis": {
        "title": "Conversation Analysis",
        "publisher": "University of California, Los Angeles, Department of Sociology",
        "url": "https://soc.ucla.edu/graduate-study/working-groups/conversation-analysis/",
        "supports": "Conversation analysis studies interaction closely as turns and actions unfold, using recorded interaction and participants' responses as evidence for interpretation.",
        "locator": "Overview of the approach, its sequential questions and its use of audio/video recordings, transcripts and annotation.",
        "limits": "A university working-group overview of one methodological tradition; it does not represent every discourse-analytic approach.",
        "accessed": "2026-11-06",
    },
    "src:d078-asa-pvalue-statement": {
        "title": "ASA Statement on Statistical Significance and P-Values",
        "publisher": "American Statistical Association",
        "url": "https://www.amstat.org/asa/files/pdfs/P-ValueStatement.pdf",
        "supports": "The meaning and limits of p-values and statistical-significance thresholds, including why they do not measure effect size or whether a hypothesis is true.",
        "locator": "The six principles in the ASA statement.",
        "limits": "A statement about statistical interpretation; it does not replace the design-specific assumptions of an analysis.",
        "accessed": "2026-11-06",
    },
}

LEGACY_AREA_SOURCE_IDS_TO_REFRESH = {
    "ISA_DIGITAL_SOCIOLOGY",
    "UNESCO_ISCED_FIELD_DESCRIPTIONS",
    "UNESCO_ISCED_SOCIAL_SCIENCES",
    "UNESCO_SOCIAL_SCIENCE_DEFINITION",
}
SOURCE_URL_REPAIRS = {
    # The former UIS-hosted path now returns 404; this official UNESCO
    # UNESDOC viewer resolves to the same detailed ISCED-F 2013 publication.
    "src:d078-unesco-iscoped-social-sciences",
}

AREA_COPY = {
    "area:d078-computational-digital-social-science": {
        "description": "This area applies computer-run methods to social questions and studies how digital technology shapes social life. Learners may examine online records, text or relationships, or run simulations (computer models that explore what follows from stated rules). Programming is useful for tasks that need it, but it is not required for every learner or role.",
        "orientation": {
            "shortIntro": "Use computer-based analysis to investigate social questions and examine how digital technology shapes social life.",
            "whatItStudies": "Computational social science (using computer-run procedures to examine questions about people, groups and society) may study digital life itself or use digital traces (records created when people use online services, such as posts or transactions). A trace captures only the activity a service records; it is not a complete account of a person or group.",
            "whatPeopleDo": "Researchers start with a social question and choose computer-run procedures that fit it. Some compare written material or measure relationships; others estimate patterns or simulate what could happen under stated rules.",
            "approaches": [
                "An algorithm (a defined set of steps) sorts, counts or compares information.",
                "Network analysis (representing people or organizations as points and relationships as links) measures patterns in those connections.",
                "Text analysis (applying defined steps to written or spoken language) compares or classifies material in documents.",
                "A statistical model (mathematical rules for estimating patterns or relationships) uses recorded measures to make an estimate.",
                "A simulation (a computer-run exploration of stated rules) shows possible outcomes under those rules.",
                "An agent-based model (a simulation that represents people or groups separately) applies rules to each and examines the group patterns that follow.",
            ],
            "questions": [
                "How do people in two selected online communities discuss the same public issue?",
                "Which people or groups connect otherwise separate parts of an organization or community?",
                "What patterns could form when people respond to one another under stated rules?",
            ],
            "outputs": [
                "A study plan naming the question, records or model, analysis steps, privacy checks and limits.",
                "A table or chart comparing patterns in selected records, or a simulated scenario that states the rules it used.",
                "An explanation of what the result supports, who or what it may leave out, and what it cannot establish by itself.",
            ],
            "howWorkHappens": [
                "Define the social question and the people, groups, place or period it concerns.",
                "Check what the records contain and how they were created. Digital traces show activity on particular services; they do not automatically represent everyone affected by the question.",
                "Choose a procedure that fits the question: compare documents, measure recorded connections, estimate a pattern or run a simulation. An agent-based model (a simulation of separately represented people or groups) applies stated rules to each.",
                "Check the result against the question and available evidence. Explain missing information, choices built into the procedure and other limits before drawing a conclusion.",
            ],
            "limits": "Online records may miss people who do not use a service or whose activity was not recorded. A model simplifies a process; a simulation shows what its stated rules produce, not what must happen in real life. A pattern alone does not show what caused it.",
            "ethicalCare": "Public visibility does not remove the need to protect privacy, follow relevant service rules and ask for informed consent (permission given after a person understands what taking part involves) when it is required. A research ethics review (a formal check of how a study protects people) may also be required.",
        },
        "fields": {
            "whatItStudies": ["src:annual-review-css-2020", "src:d078-digital-trace-data-2025"],
            "whatPeopleDo": ["src:edinburgh-css-course", "src:columbia-social-network-analysis", "src:abm-empirical-social-research"],
            "questions": ["src:edinburgh-css-course", "src:annual-review-css-2020"],
            "outputs": ["src:edinburgh-css-course", "src:abm-empirical-social-research"],
            "howWorkHappens": ["src:edinburgh-css-course", "src:d078-digital-trace-data-2025"],
            "limits": ["src:d078-digital-trace-data-2025", "src:abm-empirical-social-research"],
            "ethicalCare": ["src:d078-esrc-internet-mediated-research"],
        },
    },
    "area:d078-economics-applied-analysis": {
        "description": "Study how people, businesses and governments make choices with limited resources, how markets work, and how costs and benefits are shared.",
        "orientation": {
            "shortIntro": "Study choices about resources, markets and how economic costs and benefits are shared.",
            "whatItStudies": "Economics (the study of choices about limited resources and how those choices shape production, exchange and living conditions) can be applied to a real-world question using evidence (information examined to support a conclusion). For example, researchers may examine how rising transport costs relate to household spending. Distribution (who receives benefits and who bears costs) is one question they can study.",
            "whatPeopleDo": "Researchers define the question, outcome and comparison; find information such as prices, wages, business records or survey answers; and interpret the results using economic concepts. An incentive (a reward, cost or rule that can affect a choice) is one such concept. An economic model (a simplified account of how parts of an economy may interact) makes assumptions visible but leaves out some details of real life.",
            "approaches": [
                "A resource-choice question examines how people, organizations or governments respond to prices, rules or incentives.",
                "An economic model (a simplified account of how parts of an economy may interact) makes its assumptions clear so a learner can compare possible explanations.",
                "A distribution comparison (checking who receives benefits and who bears costs) shows how an economic change may affect different groups.",
            ],
            "questions": [
                "How do changes in food prices relate to household spending in different income groups?",
                "Who may gain or bear costs under a proposed tax change, and which assumptions affect that estimate?",
                "How do jobs, wages or business activity differ across places or time periods?",
            ],
            "outputs": [
                "A short note on an economic, policy or market question, stating the evidence (information examined to support a conclusion), assumptions and limits.",
                "A table or chart comparing a defined outcome across groups, places or time periods.",
                "A clear explanation of what an estimate says and which choices or assumptions affect it.",
            ],
            "howWorkHappens": [
                "State the decision or economic question, whose outcomes matter, and the place and period being studied.",
                "Define each measure and find suitable information, such as prices, wages, output, taxes or survey responses.",
                "Compare groups or periods, or use an economic model to examine a stated scenario; explain why that approach fits the question.",
                "Describe the result in ordinary language, name other changes that could affect it, and state what further information would strengthen the conclusion.",
            ],
            "limits": "A difference between groups, or a change after a policy, does not by itself show that one thing caused the other. Estimates depend on data definitions, the time and place, the comparison and the model assumptions. A result about one market or population may not apply to another.",
            "ethicalCare": "Economic records can include personal or business information. Use data only for an appropriate purpose, protect private details and explain who or what the analysis leaves out. Economic estimates can inform decisions; they do not make the decision for the people or institutions responsible.",
        },
        "fields": {"whatItStudies": ["src:d078-core-econ-doing-economics-2026"], "whatPeopleDo": ["src:d078-core-econ-doing-economics-2026"], "approaches": ["src:d078-core-econ-doing-economics-2026"], "questions": ["src:d078-core-econ-doing-economics-2026"], "outputs": ["src:d078-core-econ-doing-economics-2026"], "howWorkHappens": ["src:d078-core-econ-doing-economics-2026"], "limits": ["src:d078-core-econ-doing-economics-2026"], "ethicalCare": ["src:d078-core-econ-doing-economics-2026"]},
    },
    "area:d078-human-geography-population": {
        "description": "Study where people live and move, how places change, and how location affects access to services and opportunities.",
        "orientation": {
            "shortIntro": "Study how people, movement, services and opportunities vary across places and over time.",
            "whatItStudies": "Human geography examines how people and places relate: where people live, move and work, how settlements grow, and how access to services differs by location. Population (people in a defined place or group) studies examine how those people change through births, deaths and migration (movement between places). A spatial pattern (how people or events are arranged across locations) is one subject of study.",
            "whatPeopleDo": "Researchers combine information such as census counts, surveys, maps, roads and service locations. They compare places at a geographic scale (the size of the area being compared), such as a neighbourhood, district or country. For example, a map can estimate what share of residents can reach a clinic within a chosen travel time, if the population, road and clinic information is suitable.",
            "approaches": [
                "A population profile (a summary of a group's size and characteristics) describes how a defined population changes over a stated period.",
                "A service-access map compares where people live with the location of a service and an agreed travel time; its estimate depends on the records and boundaries used.",
                "A population projection (a calculated possible future based on stated assumptions) compares scenarios; it is not a guaranteed forecast.",
            ],
            "questions": [
                "Where are schools, clinics or transport services located compared with where people live?",
                "How do population age, settlement or movement change across a defined place and period?",
                "Which communities have longer journeys to a service, and what information would explain the difference?",
            ],
            "outputs": [
                "A map or population profile that names its information source, dates, area size and interpretation limits.",
                "A comparison of population change or service access across selected places.",
                "A note that explains how place boundaries, missing records or travel assumptions affect the result.",
            ],
            "howWorkHappens": [
                "Define the population, place, time period and question; use boundaries that fit the decision or social issue.",
                "Check how population and location information was collected, how current it is and which groups or places may be missing.",
                "Compare counts or rates (counts relative to a defined group or amount), or map services and travel routes. State which group or amount each rate uses.",
                "Describe what the map or population profile shows and what additional evidence is needed to explain why the pattern occurs.",
            ],
            "limits": "Maps depend on the boundaries and scale chosen; changing them can change the visible pattern. Place-level averages do not describe every person living there. Population projections (calculated possibilities based on stated assumptions) are not guaranteed forecasts, and a map alone does not show what caused a pattern.",
            "ethicalCare": "Location and population information can reveal where people live or travel. Use the least identifying information needed, protect sensitive locations and check whether small or undercounted groups disappear inside area totals.",
        },
        "fields": {"whatItStudies": ["src:d078-unesco-iscoped-social-sciences", "src:d078-un-population-demodata-2026"], "whatPeopleDo": ["src:d078-un-population-demodata-2026", "src:d078-worldbank-rural-accessibility-mapping"], "approaches": ["src:d078-worldbank-rural-accessibility-mapping", "src:d078-un-population-demodata-2026"], "questions": ["src:d078-worldbank-rural-accessibility-mapping", "src:d078-un-population-demodata-2026"], "outputs": ["src:d078-worldbank-rural-accessibility-mapping", "src:d078-un-population-demodata-2026"], "howWorkHappens": ["src:d078-worldbank-rural-accessibility-mapping", "src:d078-un-population-demodata-2026"], "limits": ["src:d078-worldbank-rural-accessibility-mapping", "src:d078-un-population-demodata-2026"], "ethicalCare": ["src:d078-worldbank-rural-accessibility-mapping"]},
    },
    "area:d078-politics-governance-public-policy": {
        "description": "Study who makes public decisions, how they are carried out and how people can influence them.",
        "orientation": {
            "shortIntro": "Study who makes public decisions, how they are carried out and how people can influence them.",
            "whatItStudies": "This area studies political institutions (organizations and rules that organize public decisions), who holds public authority (the power to make or carry out decisions for a community), and how policies are chosen and delivered. Public policy (a government decision, rule or programme intended to address an issue) and governance (how public decisions are made, carried out and reviewed) are central subjects.",
            "whatPeopleDo": "Researchers define the public issue, identify who can decide or act, and examine laws, budgets, meeting records, surveys or interviews. They compare policy options, including who each option may help or burden and what it may require to put into practice. Analysis can inform a decision, but the responsible public body makes the decision.",
            "approaches": [
                "An institution-and-policy map (a guide to organizations, rules and decision points) shows who has responsibility for a public issue.",
                "A policy-options comparison checks evidence, likely benefits and costs, who may gain or bear costs, and what administration is needed to put each option into practice.",
                "A policy evaluation (a planned assessment using evidence) examines how a policy was delivered and what changed; it does not make the decision for government.",
            ],
            "questions": [
                "Which public body is responsible for a service, and how is that responsibility carried out?",
                "Who can take part in a decision, and whose views or needs may be missing?",
                "What benefits, costs and practical demands might follow from different responses to a public problem?",
            ],
            "outputs": [
                "A policy brief (a short document for people making a public decision) that states the question, evidence, options, trade-offs and uncertainty.",
                "A map of the organizations, rules, groups and decision points connected to an issue.",
                "An evaluation (a planned assessment using evidence to judge how something is working) of how a policy or programme was delivered and what is known about its results.",
            ],
            "howWorkHappens": [
                "Name the decision or public issue, the place and time, and the people likely to be affected.",
                "Map who has responsibility, what rules apply and how people can take part.",
                "Gather relevant records and accounts; compare options against the stated aim, evidence, likely costs and implementation needs.",
                "Explain what the evidence supports, what depends on local rules or assumptions, and which decision-makers must consider the analysis.",
            ],
            "limits": "Political systems, laws and responsibilities differ by country and level of government. A policy written on paper may be carried out differently in practice. Evidence can inform public choices, but it does not settle value disagreements or transfer decision-making authority to the researcher.",
            "ethicalCare": "Political questions can affect safety, reputation or participation. Protect people who share information in confidence, describe opposing views fairly and make clear which claims come from records, interviews or the researcher's interpretation.",
        },
        "fields": {"whatItStudies": ["src:d078-unesco-iscoped-social-sciences", "src:d078-oecd-regulatory-impact-policy"], "whatPeopleDo": ["src:d078-oecd-regulatory-impact-policy"], "approaches": ["src:d078-oecd-regulatory-impact-policy", "src:d078-magenta-book-2026"], "questions": ["src:d078-oecd-regulatory-impact-policy"], "outputs": ["src:d078-oecd-regulatory-impact-policy", "src:d078-magenta-book-2026"], "howWorkHappens": ["src:d078-oecd-regulatory-impact-policy"], "limits": ["src:d078-oecd-regulatory-impact-policy"], "ethicalCare": ["src:d078-oecd-regulatory-impact-policy"]},
    },
    "area:d078-psychology-social-behaviour": {
        "description": "Study how people think, feel and act with others and in social settings. This area focuses on social research, not mental-health diagnosis or treatment; clinical psychology and counselling are covered separately.",
        "orientation": {
            "shortIntro": "Study how other people, group life and social settings relate to behaviour and interaction.",
            "whatItStudies": "This area asks how people think, feel and act in relation to others and settings such as families, peer groups, workplaces or public spaces. Social influence (when other people or group expectations affect what someone thinks, feels or does) is one subject. This route focuses on social research; it does not cover diagnosing or treating mental-health conditions. Clinical psychology and counselling are covered separately in the Psychology and Counselling domain.",
            "whatPeopleDo": "Researchers define the behaviour and setting they want to understand, then choose how to record it. A measure (a defined way of recording an action, answer or experience) may be used in a survey, interview, observation or experiment. Researchers can compare what people report with what was observed. Each approach answers different questions and has limits.",
            "approaches": [
                "A survey (a set of questions asked in a planned way) compares people's reported answers; wording and who responds affect what it can show.",
                "Observation (watching and recording actions or events) shows what happens in a setting; the researcher's presence can affect what people do.",
                "An experiment (a planned study that changes a condition and records what follows) can test a focused question, but its result applies only as broadly as its design and participants allow.",
            ],
            "questions": [
                "How do group expectations relate to what people say or do in a particular setting?",
                "Do people's reported views differ from their choices in a specific situation?",
                "How do relationships, roles or communication settings shape participation in a group?",
            ],
            "outputs": [
                "A research summary that separates what was observed, how it was interpreted and what remains uncertain.",
                "A table or account comparing defined responses or behaviours across settings.",
                "When the question and evidence support it, a plan for testing a change in a social setting while protecting participants.",
            ],
            "howWorkHappens": [
                "State the question, define the behaviour or experience and identify the social setting.",
                "Choose a suitable method and explain how participants, situations or responses will be selected and recorded.",
                "Collect information with appropriate permission and safeguards; record what the method cannot observe.",
                "Compare the evidence, consider other explanations and describe the conclusion only as broadly as the study allows.",
            ],
            "limits": "What people report may differ from what they do, and behaviour can change across settings. A group pattern does not reveal every person's motive or diagnose an individual. A claim that a condition caused a behaviour needs a study design that can rule out other explanations.",
            "ethicalCare": "Research may involve personal experiences or sensitive social settings. Explain participation clearly, obtain the required consent, protect identities and let participants know how their information will be used.",
        },
        "fields": {"whatItStudies": ["src:d078-openstax-social-influence-2e"], "whatPeopleDo": ["src:d078-openstax-psychology-research-2e"], "approaches": ["src:d078-openstax-psychology-research-2e"], "questions": ["src:d078-openstax-social-influence-2e", "src:d078-openstax-psychology-research-2e"], "outputs": ["src:d078-openstax-psychology-research-2e"], "howWorkHappens": ["src:d078-openstax-psychology-research-2e"], "limits": ["src:d078-openstax-psychology-research-2e", "src:d078-openstax-social-influence-2e"], "ethicalCare": ["src:d078-esrc-internet-mediated-research"]},
    },
    "area:d078-social-research-evaluation": {
        "description": "Plan research to answer questions about society and assess what programmes or policies do, for whom and under what conditions.",
        "orientation": {
            "shortIntro": "Plan social studies and assess what programmes or policies do, for whom and under what conditions.",
            "whatItStudies": "Social research plans and carries out studies about people, groups and institutions. Evaluation (a planned assessment using evidence to understand how an organized programme or public policy was designed or delivered, whom it reached and what changed) is one part of this area.",
            "approaches": [
                "Qualitative evidence (words, observations or accounts examined for meaning and context) can show how people experience a service or change.",
                "Quantitative evidence (counts, measurements or scores) can show how much or how often something occurred.",
                "Mixed methods (a planned study using both approaches) combines findings when they answer different parts of the question.",
                "A theory of change (an explanation or diagram of how activities are expected to lead to results) makes a programme's assumptions clear enough to examine.",
            ],
            "whatPeopleDo": "Evaluators agree what decisions the study should inform, define the intended result and choose evidence that can answer the question. A theory of change (an explanation or diagram of how programme activities are expected to lead to results, including the assumptions between steps) helps make that plan clear. Researchers may examine delivery, changes and costs; the exact design depends on the question and available comparison information.",
            "questions": [
                "Was a programme delivered as planned, and who was able to use it?",
                "What changed during or after the programme, and what other events could explain that change?",
                "Which groups benefited, which did not, and what evidence is missing?",
            ],
            "outputs": [
                "A research or evaluation brief that states the question, evidence plan, findings, safeguards and limits.",
                "A programme map showing activities, intended results and assumptions to check.",
                "A report separating what was delivered, what changed and how strongly the study can connect that change to the programme.",
            ],
            "howWorkHappens": [
                "Agree the purpose, decision, people affected and questions the study must answer.",
                "Describe the programme or policy, its activities and intended results; make assumptions visible.",
                "Choose qualitative, quantitative or mixed methods to gather information on delivery, results or costs.",
                "Compare findings with the question, examine other possible explanations and state what the design can support.",
            ],
            "limits": "Tracking activities or results is not the same as showing that a programme caused a change. A before-and-after difference may reflect other events. Stronger conclusions depend on the comparison, evidence, assumptions and setting; results from one programme do not automatically apply elsewhere.",
            "ethicalCare": "Evaluation can affect services and the people who rely on them. Include affected groups where appropriate, protect personal information, explain how findings will be used and report gaps or harms as well as intended benefits.",
        },
        "fields": {"whatItStudies": ["src:d078-magenta-book-2026"], "whatPeopleDo": ["src:d078-magenta-book-2026"], "questions": ["src:d078-magenta-book-2026"], "outputs": ["src:d078-magenta-book-2026"], "howWorkHappens": ["src:d078-magenta-book-2026"], "limits": ["src:d078-magenta-book-2026"], "ethicalCare": ["src:d078-magenta-book-2026", "src:d078-esrc-internet-mediated-research"]},
    },
    "area:d078-sociology-social-anthropology": {
        "description": "Study relationships and shared ways of life, and how groups and institutions shape everyday life and social change.",
        "orientation": {
            "shortIntro": "Study relationships, shared ways of life, institutions and social change in their settings.",
            "whatItStudies": "Sociology and social anthropology ask how people live together and how relationships, groups, institutions and culture shape everyday life. Culture (shared ways of living and making meaning, including practices, beliefs, language and expectations) is one subject. Sociology often examines patterns across groups and institutions; social anthropology often studies everyday practices and meanings in their setting. The fields overlap and do not use only one method.",
            "whatPeopleDo": "Researchers begin with a focused question, then use evidence (information examined to help answer a question) suited to the people and setting. Fieldwork (research carried out in the place or community being studied) may involve careful observation, conversations, interviews and records. Researchers explain how they interpreted what they saw or heard and consider how their own position may affect the account.",
            "approaches": [
                "Fieldwork (research carried out in the setting being studied) can include observation, conversations, interviews and records gathered with appropriate access.",
                "Participant observation (taking part where appropriate while watching and recording activity) can help a researcher understand how a practice works in everyday life.",
                "Document study examines existing records in context, including who made them, why they were created and whose views may be missing.",
            ],
            "questions": [
                "How do family, work or community relationships shape people's everyday choices?",
                "How do people understand a practice, rule or change in the place where it occurs?",
                "What stays similar or differs when a social pattern is compared across groups or periods?",
            ],
            "outputs": [
                "Field notes: dated records of observations, conversations and the researcher's decisions during fieldwork.",
                "A source-based account explaining a social pattern in its setting and showing which evidence supports the interpretation.",
                "A comparison that states which groups or places were studied and what the evidence cannot show about others.",
            ],
            "howWorkHappens": [
                "Name the question, people, setting and period; explain which social idea or practice you want to understand.",
                "Choose interviews, observation, documents or other evidence that fits the question; arrange access and explain the study to people involved.",
                "Record evidence with its context, compare accounts and observations, and note disagreement or missing voices.",
                "Write an interpretation that distinguishes what participants said or did from what the researcher concludes.",
            ],
            "limits": "A detailed account of one community or setting does not automatically describe all communities. People may act differently when being observed, and the researcher's position can shape what is noticed or understood. Explain the study context and how interpretations were reached.",
            "ethicalCare": "Respect participants and affected communities, avoid harm, explain the work honestly, obtain consent and necessary permissions, protect records and consider how findings could affect people after publication.",
        },
        "fields": {"whatItStudies": ["src:d078-openstax-sociology-research-3e", "src:d078-openstax-anthropology-culture"], "whatPeopleDo": ["src:d078-openstax-sociology-research-3e", "src:d078-openstax-anthropology-culture"], "approaches": ["src:d078-openstax-sociology-research-3e", "src:d078-openstax-anthropology-culture", "src:d078-aaa-anthropological-ethics"], "questions": ["src:d078-openstax-sociology-research-3e", "src:d078-openstax-anthropology-culture"], "outputs": ["src:d078-openstax-sociology-research-3e", "src:d078-aaa-anthropological-ethics"], "howWorkHappens": ["src:d078-openstax-sociology-research-3e", "src:d078-openstax-anthropology-culture"], "limits": ["src:d078-openstax-sociology-research-3e", "src:d078-openstax-anthropology-culture"], "ethicalCare": ["src:d078-aaa-anthropological-ethics"]},
    },
}

DOMAIN_OVERVIEW = (
    "The social sciences study people, groups and societies: how people relate, how shared arrangements such as families, schools, workplaces and governments shape "
    "everyday life, and how societies change. Researchers start with a question, gather or examine evidence (information that can help answer it) using methods "
    "(planned ways to gather or examine information), and compare possible explanations. They report what the evidence supports, what remains uncertain and why."
)

DOMAIN_TRANSFER = (
    "Your Sociology courses are a starting point for Social Sciences, not proof that you have mastered the field. Learn the three required foundations first. Then compare "
    "how research methods answer social questions. Choose a method or combined design to see linked domain learning, areas and roles; each item explains why it appears. "
    "Useful items are optional; conditional items apply only when stated. Course links record learning goals, not mastery."
)

DOMAIN_ORIENTATION = {
    "whatItStudies": (
        "Sociology examines relationships, groups and social institutions; economics examines choices about limited resources; political science examines public "
        "decisions and authority; social-behaviour research studies how other people and settings relate to behaviour. These viewpoints overlap and can be used "
        "together when a question calls for them."
    ),
    "whatPeopleDo": (
        "Researchers ask questions, observe activity or examine documents, administrative records (information organizations collect while providing services) and digital "
        "traces (records from online activity, such as posts or transactions). They may count or measure information, interpret words or observations in context, or combine "
        "both approaches for one question. Researchers check who the records miss, protect private information and follow consent and participant-protection rules."
    ),
    "questions": [
        "How do family, community, work and public institutions shape people's choices and opportunities?",
        "How do access to resources or influence differ among groups, and how do people respond?",
        "How do shared ways of life, organizations and societies change over time?",
        "What evidence shows whether a public service or community programme reaches the people it was designed to support?",
    ],
    "outputs": [
        "A research question and study plan that name whose information is needed, how it will be gathered and what the study cannot establish.",
        "Organized survey answers, interview accounts, observations, documents or records, handled with appropriate care.",
        "Tables, summaries or comparisons that show patterns and differences in the information collected.",
        "A report explaining what the evidence supports, where it is uncertain and what a reader can reasonably conclude.",
    ],
    "howWorkHappens": [
        "Start with a question about people, groups, institutions or social change.",
        "Choose information that fits the question: a survey (a set of questions asked of people) gathers answers; an interview (a guided conversation) gathers accounts; observation (watching and recording what happens) records activity; document study examines existing texts or records.",
        "Gather and handle information responsibly. Check what participants agreed to, protect private details and consider whose experience may be missing.",
        "Compare the information with the question. Explain what it supports, what remains uncertain and what further evidence may be needed.",
    ],
    "whereProgrammeFits": (
        "Your Sociology programme is one route into the social sciences. Its recorded course themes include social relationships, culture (shared ways of life and meaning), "
        "family, inequality (differences in access to resources, opportunities or influence), crime, social change and research. These give context for the wider field. A "
        "course outcome is a learning goal recorded for a course; it documents programme content, not proof that a student has mastered it."
    ),
}

METHOD_SOURCE_MAP = {
    "domain-item:d078-computational-social-research": ["src:d078-computational-social-science-review-2020", "src:d078-digital-trace-data-2025", "src:d078-esrc-internet-mediated-research"],
    "domain-item:d078-quantitative-approach": ["src:d078-openstax-sociology-research-3e", "src:d078-asa-pvalue-statement"],
    "domain-item:d078-survey-method": ["src:d078-openstax-sociology-research-3e", "src:d078-aapor-survey-best-practices", "src:d078-aapor-transparency-initiative"],
    "domain-item:d078-mixed-methods": ["src:mixed-methods-designs"],
    "domain-item:programme-evaluation-and-theory-of-change": ["src:d078-magenta-book-2026"],
    "domain-item:psychometrics-and-scale-construction": ["src:d078-cosmin-measurement-properties", "src:d078-aera-apa-ncme-testing-standards"],
    "domain-item:longitudinal-panel-and-multilevel-data": ["src:d078-worldbank-dime-longitudinal-panel", "src:d078-worldbank-dime-panel-data-construction", "src:d078-statsmodels-arima", "src:d078-statsmodels-mixedlm"],
    "domain-item:discourse-and-conversation-analysis": ["src:d078-sage-dictionary-discourse-analysis", "src:d078-ucla-conversation-analysis"],
    "domain-item:d078-agent-based-modeling": ["src:abm-empirical-social-research", "src:comses-odd-standards"],
    "domain-item:d078-spatial-social-analysis": ["src:d078-worldbank-rural-accessibility-mapping"],
}

METHOD_COPY = {
    "domain-item:d078-computational-social-research": {
        "meaning": (
            "Computational social research uses computer-run procedures to investigate questions about society. These can include algorithms (precise steps for processing information), statistical models (mathematical descriptions used to estimate patterns) and simulations (computer-run models that apply stated rules to explore what could happen). The procedures may sort or measure information, estimate relationships, or examine what follows from stated interaction rules."
        ),
        "why_it_matters": (
            "This approach can help when a question calls for comparing many survey answers, records, texts or relationships that would be difficult to examine one by one. It is one research approach among several; its usefulness depends on the question, the available information and the checks the researcher can make."
        ),
        "contextual_use": (
            "Digital traces are records created through people's interactions with digital services, such as posts, searches or transactions. For example, a researcher might compare how two online communities discuss an issue, map connections among local organizations, or simulate how stated interaction rules could spread an idea. The first two examine recorded activity; the last explores what the model's rules produce."
        ),
        "learner_output": (
            "A short analysis plan naming the social question, information needed and its source, the computer-run procedure, checks for data quality and fit, privacy steps, and what the result could and could not support."
        ),
        "limitations": [
            "Digital records may leave out people who do not use a service or whose activity is not recorded; a pattern in the available records may not represent everyone.",
            "A simulation shows what follows from its stated rules and assumptions; it does not prove that people behave that way in real life.",
            "A relationship between two measured features does not by itself show that one caused the other.",
            "An online post that appears public may still contain private or identifying details. Check people's expectations, consent where required, platform rules, local law and the responsible institution's ethics process.",
        ],
    },
}


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def field_refs(source_ids: list[str], registry: dict) -> list[dict]:
    return [{"source_id": source_id, **registry[source_id]} for source_id in source_ids]


def write_pair(graph: dict, original_hash: str) -> None:
    json_bytes = (json.dumps(graph, ensure_ascii=False, separators=(",", ":")) + "\n").encode("utf-8")
    with tempfile.NamedTemporaryFile(dir=GRAPH.parent, delete=False) as handle:
        json_temp = Path(handle.name)
        handle.write(json_bytes)
    with tempfile.NamedTemporaryFile(dir=GRAPH_GZ.parent, delete=False) as handle:
        gz_temp = Path(handle.name)
    try:
        with gzip.open(gz_temp, "wt", encoding="utf-8", newline="") as target:
            json.dump(graph, target, ensure_ascii=False, separators=(",", ":"))
        if digest(GRAPH) != original_hash:
            raise SystemExit("Graph changed before save; refusing to overwrite concurrent work")
        os.replace(json_temp, GRAPH)
        os.replace(gz_temp, GRAPH_GZ)
    finally:
        json_temp.unlink(missing_ok=True)
        gz_temp.unlink(missing_ok=True)


def main() -> None:
    before_hash = digest(GRAPH)
    graph = json.loads(GRAPH.read_text(encoding="utf-8"))
    original_node_ids = [node["id"] for node in graph["nodes"]]
    original_edge_ids = [edge.get("id") for edge in graph["edges"]]
    nodes_by_id = {node["id"]: node for node in graph["nodes"]}
    domain = nodes_by_id.get(DOMAIN_ID)
    programme = nodes_by_id.get(PROGRAMME_ID)
    if not domain or not programme:
        raise SystemExit("Expected D078 domain or Sociology programme node missing")
    expected_areas = {area_id for area_id in AREA_COPY}
    actual_areas = {node["id"] for node in graph["nodes"] if node.get("kind") == "area_of_specialization" and node.get("id", "").startswith("area:d078-")}
    if expected_areas != actual_areas:
        raise SystemExit(f"Area scope mismatch: missing={sorted(actual_areas-expected_areas)}, extra={sorted(expected_areas-actual_areas)}")

    registry = graph.setdefault("external_source_registry", {})
    for source_id, record in SOURCES.items():
        prior = registry.get(source_id)
        if prior and prior.get("url") != record["url"] and source_id not in SOURCE_URL_REPAIRS:
            raise SystemExit(f"Source ID collision: {source_id}")
        registry[source_id] = record

    for area_id, content in AREA_COPY.items():
        node = nodes_by_id[area_id]
        node["description"] = content["description"]
        node["overview"] = content["description"]
        node["student_orientation"] = content["orientation"]
        node["orientation_evidence_by_field"] = {
            field: field_refs(source_ids, registry) for field, source_ids in content["fields"].items()
        }
        new_refs = [
            {"source_id": source_id, **registry[source_id]}
            for source_ids in content["fields"].values()
            for source_id in source_ids
        ]
        deduped_refs = {item["source_id"]: item for item in new_refs}
        preserved = [
            item for item in node.get("source_references", [])
            if not isinstance(item, dict) or item.get("source_id") not in deduped_refs
        ]
        node["source_references"] = [*preserved, *deduped_refs.values()]
        refreshed_refs = []
        for item in node.get("source_references", []):
            source_id = item.get("source_id") if isinstance(item, dict) else None
            if source_id in LEGACY_AREA_SOURCE_IDS_TO_REFRESH:
                refreshed_refs.append({"source_id": source_id, **registry[source_id]})
            else:
                refreshed_refs.append(item)
        node["source_references"] = refreshed_refs

    domain["overview"] = DOMAIN_OVERVIEW
    domain["student_orientation"] = DOMAIN_ORIENTATION
    graph["programme_transition"]["domain_overview"] = DOMAIN_OVERVIEW
    graph["programme_transition"]["transfer_summary"] = DOMAIN_TRANSFER
    domain_field_sources = {
        "whatItStudies": ["src:d078-unesco-iscoped-social-sciences", "external:nuc-social-sciences-ccmas-2023", "src:d078-openstax-sociology-research-3e"],
        "whatPeopleDo": ["src:d078-openstax-sociology-research-3e", "src:d078-digital-trace-data-2025", "src:d078-esrc-internet-mediated-research", "src:d078-aapor-survey-best-practices"],
        "questions": ["external:nuc-social-sciences-ccmas-2023", "src:d078-openstax-sociology-research-3e"],
        "outputs": ["src:d078-openstax-sociology-research-3e", "src:d078-aapor-transparency-initiative"],
        "howWorkHappens": ["src:d078-openstax-sociology-research-3e", "src:d078-aapor-survey-best-practices", "src:d078-esrc-internet-mediated-research"],
        "whereProgrammeFits": ["external:nuc-social-sciences-ccmas-2023", "src:d078-openstax-sociology-research-3e"],
    }
    domain["orientation_evidence_by_field"] = {
        field: field_refs(source_ids, registry) for field, source_ids in domain_field_sources.items()
    }
    domain_refs = {source_id: registry[source_id] for source_ids in domain_field_sources.values() for source_id in source_ids}
    existing_domain_refs = {
        item.get("source_id") for item in domain.get("source_references", []) if isinstance(item, dict)
    }
    domain["source_references"] = [
        *domain.get("source_references", []),
        *[{"source_id": source_id, **record} for source_id, record in domain_refs.items() if source_id not in existing_domain_refs],
    ]

    for node_id, source_ids in METHOD_SOURCE_MAP.items():
        node = nodes_by_id.get(node_id)
        if not node:
            raise SystemExit(f"Expected source-backed method item missing: {node_id}")
        for source_id in source_ids:
            if source_id not in registry:
                raise SystemExit(f"Source record not resolved for {node_id}: {source_id}")
        existing_ids = {
            item.get("source_id") for item in node.get("source_references", []) if isinstance(item, dict)
        }
        node["source_references"] = [
            *node.get("source_references", []),
            *[{"source_id": source_id, **registry[source_id]} for source_id in source_ids if source_id not in existing_ids],
        ]
        evidence = node.setdefault("evidence", [])
        existing_evidence_ids = {item.get("source_id") for item in evidence if isinstance(item, dict)}
        for source_id in source_ids:
            if source_id in existing_evidence_ids:
                continue
            evidence.append({
                "source_id": source_id,
                "exact_locator": registry[source_id].get("locator") or registry[source_id].get("supports"),
            })

    for node_id, copy in METHOD_COPY.items():
        node = nodes_by_id.get(node_id)
        if not node:
            raise SystemExit(f"Expected method copy target missing: {node_id}")
        for field, value in copy.items():
            node[field] = value
    programme_refs = [
        {
            "source_id": "external:nuc-social-sciences-ccmas-2023",
            "title": "Social Sciences CCMAS 2023",
            "publisher": "National Universities Commission, Nigeria",
            "url": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf",
            "locator": "Sociology curriculum context: social structures, culture, family, inequality, crime, social change and research; course/outcome rows remain the source of programme-specific claims.",
            "supports": "Nigerian social-science curriculum context; not a claim that every school teaches every topic in the same way.",
            "limits": "National benchmark curriculum; institution-specific course delivery can differ.",
            "accessed": "2026-11-06",
        },
        {
            "source_id": "src:d078-openstax-sociology-research-3e",
            **SOURCES["src:d078-openstax-sociology-research-3e"],
        },
    ]
    old_programme_ids = {item.get("source_id") for item in programme.get("source_references", []) if isinstance(item, dict)}
    programme["source_references"] = [
        *programme.get("source_references", []),
        *[item for item in programme_refs if item["source_id"] not in old_programme_ids],
    ]

    if original_node_ids != [node["id"] for node in graph["nodes"]] or original_edge_ids != [edge.get("id") for edge in graph["edges"]]:
        raise SystemExit("Copy update changed graph nodes, edges or identifiers")
    if digest(GRAPH) != before_hash:
        raise SystemExit("Graph changed while preparing copy update; refusing to overwrite concurrent work")
    write_pair(graph, before_hash)
    print(json.dumps({
        "programme_node_updated": PROGRAMME_ID,
        "domain_node_updated": DOMAIN_ID,
        "area_nodes_updated": len(AREA_COPY),
        "structured_area_orientations": sum(len(content["orientation"]) for content in AREA_COPY.values()),
        "new_source_records": len(SOURCES),
        "node_count": len(original_node_ids),
        "edge_count": len(original_edge_ids),
        "structure_unchanged": True,
        "graph_sha256": digest(GRAPH),
    }, ensure_ascii=True, indent=2))


if __name__ == "__main__":
    main()

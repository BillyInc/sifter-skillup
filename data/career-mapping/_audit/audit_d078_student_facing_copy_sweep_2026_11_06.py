"""Read-only inventory of graph-backed D078 student-facing copy.

Heuristic flags create a human review worklist; they do not certify accuracy,
clarity, or student comprehension.
"""
from __future__ import annotations

import collections
import json
import re
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[3]
GRAPH_PATH = ROOT / "data/career-mapping/_audit/D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json"
UI_PATH = ROOT / "src/data/d078MethodAwareUiData.json"
OUT_JSON = ROOT / "data/career-mapping/_audit/D078_STUDENT_FACING_COPY_SWEEP_2026_11_07.json"
OUT_MD = ROOT / "docs/manual-review/D078_STUDENT_FACING_COPY_SWEEP_2026_11_07.md"
EXPORTER_PATH = ROOT / "data/career-mapping/_audit/export_d078_method_aware_ui_data_2026_10_19.py"
STATIC_FILES = (
    "src/screens/careerIntelligence/D078MethodAwareJourney.tsx",
    "src/components/careerIntelligence/MethodChoicePanel.tsx",
    "src/components/careerIntelligence/D078RelationshipPanel.tsx",
    "src/components/careerIntelligence/LearningResourcesBlock.tsx",
    "src/components/careerIntelligence/DegreeSkills.tsx",
    "src/screens/careerIntelligence/ProgrammeDetailRefinedScreen.tsx",
    "src/screens/careerIntelligence/DomainDetailScreen.tsx",
    "src/screens/careerIntelligence/SubgroupDetailScreen.tsx",
    "src/screens/careerIntelligence/RoleDetailScreen.tsx",
    "src/lib/programmePreview.ts",
)
PROGRAMME_PREVIEW_SOURCE_IDS = [
    "external:nuc-social-sciences-ccmas-2023",
    "src:d078-openstax-sociology-research-3e",
    "src:d078-openstax-sociology-scope-3e",
    "src:d078-esrc-research-consent",
]
AUDIT_ONLY_STATIC_SOURCE_REFERENCES = {
    "audit:jamb-2024-examination-manual": {
        "title": "JAMB 2024 Examination Manual",
        "url": "https://www.jamb.gov.ng/pdfs/2024/2024_EXAMINATION_MANUAL%28updated%29.pdf",
        "locator": "Section 1.0, page 1: defines UTME and identifies JAMB as the conducting Board.",
        "scope": "Supports static programme-page expansion of JAMB and UTME only; not a graph source or route claim.",
    },
    "audit:statsmodels-regression-diagnostics": {
        "title": "Regression Diagnostics",
        "publisher": "statsmodels project documentation",
        "url": "https://www.statsmodels.org/stable/examples/notebooks/generated/regression_diagnostics.html",
        "locator": "Regression diagnostics example: residual patterns, influence, heteroskedasticity and checks of model conditions.",
        "scope": "Supports the general meaning of model diagnostics in the glossary; it is not evidence for any particular relationship-panel route or model choice.",
    },
    "audit:ncbi-odds-ratio": {
        "title": "Odds Ratio",
        "publisher": "NCBI Bookshelf, StatPearls",
        "url": "https://www.ncbi.nlm.nih.gov/books/NBK431098/",
        "locator": "Introduction and clinical overview: an odds ratio compares the odds of an outcome between groups; it is distinct from a ratio of probabilities.",
        "scope": "Supports the plain definition of odds ratio, not a claim about a particular social-science study or causal effect.",
    },
    "audit:r-anova-documentation": {
        "title": "Analysis of Variance Tables and Models",
        "publisher": "R Core Team, R Documentation",
        "url": "https://stat.ethz.ch/R-manual/R-devel/library/stats/html/anova.html",
        "locator": "Description and value sections: analysis-of-variance tables can test model terms; model comparisons require the same data.",
        "scope": "Supports the name and use of ANOVA tables; the student definition summarizes a basic comparison of group averages and is not a full statement of assumptions.",
    },
    "audit:r-fisher-exact-documentation": {
        "title": "Fisher's Exact Test for Count Data",
        "publisher": "R Core Team, R Documentation",
        "url": "https://stat.ethz.ch/R-manual/R-devel/library/stats/html/fisher.test.html",
        "locator": "Details section: for 2-by-2 tables, exact inference uses the hypergeometric distribution conditional on the margins; extensions have their own computational limits.",
        "scope": "Supports Fisher's exact test as an example of exact calculation; not every exact test uses the same conditioning assumptions.",
    },
    "audit:r-chi-square-documentation": {
        "title": "Pearson's Chi-squared Test for Count Data",
        "publisher": "R Core Team, R Documentation",
        "url": "https://stat.ethz.ch/R-manual/R-devel/library/stats/html/chisq.test.html",
        "locator": "Description and details: contingency-table and goodness-of-fit tests compare observed counts under specified null hypotheses and return observed and expected counts.",
        "scope": "Supports the count-comparison explanation; does not determine whether a chi-square test fits a particular dataset.",
    },
    "audit:aapor-best-practices-population": {
        "title": "Best Practices for Survey Research",
        "publisher": "American Association for Public Opinion Research",
        "url": "https://aapor.org/standards-and-ethics/best-practices/",
        "locator": "Designing Your Sample: distinguishes the people who respond (the sample) from the larger population being studied and describes the sampling frame.",
        "scope": "Supports the survey and target-population meanings; it is not a demographic definition for every population-study context.",
    },
    "audit:census-population-demography": {
        "title": "Demography at the U.S. Census Bureau",
        "publisher": "U.S. Census Bureau",
        "url": "https://www.census.gov/newsroom/blogs/research-matters/2012/08/demography-at-the-u-s-census-bureau.html",
        "locator": "Opening definition and discussion of population composition and change through births, deaths and movement.",
        "scope": "Supports the human-population meaning and population-change example; the bureau's geographic definitions are U.S.-specific.",
    },
    "audit:cdc-qualitative-coding": {
        "title": "Collecting and Analyzing Qualitative Data",
        "publisher": "U.S. Centers for Disease Control and Prevention, Field Epidemiology Manual",
        "url": "https://www.cdc.gov/field-epi-manual/php/chapters/qualitative-data.html",
        "locator": "Coding and Analysis Requirements: codes label sections of text for retrieval and comparison; a codebook records definitions and application rules.",
        "scope": "Supports qualitative coding and codebook wording; the chapter is an applied field-epidemiology guide, not the only valid qualitative approach.",
    },
    "audit:python-tutorial-programming-code": {
        "title": "The Python Tutorial",
        "publisher": "Python Software Foundation",
        "url": "https://docs.python.org/3/tutorial/",
        "locator": "Sections 2–4: source-code examples, statements, control flow and functions that a Python interpreter executes.",
        "scope": "Supports the computing sense of programming code as executable instructions; it is not evidence for qualitative coding.",
    },
    "audit:openstax-experimental-research": {
        "title": "Approaches to Research",
        "publisher": "OpenStax, Psychology 2e",
        "url": "https://openstax.org/books/psychology-2e/pages/2-2-approaches-to-research",
        "locator": "Research-method overview: contrasts observation and survey approaches with experiments that deliberately vary conditions.",
        "scope": "Supports the research-design sense of experimental; it does not imply that every experiment supports the same causal claim.",
    },
    "audit:networkx-nodes-edges": {
        "title": "Introduction to NetworkX",
        "publisher": "NetworkX documentation",
        "url": "https://networkx.org/documentation/stable/reference/introduction.html",
        "locator": "Nodes and Edges section: graph nodes represent entities and edges connect node pairs; edges can carry attributes such as weights.",
        "scope": "Supports the graph-structure sense of nodes and edges; a graph edge does not automatically prove a real-world relationship.",
    },
    "audit:r-rank-ties": {
        "title": "Sample Ranks",
        "publisher": "R Core Team, R Documentation",
        "url": "https://stat.ethz.ch/R-manual/R-patched/library/base/html/rank.html",
        "locator": "Description and examples: tied values receive ranks under the selected tie-handling rule.",
        "scope": "Supports the statistical meaning of tied ranks; it does not choose a rank-correlation method for a study.",
    },
    "audit:r-cor-test-ties": {
        "title": "Test for Association/Correlation Between Paired Samples",
        "publisher": "R Core Team, R Documentation",
        "url": "https://stat.ethz.ch/R-manual/R-devel/library/stats/html/cor.test.html",
        "locator": "Details: Kendall and Spearman rank tests have specific exact-p-value behavior when ties occur.",
        "scope": "Supports the limit attached to tied ranks; it does not define a social-network tie.",
    },
    "audit:scikit-learn-probability-calibration": {
        "title": "Probability Calibration",
        "publisher": "scikit-learn documentation",
        "url": "https://scikit-learn.org/stable/modules/calibration.html",
        "locator": "Sections 1.16–1.16.1: compares predicted probabilities with observed outcome frequencies and discusses calibration curves.",
        "scope": "Supports model-probability calibration; it is not evidence that a model is otherwise valid or useful.",
    },
    "audit:aapor-survey-weighting": {
        "title": "Standards and Ethics",
        "publisher": "American Association for Public Opinion Research",
        "url": "https://aapor.org/standards-and-ethics/",
        "locator": "Definition of weighting: adjusts respondents' relative contributions to more closely match population characteristics.",
        "scope": "Supports the survey-weighting sense of calibration; adjustment does not automatically correct coverage or measurement error.",
    },
    "audit:esri-gis-definition": {
        "title": "GIS Dictionary: GIS",
        "publisher": "Esri Support",
        "url": "https://support.esri.com/en-us/gis-dictionary/gis",
        "locator": "GIS definition: an integrated system of software and data for managing, analyzing and displaying information about geographic places.",
        "scope": "Supports GIS as a location-linked information system; it is a vendor's domain definition, not an independent validation of any mapped result.",
    },
    "audit:cdc-evaluation-framework-2024": {
        "title": "CDC Program Evaluation Framework, 2024",
        "publisher": "U.S. Centers for Disease Control and Prevention, MMWR",
        "url": "https://www.cdc.gov/mmwr/volumes/73/rr/rr7306a1.htm",
        "locator": "Sections on process, outcome and impact evaluation; theory of change and logic models; counterfactuals; and experimental, quasi-experimental and observational designs.",
        "scope": "Supports distinctions among evaluation purposes and the limits of causal claims; the framework is guidance, not a claim that every evaluation uses one design.",
    },
    "audit:cdc-evaluation-step4-credible-evidence": {
        "title": "Step 4 – Gather Credible Evidence",
        "publisher": "U.S. Centers for Disease Control and Prevention, Program Evaluation Framework Action Guide",
        "url": "https://www.cdc.gov/evaluation/php/evaluation-framework-action-guide/step-4-gather-credible-evidence.html",
        "locator": "Sections 'Choose Appropriate methods', 'Identify Relevant Indicators', and 'Determine Appropriate Data Sources, Data Quantity, and Data Quality'.",
        "scope": "Supports the role and limits of qualitative and quantitative data, validity and reliability, constructs and measures, and evaluation evidence planning; examples are from programme evaluation.",
    },
    "audit:openstax-sociology-research-methods-3e": {
        "title": "2.2 Research Methods – Introduction to Sociology 3e",
        "publisher": "OpenStax",
        "url": "https://openstax.org/books/introduction-sociology-3e/pages/2-2-research-methods",
        "locator": "Sections on surveys, samples, quantitative and qualitative responses, interviews and field research.",
        "scope": "Supports introductory social-science examples and distinctions; descriptions are not universal rules for every discipline or research question.",
    },
    "audit:worldbank-dime-measurement": {
        "title": "Chapter 3: Establishing a Measurement Framework",
        "publisher": "World Bank DIME Analytics Data Handbook",
        "url": "https://worldbank.github.io/dime-data-handbook/measurement.html",
        "locator": "Opening section: connect the research question and design to data requirements, sources, structure and documentation.",
        "scope": "Supports measurement planning and linking recorded information to the study question; the handbook focuses on development research practice.",
    },
    "audit:nist-ai-glossary": {
        "title": "The Language of Trustworthy AI: An In-Depth Glossary of Terms",
        "publisher": "U.S. National Institute of Standards and Technology",
        "url": "https://www.nist.gov/publications/language-trustworthy-ai-depth-glossary-terms",
        "locator": "NIST AI 100-3 glossary; definition of artificial intelligence and machine learning must be read in the source-document context.",
        "scope": "Supports introductory AI and machine-learning terminology; definitions vary by purpose and context, and the glossary is not a social-science research-method standard.",
    },
    "audit:nist-generative-ai-profile": {
        "title": "Artificial Intelligence Risk Management Framework: Generative Artificial Intelligence Profile",
        "publisher": "U.S. National Institute of Standards and Technology",
        "url": "https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf",
        "locator": "Section 2.2: generative models can produce fluent but false or inconsistent outputs; profiles describe risk-management considerations.",
        "scope": "Supports the limitation attached to generated language; it does not show that every model fails in every use.",
    },
    "audit:nist-ai-rmf-measure": {
        "title": "AI RMF Playbook: Measure",
        "publisher": "U.S. National Institute of Standards and Technology, AI Resource Center",
        "url": "https://airc.nist.gov/airmf-resources/playbook/measure/",
        "locator": "Measure function: validate systems for intended conditions, document limits to generalization, and evaluate validity and reliability.",
        "scope": "Supports the need to test AI systems in their intended context; it is voluntary United States risk guidance, not Nigerian law.",
    },
    "audit:nist-supervised-learning": {
        "title": "Supervised Learning – Glossary",
        "publisher": "U.S. National Institute of Standards and Technology, Computer Security Resource Center",
        "url": "https://csrc.nist.gov/glossary/term/supervised_learning",
        "locator": "Definition: a machine-learning model learns to predict explicit labels or output values from data.",
        "scope": "Supports label-based machine-learning terminology; not all machine learning is supervised or a classification task.",
    },
    "audit:nist-p-value": {
        "title": "P-value – Glossary",
        "publisher": "U.S. National Institute of Standards and Technology, Computer Security Resource Center",
        "url": "https://csrc.nist.gov/glossary/term/p_value",
        "locator": "Definition: under the null hypothesis, probability of a test statistic at least as extreme as the observed value.",
        "scope": "Supports the statistical meaning of p-value; NIST's glossary context is statistical testing, not a claim about a particular social-science design.",
    },
    "audit:openstax-hypothesis-testing": {
        "title": "Chapter 9 Review: Hypothesis Testing",
        "publisher": "OpenStax, Introductory Statistics 2e",
        "url": "https://openstax.org/books/introductory-statistics-2e/pages/9-chapter-review",
        "locator": "Sections 9.1–9.5: competing hypotheses, sample evidence, reject/do-not-reject decisions, test statistics, p-values, preselected alpha and the warning not to call a claim proven.",
        "scope": "Supports introductory hypothesis-testing language and its limits; its textbook examples are not a substitute for method-specific assumptions.",
    },
    "audit:openstax-chi-square": {
        "title": "11.5 Comparison of the Chi-Square Tests",
        "publisher": "OpenStax, Introductory Statistics 2e",
        "url": "https://openstax.org/books/introductory-statistics-2e/pages/11-5-comparison-of-the-chi-square-tests",
        "locator": "Distinguishes goodness-of-fit, independence and homogeneity tests and their different questions.",
        "scope": "Supports the distinction among common chi-square procedures; data requirements and assumptions must still be checked for the selected test.",
    },
    "audit:openstax-regression-correlation": {
        "title": "12.3 The Regression Equation",
        "publisher": "OpenStax, Introductory Statistics 2e",
        "url": "https://openstax.org/books/introductory-statistics-2e/pages/12-3-the-regression-equation",
        "locator": "Sections on the least-squares regression line, residuals, correlation, prediction limits and the warning that correlation does not establish cause.",
        "scope": "Supports introductory linear-regression and correlation explanations; it does not define every regression model.",
    },
    "audit:openstax-anova": {
        "title": "13.2 The F Distribution and the F-Ratio",
        "publisher": "OpenStax, Introductory Statistics 2e",
        "url": "https://openstax.org/books/introductory-statistics/pages/13-chapter-review",
        "locator": "Explains the F-ratio and comparison of between-group and within-group variation in one-way ANOVA.",
        "scope": "Supports the introductory one-way ANOVA definition; it does not imply that ANOVA applies to every group comparison or that it identifies which groups differ.",
    },
    "audit:openstax-standard-error": {
        "title": "7.1 The Central Limit Theorem for Sample Means",
        "publisher": "OpenStax, Introductory Statistics 2e",
        "url": "https://openstax.org/books/introductory-statistics-2e/pages/7-1-the-central-limit-theorem-for-sample-means-averages",
        "locator": "Explains that repeatedly selected groups produce a distribution of averages and defines the standard error of the mean as its standard deviation.",
        "scope": "Supports the repeated-sample meaning of standard error; other estimators have their own standard-error calculations.",
    },
    "audit:openstax-variance": {
        "title": "2.7 Measures of the Spread of the Data",
        "publisher": "OpenStax, Introductory Statistics",
        "url": "https://openstax.org/books/introductory-statistics/pages/2-7-measures-of-the-spread-of-the-data",
        "locator": "Defines variance as the average squared deviation from the mean and distinguishes population from sample calculations.",
        "scope": "Supports the introductory meaning of variance; the exact calculation differs for a full population and a sample.",
    },
    "audit:r-cor-test-association": {
        "title": "Test for Association/Correlation Between Paired Samples",
        "publisher": "R Core Team, R Documentation",
        "url": "https://stat.ethz.ch/R-manual/R-devel/library/stats/html/cor.test.html",
        "locator": "Description and Details: Pearson, Kendall and Spearman methods measure paired-sample association differently; the document states method-specific assumptions and inference behavior.",
        "scope": "Supports distinctions among correlation procedures; it does not select a coefficient for a particular social-science question.",
    },
    "audit:r-lm-documentation": {
        "title": "Fitting Linear Models",
        "publisher": "R Core Team, R Documentation",
        "url": "https://stat.ethz.ch/R-manual/R-devel/library/stats/html/lm.html",
        "locator": "Description and Value: linear models can be fitted for regression; returned objects include fitted values and residuals.",
        "scope": "Supports the software and model-family meaning of linear regression; it is not a general definition of all regression methods.",
    },
    "audit:penn-state-logistic-regression": {
        "title": "Weighted Least Squares & Logistic Regressions – STAT 501",
        "publisher": "Penn State Eberly College of Science",
        "url": "https://online.stat.psu.edu/stat501/Lesson13",
        "locator": "Sections on logistic regression, odds, log odds and odds ratios; a binary response is modelled through its log odds.",
        "scope": "Supports introductory binary-logistic-regression and odds-ratio definitions; it does not imply a causal interpretation.",
    },
    "audit:scikit-learn-data-leakage": {
        "title": "Common Pitfalls and Recommended Practices",
        "publisher": "scikit-learn documentation",
        "url": "https://scikit-learn.org/stable/common_pitfalls",
        "locator": "Section 12.2: definition of data leakage and the requirement to keep test data out of model fitting, preprocessing and model-choice decisions.",
        "scope": "Supports the role of training/test separation and leakage prevention in predictive modelling; it does not assess a model's substantive validity or fairness.",
    },
    "audit:annual-review-computational-social-science": {
        "title": "Computational Social Science and Sociology",
        "publisher": "Annual Review of Sociology",
        "url": "https://www.annualreviews.org/doi/pdf/10.1146/annurev-soc-121919-054621",
        "locator": "Opening definition and field history: computational social science draws on computational methods and digitalized sources, including social-media and administrative records; its scope spans distinct intellectual traditions.",
        "scope": "Supports field-level terminology and examples, not a claim that the field has one universally settled boundary or that large datasets guarantee valid conclusions.",
    },
    "audit:comses-abm-faq": {
        "title": "Frequently Asked Questions: Agent-based Modeling",
        "publisher": "Network for Computational Modeling in the Social and Ecological Sciences (CoMSES Net)",
        "url": "https://www.comses.net/about/faq/",
        "locator": "Agent-based modeling questions: agents interact under modeled rules; the FAQ discusses suitable questions, model limits, model checking, documentation and common software frameworks.",
        "scope": "Supports introductory ABM meaning and limits in social research; it is community guidance, not proof that a particular model is empirically valid.",
    },
    "audit:comses-odd-standards": {
        "title": "Standards: ODD Protocol",
        "publisher": "CoMSES Net",
        "url": "https://www.comses.net/resources/standards/",
        "locator": "Documentation Standards: ODD means Overview, Design concepts, Details and is a protocol for describing agent-based models.",
        "scope": "Supports what ODD documents; following a documentation format does not validate a model.",
    },
    "audit:ibm-spss-docs": {
        "title": "IBM SPSS Statistics Documentation",
        "publisher": "IBM",
        "url": "https://www.ibm.com/docs/en/spss-statistics/32.0.0",
        "locator": "Getting Started: statistical-analysis software with descriptive statistics, hypothesis testing, predictive analytics, data management and visualization.",
        "scope": "Supports what SPSS is and examples of its software capabilities; product documentation does not determine whether an analysis suits a research question.",
    },
    "audit:kobotoolbox-collection": {
        "title": "Data Collection with KoboToolbox",
        "publisher": "KoboToolbox documentation",
        "url": "https://support.kobotoolbox.org/data-collection-tools.html",
        "locator": "Distinguishes browser-based web forms from the Android KoboCollect app and describes the conditions for offline collection.",
        "scope": "Supports the platform and collection-mode descriptions; offline use requires preparing the relevant form/device as documented.",
    },
    "audit:ukds-transcription": {
        "title": "Managing and Sharing Data: Best Practice for Researchers",
        "publisher": "UK Data Service",
        "url": "https://dam.ukdataservice.ac.uk/media/622417/managingsharing.pdf",
        "locator": "Transcription section: transcription converts audio recordings to text; conventions should match analytic aims and be applied consistently.",
        "scope": "Supports transcription in qualitative research and the effect of conventions on what a transcript preserves; it is research data-management guidance.",
    },
    "audit:ukds-codebook": {
        "title": "Data Skills Glossary: Codebook",
        "publisher": "UK Data Service",
        "url": "https://trainingmodules.ukdataservice.ac.uk/",
        "locator": "Codebook entry: describes the contents, structure and layout of a data collection.",
        "scope": "Supports the dataset documentation sense; qualitative codebooks that define labels are a related, context-specific use.",
    },
    "audit:cdc-prevalence": {
        "title": "Principles of Epidemiology, Lesson 3, Section 2: Prevalence",
        "publisher": "U.S. Centers for Disease Control and Prevention",
        "url": "https://archive.cdc.gov/www_cdc_gov/csels/dsepd/ss1978/lesson3/section2.html",
        "locator": "Definition of prevalence: proportion of a defined population with an attribute at a point or during a stated period; distinguishes existing cases from new cases.",
        "scope": "Supports the denominator and time-bound meaning of prevalence; examples are epidemiological and should not be read as disease-specific guidance for social research.",
    },
    "audit:psychometric-society": {
        "title": "What Is Psychometrics?",
        "publisher": "Psychometric Society",
        "url": "https://www.psychometricsociety.org/what-psychometrics",
        "locator": "Opening definition: construction of assessment and measurement instruments and models linking observable responses to theoretical attributes.",
        "scope": "Supports the field meaning of psychometrics; it does not imply that every questionnaire is a validated psychological test.",
    },
    "audit:apa-testing-assessment": {
        "title": "Testing, Assessment, and Measurement",
        "publisher": "American Psychological Association",
        "url": "https://www.apa.org/topics/testing-assessment-measurement",
        "locator": "Psychological tests section: standardized instruments measure behavior or mental attributes; research and other uses require context-appropriate interpretation.",
        "scope": "Supports the relationship between psychometric tests and measured attributes; clinical diagnosis is not implied for general social-science research.",
    },
    "audit:ncrm-social-network-analysis": {
        "title": "Social Network Analysis and Social Phenomena",
        "publisher": "National Centre for Research Methods",
        "url": "https://www.ncrm.ac.uk/training/show.php?article=15022",
        "locator": "Course description and learning outcomes: network positions and structures help investigate social ties, information or behaviour spread, and access to resources.",
        "scope": "Supports social-network-analysis examples; the course description is not a universal model-selection rule.",
    },
    "audit:openstax-statistical-inference": {
        "title": "9. Introduction: Inference for Single Population Parameters",
        "publisher": "OpenStax, Introductory Statistics",
        "url": "https://openstax.org/books/introductory-statistics/pages/9-introduction",
        "locator": "Opening: statisticians use samples to make inferences about populations and assess claims using evidence and test assumptions.",
        "scope": "Supports the introductory sample-to-population meaning of statistical inference; conclusions depend on study design and sampling conditions.",
    },
    "audit:r-arima-time-series": {
        "title": "ARIMA Modelling of Time Series",
        "publisher": "R Core Team, R Documentation",
        "url": "https://stat.ethz.ch/R-manual/R-devel/library/stats/html/arima.html",
        "locator": "Description, arguments and examples: fitting ARIMA models to ordered series and producing forecasts from the fitted model.",
        "scope": "Supports the time-series forecasting example; it does not imply that an ARIMA model fits every series or yields certain future values.",
    },
    "audit:otexts-forecasting": {
        "title": "Forecasting: Principles and Practice, 3rd edition",
        "publisher": "Rob J Hyndman and George Athanasopoulos, OTexts",
        "url": "https://otexts.com/fpp3/intro.html",
        "locator": "Sections 1.1–1.3: forecasts are estimates of future values based on available information; prediction intervals communicate uncertainty and some outcomes cannot be forecast accurately.",
        "scope": "Supports the general meaning of forecast and its uncertainty; method choice and forecast accuracy depend on the data, question and evaluation.",
    },
    "audit:cdc-codebook": {
        "title": "Practical Strategies for Qualitative Analysis in Health Equity Research",
        "publisher": "U.S. Centers for Disease Control and Prevention, Preventing Chronic Disease",
        "url": "https://www.cdc.gov/pcd/issues/2022/22_0134.htm",
        "locator": "Table 1, Codebook: describes code names, definitions, when to use or not use them, and example quotations; the article also distinguishes codes from themes.",
        "scope": "Supports the qualitative-analysis codebook meaning; the article is an applied health-equity example, not a universal coding method.",
    },
    "audit:samhsa-codebook": {
        "title": "What Is a Codebook?",
        "publisher": "Substance Abuse and Mental Health Services Administration, CBHSQ Data",
        "url": "https://www.samhsa.gov/data/get-help/codebooks/what-codebook",
        "locator": "Opening explanation: a codebook describes the structure, contents and layout of a data file and explains its recorded codes.",
        "scope": "Supports the dataset-documentation meaning of codebook; it does not describe qualitative-analysis codebooks.",
    },
    "audit:openstax-content-analysis": {
        "title": "2.2 Research Methods, Introduction to Sociology 2e",
        "publisher": "OpenStax",
        "url": "https://openstax.org/books/introduction-sociology-2e/pages/2-2-research-methods",
        "locator": "Content analysis section: a systematic approach to recording and evaluating information in existing sources in relation to the study question.",
        "scope": "Supports an introductory definition of content analysis; current approaches can be qualitative, quantitative or combined and require a method suited to the question.",
    },
    "audit:openstax-case-study": {
        "title": "2.2 Research Methods, Introduction to Sociology 3e",
        "publisher": "OpenStax",
        "url": "https://openstax.org/books/introduction-sociology-3e/pages/2-2-research-methods",
        "locator": "Case Study section: an in-depth analysis of a defined person, event or situation drawing on sources such as documents, interviews and observation; discussion notes the limits of generalizing from one case.",
        "scope": "Supports an introductory social-science case-study explanation; case study designs can include one or multiple cases and use different evidence sources.",
    },
    "audit:cosmin-manual": {
        "title": "COSMIN Manual for Systematic Reviews of PROMs",
        "publisher": "COSMIN initiative",
        "url": "https://www.cosmin.nl/wp-content/uploads/COSMIN-manual-V2_final.pdf",
        "locator": "Figure 1.1 and measurement-property sections: instrument evaluation includes content validity, structural validity, reliability, measurement error, construct validity and responsiveness; each property calls for appropriate evidence.",
        "scope": "Supports the sequence of developing and evaluating measurement instruments, especially health-related patient-reported measures; adapt concepts to the intended social-science construct and population.",
    },
    "audit:qgis-user-guide": {
        "title": "QGIS User Guide: Getting Started",
        "publisher": "QGIS Association",
        "url": "https://docs.qgis.org/3.44/en/docs/user_manual/introduction/getting_started.html",
        "locator": "Opening section: QGIS is free and open-source software; the guide demonstrates geographic data, map layers and spatial work.",
        "scope": "Supports the software identity and mapping capabilities; it is product documentation, not evidence that a particular spatial analysis is suitable.",
    },
    "audit:stata-multilevel": {
        "title": "Multilevel Mixed-Effects Models",
        "publisher": "StataCorp",
        "url": "https://www.stata.com/features/overview/multilevel-mixed-effects-models/",
        "locator": "Opening section: nested or crossed groups can make observations within the same group related; models account for that clustering and may include multiple levels.",
        "scope": "Supports the data-structure and modeling explanation; it is software documentation, and the grouping and model assumptions still need to match the study.",
    },
    "audit:casevo-preprint": {
        "title": "Casevo: A Cognitive Agents and Social Evolution Simulator",
        "publisher": "arXiv preprint",
        "url": "https://arxiv.org/abs/2412.19498",
        "locator": "Abstract: introduces Casevo as a multi-agent simulation framework integrating large language models to represent agents and explore social phenomena; the paper demonstrates a debate example.",
        "scope": "Supports the framework name and intended function; a preprint and demonstration do not establish that simulated agents reproduce real populations or predict actual behavior.",
    },
    "audit:casevo-github": {
        "title": "Casevo: Cognitive Agents and Social Evolution Simulator",
        "publisher": "rgCASS project repository",
        "url": "https://github.com/rgCASS/casevo",
        "locator": "README introduction and license: describes Casevo as an open-source Python framework for multi-agent social-simulation experiments and applications on complex networks.",
        "scope": "Supports the software's current project description and availability; repository claims are not independent validation of model behavior.",
    },
    "audit:fsa-social-research-methods": {
        "title": "Qualitative Methods: Document Analysis and Fieldwork Guidance",
        "publisher": "UK Food Standards Agency, Advisory Committee for Social Science",
        "url": "https://acss.food.gov.uk/QAT5",
        "locator": "Sections 5.1.5.2–5.1.5.3: document analysis uses existing material as evidence; qualitative fieldwork guidance discusses field notes, recording and transcription.",
        "scope": "Supports government social-research examples of document analysis and field notes; recommendations are context guidance, not a universal method prescription.",
    },
    "audit:ucla-conversation-analysis": {
        "title": "Conversation Analysis",
        "publisher": "UCLA Department of Sociology",
        "url": "https://soc.ucla.edu/graduate-study/working-groups/conversation-analysis/",
        "locator": "Opening description: close, sequential analysis of naturally occurring interaction using audio/video recordings, transcripts and annotation.",
        "scope": "Supports the conversation-analysis method description; the example emphasizes talk and interaction but does not represent every CA study in full.",
    },
    "audit:esri-spatial-analysis": {
        "title": "GIS Dictionary: Spatial Analysis",
        "publisher": "Esri Support",
        "url": "https://support.esri.com/en-us/gis-dictionary/spatial-analysis",
        "locator": "Spatial analysis definition: examining locations, attributes, patterns and relationships in spatial data to answer questions or gain knowledge.",
        "scope": "Supports the general method meaning; it is a vendor glossary, and particular tools or interpretations require separate justification.",
    },
    "audit:openstax-probability": {
        "title": "Chapter 3 Key Terms, Introductory Statistics 2e",
        "publisher": "OpenStax",
        "url": "https://openstax.org/books/introductory-statistics-2e/pages/3-key-terms",
        "locator": "Probability entry: a number from zero to one inclusive describing the likelihood of a specific event under the stated setup.",
        "scope": "Supports an introductory probability definition; a probability statement still depends on what event and conditions have been defined.",
    },
    "audit:stanford-nlp": {
        "title": "What Is Natural Language Processing?",
        "publisher": "Stanford Institute for Human-Centered Artificial Intelligence",
        "url": "https://hai.stanford.edu/ai-definitions/what-is-nlp",
        "locator": "Opening definition and examples: computer methods process text and speech for tasks such as sentiment analysis, translation and information extraction.",
        "scope": "Supports NLP as computer methods for language tasks; student copy avoids implying that software understands language as people do and retains the need to check outputs.",
    },
    "audit:mdn-api": {
        "title": "API Glossary",
        "publisher": "MDN Web Docs",
        "url": "https://developer.mozilla.org/en-US/docs/Glossary/API",
        "locator": "Opening definition: a software interface sets features and rules that allow software programs to interact, distinct from a human user interface.",
        "scope": "Supports the general software-interface meaning; web APIs are one type and may impose their own access and data-use conditions.",
    },
    "audit:stata-panel-manual": {
        "title": "Longitudinal Data/Panel Data Reference Manual",
        "publisher": "StataCorp",
        "url": "https://www.stata.com/manuals/xt.pdf",
        "locator": "xtset section: panel observations can be ordered by time; example follows the same people in repeated surveys over several years.",
        "scope": "Supports the panel-data example of repeated observations over time; longitudinal designs can also follow other units and may have uneven observation schedules.",
    },
    "audit:nbs-about": {
        "title": "About the National Bureau of Statistics",
        "publisher": "National Bureau of Statistics, Nigeria",
        "url": "https://www.nigerianstat.gov.ng/page/about-us/",
        "locator": "Opening description: NBS is Nigeria's apex statistical agency and coordinates production of official statistics across the National Statistical System.",
        "scope": "Supports the Nigerian agency name and national statistical role; current agency leadership or operational details are outside this definition.",
    },
    "audit:aapor-standard-definitions": {
        "title": "Standard Definitions: Final Dispositions of Case Codes and Outcome Rates for Surveys",
        "publisher": "American Association for Public Opinion Research",
        "url": "https://aapor.org/standards-and-ethics/standard-definitions/",
        "locator": "Background section: nonresponse effect occurs when sampled nonrespondents differ from respondents in ways relevant to the survey objectives; response rate alone does not establish the amount of bias.",
        "scope": "Supports survey nonresponse and bias wording; conclusions depend on the estimate, variables and study design, not the response rate alone.",
    },
    "audit:esco-official": {
        "title": "European Skills, Competences, Qualifications and Occupations",
        "publisher": "European Commission",
        "url": "https://esco.ec.europa.eu/en",
        "locator": "What is ESCO: a multilingual classification that categorizes skills, competences and occupations and records relationships among concepts for European employment and education contexts.",
        "scope": "Supports the name and purpose of the European reference system; ESCO is not a universal or Nigeria-specific job taxonomy.",
    },
    "audit:oecd-ria": {
        "title": "Best Practice Principles for Regulatory Impact Analysis",
        "publisher": "Organisation for Economic Co-operation and Development",
        "url": "https://www.oecd.org/en/publications/regulatory-impact-assessment_7a9638cb-en/full-report/component-5.html",
        "locator": "Box 2.2: RIA identifies the problem and objective, considers feasible regulatory and non-regulatory alternatives, assesses expected costs and benefits, and plans monitoring and evaluation.",
        "scope": "Supports a general RIA explanation; this OECD guidance is not Nigerian law and RIA practice varies by jurisdiction.",
    },
    "audit:nist-algorithm": {
        "title": "Algorithm Glossary",
        "publisher": "U.S. National Institute of Standards and Technology, CSRC",
        "url": "https://csrc.nist.gov/glossary/term/algorithm",
        "locator": "Definition: a clearly specified mathematical process for computation, or rules that yield a prescribed result when followed.",
        "scope": "Supports a general computing definition; algorithms can be carried out by people as well as computers, so student copy specifies the computer context where relevant.",
    },
    "audit:stata-probit": {
        "title": "Probit Regression",
        "publisher": "StataCorp",
        "url": "https://www.stata.com/manuals/rprobit.pdf",
        "locator": "Description: models a binary outcome probability through the cumulative distribution function of a standard normal variable.",
        "scope": "Supports the binary probit definition; interpretation and assumptions are model-specific and do not imply causation.",
    },
    "audit:ons-cognitive-testing": {
        "title": "Cognitive Testing of Census Questions",
        "publisher": "Office for National Statistics, United Kingdom",
        "url": "https://www.ons.gov.uk/economy/investmentspensionsandtrusts/articles/ukpensionsurveys/redevelopmentand2019results",
        "locator": "Cognitive testing section: asks potential respondents how they understand and answer questionnaire items and uses findings to revise wording and guidance.",
        "scope": "Supports cognitive testing as a questionnaire-development technique; the example is a UK pension survey and its test design is context-specific.",
    },
    "audit:imf-gdp": {
        "title": "Gross Domestic Product: An Economy's All",
        "publisher": "International Monetary Fund, Finance & Development",
        "url": "https://www.imf.org/en/publications/fandd/issues/series/back-to-basics/gross-domestic-product-gdp",
        "locator": "Measuring GDP: value of final goods and services produced within a country's borders during a stated period; unpaid household work and some other activity are outside measured GDP.",
        "scope": "Supports the basic production and boundary definition; GDP is a measure of economic output, not a complete measure of wellbeing.",
    },
    "audit:govuk-focus-groups": {
        "title": "Focus Group Study: Qualitative Studies",
        "publisher": "Office for Health Improvement and Disparities, GOV.UK",
        "url": "https://www.gov.uk/guidance/focus-group-study-qualitative-studies",
        "locator": "Opening and use sections: focus groups are facilitated discussions used to understand views and experiences; interaction can surface shared or differing views.",
        "scope": "Supports the basic method and purpose; the guidance concerns digital-health evaluation and does not imply that focus groups produce representative estimates.",
    },
    "audit:openstax-statistics-terms": {
        "title": "1.1 Definitions of Statistics, Probability, and Key Terms",
        "publisher": "OpenStax, Introductory Statistics 2e",
        "url": "https://openstax.org/books/introductory-statistics-2e/pages/1-1-definitions-of-statistics-probability-and-key-terms",
        "locator": "Key terms define a variable as a characteristic of interest and a parameter as a numerical characteristic of a population; examples distinguish population parameters from sample statistics.",
        "scope": "Supports introductory statistical meanings; terms such as variable and parameter can have other meanings in non-statistical contexts.",
    },
    "audit:sage-logistic-separation": {
        "title": "A Warning on Separation in Multinomial Logistic Models",
        "publisher": "SAGE Journals",
        "url": "https://journals.sagepub.com/doi/10.1177/2053168018769510",
        "locator": "Opening definition: separation occurs when one or more predictors correctly classify every observation; under complete separation, standard likelihood estimates may not exist and can tend toward infinity.",
        "scope": "Supports separation in logistic models and its estimation warning; the paper focuses on multinomial models, while the underlying separation issue also occurs in binary logistic regression.",
    },
    "audit:cdc-confounding": {
        "title": "Analyzing and Interpreting Data",
        "publisher": "U.S. Centers for Disease Control and Prevention, Field Epidemiology Manual",
        "url": "https://www.cdc.gov/field-epi-manual/php/chapters/analyze-interpret-data.html",
        "locator": "Confounding section: a third factor distorts an exposure–outcome association when it is associated with the outcome independently of exposure and is also associated with exposure without being caused by it.",
        "scope": "Supports the causal and statistical meaning of confounding; the examples are epidemiological, and confounding definitions can be formalized differently across causal frameworks.",
    },
    "audit:govuk-ethnographic-study": {
        "title": "Ethnographic Study: Qualitative Studies",
        "publisher": "GOV.UK, Office for Health Improvement and Disparities",
        "url": "https://www.gov.uk/guidance/ethnographic-study-qualitative-studies",
        "locator": "Opening and reflexivity sections: ethnography studies practices in context using methods such as observation, field notes, conversations, interviews and documents; researchers examine how their own involvement shapes interpretation.",
        "scope": "Supports a flexible, context-based description and reflexivity; this is applied health-research guidance, not a claim that every ethnography uses all listed methods.",
    },
    "audit:psychopy-getting-started": {
        "title": "Getting Started",
        "publisher": "PsychoPy documentation",
        "url": "https://psychopy.org/gettingStarted.html",
        "locator": "Builder and Coder sections: the graphical Builder creates psychology experiments and can generate Python code; the Coder allows programming and customization.",
        "scope": "Supports PsychoPy as software for creating and running psychology experiments; it does not establish that a particular task has valid measures or suitable timing for every study.",
    },
    "audit:arcgis-spatial-analysis": {
        "title": "Spatial Analysis in ArcGIS Pro",
        "publisher": "Esri documentation",
        "url": "https://pro.arcgis.com/en/pro-app/3.0/help/analysis/introduction/spatial-analysis-in-arcgis-pro.htm",
        "locator": "Opening and workflow sections: spatial analysis studies location-based characteristics and relationships, detects patterns and trends, and starts by framing a question and preparing geographic data.",
        "scope": "Supports ArcGIS Pro's spatial-analysis capabilities and an example workflow; it is product documentation and does not prove that a particular analysis or result is appropriate.",
    },
    "audit:geoda-spatial-autocorrelation": {
        "title": "GeoDa Glossary: Spatial Autocorrelation",
        "publisher": "GeoDa Center for Geospatial Analysis and Computation",
        "url": "https://geodacenter.github.io/glossary/",
        "locator": "Spatial Autocorrelation entry: correlation of a variable with itself across space; positive values indicate similar neighboring values and negative values indicate spatial outliers under a defined spatial-weights structure.",
        "scope": "Supports the spatial-statistical meaning and dependence on how neighbors are defined; a detected pattern does not explain its cause.",
    },
    "audit:bcu-critical-discourse-analysis": {
        "title": "Critical Discourse Analysis",
        "publisher": "Birmingham City University Open Access repository; chapter in The Routledge Handbook of English Language and the Digital Humanities",
        "url": "https://www.open-access.bcu.ac.uk/11696/",
        "locator": "Abstract: critical discourse analysis studies language in relation to social problems and power; the chapter describes both close reading and combining computational corpus analysis with qualitative interpretation.",
        "scope": "Supports the purpose and broad family of approaches; CDA is not one fixed coding procedure, and the chapter's examples concern language and digital humanities.",
    },
    "audit:uconn-historical-research": {
        "title": "Historical Research",
        "publisher": "University of Connecticut, Neag School of Education",
        "url": "https://researchbasics.education.uconn.edu/historical_research/",
        "locator": "Overview: historical research uses evidence about the past and evaluates primary and secondary sources, including their authenticity and accuracy.",
        "scope": "Supports the introductory method and source-criticism wording; the page is an educational overview, not a complete historiography or discipline-specific protocol.",
    },
    "audit:netlogo-official-docs": {
        "title": "NetLogo 7.0.4 Documentation",
        "publisher": "NetLogo, Center for Connected Learning and Computer-Based Modeling",
        "url": "https://docs.netlogo.org/",
        "locator": "Overview: NetLogo is a programmable modelling environment for simulating natural and social phenomena; tutorials and programming guide introduce how models are built.",
        "scope": "Supports NetLogo's identity and modelling purpose; software availability does not validate a simulation's assumptions or predictions.",
    },
    "audit:nltk-official": {
        "title": "Natural Language Toolkit",
        "publisher": "NLTK project documentation",
        "url": "https://www.nltk.org/",
        "locator": "Opening description and examples: NLTK is a free, open-source Python platform with corpora and text-processing tools for tokenization, classification, tagging, parsing and related tasks.",
        "scope": "Supports NLTK's software identity and listed capabilities; it does not guarantee correct interpretation of language or fit for a particular corpus.",
    },
    "audit:cambridge-process-tracing-evaluation": {
        "title": "Process Tracing for Program Evaluation",
        "publisher": "Cambridge University Press, The Case for Case Studies",
        "url": "https://www.cambridge.org/core/books/case-for-case-studies/process-tracing-for-program-evaluation/3282EBD903031583252019931E5C3BB9",
        "locator": "Section 9.3: analyzes evidence about processes and event sequences within a case to develop or test hypotheses about causal mechanisms; the method can be combined with comparisons or other methods.",
        "scope": "Supports process tracing as within-case mechanism analysis; it does not estimate an average effect across a population, and the chapter concerns program evaluation.",
    },
    "audit:mass-negative-binomial": {
        "title": "Fit a Negative Binomial Generalized Linear Model",
        "publisher": "R MASS package documentation, CRAN",
        "url": "https://search.r-project.org/CRAN/refmans/MASS/html/glm.nb.html",
        "locator": "Description and Details: fits a negative-binomial generalized linear model and estimates its additional dispersion parameter by an iterative procedure.",
        "scope": "Supports the model-family and estimation meaning; model choice depends on the outcome, design and diagnostics, not only on observing variation beyond a Poisson model.",
    },
    "audit:atlanta-fed-nowcast": {
        "title": "GDPNow",
        "publisher": "Federal Reserve Bank of Atlanta",
        "url": "https://www.atlantafed.org/research-and-data/data/gdpnow",
        "locator": "Opening explanation: GDPNow is a running model-based estimate of current-quarter GDP growth made before the official estimate is released, using data available so far.",
        "scope": "Supports nowcasting as an estimate of current-period conditions before complete official data arrive; this is a GDP example, and a nowcast is uncertain rather than an observed final value.",
    },
    "audit:microsoft-bi-glossary": {
        "title": "Glossary of the Power BI Service",
        "publisher": "Microsoft Learn",
        "url": "https://learn.microsoft.com/en-us/power-bi/explore-reports/end-user-glossary",
        "locator": "BI entry expands the acronym to business intelligence; related entries describe the reports, dashboards and data models used in Power BI.",
        "scope": "Supports the acronym expansion in a Power BI context; it does not provide a general definition of every business-intelligence practice.",
    },
    "audit:govuk-uk-eu-reference": {
        "title": "Overview of the UK Internal Market",
        "publisher": "GOV.UK, Office for the Internal Market",
        "url": "https://www.gov.uk/government/publications/overview-of-the-uk-internal-market-report/overview-of-the-uk-internal-market",
        "locator": "Opening section: UK refers to the United Kingdom, made up of England, Scotland, Wales and Northern Ireland.",
        "scope": "Supports the expansion of UK and its four constituent nations; it is not a source for current EU membership or UK-EU legal relations.",
    },
    "audit:govuk-eu-reference": {
        "title": "Countries in the EU and EEA",
        "publisher": "GOV.UK",
        "url": "https://www.gov.uk/eu-eea",
        "locator": "Opening definition: EU expands to European Union and is described as an economic and political union of member countries.",
        "scope": "Supports acronym expansion and general institutional description; membership and legal details can change and should be checked for current policy claims.",
    },
    "audit:psytoolkit-library": {
        "title": "PsyToolkit's Experiment Library",
        "publisher": "PsyToolkit",
        "url": "https://www.psytoolkit.org/library/",
        "locator": "Introduction: users can create and run cognitive psychology experiments in a browser and adapt documented experiment examples for research or teaching.",
        "scope": "Supports PsyToolkit as a platform for psychological experiments; individual tasks, online data collection and research validity require separate checks.",
    },
    "audit:opensesame-docs": {
        "title": "OpenSesame Documentation",
        "publisher": "OpenSesame project documentation",
        "url": "https://osdoc.cogsci.nl/",
        "locator": "Opening overview: OpenSesame is a program for creating experiments in psychology, neuroscience and experimental economics; the documentation includes graphical and scripting workflows.",
        "scope": "Supports the software identity and experiment-building purpose; it does not establish that an experiment is valid or suitable for every device and study.",
    },
    "audit:odk-docs": {
        "title": "ODK Documentation: Getting Started",
        "publisher": "Open Data Kit project",
        "url": "https://docs.getodk.org/getting-started/",
        "locator": "Getting Started: ODK is an open-source data-collection platform for creating forms, collecting information offline and syncing submissions when a connection is available.",
        "scope": "Supports ODK's form-based mobile and web collection workflow; deployment, hosting, privacy and offline limits depend on the selected ODK components and setup.",
    },
    "audit:jasp-official": {
        "title": "A Fresh Way to Do Statistics",
        "publisher": "JASP project, University of Amsterdam",
        "url": "https://jasp-stats.org/",
        "locator": "Overview and feature list: JASP is free, open-source statistical software with a graphical interface and common analyses in classical and Bayesian forms.",
        "scope": "Supports the software identity and listed workflow features; it does not choose the statistical method or validate an interpretation.",
    },
    "audit:pmc-scale-invariance": {
        "title": "Scale Length Does Matter: Recommendations for Measurement Invariance Testing with Categorical Factor Analysis and Item Response Theory Approaches",
        "publisher": "Educational and Psychological Measurement, open-access article in PubMed Central",
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC9579096/",
        "locator": "Abstract and introduction: group comparisons of latent constructs require evidence that measures operate equivalently; the article compares multiple-group confirmatory factor analysis and item-response-theory approaches for ordinal items.",
        "scope": "Supports the relationship among CFA, IRT and measurement invariance in scale comparisons; this is a methodological simulation study, not a universal rule for every construct or data type.",
    },
    "audit:sklearn-lasso": {
        "title": "Lasso",
        "publisher": "scikit-learn documentation",
        "url": "https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.Lasso.html",
        "locator": "Description and objective: Lasso fits a linear model with an L1 penalty; its regularization strength affects coefficients and can set some to zero.",
        "scope": "Supports the computational meaning of Lasso and coefficient shrinkage; selected features depend on data, scaling, tuning and correlated predictors and do not establish causation.",
    },
    "audit:cochrane-systematic-review": {
        "title": "What Are Systematic Reviews?",
        "publisher": "Cochrane",
        "url": "https://www.cochrane.org/evidence/what-are-systematic-reviews",
        "locator": "Opening explanation: a systematic review defines a question, searches for relevant studies using planned criteria, assesses eligible evidence and may combine results when suitable.",
        "scope": "Supports an introductory evidence-synthesis definition; Cochrane's examples focus on health interventions, and a review does not guarantee complete capture or certainty.",
    },
    "audit:jbi-scoping-review": {
        "title": "What Are Scoping Reviews?",
        "publisher": "Joanna Briggs Institute, Manual for Evidence Synthesis",
        "url": "https://jbi-global.atlassian.net/wiki/spaces/MANUAL/pages/355862573/10.1.2%2BWhat%2Bare%2Bscoping%2Breviews",
        "locator": "Opening definition: scoping reviews systematically identify and map the breadth of evidence on a topic or concept and can clarify definitions and evidence gaps.",
        "scope": "Supports the distinction between scoping and focused effectiveness reviews; it does not mean that scoping reviews assess intervention effects or risk of bias in the same way as every systematic review.",
    },
    "audit:pmc-participant-observation": {
        "title": "Introduction to Qualitative Research Methods: Part 2",
        "publisher": "Journal of Investigative Medicine, open-access article in PubMed Central",
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC10267995/",
        "locator": "Participant observation section: researchers spend extended time in a setting, sometimes participating and sometimes mainly observing; the role depends on the question and context.",
        "scope": "Supports the method description and flexible researcher role; the article uses health-research examples, and researcher presence can affect what is observed.",
    },
    "audit:github-readme": {
        "title": "About the Repository README File",
        "publisher": "GitHub Docs",
        "url": "https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes",
        "locator": "About READMEs: a README tells people what a project is for, why it may be useful and how to get started or find help.",
        "scope": "Supports the common software-project meaning; dataset README files may instead document data contents, provenance and reuse conditions.",
    },
    "audit:nbs-cpi-methodology": {
        "title": "Consumer Price Index: Brief Methodology",
        "publisher": "National Bureau of Statistics, Nigeria",
        "url": "https://www.nigerianstat.gov.ng/download/1241208",
        "locator": "Brief Methodology: the CPI measures average changes over time in prices of goods and services consumed for day-to-day living, using a weighted basket and regularly collected prices.",
        "scope": "Supports the Nigerian CPI definition and basket example; the exact basket, weights and reference period can change when the index is rebased.",
    },
    "audit:npc-mandate": {
        "title": "About the National Population Commission",
        "publisher": "National Population Commission, Nigeria",
        "url": "https://www.nationalpopulation.gov.ng/about",
        "locator": "Mandate section: the Commission undertakes periodic population enumeration through censuses and surveys and publishes population information for planning.",
        "scope": "Supports NPC expansion and core mandate; it does not mean every Nigerian population estimate or survey is produced by the Commission.",
    },
    "audit:bdc-roi": {
        "title": "What Is Return on Investment (ROI)?",
        "publisher": "Business Development Bank of Canada",
        "url": "https://www.bdc.ca/en/articles-tools/entrepreneur-toolkit/templates-business-guides/glossary/return-on-investment",
        "locator": "Opening definition and formula: ROI compares profit or return with the cost of an investment, commonly expressed as a percentage.",
        "scope": "Supports a business-finance meaning; ROI measures financial return under the chosen calculation and does not capture every public or social value.",
    },
    "audit:national-academies-statistical-model": {
        "title": "Frontiers in Massive Data Analysis, Chapter 7: Building Models from Massive Data",
        "publisher": "National Academies Press, National Research Council",
        "url": "https://www.nationalacademies.org/read/18374/chapter/9",
        "locator": "Introduction to Statistical Models: models use families of equations to represent how data may have been generated, describe relationships and support predictions with uncertainty.",
        "scope": "Supports the general purpose of statistical models; the chapter focuses on data analysis and does not provide all model-specific assumptions or social-science examples.",
    },
    "audit:govuk-test-development-handbook": {
        "title": "Test Development Handbook 2023",
        "publisher": "GOV.UK, Standards and Testing Agency",
        "url": "https://www.gov.uk/government/publications/national-curriculum-test-development-handbook/test-development-handbook-2023",
        "locator": "Sections 8.1–8.4: distinguishes classical test theory and item response theory, describes item-level analysis and reliability, and explains that differential item functioning flags group differences but does not establish their cause.",
        "scope": "Supports introductory psychometric definitions and limits; the handbook concerns national curriculum test development, not every scale or population.",
    },
    "audit:psu-correlation-methods": {
        "title": "Tests for Ordinal Data and Small Samples",
        "publisher": "Penn State Eberly College of Science, STAT 504",
        "url": "https://online.stat.psu.edu/stat504/Lesson04",
        "locator": "Section 4.3: defines Pearson correlation as a measure of linear association between quantitative variables and explains Spearman correlation as Pearson correlation applied to ranks.",
        "scope": "Supports the distinction between Pearson linear association and Spearman rank association; method suitability still depends on the data and study design.",
    },
    "audit:psu-confidence-interval": {
        "title": "Confidence Intervals",
        "publisher": "Penn State Eberly College of Science, STAT 415",
        "url": "https://online.stat.psu.edu/stat415/Lesson06",
        "locator": "Section 6.3: explains repeated-sampling interpretation of confidence intervals and why a frequentist interval is not a probability statement about a fixed parameter after the interval is observed.",
        "scope": "Supports the frequentist confidence-interval interpretation; other interval frameworks, such as Bayesian credible intervals, have different interpretations.",
    },
    "audit:psu-generalized-linear-model": {
        "title": "Generalized Linear Models",
        "publisher": "Penn State Eberly College of Science, STAT 462",
        "url": "https://online.stat.psu.edu/stat462/node/211/",
        "locator": "Section 12.4: describes generalized linear models through a response distribution and link function, with linear, logistic and Poisson regression as examples.",
        "scope": "Supports the model-family definition and examples; it is an introductory treatment and does not cover every GLM family or diagnostic requirement.",
    },
    "audit:nist-arma-autocorrelation": {
        "title": "ARMA and Autocorrelation",
        "publisher": "National Institute of Standards and Technology, Dataplot and Engineering Statistics Handbook",
        "url": "https://itl.nist.gov/div898/software/dataplot/refman1/auxillar/arma.htm",
        "locator": "ARMA reference: defines ARMA as a univariate time-series model combining autoregressive terms and moving-average error terms. The NIST autocorrelation chapter defines correlation between values of the same series at different lags.",
        "scope": "Supports introductory ARMA and autocorrelation meanings; stationarity, sampling frequency, model identification and diagnostics require separate consideration.",
    },
    "audit:worldbank-did-rdd": {
        "title": "Difference-in-Differences and Regression Discontinuity",
        "publisher": "World Bank Development Impact Evaluation (DIME) Wiki",
        "url": "https://dimewiki.worldbank.org/Difference-in-Differences",
        "locator": "Difference-in-Differences overview: compares pre/post outcome changes between treated and comparison groups and states the equal-trends assumption. The linked Regression Discontinuity page explains comparison around a clearly defined eligibility cutoff and local-effect interpretation.",
        "scope": "Supports introductory quasi-experimental definitions and central assumptions; these pages are method guides, not proof that a particular dataset satisfies the assumptions.",
    },
    "audit:worldbank-counterfactual": {
        "title": "Development Research in Practice: The DIME Analytics Data Handbook",
        "publisher": "World Bank Development Impact Evaluation (DIME)",
        "url": "https://worldbank.github.io/dime-data-handbook/design.html",
        "locator": "C Research design for impact evaluation: defines the counterfactual as the alternative outcome or state that would have occurred under a different treatment condition; discusses experimental and quasi-experimental designs used to approximate it.",
        "scope": "Supports counterfactual reasoning in causal and impact evaluation; the term can be used more broadly in other fields.",
    },
    "audit:psu-multiple-comparisons": {
        "title": "Controlling Family-wise Error Rate",
        "publisher": "Penn State Eberly College of Science, STAT 555",
        "url": "https://online.stat.psu.edu/stat555/node/58/",
        "locator": "Section 4.2: defines family-wise error rate as the probability of at least one false rejection within a family of tests and introduces Bonferroni control.",
        "scope": "Supports the multiple-testing problem and one correction strategy; other multiplicity procedures make different tradeoffs and suit different analysis plans.",
    },
    "audit:sklearn-classifier-metrics": {
        "title": "Metrics and Scoring: Quantifying the Quality of Predictions",
        "publisher": "scikit-learn documentation",
        "url": "https://scikit-learn.org/stable/modules/model_evaluation.html",
        "locator": "Classification metrics sections: define precision and recall from true and false positive counts and describe threshold-dependent precision-recall curves; ROC-AUC is documented separately as area under the receiver operating characteristic curve.",
        "scope": "Supports common classifier metric meanings; metrics summarize performance against labelled evaluation data and do not establish causal explanation or future performance under distribution shift.",
    },
    "audit:stata-covariate-glossary": {
        "title": "Stata Glossary",
        "publisher": "StataCorp",
        "url": "https://www.stata.com/manuals14/iglossary.pdf",
        "locator": "Glossary: defines covariates as explanatory variables included in a model, with age, sex and treatment as examples.",
        "scope": "Supports the model-variable meaning; in causal analysis, whether to adjust for a covariate depends on the design and causal question.",
    },
    "audit:aapor-about": {
        "title": "About Us",
        "publisher": "American Association for Public Opinion Research",
        "url": "https://aapor.org/about-us/",
        "locator": "Opening paragraph: gives the association's full name and describes its survey and public-opinion research mission and professional resources.",
        "scope": "Supports acronym expansion and organization identity; AAPOR guidance is professional guidance, not Nigerian law or automatic validation of a study.",
    },
    "audit:afrisenti-acl-paper": {
        "title": "AfriSenti: A Twitter Sentiment Analysis Benchmark for African Languages",
        "publisher": "Association for Computational Linguistics Anthology, EMNLP 2023",
        "url": "https://aclanthology.org/2023.emnlp-main.862/",
        "locator": "Abstract: describes AfriSenti as an annotated sentiment-analysis benchmark with more than 110,000 posts across 14 African languages and outlines collection and annotation work.",
        "scope": "Supports the dataset's purpose and language coverage; its social-media posts do not represent all speakers or public opinion in those countries.",
    },
    "audit:nist-ai-rmf-framework": {
        "title": "AI Risk Management Framework",
        "publisher": "National Institute of Standards and Technology",
        "url": "https://www.nist.gov/itl/ai-risk-management-framework",
        "locator": "Overview: expands AI RMF to AI Risk Management Framework, explains its voluntary use and describes its purpose in managing risks across AI design, development, use and evaluation. The page notes that version 1.0 is being revised.",
        "scope": "Supports the framework name, purpose and voluntary status; it is a U.S. framework and does not replace applicable Nigerian law or institutional review.",
    },
    "audit:govuk-atrs": {
        "title": "Guidance for Organisations Using the Algorithmic Transparency Recording Standard",
        "publisher": "GOV.UK, Government Digital Service",
        "url": "https://www.gov.uk/government/publications/guidance-for-organisations-using-the-algorithmic-transparency-recording-standard",
        "locator": "Opening guidance and details: expands ATRS to Algorithmic Transparency Recording Standard and explains its use for documenting and publishing public-sector information about algorithmic tools.",
        "scope": "Supports the name and UK public-sector use; mandatory scope does not make it a Nigerian legal requirement.",
    },
    "audit:cbn-about": {
        "title": "About the Central Bank of Nigeria",
        "publisher": "Central Bank of Nigeria",
        "url": "https://www.cbn.gov.ng/AboutCBN/index.html",
        "locator": "Core Mandate section: expands CBN to Central Bank of Nigeria and states its monetary and financial-system responsibilities.",
        "scope": "Supports the institution's name and mandate; use current CBN publications for current policy and data definitions.",
    },
    "audit:psu-cdf": {
        "title": "Probability Distributions",
        "publisher": "Penn State Eberly College of Science, STAT 500",
        "url": "https://online.stat.psu.edu/stat500/Lesson03",
        "locator": "Section 3.7: defines the cumulative distribution function F(x) as the probability that a random variable is less than or equal to x, for discrete or continuous variables.",
        "scope": "Supports the statistical meaning of CDF; the cumulative distribution describes a specified random variable and is not a frequency tally in every use.",
    },
    "audit:qgis-coordinate-reference-system": {
        "title": "Working with Projections",
        "publisher": "QGIS Documentation",
        "url": "https://documentation.qgis.org/3.44/en/docs/user_manual/working_with_projections/working_with_projections.html",
        "locator": "Opening explanation: expands CRS to Coordinate Reference System and explains that a project CRS determines how underlying coordinates are projected for display on a map.",
        "scope": "Supports CRS expansion and mapping context; choosing or transforming a CRS requires the coordinate data, location and analysis purpose.",
    },
    "audit:geopandas-projections": {
        "title": "Projections",
        "publisher": "GeoPandas documentation",
        "url": "https://geopandas.org/en/latest/docs/user_guide/projections.html",
        "locator": "Opening sections: explain that GeoPandas geometries are coordinates in a reference system and that assigning a CRS is required for reliable coordinate transformations and interpretation by other software.",
        "scope": "Supports GeoPandas as a Python library for geographic vector data and the importance of coordinate reference information; the documentation does not choose the right projection for every analysis.",
    },
    "audit:surrey-caqdas": {
        "title": "About CAQDAS",
        "publisher": "University of Surrey, CAQDAS Networking Project",
        "url": "https://www.surrey.ac.uk/computer-assisted-qualitative-data-analysis/about",
        "locator": "What are CAQDAS packages?: expands the acronym to Computer Assisted Qualitative Data Analysis Software and describes software that supports work with qualitative data and analysis.",
        "scope": "Supports the acronym and software category; the software organizes and supports analysis but does not make interpretive decisions for the researcher.",
    },
    "audit:psu-bayesian-nonparametric": {
        "title": "Bayes' Theorem and Nonparametric Methods",
        "publisher": "Penn State Eberly College of Science, STAT 414 and STAT 500",
        "url": "https://online.stat.psu.edu/stat414/Lesson06",
        "locator": "Bayes' Theorem: distinguishes prior probabilities from posterior probabilities after evidence. STAT 500 Lesson 11 describes nonparametric methods as requiring few assumptions about an underlying distribution and provides examples.",
        "scope": "Supports introductory Bayesian probability updating and one broad use of nonparametric methods; Bayesian statistical modelling and individual nonparametric procedures have additional assumptions and choices.",
    },
    "audit:apa-factor-analysis": {
        "title": "Factor Analysis",
        "publisher": "American Psychological Association Dictionary of Psychology",
        "url": "https://dictionary.apa.org/factor-analysis",
        "locator": "Definition: describes factor analysis as a family of mathematical procedures that summarize relationships among observed variables using fewer underlying factors; related entries include exploratory and confirmatory factor analysis.",
        "scope": "Supports the broad factor-analysis meaning and terminology; EFA model choices and diagnostics require additional methodological guidance.",
    },
    "audit:uf-homophily": {
        "title": "Introduction to Social Network Research: General Introduction and Major Terminology",
        "publisher": "University of Florida IFAS Extension",
        "url": "https://ask.ifas.ufl.edu/publication/WC195",
        "locator": "Homophily/heterophily section: defines homophily as the tendency for connected network actors to share attributes and gives examples involving age, gender, education and communication.",
        "scope": "Supports the general social-network meaning; the pattern and its measurement depend on the attribute, opportunity structure and relationship being studied.",
    },
    "audit:cdc-qualitative-methods": {
        "title": "Collecting and Analyzing Qualitative Data",
        "publisher": "U.S. Centers for Disease Control and Prevention, Field Epidemiology Manual",
        "url": "https://www.cdc.gov/field-epi-manual/php/chapters/qualitative-data.html",
        "locator": "Interview and analysis sections: distinguishes more structured and semi-structured formats, describes software support for coding and retrieval, and notes that teams may measure intercoder reliability while analysts remain responsible for interpretation.",
        "scope": "Supports these introductory examples in applied health research; inter-coder agreement is not required or appropriate in every qualitative tradition.",
    },
    "audit:unstats-labour-standards": {
        "title": "Handbook on Management and Organization of National Statistical Systems, Chapter 10",
        "publisher": "United Nations Statistics Division",
        "url": "https://unstats.un.org/capacity-development/handbook/chapters/Chapter10_Handbook_2025A_202505.pdf",
        "locator": "Labour statistics section: expands ILO to International Labour Organization and ICLS to International Conference of Labour Statisticians, explaining their roles in developing labour-statistics standards and common definitions.",
        "scope": "Supports the terms and their labour-statistics context; international resolutions and guidelines are not automatically binding domestic law.",
    },
    "audit:unstats-system-national-accounts": {
        "title": "The System of National Accounts",
        "publisher": "United Nations Statistics Division",
        "url": "https://unstats.un.org/unsd/Nationalaccount/sna.asp",
        "locator": "About the SNA: expands SNA to System of National Accounts and describes it as an internationally agreed framework for compiling integrated measures of economic activity.",
        "scope": "Supports the statistical-standard meaning of SNA in the national-accounts context; national releases may still implement different versions or methods.",
    },
    "audit:imf-gfsm": {
        "title": "Government Finance Statistics Manuals and Guides",
        "publisher": "International Monetary Fund",
        "url": "https://www.imf.org/en/data/statistics/government-finance-statistics-manual/gfs",
        "locator": "Core manuals section: expands GFSM to Government Finance Statistics Manual and describes the GFSM 2014 framework as designed to support fiscal analysis; the IMF's separate update page records ongoing revision work.",
        "scope": "Supports the standard's name and purpose; check current version and national implementation before interpreting a specific dataset.",
    },
    "audit:un-about-and-agencies": {
        "title": "About Us and UN System",
        "publisher": "United Nations",
        "url": "https://www.un.org/about-us",
        "locator": "About Us and UN System: expands UN to United Nations and lists institutional names for ILO, IMF, UNESCO and WHO.",
        "scope": "Supports acronym expansions and organization identities; it does not substantiate a technical method or a local legal requirement.",
    },
    "audit:un-desa-about": {
        "title": "Who We Are",
        "publisher": "United Nations Department of Economic and Social Affairs",
        "url": "https://www.un.org/development/desa/en/about/who-we-are",
        "locator": "Opening paragraphs: expands UN DESA to United Nations Department of Economic and Social Affairs and describes its analytical and policy-support work.",
        "scope": "Supports the name and institutional context; the cited method or population projection must still be checked against the relevant technical publication.",
    },
    "audit:ndpc-annual-report": {
        "title": "Nigeria Data Protection Commission Annual Report 2023",
        "publisher": "Nigeria Data Protection Commission",
        "url": "https://ndpc.gov.ng/wp-content/uploads/2024/07/AnnualReport2023.pdf",
        "locator": "Sections 3.1–3.2: expands NDPC to Nigeria Data Protection Commission and NDPA to Nigeria Data Protection Act, 2023, and describes the Commission's establishment under the Act.",
        "scope": "Supports the Nigerian institution and Act names; it does not establish that a particular project complies with the Act or has ethics approval.",
    },
    "audit:familysearch-catalog": {
        "title": "FamilySearch Catalog",
        "publisher": "FamilySearch",
        "url": "https://www.familysearch.org/en/search/catalog",
        "locator": "Catalog overview: supports searches for books, records, images and other genealogical resources held or described by FamilySearch and its library network; availability and access restrictions vary by item.",
        "scope": "Supports the tool's catalogue purpose; finding a catalogue entry does not establish identity, lineage or legal proof, and source records require evaluation.",
    },
    "audit:limesurvey-manual": {
        "title": "LimeSurvey Manual",
        "publisher": "LimeSurvey project documentation",
        "url": "https://www.limesurvey.org/manual/",
        "locator": "Overview and table of contents: describes LimeSurvey as survey software for creating online forms and surveys, managing questions, collecting responses and exporting results.",
        "scope": "Supports the product category and listed workflow; current features, hosting options and costs depend on version and service plan.",
    },
    "audit:openrefine-manual": {
        "title": "OpenRefine User Manual",
        "publisher": "OpenRefine documentation",
        "url": "https://openrefine.org/docs",
        "locator": "Opening workflow: describes importing datasets, inspecting them with facets and filters, transforming or reconciling data, and exporting the result.",
        "scope": "Supports OpenRefine as a data-cleaning and transformation tool; it cannot determine whether a correction is substantively accurate without a suitable reference.",
    },
    "audit:pysal-esda-guide": {
        "title": "User Guide",
        "publisher": "PySAL esda documentation",
        "url": "https://pysal.org/esda/stable/user-guide/index.html",
        "locator": "Opening description: states that esda provides exploratory spatial data analysis methods; the examples demonstrate spatial statistics and dependence on data/weights choices.",
        "scope": "Supports PySAL esda as a Python package for exploratory spatial statistics; method choice and spatial weights must fit the question and data.",
    },
    "audit:maxqda-official": {
        "title": "MAXQDA",
        "publisher": "VERBI Software",
        "url": "https://www.maxqda.com/",
        "locator": "Product overview: describes MAXQDA as software for qualitative and mixed-methods analysis, including work with text and numerical evidence.",
        "scope": "Supports the software category and advertised capabilities; its functions do not determine a suitable method or interpret findings for the researcher.",
    },
    "audit:opendronemap-docs": {
        "title": "OpenDroneMap Documentation",
        "publisher": "OpenDroneMap project",
        "url": "https://docs.opendronemap.org/",
        "locator": "Documentation overview: describes the project documentation and processing workflow for producing geospatial products from drone imagery.",
        "scope": "Supports the tool identity and broad photogrammetry use; mapping accuracy depends on imagery, control, processing settings and validation.",
    },
    "audit:qualcoder-docs": {
        "title": "QualCoder Documentation",
        "publisher": "QualCoder project documentation",
        "url": "https://qualcoder.org/doc/en/print/",
        "locator": "Opening description: identifies QualCoder as free, open-source desktop software for qualitative data analysis and documents its project, coding and export functions.",
        "scope": "Supports the product category and documented functions; the software helps manage analysis but does not replace methodological interpretation.",
    },
    "audit:microsoft-powerbi-licenses": {
        "title": "Power BI Service Features by License Type",
        "publisher": "Microsoft Learn",
        "url": "https://learn.microsoft.com/en-us/power-bi/fundamentals/service-features-license-type",
        "locator": "Premium per user section: expands PPU to Premium Per User and distinguishes access/sharing requirements by license and workspace capacity.",
        "scope": "Supports current licensing terminology and constraints; product licensing changes over time and should be checked before making an operational or cost claim.",
    },
    "audit:nhgri-dna-glossary": {
        "title": "Deoxyribonucleic Acid (DNA)",
        "publisher": "National Human Genome Research Institute, U.S. National Institutes of Health",
        "url": "https://www.genome.gov/genetics-glossary/Deoxyribonucleic-Acid-DNA",
        "locator": "Definition: expands DNA to deoxyribonucleic acid and describes it as the molecule carrying genetic information; this source is an introductory genetics glossary.",
        "scope": "Supports the acronym and basic biological meaning; a DNA match alone is not proof of genealogy, legal identity or inheritance.",
    },
    "audit:ietf-csv-rfc4180": {
        "title": "Common Format and MIME Type for Comma-Separated Values (CSV) Files",
        "publisher": "Internet Engineering Task Force, RFC 4180",
        "url": "https://www.rfc-editor.org/rfc/rfc4180/",
        "locator": "Abstract and Section 2: expands CSV to Comma-Separated Values and describes a common text format for exchanging rows and fields, while noting that implementations vary.",
        "scope": "Supports the file-format name and common structure; CSV dialects differ and the RFC is informational, not a single universal specification.",
    },
    "audit:ietf-uri-rfc3986": {
        "title": "Uniform Resource Identifier (URI): Generic Syntax",
        "publisher": "Internet Engineering Task Force, RFC 3986 / STD 66",
        "url": "https://www.rfc-editor.org/rfc/rfc3986/",
        "locator": "Introduction: expands URI to Uniform Resource Identifier and defines it as a means of identifying a resource; the RFC describes URL as a subset of URI schemes that locate resources.",
        "scope": "Supports URI and URL distinctions in internet-address context; this does not define proprietary database identifiers or every identifier used in a record system.",
    },
    "audit:pmi-about": {
        "title": "About Project Management Institute (PMI)",
        "publisher": "Project Management Institute",
        "url": "https://www.pmi.org/",
        "locator": "About PMI section: expands PMI to Project Management Institute and describes its professional standards, learning and certification activities.",
        "scope": "Supports the organization's name and credential context; it does not establish that a particular credential is required for a role.",
    },
    "audit:sas-stat-overview": {
        "title": "Overview of SAS/STAT Software",
        "publisher": "SAS Documentation",
        "url": "https://documentation.sas.com/doc/en/statug/latest/statug_intro_sect001.htm",
        "locator": "Overview: describes SAS/STAT as software offering statistical procedures for areas including regression, survey analysis, psychometrics, time-to-event analysis and categorical data.",
        "scope": "Supports the software identity and examples of procedures; feature availability depends on SAS version and license, and software does not select or validate a method for the user.",
    },
    "audit:nist-regression-residual": {
        "title": "How Can I Tell If a Model Fits My Data?",
        "publisher": "National Institute of Standards and Technology, Engineering Statistics Handbook",
        "url": "https://itl.nist.gov/div898/handbook/pmd/section4/pmd44.htm",
        "locator": "Residuals section: defines a regression residual as the observed response minus the response predicted by the fitted model for that observation.",
        "scope": "Supports the regression meaning of residual; residuals are one diagnostic and do not alone establish that a model is suitable.",
    },
    "audit:nist-gui-it": {
        "title": "GUI and Information Technology Glossary Entries",
        "publisher": "National Institute of Standards and Technology, Computer Security Resource Center Glossary",
        "url": "https://csrc.nist.gov/glossary/term/gui",
        "locator": "GUI entry expands GUI to Graphical User Interface. The linked IT entry expands IT to information technology and describes equipment, software and services that handle information.",
        "scope": "Supports the acronym expansions and broad computing meanings; the glossary sources come from federal information-technology contexts.",
    },
    "audit:geoda-lisa-glossary": {
        "title": "GeoDa Glossary: Local Indicators of Spatial Association",
        "publisher": "GeoDa Center for Geospatial Analysis and Computation",
        "url": "https://geodacenter.github.io/glossary/",
        "locator": "LISA entry: expands LISA to Local Indicators of Spatial Association and describes local spatial clusters or outliers under spatial-neighbor assumptions.",
        "scope": "Supports acronym expansion and purpose; the selected weights, multiple testing and local-versus-global question affect interpretation.",
    },
    "audit:nhrec-official": {
        "title": "NHREC – Health Ethics",
        "publisher": "National Health Research Ethics Committee, Nigeria",
        "url": "https://nhrec.gov.ng/",
        "locator": "About section: expands NHREC to National Health Research Ethics Committee and describes its oversight of ethics processes for health research in Nigeria.",
        "scope": "Supports the committee's name and health-research remit; it does not imply NHREC governs every social-science project or ethics committee.",
    },
}
AUDIT_ONLY_STATIC_SOURCE_REFERENCES.update({
    "audit:ncrm-abm-social-research": {
        "title": "Agent-based modelling for social research",
        "publisher": "National Centre for Research Methods",
        "url": "https://repository.ncrm.ac.uk/resources/online/ABM_index.php",
        "locator": "Course overview and blocks introducing agent-based modelling, time, model development, analysis and documentation for social research.",
        "scope": "Supports the method's social-research context and learning scope; it does not establish that a model is valid or suitable for every question.",
    },
    "audit:national-academies-abm-policy": {
        "title": "Assessing the Use of Agent-Based Models for Tobacco Regulation, Appendix B",
        "publisher": "National Academies of Sciences, Engineering, and Medicine",
        "url": "https://www.nationalacademies.org/read/19018/chapter/10",
        "locator": "Section 'What Is an Agent-Based Model?': computational simulations represent agents' behaviours and interactions; social-science agents are often people.",
        "scope": "Supports the general agent-and-interaction definition; the report's policy example is U.S.-specific and is not evidence for a particular model's accuracy.",
    },
    "audit:unstats-geocoding-global": {
        "title": "Implementing Geocoding: Global Statistical Geospatial Framework Implementation Guide",
        "publisher": "United Nations Committee of Experts on Global Geospatial Information Management",
        "url": "https://ggim.un.org/documents/EG-ISGI-GSGF-Implementation-Guide-E.pdf",
        "locator": "Section 'What is Geocoding?': links a location description, such as an address, to coordinates in a coordinate system for statistical units.",
        "scope": "Supports the general geocoding definition; local address coverage and match quality still need to be checked for the study area.",
    },
    "audit:loc-ocr": {
        "title": "Chronicling America: Frequently Asked Questions",
        "publisher": "Library of Congress",
        "url": "https://guides.loc.gov/chronicling-america/frequently-asked-questions",
        "locator": "View Text and OCR sections: searchable text is generated from page images and can contain errors, especially with difficult print or image quality.",
        "scope": "Supports OCR's role and error limits for digitized documents; examples are from historical newspapers, not a guarantee about every OCR tool or corpus.",
    },
    "audit:sage-operationalization": {
        "title": "Operationalization, The SAGE Dictionary of Social Research Methods",
        "publisher": "SAGE Publications",
        "url": "https://methods.sagepub.com/dict/edvol/the-sage-dictionary-of-social-research-methods/chpt/operationalization",
        "locator": "Definition and distinctive features: devising ways to measure theoretical concepts that are not directly observable, using rules or indicators.",
        "scope": "Supports the social-research meaning of operationalisation; a measure is a study decision and does not capture every aspect of a concept.",
    },
    "audit:ipa-birkbeck": {
        "title": "About Interpretative Phenomenological Analysis",
        "publisher": "Birkbeck, University of London",
        "url": "https://www.ipa.bbk.ac.uk/about-ipa",
        "locator": "Opening overview: examines lived experience and how participants make sense of it, with detailed case-by-case analysis and researcher interpretation.",
        "scope": "Supports the defining focus of IPA; it does not imply that one interpretation is an objective or complete record of experience.",
    },
    "audit:openlearn-about": {
        "title": "Frequently Asked Questions on OpenLearn",
        "publisher": "The Open University",
        "url": "https://www.open.edu/openlearn/about-openlearn/frequently-asked-questions-on-openlearn",
        "locator": "'What is OpenLearn?' and course-level sections: OpenLearn is a free learning platform; course levels indicate expected prior study experience, not a qualification.",
        "scope": "Supports the platform name and level wording; an OpenLearn course does not by itself award an Open University qualification.",
    },
    "audit:braun-clarke-thematic-analysis": {
        "title": "Understanding Thematic Analysis",
        "publisher": "Virginia Braun and Victoria Clarke, University of Auckland and University of the West of England",
        "url": "https://www.thematicanalysis.net/understanding-ta/",
        "locator": "Opening definition and approach overview: develops patterns of meaning across qualitative material in relation to a research question; approaches differ in their procedures and assumptions.",
        "scope": "Supports a general definition of thematic analysis; it does not make all thematic-analysis approaches interchangeable with framework analysis.",
    },
    "audit:statnet-ergm-gof": {
        "title": "Goodness-of-Fit for Exponential Random Graph Models",
        "publisher": "Statnet Project",
        "url": "https://statnet.org/workshop-ergm/ergm_tutorial.html",
        "locator": "Model assessment and goodness-of-fit sections: compare network features reproduced by the fitted ERGM with the observed network and use model-specific checks.",
        "scope": "Supports the model-specific diagnostic context for ERGMs; these checks do not establish that the network data or substantive theory are correct.",
    },
})

GLOSSARY_DEFINITION_SOURCE_IDS = {
    "anova": ["audit:r-anova-documentation", "audit:openstax-anova"],
    "chi-square": ["audit:r-chi-square-documentation", "audit:openstax-chi-square"],
    "exact test": ["audit:r-fisher-exact-documentation"],
    "exact tests": ["audit:r-fisher-exact-documentation"],
    "model diagnostics": ["audit:statsmodels-regression-diagnostics"],
    "model fit": ["audit:statsmodels-regression-diagnostics"],
    "separation": ["audit:sage-logistic-separation"],
    "confounding": ["audit:cdc-confounding"],
    "ethnography": ["audit:govuk-ethnographic-study"],
    "reflexivity": ["audit:govuk-ethnographic-study"],
    "reflexive": ["audit:govuk-ethnographic-study"],
    "psychopy": ["audit:psychopy-getting-started"],
    "arcgis": ["audit:arcgis-spatial-analysis"],
    "spatial analysis": ["audit:esri-spatial-analysis", "audit:arcgis-spatial-analysis"],
    "geoda": ["audit:geoda-spatial-autocorrelation"],
    "spatial autocorrelation": ["audit:geoda-spatial-autocorrelation"],
    "moran's i": ["audit:geoda-spatial-autocorrelation"],
    "critical discourse analysis": ["audit:bcu-critical-discourse-analysis"],
    "cda": ["audit:bcu-critical-discourse-analysis"],
    "historical research": ["audit:uconn-historical-research"],
    "netlogo": ["audit:netlogo-official-docs"],
    "nltk": ["audit:nltk-official"],
    "process tracing": ["audit:cambridge-process-tracing-evaluation"],
    "negative binomial": ["audit:mass-negative-binomial"],
    "nowcast": ["audit:atlanta-fed-nowcast"],
    "nowcasts": ["audit:atlanta-fed-nowcast"],
    "bi": ["audit:microsoft-bi-glossary"],
    "uk": ["audit:govuk-uk-eu-reference"],
    "eu": ["audit:govuk-eu-reference"],
    "ordinary least squares": ["audit:r-lm-documentation"],
    "ols": ["audit:r-lm-documentation"],
    "weighting": ["audit:aapor-survey-weighting"],
    "rank test": ["audit:r-cor-test-association"],
    "randomized": ["audit:openstax-experimental-research"],
    "node": ["audit:networkx-nodes-edges"],
    "odds ratio": ["audit:ncbi-odds-ratio", "audit:penn-state-logistic-regression"],
    "null hypothesis": ["audit:openstax-hypothesis-testing"],
    "hypothesis testing": ["audit:openstax-hypothesis-testing"],
    "test statistic": ["audit:openstax-hypothesis-testing"],
    "p-value": ["audit:nist-p-value", "audit:openstax-hypothesis-testing"],
    "p-values": ["audit:nist-p-value", "audit:openstax-hypothesis-testing"],
    "statistical significance": ["audit:openstax-hypothesis-testing"],
    "variance": ["audit:openstax-variance"],
    "standard error": ["audit:openstax-standard-error"],
    "correlation": ["audit:openstax-regression-correlation", "audit:r-cor-test-association"],
    "pearson correlation": ["audit:psu-correlation-methods", "audit:r-cor-test-association"],
    "pearson correlation coefficient": ["audit:psu-correlation-methods", "audit:r-cor-test-association"],
    "spearman correlation": ["audit:psu-correlation-methods", "audit:r-cor-test-association"],
    "spearman rank correlation": ["audit:psu-correlation-methods", "audit:r-cor-test-association"],
    "regression": ["audit:openstax-regression-correlation", "audit:r-lm-documentation"],
    "linear regression": ["audit:openstax-regression-correlation", "audit:r-lm-documentation"],
    "logistic regression": ["audit:penn-state-logistic-regression"],
    "case study": ["audit:openstax-case-study"],
    "content analysis": ["audit:openstax-content-analysis"],
    "scale construction": ["audit:cosmin-manual"],
    "factor analysis": ["audit:cosmin-manual"],
    "multilevel": ["audit:stata-multilevel"],
    "qgis": ["audit:qgis-user-guide"],
    "casevo": ["audit:casevo-preprint", "audit:casevo-github"],
    "document analysis": ["audit:fsa-social-research-methods"],
    "field notes": ["audit:fsa-social-research-methods"],
    "spatial analysis": ["audit:esri-spatial-analysis", "audit:arcgis-spatial-analysis"],
    "conversation analysis": ["audit:ucla-conversation-analysis"],
    "probability": ["audit:openstax-probability"],
    "coefficient": ["audit:openstax-regression-correlation", "audit:r-lm-documentation"],
    "api": ["audit:mdn-api"],
    "transcript": ["audit:ukds-transcription"],
    "longitudinal": ["audit:stata-panel-manual"],
    "nlp": ["audit:stanford-nlp"],
    "text analysis": ["audit:openstax-content-analysis", "audit:stanford-nlp"],
    "training data": ["audit:scikit-learn-data-leakage"],
    "test data": ["audit:scikit-learn-data-leakage"],
    "validation data": ["audit:scikit-learn-data-leakage"],
    "data leakage": ["audit:scikit-learn-data-leakage"],
    "population": ["audit:aapor-best-practices-population", "audit:census-population-demography"],
    "target population": ["audit:aapor-best-practices-population"],
    "social science": ["src:d078-unesco-iscoped-social-sciences", "src:d078-openstax-sociology-scope-3e"],
    "social sciences": ["src:d078-unesco-iscoped-social-sciences", "src:d078-openstax-sociology-scope-3e"],
    "social institution": ["src:d078-openstax-sociology-scope-3e"],
    "social institutions": ["src:d078-openstax-sociology-scope-3e"],
    "research question": ["src:d078-openstax-sociology-research-3e"],
    "evidence": ["src:d078-openstax-sociology-research-3e", "src:d078-aapor-survey-best-practices"],
    "combined research design": ["src:mixed-methods-designs"],
    "behavioural research": ["src:d078-unesco-iscoped-social-sciences", "src:d078-openstax-sociology-scope-3e"],
    "administrative records": ["src:d078-ons-administrative-data-glossary"],
    "data": ["src:d078-ons-what-are-data", "audit:worldbank-dime-measurement", "audit:openstax-sociology-research-methods-3e"],
    "informed consent": ["src:d078-esrc-research-consent"],
    "ethics review": ["src:d078-esrc-research-consent"],
    "digital traces": ["src:d078-digital-trace-data-2025"],
    "digital trace": ["src:d078-digital-trace-data-2025"],
    "coding": ["audit:cdc-qualitative-coding", "audit:python-tutorial-programming-code"],
    "qualitative coding": ["audit:cdc-qualitative-coding"],
    "experimental": ["audit:openstax-experimental-research"],
    "node/edge": ["audit:networkx-nodes-edges"],
    "network edge": ["audit:networkx-nodes-edges"],
    "edge list": ["audit:networkx-nodes-edges"],
    "network tie": ["audit:networkx-nodes-edges"],
    "tie definition": ["audit:networkx-nodes-edges"],
    "rank tie": ["audit:r-rank-ties", "audit:r-cor-test-ties"],
    "gis": ["audit:esri-gis-definition"],
    "geographic information system": ["audit:esri-gis-definition"],
    "calibration": ["audit:scikit-learn-probability-calibration", "audit:aapor-survey-weighting"],
    "qualitative": ["audit:openstax-sociology-research-methods-3e", "audit:cdc-evaluation-step4-credible-evidence"],
    "quantitative": ["audit:openstax-sociology-research-methods-3e", "audit:cdc-evaluation-step4-credible-evidence"],
    "evaluation": ["audit:cdc-evaluation-framework-2024"],
    "impact evaluation": ["audit:cdc-evaluation-framework-2024"],
    "process evaluation": ["audit:cdc-evaluation-framework-2024"],
    "theory of change": ["audit:cdc-evaluation-framework-2024"],
    "causal inference": ["audit:cdc-evaluation-framework-2024"],
    "causal": ["audit:cdc-evaluation-framework-2024"],
    "quasi-experimental": ["audit:cdc-evaluation-framework-2024"],
    "sampling": ["audit:openstax-sociology-research-methods-3e", "audit:cdc-evaluation-step4-credible-evidence"],
    "sample": ["audit:openstax-sociology-research-methods-3e"],
    "representative": ["audit:openstax-sociology-research-methods-3e"],
    "measurement": ["audit:cdc-evaluation-step4-credible-evidence", "audit:worldbank-dime-measurement"],
    "construct": ["audit:cdc-evaluation-step4-credible-evidence"],
    "reliability": ["audit:cdc-evaluation-step4-credible-evidence"],
    "validity": ["audit:cdc-evaluation-step4-credible-evidence"],
    "fieldwork": ["audit:openstax-sociology-research-methods-3e"],
    "mixed methods": ["audit:cdc-evaluation-step4-credible-evidence", "src:mixed-methods-designs"],
    "ai": ["audit:nist-ai-glossary"],
    "llm": ["audit:nist-generative-ai-profile"],
    "machine learning": ["audit:nist-ai-glossary", "audit:nist-supervised-learning"],
    "classification": ["audit:nist-supervised-learning"],
    "supervised learning": ["audit:nist-supervised-learning"],
    "validation": ["audit:nist-ai-rmf-measure", "audit:cdc-evaluation-step4-credible-evidence"],
    "bias": ["audit:nist-ai-rmf-measure", "audit:cdc-evaluation-step4-credible-evidence"],
    "simulation": ["audit:comses-abm-faq", "audit:annual-review-computational-social-science"],
    "computational": ["audit:annual-review-computational-social-science"],
    "inference": ["audit:openstax-statistical-inference"],
    "spss": ["audit:ibm-spss-docs"],
    "ibm": ["audit:ibm-spss-docs"],
    "codebook": ["audit:cdc-qualitative-coding", "audit:cdc-codebook", "audit:samhsa-codebook", "audit:ukds-codebook"],
    "agent-based modelling": ["audit:comses-abm-faq", "audit:ncrm-abm-social-research", "audit:national-academies-abm-policy"],
    "agent-based model": ["audit:comses-abm-faq"],
    "abm": ["audit:comses-abm-faq"],
    "odd": ["audit:comses-odd-standards"],
    "ml": ["audit:nist-ai-glossary", "audit:nist-supervised-learning"],
    "network analysis": ["audit:ncrm-social-network-analysis"],
    "social network analysis": ["audit:ncrm-social-network-analysis", "audit:networkx-nodes-edges"],
    "psychometrics": ["audit:psychometric-society", "audit:apa-testing-assessment"],
    "transcription": ["audit:ukds-transcription"],
    "kobotoolbox": ["audit:kobotoolbox-collection"],
    "kobocollect": ["audit:kobotoolbox-collection"],
    "prevalence": ["audit:cdc-prevalence"],
    "forecast": ["audit:otexts-forecasting", "audit:r-arima-time-series"],
    "arima": ["audit:r-arima-time-series"],
    "nbs": ["audit:nbs-about"],
    "ria": ["audit:oecd-ria"],
    "nonresponse": ["audit:aapor-standard-definitions"],
    "nonresponse bias": ["audit:aapor-standard-definitions"],
    "esco": ["audit:esco-official"],
    "utme": ["audit:jamb-2024-examination-manual"],
    "parameter": ["audit:openstax-statistics-terms"],
    "variable": ["audit:openstax-statistics-terms"],
    "algorithm": ["audit:nist-algorithm"],
    "algorithms": ["audit:nist-algorithm"],
    "triangulation": ["audit:fsa-social-research-methods", "audit:cdc-evaluation-framework-2024"],
    "centrality": ["audit:ncrm-social-network-analysis", "audit:networkx-nodes-edges"],
    "probit": ["audit:stata-probit"],
    "gdp": ["audit:imf-gdp"],
    "focus group": ["audit:govuk-focus-groups"],
    "cognitive pretesting": ["audit:ons-cognitive-testing"],
    "logic model": ["audit:cdc-evaluation-framework-2024"],
    "model assumptions": ["audit:statsmodels-regression-diagnostics"],
    "psytoolkit": ["audit:psytoolkit-library"],
    "opensesame": ["audit:opensesame-docs"],
    "odk": ["audit:odk-docs"],
    "jasp": ["audit:jasp-official"],
    "item response theory": ["audit:pmc-scale-invariance"],
    "irt": ["audit:pmc-scale-invariance"],
    "confirmatory factor analysis": ["audit:pmc-scale-invariance"],
    "cfa": ["audit:pmc-scale-invariance"],
    "measurement invariance": ["audit:pmc-scale-invariance"],
    "lasso": ["audit:sklearn-lasso"],
    "systematic review": ["audit:cochrane-systematic-review"],
    "systematic reviews": ["audit:cochrane-systematic-review"],
    "scoping review": ["audit:jbi-scoping-review"],
    "participant observation": ["audit:pmc-participant-observation"],
    "readme": ["audit:github-readme"],
    "cpi": ["audit:nbs-cpi-methodology"],
    "npc": ["audit:npc-mandate"],
    "roi": ["audit:bdc-roi"],
    "ca": ["audit:ucla-conversation-analysis"],
    "odd protocol": ["audit:comses-odd-standards"],
    "binary outcome": ["audit:penn-state-logistic-regression"],
    "statistical test": ["audit:openstax-hypothesis-testing"],
    "measurement error": ["audit:cosmin-manual"],
    "statistical model": ["audit:national-academies-statistical-model"],
    "classical test theory": ["audit:govuk-test-development-handbook"],
    "item fit": ["audit:govuk-test-development-handbook"],
    "dif": ["audit:govuk-test-development-handbook"],
    "confidence interval": ["audit:psu-confidence-interval"],
    "frequentist": ["audit:psu-confidence-interval"],
    "generalized linear model": ["audit:psu-generalized-linear-model"],
    "glm": ["audit:psu-generalized-linear-model"],
    "arma": ["audit:nist-arma-autocorrelation"],
    "autocorrelation": ["audit:nist-arma-autocorrelation"],
    "difference-in-differences": ["audit:worldbank-did-rdd"],
    "regression discontinuity": ["audit:worldbank-did-rdd"],
    "counterfactual": ["audit:worldbank-counterfactual"],
    "multiple comparisons": ["audit:psu-multiple-comparisons"],
    "auc": ["audit:sklearn-classifier-metrics"],
    "classifier": ["audit:sklearn-classifier-metrics"],
    "precision": ["audit:sklearn-classifier-metrics"],
    "recall": ["audit:sklearn-classifier-metrics"],
    "covariate": ["audit:stata-covariate-glossary"],
    "aapor": ["audit:aapor-about"],
    "afrisenti": ["audit:afrisenti-acl-paper"],
    "ai rmf": ["audit:nist-ai-rmf-framework"],
    "atrs": ["audit:govuk-atrs"],
    "cbn": ["audit:cbn-about"],
    "cdf": ["audit:psu-cdf"],
    "crs": ["audit:qgis-coordinate-reference-system"],
    "geopandas": ["audit:geopandas-projections"],
    "case studies": ["audit:openstax-case-study"],
    "discourse analysis": ["audit:bcu-critical-discourse-analysis"],
    "jamb": ["audit:jamb-2024-examination-manual"],
    "jbi": ["audit:jbi-scoping-review"],
    "latent mean": ["audit:pmc-scale-invariance"],
    "natural language processing": ["audit:stanford-nlp"],
    "ncrm": ["audit:ncrm-social-network-analysis"],
    "nist": ["audit:nist-ai-glossary", "audit:nist-ai-rmf-framework"],
    "oecd": ["audit:oecd-ria"],
    "prisma": ["audit:jbi-scoping-review", "audit:cochrane-systematic-review"],
    "sentiment analysis": ["audit:afrisenti-acl-paper"],
    "text mining": ["audit:nltk-official", "audit:stanford-nlp"],
    "tokenization": ["audit:nltk-official", "audit:stanford-nlp"],
    "ukds": ["audit:ukds-transcription", "audit:ukds-codebook"],
    "bayesian": ["audit:psu-bayesian-nonparametric"],
    "caqdas": ["audit:surrey-caqdas"],
    "cdc": ["audit:cdc-qualitative-methods"],
    "desa": ["audit:un-desa-about"],
    "efa": ["audit:apa-factor-analysis"],
    "gfsm": ["audit:imf-gfsm"],
    "homophily": ["audit:uf-homophily"],
    "icls": ["audit:unstats-labour-standards"],
    "ilo": ["audit:unstats-labour-standards", "audit:un-about-and-agencies"],
    "imf": ["audit:un-about-and-agencies", "audit:imf-gfsm"],
    "inter-coder reliability": ["audit:cdc-qualitative-methods"],
    "ndpa": ["audit:ndpc-annual-report"],
    "ndpc": ["audit:ndpc-annual-report"],
    "nonparametric": ["audit:psu-bayesian-nonparametric"],
    "rmf": ["audit:nist-ai-rmf-framework"],
    "sna": ["audit:unstats-system-national-accounts"],
    "semi-structured interview": ["audit:cdc-qualitative-methods"],
    "structured interview": ["audit:cdc-qualitative-methods"],
    "un": ["audit:un-about-and-agencies"],
    "unesco": ["audit:un-about-and-agencies"],
    "who": ["audit:un-about-and-agencies"],
    "unsd": ["audit:un-desa-about"],
    "familysearch": ["audit:familysearch-catalog"],
    "limesurvey": ["audit:limesurvey-manual"],
    "maxqda": ["audit:maxqda-official"],
    "opendronemap": ["audit:opendronemap-docs"],
    "openrefine": ["audit:openrefine-manual"],
    "pysal": ["audit:pysal-esda-guide"],
    "qualcoder": ["audit:qualcoder-docs"],
    "ppu": ["audit:microsoft-powerbi-licenses"],
    "csv": ["audit:ietf-csv-rfc4180"],
    "dna": ["audit:nhgri-dna-glossary"],
    "uri": ["audit:ietf-uri-rfc3986"],
    "url": ["audit:ietf-uri-rfc3986"],
    "pmi": ["audit:pmi-about"],
    "sas": ["audit:sas-stat-overview"],
    "sas/stat": ["audit:sas-stat-overview"],
    "residual": ["audit:nist-regression-residual"],
    "lisa": ["audit:geoda-lisa-glossary"],
    "nhrec": ["audit:nhrec-official"],
    "gui": ["audit:nist-gui-it"],
    "it": ["audit:nist-gui-it"],
}
GLOSSARY_SOURCE_CHECKED_NOTES = {
    "population": "Source-checked: distinguishes human population in a place/group from the broader set of units a study aims to describe; retains context limits.",
    "target population": "Source-checked: identifies the full study group and tells the learner to state inclusion and place/time boundaries.",
    "coding": "Source-checked: distinguishes labelling qualitative evidence from writing instructions a computer can run.",
    "qualitative coding": "Source-checked: explains labels as retrieval and comparison aids, not as findings by themselves.",
    "experimental": "Source-checked: distinguishes a study that changes/assigns a condition from an approach that is still being tried.",
    "node/edge": "Source-checked: defines the network representation and makes clear an edge records a link in the graph.",
    "network edge": "Source-checked: defines an edge as a represented connection between two network entities.",
    "edge list": "Source-checked: defines an edge list as pairs of entities with recorded connections, optionally with details attached to each connection.",
    "network tie": "Source-checked: defines a tie as a recorded relationship and says the study must state what counts.",
    "tie definition": "Source-checked: states the rule used to decide which relationship counts as a network connection.",
    "rank tie": "Source-checked: distinguishes equal ranked values from social-network relationships and notes that handling depends on the procedure.",
    "gis": "Source-checked: describes GIS as a location-linked information system, not merely one software product.",
    "geographic information system": "Source-checked: describes the system's location-linked data, mapping and analysis functions.",
    "calibration": "Source-checked: distinguishes model-output calibration from survey-weight adjustment.",
    "social science": "Source-checked: defines the field by its study of people, groups and societies, with its limits tied to an educational classification and introductory sociology source.",
    "social sciences": "Source-checked: names the wider group of social-science fields without claiming one shared method.",
    "social institution": "Source-checked: explains social institutions as lasting arrangements and organizations that shape shared life.",
    "social institutions": "Source-checked: explains social institutions as lasting arrangements and organizations that shape shared life.",
    "research question": "Source-checked: describes a focused question as the starting point that guides the study plan and evidence choice.",
    "evidence": "Source-checked: describes evidence as information used to answer a question, while leaving claim strength dependent on the study and data.",
    "combined research design": "Source-checked: distinguishes a planned combination of methods and the need to explain how their results connect.",
    "behavioural research": "Source-checked: describes study of human behaviour and its social setting without implying clinical diagnosis or treatment.",
    "administrative records": "Source-checked: distinguishes service and record-keeping information from information collected primarily for a research question.",
    "informed consent": "Source-checked: includes accessible information and a voluntary decision about participation and data use.",
    "ethics review": "Source-checked: describes review of risks, rights and safeguards without treating review as a guarantee of no harm.",
    "digital traces": "Source-checked: describes records produced through interactions with digital services and their scope limits.",
    "digital trace": "Source-checked: describes a record of digital-service activity, not a complete account of a person.",
    "data": "Source-checked: covers numeric, written and observed records as data, links what is collected to a research question and keeps missing or uneven records within the interpretation limits.",
    "qualitative": "Source-checked: distinguishes word-based and observational material used to understand experiences and context from numerical summaries; it does not claim qualitative work is inherently incomparable.",
    "quantitative": "Source-checked: explains numerical information as a way to compare patterns and summarize answers, while leaving suitability dependent on the study question and measurement.",
    "evaluation": "Source-checked: covers programme design or delivery, reach and change; distinguishes assessing outcomes from establishing causation.",
    "impact evaluation": "Source-checked: includes comparison with an estimate of outcomes without the programme and limits causal claims to the design and assumptions.",
    "process evaluation": "Source-checked: focuses on how a programme was delivered and whom it reached; does not treat implementation evidence as a causal effect.",
    "theory of change": "Source-checked: explains the expected steps and assumptions linking programme activities to intended outcomes, not evidence that the steps occurred or worked.",
    "causal inference": "Source-checked: explains the comparison between observed outcomes and a plausible no-action outcome, with design assumptions limiting the conclusion.",
    "causal": "Source-checked: distinguishes a cause-and-effect claim from two measures changing together and points to comparison designs as evidence for stronger claims.",
    "quasi-experimental": "Source-checked: identifies comparisons without random assignment and notes that pre-existing differences can still affect results.",
    "sampling": "Source-checked: explains selecting cases from a wider group and links selection and participation to what findings can represent.",
    "sample": "Source-checked: defines the cases studied as a subset of a wider target group and does not imply the subset represents that group automatically.",
    "representative": "Source-checked: ties representativeness to relevant features of a defined population and to who was selected and responded.",
    "measurement": "Source-checked: connects an abstract research question to recorded answers or observations; adds a concrete example and the need to check what the measure captures.",
    "construct": "Source-checked: distinguishes the idea a study wants to assess from the indicator or measure used to represent it.",
    "reliability": "Source-checked: describes consistency under comparable conditions, without treating repeatability as proof of validity.",
    "validity": "Source-checked: describes whether the measure fits the intended idea and use, separate from consistency.",
    "fieldwork": "Source-checked: describes gathering information in people's everyday settings and clarifies that the setting shapes what is observed.",
    "mixed methods": "Source-checked: requires purposeful use of both qualitative and quantitative evidence and a plan to bring results together.",
    "ai": "Source-checked: describes AI as systems producing predictions, recommendations or decisions for defined objectives; avoids implying human understanding.",
    "llm": "Source-checked: explains language generation and adds that fluent outputs may contain false facts or citations and need checking.",
    "machine learning": "Source-checked: explains learning patterns from examples for new cases; does not treat prediction as causal explanation.",
    "classification": "Source-checked: explains assignment to named labels and the need to check category fit and errors.",
    "validation": "Source-checked: requires checking a system or measure for the intended setting and documents limits to generalization.",
    "bias": "Source-checked: describes systematic influence on representation or results; it does not imply that bias is always intentional.",
    "anova": "Source-checked: explains the one-way comparison of group averages through between-group and within-group variation; the test does not identify which groups differ.",
    "chi-square": "Source-checked: describes comparing observed category counts with counts expected under a stated assumption and distinguishes common chi-square questions; the counts and test assumptions must fit.",
    "case study": "Source-checked: defines an in-depth study of a bounded case, allows evidence such as records, interviews and observation, and avoids implying one case represents everyone.",
    "content analysis": "Source-checked: frames content analysis as planned, systematic examination of existing communication in relation to a research question; the introductory source illustrates secondary material.",
    "scale construction": "Source-checked: treats scale development as defining an idea, creating items and gathering evidence that the instrument represents the idea and works for its intended population and use.",
    "factor analysis": "Source-checked: connects factor analysis with examining the internal structure of measurement items; it is one form of evidence and does not by itself establish validity.",
    "multilevel": "Source-checked: explains grouped observations and why cases from the same school, household or other group may be related; the design determines how that clustering is modeled.",
    "qgis": "Source-checked: identifies QGIS as free and open-source geographic information system software and separates its capabilities from choosing an appropriate analysis.",
    "casevo": "Source-checked: expands the name and describes an open-source Python framework for multi-agent social simulation, while keeping its demonstrated outputs distinct from validated real-world predictions.",
    "document analysis": "Source-checked: describes studying existing documents as evidence, considering their content, authorship, purpose and omissions; it may complement evidence collected directly.",
    "field notes": "Source-checked: treats field notes as records accompanying observation and interviews, and keeps them distinct from recordings and transcripts.",
    "spatial analysis": "Source-checked: defines spatial analysis through examination of locations, attributes, patterns and relationships in location-linked information to answer a question.",
    "conversation analysis": "Source-checked: emphasizes naturally occurring recorded interaction and close analysis of how turns and actions unfold in sequence.",
    "probability": "Source-checked: defines probability as a measure of how likely a specified event is under stated conditions, bounded from zero to one.",
    "coefficient": "Source-checked: describes a coefficient as a value in a model or calculation whose interpretation depends on the model and scale; it is not automatically a causal effect.",
    "api": "Source-checked: explains an API as defined software rules that let programs request information or actions from another program or service.",
    "transcript": "Source-checked: distinguishes a written record of speech or interaction from the original recording and notes that transcription conventions shape what is preserved.",
    "longitudinal": "Source-checked: explains repeated measurement over time, including repeated surveys of the same people, without treating all longitudinal studies as identical panel designs.",
    "nlp": "Source-checked: describes computer methods for tasks involving text or speech, such as classification or extraction, without claiming human-like understanding.",
    "text analysis": "Source-checked: covers planned interpretation or rule-based examination of text and distinguishes language-processing tasks from close reading in context.",
    "null hypothesis": "Source-checked: defines the null as a stated starting claim assessed against sample evidence and avoids saying that a test proves either claim.",
    "hypothesis testing": "Source-checked: describes comparison of sample evidence with a stated null claim and preserves the distinction between rejecting and proving a claim.",
    "test statistic": "Source-checked: places the calculated statistic in the process of judging evidence against the null, without treating it as the substantive conclusion.",
    "p-value": "Source-checked: follows the conditional probability definition under the null and distinguishes it from the probability that the hypothesis is true.",
    "p-values": "Source-checked: follows the conditional probability definition under the null and distinguishes it from the probability that the hypothesis is true.",
    "statistical significance": "Source-checked: ties the label to a preselected cutoff and states that it does not establish importance, causation or certainty.",
    "variance": "Source-checked: describes spread around the average and retains the calculation's squared-distance basis.",
    "standard error": "Source-checked: describes sampling variation of a calculated quantity under repeated study samples, separate from other sources of error.",
    "correlation": "Source-checked: describes direction and strength of association and states that correlation alone does not establish cause.",
    "pearson correlation": "Source-checked: describes straight-line association between paired numerical measures and preserves its non-causal interpretation.",
    "pearson correlation coefficient": "Source-checked: gives the coefficient's direction/strength meaning and the conditions stated in the R documentation.",
    "spearman correlation": "Source-checked: describes rank-based association and distinguishes it from Pearson's straight-line measure.",
    "spearman rank correlation": "Source-checked: describes rank-based association and distinguishes it from Pearson's straight-line measure.",
    "regression": "Source-checked: defines regression as modelling an outcome's association with predictors and does not imply causation.",
    "linear regression": "Source-checked: explains a fitted straight-line relationship, residual checks and limits on prediction beyond the observed range.",
    "logistic regression": "Source-checked: describes modelling the odds of a binary outcome from predictors; it does not imply a causal effect.",
    "training data": "Source-checked: identifies examples used to fit a model and preserves the separation needed for an honest evaluation.",
    "test data": "Source-checked: keeps held-out examples away from fitting and model-choice decisions to avoid optimistic evaluation.",
    "validation data": "Source-checked: describes data used to compare/tune model choices before a final test set is used.",
    "data leakage": "Source-checked: explains that using information unavailable at prediction time can make estimated model performance look better than it is.",
    "supervised learning": "Source-checked: describes learning from labelled examples to predict labels or values, not all machine learning.",
    "simulation": "Source-checked: describes a model run under stated rules to explore possible outcomes and explicitly avoids treating those outcomes as real-world predictions.",
    "computational": "Source-checked: preserves the social-science field's combination of computational procedures and social questions/data rather than equating it with using a computer.",
    "inference": "Source-checked: describes drawing conclusions about a wider group from sample evidence and retains the conditions required for that step.",
    "spss": "Source-checked: identifies SPSS as statistical-analysis software and separates software features from method choice or interpretation.",
    "ibm": "Source-checked: identifies IBM as the company that develops SPSS, without implying IBM's software validates an analysis.",
    "codebook": "Source-checked: distinguishes a text-analysis guide defining labels and when to use them from a dataset guide explaining fields and recorded values.",
    "agent-based modelling": "Source-checked: explains represented agents and interactions, gives a social-science use and states that models are exploratory rather than certain predictions.",
    "agent-based model": "Source-checked: defines the represented population and interactions and retains limits on interpreting model output as real-world behavior.",
    "abm": "Source-checked: expands the acronym to agent-based modelling and describes interactions among represented people or groups.",
    "odd": "Source-checked: expands Overview, Design concepts and Details as a description format; it is documentation, not validation.",
    "ml": "Source-checked: expands the acronym as machine learning and does not treat the category as synonymous with supervised classification.",
    "network analysis": "Source-checked: connects network position and structure to questions about social ties, information/behavior spread and access to resources.",
    "social network analysis": "Source-checked: explains representing entities and recorded relationships, then examining patterns in those connections.",
    "psychometrics": "Source-checked: explains the construction and evaluation of measures linking observable answers to attributes, with validity depending on purpose and evidence.",
    "transcription": "Source-checked: defines transcription as conversion from audio to text and explains how conventions affect the preserved record.",
    "kobotoolbox": "Source-checked: identifies the platform's web-form and mobile collection options while preserving their different device and offline conditions.",
    "kobocollect": "Source-checked: identifies KoboCollect as the Android app and limits offline collection to forms downloaded and configured as described.",
    "prevalence": "Source-checked: defines a time-bounded number or proportion of a defined group with an existing condition or characteristic, distinguishing new cases.",
    "forecast": "Source-checked: describes an estimate of a future value based on available information and retains forecast uncertainty and accuracy limits.",
    "arima": "Source-checked: expands the ARIMA components and describes its use for ordered observations while preserving model-assumption limits.",
    "nbs": "Source-checked: identifies the National Bureau of Statistics as Nigeria's national agency coordinating official statistics, without implying that every statistic published in Nigeria comes from NBS.",
    "ria": "Source-checked: explains regulatory impact assessment as defining a problem, comparing practical policy and non-policy options, assessing likely effects and planning evaluation.",
    "nonresponse": "Source-checked: describes selected people who do not participate or skip answers and distinguishes the response rate from evidence of actual bias.",
    "nonresponse bias": "Source-checked: explains that bias can occur when respondents and nonrespondents differ on a characteristic relevant to a particular survey estimate; a low response rate alone does not prove bias.",
    "esco": "Source-checked: expands the European classification name and identifies its occupation and skills links as a European reference, not a universal or Nigeria-specific classification.",
    "utme": "Source-checked: gives the Nigerian examination's full name and its administering body from the JAMB manual.",
    "parameter": "Source-checked: distinguishes a numerical feature of a population from a statistic calculated from a sample.",
    "variable": "Source-checked: defines a variable as a characteristic of interest that may take different values, including non-numeric categories.",
    "algorithm": "Source-checked: defines an algorithm as a clearly specified process or set of rules that yields a result when followed; the student copy adds the relevant computer context.",
    "algorithms": "Source-checked: defines algorithms as clearly specified procedures or rule sets that produce results when followed.",
    "triangulation": "Source-checked: describes comparing different evidence sources or methods to understand agreement and disagreement; combined evidence is not automatic proof.",
    "centrality": "Source-checked: treats centrality as a set of measures of network position, with different measures capturing different forms of prominence or connection.",
    "probit": "Source-checked: explains probit as modeling a binary outcome probability using the standard normal cumulative curve; reported coefficients are not themselves probabilities.",
    "gdp": "Source-checked: defines GDP as the value of final goods and services produced within a country's borders during a stated period and notes major exclusions such as unpaid household work.",
    "focus group": "Source-checked: describes a facilitated discussion that studies participants' views and experiences, including how group interaction shapes the discussion.",
    "logic model": "Source-checked: explains a logic model as a map of the expected links from a programme's resources and activities to outputs and intended outcomes; it is a theory of how work should lead to change, not evidence that it did.",
    "model assumptions": "Source-checked: describes conditions a model relies on and the need to inspect whether its remaining patterns or errors suggest those conditions may not fit.",
    "cognitive pretesting": "Source-checked: explains trying draft questions with respondents and asking how they understood and answered them so wording or response problems can be revised before wider use.",
    "model fit": "Source-checked: describes how closely model predictions match observed patterns and makes clear that close fit alone does not validate a model or its assumptions.",
    "model diagnostics": "Source-checked: describes checks of residual patterns, influence and model conditions; checks must be selected for the model and do not establish substantive validity by themselves.",
    "psytoolkit": "Source-checked: identifies PsyToolkit as a platform with browser-run cognitive psychology experiments and adaptable documented examples; a task still needs a suitable study design.",
    "opensesame": "Source-checked: identifies OpenSesame as software for building psychology, neuroscience and experimental-economics experiments; building the task does not validate it.",
    "odk": "Source-checked: expands ODK as Open Data Kit and explains its form-based mobile/web collection and offline synchronization workflow.",
    "jasp": "Source-checked: identifies JASP as free, open-source graphical statistical software supporting common classical and Bayesian analyses; method choice remains the researcher's responsibility.",
    "item response theory": "Source-checked: describes IRT as a family of measurement models linking item responses to an underlying ability or construct; the cited article discusses categorical scale items and measurement invariance.",
    "irt": "Source-checked: expands IRT as item response theory and explains its relationship to item responses and an underlying measured construct; the cited examples concern scale measurement.",
    "confirmatory factor analysis": "Source-checked: describes CFA as testing a proposed structure relating questionnaire items to underlying constructs; fit does not by itself prove that the construct is valid.",
    "cfa": "Source-checked: expands CFA as confirmatory factor analysis and describes checking a proposed item-to-construct structure; the cited study concerns ordinal scale items.",
    "measurement invariance": "Source-checked: explains the need to check that a measure functions sufficiently similarly across groups or times before comparing construct scores; the cited study compares CFA and IRT procedures for ordinal items.",
    "lasso": "Source-checked: describes Lasso as linear-model fitting with an L1 penalty that can shrink some coefficients to zero; selected inputs depend on data, tuning and correlated predictors and are not causes by default.",
    "systematic review": "Source-checked: describes a review that defines a question, searches using planned criteria and assesses the relevant evidence; statistical pooling is optional and depends on suitability.",
    "systematic reviews": "Source-checked: describes planned question-led searches and evidence assessment; systematic reviews do not automatically combine results statistically.",
    "scoping review": "Source-checked: describes a systematic map of the breadth and types of evidence on a topic, including concepts and gaps; it has a distinct purpose from an effectiveness review.",
    "participant observation": "Source-checked: explains that a researcher spends time in a setting and may take part or mainly observe, with the role shaped by the question and context.",
    "readme": "Source-checked: defines a project README as a starting document explaining what a software project is for and how to begin using it; dataset READMEs may document data instead.",
    "cpi": "Source-checked: defines Nigeria's CPI as the weighted average change over time in consumer prices for a basket of goods and services; basket and weights can change when rebased.",
    "npc": "Source-checked: expands NPC as Nigeria's National Population Commission and identifies its census, survey and population-information mandate.",
    "roi": "Source-checked: defines return on investment as financial return relative to investment cost and states that it does not capture every social or public value.",
    "ca": "Source-checked: expands CA as conversation analysis and describes close, sequential study of recorded naturally occurring interaction and turn-taking.",
    "odd protocol": "Source-checked: expands ODD as Overview, Design concepts and Details, a reporting format for describing agent-based models; it is a model-description protocol, not a simulation result.",
    "binary outcome": "Source-checked: defines a binary outcome as a response with two possible values, such as yes/no or success/failure; the data structure and model assumptions still matter.",
    "statistical test": "Source-checked: explains a test as comparing observed sample evidence with what would be expected under a stated assumption; it does not prove the assumption or explain a result's importance.",
    "measurement error": "Source-checked: describes measurement error as the difference between an observed score and the value the measure is intended to capture, with evaluation tailored to the instrument and use.",
    "statistical model": "Source-checked: describes a statistical model as equations and assumptions representing how recorded observations may have been produced, to summarize relationships or make predictions with uncertainty.",
    "exact test": "Source-checked: explains exact probability calculation using Fisher's test as the example, while explicitly retaining that each named exact test has its own assumptions.",
    "exact tests": "Source-checked: explains exact probability calculation using Fisher's test as the example; it does not imply a shared conditioning rule across all exact tests.",
    "separation": "Source-checked: defines complete separation as predictors perfectly classifying observations in a logistic model and warns that standard likelihood estimates may fail or grow without bound.",
    "confounding": "Source-checked: describes a third factor related to both exposure and outcome that can distort their observed association; the example is epidemiological and formal definitions depend on the causal framework.",
    "ethnography": "Source-checked: describes contextual study of practices using flexible evidence such as observation, conversations and records; not every study uses every method listed.",
    "reflexivity": "Source-checked: explains ongoing examination of how the researcher's position, assumptions, relationships and choices shape evidence and interpretation.",
    "reflexive": "Source-checked: describes deliberately examining how a researcher's position and involvement shape the study and its interpretation.",
    "psychopy": "Source-checked: identifies PsychoPy as software with a graphical Builder and Python coding workflow for creating psychology experiments; does not validate an experiment design.",
    "arcgis": "Source-checked: identifies ArcGIS Pro as a product with tools for location-based analysis, data preparation, pattern exploration and mapping; software capability does not establish method fit.",
    "geoda": "Source-checked: identifies GeoDa as software for exploring mapped data and spatial patterns, including measures that depend on a defined neighbor structure.",
    "spatial autocorrelation": "Source-checked: defines spatial autocorrelation as association between values across locations and makes the selected spatial-neighbor structure explicit; it does not explain the cause of a pattern.",
    "moran's i": "Source-checked: describes Moran's I as a measure of global or local spatial clustering/outliers under a stated spatial-weights structure, not a causal explanation.",
    "critical discourse analysis": "Source-checked: explains study of language in context to examine social problems, power and inequality; it can combine computational pattern finding with close interpretation.",
    "cda": "Source-checked: expands CDA to critical discourse analysis and keeps its focus on language, social context, power and inequality.",
    "historical research": "Source-checked: explains research using evidence about the past and the critical examination of sources for authenticity and accuracy.",
    "netlogo": "Source-checked: identifies NetLogo as a programmable environment for simulations of natural and social phenomena; the software does not validate a model's rules or predictions.",
    "nltk": "Source-checked: identifies NLTK as an open-source Python toolkit for tasks such as tokenization, classification, tagging and parsing, without implying it interprets language like a person.",
    "process tracing": "Source-checked: describes examining evidence and event sequences within a case to develop or test a proposed causal mechanism; it can be combined with other methods and does not estimate a population average effect.",
    "negative binomial": "Source-checked: identifies the negative-binomial generalized linear model for count outcomes and its estimated dispersion parameter; model choice still depends on design and diagnostics.",
    "nowcast": "Source-checked: defines a nowcast as a running estimate of current-period conditions made before complete official data are available; the estimate can change and remain uncertain.",
    "nowcasts": "Source-checked: defines nowcasts as changing estimates of current-period conditions made before complete official data are available.",
    "bi": "Source-checked: expands BI as business intelligence in the Power BI context; the glossary does not define every business-intelligence practice.",
    "uk": "Source-checked: expands UK as the United Kingdom and identifies its four constituent nations; this does not establish current UK-EU legal arrangements.",
    "eu": "Source-checked: expands EU as European Union and describes it as a political and economic union; membership and legal claims require current sources.",
    "ordinary least squares": "Source-checked: explains OLS as fitting a linear model by minimizing the weighted or unweighted sum of squared residuals; ordinary least squares is the unweighted case.",
    "ols": "Source-checked: expands OLS to ordinary least squares and describes the least-squares fitting rule without implying causal interpretation.",
    "weighting": "Source-checked: describes survey weights as changing respondents' relative contributions to better match population characteristics; weights do not automatically fix coverage or measurement problems.",
    "rank test": "Source-checked: explains rank-based association procedures using Spearman and Kendall examples; other rank tests have their own hypotheses and requirements.",
    "randomized": "Source-checked: explains random assignment as using chance to allocate conditions in an experiment; randomization does not remove every study limitation.",
    "node": "Source-checked: defines a network node as a represented entity such as a person, group or organization; a node is not itself proof about a real-world entity.",
    "odds ratio": "Source-checked: defines an odds ratio as the ratio between the odds of an outcome under two conditions; values describe relative odds and are not the same as relative risks or probabilities.",
    "classical test theory": "Source-checked: explains the observed score as containing a true-score component and measurement error, and distinguishes this framework from item-response models.",
    "item fit": "Source-checked: describes checking whether observed item responses are consistent with the chosen measurement model; a fit result alone does not prove the model or construct is correct.",
    "dif": "Source-checked: explains differential item functioning as different item performance between groups with similar overall measured ability; the statistic flags a difference but does not identify its cause or prove bias.",
    "confidence interval": "Source-checked: defines an interval procedure whose long-run coverage is set by its confidence level; avoids claiming that the fixed parameter has a post-data probability of lying in the observed interval.",
    "frequentist": "Source-checked: explains inference through the long-run behaviour of procedures across repeated samples, rather than treating an unknown fixed parameter as a random quantity after observing data.",
    "generalized linear model": "Source-checked: describes a model family that relates an outcome distribution to predictors through a link function, including linear, logistic and Poisson regression as cases.",
    "glm": "Source-checked: expands GLM as generalized linear model and summarizes the response-distribution and link-function structure without implying a single outcome type.",
    "arma": "Source-checked: expands ARMA as autoregressive moving-average and explains that it models a time series using prior series values and prior shocks.",
    "autocorrelation": "Source-checked: defines autocorrelation as association between values of the same series at different time points or lags; the pattern does not by itself explain why values persist.",
    "difference-in-differences": "Source-checked: describes comparing outcome changes over time between a treated group and a comparison group, and notes that a parallel-trends assumption underpins causal interpretation.",
    "regression discontinuity": "Source-checked: explains comparison of observations close to either side of an assignment cutoff and limits the estimate to the local setting around that cutoff.",
    "counterfactual": "Source-checked: describes the outcome that would have occurred for the same unit or group under an alternative condition; it is not directly observed and must be estimated through a defensible design.",
    "multiple comparisons": "Source-checked: explains that conducting a family of tests increases the chance of at least one false positive and that correction procedures manage, but do not erase, this tradeoff.",
    "auc": "Source-checked: expands AUC as area under a curve and requires the named curve; for ROC-AUC, it summarizes ranking discrimination across classification thresholds, not calibration or causal effect.",
    "classifier": "Source-checked: describes a classifier as a model or rule assigning cases to categories, with performance assessed against labelled cases on suitable evaluation data.",
    "precision": "Source-checked: defines precision as the share of positive predictions that are correct; interpretation depends on class labels and evaluation data.",
    "recall": "Source-checked: defines recall as the share of actual positive cases identified by a classifier; interpretation depends on class labels and evaluation data.",
    "covariate": "Source-checked: explains a covariate as an explanatory variable included in a model; whether to control for it depends on the research question and study design.",
    "aapor": "Source-checked: expands AAPOR as the American Association for Public Opinion Research and describes it as a professional association that publishes survey guidance; its guidance is not itself local law or proof that a particular study is valid.",
    "afrisenti": "Source-checked: identifies AfriSenti as a labelled sentiment-analysis benchmark across 14 African languages; social-media posts and labels do not represent all speakers or public opinion.",
    "agent-based modeling": "Source-checked: treats modeling as the US spelling of agent-based modelling and describes a computer simulation of interacting, rule-following agents; simulated patterns depend on assumptions.",
    "ai rmf": "Source-checked: expands AI RMF as AI Risk Management Framework, identifies the NIST framework as voluntary and U.S.-developed, and notes that its version 1.0 is being revised.",
    "atrs": "Source-checked: expands ATRS as Algorithmic Transparency Recording Standard and describes its UK public-sector use for recording information about algorithmic tools; it is not a Nigerian legal mandate.",
    "cbn": "Source-checked: expands CBN as Central Bank of Nigeria and identifies its responsibilities in monetary policy and financial-system oversight.",
    "cdf": "Source-checked: expands CDF as cumulative distribution function and explains that it gives the probability a random variable is at or below a specified value.",
    "crs": "Source-checked: expands CRS as Coordinate Reference System and explains how it gives meaning to map coordinates and how software projects them for display.",
    "geopandas": "Source-checked: identifies GeoPandas as a Python library for geographic vector data and notes that coordinate reference information is needed for correct transformations and interpretation.",
    "case studies": "Source-checked: treats case studies as in-depth examination of a bounded case using evidence that fits the research question; a case study is not a guarantee that findings represent a wider population.",
    "discourse analysis": "Source-checked against a critical discourse-analysis example: discourse analysis studies how language is used in context; some approaches examine power and inequality, but not every approach uses that critical frame.",
    "jamb": "Source-checked: expands JAMB as the Joint Admissions and Matriculation Board, the Nigerian body that administers UTME and related admissions processes.",
    "jbi": "Source-checked: expands JBI as the Joanna Briggs Institute and explains that the cited manual provides a specific evidence-synthesis methodology, not a universal requirement for every review.",
    "latent mean": "Source-checked: describes a latent mean as the average level of an underlying construct estimated from observed indicators in a measurement model; comparisons require suitable model and invariance evidence.",
    "natural language processing": "Source-checked: explains natural language processing as computer methods for working with human language, such as classifying or extracting patterns from text; outputs still need contextual validation.",
    "ncrm": "Source-checked: expands NCRM as the National Centre for Research Methods and preserves the cited course's scope as an advanced social-network-analysis resource.",
    "nist": "Source-checked: expands NIST as the U.S. National Institute of Standards and Technology; its standards and frameworks have defined scope and do not automatically become Nigerian law.",
    "oecd": "Source-checked: expands OECD as the Organisation for Economic Co-operation and Development; its guidance and examples are international reference material, not Nigerian law.",
    "prisma": "Source-checked: expands PRISMA as Preferred Reporting Items for Systematic Reviews and Meta-Analyses and states that it is a reporting guideline, not a complete method for conducting a review.",
    "sentiment analysis": "Source-checked: describes computational classification of text for expressed positive, negative or neutral sentiment; labels are imperfect proxies for meaning and do not directly measure population opinion.",
    "text mining": "Source-checked: describes computer-assisted processing of text to find or summarize patterns across documents; the result depends on the text sample, language processing and validation against context.",
    "tokenization": "Source-checked: explains tokenization as splitting text into units such as words or subword pieces for later computer processing; token boundaries depend on the language and tool.",
    "ukds": "Source-checked: expands UKDS as the UK Data Service and preserves the cited materials' UK-specific context and access conditions.",
    "bayesian": "Source-checked: explains Bayesian updating as combining prior information with new evidence to obtain an updated probability; a Bayesian model also requires a specified likelihood and prior, not just a named software option.",
    "caqdas": "Source-checked: expands CAQDAS as Computer Assisted Qualitative Data Analysis Software and explains that such tools help organize, code and retrieve evidence but do not interpret it for the researcher.",
    "cdc": "Source-checked: expands CDC as the U.S. Centers for Disease Control and Prevention; the cited research-methods guidance is health-focused and is not a universal social-science rule.",
    "desa": "Source-checked: expands DESA in UN DESA as the Department of Economic and Social Affairs of the United Nations; its cited statistics methods still need their technical source.",
    "efa": "Source-checked: expands EFA as exploratory factor analysis, a method for exploring how observed measures may group around fewer underlying factors when that structure is not fixed in advance.",
    "gfsm": "Source-checked: expands GFSM as Government Finance Statistics Manual, the IMF framework for compiling and analyzing public-finance statistics; check the version and national implementation used in a dataset.",
    "homophily": "Source-checked: defines homophily as the tendency for relationships to form between people or groups with similar attributes; observed similarity does not by itself establish why a tie formed.",
    "icls": "Source-checked: expands ICLS as International Conference of Labour Statisticians, which develops recommendations and standards for comparable labour statistics through the ILO.",
    "ilo": "Source-checked: expands ILO as International Labour Organization and explains its role in international labour standards; standards and recommendations are not automatically local legal requirements.",
    "imf": "Source-checked: expands IMF as International Monetary Fund; its statistical manuals and guidance have defined uses and update cycles.",
    "inter-coder reliability": "Source-checked: describes inter-coder reliability as a way of examining how consistently different coders apply a coding scheme; agreement measures are not suitable for every qualitative approach and do not replace interpretation.",
    "ndpa": "Source-checked: expands NDPA as Nigeria Data Protection Act, 2023; naming the Act does not prove that a study or dataset complies with it or has ethics approval.",
    "ndpc": "Source-checked: expands NDPC as Nigeria Data Protection Commission, the Nigerian authority established under the Nigeria Data Protection Act; the acronym is institutional context, not a compliance determination.",
    "nonparametric": "Source-checked: describes nonparametric methods as methods that make fewer assumptions about a particular distribution; individual methods still have assumptions and design requirements.",
    "rmf": "Source-checked: expands RMF as risk management framework in the NIST AI RMF phrase; it is not a universal law or a prescribed sequence for every AI project.",
    "sna": "Source-checked: expands SNA in the national-accounts context as System of National Accounts, the international framework for compiling economic accounts; it is distinct from social network analysis.",
    "semi-structured interview": "Source-checked: explains a semi-structured interview as a guided conversation with planned topics and room for follow-up questions; the format is not interchangeable with a fixed-question structured interview.",
    "structured interview": "Source-checked: explains a structured interview as using a planned, consistent question format to support comparison; it serves different purposes from a more flexible semi-structured conversation.",
    "un": "Source-checked: expands UN as the United Nations and identifies it as an international organization; a UN source's recommendation does not automatically create a Nigerian legal duty.",
    "unesco": "Source-checked: expands UNESCO as the United Nations Educational, Scientific and Cultural Organization; its recommendations and guidance have international scope and are not automatically Nigerian law.",
    "who": "Source-checked: expands WHO as the World Health Organization; the cited material is health-focused and should not be presented as a universal social-science rule.",
    "unsd": "Source-checked: expands UNSD as the United Nations Statistics Division, which publishes international statistical standards and methods; check the specific standard and national implementation.",
    "familysearch": "Source-checked: identifies FamilySearch Catalog as a search tool for genealogical records, books, images and related resources; a catalogue match is not proof of identity or lineage.",
    "limesurvey": "Source-checked: identifies LimeSurvey as software for creating online surveys, collecting responses and exporting results; survey quality still depends on questionnaire design and sampling.",
    "maxqda": "Source-checked: identifies MAXQDA as qualitative and mixed-methods analysis software; software features support organizing evidence but do not interpret it for the researcher.",
    "opendronemap": "Source-checked: identifies OpenDroneMap as software for processing drone imagery into geospatial products; accuracy depends on input imagery, control and validation.",
    "openrefine": "Source-checked: identifies OpenRefine as software for inspecting, cleaning, transforming and reconciling tabular data; suggested corrections still need evidence and human checking.",
    "pysal": "Source-checked: identifies PySAL esda as Python software for exploratory spatial data analysis; spatial weights and method choices affect the results.",
    "qualcoder": "Source-checked: identifies QualCoder as free, open-source desktop software for qualitative data analysis; it supports coding and retrieval but does not replace interpretation.",
    "ppu": "Source-checked: expands PPU as Power BI Premium Per User and explains that sharing and access depend on each user's license and workspace capacity; check current terms.",
    "csv": "Source-checked: expands CSV as Comma-Separated Values, a common text file format for rows and fields; different programs may interpret formatting details differently.",
    "dna": "Source-checked: expands DNA as deoxyribonucleic acid, the molecule carrying genetic information; a DNA match alone does not establish a person's identity, family relationship or legal inheritance.",
    "uri": "Source-checked: expands URI as Uniform Resource Identifier, a label that identifies a resource; in the web context a URL is a locating form of URI, while an ESCO record URI is a technical identifier rather than student-facing explanation.",
    "url": "Source-checked: expands URL as Uniform Resource Locator, a web address that tells a browser where to request a resource; a public link does not mean that the linked data may be freely reused.",
    "pmi": "Source-checked: expands PMI as Project Management Institute, the professional association that publishes standards and offers learning and certifications; the acronym does not show that a credential is required for a role.",
    "sas": "Source-checked: identifies SAS as statistical software and distinguishes the product from the analysis method; capabilities and access depend on the product version and license.",
    "sas/stat": "Source-checked: identifies SAS/STAT as SAS software for statistical analyses and procedures; users still need to choose a suitable method and interpret its results.",
    "residual": "Source-checked: defines a regression residual as the observed outcome minus the model's predicted outcome for that case; residual patterns help diagnose fit but do not validate the entire analysis.",
    "lisa": "Source-checked: expands LISA as Local Indicators of Spatial Association and describes local statistics for finding spatial clusters or outliers; the result depends on a defined neighbor structure and statistical checks.",
    "nhrec": "Source-checked: expands NHREC as Nigeria's National Health Research Ethics Committee and limits the cited oversight to health research; it does not mean every social-science study is reviewed by NHREC.",
    "gui": "Source-checked: expands GUI as Graphical User Interface, the visual controls through which a person interacts with software, such as windows, menus, icons and buttons.",
    "it": "Source-checked: expands IT as information technology, covering computer equipment, software, services and systems used to handle information; this term is separate from the pronoun 'it'.",
}
GLOSSARY_FILE = "src/lib/studentExplanation.ts"
STATIC_DATA_FILES = (
    "data/career-mapping/_audit/sociology_theme_student_abilities_2026_10_22.json",
)

FIELDS = {
    "programme_theme": ("label", "summary", "description", "narration"),
    "programme_outcome": ("label", "description", "course_title", "course_code"),
    "programme_context": ("label", "description", "overview", "student_note"),
    "domain_route": ("label", "description", "overview", "student_orientation", "programme_transition", "meaning", "why_it_matters", "field_context", "learner_output"),
    "domain_learning_item": ("label", "meaning", "plain_language_meaning", "meaning_in_domain", "what_it_is", "why_it_matters", "field_context", "contextual_use", "how_used", "use_case", "learner_output", "limitations", "requirement_reason", "requirement_scope"),
    "domain_emerging_learning_item": ("label", "meaning", "plain_language_meaning", "meaning_in_domain", "why_it_matters", "field_context", "contextual_use", "how_used", "use_case", "learner_output", "limitations", "requirement_reason"),
    "domain_supplement_candidate": ("label", "meaning", "description", "why_it_matters", "contextual_use", "learner_output", "limitations"),
    "area_of_specialization": ("label", "description", "overview", "meaning", "why_it_matters", "field_context", "learner_output", "student_orientation"),
    "area_foundation": ("label", "meaning", "plain_language_meaning", "why_it_matters", "contextual_use", "learner_output", "limitations"),
    "area_task_family": ("label", "task_evidence_text", "meaning", "description", "learner_output", "task_conditions", "limitations"),
    "area_learning_item": ("label", "what_it_is", "meaning", "plain_language_meaning", "why_it_matters", "contextual_use", "learner_output", "limitations"),
    "area_tool_option": ("label", "meaning", "plain_language_meaning", "why_it_matters", "field_context", "contextual_use", "how_used", "use_case", "learner_output", "limitations"),
    "area_enrichment_item": ("label", "meaning", "plain_language_meaning", "what_it_is", "why_it_matters", "field_context", "contextual_use", "how_used", "use_case", "learner_output", "limitations", "prerequisites", "valid_alternatives", "complements"),
    "area_tool_application_reference": ("label", "meaning", "description", "contextual_use", "learner_output", "limitations"),
    "role": ("label", "description", "overview", "role_context_is_not_job_readiness"),
    "role_task_family": ("label", "task_evidence_text", "task_conditions", "learner_output", "task_output", "limitations"),
    "role_item_candidate": ("label", "meaning", "plain_language_meaning", "what_it_is", "contextual_use", "how_used", "use_case", "why_it_matters", "learner_output", "task_output", "limitations", "valid_alternatives"),
    "method_combination_design": ("label", "design", "why_combine", "how_used", "condition", "limits", "selection_rule"),
    "tool": ("label", "description", "meaning", "contextual_use", "limitations"),
    "runtime_learning_item": ("label", "meaning", "description", "why_it_matters", "contextual_use", "learner_output", "limitations"),
    "relationship_target": ("label", "meaning", "description", "contextual_use", "limitations"),
}

TERMS = [
    "administrative records", "agent-based modelling", "agent-based modeling",
    "algorithm", "algorithms", "analysis of variance", "ANOVA", "bias",
    "causal inference", "causal", "case-control", "chi-square", "coding", "qualitative coding", "combined research design", "behavioural research",
    "social science", "social sciences", "social institution", "social institutions", "research question", "evidence", "ethics review", "data",
    "computational", "confidence interval", "confounding", "construct",
    "content analysis", "correlation", "counterfactual", "digital trace",
    "digital traces", "discourse analysis", "effect size", "ethnography",
    "evaluation", "experimental", "factor analysis", "fieldwork", "inference",
    "inter-coder", "interview protocol", "longitudinal", "logistic regression",
    "machine learning", "measurement", "mixed methods", "model assumption",
    "model assumptions", "multilevel", "network analysis", "nonresponse",
    "operationalization", "operationalisation", "panel data", "p-value",
    "population", "target population", "prevalence", "psychometrics", "qualitative", "quantitative",
    "quasi-experimental", "randomized", "regression", "reliability",
    "representative", "sample", "sampling", "scale construction", "significance",
    "simulation", "social process", "statistical model", "statistical significance",
    "systematic review", "text analysis", "theory of change", "validity",
    "validation", "variable",
    # Quantitative methods and interpretation terms.
    "Bayesian", "frequentist", "probability distribution", "probability",
    "prior probability", "posterior probability", "null hypothesis",
    "alternative hypothesis", "hypothesis testing", "repeated measures",
    "factorial design", "group mean", "mean difference", "variance", "standard deviation",
    "standard error", "odds ratio", "coefficient", "effect size", "degrees of freedom",
    "statistical power", "confidence level", "sampling distribution", "parameter",
    "predictor", "covariate", "independent variable", "dependent variable",
    "categorical variable", "binary outcome", "ordinal data", "continuous data",
    "nonparametric", "non-parametric", "parametric", "rank test", "exact test",
    "multiple comparisons", "post hoc", "model fit", "calibration", "residual",
    "outlier", "influential observation", "separation", "generalized linear model",
    "ordinary least squares", "linear regression", "binary logistic regression",
    "probit", "Poisson regression", "negative binomial", "survival analysis",
    "time series", "panel data", "fixed effects", "random effects", "autocorrelation",
    "stationarity", "autoregressive", "moving average", "forecast", "nowcast",
    "ARIMA", "ARMA", "GLM", "OLS", "LASSO", "CFA", "EFA", "IRT", "DIF",
    # Qualitative and mixed research terms.
    "semi-structured interview", "structured interview", "focus group",
    "key informant", "transcript", "transcription", "thematic analysis",
    "discourse analysis", "critical discourse analysis", "conversation analysis",
    "reflexivity", "reflexive", "positionality", "saturation", "codebook",
    "inter-coder reliability", "intercoder reliability", "participant observation",
    "field notes", "document analysis", "content analysis", "process tracing",
    "case study", "case studies", "cross-sectional", "cohort study", "longitudinal study",
    "randomized controlled trial", "natural experiment", "field experiment",
    "difference-in-differences", "regression discontinuity", "instrumental variable",
    "propensity score", "selection bias", "response rate", "sampling frame",
    "stratified sampling", "cluster sampling", "weighting", "non-probability sample",
    "informed consent", "anonymization", "pseudonymization", "data minimization",
    # Computational, network and spatial analysis terms.
    "natural language processing", "text mining", "sentiment analysis", "topic modelling",
    "topic modeling", "tokenization", "embedding", "classification", "classifier",
    "supervised learning", "unsupervised learning", "training data", "test data",
    "held-out data", "cross-validation", "overfitting", "data leakage", "input feature",
    "target variable", "precision", "recall", "F1 score", "AUC", "ROC curve",
    "false positive", "false negative", "social network analysis", "centrality",
    "betweenness", "homophily", "modularity", "node", "node/edge", "network edge", "edge list", "network tie", "rank tie", "tie definition", "ego network",
    "spatial analysis", "spatial autocorrelation", "Moran's I", "GIS", "geographic information system",
    "geocoding", "choropleth map", "coordinate reference system", "LISA",
    "simulation", "agent-based model", "agent-based modelling", "agent-based modeling",
    "ODD protocol", "digital trace", "digital traces", "administrative record",
    "administrative records", "digital data donation",
    # Research evaluation and technical abbreviations.
    "logic model", "theory of change", "process evaluation", "impact evaluation",
    "outcome evaluation", "implementation fidelity", "counterfactual", "triangulation",
    "AI risk management framework", "AI RMF", "PPU", "JASP", "CASEVO", "CAQDAS",
    "CDA", "CA", "IPA", "CDF", "SAS/STAT", "JAMB", "UTME", "WEF",
    "model diagnostics", "diagnostic check", "diagnostic checks",
    "agent-based model", "impact evaluation", "process evaluation", "logic model",
    "null hypothesis", "measurement invariance", "latent mean", "factor loading",
    "item fit", "classical test theory", "experimental research", "non-experimental research",
    "descriptive research", "historical research", "cognitive pretesting", "Pearson correlation",
    "Spearman correlation", "analysis of variance", "nonresponse bias", "survey weight",
    "measurement error", "statistical test", "empirical evidence", "scoping review",
    "validation data", "standard errors", "standard error", "confidence level",
    "probability distribution", "posterior probability", "prior probability",
]
TERM_RE = re.compile(
    r"(?<![A-Za-z])(" + "|".join(re.escape(t) for t in sorted(TERMS, key=len, reverse=True)) + r")(?![A-Za-z])",
    re.I,
)
ACRONYM_RE = re.compile(r"\b(?:[A-Z]{2,}|[A-Z][a-z]+[A-Z][A-Za-z]+)\b")
EXCLUDED_ACRONYM_CONTEXTS = {
    "tv": (re.compile(r"\bnewspapers,\s*radio\s+and\s+TV\b", re.I),
           "In the audited media-role descriptions, TV means television in a list of media formats; it is not a statistical or methodological term."),
}
INTERNAL_RE = re.compile(
    r"\b(?:workpack|student_visible|requirement_lane|review status|"
    r"not independently rechecked|bounded to the saved record|candidate item|"
    r"role occurrence is provenance|role-list association is retained as provenance|"
    r"not adjudicate role fit|priority is a candidate|source[- ]backed (?:audit|review|status))\b", re.I
)
MOJIBAKE_RE = re.compile(
    r"(?:\u00e2\u20ac(?:[\u0080-\u00bf\u2013-\u201f\u2026\u2122])|"
    r"\u00c2[\u0080-\u00bf]|\u00c3[\u0080-\u00bf])"
)
GENERIC_AREA_RE = re.compile(
    r"used to carry out or explain this task family|research summary, not a claim that every practitioner", re.I
)
PANEL_RELATIONSHIPS = {
    "prerequisite_for", "builds_on", "requires", "works_with", "complements",
    "supports", "useful_for", "tool_for", "optional_analysis_tool",
    "optional_tool_option", "optional_collection_tool", "conditional_library",
    "visual_network_tool", "computational_network_tool", "simulation_framework",
    "specialist_simulation_tool", "specialist_extension_of", "alternative_to",
    "alternative_tool_option", "tool_alternative_for_role_task",
}
READY = {"source_backed", "approved", "contract_relationship_review", "resolved_ready_for_use"}

def flatten(value: Any) -> list[str]:
    if isinstance(value, str):
        return [value] if value.strip() else []
    if isinstance(value, list):
        return [text for item in value for text in flatten(item)]
    if isinstance(value, dict):
        return [text for item in value.values() for text in flatten(item)]
    return []

def candidate_terms(text: str) -> list[str]:
    course_code_spans = [m.span() for m in re.finditer(r"\b(?:ENT|GST|PSY|SOC|SSC)\b\s+\d{3}\s*:\s*\d+", text, re.I)]
    def is_course_code_prefix(start: int, end: int) -> bool:
        return any(left <= start and end <= right for left, right in course_code_spans)
    found = [m.group(0) for m in TERM_RE.finditer(text)
             if not is_course_code_prefix(*m.span())]
    found += [m.group(0) for m in ACRONYM_RE.finditer(text)
              if not is_course_code_prefix(*m.span())]
    result, seen = [], set()
    for word in found:
        key = word.casefold()
        excluded = EXCLUDED_ACRONYM_CONTEXTS.get(key)
        if excluded and excluded[0].search(text):
            continue
        if key in {"levelup", "youtube"}:
            continue
        if key == "atlas" and re.search(r"\bATLAS\.ti\b", text, re.I):
            continue
        if key == "core" and re.search(r"\bCORE\s+Econ\b", text, re.I):
            continue
        if key == "core" and word.isupper():
            continue
        if key == "stat" and re.search(r"\bSAS/STAT\b", text, re.I):
            continue
        if key == "youtube" and re.search(r"\bYouTube\s+Data\s+API\b", text, re.I):
            continue
        if key == "recall" and not re.search(r"\b(?:precision|F1|classifier|classification|positive cases?)\b", text, re.I):
            continue
        if key not in seen:
            seen.add(key)
            result.append(word)
    return result

def looks_like_source_code_fragment(text: str) -> bool:
    return bool(re.search(
        r"(?:=>|\|\||&&|[{}<>]|\btext\.includes\b|\b(?:const|return|useState|useMemo|useRef|StyleSheet|React|RefObject|ReturnType|NonNullable|ThemeKey|GuidanceRouteContext|ProgrammeTab|fontSize|borderColor)\b)",
        text,
    ))

def read_glossary_patterns() -> list[dict[str, str]]:
    """Extract helper rules without treating their definitions as UI copy."""
    source = (ROOT / GLOSSARY_FILE).read_text(encoding="utf-8")
    pattern = re.compile(r"\[/((?:\\.|[^/])*)/([a-z]*),\s*\"((?:\\.|[^\"\\])*)\"\]", re.S)
    entries = []
    for expression, flags, definition in pattern.findall(source):
        try:
            re.compile(expression, re.I if "i" in flags else 0)
        except re.error:
            continue
        entries.append({"pattern": expression, "flags": flags, "definition": definition})
    return entries

def matching_gloss(term: str, entries: list[dict[str, str]], context: str = "") -> dict[str, str] | None:
    # Require the rule to define this exact candidate term. An overlapping
    # compound is not a safe substitute: "data-intensive" cannot define
    # "data", and "computational social science" cannot define "social science".
    # Inline expansions are checked separately against the actual occurrence.
    for entry in sorted(entries, key=lambda x: len(x["pattern"]), reverse=True):
        flags = re.I if "i" in entry["flags"] else 0
        try:
            if re.fullmatch(entry["pattern"], term, flags):
                return entry
        except re.error:
            pass
    return None

def simulate_student_glossary_copy(value: str, entries: list[dict[str, str]]) -> str:
    """Approximate glossary expansion for one field in isolation.

    This deliberately does not model shared first-use state across cards or
    screen sections, so its word counts are an upper-bound review cue, not a
    count of rendered paragraphs or browser output.
    """
    candidates = []
    for order, entry in enumerate(entries):
        flags = re.I if "i" in entry["flags"] else 0
        try:
            match = re.search(entry["pattern"], value, flags)
        except re.error:
            continue
        if not match:
            continue
        after = value[match.end():]
        if re.match(r"\s*\(", after):
            continue
        if re.match(r"\s+\S+\s*,\s*which\b", after, re.I):
            continue
        if re.match(r"\s+(?:is|are|means|refers to)\s+(?:a|an|the)?\s*(?:record|set|collection|field|process|planned way|measure|form|system|software|information|range|method|study|computer-run|defined steps)\b", after, re.I):
            continue
        gloss = entry["definition"]
        open_paren = gloss.find(" (")
        explanation = gloss[open_paren + 2:-1] if open_paren >= 0 and gloss.endswith(")") else gloss
        full_name = explanation.split(";", 1)[0].split(",", 1)[0].strip().removeprefix("the ")
        before = value[:match.start()]
        if (match.group(0) == match.group(0).upper() and len(match.group(0)) > 1
                and len(full_name) > 2
                and re.search(re.escape(full_name) + r"\s*\($", before, re.I)
                and re.match(r"\s*\)", after)):
            continue
        candidates.append({
            "start": match.start(), "end": match.end(),
            "replacement": f"{match.group(0)} ({explanation})", "order": order,
        })
    candidates.sort(key=lambda item: (item["start"], -(item["end"] - item["start"]), item["order"]))
    chosen = []
    for candidate in candidates:
        if any(candidate["start"] < item["end"] and candidate["end"] > item["start"] for item in chosen):
            continue
        chosen.append(candidate)
    for item in sorted(chosen, key=lambda entry: entry["start"], reverse=True):
        value = value[:item["start"]] + item["replacement"] + value[item["end"]:]
    return value

def expanded_inline(term: str, context: str) -> bool:
    """Return true when an acronym is written out immediately before it."""
    if not term.isupper() or len(term) < 2:
        return False
    ignored = {"and", "of", "the", "for", "in", "to"}
    pattern = re.compile(r"\(\s*" + re.escape(term) + r"\s*\)", re.I)
    for match in pattern.finditer(context):
        words = re.findall(r"[A-Za-z][A-Za-z'-]*", context[:match.start()])
        for size in range(2, min(8, len(words)) + 1):
            initials = "".join(
                word[0].upper() for word in words[-size:]
                if word.casefold() not in ignored
            )
            if initials == term.upper():
                return True
    return False

def normalize_area_key(value: Any) -> str:
    text = str(value or "").strip()
    if text.casefold().startswith("d078:"):
        text = text.split(":", 1)[1]
    if text.casefold().startswith("area:d078-"):
        text = text[len("area:d078-"):]
    return text.casefold()

def source_ids_for_copy_field(node: dict[str, Any], field: str) -> list[str]:
    """Return field-specific source IDs or direct evidence URLs, then node sources."""
    if field.startswith("student_orientation."):
        orientation_field = field.split(".", 1)[1]
        references = (node.get("orientation_evidence_by_field") or {}).get(orientation_field, [])
        ids = {
            str(reference.get("source_id") or reference.get("id") or f"url:{reference.get('url')}")
            for reference in references
            if isinstance(reference, dict) and (reference.get("source_id") or reference.get("id") or reference.get("url"))
        }
        if ids:
            return sorted(ids)
    ids = {
        str(item.get("source_id") or item.get("id") or f"url:{item.get('url')}")
        for field_name in ("evidence", "source_refs", "source_references", "explanatory_sources")
        for item in (node.get(field_name) or [])
        if isinstance(item, dict) and (item.get("source_id") or item.get("id") or item.get("url"))
    }
    ids.update(
        str(item)
        for field_name in ("evidence_source_ids", "explanatory_source_ids")
        for item in (node.get(field_name) or [])
        if isinstance(item, str) and item.strip()
    )
    ids.update(
        str(item)
        for field_name in ("source_refs", "source_references", "explanatory_sources")
        for item in (node.get(field_name) or [])
        if isinstance(item, str)
    )
    return sorted(ids)

def glossary_definition_chain_candidates(
    entries: list[dict[str, str]],
) -> list[dict[str, Any]]:
    """Flag domain terms that a glossary definition itself introduces.

    This is deliberately a candidate list: short, accurate definitions can use
    familiar field terms, but chained jargon needs a human decision.
    """
    # These two field terms are the deliberately plain-language base of the
    # glossary. Their own definitions are source checked, and they are not
    # opaque jargon when used in a further definition. Treating every reuse
    # as an unresolved chain generated dozens of false failures (for example,
    # "a model fitted to data"), even though "data" and "evidence" are
    # defined for learners in this same helper.
    resolved_root_terms = {"data", "evidence"}
    chain_terms = sorted((set(TERMS) - resolved_root_terms) | {
        "Bayesian", "frequentist", "prior", "probability distribution",
        "parameter", "statistical framework", "statistical procedure",
        "estimate", "estimator", "sampling distribution", "degrees of freedom",
    }, key=len, reverse=True)
    chain_re = re.compile(
        r"(?<![A-Za-z])(" + "|".join(re.escape(term) for term in chain_terms) + r")(?![A-Za-z])",
        re.I,
    )
    results = []
    for entry in entries:
        definition = entry["definition"]
        term_pattern = re.compile(entry["pattern"], re.I if "i" in entry["flags"] else 0)
        self_spans = [match.span() for match in term_pattern.finditer(definition)]
        expansion_span = None
        parenthesis_start = definition.find(" (")
        if parenthesis_start >= 0:
            parenthesis_end = definition.find(")", parenthesis_start + 2)
            if parenthesis_end > parenthesis_start:
                expansion_text = definition[parenthesis_start + 2:parenthesis_end]
                separator = re.search(r"[:;,]", expansion_text)
                if separator:
                    expansion_span = (
                        parenthesis_start + 2,
                        parenthesis_start + 2 + separator.start(),
                    )
        flagged = []
        for match in chain_re.finditer(definition):
            if any(max(match.start(), start) < min(match.end(), end) for start, end in self_spans):
                continue
            # For acronym entries, do not call the literal expansion itself
            # an unexplained chain. Review still applies to wording after the
            # colon/comma/semicolon, where the definition explains its use.
            if expansion_span and expansion_span[0] <= match.start() and match.end() <= expansion_span[1]:
                continue
            candidate = match.group(0)
            # A compound glossary entry may explain one of its named parts
            # explicitly (for example, precision/recall defines recall in the
            # following clause). Do not report that as an unexplained chain.
            if re.search(
                r"(?<![A-Za-z])" + re.escape(candidate) + r"(?![A-Za-z])\s+(?:is|means|refers\s+to|represents|describes|denotes)\b",
                definition,
                re.I,
            ):
                continue
            if not any(candidate.casefold() == existing.casefold() for existing in flagged):
                flagged.append(candidate)
        if flagged:
            results.append({
                "glossary_pattern": entry["pattern"],
                "definition": definition,
                "candidate_terms_inside_definition": flagged,
                "status": "human_chain_review_open",
            })
    return results

def main() -> None:
    graph = json.loads(GRAPH_PATH.read_text(encoding="utf-8"))
    ui = json.loads(UI_PATH.read_text(encoding="utf-8"))
    journey_source = (ROOT / "src/screens/careerIntelligence/D078MethodAwareJourney.tsx").read_text(encoding="utf-8")
    subgroup_source = (ROOT / "src/screens/careerIntelligence/SubgroupDetailScreen.tsx").read_text(encoding="utf-8")
    role_source = (ROOT / "src/screens/careerIntelligence/RoleDetailScreen.tsx").read_text(encoding="utf-8")
    snapshot_source = (ROOT / "src/lib/d078Snapshot.ts").read_text(encoding="utf-8")
    domain_overview_gate_checks = {
        "shared_overview_step_exists": "function D078DomainOverviewStep" in journey_source,
        "area_route_gates_before_content": "if (!domainOverviewPresented) return <D078DomainOverviewStep" in journey_source,
        "role_route_gates_before_content": journey_source.count("if (!domainOverviewPresented) return <D078DomainOverviewStep") == 2,
        "subgroup_screen_defaults_direct_routes_to_gate": "domainOverviewAlreadyPresented={(Array.isArray(params.d078_domain_overview_seen) ? params.d078_domain_overview_seen[0] : params.d078_domain_overview_seen) === \"1\"}" in subgroup_source,
        "role_screen_defaults_direct_routes_to_gate": "domainOverviewAlreadyPresented={(Array.isArray(params.d078_domain_overview_seen) ? params.d078_domain_overview_seen[0] : params.d078_domain_overview_seen) === \"1\"}" in role_source,
        "field_to_area_marks_overview_presented": "d078_domain_overview_seen=1" in journey_source[journey_source.find("const navigateArea =") : journey_source.find("const undoRoute =")],
        "area_to_role_marks_overview_presented": "d078_domain_overview_seen=1" in journey_source[journey_source.find("const openRole =") : journey_source.find("// Each area can be opened directly")],
        "saved_snapshot_routes_do_not_bypass_gate": "d078_domain_overview_seen" not in snapshot_source,
    }
    domain_overview_gate_review = {
        "status": "implemented_source_checked_rendered_review_open" if all(domain_overview_gate_checks.values()) else "source_check_gap",
        "finding": "Normal field-to-area and area-to-role actions carry an internal overview-presented marker. Direct and saved destinations omit it and show a field overview step before area or role content.",
        "checks": domain_overview_gate_checks,
        "reviewed_files": [
            "src/screens/careerIntelligence/D078MethodAwareJourney.tsx",
            "src/screens/careerIntelligence/SubgroupDetailScreen.tsx",
            "src/screens/careerIntelligence/RoleDetailScreen.tsx",
            "src/lib/d078Snapshot.ts",
        ],
        "rendered_acceptance": "not_checked",
    }
    nodes = graph["nodes"]
    graph_nodes_by_id = {node["id"]: node for node in nodes}
    ui_nodes_by_id = ui.get("nodes_by_id", {})
    projection_checks = []

    def check_projected_fields(node_id: str, fields: list[str]) -> None:
        source_node = graph_nodes_by_id.get(node_id, {})
        projected_node = ui_nodes_by_id.get(node_id, {})
        for field in fields:
            projection_checks.append({
                "node_id": node_id,
                "field": field,
                "matches": field in source_node and source_node.get(field) == projected_node.get(field),
            })

    check_projected_fields("domain:D078", ["overview", "student_orientation", "orientation_evidence_by_field"])
    check_projected_fields("domain-item:d078-computational-social-research", [
        "meaning", "why_it_matters", "contextual_use", "learner_output", "limitations", "source_references",
    ])
    area_ids = sorted(
        node["id"] for node in nodes
        if node.get("kind") == "area_of_specialization" and node.get("id", "").startswith("area:d078-")
    )
    role_ids = sorted(
        node["id"] for node in nodes
        if node.get("kind") == "role" and node.get("id", "").startswith("role:D078:")
    )
    for node_id in area_ids:
        check_projected_fields(node_id, ["student_orientation", "orientation_evidence_by_field"])
    for node_id in role_ids:
        check_projected_fields(node_id, ["description", "overview"])
    for graph_field, ui_field in (("domain_overview", "domain_overview"), ("transfer_summary", "transfer_summary")):
        projection_checks.append({
            "node_id": "programme_transition",
            "field": graph_field,
            "matches": graph.get("programme_transition", {}).get(graph_field) == ui.get("programme_transition", {}).get(ui_field),
        })
    target_source_ids = set(PROGRAMME_PREVIEW_SOURCE_IDS)
    for node_id in ["domain:D078", "domain-item:d078-computational-social-research", *area_ids]:
        target_source_ids.update(
            str(item.get("source_id") or item.get("id"))
            for item in graph_nodes_by_id.get(node_id, {}).get("source_references", [])
            if isinstance(item, dict) and (item.get("source_id") or item.get("id"))
        )
    registry_ids = set(ui.get("external_source_registry", {}))
    unresolved_target_source_ids = sorted(target_source_ids - registry_ids)
    projection_summary = {
        "checks": len(projection_checks),
        "matches": sum(item["matches"] for item in projection_checks),
        "mismatches": [item for item in projection_checks if not item["matches"]],
        "canonical_area_count": len(area_ids),
        "role_count": len(role_ids),
        "expected_scope_counts_match": len(area_ids) == 7 and len(role_ids) == 19,
        "target_source_ids": len(target_source_ids),
        "unresolved_target_source_ids": unresolved_target_source_ids,
    }
    areas: dict[str, str] = {}
    for node in nodes:
        if node.get("kind") != "area_of_specialization":
            continue
        label = node.get("label", node["id"])
        for key in (node.get("id"), node.get("area_id")):
            if key:
                areas[str(key)] = label
                areas[normalize_area_key(key)] = label
    roles = {n["id"]: n.get("label", n["id"]) for n in nodes if n.get("kind") == "role"}
    methods = set(graph.get("method_node_ids", []))
    copy_nodes, flags, text_units = [], [], []

    for node in nodes:
        if node.get("student_visible") is not True:
            continue
        kind = node.get("kind", "unknown")
        units = []
        for field in FIELDS.get(kind, ("label",)):
            value = node.get(field)
            if field == "student_orientation" and isinstance(value, dict):
                nested_values = [
                    (f"student_orientation.{nested_field}", nested_value)
                    for nested_field, nested_value in value.items()
                ]
            else:
                nested_values = [(field, value)]
            for output_field, nested_value in nested_values:
                field_source_ids = source_ids_for_copy_field(node, output_field)
                for ix, text in enumerate(flatten(nested_value)):
                    words = re.findall(r"\b[\w'-]+\b", text)
                    units.append({
                        "field": output_field, "index": ix if isinstance(nested_value, list) else None,
                        "text": text, "word_count": len(words),
                        "candidate_technical_terms": candidate_terms(text),
                        "source_basis_ids": field_source_ids,
                    })
        if not units:
            continue
        area_id = node.get("area_id") or node.get("areaId")
        role_ids = node.get("role_owner_ids") or node.get("role_ids") or []
        record = {
            "id": node["id"], "kind": kind,
            "surface": "domain_method" if node["id"] in methods else kind,
            "owner_area_id": area_id,
            "owner_area_label": areas.get(area_id) or areas.get(normalize_area_key(area_id)),
            "owner_role_ids": role_ids,
            "owner_role_labels": [roles.get(r, r) for r in role_ids],
            "requirement_lane": node.get("requirement_lane"),
            "student_selectable": node.get("student_selectable", node.get("selectable")),
            "display_readiness": node.get("display_readiness"),
            "source_artifacts": node.get("source_artifacts") or node.get("source_artifact"),
            "evidence_source_ids": sorted({source_id for unit in units for source_id in unit["source_basis_ids"]}),
            "copy_units": units,
        }
        fields = {u["field"] for u in units}
        text = " ".join(u["text"] for u in units)
        issues = []
        if kind == "area_learning_item" and GENERIC_AREA_RE.search(text):
            issues.append("generic_template_definition")
        if kind == "area_learning_item" and not ({"what_it_is", "meaning"} & fields):
            issues.append("missing_item_definition")
        if kind == "area_tool_option":
            if not ({"meaning", "plain_language_meaning"} & fields): issues.append("missing_tool_definition")
            if "contextual_use" not in fields: issues.append("missing_tool_use_in_area")
            if "learner_output" not in fields: issues.append("missing_tool_output_or_result")
        if kind in {"area_task_family", "role_task_family"}:
            # A long action-led task label itself is the visible explanation;
            # only flag a short title when no explanatory field accompanies it.
            label = str(node.get("label") or "")
            label_words = re.findall(r"\b[\w'-]+\b", label)
            if len(label_words) < 6 and not ({"task_evidence_text", "meaning", "description"} & fields):
                issues.append("short_task_label_needs_explanation")
            if not flatten(node.get("learner_output")) and not flatten(node.get("task_output")):
                issues.append("missing_task_output")
        if kind == "area_enrichment_item" and not ({"contextual_use", "how_used", "use_case"} & fields):
            issues.append("missing_contextual_use")
        if kind == "role_item_candidate":
            if not ({"meaning", "plain_language_meaning", "what_it_is"} & fields): issues.append("missing_item_definition")
        if kind == "role" and not ({"overview", "description"} & fields):
            issues.append("missing_role_overview")
        if INTERNAL_RE.search(text): issues.append("possible_internal_or_audit_language")
        if any(u["word_count"] > 70 for u in units): issues.append("long_copy_unit_over_70_words")
        record["candidate_issues"] = sorted(set(issues))
        copy_nodes.append(record)
        text_units.extend({"node_id": node["id"], "kind": kind, **u} for u in units)
        if issues:
            flags.append({
                "id": node["id"], "kind": kind,
                "area": areas.get(area_id) or areas.get(normalize_area_key(area_id)),
                "issues": sorted(set(issues)), "copy_units": units,
            })

    # Combination design cards are rendered from these records even when their
    # node-level student_visible flag is false; preserve their actual UI content.
    combo_nodes = {n["id"]: n for n in nodes if n.get("kind") == "method_combination_design"}
    for combo_id in ui.get("combination_designs", []):
        if isinstance(combo_id, dict):
            combo_id = combo_id.get("id")
        node = combo_nodes.get(combo_id)
        if not node:
            continue
        units = []
        for field in FIELDS["method_combination_design"]:
            value = node.get(field)
            for ix, text in enumerate(flatten(value)):
                units.append({
                    "field": field, "index": ix if isinstance(value, list) else None,
                    "text": text, "word_count": len(re.findall(r"\b[\w'-]+\b", text)),
                    "candidate_technical_terms": candidate_terms(text),
                    "source_basis_ids": source_ids_for_copy_field(node, field),
                })
        if units:
            record = {
                "id": combo_id, "kind": "method_combination_design",
                "surface": "method_combination_design", "owner_area_id": None,
                "owner_area_label": None, "owner_role_ids": [], "owner_role_labels": [],
                "requirement_lane": None, "student_selectable": None,
                "display_readiness": None, "source_artifacts": node.get("source_refs"),
                "evidence_source_ids": sorted({source for unit in units for source in unit["source_basis_ids"]}),
                "copy_units": units, "candidate_issues": [],
            }
            copy_nodes.append(record)
            text_units.extend({"node_id": combo_id, "kind": "method_combination_design", **u} for u in units)

    combo_units = []
    for combo in graph.get("combination_designs", []):
        for field in ("design", "why_combine", "how_used", "condition", "limits", "integration_explanation"):
            for ix, text in enumerate(flatten(combo.get(field))):
                combo_units.append({
                    "id": combo.get("id"), "field": field,
                    "index": ix if isinstance(combo.get(field), list) else None,
                    "text": text, "candidate_technical_terms": candidate_terms(text),
                })

    ui_edges = ui.get("typed_relationship_edges", [])
    effective_edges = []
    for edge in ui_edges:
        status = str(edge.get("status") or "").casefold()
        source = edge.get("sourceId") or edge.get("source_id")
        target = edge.get("targetId") or edge.get("target_id")
        rel = edge.get("relationship")
        if (rel in PANEL_RELATIONSHIPS and status in READY
                and edge.get("sourceResolved") is True and edge.get("targetResolved") is True
                and source in ui.get("nodes_by_id", {}) and target in ui.get("nodes_by_id", {})
                and edge.get("routeAvailability") != "unavailable_destination"):
            effective_edges.append(edge)
    relationship_units = []
    for edge in effective_edges:
        explanation = edge.get("explanation")
        if isinstance(explanation, str) and explanation.strip():
            edge_sources = {
                str(value) for value in (edge.get("evidenceSourceIds") or edge.get("evidence_source_ids") or [])
                if value
            }
            for reference in edge.get("sourceReferences") or edge.get("source_references") or []:
                if not isinstance(reference, dict):
                    continue
                reference_id = reference.get("source_id") or reference.get("id")
                url = reference.get("url")
                if reference_id:
                    edge_sources.add(str(reference_id))
                elif url:
                    edge_sources.add(f"url:{url}")
            relationship_units.append({
                "edge_id": edge.get("id"), "relationship": edge.get("relationship"),
                "source_id": edge.get("sourceId"), "target_id": edge.get("targetId"),
                "area_id": edge.get("areaId"), "role_id": edge.get("roleId"),
                "status": edge.get("status"), "explanation": explanation.strip(),
                "source_basis_ids": sorted(edge_sources),
                "word_count": len(re.findall(r"\b[\w'-]+\b", explanation)),
                "candidate_technical_terms": candidate_terms(explanation),
                "generic_panel_copy": "canonical learning item(s) exist for this relationship" in explanation.casefold(),
            })

    # Capture literal JSX text, quoted labels, and ordinary explanatory string
    # values in copy-heavy D078 components.
    # section names, empty states, and accessibility-facing actions.
    static_ui_units = []
    skipped_code_fragments = 0
    literal_text_re = re.compile(r">([^<>{}]+)<")
    quoted_label_re = re.compile(r"\b(?:label|accessibilityLabel)\s*=\s*\"([^\"]+)\"")
    ordinary_string_re = re.compile(r"(?<![\w])([\"'])(.{20,}?)\1")
    for relative in STATIC_FILES:
        path = ROOT / relative
        if not path.exists():
            continue
        source = path.read_text(encoding="utf-8")
        candidates = [(m.start(1), "jsx_text", m.group(1)) for m in literal_text_re.finditer(source)]
        candidates += [(m.start(1), "quoted_label", m.group(1)) for m in quoted_label_re.finditer(source)]
        candidates += [
            (m.start(2), "source_copy_string", m.group(2))
            for m in ordinary_string_re.finditer(source)
            if len(re.findall(r"\b[\w'-]+\b", m.group(2))) >= 4
            and not re.search(r"[{}<>\\]|https?://|\b(?:testID|accessibilityRole|color|border|font|style|icon)\b", m.group(2), re.I)
        ]
        for offset, unit_type, raw in candidates:
            text = " ".join(raw.split())
            if looks_like_source_code_fragment(text):
                skipped_code_fragments += 1
                continue
            if len(text) < 3 or text in {"·", "•"}:
                continue
            line = source.count("\n", 0, offset) + 1
            preview_basis = (
                PROGRAMME_PREVIEW_SOURCE_IDS
                if relative == "src/lib/programmePreview.ts"
                and re.search(r"\b(?:Sociology|sociological|campus service)\b", text, re.I)
                else []
            )
            if (
                relative == "src/screens/careerIntelligence/ProgrammeDetailRefinedScreen.tsx"
                and re.search(r"\b(?:Joint Admissions and Matriculation Board|Unified Tertiary Matriculation Examination|JAMB means|UTME means)\b", text, re.I)
            ):
                preview_basis = [*preview_basis, "audit:jamb-2024-examination-manual"]
            static_ui_units.append({
                "file": relative, "line": line, "unit_type": unit_type,
                "text": text, "word_count": len(re.findall(r"\b[\w'-]+\b", text)),
                "candidate_technical_terms": candidate_terms(text),
                "source_basis_ids": preview_basis,
                "possible_internal_copy": bool(INTERNAL_RE.search(text)),
            })
    for relative in STATIC_DATA_FILES:
        path = ROOT / relative
        if not path.exists():
            continue
        data = json.loads(path.read_text(encoding="utf-8"))
        def walk(value: Any, path_key: str = "$") -> None:
            if isinstance(value, str) and value.strip():
                text = " ".join(value.split())
                static_ui_units.append({
                    "file": relative, "line": None, "unit_type": "student_copy_data",
                    "field": path_key, "text": text,
                    "word_count": len(re.findall(r"\b[\w'-]+\b", text)),
                    "candidate_technical_terms": candidate_terms(text),
                    "possible_internal_copy": bool(INTERNAL_RE.search(text)),
                })
            elif isinstance(value, dict):
                for key, item in value.items():
                    walk(item, f"{path_key}.{key}")
            elif isinstance(value, list):
                for index, item in enumerate(value):
                    walk(item, f"{path_key}[{index}]")
        walk(data)

    top_level_copy_units = []
    for field in ("domain_overview", "transfer_summary", "transferable_learning_summary"):
        field_sources = {
            "domain_overview": [
                "external:nuc-social-sciences-ccmas-2023",
                "src:d078-openstax-sociology-research-3e",
                "src:d078-unesco-iscoped-social-sciences",
            ],
            # The transfer summary describes the checked-in journey contract;
            # it has no single external source record to cite here.
            "transfer_summary": [],
            "transferable_learning_summary": [],
        }.get(field, [])
        for text in flatten(graph.get("programme_transition", {}).get(field)):
            top_level_copy_units.append({
                "record": "programme_transition", "field": field, "text": text,
                "word_count": len(re.findall(r"\b[\w'-]+\b", text)),
                "candidate_technical_terms": candidate_terms(text),
                "source_basis_ids": field_sources,
            })
    for method_id, context in (ui.get("programme_method_context") or {}).items():
        for field in ("student_note",):
            for text in flatten(context.get(field)):
                top_level_copy_units.append({
                    "record": f"programme_method_context:{method_id}", "field": field,
                    "text": text, "word_count": len(re.findall(r"\b[\w'-]+\b", text)),
                    "candidate_technical_terms": candidate_terms(text),
                    "source_basis_ids": ["external:nuc-social-sciences-ccmas-2023"],
                })

    copy_by_id = {node["id"]: node for node in copy_nodes}
    term_occurrences: dict[str, list[dict[str, Any]]] = collections.defaultdict(list)
    for unit in text_units:
        if unit["field"] == "course_code":
            continue
        record = copy_by_id.get(unit["node_id"], {})
        for term in unit["candidate_technical_terms"]:
            term_occurrences[term.casefold()].append({
                "term_as_written": term,
                "location": f"{unit['kind']}:{unit['node_id']}#{unit['field']}",
                "text": unit["text"],
                "source_basis_ids": unit.get("source_basis_ids") or record.get("evidence_source_ids", []),
                "first_use_status": "not established across routes",
                "independent_screen_access": "route must be checked; item cards may be opened independently",
                "inline_explanation_status": "candidate only; human review required",
                "reviewer_result": "not reviewed",
            })
    for unit in static_ui_units:
        for term in unit["candidate_technical_terms"]:
            term_occurrences[term.casefold()].append({
                "term_as_written": term,
                "location": f"{unit['file']}:{unit.get('line') or unit.get('field')}",
                "text": unit["text"], "source_basis_ids": unit.get("source_basis_ids", []),
                "first_use_status": "not established across routes",
                "independent_screen_access": "static UI text; confirm rendered state",
                "inline_explanation_status": "candidate only; human review required",
                "reviewer_result": "not reviewed",
            })
    for unit in top_level_copy_units:
        for term in unit["candidate_technical_terms"]:
            term_occurrences[term.casefold()].append({
                "term_as_written": term, "location": f"{unit['record']}#{unit['field']}",
                "text": unit["text"], "source_basis_ids": unit.get("source_basis_ids", []),
                "first_use_status": "not established across routes",
                "independent_screen_access": "top-level journey text",
                "inline_explanation_status": "candidate only; human review required",
                "reviewer_result": "not reviewed",
            })
    for unit in relationship_units:
        for term in unit["candidate_technical_terms"]:
            term_occurrences[term.casefold()].append({
                "term_as_written": term,
                "location": f"relationship:{unit['edge_id'] or unit['source_id'] + '->' + unit['target_id']}",
                "text": unit["explanation"], "source_basis_ids": unit.get("source_basis_ids", []),
                "first_use_status": "route and endpoint specific",
                "independent_screen_access": "only when the edge and endpoints are projected on the selected route",
                "inline_explanation_status": "candidate only; human review required",
                "reviewer_result": "not reviewed",
            })
    terminology_ledger = [
        {"term": term, "occurrence_count": len(rows), "review_status": "not reviewed", "occurrences": rows}
        for term, rows in sorted(term_occurrences.items())
    ]
    glossary_patterns = read_glossary_patterns()
    glossary_patterns_by_signature: dict[tuple[str, str], list[str]] = collections.defaultdict(list)
    for entry in glossary_patterns:
        glossary_patterns_by_signature[(entry["pattern"], entry["flags"])].append(entry["definition"])
    duplicate_glossary_patterns = [
        {"pattern": pattern, "flags": flags, "definitions": definitions}
        for (pattern, flags), definitions in glossary_patterns_by_signature.items()
        if len(definitions) > 1
    ]
    glossary_definition_chain = glossary_definition_chain_candidates(glossary_patterns)
    technical_term_coverage = []
    for row in terminology_ledger:
        match = next((candidate for occurrence in row["occurrences"]
                      if (candidate := matching_gloss(occurrence["term_as_written"], glossary_patterns, occurrence["text"]))), None)
        inline_definition = any(
            expanded_inline(occurrence["term_as_written"], occurrence["text"])
            for occurrence in row["occurrences"]
        )
        row["glossary_rule_available"] = match is not None
        row["inline_expansion_in_copy"] = inline_definition
        row["glossary_rule_pattern"] = match["pattern"] if match else None
        definition_source_ids = GLOSSARY_DEFINITION_SOURCE_IDS.get(row["term"].casefold(), [])
        source_check_note = GLOSSARY_SOURCE_CHECKED_NOTES.get(row["term"].casefold())
        row["review_status"] = (
            "source_checked_glossary_definition_subject_matter_and_screen_review_open"
            if match and source_check_note and definition_source_ids
            else "automated_gloss_available_human_review_open" if match
            else "inline_expansion_present_human_review_open" if inline_definition
            else "no_glossary_rule_human_review_open"
        )
        for occurrence in row["occurrences"]:
            occurrence["inline_explanation_status"] = (
                "source-checked glossary definition is available; subject-matter accuracy, route fit and screen first-use still need human review"
                if match and source_check_note and definition_source_ids
                else "glossary rule can add inline explanation where studentFacingCopy is applied; accuracy and first-use still need human review"
                if match else "term is expanded in this copy; accuracy and first-use still need human review"
                if expanded_inline(occurrence["term_as_written"], occurrence["text"])
                else "no matching glossary rule or inline expansion; human review needed"
            )
        technical_term_coverage.append({
            "term": row["term"], "occurrences": row["occurrence_count"],
            "glossary_rule_available": match is not None,
            "inline_expansion_in_copy": inline_definition,
            "glossary_rule_pattern": match["pattern"] if match else None,
            "glossary_definition": match["definition"] if match else None,
            "source_basis_ids": sorted({
                source_id
                for occurrence in row["occurrences"]
                for source_id in occurrence.get("source_basis_ids", [])
            }),
            "glossary_definition_source_ids": definition_source_ids,
            "source_definition_review": "checked_against_cited_reference" if source_check_note and definition_source_ids else "open",
            "source_definition_review_note": source_check_note,
            "human_accuracy_review": "open",
            "screen_first_use_review": "open",
        })
    uncovered_technical_terms = [
        x["term"] for x in technical_term_coverage
        if not x["glossary_rule_available"] and not x["inline_expansion_in_copy"]
    ]
    terms_without_source_linked_occurrence = [
        x["term"] for x in technical_term_coverage if not x["source_basis_ids"]
    ]
    terms_without_any_source_support = [
        x["term"] for x in technical_term_coverage
        if not x["source_basis_ids"] and not x["glossary_definition_source_ids"]
    ]
    available_glossary_sources = set(AUDIT_ONLY_STATIC_SOURCE_REFERENCES) | set(ui.get("external_source_registry", {}))
    glossary_definition_source_ids = {
        source_id
        for source_ids in GLOSSARY_DEFINITION_SOURCE_IDS.values()
        for source_id in source_ids
    }
    unresolved_glossary_definition_source_ids = sorted(glossary_definition_source_ids - available_glossary_sources)

    surface_review = [
        {"surface": "Sociology programme overview", "render_path": "programmePreviewSections in ProgrammeDetailRefinedScreen", "status": "four headed sections define Sociology and social institutions, explain a research question, evidence, surveys, interviews, observation and document research, work through a campus-service example, and explain informed consent, ethics review and their limits. Curriculum themes and recorded learning goals remain separate"},
        {"surface": "Generic programme preview and unavailable states", "render_path": "programmePreviewExplanation and programmePreviewUnavailableMessage", "status": "course-title fallback and unavailable messages use student-facing wording without implying mastery or inventing curriculum content"},
        {"surface": "Programme themes, outcomes and theme guidance", "render_path": "DegreeSkills and D078MethodAwareJourney", "status": "dynamic student copy now uses the term helper; themes stay distinct from recorded learning goals"},
        {"surface": "Social Sciences domain overview and transfer", "render_path": "D078MethodAwareJourney displayText", "status": "the overview defines the field, evidence and methods; the orientation explains disciplinary viewpoints, administrative records, digital traces, consent and ethics review, questions, outputs and work steps. The bridge names what the three shared foundations prepare the learner to do, explains method or named-design choice, and states how supported domain learning, areas and roles follow. A scoped first-use set carries across visible overview, programme context and transfer copy"},
        {"surface": "Domain overview before area/role entry", "render_path": "D078AreaRoute and D078RoleRoute route initialization", "status": f"{domain_overview_gate_review['status']}: direct and saved destinations show the domain overview step before area or role content; internal field-to-area and area-to-role actions carry the route marker. Rendered acceptance remains open"},
        {"surface": "Programme-to-area transition", "render_path": "ProgrammeDetailRefinedScreen ProgrammeDomainTransition", "status": "connection text states that recorded course outcomes connect the programme and area"},
        {"surface": "Generic domain-detail fallback", "render_path": "DomainDetailScreen", "status": "D078 bypasses this screen and uses D078MethodAwareJourney; generic domain copy is not counted as D078 rendered content"},
        {"surface": "Methods and combined designs", "render_path": "MethodChoicePanel learnerCopy", "status": "method labels, explanations and programme notes now use the student copy helper"},
        {"surface": "Technical terms and first-use explanations", "render_path": "studentFacingCopy / explainTechnicalTerms and D078 displayText", "status": "the D078 domain overview and each area overview now carry one scoped first-use set across their visible sections; item and role-task cards also share a set within the card. Other reusable components that call studentFacingCopy without a shared set expand each text field independently. The audit simulates fields independently and cannot establish which copy renders together, whether every specialist phrase was identified, definition accuracy or learner comprehension"},
        {"surface": "Technical terms in item and method headings", "render_path": "D078ItemCard and MethodCard label/meaning render order", "status": "item and method headings remain concise; item meaning is visible beside the choice, and method meaning is visible before selection. Glossary tracking starts in the explanation rather than the title, so a clipped title cannot consume the first-use definition"},
        {"surface": "Seven D078 area overviews", "render_path": "D078AreaRoute from area student_orientation", "status": "all seven canonical areas have source-linked introductions and separate explanations for scope, approaches, questions, outputs, workflow, limits and ethical care. Each area visit has its own first-use set, so it can explain terms when opened directly. The Psychology and Social Behaviour summary no longer exposes the internal D064 code or implies clinical training; area names, ownership and routes are unchanged"},
        {"surface": "Area and role learning cards", "render_path": "D078ItemCard displayText", "status": "definitions, examples/approaches, context, outputs, limits and valid alternative notes are rendered as labeled sections"},
        {"surface": "D078 role overviews", "render_path": "D078RoleRoute role node description and linked task context", "status": "19 role summaries explain their documented work in plain language and preserve current area ownership and task links; no qualification or task-output claim was added"},
        {"surface": "Relationship panel explanations", "render_path": "D078RelationshipPanel", "status": "owned by the relationship-panel workstream; this sweep inventories available explanations but does not edit or approve their wording or route context"},
        {"surface": "Text prerequisite and complement annotations", "render_path": "graph fields not projected as destinations", "status": "not student destinations; show only after canonical edge/sequence review confirms a supported link"},
        {"surface": "Role task outputs", "render_path": "role_task_family records", "status": "19 task families have no separate output field; outputs remain an evidence-enrichment gap, not an inferred claim"},
    ]

    exporter_source = EXPORTER_PATH.read_text(encoding="utf-8")
    exporter_block = re.search(r"NODE_FIELDS\s*=\s*\{([^}]+)\}", exporter_source, re.S)
    exporter_fields = set(re.findall(r"\"([a-zA-Z0-9_]+)\"", exporter_block.group(1))) if exporter_block else set()
    ui_expected_fields = {
        "meaning", "plain_language_meaning", "meaning_in_domain", "what_it_is", "description",
        "why_it_matters", "field_context", "contextual_use", "how_used", "use_case",
        "learner_output", "limitations", "valid_alternatives", "task_evidence_text", "task_conditions",
        "task_output", "role_application", "requirement_reason", "student_orientation",
    }
    dropped_ui_fields = sorted(ui_expected_fields - exporter_fields)

    kinds = collections.Counter(n["kind"] for n in copy_nodes)
    issue_counts = collections.Counter(i for n in flags for i in n["issues"])
    fields_by_kind = {}
    for kind in kinds:
        fields_by_kind[kind] = dict(collections.Counter(
            u["field"] for n in copy_nodes if n["kind"] == kind for u in n["copy_units"]
        ))
    all_copy_units = [*text_units, *static_ui_units, *top_level_copy_units, *relationship_units]
    glossary_render_findings = []
    glossary_units_expanded = 0
    isolated_glossary_over_70 = 0
    isolated_glossary_long_by_kind: collections.Counter[str] = collections.Counter()
    isolated_glossary_long_examples = []
    for unit in all_copy_units:
        original_text = unit.get("text") or unit.get("explanation") or ""
        if not unit.get("candidate_technical_terms"):
            continue
        rendered_text = simulate_student_glossary_copy(original_text, glossary_patterns)
        if rendered_text != original_text:
            glossary_units_expanded += 1
        rendered_word_count = len(re.findall(r"\b[\w'-]+\b", rendered_text))
        if rendered_word_count > 70:
            isolated_glossary_over_70 += 1
            unit_kind = str(unit.get("kind") or unit.get("unit_type") or unit.get("record") or "other")
            isolated_glossary_long_by_kind[unit_kind] += 1
            if len(isolated_glossary_long_examples) < 20:
                isolated_glossary_long_examples.append({
                    "location": (
                        f"{unit['file']}:{unit.get('line')}" if unit.get("file") and unit.get("line")
                        else unit.get("node_id") or unit.get("id") or unit.get("record") or unit.get("edge_id")
                    ),
                    "kind": unit_kind,
                    "rendered_word_count": rendered_word_count,
                    "raw_text": original_text,
                    "rendered_text": rendered_text,
                })
        malformed_plural_suffix = bool(re.search(r"\)\s*s\b", rendered_text))
        if malformed_plural_suffix:
            glossary_render_findings.append({
                "location": (
                    f"{unit['file']}:{unit.get('line')}" if unit.get("file") and unit.get("line")
                    else unit.get("node_id") or unit.get("id") or unit.get("record") or unit.get("edge_id")
                ),
                "finding": "possible_plural_suffix_after_inserted_parenthesis",
                "rendered_text": rendered_text,
                "status": "candidate_for_human_review",
            })
    long_copy_counts = {
        str(threshold): sum(u["word_count"] > threshold for u in all_copy_units)
        for threshold in (32, 50, 70, 90, 120)
    }
    long_copy_units_over_70 = [
        {
            "location": (
                f"{u['file']}:{u.get('line')}" if u.get("file") and u.get("line")
                else u.get("node_id") or u.get("file") or u.get("record") or u.get("edge_id")
            ),
            "kind": u.get("kind") or u.get("unit_type") or "relationship_explanation",
            "field": u.get("field") or u.get("relationship"),
            "word_count": u["word_count"],
            "text": u.get("text") or u.get("explanation"),
        }
        for u in all_copy_units if u["word_count"] > 70
    ]
    exact_duplicate_fields = []
    for node in nodes:
        for left, right in (("description", "overview"), ("meaning", "plain_language_meaning")):
            a = node.get(left)
            b = node.get(right)
            if isinstance(a, str) and a.strip() and a == b:
                exact_duplicate_fields.append({"node_id": node["id"], "kind": node.get("kind"), "fields": [left, right]})
    replacement_character_occurrences = sum(
        (u.get("text") or u.get("explanation") or "").count("\ufffd")
        for u in all_copy_units
    )
    mojibake_findings = []
    for unit in all_copy_units:
        value = unit.get("text") or unit.get("explanation") or ""
        for match in MOJIBAKE_RE.finditer(value):
            mojibake_findings.append({
                "location": (
                    f"{unit['file']}:{unit.get('line')}" if unit.get("file") and unit.get("line")
                    else unit.get("node_id") or unit.get("id") or unit.get("record") or unit.get("edge_id")
                ),
                "sequence": match.group(0),
                "context": value[max(0, match.start() - 40):match.end() + 40],
            })
    automated_gate_failures = []
    if uncovered_technical_terms:
        automated_gate_failures.append({"gate": "candidate_term_explanation_coverage", "count": len(uncovered_technical_terms), "items": uncovered_technical_terms})
    terms_without_source_checked_glossary_definition = [
        x["term"] for x in technical_term_coverage
        if x["source_definition_review"] != "checked_against_cited_reference"
    ]
    if terms_without_source_checked_glossary_definition:
        automated_gate_failures.append({
            "gate": "candidate_term_source_checked_definition_coverage",
            "count": len(terms_without_source_checked_glossary_definition),
            "items": terms_without_source_checked_glossary_definition,
        })
    if glossary_definition_chain:
        automated_gate_failures.append({"gate": "glossary_definition_chains", "count": len(glossary_definition_chain)})
    if duplicate_glossary_patterns:
        automated_gate_failures.append({"gate": "duplicate_glossary_rules", "count": len(duplicate_glossary_patterns), "items": duplicate_glossary_patterns})
    if terms_without_any_source_support:
        automated_gate_failures.append({"gate": "candidate_term_source_linkage", "count": len(terms_without_any_source_support), "items": terms_without_any_source_support})
    if unresolved_glossary_definition_source_ids:
        automated_gate_failures.append({"gate": "glossary_definition_source_resolution", "count": len(unresolved_glossary_definition_source_ids), "items": unresolved_glossary_definition_source_ids})
    if glossary_render_findings:
        automated_gate_failures.append({"gate": "glossary_render_simulation", "count": len(glossary_render_findings)})
    if replacement_character_occurrences or mojibake_findings:
        automated_gate_failures.append({"gate": "copy_encoding", "replacement_characters": replacement_character_occurrences, "malformed_sequences": len(mojibake_findings)})
    if projection_summary["mismatches"] or projection_summary["unresolved_target_source_ids"]:
        automated_gate_failures.append({"gate": "graph_to_journey_projection", "mismatches": len(projection_summary["mismatches"]), "unresolved_source_ids": len(projection_summary["unresolved_target_source_ids"])})
    automated_copy_gate = {
        "status": "pass_automated_checks_only" if not automated_gate_failures else "fail",
        "failures": automated_gate_failures,
        "scope_limit": "Does not prove that the terminology finder is exhaustive, that definitions are technically accurate, that a novice understands them, or that each direct route displays the first-use explanation.",
        "human_review_state": "open",
    }
    stats = {
        "graph_nodes_total": len(nodes), "graph_edges_total": len(graph.get("edges", [])),
        "ui_nodes_total": len(ui.get("nodes_by_id", {})), "ui_typed_relationship_edges_total": len(ui_edges),
        "visible_nodes_with_copy": len(copy_nodes), "visible_copy_units": len(text_units),
        "visible_copy_words": sum(u["word_count"] for u in text_units),
        "visible_nodes_by_kind": dict(kinds), "candidate_flagged_nodes": len(flags),
        "copy_units_over_word_thresholds": long_copy_counts,
        "all_audited_copy_units": len(all_copy_units),
        "long_copy_units_over_70": long_copy_units_over_70,
        "exact_duplicate_definition_field_pairs": len(exact_duplicate_fields),
        "replacement_character_occurrences": replacement_character_occurrences,
        "mojibake_like_sequences": len(mojibake_findings),
        "candidate_issue_counts": dict(issue_counts),
        "combination_designs": len(graph.get("combination_designs", [])),
        "combination_copy_units": len(combo_units),
        "static_ui_copy_units": len(static_ui_units),
        "source_code_fragments_excluded": skipped_code_fragments,
        "student_copy_projection_and_source_checks": projection_summary,
        "static_ui_copy_units_with_candidate_terms": sum(bool(u["candidate_technical_terms"]) for u in static_ui_units),
        "top_level_journey_copy_units": len(top_level_copy_units),
        "top_level_journey_copy_units_with_candidate_terms": sum(bool(u["candidate_technical_terms"]) for u in top_level_copy_units),
        "distinct_candidate_terms": len(terminology_ledger),
        "candidate_term_exclusions": [
            {"term": term, "reason": note}
            for term, (_, note) in EXCLUDED_ACRONYM_CONTEXTS.items()
            if any(term == row["term"] for row in terminology_ledger) is False
        ],
        "candidate_term_occurrences": sum(row["occurrence_count"] for row in terminology_ledger),
        "copy_units_with_glossary_expansion_simulated": glossary_units_expanded,
        "isolated_copy_units_over_70_after_glossary_expansion": isolated_glossary_over_70,
        "isolated_long_copy_by_kind_after_glossary_expansion": dict(isolated_glossary_long_by_kind),
        "isolated_glossary_expansion_limit": "Each text field is simulated independently; shared first-use state, card grouping and actual rendering are not modeled. Treat these counts as review cues, not rendered copy counts.",
        "glossary_rendering_candidates_needing_human_review": len(glossary_render_findings),
        "technical_terms_with_glossary_rule": sum(bool(x["glossary_rule_available"]) for x in technical_term_coverage),
        "candidate_terms_with_source_linked_occurrence": sum(bool(x["source_basis_ids"]) for x in technical_term_coverage),
        "technical_terms_without_source_linked_occurrence": len(terms_without_source_linked_occurrence),
        "candidate_terms_with_source_linked_glossary_definition": sum(bool(x["glossary_definition_source_ids"]) for x in technical_term_coverage),
        "distinct_glossary_definition_sources": len(glossary_definition_source_ids),
        "unresolved_glossary_definition_source_ids": len(unresolved_glossary_definition_source_ids),
        "candidate_terms_with_source_checked_glossary_definition": sum(x["source_definition_review"] == "checked_against_cited_reference" for x in technical_term_coverage),
        "candidate_terms_without_source_checked_glossary_definition": sum(x["source_definition_review"] != "checked_against_cited_reference" for x in technical_term_coverage),
        "candidate_terms_blocking_source_check_gate": terms_without_source_checked_glossary_definition,
        "technical_terms_without_any_source_support": len(terms_without_any_source_support),
        "technical_terms_expanded_inline": sum(bool(x["inline_expansion_in_copy"]) for x in technical_term_coverage),
        "technical_terms_without_glossary_or_inline_expansion": len(uncovered_technical_terms),
        "glossary_rules_parsed": len(glossary_patterns),
        "duplicate_glossary_pattern_count": len(duplicate_glossary_patterns),
        "glossary_definitions_with_candidate_term_chains": len(glossary_definition_chain),
        "fields_used_by_ui_but_dropped_by_exporter": dropped_ui_fields,
        "relationship_edges_in_panel_scope": len(effective_edges),
        "relationship_edges_with_custom_explanation": len(relationship_units),
        "relationship_edges_without_explanation": len(effective_edges) - len(relationship_units),
        "relationship_edges_with_generic_internal_note": sum(x["generic_panel_copy"] for x in relationship_units),
        "relationship_types_in_panel_scope": dict(collections.Counter(e.get("relationship") for e in effective_edges)),
        "automated_copy_gate": automated_copy_gate,
    }
    result = {
        "created_by": Path(__file__).name,
        "purpose": "Read-only graph-backed inventory and heuristic editorial worklist.",
        "interpretation": "Flags are candidate issues for human review, not proof. Unflagged text is not approved by this audit.",
        "copy_edits_applied_this_pass": {
            "implementation_scripts": [
                "data/career-mapping/_audit/apply_d078_core_overview_copy_2026_11_07.py",
                "data/career-mapping/_audit/apply_d078_domain_programme_area_language_2026_11_06.py",
                "data/career-mapping/_audit/apply_d078_role_overview_language_2026_11_06.py",
                "data/career-mapping/_audit/apply_d078_student_copy_defect_repairs_2026_11_06.py",
                "data/career-mapping/_audit/export_d078_method_aware_ui_data_2026_10_19.py",
            ],
            "programme": "The Sociology preview now defines the field and social institutions; explains a research question, evidence, survey, interview, observation and document research; distinguishes what interviews, service observations and service records can show in a campus example; and explains informed consent and ethics review without claiming review guarantees safety. Themes and recorded curriculum outcomes stay separate; curriculum records were not changed.",
            "domain": "The domain overview defines the field, evidence and methods. The orientation explains disciplinary viewpoints, administrative records, digital traces, what a research question is, and how evidence is gathered and interpreted. The bridge now states what the three shared foundations prepare learners to do and how a method or named combined design leads to the supported domain learning and downstream areas/roles; optionality and course-link limits remain explicit.",
            "computational_social_research": "The selectable computational item explains algorithms, statistical models and simulations through their operation, distinguishes procedures from software, defines data and digital traces, uses social-research examples, specifies checks for missing or unevenly collected information, and states limits around representation, causality, simulation and privacy. Its requirement lane and destinations are unchanged.",
            "areas": "All seven canonical area overviews have structured, source-linked sections for subject scope, approaches, questions, outputs, workflow, limitations and ethical care. Area ownership and routes are unchanged.",
            "roles": "All 19 role overviews now use student-friendly wording based on their linked role-task evidence and attached occupation sources. Role-to-area ownership and task routes are unchanged; the 19 missing separate role-task output fields remain unfilled rather than inferred.",
            "technical_terms": "The shared term helper has source-checked definitions across core research, statistical, computational, qualitative, spatial and software terms. This pass added source checks for separation, confounding, ethnography/reflexivity, PsychoPy, ArcGIS, GeoDa, discourse analysis, historical research, NetLogo, NLTK, process tracing, negative-binomial models, nowcasting, business-intelligence and survey-weighting terms. Source checks remain separate from subject-matter, first-use and learner review; the audit still lists unchecked terms explicitly.",
            "jasp_copy": "The JASP item now explains its menu-based statistical workflow, examples of supported analyses, frequentist and Bayesian result framing, and the learner's responsibility to choose a method that fits the question and data; the copy was shortened to stay below the raw-length review threshold.",
            "source_linkage": "The graph now records field-level sources for all seven area orientations and the domain overview, plus item-level evidence for methods. New references cover panel-data structure and construction, multilevel models, time-series model forms, discourse analysis and conversation analysis.",
            "projection": "The refreshed graph was exported to the student journey payload; the exporter retains fields already consumed by the journey. D078 direct and saved area/role routes now show a field overview step first; ordinary field-to-area and area-to-role navigation records that the overview was presented. Graph route membership and selection rules are unchanged.",
            "graph_invariants": f"The copy updater verifies node and edge identifiers remain unchanged ({len(graph.get('nodes', [])):,} nodes; {len(graph.get('edges', [])):,} edges). Requirement lanes, item ownership and role fit remain unchanged.",
            "source_references": [
                "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf",
                "https://opencourse.inf.ed.ac.uk/css",
                "https://auth.opencourse.inf.ed.ac.uk/css",
                "https://www.annualreviews.org/content/journals/10.1146/annurev-soc-121919-054621",
                "https://pmc.ncbi.nlm.nih.gov/articles/PMC8612450/",
                "https://pmc.ncbi.nlm.nih.gov/articles/PMC11971172/",
                "https://www.ukri.org/councils/esrc/guidance-for-applicants/research-ethics-guidance/internet-mediated-research/",
                "https://www.publichealth.columbia.edu/research/population-health-methods/social-network-analysis",
                "https://pmc.ncbi.nlm.nih.gov/articles/PMC4430112/",
                "https://www.gov.uk/government/publications/the-magenta-book",
                "https://www.gov.uk/government/publications/the-magenta-book/magenta-book-central-government-guidance-on-evaluation-html",
                "https://www.jamb.gov.ng/pdfs/2024/2024_EXAMINATION_MANUAL%28updated%29.pdf",
                "https://jasp-stats.org/wp-content/uploads/2025/07/Statistical-Analysis-in-JASP-A-guide-for-students-2025.pdf",
                "https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-ai-rmf-10",
                "https://learn.microsoft.com/en-us/power-bi/fundamentals/end-user-license",
                "https://www.core-econ.org/project/doing-economics/",
                "https://population.un.org/demodata/web/",
                "https://www.worldbank.org/en/data/statistical-capacity-building/data-innovation-fund/Rural-accessibility-mapping",
                "https://legalinstruments.oecd.org/public/doc/128/body-text.en.html",
                "https://openstax.org/books/psychology-2e/pages/2-2-approaches-to-research",
                "https://openstax.org/books/psychology-2e/pages/12-4-conformity-compliance-and-obedience",
                "https://openstax.org/books/introduction-sociology-3e/pages/2-2-research-methods",
                "https://openstax.org/books/introduction-anthropology/pages/3-introduction",
                "https://americananthro.org/about/anthropological-ethics/",
                "https://uis.unesco.org/sites/default/files/documents/international-standard-classification-of-education-fields-of-education-and-training-2013-detailed-field-descriptions-2015-en.pdf",
                "https://www.amstat.org/asa/files/pdfs/P-ValueStatement.pdf",
                "https://www.cdc.gov/field-epi-manual/php/chapters/qualitative-data.html",
                "https://www.cdc.gov/evaluation/php/evaluation-framework-action-guide/step-4-gather-credible-evidence.html",
                "https://www.cdc.gov/mmwr/volumes/73/rr/rr7306a1.htm",
                "https://www.limesurvey.org/manual/LimeSurvey_Manual",
                "https://community.lumivero.com/s/article/NVR1Mac-Content-coding-coding",
                "https://docs.python.org/3/tutorial/",
                "https://www.r-project.org/about.html",
                "https://www.ibm.com/docs/en/spss-statistics/30.0.0?topic=test-overview-t-command",
                "https://www.stata.com/features/panel-longitudinal-data/",
                "https://www.isa-sociology.org/research-networks/working-groups/wg10-digital-sociology",
                "https://unesdoc.unesco.org/in/documentViewer.xhtml?ark=/ark:/48223/pf0000235049/PDF/235049eng.pdf&locale=en",
                "https://databrowser.uis.unesco.org/resources/glossary/2462",
                "https://worldbank.github.io/dime-data-handbook/measurement.html",
                "https://worldbank.github.io/dime-data-handbook/analysis.html",
                "https://www.nist.gov/publications/language-trustworthy-ai-depth-glossary-terms",
                "https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf",
                "https://airc.nist.gov/airmf-resources/playbook/measure/",
                "https://csrc.nist.gov/glossary/term/supervised_learning",
                "https://www.statsmodels.org/stable/generated/statsmodels.tsa.arima.model.ARIMA.html",
                "https://www.statsmodels.org/stable/mixed_linear.html",
                "https://doi.org/10.4135/9780857020116.n54",
                "https://soc.ucla.edu/graduate-study/working-groups/conversation-analysis/",
                "https://app.taguette.org/",
            ],
            "rendered_review": "Not performed; copy and projection changes require browser/manual review before visual acceptance.",
        },
        "source_paths": [str(GRAPH_PATH.relative_to(ROOT)), str(UI_PATH.relative_to(ROOT))],
        "stats": stats, "copy_fields_by_kind": fields_by_kind,
        "copy_nodes": copy_nodes, "candidate_flagged_nodes": flags,
        "combination_copy_units": combo_units,
        "effective_relationship_copy_units": relationship_units,
        "static_ui_copy_units": static_ui_units,
        "top_level_journey_copy_units": top_level_copy_units,
        "terminology_ledger": terminology_ledger,
        "technical_term_coverage": technical_term_coverage,
        "glossary_definition_chain_review": glossary_definition_chain,
        "duplicate_glossary_patterns": duplicate_glossary_patterns,
        "technical_terms_without_source_linked_occurrence": terms_without_source_linked_occurrence,
        "audit_only_static_source_references": AUDIT_ONLY_STATIC_SOURCE_REFERENCES,
        "glossary_render_findings": glossary_render_findings,
        "isolated_glossary_long_examples": isolated_glossary_long_examples,
        "uncovered_technical_terms": uncovered_technical_terms,
        "surface_review": surface_review,
        "route_entry_review": domain_overview_gate_review,
        "exact_duplicate_copy_fields": exact_duplicate_fields,
        "mojibake_findings": mojibake_findings,
    }
    OUT_JSON.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# D078 Student-Facing Copy Sweep", "",
        "**Date:** 2026-11-07  ",
        "**Status:** Inventory and candidate issue report; not editorial approval.  ",
        "**Source:** Canonical D078 route graph and exported journey data.", "",
        "> Heuristic flags create a human-review worklist. No flag is a pass, and this report does not claim novice comprehension or subject-matter approval.", "",
        "## Inventory counts", "",
        f"- Graph: {stats['graph_nodes_total']:,} nodes and {stats['graph_edges_total']:,} edges.",
        f"- Exported journey data: {stats['ui_nodes_total']:,} nodes and {stats['ui_typed_relationship_edges_total']:,} typed relationship records.",
        f"- Student-visible graph records with copy: {stats['visible_nodes_with_copy']:,}; text units: {stats['visible_copy_units']:,}; words: {stats['visible_copy_words']:,}.",
        f"- Total audited units across graph records, static screen text, top-level journey copy and relationship explanations: {stats['all_audited_copy_units']:,}.",
        f"- Method-combination explanations: {stats['combination_designs']} designs and {stats['combination_copy_units']} text units.",
        f"- Literal static UI text, quoted labels and programme-preview copy: {stats['static_ui_copy_units']:,} units; {stats['static_ui_copy_units_with_candidate_terms']:,} contain candidate technical terms.",
        f"- Top-level D078 overview/transfer/method-context copy: {stats['top_level_journey_copy_units']} units; {stats['top_level_journey_copy_units_with_candidate_terms']} contain candidate technical terms.",
        f"- Candidate terminology ledger: {stats['distinct_candidate_terms']} distinct terms and {stats['candidate_term_occurrences']:,} occurrences; every occurrence remains unreviewed until checked on its route.",
        "- Excluded acronym context: " + ("; ".join("{} — {}".format(x["term"], x["reason"]) for x in stats["candidate_term_exclusions"]) if stats["candidate_term_exclusions"] else "none") + ".",
        f"- Candidate terminology coverage: {stats['technical_terms_with_glossary_rule']} of {stats['distinct_candidate_terms']} candidate terms have a matched glossary rule; {stats['technical_terms_expanded_inline']} are already expanded in source copy; {stats['technical_terms_without_glossary_or_inline_expansion']} have neither. Each text unit is also simulated through the runtime helper; see the automated gate below. This does not certify definition accuracy or learner comprehension.",
        f"- Term evidence: {stats['candidate_terms_with_source_linked_occurrence']} of {stats['distinct_candidate_terms']} candidate terms have a source on a student-copy occurrence; {stats['candidate_terms_with_source_linked_glossary_definition']} have a source linked to the glossary definition; {stats['technical_terms_without_any_source_support']} have neither. See per-term source IDs in the JSON. A glossary-definition source supports the explanation, not a particular route or claim.",
        f"- Source-checked glossary batch: {stats['candidate_terms_with_source_checked_glossary_definition']} definitions were checked against their cited references; {stats['candidate_terms_without_source_checked_glossary_definition']} candidate terms remain outside that batch. Subject-matter accuracy, context fit, screen first-use and learner review remain open for every candidate term.",
        f"- Export check: {projection_summary['matches']}/{projection_summary['checks']} checked domain, method, area, role and programme-transition fields match the student journey export; {len(projection_summary['mismatches'])} mismatches; {projection_summary['canonical_area_count']} areas and {projection_summary['role_count']} roles; {len(projection_summary['unresolved_target_source_ids'])} target source IDs unresolved.",
        f"- Fields referenced by the journey but excluded by the data exporter: {', '.join(dropped_ui_fields) if dropped_ui_fields else 'none'}.",
        f"- Relationship panel inventory: {stats['relationship_edges_in_panel_scope']:,} resolved, ready edge records; {stats['relationship_edges_with_custom_explanation']:,} have stored explanations, {stats['relationship_edges_without_explanation']:,} have none, {stats['relationship_edges_with_generic_internal_note']:,} contain the generic internal note. Relationship copy itself is outside this edit lane.",
        f"- Isolated glossary-length simulation: {stats['isolated_copy_units_over_70_after_glossary_expansion']:,} copy units exceed 70 words when glossary rules are applied independently. This is a per-field review cue, not a count of rendered paragraphs: the domain and area overviews and some item cards share first-use state, while other reusable components expand fields independently. The audit does not model screen grouping or actual rendering.",
        f"- Long units across graph copy, static screen text, top-level journey copy and relationship explanations: {stats['copy_units_over_word_thresholds']['32']:,} exceed 32 words, {stats['copy_units_over_word_thresholds']['50']:,} exceed 50, and {stats['copy_units_over_word_thresholds']['70']:,} exceed 70 words.",
        f"- Exact stored-field aliases: {stats['exact_duplicate_definition_field_pairs']:,} identical `description`/`overview` or `meaning`/`plain_language_meaning` pairs; the journey chooses one field in each pair, so this is not a count of repeated on-screen paragraphs.",
        f"- Encoding check: {stats['replacement_character_occurrences']} replacement characters and {stats['mojibake_like_sequences']} malformed UTF-8-as-text sequences across audited copy; valid curly quotes and dashes are not counted. Source-code-like snippets excluded from the static UI scan: {stats['source_code_fragments_excluded']:,}.",
        f"- Automated copy gate: **{stats['automated_copy_gate']['status']}** — {len(stats['automated_copy_gate']['failures'])} mechanical failure(s). It checks candidate-term definition coverage, definition chains, duplicate rules, source linkage, encoding, projection parity and glossary-render simulation only. Human factual, direct-route first-use, learner and rendered-screen review remain separate.",
        "", "## Visible copy by record type", "", "| Record type | Visible records | Copy units |", "|---|---:|---:|",
    ]
    unit_counts = collections.Counter(u["kind"] for u in text_units)
    for kind, count in kinds.most_common():
        lines.append(f"| {kind} | {count} | {unit_counts[kind]} |")
    lines += ["", "## Surface-by-surface review", "", "| Surface | Render path | Finding / remaining boundary |", "|---|---|---|"]
    for row in surface_review:
        lines.append(f"| {row['surface']} | `{row['render_path']}` | {row['status']} |")
    lines += ["", "## Candidate issue counts", "", "| Candidate flag | Records |", "|---|---:|"]
    for issue, count in issue_counts.most_common():
        lines.append(f"| {issue} | {count} |")
    lines += ["", "## Glossary definition chain candidates", "", "These flags look for technical terms introduced by glossary definitions. Acronym name expansions and component terms explicitly defined in the same entry are filtered. Any remaining chain must be resolved before the automated copy gate can pass.", "", "| Glossary entry | Candidate term(s) | Definition |", "|---|---|---|"]
    for row in glossary_definition_chain:
        pattern = row["glossary_pattern"].replace("|", "\\|")
        terms = ", ".join(row["candidate_terms_inside_definition"]).replace("|", "\\|")
        definition = row["definition"].replace("|", "\\|")
        lines.append(f"| `{pattern}` | {terms} | {definition} |")
    if not glossary_definition_chain:
        lines.append("| None | None | No candidate chain remains after the lexical checks. |")
    lines += [
        "", "## Remaining review targets", "",
        "- Complete human subject-matter and first-use review for every candidate term and explanation; the automated gate verifies matched explanations, not their accuracy or a learner's understanding.",
        "- Inspect independently enterable routes and rendered screens to confirm first-use explanations appear beside each item before selection; the domain-overview gate has source checks but still needs rendered acceptance.",
        "- The route-entry gate is implemented: direct and saved area/role paths first show the D078 domain overview step. Confirm the handoff visually and check return behavior on device/browser.",
        "- Review every flagged area, tool, task-family and role record in its actual screen context; decide edits from its source and task context rather than from the heuristic flag alone.",
        "- Resolve the 19 role task families that lack a separate output field through evidence review; do not make up outputs to fill the display.",
        "- Relationship-panel explanations are owned by another workstream; this report inventories their presence only and does not assess or edit their wording or route behavior.",
        "- Human-review programme themes, recorded outcomes and student rewordings in their rendered sections for precision and plain-language flow; preserve the distinction between curriculum content and learner abilities.",
        "", "## Copy revisions applied in this pass", "",
        "These source-linked copy edits do not approve the whole D078 journey or clear the terminology ledger.",
        "- **Sociology programme page:** four headed sections define Sociology and social institutions, explain a research question, evidence, survey, interview, observation and document research, compare what different sources show in a campus-service example, and define informed consent and ethics review with limits. Recorded curriculum themes and learning outcomes remain in their separate sections.",
        "- **Social Sciences domain page:** the overview defines the field, evidence and methods. The orientation explains disciplinary viewpoints, administrative records, digital traces, participant consent and ethics review, then gives questions, outputs and a work sequence. The bridge states what the three shared foundations teach before method selection, defines a named combined design, and describes supported domain learning and downstream areas/roles; optionality and curriculum-link limits remain explicit.",
        "- **Computational social research:** the definition explains algorithms, statistical models and simulations through their operation and distinguishes a research procedure from software. The context defines digital traces and gives social-research examples; its output names checks for missing or uneven information; limits cover representation, causality, simulation and privacy. Its requirement lane and destinations are unchanged.",
        "- **JASP tool card:** the meaning names its menu-based statistical workflow, explains supported analysis examples and distinguishes frequentist from Bayesian result framing; researchers remain responsible for choosing a method that fits the question and data.",
        "- **Seven area overviews:** summaries and structured introductions are source-linked, with explanations for scope, approaches, questions, outputs, work steps, limitations and ethical care. The Psychology and Social Behaviour summary removes the internal D064 label and distinguishes social research from clinical diagnosis or treatment without making a licensure claim. Economics output wording and the policy-brief and confidential-source explanations were clarified. Area ownership and routes remain unchanged.",
        "- **First-use display:** the domain overview shares one explanation set across its visible overview and transfer sections; each area visit has a separate set across its summary and expanded orientation. Direct area and role entries show a field overview step first, then continue to their requested destination; their own first-use explanations remain available on those screens.",
        "- **Nineteen role overviews:** descriptions are rewritten from linked task evidence and occupation sources; they retain existing role-to-area ownership and routes. The 19 role-task records without separate output evidence remain unfilled.",
        "- **Technical terms:** the shared glossary defines research question, evidence, data, combined research design, social institutions, administrative records, informed consent and ethics review alongside existing method and statistics terms. The new core copy carries field-level source references; current candidate-term and occurrence counts are reported above. Subject-matter, screen-first-use and learner review remain open.",
        "- **Evidence links:** new graph references support panel data structure and preparation, multilevel models, ARIMA variants, discourse analysis and conversation analysis. Sources are linked to the relevant method item rather than treated as proof that a method suits every question.",
        "- **Projection and graph integrity:** the current graph was re-exported to the student journey payload. Copy updates preserve current node and edge identifiers and do not change requirement lanes, item ownership, routes or role fit.",
        "- **Core copy sources:** [OpenStax What Is Sociology?](https://openstax.org/books/introduction-sociology-3e/pages/1-1-what-is-sociology), [OpenStax Sociological Research](https://openstax.org/books/introduction-sociology-3e/pages/2-2-research-methods), [NUC Social Sciences CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf), [UKRI ESRC informed consent guidance](https://www.ukri.org/councils/esrc/guidance-for-applicants/research-ethics-guidance/consent/), [ONS What Are Data?](https://www.ons.gov.uk/aboutus/usingpublicdatatoproducestatistics/learningaboutdata/learnmoreaboutwhoweareandwhatwedo/whataredata), [ONS administrative-data glossary](https://www.ons.gov.uk/census/censustransformationprogramme/administrativedatacensusproject/glossary), and [digital-trace data guidance](https://pmc.ncbi.nlm.nih.gov/articles/PMC11971172/).",
        "", "## Exact flagged records", "",
        "The JSON companion contains full copy text, owner context, source references, candidate technical terms and issue flags.",
        f"A copy unit is flagged as long only above 70 words; {stats['copy_units_over_word_thresholds']['70']:,} audited {'unit exceeds' if stats['copy_units_over_word_thresholds']['70'] == 1 else 'units exceed'} that threshold across all audited surfaces. Shorter units are still subject to human accuracy and readability review.",
        "", "| Record | Type | Area | Flags |", "|---|---|---|---|",
    ]
    for node in flags:
        lines.append(f"| {node['id']} | {node['kind']} | {node.get('area') or 'programme/domain/role'} | {', '.join(node['issues'])} |")
    lines += ["", "### Copy units over 70 words", "", "| Location | Type / field | Words | Text excerpt |", "|---|---|---:|---|"]
    for unit in long_copy_units_over_70:
        excerpt = (unit["text"] or "").replace("|", "\\|")[:220]
        lines.append(f"| {unit['location']} | {unit['kind']} / {unit['field']} | {unit['word_count']} | {excerpt} |")
    if not long_copy_units_over_70:
        lines.append("| None | — | 0 | No audited copy unit exceeds the threshold. |")
    lines += [
        "", "## Method and limits", "",
        "This is a graph-backed inventory plus a copy repair pass. Static JSX text is collected from the listed D078-related screens; report generation and API-only programme text remain outside this audit. The terminology list is a candidate finder, not an exhaustive dictionary. Per-field glossary simulation does not model the actual grouping of copy or prove rendered output, even where a component shares first-use state. Final clearance still requires human review of every D078 student text unit, evidence review for the 19 missing role-task outputs, review of relationship-panel explanations by their owner, the domain-overview entry gate and inspection of rendered routes. No browser or rendered visual acceptance is claimed.",
        "", f"Machine-readable worklist: {OUT_JSON.relative_to(ROOT).as_posix()}", "",
    ]
    OUT_MD.parent.mkdir(parents=True, exist_ok=True)
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps(stats, ensure_ascii=False, indent=2))
    print(f"Wrote {OUT_JSON.relative_to(ROOT)}")
    print(f"Wrote {OUT_MD.relative_to(ROOT)}")

if __name__ == "__main__":
    main()

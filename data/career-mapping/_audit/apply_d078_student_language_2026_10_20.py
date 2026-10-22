"""Rewrite every student-facing sentence in the D078 route graph.

The technical names stay. The claims stay. Staff notes, route jargon, and
doubled audit sentences do not. Run this after the technique patch and before
exporting the UI bundle.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
GRAPH = ROOT / "data/career-mapping/_audit/D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json"

TEXT_KEYS = {
    "meaning", "plain_language_meaning", "meaning_in_domain", "learner_output",
    "description", "narration", "what_it_is", "why_combine", "how_used",
    "how_it_is_used", "condition", "limits", "selection_rule", "requirement_reason",
    "explanation", "overview", "student_orientation", "contextual_use", "use_case",
    "what_you_might_produce", "expected_output", "purpose", "output",
    "resolution_rationale", "programme_meaning", "domain_meaning", "area_meaning",
    "transfer_summary", "transferable_learning_summary", "domain_overview",
}

AUDIT_LIMIT = re.compile(
    r"promotion must wait|\b403\b|reconciliation|local discovery|keep out of shared|"
    r"source coverage|not yet provide a focused|curricula only establish|"
    r"evidence file|as an evidence gap|is UK postgraduate|is one Nigerian institution",
    re.I,
)

GENERATED_EDGE = re.compile(
    r"are alternative options, not steps to complete together|"
    r"can be used alongside .+ when a task needs both|"
    r"is linked as a tool for |"
    r"builds on .+: the connected learning can give useful background|"
    r"can support work involving |"
    r"extends .+ into a more specialised task|"
    r"The reviewed D078 graph links |"
    r"The graph links .+ as related preparation|"
    r"choosing the tool does not make it compulsory or replace the method",
    re.I,
)

GLOSSARY = (
    ("contingency table", "contingency table (a table of counts)"),
    ("contingency-table", "contingency-table (a table of counts)"),
    ("asymptotic", "large-sample"),
    ("sparse tables", "tables with very small expected counts"),
    ("omnibus", "overall"),
    ("held-out", "kept-back test data"),
    ("data leakage", "using information you would not have for a real prediction"),
    ("leakage", "using information you would not have for a real prediction"),
    ("estimand", "the result you set out to estimate"),
    ("idiographic", "focused on particular people and cases"),
    ("nuisance parameter", "an extra unknown value the test has to account for"),
    ("nuisance-parameter", "an extra unknown value the test has to account for"),
    ("homophily", "homophily (the tendency for similar people or organisations to be connected)"),
    ("transitivity", "transitivity (the tendency for a contact of a contact to also be connected)"),
    ("overdispersion", "overdispersion (the counts vary more than a basic Poisson model expects)"),
    ("proportional-odds", "proportional-odds (the assumption that the pattern is similar across the ordered categories)"),
    ("independence of irrelevant alternatives", "the assumption that the other categories do not distort the comparison"),
    ("differential item functioning", "differential item functioning (an item behaving differently for groups who have the same level of the trait)"),
)

STAFF = (
    (re.compile(r"\bD078\b"), "this field"),
    (re.compile(r"\bcanonical\b", re.I), ""),
    (re.compile(r"\broute-linked\b", re.I), "linked to the method you selected"),
    (re.compile(r"\bjob-readiness claim\b", re.I), "claim that you are ready for a job"),
    (re.compile(r"\bsource-backed\b", re.I), ""),
    (re.compile(r"\s{2,}"), " "),
)

# Student wording for the technique layer. Each entry keeps the reviewed claim.
AUTHORED = {
    "domain-item:d078-statnet-ergm-tool": (
        "Statnet ergm is an R package for building, estimating, checking, simulating, and interpreting exponential-family random graph models. Say who is in the network, what counts as a tie, whether the model converged, and whether it reproduces the patterns in the observed network. The package does not decide those choices for you.",
        "A recorded choice of model and software, with the network boundary, the checks you ran, and what the result does not show.",
    ),
    "domain-item:d078-chi-square-tests": (
        "Use a chi-square test when your evidence is counts in categories. It can check whether those counts match a pattern you stated, or whether two groupings are associated. Use the usual chi-square test when the expected counts are large enough. When the expected counts are very small, use an exact test or a simulation instead.",
        "A labelled table of counts, the expected counts, the test result, and a careful statement of association. An association does not show that one thing caused the other.",
    ),
    "domain-item:d078-t-tests": (
        "Use a t-test to compare a mean with a stated value, or to compare two means. The two groups may be independent, or the observations may be paired. When the two independent groups should not be assumed to have the same spread, use Welch's version.",
        "The difference in means, a confidence interval, the test result, and an interpretation that matches the design. A two-group test does not replace a model built for more than two groups or for repeated measurements.",
    ),
    "domain-item:d078-anova-and-repeated-measures": (
        "Use ANOVA to compare means across more than two groups, or across combinations of conditions. A repeated-measures version accounts for measurements taken on the same cases when the design supports it. If the overall comparison is significant, follow it with planned contrasts or a suitable correction for multiple comparisons.",
        "A model summary with group estimates, uncertainty, and notes on whether the model fits. ANOVA can show that the groups are not all the same. It does not, by itself, say which groups differ or why.",
    ),
    "domain-item:d078-logistic-regression": (
        "Use logistic regression when the outcome has two categories. Report odds ratios or predicted probabilities, with uncertainty. Check how well the model fits, whether predictions are calibrated, and whether a few cases dominate the result. Predicting an outcome and explaining what caused it are different goals.",
        "A written model, the estimates or predictions, the checks you ran, and the limits. A prediction score does not show a causal effect.",
    ),
    "domain-item:d078-critical-discourse-analysis": (
        "Critical discourse analysis studies how language, and other ways of communicating, connect to institutions, power, and social practice. Say which tradition you are using, which texts and contexts you include, how you selected them, and the position from which you interpret them.",
        "A documented set of texts and an analysis that links patterns in the language to social conditions. Counting words, or running a text model, does not replace that interpretation.",
    ),
    "domain-item:d078-interpretative-phenomenological-analysis": (
        "Interpretative phenomenological analysis asks how a person makes sense of an important experience. You read each case closely before you look for cautious patterns across cases. It is an interpretive method for particular people. It is not a way to classify a large volume of text automatically.",
        "A reflexive account of each case, showing how you moved from the person's words to your interpretation, and a clear statement of what cannot be generalised.",
    ),
    "domain-item:d078-nlp-and-text-mining": (
        "Natural language processing and text mining turn social text into a form a computer can search, measure, classify, group, or summarise. Define the collection of texts and the idea you are measuring. Record how you prepared the text, check the measures against the original context, and inspect errors, including errors for particular groups.",
        "A reproducible text dataset and pipeline, the measures or model results, and an error analysis. These techniques do not replace critical discourse analysis, conversation analysis, or a close reading.",
    ),
    "domain-item:d078-supervised-machine-learning": (
        "Use supervised machine learning when you have labelled examples and the goal is to predict or classify new cases. Start from sound measurement and sampling. Keep training data, checking data, and final test data separate. Look for leaked information, poor calibration, errors in particular groups, weak labels, and ethical limits.",
        "A short model report: the target, the labels, how the data were split, a simple baseline, the performance measures that fit the task, the errors, and the limits. Machine learning can help with prediction. It does not replace a chi-square test, a t-test, ANOVA, or a causal design.",
    ),
    "domain-item:d078-fisher-exact-test": (
        "Fisher's exact test looks for an association in a table of counts, especially a 2 by 2 table, when the usual chi-square approximation is not suitable. Say which margins are treated as fixed, and which exact or resampling procedure you use for a larger table.",
        "The table, the null hypothesis, an odds ratio where one applies, an interval, the exact procedure, and a bounded reading of the result. The test is about association, not cause.",
    ),
    "domain-item:d078-barnard-exact-test": (
        "Barnard's test compares two independent proportions in a 2 by 2 table without conditioning on both margins. Say which test statistic you used and how the extra unknown value was handled.",
        "The exact result, the orientation of the table, the hypotheses, the computation settings, and a bounded reading. The test does not show cause.",
    ),
    "domain-item:d078-boschloo-exact-test": (
        "Boschloo's test compares two independent proportions in a 2 by 2 table. It is an unconditional exact test built from Fisher's p-value. It can be more powerful than Fisher's conditional test. State the sampling assumptions and how a two-sided p-value was defined.",
        "The exact result, the table orientation, the hypotheses, the p-value convention, and a bounded reading. The test does not show cause.",
    ),
    "domain-item:d078-wilcoxon-rank-tests": (
        "Use the Wilcoxon rank-sum test, also called Mann-Whitney, for two independent samples. Use the signed-rank test for paired observations. These tests compare rank or distribution patterns under their own assumptions. They are not automatic tests of medians, and they do not estimate the same quantity as every t-test.",
        "A rank-test result labelled with the design, an effect or interval where the procedure supports one, notes on ties, and a cautious reading of the contrast.",
    ),
    "domain-item:d078-kruskal-wallis-test": (
        "The Kruskal-Wallis test compares rank distributions across independent groups when a rank comparison fits better than a comparison of means. It is not a general repair for every ANOVA assumption that fails. Look at the group distributions, and follow an overall result with comparisons that account for testing more than one pair.",
        "An overall rank-test result, a description of the groups, and a justified plan for follow-up comparisons. The overall test does not name which groups differ.",
    ),
    "domain-item:d078-friedman-test": (
        "The Friedman test compares three or more matched conditions, or complete blocks, with one observation in each block and condition. It does not replace a model that can handle missing, unbalanced, or more complex repeated measurements.",
        "An overall rank-test result that states what the block is, plus justified follow-up comparisons.",
    ),
    "domain-item:d078-probit-regression": (
        "Probit regression models a two-category outcome with a different link from logistic regression. Use it when that link fits the question. The coefficients are on a different scale, so compare predicted probabilities or marginal effects when you need to read the two models together.",
        "The model, estimates or predictions with uncertainty, the checks you ran, and why you chose this link. Like logistic regression, it does not show cause unless the design supports that claim.",
    ),
    "domain-item:d078-tree-ensemble-prediction": (
        "Random forests and gradient-boosted trees can predict or classify when relationships are not a straight line. Compare them with a simple, well-calibrated baseline. Tune them without leaking test information. Report calibration, errors in subgroups, uncertainty, and how far the model can be explained. These models do not replace a statistical test or a causal design.",
        "A reproducible comparison with a baseline, kept-back test results, calibration and error notes, where the features and labels came from, and the limits.",
    ),
    "domain-item:d078-pearson-correlation": (
        "Pearson correlation estimates the strength and direction of a straight-line association between two quantitative measures. Look at the scatterplot, unusual points, the quality of the measures, and the uncertainty. Correlation does not show cause, and it can miss a curved relationship.",
        "The coefficient, its uncertainty, and a reading limited to linear association. Record how missing data and influential cases were handled.",
    ),
    "domain-item:d078-spearman-rank-correlation": (
        "Spearman correlation estimates a relationship that rises or falls consistently, using ranks. It is useful for ordered measures, or when a straight line is the wrong picture. It still describes association, not cause.",
        "Spearman's rho, the test or interval, notes on ties and missing data, and a reading limited to that rank association.",
    ),
    "domain-item:d078-kendall-rank-correlation": (
        "Kendall correlation estimates association from pairs that move together and pairs that do not. Tau-b takes ties into account. Report which version you used. The result is an association, not a cause.",
        "The tau statistic, the version and tie treatment, the uncertainty, and a bounded reading.",
    ),
    "domain-item:d078-linear-regression-ols": (
        "Ordinary least squares estimates how the average of a continuous outcome changes with one or more predictors, when a straight-line model and the error structure are defensible. State what you are estimating, how variables are coded, and whether you include interactions. Check residuals, the shape of the relationship, overlap among predictors, influential cases, and uneven spread. An association is not a cause unless the design identifies one.",
        "A reproducible model, the estimates and their uncertainty, the checks, and a clear line between explanation and prediction.",
    ),
    "domain-item:d078-regularized-linear-regression": (
        "Ridge, LASSO, and elastic net shrink or select coefficients when ordinary least squares is unstable, for example when there are many predictors or the goal is prediction. Tune the penalty inside the training data only. A shrunk coefficient is not the same kind of estimate as ordinary least squares.",
        "The penalty you chose, how you tuned it, the performance on kept-back data, and the limits of the selected coefficients. This is a prediction tool, not a causal design.",
    ),
    "domain-item:d078-ordinal-regression": (
        "Ordinal regression models an outcome whose categories have an order, without pretending those categories are evenly spaced numbers. Check whether the pattern is similar across the steps of the scale, whether some categories are rare, and what probabilities the model predicts.",
        "The model, the assumption checks, and predicted probabilities or effects with uncertainty.",
    ),
    "domain-item:d078-multinomial-logistic-regression": (
        "Multinomial logistic regression models an outcome with more than two categories when those categories have no order. State the reference category. Check for sparse cells and separation, and report predicted probabilities as well as coefficients.",
        "The model, the reference category, the checks, and predicted probabilities with uncertainty. A prediction is not a causal claim.",
    ),
    "domain-item:d078-count-regression": (
        "Poisson and negative binomial models are for counts of events. Include the exposure, such as time or population at risk, when the design has one. Start with Poisson when its assumptions fit. Use the negative binomial when the counts vary more than Poisson expects. Check extra zeros and clustering rather than choosing a model by habit.",
        "The model, the exposure, the dispersion checks, predicted rates or effects, and the uncertainty. The model does not create a causal result.",
    ),
    "domain-item:d078-conversation-analysis": (
        "Conversation analysis studies how people organise talk, turn by turn, in a recording of real interaction. The evidence is the sequence: who speaks, how the next turn responds, and how repair happens. Claims should be grounded in what the participants treat as relevant. It is not the same as critical discourse analysis or a general theme code.",
        "An analysis tied to the transcript, with the sequential evidence and the transcription conventions. Automatic speech or text measures may help you find passages. They do not replace the sequential reading.",
    ),
    "domain-item:d078-exploratory-factor-analysis": (
        "Exploratory factor analysis looks for a small set of underlying dimensions in a group of items, when theory does not yet fix the structure. Choose how many factors to keep and how to rotate them on purpose. Inspect which items load where. Treat the result as exploratory, not as a finished validation.",
        "The factor solution, with the decisions about retention, extraction, rotation, items, and the sample, plus the limits.",
    ),
    "domain-item:d078-confirmatory-factor-analysis": (
        "Confirmatory factor analysis tests a measurement structure you specified in advance. State how the model is identified and which estimator you used. Judge fit and residuals. Check measurement invariance before you compare latent means across groups. A good fit does not, by itself, prove that the measure is valid.",
        "The prespecified model, the fit evidence, the uncertainty of the estimates, the diagnostics, and the scope of the claim.",
    ),
    "domain-item:d078-reliability-estimation-alpha-omega": (
        "Alpha and omega estimate how consistently a set of items hangs together. Use the coefficient whose assumptions match the scale. Report uncertainty where you have it. Internal consistency is not validity, and it is not evidence that the scale has only one dimension.",
        "The reliability estimate, which coefficient it is, the assumptions, the uncertainty, and the limits.",
    ),
    "domain-item:d078-item-response-theory": (
        "Item response theory models the chance of each answer from the item and from a person's level on the trait. Use it when the sample and the item types support the model. Compare it with classical test theory according to the question. Check item fit and whether items behave differently across groups before you treat scores as comparable.",
        "The model, item and person summaries, fit, group checks, and a cautious reading of the scores.",
    ),
    "domain-item:d078-exponential-random-graph-models": (
        "An exponential-family random graph model estimates how likely a network pattern is, given terms such as reciprocity, similar actors being connected, and closed triangles. Define who is in the network and what counts as a tie. Check that the model converged and that it reproduces the patterns you care about. The estimates describe the network's structure. They do not treat each tie as an independent observation.",
        "The network boundary, the model terms, the convergence and fit checks, and a bounded reading of the estimates.",
    ),
    "domain-item:d078-spatial-autocorrelation-moran-lisa": (
        "Moran's I and local indicators ask whether nearby places are more alike than you would expect by chance. Define the places, the weights that say who counts as a neighbour, and the hypothesis. Account for the fact that many local tests are run together. The statistic shows a spatial pattern. It does not name the mechanism or a cause.",
        "The weights, the global and local statistics, the reference procedure, and a reading that keeps the scale and the boundaries in view.",
    ),
    "domain-item:d078-spatial-regression-models": (
        "Spatial lag and spatial error models are for dependence or unevenness across places. A lag model and an error model answer different questions: one is about spillover in the outcome, the other about correlated residuals. Test whether spatial pattern remains, and read direct and indirect effects carefully. Ordinary least squares is a baseline, not an automatic substitute.",
        "The weights, the model you chose and why, the checks, the effect reading, and the uncertainty.",
    ),
    "domain-item:d078-process-tracing": (
        "Process tracing asks how a process inside a case connects conditions to an outcome. Specify the mechanism, what evidence would be expected if it is present, and why this case was chosen. It supports an explanation of the mechanism. It complements, and does not replace, a design that estimates an effect in a population.",
        "A case account of the mechanism, the evidence tests, the alternative explanations, and the limits on generalisation.",
    ),
    "domain-item:d078-odd-agent-model-documentation": (
        "The ODD protocol is a standard way to describe an agent-based model so someone else can see its purpose, the agents and their states, the schedule, the design concepts, the starting conditions, the inputs, and the submodels. The protocol documents the model. It does not prove that the assumptions or the outputs match the world.",
        "A complete ODD description that a reader can inspect.",
    ),
    "domain-item:d078-ml-survey-nonresponse-adjustment": (
        "Machine learning can estimate who responds to a survey, or help build adjustment weights, when the survey design and the extra variables support that use. Compare it with established weighting. Keep the survey design and the variance in view. Predicting who responds does not, by itself, remove nonresponse bias.",
        "The response or weight model, a comparison that respects the design, the bias and variance checks, and the limits.",
    ),
    "domain-item:d078-llm-assisted-text-construct-measurement": (
        "A language model can be used to score a construct in social text, by prompting, by comparing pairs, or by fine-tuning. Define the construct. Compare the scores with human coding or another validated reference. Inspect the scale and the errors for particular groups. Report the model and its version. A number from a model is not automatically a valid measurement.",
        "A validity and reliability check against credible human or reference coding, with an error analysis that includes subgroups.",
    ),
}


def _correct(text: str) -> str:
    return text.replace(
        "goodness-of-fit (how well the counts match a pattern you stated)",
        "goodness-of-fit (whether the model reproduces the patterns in the observed network)",
    )


def _clean(text: str) -> str:
    value = _correct(" ".join(text.replace("\u2011", "-").replace("\u2013", "-").replace("\u2014", "-").split()))
    for pattern, replacement in STAFF:
        value = pattern.sub(replacement, value)
    value = re.sub(r"\s+([,.;])", r"\1", value)
    value = re.sub(r"\(\s+", "(", value)
    value = re.sub(r"\s+\)", ")", value)
    lowered = value.lower()
    for term, gloss in GLOSSARY:
        if term.lower() in lowered and gloss.lower() not in lowered:
            value = re.sub(re.escape(term), gloss, value, count=1, flags=re.I)
            lowered = value.lower()
    if "; " in value and len(value) > 160:
        value = re.sub(r";\s+([a-z])", lambda match: ". " + match.group(1).upper(), value)
    value = re.sub(r"(?<=[.!?])\s+([a-z])", lambda match: match.group(0)[:-1] + match.group(1).upper(), value)
    parts = re.split(r"(?<=[.!?])\s+", value)
    kept: list[str] = []
    for part in parts:
        piece = part.strip()
        if piece and piece not in kept:
            kept.append(piece)
    value = " ".join(kept).strip()
    return re.sub(r"\s{2,}", " ", value)


def _reason(text: str) -> str:
    value = " ".join(text.split())
    area = re.search(r"in ([A-Z][^.]{3,80}?), not a", value)
    if value.startswith("A source-backed option for a bounded role task"):
        return "An option for a specific task in this role. It is not required for every student, and choosing it does not mean you are ready for the job."
    if value.startswith("Optional specialist learning."):
        return "Optional. This belongs to the method you selected. You can continue without choosing it."
    if value.startswith("This is a useful recommended learning option"):
        return "A useful option for the work described above. It is not required for every Social Sciences student. You can continue without it and come back if you need it."
    if value.startswith("This is an optional focus for a narrower question"):
        return "An optional focus for a narrower question. You can continue through Social Sciences without it. Select it when that work fits what you want to learn."
    if value.startswith("A narrower specialist option"):
        return "A narrower option. You can continue without choosing it."
    if value.startswith("This is a useful focused addition in") and area:
        return f"A useful addition in {area.group(1)}. It is not required for every path. Choose it when it fits the question you are working on."
    if value.startswith("This is an optional choice in") and area:
        return f"An optional choice in {area.group(1)}. Choose it when the task fits your question. You can continue without it."
    if value.startswith("Compulsory shared Social Sciences foundation"):
        return "These three are part of Social Sciences for every path. Read them before you choose a method."
    return _clean(value)


def _edge_copy(edge: dict, nodes: dict[str, dict]) -> str | None:
    explanation = edge.get("explanation")
    if not isinstance(explanation, str) or not explanation.strip():
        return None
    if not GENERATED_EDGE.search(explanation):
        return _clean(explanation)
    source = nodes.get(edge.get("source"), {})
    target = nodes.get(edge.get("target"), {})
    source_label = source.get("label") or "This option"
    target_label = target.get("label") or "the connected option"
    relation = edge.get("relationship")
    if relation in {"tool_for", "optional_analysis_tool", "optional_tool_option", "optional_collection_tool", "conditional_library", "visual_network_tool", "computational_network_tool", "simulation_framework", "specialist_simulation_tool"}:
        return f"{source_label} is a tool you can use with {target_label}. Use it when it fits the question and the data. Choosing it does not make it required, and it does not replace the method."
    if relation in {"alternative_to", "alternative_tool_option"}:
        return f"{source_label} and {target_label} are different ways to do related work. Choose the one that fits the task. You do not complete both as steps in one sequence."
    if relation == "builds_on":
        return f"{source_label} builds on {target_label}. That earlier learning is useful background. It blocks you only when this path says it does."
    if relation in {"complements", "works_with"}:
        return f"You can use {source_label} together with {target_label} when the task needs both. Choosing one does not add the other."
    if relation in {"supports", "useful_for"}:
        return f"{source_label} can support work on {target_label}. Use it when it fits the task. It is not required."
    if relation == "specialist_extension_of":
        return f"{source_label} is a more specialised form of {target_label}. Use it when that narrower task matters. It is not required for the wider path."
    if relation in {"requires", "prerequisite_for"}:
        return f"{source_label} is preparation connected to {target_label}. It does not stop your path, and it does not add the other item for you."
    return _clean(explanation)


def _strings(value, key: str | None = None):
    if isinstance(value, str):
        if key == "requirement_reason":
            return _reason(value)
        return _clean(value)
    if isinstance(value, list) and key in {"limitations", "learner_output"}:
        rewritten = []
        for item in value:
            if not isinstance(item, str) or not item.strip():
                continue
            if key == "limitations" and AUDIT_LIMIT.search(item):
                continue
            rewritten.append(_clean(item))
        return rewritten
    return value


def apply_student_language(graph: dict) -> dict:
    nodes = {node["id"]: node for node in graph["nodes"]}
    changed = 0
    for node in graph["nodes"]:
        authored = AUTHORED.get(node.get("id"))
        if authored and node.get("meaning"):
            if node.get("meaning") != authored[0]:
                node["meaning"] = authored[0]
                changed += 1
            if node.get("learner_output") != authored[1]:
                node["learner_output"] = authored[1]
                changed += 1
        for key, value in list(node.items()):
            if key not in TEXT_KEYS and key not in {"limitations"}:
                continue
            if key in {"meaning", "learner_output"} and authored:
                continue
            rewritten = _strings(value, key)
            if rewritten != value:
                node[key] = rewritten
                changed += 1
        application = node.get("contextual_application")
        if isinstance(application, dict):
            for key, value in list(application.items()):
                if key in TEXT_KEYS and isinstance(value, str):
                    rewritten = _clean(value)
                    if rewritten != value:
                        application[key] = rewritten
                        changed += 1
    for edge in graph["edges"]:
        if edge.get("student_visible") is not True:
            continue
        rewritten = _edge_copy(edge, nodes)
        if rewritten and rewritten != edge.get("explanation"):
            edge["explanation"] = rewritten
            changed += 1
    transition = graph.get("programme_transition")
    if isinstance(transition, dict):
        for key, value in list(transition.items()):
            if isinstance(value, str) and key in TEXT_KEYS:
                rewritten = _clean(value)
                if rewritten != value:
                    transition[key] = rewritten
                    changed += 1
    graph["student_language"] = {
        "applied_on": "2026-10-20",
        "voice": "student_professional",
        "fields_rewritten": changed,
    }
    return graph


def main() -> None:
    graph = json.loads(GRAPH.read_text(encoding="utf-8"))
    apply_student_language(graph)
    GRAPH.write_text(json.dumps(graph, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    sample = next(node for node in graph["nodes"] if node["id"] == "domain-item:d078-chi-square-tests")
    print(json.dumps({
        "rewritten": graph["student_language"]["fields_rewritten"],
        "chi_square": sample["meaning"],
        "output": str(GRAPH),
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()

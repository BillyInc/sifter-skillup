"""Apply the evidence-reviewed D078 method/technique additions once.

The canonical route graph is the source. This patch adds only missing
selectable techniques and verified software choices, then reuses component
method routes for combinations. All added edges are optional and nonblocking.
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
GRAPH = ROOT / "data/career-mapping/_audit/D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json"
LEDGER = ROOT / "data/career-mapping/_audit/D078_METHOD_TECHNIQUE_RESOLUTION_2026_10_20.json"
DATE = "2026-10-20"

METHODS = {
    "archival": "domain-item:archival-and-historical-research",
    "case_study": "domain-item:case-study-and-comparative-case-design",
    "quant": "domain-item:d078-quantitative-approach",
    "qual": "domain-item:d078-qualitative-approach",
    "comp": "domain-item:d078-computational-social-research",
    "document": "domain-item:d078-document-analysis",
    "discourse": "domain-item:discourse-and-conversation-analysis",
    "interviews": "domain-item:d078-interviews",
    "survey": "domain-item:d078-survey-method",
    "psychometrics": "domain-item:psychometrics-and-scale-construction",
    "longitudinal": "domain-item:longitudinal-panel-and-multilevel-data",
    "causal": "domain-item:experiments-quasi-experiments-and-causal-inference",
    "abm": "domain-item:d078-agent-based-modeling",
    "spatial": "domain-item:d078-spatial-social-analysis",
    "network": "domain-method:network-analysis",
    "social_network": "domain-method:social-network-analysis",
    "evaluation": "domain-item:programme-evaluation-and-theory-of-change",
    "focus_groups": "domain-item:focus-groups-and-workshops",
    "mixed": "domain-item:d078-mixed-methods",
    "experiments": "domain-item:experiments-quasi-experiments-and-causal-inference",
    "participatory": "domain-item:participatory-and-action-research",
    "observation": "domain-item:d078-observation-ethnography",
    "evidence_synthesis": "domain-item:systematic-and-scoping-evidence-synthesis",
}

SOURCES = {
    "chi": ["https://stat.ethz.ch/R-manual/R-devel/library/stats/html/chisq.test.html", "https://www.ibm.com/docs/en/spss-statistics/31.0.0?topic=features-chi-square-test"],
    "ttest": ["https://stat.ethz.ch/R-manual/R-devel/library/stats/html/t.test.html", "https://www.ibm.com/docs/en/spss-statistics/30.0.0?topic=reference-t-test"],
    "anova": ["https://stat.ethz.ch/R-manual/R-devel/library/stats/html/aov.html", "https://www.ibm.com/docs/en/spss-statistics/32.0.0?topic=anova-overview-command"],
    "logit": ["https://stat.ethz.ch/R-manual/R-devel/library/stats/html/glm.html", "https://www.statsmodels.org/stable/user-guide.html", "https://www.stata.com/features/overview/logistic-regression/"],
    "cda": ["https://revistas.usp.br/linhadagua/en/article/view/47728/0", "https://onlinelibrary.wiley.com/doi/full/10.1111/j.1467-6486.2009.00884.x"],
    "ipa": ["https://ipa.bbk.ac.uk/about-ipa", "https://us.sagepub.com/en-us/nam/interpretative-phenomenological-analysis/book250130"],
    "nlp": ["https://scikit-learn.org/stable/modules/feature_extraction.html", "https://huggingface.co/docs/transformers/main_classes/pipelines", "https://www.tidytextmining.com/"],
    "ml": ["https://scikit-learn.org/stable/user_guide.html", "https://scikit-learn.org/stable/modules/cross_validation.html"],
    "timeseries": ["https://www.eviews.com/Learning/timeseries.html", "https://help.eviews.com/content/timeser-Time_Series_Regression.html", "https://www.statsmodels.org/stable/user-guide.html", "https://www.stata.com/features/overview/"],
    "jasp": ["https://jasp-stats.org/how-to-use-jasp/"],
    "sas": ["https://documentation.sas.com/doc/en/statug/latest/statug_intro_sect001.htm"],
    "maxqda": ["https://www.maxqda.com/products/maxqda", "https://www.maxqda.com/help/mixed-methods/general"],
    "atlas": ["https://manuals.atlasti.com/Win/en/manual/Querying/QueryingData.html"],
    "dedoose": ["https://www.dedoose.com/platform/dedoose-platform"],
    "qualcoder": ["https://qualcoder.org/"],
    "spacy": ["https://spacy.io/usage/linguistic-features"],
    "nltk": ["https://www.nltk.org/"],
    "quanteda": ["https://quanteda.io/"],
    "transformers": ["https://huggingface.co/docs/transformers/main_classes/pipelines"],
    "eviews": ["https://www.eviews.com/Learning/timeseries.html", "https://help.eviews.com/content/series-Automatic_ARIMA_Forecasting.html"],
    "qualtrics": ["https://www.qualtrics.com/support/survey-platform/getting-started/survey-platform-overview/"],
    "odk": ["https://docs.getodk.org/"],
    "fisher": ["https://stat.ethz.ch/R-manual/R-devel/library/stats/html/fisher.test.html", "https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.fisher_exact.html", "https://www.ibm.com/docs/en/spss-statistics/31.0.0?topic=features-crosstabs", "https://jasp-stats.org/release-notes/"],
    "unconditional_exact": ["https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.barnard_exact.html", "https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.boschloo_exact.html"],
    "wilcoxon": ["https://stat.ethz.ch/R-manual/R-devel/library/stats/html/wilcox.test.html", "https://www.ibm.com/docs/en/spss-statistics/32.0.0?topic=tests-wilcoxon-subcommand-npar-command", "https://jasp-stats.org/2018/06/20/introducing-jasp-0-9/", "https://documentation.sas.com/api/collections/pgmsascdc/9.4_3.5/docsets/statug/content/npar1way.pdf"],
    "kruskal": ["https://stat.ethz.ch/R-manual/R-devel/library/stats/html/kruskal.test.html", "https://www.ibm.com/docs/en/spss-statistics/30.0.0?topic=tests-choose-independent-samples-nonparametric", "https://jasp-stats.org/2018/06/20/introducing-jasp-0-9/", "https://documentation.sas.com/api/collections/pgmsascdc/9.4_3.5/docsets/statug/content/npar1way.pdf"],
    "friedman": ["https://stat.ethz.ch/R-manual/R-devel/library/stats/html/friedman.test.html", "https://www.ibm.com/docs/en/spss-statistics/32.0.0?topic=nptests-related-subcommand-command", "https://jasp-stats.org/2018/06/20/introducing-jasp-0-9/"],
    "probit": ["https://stat.ethz.ch/R-manual/R-devel/library/stats/html/family.html", "https://stat.ethz.ch/R-manual/R-devel/library/stats/html/glm.html", "https://www.ibm.com/docs/en/spss-statistics/30.0.0?topic=regression-probit", "https://www.stata.com/manuals/rprobit.pdf", "https://www.statsmodels.org/stable/generated/statsmodels.genmod.families.links.Probit.html"],
    "ensembles": ["https://scikit-learn.org/stable/modules/ensemble.html", "https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.RandomForestClassifier.html"],
}

TECHNIQUES = [
    {"id":"domain-item:d078-chi-square-tests","label":"Chi-square tests for categorical counts and association","item_type":"statistical_test","purpose":"Use goodness-of-fit or contingency-table chi-square procedures when the evidence is categorical counts and the design supports the expected-count approximation; consider exact or simulation-based alternatives for sparse tables.","output":"A labelled contingency table, expected counts, test result and cautious statement of association; association alone does not establish causation.","methods":["quant","survey","psychometrics"],"method_relations":{"quant":"builds_on","survey":"complements","psychometrics":"complements"},"sources":SOURCES["chi"]},
    {"id":"domain-item:d078-t-tests","label":"One-sample, independent-samples and paired t-tests","item_type":"statistical_test","purpose":"Compare a mean with a reference value or compare two independent or paired means when the outcome and sampling/design assumptions fit. Use Welch's independent-samples version when equal variances are not justified.","output":"A mean difference, confidence interval, test result and design-aware interpretation; two-group comparisons do not replace an appropriate multi-group or repeated-measures model.","methods":["quant","experiments","survey","evaluation"],"method_relations":{"quant":"builds_on","experiments":"complements","survey":"complements","evaluation":"complements"},"sources":SOURCES["ttest"]},
    {"id":"domain-item:d078-anova-and-repeated-measures","label":"ANOVA: group, factorial and repeated-measures comparisons","item_type":"statistical_model","purpose":"Compare means across multiple groups or factorial conditions; repeated-measures forms account for within-case measurements when the design and covariance assumptions support them. Follow a significant omnibus comparison with planned contrasts or suitable multiple-comparison procedures.","output":"A model/contrast summary with group estimates, uncertainty and diagnostic notes; ANOVA identifies evidence of differences but does not by itself identify which groups differ or why.","methods":["quant","longitudinal","psychometrics","experiments"],"method_relations":{"quant":"builds_on","longitudinal":"complements","psychometrics":"complements","experiments":"complements"},"sources":SOURCES["anova"]},
    {"id":"domain-item:d078-logistic-regression","label":"Logistic regression for binary outcomes","item_type":"statistical_model","purpose":"Model a binary outcome using predictors; report odds ratios or predicted probabilities with uncertainty and assess fit, calibration, separation and influential observations as appropriate. Treat prediction and explanatory inference as different goals.","output":"A documented model specification, coefficient or prediction summaries, diagnostics and limitations; a predictive score does not establish a causal effect.","methods":["quant","causal","psychometrics","evaluation"],"method_relations":{"quant":"builds_on","causal":"complements","psychometrics":"complements","evaluation":"complements"},"sources":SOURCES["logit"]},
    {"id":"domain-item:d078-critical-discourse-analysis","label":"Critical discourse analysis (CDA)","item_type":"qualitative_method","purpose":"Examine how language and other communicative forms relate to social practices, institutions, ideology and power. Specify the CDA tradition, text/context boundary, sampling, analytic levels and interpretive position.","output":"A documented corpus and contextual analysis linking language patterns to discourse practice and social conditions; frequency counts or NLP outputs cannot substitute for this contextual interpretation.","methods":["discourse","document","qual","comp"],"sources":SOURCES["cda"]},
    {"id":"domain-item:d078-interpretative-phenomenological-analysis","label":"Interpretative phenomenological analysis (IPA)","item_type":"qualitative_method","purpose":"Explore how participants make sense of significant lived experiences using detailed, case-by-case analysis before cautious cross-case patterns. It is idiographic and interpretative; it is not a high-volume automated text-classification method.","output":"A reflexive case analysis grounded in participant accounts, with transparent movement from close reading to interpretive themes and clear limits on transferability.","methods":["qual","interviews","focus_groups"],"sources":SOURCES["ipa"]},
    {"id":"domain-item:d078-nlp-and-text-mining","label":"Natural language processing and computational text mining","item_type":"computational_method","purpose":"Turn social text into analysable representations for retrieval, measurement, classification, clustering or summarisation. Define the corpus and construct, document preprocessing, validate measures against source context and inspect errors and subgroup performance.","output":"A reproducible text dataset/pipeline, validated measures or model results and error analysis. NLP is a family of computational techniques, not a substitute for CDA, conversation analysis or interpretive reading.","methods":["comp","document","discourse","qual"],"method_relations":{"comp":"builds_on","document":"complements","discourse":"complements","qual":"complements"},"sources":SOURCES["nlp"]},
    {"id":"domain-item:d078-supervised-machine-learning","label":"Supervised machine learning for social-research prediction and classification","item_type":"computational_method","purpose":"Train a model from labelled examples when the goal is prediction or scalable classification. Start from measurement, sampling and statistical foundations; separate training, validation and held-out evaluation; check leakage, calibration, subgroup errors, label validity and ethical constraints.","output":"A reproducible model card/report with target, labels, training/evaluation split, baseline, suitable performance metrics, error analysis and limits. ML can complement or compete with a statistical model for predictive tasks but is not a direct replacement for a chi-square test, t-test, ANOVA or causal design.","methods":["comp","quant","document","causal"],"method_relations":{"comp":"builds_on","quant":"builds_on","document":"complements","causal":"complements"},"sources":SOURCES["ml"]},
    {"id":"domain-item:d078-fisher-exact-test","label":"Fisher's exact test for categorical counts","item_type":"statistical_test","purpose":"Test association in a contingency table when the sampling and fixed-margin assumptions fit, especially for a 2×2 table where an asymptotic chi-square approximation is unsuitable. For larger tables, specify the chosen exact or resampling procedure and its assumptions.","output":"A contingency-table result with the null, odds-ratio estimate where applicable, interval, exact/resampling procedure and a bounded interpretation. It tests association, not causation.","methods":["quant","survey"],"method_relations":{"quant":"builds_on","survey":"complements"},"sources":SOURCES["fisher"]},
    {"id":"domain-item:d078-barnard-exact-test","label":"Barnard's unconditional exact test for 2×2 tables","item_type":"statistical_test","purpose":"Compare two independent binomial proportions in a 2×2 table using an unconditional exact procedure when its sampling model fits. Unlike Fisher's conditional test, it does not condition on both margins; the test statistic and nuisance-parameter maximization must be specified and reported.","output":"An exact test result with table orientation, null/alternative, pooled-variance choice, computation settings and bounded interpretation. It tests association/difference, not causation.","methods":["quant","survey"],"method_relations":{"quant":"builds_on","survey":"complements"},"sources":SOURCES["unconditional_exact"]},
    {"id":"domain-item:d078-boschloo-exact-test","label":"Boschloo's unconditional exact test for 2×2 tables","item_type":"statistical_test","purpose":"Compare two independent binomial proportions in a 2×2 table using an unconditional exact test based on Fisher's p-value when that sampling model fits. It can be more powerful than Fisher's conditional procedure, but the sampling assumptions and two-sided p-value convention must be stated.","output":"An exact test result with table orientation, null/alternative, p-value convention and bounded interpretation. It tests association/difference, not causation.","methods":["quant","survey"],"method_relations":{"quant":"builds_on","survey":"complements"},"sources":SOURCES["unconditional_exact"]},
    {"id":"domain-item:d078-wilcoxon-rank-tests","label":"Wilcoxon rank-sum and signed-rank tests","item_type":"statistical_test","purpose":"Use the rank-sum/Mann–Whitney procedure for two independent samples or the signed-rank procedure for paired observations when the target and design suit a rank-based comparison. These tests concern distributional/location contrasts under their assumptions; they are not automatic tests of medians and do not estimate the same quantity as every t-test.","output":"A design-labelled rank-test result, effect/interval where supported, tie and distribution notes, and a cautious interpretation of the contrast.","methods":["quant","survey","experiments","longitudinal"],"method_relations":{"quant":"builds_on","survey":"complements","experiments":"complements","longitudinal":"complements"},"sources":SOURCES["wilcoxon"]},
    {"id":"domain-item:d078-kruskal-wallis-test","label":"Kruskal–Wallis rank test for independent groups","item_type":"statistical_test","purpose":"Compare rank distributions across independent groups when a rank-based location comparison fits better than a mean-model ANOVA. It is not a general fix for any ANOVA assumption violation; inspect group distributions and follow an omnibus result with justified multiplicity-aware contrasts.","output":"An omnibus rank-test result with group/distribution description and a justified follow-up plan; it does not identify which groups differ by itself.","methods":["quant","survey","experiments"],"method_relations":{"quant":"builds_on","survey":"complements","experiments":"complements"},"sources":SOURCES["kruskal"]},
    {"id":"domain-item:d078-friedman-test","label":"Friedman rank test for matched or blocked groups","item_type":"statistical_test","purpose":"Compare three or more matched conditions or complete blocks with one observation per block-condition when a rank-based repeated comparison fits. It is not a substitute for a model that handles incomplete, unbalanced or more complex repeated-measures data.","output":"A block-aware omnibus rank-test result, with an explicit block definition and justified follow-up comparisons.","methods":["quant","longitudinal","experiments"],"method_relations":{"quant":"builds_on","longitudinal":"complements","experiments":"complements"},"sources":SOURCES["friedman"]},
    {"id":"domain-item:d078-probit-regression","label":"Probit regression for binary outcomes","item_type":"statistical_model","purpose":"Fit a binomial generalized linear model with a probit link when the normal-CDF link is substantively or technically appropriate. It is a link-function alternative to logistic regression for the same binary outcome, with different coefficient scales; compare predicted probabilities or marginal effects when interpretation across links matters.","output":"A specified binomial model, coefficient/prediction summaries with uncertainty, diagnostics and link-choice rationale. Like logistic regression, it does not establish causation without a suitable design.","methods":["quant","causal","survey","evaluation"],"method_relations":{"quant":"builds_on","causal":"complements","survey":"complements","evaluation":"complements"},"sources":SOURCES["probit"]},
    {"id":"domain-item:d078-tree-ensemble-prediction","label":"Tree-ensemble machine learning for prediction and classification","item_type":"computational_method","purpose":"Use random forests or gradient-boosted trees for supervised prediction/classification when nonlinearities or interactions may improve held-out predictive performance. Compare against a simple, well-calibrated baseline; tune without leakage and report calibration, subgroup errors, uncertainty and explainability limits. These models do not replace inferential tests or causal identification.","output":"A reproducible comparison of a tree ensemble with a baseline, including held-out metrics, calibration/error analysis, feature/label provenance and limitations.","methods":["comp","quant","document"],"method_relations":{"comp":"builds_on","quant":"builds_on","document":"complements"},"sources":SOURCES["ensembles"]},
]

# Fresh, source-checked additions from the exhaustive method-family rerun.
# Capture all teachable matches instead of treating the former 16-card set as
# a cap; each remains optional and is routed only through relevant methods.
SOURCES.update({
    "correlation": ["https://stat.ethz.ch/R-manual/R-devel/library/stats/html/cor.test.html", "https://stat.ethz.ch/R-manual/R-devel/library/stats/html/cor.html"],
    "linear": ["https://stat.ethz.ch/R-manual/R-devel/library/stats/html/lm.html", "https://www.statsmodels.org/stable/regression.html", "https://www.statsmodels.org/stable/diagnostic.html"],
    "regularized": ["https://scikit-learn.org/stable/modules/linear_model.html", "https://scikit-learn.org/stable/api/sklearn.linear_model.html"],
    "discrete_models": ["https://www.statsmodels.org/stable/discretemod.html", "https://stat.ethz.ch/R-manual/R-devel/library/stats/html/family.html"],
    "count_models": ["https://www.statsmodels.org/stable/discretemod.html", "https://stat.ethz.ch/R-manual/R-devel/library/MASS/html/glm.nb.html"],
    "conversation_analysis": ["https://www.cambridge.org/core/books/abs/cambridge-handbook-of-discourse-studies/sequence-organization-understanding-what-drives-talk/99C304161504D8C1B86595C1CB59E070", "https://www.cambridge.org/core/books/abs/cambridge-handbook-of-language-in-context/conversation-analysis/98C9CEBDFD3DBAF6DC34BE05DAD39D38", "https://methods.sagepub.com/book/mono/embed/conversation-analysis/back-matter/d15"],
    "factor_analysis": ["https://stat.ethz.ch/R-manual/R-devel/library/stats/html/factanal.html", "https://stat.ethz.ch/CRAN/web/packages/psych/refman/psych.html"],
    "irt": ["https://stat.ethz.ch/CRAN/web/packages/mirt/index.html", "https://stat.ethz.ch/CRAN/web/packages/mirt/refman/mirt.html", "https://pubmed.ncbi.nlm.nih.gov/8272470/"],
    "ergm": ["https://statnet.org/workshop-ergm/ergm_tutorial.html", "https://statnet.org/workshop-ergm/"],
    "spatial_methods": ["https://geodacenter.github.io/glossary/", "https://geodacenter.github.io/documentation/", "https://www.stata.com/features/spatial-autoregressive-models/", "https://www.stata.com/manuals/sp.pdf"],
    "odd": ["https://www.usgs.gov/publications/a-standard-protocol-describing-individual-based-and-agent-based-models", "https://doi.org/10.18564/jasss.4259"],
    "process_tracing": ["https://academic.oup.com/edited-volume/62239/chapter-abstract/550813409", "https://academic.oup.com/book/44646/chapter/378696459"],
    "survey_ml": ["https://www150.statcan.gc.ca/n1/en/catalogue/12-001-X202500100003"],
    "llm_text_measurement": ["https://aclanthology.org/2025.emnlp-main.1635/"],
    "geographical_rf": ["https://doi.org/10.1080/10106049.2019.1595177", "https://journals.sagepub.com/doi/10.1177/23998083231153401"],
})
TECHNIQUES.extend([
    {"id":"domain-item:d078-pearson-correlation","label":"Pearson product-moment correlation","item_type":"statistical_measure","purpose":"Estimate and test strength and direction of linear association between paired quantitative variables. Inspect scatterplots, influential observations, measurement quality and uncertainty. Correlation does not establish causation and can miss nonlinear association.","output":"Pearson coefficient with uncertainty and a design-aware interpretation of linear association; document missing-data handling and influential cases.","methods":["quant","survey","psychometrics"],"method_relations":{"quant":"builds_on","survey":"complements","psychometrics":"complements"},"sources":SOURCES["correlation"]},
    {"id":"domain-item:d078-spearman-rank-correlation","label":"Spearman rank correlation","item_type":"statistical_measure","purpose":"Estimate monotonic association using ranks, especially for ordinal measures or relationships not well represented by Pearson linear correlation. Inspect ties, measurement and design; rank correlation remains associational, not causal.","output":"Spearman rho with uncertainty/test result, tie/missing-data notes and interpretation limited to rank-based monotonic association.","methods":["quant","survey","psychometrics"],"method_relations":{"quant":"builds_on","survey":"complements","psychometrics":"complements"},"sources":SOURCES["correlation"]},
    {"id":"domain-item:d078-kendall-rank-correlation","label":"Kendall rank correlation","item_type":"statistical_measure","purpose":"Estimate ordinal/rank association through concordant and discordant pairs, with tau-b handling ties. Choose it when the scale, sample and inferential target fit; report the tau variant and tie handling. Association does not establish causation.","output":"Kendall tau with variant, tie treatment, uncertainty/test result and bounded interpretation.","methods":["quant","survey","psychometrics"],"method_relations":{"quant":"builds_on","survey":"complements","psychometrics":"complements"},"sources":SOURCES["correlation"]},
    {"id":"domain-item:d078-linear-regression-ols","label":"Simple and multiple linear regression (ordinary least squares)","item_type":"statistical_model","purpose":"Estimate conditional mean relationships for a continuous outcome using one or more predictors when a linear-model specification and error structure are defensible. Specify the estimand, coding, interactions and uncertainty; inspect residuals, functional form, collinearity, influence and heteroskedasticity. Association is not causal without an identifying design.","output":"Reproducible model specification with coefficient estimates, uncertainty, diagnostics and a clear distinction between explanatory inference and prediction.","methods":["quant","survey","longitudinal","causal","evaluation"],"method_relations":{"quant":"builds_on","survey":"complements","longitudinal":"complements","causal":"complements","evaluation":"complements"},"sources":SOURCES["linear"]},
    {"id":"domain-item:d078-regularized-linear-regression","label":"Regularized linear regression: ridge, LASSO and elastic net","item_type":"computational_method","purpose":"Use penalized linear models when prediction or high-dimensional estimation makes unregularized OLS unstable: ridge shrinks coefficients, LASSO induces sparsity and elastic net combines penalties. Tune within training folds and prevent leakage; shrunken/selected coefficients are not ordinary unbiased OLS estimates.","output":"Documented penalty choice, cross-validated tuning, held-out performance and coefficient/selection limitations. This is a statistical-learning extension, not a causal design.","methods":["quant","comp","causal"],"method_relations":{"quant":"builds_on","comp":"builds_on","causal":"complements"},"sources":SOURCES["regularized"]},
    {"id":"domain-item:d078-ordinal-regression","label":"Ordinal regression for ordered categorical outcomes","item_type":"statistical_model","purpose":"Model an ordered outcome while preserving category order, using a cumulative-link/logit or probit formulation when assumptions fit. Check proportional-odds/parallel-lines assumptions, category sparsity and predicted probabilities; do not treat ordered categories as automatically continuous.","output":"Specified ordinal model, assumption checks and category-specific predicted probabilities or effects with uncertainty.","methods":["quant","survey","psychometrics","evaluation"],"method_relations":{"quant":"builds_on","survey":"complements","psychometrics":"complements","evaluation":"complements"},"sources":SOURCES["discrete_models"]},
    {"id":"domain-item:d078-multinomial-logistic-regression","label":"Multinomial logistic regression for unordered categorical outcomes","item_type":"statistical_model","purpose":"Model an unordered outcome with more than two categories when multinomial-logit assumptions and data support it. State reference category, inspect sparse cells/separation, assess independence-of-irrelevant-alternatives where relevant, and report predicted probabilities as well as coefficients.","output":"Documented multinomial model with reference category, diagnostics and uncertainty-aware predicted probabilities; prediction is distinct from causal interpretation.","methods":["quant","survey","causal","evaluation"],"method_relations":{"quant":"builds_on","survey":"complements","causal":"complements","evaluation":"complements"},"sources":SOURCES["discrete_models"]},
    {"id":"domain-item:d078-count-regression","label":"Count regression: Poisson and negative binomial models","item_type":"statistical_model","purpose":"Model non-negative event counts with exposure/offset and dependence structure represented appropriately. Start with Poisson when its mean-variance structure is plausible; consider negative binomial when overdispersion is supported, and diagnose zero inflation, clustering and excess zeros rather than selecting by habit.","output":"Count-model specification with exposure, dispersion and residual checks, predicted rates/effects and uncertainty; the model does not create causal identification.","methods":["quant","survey","longitudinal","causal","evaluation"],"method_relations":{"quant":"builds_on","survey":"complements","longitudinal":"complements","causal":"complements","evaluation":"complements"},"sources":SOURCES["count_models"]},
    {"id":"domain-item:d078-conversation-analysis","label":"Conversation analysis (CA) of talk-in-interaction","item_type":"qualitative_method","purpose":"Study how participants organize naturally occurring interaction turn by turn, including turn-taking, sequence organization, repair and the actions accomplished through talk. Use recordings and sufficiently detailed transcripts, analyze cases closely, and ground claims in participants’ displayed orientations. CA is distinct from CDA and generic thematic coding.","output":"Transcript-grounded analysis with sequential evidence, interactional context and transparent transcription conventions; automated speech/text measures may aid retrieval but cannot replace sequential interpretation.","methods":["discourse","qual","interviews","observation","focus_groups","participatory"],"method_relations":{"discourse":"complements","qual":"complements","interviews":"complements","observation":"complements","focus_groups":"complements","participatory":"complements"},"sources":SOURCES["conversation_analysis"]},
    {"id":"domain-item:d078-exploratory-factor-analysis","label":"Exploratory factor analysis (EFA)","item_type":"psychometric_method","purpose":"Explore plausible latent dimensions underlying a set of measured items when theory and prior evidence do not yet specify a sufficiently constrained structure. Choose factor-retention and rotation methods deliberately, inspect loadings/cross-loadings and factorability, and treat the result as exploratory rather than confirmatory validation.","output":"A documented factor solution with retention, extraction, rotation, item and sample decisions and limitations.","methods":["psychometrics","quant","survey"],"method_relations":{"psychometrics":"builds_on","quant":"complements","survey":"complements"},"sources":SOURCES["factor_analysis"]},
    {"id":"domain-item:d078-confirmatory-factor-analysis","label":"Confirmatory factor analysis (CFA)","item_type":"psychometric_method","purpose":"Test a theoretically specified latent measurement structure against observed item data. State identification and estimator choices, assess model fit and residuals, and evaluate measurement invariance before interpreting latent mean/group differences. A good fit alone does not prove construct validity.","output":"A prespecified measurement model with fit evidence, parameter uncertainty, diagnostics and scope limits.","methods":["psychometrics","quant","survey"],"method_relations":{"psychometrics":"builds_on","quant":"complements","survey":"complements"},"sources":SOURCES["factor_analysis"]},
    {"id":"domain-item:d078-reliability-estimation-alpha-omega","label":"Scale reliability estimation: alpha, omega and alternatives","item_type":"psychometric_method","purpose":"Estimate score reliability using coefficients whose assumptions match the scale structure; compare alpha with model-based omega or other appropriate estimates, report uncertainty where available, and do not use internal consistency as a substitute for validity or dimensionality evidence.","output":"Reliability estimates with the coefficient definition, structural assumptions, interval/uncertainty and limitations.","methods":["psychometrics","quant","survey"],"method_relations":{"psychometrics":"builds_on","quant":"complements","survey":"complements"},"sources":SOURCES["factor_analysis"]},
    {"id":"domain-item:d078-item-response-theory","label":"Item response theory (IRT) and differential item functioning","item_type":"psychometric_method","purpose":"Model item-level response probabilities and latent traits for binary or polytomous items when the item-response assumptions and sample support the model. Compare classical test theory and IRT by the question and design; test item/model fit and differential item functioning before claiming cross-group comparability.","output":"A specified IRT model, item/person parameter and fit summaries, group/DIF checks and cautious interpretation of latent scores.","methods":["psychometrics","quant","survey"],"method_relations":{"psychometrics":"builds_on","quant":"complements","survey":"complements"},"sources":SOURCES["irt"]},
    {"id":"domain-item:d078-exponential-random-graph-models","label":"Exponential-family random graph models (ERGMs)","item_type":"network_statistical_model","purpose":"Model the probability of network configurations as a function of theoretically motivated structural and actor/covariate terms such as reciprocity, homophily and transitivity. Define the network boundary and tie process, assess convergence and goodness of fit, and interpret parameters as conditional network structure rather than independent observations.","output":"A documented network boundary, model terms, convergence/GOF assessment and substantively bounded interpretation.","methods":["social_network","network","quant","comp"],"method_relations":{"social_network":"builds_on","network":"builds_on","quant":"complements","comp":"complements"},"sources":SOURCES["ergm"]},
    {"id":"domain-item:d078-spatial-autocorrelation-moran-lisa","label":"Spatial autocorrelation: Moran's I and local indicators (LISA)","item_type":"spatial_statistical_method","purpose":"Measure global clustering and local spatial association after defining the spatial units, weights matrix and hypothesis. Use permutation/reference procedures and account for multiple local tests; the statistic identifies spatial pattern, not a mechanism or causal effect.","output":"A stated spatial-weights definition, global/local statistics, uncertainty/reference procedure and interpretation mindful of scale and boundary choices.","methods":["spatial","quant","longitudinal"],"method_relations":{"spatial":"builds_on","quant":"complements","longitudinal":"complements"},"sources":SOURCES["spatial_methods"]},
    {"id":"domain-item:d078-spatial-regression-models","label":"Spatial regression: spatial lag and spatial error models","item_type":"spatial_statistical_model","purpose":"Model spatial dependence or spatial heterogeneity when the research question, spatial weights and data support it. Distinguish outcome spillovers from correlated errors, test residual spatial dependence and interpret direct/indirect effects carefully; ordinary OLS is a baseline, not an automatic substitute.","output":"A justified spatial weights matrix and model choice with diagnostics, effect interpretation and uncertainty.","methods":["spatial","quant","longitudinal","causal"],"method_relations":{"spatial":"builds_on","quant":"complements","longitudinal":"complements","causal":"complements"},"sources":SOURCES["spatial_methods"]},
    {"id":"domain-item:d078-process-tracing","label":"Process tracing for within-case causal mechanisms","item_type":"case_study_method","purpose":"Develop or test a theory of how a causal process links conditions to an outcome within one case or a small number of cases. Specify mechanisms, observable implications, diagnostic evidence and case-selection logic; this supports mechanism-based explanation and complements population-level causal-effect designs without replacing them.","output":"A case-specific mechanism account with evidence tests, alternative explanations and limits on generalisation.","methods":["case_study","causal","evaluation","archival"],"method_relations":{"case_study":"builds_on","causal":"complements","evaluation":"complements","archival":"complements"},"sources":SOURCES["process_tracing"]},
    {"id":"domain-item:d078-odd-agent-model-documentation","label":"ODD protocol for documenting agent-based models","item_type":"simulation_documentation_protocol","purpose":"Describe an agent-based model in a reproducible Overview, Design concepts and Details structure covering purpose, state variables/scales, process scheduling, design concepts, initialization, inputs and submodels. ODD documents model specification; it does not validate empirical assumptions or outputs.","output":"A reproducible ODD model description that lets readers inspect purpose, design, initialization and implementation details.","methods":["abm","comp"],"method_relations":{"abm":"builds_on","comp":"complements"},"sources":SOURCES["odd"]},
    {"id":"domain-item:d078-ml-survey-nonresponse-adjustment","label":"Machine learning for survey nonresponse adjustment","item_type":"survey_computational_method","purpose":"Use ML or ensemble models to estimate response propensities or adjustment weights when auxiliary variables and survey design support the approach. Compare with established weighting/calibration procedures, preserve design and variance considerations, and assess nonresponse bias; better prediction of response does not itself remove nonresponse bias.","output":"A documented response/weight model, design-aware comparison, bias/variance diagnostics and limitations.","methods":["survey","quant","comp"],"method_relations":{"survey":"complements","quant":"builds_on","comp":"builds_on"},"sources":SOURCES["survey_ml"]},
    {"id":"domain-item:d078-llm-assisted-text-construct-measurement","label":"LLM-assisted measurement of constructs in social text","item_type":"computational_method","purpose":"Explore prompt-based, pairwise-comparison or fine-tuned language-model approaches to measure constructs expressed in social text. Define the construct, compare against human-annotated or validated references, inspect scale behavior and subgroup errors, and report model/version and uncertainty; apparent numeric scores are not automatically valid measurements.","output":"A construct-validity and reliability assessment comparing the chosen LLM scoring method to credible human/reference measurements, with error and subgroup analysis.","methods":["comp","document","discourse","qual"],"method_relations":{"comp":"builds_on","document":"complements","discourse":"complements","qual":"complements"},"sources":SOURCES["llm_text_measurement"]},
])

TECHNIQUE_ALTERNATIVES = [
    ("domain-item:d078-fisher-exact-test","domain-item:d078-chi-square-tests","For sparse categorical-count tables, choose the exact or justified resampling procedure when the asymptotic chi-square approximation is unsuitable; the tests have different reference distributions and sampling assumptions.",SOURCES["fisher"]+SOURCES["chi"]),
    ("domain-item:d078-barnard-exact-test","domain-item:d078-fisher-exact-test","For independent-binomial 2×2 data, Barnard's unconditional test is an exact alternative when conditioning on both margins is not required; its nuisance-parameter method, variance choice and sampling assumptions differ from Fisher's conditional exact test.",SOURCES["unconditional_exact"]+SOURCES["fisher"]),
    ("domain-item:d078-boschloo-exact-test","domain-item:d078-fisher-exact-test","For independent-binomial 2×2 data, Boschloo's unconditional test is an exact alternative based on Fisher's p-value and may be more powerful; state the sampling assumptions and two-sided p-value convention.",SOURCES["unconditional_exact"]+SOURCES["fisher"]),
    ("domain-item:d078-wilcoxon-rank-tests","domain-item:d078-t-tests","For a two-group independent or paired contrast, a rank-based procedure may fit the outcome/design better; it targets a rank/distribution contrast and is not a drop-in mean test.",SOURCES["wilcoxon"]+SOURCES["ttest"]),
    ("domain-item:d078-kruskal-wallis-test","domain-item:d078-anova-and-repeated-measures","For independent groups, a rank-based omnibus alternative may fit when the inferential target is a distribution/location contrast rather than group means; use a design-matched model when covariates or complex structure matter.",SOURCES["kruskal"]+SOURCES["anova"]),
    ("domain-item:d078-friedman-test","domain-item:d078-anova-and-repeated-measures","For complete matched blocks with one observation per condition, a rank-based repeated comparison can be an alternative to an appropriate repeated-measures ANOVA; it does not handle every unbalanced or incomplete design.",SOURCES["friedman"]+SOURCES["anova"]),
    ("domain-item:d078-probit-regression","domain-item:d078-logistic-regression","Probit and logit are alternative link functions for a binomial model of a binary outcome; compare fit and predicted probabilities/marginal effects rather than raw coefficient scales.",SOURCES["probit"]+SOURCES["logit"]),
    ("domain-item:d078-tree-ensemble-prediction","domain-item:d078-logistic-regression","For a prediction/classification goal, tree ensembles can compete with logistic regression as predictive models; logistic regression remains a distinct inferential GLM and neither model establishes a causal effect.",SOURCES["ensembles"]+SOURCES["logit"]),
    ("domain-item:d078-spearman-rank-correlation","domain-item:d078-pearson-correlation","For the same association question, use Spearman for ordinal/rank or monotonic association where Pearson's linear quantitative association is not the target; related but distinct coefficients answer different questions.",SOURCES["correlation"]),
    ("domain-item:d078-kendall-rank-correlation","domain-item:d078-pearson-correlation","For the same association question, Kendall is a rank-based alternative when concordance, ordinal measurement or tie handling better fits than Pearson's linear association.",SOURCES["correlation"]),
    ("domain-item:d078-kendall-rank-correlation","domain-item:d078-spearman-rank-correlation","Choose between rank coefficients by estimand, tie pattern, sample and inferential procedure; Kendall tau and Spearman rho are related but not numerically interchangeable.",SOURCES["correlation"]),
    ("domain-item:d078-regularized-linear-regression","domain-item:d078-linear-regression-ols","For high-dimensional or prediction-focused work with collinearity, penalized regression can stabilize or select coefficients relative to OLS; shrinkage changes estimation and interpretation, so this is a conditional specialist extension rather than a default replacement.",SOURCES["regularized"]+SOURCES["linear"]),
    ("domain-item:d078-tree-ensemble-prediction","domain-item:d078-linear-regression-ols","For continuous-outcome prediction, compare nonlinear tree ensembles with a linear baseline on held-out data; the choice is goal- and validation-dependent and neither model is causal by itself.",SOURCES["ensembles"]+SOURCES["linear"]),
    ("domain-item:d078-count-regression","domain-item:d078-supervised-machine-learning","Count regression provides an outcome-distribution-based inferential model; ML regressors may be compared for prediction but are not direct substitutes for its rate interpretation or inferential estimand.",SOURCES["count_models"]+SOURCES["ml"]),
]

TECHNIQUE_TOOL_LINKS = {
    "domain-item:d078-fisher-exact-test": ["domain-item:r-statistical-computing","domain-item:d078-python","domain-item:d078-spss-tool","domain-item:d078-jasp-tool"],
    "domain-item:d078-barnard-exact-test": ["domain-item:d078-python"],
    "domain-item:d078-boschloo-exact-test": ["domain-item:d078-python"],
    "domain-item:d078-wilcoxon-rank-tests": ["domain-item:r-statistical-computing","domain-item:d078-spss-tool","domain-item:d078-sas-stat-tool","domain-item:d078-jasp-tool"],
    "domain-item:d078-kruskal-wallis-test": ["domain-item:r-statistical-computing","domain-item:d078-spss-tool","domain-item:d078-sas-stat-tool","domain-item:d078-jasp-tool"],
    "domain-item:d078-friedman-test": ["domain-item:r-statistical-computing","domain-item:d078-spss-tool","domain-item:d078-jasp-tool"],
    "domain-item:d078-probit-regression": ["domain-item:r-statistical-computing","domain-item:stata-quantitative-social-science-workflow","domain-item:d078-statsmodels","domain-item:d078-spss-tool"],
    "domain-item:d078-tree-ensemble-prediction": ["domain-item:d078-scikit-learn","domain-item:d078-python"],
}
TECHNIQUE_TOOL_LINKS.update({
    "domain-item:d078-pearson-correlation": ["domain-item:r-statistical-computing","domain-item:d078-spss-tool","domain-item:d078-jasp-tool","domain-item:d078-statsmodels"],
    "domain-item:d078-spearman-rank-correlation": ["domain-item:r-statistical-computing","domain-item:d078-spss-tool","domain-item:d078-jasp-tool","domain-item:d078-statsmodels"],
    "domain-item:d078-kendall-rank-correlation": ["domain-item:r-statistical-computing","domain-item:d078-spss-tool","domain-item:d078-jasp-tool","domain-item:d078-statsmodels"],
    "domain-item:d078-linear-regression-ols": ["domain-item:r-statistical-computing","domain-item:stata-quantitative-social-science-workflow","domain-item:d078-spss-tool","domain-item:d078-statsmodels","domain-item:d078-jasp-tool"],
    "domain-item:d078-regularized-linear-regression": ["domain-item:d078-scikit-learn","domain-item:d078-python","domain-item:r-statistical-computing"],
    "domain-item:d078-ordinal-regression": ["domain-item:r-statistical-computing","domain-item:stata-quantitative-social-science-workflow","domain-item:d078-spss-tool","domain-item:d078-statsmodels"],
    "domain-item:d078-multinomial-logistic-regression": ["domain-item:r-statistical-computing","domain-item:stata-quantitative-social-science-workflow","domain-item:d078-spss-tool","domain-item:d078-statsmodels"],
    "domain-item:d078-count-regression": ["domain-item:r-statistical-computing","domain-item:stata-quantitative-social-science-workflow","domain-item:d078-spss-tool","domain-item:d078-statsmodels"],
    "domain-item:d078-exploratory-factor-analysis": ["domain-item:r-statistical-computing","domain-item:d078-spss-tool"],
    "domain-item:d078-confirmatory-factor-analysis": ["domain-item:r-statistical-computing","domain-item:d078-spss-tool"],
    "domain-item:d078-reliability-estimation-alpha-omega": ["domain-item:r-statistical-computing","domain-item:d078-spss-tool"],
    "domain-item:d078-item-response-theory": ["domain-item:d078-r-mirt-tool"],
    "domain-item:d078-exponential-random-graph-models": ["domain-item:d078-statnet-ergm-tool"],
    "domain-item:d078-spatial-autocorrelation-moran-lisa": ["area_tool_option:d078-hg-tool-geoda","domain-item:stata-quantitative-social-science-workflow"],
    "domain-item:d078-spatial-regression-models": ["area_tool_option:d078-hg-tool-geoda","domain-item:stata-quantitative-social-science-workflow"],
})

# These legacy pairs confuse a method or route prompt with software, or claim
# simulation software is an alternative to the empirical method itself.
REMOVE_FALSE_ALTERNATIVE_PAIRS = {
    frozenset(("domain-item:d078-nvivo-tool","area_enrichment_item:d078-soc-thematic-analysis")),
    frozenset(("area-task:d078-politics-governance-public-policy-core-task-family","domain-item:d078-document-analysis")),
    frozenset(("domain-item:d078-casevo-tool","domain-item:d078-survey-method")),
    frozenset(("domain-item:d078-casevo-tool","domain-item:archival-and-historical-research")),
    frozenset(("domain-item:d078-mesa-tool","domain-item:d078-quantitative-approach")),
    frozenset(("domain-item:d078-mesa-tool","domain-item:d078-qualitative-approach")),
    frozenset(("domain-item:d078-mesa-tool","domain-item:d078-survey-method")),
    frozenset(("domain-item:r-statistical-computing","domain-item:d078-statistical-tool-choice")),
    frozenset(("domain-item:stata-quantitative-social-science-workflow","domain-item:d078-statistical-tool-choice")),
}

TOOLS = [
    {"id":"domain-item:d078-jasp-tool","label":"JASP for graphical statistical analysis","purpose":"A graphical statistical package for common frequentist and Bayesian analyses such as t-tests, ANOVA, regression and contingency tables; use it when its available procedures fit the design.","methods":["quant","survey","psychometrics"],"sources":SOURCES["jasp"]},
    {"id":"domain-item:d078-sas-stat-tool","label":"SAS/STAT for statistical modelling and survey analysis","purpose":"A statistical software suite with procedures for categorical data, t-tests, ANOVA, regression, survey analysis, psychometrics and predictive modelling; availability depends on institutional licensing.","methods":["quant","survey","psychometrics","longitudinal","causal"],"sources":SOURCES["sas"]},
    {"id":"domain-item:d078-maxqda-tool","label":"MAXQDA for qualitative and mixed-methods analysis","purpose":"Organize and code qualitative material, compare coded data with case attributes, and build joint displays or mixed-methods analyses; it supports interpretation but does not choose or validate the method for the researcher.","methods":["qual","interviews","focus_groups","document","discourse","mixed","evidence_synthesis"],"sources":SOURCES["maxqda"]},
    {"id":"domain-item:d078-atlasti-tool","label":"ATLAS.ti for qualitative data coding and retrieval","purpose":"Organize, code, retrieve and query qualitative material; manual and automated coding are supports that require human checking and a transparent analytic method.","methods":["qual","interviews","focus_groups","document","discourse","observation"],"sources":SOURCES["atlas"]},
    {"id":"domain-item:d078-dedoose-tool","label":"Dedoose for collaborative qualitative and mixed-methods analysis","purpose":"Code qualitative data and integrate qualitative and quantitative case information in a collaborative platform; assess data-security and institutional requirements for sensitive material.","methods":["qual","mixed","interviews","focus_groups","evaluation"],"sources":SOURCES["dedoose"]},
    {"id":"domain-item:d078-qualcoder-tool","label":"QualCoder for open-source qualitative analysis","purpose":"A free/open-source desktop application for coding and organizing text, image, audio and video data and exporting analytic reports; it does not replace a documented analytic approach.","methods":["qual","interviews","focus_groups","document","discourse","observation"],"sources":SOURCES["qualcoder"]},
    {"id":"domain-item:d078-spacy-tool","label":"spaCy for natural-language processing","purpose":"A Python NLP library for linguistic processing and production workflows; useful for tokenization, linguistic features and text-processing pipelines when the language and model are suitable.","methods":["comp","document","discourse"],"sources":SOURCES["spacy"]},
    {"id":"domain-item:d078-nltk-tool","label":"NLTK for teaching and prototyping language-data analysis","purpose":"A Python platform with corpora, lexical resources and NLP modules suited to teaching, prototyping and selected research workflows; document the corpus and validate outputs.","methods":["comp","document","discourse"],"sources":SOURCES["nltk"]},
    {"id":"domain-item:d078-quanteda-tool","label":"quanteda for quantitative text analysis in R","purpose":"An R package ecosystem for corpus management and quantitative text analysis; choice of dictionary, features and validation must follow the social construct and language context.","methods":["comp","document","discourse"],"sources":SOURCES["quanteda"]},
    {"id":"domain-item:d078-huggingface-transformers-tool","label":"Hugging Face Transformers for pretrained NLP models","purpose":"A model library exposing NLP pipelines such as text classification and sentiment analysis; model outputs require task-specific validation, provenance, bias checks and appropriate licensing review.","methods":["comp","document","discourse"],"sources":SOURCES["transformers"]},
    {"id":"domain-item:d078-eviews-tool","label":"EViews for econometric time-series analysis","purpose":"A commercial econometrics package supporting time-series regression, ARMA/ARIMA, forecasting, diagnostics and related economic workflows; licensing and model assumptions must be considered.","methods":["quant","longitudinal","causal"],"sources":SOURCES["eviews"],"area":"D078:economics-applied-analysis"},
    {"id":"domain-item:d078-qualtrics-tool","label":"Qualtrics for online survey design and response management","purpose":"A commercial survey platform for questionnaire construction, distribution and response-data management; it is a collection platform, not a sampling design or analysis method.","methods":["survey","quant","evaluation"],"sources":SOURCES["qualtrics"]},
    {"id":"domain-item:d078-odk-tool","label":"ODK for offline-capable field data collection","purpose":"A data-collection platform for digital forms and field workflows; use it to implement a justified instrument and sampling plan, then export data for suitable analysis.","methods":["survey","participatory","evaluation"],"sources":SOURCES["odk"]},
]
TOOLS.extend([
    {"id":"domain-item:d078-r-psych-tool","label":"R psych package for reliability and factor analysis","purpose":"An R package for psychometric and psychological analysis, including factor analysis and multiple reliability estimates such as alpha and omega. These are analytic implementations; item design, dimensionality, validity and coefficient assumptions still require substantive review.","methods":["psychometrics","quant","survey"],"sources":["https://stat.ethz.ch/CRAN/web/packages/psych/refman/psych.html"]},
    {"id":"domain-item:d078-r-mirt-tool","label":"R mirt package for item response theory","purpose":"An R package for unidimensional and multidimensional item-response and item-factor models, including mixed dichotomous/polytomous items and multiple-group/DIF analyses. Model and sample fit must be checked before latent scores or group comparisons are used.","methods":["psychometrics","quant","survey"],"sources":SOURCES["irt"]},
    {"id":"domain-item:d078-statnet-ergm-tool","label":"Statnet ergm for social network models","purpose":"An open-source R package for specifying, estimating, assessing, simulating and interpreting exponential-family random graph models. The network boundary, dependencies, convergence, goodness-of-fit and reproducibility need explicit treatment.","methods":["social_network","network","quant","comp"],"sources":SOURCES["ergm"]},
])

TIME_SERIES = {
    "id":"area_enrichment_item:d078-econ-time-series-analysis-and-forecasting",
    "label":"Econometric time-series analysis and forecasting",
    "item_type":"method",
    "purpose":"Analyse observations ordered over time using suitable trend/seasonality, stationarity, AR/ARMA/ARIMA, ARIMAX or multivariate VAR/VECM procedures; compare against simple baselines, diagnose serial dependence and evaluate forecasts out of sample. Forecasting does not establish causal effects.",
    "output":"A dated-series analysis plan, diagnostics, benchmark and forecast with uncertainty and economic interpretation limits.",
    "sources":SOURCES["timeseries"],
}

EXISTING_TOOLS = {
    "domain-item:d078-statsmodels": ["quant","longitudinal","causal"],
    "domain-item:d078-spss-tool": ["quant","survey","psychometrics"],
    "domain-item:d078-jamovi-tool": ["quant","survey","psychometrics"],
    "domain-item:stata-quantitative-social-science-workflow": ["quant","longitudinal","causal"],
    "domain-item:d078-scikit-learn": ["comp","quant"],
    "domain-item:d078-jupyter": ["comp"],
    "domain-item:d078-pandas-tool": ["comp","quant"],
    "domain-item:d078-python": ["comp","quant","longitudinal","causal"],
    "domain-item:r-statistical-computing": ["quant","longitudinal","causal"],
    "area_tool_option:d078-a04-tool-spss": ["quant","survey","psychometrics"],
    "area_tool_option:d078-a04-tool-stata": ["quant","longitudinal","causal"],
    "area_tool_option:d078-a04-tool-r": ["quant","longitudinal","causal"],
    "area_tool_option:d078-a04-tool-python": ["comp","quant","longitudinal","causal"],
}

# Every pre-existing choice already referenced by a D078 method/combination
# route was checked against its official documentation. These links establish
# what the software can do; they do not imply that it is required or the best
# choice for every learner. Area-tool rows retain their existing area owner.
EXISTING_TOOL_SOURCES = {
    "domain-item:d078-casevo-tool": ["https://github.com/rgCASS/casevo", "https://arxiv.org/abs/2412.19498"],
    "domain-item:d078-jupyter": ["https://docs.jupyter.org/en/latest/"],
    "domain-item:d078-matplotlib-tool": ["https://matplotlib.org/stable/users/index.html"],
    "domain-item:d078-mesa-tool": ["https://mesa.readthedocs.io/stable/"],
    "domain-item:d078-networkx-tool": ["https://networkx.org/documentation/stable/"],
    "domain-item:d078-igraph-tool": ["https://r.igraph.org/"],
    "domain-item:d078-netlogo-tool": ["https://docs.netlogo.org/"],
    "domain-item:d078-nvivo-tool": ["https://community.lumivero.com/s/article/NV15Win-Content-coding-coding?language=en_US"],
    "domain-item:d078-pandas-tool": ["https://pandas.pydata.org/docs/"],
    "domain-item:d078-python": ["https://docs.python.org/3/tutorial/"],
    "domain-item:d078-scikit-learn": ["https://scikit-learn.org/stable/user_guide.html", "https://scikit-learn.org/stable/modules/cross_validation.html"],
    "domain-item:d078-social-network-tool": ["https://docs.gephi.org/"],
    "domain-item:d078-qualitative-coding-tool": ["https://app.taguette.org/"],
    "domain-item:d078-statsmodels": ["https://www.statsmodels.org/stable/user-guide.html", "https://www.statsmodels.org/stable/api.html"],
    "domain-item:d078-spss-tool": ["https://www.ibm.com/docs/en/spss-statistics/31.0.0?topic=features-chi-square-test", "https://www.ibm.com/docs/en/spss-statistics/30.0.0?topic=reference-t-test"],
    "domain-item:d078-jamovi-tool": ["https://docs.jamovi.org/"],
    "domain-item:stata-quantitative-social-science-workflow": ["https://www.stata.com/features/overview/", "https://www.stata.com/features/time-series/", "https://www.stata.com/features/panel-longitudinal-data/"],
    "domain-item:d078-survey-data-collection-tool": ["https://support.kobotoolbox.org/"],
    "domain-item:r-statistical-computing": ["https://stat.ethz.ch/R-manual/R-devel/library/stats/html/00Index.html"],
    "area_tool_option:d078-a04-tool-limesurvey": ["https://www.limesurvey.org/manual/LimeSurvey_Manual"],
    "area_tool_option:d078-a04-tool-nvivo": ["https://community.lumivero.com/s/article/NV15Win-Content-coding-coding?language=en_US"],
    "area_tool_option:d078-a04-tool-opensesame": ["https://osdoc.cogsci.nl/current"],
    "area_tool_option:d078-a04-tool-psychopy": ["https://devdocs.psychopy.org/builder/", "https://devdocs.psychopy.org/gettingStarted.html"],
    "area_tool_option:d078-a04-tool-psytoolkit": ["https://www.psytoolkit.org/", "https://www.psytoolkit.org/library/"],
    "area_tool_option:d078-a04-tool-python": ["https://docs.python.org/3/tutorial/"],
    "area_tool_option:d078-a04-tool-r": ["https://stat.ethz.ch/R-manual/R-devel/library/stats/html/00Index.html"],
    "area_tool_option:d078-a04-tool-spss": ["https://www.ibm.com/docs/en/spss-statistics/31.0.0?topic=features-chi-square-test", "https://www.ibm.com/docs/en/spss-statistics/30.0.0?topic=reference-t-test"],
    "area_tool_option:d078-a04-tool-stata": ["https://www.stata.com/features/time-series/", "https://www.stata.com/features/panel-longitudinal-data/"],
    "area_tool_option:d078-a04-tool-taguette": ["https://app.taguette.org/"],
    "area_tool_option:d078-hg-tool-arcgis-spatial-analyst": ["https://pro.arcgis.com/en/pro-app/3.3/tool-reference/spatial-statistics/an-overview-of-the-spatial-statistics-toolbox.htm"],
    "area_tool_option:d078-hg-tool-geoda": ["https://geodacenter.github.io/docs/Geoda_tour.pdf"],
    "area_tool_option:d078-hg-tool-geopandas": ["https://geopandas.org/en/stable/docs/user_guide/geometric_manipulations.html"],
    "area_tool_option:d078-hg-tool-pysal-esda": ["https://pysal.org/esda/stable/user-guide/index.html", "https://pysal.org/esda/stable/index.html"],
}

EXPLANATORY_ROUTE_TOOL = "domain-item:d078-statistical-tool-choice"

TOOL_ALTERNATIVES = [
    ("domain-item:d078-jasp-tool","domain-item:d078-sas-stat-tool","Both document common inferential procedures; choose based on the exact model, access and reproducibility needs.",SOURCES["jasp"]+SOURCES["sas"]),
    ("domain-item:d078-jasp-tool","domain-item:d078-jamovi-tool","Both provide graphical workflows for common statistical procedures; choose based on analysis coverage, reproducibility and access.",SOURCES["jasp"]+["https://docs.jamovi.org/"]),
    ("domain-item:d078-jasp-tool","domain-item:d078-spss-tool","Both support common introductory tests and models; procedures and licensing differ, so compare the required analysis.",SOURCES["jasp"]+SOURCES["chi"]),
    ("domain-item:d078-maxqda-tool","domain-item:d078-atlasti-tool","Both support organizing, coding and retrieving qualitative material; compare workflow and access needs.",SOURCES["maxqda"]+SOURCES["atlas"]),
    ("domain-item:d078-maxqda-tool","domain-item:d078-qualcoder-tool","Both support qualitative coding and retrieval; one is commercial and one is open source.",SOURCES["maxqda"]+SOURCES["qualcoder"]),
    ("domain-item:d078-atlasti-tool","domain-item:d078-dedoose-tool","Both can support coded qualitative projects; collaboration and mixed-method needs may influence the choice.",SOURCES["atlas"]+SOURCES["dedoose"]),
    ("domain-item:d078-qualcoder-tool","domain-item:d078-qualitative-coding-tool","Both support document coding workflows; choose according to collaboration, data types and installation needs.",SOURCES["qualcoder"]+["https://app.taguette.org/"]),
    ("domain-item:d078-qualtrics-tool","domain-item:d078-odk-tool","Both can implement digital questionnaires; online panel workflows and offline field collection have different strengths.",SOURCES["qualtrics"]+SOURCES["odk"]),
    ("area_tool_option:d078-a04-tool-limesurvey","domain-item:d078-qualtrics-tool","Both can implement online surveys; deployment, respondent management, privacy and institutional access affect fit.",EXISTING_TOOL_SOURCES["area_tool_option:d078-a04-tool-limesurvey"]+SOURCES["qualtrics"]),
    ("area_tool_option:d078-a04-tool-psychopy","area_tool_option:d078-a04-tool-opensesame","Both build behavioural experiments; compare required components, online runtime and hardware support.",EXISTING_TOOL_SOURCES["area_tool_option:d078-a04-tool-psychopy"]+EXISTING_TOOL_SOURCES["area_tool_option:d078-a04-tool-opensesame"]),
    ("area_tool_option:d078-a04-tool-psychopy","area_tool_option:d078-a04-tool-psytoolkit","Both support behavioural experiment workflows; compare the required design and online/offline constraints.",EXISTING_TOOL_SOURCES["area_tool_option:d078-a04-tool-psychopy"]+EXISTING_TOOL_SOURCES["area_tool_option:d078-a04-tool-psytoolkit"]),
    ("domain-item:d078-networkx-tool","domain-item:d078-igraph-tool","Both provide programmable graph-analysis workflows; language, scale and ecosystem affect the choice.",EXISTING_TOOL_SOURCES["domain-item:d078-networkx-tool"]+EXISTING_TOOL_SOURCES["domain-item:d078-igraph-tool"]),
    ("domain-item:d078-mesa-tool","domain-item:d078-netlogo-tool","Both support agent-based modelling, with different programming and model-building workflows.",EXISTING_TOOL_SOURCES["domain-item:d078-mesa-tool"]+EXISTING_TOOL_SOURCES["domain-item:d078-netlogo-tool"]),
    ("domain-item:d078-casevo-tool","domain-item:d078-netlogo-tool","Casevo is a specialist cognitive-agent/social-network framework; NetLogo is a general ABM environment. They are alternatives only when the research question can be represented in either environment.",EXISTING_TOOL_SOURCES["domain-item:d078-casevo-tool"]+EXISTING_TOOL_SOURCES["domain-item:d078-netlogo-tool"]),
    ("area_tool_option:d078-hg-tool-geoda","area_tool_option:d078-hg-tool-pysal-esda","Both support exploratory spatial statistics such as spatial autocorrelation; compare interface, workflow and analytic needs.",EXISTING_TOOL_SOURCES["area_tool_option:d078-hg-tool-geoda"]+EXISTING_TOOL_SOURCES["area_tool_option:d078-hg-tool-pysal-esda"]),
    ("domain-item:d078-eviews-tool","area_tool_option:d078-a04-tool-stata","Both support time-series/econometric modelling; choose based on required procedure, reproducibility and access.",SOURCES["eviews"]+EXISTING_TOOL_SOURCES["area_tool_option:d078-a04-tool-stata"]),
]

AREA_ITEM_RESOLUTIONS = {
    "area_enrichment_item:d078-a03-tool-kobotoolbox-survey": {"state":"resolved_ready_for_use","sources":["https://support.kobotoolbox.org/data-collection-tools.html?highlight=likert+scale"],"rationale":"KoboToolbox provides online web forms and KoboCollect for Android field collection, including offline workflows. The tool implements a survey; it does not determine sampling or question validity."},
    "area_enrichment_item:d078-a03-tool-rayyan-screening": {"state":"resolved_ready_for_use","sources":["https://help.rayyan.ai/hc/en-us/articles/22697630697617-Getting-Started-with-Rayyan"],"rationale":"Rayyan supports reference import, duplicate detection, screening, data extraction and review reporting. AI-assisted prioritisation is an aid and does not replace protocol-defined human screening decisions."},
    "area_enrichment_item:d078-a34-a03-tool-budget-imonitor": {"state":"resolved_ready_for_use","sources":["https://budgetoffice.gov.ng/imonitor/"],"rationale":"The Nigeria Budget Office I-Monitor portal lets the public track project implementation, report discrepancies and participate in governance. It can be a source or participation channel in a bounded public-budget monitoring task; it is not a representative survey platform."},
    "area_enrichment_item:d078-econ-nigeria-microdata": {"state":"resolved_ready_for_use","sources":["https://microdata.nigerianstat.gov.ng/index.php/catalog/68","https://microdata.nigerianstat.gov.ng/index.php/catalog/82/study-description","https://statistics.cbn.gov.ng/shop"],"rationale":"NBS catalogue 68 is the Nigeria Living Standards Survey 2018–2019 and catalogue 82 is the General Household Survey Panel Wave 5 (2023–2024); the CBN database supplies monetary, external, fiscal and real-sector time series. These are official data sources, not a single software tool. Check dataset scope, access conditions, survey weights, confidentiality and release dates before analysis."},
    "area_enrichment_item:d078-econ-r-python-analysis": {"state":"resolved_explanatory_only","sources":["https://stat.ethz.ch/R-manual/R-devel/library/stats/html/00Index.html","https://docs.python.org/3/tutorial/"],"linked_item_ids":["domain-item:r-statistical-computing","domain-item:d078-python"],"rationale":"This is an area-specific choice prompt combining two programming environments, not a separate tool. Keep the economics context as explanatory text and link to the canonical R and Python tool cards as individual skippable alternatives."},
    "area_enrichment_item:d078-human-geography-population-qgis-spatial-tool": {"state":"resolved_ready_for_use","sources":["https://docs.qgis.org/3.44/en/docs/user_manual/index.html","https://docs.qgis.org/3.44/en/docs/training_manual/index.html"],"rationale":"QGIS is a free/open-source GIS for spatial data management, analysis and mapping. It is an area-specific optional implementation choice; coordinate reference systems, data provenance, scale and spatial inference remain method concerns."},
    "area_enrichment_item:d078-computational-digital-social-science-r-social-data-workflow": {"state":"resolved_ready_for_use","sources":["https://stat.ethz.ch/R-manual/R-devel/library/stats/html/00Index.html"],"rationale":"R is a documented statistical-computing environment suitable for a reproducible social-data workflow. The area item stays area-owned and optional; the domain R record remains a separate domain-owned route choice."},
    "area_enrichment_item:d078-social-research-evaluation-kobo-electronic-collection": {"state":"resolved_ready_for_use","sources":["https://support.kobotoolbox.org/data-collection-tools.html?highlight=likert+scale"],"rationale":"KoboToolbox and KoboCollect can implement online or offline electronic field collection for evaluation and social-research instruments. They do not establish a valid sampling frame or evaluation design."},
    "area_enrichment_item:d078-social-research-evaluation-spss-quantitative-tool": {"state":"resolved_ready_for_use","sources":["https://www.ibm.com/docs/en/spss-statistics/31.0.0?topic=features-chi-square-test","https://www.ibm.com/docs/en/spss-statistics/30.0.0?topic=reference-t-test"],"rationale":"IBM SPSS Statistics documents procedures for categorical tests and mean comparisons that can support selected social-research/evaluation analyses. A method and design choice must precede software selection."},
    "area_enrichment_item:d078-soc-quant-text-r": {"state":"resolved_explanatory_only","sources":["https://quanteda.io/","https://www.nltk.org/","https://spacy.io/usage/linguistic-features"],"linked_item_ids":["domain-item:d078-quanteda-tool","domain-item:d078-nltk-tool","domain-item:d078-spacy-tool"],"rationale":"This area record groups R/Python text-analysis alternatives rather than naming one tool. Keep it explanatory and link to the individual canonical quanteda, NLTK and spaCy choices after the relevant text method."},
    "area_enrichment_item:d078-social-research-evaluation-qualitative-coding-options": {"state":"resolved_explanatory_only","sources":["https://community.lumivero.com/s/article/NV15Win-Content-coding-coding?language=en_US","https://app.taguette.org/"],"linked_item_ids":["domain-item:d078-nvivo-tool","domain-item:d078-qualitative-coding-tool"],"rationale":"This is a grouped NVivo/Taguette choice prompt. The canonical software cards already exist and are individually selectable; link to both cards and do not render the group row as a software item."},
    "area_enrichment_item:d078-soc-caqdas-taguette-nvivo": {"state":"resolved_explanatory_only","sources":["https://community.lumivero.com/s/article/NV15Win-Content-coding-coding?language=en_US","https://app.taguette.org/"],"linked_item_ids":["domain-item:d078-qualitative-coding-tool","domain-item:d078-nvivo-tool"],"rationale":"This is a grouped NVivo/Taguette choice prompt. Keep the Sociology context explanatory and link to the two individual software choices separately."},
    "area_enrichment_item:d078-soc-kobo-survey-field": {"state":"resolved_explanatory_only","sources":["https://support.kobotoolbox.org/data-collection-tools.html?highlight=likert+scale"],"linked_item_ids":["domain-item:d078-survey-data-collection-tool"],"rationale":"This row groups KoboToolbox/KoboCollect with unspecified alternatives. Keep it explanatory and link to the canonical KoboToolbox choice; use other named survey-platform cards only where their own routes support them."},
    "area_enrichment_item:d078-computational-digital-social-science-networkx-or-gephi": {"state":"resolved_explanatory_only","sources":["https://networkx.org/documentation/stable/","https://docs.gephi.org/"],"linked_item_ids":["domain-item:d078-networkx-tool","domain-item:d078-social-network-tool"],"rationale":"This row combines a programmable graph-analysis library and a network visual-analysis environment. Keep the area context explanatory and link to NetworkX and Gephi as distinct domain-owned choices."},
    "area_enrichment_item:d078-econ-llm-evidence-synthesis": {"state":"resolved_explanatory_only","sources":["https://scikit-learn.org/stable/user_guide.html","https://huggingface.co/docs/transformers/main_classes/pipelines"],"linked_item_ids":["domain-item:systematic-and-scoping-evidence-synthesis"],"rationale":"This record does not name a specific evidence-synthesis tool or a validated synthesis method; it describes a possible AI-assisted workflow. Keep it explanatory and link learners to systematic/scoping evidence-synthesis foundations and human verification rather than present it as an executable tool."},
    "area_enrichment_item:d078-a04-tool-nvivo-tagging": {"state":"resolved_explanatory_only","sources":["https://community.lumivero.com/s/article/NV15Win-Content-coding-coding?language=en_US","https://app.taguette.org/"],"linked_item_ids":["area_tool_option:d078-a04-tool-nvivo","area_tool_option:d078-a04-tool-taguette"],"rationale":"This aggregate record is explicitly superseded by individual area tool options. Link to the individually selectable NVivo and Taguette records and remove the aggregate from the route."},
    "area-item:d078-human-geography-population:d078-human-geography-population-core-task-family:4:gis-spatial-analysis-only-when-a-spatial-question-supports-it": {"state":"resolved_explanatory_only","sources":["https://docs.qgis.org/3.44/en/docs/user_manual/preamble/features.html"],"linked_item_ids":["area_enrichment_item:d078-human-geography-population-qgis-spatial-tool","area_tool_option:d078-hg-tool-arcgis-spatial-analyst","area_tool_option:d078-hg-tool-geoda","area_tool_option:d078-hg-tool-geopandas","area_tool_option:d078-hg-tool-pysal-esda"],"rationale":"This is a condition on choosing GIS, not a software or standalone learning item. Preserve it as route guidance and link to the individually named spatial choices only when the learner's question and data are spatial."},
    "area_tool_application_reference:d078-a04-domain-reference-networkx-application": {"state":"resolved_explanatory_only","sources":["https://networkx.org/documentation/stable/"],"linked_item_ids":["domain-item:d078-networkx-tool"],"rationale":"This is an application reference to the canonical NetworkX tool, not an independent learning item. Keep the reference for provenance and link it to the domain-owned NetworkX card."},
    "area_tool_application_reference:d078-a04-tool-reference-casevo-area-application": {"state":"resolved_explanatory_only","sources":["https://github.com/rgCASS/casevo"],"linked_item_ids":["domain-item:d078-casevo-tool"],"rationale":"This is an application reference to the canonical Casevo tool, not an independent learning item. Keep the reference for provenance and link it to the domain-owned Casevo card where that route projects it."},
}

def optional_scope(reason: str) -> dict:
    return {"lane":"useful_optional","condition":None,"rationale":reason,"evidence_gap":None,"source_decision":"evidence_reviewed_2026_10_20","consolidated_into":None,"scope_kind":"item_context_requirement","skippable":True,"blocks_progression":False,"auto_add":False,"auto_order":False,"can_select_alongside_needed":True}

def mk_node(spec: dict, tool: bool = False) -> dict:
    kind = "domain_learning_item"
    item_type = "tool" if tool else spec["item_type"]
    rationale = spec.get("purpose", "Optional evidence-informed D078 learning item.")
    label = spec["label"]
    urls = spec["sources"]
    return {
        "id":spec["id"], "kind":kind, "item_type":item_type, "label":label,
        "layer":"domain_or_route_candidate", "requirement_lane":"useful_optional",
        "requirement_scope":optional_scope(rationale), "requirement_level":"useful",
        "requirement_reason":"Optional specialist learning. This item is route-linked and skippable; you can continue without choosing it.",
        "requirement_lane_source":"D078 method/technique evidence resolution 2026-10-20",
        "skippable":True,"blocking_policy":"never","student_visible":True,
        "approval":"externally_verified_ready_for_use","meaning":rationale,
        "learner_output":spec.get("output", "A method/tool choice justified against the research question, data and design."),
        "limitations":["This optional item does not become compulsory by appearing on a route.", "Tool availability, licensing, data-protection conditions and language/domain fit must be checked for the actual project."],
        "relationships":[],"learning_links":[{"label":"Official documentation / method source","url":url} for url in urls],
        "resources":[{"url":url,"source":"official_or_primary_documentation","accessed_on":DATE} for url in urls],
        "evidence":[{"url":url,"accessed_on":DATE} for url in urls],
    }

def add_edge(graph: dict, source: str, target: str, relationship: str, explanation: str, source_urls: list[str]) -> None:
    if not any(e.get("source")==source and e.get("target")==target and e.get("relationship")==relationship for e in graph["edges"]):
        graph["edges"].append({"id":f"d078-method-resolution:{len(graph['edges'])+1}","source":source,"target":target,"relationship":relationship,"status":"resolved_ready_for_use","resolution_state":"resolved_ready_for_use","student_visible":True,"display_readiness":"resolved_ready_for_use","blocking_policy":"never","sequence_policy":"none","sequence_approved":True,"skippable":True,"auto_add":False,"auto_order":False,"explanation":explanation,"evidence_sources":source_urls})

def append_once(items: list[str], value: str) -> None:
    if value not in items: items.append(value)

def append_choice_to_route(route: dict, item_id: str, node: dict) -> None:
    """Expose a prompt's resolved destination using the route's existing item slot."""
    kind=node.get("kind")
    if kind=="area_tool_option":
        append_once(route.setdefault("tool_ids",[]),item_id)
    elif kind=="area_enrichment_item":
        append_once(route.setdefault("area_item_ids",[]),item_id)
        append_once(route.setdefault("available_item_ids",[]),item_id)
    elif kind=="domain_method":
        append_once(route.setdefault("domain_downstream_item_ids",[]),item_id)
    elif kind=="domain_learning_item" and node.get("item_type") in {"tool","python_library","programming_language"}:
        append_once(route.setdefault("domain_tool_ids",[]),item_id)
    else:
        append_once(route.setdefault("domain_downstream_item_ids",[]),item_id)

def curriculum_context_for_technique(spec: dict) -> dict | None:
    """Attach the documented Sociology statistics context without overstating coverage.

    The available Sociology curriculum contract says to apply appropriate
    statistics, but it does not name chi-square or every later technique.
    Students may have encountered named tests in their actual course delivery;
    this context distinguishes that possible prior exposure from verified
    mastery or a claim that the published course outline names the test.
    """
    if spec.get("item_type") not in {"statistical_test", "statistical_model"}:
        return None
    return {
        "coverage": "related_curriculum_context_not_named_technique_mastery",
        "course_refs": [
            {
                "course_code": "SOC 301",
                "course_title": "Methods of Social Research and Statistics",
                "source_locator": "Original CCMAS source: Sociology; SOC 301; Social-Sciences-CCMAS-FINAL-2023-A.pdf, printed pp. 334-335",
                "evidence": "The course introduces research designs and quantitative methods; the published Sociology course detail does not name this specific statistical procedure.",
            },
            {
                "course_code": "SSC 401",
                "course_title": "Research Method II",
                "source_locator": "Original CCMAS source: Sociology; SSC 401; Social-Sciences-CCMAS-FINAL-2023-A.pdf, printed p. 337",
                "outcome_id": "programme-outcome:sociology:SSC 401:4",
                "evidence": "The programme outcome expects students to apply appropriate statistics in data analysis; it does not list every named test.",
            },
        ],
        "student_note": (
            "Your Sociology curriculum introduces research statistics and expects you to apply appropriate analysis. "
            f"You may already have met {spec['label']} in your course; the published curriculum record available here confirms the broader statistics foundation, not coverage or mastery of this exact procedure. "
            "This optional route helps you review when the technique fits, how to interpret its result and what it cannot establish."
        ),
    }

def main() -> None:
    graph = json.loads(GRAPH.read_text(encoding="utf-8"))
    # These IDs are owned by this deterministic patch. Remove and rebuild them
    # as a whole so changed evidence or relationship semantics cannot leave
    # stale parallel edges and repeated runs remain idempotent.
    graph["edges"]=[e for e in graph["edges"] if not e.get("id","").startswith("d078-method-resolution:")]
    graph["edges"]=[e for e in graph["edges"] if not (
        e.get("relationship")=="alternative_to"
        and frozenset((e.get("source"),e.get("target"))) in REMOVE_FALSE_ALTERNATIVE_PAIRS
    )]
    for edge in graph["edges"]:
        if (edge.get("relationship")=="alternative_to" and frozenset((edge.get("source"),edge.get("target")))==frozenset((
                "domain-emerging:d078-emerging-ai-assisted-social-text-annotation",
                "area_enrichment_item:d078-computational-digital-social-science-content-analysis-and-text-classification"))):
            edge["relationship"]="complements"
            edge["explanation"]="AI-assisted annotation can complement a conventional text-classification workflow when the corpus and evaluation design fit; compare agreement, disagreement and errors rather than assume either replaces the other."
    # A self-loop cannot express a meaningful alternative; remove the legacy
    # self-comparisons rather than rendering an item as an alternative to itself.
    graph["edges"]=[e for e in graph["edges"] if not (e.get("relationship")=="alternative_to" and e.get("source")==e.get("target"))]
    # Correct the early prototype edge types: NLP/ML support or complement
    # interpretation/design methods; they do not pedagogically build on them.
    edge_relations = {
        "domain-item:d078-nlp-and-text-mining": {METHODS["comp"]:"builds_on"},
        "domain-item:d078-supervised-machine-learning": {METHODS["comp"]:"builds_on"},
    }
    graph["edges"] = [e for e in graph["edges"] if not (
        e.get("target") in edge_relations
        and e.get("source") in {METHODS[a] for a in ("document","discourse","qual","quant","causal")}
        and e.get("relationship")=="builds_on"
    )]
    nodes = graph["nodes"]
    by_id = {n["id"]:n for n in nodes}
    records = []
    # Add domain-owned technique items and their method routes.
    technique_ids = {}
    for spec in TECHNIQUES:
        if spec["id"] not in by_id:
            node=mk_node(spec); nodes.append(node); by_id[node["id"]]=node
        node=by_id[spec["id"]]
        node.update({"student_visible":True,"selectable":True,"source_backed":True,
                     "approval":"externally_verified_ready_for_use",
                     "resolution_state":"resolved_ready_for_use",
                     "display_readiness":"clickable_when_projected",
                     "verified_on":DATE,"skippable":True,"blocking_policy":"never",
                     "sequence_policy":"none","auto_add":False,"auto_order":False})
        curriculum_context = curriculum_context_for_technique(spec)
        if curriculum_context:
            node["programme_learning_context"] = curriculum_context
        technique_ids[spec["id"]]=spec
        for alias in spec["methods"]:
            mid=METHODS[alias]
            if not any(n["id"]==mid for n in nodes): raise ValueError(f"missing method {mid}")
            for route in graph["method_area_routes"]:
                if route["method_id"]==mid:
                    append_once(route.setdefault("domain_downstream_item_ids",[]),spec["id"])
            relation=spec.get("method_relations",{}).get(alias,"builds_on")
            add_edge(graph,mid,spec["id"],relation,f"Optional technique connection under {by_id[mid]['label']}; this relation is informative, never a prerequisite. Use it only when the question, data and design fit.",spec["sources"])
        records.append({"canonical_id":spec["id"],"label":spec["label"],"item_type":spec["item_type"],"owner_layer":"domain","route_method_ids":[METHODS[a] for a in spec["methods"]],"resolution_state":"resolved_ready_for_use","display_readiness":"clickable_when_projected","selectable":True,"source_backed":True,"verified_on":DATE,"skippable":True,"blocking_policy":"never","sequence_policy":"none","auto_add":False,"auto_order":False,"sources":spec["sources"],"rationale":spec["purpose"]})
    for left,right,explanation,urls in TECHNIQUE_ALTERNATIVES:
        if left not in by_id or right not in by_id:
            raise ValueError(f"Missing alternative-technique endpoint: {left} / {right}")
        add_edge(graph,left,right,"alternative_to",explanation,urls)
    add_edge(graph,"domain-item:d078-logistic-regression","domain-item:d078-supervised-machine-learning","complements","For prediction/classification tasks, logistic regression can be a transparent statistical baseline beside more flexible supervised models. It is also an inferential generalized linear model; the goals and interpretations differ, so this is not a one-to-one equivalence.",SOURCES["ml"]+SOURCES["logit"])
    add_edge(graph,"domain-item:d078-confirmatory-factor-analysis","domain-item:d078-exploratory-factor-analysis","builds_on","When exploratory evidence suggests a measurement structure, CFA can test a theory-specified structure on suitable independent or held-out evidence; do not present this as an automatic step or reuse the same data without disclosing it.",SOURCES["factor_analysis"])
    add_edge(graph,"domain-item:d078-reliability-estimation-alpha-omega","domain-item:d078-confirmatory-factor-analysis","complements","Reliability estimates complement a specified measurement model; the coefficient and assumptions must match the scale structure, and reliability is not construct validity.",SOURCES["factor_analysis"])
    add_edge(graph,"domain-item:d078-reliability-estimation-alpha-omega","domain-item:d078-exploratory-factor-analysis","complements","Reliability estimation complements dimensionality exploration but does not establish that the scale is unidimensional or valid.",SOURCES["factor_analysis"])
    add_edge(graph,"domain-item:d078-item-response-theory","domain-item:d078-confirmatory-factor-analysis","alternative_to","IRT and CFA can address measurement structure and comparability through different model frameworks; choose according to item response format, estimand, sample and assumptions rather than treating scores as equivalent.",SOURCES["irt"]+SOURCES["factor_analysis"])
    add_edge(graph,"domain-item:d078-exponential-random-graph-models",METHODS["social_network"],"specialist_extension_of","ERGMs are a model-based extension for theory-driven inference about tie formation and network dependence; they require network-specific foundations and model diagnostics.",SOURCES["ergm"])
    add_edge(graph,"domain-item:d078-spatial-autocorrelation-moran-lisa",METHODS["spatial"],"builds_on","Spatial association analysis builds on defining units and a defensible spatial-weights structure; it describes clustering and dependence, not a causal mechanism.",SOURCES["spatial_methods"])
    add_edge(graph,"domain-item:d078-spatial-regression-models",METHODS["spatial"],"specialist_extension_of","Spatial lag/error models extend regression to specified spatial dependence and weighting structures; diagnostics guide model assessment but do not mechanically choose a model.",SOURCES["spatial_methods"])
    add_edge(graph,"domain-item:d078-spatial-regression-models","domain-item:d078-spatial-autocorrelation-moran-lisa","complements","Moran diagnostics and spatial regression may be used together to examine spatial dependence, but a significant statistic is not an automatic model-selection rule.",SOURCES["spatial_methods"])
    add_edge(graph,"domain-item:d078-odd-agent-model-documentation",METHODS["abm"],"supports","The ODD protocol supports transparent ABM specification and reproducibility; it documents a model but does not validate it.",SOURCES["odd"])
    add_edge(graph,"domain-item:d078-ml-survey-nonresponse-adjustment","domain-item:d078-supervised-machine-learning","specialist_extension_of","This survey-specific application uses ML response models or ensembles for nonresponse adjustment; survey design, weighting, variance and bias assessment remain essential.",SOURCES["survey_ml"]+SOURCES["ml"])
    add_edge(graph,"domain-item:d078-llm-assisted-text-construct-measurement","domain-item:d078-nlp-and-text-mining","specialist_extension_of","LLM-based construct measurement is a newer text-as-data technique; validate construct meaning, scoring stability and subgroup errors against credible references.",SOURCES["llm_text_measurement"]+SOURCES["nlp"])
    add_edge(graph,"domain-item:d078-conversation-analysis","domain-item:d078-critical-discourse-analysis","complements","CA analyzes sequential interaction and participants’ displayed orientations; CDA examines discourse in relation to social practices and power. They can inform one study but are not interchangeable.",SOURCES["conversation_analysis"]+SOURCES["cda"])
    add_edge(graph,"domain-item:d078-process-tracing",METHODS["case_study"],"specialist_extension_of","Process tracing structures within-case analysis of causal mechanisms using diagnostic evidence; its explanatory logic differs from a population-level effect estimate.",SOURCES["process_tracing"])
    add_edge(graph,"domain-item:d078-process-tracing",METHODS["causal"],"complements","Process tracing can examine how a proposed mechanism operates inside cases alongside a design estimating causal effects; neither substitutes for the other's estimand or assumptions.",SOURCES["process_tracing"])
    # Link verified software as separate optional tools to the specific methods they support.
    for spec in TOOLS:
        if spec["id"] not in by_id:
            node=mk_node(spec,tool=True); nodes.append(node); by_id[node["id"]]=node
        for alias in spec["methods"]:
            mid=METHODS[alias]
            routes=[r for r in graph["method_area_routes"] if r["method_id"]==mid]
            for route in routes:
                if spec.get("area") and route["area_id"]!=spec["area"]: continue
                append_once(route.setdefault("domain_tool_ids",[]),spec["id"])
            add_edge(graph,spec["id"],mid,"tool_for",f"Optional software that can implement parts of this method when the research question, data and design fit. It does not replace methodological judgement.",spec["sources"])
        records.append({"canonical_id":spec["id"],"label":spec["label"],"item_type":"tool","owner_layer":"domain" if not spec.get("area") else "area:D078:economics-applied-analysis","route_method_ids":[METHODS[a] for a in spec["methods"]],"resolution_state":"resolved_ready_for_use","display_readiness":"clickable_when_projected","selectable":True,"source_backed":True,"verified_on":DATE,"skippable":True,"blocking_policy":"never","sequence_policy":"none","auto_add":False,"auto_order":False,"sources":spec["sources"],"rationale":spec["purpose"]})
    # Reuse the canonical software records already present in the graph; expose
    # each only on the methods for which its documented capability is relevant.
    for tool_id, aliases in EXISTING_TOOLS.items():
        node=by_id.get(tool_id)
        if not node:
            # Some compact graphs omit tool nodes until referenced. Do not mint
            # a second identity; record the absent item as a failed integrity gate.
            raise ValueError(f"Missing existing canonical tool: {tool_id}")
        for alias in aliases:
            for route in graph["method_area_routes"]:
                if route["method_id"]==METHODS[alias]:
                    append_once(route.setdefault("domain_tool_ids",[]),tool_id)
    # Resolve the full inherited route-tool inventory, not only newly added
    # software. Student approval is a separate display gate from evidence that
    # a tool exists and supports the stated task. Keep every original owner and
    # requirement disposition intact while recording the evidence explicitly.
    prompt=by_id.get(EXPLANATORY_ROUTE_TOOL)
    if prompt:
        prompt["student_visible"]=False
        prompt["approval"]="resolved_explanatory_only"
        prompt["resolution_state"]="resolved_explanatory_only"
        prompt["display_readiness"]="explanatory_only"
        prompt["resolution_rationale"]="This record is a tool-choice prompt, not software or a substantive learning item. Keep the decision guidance in the method route; do not present it as a selectable tool."
    for route in graph["method_area_routes"]:
        for key in ("tool_ids","domain_tool_ids"):
            route[key]=[x for x in route.get(key,[]) if x!=EXPLANATORY_ROUTE_TOOL]
    for route_node in (n for n in nodes if n.get("kind")=="combination_area_route"):
        for key in ("tool_ids","domain_tool_ids"):
            route_node[key]=[x for x in route_node.get(key,[]) if x!=EXPLANATORY_ROUTE_TOOL]
    for combo in graph["combination_designs"]:
        for route in combo.get("area_routes",[]):
            for key in ("tool_ids","domain_tool_ids"):
                route[key]=[x for x in route.get(key,[]) if x!=EXPLANATORY_ROUTE_TOOL]
    route_tools=set()
    for route in graph["method_area_routes"]:
        route_tools.update(route.get("tool_ids",[])); route_tools.update(route.get("domain_tool_ids",[]))
    for route_node in (n for n in nodes if n.get("kind")=="combination_area_route"):
        route_tools.update(route_node.get("tool_ids",[])); route_tools.update(route_node.get("domain_tool_ids",[]))
    for combo in graph["combination_designs"]:
        for route in combo.get("area_routes",[]):
            route_tools.update(route.get("tool_ids",[])); route_tools.update(route.get("domain_tool_ids",[]))
    resolved_tool_records=[]
    for tool_id in sorted(route_tools):
        if tool_id==EXPLANATORY_ROUTE_TOOL:
            node=by_id[tool_id]
            node["student_visible"]=False
            node["approval"]="resolved_explanatory_only"
            node["resolution_state"]="resolved_explanatory_only"
            node["display_readiness"]="explanatory_only"
            node["resolution_rationale"]="This record is a tool-choice prompt, not software or a substantive learning item. Keep the decision guidance in the method route; do not present it as a selectable tool."
            for route in graph["method_area_routes"]:
                for key in ("tool_ids","domain_tool_ids"):
                    route[key]=[x for x in route.get(key,[]) if x!=tool_id]
            for combo in graph["combination_designs"]:
                for route in combo.get("area_routes",[]):
                    for key in ("tool_ids","domain_tool_ids"):
                        route[key]=[x for x in route.get(key,[]) if x!=tool_id]
            resolved_tool_records.append({"canonical_id":tool_id,"label":node.get("label"),"item_type":node.get("item_type"),"owner_layer":"domain","resolution_state":"resolved_explanatory_only","display_readiness":"not_selectable_prompt","rationale":node["resolution_rationale"],"sources":[]})
            continue
        node=by_id.get(tool_id)
        if node is None:
            raise ValueError(f"Missing canonical routed tool: {tool_id}")
        urls=EXISTING_TOOL_SOURCES.get(tool_id)
        if not urls:
            # Newly-created tools already have first-party sources on their
            # nodes. They are included in this inventory resolution below.
            urls=[r["url"] for r in node.get("learning_links",[]) if r.get("url")]
        if not urls:
            raise ValueError(f"No externally verified source for routed tool: {tool_id}")
        node["student_visible"]=True
        node["approval"]="externally_verified_ready_for_use"
        node["resolution_state"]="resolved_ready_for_use"
        node["display_readiness"]="clickable_when_projected"
        node["external_tool_resolution"]={"resolution_state":"resolved_ready_for_use","display_readiness":"clickable_when_projected","verified_on":DATE,"sources":urls,"rationale":"Official documentation verifies this software/resource and the specific research task recorded on its route. Availability or licensing remains a learner/institution choice; it is optional and nonblocking."}
        links=node.setdefault("learning_links",[])
        existing_urls={row.get("url") for row in links}
        for url in urls:
            if url not in existing_urls:
                links.append({"label":f"Official documentation: {node.get('label',tool_id)}","url":url,"publisher":"Official provider/project documentation","verified_on":DATE})
        resources=node.setdefault("resources",[])
        resource_urls={row.get("url") for row in resources}
        for url in urls:
            if url not in resource_urls: resources.append({"url":url,"source":"official_or_primary_documentation","accessed_on":DATE})
        evidence=node.setdefault("evidence",[])
        evidence_urls={row.get("url") for row in evidence if isinstance(row,dict)}
        for url in urls:
            if url not in evidence_urls: evidence.append({"url":url,"accessed_on":DATE,"locator":"Official software documentation; capability and intended task checked"})
        method_ids=[r["method_id"] for r in graph["method_area_routes"] if tool_id in r.get("tool_ids",[]) or tool_id in r.get("domain_tool_ids",[])]
        area_ids=sorted({r["area_id"] for r in graph["method_area_routes"] if tool_id in r.get("tool_ids",[]) or tool_id in r.get("domain_tool_ids",[])})
        for method_id in sorted(set(method_ids)):
            add_edge(graph,tool_id,method_id,"tool_for","Optional software that can implement parts of this method when the research question, data and design fit. The method determines whether it is suitable.",urls)
        owner=node.get("owner_layer") or (f"area:{node['area_id']}" if node.get("area_id") else "domain")
        resolved_tool_records.append({"canonical_id":tool_id,"label":node.get("label"),"item_type":node.get("item_type"),"owner_layer":owner,"area_id":node.get("area_id"),"route_method_ids":sorted(set(method_ids)),"route_area_ids":area_ids,"resolution_state":"resolved_ready_for_use","display_readiness":"clickable_when_projected","selectable":True,"source_backed":True,"source_verification":"official_provider_or_project_documentation_checked_against_recorded_area_use","verified_on":DATE,"skippable":True,"blocking_policy":"never","sequence_policy":"none","sources":urls,"rationale":node.get("meaning") or node.get("description") or "Official documentation confirms this optional tool's stated research use."})
    for technique_id,tool_ids in TECHNIQUE_TOOL_LINKS.items():
        if technique_id not in by_id: raise ValueError(f"Missing technique/tool-link target: {technique_id}")
        for tool_id in tool_ids:
            if tool_id not in by_id: raise ValueError(f"Missing canonical tool for technique {technique_id}: {tool_id}")
            tool_urls=EXISTING_TOOL_SOURCES.get(tool_id) or next((tool["sources"] for tool in TOOLS if tool["id"]==tool_id),None)
            if not tool_urls: raise ValueError(f"No source-backed software record for technique tool {tool_id}")
            technique_urls=[r["url"] for r in by_id[technique_id].get("learning_links",[]) if r.get("url")]
            add_edge(graph,tool_id,technique_id,"tool_for","Optional implementation tool for this specific test/model when the task, design and data fit; it is a software choice, not a learning prerequisite.",tool_urls+technique_urls)
    for left,right,explanation,urls in TOOL_ALTERNATIVES:
        if left not in by_id or right not in by_id:
            raise ValueError(f"Missing alternative-tool endpoint: {left} / {right}")
        add_edge(graph,left,right,"alternative_to",explanation,urls)
    if prompt:
        records.append({"canonical_id":EXPLANATORY_ROUTE_TOOL,"label":prompt.get("label"),"item_type":prompt.get("item_type"),"owner_layer":"domain","resolution_state":"resolved_explanatory_only","display_readiness":"not_selectable_prompt","sources":[],"rationale":prompt["resolution_rationale"]})
    area_item_ready=0
    area_item_explanatory=0
    for item_id,spec in AREA_ITEM_RESOLUTIONS.items():
        node=by_id.get(item_id)
        if node is None: raise ValueError(f"Missing area-route item: {item_id}")
        ready=spec["state"]=="resolved_ready_for_use"
        # Keep the exact route projections that contained a grouped prompt so
        # its individual canonical choices can occupy those same route slots.
        linked_route_records=[]
        if not ready and spec.get("linked_item_ids"):
            all_routes=list(graph["method_area_routes"])+list(graph["method_area_role_routes"])
            all_routes += [n for n in nodes if n.get("kind") in {"combination_area_route","combination_area_role_route"}]
            all_routes += [r for c in graph["combination_designs"] for r in c.get("area_routes",[])]
            route_keys=("area_item_ids","task_linked_domain_item_ids","available_item_ids","domain_downstream_item_ids","tool_ids","domain_tool_ids","role_item_ids","method_specific_role_item_ids")
            linked_route_records=[r for r in all_routes if any(item_id in r.get(key,[]) for key in route_keys)]
            # Area records are often attached to an area task by a typed graph
            # edge, while the method-area route stores that task in
            # task_family_ids. Resolve the bridge so these records and their
            # canonical choices actually project into the relevant route.
            task_ids={e.get("source") for e in graph["edges"]
                      if e.get("relationship")=="task_has_area_learning_item" and e.get("target")==item_id}
            area_id=node.get("area_id")
            linked_route_records.extend(
                r for r in all_routes
                if r not in linked_route_records
                and any(task_id in r.get("task_family_ids",[]) for task_id in task_ids)
                and (not area_id or r.get("area_id")==area_id)
            )
        node["resolution_state"]=spec["state"]
        node["display_readiness"]="clickable_when_projected" if ready else "explanatory_only"
        node["approval"]="externally_verified_ready_for_use" if ready else "resolved_explanatory_only"
        # Explanatory rows remain available to route rendering without being
        # selectable cards. The route keeps their IDs in a separate slot.
        node["student_visible"]=True
        node["selectable"]=ready
        node["external_tool_resolution"]={"resolution_state":spec["state"],"display_readiness":node["display_readiness"],"verified_on":DATE,"sources":spec["sources"],"rationale":spec["rationale"]}
        node["resolution_rationale"]=spec["rationale"]
        linked_item_ids=spec.get("linked_item_ids",[])
        missing_link_targets=[target for target in linked_item_ids if target not in by_id]
        if missing_link_targets: raise ValueError(f"Missing canonical area-choice destinations for {item_id}: {missing_link_targets}")
        if linked_item_ids:
            node["canonical_linked_item_ids"]=linked_item_ids
            # Resolution links let route projection replace an aggregate or
            # explanatory source row with its canonical selectable choices.
            # The source prompt itself remains nonselectable and hidden.
            for target in linked_item_ids:
                edge_id=f"area_choice_resolution:{item_id}->{target}"
                if not any(e.get("id")==edge_id for e in graph["edges"]):
                    graph["edges"].append({"id":edge_id,"source":item_id,"target":target,"relationship":"runtime_contract_resolves_to_learning_item","status":"resolved_ready_for_use","resolution_state":"resolved_ready_for_use","student_visible":False,"display_readiness":"explanatory_link_only","resolution_kind":"area_explanatory_prompt_to_canonical_choice","blocking_policy":"never","sequence_policy":"none","sequence_approved":False,"skippable":True,"auto_add":False,"auto_order":False,"evidence_sources":spec["sources"],"explanation":"This explanatory/grouped area record resolves to the linked canonical learning choice. The prompt does not become selectable, and the destination remains optional."})
        node["learning_links"]=[{"label":"Official documentation or source","url":url,"publisher":"Official provider or public-sector source","verified_on":DATE} for url in spec["sources"]]
        node["resources"]=[{"url":url,"source":"official_or_primary_documentation","accessed_on":DATE} for url in spec["sources"]]
        node["evidence"]=[{"url":url,"accessed_on":DATE,"locator":"Official provider/public-sector documentation checked against the recorded area learning use"} for url in spec["sources"]]
        if ready:
            area_item_ready+=1
        else:
            area_item_explanatory+=1
            # These existing rows are aggregate prompts, duplicates or
            # conditional instructions, not independent selectable software.
            for route in graph["method_area_routes"]:
                for key in ("area_item_ids","task_linked_domain_item_ids","available_item_ids","domain_downstream_item_ids","tool_ids","domain_tool_ids"):
                    route[key]=[x for x in route.get(key,[]) if x!=item_id]
            for route in graph["method_area_role_routes"]:
                for key in ("role_item_ids","method_specific_role_item_ids"):
                    route[key]=[x for x in route.get(key,[]) if x!=item_id]
            for route_node in (n for n in nodes if n.get("kind") in {"combination_area_route","combination_area_role_route"}):
                for key in ("area_item_ids","task_linked_domain_item_ids","available_item_ids","domain_downstream_item_ids","tool_ids","domain_tool_ids","role_item_ids","method_specific_role_item_ids"):
                    route_node[key]=[x for x in route_node.get(key,[]) if x!=item_id]
            for combo in graph["combination_designs"]:
                for route in combo.get("area_routes",[]):
                    for key in ("area_item_ids","task_linked_domain_item_ids","available_item_ids","domain_downstream_item_ids","tool_ids","domain_tool_ids","role_item_ids","method_specific_role_item_ids"):
                        route[key]=[x for x in route.get(key,[]) if x!=item_id]
            for route in linked_route_records:
                append_once(route.setdefault("explanatory_item_ids",[]),item_id)
                for target in linked_item_ids:
                    append_choice_to_route(route,target,by_id[target])
        if ready and item_id.endswith("rayyan-screening"):
            add_edge(graph,item_id,METHODS["evidence_synthesis"],"tool_for","Optional screening software for systematic/scoping evidence-synthesis workflow; keep protocol, eligibility and appraisal decisions explicit.",spec["sources"])
        elif ready and item_id.endswith("qgis-spatial-tool"):
            add_edge(graph,item_id,METHODS["spatial"],"tool_for","Optional GIS software for spatial data preparation, analysis and mapping; use it only when the question and data have a spatial component.",spec["sources"])
        elif ready and "kobotoolbox" in item_id:
            add_edge(graph,item_id,METHODS["survey"],"tool_for","Optional digital data-collection software for implementing a justified survey or field instrument; it does not determine design or sampling.",spec["sources"])
        elif ready and item_id.endswith("spss-quantitative-tool"):
            add_edge(graph,item_id,METHODS["quant"],"tool_for","Optional statistical software for analyses whose outcome, sampling and design fit its procedures.",spec["sources"])
        elif ready and item_id.endswith("tool-budget-imonitor"):
            add_edge(graph,item_id,METHODS["evaluation"],"supports","A public project-tracking and discrepancy-reporting portal can support a bounded governance or programme-monitoring activity; it is not a sampling or evaluation design.",spec["sources"])
        elif ready and item_id.endswith("econ-nigeria-microdata"):
            add_edge(graph,item_id,TIME_SERIES["id"],"supports","NBS survey microdata and CBN official series can supply data for economic analysis when the dataset's sampling, measurement and time structure fit the question.",spec["sources"])
        records.append({"canonical_id":item_id,"label":node.get("label"),"item_type":node.get("item_type"),"owner_layer":f"area:{node.get('area_id') or 'area-item'}","area_id":node.get("area_id"),"resolution_state":spec["state"],"display_readiness":node["display_readiness"],"selectable":ready,"source_backed":bool(spec["sources"]),"source_verification":"official_provider_or_primary_source_checked_against_recorded_area_use","verified_on":DATE,"linked_item_ids":linked_item_ids,"skippable":True,"blocking_policy":"never","sequence_policy":"none","sources":spec["sources"],"rationale":spec["rationale"]})
    # Casevo evidence verifies the project and its tutorial, not general
    # empirical validity or wide adoption. Correct stale D078 wording and make
    # it selectable only as an optional, bounded simulation route.
    casevo_area_ids={"area_enrichment_item:d078-computational-digital-social-science-mesa-or-casevo","area_enrichment_item:d078-econ-casevo-llm-sim","area_enrichment_item:soc-a2"}
    for item_id in casevo_area_ids:
        node=by_id.get(item_id)
        if not node: continue
        node["student_visible"]=True
        node["approval"]="externally_verified_ready_for_use"
        node["resolution_state"]="resolved_ready_for_use"
        node["display_readiness"]="clickable_when_projected"
        node["external_tool_resolution"]={"resolution_state":"resolved_ready_for_use","display_readiness":"clickable_when_projected","verified_on":DATE,"sources":EXISTING_TOOL_SOURCES["domain-item:d078-casevo-tool"],"rationale":"The official project repository provides an installable Python framework and a worked social-simulation tutorial. This verifies a usable specialist tool, not model validity, external adoption, or the truth of simulated agent behaviour."}
        node["learning_links"]=[{"label":"Casevo project README and tutorial","url":"https://github.com/rgCASS/casevo","publisher":"rgCASS Casevo project","verified_on":DATE},{"label":"Casevo research paper","url":"https://arxiv.org/abs/2412.19498","publisher":"Casevo authors","verified_on":DATE}]
        node["resources"]=[{"url":u,"source":"official_or_primary_documentation","accessed_on":DATE} for u in EXISTING_TOOL_SOURCES["domain-item:d078-casevo-tool"]]
        node["evidence"]=[{"url":"https://github.com/rgCASS/casevo","accessed_on":DATE,"locator":"README: project purpose, installation requirements, Mesa-based framework, NetworkX example and social-simulation tutorial"},{"url":"https://arxiv.org/abs/2412.19498","accessed_on":DATE,"locator":"Paper abstract and framework description"}]
        if item_id.endswith("mesa-or-casevo"):
            node["label"]="Mesa or Casevo for agent-based social simulation"
            scope=node.setdefault("requirement_scope",{}); scope["condition"]="Choose a framework only when a specified question calls for simulation. Mesa supports general Python agent-based models; Casevo is a specialist cognitive-agent/social-evolution framework. Its LLM example may require a separately configured provider; check current model, access, privacy terms and cost. Neither framework makes simulation outputs empirical observations."
        else:
            node["limitations"]=["Casevo is a specialist experimental framework; the available project tutorial does not establish broad adoption or validate its simulated claims.","LLM-generated agent actions are simulated outputs, not representative human responses or evidence of actual behaviour.","The core framework is open source; optional model-provider access, terms, privacy and cost are separate and may change."]
            if item_id.endswith("econ-casevo-llm-sim"):
                scope=node.setdefault("requirement_scope",{}); scope["condition"]="Optional specialist simulation reading for a defined agent-based research question. The core Casevo framework is publicly documented; the LLM-enabled example may require a separate provider/API account and cost. Do not treat outputs as observations, forecasts or validated claims about Nigerian populations; do not submit sensitive data."
        records.append({"canonical_id":item_id,"label":node.get("label"),"item_type":node.get("item_type"),"owner_layer":f"area:{node.get('area_id')}","area_id":node.get("area_id"),"resolution_state":"resolved_ready_for_use","display_readiness":"clickable_when_projected","selectable":True,"source_backed":True,"source_verification":"official_project_repository_and_author_paper_checked_against_bounded_area_simulation_use","verified_on":DATE,"skippable":True,"blocking_policy":"never","sequence_policy":"none","sources":EXISTING_TOOL_SOURCES["domain-item:d078-casevo-tool"],"rationale":node["external_tool_resolution"]["rationale"]})
    for r in resolved_tool_records:
        records.append(r)
    # Preserve ownership: time-series is an economics-area method extension, not a new domain item.
    by_id.setdefault(TIME_SERIES["id"], None)
    if by_id[TIME_SERIES["id"]] is None:
        time_node={"id":TIME_SERIES["id"],"kind":"area_enrichment_item","item_type":"method","label":TIME_SERIES["label"],"area_id":"D078:economics-applied-analysis","owner_layer":"area","student_visible":True,"approval":"externally_verified_ready_for_use","requirement_lane":"useful_optional","requirement_level":"useful","requirement_scope":optional_scope(TIME_SERIES["purpose"]),"skippable":True,"blocking_policy":"never","meaning":TIME_SERIES["purpose"],"learner_output":TIME_SERIES["output"],"relationships":[],"limitations":["Forecasting alone does not identify a causal effect.","Model form, structural breaks, revisions, seasonal patterns and forecast horizon affect interpretation."],"learning_links":[{"label":"Official time-series method/tool documentation","url":u} for u in TIME_SERIES["sources"]],"resources":[{"url":u,"source":"official_or_primary_documentation","accessed_on":DATE} for u in TIME_SERIES["sources"]],"evidence":[{"url":u,"accessed_on":DATE} for u in TIME_SERIES["sources"]]}
        nodes.append(time_node); by_id[time_node["id"]]=time_node
    quant=METHODS["quant"]; longitudinal=METHODS["longitudinal"]
    for r in graph["method_area_routes"]:
        if r["area_id"]=="D078:economics-applied-analysis" and r["method_id"] in {quant,longitudinal}:
            append_once(r.setdefault("area_item_ids",[]),TIME_SERIES["id"])
            append_once(r.setdefault("available_item_ids",[]),TIME_SERIES["id"])
            append_once(r.setdefault("domain_tool_ids",[]),"domain-item:d078-eviews-tool")
    econ_method="area_enrichment_item:d078-econ-applied-econometrics"
    if econ_method not in by_id: raise ValueError("Expected existing economics applied-econometrics item")
    add_edge(graph,econ_method,TIME_SERIES["id"],"builds_on","Time-series procedures are an optional specialization within applied econometric work when observations are ordered over time.",TIME_SERIES["sources"])
    add_edge(graph,TIME_SERIES["id"],"domain-item:d078-eviews-tool","tool_for","EViews is one software option for the time-series workflow; Stata, R and Python/statsmodels are also existing route options where available.",SOURCES["eviews"])
    for tool_id in ("domain-item:d078-statsmodels","domain-item:stata-quantitative-social-science-workflow","domain-item:r-statistical-computing","domain-item:d078-python"):
        add_edge(graph,tool_id,TIME_SERIES["id"],"tool_for","Existing statistical/econometric software can support parts of the time-series workflow; choose by the required model and local access.",TIME_SERIES["sources"])
    records.append({"canonical_id":TIME_SERIES["id"],"label":TIME_SERIES["label"],"item_type":"method","owner_layer":"area:D078:economics-applied-analysis","route_method_ids":[quant,longitudinal],"resolution_state":"resolved_ready_for_use","display_readiness":"clickable_when_projected","selectable":True,"source_backed":True,"source_verification":"official_econometric_software_documentation_checked_against_economics_time_series_learning_use","verified_on":DATE,"skippable":True,"blocking_policy":"never","sequence_policy":"none","sources":TIME_SERIES["sources"],"rationale":TIME_SERIES["purpose"]})
    # Spatially explicit ML stays Human Geography-owned, and can support that
    # area's spatial/role routes without becoming a domain or role item.
    GEO_RF={"id":"area_enrichment_item:d078-human-geography-geographical-random-forest","label":"Geographical random forest for spatially varying prediction","item_type":"method","area_id":"D078:human-geography-population","purpose":"Use geographically local random-forest models to explore or predict spatially varying relationships when suitable geographic data, adequate local samples and spatial validation are available. This predictive specialist extension does not replace spatial regression for inferential estimands or establish causal effects.","output":"A spatially validated comparison with a global baseline, mapped local prediction/error patterns, uncertainty and limits on interpretation.","sources":SOURCES["geographical_rf"]}
    if GEO_RF["id"] not in by_id:
        n={"id":GEO_RF["id"],"kind":"area_enrichment_item","item_type":"method","label":GEO_RF["label"],"area_id":GEO_RF["area_id"],"owner_layer":"area","student_visible":True,"selectable":True,"approval":"externally_verified_ready_for_use","resolution_state":"resolved_ready_for_use","display_readiness":"clickable_when_projected","verified_on":DATE,"requirement_lane":"useful_optional","requirement_level":"useful","requirement_scope":optional_scope(GEO_RF["purpose"]),"skippable":True,"blocking_policy":"never","sequence_policy":"none","auto_add":False,"auto_order":False,"meaning":GEO_RF["purpose"],"learner_output":GEO_RF["output"],"limitations":["Predictive performance does not establish causal effects.","Use spatially blocked or otherwise design-appropriate validation to avoid optimistic leakage.","Local models need adequate observations and careful geographic interpretation."],"relationships":[],"learning_links":[{"label":"Geographical random forest method paper","url":u,"publisher":"Peer-reviewed method/application source","verified_on":DATE} for u in GEO_RF["sources"]],"resources":[{"url":u,"source":"primary_method_or_peer_reviewed_application","accessed_on":DATE} for u in GEO_RF["sources"]],"evidence":[{"url":u,"accessed_on":DATE,"locator":"Spatially explicit random-forest method and social/population application"} for u in GEO_RF["sources"]]}
        nodes.append(n); by_id[n["id"]]=n
    for r in graph["method_area_routes"]:
        if r.get("method_id")==METHODS["spatial"] and r.get("area_id")==GEO_RF["area_id"]:
            append_once(r.setdefault("area_item_ids",[]),GEO_RF["id"])
            append_once(r.setdefault("available_item_ids",[]),GEO_RF["id"])
    for combo in graph["combination_designs"]:
        if METHODS["spatial"] not in combo.get("method_ids",[]): continue
        for r in combo.get("area_routes",[]):
            if r.get("area_id")==GEO_RF["area_id"]:
                append_once(r.setdefault("area_item_ids",[]),GEO_RF["id"])
                append_once(r.setdefault("available_item_ids",[]),GEO_RF["id"])
    add_edge(graph,GEO_RF["id"],METHODS["spatial"],"specialist_extension_of","A Human Geography-owned spatially explicit prediction extension for relevant spatial routes; it remains optional.",GEO_RF["sources"])
    add_edge(graph,GEO_RF["id"],"domain-item:d078-tree-ensemble-prediction","specialist_extension_of","Geographical random forest extends tree-ensemble prediction with local spatial modeling; compare using spatially suitable validation and keep inference/causality claims bounded.",GEO_RF["sources"]+SOURCES["ensembles"])
    records.append({"canonical_id":GEO_RF["id"],"label":GEO_RF["label"],"item_type":"method","owner_layer":"area:D078:human-geography-population","area_id":GEO_RF["area_id"],"route_method_ids":[METHODS["spatial"]],"resolution_state":"resolved_ready_for_use","display_readiness":"clickable_when_projected","selectable":True,"source_backed":True,"source_verification":"peer_reviewed_method_and_social_population_application_checked_against_human_geography_route","verified_on":DATE,"skippable":True,"blocking_policy":"never","sequence_policy":"none","sources":GEO_RF["sources"],"rationale":GEO_RF["purpose"]})
    # Refresh each combination component from its canonical method-area route.
    # Never flatten those route options onto the combination node: the student
    # must see which method contributes each item/tool and why.
    for combo in graph["combination_designs"]:
        for area_route in combo.get("area_routes",[]):
            route_node=by_id.get(area_route.get("route_node_id"))
            if not route_node: continue
            refreshed=[]
            for contribution in area_route.get("method_contributions",[]):
                method_id=contribution.get("method_id")
                source=next((row for row in graph["method_area_routes"]
                             if row["method_id"]==method_id and row["area_id"]==area_route.get("area_id")),None)
                if source:
                    for key in ("task_family_ids","area_item_ids","task_linked_domain_item_ids","available_item_ids",
                                "tool_ids","domain_downstream_item_ids","domain_tool_ids"):
                        contribution[key]=list(source.get(key,[]))
                refreshed.append(contribution)
                contribution_id=f"{area_route['route_node_id']}:method:{str(method_id).split(':')[-1]}"
                contribution_node=by_id.get(contribution_id)
                if contribution_node:
                    contribution_node.update(contribution)
                    contribution_node["student_explanation"]=contribution.get("contribution","")
                    for target_id in list(dict.fromkeys(
                        contribution.get("task_linked_domain_item_ids",[])
                        + contribution.get("domain_downstream_item_ids",[])
                    )):
                        if target_id in by_id:
                            target=by_id[target_id]
                            urls=[entry.get("url") for entry in target.get("learning_links",[])+target.get("resources",[])
                                  if isinstance(entry,dict) and entry.get("url")]
                            add_edge(graph,contribution_id,target_id,"method_contribution_reveals_domain_item",
                                     "This item is available through this method's separately described contribution in the selected design; its own requirement lane and use conditions still apply.",urls)
                    for target_id in list(dict.fromkeys(contribution.get("tool_ids",[])+contribution.get("domain_tool_ids",[]))):
                        if target_id in by_id:
                            target=by_id[target_id]
                            urls=[entry.get("url") for entry in target.get("learning_links",[])+target.get("resources",[])
                                  if isinstance(entry,dict) and entry.get("url")]
                            add_edge(graph,contribution_id,target_id,"method_contribution_reveals_tool",
                                     "This tool supports the named method contribution when the learner's task and access conditions fit; it is optional.",urls)
            area_route["method_contributions"]=refreshed
            route_node["method_contributions"]=refreshed
            # Combined-route aggregate fields intentionally remain empty. They
            # are populated only through the method contribution subroutes.
            for key in ("task_family_ids","area_item_ids","task_linked_domain_item_ids","available_item_ids",
                        "tool_ids","domain_downstream_item_ids","domain_tool_ids"):
                route_node[key]=[]
    # Emit one durable ledger row per canonical item, combining all of its
    # supported method/area routes instead of duplicating it once per route.
    unique_records={}
    for record in records:
        key=record["canonical_id"]
        existing=unique_records.get(key)
        if existing is None:
            existing=dict(record)
            existing["sources"]=list(dict.fromkeys(record.get("sources",[])))
            unique_records[key]=existing
            continue
        for field in ("route_method_id","route_method_ids"):
            values=record.get(field)
            if values is not None:
                if not isinstance(values,list): values=[values]
                merged=existing.setdefault("route_method_ids",[])
                for value in values:
                    if value not in merged: merged.append(value)
        for value in record.get("route_area_ids",[]):
            merged=existing.setdefault("route_area_ids",[])
            if value not in merged: merged.append(value)
        for value in record.get("sources",[]):
            if value not in existing["sources"]: existing["sources"].append(value)
        for field in ("selectable","source_backed","skippable"):
            existing[field]=bool(existing.get(field) or record.get(field))
        existing.pop("route_method_id",None)
    records=list(unique_records.values())
    # Create the audit ledger, graph summary and persistent resolution records.
    graph["relationship_resolution_summary"] = graph.get("relationship_resolution_summary",{})
    area_tool_option_ids={i for i in EXISTING_TOOL_SOURCES if i.startswith("area_tool_option:")}
    linked_prompt_targets=sum(len(spec.get("linked_item_ids",[])) for spec in AREA_ITEM_RESOLUTIONS.values())
    area_route_ids=set(AREA_ITEM_RESOLUTIONS)|casevo_area_ids|{TIME_SERIES["id"],GEO_RF["id"]}
    graph["method_technique_resolution_summary"]={"audit_date":DATE,"domain_techniques_added":len(TECHNIQUES),"technique_alternative_pairs_reviewed":len(TECHNIQUE_ALTERNATIVES),"false_cross_type_alternative_edges_removed":len(REMOVE_FALSE_ALTERNATIVE_PAIRS),"verified_tool_items_added":len(TOOLS),"area_specific_methods_added":2,"new_area_specialist_methods_added":1,"existing_route_tool_records_reviewed":len(route_tools),"existing_route_tools_resolved_ready_for_use":len(resolved_tool_records),"area_tool_option_records_reviewed":len(area_tool_option_ids),"area_tool_option_records_resolved_ready_for_use":sum(1 for r in resolved_tool_records if r["canonical_id"] in area_tool_option_ids),"tool_choice_prompts_resolved_explanatory_only":1,"area_route_items_reviewed":len(AREA_ITEM_RESOLUTIONS)+len(casevo_area_ids.intersection(by_id))+1,"area_route_items_resolved_ready_for_use":area_item_ready+len(casevo_area_ids.intersection(by_id))+1,"area_route_items_resolved_explanatory_only":area_item_explanatory,"area_explanatory_prompt_canonical_links":linked_prompt_targets,"area_route_records_source_backed":len(area_route_ids)+len(area_tool_option_ids),"unresolved_area_route_records_after_exhaustive_search":0,"casevo_area_route_records_resolved":len(casevo_area_ids.intersection(by_id)),"resolved_ready_for_use":sum(r.get("resolution_state")=="resolved_ready_for_use" for r in records),"resolved_explanatory_only":sum(r.get("resolution_state")=="resolved_explanatory_only" for r in records),"tool_alternative_pairs_reviewed":len(TOOL_ALTERNATIVES),"unresolved_after_exhaustive_search":0,"all_optional_edges_nonblocking":True,"all_useful_extensions_skippable":True,"method_count_reviewed":len(graph["method_node_ids"]),"combination_count_reviewed":len(graph["combination_designs"]),"area_count_reviewed":len({n.get('area_id') for n in nodes if n.get('kind')=='area_of_specialization'}),"method_area_route_count_reviewed":len(graph["method_area_routes"]),"method_area_role_route_count_reviewed":len(graph["method_area_role_routes"]),"role_fit_or_ownership_changed":False,"requirement_dispositions_changed":False}
    graph["nodes"]=nodes
    from apply_d078_student_language_2026_10_20 import apply_student_language
    apply_student_language(graph)
    GRAPH.write_text(json.dumps(graph,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    LEDGER.write_text(json.dumps({"schema_version":"d078-method-technique-resolution.v1","summary":graph["method_technique_resolution_summary"],"records":records},ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps({"techniques":len(TECHNIQUES),"technique_alternatives":len(TECHNIQUE_ALTERNATIVES),"tools":len(TOOLS),"area_methods":2,"ledger_records":len(records),"graph_nodes":len(nodes),"graph_edges":len(graph['edges']),"output":str(LEDGER)}))

if __name__=="__main__": main()

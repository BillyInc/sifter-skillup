# D078 selectable relationship evidence — 20 October 2026

## Decision

The external sources support teaching **manual coding with a documented codebook**, **sensitivity and robustness analysis**, **scenario analysis**, **NetLogo**, and **R/igraph** as substantive learning choices. Each is now represented by a canonical item and linked only to relevant D078 routes. The existing Sociology-owned codebook item was approved and made visible; the four previously absent domain items were added as skippable options. These items do not block progression.

| Phrase in relationship annotations | External evidence | Graph match | Display decision |
|---|---|---|---|
| Manual coding with a documented codebook | Codebook-based thematic analysis is described as a distinct analytic approach; government qualitative-evaluation guidance describes developing, piloting and applying a coding framework. | `area_enrichment_item:d078-soc-thematic-analysis` — “Thematic/framework analysis with an auditable codebook”. | Approved as a skippable Sociology-owned area item. It is selectable on the existing qualitative/interview/observation/focus-group routes. |
| Sensitivity analyses | HM Treasury’s 2026 *Magenta Book* transparency annex recommends appropriate robustness checks against alternative analysis choices and specifications. | `domain-item:d078-sensitivity-and-robustness-analysis`. | Added as an optional domain item under quantitative methods, causal inference, evaluation, psychometrics and longitudinal/multilevel routes. |
| Scenario analysis without generated personas | The Government Office for Science Futures Toolkit teaches scenario construction and testing policy options across plausible futures; Magenta Book complexity guidance identifies scenario analysis as exploring potential impacts under alternative futures. | `domain-item:d078-scenario-analysis`. | Added as an optional method under programme evaluation and as an alternative to synthetic persona/agent testing. It does not use generated personas. |
| NetLogo | Northwestern’s official NetLogo site describes a programmable multi-agent modelling environment and provides tutorials from using models to building one. | `domain-item:d078-netlogo-tool`. | Added as an optional ABM implementation tool alongside Mesa and Casevo. |
| R/igraph | The official R/igraph documentation describes an R package for network construction, manipulation and analysis. | `domain-item:d078-igraph-tool`. | Added as an optional network-analysis tool alongside NetworkX and Gephi. |

## Relationship interpretation

- NVivo and manual coding with a documented codebook are alternative ways to organize and code qualitative material. A codebook is part of a defined analytic workflow; it is not a software product.
- Sensitivity analysis is a robustness practice used with quantitative analyses and evaluation designs. The phrase alone does not establish a prerequisite or imply that every learner must study it. In the AI-generated-response annotation, it is a useful accompanying check, not a progression blocker.
- An item is clickable only when its canonical ID resolves, the relationship is accepted for display, and the current route projects the item. “Target identity resolved” does not mean “student-ready.”

## Sources checked

- HM Treasury, [Magenta Book: Transparency in Government Evaluation Research](https://www.gov.uk/government/publications/the-magenta-book/transparency-in-government-evaluation-research-t-i-g-e-r-html), section “Robustness and sensitivity analyses” (updated 15 May 2026).
- HM Treasury, [Quality in qualitative evaluation](https://www.gov.uk/government/publications/the-magenta-book/quality-in-qualitative-evaluation-qqe-html), qualitative analysis quality framework.
- Food Standards Agency, [Guidance 5: Qualitative and quantitative analysis](https://acss.food.gov.uk/QAT5), sections on thematic analysis, codebook approaches and framework analysis.
- Braun and Clarke, [Understanding thematic analysis](https://www.thematicanalysis.net/understanding-ta/) and [FAQs](https://www.thematicanalysis.net/faqs/), distinguishing codebook thematic analysis and describing codebooks as structured guidance for coding.
- UK Government Social Research, [Qualitative case-study annex](https://www.gov.uk/government/publications/sector-based-work-academy-programme-qualitative-case-study-research/swap-qualitative-case-study-research-annexes), documenting development, piloting and use of a coding framework in applied evaluation.
- HM Treasury, [Magenta Book: Handling complexity in policy evaluation](https://www.gov.uk/government/publications/the-magenta-book/supplementary-guide-handling-complexity-in-policy-evaluation-html), scenarios and system modelling.
- Government Office for Science, [Futures Toolkit](https://www.gov.uk/government/publications/futures-toolkit-for-policy-makers-and-analysts/the-futures-toolkit-html), scenario methods and testing policy choices.
- Northwestern University, [NetLogo](https://ccl.northwestern.edu/netlogo/), official software and learning tutorials.
- [R/igraph documentation](https://r.igraph.org/index.html), official R network-analysis package documentation.

## Local graph evidence

Checked the method route graph and reduced UI projection on 20 October 2026. The codebook item is area-owned and remains so; the four new items are domain-owned. Route entries keep them skippable, `blocking_policy: never`, and `auto_add: false`. Canonical graph and UI projection were regenerated from the route builder and exporter.

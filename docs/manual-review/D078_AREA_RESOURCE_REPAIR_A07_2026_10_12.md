# D078 area resource repair A07 — 2026-10-12

**Status:** evidence/resource research checkpoint for manual review only. This is one disjoint batch of 15 area-owned items. It does not change canonical records or approve student visibility.

Machine-readable records: [D078_AREA_RESOURCE_REPAIR_A07_2026_10_12.json](D078_AREA_RESOURCE_REPAIR_A07_2026_10_12.json)

## Scope and handling

The batch records direct URLs, publishers, precise page/section locators, the claim each source supports, limitations, access/cost notes, and the requested access date (2026-10-12). `evidence_sources` hold authoritative task/method/tool evidence; `free_task_specific_learning_resources` are actual instruction, tutorials or structured teaching materials. A product landing page was not used as the sole learning resource. Global sources are used where they teach the task; Nigerian context is additive and is not treated as a prerequisite to a valid global learning resource.

All 15 item IDs use the `area_enrichment_item:` prefix and match the requested disjoint batch:

1. `d078-computational-digital-social-science-computational-question-formulation`
2. `data-provenance-and-digital-ethics`
3. `reproducible-data-cleaning`
4. `python-social-data-workflow`
5. `r-social-data-workflow`
6. `jupyter-reproducible-environment`
7. `pandas-tabular-research-data`
8. `interpretable-statistical-modeling`
9. `digital-trace-construct-and-sampling`
10. `content-analysis-and-text-classification`
11. `network-analysis-method`
12. `networkx-or-gephi`
13. `agent-based-social-simulation`
14. `mesa-or-casevo`
15. `predictive-text-modeling`

## Research disposition

- Question formulation is supported by computational-social-science curricula that explicitly connect social questions, computational method choice, ethics and limitations. ACTiSS provides free structured materials; the Edinburgh page is useful course evidence but states “all rights reserved.”
- Data ethics/provenance is supported by OECD new-data research ethics guidance and UK Data Service research-data-management guidance. UKDS supplies free interactive modules on ethical sourcing, consent, anonymisation and documentation. Those materials have UK context and do not replace current Nigerian law or institutional review.
- Cleaning, Python, R, pandas and notebooks have hands-on routes through Data Carpentry, official Python/pandas tutorials and Jupyter/Binder materials. The dedicated Python-for-social-scientists lesson labels itself alpha. The R lesson uses SAFI teaching data and requires local R/RStudio setup.
- Interpretable modelling is supported by MIT OpenCourseWare social-science analysis materials and statsmodels regression-diagnostic notebooks. MIT materials require quantitative preparation; the coding example alone cannot teach design or establish causal validity.
- Digital traces and social networks have social-science-oriented teaching in SICSS and ACTiSS. The Utrecht digital-trace course page is evidence of a relevant course but its university catalogue lists a fee (€1,456); it is not presented as free instruction. SICSS materials provide a free alternative, with basic R assumed.
- Text-as-data and classification have step-by-step quanteda tutorials and scikit-learn's runnable text-classification lesson. The latter's English news example does not establish construct validity or Nigerian language/population performance.
- NetworkX and Gephi each have actual official tutorials/quickstarts; ACTiSS adds social-network framing. Their technical workflows do not establish that a graph boundary, tie or metric is substantively valid.
- Agent-based simulation has a free, step-by-step Mesa first-model tutorial. Its example is a toy model and cannot be treated as empirical evidence about people.

## Explicit unresolved branches

- **Casevo:** the official repository tutorial is now captured as a free-to-read learning route, and the official Baichuan API guide/pricing page is recorded as a paid route. The documented Casevo example requires an API key; cost-free end-to-end execution, account availability for Nigerian learners, current model compatibility and pinned reproducibility remain unverified. Keep Casevo optional with a cost/availability notice; Mesa is the free runnable alternative. Do not present model simulations as evidence about real people.
- **Predictive text modelling:** learners now have the free scikit-learn implementation tutorial, Hugging Face's official video-supported course, and a bounded Nigeria-relevant sentiment-classification practice route through AfriSenti (Hausa, Igbo, Nigerian Pidgin and Yorùbá), including the official SemEval talk video. This does not validate arbitrary social-science prediction: sentiment labels cannot stand in for other constructs, and AfriSenti's social-media sample does not establish population representativeness. A real study still needs a defined construct/population, lawful data use, appropriate human/reference labels, language/dialect checks and subgroup error review. The broad, unspecified validation branch remains unresolved; the specific sentiment-learning route is now available for review.

These unresolved findings are retained in the JSON rather than silently converted into positive evidence. No item is promoted by this checkpoint.

## Verification and boundary

Web searches and direct result inspection were used to verify the cited sources and learning pages. The accessed date recorded for each source is **2026-10-12**, as requested. Cost notes distinguish free access to instruction/software from optional enrollment, certificates, API use, compute, data access and local installation costs.

Only this JSON and this companion checkpoint are in scope. No graph/builder, canonical record, UI, role-fit/audit or matcher files were edited. Stop point: the requested 15 records are complete; no further batch is included.

## Follow-up source search — 2026-10-12

The follow-up closed learning-route gaps without pretending to settle scientific validity. Casevo's own README is the task-specific tutorial and documents its Baichuan API dependency; Baichuan's official API guide says account verification, top-up and API-key creation are prerequisites, with prices published separately. For Nigerian-language text classification, the ACL AfriSenti task paper and repository identify four Nigerian language varieties and provide the task video/data route. The Hugging Face course includes official lesson videos, while its sequence-classification documentation and scikit-learn's tutorial teach implementation. Each is scoped to what it actually teaches; none is evidence that a chosen construct or population has been validated.

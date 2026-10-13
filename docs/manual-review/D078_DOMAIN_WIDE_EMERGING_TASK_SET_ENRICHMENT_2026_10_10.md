# D078 domain-wide emerging task-set enrichment — 2026-10-10

Status: narrow supplementary draft; candidates are hidden and not student-approved. The authoritative local D078-wide pass is [`D078_DOMAIN_EMERGING_TASK_ENRICHMENT_2026_10_10.md`](D078_DOMAIN_EMERGING_TASK_ENRICHMENT_2026_10_10.md), which has six candidates, a 19-source registry and a source-search coverage register. Do not double-count or independently merge this smaller three-candidate subset; consult the primary checkpoint for domain-wide reconciliation.

Scope stays within the learning-enrichment implementation. It does not reopen role-fit adjudication, change canonical taxonomy, generate SQL, modify UI, or touch the separate subject matcher. Product terminology remains: **subgroup = area of specialization = area of practice**.

## Why a domain-level pass was needed

The current D078 contract and full inventory are not empty: they already contain research design, ethics and data care, computational social research, agent-based modelling, Mesa, Casevo, text/predictive modelling and scikit-learn. The gap is not “add more AI tools.” It is that the emerging *work tasks* around AI—what a social-science learner might do with it, how they check the result, where it fits, and what it cannot establish—are not yet adequately represented as connected learning items.

The new evidence supports three carefully bounded candidates:

1. **Use AI assistance for bounded research-work steps and verify the result.** A social-science data-lifecycle workshop discussed code generation, survey design, literature summarization and metadata extraction, while stressing human oversight, reproducibility and sensitive-data rules. UNESCO similarly frames GenAI use around human agency, privacy and ethical validation. AAPOR’s 2026 professional task-force report makes the case more concrete: it covers AI across survey design, collection, analysis and reporting; calls for task-specific evaluation (validity, performance, sensitivity and reliability); and emphasizes human oversight, documentation, disclosure and participant protections. This is an emerging, conditional useful edge—not a requirement for every learner or permission to upload participant data. [ICPSR/University of Michigan workshop](https://www.icpsr.umich.edu/sites/NAHDAP/news/u-m-workshop-explores-generative-ai-in-social-science-research-calls-for-clearer-guidelines), [UNESCO guidance](https://www.unesco.org/en/articles/guidance-generative-ai-education-and-research?hub=83250), [AAPOR 2026 responsible-AI report](https://aapor.org/wp-content/uploads/2026/05/Responsible-AI-Integration-In-Survey-Research.pdf)

2. **Check AI/ML-generated measures before using them as research evidence.** A 2026 AEA paper explains that generated covariates can contain measurement error that biases regression estimates and inference, and describes validation/bias-correction approaches. This is an emerging specialist method useful on selected quantitative, evaluation and computational routes—not a shared foundation item. [AEA guide to AI/ML-generated covariates](https://www.aeaweb.org/articles?id=10.1257/pandp.20261020)

3. **Check language and context before interpreting computer-analysed social text.** This is a cross-area useful edge for tasks that use digital text, not a universal requirement. The Nigerian-context evidence is concrete: an ACL-published study reports that tested general-purpose LLMs performed less accurately than language-focused systems on Igbo and Nigerian Pidgin translation benchmarks; NaijaSenti documents human-labelled Hausa, Igbo, Nigerian Pidgin and Yoruba sentiment data, including code-mixed text; and a Nigerian Pidgin study describes meanings that an English-only sentiment method can miss. This justifies a language-aware validation task—not a claim that one benchmark or model speaks for Nigeria. [ACL low-resource Nigerian-language benchmark](https://aclanthology.org/2025.loresmt-1.6/), [NaijaSenti corpus](https://arxiv.org/abs/2201.08277), [Nigerian Pidgin contextual sentiment study](https://arxiv.org/abs/2003.12450)

The distinction matters: “the AI produced a label” is not the same as “the label validly measures a social concept.” A learner needs a construct definition, reference evidence, a validation check, error analysis, and limits on what the result supports.

## What should not be overstated

LLM-based social simulation and Casevo already appear in the D078 inventory, so this pass does not add another duplicate “synthetic respondent” item. Instead, it records a stricter validation boundary for later reconciliation. Research comparing LLM outputs with human experiments finds systematic differences, including larger effects and weaker results on sensitive topics; another benchmark reports model-specific divergences in social decisions. The defensible learning use is a clearly labelled experimental pilot or simulation that is tested against relevant evidence—not replacing a survey sample or claiming the simulated agents represent Nigerians. [Nature Computational Science replication study](https://www.nature.com/articles/s43588-025-00840-7), [Scientific Reports social-decision benchmark](https://www.nature.com/articles/s41598-025-17188-7)

AI use is also task- and venue-specific. For example, *Qualitative Psychology* states restrictions on AI use in submitted manuscripts for literature review, data collection/analysis and interpretation, among other activities. That is a journal policy—not a universal ban—but it demonstrates why route guidance must require learners to check their institution, funder, journal and ethics conditions. [APA journal policy](https://www.apa.org/pubs/journals/qua/ai-policy)

For Nigerian research involving personal data, the Nigeria Data Protection Act may apply under the Commission’s stated scope. This checkpoint flags that local context without pretending that a short FAQ is legal advice or a substitute for the Act, institutional review or project-specific privacy assessment. [Nigeria Data Protection Commission FAQ](https://ndpc.gov.ng/faqs/)

## How the candidates fit the learning path

```text
domain foundation: question, evidence, research responsibility and data care
  └─ optional AI-assisted task, only where the chosen research task uses it
       ├─ bounded operation (e.g. code/metadata/survey-wording assistance)
       ├─ preserve source, model/version and audit trail
       ├─ human verification and correction
       └─ explain privacy, bias, uncertainty and disclosure limits

digital-text route (only when text/data and languages make this relevant)
  └─ define the social concept and coding rule
       ├─ document language/register/community coverage
       ├─ check human-labelled examples with fluent/context-aware review
       ├─ compare errors across languages/registers
       └─ limit conclusions to what the sample and measure support

quantitative/computational useful edge (selected routes only)
  └─ generate a measure from records with AI/ML
       ├─ define the construct and reference labels
       ├─ validate errors and subgroup/language differences
       ├─ check robustness/measurement-error effects
       └─ report what the measure can and cannot support
```

These are not extra layers that every learner must complete. A learner who does not choose an AI-using task should not receive AI items as universal requirements. Area ownership and area-specific detail will be reconciled only after the three disjoint area checkpoints arrive.

## Existing inventory reconciliation

- Keep `ai_assisted_and_digital_trace_research_ethics`; it covers ethics/governance and complements the new operational/validation task. It does not alone teach how to perform or audit AI-assisted work.
- Keep existing agent-based modelling, Mesa and Casevo candidate records. Add the newer validation boundary during reconciliation; do not duplicate them under a new synthetic-respondent label.
- Keep computational research and text/predictive-modelling candidates. The potential addition is validation of an AI/ML-derived measure, not another library name.
- Add language/context validity as a conditional cross-area method for any route that actually analyses social text. The Nigerian studies support an example and validation need, not blanket claims about every language or group.
- Do not add generic “prompt engineering” as a D078 foundation skill. A tool-specific prompting instruction belongs only where an evidenced task needs it.
- Do not invent a domain-wide certification.

## Evidence and learning-link gate

### Local source-sweep coverage (not a claim of universal exhaustion)

This local domain-wide sweep has directly checked the D078 contract and full inventory, then examined primary or official materials from ICPSR/University of Michigan, UNESCO, AAPOR, AEA, APA’s *Qualitative Psychology* journal, Mesa documentation, the Nigeria Data Protection Commission, ACL proceedings, and the research records/repos for NaijaSenti and Nigerian Pidgin text analysis. The records include exact source locators, access date, what each source supports, jurisdiction and limitations. The source mix intentionally separates professional guidance, official documentation, peer-reviewed research and preprints/data resources; they are not interchangeable evidence grades.

The scope is still open: the three area agents are doing disjoint, deeper searches across the officially documented sources relevant to their areas. They have been asked to inspect linked reports and standards—not rely on search-result snippets—and to record checked source families, exact locators, access status, no-hit/uncertainty and context-specific free learning materials. Their results must be reconciled with this local pass before anyone claims the D078 search is closed or promotes candidates.

The source registry and item contracts are in [`D078_DOMAIN_WIDE_EMERGING_TASK_SET_ENRICHMENT_2026_10_10.json`](../../data/career-mapping/_audit/D078_DOMAIN_WIDE_EMERGING_TASK_SET_ENRICHMENT_2026_10_10.json). All records remain hidden. This pass found useful explanatory resources but **did not verify a complete, free, beginner-friendly hands-on course** for the full AI-assisted social-research lifecycle, validation of generated measures, or language-aware text validation. The AEA paper is an advanced method reference and its free full-text access was not confirmed. The ICPSR page links a workshop deck, but the deck did not load during this check. ACL proceedings and NaijaSenti provide strong research examples/data, not a beginner course. Those are explicit open gates, not reasons to mislabel a link as a course.

The official [Mesa first-model tutorial](https://mesa.readthedocs.io/stable/tutorials/0_first_model.html) is a verified free hands-on resource for learning the software workflow. Its sample is a toy money-exchange model; it does not teach social theory, research design or empirical validation. Keep it attached only to the existing simulation task, not to the two new domain-wide candidates.

## Next step

When the three disjoint area checkpoints are complete, reconcile them against these domain candidates and the existing D078 contract. Decide which items are genuinely domain-wide, which are useful edges for named areas, and which remain experimental. Only then rebuild the integrated dependency graph from evidence-backed items and verified learning links. No candidate in this checkpoint is canonical or student-visible.

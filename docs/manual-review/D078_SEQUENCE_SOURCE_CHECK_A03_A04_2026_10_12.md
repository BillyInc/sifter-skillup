# D078 sequencing relationship source check — A03 and A04 — 2026-10-12

## Scope and method

This checkpoint reviews only the nine sequencing-critical relationship records in Politics/Governance/Public Policy (A03) and Psychology/Social Behaviour (A04). I inspected the corresponding relationship annotation/reference nodes in `data/career-mapping/_audit/D078_PROGRAMME_TO_ROLE_LEARNING_PATH_GRAPH_2026_10_10.json`, and the A03 records in `data/career-mapping/_audit/d078_area_relationship_dispositions_A01_A03_2026_10_10.json` and A04 records in `data/career-mapping/_audit/d078_area_relationship_dispositions_A04_A05_2026_10_10.json`.

All nine graph records are hidden and marked `sequence_approved: false`. Their handoff dispositions are useful semantic classifications, not independent proof of the claimed direction. Sources below were opened and checked for the stated sections or pages on **2026-10-12**. “Learner prerequisite/order” is distinguished from an operational order within a selected research task. Global methods sources support globally applicable research practice; they do not establish Nigerian legal requirements. No Nigerian source is needed to support the global methods findings here.

## Record findings

### A03 — Politics, Governance and Public Policy

#### 1. `area_relationship_reference:d078-a03-method-ai-assisted-evidence-synthesis:requires:written-inclusion-exclusion-protocol`

- **Claim tested:** AI-assisted evidence synthesis requires a written inclusion/exclusion protocol.
- **Finding:** **(b) Conditional task gate/safeguard.** Supported for a systematic evidence review using screening or automation; not a general prerequisite for policy analysis or every evidence synthesis.
- **Rationale and corrected relation:** Cochrane defines prespecified, unambiguous eligibility criteria as fundamental to systematic reviews and says later eligibility changes must be justified and not driven by results. This supports establishing the review question and criteria before AI-assisted screening/selection. The graph’s `requires` should therefore mean “when this workflow uses systematic review screening, define and document scope/eligibility before applying automation,” not “every learner must complete a protocol course first.”
- **Verified sources:** [Cochrane MECIR C5–C13, “Setting eligibility criteria”](https://www.cochrane.org/hr/authors/handbooks-and-manuals/mecir-manual/standards-conduct-new-cochrane-intervention-reviews-c1-c75/developing-protocol-review-c1-c23/setting-eligibility-criteria-including-studies-review-c5-c13), especially C5/C7/C9 and C13; [Cochrane Handbook, Chapter 4, §4.6.4](https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-04), full-text/selection process and documentation. Accessed 2026-10-12.

#### 2. `area_relationship_reference:d078-a03-competency-review-auditability:requires:access-to-original-records-full-texts`

- **Claim tested:** Review auditability requires access to original records/full texts.
- **Finding:** **(b) Conditional task gate/safeguard.** Supported when making eligibility, extraction, or substantive claims that depend on a source; the absolute wording needs qualification where full text is unavailable or unnecessary for an initial screen.
- **Rationale and corrected relation:** Cochrane says final inclusion decisions for potentially eligible studies should be based on full texts when possible, after an initial title/abstract screen, and selection decisions should be documented. Thus access to the underlying source must precede confirmation of a claim that a generated summary is being used to represent. “Access” should not be presented as an unconditional universal gate or as a separate learning item. If the original cannot be obtained, the claim remains unverified/awaiting assessment rather than inheriting authority from an AI summary.
- **Verified sources:** [Cochrane Handbook, Chapter 4, §4.6.4](https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-04), paragraphs on independent selection, full-text decisions, and recording exclusions (online lines 586–599). Accessed 2026-10-12.

#### 3. `area_relationship_reference:d078-a03-skill-validate-text-measures:requires:a-defined-construct-and-reference-sample`

- **Claim tested:** Validating a text measure requires a defined construct and reference sample.
- **Finding:** **(b) Conditional task gate/safeguard.** Supported when a text model is presented as measuring a social/political construct or when its performance is claimed; not a condition for exploratory text reading that makes no measurement-validity claim.
- **Rationale and corrected relation:** The primary methods article frames supervised text measurement around a predefined construct, representative and diverse labeled examples, separate validation data, and checks against expert/gold-standard coding or other validity evidence. That supports the dependency from construct/measurement definition and appropriate reference data to validation and interpretation. Narrow the original wording: the reference data must be suitable to the stated task and target population; a sample is not automatically a valid benchmark merely because it is human-labeled. Avoid implying that model accuracy alone proves construct validity.
- **Verified source:** [“Toward a framework for creating trustworthy measures with supervised machine learning for text,” *Political Science Research and Methods*](https://www.cambridge.org/core/journals/political-science-research-and-methods/article/toward-a-framework-for-creating-trustworthy-measures-with-supervised-machine-learning-for-text/4DECB1072FB983F991BA84ADB01EAFC4), article discussion of a predefined construct (online lines 504–505), representative labeled data and held-out validation (570–583). Accessed 2026-10-12.

#### 4. `area_relationship_reference:d078-a03-method-evaluate-ai-public-intervention:requires:baseline-and-defined-comparison`

- **Claim tested:** Evaluating an AI public intervention requires a baseline and defined comparison.
- **Finding:** **(b) Conditional task gate/safeguard.** Supported for impact or improvement claims; the edge must not imply every process, implementation, or descriptive evaluation requires a counterfactual design.
- **Rationale and corrected relation:** UK Government impact-evaluation guidance says to describe the comparison group for all impact-evaluation approaches, define business-as-usual, and plan a baseline early, before implementation when baseline evidence is needed. It also permits experimental, quasi-experimental, and theory-based methods, so “comparison” need not mean one prescribed control group or randomized design. Correct direction: specify the outcome, baseline, and defensible comparator/design during evaluation scoping and before interpreting an impact claim; make the condition explicit when the evaluation is descriptive or process-focused rather than causal.
- **Verified source:** [HM Treasury, “Guidance on the Impact Evaluation of AI Interventions,” summary recommendations on evaluation approach and baseline](https://www.gov.uk/government/publications/the-magenta-book/guidance-on-the-impact-evaluation-of-ai-interventions-html), especially comparison group and baseline recommendations (online lines 100–123; §2.3 “Establishing a baseline”). Accessed 2026-10-12.

#### 5. `area_relationship_reference:d078-a03-method-task-specific-ai-survey-workflow:requires:survey-protocol-and-task-specific-evaluation-plan`

- **Claim tested:** A task-specific AI survey workflow requires a survey protocol and task-specific evaluation plan.
- **Finding:** **(b) Conditional task gate/safeguard.** Supported only when AI is used in a specified survey task; not a universal prerequisite for survey research or political-opinion research.
- **Rationale and corrected relation:** AAPOR’s report says not to assume performance transfers between use cases, recommends a separate test dataset for each new application, calls for human review/testing, and says relevant evaluation metrics and acceptable thresholds should be set before production deployment. This supports defining the survey task and its success/error criteria before deploying AI. The source does not establish a requirement for a document specifically named “survey protocol” in every AI use. Phrase the relation as: “For an AI-assisted survey task, define the target population, instrument/workflow, risks and task-specific evaluation criteria before deployment; pretest and monitor according to the use.”
- **Verified source:** [AAPOR, *Responsible AI Integration in Survey Research*](https://aapor.org/wp-content/uploads/2026/05/Responsible-AI-Integration-In-Survey-Research.pdf), §4.1.1–4.1.2 (PDF pp. 31–33), §4.2 (PDF pp. 34–35; evaluation criteria/thresholds before production), and human-in-the-loop definition (PDF p. 83). Accessed 2026-10-12.

### A04 — Psychology/Social Behaviour

#### 6. `area_relationship_reference:d078-a04-method-digital-trace-inquiry:requires:contextual-ethical-and-legal-assessment`

- **Claim tested:** Digital-trace inquiry requires contextual ethical and legal assessment.
- **Finding:** **(b) Conditional task gate/safeguard.** Supported for collection, access, reuse, or analysis of digital traces, with the scope of review tied to the actual platform, data, people, research question, and jurisdiction.
- **Rationale and corrected relation:** AoIR’s Internet Research Ethics 3.0 explicitly uses a process- and context-oriented approach, says methods and ethics shape one another throughout research, and identifies national law, platform terms, privacy, and the characteristics of data subjects as relevant considerations. Therefore the relationship points to a genuine safeguard, but not a one-time universal legal “clearance” step. Review the applicable ethical, legal, platform, privacy, and harm conditions before collection or reuse, and revisit them if the method/data change. Nigerian law is a jurisdiction-specific follow-up when the project processes Nigerian personal data; absence of a Nigerian citation does not weaken the global ethical-method claim.
- **Verified source:** [AoIR, *Internet Research: Ethical Guidelines 3.0*](https://aoir.org/reports/ethics3.pdf), §2.2 “A Basic Ethical Approach” (PDF pp. 6–7), §3.1.2 “Informed Consent” (PDF p. 10), and §3.2.2 “Legal Aspects” (PDF p. 14). Accessed 2026-10-12.

#### 7. `area_relationship_reference:d078-a04-method-human-in-loop-llm-qualitative-analysis:requires:human-source-level-verification-and-privacy-review`

- **Claim tested:** Human-in-loop LLM qualitative analysis requires source-level verification and privacy review.
- **Finding:** **(b) Conditional task gate/safeguard.** Both components are supported for workflows that use an LLM on qualitative research material; they are distinct checks with different timing.
- **Rationale and corrected relation:** APA’s *Qualitative Psychology* policy cautions against submitting confidential or third-party-owned data to AI services without understanding privacy/legal compliance, and rejects unchecked AI analysis/findings in that journal’s publication context. AAPOR’s survey-AI guidance defines human-in-the-loop review as verifying AI-generated codes before final analysis; APA’s general research guidance also stresses vetting outputs because of fabrication risk. Correct the combined edge into two explicit conditions: (1) assess privacy, confidentiality, consent/ownership, and service terms before sending data to a model; (2) verify codes, summaries, and claims against source material before treating them as findings. This is not a prerequisite to learn qualitative analysis and the APA journal’s publication policy is not a universal prohibition.
- **Verified sources:** [APA, *Qualitative Psychology* AI policy](https://www.apa.org/pubs/journals/qua/ai-policy), “Concerns” and “Guidance” (especially confidential data before entry and unchecked analysis/findings, online lines 37–58); [AAPOR, *Responsible AI Integration in Survey Research*](https://aapor.org/wp-content/uploads/2026/05/Responsible-AI-Integration-In-Survey-Research.pdf), human oversight and output verification (PDF pp. 34–38 and p. 83); [University of Essex repository, “How to use Generative AI to Assist the Analysis of Qualitative Data”](https://repository.essex.ac.uk/40034/), abstract (human analyst remains central). Accessed 2026-10-12.

#### 8. `area_relationship_reference:d078-a04-method-contextual-measure-adaptation:requires:construct-definition-and-source-instrument-permission-provenance`

- **Claim tested:** Contextual measure adaptation requires construct definition and source-instrument permission/provenance.
- **Finding:** **(b) Conditional task gate/safeguard.** Supported for adapting or reusing a protected test/measure and for interpreting scores in a new population; components should remain distinct rather than being collapsed into one generic data-stewardship prerequisite.
- **Rationale and corrected relation:** ITC places intellectual-property permission in its pre-condition guidelines before adaptation and asks researchers to assess construct overlap/suitability for the intended populations before adaptation. Its confirmation and documentation guidance separately requires relevant evidence about construct, method, and item equivalence, samples, and validity; score comparisons are purpose-dependent. Thus permission/provenance and construct specification are genuine early checks for an adaptation workflow, while later psychometric confirmation follows adaptation and data collection. The claim should not imply that every measure needs translation/adaptation, that provenance equals legal permission, or that group equivalence is always the intended goal.
- **Verified source:** [International Test Commission, *The ITC Guidelines for Translating and Adapting Tests*, 2nd ed.](https://www.intestcom.org/files/guideline_test_adaptation_2ed.pdf), PC-1 and PC-2 (PDF pp. 8–9); TD-5 pilot data before large-scale studies (p. 15); C-1/C-2 on appropriate samples and equivalence evidence (pp. 16–18); score interpretation and comparison limits (p. 27). Accessed 2026-10-12.

#### 9. `area_relationship_reference:d078-a04-skill-cognitive-pretesting-and-equivalence:precedes:large-scale-fielding-and-group-score-comparison`

- **Claim tested:** Cognitive pretesting precedes large-scale fielding and group score comparison.
- **Finding:** **(d) Unsupported/needs correction as written.** The bundled target joins two different downstream activities. Its fielding/large-scale-testing direction is partly supportable as an operational order; its group-comparison implication is not established by cognitive pretesting.
- **Rationale and corrected relation:** ITC recommends pilot data on an adapted test and revisions before expensive large-scale reliability/validity or norming studies (TD-5, PDF p. 15). Separately, ITC says not to make comparative statements about group performance unless measurement invariance has been established for the scores being compared (score interpretation, PDF p. 27). Cognitive interviews/pretests help find comprehension or adaptation problems; they do not establish invariance. Correct the relationship to two steps: **cognitive pretesting/pilot → revise and decide whether to proceed to larger fielding/psychometric studies** (a conditional operational order); **intended group score comparison → first establish the relevant measurement invariance/equivalence evidence** (a conditional analytic gate). Do not make cognitive pretesting a direct prerequisite for comparing scores, and do not imply all studies need large-scale fielding or group comparisons.
- **Verified source:** [International Test Commission, *The ITC Guidelines for Translating and Adapting Tests*, 2nd ed.](https://www.intestcom.org/files/guideline_test_adaptation_2ed.pdf), cognitive interviewing as a possible method (PDF p. 14), TD-5 pilot data before large-scale studies (p. 15), and score interpretation guideline SSI-2 / measurement invariance (p. 27). Accessed 2026-10-12.

## Consolidated disposition

| Record group | Count | Supported category | Sequence interpretation |
|---|---:|---|---|
| A03 evidence synthesis, source auditability, text-measure validation, AI-intervention evaluation, AI-survey workflow | 5 | (b) | Conditions on specific evidence-review, measurement, impact-evaluation, or AI-survey tasks; not course prerequisites. |
| A04 digital-trace ethics, LLM qualitative checks, contextual measure adaptation | 3 | (b) | Conditional safeguards/preconditions within the selected method workflow. Separate checks where timing differs. |
| A04 cognitive pretesting/equivalence | 1 | (d) as written; corrected parts map to (a) and (b) | Pilot before larger instrument studies; separately require measurement-equivalence evidence before group score comparisons. |

No record is supported as a universal learner prerequisite. No record is best classified as merely explanatory context (c): each surviving relation has a task-specific operational or methodological consequence, though all must remain scoped to the relevant task. The nine claims are resolved enough for evidence disposition; this checkpoint does not approve graph integration, student visibility, or a course sequence. Nigerian-context claims are not made. For A04 digital-trace activity conducted in Nigeria, applicable Nigerian requirements still need to be assessed at the project level.

## Files and state

Only this separate evidence-review checkpoint was created. The graph JSON, builder, canonical data, role-fit/subject-matcher records, and other handoffs were not edited. Existing graph state remains hidden and sequence-unapproved pending the graph owner’s integration and any needed student-facing review.

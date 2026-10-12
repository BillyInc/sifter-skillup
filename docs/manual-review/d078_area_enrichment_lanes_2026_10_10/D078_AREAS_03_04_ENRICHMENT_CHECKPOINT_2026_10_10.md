# D078 areas 3–4 enrichment checkpoint — 2026-10-10

## Status

This is the completed source-backed enrichment/fix handoff for the two allocated D078 areas, including the replacement lane for the failed Parfit pass. It is not a canonical taxonomy change, SQL seed, UI change, role-fit adjudication, or subject-matcher change. All candidates remain hidden; none is promoted to student-visible status.

Scope uses the product terminology: **subgroup = area of specialization = area of practice**.

## Counts

- Areas owned: **2** (areas 3–4 only).
- Deduplicated baseline set: **18** items from 24 area references. The repeated cross-area foundations and two area-addition overlaps are counted once.
- Supplement: **21** candidate records reviewed, with **27** distinct referenced source IDs; supplement items are not added again to the final total.
- Replacement extension: **12** distinct candidate records across **5** task families.
- Combined deduplicated candidate ledger: **30** items across **13** task families (8 baseline + 5 extension).
- Extension source registry: **34** source records, including **9** free task-specific learning references; source counts are registry counts, not sums across inherited inputs.
- Student-visible records: **0**; canonical files and shared graph modified: **no**.

## Implementation decisions

1. Shared D078 foundation items are referenced as inherited candidates; they are not copied and are not silently made area requirements.
2. Area-owned additions are tied to an area task family, output, prerequisites, complements, alternatives and limitations.
3. Tools are presented as task choices. KoboToolbox, NVivo/Taguette, and R/Python/SPSS/Stata alternatives do not replace research design, sampling, measurement, interpretation or ethics.
4. Area 4 is explicitly bounded away from D064 Psychology and Counselling: no clinical assessment, counselling, psychotherapy, diagnosis, treatment or licensure claim is included.
5. Global sources establish globally relevant practice. Nigerian sources provide local curriculum, research-institute, official-statistics and government-policy context; lack of a Nigerian analogue is not used as a blocker.
6. No universal certification was invented for either area. Credential evidence is recorded as a separate qualification/certification finding.

## Areas 3–4 replacement extension: final disposition

All 12 extension candidates have an item-level evidence and learning-resource disposition in `data/career-mapping/_audit/d078_area_enrichment_lanes_2026_10_10/D078_AREAS_03_04_EXTENDED_ENRICHMENT_2026_10_10.json`. They remain hidden research candidates because this lane does not adjudicate programme transfer, role ownership or student visibility.

The 10 inherited gap records are closed; none remains `open`, `unresolved` or a placeholder:

| Gap | Final disposition |
|---|---|
| RIA video | Not established after OECD, Nigerian agency and free-video searches; free written OECD guidance retained. |
| Participation instructional video | Not established; free OECD written process guide retained. |
| Community scorecard/I-Monitor tutorial | No tutorial/video established; NILDS manual and Budget Office budget-monitoring FAQ retained as written learning resources. |
| Conflict course access | Free listing and linked UNICEF course overview verified; modules require login and playback was not tested. UNDP download returned 403 and is excluded as a learning link. |
| Full Nigerian RIA framework text | Not established after NIPC, PEBEC, OECD reproduction and sector-agency searches; no universal Nigerian requirement is claimed. |
| General non-health research-ethics rule | Not established; NHREC sources found are health-research scoped. Candidate wording requires applicable institutional/legal review without generalizing NHREC coverage. |
| Nigeria-wide participation standard | Not established; BPSR NSPSR supports high-level feedback/accountability context only. |
| Independent scorecard/I-Monitor efficacy | Not established; no causal/effectiveness claim is retained. |
| Programme and role transfer | Closed as outside this lane; exact curriculum and role evidence belong to a separately scoped downstream reconciliation. |
| Separate social-cohesion measure | Not promoted as duplicative of baseline group-pattern and measurement work. |

For every closed gap, the JSON records searched scope, reason and the precise evidence required to reopen. It also records direct-fetch limitations for official PDFs and the accessible indexed evidence used where appropriate. Search was bounded to the listed official/intergovernmental, Nigerian institutional, method-document and free-learning source families; it is not represented as a systematic review of all published material.

## Validation handoff

- JSON parses; **12/12** candidate IDs are unique and have dispositions; **34/34** source IDs are unique.
- All candidate evidence and learning-resource references resolve; all task-family item references resolve.
- All candidates remain `student_visible: false`; all `role_owner` values remain `null`.
- The 10 closure records have final dispositions, searched scope, reason and reopen evidence; no status is open, unresolved or partial.
- The final machine-readable counts and validation flags are in the extended JSON. This update changes only the Areas 3–4 lane output and this Markdown handoff.

## Area 3: Politics, Governance and Public Policy

**Boundary:** Study political institutions, public authority, policy processes, international relations, civic systems and governance outcomes through bounded evidence and interpretation.

**Exclusions:**
- This is not a licence to practise law, hold public office, issue official government decisions or claim that a policy recommendation will be adopted.

**Global context:** Global political-science and evaluation sources support bounded work on institutions, public issues, policy evidence, surveys and programme evaluation. These sources illustrate tasks; they do not define one universal occupation or credential.

**Nigeria context:** Nigerian evidence adds the local setting: NISER conducts social/economic policy research and consultancy; the National M&E Policy frames monitoring/evaluation across government; the OSGF describes policy monitoring, programme evaluation and evidence-based advice; NBS supplies official social-statistics outputs. These are context examples, not claims that every Nigerian role uses every method or tool.

### Inherited foundation candidates
- `d078-research-question-design` — A policy question still needs a bounded research question and design; it is inherited as a candidate, not a universal job requirement.
- `d078-evaluate-evidence-and-limits` — Policy recommendations require evidence appraisal and explicit limits.
- `d078-responsible-research` — Human participants, public data and stakeholder work require responsible practice when applicable.
- `d078-communicate-evidence` — Policy work needs audience-appropriate communication, but this area adds the policy-brief form.
- `d078-survey-data-collection-tool` — KoboToolbox is inherited as a conditional collection tool, not a policy foundation requirement.

### Area-owned additions
- Institution and policy-process knowledge
- Policy evidence review and options appraisal
- Stakeholder/context mapping
- Policy brief communication
- Political-opinion survey design
- Programme evaluation and theory of change
- Context-sensitive evaluation judgement

### Task families and item records

#### Understand institutions, authority and policy processes (`D078:politics-governance-public-policy:institution-and-policy-analysis`)

Identify the public institutions, rules, affected groups and implementation setting behind a political or policy question before recommending action.

**Evidence:** ONET_POLSCI, UNESCO_ISCED, NIGERIA_CCMAS, OSGF_PEAO

**Explanatory sources:** BLS_POLSCI, OPENLEARN_POLICY

**Task-specific learning:**
- [OPENLEARN_POLICY](https://www.open.edu/openlearn/society-politics-law/carrying-out-research-policy-and-advocacy-work) — Course sections 1 (policy research), 3 (research plan), 4.5 (documentary research), and 6 (writing the report).

**Typed additions:**
- **Political institutions, public authority and policy process** (`knowledge`, `area_owned_addition`): Knowledge of who makes, implements and is affected by public decisions.
  - Area use: In this area it helps the learner map an issue to institutions, authority, rules and implementation rather than treating policy as an abstract document.
  - Output: An institution-and-policy map naming the decision, responsible bodies, affected groups and implementation question.
  - Prerequisites: A bounded question or decision need, basic evidence literacy, and the ability to distinguish a source from an interpretation.; Ethics, permissions, confidentiality and applicable Nigerian or other jurisdictional rules when people or sensitive data are involved.
  - Complements: Evidence appraisal; Stakeholder mapping; Policy-document analysis
  - Alternatives: Comparative politics; Public administration; Law and economics context where the question requires them
  - Limits: It does not establish legal authority, political office, policy expertise or knowledge of every Nigerian institution.; A policy description does not show that the policy works.
  - Evidence: ONET_POLSCI, UNESCO_ISCED, OSGF_PEAO
  - Learning link(s): OPENLEARN_POLICY
  - Display state: hidden research candidate pending gates.
- **Stakeholder and affected-group mapping** (`skill`, `area_owned_addition`): A structured way to identify people, institutions and groups that influence or experience a policy.
  - Area use: It helps the learner avoid writing a policy brief only from the viewpoint of the commissioning institution.
  - Output: A stakeholder map with interests, influence, evidence needs and engagement limits.
  - Prerequisites: A bounded question or decision need, basic evidence literacy, and the ability to distinguish a source from an interpretation.; Ethics, permissions, confidentiality and applicable Nigerian or other jurisdictional rules when people or sensitive data are involved.
  - Complements: Context analysis; Interview or consultation design; Equity and cultural competence
  - Alternatives: A stakeholder map is not a substitute for representative participation or legal consultation.
  - Limits: It cannot prove that every affected group was found or agrees with the analysis.; A map is an organising aid, not a policy decision.
  - Evidence: AEA_COMPETENCIES, AEA_STANDARDS, NIGERIA_MNEP
  - Learning link(s): OPENLEARN_POLICY
  - Display state: hidden research candidate pending gates.

#### Turn evidence into a balanced policy brief (`D078:politics-governance-public-policy:policy-evidence-brief`)

Turn a governance or public-policy question into a bounded evidence review, compare options and state findings with uncertainty, trade-offs and implementation limits.

**Evidence:** ONET_POLSCI, OECD_POLICY_EVAL, AEA_COMPETENCIES, NISER_METHODS, NISER_ABOUT

**Explanatory sources:** BLS_POLSCI, NISER_BRIEFS

**Task-specific learning:**
- [OPENLEARN_POLICY](https://www.open.edu/openlearn/society-politics-law/carrying-out-research-policy-and-advocacy-work) — Free 8-hour course: policy questions, ethics, methodology, surveys/interviews/documents, analysis and written evidence reports.

**Typed additions:**
- **Policy evidence review and options appraisal** (`method`, `area_owned_addition`): A method for defining a decision question, finding relevant evidence, comparing feasible options and making the reasoning visible.
  - Area use: It is the area-specific bridge between research evidence and a decision-maker's choice; it is not advocacy disguised as neutral fact.
  - Output: A short options table showing evidence, assumptions, expected effects, trade-offs and uncertainty.
  - Prerequisites: A bounded question or decision need, basic evidence literacy, and the ability to distinguish a source from an interpretation.; Ethics, permissions, confidentiality and applicable Nigerian or other jurisdictional rules when people or sensitive data are involved.; A stated decision, options and criteria for comparison
  - Complements: Document analysis; Evidence appraisal; Stakeholder/context analysis
  - Alternatives: Literature review, rapid evidence assessment or a programme evaluation when their narrower purpose fits better
  - Limits: An evidence review cannot decide values for stakeholders, guarantee implementation or prove causality when the evidence design cannot support it.
  - Evidence: OECD_POLICY_EVAL, AEA_COMPETENCIES, NISER_METHODS, NISER_BRIEFS
  - Learning link(s): OPENLEARN_POLICY
  - Display state: hidden research candidate pending gates.
- **Policy brief and evidence communication** (`skill`, `area_owned_addition`): Writing a decision-focused document that separates evidence, interpretation, values, recommendation and limitations.
  - Area use: It helps a learner communicate findings to officials, civic organisations, programme managers or the public without presenting a recommendation as settled fact.
  - Output: A one- to four-page policy brief with a claim-evidence table and limitations box.
  - Prerequisites: A bounded question or decision need, basic evidence literacy, and the ability to distinguish a source from an interpretation.; Ethics, permissions, confidentiality and applicable Nigerian or other jurisdictional rules when people or sensitive data are involved.; An identified audience and decision
  - Complements: Data visualisation; Source tracing; Plain-language communication
  - Alternatives: Academic paper, technical report or presentation when the audience and purpose differ
  - Limits: A clear brief does not make weak evidence strong and does not replace legal, budgetary or political authorisation.
  - Evidence: BLS_POLSCI, NISER_BRIEFS, AEA_STANDARDS, NIGERIA_MNEP
  - Learning link(s): OPENLEARN_POLICY
  - Display state: hidden research candidate pending gates.

#### Design or interpret a political or public-opinion survey (`D078:politics-governance-public-policy:political-survey-opinion`)

Define a target population, write and test neutral questions, choose a defensible sample and mode, then explain nonresponse, measurement and coverage limits.

**Evidence:** ONET_SURVEY, ONET_POLSCI, NIGERIA_CCMAS

**Explanatory sources:** OPENSTAX_SOC_METHODS, PEW_QUESTION_WORDING

**Task-specific learning:**
- [OPENSTAX_SOC_METHODS](https://openstax.org/books/introduction-sociology-3e/pages/2-2-research-methods) — Survey and sample sections: target population, instruments, quantitative/qualitative answers, representativeness and method limits.

**Typed additions:**
- **Survey design, sampling and measurement** (`method`, `area_owned_addition`): A method for collecting comparable answers from a defined population through questions, a sampling plan and a documented mode of collection.
  - Area use: In this area it supports opinion, participation and governance questions; it is chosen only when asking people structured questions can answer the question.
  - Output: A tested questionnaire, sample/mode protocol, data dictionary and nonresponse/coverage note.
  - Prerequisites: A bounded question or decision need, basic evidence literacy, and the ability to distinguish a source from an interpretation.; Ethics, permissions, confidentiality and applicable Nigerian or other jurisdictional rules when people or sensitive data are involved.; A defined target population, construct and response plan
  - Complements: Cognitive pretesting; KoboToolbox or another collection tool; Quantitative analysis
  - Alternatives: Interviews, focus groups, document analysis or observation when those better answer the question
  - Limits: A survey measures reported answers, not necessarily behaviour; a sample or response pattern may not represent the wider population; wording can bias responses.
  - Evidence: ONET_SURVEY, OPENSTAX_SOC_METHODS, PEW_QUESTION_WORDING
  - Learning link(s): PEW_QUESTION_WORDING
  - Display state: hidden research candidate pending gates.
- **KoboToolbox for field survey collection** (`tool`, `area_application_of_domain_item`): A form-building and data-collection platform that can deploy surveys through web forms or KoboCollect, including offline field collection.
  - Area use: It supports the collection step of a political or governance survey; it does not choose the construct, sample, ethics decision or analysis.
  - Output: A deployed test form, pilot submissions, export and documented validation/consent settings.
  - Prerequisites: A bounded question or decision need, basic evidence literacy, and the ability to distinguish a source from an interpretation.; Ethics, permissions, confidentiality and applicable Nigerian or other jurisdictional rules when people or sensitive data are involved.; A reviewed questionnaire, consent/intro text, device/data plan and secure data-management plan
  - Complements: Sampling and question testing; Data dictionary; R/SPSS/Stata/Python as analysis alternatives
  - Alternatives: Paper forms, web forms, KoboCollect, ODK or another approved collection system depending on the field setting
  - Limits: KoboToolbox does not make a questionnaire valid, a sample representative or a dataset ethical; offline collection still requires secure device and data procedures.
  - Evidence: KOBO_QUICKSTART, KOBO_ESSENTIALS, NIGERIA_CCMAS
  - Learning link(s): KOBO_ESSENTIALS
  - Display state: hidden research candidate pending gates.

#### Monitor and evaluate programmes or public interventions (`D078:politics-governance-public-policy:monitoring-evaluation`)

Translate an intervention into questions, indicators and evidence, examine implementation and results, and communicate what worked, for whom, under which conditions and with what uncertainty.

**Evidence:** OECD_POLICY_EVAL, AEA_COMPETENCIES, AEA_STANDARDS, NIGERIA_MNEP, OSGF_PEAO

**Explanatory sources:** AEA_PRINCIPLES, NISER_METHODS

**Task-specific learning:**
- [AEA_COMPETENCIES](https://www.eval.org/About/Competencies-Standards/AEA-Evaluator-Competencies) — Competency domains for professional practice, methodology, context, planning/management and interpersonal work; use as an explanatory framework, not a universal certificate.

**Typed additions:**
- **Programme evaluation and theory of change** (`method`, `area_owned_addition`): A structured way to connect an intervention's activities to outputs, outcomes and assumptions, then judge performance against an agreed purpose.
  - Area use: In this area it helps compare a public programme's intended pathway with implementation evidence and observed results.
  - Output: A theory-of-change diagram, evaluation questions, indicator/evidence matrix and limitations statement.
  - Prerequisites: A bounded question or decision need, basic evidence literacy, and the ability to distinguish a source from an interpretation.; Ethics, permissions, confidentiality and applicable Nigerian or other jurisdictional rules when people or sensitive data are involved.; A defined programme, stakeholders, intended use and evaluation questions
  - Complements: Stakeholder engagement; Quantitative/qualitative/mixed methods; Clear reporting of limitations
  - Alternatives: Performance monitoring, audit, impact evaluation or implementation research when their purposes differ
  - Limits: A theory of change is an explicit model of how change is expected, not proof that the change occurred; monitoring is not the same as causal impact evaluation.
  - Evidence: OECD_POLICY_EVAL, AEA_COMPETENCIES, AEA_STANDARDS, NIGERIA_MNEP
  - Learning link(s): AEA_STANDARDS
  - Display state: hidden research candidate pending gates.
- **Context-sensitive evaluation judgement** (`competency`, `area_owned_addition`): The ability to interpret evidence in the programme's institutional, cultural, political and stakeholder context while stating assumptions and uncertainty.
  - Area use: It prevents the learner from treating a numerical result or stakeholder quote as a complete judgement without asking what the measure, context and intended use allow.
  - Output: An evaluation interpretation that shows context, assumptions, evidence strength, alternative explanations and intended use.
  - Prerequisites: A bounded question or decision need, basic evidence literacy, and the ability to distinguish a source from an interpretation.; Ethics, permissions, confidentiality and applicable Nigerian or other jurisdictional rules when people or sensitive data are involved.; Method knowledge and access to the programme context
  - Complements: Cultural competence; Evidence appraisal; Stakeholder communication
  - Alternatives: Technical monitoring, audit or statistical analysis alone
  - Limits: Professional judgement is not a licence to ignore evidence, documented values, participant rights or conflicts of interest.
  - Evidence: AEA_COMPETENCIES, AEA_PRINCIPLES, NIGERIA_MNEP
  - Learning link(s): AEA_PRINCIPLES
  - Display state: hidden research candidate pending gates.

### Qualifications/certifications

No single area-wide professional certification was established for this area.
Political-science, public-policy, public-administration, social-research or related study may be relevant depending on the role and employer; the sources do not justify presenting any one degree as universally required.

### Closed dispositions and downstream gates

- Programme-specific CCMAS transfer is not claimed here; the later integration step must attach the selected programme's exact course/outcome locators.
- No area-wide certification is proposed or implied. Employer, civil-service, procurement or regulated-task requirements must be checked only for a specific role/employer/jurisdiction.
- Nigerian evidence supplies local context where available; missing local analogues do not disqualify globally supported work and the evidence is not generalized to every Nigerian employer.
- All candidates remain hidden. Student display still requires a separate item-level claim, checkpoint-fit, relationship, limitation and accessible-learning-link gate.

## Area 4: Social Behaviour and Interaction

**Boundary:** Study social behaviour and interaction as a social-science subject: identity, attitudes, groups, culture, institutions and participation, using bounded empirical or interpretive inquiry.

**Exclusions:**
- Exclude clinical assessment, counselling, psychotherapy, diagnosis, psychological treatment and professional psychology licensure; those belong under the separate Psychology and Counselling domain D064 unless independently supported elsewhere.

**Global context:** APA, UNESCO, OpenStax and OpenLearn support social-behaviour concepts, scientific inquiry, group processes, identity, attitudes and method choice. They support social-science inquiry, not clinical practice or automatic cross-cultural generalisation.

**Nigeria context:** The Nigerian CCMAS and NISER sources add a local curriculum/research context for methods, ethics, data and reporting. They do not establish a Nigerian clinical or professional-psychology route inside this area; that boundary remains with D064 or another independently supported domain.

### Inherited foundation candidates
- `d078-research-question-design` — Behavioural questions still need a defined construct and fitting design; it remains a candidate foundation, not a universal employment requirement.
- `d078-evaluate-evidence-and-limits` — Group and behaviour claims need careful evidence and alternative-explanation checks.
- `d078-responsible-research` — People, identity and sensitive data require ethics, consent and confidentiality when applicable.
- `d078-qualitative-coding-tool` — Taguette/NVivo is a conditional coding choice for qualitative material, not a required foundation tool.
- `d078-survey-data-collection-tool` — KoboToolbox can support a survey route when the research question and field design require it.

### Area-owned additions
- Social-behavioural concepts and construct meaning
- Behavioural research design and measurement
- Ethical, cultural and reflexive judgement
- Social identity, group processes and cultural context
- Comparative/mixed analysis of group patterns
- Qualitative group inquiry
- Quantitative behavioural analysis as a conditional route

### Task families and item records

#### Study behaviour and interaction with a suitable research design (`D078:psychology-social-behaviour:behavioural-research-design`)

Define a social-behavioural question, operationalise the key idea, choose an observational, survey, interview or experimental design, and interpret reliability, validity and ethical limits.

**Evidence:** APA_GUIDELINES, UNESCO_ISCED, NIGERIA_CCMAS, NISER_METHODS

**Explanatory sources:** OPENSTAX_PSYCH_METHODS, OL_PSYCH

**Task-specific learning:**
- [OPENSTAX_PSYCH_METHODS](https://openstax.org/books/psychology-2e/pages/2-2-approaches-to-research) — Descriptive, correlational and experimental approaches and their strengths/limits.

**Typed additions:**
- **Social-behavioural concepts and construct meaning** (`knowledge`, `area_owned_addition`): Knowledge of how concepts such as attitudes, identity, group processes, norms and interaction are defined in a particular study.
  - Area use: It helps the learner explain what is being studied without turning a social-science construct into a clinical diagnosis or a universal label for a person.
  - Output: A construct note defining the concept, population, observable indicators and boundaries.
  - Prerequisites: A bounded question or decision need, basic evidence literacy, and the ability to distinguish a source from an interpretation.; Ethics, permissions, confidentiality and applicable Nigerian or other jurisdictional rules when people or sensitive data are involved.
  - Complements: Measurement and operationalisation; Context and cultural competence; Evidence appraisal
  - Alternatives: Sociological theory, social psychology or interaction analysis depending on the question
  - Limits: A concept does not diagnose a person, predict every individual or establish a treatment need.
  - Evidence: APA_GUIDELINES, OPENSTAX_PSYCH_SOCIAL, UNESCO_ISCED
  - Learning link(s): OPENSTAX_PSYCH_SOCIAL
  - Display state: hidden research candidate pending gates.
- **Behavioural research design and measurement** (`method`, `area_owned_addition`): A method for linking a behavioural question to measures and a design whose evidence can support the intended conclusion.
  - Area use: In this area it helps the learner choose between observation, survey, interview, experiment or mixed evidence instead of selecting a method because it is familiar.
  - Output: A design memo with construct definition, measure choice, sampling, procedure, ethics and inference limits.
  - Prerequisites: A bounded question or decision need, basic evidence literacy, and the ability to distinguish a source from an interpretation.; Ethics, permissions, confidentiality and applicable Nigerian or other jurisdictional rules when people or sensitive data are involved.; A defined construct, population and ethical plan
  - Complements: Reliability/validity checks; Qualitative interpretation; Quantitative analysis
  - Alternatives: Observation, survey, interview or experiment are alternatives for a question; none is universally best
  - Limits: Reliability is not validity; association is not causation; an experiment can still have weak measures or limited generalisability.
  - Evidence: APA_GUIDELINES, OPENSTAX_PSYCH_METHODS, NIGERIA_CCMAS
  - Learning link(s): OPENSTAX_PSYCH_METHODS
  - Display state: hidden research candidate pending gates.
- **Ethical, cultural and reflexive judgement** (`competency`, `area_owned_addition`): The ability to protect participants, recognise cultural and power contexts, reflect on the researcher's position and avoid stereotyping or harm.
  - Area use: It is essential when studying people and groups, especially where language, identity, power or stigma may affect participation and interpretation.
  - Output: A participant-risk and reflexivity note showing consent, confidentiality, cultural context and mitigation.
  - Prerequisites: A bounded question or decision need, basic evidence literacy, and the ability to distinguish a source from an interpretation.; Ethics, permissions, confidentiality and applicable Nigerian or other jurisdictional rules when people or sensitive data are involved.; A clear participant/data-risk assessment
  - Complements: Consent/confidentiality; Cultural competence; Bias and alternative-explanation checks
  - Alternatives: Institutional ethics review, where required, is not replaced by a learner's personal judgement
  - Limits: Ethical awareness does not itself grant clinical authority, counselling competence, diagnosis rights or professional psychology licensure.
  - Evidence: APA_GUIDELINES, AEA_PRINCIPLES, NIGERIA_MNEP
  - Learning link(s): AEA_PRINCIPLES
  - Display state: hidden research candidate pending gates.

#### Interpret group identity, participation and social context (`D078:psychology-social-behaviour:group-identity-and-participation`)

Examine how identity, group membership, social context or institutions relate to attitudes and participation while comparing evidence and alternative explanations.

**Evidence:** APA_GUIDELINES, UNESCO_ISCED, NIGERIA_CCMAS

**Explanatory sources:** OL_SOC_PSYCH, OPENSTAX_PSYCH_SOCIAL

**Task-specific learning:**
- [OL_SOC_PSYCH](https://www.open.edu/openlearn/health-sports-psychology/social-psychology-and-politics/content-section-0) — Free course on identity, personality, culture, groups, political participation and social psychology; 8-hour intermediate course.

**Typed additions:**
- **Social identity, group processes and cultural context** (`knowledge`, `area_owned_addition`): Knowledge of how group membership, identity, social situations and institutions can shape meaning, attitudes and interaction.
  - Area use: It supports careful interpretation of group-level patterns; it does not justify assuming that every person in a group behaves the same way.
  - Output: A context-and-group analysis that separates individual, group, institutional and cultural explanations.
  - Prerequisites: A bounded question or decision need, basic evidence literacy, and the ability to distinguish a source from an interpretation.; Ethics, permissions, confidentiality and applicable Nigerian or other jurisdictional rules when people or sensitive data are involved.
  - Complements: Context analysis; Qualitative interpretation; Measurement-bias checks
  - Alternatives: Political science, sociology, anthropology or communication perspectives when the question crosses their boundaries
  - Limits: A theory of group identity is not a diagnosis, prediction of an individual or evidence that a group is inherently a certain way.
  - Evidence: OPENSTAX_PSYCH_SOCIAL, OL_SOC_PSYCH, UNESCO_ISCED
  - Learning link(s): OL_SOC_PSYCH
  - Display state: hidden research candidate pending gates.
- **Comparative and mixed-method analysis of group patterns** (`method`, `area_owned_addition`): A method that compares groups or contexts using suitable qualitative, quantitative or combined evidence and states where comparisons are not valid.
  - Area use: It helps the learner examine patterns across groups without confusing a statistical difference, a reported experience and a causal explanation.
  - Output: A comparative analysis memo showing group definitions, measures, context, uncertainty and alternative explanations.
  - Prerequisites: A bounded question or decision need, basic evidence literacy, and the ability to distinguish a source from an interpretation.; Ethics, permissions, confidentiality and applicable Nigerian or other jurisdictional rules when people or sensitive data are involved.; Defined groups/contexts, comparable measures and an evidence plan
  - Complements: Survey/interview/observation; Quantitative or qualitative analysis; Cultural competence
  - Alternatives: Single-case qualitative inquiry, survey, observation or experiment when a comparison is not justified
  - Limits: Group comparisons can hide within-group variation, unequal measurement, confounding or cultural differences; they do not prove that identity caused an outcome.
  - Evidence: APA_GUIDELINES, NISER_METHODS, NIGERIA_CCMAS
  - Learning link(s): OPENSTAX_PSYCH_SOCIAL
  - Display state: hidden research candidate pending gates.
- **Interpret group patterns without stereotyping individuals** (`skill`, `area_owned_addition`): Reading evidence about groups while keeping the inference at the level supported by the data and avoiding unsupported claims about individual people.
  - Area use: This is a practical interpretation skill for research, participation, programme and community questions.
  - Output: A findings narrative that states who/what was studied, what pattern was observed and what cannot be inferred.
  - Prerequisites: A bounded question or decision need, basic evidence literacy, and the ability to distinguish a source from an interpretation.; Ethics, permissions, confidentiality and applicable Nigerian or other jurisdictional rules when people or sensitive data are involved.
  - Complements: Bias/measurement checks; Cultural competence; Uncertainty communication
  - Alternatives: Structured coding, comparative tables or statistical models depending on the evidence
  - Limits: It cannot eliminate all bias or turn limited evidence into a universal cultural claim.; A polished chart or model does not remove sampling, construct, language or power limitations.
  - Evidence: AEA_PRINCIPLES, APA_GUIDELINES, OL_SOC_PSYCH
  - Learning link(s): OL_SOC_PSYCH
  - Display state: hidden research candidate pending gates.

#### Use interviews, observation or documents to understand interaction (`D078:psychology-social-behaviour:qualitative-group-inquiry`)

Collect and interpret accounts or observations of interaction, group life or institutional practice with a clear sampling, consent, coding and reflexivity record.

**Evidence:** APA_GUIDELINES, NIGERIA_CCMAS, NISER_METHODS

**Explanatory sources:** OPENSTAX_SOC_METHODS, OL_SOC_PSYCH

**Task-specific learning:**
- [OPENSTAX_SOC_METHODS](https://openstax.org/books/introduction-sociology-3e/pages/2-2-research-methods) — Field research, interviews, observation and method trade-off sections.

**Typed additions:**
- **Qualitative interview, observation and document inquiry** (`method`, `area_owned_addition`): A set of methods for understanding meaning, interaction and institutional practice from words, observed activity or documents.
  - Area use: It is appropriate when the question needs depth, context or participants' accounts rather than only a numerical estimate.
  - Output: A consent-aware field record, documented coding framework and evidence-grounded interpretation.
  - Prerequisites: A bounded question or decision need, basic evidence literacy, and the ability to distinguish a source from an interpretation.; Ethics, permissions, confidentiality and applicable Nigerian or other jurisdictional rules when people or sensitive data are involved.; A focused question, access/consent plan and analytic approach
  - Complements: Thematic coding; Reflexivity; Triangulation with documents or survey evidence
  - Alternatives: Survey, secondary-data analysis or experiment when those better answer the question
  - Limits: Qualitative evidence can explain meanings and variation but does not automatically estimate prevalence or establish causation.
  - Evidence: OPENSTAX_SOC_METHODS, APA_GUIDELINES, NISER_METHODS
  - Learning link(s): OPENSTAX_SOC_METHODS
  - Display state: hidden research candidate pending gates.
- **NVivo or Taguette for qualitative coding** (`tool`, `area_application_of_domain_item`): Software for organising source material and applying documented codes or categories to qualitative data.
  - Area use: It supports traceable handling of interviews, documents or media; it does not decide what a code means or validate an interpretation.
  - Output: A coded sample, codebook, analytic memo and audit trail linking excerpts to interpretations.
  - Prerequisites: A bounded question or decision need, basic evidence literacy, and the ability to distinguish a source from an interpretation.; Ethics, permissions, confidentiality and applicable Nigerian or other jurisdictional rules when people or sensitive data are involved.; A codebook or analytic plan, lawful data access and de-identification where needed
  - Complements: Manual coding; Thematic analysis; Memoing and reflexivity
  - Alternatives: Manual coding, NVivo or Taguette can serve similar organising purposes; choose one route rather than requiring all
  - Limits: Coding software cannot establish reliability, validity, representativeness, participant consent or causal explanation; automated coding needs human checking.
  - Evidence: LUMIVERO_NVIVO, TAGUETTE_DOCS, APA_GUIDELINES
  - Learning link(s): LUMIVERO_NVIVO
  - Display state: hidden research candidate pending gates.

#### Analyse behavioural data when the question requires measurement (`D078:psychology-social-behaviour:quantitative-behavioural-analysis`)

Prepare, analyse and communicate numerical behavioural or group data using a method and software appropriate to the question, measurement and data structure.

**Evidence:** APA_GUIDELINES, NISER_METHODS, NIGERIA_CCMAS

**Explanatory sources:** OPENSTAX_PSYCH_METHODS, DATACARPENTRY_SOCIAL_R

**Task-specific learning:**
- [DATACARPENTRY_SOCIAL_R](https://datacarpentry.org/lessons/) — Social Sciences workshop: data organisation, cleaning, analysis and visualisation with R; the Python social-science materials are marked alpha/development and should not be presented as equally mature.

**Typed additions:**
- **Operationalise, analyse and communicate behavioural measures** (`skill`, `area_owned_addition`): Turning a behavioural idea into a documented measure, checking the data and explaining numerical results with uncertainty.
  - Area use: It helps a learner move from a concept such as participation or attitude to an evidence-backed, bounded interpretation.
  - Output: A reproducible analysis note with data dictionary, measure rationale, tables/figures and limitations.
  - Prerequisites: A bounded question or decision need, basic evidence literacy, and the ability to distinguish a source from an interpretation.; Ethics, permissions, confidentiality and applicable Nigerian or other jurisdictional rules when people or sensitive data are involved.; A defined construct, measure and data-quality plan
  - Complements: R/Python/SPSS/Stata alternatives; Visualisation; Reliability/validity review
  - Alternatives: Qualitative analysis or mixed methods when numerical measurement cannot answer the question alone
  - Limits: Software output does not prove the measure is valid, the sample represents a population or the association is causal.
  - Evidence: APA_GUIDELINES, NISER_METHODS, NIGERIA_CCMAS
  - Learning link(s): DATACARPENTRY_SOCIAL_R
  - Display state: hidden research candidate pending gates.
- **R, Python, SPSS or Stata as analysis alternatives** (`tool_group`, `area_application_of_domain_item`): Different software routes for organising, analysing and presenting numerical social-behaviour data; they are alternatives selected by task, access, team and reproducibility needs.
  - Area use: At this area checkpoint, the learner sees why one route might be chosen for a task; learning a tool does not replace measurement, design or interpretation.
  - Output: A clean dataset and analysis/report produced in one selected software route with a reproducible record.
  - Prerequisites: A bounded question or decision need, basic evidence literacy, and the ability to distinguish a source from an interpretation.; Ethics, permissions, confidentiality and applicable Nigerian or other jurisdictional rules when people or sensitive data are involved.; Basic data literacy and a chosen analysis plan
  - Complements: Data dictionary; Visualisation; Statistical reasoning
  - Alternatives: R, Python, SPSS and Stata are alternative workflow choices for a given analysis unless a specific project requires interoperability
  - Limits: No package or software proves competence, appropriate inference, ethical use or professional psychology status.
  - Evidence: DATACARPENTRY_SOCIAL_R, NISER_METHODS, APA_GUIDELINES
  - Learning link(s): DATACARPENTRY_SOCIAL_R
  - Display state: hidden research candidate pending gates.

### Qualifications/certifications

No single area-wide certification was established for social-behaviour and interaction work.
Relevant study may include sociology, social psychology, psychology or other social-science programmes depending on the role; no source supports treating this area as a clinical or licensed psychology qualification.

### Closed dispositions and downstream gates

- No selected-programme curriculum transfer is claimed; the later integration must cite exact course/outcome locators.
- No universal credential or clinical, counselling, diagnostic or treatment qualification is implied; specific regulated-practice requirements need their own authority-specific check.
- Global evidence is not automatically a Nigerian population claim. Local inference requires a defined population/language/setting and context-specific evidence; absence of that evidence does not disqualify the global method candidate.
- All candidates remain hidden. The later display gate must verify each claim, relationship, limitation and accessible learning resource; this is not a remaining research gap in the area-enrichment lane.

## Source register

The machine-readable checkpoint contains the complete source registry with publisher, URL, exact locator, jurisdiction, supported claim and limitation. The most important sources are:

- `UNESCO_ISCED` — [ISCED Fields of Education and Training 2013: Detailed Field Descriptions](https://uis.unesco.org/sites/default/files/documents/international-standard-classification-of-education-fields-of-education-and-training-2013-detailed-field-descriptions-2015-en.pdf) — Fields 0311–0314 and inclusion/exclusion notes distinguishing political science, psychology, sociology/cultural studies, economics and social geography.
- `ONET_POLSCI` — [Political Scientists, 19-3094.00](https://www.onetonline.org/link/details/19-3094.00) — Occupation overview and Tasks table: maintain policy knowledge; develop/test theories; collect/analyse election and opinion data; evaluate policies; advise and communicate findings.
- `ONET_SURVEY` — [Survey Researchers, 19-3022.00](https://www.onetonline.org/link/summary/19-3022.00) — Tasks table: set objectives, design/test wording, specify sample and method, monitor collection, analyse and present findings.
- `APSA_METHODS` — [Building a Bridge for Better Political Science Research](https://educate.apsanet.org/building-a-bridge-for-better-political-science-research) — Methods education and research-competency overview for political science.
- `AEA_COMPETENCIES` — [AEA Evaluator Competencies](https://www.eval.org/About/Competencies-Standards/AEA-Evaluator-Competencies) — Five domains: professional practice, methodology, context, planning/management and interpersonal competence.
- `AEA_STANDARDS` — [Program Evaluation Standards](https://www.eval.org/About/Competencies-Standards/Program-Evaluation-Standards) — Utility, feasibility, propriety, accuracy and accountability standards; explicit purposes, context, valid information, reasoning and documentation.
- `AEA_PRINCIPLES` — [Guiding Principles for Evaluators](https://www.eval.org/About/Guiding-Principles) — Systematic inquiry, competence, integrity, respect for people, common good/equity, limitations and cultural context.
- `OECD_POLICY_EVAL` — [Policy Framework on Sound Public Governance: Toward robust policy evaluation](https://www.oecd.org/en/publications/2020/12/policy-framework-on-sound-public-governance_931b05fc/full-report/component-11.html) — Policy evaluation as structured/objective assessment of relevance, fulfilment, efficiency, effectiveness, impact and sustainability; evidence supports decision-making.
- `BLS_POLSCI` — [Political Scientists, Occupational Outlook Handbook](https://www.bls.gov/ooh/life-physical-and-social-science/political-scientists.htm) — What political scientists do and duties, including research and policy communication.
- `OPENLEARN_POLICY` — [Carrying out research for policy and advocacy work](https://www.open.edu/openlearn/society-politics-law/carrying-out-research-policy-and-advocacy-work) — Free course sections on policy research, ethics, methodology, surveys/interviews/focus groups/documents, analysis and written reporting; 8 hours, intermediate.
- `OPENSTAX_SOC_METHODS` — [Introduction to Sociology 3e, 2.2 Research Methods](https://openstax.org/books/introduction-sociology-3e/pages/2-2-research-methods) — Survey, target population/sample, questionnaire/interview, field research, secondary data and method trade-offs.
- `PEW_QUESTION_WORDING` — [Methods 101: Survey Question Wording](https://www.pewresearch.org/methods/2018/03/21/methods-101-video-question-wording/) — Explains why clear, neutral question wording is central to sound public-opinion survey research.
- `KOBO_QUICKSTART` — [Quickstart guide](https://support.kobotoolbox.org/quick_start.html) — Create account, build/deploy a form, collect via web or KoboCollect, and view/download data.
- `KOBO_ESSENTIALS` — [KoboToolbox Essentials](https://academy.kobotoolbox.org/courses/essentials) — Free modules on forms, question types, skip logic, deployment, collection and data management; about three hours of video content.
- `NIGERIA_CCMAS` — [Social Sciences CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf) — Relevant social-science course/outcome blocks: research methods, data collection/organisation, statistics, policy/social inquiry and reporting; use the exact programme/course locator during final programme transfer.
- `NISER_METHODS` — [Research Methodology Training](https://niser.gov.ng/v2/research-methodology-training/) — Research design, quantitative/qualitative approaches, ethics, proposals, policy/programme evaluation, computer skills and reporting.
- `NISER_ABOUT` — [About NISER](https://niser.gov.ng/v2/about-niser/) — Mandate to conduct social/economic research, provide consultancy and disseminate findings for policymakers.
- `NISER_BRIEFS` — [Policy Briefs](https://niser.gov.ng/v2/briefs/) — Examples of Nigerian social/economic research outputs and policy recommendations.
- `NBS_SOCIAL` — [Social Statistics Report 2023](https://nigerianstat.gov.ng/elibrary/read/1241501) — Official social indicators compiled largely from administrative sources and used by policymakers, researchers and students.
- `NIGERIA_MNEP` — [National Monitoring and Evaluation Policy of Nigeria](https://nationalplanning.gov.ng/wp-content/uploads/2023/02/NPC-MNEP-LATEST.pdf) — Framework for monitoring/evaluation, reporting, institutional responsibilities and evidence-informed policy across federal and sub-national government.
- `OSGF_PEAO` — [Political & Economic Affairs Office](https://www.osgf.gov.ng/offices/political-economic-affairs-office/) — Mandate includes policy monitoring/analysis, programme evaluation and evidence-based advice to government.
- `APA_GUIDELINES` — [Guidelines for the Undergraduate Psychology Major, Version 3.0](https://www.apa.org/about/policy/undergraduate-psychology-major) — Five educational goals: content/applications, scientific inquiry/critical thinking, values, communication/technology and professional development.
- `OPENSTAX_PSYCH_METHODS` — [Psychology 2e, 2.2 Approaches to Research](https://openstax.org/books/psychology-2e/pages/2-2-approaches-to-research) — Descriptive, correlational and experimental approaches and method strengths/limitations.
- `OPENSTAX_PSYCH_SOCIAL` — [Psychology, 12.1 What Is Social Psychology?](https://openstax.org/books/psychology/pages/12-1-what-is-social-psychology) — Social situations, attitudes, identity, group processes and intergroup relationships; situational and dispositional explanations.
- `OL_PSYCH` — [Investigating psychology](https://www.open.edu/openlearn/health-sports-psychology/investigating-psychology) — Course description, methods/history/ethics learning and outcomes.
- `OL_SOC_PSYCH` — [Social psychology and politics](https://www.open.edu/openlearn/health-sports-psychology/social-psychology-and-politics/content-section-0) — Identity, personality, culture, groups, social movements, protest and political action; free intermediate course.
- `DATACARPENTRY_SOCIAL_R` — [Data Carpentry lessons](https://datacarpentry.org/lessons/) — Social Sciences workshop: data organisation, cleaning, analysis and visualisation with R; Python social-science materials marked alpha/development.
- `LUMIVERO_NVIVO` — [NVivo Product Tour: Qualitative Data Analysis](https://lumivero.com/products/nvivo-old/nvivo-product-tour/) — Importing, coding, cases, classifications, queries, memos and visualisations for qualitative material.
- `TAGUETTE_DOCS` — [Taguette qualitative analysis documentation](https://www.taguette.org/) — Open-source qualitative data organisation/coding tool identity and documentation.

## Explicit non-claims

This checkpoint does not say that every learner needs every listed item, that a tool proves competence, that a global occupational source describes Nigerian employment, that a programme has taught the item, or that a learner is licensed for professional practice. Those claims require separate evidence and gates.

## 2026-10-10 continuation — supplement gaps explicitly dispositioned

The prior emerging-task supplement had seven entries under `unresolved_gaps`. They have now each received a final, evidence-grounded disposition in `D078_AREAS_03_04_EMERGING_TASKS_SUPPLEMENT_2026_10_10.json`. These are not silently declared solved: each record states what remains excluded or conditional and what evidence would reopen it. The supplement now has `unresolved_gaps: []` and seven `closed_gap_dispositions`.

The supplement registry now contains **35** distinct source records. The replacement AI-assisted qualitative-analysis learning links are attached only to the relevant Area 4 method/competency records; the Essex file is explicitly excluded as an inaccessible learner link, while the public tutorial outline and full CUHK module have checked locators and caveats.

| Former gap | Final disposition |
|---|---|
| Essex guide / AI4Qual access | The Essex repository metadata and abstract are accessible, but its PDF returned 403/cache-miss in this check, so it is not offered as a learner link. Replaced the unverified links with the accessible [AI4Qual public tutorial outline](https://iui.acm.org/2026/tutorials/) and the full, free [CUHK social-science AI qualitative-analysis module](https://www.soc.cuhk.edu.hk/wp-content/uploads/2026/03/MM4-AI-for-Qualitative-Data-Analysis-and-Reflections.pdf). Neither is misrepresented as the complete AI4Qual workshop or a software certification. |
| No Nigerian validation of synthetic participants | Closed as an inference boundary: agent simulation remains experimental/exploratory; outputs are not Nigerian participant data, population estimates or confirmatory evidence. Local validation is required only if a specific Nigerian population claim is proposed. |
| No validated Nigerian corpus/API route | Closed as a project-specific access gate. No dataset/API availability is promised; a concrete source must be checked for permissions, provenance, languages, NDPA and ethics before use. |
| UK AI standards are not Nigerian law | Closed by explicit jurisdiction labels and exclusion of Nigerian legal claims. UK standards remain examples; operational Nigerian compliance advice requires current Nigerian instruments and case-specific review. |
| Rayyan free-plan feature uncertainty | Official pricing and Help Center pages were rechecked on 2026-10-10. The Free plan currently lists AI relevance predictions; premium ResearchPilot/PICO capabilities are distinct. This is a dated vendor snapshot to recheck before future display, not a durable guarantee. |
| Certification requirement not established | Closed as “no universal credential claim”: none is proposed for the area-wide task set. This does not deny that a particular employer, role or regulated activity may require credentials. |
| Programme, role and graph integration outside this lane | Closed as an explicit scope boundary. This lane claims area-owned candidates only; programme transfer, role ownership, student display, canonical promotion and final graph sequencing remain later authorized integration work, not open Areas 3–4 research findings. |

The primary Areas 3 and 4 JSON records also now convert their eight former `unresolved_gaps` into four explicit dispositions per area (downstream programme/display gates, credential boundaries, local-inference limits, and source/link handling). Both area records have `unresolved_gaps: []`; candidates remain hidden and no canonical or graph work was performed.

### Files changed in this continuation

- `data/career-mapping/_audit/d078_area_enrichment_lanes_2026_10_10/D078_AREAS_03_04_EMERGING_TASKS_SUPPLEMENT_2026_10_10.json`
- `data/career-mapping/_audit/d078_area_enrichment_lanes_2026_10_10/D078_AREAS_03_04_ENRICHMENT_CHECKPOINT_2026_10_10.json`
- `docs/manual-review/d078_area_enrichment_lanes_2026_10_10/D078_AREAS_03_04_ENRICHMENT_CHECKPOINT_2026_10_10.md`

The work remains a hidden research-candidate handoff: no canonical taxonomy, student visibility, role-fit assignment, shared dependency graph or subject matcher was changed.

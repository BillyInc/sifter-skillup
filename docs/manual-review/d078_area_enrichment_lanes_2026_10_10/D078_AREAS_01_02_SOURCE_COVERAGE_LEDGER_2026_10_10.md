# D078 Areas 1–2 source coverage ledger

**Audit date:** 2026-10-10  
**Scope:** evidence audit of the existing hidden research-candidate lane for Sociology and Social Anthropology (Area 1) and Economics and Applied Economic Analysis (Area 2).  
**Inputs:** `D078_AREAS_01_02_DEEP_ENRICHMENT_2026_10_10.json` and its companion checkpoint.  
**Disposition:** FINAL RECORD-LEVEL AUDIT CLOSED, 2026-10-10. This ledger adds no typed items and changes no canonical lane, graph, taxonomy, role-fit, SQL, UI or subject matcher. Candidate records remain hidden with explicit evidence/ownership reasons below. This ledger is the detailed evidence register for the matching closure state in `D078_AREAS_01_02_DEEP_ENRICHMENT_2026_10_10.json` and supersedes the earlier incomplete checkpoint language.

## Claim-to-source coverage

Grades used here describe what a source can support: **A** = primary official/professional rule, source dataset or direct research report; **B** = peer-reviewed or professional methods evidence; **C** = credible teaching/explanatory resource; **D** = occupational/task corroboration in a non-Nigerian jurisdiction; **E** = experimental/preprint evidence. Grade is not a quality score for the proposed item. “Fit” concerns whether the cited source supports the specific task claim, not merely whether it mentions the topic.

| Existing task family / item claims | Existing source tie and grade | Audit finding: locators, access and fit | Context and limitation to retain | Free learning / actionable source lead |
|---|---|---|---|---|
| **SOC-01** bounded qualitative field inquiry; SOC-K1, SOC-M1 | O*NET Sociologists [D]; OpenStax Sociology Ch. 2 [C] | Both pages resolved in the access check. O*NET task list directly names research, interviews, observation and document review; use as occupational example only. OpenStax locator is a chapter landing page rather than a narrower section locator. Supports introductory method choices; not every sociology route. | O*NET is U.S. occupational evidence. OpenStax is introductory, not a work standard. Nigerian ethics review conditions remain institution- and study-specific. | OpenStax is a free intro. Add the Open University’s free *Conducting qualitative interviews* as a more actionable field-interview resource; its sections cover preparation, consent, asking questions, fieldnotes, storage and anonymisation. It does not teach observation comprehensively or replace local ethics review. |
| **SOC-02** interpret/compare qualitative material; SOC-M2, SOC-C2 | OpenStax [C]; TUM computational social science [B]; APA *Qualitative Psychology* policy [A, journal policy] | OpenStax chapter page is accessible but broad. TUM page could not be directly opened in this check; existing locator identifies LLM text annotation/coding, validity, human comparison, bias and uncertainty, which supports the emerging AI edge, not general qualitative thematic analysis. APA page resolved; it is a journal submission policy, not a general methods standard. Existing core claim has introductory rather than specialist coding-method evidence. | Preserve the distinction between interpretation and software/LLM output. APA restrictions apply to one journal. Do not generalise to all qualitative research. No direct Nigeria-specific coding standard found in this search. | Current free learning link is OpenStax (introductory only). UK Data Service qualitative-data learning materials are an actionable supplementary lead for contextualised qualitative data and secondary analysis; not a complete coding course. |
| **SOC-03** digital text/trace analysis; SOC-T1, SOC-S1 | SGSSS course repository [C]; SICSS curriculum [C]; UK Data Service computational social science [C/B] | All three pages resolved. Existing locators identify course README/notebooks, SICSS ethics/digital-trace/text-analysis days, and UKDS text-mining/API/ML sections. Fit is good for method family and free learning; exact code/API examples and access terms need implementation-time recheck. | Global methods; neither online text nor Nigerian-language content is inherently representative. UKDS explicitly warns some platform-specific examples age. | Free task-specific routes exist. No verified free resource specific to Nigerian language NLP or validation across Nigerian languages was located in this bounded search. |
| **SOC-04** human-validated AI annotation; SOC-A1, SOC-C3 | TUM [B]; APA journal policy [A, narrow policy]; SGSSS [C] | TUM direct access failed; APA resolved. TUM’s described research agenda supports “emerging research”, not routine practice. APA supports risk/disclosure cautions within its journal scope. SGSSS teaches text analysis but does not, from the cited locator, teach the exact AI annotation and validation workflow. The evidence tie is adequate for a hidden emerging candidate, incomplete for hands-on learning. | Keep human accountability, task-specific validation, model/version and local-language coverage limits. Do not imply Nigerian-language performance or consensus practice. | SGSSS is adjacent free learning, not an exact AI annotation course. No official/professional free course for the precise workflow was verified. |
| **SOC-05** mechanism-based agent simulation; SOC-M3, SOC-T2, SOC-A2 | Casevo preprint [E]; Mesa official docs [A for software function]; AEA AI Agents update [B/horizon scan] | arXiv page resolved; Mesa docs resolved and redirected to “latest” docs (current docs version may change). Casevo paper/repository support prototype identity and its U.S. election-debate example only; not external validity. Repository LICENSE/GitHub classifier says Apache-2.0; `pyproject.toml` says MIT. v0.3.19 release lists three assets, whose embedded metadata were not inspected; PyPI project URL returned 404. AEA update supports horizon-scan status only. | Simulation assumptions are researcher-specified. Synthetic agents are not a Nigerian population, human participants or validated forecast. Package/release reuse terms, installation/runtime, API availability, cost and privacy terms are not established. | Mesa Getting Started remains the free hands-on ABM resource. Casevo repository is reclassified as read-only evidence, not a free learner resource; keep the specific tool record hidden. Reopen on reconciled release licensing and tested/documented runtime. |
| **SOC-06** AI-assisted survey drafting/translation and cognitive pretesting; SOC-M4, SOC-C4 | AAPOR AI report [A, professional task-force guidance]; AAPOR best practices [A, professional guidance] | PDF resolved (101 pages); the stored locator to AI question drafting/editing/translation (section 3.4, pp.25–27) and oversight/evaluation (section 4, pp.30–47) is sufficiently specific. Best-practices page resolved; cognitive interviewing/pretesting is an appropriate tie. AAPOR reports are professional guidance, not law. | U.S.-based professional body. Does not validate Nigerian-language translation. Cognitive pretest problems are diagnostic; small pretests do not establish validity or representativeness. Area 6 overlap is already disclosed in the source lane and still requires reconciliation. | Free professional guidance is available. Newly surfaced AAPOR interactive report is a navigable alternative, but not a separate evidence claim. Nigeria-specific speaker review and current NDPC/data-handling rules are prerequisites for local use where applicable. |
| **ECON-01** describe conditions with indicators/data; ECON-K1, ECON-S1 | CORE Econ [C]; NBS NLSS 2018/19 [A, official dataset]; NISER Economic Intelligence Report 2026 [A, institutional report] | CORE pages resolved, redirecting to current book host. NBS catalogue resolved and contains documentation/questionnaires/weighting context. NISER report page resolved. Good fit for economic concepts and applied data context, but the 2018/19 survey is dated and cannot support current-period conditions. | Nigeria examples are genuinely local; no single survey/indicator captures all welfare or informal activity. NISER report is a dated institute product, not an occupational standard; underlying indicators/methods still need appraisal. | CORE Econ/Doing Economics are free project-based learning. NBS’s current Nigeria Labour Force Survey catalogue provides a more recent data/documentation exercise than NLSS 2018/19, with survey design and variable context; it is not a substitute for checking release vintage and access terms. |
| **ECON-02** estimate/evaluate a relationship or intervention; ECON-M1, ECON-C1 | *The Effect* open book [C] | Page resolved. The learning locator should identify its design/causality chapters rather than only the book landing page. Strong for explanatory methods and design limits; source is a teaching text, not a professional competency standard. AEA AI-covariate paper is only relevant when generated measures enter the estimate, not to causal design in general. | Preserve “causal only if design assumptions support it”; descriptive analysis remains a valid alternative. No Nigeria-specific causal inference source needed to establish a globally used method, but application needs local data/design evidence. | Free *The Effect* chapters with R/Stata/Python examples. The current link is actionable but should be pinned to the selected chapter(s) before any learner display. |
| **ECON-03** forecast/nowcast with uncertainty; ECON-M2 | NISER EIR 2026 [A, contextual report]; AEA generative-AI research review [B, general AI use cases] | Both linked pages resolved (AEA review page; NISER report page). **Material source-fit gap:** neither citation directly establishes forecasting/nowcasting method or uncertainty evaluation. NISER is an applied economic outlook example; AEA’s genAI review is not a forecasting methods source. JSON’s task-family learning field should be checked against the prose’s FPP3 link; FPP3 is absent from the 23-record source registry despite being cited in the prose. | Nigeria report illustrates local outlook work only. Avoid treating a forecast as a promise or NISER projection as independently validated method. | FPP3 is free, task-specific forecasting instruction and was resolved, but it is missing from the machine-readable source register. New actionable evidence leads: IMF *Nowcasting and Near-Term Forecasting Cambodia’s Economy* (working paper; mixed-frequency and developing-country workflow) and IMF capacity-development Nowcasting course (prerequisite-heavy, aimed at public officials). Neither establishes Nigeria-specific practice. |
| **ECON-04** AI/ML-generated economic measures and valid inference; ECON-A1, ECON-C2 | AEA AI/ML-generated covariates paper [A/B, professional scholarly article]; AEA GenAI review [B]; NBS NLSS [A, dataset context] | AEA article page resolved; the cited 2026 guide directly warns that measurement error in generated covariates can bias estimators and inference. The NBS NLSS is a possible data source/example, not evidence for AI-generated measures. GenAI review is general background. The strongest direct claim is supported. | Keep it an emerging specialist method. Prediction accuracy alone is insufficient; validation population/language and downstream inferential effect matter. No Nigeria-specific validation evidence surfaced. | The AEA paper and its ValidMLInference examples are the best exact free technical lead if access remains open. Do not describe this as a broadly required economics competency. |
| **ECON-05** bounded GenAI research microtasks; ECON-A2, ECON-C3 | AEA GenAI review [B]; AEA agent update [B/horizon scan]; APA journal policy [A, narrow policy] | AEA article and PDF resolved. The review directly surveys economic research use cases; the agent update is explicitly horizon-scan material. APA is only a journal policy comparator and is a weak fit for economics-specific governance claims. AEA Data and Code policy resolves but applies to AEA publication, not all work. | Keep optional, bounded and checked. Publisher, employer, institution and jurisdiction policies differ; confidentiality and tool-use conditions need local checks. | AEA review is free/useful orientation. Exact microtask tutorials are not established by the sources. The AEA publication policy is not a universal student/employer rule. |

## Existing source register audit

All 23 source IDs in the lane were checked against their stated role and locator. “Resolved” means the cited page/PDF returned through web access on the audit date; “partial” means search/index text supported a locator but direct opening failed or the page was not fully inspectable.

| Source IDs | Evidence grade | Access / locator result | Disposition |
|---|---|---|---|
| ONET_SOCIOLOGISTS | D | Resolved; task table and detailed activities visible. | Retain as U.S. task-scope corroboration only. |
| OPENSTAX_SOCIOLOGY_METHODS | C | Resolved; Chapter 2 page. | Retain; locator can be made more precise if a claim needs one section. |
| SGSSS_TEXT_ANALYSIS | C | Resolved; repository. | Retain; check materials/links before display. |
| SICSS_CURRICULUM | C | Resolved; curriculum page. | Retain; check prerequisites and platform-specific currency. |
| UKDS_COMPUTATIONAL | C/B | Resolved; learning hub. | Retain with platform/API currency caveat. |
| TUM_CSS_LLM | B | Partial; direct open failed. | Claim locator is plausible from the checked record but needs a direct revisit before display. |
| APA_QUAL_AI_POLICY | A, narrow policy | Resolved; journal AI policy. | Retain only as journal-specific risk/policy evidence. |
| AAPOR_AI_SURVEY | A, professional guidance | Resolved; 101-page PDF. | Retain; stored page/section locator is actionable. |
| AAPOR_SURVEY_BEST_PRACTICES | A, professional guidance | Resolved; best-practices page. | Retain; cite cognitive interviewing/pretesting subsection for SOC-C4. |
| CASEVO_PAPER | E | Resolved; arXiv abstract/full paper record. | Retain as experimental prototype evidence only. |
| MESA_FRAMEWORK | A, official software documentation | Resolved; redirected to latest docs. | Retain for software function; pin version at implementation. |
| AEA_GENAI_ECON | B | Resolved; AEA article page. | Retain for economics research use cases; not forecasting method evidence. |
| AEA_AI_COVARIATES | A/B | Resolved; AEA article page. | Retain for generated-covariate measurement-error claim. |
| AEA_AI_AGENTS_UPDATE | B, horizon scan | Resolved; PDF. | Retain only for emerging/experimental status. |
| AEA_DATA_CODE_POLICY | A, publication policy | Resolved. | Retain only within AEA publication scope. |
| CORE_DOING_ECON | C | Resolved; redirected to CORE books host. | Retain as free task-based data learning; verify selected project/module. |
| FPP3 | C | Resolved, but **not in source registry**. | Register as a missing existing citation before future machine-readable use. |
| EFFECT_CAUSAL | C | Resolved. | Retain; pin selected chapter(s) for precise learning locator. |
| CORE_ECON_OPEN | C | Resolved; redirected to CORE books host. | Retain for introductory concepts, not applied econometrics. |
| NBS_NLSS | A, official dataset | Resolved; catalogue and documentation. | Retain with 2018/19 vintage and weights/access caveats. |
| NISER_EIR_2026 | A, institutional report | Resolved. | Retain as a Nigeria applied-economics example, not a methods standard. |
| NISER_POLICY_BRIEFS | A, institutional output examples | Partial; direct page open failed. | Treat as unverified access in this audit; it is not necessary to substantiate a general occupation claim. |
| OPENSTAX_ECON | C | Resolved at book detail page. | Retain for introductory concepts only. |

## New source leads found in official/professional search

These sources fill documentation, contextual or learning gaps; they do not create new items or approve existing candidates.

| Source | Grade / locator | Actionable contribution | Boundaries |
|---|---|---|---|
| [Nigeria Data Protection Act 2023 — NDPC](https://ndpc.gov.ng/download/nigeria-data-protection-act-2023) and [NDPC FAQs](https://ndpc.gov.ng/faqs/) | A, primary law/regulator; Act text and FAQ sections on scope, personal data and processing | Nigeria-specific source for personal-data governance claims in interview, trace-data, AI and survey work. The NDPC resources page also lists current official material. | This audit could not directly open the Act download; search-index result verified the official landing page. The FAQ is explanatory, not a substitute for reading the Act or institutional advice. Applicability depends on data and processing. |
| [National Code of Health Research Ethics v7](https://www.nhrec.net/nhrec/National_Code_for_Health_Research_Ethics_v7.0.pdf) | A, primary NHREC code; Section A scope and Section B exemptions | Strong Nigeria source when a project qualifies as health research involving human participants; useful for distinguishing protocol review from generic ethical practice. | Scope is health research; do not extend it automatically to all sociology/economics fieldwork. Direct PDF open failed in this check; search result confirmed the current official code and scope. Check institutional REC/ NHREC position for ambiguous studies. |
| [NBS Data Privacy Policy](https://nigerianstat.gov.ng/page/data-privacy-policy) | A, official statistical microdata policy; microdata categories and confidentiality | Actionable Nigeria example for public-use, licensed and on-site microdata and disclosure controls; strengthens data-access and confidentiality context. | NBS policy describes NBS release practice, not a general research law. Page resolved. |
| [NBS Nigeria Labour Force Survey Q2 2024–Q2 2025 catalogue](https://microdata.nigerianstat.gov.ng/index.php/catalog/152/related-materials) | A, official survey and documentation; study description, sampling, questionnaire and instruction manual | Current local economic-data appraisal exercise; documentation identifies survey scope, field practice, pretest/pilot, data processing and analysis. | Catalogue and materials evolve; the survey reference period is explicit and does not make the figures current beyond that period. Direct related-materials endpoint was partial, while official search/catalogue pages were accessible. |
| [OpenLearn: Conducting qualitative interviews](https://www.open.edu/openlearn/education-development/conducting-qualitative-interviews-introduction/content-section-0) | C, university-authored open course; sections 2–4 | Free, directly actionable preparation/conduct/aftercare route, including ongoing consent, reflective fieldnotes, storage and anonymisation. | Introductory and authored in a health/social care setting; not Nigerian law or a substitute for local ethics approval. Page resolved. |
| [IMF Nowcasting course](https://www.imf.org/en/capacity-development/training/icdtc/schedule/ct/2022/nwcct22-08v) and [IMF Cambodia nowcasting/near-term forecasting paper](https://www.elibrary.imf.org/view/journals/001/2024/147/article-A001-en.xml) | A, official training description; B, IMF working paper | Directly supports forecast/nowcast task mechanics, mixed-frequency/high-frequency indicators and performance evaluation. The course is hands-on and describes prerequisites; the working paper gives a developing-country example. | IMF course is aimed at experienced officials and expects time-series/econometrics background. Cambodia case is not evidence of Nigerian applicability. Page/search content resolved. |
| [IMF Nigeria GDP nowcasting paper](https://www.imf.org/-/media/Files/Publications/WP/2022/English/wpiea2022088-print-pdf.ashx) | B, IMF working paper; exact section and title need confirmation before use | Search surfaced Nigeria-specific GDP nowcasting work, potentially the best local method/application bridge for ECON-03. | Title/locator and claims were not fully verified in this audit; treat as a research lead, not evidence yet. |
| [AAPOR reports directory](https://aapor.org/publications-resources/reports/) | A, professional body; current report entry | Directory confirms both PDF and newer interactive format for the 2026 responsible-AI report, useful for selecting an accessible learning format. | Report remains U.S.-based professional guidance. Page resolved. |

## Historical checkpoint source-family register (superseded below)

The following was the preliminary checkpoint state. Its incomplete/pending language is superseded by the final record-level outcomes and reopening-evidence matrix below. The final audit closes only the bounded claims and listed records; it does not claim that no additional sources exist.

| Source family | Search/check made on 2026-10-10 | Result / remaining work |
|---|---|---|
| Official and professional task/method sources | O*NET; AEA; AAPOR; APA; TUM; Mesa; NBS; NISER; IMF; NDPC; NHREC | Core task families have some support. Direct Nigeria-specific rules and local language method evidence remain incomplete; TUM/NDPC/NHREC direct access needs a retry. |
| Free university and professional learning | OpenStax; CORE Econ; OpenLearn; SGSSS; SICSS; UK Data Service; FPP3; The Effect; AAPOR | Useful free links exist, but precise module-to-claim checks remain for a subset. Several exact software/AI workflows have no verified free course. |
| Nigeria data and official-statistics context | NBS NLSS 2018/19; NBS NLFS catalogue; NBS microdata policy; NISER EIR | Nigeria-specific data context is present. NLSS is dated; current labour survey docs are a promising alternative. Need assess data access/licence/weights at learner-use time. |
| Human-participant ethics and personal data | NDPC Act/FAQ; NHREC Code v7; NBS privacy policy; AAPOR report | Actionable sources surfaced. NHREC code is scoped to health research; coverage for non-health social research must be determined institution by institution. This is not a complete law/ethics register. |
| Forecasting and nowcasting | FPP3; IMF capacity-development course; IMF working papers; NISER EIR | Found a material source-fit gap and direct method sources. Verify the IMF Nigeria paper title, exact locator, version and claim before relying on it. Nigeria-specific forecaster practices are not fully mapped. |
| Nigerian/local-language computational social science | Searches for Nigerian-language NLP and locally validated methods; checked SGSSS/SICSS/UKDS | No sufficiently verified official/professional free resource located in this pass. Do not infer model performance across Nigerian languages. A dedicated source-family search is still needed. |
| Agent-based and LLM-agent simulation | Casevo, Mesa and AEA agent update | Historical summary only. Final Casevo outcome below: prototype supported; learner installation/reuse not established, hidden/read-only due to source/package license conflict and unverified runtime/API/cost/privacy. |
| Certifications / formal qualification standards | No certification claim or candidate exists in the lane | Closed not-applicable: lane proposes no certification and asserts no credential requirement. Reopen only if a named programme/role/authority source establishes a credential claim. |

## Final record-level disposition — supersedes the incomplete checkpoint

The overlap JSON contains 74 `source_records`, 36 typed candidates, and 26 current unique learning-resource IDs referenced 39 times. Casevo was removed from the free/task-specific learning-resource set and retained as explanatory/source evidence only; Mesa Getting Started is the practical resource. The earlier count of 27 included Casevo as a learning resource and is superseded here. Per-record URL, locator, jurisdiction, claim use, and limitation remain attached to each `source_id`. The table below gives a final outcome for every source record. “Retain” means usable only for the recorded bounded claim; “limited” means context/reference/tool/preprint only; “replace” or “exclude” closes an inadequate/compromised source; “not established” closes an unsupported broader claim and keeps it hidden.

### Per-record outcome: all 74 overlap source records

| # | Source ID | Final outcome |
|---:|---|---|
| 1 | UNESCO_ISCED | Retain for international disciplinary-field boundaries only; no occupational or competency mandate. |
| 2 | ISCED_ECON | Retain for economics field classification only. |
| 3 | ONET_ECONOMIST | Retain as U.S. task-scope corroboration; no Nigerian/universal job claim. |
| 4 | OPENSTAX_METHODS | Retain as introductory methods learning; partial for thematic coding. |
| 5 | OPEN_ANTHRO_FIELDWORK | Retain as open fieldwork reading; no Nigerian protocol. |
| 6 | AAA_ETHICS | Retain as professional ethics reference; not Nigerian law or approval. |
| 7 | AAA_CONSENT | Retain for consent principles; local requirements remain study-specific. |
| 8 | AAA_FIELDWORK | Retain for bounded fieldwork examples; not comprehensive standard. |
| 9 | UKDS_QUALITATIVE | Retain as hub/reference, not a complete course. |
| 10 | UKDS_SECONDARY_QUAL | Retain for teaching secondary qualitative analysis. |
| 11 | UKDS_SECONDARY_START | Retain as exact provenance/context module. |
| 12 | UKDS_DATA_SKILLS | Retain for data governance; not synthetic-participant or LLM validation training. |
| 13 | UKDS_RDM | Retain as data-management series; not version-control training. |
| 14 | UKDS_COMPUTATIONAL | Retain as CSS hub/workshop; APIs age; not exact LLM-validation course. |
| 15 | UKDS_INTERVIEW_TEACHING | Replace: index is not a module; OpenLearn interview course verified. |
| 16 | GOVUK_FOCUS_GROUP | Retain as UK digital-health focus-group guidance, not Nigerian protocol. |
| 17 | GOVUK_DOCUMENT_ANALYSIS | Repaired/retain: ACSS QAT5 §5.1.5.2(d) resolves and supports document analysis. |
| 18 | KOBO_DATA_COLLECTION | Retain for web/Android/offline tool operation, not survey design. |
| 19 | KOBO_ABOUT | Retain for product context only. |
| 20 | TAGUETTE_OFFICIAL | Retain for feature claims; check maintenance/deployment. |
| 21 | TAGUETTE_GUIDE | Retain for setup only, not methods curriculum. |
| 22 | NVIVO_VENDOR_OVERVIEW | Retain for vendor identity only; license/pricing/edition require checking. |
| 23 | NELSON_LLM_CODING_2025 | Retain as research evidence, not endorsement/course. |
| 24 | EPJDS_LLM_CODING_2025 | Retain as narrow hybrid-coding evidence; prompt/task limits apply. |
| 25 | ASHWIN_LLM_BIAS_2026 | Retain as counter-evidence on annotation bias; not universal rejection. |
| 26 | LLM_SYNTHETIC_DATA_PNAS_2026 | Retain for heterogeneity/compression caution; synthetic output is not human evidence. |
| 27 | LLM_HUMAN_PARTICIPANT_DIVERSITY | Retain as model/task-specific simulated-participant evidence only. |
| 28 | UNESCO_GENAI | Retain as high-level governance guidance; not Nigerian approval or discipline standard. |
| 29 | GEPHI_QUICKSTART | Retain as exact official tool tutorial; no network validity claim. |
| 30 | EDINBURGH_GEPHI_COURSE | Replace: event page Cloudflare-blocked; Gephi Quickstart verified for basics. |
| 31 | QUANTEDA_TUTORIALS | Retain as exact R text tutorial; examples use quanteda 3.2.5, check version. |
| 32 | NISER_METHODS | Exclude: page contains unrelated injected SEO/casino material; await institute repair. |
| 33 | NISER_EIR_2026 | Retain as dated Nigerian applied-economics example only; separate page not implicated. |
| 34 | NISER_MACRO_MODEL | Retain as existence of local macro-model task; not independent validation. |
| 35 | NISER_ECON_TRAINING | Exclude: same compromised URL as NISER_METHODS. |
| 36 | NISER_PUBLICATIONS | Retain as illustrative publication archive only. |
| 37 | AFROBAROMETER_NIGERIA | Retain for bounded Nigerian survey/public-attitude analysis, not national accounts. |
| 38 | NHREC_CODE_SCOPE | Retain as health-research code only; not blanket non-health ethics rule. |
| 39 | ONET_SOCIOL | Retain as U.S. task-scope corroboration only. |
| 40 | WB_IMPACT_EVALUATION | Retain for conventional evaluation learning; not causal ML. |
| 41 | AEA_CAUSAL_ECONOMETRICS | Retain as scholarly methods evidence; not universal protocol/course. |
| 42 | CORE_DOING_ECONOMICS | Retain for selected open projects; not macro-nowcasting curriculum. |
| 43 | CORE_R_EXPERIMENT | Retain as exact R project workflow, not broad econometrics. |
| 44 | CORE_PYTHON_WELLBEING | Retain as exact Python application, not Python basics. |
| 45 | OPENLEARN_ECON | Retain as introductory concepts only. |
| 46 | DIME_AI | Retain as AI-in-development-research examples; transfer to Nigeria unproven. |
| 47 | DIME_RESEARCH | Retain as evaluation-method examples, not universal task. |
| 48 | NBER_DEEP_LEARNING_ECON | Retain as specialist working-paper frontier, not settled practice/course. |
| 49 | NBS_CATALOG | Retain as official data discovery; dataset-specific metadata/access govern. |
| 50 | NBS_NLFS | Retain-limited: catalogue/search results verify Q2 2024 documentation; direct materials fetch timed out. Period/access are bounded; no open microdata claim. |
| 51 | WB_REPRODUCIBLE | Retain as World Bank policy example, not universal rule. |
| 52 | MESA_DOCS | Retain for software function only; no model-validity claim. |
| 53 | MESA_GETTING_STARTED | Retain as exact free implementation tutorial; not calibration/validation. |
| 54 | MESA_ABM_EXPLAINER | Retain-limited as older method explainer; current docs take precedence. |
| 55 | CASEVO_PAPER | Retain as 2024 preprint/prototype evidence only. |
| 56 | CASEVO_REPOSITORY | Prototype/setup claims verified from README; repository LICENSE and GitHub classifier say Apache-2.0, package metadata says MIT, release assets not inspected, PyPI URL 404. Learner installation/reuse not established; API key/cost/access/runtime/privacy unverified. Hidden/read-only. |
| 57 | ASA_ETHICS_CODE | Retain-limited: official U.S. ethics PDF surfaced via search; direct path returned 403. |
| 58 | ISA_ETHICS_CODE | Retain as professional ethics principles; 2001 code is not local law or exhaustive. |
| 59 | ASA_UK_ETHICS_2021 | Retain-limited: official PDF surfaced, HTML path robots-blocked; not Nigerian protocol. |
| 60 | NASA_NIGERIA | Retain for association-attributed local context, not regulator/technical standard. |
| 61 | NES_NIGERIA | Retain for professional context, not statutory task list. |
| 62 | AEA_CODE | Retain for AEA conduct policy only, not Nigerian law. |
| 63 | UKDS_SURVEY_DATA | Retain as survey-data hub, not Nigerian protocol. |
| 64 | UKDS_SURVEY_TRAINING | Replace/bound: NCRM orientation exists, but launch target unverified; do not count as full design course. AAPOR/NBS links cover bounded needs. |
| 65 | UKDS_R_SURVEY_GUIDE | Retain as exact R/weights/design guide; British dataset requires substitution. |
| 66 | R_SURVEY_PACKAGE | Retain as implementation docs, not course or design decision. |
| 67 | NBS_GHS_PANEL | Retain as official Nigerian panel context; check wave-specific weights/access. |
| 68 | NBS_GDP_METHODOLOGY | Retain as actual Nigerian methodology; NBS identifies SNA 2008/ISIC Rev.4. |
| 69 | AAPOR_RESPONSIBLE_AI_2026 | Retain for exact survey AI drafting/translation/oversight sections; U.S. guidance, no Nigerian-language validation. |
| 70 | AAPOR_BEST_PRACTICES | Retain for wording/cognitive pretest guidance; professional, not binding standard. |
| 71 | UN_2025_SNA | Retain as international standard; does not establish Nigeria implementation. |
| 72 | UN_SNA_CAPACITY_RESOURCES | Retain as official index only; not one exact learner lesson. |
| 73 | ILO_LABOUR_STATISTICAL_STANDARDS | Retain as standards index; use exact ICLS document and survey implementation. |
| 74 | IMF_GFSM_UPDATE | Retain as specialist fiscal-statistics reference; GFSM update/country adoption vary. |

The base package’s 23 source records were also reconciled: O*NET_Sociologists = U.S.-only task comparator; OpenStax = introductory methods; SGSSS/SICSS/UKDS = open materials with platform/prerequisite limits; TUM = partial/direct access issue and emerging LLM evidence only; APA = one journal’s policy; AAPOR = U.S. professional survey guidance; Casevo/Mesa = preprint/tool evidence (Casevo learner use not established); AEA items = economics research/policy sources with individual scope; CORE/The Effect/FPP3 = learning, not occupation standards; NBS/NISER = bounded local data/report context; NISER methodology page excluded as compromised. FPP3 was already present in the 23 records; prior statement that it was missing is withdrawn. The two artifacts contain 97 source registrations and 89 normalized unique URLs; six URLs are shared across artifacts.

### Per-link disposition: all 26 current unique learning IDs / 39 references

| Learning ID | Outcome | Final fit statement |
|---|---|---|
| OPENSTAX_METHODS | verified, introductory | Research/method orientation; partial for thematic analysis. |
| AAA_ETHICS | verified, reference only | Professional ethics, not a course or Nigerian approval rule. |
| OPEN_ANTHRO_FIELDWORK | verified | Open fieldwork/participant-observation chapter; no Nigeria protocol. |
| UKDS_INTERVIEW_TEACHING | replaced | Generic hub only; use OpenLearn’s exact interview course. |
| KOBO_DATA_COLLECTION | verified | Official digital/offline form guide; not sampling or questionnaire design. |
| TAGUETTE_GUIDE | verified | Tool FAQ/setup, not methods teaching. |
| UKDS_QUALITATIVE | verified as hub | Useful collection of materials, not exact coding curriculum. |
| UKDS_COMPUTATIONAL | verified as hub/workshop | CSS materials; not human-validated LLM coding course; API examples can age. |
| UKDS_SECONDARY_START | verified, exact | Provenance, collection context and secondary-analysis entry module. |
| GOVUK_DOCUMENT_ANALYSIS | repaired, exact section | ACSS QAT5 §5.1.5.2(d), document analysis and triangulation; UK methodological guidance. |
| UKDS_SURVEY_TRAINING | not relied upon as course | NCRM orientation page exists, but launch target unverified and scope is not full instrument design. |
| UKDS_R_SURVEY_GUIDE | verified, exact | R import, estimates, weights/design variables; UK data example. |
| AAPOR_BEST_PRACTICES | verified, professional guide | Wording and cognitive pretesting; not AI-specific or Nigerian-language validation. |
| GEPHI_QUICKSTART | verified, exact | Tool setup, import, layout, statistics, filters; no network validity inference. |
| QUANTEDA_TUTORIALS | verified, exact technical tutorial | R corpus/tokens/DFM/scaling/classification/topics; examples use quanteda 3.2.5. |
| UKDS_DATA_SKILLS | verified, adjacent | Consent, ethical sourcing and anonymisation; not synthetic-agent/LLM validation training. |
| CORE_DOING_ECONOMICS | verified, selected projects | Project hub; not general macro forecast/nowcast course. |
| WB_IMPACT_EVALUATION | verified, conventional methods | Evaluation design and causal methods; not causal ML. |
| CORE_R_EXPERIMENT | verified, exact project | R analysis of experimental data; one workflow. |
| CORE_PYTHON_WELLBEING | verified, exact project | Python wellbeing/data example; not language fundamentals. |
| UKDS_RDM | verified, guidance series | Research-data planning/governance/sharing; not version control. |
| WB_REPRODUCIBLE | verified, institutional guidance | Research-package/reproducibility example; not LLM synthesis instruction or universal policy. |
| UN_SNA_CAPACITY_RESOURCES | verified as index | Official resource directory; no single exact course/module locator. |
| ILO_LABOUR_STATISTICAL_STANDARDS | verified as index | Standards reference; use exact ICLS material and survey implementation. |
| IMF_GFSM_UPDATE | verified as specialist reference | GFSM concepts/update; not course or credential. |
| MESA_GETTING_STARTED | verified, exact | ABM implementation basics; no validation/calibration training. |

Replacement resources audited in the checkpoint are not counted among the original 27 IDs: OpenLearn qualitative interviews (verified free, exact sections); NBS NLFS Q2 2024 documentation/methodology/questionnaire/manual (Nigeria-specific, access-bounded); and IMF WP/21/124 plus FPP3 sections (forecast method and historical Nigeria example). These repairs do not create extra candidates.

### Per-item evidence disposition: all 24 base-package typed items

The cited evidence IDs and learning IDs are the exact arrays in the base JSON. Every row below records a final claim disposition; every item remains hidden because this lane does not assign a canonical role/programme owner or student approval.

| Item ID | Final evidence disposition | Resource and hidden-state reason |
|---|---|---|
| SOC-K1 | Bounded support: O*NET task context is U.S.-only; OpenStax supports introductory concepts. | OpenStax is verified orientation; no programme or role mapping. |
| SOC-M1 | Bounded support for interviews/observation as method choices. | OpenLearn repairs interview learning; open anthropology chapter supports introductory observation/fieldwork only. |
| SOC-C1 | Supported ethical practice; APA policy narrowed to one journal; local institution routes added. | SICSS is adjacent learning, not ethics approval; no national non-health route established. |
| SOC-M2 | Supported qualitative coding as an area method; TUM evidence applies only to emerging LLM use. | No exact free thematic-coding course found; keep software/AI distinct from interpretation. |
| SOC-C2 | Bounded support for reflexive, traceable interpretation; TUM is emerging and APA narrow. | SICSS/UKDS are adjacent, not a full course; hidden pending ownership. |
| SOC-T1 | Supported optional Python/R computational text workflow. | SGSSS/UKDS materials are learning routes; platform/language coverage does not establish validity. |
| SOC-S1 | Supported computational text-preparation/analysis methods. | SGSSS/quanteda/UKDS resources are bounded; Nigerian-language empirical sources are task-specific only. |
| SOC-A1 | Bounded emerging support from research papers and TUM; counter-evidence retained. | No exact free human-validation course; keep optional and hidden. |
| SOC-C3 | Bounded support for model/data validation and governance. | No exact course or universal disclosure rule; local data/ethics controls remain applicable. |
| SOC-M3 | Supported ABM method family; Casevo is experimental evidence only. | Mesa tutorial teaches mechanics, not calibration, external validity or empirical truth. |
| SOC-T2 | Supported tool identity/function from Mesa primary documentation. | Exact tutorial verified; optional tool, not proof of competence. |
| SOC-A2 | Prototype existence supported; Casevo learner installation and reuse are not established. | Repository LICENSE says Apache-2.0; package metadata says MIT; release metadata and runtime/cost remain unverified. Hidden/read-only; Mesa is the free hands-on alternative. |
| SOC-M4 | Bounded emerging support from AAPOR report on AI question writing/translation. | AAPOR is U.S. professional guidance; no Nigerian-language equivalence claim. |
| SOC-C4 | Supported cognitive pretesting as survey-quality method. | AAPOR guidance verified; small pretest cannot establish validity or representativeness. |
| ECON-K1 | Bounded support for economic concepts and indicator reasoning. | CORE/OpenLearn are introductory; Nigerian report is a dated example, not standard. |
| ECON-S1 | Supported data appraisal/descriptive analysis, including official NBS catalogue examples. | CORE projects teach selected workflows; NBS access/design is release-specific. |
| ECON-M1 | Supported specialist econometric/causal design with assumptions. | The Effect/AEA/WB support method family; pin exact The Effect chapters before any learner display. |
| ECON-C1 | Supported inference/claim discipline; causal and predictive claims remain distinct. | Existing resources are adjacent methods reading, not a credential or role mapping. |
| ECON-M2 | Repaired: FPP3 sections support intervals/evaluation/scenarios; IMF WP/21/124 directly supports historical Nigeria nowcasting example. | FPP3 was already in source registry. IMF estimates are COVID-era, not current or official forecast. |
| ECON-T1 | Supported as a selectable R/Python data workflow. | CORE project links teach particular tasks; neither language is a universal requirement. |
| ECON-A1 | Bounded emerging support from AEA generated-covariate research. | Scholarly technical source, not beginner course; validation remains task-specific. |
| ECON-C2 | Bounded support for validation/reproducibility of generated measures. | AEA paper/code and policy are technical/reference materials, not guided course. |
| ECON-A2 | Bounded emerging support from AEA GenAI research review. | No exact microtask course; human verification and policy checks required. |
| ECON-C3 | Bounded support for verification/disclosure as conditional governance. | AEA/APA rules are organization-specific; no universal rule or role assignment. |

### Per-item evidence disposition: all 36 overlap-package candidates

Evidence IDs below match each `candidate_items` record in `AREAS_01_02_DEEP_ENRICHMENT_2026_10_10.json`. “Supported” is always bounded by the source’s task/jurisdiction and does not mean universally required or student-approved. Learning-resource outcomes are cross-referenced by ID in the preceding 27-link table.

| Item ID | Evidence disposition | Learning disposition | Final status |
|---|---|---|---|
| D078-SOC-QUESTION-DESIGN | UNESCO/UKDS support disciplinary and research design; NISER methods excluded. | OPENSTAX_METHODS introductory. | supported, area candidate; hidden for ownership/overlap. |
| D078-SOC-THEORY-CONTEXT | UNESCO + OpenStax support bounded sociological concept use. | OPENSTAX_METHODS introductory. | supported, no programme theory claim. |
| D078-SOC-ETHICS-REFLEXIVITY | AAA/UNESCO guidance; NHREC health-scoped; Nigerian university pathways established separately. | AAA_ETHICS is a reference, not training. | supported, local approval remains institution-specific. |
| D078-SOC-ETHNOGRAPHIC-FIELDWORK | AAA fieldwork and UNESCO classification support specialist method. | OPEN_ANTHRO_FIELDWORK verified. | supported, optional, not every sociology route. |
| D078-SOC-INTERVIEW-FOCUSGROUP | Professional/qualitative sources support both methods; NISER methods excluded. | UKDS hub replaced by OpenLearn; GOVUK focus-group guide bounded. | supported, learning repaired. |
| D078-SOC-KOBO-SURVEY-FIELD | Kobo primary docs verify collection functions. | KOBO_DATA_COLLECTION exact tool guide. | supported as optional tool only. |
| D078-SOC-THEMATIC-ANALYSIS | UKDS/OpenStax support the method family. | OpenStax introductory/partial; no full free coding course established. | supported method, course gap closed not-established. |
| D078-SOC-CAQDAS-TAGUETTE-NVIVO | Taguette docs and vendor page support distinct tool identities. | FAQ/setup and UKDS hub, not methods curriculum. | supported tools, no feature parity/license inference. |
| D078-SOC-LLM-ASSISTED-CODING | Nelson/EPJDS/Ashwin/UNESCO support emerging, mixed research evidence. | UKDS computational is adjacent; no exact free course found. | supported emerging candidate, hidden. |
| D078-SOC-SECONDARY-QUAL-ANALYSIS | UKDS source records directly support provenance-aware reuse. | UKDS_SECONDARY_START exact module. | supported, bounded by original data context/permissions. |
| D078-SOC-DOCUMENT-ANALYSIS | UKDS + GOVUK ACSS §5.1.5.2(d) support method. | GOVUK link repaired and exact section verified. | supported, UK method guidance only. |
| D078-SOC-SURVEY-DESIGN | UKDS/AAPOR and local institutional context support method family; NASA not a regulator. | NCRM launch unverified; AAPOR/NBS are bounded alternatives. | supported, resource link gap closed. |
| D078-SOC-SURVEY-ANALYSIS-R | UKDS guide/package/NBS panel support design-aware analysis. | UKDS_R_SURVEY_GUIDE exact; UK survey example. | supported, substitute target-survey weights/design. |
| D078-SOC-AI-SURVEY-QUESTION-DRAFTING | AAPOR 2026 report supports conditional AI workflow. | AAPOR professional guidance, not a course. | supported emerging, no local-language validation. |
| D078-SOC-DIGITAL-TRACE-ETHICS | UKDS/AAA/UNESCO support bounded provenance and ethical concerns. | UKDS hub is useful but platform examples age. | supported, public traces not representative by default. |
| D078-SOC-SOCIAL-NETWORK-ANALYSIS | UKDS and Gephi docs support task/tool option. | Gephi Quickstart verified; Edinburgh event replaced. | supported, no theory/causal claim from software. |
| D078-SOC-QUANT-TEXT-R | UKDS/Nelson plus quanteda support computational text analysis. | QUANTEDA_TUTORIALS exact, version-specific. | supported, validity depends on corpus/construct/language. |
| D078-SOC-LLM-SYNTHETIC-PILOT | PNAS/diversity/UNESCO support cautious pilot research only. | UKDS_DATA_SKILLS is adjacent, no exact course. | not established as human evidence/representative respondents; hidden experimental. |
| D078-ECON-ECONOMIC-REASONING | ISCED/O*NET/NISER EIR support bounded concepts and local example. | CORE projects/OpenLearn concepts. | supported; no universal occupational mandate. |
| D078-ECON-MEASUREMENT | O*NET/NBS catalogue/NLFS support economic data appraisal. | CORE selected projects; NBS adds local data documentation. | supported, definitions/vintage/access are dataset-specific. |
| D078-ECON-UNCERTAINTY-COMMUNICATION | O*NET/WB evaluation support bounded communication; NISER training excluded. | WB book is partial for general uncertainty. | supported, no exact course claim. |
| D078-ECON-APPLIED-ECONOMETRICS | AEA/O*NET support specialist method. | CORE R experiment and WB conventional evaluation. | supported, not required for every economic task. |
| D078-ECON-R-PYTHON-ANALYSIS | CORE project and WB reproducibility records support selectable workflows. | Exact project-specific R/Python links verified. | supported, choose one appropriate workflow. |
| D078-ECON-REPRODUCIBLE-RESEARCH | WB example + UKDS RDM support documentation/stewardship. | RDM link is series, not version-control course. | supported, WB policy is not universal. |
| D078-ECON-CAUSAL-EVALUATION | WB/AEA/DIME support conventional evaluation. | WB Impact Evaluation in Practice verified. | supported when design assumptions justify causal claims. |
| D078-ECON-CAUSAL-ML | AEA/DIME/NBER support specialist frontier. | WB conventional book does not teach causal ML; no exact free course found. | supported research edge; learning gap not-established, hidden. |
| D078-ECON-LLM-EVIDENCE-SYNTHESIS | DIME/WB/UNESCO support bounded AI governance/use context. | World Bank reproducibility note is not LLM synthesis instruction. | exact task-specific learning not-established; optional/hidden. |
| D078-ECON-FORECASTING | O*NET/NISER reports plus IMF WP/21/124 and FPP3 after repair. | FPP3 exact sections; CORE project is partial. | supported; historical IMF example is not current forecast. |
| D078-ECON-ALTERNATIVE-DATA-NOWCAST | DIME external examples + official NBS benchmark context + IMF historical Nigeria application. | CORE is not exact nowcasting learning. | bounded emerging task; transfer/current performance not established. |
| D078-ECON-DISTRIBUTIONAL-ANALYSIS | CORE/NBS/NISER support bounded distribution analysis. | CORE inequality project and Python example verified. | supported; measure, prices, weights and survey design matter. |
| D078-ECON-NIGERIA-MICRODATA | NBS catalogue/NLFS/Afrobarometer/NISER support local data context. | NBS docs verified through catalogue/search; CORE general. | supported; access is not unrestricted and period is explicit. |
| D078-ECON-NATIONAL-ACCOUNTS-MEASUREMENT | UN 2025 SNA + NBS methodology support concepts and actual Nigeria method. | UN resource page is index, not exact course. | supported; Nigeria’s published method remains SNA 2008. |
| D078-ECON-LABOUR-STATISTICS | ILO standards + NBS NLFS support concepts and local data. | ILOSTAT is a reference index, not course. | supported; use exact ICLS implementation per release. |
| D078-ECON-PUBLIC-FINANCE-STATISTICS | IMF GFSM + NES/NBS support specialist fiscal context. | IMF GFSM is a reference, not course/credential. | supported as optional specialist knowledge. |
| D078-ECON-AGENT-BASED-MODELING | Mesa docs/ABM explainer + Casevo paper support method/tool existence. | Mesa getting-started exact; no validation course. | supported specialist method, model validity remains separate. |
| D078-ECON-CASEVO-LLM-SIM | Paper/repo establish prototype only; diversity/governance sources bound use. | Repo LICENSE Apache-2.0 conflicts with package MIT metadata; release metadata, installation, API access/cost and privacy terms unverified. Mesa Getting Started is free practical instruction. | experimental task identity supported; Casevo learner installation/reuse closed as not established, hidden/read-only pending owner clarification and tested runtime. |

### Per-record reopening evidence (applies to every hidden item above)

“Hidden” is not an evidence-gap queue. Each record has the bounded support/unsupported outcome above and remains non-student-facing until the record-specific evidence below is added **and** a separate named programme/domain/role owner and review approval exist. No task is asserted as universally required. A new source may reopen only the row it directly supports.

| Record | Exact evidence required to reopen for student/owner review |
|---|---|
| SOC-K1 | A reviewed D078 curriculum outcome or named role task showing the specific sociological concepts; retain non-U.S. evidence if making a Nigerian/D078 claim. |
| SOC-M1 | Programme/role evidence for interviewing or observation, plus local participant/ethics protocol where applicable; an exact learner module for any displayed practice. |
| SOC-C1 | Named institution’s current non-health REC route for the relevant study type, plus local data-protection requirements and a mapped programme/role outcome. |
| SOC-M2 | Direct specialist qualitative-analysis source and an exact accessible course module teaching interpretation/coding; human accountability must remain explicit. |
| SOC-C2 | Direct source for reflexive/traceable interpretation and programme/role ownership evidence; any AI extension requires task-specific validation evidence. |
| SOC-T1 | Current, accessible task module with reproducible Python/R corpus workflow and documented platform/data permissions; local-language claims need language-specific evaluation. |
| SOC-S1 | Exact corpus-preparation/analysis source and a Nigerian-language benchmark or human evaluation for each language/domain claim. |
| SOC-A1 | Direct validation study or professional method source for human-checked AI annotation, with sample, error metrics, model/version and language coverage. |
| SOC-C3 | Current applicable institutional ethics and data-governance rules plus a named programme/role outcome; no generic AI disclosure rule is inferred. |
| SOC-M3 | D078 curriculum/role evidence for ABM and a model-specific calibration/validation source before any empirical-outcome claim. |
| SOC-T2 | Named curriculum/role evidence for Mesa use and a pinned, maintained Mesa tutorial/version; usage alone does not establish modelling competence. |
| SOC-A2 | Casevo release-owner reconciliation of LICENSE, `pyproject.toml` and wheel metadata; successful clean install/runtime; documented model endpoint/key, charges, availability and privacy terms; named owner. |
| SOC-M4 | Nigerian-language expert review and cognitive-pretest evidence for each proposed translation, plus current applicable survey/data protections and an owned curriculum outcome. |
| SOC-C4 | Programme/role evidence that cognitive pretesting is used, plus an exact current method module; a small pretest cannot be used to claim validity alone. |
| ECON-K1 | D078 curriculum/role evidence for economic concepts and a current, explicitly scoped economic indicator application; local claims require Nigerian source/vintage. |
| ECON-S1 | Current dataset-specific metadata, definitions, sampling/weights and access terms, plus a named curriculum/role use; no unrestricted NBS microdata inference. |
| ECON-M1 | Named programme/role outcome and exact causal-design learning chapters; any applied claim needs the study’s identification assumptions and data. |
| ECON-C1 | Source-backed assessment outcome requiring claim discipline and an example distinguishing causal from predictive/descriptive inference. |
| ECON-M2 | Current forecast/nowcast task ownership and current-vintage Nigerian target data; IMF COVID-era paper is historical example only, not current forecast evidence. |
| ECON-T1 | A named programme/role workflow and exact reproducible R/Python task module; do not convert optional language choice into a universal requirement. |
| ECON-A1 | Replicated/task-specific evidence for the generated covariate and validation procedure, plus role/programme ownership. |
| ECON-C2 | Direct task-specific source for quality/error assessment of generated measures and an applicable, current governance rule if a compliance claim is made. |
| ECON-A2 | Direct evidence of the named GenAI economics microtask in current practice and a task-specific verification method; no exact course currently established. |
| ECON-C3 | The actual institution/employer policy applicable to the proposed AI use and a mapped outcome; do not generalize AEA/APA policy. |
| D078-SOC-QUESTION-DESIGN | Named D078 course outcome or role task and current direct source for the stated design activity; NISER compromised page is not acceptable evidence. |
| D078-SOC-THEORY-CONTEXT | Named curriculum outcome and direct source for any specific theory/discipline claim; no general programme coverage inferred from ISCED. |
| D078-SOC-ETHICS-REFLEXIVITY | Current REC procedure for the named Nigerian institution/study type, plus relevant data-protection rules and an owned outcome. |
| D078-SOC-ETHNOGRAPHIC-FIELDWORK | Current programme/role evidence for ethnographic fieldwork and a directly applicable fieldwork/participant-observation resource. |
| D078-SOC-INTERVIEW-FOCUSGROUP | Named task owner and exact interview/focus-group module with consent, sampling and facilitation locators; local ethics approval remains separate. |
| D078-SOC-KOBO-SURVEY-FIELD | Named project/programme use, current Kobo instructions and data-protection/consent/access configuration for the deployment. |
| D078-SOC-THEMATIC-ANALYSIS | Specialist source plus an exact accessible course teaching thematic coding/interpretation and quality checks; not merely a software manual. |
| D078-SOC-CAQDAS-TAGUETTE-NVIVO | Current official tool docs, exact license/access terms for each product and programme/role evidence; do not imply feature parity. |
| D078-SOC-LLM-ASSISTED-CODING | Direct validation study with human comparison, error analysis, model/version, language and data-governance scope; exact course needed for learner-resource claim. |
| D078-SOC-SECONDARY-QUAL-ANALYSIS | Original-data provenance, consent/permission and context plus an exact secondary-analysis learning module for the intended data. |
| D078-SOC-DOCUMENT-ANALYSIS | Named programme/role task and a current exact method section beyond the bounded UK guidance if making local/professional-standard claims. |
| D078-SOC-SURVEY-DESIGN | Exact course launch/module and current Nigerian instrument-design/REC evidence for local claims; NCRM orientation alone does not reopen a full-course claim. |
| D078-SOC-SURVEY-ANALYSIS-R | Exact current R survey-design module plus target dataset’s weights/strata/PSU documentation and programme/role ownership. |
| D078-SOC-AI-SURVEY-QUESTION-DRAFTING | Nigerian-language expert review, cognitive-pretest results, task-specific AI evaluation and named programme/role owner. |
| D078-SOC-DIGITAL-TRACE-ETHICS | Current platform terms/API access, collection provenance and applicable ethics/data rules for the specific trace source and study. |
| D078-SOC-SOCIAL-NETWORK-ANALYSIS | Named research/role task, current exact tool tutorial and independent sampling/measurement/interpretation evidence; software output alone is insufficient. |
| D078-SOC-QUANT-TEXT-R | Current corpus/language-specific construct validation, exact technical module and data/platform permissions for the intended text source. |
| D078-SOC-LLM-SYNTHETIC-PILOT | Direct human-comparison evidence for the defined pilot and explicit proof it is not a substitute for people; ethics/privacy and external-validity review. |
| D078-ECON-ECONOMIC-REASONING | Named programme/role outcome and current scoped applied example; distinguish concepts from professional task mandates. |
| D078-ECON-MEASUREMENT | Release-specific Nigerian indicator definitions, vintage, survey coverage and access/weights, plus named use. |
| D078-ECON-UNCERTAINTY-COMMUNICATION | Direct source for the specific uncertainty task and a named owner; any required reporting standard must be identified rather than inferred. |
| D078-ECON-APPLIED-ECONOMETRICS | Named programme/role outcome and exact applied econometrics learning module; identify the designs actually used by that owner. |
| D078-ECON-R-PYTHON-ANALYSIS | Named owner’s reproducible workflow and exact current language-specific learner module; justify tool choice for that task. |
| D078-ECON-REPRODUCIBLE-RESEARCH | Current applicable reproducibility policy/task and exact version-control/analysis workflow resource if that specific competency is claimed. |
| D078-ECON-CAUSAL-EVALUATION | Specific intervention/design evidence and identification assumptions plus named curriculum/role ownership; causal claims must be justified by design. |
| D078-ECON-CAUSAL-ML | Direct applied causal-ML study and exact free course module teaching the method/assumptions; conventional evaluation links do not suffice. |
| D078-ECON-LLM-EVIDENCE-SYNTHESIS | Direct evaluated economics evidence-synthesis use and exact learner module; governance reference alone does not establish this task. |
| D078-ECON-FORECASTING-UNCERTAINTY | Current Nigerian forecast target, release vintage, forecast protocol and evaluation evidence plus named owner; FPP3 supports method, not a local forecast claim. |
| D078-ECON-ALTERNATIVE-DATA-NOWCAST | Nigeria-specific out-of-sample comparison to official benchmarks, data permissions and documented drift/bias checks for the proposed source. |
| D078-ECON-DISTRIBUTIONAL-ANALYSIS | Named owner, exact measure/price/weight definitions and dataset-specific coverage/access evidence for the target population. |
| D078-ECON-NIGERIA-MICRODATA | Current NBS/Afrobarometer metadata, access terms, release period and correct weights/design; no claim of open microdata without explicit terms. |
| D078-ECON-NATIONAL-ACCOUNTS-MEASUREMENT | Current NBS methodology/adoption source if claiming Nigerian implementation of newer SNA, plus named course/role outcome. |
| D078-ECON-LABOUR-STATISTICS | Exact current ICLS standard and NBS survey implementation for the release plus named task owner. |
| D078-ECON-PUBLIC-FINANCE-STATISTICS | Current Nigeria GFSM adoption/compiler evidence, exact applicable IMF standard and named specialist curriculum/role owner. |
| D078-ECON-AGENT-BASED-MODELING | Named owner, explicit mechanism and model-specific calibration/validation against relevant observed evidence. |
| D078-ECON-CASEVO-LLM-SIM | Release-owner license reconciliation, wheel metadata, clean runtime test, endpoint/key/cost/privacy documentation and evidence for the specific simulation use; otherwise remain hidden/read-only. |

The 30 fallback assignments are individually stamped in the fallback JSON with a stable `audit_assignment_key`, closed-hidden template disposition, and specific reopening evidence; they map by task family and label to the base/overlap items above and add zero unique candidates. The old `OL_INTRO_SOC` and `OL_ECON` fallback resource aliases were not backed by registered source records or exact locators in that artifact; both are removed from its learning links and closed as not-established. This closes the former generic “check whether…” resource gate. Validated resources in the main lane are not implied to teach every fallback label.

### Reconciled totals and fallback assignments

| Artifact | Final count | Counting rule |
|---|---:|---|
| Base package | 11 task families; 24 typed items; 23 source records | IDs in the base JSON. |
| Overlap package | 13 task families; 36 typed candidates; 74 source records | IDs/source IDs in the overlap JSON, with one outcome row each above. |
| Fallback package | 6 task families; 30 assignments; 10 distinct labels | Repeated assignments are templates, not additional typed items. |
| Source registrations / URLs | 97 registrations; 89 normalized unique URLs | Six exact URLs shared across the two primary packages; aliases/repeated URLs are counted once. |
| Learning resources in overlap package | 26 unique IDs; 39 item references | All current learning IDs individually dispositioned above; Casevo remains in the source register, not the learning set. |

The ten fallback labels each map to an existing Area 1 or Area 2 task family: social theory and concepts; qualitative and quantitative inquiry; interviews/observation/document analysis; ethnographic and comparative reasoning; research ethics and reflexivity; micro/macro concepts; economic measurement/data appraisal; quantitative analysis/econometrics; economic reasoning/policy interpretation; forecasting with uncertainty. They add zero new candidate IDs. Candidate overlap is not silently summed into a unique total; this audit only reconciles task-family equivalence and leaves canonical ownership to its separate decision process.

**Closure criterion met:** all 74 overlap source records, 23 base source records, 27 overlap learning IDs, 24 base typed items, 36 overlap typed candidates, and ten fallback labels have an explicit final disposition. Not-established cases state why the claim/resource remains unsupported and what evidence would reopen it in the companion checkpoint. All hidden status is explained; no placeholder or open queue remains.

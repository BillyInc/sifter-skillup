# Rows 001–140: combined-scope downstream-link audit increment 005

Audit date: 2026-09-24  
Scope: combined JAMB identities at rows 41, 43, 49, 50 and 52. This is a review of all 68 current JAMB-scoped links in the saved scope. No shared mapping, seed, UI, or CCMAS source was edited.

## Method and boundary

Joined the five row identities to `jamb_curriculum_scopes_2026-08-17.json`, checked the declared CCMAS/custom component references against the underlying course records, and compared each destination with the active `domain_structure.json` downstream catalogue. The five rows have **zero selected courses**. Therefore, even where component courses clearly teach relevant subject matter, they are candidate component evidence, not an approved JAMB-specific course scope or proof of occupational readiness. A direct/functional/adjacent label in the saved link table is not itself evidence.

For each link below, the disposition concerns the current domain claim and its downstream role families: `supported subject` means the component curriculum has relevant learning outcomes, not that every role in the domain is prepared; `narrow only` means a smaller subgroup may be defensible after courses are selected; `unsupported` means current course evidence does not support the claimed career route. Unsupported links should not be presented as confirmed student pathways pending the wider audit.

## Row 41 — Political Science and Defence Studies

Declared components: CCMAS Political Science + International Relations. The named **Defence Studies** facet is not absent from CCMAS: Political Science includes POL 403 *Contemporary Defence and Strategic Studies* (strategic decision-making, defence/security paradigms and national-defence analysis) and POL 401 *Civil-Military Relations* (military organization and civil–military relations). These are substantive subject anchors. But the row selects no courses, and its component refs do not make POL 403/POL 401 an approved JAMB-specific selection. Neither course alone demonstrates preparation for security operations, policing or military service.

| Link | Current type | Outcome-to-downstream finding and disposition |
|---|---|---|
| D063 Economics | functional | Political economy / international economic relations can give context; no general economics or economist/market-analysis preparation. **Unsupported as a career route.** |
| D149 Diplomacy, International Relations | direct | IRS 303–305/304 support international-system, diplomacy and international-law subject knowledge. D149 includes diplomatic/foreign-affairs roles; subject alignment is strong, but not complete job readiness. **Subject alignment supported; scope courses first.** |
| D078 Social Sciences | functional | Political-science/IR methods courses support research, literature review and data analysis. D078 also contains quantitative/computational pathways. **Narrow to evidenced research subgroups after selecting methods courses.** |
| D037 Legal Practice | functional | POL 406 / IRS 305 cover international law and adjudication concepts, not advocacy, litigation or lawyer/court work. **Unsupported as legal-practice pathway.** |
| D045 Public Administration | functional | POL 103/206 and policy content support governance/administration concepts; no basis for every government leadership, inspection or enforcement role. **Narrow policy/administrative subject connection only.** |
| D151 Criminology, Criminal Justice | functional | Defence, war and security-policy study is not criminological method or criminal-justice practice; downstream includes criminologists, detectives and police/prison roles. **Unsupported.** |
| D028 General Management | functional | Strategy/administration in the political context does not establish commercial management, executive or business-analysis readiness. **Unsupported.** |
| D038 Compliance, Regulation | functional | International-law knowledge is not compliance controls, regulatory operations or inspection practice. **Unsupported.** |
| D162 Immigration Law, Asylum | functional | No immigration/asylum law or casework outcome. **Unsupported.** |
| D130 Recruitment, Employment | functional | No recruitment or employment competency. **Unsupported.** |
| D077 Security Services | functional | POL 403/401 support defence/security-policy literacy. D077 downstream includes security/emergency officers and investigators with operational safety, threat response and protective skills. **Subject context only; occupational link unsupported.** |
| D161 Humanitarian Aid, Emergency Response | functional | IR/defence content may discuss conflict or aid, but does not establish aid delivery, emergency logistics, health or protective-service practice. **At most conflict-policy context; broad link unsupported.** |
| D065 Translation, Interpretation | adjacent | No language-learning, translation or interpreting outcomes. **Unsupported.** |

## Row 43 — Peace Strategic and Conflict Resolution

Declared components: Peace Studies and Conflict Resolution + International Relations. CCMAS PCR courses substantively cover peace/conflict theory, international organisations, peacekeeping, conflict contexts, negotiation and peacebuilding/M&E (including PCR 101/102, 202/203, 301, 309, 401 and 402). This supports the peace/conflict facet. The word **Strategic** is only partially resolved: PCR has strategy and conflict-modelling content, but no explicit standalone Strategic Studies course in the declared components. POL 403 is a possible cross-component lead, not a row component and cannot be silently imported. Also preserve the source-name discrepancy: JAMB’s official Social Sciences brochure uses “Peace Strategic and Conflict Resolution” for AJAYI, while Ajayi Crowther’s current course listing calls it “Peace & Conflict Studies.” This corroborates identity/name context, not curriculum equivalence.

| Link | Current type | Outcome-to-downstream finding and disposition |
|---|---|---|
| D161 Humanitarian Aid, Emergency Response | functional | PCR peacekeeping, protection and peacebuilding/M&E support conflict-response subject matter. D161 also contains operational aid, health, logistics and protective roles. **Narrow only to conflict-peacebuilding/programme work if a matching subgroup is identified; not broad readiness.** |
| D149 Diplomacy, International Relations | direct | IR and PCR 202/203 cover international organisations, conflict resolution and peacekeeping; direct subject relationship. D149’s full diplomat/foreign-affairs responsibilities exceed this curriculum. **Subject alignment supported; narrower international peacebuilding route only.** |
| D078 Social Sciences | functional | PCR research methods and research project support conflict/social research. Not every quantitative/computational D078 subgroup. **Narrow research link after course selection.** |
| D151 Criminology, Criminal Justice | functional | Terrorism and crime/conflict topics are not criminological methods, investigation, corrections or policing training. **Unsupported occupational link.** |
| D028 General Management | functional | PCR 309 M&E/project content may support bounded peacebuilding programme work; not broad company/executive management roles. **Narrow programme-project subgroup only, if present.** |
| D037 Legal Practice | functional | Human-rights and international-law subject coverage is not legal practice or court readiness. **Unsupported as professional link.** |
| D130 Recruitment, Employment | functional | No recruitment/employment outcomes. **Unsupported.** |
| D045 Public Administration | functional | Governance and international-organisational content gives policy context, but no broad public-administration role readiness. **Narrow policy/programme context only.** |
| D064 Psychology, Counselling | adjacent | Introductory psychology/sociocultural understanding does not teach counselling methods or qualify psychology/clinical roles. **Unsupported as occupational pathway.** |
| D063 Economics | functional | International development/economic context is not economics training or economic-analysis role readiness. **Unsupported.** |
| D038 Compliance, Regulation | functional | Human rights and international rules do not establish compliance control, inspection or regulatory practice. **Unsupported.** |
| D162 Immigration Law, Asylum | functional | No immigration/asylum law or casework outcomes. **Unsupported.** |
| D065 Translation, Interpretation | adjacent | No translation/interpreting or language-proficiency outcomes. **Unsupported.** |

## Row 49 — Government and Public Administration

Declared components: Political Science + CCMAS Public Administration. Relevant course evidence is unusually clear: POL 103/206/305 cover government organization, public administration and policy analysis; PAD 305/307/308/311/313/401–403/407/409/411 cover public personnel, research/data, e-governance, public finance, administrative law, planning/project management, policy, public accounts/audit, accountability and welfare administration. The named Government/Public Administration facets have substantive curricular coverage; D045 is the direct academic-domain match. However, no course is selected for this JAMB identity. Public-sector subject coverage is not blanket preparation for adjacent finance, law-enforcement, telecom or private-sector careers.

| Link | Current type | Outcome-to-downstream finding and disposition |
|---|---|---|
| D063 Economics | functional | PAD 311 public finance supports fiscal-policy context, not general economics/economist roles. **Narrow public-finance policy only.** |
| D149 Diplomacy, International Relations | functional | Political Science may cover foreign policy, but Public Administration does not make all diplomat/foreign-affairs roles a destination. **Narrow policy context; broad route unsupported.** |
| D078 Social Sciences | functional | POL/PAD methods and PAD 307 data-management outcomes support bounded public/social research. **Narrow research subgroups; no automatic computational route.** |
| D037 Legal Practice | functional | PAD 313 administrative law and POL legal-system knowledge are not professional legal practice. **Unsupported.** |
| D045 Public Administration | direct | Public Administration outcomes directly cover governance, policy, planning, personnel, public finance and service administration. **Direct subject alignment supported; JAMB course scope remains unselected.** |
| D151 Criminology, Criminal Justice | functional | No criminological method, case investigation, correctional or policing practice from the named components. **Unsupported.** |
| D028 General Management | functional | Public administration is not general commercial management/executive readiness. **Unsupported beyond specific public-management tasks already covered under D045.** |
| D038 Compliance, Regulation | functional | Administrative law, ethics and accountability support governance knowledge, not broad private compliance, inspection or regulator roles. **Narrow public-governance facet only.** |
| D162 Immigration Law, Asylum | functional | No immigration/asylum law or casework. **Unsupported.** |
| D130 Recruitment, Employment | functional | PAD 305 supports public personnel administration/training. D130 includes recruitment and employment specialists; explicit recruitment outcomes are not established. **Narrow public-personnel administration candidate, not recruitment readiness.** |
| D077 Security Services | functional | Government/security institutions are not operational protective/security skills. **Unsupported.** |
| D062 Trading | functional | Public finance is not trading, brokerage or market operations. **Unsupported.** |
| D012 FinTech Engineering | functional | PAD 308 e-governance is public-sector ICT use, not fintech/software engineering. **Unsupported.** |
| D158 Corporate Finance, Investment Banking | functional | Public finance/accountability is not corporate finance or investment banking. **Unsupported.** |
| D013 Investment Analysis | functional | Public project appraisal/planning is not investment analysis/advisory practice. **Unsupported.** |
| D157 Tax Advisory, Transfer Pricing | functional | Public revenue knowledge does not establish tax advice or transfer pricing. **Unsupported.** |
| D015 Accounting | functional | PAD 407 includes public accounts/auditing, but not the full CCMAS Accounting curriculum or professional accountant practice. **Bounded public-accounting/audit support only.** |
| D061 Insurance | functional | No insurance-specific curriculum outcomes. **Unsupported.** |
| D029 Human Resources | functional | PAD 305 provides public personnel administration. D029 includes broader HR/talent advisory and people leadership. **Narrow public-sector personnel administration only.** |
| D159 Credit Analysis, Structured Finance | functional | Public finance does not teach credit-risk/structured-finance work. **Unsupported.** |
| D008 Telecommunications | functional | E-governance does not teach telecommunications or network engineering. **Unsupported.** |
| D009 Data Science | functional | PAD 307 supports research-data management/analysis, not the whole data-science/AI engineering domain. **Narrow public-research data-support only.** |
| D128 Social Welfare, Youth Services | functional | PAD 411 directly covers welfare administration/programmes, not frontline social-work or care practice. **Narrow welfare-policy/administration only.** |

## Row 50 — Sociology and Anthroplogy (source spelling)

Declared components: CCMAS Sociology + a custom Anthropology component. No standalone CCMAS Anthropology programme is present in the source package. The repo’s custom enrichment has specific course-content sources from UNN and UNIZIK; for example, UNIZIK’s official course description for SOC141 covers anthropology concepts, theories, methods, ethnography and participant observation, while SOC142 addresses Nigerian heritage. UNN’s official Sociology & Anthropology module list supplies a broader anthropology course set. These are itemized external educational sources, but they are **not the JAMB offering’s institution-specific curriculum** and do not prove every listed institution teaches every course. Sociology CCMAS contributes research methods (SOC 301) and social/cultural content. The Anthropology facet is therefore externally supported as an academic subject, not as an approved JAMB course selection.

| Link | Current type | Outcome-to-downstream finding and disposition |
|---|---|---|
| D078 Social Sciences | direct | Sociology methods plus anthropology/ethnographic subject evidence support direct social-science alignment. Downstream research subgroups are more plausible than computational social science unless quantitative/computational outcomes are selected. **Direct subject alignment; narrow role readiness to supported research methods.** |
| D152 Museum Curation, Cultural Heritage, Archives | functional | Anthropology/heritage courses support cultural subject knowledge and heritage awareness. D152’s curators/archivists require collection documentation, cataloguing, conservation, museum database and archive-management practice, not evidenced by the cited courses. **Subject adjacency only; occupational link unsupported pending relevant course outcomes.** |

## Row 52 — Sociology and Social Studies

Declared components in the saved scope: Sociology + Development Studies. The JAMB name has a second facet, **Social Studies**, for which the CCMAS corpus contains a distinct Education programme: **Social Studies and Civic Education (36 courses)**. Outcomes include ESS 100 social-studies foundations, ESS 112 civic education, ESS 225 citizenship/rights and duties, ESS 312 politics/power/government, ESS 313 security/law awareness, ESS 411 international relations, ESS 423 fieldwork/reporting and ESS 424 global development agenda. It also includes teacher-education/methods/practice courses; these are not transferable wholesale to a social-science JAMB offering. This is a material candidate component omitted from the saved `component_refs`, but the row has zero selected courses and the JAMB offering is not yet linked to this component by an approved course scope. Treat it as a **scope omission requiring evidence-based reconciliation**, not an automatic union of all 36 Education courses.

| Link | Current type | Outcome-to-downstream finding and disposition |
|---|---|---|
| D078 Social Sciences | direct | Sociology methods/content support the Sociology facet; Social Studies/civic curriculum may add civic/field-research content. Direct subject relationship is plausible, but D078 computational/data-heavy roles are not thereby supported. **Subject alignment; narrow research pathways after scoped course selection.** |
| D063 Economics | functional | DES 308 explicitly teaches development economics and economic analysis; supports development-economics subject content, not all economists/market-analysis roles. **Narrow development-policy analysis only.** |
| D151 Criminology, Criminal Justice | functional | SOC 303 teaches crime theories and social context; it does not establish investigators, police/prison or criminal-justice practitioner readiness. **Research/topic connection only.** |
| D046 Social Work | functional | SOC 205 covers social-work theories/problems, but not casework, counselling, safeguarding or social-work practice. **Subject exposure only; occupational route unsupported.** |
| D073 Library, Archive | functional | No cataloguing, archival description, collections care or library systems outcomes in the declared scope. **Unsupported.** |
| D037 Legal Practice | functional | Sociology-of-law/traditional legal systems or civic rights knowledge is not legal practice. **Unsupported.** |
| D009 Data Science | functional | SOC methods/statistics and possible Social Studies fieldwork support basic research data collection/analysis; not data engineering, advanced statistics or broad data-science roles. **Narrow research-support subgroup only.** |
| D064 Psychology, Counselling | functional | Introductory psychology/social context does not establish counselling methods, psychological assessment or clinical readiness. **Unsupported occupational link.** |
| D045 Public Administration | functional | Civic/governance subjects offer context, but Public Administration is not a declared component and no selected courses establish its broad downstream roles. **At most narrow governance context.** |
| D149 Diplomacy, International Relations | functional | DES 404 International Relations and Development and possible ESS 411 support international-development/IR subject matter; neither establishes all diplomat/foreign-affairs roles. **Narrow international-development research/policy only.** |
| D060 Banking, Credit | functional | Development economics does not teach banking operations, credit assessment or lending. **Unsupported.** |
| D130 Recruitment, Employment | functional | No recruitment/employment outcomes in Sociology/Development Studies; Education teaching practice is not recruitment training. **Unsupported.** |
| D128 Social Welfare, Youth Services | functional | Sociology/development/welfare content provides social-policy context, not frontline welfare, care or youth-service practice. **Narrow programme/research or policy context only.** |
| D161 Humanitarian Aid, Emergency Response | functional | DES 207 has explicit NGO service provision, post-emergency rehabilitation and advocacy outcomes. This supports a bounded development/aid-programme subject connection; it does not establish emergency health, logistics or protective-service competencies. **Narrow programme/research subgroup only.** |
| D028 General Management | functional | DES 304 supports project management/M&E with practical planning, procurement and risk outcomes. This is a bounded project/programme-management connection, not general commercial/executive management. **Narrow project-management subgroup only.** |
| D038 Compliance, Regulation | functional | No compliance-control/regulatory implementation outcomes established. **Unsupported.** |
| D032 Project Management | functional | DES 304 explicitly covers project scope, time, cost, quality, procurement, risk and application across organizational settings. **Strong bounded curriculum support for project-management work, subject to selecting DES 304 and not generalizing to every D032 role.** |

## Consolidated findings and checkpoint status

- Reviewed all **68/68 current links**: row 41 (13), row 43 (13), row 49 (23), row 50 (2), row 52 (17).
- Named facets: Political Science + **Defence Studies** has a clear candidate CCMAS course (POL 403) but no JAMB course selection; Peace + Conflict is explicit while **Strategic** is only partially evidenced and the JAMB/current Ajayi name differs; Government + Public Administration has strong declared component evidence; Sociology + **Anthropology** uses externally sourced academic modules but no JAMB-specific selected course set; Sociology + **Social Studies** has a distinct 36-course CCMAS programme absent from the saved component refs and needs explicit scope reconciliation.
- Curriculum subject coverage is not occupational readiness. Stronger bounded destinations are D149 for row 41/43, D045 for row 49, D078 for row 50/52, and selected policy/research/project/programme facets noted above. None licenses every downstream role in those domains.
- The detailed combined-scope pass for rows 1–140 now reaches **19/19 combined rows** (increment 001–005). This does **not** complete the 1–140 tranche: links outside combined rows, saved-scope links without course-title anchors, and remaining outcome-level checks are still open. Do not claim the full tranche or 420-row audit complete.
- No mapping, seed, UI, or source data was changed. These are audit dispositions and follow-up candidates only.

### Downstream role-catalogue spot-check

Checked the linked domain destinations against `role_library_v3_cleaned.json`; these role examples make the boundary behind the preceding verdicts concrete. They are illustrative active role records, not an exhaustive role list and not a claim that the JAMB identity reaches every role. The static local domain snapshot does not persist the live subgroup-to-role joins, so this checkpoint does not assert subgroup-level membership where it cannot be verified from this file.

- Row 41: D063 business economics researcher/economic policy officer; D149 ambassador/diplomat; D078 sociologist/business economics researcher; D037 judge/court clerk; D045 public administration manager/secretary of state; D151 criminologist/police detective; D028 branch manager/accounting manager; D038 data protection officer/procurement category specialist; D162 human-rights officer/lawyer; D130 employment agent/recruitment consultant; D077 industrial firefighter/lifeguard; D161 humanitarian adviser; D065 translator/interpreter. The course evidence aligns most clearly to IR/foreign-affairs subject matter, not legal, enforcement, security-operation, translation, or commercial roles.
- Row 43: D161 humanitarian adviser/monitoring-and-evaluation officer; D149 ambassador/diplomat; D078 criminologist/sociologist; D151 police commissioner/prison officer; D028 EU funds manager/branch manager; D037 judge/court clerk; D130 employment agent/talent-acquisition specialist; D045 public administration manager; D064 psychologist/social counsellor; D063 economic policy officer; D038 housing policy officer/data protection officer; D162 human-rights officer/lawyer; D065 translator/interpreter. Peacebuilding/M&E and IR are the bounded academic overlaps; none of these courses establishes clinical, policing, legal-practice or translation readiness.
- Row 49: D063 economic policy officer; D149 diplomat; D078 sociologist/business economics researcher; D037 judge/court clerk; D045 public administration manager/secretary of state; D151 police detective/prison officer; D028 branch manager; D038 procurement category specialist/data protection officer; D162 lawyer/legal assistant; D130 recruitment consultant; D077 industrial firefighter; D062 foreign-exchange trader/bank teller; D012 software analyst/ICT tester; D158 securities analyst/M&A analyst; D013 investment manager/foreign-exchange trader; D157 tax compliance officer/financial auditor; D015 financial auditor/budget analyst; D061 insurance underwriter; D029 recruitment consultant/compensation analyst; D159 credit analyst/securities analyst; D008 telecommunications engineer; D009 integration engineer/embedded systems designer; D128 youth programme director/social services manager. The PAD evidence fits D045 and some bounded public personnel/accounts/welfare work; the remaining private-sector engineering, trading, finance and operational roles show why same-component or shared public-finance vocabulary cannot validate the whole link set.
- Row 50: D078 sociologist/research roles; D152 art restorer/library or archive roles. Anthropology and heritage subject content is relevant, but it does not evidence collection conservation, museum databases, cataloguing or archival operations.
- Row 52: D078 sociologist/research roles; D063 economic policy officer; D151 criminologist/police detective; D046 social/care roles; D073 librarian/archive roles; D037 judge/court clerk; D009 integration engineer/embedded systems designer; D064 psychologist/social counsellor; D045 public administration manager; D149 diplomat; D060 credit analyst/bank teller; D130 employment agent; D128 youth programme director/social services manager; D161 humanitarian adviser/M&E officer; D028 branch manager; D038 data protection officer/regulatory roles; D032 EU funds manager/project-programme roles. Course support is confined to the methods, development-policy, welfare-programme and project-management facets noted above; it does not establish the listed engineering, bank-credit, legal, clinical/care or broad management work.

## Source locators

- Saved JAMB scope and links: `data/career-mapping/_audit/jamb_curriculum_scopes_2026-08-17.json` (rows 41, 43, 49, 50, 52).
- CCMAS evidence: `data/career-mapping/ccmas/social_sciences.json`, `data/career-mapping/ccmas/administration_management.json`, and `data/career-mapping/ccmas/education.json` (Social Studies and Civic Education).
- Custom Anthropology enrichment and its recorded source URLs: `data/career-mapping/enrichment/anthropology.json`.
- Downstream roles/families: `data/career-mapping/domain_structure.json`; this catalogue shows, for example, D151 criminal justice/police-facing work, D077 operational security, D152 collection/conservation roles, and D161 aid-response roles.
- Role examples checked: `data/career-mapping/role_library_v3_cleaned.json`. Subgroup joins were not claimed from this flat role catalogue.
- Official JAMB Social Sciences brochure (Political Science and Defence Studies; Peace Strategic and Conflict Resolution): <https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf> (checked 2026-09-24; offering/name evidence, not detailed curricula).
- Ajayi Crowther University current courses: <https://acu.edu.ng/courses/> (checked 2026-09-24; current title shown as Peace & Conflict Studies, not a source for the historical JAMB curriculum).
- UNN Anthropology course modules: <https://socialscs.unn.edu.ng/sociology-anthropology-course-modules/> (checked 2026-09-24; itemized course-list evidence).
- UNIZIK Sociology and Anthropology course descriptions: <https://socialsciences.unizik.edu.ng/dept/sociology-and-anthropology/sociology-and-anthropology-course-descriptions/> (checked 2026-09-24; includes SOC141 anthropology methods/ethnography and SOC142 Nigerian heritage).
- Earlier detailed combined-row increment: `agent-01-links-increment-004.md` (rows 35, 36, 38, 39, 40); used as precedent for the same downstream-evidence standard, not as proof for these identities.

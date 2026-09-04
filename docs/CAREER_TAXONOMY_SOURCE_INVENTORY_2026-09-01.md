# Career taxonomy source and behavior inventory

**Document ID:** `SOURCE-INVENTORY-2026-09-01`  
**Audience:** academic reviewer, product reviewer, and the next maintainer  
**Purpose:** identify the authoritative source inputs, the repository's derived
artifacts, and the currently implemented subject-matching behavior before the
content and SQL release gates are frozen.

This inventory separates three claims that must not be confused:

1. a source exists and can be located;
2. the source says a particular fact; and
3. Sifter applies a documented rule to use that fact in a mapping or display.

A source URL or a file name alone proves only the first claim.

## 1. Authoritative source inputs

### Nigerian admission and curriculum sources

| Source layer | Local source input | What it can support | Repository evidence |
|---|---|---|---|
| JAMB/IBASS | `C:\Users\USER\Downloads\jamb brochure\` (10 brochure PDFs) | Programme catalogue names, national subject combinations, O-level wording, and direct-entry wording as printed | `data/career-mapping/_audit/jamb_brochure_source_audit_2026-08-17.json` |
| CCMAS/NUC | `C:\Users\USER\Downloads\ccmas original documents\` (17 original PDFs) | Programme overviews, objectives, courses, learning outcomes, and course content | `data/career-mapping/ccmas/*.json`, `data/career-mapping/_ccmas_txt/*.txt` |
| Nigerian context | Repository Nigerian professional-body, regulator, university, government, and local-sector source records | Nigerian terminology, credentials, regulatory boundaries, local practice, and local demand only where directly evidenced | `data/career-mapping/domain_role_source_registry.json` and the Nigerian enrichment catalogs |

The JAMB brochure audit contains 416 checked catalogue rows: 400 exact matches,
16 declared aliases, and no unmatched catalogue row. It also records source
file and page arrays. For example, `Medicine and Surgery (Human Medicine)` is
in `Medica_Pharmaceutical Health Science.pdf`, page 1. The printed-under-Law
display variant of `Criminology and Security Studies` is linked to the same
name in `Arts _ Humanities.pdf`, page 126, `Law.pdf`, page 13, and `Social
Management Science.pdf`, pages 1, 36, 39, 41, 42, 44, 45, 49, and 50.

The extracted CCMAS text preserves printed page markers. For example,
`data/career-mapping/_ccmas_txt/computing.txt` places the B.Sc. Computer
Science overview, philosophy, and objectives at printed page 27 and the
employability-skills section at printed page 28. The same source places
`CSC 402: Ethics and Legal Issues in Computer Science` and its learning
outcomes at printed page 50. The companion JSON keeps course-level locators
such as `Computing::Computer Science::COS 201` and the extracted
`skills_learned` text.

### International classification and enrichment sources

| Source | Supplied version/input | Proper role in the method | Key limitation |
|---|---|---|---|
| ISIC | Local ISIC Rev.5 workbook, `ISIC5_Exp_Notes_11Mar2024.xlsx`; SHA-256 `fd5986a1235259961787cce553c5515fb308b70b96580541246516ead5a7bdad` | Industry/activity context and completeness survey | Not an occupation, skill, or programme-suitability taxonomy |
| ISCO | Local `ISCO-08 EN Structure and definitions.xlsx`; SHA-256 `df10744491b4216ed3580e8263b6324502e774c16667a1d7ecdb...` | Occupational-function hierarchy and unit-group anchors | Does not define Sifter domain labels; raw absent codes remain explicit review findings |
| ESCO | Classification archive v1.2.1; SHA-256 `f9761b0b52be1828b38a3e5e0ae59a93a7b0ce358bc800f52f57a8b002adeb3e` | Preferred/alternative occupation labels, URIs, descriptions, and skills linked to ISCO | European/global vocabulary, not Nigerian demand proof |
| O*NET | Repository O*NET 31.0 and retained prior archive | Tasks, tools/software, work activities, preparation, and work context | US/global proxy; no automatic Nigerian counterpart |
| ILO | ISCO/ILO occupational material | International occupational definitions and employment context | Not direct Nigerian market evidence |
| WEF | Future of Jobs 2025 PDF; SHA-256 `8374fa3b3a55779d367ca6c295b6d6f1991caa1f01ece3c4cb40fb650115a223` | Trend and skills signals | Not a complete occupation list or local vacancy source |

The domain definition library is the original classification input, not an
official ISIC/ISCO replacement. Its SHA-256 is
`de9637ce32ef5892932e47a11d57f87a3e76af5176c3ff5a1b4bce4f2485da03`.
`data/career-mapping/_audit/domain_source_traceability_2026-08-31.json`
records each domain's library row, raw anchors, label class, and source
references. The current audit found D001-D166 in that library and D167-D168 as
later repository additions.

## 2. Domain, subgroup, and role derivation

The derivation is layered rather than a claim that one source generated every
name:

```text
ISIC activity context
  -> source-library domain identity and boundary
  -> ISCO occupational-function anchors
  -> ESCO normalized occupations and skills
  -> O*NET/ILO/WEF task, preparation, and trend enrichment
  -> Nigerian sources for local terminology, regulation, credentials, and demand
  -> Sifter domain/subgroup/role display record
```

The source audit currently records:

| Layer | Current audited scope | Important interpretation |
|---|---:|---|
| Domain records | 168 total; 160 visible | D001-D166 trace to the supplied library; D167-D168 are later curated additions |
| Domain label classes | 7 exact source terms; 159 source-supported umbrellas; 2 curated additions | Practitioner-facing labels are not claimed to be verbatim official classification labels |
| Full subgroup provenance | 555/555 | The full taxonomy retains provenance; visible product scope is 542 |
| Visible subgroup context | 542/542 | Each visible subgroup has at least one source-backed Nigerian context record |
| Merged roles | 5,209 | Source evidence may be exact, normalized, or source-role-only; these are not interchangeable claims |
| Visible role context | 5,093/5,093 | 5,089 have actual local enrichment; four are explicitly global-only |

When a subgroup cannot be defended, the product uses `domain -> role` rather
than inventing a subgroup. A role without an exact Nigerian counterpart remains
global-only or otherwise bounded; global evidence is not relabelled as local
demand.

### Layer-by-layer ownership

| Product layer | Primary source facts | Enrichment sources | Current evidence artifact |
|---|---|---|---|
| Domain name and definition | Supplied domain-definition library; ISIC activity context; ISCO occupational anchors | ESCO, O*NET, ILO, WEF, specialist frameworks, Nigerian sector sources | `domain_meta.json`, `domain_source_traceability_2026-08-31.json`, naming provenance audit |
| Subgroup name and boundary | Domain library and ISCO sub-major/work-family structure | ESCO/O*NET occupation families, SFIA/NICE and specialist frameworks, Nigerian occupational standards | `domain_structure.json`, `computational_layer_manifest.json`, subgroup source traceability audit |
| Role identity and description | ISCO unit groups, ESCO occupations/URIs, O*NET occupation data and titles | WEF signals, specialist frameworks, Nigerian vacancy and regulator sources | `role_library_v3_cleaned.json`, `role_work_profiles.json`, `emerging_role_overlays.json` |
| Skills and competencies | ESCO skill relations; O*NET Essential Skills, Transferable Skills, Work Activities, Tasks, Knowledge, and Abilities | SFIA, NICE, specialist frameworks, CCMAS learning outcomes where they describe programme preparation | `domain_skill_provenance.json`, `role_tools.json`, computational method evidence |
| Tools and software | O*NET Software Skills and named tools in checked role evidence | ESCO/tool relations and specialist technology frameworks; Nigerian sector sources for local context | `domain_tools.json`, `role_tools.json`, source-backed layer audit |
| Certifications and regulated preparation | Nigerian regulator/professional-body requirements and official credential routes | CFA, GARP, PMI, CIPS, SFIA, CPN, COREN, health councils, and other specialist bodies | certification gap audit, Nigerian context coverage report, learning-resource seed gate |
| Nigerian enrichment | Direct Nigerian regulator, professional-body, government, university, vacancy, and sector evidence | NBS labour context and dated vacancy/title signals | `nigerian_global_professional_overlays.json`, Nigerian context audit, role/subgroup gap overlays |
| Learning resources and source links | Source-backed reference pages, official frameworks, and learning/exam links | Resource catalog aggregation only; it does not create a new occupational fact | `learning_resource_population.manifest.json`, learning-resource population audit |
| Programme-to-domain relationship | Nigerian CCMAS courses, objectives, outcomes, and content; JAMB programme identity | Nigerian professional/local context for a bridge explanation; global sources do not repair weak curriculum fit | reviewed CCMAS/JAMB link artifact and active `jamb_domain_map.json` |

The words “skill”, “competency”, “tool”, and “certification” are not treated as
synonyms. A source may say that a role uses a tool or requires knowledge; that
does not prove that a learner has demonstrated competence, and a certification
resource does not prove that the certification is legally required in Nigeria.
The display layer must preserve these distinctions.

## 3. Current JAMB/O-level matcher behavior

The executable behavior is in `backend/routes/student_pipeline_routes.py`,
principally `programmes_by_subjects()` and
`_match_structured_subject_options()`. The UI entry and state behavior are in
`src/screens/careerIntelligence/AdmissionBrowseScreen.tsx`.

### Three supported modes

| Mode | Inputs | Rule applied | Result meaning |
|---|---|---|---|
| JAMB-only / `utme` | Exactly four normalized UTME subjects, including Use of English | Match only typed `utme` option records; required subjects and one-of groups must be satisfied | Subject-combination guidance for the JAMB gate, not an admission guarantee |
| O-level-only / `olevel` | Five to the configured early-guidance maximum normalized O-level subjects | Match only typed `olevel` option records; named requirements and the total credit minimum are enforced | O-level programme-fit guidance without using UTME rows |
| Combined / `combined` | Exactly four UTME subjects plus five to the O-level maximum | Independently match UTME and O-level by the same canonical JAMB programme ID, then intersect; retain O-level gaps/status | A combined view showing `eligible`, `utme_match_olevel_gap`, or `utme_match_olevel_unparsed` where applicable |

The matcher fails closed unless the subject catalogue, structured option seed,
and typed rule-record seed agree on programme ID, requirement ID, exam type, and
source text. It does not turn a shared word in unparsed brochure prose into an
exact match. University offerings are attached only after the canonical JAMB
programme match; they add address, requirements, and notes rather than creating
a different programme identity.

### Worked matcher example

Suppose a typed UTME rule contains required `CHEM` and `BIO`, plus one of
`MATH` or `PHY`, while its O-level rule requires `ENG`, `BIO`, `MATH`, and
`CHEM`, plus one of `GEO`, `HSC`, `PHY`, or `STAT`.

```text
JAMB-only selection:
  ENG, CHEM, BIO, PHY
  -> the UTME rule matches because CHEM and BIO are present and PHY satisfies
     the one-of group.

O-level-only selection:
  ENG, BIO, MATH, CHEM, GEO plus another subject
  -> the O-level rule matches because all named credits and the one-of group
     are present and the minimum subject count is met.

Combined selection:
  -> compute the two matches separately;
  -> keep the programme only if its same canonical JAMB programme ID occurs in
     both result sets;
  -> report any O-level missing subjects instead of flattening UTME and O-level
     into one list.
```

This is why the UI can say that a programme fits the UTME subjects while still
showing an O-level gap. It is also why a stream changes ordering of subject
choices but does not silently hide valid catalogue subjects. The independent
matrix audit and tests document the same behavior in
`docs/manual-review/subject-selection-matrix-run-2026-08-18.md` and
`backend/tests/test_student_pipeline_match.py`.

## 4. Review and release interpretation

The historical CCMAS/JAMB complement audit reported 547 sufficient, 153
insufficient, and 11 missing-anchor occurrences. That was a before-state
diagnostic. The current reviewed artifact covers all 711 occurrences:

| Disposition | Count | Product meaning |
|---|---:|---|
| Certified Nigerian curriculum link | 547 | Publish the relationship with exact curriculum anchors |
| Resolved Nigerian bridge link | 163 | Publish as a guided bridge, not an automatic qualification |
| Removed unsupported candidate | 1 | Keep in audit; do not seed/display as active |

Therefore, the 153 were not silently erased or treated as exact matches. They
were reclassified through the reviewed disposition layer. The remaining
bounded states are also explicit: 220 intentional partial definitions, 135 no
source-candidate records, 26 unmatched WEF signals, two ambiguous WEF signals,
and four visible global-only roles. “Reviewed” means a disposition exists; it
does not mean every item has an exact Nigerian counterpart, tool, certification,
regulatory requirement, or local demand signal.

The population gate currently reports integrity success and permits SQL
regeneration after the refreshed 5,795-row audit and review ledger were
reconciled. The regenerated SQL remains a delivery artifact: it must be
audited and applied only in a controlled Supabase run.

## 5. Complete taxonomy source register

The following is the complete source catalog currently routed by
`domain_role_source_registry.json`. It is included here so an academic reader
does not need repository access to know which source families were used. A
catalog entry is a routing declaration; the evidence audits separately record
whether the source was actually checked in an extract or source document.

### Global, international, and specialist sources

| Source ID | Source | Public location |
|---|---|---|
| `global_esco` | ESCO occupations and skills | [ESCO](https://esco.ec.europa.eu/en/use-esco) |
| `global_onet` | O*NET 31.0 Database | [O*NET](https://www.onetcenter.org/database.html) |
| `global_isco` | ILO ISCO-08 | [ISCO](https://isco.ilo.org/en/isco-08/) |
| `global_wef` | World Economic Forum Future of Jobs 2025 | [WEF](https://www.weforum.org/publications/the-future-of-jobs-report-2025/) |
| `global_sfia` | SFIA 9 | [SFIA](https://sfia-online.org/en/sfia-9) |
| `global_nice` | NIST NICE Workforce Framework | [NICE](https://www.nist.gov/itl/applied-cybersecurity/nice/nice-framework-resource-center) |
| `global_ecsf` | European Cybersecurity Skills Framework (ENISA), v1 with web-tool edit dated 11 April 2025 | [ENISA ECSF](https://www.enisa.europa.eu/topics/skills-and-competences/skills-development/european-cybersecurity-skills-framework-ecsf) |
| `global_supply_chain` | ASCM supply-chain body of knowledge | [ASCM](https://www.ascm.org/) |
| `global_cips` | CIPS Global Standard for Procurement and Supply | [CIPS](https://www.cips.org/intelligence-hub/global-standard-for-procurement-and-supply) |
| `global_project_management` | Project Management Institute standards | [PMI](https://www.pmi.org/standards) |
| `global_health` | WHO health workforce resources | [WHO](https://www.who.int/teams/health-workforce) |
| `global_fao` | FAO agriculture and food-systems resources | [FAO](https://www.fao.org/) |
| `global_woah` | WOAH animal-health standards | [WOAH](https://www.woah.org/) |
| `global_icao_iata` | ICAO and IATA aviation standards | [ICAO](https://www.icao.int/) / [IATA](https://www.iata.org/) |
| `global_imo_imarest` | IMO and IMarEST maritime standards | [IMO](https://www.imo.org/) / [IMarEST](https://www.imarest.org/) |
| `global_built_environment` | RICS built-environment and property standards | [RICS](https://www.rics.org/) |
| `global_energy` | SPE petroleum-engineering competency resources | [SPE](https://www.spe.org/en/training/competency-management/) |
| `global_nuclear` | IAEA nuclear and radiation resources | [IAEA](https://www.iaea.org/) |
| `global_unesco` | UNESCO education, science, and culture resources | [UNESCO](https://www.unesco.org/) |
| `global_creative` | ScreenSkills creative-industry role profiles | [ScreenSkills](https://www.screenskills.com/) |
| `global_game_dev` | International Game Developers Association resources | [IGDA](https://igda.org/resources/) |
| `tesda_psf_game_development` | Philippine Skills Framework for Game Development | [TESDA framework](https://www.tesda.gov.ph/Uploads/File/Philippine%20Skills%20Framework/PSF%20-%20Game%20Development.pdf) |
| `global_xr` | Khronos Group open standards | [Khronos](https://www.khronos.org/) |
| `qt_cfqt` | European Competence Framework for Quantum Technologies v3.0 | [Quantum Flagship CFQT](https://qt.eu/media/pdf/Competence_Framework_for_QT_v3.0_2025_official-version.pdf) |
| `nac_arts_technical_theatre` | Singapore National Arts Council Technical Theatre and Production framework | [Skills Framework](https://www.skillsfuture.gov.sg/docs/default-source/skills-framework/skills-framework-for-arts-%28technical-theatre-production%29.pdf) |
| `skills_england_live_event` | Skills England Live Event Technician standard | [Skills England](https://occupational-maps.skillsengland.education.gov.uk/maps/occupation/OCC1297A) |
| `mqa_performing_arts` | Malaysian Qualifications Agency Performing Arts standards | [MQA](https://www2.mqa.gov.my/qad/v2/pekeliling/2025/Programme%20Standards_Performing%20Arts%20FINAL_26.3.25.pdf) |
| `jff_xr` | JFF XR and Immersive Learning Career Pathways Framework | [JFF](https://www.jff.org/idea/immersive-learning-xr-technology-skills-and-careers/) |
| `arm_robotics_career` | ARM RoboticsCareer competency pathways | [RoboticsCareer](https://www.roboticscareer.org/careers) |
| `skills_england_robotics` | Skills England Robotics Engineer occupational maps | [Robotics Engineer](https://occupational-maps.skillsengland.education.gov.uk/maps/occupation/OCC1317) / [Advanced Robotics](https://occupational-maps.skillsengland.education.gov.uk/maps/occupation/OCC1381) |
| `british_esports` | British Esports career pathways | [British Esports](https://britishesports.org/esports-and-education/career-pathways/) |
| `pearson_esports` | Pearson BTEC Esports career pathways | [Pearson BTEC](https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/esport/2024/specification-and-sample-assessments/9781292467900-btec-hnc-hnd-l45-esports-spc.pdf) |
| `global_esports` | Hitmarker esports and gaming jobs | [Hitmarker](https://hitmarker.net/) |
| `global_music` | IFPI global music-industry resources | [IFPI](https://www.ifpi.org/) |
| `global_wipo` | WIPO intellectual-property resources | [WIPO](https://www.wipo.int/) |
| `global_cfa_finance` | CFA Institute investment-profession resources | [CFA Institute](https://www.cfainstitute.org/) |
| `global_garp_risk` | Global Association of Risk Professionals resources | [GARP](https://www.garp.org/) |
| `global_driver_training` | DVSA National Standard for Driver and Rider Training | [DVSA](https://www.gov.uk/government/publications/national-standard-for-driver-and-rider-training/national-standard-for-driver-and-rider-training) |

### Nigerian sources

| Source ID | Source | Public location |
|---|---|---|
| `ng_jobberman` | Jobberman Nigeria jobs | [Jobberman](https://www.jobberman.com/jobs) |
| `ng_myjobmag` | MyJobMag Nigeria feeds | [MyJobMag](https://www.myjobmag.com/feeds) |
| `ng_nbs` | National Bureau of Statistics Labour Force Survey | [NBS microdata](https://microdata.nigerianstat.gov.ng/index.php/catalog/151/study-description) |
| `ng_national_ai` | Nigeria National Artificial Intelligence Strategy 2025 | Local checked PDF in source registry |
| `ng_nbte` | NBTE National Occupational Standards and curricula | [NBTE downloads](https://web.nbte.gov.ng/downloads) |
| `ng_cpn_syllabus_2021` | CPN 2021 Examination Syllabus | [CPN syllabus](https://www.cpn.gov.ng/download/2021_CPN_Examination_Syllabus%28Reviewed%29.pdf) |
| `ng_ncs` | Nigeria Computer Society | [NCS](https://www.ncs.org.ng/) |
| `ng_nsqf_nos` | NBTE NSQF and National Occupational Standards | [NSQF](https://www.web.nbte.gov.ng/nsqf) / [PUCNOS](https://www.digitalnbte.nbte.gov.ng/Public/PUCNOS) |
| `ng_cieeen` | Council for Innovative Engineering and Emerging Engineering | [CIEEEN](https://cieeen.gov.ng/) |
| `ng_health_ministry` | Federal Ministry of Health and Social Welfare | [Hospital services](https://health.gov.ng/hospital-services/) |
| `ng_mls` | Medical Laboratory Science Council of Nigeria | [MLSCN documents](https://mlscn.gov.ng/publications/mlscn-approved-documents) |
| `ng_clmis_corbon` | CORBON construction labour-market information and NOS | [CORBON CLMIS](https://www.clmis.corbon.gov.ng/nos) |
| `ng_qsrbn` | Quantity Surveyors Registration Board of Nigeria | [QSRBN](https://qsrbn.gov.ng/registration/) |
| `ng_nnra` | Nigerian Nuclear Regulatory Authority | [NNRA](https://nnra.gov.ng/) |
| `ng_trcn` | Teachers Registration Council of Nigeria | [TRCN](https://trcn.gov.ng/) |
| `ng_nogicjqs` | Nigerian Oil and Gas Industry Content Joint Qualification System | [NOGIC JQS](https://nogicjqs.gov.ng/) |
| `ng_cmd` | Centre for Management Development Nigeria | [CMD](https://www.cmd.gov.ng/) |
| `ng_nasrda` | National Space Research and Development Agency | [NASRDA](https://central.nasrda.gov.ng/departments/institute-of-space-science-engineering/) |
| `ng_nema` | National Emergency Management Agency | [NEMA](https://nema.gov.ng/) |
| `ng_fmacce` | Federal Ministry of Arts, Culture and Creative Economy | [FMaCCE](https://www.fmacce.gov.ng/department/entertainment-and-creative-economy-ece) |
| `ng_ican_syllabus` | Institute of Chartered Accountants of Nigeria 2026 syllabus | [ICAN syllabus](https://icanig.org/ican/assets/docs/ICAN_SYLLABUS_2026_Final_Updated_NEW.pdf) |
| `ng_cibn` | Chartered Institute of Bankers of Nigeria competency framework | [CIBN](https://portal.cibng.org/cb_competencyframework.asp) |
| `ng_nuj` | Nigeria Union of Journalists professional ethics | [NUJ ethics](https://nuj.org.ng/code-of-ethics-for-nigerian-journalists/) |
| `ng_nla` | Nigerian Library Association and LRCN context | [NLA](https://nla.org.ng/public/) |
| `ng_nicfost` | Nigerian Council of Food Science and Technology | [NICFOST](https://nicfost.gov.ng/) |
| `ng_nihotour` | NIHOTOUR RIVAC registration portal | [RIVAC](https://rivac.nihotour.gov.ng/) |
| `ng_fmafs` | Federal Ministry of Agriculture and Food Security | [FMAFS](https://agriculture.gov.ng/about-us/) |
| `ng_npa_psychology` | Nigerian Psychological Association | [NPA](https://npafct.org/) |
| `ng_fashion_council` | Nigerian Fashion Council and FADAN | [FADAN](https://fadan.ng/registration/) |
| `ng_sports_context` | Nigeria Olympic Committee sports context | [NOC](https://nigeriaolympic.org/athletes-commission/commissions/) |
| `ng_public_health_context` | NPHCDA and Nigerian public-health sources | [NPHCDA](https://nphcda.gov.ng/brief-history-mandate/) |
| `ng_nemet` | Nigeria Meteorological Agency | [NiMet](https://nimet.gov.ng/foi) |
| `ng_nimet` | Nigerian Meteorological Agency | [NiMet](https://nimet.gov.ng/foi) |
| `ng_nmdpra` | Nigerian upstream and midstream petroleum regulators | [NUPRC](https://www.nuprc.gov.ng/) / [NMDPRA](https://www.nmdpra.gov.ng/) |
| `ng_legal_context` | Nigerian legal, immigration, diplomacy and IP source set | [NBA](https://nigerianbar.org.ng/) |
| `ng_cipsmn` | Chartered Institute of Purchasing and Supply Management of Nigeria | [CIPSMN](https://www.cipsmn.org.ng/about) |
| `ng_nas_research` | Nigerian Academy of Science and national research sources | [NAS](https://nas.org.ng/) |
| `ng_nuc` | National Universities Commission CCMAS and standards | [NUC](https://www.nuc.edu.ng/) |
| `ng_cpn` | Computer Professionals Registration Council of Nigeria | [CPN](https://www.cpn.gov.ng/) |
| `ng_telecom` | NCC and NITDA ICT ecosystem sources | [NCC](https://www.ncc.gov.ng/) / [NITDA](https://nitda.gov.ng/) |
| `ng_engineering` | COREN and Nigerian Society of Engineers | [COREN](https://coren.gov.ng/) / [NSE](https://www.nse.org.ng/) |
| `ng_built_environment` | Nigerian built-environment regulators and bodies | [ARCON](https://arcon.gov.ng/) / [SURCON](https://surcon.org.ng/) |
| `ng_health` | Nigerian health-profession regulators | [MDCN](https://www.mdcn.gov.ng/) / [NMCN](https://www.nmcn.gov.ng/) / [PCN](https://www.pcn.gov.ng/) |
| `ng_finance` | Nigerian finance and accounting bodies/regulators | [ICAN](https://icanig.org/) / [SEC](https://sec.gov.ng/) / [CBN](https://www.cbn.gov.ng/) |
| `ng_business` | CIPM Nigeria and Nigerian Institute of Management | [CIPM](https://cipmnigeria.org/) |
| `ng_supply_chain` | CILT Nigeria and Nigerian supply-chain bodies | [CILT Nigeria](https://ciltnigeria.org/) |
| `ng_legal` | Nigerian Bar Association and legal regulators | [NBA](https://nigerianbar.org.ng/) |
| `ng_education` | NUC, NCCE and Nigerian education standards | [NCCE](https://ncce.gov.ng/) |
| `ng_agriculture` | Nigerian agriculture, food and veterinary authorities | [NAFDAC](https://www.nafdac.gov.ng/) / [VCN](https://vcn.gov.ng/) |
| `ng_energy` | Nigerian upstream, midstream and downstream energy regulators | [NUPRC](https://www.nuprc.gov.ng/) / [NMDPRA](https://www.nmdpra.gov.ng/) |
| `ng_aviation_maritime` | Nigerian aviation and maritime authorities | [NCAA](https://ncaa.gov.ng/) / [NIMASA](https://nimasa.gov.ng/) |
| `ng_creative` | Nigerian creative-industry and media sources | [NUJ](https://www.nuj.org.ng/) / [NFVCB](https://www.nfvcb.gov.ng/) |
| `ng_gaming` | National Lottery Regulatory Commission and Nigerian gaming ecosystem | [NLRC](https://nlrc-gov.ng/) |
| `ng_environment` | NESREA and Nigerian environmental regulators | [NESREA](https://nesrea.gov.ng/) |
| `ng_surcon` | Surveyors Council of Nigeria | [SURCON](https://www.surcon.gov.ng/) |
| `ng_mdcn` | Medical and Dental Council of Nigeria | [MDCN](https://www.mdcn.gov.ng/) |
| `ng_transport` | Federal Ministry of Transportation | [Transportation Ministry](https://transportation.gov.ng/about/) |
| `ng_aviation` | Federal Ministry of Aviation and Aerospace Development | [Aviation Ministry](https://aviation.gov.ng/index.php/about) |
| `ng_choice_game_developer_2026` | Choice Talents Nigeria game-developer vacancy | [Dated LinkedIn listing](https://ng.linkedin.com/jobs/view/game-developer-at-choice-talents-ltd-4453073421) |

### Source files used for the Nigerian admission layer

The JAMB input set is the ten files in `C:\Users\USER\Downloads\jamb
brochure`: `Administration.pdf`, `Agriculture.pdf`, `Arts _ Humanities.pdf`,
`Education.pdf`, `Engineering _ Enviromental _ Technology.pdf`, `Law.pdf`,
`Medica_Pharmaceutical Health Science.pdf`, `Sciences.pdf`, `Social Management
Science.pdf`, and `Specific Entry Requirements.pdf`.

The CCMAS input set is the following seventeen original PDFs in
`C:\Users\USER\Downloads\ccmas original documents`:

```text
Administration-and-Management.pdf
Agriculture-2023.pdf
Allied-Health-Sciences-2023.pdf
Architecture-CCMAS-2023-FINAL.pdf
Arts-CCMAS-2023-FINAL.pdf
Basic-Medical-Sciences-CCMAS-FINAL-December-26-2022.pdf
Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf
Computing-CCMAS-2023-FINAL.pdf
Education-CCMAS-2023-New.pdf
Engineering-Technology-CCMAS-2023-FINAL.pdf
Environmental-Sciences-CCMAS-2023-FINAL.pdf
Law-ALL.pdf
Medicine-and-Dentistry-CCMAS-2023-FINAL.pdf
Pharmacy-and-Pharmaceutical-Sciences-CCMAS-2023-FINAL.pdf
Sciences-CCMAS-2023-FINAL.pdf
Social-Sciences-CCMAS-FINAL-2023-A.pdf
Veterinary-Medicine-CCMAS-2023-FINAL.pdf
```

Their exact file hashes are recorded in the source traceability packet and
should be preserved with any future release packet. The extracted CCMAS text
files are derived working extracts, not substitutes for the original PDFs.

## 6. External references

- [JAMB FAQ](https://jamb.gov.ng/FAQ) — IBASS programme and UTME subject-combination guidance.
- [IBASS education brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-education.pdf)
- [IBASS sciences brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf)
- [IBASS arts brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf)
- [Official ISCO-08 page](https://isco.ilo.org/en/isco-08/)
- [ISCO-08 Volume 1](https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08%20EN%20Vol%201.pdf)
- [UN ISIC classification page](https://unstats.un.org/unsd/classifications/Econ/ISIC.cshtml)
- [ESCO use and classification resources](https://esco.ec.europa.eu/en/use-esco)

These links identify the public source. The repository audit artifacts identify
the local file, version/hash, extracted fact, locator, and mapping decision.

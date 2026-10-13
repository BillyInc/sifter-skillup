# Partition 02 — increment 013: rows 177–186 full-standard review

Recorded 2026-09-25 (Africa/Lagos). This is an append-only checkpoint; no active maps, canonical maps, seeds, SQL, APIs, or UI were edited. The audit compares current active links with both the preserved pre-fail-closed map and canonical candidate map. It also checks all selected scope rows against local CCMAS course/outcome records, official NUC sources and available item-specific institutional sources.

## Coverage and closure

- Canonical rows reviewed: **177–186** (10 identities).
- Full identity closure: **0/10**. All ten still need the exact official JAMB programme/awarding-institution table row and locator verified from the PDF; several have incomplete scope/outcome coverage and/or descendant-role evidence open.
- Partition rows remaining for systematic review: **94 (187–280)**.
- Total full-closure queue across rows 141–280: **140 identities**. Prior partial locator batches do not close identities.
- Overlay conflicts: no exact identity intersection in the enriched `jamb_nigerian_review_overlay_conflicts_2026-09-25.json`. No overlay claim was treated as independent verification. The unreferenced-CCMAS crosswalk has no exact-name lead among these ten rows.

## Source offering context and evidence boundary

The new occurrence-preserving source inventory lists one Sciences.pdf occurrence for each identity and these parser-only institution-token leads: Mathematical Sciences—PAAU; Computer Science with Mathematics—OAU; Electronics and Computer Technology—CALABAR; Electronics and Computer Systems—FOUNTAIN; Human Biology—ABUAD; Applied Botany—BAUCHI; Applied Biology and Genetics—REDEEMERS; Cell Biology & Genetics—LAGOS; Engineering Physics—OAU; Marine Biology & Fisheries—WESLEYUNI. Every occurrence is marked `offering_row_verified_against_pdf: false`, with no PDF table locator. These are not treated as official offering facts.

Primary source: [JAMB Degree Sciences brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf), accessed 2026-09-25. The programme catalogue is printed p. 452; the official search-indexed excerpt includes Mathematical Sciences/PAAU context and the Human Biology section (printed pp. 482 and 646, respectively). Those excerpts do not independently confirm the full awarder blocks for this batch; exact table locators and university tokens remain unresolved for all ten. The engineering brochure was also checked for the Engineering Physics variant, but an exact corresponding offering row was not confirmed.

## Course/outcome completeness check

Component refs and selected courses below are the exact saved scope entries in `jamb_curriculum_scopes_2026-08-17.json`; courses were joined by programme code/title to the local CCMAS records, then outcomes checked. The following selected course entries do not have an outcome or content summary in that local record: row 177 COS 101; row 181 COS 101; row 185 PHY 206, 213, 214, 414, 411, 421, 513, 529. Do not infer outcomes for these entries. Other selected rows had course outcome text available in the local extraction; use official NUC page locators below where found. Absence of a locally selected course is not proof that a university does not teach it; JAMB context and the institution-specific 30% curriculum remain material.

## Identity-by-identity audit

### 177 — MATHEMATICAL SCIENCES

Component/scope: Sciences::Mathematics, six selected rows (COS 101; MTH 101, 201, 308, 310, 407). MTH 308 outcomes explicitly require building and analysing mathematical models in biology, physics, chemistry and social sciences (NUC Sciences CCMAS printed p. 340); MTH 407 covers calculus of variations and integral transforms (p. 442). COS 101 has no local outcome record in this scope. Current active link D009 Data Science (functional); previous snapshot also had D014 Actuarial Science, which current/canonical removed. D009’s Applied Statistics & Computational Modelling subgroup is a possible foundation-only fit, but selected rows have no data-science, statistical-computing or data-engineering sequence; Data & AI Engineer and statistical-operations roles are not confirmed. Removing D014 is sensible absent probability, actuarial risk/insurance, or finance courses, but retain as candidate disposition rather than a map-edit instruction.

### 178 — COMPUTER SCIENCE WITH MATHEMATICS

Component/scope: Computing::Computer Science, 11 courses—MTH 101/102/201; COS 101/201/202; IFT 212; SEN 201; CSC 322/401/402. OAU’s official [Computer Science & Cybersecurity department page](https://computingscience.oauife.edu.ng/computer-science-cybersecurity/) and [undergraduate handbook](https://cse.oauife.edu.ng/wp-content/uploads/2023/03/undergradute_handbook.pdf), accessed 2026-09-25, establish Computer Science with Mathematics as an OAU programme option and describe computing/math foundations; the handbook page locator for its option-specific course table still needs capture. Current links: D001 Software Engineering (direct)—supported as a broad domain by the selected programming/software-engineering/algorithms courses; only matching software-development subgroup roles, not all systems-engineering roles. D003 AI (direct)—no AI/ML course among selected rows; direct tier unsupported. D005 Cloud, D056 Blockchain, D140 Robotics—no corresponding platform, protocol, control/robotics sequence; unsupported at domain and descendant level. Removed old D009 and D033 links; that removal aligns with lack of data-science or product-management sequence.

### 179 — ELECTRONICS AND COMPUTER TECHNOLOGY

Component/scope: only eight Computing::Computer Science courses, the same generic CS sequence (COS 101/201/202, IFT 212, SEN 201, CSC 322/401/402); no electronics-specific course appears. Current links D001 direct, D003 direct, D005, D056 and D140 functional. D001 supports the computer-science component at domain level. The other four links are unsupported by the selected outcomes (no AI, cloud-platform, blockchain, electronics/control or robotics courses). The named “Electronics” component is a confirmed omission from the saved curriculum slice, but not yet a proven omission from the university’s actual curriculum: verify CALABAR’s official offering and institution curriculum, and inspect the NUC Physics with Electronics CCMAS as a component candidate without assuming it is this JAMB offering. Exact JAMB institution row remains open. Old D009/D033 removals are consistent with unsupported data/product career expansion.

### 180 — ELECTRONICS AND COMPUTER SYSTEMS

Component/scope: nine Computing::Computer Science courses (adds CSC 308 Operating Systems to row 179); no electronics course. Current links identical to row 179. D001 is supported for the CS facet; D003/D005/D056/D140 are not supported by the selected course outcomes. Electronics is missing from the saved mapping scope; identify and verify the relevant official component/outcomes and FOUNTAIN offering context before proposing a component correction. No unsupported destination is confirmed for students. Prior D009/D033 removals align with the current scope evidence.

### 181 — HUMAN BIOLOGY

Component/scope: 22 selected Biology courses, including physiology, cell biology, hydrobiology, biostatistics, genetics, field work, wildlife, molecular biology, biotechnology and BIO 413 Bioinformatics; COS 101 has no local outcome evidence. The saved scope has no HMB-coded human anatomy/physiology sequence. ABUAD’s official [2021–2018 admission programme document](https://www.abuad.edu.ng/wp-content/uploads/2015/02/New-2017-2018-ADMISSION.pdf), p. 3, lists B.Sc. Human Biology; its [official sustainability course list](https://sdg.abuad.edu.ng/wp-content/uploads/2021/11/2021-ABUAD-SUSTAINABILITY-COURSES-FOR-UDERGRADUATE-STUDENTS.pdf) names Human Biology courses HMB 202, 204, 206, 301, 303, 305, 307, 309, 311, 313, 314, 316, 318 and 401/403/407/409. This is item-specific external evidence that the ABUAD offering has a specialized human-biology component absent from the saved generic Biology slice; course outcomes and full current handbook still need verification.

Current links: D027 Biomedical—human physiology/cell/molecular material may support a research facet, not clinical health-professional roles; need HMB outcomes and subgroup matching. D041 Research—domain-level research/field foundation only. D142 Bioinformatics—BIO 413 is introductory; specialist role tools/programming not established. D009 Data Science (adjacent)—biostatistics is a foundation only. D047 Agriculture, D118 Crop Production, D119 Livestock, D121 Forestry/Wildlife, D152 Museum Curation—broad occupations are not established by a human-biology curriculum; absent role-specific course/task evidence, do not expose as student paths. Prior D122 Medical Laboratory link was removed; that qualification boundary remains appropriate. D118 was added to current candidate set but is unsupported for Human Biology.

### 182 — APPLIED BOTANY

Component/scope: Sciences::Botany, only four selected courses (BOT 102, 302, 402, 414). BOT 414 outcomes cover plant molecular biology, genes, organelles, plant–microbe interaction and plant biotechnology (NUC Sciences CCMAS printed p. 152). Current links D142 Bioinformatics, D027 Biomedical, D121 Forestry/Wildlife, D047 Agriculture. D047 is plausible only for a bounded plant/agricultural-biology facet; it does not establish farm management, crop-production technician or forestry jobs. D121’s many mixed occupational subgroups exceed this four-course botany scope; only plant/conservation research roles might be relevant if specific evidence supports them. D142 has no bioinformatics course in the selected scope; D027 has no biomedical/clinical outcome; both are unsupported as career paths. Current D047 addition relative to the old snapshot is a candidate, not proof of restoration.

### 183 — APPLIED BIOLOGY AND GENETICS

Component/scope: 21 Biology courses, with Genetics I/II, cell/molecular biology, biostatistics, field courses, pest management, biotechnology and BIO 413. BIO 414 outcomes address DNA/RNA, gene regulation, replication, genetic transformation and applications in food, medicine and genetic engineering (NUC Sciences CCMAS printed p. 98); BIO 413 covers databases/genomics/proteomics (p. 100). Current links D142 Bioinformatics; D027 Biomedical; D041 Research; D047 Agriculture; D118 Crops; D119 Livestock; D121 Forestry/Wildlife; D152 Museum Curation; D009 Data Science (adjacent). D142 is a domain-level candidate, with specialist roles requiring programming/sequence-analysis evidence. D041 is research literacy. D027 is not a clinical/biomedical qualification. D047/D118/D119/D121/D152 extend beyond the selected biology/genetics learning outcomes into farm management, production, trades, forestry and curation; only precise biological research/conservation facets may be retained after descendant review. D009 remains at most statistical foundation, not data science route. D122 was removed from prior snapshot; medical-lab practice remains unsupported.

### 184 — CELL BIOLOGY & GENETICS

Component/scope: 20 Biology courses, similar to row 183 but no entrepreneurship course; includes BIO 413 and BIO 414. NUC outcomes same primary locators: BIO 414 p. 98, BIO 413 p. 100. Current links and provisional disposition mirror row 183. D142 and D041 are narrow domain-level candidates; D027 and D009 need distinct human-health or data-science task evidence; D047/D118/D119/D121/D152 are overbroad as occupational destinations. Current map adds D118 versus old snapshot, but selected cell/genetics coursework does not establish crop-production roles. D122 removal is consistent with the medical-lab qualification boundary.

### 185 — ENGINEERING PHYSICS

Component/scope: 22 courses selected from Sciences::Physics: general mechanics/electromagnetism, optics, energy/environment, quantum/statistical physics, solid-state, nuclear, biophysics, solar-system/astrophysics and entrepreneurship. Eight selected course records lack both local outcomes and summary: PHY 206, 213, 214, 414, 411, 421, 513 and 529. Do not infer their detailed learning outcomes from course titles. OAU’s official [Engineering Physics programme page](https://physics.oauife.edu.ng/academics/undergraduate/eph), accessed 2026-09-25, confirms the programme and lists EPH102 Energy and Society; it explicitly says programme overview and course requirements are unavailable, so it does not fill the eight missing outcome rows. The [OAU 2023 admission requirements PDF](https://oauife.edu.ng/wp-content/uploads/2023/05/OAU-ILE-IFE-Admission-Requiremants-into-Part-1-and-DE-for-Faculties-1.pdf), printed p. 7, lists Physics/Engineering Physics; this supports programme identity, not its full curriculum. NUC Engineering/Technology CCMAS and the institution's EPH curriculum must be checked before deciding if the saved Physics component is sufficient.

Current links D016 Electrical, D017 Mechanical, D019 Renewable Energy, D093 Electrical Installation, D041 Research, D059 Space Technology (adjacent). PHY 102 provides electricity/electromagnetism and PHY 206 is titled Energy and Environment, but missing outcomes prevent firm task judgments. D041 is domain-level research foundation. D016/D017/D093 roles require engineering/trade design, lab and safety outcomes not verified here; D019 requires energy-system design/install evidence; D059 requires space-system work beyond solar-system/astrophysics titles. All five occupational/technical destination paths remain evidence-needed; do not treat “Engineering Physics” in the JAMB programme name as automatic qualification for each engineering destination.

### 186 — MARINE BIOLOGY & FISHERIES

Component/scope: 17 selected courses from Sciences::Marine Science: introductory oceanography, marine ecology, physical/chemical oceanography, marine aquaculture, underwater operations, monitoring/analysis and marine-business/project courses. Official NUC Sciences CCMAS course structure places MSE 207 Marine Ecology, MSE 305 Marine Aquaculture and MSE 401 Marine Monitoring and Analysis in the programme (printed pp. 374–376); MSE 207 outcomes cover marine biotic communities and interactions (p. 387). Current links D041 Research, D072 Geospatial, D020 Environmental Engineering, D142 Bioinformatics, D120 Fisheries/Aquaculture. D120 has a narrow supportable aquaculture facet via MSE 305, but check Fish Farm Technician/Master and field-worker roles individually. D041 is research literacy/domain-level. D072 lacks a cited GIS/remote-sensing outcome. D020 environmental science is not engineering design; D142 has no computational-biology sequence. Prior D076 Maritime was removed; removal aligns because marine biology/fisheries is not naval architecture, navigation, deck/crew or commercial-diving training. Local JAMB institution occurrence token is WESLEYUNI but remains PDF-unverified.

## Current-link snapshot reconciliation and candidate disposition

Active map equals the canonical CCMAS-derived candidate set on these identities. Previous snapshot → active/canonical differences:

| Row | Removed | Added | Evidence disposition |
|---:|---|---|---|
| 177 | D014 | — | Removal consistent with no actuarial/risk-insurance course evidence. |
| 178–180 | D009, D033 each | — | Data-science and product-management paths unsupported by selected courses. |
| 181 | D122 | D118 | D122 qualification boundary supported; new D118 crop-production path unsupported by human-biology scope. |
| 182 | — | D047 | Agriculture is a narrow plant-science candidate only, not broad occupations. |
| 183 | D122 | — | Removal consistent with no medical-lab qualification evidence. |
| 184 | D122 | D118 | D122 removal supported; D118 not supported by the scoped cell/genetics courses. |
| 185 | — | — | No set delta; course outcomes still missing for eight rows. |
| 186 | D076 | — | Removal supported by distinction between marine life-sciences and maritime occupations. |

Disposition means evidence judgment only. It does not amend the canonical candidate set or promote a link to student guidance.

## Confirmed defects vs unresolved evidence

**Confirmed within the saved records:** rows 179 and 180 omit the named electronics component from their saved course scope; row 181's generic Biology slice omits ABUAD HMB-coded human-biology courses identified in that university’s own course list; row 185 has eight selected course rows without outcome/content evidence; rows 177/181 also include COS 101 without local outcome content. Multiple active occupational links (especially AI/cloud/blockchain/robotics for rows 178–180, broad agricultural/clinical paths in rows 181–184) exceed the selected evidence and must not be presented as confirmed student routes.

**Evidence-needed, not established defects:** JAMB table awarders/page locators for all ten; each named institution’s local 30% curriculum; exact NUC CCMAS component choice for Electronics and Engineering Physics; all eight PHY missing outcomes and COS 101 outcomes; source-backed role fit for every retained domain/subgroup/role; item-specific external learning resources for any confirmed gap. No unsupported path was promoted.

## Source and artifacts

- Primary JAMB: [Degree Sciences brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf), pp. 452, 482, 646 excerpts; accessed 2026-09-25. Exact offering-row locators remain open as above.
- Primary NUC: [Sciences CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf), MTH 308 p. 340, MTH 407 p. 442, BOT 414 p. 152, BIO 414 p. 98, BIO 413 p. 100, Marine Science structure pp. 374–376 and MSE 207 p. 387; accessed 2026-09-25.
- Primary NUC: [Computing CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf), checked for scope/course sequence; accessed 2026-09-25.
- Institution sources: OAU CS programme [department page](https://computingscience.oauife.edu.ng/computer-science-cybersecurity/) and [undergraduate handbook](https://cse.oauife.edu.ng/wp-content/uploads/2023/03/undergradute_handbook.pdf); ABUAD [Human Biology admissions PDF](https://www.abuad.edu.ng/wp-content/uploads/2015/02/New-2017-2018-ADMISSION.pdf) p. 3 and [Human Biology course listing](https://sdg.abuad.edu.ng/wp-content/uploads/2021/11/2021-ABUAD-SUSTAINABILITY-COURSES-FOR-UDERGRADUATE-STUDENTS.pdf); OAU [Engineering Physics page](https://physics.oauife.edu.ng/academics/undergraduate/eph) and [admission requirements PDF](https://oauife.edu.ng/wp-content/uploads/2023/05/OAU-ILE-IFE-Admission-Requiremants-into-Part-1-and-DE-for-Faculties-1.pdf) p. 7. All accessed 2026-09-25.
- Local comparison: scope JSON, programme mapping, current `jamb_domain_map.json`, preserved before-fail-closed snapshot, canonical candidate map, occurrence inventory, enriched overlay conflicts, NUC CCMAS course JSON, and `domain_structure.json` subgroup labels.

Next systematic slice: rows **187–196**.

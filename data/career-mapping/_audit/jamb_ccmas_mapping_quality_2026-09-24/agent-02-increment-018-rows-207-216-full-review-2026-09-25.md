# Partition 02 — increment 018: rows 207–216 full-standard checkpoint

Recorded 2026-09-25 (Africa/Lagos). Append-only checkpoint. No canonical mapping, active domain map, scope generator/input, seed, or SQL was edited.

## Coverage and closure counts

- Canonical JAMB identities inspected: **207–216 (10/10)**.
- Parsed source occurrences preserved: **10/10**, each currently one `Sciences.pdf` occurrence. Parsed awarder tokens are retained as leads only, not accepted as confirmed offering associations.
- Exact official JAMB offering-table row, awarder-cell geometry, and table/page locator verified: **0/10**. The official brochure and its printed catalogue page were checked, but the indexed PDF page 452 is a programme-name catalogue, not the per-institution offering table. The official live PDF is served to the browser extractor as a JavaScript shell; no institution token from the local parser is upgraded to verified.
- Saved CCMAS scope/course rows: **9 identities have course selections (179 courses total); row 208 has zero selected courses**. Local structured CCMAS join finds an outcome or content summary for **179/179 selected courses**. That verifies local extraction presence, not the correctness of each outcome against the original PDF.
- Candidate domain links inspected: **51** (including row 208's empty link list). Full evidence-based tier and descendant subgroup/role adjudication: **0/51 closed**. No downstream role is confirmed by this tranche.
- Full identity closure: **0/10**. All require precise JAMB offering-table capture; multiple rows also need corrected/expanded curriculum scopes and all links need semantic/downstream review.
- No curriculum is called unavailable. NUC CCMAS contains relevant curricula, including exact Brewing Science and Technology, Geology, Applied Geophysics, Marine Science, Chemistry, and Demography/Social Statistics components. No external curriculum search is needed to establish the identified gaps in this batch; unresolved facets should first be reconciled against the applicable CCMAS component(s).

## Primary sources and source limits

- JAMB, [Degree Sciences brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf), accessed 2026-09-25. Its indexed text exposes the general programme catalogue on printed p. 452, including `Industrial and Environmental Chemistry`, `Brewing Science and Technology`, `Geological Sciences`, `Geology and Petroleum Studies`, and other related titles. That catalogue verifies names only, not awarders or the institution association for each parsed occurrence. The exact offering rows remain to be read from the official table.
- NUC, [Sciences CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf), and [Social Sciences CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-2023-FINAL.pdf), accessed 2026-09-25. Cross-checked against checked-in `data/career-mapping/ccmas/sciences.json` and `social_sciences.json` for course titles, outcomes, and content summaries.
- Local audit inputs: `programme_mapping.json` rows 207–216; `jamb_curriculum_scopes_2026-08-17.json` ordinal rows 207–216; `jamb_offering_context_inventory_2026-09-25.json`; current JAMB scope/domain-link candidates. These prove current file contents and gaps, not final mapping correctness.

## Per-identity evidence and disposition

### 207 — Industrial and Environmental Chemistry

- Current override maps to Chemistry (CHM); the 26-course selection contains chemistry foundations/specialties, CHM 319 Environmental Chemistry, attachment/research, and chemistry entrepreneurship. The CCMAS set also contains separate Industrial Chemistry (ICH), a 42-course curriculum. The current scope is therefore a candidate component omission: audit ICH's industrial processes/materials courses against the `Industrial` facet instead of assuming the Chemistry package is complete.
- Parsed occurrence: Sciences.pdf row ordinal 139; token `FOUNTAIN` (unverified). Exact official table row and institution association not established.
- Current candidates: D041 research, D155 nanotechnology/materials, D141 quantum computing, D020 environmental engineering, D027 biomedical, D055 chemical engineering, D025 pharmacy (functional), D122 medical laboratory technology (adjacent). CHM 319 supports environmental-chemistry study, but does not by itself qualify environmental-engineering practice. The chemistry curriculum does not establish quantum computing, biomedical occupations, pharmacy, or medical-laboratory practice. Industrial Chemistry may support bounded process/chemical-industry facets after the scope is corrected, but it does not automatically establish chemical-engineering roles. D041 is a learning/research foundation, not an occupation destination. No subgroup/role is accepted from these broad domains.

### 208 — Brewing Science and Technology

- Current canonical mapping names CCMAS `BST` / Brewing Science and Technology and scope status says `full`, but the JAMB scope has **zero selected courses and zero domain links**. This is a confirmed materialization/scope omission: the checked-in NUC Sciences CCMAS contains an exact 40-course BST programme. It includes BST 221 Introduction to Brewing Science (outcomes include explaining transformation of raw ingredients and brewing/distillation processes), BST 311 Raw Materials in Brewing (ingredient, malt/yeast and industrial-site learning), BST 321 Brew-House Theory and Technology (practical small/intermediate-scale brewing and production planning), BST 425 hygiene/safety, and BST 512 brewing calculations and plant design. The exact component exists; restore a sourced course/outcome scope before assessing career links. Do not equate “full” status with actual populated courses.
- Parsed occurrence: Sciences.pdf row ordinal 140; token `UNI-ILESA` (unverified). No exact official table row/page or institution-cell association was verified.
- With no selected course scope and no candidate links, no brewery, food science, chemical-process, quality/safety or production subgroup/role can be accepted yet. The CCMAS outcome examples support course selection work, not automatic job-path publication.

### 209 — Geological Sciences

- Current mapped component is Geology (GEY); 13 selected courses include GEY 209 Introductory Surveying; GEY 210/212/310 structural/geological mapping; GEY 308/409 geophysics; GEY 404 Economic Geology; GEY 410 Engineering Geology; and a research project. Local outcomes for GEY 310 describe carrying out independent field mapping and producing/interpreting geological maps; GEY 404 covers mineral deposits and exploration methods.
- Parsed occurrence: Sciences.pdf row ordinal 142; token `UNIZIK` (unverified). Exact official table cell remains open.
- Current links D072 Geospatial Science (direct), D022 Mining, D156 Land Surveying/Cadastral Mapping, D054 Oil, and D041 Scientific Research (functional). The mapping courses support a bounded geological field-mapping/interpretation facet, not every geospatial occupation. Introductory Surveying is not evidence of licensed cadastral-surveyor preparation. Economic Geology may support mineral exploration, not all mining roles. The current scope shown here does not include GEY 408 Petroleum Geology, so D054's petroleum facet lacks an explicit selected anchor. Research-project work supports research literacy, not a separate job guarantee. Reassess link tiers and roles from the exact scoped outcomes.

### 210 — Geology and Mineral Sciences

- Current GEY scope has 23 courses, including crystallography/mineralogy, petrology, structural geology, geological and remote-sensing mapping, Economic Geology, Petroleum Geology, Applied Geophysics, Engineering Geology, Hydrogeology, and a project. This better represents the named mineral-science facet than row 209's scope.
- Parsed occurrence: Sciences.pdf row ordinal 143; token `CRAWFORD` (unverified). Exact official offering association is open.
- Current links D072 Geospatial Science (direct), D022 Mining, D156 Land Surveying/Cadastral Mapping, D054 Oil, D041 Research (functional). GEY 404 plus mineralogy support mineral occurrence/exploration learning; they do not establish all mining-engineering/operations jobs. GEY 408 is a petroleum-geology course, not petroleum engineering. GEY 209/310 mapping supports geological mapping but not licensure as a land surveyor. D072 is a candidate for bounded mapping/remote-sensing applications; its `direct` tier should not be inherited without comparison to the actual domain definition and course outcomes. Descendant roles remain unverified.

### 211 — Geology and Geophysics

- Current mapped component: Applied Geophysics (GPH); 20 selected courses include core geology, magnetic/seismic/electrical prospecting, geophysical field acquisition/interpretation, well logging, engineering geophysics, groundwater/borehole, environmental geophysics and petroleum geology. Local GPH 305 outcomes include field data acquisition; GPH 308 includes interpretation of seismic/geophysical data; GPH 312 covers electrical/EM mapping for mineral/hydrocarbon exploration; GPH 414 includes pollution and groundwater-quality work.
- Parsed occurrence: Sciences.pdf row ordinal 144; token `AEFUNA` (unverified); exact table association is open.
- Current links D072 Geospatial Science and D022 Mining (direct), D041 research, D020 Environmental Engineering, D059 Space Technology, D054 Oil, and D156 Land Surveying (functional). Geophysical acquisition/exploration is supported, but the current direct `Mining`/`Geospatial` tiers need a specific domain comparison. D059 Space Technology has no space-system curriculum anchor and is unsupported. Environmental pollution/groundwater outcomes are not an environmental-engineering qualification; hydrocarbon prospecting is a bounded oil-sector application, not all oil roles. Basic surveying/cartographic tasks do not establish land-surveyor roles. No descendants accepted.

### 212 — Geology and Applied Geophysics

- Same 20-course GEY+GPH selected set and current links as row 211; same parsed occurrence pattern with Sciences.pdf row ordinal 145 and token `HENSARD` (unverified).
- The `Applied` facet has support in GPH methods, fieldwork, data interpretation, engineering/geotechnical, groundwater and environmental applications. The source table/institution association remains unverified. Apply the same tier limits as row 211; do not treat it as evidence for space technology, licensed surveying, or all mining/oil/environmental-engineering roles. The identical scope is plausible as a common CCMAS core, but the institution-specific JAMB offering evidence has not been captured, so retain that as a lead rather than proof.

### 213 — Geology and Petroleum Studies

- Current scope maps Geology (GEY), with 22 courses including GEY 408 Petroleum Geology, GEY 409 Applied Geophysics, Economic Geology, mapping, engineering geology, hydrogeology, petroleum-geology outcomes and geoscience attachment/project.
- Parsed occurrence: Sciences.pdf row ordinal 146; token `WESTERN-DEL` (unverified); exact official table row remains open.
- Current links D072 Geospatial Science (direct), D022 Mining, D156 Land Surveying, D054 Oil, D041 research (functional). GEY 408 supports petroleum-system/geology learning and D054 is a reasonable bounded domain candidate, but it does not establish petroleum engineering, drilling operations or all oil occupations. Economic geology may support mineral exploration, not full mining roles. The mapping courses do not establish cadastral licensure. Reassess D072 `direct` against the specific geospatial domain and keep roles unconfirmed.

### 214 — Geology and Mineral Science

- Current scope repeats 22 GEY courses for the singular `Mineral Science` title: mineralogy/crystallography, mapping/remote sensing, economic and petroleum geology, applied geophysics, hydrogeology and engineering geology.
- Parsed occurrence: Sciences.pdf row ordinal 147; token `KWASU` (unverified). Exact official offering association is open.
- Current links are the same five as row 210. Treat the name difference from `Geology and Mineral Sciences` (row 210) as a potentially meaningful source identity; do not merge institutional contexts simply because scopes currently match. Mineralogical course evidence supports the subject facet; it does not establish the entire mining industry or professional surveyor path. D054 may be supported only to the limited extent GEY 408 is truly part of the row's scoped courses. All current link tiers and descendants remain unadjudicated.

### 215 — Marine Geology

- Current override maps to Marine Science (MSE); 13 selected courses cover oceanography, marine ecology, oceanic crust/floor, chemical/physical oceanography, aquaculture, underwater operations, marine monitoring, and a project. MSE 301's local outcome explicitly addresses geology/geochemistry of oceanic crust, plate tectonics and ocean formation—useful direct course evidence for the named facet. However, the scope contains no selected GEY geology courses (e.g. mineralogy, geological mapping or geophysics); check whether the curriculum needs both Marine Science and Geology components rather than treating the Marine Science slice as exhaustive.
- Parsed occurrence: Sciences.pdf row ordinal 148; token `MARITIME-UNI` (unverified), with no exact official table association verified.
- Current candidates D072 Geospatial Science, D020 Environmental Engineering, D142 Bioinformatics/Computational Biology, and D120 Fisheries/Aquaculture (all functional). MSE 301 does not establish geospatial occupations; MSE monitoring/ecology does not establish environmental-engineering roles; no bioinformatics evidence is in this selected slice; MSE 305 Marine Aquaculture may support a bounded aquaculture learning facet but not every fisheries/aquaculture role. Re-evaluate D120 at the course/subgroup level and remove unsupported downstream interpretations.

### 216 — Statistics with Demography

- Current mapped component is Demography and Social Statistics (DSS); 20 selected DSS courses cover population/demographic data, social statistics, census, labour-force measurement, population cartography, demographic data evaluation/projection, and advanced social-statistics methods. DSS 304 outcomes include selecting/applying software for univariate, bivariate and multivariate data; DSS 309 covers population cartography; DSS 405/406 cover social-statistical inference, regression/correlation and non-parametric methods.
- Parsed occurrence: Sciences.pdf row ordinal 151; token `GOUU` (unverified); exact JAMB table cell is open.
- Separate Sciences CCMAS Statistics (STA) exists; no STA course is selected. The DSS curriculum directly represents Demography and includes statistical applications, but whether the `Statistics` portion is adequately represented by DSS alone remains open. Compare selected DSS statistics outcomes with the relevant STA outcomes; do not infer that either full standalone curriculum automatically applies to this programme.
- Current links D009 Data Science, D063 Economics, D072 Geospatial Science, D078 Social Sciences, D130 Recruitment/Employment (functional). DSS 304 may support bounded statistical analysis, DSS 309 supports demographic/cartographic work, DSS 307/308 support labour-force concepts. Those do not make the programme a general data-science, economics, GIS, social-science, or HR qualification. D130's labor-force subject matter is not workforce-recruitment practice; D072 cartography is not the full geospatial occupation set. Reassess with a direct Demography/Statistics domain if the taxonomy has one, then validate each subgroup/role separately.

## Full-standard findings from this batch

1. **Confirmed defect:** row 208 says `full` but materializes no course or link data even though the exact 40-course NUC CCMAS Brewing Science and Technology package exists. The scope is empty and cannot support any student pathway until rebuilt.
2. **Strong scope-repair candidates:** row 207 currently uses Chemistry without the separate Industrial Chemistry package; row 215 uses Marine Science without any selected Geology component; row 216 uses DSS alone despite a substantive Statistics facet and a separate NUC Statistics CCMAS. These are held as scope adequacy questions until course-by-course mapping is reconciled.
3. **Confirmed overclaim risk in existing destinations:** row 211/212 D059 Space Technology has no selected space-system course; row 209 D054 Oil has no selected Petroleum Geology course; rows 207 D141 quantum computing and D025 pharmacy lack relevant scoped pathways; row 215 D142 bioinformatics lacks an anchor. Do not expose those as established curriculum routes. Other broad domains/role sets likewise need semantic tier review.
4. **Source context:** 10 parser occurrences are preserved, but none has a verified institution-to-row connection. The brochure's official indexed catalogue is not a substitute for the table. Do not use parsed institution tokens as confirmed JAMB context.
5. No external fallback/unavailable judgement was needed: relevant CCMAS source programmes were found. No map or SQL updates are proposed by this checkpoint.

## Next systematic batch

Continue sequentially with rows **217–226**. Keep rows 207–216 open until official JAMB table contexts, the row-208 course scope, composite-scope adequacy, 51 link tiers, and descendant subgroups/roles are evidenced and reconciled.

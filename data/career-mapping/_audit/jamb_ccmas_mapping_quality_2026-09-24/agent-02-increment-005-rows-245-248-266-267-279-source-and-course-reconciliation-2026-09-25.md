# Rows 141–280: increment 005 — combined-scope source and curriculum reconciliation

Date checked: 2026-09-25  
Lane: rows 141–280; focused on empty combined scopes 245, 248, 266, 267, and 279.  
Status: audit checkpoint only. No canonical mapping, curriculum scope, seed, SQL, or UI changes.

## Gate result

All five saved curriculum-scope rows still have **zero selected courses**. Component references are candidates, not proof that a JAMB offering follows those courses. I rechecked the row-aligned canonical mapping, scope rows, active domain links, parsed offering ledgers, JAMB brochure tables, NUC CCMAS course structures/outcomes, and earlier link-by-link downstream dispositions. The JAMB brochure identifies the source-facing programme/options and institution contexts; CCMAS supports candidate curriculum components. Neither source alone binds a course schedule to every named university. Therefore no course is promoted into a JAMB scope and none of the links is cleared for student display.

## Row 279 — Creative Arts (13 links)

### JAMB source contexts

- The JAMB Arts brochure's printed p. 140 table has a `CREATIVE ARTS` entry and gives the options as **Visual Arts, Music & Theatre Arts, Film Studies**. Its institution list is DOU, LAGOS, PHC, UNN and TASUED. Do not union the contaminated institution spillover in `arts_hum_offerings.json` into this list. The same Arts source separately lists Fine Arts and Design; this does not make every Creative Arts option a Fine Arts degree.
- The Education brochure separately lists `CREATIVE ARTS` under Faculty of Education for TASUED (printed p. 322). This is a distinct Education offering context, not evidence to silently apply the general Arts component set. The structured `education_offerings.json` ledger currently omits this occurrence.
- These two records establish an Arts-context option set and a separate TASUED Education-context offering. They do **not** say which of the Arts options each institution actually offers. Preserve option/faculty context until the university-specific offering is resolved.

### CCMAS component and outcome cross-check

Current scope refs are `Arts::Theatre Arts`, `Arts::Film Production`, `Arts::Music`; there are no selected course codes. NUC Arts CCMAS has distinct curricula for Theatre Arts, Film Production and Music. Examples of fit-for-purpose course evidence include FIP 205 (screenwriting, direction, production design), FIP 207/208 and FIP 303/304 (cinematography/sound/film editing), FIP 306 (short-film capstone), MUS 302/402 (music technology), and THA 103/205/209 (theatre design/technology, acting, and workshop production). The CCMAS outcomes support media/film production and performing-arts facets, but do not convert all general creative work into journalism, brand marketing, UI/UX, recruitment, sales, or game design.

The Arts-option note explicitly includes **Visual Arts**, but the saved component refs omit Fine and Applied Arts. The NUC Environmental Sciences CCMAS has a separate Fine and Applied Arts programme: FAA 121 covers visual language, colour and formal design principles; FAA 231/232 cover two- and three-dimensional design; its digital-art/design course covers digital practice. This is a substantive candidate component for the Visual Arts option. Adding the whole component to every institution would still require source-context confirmation and a carefully selected course slice.

The Education-context TASUED entry is not the same curriculum. NUC's Education CCMAS contains a separate Creative Arts Education programme (teacher preparation, including Fine and Applied Arts, Music, Dance, Drama/crafts and education outcomes). Keep that candidate distinct from the general Arts Creative Arts options.

### Downstream review of all 13 current links

The domain/subgroup/role fit was checked against the candidate course outcomes and the saved-scope gap. These are conservative audit dispositions; because no courses are selected for this JAMB scope, even a curriculum-level fit below is not yet an approved JAMB path.

| Domain | Current type | Candidate fit / disposition |
|---|---|---|
| D070 Performing Arts & Entertainment | direct | Core candidate for the Theatre Arts option; constrain paths to evidenced performance, direction, stage and production work. Not every D070 music/entertainment role is implied. |
| D030 Marketing, Brand | functional | Unsupported as marketing/brand preparation. Film audience/industry context is not brand strategy or campaigns. |
| D043 Journalism | functional | Unsupported as journalism. Scriptwriting/performance/music are not reporting, verification, editorial or journalism-law preparation. |
| D042 Media Production | direct | Strong candidate for Film Production option only. Restrict to evidenced film/screen production tasks; do not inherit all broadcast/animation branches. |
| D153 Music Production | functional | Conditional, narrow candidate: MUS 302/402 and FIP sound-design courses may support music/audio production facets. Bind exact outcomes to the option and distinguish production from performance/musicology. |
| D168 Esports & Creator Economy | functional | Unsupported: no esports, streaming business or creator monetization outcomes. |
| D007 UI/UX Design | functional | Unsupported: visual/camera design is not interaction design or usability practice. |
| D130 Recruitment, Employment | functional | Unsupported: casting/crew selection is not recruitment or talent-acquisition training. |
| D031 Sales | functional | Unsupported: distribution/entrepreneurship alone is not sales/account-management training. |
| D044 Graphic Design | functional | Candidate only if Fine and Applied Arts/film-design course outcomes are actually selected; do not infer a graphic-design path from film production design. |
| D139 Game Design | functional | Unsupported: no game mechanics, engine, interactive design, prototyping or playtesting outcomes. |
| D039 Higher Education | functional | Not a preparation link from a general Music degree; subject knowledge alone does not teach pedagogy or qualify a lecturer. |
| D040 Vocational | functional | Not established: practical arts training alone is not instructor pedagogy, assessment or vocational teacher preparation. |

Downstream branch limits matter: D070/D042/D153 have role families broader than the candidate film/theatre/music tasks. Even if a later course slice supports those domains, it does not validate every subgroup or role beneath them.

## Four other empty combined scopes

### Row 245 — Dentistry and Dental Technology (20 links)

**JAMB context:** the Medical/Pharmaceutical/Health brochure's catalogue page (printed p. 428) includes the combined catalogue wording `Dentistry and Dental Technology`. The detailed awarding tables do not present one combined degree: the later table separates `Dentistry and Dental Surgery` (printed around pp. 434–435) from `Dental Technology` (printed around p. 436) and gives different institution rows. This is a confirmed source-context problem in treating the catalogue label as one universal, institution-identical curriculum. The parsed `medical_offerings.json` institution list contains section spillover tokens and unions the dental-surgery and dental-technology offerings; do not use it as the exact offering list.

**CCMAS:** the scope references Medicine and Dentistry `Bachelor of Dental Surgery (BDS/BChD)` plus Allied Health Sciences `Dental Technology`, but selects no courses. They are separate programmes with different outcomes. In the NUC Allied Health CCMAS, DNT 201 covers dental-material properties; DNT 205 is oral anatomy; DNT 207 is a dental-lab technique course. These illustrate a distinct dental-technology/laboratory facet, not a substitute for the BDS oral-diagnosis/treatment/clinical curriculum. The detailed DNT and BDS courses must be source-located and selected separately for each verified JAMB offering.

**Downstream:** the earlier 20-link audit supports D067 Dentistry only for the BDS offering and identifies a possible separate Dental Technology/Allied Health facet. The remaining broad links—medical imaging/lab, public health, medicine, bioinformatics, biomedical, neuroscience, research, OHS, community health, biomedical engineering, nursing, forensics, metal processing, materials, precision engineering, jewellery, allied health and ceramics—must not inherit confirmation from the combined label. DNT use of materials or lab tools is not preparation for every manufacturing/engineering occupation in those broad domains. Exact item-by-item retained facets need a selected course scope and role-branch filtering.

### Row 248 — Medical Rehabilitation (13 links)

**JAMB context:** the brochure's detailed `MEDICAL REHABILITATION` entry lists OAU with specialization in either Physiotherapy or Occupational Therapy, followed by UNIZIK and UNN (printed p. 444 in the 2024 brochure). OAU's own department page describes the Medical Rehabilitation programme as containing PT and OT options. This supports a two-track CCMAS candidate, but the institution wording is not identical across all listed universities; retain university/option context. The parsed medical-offering institution array is a spillover list, not an association list for this one table row.

**CCMAS:** current component refs are Allied Health `Physiotherapy` and `Occupational Therapy`, with no selected codes. Separate NUC Allied Health CCMAS outcomes demonstrate distinct pathways: PST 202 introduces Medical Rehabilitation scope/ethics; OCT 311 defines occupational therapy's role, scope, fields and multidisciplinary work. Select PT and OT outcomes independently rather than treating a blended identity as a single undifferentiated course set.

**Downstream:** D068 Allied Health is a legitimate disciplinary-family candidate, and D154 Exercise Science/Sports Therapy is tied only to the OT component in the current refs and needs a matching selected course slice. The existing D123 imaging, D137 medical physics/radiation, D165 wellness, D145 neuroscience, D064 psychology, D126 alternative medicine, D023 medicine, D024 nursing, D071 sports management, D124 community health and D025 pharmacy links are not general Medical Rehabilitation requirements. Earlier course/role review found them unsupported at their displayed breadth or only conditionally recoverable as narrow facets; do not show those broad role sets as confirmed.

### Row 266 — Forestry and Fisheries (16 links)

**JAMB context:** the Agriculture brochure catalogue list includes the display name `Forestry and Fisheries` (printed p. 75). In the accessible 2024 detailed awarding-institution tables, I did not find a matching table row with that exact title/institution list. The nearby detailed tables instead list Forestry/Forest Resources Management, Forestry and Wildlife, Fisheries and Aquaculture, and other distinct offerings. The parsed `agriculture_offerings.json` row is contaminated with non-institution headings such as `WILDLIFE`, `ENVIRONMENTAL`, `MGT.`, `TECHNOLOGY`, `AGRICULTURE AND`, `RESOURCE`, and `ECONOMICS`. Therefore the exact institution associations for this identity remain unverified; do not infer them by unioning adjacent rows or by inheriting row 267's institutions.

**CCMAS:** current refs are Agriculture `Forest Resources and Wildlife Management` and `Fisheries and Aquaculture`, with no selected courses. The NUC Agriculture CCMAS supports the named subjects: AGR 203 outcomes cover forest/wildlife species, forestry importance, seedling raising and forest enterprises; AGR 205 outcomes cover fisheries/aquaculture systems, their linkages, and economic, nutrition, environmental and sociocultural importance. Those are candidate course anchors, not selected JAMB course requirements. Forestry and Fisheries are substantive components; generic crop, livestock, veterinary, sales/marketing, general economics, environmental engineering, biomedical, food-science and broad research links require their own specific outcomes.

### Row 267 — Forestry, Wildlife & Fisheries (16 links)

**JAMB context:** unlike row 266, the Agriculture brochure has an exact detailed table `FORESTRY, WILDLIFE AND FISHERIES` listing **EKSU and OOU** (printed p. 135 in the 2024 brochure). It is an offering-specific combined title. Preserve that exact context; the current parsed list has a spillover string (`AND FISHERIES`) and is not itself authoritative, although its EKSU/OOU entries agree with the table.

**CCMAS and downstream:** the same two CCMAS components are plausible for this explicit combined offering, but the JAMB scope still needs a bounded set of course codes/outcomes from each component. Direct candidate domains are D121 Forestry/Wildlife and D120 Fisheries/Aquaculture, restricted to the corresponding taught branches. D041 research, D063 economics, D047 agriculture, D072 geospatial, D074 safety, D144 climate and all other link types require row-specific selected outcomes and downstream role checks. The D121 role/subgroup contamination noted in the earlier audit independently prevents a broad D121 role list from being treated as a clean student route.

## Exact-source references and access notes

JAMB brochure URLs (official IBASS source URLs; checked 2026-09-25):

- Arts: https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf — printed p. 140.
- Education: https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-education.pdf — printed p. 322.
- Medical/Pharmaceutical/Health: https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-medical.pdf — catalogue p. 428; detailed table pages around 434–436 for Dentistry/Dental Technology and p. 444 for Medical Rehabilitation. The live IBASS PDF URL rendered a JavaScript shell to the text browser; page locators were cross-checked against the 2024 brochure copy at https://myschoolgist.com/wp-content/uploads/2024/01/jamb-brochure-degree-medical-24.pdf.
- Agriculture: https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf — catalogue p. 75 and Forestry, Wildlife and Fisheries table p. 135. Page locators were cross-checked against the 2024 brochure copy at https://myschoolgist.com/152094/jamb-brochure-degree-agriculture-24.pdf. The exact `Forestry and Fisheries` title was located in the catalogue but not in the detailed table text available for this edition.

NUC CCMAS official sources (checked 2026-09-25):

- NUC CCMAS index: https://www.nuc.edu.ng/ccmas/
- Arts: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf — Film Production overview/course outcomes around printed pp. 242–267; course structures and outcomes; Theatre Arts/Music sections elsewhere in the same PDF.
- Environmental Sciences: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Environmental-Sciences-CCMAS-2023-FINAL.pdf — Fine and Applied Arts overview/course structure around printed pp. 222–237; FAA 121 visual-design outcomes around pp. 233–234.
- Education: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf — Creative Arts Education programme; keep distinct from Arts Creative Arts.
- Allied Health Sciences: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf — Dental Technology DNT sequence/outcomes around printed pp. 110–123; Physiotherapy PST sequence around pp. 33–48; Occupational Therapy OCT 311 around pp. 448–465.
- Medicine and Dentistry: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Medicine-and-Dentistry-CCMAS-2023-FINAL.pdf — BDS/BChD programme overview around printed pp. 14 onward and the dental course sequence.
- Agriculture: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Agriculture-2023.pdf — AGR 203 forestry/wildlife and AGR 205 fisheries/aquaculture outcomes appear in the agriculture curriculum; the NUC download index identifies it as the Agriculture CCMAS.

## Next audit actions (no promotion implied)

1. Recover the original JAMB source text/page images used to build the source offering ledgers and record exact institution-row boundaries for all five contexts; especially resolve whether row 266 has any detailed institution offering or is catalogue-only in the relevant edition.
2. Record course codes and outcome locators for each option/component as a proposed, evidence-backed scope; keep them separate by source faculty/institution where the source distinguishes them.
3. Reassess each downstream link from those course outcomes, then inspect relevant subgroups and roles; exclude unsupported broad domains and contaminated role branches.
4. Keep every `selected_course_codes` array empty until those source-context and course-scope joins are evidenced. This checkpoint is not seed-ready and does not close rows 141–280.

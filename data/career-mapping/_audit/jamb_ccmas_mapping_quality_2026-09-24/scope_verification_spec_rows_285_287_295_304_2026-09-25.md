# Scope-first verification checkpoint — JAMB rows 285, 287, 295, 304

Recorded 2026-09-25 (Africa/Lagos). Research/specification only. This checkpoint does not modify canonical JAMB identities, CCMAS scopes, derived/active domain maps, seeds, SQL, roles, or taxonomy labels. Do not apply a component union until the offering context and its permitted curriculum boundary below are resolved.

## Decision summary

| Row | Exact JAMB identity/context | CCMAS/external scope finding | Current disposition |
|---:|---|---|---|
| 285 | **Portuguese/English — LASU** is an exact Arts-brochure offering. | No Portuguese programme exists in Arts CCMAS. LASU sources independently corroborate a BA Portuguese/English combined-honours award, but the located sources do not provide its programme course/outcome table. Existing French CCMAS scope is unrelated. | Confirm identity; reject French scope as support. Do not replace it with an invented Portuguese/English course union. Obtain LASU programme syllabus; use only an English CCMAS subset whose outcomes match that syllabus, plus the sourced Portuguese curriculum. |
| 287 | Exact catalogue title **French and German/Russian** appears in JAMB’s Arts title list. The parsed institution tokens (“INTERNATIONAL RELATIONS”, “BABCOCK”, “NOUN”) are adjacent-row contamination; no exact awarder was established in the offering table reviewed. | Linguistically this denotes French + **one of** German or Russian, not all three. NUC has separate French, German and Russian programmes; their source syllabi can support two alternative component sets, but not the awarder or which alternative applies. | Keep unresolved/fail-closed. Do not infer UNN, Ibadan, Babcock or NOUN. Obtain the exact current JAMB awarder row and matching institutional variant before selecting either union. |
| 295 | **Russian with French/German — IBADAN** appears in the official JAMB Arts awarding-institution table. | NUC CCMAS separates Russian, French and German. The exact Ibadan University source describes Russian combined honours with **one of French/German**. Correct scope shape is Russian + French **or** Russian + German; never Russian + French + German. | Offering context resolved. Prepare two alternative bounded sets from the NUC language-specific courses; exact alternative is not selected by JAMB, so preserve both as alternatives, not a simultaneous union. No downstream links adjudicated here. |
| 304 | **Efik-Ibibio — UYO** appears in JAMB’s Arts offering table (printed p. 235); JAMB’s Education brochure separately lists **Education and Efik/Ibibio — UYO** (printed p. 241). | Arts CCMAS has separate BA Efik and BA Ibibio curricula; Education CCMAS separately has Efik-Ibibio Education. The University of Uyo’s located programme page calls its award B.A.(Ed) Efik-Ibibio. Therefore the two language curricula are relevant candidates, but the exact JAMB Arts occurrence’s degree/faculty identity conflicts with institution/NUC education evidence. | Do not silently treat the Arts identity as a plain BA or import Education courses. Conditional language-only set is EFK-coded courses + IBI-coded courses, preserving two source components; resolve the award/faculty context before promotion. |

## Row-specific evidence and bounded course specifications

### Row 285 — Portuguese/English

- **JAMB identity/locator:** official JAMB Arts brochure, printed p. 177 offering table: `PORTUGUESE/ENGLISH` followed by `LASU`. The checked-in text extraction confirms this exact local sequence. The subsequent UNIZIK “Modern and European Languages” and DOU “European Languages” entries are separate programme rows, not additional Portuguese/English awarders.
- **Offering corroboration:** LASU’s official staff profile records a BA (Portuguese/English Combined Honours), and official LASU admissions material includes Portuguese/English Language. These establish an LASU offering/name, but are not the LASU undergraduate course/outcome syllabus.
- **CCMAS boundary:** CCMAS Arts has no Portuguese programme. French-labelled rows such as FRE 105 (“Initiation into Translation”) do not establish Portuguese or English curriculum and cannot remain as the evidence for this identity.
- **Bounded next evidence request:** obtain the LASU Foreign Languages/Portuguese-English programme curriculum or course handbook. Then make a two-part scope: (1) only the Portuguese-language courses/outcomes explicitly in that LASU source; (2) only English CCMAS courses whose outcomes are shown to be part of the LASU combined offering. Exclude generic shared GST/FAC/ENT courses unless the LASU curriculum and row-level rule explicitly require them. Until the exact syllabus is available, neither a broad English degree union nor Portuguese course list is defensible.

### Row 287 — French and German/Russian

- **JAMB identity locator:** official JAMB Arts brochure printed p. 130 catalogue list includes the exact title. In the detailed offering extract, the fragments `INTERNATIONAL RELATIONS / BABCOCK / NOUN` sit with the neighboring **French and International Relations** row; the exact `French and German/Russian` title has no verified institution cell in the current evidence. Treat those parsed tokens as contamination, not awarders.
- **Alternative semantics:** the slash after German means **French + German OR French + Russian**. It does not authorize a three-language union.
- **Conditional bounded sets:** from the NUC Arts CCMAS, use language-code courses only: `FRE` + `GER` for the German route, or `FRE` + `RUS` for the Russian route. Exclude shared GST/ENT/FAC courses from the component union unless a verified institution-specific curriculum includes them. Keep the two alternatives separately keyed to the exact source offering; do not publish either while awarder/variant remains unknown.
- **Source locators:** NUC Arts CCMAS lists French (printed pp. 435–464), German (pp. 467–489), and Russian (pp. 491 onward) as distinct degree curricula. These are national component candidates, not proof that a particular institution offers this exact JAMB title.

### Row 295 — Russian with French/German

- **JAMB identity/context:** official JAMB Arts brochure printed pages 177–178, detailed offering table: `RUSSIAN WITH FRENCH/GERMAN` lists `IBADAN` in the awarding-institutions column. This is distinct from adjacent single-major `RUSSIAN` offerings at Ibadan, Lagos and UNN. The exact occurrence is University of Ibadan, not a generic Russian course identity.
- **Institution confirmation and alternative:** University of Ibadan’s official admission requirements and 2018 University Calendar list “Russian Combined Honours with one of French / German”. Thus retain two mutually exclusive variants; JAMB does not identify which option an individual student takes.
- **Bounded component sets:** NUC Arts CCMAS language-specific courses only: `RUS` + `FRE` for Russian/French, or `RUS` + `GER` for Russian/German. The local package’s language-code course families are 43 unique Russian codes (one duplicate `RUS 361` in the source inventory), 31 French codes (`FRE`/`FRN`), and 31 German `GER` codes. Shared GST/ENT/FAC items are outside this language-component union unless the Ibadan programme source explicitly includes them. The NUC course content/outcomes sections—not code/title string matches alone—must be used to bound the eventual student scope to language acquisition, communication, grammar, composition, oral/written practice, literature/culture and other outcomes actually stated for the selected courses.
- **Current gap:** the JAMB identity does not choose French versus German. Preserve the alternatives as alternatives and avoid asserting a single combined course set. No domain/subgroup/role links were reviewed in this checkpoint.

### Row 304 — Efik-Ibibio

- **JAMB context:** official Arts brochure printed p. 235 lists `EFIK-IBIBIO / UYO`; official Education brochure printed p. 241 separately lists `EDUCATION AND EFIK/IBIBIO / UYO`. Both are source occurrences, not interchangeable labels.
- **Conflict requiring resolution:** the University of Uyo’s official programme page lists B.A.(Ed) Efik-Ibibio. NUC Education CCMAS also has an Efik-Ibibio Education programme. NUC Arts, however, has distinct B.A Efik and B.A Ibibio programmes. This supports a dual-language content candidate but does not prove that the Arts-brochure row is a non-education B.A. or that Education pedagogy belongs in its scope.
- **Conditional bounded language set:** retain distinct references to NUC Arts `Efik` and `Ibibio`; include only the language-specific `EFK` and `IBI` course rows with matching outcomes. In the checked local NUC course inventory these are EFK 101–106, 201–205, 301–309, 401–406, 408–409 (28 rows) and IBI 101–103, 105–106, 201–207, 301–309, 401–409 (30 rows). Do not conflate similarly named courses across the two languages. Exclude common `GST`, `ENT`, and `FAC` rows and all education/pedagogy courses from this language-only candidate set pending exact award confirmation.
- **Outcome anchors to verify in the official PDF:** EFK and IBI introductory/history-language-culture courses; composition/comprehension and orthography; linguistics/phonetics/phonology; morphology/syntax; oral literature, prose/poetry, dialects, drama/film/music; lexicography, translation and research project. The official IBI 101 outcomes explicitly cover people/history, language-culture relation and orthography history; IBI 102 outcomes cover orthography, comprehension, public speaking, reasoning and writing. These are language outcomes, not proof of the degree’s award/faculty.
- **Outcome/source locators:** NUC Arts CCMAS, EFK 101 course outcomes at printed pp. 188–189 and EFK 102 begins p. 189; IBI 101 outcomes and contents at pp. 345–346, IBI 102 at p. 347 onward, with IBI 103 beginning p. 347. These directly establish each language’s own history/culture/orthography and composition/comprehension/linguistics scope. NUC Education CCMAS separately lists Efik-Ibibio Education. University of Uyo source lists B.A.(Ed), not plain BA.

## Exact local records inspected

- Canonical ordering: `data/career-mapping/programme_mapping.json` (the four identities are rows 285, 287, 295, 304 in the requested one-based ordering).
- Parsed detailed Arts offering text: `data/career-mapping/_jamb_txt/arts_hum.txt` and `data/career-mapping/jamb/arts_hum_offerings.json`.
- Current scope rows: `data/career-mapping/_audit/jamb_curriculum_scopes_2026-08-17.json`.
- NUC parsed course inventory: `data/career-mapping/ccmas/arts.json`; this local JSON stores titles/course summaries but the retrieved course `learning_outcomes` arrays are empty, so course outcomes must be cited/extracted from the official NUC CCMAS PDF rather than inferred from the local titles.
- Existing row-295 checkpoint: `coordinator-fix-increment-001-row-295-russian-composite-fail-closed-2026-09-25.md`; its prior downstream-link disposition was not reopened here.

## Sources

- JAMB [Arts degree brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf), printed pp. 130, 177–178, 235.
- JAMB [Education degree brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-education.pdf), printed p. 241.
- NUC [Arts CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf), B.A Efik and B.A Ibibio plus separate French, German and Russian course/outcome sections.
- NUC [Education CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf), separate Efik-Ibibio Education programme.
- University of Ibadan [admission requirements](https://ui.edu.ng/content/advertisement-course-requirements), [2018 University Calendar](https://ui.edu.ng/sites/default/files/2018%20University%20Calendar%2023%20May%2018.pdf), and [European Studies department](https://arts.ui.edu.ng/european-studies-0).
- University of Uyo [Curriculum Studies/Education Management and Planning programmes](https://uniuyo.edu.ng/faculty-of-education/curriculum-studies-education-mgt-planning/).
- LASU [academic staff profile for a Portuguese/English graduate](https://www.lasu.edu.ng/home/academic-staff/profile/?name=MOSHOOD-ADEBAYO), [2022/23 Foundation/JUPEB admissions notice](https://lasu.edu.ng/home/news_file/ADVERTISEMENT%20FOR%20ADMISSION%20INTO%20LASU%20FOUNDATION%20%28JUPEB%29%20PROGRAMME%20FOR%2020222023%20CALENDAR%20YEAR_1657187291.pdf), and [official LASU timetable record](https://lasu.edu.ng/cbt_venue/cbt.html). These corroborate the award/programme name but are not the missing LASU undergraduate curriculum.

## Next evidence actions

1. Retrieve the current LASU Portuguese/English undergraduate course handbook/syllabus; without it row 285 cannot receive a credible component course union.
2. Resolve row 287’s exact JAMB awarding institution and confirm whether it is a current offering or title-list-only entry; then choose French+German or French+Russian from that institution’s exact variant.
3. For row 295, obtain the University of Ibadan’s programme-level curriculum variant/option evidence and extract the relevant NUC course outcome tables; retain the one-of alternative.
4. For row 304, reconcile the Arts and Education JAMB occurrences with Uyo’s B.A.(Ed) and NUC’s distinct BA language versus Efik-Ibibio Education packages; extract exact EFK/IBI course outcomes and keep Education outcomes separate.
5. Only after these source/scope gates are complete should a serialized coordinator prepare row-local scope changes. This checkpoint makes no downstream mapping recommendation and no shared-data edit.

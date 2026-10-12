# Coordinator continuation — Batch 6: African and Asian Studies (row 292)

**Date:** 2026-09-25  
**Rows reviewed:** 292 (1-based `programme_mapping.json`)  
**Status:** Offering-context, component/course-outcome, both active domain links, and downstream fit review. Audit documentation only; no canonical mapping, seed, SQL, or UI edits.

**Evidence snapshot note:** Row 292’s two saved links currently agree with its two active-map links. The worktree copy of the saved-scope JSON is modified elsewhere relative to `HEAD`; across the full tranche its current totals diverge from the user-provided tracked-baseline 835 / 439 / 65 counts. I did not edit that JSON. The row-level findings below use the current row-292 entry and official source evidence; the tranche-wide counts are reported separately as baseline versus dirty worktree, not conflated.

## Identity and JAMB source context

The official JAMB Arts brochure lists `AFRICAN AND ASIAN STUDIES`, followed by UNIZIK, then a separate `LINGUISTICS/IGBO` line with AEFUNA and IMSU. The local parser has merged those adjacent rows: it assigns the canonical programme institutions `STUDIES`, `UNIZIK`, `ARTS`, `LINGUISTICS/IGBO`, `AEFUNA`, and `IMSU`. **UNIZIK, AEFUNA and IMSU are source-supported offering associations; `STUDIES`, `ARTS` and `LINGUISTICS/IGBO` are heading/programme fragments, not universities offering this identity.** Preserve the distinct Linguistics/Igbo programme occurrence and do not infer its mapping for AEFUNA or IMSU.

The JAMB brochure’s waiver says UNIZIK accepts Chinese in lieu of Igbo, which is important identity evidence for the Asian-language side. UNIZIK’s official undergraduate programme page identifies the degree as Igbo, African and Asian Studies and lists Chinese Language and Igbo Language options. This is useful institution-specific corroboration for UNIZIK only; it must not be generalized into an AEFUNA or IMSU curriculum.

## CCMAS scope and course-outcome verification

Current scope: one component, `Arts::History/History and Diplomatic Studies`; four selected courses, all Africa-focused: HIS 108 (African diaspora), HIS 203 (global slavery and slave trade), HIS 204 (Islam and Christianity in West Africa), and HIS 406 (Nigerian nation-building). These courses give partial African/history evidence but do not establish the named Asian Studies component.

The full History CCMAS contains HIS 105 `Major World Civilisations`; its stated outcomes cover major global civilizations, and its content lists Indians and Chinese. HIS 203 also mentions Chinese among historical slave-trading societies. These are broad survey references, not an adequate Asian Studies curriculum or an Asian-language learning path. **HIS 105 is not selected in this JAMB scope.** The scope cannot be treated as covering Asia merely because the parent History curriculum contains a world-civilization survey.

The external offering evidence establishes Chinese as an option at UNIZIK, but no corresponding Chinese/Asian CCMAS programme or course sequence was found in the checked Arts component. The Asian component therefore remains a confirmed coverage gap for UNIZIK pending a source-backed external learning scope. For AEFUNA and IMSU, the exact JAMB line is a catalogue association; their institution-specific options/curricula were not established in this increment. Do not mark the component unavailable: targeted external search and context-specific source locators remain outstanding.

**Confirmed local course-transcription defect:** the checked-in `HIS 108` `skills_learned`/`content_summary` contains Philosophy/Logic learning-outcome text appended after its African-diaspora outcomes. NUC’s Arts CCMAS gives the exact HIS 108 outcomes/content separately (printed pp. 324–325); the philosophy material belongs to the subsequent GST 212 course, not HIS 108. The local selected HIS 204 title is also truncated (`...1900 (3`). These are course-record alignment/title defects, not missing CCMAS evidence. Do not use the contaminated HIS 108 payload for downstream claims until the local source extraction is corrected.

## Both linked domains and downstream fit

| Domain | Current type | Course/outcome check and downstream disposition |
|---|---|---|
| D039 Higher Education | functional | The only scope anchor is HIS 406 `Nation Building in Nigeria Since 1945`; it teaches nation-building/history, not teaching, education research, instructional design, or university administration. D039 exposes 2 subgroups (`Deans & School Principals`, 11 roles; `Lecturers & Vocational Teachers`, 110 roles), including many discipline-specific lecturer/teacher roles. Neither the selected courses nor the JAMB title establish those occupations or the required teaching qualifications. Current functional link is unsupported as a student pathway; do not present the generic 121-role catalogue as this programme’s downstream. |
| D063 Economics | functional | Anchors are HIS 108 and HIS 204. Verified NUC outcomes cover African diaspora and West African religious history; HIS 204 discusses social/economic/political impacts in a historical setting, not economics methods, theory, statistics or economic analysis. D063 has Economic Policy & Analysis (4 slots) and Economic Research & Quantitative Policy (7), plus Teaching Professionals (2). None is supported by these two History courses. Current functional link is unsupported for this scope and should not be a confirmed student route. |

Both currently mapped destinations are thus unsupported by the selected course outcomes. This does not authorize adding a new domain based on the title; identify the actual verified African/Asian learning sequence first, then recalculate relevant domain links and narrow their downstream roles. A programme-level path should be limited to source-supported study/outcomes, not every role in Higher Education or Economics.

## Disposition

- **Confirmed:** JAMB’s parsed institution list contains title fragments; actual Arts identity is African and Asian Studies, with UNIZIK/AEFUNA/IMSU separated from the adjacent Linguistics/Igbo row.
- **Confirmed:** the four-course CCMAS scope covers selected African/history content but not an adequate Asian Studies component. The full parent History CCMAS has HIS 105, a general world-civilizations course, but it is not selected and is not by itself a dedicated Asian curriculum.
- **Confirmed:** checked-in HIS 108 has adjacent Philosophy/Logic content contamination; HIS 204 title is truncated.
- **Confirmed:** the two active domain links (Higher Education and Economics) are not substantiated by their cited selected-course outcomes; their generic subgroups/roles must not be treated as this programme’s student path.
- **Still open:** exact source-backed curriculum/learning resources for the Asian/Chinese component; offering-specific evidence for AEFUNA and IMSU; review of any role branches if new supported domains are later identified.

## Count boundaries

- Row 292 has 2 active and saved links; labels agree for this row.
- Tracked-baseline rows 281–420 remain at **835 total links**, **439 absent course-locator markers**, and **65 active-vs-saved relationship-label disagreements**. These are separate tranche-wide measures; this row changes none of them. The current dirty worktree saved-scope JSON recount is 451 / 107 / 7, while the active map remains 835; reconcile the dirty artifact separately.
- Next systematic row: 293. Previously checkpointed rows 288, 290 and 291 remain intact.

## Sources checked (accessed 2026-09-25)

- JAMB, [Arts and Humanities degree brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf), printed p. 198: the African and Asian Studies and Linguistics/Igbo table rows and UNIZIK Chinese-in-lieu-of-Igbo waiver; supports identity/offering context, not curriculum equivalence.
- NUC, [Arts CCMAS (2023)](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf), printed pp. 320–325: History course structure; HIS 105 outcomes/content at p. 324; HIS 108 outcomes/content at pp. 324–325. It supports the African/history scope and a general world-civilizations survey, not a dedicated Asian Studies curriculum.
- Nnamdi Azikiwe University, [Undergraduate Programme](https://unizik.edu.ng/undergraduate-programme): the official programme table lists Igbo, African and Asian Studies with Chinese Language and Igbo Language degree options. This corroborates the UNIZIK option only; it is not substituted for the NUC CCMAS source or generalized to other institutions.
- Local records: `programme_mapping.json` row 292, `jamb/arts_hum_offerings.json`, `jamb_curriculum_scopes_2026-08-17.json`, `jamb_domain_map.json`, `ccmas/arts.json`, `domain_structure.json` D039/D063, and `role_library_v3_cleaned.json`.

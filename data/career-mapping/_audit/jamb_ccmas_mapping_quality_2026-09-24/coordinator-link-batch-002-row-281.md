# Coordinator link batch 002 - row 281, D043 Journalism

**Date:** 2026-09-24  
**Boundary:** row 281 `English and Literary Studies` -> D043 `Journalism`, second saved-scope link.  
**Status:** course/outcome and role-family review. No canonical map, scope, seed, or UI changes.

## Evidence and disposition

- The saved JAMB scope's D043 functional link lists five anchors: `Communication in English`, `A Survey of the English Language`, `Introduction to English Grammar and Composition`, `Entrepreneurial English`, and `Phonology of English`. These are title locators, not independent proof.
- CCMAS Arts::English Language and Literature ENG 202 (`Entrepreneurial English`) explicitly lists magazine journalism, newspaper journalism, editorial assistantship, copy-editing/proof-reading and digital copywriting in its content; its outcomes include assisting newsroom editors with news construction, copywriting and web-content work. ENG 306 `Discourse Analysis` and ENG 409 `Project/Long Essay` appear in the selected course set too, but this current D043 anchor list omits them; do not rely on omitted courses until the link provenance is corrected. ENG 202 alone supplies specific journalism/publishing evidence.
- D043 contains one broad subgroup, `Legal, Social and Cultural Professionals`, and 34 roles. The role library includes journalist, newspaper/magazine editor, copy editor, proofreader, fact checker, columnist, speechwriter, blogger and writer, alongside specialist roles such as medical writer, sports journalist, foreign correspondent, news anchor, photojournalist and technical communicator. English coursework plausibly supports a writing/editorial foundation, but does not establish each specialty's subject-matter, reporting, broadcast, photography or professional experience requirements.
- **Disposition:** The `functional` domain relationship is supported in a bounded sense for journalism/publishing/writing foundations by ENG 202 and the selected English/literature course set. Do not interpret this as confirmation of all 34 roles. For student-facing downstream, at most identify the supported writing/editorial roles as exploratory pathways and state that further journalism, reporting, media-production, subject-specialist and work-experience learning may be needed. The current data lacks a JAMB-specific role allow-list; this broad role fan-out remains a downstream display defect even though the domain-level functional link has some evidence.

## Locators

- `data/career-mapping/_audit/jamb_curriculum_scopes_2026-08-17.json` -> row 281 -> D043 `scope_course_titles`.
- `data/career-mapping/ccmas/arts.json` -> English Language and Literature -> ENG 202 `content_summary` and `skills_learned`; also row-selected ENG 306/409, noted above as absent from current D043 anchor provenance.
- `data/career-mapping/domain_structure.json` -> D043 -> subgroup label and role-count.
- `data/career-mapping/role_library_v3.json` -> D043 -> named role descriptions and skill profiles.

The curriculum evidence is the CCMAS record already in the repository; no external curriculum was needed to establish this bounded link. Accessed 2026-09-24.

## Remaining queue

After this second link disposition, **833 of 835** rows-281-420 domain-link occurrences remain in the systematic link queue. Continue at row 281 -> D039 `Higher Education`. The tranche still has 439 links without `scope_course_titles`; this is an independent evidence-locator count, not a remaining-review count.

## Append-only role-catalog reconciliation (2026-09-24)

The phrase “34 roles” above counts raw `role_library_v3.json` entries for D043. The canonical cleaned role file and `domain_structure.json` instead each report **62** D043 roles; one downstream subgroup has `role_count: 62`. Use 62 when describing the current structured downstream breadth, and retain the raw-vs-cleaned difference as a separate data reconciliation issue. The role examples named above are present in the cleaned file. The course scope for row 281 contains **32** selected courses (not 16); this batch did not reassess all 32, and only the listed D043 anchors were checked. No prior link disposition changes: ENG 202 provides a limited journalism/publishing foundation, not blanket preparation for all 62 downstream records.

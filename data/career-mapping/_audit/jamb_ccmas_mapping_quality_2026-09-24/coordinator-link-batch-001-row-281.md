# Coordinator link batch 001 - row 281, first saved link D130

**Date:** 2026-09-24  
**Boundary:** row 281 `English and Literary Studies` -> D130 `Recruitment, Employment` (first saved-scope domain link).  
**Status:** one link assessed at course, domain, subgroup and role levels; no canonical map, scope, seed, or UI changes.

## Evidence and disposition

- Row 281's saved CCMAS scope is Arts::English Language and Literature, with 16 selected course rows. Its D130 link is labeled `functional` and cites only `Entrepreneurial English` (ENG 202, two units). A reviewed scope label is not itself evidence that this link fits.
- The CCMAS course record in `data/career-mapping/ccmas/arts.json` lists ENG 202 content including digital copywriting, editorial assistantship, foreign-language teaching, lexicography, magazine/newspaper journalism, private tutoring, publishing copy-editing/proof-reading, and web content management. Outcomes include self-employment/start-up basics, copywriting and newsroom/publishing/web-content tasks. This supports bounded writing/content/self-employment directions.
- D130's actual downstream has six subgroups and 17 declared roles. `domain_structure.json` names chief executives/senior officials and legislators; administrative and commercial managers; business and administration professionals; legal, social and cultural professionals; business and administration associate professionals; and other clerical support workers. `role_library_v3.json` includes employment agent, talent acquisition specialist, executive-search consultant, recruitment consultant, employment-services manager, employer-branding specialist and HR officer. The role descriptions/skills focus on labour legislation, job-market matching, candidate sourcing/interviewing/hiring, recruitment operations and employer branding.
- **Finding:** ENG 202's cited writing/publishing and self-employment outcomes do not establish preparation for D130's broad recruitment/employment domain or its HR/recruiter/employment-service roles. The current functional link is unsupported at this breadth by its cited course and should not count as a confirmed student path. This does not mean graduates cannot find employment or self-employ. A narrower writing/content destination requires a suitable taxonomy and its own supported relationship; do not silently rename D130.

## Locators

- `data/career-mapping/_audit/jamb_curriculum_scopes_2026-08-17.json` -> row 281 -> D130 link and selected-course scope.
- `data/career-mapping/ccmas/arts.json` -> English Language and Literature -> ENG 202 -> `content_summary` and `skills_learned`.
- `data/career-mapping/domain_structure.json` -> D130 -> six downstream subgroups.
- `data/career-mapping/role_library_v3.json` -> D130 -> seven role descriptions/skill profiles.

No external curriculum was needed to assess this negative fit against the recorded CCMAS outcomes. Accessed 2026-09-24.

## Remaining queue

Mechanical recount: rows 281-420 contain **835 saved-scope link occurrences**, **439** without `scope_course_titles`. After this one disposition, **834** link occurrences remain for the systematic per-link queue. Missing locator is not equivalent to unreviewed: prior reports contain some later-row findings, but a complete row/domain disposition ledger has not yet been built, so 834 is the queue size, not a count of links with no prior mention. Continue at row 281 -> D043 `Journalism`.

The source-context crosswalk is a parallel task: exact JAMB primary-source leads for rows 404, 406, 410, 417 and 420 are recorded in `coordinator-source-context-crosswalk-2026-09-24.md`; their institution-cell boundaries remain partly unresolved. It is not included in the 834 link count.

## Append-only reconciliation note (2026-09-24)

Recounting the current files found that the selected-course count written above as 16 is wrong: row 281 has **32** selected CCMAS courses. The D130 role counts also differ by artifact: `domain_structure.json` reports 17 domain roles, but its six subgroup counts sum to 14; `role_library_v3.json` has 7 D130 entries and `role_library_v3_cleaned.json` has 6. Therefore the earlier phrase “17 declared roles” was a raw domain-structure field, not a verified display-role inventory. Keep the D130 downstream quantity unresolved until registry/seed identity is reconciled. The role names listed above are present in the raw role library; the substantive conclusion that ENG 202 does not support the recruitment/HR work remains unchanged.

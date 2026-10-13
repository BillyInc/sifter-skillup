# Lane 1 increment 043 — Audiology AUD 312 duplicate-row adjudication

**Access date:** 2026-09-29 (Africa/Lagos)  
**Scope:** both local AUD 312 entries in Allied Health Sciences → Audiology, compared with the one official NUC source occurrence.  
**Mode:** source audit only; do not delete, merge, or edit shared curriculum rows here.

## Prior-coverage check and primary source

Increment 042 found two local AUD 312 records against one global table entry and handed both records to this exact detailed comparison. No earlier AUD 312 course-level checkpoint was found before increment 042.

National Universities Commission (NUC), *Core Curriculum and Minimum Academic Standards (CCMAS) for Nigerian Universities: Allied Health Sciences* (2023), [official PDF](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf), accessed 2026-09-29.

- Global structure: printed p. 34, line 1277 — one `AUD 312 Basic Procedures in Audiology`, 1 C, LH 15, PH dash.
- Detailed course block: printed pp. 58–59, lines 2161–2186 — one matching 1-unit/C/LH 15 course, ten outcomes and its Course Contents.

## Exact source-to-local comparison

The NUC table and detailed block agree on the one source course's code, title, 1 unit, compulsory status and LH 15. Neither gives positive practical hours. NUC lists ten distinct outcomes:

1. Take and perform patient clerking/case history.
2. Describe basic measurements such as vital signs.
3. Perform basic otoscopic examinations.
4. Perform audiological examinations (screening and diagnostic).
5. Clerk patients to reach a diagnosis and apply advanced auditory tests.
6. Select test batteries from case history and clinical observation.
7. Explain hearing-disorder classifications, types, configurations and lesion sites from test findings.
8. Apply masking in pure-tone audiometry.
9. Explain audiograms and clinical interpretation.
10. Explain tympanograms and clinical interpretation.

| Local occurrence in Audiology array | Comparison with the single source row | Finding |
|---|---|---|
| First AUD 312 record (1 unit/LH 15) | Identity and load match. Nine local outcome entries: local outcome 4 combines source outcomes 4 and 5 into one malformed statement; the remaining topics continue after that merge. Its 400-character summary ends at `Co`, before the source's later vestibular and behavioural test content. No item-level provenance. | **Correct source load, but confirmed outcome merge/one missing distinct outcome; truncated summary; provenance gap.** |
| Second AUD 312 record (2 units/LH 30) | Same code/title/level, but load contradicts both NUC locations (1 unit/LH 15). It also has nine entries with the same outcome-4 merge; local outcome 5 additionally contains a page footer. Its separate 400-character summary ends at `cooperat`, also before the source's later listed tests. No item-level provenance. | **Duplicate local occurrence; confirmed incorrect units/LH; same outcome merge; footer contamination; truncated summary; provenance gap.** |

NUC Course Contents extend through pure-tone audiometry/masking, tympanometry and acoustic reflex/Eustachian-tube tests, otoscopy, tuning-fork tests, ABR/OAE, speech audiometry, SPAR, loudness and auditory-fatigue tests, malingering tests, vestibular investigations (including Dix-Hallpike and cVEMP), and behavioural tests such as distraction, cooperative/performance, McCormick speech discrimination and visual-reinforcement audiometry. The local summaries cut off before completing that source list.

## Disposition and handoff

- **Confirmed structural conflict:** one official course occurrence versus two local records under the same Audiology owner/code/title. Do not treat them as two CCMAS courses.
- **Confirmed row-field defects:** the second local record's 2 units/LH 30 contradict the source; each row merges two distinct source outcomes; the second row has page furniture in outcome 5; both summaries truncate; neither has item-specific URL/locator/access date.
- **Held for local reconciliation:** do not choose a duplicate to keep or delete solely from this audit. Preserve the before-state and repair the canonical course using the single NUC identity and its ten separate outcomes, after resolving how duplicate records are represented in source data.
- **No source conflict:** NUC table and detailed heading agree. The two local rows do not create source ambiguity.

Next source-order row: **AUD 313 — Medical Conditions Amenable to Audiology**, after an exact-checkpoint search. Machine-readable evidence: `jamb_ccmas_source_audit_lane_1_2026-09-29_043_audiology_aud312_duplicate.json`. Regression: `test_jamb_ccmas_source_audit_lane_1_2026_09_29_043.py`.

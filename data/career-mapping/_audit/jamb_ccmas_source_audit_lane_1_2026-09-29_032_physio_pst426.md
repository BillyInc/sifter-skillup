# Lane 1 increment 032 — CCMAS Physiotherapy PST 426

**Access date:** 2026-09-29 (Africa/Lagos)  
**Scope:** package 038, Allied Health Sciences → DPT Physiotherapy, PST 426.  
**Mode:** exact source comparison, then local repair of confirmed extraction omissions; source-hour conflict held.

## Coverage and source

Increment 031 named PST 426 next. Existing package audit and automated inventories already flagged the absence of a conventional hour load and a missing summary; I reused those findings and checked exact prior checkpoints/repairs. No previous course-specific PST 426 correction was present.

Primary source: National Universities Commission, *Core Curriculum and Minimum Academic Standards (CCMAS) for Nigerian Universities: Allied Health Sciences* (2023), <https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf>, accessed 2026-09-29.

| Field | Global table / adjacent note, printed pp. 588–589 | Detailed block, printed p. 620 | Local row before reconciliation |
|---|---|---|---|
| Title/context | Clinical Practice I (Neurophysiotherapy and Musculoskeletal); course marked with `*` | Same scope; externally moderated professional clinical exam | `Clinical Practice I` only; scope omitted |
| Load | 1 unit, C, LH dash, PH dash; table note ties examination to PST 413 and PST 422 | Heading says 1 Unit C: PH 45 | 1 unit, C, LH null, PH null |
| Outcomes | — | Four competencies across musculoskeletal and neurological cases | Four; fourth ends with stray `500 Level` |
| Narrative | — | Tests clinical skills learned in PST 412, PST 413, PST 421 and PST 422 | Null |

## Findings and local reconciliation

- Added the source-supported full title `Clinical Practice I (Neurophysiotherapy and Musculoskeletal)`.
- Removed only the `500 Level` extraction spill from outcome 4; retained the four outcomes and their order.
- Added a concise description identifying this as an externally moderated clinical-skills examination covering learning from PST 412, 413, 421 and 422.
- Added official URL, exact printed-page locators and access date.
- **Hours remain unresolved:** global table dashes conflict with the detailed heading's PH 45. Retained local null LH/PH and wrote an explicit source conflict note; no value is inferred.

Guarded repair: `apply_ccmas_pst426_source_reconciliation_2026_09_29.py`. Regression: `test_ccmas_pst426_source_reconciliation_2026_09_29.py`. The JSON evidence records the pre-repair local row and source distinction.

**Next cursor:** PST 511. Earlier lane-1 increments already reviewed other PST 511 fields; inspect their exact coverage and audit only any uncovered source fields.

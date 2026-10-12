# Lane 1 increment 042 — Audiology AUD 311 Introduction to Audiology

**Access date:** 2026-09-29 (Africa/Lagos)  
**Scope:** Allied Health Sciences → Audiology, AUD 311, following the exact NUC global-table order after AUD 320 and AUD 321.  
**Mode:** source audit only; shared curriculum/offering ledgers remain untouched.

## Prior-coverage check and primary source

Searched exact AUD 311 course-level audit coverage; only catalogue/discovery/crosswalk references were found, not a prior detailed NUC comparison. These inventory references are not counted as source audit.

National Universities Commission (NUC), *Core Curriculum and Minimum Academic Standards (CCMAS) for Nigerian Universities: Allied Health Sciences* (2023), [official PDF](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf), accessed 2026-09-29.

- Global course structure: printed p. 34, extracted line 1276 — AUD 311, Introduction to Audiology, 1 C, LH 15, PH dash.
- Detailed block: printed pp. 57–58, extracted lines 2133–2160 — heading/load, eleven outcomes, and Course Contents.

## Field-by-field comparison

| Field | NUC source | Local Audiology row | Finding |
|---|---|---|---|
| Identity / level / load | AUD 311, Introduction to Audiology; 300 level; 1 C, LH 15, PH dash. Detailed heading agrees. | Same code/title; level 300; 1 C; LH 15; PH null. | Match. |
| Learning outcomes | Eleven outcomes: history; principles and professional role; multidisciplinary aural-care role; resonance/frequency theory; confidentiality/safety/comfort; scope of practice; preventive/curative/rehabilitative audiology; sound/psychoacoustics; family/significant-other role; professional ethics; overview of practice. | Eleven concepts in the same order. Outcome 11 has the page footer `Allied Health Sciences 57 New` appended. | **Confirmed extraction contamination** limited to footer text in outcome 11; otherwise outcome count and substance match. |
| Course contents | Audiology philosophy/history/ethics/scope; preventive, curative and rehabilitative roles; patient/family responsibilities, relationship, confidentiality and communication; professional conduct/teamwork/interviewing; verbal/nonverbal communication; behaviour, safety and comfort; sound vibration/frequency/intensity/duration and psychoacoustic pitch/loudness/duration. | Local summary follows the source through `Patient care communication – Professio` and stops at 400 characters. | **Confirmed 400-character truncation:** source material after the cutoff, including professional conduct, teamwork, listening/interviewing, communication, behaviour/safety and sound/psychoacoustic concepts, is absent. The en dash before “Professional” is a valid source punctuation match, not an encoding defect. |
| Item-level provenance | Official NUC PDF; table and detailed locators above; access date 2026-09-29. | No row-level `source_url`, `source_locator`, or `source_accessed_on`. | **Confirmed provenance gap.** |

## Package-structure signal for next increment

The NUC global 300-level table lists one AUD 312 occurrence (printed p. 34, line 1277). The local Audiology array contains two AUD 312 records. This is a confirmed local duplicate-occurrence candidate against the official table and is handed to the next detailed source check; do not count the duplicate as two separate NUC courses. One local duplicate carries 2 units/LH 30, so it conflicts with the global row's 1 unit/LH 15. Increment 043 will compare both local rows against the detailed AUD 312 block, document the exact divergence, and preserve any unresolved source conflict.

## Handoff and next cursor

Reconcile AUD 311 by removing only the footer from outcome 11, completing its truncated summary from the NUC contents, and adding item-specific provenance. Preserve the verified title, level, load and eleven outcome concepts. Next audit **AUD 312 — Basic Procedures in Audiology**, treating both local entries as one possible duplicate source occurrence and comparing each record with the global and detailed source.

Machine-readable evidence: `jamb_ccmas_source_audit_lane_1_2026-09-29_042_audiology_aud311.json`. Regression: `test_jamb_ccmas_source_audit_lane_1_2026_09_29_042.py`.

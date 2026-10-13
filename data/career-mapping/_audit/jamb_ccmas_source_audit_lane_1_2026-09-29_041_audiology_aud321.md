# Lane 1 increment 041 — Audiology AUD 321 Clinical Externship Scheme

**Access date:** 2026-09-29 (Africa/Lagos)  
**Scope:** Allied Health Sciences → Audiology, AUD 321, following increment 040 (AUD 320).  
**Mode:** source audit only; do not edit the shared course/offering ledgers.

## Prior-coverage check and primary source

Searched lane checkpoints and exact-course audit artifacts for AUD 321. No previous course-level source comparison was found; catalogue scans and curriculum crosswalk mentions are candidate/inventory evidence only and are not counted as source verification.

National Universities Commission (NUC), *Core Curriculum and Minimum Academic Standards (CCMAS) for Nigerian Universities: Allied Health Sciences* (2023), [official PDF](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf), accessed 2026-09-29.

- Global course structure: printed p. 34, extracted lines 1269–1271. Table wording: `Industrial Attachment (SIWES) Audiology Hospital Attachment`; 6 C, LH dash, PH 270.
- Detailed course block: printed pp. 54–55, extracted lines 2025–2051. Heading: `Clinical Externship Scheme (SIWES) (6 Units C: PH 270)`; description, twelve outcomes and Course Contents.

## Field-by-field comparison

| Field | NUC source | Local `allied_health.json` → Audiology → AUD 321 | Finding |
|---|---|---|---|
| Identity / level / title | AUD 321 at 300 level. Global title says `Industrial Attachment (SIWES) Audiology Hospital Attachment`; detailed title says `Clinical Externship Scheme (SIWES)`. | Level 300; title `Clinical Externship Scheme` | Same code and programme context; the local title follows the detailed block but omits `(SIWES)`. **NUC source-internal title variant** between global and detailed sections; retain the variant as unresolved provenance rather than merging the strings silently. |
| Units / status / hours | Global and detailed blocks agree: 6 C; no LH; PH 270. | 6 units, C; LH null; PH null | **Confirmed omission:** local PH 270 is missing. Null LH is consistent with the source dash. |
| Description / placement conditions | Third- and fourth-year students complete the NUC SIWES clinical externship over 12 weeks during long vacation at accredited hospitals; a logbook is rated by the supervising clinician; grade is 10% of the succeeding year's in-course mark. | `content_summary` covers professionalism, assessment, testing, diagnosis, referral, rehabilitation and clinic administration, but omits the placement duration/site/logbook/supervision/assessment-weight description. | **Confirmed missing source description detail** from the student-facing summary. Preserve the distinction between course description and `Course Contents`; do not mislabel placement conditions as additional outcomes. |
| Learning outcomes | Twelve: professional behaviour; assess varied populations; supervised interventions; rehabilitation; follow-up planning; referral; field documentation; diagnosis under clinical supervisor; explain findings; supervised counselling; reports/appointments/non-clinical work; clinic administration. | Twelve local entries in the same order and substance. Entry 4 contains the extracted page footer `Allied Health Sciences 54 New`. | **Confirmed extraction contamination** in outcome 4; remove only the footer during local reconciliation. Other outcome concepts match. |
| Course Contents | Audiology professionalism; paediatric/adult/older-adult assessment; test battery; diagnosis; referral; treatment/rehabilitation; clinic administration. | Summary represents these topics. | The listed contents are substantially represented; its separate placement description noted above is not. |
| Item-level provenance | Official NUC PDF and printed table/block locators above; accessed 2026-09-29. | No item-specific `source_url`, `source_locator`, or `source_accessed_on`. | **Confirmed provenance gap.** Add exact URL, both locators, and access date during local reconciliation. |

## Handoff and next cursor

Confirmed local-reconciliation findings: set PH to the source-backed 270; remove the page footer from outcome 4; complete the student-readable course summary with the source's placement description (12 weeks, accredited hospitals, logbook, supervising clinician, grading detail) while preserving the distinct Course Contents; add item-specific provenance. Preserve the source title discrepancy explicitly and do not resolve it by selecting one NUC section as if the other did not exist. No ledger was edited here.

Next source occurrence: **AUD 311 — Introduction to Audiology**, after checking its exact source-checkpoint coverage. It appears in the 300-level global table after AUD 320/AUD 321. Continue in NUC table order, not local JSON order.

Machine-readable evidence: `jamb_ccmas_source_audit_lane_1_2026-09-29_041_audiology_aud321.json`. Regression: `test_jamb_ccmas_source_audit_lane_1_2026_09_29_041.py`.

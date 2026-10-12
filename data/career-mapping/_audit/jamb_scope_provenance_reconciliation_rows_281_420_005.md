# Scope/course provenance reconciliation — rows 321–330

**Append-only overlay checkpoint 005 · 2026-09-26 (Africa/Lagos)**  
Reconciles the [global provenance audit](jamb_scope_course_provenance_audit_2026-09-26.json), current scope ledger, and final-verification [checkpoint 005](jamb_ccmas_final_verification_rows_281_420_2026-09-26_005.md).

These 10 rows have **116 selected-course occurrences / 110 unique keys**, zero complete citation triplets on either count, zero unique keys missing CCMAS file/programme identity, and **10/10 rows missing `scope_evidence`**. Missing provenance is a traceability/identity flag, not proof a course is incorrect or inapplicable. Rows with full component inheritance have no selected-course citation denominator; their row-level source rationale is still absent.

| Row | Identity | Scope evidence | Selected rows | Complete citations | Missing source identity | Provenance disposition |
|---:|---|---|---:|---:|---:|---|
| 321 | Geography | Missing | 0 (full component) | n/a | 0 | **Unresolved occurrence/scope provenance:** two faculty contexts (Engineering and Sciences) require distinct exact JAMB cell citations and explicit applicability to inherited Geography CCMAS; no item-level citation issue implied by zero delta. |
| 322 | Urban and Regional Planning | Missing | 0 (full component) | n/a | 0 | **Unresolved scope provenance:** exact JAMB occurrence and NUC component locator/rationale not attached to row; no course defect inferred. |
| 323 | Industrial Design | Missing | 0 (full component) | n/a | 0 | **Unresolved scope provenance:** attach official source cell and NUC course-table/outcome reference; parser spill is a separate source-context issue. |
| 324 | Estate Management | Missing | 0 (full component) | n/a | 0 | **Unresolved scope provenance:** full package identity exists but row-specific source rationale and exact JAMB awarder cell are absent. |
| 325 | Hotel Management and Tourism | Missing | 26 | 0/26 | 0 | **Unresolved source/item provenance:** all 26 selected HTM/TRM occurrences lack citations and no scope evidence distinguishes the current Engineering occurrence from the official Social Sciences ATIBA/ELIZADE context. |
| 326 | Home Economics and Food Management | Missing | 19 | 0/19 | 0 | **Unresolved occurrence/item provenance:** 19 rows lack citations and scope evidence; official Agriculture WESLEYUNI context is absent from current occurrence inventory. FIX-002 course correction does not provide course-level provenance for the whole scope. |
| 327 | Building Technology | Missing | 46 | 0/46 | 0 | **Unresolved occurrence/item provenance:** all 46 selected Building rows lack citations and row-level scope evidence; Sciences KASU occurrence and possible Engineering context must be separately sourced. |
| 328 | Chemical Sciences | Missing | 24 | 0/24 | 0 | **Unresolved item provenance plus independently confirmed component gap:** all 24 Chemistry rows lack citations; source evidence must be specific to CRUTECH’s Chemistry/Biochemistry options and should not be generalized to GOUU or other providers. |
| 329 | Electronics | Missing | 1 | 0/1 | 0 | **Unresolved item/source identity:** the single PHY 422 row lacks a course citation; exact JAMB faculty/awardee context and whether this one-course selection represents Electronics remain open. |
| 330 | Environmental Health Science | Missing | 0 (full component) | n/a | 0 | **Unresolved source/scope provenance:** exact JAMB Sciences/other faculty context and NUC Allied Health component applicability need explicit citations; no content error inferred from mismatch of labels. |

**Slice conclusion:** 10/10 rows provenance-open. No selected course is rejected based on this overlay. Next slice: rows 331–340.

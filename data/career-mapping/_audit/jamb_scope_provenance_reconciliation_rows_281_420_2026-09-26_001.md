# Scope/course provenance reconciliation — rows 281–290

**Append-only overlay checkpoint 001 · 2026-09-26 (Africa/Lagos)**  
**Reconciles:** [global scope/course provenance audit](jamb_scope_course_provenance_audit_2026-09-26.json), the current scope ledger, and final-verification [checkpoint 001](jamb_ccmas_final_verification_rows_281_420_2026-09-26_001.md).  
**Scope:** provenance and course-source identity only; no content validity inferred from citation state. No data changed.

## Range-wide audit result (context for this slice)

The global audit’s scope was restricted here to canonical JAMB rows 281–420. Recalculation from the current scope ledger confirms: **139/140** rows lack `scope_evidence`; **1,588/1,588** selected-course occurrences lack a complete citation (`source_url`, `source_locator`, `source_accessed_on`); **1,331/1,331** range-unique course keys lack a complete citation; and **120** range-unique keys lack `source_ccmas_file` and/or `source_ccmas_programme`. These are high-impact traceability/source-identity flags. They do **not** prove that a course is incorrect, inapplicable, or unsupported. The external-scope rows need a clearly identified authoritative external course source rather than fabricated CCMAS identifiers.

For this slice the ledger contains **247 selected-course occurrences**, **189 unique keys**, zero complete course citations, and 59 unique course keys with neither CCMAS source file nor CCMAS programme identity; all 59 belong to row 284 French’s external course list. The only row with non-empty `scope_evidence` in the entire 281–420 range is row 285; that evidence is scoped to its LASU/JAMB and bounded English-facet context, not to item-level citations for its seven selected English courses.

## Per-row provenance ledger

| Row | Identity | Scope evidence | Selected rows | Complete course citations | Unique missing CCMAS source identity | Provenance classification |
|---:|---|---|---:|---:|---:|---|
| 281 | English and Literary Studies | Missing | 32 | 0/32 | 0 | **Unresolved provenance gap:** scope decision has no stored evidence; every selected row needs source URL + exact NUC locator + access date. Not a content defect finding. |
| 282 | English Studies | Missing | 23 | 0/23 | 0 | **Unresolved provenance gap:** same; source identity fields exist, item citation is incomplete. |
| 283 | Literature in English | Missing | 35 | 0/35 | 0 | **Unresolved provenance gap:** same; separate from the confirmed LIT 402 outcome issue recorded in checkpoint 001. |
| 284 | French | Missing | 59 | 0/59 | 59 | **Unresolved external-source identity gap:** all selected rows lack CCMAS source identity and full URL/locator/date. This may be appropriate for an external curriculum, but the current payload does not identify which official external course record supports each row. Do not treat the data as wrong solely for lacking CCMAS fields. |
| 285 | Portuguese/English | Present | 7 | 0/7 | 0 | **Partial traceability:** scope evidence explains LASU English-only / Portuguese-unrepresented context; every selected English course still lacks its individual URL/locator/date citation. |
| 286 | German | Missing | 22 | 0/22 | 0 | **Unresolved provenance gap:** source package identity exists but no selected-course citation triplets. |
| 287 | French and German/Russian | Missing | 27 | 0/27 | 0 | **Unresolved provenance gap:** source package identity exists, but no course citations. The existing identity/composite-scope conflict is separately classified in checkpoint 001; this flag alone does not establish the course content is incorrect. |
| 288 | International Studies and | Missing | 23 | 0/23 | 0 | **Unresolved provenance gap:** missing scope rationale and all course citations; distinct from confirmed truncated canonical title in checkpoint 001. |
| 289 | History | Missing | 19 | 0/19 | 0 | **Unresolved provenance gap:** no scope evidence and no per-course citation triplets. |
| 290 | History and Strategic Studies | Missing | 0 | n/a | 0 | **Unresolved scope-evidence gap:** a zero-course combined scope has no item citations by design, but the declared component selection itself has no stored source rationale and remains empty. |

## Slice result

All 10 identities are accounted for; the rows remain open on provenance. **Confirmed by this overlay:** traceability and source-identity metadata deficiencies, not incorrect course content. A complete source citation for an external item must identify its actual applicable source; `source_ccmas_file` / `source_ccmas_programme` should be populated only where the item genuinely derives from CCMAS. The next overlay slice is rows 291–300.

# Scope/course provenance reconciliation — rows 291–300

**Append-only overlay checkpoint 002 · 2026-09-26 (Africa/Lagos)**  
**Reconciles:** [global provenance audit](jamb_scope_course_provenance_audit_2026-09-26.json), current scope/inheritance/occurrence records, and final-verification [checkpoint 002](jamb_ccmas_final_verification_rows_281_420_2026-09-26_002.md).  
**Scope:** source traceability only. Missing provenance does not prove incorrect course content; no data changed.

Across this slice there are **121 selected-course occurrences** and **121 unique course keys**; none has the complete citation triplet (`source_url`, exact `source_locator`, `source_accessed_on`). No selected key lacks its CCMAS source-file/programme identity. There are **10/10 rows without `scope_evidence`**. For full-inheritance rows (291, 293, 297, 299, 300), zero selected-course rows is a delta convention, not missing curriculum; the evidence gap is the absence of a row-level explanation tying the identity/offering to the inherited CCMAS component and its source.

| Row | Identity | Scope evidence | Selected rows | Complete course citations | Missing CCMAS source identity | Provenance disposition |
|---:|---|---|---:|---:|---:|---|
| 291 | Economics | Missing | 0 (full inheritance) | n/a | 0 | **Unresolved scope/offering provenance gap:** attach evidence by distinct source context and reject stale Engineering false-positive/FEDOTUOKE spill already identified in checkpoint 002. Full Economics package identity exists, but no row scope evidence ties it to three valid faculty occurrences or explains the full inheritance. |
| 292 | African and Asian Studies | Missing | 4 | 0/4 | 0 | **Unresolved item provenance gap:** four HIS rows have no citations; scope rationale/source for the four-course-only selection is absent. This is additional to the confirmed language-facet coverage issue; it does not prove the four history courses themselves are wrong. |
| 293 | Linguistics | Missing | 0 (full inheritance) | n/a | 0 | **Unresolved source traceability:** component identity exists; exact JAMB offering cell and rationale for full inheritance are not attached as scope evidence. |
| 294 | Kanuri | Missing | 27 | 0/27 | 0 | **Unresolved provenance plus substantive applicability defect:** all 27 generic LIN rows lack exact source citations and scope rationale. Checkpoint 002 separately confirms that generic Linguistics does not evidence standalone Kanuri. Missing citations do not independently establish the substantive mismatch. |
| 295 | Russian with French/German | Missing | 35 | 0/35 | 0 | **Unresolved provenance plus confirmed composite-scope omission:** 35 Russian rows lack citation triplets and the scope decision has no stored evidence. The missing companion-language facet is independently confirmed in checkpoint 002; citations must identify the actual Russian CCMAS courses and any applicable official companion curriculum. |
| 296 | Mass Communication | Missing | 35 | 0/35 | 0 | **Unresolved provenance:** none of 35 selected rows is item-cited; scope evidence does not distinguish Administration and Arts offerings. Do not infer the two institution groups use an identical curriculum from identical row selection. |
| 297 | Music | Missing | 0 (full inheritance) | n/a | 0 | **Unresolved scope-evidence gap:** full Music inheritance is not itself a defect; store the source basis and identity/occurrence link. |
| 298 | Peace Studies | Missing | 20 | 0/20 | 0 | **Unresolved item provenance gap:** all 20 rows lack citations and no scope evidence is recorded; prior JAMB occurrence check is separate from CCMAS item provenance. |
| 299 | Philosophy | Missing | 0 (full inheritance) | n/a | 0 | **Unresolved scope-evidence gap:** inherited package needs a source-backed identity/applicability rationale; no content defect inferred. |
| 300 | Religious Studies | Missing | 0 (full inheritance) | n/a | 0 | **Unresolved scope-evidence gap:** inherited package needs source-backed identity/applicability rationale; no content defect inferred. |

**Slice conclusion:** 10/10 rows remain provenance-open. Record the actual NUC programme source and exact printed course/page/table locators; do not copy citation fields from a nearby row or use a programme title as a course citation. The next slice is 301–310.

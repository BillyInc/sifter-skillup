# Scope/course provenance reconciliation — rows 311–320

**Append-only overlay checkpoint 004 · 2026-09-26 (Africa/Lagos)**  
**Reconciles:** [global provenance audit](jamb_scope_course_provenance_audit_2026-09-26.json), current scope/inheritance/occurrence records, and final-verification [checkpoint 004](jamb_ccmas_final_verification_rows_281_420_2026-09-26_004.md).  
**Scope:** source traceability and source identity only; no content error inferred solely from absent metadata. No data changed.

Slice totals: **77 selected-course occurrences**, **58 unique course keys** (duplicates across JAMB identities explain the difference), 0 complete citations at occurrence or unique-key level, 0 keys missing CCMAS source-file/programme identity, and **10/10 identities without `scope_evidence`**. Full inherited scopes have zero selected deltas, not zero courses. The row 311 ABU-specific omission, row 314 parser spill and row 315 source-token spill remain separate substantive findings from the prior checkpoint.

| Row | Identity | Scope evidence | Selected rows | Complete citations | Missing CCMAS source identity | Provenance disposition |
|---:|---|---|---:|---:|---:|---|
| 311 | Polymer and Textile Engineering | Missing | 8 | 0/8 | 0 | **Unresolved provenance:** all eight MSE/GET rows lack item citations and scope rationale. This overlays, but does not replace, the ABU-specific course-sequence mismatch; citation repair must not falsely label ABU's extra curriculum as national CCMAS. |
| 312 | Water Resources and Environmental Engr | Missing | 14 | 0/14 | 0 | **Unresolved provenance:** 14 WRE/GET rows lack exact locators and the scope decision lacks evidence. This does not prove a second Environmental CCMAS component is required. |
| 313 | Petroleum and Gas Engineering | Missing | 0 (full inheritance) | n/a | 0 | **Unresolved scope-evidence gap:** attach source for the exact JAMB occurrence and inherited NUC Petroleum and Gas component/course table; no course error inferred. |
| 314 | Gas Engineering | Missing | 17 | 0/17 | 0 | **Unresolved item provenance plus confirmed source-context contamination:** 17 Natural Gas Engineering CCMAS rows lack course citations; the JAMB parsed provider spill is separately confirmed in checkpoint 004. Missing citations do not independently establish that Natural Gas is an inapplicable CCMAS analogue. |
| 315 | Systems Engineering | Missing | 0 (full inheritance) | n/a | 0 | **Unresolved scope/offering provenance:** full inheritance lacks scope-level link to the exact JAMB cell and NUC course/outcome tables. Institution-token spill is separately confirmed; it is not a course-content finding. |
| 316 | Food Engineering | Missing | 0 (full inheritance) | n/a | 0 | **Unresolved scope-evidence gap:** no row-level evidence ties the offering to the full NUC Food Engineering package; no course omission inferred. |
| 317 | Food Science and Engineering | Missing | 19 | 0/19 | 0 | **Unresolved item provenance:** all 19 selected rows lack citations; one also lacks content summary (separate local completeness check). No item is declared wrong on the basis of these missing fields. |
| 318 | Food Technology | Missing | 19 | 0/19 | 0 | **Unresolved item provenance:** all 19 selected rows lack citations; one lacks content summary. The duplicate 317/318 scope is a substantive candidate to resolve from offering sources, not a provenance-based conclusion. |
| 319 | Architecture | Missing | 0 (full inheritance) | n/a | 0 | **Unresolved scope-evidence gap:** the current JAMB cell is only partially transcribed; attach complete offering and NUC Architecture source locators before closure. |
| 320 | Quantity Surveying | Missing | 0 (full inheritance) | n/a | 0 | **Unresolved scope-evidence gap:** source basis for the full Quantity Surveying component is not stored at scope level; exact JAMB provider cell and NUC component locators remain required. |

**Slice conclusion:** all ten rows remain provenance-open; 58 unique course keys/77 occurrences have no complete citation. The next overlay slice is rows 321–330.

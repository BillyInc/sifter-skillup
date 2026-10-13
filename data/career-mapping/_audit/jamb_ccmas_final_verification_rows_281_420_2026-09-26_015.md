# JAMB–CCMAS final gap verification — cross-cutting checkpoint 015

**Created:** 2026-09-26 (Africa/Lagos)  
**Coverage:** cross-cutting omission-class check over the already inspected canonical JAMB identities 281–420. This does not restart or replace row checkpoints 001–014.  
**Excluded:** no downstream domain/subgroup/role audit; no edits to programme mappings, CCMAS course sources, scope rows, seeds, or SQL.  
**Disposition:** verification pass saved; **0/140 rows are fully closed**. All source and curriculum issues identified in the row checkpoints remain for the local source-correction/re-audit phase.

## Reconciliation and coverage counts

Read the row checkpoints 001–014, range issue register, current `_audit/jamb_curriculum_scopes_2026-08-17.json`, current CCMAS component JSONs, and the existing scope-course provenance audit. Recomputed the following counts for scope rows 281–420:

| Check | Count | Interpretation |
|---|---:|---|
| Canonical identities checked | 140 | Rows 281–420 inclusive; no rows restarted. |
| Scope-state counts | 76 `partial_scope_reviewed`; 54 `full`; 4 `combined_scope_review_required`; 1 `partial_scope_review_required`; 5 `external_scope_evidenced` | State labels are not proof of source closure. |
| Selected course records | 1,586 | Four separate provenance fields below are absent on every selected record. |
| Missing course units | 1,586 | Confirmed field-completeness defect in the materialized selected-course records; verify/rebuild from authoritative component tables. |
| Missing item URL, printed locator, and access date | 1,586 each | Confirmed item-level traceability gap. This does not establish that searches were never performed elsewhere. |
| Empty content summaries | 237 | Null/empty field. |
| Placeholder content summaries | 109 | Literal `---`; not student-usable course content. Together, 346/1,586 (21.8%) have no substantive course summary. |
| Missing learning outcomes | 245 | Confirmed persisted-record gap; individual NUC content may still contain them. |
| Rows without `source_context` | 139/140 | Only Portuguese/English has a non-null context in the current scope contract. |
| Rows without `scope_evidence` | 139/140 | Only one row has any scope evidence array entries. A selected course list or full-package flag is not a row-specific crosswalk. |
| Rows without any component reference | 1 | Environmental Science and Technology; it has no selected courses and is currently `external_scope_evidenced`. |
| Component references | 143 total | 135 rows reference one component; four rows reference two; one row has zero. Exact CCMAS component names resolve for all 140 CCMAS refs. The other three refs are intentional `__custom__` references (Anthropology, Sport Science, Sport Management (Education)); this checks referential presence, not whether the chosen component is substantively complete. |
| Rows with no selected course objects | 59 | 54 `full`, four `combined_scope_review_required`, and one external-scope row. Full-package inheritance may be intentional, but provides no selected-item locators or a row-specific course/outcome crosswalk. The combined zero-course cases remain unresolved. |
| `external_scope_evidenced` rows | 5 | Four have 128 combined code/title-only records (French 59, Anthropology 21, Sport Science 39, Sport Management (Education) 9); Environmental Science and Technology has zero selected records. The label overstates persisted source detail until evidence is attached. |

### Confirmed cross-cutting defects and unresolved candidates

1. **Confirmed persisted completeness/provenance defects:** all 1,586 selected records omit units and item-level URL, printed locator, and access date; 237 have empty content, 109 have `---`, and 245 have no outcomes. This is not a claim that every course is irrelevant or that no external/CCMAS source search occurred. It means the student/audit data contract cannot demonstrate item-level correctness from these records.
2. **Confirmed scope-evidence gap:** 139 rows lack both source context and row-specific scope evidence. Parsed institution lists, a `full` flag, and selected-course arrays do not substitute for evidence tying each exact JAMB faculty/institution occurrence to a CCMAS or external curriculum. The 140-row source-occurrence inventory had 149 parsed local offering occurrences; row 420 has an additional directly verified JAMB Social Sciences/OOU awarder occurrence, so at least 150 offering occurrences are known. That occurrence is missing from the local offering inventory. Remaining parsed occurrences are not all independently proven to equal official awarder-table cells.
3. **Confirmed duplicate-course-ID signals, not nine automatic errors:** nine repeated course-code keys occur across six identities: Russian with French/German (`RUS 361` twice, different titles), Hotel Management and Tourism (`HTM 403`, `TRM 408`, `HTM 410` repeated), Home Economics and Food Management (`GST 312`, `ENT 312` each repeated three times), Building Technology (`BUD 221` twice, different titles), Fine Art/Fine and Applied Arts (`FAA 231` twice; authoritative table collision already confirmed in checkpoint 013), and Hausa (`HAU 308` repeated; official course table vs narrative handling recorded in checkpoint 013). Repeated codes may reflect combined-component unions or extraction duplication; preserve each source context and resolve against the authoritative table before deduplicating or selecting a version.
4. **Confirmed stale/incorrect interpretation to preserve:** row 416 FWM 408 is not Ecotourism. NUC Agriculture CCMAS identifies it as Forest Products Harvesting, Processing and Utilization; the local package title conflicts with its forest-products content/outcomes. See checkpoint 014. Do not reuse the prior title-only “ecotourism established” assertion.
5. **Cross-check did not find a general internal-copy mismatch:** selected course records generally reproduce their referenced local component’s fields. That is only an internal consistency check; it cannot detect defects copied from an incomplete or misparsed component. Exceptions and source conflicts are itemized in row checkpoints, including row 416 and the FAA 231 collision.
6. **Component reference integrity:** exact component-name matching resolves all CCMAS references in this range. This rules out simple dangling CCMAS component IDs as a broad omission class; it does not establish that the correct complementary components were assigned. Four two-component references exist and must be judged on the row-specific source evidence already logged, not merged automatically.

## Range closure and remaining coverage

- Row-slice coverage is present for every row 281–420: 001–008 cover 281–360; 009–014 cover 361–420. This cross-cutting checkpoint adds omission classes without repeating those per-row findings.
- Every individual slice reported 0/10 end-to-end closures. The range is therefore **audited for this assigned pass, not resolved/closed**.
- Confirmed defects are separated above from unresolved evidence candidates. Per-row source contexts, exact course codes/titles/content/outcomes, component coverage, source locators, and prior-flag reconciliation remain in checkpoints 001–014 and the append-only register.
- Every row still requires authoritative source evidence and local correction/re-audit where a defect is confirmed. The local main agent owns corrections; this audit did not implement them.
- No row is declared genuinely unavailable solely because it has no CCMAS anchor or selected course list.

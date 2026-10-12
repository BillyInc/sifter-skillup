# JAMB CCMAS full-range audit: canonical rows 001–140

Audit date: 2026-09-26 (Africa/Lagos)

## Append-only checkpoints

This report is a new audit artifact. Findings are appended as the row batches are checked; do not rewrite earlier checkpoints. Scope is audit-only: no shared map, seed, generator, override, or source inventory edits.

### Checkpoint 0 — input and method

Read before row review:

- `data/career-mapping/_audit/jamb_ccmas_inheritance_canonical_2026-08-17.json`
- `data/career-mapping/_audit/jamb_curriculum_scopes_2026-08-17.json`
- `data/career-mapping/_audit/jamb_offering_context_inventory_2026-09-25.json`
- `docs/manual-review/JAMB_CCMAS_MAPPING_FINDINGS_REGISTER_2026-09-25.md`

The canonical inheritance and curriculum-scope files each contain 420 name-keyed records. The offering inventory contains 420 identities, 440 parsed offering occurrences plus one manually source-confirmed occurrence (441 total); each occurrence must remain distinct by source file, faculty/institution tokens, and locator/verification state. Rows 001–140 are audited against exact occurrence context, declared primary/supporting CCMAS components, selected course titles and available content/outcome evidence, component-derived candidate links, and the current active JAMB domain map/status. A prior checkpoint or a `reviewed` label is treated as a lead, not as closure by itself.

Disposition terms: **confirmed defect** means the checked evidence demonstrates a wrong/omitted component, course facet, source occurrence, or unsupported active path; **evidence-needed** means the current evidence cannot establish correctness or defect; **bounded/consistent** means no contradiction surfaced within the evidence reviewed, not source-level certification. Parsed brochure data is not promoted to official-source confirmation without an explicit locator.

Coverage at this checkpoint: 0/140 rows substantively reconciled; 0 source-context occurrences independently closed. The requested inputs have been read. Next: establish the exact current canonical row order and emit a machine-assisted row/occurrence coverage ledger, then examine each 10-row batch and candidate compound/partial row against source and CCMAS evidence.

### Checkpoint 1 — all-row artifact reconciliation and outcome audit

The row order in the canonical inheritance file and curriculum-scope file matches exactly for **140/140** rows. Each identity also resolves exactly to one inventory identity and one active `jamb_domain_map.json` entry. The current row order agrees with `programme_mapping.json`. The 2026-09-25 inventory contributes **151 occurrences** across these identities: **11 identities have more than one inventory occurrence**. Occurrence context was compared by source faculty, source file, parsed row ordinal, institution-token count, and verification/locator state. Only **3/151** occurrences are marked PDF-verified; **148/151 remain unverified at the exact offering-table-cell level**. These are source-evidence gaps, not findings that the listed universities do not offer the degrees.

#### Per-row scope and current-map census

All 140 identities were checked against the current scope and active map. The resulting census is:

| Measure | Checked result |
|---|---:|
| Canonical identities reconciled | 140/140 |
| Inventory offering occurrences | 151 |
| Distinct identities with multiple inventory occurrences | 11 |
| Occurrences with exact PDF verification flag | 3/151 |
| Selected course rows in the saved scopes | 1,500 |
| Selected CCMAS course rows with a source file and exact package/code/title join | 1,459/1,459 |
| Joined CCMAS rows with empty parsed learning outcomes | 14 |
| Joined CCMAS rows with null/empty content summary | 36 |
| Joined CCMAS rows whose content summary is the placeholder `---` | 41 |
| Custom/external selected rows without a CCMAS source file | 41 |
| Combined scopes with zero selected courses | 19 |
| Partial scopes marked `partial_scope_review_required` | 3 (rows 34, 77, 79) |
| Current active JAMB domain links | 577: 75 direct, 488 functional, 14 adjacent |
| Active links with selected-course title locators | 501 |
| Active links without a selected-course title locator | 76 |
| Active-link title locators that fail to intersect the row's saved selected titles | 0 |
| Rows with zero active links | 58 |

The course join verifies that every one of the 1,459 rows carrying a CCMAS source locator resolves to the referenced local package, code and title. It does **not** establish that the row belongs in that JAMB offering, that the current list covers all named facets, that a locally blank field is blank in the NUC source PDF, or that a course justifies a domain relationship. The 41 custom/external rows (principally rows 20 and 32) are not CCMAS joins and remain subject to their own programme-specific source gate.

The inventory is not yet a complete account of all catalogue appearances. Row-level sources identify an omitted/misparsed Arts occurrence for row 40, a separate Engineering Meteorology/Meteorology and Climate Change occurrence around row 133, and a collapsed identity/context at row 136. Row 47's Administration occurrence is recorded with an official-source confirmation, while its Social/Management occurrence remains unverified. Thus **151/151 inventory entries were reconciled**, but the complete source-context population is not closed; these extra or corrupted contexts remain unresolved rather than being silently counted as verified occurrences.

#### Current artifact disagreement

The active JAMB map and canonical inheritance snapshot do not fully agree. Across this range, **37 rows have different mapping-status values** and **row 77 has a link-count disagreement**: the canonical snapshot says 10 links while the active map has 0. The 37 status differences are row 3 (`ready` vs `ready_reviewed`) and rows 5, 9, 10, 33, 45, 51, 54–56, 58, 61–62, 64, 69–70, 74, 84, 86, 95, 101, 103–104, 106, 108–113, 115, 118–119, 122–123, 128 and 130 (the canonical snapshot says `ready`; the active map says `review_required`). Separately, row 79 has eight active links and `ready_partial` even though its scope is `partial_scope_review_required`; that is a scope/status contract mismatch. The active map is the current student-facing map; the canonical snapshot is stale for those fields and cannot be cited as current readiness. Active domain IDs remain within each row's recorded candidate set, but candidate membership is not semantic validation. The 76 active links without course-title locators need explicit evidence review; the 501 links with locators still need course-outcome and domain-task/tier review.

#### Full-range findings disposition

The comprehensive row-indexed report `jamb_combined_partial_scope_audit_rows_001_140_2026-09-26.md` and the 2025 row checkpoints were used as evidence leads and reconciled against the current structured artifacts above. The previously surfaced findings remain live where the current artifacts still show the gap:

- **Confirmed current-scope defects or contradictions:** the 19 zero-course combined scopes are rows 14–17, 26, 28–29, 31, 35–36, 38–41, 43, 49–50, 52 and 77. Row 34 is a separate seven-course `partial_scope_review_required` case, not an empty scope. Row 20's custom curriculum provenance does not substantiate its 18 items; row 32's `ready_external` status/eight links exceed the traced programme-specific course/outcome evidence; row 37 selects Political Science only despite the administrative facet; row 40's Arts occurrence is split/misparsed and absent as a correctly named occurrence; row 47's additional Administration occurrence has a confirmation but the original Social/Management occurrence remains parser-only; row 50 has no selected Sociology/Anthropology courses; row 52 omits the Social Studies facet; row 60 has duplicate course identities/codes requiring source-key reconciliation; rows 63, 66, 69, 72, 75, 78–79, 87, 89 and 96 have specific scope/source-type/facet gaps recorded in the cited row reports. Row 77 now declares both Insurance and Actuarial Science but has no selected courses; its active map has zero links while the canonical snapshot still records 10, so neither an Insurance-only selection nor any inherited routes can be treated as current. Row 101 and rows 108–109 have distinct faculty occurrences; rows 116, 129 and 135 under-represent named Plant Science/Mathematics facets; rows 131, 136, 138–140 have source extraction, identity, or named-facet reconciliation issues.
- **Evidence-needed, not called defects:** exact institution cells for the 148 unverified occurrences; whether repeated-name/multi-faculty offerings share curricula; original NUC page adjudication for the 14 empty outcome fields and 36 empty content summaries; bounded external curricula for facets CCMAS does not supply; and every domain's semantic fit, direct/functional/adjacent tier and downstream subgroup/role tasks. A matching title or a course locator is insufficient by itself.
- **Fail-closed states retained as correct interim behavior:** all 19 zero-course combined scopes and the 58 zero-link rows. They remain unresolved contracts, not proof of unavailability. No prior broad link set is reinstated by this audit.

#### Coverage and unresolved denominator

**Rows checked: 140/140. Rows fully closed against the requested standard: 0/140. Rows with at least one unresolved gate: 140/140.** The checked evidence confirms specific defects while leaving the final row-level curriculum/domain disposition unresolved. The principal unresolved counts are 148/151 inventoried occurrences without exact PDF cell verification (plus the known omitted/corrupted contexts above), 19 empty combined scopes, 3 partial scopes held for review, 14 CCMAS rows with missing parsed outcomes, 36 with empty content summaries, 41 external/custom course rows needing itemized source evidence, and 76 active links lacking course-title locators. All 577 active links were structurally compared with their candidate records and course-title anchors; some have prior item-level reviews, but this audit does not provide a complete accepted/rejected disposition for every domain and descendant, so an exact unresolved-link count is not established. These categories overlap and must not be summed as unique rows or unique defects.

No shared map, scope, source inventory, seed, generator, override, SQL, API, or UI was changed. The only write in this task is this new audit report.

### Checkpoint 2 — row-by-row disposition reconciliation

The row-indexed evidence ledger `jamb_combined_partial_scope_audit_rows_001_140_2026-09-26.md` was checked across all four recorded partitions (001–040, 041–070, 071–100, 101–140). For each row, I reconciled its stated source faculty/context, component references, selected course evidence and domain candidates against the current scope and active-map records. The ledger contains the detailed course/theme and downstream-link assessments; this report adds current-worktree parity checks and corrects findings where that ledger predates later local changes.

Two such corrections are material: row 34 currently has seven selected POL/IRS course records in a pending partial scope (the earlier ledger called it empty); row 77 currently has zero selected courses with both Insurance and Actuarial Science declared (the earlier ledger described an Insurance-only slice). Accordingly the current 19 empty combined scopes include row 77 and exclude row 34. Row 79 remains an eight-link `ready_partial` active entry despite its pending partial scope. The exact current row coverage is therefore 140 checked, 0 fully closed, 140 unresolved at one or more evidence gates. No “ready” or “reviewed” label was used as a substitute for the source, curriculum, and domain checks.

# JAMB–CCMAS automated discovery and review plan

**Status:** deterministic local discovery runner implemented; source discovery is not complete. This plan deliberately separates automated discovery, authoritative source adjudication, and repair.

## Why the work is split into gates

The deterministic runner can exhaustively compare local records and expose inconsistencies. It cannot establish what a JAMB or NUC PDF actually says, decide whether a compound programme title denotes multiple curricula, or justify a curriculum-to-domain relationship. Those require source adjudication. Do not count a candidate as a confirmed defect or a source search as a repair.

## Gate 1 — exhaustive deterministic discovery of local records

Run from the repository root:

```powershell
python data/career-mapping/_audit/run_jamb_ccmas_deterministic_discovery_2026_09_28.py
python data/career-mapping/_audit/augment_jamb_ccmas_local_source_text_search_2026_09_28.py
python -m pytest -q data/career-mapping/_audit/test_jamb_ccmas_deterministic_discovery_2026_09_28.py data/career-mapping/_audit/test_jamb_ccmas_local_source_text_search_2026_09_28.py
```

The runner fails closed unless canonical JAMB mappings and curriculum scopes both contain 420 distinct exact-name rows. It then enumerates every parsed source occurrence separately, every CCMAS package and every course row, and checks:

- missing or extra exact JAMB source names, without silently merging case variants;
- offering occurrences lacking a PDF-verification flag and exact locator;
- missing/empty component scopes and unrepresented named facets;
- whether selected CCMAS rows resolve to their declared package/course, and whether selected title, units, status, hours, content and outcomes agree with the current local source package;
- incomplete course-level citations;
- empty CCMAS content/outcomes, repeated within-package codes, and cross-package course-code/detail reuse.

This runner supplements—not replaces—the existing whole-catalogue inventories. Before creating any new candidate, reconcile against and retain the findings/checkpoint references from:

- `jamb_anomaly_inventory_2026-09-26.json` (420 canonical identities and offering contexts);
- `jamb_ccmas_external_audit_inventory_2026-09-26.json` (the identity/scope/CCMAS join);
- `ccmas_extraction_anomaly_inventory_2026-09-26.json` and `ccmas_bounded_catalogue_audit_aggregate_checkpoint_2026-09-26_001.json` (all 237 packages, structural candidate queues and bounded ranges);
- `jamb_ccmas_open_focus_queue_2026-09-26_002.json`, source-followup rows, repair logs, and the latest per-range source checkpoints;
- `ccmas_empty_summary_source_review_reconciliation_checkpoint_2026-09-26_001.md` and package-level 2026-09-28 source checkpoints.

Checkpoint references mean “previous work exists,” not “the item is closed.” Preserve closed, source-backed micro-findings and repairs; only reopen them when current source data or a contradictory exact-source comparison gives a concrete reason. Where old checkpoint counts differ from the current source files, regenerate the structural inventory and record the new baseline instead of combining counts from different dates or units.

It emits the machine-readable full queue and a short report:

- `jamb_ccmas_deterministic_discovery_2026-09-28.json`
- `jamb_ccmas_deterministic_discovery_2026-09-28.md`
- `jamb_ccmas_local_source_text_search_2026-09-28.json`
- `jamb_ccmas_local_source_text_search_2026-09-28.md`

### Baseline from the regenerated 2026-09-29 deterministic run

- 420 canonical JAMB identities; 443 current parsed offering occurrences across 9 degree-offering files. Of these, 442 join to a canonical identity and one distinct source spelling, `Sociology and Anthropology`, is retained separately; the canonical record currently says `Sociology and Anthroplogy`. Reconcile the name/context; do not auto-create or delete an identity.
- 152 canonical-linked current occurrences have both a local explicit-PDF-verification flag and locator; counting the one orphan source occurrence, 153/443 total occurrences have both fields and 290 lack at least one. This is ledger state, not substantive confirmation that those 153 are correct.
- 440 current offering occurrences join to a stable ID in the older context inventory; 3 current occurrences do not, and one older inventory occurrence is absent from the current files. These are reconciliation differences, not automatic defects.
- 237 CCMAS packages and 9,854 course rows across 17 source files.
- The report emits a stable ordinal record for each of the 9,854 CCMAS course rows and reconciles saved course-level checkpoints. Current structural candidates include 1,053 empty/placeholder content summaries, 505 empty outcome lists, 50 within-package duplicate-code groups, and 3 repeated-outcome rows. These are regenerated structural candidates, not counts of confirmed defects.
- Cross-package candidates: 433 course-code groups occur in multiple packages under differing titles; 142 groups reuse the same content/outcomes under different titles. These are candidate groups, not confirmed defects; shared/common courses and code reuse may be legitimate.
- 191 JAMB names trigger the compound-title lexical screen. This is only a discovery lead and does not prove a blended curriculum.
- The separate local extracted-text search covers all 443 JAMB occurrences and all 9,854 CCMAS course rows. It found local extract text for all JAMB occurrences, exact-title text hits for 336, extracts for 7,320 CCMAS rows, and code plus title on the same extracted page for 6,851. These are search leads only, not PDF verification or source decisions.
- Five CCMAS source files have no local text extract (Administration & Management, Agriculture, Law, Medicine & Dentistry, Social Sciences); their official NUC URLs are recorded. Missing local extracts do not mean the official sources are unavailable.

### What the existing discovery already completed

The earlier catalogue work has already completed deterministic enumeration of all **420 JAMB identities** and a structural candidate scan of all **237 CCMAS packages**. The 2026-09-26 JAMB inventory reports 420 identities and 77 identities with deterministic flags; its 419 unverified-context count is an older ledger-state measure, not a current source-audit completion count. The 2026-09-26 CCMAS bounded aggregate covers all 237 packages / 9,854 then-current course rows, but explicitly says it is structural candidate detection, not source adjudication. The regenerated 2026-09-29 runner also sees 9,854 rows. Never add these historical and current counts together.

The 274-row JAMB open-focus queue has checkpoint references for all 274 rows, but a reference is not closure. The selected full-package CCMAS source audit checkpoint dated 2026-09-28 covers a defined 79-package subset / 3,342 local rows; only Pharmacology (1/79) is complete for that full-package phase, with Physiotherapy still in progress. Earlier targeted source checks and repairs remain valid for their exact items but do not count as full-package audits. The remaining 158 CCMAS packages are not part of that selected 79-package pass and need an explicit lane, not a silent omission.

Therefore, deterministic discovery now covers all current local rows and selected prior checkpoint joins, and local extracted-text searching now covers all current JAMB occurrences and CCMAS course rows. **Authoritative source discovery/adjudication is not done.** The remaining preparation is to turn reconciled records and prior range decisions into resumable, disjoint source-review batches. Do not rerun already closed item-level source checks merely because the catalogue-wide package audit is incomplete.

Counts from different checks overlap and have different units (identity, source occurrence, course row, package, or code group). The JSON retains the unit and the underlying records. Never sum them into a total number of defects.

## Gate 2 — source-backed discovery and adjudication

Use the generated report as the exhaustive local queue. For each of the 443 current JAMB source occurrences (including unmatched spellings), reconcile its stable ID, exact title, source faculty, awarder cell and continuation boundary against its linked official brochure. Preserve same-name occurrences as separate source contexts. Reuse Lane A/B/C checkpoints and prior source-verification decisions; review only uncovered or conflicting occurrences. Record URL, printed page/table locator, access date, observed facts and local comparison.

For each of the 9,854 current CCMAS course rows, compare package/course identity, title, units, status, lecture/practical hours, content, outcomes, ownership and duplicate-code context with the exact NUC CCMAS pages. The full-row report, stable record fingerprints and prior-checkpoint reconciliation support this search; source adjudication still must be recorded. An empty local field is only a candidate until the authoritative source confirms the missing value. Use external curricula only where CCMAS is absent or insufficient, and cite the specific named facet. Five source PDFs need to be retrieved/extracted or inspected from their recorded official URLs before text-based matching can cover those packages.

For each partial/combined JAMB scope, record a facet-by-facet ledger: named facet, source basis, selected CCMAS component(s), selected course codes, outcomes, omitted/unrepresented part and reason. Title keywords, inherited mappings, and a “reviewed” label do not close this gate.

Three non-overlapping audit partitions, after refreshing the current queues and importing checkpoints:

1. canonical JAMB rows 001–140 and CCMAS package indices 001–079;
2. canonical JAMB rows 141–280 and CCMAS package indices 080–158;
3. canonical JAMB rows 281–420 and CCMAS package indices 159–237.

Each partition must first import existing checkpoints and mark their exact coverage to avoid repeating work. Agents append evidence and regression tests to disjoint checkpoint files; they do not edit shared product ledgers during source discovery. Active assignments are tracked in the current goal session, not inferred from old notes. Local work handles reconciliation and verified repairs in separate files after each evidence batch.

## Gate 3 — reconcile findings before repair

Merge partition checkpoints into one normalized register keyed by exact source occurrence or exact CCMAS package/course identity. Each entry must have one disposition:

- `confirmed_defect` — primary-source comparison proves the current local value is wrong or incomplete;
- `confirmed_match` — the required source fields were compared and match;
- `source_conflict` — authoritative sources disagree; preserve both and explain;
- `candidate` — automated signal not yet adjudicated;
- `unresolved` — source or locator could not be established after the documented search.

Deduplicate only identical evidence findings, not same-name JAMB offering occurrences. Summaries must report separate denominators for identities, offering occurrences, CCMAS packages, course rows, confirmed defects, candidates, and unresolved checks.

## Gate 4 — reconcile and repair JAMB–CCMAS curriculum evidence

Only after source findings are reconciled, use course contents and learning outcomes to correct each JAMB-to-CCMAS/external facet and re-evaluate its programme-to-domain link. Do not start a separate domain/subgroup/role downstream audit in this phase. Apply verified repairs to authoritative inputs, regenerate derived artifacts, and run catalogue and focused regression checks. Never patch generated seeds by hand.

## Current boundary

Gate 1's current runner emits all 420 identities, 443 parsed JAMB occurrences (including the orphan spelling), 237 CCMAS packages, and 9,854 CCMAS course rows, and passes its focused tests. This is exhaustive for current local records and implemented deterministic checks, not authoritative source truth or PDF/OCR completeness. Source adjudication and deeper source-search automation remain open. Domain/subgroup/role downstream is paused until JAMB–CCMAS and external curriculum issues are reconciled and fixed.

## Verified local repair since the baseline

On 2026-09-28, the detailed German CCMAS rows `GER 101` and `GER 103` in `ccmas/arts.json` were reconciled to the official NUC Arts CCMAS 2023 course blocks (printed pp. 470–471). Their learning outcomes are now separated from course contents, all eight GER 101 outcomes and all seven GER 103 outcomes are represented, the specific missing translation/interpretation/evaluation outcome is restored, the GER 101 content summary is restored, and the truncated GER 103 summary is completed. Both rows retain the official PDF URL and printed-page locator. Regression coverage is `test_ccmas_german_rows_101_103_source_repair_2026_09_28.py`.

The Materials Engineering `MSE 301` row in `ccmas/engineering.json` was also reconciled to the exact NUC course block (printed pp. 878–879): eight unrelated oceanography outcomes were replaced by the six mineral-processing outcomes, the course content summary and item-level source locator were added. Regression coverage is `test_ccmas_mse301_source_repair_2026_09_28.py`, and the guarded edit is reproducible with `apply_ccmas_mse301_source_repair_2026_09_28.py`. After both repairs, the deterministic inventory was regenerated: empty/placeholder summaries now number 1,065 and packages with structural candidates 177. The German/MSE repairs plus current deterministic discovery, extracted-text search and coverage-matrix suites passed together (18 tests).

The German shared-course code issue is intentionally not edited: the NUC global structure at printed p. 467 lists `GST 113` for Nigerian Peoples and Cultures, while the detailed block at printed p. 469 labels the same course `GST 112`. This is recorded as a source conflict pending authoritative clarification; matching title text alone is not a sufficient basis to rewrite the local code.

Two further source-backed Engineering repairs are now recorded. `MTE 415` had an adjacent `GET 499 SIWES` title spill and unrelated lab-manual/next-level text in its outcomes; its title and three outcomes were corrected from the NUC table (printed p. 815) and detailed block (p. 841). The table says status C while the detailed block says E; the local table value remains C and the conflict is explicit in its locator. `PGE 101` had the programme-table hour cells embedded in its title and blank structured hours; its title is corrected and its structured values now match the programme table (printed p. 1046: 2 units, C, LH 15, PH 45). The detailed block (p. 1056) states LH 30, so the source-internal hour conflict is retained rather than silently overwritten. Guarded scripts and regression tests are `apply_ccmas_mte415_source_repair_2026_09_28.py` / `test_ccmas_mte415_source_repair_2026_09_28.py` and `apply_ccmas_pge101_source_repair_2026_09_28.py` / `test_ccmas_pge101_source_repair_2026_09_28.py`.

At the post-Engineering/ACS 311 snapshot, the deterministic discovery and extracted-text search reported 420 JAMB identities, 443 parsed offering occurrences, 237 CCMAS packages and 9,853 course rows; extracted text showed code plus title on the same page for 6,853 rows. That snapshot had 151 canonical-linked occurrences (152 including the orphan) with the PDF-flag-plus-locator pair. The regenerated 2026-09-29 baseline above supersedes those counts. The ACS 311 rerun also found at least one current finding for all 420 canonical identities and 4 selected-course/component internal discrepancies. A combined focused source-repair, lane-checkpoint, discovery, text-search and coverage-matrix suite passed **30 tests**; all counts are ledger diagnostics, not source-audit closure.

The Actuarial Science `ACS 311` load defect in Lane 1 checkpoint 008 is also repaired: the row now matches the NUC global table (2 units, C, LH 15, PH 45), with the exact source URL and printed p. 55 locator retained. Its detailed content/outcome review and the Actuarial package audit remain open. The guarded edit is `apply_ccmas_acs311_hours_repair_2026_09_28.py`; `test_ccmas_acs311_hours_repair_2026_09_28.py` protects the corrected fields.

For Petroleum and Gas Engineering `PGE 101` (Lane 3 increment 006), the exact NUC detail block at printed p. 1056 was also checked: all six local outcomes match, while the local content summary had absorbed the following `200 Level` heading; that spill is removed. The table/detail title variation and LH 15 vs LH 30 conflict are documented in the course locator and lane checkpoint. This row-level repair does not close package 171's remaining rows.

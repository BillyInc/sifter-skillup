# D078 role-item QA checkpoint — 001–072

Date: 2026-10-09  
Status: QA complete for the assigned slice with review-only residuals; saved source package unchanged.

## Scope correction

The role `philosopher` is excluded from all D078 QA counts, crosswalks and proposed student routes. The saved package contains six philosopher occurrences across six pair records: `history|optional`, `sociology|optional`, `journalism|optional`, `religious studies|optional`, `political science|optional`, and `politics|optional`. The pair records remain in the package because they also contain in-scope roles. The QA scope is therefore **72 pair records / 137 retained role-item occurrences**. The package manifest's raw count is 143; it is not the retained QA count.

## Checks completed

- All eight batch JSON files parse.
- Manifest and batch JSON reconcile to 72 distinct pair keys and 143 raw occurrences; every pair key is present once, and each `occurrence_count` equals its provenance-list length.
- All 72 records retain `student_display_approved: false`; no canonical/common-ledger modification flags are true.
- No separate Locke, Herschel or Leibniz artifact copy is present under the assigned lane. The saved files have no author/version field. Shared checkpoint notes conflict on author attribution: the continuation checkpoint says Herschel supplied rows 001–030, while `checkpoint-070.md` labels batch 004 (rows 031–040) Herschel. Leibniz's reported all-72 version is not saved for content comparison.
- Saved checkpoint counts conflict with the final JSON: `checkpoint-060.md` says rows 041–050 have 19 occurrences and batch 006 has 14; final batch JSON and `checkpoint-072.md` show 20 and 12. `checkpoint-070.md` repeats the stale 14 count for batch 006.
- JSON representation drifts: batches 001–005 omit structured `free_learning_resource` for 50 records; batches 001–005 use `meaning_and_task_output`/`role_task_rationale`, while batches 006–008 use `meaning_task_output`/`task_rationale`.
- A read-only sweep found 295 distinct package URLs: 204 returned HTTP 200, one HTTP 202, and 90 were non-success in this environment. Seventeen confirmed 404s were found package-wide; sixteen are used by current batch JSON records. Blocked/transport failures remain unverified rather than treated as dead.

## Repaired QA/package artifact

The derived repaired package is saved under `qa-001-072/repaired-package/`. It normalizes all 72 records, adds structured candidate/none-found learning states with locator/scope/limits, and records the 16 dead-link searches and dispositions. Thirteen dead URLs have bounded replacements; three retain exact residuals. No source, canonical, API, SQL, role-fit, common ledger, or builder artifact was edited.

- Repaired package: `repaired-package/d078_role_item_repaired_qa_package_001-072_2026-10-09.json`
- Repaired report: `repaired-package/REPAIRED_QA_REPORT_001-072_2026-10-09.md`
- Repaired lane gate: `repaired-package/repaired-lane-gate-2026-10-09.json`

## Required approval gates recorded

For all 72 pair records: exact identity verified = 0; direct role-task/use verified = 0; programme/domain/area/role checkpoint fit verified = 0; task-specific learning links verified = 0; credentials/certifications promoted = 0. Prerequisites, complements, alternatives, limits/false-match text, global evidence entries and unresolved checks are populated as research scaffolding. Every record remains review-only and student-hidden.

## Handoff totals

QA disposition fixed/resolved: **5 issue actions**. Verification check groups passed: **8**. Residual issue classes: **9**. Repaired counts are: structured learning fields 22→72; learning locator flags 50→0; schema variants 2→0; dead URLs 16→13 replaced plus 3 exact residuals; candidate learning states 65; explicit none-found states 7. Exact identity, direct task/use, checkpoint fit, Nigerian gaps, authoritative source-locator gaps, parallel provenance and student approval remain unresolved/review-only. No source-lane artifact was overwritten.

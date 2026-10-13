# Physiotherapy CCMAS course-detail repair — 2026-09-28

**Scope:** apply the confirmed course-detail omissions documented in
`ccmas_physiotherapy_source_audit_2026-09-28_002.md`. This is a bounded local
data repair, not closure of the package audit.

## Source and corrections

Primary source: National Universities Commission, *Core Curriculum and Minimum
Academic Standards (CCMAS) for Nigerian Universities: Allied Health Sciences*
(2023), <https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf>,
accessed 2026-09-28.

- **PST 511 — Neurological Physiotherapy II**, detailed block, printed p. 620,
  lines 24158–24170: restored both learning outcomes and a complete concise
  content summary, including spinal lesions, neuropathies, neurological
  infectious complications, assistive devices, and community reintegration.
- **PST 522 — Research Proposal Seminar**, printed p. 623, lines 24265–24278:
  restored all five outcomes and summarized the supervisor-guided proposal
  presentation and departmental critical appraisal. The source has no distinct
  `Course Contents` heading for this row, so none was invented.
- **PST 516 — Ergonomics and Workplace Physiotherapy**, detailed block, printed
  pp. 622–623, lines 24234–24250: restored the complete concise content
  summary. The NUC global table uses the title “Ergonomics and Occupational
  Health Physiotherapy,” while the detailed block uses the stored title. The
  source-internal title discrepancy is retained explicitly in
  `source_conflict_note`; no unsupported title normalization was made.

Each repaired row now carries the official source URL, exact printed-page/line
locator, and access date. Only these three Physiotherapy course rows were
changed; course counts, curriculum scope, other rows, and all downstream links
were left untouched. The deterministic repair is
`repair_physio_pst511_516_522_course_details_2026_09_28.py`.

## Increment 003 repairs

After the next four source blocks were audited in
`ccmas_physiotherapy_source_audit_2026-09-28_003.md`, confirmed extraction
defects were repaired locally:

- **PST 523:** restored lecture hours (30), removed a page-footer contaminant
  from the fourth outcome, supplied a source-supported readable rendering of
  the malformed third outcome, and completed the summary through Nigerian PHC
  physiotherapy services. The original malformed wording and the global-table
  versus detailed-block title variant are disclosed in row-level audit notes.
- **PST 524:** completed the truncated content summary from the detailed block;
  kept the global/detailed title spelling variant explicit.
- **PST 525:** restored practical hours (90), removed the page-footer contaminant
  from the fourth outcome, and completed the content summary through caregiver
  advice.
- **PST 526:** removed the appended `600 Level` heading from the fifth outcome
  and added a concise source-supported description of the externally moderated
  examination. The global table's dashes versus the detailed block's `PH 45`
  remain explicitly unresolved; local `ph` stays null pending source-conflict
  policy.

The deterministic repair is
`repair_physio_pst523_526_course_details_2026_09_28.py`. These corrections do
not close the overall Physiotherapy audit; the package still has 41 of 48
DPT-owned course blocks left in the source-comparison pass per increment 003.

**Provenance field clarification:** the row schema used here is
`source_accessed_on`, not `source_accessed_date`. The repaired PST 511, PST 516,
and PST 522 rows do contain `source_accessed_on: 2026-09-28`, verified by the
focused test. The provenance follow-up in increment 003 used the wrong field
name when it called the access date blank; the data is present under the
established row-field name.

## Increment 004 repairs

The next source comparison, documented in
`ccmas_physiotherapy_source_audit_2026-09-28_004.md`, confirmed four further
course-detail defects. They are now repaired locally from the official NUC
CCMAS:

- **PST 601:** restored the practical-hours value (135) and completed the
  project summary, including external moderation of the dissertation.
- **PST 611:** completed the truncated respiratory-care summary; preserved the
  global-table versus detailed-block course-title variant in
  `source_conflict_note`.
- **PST 612:** restored units (2) and practical hours (90), and completed the
  clinical-rotation summary. Lecture hours remain null because the source
  indicates none.
- **PST 613:** restored the clean course title, units (2), lecture hours (30),
  and a complete concise management/administration content summary.

The deterministic correction is
`repair_physio_pst601_611_612_613_course_details_2026_09_28.py`. Regression
coverage now checks the corrected values and official-source provenance. These
are additional confirmed defects—not a reason to omit lower-severity findings
or to close the full Physiotherapy package audit.

## Increment 005 repairs

The source comparison in `ccmas_physiotherapy_source_audit_2026-09-28_005.md`
confirmed additional defects, which have now been repaired locally:

- **PST 614:** completed the palliative-care content summary.
- **PST 621:** completed the truncated summary and retained the global-table
  versus detailed-header LH/PH disagreement in `source_conflict_note`; stored
  hours continue to follow the detailed header pending a consistent policy.
- **PST 622:** restored PH 90, separated the fourth learning outcome from the
  clinical-rotation description, completed the summary, and recorded the
  global/detailed title variant.
- **PST 623:** removed page-footer contamination from the second outcome and
  captured the examinable clinical scope in a summary. The global-table dash
  versus detailed-header PH 45 conflict is explicit; stored PH remains null.

The deterministic repair is
`repair_physio_pst614_621_622_623_course_details_2026_09_28.py`; regression
tests check each correction and its provenance. No source conflict was silently
resolved, and these fixes do not close the full source comparison.

## Increment 006 repairs

The audit in `ccmas_physiotherapy_source_audit_2026-09-28_006.md` confirmed
truncated summaries and missing source metadata for **PST 624** and **PST 625**.
Both summaries have been completed from their detailed NUC course blocks, and
each row now has the official URL, printed-page/line locator, and access date.
Both source-hour conflicts (global table LH 15 vs detailed block LH 30) are
recorded explicitly; stored hours still follow the detailed course blocks.
PST 624's student-facing summary uses current respectful wording while its note
discloses the older terminology in the source.

The deterministic repair is
`repair_physio_pst624_625_course_details_2026_09_28.py`; regression coverage
checks all these fields. This completes corrections for all defects so far
confirmed in PST 511-526 and PST 601-625, but the full DPT audit still has
unchecked 300/400/500-level course blocks and must not be called complete.

## Increment 007 repair

The first unchecked lower-level block audited in
`ccmas_physiotherapy_source_audit_2026-09-28_007.md` is the exact DPT row
**PST 311 — Introduction to Physiotherapy Profession**. Its identity, hours,
and five learning outcomes match the NUC source; the confirmed defects were a
summary cut off at the extractor limit and missing item-level provenance. The
summary is now complete through walking-aid assessment, and its NUC URL,
printed-page/line locator and access date are recorded.

The repair is `repair_physio_pst311_profession_course_summary_2026_09_28.py`;
the focused regression test now checks complete topic coverage and provenance.
The separate PST 311 programming courses owned by other programme contexts
were not changed. The Physiotherapy source audit remains open and proceeds to
PST 312.

## Verification and remaining work

Focused regression test:

```powershell
python -m pytest data/career-mapping/_audit/test_ccmas_physiotherapy_source_audit.py -q
```

The correction addresses three confirmed details only. Physiotherapy remains
open for full source course-count reconciliation and comparison of its other
course blocks; the selected CCMAS audit remains 1/79 package-complete until a
package receives a full source comparison. No JAMB-to-CCMAS component decision
or downstream domain/subgroup/role link was changed.

## Increment 008 repair

The source check in `ccmas_physiotherapy_source_audit_2026-09-28_008.md`
confirmed page-footer contamination in PST 312's final outcome, a content
summary truncated mid-word, and missing item-level NUC provenance. The exact
DPT-owned PST 312 row now has the footer removed, a complete concise summary
through body-composition effects, and the official NUC URL, printed-page/line
locator and access date. Identity, units, status and hours were already correct.

The deterministic repair is
`repair_physio_pst312_exercise_physiology_2026_09_28.py`; its regression test
checks the corrected fields. The separate programme-context PST 312 records
were not touched. The package audit remains open at 19/48 source-compared
blocks, with PST 313 next.

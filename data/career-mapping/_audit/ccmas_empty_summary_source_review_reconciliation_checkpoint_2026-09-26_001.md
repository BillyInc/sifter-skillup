# CCMAS empty-summary reconciliation checkpoint — 2026-09-26 (001)

This append-only checkpoint reconciles the current empty-summary inventory
against the saved original-source review. It does not rerun or reopen closed
source repairs, edit CCMAS JSON, or make downstream changes.

## Exact scope and files

- Inventory: `data/career-mapping/_audit/ccmas_extraction_anomaly_inventory_2026-09-26.json`
- Existing source review: `data/career-mapping/_audit/ccmas_original_source_review_2026-09-18.json`
- New exact reconciliation: `data/career-mapping/_audit/ccmas_empty_summary_source_review_reconciliation_2026-09-26_001.json`
- CCMAS files scanned: 17
- Programme packages: 237
- Course records: 9,854
- Empty-summary occurrences: 1,092
- Empty-summary unique keys: 1,088

## Reconciliation result

| Current empty-summary key status | Exact count |
|---|---:|
| Existing review says `source_backed_with_table_primary_identity` | 18 |
| Existing review says `source_content_missing_or_course_identity_unresolved` | 3 |
| Not present in the saved original-source review | 1,067 |
| Total unique keys | 1,088 |

The 18 source-backed rows are not automatically complete student records: they
have source evidence in the older review but still need the current extraction
contract checked before a summary is filled. The three review-only rows are
`Finance / Banking and Finance::FIN 102`, `Procurement Management::PRM 408`,
and `Library and Information Science::LIS 228`; they remain unresolved, not
unavailable.

The exact 21 records, source-review decisions and printed-page arrays are in
the JSON ledger. The remaining 1,067 are not source-adjudicated by this
reconciliation; absence from the older review is explicitly not evidence that
the NUC document lacks content.

## Guardrails

- No CCMAS source JSON was edited.
- No JAMB, domain, subgroup, role or seed file was edited.
- This is a source-evidence reconciliation, not an availability decision.
- The next pass must source-check the 1,067 absent keys and record the official
  URL, printed locator and access date for each confirmed source decision.

## Reconciliation increment — 2026-09-28

After the initial source adjudications below, the deterministic CCMAS scan was
regenerated: 237 packages and 9,853 course records. FIN 102 is no longer among
the empty keys because its unsupported course row was removed. PRM 408 and LIS
228 remain empty-summary records but are now table-only verified: the official
NUC tables establish their identities and loads, while their detailed course
blocks were not found. The refreshed reconciliation had 18 source-backed keys,
2 table-only verified keys, and 1,063 keys absent from the older saved review.

After FIX-033 restored the source-present Data Science DTS 322 content, the
inventory reported 1,087 empty-summary occurrences across 1,082 unique keys.
FIX-035 then restored source-present PPE PHL 301, PHL 302, and PHL 305 details
and reclassified PHL 306 as table-only. The latest inventory now reports
**1,084 empty-summary occurrences across 1,079 unique keys**: 13 remaining
source-backed empty-summary rows, 3 verified table-only rows (PRM 408, Social
Sciences LIS 228, PPE PHL 306), and 1,063 unique keys absent from the older
review. The 1,063 are source-check candidates, not confirmed defects.

Two records from the earlier three-row review-only set were adjudicated
directly against the official NUC Administration and Management CCMAS:

- `Finance / Banking and Finance::FIN 102` was a false parsed course row. The
  Finance global course structure on printed p. 235 lists FIN 101 as the only
  100-Level finance-specific course and then proceeds to 200 Level. The local
  FIN 102 row duplicated FIN 101's units/hours and had no source title,
  outcomes, or course-content block; that unsupported row has been removed.
- `Procurement Management::PRM 408` is a real table-listed course. The 400-Level
  structure on printed p. 464 specifies “Case Studies in Procurement
  Management,” 2 units, core, 30 lecture hours. The later course-detail sequence
  does not provide a PRM 408 outcome/content block. The title/load and exact
  source locator are now restored; outcomes and content remain empty rather
  than being inferred from the course title.

Source: NUC, [Administration and Management CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf), accessed 2026-09-28. Regression test: `test_ccmas_fin_prm_table_adjudication_2026_09_28.py` (2 passed).

This increment is limited to these two exact records. It does not adjudicate
the other open empty-summary keys or claim the 237-package curriculum audit is
closed. Rebuild the deterministic anomaly inventory before using its prior
counts, because the false FIN 102 row has been removed.

The regenerated anomaly inventory then surfaced a source-review-backed
content omission in Computing `Data Science::DTS 322`: its detailed CCMAS
block on printed p. 112 contains course contents, but the parsed row had only
outcomes. The content has now been restored with an item-specific NUC URL,
printed locator and access date (FIX-033). This resolves one content omission,
not the remaining catalogue-wide source checks.

The same increment also completed the source-citation gap for the separate
Social Sciences `LIS 228`: the official table lists Information Literacy at 2
core units/30 LH on printed p. 139, while the detailed section has no matching
course block. The existing `table_only` classification and empty content/
outcomes were preserved; only the official URL, exact locator and access date
were added. This is a distinct CCMAS package record from Education LIS rows.

## Reconciliation increment — 2026-09-28 (FIX-036)

Restored course-content summaries for Information Systems `MTH 101`,
`MTH 102` and `PHY 101` from the exact NUC detailed course blocks (printed pp.
152–153), while retaining their global-table loads from p. 149 and explicitly
preserving the contradictory detailed loads as audit flags. The deterministic
inventory now reports **1,081 empty-summary occurrences across 1,076 unique
keys**: 8 remaining source-backed keys, 3 table-only verified keys, and 1,063
keys absent from the older source review. Those 1,063 are not proven defects or
unavailable courses; they still need source checks. The regression test passes.

The same source check resolved Law `ENT 211` in both Law and Common & Islamic
Law: the NUC detail block is printed on pp. 33–34 and repeated on pp. 63–64.
Both rows now have source-backed summaries and eight clean outcomes; duplicated
outcomes and the pasted audit-note/parser debris were removed. The inventory
now reports **1,079 empty-summary occurrences across 1,074 unique keys**. The
remaining 8 source-backed keys, 3 table-only rows and 1,063 not-yet-reviewed
keys are still open categories, not evidence that the latter have no source.

## Reconciliation increment — 2026-09-28 (FIX-038)

Restored course-content summaries and clean source-grounded outcomes for Common
& Islamic Law `ICL 301`, `JIL 501`, `JIL 502`, `PPL 501` and `PPL 502` from
their exact NUC blocks. The ICL 301 code-prefix omission remains flagged; JIL
table/detail load conflicts and PPL discrepancy resolutions were preserved.
The latest inventory reports **1,074 empty-summary occurrences across 1,069
unique keys**: 3 source-backed keys still need review, 3 verified table-only
rows, and 1,063 keys absent from the older source review. The latter remain
unreviewed, not proven unavailable.

## Reconciliation increment — 2026-09-28 (FIX-039)

Restored the Software Engineering-specific contents and outcomes for `COS 102`
and `COS 409`. The NUC programme tables and detailed course blocks disagree on
loads for both, so the table values remain primary and the detailed-block
figures are explicitly retained in flags. `COS 409` outcomes now reflect the
Software Engineering course block rather than a mismatched generic extraction.
The inventory reports **1,072 empty-summary occurrences across 1,067 unique
keys**: 1 previously source-backed row, 3 table-only rows and 1,063 unique keys
absent from the old review. The absent keys are not confirmed defects or
unavailable courses.

## Reconciliation increment — 2026-09-28 (FIX-040)

Restored the Library and Information Science `LIS 322` content summary and
outcomes from the NUC detailed block for the identical title, while retaining
the table's `LIS 322` identity/load and an explicit `source_conflict`: the
detailed block is headed `LIS 225`. The record is no longer an empty-summary
candidate, but its course-code discrepancy remains unresolved and must not be
silently normalized.

The regenerated deterministic inventory now reports **1,071 empty-summary
occurrences across 1,066 unique course keys**. Of these, 1,063 keys are absent
from the older saved source review, two are verified table-only rows, and one
has table-backed identity with no matching detailed course block located.
Absence from the old review remains “not yet source-checked,” not “no source
exists.” The JAMB source/offering audits are separate and remain active.

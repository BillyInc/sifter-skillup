# Repair lane A — JAMB source/offering context incremental checkpoint 018

**Date:** 2026-09-28 (Africa/Lagos)  
**Status:** resolved Administration occurrence 9 from its exact title-awarder cell  
**Lane:** JAMB source/offering contexts only

## Completed increment

Continued from checkpoint 017 and investigated only the first held row it
identified: Administration occurrence **9, `Hotel and Tourism Management`**.
The official [IBASS Administration brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf)
is represented in the checked-in text extraction at
`data/career-mapping/_jamb_txt/Administration.txt:1362-1365`, printed page 70.
That exact title cell lists **NOUN** and **WESTERN-DEL**.

The prior parsed institution array had incorrectly pulled in awarders beneath
subsequent headings. `HOSPITALITY AND TOURISM MANAGEMENT` and `TOURISM AND EVENT
MANAGEMENT` begin as distinct source title cells immediately after the Hotel
and Tourism Management row. They are not merged into this offering. The
Administration record now contains only `NOUN` and `WESTERN-DEL`, and records
the exact source title, URL, locator, verification/access date, disposition,
and this checkpoint. Its requirement and waiver text was not edited.

**Disposition:** confirmed exact title-awarder cell; previous hold resolved.
The direct official PDF endpoint renders an IBASS JavaScript shell in the web
reader, so the exact-cell locator is to the repository's brochure text
extraction; a non-official mirror was not used as the basis for promotion.

## Reconciled Lane-A count and next action

Across the Administration (60), Agriculture (28), and Engineering (37)
occurrence ledgers, the row-level totals are now **125 occurrences: 86
source-text confirmed, 39 evidence-held, 0 pending/unreviewed**. This increment
resolved one of the previously held Administration occurrences. The next
bounded task is the next held Administration source context; do not revisit the
confirmed rows.

This is not completion of the 420-identity JAMB source audit, all faculty
offering contexts, CCMAS curriculum review, or downstream mapping.

## Validation and changed files

Added focused regression coverage for the exact row, provider list, official
URL, printed-page/text-line locator, dated disposition, unchanged requirement
text, and reconciled Lane-A totals:
`python -m pytest data/career-mapping/_audit/test_jamb_source_repair_lane_a_administration_hold_009.py -q`.

Changed only `data/career-mapping/jamb/administration_offerings.json`, this
checkpoint, and its focused test. No CCMAS scope, downstream/domain data,
taxonomy names, seed, or SQL artifacts were touched.

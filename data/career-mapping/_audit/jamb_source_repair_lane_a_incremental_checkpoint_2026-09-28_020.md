# Repair lane A — JAMB source/offering context incremental checkpoint 020

**Date:** 2026-09-28 (Africa/Lagos)  
**Status:** resolved Administration occurrence 50 from its exact title-awarder cell  
**Lane:** JAMB source/offering contexts only

## Completed increment

Continued from checkpoint 019 and investigated held Administration occurrence
**50, `Transport and Tourism`**. In the checked-in extraction of the official
[IBASS Administration brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf),
`Administration.txt:1412-1414` (printed p. 72) gives the exact title
`TRANSPORT AND TOURISM` and the awarder `REDEEMERS`. The row is now confirmed
with that single exact title-awarder association and carries the official URL,
locator, access date (`2026-09-28`), disposition/reason, and checkpoint.

The neighboring `TRANSPORT MANAGEMENT` and `TRANSPORT AND LOGISTICS MANAGEMENT`
headings remain distinct source contexts. Requirements columns for Transport
and Tourism are blank in the source and remain blank. The prior non-official
mirror was not used as the basis for this confirmation.

## Administration boundary and Lane-A counters

The previously held Administration source rows 9, 16, 23, and 50 now have
exact title-awarder evidence and corrected institution arrays. Two other
Administration holds (occurrences 28 and 31) already have itemized exact
source contexts in checkpoint 015; their source-cell capture is complete, but
the hold remains specifically for canonical identity/grouping adjudication.
They were not re-searched or changed in this increment.

Across the Administration (60), Agriculture (28), and Engineering (37)
occurrence ledgers, row-level totals are now **125 occurrences: 89
source-text confirmed, 36 evidence-held, 0 pending/unreviewed**. The remaining
held contexts across Agriculture and Engineering still need bounded source
checks; continue only on those holds and do not revisit confirmed rows.

This does not complete the full 420-identity JAMB source audit, the 237-package
CCMAS audit, or downstream mapping.

## Validation and changed files

Focused validation:

```powershell
python -m pytest `
  data/career-mapping/_audit/test_jamb_source_repair_lane_a_administration_hold_009.py `
  data/career-mapping/_audit/test_jamb_source_repair_lane_a_administration_holds_016_023.py `
  data/career-mapping/_audit/test_jamb_source_repair_lane_a_administration_hold_050.py -q
```

Changed only `data/career-mapping/jamb/administration_offerings.json`, this
checkpoint, and the focused row tests. No CCMAS curriculum, downstream/domain
data, taxonomy names, seed, or SQL artifacts were touched.

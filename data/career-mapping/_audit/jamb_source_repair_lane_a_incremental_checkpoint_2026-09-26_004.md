# Repair lane A — JAMB source/offering context incremental checkpoint 004

**Date:** 2026-09-26 (Africa/Lagos)  
**Status:** progress checkpoint saved before the next bounded source-review increment  
**Lane:** JAMB source/offering contexts only

## Current bounded scope

The next review is limited to these parsed occurrence files and their matching
official IBASS degree brochures:

- `data/career-mapping/jamb/administration_offerings.json` — 60 occurrences
- `data/career-mapping/jamb/agriculture_offerings.json` — 28 occurrences
- `data/career-mapping/jamb/engineering_offerings.json` — 37 occurrences

**Total lane-A occurrences:** 125.

## Current evidence counts before the next increment

- **Verified/source-confirmed occurrence records:** 4
  - Administration `Accounting and Finance` — existing
    `source_verification.verified_against_pdf: true`.
  - Agriculture `Environmental Management and Technology` — preserved
    source-confirmed context from checkpoint 003.
  - Engineering `Meteorology` — preserved source-confirmed context from
    checkpoint 003.
  - Engineering `Hotel Management and Tourism` — preserved source-confirmed
    context from checkpoint 003.
- **Explicit evidence holds:** 0.
- **Pending/unreviewed occurrences:** 121.

The four verified/source-confirmed records are preserved. The next bounded
increment will add a precise official URL, locator, and access date only when
the extracted brochure row has an unambiguous title and awarding-institution
cell. Otherwise it will add an explicit evidence hold without changing the
parsed institution array or any unrelated context.

## Write boundary

Allowed edits remain limited to the three occurrence files above plus
lane-A checkpoint and focused-test artifacts. CCMAS, mappings, scopes, seeds,
SQL, taxonomy, roles, and UI files remain out of scope.

No new source occurrence edits have been made in this checkpoint.

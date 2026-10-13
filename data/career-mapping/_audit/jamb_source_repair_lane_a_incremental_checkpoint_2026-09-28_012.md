# Repair lane A — JAMB source/offering context incremental checkpoint 012

**Date:** 2026-09-28 (Africa/Lagos)  
**Status:** Engineering occurrences 11–20 reviewed; bounded increment saved  
**Lane:** JAMB source/offering contexts only

## Completed increment

Continued from checkpoint 011 at Engineering occurrence 11. Reviewed only
occurrences **11–20** against the official
[IBASS Engineering/Environmental/Technology brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-engineering.pdf).

- **2 source-confirmed occurrences:**
  - `Food Science and Engineering` — the standalone printed title cell lists
    **LAUTECH** (p. 411).
  - `Food Technology` — the standalone printed title cell lists **BELLS** and
    **IBADAN** (pp. 411–412).
- **8 evidence holds:** `Architecture`, `Quantity Surveying`, `Statistics`,
  `Economics`, `Geography`, `Urban and Regional Planning`, `Industrial Design`,
  and `Estate Management`.

For the two confirmed rows, the previous institution arrays mixed adjacent
titles and heading fragments. Those arrays were narrowed to the exact
awarders shown beneath the matching printed titles. The eight held arrays were
left unchanged: the source layout/extracted table interleaves continuation
rows or distinct adjacent offerings, and exact awarder membership was not
established in this bounded pass. Each of the ten records now includes its
official source URL, printed-page/table locator, access date (`2026-09-28`),
and a row-specific decision note.

## Lane-A counts

Across Administration, Agriculture and Engineering (125 total occurrences),
counting `source_context_status` directly in the three offering ledgers:

- Verified/source-confirmed: **50**
- Explicit evidence holds: **39**
- Pending/unreviewed: **36**

Relative to checkpoint 011, this increment adds **2 confirmed** and **8 held**
occurrences. No other occurrence was changed.

## Stop boundary and validation

This increment ends at Engineering occurrence **20 (`Estate Management`)**.
The next exact boundary is Engineering occurrences **21–30**, beginning with
`Software Engineering` (source line 6443). Earlier Engineering occurrences
1–10 and all Administration/Agriculture records were not re-reviewed.

The bounded files are `jamb/engineering_offerings.json`, this checkpoint,
and `test_jamb_source_repair_lane_a_engineering_011_020.py`. The focused test
passed. CCMAS joins/scopes, downstream taxonomy, seeds, SQL and UI remain out
of scope.

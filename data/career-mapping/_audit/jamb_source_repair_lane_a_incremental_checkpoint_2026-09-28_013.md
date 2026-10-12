# Repair lane A — JAMB source/offering context incremental checkpoint 013

**Date:** 2026-09-28 (Africa/Lagos)  
**Status:** Engineering occurrences 21–30 reviewed; bounded increment saved  
**Lane:** JAMB source/offering contexts only

## Completed increment

Continued from checkpoint 012 at Engineering occurrence 21. Checked only
occurrences **21–30** against the official
[IBASS Engineering/Environmental/Technology brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-engineering.pdf)
and the corresponding extracted awarder cells. All ten now retain a source URL,
printed-page locator, access date (`2026-09-28`), and a row-specific decision
note.

- **8 newly source-confirmed:** `Software Engineering`, `Home Economics and
  Food Management`, `Electrical Engineering`, `Mechanical Engineering`,
  `Chemical Engineering`, `Biomedical Engineering`, `Agricultural Engineering`,
  and `Agricultural and Bio-Resources Engineering`.
- **2 previously source-confirmed, rechecked without institution changes:**
  `Meteorology` and `Hotel Management and Tourism`.
- **Institution-list corrections:** `Software Engineering` was narrowed to its
  14 exact awarders; `HIGHWAY ENGINEERING` and `FUT-DAURA` belong to the next
  separately headed programme. `Home Economics and Food Management` was
  narrowed to `WESLEYUNI`; fragments and awarders from adjacent e-learning
  engineering rows were removed.
- **Distinct contexts retained:** standalone `Meteorology` remains FUTA,
  UMYUK and MINNA; MARITIME-UNI is listed under the distinct title `Meteorology
  and Climate Change`. The p. 339 detailed title `Agricultural and Bioresources
  Engineering` is tied to the hyphenated programme-index identity on p. 336,
  without merging the separate Agricultural Engineering variants.
- The mechanical-engineering extracted awarder cell spells one institution
  `FED=DUTSINMA`; that source spelling is retained rather than silently changed
  to a different label.

## Lane-A counts

Across Administration, Agriculture and Engineering (**125 total occurrences**),
counting `source_context_status` directly in the three offering ledgers:

- Verified/source-confirmed: **58**
- Explicit evidence holds: **39**
- Pending/unreviewed: **28**

Relative to checkpoint 012, this increment adds **8 newly confirmed**
occurrences; two already-confirmed rows were rechecked. No evidence holds were
promoted without exact title-cell support.

## Stop boundary and validation

This increment ends at Engineering occurrence **30 (`Agricultural and
Bio-Resources Engineering`)**. The next exact boundary is Engineering
occurrence **31 (`Production Engineering`)**. Earlier occurrences 1–20 and
records after occurrence 30 were not changed in this increment.

The bounded files are `jamb/engineering_offerings.json`, this checkpoint, and
`test_jamb_source_repair_lane_a_engineering_021_030.py`. JSON parsing and the
focused test passed. CCMAS joins/scopes, downstream taxonomy, seeds, SQL and UI
remain out of scope.

# Repair lane A — JAMB source/offering context incremental checkpoint 010

**Date:** 2026-09-28 (Africa/Lagos)  
**Status:** Agriculture occurrences 11–20 reviewed; bounded increment saved  
**Lane:** JAMB source/offering contexts only

## Completed increment

Continued from checkpoint 009 without repeating Administration occurrences
1–40 or Agriculture occurrences 1–10. Reviewed only Agriculture occurrences
**11–20** against the official [IBASS Agriculture brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf).

- **8 verified occurrences:** `Soil Science`, `Family, Nutrition and Consumer
  Sciences`, `Food Science with Business`, `Forestry, Wildlife & Fisheries`,
  `Home Economics`, `Hotel Management & Tourism`, `Home Science, Nutrition and
  Dietetics`, and `Home Science & Management`.
- **2 explicit evidence holds:** `Forestry and Fisheries`, whose parsed array
  combines multiple Forestry-family cells and heading fragments, and `Plant
  Breeding and Seed Technology`, because the detail table instead pairs
  MAKURDI with `Plant Breeding and Seed Science`.

Each reviewed occurrence now carries its item-specific official URL, printed
page/table locator, access date (`2026-09-28`) and support note. Eight
institution arrays were narrowly corrected to the exact printed cells after
the source established the mismatch. The two held arrays and programme titles
were left unchanged. No institution registry or other arrays were edited.

## Lane-A counts

Across Administration, Agriculture and Engineering (125 total occurrences),
counting `source_context_status` directly in the three JSON files:

- Verified/source-confirmed: **46**
- Explicit evidence holds: **16**
- Pending/unreviewed: **63**

This increment adds eight verified statuses and two holds relative to
checkpoint 009.

## Stop boundary

This increment stops after Agriculture occurrences **11–20**. Agriculture
occurrences 21 onward and all remaining Engineering occurrences were not
reviewed or changed. Administration rows 1–40 and Agriculture rows 1–10 were
not repeated.

## Write boundary and focused validation

The bounded edits are limited to Agriculture source-context metadata and
directly supported institution-cell corrections for occurrences 11–20, this
checkpoint, and the focused test
`test_jamb_source_repair_lane_a_agriculture_011_020.py`. The focused test
passed with `python -m pytest` (1 passed). CCMAS joins/scopes, downstream
taxonomy, seeds, SQL and UI remain out of scope.

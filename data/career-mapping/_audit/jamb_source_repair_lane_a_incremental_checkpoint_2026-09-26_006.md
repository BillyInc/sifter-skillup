# Repair lane A — JAMB source/offering context incremental checkpoint 006

**Date:** 2026-09-26 (Africa/Lagos)  
**Status:** Administration rows 1–20 completed; bounded lane stopped as requested  
**Lane:** JAMB source/offering contexts only

## Completed bounded range

Reviewed only Administration occurrences **1–20** against the local extracted
windows from the official IBASS Administration brochure:

`https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf`

Within rows 1–20:

- **18 verified** with the official URL, access date `2026-09-26`, and a
  precise `Administration.txt` locator.
- **2 explicit evidence holds:**
  - `Hotel and Tourism Management`: the parsed array crosses the exact
    `HOTEL AND TOURISM MANAGEMENT` cell into later related tourism headings.
  - `Secretarial Administration`: the parsed array crosses the exact
    `SECRETARIAL ADMINISTRATION` cell into the adjacent `OFFICE AND
    INFORMATION MANAGEMENT` heading.

No institution arrays were rewritten in this increment. Existing source fixes
and contexts remain preserved.

## Current lane-A counts

Across the three requested occurrence files:

- Total occurrences: **125**
- Verified/source-confirmed: **22**
- Explicit evidence holds: **2**
- Pending/unreviewed: **101**

The verified total includes the four pre-existing confirmed records outside
Administration rows 1–20: Administration `Accounting and Finance`, Agriculture
`Environmental Management and Technology`, and Engineering `Meteorology` and
`Hotel Management and Tourism`.

## Stop boundary and next range

This checkpoint intentionally stops before Administration rows 21–60 and
before any further Agriculture or Engineering review. The next bounded range,
if resumed, is Administration occurrences **21–30**. No source windows beyond
the completed rows 1–20 were inspected in this increment.

## Write boundary

Edits remain limited to the three requested offering JSON files plus lane-A
checkpoint and focused-test artifacts. CCMAS, mappings, scopes, seeds, SQL,
taxonomy, roles, and UI files remain out of scope.

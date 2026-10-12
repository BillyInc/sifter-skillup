# Repair lane A — JAMB source/offering context incremental checkpoint 026

**Date:** 2026-09-28 (Africa/Lagos)  
**Status:** resolved three Agriculture occurrence cells from the official detail table  
**Lane:** JAMB source/offering contexts only

## Completed increment

Continued from checkpoint 025 and checked three Agriculture occurrences in the
official [IBASS Agriculture brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf):

- **8, Animal Breeding and Genetics:** exact detailed heading and awarder
  `ANIMAL BREEDING AND GENETICS — FUNAAB`, `Agriculture.txt:2027-2033`,
  printed p. 114. The polluted institution list was corrected to FUNAAB only;
  adjacent `ANIMAL SCIENCE AND FISHERIES — ABSU, IMSU` is distinct.
- **21, Pasture & Range Management:** `PASTURE AND RANGE MANAGEMENT — FUNAAB`,
  `Agriculture.txt:1823-1825`, printed p. 110. Existing institution list
  matches exactly.
- **22, Livestock Production Technology:** `LIVESTOCK PRODUCTION TECHNOLOGY —
  NDU`, `Agriculture.txt:1818-1821`, printed p. 110. Existing institution
  list matches exactly.

Each row now records its source URL, locator, access date (`2026-09-28`),
disposition/reason, source offering context and this checkpoint. Requirements
and waivers were not changed.

## Lane-A count and remaining work

Across Administration (60), Agriculture (28), and Engineering (37), current
totals are **125: 95 source-text confirmed, 30 evidence-held, 0
pending/unreviewed**. Continue only with held offering contexts and do not
repeat confirmed rows. Evidence-held means the exact JAMB title-awarder
association is not safely established; it does not mean no related source
entry exists.

This does not close the broader 420-identity JAMB source audit, the queued
CCMAS package audit, or downstream mapping work.

## Validation and changed files

Focused check:

```powershell
python -m pytest data/career-mapping/_audit/test_jamb_source_repair_lane_a_agriculture_holds_008_021_022.py -q
```

Changed only the three JAMB source-offering records, the focused test, and
this append-only checkpoint. No CCMAS, downstream/domain data, seed, or SQL
was touched.

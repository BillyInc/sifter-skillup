# Repair lane A — JAMB source/offering context incremental checkpoint 023

**Date:** 2026-09-28 (Africa/Lagos)  
**Status:** evidence hold clarified for Agriculture occurrence 25  
**Lane:** JAMB source/offering contexts only

## Completed increment

Checked the held Agriculture identity **25, `Plant Science`**, against the
official [IBASS Agriculture brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf).
The programme index at printed p. 75 (`Agriculture.txt:28`) includes the
standalone title `Plant Science`. The inspected detail-table cells on printed
p. 115 (`Agriculture.txt:2359-2377`) instead identify:

- `PLANT SCIENCE AND BIOTECHNOLOGY` — ABSU, RSU;
- `PLANT SCIENCE AND CROP PRODUCTION` — JABU.

Neither detailed title is an exact match for the standalone index identity.
Accordingly, the existing ABSU/RSU array is not promoted as a confirmed
standalone title-awarder association. Both compound cells are recorded as
separate source contexts with identity equivalence explicitly
`not_established`; source URL, locators, access date (`2026-09-28`), hold
disposition/reason, and issue ID
`LANE-A-AGR-025-PLANT-SCIENCE-TITLE-CELL` are attached. No JAMB name or
institution value was changed.

## Lane-A count and remaining work

The status remains **125 total: 90 source-text confirmed, 35 evidence-held, 0
pending/unreviewed**. This increment documents source evidence for one held
identity without changing its status. Continue the remaining Agriculture and
Engineering holds only.

## Validation and changed files

```powershell
python -m pytest data/career-mapping/_audit/test_jamb_source_repair_lane_a_agriculture_hold_025.py -q
```

Changed only source-evidence metadata for this held JAMB offering, its focused
test, and this append-only checkpoint. No CCMAS, downstream/domain, seed, or
SQL source files were edited.

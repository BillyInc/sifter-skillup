# Repair lane A — JAMB source/offering context incremental checkpoint 025

**Date:** 2026-09-28 (Africa/Lagos)  
**Status:** resolved Agriculture occurrence 27 from its exact title-awarder cell  
**Lane:** JAMB source/offering contexts only

## Completed increment

Continued from checkpoint 024 and checked Agriculture occurrence **27,
`Eco-Tourism and Wildlife Management`**, against the official
[IBASS Agriculture brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf).
The detailed table prints **ECOTOURISM & WILDLIFE MANAGEMENT** followed by
**FUTA, IBADAN, and LAUTECH** as its awarding institutions
(`Agriculture.txt:3969-3974`, printed p. 153). This exact provider list matches
the existing row. The row now records the exact source context, official URL,
locator, access date (`2026-09-28`), confirmed disposition/reason, and this
checkpoint. No institution, requirement, or waiver values needed changing.

## Lane-A count and remaining work

Across Administration (60), Agriculture (28), and Engineering (37), current
totals are **125: 92 source-text confirmed, 33 evidence-held, 0
pending/unreviewed**. Continue only with held offering contexts; do not revisit
confirmed rows. Evidence-held means the exact JAMB title-awarder association
is still not safely established, not that the brochure has no related entry.

This does not close the broader 420-identity JAMB source audit, the queued
CCMAS package audit, or any downstream mapping work.

## Validation and changed files

Focused check:

```powershell
python -m pytest data/career-mapping/_audit/test_jamb_source_repair_lane_a_agriculture_hold_027.py -q
```

Changed only this JAMB source-offering row's provenance/status, its focused
test, and this append-only checkpoint. No CCMAS, downstream/domain data, seed,
or SQL was touched.

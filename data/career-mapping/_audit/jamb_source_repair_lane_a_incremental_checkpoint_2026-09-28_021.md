# Repair lane A — JAMB source/offering context incremental checkpoint 021

**Date:** 2026-09-28 (Africa/Lagos)  
**Status:** resolved Agriculture occurrence 3 from its exact title-awarder cell  
**Lane:** JAMB source/offering contexts only

## Completed increment

Continued the held-offering audit with Agriculture occurrence **3,
`Horticulture`**. The official [IBASS Agriculture brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf)
lists the exact `HORTICULTURE` cell as **FUNAAB** and **MINNA**. The checked-in
source extraction locates it at `Agriculture.txt:3817-3819`, printed p. 149;
the official IBASS indexed text returns the same heading and providers.

The prior parsed institution list contained COOU, FED-OYEEKITI, LAUTECH,
MAKURDI, `CROP AND ENVIRONMENTAL PROTECTION`, and `PLANT BREEDING &` spill
text. Those do not belong to the exact Horticulture cell. The row now records
only FUNAAB and MINNA, with exact source context, official URL/locator, access
date (`2026-09-28`), confirmed disposition/reason, and this checkpoint.
Requirements and institution waiver text were not edited.

## Reconciled Lane-A count and next action

Across the Administration (60), Agriculture (28), and Engineering (37)
occurrence ledgers, totals are now **125: 90 source-text confirmed, 35
evidence-held, 0 pending/unreviewed**. Resolved exact-cell holds in this
sequence are Administration 9, 16, 23, 50 and Agriculture 3. Administration
occurrences 28 and 31 retain documented exact source contexts but remain held
for canonical identity/grouping adjudication; that is not an unresolved
title-awarder extraction. Continue with the remaining Agriculture and
Engineering held contexts, without revisiting confirmed rows.

This is not completion of the 420-identity JAMB source audit, the 237-package
CCMAS audit, or downstream mapping.

## Validation and changed files

Focused checks:

```powershell
python -m pytest `
  data/career-mapping/_audit/test_jamb_source_repair_lane_a_agriculture_001_010.py `
  data/career-mapping/_audit/test_jamb_source_repair_lane_a_administration_041_050.py `
  data/career-mapping/_audit/test_jamb_source_repair_lane_a_administration_051_060.py `
  data/career-mapping/_audit/test_jamb_source_repair_lane_a_administration_hold_050.py -q
```

Changed only `data/career-mapping/jamb/agriculture_offerings.json`, the
focused Agriculture test, current-count assertions in Lane-A tests, and this
checkpoint. No CCMAS, downstream/domain data, seed, or SQL artifacts were
touched.

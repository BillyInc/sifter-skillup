# Repair lane A — JAMB source/offering context incremental checkpoint 024

**Date:** 2026-09-28 (Africa/Lagos)  
**Status:** resolved Agriculture occurrence 6 from its exact title-awarder cell  
**Lane:** JAMB source/offering contexts only

## Completed increment

Continued from checkpoint 023 and resolved Agriculture occurrence **6,
`Animal Production`**. The exact `ANIMAL PRODUCTION` source heading and its
institution list are present in the official [IBASS Agriculture brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf),
`Agriculture.txt:1768-1783`, printed p. 109. Its awarders are **ADSU, BAUCHI,
DELSUT, DOU, LASUSTECH, MINNA, and UM UDIKE**.

The earlier parsed array had merged neighboring headings/fragments from
`ANIMAL PRODUCTION AND HEALTH`, `ANIMAL PRODUCTION AND HUSBANDRY`, `ANIMAL
PRODUCTION AND FISHERIES`, and `LIVESTOCK PRODUCTION TECHNOLOGY`. Those exact
title contexts are not folded into `Animal Production`. The awarder array was
corrected to the seven names above; source URL, locator, access date
(`2026-09-28`), disposition/reason, and source-context record are attached.
Requirements and waivers were left unchanged.

## Lane-A count and remaining work

Across Administration (60), Agriculture (28), and Engineering (37), current
totals are **125: 91 source-text confirmed, 34 evidence-held, 0
pending/unreviewed**. Continue only with held offering contexts. This does not
close the broader 420-identity JAMB audit, CCMAS package audit, or any
downstream mapping work.

## Validation and changed files

Focused check:

```powershell
python -m pytest data/career-mapping/_audit/test_jamb_source_repair_lane_a_agriculture_hold_006.py -q
```

Changed only this JAMB row's source-offering evidence/provider list, the
focused test, current aggregate-count assertions in Lane-A tests, and this
checkpoint. No CCMAS source, downstream/domain data, seed, or SQL was touched.

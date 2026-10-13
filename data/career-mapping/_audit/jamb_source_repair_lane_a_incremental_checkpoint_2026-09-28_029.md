# Repair lane A — JAMB source/offering context incremental checkpoint 029

**Date:** 2026-09-28 (Africa/Lagos)  
**Status:** resolved Engineering occurrences 6 and 7 from distinct exact source cells  
**Lane:** JAMB source/offering contexts only

## Completed increment

Continued from checkpoint 028 and checked the official
[IBASS Engineering/Environmental/Technology brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-engineering.pdf):

- **6, Petroleum and Gas Engineering:** the exact title has 12 awarders,
  continued across printed pp. 375–376 (`engineering.txt:1929-1955`): BAZE,
  CUST, DELSUT, LAGOS, FED-OTUOKE, FUTIA, OAUSTECH, MAIDUGURI, MARITIME-UNI,
  NILE, PHC, and TOPFAITH. `Petroleum Engineering` is a separate preceding
  title. The erroneous `ENGINEERING` fragment was removed.
- **7, Gas Engineering:** the exact cell is `GAS ENGINEERING — OAUSTECH`
  (`engineering.txt:1957-1958`, printed p. 376). The immediately following
  `NATURAL GAS ENGINEERING — FUPRE, PHC, DELSUT` is a separate title and was
  not included in the Gas Engineering institution list.

Both rows now carry exact source contexts, official URL/locators, access date
(`2026-09-28`), disposition/reason, and this checkpoint. Requirement and
waiver fields were not changed.

## Lane-A count and remaining work

Across Administration (60), Agriculture (28), and Engineering (37), current
totals are **125: 99 source-text confirmed, 26 evidence-held, 0
pending/unreviewed**. Continue only with held offering contexts; do not repeat
confirmed rows. The JAMB source record establishes awarder/title association,
not a university-specific curriculum.

The user clarified that missing institution-specific syllabi or their
additional 30% component must not block use of the national NUC CCMAS baseline.
That distinction applies to the queued CCMAS curriculum audit and does not
reduce the current duty to verify exact JAMB awarder contexts.

## Validation and changed files

```powershell
python -m pytest data/career-mapping/_audit/test_jamb_source_repair_lane_a_engineering_holds_006_007.py -q
```

Only JAMB offering-source data, focused tests, aggregate Lane-A counters, and
this append-only checkpoint were changed. No CCMAS, downstream/domain data,
seed, or SQL was touched.

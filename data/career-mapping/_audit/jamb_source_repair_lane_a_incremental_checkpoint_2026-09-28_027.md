# Repair lane A — JAMB source/offering context incremental checkpoint 027

**Date:** 2026-09-28 (Africa/Lagos)  
**Status:** resolved Agriculture occurrences 7 and 10 from exact title-awarder cells  
**Lane:** JAMB source/offering contexts only

## Completed increment

Continued from checkpoint 026 and reconciled two Agriculture cells against the
official [IBASS Agriculture brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf):

- **7, Animal Science:** the exact row continues across printed pp. 112–113
  (`Agriculture.txt:1938-2002`). Its 23 awarders are AAU, BENIN, BOUEDST,
  CALABAR, COOU, DELSU, FUA-ZURU, IBADAN, JABU, MAIDUGURI, MAKURDI, NASARAWA,
  OAU, PHC, RSU, UNN, AKSU, EBSU, TSUJ, UDA, UNIOSUN, UNIZIK, and UYO. The
  prior parsed array omitted the continuation after RSU; it now includes all
  source-listed awarders. `Animal Science and Fisheries Management` (ESUTECH)
  and `Animal Science and Technology` (FUTO) are separate source titles.
- **10, Crop Science:** the exact row at printed p. 117
  (`Agriculture.txt:2214-2221`) lists DELSUT, FUA-ZURU, JABU, RSU, UDA, and
  UNN. The old array contained fragments and providers belonging to separate
  neighboring rows (`Crop Science/Soil Science`, `Crop Science and
  Horticulture`); these were removed from this exact offering.

Both rows now carry the official URL, exact locators, access date
(`2026-09-28`), disposition/reason, source contexts, and this checkpoint.
Requirements and waivers were not altered.

## Lane-A count and remaining work

Across Administration (60), Agriculture (28), and Engineering (37), current
totals are **125: 97 source-text confirmed, 28 evidence-held, 0
pending/unreviewed**. Continue only with held offering contexts; do not repeat
confirmed rows. Remaining evidence holds include unresolved source title/cell
associations and canonical identity cases; each should remain held unless an
exact authoritative awarder cell resolves it.

This does not close the broader 420-identity JAMB audit or downstream mapping.

## Queued CCMAS lane rule — user clarification

For the queued NUC CCMAS package audit, national CCMAS is the adequate baseline
for the national curriculum scope. Do not hold a JAMB–CCMAS curriculum link
solely because a university-specific syllabus or the institution's additional
30% implementation component is unavailable. Record national CCMAS evidence
separately from institution-specific implementation. Consult authoritative
external curriculum sources only where CCMAS is absent or genuinely
insufficient, and explicitly identify any audit rows for which the missing
30%-specific evidence was the sole prior caveat.

This does not narrow or pause Lane A: continue extracting and validating every
brochure's exact JAMB programme title, faculty/source context, institution-
awarder association, and distinct offering occurrence whether or not a
university-specific syllabus exists. Preserve separate same-name offering
contexts. JAMB offering evidence establishes that offering/title-awarder
association only; it does not prove the university's detailed curriculum.
These are lane instructions only; no CCMAS curriculum or downstream files
were edited in this checkpoint.

## Validation and changed files

Focused checks:

```powershell
python -m pytest data/career-mapping/_audit/test_jamb_source_repair_lane_a_agriculture_001_010.py -q
python -m pytest data/career-mapping/_audit/test_jamb_source_repair_lane_a_agriculture_holds_008_021_022.py -q
```

Changed only the JAMB Agriculture source-offering rows, focused tests, aggregate
Lane-A count assertions, and this append-only checkpoint. No CCMAS source,
downstream/domain data, seed, or SQL was touched.

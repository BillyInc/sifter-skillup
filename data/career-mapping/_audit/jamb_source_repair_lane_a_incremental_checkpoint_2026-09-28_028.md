# Repair lane A — JAMB source/offering context incremental checkpoint 028

**Date:** 2026-09-28 (Africa/Lagos)  
**Status:** exact Admin source cells confirmed; two combined-identity records remain held  
**Lane:** JAMB source/offering contexts only

## Completed increment

Continued from checkpoint 027. Rechecked the held Administration occurrences
against the official
[IBASS Administration brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf):

- **28, Public Relations and Advertising:** the brochure contains three
  distinct title-awarder cells on printed p. 92: `PUBLIC RELATIONS AND
  ADVERTISING — IGBINEDION`, `PUBLIC RELATION — ABUJA, IMSU, BSU`, and
  `ADVERTISING — ABUJA, IMSU, BSU` (`Administration.txt:2392-2404`). All three
  contexts are preserved. Their canonical equivalence is not established, so
  this aggregate record remains evidence-held.
- **31, Office and Information Technology / Information Resource Management:**
  the brochure contains two distinct cells on printed p. 87: `OFFICE AND
  INFORMATION TECHNOLOGY — LASUSTECH` and `INFORMATION RESOURCE MANAGEMENT —
  BABCOCK, LCITY` (`Administration.txt:2145-2157`). Both are preserved
  separately; the slash-combined identity remains held pending canonical
  identity evidence.

For both rows, exact JAMB brochure offering evidence is recorded with URL,
locator, access date (`2026-09-28`), disposition/reason and this checkpoint.
The hold concerns whether distinct source titles can be represented as one
canonical JAMB identity—not whether the source cells were checked or whether
a university-specific curriculum is available.

## Lane-A count and next action

Totals remain **125: 97 source-text confirmed, 28 evidence-held, 0
pending/unreviewed**. These two Admin rows remain held, but source-cell
extraction is complete. Continue with remaining Agriculture and Engineering
source cells; do not revisit confirmed offerings.

JAMB source auditing continues independently of university-specific
curriculum availability. Preserve distinct same-name offering contexts. An
exact JAMB title-awarder record proves that offering association only; it is
not evidence of that institution's detailed curriculum.

## Queued CCMAS lane rule — user clarification

For the queued NUC CCMAS package audit, national CCMAS is the adequate baseline
for the national curriculum scope. Do not hold a JAMB–CCMAS curriculum link
solely because a university-specific syllabus or the institution's additional
30% implementation component is unavailable. Record national CCMAS evidence
separately from institution-specific implementation. Consult authoritative
external curriculum sources only where CCMAS is absent or genuinely
insufficient, and explicitly identify any audit rows for which the missing
30%-specific evidence was the sole prior caveat.

This checkpoint contains lane instructions only; it edits no CCMAS curriculum
or downstream files.

## Validation

```powershell
python -m pytest data/career-mapping/_audit/test_jamb_source_repair_lane_a_administration_holds_028_031.py -q
```

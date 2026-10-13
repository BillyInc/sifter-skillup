# Repair lane A — JAMB source/offering context incremental checkpoint 022

**Date:** 2026-09-28 (Africa/Lagos)  
**Status:** documented unresolved title/awarder mismatch for Agriculture occurrence 16  
**Lane:** JAMB source/offering contexts only

## Completed increment

Checked Agriculture occurrence **16, `Plant Breeding and Seed Technology`**
against the official [IBASS Agriculture brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf).
The official programme index lists **Plant Breeding and Seed Technology** at
item 54 on printed p. 75 (`Agriculture.txt:26`). The detail table at printed
p. 143 (`Agriculture.txt:3491-3493`) instead shows the exact title-awarder
cell **PLANT BREEDING AND SEED SCIENCE — MAKURDI**.

The title difference is material. The source evidence does not establish that
the index title and detail-table title are equivalent or that MAKURDI is an
awarder of the JAMB identity `Plant Breeding and Seed Technology`. Therefore
this is an evidence hold, not a promoted provider correction. The existing
institution array is retained unchanged; the distinct detail-table source
context, official URL, both locators, access date (`2026-09-28`), disposition,
reason, and checkpoint are now explicit on the row.

## Lane-A count and remaining work

Counts remain **125 total: 90 source-text confirmed, 35 evidence-held, 0
pending/unreviewed**. This increment clarified the evidence and disposition of
one held context without changing its status. Continue the other Agriculture
and Engineering holds; do not revisit confirmed rows.

## Validation and changed files

Focused regression:

```powershell
python -m pytest data/career-mapping/_audit/test_jamb_source_repair_lane_a_agriculture_hold_016.py -q
```

Changed only the JAMB offering-evidence metadata for this held row, its test,
and this checkpoint. No CCMAS source, downstream/domain data, seed, or SQL
artifacts were edited.

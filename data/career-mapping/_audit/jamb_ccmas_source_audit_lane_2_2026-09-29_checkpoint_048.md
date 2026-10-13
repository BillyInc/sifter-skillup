# Lane 2 checkpoint 048 — JAMB offering cells, rows 201–210

Date: 2026-09-29  
Scope: canonical JAMB identity rows 201–210, Sciences brochure offering cells only.  
Primary source: [official JAMB IBASS Sciences degree brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf), accessed 2026-09-29; checked-in extraction `data/career-mapping/_jamb_txt/Sciences.txt`.

## Coverage reconciliation

Before searching, I imported Slice 007's exact-cell references. Rows 201–204 were already verified in A07/021 at printed p. 493 and were reused; the stale `offering_row_verified=false` values in the occurrence inventory are not grounds to repeat the source search. Only rows 205–210 were searched.

## New source decisions

| Row | Exact brochure context | Result |
|---:|---|---|
| 205 | `Sciences.txt:2141–2144`: the table spells **INDUSTRAL MATHEMATICS/COMPUTER** (the final word is broken across lines) and lists **EBSU**. The official indexed table begins this title after the four p. 493 cells already covered in A07/021. | Exact title spelling and awarder are source-confirmed. The misspelling `INDUSTRAL` is in the source; preserve it in this audit. |
| 206 | Exact **Industrial Chemistry and Chemical Entrepreneurship — CCU** cell not established by the official source searches. Separate Industrial Chemistry wording does not verify it. | Unresolved. |
| 207 | Exact **Industrial and Environmental Chemistry — FOUNTAIN** cell not established; the p. 452 catalogue title is only a lead. | Unresolved. |
| 208 | Printed p. 518, `Sciences.txt:3025–3033`: **Brewing Science and Technology — UNI-ILESA**. | Exact match. Food Science & Nutrition and Industrial Chemistry below it are separate offerings. |
| 209 | `Sciences.txt:3729–3731`: **Geological Sciences — UNIZIK**. | Exact match; CRAWFORD belongs to the following Geology and Mineral Sciences cell. The printed page marker's placement is ambiguous in this extraction, so only the exact line locator is asserted. |
| 210 | `Sciences.txt:3731–3733`: **Geology and Mineral Sciences — CRAWFORD**. | Exact match; distinct from Geological Sciences — UNIZIK and Geology and Geophysics — AEFUNA. The printed page marker's placement is ambiguous, so only the exact line locator is asserted. |

## Result and cursor

Rows 201–210 now have exact-cell coverage reconciled: four prior cells reused and six new source checks. Four new cells match the parsed awarder (205, 208–210); rows 206–207 remain unresolved. No shared offering ledger was edited, and no downstream domain audit was performed.

Next cursor: rows 211–220. Search only offering cells that remain uncovered or contradictory.

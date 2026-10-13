# Lane 2 checkpoint 044 — JAMB offering cells, rows 161–170

Date: 2026-09-29  
Scope: canonical JAMB identity rows 161–170, Sciences brochure offering occurrences only.  
Primary source: [official JAMB IBASS Sciences degree brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf), accessed 2026-09-29; checked-in extraction `data/career-mapping/_jamb_txt/Sciences.txt`.

## Coverage reconciliation

Before searching, I compared the deterministic report with the row-by-row dispositions in `jamb_ccmas_final_verification_rows_141_280_2026-09-26_001.md`, Slice 003. That slice already source-adjudicates exact offering cells for rows 162, 163, 164, 166 and 169. Those checks were reused and not repeated. CCMAS course-level work in other lane-2 checkpoints was not counted as JAMB cell coverage.

The uncovered or incomplete JAMB cells in this ten-row slice were 161, 165, 167, 168 and 170. Their exact title, faculty, awarder list and adjacent heading boundaries were checked against the official Sciences brochure extraction. Official-domain indexed PDF search corroborated the printed-table contexts for the plant and molecular-biology entries; the PDF viewer itself returns a JavaScript gate.

## New source decisions

| Row | Exact brochure context | Result |
|---:|---|---|
| 161 | Printed p. 680, `Sciences.txt:10246–10257`: **Marine Biology — AKSU, LAGOS**. Adjacent cells are Marine Biology & Fisheries — WESLEYUNI; Fisheries and Aquaculture — CUAB, LAUTECH; Oceanography — AKSU. | Exact local title and both awarders match. Preserve all four neighbouring programme contexts separately. |
| 165 | Printed p. 496, `Sciences.txt:2026–2027`: **Applied Biochemistry — ESUTECH**. UNIZIK appears in the preceding Industrial Mathematics listing. | The parsed Applied Biochemistry roster also contains UNIZIK. That token is unsupported by this cell and is a confirmed roster defect queued for normal reconciliation. |
| 167 | `Sciences.txt:3788–3790`: **Applied Geology — BAUCHI, FUTA**, between Geology and Petroleum Studies — WESTERN-DEL and Geology and Mineral Science — KWASU. The printed page is not independently established from this extraction span. | Exact local title and both awarders match. |
| 168 | `Sciences.txt:4901–4904`: **Plant Biology and Biotechnology — BENIN, OSUMS**. Following cells are Plant Science and Forestry — EKSU, and Plant Science and Microbiology — WESTERN-DEL. The printed page is not independently established from this extraction span. | Exact local title and both awarders match. |
| 170 | `Sciences.txt:7387–7391`: **Molecular Biology — AEFUNA, FED-WUKARI**, followed by Microbiology and Industrial Biotechnology — CALEB. The printed page is not independently established from this extraction span. | Exact local title and both awarders match. |

The prior exact-cell evidence reused for rows 162–164, 166 and 169 is recorded in the JSON with its page locator and scope boundary. In particular, row 163's slash-title at p. 481 remains distinct from the Physics and Applied Physics and Industrial Physics offerings at p. 490; row 169 remains distinct from Zoology and Zoology and Aquaculture.

## Result and cursor

Five previously uncovered cells were adjudicated: four exact title/roster matches and one roster mismatch candidate (row 165, extra UNIZIK). Across rows 161–170, exact offering-cell coverage is now 10/10 when reused prior decisions are included. This does not close curriculum-scope review. No shared offering ledger was edited and no downstream domain audit was performed.

Next cursor: rows 171–180, after checking the saved exact source-checkpoint coverage against the current deterministic report. See the JSON for stable occurrence IDs, exact extraction locators and the full boundary notes.

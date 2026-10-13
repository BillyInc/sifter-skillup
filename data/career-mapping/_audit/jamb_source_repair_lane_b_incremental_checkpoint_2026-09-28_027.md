# JAMB offering-source verification — Lane B checkpoint 027 (Arts hold reconciliation)

Date: 2026-09-28  
Scope: reconcile the Arts rows flagged in checkpoints 019–026: rows 2, 5, 15, 16, 21, 28, 35, and 37–43. Audit-only. No offering JSON, institutions, aliases, mappings, or source data were edited.

Primary source: [official JAMB IBASS Arts/Humanities degree brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf), accessed 2026-09-28. Its browser text endpoint currently returns a JavaScript shell, so source body/title/cell boundaries were checked against the repository extraction `data/career-mapping/_jamb_txt/arts_hum.txt` and the official brochure’s indexed programme list. Printed page and extraction-line locators are listed below. The extraction is evidence from the official brochure, not independent evidence for the ledger arrays.

## Reconciled source findings

| Ledger row | Official index/body finding | Exact source-cell finding and ledger discrepancy | Disposition |
|---:|---|---|---|
| 2 | Index #5: `Arabic Language and Literature Studies`; body: `ARABIC LANGUAGE AND LITERATURE` | Printed pp. 135–136, `arts_hum.txt:137–299`. The exact body cell lists **IBADAN, PAAU, UNIOSUN**. Current array contains 19 mixed tokens, including institution names and neighboring programme/header text. | Source cell recovered; title/index variant and array require correction/adjudication. Hold unchanged. |
| 5 | Index #8: `Christian Religious Knowledge/Studies`; body: `CHRISTIAN RELIGIOUS STUDIES` | Printed pp. 139–140. The previously verified complete institution set matches the current 36-code array. The ledger label `Christian Religious` is a shortened title, not the body heading. | Source evidence is complete; record the title variant. No institution-list discrepancy found in this increment. |
| 15 | Index #28: `French and German/Russian`; body: `FRENCH WITH GERMAN/RUSSIAN` | Printed p. 177, `arts_hum.txt:2261–2263`. Exact awarder: **UNN**. The current array (`INTERNATIONAL`, `RELATIONS`, `BABCOCK`, `NOUN`) belongs to another nearby language/relations cell, not this one. | Exact cell recovered; ledger association is wrong and needs correction. Hold unchanged. |
| 16 | Index #42: `International Studies and Diplomacy`; body: `INTERNATIONAL STUDIES AND DIPLOMACY` | Printed pp. 197–198, `arts_hum.txt:3237–3241`. Exact awarders: **BENIN, BIU**. The local label is truncated (`International Studies and`) and its 70-plus entries combine multiple unrelated international-studies, history, diplomacy, and language cells. | Exact cell recovered; identity is resolvable from the official index, but the local label/array require correction. Hold unchanged. |
| 21 | Index #52: `Linguistics`; body has a distinct standalone `LINGUISTICS` course row | Printed pp. 215–216, `arts_hum.txt:4054–4160`. The standalone row is bounded before `LINGUISTICS AND COMMUNICATION STUDIES`; the current 90-plus array contains body-title fragments, language options, and institutions from adjacent language-combination rows. | Exact standalone cell boundary recovered; current array is contaminated and requires correction. Hold unchanged. |
| 28 | Index #70: `Religious Studies`; body: `RELIGIOUS STUDIES` | Printed pp. 237–239, `arts_hum.txt:5144–5495`. The cell continues across the page break and ends before `RELIGION AND HUMAN RELATIONS`; the current array contains adjacent title fragments and awarders from distinct religious-studies offerings. | Exact cell boundary recovered; current array is contaminated and requires correction. Hold unchanged. |
| 35 | Index #64: `Political Science and Conflict Resolution`; body: same complete title | Printed p. 252, `arts_hum.txt:5832–5843`. Exact awarder: **AL-HIKMAH**. The current array also assigns six standalone Political Science awarders and Psychology/header tokens to this combined programme. | Exact cell recovered; current title is truncated and institution list is wrong. Hold unchanged. |
| 37 | Index #16: `Drama/Dramatic Arts/Performing Arts/Theatres Arts`; body heading is line-wrapped `DRAMA/DRAMATIC/PERFORMING ARTS` | Printed pp. 147 onward, `arts_hum.txt:765–817` plus the continuation in the same body table. The full body awarder column is represented by the current 61-code array; unlike checkpoint 019’s earlier excerpt-only review, the checked-in official extraction exposes the full title and column continuation. | Source cell recovered; prior “union not corroborated” concern is answered by the complete extraction. No ledger edit made. |
| 38 | Index #24: `Fine Art/Fine and Applied Arts`; body: `FINE ARTS/FINE AND APPLIED ARTS` | Printed pp. 142–143, `arts_hum.txt:511–530` and continuation. Exact awarders: **BENIN, CALABAR, DELSU, AEFUNA, IAUED, KWASU, LASUED, TASUED, UNN**. The current 18-code array adds DOU, LAGOS, PHC, LASU, FED-LAFIA, LCITY, WIGWE, DELSUT, ABSU from other fine/visual/industrial arts cells. | Source cell recovered; title number and institution-array contamination need correction/adjudication. Hold unchanged. |
| 39 | Index #65: `Psychology and Human Development`; body heading: `PSYCHOLOGY` | Printed p. 254, `arts_hum.txt:5933–5937`. Exact body awarders: **COVENANT, EVANGEL, MKAR, PLASU**—the four current codes. This is a real Psychology body cell, not the separate `CREATIVE ARTS` cell cited by the stale metadata. The body/index title variant and faculty/occurrence identity still need explicit reconciliation. | The evidence mismatch is corrected in this audit record; retain `evidence_hold` until the indexed/body title context is adjudicated. Do not reuse Creative Arts evidence. |
| 40 | Index #32/body `HAUSA:` | Printed pp. 186–187. The exact 22-code list already matches the verified occurrence in the ledger. | Previously verified; no new discrepancy. |
| 41 | Index #40: `Igbo`; body: `IGBO` | Printed pp. 205–206, `arts_hum.txt:3620–3660`. Exact Igbo awarders: **ABSU, COOU, EBSU, AEFUNA, IBADAN, ILORIN, LAGOS, LASUED, NAUB, POL-ACAD**. `AFRICAN AND ASIAN STUDIES`/UNIZIK begins separately immediately afterward. The current 16-code array improperly adds UNIZIK, IMSU, PEACELAND-UNI, DOU, OAU, and UNN from other offerings. | Exact cell recovered; current array is contaminated and requires correction. Hold unchanged. |
| 42 | Index #59: `Modern Language and Translation`; body instead has `B.A. (Single and Combined Hons) in Modern Languages`, UNN, with French/German/Russian options | Printed pp. 247–248, `arts_hum.txt:5701–5710` and continuation. No exact body title `Modern Language and Translation` or body cell supporting the four-code local array was established. | Identity/list remains unresolved; keep held. Do not equate the index name to the UNN options by inference. |
| 43 | Index #30: `Geography and Environmental Studies`; the located body cell is titled `GEOGRAPHY` | Printed p. 253, exact Geography body cell previously located in checkpoint 019. It lists FED-KASHERE, FED-LAFIA, FED-LOKOJA, AEFUNA, but the source does not establish that this is the distinct indexed title `Geography and Environmental Studies`. | Title/occurrence identity remains unresolved; keep held and do not promote the four-code list to the indexed offering. |

## What remains unresolved

- **Source-cell evidence unresolved: 2 rows** — 42 (no exact body title/list for the indexed identity) and 43 (the located Geography body title does not establish the indexed Geography and Environmental Studies identity).
- **Identity/title adjudication still required: 5 rows** — 2, 5, 15, 16, and 39. The official source exposes both index and body wording, but this audit does not silently rewrite canonical identity or faculty context.
- **Ledger corrections still required, but source evidence is complete: 8 rows** — 2, 15, 16, 21, 28, 35, 38, and 41. Row 2 is also an identity case. These remain held because this increment is expressly audit-only. Row 5 has a shortened label but matching awarder set; row 37 and 40 have no newly found list discrepancy.

These are counts of distinct open conditions, not mutually exclusive row totals. No item is declared unavailable. No issue is omitted because of severity or priority. Domain, subgroup, role, and CCMAS mapping work remains deferred.

## Verification

The unique regression test `test_jamb_source_repair_lane_b_arts_027.py` verifies the row-by-row dispositions, preserved Psychology evidence hold, explicit open counts, audit-only boundary, and official source locator. Run together with Lane-B checkpoints 019–027:

```powershell
python -m pytest --basetemp .pytest-tmp-jamb-lane-b-027 `
  data/career-mapping/_audit/test_jamb_source_repair_lane_b_arts_019.py `
  data/career-mapping/_audit/test_jamb_source_repair_lane_b_arts_020.py `
  data/career-mapping/_audit/test_jamb_source_repair_lane_b_arts_021.py `
  data/career-mapping/_audit/test_jamb_source_repair_lane_b_arts_022.py `
  data/career-mapping/_audit/test_jamb_source_repair_lane_b_arts_023.py `
  data/career-mapping/_audit/test_jamb_source_repair_lane_b_arts_024.py `
  data/career-mapping/_audit/test_jamb_source_repair_lane_b_arts_025.py `
  data/career-mapping/_audit/test_jamb_source_repair_lane_b_arts_026.py `
  data/career-mapping/_audit/test_jamb_source_repair_lane_b_arts_027.py -q
```

Result for the 019–027 suite: **10 passed**.

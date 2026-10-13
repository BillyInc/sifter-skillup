# JAMB offering-source verification — Lane B checkpoint 023 (Arts social-offering separations)

Date: 2026-09-28  
Scope: resolve the Arts Political Science and Conflict / Sociology source-context holds from checkpoint 020. Audit/document only; no authoritative data files edited in this increment.

Primary source: [JAMB IBASS Arts/Humanities degree brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf), accessed 2026-09-28. Checked exact body headings, awarding-institution cells and adjacent titles in `data/career-mapping/_jamb_txt/arts_hum.txt`.

| Row | Exact body title | Complete awarder set | Locator / disposition |
|---:|---|---|---|
| 35 | POLITICAL SCIENCE AND CONFLICT RESOLUTION | AL-HIKMAH | `arts_hum.txt:5832–5843`, printed p. 252. The preceding standalone POLITICAL SCIENCE cell is a different set (EVANGEL, FED-KASHERE, FED-LOKOJA, FED-OTUOKE, FED-WUKARI, PLASU). The source title is complete, not the truncated ledger identity. The ledger's combined list must not attribute those six standard Political Science awarders to the combined offering. |
| 36 | SOCIOLOGY | COVENANT, EVANGEL, FED-KASHERE, PLASU, SALEM | `arts_hum.txt:5939–5945`, printed p. 254. The next `SOCIOLOGY AND ANTHROPOLOGY`/FED-OTUOKE and later `CRIMINOLOGY AND SECURITY STUDIES`/FED-DUTSE are separate programme cells. Keep this Arts-faculty occurrence separate from Social Sciences Sociology. |

## Counts

- This increment resolved **2** of the 12 held cells from checkpoint 022 using exact body title and complete awarder evidence.
- **10** held Arts 1–36 cells remain for exact source reconciliation (rows 15, 16, 17, 18, 19, 21, 25, 27, 28, 29), alongside row 2's fully observed but non-identical Arabic Language and Literature title variant.
- These are not unavailable claims. Do not move into another JAMB range until the remaining exact cells and the row-2 title identity are resolved or their item-specific source searches are complete and explicitly shown to be insufficient.

## Focused test

```powershell
python -m pytest --basetemp .pytest-tmp-jamb-lane-b-023 `
  data/career-mapping/_audit/test_jamb_source_repair_lane_b_arts_023.py -q
```

Result: `1 passed` (executed in the focused Lane-B Arts audit suite).

# JAMB offering-source verification — Lane B checkpoint 024 (Arts history/economics/music cells)

Date: 2026-09-28  
Scope: resolve four additional held Arts body cells (History, History and Strategic Studies, Economics, Music). Audit/document only; no authoritative ledger changes.

Official source: [JAMB IBASS Arts/Humanities degree brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf), accessed 2026-09-28. Exact table title, awarder list, and page continuations checked in `data/career-mapping/_jamb_txt/arts_hum.txt`.

| Row | Exact body title | Complete awarder set | Item-specific locator / separation |
|---:|---|---|---|
| 17 | HISTORY | ABU, ABUJA, ADSU, BAYERO, BENIN, BSU, COOU, FED-LAFIA, FED-DUTSINMA, FED-LOKOJA, AEFUNA, GSU, IBADAN, JABU, KASU, LAPAI, LEGACY, LAUTECH, MAIDUGURI, MAITAMA, NASARAWA, NDA, OAU, PHC, SAU, SOSU, UDU, UMYUK, UNIKINGS, UNIZIK, UNN, YSU | Printed pp. 189–190; `arts_hum.txt:2757–2807`. The standalone History cell ends before `HISTORY AND STRATEGIC STUDIES`/LAGOS and other separately titled History combinations. Normalize the extracted `FED- LAFIA` whitespace to the existing institution code; no new provider inferred. |
| 18 | HISTORY AND STRATEGIC STUDIES | LAGOS | Printed p. 190; `arts_hum.txt:2809–2812`. Separate from `HISTORY, STRATEGIC AND INTERNATIONAL STUDIES`/DOU and `MILITARY HISTORY`. |
| 19 | ECONOMICS | EVANGEL, FED-DUTSE, FED-KASHERE, FED-LOKOJA, FED-WUKARI, UMYUK | Printed pp. 203–204; `arts_hum.txt:3501–3512`. The separate `ECONOMICS AND DEVELOPMENT STUDIES`/FEDOTUOKE cell begins at lines 3518–3520 and must not be folded into Economics. Later Igbo cells are also separate. |
| 25 | MUSIC | AJAYI, BABCOCK, BENIN, BOUEDST, BOWEN, CALABAR, COOU, DELSU, AEFUNA, FED-LOKOJA, GOUU, IAUED, IBADAN, JOS, KASU-KABBA, LASU, LASUED, MC-IBRU, MOUNTAIN TOP, OAU, OOU, PHC, UDA, UNI-ILESA, UNIZIK, UNN, UYO | Printed pp. 222–223; `arts_hum.txt:4413–4453`, complete awarder column through the page break. Later text in that block is waiver prose, not further awarders. `ARTS` in the ledger is a table header, not an awarder. |

## Updated counts

- Additional exact body cells established: **4**.
- Remaining held Arts 1–36 cells requiring exact title/list reconciliation: **6** (rows 15, 16, 21, 27, 28, 29), plus row 2's title-variant identity hold.
- Arts contexts resolved across checkpoints 020–024 remain evidence-only; no student-facing or database status was changed here.

## Focused test

```powershell
python -m pytest --basetemp .pytest-tmp-jamb-lane-b-024 `
  data/career-mapping/_audit/test_jamb_source_repair_lane_b_arts_024.py -q
```

Result: `1 passed` (executed in the focused Lane-B Arts audit suite).

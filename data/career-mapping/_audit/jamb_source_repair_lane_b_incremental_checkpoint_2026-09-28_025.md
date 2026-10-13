# JAMB offering-source verification — Lane B checkpoint 025 (Arts Philosophy/Theology/language variant)

Date: 2026-09-28  
Scope: complete three more held Arts body-cell checks. Audit/document only; no authoritative offering data edited in this checkpoint.

Primary source: [JAMB IBASS Arts/Humanities degree brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf), accessed 2026-09-28. Exact title and awarding-institution cells checked in `data/career-mapping/_jamb_txt/arts_hum.txt`.

| Row | Exact source title | Complete awarder cell | Locator / disposition |
|---:|---|---|---|
| 15 | FRENCH WITH GERMAN/RUSSIAN | UNN | Printed p. 177; `arts_hum.txt:2261–2263`. The source uses “WITH”; canonical ledger title is “French and German/Russian”. Record as a title-variant source cell, not an exact-string match or a different inferred combined offering. |
| 27 | PHILOSOPHY | AAU, AAUA, ABSU, ABUJA, AIM, AKSU, AUGUSTINE, CIWA, BENIN, BINGHAM, BMSE, BOWEN, BSU, CALABAR, CLARETIAN, COOU, CUN, DELSU, DOMINICAN-UNI, DOU, EBSU, EKSU, KOMU, EVANGEL, FED-LAFIA, FED-LOKOJA, FED-OYE EKITI, FED-OTUOKE, AEFUNA, FED-WUKARI, FOUNTAIN, IBADAN, IMSU, JABU, PAAU, LAGOS, LAUTECH, MADONNA, MKAR, NASARAWA, NATIONAL, NDU, NOUN-ELUON, OAU, OOU, PHC, POPE, REDEEMERS, RSU, SAIK, SAU, SPIRITAN-NSK, ST-ALBERT, ST-JOSEPH, ST PETER & PAUL, SWSO, TANSIAN, UDA, UHIELE, UNIOSUN, UNIZIK, UYO, VERITAS | Printed pp. 229–231; `arts_hum.txt:4761–4880` including awarder-list continuations. `ARTS` in the ledger is a header, not an awarder; normalize the extraction's `FED- LAFIA` whitespace to the established code FED-LAFIA. The separate Philosophy and Religious Studies heading begins after this cell. |
| 29 | THEOLOGY | BOUEDST, BINGHAM, MADONNA, WESLEYUNI | Printed p. 240; `arts_hum.txt:5287–5291`. The following `CHRISTIAN THEOLOGY`/NOUN, VERITAS cell is separate and excluded. |

## Updated counts

- Additional exact cells: **2** (Philosophy and Theology); title-variant cell with full source identity/list established: **1** (French WITH German/Russian).
- Exact complete-body-cell holds still open from Arts 1–36: **3** (rows 16, 21, 28); title-variant holds: **2** (rows 2 and 15).
- No exact-string title should be manufactured from an index line. Keep the title variants visible for later JAMB identity reconciliation.

## Focused test

```powershell
python -m pytest --basetemp .pytest-tmp-jamb-lane-b-025 `
  data/career-mapping/_audit/test_jamb_source_repair_lane_b_arts_025.py -q
```

Result: `1 passed` (executed in the focused Lane-B Arts audit suite).

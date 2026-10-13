# JAMB offering-source verification — Lane B checkpoint 022 (Arts body-cell completions)

Date: 2026-09-28  
Scope: continue evidence recovery for the 20 remaining Arts 1–36 holds in checkpoint 020. Audit/document only; do not edit the JAMB offering ledger.

Primary source: [JAMB IBASS Arts/Humanities degree brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf), accessed 2026-09-28. The exact body cells below were compared to `data/career-mapping/_jamb_txt/arts_hum.txt`. The official search index also exposed the complete Literature in English table cell and the German/Russian foreign-language table; exact indexed source snippets are not substituted for the extraction's body-cell/page-continuation checks.

| Row | Exact JAMB body title | Complete awarder set established | Item-specific locator / finding |
|---:|---|---|---|
| 11 | LITERATURE IN ENGLISH | ABU, BASU, BOSU, CHRISLAND, CHRISTOPHER, CLIFFORD, GREGORY, JOS, OAU, PAUL, RSU, UDU, UNIOSUN, WESLEYUNI | Printed pp. 172–174; `arts_hum.txt:1984–2026`. Official indexed body cell lists this set; the ledger's `ARTS` token is not an awarder. |
| 12 | FRENCH | AAU, ABSU, ABU, ANCHOR-UNI, BABCOCK, BAYERO, BENIN, BSU, BOUEDST, CALABAR, COVENANT, CROWN-HILL, DELSU, EBSU, EKSU, FED-DUTSINMA, FED-LAFIA, FED-LOKOJA, AEFUNA, FOUNTAIN, GREGORY, IAUED, IBADAN, IGBINEDION, ILORIN, IMSU, JOS, KASU, KWASU, LAGOS, LAPAI, LASU, LASUED, LCITY, MAIDUGURI, NDA, NASARAWA, NAUB, OAU, OOU, PHC, POL-ACAD, REDEEMERS, SAU, TASUED, TSUJ, UDA, UDU, UMYUK, UNIOSUN, UNIZIK, UNN, UYO | Printed pp. 175–176; `arts_hum.txt:2136–2221`, including both continuation pages. The body institution column closes before the separate PORTUGUESE/ENGLISH title. The ledger's `ARTS` token is a header, not an awarder. |
| 13 | PORTUGUESE/ENGLISH | LASU | Printed p. 177; `arts_hum.txt:2222–2224`. Separate `MODERN AND EUROPEAN LANGUAGES`/UNIZIK and `EUROPEAN LANGUAGES`/DOU cells follow; do not merge them into Portuguese/English. |
| 14 | GERMAN | IBADAN, LAGOS, OAU, UNN | Printed p. 213; `arts_hum.txt:3971–3985`, including the page-break continuation to UNN. The ledger's `ARTS` and `RUSSIAN` are not German awarders. |
| 20 | AFRICAN AND ASIAN STUDIES | UNIZIK | `arts_hum.txt:3631–3633`; body title is followed by UNIZIK. The ledger's `STUDIES`, `ARTS`, and `LINGUISTICS/IGBO` tokens are not awarders for this cell. |
| 23 | RUSSIAN WITH FRENCH/GERMAN | IBADAN | Printed p. 213; `arts_hum.txt:3994–3996`. The nearby `FRENCH WITH GERMAN/RUSSIAN` and `GERMAN` cells are distinct. The ledger's `FRENCH/GERMAN` and `ARTS` are title/header spillover, not awarders. |
| 24 | MASS COMMUNICATION (Arts/Humanities faculty occurrence) | AJAYI, COVENANT, EVANGEL, HAVILLA, JOS, NOUN, NUS, NTA-TVC, SALEM, UNN | `arts_hum.txt:4360–4374`. The complete Arts faculty body cell ends before `INFORMATION AND MEDIA STUDIES`. A Social Sciences Mass Communication occurrence is a separate faculty context. The ledger includes that adjacent title spillover. |
| 30 | YORUBA | AAUA, BOUEDST, EKSU, FOUNTAIN, IBADAN, ILORIN, KWASU, LAGOS, LASUED, LAUTECH, LCITY, NAUB, OAU, OOU, POL-ACAD, UNIOSUN | Printed pp. 245–246; `arts_hum.txt:5546–5572`. The awarding-institutions cell continues at the page break. `ARTS` in the ledger is a column header, not an awarder. |

## Updated counts

- Checkpoint 020's unresolved exact-cell set: **20**.
- Complete exact source cells additionally recovered here: **8** (the eight rows above); these are source-backed audit results only, not edits to the authoritative ledger.
- Remaining Arts 1–36 rows whose full title/list still needs direct page-level reconciliation: **12** (rows 15, 16, 17, 18, 19, 21, 25, 27, 28, 29, 35, 36), plus the separate Arabic title-variant hold at row 2.
- Rows 4, 6, 26, 31, and 33 remain the only rows skipped under the explicit prior-checkpoint exception.
- Do not advance to a different JAMB range while these 12 source cells and row 2's identity variation remain open. Do not call them unavailable.

## Focused test

```powershell
python -m pytest --basetemp .pytest-tmp-jamb-lane-b-022 `
  data/career-mapping/_audit/test_jamb_source_repair_lane_b_arts_022.py -q
```

Result: `1 passed` (executed in the focused Lane-B Arts audit suite).

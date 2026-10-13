# JAMB offering-source verification — Lane B checkpoint 021

Date: 2026-09-28  
Scope: re-review only the Arts occurrences still held after checkpoint 020; rows 1–36 of `data/career-mapping/jamb/arts_hum_offerings.json`. Audit/document only. No JAMB or CCMAS source data, canonical mappings, or downstream mappings were edited.

## Source and method

- Official source: [JAMB IBASS Arts/Humanities degree brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf), accessed 2026-09-28.
- The official PDF search index opens as an IBASS JavaScript shell in this environment. Its indexed excerpts and the checked-in brochure extraction `data/career-mapping/_jamb_txt/arts_hum.txt` were compared. Index identity numbers and printed pages 130–131 were used to distinguish the official listed programme identities from body-table titles. Body-page and extracted line locators are recorded below.
- The checked-in occurrence ledger was used only as the comparison target. Its current arrays still include evidence-held rows and were not treated as independent evidence.
- A body cell is considered evidenced when the extraction shows the title followed by its full awarding-institution column up to the next body-title. Where a body title differs from the indexed/canonical identity, or the extracted institution column is partial/ambiguous, the occurrence remains held. This is an audit finding, not a data promotion.

## Newly recovered exact body cells and ledger discrepancies

The source cells below were reconstructed from the official brochure body and checked-in extraction. Each row remains `evidence_hold` in the canonical ledger; the audit did not apply corrections.

| Ledger row | Index identity (printed pp. 130–131) | Official body cell and printed-page / extraction locator | Comparison with held ledger; audit disposition |
|---:|---|---|---|
| 11 | #56 Literature in English | `LITERATURE IN ENGLISH`; pp. 171–173; `arts_hum.txt:1984–2026` (institution column continues across page breaks). Source awarders: ABU, BASU, BOSU, CHRISLAND, CHRISTOPHER, CLIFFORD, GREGORY, JOS, OAU, PAUL, RSU, UDU, UNIOSUN, WESLEYUNI. | Ledger has the same source names plus `ARTS`, which is page/faculty text rather than an awarding institution. Exact body cell established; ledger mismatch confirmed; keep held pending correction. |
| 12 | #26 French | `FRENCH`; pp. 175–177; `arts_hum.txt:2136–2220`. Source awarders: AAU, ABSU, ABU, ANCHOR-UNI, BABCOCK, BAYERO, BENIN, BSU, BOUEDST, CALABAR, COVENANT, CROWN-HILL, DELSU, EBSU, EKSU, FED-DUTSINMA, FED-LAFIA, FED-LOKOJA, AEFUNA, FOUNTAIN, GREGORY, IAUED, IBADAN, IGBINEDION, ILORIN, IMSU, JOS, KASU, KWASU, LAGOS, LAPAI, LASU, LASUED, LCITY, MAIDUGURI, NDA, NASARAWA, NAUB, OAU, OOU, PHC, POL-ACAD, REDEEMERS, SAU, TASUED, TSUJ, UDA, UDU, UMYUK, UNIOSUN, UNIZIK, UNN, UYO. | Ledger list agrees except for `ARTS`, which is not an institution. Exact body cell established; ledger mismatch confirmed; keep held pending correction. |
| 13 | #67 Portuguese/English | `PORTUGUESE/ENGLISH — LASU`; p. 176; `arts_hum.txt:2222–2223`. | Ledger continues with `MODERN AND EUROPEAN LANGUAGES`, `UNIZIK`, `EUROPEAN LANGUAGES`, and `DOU`; those belong to following body entries, not this exact cell. Exact cell established; ledger bleed confirmed; keep held pending correction. |
| 14 | #31 German | `GERMAN — IBADAN, LAGOS, OAU, UNN`; pp. 212–213; `arts_hum.txt:3971–3984`. | Ledger also contains `ARTS` and `RUSSIAN`, neither an awarder in this German cell. Exact cell established; ledger bleed confirmed; keep held pending correction. |
| 17 | #33 History | `HISTORY`; pp. 189–190; `arts_hum.txt:2757–2807`. Source awarders: ABU, ABUJA, ADSU, BAYERO, BENIN, BSU, COOU, FED-LAFIA, FED-DUTSINMA, FED-LOKOJA, AEFUNA, GSU, IBADAN, JABU, KASU, LAPAI, LEGACY, LAUTECH, MAIDUGURI, MAITAMA, NASARAWA, NDA, OAU, PHC, SAU, SOSU, UDU, UMYUK, UNIKINGS, UNIZIK, UNN, YSU. | Ledger continues far beyond the standalone cell into multiple History combinations and contains adjacent programme titles. Standalone cell established; ledger aggregation/bleed confirmed; keep held pending correction. |
| 18 | #38 History and Strategic Studies | `HISTORY AND STRATEGIC STUDIES — LAGOS`; p. 189; `arts_hum.txt:2809–2812`. | Ledger includes neighboring title fragments and institutions from other History entries (including DOU, NAUB and Military History). Exact body cell established; ledger bleed confirmed; keep held pending correction. |
| 19 | #23 Economics | `ECONOMICS`; pp. 202–203; `arts_hum.txt:3501–3511`. Source awarders: EVANGEL, FED-DUTSE, FED-KASHERE, FED-LOKOJA, FED-WUKARI, UMYUK. | Ledger continues into `ECONOMICS AND DEVELOPMENT STUDIES` and other offerings and contains `ARTS`; those associations are not established by the standalone cell. Exact body cell established; ledger bleed confirmed; keep held pending correction. |
| 23 | #72 Russian with French/German | `RUSSIAN WITH FRENCH/GERMAN — IBADAN`; p. 213; `arts_hum.txt:3994–3995`. | Ledger includes `FRENCH/GERMAN` (body-title fragment) and `ARTS` as well as IBADAN. Exact body cell established; ledger bleed confirmed; keep held pending correction. |
| 24 | #57 Mass Communication | `MASS COMMUNICATION`; pp. 220–221; `arts_hum.txt:4360–4371`. Source awarders: AJAYI, COVENANT, EVANGEL, HAVILLA, JOS, NOUN, NUS, NTA-TVC, SALEM, UNN. | Ledger also contains `INFORMATION AND MEDIA STUDIES` and `ARTS`, which begin other body entries/page text. Exact cell established; ledger bleed confirmed; keep held pending correction. |
| 30 | #75 Yoruba | `YORUBA`; pp. 245–246; `arts_hum.txt:5546–5568`. Source awarders: AAUA, BOUEDST, EKSU, FOUNTAIN, IBADAN, ILORIN, KWASU, LAGOS, LASUED, LAUTECH, LCITY, NAUB, OAU, OOU, POL-ACAD, UNIOSUN. | Ledger contains `ARTS` in addition to the body-cell awarders. Exact cell established; ledger mismatch confirmed; keep held pending correction. |
| 36 | #73 Sociology | `SOCIOLOGY`; p. 254; `arts_hum.txt:5939–5945`. Source awarders: COVENANT, EVANGEL, FED-KASHERE, PLASU, SALEM. | Ledger continues into the distinct `SOCIOLOGY AND ANTHROPOLOGY` and `CRIMINOLOGY AND SECURITY STUDIES` cells and includes FED-OTUOKE and FED-DUTSE from those contexts. Exact Sociology cell established; context collapse/bleed confirmed; keep held pending correction. |

The official indexed Arts brochure confirms the index identities and the body search excerpts expose the language-cell grouping; for example, the source has separate `GERMAN`, `PORTUGUESE`, `RUSSIAN`, and `RUSSIAN WITH FRENCH/GERMAN` rows, while the index independently names Portuguese/English and Russian with French/German. Do not transfer institutions between these similar titles. The same official source returns `FRENCH AND INTERNATIONAL STUDIES — UNIOSUN` and `FRENCH WITH GERMAN/RUSSIAN — UNN`; those are not silently substituted for the distinct `French` or `French and German/Russian` ledger identities.

## Remaining held occurrences

| Ledger row | Index identity / locator | Body comparison from official source + extraction | Disposition |
|---:|---|---|---|
| 2 | #5 Arabic Language and Literature Studies; index p. 130; candidate body `arts_hum.txt:137–299` | Official body/index wording is `ARABIC LANGUAGE AND LITERATURE`; the held ledger identity adds `Studies`. Retrieved body excerpt shows IBADAN, PAAU, UNIOSUN, but exact source identity equivalence and full standalone cell are not established. | Hold; do not alias/merge from similar wording. |
| 15 | #28 French and German/Russian; index p. 130; candidate body `arts_hum.txt:2251–2263` | Body says `FRENCH WITH GERMAN/RUSSIAN — UNN`; the index says `French and German/Russian`. The body has one visible awarder, but title variant/identity equivalence is not resolved. | Hold; preserve the discrepancy for adjudication. |
| 16 | #42 International Studies and Diplomacy; index pp. 130–131; candidate body `arts_hum.txt:3237–3261` | Ledger title is truncated as `International Studies and`; nearby body includes other International Studies combinations. No exact complete offering cell for the truncated record was independently established. | Hold; do not complete the title or merge adjacent offerings by inference. |
| 20 | #2 African and Asian Studies; index p. 130; candidate body `arts_hum.txt:3631–3680` | Index identity is exact, but source body search did not recover a complete exact title-plus-awarder cell for this held record. | Hold; no complete cell proof. |
| 21 | #52 Linguistics; index p. 131; candidate body `arts_hum.txt:3683–4359` | The broad extraction window contains separately titled Linguistics, language, and language-combination rows. No complete standalone Linguistics awarder column was isolated. | Hold; do not union neighboring language offerings. |
| 25 | #60 Music; index p. 131; candidate body `arts_hum.txt:4412–4754` | The body window contains the Music title and long institution/requirements material, but this increment did not independently establish a complete body-column boundary and exact full list. | Hold; prior partial/tail evidence is not a complete awarder list. |
| 27 | #62 Philosophy; index p. 131; candidate body `arts_hum.txt:4761–4880` | Exact index title exists, but complete exact body-cell list was not independently reconstructed in this increment. | Hold. |
| 28 | #70 Religious Studies; index p. 131; candidate body `arts_hum.txt:4882–5545` | This broad window includes Religious Studies and multiple distinct religious/theology offerings. No complete standalone exact body cell was established. | Hold; keep adjacent awards separate. |
| 29 | #74 Theology; index p. 131; candidate body `arts_hum.txt:5287–5495` | The window overlaps Christian Theology and other Religious Studies entries; a complete exact Theology cell was not established. | Hold. |
| 35 | #64 Political Science and Conflict Resolution; index p. 131; candidate body `arts_hum.txt:5840–5843` | Body shows `POLITICAL SCIENCE AND CONFLICT RESOLUTION — AL-HIKMAH`; the ledger truncates the canonical identity to `Political Science and Conflict` and includes other neighboring names. The source cell is a strong candidate, but canonical title reconciliation is still required. | Hold; do not rewrite the canonical name or promote based on truncation. |

## Accounting

- Checkpoint 020 test independently rerun: **1 passed**.
- Arts rows 1–36 currently still have **24** ledger entries with `source_verification.status=evidence_hold`.
- Prior exact body cells retained from checkpoint 020: **3** — Kanuri/Maiduguri, Fulfulde/Maiduguri, Communication Arts/Bowen and Uyo.
- Additional complete body cells reconstructed in this increment: **11**. Their canonical ledger rows remain held because the current arrays include unrelated title/page text or otherwise require reconciliation; no authoritative data was changed.
- Still-unresolved cells/title identities: **10** (rows 2, 15, 16, 20, 21, 25, 27, 28, 29, 35). Arabic and the two political/language title variants are explicitly not promoted by inference.
- Combined accounting: 3 prior exact body cells + 11 newly reconstructed source cells + 10 still-unresolved records = **24 held occurrences rechecked**. “Source cell reconstructed” is not equivalent to “ledger fixed” or “canonical offering confirmed.”
- No rows were marked unavailable. Partial lists remain held.
- No downstream mappings or CCMAS records were inspected or edited.

## Focused test

```powershell
python -m pytest --basetemp .pytest-tmp-jamb-lane-b-021 `
  data/career-mapping/_audit/test_jamb_source_repair_lane_b_arts_021.py -q
```


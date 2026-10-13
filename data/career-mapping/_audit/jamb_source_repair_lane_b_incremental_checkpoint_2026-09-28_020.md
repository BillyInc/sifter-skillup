# JAMB offering-source verification — Lane B checkpoint 020

Date: 2026-09-28  
Scope: held Arts occurrences in rows 1–36 of `arts_hum_offerings.json`, excluding the five exact offering cells confirmed in checkpoints 002–003. Audit/document only; no offering ledger or other authoritative source data changed.

## Source and method

- Official source: [JAMB IBASS Arts/Humanities degree brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf), accessed 2026-09-28.
- Identity locator: printed pp. 130–131, programme index. Exact body-title/awarder checks use the relevant body-table entries in the checked-in extraction `data/career-mapping/_jamb_txt/arts_hum.txt` and official IBASS PDF search indexing. The direct PDF open currently returns the IBASS JavaScript shell; indexed snippets are incomplete for several body tables, so they are not treated as proof of a complete awarder list.
- The checked-in parsed ledger is used to identify the 24 held records and their candidate source windows, not as independent proof of its own awarder arrays.

## Reconciliation

The five skipped, already verified exact cells are Classical Studies, Christian Studies, Peace Studies, Anthropology, and Efik-Ibibio. Of the remaining held set, **24/24 were rechecked** against the official brochure identity index and their extraction windows.

| Row | Ledger identity | Extraction locator | Result / disposition |
|---:|---|---|---|
| 2 | Arabic Language and Literature Studies | `arts_hum.txt:137–299` | Official body snippet gives `ARABIC LANGUAGE AND LITERATURE` with IBADAN, PAAU, UNIOSUN. The body title differs from this ledger identity; retain hold pending identity/alias reconciliation. |
| 11 | Literature in English | `arts_hum.txt:1984–2135` | Exact index title; complete body awarder set not recovered. Hold. |
| 12 | French | `arts_hum.txt:2136–2221` | Exact index title; returned body evidence is a partial continuation and does not establish the complete list. Hold. |
| 13 | Portuguese/English | `arts_hum.txt:2222–2231` | Exact index title; adjacent European-language rows make the complete body awarder set uncertain. Hold. |
| 14 | German | `arts_hum.txt:2232–3993` | Exact index title; parsed span covers many distinct language rows; no complete exact body cell established. Hold. |
| 15 | French and German/Russian | `arts_hum.txt:2251–2257` | Index title is present; nearby body entries include both French-with-German/Russian and Russian-with-French/German wording. Exact identity and full awarder set unresolved. Hold. |
| 16 | International Studies and | `arts_hum.txt:2258–3261` | Truncated ledger identity overlaps several distinct international-studies offerings. Do not complete the title or combine awarders by inference. Hold. |
| 17 | History | `arts_hum.txt:2757–3500` | Exact index title; broad extraction span contains several History combinations. Complete standalone History awarder set not established. Hold. |
| 18 | History and Strategic Studies | `arts_hum.txt:2809–3068` | Exact index title; full body awarder set not established from returned evidence. Hold. |
| 19 | Economics | `arts_hum.txt:3501–3630` | Exact index title; Arts-brochure occurrence must remain distinct from Economics in other faculty brochures. Complete Arts body awarder set not established. Hold. |
| 20 | African and Asian Studies | `arts_hum.txt:3631–3680` | Exact index title; full body awarder set not recovered. Hold. |
| 21 | Linguistics | `arts_hum.txt:3683–4359` | The extraction span includes many separately titled language/language-combination offerings. No single complete standalone Linguistics awarder cell established. Hold; do not merge them. |
| 22 | Kanuri | `arts_hum.txt:3922–3929` (candidate body window `4004–4015`) | Official body snippet identifies `KANURI — MAIDUGURI`; exact single-awarder cell confirmed. Ledger remains unchanged. |
| 23 | Russian with French/German | `arts_hum.txt:3994–4053` | Index identity exists, but body also contains French with German/Russian. Complete exact cell and awarder set unresolved. Hold. |
| 24 | Mass Communication | `arts_hum.txt:4360–4411` | Exact index title; complete body awarder set not recovered. Hold. |
| 25 | Music | `arts_hum.txt:4412–4754` | Exact index title; returned snippet exposes only a continuation/tail of the institution list. Hold. |
| 27 | Philosophy | `arts_hum.txt:4761–4880` | Exact index title; complete body awarder set not recovered. Hold. |
| 28 | Religious Studies | `arts_hum.txt:4882–5545` | Exact index title; broad extraction span includes several distinct religious-studies titles. Standalone complete cell unresolved. Hold. |
| 29 | Theology | `arts_hum.txt:5287–5495` | Exact index title; extraction overlaps Religious Studies and other theology entries. Complete exact awarder set unresolved. Hold. |
| 30 | Yoruba | `arts_hum.txt:5546–5625` | Exact index title; extraction includes Yoruba combinations. Complete standalone awarder set unresolved. Hold. |
| 32 | Fulfulde | `arts_hum.txt:5629–5651` (candidate body window `5766–5770`) | Official body snippet identifies `FULFULDE — MAIDUGURI`; it separately lists `LINGUISTICS AND FULFULDE — MAIDUGURI`. Standalone one-awarder cell confirmed; preserve the combination as a separate offering. Ledger remains unchanged. |
| 34 | Communication Arts | `arts_hum.txt:5655–5831` (candidate body window `5770–5784`) | Official body snippet identifies `COMMUNICATION ARTS — BOWEN, UYO`; it separately lists Communication and Language Arts and Communication Studies. Exact cell confirmed; do not merge adjacent offerings. |
| 35 | Political Science and Conflict | `arts_hum.txt:5832–5938` | Official index title is Political Science and Conflict Resolution. Parsed source window also contains Political Science and Conflict Resolution contexts; complete exact awarder cell not recovered. Hold. |
| 36 | Sociology | `arts_hum.txt:5939–6005` | Arts-brochure Sociology context remains distinct from Social Sciences Sociology; the extracted window includes Sociology and Anthropology and Criminology/Security Studies. Complete standalone exact cell not recovered. Hold. |

## Counts and boundary

- Held records rechecked: **24/24**.
- Exact body offering cells with a complete awarder list exposed in authoritative evidence: **3** (Kanuri/Maiduguri; Fulfulde/Maiduguri; Communication Arts/Bowen and Uyo).
- A source body title/list was found but does not exactly match the ledger identity: **1** (Arabic Language and Literature vs. Arabic Language and Literature Studies; IBADAN, PAAU, UNIOSUN). Not promoted.
- Remaining held because the exact cell or complete awarder list was not independently established: **20** (24 reviewed − 3 confirmed − 1 title-variant hold).
- This checkpoint records findings only and does not itself authorize promotion or rewriting canonical identity mappings. At verification time, `git diff` showed concurrent edits already present in `data/career-mapping/jamb/arts_hum_offerings.json`; those edits are outside this checkpoint's audit-only scope and are not represented as changes made by this audit record.
- Continue from this boundary by obtaining complete, page-rendered official table evidence for the 21 holds (and resolving the Arabic title variation); then proceed to the next disjoint unverified context in Lane B. Do not redo Lane A or Sciences.

## Focused test

```powershell
python -m pytest --basetemp .pytest-tmp-jamb-lane-b-020 `
  data/career-mapping/_audit/test_jamb_source_repair_lane_b_arts_020.py -q
```

The test checks the exact 24-row scope, five exclusions, three confirmed body cells, and that every other disposition remains held in the ledger. It does not claim the held ledger entries are correct.

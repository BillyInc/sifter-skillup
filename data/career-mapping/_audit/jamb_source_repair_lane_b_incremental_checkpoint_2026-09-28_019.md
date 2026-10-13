# JAMB offering-source verification — Lane B checkpoint 019

Date: 2026-09-28  
Scope: second authoritative re-review of held Arts occurrence rows 37–43. CCMAS and downstream mapping remain deferred.

## Why this re-review was needed

Checkpoints 002–004 stamped Arts rows 1–43 as either confirmed or held based mainly on local extracted windows. A hold is not a completed authoritative title/awarder check. This increment rechecked the remaining Arts tail against the official JAMB IBASS Arts/Humanities degree brochure and the checked-in full-text extraction; only a complete matching body-cell list is promoted.

Primary source: [JAMB IBASS Arts/Humanities degree brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf), accessed 2026-09-28. Direct web text opens to the IBASS JavaScript shell; official search indexing exposed the Hausa awarder table, and the repository's brochure extraction was used to check the printed-page continuation/body context. The access date and exact printed-page locator are stored on the confirmed occurrence.

## Rows 37–43

| Row | JAMB occurrence | Exact-body/title/awarder result | Disposition |
|---:|---|---|---|
| 37 | Drama/Dramatic Arts/Performing Arts | The existing 61-code ledger union was not corroborated as one exact body awarder column; the official exact-title search returned no result establishing that union. | Held; no list promotion. |
| 38 | Fine Art/Fine and Applied Arts | Official JAMB search shows the exact `FINE ARTS/FINE AND APPLIED ARTS` body heading and starts its awarding column with BENIN, but the returned authoritative excerpt does not expose the complete 18-code list. | Held; title confirmed, full awarder set not confirmed. |
| 39 | Psychology | The four-code ledger list was not corroborated as an Arts-faculty body cell by the retrieved official source excerpt. A similarly named Social Sciences occurrence is not substituted. | Held. |
| 40 | Hausa | Exact body title `HAUSA:` on printed p. 186. The complete 22-code awarding column continues across the page break and exactly matches the ledger: ABU, AL-QALAM, BASU, BAYERO, FED-DUTSINMA, FED-GUSAU, FED-KASHERE, FED-LAFIA, ILORIN, KASU, LASUED, MAIDUGURI, MAITAMA, NASARAWA, NAUB, POL-ACAD, SLUK, SOSU, TSUJ, UDU, UMYUK, YSU. | Confirmed; item-level source metadata recorded on Arts row 40. |
| 41 | Igbo | Official body excerpt confirms `IGBO` and the initial awarding codes ABSU, COOU, EBSU, AEFUNA, IBADAN, ILORIN, LAGOS, LASUED and NAUB; the returned source excerpt does not expose the rest of the 16-code column. | Held; partial list is not promoted. |
| 42 | Modern Language and Translation | Index identity is not corroborated as a body title; the body extraction instead shows `MODERN LANGUAGES` and language-option context. | Held; do not equate the titles without an exact source cell. |
| 43 | Geography and Environmental Studies | The body shows a separate `GEOGRAPHY` row and its four institutions (FED-KASHERE, FED-LAFIA, FED-LOKOJA, AEFUNA), not the exact indexed phrase. | Held; source body does not establish that the indexed identity is an exact equivalent. |

## Increment accounting

- Rows in this re-review: **7/7**.
- Full title-plus-awarder set confirmed: **1** (Hausa).
- Exact title observed but full awarder set incomplete: **2** (Fine Art/Fine and Applied Arts; Igbo).
- Exact identity/complete awarder evidence not established: **4** (Drama/Dramatic Arts/Performing Arts; Psychology; Modern Language and Translation; Geography and Environmental Studies).
- Only the fully supported Hausa row was updated; all other unsupported confirmations remain held.
- Arts rows 1–36 have not been re-audited in this increment. Their prior 1–36 checkpoints remain evidence-hold/confirmed states, not proof that every held row has been exhaustively checked against the live official source.
- No CCMAS package/course, JAMB-to-CCMAS bridge, or downstream domain/subgroup/role mapping was inspected or edited.

## Curriculum-baseline rule (user clarification, 2026-09-28)

NUC CCMAS is the adequate national curriculum baseline. Missing
university-specific/additional 30% implementation detail is not by itself a
reason to block national CCMAS-based curriculum/domain mapping. Keep the
national baseline and provider-specific implementation distinct; search
authoritative external curriculum sources only when CCMAS is absent or
genuinely insufficient. Continue exact JAMB title/faculty/awarder/occurrence
verification regardless of whether a provider-specific syllabus is available;
the JAMB source record does not prove a university-specific curriculum.

## Focused test

```powershell
python -m pytest --basetemp .pytest-tmp-jamb-lane-b-019 `
  data/career-mapping/_audit/test_jamb_source_repair_lane_b_arts_019.py -q
```

Result: `1 passed`.

## Resume boundary

Continue with the still-held Arts rows among **1–36**, skipping the five earlier title/awarder cells already verified in checkpoints 002–003 (Classical Studies, Christian Studies, Peace Studies, Anthropology, Efik-Ibibio). Do not start the queued CCMAS audit until the remaining Arts holds have been source-searched and the 1–43 reconciliation is explicit.

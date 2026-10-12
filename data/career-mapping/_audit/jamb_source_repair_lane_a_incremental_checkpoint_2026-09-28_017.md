# Repair lane A — JAMB source/offering context incremental checkpoint 017

**Date:** 2026-09-28 (Africa/Lagos)  
**Status:** Administration occurrences 51–60 source-cell checked  
**Lane:** JAMB source/offering contexts only

## Completed increment

Continued from checkpoint 016 and checked exactly Administration occurrences
**51–60**, from `Aviation Management` through `Information and Media Studies`,
against the official [IBASS Administration brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf)
and its checked-in text extraction, `data/career-mapping/_jamb_txt/Administration.txt`.

The exact title-to-awarder cells match the existing institution arrays:

| Administration occurrence | Awarder cell | Official brochure locator |
|---|---|---|
| 51. Aviation Management | AZMAN | printed p. 73; `Administration.txt:1450–1451` |
| 52. Aviation Security | AZMAN | printed p. 73; `Administration.txt:1453–1454` |
| 53. Personnel Management | GREGORY | printed p. 73; `Administration.txt:1455–1458` |
| 54. Industrial Relations and Human Resources Management | COVENANT | printed p. 74; `Administration.txt:1489–1495` |
| 55. Islamic Studies | CUAB | printed p. 75; `Administration.txt:1529–1530` |
| 56. International Relations | OAU | printed p. 78; `Administration.txt:1685–1688` |
| 57. International Relations and Strategic Studies | NOVENA | printed p. 78; `Administration.txt:1689–1692` |
| 58. International Studies and Diplomacy | KASU | printed p. 78; `Administration.txt:1714–1718` |
| 59. Marketing and Consumer Studies | IBADAN | printed p. 81; `Administration.txt:1841–1846` |
| 60. Information and Media Studies | ABUJA | printed p. 87; `Administration.txt:2163–2168` |

Each row now records the official source URL, its printed-page and extracted
line locator, and verification date `2026-09-28`. The exact awarder cells were
verified, so none of these ten is an evidence hold. Neighboring headings were
kept separate. In particular, the two aviation offerings remain distinct;
Personnel Management/GREGORY is not merged with Industrial Relations and
Personnel Management; International Relations/OAU is not merged with
International Relations and Strategic Studies/NOVENA; and Information and
Media Studies/ABUJA remains distinct from the following Public Administration
heading. Existing requirement, waiver, and shared-block text was not changed.

## Updated Lane-A counts and next action

Recounted row states across the current Administration (60), Agriculture (28),
and Engineering (37) occurrence ledgers: **125 total; 85 source-confirmed, 40
evidence holds, 0 pending/unreviewed**. This is occurrence-level source-cell
coverage for these three faculty files, not verification of all 420 canonical
JAMB identities, all remaining faculty occurrence ledgers, or curriculum and
downstream mappings.

The next Lane-A action is evidence reconciliation for the first already-reviewed
hold, Administration occurrence **9: `Hotel and Tourism Management`**. The
remaining holds must stay unpromoted until their exact source cells are resolved
or the source limitation is documented. No CCMAS curriculum, downstream
mapping, taxonomy name, seed, or SQL artifact was changed.

## Validation and changed files

The focused regression suite asserts the exact ten-row boundary, all title and
awarder associations, source locators/date, distinct adjacent contexts, the
unchanged shared-requirement note, and the recalculated Lane-A counters.

Changed for this increment: `jamb/administration_offerings.json`, this
checkpoint, and `test_jamb_source_repair_lane_a_administration_051_060.py`.

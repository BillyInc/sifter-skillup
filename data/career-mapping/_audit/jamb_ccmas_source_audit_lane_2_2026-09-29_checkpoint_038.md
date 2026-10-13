# Lane 2 checkpoint 038 — JAMB row 144, ICT course-content tranche 1

Date: 2026-09-29  
JAMB identity: row 144, **INFORMATION AND COMMUNICATION SCIENCE**  
CCMAS component: Computing — Information and Communication Technology  
Scope: GST 111, COS 101, ICT 201, ICT 301, ICT 305. This continues the seven previously identified blank content-summary rows; it does not repeat the JAMB awarder-cell audit.

## Primary source

National Universities Commission, *Core Curriculum and Minimum Academic Standards (CCMAS) for Nigerian Universities: Computing*, [official PDF](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf), accessed 2026-09-29.

| Course | Printed pages | Exact PDF text lines |
|---|---:|---:|
| GST 111 (ICT programme instance) | 122–123 | 4779, 4857–4881 |
| COS 101 (ICT programme instance) | 123–124 | 4912–4935 |
| ICT 201 | 131–132 | 5191–5211 |
| ICT 301 | 136–137 | 5370–5404 |
| ICT 305 | 137–138 | 5405–5433 |

## Row-by-row comparison

1. **GST 111 — confirmed missing content; source metadata conflict.** The seven local outcomes match the ICT-specific source block. Local metadata is 2 units, LH 15, PH 45 and no `content_summary` is present. The NUC global table agrees on LH 15, but the detailed course heading says LH 30; both say PH 45. Its complete course contents are available in the cited primary block. Restore the contents, retain the outcomes, and leave the lecture-hour discrepancy unresolved pending source-owner clarification.
2. **COS 101 — confirmed missing content; outcomes and metadata match.** Local metadata (3 units, LH 30, PH 45) and all six outcomes match the ICT-specific block. The course-content and practical lab text is absent locally; restore it separately from the outcomes.
3. **ICT 201 — confirmed cross-course contamination and omissions.** Local has 11 outcome entries: five ICT-related entries plus six mathematical outcomes from MTH 201 and MTH 202. The source has seven ICT 201 outcomes. The local list skips the source's communication-ports outcome and its office-applications/Internet outcome; its “software types” item is source outcome 5 and appears one position early. Replace the list with the seven ICT-specific source outcomes and remove only the six misplaced math entries from ICT 201. The content summary is also missing.
4. **ICT 301 — confirmed adjacent-course outcome spill.** The first five local outcomes match Satellite Communication; five more are ICT 305 outcomes appended after them. The source clearly starts ICT 305 at PDF line 5405, after ICT 301's separate contents/lab section. Keep the first five for ICT 301, restore its missing contents/lab work, and verify assignment of the displaced five against ICT 305.
5. **ICT 305 — confirmed wrong-variant outcome list and missing content.** The local row has three outcomes; the programme-specific ICT 305 block has five. Local metadata matches the ICT-specific table/detail (2 units, LH 15, PH 45), but the local outcome list does not. The global table title is “Data Communication System & Network”; its detailed heading is “Data Communication Systems and Network.” Retain that source variation as provenance and identify by course code; do not mistake it for a substantive course mismatch.

## Handoff and cursor

Local reconciliation can apply the source-resolved outcome/content corrections without changing shared ledgers. Do not force a GST 111 LH choice or erase the ICT 305 source title variation. Two of the seven row-144 missing summaries remain for the next increment: **ICT 309 and CSC 308**. Then finish the two curriculum-facet and four domain-link adjudications before advancing the JAMB identity cursor.

The JSON checkpoint holds the structured comparisons, and the regression test checks both those findings and that the source data was not edited.

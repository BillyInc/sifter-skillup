# Lane 3 CCMAS source increment 009 — Petroleum Engineering PEE 101

**Checked:** 2026-09-28 (Africa/Lagos)  
**Primary source:** NUC, [Engineering and Technology CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf), accessed 2026-09-28.  
**Progress:** one of 49 local course rows in package 172 source-compared; 0/1 package fully audited. This is an append-only evidence checkpoint, not package closure.

## Prior-work reconciliation

Lane 3 increment 008 ends at package 171 (Petroleum and Gas Engineering), not package 172. The deterministic discovery inventory identifies package 172 as **Petroleum Engineering**, `engineering.json`, 49 rows. The package-172 course sequence has no prior lane-3 source checkpoint for `PEE 101`; no same-name offering or course identity was merged. This check did not edit shared curriculum, mapping, scope, or seed files.

## Finding

| Course | Official source comparison | Local comparison | Disposition |
|---|---|---|---|
| PEE 101 | The global programme table (printed p. 1085) lists `Introductory to Petroleum and Gas Industry`, 2 units, C, LH 15, PH 45. The detailed course block (printed pp. 1093–1094) titles it `Introduction to Petroleum and Gas Industry`, repeats 2 units/C/LH 15/PH 45, and supplies seven outcomes plus the full content syllabus. | Local title is `Introductory to Petroleum and Gas Industry 15 45`; units/status are 2/C, but LH and PH are null. The local content summary stops at `Career Development Resources incl`, truncating the source sentence and omitting its object. Seven local outcomes are present and correspond to the NUC list, including source wording such as “understand of.” | **Confirmed extraction defect.** The title's appended hour values belong in structured fields; restore LH 15 and PH 45 and the complete source-faithful summary in a separately authorized repair phase. The official table/detail title wording differs (`Introductory` vs `Introduction`), so preserve the two source locators and do not erase that source variation. Outcomes appear represented; no outcome omission is asserted from this check. |

The NUC course block states the content includes historical background, global supply/demand, geophysical exploration methods, petroleum geology, drilling, reservoirs, production, processing, transportation, unconventional gas sources, and career-development resources including information on the Society of Petroleum Engineers and other professional groups. Local content is visibly cut off before the final phrase. The discrepancy is not a judgement about whether the source content is educationally adequate; it is a field-level extraction loss.

## Remaining work

Package 172 has **48 other course rows** without this lane's exact source adjudication. Continue in source order and compare programme-table fields plus detailed title, content, and outcomes where available. Keep common courses distinct by package context and retain any NUC-internal conflicts explicitly. This one confirmed defect has not been repaired here because the lane assignment prohibits editing shared product ledgers.

Machine-readable evidence: `jamb_ccmas_source_audit_lane_3_2026-09-28_increment_009.json`.

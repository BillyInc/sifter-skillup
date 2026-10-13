# JAMB–CCMAS source audit — Lane 1 increment 045

**Date/access date:** 2026-09-29 (Africa/Lagos)  
**Partition:** JAMB rows 001–140 and CCMAS package indices 001–079  
**Scope of this tranche:** Accounting package 001, course ordinals 1–5. No JAMB source was rechecked in this tranche; Civil Law's unresolved awarder-cell cursor remains open.

## Existing coverage reconciled first

Accounting checkpoint 002 already compares the package's 31-course global structure and documents specific workload/content/outcome findings. It explicitly leaves detailed course comparison open. The current deterministic report lists no prior source-adjudication checkpoint for these five stable course record IDs. Increment 044 checked only ACC 490 (ordinal 31), so none of the five rows below duplicates that work. The PDF was opened at the exact Accounting source section; the global table and each detailed course block were compared to the local row fields.

## Primary source

[NUC Administration and Management CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf), accessed 2026-09-29. Global structure: printed pp. 31–32, PDF text pages 30–31, lines 1256–1267. Detailed blocks: GST 111 pp. 32–33; GST 112 p. 33; AMS 101 pp. 33–34; AMS 102 p. 34; AMS 103 pp. 34–35 (PDF text lines 1306–1439).

| Ordinal / code | Identity, title, ownership | Workload | Outcomes | Content and disposition |
|---|---|---|---|---|
| 1 / GST 111 | Accounting package ownership and code match. Local title matches detail (`Communication in English`); global table says `Communication in English Language`, a source-internal title variation. | 2 C, LH 15, PH 45 matches. | Seven distinct source outcomes are represented among ten local entries; the additional entries repeat/combine wording. | Local summary stops mid-sentence; the NUC block continues with reasoning, ethics/copyright, writing, comprehension and ICT. Content defect confirmed; title conflict retained. |
| 2 / GST 112 | Code and package match. Local/global title uses `Nigerian Peoples and Culture`; the detail heading uses singular `Nigerian People and Culture`. | 2 C, LH 30, no PH matches. | Eight distinct source outcomes are represented; local extra entries duplicate or concatenate wording. | Local summary stops during a sentence; the NUC content continues through re-orientation and current developments. Content defect confirmed; title conflict retained. |
| 3 / AMS 101 | Code, title and Accounting ownership match. | 2 C, LH 30, no PH matches. | Four local entries cover the five source outcomes because the final local entry combines the final two. | Local summary cuts off mid-word in the control-function section; the source continues with Nigerian management context and decision-making. Content defect confirmed. |
| 4 / AMS 102 | Code, title and Accounting ownership match. | 2 C, LH 30, no PH matches. | All five source outcomes are represented; local wording combines part of the sequence and contains a repeated distinguish-principles entry. | Local summary cuts off in trigonometry; source continues through functions, limits, differentiation, series and integration. Content defect confirmed. |
| 5 / AMS 103 | Code and package match; local title `Introduction to Computer` differs from both source locations, `Introduction to Computing`. | 2 C, LH 30; global table leaves PH blank, matching local null. | Six distinct source outcomes are represented; one local entry repeats the functional-programming outcome. | Local summary ends mid-phrase; source continues with internet resources, browsers and search engines. Title and content defects confirmed. |

Outcome-entry counts include source-extraction duplicates and do not represent unique learning claims. Findings are recorded for later reconciliation; no CCMAS source or shared ledger was changed.

## Progress and resume point

- Five new course rows compared: four rows have confirmed content/title defects; two have source-internal title variations (overlapping row dispositions); all five workload records match.
- The next JAMB cursor remains Civil Law, identity row 001, occurrence `13db7f702d56c6f9`: only a complete official awarder cell and continuation boundary remain open.
- The next CCMAS cursor is Accounting package 001, course ordinal 6 (`AMS 104`). Reconcile its exact prior coverage before source lookup.

Machine-readable evidence: `jamb_ccmas_source_audit_lane_1_2026-09-29_045_accounting_rows_001-005.json`.

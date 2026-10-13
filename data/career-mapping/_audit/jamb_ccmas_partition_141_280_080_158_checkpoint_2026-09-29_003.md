# JAMB 141–280 / CCMAS 080–158 source-review checkpoint 003

**Date:** 2026-09-29 (Africa/Lagos). Audit evidence only; no shared ledger or curriculum source was changed.

## Reconciliation before this increment

The new NUC detail blocks were compared with checkpoint 001 before proceeding. They confirm local identities for `GST 212`, `GST 222`, `GST 312`, and `FAC 202` in detailed sections, even though the global structure table differs or omits them. Those earlier apparent defects are now recorded as source-internal conflicts. They remain unresolved pending authoritative source reconciliation; local records were not edited.

## CCMAS package 080 detail rows

**Package:** `arts.json` / Modern European Languages B.A (German), 42 current course rows.  
**Source:** [NUC Arts CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf), accessed 2026-09-29.

I checked source identity/title, units/status/hours, course content, and learning outcomes for 14 detail blocks:

| Course(s) | Printed locator | Field-level result |
|---|---|---|
| GST 212 | p. 474 | Detailed block confirms the local code/title/load and content/outcomes; global structure says GST 211. Local structured LH 30 is missing. Source conflict plus local field gap. |
| GST 222 | pp. 474–475 | Detailed block confirms local course identity, five outcomes, and content; local structured LH 30 is missing. Global structure instead lists GST 311. Source conflict. |
| FAC 201 | pp. 475–476 | Source specifies 2 units/C/LH 30, seven outcomes, and Digital Humanities content. Local hours and summary are blank; its only outcome is polluted by German employability text. Confirmed extraction defect. |
| FAC 202 | p. 476 | Detailed block confirms local title, 2 units/C/LH 30, five outcomes, and content. Global structure omits it and lists FAC 302. Source conflict. |
| GER 201 | pp. 476–477 | Source has six outcomes; the local array has five and loses most of the distinct translation/interpretation/evaluation outcome. Confirmed outcome defect. |
| GER 202 | p. 477 | Title, 2/C/LH 30, six outcomes, and phonetics/phonology content match. |
| GER 203 | p. 477 | Source has seven outcomes; local has six, with the translation outcome merged/truncated. Confirmed outcome defect. |
| GER 204 | pp. 477–478 | Source repeats its detailed outcome/content block. Local stores both blocks but structured PH 90 is blank. Preserve duplicate-source structure; confirmed hours gap. |
| GER 205 | pp. 478–479 | Title, 2/C/LH 30, five outcomes, and listening/laboratory content match. |
| GER 206 | p. 479 | Title, 2/C/LH 30, four outcomes, and GER 203 content cross-reference match. |
| GER 207 | p. 479 | Detailed title matches the local spelling; source has seven outcomes and local has six, losing translation wording. Source excerpt has no GER 207 content block, so the empty local summary is not called a defect. |
| GER 208 | pp. 479–480 | Title, 2/C/LH 30, six outcomes, and selected-text analysis summary match. |
| GER 209 | p. 480 | Source specifies PH 90, five outcomes, and a translation-techniques content statement. Local hours/content are absent and translation outcome wording is incomplete. Confirmed extraction defect. |
| GER 210 | p. 480 | Title, 2/C/LH 30, six outcomes, and literature summary match in substance; local summary has the next “300 Level” heading appended. Confirmed boundary spill. |

`GER 101` and `GER 103` remain closed from their 2026-09-28 source-repair checkpoints and were skipped. The full machine-readable findings preserve the exact local and source field states for each checked course.

## Current coverage and resume cursor

JAMB rows 141–280 contain **140 identities / 141 parsed source occurrences**. Across rows 141–150, prior evidence plus this partition work gives **6 exact-cell complete, 2 partial, and 2 unresolved** occurrences. The new complete cell is row 143; row 142 remains partial because its institution-cell continuation is not established. The next unresolved JAMB cursor is row 141 / occurrence `88a6f6c47de0853e`.

CCMAS indices 080–158 contain **79 packages / 3,144 course rows**. Package 080 has **42/42 global-table records compared** and **14 detailed course rows checked in this increment**; two additional detailed checks (`GER 101`, `GER 103`) are reused from closed checkpoints. Thus **16/42 detailed rows have source evidence and 26 remain** for package 080. **0/79 packages are complete**. Next CCMAS cursor: package 080, course ordinal 1 (`GST 111`).

No shared ledger, other partition, or downstream domain/subgroup/role records were touched.

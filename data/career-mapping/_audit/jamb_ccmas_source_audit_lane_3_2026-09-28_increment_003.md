# Lane 3 CCMAS source increment 003 — packages 161–170

**Checked:** 2026-09-28 (Africa/Lagos)  
**Primary source:** [NUC Engineering and Technology CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf).  
**Progress:** selected source sections inspected for all ten package indices; 12 course rows received exact-source checks. **0/10 packages are fully audited**; most courses/contents/outcomes remain to be compared.

## Prior-work reconciliation

The bounded range 161–180 is a structural candidate scan only. The selected 79-package course-level source lane does not cover Engineering. The existing source/fix logs were searched for the exact course IDs below; no prior exact-source adjudication of these particular package/course records was found. This increment does not repeat a closed audit or change shared data.

## Confirmed defects and source conflict

- **Package 162 — Mineral Processing and Chemical-Metallurgical Engineering:** `MPE 305` and `MPE 306` are table-row extraction merges. The NUC course table on printed p.697 supplies the distinct titles and 1-unit/C/PH45 values. The appendix uses somewhat different facility-heading wording for MPE 305, so preserve the table and appendix locators rather than silently normalizing the text.
- **Package 163 — Mechanical Engineering:** internal NUC source conflict for `MEE 306`. The programme table (p.738) lists it as a 1-unit practical course; the detailed CAD learning-outcome block (p.759) is headed `MEE 301` and says 3 units with lecture and practical hours. Do not attach those outcomes to MEE 306 until the code conflict is resolved.
- **Package 165 — Metallurgical Engineering:** `MTE 415`'s local title spills into the next `GET 499` row, and its outcome list contains a laboratory-manual note plus the next “500 Level” heading. The official MTE 415 block ends after three outcomes (p.841).
- **Package 166 — Materials Engineering:** `MSE 301` has empty local content and oceanography outcomes. The exact NUC course block (pp.878–879) instead describes mineral/ore deposits, concentration, beneficiation, flowsheet design, NIAFlow and ore-slurry analysis. This is a confirmed content/outcome misassignment, not just an empty-summary signal.

## Metadata matches with evidence still open

Table metadata was checked for `MME 510` (161), `MCE 590` (164), `MTE 302` (165), `MNE 503` (167), `GST 213` and `ENT 311` (169), and for `GNG 511` (168). `MAR 124` in the previous increment also matched. These are bounded row checks only. In particular, empty project/lab content fields are not automatically defects if NUC supplies no course-specific learning block; the outcome/content search must be finished before deciding.

For `GNG 511`, the table and five outcomes match the local row (printed pp.936 and 960), but the checked source proceeds to GNG 513 without a GNG 511 content paragraph. Its empty local content is therefore not promoted to a defect or “unavailable”; item-specific external enrichment remains open.

The row-level ledger records exact printed locators, what source data supports, and what remains unresolved for each checked course/package. Continue with packages 171–180 and do not mark a package complete until all local course rows and source structure are compared.

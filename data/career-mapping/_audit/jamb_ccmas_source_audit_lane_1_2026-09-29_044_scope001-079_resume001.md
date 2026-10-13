# JAMB–CCMAS source audit — Lane 1 increment 044

**Date/access date:** 2026-09-29 (Africa/Lagos)  
**Partition:** JAMB canonical rows 001–140 and CCMAS package indices 001–079  
**Mode:** source evidence only; no shared ledgers or downstream domain/subgroup/role records edited.

## Coverage reconciled before source review

- JAMB row 001 is `Civil Law`, with the exact current occurrence `Law/law_offerings.json#1` (`13db7f702d56c6f9`). The 2026-09-26 prior-artifact matrix and the Lane 1 occurrence reconciliation cover the row and occurrence as prior-work inventory. They do not supply a complete exact awarder-cell confirmation for this occurrence, so it remained open.
- CCMAS package index 001 is Accounting. Lane 1 checkpoint 002 already compares the 31-course global structure and records specific course findings. It explicitly leaves detailed content/outcome checks open, including the exact ACC 490 detail check. This increment checks only that remaining ACC 490 source question; it does not repeat the 31-course count or prior findings.

## JAMB row 001 — Civil Law

Official source: [JAMB IBASS Law brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-law.pdf), accessed 2026-09-29. The index and body excerpt identify `Civil Law` under `Faculty/School/College of Law`, LLB (Hons); spelling, programme title, and the local Law faculty agree. The search-indexed body excerpt indicates printed p. 419 and begins the Civil Law awarder cell with ABU, OOU, and UNIZIK, but its text truncates before the cell ends. The local row contains 117 institution tokens, including `LAW`; the visible excerpt is not enough to determine whether that token is present in the official cell or where the continuation boundary falls.

Disposition: identity, title, and faculty are confirmed matches; the institution-awarder roster is unresolved. `LAW` remains a candidate extraction/boundary issue only. Keep the occurrence distinct and do not change its local roster on this partial evidence.

## CCMAS package 001 — Accounting, ACC 490

Official source: [NUC Administration and Management CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf), accessed 2026-09-29. In the Accounting Global Course Structure (printed pp. 31–32), `ACC 490 Project` is 6 units, core, with 270 practical hours and no lecture hours. The local row matches those fields. In the Accounting-specific detailed course sequence (printed pp. 35–49), the final course block is ACC 405 (printed pp. 48–49), followed by Minimum Academic Standards; there is no ACC 490 content or outcome block. The local row has no outcomes and explicitly avoids inferring project content.

Disposition: confirmed match for this course row, including source absence of a detailed project block. This does not complete the Accounting package.

## Progress and resume point

- JAMB occurrences examined in this increment: 1; fully closed: 0; unresolved: 1.
- CCMAS course rows source-adjudicated: 1 (`Accounting / ACC 490`).
- Next JAMB cursor: row 001, Civil Law occurrence `13db7f702d56c6f9`, requiring the complete official body cell and continuation boundary.
- Next CCMAS cursor: package 001, Accounting, first uncovered detailed course row (ordinal 1); reconcile its exact checkpoint coverage before searching.

Machine-readable evidence: `jamb_ccmas_source_audit_lane_1_2026-09-29_044_scope001-079_resume001.json`.

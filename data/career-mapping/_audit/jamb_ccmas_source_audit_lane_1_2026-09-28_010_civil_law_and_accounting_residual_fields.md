# Lane 1 checkpoint 010 — Civil Law source boundary and Accounting residual fields

**Access date:** 2026-09-28 (Africa/Lagos)  
**Status:** incremental findings saved; JAMB occurrence and CCMAS package remain open.  
**Scope:** canonical JAMB identity 001 / Civil Law occurrence `13db7f702d56c6f9`; CCMAS package index 001 / Accounting, current residual fields for ACC 102, ACC 203 and ACC 206. Audit evidence only; no shared product data changed.

## JAMB Civil Law — next unresolved occurrence

The official [JAMB IBASS Law brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-law.pdf), printed p. 419, confirms the Civil Law title and Law-faculty context. The official indexed PDF text shows the flattened awarder sequence beginning `ABU, OOU, UNIZIK, LAW, AAU, AAUA…`. Direct PDF retrieval still yields the IBASS JavaScript shell, and the indexed result does not preserve visual table boundaries.

The current occurrence contains 117 institution tokens, including `LAW`; the earlier Lane B checkpoint 016 correctly left this exact occurrence held. This increment does **not** resolve the disputed token or certify the full awarder cell. `LAW` could be a table entry or a heading/boundary artifact in the flattened extraction. Keep the row unverified until the visual cell and its continuation boundary are established from the official PDF or an authoritative JAMB rendition. Do not remove or promote the token based on this evidence alone.

## CCMAS Accounting — residual field mismatch

The earlier ACC source correction ledger and Lane 1 checkpoint 002 already checked the exact NUC course titles, contents and outcomes for these records. I carried that source evidence forward and checked the **current** `skills_learned` arrays, which the earlier correction did not update:

- **ACC 102 — Introduction to Financial Accounting II:** the verified NUC outcomes focus on conceptual framework, correction of errors, suspense/control accounts, not-for-profit accounting, incomplete records, sole-trader accounts and standard-setting bodies. The current legacy skills list instead foregrounds limited-company statements, share capital/debentures, depreciation and consolidation.
- **ACC 203 — Corporate Governance and Accounting Ethics:** verified outcomes cover governance frameworks/codes, company structures, boards/shareholders, internal control, sustainability and accountant ethics. The current skills list is management/cost accounting and variance analysis.
- **ACC 206 — Accounting Laboratory:** verified outcomes cover spreadsheets, cloud accounting, cash-management and audit tools, databases and office productivity. The current skills list is corporate finance, capital structure, dividends, capital budgeting and working capital.

These were confirmed current-field mismatches, not new claims about NUC source text. The three stale `skills_learned` arrays are now replaced with concise skill statements derived from their already source-verified `learning_outcomes`. Each row now carries the official NUC URL, exact printed locator, and original access date from the ACC correction ledger. Regression coverage is `test_acc_legacy_skill_arrays_repair_2026_09_28.py`. The prior arrays remain in the JSON checkpoint for audit traceability. The ACC course-load defects and ACC 101 internal source conflict from checkpoint 002 remain open and were not repeated here.

## Coverage boundary and next work

This increment closes neither the Civil Law occurrence nor the Accounting package. Continue the Civil Law official-cell boundary check, then move to the next uncovered JAMB occurrence without treating unresolved rows as completed. Reconcile Accounting’s remaining rows against prior exact source evidence, then proceed to package index 005, Business Administration, at the first genuinely uncovered NUC structure check. Current source/package inventories remain in the lane reconciliation and deterministic-discovery ledgers.

Machine-readable evidence: `jamb_ccmas_source_audit_lane_1_2026-09-28_010_civil_law_and_accounting_residual_fields.json`. Focused regression checks: `test_jamb_ccmas_source_audit_lane_1_increment_010.py` and `test_acc_legacy_skill_arrays_repair_2026_09_28.py`.

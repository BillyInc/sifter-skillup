# Lane 2 source-audit checkpoint 030 — German CCMAS courses GER 207–GST 312

## Source and scope

Audited course ordinals 21–25 in package index 080 against the exact NUC Arts CCMAS 2023 detailed blocks, printed pp. 479–482. Primary source: [NUC Arts CCMAS PDF](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf), accessed 2026-09-29.

## Findings handed to local reconciliation

- **GER 207:** Seven official outcomes are compressed into six local entries; split local outcome 5 into the source's comprehension and translation outcomes. No distinct Course Contents block is present before GER 208, so leave content unsupplied unless another authoritative source is found.
- **GER 208:** All six outcomes and content match; remove `New Arts 480` from outcome 4.
- **GER 209:** NUC specifies 2 units, C, PH 90; local PH is missing. Five outcomes are compressed to four, the short source content sentence is misplaced into the last outcome, and `content_summary` is null. Split outcomes, restore PH 90, and place the content sentence in its own field; do not infer LH.
- **GER 210:** Metadata and six outcomes match. Remove the trailing next-section marker `300 Level` from its content summary.
- **GST 312:** Metadata and five outcomes match. The local content starts with a misplaced `Learning Outcomes` heading and is truncated mid-word; restore from the full NUC block on printed pp. 481–482.

No shared curriculum ledger was edited. There are no source conflicts in this tranche. Exact next cursor is recorded in JSON.

**Next cursor:** CCMAS package index 080, course ordinals 26–30; then JAMB row 144.

Regression coverage: `test_jamb_ccmas_source_audit_lane_2_checkpoint_030.py`.

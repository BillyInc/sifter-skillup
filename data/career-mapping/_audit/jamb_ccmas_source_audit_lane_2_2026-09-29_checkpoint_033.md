# Lane 2 source-audit checkpoint 033 — German CCMAS courses GER 401–GER 405

## Source and scope

Audited course ordinals 36–40 in CCMAS package index 080 against the exact NUC Arts CCMAS 2023 blocks, printed pp. 486–488. Primary source: [NUC Arts CCMAS PDF](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf), accessed 2026-09-29.

## Findings handed to local reconciliation

- **GER 401:** NUC specifies PH 90 and six learning outcomes. Local PH and LH are both missing; no outcomes are stored. Set PH 90 (not LH) and restore all six source outcomes.
- **GER 402:** The source specifies 2 Units C, PH 90 after the outcomes heading; local units and both hour fields are null. Three source outcomes are compressed into two malformed local entries; restore the load and the three exact outcomes without inferring LH.
- **GER 403:** Metadata, five outcomes and content match; no repair identified.
- **GER 404:** Three source outcomes are represented by two local entries. The substantive source outcome about translation, interpretation and evaluation is missing; a loose tail appears in its place. Restore the actual source outcome and keep all three in order.
- **GER 405:** The official outcome and content fields both explicitly say “Same as in Ger 404.” Local content preserves that cross-reference but the outcome array is empty. Preserve the explicit source reference and locator; do not silently copy GER 404's outcomes.

No shared CCMAS/offering ledger was edited. Five rows were adjudicated: one matched and four have confirmed defects or missing source cross-references.

**Next cursor:** CCMAS package index 080, course ordinals 41–45; continue the package before moving to JAMB identity row 144.

Regression coverage: `test_jamb_ccmas_source_audit_lane_2_checkpoint_033.py`.

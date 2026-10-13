# Lane 2 source-audit checkpoint 032 — German CCMAS courses GER 303–GER 307

## Source and scope

Audited course ordinals 31–35 in CCMAS package index 080 against the exact NUC Arts CCMAS 2023 blocks, printed pp. 484–485. Primary source: [NUC Arts CCMAS PDF](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf), accessed 2026-09-29.

## Findings handed to local reconciliation

- **GER 303:** Metadata and content are present. The official Learning Outcomes text is a cross-reference (“continuation of GER 301 as is expressed above”), but the local outcome array is absent. Preserve the source reference; do not silently clone GER 301 outcomes.
- **GER 304:** Metadata and content match. The source's only Learning Outcomes text is a cross-reference to GER 302 (under the printed heading typo “Learning Cutcomes”); the local outcome array is absent. Record the literal reference and locator, not inferred outcomes.
- **GER 305:** The source has five outcomes; local has four because outcomes 3 and 4 are merged. Split them in source order. Remove `New Arts 485` from the end of local content.
- **GER 306:** Metadata, all five outcomes, and content match the source. No correction identified.
- **GER 307:** The source has three outcomes; local has two because source outcomes 1 and 2 are merged. Split them. Remove the next-section marker `400 Level` from content.

No shared CCMAS/offering ledger was edited. Five rows were source-adjudicated: one matched and four have confirmed representation defects (two missing source cross-references and two merged-outcome defects).

**Next cursor:** CCMAS package index 080, course ordinals 36–40; continue the package before moving to JAMB identity row 144.

Regression coverage: `test_jamb_ccmas_source_audit_lane_2_checkpoint_032.py`.

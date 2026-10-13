# Lane 2 source-audit checkpoint 031 — German CCMAS courses ENT 312–GER 302

## Source and scope

Audited course ordinals 26–30 in CCMAS package index 080 against the exact NUC Arts CCMAS 2023 course blocks, printed pp. 482–484. Primary source: [NUC Arts CCMAS PDF](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf), accessed 2026-09-29.

## Findings handed to local reconciliation

- **ENT 312:** The NUC header specifies LH 15 and PH 45; local PH is missing. Nine source outcomes are compressed into eight local entries, with outcomes 8 and 9 joined and a `New Arts 482` page artifact appended. The content summary truncates after “personal savings,” although the source continues through the remainder of the course block. Restore metadata, split the outcomes, remove the artifact and recover the full contents.
- **FAC 301:** The contents paragraph is appended to outcome 7 and `content_summary` is empty. Move it into the correct field. Outcome 4 cannot yet be safely reconstructed: the available extraction of the NUC line itself is corrupted, and screenshot retrieval failed with a cache miss. Keep that wording unresolved; do not complete it by inference.
- **FAC 302:** All five outcomes match. Remove the misplaced `Learning Outcomes` heading from the otherwise matching content summary.
- **GER 301:** Five NUC outcomes are represented by four local entries; local outcome 3 combines the source grammar/culture outcome and translation outcome. Split them and retain all five in order.
- **GER 302:** Outcomes and content match, except the final outcome has the page artifact `New Arts 484`; remove only that artifact.

No shared CCMAS/offering ledger was edited. All five course rows were source-adjudicated; five have confirmed data defects. FAC 301 outcome 4 is explicitly held for readable primary-source evidence.

**Next cursor:** CCMAS package index 080, course ordinals 31–35. Continue the package before moving to JAMB identity row 144.

Regression coverage: `test_jamb_ccmas_source_audit_lane_2_checkpoint_031.py`.

# Lane 3 JAMB source increment 018 — Polymer and Textile Engineering

**Checked:** 2026-09-29 (Africa/Lagos)  
**Primary source:** JAMB IBASS, [Engineering/Environmental/Technology brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-engineering.pdf), printed p. 368, accessed 2026-09-29.  
**Progress:** one offering occurrence source-compared. This closes the awarder-cell fact for this occurrence in the audit record, but not the occurrence's complete source contract or its linked CCMAS curriculum review.

## Prior-work reconciliation

Lane-3 increment 002 covered identities 281–290. The prior 311–320 verification checkpoint already identified row 311's exact JAMB awarder cell as open and recorded the parsed provider/title spill. This increment resolves that exact cell from the official JAMB PDF; it does not repeat the index-only check or re-audit the linked curriculum.

## Finding

| Canonical identity / occurrence | Official JAMB row | Current parsed value | Disposition |
|---|---|---|---|
| 311 — Polymer and Textile Engineering / `be319f684b95a753` | Printed p. 368: `POLYMER AND TEXTILE ENGINEERING` — FUTO, UNIZIK. The immediately following rows separately name Polymer Engineering — OAUSTECH; Chemical and Polymer Engineering — LASU; Textile Design Technology — FUTA and FED-DUTSINMA; Fashion Design — BOUEDST; and Production Engineering — BENIN and EUI. | The parsed occurrence contains all of those adjacent programme labels/provider tokens. | **Confirmed source/parser contamination.** The official awarder cell is FUTO and UNIZIK only. |

The saved occurrence inventory currently has no verified institution codes, PDF locator or official URL for this row. This checkpoint records the source-backed correction needed but does not edit the shared offering ledger. It also does not determine whether the eight-course CCMAS slice is sufficient for the two verified offerings; that remains a separate curriculum-scope review.

Machine-readable evidence: `jamb_ccmas_source_audit_lane_3_2026-09-28_increment_018.json`. Regression test: `test_jamb_ccmas_source_audit_lane_3_increment_018.py`.

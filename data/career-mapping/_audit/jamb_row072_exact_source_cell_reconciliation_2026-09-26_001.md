# Row 072 — exact JAMB source-cell reconciliation

**Checkpoint:** 001 · 2026-09-26 (Africa/Lagos)  
**Scope:** JAMB source identity, faculty, and institution cells only. No CCMAS curriculum re-search, downstream audit, or shared data edits.

## Prior evidence consulted

Started with row 072 in [`jamb_ccmas_rows_001_140_prior_artifact_coverage_matrix_2026-09-26_001.md`](jamb_ccmas_rows_001_140_prior_artifact_coverage_matrix_2026-09-26_001.md), then reviewed its linked checkpoint 008, the existing [Accounting/Finance source-context reconciliation](jamb_accounting_finance_source_context_reconciliation_2026-09-25.md), the occurrence-key specification, and `jamb_offering_context_inventory_2026-09-25.json`. These already record both occurrences as PDF-cell verified, with one institution token each. Their FIN-only versus ACC/FIN curriculum discussion is not repeated here.

## Exact-cell check

Official JAMB brochure extracts checked **2026-09-26**:

| Preserved source occurrence | Exact JAMB cell / locator | Reconciliation |
|---|---|---|
| **MAP-003 — Administration** | [Administration degree brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf), printed p. 48: distinct `ACCOUNTING AND FINANCE — BCU` row. The preceding `ACCOUNTING` institution sequence ends with UYO, VISION-UNI, WELLSPRING, and WESTERN-DEL; BCU belongs to the next, separately headed row. | Confirms BCU alone in the Accounting and Finance cell checked; do not attach the preceding Accounting institutions to this row. |
| **MAP-004 — Social/Management Sciences** | [Social Sciences degree brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf), printed p. 577: `ACCOUNTING AND FINANCE — FEDOTUOKE`, with its own requirements in that row. | Confirms a distinct FEDOTUOKE occurrence under the Social Sciences brochure context; do not merge it with MAP-003. |

The exact cells agree with the existing source-confirmation record: Administration / BCU (`a5edd843e2f91232`) and Social/Management Sciences / FEDOTUOKE (`edb439100ecfa68a`). For these brochure editions, the source-cell question is resolved: the local two-occurrence inventory is supported, and no additional institution belongs in either exact row based on the checked cells.

## Proven versus still open

- **Already proven and reconfirmed:** two distinct JAMB source contexts; exact faculty/brochure, title, institution, and printed page for each. BCU is Administration; FEDOTUOKE is Social/Management Sciences. Preserve separate occurrence keys and do not transfer institutions between rows.
- **Precise remaining source-context limitation:** this confirms the cells in the cited JAMB brochure editions only. It does not establish whether a later/current-cycle JAMB edition changed either occurrence, nor whether the institutions currently deliver the same named degrees or course plans. No later-cycle JAMB cell was in the prior evidence set or checked in this focused reconciliation.
- **Explicitly not reopened:** which CCMAS courses belong to either occurrence, whether they share any course scope, and the prior FIN-only/ACC+FIN findings. Those remain as stated in the linked row-72 curriculum checkpoints.

No source records or shared mappings were edited.

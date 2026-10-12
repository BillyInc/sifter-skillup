# Lane 1 increment 021 — CCMAS Physiotherapy PST 325

**Access date:** 2026-09-29 (Africa/Lagos)  
**Scope:** CCMAS package 038, Allied Health Sciences → DPT Physiotherapy, exact course PST 325.  
**Mode:** source adjudication only; no shared/product ledger edited.

## Coverage check and source

The global table/ownership context was already reviewed in `ccmas_physiotherapy_source_audit_2026-09-28_001.md`; no detailed PST 325 source checkpoint or repair was found. Compared the official NUC [Allied Health Sciences CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf) global row (extracted PDF page 587, lines 22873–22875) with the exact DPT course block (pages 612–613, lines 23837–23867).

| Field | NUC source | Current local row | Finding |
|---|---|---|---|
| Owner / identity / structure | DPT Physiotherapy; PST 325; 300 level; 2 units; C; LH 30; PH dash | Same identity and structural values; PH null | Match; do not infer PH=0 from the dash. |
| Learning outcomes | Seven outcomes cover cryotherapy, hydrotherapy, indications/safety, techniques and pool safety | Seven local outcomes | Outcomes 1–6 match. Outcome 7 has `Allied Health Sciences 613 New` appended — **confirmed footer contamination**. |
| Course contents | Extends through cold-therapy indications/safety and hydrotherapy, aquatic therapy, pool equipment and purification | Summary is exactly 400 characters and ends mid-clause at “Clinical conditions for which” | **Confirmed truncation**; substantial source material is absent. |
| Provenance | Official NUC PDF and exact locators above | No item-level source locator/access date | Add source provenance during repair. |

## Local reconciliation handoff

Reconcile key `CCMAS:Allied Health Sciences:Physiotherapy:PST 325`: strip only the footer from outcome 7, replace the truncated summary with a concise complete source-faithful summary, and attach item-level provenance. Preserve the matching structure, seven outcome meanings, and null PH as the source dash. No product ledger was edited.

**Next cursor:** PST 326; first check current source files and checkpoints for prior detailed adjudication or repair.

Machine-readable evidence and regression coverage are in `jamb_ccmas_source_audit_lane_1_2026-09-28_021_physio_pst325.json` and `test_jamb_ccmas_source_audit_lane_1_2026_09_28_021.py`.

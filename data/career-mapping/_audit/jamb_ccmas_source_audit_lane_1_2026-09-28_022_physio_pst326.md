# Lane 1 increment 022 — CCMAS Physiotherapy PST 326

**Access date:** 2026-09-29 (Africa/Lagos)  
**Scope:** CCMAS package 038, Allied Health Sciences → DPT Physiotherapy, exact course PST 326.  
**Mode:** source adjudication only; no shared/product ledger edited.

## Coverage check and source

The general Physiotherapy audit reconciled package ownership and the global structure; searching the current lane/package audit files found no detailed PST 326 source checkpoint or repair. Compared the official NUC [Allied Health Sciences CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf) DPT global row (extracted PDF page 587, lines 22873–22875) with the detailed block (page 613, lines 23868–23889).

| Field | NUC source | Current local row | Finding |
|---|---|---|---|
| Owner / identity / structure | DPT Physiotherapy; PST 326, *Orthotics and Prosthetics*; 300 level; 2 units; C; LH 30; PH dash | Same identity and structural values; PH null | Match; the source dash does not imply numeric zero. |
| Learning outcomes | Seven outcomes span assistive devices, orthotics/prosthetics, biomechanics, amputee rehabilitation, patient education, device risks and daily-living aids | Seven local outcomes | Match in substance; no outcome contamination found. |
| Course contents | Continues from device care/maintenance through complications/contraindications and wheelchair/ADL aids | Local summary is exactly 400 characters and stops during maintenance | **Confirmed truncation**; later source topics are missing. |
| Provenance | Official NUC PDF and exact locators above | No row-level source locator/access date | Add supported provenance during repair. |

## Local reconciliation handoff

Reconcile key `CCMAS:Allied Health Sciences:Physiotherapy:PST 326`: replace the truncated summary with a complete concise source-faithful version and add item-level provenance. Preserve the seven matching outcomes and all structural values. No product ledger was edited.

**Next cursor:** PST 411; inspect the current row and newer checkpoints before starting because this is the next DPT 400-level course.

Machine-readable evidence and regression coverage are in `jamb_ccmas_source_audit_lane_1_2026-09-28_022_physio_pst326.json` and `test_jamb_ccmas_source_audit_lane_1_2026_09_28_022.py`.

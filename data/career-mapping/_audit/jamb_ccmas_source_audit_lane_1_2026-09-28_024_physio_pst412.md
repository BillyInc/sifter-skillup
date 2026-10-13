# Lane 1 increment 024 — CCMAS Physiotherapy PST 412

**Access date:** 2026-09-29 (Africa/Lagos)  
**Scope:** CCMAS package 038, Allied Health Sciences → DPT Physiotherapy, exact course PST 412.  
**Mode:** source adjudication only; no shared/product ledger edited.

## Coverage check and source

No detailed PST 412 source checkpoint or repair was found among the latest lane/package artifacts. Compared the official NUC [Allied Health Sciences CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf) DPT 400-level row (extracted PDF page 588, lines 22878–22881) with the exact course block (page 615, lines 23920–23945).

| Field | NUC source | Current local DPT row | Finding |
|---|---|---|---|
| Owner / identity / structure | DPT Physiotherapy; PST 412; 400 level; 2 units; C; LH 30; PH dash | Same owner/code/title/level/units/status/LH; PH null | Match; source dash is not numeric zero. |
| Learning outcomes | Six outcomes cover common conditions, orthopaedic assessment, decision-making, management, communication and clinical judgement | Six local outcomes | Outcomes 1–4 and 6 match. Outcome 5 contains appended `Allied Health Sciences 615 New` — **confirmed footer contamination**. |
| Course contents | Includes spinal disease beyond spondylosis, deformities, connective-tissue disorders, post-operative/soft-tissue care and fracture management | Summary is exactly 400 characters and ends at “cervical and lumbar spondylosis” | **Confirmed truncation**; substantial source content is omitted. |
| Provenance | Official NUC PDF and exact locators above | No item-specific source locator/access date | Add provenance during repair. |

## Local reconciliation handoff

Reconcile key `CCMAS:Allied Health Sciences:DPT Physiotherapy:PST 412`: remove only the footer from outcome 5, replace the truncated summary with a complete concise source-faithful summary, and add row-level provenance. Preserve all matching structural values and the six outcome meanings. No product ledger was edited.

**Next cursor:** DPT PST 413; inspect latest audit/repair evidence before proceeding.

Machine-readable evidence and regression coverage are in `jamb_ccmas_source_audit_lane_1_2026-09-28_024_physio_pst412.json` and `test_jamb_ccmas_source_audit_lane_1_2026_09_28_024.py`.

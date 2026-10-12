# Lane 1 increment 025 — CCMAS Physiotherapy PST 413

**Access date:** 2026-09-29 (Africa/Lagos)  
**Scope:** CCMAS package 038, Allied Health Sciences → DPT Physiotherapy, exact PST 413 clinical-rotation course.  
**Mode:** source adjudication only; no shared/product ledger edited.

## Prior coverage reused

The package checkpoint `ccmas_physiotherapy_source_audit_2026-09-28_001.md` already recorded the NUC global-table title, 2 units, PH 90, and missing local units/PH. I reused that work, confirmed the current row remains unrepaired, and checked the exact detailed block. No newer PST 413 detailed audit or repair was found.

## Source comparison

Compared the official NUC [Allied Health Sciences CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf) DPT table (extracted PDF page 588, lines 22882–22884) with the detail block (pages 615–616, lines 23946–23969).

| Field | NUC source | Current local DPT row | Finding |
|---|---|---|---|
| Identity / owner | DPT Physiotherapy, PST 413 | Same programme and code | Match. |
| Title | Table: *Physiotherapy Clinical Rotation in Orthopaedics and Traumatology*. Detail: *Physiotherapy Clinical Rotations in Orthopaedic and Traumatology*. | `Physiotherapy Clinical Rotations in Orthopaedic and Traumatology (2 Units` | Two issues: local trailing table-fragment contamination, plus a small title variation between NUC table and detail. Preserve both source forms for reconciliation. |
| Structural values | 400 level; 2 units; C; LH dash; PH 90 | 400; units/LH/PH null; C | Units and PH are **confirmed omissions**; null LH correctly represents the dash. |
| Learning outcomes | Five outcomes on assessment, reasoning, communication, patient management and professional judgement | Five local outcomes | Match in substance. |
| Course contents | Orthopaedic and trauma assessment/treatment, communication, soft-tissue and fracture/dislocation care, skin protection/repair | Summary is exactly 400 characters and cuts off during “communica…” | **Confirmed truncation**; later source content is missing. |
| Provenance | Official NUC PDF and both locators above | No item-level locator/access date | Add provenance during repair. |

## Local reconciliation handoff

Reconcile key `CCMAS:Allied Health Sciences:DPT Physiotherapy:PST 413`: set units to 2 and PH to 90, remove the appended `(2 Units` from the title, replace the truncated summary, and add item-level provenance. Preserve status C, null LH, all five matching outcomes, and both NUC title forms in the source-conflict note. No product ledger was edited.

**Next cursor:** PST 414; check the current source row and audit files before starting.

Machine-readable evidence and regression coverage are in `jamb_ccmas_source_audit_lane_1_2026-09-28_025_physio_pst413.json` and `test_jamb_ccmas_source_audit_lane_1_2026_09_28_025.py`.

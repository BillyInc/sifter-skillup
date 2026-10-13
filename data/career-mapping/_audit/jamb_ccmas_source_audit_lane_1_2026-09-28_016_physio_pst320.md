# Lane 1 increment 016 — CCMAS Physiotherapy PST 320

**Access date:** 2026-09-29 (Africa/Lagos)  
**Scope:** CCMAS package 038, Allied Health Sciences → DPT Physiotherapy, exact course PST 320.  
**Mode:** source adjudication only; no shared/product ledger edited.

## Prior coverage reused

The package checkpoint `ccmas_physiotherapy_source_audit_2026-09-28_001.md` already compared the DPT global table and identified the missing local practical-hours value for PST 320. I reused that adjudication rather than repeating it. This increment covers the still-open detailed course block and confirms the same PH discrepancy remains in the current local row.

## Detailed source comparison

The official NUC [Allied Health Sciences CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf) locates the global row on printed p. 587 (extracted lines 22860–22862) and the detailed course block on printed p. 610 (lines 23733–23766).

| Field | NUC source | Current local DPT row | Finding |
|---|---|---|---|
| Identity / owner | DPT Physiotherapy, PST 320, *Exercise Therapy II: Therapeutic Exercise Prescriptions* | Same code, title and package | Match. |
| Level / units / status / LH | 300 Level; 2 units; C; LH 15 | 300; 2; C; LH 15 | Match. |
| Practical hours | PH 45 in the global table and detailed heading | `ph` is null | **Confirmed defect**; set PH to 45 during repair. |
| Learning outcomes | Eight outcomes cover exercise techniques/regimens, exercise variables, condition-specific prescription, modalities, posture, strengthening, and programme design | Eight local outcomes | Match in substance; do not rewrite. |
| Course content | Includes exercise progression, treatment examples, posture correction, strengthening, equipment/relaxation and programme development | Local summary is exactly 400 characters and stops at “Maximum Oxygen” | **Confirmed truncation defect**; substantial source content is missing. |
| Provenance | Official NUC PDF and exact global/detail locators above | No item-level source locator/access date | Add supported provenance during repair. |

## Repair handoff

Set PH to 45, replace the truncated summary with a concise but complete source-faithful summary, and retain item-level provenance. Preserve the eight matching outcomes. No shared data was changed. This closes one detailed course block only.

Machine-readable evidence and regression coverage are in `jamb_ccmas_source_audit_lane_1_2026-09-28_016_physio_pst320.json` and `test_jamb_ccmas_source_audit_lane_1_2026_09_28_016.py`.

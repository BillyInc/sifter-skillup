# Lane 1 increment 017 — CCMAS Physiotherapy PST 321

**Access date:** 2026-09-29 (Africa/Lagos)  
**Scope:** CCMAS package 038, Allied Health Sciences → DPT Physiotherapy, exact course PST 321.  
**Mode:** source adjudication only; no shared/product ledger edited.

## Prior coverage reused

The package checkpoint `ccmas_physiotherapy_source_audit_2026-09-28_001.md` already compared the global row and found local PH missing. I reuse that table adjudication here; this increment checks the detailed course block and confirms the defect remains in the current row.

## Detailed source comparison

Compared the official NUC [Allied Health Sciences CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf) global structure (printed p. 587; extracted lines 22863–22865) with the course block (printed pp. 610–611; lines 23767–23782).

| Field | NUC source | Current local DPT row | Finding |
|---|---|---|---|
| Identity / owner | DPT Physiotherapy; PST 321, *Practical Exercise Therapy, Kinesiology & Cryotherapy* | Same package/code/title | Match. |
| Units / status / hours | 1 unit, C, PH 45; LH shown as dash | 1, C, PH null, LH null | PH is a **confirmed defect**; null LH is consistent with the dash. |
| Description | Practical demonstration of PST 316, 317, 318, 320 and 325 | `content_summary` is null | **Confirmed omission** of the source's practical-course description. |
| Learning outcomes | Ten outcomes covering exercise selection/progression, ROM measurement, ADL and gait skills, crutch gait, massage, mobilisation and spinal manipulation | Ten local outcomes | Substantively match overall; outcome 4 has the appended footer `Allied Health Sciences 612 New`, a **confirmed extraction defect**. |
| PST 318 cross-reference | Named in the PST 321 description | No PST 318 DPT row appears in the NUC 300-level table | **Unresolved source-internal conflict**. An exact-string search finds PST 318 only in this description. Do not invent a course or guess which code was intended. |
| Provenance | Official NUC PDF and locators above | No item-level source locator/access date | Add supported provenance during repair. |

## Repair handoff

Set PH to 45, remove only the footer appended to outcome 4, add a concise factual summary from the NUC demonstration description, and preserve source provenance. Keep the PST 318 reference unresolved pending clarification. No shared data was changed. This closes one detailed block only.

Machine-readable evidence and regression coverage are in `jamb_ccmas_source_audit_lane_1_2026-09-28_017_physio_pst321.json` and `test_jamb_ccmas_source_audit_lane_1_2026_09_28_017.py`.

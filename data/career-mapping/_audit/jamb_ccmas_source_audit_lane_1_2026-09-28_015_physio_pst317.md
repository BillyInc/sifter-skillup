# Lane 1 increment 015 — CCMAS Physiotherapy PST 317

**Access date:** 2026-09-29 (Africa/Lagos)  
**Scope:** CCMAS package 038, Allied Health Sciences → DPT Physiotherapy, exact course PST 317.  
**Mode:** source adjudication only; no shared/product ledger edited.

## Primary-source comparison

Compared the official NUC [Allied Health Sciences CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf) global structure (printed p. 587; extracted lines 22856–22860) with the detailed block (printed p. 609; extracted lines 23708–23732).

| Field | NUC source | Local Physiotherapy row | Finding |
|---|---|---|---|
| Owner / identity | DPT Physiotherapy; PST 317, *Exercise Therapy I: Introduction to Body Movements* | Same package/code and wording, but colon after “I” omitted | Only punctuation differs; non-substantive. |
| Level / units / status / lecture hours | 300 Level; 2 units; C; LH 30 | 300; 2; C; LH 30 | Match. |
| Practical hours | Source table shows a dash | Local `ph` is null | Consistent with the source; do not invent a zero unless the data contract explicitly requires it. |
| Learning outcomes | Six outcomes cover mechanics, movement, therapeutic exercise, breathing exercises, and patient assessment | Six outcomes present and substantively match | No outcome defect found. |
| Course content | Continues through muscle actions/control, exercise-therapy aims and techniques, breathing/chest physiotherapy measures, and patient assessment | Exactly 400 characters; ends mid-clause at “types of” | **Confirmed truncation defect**; source-backed topics are missing. |
| Provenance | Official NUC PDF and locators above | No item-level source locator/access date on the row | Add supported provenance during repair. |

## Repair handoff

Replace the truncated summary with a complete, concise source-faithful summary and preserve the NUC URL plus printed-page locator. Title punctuation normalization is optional and must not be treated as a substantive curriculum change. No shared ledger was changed. This closes one exact course row, not the 57-row package or Lane 1.

Machine-readable evidence and regression coverage are in `jamb_ccmas_source_audit_lane_1_2026-09-28_015_physio_pst317.json` and `test_jamb_ccmas_source_audit_lane_1_2026_09_28_015.py`.

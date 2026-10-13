# Lane 1 increment 014 — CCMAS Physiotherapy PST 316

**Access date:** 2026-09-29 (Africa/Lagos)  
**Scope:** CCMAS package 038, Allied Health Sciences → DPT Physiotherapy, exact course PST 316.  
**Mode:** source adjudication only; no shared/product ledger edited.

## Primary-source comparison

Compared the official NUC [Allied Health Sciences CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf) global structure (printed p. 587; extracted lines 22855–22856) with the detailed PST 316 block (printed pp. 608–609; extracted lines 23686–23707).

| Field | NUC source | Local Physiotherapy row | Finding |
|---|---|---|---|
| Owner / identity | DPT Physiotherapy; PST 316, *Massage* | Same package, code and title | Match; ownership is based on programme section, not code alone. |
| Level / units / status | 300 Level; 2 units; C | 300; 2; C | Match. |
| Contact hours | LH 15; PH 45 | LH 15; PH 45 | Match. |
| Learning outcomes | Seven source outcomes | Seven local outcomes | Outcomes 1–6 match in substance. Outcome 7 has the correct source wording followed by the extracted footer `Allied Health Sciences 609 New` — **confirmed contamination defect**. |
| Course content | The detailed block continues through massage for different conditions and populations, bandaging/support/oedema control, massage effects, and indications/contraindications | Local summary is exactly 400 characters and ends mid-word at `Ulc` | **Confirmed truncation defect**; the remainder of the source-backed content is absent. |
| Provenance | Official NUC PDF; global and detailed locators above | No item-level locator/access date in this course object | Record the URL and printed-page locators in the supported provenance representation during repair. |

## Repair handoff

For this row only: remove the page footer from outcome 7 without changing its meaning; replace the truncated summary with a complete, concise source-faithful summary; retain item-level provenance. No broader curriculum or domain inference is made. This closes one course block, not package 038 or Lane 1.

Machine-readable evidence and regression coverage are in `jamb_ccmas_source_audit_lane_1_2026-09-28_014_physio_pst316.json` and `test_jamb_ccmas_source_audit_lane_1_2026_09_28_014.py`.

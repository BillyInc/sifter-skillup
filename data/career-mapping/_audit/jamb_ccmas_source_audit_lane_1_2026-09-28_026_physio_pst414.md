# Lane 1 increment 026 — CCMAS Physiotherapy PST 414

**Access date:** 2026-09-29 (Africa/Lagos)  
**Scope:** CCMAS package 038, Allied Health Sciences → DPT Physiotherapy, exact course PST 414.  
**Mode:** source adjudication only; no shared/product ledger edited.

## Coverage check and source

The package/global table was covered earlier, but no exact detailed PST 414 audit or repair was found in the current lane/package artifacts. Compared the official NUC [Allied Health Sciences CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf) DPT table (extracted PDF page 588, lines 22885–22887) with the detailed block (page 616, lines 23970–23990).

| Field | NUC source | Current local row | Finding |
|---|---|---|---|
| Owner / identity / structure | DPT Physiotherapy; PST 414; 400 level; 2 units; C; LH 30; PH dash | Same fields; PH null | Match; null PH is the source dash. |
| Learning outcomes | Four outcomes cover selection, psychometric understanding, application and monitoring | Four local outcomes | Outcomes 1–3 match. Outcome 4 says “patents” in both source and local row. Since this appears contextually odd, preserve it as a **source anomaly candidate**; do not silently change official source wording. |
| Course contents | Includes health measurement, clinical instruments, physical fitness/lung/motor tests, psychometrics and quality-of-life measures | Exactly 400 characters; ends after “anthropometric variables,” | **Confirmed truncation**; several later topics are absent. |
| Provenance | Official NUC PDF and exact locators above | No item-level locator/access date | Add supported provenance during repair. |

## Local reconciliation handoff

Reconcile key `CCMAS:Allied Health Sciences:DPT Physiotherapy:PST 414`: complete the truncated summary and add item provenance. Preserve the structural data and matching first three outcomes. Leave “patents” explicitly flagged as source wording pending authoritative clarification; do not make an unsupported copy edit. No product ledger was edited.

**Next cursor:** PST 415; check current saved source audit and row before starting.

Machine-readable evidence and regression coverage are in `jamb_ccmas_source_audit_lane_1_2026-09-28_026_physio_pst414.json` and `test_jamb_ccmas_source_audit_lane_1_2026_09_28_026.py`.

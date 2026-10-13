# Lane 1 increment 019 — CCMAS Physiotherapy PST 323

**Access date:** 2026-09-29 (Africa/Lagos)  
**Scope:** CCMAS package 038, Allied Health Sciences → DPT Physiotherapy, exact course PST 323.  
**Mode:** source adjudication only; no shared/product ledger edited.

## Coverage check and source

The package-level Physiotherapy checkpoint exists, but a search of the saved lane/package source-adjudication artifacts found no detailed-block audit for PST 323. I did not repeat the global table review. I compared the NUC [Allied Health Sciences CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf) DPT 300-level row (extracted PDF page 587, lines 22869–22871) to the exact detailed block (page 612, lines 23809–23829).

| Field | NUC source | Current local row | Finding |
|---|---|---|---|
| Owner / identity / structure | DPT Physiotherapy; PST 323; 300 level; 2 units; C; LH 30; no practical hours shown | Same owner/code/level/units/status/LH; PH null | Match; the source dash does not justify inferring numeric zero. Title punctuation differs only (colon vs hyphen). |
| Learning outcomes | Five outcomes cover skin/local heat, electrotherapy guidance, heat-transfer/HFC, SWD/MWD, and safety | Five outcomes present | Substantive match, but outcome 4 has appended `Allied Health Sciences 612 New` — **confirmed footer contamination**. |
| Course contents | Includes HFC, then detailed short-wave and microwave diathermy topics | Summary is exactly 400 characters and ends after “Production of HFC.” | **Confirmed truncation**; the SWD and MWD topics are missing. |
| Provenance | Official NUC PDF and exact locators above | No item-level locator/access date | Add supported provenance during repair. |

## Local reconciliation handoff

Reconcile key `CCMAS:Allied Health Sciences:Physiotherapy:PST 323`: remove only the footer from outcome 4, replace the truncated summary using the source’s full course content, and add item-level provenance. Preserve the five substantive outcomes and all matching structural values. No product ledger was edited.

**Next cursor:** PST 324. Reuse its existing global-table finding for PH 45 and first check for a newer detailed checkpoint or repair.

Machine-readable evidence and regression coverage are in `jamb_ccmas_source_audit_lane_1_2026-09-28_019_physio_pst323.json` and `test_jamb_ccmas_source_audit_lane_1_2026_09_28_019.py`.

# Lane 1 increment 029 — CCMAS Physiotherapy PST 422

**Access date:** 2026-09-29 (Africa/Lagos)  
**Scope:** CCMAS package 038, Allied Health Sciences → DPT Physiotherapy, exact course PST 422.  
**Mode:** source adjudication only; no shared/product ledger edited.

## Coverage check and source

The package-level audit already recorded PST 422 as 2 units/PH 90 and local PH as missing. No exact PST 422 lane checkpoint or repair was found. I reused the table finding and compared it with the previously uncovered course detail in the official NUC [Allied Health Sciences CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf): table PDF p. 588, extracted lines 22893–22895; detailed block PDF p. 618, lines 24060–24083.

| Field | NUC source | Current local row | Finding |
|---|---|---|---|
| Identity/load | PST 422; 2 units; C; table PH 90 and LH dash | Same title/context and 2/C; LH null, PH null | LH matches the dash; **PH 90 is missing locally**. The table writes the suffix as `Neurology-1`, while detail/local use `Neurology-I`; record this source notation variation, not as a second course. |
| Learning outcomes | Four outcomes: neurological examination, reasoning, goal communication, management/evaluation | Four corresponding outcomes | Match in substance. Outcome 3 says “orthopaedic conditions” inside the Neurology rotation; the local row repeats the source phrase. **Flag as a NUC source anomaly candidate; do not silently change it.** |
| Course contents | Extends through patient conditions, goal setting and named neurological treatment approaches | Exactly 400 characters; ends mid-word at `confidentialit` | **Confirmed truncation**; complete the summary and retain item-level provenance. |

## Local reconciliation handoff

Reconcile key `CCMAS:Allied Health Sciences:DPT Physiotherapy:PST 422`: populate PH 90, replace the truncated summary with a complete source-faithful rendering, and attach the course-specific NUC locator/access date. Preserve all four outcomes while flagging outcome 3 for source-owner clarification; do not substitute “neurological” for “orthopaedic” without evidence. No shared product ledger was edited.

**Next cursor:** PST 424. PST 423 is skipped because its source-backed correction is already recorded; check exact PST 424 coverage before proceeding.

Machine-readable evidence and regression coverage are in `jamb_ccmas_source_audit_lane_1_2026-09-28_029_physio_pst422.json` and `test_jamb_ccmas_source_audit_lane_1_2026_09_28_029.py`.

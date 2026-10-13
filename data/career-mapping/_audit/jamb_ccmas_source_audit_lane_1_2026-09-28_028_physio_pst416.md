# Lane 1 increment 028 — CCMAS Physiotherapy PST 416

**Access date:** 2026-09-29 (Africa/Lagos)  
**Scope:** CCMAS package 038, Allied Health Sciences → DPT Physiotherapy, exact course PST 416.  
**Mode:** source adjudication only; no shared/product ledger edited.

## Coverage check and source

Increment 027's cursor pointed here. The package audit had already noted missing local contact hours, but the exact source evidence was rechecked because its earlier LH 30 assertion did not account for a conflicting global-table extraction. Compared the official NUC [Allied Health Sciences CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf) table (PDF p. 588, extracted lines 22889–22891) with the detailed PST 416 block (PDF p. 617, lines 24013–24036).

| Field | NUC source | Current local row | Finding |
|---|---|---|---|
| Identity/structure | DPT Physiotherapy; PST 416; 400 level; 1 unit; C | Same identity/title/level/unit/status | Match. |
| Contact hours | Global table extraction: `1 C 15`; detailed course heading: `LH 30` | LH and PH null | **Source conflict.** Keep hours unresolved; inspect original table layout or obtain NUC clarification before setting values. The detailed heading supports LH 30, but this conflicts with the table text extraction and the package note is not sufficient to silently resolve it. |
| Learning outcomes | Six infection-prevention and control outcomes | Six local outcomes | Match in substance. |
| Course contents | Includes applied microbiology, risk assessment, IPC strategies/plans, environmental hygiene and hand hygiene | Summary is exactly 400 characters and ends mid-word at `healthca` | **Confirmed truncation**; repair summary and add row-specific provenance. |

The global table extraction fails to preserve the last two hour columns securely enough to decide whether the `15` belongs to LH or PH. The detailed heading explicitly labels LH 30. Until the PDF table is visually resolved or the source owner clarifies it, do not choose either value or infer practical hours.

## Local reconciliation handoff

Reconcile key `CCMAS:Allied Health Sciences:DPT Physiotherapy:PST 416`: replace the truncated summary with a complete source-faithful rendering and attach exact item provenance. Preserve the six matching outcomes. Hold LH/PH unchanged pending source-conflict resolution. No shared product ledger was edited.

**Next cursor:** PST 422. PST 421 is intentionally skipped because its prior source-backed repair is already recorded; check for an exact PST 422 checkpoint/repair before source work.

Machine-readable evidence and regression coverage are in `jamb_ccmas_source_audit_lane_1_2026-09-28_028_physio_pst416.json` and `test_jamb_ccmas_source_audit_lane_1_2026_09_28_028.py`.

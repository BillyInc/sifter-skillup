# Lane 1 increment 027 — CCMAS Physiotherapy PST 415

**Access date:** 2026-09-29 (Africa/Lagos)  
**Scope:** CCMAS package 038, Allied Health Sciences → DPT Physiotherapy, exact course PST 415.  
**Mode:** source adjudication only; no shared/product ledger edited.

## Coverage check and source

The package-level table/ownership context exists, but no detailed PST 415 checkpoint or repair was found in current lane/package artifacts. Compared the official NUC [Allied Health Sciences CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf) DPT row (extracted PDF page 588, lines 22888–22889) with the course block (page 616, lines 23992–24012).

| Field | NUC source | Current local row | Finding |
|---|---|---|---|
| Owner / identity / structure | DPT Physiotherapy; PST 415; 400 level; 2 units; C; LH 30; PH dash | Same structural values; PH null | Match; source dash is not zero. |
| Learning outcomes | Six outcomes cover pain mechanisms, modulation, clinical judgement and patient care | Six local outcomes | Match in substance. |
| Course contents | Continues beyond pain scales to pharmacologic/non-pharmacologic treatment and the physiotherapist’s holistic role | Summary is exactly 400 characters and ends mid-phrase at “unidirectional and multi” | **Confirmed truncation**. |
| Source wording anomaly | NUC says “Pain as a fifth vital signs” | Local row repeats the wording | Candidate source typo, not a local deviation; retain the observation and avoid silently changing the source-derived data. |
| Provenance | Official NUC PDF and exact locators above | No item-level locator/access date | Add provenance during repair. |

## Local reconciliation handoff

Reconcile key `CCMAS:Allied Health Sciences:DPT Physiotherapy:PST 415`: complete the source-faithful summary and attach item provenance. Preserve all six matching outcomes and structural values. Keep the anomalous source phrase flagged; do not silently rewrite it. No product ledger was edited.

**Next cursor:** PST 416; check current artifacts and data first.

Machine-readable evidence and regression coverage are in `jamb_ccmas_source_audit_lane_1_2026-09-28_027_physio_pst415.json` and `test_jamb_ccmas_source_audit_lane_1_2026_09_28_027.py`.

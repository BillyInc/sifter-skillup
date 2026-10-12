# Lane 1 increment 023 — DPT Physiotherapy PST 411 (Women’s Health)

**Access date:** 2026-09-29 (Africa/Lagos)  
**Scope:** CCMAS package 038, Allied Health Sciences → DPT Physiotherapy, exact PST 411 Women’s Health occurrence.  
**Mode:** source adjudication only; no shared/product ledger edited.

## Preserve the distinct same-code course contexts

The package-level checkpoint `ccmas_physiotherapy_source_audit_2026-09-28_001.md` already warns that PST 411 appears with two titles and owners and that code-only outcome attachment is unsafe. This increment adjudicates the DPT *Physiotherapy in Women’s Health* row only. The same NUC document separately lists PST 411 *Research Methods in Medical Rehabilitation* under Speech-Language Therapy (detailed block, extracted PDF pp. 759–760, lines 29653–29688). These are distinct curriculum courses, not duplicate course identities; do not merge them or move outcomes by code alone.

## DPT source comparison

Compared the official NUC [Allied Health Sciences CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf) DPT 400-level row (extracted PDF page 588, lines 22876–22878) with the DPT PST 411 detail (page 614, lines 23891–23919).

| Field | DPT NUC source | Current local DPT row | Finding |
|---|---|---|---|
| Owner / identity | DPT Physiotherapy, PST 411, *Physiotherapy in Women’s Health* | Exact DPT title/context | Match. |
| Structural fields | 400 level; 2 units; C; LH 30; PH dash | 400; 2; C; LH 30; PH null | Match; null PH represents the source dash. |
| Learning outcomes | Seven outcomes on women’s-health exercise, conditions, care, precautions, judgement and management | Seven DPT outcomes | Match against the DPT block. Keep separate from the 12 SLT Research Methods outcomes. |
| Course contents | Pregnancy/childbirth, labour and puerperium complications, antenatal and gynaecological conditions, and physiotherapy interventions | Summary is exactly 400 characters and ends mid-word during “cephalopelvic dispropor” | **Confirmed truncation**; further source content is missing. |
| Provenance | Official NUC PDF and exact DPT locators above | No item-level locator/access date | Add provenance during repair. |

## Local reconciliation handoff

Reconcile exact key `CCMAS:Allied Health Sciences:DPT Physiotherapy:PST 411:Physiotherapy in Women's Health`: replace the truncated DPT summary and attach its specific NUC locator. Preserve DPT’s seven matching outcomes, and leave the separate SLT PST 411 Research Methods occurrence intact. No product data was edited.

**Next cursor:** DPT PST 412; check for newer source coverage before beginning.

Machine-readable evidence and regression coverage are in `jamb_ccmas_source_audit_lane_1_2026-09-28_023_physio_pst411_womens_health.json` and `test_jamb_ccmas_source_audit_lane_1_2026_09_28_023.py`.

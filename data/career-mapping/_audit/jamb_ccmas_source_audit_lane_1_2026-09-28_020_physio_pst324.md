# Lane 1 increment 020 — CCMAS Physiotherapy PST 324

**Access date:** 2026-09-29 (Africa/Lagos)  
**Scope:** CCMAS package 038, Allied Health Sciences → DPT Physiotherapy, exact course PST 324.  
**Mode:** source adjudication only; no shared/product ledger edited.

## Prior coverage reused

The existing package checkpoint `ccmas_physiotherapy_source_audit_2026-09-28_001.md` already adjudicated the global-table load: 1 unit, C, lecture-hour dash and PH 45. I reused this and confirmed the local PH is still null. No earlier detailed-block audit for PST 324 was found.

## Detailed source comparison

Compared the official NUC [Allied Health Sciences CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf) DPT 300-level row (extracted PDF page 587, lines 22872–22873) with the detailed block (page 612, lines 23830–23836).

| Field | NUC source | Current local row | Finding |
|---|---|---|---|
| Identity / owner | DPT Physiotherapy; PST 324, *Practical Electrotherapy II* | Same package, code and title | Match. |
| Level / units / status | 300; 1 unit; C | 300; 1; C | Match. |
| Contact hours | LH dash; PH 45 | LH null; PH null | LH null matches source dash; **PH=45 is a confirmed omission**. |
| Course description | Practical demonstration of PST 322 and PST 323 | `content_summary` is null | **Confirmed omission**; preserve these exact prerequisites/cross-references. |
| Learning outcomes | Two outcomes: selecting/applying stimulating currents and electro-diagnosis | Two local outcomes | Match; no unsupported additions needed. |
| Provenance | Official NUC PDF and exact locators above | No item-level locator/access date | Add supported provenance during repair. |

## Local reconciliation handoff

Reconcile key `CCMAS:Allied Health Sciences:Physiotherapy:PST 324`: set PH to 45, add a concise summary preserving the source’s practical-demonstration link to PST 322/323, and retain item provenance. Preserve null LH as the source dash and keep both matching outcomes. No product ledger was edited.

**Next cursor:** PST 325; first check its detailed checkpoint and current row, reusing any table adjudication already saved.

Machine-readable evidence and regression coverage are in `jamb_ccmas_source_audit_lane_1_2026-09-28_020_physio_pst324.json` and `test_jamb_ccmas_source_audit_lane_1_2026_09_28_020.py`.

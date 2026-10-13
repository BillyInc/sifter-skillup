# Lane 1 increment 018 — CCMAS Physiotherapy PST 322

**Access date:** 2026-09-29 (Africa/Lagos)  
**Scope:** CCMAS package 038, Allied Health Sciences → DPT Physiotherapy, exact course PST 322.  
**Mode:** source adjudication only; no shared/product ledger edited.

## Prior coverage reused

The package checkpoint `ccmas_physiotherapy_source_audit_2026-09-28_001.md` already established the global-table values and missing local units/LH. I reused that table finding and confirmed the current row remains unrepaired; this increment checks the detailed course block rather than repeating the structural audit.

## Detailed source comparison

Compared the official NUC [Allied Health Sciences CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf) global structure (printed p. 587; extracted lines 22866–22868) with the detailed block (printed p. 611; lines 23783–23808).

| Field | NUC source | Current local row | Finding |
|---|---|---|---|
| Owner / identity | DPT Physiotherapy, PST 322, *Electrotherapy II: Thermal & Radiation Agents in Physiotherapy* | Same package/code; title has ` (2 Units` appended | **Confirmed extraction contamination** in title. NUC table/detail differ only in colon-versus-hyphen punctuation. |
| Units / status / LH | 2 units, C, LH 30 | Units and LH null; status C | **Confirmed omissions** for units and lecture hours. |
| Practical hours | Dash in the global table | Local PH null | Match the source representation; do not infer numeric zero. |
| Learning outcomes | Six outcomes cover heating/heat transfer, thermotherapy, paraffin wax, radiation, ultrasound and laser | Six local outcomes | Match in substance; no footer contamination found. |
| Course content | Continues from infrared through ultraviolet, ultrasound and laser therapy | Exactly 400 characters; ends at `Infra Red Rad` | **Confirmed truncation**; three substantive source topics are missing. |
| Provenance | Official NUC PDF and exact locators above | No item-level locator/access date | Add supported provenance during repair. |

## Local reconciliation handoff

Reconcile key `CCMAS:Allied Health Sciences:Physiotherapy:PST 322`: repair the title fragment, set units to 2 and LH to 30, replace the truncated summary, and add item-level provenance. Preserve status C, null PH (source dash), and all six matching outcomes. No product ledger changed in this audit.

**Next cursor:** Physiotherapy PST 323, unless a newer checkpoint or repair has already adjudicated it.

Machine-readable evidence and regression coverage are in `jamb_ccmas_source_audit_lane_1_2026-09-28_018_physio_pst322.json` and `test_jamb_ccmas_source_audit_lane_1_2026_09_28_018.py`.

# Lane 1 increment 011 — Physiotherapy PST 313 context reconciliation

**Access date:** 2026-09-28 (Africa/Lagos)  
**Scope:** CCMAS package index 038, Allied Health Sciences → Physiotherapy; every local `PST 313` row compared across programme ownership, structure and detail.  
**Disposition:** one correct Physiotherapy course row, two cross-programme rows inside the local Physiotherapy package, and a source-internal title variation. The complete package remains open. Audit only; no shared product data was edited.

## Source and exact contexts

Used the official NUC [Allied Health Sciences CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf). The PDF distinguishes three `PST 313` identities by programme section:

| NUC programme section | Global structure | Detailed block | Local Physiotherapy package result |
|---|---|---|---|
| B.Aud Audiology | *Introductory Pathology*, 1 unit, C, LH 15, printed p. 34 | *Introductory Pathology*, six outcomes, printed pp. 55–56 | The local package contains this exact 1-unit row, but it belongs to the Audiology section, not the DPT Physiotherapy PST 313 entry. Its summary is truncated at 400 characters. **Confirmed package-ownership defect.** |
| DPT Physiotherapy | *Electrotherapy I: Direct and Low Frequency Currents*, 2 units, C, LH 30, printed p. 587 | *Electrotherapy I- Direct & Low Frequency Currents II*, seven outcomes, printed p. 607 | The local 2-unit Electrotherapy row matches the DPT structure and detailed outcomes. The global table and detailed header vary in title; preserve this as an NUC source conflict, not a local title defect. Its summary is truncated at 400 characters. |
| B.SLT Speech-Language Therapy | *Pathology Rehabilitation Professionals*, 2 units, C, LH 30, printed p. 736 | *Pathology for Rehabilitation Professionals*, six outcomes, printed pp. 756–757 | The local package contains this exact 2-unit pathology row, but it belongs to the B.SLT section, not the DPT Physiotherapy PST 313 entry. Its summary is truncated at 400 characters. **Confirmed package-ownership defect.** |

The repeated code alone is not a safe join key: course identity requires discipline, programme section, code and title together. For the DPT row, local units/status/hours and all seven outcomes match the detailed block. For the other two rows, the source sections establish different owners even though their code prefix is `PST`.

## Remaining boundary

This closes only the repeated-code ownership/detail question for PST 313. Physiotherapy still has 57 local rows and the complete package audit remains open; the next DPT-owned course after the earlier checkpoint must be audited by its exact programme/code/title context. The paired JSON records source URLs, printed locators, outcomes counts, row comparisons, dispositions and the no-product-edit invariant. Regression coverage is `test_jamb_ccmas_source_audit_lane_1_2026_09_28_011.py`.

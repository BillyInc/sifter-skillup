# Lane 1 increment 012 — CCMAS Physiotherapy PST 314

**Access date:** 2026-09-28 (Africa/Lagos)  
**Scope:** CCMAS package 038, Allied Health Sciences → DPT Physiotherapy, exact course PST 314.  
**Mode:** source audit only; no shared/product ledger edited.

## Primary-source comparison

Compared the official NUC [Allied Health Sciences CCMAS (2023)](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf) global course table (printed p. 587; PDF lines 22843–22855) with the detailed PST 314 block (printed p. 608; PDF lines 23646–23655).

| Field | NUC source | Local Physiotherapy row | Finding |
|---|---|---|---|
| Programme / identity | DPT Physiotherapy; PST 314, *Practical Electrotherapy I* | Same programme, code, and title | Match; not joined on code alone. |
| Level / units / status | 300 Level; 1 unit; C | 300; 1; C | Match. |
| Contact hours | No lecture hours; PH 45 | LH null; PH null | **Confirmed defect:** local practical hours are missing; source supports PH=45. |
| Course description | “This is practical demonstration of the course PST 314.” | `content_summary` null | **Confirmed omission:** restore a faithful student-facing summary from this short source description; do not invent extra content. |
| Learning outcomes | Four outcomes: prepare tray/patient/machine; communicate with simulated patients; apply modalities; document treatment | Four outcomes present; fourth ends with `Allied Health Sciences 608 New` | **Confirmed extraction contamination:** strip the page footer only; preserve the outcome sentence. |
| Provenance | Official NUC PDF; table and detailed locators above; accessed 2026-09-28 | No item-level locator/access date recorded in this row | **Provenance gap:** retain the PDF URL, locators, and access date during repair where the schema supports them. |
| Source conflict | Global table and detailed header agree on code, title, units/status and PH allocation | — | None found. |

## Repair handoff

Main-agent pointer: repair only the Physiotherapy-owned PST 314 row after reconciling the latest ledger. Set PH to 45; remove only `Allied Health Sciences 608 New` from outcome 4; add a faithful summary of the source's practical-demonstration description; preserve provenance. Do not infer a broader syllabus.

JSON evidence and regression test accompany this increment. This closes one detailed course block, not package 038 or the full Lane 1 range.

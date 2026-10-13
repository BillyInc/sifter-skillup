# CCMAS Pharmacology source audit — increment 001

**Access date:** 2026-09-28 (Africa/Lagos)  
**Disposition:** source comparison complete for Pharmacology package; defects and one source-internal conflict documented. **Audit only:** no CCMAS JSON, seed, or downstream mapping edits.  
**Scope:** `data/career-mapping/ccmas/allied_health.json` → Allied Health Sciences / Pharmacology (PHA).

## Primary evidence

- NUC, *Allied Health Sciences CCMAS 2023*: <https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf>
- Programme overview/objectives and graduation requirements: printed pp. 547–550.
- Pharmacology global course structure: printed pp. 549–550 (100-level, 200-level, 300-level, 400-level tables; 22, 23, 24, and 17 listed units respectively).
- Pharmacology course outcomes and contents: printed pp. 567–579; minimum academic standards/equipment starts p. 580.
- Cross-programme identity checks: Physiotherapy PHA 201, printed pp. 33 and 46; Medical Laboratory Science PHA 301, printed pp. 330–331 and 354; Nursing PHA 301/302, printed pp. 370 and 389–395; Speech-Language Therapy PHA 301/312, printed pp. 736–737 and 755.

The audit compared the complete PHA 301–313 and PHA 401–409 course sequence against the global structure and the corresponding source course blocks, including outcomes and contents. Shared 100-/200-level courses are part of the global structure and must not be mistaken for PHA-coded major-course blocks.

## Findings

| ID | Finding | Source evidence and local comparison | Classification |
|---|---|---|---|
| PHA-AUD-001 | Package contains cross-programme PHA courses. | Official Pharmacology structure lists PHA 301–313 at 300 level and PHA 401–409 at 400 level, but no PHA 201. Local package has 31 rows and includes two PHA 201 General Pharmacology rows (1 and 2 units), PHA 312 Introductory Pharmacology (1 unit), PHA 301 Pharmacodynamics and Chemotherapy I, PHA 302 Pharmacodynamics and Chemotherapy II, and PHA 312 Pharmacology for Medical Rehabilitation Professionals. These titles/contexts occur in other programme blocks (Physiotherapy pp. 33/46 and 78/90; Nursing pp. 370/389–395; Speech-Language Therapy pp. 736–737/755). This is package ownership contamination, not evidence that the separate programmes should be merged into Pharmacology. | Confirmed defect |
| PHA-AUD-002 | Repeated code rows and incompatible PHA 301/302 variants. | Local row counts by repeated code: PHA 301 = 5, PHA 302 = 2, PHA 312 = 3, PHA 201 = 2. The Pharmacology course table/source blocks specify one PHA 301 (1 unit), one PHA 302 (1 unit), and one PHA 312 (SIWES, 3 units); alternate titles/units correspond to other programmes or duplicate extraction. | Confirmed defect |
| PHA-AUD-003 | Course table fields are missing or disagree with the official structure. | Local PHA 303 and 304 have null units/LH although the source specifies 1 C, LH 15 each; PHA 310 has null units/LH/PH although source specifies 2 C, LH 15, PH 45; PHA 312 SIWES lacks PH 135; PHA 402/403 lack source hour values; PHA 407 lacks PH 180. PHA 401 is an explicit source-internal conflict: global table p. 550 says 2 C, LH 15, PH 45, while course block p. 574 says 2 Units C, LH 30 (local has LH 30). Preserve this as conflict pending source adjudication; do not choose a value silently. PHA 405 has PH 45 locally and in its detailed source block p. 577, while the global table p. 550 omits PH (another table/detail discrepancy). | Confirmed defects; source conflict for PHA 401 and PHA 405 |
| PHA-AUD-004 | Course outcomes include extraction-boundary contamination. | Local outcome arrays for PHA 301, 303, 310, 312, 401, 403, 406 and 409 contain page/header/equipment or following-section text (e.g. “Allied Health Sciences”, “Minimum Academic Standards”, “Microdynamometers”, “ECG/EEG”). NUC organizes PHA 409 outcomes as two learning outcomes on p. 579 and equipment under Minimum Academic Standards on p. 580; the local PHA 409 outcomes incorrectly continue into the equipment list. | Confirmed defect |
| PHA-AUD-005 | Course-content summaries are systematically truncated. | 26 of 31 local `content_summary` values are exactly 400 characters. PHA 301 ends mid-phrase (“Measure…”) while the official block continues with measurement of pharmacokinetic parameters; other 400-character PHA summaries likewise require full-block comparison/recovery rather than being treated as complete. | Confirmed defect |
| PHA-AUD-006 | Package count semantics need explicit validation against source structure. | Local package has 31 course rows, while the programme-specific official PHA major-course sequence contains 22 distinct codes (PHA 301–313 and PHA 401–409). The larger official global table also includes shared 100-/200-level foundational courses. The observed 31-row count therefore cannot serve as a verified package count until course ownership and the distinction between global shared structure and PHA-owned detailed blocks are reconciled. | Confirmed defect / count not validated |

## Search/review log

1. Query: NUC official Allied Health Sciences CCMAS 2023 PDF; exact title plus “Pharmacology”, “PHA 301”, “PHA 302”, “PHA 312”, and “PHA 409”. Source: URL above. Locators: printed pp. 547–580; course block locators also checked at the alternate programme pages listed above. Accessed 2026-09-28.
2. Compared global structure against all local Pharmacology rows, including duplicate-code groups, units/status/LH/PH, outcomes and summary lengths. Local profile: 31 rows; 23 distinct course codes; 26 summaries at exactly 400 characters; 5 PHA 301, 2 PHA 302, 3 PHA 312 and 2 PHA 201 rows.
3. Confirmed cross-programme ownership using the exact official block titles and programme sections. No unsupported source rows were promoted, removed, or rewritten.

## Completion and next action

Pharmacology is source-compared as one package in the selected-79 audit (**1/79**). Its correctness is not approved: findings above remain open for a later fix pass. The 22-code count is the distinct programme-specific major sequence; the source's shared foundational courses are recorded separately and must be reconciled consistently across the catalogue. Continue next with Physiotherapy, checking its already-reviewed PST 421/PST 423/PST 503 issues only for package-level contradictions rather than repeating those closed micro-adjudications.

No downstream domain/subgroup/role links were inspected. No curriculum data or seed was changed.

# CCMAS Physiotherapy source audit — increment 001

**Access date:** 2026-09-28 (Africa/Lagos)  
**Disposition:** source comparison in progress; structural comparison completed, with ownership and course-load defects recorded. Do not count the package complete until all 48 in-scope course detail blocks (outcomes and contents) are reconciled. **Audit only:** no CCMAS data, seed, JAMB mapping, or downstream edits.  
**Scope:** `data/career-mapping/ccmas/allied_health.json` → Physiotherapy / Doctor of Physiotherapy (DPT).

## Primary source and locators

- National Universities Commission, *Core Curriculum and Minimum Academic Standards (CCMAS) for Nigerian Universities: Allied Health Sciences* (2023): <https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf>
- Physiotherapy identity/degree structure: printed pp. 583–586.
- DPT global course structure and course tables: printed pp. 587–590 (PDF text layer around pages 587–589).
- DPT course outcomes and contents: printed pp. 590 onward; the PST 421 block is pp. 617–619 and PST 423 is pp. 619–620.
- Cross-programme contamination locators: Audiology course tables/outcomes printed pp. 34–35 and 54–55; Speech-Language Therapy tables/outcomes printed pp. 736–738 and 753 onward.

## Structure and ownership findings

The local Physiotherapy package contains **57 rows**, but the NUC DPT structure has **48 Physiotherapy-owned PST course rows** across 300–600 levels: 14 at 300, 12 at 400, 12 at 500, and 10 at 600. The remaining nine local rows are source-valid courses from other programme contexts and must not be treated as DPT-owned merely because they have a `PST` code:

| Local row(s) | NUC source context | Evidence / disposition |
|---|---|---|
| PST 201 (1-unit) and PST 202 (1-unit) | Audiology | The Audiology section's course structure and course blocks contain these rehabilitation foundation courses; the DPT course table instead lists PHY 201/202 and does not list PST 201/202. Foreign-to-DPT ownership. |
| PST 311 “Programming for Rehabilitation” (1-unit) and PST 313 “Introductory Pathology” (1-unit) | Audiology | Printed p. 34, lines/source text around the Audiology 300-level table; the matching outcomes are in pp. 54–55. These are not the DPT PST 311 Introduction to Physiotherapy Profession or PST 313 Electrotherapy I. |
| PST 201 “Rehabilitative Physics” (2-unit), PST 202 (2-unit), PST 311 “Programming for Rehabilitation Professionals” (2-unit), PST 313 “Pathology for Rehabilitation Professionals” (2-unit), PST 411 “Research Methods in Medical Rehabilitation” (2-unit) | Speech-Language Therapy | Printed pp. 736–738 and 753 onward. The identical course codes/titles belong to the Speech-Language Therapy curriculum context; DPT does not list PST 201/202 or these PST 311/313/411 variants. |

The nine rows above are confirmed package-ownership contamination, not unsupported courses. Preserve their source programme context if used elsewhere; this audit does not authorize moving or deleting them. The other 48 rows cover the 48 PST courses in the DPT structure. The known previously corrected PST 421, PST 423, and PST 503 micro-issues were not reopened; PST 503 is absent from the current Physiotherapy package after the earlier ownership repair.

The checked-in outcome extractor (`data/career-mapping/_extract_skills.py`) attaches outcomes by normalized course code alone (`norm(code)`), not by programme/source occurrence. This is unsafe for repeated codes with different programme-specific meanings. In the current Physiotherapy package, PST 311 occurs three times with three titles and outcome-list lengths 5, 5, and 11; PST 313 occurs three times with three titles and lengths 6, 7, and 6; PST 411 occurs twice with different titles and lengths 7 and 12. Those collisions require source-block-level outcome reconciliation; code equality is not evidence that outcomes can be shared. The course-specific outcome pass remains open.

## Course-table reconciliation findings

The official DPT table confirms the following local metadata defects or omissions (printed pp. 587–589):

- `PST 314`, `PST 321`, and `PST 324`: official PH is 45 for each; local PH is null.
- `PST 320`: official load is 2 units, LH 15, PH 45; local PH is null.
- `PST 322`: official title is **Electrotherapy II: Thermal & Radiation Agents in Physiotherapy**, 2 units, LH 30; local title is cut off after “(2 Units” and units/LH are null.
- `PST 413`: official title is **Physiotherapy Clinical Rotation in Orthopaedics and Traumatology**, 2 units, PH 90; local title is malformed/truncated after “(2 Units”, and units/PH are null.
- `PST 416`: official 1 unit, LH 30; local LH is null.
- `PST 422`: official 2 units, PH 90; local PH is null.
- `PST 424`: official 2 units, LH 30, PH 45; local PH is null.
- `PST 425`: official 2 units, LH 15, PH 15; local PH is 45.
- `PST 512`: official 2 units, PH 90; local PH is null.
- `PST 516`: official title is **Ergonomics and Occupational Health Physiotherapy**; local title says “Ergonomics and Workplace Physiotherapy” (substantive title mismatch to verify against its detailed course block).
- `PST 523`: official 2 units, LH 30; local lecture hours are null.
- `PST 601`: official 3 units, PH 135; local PH is null.
- `PST 612`: official 2 units, PH 90; local units/PH are null.
- `PST 613`: official title **Principles of Management and Administration for Physiotherapy**, 2 units, LH 30; local title is truncated after “(2 Units” and units/LH are null.
- `PST 621`: official 2 units, LH 20, PH 45; local records LH 30 and no PH.
- `PST 622`: official 2 units, PH 90; local PH is null (local empty content is not by itself called a defect until the detailed source block is checked).
- `PST 624` and `PST 625`: official LH is 15 for each; local records LH 30 for both.

Rows with null hours are not all defects: where the official table itself uses a dash, null remains a candidate representation, not a confirmed error. Clinical examination rows PST 426, PST 526, and PST 623 are explicitly shown without a conventional course-hour load; do not infer one.

## Course-detail/provenance checks still required

- The global table identity count and listed ownership have been reconciled, but course outcomes and detailed contents still need a complete row-by-row pass before this package can be closed.
- `PST 511` local outcomes count is 1; NUC's detailed block (printed p. 620) lists two learning outcomes. This is a confirmed missing-outcome candidate to verify against the full local text in the next increment.
- `PST 522` has no local outcomes or content; verify its detailed source section before deciding whether this is a genuine extraction gap or the CCMAS source provides no separate block.
- Most local summaries have exactly 400 characters. The checked-in extractor (`data/career-mapping/_add_prog.py`) explicitly caps `content_summary` at `content[:400]`; therefore these summaries are known to be truncated representations, not full-source transcriptions. Record this as a systematic extraction/provenance limitation, not as proof that each course's source coverage is substantively wrong.
- Only PST 421 and PST 423 currently carry item-specific source URL/locator/access-date fields in this package; source provenance for the other package rows is absent locally. Retain course-specific locators in the audit ledger while completing the source pass.

## Next bounded increment

Continue the detailed DPT course-block comparison with 300/400-level PST course outcomes and contents. Capture each confirmed missing/truncated/wrong field against its printed NUC locator. Then complete 500/600-level blocks and verify the source package/course counts before marking Physiotherapy complete. No edits to `allied_health.json` or downstream mappings in this phase.

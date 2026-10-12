# Lane 1 checkpoint 002 — CCMAS Accounting package

**Access date:** 2026-09-28 (Africa/Lagos)  
**Package:** deterministic package index 001, Administration and Management → Accounting (`administration_management.json`).  
**Status:** partial source comparison; package remains open. Audit-only; no source JSON, mapping, or seed changed.

## Primary-source comparison

NUC’s official [Administration and Management CCMAS PDF](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf) lists the Accounting global course structure on printed pp. 31–32 (PDF text pages P30–P31). I compared all 31 local course identities against the global tables at those pages. The source and local package both contain the same 31 course codes, so the code/count structure matches. This does not establish that all detailed course outcomes/content are correct.

## Confirmed data defects and source conflict

The global table shows 18 ACC-coded courses with explicit lecture/practical allocations. In the local package, those 18 rows instead store `lecture_hours: 45` and no practical-hours value. The source table specifies 30 lecture + 45 practical for ACC 201, 202, 204, 301–303, 305–308, 311, and 401–405; 30 lecture only for ACC 203; and 15 lecture + 45 practical for ACC 206. This is a confirmed extraction-field defect, not a judgment about curriculum content.

ACC 101 is a source conflict: the global structure on printed p. 31 gives 30 lecture + 45 practical, while the detailed block on printed p. 35 gives 30 lecture + 15 practical. The local row matches the global table. Preserve both source statements until their precedence is established; do not change this row based on assumption.

The course-level detail has not yet been compared across all 31 rows. In particular, ACC 490 has no local outcomes, but I have not yet verified whether the source supplies a discrete outcome block or intentionally relies on project requirements. Therefore it remains unresolved, not a confirmed defect.

The detailed source blocks also confirm four outcome mismatches: ACC 101 and ACC 102 local outcome lists do not faithfully match their NUC blocks (printed pp. 35–36); ACC 203 carries cost-accounting outcomes instead of governance/ethics outcomes (p. 39); and ACC 206 carries corporate-finance outcomes instead of accounting-lab outcomes (p. 39). For ACC 203 and ACC 206, the local content summaries describe the expected course while the outcome arrays describe another subject, indicating field-level course-content/outcome misalignment. Exact evidence is recorded in the JSON ledger. These are confirmed defects; no repair was made.

## Coverage and next step

- Course identity/count comparison: **31/31**.
- Confirmed contact-hour field defects: **18 course rows**.
- Confirmed learning-outcome defects: **4 course rows** (ACC 101, ACC 102, ACC 203, ACC 206).
- Source conflict: **ACC 101 practical hours**.
- Detailed course contents/outcomes: **not yet fully audited**; Accounting does **not** count as a complete package.
- The full row-level evidence is in `jamb_ccmas_source_audit_lane_1_2026-09-28_002_accounting.json`.

Continue by verifying Accounting course-detail blocks and provenance, then move to package indices 002–010. For JAMB 001–140, reconcile individual current occurrence IDs against the earlier source checkpoints and do not equate their local extracted-text checks with exact visual PDF-cell verification.

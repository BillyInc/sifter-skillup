# Local reconciliation — CCMAS PST 422 (2026-09-29)

Source-audit increment: `jamb_ccmas_source_audit_lane_1_2026-09-28_029_physio_pst422.md` and its JSON evidence.

Primary source: NUC, *Allied Health Sciences CCMAS 2023*, <https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf>, accessed 2026-09-29. Global Physiotherapy course table: printed p. 588; detailed PST 422 block: printed p. 618.

Reconciled `CCMAS:Allied Health Sciences:Physiotherapy:PST 422` in `data/career-mapping/ccmas/allied_health.json`:

- Set PH to 90, supported by both the global table and the detailed course heading. LH remains null because the table shows a dash.
- Replaced the 400-character truncated course summary with a concise complete rendering of source content, retaining examples, patient rights/confidentiality, goal setting and named neurological treatment approaches.
- Added course-specific URL, printed-page locator and access date.
- Preserved all four outcomes. The source itself says “orthopaedic conditions” in outcome 3 despite this being a Neurology rotation; retained the wording and added `source_conflict_note`. No unsupported correction was made.
- Verified PST 423’s prior source-backed repair (PH 45; structure printed p. 588; contents printed p. 619; source URL/access date present), so it was not re-audited or changed.

Verification: `test_ccmas_pst422_source_reconciliation_2026_09_29.py` plus the updated lane-1 increment-029 regression test. The lane-1 evidence artifact remains append-only and continues to document the pre-reconciliation defect; this checkpoint records the local correction.

Next lane cursor: PST 424. Its global row shows 2 units, C, LH dash and PH 45 at printed p. 588. Compare its detailed block at printed p. 619 with the local row before deciding whether a repair is justified.

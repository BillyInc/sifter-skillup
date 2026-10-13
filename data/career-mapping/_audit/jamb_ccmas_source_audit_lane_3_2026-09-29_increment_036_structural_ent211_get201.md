# Lane 3 CCMAS source increment 036 — Structural Engineering ENT 211 and GET 201

**Checked:** 2026-09-29 (Africa/Lagos)  
**Primary source:** NUC, [Engineering and Technology CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf).  
**Scope:** package index 174, Structural Engineering, local source rows 16–17.  
**Progress:** 17 of 47 local course occurrences now have package-specific source comparisons (rows 1–15 from increments 033–035, plus rows 16–17 here). Package remains open.

## Reconciled cursor and prior work

Increment 035 says the next item is ordinal 16, GET 201. The current package JSON instead orders ENT 211 at ordinal 16 and GET 201 at ordinal 17. Earlier source checks for ENT 211 in Railway or Petroleum Engineering concern different package occurrences, so they do not cover Structural Engineering. This increment fills that gap and checks GET 201 immediately after it. The machine-readable reconciliation, including the JAMB range checkpoint references and the orphan occurrence identity, is in the accompanying JSON.

The deterministic discovery report dated 2026-09-29 enumerates 420 canonical JAMB identities, 443 current offering occurrences including one orphan source spelling, and 237 CCMAS packages with 9,853 course rows. Its source-text and anomaly flags remain discovery leads rather than source closure.

## Course comparisons

| Local ordinal | Course | NUC source comparison | Local comparison | Disposition |
|---:|---|---|---|---|
| 16 | ENT 211 — Entrepreneurship and Innovation | The Structural Engineering schedule at printed p. 1162 gives 2 units, C, LH 30. Its detail block at pp. 1171–1172 gives eight outcomes and contents covering theory/rationale, entrepreneur characteristics, innovation, enterprise formation/business planning, contemporary issues and e-commerce. | Units, status, LH and all eight outcomes match. PH is not listed in the source. The local 400-character summary ends mid-sentence after the entrepreneur-characteristics material and omits the later source topics. | `confirmed_defect` — content summary truncation. |
| 17 | GET 201 — Applied Electricity I | The Structural Engineering schedule at printed p. 1162 gives 3 units, C, LH 45 and a dash for PH. The detail block at p. 1171 gives 3 units, C, LH 30, PH 45, four outcomes and a full contents block. | Title, units, status and four outcomes match. Local hours match the table but conflict with the detail block. Local content is a short summary without a visible truncation boundary. | `source_conflict` — retain both hour presentations; summary remains a candidate for completeness review. |

For ENT 211, the other package checks corroborate the same course-level defect but are not credited as coverage of this exact package row. For GET 201, the authoritative source itself disagrees between its programme table and detailed course block. No field was changed.

## Coverage and next cursors

- JAMB 281–290: the saved identity increment checked all ten titles against the official directory at printed p. 130; awarder cells were explicitly closed only for rows 287 and 288 in the later addendum. Row 281 remains the next exact occurrence to source-check. Rows 291–420 and the orphan occurrence remain in the assigned partition and require their own exact coverage joins before source searches.
- CCMAS package 174: rows 1–17 have occurrence-specific source comparison records; 30 of 47 course rows remain. Next local one-based course-array position is ordinal 18, GET 202.
- CCMAS package indices 159–237 remain the assigned span; the earlier lane checkpoints and targeted fixes are retained by exact package/course occurrence and are not re-run here.

No shared ledger, source data, mapping, or downstream domain/subgroup/role record was edited.

Regression test: `test_jamb_ccmas_source_audit_lane_3_increment_036.py`.

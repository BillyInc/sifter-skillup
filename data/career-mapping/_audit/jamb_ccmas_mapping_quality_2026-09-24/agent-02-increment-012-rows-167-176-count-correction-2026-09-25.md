# Partition 02 — increment 012: rows 167–176 snapshot-count correction

Recorded 2026-09-25 (Africa/Lagos), as an append-only correction to increment 011. The row-level identities and link sets there remain unchanged; only the aggregate delta arithmetic is corrected here.

For rows 167–176, the prior preserved snapshot has **63** link occurrences and the active/canonical fail-closed map has **48**. Exact set comparison yields **16 removed IDs and 1 added ID (D118 in row 170), net −15**. Increment 011's aggregate sentence and its table omitted the additional removed D009 in row 172 and incorrectly stated 8 removed / 4 added. Correct removed sets by row:

- 167: D144
- 168: D048, D122
- 170: D122 (D118 added)
- 171: D013, D014, D028, D061, D062
- 172: D002, D009, D033
- 173: D048, D122
- 174: D001, D033
- 169, 175, 176: no set changes

Active map and canonical candidate map agree for these ten rows. The cross-file comparison was rerun against `jamb_domain_map_before_fail_closed_2026-09-25.json`, `jamb_domain_map_ccmas_derived_2026-08-17.json`, and current `jamb_domain_map.json`.

**Exact coverage:** rows 167–176 checkpointed; full identity closures remain 0/10 because JAMB table/awarders, local institutional curriculum, and descendant role checks are still evidence-needed. Rows remaining in partition 141–280 after row 176: **104 (177–280)**. Primary sources and printed locators already captured for this tranche remain as listed in increment 011: JAMB Sciences brochure pp. 452 and 610 (only the Mathematics/Economics table confirmed there); NUC Sciences CCMAS GEY 312 p. 288, GEY 408 p. 290, BTG 315 p. 123, BIO 413 p. 100, ZOO 422 pp. 781–782; NUC Computing CCMAS DTS 302 p. 110. Exact JAMB table locators for the other nine identities remain open.

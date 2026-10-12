# Lane 3 to local fixer — repair handoff increment 001

**Prepared:** 2026-09-28 (Africa/Lagos)  
**Evidence basis:** Lane-3 CCMAS increments 009–013 and regression tests.  
**Scope boundary:** findings for CCMAS package index 172, Petroleum Engineering, only. Lane-3 audit agent did not edit the shared product ledger. The shared `engineering.json` already had unrelated/pre-existing worktree changes; preserve them and apply repairs only after reviewing exact rows.

## Confirmed repair queue

Use the exact NUC locators in each linked increment. Repairs should be surgical, preserve package-specific ownership, retain source URL/date/locator, and avoid converting source conflicts into guessed values.

| Local record | Confirmed defect | Repair pointer / source locator |
|---|---|---|
| `PETROLEUM ENGINEERING` / PEE 101 | `15 45` embedded in title, LH/PH null, content ends at “Career Development Resources incl”. | Restore table-aligned title and LH 15 / PH 45; restore the full source-faithful summary. Preserve table p.1085 title “Introductory…” versus detail pp.1093–1094 “Introduction…”. See increment 009. |
| PEE 201 | Content field contains only “Petroleum Geology with Field Trip”, while the detailed course block provides the full syllabus. Six outcomes and table metadata match. | Populate concise syllabus topics (Earth/depositional systems; petroleum generation/migration/traps; prospecting; reservoir data; subsurface mapping; Nigerian basins/field trip). Preserve p.1085 table title versus p.1100 detailed title. See increment 010. |
| PEE 304 | Outcome 3 is fused into outcome 2; content stops mid-word at “Factors affecti”. | Split into three source outcomes and restore full drilling syllabus. See increment 010, printed pp.1085 and 1105–1106. |
| PEE 306 | Content stops after “Uses”, omitting reservoir-engineering uses, correlations and PVT experiments. | Restore missing content tail; preserve seven outcomes. See increment 012, printed pp.1086 and 1106. |
| PEE 309 | Content stops after “governing”; later source syllabus on IPR, formation damage, well surveillance, stimulation, artificial lift and nodal-analysis software is omitted. | Restore the full content summary. Keep table title “Petroleum Production 1” and detail title “Petroleum Production Engineering I” as source variation. See increment 012, printed pp.1086 and 1107. |
| PEE 310 | Content stops after “Fluid flow concepts.”, omitting flow potential, Darcy’s law, decline-curve analysis and MBAL/alternative. | Restore content tail; preserve eight outcomes. See increment 012, printed pp.1086 and 1107. |
| GET 399, local course ordinal 44 | Title contains “4 C 12 Weeks”; units/duration are not structured; outcomes/content are polluted with GET 402 and GET 404 material and truncated. | Keep the 300-level SIWES II occurrence. Restore table title and 4 C / 12 weeks; separate unrelated records rather than deleting the source occurrence. See increment 011, printed pp.1085–1086. |
| GET 399, local course ordinal 49 | Separate-table SIWES I title is attached to GET 399, though NUC assigns SIWES I to GET 299 and GET 399 to SIWES II; mixed content/outcomes copied into row. | Preserve this separate source-table occurrence during reconciliation; correct identity to source-supported GET 299 only if package materialization semantics confirm this row represents the supplementary SIWES table, and avoid silent deletion/deduplication. See increment 011, printed p.1086. |
| PEE 313 | Local content ends after 2D/3D/4D seismic reflection; omits borehole logging and geophysical prospecting/exploration. | Restore source content tail. NUC outcome 1 itself spells “aply”; do not silently attribute the typo to the local parser or silently change source text in this repair. See increment 013, printed pp.1086 and 1108. |
| PEE 401 | Local content is only a title-like sentence; detailed syllabus covers business formation, Nigerian content, funding, joint ventures, marketing, venture profiles, finance, sustainability and projects. | Replace placeholder-like content with concise substantive source summary; preserve table/detail title variation. See increment 013, printed pp.1086 and 1110. |
| PEE 405 | Content ends at “Guidelines for”; omits field log selection, PETREL-based computer analysis and recent advances. | Restore content tail; preserve table title “Introduction to…” vs detail title without that prefix. See increment 013, printed pp.1086 and 1110–1111. |

## Do not “repair” without authoritative resolution

- **PEE 312 practical hours:** table p.1086 says PH 90; detailed block pp.1107–1108 says PH 45. Current local PH 90 matches the global table. Preserve as `source_conflict`; do not overwrite either value based on preference.
- **PEE 305 title:** global table says “Drilling Fluid Technology Laboratory”; detailed block says “Drilling Fluid Laboratory”. Current title matches the table.
- **PEE 313 outcome typo:** source itself says “aply”; keep source fidelity distinct from editorial correction.

## Validation / next step

Lane-3 focused evidence tests for increments 009–013 pass (11 tests). Before applying any repairs, inspect the current shared JSON and agent/user modifications, use guarded source-backed edits, add regression tests per repaired row, regenerate only dependent local artifacts as authorized, and rerun the deterministic discovery report. The evidence register remains open: package 172 has 35 of 49 row occurrences not source-adjudicated; none of these findings closes the 79-package Lane-3 CCMAS assignment or the JAMB 281–420 assignment.

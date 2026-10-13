# Lane 3 CCMAS source increment 012 — Petroleum Engineering PEE 306–310

**Checked:** 2026-09-28 (Africa/Lagos)  
**Primary source:** NUC, [Engineering and Technology CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf), accessed 2026-09-28.  
**Progress:** four additional course rows checked. Ten of 49 package-172 row occurrences have source comparisons across increments 009–012; 39 remain. No package is closed.

## Prior-work reconciliation

Increments 009–011 cover PEE 101, PEE 201, PEE 304, PEE 305 and the two distinct SIWES row occurrences at ordinals 44 and 49. This increment checks new rows PEE 306, 307, 309 and 310. It retains the table/detail title difference for PEE 309 rather than normalizing it silently. No shared CCMAS records or seeds were edited.

## Findings

| Course | Official NUC comparison | Local comparison | Disposition |
|---|---|---|---|
| PEE 306 — Rock and Fluid Properties | Table p. 1086: 2 units, C, LH 30. Detail p. 1106: seven outcomes and a full content block covering reservoir-rock porosity/permeability, capillary/surface effects, fluid thermodynamics, phase equilibrium, hydrocarbon viscosity, reservoir uses/correlations and PVT experiments. | Title/structure and all seven outcomes align. Local `content_summary` ends after “Uses”, omitting the remaining source topics. | **Confirmed content-truncation defect.** |
| PEE 307 — Rock and Fluid Properties Laboratory | Table p. 1086: 1 unit, C, PH 45. Detail pp. 1106–1107 says this is the lab component of PEE 306; content covers coring/core analysis and measurement of porosity, permeability, water saturation and gas formation volume factor. | Title, structure, one learning outcome and course content align with the detailed block. | **Confirmed match for checked fields.** |
| PEE 309 — Petroleum Production 1 | Table p. 1086: 2 units, C, LH 30, title `Petroleum Production 1`. Detail p. 1107: title `Petroleum Production Engineering I`, same structure, six outcomes and syllabus including subsurface operations, completion, nodal analysis, production problems, surveillance, stimulation and artificial lift. | Local title/structure and six outcomes align with the table/detail; local content ends at “governing”, omitting the rest of the source syllabus. | **Confirmed content-truncation defect; source title variation preserved.** |
| PEE 310 — Fundamentals of Reservoir Engineering | Table p. 1086: 2 units, C, LH 30. Detail p. 1107: eight outcomes and content covering reservoir characterization, hydrocarbon-in-place estimation, recovery, material balance, water influx, flow potential, Darcy’s law, decline-curve analysis and computer application. | Title/structure and all eight outcomes align. Local content ends after “Fluid flow concepts”, omitting the remaining source topics. | **Confirmed content-truncation defect.** |

These are confirmed because the local summary fields stop mid-syllabus while the exact official course blocks continue with substantive topics. The outcome counts and structures were compared rather than inferred from title matches. The NUC detail title `Petroleum Production Engineering I` and global table title `Petroleum Production 1` are both retained as official source variants.

## Remaining work

Package 172 has **39 row occurrences** without a Lane-3 source comparison across increments 009–012. Continue with the next uncovered rows and keep each package/source-table occurrence distinct. The lane-3 JAMB identities 281–420 source-context portion remains open; existing row 311–320 checkpoints were read and are not counted as newly closed by this increment.

Machine-readable evidence: `jamb_ccmas_source_audit_lane_3_2026-09-28_increment_012.json`.

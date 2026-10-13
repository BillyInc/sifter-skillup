# Lane 3 CCMAS source increment 011 — Petroleum Engineering SIWES rows

**Checked:** 2026-09-28 (Africa/Lagos)  
**Primary source:** NUC, [Engineering and Technology CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf), accessed 2026-09-28.  
**Progress:** two additional row occurrences checked in package 172. Six of 49 package row occurrences have now been source-compared across increments 009–011; the package is not closed.

## Prior-work reconciliation

Increments 009–010 checked PEE 101, PEE 201, PEE 304 and PEE 305. This check covers two separately stored occurrences at local course ordinals 44 and 49, both currently coded GET 399. Because the NUC repeats SIWES references in both the 300-level programme table and the separate SIWES summary, the local occurrences are compared by their own table context rather than deduplicated by code.

## Findings

The NUC's Petroleum Engineering 300-level table (printed p. 1085) identifies `GET 399 SIWES II: Students Work Experience Scheme`, 4 C, 12 weeks. Its separate SIWES table (printed p. 1086) lists three distinct stages: `GET 299 SIWES I`, 3 C, 9 weeks; `GET 399 SIWES II`, 4 C, 12 weeks; and `GET 499 SIWES III`, 4 C, 12 weeks. These duplicate references in the source are legitimate cross-table references, not evidence that course identities should be collapsed or deleted.

| Local occurrence | Source comparison | Disposition |
|---|---|---|
| ordinal 44, GET 399 | The NUC 300-level table gives title `SIWES II: Students Work Experience Scheme`, 4 C, 12 weeks. Local title appends `4 C 12 Weeks`, units are null, and its outcomes/content run beyond the SIWES description into GET 402 project and GET 404 engineering-valuation material. The content summary is truncated. | **Confirmed extraction defect.** Keep this 300-level GET 399/SIWES II occurrence, remove the appended metadata from its title, restore the source duration/units fields, and separate unrelated later course material during a repair pass. |
| ordinal 49, GET 399 | In the NUC's separate SIWES table, SIWES I is `GET 299` (3 C, 9 weeks), while `GET 399` is SIWES II (4 C, 12 weeks). | **Confirmed extraction/identity defect.** This separate-table occurrence has the SIWES I title attached to the wrong code and carries copied/mixed SIWES/project/valuation outcomes. Preserve the separate source occurrence as evidence; do not silently drop it or infer an identity merge. |

The JSON checkpoint retains the exact local field strings and separate locators for the two distinct source contexts. This audit lane records findings only and does not edit the shared curriculum file.

## Remaining work

Package 172 has **43 row occurrences** not yet source-adjudicated across increments 009–011. Continue through the remaining rows in source order, preserving repeated source-table mentions as distinct evidence until the canonical contract is reconciled. The JAMB 281–420 offering-context audit remains separately open; no JAMB identity is closed by these CCMAS checks.

Machine-readable evidence: `jamb_ccmas_source_audit_lane_3_2026-09-28_increment_011.json`.

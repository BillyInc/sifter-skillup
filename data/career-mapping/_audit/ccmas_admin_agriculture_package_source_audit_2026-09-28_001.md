# CCMAS Administration & Agriculture source audit — checkpoint 001

**Date:** 2026-09-28 (Africa/Lagos)  
**Status:** in progress; **0/36 packages complete**. This checkpoint starts the package-level source comparison and records confirmed course-detail/contact-hour defects. It does not close either discipline audit.  
**Mode:** audit only. No CCMAS JSON, JAMB mapping, seed, domain link, or name was changed.

## Scope

The audit covers all packages in the two local NUC source files, outside the already-selected 79-package comparison lane:

- **Administration and Management — 23:** Accounting; Actuarial Science; Aviation Management; Finance / Banking and Finance; Business Administration; Business Information Technology; Co-operative and Rural Development; Employment and Human Resource Management; Entrepreneurship; Hospitality and Tourism Management; Information Resource Management; Insurance; Local Government and Development Studies; Logistics and Supply Chain Management; Marketing; Office and Information Management; Petroleum Information Management; Procurement Management; Project Management; Public Administration; Securities and Investments Management; Taxation; Transport Management.
- **Agricultural Science — 13:** Agribusiness; B. Agriculture; Agricultural Economics; Agricultural Extension; Animal Science; Crop Science; Family and Consumer Sciences; Fisheries and Aquaculture; B.Sc./B.Tech Food Science and Technology; Forest Resources and Wildlife Management; Horticulture and Landscape Management; Soil Science; Water Resources Management and Agro-Meteorology.

Current local course-row counts: Administration **842**; Agriculture **614**; total **1,456**. These are inventory counts, not counts of source-compared rows. The full-package protocol still requires comparing each package's course identity, title, units, status, hours, outcomes, content, ownership, duplicates and exact locators against the official PDF.

## Sources

1. NUC, *CCMAS for Administration and Management*, <https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf>, accessed 2026-09-28.
2. NUC, *CCMAS for Agriculture*, <https://www.nuc.edu.ng/wp-content/uploads/2026/03/Agriculture-2023.pdf>, accessed 2026-09-28.

## Source adjudication added in this increment

| Record | Classification | Evidence and exact locator | Local comparison |
|---|---|---|---|
| Agricultural Science → **Agribusiness** → **AGB 301, Agribusiness Communication Skills** | **confirmed_defect** (course-detail cross-package contamination) | NUC Agriculture CCMAS, Agribusiness course structure, printed p. 33, lists AGB 301 as *Agribusiness Communication Skills* (2 units, C, LH 30); course detail printed pp. 48–49 gives communication-mode, oral/written/nonverbal communication, business communications and meetings outcomes/content. Same PDF, Agricultural Extension course structure, printed p. 140, lists a distinct AGB 301, *Agribusiness Value Chain Analysis* (2 units, C, PH 90); its course detail printed pp. 154–155 covers value-chain analysis and value addition. | The local Agribusiness AGB 301 retains the communication-course title and matching course structure, but has no `content_summary` or `learning_outcomes`; its `skills_learned` are the value-chain outcomes belonging to the separately titled Agricultural Extension AGB 301. This is evidence that course detail crossed package/course contexts, not evidence that either source course should be merged. No repair made in this audit-only task. |

The general anomaly inventory and bounded slice had listed these two AGB 301 records as candidates; this checkpoint adds the direct NUC source comparison and classifies the Agribusiness record. It does not count the rest of either package as checked.

### Additional package comparison: Administration and Management → Accounting

| Record | Classification | Evidence and exact locator | Local comparison |
|---|---|---|---|
| Accounting → 18 ACC-coded courses: ACC 201, 202, 203, 204, 206, 301, 302, 303, 305, 306, 307, 308, 311, 401, 402, 403, 404, 405 | **confirmed_defect** (course contact-hour field mismatch) | NUC Administration and Management CCMAS, Accounting global course structure, printed pp. 31–32. The table gives ACC 201/202 and most listed rows as LH 30, PH 45; ACC 203 as LH 30 with no PH; ACC 206 as LH 15, PH 45. The course headings/detail at printed pp. 37–49 provide corroborating course identities. | All 18 local rows currently store `lh: 45` and `ph: null`, rather than the source values. Units/status and course identities are not implicated by this finding. No repair made. |

The existing ACC repair ledger for 2026-09-25 explicitly limited its field changes to title, content summary and learning outcomes; it therefore did not adjudicate these hours. This newly identified contradiction comes from comparing the package's global course structure and is logged without reopening the ledger's already-closed title/content/outcome work.

## Progress accounting

- Packages in scope: **36**.
- Fully source-compared packages: **0 / 36**.
- Packages started: **2** (Agribusiness and Accounting); both package-wide comparisons remain incomplete.
- Source-adjudicated course contexts in this increment: **20** (two package-owned AGB 301 occurrences and 18 ACC-coded Accounting course rows).
- Remaining packages not started: **34**.

Continue in bounded increments. A package may be marked complete only after the full source package and all course contents/outcomes have been reconciled and its course count agrees with the official source. Existing closed micro-issues remain closed unless the full-package comparison finds a contradiction.

# Coordinator continuation — Batch 1: Geography contexts and blended scopes

**Date:** 2026-09-24  
**Rows reviewed:** 321, 337, 338, 410 (1-based `programme_mapping.json`)  
**Status:** Incremental evidence checkpoint. No canonical mapping, seed, or UI edits.

This batch continues the source-context and outcome-level audit recorded in [`coordinator-verification-rows-281-420-2026-09-24.md`](coordinator-verification-rows-281-420-2026-09-24.md) and independently checks relevant claims in [`agent-03-rows-281-420.md`](agent-03-rows-281-420.md).

## Row 321 — Geography: retain separate JAMB offering contexts

The local offering inventory records `Geography` in Engineering/Environmental/Technology (10 institution entries) and Sciences (11). `programme_mapping.json` row 321 collapses these into one identity with `jamb_faculty: Engineering/Environmental/Technology`; the name-keyed domain map likewise has one path set. This confirms source-context loss in the canonical row, not that the two curricula necessarily differ. Preserve both brochure occurrences and institution lists during reconciliation; do not assume the current Sciences institutions are covered by the Engineering occurrence.

## CCMAS Geography course contamination and evidence-anchor defects

The local full package `Environmental Sciences::Geography` in `data/career-mapping/ccmas/environmental_sciences.json` contains 69 course rows, of which 25 carry Industrial Design identifiers (`IDD`, `IDC`, `IDT`). Examples are IDD 206 `Introduction to Textiles and Fashion Design`, IDC 407 `Ceramics for Building and Environment`, IDC 501 `Technical Ceramics`, IDT 407 `Colour Chemistry and Textile Technology`, and IDT 505 `Textile Management and Marketing and Exhibition`.

The Federal Ministry of Education/TETFund BRIDGE CCMAS catalogue independently attributes each named course to Environmental Sciences → B.Sc./B.Tech. Industrial Design. Its programme listing reports Geography separately (37 courses) from Industrial Design (141). The specific BRIDGE pages provide course descriptions and outcomes. This confirms that the local 69-row Geography package is contaminated by Industrial Design rows and must not be treated as a clean full Geography curriculum.

The contaminated course rows are also used as anchors in `data/career-mapping/_audit/programme_domain_evidence_2026-08-17.json`:

| Domain link on `Environmental Sciences::Geography` | Invalid anchor(s) present | Finding |
|---|---|---|
| D063 Economics | IDD 206 Textiles and Fashion Design | Not a Geography course; invalid link evidence. |
| D020 Environmental Engineering | IDC 407 Ceramics for Building and Environment; IDT 407 Colour Chemistry and Textile Technology | Both are Industrial Design courses; invalid Geography evidence. |
| D041 Scientific Research | IDC 501 Technical Ceramics | Not a Geography course; invalid evidence. |
| D045 Public Administration | IDT 505 Textile Management and Marketing and Exhibition | Not a Geography course; invalid evidence. |

These are confirmed bad anchors, **not proof that each destination link is false**. Reassess D063/D020/D041/D045 against clean GEO outcomes. D072 Geospatial Science and D144 Climate Science/Meteorology have Geography-specific course anchors and remain plausible; D009 Data Science and D156 Land Surveying also need review against legitimate quantitative/GIS/surveying outcomes. For all links, a course-title match is only a locator: verify outcomes and downstream subgroups/roles before accepting the student path.

## Row 410 — Geography and Environmental Studies

This distinct JAMB identity maps to `Environmental Sciences::Geography` with a ten-course partial scope. Active D020 Environmental Engineering evidence includes IDC 407 `Ceramics for Building and Environment`; D045 Public Administration includes IDT 505 `Textile Management and Marketing and Exhibition`. BRIDGE attributes both to Industrial Design, so both are **confirmed invalid anchors** for this Geography scope. Remove those from the evidence basis and reassess the functional links only against valid GEO and correctly sourced Environmental Studies coursework. D072, D144, D063, D041, D009 and D156 currently have Geography-title anchors, but their outcomes and downstream branch fit remain to be verified.

## Rows 337–338 — blended Geography scopes unresolved

Row 337 `Geography and Environmental Management` and row 338 `Geography and Geosciences` each have zero selected JAMB-scope courses. They have ten active links apiece. Their component refs are plausible, but do not show which course/outcome supports each link. Row 337 D020 is sourced only to Environmental Management while its other links are split between Geography and Environmental Management; row 338 D022 Mining and D054 Oil rely only on Geology. Preserve these component distinctions and mark **all 20 links unresolved for combined-scope acceptance** pending an explicit component-course/outcome crosswalk. The empty selected-course scopes alone do not prove any individual destination semantically false.

## Disposition

- **Confirmed:** row 321 collapses two JAMB source-faculty contexts; local full Geography curriculum record is contaminated by Industrial Design course rows; parent evidence uses unrelated courses for D063/D020/D041/D045; row 410 repeats invalid D020/IDC 407 and D045/IDT 505 anchors.
- **Unresolved:** whether D063/D020/D041/D045 remain appropriate after anchor correction; outcomes and downstream subgroup/role fit for all other Geography links; all 20 row 337–338 blended-scope links.
- **Not concluded:** this checkpoint does not declare all Geography routes false, nor does it validate their current match types.

## Sources and locators (checked 2026-09-24)

- Local: `data/career-mapping/programme_mapping.json` rows 321, 337, 338, 410; `data/career-mapping/jamb_domain_map.json` entries `Geography`, `Geography and Environmental Management`, `Geography and Geosciences`, `Geography and Environmental Studies`; source contexts in `data/career-mapping/jamb/engineering_offerings.json` and `sciences_offerings.json`.
- Local curriculum/anchors: `data/career-mapping/ccmas/environmental_sciences.json`, `Geography`; `data/career-mapping/_audit/programme_domain_evidence_2026-08-17.json`, `Environmental Sciences::Geography::D063`, `::D020`, `::D041`, `::D045`, plus D072/D144/D009/D156.
- Federal Ministry of Education/TETFund BRIDGE, [CCMAS course search](https://diaspora-bridge.education.gov.ng/bridge-p/ccmas-courses): catalogue/programme listing; filtered listing shows Geography (37 courses) separately from Industrial Design (141).
- BRIDGE course detail locators: [IDD 206](https://diaspora-bridge.education.gov.ng/bridge-p/ccmas-courses/022297f9-3907-43de-a51d-2690ff22e22e), [IDC 407](https://diaspora-bridge.education.gov.ng/bridge-p/ccmas-courses/e19166ee-2de7-44c4-805b-83dc75f877f4), [IDC 501](https://diaspora-bridge.education.gov.ng/bridge-p/ccmas-courses/355704cc-75b1-40e5-84c4-130c0c20db8d), [IDT 407](https://diaspora-bridge.education.gov.ng/bridge-p/ccmas-courses/920a3180-f17a-40a8-975d-484331917896), [IDT 505](https://diaspora-bridge.education.gov.ng/bridge-p/ccmas-courses/0e27c770-2442-4e7c-ad92-3e23b6d5cbe5). Each detail locator displays Industrial Design attribution and the corresponding course description/outcomes.

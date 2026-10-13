# Coordinator source-context batch 002 - JAMB table rows for 404/406/410/417/420

**Date accessed:** 2026-09-24  
**Purpose:** continue exact primary-brochure table reconciliation from `coordinator-source-context-crosswalk-2026-09-24.md`. Printed-page catalogue lines and awarding-institution table rows are kept distinct. This is an evidence checkpoint; no canonical mapping, source JSON, or seed was changed.

## Findings from the official JAMB brochure text/indexed tables

### Row 404 - Land Surveying

The Engineering/Environmental/Technology brochure's printed p. 415 has the exact table heading `LAND SURVEYING` and institution cells **ABU, ESUTECH, IMSU**. This makes those the confirmed institutions for that JAMB Engineering occurrence. The checked-in `engineering_offerings.json` row currently has an additional `RSU`; the official table excerpt does not place RSU in this row. Treat RSU as a likely parser boundary spillover and do not attach it to this occurrence absent the page image/table geometry. Printed p. 336 is the faculty catalogue context. The canonical row's Environmental Sciences faculty and Surveying/Geoinformatics component remain a separate mapping question; an Engineering JAMB occurrence does not disprove a separate Environmental Sciences offering.

### Row 406 - Fine Art/Fine and Applied Arts

The Arts brochure's printed p. 130 catalogue includes the combined display identity `Fine Art/Fine and Applied Arts` under Arts. Separately, the Engineering/Environmental/Technology brochure's printed p. 444 table contains `FINE AND APPLIED ARTS` with institution cells **AAU, ABSU, DOU, IMSU, JOS, LAUTECH, MOUNTAIN TOP, NDU, OOU, UDA, UNIZIK**. The Engineering catalogue on p. 336 lists `Fine Art` and `Fine and Applied Arts` separately. Therefore there are at least distinct Arts and Engineering source-section contexts; do not conflate the Arts slash-name or its parsed institution array (18 entries) with the Engineering p. 444 table's 11 entries. Exact Arts table-row/institution associations remain to be located and reconciled. The canonical Environmental Sciences mapping is a discrepancy lead, not yet an adjudicated correction.

### Row 410 - Geography and Environmental Studies

The Arts brochure p. 130 catalogue explicitly lists `Geography and Environmental Studies`. But the Arts brochure's p. 237 course-awarding table entry is headed **`GEOGRAPHY`**, with institutions **FED-KASHERE, FED-LAFIA, FED-LOKOJA, AEFUNA**. This p. 237 table row is not labelled `Geography and Environmental Studies`. The local `arts_hum_offerings.json` associates those four institutions and the generic Geography subject requirements with the longer JAMB name. Until the original page/table establishes a cross-reference, those four institutions cannot be asserted as the offering set for the exact longer-name identity. This is a confirmed label/table reconciliation gap, not proof the longer-name programme is unavailable or that the canonical Environmental Sciences mapping is correct.

### Row 417 - Environmental Management and Technology

The Engineering brochure's p. 336 catalogue says `Environmental Management Technology` (no “and”). Its p. 449 special-consideration text mentions `Environmental Management Technology` as a BAUCHI option/waiver under the Estate Management table; this is not enough to assign a standalone institution row to canonical `Environmental Management and Technology`. Separately, the JAMB Sciences brochure p. 594 search extract mentions `Environmental Management and Toxicology` in entry requirements, and the current official FUNAAB 2026 admission list names `Environmental Management and Toxicology`. The local parsed Agriculture source maps the longer canonical label to a heading of that latter name and lists FUNAAB and KWASU, but the exact JAMB table row and institution cells for this purported occurrence have not been verified. Keep at least three lexical contexts separate: Environmental Management Technology; Environmental Management and Toxicology; Environmental Management and Technology. No definitive merge/split or map correction yet.

### Row 420 - Transport Planning and Management

The Education brochure p. 200 catalogue explicitly lists `Transport Planning and Management (TPM)` under Education. The Social Sciences brochure p. 575 separately lists `Transport Planning and Management` under Social Sciences. This proves two JAMB brochure-section identity contexts, but the catalogue pages do not establish each context's awarding institutions. The parsed Education offering says TASUED; TASUED's current official undergraduate list independently includes both B.Sc. Transport Planning and Management and B.Sc. (Ed.) Transport Planning and Management under its College of Social and Management Sciences, supporting that two qualifications exist at the same institution but not substituting for JAMB's table-cell association. Preserve the two JAMB contexts; exact Education-vs-Social Science table institution lists remain open. The wrong CCMAS Hospitality/Tourism scope remains a confirmed curriculum-component defect independent of this source-context uncertainty.

## Source locators

- JAMB, [Engineering/Environmental/Technology brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-engineering.pdf): printed pp. 336, 415, 444, 449.
- JAMB, [Arts brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf): printed pp. 130, 237.
- JAMB, [Education brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-education.pdf): printed p. 200.
- JAMB, [Social Sciences brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf): printed p. 575.
- JAMB, [Sciences brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf): printed p. 594 search-extract locator for Environmental Management and Toxicology waiver text; not an institution-row locator.
- TASUED, [Undergraduate Admission](https://tasued.edu.ng/undergraduate-admission/): current programme list distinguishing B.Sc. and B.Sc. (Ed.) Transport Planning and Management. Used only as corroboration of separate qualifications, not as a replacement for JAMB offering evidence.
- FUNAAB, [2026/2027 admission programme list](https://admission.funaab.edu.ng/2026/programmes.php): official title `Environmental Management and Toxicology`; used to keep source titles distinct, not to infer the JAMB table row.
- Local parsed rows: `data/career-mapping/jamb/engineering_offerings.json`, `arts_hum_offerings.json`, `agriculture_offerings.json`, `education_offerings.json`; authoritative for what current parser output says, not for validating the source-page cell boundaries.

## Open source-context work

1. Obtain/inspect source page images around Arts p. 130/p. 237 and Engineering pp. 444-449 to resolve whether each indexed title has a corresponding awarding-institutions row and to confirm table cell boundaries.
2. Reconcile row 417's canonical label to an exact JAMB programme table before linking FUNAAB/KWASU, BAUCHI, or CCMAS Environmental Management to it.
3. Resolve whether row 404's parsed RSU is spillover using the p. 415 image; keep source-faculty occurrence, canonical faculty label and curriculum component as distinct fields in the audit.

# JAMB offering/source-context incremental checkpoint 004

**Date:** 2026-09-26 (Africa/Lagos)  
**Mode:** audit-only, append-only checkpoint saved before resuming the bounded pass  
**Lane:** JAMB offering identity/source-context integrity only  
**No shared source, mapping, curriculum, seed, downstream taxonomy, role, or UI file was edited.**

## Exact coverage inspected before this checkpoint

### Catalogue and occurrence ranges

- Canonical JAMB identities: **all 420/420**, ordered rows 001–420 in the
  current offering inventory.
- Parsed offering records: **all 441/441** records across:
  - `data/career-mapping/jamb/administration_offerings.json`
  - `data/career-mapping/jamb/agriculture_offerings.json`
  - `data/career-mapping/jamb/arts_hum_offerings.json`
  - `data/career-mapping/jamb/education_offerings.json`
  - `data/career-mapping/jamb/engineering_offerings.json`
  - `data/career-mapping/jamb/law_offerings.json`
  - `data/career-mapping/jamb/medical_offerings.json`
  - `data/career-mapping/jamb/sciences_offerings.json`
  - `data/career-mapping/jamb/social_management_offerings.json`
- Manual source-confirmed records: **1**, for total occurrence records **442**.
- Extracted source text files inspected: all 9 matching brochure text files under
  `data/career-mapping/_jamb_txt/`.

### Deterministic comparisons completed

- Current offering inventory compared with the older catalogue/source audit for
  **all 441 parsed records**.
- Normalized full-text name scan run for **all 441 parsed records**:
  - direct normalized hit: **338**;
  - wrapped/alias/typo/cell-boundary queue: **103**.
- Older source-audit join classification for **all 441 parsed records**:
  - direct source-catalogue corroboration: **419**;
  - declared alias corroboration: **14**;
  - no same-faculty source-audit hit: **8**.
- Institution-array integrity scan for **all 441 parsed records**:
  - duplicate institution-token records: **1**;
  - previously recorded faculty/header-token contamination: **100 incidences in
    65 records** (carried forward, not re-counted as new).
- Display-name/source-faculty collision scan for **all 420 identities**:
  - identities with multiple source-faculty contexts: **20**.

## Exact records inspected in detail in this interrupted pass

The following records were opened against their extracted source windows, in
addition to the catalogue-wide scans above:

| Record | Exact local record | Source locator | Status |
|---|---|---|---|
| Sociology | `social_management_offerings.json`, `programmes[50]` (1-based) | `Social Management Science.txt:4909-5042` | Confirmed duplicate `UDU` token |
| Environmental Science and Technology | `sciences_offerings.json`, `programmes[165]` | `Sciences.txt:5491-5505` | Confirmed source row; source spells `ENVRIONMENTAL` |
| Information and Media Technology | `sciences_offerings.json`, `programmes[95]` | `Sciences.txt:9441-9479` | Confirmed source row split by page break; `MINNA` |
| Meteorology | `engineering_offerings.json`, `programmes[22]` | `engineering.txt:6489-6545` | Confirmed adjacent-programme contamination candidate/repair lead |
| Environmental Management and Technology | `agriculture_offerings.json`, `programmes[28]` | `agriculture.txt:2568-2577` | Confirmed wording collision; exact canonical cell unresolved |
| Anthropology | `arts_hum_offerings.json`, `programmes[31]` | `arts_hum.txt:5626-5638` | Existing adjacent-row/context queue; not reclassified |

## Confirmed issues

### 1. Duplicate institution token

- `Sociology` / Social Management Sciences contains `UDU` twice in the parsed
  institution array.
- **Evidence URL:** [official JAMB Social Sciences brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf)
- **Locator:** `data/career-mapping/_jamb_txt/Social Management Science.txt:4909-5042`
- **Access date:** 2026-09-26
- **Recommendation:** remove only the duplicate token after source-record repair;
  retain one source-supported `UDU` association and attach a stable occurrence
  locator. No file was edited here.

### 2. Source-audit false negative: Environmental Science and Technology

- The source text contains `ENVRIONMENTAL / SCIENCE AND / TECHNOLOGY / WESLEYUNI`.
- **Evidence URL:** [official JAMB Sciences brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf)
- **Locator:** `data/career-mapping/_jamb_txt/Sciences.txt:5491-5505`
- **Access date:** 2026-09-26
- **Recommendation:** retain the canonical display spelling, preserve the
  source-original typo as an alias/locator, and keep `WESLEYUNI` attached to this
  exact source context. Do not merge with Environmental Management offerings.

### 3. Source-audit false negative: Information and Media Technology

- The source cell is split across the extracted page break as `INFORMATION AND`
  then `MEDIA TECHNOLOGY / MINNA`; adjacent rows are distinct.
- **Evidence URL:** [official JAMB Sciences brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf)
- **Locator:** `data/career-mapping/_jamb_txt/Sciences.txt:9441-9479`
- **Access date:** 2026-09-26
- **Recommendation:** retain a distinct Sciences occurrence for `MINNA` and
  record the page-break locator. Treat the separate Engineering requirements
  mention as a candidate context until an exact Engineering awarder cell is
  captured.

## Confirmed/candidate issues carried forward

These were already recorded in checkpoints 001–003 and are not new findings in
this checkpoint:

- **100 header/faculty-token incidences in 65 records:** exact brochure-cell
  adjudication still required. Evidence URLs are the official JAMB brochure
  corresponding to each parsed file; access date 2026-09-26. Do not remove
  tokens from the shared source file in this audit lane.
- **Meteorology:** the `engineering.txt:6489-6545` window interleaves
  Meteorology with Meteorology and Climate Change, Nutrition and Dietetics, and
  Hotel Management and Tourism. **Recommendation:** split exact cells and
  institution lists; source URL is the [official JAMB Engineering brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-engineering.pdf),
  accessed 2026-09-26.
- **Environmental Management and Technology:** the Agriculture window shows
  Environmental Management and Toxicology and Environmental Management and
  Pollution Control, not a clean exact canonical cell. **Recommendation:**
  recover the exact awarder cell before changing institutions; source URL is the
  [official JAMB Agriculture brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf),
  accessed 2026-09-26.
- **Anthropology and the three library-name contexts:** remain candidates/open
  under their existing checkpoints; do not collapse source faculty contexts.

## Current disposition counts

| Disposition | Count |
|---|---:|
| Canonical identities covered | **420** |
| Parsed occurrences covered | **441** |
| Total occurrence records | **442** |
| Confirmed new issues in this pass | **3** (duplicate token + 2 source-audit false negatives) |
| Confirmed carried-forward contamination | **1 named record** (Meteorology; within the 65-record queue) |
| Candidate/open no-hit records | **8** |
| Multi-faculty collision identities | **20** |
| Identity rows with at least one unverified occurrence | **419** |

## Resume boundary

The next increment must inspect **at most 20 canonical identities** from the
remaining source-context queue, record exact records and locators, and save a new
append-only checkpoint before proceeding to another increment. The next pass is
not permitted to edit shared source/mapping files or any downstream taxonomy.


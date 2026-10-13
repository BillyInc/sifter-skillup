# Lane B — JAMB source-context deterministic residual checkpoint

**Generated:** 2026-09-29 (Africa/Lagos)
**Mode:** deterministic residual audit only; no canonical data edited
**Scope:** JAMB offering identity/source-context reconciliation only

This checkpoint consumes the latest `jamb_ccmas_deterministic_discovery_2026-09-28.json`. It does not reopen closed CCMAS course-detail repairs, audit downstream domain/subgroup/role links, or infer source truth from a review label.

Complete row-level residuals and evidence locators are in [`jamb_source_context_lane_b_residual_checkpoint_2026-09-29_002.json`](jamb_source_context_lane_b_residual_checkpoint_2026-09-29_002.json).

## Exact current baseline

| Measure | Count |
|---|---:|
| Canonical JAMB identities | 420 |
| Current parsed offering rows | 443 |
| Canonical-linked parsed rows | 442 |
| Orphan source rows | 1 |
| CCMAS packages (read-through baseline only) | 237 |

## Requested deterministic residuals

| Residual | Count | Disposition |
|---|---:|---|
| Missing explicit PDF flag or locator | **290** | Open evidence queue; no automatic promotion |
| Current occurrences without a stable prior-inventory ID | **3** | Reconcile by source file + ordinal + exact title before assigning an ID |
| Orphan source occurrence | **1** | Preserve source spelling; reconcile to canonical identity only with explicit alias evidence |
| Older-inventory-only occurrence | **1** | Reconcile as inventory drift; do not count as a new current row |
| Institution-roster drift records | **32** | Verify exact awarder cells; do not replace arrays wholesale |

### Missing PDF metadata breakdown

| Current row state | Count |
|---|---:|
| Unverified with no row-level metadata | 252 |
| Explicitly unverified but carrying URL/locator/date | 30 |
| Verified flag present but URL/locator/date incomplete | 8 |
| Complete flag + URL + locator + date (not in residual) | 153 |

The 290 rows are preserved individually in JSON, with source faculty, source file, row ordinal, institution tokens, current verification state, official brochure URL, local extract, locator, date, and note. The 30 explicitly-unverified rows must not be treated as verified merely because a locator exists; the 8 inconsistent verified rows need metadata reconciliation.

## Identity and inventory drift

The three unstable current rows are: **Actuarial Science, Sociology and Anthropology, INFORMATION SCIENCE AND MEDIA STUDIES**. They are current source rows absent from the older stable-occurrence signature; they are not new canonical identities.

The orphan is **Sociology and Anthropology**, from the Social/Management Sciences brochure. Its local source evidence is retained, but it differs from the canonical spelling **Sociology and Anthroplogy**. This is one source-name reconciliation cluster, not permission to merge standalone Anthropology.

The older-inventory-only record is the separately retained Administration confirmation for `PUBLIC ADMINISTRATION AND LOCAL GOVERNMENT` (UNN), printed p. 86, verified 2026-09-25. It is not silently added to the current parsed ledger.

### Roster drift

All 32 drift records are included in JSON. The table below is the complete name-level index; prior/current institution arrays and added/removed tokens remain in JSON.

| JAMB identity | Faculty | Prior count | Current count |
|---|---|---:|---:|
| Hotel and Tourism Management | Administration | 11 | 2 |
| Secretarial Administration | Administration | 8 | 1 |
| Local Government Studies | Administration | 5 | 1 |
| Horticulture | Agriculture | 8 | 2 |
| Animal Production | Agriculture | 23 | 7 |
| Animal Science | Agriculture | 15 | 23 |
| Animal Breeding and Genetics | Agriculture | 6 | 1 |
| Crop Science | Agriculture | 11 | 6 |
| Soil Science | Agriculture | 23 | 17 |
| Family, Nutrition and Consumer Sciences | Agriculture | 3 | 1 |
| Food Science with Business | Agriculture | 5 | 1 |
| Forestry, Wildlife & Fisheries | Agriculture | 3 | 2 |
| Home Economics | Agriculture | 20 | 11 |
| Hotel Management & Tourism | Agriculture | 11 | 6 |
| Home Science, Nutrition and Dietetics | Agriculture | 3 | 1 |
| Home Science & Management | Agriculture | 3 | 2 |
| Arabic Studies | Arts and Humanities | 41 | 40 |
| Archaeology | Arts and Humanities | 8 | 4 |
| Christian Religious | Arts and Humanities | 49 | 36 |
| Creative Arts | Arts and Humanities | 86 | 5 |
| Linguistics/Edo | Arts and Humanities | 111 | 1 |
| English and Literary Studies | Arts and Humanities | 38 | 36 |
| Polymer and Textile Engineering | Engineering/Environmental/Technology | 16 | 2 |
| Water Resources and Environmental Engr | Engineering/Environmental/Technology | 28 | 3 |
| Petroleum and Gas Engineering | Engineering/Environmental/Technology | 13 | 12 |
| Gas Engineering | Engineering/Environmental/Technology | 6 | 1 |
| Food Science and Engineering | Engineering/Environmental/Technology | 19 | 1 |
| Food Technology | Engineering/Environmental/Technology | 27 | 2 |
| Software Engineering | Engineering/Environmental/Technology | 16 | 14 |
| Home Economics and Food Management | Engineering/Environmental/Technology | 8 | 1 |
| ICT Engineering | Engineering/Environmental/Technology | 4 | 1 |
| Surveying and Geoinformatics | Sciences | 2 | 1 |

## Source-context collisions

- **4** casefold collision groups: METEOROLOGY, Meteorology (meteorology); ANTHROPOLOGY, Anthropology (anthropology); LIBRARY SCIENCE, Library Science (library science); LIBRARY AND INFORMATION SCIENCE, Library and Information Science (library and information science). These remain separate identities until an explicit identity decision is made.
- **21** identities have more than one parsed source faculty. Their complete context rows are in JSON; no same-name display merge was performed.
- **7** identities have the same institution code in more than one faculty context. The overlapping pairs are listed in JSON and require exact-cell verification.
- **29** identities have a canonical mapping-faculty label absent from the currently parsed source-faculty set. This is a triage signal, not a confirmed faculty error.

## Evidence used

The deterministic artifact and prior offering inventory were reused without rerunning closed course-detail checks. Every source row points to the matching official JAMB/IBASS brochure URL and local extracted-text file where available. The Lane B access date is 2026-09-29; pre-existing row verification dates are preserved rather than overwritten.

- **Administration** — [https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf); local extract `data/career-mapping/_jamb_txt/Administration.txt`.
- **Agriculture** — [https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf); local extract `data/career-mapping/_jamb_txt/agriculture.txt`.
- **Arts and Humanities** — [https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf); local extract `data/career-mapping/_jamb_txt/arts_hum.txt`.
- **Education** — [https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-education.pdf](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-education.pdf); local extract `data/career-mapping/_jamb_txt/education.txt`.
- **Engineering/Environmental/Technology** — [https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-engineering.pdf](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-engineering.pdf); local extract `data/career-mapping/_jamb_txt/engineering.txt`.
- **Law** — [https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-law.pdf](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-law.pdf); local extract `data/career-mapping/_jamb_txt/Law.txt`.
- **Medical/Pharmaceutical/Health** — [https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-medical.pdf](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-medical.pdf); local extract `data/career-mapping/_jamb_txt/medical.txt`.
- **Sciences** — [https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf); local extract `data/career-mapping/_jamb_txt/Sciences.txt`.
- **Social/Management Sciences** — [https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf); local extract `data/career-mapping/_jamb_txt/Social Management Science.txt`.

## Deterministic repair recommendations

1. Verify the 252 rows with no row-level evidence against the exact JAMB brochure cell, then add the official URL, printed/page or extracted locator, access date, verified flag, and institution-code evidence in a later authorized repair.
2. Reconcile the 30 explicitly-unverified rows and 8 metadata-inconsistent verified rows. A locator alone is not verification; do not promote either class automatically.
3. Assign stable occurrence IDs only after the three current-only rows are matched by exact source file, ordinal, title, faculty, and awarder cell. Keep the orphan spelling as an alias/provenance value rather than collapsing it into a display-name match.
4. Resolve the 32 roster differences from exact cells. Preserve source contexts and avoid wholesale replacement of institution arrays because prior parser output contains wrapped/header tokens.
5. Keep all multi-faculty, casefold, and same-institution overlap contexts separate. Any curriculum or CCMAS decision must be made per source faculty/institution occurrence, not per display name.

## Change boundary

Only this append-only checkpoint script and its checkpoint artifacts are produced. No canonical JAMB/CCMAS data, offering ledger, domain map, seed, SQL, downstream link, or role data was edited.

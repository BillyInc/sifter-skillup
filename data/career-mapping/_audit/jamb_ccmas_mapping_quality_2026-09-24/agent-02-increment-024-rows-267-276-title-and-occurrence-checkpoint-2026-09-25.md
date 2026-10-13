# Partition 02 — increment 024: rows 267–276 checkpoint

Recorded 2026-09-25 (Africa/Lagos). Append-only review checkpoint; no canonical map/scope, seeds, or SQL edited.

## Coverage and key findings

- Sequentially checkpointed rows 217–276 (60/140 identities). Rows 267–276 checkpointed: 10/10; none closed to the full source-offering/course-outcome/descendant standard.
- Occurrence inventory: 10 identities / 10 parsed occurrence records; parser tokens remain unverified as official institution offerings pending JAMB PDF table/page checks.
- Selected course rows: 144 in partial-scope identities; rows 267 and 275 are zero-course combined/full component records. This does not mean their CCMAS packages are empty.
- Current candidate links 38; active map links 32; prior-map links 60. No full per-link subgroup/role acceptance (0/38). Three identities currently `review_required`/zero links: 267 Forestry, Wildlife & Fisheries; 275 Archaeology; rows 267 and 275 also have no current selected course rows.
- **Immediate high-priority blended-title gap—row 267:** `Forestry, Wildlife & Fisheries` references two distinct Agricultural Science CCMAS components (Forest Resources and Wildlife Management; Fisheries and Aquaculture), has zero selected courses, `combined_scope_review_required`, zero active links, and 16 links in the prior snapshot. This repeats the same high-priority issue flagged for row 266. It is a curriculum reconciliation gap, not proof the JAMB programme or curricula are unavailable. Verify the JAMB offering contexts and separate the forestry/wildlife and fisheries course/outcome paths before considering any links.
- Source access is available; exact JAMB offering cell and every downstream role remain open.
- Next sequential batch: rows 277–286.

## Parsed occurrence inventory

| Row | Identity | Occurrence ID / parsed source/faculty | Tokens | Official PDF offering table verified |
|---:|---|---|---:|---|
| 267 | Forestry, Wildlife & Fisheries | `672c216def10160c`; `agriculture.txt`; Agriculture | 3 | No |
| 268 | Plant Breeding and Seed Technology | `5607f3b3b50ecc51`; `agriculture.txt`; Agriculture | 2 | No |
| 269 | Home Economics | `886b42096b307d27`; `agriculture.txt`; Agriculture | 20 | No |
| 270 | Hotel Management & Tourism | `203d644373ba394f`; `agriculture.txt`; Agriculture | 11 | No |
| 271 | Home Science, Nutrition and Dietetics | `2f04471654281aaa`; `agriculture.txt`; Agriculture | 3 | No |
| 272 | Home Science & Management | `814eaf80f65df0f0`; `agriculture.txt`; Agriculture | 3 | No |
| 273 | Arabic Studies | `3e018750ff610788`; `arts_hum.txt`; Arts and Humanities | 41 | No |
| 274 | Arabic Language and Literature Studies | `c7d620531130864b`; `arts_hum.txt`; Arts and Humanities | 19 | No |
| 275 | Archaeology | `e42bc6aa5daa2eb8`; `arts_hum.txt`; Arts and Humanities | 8 | No |
| 276 | Classical Studies | `3959d2b020c79407`; `arts_hum.txt`; Arts and Humanities | 1 | No |

Primary curriculum sources consulted (accessed 2026-09-25): NUC [Agriculture CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Agriculture-2023.pdf), [Arts CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf), and JAMB [Degree Agriculture brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf) / [Degree Arts brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf). This increment did not verify exact printed JAMB institution/programme table rows; parser faculty is only a lead.

## Candidate curriculum and link assessment

### 267 — Forestry, Wildlife & Fisheries

Two components, Forest Resources and Wildlife Management plus Fisheries and Aquaculture; zero selected course rows, combined-scope review required. NUC Forestry/Wildlife goals and outcomes (Agriculture CCMAS printed pp. 315–317) cover sustainable forests/wildlife and renewable resources; FWM203 outcomes (p. 328) explicitly support remote-sensing/GPS/GIS applications; FWM204 outcomes (p. 329) cover forest/wildlife species, management and small enterprises. Fisheries/Aquaculture is a distinct programme package with its own courses. Current links 0; prior 16. Do not restore by title. Confirm whether the JAMB offering really combines both curricula, then create disjoint, source-located course sets and map the respective descendant roles.

### 268 — Plant Breeding and Seed Technology

`Agricultural Science::Crop Science`; 15 courses, including crop production, computer application, crop physiology, arable/permanent crops, pests/diseases, crop genetics/breeding, crop processing/storage, vegetable and seed production, crop protection, soil fertility/nutrition and irrigation. NUC Crop Science employability outcomes printed pp. 195–196 explicitly include seed-production enterprise and crop improvement/research. Links: D118 direct; D063, D096, D041, D047, D030 functional (6). Plant/crop breeding and seed technology are strongly relevant; economics, marketing, broad agriculture require narrow tasks; no domain descendants checked.

### 269 — Home Economics

`Agricultural Science::Family and Consumer Sciences`; 19 rows spanning family/child welfare, family dynamics, life education/planning, consumer/resource management, clothing construction/textile plus entrepreneurship; FCS431 appears as a not-found placeholder. NUC FCS structure describes separate specializations in family relations, resource management/extension, and clothing/textiles/interior decoration. Links D063, D078, D030, D047, D075 functional (5). Do not conflate the specializations or include FCS431 as a confirmed course; link relevance is candidate pending subgroup/task review.

### 270 — Hotel Management & Tourism

`Administration and Management::Hospitality and Tourism Management`; 26 HTM/TRM course rows covering tourism concepts, operations, hotel/catering, destinations, planning, ecotourism, SIWES, hotel business, service law, tourism economics/marketing/administration, policy and coastal tourism. D053 Hospitality and D083 Travel/Tourism direct; D028, D030, D062, D063 functional (6). NUC Administration/Management CCMAS describes the programme as hospitality and tourism training and provides course outcomes; however, repeated HTM403, TRM408 and HTM410 rows have duplicate/variant titles that need source reconciliation. Functional edges are not universal job requirements; descendant review open.

### 271 — Home Science, Nutrition and Dietetics

`Agricultural Science::Family and Consumer Sciences`; 11 rows identical to the FCS family/clothing-oriented slice described in row 269, including FCS431 not-found placeholder. No distinct NUT/dietetics course sequence is selected. Links D063, D030, D075 functional (3). This is a high-priority named-facet mismatch candidate: “Nutrition and Dietetics” is not established by family/consumer-science and clothing courses alone. Verify JAMB offering and whether a distinct Human Nutrition and Dietetics CCMAS component should be included; do not declare defect until source offering context is confirmed.

### 272 — Home Science & Management

Same FCS component and 11 selected courses as row 271, including the unresolved FCS431 placeholder. Links D063, D030, D075 functional (3). “Management” is not a standalone business curriculum in this slice. Do not infer nutrition or management career preparation from the title; compare actual JAMB offerings and program-specific course outcomes.

### 273 — Arabic Studies

`Arts::Arabic`; 31 rows spanning Arabic grammar, language drills, literature/history, semantics, rhetoric, phonetics/phonology, translation I/II, research, Arabic ICT, applied linguistics, lexicography and entrepreneurship. Links D065 Translation/Interpretation direct; D043 Journalism, D130 Recruitment/Employment, D039 Higher Education functional (4). NUC Arts CCMAS provides Arabic curriculum and translation/linguistics outcomes; direct translation study is supported, but only specific language-proficiency and interpreting tasks should be mapped. Journalism, recruitment and higher-education job routes need destination role evidence (and additional preparation where relevant).

### 274 — Arabic Language and Literature Studies

`Arts::Arabic`; 32 rows, substantially overlapping row 273 with an additional General Linguistics course. Same four links as row 273. Arabic language/literature curriculum is supported, but identity distinction versus row273 should be checked against original JAMB offering entries; shared courses do not automatically prove identical curriculum or role mapping. No descendants closed.

### 275 — Archaeology

`Arts::Archaeology`; full component inheritance but zero selected courses; `review_required`, no active links, six prior links. NUC Arts CCMAS has an Archaeology package; zero scope rows are not proof no curriculum. Extract course structure/outcomes and compare each prior candidate to archaeological tasks before restoring or rejecting.

### 276 — Classical Studies

`Arts::Classics`; six selected rows: Greek/Roman civilizations, epic poetry, society/institutions, entrepreneurship. Active D039 Higher Education functional (1). Classics curriculum supports classical-language/culture/historical learning; higher-education role fit requires further credentials and job-specific evidence. Six rows appear thin relative to a full classical-studies programme; compare against NUC course structure and resolve whether title and scope align.

## Map differences and closure

Current/prior links: 267 0/16; 268 6/6; 269 5/6; 270 6/9; 271 3/4; 272 3/4; 273 4/4; 274 4/4; 275 0/6; 276 1/1. All differences remain to be reconciled against evidence. No candidate is promoted; no canonical edit was made. For each link, subgroup and role descendants remain unreviewed.

## Open acceptance tasks

Verify exact JAMB printed page, offering name and institution cells for all ten. Reconcile selected and complete component course/outcome data, with priority on rows 267 and 271; assess each domain match/tier and every active descendant subgroup/role; add item-specific authoritative sources with direct URL/section/page/access date when CCMAS evidence is insufficient. Continue at rows 277–286.


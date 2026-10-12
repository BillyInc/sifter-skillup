# JAMB–CCMAS source increment 016 — identities 301–320

**Audit date:** 2026-09-26 (Africa/Lagos)  
**Mode:** bounded reconciliation after checkpoint 003; append-only  
**Assigned lane:** JAMB identity/offering and CCMAS/external source integrity only  
**Write boundary:** no shared source, mapping, scope, seed, SQL, UI, downstream taxonomy, domain, subgroup, or role file was edited.

## Exact coverage inspected

- Canonical JAMB identities: **20/20**, rows **301–320**.
- Current queue records: **20 identity rows**, **66 current issue records**.
- Current selected-course occurrences represented by those rows: **190**.
- Parsed offering occurrences represented by those rows: **21**.
- CCMAS/external components inspected through the current records: **Architecture::Architecture, Arts::African Languages and Literature Yoruba, Arts::Christian Theology, Arts::Efik, Arts::Linguistics, Communication and Media Studies::MASS COMMUNICATION — P12, P13, P14, Computing::Computer Science, Engineering::CIVIL ENGINEERING, Engineering::FOOD ENGINEERING, Engineering::FOOD SCIENCE AND TECHNOLOGY, Engineering::MATERIALS ENGINEERING, Engineering::NATURAL GAS ENGINEERING, Engineering::PETROLEUM AND GAS ENGINEERING, Engineering::SYSTEMS ENGINEERING, Engineering::WATER RESOURCES ENGINEERING, Environmental Sciences::Building, Environmental Sciences::Quantity Surveying, Social Sciences::Peace Studies and Conflict Resolution, Social Sciences::Political Science, Social Sciences::Sociology**.
- Prior row-level evidence was read first from the existing final-gap checkpoint(s) for rows **301–320**; already-verified facts were not re-researched.

## Records inspected

| Row | JAMB identity | Component reference(s) | Current scope state | Selected courses | Offering records | Current issue IDs |
|---:|---|---|---|---:|---:|---|
| 301 | Theology | Arts::Christian Theology | partial_scope_reviewed | 16 | 1 | SRC-00930, SRC-00931, SRC-00932, SRC-00933 |
| 302 | Yoruba | Arts::African Languages and Literature Yoruba | partial_scope_reviewed | 2 | 1 | SRC-00934, SRC-00935, SRC-00936 |
| 303 | Fulfulde | Arts::Linguistics | partial_scope_reviewed | 27 | 1 | SRC-00937, SRC-00938, SRC-00939, SRC-00940 |
| 304 | Efik-Ibibio | Arts::Efik | partial_scope_reviewed | 21 | 1 | SRC-00941, SRC-00942, SRC-00943, SRC-00944 |
| 305 | Communication Arts | Communication and Media Studies::MASS COMMUNICATION — P12, P13, P14 | partial_scope_reviewed | 35 | 1 | SRC-00945, SRC-00946, SRC-00947, SRC-00948 |
| 306 | Political Science and Conflict | Social Sciences::Political Science, Social Sciences::Peace Studies and Conflict Resolution | combined_scope_review_required | 0 | 1 | SRC-00949, SRC-00950, SRC-00951, SRC-00952 |
| 307 | Sociology | Social Sciences::Sociology | full | 0 | 2 | SRC-00953, SRC-00954 |
| 308 | Building | Environmental Sciences::Building | full | 0 | 1 | SRC-00955, SRC-00956 |
| 309 | Civil Engineering | Engineering::CIVIL ENGINEERING | full | 0 | 1 | SRC-00957, SRC-00958 |
| 310 | Computer and Information Science | Computing::Computer Science | partial_scope_reviewed | 12 | 1 | SRC-00959, SRC-00960, SRC-00961, SRC-00962 |
| 311 | Polymer and Textile Engineering | Engineering::MATERIALS ENGINEERING | partial_scope_reviewed | 8 | 1 | SRC-00963, SRC-00964, SRC-00965 |
| 312 | Water Resources and Environmental Engr | Engineering::WATER RESOURCES ENGINEERING | partial_scope_reviewed | 14 | 1 | SRC-00966, SRC-00967, SRC-00968 |
| 313 | Petroleum and Gas Engineering | Engineering::PETROLEUM AND GAS ENGINEERING | full | 0 | 1 | SRC-00969, SRC-00970 |
| 314 | Gas Engineering | Engineering::NATURAL GAS ENGINEERING | partial_scope_reviewed | 17 | 1 | SRC-00971, SRC-00972, SRC-00973, SRC-00974 |
| 315 | Systems Engineering | Engineering::SYSTEMS ENGINEERING | full | 0 | 1 | SRC-00975, SRC-00976 |
| 316 | Food Engineering | Engineering::FOOD ENGINEERING | full | 0 | 1 | SRC-00977, SRC-00978 |
| 317 | Food Science and Engineering | Engineering::FOOD SCIENCE AND TECHNOLOGY | partial_scope_reviewed | 19 | 1 | SRC-00979, SRC-00980, SRC-00981, SRC-00982 |
| 318 | Food Technology | Engineering::FOOD SCIENCE AND TECHNOLOGY | partial_scope_reviewed | 19 | 1 | SRC-00983, SRC-00984, SRC-00985, SRC-00986 |
| 319 | Architecture | Architecture::Architecture | full | 0 | 1 | SRC-00987, SRC-00988 |
| 320 | Quantity Surveying | Environmental Sciences::Quantity Surveying | full | 0 | 1 | SRC-00989, SRC-00990 |

## Current issue counts

- Confirmed gaps still open: **60**.
- Candidate issues still open: **1**.
- New issue classes discovered in this reconciliation: **0**.
- Closed findings reopened: **0**.
- Distinct exact evidence references captured: **192**.

By issue type/status:

- `combined_scope_zero_courses` / `confirmed_gap`: 1
- `offering_context_unverified` / `confirmed_gap`: 20
- `scope_evidence_missing` / `confirmed_gap`: 20
- `scope_semantic_review_required` / `candidate`: 1
- `selected_course_citation_incomplete` / `confirmed_gap`: 11
- `selected_course_content_or_outcome_gap` / `confirmed_gap`: 8

## Confirmed and candidate issue ledger

The following are current open records carried from the source issue queue. They are not claims that every record below is an academic-content defect; provenance, offering-context, and citation gaps remain distinct from content defects.

| Issue | Row | Status | Type | Evidence refs | Recommendation |
|---|---:|---|---|---|---|
| SRC-00930 | 301 | confirmed_gap | scope_evidence_missing | EV-001 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00931 | 301 | confirmed_gap | offering_context_unverified | EV-001 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00932 | 301 | confirmed_gap | selected_course_citation_incomplete | EV-002, EV-003, EV-004, EV-005, EV-006, EV-007, EV-008, EV-009, EV-010, EV-011, EV-012, EV-013, EV-014, EV-015, EV-016, EV-017 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00933 | 301 | confirmed_gap | selected_course_content_or_outcome_gap | EV-002, EV-003, EV-004, EV-005, EV-006, EV-007, EV-008, EV-009, EV-010, EV-011, EV-012, EV-013, EV-014, EV-015, EV-016, EV-017 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00934 | 302 | confirmed_gap | scope_evidence_missing | EV-018 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00935 | 302 | confirmed_gap | offering_context_unverified | EV-018 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00936 | 302 | confirmed_gap | selected_course_citation_incomplete | EV-019, EV-020 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00937 | 303 | confirmed_gap | scope_evidence_missing | EV-021 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00938 | 303 | confirmed_gap | offering_context_unverified | EV-021 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00939 | 303 | confirmed_gap | selected_course_citation_incomplete | EV-022, EV-023, EV-024, EV-025, EV-026, EV-027, EV-028, EV-029, EV-030, EV-031, EV-032, EV-033, EV-034, EV-035, EV-036, EV-037, EV-038, EV-039, EV-040, EV-041, EV-042, EV-043, EV-044, EV-045, EV-046, EV-047, EV-048 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00940 | 303 | confirmed_gap | selected_course_content_or_outcome_gap | EV-022, EV-023, EV-024, EV-025, EV-026, EV-027, EV-028, EV-029, EV-030, EV-031, EV-032, EV-033, EV-034, EV-035, EV-036, EV-037, EV-038, EV-039, EV-040, EV-041, EV-042, EV-043, EV-044, EV-045, EV-046, EV-047, EV-048 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00941 | 304 | confirmed_gap | scope_evidence_missing | EV-049 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00942 | 304 | confirmed_gap | offering_context_unverified | EV-049 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00943 | 304 | confirmed_gap | selected_course_citation_incomplete | EV-050, EV-051, EV-052, EV-053, EV-054, EV-055, EV-056, EV-057, EV-058, EV-059, EV-060, EV-061, EV-062, EV-063, EV-064, EV-065, EV-066, EV-067, EV-068, EV-069, EV-070 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00944 | 304 | confirmed_gap | selected_course_content_or_outcome_gap | EV-050, EV-051, EV-052, EV-053, EV-054, EV-055, EV-056, EV-057, EV-058, EV-059, EV-060, EV-061, EV-062, EV-063, EV-064, EV-065, EV-066, EV-067, EV-068, EV-069, EV-070 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00945 | 305 | confirmed_gap | scope_evidence_missing | EV-071 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00946 | 305 | confirmed_gap | offering_context_unverified | EV-071 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00947 | 305 | confirmed_gap | selected_course_citation_incomplete | EV-072, EV-073, EV-074, EV-075, EV-076, EV-077, EV-078, EV-079, EV-080, EV-081, EV-082, EV-083, EV-084, EV-085, EV-086, EV-087, EV-088, EV-089, EV-090, EV-091, EV-092, EV-093, EV-094, EV-095, EV-096, EV-097, EV-098, EV-099, EV-100, EV-101, EV-102, EV-103, EV-104, EV-105, EV-106 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00948 | 305 | confirmed_gap | selected_course_content_or_outcome_gap | EV-072, EV-073, EV-074, EV-075, EV-076, EV-077, EV-078, EV-079, EV-080, EV-081, EV-082, EV-083, EV-084, EV-085, EV-086, EV-087, EV-088, EV-089, EV-090, EV-091, EV-092, EV-093, EV-094, EV-095, EV-096, EV-097, EV-098, EV-099, EV-100, EV-101, EV-102, EV-103, EV-104, EV-105, EV-106 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00949 | 306 | confirmed_gap | scope_evidence_missing | EV-107 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00950 | 306 | confirmed_gap | offering_context_unverified | EV-107 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00951 | 306 | confirmed_gap | combined_scope_zero_courses | EV-107 | Build a bounded component-by-component evidence bundle; do not infer a union from the title or mark the programme unavailable solely because the local scope is empty. |
| SRC-00952 | 306 | candidate | scope_semantic_review_required | EV-107 | Reconcile the exact offering context, each named component, selected courses/outcomes, and supported student-facing status; a review label is not evidence of correctness. |
| SRC-00953 | 307 | confirmed_gap | scope_evidence_missing | EV-108, EV-109 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00954 | 307 | confirmed_gap | offering_context_unverified | EV-108, EV-109 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00955 | 308 | confirmed_gap | scope_evidence_missing | EV-110 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00956 | 308 | confirmed_gap | offering_context_unverified | EV-110 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00957 | 309 | confirmed_gap | scope_evidence_missing | EV-111 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00958 | 309 | confirmed_gap | offering_context_unverified | EV-111 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00959 | 310 | confirmed_gap | scope_evidence_missing | EV-112 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00960 | 310 | confirmed_gap | offering_context_unverified | EV-112 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00961 | 310 | confirmed_gap | selected_course_citation_incomplete | EV-113, EV-114, EV-115, EV-116, EV-117, EV-118, EV-119, EV-120, EV-121, EV-122, EV-123, EV-124 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00962 | 310 | confirmed_gap | selected_course_content_or_outcome_gap | EV-113, EV-114, EV-115, EV-116, EV-117, EV-118, EV-119, EV-120, EV-121, EV-122, EV-123, EV-124 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00963 | 311 | confirmed_gap | scope_evidence_missing | EV-125 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00964 | 311 | confirmed_gap | offering_context_unverified | EV-125 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00965 | 311 | confirmed_gap | selected_course_citation_incomplete | EV-126, EV-127, EV-128, EV-129, EV-130, EV-131, EV-132, EV-133 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00966 | 312 | confirmed_gap | scope_evidence_missing | EV-134 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00967 | 312 | confirmed_gap | offering_context_unverified | EV-134 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00968 | 312 | confirmed_gap | selected_course_citation_incomplete | EV-135, EV-136, EV-137, EV-138, EV-139, EV-140, EV-141, EV-142, EV-143, EV-144, EV-145, EV-146, EV-147, EV-148 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00969 | 313 | confirmed_gap | scope_evidence_missing | EV-149 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00970 | 313 | confirmed_gap | offering_context_unverified | EV-149 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00971 | 314 | confirmed_gap | scope_evidence_missing | EV-150 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00972 | 314 | confirmed_gap | offering_context_unverified | EV-150 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00973 | 314 | confirmed_gap | selected_course_citation_incomplete | EV-151, EV-152, EV-153, EV-154, EV-155, EV-156, EV-157, EV-158, EV-159, EV-160, EV-161, EV-162, EV-163, EV-164, EV-165, EV-166, EV-167 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00974 | 314 | confirmed_gap | selected_course_content_or_outcome_gap | EV-151, EV-152, EV-153, EV-154, EV-155, EV-156, EV-157, EV-158, EV-159, EV-160, EV-161, EV-162, EV-163, EV-164, EV-165, EV-166, EV-167 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00975 | 315 | confirmed_gap | scope_evidence_missing | EV-168 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00976 | 315 | confirmed_gap | offering_context_unverified | EV-168 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00977 | 316 | confirmed_gap | scope_evidence_missing | EV-169 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00978 | 316 | confirmed_gap | offering_context_unverified | EV-169 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00979 | 317 | confirmed_gap | scope_evidence_missing | EV-170 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00980 | 317 | confirmed_gap | offering_context_unverified | EV-170 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00981 | 317 | confirmed_gap | selected_course_citation_incomplete | EV-171, EV-172, EV-173, EV-174, EV-175, EV-176, EV-177, EV-178, EV-179, EV-180, EV-181, EV-182, EV-183, EV-184, EV-185, EV-186, EV-187, EV-188, EV-189 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00982 | 317 | confirmed_gap | selected_course_content_or_outcome_gap | EV-171, EV-172, EV-173, EV-174, EV-175, EV-176, EV-177, EV-178, EV-179, EV-180, EV-181, EV-182, EV-183, EV-184, EV-185, EV-186, EV-187, EV-188, EV-189 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00983 | 318 | confirmed_gap | scope_evidence_missing | EV-190 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00984 | 318 | confirmed_gap | offering_context_unverified | EV-190 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00985 | 318 | confirmed_gap | selected_course_citation_incomplete | EV-171, EV-172, EV-173, EV-174, EV-175, EV-176, EV-177, EV-178, EV-179, EV-180, EV-181, EV-182, EV-183, EV-184, EV-185, EV-186, EV-187, EV-188, EV-189 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00986 | 318 | confirmed_gap | selected_course_content_or_outcome_gap | EV-171, EV-172, EV-173, EV-174, EV-175, EV-176, EV-177, EV-178, EV-179, EV-180, EV-181, EV-182, EV-183, EV-184, EV-185, EV-186, EV-187, EV-188, EV-189 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00987 | 319 | confirmed_gap | scope_evidence_missing | EV-191 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00988 | 319 | confirmed_gap | offering_context_unverified | EV-191 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00989 | 320 | confirmed_gap | scope_evidence_missing | EV-192 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00990 | 320 | confirmed_gap | offering_context_unverified | EV-192 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |

## Exact evidence URLs, locators, and access dates

### Structured evidence references attached to issue records

| Ref | URL | Exact locator | Accessed |
|---|---|---|---|
| EV-001 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf | arts_hum.txt → parsed row ordinal 29 → Theology | 2026-09-26 |
| EV-002 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Christian Theology → course code CTH 106 | 2026-09-26 |
| EV-003 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Christian Theology → course code CTH 108 | 2026-09-26 |
| EV-004 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Christian Theology → course code CTH 109 | 2026-09-26 |
| EV-005 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Christian Theology → course code CTH 204 | 2026-09-26 |
| EV-006 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Christian Theology → course code CTH 206 | 2026-09-26 |
| EV-007 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Christian Theology → course code CTH 208 | 2026-09-26 |
| EV-008 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Christian Theology → course code CTH 303 | 2026-09-26 |
| EV-009 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Christian Theology → course code CTH 305 | 2026-09-26 |
| EV-010 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Christian Theology → course code CTH 306 | 2026-09-26 |
| EV-011 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Christian Theology → course code CTH 309 | 2026-09-26 |
| EV-012 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Christian Theology → course code CTH 311 | 2026-09-26 |
| EV-013 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Christian Theology → course code CTH 401 | 2026-09-26 |
| EV-014 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Christian Theology → course code CTH 404 | 2026-09-26 |
| EV-015 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Christian Theology → course code CTH 405 | 2026-09-26 |
| EV-016 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Christian Theology → course code CTH 408 | 2026-09-26 |
| EV-017 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Christian Theology → course code CTH 409 | 2026-09-26 |
| EV-018 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf | arts_hum.txt → parsed row ordinal 30 → Yoruba | 2026-09-26 |
| EV-019 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → African Languages and Literature Yoruba → course code YOU 101 | 2026-09-26 |
| EV-020 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → African Languages and Literature Yoruba → course code YOU 408 | 2026-09-26 |
| EV-021 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf | arts_hum.txt → parsed row ordinal 32 → Fulfulde | 2026-09-26 |
| EV-022 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 101 | 2026-09-26 |
| EV-023 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 102 | 2026-09-26 |
| EV-024 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 103 | 2026-09-26 |
| EV-025 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 104 | 2026-09-26 |
| EV-026 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 105 | 2026-09-26 |
| EV-027 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 106 | 2026-09-26 |
| EV-028 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 201 | 2026-09-26 |
| EV-029 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 202 | 2026-09-26 |
| EV-030 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 203 | 2026-09-26 |
| EV-031 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 204 | 2026-09-26 |
| EV-032 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 205 | 2026-09-26 |
| EV-033 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 206 | 2026-09-26 |
| EV-034 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 301 | 2026-09-26 |
| EV-035 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 302 | 2026-09-26 |
| EV-036 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 303 | 2026-09-26 |
| EV-037 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 306 | 2026-09-26 |
| EV-038 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 307 | 2026-09-26 |
| EV-039 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 308 | 2026-09-26 |
| EV-040 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 309 | 2026-09-26 |
| EV-041 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 401 | 2026-09-26 |
| EV-042 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 402 | 2026-09-26 |
| EV-043 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 403 | 2026-09-26 |
| EV-044 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 404 | 2026-09-26 |
| EV-045 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 406 | 2026-09-26 |
| EV-046 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 407 | 2026-09-26 |
| EV-047 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 409 | 2026-09-26 |
| EV-048 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 410 | 2026-09-26 |
| EV-049 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf | arts_hum.txt → parsed row ordinal 33 → Efik-Ibibio | 2026-09-26 |
| EV-050 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Efik → course code EFK 101 | 2026-09-26 |
| EV-051 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Efik → course code EFK 102 | 2026-09-26 |
| EV-052 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Efik → course code EFK 201 | 2026-09-26 |
| EV-053 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Efik → course code EFK 202 | 2026-09-26 |
| EV-054 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Efik → course code EFK 203 | 2026-09-26 |
| EV-055 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Efik → course code EFK 204 | 2026-09-26 |
| EV-056 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Efik → course code EFK 205 | 2026-09-26 |
| EV-057 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Efik → course code EFK 301 | 2026-09-26 |
| EV-058 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Efik → course code EFK 302 | 2026-09-26 |
| EV-059 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Efik → course code EFK 303 | 2026-09-26 |
| EV-060 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Efik → course code EFK 304 | 2026-09-26 |
| EV-061 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Efik → course code EFK 305 | 2026-09-26 |
| EV-062 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Efik → course code EFK 307 | 2026-09-26 |
| EV-063 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Efik → course code EFK 308 | 2026-09-26 |
| EV-064 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Efik → course code EFK 401 | 2026-09-26 |
| EV-065 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Efik → course code EFK 402 | 2026-09-26 |
| EV-066 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Efik → course code EFK 403 | 2026-09-26 |
| EV-067 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Efik → course code EFK 404 | 2026-09-26 |
| EV-068 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Efik → course code EFK 406 | 2026-09-26 |
| EV-069 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Efik → course code EFK 408 | 2026-09-26 |
| EV-070 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Efik → course code EFK 409 | 2026-09-26 |
| EV-071 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf | arts_hum.txt → parsed row ordinal 34 → Communication Arts | 2026-09-26 |
| EV-072 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code GST 111 | 2026-09-26 |
| EV-073 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code CMS 101 | 2026-09-26 |
| EV-074 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code CMS 102 | 2026-09-26 |
| EV-075 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code MCM 101 | 2026-09-26 |
| EV-076 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code MCM 102 | 2026-09-26 |
| EV-077 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code MCM 103 | 2026-09-26 |
| EV-078 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code MCM 104 | 2026-09-26 |
| EV-079 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code CMS 201 | 2026-09-26 |
| EV-080 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code MCM 204 | 2026-09-26 |
| EV-081 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code MCM 205 | 2026-09-26 |
| EV-082 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code MCM 206 | 2026-09-26 |
| EV-083 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code MCM 210 | 2026-09-26 |
| EV-084 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code MCM 215 | 2026-09-26 |
| EV-085 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code MCM 216 | 2026-09-26 |
| EV-086 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code CMS 301 | 2026-09-26 |
| EV-087 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code CMS 302 | 2026-09-26 |
| EV-088 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code CMS 303 | 2026-09-26 |
| EV-089 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code MCM 301 | 2026-09-26 |
| EV-090 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code MCM 302 | 2026-09-26 |
| EV-091 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code MCM 303 | 2026-09-26 |
| EV-092 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code MCM 304 | 2026-09-26 |
| EV-093 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code MCM 305 | 2026-09-26 |
| EV-094 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code MCM 306 | 2026-09-26 |
| EV-095 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code MCM 307 | 2026-09-26 |
| EV-096 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code MCM 308 | 2026-09-26 |
| EV-097 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code MCM 311 | 2026-09-26 |
| EV-098 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code MCM 315 | 2026-09-26 |
| EV-099 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code CMS 401 | 2026-09-26 |
| EV-100 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code CMS 402 | 2026-09-26 |
| EV-101 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code MCM 403 | 2026-09-26 |
| EV-102 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code MCM 404 | 2026-09-26 |
| EV-103 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code MCM 405 | 2026-09-26 |
| EV-104 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code MCM 406 | 2026-09-26 |
| EV-105 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code MCM 407 | 2026-09-26 |
| EV-106 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code MCM 409 | 2026-09-26 |
| EV-107 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf | arts_hum.txt → parsed row ordinal 35 → Political Science and Conflict | 2026-09-26 |
| EV-108 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf | arts_hum.txt → parsed row ordinal 36 → Sociology | 2026-09-26 |
| EV-109 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf | Social Management Science.pdf → parsed row ordinal 50 → Sociology | 2026-09-26 |
| EV-110 | none | engineering.txt → parsed row ordinal 1 → Building | 2026-09-26 |
| EV-111 | none | engineering.txt → parsed row ordinal 2 → Civil Engineering | 2026-09-26 |
| EV-112 | none | engineering.txt → parsed row ordinal 3 → Computer and Information Science | 2026-09-26 |
| EV-113 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Computer Science → course code COS 101 | 2026-09-26 |
| EV-114 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Computer Science → course code COS 201 | 2026-09-26 |
| EV-115 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Computer Science → course code COS 202 | 2026-09-26 |
| EV-116 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Computer Science → course code IFT 212 | 2026-09-26 |
| EV-117 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Computer Science → course code SEN 201 | 2026-09-26 |
| EV-118 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Computer Science → course code CSC 301 | 2026-09-26 |
| EV-119 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Computer Science → course code CSC 308 | 2026-09-26 |
| EV-120 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Computer Science → course code CSC 322 | 2026-09-26 |
| EV-121 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Computer Science → course code DTS 304 | 2026-09-26 |
| EV-122 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Computer Science → course code ICT 305 | 2026-09-26 |
| EV-123 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Computer Science → course code CSC 401 | 2026-09-26 |
| EV-124 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Computer Science → course code CSC 402 | 2026-09-26 |
| EV-125 | none | engineering.txt → parsed row ordinal 4 → Polymer and Textile Engineering | 2026-09-26 |
| EV-126 | https://www.nuc.edu.ng/ccmas/ | engineering.json → MATERIALS ENGINEERING → course code MSE 101 | 2026-09-26 |
| EV-127 | https://www.nuc.edu.ng/ccmas/ | engineering.json → MATERIALS ENGINEERING → course code GET 202 | 2026-09-26 |
| EV-128 | https://www.nuc.edu.ng/ccmas/ | engineering.json → MATERIALS ENGINEERING → course code GET 208 | 2026-09-26 |
| EV-129 | https://www.nuc.edu.ng/ccmas/ | engineering.json → MATERIALS ENGINEERING → course code GET 209 | 2026-09-26 |
| EV-130 | https://www.nuc.edu.ng/ccmas/ | engineering.json → MATERIALS ENGINEERING → course code MSE 303 | 2026-09-26 |
| EV-131 | https://www.nuc.edu.ng/ccmas/ | engineering.json → MATERIALS ENGINEERING → course code MSE 305 | 2026-09-26 |
| EV-132 | https://www.nuc.edu.ng/ccmas/ | engineering.json → MATERIALS ENGINEERING → course code MSE 403 | 2026-09-26 |
| EV-133 | https://www.nuc.edu.ng/ccmas/ | engineering.json → MATERIALS ENGINEERING → course code MSE 503 | 2026-09-26 |
| EV-134 | none | engineering.txt → parsed row ordinal 5 → Water Resources and Environmental Engr | 2026-09-26 |
| EV-135 | https://www.nuc.edu.ng/ccmas/ | engineering.json → WATER RESOURCES ENGINEERING → course code WRE 101 | 2026-09-26 |
| EV-136 | https://www.nuc.edu.ng/ccmas/ | engineering.json → WATER RESOURCES ENGINEERING → course code GET 299 | 2026-09-26 |
| EV-137 | https://www.nuc.edu.ng/ccmas/ | engineering.json → WATER RESOURCES ENGINEERING → course code ENT 312 | 2026-09-26 |
| EV-138 | https://www.nuc.edu.ng/ccmas/ | engineering.json → WATER RESOURCES ENGINEERING → course code GET 306 | 2026-09-26 |
| EV-139 | https://www.nuc.edu.ng/ccmas/ | engineering.json → WATER RESOURCES ENGINEERING → course code WRE 301 | 2026-09-26 |
| EV-140 | https://www.nuc.edu.ng/ccmas/ | engineering.json → WATER RESOURCES ENGINEERING → course code WRE 303 | 2026-09-26 |
| EV-141 | https://www.nuc.edu.ng/ccmas/ | engineering.json → WATER RESOURCES ENGINEERING → course code WRE 308 | 2026-09-26 |
| EV-142 | https://www.nuc.edu.ng/ccmas/ | engineering.json → WATER RESOURCES ENGINEERING → course code WRE 403 | 2026-09-26 |
| EV-143 | https://www.nuc.edu.ng/ccmas/ | engineering.json → WATER RESOURCES ENGINEERING → course code GET 501 | 2026-09-26 |
| EV-144 | https://www.nuc.edu.ng/ccmas/ | engineering.json → WATER RESOURCES ENGINEERING → course code WRE 503 | 2026-09-26 |
| EV-145 | https://www.nuc.edu.ng/ccmas/ | engineering.json → WATER RESOURCES ENGINEERING → course code WRE 504 | 2026-09-26 |
| EV-146 | https://www.nuc.edu.ng/ccmas/ | engineering.json → WATER RESOURCES ENGINEERING → course code WRE 505 | 2026-09-26 |
| EV-147 | https://www.nuc.edu.ng/ccmas/ | engineering.json → WATER RESOURCES ENGINEERING → course code WRE 506 | 2026-09-26 |
| EV-148 | https://www.nuc.edu.ng/ccmas/ | engineering.json → WATER RESOURCES ENGINEERING → course code WRE 507 | 2026-09-26 |
| EV-149 | none | engineering.txt → parsed row ordinal 6 → Petroleum and Gas Engineering | 2026-09-26 |
| EV-150 | none | engineering.txt → parsed row ordinal 7 → Gas Engineering | 2026-09-26 |
| EV-151 | https://www.nuc.edu.ng/ccmas/ | engineering.json → NATURAL GAS ENGINEERING → course code PHY 103 | 2026-09-26 |
| EV-152 | https://www.nuc.edu.ng/ccmas/ | engineering.json → NATURAL GAS ENGINEERING → course code GNG 113 | 2026-09-26 |
| EV-153 | https://www.nuc.edu.ng/ccmas/ | engineering.json → NATURAL GAS ENGINEERING → course code GET 204 | 2026-09-26 |
| EV-154 | https://www.nuc.edu.ng/ccmas/ | engineering.json → NATURAL GAS ENGINEERING → course code GET 206 | 2026-09-26 |
| EV-155 | https://www.nuc.edu.ng/ccmas/ | engineering.json → NATURAL GAS ENGINEERING → course code GNG 203 | 2026-09-26 |
| EV-156 | https://www.nuc.edu.ng/ccmas/ | engineering.json → NATURAL GAS ENGINEERING → course code GET 306 | 2026-09-26 |
| EV-157 | https://www.nuc.edu.ng/ccmas/ | engineering.json → NATURAL GAS ENGINEERING → course code PNG 310 | 2026-09-26 |
| EV-158 | https://www.nuc.edu.ng/ccmas/ | engineering.json → NATURAL GAS ENGINEERING → course code PNG 312 | 2026-09-26 |
| EV-159 | https://www.nuc.edu.ng/ccmas/ | engineering.json → NATURAL GAS ENGINEERING → course code GNG 316 | 2026-09-26 |
| EV-160 | https://www.nuc.edu.ng/ccmas/ | engineering.json → NATURAL GAS ENGINEERING → course code GET 404 | 2026-09-26 |
| EV-161 | https://www.nuc.edu.ng/ccmas/ | engineering.json → NATURAL GAS ENGINEERING → course code GNG 405 | 2026-09-26 |
| EV-162 | https://www.nuc.edu.ng/ccmas/ | engineering.json → NATURAL GAS ENGINEERING → course code GNG 407 | 2026-09-26 |
| EV-163 | https://www.nuc.edu.ng/ccmas/ | engineering.json → NATURAL GAS ENGINEERING → course code GNG 409 | 2026-09-26 |
| EV-164 | https://www.nuc.edu.ng/ccmas/ | engineering.json → NATURAL GAS ENGINEERING → course code GNG 413 | 2026-09-26 |
| EV-165 | https://www.nuc.edu.ng/ccmas/ | engineering.json → NATURAL GAS ENGINEERING → course code GNG 511 | 2026-09-26 |
| EV-166 | https://www.nuc.edu.ng/ccmas/ | engineering.json → NATURAL GAS ENGINEERING → course code GNG 504 | 2026-09-26 |
| EV-167 | https://www.nuc.edu.ng/ccmas/ | engineering.json → NATURAL GAS ENGINEERING → course code GNG 513 | 2026-09-26 |
| EV-168 | none | engineering.txt → parsed row ordinal 9 → Systems Engineering | 2026-09-26 |
| EV-169 | none | engineering.txt → parsed row ordinal 10 → Food Engineering | 2026-09-26 |
| EV-170 | none | engineering.txt → parsed row ordinal 11 → Food Science and Engineering | 2026-09-26 |
| EV-171 | https://www.nuc.edu.ng/ccmas/ | engineering.json → FOOD SCIENCE AND TECHNOLOGY → course code FST 102 | 2026-09-26 |
| EV-172 | https://www.nuc.edu.ng/ccmas/ | engineering.json → FOOD SCIENCE AND TECHNOLOGY → course code HND 212 | 2026-09-26 |
| EV-173 | https://www.nuc.edu.ng/ccmas/ | engineering.json → FOOD SCIENCE AND TECHNOLOGY → course code MCB 201 | 2026-09-26 |
| EV-174 | https://www.nuc.edu.ng/ccmas/ | engineering.json → FOOD SCIENCE AND TECHNOLOGY → course code MME 202 | 2026-09-26 |
| EV-175 | https://www.nuc.edu.ng/ccmas/ | engineering.json → FOOD SCIENCE AND TECHNOLOGY → course code FST 204 | 2026-09-26 |
| EV-176 | https://www.nuc.edu.ng/ccmas/ | engineering.json → FOOD SCIENCE AND TECHNOLOGY → course code FST 222 | 2026-09-26 |
| EV-177 | https://www.nuc.edu.ng/ccmas/ | engineering.json → FOOD SCIENCE AND TECHNOLOGY → course code FST 300 | 2026-09-26 |
| EV-178 | https://www.nuc.edu.ng/ccmas/ | engineering.json → FOOD SCIENCE AND TECHNOLOGY → course code FST 304 | 2026-09-26 |
| EV-179 | https://www.nuc.edu.ng/ccmas/ | engineering.json → FOOD SCIENCE AND TECHNOLOGY → course code FST 306 | 2026-09-26 |
| EV-180 | https://www.nuc.edu.ng/ccmas/ | engineering.json → FOOD SCIENCE AND TECHNOLOGY → course code FST 331 | 2026-09-26 |
| EV-181 | https://www.nuc.edu.ng/ccmas/ | engineering.json → FOOD SCIENCE AND TECHNOLOGY → course code FST 333 | 2026-09-26 |
| EV-182 | https://www.nuc.edu.ng/ccmas/ | engineering.json → FOOD SCIENCE AND TECHNOLOGY → course code FST 334 | 2026-09-26 |
| EV-183 | https://www.nuc.edu.ng/ccmas/ | engineering.json → FOOD SCIENCE AND TECHNOLOGY → course code FST 402 | 2026-09-26 |
| EV-184 | https://www.nuc.edu.ng/ccmas/ | engineering.json → FOOD SCIENCE AND TECHNOLOGY → course code FST 403 | 2026-09-26 |
| EV-185 | https://www.nuc.edu.ng/ccmas/ | engineering.json → FOOD SCIENCE AND TECHNOLOGY → course code FST 405 | 2026-09-26 |
| EV-186 | https://www.nuc.edu.ng/ccmas/ | engineering.json → FOOD SCIENCE AND TECHNOLOGY → course code FST 415 | 2026-09-26 |
| EV-187 | https://www.nuc.edu.ng/ccmas/ | engineering.json → FOOD SCIENCE AND TECHNOLOGY → course code FST 508 | 2026-09-26 |
| EV-188 | https://www.nuc.edu.ng/ccmas/ | engineering.json → FOOD SCIENCE AND TECHNOLOGY → course code FST 511 | 2026-09-26 |
| EV-189 | https://www.nuc.edu.ng/ccmas/ | engineering.json → FOOD SCIENCE AND TECHNOLOGY → course code FST 513 | 2026-09-26 |
| EV-190 | none | engineering.txt → parsed row ordinal 12 → Food Technology | 2026-09-26 |
| EV-191 | none | engineering.txt → parsed row ordinal 13 → Architecture | 2026-09-26 |
| EV-192 | none | engineering.txt → parsed row ordinal 14 → Quantity Surveying | 2026-09-26 |

### Authoritative source packages read in the prior row-level verification

| URL | Exact locator | Accessed |
|---|---|---|
| https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-law.pdf | printed pp.419, 427-429; rows 001-006 | 2026-09-26 |
| https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf | printed pp.574, 616-617, 628-629, 683; rows 007-019 | 2026-09-26 |
| https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf | printed p.44; separate faculty context for row 018/019 | 2026-09-26 |
| https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf | printed pp.239, 241; separate Arts occurrences for rows 040, 045 and 050 | 2026-09-26 |
| https://www.nuc.edu.ng/wp-content/uploads/2026/03/Law-ALL.pdf | printed pp.27-28, 38-45, 52, 56 onward, 68, 72, 77, 80, 88; rows 001-006 | 2026-09-26 |
| https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | printed pp.26, 28-29, 33, 38-39, 48-52, 71-72, 95-107, 162-180; rows 005, 007-017, 020 | 2026-09-26 |
| https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | printed pp.326, 339, 739-742; bounded Operations Research/Statistics lead for row 016 | 2026-09-26 |
| https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | printed pp.183, 185-186, 197-202; rows 018-019 | 2026-09-26 |
| https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | Arts curriculum package used only for bounded source comparison in rows 040, 045 and 050 | 2026-09-26 |
| https://sdg.abuad.edu.ng/wp-content/uploads/2020/04/ABUAD_Course_Databank_2020.pdf | printed pp.93-95; institution-specific Intelligence and Security Studies evidence for row 020 | 2026-09-26 |
| https://admissions.covenantuniversity.edu.ng/wp-content/uploads/2024/02/CU-2024-Undergraduate-Prospectus-Covenant-University-Ota_.pdf | Covenant undergraduate prospectus; institution-specific Policy and Strategic Studies lead for row 030 | 2026-09-26 |
| https://eprints.covenantuniversity.edu.ng/3271/1/CLDS%20HANDBOOK.pdf | printed 2014-2017 handbook; historical Covenant curriculum lead for row 030, currency not assumed | 2026-09-26 |
| https://www.abuad.edu.ng/b-sc-social-justice-programme/ | ABUAD B.Sc Social Justice programme page; institution-specific evidence for row 032 | 2026-09-26 |

## Prior checkpoint and non-repetition controls

Read before this increment:

- `data/career-mapping/_audit/jamb_ccmas_source_phase_checkpoint_2026-09-26_003.json`
- `data/career-mapping/_audit/jamb_ccmas_source_phase_checkpoint_2026-09-26_003.md`
- `data/career-mapping/_audit/jamb_ccmas_final_verification_rows_281_420_2026-09-26_003.md`
- `data/career-mapping/_audit/jamb_ccmas_final_verification_rows_281_420_2026-09-26_004.md`
- `data/career-mapping/_audit/jamb_ccmas_source_issue_queue_2026-09-26_001.json`
- `data/career-mapping/_audit/jamb_ccmas_source_issue_queue_2026-09-26_001.md`
- `data/career-mapping/_audit/jamb_curriculum_scopes_2026-08-17.json`
- `data/career-mapping/_audit/jamb_anomaly_inventory_2026-09-26.json`
- `data/career-mapping/_audit/jamb_offering_context_inventory_2026-09-25.json`
- `data/career-mapping/_audit/ccmas_extraction_anomaly_inventory_2026-09-26.json`


Closed work intentionally not reopened: French Arts anchor correction; Film and Video Studies Social/Management occurrence addition; recorded CCMAS page-header repairs; CAM424 equipment-spill repair; DTS498/CSC432 cross-reference repair; and replacement-character normalization classified as encoding-only.

## Disposition and resume boundary

This increment reconciles the current **301–320** queue against the prior row-level evidence. It does **not** close any identity: scope evidence, exact offering context, selected-course fidelity, item-level citations, and external/custom provenance remain open where listed. It performs no downstream domain/subgroup/role audit.

The next bounded increment is **identities 321–340**, maximum **20 identities/packages**, and must save its own append-only JSON/Markdown checkpoint before proceeding.

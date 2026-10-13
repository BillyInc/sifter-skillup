# JAMB–CCMAS source increment 007 — identities 121–140

**Audit date:** 2026-09-26 (Africa/Lagos)  
**Mode:** bounded reconciliation after checkpoint 003; append-only  
**Assigned lane:** JAMB identity/offering and CCMAS/external source integrity only  
**Write boundary:** no shared source, mapping, scope, seed, SQL, UI, downstream taxonomy, domain, subgroup, or role file was edited.

## Exact coverage inspected

- Canonical JAMB identities: **20/20**, rows **121–140**.
- Current queue records: **20 identity rows**, **66 current issue records**.
- Current selected-course occurrences represented by those rows: **301**.
- Parsed offering occurrences represented by those rows: **21**.
- CCMAS/external components inspected through the current records: **Computing::Computer Science, Computing::Data Science, Computing::Information and Communication Technology, Sciences::Applied Geophysics, Sciences::Biology, Sciences::Biotechnology, Sciences::Botany, Sciences::Chemistry, Sciences::Environmental Management and Toxicology, Sciences::Forensic Science, Sciences::Geology, Sciences::Industrial Chemistry, Sciences::Industrial Physics, Sciences::Mathematics, Sciences::Meteorology, Sciences::Microbiology, Sciences::Petroleum Chemistry, Sciences::Statistics, Sciences::Zoology**.
- Prior row-level evidence was read first from the existing final-gap checkpoint(s) for rows **121–140**; already-verified facts were not re-researched.

## Records inspected

| Row | JAMB identity | Component reference(s) | Current scope state | Selected courses | Offering records | Current issue IDs |
|---:|---|---|---|---:|---:|---|
| 121 | Data Science | Computing::Data Science | full | 0 | 1 | SRC-00351, SRC-00352 |
| 122 | Environmental Management and Toxicology | Sciences::Environmental Management and Toxicology | full | 0 | 1 | SRC-00353, SRC-00354 |
| 123 | FORENSIC SCIENCE | Sciences::Forensic Science | full | 0 | 1 | SRC-00355, SRC-00356 |
| 124 | Applied Geophysics | Sciences::Applied Geophysics | full | 0 | 1 | SRC-00357, SRC-00358 |
| 125 | INFORMATION AND COMMUNICATION TECHNOLOGY | Computing::Information and Communication Technology | full | 0 | 1 | SRC-00359, SRC-00360 |
| 126 | Animal and Environmental Biology | Sciences::Zoology | partial_scope_reviewed | 23 | 1 | SRC-00361, SRC-00362, SRC-00363 |
| 127 | Geophysics | Sciences::Applied Geophysics | partial_scope_reviewed | 17 | 1 | SRC-00364, SRC-00365, SRC-00366 |
| 128 | Industrial Physics | Sciences::Industrial Physics | full | 0 | 1 | SRC-00367, SRC-00368 |
| 129 | Mathematics with Statistics / Mathematics/Statistics / Mathematics and Statistics | Sciences::Statistics | partial_scope_reviewed | 17 | 1 | SRC-00369, SRC-00370, SRC-00371 |
| 130 | Petroleum Chemistry | Sciences::Petroleum Chemistry | full | 0 | 1 | SRC-00372, SRC-00373 |
| 131 | Pure and Industrial Chemistry | Sciences::Industrial Chemistry | partial_scope_reviewed | 25 | 1 | SRC-00374, SRC-00375, SRC-00376, SRC-00377 |
| 132 | APPLIED BIOLOGY | Sciences::Biology | partial_scope_reviewed | 19 | 1 | SRC-00378, SRC-00379, SRC-00380 |
| 133 | METEOROLOGY | Sciences::Meteorology | full | 0 | 1 | SRC-00381, SRC-00382 |
| 134 | Geology and Mining | Sciences::Geology | partial_scope_reviewed | 22 | 1 | SRC-00383, SRC-00384, SRC-00385 |
| 135 | Mathematics with Computer Science | Computing::Computer Science, Sciences::Mathematics | combined_scope_review_required | 77 | 1 | SRC-00386, SRC-00387, SRC-00388 |
| 136 | Applied Microbiology and Brewing / Applied Microbiology | Sciences::Microbiology | partial_scope_reviewed | 12 | 1 | SRC-00389, SRC-00390, SRC-00391 |
| 137 | Pure and Applied Chemistry | Sciences::Chemistry | partial_scope_reviewed | 23 | 1 | SRC-00392, SRC-00393, SRC-00394 |
| 138 | Plant Biology | Sciences::Botany | partial_scope_reviewed | 27 | 1 | SRC-00395, SRC-00396, SRC-00397 |
| 139 | Plant Science | Sciences::Botany | partial_scope_reviewed | 24 | 2 | SRC-00398, SRC-00399, SRC-00400 |
| 140 | Genetics and Biotechnology | Sciences::Biotechnology | partial_scope_reviewed | 15 | 1 | SRC-00401, SRC-00402, SRC-00403 |

## Current issue counts

- Confirmed gaps still open: **52**.
- Candidate issues still open: **1**.
- New issue classes discovered in this reconciliation: **0**.
- Closed findings reopened: **0**.
- Distinct exact evidence references captured: **224**.

By issue type/status:

- `offering_context_unverified` / `confirmed_gap`: 20
- `scope_evidence_missing` / `confirmed_gap`: 19
- `scope_semantic_review_required` / `candidate`: 1
- `selected_course_citation_incomplete` / `confirmed_gap`: 11
- `selected_course_content_or_outcome_gap` / `confirmed_gap`: 2

## Confirmed and candidate issue ledger

The following are current open records carried from the source issue queue. They are not claims that every record below is an academic-content defect; provenance, offering-context, and citation gaps remain distinct from content defects.

| Issue | Row | Status | Type | Evidence refs | Recommendation |
|---|---:|---|---|---|---|
| SRC-00351 | 121 | confirmed_gap | scope_evidence_missing | EV-001 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00352 | 121 | confirmed_gap | offering_context_unverified | EV-001 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00353 | 122 | confirmed_gap | scope_evidence_missing | EV-002 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00354 | 122 | confirmed_gap | offering_context_unverified | EV-002 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00355 | 123 | confirmed_gap | scope_evidence_missing | EV-003 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00356 | 123 | confirmed_gap | offering_context_unverified | EV-003 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00357 | 124 | confirmed_gap | scope_evidence_missing | EV-004 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00358 | 124 | confirmed_gap | offering_context_unverified | EV-004 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00359 | 125 | confirmed_gap | scope_evidence_missing | EV-005 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00360 | 125 | confirmed_gap | offering_context_unverified | EV-005 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00361 | 126 | confirmed_gap | scope_evidence_missing | EV-006 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00362 | 126 | confirmed_gap | offering_context_unverified | EV-006 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00363 | 126 | confirmed_gap | selected_course_citation_incomplete | EV-007, EV-008, EV-009, EV-010, EV-011, EV-012, EV-013, EV-014, EV-015, EV-016, EV-017, EV-018, EV-019, EV-020, EV-021, EV-022, EV-023, EV-024, EV-025, EV-026, EV-027, EV-028, EV-029 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00364 | 127 | confirmed_gap | scope_evidence_missing | EV-030 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00365 | 127 | confirmed_gap | offering_context_unverified | EV-030 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00366 | 127 | confirmed_gap | selected_course_citation_incomplete | EV-031, EV-032, EV-033, EV-034, EV-035, EV-036, EV-037, EV-038, EV-039, EV-040, EV-041, EV-042, EV-043, EV-044, EV-045, EV-046, EV-047 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00367 | 128 | confirmed_gap | scope_evidence_missing | EV-048 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00368 | 128 | confirmed_gap | offering_context_unverified | EV-048 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00369 | 129 | confirmed_gap | scope_evidence_missing | EV-049 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00370 | 129 | confirmed_gap | offering_context_unverified | EV-049 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00371 | 129 | confirmed_gap | selected_course_citation_incomplete | EV-050, EV-051, EV-052, EV-053, EV-054, EV-055, EV-056, EV-057, EV-058, EV-059, EV-060, EV-061, EV-062, EV-063, EV-064, EV-065, EV-066 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00372 | 130 | confirmed_gap | scope_evidence_missing | EV-067 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00373 | 130 | confirmed_gap | offering_context_unverified | EV-067 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00374 | 131 | confirmed_gap | scope_evidence_missing | EV-068 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00375 | 131 | confirmed_gap | offering_context_unverified | EV-068 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00376 | 131 | confirmed_gap | selected_course_citation_incomplete | EV-069, EV-070, EV-071, EV-072, EV-073, EV-074, EV-075, EV-076, EV-077, EV-078, EV-079, EV-080, EV-081, EV-082, EV-083, EV-084, EV-085, EV-086, EV-087, EV-088, EV-089, EV-090, EV-091, EV-092, EV-093 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00377 | 131 | confirmed_gap | selected_course_content_or_outcome_gap | EV-069, EV-070, EV-071, EV-072, EV-073, EV-074, EV-075, EV-076, EV-077, EV-078, EV-079, EV-080, EV-081, EV-082, EV-083, EV-084, EV-085, EV-086, EV-087, EV-088, EV-089, EV-090, EV-091, EV-092, EV-093 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00378 | 132 | confirmed_gap | scope_evidence_missing | EV-094 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00379 | 132 | confirmed_gap | offering_context_unverified | EV-094 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00380 | 132 | confirmed_gap | selected_course_citation_incomplete | EV-095, EV-096, EV-097, EV-098, EV-099, EV-100, EV-101, EV-102, EV-103, EV-104, EV-105, EV-106, EV-107, EV-108, EV-109, EV-110, EV-111, EV-112, EV-113 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00381 | 133 | confirmed_gap | scope_evidence_missing | EV-114 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00382 | 133 | confirmed_gap | offering_context_unverified | EV-114 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00383 | 134 | confirmed_gap | scope_evidence_missing | EV-115 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00384 | 134 | confirmed_gap | offering_context_unverified | EV-115 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00385 | 134 | confirmed_gap | selected_course_citation_incomplete | EV-116, EV-117, EV-118, EV-119, EV-120, EV-121, EV-122, EV-123, EV-124, EV-125, EV-126, EV-127, EV-128, EV-129, EV-130, EV-131, EV-132, EV-133, EV-134, EV-135, EV-136, EV-137 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00386 | 135 | confirmed_gap | offering_context_unverified | EV-138 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00387 | 135 | confirmed_gap | selected_course_content_or_outcome_gap | EV-139, EV-140, EV-141 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00388 | 135 | candidate | scope_semantic_review_required | EV-139, EV-140, EV-141 | Reconcile the exact offering context, each named component, selected courses/outcomes, and supported student-facing status; a review label is not evidence of correctness. |
| SRC-00389 | 136 | confirmed_gap | scope_evidence_missing | EV-142 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00390 | 136 | confirmed_gap | offering_context_unverified | EV-142 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00391 | 136 | confirmed_gap | selected_course_citation_incomplete | EV-143, EV-144, EV-145, EV-146, EV-147, EV-148, EV-149, EV-150, EV-151, EV-152, EV-153, EV-154 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00392 | 137 | confirmed_gap | scope_evidence_missing | EV-155 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00393 | 137 | confirmed_gap | offering_context_unverified | EV-155 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00394 | 137 | confirmed_gap | selected_course_citation_incomplete | EV-156, EV-157, EV-158, EV-159, EV-160, EV-161, EV-162, EV-163, EV-164, EV-165, EV-166, EV-167, EV-168, EV-169, EV-170, EV-171, EV-172, EV-173, EV-174, EV-175, EV-176, EV-177, EV-178 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00395 | 138 | confirmed_gap | scope_evidence_missing | EV-179 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00396 | 138 | confirmed_gap | offering_context_unverified | EV-179 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00397 | 138 | confirmed_gap | selected_course_citation_incomplete | EV-180, EV-181, EV-182, EV-183, EV-184, EV-185, EV-186, EV-187, EV-188, EV-189, EV-190, EV-191, EV-192, EV-193, EV-194, EV-195, EV-196, EV-197, EV-198, EV-199, EV-200, EV-201, EV-202, EV-203, EV-204, EV-205, EV-206 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00398 | 139 | confirmed_gap | scope_evidence_missing | EV-207, EV-208 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00399 | 139 | confirmed_gap | offering_context_unverified | EV-207, EV-208 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00400 | 139 | confirmed_gap | selected_course_citation_incomplete | EV-181, EV-183, EV-184, EV-185, EV-187, EV-188, EV-189, EV-190, EV-191, EV-192, EV-193, EV-194, EV-195, EV-196, EV-197, EV-198, EV-199, EV-200, EV-201, EV-202, EV-203, EV-204, EV-205, EV-206 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00401 | 140 | confirmed_gap | scope_evidence_missing | EV-209 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00402 | 140 | confirmed_gap | offering_context_unverified | EV-209 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00403 | 140 | confirmed_gap | selected_course_citation_incomplete | EV-210, EV-211, EV-212, EV-213, EV-214, EV-215, EV-216, EV-217, EV-218, EV-219, EV-220, EV-221, EV-222, EV-223, EV-224 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |

## Exact evidence URLs, locators, and access dates

### Structured evidence references attached to issue records

| Ref | URL | Exact locator | Accessed |
|---|---|---|---|
| EV-001 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 22 → Data Science | 2026-09-26 |
| EV-002 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 23 → Environmental Management and Toxicology | 2026-09-26 |
| EV-003 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 24 → FORENSIC SCIENCE | 2026-09-26 |
| EV-004 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 25 → Applied Geophysics | 2026-09-26 |
| EV-005 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 26 → INFORMATION AND COMMUNICATION TECHNOLOGY | 2026-09-26 |
| EV-006 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 27 → Animal and Environmental Biology | 2026-09-26 |
| EV-007 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Zoology → course code BIO 101 | 2026-09-26 |
| EV-008 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Zoology → course code BIO 102 | 2026-09-26 |
| EV-009 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Zoology → course code BIO 107 | 2026-09-26 |
| EV-010 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Zoology → course code BIO 108 | 2026-09-26 |
| EV-011 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Zoology → course code ZOO 101 | 2026-09-26 |
| EV-012 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Zoology → course code ZOO 102 | 2026-09-26 |
| EV-013 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Zoology → course code BIO 203 | 2026-09-26 |
| EV-014 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Zoology → course code STA 201 | 2026-09-26 |
| EV-015 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Zoology → course code ZOO 211 | 2026-09-26 |
| EV-016 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Zoology → course code ZOO 212 | 2026-09-26 |
| EV-017 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Zoology → course code ENT 312 | 2026-09-26 |
| EV-018 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Zoology → course code BIO 307 | 2026-09-26 |
| EV-019 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Zoology → course code ZOO 301 | 2026-09-26 |
| EV-020 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Zoology → course code ZOO 311 | 2026-09-26 |
| EV-021 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Zoology → course code ZOO 312 | 2026-09-26 |
| EV-022 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Zoology → course code ZOO 313 | 2026-09-26 |
| EV-023 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Zoology → course code ZOO 318 | 2026-09-26 |
| EV-024 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Zoology → course code BIO 407 | 2026-09-26 |
| EV-025 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Zoology → course code ZOO 411 | 2026-09-26 |
| EV-026 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Zoology → course code ZOO 412 | 2026-09-26 |
| EV-027 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Zoology → course code ZOO 419 | 2026-09-26 |
| EV-028 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Zoology → course code ZOO 422 | 2026-09-26 |
| EV-029 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Zoology → course code ZOO 499 | 2026-09-26 |
| EV-030 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 28 → Geophysics | 2026-09-26 |
| EV-031 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Applied Geophysics → course code GEY 101 | 2026-09-26 |
| EV-032 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Applied Geophysics → course code GEY 102 | 2026-09-26 |
| EV-033 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Applied Geophysics → course code GPH 305 | 2026-09-26 |
| EV-034 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Applied Geophysics → course code GPH 308 | 2026-09-26 |
| EV-035 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Applied Geophysics → course code GPH 311 | 2026-09-26 |
| EV-036 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Applied Geophysics → course code GPH 312 | 2026-09-26 |
| EV-037 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Applied Geophysics → course code GPH 398 | 2026-09-26 |
| EV-038 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Applied Geophysics → course code GPH 399 | 2026-09-26 |
| EV-039 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Applied Geophysics → course code GPH 401 | 2026-09-26 |
| EV-040 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Applied Geophysics → course code GPH 405 | 2026-09-26 |
| EV-041 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Applied Geophysics → course code GPH 408 | 2026-09-26 |
| EV-042 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Applied Geophysics → course code GPH 411 | 2026-09-26 |
| EV-043 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Applied Geophysics → course code GPH 412 | 2026-09-26 |
| EV-044 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Applied Geophysics → course code GPH 413 | 2026-09-26 |
| EV-045 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Applied Geophysics → course code GPH 414 | 2026-09-26 |
| EV-046 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Applied Geophysics → course code GEY 408 | 2026-09-26 |
| EV-047 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Applied Geophysics → course code GEY 415 | 2026-09-26 |
| EV-048 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 29 → Industrial Physics | 2026-09-26 |
| EV-049 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 32 → Mathematics with Statistics / Mathematics/Statistics / Mathematics and Statistics | 2026-09-26 |
| EV-050 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Statistics → course code MTH 101 | 2026-09-26 |
| EV-051 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Statistics → course code MTH 102 | 2026-09-26 |
| EV-052 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Statistics → course code STA 111 | 2026-09-26 |
| EV-053 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Statistics → course code STA 121 | 2026-09-26 |
| EV-054 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Statistics → course code STA 122 | 2026-09-26 |
| EV-055 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Statistics → course code STA 201 | 2026-09-26 |
| EV-056 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Statistics → course code STA 202 | 2026-09-26 |
| EV-057 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Statistics → course code STA 212 | 2026-09-26 |
| EV-058 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Statistics → course code STA 221 | 2026-09-26 |
| EV-059 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Statistics → course code STA 231 | 2026-09-26 |
| EV-060 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Statistics → course code STA 312 | 2026-09-26 |
| EV-061 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Statistics → course code STA 321 | 2026-09-26 |
| EV-062 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Statistics → course code STA 331 | 2026-09-26 |
| EV-063 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Statistics → course code STA 412 | 2026-09-26 |
| EV-064 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Statistics → course code STA 413 | 2026-09-26 |
| EV-065 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Statistics → course code STA 422 | 2026-09-26 |
| EV-066 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Statistics → course code STA 499 | 2026-09-26 |
| EV-067 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 33 → Petroleum Chemistry | 2026-09-26 |
| EV-068 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 34 → Pure and Industrial Chemistry | 2026-09-26 |
| EV-069 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Industrial Chemistry → course code CHM 101 | 2026-09-26 |
| EV-070 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Industrial Chemistry → course code CHM 102 | 2026-09-26 |
| EV-071 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Industrial Chemistry → course code CHM 107 | 2026-09-26 |
| EV-072 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Industrial Chemistry → course code CHM 108 | 2026-09-26 |
| EV-073 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Industrial Chemistry → course code CHM 210 | 2026-09-26 |
| EV-074 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Industrial Chemistry → course code CHM 211 | 2026-09-26 |
| EV-075 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Industrial Chemistry → course code CHM 212 | 2026-09-26 |
| EV-076 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Industrial Chemistry → course code ICH 213 | 2026-09-26 |
| EV-077 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Industrial Chemistry → course code CHM 207 | 2026-09-26 |
| EV-078 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Industrial Chemistry → course code CHM 208 | 2026-09-26 |
| EV-079 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Industrial Chemistry → course code ICH 314 | 2026-09-26 |
| EV-080 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Industrial Chemistry → course code CHM 301 | 2026-09-26 |
| EV-081 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Industrial Chemistry → course code CHM 302 | 2026-09-26 |
| EV-082 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Industrial Chemistry → course code CHM 303 | 2026-09-26 |
| EV-083 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Industrial Chemistry → course code ICH 305 | 2026-09-26 |
| EV-084 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Industrial Chemistry → course code ICH 306 | 2026-09-26 |
| EV-085 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Industrial Chemistry → course code ICH 317 | 2026-09-26 |
| EV-086 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Industrial Chemistry → course code ICH 318 | 2026-09-26 |
| EV-087 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Industrial Chemistry → course code ICH 399 | 2026-09-26 |
| EV-088 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Industrial Chemistry → course code ICH 400 | 2026-09-26 |
| EV-089 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Industrial Chemistry → course code ICH 401 | 2026-09-26 |
| EV-090 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Industrial Chemistry → course code ICH 453 | 2026-09-26 |
| EV-091 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Industrial Chemistry → course code ICH 454 | 2026-09-26 |
| EV-092 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Industrial Chemistry → course code ICH 455 | 2026-09-26 |
| EV-093 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Industrial Chemistry → course code CHM 499 | 2026-09-26 |
| EV-094 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 35 → APPLIED BIOLOGY | 2026-09-26 |
| EV-095 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 102 | 2026-09-26 |
| EV-096 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 107 | 2026-09-26 |
| EV-097 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 108 | 2026-09-26 |
| EV-098 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 203 | 2026-09-26 |
| EV-099 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 204 | 2026-09-26 |
| EV-100 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 205 | 2026-09-26 |
| EV-101 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 206 | 2026-09-26 |
| EV-102 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 208 | 2026-09-26 |
| EV-103 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 302 | 2026-09-26 |
| EV-104 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 303 | 2026-09-26 |
| EV-105 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 306 | 2026-09-26 |
| EV-106 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 307 | 2026-09-26 |
| EV-107 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 403 | 2026-09-26 |
| EV-108 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 414 | 2026-09-26 |
| EV-109 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 406 | 2026-09-26 |
| EV-110 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 407 | 2026-09-26 |
| EV-111 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 408 | 2026-09-26 |
| EV-112 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 410 | 2026-09-26 |
| EV-113 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 413 | 2026-09-26 |
| EV-114 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 38 → METEOROLOGY | 2026-09-26 |
| EV-115 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 40 → Geology and Mining | 2026-09-26 |
| EV-116 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Geology → course code GEY 101 | 2026-09-26 |
| EV-117 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Geology → course code GEY 102 | 2026-09-26 |
| EV-118 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Geology → course code GEY 202 | 2026-09-26 |
| EV-119 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Geology → course code GEY 203 | 2026-09-26 |
| EV-120 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Geology → course code GEY 210 | 2026-09-26 |
| EV-121 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Geology → course code GEY 301 | 2026-09-26 |
| EV-122 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Geology → course code GEY 308 | 2026-09-26 |
| EV-123 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Geology → course code GEY 310 | 2026-09-26 |
| EV-124 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Geology → course code GEY 312 | 2026-09-26 |
| EV-125 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Geology → course code GEY 313 | 2026-09-26 |
| EV-126 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Geology → course code GEY 314 | 2026-09-26 |
| EV-127 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Geology → course code GEY 315 | 2026-09-26 |
| EV-128 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Geology → course code GEY 404 | 2026-09-26 |
| EV-129 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Geology → course code GEY 408 | 2026-09-26 |
| EV-130 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Geology → course code GEY 409 | 2026-09-26 |
| EV-131 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Geology → course code GEY 410 | 2026-09-26 |
| EV-132 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Geology → course code GEY 411 | 2026-09-26 |
| EV-133 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Geology → course code GEY 412 | 2026-09-26 |
| EV-134 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Geology → course code GEY 414 | 2026-09-26 |
| EV-135 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Geology → course code GEY 415 | 2026-09-26 |
| EV-136 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Geology → course code GEY 416 | 2026-09-26 |
| EV-137 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Geology → course code GEY 417 | 2026-09-26 |
| EV-138 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 41 → Mathematics with Computer Science | 2026-09-26 |
| EV-139 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Printed p. 452, catalogue entry ‘Mathematics with Computer Science’. The parsed occurrence lists GOUU, MINNA, MAUTY, NOUN and PHC; the specific institution table cells remain unverified. | 2026-09-26 |
| EV-140 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | Mathematics programme course structure and course-level contents/outcomes; local parsed source data: data/career-mapping/ccmas/sciences.json, programme code MTH. | 2026-09-26 |
| EV-141 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | Computer Science programme course structure and course-level contents/outcomes; local parsed source data: data/career-mapping/ccmas/computing.json, programme code COS. | 2026-09-26 |
| EV-142 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 42 → Applied Microbiology and Brewing / Applied Microbiology | 2026-09-26 |
| EV-143 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Microbiology → course code MCB 221 | 2026-09-26 |
| EV-144 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Microbiology → course code MCB 231 | 2026-09-26 |
| EV-145 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Microbiology → course code MCB 309 | 2026-09-26 |
| EV-146 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Microbiology → course code MCB 324 | 2026-09-26 |
| EV-147 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Microbiology → course code MCB 399 | 2026-09-26 |
| EV-148 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Microbiology → course code MCB 405 | 2026-09-26 |
| EV-149 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Microbiology → course code MCB 407 | 2026-09-26 |
| EV-150 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Microbiology → course code MCB 412 | 2026-09-26 |
| EV-151 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Microbiology → course code MCB 423 | 2026-09-26 |
| EV-152 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Microbiology → course code MCB 424 | 2026-09-26 |
| EV-153 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Microbiology → course code MCB 425 | 2026-09-26 |
| EV-154 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Microbiology → course code MCB 431 | 2026-09-26 |
| EV-155 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 43 → Pure and Applied Chemistry | 2026-09-26 |
| EV-156 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 101 | 2026-09-26 |
| EV-157 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 102 | 2026-09-26 |
| EV-158 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 107 | 2026-09-26 |
| EV-159 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 108 | 2026-09-26 |
| EV-160 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 210 | 2026-09-26 |
| EV-161 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 211 | 2026-09-26 |
| EV-162 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 212 | 2026-09-26 |
| EV-163 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 213 | 2026-09-26 |
| EV-164 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 214 | 2026-09-26 |
| EV-165 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 207 | 2026-09-26 |
| EV-166 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 208 | 2026-09-26 |
| EV-167 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 301 | 2026-09-26 |
| EV-168 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 302 | 2026-09-26 |
| EV-169 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 303 | 2026-09-26 |
| EV-170 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 314 | 2026-09-26 |
| EV-171 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 316 | 2026-09-26 |
| EV-172 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 319 | 2026-09-26 |
| EV-173 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 400 | 2026-09-26 |
| EV-174 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 401 | 2026-09-26 |
| EV-175 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 406 | 2026-09-26 |
| EV-176 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 410 | 2026-09-26 |
| EV-177 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 423 | 2026-09-26 |
| EV-178 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 424 | 2026-09-26 |
| EV-179 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 44 → Plant Biology | 2026-09-26 |
| EV-180 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Botany → course code BIO 101 | 2026-09-26 |
| EV-181 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Botany → course code BIO 102 | 2026-09-26 |
| EV-182 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Botany → course code BIO 107 | 2026-09-26 |
| EV-183 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Botany → course code BIO 108 | 2026-09-26 |
| EV-184 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Botany → course code BOT 102 | 2026-09-26 |
| EV-185 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Botany → course code BIO 203 | 2026-09-26 |
| EV-186 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Botany → course code BIO 204 | 2026-09-26 |
| EV-187 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Botany → course code BIO 205 | 2026-09-26 |
| EV-188 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Botany → course code BOT 202 | 2026-09-26 |
| EV-189 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Botany → course code BOT 203 | 2026-09-26 |
| EV-190 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Botany → course code BOT 301 | 2026-09-26 |
| EV-191 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Botany → course code BOT 302 | 2026-09-26 |
| EV-192 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Botany → course code BOT 303 | 2026-09-26 |
| EV-193 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Botany → course code BOT 304 | 2026-09-26 |
| EV-194 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Botany → course code BOT 306 | 2026-09-26 |
| EV-195 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Botany → course code BOT 311 | 2026-09-26 |
| EV-196 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Botany → course code BOT 312 | 2026-09-26 |
| EV-197 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Botany → course code BOT 402 | 2026-09-26 |
| EV-198 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Botany → course code BOT 404 | 2026-09-26 |
| EV-199 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Botany → course code BOT 407 | 2026-09-26 |
| EV-200 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Botany → course code BOT 408 | 2026-09-26 |
| EV-201 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Botany → course code BOT 409 | 2026-09-26 |
| EV-202 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Botany → course code BOT 414 | 2026-09-26 |
| EV-203 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Botany → course code BOT 416 | 2026-09-26 |
| EV-204 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Botany → course code BOT 417 | 2026-09-26 |
| EV-205 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Botany → course code BOT 418 | 2026-09-26 |
| EV-206 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Botany → course code BOT 419 | 2026-09-26 |
| EV-207 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf | agriculture.txt → parsed row ordinal 25 → Plant Science | 2026-09-26 |
| EV-208 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 45 → Plant Science | 2026-09-26 |
| EV-209 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 46 → Genetics and Biotechnology | 2026-09-26 |
| EV-210 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code CHM 101 | 2026-09-26 |
| EV-211 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 202 | 2026-09-26 |
| EV-212 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 301 | 2026-09-26 |
| EV-213 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 302 | 2026-09-26 |
| EV-214 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 305 | 2026-09-26 |
| EV-215 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 309 | 2026-09-26 |
| EV-216 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 313 | 2026-09-26 |
| EV-217 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 315 | 2026-09-26 |
| EV-218 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 401 | 2026-09-26 |
| EV-219 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 403 | 2026-09-26 |
| EV-220 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 404 | 2026-09-26 |
| EV-221 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 405 | 2026-09-26 |
| EV-222 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 406 | 2026-09-26 |
| EV-223 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 407 | 2026-09-26 |
| EV-224 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 433 | 2026-09-26 |

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
- `data/career-mapping/_audit/jamb_ccmas_final_gap_verification_rows_121_130_2026-09-26_001.md`
- `data/career-mapping/_audit/jamb_ccmas_source_issue_queue_2026-09-26_001.json`
- `data/career-mapping/_audit/jamb_ccmas_source_issue_queue_2026-09-26_001.md`
- `data/career-mapping/_audit/jamb_curriculum_scopes_2026-08-17.json`
- `data/career-mapping/_audit/jamb_anomaly_inventory_2026-09-26.json`
- `data/career-mapping/_audit/jamb_offering_context_inventory_2026-09-25.json`
- `data/career-mapping/_audit/ccmas_extraction_anomaly_inventory_2026-09-26.json`


Closed work intentionally not reopened: French Arts anchor correction; Film and Video Studies Social/Management occurrence addition; recorded CCMAS page-header repairs; CAM424 equipment-spill repair; DTS498/CSC432 cross-reference repair; and replacement-character normalization classified as encoding-only.

## Disposition and resume boundary

This increment reconciles the current **121–140** queue against the prior row-level evidence. It does **not** close any identity: scope evidence, exact offering context, selected-course fidelity, item-level citations, and external/custom provenance remain open where listed. It performs no downstream domain/subgroup/role audit.

The next bounded increment is **identities 141–160**, maximum **20 identities/packages**, and must save its own append-only JSON/Markdown checkpoint before proceeding.

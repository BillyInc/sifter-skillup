# JAMB–CCMAS source increment 008 — identities 141–160

**Audit date:** 2026-09-26 (Africa/Lagos)  
**Mode:** bounded reconciliation after checkpoint 003; append-only  
**Assigned lane:** JAMB identity/offering and CCMAS/external source integrity only  
**Write boundary:** no shared source, mapping, scope, seed, SQL, UI, downstream taxonomy, domain, subgroup, or role file was edited.

## Exact coverage inspected

- Canonical JAMB identities: **20/20**, rows **141–160**.
- Current queue records: **20 identity rows**, **66 current issue records**.
- Current selected-course occurrences represented by those rows: **337**.
- Parsed offering occurrences represented by those rows: **20**.
- CCMAS/external components inspected through the current records: **Computing::Computer Science, Computing::Cybersecurity, Computing::Data Science, Computing::Information Systems, Computing::Information Technology, Computing::Information and Communication Technology, Sciences::Biochemistry, Sciences::Biology, Sciences::Biotechnology, Sciences::Chemistry, Sciences::Marine Science, Sciences::Mathematics, Sciences::Meteorology, Sciences::Statistics, Social Sciences::Economics**.
- Prior row-level evidence was read first from the existing final-gap checkpoint(s) for rows **141–160**; already-verified facts were not re-researched.

## Records inspected

| Row | JAMB identity | Component reference(s) | Current scope state | Selected courses | Offering records | Current issue IDs |
|---:|---|---|---|---:|---:|---|
| 141 | Pure and Applied Mathematics | Sciences::Mathematics | partial_scope_reviewed | 11 | 1 | SRC-00404, SRC-00405, SRC-00406, SRC-00407 |
| 142 | Computer Science and Information Technology | Computing::Information Technology | partial_scope_reviewed | 12 | 1 | SRC-00408, SRC-00409, SRC-00410, SRC-00411 |
| 143 | BIOCHEMISTRY AND MOLECULAR BIOLOGY | Sciences::Biochemistry | partial_scope_reviewed | 20 | 1 | SRC-00412, SRC-00413, SRC-00414 |
| 144 | INFORMATION AND COMMUNICATION SCIENCE | Computing::Information and Communication Technology | partial_scope_reviewed | 10 | 1 | SRC-00415, SRC-00416, SRC-00417, SRC-00418 |
| 145 | COMPUTER SCIENCE WITH ECONOMICS | Computing::Computer Science, Social Sciences::Economics | combined_scope_review_required | 76 | 1 | SRC-00419, SRC-00420, SRC-00421 |
| 146 | COMPUTER SCIENCE AND MATHEMATICS | Computing::Computer Science | partial_scope_reviewed | 11 | 1 | SRC-00422, SRC-00423, SRC-00424, SRC-00425 |
| 147 | COMPUTER WITH STATISTICS | Sciences::Statistics | partial_scope_reviewed | 17 | 1 | SRC-00426, SRC-00427, SRC-00428 |
| 148 | METEOROLOGY AND CLIMATE CHANGE | Sciences::Meteorology | partial_scope_reviewed | 16 | 1 | SRC-00429, SRC-00430, SRC-00431 |
| 149 | Pure Chemistry | Sciences::Chemistry | partial_scope_reviewed | 22 | 1 | SRC-00432, SRC-00433, SRC-00434 |
| 150 | Applied Chemistry | Sciences::Chemistry | partial_scope_reviewed | 23 | 1 | SRC-00435, SRC-00436, SRC-00437 |
| 151 | Biostatistics | Sciences::Statistics | partial_scope_reviewed | 24 | 1 | SRC-00438, SRC-00439, SRC-00440, SRC-00441 |
| 152 | Statistics and Data Sciences | Computing::Data Science | partial_scope_reviewed | 10 | 1 | SRC-00442, SRC-00443, SRC-00444, SRC-00445 |
| 153 | Data Science and Analytics | Computing::Data Science | partial_scope_reviewed | 10 | 1 | SRC-00446, SRC-00447, SRC-00448, SRC-00449 |
| 154 | Marine Science | Sciences::Marine Science | full | 0 | 1 | SRC-00450, SRC-00451 |
| 155 | INFORMATION TECHNOLOGY AND HEALTH INFORMATICS | Computing::Information Technology | partial_scope_reviewed | 7 | 1 | SRC-00452, SRC-00453, SRC-00454, SRC-00455 |
| 156 | MANAGEMENT INFORMATION SYSTEM | Computing::Information Systems | partial_scope_reviewed | 9 | 1 | SRC-00456, SRC-00457, SRC-00458, SRC-00459 |
| 157 | INFORMATION SYSTEMS AND TECHNOLOGY | Computing::Information Systems | partial_scope_reviewed | 9 | 1 | SRC-00460, SRC-00461, SRC-00462, SRC-00463 |
| 158 | CYBER SECURITY SCIENCE | Computing::Cybersecurity | partial_scope_reviewed | 9 | 1 | SRC-00464, SRC-00465, SRC-00466, SRC-00467 |
| 159 | PURE AND APPLIED BIOLOGY | Sciences::Biology | partial_scope_reviewed | 19 | 1 | SRC-00468, SRC-00469, SRC-00470 |
| 160 | APPLIED BIOLOGY AND BIOTECHNOLOGY | Sciences::Biotechnology | partial_scope_reviewed | 22 | 1 | SRC-00471, SRC-00472, SRC-00473 |

## Current issue counts

- Confirmed gaps still open: **69**.
- Candidate issues still open: **1**.
- New issue classes discovered in this reconciliation: **0**.
- Closed findings reopened: **0**.
- Distinct exact evidence references captured: **218**.

By issue type/status:

- `offering_context_unverified` / `confirmed_gap`: 20
- `scope_evidence_missing` / `confirmed_gap`: 19
- `scope_semantic_review_required` / `candidate`: 1
- `selected_course_citation_incomplete` / `confirmed_gap`: 18
- `selected_course_content_or_outcome_gap` / `confirmed_gap`: 12

## Confirmed and candidate issue ledger

The following are current open records carried from the source issue queue. They are not claims that every record below is an academic-content defect; provenance, offering-context, and citation gaps remain distinct from content defects.

| Issue | Row | Status | Type | Evidence refs | Recommendation |
|---|---:|---|---|---|---|
| SRC-00404 | 141 | confirmed_gap | scope_evidence_missing | EV-001 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00405 | 141 | confirmed_gap | offering_context_unverified | EV-001 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00406 | 141 | confirmed_gap | selected_course_citation_incomplete | EV-002, EV-003, EV-004, EV-005, EV-006, EV-007, EV-008, EV-009, EV-010, EV-011 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00407 | 141 | confirmed_gap | selected_course_content_or_outcome_gap | EV-002, EV-003, EV-004, EV-005, EV-006, EV-007, EV-008, EV-009, EV-010, EV-011 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00408 | 142 | confirmed_gap | scope_evidence_missing | EV-012 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00409 | 142 | confirmed_gap | offering_context_unverified | EV-012 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00410 | 142 | confirmed_gap | selected_course_citation_incomplete | EV-013, EV-014, EV-015, EV-016, EV-017, EV-018, EV-019, EV-020, EV-021, EV-022, EV-023, EV-024 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00411 | 142 | confirmed_gap | selected_course_content_or_outcome_gap | EV-013, EV-014, EV-015, EV-016, EV-017, EV-018, EV-019, EV-020, EV-021, EV-022, EV-023, EV-024 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00412 | 143 | confirmed_gap | scope_evidence_missing | EV-025 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00413 | 143 | confirmed_gap | offering_context_unverified | EV-025 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00414 | 143 | confirmed_gap | selected_course_citation_incomplete | EV-026, EV-027, EV-028, EV-029, EV-030, EV-031, EV-032, EV-033, EV-034, EV-035, EV-036, EV-037, EV-038, EV-039, EV-040, EV-041, EV-042, EV-043, EV-044, EV-045 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00415 | 144 | confirmed_gap | scope_evidence_missing | EV-046 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00416 | 144 | confirmed_gap | offering_context_unverified | EV-046 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00417 | 144 | confirmed_gap | selected_course_citation_incomplete | EV-047, EV-048, EV-049, EV-050, EV-051, EV-052, EV-053, EV-054, EV-055 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00418 | 144 | confirmed_gap | selected_course_content_or_outcome_gap | EV-047, EV-048, EV-049, EV-050, EV-051, EV-052, EV-053, EV-054, EV-055 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00419 | 145 | confirmed_gap | offering_context_unverified | EV-056 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00420 | 145 | confirmed_gap | selected_course_content_or_outcome_gap | EV-057, EV-058, EV-059, EV-060 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00421 | 145 | candidate | scope_semantic_review_required | EV-057, EV-058, EV-059, EV-060 | Reconcile the exact offering context, each named component, selected courses/outcomes, and supported student-facing status; a review label is not evidence of correctness. |
| SRC-00422 | 146 | confirmed_gap | scope_evidence_missing | EV-061 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00423 | 146 | confirmed_gap | offering_context_unverified | EV-061 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00424 | 146 | confirmed_gap | selected_course_citation_incomplete | EV-062, EV-063, EV-064, EV-065, EV-066, EV-067, EV-068, EV-069, EV-070, EV-071, EV-072 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00425 | 146 | confirmed_gap | selected_course_content_or_outcome_gap | EV-062, EV-063, EV-064, EV-065, EV-066, EV-067, EV-068, EV-069, EV-070, EV-071, EV-072 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00426 | 147 | confirmed_gap | scope_evidence_missing | EV-073 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00427 | 147 | confirmed_gap | offering_context_unverified | EV-073 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00428 | 147 | confirmed_gap | selected_course_citation_incomplete | EV-074, EV-075, EV-076, EV-077, EV-078, EV-079, EV-080, EV-081, EV-082, EV-083, EV-084, EV-085, EV-086, EV-087, EV-088, EV-089, EV-090 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00429 | 148 | confirmed_gap | scope_evidence_missing | EV-091 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00430 | 148 | confirmed_gap | offering_context_unverified | EV-091 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00431 | 148 | confirmed_gap | selected_course_citation_incomplete | EV-092, EV-093, EV-094, EV-095, EV-096, EV-097, EV-098, EV-099, EV-100, EV-101, EV-102, EV-103, EV-104, EV-105, EV-106, EV-107 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00432 | 149 | confirmed_gap | scope_evidence_missing | EV-108 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00433 | 149 | confirmed_gap | offering_context_unverified | EV-108 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00434 | 149 | confirmed_gap | selected_course_citation_incomplete | EV-109, EV-110, EV-111, EV-112, EV-113, EV-114, EV-115, EV-116, EV-117, EV-118, EV-119, EV-120, EV-121, EV-122, EV-123, EV-124, EV-125, EV-126, EV-127, EV-128, EV-129, EV-130 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00435 | 150 | confirmed_gap | scope_evidence_missing | EV-131 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00436 | 150 | confirmed_gap | offering_context_unverified | EV-131 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00437 | 150 | confirmed_gap | selected_course_citation_incomplete | EV-109, EV-110, EV-111, EV-112, EV-113, EV-114, EV-115, EV-116, EV-117, EV-118, EV-119, EV-120, EV-121, EV-122, EV-123, EV-124, EV-125, EV-126, EV-127, EV-128, EV-129, EV-130, EV-132 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00438 | 151 | confirmed_gap | scope_evidence_missing | EV-133 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00439 | 151 | confirmed_gap | offering_context_unverified | EV-133 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00440 | 151 | confirmed_gap | selected_course_citation_incomplete | EV-075, EV-076, EV-077, EV-078, EV-079, EV-080, EV-081, EV-082, EV-083, EV-084, EV-085, EV-086, EV-087, EV-088, EV-089, EV-090, EV-134, EV-135, EV-136, EV-137, EV-138, EV-139, EV-140, EV-141 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00441 | 151 | confirmed_gap | selected_course_content_or_outcome_gap | EV-075, EV-076, EV-077, EV-078, EV-079, EV-080, EV-081, EV-082, EV-083, EV-084, EV-085, EV-086, EV-087, EV-088, EV-089, EV-090, EV-134, EV-135, EV-136, EV-137, EV-138, EV-139, EV-140, EV-141 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00442 | 152 | confirmed_gap | scope_evidence_missing | EV-142 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00443 | 152 | confirmed_gap | offering_context_unverified | EV-142 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00444 | 152 | confirmed_gap | selected_course_citation_incomplete | EV-143, EV-144, EV-145, EV-146, EV-147, EV-148, EV-149, EV-150, EV-151, EV-152 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00445 | 152 | confirmed_gap | selected_course_content_or_outcome_gap | EV-143, EV-144, EV-145, EV-146, EV-147, EV-148, EV-149, EV-150, EV-151, EV-152 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00446 | 153 | confirmed_gap | scope_evidence_missing | EV-153 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00447 | 153 | confirmed_gap | offering_context_unverified | EV-153 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00448 | 153 | confirmed_gap | selected_course_citation_incomplete | EV-143, EV-144, EV-145, EV-146, EV-147, EV-148, EV-149, EV-150, EV-151, EV-152 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00449 | 153 | confirmed_gap | selected_course_content_or_outcome_gap | EV-143, EV-144, EV-145, EV-146, EV-147, EV-148, EV-149, EV-150, EV-151, EV-152 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00450 | 154 | confirmed_gap | scope_evidence_missing | EV-154 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00451 | 154 | confirmed_gap | offering_context_unverified | EV-154 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00452 | 155 | confirmed_gap | scope_evidence_missing | EV-155 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00453 | 155 | confirmed_gap | offering_context_unverified | EV-155 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00454 | 155 | confirmed_gap | selected_course_citation_incomplete | EV-013, EV-017, EV-020, EV-021, EV-022, EV-023, EV-024 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00455 | 155 | confirmed_gap | selected_course_content_or_outcome_gap | EV-013, EV-017, EV-020, EV-021, EV-022, EV-023, EV-024 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00456 | 156 | confirmed_gap | scope_evidence_missing | EV-156 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00457 | 156 | confirmed_gap | offering_context_unverified | EV-156 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00458 | 156 | confirmed_gap | selected_course_citation_incomplete | EV-157, EV-158, EV-159, EV-160, EV-161, EV-162, EV-163, EV-164, EV-165 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00459 | 156 | confirmed_gap | selected_course_content_or_outcome_gap | EV-157, EV-158, EV-159, EV-160, EV-161, EV-162, EV-163, EV-164, EV-165 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00460 | 157 | confirmed_gap | scope_evidence_missing | EV-166 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00461 | 157 | confirmed_gap | offering_context_unverified | EV-166 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00462 | 157 | confirmed_gap | selected_course_citation_incomplete | EV-157, EV-158, EV-159, EV-160, EV-161, EV-162, EV-163, EV-164, EV-165 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00463 | 157 | confirmed_gap | selected_course_content_or_outcome_gap | EV-157, EV-158, EV-159, EV-160, EV-161, EV-162, EV-163, EV-164, EV-165 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00464 | 158 | confirmed_gap | scope_evidence_missing | EV-167 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00465 | 158 | confirmed_gap | offering_context_unverified | EV-167 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00466 | 158 | confirmed_gap | selected_course_citation_incomplete | EV-168, EV-169, EV-170, EV-171, EV-172, EV-173, EV-174, EV-175 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00467 | 158 | confirmed_gap | selected_course_content_or_outcome_gap | EV-168, EV-169, EV-170, EV-171, EV-172, EV-173, EV-174, EV-175 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00468 | 159 | confirmed_gap | scope_evidence_missing | EV-176 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00469 | 159 | confirmed_gap | offering_context_unverified | EV-176 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00470 | 159 | confirmed_gap | selected_course_citation_incomplete | EV-177, EV-178, EV-179, EV-180, EV-181, EV-182, EV-183, EV-184, EV-185, EV-186, EV-187, EV-188, EV-189, EV-190, EV-191, EV-192, EV-193, EV-194, EV-195 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00471 | 160 | confirmed_gap | scope_evidence_missing | EV-196 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00472 | 160 | confirmed_gap | offering_context_unverified | EV-196 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00473 | 160 | confirmed_gap | selected_course_citation_incomplete | EV-197, EV-198, EV-199, EV-200, EV-201, EV-202, EV-203, EV-204, EV-205, EV-206, EV-207, EV-208, EV-209, EV-210, EV-211, EV-212, EV-213, EV-214, EV-215, EV-216, EV-217, EV-218 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |

## Exact evidence URLs, locators, and access dates

### Structured evidence references attached to issue records

| Ref | URL | Exact locator | Accessed |
|---|---|---|---|
| EV-001 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 48 → Pure and Applied Mathematics | 2026-09-26 |
| EV-002 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Mathematics → course code MTH 101 | 2026-09-26 |
| EV-003 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Mathematics → course code MTH 102 | 2026-09-26 |
| EV-004 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Mathematics → course code MTH 103 | 2026-09-26 |
| EV-005 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Mathematics → course code MTH 201 | 2026-09-26 |
| EV-006 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Mathematics → course code MTH 203 | 2026-09-26 |
| EV-007 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Mathematics → course code MTH 209 | 2026-09-26 |
| EV-008 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Mathematics → course code MTH 308 | 2026-09-26 |
| EV-009 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Mathematics → course code MTH 310 | 2026-09-26 |
| EV-010 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Mathematics → course code MTH 407 | 2026-09-26 |
| EV-011 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Mathematics → course code MTH 408 | 2026-09-26 |
| EV-012 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 49 → Computer Science and Information Technology | 2026-09-26 |
| EV-013 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Information Technology → course code COS 101 | 2026-09-26 |
| EV-014 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Information Technology → course code COS 201 | 2026-09-26 |
| EV-015 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Information Technology → course code COS 202 | 2026-09-26 |
| EV-016 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Information Technology → course code IFT 203 | 2026-09-26 |
| EV-017 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Information Technology → course code IFT 205 | 2026-09-26 |
| EV-018 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Information Technology → course code IFT 212 | 2026-09-26 |
| EV-019 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Information Technology → course code INS 202 | 2026-09-26 |
| EV-020 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Information Technology → course code IFT 304 | 2026-09-26 |
| EV-021 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Information Technology → course code CSC 308 | 2026-09-26 |
| EV-022 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Information Technology → course code ICT 305 | 2026-09-26 |
| EV-023 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Information Technology → course code IFT 403 | 2026-09-26 |
| EV-024 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Information Technology → course code IFT 442 | 2026-09-26 |
| EV-025 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 50 → BIOCHEMISTRY AND MOLECULAR BIOLOGY | 2026-09-26 |
| EV-026 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biochemistry → course code BIO 101 | 2026-09-26 |
| EV-027 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biochemistry → course code BIO 102 | 2026-09-26 |
| EV-028 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biochemistry → course code BIO 107 | 2026-09-26 |
| EV-029 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biochemistry → course code BIO 108 | 2026-09-26 |
| EV-030 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biochemistry → course code CHM 101 | 2026-09-26 |
| EV-031 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biochemistry → course code BCH 201 | 2026-09-26 |
| EV-032 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biochemistry → course code BCH 202 | 2026-09-26 |
| EV-033 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biochemistry → course code BCH 203 | 2026-09-26 |
| EV-034 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biochemistry → course code STA 201 | 2026-09-26 |
| EV-035 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biochemistry → course code BCH 301 | 2026-09-26 |
| EV-036 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biochemistry → course code BCH 302 | 2026-09-26 |
| EV-037 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biochemistry → course code BCH 304 | 2026-09-26 |
| EV-038 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biochemistry → course code BCH 306 | 2026-09-26 |
| EV-039 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biochemistry → course code BCH 307 | 2026-09-26 |
| EV-040 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biochemistry → course code BCH 309 | 2026-09-26 |
| EV-041 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biochemistry → course code BCH 401 | 2026-09-26 |
| EV-042 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biochemistry → course code BCH 402 | 2026-09-26 |
| EV-043 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biochemistry → course code BCH 405 | 2026-09-26 |
| EV-044 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biochemistry → course code BCH 407 | 2026-09-26 |
| EV-045 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biochemistry → course code BCH 408 | 2026-09-26 |
| EV-046 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 51 → INFORMATION AND COMMUNICATION SCIENCE | 2026-09-26 |
| EV-047 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Information and Communication Technology → course code GST 111 | 2026-09-26 |
| EV-048 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Information and Communication Technology → course code COS 101 | 2026-09-26 |
| EV-049 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Information and Communication Technology → course code ICT 201 | 2026-09-26 |
| EV-050 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Information and Communication Technology → course code IFT 203 | 2026-09-26 |
| EV-051 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Information and Communication Technology → course code ICT 301 | 2026-09-26 |
| EV-052 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Information and Communication Technology → course code ICT 305 | 2026-09-26 |
| EV-053 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Information and Communication Technology → course code ICT 309 | 2026-09-26 |
| EV-054 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Information and Communication Technology → course code CSC 308 | 2026-09-26 |
| EV-055 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Information and Communication Technology → course code IFT 442 | 2026-09-26 |
| EV-056 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 52 → COMPUTER SCIENCE WITH ECONOMICS | 2026-09-26 |
| EV-057 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences catalogue entry for Computer Science with Economics; exact printed catalogue page and institution-awarder cells are not yet verified against the source PDF. | 2026-09-26 |
| EV-058 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-engineering.pdf | Printed p. 336, distinct catalogue string 'Computer Science with (Economics) (Mathematics)'. | 2026-09-26 |
| EV-059 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | B.Sc. Computer Science overview/objectives, printed pp. 27-28; global course structure, printed pp. 29-30; course contents and learning outcomes, printed pp. 31-51. | 2026-09-26 |
| EV-060 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | B.Sc. Economics overview and objectives, printed pp. 93-94; course structure, pp. 95-96; course contents and learning outcomes, pp. 96-112. ECO 101-ECO 104 outcomes appear at printed pp. 98-99. | 2026-09-26 |
| EV-061 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 53 → COMPUTER SCIENCE AND MATHEMATICS | 2026-09-26 |
| EV-062 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Computer Science → course code MTH 101 | 2026-09-26 |
| EV-063 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Computer Science → course code MTH 102 | 2026-09-26 |
| EV-064 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Computer Science → course code COS 101 | 2026-09-26 |
| EV-065 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Computer Science → course code MTH 201 | 2026-09-26 |
| EV-066 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Computer Science → course code COS 201 | 2026-09-26 |
| EV-067 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Computer Science → course code COS 202 | 2026-09-26 |
| EV-068 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Computer Science → course code IFT 212 | 2026-09-26 |
| EV-069 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Computer Science → course code SEN 201 | 2026-09-26 |
| EV-070 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Computer Science → course code CSC 322 | 2026-09-26 |
| EV-071 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Computer Science → course code CSC 401 | 2026-09-26 |
| EV-072 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Computer Science → course code CSC 402 | 2026-09-26 |
| EV-073 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 54 → COMPUTER WITH STATISTICS | 2026-09-26 |
| EV-074 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Statistics → course code COS 101 | 2026-09-26 |
| EV-075 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Statistics → course code STA 111 | 2026-09-26 |
| EV-076 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Statistics → course code STA 121 | 2026-09-26 |
| EV-077 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Statistics → course code STA 122 | 2026-09-26 |
| EV-078 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Statistics → course code STA 201 | 2026-09-26 |
| EV-079 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Statistics → course code STA 202 | 2026-09-26 |
| EV-080 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Statistics → course code STA 212 | 2026-09-26 |
| EV-081 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Statistics → course code STA 221 | 2026-09-26 |
| EV-082 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Statistics → course code STA 231 | 2026-09-26 |
| EV-083 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Statistics → course code STA 312 | 2026-09-26 |
| EV-084 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Statistics → course code STA 321 | 2026-09-26 |
| EV-085 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Statistics → course code STA 324 | 2026-09-26 |
| EV-086 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Statistics → course code STA 331 | 2026-09-26 |
| EV-087 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Statistics → course code STA 412 | 2026-09-26 |
| EV-088 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Statistics → course code STA 413 | 2026-09-26 |
| EV-089 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Statistics → course code STA 422 | 2026-09-26 |
| EV-090 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Statistics → course code STA 499 | 2026-09-26 |
| EV-091 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 55 → METEOROLOGY AND CLIMATE CHANGE | 2026-09-26 |
| EV-092 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Meteorology → course code MTH 102 | 2026-09-26 |
| EV-093 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Meteorology → course code MET 101 | 2026-09-26 |
| EV-094 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Meteorology → course code ENT 211 | 2026-09-26 |
| EV-095 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Meteorology → course code GEO 205 | 2026-09-26 |
| EV-096 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Meteorology → course code ENT 312 | 2026-09-26 |
| EV-097 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Meteorology → course code MET 302 | 2026-09-26 |
| EV-098 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Meteorology → course code MET 303 | 2026-09-26 |
| EV-099 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Meteorology → course code MET 305 | 2026-09-26 |
| EV-100 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Meteorology → course code MET 320 | 2026-09-26 |
| EV-101 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Meteorology → course code MET 403 | 2026-09-26 |
| EV-102 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Meteorology → course code MET 409 | 2026-09-26 |
| EV-103 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Meteorology → course code MET 411 | 2026-09-26 |
| EV-104 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Meteorology → course code MET 415 | 2026-09-26 |
| EV-105 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Meteorology → course code MET 499 | 2026-09-26 |
| EV-106 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Meteorology → course code PHY 401 | 2026-09-26 |
| EV-107 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Meteorology → course code MET 503 | 2026-09-26 |
| EV-108 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 57 → Pure Chemistry | 2026-09-26 |
| EV-109 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 101 | 2026-09-26 |
| EV-110 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 102 | 2026-09-26 |
| EV-111 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 107 | 2026-09-26 |
| EV-112 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 108 | 2026-09-26 |
| EV-113 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 210 | 2026-09-26 |
| EV-114 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 211 | 2026-09-26 |
| EV-115 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 212 | 2026-09-26 |
| EV-116 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 213 | 2026-09-26 |
| EV-117 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 214 | 2026-09-26 |
| EV-118 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 207 | 2026-09-26 |
| EV-119 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 208 | 2026-09-26 |
| EV-120 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 301 | 2026-09-26 |
| EV-121 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 302 | 2026-09-26 |
| EV-122 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 303 | 2026-09-26 |
| EV-123 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 314 | 2026-09-26 |
| EV-124 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 319 | 2026-09-26 |
| EV-125 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 400 | 2026-09-26 |
| EV-126 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 401 | 2026-09-26 |
| EV-127 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 406 | 2026-09-26 |
| EV-128 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 410 | 2026-09-26 |
| EV-129 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 423 | 2026-09-26 |
| EV-130 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 424 | 2026-09-26 |
| EV-131 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 58 → Applied Chemistry | 2026-09-26 |
| EV-132 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 316 | 2026-09-26 |
| EV-133 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 59 → Biostatistics | 2026-09-26 |
| EV-134 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Statistics → course code STA 112 | 2026-09-26 |
| EV-135 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Statistics → course code STA 211 | 2026-09-26 |
| EV-136 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Statistics → course code STA 299 | 2026-09-26 |
| EV-137 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Statistics → course code STA 311 | 2026-09-26 |
| EV-138 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Statistics → course code STA 322 | 2026-09-26 |
| EV-139 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Statistics → course code STA 399 | 2026-09-26 |
| EV-140 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Statistics → course code STA 411 | 2026-09-26 |
| EV-141 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Statistics → course code STA 415 | 2026-09-26 |
| EV-142 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 60 → Statistics and Data Sciences | 2026-09-26 |
| EV-143 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Data Science → course code STA 111 | 2026-09-26 |
| EV-144 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Data Science → course code COS 101 | 2026-09-26 |
| EV-145 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Data Science → course code DTS 201 | 2026-09-26 |
| EV-146 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Data Science → course code DTS 204 | 2026-09-26 |
| EV-147 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Data Science → course code DTS 302 | 2026-09-26 |
| EV-148 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Data Science → course code DTS 304 | 2026-09-26 |
| EV-149 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Data Science → course code DTS 308 | 2026-09-26 |
| EV-150 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Data Science → course code DTS 316 | 2026-09-26 |
| EV-151 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Data Science → course code DTS 322 | 2026-09-26 |
| EV-152 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Data Science → course code DTS 403 | 2026-09-26 |
| EV-153 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 61 → Data Science and Analytics | 2026-09-26 |
| EV-154 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 62 → Marine Science | 2026-09-26 |
| EV-155 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 63 → INFORMATION TECHNOLOGY AND HEALTH INFORMATICS | 2026-09-26 |
| EV-156 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 64 → MANAGEMENT INFORMATION SYSTEM | 2026-09-26 |
| EV-157 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Information Systems → course code COS 101 | 2026-09-26 |
| EV-158 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Information Systems → course code INS 204 | 2026-09-26 |
| EV-159 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Information Systems → course code INS 207 | 2026-09-26 |
| EV-160 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Information Systems → course code DTS 304 | 2026-09-26 |
| EV-161 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Information Systems → course code ICT 305 | 2026-09-26 |
| EV-162 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Information Systems → course code INS 311 | 2026-09-26 |
| EV-163 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Information Systems → course code INS 322 | 2026-09-26 |
| EV-164 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Information Systems → course code CSC 308 | 2026-09-26 |
| EV-165 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Information Systems → course code DTS 404 | 2026-09-26 |
| EV-166 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 65 → INFORMATION SYSTEMS AND TECHNOLOGY | 2026-09-26 |
| EV-167 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 66 → CYBER SECURITY SCIENCE | 2026-09-26 |
| EV-168 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Cybersecurity → course code CYB 203 | 2026-09-26 |
| EV-169 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Cybersecurity → course code CYB 302 | 2026-09-26 |
| EV-170 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Cybersecurity → course code CYB 303 | 2026-09-26 |
| EV-171 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Cybersecurity → course code CYB 304 | 2026-09-26 |
| EV-172 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Cybersecurity → course code CYB 322 | 2026-09-26 |
| EV-173 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Cybersecurity → course code CYB 403 | 2026-09-26 |
| EV-174 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Cybersecurity → course code CYB 404 | 2026-09-26 |
| EV-175 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Cybersecurity → course code CYB 406 | 2026-09-26 |
| EV-176 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 69 → PURE AND APPLIED BIOLOGY | 2026-09-26 |
| EV-177 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 102 | 2026-09-26 |
| EV-178 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 107 | 2026-09-26 |
| EV-179 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 108 | 2026-09-26 |
| EV-180 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 203 | 2026-09-26 |
| EV-181 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 204 | 2026-09-26 |
| EV-182 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 205 | 2026-09-26 |
| EV-183 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 206 | 2026-09-26 |
| EV-184 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 208 | 2026-09-26 |
| EV-185 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 302 | 2026-09-26 |
| EV-186 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 303 | 2026-09-26 |
| EV-187 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 306 | 2026-09-26 |
| EV-188 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 307 | 2026-09-26 |
| EV-189 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 403 | 2026-09-26 |
| EV-190 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 414 | 2026-09-26 |
| EV-191 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 406 | 2026-09-26 |
| EV-192 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 407 | 2026-09-26 |
| EV-193 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 408 | 2026-09-26 |
| EV-194 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 410 | 2026-09-26 |
| EV-195 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 413 | 2026-09-26 |
| EV-196 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 70 → APPLIED BIOLOGY AND BIOTECHNOLOGY | 2026-09-26 |
| EV-197 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BIO 101 | 2026-09-26 |
| EV-198 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BIO 102 | 2026-09-26 |
| EV-199 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BIO 107 | 2026-09-26 |
| EV-200 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BIO 108 | 2026-09-26 |
| EV-201 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code CHM 101 | 2026-09-26 |
| EV-202 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BCH 201 | 2026-09-26 |
| EV-203 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code MCB 221 | 2026-09-26 |
| EV-204 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code STA 201 | 2026-09-26 |
| EV-205 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 202 | 2026-09-26 |
| EV-206 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 301 | 2026-09-26 |
| EV-207 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 302 | 2026-09-26 |
| EV-208 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 305 | 2026-09-26 |
| EV-209 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 309 | 2026-09-26 |
| EV-210 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 313 | 2026-09-26 |
| EV-211 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 315 | 2026-09-26 |
| EV-212 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 401 | 2026-09-26 |
| EV-213 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 403 | 2026-09-26 |
| EV-214 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 404 | 2026-09-26 |
| EV-215 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 405 | 2026-09-26 |
| EV-216 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 406 | 2026-09-26 |
| EV-217 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 407 | 2026-09-26 |
| EV-218 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 433 | 2026-09-26 |

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
- `data/career-mapping/_audit/jamb_ccmas_source_issue_queue_2026-09-26_001.json`
- `data/career-mapping/_audit/jamb_ccmas_source_issue_queue_2026-09-26_001.md`
- `data/career-mapping/_audit/jamb_curriculum_scopes_2026-08-17.json`
- `data/career-mapping/_audit/jamb_anomaly_inventory_2026-09-26.json`
- `data/career-mapping/_audit/jamb_offering_context_inventory_2026-09-25.json`
- `data/career-mapping/_audit/ccmas_extraction_anomaly_inventory_2026-09-26.json`


Closed work intentionally not reopened: French Arts anchor correction; Film and Video Studies Social/Management occurrence addition; recorded CCMAS page-header repairs; CAM424 equipment-spill repair; DTS498/CSC432 cross-reference repair; and replacement-character normalization classified as encoding-only.

## Disposition and resume boundary

This increment reconciles the current **141–160** queue against the prior row-level evidence. It does **not** close any identity: scope evidence, exact offering context, selected-course fidelity, item-level citations, and external/custom provenance remain open where listed. It performs no downstream domain/subgroup/role audit.

The next bounded increment is **identities 161–180**, maximum **20 identities/packages**, and must save its own append-only JSON/Markdown checkpoint before proceeding.

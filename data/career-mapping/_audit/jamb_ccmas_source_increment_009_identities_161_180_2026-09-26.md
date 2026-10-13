# JAMB–CCMAS source increment 009 — identities 161–180

**Audit date:** 2026-09-26 (Africa/Lagos)  
**Mode:** bounded reconciliation after checkpoint 003; append-only  
**Assigned lane:** JAMB identity/offering and CCMAS/external source integrity only  
**Write boundary:** no shared source, mapping, scope, seed, SQL, UI, downstream taxonomy, domain, subgroup, or role file was edited.

## Exact coverage inspected

- Canonical JAMB identities: **20/20**, rows **161–180**.
- Current queue records: **20 identity rows**, **66 current issue records**.
- Current selected-course occurrences represented by those rows: **354**.
- Parsed offering occurrences represented by those rows: **20**.
- CCMAS/external components inspected through the current records: **Computing::Computer Science, Computing::Data Science, Computing::Information Technology, Sciences::Biochemistry, Sciences::Biology, Sciences::Biotechnology, Sciences::Chemistry, Sciences::Geology, Sciences::Industrial Chemistry, Sciences::Industrial Physics, Sciences::Marine Science, Sciences::Mathematics, Sciences::Physics, Sciences::Physics with Electronics, Sciences::Zoology, Social Sciences::Economics**.
- Prior row-level evidence was read first from the existing final-gap checkpoint(s) for rows **161–180**; already-verified facts were not re-researched.

## Records inspected

| Row | JAMB identity | Component reference(s) | Current scope state | Selected courses | Offering records | Current issue IDs |
|---:|---|---|---|---:|---:|---|
| 161 | MARINE BIOLOGY | Sciences::Marine Science | partial_scope_reviewed | 17 | 1 | SRC-00474, SRC-00475, SRC-00476 |
| 162 | Physics Electronics | Sciences::Physics with Electronics | partial_scope_reviewed | 14 | 1 | SRC-00477, SRC-00478, SRC-00479 |
| 163 | Physics/Industrial Physics | Sciences::Industrial Physics | partial_scope_reviewed | 15 | 1 | SRC-00480, SRC-00481, SRC-00482 |
| 164 | Applied Physics | Sciences::Physics | partial_scope_reviewed | 22 | 1 | SRC-00483, SRC-00484, SRC-00485 |
| 165 | Applied Biochemistry | Sciences::Biochemistry | partial_scope_reviewed | 11 | 1 | SRC-00486, SRC-00487, SRC-00488 |
| 166 | Chemistry and Industrial Chemistry | Sciences::Industrial Chemistry, Sciences::Chemistry | combined_scope_review_required | 84 | 1 | SRC-00489, SRC-00490, SRC-00491 |
| 167 | Applied Geology | Sciences::Geology | partial_scope_reviewed | 23 | 1 | SRC-00492, SRC-00493, SRC-00494 |
| 168 | Plant Biology and Biotechnology | Sciences::Biotechnology | partial_scope_reviewed | 24 | 1 | SRC-00495, SRC-00496, SRC-00497 |
| 169 | Applied Zoology | Sciences::Zoology | partial_scope_reviewed | 6 | 1 | SRC-00498, SRC-00499, SRC-00500 |
| 170 | Molecular Biology | Sciences::Biology | partial_scope_reviewed | 18 | 1 | SRC-00501, SRC-00502, SRC-00503 |
| 171 | Mathematics and Economics / Mathematics with Economics | Social Sciences::Economics | partial_scope_reviewed | 26 | 1 | SRC-00504, SRC-00505, SRC-00506 |
| 172 | Computer Science and Information Science | Computing::Computer Science | partial_scope_reviewed | 12 | 1 | SRC-00507, SRC-00508, SRC-00509, SRC-00510 |
| 173 | BIOTECHNOLOGY AND MOLECULAR BIOLOGY | Sciences::Biotechnology | partial_scope_reviewed | 22 | 1 | SRC-00511, SRC-00512, SRC-00513 |
| 174 | DATA MANAGEMENT | Computing::Data Science | partial_scope_reviewed | 10 | 1 | SRC-00514, SRC-00515, SRC-00516, SRC-00517 |
| 175 | LIBRARY AND INFORMATION TECHNOLOGY | Computing::Information Technology | partial_scope_reviewed | 7 | 1 | SRC-00518, SRC-00519, SRC-00520, SRC-00521 |
| 176 | INFORMATION AND MEDIA TECHNOLOGY | Computing::Information Technology | partial_scope_reviewed | 8 | 1 | SRC-00522, SRC-00523, SRC-00524, SRC-00525 |
| 177 | MATHEMATICAL SCIENCES | Sciences::Mathematics | partial_scope_review_required | 7 | 1 | SRC-00526, SRC-00527, SRC-00528, SRC-00529, SRC-00530 |
| 178 | COMPUTER SCIENCE WITH MATHEMATICS | Computing::Computer Science | partial_scope_reviewed | 11 | 1 | SRC-00531, SRC-00532, SRC-00533, SRC-00534 |
| 179 | ELECTRONICS AND COMPUTER TECHNOLOGY | Computing::Computer Science | partial_scope_reviewed | 8 | 1 | SRC-00535, SRC-00536, SRC-00537, SRC-00538 |
| 180 | ELECTRONICS AND COMPUTER SYSTEMS | Computing::Computer Science | partial_scope_reviewed | 9 | 1 | SRC-00539, SRC-00540, SRC-00541, SRC-00542 |

## Current issue counts

- Confirmed gaps still open: **67**.
- Candidate issues still open: **2**.
- New issue classes discovered in this reconciliation: **0**.
- Closed findings reopened: **0**.
- Distinct exact evidence references captured: **237**.

By issue type/status:

- `offering_context_unverified` / `confirmed_gap`: 20
- `scope_evidence_missing` / `confirmed_gap`: 19
- `scope_semantic_review_required` / `candidate`: 2
- `selected_course_citation_incomplete` / `confirmed_gap`: 19
- `selected_course_content_or_outcome_gap` / `confirmed_gap`: 9

## Confirmed and candidate issue ledger

The following are current open records carried from the source issue queue. They are not claims that every record below is an academic-content defect; provenance, offering-context, and citation gaps remain distinct from content defects.

| Issue | Row | Status | Type | Evidence refs | Recommendation |
|---|---:|---|---|---|---|
| SRC-00474 | 161 | confirmed_gap | scope_evidence_missing | EV-001 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00475 | 161 | confirmed_gap | offering_context_unverified | EV-001 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00476 | 161 | confirmed_gap | selected_course_citation_incomplete | EV-002, EV-003, EV-004, EV-005, EV-006, EV-007, EV-008, EV-009, EV-010, EV-011, EV-012, EV-013, EV-014, EV-015, EV-016, EV-017, EV-018 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00477 | 162 | confirmed_gap | scope_evidence_missing | EV-019 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00478 | 162 | confirmed_gap | offering_context_unverified | EV-019 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00479 | 162 | confirmed_gap | selected_course_citation_incomplete | EV-020, EV-021, EV-022, EV-023, EV-024, EV-025, EV-026, EV-027, EV-028, EV-029, EV-030, EV-031, EV-032, EV-033 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00480 | 163 | confirmed_gap | scope_evidence_missing | EV-034 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00481 | 163 | confirmed_gap | offering_context_unverified | EV-034 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00482 | 163 | confirmed_gap | selected_course_citation_incomplete | EV-035, EV-036, EV-037, EV-038, EV-039, EV-040, EV-041, EV-042, EV-043, EV-044, EV-045, EV-046, EV-047, EV-048, EV-049 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00483 | 164 | confirmed_gap | scope_evidence_missing | EV-050 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00484 | 164 | confirmed_gap | offering_context_unverified | EV-050 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00485 | 164 | confirmed_gap | selected_course_citation_incomplete | EV-051, EV-052, EV-053, EV-054, EV-055, EV-056, EV-057, EV-058, EV-059, EV-060, EV-061, EV-062, EV-063, EV-064, EV-065, EV-066, EV-067, EV-068, EV-069, EV-070, EV-071, EV-072 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00486 | 165 | confirmed_gap | scope_evidence_missing | EV-073 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00487 | 165 | confirmed_gap | offering_context_unverified | EV-073 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00488 | 165 | confirmed_gap | selected_course_citation_incomplete | EV-074, EV-075, EV-076, EV-077, EV-078, EV-079, EV-080, EV-081, EV-082, EV-083, EV-084 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00489 | 166 | confirmed_gap | offering_context_unverified | EV-085 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00490 | 166 | confirmed_gap | selected_course_content_or_outcome_gap | EV-086, EV-087 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00491 | 166 | candidate | scope_semantic_review_required | EV-086, EV-087 | Reconcile the exact offering context, each named component, selected courses/outcomes, and supported student-facing status; a review label is not evidence of correctness. |
| SRC-00492 | 167 | confirmed_gap | scope_evidence_missing | EV-088 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00493 | 167 | confirmed_gap | offering_context_unverified | EV-088 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00494 | 167 | confirmed_gap | selected_course_citation_incomplete | EV-089, EV-090, EV-091, EV-092, EV-093, EV-094, EV-095, EV-096, EV-097, EV-098, EV-099, EV-100, EV-101, EV-102, EV-103, EV-104, EV-105, EV-106, EV-107, EV-108, EV-109, EV-110, EV-111 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00495 | 168 | confirmed_gap | scope_evidence_missing | EV-112 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00496 | 168 | confirmed_gap | offering_context_unverified | EV-112 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00497 | 168 | confirmed_gap | selected_course_citation_incomplete | EV-113, EV-114, EV-115, EV-116, EV-117, EV-118, EV-119, EV-120, EV-121, EV-122, EV-123, EV-124, EV-125, EV-126, EV-127, EV-128, EV-129, EV-130, EV-131, EV-132, EV-133, EV-134, EV-135, EV-136 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00498 | 169 | confirmed_gap | scope_evidence_missing | EV-137 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00499 | 169 | confirmed_gap | offering_context_unverified | EV-137 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00500 | 169 | confirmed_gap | selected_course_citation_incomplete | EV-138, EV-139, EV-140, EV-141, EV-142, EV-143 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00501 | 170 | confirmed_gap | scope_evidence_missing | EV-144 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00502 | 170 | confirmed_gap | offering_context_unverified | EV-144 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00503 | 170 | confirmed_gap | selected_course_citation_incomplete | EV-145, EV-146, EV-147, EV-148, EV-149, EV-150, EV-151, EV-152, EV-153, EV-154, EV-155, EV-156, EV-157, EV-158, EV-159, EV-160, EV-161, EV-162 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00504 | 171 | confirmed_gap | scope_evidence_missing | EV-163 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00505 | 171 | confirmed_gap | offering_context_unverified | EV-163 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00506 | 171 | confirmed_gap | selected_course_citation_incomplete | EV-164, EV-165, EV-166, EV-167, EV-168, EV-169, EV-170, EV-171, EV-172, EV-173, EV-174, EV-175, EV-176, EV-177, EV-178, EV-179, EV-180, EV-181, EV-182, EV-183, EV-184, EV-185, EV-186, EV-187, EV-188, EV-189 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00507 | 172 | confirmed_gap | scope_evidence_missing | EV-190 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00508 | 172 | confirmed_gap | offering_context_unverified | EV-190 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00509 | 172 | confirmed_gap | selected_course_citation_incomplete | EV-191, EV-192, EV-193, EV-194, EV-195, EV-196, EV-197, EV-198, EV-199, EV-200, EV-201, EV-202 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00510 | 172 | confirmed_gap | selected_course_content_or_outcome_gap | EV-191, EV-192, EV-193, EV-194, EV-195, EV-196, EV-197, EV-198, EV-199, EV-200, EV-201, EV-202 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00511 | 173 | confirmed_gap | scope_evidence_missing | EV-203 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00512 | 173 | confirmed_gap | offering_context_unverified | EV-203 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00513 | 173 | confirmed_gap | selected_course_citation_incomplete | EV-113, EV-114, EV-115, EV-116, EV-117, EV-118, EV-119, EV-120, EV-121, EV-122, EV-123, EV-125, EV-126, EV-128, EV-129, EV-130, EV-131, EV-132, EV-133, EV-134, EV-135, EV-136 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00514 | 174 | confirmed_gap | scope_evidence_missing | EV-204 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00515 | 174 | confirmed_gap | offering_context_unverified | EV-204 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00516 | 174 | confirmed_gap | selected_course_citation_incomplete | EV-205, EV-206, EV-207, EV-208, EV-209, EV-210, EV-211, EV-212, EV-213, EV-214 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00517 | 174 | confirmed_gap | selected_course_content_or_outcome_gap | EV-205, EV-206, EV-207, EV-208, EV-209, EV-210, EV-211, EV-212, EV-213, EV-214 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00518 | 175 | confirmed_gap | scope_evidence_missing | EV-215 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00519 | 175 | confirmed_gap | offering_context_unverified | EV-215 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00520 | 175 | confirmed_gap | selected_course_citation_incomplete | EV-216, EV-217, EV-218, EV-219, EV-220, EV-221, EV-222 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00521 | 175 | confirmed_gap | selected_course_content_or_outcome_gap | EV-216, EV-217, EV-218, EV-219, EV-220, EV-221, EV-222 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00522 | 176 | confirmed_gap | scope_evidence_missing | EV-223 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00523 | 176 | confirmed_gap | offering_context_unverified | EV-223 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00524 | 176 | confirmed_gap | selected_course_citation_incomplete | EV-216, EV-217, EV-218, EV-219, EV-220, EV-221, EV-222, EV-224 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00525 | 176 | confirmed_gap | selected_course_content_or_outcome_gap | EV-216, EV-217, EV-218, EV-219, EV-220, EV-221, EV-222, EV-224 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00526 | 177 | confirmed_gap | scope_evidence_missing | EV-225 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00527 | 177 | confirmed_gap | offering_context_unverified | EV-225 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00528 | 177 | confirmed_gap | selected_course_citation_incomplete | EV-226, EV-227, EV-228, EV-229, EV-230, EV-231 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00529 | 177 | confirmed_gap | selected_course_content_or_outcome_gap | EV-226, EV-227, EV-228, EV-229, EV-230, EV-231 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00530 | 177 | candidate | scope_semantic_review_required | EV-225 | Reconcile the exact offering context, each named component, selected courses/outcomes, and supported student-facing status; a review label is not evidence of correctness. |
| SRC-00531 | 178 | confirmed_gap | scope_evidence_missing | EV-232 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00532 | 178 | confirmed_gap | offering_context_unverified | EV-232 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00533 | 178 | confirmed_gap | selected_course_citation_incomplete | EV-191, EV-192, EV-193, EV-194, EV-195, EV-198, EV-201, EV-202, EV-233, EV-234, EV-235 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00534 | 178 | confirmed_gap | selected_course_content_or_outcome_gap | EV-191, EV-192, EV-193, EV-194, EV-195, EV-198, EV-201, EV-202, EV-233, EV-234, EV-235 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00535 | 179 | confirmed_gap | scope_evidence_missing | EV-236 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00536 | 179 | confirmed_gap | offering_context_unverified | EV-236 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00537 | 179 | confirmed_gap | selected_course_citation_incomplete | EV-191, EV-192, EV-193, EV-194, EV-195, EV-198, EV-201, EV-202 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00538 | 179 | confirmed_gap | selected_course_content_or_outcome_gap | EV-191, EV-192, EV-193, EV-194, EV-195, EV-198, EV-201, EV-202 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00539 | 180 | confirmed_gap | scope_evidence_missing | EV-237 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00540 | 180 | confirmed_gap | offering_context_unverified | EV-237 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00541 | 180 | confirmed_gap | selected_course_citation_incomplete | EV-191, EV-192, EV-193, EV-194, EV-195, EV-197, EV-198, EV-201, EV-202 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00542 | 180 | confirmed_gap | selected_course_content_or_outcome_gap | EV-191, EV-192, EV-193, EV-194, EV-195, EV-197, EV-198, EV-201, EV-202 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |

## Exact evidence URLs, locators, and access dates

### Structured evidence references attached to issue records

| Ref | URL | Exact locator | Accessed |
|---|---|---|---|
| EV-001 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 71 → MARINE BIOLOGY | 2026-09-26 |
| EV-002 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Marine Science → course code BIO 101 | 2026-09-26 |
| EV-003 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Marine Science → course code BIO 102 | 2026-09-26 |
| EV-004 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Marine Science → course code BIO 107 | 2026-09-26 |
| EV-005 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Marine Science → course code BIO 108 | 2026-09-26 |
| EV-006 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Marine Science → course code MSE 201 | 2026-09-26 |
| EV-007 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Marine Science → course code MSE 202 | 2026-09-26 |
| EV-008 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Marine Science → course code MSE 204 | 2026-09-26 |
| EV-009 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Marine Science → course code MSE 207 | 2026-09-26 |
| EV-010 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Marine Science → course code MSE 301 | 2026-09-26 |
| EV-011 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Marine Science → course code MSE 302 | 2026-09-26 |
| EV-012 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Marine Science → course code MSE 303 | 2026-09-26 |
| EV-013 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Marine Science → course code MSE 305 | 2026-09-26 |
| EV-014 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Marine Science → course code MSE 306 | 2026-09-26 |
| EV-015 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Marine Science → course code MSE 307 | 2026-09-26 |
| EV-016 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Marine Science → course code MSE 401 | 2026-09-26 |
| EV-017 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Marine Science → course code MSE 402 | 2026-09-26 |
| EV-018 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Marine Science → course code MSE 403 | 2026-09-26 |
| EV-019 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 73 → Physics Electronics | 2026-09-26 |
| EV-020 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics with Electronics → course code PHY 101 | 2026-09-26 |
| EV-021 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics with Electronics → course code PHY 102 | 2026-09-26 |
| EV-022 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics with Electronics → course code PHY 103 | 2026-09-26 |
| EV-023 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics with Electronics → course code PHY 104 | 2026-09-26 |
| EV-024 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics with Electronics → course code PHY 205 | 2026-09-26 |
| EV-025 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics with Electronics → course code PHY 206 | 2026-09-26 |
| EV-026 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics with Electronics → course code PHY 213 | 2026-09-26 |
| EV-027 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics with Electronics → course code PHY 301 | 2026-09-26 |
| EV-028 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics with Electronics → course code PHY 305 | 2026-09-26 |
| EV-029 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics with Electronics → course code PHY 306 | 2026-09-26 |
| EV-030 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics with Electronics → course code PHY 401 | 2026-09-26 |
| EV-031 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics with Electronics → course code PHY 403 | 2026-09-26 |
| EV-032 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics with Electronics → course code PHY 404 | 2026-09-26 |
| EV-033 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics with Electronics → course code PHY 422 | 2026-09-26 |
| EV-034 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 74 → Physics/Industrial Physics | 2026-09-26 |
| EV-035 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Industrial Physics → course code PHY 101 | 2026-09-26 |
| EV-036 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Industrial Physics → course code PHY 102 | 2026-09-26 |
| EV-037 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Industrial Physics → course code PHY 103 | 2026-09-26 |
| EV-038 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Industrial Physics → course code PHY 104 | 2026-09-26 |
| EV-039 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Industrial Physics → course code PHY 107 | 2026-09-26 |
| EV-040 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Industrial Physics → course code PHY 108 | 2026-09-26 |
| EV-041 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Industrial Physics → course code PHY 201 | 2026-09-26 |
| EV-042 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Industrial Physics → course code PHY 204 | 2026-09-26 |
| EV-043 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Industrial Physics → course code PHY 205 | 2026-09-26 |
| EV-044 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Industrial Physics → course code PHY 305 | 2026-09-26 |
| EV-045 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Industrial Physics → course code PHY 306 | 2026-09-26 |
| EV-046 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Industrial Physics → course code PHY 314 | 2026-09-26 |
| EV-047 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Industrial Physics → course code PHY 401 | 2026-09-26 |
| EV-048 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Industrial Physics → course code PHY 403 | 2026-09-26 |
| EV-049 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Industrial Physics → course code PHY 423 | 2026-09-26 |
| EV-050 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 75 → Applied Physics | 2026-09-26 |
| EV-051 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics → course code PHY 101 | 2026-09-26 |
| EV-052 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics → course code PHY 102 | 2026-09-26 |
| EV-053 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics → course code PHY 103 | 2026-09-26 |
| EV-054 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics → course code PHY 104 | 2026-09-26 |
| EV-055 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics → course code PHY 107 | 2026-09-26 |
| EV-056 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics → course code PHY 201 | 2026-09-26 |
| EV-057 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics → course code PHY 204 | 2026-09-26 |
| EV-058 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics → course code PHY 205 | 2026-09-26 |
| EV-059 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics → course code PHY 206 | 2026-09-26 |
| EV-060 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics → course code PHY 213 | 2026-09-26 |
| EV-061 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics → course code PHY 214 | 2026-09-26 |
| EV-062 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics → course code PHY 301 | 2026-09-26 |
| EV-063 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics → course code PHY 305 | 2026-09-26 |
| EV-064 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics → course code PHY 306 | 2026-09-26 |
| EV-065 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics → course code PHY 414 | 2026-09-26 |
| EV-066 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics → course code PHY 401 | 2026-09-26 |
| EV-067 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics → course code PHY 403 | 2026-09-26 |
| EV-068 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics → course code PHY 405 | 2026-09-26 |
| EV-069 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics → course code PHY 411 | 2026-09-26 |
| EV-070 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics → course code PHY 421 | 2026-09-26 |
| EV-071 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics → course code PHY 513 | 2026-09-26 |
| EV-072 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics → course code PHY 529 | 2026-09-26 |
| EV-073 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 76 → Applied Biochemistry | 2026-09-26 |
| EV-074 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biochemistry → course code BCH 201 | 2026-09-26 |
| EV-075 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biochemistry → course code BCH 202 | 2026-09-26 |
| EV-076 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biochemistry → course code BCH 203 | 2026-09-26 |
| EV-077 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biochemistry → course code BCH 301 | 2026-09-26 |
| EV-078 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biochemistry → course code BCH 302 | 2026-09-26 |
| EV-079 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biochemistry → course code BCH 306 | 2026-09-26 |
| EV-080 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biochemistry → course code BCH 307 | 2026-09-26 |
| EV-081 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biochemistry → course code BCH 309 | 2026-09-26 |
| EV-082 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biochemistry → course code BCH 402 | 2026-09-26 |
| EV-083 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biochemistry → course code BCH 405 | 2026-09-26 |
| EV-084 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biochemistry → course code BCH 408 | 2026-09-26 |
| EV-085 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 77 → Chemistry and Industrial Chemistry | 2026-09-26 |
| EV-086 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Printed p. 452, Sciences catalogue index, entry 34. The parsed local occurrence lists ABSU and IGBINEDION, but the individual awarder cells still require direct verification. | 2026-09-26 |
| EV-087 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | Industrial Chemistry global course structure, printed pp. 298–299, and course contents/outcomes including ICH 251–252 at p. 310 and ICH 319 at p. 317; Chemistry is a separate CCMAS programme in the same document. Local parsed records are Sciences::Industrial Chemistry (ICH) and Sciences::Chemistry (CHM). | 2026-09-26 |
| EV-088 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 79 → Applied Geology | 2026-09-26 |
| EV-089 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Geology → course code GEY 101 | 2026-09-26 |
| EV-090 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Geology → course code GEY 102 | 2026-09-26 |
| EV-091 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Geology → course code GEY 202 | 2026-09-26 |
| EV-092 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Geology → course code GEY 203 | 2026-09-26 |
| EV-093 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Geology → course code GEY 207 | 2026-09-26 |
| EV-094 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Geology → course code GEY 210 | 2026-09-26 |
| EV-095 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Geology → course code GEY 301 | 2026-09-26 |
| EV-096 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Geology → course code GEY 308 | 2026-09-26 |
| EV-097 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Geology → course code GEY 310 | 2026-09-26 |
| EV-098 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Geology → course code GEY 312 | 2026-09-26 |
| EV-099 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Geology → course code GEY 313 | 2026-09-26 |
| EV-100 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Geology → course code GEY 314 | 2026-09-26 |
| EV-101 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Geology → course code GEY 315 | 2026-09-26 |
| EV-102 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Geology → course code GEY 404 | 2026-09-26 |
| EV-103 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Geology → course code GEY 408 | 2026-09-26 |
| EV-104 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Geology → course code GEY 409 | 2026-09-26 |
| EV-105 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Geology → course code GEY 410 | 2026-09-26 |
| EV-106 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Geology → course code GEY 411 | 2026-09-26 |
| EV-107 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Geology → course code GEY 412 | 2026-09-26 |
| EV-108 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Geology → course code GEY 414 | 2026-09-26 |
| EV-109 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Geology → course code GEY 415 | 2026-09-26 |
| EV-110 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Geology → course code GEY 416 | 2026-09-26 |
| EV-111 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Geology → course code GEY 417 | 2026-09-26 |
| EV-112 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 81 → Plant Biology and Biotechnology | 2026-09-26 |
| EV-113 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BIO 101 | 2026-09-26 |
| EV-114 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BIO 102 | 2026-09-26 |
| EV-115 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BIO 107 | 2026-09-26 |
| EV-116 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BIO 108 | 2026-09-26 |
| EV-117 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code CHM 101 | 2026-09-26 |
| EV-118 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BCH 201 | 2026-09-26 |
| EV-119 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code MCB 221 | 2026-09-26 |
| EV-120 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code STA 201 | 2026-09-26 |
| EV-121 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 202 | 2026-09-26 |
| EV-122 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 301 | 2026-09-26 |
| EV-123 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 302 | 2026-09-26 |
| EV-124 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 304 | 2026-09-26 |
| EV-125 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 305 | 2026-09-26 |
| EV-126 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 309 | 2026-09-26 |
| EV-127 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 311 | 2026-09-26 |
| EV-128 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 313 | 2026-09-26 |
| EV-129 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 315 | 2026-09-26 |
| EV-130 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 401 | 2026-09-26 |
| EV-131 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 403 | 2026-09-26 |
| EV-132 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 404 | 2026-09-26 |
| EV-133 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 405 | 2026-09-26 |
| EV-134 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 406 | 2026-09-26 |
| EV-135 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 407 | 2026-09-26 |
| EV-136 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 433 | 2026-09-26 |
| EV-137 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 82 → Applied Zoology | 2026-09-26 |
| EV-138 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Zoology → course code ZOO 211 | 2026-09-26 |
| EV-139 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Zoology → course code ZOO 212 | 2026-09-26 |
| EV-140 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Zoology → course code ZOO 301 | 2026-09-26 |
| EV-141 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Zoology → course code ZOO 419 | 2026-09-26 |
| EV-142 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Zoology → course code ZOO 422 | 2026-09-26 |
| EV-143 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Zoology → course code ZOO 499 | 2026-09-26 |
| EV-144 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 84 → Molecular Biology | 2026-09-26 |
| EV-145 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 102 | 2026-09-26 |
| EV-146 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 107 | 2026-09-26 |
| EV-147 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 108 | 2026-09-26 |
| EV-148 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 203 | 2026-09-26 |
| EV-149 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 204 | 2026-09-26 |
| EV-150 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 205 | 2026-09-26 |
| EV-151 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 206 | 2026-09-26 |
| EV-152 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 208 | 2026-09-26 |
| EV-153 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 302 | 2026-09-26 |
| EV-154 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 303 | 2026-09-26 |
| EV-155 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 306 | 2026-09-26 |
| EV-156 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 307 | 2026-09-26 |
| EV-157 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 403 | 2026-09-26 |
| EV-158 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 414 | 2026-09-26 |
| EV-159 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 406 | 2026-09-26 |
| EV-160 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 407 | 2026-09-26 |
| EV-161 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 408 | 2026-09-26 |
| EV-162 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 413 | 2026-09-26 |
| EV-163 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 85 → Mathematics and Economics / Mathematics with Economics | 2026-09-26 |
| EV-164 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Economics → course code ECO 101 | 2026-09-26 |
| EV-165 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Economics → course code ECO 102 | 2026-09-26 |
| EV-166 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Economics → course code ECO 103 | 2026-09-26 |
| EV-167 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Economics → course code ECO 104 | 2026-09-26 |
| EV-168 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Economics → course code ECO 201 | 2026-09-26 |
| EV-169 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Economics → course code ECO 202 | 2026-09-26 |
| EV-170 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Economics → course code ECO 203 | 2026-09-26 |
| EV-171 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Economics → course code ECO 204 | 2026-09-26 |
| EV-172 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Economics → course code ECO 205 | 2026-09-26 |
| EV-173 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Economics → course code ECO 206 | 2026-09-26 |
| EV-174 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Economics → course code ECO 207 | 2026-09-26 |
| EV-175 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Economics → course code GST 312 | 2026-09-26 |
| EV-176 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Economics → course code ENT 312 | 2026-09-26 |
| EV-177 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Economics → course code ECO 301 | 2026-09-26 |
| EV-178 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Economics → course code ECO 302 | 2026-09-26 |
| EV-179 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Economics → course code ECO 303 | 2026-09-26 |
| EV-180 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Economics → course code ECO 304 | 2026-09-26 |
| EV-181 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Economics → course code ECO 305 | 2026-09-26 |
| EV-182 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Economics → course code ECO 308 | 2026-09-26 |
| EV-183 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Economics → course code ECO 401 | 2026-09-26 |
| EV-184 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Economics → course code ECO 402 | 2026-09-26 |
| EV-185 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Economics → course code ECO 403 | 2026-09-26 |
| EV-186 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Economics → course code ECO 404 | 2026-09-26 |
| EV-187 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Economics → course code ECO 405 | 2026-09-26 |
| EV-188 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Economics → course code ECO 406 | 2026-09-26 |
| EV-189 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Economics → course code ECO 499 | 2026-09-26 |
| EV-190 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 86 → Computer Science and Information Science | 2026-09-26 |
| EV-191 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Computer Science → course code COS 101 | 2026-09-26 |
| EV-192 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Computer Science → course code COS 201 | 2026-09-26 |
| EV-193 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Computer Science → course code COS 202 | 2026-09-26 |
| EV-194 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Computer Science → course code IFT 212 | 2026-09-26 |
| EV-195 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Computer Science → course code SEN 201 | 2026-09-26 |
| EV-196 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Computer Science → course code CSC 301 | 2026-09-26 |
| EV-197 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Computer Science → course code CSC 308 | 2026-09-26 |
| EV-198 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Computer Science → course code CSC 322 | 2026-09-26 |
| EV-199 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Computer Science → course code DTS 304 | 2026-09-26 |
| EV-200 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Computer Science → course code ICT 305 | 2026-09-26 |
| EV-201 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Computer Science → course code CSC 401 | 2026-09-26 |
| EV-202 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Computer Science → course code CSC 402 | 2026-09-26 |
| EV-203 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 87 → BIOTECHNOLOGY AND MOLECULAR BIOLOGY | 2026-09-26 |
| EV-204 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 88 → DATA MANAGEMENT | 2026-09-26 |
| EV-205 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Data Science → course code STA 111 | 2026-09-26 |
| EV-206 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Data Science → course code COS 101 | 2026-09-26 |
| EV-207 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Data Science → course code DTS 201 | 2026-09-26 |
| EV-208 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Data Science → course code DTS 204 | 2026-09-26 |
| EV-209 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Data Science → course code DTS 302 | 2026-09-26 |
| EV-210 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Data Science → course code DTS 304 | 2026-09-26 |
| EV-211 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Data Science → course code DTS 308 | 2026-09-26 |
| EV-212 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Data Science → course code DTS 316 | 2026-09-26 |
| EV-213 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Data Science → course code DTS 322 | 2026-09-26 |
| EV-214 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Data Science → course code DTS 403 | 2026-09-26 |
| EV-215 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 94 → LIBRARY AND INFORMATION TECHNOLOGY | 2026-09-26 |
| EV-216 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Information Technology → course code COS 101 | 2026-09-26 |
| EV-217 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Information Technology → course code IFT 205 | 2026-09-26 |
| EV-218 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Information Technology → course code IFT 304 | 2026-09-26 |
| EV-219 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Information Technology → course code CSC 308 | 2026-09-26 |
| EV-220 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Information Technology → course code ICT 305 | 2026-09-26 |
| EV-221 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Information Technology → course code IFT 403 | 2026-09-26 |
| EV-222 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Information Technology → course code IFT 442 | 2026-09-26 |
| EV-223 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 95 → INFORMATION AND MEDIA TECHNOLOGY | 2026-09-26 |
| EV-224 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Information Technology → course code IFT 203 | 2026-09-26 |
| EV-225 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 98 → MATHEMATICAL SCIENCES | 2026-09-26 |
| EV-226 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Mathematics → course code COS 101 | 2026-09-26 |
| EV-227 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Mathematics → course code MTH 101 | 2026-09-26 |
| EV-228 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Mathematics → course code MTH 201 | 2026-09-26 |
| EV-229 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Mathematics → course code MTH 308 | 2026-09-26 |
| EV-230 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Mathematics → course code MTH 310 | 2026-09-26 |
| EV-231 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Mathematics → course code MTH 407 | 2026-09-26 |
| EV-232 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 99 → COMPUTER SCIENCE WITH MATHEMATICS | 2026-09-26 |
| EV-233 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Computer Science → course code MTH 101 | 2026-09-26 |
| EV-234 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Computer Science → course code MTH 102 | 2026-09-26 |
| EV-235 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Computer Science → course code MTH 201 | 2026-09-26 |
| EV-236 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 100 → ELECTRONICS AND COMPUTER TECHNOLOGY | 2026-09-26 |
| EV-237 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 101 → ELECTRONICS AND COMPUTER SYSTEMS | 2026-09-26 |

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

This increment reconciles the current **161–180** queue against the prior row-level evidence. It does **not** close any identity: scope evidence, exact offering context, selected-course fidelity, item-level citations, and external/custom provenance remain open where listed. It performs no downstream domain/subgroup/role audit.

The next bounded increment is **identities 181–200**, maximum **20 identities/packages**, and must save its own append-only JSON/Markdown checkpoint before proceeding.

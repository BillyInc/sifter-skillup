# JAMB–CCMAS source increment 005 — identities 081–100

**Audit date:** 2026-09-26 (Africa/Lagos)  
**Mode:** bounded reconciliation after checkpoint 003; append-only  
**Assigned lane:** JAMB identity/offering and CCMAS/external source integrity only  
**Write boundary:** no shared source, mapping, scope, seed, SQL, UI, downstream taxonomy, domain, subgroup, or role file was edited.

## Exact coverage inspected

- Canonical JAMB identities: **20/20**, rows **081–100**.
- Current queue records: **20 identity rows**, **66 current issue records**.
- Current selected-course occurrences represented by those rows: **386**.
- Parsed offering occurrences represented by those rows: **20**.
- CCMAS/external components inspected through the current records: **Administration and Management::Accounting, Administration and Management::Aviation Management, Administration and Management::Business Administration, Administration and Management::Co-operative and Rural Development, Administration and Management::Employment and Human Resource Management, Administration and Management::Entrepreneurship, Administration and Management::Finance / Banking and Finance, Administration and Management::Hospitality and Tourism Management, Administration and Management::Marketing, Administration and Management::Securities and Investments Management, Administration and Management::Transport Management, Social Sciences::Economics, Social Sciences::International Relations**.
- Prior row-level evidence was read first from the existing final-gap checkpoint(s) for rows **081–100**; already-verified facts were not re-researched.

## Records inspected

| Row | JAMB identity | Component reference(s) | Current scope state | Selected courses | Offering records | Current issue IDs |
|---:|---|---|---|---:|---:|---|
| 081 | Securities and Investment | Administration and Management::Securities and Investments Management | partial_scope_reviewed | 15 | 1 | SRC-00249, SRC-00250, SRC-00251 |
| 082 | Management Studies | Administration and Management::Business Administration | partial_scope_reviewed | 31 | 1 | SRC-00252, SRC-00253, SRC-00254 |
| 083 | Entrepreneurship and Innovation | Administration and Management::Entrepreneurship | partial_scope_reviewed | 21 | 1 | SRC-00255, SRC-00256, SRC-00257 |
| 084 | Transport Management | Administration and Management::Transport Management | full | 0 | 1 | SRC-00258, SRC-00259 |
| 085 | Tourism Studies | Administration and Management::Hospitality and Tourism Management | partial_scope_reviewed | 26 | 1 | SRC-00260, SRC-00261, SRC-00262 |
| 086 | Employment and Human Resource Management | Administration and Management::Employment and Human Resource Management | full | 0 | 1 | SRC-00263, SRC-00264 |
| 087 | Accounting and Data Analytics | Administration and Management::Accounting | partial_scope_reviewed | 18 | 1 | SRC-00265, SRC-00266, SRC-00267 |
| 088 | Finance and Financial Technology | Administration and Management::Finance / Banking and Finance | partial_scope_reviewed | 20 | 1 | SRC-00268, SRC-00269, SRC-00270 |
| 089 | Agribusiness and Economics | Social Sciences::Economics | partial_scope_reviewed | 25 | 1 | SRC-00271, SRC-00272, SRC-00273 |
| 090 | Cooperative Management | Administration and Management::Co-operative and Rural Development | partial_scope_reviewed | 24 | 1 | SRC-00274, SRC-00275, SRC-00276, SRC-00277 |
| 091 | Cooperative Economics and Management | Administration and Management::Co-operative and Rural Development | partial_scope_reviewed | 27 | 1 | SRC-00278, SRC-00279, SRC-00280, SRC-00281 |
| 092 | Social Innovation and Entrepreneurship | Administration and Management::Entrepreneurship | partial_scope_reviewed | 22 | 1 | SRC-00282, SRC-00283, SRC-00284 |
| 093 | Entrepreneurship and Business Management | Administration and Management::Entrepreneurship | partial_scope_reviewed | 21 | 1 | SRC-00285, SRC-00286, SRC-00287 |
| 094 | Transport and Tourism | Administration and Management::Transport Management | partial_scope_reviewed | 32 | 1 | SRC-00288, SRC-00289, SRC-00290 |
| 095 | Aviation Management | Administration and Management::Aviation Management | full | 0 | 1 | SRC-00291, SRC-00292 |
| 096 | Aviation Security | Administration and Management::Aviation Management | partial_scope_reviewed | 15 | 1 | SRC-00293, SRC-00294, SRC-00295 |
| 097 | Personnel Management | Administration and Management::Employment and Human Resource Management | partial_scope_reviewed | 14 | 1 | SRC-00296, SRC-00297, SRC-00298 |
| 098 | Industrial Relations and Human Resources Management | Administration and Management::Employment and Human Resource Management | partial_scope_reviewed | 23 | 1 | SRC-00299, SRC-00300, SRC-00301 |
| 099 | International Relations and Strategic Studies | Social Sciences::International Relations | partial_scope_reviewed | 26 | 1 | SRC-00302, SRC-00303, SRC-00304 |
| 100 | Marketing and Consumer Studies | Administration and Management::Marketing | partial_scope_reviewed | 26 | 1 | SRC-00305, SRC-00306, SRC-00307 |

## Current issue counts

- Confirmed gaps still open: **59**.
- Candidate issues still open: **0**.
- New issue classes discovered in this reconciliation: **0**.
- Closed findings reopened: **0**.
- Distinct exact evidence references captured: **327**.

By issue type/status:

- `offering_context_unverified` / `confirmed_gap`: 20
- `scope_evidence_missing` / `confirmed_gap`: 20
- `selected_course_citation_incomplete` / `confirmed_gap`: 17
- `selected_course_content_or_outcome_gap` / `confirmed_gap`: 2

## Confirmed and candidate issue ledger

The following are current open records carried from the source issue queue. They are not claims that every record below is an academic-content defect; provenance, offering-context, and citation gaps remain distinct from content defects.

| Issue | Row | Status | Type | Evidence refs | Recommendation |
|---|---:|---|---|---|---|
| SRC-00249 | 081 | confirmed_gap | scope_evidence_missing | EV-001 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00250 | 081 | confirmed_gap | offering_context_unverified | EV-001 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00251 | 081 | confirmed_gap | selected_course_citation_incomplete | EV-002, EV-003, EV-004, EV-005, EV-006, EV-007, EV-008, EV-009, EV-010, EV-011, EV-012, EV-013, EV-014, EV-015, EV-016 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00252 | 082 | confirmed_gap | scope_evidence_missing | EV-017 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00253 | 082 | confirmed_gap | offering_context_unverified | EV-017 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00254 | 082 | confirmed_gap | selected_course_citation_incomplete | EV-018, EV-019, EV-020, EV-021, EV-022, EV-023, EV-024, EV-025, EV-026, EV-027, EV-028, EV-029, EV-030, EV-031, EV-032, EV-033, EV-034, EV-035, EV-036, EV-037, EV-038, EV-039, EV-040, EV-041, EV-042, EV-043, EV-044, EV-045, EV-046, EV-047, EV-048 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00255 | 083 | confirmed_gap | scope_evidence_missing | EV-049 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00256 | 083 | confirmed_gap | offering_context_unverified | EV-049 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00257 | 083 | confirmed_gap | selected_course_citation_incomplete | EV-050, EV-051, EV-052, EV-053, EV-054, EV-055, EV-056, EV-057, EV-058, EV-059, EV-060, EV-061, EV-062, EV-063, EV-064, EV-065, EV-066, EV-067, EV-068, EV-069, EV-070 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00258 | 084 | confirmed_gap | scope_evidence_missing | EV-071 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00259 | 084 | confirmed_gap | offering_context_unverified | EV-071 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00260 | 085 | confirmed_gap | scope_evidence_missing | EV-072 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00261 | 085 | confirmed_gap | offering_context_unverified | EV-072 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00262 | 085 | confirmed_gap | selected_course_citation_incomplete | EV-073, EV-074, EV-075, EV-076, EV-077, EV-078, EV-079, EV-080, EV-081, EV-082, EV-083, EV-084, EV-085, EV-086, EV-087, EV-088, EV-089, EV-090, EV-091, EV-092, EV-093, EV-094, EV-095 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00263 | 086 | confirmed_gap | scope_evidence_missing | EV-096 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00264 | 086 | confirmed_gap | offering_context_unverified | EV-096 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00265 | 087 | confirmed_gap | scope_evidence_missing | EV-097 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00266 | 087 | confirmed_gap | offering_context_unverified | EV-097 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00267 | 087 | confirmed_gap | selected_course_citation_incomplete | EV-098, EV-099, EV-100, EV-101, EV-102, EV-103, EV-104, EV-105, EV-106, EV-107, EV-108, EV-109, EV-110, EV-111, EV-112, EV-113, EV-114, EV-115 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00268 | 088 | confirmed_gap | scope_evidence_missing | EV-116 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00269 | 088 | confirmed_gap | offering_context_unverified | EV-116 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00270 | 088 | confirmed_gap | selected_course_citation_incomplete | EV-117, EV-118, EV-119, EV-120, EV-121, EV-122, EV-123, EV-124, EV-125, EV-126, EV-127, EV-128, EV-129, EV-130, EV-131, EV-132, EV-133, EV-134, EV-135, EV-136 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00271 | 089 | confirmed_gap | scope_evidence_missing | EV-137 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00272 | 089 | confirmed_gap | offering_context_unverified | EV-137 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00273 | 089 | confirmed_gap | selected_course_citation_incomplete | EV-138, EV-139, EV-140, EV-141, EV-142, EV-143, EV-144, EV-145, EV-146, EV-147, EV-148, EV-149, EV-150, EV-151, EV-152, EV-153, EV-154, EV-155, EV-156, EV-157, EV-158, EV-159, EV-160, EV-161, EV-162 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00274 | 090 | confirmed_gap | scope_evidence_missing | EV-163 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00275 | 090 | confirmed_gap | offering_context_unverified | EV-163 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00276 | 090 | confirmed_gap | selected_course_citation_incomplete | EV-164, EV-165, EV-166, EV-167, EV-168, EV-169, EV-170, EV-171, EV-172, EV-173, EV-174, EV-175, EV-176, EV-177, EV-178, EV-179, EV-180, EV-181, EV-182, EV-183, EV-184, EV-185, EV-186, EV-187 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00277 | 090 | confirmed_gap | selected_course_content_or_outcome_gap | EV-164, EV-165, EV-166, EV-167, EV-168, EV-169, EV-170, EV-171, EV-172, EV-173, EV-174, EV-175, EV-176, EV-177, EV-178, EV-179, EV-180, EV-181, EV-182, EV-183, EV-184, EV-185, EV-186, EV-187 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00278 | 091 | confirmed_gap | scope_evidence_missing | EV-188 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00279 | 091 | confirmed_gap | offering_context_unverified | EV-188 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00280 | 091 | confirmed_gap | selected_course_citation_incomplete | EV-164, EV-165, EV-166, EV-167, EV-168, EV-169, EV-170, EV-171, EV-172, EV-173, EV-174, EV-175, EV-176, EV-177, EV-178, EV-179, EV-180, EV-181, EV-182, EV-183, EV-184, EV-185, EV-186, EV-187, EV-189, EV-190, EV-191 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00281 | 091 | confirmed_gap | selected_course_content_or_outcome_gap | EV-164, EV-165, EV-166, EV-167, EV-168, EV-169, EV-170, EV-171, EV-172, EV-173, EV-174, EV-175, EV-176, EV-177, EV-178, EV-179, EV-180, EV-181, EV-182, EV-183, EV-184, EV-185, EV-186, EV-187, EV-189, EV-190, EV-191 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00282 | 092 | confirmed_gap | scope_evidence_missing | EV-192 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00283 | 092 | confirmed_gap | offering_context_unverified | EV-192 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00284 | 092 | confirmed_gap | selected_course_citation_incomplete | EV-050, EV-051, EV-052, EV-053, EV-054, EV-055, EV-056, EV-057, EV-058, EV-059, EV-060, EV-061, EV-062, EV-063, EV-064, EV-065, EV-066, EV-067, EV-068, EV-069, EV-070, EV-193 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00285 | 093 | confirmed_gap | scope_evidence_missing | EV-194 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00286 | 093 | confirmed_gap | offering_context_unverified | EV-194 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00287 | 093 | confirmed_gap | selected_course_citation_incomplete | EV-050, EV-051, EV-052, EV-053, EV-054, EV-055, EV-056, EV-057, EV-058, EV-059, EV-060, EV-061, EV-062, EV-063, EV-064, EV-065, EV-066, EV-067, EV-068, EV-069, EV-070 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00288 | 094 | confirmed_gap | scope_evidence_missing | EV-195 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00289 | 094 | confirmed_gap | offering_context_unverified | EV-195 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00290 | 094 | confirmed_gap | selected_course_citation_incomplete | EV-196, EV-197, EV-198, EV-199, EV-200, EV-201, EV-202, EV-203, EV-204, EV-205, EV-206, EV-207, EV-208, EV-209, EV-210, EV-211, EV-212, EV-213, EV-214, EV-215, EV-216, EV-217, EV-218, EV-219, EV-220, EV-221, EV-222, EV-223, EV-224, EV-225, EV-226, EV-227 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00291 | 095 | confirmed_gap | scope_evidence_missing | EV-228 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00292 | 095 | confirmed_gap | offering_context_unverified | EV-228 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00293 | 096 | confirmed_gap | scope_evidence_missing | EV-229 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00294 | 096 | confirmed_gap | offering_context_unverified | EV-229 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00295 | 096 | confirmed_gap | selected_course_citation_incomplete | EV-230, EV-231, EV-232, EV-233, EV-234, EV-235, EV-236, EV-237, EV-238, EV-239, EV-240, EV-241, EV-242, EV-243, EV-244 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00296 | 097 | confirmed_gap | scope_evidence_missing | EV-245 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00297 | 097 | confirmed_gap | offering_context_unverified | EV-245 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00298 | 097 | confirmed_gap | selected_course_citation_incomplete | EV-246, EV-247, EV-248, EV-249, EV-250, EV-251, EV-252, EV-253, EV-254, EV-255, EV-256, EV-257, EV-258, EV-259 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00299 | 098 | confirmed_gap | scope_evidence_missing | EV-260 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00300 | 098 | confirmed_gap | offering_context_unverified | EV-260 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00301 | 098 | confirmed_gap | selected_course_citation_incomplete | EV-246, EV-247, EV-248, EV-250, EV-253, EV-254, EV-255, EV-256, EV-257, EV-259, EV-261, EV-262, EV-263, EV-264, EV-265, EV-266, EV-267, EV-268, EV-269, EV-270, EV-271, EV-272, EV-273 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00302 | 099 | confirmed_gap | scope_evidence_missing | EV-274 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00303 | 099 | confirmed_gap | offering_context_unverified | EV-274 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00304 | 099 | confirmed_gap | selected_course_citation_incomplete | EV-275, EV-276, EV-277, EV-278, EV-279, EV-280, EV-281, EV-282, EV-283, EV-284, EV-285, EV-286, EV-287, EV-288, EV-289, EV-290, EV-291, EV-292, EV-293, EV-294, EV-295, EV-296, EV-297, EV-298, EV-299, EV-300 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00305 | 100 | confirmed_gap | scope_evidence_missing | EV-301 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00306 | 100 | confirmed_gap | offering_context_unverified | EV-301 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00307 | 100 | confirmed_gap | selected_course_citation_incomplete | EV-302, EV-303, EV-304, EV-305, EV-306, EV-307, EV-308, EV-309, EV-310, EV-311, EV-312, EV-313, EV-314, EV-315, EV-316, EV-317, EV-318, EV-319, EV-320, EV-321, EV-322, EV-323, EV-324, EV-325, EV-326, EV-327 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |

## Exact evidence URLs, locators, and access dates

### Structured evidence references attached to issue records

| Ref | URL | Exact locator | Accessed |
|---|---|---|---|
| EV-001 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf | Administration.pdf → parsed row ordinal 34 → Securities and Investment | 2026-09-26 |
| EV-002 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Securities and Investments Management → course code SIM 111 | 2026-09-26 |
| EV-003 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Securities and Investments Management → course code SIM 121 | 2026-09-26 |
| EV-004 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Securities and Investments Management → course code SIM 211 | 2026-09-26 |
| EV-005 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Securities and Investments Management → course code SIM 214 | 2026-09-26 |
| EV-006 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Securities and Investments Management → course code SIM 221 | 2026-09-26 |
| EV-007 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Securities and Investments Management → course code SIM 312 | 2026-09-26 |
| EV-008 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Securities and Investments Management → course code SIM 313 | 2026-09-26 |
| EV-009 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Securities and Investments Management → course code SIM 314 | 2026-09-26 |
| EV-010 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Securities and Investments Management → course code SIM 321 | 2026-09-26 |
| EV-011 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Securities and Investments Management → course code SIM 322 | 2026-09-26 |
| EV-012 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Securities and Investments Management → course code SIM 323 | 2026-09-26 |
| EV-013 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Securities and Investments Management → course code SIM 411 | 2026-09-26 |
| EV-014 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Securities and Investments Management → course code SIM 413 | 2026-09-26 |
| EV-015 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Securities and Investments Management → course code SIM 421 | 2026-09-26 |
| EV-016 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Securities and Investments Management → course code SIM 422 | 2026-09-26 |
| EV-017 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf | Administration.pdf → parsed row ordinal 35 → Management Studies | 2026-09-26 |
| EV-018 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Business Administration → course code AMS 101 | 2026-09-26 |
| EV-019 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Business Administration → course code AMS 102 | 2026-09-26 |
| EV-020 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Business Administration → course code AMS 103 | 2026-09-26 |
| EV-021 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Business Administration → course code AMS 104 | 2026-09-26 |
| EV-022 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Business Administration → course code BUA 101 | 2026-09-26 |
| EV-023 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Business Administration → course code BUA 102 | 2026-09-26 |
| EV-024 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Business Administration → course code BUA 200 | 2026-09-26 |
| EV-025 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Business Administration → course code BUA 201 | 2026-09-26 |
| EV-026 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Business Administration → course code BUA 202 | 2026-09-26 |
| EV-027 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Business Administration → course code BUA 203 | 2026-09-26 |
| EV-028 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Business Administration → course code BUA 204 | 2026-09-26 |
| EV-029 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Business Administration → course code BUA 205 | 2026-09-26 |
| EV-030 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Business Administration → course code BUA 216 | 2026-09-26 |
| EV-031 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Business Administration → course code BUA 218 | 2026-09-26 |
| EV-032 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Business Administration → course code BUA 302 | 2026-09-26 |
| EV-033 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Business Administration → course code BUA 303 | 2026-09-26 |
| EV-034 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Business Administration → course code BUA 304 | 2026-09-26 |
| EV-035 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Business Administration → course code BUA 305 | 2026-09-26 |
| EV-036 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Business Administration → course code BUA 310 | 2026-09-26 |
| EV-037 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Business Administration → course code BUA 312 | 2026-09-26 |
| EV-038 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Business Administration → course code BUA 313 | 2026-09-26 |
| EV-039 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Business Administration → course code BUA 319 | 2026-09-26 |
| EV-040 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Business Administration → course code BUA 321 | 2026-09-26 |
| EV-041 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Business Administration → course code BUA 323 | 2026-09-26 |
| EV-042 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Business Administration → course code BUA 401 | 2026-09-26 |
| EV-043 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Business Administration → course code BUA 402 | 2026-09-26 |
| EV-044 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Business Administration → course code BUA 404 | 2026-09-26 |
| EV-045 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Business Administration → course code BUA 406 | 2026-09-26 |
| EV-046 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Business Administration → course code BUA 409 | 2026-09-26 |
| EV-047 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Business Administration → course code BUA 411 | 2026-09-26 |
| EV-048 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Business Administration → course code BUA 420 | 2026-09-26 |
| EV-049 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf | Administration.pdf → parsed row ordinal 36 → Entrepreneurship and Innovation | 2026-09-26 |
| EV-050 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Entrepreneurship → course code AMS 103 | 2026-09-26 |
| EV-051 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Entrepreneurship → course code ENT 211 | 2026-09-26 |
| EV-052 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Entrepreneurship → course code ENP 201 | 2026-09-26 |
| EV-053 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Entrepreneurship → course code ENP 202 | 2026-09-26 |
| EV-054 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Entrepreneurship → course code ENP 203 | 2026-09-26 |
| EV-055 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Entrepreneurship → course code ENP 204 | 2026-09-26 |
| EV-056 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Entrepreneurship → course code ENP 205 | 2026-09-26 |
| EV-057 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Entrepreneurship → course code ENT 312 | 2026-09-26 |
| EV-058 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Entrepreneurship → course code ENP 301 | 2026-09-26 |
| EV-059 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Entrepreneurship → course code ENP 302 | 2026-09-26 |
| EV-060 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Entrepreneurship → course code ENP 303 | 2026-09-26 |
| EV-061 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Entrepreneurship → course code ENP 304 | 2026-09-26 |
| EV-062 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Entrepreneurship → course code ENP 305 | 2026-09-26 |
| EV-063 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Entrepreneurship → course code ENP 306 | 2026-09-26 |
| EV-064 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Entrepreneurship → course code ENP 307 | 2026-09-26 |
| EV-065 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Entrepreneurship → course code ENP 401 | 2026-09-26 |
| EV-066 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Entrepreneurship → course code ENP 402 | 2026-09-26 |
| EV-067 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Entrepreneurship → course code ENP 403 | 2026-09-26 |
| EV-068 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Entrepreneurship → course code ENP 404 | 2026-09-26 |
| EV-069 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Entrepreneurship → course code ENP 405 | 2026-09-26 |
| EV-070 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Entrepreneurship → course code ENP 408 | 2026-09-26 |
| EV-071 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf | Administration.pdf → parsed row ordinal 37 → Transport Management | 2026-09-26 |
| EV-072 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf | Administration.pdf → parsed row ordinal 38 → Tourism Studies | 2026-09-26 |
| EV-073 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 101 | 2026-09-26 |
| EV-074 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 102 | 2026-09-26 |
| EV-075 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 203 | 2026-09-26 |
| EV-076 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 205 | 2026-09-26 |
| EV-077 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 209 | 2026-09-26 |
| EV-078 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 210 | 2026-09-26 |
| EV-079 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 212 | 2026-09-26 |
| EV-080 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 303 | 2026-09-26 |
| EV-081 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 305 | 2026-09-26 |
| EV-082 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 307 | 2026-09-26 |
| EV-083 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 309 | 2026-09-26 |
| EV-084 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 311 | 2026-09-26 |
| EV-085 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 313 | 2026-09-26 |
| EV-086 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 300 | 2026-09-26 |
| EV-087 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 402 | 2026-09-26 |
| EV-088 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 403 | 2026-09-26 |
| EV-089 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 406 | 2026-09-26 |
| EV-090 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code TRM 408 | 2026-09-26 |
| EV-091 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 410 | 2026-09-26 |
| EV-092 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code TRM 401 | 2026-09-26 |
| EV-093 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code TRM 403 | 2026-09-26 |
| EV-094 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code TRM 407 | 2026-09-26 |
| EV-095 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code TRM 412 | 2026-09-26 |
| EV-096 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf | Administration.pdf → parsed row ordinal 39 → Employment and Human Resource Management | 2026-09-26 |
| EV-097 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf | Administration.pdf → parsed row ordinal 41 → Accounting and Data Analytics | 2026-09-26 |
| EV-098 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Accounting → course code AMS 103 | 2026-09-26 |
| EV-099 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Accounting → course code ACC 101 | 2026-09-26 |
| EV-100 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Accounting → course code ACC 102 | 2026-09-26 |
| EV-101 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Accounting → course code ACC 201 | 2026-09-26 |
| EV-102 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Accounting → course code ACC 202 | 2026-09-26 |
| EV-103 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Accounting → course code ACC 203 | 2026-09-26 |
| EV-104 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Accounting → course code ACC 204 | 2026-09-26 |
| EV-105 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Accounting → course code ACC 206 | 2026-09-26 |
| EV-106 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Accounting → course code ACC 301 | 2026-09-26 |
| EV-107 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Accounting → course code ACC 302 | 2026-09-26 |
| EV-108 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Accounting → course code ACC 303 | 2026-09-26 |
| EV-109 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Accounting → course code ACC 306 | 2026-09-26 |
| EV-110 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Accounting → course code ACC 308 | 2026-09-26 |
| EV-111 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Accounting → course code ACC 311 | 2026-09-26 |
| EV-112 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Accounting → course code ACC 401 | 2026-09-26 |
| EV-113 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Accounting → course code ACC 402 | 2026-09-26 |
| EV-114 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Accounting → course code ACC 403 | 2026-09-26 |
| EV-115 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Accounting → course code ACC 404 | 2026-09-26 |
| EV-116 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf | Administration.pdf → parsed row ordinal 42 → Finance and Financial Technology | 2026-09-26 |
| EV-117 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Finance / Banking and Finance → course code FIN 101 | 2026-09-26 |
| EV-118 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Finance / Banking and Finance → course code FIN 209 | 2026-09-26 |
| EV-119 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Finance / Banking and Finance → course code FIN 210 | 2026-09-26 |
| EV-120 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Finance / Banking and Finance → course code FIN 215 | 2026-09-26 |
| EV-121 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Finance / Banking and Finance → course code FIN 216 | 2026-09-26 |
| EV-122 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Finance / Banking and Finance → course code FIN 217 | 2026-09-26 |
| EV-123 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Finance / Banking and Finance → course code ENT 312 | 2026-09-26 |
| EV-124 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Finance / Banking and Finance → course code FIN 303 | 2026-09-26 |
| EV-125 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Finance / Banking and Finance → course code FIN 304 | 2026-09-26 |
| EV-126 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Finance / Banking and Finance → course code FIN 305 | 2026-09-26 |
| EV-127 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Finance / Banking and Finance → course code FIN 313 | 2026-09-26 |
| EV-128 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Finance / Banking and Finance → course code FIN 315 | 2026-09-26 |
| EV-129 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Finance / Banking and Finance → course code FIN 317 | 2026-09-26 |
| EV-130 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Finance / Banking and Finance → course code FIN 404 | 2026-09-26 |
| EV-131 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Finance / Banking and Finance → course code FIN 409 | 2026-09-26 |
| EV-132 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Finance / Banking and Finance → course code FIN 410 | 2026-09-26 |
| EV-133 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Finance / Banking and Finance → course code FIN 411 | 2026-09-26 |
| EV-134 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Finance / Banking and Finance → course code FIN 413 | 2026-09-26 |
| EV-135 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Finance / Banking and Finance → course code FIN 414 | 2026-09-26 |
| EV-136 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Finance / Banking and Finance → course code FIN 416 | 2026-09-26 |
| EV-137 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf | Administration.pdf → parsed row ordinal 43 → Agribusiness and Economics | 2026-09-26 |
| EV-138 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Economics → course code ECO 101 | 2026-09-26 |
| EV-139 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Economics → course code ECO 102 | 2026-09-26 |
| EV-140 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Economics → course code ECO 104 | 2026-09-26 |
| EV-141 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Economics → course code ECO 201 | 2026-09-26 |
| EV-142 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Economics → course code ECO 202 | 2026-09-26 |
| EV-143 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Economics → course code ECO 203 | 2026-09-26 |
| EV-144 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Economics → course code ECO 204 | 2026-09-26 |
| EV-145 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Economics → course code ECO 205 | 2026-09-26 |
| EV-146 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Economics → course code ECO 206 | 2026-09-26 |
| EV-147 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Economics → course code ECO 207 | 2026-09-26 |
| EV-148 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Economics → course code GST 312 | 2026-09-26 |
| EV-149 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Economics → course code ENT 312 | 2026-09-26 |
| EV-150 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Economics → course code ECO 301 | 2026-09-26 |
| EV-151 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Economics → course code ECO 302 | 2026-09-26 |
| EV-152 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Economics → course code ECO 303 | 2026-09-26 |
| EV-153 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Economics → course code ECO 304 | 2026-09-26 |
| EV-154 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Economics → course code ECO 305 | 2026-09-26 |
| EV-155 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Economics → course code ECO 308 | 2026-09-26 |
| EV-156 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Economics → course code ECO 401 | 2026-09-26 |
| EV-157 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Economics → course code ECO 402 | 2026-09-26 |
| EV-158 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Economics → course code ECO 403 | 2026-09-26 |
| EV-159 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Economics → course code ECO 404 | 2026-09-26 |
| EV-160 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Economics → course code ECO 405 | 2026-09-26 |
| EV-161 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Economics → course code ECO 406 | 2026-09-26 |
| EV-162 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Economics → course code ECO 499 | 2026-09-26 |
| EV-163 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf | Administration.pdf → parsed row ordinal 45 → Cooperative Management | 2026-09-26 |
| EV-164 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Co-operative and Rural Development → course code CRD 101 | 2026-09-26 |
| EV-165 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Co-operative and Rural Development → course code CRD 102 | 2026-09-26 |
| EV-166 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Co-operative and Rural Development → course code CRD 103 | 2026-09-26 |
| EV-167 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Co-operative and Rural Development → course code CRD 105 | 2026-09-26 |
| EV-168 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Co-operative and Rural Development → course code CRD 106 | 2026-09-26 |
| EV-169 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Co-operative and Rural Development → course code CRD 203 | 2026-09-26 |
| EV-170 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Co-operative and Rural Development → course code CRD 204 | 2026-09-26 |
| EV-171 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Co-operative and Rural Development → course code CRD 205 | 2026-09-26 |
| EV-172 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Co-operative and Rural Development → course code CRD 206 | 2026-09-26 |
| EV-173 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Co-operative and Rural Development → course code CRD 207 | 2026-09-26 |
| EV-174 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Co-operative and Rural Development → course code CRD 208 | 2026-09-26 |
| EV-175 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Co-operative and Rural Development → course code CRD 301 | 2026-09-26 |
| EV-176 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Co-operative and Rural Development → course code CRD 302 | 2026-09-26 |
| EV-177 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Co-operative and Rural Development → course code CRD 303 | 2026-09-26 |
| EV-178 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Co-operative and Rural Development → course code CRD 304 | 2026-09-26 |
| EV-179 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Co-operative and Rural Development → course code CRD 305 | 2026-09-26 |
| EV-180 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Co-operative and Rural Development → course code CRD 307 | 2026-09-26 |
| EV-181 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Co-operative and Rural Development → course code CRD 402 | 2026-09-26 |
| EV-182 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Co-operative and Rural Development → course code CRD 403 | 2026-09-26 |
| EV-183 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Co-operative and Rural Development → course code CRD 404 | 2026-09-26 |
| EV-184 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Co-operative and Rural Development → course code CRD 406 | 2026-09-26 |
| EV-185 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Co-operative and Rural Development → course code CRD 407 | 2026-09-26 |
| EV-186 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Co-operative and Rural Development → course code CRD 408 | 2026-09-26 |
| EV-187 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Co-operative and Rural Development → course code CRD 409 | 2026-09-26 |
| EV-188 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf | Administration.pdf → parsed row ordinal 46 → Cooperative Economics and Management | 2026-09-26 |
| EV-189 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Co-operative and Rural Development → course code CRD 104 | 2026-09-26 |
| EV-190 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Co-operative and Rural Development → course code GST 312 | 2026-09-26 |
| EV-191 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Co-operative and Rural Development → course code ENT 312 | 2026-09-26 |
| EV-192 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf | Administration.pdf → parsed row ordinal 47 → Social Innovation and Entrepreneurship | 2026-09-26 |
| EV-193 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Entrepreneurship → course code ENP 407 | 2026-09-26 |
| EV-194 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf | Administration.pdf → parsed row ordinal 48 → Entrepreneurship and Business Management | 2026-09-26 |
| EV-195 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf | Administration.pdf → parsed row ordinal 50 → Transport and Tourism | 2026-09-26 |
| EV-196 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 101 | 2026-09-26 |
| EV-197 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 103 | 2026-09-26 |
| EV-198 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 102 | 2026-09-26 |
| EV-199 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 104 | 2026-09-26 |
| EV-200 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 201 | 2026-09-26 |
| EV-201 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 204 | 2026-09-26 |
| EV-202 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 213 | 2026-09-26 |
| EV-203 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 206 | 2026-09-26 |
| EV-204 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 211 | 2026-09-26 |
| EV-205 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 303 | 2026-09-26 |
| EV-206 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 305 | 2026-09-26 |
| EV-207 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 307 | 2026-09-26 |
| EV-208 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 309 | 2026-09-26 |
| EV-209 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 311 | 2026-09-26 |
| EV-210 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 312 | 2026-09-26 |
| EV-211 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 314 | 2026-09-26 |
| EV-212 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 317 | 2026-09-26 |
| EV-213 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 318 | 2026-09-26 |
| EV-214 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 319 | 2026-09-26 |
| EV-215 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 320 | 2026-09-26 |
| EV-216 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 322 | 2026-09-26 |
| EV-217 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 324 | 2026-09-26 |
| EV-218 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 400/401 | 2026-09-26 |
| EV-219 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 405 | 2026-09-26 |
| EV-220 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 409 | 2026-09-26 |
| EV-221 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 410 | 2026-09-26 |
| EV-222 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 412 | 2026-09-26 |
| EV-223 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 418 | 2026-09-26 |
| EV-224 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 419 | 2026-09-26 |
| EV-225 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 424 | 2026-09-26 |
| EV-226 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 426 | 2026-09-26 |
| EV-227 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 429 | 2026-09-26 |
| EV-228 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf | Administration.pdf → parsed row ordinal 51 → Aviation Management | 2026-09-26 |
| EV-229 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf | Administration.pdf → parsed row ordinal 52 → Aviation Security | 2026-09-26 |
| EV-230 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Aviation Management → course code AVM 101 | 2026-09-26 |
| EV-231 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Aviation Management → course code AVM 102 | 2026-09-26 |
| EV-232 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Aviation Management → course code AVM 203 | 2026-09-26 |
| EV-233 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Aviation Management → course code AVM 204 | 2026-09-26 |
| EV-234 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Aviation Management → course code AVM 210 | 2026-09-26 |
| EV-235 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Aviation Management → course code AVM 211 | 2026-09-26 |
| EV-236 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Aviation Management → course code GST 312 | 2026-09-26 |
| EV-237 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Aviation Management → course code AVM 303 | 2026-09-26 |
| EV-238 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Aviation Management → course code AVM 304 | 2026-09-26 |
| EV-239 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Aviation Management → course code AVM 305 | 2026-09-26 |
| EV-240 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Aviation Management → course code AVM 306 | 2026-09-26 |
| EV-241 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Aviation Management → course code AVM 307 | 2026-09-26 |
| EV-242 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Aviation Management → course code AVM 401 | 2026-09-26 |
| EV-243 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Aviation Management → course code AVM 405 | 2026-09-26 |
| EV-244 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Aviation Management → course code AVM 490 | 2026-09-26 |
| EV-245 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf | Administration.pdf → parsed row ordinal 53 → Personnel Management | 2026-09-26 |
| EV-246 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 101 | 2026-09-26 |
| EV-247 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 102 | 2026-09-26 |
| EV-248 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 201 | 2026-09-26 |
| EV-249 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 204 | 2026-09-26 |
| EV-250 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 205 | 2026-09-26 |
| EV-251 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 303 | 2026-09-26 |
| EV-252 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 305 | 2026-09-26 |
| EV-253 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 309 | 2026-09-26 |
| EV-254 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 311 | 2026-09-26 |
| EV-255 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 312 | 2026-09-26 |
| EV-256 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 402 | 2026-09-26 |
| EV-257 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 403 | 2026-09-26 |
| EV-258 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 405 | 2026-09-26 |
| EV-259 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 407 | 2026-09-26 |
| EV-260 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf | Administration.pdf → parsed row ordinal 54 → Industrial Relations and Human Resources Management | 2026-09-26 |
| EV-261 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code GST 112 | 2026-09-26 |
| EV-262 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code AMS 103 | 2026-09-26 |
| EV-263 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code GST 212 | 2026-09-26 |
| EV-264 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 203 | 2026-09-26 |
| EV-265 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 207 | 2026-09-26 |
| EV-266 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code ENT 312 | 2026-09-26 |
| EV-267 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 301 | 2026-09-26 |
| EV-268 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 302 | 2026-09-26 |
| EV-269 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 306 | 2026-09-26 |
| EV-270 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 307 | 2026-09-26 |
| EV-271 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 308 | 2026-09-26 |
| EV-272 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 310 | 2026-09-26 |
| EV-273 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 401 | 2026-09-26 |
| EV-274 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf | Administration.pdf → parsed row ordinal 57 → International Relations and Strategic Studies | 2026-09-26 |
| EV-275 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code GST 112 | 2026-09-26 |
| EV-276 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 101 | 2026-09-26 |
| EV-277 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 102 | 2026-09-26 |
| EV-278 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 103 | 2026-09-26 |
| EV-279 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 104 | 2026-09-26 |
| EV-280 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 202 | 2026-09-26 |
| EV-281 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 203 | 2026-09-26 |
| EV-282 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 206 | 2026-09-26 |
| EV-283 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 207 | 2026-09-26 |
| EV-284 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code GST 312 | 2026-09-26 |
| EV-285 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 301 | 2026-09-26 |
| EV-286 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 303 | 2026-09-26 |
| EV-287 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 304 | 2026-09-26 |
| EV-288 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 305 | 2026-09-26 |
| EV-289 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 307 | 2026-09-26 |
| EV-290 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 308 | 2026-09-26 |
| EV-291 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 310 | 2026-09-26 |
| EV-292 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 311 | 2026-09-26 |
| EV-293 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 312 | 2026-09-26 |
| EV-294 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 401 | 2026-09-26 |
| EV-295 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 402 | 2026-09-26 |
| EV-296 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 403 | 2026-09-26 |
| EV-297 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 404 | 2026-09-26 |
| EV-298 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 405 | 2026-09-26 |
| EV-299 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 406 | 2026-09-26 |
| EV-300 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 407 | 2026-09-26 |
| EV-301 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf | Administration.pdf → parsed row ordinal 59 → Marketing and Consumer Studies | 2026-09-26 |
| EV-302 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Marketing → course code MKT 111 | 2026-09-26 |
| EV-303 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Marketing → course code MKT 121 | 2026-09-26 |
| EV-304 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Marketing → course code MKT 203 | 2026-09-26 |
| EV-305 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Marketing → course code MKT 211 | 2026-09-26 |
| EV-306 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Marketing → course code MKT 212 | 2026-09-26 |
| EV-307 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Marketing → course code MKT 213 | 2026-09-26 |
| EV-308 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Marketing → course code MKT 220 | 2026-09-26 |
| EV-309 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Marketing → course code MKT 221 | 2026-09-26 |
| EV-310 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Marketing → course code MKT 222 | 2026-09-26 |
| EV-311 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Marketing → course code MKT 223 | 2026-09-26 |
| EV-312 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Marketing → course code MKT 303 | 2026-09-26 |
| EV-313 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Marketing → course code MKT 304 | 2026-09-26 |
| EV-314 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Marketing → course code MKT 311 | 2026-09-26 |
| EV-315 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Marketing → course code MKT 312 | 2026-09-26 |
| EV-316 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Marketing → course code MKT 313 | 2026-09-26 |
| EV-317 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Marketing → course code MKT 321 | 2026-09-26 |
| EV-318 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Marketing → course code MKT 323 | 2026-09-26 |
| EV-319 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Marketing → course code MKT 324 | 2026-09-26 |
| EV-320 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Marketing → course code MKT 326 | 2026-09-26 |
| EV-321 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Marketing → course code MKT 411 | 2026-09-26 |
| EV-322 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Marketing → course code MKT 412 | 2026-09-26 |
| EV-323 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Marketing → course code MKT 413 | 2026-09-26 |
| EV-324 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Marketing → course code MKT 416 | 2026-09-26 |
| EV-325 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Marketing → course code MKT 421 | 2026-09-26 |
| EV-326 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Marketing → course code MKT 422 | 2026-09-26 |
| EV-327 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Marketing → course code MKT 425 | 2026-09-26 |

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
- `data/career-mapping/_audit/jamb_ccmas_final_gap_verification_rows_081_090_2026-09-26_001.md`
- `data/career-mapping/_audit/jamb_ccmas_final_gap_verification_rows_091_100_2026-09-26_001.md`
- `data/career-mapping/_audit/jamb_ccmas_source_issue_queue_2026-09-26_001.json`
- `data/career-mapping/_audit/jamb_ccmas_source_issue_queue_2026-09-26_001.md`
- `data/career-mapping/_audit/jamb_curriculum_scopes_2026-08-17.json`
- `data/career-mapping/_audit/jamb_anomaly_inventory_2026-09-26.json`
- `data/career-mapping/_audit/jamb_offering_context_inventory_2026-09-25.json`
- `data/career-mapping/_audit/ccmas_extraction_anomaly_inventory_2026-09-26.json`


Closed work intentionally not reopened: French Arts anchor correction; Film and Video Studies Social/Management occurrence addition; recorded CCMAS page-header repairs; CAM424 equipment-spill repair; DTS498/CSC432 cross-reference repair; and replacement-character normalization classified as encoding-only.

## Disposition and resume boundary

This increment reconciles the current **081–100** queue against the prior row-level evidence. It does **not** close any identity: scope evidence, exact offering context, selected-course fidelity, item-level citations, and external/custom provenance remain open where listed. It performs no downstream domain/subgroup/role audit.

The next bounded increment is **identities 101–120**, maximum **20 identities/packages**, and must save its own append-only JSON/Markdown checkpoint before proceeding.

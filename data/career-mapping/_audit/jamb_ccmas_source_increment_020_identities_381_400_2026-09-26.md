# JAMB–CCMAS source increment 020 — identities 381–400

**Audit date:** 2026-09-26 (Africa/Lagos)  
**Mode:** bounded reconciliation after checkpoint 003; append-only  
**Assigned lane:** JAMB identity/offering and CCMAS/external source integrity only  
**Write boundary:** no shared source, mapping, scope, seed, SQL, UI, downstream taxonomy, domain, subgroup, or role file was edited.

## Exact coverage inspected

- Canonical JAMB identities: **20/20**, rows **381–400**.
- Current queue records: **20 identity rows**, **66 current issue records**.
- Current selected-course occurrences represented by those rows: **323**.
- Parsed offering occurrences represented by those rows: **21**.
- CCMAS/external components inspected through the current records: **Allied Health Sciences::Nursing Sciences, Basic Medical Sciences::Physiology, Education::Business Education, Education::Home Economics, Education::Library and Information Science, Education::Primary Education, Education::Technology Education, Engineering::AGRICULTURAL AND BIOSYSTEMS ENGINEERING, Engineering::BIOMEDICAL ENGINEERING, Engineering::CHEMICAL ENGINEERING, Engineering::ELECTRICAL AND ELECTRONIC ENGINEERING, Engineering::ELECTRICAL ENGINEERING, Engineering::ELECTRONIC ENGINEERING, Engineering::MECHANICAL ENGINEERING, Engineering::MECHATRONICS ENGINEERING, Pharmacy and Pharmaceutical Sciences::Bachelor of Pharmacy, __custom__::Sport Science**.
- Prior row-level evidence was read first from the existing final-gap checkpoint(s) for rows **381–400**; already-verified facts were not re-researched.

## Records inspected

| Row | JAMB identity | Component reference(s) | Current scope state | Selected courses | Offering records | Current issue IDs |
|---:|---|---|---|---:|---:|---|
| 381 | Technology Education | Education::Technology Education | full | 0 | 1 | SRC-01150, SRC-01151 |
| 382 | Home Economics and Hotel Management | Education::Home Economics | partial_scope_reviewed | 16 | 1 | SRC-01152, SRC-01153, SRC-01154, SRC-01155 |
| 383 | Teacher Education | Education::Primary Education | partial_scope_reviewed | 12 | 1 | SRC-01156, SRC-01157, SRC-01158, SRC-01159 |
| 384 | Library Science | Education::Library and Information Science | partial_scope_reviewed | 9 | 1 | SRC-01160, SRC-01161, SRC-01162, SRC-01163 |
| 385 | Library and Information Science | Education::Library and Information Science | full | 0 | 1 | SRC-01164, SRC-01165 |
| 386 | Education and Business Administration | Education::Business Education | partial_scope_reviewed | 4 | 1 | SRC-01166, SRC-01167, SRC-01168 |
| 387 | Business Education | Education::Business Education | full | 0 | 1 | SRC-01169, SRC-01170 |
| 388 | Sport Science | __custom__::Sport Science | external_scope_evidenced | 39 | 2 | SRC-01171, SRC-01172, SRC-01173, SRC-01174 |
| 389 | Nursing/Nursing Science | Allied Health Sciences::Nursing Sciences | partial_scope_reviewed | 26 | 1 | SRC-01175, SRC-01176, SRC-01177, SRC-01178 |
| 390 | Pharmacy | Pharmacy and Pharmaceutical Sciences::Bachelor of Pharmacy | partial_scope_reviewed | 52 | 1 | SRC-01179, SRC-01180, SRC-01181, SRC-01182 |
| 391 | Physiology | Basic Medical Sciences::Physiology | partial_scope_reviewed | 19 | 1 | SRC-01183, SRC-01184, SRC-01185, SRC-01186 |
| 392 | Electrical Engineering | Engineering::ELECTRICAL ENGINEERING | partial_scope_reviewed | 15 | 1 | SRC-01187, SRC-01188, SRC-01189, SRC-01190 |
| 393 | Electrical/Electronic Engineering | Engineering::ELECTRICAL AND ELECTRONIC ENGINEERING | partial_scope_reviewed | 12 | 1 | SRC-01191, SRC-01192, SRC-01193 |
| 394 | Electronics Engineering | Engineering::ELECTRONIC ENGINEERING | partial_scope_reviewed | 36 | 1 | SRC-01194, SRC-01195, SRC-01196, SRC-01197 |
| 395 | Mechanical Engineering | Engineering::MECHANICAL ENGINEERING | partial_scope_reviewed | 13 | 1 | SRC-01198, SRC-01199, SRC-01200, SRC-01201 |
| 396 | Chemical Engineering | Engineering::CHEMICAL ENGINEERING | partial_scope_reviewed | 25 | 1 | SRC-01202, SRC-01203, SRC-01204, SRC-01205 |
| 397 | Biomedical Engineering | Engineering::BIOMEDICAL ENGINEERING | partial_scope_reviewed | 13 | 1 | SRC-01206, SRC-01207, SRC-01208 |
| 398 | Mechatronics Engineering | Engineering::MECHATRONICS ENGINEERING | partial_scope_reviewed | 10 | 1 | SRC-01209, SRC-01210, SRC-01211 |
| 399 | Agricultural Engineering | Engineering::AGRICULTURAL AND BIOSYSTEMS ENGINEERING | partial_scope_reviewed | 10 | 1 | SRC-01212, SRC-01213, SRC-01214 |
| 400 | Agricultural and Bio-Resources Engineering | Engineering::AGRICULTURAL AND BIOSYSTEMS ENGINEERING | partial_scope_reviewed | 12 | 1 | SRC-01215, SRC-01216, SRC-01217 |

## Current issue counts

- Confirmed gaps still open: **67**.
- Candidate issues still open: **1**.
- New issue classes discovered in this reconciliation: **0**.
- Closed findings reopened: **0**.
- Distinct exact evidence references captured: **371**.

By issue type/status:

- `external_or_custom_evidence_contract` / `candidate`: 1
- `offering_context_unverified` / `confirmed_gap`: 20
- `scope_evidence_missing` / `confirmed_gap`: 20
- `selected_course_citation_incomplete` / `confirmed_gap`: 17
- `selected_course_content_or_outcome_gap` / `confirmed_gap`: 10

## Confirmed and candidate issue ledger

The following are current open records carried from the source issue queue. They are not claims that every record below is an academic-content defect; provenance, offering-context, and citation gaps remain distinct from content defects.

| Issue | Row | Status | Type | Evidence refs | Recommendation |
|---|---:|---|---|---|---|
| SRC-01150 | 381 | confirmed_gap | scope_evidence_missing | EV-001 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01151 | 381 | confirmed_gap | offering_context_unverified | EV-001 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01152 | 382 | confirmed_gap | scope_evidence_missing | EV-002 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01153 | 382 | confirmed_gap | offering_context_unverified | EV-002 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01154 | 382 | confirmed_gap | selected_course_citation_incomplete | EV-003, EV-004, EV-005, EV-006, EV-007, EV-008, EV-009, EV-010, EV-011, EV-012, EV-013, EV-014, EV-015, EV-016, EV-017, EV-018 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-01155 | 382 | confirmed_gap | selected_course_content_or_outcome_gap | EV-003, EV-004, EV-005, EV-006, EV-007, EV-008, EV-009, EV-010, EV-011, EV-012, EV-013, EV-014, EV-015, EV-016, EV-017, EV-018 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-01156 | 383 | confirmed_gap | scope_evidence_missing | EV-019 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01157 | 383 | confirmed_gap | offering_context_unverified | EV-019 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01158 | 383 | confirmed_gap | selected_course_citation_incomplete | EV-020, EV-021, EV-022, EV-023, EV-024, EV-025, EV-026, EV-027, EV-028, EV-029, EV-030, EV-031 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-01159 | 383 | confirmed_gap | selected_course_content_or_outcome_gap | EV-020, EV-021, EV-022, EV-023, EV-024, EV-025, EV-026, EV-027, EV-028, EV-029, EV-030, EV-031 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-01160 | 384 | confirmed_gap | scope_evidence_missing | EV-032 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01161 | 384 | confirmed_gap | offering_context_unverified | EV-032 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01162 | 384 | confirmed_gap | selected_course_citation_incomplete | EV-033, EV-034, EV-035, EV-036, EV-037, EV-038, EV-039, EV-040, EV-041 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-01163 | 384 | confirmed_gap | selected_course_content_or_outcome_gap | EV-033, EV-034, EV-035, EV-036, EV-037, EV-038, EV-039, EV-040, EV-041 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-01164 | 385 | confirmed_gap | scope_evidence_missing | EV-042 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01165 | 385 | confirmed_gap | offering_context_unverified | EV-042 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01166 | 386 | confirmed_gap | scope_evidence_missing | EV-043 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01167 | 386 | confirmed_gap | offering_context_unverified | EV-043 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01168 | 386 | confirmed_gap | selected_course_citation_incomplete | EV-044, EV-045, EV-046, EV-047 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-01169 | 387 | confirmed_gap | scope_evidence_missing | EV-048 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01170 | 387 | confirmed_gap | offering_context_unverified | EV-048 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01171 | 388 | confirmed_gap | scope_evidence_missing | EV-049, EV-050 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01172 | 388 | confirmed_gap | offering_context_unverified | EV-049, EV-050 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01173 | 388 | confirmed_gap | selected_course_citation_incomplete | EV-051, EV-052, EV-053, EV-054, EV-055, EV-056, EV-057, EV-058, EV-059, EV-060, EV-061, EV-062, EV-063, EV-064, EV-065, EV-066, EV-067, EV-068, EV-069, EV-070, EV-071, EV-072, EV-073, EV-074, EV-075, EV-076, EV-077, EV-078, EV-079, EV-080, EV-081, EV-082, EV-083, EV-084, EV-085, EV-086, EV-087, EV-088, EV-089 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-01174 | 388 | candidate | external_or_custom_evidence_contract | EV-090, EV-091, EV-092, EV-093, EV-094, EV-095, EV-096, EV-097, EV-098, EV-099, EV-100, EV-101, EV-102, EV-103, EV-104, EV-105, EV-106, EV-107, EV-108, EV-109, EV-110, EV-111, EV-112, EV-113, EV-114, EV-115, EV-116, EV-117, EV-118, EV-119, EV-120, EV-121, EV-122, EV-123, EV-124, EV-125, EV-126, EV-127, EV-128 | For every external/custom course, retain an authoritative item-specific URL, locator, access date, provider/programme context, and limits of applicability; do not treat a custom scope as a CCMAS degree anchor. |
| SRC-01175 | 389 | confirmed_gap | scope_evidence_missing | EV-129 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01176 | 389 | confirmed_gap | offering_context_unverified | EV-129 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01177 | 389 | confirmed_gap | selected_course_citation_incomplete | EV-130, EV-131, EV-132, EV-133, EV-134, EV-135, EV-136, EV-137, EV-138, EV-139, EV-140, EV-141, EV-142, EV-143, EV-144, EV-145, EV-146, EV-147, EV-148, EV-149, EV-150, EV-151, EV-152, EV-153, EV-154, EV-155 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-01178 | 389 | confirmed_gap | selected_course_content_or_outcome_gap | EV-130, EV-131, EV-132, EV-133, EV-134, EV-135, EV-136, EV-137, EV-138, EV-139, EV-140, EV-141, EV-142, EV-143, EV-144, EV-145, EV-146, EV-147, EV-148, EV-149, EV-150, EV-151, EV-152, EV-153, EV-154, EV-155 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-01179 | 390 | confirmed_gap | scope_evidence_missing | EV-156 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01180 | 390 | confirmed_gap | offering_context_unverified | EV-156 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01181 | 390 | confirmed_gap | selected_course_citation_incomplete | EV-157, EV-158, EV-159, EV-160, EV-161, EV-162, EV-163, EV-164, EV-165, EV-166, EV-167, EV-168, EV-169, EV-170, EV-171, EV-172, EV-173, EV-174, EV-175, EV-176, EV-177, EV-178, EV-179, EV-180, EV-181, EV-182, EV-183, EV-184, EV-185, EV-186, EV-187, EV-188, EV-189, EV-190, EV-191, EV-192, EV-193, EV-194, EV-195, EV-196, EV-197, EV-198, EV-199, EV-200, EV-201, EV-202, EV-203, EV-204, EV-205, EV-206, EV-207, EV-208 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-01182 | 390 | confirmed_gap | selected_course_content_or_outcome_gap | EV-157, EV-158, EV-159, EV-160, EV-161, EV-162, EV-163, EV-164, EV-165, EV-166, EV-167, EV-168, EV-169, EV-170, EV-171, EV-172, EV-173, EV-174, EV-175, EV-176, EV-177, EV-178, EV-179, EV-180, EV-181, EV-182, EV-183, EV-184, EV-185, EV-186, EV-187, EV-188, EV-189, EV-190, EV-191, EV-192, EV-193, EV-194, EV-195, EV-196, EV-197, EV-198, EV-199, EV-200, EV-201, EV-202, EV-203, EV-204, EV-205, EV-206, EV-207, EV-208 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-01183 | 391 | confirmed_gap | scope_evidence_missing | EV-209 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01184 | 391 | confirmed_gap | offering_context_unverified | EV-209 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01185 | 391 | confirmed_gap | selected_course_citation_incomplete | EV-210, EV-211, EV-212, EV-213, EV-214, EV-215, EV-216, EV-217, EV-218, EV-219, EV-220, EV-221, EV-222, EV-223, EV-224, EV-225, EV-226 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-01186 | 391 | confirmed_gap | selected_course_content_or_outcome_gap | EV-210, EV-211, EV-212, EV-213, EV-214, EV-215, EV-216, EV-217, EV-218, EV-219, EV-220, EV-221, EV-222, EV-223, EV-224, EV-225, EV-226 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-01187 | 392 | confirmed_gap | scope_evidence_missing | EV-227 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01188 | 392 | confirmed_gap | offering_context_unverified | EV-227 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01189 | 392 | confirmed_gap | selected_course_citation_incomplete | EV-228, EV-229, EV-230, EV-231, EV-232, EV-233, EV-234, EV-235, EV-236, EV-237, EV-238, EV-239, EV-240, EV-241, EV-242 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-01190 | 392 | confirmed_gap | selected_course_content_or_outcome_gap | EV-228, EV-229, EV-230, EV-231, EV-232, EV-233, EV-234, EV-235, EV-236, EV-237, EV-238, EV-239, EV-240, EV-241, EV-242 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-01191 | 393 | confirmed_gap | scope_evidence_missing | EV-243 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01192 | 393 | confirmed_gap | offering_context_unverified | EV-243 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01193 | 393 | confirmed_gap | selected_course_citation_incomplete | EV-244, EV-245, EV-246, EV-247, EV-248, EV-249, EV-250, EV-251, EV-252, EV-253, EV-254, EV-255 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-01194 | 394 | confirmed_gap | scope_evidence_missing | EV-256 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01195 | 394 | confirmed_gap | offering_context_unverified | EV-256 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01196 | 394 | confirmed_gap | selected_course_citation_incomplete | EV-257, EV-258, EV-259, EV-260, EV-261, EV-262, EV-263, EV-264, EV-265, EV-266, EV-267, EV-268, EV-269, EV-270, EV-271, EV-272, EV-273, EV-274, EV-275, EV-276, EV-277, EV-278, EV-279, EV-280, EV-281, EV-282, EV-283, EV-284, EV-285, EV-286, EV-287, EV-288, EV-289, EV-290, EV-291, EV-292 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-01197 | 394 | confirmed_gap | selected_course_content_or_outcome_gap | EV-257, EV-258, EV-259, EV-260, EV-261, EV-262, EV-263, EV-264, EV-265, EV-266, EV-267, EV-268, EV-269, EV-270, EV-271, EV-272, EV-273, EV-274, EV-275, EV-276, EV-277, EV-278, EV-279, EV-280, EV-281, EV-282, EV-283, EV-284, EV-285, EV-286, EV-287, EV-288, EV-289, EV-290, EV-291, EV-292 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-01198 | 395 | confirmed_gap | scope_evidence_missing | EV-293 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01199 | 395 | confirmed_gap | offering_context_unverified | EV-293 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01200 | 395 | confirmed_gap | selected_course_citation_incomplete | EV-294, EV-295, EV-296, EV-297, EV-298, EV-299, EV-300, EV-301, EV-302, EV-303, EV-304, EV-305, EV-306 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-01201 | 395 | confirmed_gap | selected_course_content_or_outcome_gap | EV-294, EV-295, EV-296, EV-297, EV-298, EV-299, EV-300, EV-301, EV-302, EV-303, EV-304, EV-305, EV-306 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-01202 | 396 | confirmed_gap | scope_evidence_missing | EV-307 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01203 | 396 | confirmed_gap | offering_context_unverified | EV-307 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01204 | 396 | confirmed_gap | selected_course_citation_incomplete | EV-308, EV-309, EV-310, EV-311, EV-312, EV-313, EV-314, EV-315, EV-316, EV-317, EV-318, EV-319, EV-320, EV-321, EV-322, EV-323, EV-324, EV-325, EV-326, EV-327, EV-328, EV-329, EV-330, EV-331, EV-332 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-01205 | 396 | confirmed_gap | selected_course_content_or_outcome_gap | EV-308, EV-309, EV-310, EV-311, EV-312, EV-313, EV-314, EV-315, EV-316, EV-317, EV-318, EV-319, EV-320, EV-321, EV-322, EV-323, EV-324, EV-325, EV-326, EV-327, EV-328, EV-329, EV-330, EV-331, EV-332 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-01206 | 397 | confirmed_gap | scope_evidence_missing | EV-333 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01207 | 397 | confirmed_gap | offering_context_unverified | EV-333 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01208 | 397 | confirmed_gap | selected_course_citation_incomplete | EV-334, EV-335, EV-336, EV-337, EV-338, EV-339, EV-340, EV-341, EV-342, EV-343, EV-344, EV-345, EV-346 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-01209 | 398 | confirmed_gap | scope_evidence_missing | EV-347 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01210 | 398 | confirmed_gap | offering_context_unverified | EV-347 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01211 | 398 | confirmed_gap | selected_course_citation_incomplete | EV-348, EV-349, EV-350, EV-351, EV-352, EV-353, EV-354, EV-355, EV-356, EV-357 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-01212 | 399 | confirmed_gap | scope_evidence_missing | EV-358 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01213 | 399 | confirmed_gap | offering_context_unverified | EV-358 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01214 | 399 | confirmed_gap | selected_course_citation_incomplete | EV-359, EV-360, EV-361, EV-362, EV-363, EV-364, EV-365, EV-366, EV-367, EV-368 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-01215 | 400 | confirmed_gap | scope_evidence_missing | EV-369 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01216 | 400 | confirmed_gap | offering_context_unverified | EV-369 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01217 | 400 | confirmed_gap | selected_course_citation_incomplete | EV-359, EV-360, EV-361, EV-362, EV-363, EV-364, EV-365, EV-366, EV-367, EV-368, EV-370, EV-371 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |

## Exact evidence URLs, locators, and access dates

### Structured evidence references attached to issue records

| Ref | URL | Exact locator | Accessed |
|---|---|---|---|
| EV-001 | none | education.txt → parsed row ordinal 2 → Technology Education | 2026-09-26 |
| EV-002 | none | education.txt → parsed row ordinal 3 → Home Economics and Hotel Management | 2026-09-26 |
| EV-003 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf | education.json → Home Economics → course code EHO 101 | 2026-09-26 |
| EV-004 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf | education.json → Home Economics → course code EHO 103 | 2026-09-26 |
| EV-005 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf | education.json → Home Economics → course code EHO 107 | 2026-09-26 |
| EV-006 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf | education.json → Home Economics → course code EHO 212 | 2026-09-26 |
| EV-007 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf | education.json → Home Economics → course code EHO 214 | 2026-09-26 |
| EV-008 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf | education.json → Home Economics → course code EHO 217 | 2026-09-26 |
| EV-009 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf | education.json → Home Economics → course code GST 312 | 2026-09-26 |
| EV-010 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf | education.json → Home Economics → course code ENT 312 | 2026-09-26 |
| EV-011 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf | education.json → Home Economics → course code EHO 311 | 2026-09-26 |
| EV-012 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf | education.json → Home Economics → course code EHO 313 | 2026-09-26 |
| EV-013 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf | education.json → Home Economics → course code EHO 315 | 2026-09-26 |
| EV-014 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf | education.json → Home Economics → course code EHO 317 | 2026-09-26 |
| EV-015 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf | education.json → Home Economics → course code EHO 318 | 2026-09-26 |
| EV-016 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf | education.json → Home Economics → course code EHO 401 | 2026-09-26 |
| EV-017 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf | education.json → Home Economics → course code EHO 402 | 2026-09-26 |
| EV-018 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf | education.json → Home Economics → course code EHO 405 | 2026-09-26 |
| EV-019 | none | education.txt → parsed row ordinal 4 → Teacher Education | 2026-09-26 |
| EV-020 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf | education.json → Primary Education → course code PED 113 | 2026-09-26 |
| EV-021 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf | education.json → Primary Education → course code PED 114 | 2026-09-26 |
| EV-022 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf | education.json → Primary Education → course code PED 212 | 2026-09-26 |
| EV-023 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf | education.json → Primary Education → course code PED 213 | 2026-09-26 |
| EV-024 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf | education.json → Primary Education → course code PED 214 | 2026-09-26 |
| EV-025 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf | education.json → Primary Education → course code EDU 301 | 2026-09-26 |
| EV-026 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf | education.json → Primary Education → course code PED 312 | 2026-09-26 |
| EV-027 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf | education.json → Primary Education → course code PED 313 | 2026-09-26 |
| EV-028 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf | education.json → Primary Education → course code EDU 401 | 2026-09-26 |
| EV-029 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf | education.json → Primary Education → course code EDU 400 | 2026-09-26 |
| EV-030 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf | education.json → Primary Education → course code PED 412 | 2026-09-26 |
| EV-031 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf | education.json → Primary Education → course code PED 414 | 2026-09-26 |
| EV-032 | none | education.txt → parsed row ordinal 5 → Library Science | 2026-09-26 |
| EV-033 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf | education.json → Library and Information Science → course code LIS 111 | 2026-09-26 |
| EV-034 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf | education.json → Library and Information Science → course code LIS 114 | 2026-09-26 |
| EV-035 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf | education.json → Library and Information Science → course code LIS 125 | 2026-09-26 |
| EV-036 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf | education.json → Library and Information Science → course code LIS 215 | 2026-09-26 |
| EV-037 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf | education.json → Library and Information Science → course code LIS 216 | 2026-09-26 |
| EV-038 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf | education.json → Library and Information Science → course code LIS 311 | 2026-09-26 |
| EV-039 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf | education.json → Library and Information Science → course code LIS 312 | 2026-09-26 |
| EV-040 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf | education.json → Library and Information Science → course code LIS 416 | 2026-09-26 |
| EV-041 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf | education.json → Library and Information Science → course code LIS 421 | 2026-09-26 |
| EV-042 | none | education.txt → parsed row ordinal 6 → Library and Information Science | 2026-09-26 |
| EV-043 | none | education.txt → parsed row ordinal 7 → Education and Business Administration | 2026-09-26 |
| EV-044 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf | education.json → Business Education → course code GST 112 | 2026-09-26 |
| EV-045 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf | education.json → Business Education → course code BED 121 | 2026-09-26 |
| EV-046 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf | education.json → Business Education → course code BED 415 | 2026-09-26 |
| EV-047 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf | education.json → Business Education → course code BED 426 | 2026-09-26 |
| EV-048 | none | education.txt → parsed row ordinal 8 → Business Education | 2026-09-26 |
| EV-049 | none | education.txt → parsed row ordinal 9 → Sport Science | 2026-09-26 |
| EV-050 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 172 → Sport Science | 2026-09-26 |
| EV-051 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code HKS 112 | 2026-09-26 |
| EV-052 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code HKS 113 | 2026-09-26 |
| EV-053 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code HKS 114 | 2026-09-26 |
| EV-054 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code HKS 116 | 2026-09-26 |
| EV-055 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code HKS 120 | 2026-09-26 |
| EV-056 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code HKS 131 | 2026-09-26 |
| EV-057 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code HKS 142 | 2026-09-26 |
| EV-058 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code HKS 211 | 2026-09-26 |
| EV-059 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code HKS 212 | 2026-09-26 |
| EV-060 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code HKS 218 | 2026-09-26 |
| EV-061 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code HKS 222 | 2026-09-26 |
| EV-062 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code HKS 223 | 2026-09-26 |
| EV-063 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code HKS 231 | 2026-09-26 |
| EV-064 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code HKS 232 | 2026-09-26 |
| EV-065 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code HKS 234 | 2026-09-26 |
| EV-066 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code HKS 236 | 2026-09-26 |
| EV-067 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code HKS 243 | 2026-09-26 |
| EV-068 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code HKS 244 | 2026-09-26 |
| EV-069 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code HKS 245 | 2026-09-26 |
| EV-070 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code HKS 313 | 2026-09-26 |
| EV-071 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code HKS 331 | 2026-09-26 |
| EV-072 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code HKS 332 | 2026-09-26 |
| EV-073 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code HKS 334 | 2026-09-26 |
| EV-074 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code HKS 336 | 2026-09-26 |
| EV-075 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code HKS 341 | 2026-09-26 |
| EV-076 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code HKS 342 | 2026-09-26 |
| EV-077 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code HKS 343 | 2026-09-26 |
| EV-078 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code HKS 344 | 2026-09-26 |
| EV-079 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code HKS 345 | 2026-09-26 |
| EV-080 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code HKS 346 | 2026-09-26 |
| EV-081 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code HKS 411 | 2026-09-26 |
| EV-082 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code HKS 413 | 2026-09-26 |
| EV-083 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code HKS 415 | 2026-09-26 |
| EV-084 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code HKS 431 | 2026-09-26 |
| EV-085 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code HKS 440 | 2026-09-26 |
| EV-086 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code HKS 442 | 2026-09-26 |
| EV-087 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code HKS 445 | 2026-09-26 |
| EV-088 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code HKS 447 | 2026-09-26 |
| EV-089 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code HKS 451 | 2026-09-26 |
| EV-090 | none | external/custom course HKS 112 — Basic Skills of Swimming and Water Safety | 2026-09-26 |
| EV-091 | none | external/custom course HKS 113 — Skills and Techniques of Track and Field Athletics | 2026-09-26 |
| EV-092 | none | external/custom course HKS 114 — Skills and Techniques Development in Team Sports | 2026-09-26 |
| EV-093 | none | external/custom course HKS 116 — Movement Education and Creative Dance | 2026-09-26 |
| EV-094 | none | external/custom course HKS 120 — Philosophical and Historical Foundations of Human Kinetics and Sports Studies | 2026-09-26 |
| EV-095 | none | external/custom course HKS 131 — Weight Training and Physical Fitness | 2026-09-26 |
| EV-096 | none | external/custom course HKS 142 — Introduction to Sports Journalism | 2026-09-26 |
| EV-097 | none | external/custom course HKS 211 — Skills and Techniques Development in Team Sports II | 2026-09-26 |
| EV-098 | none | external/custom course HKS 212 — Skills and Techniques Development in Racquet Games | 2026-09-26 |
| EV-099 | none | external/custom course HKS 218 — Gymnastics | 2026-09-26 |
| EV-100 | none | external/custom course HKS 222 — Sociological Basis of Human Kinetics and Sports Studies | 2026-09-26 |
| EV-101 | none | external/custom course HKS 223 — Principles of Recreation, Outdoor Pursuits and Tourism | 2026-09-26 |
| EV-102 | none | external/custom course HKS 231 — Human Anatomy and Physiology | 2026-09-26 |
| EV-103 | none | external/custom course HKS 232 — Motor Learning and Human Performance | 2026-09-26 |
| EV-104 | none | external/custom course HKS 234 — Psychology of Sports | 2026-09-26 |
| EV-105 | none | external/custom course HKS 236 — Principles and Methods of Exercise Prescription for Diverse Population | 2026-09-26 |
| EV-106 | none | external/custom course HKS 243 — Curriculum Planning in Human Kinetics and Sports Programmes | 2026-09-26 |
| EV-107 | none | external/custom course HKS 244 — Adapted Physical Education | 2026-09-26 |
| EV-108 | none | external/custom course HKS 245 — Methods and Resources for Conduct of Human Kinetics Programme in Schools | 2026-09-26 |
| EV-109 | none | external/custom course HKS 313 — Practical Sports Coaching, Officiating and Game Analysis | 2026-09-26 |
| EV-110 | none | external/custom course HKS 331 — Principles of Athletic and Fitness Conditioning | 2026-09-26 |
| EV-111 | none | external/custom course HKS 332 — Physiology of Human Activity and Biomechanics | 2026-09-26 |
| EV-112 | none | external/custom course HKS 334 — Scientific and Psychological Basis of Sports Coaching | 2026-09-26 |
| EV-113 | none | external/custom course HKS 336 — Statistical Application in Human Kinetics and Sports Studies | 2026-09-26 |
| EV-114 | none | external/custom course HKS 341 — Research Methods in Human Kinetics and Sports Studies | 2026-09-26 |
| EV-115 | none | external/custom course HKS 342 — Administration of Community Recreation and Tourism | 2026-09-26 |
| EV-116 | none | external/custom course HKS 343 — Practicum in Human Kinetics and Sports Studies | 2026-09-26 |
| EV-117 | none | external/custom course HKS 344 — Measurements and Evaluation of Human Performance Efficiency | 2026-09-26 |
| EV-118 | none | external/custom course HKS 345 — Planning and Management of Intramural and Interscholastic Sports Programme | 2026-09-26 |
| EV-119 | none | external/custom course HKS 346 — Common Sports Injuries, First Aid Care and Safety Education | 2026-09-26 |
| EV-120 | none | external/custom course HKS 411 — Practical Sports Coaching, Officiating and Game Analysis II | 2026-09-26 |
| EV-121 | none | external/custom course HKS 413 — ICT Utilization for Data Organization and Presentation in Human Kinetics and Sports Studies | 2026-09-26 |
| EV-122 | none | external/custom course HKS 415 — Kinesiology of Sports and Human Movement | 2026-09-26 |
| EV-123 | none | external/custom course HKS 431 — Nutrition and Ergogenic Aids in Sports | 2026-09-26 |
| EV-124 | none | external/custom course HKS 440 — Planning and Administration of Competitive Sports | 2026-09-26 |
| EV-125 | none | external/custom course HKS 442 — Supervision in Human Kinetic and Sports Programme | 2026-09-26 |
| EV-126 | none | external/custom course HKS 445 — Sports Law and Ethics | 2026-09-26 |
| EV-127 | none | external/custom course HKS 447 — Sports Marketing and Sponsorship | 2026-09-26 |
| EV-128 | none | external/custom course HKS 451 — Seminar in Human Kinetics and Sports Studies | 2026-09-26 |
| EV-129 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-medical.pdf | medical.txt → parsed row ordinal 13 → Nursing/Nursing Science | 2026-09-26 |
| EV-130 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf | allied_health.json → Nursing Sciences → course code NSC 201 | 2026-09-26 |
| EV-131 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf | allied_health.json → Nursing Sciences → course code NSC 202 | 2026-09-26 |
| EV-132 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf | allied_health.json → Nursing Sciences → course code NSC 303 | 2026-09-26 |
| EV-133 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf | allied_health.json → Nursing Sciences → course code NSC 309 | 2026-09-26 |
| EV-134 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf | allied_health.json → Nursing Sciences → course code NSC 313 | 2026-09-26 |
| EV-135 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf | allied_health.json → Nursing Sciences → course code NSC 302 | 2026-09-26 |
| EV-136 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf | allied_health.json → Nursing Sciences → course code NSC 306 | 2026-09-26 |
| EV-137 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf | allied_health.json → Nursing Sciences → course code NSC 308 | 2026-09-26 |
| EV-138 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf | allied_health.json → Nursing Sciences → course code NSC 312 | 2026-09-26 |
| EV-139 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf | allied_health.json → Nursing Sciences → course code NSC 314 | 2026-09-26 |
| EV-140 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf | allied_health.json → Nursing Sciences → course code NSC 403 | 2026-09-26 |
| EV-141 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf | allied_health.json → Nursing Sciences → course code NSC 405 | 2026-09-26 |
| EV-142 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf | allied_health.json → Nursing Sciences → course code NSC 409 | 2026-09-26 |
| EV-143 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf | allied_health.json → Nursing Sciences → course code NSC 411 | 2026-09-26 |
| EV-144 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf | allied_health.json → Nursing Sciences → course code NSC 402 | 2026-09-26 |
| EV-145 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf | allied_health.json → Nursing Sciences → course code NSC 404 | 2026-09-26 |
| EV-146 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf | allied_health.json → Nursing Sciences → course code NSC 406 | 2026-09-26 |
| EV-147 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf | allied_health.json → Nursing Sciences → course code NSC 410 | 2026-09-26 |
| EV-148 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf | allied_health.json → Nursing Sciences → course code NSC 501 | 2026-09-26 |
| EV-149 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf | allied_health.json → Nursing Sciences → course code NSC 503 | 2026-09-26 |
| EV-150 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf | allied_health.json → Nursing Sciences → course code NSC 505 | 2026-09-26 |
| EV-151 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf | allied_health.json → Nursing Sciences → course code NSC 509 | 2026-09-26 |
| EV-152 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf | allied_health.json → Nursing Sciences → course code NSC 511 | 2026-09-26 |
| EV-153 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf | allied_health.json → Nursing Sciences → course code NSC 513 | 2026-09-26 |
| EV-154 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf | allied_health.json → Nursing Sciences → course code NSC 502 | 2026-09-26 |
| EV-155 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf | allied_health.json → Nursing Sciences → course code NSC 508 | 2026-09-26 |
| EV-156 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-medical.pdf | medical.txt → parsed row ordinal 15 → Pharmacy | 2026-09-26 |
| EV-157 | https://www.nuc.edu.ng/ccmas/ | pharmacy.json → Bachelor of Pharmacy → course code PCY 101 | 2026-09-26 |
| EV-158 | https://www.nuc.edu.ng/ccmas/ | pharmacy.json → Bachelor of Pharmacy → course code ICT 201 | 2026-09-26 |
| EV-159 | https://www.nuc.edu.ng/ccmas/ | pharmacy.json → Bachelor of Pharmacy → course code PCG 201 | 2026-09-26 |
| EV-160 | https://www.nuc.edu.ng/ccmas/ | pharmacy.json → Bachelor of Pharmacy → course code PCG 202 | 2026-09-26 |
| EV-161 | https://www.nuc.edu.ng/ccmas/ | pharmacy.json → Bachelor of Pharmacy → course code PCH 201 | 2026-09-26 |
| EV-162 | https://www.nuc.edu.ng/ccmas/ | pharmacy.json → Bachelor of Pharmacy → course code PCH 202 | 2026-09-26 |
| EV-163 | https://www.nuc.edu.ng/ccmas/ | pharmacy.json → Bachelor of Pharmacy → course code PCH 203 | 2026-09-26 |
| EV-164 | https://www.nuc.edu.ng/ccmas/ | pharmacy.json → Bachelor of Pharmacy → course code PCT 201 | 2026-09-26 |
| EV-165 | https://www.nuc.edu.ng/ccmas/ | pharmacy.json → Bachelor of Pharmacy → course code PCT 204 | 2026-09-26 |
| EV-166 | https://www.nuc.edu.ng/ccmas/ | pharmacy.json → Bachelor of Pharmacy → course code PHM 201 | 2026-09-26 |
| EV-167 | https://www.nuc.edu.ng/ccmas/ | pharmacy.json → Bachelor of Pharmacy → course code PAA 399 | 2026-09-26 |
| EV-168 | https://www.nuc.edu.ng/ccmas/ | pharmacy.json → Bachelor of Pharmacy → course code PCG 301 | 2026-09-26 |
| EV-169 | https://www.nuc.edu.ng/ccmas/ | pharmacy.json → Bachelor of Pharmacy → course code PCG 302 | 2026-09-26 |
| EV-170 | https://www.nuc.edu.ng/ccmas/ | pharmacy.json → Bachelor of Pharmacy → course code PCH 301 | 2026-09-26 |
| EV-171 | https://www.nuc.edu.ng/ccmas/ | pharmacy.json → Bachelor of Pharmacy → course code PCH 302 | 2026-09-26 |
| EV-172 | https://www.nuc.edu.ng/ccmas/ | pharmacy.json → Bachelor of Pharmacy → course code PCT 301 | 2026-09-26 |
| EV-173 | https://www.nuc.edu.ng/ccmas/ | pharmacy.json → Bachelor of Pharmacy → course code PCT 303 | 2026-09-26 |
| EV-174 | https://www.nuc.edu.ng/ccmas/ | pharmacy.json → Bachelor of Pharmacy → course code PCT 304 | 2026-09-26 |
| EV-175 | https://www.nuc.edu.ng/ccmas/ | pharmacy.json → Bachelor of Pharmacy → course code PHA 301 | 2026-09-26 |
| EV-176 | https://www.nuc.edu.ng/ccmas/ | pharmacy.json → Bachelor of Pharmacy → course code PHA 302 | 2026-09-26 |
| EV-177 | https://www.nuc.edu.ng/ccmas/ | pharmacy.json → Bachelor of Pharmacy → course code PHA 304 | 2026-09-26 |
| EV-178 | https://www.nuc.edu.ng/ccmas/ | pharmacy.json → Bachelor of Pharmacy → course code PHM 301 | 2026-09-26 |
| EV-179 | https://www.nuc.edu.ng/ccmas/ | pharmacy.json → Bachelor of Pharmacy → course code SAP 301 | 2026-09-26 |
| EV-180 | https://www.nuc.edu.ng/ccmas/ | pharmacy.json → Bachelor of Pharmacy → course code PAA 499 | 2026-09-26 |
| EV-181 | https://www.nuc.edu.ng/ccmas/ | pharmacy.json → Bachelor of Pharmacy → course code CLI 401 | 2026-09-26 |
| EV-182 | https://www.nuc.edu.ng/ccmas/ | pharmacy.json → Bachelor of Pharmacy → course code CLI 402 | 2026-09-26 |
| EV-183 | https://www.nuc.edu.ng/ccmas/ | pharmacy.json → Bachelor of Pharmacy → course code ICT 401 | 2026-09-26 |
| EV-184 | https://www.nuc.edu.ng/ccmas/ | pharmacy.json → Bachelor of Pharmacy → course code PCG 401 | 2026-09-26 |
| EV-185 | https://www.nuc.edu.ng/ccmas/ | pharmacy.json → Bachelor of Pharmacy → course code PCG 402 | 2026-09-26 |
| EV-186 | https://www.nuc.edu.ng/ccmas/ | pharmacy.json → Bachelor of Pharmacy → course code PCH 401 | 2026-09-26 |
| EV-187 | https://www.nuc.edu.ng/ccmas/ | pharmacy.json → Bachelor of Pharmacy → course code PCH 402 | 2026-09-26 |
| EV-188 | https://www.nuc.edu.ng/ccmas/ | pharmacy.json → Bachelor of Pharmacy → course code PCT 401 | 2026-09-26 |
| EV-189 | https://www.nuc.edu.ng/ccmas/ | pharmacy.json → Bachelor of Pharmacy → course code PCT 402 | 2026-09-26 |
| EV-190 | https://www.nuc.edu.ng/ccmas/ | pharmacy.json → Bachelor of Pharmacy → course code PCT 403 | 2026-09-26 |
| EV-191 | https://www.nuc.edu.ng/ccmas/ | pharmacy.json → Bachelor of Pharmacy → course code PHA 401 | 2026-09-26 |
| EV-192 | https://www.nuc.edu.ng/ccmas/ | pharmacy.json → Bachelor of Pharmacy → course code PHA 402 | 2026-09-26 |
| EV-193 | https://www.nuc.edu.ng/ccmas/ | pharmacy.json → Bachelor of Pharmacy → course code PHM 401 | 2026-09-26 |
| EV-194 | https://www.nuc.edu.ng/ccmas/ | pharmacy.json → Bachelor of Pharmacy → course code SAP 401 | 2026-09-26 |
| EV-195 | https://www.nuc.edu.ng/ccmas/ | pharmacy.json → Bachelor of Pharmacy → course code SAP 402 | 2026-09-26 |
| EV-196 | https://www.nuc.edu.ng/ccmas/ | pharmacy.json → Bachelor of Pharmacy → course code PAA 501 | 2026-09-26 |
| EV-197 | https://www.nuc.edu.ng/ccmas/ | pharmacy.json → Bachelor of Pharmacy → course code CLI 501 | 2026-09-26 |
| EV-198 | https://www.nuc.edu.ng/ccmas/ | pharmacy.json → Bachelor of Pharmacy → course code CLI 502 | 2026-09-26 |
| EV-199 | https://www.nuc.edu.ng/ccmas/ | pharmacy.json → Bachelor of Pharmacy → course code CLI 503 | 2026-09-26 |
| EV-200 | https://www.nuc.edu.ng/ccmas/ | pharmacy.json → Bachelor of Pharmacy → course code CLI 504 | 2026-09-26 |
| EV-201 | https://www.nuc.edu.ng/ccmas/ | pharmacy.json → Bachelor of Pharmacy → course code CLI 505 | 2026-09-26 |
| EV-202 | https://www.nuc.edu.ng/ccmas/ | pharmacy.json → Bachelor of Pharmacy → course code PCG 501 | 2026-09-26 |
| EV-203 | https://www.nuc.edu.ng/ccmas/ | pharmacy.json → Bachelor of Pharmacy → course code PCG 502 | 2026-09-26 |
| EV-204 | https://www.nuc.edu.ng/ccmas/ | pharmacy.json → Bachelor of Pharmacy → course code PCH 501 | 2026-09-26 |
| EV-205 | https://www.nuc.edu.ng/ccmas/ | pharmacy.json → Bachelor of Pharmacy → course code PCH 503 | 2026-09-26 |
| EV-206 | https://www.nuc.edu.ng/ccmas/ | pharmacy.json → Bachelor of Pharmacy → course code PCT 501 | 2026-09-26 |
| EV-207 | https://www.nuc.edu.ng/ccmas/ | pharmacy.json → Bachelor of Pharmacy → course code PHM 501 | 2026-09-26 |
| EV-208 | https://www.nuc.edu.ng/ccmas/ | pharmacy.json → Bachelor of Pharmacy → course code SAP 502 | 2026-09-26 |
| EV-209 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-medical.pdf | medical.txt → parsed row ordinal 16 → Physiology | 2026-09-26 |
| EV-210 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Basic-Medical-Sciences-CCMAS-FINAL-December-26-2022.pdf | basic_medical.json → Physiology → course code BIO 102 | 2026-09-26 |
| EV-211 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Basic-Medical-Sciences-CCMAS-FINAL-December-26-2022.pdf | basic_medical.json → Physiology → course code BIO 108 | 2026-09-26 |
| EV-212 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Basic-Medical-Sciences-CCMAS-FINAL-December-26-2022.pdf | basic_medical.json → Physiology → course code PIO 201 | 2026-09-26 |
| EV-213 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Basic-Medical-Sciences-CCMAS-FINAL-December-26-2022.pdf | basic_medical.json → Physiology → course code PIO 203 | 2026-09-26 |
| EV-214 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Basic-Medical-Sciences-CCMAS-FINAL-December-26-2022.pdf | basic_medical.json → Physiology → course code PIO 212 | 2026-09-26 |
| EV-215 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Basic-Medical-Sciences-CCMAS-FINAL-December-26-2022.pdf | basic_medical.json → Physiology → course code PIO 214 | 2026-09-26 |
| EV-216 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Basic-Medical-Sciences-CCMAS-FINAL-December-26-2022.pdf | basic_medical.json → Physiology → course code PIO 216 | 2026-09-26 |
| EV-217 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Basic-Medical-Sciences-CCMAS-FINAL-December-26-2022.pdf | basic_medical.json → Physiology → course code BCH 201 | 2026-09-26 |
| EV-218 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Basic-Medical-Sciences-CCMAS-FINAL-December-26-2022.pdf | basic_medical.json → Physiology → course code BIO 208 | 2026-09-26 |
| EV-219 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Basic-Medical-Sciences-CCMAS-FINAL-December-26-2022.pdf | basic_medical.json → Physiology → course code PIO 301 | 2026-09-26 |
| EV-220 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Basic-Medical-Sciences-CCMAS-FINAL-December-26-2022.pdf | basic_medical.json → Physiology → course code PIO 305 | 2026-09-26 |
| EV-221 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Basic-Medical-Sciences-CCMAS-FINAL-December-26-2022.pdf | basic_medical.json → Physiology → course code PIO 307 | 2026-09-26 |
| EV-222 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Basic-Medical-Sciences-CCMAS-FINAL-December-26-2022.pdf | basic_medical.json → Physiology → course code PIO 309 | 2026-09-26 |
| EV-223 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Basic-Medical-Sciences-CCMAS-FINAL-December-26-2022.pdf | basic_medical.json → Physiology → course code PIO 302 | 2026-09-26 |
| EV-224 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Basic-Medical-Sciences-CCMAS-FINAL-December-26-2022.pdf | basic_medical.json → Physiology → course code PIO 401 | 2026-09-26 |
| EV-225 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Basic-Medical-Sciences-CCMAS-FINAL-December-26-2022.pdf | basic_medical.json → Physiology → course code PIO 414 | 2026-09-26 |
| EV-226 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Basic-Medical-Sciences-CCMAS-FINAL-December-26-2022.pdf | basic_medical.json → Physiology → course code PIO 416 | 2026-09-26 |
| EV-227 | none | engineering.txt → parsed row ordinal 25 → Electrical Engineering | 2026-09-26 |
| EV-228 | https://www.nuc.edu.ng/ccmas/ | engineering.json → ELECTRICAL ENGINEERING → course code PHY 107 | 2026-09-26 |
| EV-229 | https://www.nuc.edu.ng/ccmas/ | engineering.json → ELECTRICAL ENGINEERING → course code TEL 100 | 2026-09-26 |
| EV-230 | https://www.nuc.edu.ng/ccmas/ | engineering.json → ELECTRICAL ENGINEERING → course code GET 204 | 2026-09-26 |
| EV-231 | https://www.nuc.edu.ng/ccmas/ | engineering.json → ELECTRICAL ENGINEERING → course code TEL 202 | 2026-09-26 |
| EV-232 | https://www.nuc.edu.ng/ccmas/ | engineering.json → ELECTRICAL ENGINEERING → course code EEE 208 | 2026-09-26 |
| EV-233 | https://www.nuc.edu.ng/ccmas/ | engineering.json → ELECTRICAL ENGINEERING → course code EEE 321 | 2026-09-26 |
| EV-234 | https://www.nuc.edu.ng/ccmas/ | engineering.json → ELECTRICAL ENGINEERING → course code TEL 303 | 2026-09-26 |
| EV-235 | https://www.nuc.edu.ng/ccmas/ | engineering.json → ELECTRICAL ENGINEERING → course code TEL 305 | 2026-09-26 |
| EV-236 | https://www.nuc.edu.ng/ccmas/ | engineering.json → ELECTRICAL ENGINEERING → course code TEL 322 | 2026-09-26 |
| EV-237 | https://www.nuc.edu.ng/ccmas/ | engineering.json → ELECTRICAL ENGINEERING → course code TEL 423 | 2026-09-26 |
| EV-238 | https://www.nuc.edu.ng/ccmas/ | engineering.json → ELECTRICAL ENGINEERING → course code TEL 401 | 2026-09-26 |
| EV-239 | https://www.nuc.edu.ng/ccmas/ | engineering.json → ELECTRICAL ENGINEERING → course code TEL 402 | 2026-09-26 |
| EV-240 | https://www.nuc.edu.ng/ccmas/ | engineering.json → ELECTRICAL ENGINEERING → course code TEL 502 | 2026-09-26 |
| EV-241 | https://www.nuc.edu.ng/ccmas/ | engineering.json → ELECTRICAL ENGINEERING → course code TEL 507 | 2026-09-26 |
| EV-242 | https://www.nuc.edu.ng/ccmas/ | engineering.json → ELECTRICAL ENGINEERING → course code TEL 503 | 2026-09-26 |
| EV-243 | none | engineering.txt → parsed row ordinal 34 → Electrical/Electronic Engineering | 2026-09-26 |
| EV-244 | https://www.nuc.edu.ng/ccmas/ | engineering.json → ELECTRICAL AND ELECTRONIC ENGINEERING → course code CHM 101 | 2026-09-26 |
| EV-245 | https://www.nuc.edu.ng/ccmas/ | engineering.json → ELECTRICAL AND ELECTRONIC ENGINEERING → course code CHM 102 | 2026-09-26 |
| EV-246 | https://www.nuc.edu.ng/ccmas/ | engineering.json → ELECTRICAL AND ELECTRONIC ENGINEERING → course code PHY 107 | 2026-09-26 |
| EV-247 | https://www.nuc.edu.ng/ccmas/ | engineering.json → ELECTRICAL AND ELECTRONIC ENGINEERING → course code EEE 102 | 2026-09-26 |
| EV-248 | https://www.nuc.edu.ng/ccmas/ | engineering.json → ELECTRICAL AND ELECTRONIC ENGINEERING → course code GET 204 | 2026-09-26 |
| EV-249 | https://www.nuc.edu.ng/ccmas/ | engineering.json → ELECTRICAL AND ELECTRONIC ENGINEERING → course code GET 205 | 2026-09-26 |
| EV-250 | https://www.nuc.edu.ng/ccmas/ | engineering.json → ELECTRICAL AND ELECTRONIC ENGINEERING → course code EEE 202 | 2026-09-26 |
| EV-251 | https://www.nuc.edu.ng/ccmas/ | engineering.json → ELECTRICAL AND ELECTRONIC ENGINEERING → course code EEE 204 | 2026-09-26 |
| EV-252 | https://www.nuc.edu.ng/ccmas/ | engineering.json → ELECTRICAL AND ELECTRONIC ENGINEERING → course code EEE 321 | 2026-09-26 |
| EV-253 | https://www.nuc.edu.ng/ccmas/ | engineering.json → ELECTRICAL AND ELECTRONIC ENGINEERING → course code EEE 322 | 2026-09-26 |
| EV-254 | https://www.nuc.edu.ng/ccmas/ | engineering.json → ELECTRICAL AND ELECTRONIC ENGINEERING → course code EEE 593 | 2026-09-26 |
| EV-255 | https://www.nuc.edu.ng/ccmas/ | engineering.json → ELECTRICAL AND ELECTRONIC ENGINEERING → course code EEE 594 | 2026-09-26 |
| EV-256 | none | engineering.txt → parsed row ordinal 33 → Electronics Engineering | 2026-09-26 |
| EV-257 | https://www.nuc.edu.ng/ccmas/ | engineering.json → ELECTRONIC ENGINEERING → course code GET 101 | 2026-09-26 |
| EV-258 | https://www.nuc.edu.ng/ccmas/ | engineering.json → ELECTRONIC ENGINEERING → course code GET 102 | 2026-09-26 |
| EV-259 | https://www.nuc.edu.ng/ccmas/ | engineering.json → ELECTRONIC ENGINEERING → course code ELE 101 | 2026-09-26 |
| EV-260 | https://www.nuc.edu.ng/ccmas/ | engineering.json → ELECTRONIC ENGINEERING → course code GET 201 | 2026-09-26 |
| EV-261 | https://www.nuc.edu.ng/ccmas/ | engineering.json → ELECTRONIC ENGINEERING → course code GET 202 | 2026-09-26 |
| EV-262 | https://www.nuc.edu.ng/ccmas/ | engineering.json → ELECTRONIC ENGINEERING → course code GET 203 | 2026-09-26 |
| EV-263 | https://www.nuc.edu.ng/ccmas/ | engineering.json → ELECTRONIC ENGINEERING → course code GET 206 | 2026-09-26 |
| EV-264 | https://www.nuc.edu.ng/ccmas/ | engineering.json → ELECTRONIC ENGINEERING → course code GET 209 | 2026-09-26 |
| EV-265 | https://www.nuc.edu.ng/ccmas/ | engineering.json → ELECTRONIC ENGINEERING → course code GET 210 | 2026-09-26 |
| EV-266 | https://www.nuc.edu.ng/ccmas/ | engineering.json → ELECTRONIC ENGINEERING → course code GET 211 | 2026-09-26 |
| EV-267 | https://www.nuc.edu.ng/ccmas/ | engineering.json → ELECTRONIC ENGINEERING → course code GET 299 | 2026-09-26 |
| EV-268 | https://www.nuc.edu.ng/ccmas/ | engineering.json → ELECTRONIC ENGINEERING → course code GET 301 | 2026-09-26 |
| EV-269 | https://www.nuc.edu.ng/ccmas/ | engineering.json → ELECTRONIC ENGINEERING → course code GET 304 | 2026-09-26 |
| EV-270 | https://www.nuc.edu.ng/ccmas/ | engineering.json → ELECTRONIC ENGINEERING → course code GET 305 | 2026-09-26 |
| EV-271 | https://www.nuc.edu.ng/ccmas/ | engineering.json → ELECTRONIC ENGINEERING → course code GET 306 | 2026-09-26 |
| EV-272 | https://www.nuc.edu.ng/ccmas/ | engineering.json → ELECTRONIC ENGINEERING → course code GET 307 | 2026-09-26 |
| EV-273 | https://www.nuc.edu.ng/ccmas/ | engineering.json → ELECTRONIC ENGINEERING → course code ELE 313 | 2026-09-26 |
| EV-274 | https://www.nuc.edu.ng/ccmas/ | engineering.json → ELECTRONIC ENGINEERING → course code ELE 318 | 2026-09-26 |
| EV-275 | https://www.nuc.edu.ng/ccmas/ | engineering.json → ELECTRONIC ENGINEERING → course code ELE 324 | 2026-09-26 |
| EV-276 | https://www.nuc.edu.ng/ccmas/ | engineering.json → ELECTRONIC ENGINEERING → course code ELE 305 | 2026-09-26 |
| EV-277 | https://www.nuc.edu.ng/ccmas/ | engineering.json → ELECTRONIC ENGINEERING → course code GET 399 | 2026-09-26 |
| EV-278 | https://www.nuc.edu.ng/ccmas/ | engineering.json → ELECTRONIC ENGINEERING → course code GET 402 | 2026-09-26 |
| EV-279 | https://www.nuc.edu.ng/ccmas/ | engineering.json → ELECTRONIC ENGINEERING → course code GET 404 | 2026-09-26 |
| EV-280 | https://www.nuc.edu.ng/ccmas/ | engineering.json → ELECTRONIC ENGINEERING → course code ELE 403 | 2026-09-26 |
| EV-281 | https://www.nuc.edu.ng/ccmas/ | engineering.json → ELECTRONIC ENGINEERING → course code ELE 405 | 2026-09-26 |
| EV-282 | https://www.nuc.edu.ng/ccmas/ | engineering.json → ELECTRONIC ENGINEERING → course code ELE 407 | 2026-09-26 |
| EV-283 | https://www.nuc.edu.ng/ccmas/ | engineering.json → ELECTRONIC ENGINEERING → course code ELE 411 | 2026-09-26 |
| EV-284 | https://www.nuc.edu.ng/ccmas/ | engineering.json → ELECTRONIC ENGINEERING → course code GET 499 | 2026-09-26 |
| EV-285 | https://www.nuc.edu.ng/ccmas/ | engineering.json → ELECTRONIC ENGINEERING → course code GET 501 | 2026-09-26 |
| EV-286 | https://www.nuc.edu.ng/ccmas/ | engineering.json → ELECTRONIC ENGINEERING → course code GET 502 | 2026-09-26 |
| EV-287 | https://www.nuc.edu.ng/ccmas/ | engineering.json → ELECTRONIC ENGINEERING → course code ELE 505 | 2026-09-26 |
| EV-288 | https://www.nuc.edu.ng/ccmas/ | engineering.json → ELECTRONIC ENGINEERING → course code ELE 507 | 2026-09-26 |
| EV-289 | https://www.nuc.edu.ng/ccmas/ | engineering.json → ELECTRONIC ENGINEERING → course code ELE 512 | 2026-09-26 |
| EV-290 | https://www.nuc.edu.ng/ccmas/ | engineering.json → ELECTRONIC ENGINEERING → course code ELE 513 | 2026-09-26 |
| EV-291 | https://www.nuc.edu.ng/ccmas/ | engineering.json → ELECTRONIC ENGINEERING → course code ELE 519 | 2026-09-26 |
| EV-292 | https://www.nuc.edu.ng/ccmas/ | engineering.json → ELECTRONIC ENGINEERING → course code ELE 529 | 2026-09-26 |
| EV-293 | none | engineering.txt → parsed row ordinal 26 → Mechanical Engineering | 2026-09-26 |
| EV-294 | https://www.nuc.edu.ng/ccmas/ | engineering.json → MECHANICAL ENGINEERING → course code PHY 101 | 2026-09-26 |
| EV-295 | https://www.nuc.edu.ng/ccmas/ | engineering.json → MECHANICAL ENGINEERING → course code PHY 103 | 2026-09-26 |
| EV-296 | https://www.nuc.edu.ng/ccmas/ | engineering.json → MECHANICAL ENGINEERING → course code PHY 107 | 2026-09-26 |
| EV-297 | https://www.nuc.edu.ng/ccmas/ | engineering.json → MECHANICAL ENGINEERING → course code MEE 101 | 2026-09-26 |
| EV-298 | https://www.nuc.edu.ng/ccmas/ | engineering.json → MECHANICAL ENGINEERING → course code GET 202 | 2026-09-26 |
| EV-299 | https://www.nuc.edu.ng/ccmas/ | engineering.json → MECHANICAL ENGINEERING → course code GET 204 | 2026-09-26 |
| EV-300 | https://www.nuc.edu.ng/ccmas/ | engineering.json → MECHANICAL ENGINEERING → course code GET 205 | 2026-09-26 |
| EV-301 | https://www.nuc.edu.ng/ccmas/ | engineering.json → MECHANICAL ENGINEERING → course code GET 206 | 2026-09-26 |
| EV-302 | https://www.nuc.edu.ng/ccmas/ | engineering.json → MECHANICAL ENGINEERING → course code MEE 401 | 2026-09-26 |
| EV-303 | https://www.nuc.edu.ng/ccmas/ | engineering.json → MECHANICAL ENGINEERING → course code MEE 402 | 2026-09-26 |
| EV-304 | https://www.nuc.edu.ng/ccmas/ | engineering.json → MECHANICAL ENGINEERING → course code MEE 403 | 2026-09-26 |
| EV-305 | https://www.nuc.edu.ng/ccmas/ | engineering.json → MECHANICAL ENGINEERING → course code MEE 404 | 2026-09-26 |
| EV-306 | https://www.nuc.edu.ng/ccmas/ | engineering.json → MECHANICAL ENGINEERING → course code MEE 407 | 2026-09-26 |
| EV-307 | none | engineering.txt → parsed row ordinal 27 → Chemical Engineering | 2026-09-26 |
| EV-308 | https://www.nuc.edu.ng/ccmas/ | engineering.json → CHEMICAL ENGINEERING → course code GST 111 | 2026-09-26 |
| EV-309 | https://www.nuc.edu.ng/ccmas/ | engineering.json → CHEMICAL ENGINEERING → course code CHM 101 | 2026-09-26 |
| EV-310 | https://www.nuc.edu.ng/ccmas/ | engineering.json → CHEMICAL ENGINEERING → course code CHM 102 | 2026-09-26 |
| EV-311 | https://www.nuc.edu.ng/ccmas/ | engineering.json → CHEMICAL ENGINEERING → course code CHM 107 | 2026-09-26 |
| EV-312 | https://www.nuc.edu.ng/ccmas/ | engineering.json → CHEMICAL ENGINEERING → course code CHM 108 | 2026-09-26 |
| EV-313 | https://www.nuc.edu.ng/ccmas/ | engineering.json → CHEMICAL ENGINEERING → course code PHY 103 | 2026-09-26 |
| EV-314 | https://www.nuc.edu.ng/ccmas/ | engineering.json → CHEMICAL ENGINEERING → course code TCH 101 | 2026-09-26 |
| EV-315 | https://www.nuc.edu.ng/ccmas/ | engineering.json → CHEMICAL ENGINEERING → course code GET 211 | 2026-09-26 |
| EV-316 | https://www.nuc.edu.ng/ccmas/ | engineering.json → CHEMICAL ENGINEERING → course code TCH 201 | 2026-09-26 |
| EV-317 | https://www.nuc.edu.ng/ccmas/ | engineering.json → CHEMICAL ENGINEERING → course code TCH 202 | 2026-09-26 |
| EV-318 | https://www.nuc.edu.ng/ccmas/ | engineering.json → CHEMICAL ENGINEERING → course code TCH 206 | 2026-09-26 |
| EV-319 | https://www.nuc.edu.ng/ccmas/ | engineering.json → CHEMICAL ENGINEERING → course code TCH 301 | 2026-09-26 |
| EV-320 | https://www.nuc.edu.ng/ccmas/ | engineering.json → CHEMICAL ENGINEERING → course code TCH 302 | 2026-09-26 |
| EV-321 | https://www.nuc.edu.ng/ccmas/ | engineering.json → CHEMICAL ENGINEERING → course code TCH 303 | 2026-09-26 |
| EV-322 | https://www.nuc.edu.ng/ccmas/ | engineering.json → CHEMICAL ENGINEERING → course code TCH 304 | 2026-09-26 |
| EV-323 | https://www.nuc.edu.ng/ccmas/ | engineering.json → CHEMICAL ENGINEERING → course code TCH 305 | 2026-09-26 |
| EV-324 | https://www.nuc.edu.ng/ccmas/ | engineering.json → CHEMICAL ENGINEERING → course code TCH 307 | 2026-09-26 |
| EV-325 | https://www.nuc.edu.ng/ccmas/ | engineering.json → CHEMICAL ENGINEERING → course code TCH 308 | 2026-09-26 |
| EV-326 | https://www.nuc.edu.ng/ccmas/ | engineering.json → CHEMICAL ENGINEERING → course code TCH 401 | 2026-09-26 |
| EV-327 | https://www.nuc.edu.ng/ccmas/ | engineering.json → CHEMICAL ENGINEERING → course code TCH 402 | 2026-09-26 |
| EV-328 | https://www.nuc.edu.ng/ccmas/ | engineering.json → CHEMICAL ENGINEERING → course code TCH 404 | 2026-09-26 |
| EV-329 | https://www.nuc.edu.ng/ccmas/ | engineering.json → CHEMICAL ENGINEERING → course code TCH 405 | 2026-09-26 |
| EV-330 | https://www.nuc.edu.ng/ccmas/ | engineering.json → CHEMICAL ENGINEERING → course code TCH 406 | 2026-09-26 |
| EV-331 | https://www.nuc.edu.ng/ccmas/ | engineering.json → CHEMICAL ENGINEERING → course code TCH 501 | 2026-09-26 |
| EV-332 | https://www.nuc.edu.ng/ccmas/ | engineering.json → CHEMICAL ENGINEERING → course code TCH 555 | 2026-09-26 |
| EV-333 | none | engineering.txt → parsed row ordinal 28 → Biomedical Engineering | 2026-09-26 |
| EV-334 | https://www.nuc.edu.ng/ccmas/ | engineering.json → BIOMEDICAL ENGINEERING → course code BIO 101 | 2026-09-26 |
| EV-335 | https://www.nuc.edu.ng/ccmas/ | engineering.json → BIOMEDICAL ENGINEERING → course code BIO 107 | 2026-09-26 |
| EV-336 | https://www.nuc.edu.ng/ccmas/ | engineering.json → BIOMEDICAL ENGINEERING → course code BME 102 | 2026-09-26 |
| EV-337 | https://www.nuc.edu.ng/ccmas/ | engineering.json → BIOMEDICAL ENGINEERING → course code BME 211 | 2026-09-26 |
| EV-338 | https://www.nuc.edu.ng/ccmas/ | engineering.json → BIOMEDICAL ENGINEERING → course code BME 334 | 2026-09-26 |
| EV-339 | https://www.nuc.edu.ng/ccmas/ | engineering.json → BIOMEDICAL ENGINEERING → course code BME 351 | 2026-09-26 |
| EV-340 | https://www.nuc.edu.ng/ccmas/ | engineering.json → BIOMEDICAL ENGINEERING → course code BME 332 | 2026-09-26 |
| EV-341 | https://www.nuc.edu.ng/ccmas/ | engineering.json → BIOMEDICAL ENGINEERING → course code BME 401 | 2026-09-26 |
| EV-342 | https://www.nuc.edu.ng/ccmas/ | engineering.json → BIOMEDICAL ENGINEERING → course code BME 435 | 2026-09-26 |
| EV-343 | https://www.nuc.edu.ng/ccmas/ | engineering.json → BIOMEDICAL ENGINEERING → course code BME 521 | 2026-09-26 |
| EV-344 | https://www.nuc.edu.ng/ccmas/ | engineering.json → BIOMEDICAL ENGINEERING → course code BME 526 | 2026-09-26 |
| EV-345 | https://www.nuc.edu.ng/ccmas/ | engineering.json → BIOMEDICAL ENGINEERING → course code BME 523 | 2026-09-26 |
| EV-346 | https://www.nuc.edu.ng/ccmas/ | engineering.json → BIOMEDICAL ENGINEERING → course code BME 524 | 2026-09-26 |
| EV-347 | none | engineering.txt → parsed row ordinal 32 → Mechatronics Engineering | 2026-09-26 |
| EV-348 | https://www.nuc.edu.ng/ccmas/ | engineering.json → MECHATRONICS ENGINEERING → course code MCE 101 | 2026-09-26 |
| EV-349 | https://www.nuc.edu.ng/ccmas/ | engineering.json → MECHATRONICS ENGINEERING → course code GET 205 | 2026-09-26 |
| EV-350 | https://www.nuc.edu.ng/ccmas/ | engineering.json → MECHATRONICS ENGINEERING → course code MCE 321 | 2026-09-26 |
| EV-351 | https://www.nuc.edu.ng/ccmas/ | engineering.json → MECHATRONICS ENGINEERING → course code MCE 401 | 2026-09-26 |
| EV-352 | https://www.nuc.edu.ng/ccmas/ | engineering.json → MECHATRONICS ENGINEERING → course code MCE 403 | 2026-09-26 |
| EV-353 | https://www.nuc.edu.ng/ccmas/ | engineering.json → MECHATRONICS ENGINEERING → course code MCE 405 | 2026-09-26 |
| EV-354 | https://www.nuc.edu.ng/ccmas/ | engineering.json → MECHATRONICS ENGINEERING → course code MCE 407 | 2026-09-26 |
| EV-355 | https://www.nuc.edu.ng/ccmas/ | engineering.json → MECHATRONICS ENGINEERING → course code MCE 409 | 2026-09-26 |
| EV-356 | https://www.nuc.edu.ng/ccmas/ | engineering.json → MECHATRONICS ENGINEERING → course code GET 501 | 2026-09-26 |
| EV-357 | https://www.nuc.edu.ng/ccmas/ | engineering.json → MECHATRONICS ENGINEERING → course code MCE 501 | 2026-09-26 |
| EV-358 | none | engineering.txt → parsed row ordinal 29 → Agricultural Engineering | 2026-09-26 |
| EV-359 | https://www.nuc.edu.ng/ccmas/ | engineering.json → AGRICULTURAL AND BIOSYSTEMS ENGINEERING → course code ABE 102 | 2026-09-26 |
| EV-360 | https://www.nuc.edu.ng/ccmas/ | engineering.json → AGRICULTURAL AND BIOSYSTEMS ENGINEERING → course code ABE 303 | 2026-09-26 |
| EV-361 | https://www.nuc.edu.ng/ccmas/ | engineering.json → AGRICULTURAL AND BIOSYSTEMS ENGINEERING → course code ABE 304 | 2026-09-26 |
| EV-362 | https://www.nuc.edu.ng/ccmas/ | engineering.json → AGRICULTURAL AND BIOSYSTEMS ENGINEERING → course code ABE 307 | 2026-09-26 |
| EV-363 | https://www.nuc.edu.ng/ccmas/ | engineering.json → AGRICULTURAL AND BIOSYSTEMS ENGINEERING → course code ABE 308 | 2026-09-26 |
| EV-364 | https://www.nuc.edu.ng/ccmas/ | engineering.json → AGRICULTURAL AND BIOSYSTEMS ENGINEERING → course code ABE 401 | 2026-09-26 |
| EV-365 | https://www.nuc.edu.ng/ccmas/ | engineering.json → AGRICULTURAL AND BIOSYSTEMS ENGINEERING → course code ABE 502 | 2026-09-26 |
| EV-366 | https://www.nuc.edu.ng/ccmas/ | engineering.json → AGRICULTURAL AND BIOSYSTEMS ENGINEERING → course code ABE 504 | 2026-09-26 |
| EV-367 | https://www.nuc.edu.ng/ccmas/ | engineering.json → AGRICULTURAL AND BIOSYSTEMS ENGINEERING → course code ABE 505 | 2026-09-26 |
| EV-368 | https://www.nuc.edu.ng/ccmas/ | engineering.json → AGRICULTURAL AND BIOSYSTEMS ENGINEERING → course code ABE 599 | 2026-09-26 |
| EV-369 | none | engineering.txt → parsed row ordinal 30 → Agricultural and Bio-Resources Engineering | 2026-09-26 |
| EV-370 | https://www.nuc.edu.ng/ccmas/ | engineering.json → AGRICULTURAL AND BIOSYSTEMS ENGINEERING → course code ENT 312 | 2026-09-26 |
| EV-371 | https://www.nuc.edu.ng/ccmas/ | engineering.json → AGRICULTURAL AND BIOSYSTEMS ENGINEERING → course code GET 306 | 2026-09-26 |

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
- `data/career-mapping/_audit/jamb_ccmas_final_verification_rows_281_420_2026-09-26_011.md`
- `data/career-mapping/_audit/jamb_ccmas_final_verification_rows_281_420_2026-09-26_012.md`
- `data/career-mapping/_audit/jamb_ccmas_source_issue_queue_2026-09-26_001.json`
- `data/career-mapping/_audit/jamb_ccmas_source_issue_queue_2026-09-26_001.md`
- `data/career-mapping/_audit/jamb_curriculum_scopes_2026-08-17.json`
- `data/career-mapping/_audit/jamb_anomaly_inventory_2026-09-26.json`
- `data/career-mapping/_audit/jamb_offering_context_inventory_2026-09-25.json`
- `data/career-mapping/_audit/ccmas_extraction_anomaly_inventory_2026-09-26.json`


Closed work intentionally not reopened: French Arts anchor correction; Film and Video Studies Social/Management occurrence addition; recorded CCMAS page-header repairs; CAM424 equipment-spill repair; DTS498/CSC432 cross-reference repair; and replacement-character normalization classified as encoding-only.

## Disposition and resume boundary

This increment reconciles the current **381–400** queue against the prior row-level evidence. It does **not** close any identity: scope evidence, exact offering context, selected-course fidelity, item-level citations, and external/custom provenance remain open where listed. It performs no downstream domain/subgroup/role audit.

The next bounded increment is **identities 401–420**, maximum **20 identities/packages**, and must save its own append-only JSON/Markdown checkpoint before proceeding.

# JAMB–CCMAS source increment 021 — identities 401–420

**Audit date:** 2026-09-26 (Africa/Lagos)  
**Mode:** bounded reconciliation after checkpoint 003; append-only  
**Assigned lane:** JAMB identity/offering and CCMAS/external source integrity only  
**Write boundary:** no shared source, mapping, scope, seed, SQL, UI, downstream taxonomy, domain, subgroup, or role file was edited.

## Exact coverage inspected

- Canonical JAMB identities: **20/20**, rows **401–420**.
- Current queue records: **20 identity rows**, **66 current issue records**.
- Current selected-course occurrences represented by those rows: **303**.
- Parsed offering occurrences represented by those rows: **20**.
- CCMAS/external components inspected through the current records: **Administration and Management::Transport Management, Agricultural Science::Agricultural Extension, Agricultural Science::Animal Science, Agricultural Science::Crop Science, Agricultural Science::Forest Resources and Wildlife Management, Arts::Hausa, Arts::Igbo, Arts::Modern European Languages B.A (German), Arts::Theatre Arts, Education::Mathematics, Engineering::INDUSTRIAL AND PRODUCTION ENGINEERING, Engineering::INFORMATION AND COMMUNICATION ENGINEERING, Engineering::TELECOMMUNICATIONS ENGINEERING, Environmental Sciences::Environmental Management, Environmental Sciences::Fine and Applied Arts, Environmental Sciences::Geography, Environmental Sciences::Surveying and Geoinformatics, __custom__::Sport Management (Education)**.
- Prior row-level evidence was read first from the existing final-gap checkpoint(s) for rows **401–420**; already-verified facts were not re-researched.

## Records inspected

| Row | JAMB identity | Component reference(s) | Current scope state | Selected courses | Offering records | Current issue IDs |
|---:|---|---|---|---:|---:|---|
| 401 | Production Engineering | Engineering::INDUSTRIAL AND PRODUCTION ENGINEERING | partial_scope_reviewed | 10 | 1 | SRC-01218, SRC-01219, SRC-01220, SRC-01221 |
| 402 | ICT Engineering | Engineering::INFORMATION AND COMMUNICATION ENGINEERING | partial_scope_reviewed | 4 | 1 | SRC-01222, SRC-01223, SRC-01224 |
| 403 | Communication Technology | Engineering::TELECOMMUNICATIONS ENGINEERING | partial_scope_reviewed | 10 | 1 | SRC-01225, SRC-01226, SRC-01227 |
| 404 | Land Surveying | Environmental Sciences::Surveying and Geoinformatics | partial_scope_reviewed | 20 | 1 | SRC-01228, SRC-01229, SRC-01230, SRC-01231 |
| 405 | Drama/Dramatic Arts/Performing Arts | Arts::Theatre Arts | partial_scope_reviewed | 23 | 1 | SRC-01232, SRC-01233, SRC-01234, SRC-01235 |
| 406 | Fine Art/Fine and Applied Arts | Environmental Sciences::Fine and Applied Arts | partial_scope_reviewed | 14 | 1 | SRC-01236, SRC-01237, SRC-01238, SRC-01239 |
| 407 | Hausa | Arts::Hausa | partial_scope_reviewed | 26 | 1 | SRC-01240, SRC-01241, SRC-01242, SRC-01243 |
| 408 | Igbo | Arts::Igbo | partial_scope_reviewed | 12 | 1 | SRC-01244, SRC-01245, SRC-01246, SRC-01247 |
| 409 | Modern Language and Translation | Arts::Modern European Languages B.A (German) | partial_scope_reviewed | 10 | 1 | SRC-01248, SRC-01249, SRC-01250, SRC-01251 |
| 410 | Geography and Environmental Studies | Environmental Sciences::Geography | partial_scope_reviewed | 22 | 1 | SRC-01252, SRC-01253, SRC-01254, SRC-01255 |
| 411 | Crop Protection | Agricultural Science::Crop Science | partial_scope_reviewed | 13 | 1 | SRC-01256, SRC-01257, SRC-01258, SRC-01259 |
| 412 | Animal Physiology | Agricultural Science::Animal Science | partial_scope_reviewed | 15 | 1 | SRC-01260, SRC-01261, SRC-01262, SRC-01263 |
| 413 | Livestock Production Technology | Agricultural Science::Animal Science | partial_scope_reviewed | 14 | 1 | SRC-01264, SRC-01265, SRC-01266, SRC-01267 |
| 414 | Pasture & Range Management | Agricultural Science::Animal Science | partial_scope_reviewed | 1 | 1 | SRC-01268, SRC-01269, SRC-01270, SRC-01271 |
| 415 | Farm Management & Agric. Extension | Agricultural Science::Agricultural Extension | partial_scope_reviewed | 17 | 1 | SRC-01272, SRC-01273, SRC-01274, SRC-01275 |
| 416 | Eco-Tourism and Wildlife Management | Agricultural Science::Forest Resources and Wildlife Management | partial_scope_reviewed | 22 | 1 | SRC-01276, SRC-01277, SRC-01278, SRC-01279 |
| 417 | Environmental Management and Technology | Environmental Sciences::Environmental Management | partial_scope_reviewed | 24 | 1 | SRC-01280, SRC-01281, SRC-01282, SRC-01283 |
| 418 | Statistics Education | Education::Mathematics | partial_scope_reviewed | 1 | 1 | SRC-01284, SRC-01285, SRC-01286 |
| 419 | Sport Management (Education) | __custom__::Sport Management (Education) | external_scope_evidenced | 9 | 1 | SRC-01287, SRC-01288, SRC-01289, SRC-01290 |
| 420 | Transport Planning and Management | Administration and Management::Transport Management | partial_scope_reviewed | 36 | 1 | SRC-01291, SRC-01292, SRC-01293 |

## Current issue counts

- Confirmed gaps still open: **75**.
- Candidate issues still open: **1**.
- New issue classes discovered in this reconciliation: **0**.
- Closed findings reopened: **0**.
- Distinct exact evidence references captured: **323**.

By issue type/status:

- `external_or_custom_evidence_contract` / `candidate`: 1
- `offering_context_unverified` / `confirmed_gap`: 20
- `scope_evidence_missing` / `confirmed_gap`: 20
- `selected_course_citation_incomplete` / `confirmed_gap`: 20
- `selected_course_content_or_outcome_gap` / `confirmed_gap`: 15

## Confirmed and candidate issue ledger

The following are current open records carried from the source issue queue. They are not claims that every record below is an academic-content defect; provenance, offering-context, and citation gaps remain distinct from content defects.

| Issue | Row | Status | Type | Evidence refs | Recommendation |
|---|---:|---|---|---|---|
| SRC-01218 | 401 | confirmed_gap | scope_evidence_missing | EV-001 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01219 | 401 | confirmed_gap | offering_context_unverified | EV-001 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01220 | 401 | confirmed_gap | selected_course_citation_incomplete | EV-002, EV-003, EV-004, EV-005, EV-006, EV-007, EV-008, EV-009, EV-010, EV-011 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-01221 | 401 | confirmed_gap | selected_course_content_or_outcome_gap | EV-002, EV-003, EV-004, EV-005, EV-006, EV-007, EV-008, EV-009, EV-010, EV-011 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-01222 | 402 | confirmed_gap | scope_evidence_missing | EV-012 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01223 | 402 | confirmed_gap | offering_context_unverified | EV-012 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01224 | 402 | confirmed_gap | selected_course_citation_incomplete | EV-013, EV-014, EV-015, EV-016 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-01225 | 403 | confirmed_gap | scope_evidence_missing | EV-017 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01226 | 403 | confirmed_gap | offering_context_unverified | EV-017 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01227 | 403 | confirmed_gap | selected_course_citation_incomplete | EV-018, EV-019, EV-020, EV-021, EV-022, EV-023, EV-024, EV-025, EV-026, EV-027 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-01228 | 404 | confirmed_gap | scope_evidence_missing | EV-028 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01229 | 404 | confirmed_gap | offering_context_unverified | EV-028 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01230 | 404 | confirmed_gap | selected_course_citation_incomplete | EV-029, EV-030, EV-031, EV-032, EV-033, EV-034, EV-035, EV-036, EV-037, EV-038, EV-039, EV-040, EV-041, EV-042, EV-043, EV-044, EV-045, EV-046, EV-047, EV-048 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-01231 | 404 | confirmed_gap | selected_course_content_or_outcome_gap | EV-029, EV-030, EV-031, EV-032, EV-033, EV-034, EV-035, EV-036, EV-037, EV-038, EV-039, EV-040, EV-041, EV-042, EV-043, EV-044, EV-045, EV-046, EV-047, EV-048 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-01232 | 405 | confirmed_gap | scope_evidence_missing | EV-049 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01233 | 405 | confirmed_gap | offering_context_unverified | EV-049 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01234 | 405 | confirmed_gap | selected_course_citation_incomplete | EV-050, EV-051, EV-052, EV-053, EV-054, EV-055, EV-056, EV-057, EV-058, EV-059, EV-060, EV-061, EV-062, EV-063, EV-064, EV-065, EV-066, EV-067, EV-068, EV-069, EV-070, EV-071, EV-072 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-01235 | 405 | confirmed_gap | selected_course_content_or_outcome_gap | EV-050, EV-051, EV-052, EV-053, EV-054, EV-055, EV-056, EV-057, EV-058, EV-059, EV-060, EV-061, EV-062, EV-063, EV-064, EV-065, EV-066, EV-067, EV-068, EV-069, EV-070, EV-071, EV-072 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-01236 | 406 | confirmed_gap | scope_evidence_missing | EV-073 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01237 | 406 | confirmed_gap | offering_context_unverified | EV-073 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01238 | 406 | confirmed_gap | selected_course_citation_incomplete | EV-074, EV-075, EV-076, EV-077, EV-078, EV-079, EV-080, EV-081, EV-082, EV-083, EV-084, EV-085, EV-086 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-01239 | 406 | confirmed_gap | selected_course_content_or_outcome_gap | EV-074, EV-075, EV-076, EV-077, EV-078, EV-079, EV-080, EV-081, EV-082, EV-083, EV-084, EV-085, EV-086 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-01240 | 407 | confirmed_gap | scope_evidence_missing | EV-087 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01241 | 407 | confirmed_gap | offering_context_unverified | EV-087 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01242 | 407 | confirmed_gap | selected_course_citation_incomplete | EV-088, EV-089, EV-090, EV-091, EV-092, EV-093, EV-094, EV-095, EV-096, EV-097, EV-098, EV-099, EV-100, EV-101, EV-102, EV-103, EV-104, EV-105, EV-106, EV-107, EV-108, EV-109, EV-110, EV-111, EV-112 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-01243 | 407 | confirmed_gap | selected_course_content_or_outcome_gap | EV-088, EV-089, EV-090, EV-091, EV-092, EV-093, EV-094, EV-095, EV-096, EV-097, EV-098, EV-099, EV-100, EV-101, EV-102, EV-103, EV-104, EV-105, EV-106, EV-107, EV-108, EV-109, EV-110, EV-111, EV-112 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-01244 | 408 | confirmed_gap | scope_evidence_missing | EV-113 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01245 | 408 | confirmed_gap | offering_context_unverified | EV-113 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01246 | 408 | confirmed_gap | selected_course_citation_incomplete | EV-114, EV-115, EV-116, EV-117, EV-118, EV-119, EV-120, EV-121, EV-122, EV-123, EV-124, EV-125 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-01247 | 408 | confirmed_gap | selected_course_content_or_outcome_gap | EV-114, EV-115, EV-116, EV-117, EV-118, EV-119, EV-120, EV-121, EV-122, EV-123, EV-124, EV-125 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-01248 | 409 | confirmed_gap | scope_evidence_missing | EV-126 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01249 | 409 | confirmed_gap | offering_context_unverified | EV-126 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01250 | 409 | confirmed_gap | selected_course_citation_incomplete | EV-127, EV-128, EV-129, EV-130, EV-131, EV-132, EV-133, EV-134, EV-135, EV-136 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-01251 | 409 | confirmed_gap | selected_course_content_or_outcome_gap | EV-127, EV-128, EV-129, EV-130, EV-131, EV-132, EV-133, EV-134, EV-135, EV-136 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-01252 | 410 | confirmed_gap | scope_evidence_missing | EV-137 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01253 | 410 | confirmed_gap | offering_context_unverified | EV-137 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01254 | 410 | confirmed_gap | selected_course_citation_incomplete | EV-138, EV-139, EV-140, EV-141, EV-142, EV-143, EV-144, EV-145, EV-146, EV-147, EV-148, EV-149, EV-150, EV-151, EV-152, EV-153, EV-154, EV-155, EV-156, EV-157, EV-158, EV-159 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-01255 | 410 | confirmed_gap | selected_course_content_or_outcome_gap | EV-138, EV-139, EV-140, EV-141, EV-142, EV-143, EV-144, EV-145, EV-146, EV-147, EV-148, EV-149, EV-150, EV-151, EV-152, EV-153, EV-154, EV-155, EV-156, EV-157, EV-158, EV-159 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-01256 | 411 | confirmed_gap | scope_evidence_missing | EV-160 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01257 | 411 | confirmed_gap | offering_context_unverified | EV-160 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01258 | 411 | confirmed_gap | selected_course_citation_incomplete | EV-161, EV-162, EV-163, EV-164, EV-165, EV-166, EV-167, EV-168, EV-169, EV-170, EV-171, EV-172, EV-173 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-01259 | 411 | confirmed_gap | selected_course_content_or_outcome_gap | EV-161, EV-162, EV-163, EV-164, EV-165, EV-166, EV-167, EV-168, EV-169, EV-170, EV-171, EV-172, EV-173 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-01260 | 412 | confirmed_gap | scope_evidence_missing | EV-174 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01261 | 412 | confirmed_gap | offering_context_unverified | EV-174 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01262 | 412 | confirmed_gap | selected_course_citation_incomplete | EV-175, EV-176, EV-177, EV-178, EV-179, EV-180, EV-181, EV-182, EV-183, EV-184, EV-185, EV-186, EV-187, EV-188, EV-189 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-01263 | 412 | confirmed_gap | selected_course_content_or_outcome_gap | EV-175, EV-176, EV-177, EV-178, EV-179, EV-180, EV-181, EV-182, EV-183, EV-184, EV-185, EV-186, EV-187, EV-188, EV-189 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-01264 | 413 | confirmed_gap | scope_evidence_missing | EV-190 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01265 | 413 | confirmed_gap | offering_context_unverified | EV-190 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01266 | 413 | confirmed_gap | selected_course_citation_incomplete | EV-176, EV-177, EV-181, EV-182, EV-184, EV-186, EV-191, EV-192, EV-193, EV-194, EV-195, EV-196, EV-197, EV-198 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-01267 | 413 | confirmed_gap | selected_course_content_or_outcome_gap | EV-176, EV-177, EV-181, EV-182, EV-184, EV-186, EV-191, EV-192, EV-193, EV-194, EV-195, EV-196, EV-197, EV-198 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-01268 | 414 | confirmed_gap | scope_evidence_missing | EV-199 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01269 | 414 | confirmed_gap | offering_context_unverified | EV-199 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01270 | 414 | confirmed_gap | selected_course_citation_incomplete | EV-198 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-01271 | 414 | confirmed_gap | selected_course_content_or_outcome_gap | EV-198 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-01272 | 415 | confirmed_gap | scope_evidence_missing | EV-200 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01273 | 415 | confirmed_gap | offering_context_unverified | EV-200 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01274 | 415 | confirmed_gap | selected_course_citation_incomplete | EV-201, EV-202, EV-203, EV-204, EV-205, EV-206, EV-207, EV-208, EV-209, EV-210, EV-211, EV-212, EV-213, EV-214, EV-215, EV-216, EV-217 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-01275 | 415 | confirmed_gap | selected_course_content_or_outcome_gap | EV-201, EV-202, EV-203, EV-204, EV-205, EV-206, EV-207, EV-208, EV-209, EV-210, EV-211, EV-212, EV-213, EV-214, EV-215, EV-216, EV-217 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-01276 | 416 | confirmed_gap | scope_evidence_missing | EV-218 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01277 | 416 | confirmed_gap | offering_context_unverified | EV-218 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01278 | 416 | confirmed_gap | selected_course_citation_incomplete | EV-219, EV-220, EV-221, EV-222, EV-223, EV-224, EV-225, EV-226, EV-227, EV-228, EV-229, EV-230, EV-231, EV-232, EV-233, EV-234, EV-235, EV-236, EV-237, EV-238, EV-239, EV-240 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-01279 | 416 | confirmed_gap | selected_course_content_or_outcome_gap | EV-219, EV-220, EV-221, EV-222, EV-223, EV-224, EV-225, EV-226, EV-227, EV-228, EV-229, EV-230, EV-231, EV-232, EV-233, EV-234, EV-235, EV-236, EV-237, EV-238, EV-239, EV-240 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-01280 | 417 | confirmed_gap | scope_evidence_missing | EV-241 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01281 | 417 | confirmed_gap | offering_context_unverified | EV-241 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01282 | 417 | confirmed_gap | selected_course_citation_incomplete | EV-242, EV-243, EV-244, EV-245, EV-246, EV-247, EV-248, EV-249, EV-250, EV-251, EV-252, EV-253, EV-254, EV-255, EV-256, EV-257, EV-258, EV-259, EV-260, EV-261, EV-262, EV-263, EV-264, EV-265 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-01283 | 417 | confirmed_gap | selected_course_content_or_outcome_gap | EV-242, EV-243, EV-244, EV-245, EV-246, EV-247, EV-248, EV-249, EV-250, EV-251, EV-252, EV-253, EV-254, EV-255, EV-256, EV-257, EV-258, EV-259, EV-260, EV-261, EV-262, EV-263, EV-264, EV-265 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-01284 | 418 | confirmed_gap | scope_evidence_missing | EV-266 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01285 | 418 | confirmed_gap | offering_context_unverified | EV-266 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01286 | 418 | confirmed_gap | selected_course_citation_incomplete | EV-267 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-01287 | 419 | confirmed_gap | scope_evidence_missing | EV-268 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01288 | 419 | confirmed_gap | offering_context_unverified | EV-268 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01289 | 419 | confirmed_gap | selected_course_citation_incomplete | EV-269, EV-270, EV-271, EV-272, EV-273, EV-274, EV-275, EV-276, EV-277 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-01290 | 419 | candidate | external_or_custom_evidence_contract | EV-278, EV-279, EV-280, EV-281, EV-282, EV-283, EV-284, EV-285, EV-286 | For every external/custom course, retain an authoritative item-specific URL, locator, access date, provider/programme context, and limits of applicability; do not treat a custom scope as a CCMAS degree anchor. |
| SRC-01291 | 420 | confirmed_gap | scope_evidence_missing | EV-287 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01292 | 420 | confirmed_gap | offering_context_unverified | EV-287 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01293 | 420 | confirmed_gap | selected_course_citation_incomplete | EV-288, EV-289, EV-290, EV-291, EV-292, EV-293, EV-294, EV-295, EV-296, EV-297, EV-298, EV-299, EV-300, EV-301, EV-302, EV-303, EV-304, EV-305, EV-306, EV-307, EV-308, EV-309, EV-310, EV-311, EV-312, EV-313, EV-314, EV-315, EV-316, EV-317, EV-318, EV-319, EV-320, EV-321, EV-322, EV-323 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |

## Exact evidence URLs, locators, and access dates

### Structured evidence references attached to issue records

| Ref | URL | Exact locator | Accessed |
|---|---|---|---|
| EV-001 | none | engineering.txt → parsed row ordinal 31 → Production Engineering | 2026-09-26 |
| EV-002 | https://www.nuc.edu.ng/ccmas/ | engineering.json → INDUSTRIAL AND PRODUCTION ENGINEERING → course code IPE 102 | 2026-09-26 |
| EV-003 | https://www.nuc.edu.ng/ccmas/ | engineering.json → INDUSTRIAL AND PRODUCTION ENGINEERING → course code GET 299 | 2026-09-26 |
| EV-004 | https://www.nuc.edu.ng/ccmas/ | engineering.json → INDUSTRIAL AND PRODUCTION ENGINEERING → course code IPE 301 | 2026-09-26 |
| EV-005 | https://www.nuc.edu.ng/ccmas/ | engineering.json → INDUSTRIAL AND PRODUCTION ENGINEERING → course code IPE 411 | 2026-09-26 |
| EV-006 | https://www.nuc.edu.ng/ccmas/ | engineering.json → INDUSTRIAL AND PRODUCTION ENGINEERING → course code IPE 421 | 2026-09-26 |
| EV-007 | https://www.nuc.edu.ng/ccmas/ | engineering.json → INDUSTRIAL AND PRODUCTION ENGINEERING → course code IPE 431 | 2026-09-26 |
| EV-008 | https://www.nuc.edu.ng/ccmas/ | engineering.json → INDUSTRIAL AND PRODUCTION ENGINEERING → course code IPE 461 | 2026-09-26 |
| EV-009 | https://www.nuc.edu.ng/ccmas/ | engineering.json → INDUSTRIAL AND PRODUCTION ENGINEERING → course code IPE 471 | 2026-09-26 |
| EV-010 | https://www.nuc.edu.ng/ccmas/ | engineering.json → INDUSTRIAL AND PRODUCTION ENGINEERING → course code IPE 522 | 2026-09-26 |
| EV-011 | https://www.nuc.edu.ng/ccmas/ | engineering.json → INDUSTRIAL AND PRODUCTION ENGINEERING → course code IPE 531 | 2026-09-26 |
| EV-012 | none | engineering.txt → parsed row ordinal 36 → ICT Engineering | 2026-09-26 |
| EV-013 | https://www.nuc.edu.ng/ccmas/ | engineering.json → INFORMATION AND COMMUNICATION ENGINEERING → course code GET 102 | 2026-09-26 |
| EV-014 | https://www.nuc.edu.ng/ccmas/ | engineering.json → INFORMATION AND COMMUNICATION ENGINEERING → course code GET 207 | 2026-09-26 |
| EV-015 | https://www.nuc.edu.ng/ccmas/ | engineering.json → INFORMATION AND COMMUNICATION ENGINEERING → course code GST 312 | 2026-09-26 |
| EV-016 | https://www.nuc.edu.ng/ccmas/ | engineering.json → INFORMATION AND COMMUNICATION ENGINEERING → course code ICE 412 | 2026-09-26 |
| EV-017 | none | engineering.txt → parsed row ordinal 35 → Communication Technology | 2026-09-26 |
| EV-018 | https://www.nuc.edu.ng/ccmas/ | engineering.json → TELECOMMUNICATIONS ENGINEERING → course code GST 111 | 2026-09-26 |
| EV-019 | https://www.nuc.edu.ng/ccmas/ | engineering.json → TELECOMMUNICATIONS ENGINEERING → course code TEE 102 | 2026-09-26 |
| EV-020 | https://www.nuc.edu.ng/ccmas/ | engineering.json → TELECOMMUNICATIONS ENGINEERING → course code GET 304 | 2026-09-26 |
| EV-021 | https://www.nuc.edu.ng/ccmas/ | engineering.json → TELECOMMUNICATIONS ENGINEERING → course code GET 305 | 2026-09-26 |
| EV-022 | https://www.nuc.edu.ng/ccmas/ | engineering.json → TELECOMMUNICATIONS ENGINEERING → course code TEE 301 | 2026-09-26 |
| EV-023 | https://www.nuc.edu.ng/ccmas/ | engineering.json → TELECOMMUNICATIONS ENGINEERING → course code TEE 405 | 2026-09-26 |
| EV-024 | https://www.nuc.edu.ng/ccmas/ | engineering.json → TELECOMMUNICATIONS ENGINEERING → course code GET 502 | 2026-09-26 |
| EV-025 | https://www.nuc.edu.ng/ccmas/ | engineering.json → TELECOMMUNICATIONS ENGINEERING → course code TEE 501 | 2026-09-26 |
| EV-026 | https://www.nuc.edu.ng/ccmas/ | engineering.json → TELECOMMUNICATIONS ENGINEERING → course code TEE 502 | 2026-09-26 |
| EV-027 | https://www.nuc.edu.ng/ccmas/ | engineering.json → TELECOMMUNICATIONS ENGINEERING → course code TEE 503 | 2026-09-26 |
| EV-028 | none | engineering.txt → parsed row ordinal 37 → Land Surveying | 2026-09-26 |
| EV-029 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Surveying and Geoinformatics → course code SVG 101 | 2026-09-26 |
| EV-030 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Surveying and Geoinformatics → course code SVG 201 | 2026-09-26 |
| EV-031 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Surveying and Geoinformatics → course code SVG 202 | 2026-09-26 |
| EV-032 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Surveying and Geoinformatics → course code SVG 204 | 2026-09-26 |
| EV-033 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Surveying and Geoinformatics → course code SVG 205 | 2026-09-26 |
| EV-034 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Surveying and Geoinformatics → course code SVG 206 | 2026-09-26 |
| EV-035 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Surveying and Geoinformatics → course code SVG 207 | 2026-09-26 |
| EV-036 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Surveying and Geoinformatics → course code SVG 208 | 2026-09-26 |
| EV-037 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Surveying and Geoinformatics → course code SVG 209 | 2026-09-26 |
| EV-038 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Surveying and Geoinformatics → course code SVG 302 | 2026-09-26 |
| EV-039 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Surveying and Geoinformatics → course code SVG 303 | 2026-09-26 |
| EV-040 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Surveying and Geoinformatics → course code SVG 304 | 2026-09-26 |
| EV-041 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Surveying and Geoinformatics → course code SVG 305 | 2026-09-26 |
| EV-042 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Surveying and Geoinformatics → course code SVG 306 | 2026-09-26 |
| EV-043 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Surveying and Geoinformatics → course code SVG 308 | 2026-09-26 |
| EV-044 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Surveying and Geoinformatics → course code SVG 401 | 2026-09-26 |
| EV-045 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Surveying and Geoinformatics → course code SVG 402 | 2026-09-26 |
| EV-046 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Surveying and Geoinformatics → course code SVG 503 | 2026-09-26 |
| EV-047 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Surveying and Geoinformatics → course code SVG 506 | 2026-09-26 |
| EV-048 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Surveying and Geoinformatics → course code SVG 508 | 2026-09-26 |
| EV-049 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf | arts_hum.txt → parsed row ordinal 37 → Drama/Dramatic Arts/Performing Arts | 2026-09-26 |
| EV-050 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Theatre Arts → course code THA 101 | 2026-09-26 |
| EV-051 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Theatre Arts → course code THA 102 | 2026-09-26 |
| EV-052 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Theatre Arts → course code THA 103 | 2026-09-26 |
| EV-053 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Theatre Arts → course code THA 104 | 2026-09-26 |
| EV-054 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Theatre Arts → course code THA 106 | 2026-09-26 |
| EV-055 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Theatre Arts → course code THA 201 | 2026-09-26 |
| EV-056 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Theatre Arts → course code THA 203 | 2026-09-26 |
| EV-057 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Theatre Arts → course code THA 204 | 2026-09-26 |
| EV-058 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Theatre Arts → course code THA 205 | 2026-09-26 |
| EV-059 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Theatre Arts → course code THA 206 | 2026-09-26 |
| EV-060 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Theatre Arts → course code THA 208 | 2026-09-26 |
| EV-061 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Theatre Arts → course code THA 209 | 2026-09-26 |
| EV-062 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Theatre Arts → course code THA 210 | 2026-09-26 |
| EV-063 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Theatre Arts → course code THA 301 | 2026-09-26 |
| EV-064 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Theatre Arts → course code THA 302 | 2026-09-26 |
| EV-065 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Theatre Arts → course code THA 303 | 2026-09-26 |
| EV-066 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Theatre Arts → course code THA 304 | 2026-09-26 |
| EV-067 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Theatre Arts → course code THA 306 | 2026-09-26 |
| EV-068 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Theatre Arts → course code THA 401 | 2026-09-26 |
| EV-069 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Theatre Arts → course code THA 402 | 2026-09-26 |
| EV-070 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Theatre Arts → course code THA 403 | 2026-09-26 |
| EV-071 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Theatre Arts → course code THA 404 | 2026-09-26 |
| EV-072 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Theatre Arts → course code THA 405 | 2026-09-26 |
| EV-073 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf | arts_hum.txt → parsed row ordinal 38 → Fine Art/Fine and Applied Arts | 2026-09-26 |
| EV-074 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Fine and Applied Arts → course code FAA 111 | 2026-09-26 |
| EV-075 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Fine and Applied Arts → course code FAA 121 | 2026-09-26 |
| EV-076 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Fine and Applied Arts → course code FAA 122 | 2026-09-26 |
| EV-077 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Fine and Applied Arts → course code FAA 131 | 2026-09-26 |
| EV-078 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Fine and Applied Arts → course code GST 112 | 2026-09-26 |
| EV-079 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Fine and Applied Arts → course code FAA 211 | 2026-09-26 |
| EV-080 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Fine and Applied Arts → course code FAA 212 | 2026-09-26 |
| EV-081 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Fine and Applied Arts → course code FAA 231 | 2026-09-26 |
| EV-082 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Fine and Applied Arts → course code FAA 232 | 2026-09-26 |
| EV-083 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Fine and Applied Arts → course code FAA 371 | 2026-09-26 |
| EV-084 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Fine and Applied Arts → course code FAA 311 | 2026-09-26 |
| EV-085 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Fine and Applied Arts → course code FAA 411 | 2026-09-26 |
| EV-086 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Fine and Applied Arts → course code FCD 351 | 2026-09-26 |
| EV-087 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf | arts_hum.txt → parsed row ordinal 40 → Hausa | 2026-09-26 |
| EV-088 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Hausa → course code GST 112 | 2026-09-26 |
| EV-089 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Hausa → course code HAU 101 | 2026-09-26 |
| EV-090 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Hausa → course code HAU 102 | 2026-09-26 |
| EV-091 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Hausa → course code HAU 103 | 2026-09-26 |
| EV-092 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Hausa → course code HAU 104 | 2026-09-26 |
| EV-093 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Hausa → course code HAU 105 | 2026-09-26 |
| EV-094 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Hausa → course code HAU 108 | 2026-09-26 |
| EV-095 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Hausa → course code HAU 109 | 2026-09-26 |
| EV-096 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Hausa → course code HAU 201 | 2026-09-26 |
| EV-097 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Hausa → course code HAU 203 | 2026-09-26 |
| EV-098 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Hausa → course code HAU 204 | 2026-09-26 |
| EV-099 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Hausa → course code HAU 205 | 2026-09-26 |
| EV-100 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Hausa → course code HAU 207 | 2026-09-26 |
| EV-101 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Hausa → course code HAU 209 | 2026-09-26 |
| EV-102 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Hausa → course code HAU 210 | 2026-09-26 |
| EV-103 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Hausa → course code HAU 301 | 2026-09-26 |
| EV-104 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Hausa → course code HAU 303 | 2026-09-26 |
| EV-105 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Hausa → course code HAUS 304 | 2026-09-26 |
| EV-106 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Hausa → course code HAU 307 | 2026-09-26 |
| EV-107 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Hausa → course code HAU 308 | 2026-09-26 |
| EV-108 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Hausa → course code HAU 401 | 2026-09-26 |
| EV-109 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Hausa → course code HAUS 402 | 2026-09-26 |
| EV-110 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Hausa → course code HAU 403 | 2026-09-26 |
| EV-111 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Hausa → course code HAU 405 | 2026-09-26 |
| EV-112 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Hausa → course code HAUS 406 | 2026-09-26 |
| EV-113 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf | arts_hum.txt → parsed row ordinal 41 → Igbo | 2026-09-26 |
| EV-114 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Igbo → course code GST 112 | 2026-09-26 |
| EV-115 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Igbo → course code IGB 201 | 2026-09-26 |
| EV-116 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Igbo → course code IGB 202 | 2026-09-26 |
| EV-117 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Igbo → course code IGB 203 | 2026-09-26 |
| EV-118 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Igbo → course code IGB 204 | 2026-09-26 |
| EV-119 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Igbo → course code IGB 205 | 2026-09-26 |
| EV-120 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Igbo → course code IGB 206 | 2026-09-26 |
| EV-121 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Igbo → course code IGB 301 | 2026-09-26 |
| EV-122 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Igbo → course code IGB 302 | 2026-09-26 |
| EV-123 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Igbo → course code IGB 303 | 2026-09-26 |
| EV-124 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Igbo → course code IGB 306 | 2026-09-26 |
| EV-125 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Igbo → course code IGB 404 | 2026-09-26 |
| EV-126 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf | arts_hum.txt → parsed row ordinal 42 → Modern Language and Translation | 2026-09-26 |
| EV-127 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages B.A (German) → course code GST 111 | 2026-09-26 |
| EV-128 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages B.A (German) → course code GER 108 | 2026-09-26 |
| EV-129 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages B.A (German) → course code GER 205 | 2026-09-26 |
| EV-130 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages B.A (German) → course code GER 209 | 2026-09-26 |
| EV-131 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages B.A (German) → course code GER 307 | 2026-09-26 |
| EV-132 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages B.A (German) → course code GER 402 | 2026-09-26 |
| EV-133 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages B.A (German) → course code GER 403 | 2026-09-26 |
| EV-134 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages B.A (German) → course code GER 404 | 2026-09-26 |
| EV-135 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages B.A (German) → course code GER 405 | 2026-09-26 |
| EV-136 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages B.A (German) → course code GER 406 | 2026-09-26 |
| EV-137 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf | arts_hum.txt → parsed row ordinal 43 → Geography and Environmental Studies | 2026-09-26 |
| EV-138 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Geography → course code GEO 101 | 2026-09-26 |
| EV-139 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Geography → course code GEO 102 | 2026-09-26 |
| EV-140 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Geography → course code GEO 103 | 2026-09-26 |
| EV-141 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Geography → course code GEO 105 | 2026-09-26 |
| EV-142 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Geography → course code GEO 201 | 2026-09-26 |
| EV-143 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Geography → course code GEO 202 | 2026-09-26 |
| EV-144 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Geography → course code GEO 203 | 2026-09-26 |
| EV-145 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Geography → course code GEO 205 | 2026-09-26 |
| EV-146 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Geography → course code GEO 206 | 2026-09-26 |
| EV-147 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Geography → course code GEO 301 | 2026-09-26 |
| EV-148 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Geography → course code GEO 304 | 2026-09-26 |
| EV-149 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Geography → course code GEO 305 | 2026-09-26 |
| EV-150 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Geography → course code GEO 307 | 2026-09-26 |
| EV-151 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Geography → course code GEO 308 | 2026-09-26 |
| EV-152 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Geography → course code GEO 401 | 2026-09-26 |
| EV-153 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Geography → course code GEO 402 | 2026-09-26 |
| EV-154 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Geography → course code GEO 404 | 2026-09-26 |
| EV-155 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Geography → course code GEO 405 | 2026-09-26 |
| EV-156 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Geography → course code GEO 406 | 2026-09-26 |
| EV-157 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Geography → course code IDC407 | 2026-09-26 |
| EV-158 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Geography → course code IDM 308 | 2026-09-26 |
| EV-159 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Geography → course code IDT 505 | 2026-09-26 |
| EV-160 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf | agriculture.txt → parsed row ordinal 24 → Crop Protection | 2026-09-26 |
| EV-161 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Crop Science → course code AGG 102 | 2026-09-26 |
| EV-162 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Crop Science → course code AGR 201 | 2026-09-26 |
| EV-163 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Crop Science → course code AGR 203 | 2026-09-26 |
| EV-164 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Crop Science → course code CPS 205 | 2026-09-26 |
| EV-165 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Crop Science → course code CPS 301 | 2026-09-26 |
| EV-166 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Crop Science → course code CPS 302 | 2026-09-26 |
| EV-167 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Crop Science → course code CPS 303 | 2026-09-26 |
| EV-168 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Crop Science → course code CPS 304 | 2026-09-26 |
| EV-169 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Crop Science → course code CPS 306 | 2026-09-26 |
| EV-170 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Crop Science → course code CPS 401 | 2026-09-26 |
| EV-171 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Crop Science → course code CPS 404 | 2026-09-26 |
| EV-172 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Crop Science → course code CPS 406 | 2026-09-26 |
| EV-173 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Crop Science → course code CPS 407 | 2026-09-26 |
| EV-174 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf | agriculture.txt → parsed row ordinal 23 → Animal Physiology | 2026-09-26 |
| EV-175 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Animal Science → course code BIO 107 | 2026-09-26 |
| EV-176 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Animal Science → course code AGR 204 | 2026-09-26 |
| EV-177 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Animal Science → course code ANS 201 | 2026-09-26 |
| EV-178 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Animal Science → course code ANS 202 | 2026-09-26 |
| EV-179 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Animal Science → course code ANS 302 | 2026-09-26 |
| EV-180 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Animal Science → course code ANS 303 | 2026-09-26 |
| EV-181 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Animal Science → course code ANS 304 | 2026-09-26 |
| EV-182 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Animal Science → course code ANS 305 | 2026-09-26 |
| EV-183 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Animal Science → course code ANS 306 | 2026-09-26 |
| EV-184 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Animal Science → course code ANS 308 | 2026-09-26 |
| EV-185 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Animal Science → course code ANS 403 | 2026-09-26 |
| EV-186 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Animal Science → course code ANS 405 | 2026-09-26 |
| EV-187 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Animal Science → course code ANS 406 | 2026-09-26 |
| EV-188 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Animal Science → course code ANS 407 | 2026-09-26 |
| EV-189 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Animal Science → course code ANS 408 | 2026-09-26 |
| EV-190 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf | agriculture.txt → parsed row ordinal 22 → Livestock Production Technology | 2026-09-26 |
| EV-191 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Animal Science → course code AGG 102 | 2026-09-26 |
| EV-192 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Animal Science → course code AGG 112 | 2026-09-26 |
| EV-193 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Animal Science → course code BIO 101 | 2026-09-26 |
| EV-194 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Animal Science → course code AGR 201 | 2026-09-26 |
| EV-195 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Animal Science → course code AGR 202 | 2026-09-26 |
| EV-196 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Animal Science → course code AGR 203 | 2026-09-26 |
| EV-197 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Animal Science → course code ANS 402 | 2026-09-26 |
| EV-198 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Animal Science → course code ANS 409 | 2026-09-26 |
| EV-199 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf | agriculture.txt → parsed row ordinal 21 → Pasture & Range Management | 2026-09-26 |
| EV-200 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf | agriculture.txt → parsed row ordinal 26 → Farm Management & Agric. Extension | 2026-09-26 |
| EV-201 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Agricultural Extension → course code AGG 102 | 2026-09-26 |
| EV-202 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Agricultural Extension → course code AGG 112 | 2026-09-26 |
| EV-203 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Agricultural Extension → course code AGE 202 | 2026-09-26 |
| EV-204 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Agricultural Extension → course code AGX 204 | 2026-09-26 |
| EV-205 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Agricultural Extension → course code AGX 205 | 2026-09-26 |
| EV-206 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Agricultural Extension → course code ANS 204 | 2026-09-26 |
| EV-207 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Agricultural Extension → course code AGX 206 | 2026-09-26 |
| EV-208 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Agricultural Extension → course code ANS 303 | 2026-09-26 |
| EV-209 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Agricultural Extension → course code AGX 305 | 2026-09-26 |
| EV-210 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Agricultural Extension → course code AGX 313 | 2026-09-26 |
| EV-211 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Agricultural Extension → course code AGX 301 | 2026-09-26 |
| EV-212 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Agricultural Extension → course code AGX 303 | 2026-09-26 |
| EV-213 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Agricultural Extension → course code AGX 304 | 2026-09-26 |
| EV-214 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Agricultural Extension → course code AGR 399 | 2026-09-26 |
| EV-215 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Agricultural Extension → course code AGE 404 | 2026-09-26 |
| EV-216 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Agricultural Extension → course code AGX 402 | 2026-09-26 |
| EV-217 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Agricultural Extension → course code AGX 403 | 2026-09-26 |
| EV-218 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf | agriculture.txt → parsed row ordinal 27 → Eco-Tourism and Wildlife Management | 2026-09-26 |
| EV-219 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Forest Resources and Wildlife Management → course code AGG 102 | 2026-09-26 |
| EV-220 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Forest Resources and Wildlife Management → course code AGG 112 | 2026-09-26 |
| EV-221 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Forest Resources and Wildlife Management → course code PHY 101 | 2026-09-26 |
| EV-222 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Forest Resources and Wildlife Management → course code PHY 108 | 2026-09-26 |
| EV-223 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Forest Resources and Wildlife Management → course code FWM 102 | 2026-09-26 |
| EV-224 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Forest Resources and Wildlife Management → course code AGR 202 | 2026-09-26 |
| EV-225 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Forest Resources and Wildlife Management → course code FWM 201 | 2026-09-26 |
| EV-226 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Forest Resources and Wildlife Management → course code FWM 202 | 2026-09-26 |
| EV-227 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Forest Resources and Wildlife Management → course code FWM 206 | 2026-09-26 |
| EV-228 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Forest Resources and Wildlife Management → course code GST 312 | 2026-09-26 |
| EV-229 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Forest Resources and Wildlife Management → course code FWM 301 | 2026-09-26 |
| EV-230 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Forest Resources and Wildlife Management → course code FWM 304 | 2026-09-26 |
| EV-231 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Forest Resources and Wildlife Management → course code FWM 305 | 2026-09-26 |
| EV-232 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Forest Resources and Wildlife Management → course code FWM 307 | 2026-09-26 |
| EV-233 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Forest Resources and Wildlife Management → course code FWM 308 | 2026-09-26 |
| EV-234 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Forest Resources and Wildlife Management → course code FWM 309 | 2026-09-26 |
| EV-235 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Forest Resources and Wildlife Management → course code FWM 402 | 2026-09-26 |
| EV-236 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Forest Resources and Wildlife Management → course code FWM 403 | 2026-09-26 |
| EV-237 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Forest Resources and Wildlife Management → course code FWM 404 | 2026-09-26 |
| EV-238 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Forest Resources and Wildlife Management → course code FWM 406 | 2026-09-26 |
| EV-239 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Forest Resources and Wildlife Management → course code FWM 407 | 2026-09-26 |
| EV-240 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Forest Resources and Wildlife Management → course code FWM 408 | 2026-09-26 |
| EV-241 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf | agriculture.txt → parsed row ordinal 28 → Environmental Management and Technology | 2026-09-26 |
| EV-242 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Environmental Management → course code EVM 101 | 2026-09-26 |
| EV-243 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Environmental Management → course code EVM102 | 2026-09-26 |
| EV-244 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Environmental Management → course code EVM 202 | 2026-09-26 |
| EV-245 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Environmental Management → course code EVM 203 | 2026-09-26 |
| EV-246 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Environmental Management → course code EVM 206 | 2026-09-26 |
| EV-247 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Environmental Management → course code EVM 208 | 2026-09-26 |
| EV-248 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Environmental Management → course code EVM302 | 2026-09-26 |
| EV-249 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Environmental Management → course code EVM304 | 2026-09-26 |
| EV-250 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Environmental Management → course code EVM306 | 2026-09-26 |
| EV-251 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Environmental Management → course code EVM308 | 2026-09-26 |
| EV-252 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Environmental Management → course code EVM313 | 2026-09-26 |
| EV-253 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Environmental Management → course code EVM315 | 2026-09-26 |
| EV-254 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Environmental Management → course code EVM401 | 2026-09-26 |
| EV-255 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Environmental Management → course code EVM402 | 2026-09-26 |
| EV-256 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Environmental Management → course code EVM405 | 2026-09-26 |
| EV-257 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Environmental Management → course code EVM406 | 2026-09-26 |
| EV-258 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Environmental Management → course code EVM411 | 2026-09-26 |
| EV-259 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Environmental Management → course code EVM412 | 2026-09-26 |
| EV-260 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Environmental Management → course code EVM414 | 2026-09-26 |
| EV-261 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Environmental Management → course code EVM507 | 2026-09-26 |
| EV-262 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Environmental Management → course code EVM508 | 2026-09-26 |
| EV-263 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Environmental Management → course code EVM510 | 2026-09-26 |
| EV-264 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Environmental Management → course code EVM511 | 2026-09-26 |
| EV-265 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Environmental Management → course code EVM515 | 2026-09-26 |
| EV-266 | none | education.txt → parsed row ordinal 10 → Statistics Education | 2026-09-26 |
| EV-267 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf | education.json → Mathematics → course code EDU 400 | 2026-09-26 |
| EV-268 | none | education.txt → parsed row ordinal 11 → Sport Management (Education) | 2026-09-26 |
| EV-269 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code HKS 243 | 2026-09-26 |
| EV-270 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code HKS 245 | 2026-09-26 |
| EV-271 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code HKS 341 | 2026-09-26 |
| EV-272 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code HKS 342 | 2026-09-26 |
| EV-273 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code HKS 345 | 2026-09-26 |
| EV-274 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code HKS 440 | 2026-09-26 |
| EV-275 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code HKS 442 | 2026-09-26 |
| EV-276 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code HKS 447 | 2026-09-26 |
| EV-277 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code EDU 425 | 2026-09-26 |
| EV-278 | none | external/custom course HKS 243 — Curriculum Planning in Human Kinetics and Sports Programmes | 2026-09-26 |
| EV-279 | none | external/custom course HKS 245 — Methods and Resources for Conduct of Human Kinetics Programme in Schools | 2026-09-26 |
| EV-280 | none | external/custom course HKS 341 — Research Methods in Human Kinetics and Sports Studies | 2026-09-26 |
| EV-281 | none | external/custom course HKS 342 — Administration of Community Recreation and Tourism | 2026-09-26 |
| EV-282 | none | external/custom course HKS 345 — Planning and Management of Intramural and Interscholastic Sports Programme | 2026-09-26 |
| EV-283 | none | external/custom course HKS 440 — Planning and Administration of Competitive Sports | 2026-09-26 |
| EV-284 | none | external/custom course HKS 442 — Supervision in Human Kinetic and Sports Programme | 2026-09-26 |
| EV-285 | none | external/custom course HKS 447 — Sports Marketing and Sponsorship | 2026-09-26 |
| EV-286 | none | external/custom course EDU 425 — Professional Teaching Practice Experience II | 2026-09-26 |
| EV-287 | none | education.txt → parsed row ordinal 12 → Transport Planning and Management | 2026-09-26 |
| EV-288 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 101 | 2026-09-26 |
| EV-289 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 103 | 2026-09-26 |
| EV-290 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code AMS 101 | 2026-09-26 |
| EV-291 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 102 | 2026-09-26 |
| EV-292 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 104 | 2026-09-26 |
| EV-293 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 201 | 2026-09-26 |
| EV-294 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 204 | 2026-09-26 |
| EV-295 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 213 | 2026-09-26 |
| EV-296 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 206 | 2026-09-26 |
| EV-297 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 211 | 2026-09-26 |
| EV-298 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code ENT 312 | 2026-09-26 |
| EV-299 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 303 | 2026-09-26 |
| EV-300 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 305 | 2026-09-26 |
| EV-301 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 307 | 2026-09-26 |
| EV-302 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 309 | 2026-09-26 |
| EV-303 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 311 | 2026-09-26 |
| EV-304 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 312 | 2026-09-26 |
| EV-305 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 314 | 2026-09-26 |
| EV-306 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 317 | 2026-09-26 |
| EV-307 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 318 | 2026-09-26 |
| EV-308 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 319 | 2026-09-26 |
| EV-309 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 320 | 2026-09-26 |
| EV-310 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 322 | 2026-09-26 |
| EV-311 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 324 | 2026-09-26 |
| EV-312 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 400/401 | 2026-09-26 |
| EV-313 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 405 | 2026-09-26 |
| EV-314 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 409 | 2026-09-26 |
| EV-315 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 410 | 2026-09-26 |
| EV-316 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 412 | 2026-09-26 |
| EV-317 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 418 | 2026-09-26 |
| EV-318 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 419 | 2026-09-26 |
| EV-319 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 422 | 2026-09-26 |
| EV-320 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 424 | 2026-09-26 |
| EV-321 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 426 | 2026-09-26 |
| EV-322 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 427 | 2026-09-26 |
| EV-323 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Transport Management → course code TPM 429 | 2026-09-26 |

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
- `data/career-mapping/_audit/jamb_ccmas_final_verification_rows_281_420_2026-09-26_013.md`
- `data/career-mapping/_audit/jamb_ccmas_final_verification_rows_281_420_2026-09-26_014.md`
- `data/career-mapping/_audit/jamb_ccmas_source_issue_queue_2026-09-26_001.json`
- `data/career-mapping/_audit/jamb_ccmas_source_issue_queue_2026-09-26_001.md`
- `data/career-mapping/_audit/jamb_curriculum_scopes_2026-08-17.json`
- `data/career-mapping/_audit/jamb_anomaly_inventory_2026-09-26.json`
- `data/career-mapping/_audit/jamb_offering_context_inventory_2026-09-25.json`
- `data/career-mapping/_audit/ccmas_extraction_anomaly_inventory_2026-09-26.json`


Closed work intentionally not reopened: French Arts anchor correction; Film and Video Studies Social/Management occurrence addition; recorded CCMAS page-header repairs; CAM424 equipment-spill repair; DTS498/CSC432 cross-reference repair; and replacement-character normalization classified as encoding-only.

## Disposition and resume boundary

This increment reconciles the current **401–420** queue against the prior row-level evidence. It does **not** close any identity: scope evidence, exact offering context, selected-course fidelity, item-level citations, and external/custom provenance remain open where listed. It performs no downstream domain/subgroup/role audit.

The next bounded increment is **identities 421–420**, maximum **20 identities/packages**, and must save its own append-only JSON/Markdown checkpoint before proceeding.

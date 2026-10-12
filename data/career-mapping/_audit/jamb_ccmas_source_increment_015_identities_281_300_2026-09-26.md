# JAMB–CCMAS source increment 015 — identities 281–300

**Audit date:** 2026-09-26 (Africa/Lagos)  
**Mode:** bounded reconciliation after checkpoint 003; append-only  
**Assigned lane:** JAMB identity/offering and CCMAS/external source integrity only  
**Write boundary:** no shared source, mapping, scope, seed, SQL, UI, downstream taxonomy, domain, subgroup, or role file was edited.

## Exact coverage inspected

- Canonical JAMB identities: **20/20**, rows **281–300**.
- Current queue records: **20 identity rows**, **66 current issue records**.
- Current selected-course occurrences represented by those rows: **349**.
- Parsed offering occurrences represented by those rows: **24**.
- CCMAS/external components inspected through the current records: **Arts::English Language and Literature, Arts::History/History and Diplomatic Studies, Arts::Linguistics, Arts::Modern European Languages (Russian), Arts::Modern European Languages B.A (French), Arts::Modern European Languages B.A (German), Arts::Music, Arts::Philosophy, Arts::Religious Studies, Communication and Media Studies::MASS COMMUNICATION — P12, P13, P14, Social Sciences::Economics, Social Sciences::International Relations, Social Sciences::Peace Studies and Conflict Resolution**.
- Prior row-level evidence was read first from the existing final-gap checkpoint(s) for rows **281–300**; already-verified facts were not re-researched.

## Records inspected

| Row | JAMB identity | Component reference(s) | Current scope state | Selected courses | Offering records | Current issue IDs |
|---:|---|---|---|---:|---:|---|
| 281 | English and Literary Studies | Arts::English Language and Literature | partial_scope_reviewed | 32 | 1 | SRC-00863, SRC-00864, SRC-00865, SRC-00866 |
| 282 | English Studies | Arts::English Language and Literature | partial_scope_reviewed | 23 | 1 | SRC-00867, SRC-00868, SRC-00869, SRC-00870 |
| 283 | Literature in English | Arts::English Language and Literature | partial_scope_reviewed | 35 | 1 | SRC-00871, SRC-00872, SRC-00873, SRC-00874 |
| 284 | French | Arts::Modern European Languages B.A (French) | full_scope_review_required | 40 | 1 | SRC-00875, SRC-00876, SRC-00877 |
| 285 | Portuguese/English | Arts::English Language and Literature | partial_scope_review_required | 7 | 1 | SRC-00878, SRC-00879, SRC-00880, SRC-00881 |
| 286 | German | Arts::Modern European Languages B.A (German) | partial_scope_reviewed | 22 | 1 | SRC-00882, SRC-00883, SRC-00884, SRC-00885 |
| 287 | French and German/Russian | Arts::Modern European Languages B.A (French) | partial_scope_reviewed | 27 | 1 | SRC-00886, SRC-00887, SRC-00888, SRC-00889 |
| 288 | International Studies and | Social Sciences::International Relations | partial_scope_reviewed | 23 | 1 | SRC-00890, SRC-00891, SRC-00892 |
| 289 | History | Arts::History/History and Diplomatic Studies | partial_scope_reviewed | 19 | 1 | SRC-00893, SRC-00894, SRC-00895, SRC-00896 |
| 290 | History and Strategic Studies | Arts::History/History and Diplomatic Studies, Social Sciences::International Relations | combined_scope_review_required | 0 | 1 | SRC-00897, SRC-00898, SRC-00899, SRC-00900 |
| 291 | Economics | Social Sciences::Economics | full | 0 | 4 | SRC-00901, SRC-00902 |
| 292 | African and Asian Studies | Arts::History/History and Diplomatic Studies | partial_scope_reviewed | 4 | 1 | SRC-00903, SRC-00904, SRC-00905, SRC-00906 |
| 293 | Linguistics | Arts::Linguistics | full | 0 | 1 | SRC-00907, SRC-00908 |
| 294 | Kanuri | Arts::Linguistics | partial_scope_reviewed | 27 | 1 | SRC-00909, SRC-00910, SRC-00911, SRC-00912 |
| 295 | Russian with French/German | Arts::Modern European Languages (Russian) | partial_scope_reviewed | 35 | 1 | SRC-00913, SRC-00914, SRC-00915, SRC-00916 |
| 296 | Mass Communication | Communication and Media Studies::MASS COMMUNICATION — P12, P13, P14 | partial_scope_reviewed | 35 | 2 | SRC-00917, SRC-00918, SRC-00919, SRC-00920 |
| 297 | Music | Arts::Music | full | 0 | 1 | SRC-00921, SRC-00922 |
| 298 | Peace Studies | Social Sciences::Peace Studies and Conflict Resolution | partial_scope_reviewed | 20 | 1 | SRC-00923, SRC-00924, SRC-00925 |
| 299 | Philosophy | Arts::Philosophy | full | 0 | 1 | SRC-00926, SRC-00927 |
| 300 | Religious Studies | Arts::Religious Studies | full | 0 | 1 | SRC-00928, SRC-00929 |

## Current issue counts

- Confirmed gaps still open: **64**.
- Candidate issues still open: **3**.
- New issue classes discovered in this reconciliation: **0**.
- Closed findings reopened: **0**.
- Distinct exact evidence references captured: **275**.

By issue type/status:

- `combined_scope_zero_courses` / `confirmed_gap`: 1
- `named_facet_unrepresented` / `confirmed_gap`: 1
- `offering_context_unverified` / `confirmed_gap`: 20
- `scope_evidence_missing` / `confirmed_gap`: 18
- `scope_semantic_review_required` / `candidate`: 3
- `selected_course_citation_incomplete` / `confirmed_gap`: 13
- `selected_course_content_or_outcome_gap` / `confirmed_gap`: 11

## Confirmed and candidate issue ledger

The following are current open records carried from the source issue queue. They are not claims that every record below is an academic-content defect; provenance, offering-context, and citation gaps remain distinct from content defects.

| Issue | Row | Status | Type | Evidence refs | Recommendation |
|---|---:|---|---|---|---|
| SRC-00863 | 281 | confirmed_gap | scope_evidence_missing | EV-001 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00864 | 281 | confirmed_gap | offering_context_unverified | EV-001 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00865 | 281 | confirmed_gap | selected_course_citation_incomplete | EV-002, EV-003, EV-004, EV-005, EV-006, EV-007, EV-008, EV-009, EV-010, EV-011, EV-012, EV-013, EV-014, EV-015, EV-016, EV-017, EV-018, EV-019, EV-020, EV-021, EV-022, EV-023, EV-024, EV-025, EV-026, EV-027, EV-028, EV-029, EV-030, EV-031, EV-032, EV-033 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00866 | 281 | confirmed_gap | selected_course_content_or_outcome_gap | EV-002, EV-003, EV-004, EV-005, EV-006, EV-007, EV-008, EV-009, EV-010, EV-011, EV-012, EV-013, EV-014, EV-015, EV-016, EV-017, EV-018, EV-019, EV-020, EV-021, EV-022, EV-023, EV-024, EV-025, EV-026, EV-027, EV-028, EV-029, EV-030, EV-031, EV-032, EV-033 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00867 | 282 | confirmed_gap | scope_evidence_missing | EV-034 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00868 | 282 | confirmed_gap | offering_context_unverified | EV-034 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00869 | 282 | confirmed_gap | selected_course_citation_incomplete | EV-002, EV-003, EV-004, EV-005, EV-006, EV-007, EV-008, EV-009, EV-010, EV-011, EV-012, EV-013, EV-014, EV-015, EV-016, EV-018, EV-019, EV-020, EV-021, EV-022, EV-023, EV-027, EV-032 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00870 | 282 | confirmed_gap | selected_course_content_or_outcome_gap | EV-002, EV-003, EV-004, EV-005, EV-006, EV-007, EV-008, EV-009, EV-010, EV-011, EV-012, EV-013, EV-014, EV-015, EV-016, EV-018, EV-019, EV-020, EV-021, EV-022, EV-023, EV-027, EV-032 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00871 | 283 | confirmed_gap | scope_evidence_missing | EV-035 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00872 | 283 | confirmed_gap | offering_context_unverified | EV-035 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00873 | 283 | confirmed_gap | selected_course_citation_incomplete | EV-002, EV-003, EV-004, EV-005, EV-006, EV-007, EV-008, EV-009, EV-010, EV-011, EV-012, EV-013, EV-014, EV-015, EV-016, EV-017, EV-018, EV-019, EV-020, EV-021, EV-022, EV-023, EV-024, EV-025, EV-026, EV-027, EV-031, EV-032, EV-033, EV-036, EV-037, EV-038, EV-039, EV-040, EV-041 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00874 | 283 | confirmed_gap | selected_course_content_or_outcome_gap | EV-002, EV-003, EV-004, EV-005, EV-006, EV-007, EV-008, EV-009, EV-010, EV-011, EV-012, EV-013, EV-014, EV-015, EV-016, EV-017, EV-018, EV-019, EV-020, EV-021, EV-022, EV-023, EV-024, EV-025, EV-026, EV-027, EV-031, EV-032, EV-033, EV-036, EV-037, EV-038, EV-039, EV-040, EV-041 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00875 | 284 | confirmed_gap | offering_context_unverified | EV-042 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00876 | 284 | confirmed_gap | selected_course_content_or_outcome_gap | EV-043, EV-044 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00877 | 284 | candidate | scope_semantic_review_required | EV-043, EV-044 | Reconcile the exact offering context, each named component, selected courses/outcomes, and supported student-facing status; a review label is not evidence of correctness. |
| SRC-00878 | 285 | confirmed_gap | offering_context_unverified | EV-045 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00879 | 285 | confirmed_gap | selected_course_citation_incomplete | EV-003, EV-004, EV-005, EV-017, EV-018, EV-019, EV-046 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00880 | 285 | confirmed_gap | named_facet_unrepresented | EV-047, EV-048, EV-049, EV-050, EV-051 | Find the matching CCMAS component or authoritative provider-specific external curriculum, then verify its courses/outcomes before considering any combined scope complete. |
| SRC-00881 | 285 | candidate | scope_semantic_review_required | EV-047, EV-048, EV-049, EV-050, EV-051 | Reconcile the exact offering context, each named component, selected courses/outcomes, and supported student-facing status; a review label is not evidence of correctness. |
| SRC-00882 | 286 | confirmed_gap | scope_evidence_missing | EV-052 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00883 | 286 | confirmed_gap | offering_context_unverified | EV-052 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00884 | 286 | confirmed_gap | selected_course_citation_incomplete | EV-053, EV-054, EV-055, EV-056, EV-057, EV-058, EV-059, EV-060, EV-061, EV-062, EV-063, EV-064, EV-065, EV-066, EV-067, EV-068, EV-069, EV-070, EV-071, EV-072, EV-073, EV-074 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00885 | 286 | confirmed_gap | selected_course_content_or_outcome_gap | EV-053, EV-054, EV-055, EV-056, EV-057, EV-058, EV-059, EV-060, EV-061, EV-062, EV-063, EV-064, EV-065, EV-066, EV-067, EV-068, EV-069, EV-070, EV-071, EV-072, EV-073, EV-074 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00886 | 287 | confirmed_gap | scope_evidence_missing | EV-075 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00887 | 287 | confirmed_gap | offering_context_unverified | EV-075 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00888 | 287 | confirmed_gap | selected_course_citation_incomplete | EV-076, EV-077, EV-078, EV-079, EV-080, EV-081, EV-082, EV-083, EV-084, EV-085, EV-086, EV-087, EV-088, EV-089, EV-090, EV-091, EV-092, EV-093, EV-094, EV-095, EV-096, EV-097, EV-098, EV-099, EV-100, EV-101, EV-102 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00889 | 287 | confirmed_gap | selected_course_content_or_outcome_gap | EV-076, EV-077, EV-078, EV-079, EV-080, EV-081, EV-082, EV-083, EV-084, EV-085, EV-086, EV-087, EV-088, EV-089, EV-090, EV-091, EV-092, EV-093, EV-094, EV-095, EV-096, EV-097, EV-098, EV-099, EV-100, EV-101, EV-102 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00890 | 288 | confirmed_gap | scope_evidence_missing | EV-103 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00891 | 288 | confirmed_gap | offering_context_unverified | EV-103 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00892 | 288 | confirmed_gap | selected_course_citation_incomplete | EV-104, EV-105, EV-106, EV-107, EV-108, EV-109, EV-110, EV-111, EV-112, EV-113, EV-114, EV-115, EV-116, EV-117, EV-118, EV-119, EV-120, EV-121, EV-122, EV-123, EV-124, EV-125, EV-126 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00893 | 289 | confirmed_gap | scope_evidence_missing | EV-127 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00894 | 289 | confirmed_gap | offering_context_unverified | EV-127 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00895 | 289 | confirmed_gap | selected_course_citation_incomplete | EV-128, EV-129, EV-130, EV-131, EV-132, EV-133, EV-134, EV-135, EV-136, EV-137, EV-138, EV-139, EV-140, EV-141, EV-142, EV-143, EV-144, EV-145, EV-146 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00896 | 289 | confirmed_gap | selected_course_content_or_outcome_gap | EV-128, EV-129, EV-130, EV-131, EV-132, EV-133, EV-134, EV-135, EV-136, EV-137, EV-138, EV-139, EV-140, EV-141, EV-142, EV-143, EV-144, EV-145, EV-146 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00897 | 290 | confirmed_gap | scope_evidence_missing | EV-147 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00898 | 290 | confirmed_gap | offering_context_unverified | EV-147 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00899 | 290 | confirmed_gap | combined_scope_zero_courses | EV-147 | Build a bounded component-by-component evidence bundle; do not infer a union from the title or mark the programme unavailable solely because the local scope is empty. |
| SRC-00900 | 290 | candidate | scope_semantic_review_required | EV-147 | Reconcile the exact offering context, each named component, selected courses/outcomes, and supported student-facing status; a review label is not evidence of correctness. |
| SRC-00901 | 291 | confirmed_gap | scope_evidence_missing | EV-148, EV-149, EV-150, EV-151 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00902 | 291 | confirmed_gap | offering_context_unverified | EV-148, EV-149, EV-150, EV-151 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00903 | 292 | confirmed_gap | scope_evidence_missing | EV-152 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00904 | 292 | confirmed_gap | offering_context_unverified | EV-152 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00905 | 292 | confirmed_gap | selected_course_citation_incomplete | EV-136, EV-137, EV-153, EV-154 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00906 | 292 | confirmed_gap | selected_course_content_or_outcome_gap | EV-136, EV-137, EV-153, EV-154 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00907 | 293 | confirmed_gap | scope_evidence_missing | EV-155 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00908 | 293 | confirmed_gap | offering_context_unverified | EV-155 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00909 | 294 | confirmed_gap | scope_evidence_missing | EV-156 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00910 | 294 | confirmed_gap | offering_context_unverified | EV-156 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00911 | 294 | confirmed_gap | selected_course_citation_incomplete | EV-157, EV-158, EV-159, EV-160, EV-161, EV-162, EV-163, EV-164, EV-165, EV-166, EV-167, EV-168, EV-169, EV-170, EV-171, EV-172, EV-173, EV-174, EV-175, EV-176, EV-177, EV-178, EV-179, EV-180, EV-181, EV-182, EV-183 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00912 | 294 | confirmed_gap | selected_course_content_or_outcome_gap | EV-157, EV-158, EV-159, EV-160, EV-161, EV-162, EV-163, EV-164, EV-165, EV-166, EV-167, EV-168, EV-169, EV-170, EV-171, EV-172, EV-173, EV-174, EV-175, EV-176, EV-177, EV-178, EV-179, EV-180, EV-181, EV-182, EV-183 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00913 | 295 | confirmed_gap | scope_evidence_missing | EV-184 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00914 | 295 | confirmed_gap | offering_context_unverified | EV-184 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00915 | 295 | confirmed_gap | selected_course_citation_incomplete | EV-185, EV-186, EV-187, EV-188, EV-189, EV-190, EV-191, EV-192, EV-193, EV-194, EV-195, EV-196, EV-197, EV-198, EV-199, EV-200, EV-201, EV-202, EV-203, EV-204, EV-205, EV-206, EV-207, EV-208, EV-209, EV-210, EV-211, EV-212, EV-213, EV-214 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00916 | 295 | confirmed_gap | selected_course_content_or_outcome_gap | EV-185, EV-186, EV-187, EV-188, EV-189, EV-190, EV-191, EV-192, EV-193, EV-194, EV-195, EV-196, EV-197, EV-198, EV-199, EV-200, EV-201, EV-202, EV-203, EV-204, EV-205, EV-206, EV-207, EV-208, EV-209, EV-210, EV-211, EV-212, EV-213, EV-214 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00917 | 296 | confirmed_gap | scope_evidence_missing | EV-215, EV-216 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00918 | 296 | confirmed_gap | offering_context_unverified | EV-215, EV-216 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00919 | 296 | confirmed_gap | selected_course_citation_incomplete | EV-217, EV-218, EV-219, EV-220, EV-221, EV-222, EV-223, EV-224, EV-225, EV-226, EV-227, EV-228, EV-229, EV-230, EV-231, EV-232, EV-233, EV-234, EV-235, EV-236, EV-237, EV-238, EV-239, EV-240, EV-241, EV-242, EV-243, EV-244, EV-245, EV-246, EV-247, EV-248, EV-249, EV-250, EV-251 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00920 | 296 | confirmed_gap | selected_course_content_or_outcome_gap | EV-217, EV-218, EV-219, EV-220, EV-221, EV-222, EV-223, EV-224, EV-225, EV-226, EV-227, EV-228, EV-229, EV-230, EV-231, EV-232, EV-233, EV-234, EV-235, EV-236, EV-237, EV-238, EV-239, EV-240, EV-241, EV-242, EV-243, EV-244, EV-245, EV-246, EV-247, EV-248, EV-249, EV-250, EV-251 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00921 | 297 | confirmed_gap | scope_evidence_missing | EV-252 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00922 | 297 | confirmed_gap | offering_context_unverified | EV-252 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00923 | 298 | confirmed_gap | scope_evidence_missing | EV-253 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00924 | 298 | confirmed_gap | offering_context_unverified | EV-253 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00925 | 298 | confirmed_gap | selected_course_citation_incomplete | EV-254, EV-255, EV-256, EV-257, EV-258, EV-259, EV-260, EV-261, EV-262, EV-263, EV-264, EV-265, EV-266, EV-267, EV-268, EV-269, EV-270, EV-271, EV-272, EV-273 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00926 | 299 | confirmed_gap | scope_evidence_missing | EV-274 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00927 | 299 | confirmed_gap | offering_context_unverified | EV-274 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00928 | 300 | confirmed_gap | scope_evidence_missing | EV-275 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00929 | 300 | confirmed_gap | offering_context_unverified | EV-275 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |

## Exact evidence URLs, locators, and access dates

### Structured evidence references attached to issue records

| Ref | URL | Exact locator | Accessed |
|---|---|---|---|
| EV-001 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf | arts_hum.txt → parsed row ordinal 9 → English and Literary Studies | 2026-09-26 |
| EV-002 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → English Language and Literature → course code GST 111 | 2026-09-26 |
| EV-003 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → English Language and Literature → course code ENG 101 | 2026-09-26 |
| EV-004 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → English Language and Literature → course code ENG 102 | 2026-09-26 |
| EV-005 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → English Language and Literature → course code ENG 103 | 2026-09-26 |
| EV-006 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → English Language and Literature → course code ENG 202 | 2026-09-26 |
| EV-007 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → English Language and Literature → course code ENG 203 | 2026-09-26 |
| EV-008 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → English Language and Literature → course code ENG 204 | 2026-09-26 |
| EV-009 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → English Language and Literature → course code ENG 205 | 2026-09-26 |
| EV-010 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → English Language and Literature → course code ENG 207 | 2026-09-26 |
| EV-011 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → English Language and Literature → course code ENG 211 | 2026-09-26 |
| EV-012 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → English Language and Literature → course code ENG 302 | 2026-09-26 |
| EV-013 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → English Language and Literature → course code ENG 305 | 2026-09-26 |
| EV-014 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → English Language and Literature → course code ENG 306 | 2026-09-26 |
| EV-015 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → English Language and Literature → course code ENG 405 | 2026-09-26 |
| EV-016 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → English Language and Literature → course code ENG 409 | 2026-09-26 |
| EV-017 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → English Language and Literature → course code LIT 104 | 2026-09-26 |
| EV-018 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → English Language and Literature → course code LIT 105 | 2026-09-26 |
| EV-019 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → English Language and Literature → course code LIT 106 | 2026-09-26 |
| EV-020 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → English Language and Literature → course code LIT 201 | 2026-09-26 |
| EV-021 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → English Language and Literature → course code LIT 202 | 2026-09-26 |
| EV-022 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → English Language and Literature → course code LIT 203 | 2026-09-26 |
| EV-023 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → English Language and Literature → course code LIT 205 | 2026-09-26 |
| EV-024 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → English Language and Literature → course code LIT 208 | 2026-09-26 |
| EV-025 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → English Language and Literature → course code LIT 301 | 2026-09-26 |
| EV-026 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → English Language and Literature → course code LIT 304 | 2026-09-26 |
| EV-027 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → English Language and Literature → course code LIT306 | 2026-09-26 |
| EV-028 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → English Language and Literature → course code LIT 308 | 2026-09-26 |
| EV-029 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → English Language and Literature → course code LIT 310 | 2026-09-26 |
| EV-030 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → English Language and Literature → course code LIT 401 | 2026-09-26 |
| EV-031 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → English Language and Literature → course code LIT 402 | 2026-09-26 |
| EV-032 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → English Language and Literature → course code LIT 403 | 2026-09-26 |
| EV-033 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → English Language and Literature → course code LIT 421 | 2026-09-26 |
| EV-034 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf | arts_hum.txt → parsed row ordinal 10 → English Studies | 2026-09-26 |
| EV-035 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf | arts_hum.txt → parsed row ordinal 11 → Literature in English | 2026-09-26 |
| EV-036 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → English Language and Literature → course code ENG 402 | 2026-09-26 |
| EV-037 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → English Language and Literature → course code LIT 204 | 2026-09-26 |
| EV-038 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → English Language and Literature → course code LIT 207 | 2026-09-26 |
| EV-039 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → English Language and Literature → course code LIT 210 | 2026-09-26 |
| EV-040 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → English Language and Literature → course code LIT 302 | 2026-09-26 |
| EV-041 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → English Language and Literature → course code LIT 303 | 2026-09-26 |
| EV-042 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf | arts_hum.txt → parsed row ordinal 12 → French | 2026-09-26 |
| EV-043 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf | French programme listing in the Arts/Humanities brochure; exact institution-awarder cell remains subject to offering-context verification. | 2026-09-26 |
| EV-044 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | Modern European Languages B.A (French) package and French course/outcome section, printed pp. 22 and 437-464. | 2026-09-26 |
| EV-045 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf | arts_hum.txt → parsed row ordinal 13 → Portuguese/English | 2026-09-26 |
| EV-046 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → English Language and Literature → course code ENG 201 | 2026-09-26 |
| EV-047 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf | Printed p. 171, Portuguese/English table row: LASU. | 2026-09-26 |
| EV-048 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | English Studies course structure, printed pp. 213-215; ENG 101, ENG 102, ENG 103 and ENG 201 contents/outcomes at printed pp. 219-220; Literature in English structure and LIT 104-106 at printed pp. 215-216 and 231-232. | 2026-09-26 |
| EV-049 | https://forlangs.oauife.edu.ng/wp-content/uploads/2025/06/Foreign-Languages-Handbook-2024.pdf | Printed p. 22 identifies the OAU Portuguese/English combined degree; printed pp. 60-62 list its Portuguese and English courses, including language, composition, comprehension, translation and literature. | 2026-09-26 |
| EV-050 | https://lasu.edu.ng/home/news_file/ADVERTISEMENT%20FOR%20ADMISSION%20INTO%20LASU%20FOUNDATION%20%28JUPEB%29%20PROGRAMME%20FOR%2020202021%20CALENDAR%20YEAR._1597238990.pdf | Faculty of Arts table, Portuguese/English Language entry and admission requirements. | 2026-09-26 |
| EV-051 | https://lasu.edu.ng/images/Full_Time_Graduands.pdf | B.A. Portuguese/English award listing. | 2026-09-26 |
| EV-052 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf | arts_hum.txt → parsed row ordinal 14 → German | 2026-09-26 |
| EV-053 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages B.A (German) → course code GER 101 | 2026-09-26 |
| EV-054 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages B.A (German) → course code GER 102 | 2026-09-26 |
| EV-055 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages B.A (German) → course code GER 103 | 2026-09-26 |
| EV-056 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages B.A (German) → course code GER 104 | 2026-09-26 |
| EV-057 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages B.A (German) → course code GER 106 | 2026-09-26 |
| EV-058 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages B.A (German) → course code GER 107 | 2026-09-26 |
| EV-059 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages B.A (German) → course code GER 108 | 2026-09-26 |
| EV-060 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages B.A (German) → course code GER 201 | 2026-09-26 |
| EV-061 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages B.A (German) → course code GER 202 | 2026-09-26 |
| EV-062 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages B.A (German) → course code GER 204 | 2026-09-26 |
| EV-063 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages B.A (German) → course code GER 205 | 2026-09-26 |
| EV-064 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages B.A (German) → course code GER 207 | 2026-09-26 |
| EV-065 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages B.A (German) → course code GER 210 | 2026-09-26 |
| EV-066 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages B.A (German) → course code GER 301 | 2026-09-26 |
| EV-067 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages B.A (German) → course code GER 303 | 2026-09-26 |
| EV-068 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages B.A (German) → course code GER 307 | 2026-09-26 |
| EV-069 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages B.A (German) → course code GER 401 | 2026-09-26 |
| EV-070 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages B.A (German) → course code GER 402 | 2026-09-26 |
| EV-071 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages B.A (German) → course code GER 403 | 2026-09-26 |
| EV-072 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages B.A (German) → course code GER 404 | 2026-09-26 |
| EV-073 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages B.A (German) → course code GER 405 | 2026-09-26 |
| EV-074 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages B.A (German) → course code GER 406 | 2026-09-26 |
| EV-075 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf | arts_hum.txt → parsed row ordinal 15 → French and German/Russian | 2026-09-26 |
| EV-076 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages B.A (French) → course code FRN 101 | 2026-09-26 |
| EV-077 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages B.A (French) → course code FRE 102 | 2026-09-26 |
| EV-078 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages B.A (French) → course code FRE 103 | 2026-09-26 |
| EV-079 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages B.A (French) → course code FRE 104 | 2026-09-26 |
| EV-080 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages B.A (French) → course code FRE 105 | 2026-09-26 |
| EV-081 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages B.A (French) → course code FRE 106 | 2026-09-26 |
| EV-082 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages B.A (French) → course code FRE 107 | 2026-09-26 |
| EV-083 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages B.A (French) → course code FRE 108 | 2026-09-26 |
| EV-084 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages B.A (French) → course code FRE 110 | 2026-09-26 |
| EV-085 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages B.A (French) → course code FRE 201 | 2026-09-26 |
| EV-086 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages B.A (French) → course code FRE 203 | 2026-09-26 |
| EV-087 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages B.A (French) → course code FRE 204 | 2026-09-26 |
| EV-088 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages B.A (French) → course code FRE 205 | 2026-09-26 |
| EV-089 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages B.A (French) → course code FRE 206 | 2026-09-26 |
| EV-090 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages B.A (French) → course code FRE 207 | 2026-09-26 |
| EV-091 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages B.A (French) → course code FRE 301 | 2026-09-26 |
| EV-092 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages B.A (French) → course code FRE 302 | 2026-09-26 |
| EV-093 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages B.A (French) → course code FRE 303 | 2026-09-26 |
| EV-094 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages B.A (French) → course code FRE 304 | 2026-09-26 |
| EV-095 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages B.A (French) → course code FRE 305 | 2026-09-26 |
| EV-096 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages B.A (French) → course code FRE 306 | 2026-09-26 |
| EV-097 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages B.A (French) → course code FRE 401 | 2026-09-26 |
| EV-098 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages B.A (French) → course code FRE 402 | 2026-09-26 |
| EV-099 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages B.A (French) → course code FRE 403 | 2026-09-26 |
| EV-100 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages B.A (French) → course code FRE 404 | 2026-09-26 |
| EV-101 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages B.A (French) → course code FRE 405 | 2026-09-26 |
| EV-102 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages B.A (French) → course code FRE 407 | 2026-09-26 |
| EV-103 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf | arts_hum.txt → parsed row ordinal 16 → International Studies and | 2026-09-26 |
| EV-104 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code GST 112 | 2026-09-26 |
| EV-105 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 101 | 2026-09-26 |
| EV-106 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 102 | 2026-09-26 |
| EV-107 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 103 | 2026-09-26 |
| EV-108 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 104 | 2026-09-26 |
| EV-109 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 202 | 2026-09-26 |
| EV-110 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 207 | 2026-09-26 |
| EV-111 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code GST 312 | 2026-09-26 |
| EV-112 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 301 | 2026-09-26 |
| EV-113 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 303 | 2026-09-26 |
| EV-114 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 304 | 2026-09-26 |
| EV-115 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 305 | 2026-09-26 |
| EV-116 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 307 | 2026-09-26 |
| EV-117 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 308 | 2026-09-26 |
| EV-118 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 310 | 2026-09-26 |
| EV-119 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 311 | 2026-09-26 |
| EV-120 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 312 | 2026-09-26 |
| EV-121 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 401 | 2026-09-26 |
| EV-122 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 402 | 2026-09-26 |
| EV-123 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 403 | 2026-09-26 |
| EV-124 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 405 | 2026-09-26 |
| EV-125 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 406 | 2026-09-26 |
| EV-126 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 407 | 2026-09-26 |
| EV-127 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf | arts_hum.txt → parsed row ordinal 17 → History | 2026-09-26 |
| EV-128 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → History/History and Diplomatic Studies → course code GST 112 | 2026-09-26 |
| EV-129 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → History/History and Diplomatic Studies → course code HIS 101 | 2026-09-26 |
| EV-130 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → History/History and Diplomatic Studies → course code HIS 102 | 2026-09-26 |
| EV-131 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → History/History and Diplomatic Studies → course code HIS 103 | 2026-09-26 |
| EV-132 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → History/History and Diplomatic Studies → course code HIS 104 | 2026-09-26 |
| EV-133 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → History/History and Diplomatic Studies → course code HIS 105 | 2026-09-26 |
| EV-134 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → History/History and Diplomatic Studies → course code HIS 106 | 2026-09-26 |
| EV-135 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → History/History and Diplomatic Studies → course code HIS 202 | 2026-09-26 |
| EV-136 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → History/History and Diplomatic Studies → course code HIS 203 | 2026-09-26 |
| EV-137 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → History/History and Diplomatic Studies → course code HIS 204 | 2026-09-26 |
| EV-138 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → History/History and Diplomatic Studies → course code HIS 302 | 2026-09-26 |
| EV-139 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → History/History and Diplomatic Studies → course code HIS 303 | 2026-09-26 |
| EV-140 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → History/History and Diplomatic Studies → course code HIS 304 | 2026-09-26 |
| EV-141 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → History/History and Diplomatic Studies → course code HIS 306 | 2026-09-26 |
| EV-142 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → History/History and Diplomatic Studies → course code HIS 401 | 2026-09-26 |
| EV-143 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → History/History and Diplomatic Studies → course code HIS 402 | 2026-09-26 |
| EV-144 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → History/History and Diplomatic Studies → course code HIS 403 | 2026-09-26 |
| EV-145 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → History/History and Diplomatic Studies → course code HIS 404 | 2026-09-26 |
| EV-146 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → History/History and Diplomatic Studies → course code HIS 405 | 2026-09-26 |
| EV-147 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf | arts_hum.txt → parsed row ordinal 18 → History and Strategic Studies | 2026-09-26 |
| EV-148 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf | Administration.pdf → parsed row ordinal 18 → Economics | 2026-09-26 |
| EV-149 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf | arts_hum.txt → parsed row ordinal 19 → Economics | 2026-09-26 |
| EV-150 | none | engineering.txt → parsed row ordinal 16 → Economics | 2026-09-26 |
| EV-151 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf | Social Management Science.pdf → parsed row ordinal 13 → Economics | 2026-09-26 |
| EV-152 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf | arts_hum.txt → parsed row ordinal 20 → African and Asian Studies | 2026-09-26 |
| EV-153 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → History/History and Diplomatic Studies → course code HIS 108 | 2026-09-26 |
| EV-154 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → History/History and Diplomatic Studies → course code HIS 406 | 2026-09-26 |
| EV-155 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf | arts_hum.txt → parsed row ordinal 21 → Linguistics | 2026-09-26 |
| EV-156 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf | arts_hum.txt → parsed row ordinal 22 → Kanuri | 2026-09-26 |
| EV-157 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 101 | 2026-09-26 |
| EV-158 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 102 | 2026-09-26 |
| EV-159 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 103 | 2026-09-26 |
| EV-160 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 104 | 2026-09-26 |
| EV-161 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 105 | 2026-09-26 |
| EV-162 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 106 | 2026-09-26 |
| EV-163 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 201 | 2026-09-26 |
| EV-164 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 202 | 2026-09-26 |
| EV-165 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 203 | 2026-09-26 |
| EV-166 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 204 | 2026-09-26 |
| EV-167 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 205 | 2026-09-26 |
| EV-168 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 206 | 2026-09-26 |
| EV-169 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 301 | 2026-09-26 |
| EV-170 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 302 | 2026-09-26 |
| EV-171 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 303 | 2026-09-26 |
| EV-172 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 306 | 2026-09-26 |
| EV-173 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 307 | 2026-09-26 |
| EV-174 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 308 | 2026-09-26 |
| EV-175 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 309 | 2026-09-26 |
| EV-176 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 401 | 2026-09-26 |
| EV-177 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 402 | 2026-09-26 |
| EV-178 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 403 | 2026-09-26 |
| EV-179 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 404 | 2026-09-26 |
| EV-180 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 406 | 2026-09-26 |
| EV-181 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 407 | 2026-09-26 |
| EV-182 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 409 | 2026-09-26 |
| EV-183 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 410 | 2026-09-26 |
| EV-184 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf | arts_hum.txt → parsed row ordinal 23 → Russian with French/German | 2026-09-26 |
| EV-185 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages (Russian) → course code RUS 111 | 2026-09-26 |
| EV-186 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages (Russian) → course code RUS 112 | 2026-09-26 |
| EV-187 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages (Russian) → course code RUS 121 | 2026-09-26 |
| EV-188 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages (Russian) → course code RUS 122 | 2026-09-26 |
| EV-189 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages (Russian) → course code RUS 131 | 2026-09-26 |
| EV-190 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages (Russian) → course code RUS 132 | 2026-09-26 |
| EV-191 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages (Russian) → course code RUS 211 | 2026-09-26 |
| EV-192 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages (Russian) → course code RUS 212 | 2026-09-26 |
| EV-193 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages (Russian) → course code RUS 231 | 2026-09-26 |
| EV-194 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages (Russian) → course code RUS 234 | 2026-09-26 |
| EV-195 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages (Russian) → course code RUS 354 | 2026-09-26 |
| EV-196 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages (Russian) → course code RUS 362 | 2026-09-26 |
| EV-197 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages (Russian) → course code RUS 301 | 2026-09-26 |
| EV-198 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages (Russian) → course code RUS 311 | 2026-09-26 |
| EV-199 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages (Russian) → course code RUS 312 | 2026-09-26 |
| EV-200 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages (Russian) → course code RUS 322 | 2026-09-26 |
| EV-201 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages (Russian) → course code RUS 334 | 2026-09-26 |
| EV-202 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages (Russian) → course code RUS 341 | 2026-09-26 |
| EV-203 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages (Russian) → course code RUS 342 | 2026-09-26 |
| EV-204 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages (Russian) → course code RUS 361 | 2026-09-26 |
| EV-205 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages (Russian) → course code RUS 364 | 2026-09-26 |
| EV-206 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages (Russian) → course code RUS 411 | 2026-09-26 |
| EV-207 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages (Russian) → course code RUS 421 | 2026-09-26 |
| EV-208 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages (Russian) → course code RUS 431 | 2026-09-26 |
| EV-209 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages (Russian) → course code RUS 434 | 2026-09-26 |
| EV-210 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages (Russian) → course code RUS 436 | 2026-09-26 |
| EV-211 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages (Russian) → course code RUS 441 | 2026-09-26 |
| EV-212 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages (Russian) → course code RUS 442 | 2026-09-26 |
| EV-213 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages (Russian) → course code RUS 454 | 2026-09-26 |
| EV-214 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Modern European Languages (Russian) → course code RUS 462 | 2026-09-26 |
| EV-215 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf | Administration.pdf → parsed row ordinal 15 → Mass Communication | 2026-09-26 |
| EV-216 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf | arts_hum.txt → parsed row ordinal 24 → Mass Communication | 2026-09-26 |
| EV-217 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code GST 111 | 2026-09-26 |
| EV-218 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code CMS 101 | 2026-09-26 |
| EV-219 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code CMS 102 | 2026-09-26 |
| EV-220 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code MCM 101 | 2026-09-26 |
| EV-221 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code MCM 102 | 2026-09-26 |
| EV-222 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code MCM 103 | 2026-09-26 |
| EV-223 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code MCM 104 | 2026-09-26 |
| EV-224 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code CMS 201 | 2026-09-26 |
| EV-225 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code MCM 204 | 2026-09-26 |
| EV-226 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code MCM 205 | 2026-09-26 |
| EV-227 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code MCM 206 | 2026-09-26 |
| EV-228 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code MCM 210 | 2026-09-26 |
| EV-229 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code MCM 215 | 2026-09-26 |
| EV-230 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code MCM 216 | 2026-09-26 |
| EV-231 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code CMS 301 | 2026-09-26 |
| EV-232 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code CMS 302 | 2026-09-26 |
| EV-233 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code CMS 303 | 2026-09-26 |
| EV-234 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code MCM 301 | 2026-09-26 |
| EV-235 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code MCM 302 | 2026-09-26 |
| EV-236 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code MCM 303 | 2026-09-26 |
| EV-237 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code MCM 304 | 2026-09-26 |
| EV-238 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code MCM 305 | 2026-09-26 |
| EV-239 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code MCM 306 | 2026-09-26 |
| EV-240 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code MCM 307 | 2026-09-26 |
| EV-241 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code MCM 308 | 2026-09-26 |
| EV-242 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code MCM 311 | 2026-09-26 |
| EV-243 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code MCM 315 | 2026-09-26 |
| EV-244 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code CMS 401 | 2026-09-26 |
| EV-245 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code CMS 402 | 2026-09-26 |
| EV-246 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code MCM 403 | 2026-09-26 |
| EV-247 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code MCM 404 | 2026-09-26 |
| EV-248 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code MCM 405 | 2026-09-26 |
| EV-249 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code MCM 406 | 2026-09-26 |
| EV-250 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code MCM 407 | 2026-09-26 |
| EV-251 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → MASS COMMUNICATION — P12, P13, P14 → course code MCM 409 | 2026-09-26 |
| EV-252 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf | arts_hum.txt → parsed row ordinal 25 → Music | 2026-09-26 |
| EV-253 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf | arts_hum.txt → parsed row ordinal 26 → Peace Studies | 2026-09-26 |
| EV-254 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Peace Studies and Conflict Resolution → course code PCR 101 | 2026-09-26 |
| EV-255 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Peace Studies and Conflict Resolution → course code PCR 102 | 2026-09-26 |
| EV-256 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Peace Studies and Conflict Resolution → course code PCR 201 | 2026-09-26 |
| EV-257 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Peace Studies and Conflict Resolution → course code PCR 202 | 2026-09-26 |
| EV-258 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Peace Studies and Conflict Resolution → course code PCR 203 | 2026-09-26 |
| EV-259 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Peace Studies and Conflict Resolution → course code PCR 207 | 2026-09-26 |
| EV-260 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Peace Studies and Conflict Resolution → course code GST 312 | 2026-09-26 |
| EV-261 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Peace Studies and Conflict Resolution → course code PCR 301 | 2026-09-26 |
| EV-262 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Peace Studies and Conflict Resolution → course code PCR 302 | 2026-09-26 |
| EV-263 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Peace Studies and Conflict Resolution → course code PCR 303 | 2026-09-26 |
| EV-264 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Peace Studies and Conflict Resolution → course code PCR 305 | 2026-09-26 |
| EV-265 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Peace Studies and Conflict Resolution → course code PCR 306 | 2026-09-26 |
| EV-266 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Peace Studies and Conflict Resolution → course code PCR 307 | 2026-09-26 |
| EV-267 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Peace Studies and Conflict Resolution → course code PCR 308 | 2026-09-26 |
| EV-268 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Peace Studies and Conflict Resolution → course code PCR 309 | 2026-09-26 |
| EV-269 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Peace Studies and Conflict Resolution → course code PCR 321 | 2026-09-26 |
| EV-270 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Peace Studies and Conflict Resolution → course code PCR 401 | 2026-09-26 |
| EV-271 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Peace Studies and Conflict Resolution → course code PCR 402 | 2026-09-26 |
| EV-272 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Peace Studies and Conflict Resolution → course code PCR 403 | 2026-09-26 |
| EV-273 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Peace Studies and Conflict Resolution → course code PCR 404 | 2026-09-26 |
| EV-274 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf | arts_hum.txt → parsed row ordinal 27 → Philosophy | 2026-09-26 |
| EV-275 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf | arts_hum.txt → parsed row ordinal 28 → Religious Studies | 2026-09-26 |

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
- `data/career-mapping/_audit/jamb_ccmas_final_verification_rows_281_420_2026-09-26_001.md`
- `data/career-mapping/_audit/jamb_ccmas_final_verification_rows_281_420_2026-09-26_002.md`
- `data/career-mapping/_audit/jamb_ccmas_source_issue_queue_2026-09-26_001.json`
- `data/career-mapping/_audit/jamb_ccmas_source_issue_queue_2026-09-26_001.md`
- `data/career-mapping/_audit/jamb_curriculum_scopes_2026-08-17.json`
- `data/career-mapping/_audit/jamb_anomaly_inventory_2026-09-26.json`
- `data/career-mapping/_audit/jamb_offering_context_inventory_2026-09-25.json`
- `data/career-mapping/_audit/ccmas_extraction_anomaly_inventory_2026-09-26.json`


Closed work intentionally not reopened: French Arts anchor correction; Film and Video Studies Social/Management occurrence addition; recorded CCMAS page-header repairs; CAM424 equipment-spill repair; DTS498/CSC432 cross-reference repair; and replacement-character normalization classified as encoding-only.

## Disposition and resume boundary

This increment reconciles the current **281–300** queue against the prior row-level evidence. It does **not** close any identity: scope evidence, exact offering context, selected-course fidelity, item-level citations, and external/custom provenance remain open where listed. It performs no downstream domain/subgroup/role audit.

The next bounded increment is **identities 301–320**, maximum **20 identities/packages**, and must save its own append-only JSON/Markdown checkpoint before proceeding.

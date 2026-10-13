# JAMB–CCMAS source increment 003 — identities 041–060

**Audit date:** 2026-09-26 (Africa/Lagos)  
**Mode:** bounded reconciliation after checkpoint 003; append-only  
**Assigned lane:** JAMB identity/offering and CCMAS/external source integrity only  
**Write boundary:** no shared source, mapping, scope, seed, SQL, UI, downstream taxonomy, domain, subgroup, or role file was edited.

## Exact coverage inspected

- Canonical JAMB identities: **20/20**, rows **041–060**.
- Current queue records: **20 identity rows**, **66 current issue records**.
- Current selected-course occurrences represented by those rows: **235**.
- Parsed offering occurrences represented by those rows: **23**.
- CCMAS/external components inspected through the current records: **Administration and Management::Business Administration, Administration and Management::Employment and Human Resource Management, Administration and Management::Entrepreneurship, Administration and Management::Finance / Banking and Finance, Administration and Management::Hospitality and Tourism Management, Administration and Management::Marketing, Administration and Management::Public Administration, Administration and Management::Taxation, Social Sciences::Development Studies, Social Sciences::International Relations, Social Sciences::Peace Studies and Conflict Resolution, Social Sciences::Political Science, Social Sciences::Psychology, Social Sciences::Social Work, Social Sciences::Sociology, __custom__::Anthropology**.
- Prior row-level evidence was read first from the existing final-gap checkpoint(s) for rows **041–060**; already-verified facts were not re-researched.

## Records inspected

| Row | JAMB identity | Component reference(s) | Current scope state | Selected courses | Offering records | Current issue IDs |
|---:|---|---|---|---:|---:|---|
| 041 | Political Science and Defence Studies | Social Sciences::Political Science | full_scope_review_required | 41 | 1 | SRC-00136, SRC-00137, SRC-00138 |
| 042 | Peace Studies and Conflict Resolution | Social Sciences::Peace Studies and Conflict Resolution | full | 0 | 1 | SRC-00139, SRC-00140 |
| 043 | Peace Strategic and Conflict Resolution | Social Sciences::Peace Studies and Conflict Resolution, Social Sciences::International Relations | combined_scope_review_required | 0 | 1 | SRC-00141, SRC-00142, SRC-00143, SRC-00144 |
| 044 | Peace and Conflict Studies | Social Sciences::Peace Studies and Conflict Resolution | partial_scope_reviewed | 20 | 1 | SRC-00145, SRC-00146, SRC-00147 |
| 045 | Psychology | Social Sciences::Psychology | full | 0 | 2 | SRC-00148, SRC-00149 |
| 046 | Public Administration | Administration and Management::Public Administration | partial_scope_reviewed | 26 | 2 | SRC-00150, SRC-00151, SRC-00152 |
| 047 | Public Administration and Local Govt | Administration and Management::Public Administration | partial_scope_reviewed | 26 | 2 | SRC-00153, SRC-00154, SRC-00155 |
| 048 | Public Administration and Policy Studies | Administration and Management::Public Administration | partial_scope_reviewed | 26 | 1 | SRC-00156, SRC-00157, SRC-00158 |
| 049 | Government and Public Administration | Social Sciences::Political Science, Administration and Management::Public Administration | combined_scope_review_required | 0 | 1 | SRC-00159, SRC-00160, SRC-00161, SRC-00162 |
| 050 | Sociology and Anthroplogy | Social Sciences::Sociology, __custom__::Anthropology | combined_scope_review_required | 0 | 1 | SRC-00163, SRC-00164, SRC-00165, SRC-00166, SRC-00167 |
| 051 | Social Work | Social Sciences::Social Work | full | 0 | 1 | SRC-00168, SRC-00169 |
| 052 | Sociology and Social Studies | Social Sciences::Sociology, Social Sciences::Development Studies | combined_scope_review_required | 0 | 1 | SRC-00170, SRC-00171, SRC-00172, SRC-00173 |
| 053 | Banking and Finance | Administration and Management::Finance / Banking and Finance | partial_scope_reviewed | 21 | 1 | SRC-00174, SRC-00175, SRC-00176 |
| 054 | Business Administration | Administration and Management::Business Administration | full | 0 | 1 | SRC-00177, SRC-00178 |
| 055 | Marketing | Administration and Management::Marketing | full | 0 | 1 | SRC-00179, SRC-00180 |
| 056 | Entrepreneurship | Administration and Management::Entrepreneurship | full | 0 | 1 | SRC-00181, SRC-00182 |
| 057 | Business Management | Administration and Management::Business Administration | partial_scope_reviewed | 31 | 1 | SRC-00183, SRC-00184, SRC-00185 |
| 058 | Taxation | Administration and Management::Taxation | full | 0 | 1 | SRC-00186, SRC-00187 |
| 059 | Industrial Relations and Personnel Management | Administration and Management::Employment and Human Resource Management | partial_scope_reviewed | 18 | 1 | SRC-00188, SRC-00189, SRC-00190 |
| 060 | Hotel and Tourism Management | Administration and Management::Hospitality and Tourism Management | partial_scope_reviewed | 26 | 1 | SRC-00191, SRC-00192, SRC-00193 |

## Current issue counts

- Confirmed gaps still open: **53**.
- Candidate issues still open: **5**.
- New issue classes discovered in this reconciliation: **0**.
- Closed findings reopened: **0**.
- Distinct exact evidence references captured: **164**.

By issue type/status:

- `combined_scope_zero_courses` / `confirmed_gap`: 4
- `external_or_custom_evidence_contract` / `confirmed_gap`: 1
- `offering_context_unverified` / `confirmed_gap`: 20
- `scope_evidence_missing` / `confirmed_gap`: 19
- `scope_semantic_review_required` / `candidate`: 5
- `selected_course_citation_incomplete` / `confirmed_gap`: 8
- `selected_course_content_or_outcome_gap` / `confirmed_gap`: 1

## Confirmed and candidate issue ledger

The following are current open records carried from the source issue queue. They are not claims that every record below is an academic-content defect; provenance, offering-context, and citation gaps remain distinct from content defects.

| Issue | Row | Status | Type | Evidence refs | Recommendation |
|---|---:|---|---|---|---|
| SRC-00136 | 041 | confirmed_gap | offering_context_unverified | EV-001 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00137 | 041 | confirmed_gap | selected_course_content_or_outcome_gap | EV-002, EV-003 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00138 | 041 | candidate | scope_semantic_review_required | EV-002, EV-003 | Reconcile the exact offering context, each named component, selected courses/outcomes, and supported student-facing status; a review label is not evidence of correctness. |
| SRC-00139 | 042 | confirmed_gap | scope_evidence_missing | EV-004 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00140 | 042 | confirmed_gap | offering_context_unverified | EV-004 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00141 | 043 | confirmed_gap | scope_evidence_missing | EV-005 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00142 | 043 | confirmed_gap | offering_context_unverified | EV-005 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00143 | 043 | confirmed_gap | combined_scope_zero_courses | EV-005 | Build a bounded component-by-component evidence bundle; do not infer a union from the title or mark the programme unavailable solely because the local scope is empty. |
| SRC-00144 | 043 | candidate | scope_semantic_review_required | EV-005 | Reconcile the exact offering context, each named component, selected courses/outcomes, and supported student-facing status; a review label is not evidence of correctness. |
| SRC-00145 | 044 | confirmed_gap | scope_evidence_missing | EV-006 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00146 | 044 | confirmed_gap | offering_context_unverified | EV-006 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00147 | 044 | confirmed_gap | selected_course_citation_incomplete | EV-007, EV-008, EV-009, EV-010, EV-011, EV-012, EV-013, EV-014, EV-015, EV-016, EV-017, EV-018, EV-019, EV-020, EV-021, EV-022, EV-023, EV-024, EV-025, EV-026 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00148 | 045 | confirmed_gap | scope_evidence_missing | EV-027, EV-028 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00149 | 045 | confirmed_gap | offering_context_unverified | EV-027, EV-028 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00150 | 046 | confirmed_gap | scope_evidence_missing | EV-029, EV-030 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00151 | 046 | confirmed_gap | offering_context_unverified | EV-029, EV-030 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00152 | 046 | confirmed_gap | selected_course_citation_incomplete | EV-031, EV-032, EV-033, EV-034, EV-035, EV-036, EV-037, EV-038, EV-039, EV-040, EV-041, EV-042, EV-043, EV-044, EV-045, EV-046, EV-047, EV-048, EV-049, EV-050, EV-051, EV-052, EV-053, EV-054, EV-055, EV-056 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00153 | 047 | confirmed_gap | scope_evidence_missing | EV-057, EV-058 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00154 | 047 | confirmed_gap | offering_context_unverified | EV-057, EV-058 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00155 | 047 | confirmed_gap | selected_course_citation_incomplete | EV-031, EV-032, EV-033, EV-034, EV-035, EV-036, EV-037, EV-038, EV-039, EV-040, EV-041, EV-042, EV-043, EV-044, EV-045, EV-046, EV-047, EV-048, EV-049, EV-050, EV-051, EV-052, EV-053, EV-054, EV-055, EV-056 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00156 | 048 | confirmed_gap | scope_evidence_missing | EV-059 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00157 | 048 | confirmed_gap | offering_context_unverified | EV-059 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00158 | 048 | confirmed_gap | selected_course_citation_incomplete | EV-031, EV-032, EV-033, EV-034, EV-035, EV-036, EV-037, EV-038, EV-039, EV-040, EV-041, EV-042, EV-043, EV-044, EV-045, EV-046, EV-047, EV-048, EV-049, EV-050, EV-051, EV-052, EV-053, EV-054, EV-055, EV-056 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00159 | 049 | confirmed_gap | scope_evidence_missing | EV-060 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00160 | 049 | confirmed_gap | offering_context_unverified | EV-060 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00161 | 049 | confirmed_gap | combined_scope_zero_courses | EV-060 | Build a bounded component-by-component evidence bundle; do not infer a union from the title or mark the programme unavailable solely because the local scope is empty. |
| SRC-00162 | 049 | candidate | scope_semantic_review_required | EV-060 | Reconcile the exact offering context, each named component, selected courses/outcomes, and supported student-facing status; a review label is not evidence of correctness. |
| SRC-00163 | 050 | confirmed_gap | scope_evidence_missing | EV-061 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00164 | 050 | confirmed_gap | offering_context_unverified | EV-061 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00165 | 050 | confirmed_gap | combined_scope_zero_courses | EV-061 | Build a bounded component-by-component evidence bundle; do not infer a union from the title or mark the programme unavailable solely because the local scope is empty. |
| SRC-00166 | 050 | candidate | scope_semantic_review_required | EV-061 | Reconcile the exact offering context, each named component, selected courses/outcomes, and supported student-facing status; a review label is not evidence of correctness. |
| SRC-00167 | 050 | confirmed_gap | external_or_custom_evidence_contract | EV-061 | For every external/custom course, retain an authoritative item-specific URL, locator, access date, provider/programme context, and limits of applicability; do not treat a custom scope as a CCMAS degree anchor. |
| SRC-00168 | 051 | confirmed_gap | scope_evidence_missing | EV-062 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00169 | 051 | confirmed_gap | offering_context_unverified | EV-062 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00170 | 052 | confirmed_gap | scope_evidence_missing | EV-063 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00171 | 052 | confirmed_gap | offering_context_unverified | EV-063 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00172 | 052 | confirmed_gap | combined_scope_zero_courses | EV-063 | Build a bounded component-by-component evidence bundle; do not infer a union from the title or mark the programme unavailable solely because the local scope is empty. |
| SRC-00173 | 052 | candidate | scope_semantic_review_required | EV-063 | Reconcile the exact offering context, each named component, selected courses/outcomes, and supported student-facing status; a review label is not evidence of correctness. |
| SRC-00174 | 053 | confirmed_gap | scope_evidence_missing | EV-064 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00175 | 053 | confirmed_gap | offering_context_unverified | EV-064 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00176 | 053 | confirmed_gap | selected_course_citation_incomplete | EV-065, EV-066, EV-067, EV-068, EV-069, EV-070, EV-071, EV-072, EV-073, EV-074, EV-075, EV-076, EV-077, EV-078, EV-079, EV-080, EV-081, EV-082, EV-083, EV-084, EV-085 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00177 | 054 | confirmed_gap | scope_evidence_missing | EV-086 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00178 | 054 | confirmed_gap | offering_context_unverified | EV-086 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00179 | 055 | confirmed_gap | scope_evidence_missing | EV-087 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00180 | 055 | confirmed_gap | offering_context_unverified | EV-087 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00181 | 056 | confirmed_gap | scope_evidence_missing | EV-088 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00182 | 056 | confirmed_gap | offering_context_unverified | EV-088 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00183 | 057 | confirmed_gap | scope_evidence_missing | EV-089 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00184 | 057 | confirmed_gap | offering_context_unverified | EV-089 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00185 | 057 | confirmed_gap | selected_course_citation_incomplete | EV-090, EV-091, EV-092, EV-093, EV-094, EV-095, EV-096, EV-097, EV-098, EV-099, EV-100, EV-101, EV-102, EV-103, EV-104, EV-105, EV-106, EV-107, EV-108, EV-109, EV-110, EV-111, EV-112, EV-113, EV-114, EV-115, EV-116, EV-117, EV-118, EV-119, EV-120 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00186 | 058 | confirmed_gap | scope_evidence_missing | EV-121 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00187 | 058 | confirmed_gap | offering_context_unverified | EV-121 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00188 | 059 | confirmed_gap | scope_evidence_missing | EV-122 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00189 | 059 | confirmed_gap | offering_context_unverified | EV-122 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00190 | 059 | confirmed_gap | selected_course_citation_incomplete | EV-123, EV-124, EV-125, EV-126, EV-127, EV-128, EV-129, EV-130, EV-131, EV-132, EV-133, EV-134, EV-135, EV-136, EV-137, EV-138, EV-139, EV-140 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00191 | 060 | confirmed_gap | scope_evidence_missing | EV-141 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00192 | 060 | confirmed_gap | offering_context_unverified | EV-141 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00193 | 060 | confirmed_gap | selected_course_citation_incomplete | EV-142, EV-143, EV-144, EV-145, EV-146, EV-147, EV-148, EV-149, EV-150, EV-151, EV-152, EV-153, EV-154, EV-155, EV-156, EV-157, EV-158, EV-159, EV-160, EV-161, EV-162, EV-163, EV-164 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |

## Exact evidence URLs, locators, and access dates

### Structured evidence references attached to issue records

| Ref | URL | Exact locator | Accessed |
|---|---|---|---|
| EV-001 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf | Social Management Science.pdf → parsed row ordinal 39 → Political Science and Defence Studies | 2026-09-26 |
| EV-002 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf | Printed p. 668, awarder table row ‘POLITICAL SCIENCE AND DEFENCE STUDIES — NDA’. | 2026-09-26 |
| EV-003 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | Political Science course structure printed p. 204; POL 401 Civil-Military Relations outcomes/content printed pp. 217–218; POL 403 Contemporary Defence and Strategic Studies outcomes/content printed pp. 218–219. | 2026-09-26 |
| EV-004 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf | Social Management Science.pdf → parsed row ordinal 40 → Peace Studies and Conflict Resolution | 2026-09-26 |
| EV-005 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf | Social Management Science.pdf → parsed row ordinal 41 → Peace Strategic and Conflict Resolution | 2026-09-26 |
| EV-006 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf | Social Management Science.pdf → parsed row ordinal 42 → Peace and Conflict Studies | 2026-09-26 |
| EV-007 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Peace Studies and Conflict Resolution → course code PCR 101 | 2026-09-26 |
| EV-008 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Peace Studies and Conflict Resolution → course code PCR 102 | 2026-09-26 |
| EV-009 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Peace Studies and Conflict Resolution → course code PCR 201 | 2026-09-26 |
| EV-010 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Peace Studies and Conflict Resolution → course code PCR 202 | 2026-09-26 |
| EV-011 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Peace Studies and Conflict Resolution → course code PCR 203 | 2026-09-26 |
| EV-012 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Peace Studies and Conflict Resolution → course code PCR 207 | 2026-09-26 |
| EV-013 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Peace Studies and Conflict Resolution → course code GST 312 | 2026-09-26 |
| EV-014 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Peace Studies and Conflict Resolution → course code PCR 301 | 2026-09-26 |
| EV-015 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Peace Studies and Conflict Resolution → course code PCR 302 | 2026-09-26 |
| EV-016 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Peace Studies and Conflict Resolution → course code PCR 303 | 2026-09-26 |
| EV-017 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Peace Studies and Conflict Resolution → course code PCR 305 | 2026-09-26 |
| EV-018 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Peace Studies and Conflict Resolution → course code PCR 306 | 2026-09-26 |
| EV-019 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Peace Studies and Conflict Resolution → course code PCR 307 | 2026-09-26 |
| EV-020 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Peace Studies and Conflict Resolution → course code PCR 308 | 2026-09-26 |
| EV-021 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Peace Studies and Conflict Resolution → course code PCR 309 | 2026-09-26 |
| EV-022 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Peace Studies and Conflict Resolution → course code PCR 321 | 2026-09-26 |
| EV-023 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Peace Studies and Conflict Resolution → course code PCR 401 | 2026-09-26 |
| EV-024 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Peace Studies and Conflict Resolution → course code PCR 402 | 2026-09-26 |
| EV-025 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Peace Studies and Conflict Resolution → course code PCR 403 | 2026-09-26 |
| EV-026 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Peace Studies and Conflict Resolution → course code PCR 404 | 2026-09-26 |
| EV-027 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf | arts_hum.txt → parsed row ordinal 39 → Psychology | 2026-09-26 |
| EV-028 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf | Social Management Science.pdf → parsed row ordinal 43 → Psychology | 2026-09-26 |
| EV-029 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf | Administration.pdf → parsed row ordinal 3 → Public Administration | 2026-09-26 |
| EV-030 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf | Social Management Science.pdf → parsed row ordinal 44 → Public Administration | 2026-09-26 |
| EV-031 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Public Administration → course code GST 112 | 2026-09-26 |
| EV-032 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Public Administration → course code PAD 101 | 2026-09-26 |
| EV-033 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Public Administration → course code PAD 201 | 2026-09-26 |
| EV-034 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Public Administration → course code PAD 202 | 2026-09-26 |
| EV-035 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Public Administration → course code PAD 205 | 2026-09-26 |
| EV-036 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Public Administration → course code PAD 301 | 2026-09-26 |
| EV-037 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Public Administration → course code PAD 302 | 2026-09-26 |
| EV-038 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Public Administration → course code PAD 303 | 2026-09-26 |
| EV-039 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Public Administration → course code PAD 305 | 2026-09-26 |
| EV-040 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Public Administration → course code PAD 306 | 2026-09-26 |
| EV-041 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Public Administration → course code PAD 307 | 2026-09-26 |
| EV-042 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Public Administration → course code PAD 308 | 2026-09-26 |
| EV-043 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Public Administration → course code PAD 309 | 2026-09-26 |
| EV-044 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Public Administration → course code PAD 310 | 2026-09-26 |
| EV-045 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Public Administration → course code PAD 311 | 2026-09-26 |
| EV-046 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Public Administration → course code PAD 312 | 2026-09-26 |
| EV-047 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Public Administration → course code PAD 313 | 2026-09-26 |
| EV-048 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Public Administration → course code PAD 402 | 2026-09-26 |
| EV-049 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Public Administration → course code PAD 403 | 2026-09-26 |
| EV-050 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Public Administration → course code PAD 404 | 2026-09-26 |
| EV-051 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Public Administration → course code PAD 405 | 2026-09-26 |
| EV-052 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Public Administration → course code PAD 406 | 2026-09-26 |
| EV-053 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Public Administration → course code PAD 407 | 2026-09-26 |
| EV-054 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Public Administration → course code PAD 408 | 2026-09-26 |
| EV-055 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Public Administration → course code PAD 409 | 2026-09-26 |
| EV-056 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Public Administration → course code PAD 411 | 2026-09-26 |
| EV-057 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf | Social Management Science.pdf → parsed row ordinal 45 → Public Administration and Local Govt | 2026-09-26 |
| EV-058 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf | Administration degree brochure, printed page 86; the row headed 'PUBLIC ADMINISTRATION AND LOCAL GOVERNMENT' lists 'UNN' in the course/degree-awarding-institutions column. | 2026-09-25 |
| EV-059 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf | Social Management Science.pdf → parsed row ordinal 46 → Public Administration and Policy Studies | 2026-09-26 |
| EV-060 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf | Social Management Science.pdf → parsed row ordinal 47 → Government and Public Administration | 2026-09-26 |
| EV-061 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf | Social Management Science.pdf → parsed row ordinal 48 → Sociology and Anthroplogy | 2026-09-26 |
| EV-062 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf | Social Management Science.pdf → parsed row ordinal 49 → Social Work | 2026-09-26 |
| EV-063 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf | Social Management Science.pdf → parsed row ordinal 52 → Sociology and Social Studies | 2026-09-26 |
| EV-064 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf | Administration.pdf → parsed row ordinal 1 → Banking and Finance | 2026-09-26 |
| EV-065 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Finance / Banking and Finance → course code FIN 101 | 2026-09-26 |
| EV-066 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Finance / Banking and Finance → course code FIN 209 | 2026-09-26 |
| EV-067 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Finance / Banking and Finance → course code FIN 210 | 2026-09-26 |
| EV-068 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Finance / Banking and Finance → course code FIN 215 | 2026-09-26 |
| EV-069 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Finance / Banking and Finance → course code FIN 216 | 2026-09-26 |
| EV-070 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Finance / Banking and Finance → course code FIN 217 | 2026-09-26 |
| EV-071 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Finance / Banking and Finance → course code ENT 312 | 2026-09-26 |
| EV-072 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Finance / Banking and Finance → course code FIN 303 | 2026-09-26 |
| EV-073 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Finance / Banking and Finance → course code FIN 304 | 2026-09-26 |
| EV-074 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Finance / Banking and Finance → course code FIN 305 | 2026-09-26 |
| EV-075 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Finance / Banking and Finance → course code FIN 308 | 2026-09-26 |
| EV-076 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Finance / Banking and Finance → course code FIN 313 | 2026-09-26 |
| EV-077 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Finance / Banking and Finance → course code FIN 315 | 2026-09-26 |
| EV-078 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Finance / Banking and Finance → course code FIN 317 | 2026-09-26 |
| EV-079 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Finance / Banking and Finance → course code FIN 404 | 2026-09-26 |
| EV-080 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Finance / Banking and Finance → course code FIN 409 | 2026-09-26 |
| EV-081 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Finance / Banking and Finance → course code FIN 410 | 2026-09-26 |
| EV-082 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Finance / Banking and Finance → course code FIN 411 | 2026-09-26 |
| EV-083 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Finance / Banking and Finance → course code FIN 413 | 2026-09-26 |
| EV-084 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Finance / Banking and Finance → course code FIN 414 | 2026-09-26 |
| EV-085 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Finance / Banking and Finance → course code FIN 416 | 2026-09-26 |
| EV-086 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf | Administration.pdf → parsed row ordinal 2 → Business Administration | 2026-09-26 |
| EV-087 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf | Administration.pdf → parsed row ordinal 4 → Marketing | 2026-09-26 |
| EV-088 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf | Administration.pdf → parsed row ordinal 5 → Entrepreneurship | 2026-09-26 |
| EV-089 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf | Administration.pdf → parsed row ordinal 6 → Business Management | 2026-09-26 |
| EV-090 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Business Administration → course code AMS 101 | 2026-09-26 |
| EV-091 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Business Administration → course code AMS 102 | 2026-09-26 |
| EV-092 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Business Administration → course code AMS 103 | 2026-09-26 |
| EV-093 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Business Administration → course code AMS 104 | 2026-09-26 |
| EV-094 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Business Administration → course code BUA 101 | 2026-09-26 |
| EV-095 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Business Administration → course code BUA 102 | 2026-09-26 |
| EV-096 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Business Administration → course code BUA 200 | 2026-09-26 |
| EV-097 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Business Administration → course code BUA 201 | 2026-09-26 |
| EV-098 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Business Administration → course code BUA 202 | 2026-09-26 |
| EV-099 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Business Administration → course code BUA 203 | 2026-09-26 |
| EV-100 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Business Administration → course code BUA 204 | 2026-09-26 |
| EV-101 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Business Administration → course code BUA 205 | 2026-09-26 |
| EV-102 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Business Administration → course code BUA 216 | 2026-09-26 |
| EV-103 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Business Administration → course code BUA 218 | 2026-09-26 |
| EV-104 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Business Administration → course code BUA 302 | 2026-09-26 |
| EV-105 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Business Administration → course code BUA 303 | 2026-09-26 |
| EV-106 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Business Administration → course code BUA 304 | 2026-09-26 |
| EV-107 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Business Administration → course code BUA 305 | 2026-09-26 |
| EV-108 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Business Administration → course code BUA 310 | 2026-09-26 |
| EV-109 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Business Administration → course code BUA 312 | 2026-09-26 |
| EV-110 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Business Administration → course code BUA 313 | 2026-09-26 |
| EV-111 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Business Administration → course code BUA 319 | 2026-09-26 |
| EV-112 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Business Administration → course code BUA 321 | 2026-09-26 |
| EV-113 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Business Administration → course code BUA 323 | 2026-09-26 |
| EV-114 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Business Administration → course code BUA 401 | 2026-09-26 |
| EV-115 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Business Administration → course code BUA 402 | 2026-09-26 |
| EV-116 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Business Administration → course code BUA 404 | 2026-09-26 |
| EV-117 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Business Administration → course code BUA 406 | 2026-09-26 |
| EV-118 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Business Administration → course code BUA 409 | 2026-09-26 |
| EV-119 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Business Administration → course code BUA 411 | 2026-09-26 |
| EV-120 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Business Administration → course code BUA 420 | 2026-09-26 |
| EV-121 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf | Administration.pdf → parsed row ordinal 7 → Taxation | 2026-09-26 |
| EV-122 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf | Administration.pdf → parsed row ordinal 8 → Industrial Relations and Personnel Management | 2026-09-26 |
| EV-123 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 101 | 2026-09-26 |
| EV-124 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 102 | 2026-09-26 |
| EV-125 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 201 | 2026-09-26 |
| EV-126 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 204 | 2026-09-26 |
| EV-127 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 205 | 2026-09-26 |
| EV-128 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 301 | 2026-09-26 |
| EV-129 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 303 | 2026-09-26 |
| EV-130 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 305 | 2026-09-26 |
| EV-131 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 307 | 2026-09-26 |
| EV-132 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 308 | 2026-09-26 |
| EV-133 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 309 | 2026-09-26 |
| EV-134 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 310 | 2026-09-26 |
| EV-135 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 311 | 2026-09-26 |
| EV-136 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 312 | 2026-09-26 |
| EV-137 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 402 | 2026-09-26 |
| EV-138 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 403 | 2026-09-26 |
| EV-139 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 405 | 2026-09-26 |
| EV-140 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 407 | 2026-09-26 |
| EV-141 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf | Administration.pdf → parsed row ordinal 9 → Hotel and Tourism Management | 2026-09-26 |
| EV-142 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 101 | 2026-09-26 |
| EV-143 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 102 | 2026-09-26 |
| EV-144 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 203 | 2026-09-26 |
| EV-145 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 205 | 2026-09-26 |
| EV-146 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 209 | 2026-09-26 |
| EV-147 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 210 | 2026-09-26 |
| EV-148 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 212 | 2026-09-26 |
| EV-149 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 303 | 2026-09-26 |
| EV-150 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 305 | 2026-09-26 |
| EV-151 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 307 | 2026-09-26 |
| EV-152 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 309 | 2026-09-26 |
| EV-153 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 311 | 2026-09-26 |
| EV-154 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 313 | 2026-09-26 |
| EV-155 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 300 | 2026-09-26 |
| EV-156 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 402 | 2026-09-26 |
| EV-157 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 403 | 2026-09-26 |
| EV-158 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 406 | 2026-09-26 |
| EV-159 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code TRM 408 | 2026-09-26 |
| EV-160 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 410 | 2026-09-26 |
| EV-161 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code TRM 401 | 2026-09-26 |
| EV-162 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code TRM 403 | 2026-09-26 |
| EV-163 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code TRM 407 | 2026-09-26 |
| EV-164 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code TRM 412 | 2026-09-26 |

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
- `data/career-mapping/_audit/jamb_ccmas_final_gap_verification_rows_041_050_2026-09-26_001.md`
- `data/career-mapping/_audit/jamb_ccmas_final_gap_verification_rows_051_060_2026-09-26_001.md`
- `data/career-mapping/_audit/jamb_ccmas_source_issue_queue_2026-09-26_001.json`
- `data/career-mapping/_audit/jamb_ccmas_source_issue_queue_2026-09-26_001.md`
- `data/career-mapping/_audit/jamb_curriculum_scopes_2026-08-17.json`
- `data/career-mapping/_audit/jamb_anomaly_inventory_2026-09-26.json`
- `data/career-mapping/_audit/jamb_offering_context_inventory_2026-09-25.json`
- `data/career-mapping/_audit/ccmas_extraction_anomaly_inventory_2026-09-26.json`


Closed work intentionally not reopened: French Arts anchor correction; Film and Video Studies Social/Management occurrence addition; recorded CCMAS page-header repairs; CAM424 equipment-spill repair; DTS498/CSC432 cross-reference repair; and replacement-character normalization classified as encoding-only.

## Disposition and resume boundary

This increment reconciles the current **041–060** queue against the prior row-level evidence. It does **not** close any identity: scope evidence, exact offering context, selected-course fidelity, item-level citations, and external/custom provenance remain open where listed. It performs no downstream domain/subgroup/role audit.

The next bounded increment is **identities 061–080**, maximum **20 identities/packages**, and must save its own append-only JSON/Markdown checkpoint before proceeding.

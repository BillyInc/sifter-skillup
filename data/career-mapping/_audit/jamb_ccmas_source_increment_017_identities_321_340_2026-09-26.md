# JAMB–CCMAS source increment 017 — identities 321–340

**Audit date:** 2026-09-26 (Africa/Lagos)  
**Mode:** bounded reconciliation after checkpoint 003; append-only  
**Assigned lane:** JAMB identity/offering and CCMAS/external source integrity only  
**Write boundary:** no shared source, mapping, scope, seed, SQL, UI, downstream taxonomy, domain, subgroup, or role file was edited.

## Exact coverage inspected

- Canonical JAMB identities: **20/20**, rows **321–340**.
- Current queue records: **20 identity rows**, **66 current issue records**.
- Current selected-course occurrences represented by those rows: **176**.
- Parsed offering occurrences represented by those rows: **21**.
- CCMAS/external components inspected through the current records: **Administration and Management::Hospitality and Tourism Management, Agricultural Science::B.Sc./B.Tech Food Science and Technology, Agricultural Science::Family and Consumer Sciences, Agricultural Science::Fisheries and Aquaculture, Allied Health Sciences::Environmental Health Science, Communication and Media Studies::INFORMATION AND MEDIA STUDIES — P12, P13, P14, Environmental Sciences::Building, Environmental Sciences::ENVIRONMENTAL STANDARDS, Environmental Sciences::Environmental Management, Environmental Sciences::Estate management, Environmental Sciences::Geography, Environmental Sciences::Industrial Design, Environmental Sciences::Urban and Regional Planning, Sciences::Chemistry, Sciences::Geology, Sciences::Physics with Electronics**.
- Prior row-level evidence was read first from the existing final-gap checkpoint(s) for rows **321–340**; already-verified facts were not re-researched.

## Records inspected

| Row | JAMB identity | Component reference(s) | Current scope state | Selected courses | Offering records | Current issue IDs |
|---:|---|---|---|---:|---:|---|
| 321 | Geography | Environmental Sciences::Geography | full | 0 | 2 | SRC-00991, SRC-00992 |
| 322 | Urban and Regional Planning | Environmental Sciences::Urban and Regional Planning | full | 0 | 1 | SRC-00993, SRC-00994 |
| 323 | Industrial Design | Environmental Sciences::Industrial Design | full | 0 | 1 | SRC-00995, SRC-00996 |
| 324 | Estate Management | Environmental Sciences::Estate management | full | 0 | 1 | SRC-00997, SRC-00998 |
| 325 | Hotel Management and Tourism | Administration and Management::Hospitality and Tourism Management | partial_scope_reviewed | 26 | 1 | SRC-00999, SRC-01000, SRC-01001 |
| 326 | Home Economics and Food Management | Agricultural Science::Family and Consumer Sciences | partial_scope_reviewed | 19 | 1 | SRC-01002, SRC-01003, SRC-01004, SRC-01005 |
| 327 | Building Technology | Environmental Sciences::Building | partial_scope_reviewed | 46 | 1 | SRC-01006, SRC-01007, SRC-01008, SRC-01009 |
| 328 | Chemical Sciences | Sciences::Chemistry | partial_scope_reviewed | 24 | 1 | SRC-01010, SRC-01011, SRC-01012 |
| 329 | Electronics | Sciences::Physics with Electronics | partial_scope_reviewed | 1 | 1 | SRC-01013, SRC-01014, SRC-01015 |
| 330 | Environmental Health Science | Allied Health Sciences::Environmental Health Science | full | 0 | 1 | SRC-01016, SRC-01017 |
| 331 | Environmental Management | Environmental Sciences::Environmental Management | full | 0 | 1 | SRC-01018, SRC-01019 |
| 332 | Environmental Science and Technology |  | external_scope_evidenced | 0 | 1 | SRC-01020, SRC-01021, SRC-01022 |
| 333 | Environmental Standards | Environmental Sciences::ENVIRONMENTAL STANDARDS | full | 0 | 1 | SRC-01023, SRC-01024 |
| 334 | FISHERIES AND AQUACULTURE | Agricultural Science::Fisheries and Aquaculture | full | 0 | 1 | SRC-01025, SRC-01026 |
| 335 | Food Science & Nutrition | Agricultural Science::B.Sc./B.Tech Food Science and Technology | partial_scope_reviewed | 11 | 1 | SRC-01027, SRC-01028, SRC-01029, SRC-01030 |
| 336 | Food Science and Technology | Agricultural Science::B.Sc./B.Tech Food Science and Technology | partial_scope_reviewed | 11 | 1 | SRC-01031, SRC-01032, SRC-01033, SRC-01034 |
| 337 | Geography and Environmental Management | Environmental Sciences::Geography, Environmental Sciences::Environmental Management | combined_scope_review_required | 0 | 1 | SRC-01035, SRC-01036, SRC-01037, SRC-01038 |
| 338 | Geography and Geosciences | Environmental Sciences::Geography, Sciences::Geology | combined_scope_review_required | 0 | 1 | SRC-01039, SRC-01040, SRC-01041, SRC-01042 |
| 339 | HOME SCIENCE | Agricultural Science::Family and Consumer Sciences | partial_scope_reviewed | 11 | 1 | SRC-01043, SRC-01044, SRC-01045, SRC-01046 |
| 340 | INFORMATION AND MEDIA SCIENCE | Communication and Media Studies::INFORMATION AND MEDIA STUDIES — P12, P13, P14 | partial_scope_reviewed | 27 | 1 | SRC-01047, SRC-01048, SRC-01049, SRC-01050 |

## Current issue counts

- Confirmed gaps still open: **58**.
- Candidate issues still open: **2**.
- New issue classes discovered in this reconciliation: **0**.
- Closed findings reopened: **0**.
- Distinct exact evidence references captured: **167**.

By issue type/status:

- `combined_scope_zero_courses` / `confirmed_gap`: 2
- `external_or_custom_evidence_contract` / `confirmed_gap`: 1
- `offering_context_unverified` / `confirmed_gap`: 20
- `scope_evidence_missing` / `confirmed_gap`: 20
- `scope_semantic_review_required` / `candidate`: 2
- `selected_course_citation_incomplete` / `confirmed_gap`: 9
- `selected_course_content_or_outcome_gap` / `confirmed_gap`: 6

## Confirmed and candidate issue ledger

The following are current open records carried from the source issue queue. They are not claims that every record below is an academic-content defect; provenance, offering-context, and citation gaps remain distinct from content defects.

| Issue | Row | Status | Type | Evidence refs | Recommendation |
|---|---:|---|---|---|---|
| SRC-00991 | 321 | confirmed_gap | scope_evidence_missing | EV-001, EV-002 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00992 | 321 | confirmed_gap | offering_context_unverified | EV-001, EV-002 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00993 | 322 | confirmed_gap | scope_evidence_missing | EV-003 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00994 | 322 | confirmed_gap | offering_context_unverified | EV-003 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00995 | 323 | confirmed_gap | scope_evidence_missing | EV-004 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00996 | 323 | confirmed_gap | offering_context_unverified | EV-004 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00997 | 324 | confirmed_gap | scope_evidence_missing | EV-005 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00998 | 324 | confirmed_gap | offering_context_unverified | EV-005 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00999 | 325 | confirmed_gap | scope_evidence_missing | EV-006 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01000 | 325 | confirmed_gap | offering_context_unverified | EV-006 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01001 | 325 | confirmed_gap | selected_course_citation_incomplete | EV-007, EV-008, EV-009, EV-010, EV-011, EV-012, EV-013, EV-014, EV-015, EV-016, EV-017, EV-018, EV-019, EV-020, EV-021, EV-022, EV-023, EV-024, EV-025, EV-026, EV-027, EV-028, EV-029 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-01002 | 326 | confirmed_gap | scope_evidence_missing | EV-030 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01003 | 326 | confirmed_gap | offering_context_unverified | EV-030 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01004 | 326 | confirmed_gap | selected_course_citation_incomplete | EV-031, EV-032, EV-033, EV-034, EV-035, EV-036, EV-037, EV-038, EV-039, EV-040, EV-041, EV-042, EV-043, EV-044, EV-045 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-01005 | 326 | confirmed_gap | selected_course_content_or_outcome_gap | EV-031, EV-032, EV-033, EV-034, EV-035, EV-036, EV-037, EV-038, EV-039, EV-040, EV-041, EV-042, EV-043, EV-044, EV-045 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-01006 | 327 | confirmed_gap | scope_evidence_missing | EV-046 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01007 | 327 | confirmed_gap | offering_context_unverified | EV-046 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01008 | 327 | confirmed_gap | selected_course_citation_incomplete | EV-047, EV-048, EV-049, EV-050, EV-051, EV-052, EV-053, EV-054, EV-055, EV-056, EV-057, EV-058, EV-059, EV-060, EV-061, EV-062, EV-063, EV-064, EV-065, EV-066, EV-067, EV-068, EV-069, EV-070, EV-071, EV-072, EV-073, EV-074, EV-075, EV-076, EV-077, EV-078, EV-079, EV-080, EV-081, EV-082, EV-083, EV-084, EV-085, EV-086, EV-087, EV-088, EV-089, EV-090, EV-091 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-01009 | 327 | confirmed_gap | selected_course_content_or_outcome_gap | EV-047, EV-048, EV-049, EV-050, EV-051, EV-052, EV-053, EV-054, EV-055, EV-056, EV-057, EV-058, EV-059, EV-060, EV-061, EV-062, EV-063, EV-064, EV-065, EV-066, EV-067, EV-068, EV-069, EV-070, EV-071, EV-072, EV-073, EV-074, EV-075, EV-076, EV-077, EV-078, EV-079, EV-080, EV-081, EV-082, EV-083, EV-084, EV-085, EV-086, EV-087, EV-088, EV-089, EV-090, EV-091 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-01010 | 328 | confirmed_gap | scope_evidence_missing | EV-092 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01011 | 328 | confirmed_gap | offering_context_unverified | EV-092 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01012 | 328 | confirmed_gap | selected_course_citation_incomplete | EV-093, EV-094, EV-095, EV-096, EV-097, EV-098, EV-099, EV-100, EV-101, EV-102, EV-103, EV-104, EV-105, EV-106, EV-107, EV-108, EV-109, EV-110, EV-111, EV-112, EV-113, EV-114, EV-115, EV-116 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-01013 | 329 | confirmed_gap | scope_evidence_missing | EV-117 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01014 | 329 | confirmed_gap | offering_context_unverified | EV-117 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01015 | 329 | confirmed_gap | selected_course_citation_incomplete | EV-118 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-01016 | 330 | confirmed_gap | scope_evidence_missing | EV-119 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01017 | 330 | confirmed_gap | offering_context_unverified | EV-119 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01018 | 331 | confirmed_gap | scope_evidence_missing | EV-120 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01019 | 331 | confirmed_gap | offering_context_unverified | EV-120 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01020 | 332 | confirmed_gap | scope_evidence_missing | EV-121 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01021 | 332 | confirmed_gap | offering_context_unverified | EV-121 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01022 | 332 | confirmed_gap | external_or_custom_evidence_contract | EV-121 | For every external/custom course, retain an authoritative item-specific URL, locator, access date, provider/programme context, and limits of applicability; do not treat a custom scope as a CCMAS degree anchor. |
| SRC-01023 | 333 | confirmed_gap | scope_evidence_missing | EV-122 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01024 | 333 | confirmed_gap | offering_context_unverified | EV-122 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01025 | 334 | confirmed_gap | scope_evidence_missing | EV-123 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01026 | 334 | confirmed_gap | offering_context_unverified | EV-123 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01027 | 335 | confirmed_gap | scope_evidence_missing | EV-124 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01028 | 335 | confirmed_gap | offering_context_unverified | EV-124 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01029 | 335 | confirmed_gap | selected_course_citation_incomplete | EV-125, EV-126, EV-127, EV-128, EV-129, EV-130, EV-131, EV-132, EV-133, EV-134, EV-135 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-01030 | 335 | confirmed_gap | selected_course_content_or_outcome_gap | EV-125, EV-126, EV-127, EV-128, EV-129, EV-130, EV-131, EV-132, EV-133, EV-134, EV-135 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-01031 | 336 | confirmed_gap | scope_evidence_missing | EV-136 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01032 | 336 | confirmed_gap | offering_context_unverified | EV-136 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01033 | 336 | confirmed_gap | selected_course_citation_incomplete | EV-125, EV-126, EV-127, EV-128, EV-129, EV-130, EV-131, EV-132, EV-133, EV-134, EV-135 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-01034 | 336 | confirmed_gap | selected_course_content_or_outcome_gap | EV-125, EV-126, EV-127, EV-128, EV-129, EV-130, EV-131, EV-132, EV-133, EV-134, EV-135 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-01035 | 337 | confirmed_gap | scope_evidence_missing | EV-137 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01036 | 337 | confirmed_gap | offering_context_unverified | EV-137 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01037 | 337 | confirmed_gap | combined_scope_zero_courses | EV-137 | Build a bounded component-by-component evidence bundle; do not infer a union from the title or mark the programme unavailable solely because the local scope is empty. |
| SRC-01038 | 337 | candidate | scope_semantic_review_required | EV-137 | Reconcile the exact offering context, each named component, selected courses/outcomes, and supported student-facing status; a review label is not evidence of correctness. |
| SRC-01039 | 338 | confirmed_gap | scope_evidence_missing | EV-138 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01040 | 338 | confirmed_gap | offering_context_unverified | EV-138 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01041 | 338 | confirmed_gap | combined_scope_zero_courses | EV-138 | Build a bounded component-by-component evidence bundle; do not infer a union from the title or mark the programme unavailable solely because the local scope is empty. |
| SRC-01042 | 338 | candidate | scope_semantic_review_required | EV-138 | Reconcile the exact offering context, each named component, selected courses/outcomes, and supported student-facing status; a review label is not evidence of correctness. |
| SRC-01043 | 339 | confirmed_gap | scope_evidence_missing | EV-139 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01044 | 339 | confirmed_gap | offering_context_unverified | EV-139 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01045 | 339 | confirmed_gap | selected_course_citation_incomplete | EV-033, EV-036, EV-037, EV-038, EV-039, EV-040, EV-041, EV-042, EV-043, EV-044, EV-045 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-01046 | 339 | confirmed_gap | selected_course_content_or_outcome_gap | EV-033, EV-036, EV-037, EV-038, EV-039, EV-040, EV-041, EV-042, EV-043, EV-044, EV-045 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-01047 | 340 | confirmed_gap | scope_evidence_missing | EV-140 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01048 | 340 | confirmed_gap | offering_context_unverified | EV-140 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01049 | 340 | confirmed_gap | selected_course_citation_incomplete | EV-141, EV-142, EV-143, EV-144, EV-145, EV-146, EV-147, EV-148, EV-149, EV-150, EV-151, EV-152, EV-153, EV-154, EV-155, EV-156, EV-157, EV-158, EV-159, EV-160, EV-161, EV-162, EV-163, EV-164, EV-165, EV-166, EV-167 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-01050 | 340 | confirmed_gap | selected_course_content_or_outcome_gap | EV-141, EV-142, EV-143, EV-144, EV-145, EV-146, EV-147, EV-148, EV-149, EV-150, EV-151, EV-152, EV-153, EV-154, EV-155, EV-156, EV-157, EV-158, EV-159, EV-160, EV-161, EV-162, EV-163, EV-164, EV-165, EV-166, EV-167 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |

## Exact evidence URLs, locators, and access dates

### Structured evidence references attached to issue records

| Ref | URL | Exact locator | Accessed |
|---|---|---|---|
| EV-001 | none | engineering.txt → parsed row ordinal 17 → Geography | 2026-09-26 |
| EV-002 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 31 → Geography | 2026-09-26 |
| EV-003 | none | engineering.txt → parsed row ordinal 18 → Urban and Regional Planning | 2026-09-26 |
| EV-004 | none | engineering.txt → parsed row ordinal 19 → Industrial Design | 2026-09-26 |
| EV-005 | none | engineering.txt → parsed row ordinal 20 → Estate Management | 2026-09-26 |
| EV-006 | none | engineering.txt → parsed row ordinal 23 → Hotel Management and Tourism | 2026-09-26 |
| EV-007 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 101 | 2026-09-26 |
| EV-008 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 102 | 2026-09-26 |
| EV-009 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 203 | 2026-09-26 |
| EV-010 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 205 | 2026-09-26 |
| EV-011 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 209 | 2026-09-26 |
| EV-012 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 210 | 2026-09-26 |
| EV-013 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 212 | 2026-09-26 |
| EV-014 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 303 | 2026-09-26 |
| EV-015 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 305 | 2026-09-26 |
| EV-016 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 307 | 2026-09-26 |
| EV-017 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 309 | 2026-09-26 |
| EV-018 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 311 | 2026-09-26 |
| EV-019 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 313 | 2026-09-26 |
| EV-020 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 300 | 2026-09-26 |
| EV-021 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 402 | 2026-09-26 |
| EV-022 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 403 | 2026-09-26 |
| EV-023 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 406 | 2026-09-26 |
| EV-024 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code TRM 408 | 2026-09-26 |
| EV-025 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 410 | 2026-09-26 |
| EV-026 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code TRM 401 | 2026-09-26 |
| EV-027 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code TRM 403 | 2026-09-26 |
| EV-028 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code TRM 407 | 2026-09-26 |
| EV-029 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code TRM 412 | 2026-09-26 |
| EV-030 | none | engineering.txt → parsed row ordinal 24 → Home Economics and Food Management | 2026-09-26 |
| EV-031 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Family and Consumer Sciences → course code AGG 112 | 2026-09-26 |
| EV-032 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Family and Consumer Sciences → course code AGR 202 | 2026-09-26 |
| EV-033 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Family and Consumer Sciences → course code AGR 206 | 2026-09-26 |
| EV-034 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Family and Consumer Sciences → course code GST 312 | 2026-09-26 |
| EV-035 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Family and Consumer Sciences → course code ENT 312 | 2026-09-26 |
| EV-036 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Family and Consumer Sciences → course code FCS 303 | 2026-09-26 |
| EV-037 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Family and Consumer Sciences → course code FCS 411 | 2026-09-26 |
| EV-038 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Family and Consumer Sciences → course code FCS 413 | 2026-09-26 |
| EV-039 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Family and Consumer Sciences → course code FCS 415 | 2026-09-26 |
| EV-040 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Family and Consumer Sciences → course code FCS 321 | 2026-09-26 |
| EV-041 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Family and Consumer Sciences → course code FCS 325 | 2026-09-26 |
| EV-042 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Family and Consumer Sciences → course code FCS 423 | 2026-09-26 |
| EV-043 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Family and Consumer Sciences → course code FCS 331 | 2026-09-26 |
| EV-044 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Family and Consumer Sciences → course code FCS 333 | 2026-09-26 |
| EV-045 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Family and Consumer Sciences → course code FCS 431 | 2026-09-26 |
| EV-046 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 150 → Building Technology | 2026-09-26 |
| EV-047 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Building → course code CHM 101 | 2026-09-26 |
| EV-048 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Building → course code BUD 101 | 2026-09-26 |
| EV-049 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Building → course code BUD 102 | 2026-09-26 |
| EV-050 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Building → course code BUD 104 | 2026-09-26 |
| EV-051 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Building → course code BUD 122 | 2026-09-26 |
| EV-052 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Building → course code BUD 142 | 2026-09-26 |
| EV-053 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Building → course code BUD 201 | 2026-09-26 |
| EV-054 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Building → course code BUD 211 | 2026-09-26 |
| EV-055 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Building → course code BUD 221 | 2026-09-26 |
| EV-056 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Building → course code BUD 261 | 2026-09-26 |
| EV-057 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Building → course code BUD 271 | 2026-09-26 |
| EV-058 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Building → course code BUD 212 | 2026-09-26 |
| EV-059 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Building → course code BUD 251 | 2026-09-26 |
| EV-060 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Building → course code BUD 272 | 2026-09-26 |
| EV-061 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Building → course code BUD 321 | 2026-09-26 |
| EV-062 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Building → course code BUD 331 | 2026-09-26 |
| EV-063 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Building → course code BUD 341 | 2026-09-26 |
| EV-064 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Building → course code BUD 333 | 2026-09-26 |
| EV-065 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Building → course code BUD 361 | 2026-09-26 |
| EV-066 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Building → course code BUD 371 | 2026-09-26 |
| EV-067 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Building → course code BUD 381 | 2026-09-26 |
| EV-068 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Building → course code BUD 322 | 2026-09-26 |
| EV-069 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Building → course code BUD 332 | 2026-09-26 |
| EV-070 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Building → course code BUD 342 | 2026-09-26 |
| EV-071 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Building → course code BUD 312 | 2026-09-26 |
| EV-072 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Building → course code BUD 362 | 2026-09-26 |
| EV-073 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Building → course code BUD 372 | 2026-09-26 |
| EV-074 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Building → course code BUD 374 | 2026-09-26 |
| EV-075 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Building → course code BUD 376 | 2026-09-26 |
| EV-076 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Building → course code BUD 378 | 2026-09-26 |
| EV-077 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Building → course code BUD 402 | 2026-09-26 |
| EV-078 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Building → course code BUD 431 | 2026-09-26 |
| EV-079 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Building → course code BUD 441 | 2026-09-26 |
| EV-080 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Building → course code BUD 451 | 2026-09-26 |
| EV-081 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Building → course code BUD 461 | 2026-09-26 |
| EV-082 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Building → course code BUD 471 | 2026-09-26 |
| EV-083 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Building → course code BUD 481 | 2026-09-26 |
| EV-084 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Building → course code BUD 491 | 2026-09-26 |
| EV-085 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Building → course code BUD 512 | 2026-09-26 |
| EV-086 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Building → course code BUD 521 | 2026-09-26 |
| EV-087 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Building → course code BUD 522 | 2026-09-26 |
| EV-088 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Building → course code BUD 541 | 2026-09-26 |
| EV-089 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Building → course code BUD 572 | 2026-09-26 |
| EV-090 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Building → course code BUD 593 | 2026-09-26 |
| EV-091 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Building → course code BUD 594 | 2026-09-26 |
| EV-092 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 39 → Chemical Sciences | 2026-09-26 |
| EV-093 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code COS 101 | 2026-09-26 |
| EV-094 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 101 | 2026-09-26 |
| EV-095 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 102 | 2026-09-26 |
| EV-096 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 107 | 2026-09-26 |
| EV-097 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 108 | 2026-09-26 |
| EV-098 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 210 | 2026-09-26 |
| EV-099 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 211 | 2026-09-26 |
| EV-100 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 212 | 2026-09-26 |
| EV-101 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 213 | 2026-09-26 |
| EV-102 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 214 | 2026-09-26 |
| EV-103 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 207 | 2026-09-26 |
| EV-104 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 208 | 2026-09-26 |
| EV-105 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code STA 202 | 2026-09-26 |
| EV-106 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 301 | 2026-09-26 |
| EV-107 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 302 | 2026-09-26 |
| EV-108 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 303 | 2026-09-26 |
| EV-109 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 314 | 2026-09-26 |
| EV-110 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 319 | 2026-09-26 |
| EV-111 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 400 | 2026-09-26 |
| EV-112 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 401 | 2026-09-26 |
| EV-113 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 406 | 2026-09-26 |
| EV-114 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 410 | 2026-09-26 |
| EV-115 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 423 | 2026-09-26 |
| EV-116 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 424 | 2026-09-26 |
| EV-117 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 56 → Electronics | 2026-09-26 |
| EV-118 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics with Electronics → course code PHY 422 | 2026-09-26 |
| EV-119 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 47 → Environmental Health Science | 2026-09-26 |
| EV-120 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 37 → Environmental Management | 2026-09-26 |
| EV-121 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 165 → Environmental Science and Technology | 2026-09-26 |
| EV-122 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf | Administration.pdf → parsed row ordinal 21 → Environmental Standards | 2026-09-26 |
| EV-123 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 72 → FISHERIES AND AQUACULTURE | 2026-09-26 |
| EV-124 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 141 → Food Science & Nutrition | 2026-09-26 |
| EV-125 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → B.Sc./B.Tech Food Science and Technology → course code FST 201 | 2026-09-26 |
| EV-126 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → B.Sc./B.Tech Food Science and Technology → course code FST 301 | 2026-09-26 |
| EV-127 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → B.Sc./B.Tech Food Science and Technology → course code FST 302 | 2026-09-26 |
| EV-128 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → B.Sc./B.Tech Food Science and Technology → course code FST 303 | 2026-09-26 |
| EV-129 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → B.Sc./B.Tech Food Science and Technology → course code FST 304 | 2026-09-26 |
| EV-130 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → B.Sc./B.Tech Food Science and Technology → course code FST 306 | 2026-09-26 |
| EV-131 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → B.Sc./B.Tech Food Science and Technology → course code FST 401 | 2026-09-26 |
| EV-132 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → B.Sc./B.Tech Food Science and Technology → course code FST 402 | 2026-09-26 |
| EV-133 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → B.Sc./B.Tech Food Science and Technology → course code FST 405 | 2026-09-26 |
| EV-134 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → B.Sc./B.Tech Food Science and Technology → course code FST 502 | 2026-09-26 |
| EV-135 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → B.Sc./B.Tech Food Science and Technology → course code FST 505 | 2026-09-26 |
| EV-136 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 36 → Food Science and Technology | 2026-09-26 |
| EV-137 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 149 → Geography and Environmental Management | 2026-09-26 |
| EV-138 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 83 → Geography and Geosciences | 2026-09-26 |
| EV-139 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 116 → HOME SCIENCE | 2026-09-26 |
| EV-140 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 96 → INFORMATION AND MEDIA SCIENCE | 2026-09-26 |
| EV-141 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → INFORMATION AND MEDIA STUDIES — P12, P13, P14 → course code CMS 111 | 2026-09-26 |
| EV-142 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → INFORMATION AND MEDIA STUDIES — P12, P13, P14 → course code CMS 112 | 2026-09-26 |
| EV-143 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → INFORMATION AND MEDIA STUDIES — P12, P13, P14 → course code ISM 111 | 2026-09-26 |
| EV-144 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → INFORMATION AND MEDIA STUDIES — P12, P13, P14 → course code ISM 112 | 2026-09-26 |
| EV-145 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → INFORMATION AND MEDIA STUDIES — P12, P13, P14 → course code CMS 201 | 2026-09-26 |
| EV-146 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → INFORMATION AND MEDIA STUDIES — P12, P13, P14 → course code ISM 201 | 2026-09-26 |
| EV-147 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → INFORMATION AND MEDIA STUDIES — P12, P13, P14 → course code ISM 202 | 2026-09-26 |
| EV-148 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → INFORMATION AND MEDIA STUDIES — P12, P13, P14 → course code ISM 203 | 2026-09-26 |
| EV-149 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → INFORMATION AND MEDIA STUDIES — P12, P13, P14 → course code ISM 204 | 2026-09-26 |
| EV-150 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → INFORMATION AND MEDIA STUDIES — P12, P13, P14 → course code ISM 205 | 2026-09-26 |
| EV-151 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → INFORMATION AND MEDIA STUDIES — P12, P13, P14 → course code ISM 206 | 2026-09-26 |
| EV-152 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → INFORMATION AND MEDIA STUDIES — P12, P13, P14 → course code CMS 311 | 2026-09-26 |
| EV-153 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → INFORMATION AND MEDIA STUDIES — P12, P13, P14 → course code CMS 312 | 2026-09-26 |
| EV-154 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → INFORMATION AND MEDIA STUDIES — P12, P13, P14 → course code CMS 313 | 2026-09-26 |
| EV-155 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → INFORMATION AND MEDIA STUDIES — P12, P13, P14 → course code ISM 312 | 2026-09-26 |
| EV-156 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → INFORMATION AND MEDIA STUDIES — P12, P13, P14 → course code ISM 313 | 2026-09-26 |
| EV-157 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → INFORMATION AND MEDIA STUDIES — P12, P13, P14 → course code ISM 314 | 2026-09-26 |
| EV-158 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → INFORMATION AND MEDIA STUDIES — P12, P13, P14 → course code ISM 315 | 2026-09-26 |
| EV-159 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → INFORMATION AND MEDIA STUDIES — P12, P13, P14 → course code ISM 316 | 2026-09-26 |
| EV-160 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → INFORMATION AND MEDIA STUDIES — P12, P13, P14 → course code CMS 411 | 2026-09-26 |
| EV-161 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → INFORMATION AND MEDIA STUDIES — P12, P13, P14 → course code CMS 412 | 2026-09-26 |
| EV-162 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → INFORMATION AND MEDIA STUDIES — P12, P13, P14 → course code ISM 411 | 2026-09-26 |
| EV-163 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → INFORMATION AND MEDIA STUDIES — P12, P13, P14 → course code ISM 412 | 2026-09-26 |
| EV-164 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → INFORMATION AND MEDIA STUDIES — P12, P13, P14 → course code ISM 413 | 2026-09-26 |
| EV-165 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → INFORMATION AND MEDIA STUDIES — P12, P13, P14 → course code ISM 414 | 2026-09-26 |
| EV-166 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → INFORMATION AND MEDIA STUDIES — P12, P13, P14 → course code ISM 415 | 2026-09-26 |
| EV-167 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → INFORMATION AND MEDIA STUDIES — P12, P13, P14 → course code ISM 421 | 2026-09-26 |

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
- `data/career-mapping/_audit/jamb_ccmas_final_verification_rows_281_420_2026-09-26_005.md`
- `data/career-mapping/_audit/jamb_ccmas_final_verification_rows_281_420_2026-09-26_006.md`
- `data/career-mapping/_audit/jamb_ccmas_source_issue_queue_2026-09-26_001.json`
- `data/career-mapping/_audit/jamb_ccmas_source_issue_queue_2026-09-26_001.md`
- `data/career-mapping/_audit/jamb_curriculum_scopes_2026-08-17.json`
- `data/career-mapping/_audit/jamb_anomaly_inventory_2026-09-26.json`
- `data/career-mapping/_audit/jamb_offering_context_inventory_2026-09-25.json`
- `data/career-mapping/_audit/ccmas_extraction_anomaly_inventory_2026-09-26.json`


Closed work intentionally not reopened: French Arts anchor correction; Film and Video Studies Social/Management occurrence addition; recorded CCMAS page-header repairs; CAM424 equipment-spill repair; DTS498/CSC432 cross-reference repair; and replacement-character normalization classified as encoding-only.

## Disposition and resume boundary

This increment reconciles the current **321–340** queue against the prior row-level evidence. It does **not** close any identity: scope evidence, exact offering context, selected-course fidelity, item-level citations, and external/custom provenance remain open where listed. It performs no downstream domain/subgroup/role audit.

The next bounded increment is **identities 341–360**, maximum **20 identities/packages**, and must save its own append-only JSON/Markdown checkpoint before proceeding.

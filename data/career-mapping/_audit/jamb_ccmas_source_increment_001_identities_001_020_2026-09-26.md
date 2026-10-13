# JAMB–CCMAS source increment 001 — identities 001–020

**Audit date:** 2026-09-26 (Africa/Lagos)  
**Mode:** bounded reconciliation after checkpoint 003; append-only  
**Assigned lane:** JAMB identity/offering and CCMAS/external source integrity only  
**Write boundary:** no shared source, mapping, scope, seed, SQL, UI, downstream taxonomy, domain, subgroup, or role file was edited.

## Exact coverage inspected

- Canonical JAMB identities: **20/20**, rows **001–020**.
- Current queue records: **20 identity rows**, **66 current issue records**.
- Current selected-course occurrences represented by those rows: **217**.
- Parsed offering occurrences represented by those rows: **20**.
- CCMAS/external components inspected through the current records: **Administration and Management::Employment and Human Resource Management, Law::Common and Islamic Law, Law::Law, Sciences::Industrial Mathematics, Sciences::Statistics, Social Sciences::Criminology and Security Studies, Social Sciences::Demography and Social Statistics, Social Sciences::Development Studies, Social Sciences::Economics, Social Sciences::Peace Studies and Conflict Resolution, __custom__::Intelligence and Security Studies**.
- Prior row-level evidence was read first from the two final-gap checkpoints for rows 001–020; already-verified facts were not re-researched.

## Records inspected

| Row | JAMB identity | Component reference(s) | Current scope state | Selected courses | Offering records | Current issue IDs |
|---:|---|---|---|---:|---:|---|
| 001 | Civil Law | Law::Law | partial_scope_reviewed | 14 | 1 | SRC-00001, SRC-00002, SRC-00003, SRC-00004 |
| 002 | Islamic Law/Sharia Law | Law::Common and Islamic Law | partial_scope_reviewed | 11 | 1 | SRC-00005, SRC-00006, SRC-00007, SRC-00008 |
| 003 | Common and Islamic Law | Law::Common and Islamic Law | full | 0 | 1 | SRC-00009, SRC-00010 |
| 004 | Public and International Law | Law::Law | partial_scope_reviewed | 6 | 1 | SRC-00011, SRC-00012, SRC-00013, SRC-00014 |
| 005 | Criminology and Security Studies (printed under Law faculty block) | Social Sciences::Criminology and Security Studies | full | 0 | 1 | SRC-00015, SRC-00016 |
| 006 | Common Law | Law::Law | partial_scope_reviewed | 29 | 1 | SRC-00017, SRC-00018, SRC-00019, SRC-00020 |
| 007 | Criminology and Penology | Social Sciences::Criminology and Security Studies | partial_scope_reviewed | 18 | 1 | SRC-00021, SRC-00022, SRC-00023 |
| 008 | Criminology | Social Sciences::Criminology and Security Studies | partial_scope_reviewed | 17 | 1 | SRC-00024, SRC-00025, SRC-00026 |
| 009 | Criminology and Security Studies | Social Sciences::Criminology and Security Studies | full | 0 | 1 | SRC-00027, SRC-00028 |
| 010 | Demography and Social Statistics | Social Sciences::Demography and Social Statistics | full | 0 | 1 | SRC-00029, SRC-00030 |
| 011 | Demography and Statistics | Social Sciences::Demography and Social Statistics | partial_scope_reviewed | 19 | 1 | SRC-00031, SRC-00032, SRC-00033 |
| 012 | Demography and Social Studies | Social Sciences::Demography and Social Statistics | partial_scope_reviewed | 26 | 1 | SRC-00034, SRC-00035, SRC-00036 |
| 013 | Population Studies | Social Sciences::Demography and Social Statistics | partial_scope_reviewed | 18 | 1 | SRC-00037, SRC-00038, SRC-00039 |
| 014 | Economics and Statistics | Social Sciences::Economics, Sciences::Statistics | combined_scope_review_required | 0 | 1 | SRC-00040, SRC-00041, SRC-00042, SRC-00043 |
| 015 | Economics and Development Studies | Social Sciences::Economics, Social Sciences::Development Studies | combined_scope_review_required | 0 | 1 | SRC-00044, SRC-00045, SRC-00046, SRC-00047 |
| 016 | Economics with/and Operation Research | Social Sciences::Economics, Sciences::Industrial Mathematics | combined_scope_review_required | 0 | 1 | SRC-00048, SRC-00049, SRC-00050, SRC-00051 |
| 017 | Peace and Development Studies | Social Sciences::Development Studies, Social Sciences::Peace Studies and Conflict Resolution | combined_scope_review_required | 0 | 1 | SRC-00052, SRC-00053, SRC-00054, SRC-00055 |
| 018 | Industrial Relations / Industrial and Labour Relations | Administration and Management::Employment and Human Resource Management | partial_scope_reviewed | 14 | 1 | SRC-00056, SRC-00057, SRC-00058 |
| 019 | Industrial Relations and Personnel Management / Industrial Relations and Human Resource Management | Administration and Management::Employment and Human Resource Management | partial_scope_reviewed | 27 | 1 | SRC-00059, SRC-00060, SRC-00061 |
| 020 | Intelligence and Security Studies | __custom__::Intelligence and Security Studies | external_scope_evidenced | 18 | 1 | SRC-00062, SRC-00063, SRC-00064, SRC-00065, SRC-00066 |

## Current issue counts

- Confirmed gaps still open: **62**.
- Candidate issues still open: **4**.
- New issue classes discovered in this reconciliation: **0**.
- Closed findings reopened: **0**.
- Distinct exact evidence references captured: **153**.

By issue type/status:

- `combined_scope_zero_courses` / `confirmed_gap`: 4
- `external_or_custom_evidence_contract` / `confirmed_gap`: 1
- `offering_context_unverified` / `confirmed_gap`: 20
- `scope_evidence_missing` / `confirmed_gap`: 20
- `scope_semantic_review_required` / `candidate`: 4
- `selected_course_citation_incomplete` / `confirmed_gap`: 12
- `selected_course_content_or_outcome_gap` / `confirmed_gap`: 5

## Confirmed and candidate issue ledger

The following are current open records carried from the source issue queue. They are not claims that every record below is an academic-content defect; provenance, offering-context, and citation gaps remain distinct from content defects.

| Issue | Row | Status | Type | Evidence refs | Recommendation |
|---|---:|---|---|---|---|
| SRC-00001 | 001 | confirmed_gap | scope_evidence_missing | EV-001 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00002 | 001 | confirmed_gap | offering_context_unverified | EV-001 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00003 | 001 | confirmed_gap | selected_course_citation_incomplete | EV-002, EV-003, EV-004, EV-005, EV-006, EV-007, EV-008, EV-009, EV-010, EV-011, EV-012, EV-013, EV-014, EV-015 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00004 | 001 | confirmed_gap | selected_course_content_or_outcome_gap | EV-002, EV-003, EV-004, EV-005, EV-006, EV-007, EV-008, EV-009, EV-010, EV-011, EV-012, EV-013, EV-014, EV-015 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00005 | 002 | confirmed_gap | scope_evidence_missing | EV-016 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00006 | 002 | confirmed_gap | offering_context_unverified | EV-016 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00007 | 002 | confirmed_gap | selected_course_citation_incomplete | EV-017, EV-018, EV-019, EV-020, EV-021, EV-022, EV-023, EV-024, EV-025, EV-026, EV-027 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00008 | 002 | confirmed_gap | selected_course_content_or_outcome_gap | EV-017, EV-018, EV-019, EV-020, EV-021, EV-022, EV-023, EV-024, EV-025, EV-026, EV-027 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00009 | 003 | confirmed_gap | scope_evidence_missing | EV-028 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00010 | 003 | confirmed_gap | offering_context_unverified | EV-028 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00011 | 004 | confirmed_gap | scope_evidence_missing | EV-029 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00012 | 004 | confirmed_gap | offering_context_unverified | EV-029 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00013 | 004 | confirmed_gap | selected_course_citation_incomplete | EV-030, EV-031, EV-032, EV-033, EV-034, EV-035 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00014 | 004 | confirmed_gap | selected_course_content_or_outcome_gap | EV-030, EV-031, EV-032, EV-033, EV-034, EV-035 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00015 | 005 | confirmed_gap | scope_evidence_missing | EV-036 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00016 | 005 | confirmed_gap | offering_context_unverified | EV-036 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00017 | 006 | confirmed_gap | scope_evidence_missing | EV-037 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00018 | 006 | confirmed_gap | offering_context_unverified | EV-037 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00019 | 006 | confirmed_gap | selected_course_citation_incomplete | EV-002, EV-003, EV-004, EV-005, EV-006, EV-007, EV-008, EV-009, EV-010, EV-011, EV-031, EV-032, EV-038, EV-039, EV-040, EV-041, EV-042, EV-043, EV-044, EV-045, EV-046, EV-047, EV-048, EV-049, EV-050, EV-051, EV-052, EV-053, EV-054 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00020 | 006 | confirmed_gap | selected_course_content_or_outcome_gap | EV-002, EV-003, EV-004, EV-005, EV-006, EV-007, EV-008, EV-009, EV-010, EV-011, EV-031, EV-032, EV-038, EV-039, EV-040, EV-041, EV-042, EV-043, EV-044, EV-045, EV-046, EV-047, EV-048, EV-049, EV-050, EV-051, EV-052, EV-053, EV-054 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00021 | 007 | confirmed_gap | scope_evidence_missing | EV-055 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00022 | 007 | confirmed_gap | offering_context_unverified | EV-055 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00023 | 007 | confirmed_gap | selected_course_citation_incomplete | EV-056, EV-057, EV-058, EV-059, EV-060, EV-061, EV-062, EV-063, EV-064, EV-065, EV-066, EV-067, EV-068, EV-069, EV-070, EV-071, EV-072, EV-073 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00024 | 008 | confirmed_gap | scope_evidence_missing | EV-074 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00025 | 008 | confirmed_gap | offering_context_unverified | EV-074 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00026 | 008 | confirmed_gap | selected_course_citation_incomplete | EV-056, EV-057, EV-058, EV-059, EV-060, EV-061, EV-062, EV-063, EV-064, EV-066, EV-067, EV-068, EV-069, EV-070, EV-071, EV-072, EV-073 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00027 | 009 | confirmed_gap | scope_evidence_missing | EV-075 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00028 | 009 | confirmed_gap | offering_context_unverified | EV-075 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00029 | 010 | confirmed_gap | scope_evidence_missing | EV-076 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00030 | 010 | confirmed_gap | offering_context_unverified | EV-076 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00031 | 011 | confirmed_gap | scope_evidence_missing | EV-077 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00032 | 011 | confirmed_gap | offering_context_unverified | EV-077 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00033 | 011 | confirmed_gap | selected_course_citation_incomplete | EV-078, EV-079, EV-080, EV-081, EV-082, EV-083, EV-084, EV-085, EV-086, EV-087, EV-088, EV-089, EV-090, EV-091, EV-092, EV-093, EV-094 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00034 | 012 | confirmed_gap | scope_evidence_missing | EV-095 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00035 | 012 | confirmed_gap | offering_context_unverified | EV-095 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00036 | 012 | confirmed_gap | selected_course_citation_incomplete | EV-078, EV-079, EV-080, EV-081, EV-082, EV-083, EV-084, EV-085, EV-086, EV-087, EV-088, EV-089, EV-090, EV-091, EV-092, EV-093, EV-094, EV-096, EV-097, EV-098, EV-099, EV-100 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00037 | 013 | confirmed_gap | scope_evidence_missing | EV-101 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00038 | 013 | confirmed_gap | offering_context_unverified | EV-101 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00039 | 013 | confirmed_gap | selected_course_citation_incomplete | EV-078, EV-079, EV-080, EV-081, EV-082, EV-083, EV-084, EV-085, EV-086, EV-087, EV-088, EV-089, EV-090, EV-091, EV-092, EV-093 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00040 | 014 | confirmed_gap | scope_evidence_missing | EV-102 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00041 | 014 | confirmed_gap | offering_context_unverified | EV-102 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00042 | 014 | confirmed_gap | combined_scope_zero_courses | EV-102 | Build a bounded component-by-component evidence bundle; do not infer a union from the title or mark the programme unavailable solely because the local scope is empty. |
| SRC-00043 | 014 | candidate | scope_semantic_review_required | EV-102 | Reconcile the exact offering context, each named component, selected courses/outcomes, and supported student-facing status; a review label is not evidence of correctness. |
| SRC-00044 | 015 | confirmed_gap | scope_evidence_missing | EV-103 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00045 | 015 | confirmed_gap | offering_context_unverified | EV-103 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00046 | 015 | confirmed_gap | combined_scope_zero_courses | EV-103 | Build a bounded component-by-component evidence bundle; do not infer a union from the title or mark the programme unavailable solely because the local scope is empty. |
| SRC-00047 | 015 | candidate | scope_semantic_review_required | EV-103 | Reconcile the exact offering context, each named component, selected courses/outcomes, and supported student-facing status; a review label is not evidence of correctness. |
| SRC-00048 | 016 | confirmed_gap | scope_evidence_missing | EV-104 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00049 | 016 | confirmed_gap | offering_context_unverified | EV-104 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00050 | 016 | confirmed_gap | combined_scope_zero_courses | EV-104 | Build a bounded component-by-component evidence bundle; do not infer a union from the title or mark the programme unavailable solely because the local scope is empty. |
| SRC-00051 | 016 | candidate | scope_semantic_review_required | EV-104 | Reconcile the exact offering context, each named component, selected courses/outcomes, and supported student-facing status; a review label is not evidence of correctness. |
| SRC-00052 | 017 | confirmed_gap | scope_evidence_missing | EV-105 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00053 | 017 | confirmed_gap | offering_context_unverified | EV-105 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00054 | 017 | confirmed_gap | combined_scope_zero_courses | EV-105 | Build a bounded component-by-component evidence bundle; do not infer a union from the title or mark the programme unavailable solely because the local scope is empty. |
| SRC-00055 | 017 | candidate | scope_semantic_review_required | EV-105 | Reconcile the exact offering context, each named component, selected courses/outcomes, and supported student-facing status; a review label is not evidence of correctness. |
| SRC-00056 | 018 | confirmed_gap | scope_evidence_missing | EV-106 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00057 | 018 | confirmed_gap | offering_context_unverified | EV-106 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00058 | 018 | confirmed_gap | selected_course_citation_incomplete | EV-107, EV-108, EV-109, EV-110, EV-111, EV-112, EV-113, EV-114, EV-115, EV-116, EV-117, EV-118, EV-119, EV-120 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00059 | 019 | confirmed_gap | scope_evidence_missing | EV-121 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00060 | 019 | confirmed_gap | offering_context_unverified | EV-121 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00061 | 019 | confirmed_gap | selected_course_citation_incomplete | EV-107, EV-108, EV-109, EV-110, EV-111, EV-112, EV-113, EV-114, EV-115, EV-116, EV-117, EV-118, EV-119, EV-120, EV-122, EV-123, EV-124, EV-125, EV-126, EV-127, EV-128, EV-129, EV-130, EV-131, EV-132, EV-133, EV-134 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00062 | 020 | confirmed_gap | scope_evidence_missing | EV-135 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00063 | 020 | confirmed_gap | offering_context_unverified | EV-135 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00064 | 020 | confirmed_gap | selected_course_citation_incomplete | EV-136, EV-137, EV-138, EV-139, EV-140, EV-141, EV-142, EV-143, EV-144, EV-145, EV-146, EV-147, EV-148, EV-149, EV-150, EV-151, EV-152, EV-153 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00065 | 020 | confirmed_gap | selected_course_content_or_outcome_gap | EV-136, EV-137, EV-138, EV-139, EV-140, EV-141, EV-142, EV-143, EV-144, EV-145, EV-146, EV-147, EV-148, EV-149, EV-150, EV-151, EV-152, EV-153 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00066 | 020 | confirmed_gap | external_or_custom_evidence_contract | EV-135 | For every external/custom course, retain an authoritative item-specific URL, locator, access date, provider/programme context, and limits of applicability; do not treat a custom scope as a CCMAS degree anchor. |

## Exact evidence URLs, locators, and access dates

### Structured evidence references attached to issue records

| Ref | URL | Exact locator | Accessed |
|---|---|---|---|
| EV-001 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-law.pdf | Law.pdf → parsed row ordinal 1 → Civil Law | 2026-09-26 |
| EV-002 | https://www.nuc.edu.ng/ccmas/ | law.json → Law → course code CIL 201 | 2026-09-26 |
| EV-003 | https://www.nuc.edu.ng/ccmas/ | law.json → Law → course code CIL 202 | 2026-09-26 |
| EV-004 | https://www.nuc.edu.ng/ccmas/ | law.json → Law → course code PPL 301 | 2026-09-26 |
| EV-005 | https://www.nuc.edu.ng/ccmas/ | law.json → Law → course code PPL 302 | 2026-09-26 |
| EV-006 | https://www.nuc.edu.ng/ccmas/ | law.json → Law → course code CIL 303 | 2026-09-26 |
| EV-007 | https://www.nuc.edu.ng/ccmas/ | law.json → Law → course code CIL 304 | 2026-09-26 |
| EV-008 | https://www.nuc.edu.ng/ccmas/ | law.json → Law → course code PPL 405 | 2026-09-26 |
| EV-009 | https://www.nuc.edu.ng/ccmas/ | law.json → Law → course code PPL 406 | 2026-09-26 |
| EV-010 | https://www.nuc.edu.ng/ccmas/ | law.json → Law → course code PPL 501 | 2026-09-26 |
| EV-011 | https://www.nuc.edu.ng/ccmas/ | law.json → Law → course code PPL 502 | 2026-09-26 |
| EV-012 | https://www.nuc.edu.ng/ccmas/ | law.json → Law → course code Conveyancing | 2026-09-26 |
| EV-013 | https://www.nuc.edu.ng/ccmas/ | law.json → Law → course code Law of Intellectual Property | 2026-09-26 |
| EV-014 | https://www.nuc.edu.ng/ccmas/ | law.json → Law → course code Islamic Law of Crimes and Tort | 2026-09-26 |
| EV-015 | https://www.nuc.edu.ng/ccmas/ | law.json → Law → course code Islamic Law of Transactions | 2026-09-26 |
| EV-016 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-law.pdf | Law.pdf → parsed row ordinal 2 → Islamic Law/Sharia Law | 2026-09-26 |
| EV-017 | https://www.nuc.edu.ng/ccmas/ | law.json → Common and Islamic Law → course code ICL 101 | 2026-09-26 |
| EV-018 | https://www.nuc.edu.ng/ccmas/ | law.json → Common and Islamic Law → course code ICL 203 | 2026-09-26 |
| EV-019 | https://www.nuc.edu.ng/ccmas/ | law.json → Common and Islamic Law → course code ICL 204 | 2026-09-26 |
| EV-020 | https://www.nuc.edu.ng/ccmas/ | law.json → Common and Islamic Law → course code ICL 301 | 2026-09-26 |
| EV-021 | https://www.nuc.edu.ng/ccmas/ | law.json → Common and Islamic Law → course code ICL 304 | 2026-09-26 |
| EV-022 | https://www.nuc.edu.ng/ccmas/ | law.json → Common and Islamic Law → course code ICL 401 | 2026-09-26 |
| EV-023 | https://www.nuc.edu.ng/ccmas/ | law.json → Common and Islamic Law → course code ICL 402 | 2026-09-26 |
| EV-024 | https://www.nuc.edu.ng/ccmas/ | law.json → Common and Islamic Law → course code ICL 403 | 2026-09-26 |
| EV-025 | https://www.nuc.edu.ng/ccmas/ | law.json → Common and Islamic Law → course code ICL 501 | 2026-09-26 |
| EV-026 | https://www.nuc.edu.ng/ccmas/ | law.json → Common and Islamic Law → course code ICL 503 | 2026-09-26 |
| EV-027 | https://www.nuc.edu.ng/ccmas/ | law.json → Common and Islamic Law → course code ICL 505 | 2026-09-26 |
| EV-028 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-law.pdf | Law.pdf → parsed row ordinal 3 → Common and Islamic Law | 2026-09-26 |
| EV-029 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-law.pdf | Law.pdf → parsed row ordinal 4 → Public and International Law | 2026-09-26 |
| EV-030 | https://www.nuc.edu.ng/ccmas/ | law.json → Law → course code PHL 105 | 2026-09-26 |
| EV-031 | https://www.nuc.edu.ng/ccmas/ | law.json → Law → course code PUL 201 | 2026-09-26 |
| EV-032 | https://www.nuc.edu.ng/ccmas/ | law.json → Law → course code PUL 202 | 2026-09-26 |
| EV-033 | https://www.nuc.edu.ng/ccmas/ | law.json → Law → course code Administrative Law | 2026-09-26 |
| EV-034 | https://www.nuc.edu.ng/ccmas/ | law.json → Law → course code Public International Law | 2026-09-26 |
| EV-035 | https://www.nuc.edu.ng/ccmas/ | law.json → Law → course code Political Science/Elements of Government | 2026-09-26 |
| EV-036 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-law.pdf | Law.pdf → parsed row ordinal 5 → Criminology and Security Studies (printed under Law faculty block) | 2026-09-26 |
| EV-037 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-law.pdf | Law.pdf → parsed row ordinal 6 → Common Law | 2026-09-26 |
| EV-038 | https://www.nuc.edu.ng/ccmas/ | law.json → Law → course code PUL 101 | 2026-09-26 |
| EV-039 | https://www.nuc.edu.ng/ccmas/ | law.json → Law → course code PUL 102 | 2026-09-26 |
| EV-040 | https://www.nuc.edu.ng/ccmas/ | law.json → Law → course code LAW 101 | 2026-09-26 |
| EV-041 | https://www.nuc.edu.ng/ccmas/ | law.json → Law → course code LAW 102 | 2026-09-26 |
| EV-042 | https://www.nuc.edu.ng/ccmas/ | law.json → Law → course code PUL 203 | 2026-09-26 |
| EV-043 | https://www.nuc.edu.ng/ccmas/ | law.json → Law → course code PUL 204 | 2026-09-26 |
| EV-044 | https://www.nuc.edu.ng/ccmas/ | law.json → Law → course code PUL 301 | 2026-09-26 |
| EV-045 | https://www.nuc.edu.ng/ccmas/ | law.json → Law → course code PUL 302 | 2026-09-26 |
| EV-046 | https://www.nuc.edu.ng/ccmas/ | law.json → Law → course code PUL 401 | 2026-09-26 |
| EV-047 | https://www.nuc.edu.ng/ccmas/ | law.json → Law → course code PUL 402 | 2026-09-26 |
| EV-048 | https://www.nuc.edu.ng/ccmas/ | law.json → Law → course code PPL 403 | 2026-09-26 |
| EV-049 | https://www.nuc.edu.ng/ccmas/ | law.json → Law → course code PPL 404 | 2026-09-26 |
| EV-050 | https://www.nuc.edu.ng/ccmas/ | law.json → Law → course code CLE 401 | 2026-09-26 |
| EV-051 | https://www.nuc.edu.ng/ccmas/ | law.json → Law → course code CLE 402 | 2026-09-26 |
| EV-052 | https://www.nuc.edu.ng/ccmas/ | law.json → Law → course code JIL 501 | 2026-09-26 |
| EV-053 | https://www.nuc.edu.ng/ccmas/ | law.json → Law → course code JIL 502 | 2026-09-26 |
| EV-054 | https://www.nuc.edu.ng/ccmas/ | law.json → Law → course code LAW 599 | 2026-09-26 |
| EV-055 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf | Social Management Science.pdf → parsed row ordinal 2 → Criminology and Penology | 2026-09-26 |
| EV-056 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Criminology and Security Studies → course code CSS 101 | 2026-09-26 |
| EV-057 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Criminology and Security Studies → course code CSS 102 | 2026-09-26 |
| EV-058 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Criminology and Security Studies → course code CSS 103 | 2026-09-26 |
| EV-059 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Criminology and Security Studies → course code CSS 104 | 2026-09-26 |
| EV-060 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Criminology and Security Studies → course code CSS 201 | 2026-09-26 |
| EV-061 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Criminology and Security Studies → course code CSS 203 | 2026-09-26 |
| EV-062 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Criminology and Security Studies → course code CSS 204 | 2026-09-26 |
| EV-063 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Criminology and Security Studies → course code CSS 202 | 2026-09-26 |
| EV-064 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Criminology and Security Studies → course code CSS 205 | 2026-09-26 |
| EV-065 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Criminology and Security Studies → course code CSS 207 | 2026-09-26 |
| EV-066 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Criminology and Security Studies → course code CSS 301 | 2026-09-26 |
| EV-067 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Criminology and Security Studies → course code CSS 303 | 2026-09-26 |
| EV-068 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Criminology and Security Studies → course code CSS 305 | 2026-09-26 |
| EV-069 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Criminology and Security Studies → course code CSS 304 | 2026-09-26 |
| EV-070 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Criminology and Security Studies → course code CSS 306 | 2026-09-26 |
| EV-071 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Criminology and Security Studies → course code CSS 401 | 2026-09-26 |
| EV-072 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Criminology and Security Studies → course code CSS 403 | 2026-09-26 |
| EV-073 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Criminology and Security Studies → course code CSS 405 | 2026-09-26 |
| EV-074 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf | Social Management Science.pdf → parsed row ordinal 3 → Criminology | 2026-09-26 |
| EV-075 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf | Social Management Science.pdf → parsed row ordinal 4 → Criminology and Security Studies | 2026-09-26 |
| EV-076 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf | Social Management Science.pdf → parsed row ordinal 5 → Demography and Social Statistics | 2026-09-26 |
| EV-077 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf | Social Management Science.pdf → parsed row ordinal 6 → Demography and Statistics | 2026-09-26 |
| EV-078 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Demography and Social Statistics → course code DSS 201 | 2026-09-26 |
| EV-079 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Demography and Social Statistics → course code DSS 202 | 2026-09-26 |
| EV-080 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Demography and Social Statistics → course code DSS 203 | 2026-09-26 |
| EV-081 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Demography and Social Statistics → course code DSS 204 | 2026-09-26 |
| EV-082 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Demography and Social Statistics → course code DSS 301 | 2026-09-26 |
| EV-083 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Demography and Social Statistics → course code DSS 302 | 2026-09-26 |
| EV-084 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Demography and Social Statistics → course code DSS 303 | 2026-09-26 |
| EV-085 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Demography and Social Statistics → course code DSS 304 | 2026-09-26 |
| EV-086 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Demography and Social Statistics → course code DSS 305 | 2026-09-26 |
| EV-087 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Demography and Social Statistics → course code DSS 307 | 2026-09-26 |
| EV-088 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Demography and Social Statistics → course code DSS 308 | 2026-09-26 |
| EV-089 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Demography and Social Statistics → course code DSS 309 | 2026-09-26 |
| EV-090 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Demography and Social Statistics → course code DSS 401 | 2026-09-26 |
| EV-091 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Demography and Social Statistics → course code DSS 403 | 2026-09-26 |
| EV-092 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Demography and Social Statistics → course code DSS 404 | 2026-09-26 |
| EV-093 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Demography and Social Statistics → course code DSS 405 | 2026-09-26 |
| EV-094 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Demography and Social Statistics → course code DSS 406 | 2026-09-26 |
| EV-095 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf | Social Management Science.pdf → parsed row ordinal 7 → Demography and Social Studies | 2026-09-26 |
| EV-096 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Demography and Social Statistics → course code SOC 105 | 2026-09-26 |
| EV-097 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Demography and Social Statistics → course code ENT 312 | 2026-09-26 |
| EV-098 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Demography and Social Statistics → course code SSC 301 | 2026-09-26 |
| EV-099 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Demography and Social Statistics → course code SSC 302 | 2026-09-26 |
| EV-100 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Demography and Social Statistics → course code DSS 407 | 2026-09-26 |
| EV-101 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf | Social Management Science.pdf → parsed row ordinal 8 → Population Studies | 2026-09-26 |
| EV-102 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf | Social Management Science.pdf → parsed row ordinal 9 → Economics and Statistics | 2026-09-26 |
| EV-103 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf | Social Management Science.pdf → parsed row ordinal 10 → Economics and Development Studies | 2026-09-26 |
| EV-104 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf | Social Management Science.pdf → parsed row ordinal 11 → Economics with/and Operation Research | 2026-09-26 |
| EV-105 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf | Social Management Science.pdf → parsed row ordinal 12 → Peace and Development Studies | 2026-09-26 |
| EV-106 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf | Social Management Science.pdf → parsed row ordinal 14 → Industrial Relations / Industrial and Labour Relations | 2026-09-26 |
| EV-107 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 101 | 2026-09-26 |
| EV-108 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 102 | 2026-09-26 |
| EV-109 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 205 | 2026-09-26 |
| EV-110 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 301 | 2026-09-26 |
| EV-111 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 303 | 2026-09-26 |
| EV-112 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 305 | 2026-09-26 |
| EV-113 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 307 | 2026-09-26 |
| EV-114 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 308 | 2026-09-26 |
| EV-115 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 309 | 2026-09-26 |
| EV-116 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 310 | 2026-09-26 |
| EV-117 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 312 | 2026-09-26 |
| EV-118 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 402 | 2026-09-26 |
| EV-119 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 403 | 2026-09-26 |
| EV-120 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 407 | 2026-09-26 |
| EV-121 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf | Social Management Science.pdf → parsed row ordinal 15 → Industrial Relations and Personnel Management / Industrial Relations and Human Resource Management | 2026-09-26 |
| EV-122 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code GST 112 | 2026-09-26 |
| EV-123 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code AMS 103 | 2026-09-26 |
| EV-124 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code GST 212 | 2026-09-26 |
| EV-125 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 201 | 2026-09-26 |
| EV-126 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 203 | 2026-09-26 |
| EV-127 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 204 | 2026-09-26 |
| EV-128 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 207 | 2026-09-26 |
| EV-129 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code ENT 312 | 2026-09-26 |
| EV-130 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 302 | 2026-09-26 |
| EV-131 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 306 | 2026-09-26 |
| EV-132 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 311 | 2026-09-26 |
| EV-133 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 401 | 2026-09-26 |
| EV-134 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Employment and Human Resource Management → course code EHR 405 | 2026-09-26 |
| EV-135 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf | Social Management Science.pdf → parsed row ordinal 16 → Intelligence and Security Studies | 2026-09-26 |
| EV-136 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → CSS → course code CSS 101 | 2026-09-26 |
| EV-137 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → CSS → course code CSS 102 | 2026-09-26 |
| EV-138 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → CSS → course code CSS 201 | 2026-09-26 |
| EV-139 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → CSS → course code CSS 203 | 2026-09-26 |
| EV-140 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → CSS → course code CSS 204 | 2026-09-26 |
| EV-141 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → CSS → course code CSS 205 | 2026-09-26 |
| EV-142 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → CSS → course code CSS 302 | 2026-09-26 |
| EV-143 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → CSS → course code CSS 303 | 2026-09-26 |
| EV-144 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → CSS → course code CSS 304 | 2026-09-26 |
| EV-145 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → CSS → course code CSS 402 | 2026-09-26 |
| EV-146 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → CSS → course code CSS 403 | 2026-09-26 |
| EV-147 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → CSS → course code CSS 406 | 2026-09-26 |
| EV-148 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → DSS → course code DSS 305 | 2026-09-26 |
| EV-149 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → IRS → course code IRS 404 | 2026-09-26 |
| EV-150 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → POL → course code POL 401 | 2026-09-26 |
| EV-151 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → POL → course code POL 403 | 2026-09-26 |
| EV-152 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → PCR → course code PCR 301 | 2026-09-26 |
| EV-153 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → PSY → course code PSY 401 | 2026-09-26 |

### Authoritative source packages read in the prior row-level verification

| URL | Exact locator | Accessed |
|---|---|---|
| https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-law.pdf | printed pp.419, 427-429; rows 001-006 | 2026-09-26 |
| https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf | printed pp.574, 616-617, 628-629, 683; rows 007-019 | 2026-09-26 |
| https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf | printed p.44; separate faculty context for row 018/019 | 2026-09-26 |
| https://www.nuc.edu.ng/wp-content/uploads/2026/03/Law-ALL.pdf | printed pp.27-28, 38-45, 52, 56 onward, 68, 72, 77, 80, 88; rows 001-006 | 2026-09-26 |
| https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | printed pp.26, 28-29, 33, 38-39, 48-52, 71-72, 95-107, 162-180; rows 005, 007-017, 020 | 2026-09-26 |
| https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | printed pp.326, 339, 739-742; bounded Operations Research/Statistics lead for row 016 | 2026-09-26 |
| https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | printed pp.183, 185-186, 197-202; rows 018-019 | 2026-09-26 |
| https://sdg.abuad.edu.ng/wp-content/uploads/2020/04/ABUAD_Course_Databank_2020.pdf | printed pp.93-95; institution-specific Intelligence and Security Studies evidence for row 020 | 2026-09-26 |

## Prior checkpoint and non-repetition controls

Read before this increment:

- `data/career-mapping/_audit/jamb_ccmas_source_phase_checkpoint_2026-09-26_003.json`
- `data/career-mapping/_audit/jamb_ccmas_source_phase_checkpoint_2026-09-26_003.md`
- `data/career-mapping/_audit/jamb_ccmas_final_gap_verification_rows_001_010_2026-09-26_001.md`
- `data/career-mapping/_audit/jamb_ccmas_final_gap_verification_rows_011_020_2026-09-26_001.md`
- `data/career-mapping/_audit/jamb_ccmas_source_issue_queue_2026-09-26_001.json`
- `data/career-mapping/_audit/jamb_ccmas_source_issue_queue_2026-09-26_001.md`
- `data/career-mapping/_audit/jamb_curriculum_scopes_2026-08-17.json`
- `data/career-mapping/_audit/jamb_anomaly_inventory_2026-09-26.json`
- `data/career-mapping/_audit/jamb_offering_context_inventory_2026-09-25.json`
- `data/career-mapping/_audit/ccmas_extraction_anomaly_inventory_2026-09-26.json`


Closed work intentionally not reopened: French Arts anchor correction; Film and Video Studies Social/Management occurrence addition; recorded CCMAS page-header repairs; CAM424 equipment-spill repair; DTS498/CSC432 cross-reference repair; and replacement-character normalization classified as encoding-only.

## Disposition and resume boundary

This increment reconciles the current 001–020 queue against the prior row-level evidence. It does **not** close any identity: scope evidence, exact offering context, selected-course fidelity, item-level citations, and external/custom provenance remain open where listed. It performs no downstream domain/subgroup/role audit.

The next bounded increment is **identities 021–040**, maximum **20 identities/packages**, and must save its own append-only JSON/Markdown checkpoint before proceeding.

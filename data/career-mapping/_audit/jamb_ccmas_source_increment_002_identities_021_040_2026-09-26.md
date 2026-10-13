# JAMB–CCMAS source increment 002 — identities 021–040

**Audit date:** 2026-09-26 (Africa/Lagos)  
**Mode:** bounded reconciliation after checkpoint 003; append-only  
**Assigned lane:** JAMB identity/offering and CCMAS/external source integrity only  
**Write boundary:** no shared source, mapping, scope, seed, SQL, UI, downstream taxonomy, domain, subgroup, or role file was edited.

## Exact coverage inspected

- Canonical JAMB identities: **20/20**, rows **021–040**.
- Current queue records: **20 identity rows**, **66 current issue records**.
- Current selected-course occurrences represented by those rows: **183**.
- Parsed offering occurrences represented by those rows: **22**.
- CCMAS/external components inspected through the current records: **Administration and Management::Public Administration, Arts::History/History and Diplomatic Studies, Social Sciences::International Relations, Social Sciences::Peace Studies and Conflict Resolution, Social Sciences::Political Science, __custom__::Social Justice**.
- Prior row-level evidence was read first from the existing final-gap checkpoint(s) for rows **021–040**; already-verified facts were not re-researched.

## Records inspected

| Row | JAMB identity | Component reference(s) | Current scope state | Selected courses | Offering records | Current issue IDs |
|---:|---|---|---|---:|---:|---|
| 021 | International Relations | Social Sciences::International Relations | full | 0 | 2 | SRC-00067, SRC-00068 |
| 022 | International Relations and Diplomacy | Social Sciences::International Relations | partial_scope_reviewed | 25 | 1 | SRC-00069, SRC-00070, SRC-00071 |
| 023 | International Relations and Diplomatic Studies | Social Sciences::International Relations | partial_scope_reviewed | 25 | 1 | SRC-00072, SRC-00073, SRC-00074 |
| 024 | International Studies | Social Sciences::International Relations | partial_scope_reviewed | 23 | 1 | SRC-00075, SRC-00076, SRC-00077 |
| 025 | International Studies and Diplomacy | Social Sciences::International Relations | partial_scope_reviewed | 23 | 2 | SRC-00078, SRC-00079, SRC-00080 |
| 026 | International and Comparative Politics | Social Sciences::International Relations, Social Sciences::Political Science | combined_scope_review_required | 0 | 1 | SRC-00081, SRC-00082, SRC-00083, SRC-00084 |
| 027 | International Relationship & Strategic Studies | Social Sciences::International Relations | partial_scope_reviewed | 26 | 1 | SRC-00085, SRC-00086, SRC-00087 |
| 028 | History and International Relations | Social Sciences::International Relations, Arts::History/History and Diplomatic Studies | combined_scope_review_required | 0 | 1 | SRC-00088, SRC-00089, SRC-00090, SRC-00091 |
| 029 | History and International Studies | Social Sciences::International Relations, Arts::History/History and Diplomatic Studies | combined_scope_review_required | 0 | 1 | SRC-00092, SRC-00093, SRC-00094, SRC-00095 |
| 030 | Policy and Strategic Studies | Social Sciences::Political Science | partial_scope_reviewed | 5 | 1 | SRC-00096, SRC-00097, SRC-00098 |
| 031 | Policy and Administrative Studies | Social Sciences::Political Science, Administration and Management::Public Administration | combined_scope_review_required | 0 | 1 | SRC-00099, SRC-00100, SRC-00101, SRC-00102 |
| 032 | Social Justice | __custom__::Social Justice | external_scope_evidenced | 23 | 1 | SRC-00103, SRC-00104, SRC-00105, SRC-00106, SRC-00107 |
| 033 | Political Science | Social Sciences::Political Science | full | 0 | 1 | SRC-00108, SRC-00109 |
| 034 | Political Science / International Law and Diplomacy | Social Sciences::Political Science, Social Sciences::International Relations | partial_scope_review_required | 7 | 1 | SRC-00110, SRC-00111 |
| 035 | Political Science and Diplomacy | Social Sciences::Political Science, Social Sciences::International Relations | combined_scope_review_required | 0 | 1 | SRC-00112, SRC-00113, SRC-00114, SRC-00115 |
| 036 | Political Science and Public Administration | Social Sciences::Political Science, Administration and Management::Public Administration | combined_scope_review_required | 0 | 1 | SRC-00116, SRC-00117, SRC-00118, SRC-00119 |
| 037 | Political and Administrative Studies | Social Sciences::Political Science | partial_scope_reviewed | 26 | 1 | SRC-00120, SRC-00121, SRC-00122, SRC-00123 |
| 038 | Political Science and International Relations | Social Sciences::Political Science, Social Sciences::International Relations | combined_scope_review_required | 0 | 1 | SRC-00124, SRC-00125, SRC-00126, SRC-00127 |
| 039 | Political Science and International Studies | Social Sciences::Political Science, Social Sciences::International Relations | combined_scope_review_required | 0 | 1 | SRC-00128, SRC-00129, SRC-00130, SRC-00131 |
| 040 | Political Science and Conflict Resolution | Social Sciences::Political Science, Social Sciences::Peace Studies and Conflict Resolution | combined_scope_review_required | 0 | 1 | SRC-00132, SRC-00133, SRC-00134, SRC-00135 |

## Current issue counts

- Confirmed gaps still open: **59**.
- Candidate issues still open: **10**.
- New issue classes discovered in this reconciliation: **0**.
- Closed findings reopened: **0**.
- Distinct exact evidence references captured: **100**.

By issue type/status:

- `combined_scope_zero_courses` / `confirmed_gap`: 9
- `external_or_custom_evidence_contract` / `confirmed_gap`: 1
- `offering_context_unverified` / `confirmed_gap`: 20
- `scope_evidence_missing` / `confirmed_gap`: 19
- `scope_semantic_review_required` / `candidate`: 10
- `selected_course_citation_incomplete` / `confirmed_gap`: 8
- `selected_course_content_or_outcome_gap` / `confirmed_gap`: 2

## Confirmed and candidate issue ledger

The following are current open records carried from the source issue queue. They are not claims that every record below is an academic-content defect; provenance, offering-context, and citation gaps remain distinct from content defects.

| Issue | Row | Status | Type | Evidence refs | Recommendation |
|---|---:|---|---|---|---|
| SRC-00067 | 021 | confirmed_gap | scope_evidence_missing | EV-001, EV-002 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00068 | 021 | confirmed_gap | offering_context_unverified | EV-001, EV-002 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00069 | 022 | confirmed_gap | scope_evidence_missing | EV-003 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00070 | 022 | confirmed_gap | offering_context_unverified | EV-003 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00071 | 022 | confirmed_gap | selected_course_citation_incomplete | EV-004, EV-005, EV-006, EV-007, EV-008, EV-009, EV-010, EV-011, EV-012, EV-013, EV-014, EV-015, EV-016, EV-017, EV-018, EV-019, EV-020, EV-021, EV-022, EV-023, EV-024, EV-025, EV-026, EV-027, EV-028 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00072 | 023 | confirmed_gap | scope_evidence_missing | EV-029 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00073 | 023 | confirmed_gap | offering_context_unverified | EV-029 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00074 | 023 | confirmed_gap | selected_course_citation_incomplete | EV-004, EV-005, EV-006, EV-007, EV-008, EV-009, EV-010, EV-011, EV-012, EV-013, EV-014, EV-015, EV-016, EV-017, EV-018, EV-019, EV-020, EV-021, EV-022, EV-023, EV-024, EV-025, EV-026, EV-027, EV-028 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00075 | 024 | confirmed_gap | scope_evidence_missing | EV-030 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00076 | 024 | confirmed_gap | offering_context_unverified | EV-030 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00077 | 024 | confirmed_gap | selected_course_citation_incomplete | EV-004, EV-005, EV-006, EV-007, EV-008, EV-009, EV-012, EV-013, EV-014, EV-015, EV-016, EV-017, EV-018, EV-019, EV-020, EV-021, EV-022, EV-023, EV-024, EV-025, EV-026, EV-027, EV-028 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00078 | 025 | confirmed_gap | scope_evidence_missing | EV-031, EV-032 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00079 | 025 | confirmed_gap | offering_context_unverified | EV-031, EV-032 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00080 | 025 | confirmed_gap | selected_course_citation_incomplete | EV-004, EV-005, EV-006, EV-007, EV-008, EV-009, EV-012, EV-013, EV-014, EV-015, EV-016, EV-017, EV-018, EV-019, EV-020, EV-021, EV-022, EV-023, EV-024, EV-025, EV-026, EV-027, EV-028 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00081 | 026 | confirmed_gap | scope_evidence_missing | EV-033 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00082 | 026 | confirmed_gap | offering_context_unverified | EV-033 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00083 | 026 | confirmed_gap | combined_scope_zero_courses | EV-033 | Build a bounded component-by-component evidence bundle; do not infer a union from the title or mark the programme unavailable solely because the local scope is empty. |
| SRC-00084 | 026 | candidate | scope_semantic_review_required | EV-033 | Reconcile the exact offering context, each named component, selected courses/outcomes, and supported student-facing status; a review label is not evidence of correctness. |
| SRC-00085 | 027 | confirmed_gap | scope_evidence_missing | EV-034 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00086 | 027 | confirmed_gap | offering_context_unverified | EV-034 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00087 | 027 | confirmed_gap | selected_course_citation_incomplete | EV-004, EV-005, EV-006, EV-007, EV-008, EV-009, EV-010, EV-011, EV-012, EV-013, EV-014, EV-015, EV-016, EV-017, EV-018, EV-019, EV-020, EV-021, EV-022, EV-023, EV-024, EV-025, EV-026, EV-027, EV-028, EV-035 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00088 | 028 | confirmed_gap | scope_evidence_missing | EV-036 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00089 | 028 | confirmed_gap | offering_context_unverified | EV-036 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00090 | 028 | confirmed_gap | combined_scope_zero_courses | EV-036 | Build a bounded component-by-component evidence bundle; do not infer a union from the title or mark the programme unavailable solely because the local scope is empty. |
| SRC-00091 | 028 | candidate | scope_semantic_review_required | EV-036 | Reconcile the exact offering context, each named component, selected courses/outcomes, and supported student-facing status; a review label is not evidence of correctness. |
| SRC-00092 | 029 | confirmed_gap | scope_evidence_missing | EV-037 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00093 | 029 | confirmed_gap | offering_context_unverified | EV-037 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00094 | 029 | confirmed_gap | combined_scope_zero_courses | EV-037 | Build a bounded component-by-component evidence bundle; do not infer a union from the title or mark the programme unavailable solely because the local scope is empty. |
| SRC-00095 | 029 | candidate | scope_semantic_review_required | EV-037 | Reconcile the exact offering context, each named component, selected courses/outcomes, and supported student-facing status; a review label is not evidence of correctness. |
| SRC-00096 | 030 | confirmed_gap | scope_evidence_missing | EV-038 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00097 | 030 | confirmed_gap | offering_context_unverified | EV-038 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00098 | 030 | confirmed_gap | selected_course_citation_incomplete | EV-039, EV-040, EV-041, EV-042, EV-043 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00099 | 031 | confirmed_gap | scope_evidence_missing | EV-044 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00100 | 031 | confirmed_gap | offering_context_unverified | EV-044 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00101 | 031 | confirmed_gap | combined_scope_zero_courses | EV-044 | Build a bounded component-by-component evidence bundle; do not infer a union from the title or mark the programme unavailable solely because the local scope is empty. |
| SRC-00102 | 031 | candidate | scope_semantic_review_required | EV-044 | Reconcile the exact offering context, each named component, selected courses/outcomes, and supported student-facing status; a review label is not evidence of correctness. |
| SRC-00103 | 032 | confirmed_gap | scope_evidence_missing | EV-045 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00104 | 032 | confirmed_gap | offering_context_unverified | EV-045 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00105 | 032 | confirmed_gap | selected_course_citation_incomplete | EV-046, EV-047, EV-048, EV-049, EV-050, EV-051, EV-052, EV-053, EV-054, EV-055, EV-056, EV-057, EV-058, EV-059, EV-060, EV-061, EV-062, EV-063, EV-064, EV-065, EV-066, EV-067, EV-068 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00106 | 032 | confirmed_gap | selected_course_content_or_outcome_gap | EV-046, EV-047, EV-048, EV-049, EV-050, EV-051, EV-052, EV-053, EV-054, EV-055, EV-056, EV-057, EV-058, EV-059, EV-060, EV-061, EV-062, EV-063, EV-064, EV-065, EV-066, EV-067, EV-068 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00107 | 032 | confirmed_gap | external_or_custom_evidence_contract | EV-045 | For every external/custom course, retain an authoritative item-specific URL, locator, access date, provider/programme context, and limits of applicability; do not treat a custom scope as a CCMAS degree anchor. |
| SRC-00108 | 033 | confirmed_gap | scope_evidence_missing | EV-069 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00109 | 033 | confirmed_gap | offering_context_unverified | EV-069 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00110 | 034 | confirmed_gap | offering_context_unverified | EV-070 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00111 | 034 | candidate | scope_semantic_review_required | EV-071, EV-072, EV-073 | Reconcile the exact offering context, each named component, selected courses/outcomes, and supported student-facing status; a review label is not evidence of correctness. |
| SRC-00112 | 035 | confirmed_gap | scope_evidence_missing | EV-074 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00113 | 035 | confirmed_gap | offering_context_unverified | EV-074 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00114 | 035 | confirmed_gap | combined_scope_zero_courses | EV-074 | Build a bounded component-by-component evidence bundle; do not infer a union from the title or mark the programme unavailable solely because the local scope is empty. |
| SRC-00115 | 035 | candidate | scope_semantic_review_required | EV-074 | Reconcile the exact offering context, each named component, selected courses/outcomes, and supported student-facing status; a review label is not evidence of correctness. |
| SRC-00116 | 036 | confirmed_gap | scope_evidence_missing | EV-075 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00117 | 036 | confirmed_gap | offering_context_unverified | EV-075 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00118 | 036 | confirmed_gap | combined_scope_zero_courses | EV-075 | Build a bounded component-by-component evidence bundle; do not infer a union from the title or mark the programme unavailable solely because the local scope is empty. |
| SRC-00119 | 036 | candidate | scope_semantic_review_required | EV-075 | Reconcile the exact offering context, each named component, selected courses/outcomes, and supported student-facing status; a review label is not evidence of correctness. |
| SRC-00120 | 037 | confirmed_gap | scope_evidence_missing | EV-076 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00121 | 037 | confirmed_gap | offering_context_unverified | EV-076 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00122 | 037 | confirmed_gap | selected_course_citation_incomplete | EV-039, EV-040, EV-041, EV-042, EV-043, EV-077, EV-078, EV-079, EV-080, EV-081, EV-082, EV-083, EV-084, EV-085, EV-086, EV-087, EV-088, EV-089, EV-090, EV-091, EV-092, EV-093, EV-094, EV-095, EV-096, EV-097 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00123 | 037 | confirmed_gap | selected_course_content_or_outcome_gap | EV-039, EV-040, EV-041, EV-042, EV-043, EV-077, EV-078, EV-079, EV-080, EV-081, EV-082, EV-083, EV-084, EV-085, EV-086, EV-087, EV-088, EV-089, EV-090, EV-091, EV-092, EV-093, EV-094, EV-095, EV-096, EV-097 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00124 | 038 | confirmed_gap | scope_evidence_missing | EV-098 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00125 | 038 | confirmed_gap | offering_context_unverified | EV-098 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00126 | 038 | confirmed_gap | combined_scope_zero_courses | EV-098 | Build a bounded component-by-component evidence bundle; do not infer a union from the title or mark the programme unavailable solely because the local scope is empty. |
| SRC-00127 | 038 | candidate | scope_semantic_review_required | EV-098 | Reconcile the exact offering context, each named component, selected courses/outcomes, and supported student-facing status; a review label is not evidence of correctness. |
| SRC-00128 | 039 | confirmed_gap | scope_evidence_missing | EV-099 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00129 | 039 | confirmed_gap | offering_context_unverified | EV-099 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00130 | 039 | confirmed_gap | combined_scope_zero_courses | EV-099 | Build a bounded component-by-component evidence bundle; do not infer a union from the title or mark the programme unavailable solely because the local scope is empty. |
| SRC-00131 | 039 | candidate | scope_semantic_review_required | EV-099 | Reconcile the exact offering context, each named component, selected courses/outcomes, and supported student-facing status; a review label is not evidence of correctness. |
| SRC-00132 | 040 | confirmed_gap | scope_evidence_missing | EV-100 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00133 | 040 | confirmed_gap | offering_context_unverified | EV-100 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00134 | 040 | confirmed_gap | combined_scope_zero_courses | EV-100 | Build a bounded component-by-component evidence bundle; do not infer a union from the title or mark the programme unavailable solely because the local scope is empty. |
| SRC-00135 | 040 | candidate | scope_semantic_review_required | EV-100 | Reconcile the exact offering context, each named component, selected courses/outcomes, and supported student-facing status; a review label is not evidence of correctness. |

## Exact evidence URLs, locators, and access dates

### Structured evidence references attached to issue records

| Ref | URL | Exact locator | Accessed |
|---|---|---|---|
| EV-001 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf | Administration.pdf → parsed row ordinal 56 → International Relations | 2026-09-26 |
| EV-002 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf | Social Management Science.pdf → parsed row ordinal 17 → International Relations | 2026-09-26 |
| EV-003 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf | Social Management Science.pdf → parsed row ordinal 18 → International Relations and Diplomacy | 2026-09-26 |
| EV-004 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code GST 112 | 2026-09-26 |
| EV-005 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 101 | 2026-09-26 |
| EV-006 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 102 | 2026-09-26 |
| EV-007 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 103 | 2026-09-26 |
| EV-008 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 104 | 2026-09-26 |
| EV-009 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 202 | 2026-09-26 |
| EV-010 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 203 | 2026-09-26 |
| EV-011 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 206 | 2026-09-26 |
| EV-012 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 207 | 2026-09-26 |
| EV-013 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code GST 312 | 2026-09-26 |
| EV-014 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 301 | 2026-09-26 |
| EV-015 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 303 | 2026-09-26 |
| EV-016 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 304 | 2026-09-26 |
| EV-017 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 305 | 2026-09-26 |
| EV-018 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 307 | 2026-09-26 |
| EV-019 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 308 | 2026-09-26 |
| EV-020 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 310 | 2026-09-26 |
| EV-021 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 311 | 2026-09-26 |
| EV-022 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 312 | 2026-09-26 |
| EV-023 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 401 | 2026-09-26 |
| EV-024 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 402 | 2026-09-26 |
| EV-025 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 403 | 2026-09-26 |
| EV-026 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 405 | 2026-09-26 |
| EV-027 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 406 | 2026-09-26 |
| EV-028 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 407 | 2026-09-26 |
| EV-029 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf | Social Management Science.pdf → parsed row ordinal 19 → International Relations and Diplomatic Studies | 2026-09-26 |
| EV-030 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf | Social Management Science.pdf → parsed row ordinal 20 → International Studies | 2026-09-26 |
| EV-031 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf | Administration.pdf → parsed row ordinal 58 → International Studies and Diplomacy | 2026-09-26 |
| EV-032 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf | Social Management Science.pdf → parsed row ordinal 21 → International Studies and Diplomacy | 2026-09-26 |
| EV-033 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf | Social Management Science.pdf → parsed row ordinal 22 → International and Comparative Politics | 2026-09-26 |
| EV-034 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf | Social Management Science.pdf → parsed row ordinal 23 → International Relationship & Strategic Studies | 2026-09-26 |
| EV-035 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → International Relations → course code IRS 404 | 2026-09-26 |
| EV-036 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf | Social Management Science.pdf → parsed row ordinal 24 → History and International Relations | 2026-09-26 |
| EV-037 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf | Social Management Science.pdf → parsed row ordinal 25 → History and International Studies | 2026-09-26 |
| EV-038 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf | Social Management Science.pdf → parsed row ordinal 28 → Policy and Strategic Studies | 2026-09-26 |
| EV-039 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Political Science → course code POL 205 | 2026-09-26 |
| EV-040 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Political Science → course code GST 312 | 2026-09-26 |
| EV-041 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Political Science → course code POL 305 | 2026-09-26 |
| EV-042 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Political Science → course code POL 403 | 2026-09-26 |
| EV-043 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Political Science → course code POL 405 | 2026-09-26 |
| EV-044 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf | Social Management Science.pdf → parsed row ordinal 29 → Policy and Administrative Studies | 2026-09-26 |
| EV-045 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf | Social Management Science.pdf → parsed row ordinal 30 → Social Justice | 2026-09-26 |
| EV-046 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → SWK → course code SWK 111 | 2026-09-26 |
| EV-047 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → SWK → course code SWK 112 | 2026-09-26 |
| EV-048 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → SWK → course code SWK 212 | 2026-09-26 |
| EV-049 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → SWK → course code SWK 214 | 2026-09-26 |
| EV-050 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → SWK → course code SWK 314 | 2026-09-26 |
| EV-051 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → SWK → course code SWK 315 | 2026-09-26 |
| EV-052 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → SWK → course code SWK 412 | 2026-09-26 |
| EV-053 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → SWK → course code SWK 421 | 2026-09-26 |
| EV-054 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → SOC → course code SOC 302 | 2026-09-26 |
| EV-055 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → SOC → course code SOC 210 | 2026-09-26 |
| EV-056 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → SOC → course code SOC 205 | 2026-09-26 |
| EV-057 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → POL → course code POL 105 | 2026-09-26 |
| EV-058 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → IRS → course code IRS 403 | 2026-09-26 |
| EV-059 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → PCR → course code PCR 201 | 2026-09-26 |
| EV-060 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → PCR → course code PCR 308 | 2026-09-26 |
| EV-061 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → CSS → course code CSS 205 | 2026-09-26 |
| EV-062 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → SST → course code SST 103 | 2026-09-26 |
| EV-063 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → SST → course code SST 204 | 2026-09-26 |
| EV-064 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → SST → course code SST 306 | 2026-09-26 |
| EV-065 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → SST → course code SST 407 | 2026-09-26 |
| EV-066 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → PPE → course code PHL 204 | 2026-09-26 |
| EV-067 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → LAW → course code PUL 201 | 2026-09-26 |
| EV-068 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → LAW → course code PUL 202 | 2026-09-26 |
| EV-069 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf | Social Management Science.pdf → parsed row ordinal 31 → Political Science | 2026-09-26 |
| EV-070 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf | Social Management Science.pdf → parsed row ordinal 32 → Political Science / International Law and Diplomacy | 2026-09-26 |
| EV-071 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf | Printed p. 574, Social/Management Sciences programme index; row 34's separately parsed source offering associates this identity with BABCOCK. | 2026-09-25 |
| EV-072 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | Political Science: POL 205 printed p. 211; POL 309 printed p. 216; POL 405 printed p. 219; POL 406 printed pp. 219-220. International Relations: IRS 303-305 printed pp. 127-128. | 2026-09-25 |
| EV-073 | https://legacy.babcock.edu.ng/assets/docs/academics/bulletin.pdf | Political Science (International Law and Diplomacy) B.Sc. schedule, printed pp. 37-42; PDF pages 842-847. | 2026-09-25 |
| EV-074 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf | Social Management Science.pdf → parsed row ordinal 33 → Political Science and Diplomacy | 2026-09-26 |
| EV-075 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf | Social Management Science.pdf → parsed row ordinal 34 → Political Science and Public Administration | 2026-09-26 |
| EV-076 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf | Social Management Science.pdf → parsed row ordinal 35 → Political and Administrative Studies | 2026-09-26 |
| EV-077 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Political Science → course code GST 112 | 2026-09-26 |
| EV-078 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Political Science → course code POL 101 | 2026-09-26 |
| EV-079 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Political Science → course code POL 102 | 2026-09-26 |
| EV-080 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Political Science → course code POL 103 | 2026-09-26 |
| EV-081 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Political Science → course code POL 201 | 2026-09-26 |
| EV-082 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Political Science → course code POL 202 | 2026-09-26 |
| EV-083 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Political Science → course code POL 203 | 2026-09-26 |
| EV-084 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Political Science → course code POL 204 | 2026-09-26 |
| EV-085 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Political Science → course code POL 206 | 2026-09-26 |
| EV-086 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Political Science → course code POL 301 | 2026-09-26 |
| EV-087 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Political Science → course code POL 302 | 2026-09-26 |
| EV-088 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Political Science → course code POL 303 | 2026-09-26 |
| EV-089 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Political Science → course code POL 304 | 2026-09-26 |
| EV-090 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Political Science → course code POL 306 | 2026-09-26 |
| EV-091 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Political Science → course code POL 307 | 2026-09-26 |
| EV-092 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Political Science → course code POL 308 | 2026-09-26 |
| EV-093 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Political Science → course code SSC 401 | 2026-09-26 |
| EV-094 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Political Science → course code POL 402 | 2026-09-26 |
| EV-095 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Political Science → course code POL 404 | 2026-09-26 |
| EV-096 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Political Science → course code POL 408 | 2026-09-26 |
| EV-097 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Political Science → course code POL 410 | 2026-09-26 |
| EV-098 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf | Social Management Science.pdf → parsed row ordinal 36 → Political Science and International Relations | 2026-09-26 |
| EV-099 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf | Social Management Science.pdf → parsed row ordinal 37 → Political Science and International Studies | 2026-09-26 |
| EV-100 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf | Social Management Science.pdf → parsed row ordinal 38 → Political Science and Conflict Resolution | 2026-09-26 |

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
| https://admissions.covenantuniversity.edu.ng/wp-content/uploads/2024/02/CU-2024-Undergraduate-Prospectus-Covenant-University-Ota_.pdf | Covenant undergraduate prospectus; institution-specific Policy and Strategic Studies lead for row 030 | 2026-09-26 |
| https://eprints.covenantuniversity.edu.ng/3271/1/CLDS%20HANDBOOK.pdf | printed 2014-2017 handbook; historical Covenant curriculum lead for row 030, currency not assumed | 2026-09-26 |
| https://www.abuad.edu.ng/b-sc-social-justice-programme/ | ABUAD B.Sc Social Justice programme page; institution-specific evidence for row 032 | 2026-09-26 |

## Prior checkpoint and non-repetition controls

Read before this increment:

- `data/career-mapping/_audit/jamb_ccmas_source_phase_checkpoint_2026-09-26_003.json`
- `data/career-mapping/_audit/jamb_ccmas_source_phase_checkpoint_2026-09-26_003.md`
- `data/career-mapping/_audit/jamb_ccmas_final_gap_verification_rows_021_030_2026-09-26_001.md`
- `data/career-mapping/_audit/jamb_ccmas_final_gap_verification_rows_031_040_2026-09-26_001.md`
- `data/career-mapping/_audit/jamb_ccmas_source_issue_queue_2026-09-26_001.json`
- `data/career-mapping/_audit/jamb_ccmas_source_issue_queue_2026-09-26_001.md`
- `data/career-mapping/_audit/jamb_curriculum_scopes_2026-08-17.json`
- `data/career-mapping/_audit/jamb_anomaly_inventory_2026-09-26.json`
- `data/career-mapping/_audit/jamb_offering_context_inventory_2026-09-25.json`
- `data/career-mapping/_audit/ccmas_extraction_anomaly_inventory_2026-09-26.json`


Closed work intentionally not reopened: French Arts anchor correction; Film and Video Studies Social/Management occurrence addition; recorded CCMAS page-header repairs; CAM424 equipment-spill repair; DTS498/CSC432 cross-reference repair; and replacement-character normalization classified as encoding-only.

## Disposition and resume boundary

This increment reconciles the current **021–040** queue against the prior row-level evidence. It does **not** close any identity: scope evidence, exact offering context, selected-course fidelity, item-level citations, and external/custom provenance remain open where listed. It performs no downstream domain/subgroup/role audit.

The next bounded increment is **identities 041–060**, maximum **20 identities/packages**, and must save its own append-only JSON/Markdown checkpoint before proceeding.

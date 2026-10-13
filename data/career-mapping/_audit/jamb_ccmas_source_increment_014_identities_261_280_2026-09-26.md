# JAMB–CCMAS source increment 014 — identities 261–280

**Audit date:** 2026-09-26 (Africa/Lagos)  
**Mode:** bounded reconciliation after checkpoint 003; append-only  
**Assigned lane:** JAMB identity/offering and CCMAS/external source integrity only  
**Write boundary:** no shared source, mapping, scope, seed, SQL, UI, downstream taxonomy, domain, subgroup, or role file was edited.

## Exact coverage inspected

- Canonical JAMB identities: **20/20**, rows **261–280**.
- Current queue records: **20 identity rows**, **66 current issue records**.
- Current selected-course occurrences represented by those rows: **213**.
- Parsed offering occurrences represented by those rows: **20**.
- CCMAS/external components inspected through the current records: **Administration and Management::Hospitality and Tourism Management, Agricultural Science::B.Sc./B.Tech Food Science and Technology, Agricultural Science::Crop Science, Agricultural Science::Family and Consumer Sciences, Agricultural Science::Fisheries and Aquaculture, Agricultural Science::Forest Resources and Wildlife Management, Agricultural Science::Soil Science, Arts::Arabic, Arts::Archaeology, Arts::Christian Religious Studies, Arts::Classics, Arts::Film Production, Arts::Linguistics, Arts::Music, Arts::Theatre Arts**.
- Prior row-level evidence was read first from the existing final-gap checkpoint(s) for rows **261–280**; already-verified facts were not re-researched.

## Records inspected

| Row | JAMB identity | Component reference(s) | Current scope state | Selected courses | Offering records | Current issue IDs |
|---:|---|---|---|---:|---:|---|
| 261 | Crop Production | Agricultural Science::Crop Science | partial_scope_reviewed | 18 | 1 | SRC-00791, SRC-00792, SRC-00793, SRC-00794 |
| 262 | Crop Science | Agricultural Science::Crop Science | full | 0 | 1 | SRC-00795, SRC-00796 |
| 263 | Soil Science | Agricultural Science::Soil Science | full | 0 | 1 | SRC-00797, SRC-00798 |
| 264 | Family, Nutrition and Consumer Sciences | Agricultural Science::Family and Consumer Sciences | partial_scope_reviewed | 9 | 1 | SRC-00799, SRC-00800, SRC-00801, SRC-00802 |
| 265 | Food Science with Business | Agricultural Science::B.Sc./B.Tech Food Science and Technology | partial_scope_reviewed | 11 | 1 | SRC-00803, SRC-00804, SRC-00805, SRC-00806 |
| 266 | Forestry and Fisheries | Agricultural Science::Forest Resources and Wildlife Management, Agricultural Science::Fisheries and Aquaculture | combined_scope_review_required | 0 | 1 | SRC-00807, SRC-00808, SRC-00809, SRC-00810 |
| 267 | Forestry, Wildlife & Fisheries | Agricultural Science::Forest Resources and Wildlife Management, Agricultural Science::Fisheries and Aquaculture | combined_scope_review_required | 0 | 1 | SRC-00811, SRC-00812, SRC-00813, SRC-00814 |
| 268 | Plant Breeding and Seed Technology | Agricultural Science::Crop Science | partial_scope_reviewed | 15 | 1 | SRC-00815, SRC-00816, SRC-00817, SRC-00818 |
| 269 | Home Economics | Agricultural Science::Family and Consumer Sciences | partial_scope_reviewed | 19 | 1 | SRC-00819, SRC-00820, SRC-00821, SRC-00822 |
| 270 | Hotel Management & Tourism | Administration and Management::Hospitality and Tourism Management | partial_scope_reviewed | 26 | 1 | SRC-00823, SRC-00824, SRC-00825 |
| 271 | Home Science, Nutrition and Dietetics | Agricultural Science::Family and Consumer Sciences | partial_scope_reviewed | 11 | 1 | SRC-00826, SRC-00827, SRC-00828, SRC-00829 |
| 272 | Home Science & Management | Agricultural Science::Family and Consumer Sciences | partial_scope_reviewed | 11 | 1 | SRC-00830, SRC-00831, SRC-00832, SRC-00833 |
| 273 | Arabic Studies | Arts::Arabic | partial_scope_reviewed | 31 | 1 | SRC-00834, SRC-00835, SRC-00836, SRC-00837 |
| 274 | Arabic Language and Literature Studies | Arts::Arabic | partial_scope_reviewed | 32 | 1 | SRC-00838, SRC-00839, SRC-00840, SRC-00841 |
| 275 | Archaeology | Arts::Archaeology | full | 0 | 1 | SRC-00842, SRC-00843 |
| 276 | Classical Studies | Arts::Classics | partial_scope_reviewed | 6 | 1 | SRC-00844, SRC-00845, SRC-00846 |
| 277 | Christian Religious | Arts::Christian Religious Studies | partial_scope_reviewed | 6 | 1 | SRC-00847, SRC-00848, SRC-00849, SRC-00850 |
| 278 | Christian Studies | Arts::Christian Religious Studies | partial_scope_reviewed | 6 | 1 | SRC-00851, SRC-00852, SRC-00853, SRC-00854 |
| 279 | Creative Arts | Arts::Theatre Arts, Arts::Film Production, Arts::Music | combined_scope_review_required | 0 | 1 | SRC-00855, SRC-00856, SRC-00857, SRC-00858 |
| 280 | Linguistics/Edo | Arts::Linguistics | partial_scope_reviewed | 12 | 1 | SRC-00859, SRC-00860, SRC-00861, SRC-00862 |

## Current issue counts

- Confirmed gaps still open: **69**.
- Candidate issues still open: **3**.
- New issue classes discovered in this reconciliation: **0**.
- Closed findings reopened: **0**.
- Distinct exact evidence references captured: **144**.

By issue type/status:

- `combined_scope_zero_courses` / `confirmed_gap`: 3
- `offering_context_unverified` / `confirmed_gap`: 20
- `scope_evidence_missing` / `confirmed_gap`: 20
- `scope_semantic_review_required` / `candidate`: 3
- `selected_course_citation_incomplete` / `confirmed_gap`: 14
- `selected_course_content_or_outcome_gap` / `confirmed_gap`: 12

## Confirmed and candidate issue ledger

The following are current open records carried from the source issue queue. They are not claims that every record below is an academic-content defect; provenance, offering-context, and citation gaps remain distinct from content defects.

| Issue | Row | Status | Type | Evidence refs | Recommendation |
|---|---:|---|---|---|---|
| SRC-00791 | 261 | confirmed_gap | scope_evidence_missing | EV-001 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00792 | 261 | confirmed_gap | offering_context_unverified | EV-001 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00793 | 261 | confirmed_gap | selected_course_citation_incomplete | EV-002, EV-003, EV-004, EV-005, EV-006, EV-007, EV-008, EV-009, EV-010, EV-011, EV-012, EV-013, EV-014, EV-015, EV-016, EV-017, EV-018, EV-019 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00794 | 261 | confirmed_gap | selected_course_content_or_outcome_gap | EV-002, EV-003, EV-004, EV-005, EV-006, EV-007, EV-008, EV-009, EV-010, EV-011, EV-012, EV-013, EV-014, EV-015, EV-016, EV-017, EV-018, EV-019 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00795 | 262 | confirmed_gap | scope_evidence_missing | EV-020 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00796 | 262 | confirmed_gap | offering_context_unverified | EV-020 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00797 | 263 | confirmed_gap | scope_evidence_missing | EV-021 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00798 | 263 | confirmed_gap | offering_context_unverified | EV-021 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00799 | 264 | confirmed_gap | scope_evidence_missing | EV-022 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00800 | 264 | confirmed_gap | offering_context_unverified | EV-022 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00801 | 264 | confirmed_gap | selected_course_citation_incomplete | EV-023, EV-024, EV-025, EV-026, EV-027, EV-028, EV-029, EV-030, EV-031 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00802 | 264 | confirmed_gap | selected_course_content_or_outcome_gap | EV-023, EV-024, EV-025, EV-026, EV-027, EV-028, EV-029, EV-030, EV-031 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00803 | 265 | confirmed_gap | scope_evidence_missing | EV-032 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00804 | 265 | confirmed_gap | offering_context_unverified | EV-032 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00805 | 265 | confirmed_gap | selected_course_citation_incomplete | EV-033, EV-034, EV-035, EV-036, EV-037, EV-038, EV-039, EV-040, EV-041, EV-042, EV-043 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00806 | 265 | confirmed_gap | selected_course_content_or_outcome_gap | EV-033, EV-034, EV-035, EV-036, EV-037, EV-038, EV-039, EV-040, EV-041, EV-042, EV-043 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00807 | 266 | confirmed_gap | scope_evidence_missing | EV-044 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00808 | 266 | confirmed_gap | offering_context_unverified | EV-044 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00809 | 266 | confirmed_gap | combined_scope_zero_courses | EV-044 | Build a bounded component-by-component evidence bundle; do not infer a union from the title or mark the programme unavailable solely because the local scope is empty. |
| SRC-00810 | 266 | candidate | scope_semantic_review_required | EV-044 | Reconcile the exact offering context, each named component, selected courses/outcomes, and supported student-facing status; a review label is not evidence of correctness. |
| SRC-00811 | 267 | confirmed_gap | scope_evidence_missing | EV-045 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00812 | 267 | confirmed_gap | offering_context_unverified | EV-045 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00813 | 267 | confirmed_gap | combined_scope_zero_courses | EV-045 | Build a bounded component-by-component evidence bundle; do not infer a union from the title or mark the programme unavailable solely because the local scope is empty. |
| SRC-00814 | 267 | candidate | scope_semantic_review_required | EV-045 | Reconcile the exact offering context, each named component, selected courses/outcomes, and supported student-facing status; a review label is not evidence of correctness. |
| SRC-00815 | 268 | confirmed_gap | scope_evidence_missing | EV-046 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00816 | 268 | confirmed_gap | offering_context_unverified | EV-046 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00817 | 268 | confirmed_gap | selected_course_citation_incomplete | EV-002, EV-005, EV-007, EV-008, EV-009, EV-010, EV-011, EV-012, EV-013, EV-014, EV-015, EV-016, EV-017, EV-018, EV-019 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00818 | 268 | confirmed_gap | selected_course_content_or_outcome_gap | EV-002, EV-005, EV-007, EV-008, EV-009, EV-010, EV-011, EV-012, EV-013, EV-014, EV-015, EV-016, EV-017, EV-018, EV-019 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00819 | 269 | confirmed_gap | scope_evidence_missing | EV-047 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00820 | 269 | confirmed_gap | offering_context_unverified | EV-047 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00821 | 269 | confirmed_gap | selected_course_citation_incomplete | EV-023, EV-024, EV-025, EV-027, EV-028, EV-029, EV-030, EV-031, EV-048, EV-049, EV-050, EV-051, EV-052, EV-053, EV-054 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00822 | 269 | confirmed_gap | selected_course_content_or_outcome_gap | EV-023, EV-024, EV-025, EV-027, EV-028, EV-029, EV-030, EV-031, EV-048, EV-049, EV-050, EV-051, EV-052, EV-053, EV-054 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00823 | 270 | confirmed_gap | scope_evidence_missing | EV-055 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00824 | 270 | confirmed_gap | offering_context_unverified | EV-055 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00825 | 270 | confirmed_gap | selected_course_citation_incomplete | EV-056, EV-057, EV-058, EV-059, EV-060, EV-061, EV-062, EV-063, EV-064, EV-065, EV-066, EV-067, EV-068, EV-069, EV-070, EV-071, EV-072, EV-073, EV-074, EV-075, EV-076, EV-077, EV-078 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00826 | 271 | confirmed_gap | scope_evidence_missing | EV-079 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00827 | 271 | confirmed_gap | offering_context_unverified | EV-079 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00828 | 271 | confirmed_gap | selected_course_citation_incomplete | EV-023, EV-024, EV-025, EV-027, EV-028, EV-029, EV-030, EV-031, EV-052, EV-053, EV-054 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00829 | 271 | confirmed_gap | selected_course_content_or_outcome_gap | EV-023, EV-024, EV-025, EV-027, EV-028, EV-029, EV-030, EV-031, EV-052, EV-053, EV-054 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00830 | 272 | confirmed_gap | scope_evidence_missing | EV-080 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00831 | 272 | confirmed_gap | offering_context_unverified | EV-080 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00832 | 272 | confirmed_gap | selected_course_citation_incomplete | EV-023, EV-024, EV-025, EV-027, EV-028, EV-029, EV-030, EV-031, EV-052, EV-053, EV-054 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00833 | 272 | confirmed_gap | selected_course_content_or_outcome_gap | EV-023, EV-024, EV-025, EV-027, EV-028, EV-029, EV-030, EV-031, EV-052, EV-053, EV-054 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00834 | 273 | confirmed_gap | scope_evidence_missing | EV-081 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00835 | 273 | confirmed_gap | offering_context_unverified | EV-081 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00836 | 273 | confirmed_gap | selected_course_citation_incomplete | EV-082, EV-083, EV-084, EV-085, EV-086, EV-087, EV-088, EV-089, EV-090, EV-091, EV-092, EV-093, EV-094, EV-095, EV-096, EV-097, EV-098, EV-099, EV-100, EV-101, EV-102, EV-103, EV-104, EV-105, EV-106, EV-107, EV-108, EV-109, EV-110, EV-111, EV-112 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00837 | 273 | confirmed_gap | selected_course_content_or_outcome_gap | EV-082, EV-083, EV-084, EV-085, EV-086, EV-087, EV-088, EV-089, EV-090, EV-091, EV-092, EV-093, EV-094, EV-095, EV-096, EV-097, EV-098, EV-099, EV-100, EV-101, EV-102, EV-103, EV-104, EV-105, EV-106, EV-107, EV-108, EV-109, EV-110, EV-111, EV-112 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00838 | 274 | confirmed_gap | scope_evidence_missing | EV-113 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00839 | 274 | confirmed_gap | offering_context_unverified | EV-113 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00840 | 274 | confirmed_gap | selected_course_citation_incomplete | EV-082, EV-083, EV-084, EV-085, EV-086, EV-087, EV-088, EV-089, EV-090, EV-091, EV-092, EV-093, EV-094, EV-095, EV-096, EV-097, EV-098, EV-099, EV-100, EV-101, EV-102, EV-103, EV-104, EV-105, EV-106, EV-107, EV-108, EV-109, EV-110, EV-111, EV-112, EV-114 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00841 | 274 | confirmed_gap | selected_course_content_or_outcome_gap | EV-082, EV-083, EV-084, EV-085, EV-086, EV-087, EV-088, EV-089, EV-090, EV-091, EV-092, EV-093, EV-094, EV-095, EV-096, EV-097, EV-098, EV-099, EV-100, EV-101, EV-102, EV-103, EV-104, EV-105, EV-106, EV-107, EV-108, EV-109, EV-110, EV-111, EV-112, EV-114 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00842 | 275 | confirmed_gap | scope_evidence_missing | EV-115 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00843 | 275 | confirmed_gap | offering_context_unverified | EV-115 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00844 | 276 | confirmed_gap | scope_evidence_missing | EV-116 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00845 | 276 | confirmed_gap | offering_context_unverified | EV-116 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00846 | 276 | confirmed_gap | selected_course_citation_incomplete | EV-117, EV-118, EV-119, EV-120, EV-121, EV-122 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00847 | 277 | confirmed_gap | scope_evidence_missing | EV-123 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00848 | 277 | confirmed_gap | offering_context_unverified | EV-123 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00849 | 277 | confirmed_gap | selected_course_citation_incomplete | EV-124, EV-125, EV-126, EV-127, EV-128, EV-129 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00850 | 277 | confirmed_gap | selected_course_content_or_outcome_gap | EV-124, EV-125, EV-126, EV-127, EV-128, EV-129 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00851 | 278 | confirmed_gap | scope_evidence_missing | EV-130 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00852 | 278 | confirmed_gap | offering_context_unverified | EV-130 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00853 | 278 | confirmed_gap | selected_course_citation_incomplete | EV-124, EV-125, EV-126, EV-127, EV-128, EV-129 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00854 | 278 | confirmed_gap | selected_course_content_or_outcome_gap | EV-124, EV-125, EV-126, EV-127, EV-128, EV-129 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00855 | 279 | confirmed_gap | scope_evidence_missing | EV-131 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00856 | 279 | confirmed_gap | offering_context_unverified | EV-131 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00857 | 279 | confirmed_gap | combined_scope_zero_courses | EV-131 | Build a bounded component-by-component evidence bundle; do not infer a union from the title or mark the programme unavailable solely because the local scope is empty. |
| SRC-00858 | 279 | candidate | scope_semantic_review_required | EV-131 | Reconcile the exact offering context, each named component, selected courses/outcomes, and supported student-facing status; a review label is not evidence of correctness. |
| SRC-00859 | 280 | confirmed_gap | scope_evidence_missing | EV-132 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00860 | 280 | confirmed_gap | offering_context_unverified | EV-132 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00861 | 280 | confirmed_gap | selected_course_citation_incomplete | EV-133, EV-134, EV-135, EV-136, EV-137, EV-138, EV-139, EV-140, EV-141, EV-142, EV-143, EV-144 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00862 | 280 | confirmed_gap | selected_course_content_or_outcome_gap | EV-133, EV-134, EV-135, EV-136, EV-137, EV-138, EV-139, EV-140, EV-141, EV-142, EV-143, EV-144 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |

## Exact evidence URLs, locators, and access dates

### Structured evidence references attached to issue records

| Ref | URL | Exact locator | Accessed |
|---|---|---|---|
| EV-001 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf | agriculture.txt → parsed row ordinal 9 → Crop Production | 2026-09-26 |
| EV-002 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Crop Science → course code AGG 102 | 2026-09-26 |
| EV-003 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Crop Science → course code AGG 112 | 2026-09-26 |
| EV-004 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Crop Science → course code BIO 101 | 2026-09-26 |
| EV-005 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Crop Science → course code AGR 201 | 2026-09-26 |
| EV-006 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Crop Science → course code AGR 202 | 2026-09-26 |
| EV-007 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Crop Science → course code AGR 203 | 2026-09-26 |
| EV-008 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Crop Science → course code AGR 204 | 2026-09-26 |
| EV-009 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Crop Science → course code CPS 205 | 2026-09-26 |
| EV-010 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Crop Science → course code CPS 301 | 2026-09-26 |
| EV-011 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Crop Science → course code CPS 302 | 2026-09-26 |
| EV-012 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Crop Science → course code CPS 303 | 2026-09-26 |
| EV-013 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Crop Science → course code CPS 304 | 2026-09-26 |
| EV-014 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Crop Science → course code CPS 306 | 2026-09-26 |
| EV-015 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Crop Science → course code CPS 401 | 2026-09-26 |
| EV-016 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Crop Science → course code CPS 402 | 2026-09-26 |
| EV-017 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Crop Science → course code CPS 404 | 2026-09-26 |
| EV-018 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Crop Science → course code CPS 406 | 2026-09-26 |
| EV-019 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Crop Science → course code CPS 407 | 2026-09-26 |
| EV-020 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf | agriculture.txt → parsed row ordinal 10 → Crop Science | 2026-09-26 |
| EV-021 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf | agriculture.txt → parsed row ordinal 11 → Soil Science | 2026-09-26 |
| EV-022 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf | agriculture.txt → parsed row ordinal 12 → Family, Nutrition and Consumer Sciences | 2026-09-26 |
| EV-023 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Family and Consumer Sciences → course code AGR 206 | 2026-09-26 |
| EV-024 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Family and Consumer Sciences → course code FCS 303 | 2026-09-26 |
| EV-025 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Family and Consumer Sciences → course code FCS 411 | 2026-09-26 |
| EV-026 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Family and Consumer Sciences → course code FCS 412 | 2026-09-26 |
| EV-027 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Family and Consumer Sciences → course code FCS 413 | 2026-09-26 |
| EV-028 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Family and Consumer Sciences → course code FCS 415 | 2026-09-26 |
| EV-029 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Family and Consumer Sciences → course code FCS 331 | 2026-09-26 |
| EV-030 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Family and Consumer Sciences → course code FCS 333 | 2026-09-26 |
| EV-031 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Family and Consumer Sciences → course code FCS 431 | 2026-09-26 |
| EV-032 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf | agriculture.txt → parsed row ordinal 13 → Food Science with Business | 2026-09-26 |
| EV-033 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → B.Sc./B.Tech Food Science and Technology → course code FST 201 | 2026-09-26 |
| EV-034 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → B.Sc./B.Tech Food Science and Technology → course code FST 301 | 2026-09-26 |
| EV-035 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → B.Sc./B.Tech Food Science and Technology → course code FST 302 | 2026-09-26 |
| EV-036 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → B.Sc./B.Tech Food Science and Technology → course code FST 303 | 2026-09-26 |
| EV-037 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → B.Sc./B.Tech Food Science and Technology → course code FST 304 | 2026-09-26 |
| EV-038 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → B.Sc./B.Tech Food Science and Technology → course code FST 306 | 2026-09-26 |
| EV-039 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → B.Sc./B.Tech Food Science and Technology → course code FST 401 | 2026-09-26 |
| EV-040 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → B.Sc./B.Tech Food Science and Technology → course code FST 402 | 2026-09-26 |
| EV-041 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → B.Sc./B.Tech Food Science and Technology → course code FST 405 | 2026-09-26 |
| EV-042 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → B.Sc./B.Tech Food Science and Technology → course code FST 502 | 2026-09-26 |
| EV-043 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → B.Sc./B.Tech Food Science and Technology → course code FST 505 | 2026-09-26 |
| EV-044 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf | agriculture.txt → parsed row ordinal 14 → Forestry and Fisheries | 2026-09-26 |
| EV-045 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf | agriculture.txt → parsed row ordinal 15 → Forestry, Wildlife & Fisheries | 2026-09-26 |
| EV-046 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf | agriculture.txt → parsed row ordinal 16 → Plant Breeding and Seed Technology | 2026-09-26 |
| EV-047 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf | agriculture.txt → parsed row ordinal 17 → Home Economics | 2026-09-26 |
| EV-048 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Family and Consumer Sciences → course code AGG 112 | 2026-09-26 |
| EV-049 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Family and Consumer Sciences → course code AGR 202 | 2026-09-26 |
| EV-050 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Family and Consumer Sciences → course code GST 312 | 2026-09-26 |
| EV-051 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Family and Consumer Sciences → course code ENT 312 | 2026-09-26 |
| EV-052 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Family and Consumer Sciences → course code FCS 321 | 2026-09-26 |
| EV-053 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Family and Consumer Sciences → course code FCS 325 | 2026-09-26 |
| EV-054 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Family and Consumer Sciences → course code FCS 423 | 2026-09-26 |
| EV-055 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf | agriculture.txt → parsed row ordinal 18 → Hotel Management & Tourism | 2026-09-26 |
| EV-056 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 101 | 2026-09-26 |
| EV-057 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 102 | 2026-09-26 |
| EV-058 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 203 | 2026-09-26 |
| EV-059 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 205 | 2026-09-26 |
| EV-060 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 209 | 2026-09-26 |
| EV-061 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 210 | 2026-09-26 |
| EV-062 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 212 | 2026-09-26 |
| EV-063 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 303 | 2026-09-26 |
| EV-064 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 305 | 2026-09-26 |
| EV-065 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 307 | 2026-09-26 |
| EV-066 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 309 | 2026-09-26 |
| EV-067 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 311 | 2026-09-26 |
| EV-068 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 313 | 2026-09-26 |
| EV-069 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 300 | 2026-09-26 |
| EV-070 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 402 | 2026-09-26 |
| EV-071 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 403 | 2026-09-26 |
| EV-072 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 406 | 2026-09-26 |
| EV-073 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code TRM 408 | 2026-09-26 |
| EV-074 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code HTM 410 | 2026-09-26 |
| EV-075 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code TRM 401 | 2026-09-26 |
| EV-076 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code TRM 403 | 2026-09-26 |
| EV-077 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code TRM 407 | 2026-09-26 |
| EV-078 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Hospitality and Tourism Management → course code TRM 412 | 2026-09-26 |
| EV-079 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf | agriculture.txt → parsed row ordinal 19 → Home Science, Nutrition and Dietetics | 2026-09-26 |
| EV-080 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf | agriculture.txt → parsed row ordinal 20 → Home Science & Management | 2026-09-26 |
| EV-081 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf | arts_hum.txt → parsed row ordinal 1 → Arabic Studies | 2026-09-26 |
| EV-082 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Arabic → course code ARA 101 | 2026-09-26 |
| EV-083 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Arabic → course code ARA 102 | 2026-09-26 |
| EV-084 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Arabic → course code ARA 103 | 2026-09-26 |
| EV-085 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Arabic → course code ARA 104 | 2026-09-26 |
| EV-086 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Arabic → course code ARA 201 | 2026-09-26 |
| EV-087 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Arabic → course code ARA 202 | 2026-09-26 |
| EV-088 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Arabic → course code ARA 203 | 2026-09-26 |
| EV-089 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Arabic → course code ARA 205 | 2026-09-26 |
| EV-090 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Arabic → course code ARA 206 | 2026-09-26 |
| EV-091 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Arabic → course code ARA 207 | 2026-09-26 |
| EV-092 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Arabic → course code ARA 303 | 2026-09-26 |
| EV-093 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Arabic → course code ARA 313 | 2026-09-26 |
| EV-094 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Arabic → course code ARA 314 | 2026-09-26 |
| EV-095 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Arabic → course code ARA 315 | 2026-09-26 |
| EV-096 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Arabic → course code ARA 316 | 2026-09-26 |
| EV-097 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Arabic → course code ARA 317 | 2026-09-26 |
| EV-098 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Arabic → course code ARA 318 | 2026-09-26 |
| EV-099 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Arabic → course code ARA 319 | 2026-09-26 |
| EV-100 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Arabic → course code ARA 320 | 2026-09-26 |
| EV-101 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Arabic → course code ARA 321 | 2026-09-26 |
| EV-102 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Arabic → course code ARA 322 | 2026-09-26 |
| EV-103 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Arabic → course code ARA 401 | 2026-09-26 |
| EV-104 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Arabic → course code ARA 402 | 2026-09-26 |
| EV-105 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Arabic → course code ARA 404 | 2026-09-26 |
| EV-106 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Arabic → course code ARA 405 | 2026-09-26 |
| EV-107 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Arabic → course code ARA 410 | 2026-09-26 |
| EV-108 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Arabic → course code ARA 411 | 2026-09-26 |
| EV-109 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Arabic → course code ARA 412 | 2026-09-26 |
| EV-110 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Arabic → course code ARA 413 | 2026-09-26 |
| EV-111 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Arabic → course code ARA 415 | 2026-09-26 |
| EV-112 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Arabic → course code ARA 416 | 2026-09-26 |
| EV-113 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf | arts_hum.txt → parsed row ordinal 2 → Arabic Language and Literature Studies | 2026-09-26 |
| EV-114 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Arabic → course code ARA 204 | 2026-09-26 |
| EV-115 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf | arts_hum.txt → parsed row ordinal 3 → Archaeology | 2026-09-26 |
| EV-116 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf | arts_hum.txt → parsed row ordinal 4 → Classical Studies | 2026-09-26 |
| EV-117 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Classics → course code CLC 101 | 2026-09-26 |
| EV-118 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Classics → course code CLC 102 | 2026-09-26 |
| EV-119 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Classics → course code CLC 201 | 2026-09-26 |
| EV-120 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Classics → course code CLC 203 | 2026-09-26 |
| EV-121 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Classics → course code CLC 204 | 2026-09-26 |
| EV-122 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Classics → course code CLC 206 | 2026-09-26 |
| EV-123 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf | arts_hum.txt → parsed row ordinal 5 → Christian Religious | 2026-09-26 |
| EV-124 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Christian Religious Studies → course code CRS 101 | 2026-09-26 |
| EV-125 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Christian Religious Studies → course code GST 312 | 2026-09-26 |
| EV-126 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Christian Religious Studies → course code CRS 303 | 2026-09-26 |
| EV-127 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Christian Religious Studies → course code CRS 307 | 2026-09-26 |
| EV-128 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Christian Religious Studies → course code CRS 406 | 2026-09-26 |
| EV-129 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Christian Religious Studies → course code CRS 409 | 2026-09-26 |
| EV-130 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf | arts_hum.txt → parsed row ordinal 6 → Christian Studies | 2026-09-26 |
| EV-131 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf | arts_hum.txt → parsed row ordinal 7 → Creative Arts | 2026-09-26 |
| EV-132 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf | arts_hum.txt → parsed row ordinal 8 → Linguistics/Edo | 2026-09-26 |
| EV-133 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 101 | 2026-09-26 |
| EV-134 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 102 | 2026-09-26 |
| EV-135 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 103 | 2026-09-26 |
| EV-136 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 104 | 2026-09-26 |
| EV-137 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 206 | 2026-09-26 |
| EV-138 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 307 | 2026-09-26 |
| EV-139 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 308 | 2026-09-26 |
| EV-140 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 309 | 2026-09-26 |
| EV-141 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 404 | 2026-09-26 |
| EV-142 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 406 | 2026-09-26 |
| EV-143 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 409 | 2026-09-26 |
| EV-144 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf | arts.json → Linguistics → course code LIN 410 | 2026-09-26 |

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

This increment reconciles the current **261–280** queue against the prior row-level evidence. It does **not** close any identity: scope evidence, exact offering context, selected-course fidelity, item-level citations, and external/custom provenance remain open where listed. It performs no downstream domain/subgroup/role audit.

The next bounded increment is **identities 281–300**, maximum **20 identities/packages**, and must save its own append-only JSON/Markdown checkpoint before proceeding.

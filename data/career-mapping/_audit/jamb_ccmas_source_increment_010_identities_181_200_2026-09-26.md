# JAMB–CCMAS source increment 010 — identities 181–200

**Audit date:** 2026-09-26 (Africa/Lagos)  
**Mode:** bounded reconciliation after checkpoint 003; append-only  
**Assigned lane:** JAMB identity/offering and CCMAS/external source integrity only  
**Write boundary:** no shared source, mapping, scope, seed, SQL, UI, downstream taxonomy, domain, subgroup, or role file was edited.

## Exact coverage inspected

- Canonical JAMB identities: **20/20**, rows **181–200**.
- Current queue records: **20 identity rows**, **66 current issue records**.
- Current selected-course occurrences represented by those rows: **516**.
- Parsed offering occurrences represented by those rows: **20**.
- CCMAS/external components inspected through the current records: **Sciences::Applied Geophysics, Sciences::Biology, Sciences::Botany, Sciences::Industrial Physics, Sciences::Marine Science, Sciences::Meteorology, Sciences::Physics, Sciences::Physics with Electronics**.
- Prior row-level evidence was read first from the existing final-gap checkpoint(s) for rows **181–200**; already-verified facts were not re-researched.

## Records inspected

| Row | JAMB identity | Component reference(s) | Current scope state | Selected courses | Offering records | Current issue IDs |
|---:|---|---|---|---:|---:|---|
| 181 | HUMAN BIOLOGY | Sciences::Biology | partial_scope_reviewed | 22 | 1 | SRC-00543, SRC-00544, SRC-00545 |
| 182 | APPLIED BOTANY | Sciences::Botany | partial_scope_reviewed | 4 | 1 | SRC-00546, SRC-00547, SRC-00548 |
| 183 | APPLIED BIOLOGY AND GENETICS | Sciences::Biology | partial_scope_reviewed | 21 | 1 | SRC-00549, SRC-00550, SRC-00551 |
| 184 | CELL BIOLOGY & GENETICS | Sciences::Biology | partial_scope_reviewed | 20 | 1 | SRC-00552, SRC-00553, SRC-00554 |
| 185 | ENGINEERING PHYSICS | Sciences::Physics | partial_scope_reviewed | 22 | 1 | SRC-00555, SRC-00556, SRC-00557 |
| 186 | MARINE BIOLOGY & FISHERIES | Sciences::Marine Science | partial_scope_reviewed | 17 | 1 | SRC-00558, SRC-00559, SRC-00560 |
| 187 | METEOROLOGY AND CLIMATE SCIENCE | Sciences::Meteorology | partial_scope_reviewed | 13 | 1 | SRC-00561, SRC-00562, SRC-00563 |
| 188 | Physics and Computer Electronic | Sciences::Physics with Electronics | partial_scope_reviewed | 15 | 1 | SRC-00564, SRC-00565, SRC-00566 |
| 189 | Physics with Solar Energy | Sciences::Physics | partial_scope_reviewed | 24 | 1 | SRC-00567, SRC-00568, SRC-00569 |
| 190 | Physics and Energy Studies | Sciences::Physics | partial_scope_reviewed | 24 | 1 | SRC-00570, SRC-00571, SRC-00572 |
| 191 | Physics with Computational Modeling | Sciences::Physics | partial_scope_reviewed | 22 | 1 | SRC-00573, SRC-00574, SRC-00575 |
| 192 | Physics/Astrology | Sciences::Physics | partial_scope_reviewed | 22 | 1 | SRC-00576, SRC-00577, SRC-00578 |
| 193 | Physical Sciences (with options in i. Industrial Physics, ii. Physics with Electronics) | Sciences::Industrial Physics, Sciences::Physics with Electronics | combined_scope_review_required | 58 | 1 | SRC-00579, SRC-00580 |
| 194 | Physics and Applied Physics | Sciences::Physics | partial_scope_reviewed | 22 | 1 | SRC-00581, SRC-00582, SRC-00583 |
| 195 | Pure and Applied Physics | Sciences::Physics | partial_scope_reviewed | 22 | 1 | SRC-00584, SRC-00585, SRC-00586 |
| 196 | Pure Physics | Sciences::Physics | partial_scope_reviewed | 22 | 1 | SRC-00587, SRC-00588, SRC-00589 |
| 197 | Pure and Industrial Physics | Sciences::Industrial Physics | partial_scope_reviewed | 15 | 1 | SRC-00590, SRC-00591, SRC-00592 |
| 198 | Industrial Physics with Renewable Energy | Sciences::Industrial Physics | partial_scope_reviewed | 16 | 1 | SRC-00593, SRC-00594, SRC-00595 |
| 199 | Industrial Physics with Applied Geophysics | Sciences::Applied Geophysics, Sciences::Industrial Physics | combined_scope_review_required | 77 | 1 | SRC-00596, SRC-00597 |
| 200 | Industrial Physics with Electronics and IT Application | Sciences::Industrial Physics, Sciences::Physics with Electronics | combined_scope_review_required | 58 | 1 | SRC-00598, SRC-00599, SRC-00600 |

## Current issue counts

- Confirmed gaps still open: **55**.
- Candidate issues still open: **3**.
- New issue classes discovered in this reconciliation: **0**.
- Closed findings reopened: **0**.
- Distinct exact evidence references captured: **139**.

By issue type/status:

- `named_facet_unrepresented` / `confirmed_gap`: 1
- `offering_context_unverified` / `confirmed_gap`: 20
- `scope_evidence_missing` / `confirmed_gap`: 17
- `scope_semantic_review_required` / `candidate`: 3
- `selected_course_citation_incomplete` / `confirmed_gap`: 17

## Confirmed and candidate issue ledger

The following are current open records carried from the source issue queue. They are not claims that every record below is an academic-content defect; provenance, offering-context, and citation gaps remain distinct from content defects.

| Issue | Row | Status | Type | Evidence refs | Recommendation |
|---|---:|---|---|---|---|
| SRC-00543 | 181 | confirmed_gap | scope_evidence_missing | EV-001 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00544 | 181 | confirmed_gap | offering_context_unverified | EV-001 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00545 | 181 | confirmed_gap | selected_course_citation_incomplete | EV-002, EV-003, EV-004, EV-005, EV-006, EV-007, EV-008, EV-009, EV-010, EV-011, EV-012, EV-013, EV-014, EV-015, EV-016, EV-017, EV-018, EV-019, EV-020, EV-021, EV-022, EV-023 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00546 | 182 | confirmed_gap | scope_evidence_missing | EV-024 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00547 | 182 | confirmed_gap | offering_context_unverified | EV-024 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00548 | 182 | confirmed_gap | selected_course_citation_incomplete | EV-025, EV-026, EV-027, EV-028 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00549 | 183 | confirmed_gap | scope_evidence_missing | EV-029 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00550 | 183 | confirmed_gap | offering_context_unverified | EV-029 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00551 | 183 | confirmed_gap | selected_course_citation_incomplete | EV-003, EV-004, EV-005, EV-007, EV-008, EV-009, EV-010, EV-011, EV-013, EV-014, EV-015, EV-016, EV-017, EV-018, EV-019, EV-020, EV-021, EV-022, EV-023, EV-030, EV-031 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00552 | 184 | confirmed_gap | scope_evidence_missing | EV-032 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00553 | 184 | confirmed_gap | offering_context_unverified | EV-032 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00554 | 184 | confirmed_gap | selected_course_citation_incomplete | EV-003, EV-004, EV-005, EV-007, EV-008, EV-009, EV-010, EV-011, EV-013, EV-014, EV-015, EV-016, EV-017, EV-018, EV-019, EV-020, EV-021, EV-022, EV-023, EV-030 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00555 | 185 | confirmed_gap | scope_evidence_missing | EV-033 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00556 | 185 | confirmed_gap | offering_context_unverified | EV-033 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00557 | 185 | confirmed_gap | selected_course_citation_incomplete | EV-034, EV-035, EV-036, EV-037, EV-038, EV-039, EV-040, EV-041, EV-042, EV-043, EV-044, EV-045, EV-046, EV-047, EV-048, EV-049, EV-050, EV-051, EV-052, EV-053, EV-054, EV-055 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00558 | 186 | confirmed_gap | scope_evidence_missing | EV-056 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00559 | 186 | confirmed_gap | offering_context_unverified | EV-056 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00560 | 186 | confirmed_gap | selected_course_citation_incomplete | EV-057, EV-058, EV-059, EV-060, EV-061, EV-062, EV-063, EV-064, EV-065, EV-066, EV-067, EV-068, EV-069, EV-070, EV-071, EV-072, EV-073 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00561 | 187 | confirmed_gap | scope_evidence_missing | EV-074 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00562 | 187 | confirmed_gap | offering_context_unverified | EV-074 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00563 | 187 | confirmed_gap | selected_course_citation_incomplete | EV-075, EV-076, EV-077, EV-078, EV-079, EV-080, EV-081, EV-082, EV-083, EV-084, EV-085, EV-086, EV-087 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00564 | 188 | confirmed_gap | scope_evidence_missing | EV-088 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00565 | 188 | confirmed_gap | offering_context_unverified | EV-088 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00566 | 188 | confirmed_gap | selected_course_citation_incomplete | EV-089, EV-090, EV-091, EV-092, EV-093, EV-094, EV-095, EV-096, EV-097, EV-098, EV-099, EV-100, EV-101, EV-102, EV-103 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00567 | 189 | confirmed_gap | scope_evidence_missing | EV-104 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00568 | 189 | confirmed_gap | offering_context_unverified | EV-104 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00569 | 189 | confirmed_gap | selected_course_citation_incomplete | EV-034, EV-035, EV-036, EV-037, EV-038, EV-039, EV-040, EV-041, EV-042, EV-043, EV-044, EV-045, EV-046, EV-047, EV-048, EV-049, EV-050, EV-051, EV-052, EV-053, EV-054, EV-055, EV-105, EV-106 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00570 | 190 | confirmed_gap | scope_evidence_missing | EV-107 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00571 | 190 | confirmed_gap | offering_context_unverified | EV-107 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00572 | 190 | confirmed_gap | selected_course_citation_incomplete | EV-034, EV-035, EV-036, EV-037, EV-038, EV-039, EV-040, EV-041, EV-042, EV-043, EV-044, EV-045, EV-046, EV-047, EV-048, EV-049, EV-050, EV-051, EV-052, EV-053, EV-054, EV-055, EV-105, EV-106 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00573 | 191 | confirmed_gap | scope_evidence_missing | EV-108 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00574 | 191 | confirmed_gap | offering_context_unverified | EV-108 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00575 | 191 | confirmed_gap | selected_course_citation_incomplete | EV-034, EV-035, EV-036, EV-037, EV-038, EV-039, EV-040, EV-041, EV-042, EV-043, EV-044, EV-045, EV-046, EV-047, EV-048, EV-049, EV-050, EV-051, EV-052, EV-053, EV-054, EV-055 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00576 | 192 | confirmed_gap | scope_evidence_missing | EV-109 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00577 | 192 | confirmed_gap | offering_context_unverified | EV-109 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00578 | 192 | confirmed_gap | selected_course_citation_incomplete | EV-034, EV-035, EV-036, EV-037, EV-038, EV-039, EV-040, EV-041, EV-042, EV-043, EV-044, EV-045, EV-046, EV-047, EV-048, EV-049, EV-050, EV-051, EV-052, EV-053, EV-054, EV-055 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00579 | 193 | confirmed_gap | offering_context_unverified | EV-110 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00580 | 193 | candidate | scope_semantic_review_required | EV-111, EV-112 | Reconcile the exact offering context, each named component, selected courses/outcomes, and supported student-facing status; a review label is not evidence of correctness. |
| SRC-00581 | 194 | confirmed_gap | scope_evidence_missing | EV-113 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00582 | 194 | confirmed_gap | offering_context_unverified | EV-113 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00583 | 194 | confirmed_gap | selected_course_citation_incomplete | EV-034, EV-035, EV-036, EV-037, EV-038, EV-039, EV-040, EV-041, EV-042, EV-043, EV-044, EV-045, EV-046, EV-047, EV-048, EV-049, EV-050, EV-051, EV-052, EV-053, EV-054, EV-055 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00584 | 195 | confirmed_gap | scope_evidence_missing | EV-114 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00585 | 195 | confirmed_gap | offering_context_unverified | EV-114 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00586 | 195 | confirmed_gap | selected_course_citation_incomplete | EV-034, EV-035, EV-036, EV-037, EV-038, EV-039, EV-040, EV-041, EV-042, EV-043, EV-044, EV-045, EV-046, EV-047, EV-048, EV-049, EV-050, EV-051, EV-052, EV-053, EV-054, EV-055 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00587 | 196 | confirmed_gap | scope_evidence_missing | EV-115 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00588 | 196 | confirmed_gap | offering_context_unverified | EV-115 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00589 | 196 | confirmed_gap | selected_course_citation_incomplete | EV-034, EV-035, EV-036, EV-037, EV-038, EV-039, EV-040, EV-041, EV-042, EV-043, EV-044, EV-045, EV-046, EV-047, EV-048, EV-049, EV-050, EV-051, EV-052, EV-053, EV-054, EV-055 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00590 | 197 | confirmed_gap | scope_evidence_missing | EV-116 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00591 | 197 | confirmed_gap | offering_context_unverified | EV-116 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00592 | 197 | confirmed_gap | selected_course_citation_incomplete | EV-117, EV-118, EV-119, EV-120, EV-121, EV-122, EV-123, EV-124, EV-125, EV-126, EV-127, EV-128, EV-129, EV-130, EV-131 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00593 | 198 | confirmed_gap | scope_evidence_missing | EV-132 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00594 | 198 | confirmed_gap | offering_context_unverified | EV-132 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00595 | 198 | confirmed_gap | selected_course_citation_incomplete | EV-117, EV-118, EV-119, EV-120, EV-121, EV-122, EV-123, EV-124, EV-125, EV-126, EV-127, EV-128, EV-129, EV-130, EV-131, EV-133 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00596 | 199 | confirmed_gap | offering_context_unverified | EV-134 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00597 | 199 | candidate | scope_semantic_review_required | EV-135, EV-136 | Reconcile the exact offering context, each named component, selected courses/outcomes, and supported student-facing status; a review label is not evidence of correctness. |
| SRC-00598 | 200 | confirmed_gap | offering_context_unverified | EV-137 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00599 | 200 | confirmed_gap | named_facet_unrepresented | EV-112, EV-138, EV-139 | Find the matching CCMAS component or authoritative provider-specific external curriculum, then verify its courses/outcomes before considering any combined scope complete. |
| SRC-00600 | 200 | candidate | scope_semantic_review_required | EV-112, EV-138, EV-139 | Reconcile the exact offering context, each named component, selected courses/outcomes, and supported student-facing status; a review label is not evidence of correctness. |

## Exact evidence URLs, locators, and access dates

### Structured evidence references attached to issue records

| Ref | URL | Exact locator | Accessed |
|---|---|---|---|
| EV-001 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 104 → HUMAN BIOLOGY | 2026-09-26 |
| EV-002 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code COS 101 | 2026-09-26 |
| EV-003 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 102 | 2026-09-26 |
| EV-004 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 107 | 2026-09-26 |
| EV-005 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 108 | 2026-09-26 |
| EV-006 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code GST 212 | 2026-09-26 |
| EV-007 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 203 | 2026-09-26 |
| EV-008 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 204 | 2026-09-26 |
| EV-009 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 205 | 2026-09-26 |
| EV-010 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 206 | 2026-09-26 |
| EV-011 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 208 | 2026-09-26 |
| EV-012 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code ENT 312 | 2026-09-26 |
| EV-013 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 301 | 2026-09-26 |
| EV-014 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 302 | 2026-09-26 |
| EV-015 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 303 | 2026-09-26 |
| EV-016 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 306 | 2026-09-26 |
| EV-017 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 307 | 2026-09-26 |
| EV-018 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 403 | 2026-09-26 |
| EV-019 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 414 | 2026-09-26 |
| EV-020 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 406 | 2026-09-26 |
| EV-021 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 407 | 2026-09-26 |
| EV-022 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 408 | 2026-09-26 |
| EV-023 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 413 | 2026-09-26 |
| EV-024 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 105 → APPLIED BOTANY | 2026-09-26 |
| EV-025 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Botany → course code BOT 102 | 2026-09-26 |
| EV-026 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Botany → course code BOT 302 | 2026-09-26 |
| EV-027 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Botany → course code BOT 402 | 2026-09-26 |
| EV-028 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Botany → course code BOT 414 | 2026-09-26 |
| EV-029 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 106 → APPLIED BIOLOGY AND GENETICS | 2026-09-26 |
| EV-030 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 201 | 2026-09-26 |
| EV-031 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 410 | 2026-09-26 |
| EV-032 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 107 → CELL BIOLOGY & GENETICS | 2026-09-26 |
| EV-033 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 109 → ENGINEERING PHYSICS | 2026-09-26 |
| EV-034 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics → course code PHY 101 | 2026-09-26 |
| EV-035 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics → course code PHY 102 | 2026-09-26 |
| EV-036 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics → course code PHY 103 | 2026-09-26 |
| EV-037 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics → course code PHY 104 | 2026-09-26 |
| EV-038 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics → course code PHY 107 | 2026-09-26 |
| EV-039 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics → course code PHY 201 | 2026-09-26 |
| EV-040 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics → course code PHY 204 | 2026-09-26 |
| EV-041 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics → course code PHY 205 | 2026-09-26 |
| EV-042 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics → course code PHY 206 | 2026-09-26 |
| EV-043 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics → course code PHY 213 | 2026-09-26 |
| EV-044 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics → course code PHY 214 | 2026-09-26 |
| EV-045 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics → course code PHY 301 | 2026-09-26 |
| EV-046 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics → course code PHY 305 | 2026-09-26 |
| EV-047 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics → course code PHY 306 | 2026-09-26 |
| EV-048 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics → course code PHY 414 | 2026-09-26 |
| EV-049 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics → course code PHY 401 | 2026-09-26 |
| EV-050 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics → course code PHY 403 | 2026-09-26 |
| EV-051 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics → course code PHY 405 | 2026-09-26 |
| EV-052 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics → course code PHY 411 | 2026-09-26 |
| EV-053 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics → course code PHY 421 | 2026-09-26 |
| EV-054 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics → course code PHY 513 | 2026-09-26 |
| EV-055 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics → course code PHY 529 | 2026-09-26 |
| EV-056 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 112 → MARINE BIOLOGY & FISHERIES | 2026-09-26 |
| EV-057 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Marine Science → course code BIO 101 | 2026-09-26 |
| EV-058 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Marine Science → course code BIO 102 | 2026-09-26 |
| EV-059 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Marine Science → course code BIO 107 | 2026-09-26 |
| EV-060 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Marine Science → course code BIO 108 | 2026-09-26 |
| EV-061 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Marine Science → course code MSE 201 | 2026-09-26 |
| EV-062 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Marine Science → course code MSE 202 | 2026-09-26 |
| EV-063 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Marine Science → course code MSE 204 | 2026-09-26 |
| EV-064 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Marine Science → course code MSE 207 | 2026-09-26 |
| EV-065 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Marine Science → course code MSE 301 | 2026-09-26 |
| EV-066 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Marine Science → course code MSE 302 | 2026-09-26 |
| EV-067 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Marine Science → course code MSE 303 | 2026-09-26 |
| EV-068 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Marine Science → course code MSE 305 | 2026-09-26 |
| EV-069 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Marine Science → course code MSE 306 | 2026-09-26 |
| EV-070 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Marine Science → course code MSE 307 | 2026-09-26 |
| EV-071 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Marine Science → course code MSE 401 | 2026-09-26 |
| EV-072 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Marine Science → course code MSE 402 | 2026-09-26 |
| EV-073 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Marine Science → course code MSE 403 | 2026-09-26 |
| EV-074 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 114 → METEOROLOGY AND CLIMATE SCIENCE | 2026-09-26 |
| EV-075 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Meteorology → course code MET 101 | 2026-09-26 |
| EV-076 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Meteorology → course code GEO 205 | 2026-09-26 |
| EV-077 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Meteorology → course code ENT 312 | 2026-09-26 |
| EV-078 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Meteorology → course code MET 302 | 2026-09-26 |
| EV-079 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Meteorology → course code MET 303 | 2026-09-26 |
| EV-080 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Meteorology → course code MET 320 | 2026-09-26 |
| EV-081 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Meteorology → course code MET 403 | 2026-09-26 |
| EV-082 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Meteorology → course code MET 409 | 2026-09-26 |
| EV-083 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Meteorology → course code MET 411 | 2026-09-26 |
| EV-084 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Meteorology → course code MET 415 | 2026-09-26 |
| EV-085 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Meteorology → course code MET 499 | 2026-09-26 |
| EV-086 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Meteorology → course code PHY 401 | 2026-09-26 |
| EV-087 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Meteorology → course code MET 503 | 2026-09-26 |
| EV-088 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 117 → Physics and Computer Electronic | 2026-09-26 |
| EV-089 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics with Electronics → course code COS 101 | 2026-09-26 |
| EV-090 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics with Electronics → course code PHY 101 | 2026-09-26 |
| EV-091 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics with Electronics → course code PHY 102 | 2026-09-26 |
| EV-092 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics with Electronics → course code PHY 103 | 2026-09-26 |
| EV-093 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics with Electronics → course code PHY 104 | 2026-09-26 |
| EV-094 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics with Electronics → course code PHY 205 | 2026-09-26 |
| EV-095 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics with Electronics → course code PHY 206 | 2026-09-26 |
| EV-096 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics with Electronics → course code PHY 213 | 2026-09-26 |
| EV-097 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics with Electronics → course code PHY 301 | 2026-09-26 |
| EV-098 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics with Electronics → course code PHY 305 | 2026-09-26 |
| EV-099 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics with Electronics → course code PHY 306 | 2026-09-26 |
| EV-100 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics with Electronics → course code PHY 401 | 2026-09-26 |
| EV-101 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics with Electronics → course code PHY 403 | 2026-09-26 |
| EV-102 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics with Electronics → course code PHY 404 | 2026-09-26 |
| EV-103 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics with Electronics → course code PHY 422 | 2026-09-26 |
| EV-104 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 119 → Physics with Solar Energy | 2026-09-26 |
| EV-105 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics → course code PHY 202 | 2026-09-26 |
| EV-106 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Physics → course code PHY 211 | 2026-09-26 |
| EV-107 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 120 → Physics and Energy Studies | 2026-09-26 |
| EV-108 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 121 → Physics with Computational Modeling | 2026-09-26 |
| EV-109 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 122 → Physics/Astrology | 2026-09-26 |
| EV-110 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 123 → Physical Sciences (with options in i. Industrial Physics, ii. Physics with Electronics) | 2026-09-26 |
| EV-111 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences programme index printed p. 452; parsed offering-table lead around pp. 480-482. The exact awarder row/cell has not yet been visually confirmed. | 2026-09-26 |
| EV-112 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | Industrial Physics overview/objectives and course/outcome package, printed pp. 346 onward; Physics with Electronics overview/objectives and course/outcome package, printed pp. 586 onward. | 2026-09-26 |
| EV-113 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 125 → Physics and Applied Physics | 2026-09-26 |
| EV-114 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 126 → Pure and Applied Physics | 2026-09-26 |
| EV-115 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 127 → Pure Physics | 2026-09-26 |
| EV-116 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 128 → Pure and Industrial Physics | 2026-09-26 |
| EV-117 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Industrial Physics → course code PHY 101 | 2026-09-26 |
| EV-118 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Industrial Physics → course code PHY 102 | 2026-09-26 |
| EV-119 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Industrial Physics → course code PHY 103 | 2026-09-26 |
| EV-120 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Industrial Physics → course code PHY 104 | 2026-09-26 |
| EV-121 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Industrial Physics → course code PHY 107 | 2026-09-26 |
| EV-122 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Industrial Physics → course code PHY 108 | 2026-09-26 |
| EV-123 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Industrial Physics → course code PHY 201 | 2026-09-26 |
| EV-124 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Industrial Physics → course code PHY 204 | 2026-09-26 |
| EV-125 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Industrial Physics → course code PHY 205 | 2026-09-26 |
| EV-126 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Industrial Physics → course code PHY 305 | 2026-09-26 |
| EV-127 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Industrial Physics → course code PHY 306 | 2026-09-26 |
| EV-128 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Industrial Physics → course code PHY 314 | 2026-09-26 |
| EV-129 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Industrial Physics → course code PHY 401 | 2026-09-26 |
| EV-130 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Industrial Physics → course code PHY 403 | 2026-09-26 |
| EV-131 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Industrial Physics → course code PHY 423 | 2026-09-26 |
| EV-132 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 129 → Industrial Physics with Renewable Energy | 2026-09-26 |
| EV-133 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Industrial Physics → course code PHY 202 | 2026-09-26 |
| EV-134 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 131 → Industrial Physics with Applied Geophysics | 2026-09-26 |
| EV-135 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences programme index printed p. 452; exact institution-awarder cell not yet visually verified. | 2026-09-26 |
| EV-136 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | Applied Geophysics overview/objectives and course/outcome package, printed pp. 29-49; Industrial Physics overview/objectives and course/outcome package, printed pp. 346 onward. | 2026-09-26 |
| EV-137 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 132 → Industrial Physics with Electronics and IT Application | 2026-09-26 |
| EV-138 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences programme index printed p. 452; exact awarder row/cell remains unverified. | 2026-09-26 |
| EV-139 | https://storage.covenantuniversity.edu.ng/wp-content/uploads/2026/04/2026-Undergraduate-Prospectus.pdf | Department of Physics programme overview: four-year B.Sc. Industrial Physics with options including Electronics and Information Technology Applications; exact course schedule is not established by the overview excerpt. | 2026-09-26 |

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

This increment reconciles the current **181–200** queue against the prior row-level evidence. It does **not** close any identity: scope evidence, exact offering context, selected-course fidelity, item-level citations, and external/custom provenance remain open where listed. It performs no downstream domain/subgroup/role audit.

The next bounded increment is **identities 201–220**, maximum **20 identities/packages**, and must save its own append-only JSON/Markdown checkpoint before proceeding.

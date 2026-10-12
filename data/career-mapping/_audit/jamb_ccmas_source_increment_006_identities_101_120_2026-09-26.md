# JAMB–CCMAS source increment 006 — identities 101–120

**Audit date:** 2026-09-26 (Africa/Lagos)  
**Mode:** bounded reconciliation after checkpoint 003; append-only  
**Assigned lane:** JAMB identity/offering and CCMAS/external source integrity only  
**Write boundary:** no shared source, mapping, scope, seed, SQL, UI, downstream taxonomy, domain, subgroup, or role file was edited.

## Exact coverage inspected

- Canonical JAMB identities: **20/20**, rows **101–120**.
- Current queue records: **20 identity rows**, **66 current issue records**.
- Current selected-course occurrences represented by those rows: **28**.
- Parsed offering occurrences represented by those rows: **24**.
- CCMAS/external components inspected through the current records: **Computing::Computer Science, Computing::Cybersecurity, Computing::Information Systems, Computing::Information Technology, Computing::Software Engineering, Sciences::Biology, Sciences::Biotechnology, Sciences::Botany, Sciences::Chemistry, Sciences::Geology, Sciences::Industrial Chemistry, Sciences::Industrial Mathematics, Sciences::Mathematics, Sciences::Microbiology, Sciences::Physics, Sciences::Physics with Electronics, Sciences::Science Laboratory Technology, Sciences::Statistics, Sciences::Zoology**.
- Prior row-level evidence was read first from the existing final-gap checkpoint(s) for rows **101–120**; already-verified facts were not re-researched.

## Records inspected

| Row | JAMB identity | Component reference(s) | Current scope state | Selected courses | Offering records | Current issue IDs |
|---:|---|---|---|---:|---:|---|
| 101 | Computer Science | Computing::Computer Science | full | 0 | 2 | SRC-00308, SRC-00309 |
| 102 | Chemistry | Sciences::Chemistry | full | 0 | 1 | SRC-00310, SRC-00311 |
| 103 | Microbiology | Sciences::Microbiology | full | 0 | 1 | SRC-00312, SRC-00313 |
| 104 | Mathematics | Sciences::Mathematics | full | 0 | 1 | SRC-00314, SRC-00315 |
| 105 | PHYSICS | Sciences::Physics | full | 0 | 1 | SRC-00316, SRC-00317 |
| 106 | BIOLOGY | Sciences::Biology | full | 0 | 1 | SRC-00318, SRC-00319 |
| 107 | CYBER SECURITY | Computing::Cybersecurity | partial_scope_reviewed | 9 | 1 | SRC-00320, SRC-00321, SRC-00322, SRC-00323 |
| 108 | Statistics | Sciences::Statistics | full | 0 | 2 | SRC-00324, SRC-00325 |
| 109 | Software Engineering | Computing::Software Engineering | full | 0 | 2 | SRC-00326, SRC-00327 |
| 110 | PHYSICS WITH ELECTRONICS | Sciences::Physics with Electronics | full | 0 | 1 | SRC-00328, SRC-00329 |
| 111 | Geology | Sciences::Geology | full | 0 | 1 | SRC-00330, SRC-00331 |
| 112 | INFORMATION TECHNOLOGY | Computing::Information Technology | full | 0 | 1 | SRC-00332, SRC-00333 |
| 113 | Zoology | Sciences::Zoology | full | 0 | 1 | SRC-00334, SRC-00335 |
| 114 | Botany | Sciences::Botany | full | 0 | 1 | SRC-00336, SRC-00337 |
| 115 | Industrial Mathematics | Sciences::Industrial Mathematics | full | 0 | 1 | SRC-00338, SRC-00339 |
| 116 | Plant Science and Biotechnology | Sciences::Biotechnology | partial_scope_reviewed | 19 | 1 | SRC-00340, SRC-00341, SRC-00342 |
| 117 | Industrial Chemistry | Sciences::Industrial Chemistry | full | 0 | 1 | SRC-00343, SRC-00344 |
| 118 | Science Laboratory Technology | Sciences::Science Laboratory Technology | full | 0 | 1 | SRC-00345, SRC-00346 |
| 119 | Biotechnology | Sciences::Biotechnology | full | 0 | 2 | SRC-00347, SRC-00348 |
| 120 | INFORMATION SYSTEMS | Computing::Information Systems | full | 0 | 1 | SRC-00349, SRC-00350 |

## Current issue counts

- Confirmed gaps still open: **43**.
- Candidate issues still open: **0**.
- New issue classes discovered in this reconciliation: **0**.
- Closed findings reopened: **0**.
- Distinct exact evidence references captured: **51**.

By issue type/status:

- `offering_context_unverified` / `confirmed_gap`: 20
- `scope_evidence_missing` / `confirmed_gap`: 20
- `selected_course_citation_incomplete` / `confirmed_gap`: 2
- `selected_course_content_or_outcome_gap` / `confirmed_gap`: 1

## Confirmed and candidate issue ledger

The following are current open records carried from the source issue queue. They are not claims that every record below is an academic-content defect; provenance, offering-context, and citation gaps remain distinct from content defects.

| Issue | Row | Status | Type | Evidence refs | Recommendation |
|---|---:|---|---|---|---|
| SRC-00308 | 101 | confirmed_gap | scope_evidence_missing | EV-001, EV-002 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00309 | 101 | confirmed_gap | offering_context_unverified | EV-001, EV-002 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00310 | 102 | confirmed_gap | scope_evidence_missing | EV-003 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00311 | 102 | confirmed_gap | offering_context_unverified | EV-003 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00312 | 103 | confirmed_gap | scope_evidence_missing | EV-004 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00313 | 103 | confirmed_gap | offering_context_unverified | EV-004 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00314 | 104 | confirmed_gap | scope_evidence_missing | EV-005 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00315 | 104 | confirmed_gap | offering_context_unverified | EV-005 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00316 | 105 | confirmed_gap | scope_evidence_missing | EV-006 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00317 | 105 | confirmed_gap | offering_context_unverified | EV-006 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00318 | 106 | confirmed_gap | scope_evidence_missing | EV-007 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00319 | 106 | confirmed_gap | offering_context_unverified | EV-007 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00320 | 107 | confirmed_gap | scope_evidence_missing | EV-008 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00321 | 107 | confirmed_gap | offering_context_unverified | EV-008 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00322 | 107 | confirmed_gap | selected_course_citation_incomplete | EV-009, EV-010, EV-011, EV-012, EV-013, EV-014, EV-015, EV-016 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00323 | 107 | confirmed_gap | selected_course_content_or_outcome_gap | EV-009, EV-010, EV-011, EV-012, EV-013, EV-014, EV-015, EV-016 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00324 | 108 | confirmed_gap | scope_evidence_missing | EV-017, EV-018 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00325 | 108 | confirmed_gap | offering_context_unverified | EV-017, EV-018 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00326 | 109 | confirmed_gap | scope_evidence_missing | EV-019, EV-020 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00327 | 109 | confirmed_gap | offering_context_unverified | EV-019, EV-020 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00328 | 110 | confirmed_gap | scope_evidence_missing | EV-021 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00329 | 110 | confirmed_gap | offering_context_unverified | EV-021 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00330 | 111 | confirmed_gap | scope_evidence_missing | EV-022 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00331 | 111 | confirmed_gap | offering_context_unverified | EV-022 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00332 | 112 | confirmed_gap | scope_evidence_missing | EV-023 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00333 | 112 | confirmed_gap | offering_context_unverified | EV-023 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00334 | 113 | confirmed_gap | scope_evidence_missing | EV-024 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00335 | 113 | confirmed_gap | offering_context_unverified | EV-024 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00336 | 114 | confirmed_gap | scope_evidence_missing | EV-025 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00337 | 114 | confirmed_gap | offering_context_unverified | EV-025 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00338 | 115 | confirmed_gap | scope_evidence_missing | EV-026 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00339 | 115 | confirmed_gap | offering_context_unverified | EV-026 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00340 | 116 | confirmed_gap | scope_evidence_missing | EV-027 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00341 | 116 | confirmed_gap | offering_context_unverified | EV-027 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00342 | 116 | confirmed_gap | selected_course_citation_incomplete | EV-028, EV-029, EV-030, EV-031, EV-032, EV-033, EV-034, EV-035, EV-036, EV-037, EV-038, EV-039, EV-040, EV-041, EV-042, EV-043, EV-044, EV-045, EV-046 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00343 | 117 | confirmed_gap | scope_evidence_missing | EV-047 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00344 | 117 | confirmed_gap | offering_context_unverified | EV-047 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00345 | 118 | confirmed_gap | scope_evidence_missing | EV-048 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00346 | 118 | confirmed_gap | offering_context_unverified | EV-048 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00347 | 119 | confirmed_gap | scope_evidence_missing | EV-049, EV-050 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00348 | 119 | confirmed_gap | offering_context_unverified | EV-049, EV-050 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00349 | 120 | confirmed_gap | scope_evidence_missing | EV-051 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00350 | 120 | confirmed_gap | offering_context_unverified | EV-051 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |

## Exact evidence URLs, locators, and access dates

### Structured evidence references attached to issue records

| Ref | URL | Exact locator | Accessed |
|---|---|---|---|
| EV-001 | none | engineering.txt → parsed row ordinal 8 → Computer Science | 2026-09-26 |
| EV-002 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 1 → Computer Science | 2026-09-26 |
| EV-003 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 2 → Chemistry | 2026-09-26 |
| EV-004 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 3 → Microbiology | 2026-09-26 |
| EV-005 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 4 → Mathematics | 2026-09-26 |
| EV-006 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 5 → PHYSICS | 2026-09-26 |
| EV-007 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 6 → BIOLOGY | 2026-09-26 |
| EV-008 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 7 → CYBER SECURITY | 2026-09-26 |
| EV-009 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Cybersecurity → course code CYB 203 | 2026-09-26 |
| EV-010 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Cybersecurity → course code CYB 302 | 2026-09-26 |
| EV-011 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Cybersecurity → course code CYB 303 | 2026-09-26 |
| EV-012 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Cybersecurity → course code CYB 304 | 2026-09-26 |
| EV-013 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Cybersecurity → course code CYB 322 | 2026-09-26 |
| EV-014 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Cybersecurity → course code CYB 403 | 2026-09-26 |
| EV-015 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Cybersecurity → course code CYB 404 | 2026-09-26 |
| EV-016 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Cybersecurity → course code CYB 406 | 2026-09-26 |
| EV-017 | none | engineering.txt → parsed row ordinal 15 → Statistics | 2026-09-26 |
| EV-018 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 8 → Statistics | 2026-09-26 |
| EV-019 | none | engineering.txt → parsed row ordinal 21 → Software Engineering | 2026-09-26 |
| EV-020 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 9 → Software Engineering | 2026-09-26 |
| EV-021 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 10 → PHYSICS WITH ELECTRONICS | 2026-09-26 |
| EV-022 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 11 → Geology | 2026-09-26 |
| EV-023 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 12 → INFORMATION TECHNOLOGY | 2026-09-26 |
| EV-024 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 13 → Zoology | 2026-09-26 |
| EV-025 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 14 → Botany | 2026-09-26 |
| EV-026 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 15 → Industrial Mathematics | 2026-09-26 |
| EV-027 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 16 → Plant Science and Biotechnology | 2026-09-26 |
| EV-028 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BIO 102 | 2026-09-26 |
| EV-029 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BIO 108 | 2026-09-26 |
| EV-030 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code CHM 101 | 2026-09-26 |
| EV-031 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 202 | 2026-09-26 |
| EV-032 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 301 | 2026-09-26 |
| EV-033 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 302 | 2026-09-26 |
| EV-034 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 304 | 2026-09-26 |
| EV-035 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 305 | 2026-09-26 |
| EV-036 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 309 | 2026-09-26 |
| EV-037 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 311 | 2026-09-26 |
| EV-038 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 313 | 2026-09-26 |
| EV-039 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 315 | 2026-09-26 |
| EV-040 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 401 | 2026-09-26 |
| EV-041 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 403 | 2026-09-26 |
| EV-042 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 404 | 2026-09-26 |
| EV-043 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 405 | 2026-09-26 |
| EV-044 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 406 | 2026-09-26 |
| EV-045 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 407 | 2026-09-26 |
| EV-046 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 433 | 2026-09-26 |
| EV-047 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 17 → Industrial Chemistry | 2026-09-26 |
| EV-048 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 18 → Science Laboratory Technology | 2026-09-26 |
| EV-049 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf | agriculture.txt → parsed row ordinal 2 → Biotechnology | 2026-09-26 |
| EV-050 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 19 → Biotechnology | 2026-09-26 |
| EV-051 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 21 → INFORMATION SYSTEMS | 2026-09-26 |

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
- `data/career-mapping/_audit/jamb_ccmas_final_gap_verification_rows_101_110_2026-09-26_001.md`
- `data/career-mapping/_audit/jamb_ccmas_final_gap_verification_rows_111_120_2026-09-26_001.md`
- `data/career-mapping/_audit/jamb_ccmas_source_issue_queue_2026-09-26_001.json`
- `data/career-mapping/_audit/jamb_ccmas_source_issue_queue_2026-09-26_001.md`
- `data/career-mapping/_audit/jamb_curriculum_scopes_2026-08-17.json`
- `data/career-mapping/_audit/jamb_anomaly_inventory_2026-09-26.json`
- `data/career-mapping/_audit/jamb_offering_context_inventory_2026-09-25.json`
- `data/career-mapping/_audit/ccmas_extraction_anomaly_inventory_2026-09-26.json`


Closed work intentionally not reopened: French Arts anchor correction; Film and Video Studies Social/Management occurrence addition; recorded CCMAS page-header repairs; CAM424 equipment-spill repair; DTS498/CSC432 cross-reference repair; and replacement-character normalization classified as encoding-only.

## Disposition and resume boundary

This increment reconciles the current **101–120** queue against the prior row-level evidence. It does **not** close any identity: scope evidence, exact offering context, selected-course fidelity, item-level citations, and external/custom provenance remain open where listed. It performs no downstream domain/subgroup/role audit.

The next bounded increment is **identities 121–140**, maximum **20 identities/packages**, and must save its own append-only JSON/Markdown checkpoint before proceeding.

# JAMB–CCMAS source increment 019 — identities 361–380

**Audit date:** 2026-09-26 (Africa/Lagos)  
**Mode:** bounded reconciliation after checkpoint 003; append-only  
**Assigned lane:** JAMB identity/offering and CCMAS/external source integrity only  
**Write boundary:** no shared source, mapping, scope, seed, SQL, UI, downstream taxonomy, domain, subgroup, or role file was edited.

## Exact coverage inspected

- Canonical JAMB identities: **20/20**, rows **361–380**.
- Current queue records: **20 identity rows**, **66 current issue records**.
- Current selected-course occurrences represented by those rows: **58**.
- Parsed offering occurrences represented by those rows: **21**.
- CCMAS/external components inspected through the current records: **Arts::Archaeology, Communication and Media Studies::INFORMATION AND MEDIA STUDIES — P12, P13, P14, Computing::Information Systems, Education::Technology Education, Engineering::ELECTRONIC ENGINEERING, Engineering::TELECOMMUNICATIONS ENGINEERING, Environmental Sciences::Environmental Management, Sciences::Biology, Sciences::Meteorology, Sciences::Petroleum Chemistry, Sciences::Physics, Sciences::Physics with Electronics, Social Sciences::Library and Information Science, __custom__::Anthropology**.
- Prior row-level evidence was read first from the existing final-gap checkpoint(s) for rows **361–380**; already-verified facts were not re-researched.

## Records inspected

| Row | JAMB identity | Component reference(s) | Current scope state | Selected courses | Offering records | Current issue IDs |
|---:|---|---|---|---:|---:|---|
| 361 | Applied and Renewable Energy | Sciences::Physics | full | 0 | 1 | SRC-01104, SRC-01105 |
| 362 | Energy Studies | Sciences::Physics | full | 0 | 1 | SRC-01106, SRC-01107 |
| 363 | Energy and Petroleum Studies | Sciences::Petroleum Chemistry | full | 0 | 1 | SRC-01108, SRC-01109 |
| 364 | Electrons | Sciences::Physics with Electronics | full | 0 | 1 | SRC-01110, SRC-01111 |
| 365 | ELECTRONICS AND COMMUNICATIONS | Engineering::ELECTRONIC ENGINEERING | full | 0 | 1 | SRC-01112, SRC-01113 |
| 366 | COMMUNICATIONS TECHNOLOGY | Engineering::TELECOMMUNICATIONS ENGINEERING | full | 0 | 1 | SRC-01114, SRC-01115 |
| 367 | COMMUNICATION AND WIRELESS TECHNOLOGY | Engineering::TELECOMMUNICATIONS ENGINEERING | full | 0 | 1 | SRC-01116, SRC-01117 |
| 368 | TELECOMMUNICATION AND WIRELESS TECHNOLOGY | Engineering::TELECOMMUNICATIONS ENGINEERING | full | 0 | 1 | SRC-01118, SRC-01119 |
| 369 | TELECOMMUNICATION SCIENCE | Engineering::TELECOMMUNICATIONS ENGINEERING | full | 0 | 1 | SRC-01120, SRC-01121 |
| 370 | TELECOMMUNICATION MANAGEMENT | Engineering::TELECOMMUNICATIONS ENGINEERING | full | 0 | 1 | SRC-01122, SRC-01123 |
| 371 | COMMUNICATION AND DIGITAL MEDIA STUDIES | Communication and Media Studies::INFORMATION AND MEDIA STUDIES — P12, P13, P14 | full | 0 | 1 | SRC-01124, SRC-01125 |
| 372 | INFORMATION SCIENCE | Computing::Information Systems | full | 0 | 1 | SRC-01126, SRC-01127 |
| 373 | NATURAL AND ENVIRONMENTAL SCIENCE | Environmental Sciences::Environmental Management | full | 0 | 1 | SRC-01128, SRC-01129 |
| 374 | ANTHROPOLOGY | Sciences::Biology | full | 0 | 1 | SRC-01130, SRC-01131 |
| 375 | Anthropology | __custom__::Anthropology | external_scope_evidenced | 21 | 1 | SRC-01132, SRC-01133, SRC-01134, SRC-01135 |
| 376 | ARCHEAOLOGY | Arts::Archaeology | full | 0 | 1 | SRC-01136, SRC-01137 |
| 377 | Vocational Education | Education::Technology Education | partial_scope_reviewed | 8 | 1 | SRC-01138, SRC-01139, SRC-01140, SRC-01141 |
| 378 | LIBRARY SCIENCE | Social Sciences::Library and Information Science | partial_scope_reviewed | 29 | 1 | SRC-01142, SRC-01143, SRC-01144, SRC-01145 |
| 379 | LIBRARY AND INFORMATION SCIENCE | Social Sciences::Library and Information Science | full | 0 | 2 | SRC-01146, SRC-01147 |
| 380 | Meteorology | Sciences::Meteorology | full | 0 | 1 | SRC-01148, SRC-01149 |

## Current issue counts

- Confirmed gaps still open: **45**.
- Candidate issues still open: **1**.
- New issue classes discovered in this reconciliation: **0**.
- Closed findings reopened: **0**.
- Distinct exact evidence references captured: **100**.

By issue type/status:

- `external_or_custom_evidence_contract` / `candidate`: 1
- `offering_context_unverified` / `confirmed_gap`: 20
- `scope_evidence_missing` / `confirmed_gap`: 20
- `selected_course_citation_incomplete` / `confirmed_gap`: 3
- `selected_course_content_or_outcome_gap` / `confirmed_gap`: 2

## Confirmed and candidate issue ledger

The following are current open records carried from the source issue queue. They are not claims that every record below is an academic-content defect; provenance, offering-context, and citation gaps remain distinct from content defects.

| Issue | Row | Status | Type | Evidence refs | Recommendation |
|---|---:|---|---|---|---|
| SRC-01104 | 361 | confirmed_gap | scope_evidence_missing | EV-001 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01105 | 361 | confirmed_gap | offering_context_unverified | EV-001 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01106 | 362 | confirmed_gap | scope_evidence_missing | EV-002 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01107 | 362 | confirmed_gap | offering_context_unverified | EV-002 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01108 | 363 | confirmed_gap | scope_evidence_missing | EV-003 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01109 | 363 | confirmed_gap | offering_context_unverified | EV-003 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01110 | 364 | confirmed_gap | scope_evidence_missing | EV-004 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01111 | 364 | confirmed_gap | offering_context_unverified | EV-004 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01112 | 365 | confirmed_gap | scope_evidence_missing | EV-005 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01113 | 365 | confirmed_gap | offering_context_unverified | EV-005 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01114 | 366 | confirmed_gap | scope_evidence_missing | EV-006 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01115 | 366 | confirmed_gap | offering_context_unverified | EV-006 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01116 | 367 | confirmed_gap | scope_evidence_missing | EV-007 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01117 | 367 | confirmed_gap | offering_context_unverified | EV-007 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01118 | 368 | confirmed_gap | scope_evidence_missing | EV-008 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01119 | 368 | confirmed_gap | offering_context_unverified | EV-008 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01120 | 369 | confirmed_gap | scope_evidence_missing | EV-009 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01121 | 369 | confirmed_gap | offering_context_unverified | EV-009 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01122 | 370 | confirmed_gap | scope_evidence_missing | EV-010 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01123 | 370 | confirmed_gap | offering_context_unverified | EV-010 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01124 | 371 | confirmed_gap | scope_evidence_missing | EV-011 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01125 | 371 | confirmed_gap | offering_context_unverified | EV-011 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01126 | 372 | confirmed_gap | scope_evidence_missing | EV-012 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01127 | 372 | confirmed_gap | offering_context_unverified | EV-012 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01128 | 373 | confirmed_gap | scope_evidence_missing | EV-013 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01129 | 373 | confirmed_gap | offering_context_unverified | EV-013 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01130 | 374 | confirmed_gap | scope_evidence_missing | EV-014 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01131 | 374 | confirmed_gap | offering_context_unverified | EV-014 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01132 | 375 | confirmed_gap | scope_evidence_missing | EV-015 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01133 | 375 | confirmed_gap | offering_context_unverified | EV-015 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01134 | 375 | confirmed_gap | selected_course_citation_incomplete | EV-016, EV-017, EV-018, EV-019, EV-020, EV-021, EV-022, EV-023, EV-024, EV-025, EV-026, EV-027, EV-028, EV-029, EV-030, EV-031, EV-032, EV-033, EV-034, EV-035, EV-036 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-01135 | 375 | candidate | external_or_custom_evidence_contract | EV-037, EV-038, EV-039, EV-040, EV-041, EV-042, EV-043, EV-044, EV-045, EV-046, EV-047, EV-048, EV-049, EV-050, EV-051, EV-052, EV-053, EV-054, EV-055, EV-056, EV-057 | For every external/custom course, retain an authoritative item-specific URL, locator, access date, provider/programme context, and limits of applicability; do not treat a custom scope as a CCMAS degree anchor. |
| SRC-01136 | 376 | confirmed_gap | scope_evidence_missing | EV-058 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01137 | 376 | confirmed_gap | offering_context_unverified | EV-058 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01138 | 377 | confirmed_gap | scope_evidence_missing | EV-059 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01139 | 377 | confirmed_gap | offering_context_unverified | EV-059 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01140 | 377 | confirmed_gap | selected_course_citation_incomplete | EV-060, EV-061, EV-062, EV-063, EV-064, EV-065, EV-066, EV-067 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-01141 | 377 | confirmed_gap | selected_course_content_or_outcome_gap | EV-060, EV-061, EV-062, EV-063, EV-064, EV-065, EV-066, EV-067 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-01142 | 378 | confirmed_gap | scope_evidence_missing | EV-068 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01143 | 378 | confirmed_gap | offering_context_unverified | EV-068 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01144 | 378 | confirmed_gap | selected_course_citation_incomplete | EV-069, EV-070, EV-071, EV-072, EV-073, EV-074, EV-075, EV-076, EV-077, EV-078, EV-079, EV-080, EV-081, EV-082, EV-083, EV-084, EV-085, EV-086, EV-087, EV-088, EV-089, EV-090, EV-091, EV-092, EV-093, EV-094, EV-095, EV-096, EV-097 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-01145 | 378 | confirmed_gap | selected_course_content_or_outcome_gap | EV-069, EV-070, EV-071, EV-072, EV-073, EV-074, EV-075, EV-076, EV-077, EV-078, EV-079, EV-080, EV-081, EV-082, EV-083, EV-084, EV-085, EV-086, EV-087, EV-088, EV-089, EV-090, EV-091, EV-092, EV-093, EV-094, EV-095, EV-096, EV-097 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-01146 | 379 | confirmed_gap | scope_evidence_missing | EV-098, EV-099 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01147 | 379 | confirmed_gap | offering_context_unverified | EV-098, EV-099 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01148 | 380 | confirmed_gap | scope_evidence_missing | EV-100 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01149 | 380 | confirmed_gap | offering_context_unverified | EV-100 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |

## Exact evidence URLs, locators, and access dates

### Structured evidence references attached to issue records

| Ref | URL | Exact locator | Accessed |
|---|---|---|---|
| EV-001 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 130 → Applied and Renewable Energy | 2026-09-26 |
| EV-002 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 124 → Energy Studies | 2026-09-26 |
| EV-003 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 179 → Energy and Petroleum Studies | 2026-09-26 |
| EV-004 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 118 → Electrons | 2026-09-26 |
| EV-005 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 102 → ELECTRONICS AND COMMUNICATIONS | 2026-09-26 |
| EV-006 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 67 → COMMUNICATIONS TECHNOLOGY | 2026-09-26 |
| EV-007 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 89 → COMMUNICATION AND WIRELESS TECHNOLOGY | 2026-09-26 |
| EV-008 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 92 → TELECOMMUNICATION AND WIRELESS TECHNOLOGY | 2026-09-26 |
| EV-009 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 91 → TELECOMMUNICATION SCIENCE | 2026-09-26 |
| EV-010 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 90 → TELECOMMUNICATION MANAGEMENT | 2026-09-26 |
| EV-011 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 93 → COMMUNICATION AND DIGITAL MEDIA STUDIES | 2026-09-26 |
| EV-012 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 97 → INFORMATION SCIENCE | 2026-09-26 |
| EV-013 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 115 → NATURAL AND ENVIRONMENTAL SCIENCE | 2026-09-26 |
| EV-014 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 111 → ANTHROPOLOGY | 2026-09-26 |
| EV-015 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf | arts_hum.txt → parsed row ordinal 31 → Anthropology | 2026-09-26 |
| EV-016 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code ANT 102 | 2026-09-26 |
| EV-017 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code ANT 121 | 2026-09-26 |
| EV-018 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code ANT 201 | 2026-09-26 |
| EV-019 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code ANT 212 | 2026-09-26 |
| EV-020 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code ANT 214 | 2026-09-26 |
| EV-021 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code ANT 303 | 2026-09-26 |
| EV-022 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code ANT 313 | 2026-09-26 |
| EV-023 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code ANT 321 | 2026-09-26 |
| EV-024 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code ANT 323 | 2026-09-26 |
| EV-025 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code ANT 328 | 2026-09-26 |
| EV-026 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code ANT 354 | 2026-09-26 |
| EV-027 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code ANT 411 | 2026-09-26 |
| EV-028 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code ANT 412 | 2026-09-26 |
| EV-029 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code ANT 421 | 2026-09-26 |
| EV-030 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code ANT 423 | 2026-09-26 |
| EV-031 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code SOC 141 | 2026-09-26 |
| EV-032 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code SOC 142 | 2026-09-26 |
| EV-033 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code SOC 143 | 2026-09-26 |
| EV-034 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code SOC 244 | 2026-09-26 |
| EV-035 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code SOC 345 | 2026-09-26 |
| EV-036 | https://www.nuc.edu.ng/ccmas/ | unknown CCMAS file → unknown package → course code SOC 446 | 2026-09-26 |
| EV-037 | none | external/custom course ANT 102 — Introduction to Anthropology | 2026-09-26 |
| EV-038 | none | external/custom course ANT 121 — Language in Society and Culture | 2026-09-26 |
| EV-039 | none | external/custom course ANT 201 — History of Sociological and Anthropological Thought | 2026-09-26 |
| EV-040 | none | external/custom course ANT 212 — African Social Institutions | 2026-09-26 |
| EV-041 | none | external/custom course ANT 214 — Symbolic Anthropology | 2026-09-26 |
| EV-042 | none | external/custom course ANT 303 — Nigerian Peoples and Cultures | 2026-09-26 |
| EV-043 | none | external/custom course ANT 313 — Anthropology of Peasant Societies | 2026-09-26 |
| EV-044 | none | external/custom course ANT 321 — African Religious Systems | 2026-09-26 |
| EV-045 | none | external/custom course ANT 323 — Political Anthropology | 2026-09-26 |
| EV-046 | none | external/custom course ANT 328 — Traditional Legal Systems | 2026-09-26 |
| EV-047 | none | external/custom course ANT 354 — Contemporary African Social Thought | 2026-09-26 |
| EV-048 | none | external/custom course ANT 411 — Comparative African Social Institutions | 2026-09-26 |
| EV-049 | none | external/custom course ANT 412 — Culture and Communication | 2026-09-26 |
| EV-050 | none | external/custom course ANT 421 — Race and Ethnic Relations | 2026-09-26 |
| EV-051 | none | external/custom course ANT 423 — Urban Sociology and Anthropology | 2026-09-26 |
| EV-052 | none | external/custom course SOC 141 — Introduction to Anthropology | 2026-09-26 |
| EV-053 | none | external/custom course SOC 142 — Nigerian Heritage/Cultural Heritage | 2026-09-26 |
| EV-054 | none | external/custom course SOC 143 — Introduction to African Societies and Cultures | 2026-09-26 |
| EV-055 | none | external/custom course SOC 244 — Language and Culture in Society | 2026-09-26 |
| EV-056 | none | external/custom course SOC 345 — African Social Thought | 2026-09-26 |
| EV-057 | none | external/custom course SOC 446 — Regional Ethnography of Sub-Saharan Africa | 2026-09-26 |
| EV-058 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 103 → ARCHEAOLOGY | 2026-09-26 |
| EV-059 | none | education.txt → parsed row ordinal 1 → Vocational Education | 2026-09-26 |
| EV-060 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf | education.json → Technology Education → course code EDU 101 | 2026-09-26 |
| EV-061 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf | education.json → Technology Education → course code EDU 201 | 2026-09-26 |
| EV-062 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf | education.json → Technology Education → course code ITE 211 | 2026-09-26 |
| EV-063 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf | education.json → Technology Education → course code EDU 301 | 2026-09-26 |
| EV-064 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf | education.json → Technology Education → course code ITE 311 | 2026-09-26 |
| EV-065 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf | education.json → Technology Education → course code ITE 313 | 2026-09-26 |
| EV-066 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf | education.json → Technology Education → course code EDU 401 | 2026-09-26 |
| EV-067 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf | education.json → Technology Education → course code ITE 413 | 2026-09-26 |
| EV-068 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf | Social Management Science.pdf → parsed row ordinal 26 → LIBRARY SCIENCE | 2026-09-26 |
| EV-069 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Library and Information Science → course code LIS 111 | 2026-09-26 |
| EV-070 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Library and Information Science → course code LIS 112 | 2026-09-26 |
| EV-071 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Library and Information Science → course code LIS 114 | 2026-09-26 |
| EV-072 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Library and Information Science → course code LIS 121 | 2026-09-26 |
| EV-073 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Library and Information Science → course code LIS 125 | 2026-09-26 |
| EV-074 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Library and Information Science → course code LIS 211 | 2026-09-26 |
| EV-075 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Library and Information Science → course code LIS 212 | 2026-09-26 |
| EV-076 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Library and Information Science → course code LIS 213 | 2026-09-26 |
| EV-077 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Library and Information Science → course code LIS 214 | 2026-09-26 |
| EV-078 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Library and Information Science → course code LIS 215 | 2026-09-26 |
| EV-079 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Library and Information Science → course code LIS 216 | 2026-09-26 |
| EV-080 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Library and Information Science → course code LIS 222 | 2026-09-26 |
| EV-081 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Library and Information Science → course code LIS 223 | 2026-09-26 |
| EV-082 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Library and Information Science → course code LIS 228 | 2026-09-26 |
| EV-083 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Library and Information Science → course code LIS 229 | 2026-09-26 |
| EV-084 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Library and Information Science → course code LIS 311 | 2026-09-26 |
| EV-085 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Library and Information Science → course code LIS 312 | 2026-09-26 |
| EV-086 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Library and Information Science → course code LIS 313 | 2026-09-26 |
| EV-087 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Library and Information Science → course code LIS 317 | 2026-09-26 |
| EV-088 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Library and Information Science → course code LIS 323 | 2026-09-26 |
| EV-089 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Library and Information Science → course code LIS 325 | 2026-09-26 |
| EV-090 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Library and Information Science → course code LIS 326 | 2026-09-26 |
| EV-091 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Library and Information Science → course code LIS 327 | 2026-09-26 |
| EV-092 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Library and Information Science → course code LIS 329 | 2026-09-26 |
| EV-093 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Library and Information Science → course code LIS 416 | 2026-09-26 |
| EV-094 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Library and Information Science → course code LIS 418 | 2026-09-26 |
| EV-095 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Library and Information Science → course code LIS 421 | 2026-09-26 |
| EV-096 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Library and Information Science → course code LIS 423 | 2026-09-26 |
| EV-097 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf | social_sciences.json → Library and Information Science → course code LIS 424 | 2026-09-26 |
| EV-098 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 30 → LIBRARY AND INFORMATION SCIENCE | 2026-09-26 |
| EV-099 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf | Social Management Science.pdf → parsed row ordinal 27 → LIBRARY AND INFORMATION SCIENCE | 2026-09-26 |
| EV-100 | none | engineering.txt → parsed row ordinal 22 → Meteorology | 2026-09-26 |

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
- `data/career-mapping/_audit/jamb_ccmas_final_verification_rows_281_420_2026-09-26_009.md`
- `data/career-mapping/_audit/jamb_ccmas_final_verification_rows_281_420_2026-09-26_010.md`
- `data/career-mapping/_audit/jamb_ccmas_source_issue_queue_2026-09-26_001.json`
- `data/career-mapping/_audit/jamb_ccmas_source_issue_queue_2026-09-26_001.md`
- `data/career-mapping/_audit/jamb_curriculum_scopes_2026-08-17.json`
- `data/career-mapping/_audit/jamb_anomaly_inventory_2026-09-26.json`
- `data/career-mapping/_audit/jamb_offering_context_inventory_2026-09-25.json`
- `data/career-mapping/_audit/ccmas_extraction_anomaly_inventory_2026-09-26.json`


Closed work intentionally not reopened: French Arts anchor correction; Film and Video Studies Social/Management occurrence addition; recorded CCMAS page-header repairs; CAM424 equipment-spill repair; DTS498/CSC432 cross-reference repair; and replacement-character normalization classified as encoding-only.

## Disposition and resume boundary

This increment reconciles the current **361–380** queue against the prior row-level evidence. It does **not** close any identity: scope evidence, exact offering context, selected-course fidelity, item-level citations, and external/custom provenance remain open where listed. It performs no downstream domain/subgroup/role audit.

The next bounded increment is **identities 381–400**, maximum **20 identities/packages**, and must save its own append-only JSON/Markdown checkpoint before proceeding.

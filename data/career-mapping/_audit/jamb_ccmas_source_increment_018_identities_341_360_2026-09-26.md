# JAMB–CCMAS source increment 018 — identities 341–360

**Audit date:** 2026-09-26 (Africa/Lagos)  
**Mode:** bounded reconciliation after checkpoint 003; append-only  
**Assigned lane:** JAMB identity/offering and CCMAS/external source integrity only  
**Write boundary:** no shared source, mapping, scope, seed, SQL, UI, downstream taxonomy, domain, subgroup, or role file was edited.

## Exact coverage inspected

- Canonical JAMB identities: **20/20**, rows **341–360**.
- Current queue records: **20 identity rows**, **66 current issue records**.
- Current selected-course occurrences represented by those rows: **168**.
- Parsed offering occurrences represented by those rows: **22**.
- CCMAS/external components inspected through the current records: **Administration and Management::Logistics and Supply Chain Management, Allied Health Sciences::Optometry, Arts::Islamic Studies, Communication and Media Studies::FILM & MULTIMEDIA — P12, P13, P14, Communication and Media Studies::INFORMATION AND MEDIA STUDIES — P12, P13, P14, Communication and Media Studies::PUBLIC RELATIONS — P12, P13, P14, Communication and Media Studies::STRATEGIC COMMUNICATION — P12, P13, P14, Environmental Sciences::Clothing and Textile Design, Environmental Sciences::Surveying and Geoinformatics, Sciences::Biology, Sciences::Biotechnology, Sciences::Geology, Sciences::Industrial Mathematics, Sciences::Marine Science, Sciences::Zoology**.
- Prior row-level evidence was read first from the existing final-gap checkpoint(s) for rows **341–360**; already-verified facts were not re-researched.

## Records inspected

| Row | JAMB identity | Component reference(s) | Current scope state | Selected courses | Offering records | Current issue IDs |
|---:|---|---|---|---:|---:|---|
| 341 | INFORMATION SCIENCE AND MEDIA STUDIES | Communication and Media Studies::INFORMATION AND MEDIA STUDIES — P12, P13, P14 | partial_scope_reviewed | 27 | 1 | SRC-01051, SRC-01052, SRC-01053, SRC-01054 |
| 342 | Information and Media Studies | Communication and Media Studies::INFORMATION AND MEDIA STUDIES — P12, P13, P14 | partial_scope_reviewed | 27 | 1 | SRC-01055, SRC-01056, SRC-01057, SRC-01058 |
| 343 | Islamic Studies | Arts::Islamic Studies | full | 0 | 1 | SRC-01059, SRC-01060 |
| 344 | Optometry | Allied Health Sciences::Optometry | full | 0 | 2 | SRC-01061, SRC-01062 |
| 345 | Public Relations and Advertising | Communication and Media Studies::PUBLIC RELATIONS — P12, P13, P14 | partial_scope_reviewed | 24 | 1 | SRC-01063, SRC-01064, SRC-01065, SRC-01066 |
| 346 | Strategic Communication | Communication and Media Studies::STRATEGIC COMMUNICATION — P12, P13, P14 | partial_scope_reviewed | 31 | 1 | SRC-01067, SRC-01068, SRC-01069, SRC-01070 |
| 347 | Supply Chain Management | Administration and Management::Logistics and Supply Chain Management | partial_scope_reviewed | 19 | 1 | SRC-01071, SRC-01072, SRC-01073 |
| 348 | Surveying and Geoinformatics | Environmental Sciences::Surveying and Geoinformatics | full | 0 | 1 | SRC-01074, SRC-01075 |
| 349 | Textile Science and Technology | Environmental Sciences::Clothing and Textile Design | partial_scope_reviewed | 19 | 1 | SRC-01076, SRC-01077, SRC-01078, SRC-01079 |
| 350 | Film and Video Studies | Communication and Media Studies::FILM & MULTIMEDIA — P12, P13, P14 | partial_scope_reviewed | 21 | 2 | SRC-01080, SRC-01081, SRC-01082, SRC-01083 |
| 351 | OCEANOGRAPHY | Sciences::Marine Science | full | 0 | 1 | SRC-01084, SRC-01085 |
| 352 | Earth Science | Sciences::Geology | full | 0 | 1 | SRC-01086, SRC-01087 |
| 353 | Geoscience | Sciences::Geology | full | 0 | 1 | SRC-01088, SRC-01089 |
| 354 | Ecology | Sciences::Biology | full | 0 | 1 | SRC-01090, SRC-01091 |
| 355 | Applied Ecology | Sciences::Biology | full | 0 | 1 | SRC-01092, SRC-01093 |
| 356 | Ecology and Environmental Studies | Sciences::Biology | full | 0 | 1 | SRC-01094, SRC-01095 |
| 357 | Parasitology and Entomology | Sciences::Zoology | full | 0 | 1 | SRC-01096, SRC-01097 |
| 358 | BIOINFORMATICS | Sciences::Biotechnology | full | 0 | 1 | SRC-01098, SRC-01099 |
| 359 | OPERATIONS RESEARCH | Sciences::Industrial Mathematics | full | 0 | 1 | SRC-01100, SRC-01101 |
| 360 | BIOLOGICAL SCIENCE(S) | Sciences::Biology | full | 0 | 1 | SRC-01102, SRC-01103 |

## Current issue counts

- Confirmed gaps still open: **53**.
- Candidate issues still open: **0**.
- New issue classes discovered in this reconciliation: **0**.
- Closed findings reopened: **0**.
- Distinct exact evidence references captured: **163**.

By issue type/status:

- `offering_context_unverified` / `confirmed_gap`: 20
- `scope_evidence_missing` / `confirmed_gap`: 20
- `selected_course_citation_incomplete` / `confirmed_gap`: 7
- `selected_course_content_or_outcome_gap` / `confirmed_gap`: 6

## Confirmed and candidate issue ledger

The following are current open records carried from the source issue queue. They are not claims that every record below is an academic-content defect; provenance, offering-context, and citation gaps remain distinct from content defects.

| Issue | Row | Status | Type | Evidence refs | Recommendation |
|---|---:|---|---|---|---|
| SRC-01051 | 341 | confirmed_gap | scope_evidence_missing | EV-001 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01052 | 341 | confirmed_gap | offering_context_unverified | EV-001 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01053 | 341 | confirmed_gap | selected_course_citation_incomplete | EV-002, EV-003, EV-004, EV-005, EV-006, EV-007, EV-008, EV-009, EV-010, EV-011, EV-012, EV-013, EV-014, EV-015, EV-016, EV-017, EV-018, EV-019, EV-020, EV-021, EV-022, EV-023, EV-024, EV-025, EV-026, EV-027, EV-028 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-01054 | 341 | confirmed_gap | selected_course_content_or_outcome_gap | EV-002, EV-003, EV-004, EV-005, EV-006, EV-007, EV-008, EV-009, EV-010, EV-011, EV-012, EV-013, EV-014, EV-015, EV-016, EV-017, EV-018, EV-019, EV-020, EV-021, EV-022, EV-023, EV-024, EV-025, EV-026, EV-027, EV-028 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-01055 | 342 | confirmed_gap | scope_evidence_missing | EV-029 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01056 | 342 | confirmed_gap | offering_context_unverified | EV-029 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01057 | 342 | confirmed_gap | selected_course_citation_incomplete | EV-002, EV-003, EV-004, EV-005, EV-006, EV-007, EV-008, EV-009, EV-010, EV-011, EV-012, EV-013, EV-014, EV-015, EV-016, EV-017, EV-018, EV-019, EV-020, EV-021, EV-022, EV-023, EV-024, EV-025, EV-026, EV-027, EV-028 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-01058 | 342 | confirmed_gap | selected_course_content_or_outcome_gap | EV-002, EV-003, EV-004, EV-005, EV-006, EV-007, EV-008, EV-009, EV-010, EV-011, EV-012, EV-013, EV-014, EV-015, EV-016, EV-017, EV-018, EV-019, EV-020, EV-021, EV-022, EV-023, EV-024, EV-025, EV-026, EV-027, EV-028 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-01059 | 343 | confirmed_gap | scope_evidence_missing | EV-030 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01060 | 343 | confirmed_gap | offering_context_unverified | EV-030 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01061 | 344 | confirmed_gap | scope_evidence_missing | EV-031, EV-032 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01062 | 344 | confirmed_gap | offering_context_unverified | EV-031, EV-032 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01063 | 345 | confirmed_gap | scope_evidence_missing | EV-033 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01064 | 345 | confirmed_gap | offering_context_unverified | EV-033 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01065 | 345 | confirmed_gap | selected_course_citation_incomplete | EV-034, EV-035, EV-036, EV-037, EV-038, EV-039, EV-040, EV-041, EV-042, EV-043, EV-044, EV-045, EV-046, EV-047, EV-048, EV-049, EV-050, EV-051, EV-052, EV-053, EV-054, EV-055, EV-056, EV-057 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-01066 | 345 | confirmed_gap | selected_course_content_or_outcome_gap | EV-034, EV-035, EV-036, EV-037, EV-038, EV-039, EV-040, EV-041, EV-042, EV-043, EV-044, EV-045, EV-046, EV-047, EV-048, EV-049, EV-050, EV-051, EV-052, EV-053, EV-054, EV-055, EV-056, EV-057 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-01067 | 346 | confirmed_gap | scope_evidence_missing | EV-058 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01068 | 346 | confirmed_gap | offering_context_unverified | EV-058 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01069 | 346 | confirmed_gap | selected_course_citation_incomplete | EV-059, EV-060, EV-061, EV-062, EV-063, EV-064, EV-065, EV-066, EV-067, EV-068, EV-069, EV-070, EV-071, EV-072, EV-073, EV-074, EV-075, EV-076, EV-077, EV-078, EV-079, EV-080, EV-081, EV-082, EV-083, EV-084, EV-085, EV-086, EV-087, EV-088, EV-089 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-01070 | 346 | confirmed_gap | selected_course_content_or_outcome_gap | EV-059, EV-060, EV-061, EV-062, EV-063, EV-064, EV-065, EV-066, EV-067, EV-068, EV-069, EV-070, EV-071, EV-072, EV-073, EV-074, EV-075, EV-076, EV-077, EV-078, EV-079, EV-080, EV-081, EV-082, EV-083, EV-084, EV-085, EV-086, EV-087, EV-088, EV-089 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-01071 | 347 | confirmed_gap | scope_evidence_missing | EV-090 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01072 | 347 | confirmed_gap | offering_context_unverified | EV-090 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01073 | 347 | confirmed_gap | selected_course_citation_incomplete | EV-091, EV-092, EV-093, EV-094, EV-095, EV-096, EV-097, EV-098, EV-099, EV-100, EV-101, EV-102, EV-103, EV-104, EV-105, EV-106, EV-107, EV-108, EV-109 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-01074 | 348 | confirmed_gap | scope_evidence_missing | EV-110 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01075 | 348 | confirmed_gap | offering_context_unverified | EV-110 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01076 | 349 | confirmed_gap | scope_evidence_missing | EV-111 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01077 | 349 | confirmed_gap | offering_context_unverified | EV-111 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01078 | 349 | confirmed_gap | selected_course_citation_incomplete | EV-112, EV-113, EV-114, EV-115, EV-116, EV-117, EV-118, EV-119, EV-120, EV-121, EV-122, EV-123, EV-124, EV-125, EV-126, EV-127, EV-128, EV-129, EV-130 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-01079 | 349 | confirmed_gap | selected_course_content_or_outcome_gap | EV-112, EV-113, EV-114, EV-115, EV-116, EV-117, EV-118, EV-119, EV-120, EV-121, EV-122, EV-123, EV-124, EV-125, EV-126, EV-127, EV-128, EV-129, EV-130 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-01080 | 350 | confirmed_gap | scope_evidence_missing | EV-131, EV-132 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01081 | 350 | confirmed_gap | offering_context_unverified | EV-131, EV-132 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01082 | 350 | confirmed_gap | selected_course_citation_incomplete | EV-133, EV-134, EV-135, EV-136, EV-137, EV-138, EV-139, EV-140, EV-141, EV-142, EV-143, EV-144, EV-145, EV-146, EV-147, EV-148, EV-149, EV-150, EV-151, EV-152, EV-153 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-01083 | 350 | confirmed_gap | selected_course_content_or_outcome_gap | EV-133, EV-134, EV-135, EV-136, EV-137, EV-138, EV-139, EV-140, EV-141, EV-142, EV-143, EV-144, EV-145, EV-146, EV-147, EV-148, EV-149, EV-150, EV-151, EV-152, EV-153 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-01084 | 351 | confirmed_gap | scope_evidence_missing | EV-154 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01085 | 351 | confirmed_gap | offering_context_unverified | EV-154 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01086 | 352 | confirmed_gap | scope_evidence_missing | EV-155 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01087 | 352 | confirmed_gap | offering_context_unverified | EV-155 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01088 | 353 | confirmed_gap | scope_evidence_missing | EV-156 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01089 | 353 | confirmed_gap | offering_context_unverified | EV-156 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01090 | 354 | confirmed_gap | scope_evidence_missing | EV-157 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01091 | 354 | confirmed_gap | offering_context_unverified | EV-157 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01092 | 355 | confirmed_gap | scope_evidence_missing | EV-158 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01093 | 355 | confirmed_gap | offering_context_unverified | EV-158 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01094 | 356 | confirmed_gap | scope_evidence_missing | EV-159 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01095 | 356 | confirmed_gap | offering_context_unverified | EV-159 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01096 | 357 | confirmed_gap | scope_evidence_missing | EV-160 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01097 | 357 | confirmed_gap | offering_context_unverified | EV-160 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01098 | 358 | confirmed_gap | scope_evidence_missing | EV-161 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01099 | 358 | confirmed_gap | offering_context_unverified | EV-161 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01100 | 359 | confirmed_gap | scope_evidence_missing | EV-162 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01101 | 359 | confirmed_gap | offering_context_unverified | EV-162 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-01102 | 360 | confirmed_gap | scope_evidence_missing | EV-163 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-01103 | 360 | confirmed_gap | offering_context_unverified | EV-163 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |

## Exact evidence URLs, locators, and access dates

### Structured evidence references attached to issue records

| Ref | URL | Exact locator | Accessed |
|---|---|---|---|
| EV-001 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 68 → INFORMATION SCIENCE AND MEDIA STUDIES | 2026-09-26 |
| EV-002 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → INFORMATION AND MEDIA STUDIES — P12, P13, P14 → course code CMS 111 | 2026-09-26 |
| EV-003 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → INFORMATION AND MEDIA STUDIES — P12, P13, P14 → course code CMS 112 | 2026-09-26 |
| EV-004 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → INFORMATION AND MEDIA STUDIES — P12, P13, P14 → course code ISM 111 | 2026-09-26 |
| EV-005 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → INFORMATION AND MEDIA STUDIES — P12, P13, P14 → course code ISM 112 | 2026-09-26 |
| EV-006 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → INFORMATION AND MEDIA STUDIES — P12, P13, P14 → course code CMS 201 | 2026-09-26 |
| EV-007 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → INFORMATION AND MEDIA STUDIES — P12, P13, P14 → course code ISM 201 | 2026-09-26 |
| EV-008 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → INFORMATION AND MEDIA STUDIES — P12, P13, P14 → course code ISM 202 | 2026-09-26 |
| EV-009 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → INFORMATION AND MEDIA STUDIES — P12, P13, P14 → course code ISM 203 | 2026-09-26 |
| EV-010 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → INFORMATION AND MEDIA STUDIES — P12, P13, P14 → course code ISM 204 | 2026-09-26 |
| EV-011 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → INFORMATION AND MEDIA STUDIES — P12, P13, P14 → course code ISM 205 | 2026-09-26 |
| EV-012 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → INFORMATION AND MEDIA STUDIES — P12, P13, P14 → course code ISM 206 | 2026-09-26 |
| EV-013 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → INFORMATION AND MEDIA STUDIES — P12, P13, P14 → course code CMS 311 | 2026-09-26 |
| EV-014 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → INFORMATION AND MEDIA STUDIES — P12, P13, P14 → course code CMS 312 | 2026-09-26 |
| EV-015 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → INFORMATION AND MEDIA STUDIES — P12, P13, P14 → course code CMS 313 | 2026-09-26 |
| EV-016 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → INFORMATION AND MEDIA STUDIES — P12, P13, P14 → course code ISM 312 | 2026-09-26 |
| EV-017 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → INFORMATION AND MEDIA STUDIES — P12, P13, P14 → course code ISM 313 | 2026-09-26 |
| EV-018 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → INFORMATION AND MEDIA STUDIES — P12, P13, P14 → course code ISM 314 | 2026-09-26 |
| EV-019 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → INFORMATION AND MEDIA STUDIES — P12, P13, P14 → course code ISM 315 | 2026-09-26 |
| EV-020 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → INFORMATION AND MEDIA STUDIES — P12, P13, P14 → course code ISM 316 | 2026-09-26 |
| EV-021 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → INFORMATION AND MEDIA STUDIES — P12, P13, P14 → course code CMS 411 | 2026-09-26 |
| EV-022 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → INFORMATION AND MEDIA STUDIES — P12, P13, P14 → course code CMS 412 | 2026-09-26 |
| EV-023 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → INFORMATION AND MEDIA STUDIES — P12, P13, P14 → course code ISM 411 | 2026-09-26 |
| EV-024 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → INFORMATION AND MEDIA STUDIES — P12, P13, P14 → course code ISM 412 | 2026-09-26 |
| EV-025 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → INFORMATION AND MEDIA STUDIES — P12, P13, P14 → course code ISM 413 | 2026-09-26 |
| EV-026 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → INFORMATION AND MEDIA STUDIES — P12, P13, P14 → course code ISM 414 | 2026-09-26 |
| EV-027 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → INFORMATION AND MEDIA STUDIES — P12, P13, P14 → course code ISM 415 | 2026-09-26 |
| EV-028 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → INFORMATION AND MEDIA STUDIES — P12, P13, P14 → course code ISM 421 | 2026-09-26 |
| EV-029 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf | Administration.pdf → parsed row ordinal 60 → Information and Media Studies | 2026-09-26 |
| EV-030 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf | Administration.pdf → parsed row ordinal 55 → Islamic Studies | 2026-09-26 |
| EV-031 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-medical.pdf | medical.txt → parsed row ordinal 14 → Optometry | 2026-09-26 |
| EV-032 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 181 → Optometry | 2026-09-26 |
| EV-033 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf | Administration.pdf → parsed row ordinal 28 → Public Relations and Advertising | 2026-09-26 |
| EV-034 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → PUBLIC RELATIONS — P12, P13, P14 → course code PRS 111 | 2026-09-26 |
| EV-035 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → PUBLIC RELATIONS — P12, P13, P14 → course code PRS 112 | 2026-09-26 |
| EV-036 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → PUBLIC RELATIONS — P12, P13, P14 → course code PRS 201 | 2026-09-26 |
| EV-037 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → PUBLIC RELATIONS — P12, P13, P14 → course code PRS 202 | 2026-09-26 |
| EV-038 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → PUBLIC RELATIONS — P12, P13, P14 → course code PRS 203 | 2026-09-26 |
| EV-039 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → PUBLIC RELATIONS — P12, P13, P14 → course code PRS 204 | 2026-09-26 |
| EV-040 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → PUBLIC RELATIONS — P12, P13, P14 → course code PRS 205 | 2026-09-26 |
| EV-041 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → PUBLIC RELATIONS — P12, P13, P14 → course code PRS 206 | 2026-09-26 |
| EV-042 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → PUBLIC RELATIONS — P12, P13, P14 → course code PRS 207 | 2026-09-26 |
| EV-043 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → PUBLIC RELATIONS — P12, P13, P14 → course code PRS 209 | 2026-09-26 |
| EV-044 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → PUBLIC RELATIONS — P12, P13, P14 → course code CMS 301 | 2026-09-26 |
| EV-045 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → PUBLIC RELATIONS — P12, P13, P14 → course code PRS 301 | 2026-09-26 |
| EV-046 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → PUBLIC RELATIONS — P12, P13, P14 → course code PRS 305 | 2026-09-26 |
| EV-047 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → PUBLIC RELATIONS — P12, P13, P14 → course code PRS 308 | 2026-09-26 |
| EV-048 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → PUBLIC RELATIONS — P12, P13, P14 → course code PRS 309 | 2026-09-26 |
| EV-049 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → PUBLIC RELATIONS — P12, P13, P14 → course code PRS 310 | 2026-09-26 |
| EV-050 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → PUBLIC RELATIONS — P12, P13, P14 → course code PRS 311 | 2026-09-26 |
| EV-051 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → PUBLIC RELATIONS — P12, P13, P14 → course code CMS 402 | 2026-09-26 |
| EV-052 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → PUBLIC RELATIONS — P12, P13, P14 → course code PRS 401 | 2026-09-26 |
| EV-053 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → PUBLIC RELATIONS — P12, P13, P14 → course code PRS 402 | 2026-09-26 |
| EV-054 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → PUBLIC RELATIONS — P12, P13, P14 → course code PRS 404 | 2026-09-26 |
| EV-055 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → PUBLIC RELATIONS — P12, P13, P14 → course code PRS 405 | 2026-09-26 |
| EV-056 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → PUBLIC RELATIONS — P12, P13, P14 → course code PRS 409 | 2026-09-26 |
| EV-057 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → PUBLIC RELATIONS — P12, P13, P14 → course code PRS 410 | 2026-09-26 |
| EV-058 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf | Administration.pdf → parsed row ordinal 40 → Strategic Communication | 2026-09-26 |
| EV-059 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → STRATEGIC COMMUNICATION — P12, P13, P14 → course code GST 111 | 2026-09-26 |
| EV-060 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → STRATEGIC COMMUNICATION — P12, P13, P14 → course code CMS 101 | 2026-09-26 |
| EV-061 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → STRATEGIC COMMUNICATION — P12, P13, P14 → course code CMS 102 | 2026-09-26 |
| EV-062 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → STRATEGIC COMMUNICATION — P12, P13, P14 → course code STC 101 | 2026-09-26 |
| EV-063 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → STRATEGIC COMMUNICATION — P12, P13, P14 → course code CMS 201 | 2026-09-26 |
| EV-064 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → STRATEGIC COMMUNICATION — P12, P13, P14 → course code STC 202 | 2026-09-26 |
| EV-065 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → STRATEGIC COMMUNICATION — P12, P13, P14 → course code STC 203 | 2026-09-26 |
| EV-066 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → STRATEGIC COMMUNICATION — P12, P13, P14 → course code STC 204 | 2026-09-26 |
| EV-067 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → STRATEGIC COMMUNICATION — P12, P13, P14 → course code STC 205 | 2026-09-26 |
| EV-068 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → STRATEGIC COMMUNICATION — P12, P13, P14 → course code PRS 200 | 2026-09-26 |
| EV-069 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → STRATEGIC COMMUNICATION — P12, P13, P14 → course code PRS 201 | 2026-09-26 |
| EV-070 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → STRATEGIC COMMUNICATION — P12, P13, P14 → course code GST 312 | 2026-09-26 |
| EV-071 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → STRATEGIC COMMUNICATION — P12, P13, P14 → course code CMS 301 | 2026-09-26 |
| EV-072 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → STRATEGIC COMMUNICATION — P12, P13, P14 → course code CMS 302 | 2026-09-26 |
| EV-073 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → STRATEGIC COMMUNICATION — P12, P13, P14 → course code CMS 303 | 2026-09-26 |
| EV-074 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → STRATEGIC COMMUNICATION — P12, P13, P14 → course code STC 301 | 2026-09-26 |
| EV-075 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → STRATEGIC COMMUNICATION — P12, P13, P14 → course code STC 303 | 2026-09-26 |
| EV-076 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → STRATEGIC COMMUNICATION — P12, P13, P14 → course code STC 306 | 2026-09-26 |
| EV-077 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → STRATEGIC COMMUNICATION — P12, P13, P14 → course code STC 307 | 2026-09-26 |
| EV-078 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → STRATEGIC COMMUNICATION — P12, P13, P14 → course code STC 308 | 2026-09-26 |
| EV-079 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → STRATEGIC COMMUNICATION — P12, P13, P14 → course code STC 310 | 2026-09-26 |
| EV-080 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → STRATEGIC COMMUNICATION — P12, P13, P14 → course code PRS 303 | 2026-09-26 |
| EV-081 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → STRATEGIC COMMUNICATION — P12, P13, P14 → course code PRS 311 | 2026-09-26 |
| EV-082 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → STRATEGIC COMMUNICATION — P12, P13, P14 → course code CMS 401 | 2026-09-26 |
| EV-083 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → STRATEGIC COMMUNICATION — P12, P13, P14 → course code CMS 402 | 2026-09-26 |
| EV-084 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → STRATEGIC COMMUNICATION — P12, P13, P14 → course code STC 402 | 2026-09-26 |
| EV-085 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → STRATEGIC COMMUNICATION — P12, P13, P14 → course code STC 403 | 2026-09-26 |
| EV-086 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → STRATEGIC COMMUNICATION — P12, P13, P14 → course code STC 409 | 2026-09-26 |
| EV-087 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → STRATEGIC COMMUNICATION — P12, P13, P14 → course code STC 410 | 2026-09-26 |
| EV-088 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → STRATEGIC COMMUNICATION — P12, P13, P14 → course code CMS 406 | 2026-09-26 |
| EV-089 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → STRATEGIC COMMUNICATION — P12, P13, P14 → course code STC 499 | 2026-09-26 |
| EV-090 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf | Administration.pdf → parsed row ordinal 44 → Supply Chain Management | 2026-09-26 |
| EV-091 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Logistics and Supply Chain Management → course code LSM 101 | 2026-09-26 |
| EV-092 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Logistics and Supply Chain Management → course code LSM 102 | 2026-09-26 |
| EV-093 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Logistics and Supply Chain Management → course code LSM 103 | 2026-09-26 |
| EV-094 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Logistics and Supply Chain Management → course code LCM 201 | 2026-09-26 |
| EV-095 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Logistics and Supply Chain Management → course code LSM 202 | 2026-09-26 |
| EV-096 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Logistics and Supply Chain Management → course code LSM 203 | 2026-09-26 |
| EV-097 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Logistics and Supply Chain Management → course code LSM 204 | 2026-09-26 |
| EV-098 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Logistics and Supply Chain Management → course code LSM 206 | 2026-09-26 |
| EV-099 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Logistics and Supply Chain Management → course code LSM 207 | 2026-09-26 |
| EV-100 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Logistics and Supply Chain Management → course code ENT 312 | 2026-09-26 |
| EV-101 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Logistics and Supply Chain Management → course code LCM 301 | 2026-09-26 |
| EV-102 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Logistics and Supply Chain Management → course code LSM 302 | 2026-09-26 |
| EV-103 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Logistics and Supply Chain Management → course code LSM 303 | 2026-09-26 |
| EV-104 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Logistics and Supply Chain Management → course code LSM 306 | 2026-09-26 |
| EV-105 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Logistics and Supply Chain Management → course code LSM 309 | 2026-09-26 |
| EV-106 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Logistics and Supply Chain Management → course code LCM 401 | 2026-09-26 |
| EV-107 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Logistics and Supply Chain Management → course code LSM 402 | 2026-09-26 |
| EV-108 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Logistics and Supply Chain Management → course code LCM 403 | 2026-09-26 |
| EV-109 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Logistics and Supply Chain Management → course code LSM 404 | 2026-09-26 |
| EV-110 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 80 → Surveying and Geoinformatics | 2026-09-26 |
| EV-111 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 160 → Textile Science and Technology | 2026-09-26 |
| EV-112 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Clothing and Textile Design → course code CLT 101 | 2026-09-26 |
| EV-113 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Clothing and Textile Design → course code CLT 104 | 2026-09-26 |
| EV-114 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Clothing and Textile Design → course code CLT 105 | 2026-09-26 |
| EV-115 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Clothing and Textile Design → course code CLT 201 | 2026-09-26 |
| EV-116 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Clothing and Textile Design → course code CLT 202 | 2026-09-26 |
| EV-117 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Clothing and Textile Design → course code CLT 203 | 2026-09-26 |
| EV-118 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Clothing and Textile Design → course code CLT 204 | 2026-09-26 |
| EV-119 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Clothing and Textile Design → course code CLT 205 | 2026-09-26 |
| EV-120 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Clothing and Textile Design → course code CLT 206 | 2026-09-26 |
| EV-121 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Clothing and Textile Design → course code CLT 301 | 2026-09-26 |
| EV-122 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Clothing and Textile Design → course code CLT 303 | 2026-09-26 |
| EV-123 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Clothing and Textile Design → course code CLT 305 | 2026-09-26 |
| EV-124 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Clothing and Textile Design → course code CLT 401 | 2026-09-26 |
| EV-125 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Clothing and Textile Design → course code CLT 402 | 2026-09-26 |
| EV-126 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Clothing and Textile Design → course code CLT 403 | 2026-09-26 |
| EV-127 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Clothing and Textile Design → course code CLT 404 | 2026-09-26 |
| EV-128 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Clothing and Textile Design → course code CLT 405 | 2026-09-26 |
| EV-129 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Clothing and Textile Design → course code CLT 407 | 2026-09-26 |
| EV-130 | https://www.nuc.edu.ng/ccmas/ | environmental_sciences.json → Clothing and Textile Design → course code CLT 499 | 2026-09-26 |
| EV-131 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf | Administration.pdf → parsed row ordinal 49 → Film and Video Studies | 2026-09-26 |
| EV-132 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf | Social Sciences brochure, extracted text lines 3289-3291; printed page/cell locator requires visual PDF reconciliation. | 2026-09-26 |
| EV-133 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → FILM & MULTIMEDIA — P12, P13, P14 → course code FMM 101 | 2026-09-26 |
| EV-134 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → FILM & MULTIMEDIA — P12, P13, P14 → course code FMM 102 | 2026-09-26 |
| EV-135 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → FILM & MULTIMEDIA — P12, P13, P14 → course code FMM 201 | 2026-09-26 |
| EV-136 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → FILM & MULTIMEDIA — P12, P13, P14 → course code FMM 206 | 2026-09-26 |
| EV-137 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → FILM & MULTIMEDIA — P12, P13, P14 → course code FMM 207 | 2026-09-26 |
| EV-138 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → FILM & MULTIMEDIA — P12, P13, P14 → course code FMM 301 | 2026-09-26 |
| EV-139 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → FILM & MULTIMEDIA — P12, P13, P14 → course code FMM 303 | 2026-09-26 |
| EV-140 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → FILM & MULTIMEDIA — P12, P13, P14 → course code FMM 304 | 2026-09-26 |
| EV-141 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → FILM & MULTIMEDIA — P12, P13, P14 → course code FMM 305 | 2026-09-26 |
| EV-142 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → FILM & MULTIMEDIA — P12, P13, P14 → course code FMM 306 | 2026-09-26 |
| EV-143 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → FILM & MULTIMEDIA — P12, P13, P14 → course code FMM 307 | 2026-09-26 |
| EV-144 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → FILM & MULTIMEDIA — P12, P13, P14 → course code FMM 308 | 2026-09-26 |
| EV-145 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → FILM & MULTIMEDIA — P12, P13, P14 → course code FMM 401 | 2026-09-26 |
| EV-146 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → FILM & MULTIMEDIA — P12, P13, P14 → course code FMM 402 | 2026-09-26 |
| EV-147 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → FILM & MULTIMEDIA — P12, P13, P14 → course code FMM 403 | 2026-09-26 |
| EV-148 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → FILM & MULTIMEDIA — P12, P13, P14 → course code FMM 404 | 2026-09-26 |
| EV-149 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → FILM & MULTIMEDIA — P12, P13, P14 → course code FMM 405 | 2026-09-26 |
| EV-150 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → FILM & MULTIMEDIA — P12, P13, P14 → course code FMM 406 | 2026-09-26 |
| EV-151 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → FILM & MULTIMEDIA — P12, P13, P14 → course code FMM 407 | 2026-09-26 |
| EV-152 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → FILM & MULTIMEDIA — P12, P13, P14 → course code FMM 408 | 2026-09-26 |
| EV-153 | https://www.nuc.edu.ng/ccmas/ | communication_media.json → FILM & MULTIMEDIA — P12, P13, P14 → course code FMM 410 | 2026-09-26 |
| EV-154 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 113 → OCEANOGRAPHY | 2026-09-26 |
| EV-155 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 171 → Earth Science | 2026-09-26 |
| EV-156 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 170 → Geoscience | 2026-09-26 |
| EV-157 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 157 → Ecology | 2026-09-26 |
| EV-158 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 158 → Applied Ecology | 2026-09-26 |
| EV-159 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 159 → Ecology and Environmental Studies | 2026-09-26 |
| EV-160 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 180 → Parasitology and Entomology | 2026-09-26 |
| EV-161 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 110 → BIOINFORMATICS | 2026-09-26 |
| EV-162 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 108 → OPERATIONS RESEARCH | 2026-09-26 |
| EV-163 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 20 → BIOLOGICAL SCIENCE(S) | 2026-09-26 |

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
- `data/career-mapping/_audit/jamb_ccmas_final_verification_rows_281_420_2026-09-26_007.md`
- `data/career-mapping/_audit/jamb_ccmas_final_verification_rows_281_420_2026-09-26_008.md`
- `data/career-mapping/_audit/jamb_ccmas_source_issue_queue_2026-09-26_001.json`
- `data/career-mapping/_audit/jamb_ccmas_source_issue_queue_2026-09-26_001.md`
- `data/career-mapping/_audit/jamb_curriculum_scopes_2026-08-17.json`
- `data/career-mapping/_audit/jamb_anomaly_inventory_2026-09-26.json`
- `data/career-mapping/_audit/jamb_offering_context_inventory_2026-09-25.json`
- `data/career-mapping/_audit/ccmas_extraction_anomaly_inventory_2026-09-26.json`


Closed work intentionally not reopened: French Arts anchor correction; Film and Video Studies Social/Management occurrence addition; recorded CCMAS page-header repairs; CAM424 equipment-spill repair; DTS498/CSC432 cross-reference repair; and replacement-character normalization classified as encoding-only.

## Disposition and resume boundary

This increment reconciles the current **341–360** queue against the prior row-level evidence. It does **not** close any identity: scope evidence, exact offering context, selected-course fidelity, item-level citations, and external/custom provenance remain open where listed. It performs no downstream domain/subgroup/role audit.

The next bounded increment is **identities 361–380**, maximum **20 identities/packages**, and must save its own append-only JSON/Markdown checkpoint before proceeding.

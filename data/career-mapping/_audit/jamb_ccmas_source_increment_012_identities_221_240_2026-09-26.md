# JAMB–CCMAS source increment 012 — identities 221–240

**Audit date:** 2026-09-26 (Africa/Lagos)  
**Mode:** bounded reconciliation after checkpoint 003; append-only  
**Assigned lane:** JAMB identity/offering and CCMAS/external source integrity only  
**Write boundary:** no shared source, mapping, scope, seed, SQL, UI, downstream taxonomy, domain, subgroup, or role file was edited.

## Exact coverage inspected

- Canonical JAMB identities: **20/20**, rows **221–240**.
- Current queue records: **20 identity rows**, **66 current issue records**.
- Current selected-course occurrences represented by those rows: **306**.
- Parsed offering occurrences represented by those rows: **20**.
- CCMAS/external components inspected through the current records: **Administration and Management::Aviation Management, Computing::Computer Science, Computing::Information and Communication Technology, Computing::Software Engineering, Sciences::Biology, Sciences::Biotechnology, Sciences::Chemistry, Sciences::Marine Science, Sciences::Microbiology, Sciences::Zoology**.
- Prior row-level evidence was read first from the existing final-gap checkpoint(s) for rows **221–240**; already-verified facts were not re-researched.

## Records inspected

| Row | JAMB identity | Component reference(s) | Current scope state | Selected courses | Offering records | Current issue IDs |
|---:|---|---|---|---:|---:|---|
| 221 | Biotechnology and Food Technology | Sciences::Biotechnology | partial_scope_reviewed | 16 | 1 | SRC-00662, SRC-00663, SRC-00664 |
| 222 | Zoology and Aquaculture | Sciences::Zoology | partial_scope_reviewed | 6 | 1 | SRC-00665, SRC-00666, SRC-00667 |
| 223 | Animal Biology and Environment | Sciences::Zoology | partial_scope_reviewed | 23 | 1 | SRC-00668, SRC-00669, SRC-00670 |
| 224 | Conservation Biology | Sciences::Biology | partial_scope_reviewed | 19 | 1 | SRC-00671, SRC-00672, SRC-00673 |
| 225 | Conservation and Environmental Biology | Sciences::Biology | partial_scope_reviewed | 22 | 1 | SRC-00674, SRC-00675, SRC-00676 |
| 226 | Environmental Biology | Sciences::Biology | partial_scope_reviewed | 21 | 1 | SRC-00677, SRC-00678, SRC-00679 |
| 227 | Environmental Biology and Fisheries | Sciences::Biology | partial_scope_reviewed | 22 | 1 | SRC-00680, SRC-00681, SRC-00682 |
| 228 | Marine Science and Technology | Sciences::Marine Science | partial_scope_reviewed | 13 | 1 | SRC-00683, SRC-00684, SRC-00685 |
| 229 | Aviation Business | Administration and Management::Aviation Management | partial_scope_reviewed | 14 | 1 | SRC-00686, SRC-00687, SRC-00688 |
| 230 | Microbiology and Biotechnology | Sciences::Biotechnology | partial_scope_reviewed | 17 | 1 | SRC-00689, SRC-00690, SRC-00691 |
| 231 | Microbiology/Parasitology | Sciences::Microbiology | partial_scope_reviewed | 11 | 1 | SRC-00692, SRC-00693, SRC-00694 |
| 232 | Biology/Biotechnology | Sciences::Biotechnology | partial_scope_reviewed | 22 | 1 | SRC-00695, SRC-00696, SRC-00697 |
| 233 | Microbiology and Industrial Biotechnology | Sciences::Biotechnology | partial_scope_reviewed | 20 | 1 | SRC-00698, SRC-00699, SRC-00700 |
| 234 | Industrial Microbiology | Sciences::Microbiology | partial_scope_reviewed | 16 | 1 | SRC-00701, SRC-00702, SRC-00703 |
| 235 | Environmental Chemistry and Toxicology | Sciences::Chemistry | partial_scope_reviewed | 23 | 1 | SRC-00704, SRC-00705, SRC-00706 |
| 236 | Computer, Information and Communication Science | Computing::Information and Communication Technology | partial_scope_reviewed | 14 | 1 | SRC-00707, SRC-00708, SRC-00709, SRC-00710 |
| 237 | Computer Science and Informatics | Computing::Computer Science | partial_scope_reviewed | 8 | 1 | SRC-00711, SRC-00712, SRC-00713, SRC-00714 |
| 238 | Computing and Artificial Intelligence | Computing::Computer Science | partial_scope_reviewed | 2 | 1 | SRC-00715, SRC-00716, SRC-00717, SRC-00718 |
| 239 | Computer with Electronics | Computing::Computer Science | partial_scope_reviewed | 8 | 1 | SRC-00719, SRC-00720, SRC-00721, SRC-00722 |
| 240 | Software Engineering and Digital Entrepreneurship | Computing::Software Engineering | partial_scope_reviewed | 9 | 1 | SRC-00723, SRC-00724, SRC-00725, SRC-00726 |

## Current issue counts

- Confirmed gaps still open: **65**.
- Candidate issues still open: **0**.
- New issue classes discovered in this reconciliation: **0**.
- Closed findings reopened: **0**.
- Distinct exact evidence references captured: **187**.

By issue type/status:

- `offering_context_unverified` / `confirmed_gap`: 20
- `scope_evidence_missing` / `confirmed_gap`: 20
- `selected_course_citation_incomplete` / `confirmed_gap`: 20
- `selected_course_content_or_outcome_gap` / `confirmed_gap`: 5

## Confirmed and candidate issue ledger

The following are current open records carried from the source issue queue. They are not claims that every record below is an academic-content defect; provenance, offering-context, and citation gaps remain distinct from content defects.

| Issue | Row | Status | Type | Evidence refs | Recommendation |
|---|---:|---|---|---|---|
| SRC-00662 | 221 | confirmed_gap | scope_evidence_missing | EV-001 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00663 | 221 | confirmed_gap | offering_context_unverified | EV-001 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00664 | 221 | confirmed_gap | selected_course_citation_incomplete | EV-002, EV-003, EV-004, EV-005, EV-006, EV-007, EV-008, EV-009, EV-010, EV-011, EV-012, EV-013, EV-014, EV-015, EV-016, EV-017 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00665 | 222 | confirmed_gap | scope_evidence_missing | EV-018 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00666 | 222 | confirmed_gap | offering_context_unverified | EV-018 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00667 | 222 | confirmed_gap | selected_course_citation_incomplete | EV-019, EV-020, EV-021, EV-022, EV-023, EV-024 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00668 | 223 | confirmed_gap | scope_evidence_missing | EV-025 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00669 | 223 | confirmed_gap | offering_context_unverified | EV-025 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00670 | 223 | confirmed_gap | selected_course_citation_incomplete | EV-019, EV-020, EV-021, EV-022, EV-023, EV-024, EV-026, EV-027, EV-028, EV-029, EV-030, EV-031, EV-032, EV-033, EV-034, EV-035, EV-036, EV-037, EV-038, EV-039, EV-040, EV-041, EV-042 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00671 | 224 | confirmed_gap | scope_evidence_missing | EV-043 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00672 | 224 | confirmed_gap | offering_context_unverified | EV-043 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00673 | 224 | confirmed_gap | selected_course_citation_incomplete | EV-044, EV-045, EV-046, EV-047, EV-048, EV-049, EV-050, EV-051, EV-052, EV-053, EV-054, EV-055, EV-056, EV-057, EV-058, EV-059, EV-060, EV-061, EV-062 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00674 | 225 | confirmed_gap | scope_evidence_missing | EV-063 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00675 | 225 | confirmed_gap | offering_context_unverified | EV-063 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00676 | 225 | confirmed_gap | selected_course_citation_incomplete | EV-044, EV-045, EV-046, EV-047, EV-048, EV-049, EV-050, EV-051, EV-052, EV-053, EV-054, EV-055, EV-056, EV-057, EV-058, EV-059, EV-060, EV-061, EV-062, EV-064, EV-065, EV-066 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00677 | 226 | confirmed_gap | scope_evidence_missing | EV-067 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00678 | 226 | confirmed_gap | offering_context_unverified | EV-067 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00679 | 226 | confirmed_gap | selected_course_citation_incomplete | EV-044, EV-045, EV-046, EV-048, EV-049, EV-050, EV-051, EV-052, EV-053, EV-054, EV-055, EV-056, EV-057, EV-058, EV-059, EV-060, EV-061, EV-062, EV-064, EV-065, EV-066 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00680 | 227 | confirmed_gap | scope_evidence_missing | EV-068 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00681 | 227 | confirmed_gap | offering_context_unverified | EV-068 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00682 | 227 | confirmed_gap | selected_course_citation_incomplete | EV-044, EV-045, EV-046, EV-048, EV-049, EV-050, EV-051, EV-052, EV-053, EV-054, EV-055, EV-056, EV-057, EV-058, EV-059, EV-060, EV-061, EV-062, EV-064, EV-065, EV-066, EV-069 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00683 | 228 | confirmed_gap | scope_evidence_missing | EV-070 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00684 | 228 | confirmed_gap | offering_context_unverified | EV-070 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00685 | 228 | confirmed_gap | selected_course_citation_incomplete | EV-071, EV-072, EV-073, EV-074, EV-075, EV-076, EV-077, EV-078, EV-079, EV-080, EV-081, EV-082, EV-083 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00686 | 229 | confirmed_gap | scope_evidence_missing | EV-084 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00687 | 229 | confirmed_gap | offering_context_unverified | EV-084 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00688 | 229 | confirmed_gap | selected_course_citation_incomplete | EV-085, EV-086, EV-087, EV-088, EV-089, EV-090, EV-091, EV-092, EV-093, EV-094, EV-095, EV-096, EV-097, EV-098 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00689 | 230 | confirmed_gap | scope_evidence_missing | EV-099 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00690 | 230 | confirmed_gap | offering_context_unverified | EV-099 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00691 | 230 | confirmed_gap | selected_course_citation_incomplete | EV-003, EV-004, EV-005, EV-006, EV-007, EV-008, EV-009, EV-010, EV-011, EV-012, EV-013, EV-014, EV-015, EV-016, EV-017, EV-100, EV-101 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00692 | 231 | confirmed_gap | scope_evidence_missing | EV-102 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00693 | 231 | confirmed_gap | offering_context_unverified | EV-102 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00694 | 231 | confirmed_gap | selected_course_citation_incomplete | EV-103, EV-104, EV-105, EV-106, EV-107, EV-108, EV-109, EV-110, EV-111, EV-112, EV-113 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00695 | 232 | confirmed_gap | scope_evidence_missing | EV-114 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00696 | 232 | confirmed_gap | offering_context_unverified | EV-114 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00697 | 232 | confirmed_gap | selected_course_citation_incomplete | EV-002, EV-003, EV-004, EV-005, EV-006, EV-007, EV-008, EV-009, EV-010, EV-011, EV-012, EV-013, EV-014, EV-015, EV-016, EV-017, EV-100, EV-115, EV-116, EV-117, EV-118, EV-119 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00698 | 233 | confirmed_gap | scope_evidence_missing | EV-120 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00699 | 233 | confirmed_gap | offering_context_unverified | EV-120 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00700 | 233 | confirmed_gap | selected_course_citation_incomplete | EV-002, EV-003, EV-004, EV-005, EV-006, EV-007, EV-008, EV-009, EV-010, EV-011, EV-012, EV-013, EV-014, EV-015, EV-016, EV-017, EV-100, EV-101, EV-115, EV-121 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00701 | 234 | confirmed_gap | scope_evidence_missing | EV-122 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00702 | 234 | confirmed_gap | offering_context_unverified | EV-122 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00703 | 234 | confirmed_gap | selected_course_citation_incomplete | EV-103, EV-104, EV-105, EV-106, EV-107, EV-108, EV-109, EV-110, EV-111, EV-112, EV-113, EV-123, EV-124, EV-125, EV-126, EV-127 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00704 | 235 | confirmed_gap | scope_evidence_missing | EV-128 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00705 | 235 | confirmed_gap | offering_context_unverified | EV-128 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00706 | 235 | confirmed_gap | selected_course_citation_incomplete | EV-129, EV-130, EV-131, EV-132, EV-133, EV-134, EV-135, EV-136, EV-137, EV-138, EV-139, EV-140, EV-141, EV-142, EV-143, EV-144, EV-145, EV-146, EV-147, EV-148, EV-149, EV-150, EV-151 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00707 | 236 | confirmed_gap | scope_evidence_missing | EV-152 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00708 | 236 | confirmed_gap | offering_context_unverified | EV-152 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00709 | 236 | confirmed_gap | selected_course_citation_incomplete | EV-153, EV-154, EV-155, EV-156, EV-157, EV-158, EV-159, EV-160, EV-161, EV-162, EV-163, EV-164, EV-165 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00710 | 236 | confirmed_gap | selected_course_content_or_outcome_gap | EV-153, EV-154, EV-155, EV-156, EV-157, EV-158, EV-159, EV-160, EV-161, EV-162, EV-163, EV-164, EV-165 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00711 | 237 | confirmed_gap | scope_evidence_missing | EV-166 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00712 | 237 | confirmed_gap | offering_context_unverified | EV-166 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00713 | 237 | confirmed_gap | selected_course_citation_incomplete | EV-167, EV-168, EV-169, EV-170, EV-171, EV-172, EV-173, EV-174 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00714 | 237 | confirmed_gap | selected_course_content_or_outcome_gap | EV-167, EV-168, EV-169, EV-170, EV-171, EV-172, EV-173, EV-174 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00715 | 238 | confirmed_gap | scope_evidence_missing | EV-175 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00716 | 238 | confirmed_gap | offering_context_unverified | EV-175 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00717 | 238 | confirmed_gap | selected_course_citation_incomplete | EV-167, EV-176 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00718 | 238 | confirmed_gap | selected_course_content_or_outcome_gap | EV-167, EV-176 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00719 | 239 | confirmed_gap | scope_evidence_missing | EV-177 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00720 | 239 | confirmed_gap | offering_context_unverified | EV-177 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00721 | 239 | confirmed_gap | selected_course_citation_incomplete | EV-167, EV-168, EV-169, EV-170, EV-171, EV-172, EV-173, EV-174 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00722 | 239 | confirmed_gap | selected_course_content_or_outcome_gap | EV-167, EV-168, EV-169, EV-170, EV-171, EV-172, EV-173, EV-174 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00723 | 240 | confirmed_gap | scope_evidence_missing | EV-178 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00724 | 240 | confirmed_gap | offering_context_unverified | EV-178 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00725 | 240 | confirmed_gap | selected_course_citation_incomplete | EV-179, EV-180, EV-181, EV-182, EV-183, EV-184, EV-185, EV-186, EV-187 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00726 | 240 | confirmed_gap | selected_course_content_or_outcome_gap | EV-179, EV-180, EV-181, EV-182, EV-183, EV-184, EV-185, EV-186, EV-187 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |

## Exact evidence URLs, locators, and access dates

### Structured evidence references attached to issue records

| Ref | URL | Exact locator | Accessed |
|---|---|---|---|
| EV-001 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 156 → Biotechnology and Food Technology | 2026-09-26 |
| EV-002 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BIO 102 | 2026-09-26 |
| EV-003 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code CHM 101 | 2026-09-26 |
| EV-004 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 202 | 2026-09-26 |
| EV-005 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 301 | 2026-09-26 |
| EV-006 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 302 | 2026-09-26 |
| EV-007 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 305 | 2026-09-26 |
| EV-008 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 309 | 2026-09-26 |
| EV-009 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 313 | 2026-09-26 |
| EV-010 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 315 | 2026-09-26 |
| EV-011 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 401 | 2026-09-26 |
| EV-012 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 403 | 2026-09-26 |
| EV-013 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 404 | 2026-09-26 |
| EV-014 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 405 | 2026-09-26 |
| EV-015 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 406 | 2026-09-26 |
| EV-016 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 407 | 2026-09-26 |
| EV-017 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 433 | 2026-09-26 |
| EV-018 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 161 → Zoology and Aquaculture | 2026-09-26 |
| EV-019 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Zoology → course code ZOO 211 | 2026-09-26 |
| EV-020 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Zoology → course code ZOO 212 | 2026-09-26 |
| EV-021 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Zoology → course code ZOO 301 | 2026-09-26 |
| EV-022 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Zoology → course code ZOO 419 | 2026-09-26 |
| EV-023 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Zoology → course code ZOO 422 | 2026-09-26 |
| EV-024 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Zoology → course code ZOO 499 | 2026-09-26 |
| EV-025 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 162 → Animal Biology and Environment | 2026-09-26 |
| EV-026 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Zoology → course code BIO 101 | 2026-09-26 |
| EV-027 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Zoology → course code BIO 102 | 2026-09-26 |
| EV-028 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Zoology → course code BIO 107 | 2026-09-26 |
| EV-029 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Zoology → course code BIO 108 | 2026-09-26 |
| EV-030 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Zoology → course code ZOO 101 | 2026-09-26 |
| EV-031 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Zoology → course code ZOO 102 | 2026-09-26 |
| EV-032 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Zoology → course code BIO 203 | 2026-09-26 |
| EV-033 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Zoology → course code STA 201 | 2026-09-26 |
| EV-034 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Zoology → course code ENT 312 | 2026-09-26 |
| EV-035 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Zoology → course code BIO 307 | 2026-09-26 |
| EV-036 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Zoology → course code ZOO 311 | 2026-09-26 |
| EV-037 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Zoology → course code ZOO 312 | 2026-09-26 |
| EV-038 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Zoology → course code ZOO 313 | 2026-09-26 |
| EV-039 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Zoology → course code ZOO 318 | 2026-09-26 |
| EV-040 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Zoology → course code BIO 407 | 2026-09-26 |
| EV-041 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Zoology → course code ZOO 411 | 2026-09-26 |
| EV-042 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Zoology → course code ZOO 412 | 2026-09-26 |
| EV-043 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 163 → Conservation Biology | 2026-09-26 |
| EV-044 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 102 | 2026-09-26 |
| EV-045 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 107 | 2026-09-26 |
| EV-046 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 108 | 2026-09-26 |
| EV-047 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code PHY 101 | 2026-09-26 |
| EV-048 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 203 | 2026-09-26 |
| EV-049 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 204 | 2026-09-26 |
| EV-050 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 205 | 2026-09-26 |
| EV-051 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 206 | 2026-09-26 |
| EV-052 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 208 | 2026-09-26 |
| EV-053 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 302 | 2026-09-26 |
| EV-054 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 303 | 2026-09-26 |
| EV-055 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 306 | 2026-09-26 |
| EV-056 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 307 | 2026-09-26 |
| EV-057 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 403 | 2026-09-26 |
| EV-058 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 414 | 2026-09-26 |
| EV-059 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 406 | 2026-09-26 |
| EV-060 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 407 | 2026-09-26 |
| EV-061 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 408 | 2026-09-26 |
| EV-062 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 413 | 2026-09-26 |
| EV-063 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 164 → Conservation and Environmental Biology | 2026-09-26 |
| EV-064 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 202 | 2026-09-26 |
| EV-065 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code ENT 312 | 2026-09-26 |
| EV-066 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 410 | 2026-09-26 |
| EV-067 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 166 → Environmental Biology | 2026-09-26 |
| EV-068 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 167 → Environmental Biology and Fisheries | 2026-09-26 |
| EV-069 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biology → course code BIO 300 | 2026-09-26 |
| EV-070 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 168 → Marine Science and Technology | 2026-09-26 |
| EV-071 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Marine Science → course code MSE 201 | 2026-09-26 |
| EV-072 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Marine Science → course code MSE 202 | 2026-09-26 |
| EV-073 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Marine Science → course code MSE 204 | 2026-09-26 |
| EV-074 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Marine Science → course code MSE 207 | 2026-09-26 |
| EV-075 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Marine Science → course code MSE 301 | 2026-09-26 |
| EV-076 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Marine Science → course code MSE 302 | 2026-09-26 |
| EV-077 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Marine Science → course code MSE 303 | 2026-09-26 |
| EV-078 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Marine Science → course code MSE 305 | 2026-09-26 |
| EV-079 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Marine Science → course code MSE 306 | 2026-09-26 |
| EV-080 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Marine Science → course code MSE 307 | 2026-09-26 |
| EV-081 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Marine Science → course code MSE 401 | 2026-09-26 |
| EV-082 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Marine Science → course code MSE 402 | 2026-09-26 |
| EV-083 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Marine Science → course code MSE 403 | 2026-09-26 |
| EV-084 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 169 → Aviation Business | 2026-09-26 |
| EV-085 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Aviation Management → course code AVM 101 | 2026-09-26 |
| EV-086 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Aviation Management → course code AVM 102 | 2026-09-26 |
| EV-087 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Aviation Management → course code AVM 203 | 2026-09-26 |
| EV-088 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Aviation Management → course code AVM 204 | 2026-09-26 |
| EV-089 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Aviation Management → course code AVM 210 | 2026-09-26 |
| EV-090 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Aviation Management → course code AVM 211 | 2026-09-26 |
| EV-091 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Aviation Management → course code AVM 303 | 2026-09-26 |
| EV-092 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Aviation Management → course code AVM 304 | 2026-09-26 |
| EV-093 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Aviation Management → course code AVM 305 | 2026-09-26 |
| EV-094 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Aviation Management → course code AVM 306 | 2026-09-26 |
| EV-095 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Aviation Management → course code AVM 307 | 2026-09-26 |
| EV-096 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Aviation Management → course code AVM 401 | 2026-09-26 |
| EV-097 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Aviation Management → course code AVM 405 | 2026-09-26 |
| EV-098 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf | administration_management.json → Aviation Management → course code AVM 490 | 2026-09-26 |
| EV-099 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 173 → Microbiology and Biotechnology | 2026-09-26 |
| EV-100 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code MCB 221 | 2026-09-26 |
| EV-101 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 304 | 2026-09-26 |
| EV-102 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 174 → Microbiology/Parasitology | 2026-09-26 |
| EV-103 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Microbiology → course code MCB 221 | 2026-09-26 |
| EV-104 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Microbiology → course code MCB 231 | 2026-09-26 |
| EV-105 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Microbiology → course code MCB 309 | 2026-09-26 |
| EV-106 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Microbiology → course code MCB 324 | 2026-09-26 |
| EV-107 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Microbiology → course code MCB 405 | 2026-09-26 |
| EV-108 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Microbiology → course code MCB 407 | 2026-09-26 |
| EV-109 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Microbiology → course code MCB 412 | 2026-09-26 |
| EV-110 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Microbiology → course code MCB 423 | 2026-09-26 |
| EV-111 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Microbiology → course code MCB 424 | 2026-09-26 |
| EV-112 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Microbiology → course code MCB 425 | 2026-09-26 |
| EV-113 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Microbiology → course code MCB 431 | 2026-09-26 |
| EV-114 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 175 → Biology/Biotechnology | 2026-09-26 |
| EV-115 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BIO 101 | 2026-09-26 |
| EV-116 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BIO 107 | 2026-09-26 |
| EV-117 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BIO 108 | 2026-09-26 |
| EV-118 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BCH 201 | 2026-09-26 |
| EV-119 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code STA 201 | 2026-09-26 |
| EV-120 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 176 → Microbiology and Industrial Biotechnology | 2026-09-26 |
| EV-121 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biotechnology → course code BTG 399 | 2026-09-26 |
| EV-122 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 177 → Industrial Microbiology | 2026-09-26 |
| EV-123 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Microbiology → course code BIO 101 | 2026-09-26 |
| EV-124 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Microbiology → course code BIO 102 | 2026-09-26 |
| EV-125 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Microbiology → course code MCB 305 | 2026-09-26 |
| EV-126 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Microbiology → course code MCB 399 | 2026-09-26 |
| EV-127 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Microbiology → course code MCB 491 | 2026-09-26 |
| EV-128 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 178 → Environmental Chemistry and Toxicology | 2026-09-26 |
| EV-129 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 101 | 2026-09-26 |
| EV-130 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 102 | 2026-09-26 |
| EV-131 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 107 | 2026-09-26 |
| EV-132 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 108 | 2026-09-26 |
| EV-133 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 210 | 2026-09-26 |
| EV-134 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 211 | 2026-09-26 |
| EV-135 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 212 | 2026-09-26 |
| EV-136 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 213 | 2026-09-26 |
| EV-137 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 214 | 2026-09-26 |
| EV-138 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 207 | 2026-09-26 |
| EV-139 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 208 | 2026-09-26 |
| EV-140 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code ENT 312 | 2026-09-26 |
| EV-141 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 301 | 2026-09-26 |
| EV-142 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 302 | 2026-09-26 |
| EV-143 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 303 | 2026-09-26 |
| EV-144 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 314 | 2026-09-26 |
| EV-145 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 319 | 2026-09-26 |
| EV-146 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 400 | 2026-09-26 |
| EV-147 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 401 | 2026-09-26 |
| EV-148 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 406 | 2026-09-26 |
| EV-149 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 410 | 2026-09-26 |
| EV-150 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 423 | 2026-09-26 |
| EV-151 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Chemistry → course code CHM 424 | 2026-09-26 |
| EV-152 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 182 → Computer, Information and Communication Science | 2026-09-26 |
| EV-153 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Information and Communication Technology → course code GST 111 | 2026-09-26 |
| EV-154 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Information and Communication Technology → course code COS 101 | 2026-09-26 |
| EV-155 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Information and Communication Technology → course code COS 201 | 2026-09-26 |
| EV-156 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Information and Communication Technology → course code COS 202 | 2026-09-26 |
| EV-157 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Information and Communication Technology → course code ICT 201 | 2026-09-26 |
| EV-158 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Information and Communication Technology → course code INS 202 | 2026-09-26 |
| EV-159 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Information and Communication Technology → course code IFT 203 | 2026-09-26 |
| EV-160 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Information and Communication Technology → course code ICT 301 | 2026-09-26 |
| EV-161 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Information and Communication Technology → course code ICT 305 | 2026-09-26 |
| EV-162 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Information and Communication Technology → course code ICT 309 | 2026-09-26 |
| EV-163 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Information and Communication Technology → course code CYB 301 | 2026-09-26 |
| EV-164 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Information and Communication Technology → course code CSC 308 | 2026-09-26 |
| EV-165 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Information and Communication Technology → course code IFT 442 | 2026-09-26 |
| EV-166 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 183 → Computer Science and Informatics | 2026-09-26 |
| EV-167 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Computer Science → course code COS 101 | 2026-09-26 |
| EV-168 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Computer Science → course code COS 201 | 2026-09-26 |
| EV-169 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Computer Science → course code COS 202 | 2026-09-26 |
| EV-170 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Computer Science → course code IFT 212 | 2026-09-26 |
| EV-171 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Computer Science → course code SEN 201 | 2026-09-26 |
| EV-172 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Computer Science → course code CSC 322 | 2026-09-26 |
| EV-173 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Computer Science → course code CSC 401 | 2026-09-26 |
| EV-174 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Computer Science → course code CSC 402 | 2026-09-26 |
| EV-175 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 184 → Computing and Artificial Intelligence | 2026-09-26 |
| EV-176 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Computer Science → course code CSC 309 | 2026-09-26 |
| EV-177 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 185 → Computer with Electronics | 2026-09-26 |
| EV-178 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 186 → Software Engineering and Digital Entrepreneurship | 2026-09-26 |
| EV-179 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Software Engineering → course code ENT 211 | 2026-09-26 |
| EV-180 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Software Engineering → course code SEN 201 | 2026-09-26 |
| EV-181 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Software Engineering → course code IFT 211 | 2026-09-26 |
| EV-182 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Software Engineering → course code ENT 312 | 2026-09-26 |
| EV-183 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Software Engineering → course code SEN 304 | 2026-09-26 |
| EV-184 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Software Engineering → course code SEN 306 | 2026-09-26 |
| EV-185 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Software Engineering → course code SEN 322 | 2026-09-26 |
| EV-186 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Software Engineering → course code SEN 401 | 2026-09-26 |
| EV-187 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Software Engineering → course code SEN 410 | 2026-09-26 |

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

This increment reconciles the current **221–240** queue against the prior row-level evidence. It does **not** close any identity: scope evidence, exact offering context, selected-course fidelity, item-level citations, and external/custom provenance remain open where listed. It performs no downstream domain/subgroup/role audit.

The next bounded increment is **identities 241–260**, maximum **20 identities/packages**, and must save its own append-only JSON/Markdown checkpoint before proceeding.

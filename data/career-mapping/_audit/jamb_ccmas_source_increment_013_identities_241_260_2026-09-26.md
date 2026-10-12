# JAMB–CCMAS source increment 013 — identities 241–260

**Audit date:** 2026-09-26 (Africa/Lagos)  
**Mode:** bounded reconciliation after checkpoint 003; append-only  
**Assigned lane:** JAMB identity/offering and CCMAS/external source integrity only  
**Write boundary:** no shared source, mapping, scope, seed, SQL, UI, downstream taxonomy, domain, subgroup, or role file was edited.

## Exact coverage inspected

- Canonical JAMB identities: **20/20**, rows **241–260**.
- Current queue records: **20 identity rows**, **66 current issue records**.
- Current selected-course occurrences represented by those rows: **189**.
- Parsed offering occurrences represented by those rows: **21**.
- CCMAS/external components inspected through the current records: **Agricultural Science::Animal Science, Agricultural Science::B. Agriculture, Agricultural Science::Crop Science, Agricultural Science::Fisheries and Aquaculture, Agricultural Science::Horticulture and Landscape Management, Allied Health Sciences::Dental Technology, Allied Health Sciences::Human Nutrition and Dietetics, Allied Health Sciences::Medical Laboratory Science, Allied Health Sciences::Occupational Therapy, Allied Health Sciences::Pharmacology, Allied Health Sciences::Physiotherapy, Allied Health Sciences::Public Health, Allied Health Sciences::Radiography, Basic Medical Sciences::Human Anatomy, Computing::Computer Science, Medicine and Dentistry::Bachelor of Dental Surgery (BDS/BChD), Medicine and Dentistry::Bachelor of Medicine and Bachelor of Surgery (MBBS/MBChB), Sciences::Biochemistry**.
- Prior row-level evidence was read first from the existing final-gap checkpoint(s) for rows **241–260**; already-verified facts were not re-researched.

## Records inspected

| Row | JAMB identity | Component reference(s) | Current scope state | Selected courses | Offering records | Current issue IDs |
|---:|---|---|---|---:|---:|---|
| 241 | Robotics (Artificial Intelligence) | Computing::Computer Science | partial_scope_reviewed | 1 | 1 | SRC-00727, SRC-00728, SRC-00729, SRC-00730 |
| 242 | Anatomy | Basic Medical Sciences::Human Anatomy | partial_scope_reviewed | 9 | 1 | SRC-00731, SRC-00732, SRC-00733 |
| 243 | Biochemistry | Sciences::Biochemistry | full | 0 | 1 | SRC-00734, SRC-00735 |
| 244 | Medical Biochemistry | Sciences::Biochemistry | partial_scope_reviewed | 11 | 1 | SRC-00736, SRC-00737, SRC-00738 |
| 245 | Dentistry and Dental Technology | Medicine and Dentistry::Bachelor of Dental Surgery (BDS/BChD), Allied Health Sciences::Dental Technology | combined_scope_review_required | 0 | 1 | SRC-00739, SRC-00740, SRC-00741, SRC-00742 |
| 246 | Human Nutrition and Dietetics | Allied Health Sciences::Human Nutrition and Dietetics | full | 0 | 1 | SRC-00743, SRC-00744 |
| 247 | Medical Laboratory Technology/Science | Allied Health Sciences::Medical Laboratory Science | partial_scope_reviewed | 19 | 1 | SRC-00745, SRC-00746, SRC-00747, SRC-00748 |
| 248 | Medical Rehabilitation | Allied Health Sciences::Physiotherapy, Allied Health Sciences::Occupational Therapy | combined_scope_review_required | 0 | 1 | SRC-00749, SRC-00750, SRC-00751, SRC-00752 |
| 249 | Public Health Technology | Allied Health Sciences::Public Health | partial_scope_reviewed | 17 | 1 | SRC-00753, SRC-00754, SRC-00755, SRC-00756 |
| 250 | Medicine and Surgery (Human Medicine) | Medicine and Dentistry::Bachelor of Medicine and Bachelor of Surgery (MBBS/MBChB) | partial_scope_reviewed | 45 | 1 | SRC-00757, SRC-00758, SRC-00759 |
| 251 | Physiotherapy | Allied Health Sciences::Physiotherapy | full | 0 | 1 | SRC-00760, SRC-00761 |
| 252 | Pharmacology | Allied Health Sciences::Pharmacology | full | 0 | 1 | SRC-00762, SRC-00763 |
| 253 | Radiography | Allied Health Sciences::Radiography | full | 0 | 1 | SRC-00764, SRC-00765 |
| 254 | Agriculture | Agricultural Science::B. Agriculture | partial_scope_reviewed | 26 | 1 | SRC-00766, SRC-00767, SRC-00768, SRC-00769 |
| 255 | Horticulture | Agricultural Science::Horticulture and Landscape Management | partial_scope_reviewed | 10 | 1 | SRC-00770, SRC-00771, SRC-00772, SRC-00773 |
| 256 | Fisheries | Agricultural Science::Fisheries and Aquaculture | partial_scope_reviewed | 15 | 2 | SRC-00774, SRC-00775, SRC-00776, SRC-00777 |
| 257 | Agronomy | Agricultural Science::Crop Science | partial_scope_reviewed | 1 | 1 | SRC-00778, SRC-00779, SRC-00780 |
| 258 | Animal Production | Agricultural Science::Animal Science | partial_scope_reviewed | 21 | 1 | SRC-00781, SRC-00782, SRC-00783, SRC-00784 |
| 259 | Animal Science | Agricultural Science::Animal Science | full | 0 | 1 | SRC-00785, SRC-00786 |
| 260 | Animal Breeding and Genetics | Agricultural Science::Animal Science | partial_scope_reviewed | 14 | 1 | SRC-00787, SRC-00788, SRC-00789, SRC-00790 |

## Current issue counts

- Confirmed gaps still open: **62**.
- Candidate issues still open: **2**.
- New issue classes discovered in this reconciliation: **0**.
- Closed findings reopened: **0**.
- Distinct exact evidence references captured: **193**.

By issue type/status:

- `combined_scope_zero_courses` / `confirmed_gap`: 2
- `offering_context_unverified` / `confirmed_gap`: 20
- `scope_evidence_missing` / `confirmed_gap`: 20
- `scope_semantic_review_required` / `candidate`: 2
- `selected_course_citation_incomplete` / `confirmed_gap`: 12
- `selected_course_content_or_outcome_gap` / `confirmed_gap`: 8

## Confirmed and candidate issue ledger

The following are current open records carried from the source issue queue. They are not claims that every record below is an academic-content defect; provenance, offering-context, and citation gaps remain distinct from content defects.

| Issue | Row | Status | Type | Evidence refs | Recommendation |
|---|---:|---|---|---|---|
| SRC-00727 | 241 | confirmed_gap | scope_evidence_missing | EV-001 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00728 | 241 | confirmed_gap | offering_context_unverified | EV-001 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00729 | 241 | confirmed_gap | selected_course_citation_incomplete | EV-002 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00730 | 241 | confirmed_gap | selected_course_content_or_outcome_gap | EV-002 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00731 | 242 | confirmed_gap | scope_evidence_missing | EV-003 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00732 | 242 | confirmed_gap | offering_context_unverified | EV-003 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00733 | 242 | confirmed_gap | selected_course_citation_incomplete | EV-004, EV-005, EV-006, EV-007, EV-008, EV-009, EV-010, EV-011 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00734 | 243 | confirmed_gap | scope_evidence_missing | EV-012 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00735 | 243 | confirmed_gap | offering_context_unverified | EV-012 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00736 | 244 | confirmed_gap | scope_evidence_missing | EV-013 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00737 | 244 | confirmed_gap | offering_context_unverified | EV-013 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00738 | 244 | confirmed_gap | selected_course_citation_incomplete | EV-014, EV-015, EV-016, EV-017, EV-018, EV-019, EV-020, EV-021, EV-022, EV-023, EV-024 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00739 | 245 | confirmed_gap | scope_evidence_missing | EV-025 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00740 | 245 | confirmed_gap | offering_context_unverified | EV-025 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00741 | 245 | confirmed_gap | combined_scope_zero_courses | EV-025 | Build a bounded component-by-component evidence bundle; do not infer a union from the title or mark the programme unavailable solely because the local scope is empty. |
| SRC-00742 | 245 | candidate | scope_semantic_review_required | EV-025 | Reconcile the exact offering context, each named component, selected courses/outcomes, and supported student-facing status; a review label is not evidence of correctness. |
| SRC-00743 | 246 | confirmed_gap | scope_evidence_missing | EV-026 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00744 | 246 | confirmed_gap | offering_context_unverified | EV-026 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00745 | 247 | confirmed_gap | scope_evidence_missing | EV-027 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00746 | 247 | confirmed_gap | offering_context_unverified | EV-027 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00747 | 247 | confirmed_gap | selected_course_citation_incomplete | EV-028, EV-029, EV-030, EV-031, EV-032, EV-033, EV-034, EV-035, EV-036, EV-037, EV-038, EV-039, EV-040, EV-041, EV-042, EV-043, EV-044, EV-045, EV-046 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00748 | 247 | confirmed_gap | selected_course_content_or_outcome_gap | EV-028, EV-029, EV-030, EV-031, EV-032, EV-033, EV-034, EV-035, EV-036, EV-037, EV-038, EV-039, EV-040, EV-041, EV-042, EV-043, EV-044, EV-045, EV-046 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00749 | 248 | confirmed_gap | scope_evidence_missing | EV-047 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00750 | 248 | confirmed_gap | offering_context_unverified | EV-047 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00751 | 248 | confirmed_gap | combined_scope_zero_courses | EV-047 | Build a bounded component-by-component evidence bundle; do not infer a union from the title or mark the programme unavailable solely because the local scope is empty. |
| SRC-00752 | 248 | candidate | scope_semantic_review_required | EV-047 | Reconcile the exact offering context, each named component, selected courses/outcomes, and supported student-facing status; a review label is not evidence of correctness. |
| SRC-00753 | 249 | confirmed_gap | scope_evidence_missing | EV-048 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00754 | 249 | confirmed_gap | offering_context_unverified | EV-048 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00755 | 249 | confirmed_gap | selected_course_citation_incomplete | EV-049, EV-050, EV-051, EV-052, EV-053, EV-054, EV-055, EV-056, EV-057, EV-058, EV-059, EV-060, EV-061, EV-062, EV-063, EV-064 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00756 | 249 | confirmed_gap | selected_course_content_or_outcome_gap | EV-049, EV-050, EV-051, EV-052, EV-053, EV-054, EV-055, EV-056, EV-057, EV-058, EV-059, EV-060, EV-061, EV-062, EV-063, EV-064 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00757 | 250 | confirmed_gap | scope_evidence_missing | EV-065 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00758 | 250 | confirmed_gap | offering_context_unverified | EV-065 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00759 | 250 | confirmed_gap | selected_course_citation_incomplete | EV-066, EV-067, EV-068, EV-069, EV-070, EV-071, EV-072, EV-073, EV-074, EV-075, EV-076, EV-077, EV-078, EV-079, EV-080, EV-081, EV-082, EV-083, EV-084, EV-085, EV-086, EV-087, EV-088, EV-089, EV-090, EV-091, EV-092, EV-093, EV-094, EV-095, EV-096, EV-097, EV-098, EV-099, EV-100, EV-101, EV-102, EV-103, EV-104, EV-105, EV-106, EV-107, EV-108, EV-109, EV-110 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00760 | 251 | confirmed_gap | scope_evidence_missing | EV-111 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00761 | 251 | confirmed_gap | offering_context_unverified | EV-111 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00762 | 252 | confirmed_gap | scope_evidence_missing | EV-112 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00763 | 252 | confirmed_gap | offering_context_unverified | EV-112 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00764 | 253 | confirmed_gap | scope_evidence_missing | EV-113 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00765 | 253 | confirmed_gap | offering_context_unverified | EV-113 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00766 | 254 | confirmed_gap | scope_evidence_missing | EV-114 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00767 | 254 | confirmed_gap | offering_context_unverified | EV-114 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00768 | 254 | confirmed_gap | selected_course_citation_incomplete | EV-115, EV-116, EV-117, EV-118, EV-119, EV-120, EV-121, EV-122, EV-123, EV-124, EV-125, EV-126, EV-127, EV-128, EV-129, EV-130, EV-131, EV-132, EV-133, EV-134, EV-135, EV-136, EV-137, EV-138, EV-139, EV-140 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00769 | 254 | confirmed_gap | selected_course_content_or_outcome_gap | EV-115, EV-116, EV-117, EV-118, EV-119, EV-120, EV-121, EV-122, EV-123, EV-124, EV-125, EV-126, EV-127, EV-128, EV-129, EV-130, EV-131, EV-132, EV-133, EV-134, EV-135, EV-136, EV-137, EV-138, EV-139, EV-140 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00770 | 255 | confirmed_gap | scope_evidence_missing | EV-141 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00771 | 255 | confirmed_gap | offering_context_unverified | EV-141 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00772 | 255 | confirmed_gap | selected_course_citation_incomplete | EV-142, EV-143, EV-144, EV-145, EV-146, EV-147, EV-148, EV-149, EV-150 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00773 | 255 | confirmed_gap | selected_course_content_or_outcome_gap | EV-142, EV-143, EV-144, EV-145, EV-146, EV-147, EV-148, EV-149, EV-150 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00774 | 256 | confirmed_gap | scope_evidence_missing | EV-151, EV-152 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00775 | 256 | confirmed_gap | offering_context_unverified | EV-151, EV-152 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00776 | 256 | confirmed_gap | selected_course_citation_incomplete | EV-153, EV-154, EV-155, EV-156, EV-157, EV-158, EV-159, EV-160, EV-161, EV-162, EV-163, EV-164, EV-165, EV-166, EV-167 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00777 | 256 | confirmed_gap | selected_course_content_or_outcome_gap | EV-153, EV-154, EV-155, EV-156, EV-157, EV-158, EV-159, EV-160, EV-161, EV-162, EV-163, EV-164, EV-165, EV-166, EV-167 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00778 | 257 | confirmed_gap | scope_evidence_missing | EV-168 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00779 | 257 | confirmed_gap | offering_context_unverified | EV-168 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00780 | 257 | confirmed_gap | selected_course_citation_incomplete | EV-169 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00781 | 258 | confirmed_gap | scope_evidence_missing | EV-170 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00782 | 258 | confirmed_gap | offering_context_unverified | EV-170 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00783 | 258 | confirmed_gap | selected_course_citation_incomplete | EV-171, EV-172, EV-173, EV-174, EV-175, EV-176, EV-177, EV-178, EV-179, EV-180, EV-181, EV-182, EV-183, EV-184, EV-185, EV-186, EV-187, EV-188, EV-189, EV-190, EV-191 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00784 | 258 | confirmed_gap | selected_course_content_or_outcome_gap | EV-171, EV-172, EV-173, EV-174, EV-175, EV-176, EV-177, EV-178, EV-179, EV-180, EV-181, EV-182, EV-183, EV-184, EV-185, EV-186, EV-187, EV-188, EV-189, EV-190, EV-191 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |
| SRC-00785 | 259 | confirmed_gap | scope_evidence_missing | EV-192 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00786 | 259 | confirmed_gap | offering_context_unverified | EV-192 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00787 | 260 | confirmed_gap | scope_evidence_missing | EV-193 | Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone. |
| SRC-00788 | 260 | confirmed_gap | offering_context_unverified | EV-193 | Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings. |
| SRC-00789 | 260 | confirmed_gap | selected_course_citation_incomplete | EV-171, EV-177, EV-178, EV-179, EV-180, EV-181, EV-182, EV-183, EV-184, EV-185, EV-187, EV-188, EV-189, EV-190 | Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked. |
| SRC-00790 | 260 | confirmed_gap | selected_course_content_or_outcome_gap | EV-171, EV-177, EV-178, EV-179, EV-180, EV-181, EV-182, EV-183, EV-184, EV-185, EV-187, EV-188, EV-189, EV-190 | Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose. |

## Exact evidence URLs, locators, and access dates

### Structured evidence references attached to issue records

| Ref | URL | Exact locator | Accessed |
|---|---|---|---|
| EV-001 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 187 → Robotics (Artificial Intelligence) | 2026-09-26 |
| EV-002 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf | computing.json → Computer Science → course code CSC 309 | 2026-09-26 |
| EV-003 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-medical.pdf | medical.txt → parsed row ordinal 1 → Anatomy | 2026-09-26 |
| EV-004 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Basic-Medical-Sciences-CCMAS-FINAL-December-26-2022.pdf | basic_medical.json → Human Anatomy → course code ANA 201 | 2026-09-26 |
| EV-005 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Basic-Medical-Sciences-CCMAS-FINAL-December-26-2022.pdf | basic_medical.json → Human Anatomy → course code ANA 202 | 2026-09-26 |
| EV-006 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Basic-Medical-Sciences-CCMAS-FINAL-December-26-2022.pdf | basic_medical.json → Human Anatomy → course code ANA 204 | 2026-09-26 |
| EV-007 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Basic-Medical-Sciences-CCMAS-FINAL-December-26-2022.pdf | basic_medical.json → Human Anatomy → course code ANA 301 | 2026-09-26 |
| EV-008 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Basic-Medical-Sciences-CCMAS-FINAL-December-26-2022.pdf | basic_medical.json → Human Anatomy → course code ANA 312 | 2026-09-26 |
| EV-009 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Basic-Medical-Sciences-CCMAS-FINAL-December-26-2022.pdf | basic_medical.json → Human Anatomy → course code ANA 307 | 2026-09-26 |
| EV-010 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Basic-Medical-Sciences-CCMAS-FINAL-December-26-2022.pdf | basic_medical.json → Human Anatomy → course code ANA 411 | 2026-09-26 |
| EV-011 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Basic-Medical-Sciences-CCMAS-FINAL-December-26-2022.pdf | basic_medical.json → Human Anatomy → course code ANA 422 | 2026-09-26 |
| EV-012 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-medical.pdf | medical.txt → parsed row ordinal 2 → Biochemistry | 2026-09-26 |
| EV-013 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-medical.pdf | medical.txt → parsed row ordinal 3 → Medical Biochemistry | 2026-09-26 |
| EV-014 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biochemistry → course code BCH 201 | 2026-09-26 |
| EV-015 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biochemistry → course code BCH 202 | 2026-09-26 |
| EV-016 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biochemistry → course code BCH 203 | 2026-09-26 |
| EV-017 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biochemistry → course code BCH 301 | 2026-09-26 |
| EV-018 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biochemistry → course code BCH 302 | 2026-09-26 |
| EV-019 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biochemistry → course code BCH 306 | 2026-09-26 |
| EV-020 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biochemistry → course code BCH 307 | 2026-09-26 |
| EV-021 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biochemistry → course code BCH 309 | 2026-09-26 |
| EV-022 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biochemistry → course code BCH 402 | 2026-09-26 |
| EV-023 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biochemistry → course code BCH 405 | 2026-09-26 |
| EV-024 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf | sciences.json → Biochemistry → course code BCH 408 | 2026-09-26 |
| EV-025 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-medical.pdf | medical.txt → parsed row ordinal 4 → Dentistry and Dental Technology | 2026-09-26 |
| EV-026 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-medical.pdf | medical.txt → parsed row ordinal 5 → Human Nutrition and Dietetics | 2026-09-26 |
| EV-027 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-medical.pdf | medical.txt → parsed row ordinal 6 → Medical Laboratory Technology/Science | 2026-09-26 |
| EV-028 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf | allied_health.json → Medical Laboratory Science → course code MLS 201 | 2026-09-26 |
| EV-029 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf | allied_health.json → Medical Laboratory Science → course code MLS 301 | 2026-09-26 |
| EV-030 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf | allied_health.json → Medical Laboratory Science → course code MLS 306 | 2026-09-26 |
| EV-031 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf | allied_health.json → Medical Laboratory Science → course code MLS 309 | 2026-09-26 |
| EV-032 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf | allied_health.json → Medical Laboratory Science → course code MLS 310 | 2026-09-26 |
| EV-033 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf | allied_health.json → Medical Laboratory Science → course code MLS 401 | 2026-09-26 |
| EV-034 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf | allied_health.json → Medical Laboratory Science → course code MLS 402 | 2026-09-26 |
| EV-035 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf | allied_health.json → Medical Laboratory Science → course code MLS 403 | 2026-09-26 |
| EV-036 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf | allied_health.json → Medical Laboratory Science → course code MLS 404 | 2026-09-26 |
| EV-037 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf | allied_health.json → Medical Laboratory Science → course code MLS 405 | 2026-09-26 |
| EV-038 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf | allied_health.json → Medical Laboratory Science → course code MLS 406 | 2026-09-26 |
| EV-039 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf | allied_health.json → Medical Laboratory Science → course code MLS 408 | 2026-09-26 |
| EV-040 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf | allied_health.json → Medical Laboratory Science → course code MLS 410 | 2026-09-26 |
| EV-041 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf | allied_health.json → Medical Laboratory Science → course code MLS 412 | 2026-09-26 |
| EV-042 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf | allied_health.json → Medical Laboratory Science → course code MLS 502 | 2026-09-26 |
| EV-043 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf | allied_health.json → Medical Laboratory Science → course code MLS 505 | 2026-09-26 |
| EV-044 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf | allied_health.json → Medical Laboratory Science → course code MLS 510 | 2026-09-26 |
| EV-045 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf | allied_health.json → Medical Laboratory Science → course code MLS 512 | 2026-09-26 |
| EV-046 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf | allied_health.json → Medical Laboratory Science → course code MLS 514 | 2026-09-26 |
| EV-047 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-medical.pdf | medical.txt → parsed row ordinal 7 → Medical Rehabilitation | 2026-09-26 |
| EV-048 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-medical.pdf | medical.txt → parsed row ordinal 8 → Public Health Technology | 2026-09-26 |
| EV-049 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf | allied_health.json → Public Health → course code PHS 202 | 2026-09-26 |
| EV-050 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf | allied_health.json → Public Health → course code PHS 201 | 2026-09-26 |
| EV-051 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf | allied_health.json → Public Health → course code PHS 203 | 2026-09-26 |
| EV-052 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf | allied_health.json → Public Health → course code PHS 204 | 2026-09-26 |
| EV-053 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf | allied_health.json → Public Health → course code PHS 301 | 2026-09-26 |
| EV-054 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf | allied_health.json → Public Health → course code PHS 302 | 2026-09-26 |
| EV-055 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf | allied_health.json → Public Health → course code PHS 303 | 2026-09-26 |
| EV-056 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf | allied_health.json → Public Health → course code PHS 304 | 2026-09-26 |
| EV-057 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf | allied_health.json → Public Health → course code PHS 305 | 2026-09-26 |
| EV-058 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf | allied_health.json → Public Health → course code PHS 306 | 2026-09-26 |
| EV-059 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf | allied_health.json → Public Health → course code PHS 308 | 2026-09-26 |
| EV-060 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf | allied_health.json → Public Health → course code PHS 401 | 2026-09-26 |
| EV-061 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf | allied_health.json → Public Health → course code PHS 402 | 2026-09-26 |
| EV-062 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf | allied_health.json → Public Health → course code PHS 403 | 2026-09-26 |
| EV-063 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf | allied_health.json → Public Health → course code PHS 405 | 2026-09-26 |
| EV-064 | https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf | allied_health.json → Public Health → course code PHS 409 | 2026-09-26 |
| EV-065 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-medical.pdf | medical.txt → parsed row ordinal 9 → Medicine and Surgery (Human Medicine) | 2026-09-26 |
| EV-066 | https://www.nuc.edu.ng/ccmas/ | medicine_dentistry.json → Bachelor of Medicine and Bachelor of Surgery (MBBS/MBChB) → course code GST 112 | 2026-09-26 |
| EV-067 | https://www.nuc.edu.ng/ccmas/ | medicine_dentistry.json → Bachelor of Medicine and Bachelor of Surgery (MBBS/MBChB) → course code PHS 201 | 2026-09-26 |
| EV-068 | https://www.nuc.edu.ng/ccmas/ | medicine_dentistry.json → Bachelor of Medicine and Bachelor of Surgery (MBBS/MBChB) → course code COM 201 | 2026-09-26 |
| EV-069 | https://www.nuc.edu.ng/ccmas/ | medicine_dentistry.json → Bachelor of Medicine and Bachelor of Surgery (MBBS/MBChB) → course code COM 203 | 2026-09-26 |
| EV-070 | https://www.nuc.edu.ng/ccmas/ | medicine_dentistry.json → Bachelor of Medicine and Bachelor of Surgery (MBBS/MBChB) → course code COM 205 | 2026-09-26 |
| EV-071 | https://www.nuc.edu.ng/ccmas/ | medicine_dentistry.json → Bachelor of Medicine and Bachelor of Surgery (MBBS/MBChB) → course code MDH 201 | 2026-09-26 |
| EV-072 | https://www.nuc.edu.ng/ccmas/ | medicine_dentistry.json → Bachelor of Medicine and Bachelor of Surgery (MBBS/MBChB) → course code MDH 203 | 2026-09-26 |
| EV-073 | https://www.nuc.edu.ng/ccmas/ | medicine_dentistry.json → Bachelor of Medicine and Bachelor of Surgery (MBBS/MBChB) → course code GST 212 | 2026-09-26 |
| EV-074 | https://www.nuc.edu.ng/ccmas/ | medicine_dentistry.json → Bachelor of Medicine and Bachelor of Surgery (MBBS/MBChB) → course code PHS 208 | 2026-09-26 |
| EV-075 | https://www.nuc.edu.ng/ccmas/ | medicine_dentistry.json → Bachelor of Medicine and Bachelor of Surgery (MBBS/MBChB) → course code BCH 204 | 2026-09-26 |
| EV-076 | https://www.nuc.edu.ng/ccmas/ | medicine_dentistry.json → Bachelor of Medicine and Bachelor of Surgery (MBBS/MBChB) → course code MDH 202 | 2026-09-26 |
| EV-077 | https://www.nuc.edu.ng/ccmas/ | medicine_dentistry.json → Bachelor of Medicine and Bachelor of Surgery (MBBS/MBChB) → course code MDH 204 | 2026-09-26 |
| EV-078 | https://www.nuc.edu.ng/ccmas/ | medicine_dentistry.json → Bachelor of Medicine and Bachelor of Surgery (MBBS/MBChB) → course code ANA 307 | 2026-09-26 |
| EV-079 | https://www.nuc.edu.ng/ccmas/ | medicine_dentistry.json → Bachelor of Medicine and Bachelor of Surgery (MBBS/MBChB) → course code BCH 307 | 2026-09-26 |
| EV-080 | https://www.nuc.edu.ng/ccmas/ | medicine_dentistry.json → Bachelor of Medicine and Bachelor of Surgery (MBBS/MBChB) → course code MDH 301 | 2026-09-26 |
| EV-081 | https://www.nuc.edu.ng/ccmas/ | medicine_dentistry.json → Bachelor of Medicine and Bachelor of Surgery (MBBS/MBChB) → course code ENT 312 | 2026-09-26 |
| EV-082 | https://www.nuc.edu.ng/ccmas/ | medicine_dentistry.json → Bachelor of Medicine and Bachelor of Surgery (MBBS/MBChB) → course code PCL 302 | 2026-09-26 |
| EV-083 | https://www.nuc.edu.ng/ccmas/ | medicine_dentistry.json → Bachelor of Medicine and Bachelor of Surgery (MBBS/MBChB) → course code COM 304 | 2026-09-26 |
| EV-084 | https://www.nuc.edu.ng/ccmas/ | medicine_dentistry.json → Bachelor of Medicine and Bachelor of Surgery (MBBS/MBChB) → course code COM 312 | 2026-09-26 |
| EV-085 | https://www.nuc.edu.ng/ccmas/ | medicine_dentistry.json → Bachelor of Medicine and Bachelor of Surgery (MBBS/MBChB) → course code COM 409 | 2026-09-26 |
| EV-086 | https://www.nuc.edu.ng/ccmas/ | medicine_dentistry.json → Bachelor of Medicine and Bachelor of Surgery (MBBS/MBChB) → course code MED 401 | 2026-09-26 |
| EV-087 | https://www.nuc.edu.ng/ccmas/ | medicine_dentistry.json → Bachelor of Medicine and Bachelor of Surgery (MBBS/MBChB) → course code MED 403 | 2026-09-26 |
| EV-088 | https://www.nuc.edu.ng/ccmas/ | medicine_dentistry.json → Bachelor of Medicine and Bachelor of Surgery (MBBS/MBChB) → course code MED 409 | 2026-09-26 |
| EV-089 | https://www.nuc.edu.ng/ccmas/ | medicine_dentistry.json → Bachelor of Medicine and Bachelor of Surgery (MBBS/MBChB) → course code SUG 401 | 2026-09-26 |
| EV-090 | https://www.nuc.edu.ng/ccmas/ | medicine_dentistry.json → Bachelor of Medicine and Bachelor of Surgery (MBBS/MBChB) → course code SUG 403 | 2026-09-26 |
| EV-091 | https://www.nuc.edu.ng/ccmas/ | medicine_dentistry.json → Bachelor of Medicine and Bachelor of Surgery (MBBS/MBChB) → course code CPY 402 | 2026-09-26 |
| EV-092 | https://www.nuc.edu.ng/ccmas/ | medicine_dentistry.json → Bachelor of Medicine and Bachelor of Surgery (MBBS/MBChB) → course code MED 402 | 2026-09-26 |
| EV-093 | https://www.nuc.edu.ng/ccmas/ | medicine_dentistry.json → Bachelor of Medicine and Bachelor of Surgery (MBBS/MBChB) → course code SUG 402 | 2026-09-26 |
| EV-094 | https://www.nuc.edu.ng/ccmas/ | medicine_dentistry.json → Bachelor of Medicine and Bachelor of Surgery (MBBS/MBChB) → course code OBG 503 | 2026-09-26 |
| EV-095 | https://www.nuc.edu.ng/ccmas/ | medicine_dentistry.json → Bachelor of Medicine and Bachelor of Surgery (MBBS/MBChB) → course code OBG 507 | 2026-09-26 |
| EV-096 | https://www.nuc.edu.ng/ccmas/ | medicine_dentistry.json → Bachelor of Medicine and Bachelor of Surgery (MBBS/MBChB) → course code COM 507 | 2026-09-26 |
| EV-097 | https://www.nuc.edu.ng/ccmas/ | medicine_dentistry.json → Bachelor of Medicine and Bachelor of Surgery (MBBS/MBChB) → course code COM 511 | 2026-09-26 |
| EV-098 | https://www.nuc.edu.ng/ccmas/ | medicine_dentistry.json → Bachelor of Medicine and Bachelor of Surgery (MBBS/MBChB) → course code COM 513 | 2026-09-26 |
| EV-099 | https://www.nuc.edu.ng/ccmas/ | medicine_dentistry.json → Bachelor of Medicine and Bachelor of Surgery (MBBS/MBChB) → course code FAM 501 | 2026-09-26 |
| EV-100 | https://www.nuc.edu.ng/ccmas/ | medicine_dentistry.json → Bachelor of Medicine and Bachelor of Surgery (MBBS/MBChB) → course code FAM 503 | 2026-09-26 |
| EV-101 | https://www.nuc.edu.ng/ccmas/ | medicine_dentistry.json → Bachelor of Medicine and Bachelor of Surgery (MBBS/MBChB) → course code OBG 504 | 2026-09-26 |
| EV-102 | https://www.nuc.edu.ng/ccmas/ | medicine_dentistry.json → Bachelor of Medicine and Bachelor of Surgery (MBBS/MBChB) → course code OBG 508 | 2026-09-26 |
| EV-103 | https://www.nuc.edu.ng/ccmas/ | medicine_dentistry.json → Bachelor of Medicine and Bachelor of Surgery (MBBS/MBChB) → course code ORT 601 | 2026-09-26 |
| EV-104 | https://www.nuc.edu.ng/ccmas/ | medicine_dentistry.json → Bachelor of Medicine and Bachelor of Surgery (MBBS/MBChB) → course code ORT 603 | 2026-09-26 |
| EV-105 | https://www.nuc.edu.ng/ccmas/ | medicine_dentistry.json → Bachelor of Medicine and Bachelor of Surgery (MBBS/MBChB) → course code OPT 613 | 2026-09-26 |
| EV-106 | https://www.nuc.edu.ng/ccmas/ | medicine_dentistry.json → Bachelor of Medicine and Bachelor of Surgery (MBBS/MBChB) → course code SUG 601 | 2026-09-26 |
| EV-107 | https://www.nuc.edu.ng/ccmas/ | medicine_dentistry.json → Bachelor of Medicine and Bachelor of Surgery (MBBS/MBChB) → course code SUG 603 | 2026-09-26 |
| EV-108 | https://www.nuc.edu.ng/ccmas/ | medicine_dentistry.json → Bachelor of Medicine and Bachelor of Surgery (MBBS/MBChB) → course code SUG 605 | 2026-09-26 |
| EV-109 | https://www.nuc.edu.ng/ccmas/ | medicine_dentistry.json → Bachelor of Medicine and Bachelor of Surgery (MBBS/MBChB) → course code SUG 607 | 2026-09-26 |
| EV-110 | https://www.nuc.edu.ng/ccmas/ | medicine_dentistry.json → Bachelor of Medicine and Bachelor of Surgery (MBBS/MBChB) → course code MED 602 | 2026-09-26 |
| EV-111 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-medical.pdf | medical.txt → parsed row ordinal 10 → Physiotherapy | 2026-09-26 |
| EV-112 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-medical.pdf | medical.txt → parsed row ordinal 11 → Pharmacology | 2026-09-26 |
| EV-113 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-medical.pdf | medical.txt → parsed row ordinal 12 → Radiography | 2026-09-26 |
| EV-114 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf | agriculture.txt → parsed row ordinal 1 → Agriculture | 2026-09-26 |
| EV-115 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → B. Agriculture → course code AGG 102 | 2026-09-26 |
| EV-116 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → B. Agriculture → course code AGG 112 | 2026-09-26 |
| EV-117 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → B. Agriculture → course code AGR 201 | 2026-09-26 |
| EV-118 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → B. Agriculture → course code AGR 202 | 2026-09-26 |
| EV-119 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → B. Agriculture → course code AGR 204 | 2026-09-26 |
| EV-120 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → B. Agriculture → course code AGE 306 | 2026-09-26 |
| EV-121 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → B. Agriculture → course code AGE 307 | 2026-09-26 |
| EV-122 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → B. Agriculture → course code ANS 302 | 2026-09-26 |
| EV-123 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → B. Agriculture → course code ANS 304 | 2026-09-26 |
| EV-124 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → B. Agriculture → course code ANS 305 | 2026-09-26 |
| EV-125 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → B. Agriculture → course code CPS 301 | 2026-09-26 |
| EV-126 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → B. Agriculture → course code CPS 302 | 2026-09-26 |
| EV-127 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → B. Agriculture → course code CPS 304 | 2026-09-26 |
| EV-128 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → B. Agriculture → course code SOS 302 | 2026-09-26 |
| EV-129 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → B. Agriculture → course code AGE 404 | 2026-09-26 |
| EV-130 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → B. Agriculture → course code AGX 410 | 2026-09-26 |
| EV-131 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → B. Agriculture → course code ANS 401 | 2026-09-26 |
| EV-132 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → B. Agriculture → course code CPS 401 | 2026-09-26 |
| EV-133 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → B. Agriculture → course code CPS 403 | 2026-09-26 |
| EV-134 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → B. Agriculture → course code CPS 406 | 2026-09-26 |
| EV-135 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → B. Agriculture → course code AGE 501 | 2026-09-26 |
| EV-136 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → B. Agriculture → course code AGX 503 | 2026-09-26 |
| EV-137 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → B. Agriculture → course code ANS 501 | 2026-09-26 |
| EV-138 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → B. Agriculture → course code ANS 502 | 2026-09-26 |
| EV-139 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → B. Agriculture → course code CPS 503 | 2026-09-26 |
| EV-140 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → B. Agriculture → course code HLM 502 | 2026-09-26 |
| EV-141 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf | agriculture.txt → parsed row ordinal 3 → Horticulture | 2026-09-26 |
| EV-142 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Horticulture and Landscape Management → course code AGG 102 | 2026-09-26 |
| EV-143 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Horticulture and Landscape Management → course code AGR 201 | 2026-09-26 |
| EV-144 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Horticulture and Landscape Management → course code HLM 301 | 2026-09-26 |
| EV-145 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Horticulture and Landscape Management → course code HLM 304 | 2026-09-26 |
| EV-146 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Horticulture and Landscape Management → course code HLM 305 | 2026-09-26 |
| EV-147 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Horticulture and Landscape Management → course code HLM 306 | 2026-09-26 |
| EV-148 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Horticulture and Landscape Management → course code HLM 401 | 2026-09-26 |
| EV-149 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Horticulture and Landscape Management → course code HLM 407 | 2026-09-26 |
| EV-150 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Horticulture and Landscape Management → course code HLM 408 | 2026-09-26 |
| EV-151 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf | agriculture.txt → parsed row ordinal 4 → Fisheries | 2026-09-26 |
| EV-152 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf | Sciences.pdf → parsed row ordinal 78 → Fisheries | 2026-09-26 |
| EV-153 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Fisheries and Aquaculture → course code AGR 204 | 2026-09-26 |
| EV-154 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Fisheries and Aquaculture → course code FAA 201 | 2026-09-26 |
| EV-155 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Fisheries and Aquaculture → course code FAA 301 | 2026-09-26 |
| EV-156 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Fisheries and Aquaculture → course code FAA 302 | 2026-09-26 |
| EV-157 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Fisheries and Aquaculture → course code FAA 303 | 2026-09-26 |
| EV-158 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Fisheries and Aquaculture → course code FAA 304 | 2026-09-26 |
| EV-159 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Fisheries and Aquaculture → course code FAA 306 | 2026-09-26 |
| EV-160 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Fisheries and Aquaculture → course code FAA 307 | 2026-09-26 |
| EV-161 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Fisheries and Aquaculture → course code FAA 308 | 2026-09-26 |
| EV-162 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Fisheries and Aquaculture → course code FAA 401 | 2026-09-26 |
| EV-163 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Fisheries and Aquaculture → course code FAA 403 | 2026-09-26 |
| EV-164 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Fisheries and Aquaculture → course code FAA 404 | 2026-09-26 |
| EV-165 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Fisheries and Aquaculture → course code FAA 405 | 2026-09-26 |
| EV-166 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Fisheries and Aquaculture → course code FAA 407 | 2026-09-26 |
| EV-167 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Fisheries and Aquaculture → course code FAA 410 | 2026-09-26 |
| EV-168 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf | agriculture.txt → parsed row ordinal 5 → Agronomy | 2026-09-26 |
| EV-169 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Crop Science → course code AGG 102 | 2026-09-26 |
| EV-170 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf | agriculture.txt → parsed row ordinal 6 → Animal Production | 2026-09-26 |
| EV-171 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Animal Science → course code AGG 102 | 2026-09-26 |
| EV-172 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Animal Science → course code AGG 112 | 2026-09-26 |
| EV-173 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Animal Science → course code BIO 101 | 2026-09-26 |
| EV-174 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Animal Science → course code AGR 201 | 2026-09-26 |
| EV-175 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Animal Science → course code AGR 202 | 2026-09-26 |
| EV-176 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Animal Science → course code AGR 203 | 2026-09-26 |
| EV-177 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Animal Science → course code AGR 204 | 2026-09-26 |
| EV-178 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Animal Science → course code ANS 201 | 2026-09-26 |
| EV-179 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Animal Science → course code ANS 202 | 2026-09-26 |
| EV-180 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Animal Science → course code ANS 302 | 2026-09-26 |
| EV-181 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Animal Science → course code ANS 303 | 2026-09-26 |
| EV-182 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Animal Science → course code ANS 304 | 2026-09-26 |
| EV-183 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Animal Science → course code ANS 305 | 2026-09-26 |
| EV-184 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Animal Science → course code ANS 306 | 2026-09-26 |
| EV-185 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Animal Science → course code ANS 308 | 2026-09-26 |
| EV-186 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Animal Science → course code ANS 402 | 2026-09-26 |
| EV-187 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Animal Science → course code ANS 403 | 2026-09-26 |
| EV-188 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Animal Science → course code ANS 405 | 2026-09-26 |
| EV-189 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Animal Science → course code ANS 406 | 2026-09-26 |
| EV-190 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Animal Science → course code ANS 407 | 2026-09-26 |
| EV-191 | https://www.nuc.edu.ng/ccmas/ | agricultural_science.json → Animal Science → course code ANS 409 | 2026-09-26 |
| EV-192 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf | agriculture.txt → parsed row ordinal 7 → Animal Science | 2026-09-26 |
| EV-193 | https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf | agriculture.txt → parsed row ordinal 8 → Animal Breeding and Genetics | 2026-09-26 |

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

This increment reconciles the current **241–260** queue against the prior row-level evidence. It does **not** close any identity: scope evidence, exact offering context, selected-course fidelity, item-level citations, and external/custom provenance remain open where listed. It performs no downstream domain/subgroup/role audit.

The next bounded increment is **identities 261–280**, maximum **20 identities/packages**, and must save its own append-only JSON/Markdown checkpoint before proceeding.

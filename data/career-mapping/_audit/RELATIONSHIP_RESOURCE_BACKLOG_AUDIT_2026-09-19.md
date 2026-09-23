# Full relationship/resource backlog audit — 2026-09-19

Read-only full-population audit of the checked-in contextual catalogue, active programme-domain routes, and the broad 420-JAMB source ledger. It does not fetch URLs, apply SQL, edit gzip transport, or promote a relationship.

## Scope

- Programmes scanned: **237**; JAMB identities scanned: **420**.
- Typed contextual items scanned: **121377** across **5668** contexts.
- Normalized relationships scanned: **408163**.
- The machine-readable report contains every context, every programme projection, and every JAMB identity; the compact markdown is a summary.

## Item/resource states

| State | Rows | Meaning |
| --- | ---: | --- |
| `linked` | 5253 | Item-specific HTTPS destination with retained source evidence. |
| `no_link` | 116116 | No reviewed item-specific destination; the reason remains on the row. |
| `review_required` | 8 | Candidate/evidence exists but is not student-approved. |
| `missing/invalid` | 0 | Contract defect requiring generator review. |

## Relationship states

| State | Rows | Meaning |
| --- | ---: | --- |
| `not_established` | 2305 | retained audit/review state; not a student relationship. |
| `source_backed` | 405858 | source-backed same-context edge. |

## Full-population safeguards

- Duplicate typed item rows: **0**.
- Unresolved/non-source-backed relationship rows: **2305**.
- Active programme-domain projections: **237 programmes**; JAMB downstream projections: **420 identities**.
- `not_established`, `review_required`, and `no_link` remain visible in the admin/audit contract and are excluded from student approval.
- Source references are retained as evidence locators; they do not become learning links or relationship proof by name similarity/co-occurrence.

## External-source boundary

The report carries forward only authoritative sources already justified in the broad ledger. Candidate sources remain review-required until an item-specific target and relationship are independently established.

| Source | URL |
| --- | --- |
| Joint Admissions and Matriculation Board | https://eligibility.jamb.gov.ng/ |
| National Open University of Nigeria | https://fos.nou.edu.ng/b-sc-mathematics/ |
| Ahmadu Bello University | https://physicalsciences.abu.edu.ng/department/mathematics/public/BScMathematics.php |
| National Universities Commission | https://www.nuc.edu.ng/ccmas-unveiled-nuc-diamond-jubilee-celebrations/ |

## Deployment boundary

SQL application, live payload verification, URL reachability, and browser proof remain deferred. This report is local contract evidence only.

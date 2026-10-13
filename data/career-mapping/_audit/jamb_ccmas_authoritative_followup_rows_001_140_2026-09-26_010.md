# Authoritative follow-up checkpoint — JAMB rows 081–090

Audit date: 2026-09-26 (Africa/Lagos). This file fills a missing checkpoint number discovered during range validation. The source/semantic review is preserved in the earlier coordinator increment below; this checkpoint reconciles its current local counts and does not edit shared mapping or course data.

## Current local baseline (corrected)

The current `jamb_curriculum_scopes_2026-08-17.json` has **180 selected course rows** in rows 081–090, **178 with populated local outcome fields** and two empty fields (CRD 307 and CRD 409 in row 090). The earlier count of 178 rows/176 outcomes in coordinator increment 014 and its count correction increment 015 is stale relative to this worktree. Row 087 has 18 course rows, not 16. Current active-map link counts read from the corrected local recount are **83**, not the old 86:

| Row | Identity | Selected rows / outcomes | Current state / active links |
|---:|---|---:|---|
| 081 | Securities and Investment | 15 / 15 | `ready_partial` / 11 |
| 082 | Management Studies | 31 / 31 | `ready_partial` / 14 |
| 083 | Entrepreneurship and Innovation | 21 / 21 | `ready_partial` / 7 |
| 084 | Transport Management | 0 / 0 | `review_required` / 0 |
| 085 | Tourism Studies | 26 / 26 | `ready_partial` / 6 |
| 086 | Employment and Human Resource Management | 0 / 0 | `review_required` / 0 |
| 087 | Accounting and Data Analytics | 18 / 18 | `ready_partial` / 8 |
| 088 | Finance and Financial Technology | 20 / 20 | `ready_partial` / 16 |
| 089 | Agribusiness and Economics | 25 / 25 | `ready_partial` / 8 |
| 090 | Cooperative Management | 24 / 22 | `ready_partial` / 13 |
| **Total** |  | **180 / 178** | **83** |

Rows 084 and 086 have full CCMAS parent references and no expanded courses. They are not unavailable based on empty scope rows. Row 089 has an Agribusiness named facet with only Economics selected; row 087's analytics facet is not established by its current accounting course scope; row 090 has two empty local outcome fields although NUC content exists for those courses. All source findings and candidate-link/domain discussion are in [coordinator increment 014](</C:/Users/USER/Documents/sifter-skillup-integrated/data/career-mapping/_audit/jamb_ccmas_mapping_quality_2026-09-24/coordinator-increment-014-rows-081-090-occurrence-curriculum-review-2026-09-25.md>); count correction is in [coordinator increment 015](</C:/Users/USER/Documents/sifter-skillup-integrated/data/career-mapping/_audit/jamb_ccmas_mapping_quality_2026-09-24/coordinator-increment-015-rows-081-090-count-correction-2026-09-25.md>). Use this checkpoint and the later `_011.md` correction as controlling counts; neither makes the tranche complete.

Official JAMB source cited by the earlier audit: [Administration degree brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf), printed title-index p. 44. Parsed institution arrays are not visual proof. Exact awarder cells remain unverified for all ten rows. Official NUC course source: [Administration and Management CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf); selected course/outcome locators and all descendant role checks remain open.

**Range disposition:** 0/10 rows closed to exact-offering + full course/outcome + active-link + descendant criteria. No shared source, mapping, code, seed, SQL, label or role record changed. Next tranche is rows 091–100 in `_012.md` (source-specific correction `_009.md` covers the earlier 071–080 counts; `_011.md` corrects 081–090 counts).

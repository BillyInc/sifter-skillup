# Append-only correction — rows 081–090 checkpoint 010

Audit date: 2026-09-26 (Africa/Lagos). This checkpoint corrects the prior increment's canonical counts and links after rereading the present worktree files directly. It leaves checkpoint `_010.md` preserved unchanged and makes no shared-data edits.

## Present canonical scope recount

The current `jamb_curriculum_scopes_2026-08-17.json` contains **180 selected course rows**, with 178 rows having a non-empty `learning_outcomes`/`skills_learned` field and two empty fields (CRD 307 and CRD 409 in row 090). The 178 total in the earlier report undercounts two row-087 Accounting records.

| Row | Identity | Current selected rows | Populated outcomes |
|---:|---|---:|---:|
| 081 | Securities and Investment | 15 | 15 |
| 082 | Management Studies | 31 | 31 |
| 083 | Entrepreneurship and Innovation | 21 | 21 |
| 084 | Transport Management | 0 | 0 |
| 085 | Tourism Studies | 26 | 26 |
| 086 | Employment and Human Resource Management | 0 | 0 |
| 087 | Accounting and Data Analytics | 18 | 18 |
| 088 | Finance and Financial Technology | 20 | 20 |
| 089 | Agribusiness and Economics | 25 | 25 |
| 090 | Cooperative Management | 24 | 22 |
| **Total** |  | **180** | **178** |

Row 087 has 18 course rows in the current scope, not 16. This is not enough to conclude scope correctness; the named data-analytics facet is still unrepresented by a separate component/course group.

## Present active map recount

Direct read of the current `jamb_domain_map.json` yields **83** active links, not 86; row 087 has 8 active links, not 11. Rows 084 and 086 are held (`review_required`, zero links), not marked unavailable.

| Row | Identity | Status | Active links |
|---:|---|---|---:|
| 081 | Securities and Investment | `ready_partial` | 11 |
| 082 | Management Studies | `ready_partial` | 14 |
| 083 | Entrepreneurship and Innovation | `ready_partial` | 7 |
| 084 | Transport Management | `review_required` | 0 |
| 085 | Tourism Studies | `ready_partial` | 6 |
| 086 | Employment and Human Resource Management | `review_required` | 0 |
| 087 | Accounting and Data Analytics | `ready_partial` | 8 |
| 088 | Finance and Financial Technology | `ready_partial` | 16 |
| 089 | Agribusiness and Economics | `ready_partial` | 8 |
| 090 | Cooperative Management | `ready_partial` | 13 |
| **Total** |  |  | **83** |

Withdraw the row-087 16-course/11-link figures and the 178-course/176-outcome and 86-current-link tranche claims from checkpoint `_010.md` and the earlier coordinator report. Retain the source/curriculum findings there as audit leads, but treat this present worktree recount as the controlling structural baseline for later verification.

## Specific implications

- Rows 084 and 086 have zero expanded course rows, despite full CCMAS parent identities and plausible subject-domain candidates. Their held states are not evidence of unavailability.
- Row 087's accounting scope has 18 courses; verify each named “Data Analytics” facet separately and do not use accounting as a proxy for data science/analytics without supported analytic courses/outcomes.
- Row 089 continues to declare only Economics in `component_refs`; no agribusiness course union is saved despite the JAMB title. This remains a confirmed scope gap.
- Row 090 has 24 selected records and two missing outcomes; local course joins cannot close those evidence gaps.

Checkpoint `_010.md` provides the row-level source and semantic review; use this correction for present selected-course counts and active status/link counts. Next new identity tranche is row 091 and should be checkpoint `_012.md`.

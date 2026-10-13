# CCMAS source-audit lane 4 — increment 002

## Scope

- Package: `law.json`
- Programme: `ICL` — Common and Islamic Law
- Official source: [NUC Law CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Law-ALL.pdf)
- Access date: 2026-09-29
- Compared in this increment: course ordinals 30–34 (`PUL 401` through `PPL 405`)
- Package denominator: **1 package / 145 course occurrences**
- Lane-4 cumulative comparison: **10/145 course occurrences; 135 remaining**
- Next cursor: `law.json::LAW/ICL::course_occurrence_after:PPL 405`

## Findings

The official table and detailed blocks confirm the five course identities. `PUL 401`, `PUL 402`, and `PPL 405` have matching workloads; `PPL 403` and `PPL 404` have local workload differences from the source. All five local `content_summary` values are empty even though the NUC detail blocks contain substantive course content. `PUL 401`, `PUL 402`, and `PPL 404` also contain extra or duplicated local outcomes beyond the exact source outcome lists. These are confirmed defects, not reasons to infer new curriculum.

No local CCMAS JSON, shared ledger, seed, SQL, JAMB mapping, downstream mapping, or UI file was edited. The checkpoint is append-only; repairs remain for the local reconciliation phase.

## Exact source locators

The NUC programme table is printed p.58. The detailed blocks are printed p.74 for `PUL 401`, `PUL 402`, and `PPL 403`, and p.75 for `PPL 404` and `PPL 405`. The official source records each course's title, units, status, lecture/practical hours, outcomes and content.

| Course | Source-backed result | Disposition |
|---|---|---|
| PUL 401 | Workload matches; content absent locally; local outcomes exceed the five source outcomes through a duplicate/variant | confirmed defect |
| PUL 402 | Workload matches; content absent locally; local outcomes exceed the four source outcomes through a duplicate | confirmed defect |
| PPL 403 | Source is 4/C/LH45/PH45; local is LH60/PH blank; two outcomes match; content absent locally | confirmed defect |
| PPL 404 | Source is 4/C/LH45/PH45 with three outcomes; local is LH60/PH blank with six duplicate/variant outcomes; content absent locally | confirmed defect |
| PPL 405 | Identity, workload and three outcomes match; content absent locally | confirmed defect |

The next increment starts at `PPL 406`.

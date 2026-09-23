# Full-population external-source enrichment - tranche 004

Date: 2026-09-21  
Scope: the 32-row selection saved in `full_population_tranche_004_selection_2026-09-21.json`, excluding D078 and every row ID in tranches 001-003.

## Completed tranche

| Measure | Count |
|---|---:|
| Rows searched | 32 |
| Item rows searched | 28 |
| Relationship rows searched | 4 |
| Linked | 11 |
| `review_required` | 21 |
| `genuinely_unavailable` | 0 |
| `no_link` | 0 |
| Remaining selected rows | 0 |

The append-only ledger records the stable row ID, exact context/type/key,
queries, inspected HTTPS candidates, authority, locator, evidence summary,
access date, decision and limitations for every selected row.

The 11 linked item records use exact item-specific destinations from UNECE,
OSHA, NIH, UNCTAD ASYCUDA, Apache, OpenStax, Microsoft Learn, Zoom and OECD.
Broad skills, jurisdiction-specific guidance, generic tool categories and
implementation-specific or incomplete destinations remain `review_required`.
No generic homepage was promoted as a verified item link.

The four relationship candidates are all role-level Computer Programmers rows
with missing typed target endpoints (C#, CSS, XML and HTML). O*NET role/tool
co-occurrence and official technology routes were inspected, but none states
both typed endpoints and the recorded same-context relationship. All four
remain `review_required`; no target or edge was inferred.

## Reconciliation

- Selection IDs: **32**.
- Ledger IDs: **32**.
- Missing from ledger: **0**.
- Unexpected ledger IDs: **0**.
- Duplicate ledger IDs: **0**.
- Records missing required search/evidence fields: **0**.
- D078 rows: **0**.
- Prior tranche overlap: **0**.

SQL, generated seed transport, catalogue, UI and browser-proof files were not
modified. This is an audit ledger only; no database or student-facing data was
changed.

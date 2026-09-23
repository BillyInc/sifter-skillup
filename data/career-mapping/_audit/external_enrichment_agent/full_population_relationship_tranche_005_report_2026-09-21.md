# Full-population relationship enrichment — tranche 005

Date: 2026-09-21  
Scope: eight unresolved D001 role-tool rows from the saved tranche-005 selection  
Selection: `full_population_relationship_tranche_005_selection_2026-09-21.json`  
Ledger: `full_population_relationship_tranche_005_search_ledger_2026-09-21.jsonl`

## Result

| Measure | Count |
|---|---:|
| Selected rows | 8 |
| Searched rows | 8 |
| Linked/promoted | 0 |
| Review required | 8 |
| Genuinely unavailable | 0 |
| Selection IDs missing from ledger | 0 |
| Unexpected ledger IDs | 0 |
| Duplicate ledger IDs | 0 |

The eight rows cover five tools under `D001 | Computer Programmers` and three
tools under `D001 | Web and Digital Interface Designers`:

- Computer Programmers: JavaScript, Linux, Microsoft Azure software, Microsoft
  Excel and Microsoft Office software.
- Web and Digital Interface Designers: Adobe Creative Cloud software, Adobe
  Photoshop and Atlassian JIRA.

## Evidence decision

O*NET was inspected for the exact occupation/tool association. The official
JavaScript, Linux, Azure, Excel, Office, Adobe and Atlassian sources were then
inspected for item-specific documentation and workflow evidence. These sources
confirm the named tools and, in some cases, generic workflows, but they do not
name a second typed endpoint in the local context and do not establish an exact
`builds_on`, `works_with` or other approved relationship. Role/tool co-occurrence
was not promoted into a relationship.

All eight rows therefore remain `review_required`. Their target type, target key,
target name and candidate relationship type remain null. No endpoint or relation
was inferred from name similarity, taxonomy co-occurrence, or separate tool
documentation. URLs, authorities, locators, access dates and limitations are
retained in the JSONL ledger.

## Guardrails

- The saved selection was read as the authoritative scope; no rows were added.
- The D078 exclusion and prior-tranche disjointness were preserved.
- No SQL, generated seed transport, catalogue, app code or browser proof was
  changed.
- No relationship was promoted and no student-facing state was altered.

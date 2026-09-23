# Full-population relationship enrichment — tranche 009 report

Date: 2026-09-21  
Selection: `full_population_relationship_tranche_009_selection_2026-09-21.json`  
Ledger: `full_population_relationship_tranche_009_search_ledger_2026-09-21.jsonl`

## Result

| Measure | Count |
|---|---:|
| Selected rows | 4 |
| Searched rows | 4 |
| Linked/promoted | 0 |
| Review required | 4 |
| Genuinely unavailable | 0 |
| Prior-tranche overlap | 0 |
| D078 rows | 0 |

## Evidence decision

O*NET provides exact role-to-software associations for Node.js/Blockchain Engineers, Git/Computer Programmers, and the two AWS entries/Computer Systems Engineers/Architects. Node.js, Git and AWS first-party documentation identifies the named source item. The local rows still have null target endpoints and null candidate relationship types. The sources do not establish both local endpoints with an exact approved edge, so all four remain `review_required`.

## Guardrails

- The selection checkpoint was saved before search.
- Selection IDs match the four ledger records exactly; overlap is zero.
- No target endpoint or candidate relationship type was populated.
- No SQL, generated seed transport, catalogue, app code, UI or browser-proof file was changed.

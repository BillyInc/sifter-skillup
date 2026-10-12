# D078 role-item research checkpoint — rows 041–072 complete

Date: 2026-10-09  
Lane: `replacement-001-072`  
Status: assigned slice complete; evidence remains review-only.

## Exact completion counts

- Requested range rows 041–072: **32 distinct priority pairs; 44 role-item occurrences; 0 assigned keys remaining**.
- Rows 041–050 were already present in `batch-005.json` / `.md` when resumed and were preserved unchanged: 10 pairs, 20 occurrences.
- Rows 051–060 are in `batch-006.json` / `.md`: 10 pairs, 12 occurrences.
- Rows 061–070 are in `batch-007.json` / `.md`: 10 pairs, 10 occurrences.
- Rows 071–072 are in `batch-008.json` / `.md`: 2 pairs, 2 occurrences.
- The full reserved lane manifest records 72/72 pairs and 143/143 occurrences researched. This is lane research completion, not student-display approval or completion of the larger D078 research programme.

## Last batch repair and validation

`batch-008.json` was finalized with the exact keys `biology|optional` and `biometrics|optional`, two pair records, two occurrences, no remaining assigned keys, and explicit review-only/no-canonical-edit flags. PowerShell `ConvertFrom-Json` parsed it successfully; validation also confirmed the expected keys, pair count and occurrence count. The matching `batch-008.md` was aligned with the JSON evidence rather than the stale earlier summary.

## Scope and boundaries retained

This is source-backed learning-content research for the reserved D078 role-item queue only. It does not perform role-fit/domain/area adjudication or change taxonomy, canonical role/domain/area mappings, API, SQL, common ledger or builder. Mathematician, Historian and Biometrician are excluded as D078 routes. The active area taxonomy remains the seven approved labels; “Social Behaviour and Interaction” remains bounded to social-science theory/research on behaviour and interaction among groups, institutions and communities. Clinical assessment, counselling, psychotherapy, diagnosis, psychological treatment and professional psychology licensure remain outside D078 and within the separate D064 boundary. Global and Nigeria-specific claims remain separately labelled; local examples do not narrow global scope.

## Final two pair dispositions in this lane

- `biology|optional` (Thanatology Researcher): conditional/specialist candidate only when a defined question needs biological evidence. The social-science death-studies route remains distinct from clinical/medical/forensic work. Nigeria context is limited to official vital-statistics data, bounded death-registration evidence and a single-community study; no general Nigerian biological or cultural claim is made. OpenLearn is a free social-death-studies resource, not biology training. No suitable free non-clinical biology resource was verified.
- `biometrics|optional` (Statistician): conditional/specialist and ambiguous between statistical biometry and identity biometrics. International and Nigerian sources establish both meanings, but not which exact source concept the role record intended. No exact task-specific free resource was verified; retain as non-displayable pending concept/profile resolution.

## Artifacts

- `batch-008.json` — finalized machine-readable final batch.
- `batch-008.md` — aligned human-readable batch note.
- `checkpoint-072.md` — this completion checkpoint.

Earlier batches were not edited. There are no further assigned keys in this reserved 001–072 lane, so no continuation is due within this lane.

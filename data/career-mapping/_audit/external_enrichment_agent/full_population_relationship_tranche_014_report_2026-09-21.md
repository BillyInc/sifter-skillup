# Full-population relationship tranche 014 report

Date: 2026-09-21  
Selected/searched: **4 / 4**  
Result: **0 linked, 4 review-required, 0 genuinely unavailable**

The tranche covered the next four pending unresolved non-D078 rows in
deterministic catalogue order. All are `role|D001|Information Technology
Project Managers` rows with a tool source endpoint and a null target endpoint:

| Tool | Evidence found | Decision |
|---|---|---|
| Amazon Web Services AWS software | O*NET occupation/tool association; AWS development/test documentation | `review_required` |
| Atlassian Confluence | O*NET occupation/tool association; Atlassian project-management documentation | `review_required` |
| Atlassian JIRA | O*NET occupation/tool association; Atlassian Jira documentation | `review_required` |
| Microsoft Azure software | O*NET occupation/tool association; Microsoft Azure Boards documentation | `review_required` |

O*NET confirms the exact role/tool associations. The first-party documents
identify the tools and their general project-management uses; Atlassian pages
also describe Confluence/Jira integration. None explicitly supplies the missing
typed target endpoint and canonical `builds_on`/`works_with` edge for the local
D001 relationship rows. No endpoint or relationship type was inferred from
co-occurrence, software categories, product capability, or general integration
language.

Exact counts:

- 4 selected; 4 searched; 4 ledger rows written.
- 0 promoted; 4 review-required; 0 unavailable.
- 0 prior-ledger overlaps; 0 D078 rows.
- 12 HTTPS evidence entries; 0 non-HTTPS entries.
- Current queue before append-only merge: 67 review-required, 2,238 pending,
  2,305 unresolved total.
- Expected queue after merging this ledger: 71 review-required, 2,234 pending,
  2,305 unresolved total.

The selection checkpoint was saved before searching. No catalogue, seed, app,
UI, SQL, migration, browser-proof file, or prior ledger was changed.

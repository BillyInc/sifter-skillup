# Review-state inventory — 2026-09-01

This is a repository-wide visibility report. A finding is not automatically an error: it is a state that must have a source, a disposition, or an explicit product boundary before final SQL generation. The preserved Nigerian CCMAS complement snapshot is excluded from current-state totals because it is a historical before-state; its completed disposition is counted in the reviewed-links artifact.

- JSON files scanned with findings: **4**
- Parse errors: **0**
- Total findings: **226**

## Token totals

| State token | Count |
|---|---:|
| `partial` | 220 |
| `not_established` | 6 |

## Files requiring disposition

| File | Findings | States |
|---|---:|---|
| `_audit\_domain_defs_table.json` | 110 | `partial`=110 |
| `_audit\cluster_map.json` | 110 | `partial`=110 |
| `nigerian_entity_review_ledger_2026-08-25.json` | 4 | `not_established`=4 |
| `nigerian_fresh_web_enrichment_2026-08-26.json` | 2 | `not_established`=2 |

## Disposition rule

Each finding must be classified as source-completed, explicitly out of scope, intentionally unavailable, or unresolved and excluded from certified seed output. The inventory must be rerun after the source and taxonomy reviews; it is not a substitute for those reviews.

## Reproducibility

```text
python data/career-mapping/_audit_review_state_inventory.py
```

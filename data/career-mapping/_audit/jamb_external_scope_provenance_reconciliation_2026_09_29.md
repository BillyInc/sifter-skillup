# JAMB external/related scope provenance reconciliation — 2026-09-29

Status: `applied_locally`

This pass hydrates only explicitly declared custom or related components from checked-in CCMAS/external source records. It does not infer curriculum from a title and does not add downstream links.

## Counts

- **targeted jamb rows:** 5
- **rows changed:** 6
- **course changes:** 42
- **related ccmas source rows:** 41
- **external source rows:** 0
- **combined scope materialized:** True

## Boundary

External rows remain source-dependent until the JAMB offering context and downstream links are separately reconciled. A source URL does not by itself promote a row to student-confirmed.

Machine-readable report: `jamb_external_scope_provenance_reconciliation_2026_09_29.json`

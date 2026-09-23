# Relationship backlog review queue — 2026-09-19

This is a compact, deterministic review checkpoint for the scaled contextual
catalogue. It does not read or rewrite the gzip transport and it does not
promote any relationship.

## Queue state

- Unresolved or explicitly not-established relationships: **2,305**.
- Deterministic review slice: **8** rows.
- Sort order: `context_level`, `context_key`, source item key/name, target item
  key/name, relationship type, then `data_state`.
- Current slice: eight role-owned tool rows under `D001|Blockchain Engineers`.
- Every queued row remains `relationship_type=not_established` and
  `data_state=not_established`; target fields are intentionally null.
- Every row retains source IDs, source references with URLs, source locators,
  confidence, verification date, and an evidence limitation explaining why
  role evidence is not a cross-type relationship.

The machine-readable slice is
[`relationship_backlog_inventory.json`](relationship_backlog_inventory.json).
It is intentionally a review queue, not student-facing data and not a seed
replacement. A reviewer may promote a row only after independent evidence
establishes the exact relationship and the source-backed generator is rerun.

## Queued rows

| Context | Source item | Current state | Locator |
|---|---|---|---|
| `D001\|Blockchain Engineers` | Amazon Web Services AWS software | `not_established` | `2.E.6.f` |
| `D001\|Blockchain Engineers` | C# | `not_established` | `2.E.7.e` |
| `D001\|Blockchain Engineers` | Docker | `not_established` | `2.E.10.a` |
| `D001\|Blockchain Engineers` | Git | `not_established` | `2.E.7.e` |
| `D001\|Blockchain Engineers` | Go | `not_established` | `2.E.7.e` |
| `D001\|Blockchain Engineers` | JavaScript | `not_established` | `2.E.7.e` |
| `D001\|Blockchain Engineers` | Kubernetes | `not_established` | `2.E.10.a` |
| `D001\|Blockchain Engineers` | Microsoft Azure software | `not_established` | `2.E.6.f` |

The full unresolved backlog remains deferred for source-by-source review; this
checkpoint deliberately does not infer relationships from names, co-occurrence,
role frequency, or shared occupation-taxonomy locators.


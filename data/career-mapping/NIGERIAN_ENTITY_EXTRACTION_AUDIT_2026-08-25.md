# Nigerian entity-level extraction audit

This generated audit is the population gate. It is intentionally separate from the career seed. A context-only or no-counterpart row is a reviewed evidence state, not an invitation to infer local skills from global data.

## Current counts

| Entity | Total | Item-level Nigerian evidence | Context only | No direct local counterpart |
|---|---:|---:|---:|---:|
| domain | 160 | 160 | 0 | 0 |
| subgroup | 486 | 485 | 0 | 1 |
| role | 5,050 | 2,434 | 0 | 2,616 |

## Field-level review counts

These are fields without item-level Nigerian evidence in the current audit. A blank certification or licence field is not treated as proof that a credential is required; it is a review signal.

| Entity | Without skills | Without tools | Without competencies | Without certifications | Without regulatory requirements | Missing provenance | Manual review | With local demand signal |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| domain | 0 | 1 | 0 | 1 | 1 | 0 | 0 | 41 |
| subgroup | 1 | 41 | 52 | 106 | 486 | 0 | 1 | 28 |
| role | 2,616 | 2,842 | 2,616 | 2,970 | 3,399 | 0 | 2,616 | 572 |

## Gate interpretation

Every listed entity has a row. `source_backed` rows contain extracted skills, tools, competencies, certifications or regulatory requirements with source provenance. `context_only` and `no_direct_local_counterpart` rows remain visible with an explicit reviewed disposition and may carry a follow-up trigger; they must not be treated as absence claims. Global and remote evidence is retained inside each row as a separate layer. For domains and subgroups, the global taxonomy may be explicitly marked as derived from constituent role records; it is not Nigerian evidence. Every row also contains an evidence-limited guidance order and an explicit prerequisite status.

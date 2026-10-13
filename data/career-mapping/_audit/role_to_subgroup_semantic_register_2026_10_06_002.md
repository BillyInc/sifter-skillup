# Role → subgroup semantic audit register — 2026-10-06 run 002

This append-only register audits the current active role→subgroup paths separately from role→domain review. The subgroup code selects the path; it is not evidence of fit.

## Coverage

- Merged role records inspected: **3,919**.
- Active subgroup paths: **394**.
- Active roles with an active subgroup path audited: **2,405**.
- Active roles without an active subgroup path (out of scope for this register): **1,503**.

## Dispositions

- Deterministic exclusions: **0**.
- Supported candidates requiring final semantic sign-off: **460**.
- Conditional/insufficient-evidence rows: **1,945**.

A deterministic exclusion is emitted only when the existing role evidence explicitly rejects the parent domain. No role is removed merely because its ISCO group differs from a subgroup label, and no lexical match is treated as final sign-off.

## Domain-level edge cases

The current files contain **73** domains with no visible subgroup, not 72. The register records the current state from `domain_structure.json`; the difference should not be silently normalised.
It also contains **17** domains with no active role mapping.

Route dispositions:
- `needs_role_enrichment_before_subgroup_decision`: **1** domain(s).
- `needs_supported_specialization_layer`: **22** domain(s).
- `unresolved_ownership_and_role_enrichment`: **16** domain(s).
- `unresolved_ownership_or_source_review`: **34** domain(s).

Exact zero-visible-subgroup domain IDs:

D001, D002, D003, D004, D007, D016, D017, D018, D019, D020, D021, D023, D024, D030, D037, D038, D039, D040, D041, D043, D045, D049, D050, D052, D053, D054, D055, D056, D068, D071, D072, D075, D076, D079, D080, D082, D083, D084, D085, D087, D088, D089, D090, D091, D093, D094, D097, D100, D101, D104, D105, D106, D108, D109, D110, D112, D113, D114, D115, D116, D118, D119, D123, D124, D126, D132, D142, D144, D148, D153, D157, D159, D162

Exact zero-active-role domain IDs:

D037, D038, D039, D040, D045, D049, D050, D052, D053, D054, D071, D075, D076, D079, D080, D153, D157

Unresolved ownership/source-review domain IDs:

D003, D004, D007, D021, D023, D024, D030, D037, D038, D039, D040, D041, D043, D045, D049, D050, D052, D053, D054, D055, D056, D068, D072, D075, D076, D079, D080, D082, D083, D084, D100, D101, D104, D105, D106, D108, D109, D110, D112, D116, D124, D126, D132, D142, D144, D148, D153, D157, D159, D162

Each domain entry in the JSON carries its scope, current subgroup records, active role keys, domain-review status, authoritative global source records when available, and the reason for its disposition. No Nigerian context is used in this pass.

## Audit entry format

Each entry records the exact role key, subgroup scope, role task/evidence text, source references, anchor terms, disposition, and whether ISCO was used as fit proof (always false).

Full machine-readable register: `role_to_subgroup_semantic_register_2026_10_06_002.json`.

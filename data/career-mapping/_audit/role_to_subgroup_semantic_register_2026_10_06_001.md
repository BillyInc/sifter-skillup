# Role → subgroup semantic audit register — 2026-10-06 run 001

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

## Audit entry format

Each entry records the exact role key, subgroup scope, role task/evidence text, source references, anchor terms, disposition, and whether ISCO was used as fit proof (always false).

Full machine-readable register: `role_to_subgroup_semantic_register_2026_10_06_001.json`.

# Role-to-domain review decision apply — 2026-10-07

Mode: **APPLIED**.

Review decisions loaded: **3899**.
Current role rows: **3967**.
Exact decisions matched to current rows: **3899**.
Stale decisions not recreated: **0**.
Canonical row changes: **3902**.
Supported links reactivated after source review: **0**.

## Review dispositions

- `conditional`: **1012**
- `supported`: **2338**
- `unresolved`: **11**
- `unsupported`: **538**

## Guards

- Decisions were matched by exact `domain_id|role_name` only; duplicate current rows were updated in place and not deleted.
- Late numbered increments override earlier unresolved lane entries.
- Stale review keys were reported and not recreated.
- Conditional and unresolved rows remain explicit; they were not promoted.
- Unsupported links exclude only the exact parent-domain path; occupation records remain.
- No domain structure or subgroup catalogue file was edited.

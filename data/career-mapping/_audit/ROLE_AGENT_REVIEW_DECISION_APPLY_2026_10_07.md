# Role-agent review decision apply — 2026-10-07

Mode: **APPLIED**.

This pass matches agent decisions by exact `domain_id|role_name`. It does not infer a role route from title, ISCO/ESCO membership or existing subgroup membership.

- Conditional parent decisions loaded: **1002**
- Area-review decisions loaded: **3255**
- Canonical changes: **9**
- Parent mismatches/stale decisions: **0**
- Area conflicts/stale decisions: **0**

Review-required rows remain explicit. Only exact source-backed supported area routes with a supported parent-domain gate are promoted.

Machine-readable report: `_audit/ROLE_AGENT_REVIEW_DECISION_APPLY_2026_10_07.json`


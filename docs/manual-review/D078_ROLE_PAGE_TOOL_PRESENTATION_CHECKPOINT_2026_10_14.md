# D078 role-page tool and learning-item presentation checkpoint

## Scope

Role page only: `RoleDetailScreen` and its directly owned tests. Preserve exact role ownership. Do not edit the learning graph, data artifacts, shared `ContextualItemList`, other screens, or SQL. Do not stage or commit.

## Initial checkpoint — 2026-10-14

The reported gap is that a role page may not expose accessible, reviewed tools and the rest of its role-owned learning task set with enough role-specific context. Prior inspection notes indicate the screen has a `ContextualItemList` for `role.contextItems`, while the compact tool area filters legacy role-tool records against student-facing evidence. This may explain an empty tool area, but must be verified against the current checkout before changing behavior.

The repair must not make raw legacy tool aggregates visible. Each displayed role-owned item must retain its source-backed identity and explain what it is, how it is used in this role, why it is relevant, its route relationships/prerequisites/alternatives, limitations, and an appropriate learning link. If evidence is missing, keep the item undisplayed and report the exact gap rather than infer role ownership.

## Work log

- Initial checkpoint written before code inspection, as requested.
- Current code/test audit: pending.
- Repairs and focused test results: pending.

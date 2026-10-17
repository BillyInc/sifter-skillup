# D078 Role-Level Tools and Learning Items — Checkpoint (2026-10-14)

## Initial status

Work started in the assigned role-level display lane. Inspected `RoleDetailScreen.tsx`, the role types in `src/types/career.ts`, and role/context-item response references in `backend/routes/career_routes.py` and tests.

## First finding

The active `RoleBody` already renders role-owned `contextItems` in two learning-path bands, and `ContextualItemList` supports all item types—including tools, methods and knowledge—with expandable meaning, role use, links, limitations and relationships. This is the intended rich display path. The old `role.tools` array is not rendered by the active `RoleBody`; it is a legacy/shallow path and must not be used to bypass the contextual-item contract.

The client role endpoint queries `career_context_items` using the exact `context_level=role` and `context_key=<role_key>`, and the server requires approved claim evidence, an accessed HTTPS learning link and matching role ownership. The D078 master reconciliation carries 173 role-item placement records (171 approved, 2 unapproved), but the D078 runtime content builder currently reports only domain and area items (52 domain + 138 area) and does not materialize role items from that reconciliation. Therefore those 171 decisions do not by themselves populate the role screen. Role availability in the D078 role list also depends on at least one approved role-owned context item; the role endpoint returns “not available” when none is present. This is an upstream persistence/materialization gap, not a missing role-card component. No graph/area files are being edited in this lane.

## Incremental implementation

- Added `src/lib/roleLearningItems.ts` to enforce exact role ownership, source-backed state, approved claim/link contract, and typed-key deduplication at the client boundary.
- Updated `RoleDetailScreen.tsx` to use that selector before rendering the existing shared-foundation and role-option item lists.
- Added `src/lib/roleLearningItems.test.ts` to cover tool/method/knowledge/skill/competency/certification visibility, exclusion of non-approved or non-role-owned rows, and typed deduplication.
- The focused Jest invocation stalled without reporting test output and was interrupted; it is not counted as passing. Retry with the direct local Jest executable and a bounded timeout.

## Scope and safety

- This checkpoint records a preliminary finding, not a final diagnosis.
- No area/domain graph or taxonomy data is being changed in this lane.
- Preserve existing dirty work; no staging, commits, or SQL application.
- Student display must remain limited to role-owned, reviewed/source-backed data; do not promote legacy arrays or unsupported items.

## Next

Retry the focused test using the local Jest binary, type-check the role page, and inspect the role endpoint’s tool/resource serialization for any remaining role-only omissions. Then update this checkpoint with verified results. Keep the separate area-role graph problem reported, not modified, in this lane.

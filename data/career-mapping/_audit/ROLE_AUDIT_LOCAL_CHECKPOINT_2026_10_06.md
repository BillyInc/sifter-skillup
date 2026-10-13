# Local role → subgroup/area-of-specialization audit checkpoint — 2026-10-06

This checkpoint records the current local state while the separate role-enrichment lanes run. In this repository, **subgroup = area of specialization = area of practice**. No separate specialization layer is being invented.

## Current role-file snapshot

The three role sources contain **3,967 merged role records**, of which **3,444 are active student-path records**. Active records currently carry:

- `supported_candidate`: **533**
- `conditional_review_required`: **859**
- `direct_domain_role`: **172**
- `semantic_reassigned`: **64**
- blank status pending a route/status decision: **1,869**

The local deterministic pass has attached auditable evidence metadata to **513 active records**. This is evidence metadata, not external academic sign-off.

The latest regenerated semantic audit (`local-role-final-recheck-2026-10-06`) assesses **1,784 active roles that sit on an active area-of-specialization path**: **457 supported candidates** and **1,327 conditional/insufficient-evidence rows**. This audit population is not identical to the role-file status count because it includes roles whose status field is still blank and excludes active roles without an active area path. Those roles are kept separate pending route/enrichment decisions.

## Local guardrails

- A role is not accepted merely because it belongs to an ISCO group or currently appears under a subgroup.
- A supported candidate requires the role's own source-backed task/skill text to produce a unique match to a reconciled area boundary, with the parent domain not rejected.
- Ambiguous roles remain conditional or review-only.
- Nigerian training, policy or ecosystem evidence is not treated as proof that a role has Nigerian job demand.
- Global occupational evidence and Nigerian context are recorded separately.

## Parallel enrichment lanes

The three agents are researching role additions for D001–D056, D057–D112 and D113–D168. Their outputs must be append-only lane JSON/Markdown checkpoints with exact titles, duplicate/alias checks, task/domain fit, global sources, Nigerian sources, access dates and evidence limits. They must not edit canonical role files directly.

## Current lane state

The D001–D056 replacement worker could not be started in this runtime after the Harvey session exhausted its agent limit, so local work has now taken over that lane. The fresh D001–D056 checkpoint contains **40** candidate records across **13** sparse/zero-role domains: **28 add candidates** and **12 review-only cases**. Existing append-only artifacts are also present for D057–D112, including batch 2, and D113–D168; all remain recommendations until local duplicate, title, task-scope, parent-domain and source gates pass.

Latest local semantic recheck (`local-role-final-recheck-2026-10-06`): **1,784** active roles on active area-of-specialization paths, with **457 supported candidates** and **1,327 conditional/insufficient-evidence rows**; **1,657** active roles have no active area path. These are audit populations, not a claim that every remaining row is wrong; direct-domain routes and no-area domains remain separate.

## Source of truth

- Current role sources: `role_library_v3_cleaned.json`, `thin_domain_role_overlays.json`, `emerging_role_overlays.json`.
- Parent area reconciliation: `specialization_lanes_2026_10_05/STEP1_RECONCILIATION_2026_10_06/global_step1_specialization_reconciliation_2026_10_06.json`.
- Deterministic local register: `deterministic_role_area_fit_reconciliation_2026_10_06.json`.
- The remaining conditional rows are not declared complete until the local evidence gate or a later source-backed enrichment resolves them.

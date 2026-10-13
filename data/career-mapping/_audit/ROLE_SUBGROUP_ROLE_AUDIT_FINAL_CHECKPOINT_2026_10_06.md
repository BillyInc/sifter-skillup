# Subgroup/area-of-practice and role audit checkpoint — 2026-10-06

This is the current local checkpoint for the domain → subgroup/area-of-specialization
→ role audit. It records what was applied and what remains explicitly
conditional; it is not a claim of academic sign-off.

## Scope and current catalogue

- Domains assessed: **168**.
- Subgroup records: **557**; active subgroup paths: **311**.
- Active role mappings: **3,441**.
- Active roles on an active subgroup path: **1,811**.
- Active roles without an active subgroup path: **1,630**. These remain valid
  candidates for a direct domain → role route where the domain gate passes.

## Applied role/domain and role/subgroup repairs

The parent-domain gate was applied before subgroup fitting. ISCO membership and
current subgroup membership were not treated as proof of fit.

- Role→domain reconciliation decisions: **543**.
  - remove-link-only: **404**;
  - exact reclassification: **75**;
  - preserve excluded: **25**;
  - retain supported: **1**;
  - stale source with no active delta: **38**.
- Role→subgroup route repairs: **179**.
  - reassign route: **60**;
  - remove route: **119**;
  - skipped because the target subgroup was inactive: **4**.
- Role-area audit metadata applied: **1,905** in cumulative local passes.
  - supported candidate: **592**;
  - conditional review required: **800** across all role records (**778** active, non-excluded rows).
  - The later deterministic pass also reads `scope` and `route_boundary` fields,
    which are used by the D113-D168 reconciliation instead of `boundary`.

The conditional rows were intentionally not forced into an area. A role that
fits an area but fails the parent-domain gate remains excluded from that route;
a role with insufficient task evidence remains explicitly review-required.

## Current role-fit statuses

- `semantic_reassigned`: **64**;
- `direct_domain_role`: **119**;
- `supported_candidate`: **592**;
- `conditional_review_required`: **800** (**778** active, non-excluded);
- no status: **2,392**, corresponding to records without an active subgroup
  route rather than an unclassified subgroup assignment.

## Computational audit

- Method groups assessed: **39**.
- Method groups with explicit role links: **1**.
- Method groups without explicit role links resolved to existing domain or
  specialization coverage: **38**.
- Source records: **57**.
- External candidate classes resolved: **7**.
- Externally supported alias resolutions: **1**.
- New role titles proposed: **0**.
- Canonical taxonomy changes: **0**.
- Canonical role-file changes from the computational pass: **0**.
- Manifest conflicts: **0**.

## Verification

The role/domain, subgroup, taxonomy, and computational test suite passed:

```text
52 passed
```

The three Nigerian-context ledgers have now been merged into the existing
domain records as an additive `nigerian_area_context` overlay. It carries
domain-scoped records as domain-scoped evidence and attaches area-scoped
records only by the exact global area label. No global area label, subgroup
label, role, or route was changed. The application report is
`nigerian_area_context_domain_structure_apply_2026_10_06.json`.

## Remaining queue

The remaining **778 active conditional role→area cases** are the unresolved
semantic review queue (**800** including 22 excluded/non-student-path rows).
The local deterministic matcher has now exhausted its safe rules: the latest
pass inspected all 778 active rows and produced **0** additional changes.
These rows cannot be safely auto-fixed from title, ISCO membership, or current
subgroup membership alone. The applied data now makes that state explicit and
auditable rather than silently presenting those routes as correct. The
separate role-enrichment agents are collecting source-backed additions and
aliases in lane-only checkpoints; they must not edit the shared canonical role
files.

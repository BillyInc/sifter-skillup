# Workstream C — D113–D168 role reconciliation

Status: **completed as a disjoint proposal/reconciliation pass**. Canonical role files, area definitions and the area-source reconciler were not edited.

## Scope and evidence

- Audited all 56 domains D113–D168.
- Compared raw `role_library_v3.json` with the active cleaned/overlay role files.
- Parent fit uses dated task/work-activity decisions and explicit domain scope.
- Role→area fit uses recorded area boundaries, task evidence, source provenance and negative checks.
- Titles, ISCO/ESCO membership and existing subgroup membership were not used as proof.

## Counts

- Raw rows: **768**; raw unique keys: **767**.
- Raw source-backed keys absent from active canonical files: **316**.
- Canonical-only keys not present in raw: **321**.
- Raw duplicate keys: **1**; canonical duplicate keys: **1**.
- Classifications: **{'conditional': 139, 'duplicate': 2, 'external-review': 529, 'supported': 38, 'unsupported': 59}**.

## Classification meaning

Supported means the parent task fit and current area/direct route pass the evidence gate. Secondary means a supported non-primary route is explicitly retained. Conditional means scope-dependent. Unsupported preserves a negative task/domain result. Duplicate marks exact-key source duplication. External-review marks dropped roles or unresolved task/area evidence.

## Checkpoint and proposals

- `D113_D168_role_reconciliation_checkpoint.json` — final machine-readable checkpoint.
- `D113_D168_role_reconciliation.json` — full decisions, provenance, boundaries and raw/canonical comparison.
- `D113_D168_role_reconciliation_proposals.json` — non-mutating proposals.
- `checkpoint_D113.json` through `checkpoint_D168.json` — incremental domain checkpoints.

The D113–D168 assigned domain range is exhausted; no canonical changes were made.

# Workstream A — D001–D056 role/domain and role/area reconciliation

Generated 2026-10-07. This is an audit-only proposal artifact; canonical role, domain, overlay, and area files were not edited.

## Decision policy

A role is assessed from source-backed task/work-activity evidence, the parent-domain definition, and the area boundary. Role title, ISCO group, subgroup membership, or an existing relationship alone is not proof. Existing reviewed routes are preserved as evidence but are not promoted when their own status is conditional or unsupported. Multiple routes remain explicit. Raw roles absent from the current canonical union are listed for review and are not reintroduced automatically.

## Counts

- Raw rows in scope: 2109; unique raw role keys: 2108.
- Current canonical/overlay rows in scope: 1790; unique current keys: 1788.
- Union role keys assessed: 2721.
- Raw duplicate rows: 1.
- Source-backed raw keys absent from the current canonical union: 810.
- Proposed route dispositions: {"conditional": 757, "duplicate": 1, "external-review": 693, "secondary": 0, "supported": 978, "unsupported": 293}.
- Parent-domain dispositions: {"conditional": 612, "external-review": 386, "secondary": 0, "supported": 1430, "unsupported": 293}.
- Area-of-specialization dispositions: {"conditional": 757, "external-review": 986, "secondary": 0, "supported": 978, "unsupported": 0}.

## Checkpoints

- D001_D014: 383 union role keys; 0 dropped raw source-backed keys; proposals {"conditional": 48, "external-review": 77, "secondary": 0, "supported": 200, "unsupported": 58}; status `complete`.
- D015_D028: 552 union role keys; 0 dropped raw source-backed keys; proposals {"conditional": 86, "external-review": 81, "secondary": 0, "supported": 342, "unsupported": 43}; status `complete`.
- D029_D042: 1063 union role keys; 301 dropped raw source-backed keys; proposals {"conditional": 322, "external-review": 271, "secondary": 0, "supported": 349, "unsupported": 121}; status `complete`.
- D043_D056: 723 union role keys; 509 dropped raw source-backed keys; proposals {"conditional": 301, "external-review": 264, "secondary": 0, "supported": 87, "unsupported": 71}; status `complete`.

## Files

- `d001_d056_role_reconciliation_proposals.json` contains every union role key, duplicate raw rows, and dropped source-backed raw roles.
- `d001_d056_role_reconciliation_manifest.json` contains source hashes, policy, and counts.
- `d001_d056_role_reconciliation_checkpoint.md` is this human-readable checkpoint.
- `reconcile_d001_d056_role_parent_area_fit.py` reproduces the outputs without mutating canonical data.

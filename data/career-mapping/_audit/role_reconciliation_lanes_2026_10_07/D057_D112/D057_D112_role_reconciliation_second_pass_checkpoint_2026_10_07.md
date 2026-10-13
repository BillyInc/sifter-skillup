# D057–D112 role reconciliation — targeted second pass

Generated/accessed: 2026-10-07. Proposal-only; no canonical role/area/domain/overlay file was edited.

## Scope and counts

- Non-excluded canonical residual exact keys dispositioned: **865**.
- Raw source roles absent from active canonical data, separately dispositioned as candidates: **357**.
- Total unique exact keys in this targeted pass: **1,222**.
- Canonical dispositions: `{"conditional": 855, "external-review": 10}`.
- Raw-omitted candidate dispositions: `{"conditional": 287, "duplicate": 8, "unsupported": 62}`.
- Parent-domain dispositions: `{"conditional": 173, "external-review": 290, "supported": 696, "unsupported": 63}`.
- Exact ESCO concept sources matched: **814/865 canonical**, **212/357 raw-omitted**.

## Evidence and decision policy

For ESCO roles, the exact local concept URI, preferred label, definition, and skill relations are matched by ESCO code plus label and cited to the European Commission classification. O*NET work-profile activities and source links are included where available. The current domain and area boundaries are checked separately. ESCO/ISCO classifications establish occupational identity and task context, not automatic fit to this product's domain/area taxonomy.

Conditional rows have a concrete remit. Direct domain→role is used where parent fit is supported but no area route is independently established. Secondary routes are preserved rather than replacing the primary route. Unsupported rows retain explicit parent/boundary contradictions. External-review is reserved for an exact-source or task/route evidence gap, with a record-specific request in JSON.

## Authoritative external references checked

- European Commission ESCO Occupations page: https://esco.ec.europa.eu/en/classification/occupation_main (official occupation concepts include definitions/scope notes and occupational profiles; accessed 2026-10-07).
- European Commission ESCO Download page: https://esco.ec.europa.eu/en/use-esco/download (official versioned classification datasets; v1.2.1 last updated 2025-12-10; accessed 2026-10-07).
- The local ESCO v1.2.1 dataset provides exact concept URIs and definitions for most residual ESCO records. Individual exact URIs and role locators are stored per record in the JSON.

## Checkpoint and files

- Full proposal ledger: `data/career-mapping/_audit/role_reconciliation_lanes_2026_10_07/D057_D112/D057_D112_role_reconciliation_second_pass_2026_10_07.json`
- Machine checkpoint: `data/career-mapping/_audit/role_reconciliation_lanes_2026_10_07/D057_D112/D057_D112_role_reconciliation_second_pass_checkpoint_2026_10_07.json`
- Machine manifest: `data/career-mapping/_audit/role_reconciliation_lanes_2026_10_07/D057_D112/D057_D112_role_reconciliation_second_pass_manifest_2026_10_07.json`
- Reproducible script: `data/career-mapping/_audit/role_reconciliation_lanes_2026_10_07/D057_D112/reconcile_d057_d112_role_domain_area_second_pass.py`

The checkpoint lists every remaining external-review exact key and its per-record remit. Those entries are not silently promoted or discarded.

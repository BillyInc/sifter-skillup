# Naming-lane verification and parse-repair checkpoint — 2026-09-25

## Naming source verification

- Current `domain_meta.json` and `domain_structure.json` each parse with 168
  domain IDs. The active subgroup inventory parses to 557 domain/ISCO entries.
- The current D129 subgroup keys and labels are `01` Commissioned Armed Forces
  Officers, `02` Non-commissioned Armed Forces Officers, and `03` Armed Forces
  Occupations, Other Ranks. D143/21 is absent. These match the resolved naming
  checkpoint and preserve its documented 558-to-557 reconciliation.
- The 168 source naming-audit rows include a baseline `current_display_name`
  field; some approved label refinements intentionally differ from that first
  audit snapshot. Therefore the raw snapshot is not treated as the final-name
  oracle. The applied-decision and final-verification checkpoints remain the
  reference for the reviewed refinements.

## Role-source parse repair

The malformed line at 48043 was the `role_name` value in the D052 / role-number
16 object. The matching current `role_library_v3.json` source record and the
same-key `HEAD` record both identify it as `geological engineer`. Restored only
that one string literal. Domain ID, domain name, role number, membership,
skills, and all other fields were left as-is.

Whole-file validation then found a separate malformed splice at line 48117 in
the `Frame makers` description: the text ends mid-string and is immediately
followed by fields from another record (`source`, score, and occupation code).
That splice is not repaired here; the precise source-record boundary and exact
restoration need a separate authorized review.

## Student display labels and gate status

The role file cannot yet be parsed end-to-end, so a complete structured audit
of its display labels and any materializer/seed gate is blocked. A read-only
text scan finds 20 distinct `(domain_id, role_name, student_display_name)`
tuples (all 20 identity keys exist in the current parseable
`role_library_v3.json`; the two reviewed labels Doctors' Surgery Assistant and
Special-Interest Group Representative are present). This does not reconcile
to the earlier checkpoint's claim of 19 source-backed rows; do not silently
normalize or delete a label. Resolve the count and source-evidence discrepancy
after the cleaned role JSON parses.

Canonical seed regeneration and downstream role gates cannot run safely while
`role_library_v3_cleaned.json` remains invalid JSON. No generator, seed, or
role-materialization gate was run. No role identity, membership, or additional
role label was changed.

## Exact changes in this lane

- `data/career-mapping/role_library_v3_cleaned.json`: one malformed
  `role_name` literal restored from the matching source record.
- This checkpoint: appended verification, remaining blocker, and gate status.

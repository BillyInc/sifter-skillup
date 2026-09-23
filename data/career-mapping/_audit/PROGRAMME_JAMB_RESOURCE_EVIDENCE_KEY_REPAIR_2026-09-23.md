# JAMB resource-ledger identity-key repair — 2026-09-23

Append-only validation of the corrected all-JAMB resource ledger. The earlier
slug-only revision exposed four case-distinct source-name collisions
(`ANTHROPOLOGY`/`Anthropology`, `LIBRARY AND INFORMATION SCIENCE`/`Library and
Information Science`, `LIBRARY SCIENCE`/`Library Science`, and
`METEOROLOGY`/`Meteorology`).

The `corrected_003` revision qualifies each key with a stable SHA-256 suffix.
The resulting ledger contains **420 rows, 420 exact canonical names and 420
unique subject IDs**, with no duplicate IDs. It retains **11/11 anchor-absent
rows as available**, **420/420 available resource packages**, and **0
genuinely unavailable** rows.

No prior batch was overwritten. No SQL, seed, frontend, live database or
browser-proof artifact was changed.

Authoritative artifacts:

- `programme_jamb_resource_evidence_2026-09-23_corrected_003_manifest.json`
- `programme_jamb_resource_evidence_2026-09-23_corrected_003_jamb_batch-*.jsonl`

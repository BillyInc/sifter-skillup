# Programme/JAMB resource-evidence checkpoint 2026-09-23-004

Date: 2026-09-23 (Africa/Lagos)

## Run result

The corrected all-420 audit was rerun successfully:

```powershell
python data/career-mapping/_audit/audit_programme_jamb_resource_evidence_2026-09-23_003.py
```

The script now loads and validates
`PROGRAMME_JAMB_SCOPE_POLICY_CORRECTION_2026-09-23.json`, and its append-only
writer accepts an existing artifact only when the content is byte-for-byte
identical. It does not overwrite an existing batch, manifest, report, or
checkpoint.

## Verified counts

| Check | Result |
| --- | ---: |
| Canonical JAMB identity rows | 420 |
| Exact unique canonical JAMB names | 420 |
| JSONL batches | 21 |
| Rows per batch | 20 |
| CCMAS-anchor-absent occurrences | 11 |
| Anchor-absent rows with `available` classification | 11 |
| Available resource packages | 420 |
| Review-required resource packages | 0 |
| `genuinely_unavailable` rows | 0 |

The 11 anchor-absent occurrences are therefore not classified as
`genuinely_unavailable` solely because the optional CCMAS anchor is absent.
They retain the enclosing JAMB identity and external learning-resource
evidence. The policy denominator remains 420 JAMB identities; 237 CCMAS
packages remain context-only complements.

## Append-only outputs

- `programme_jamb_resource_evidence_2026-09-23_corrected_002_jamb_batch-001.jsonl` through `-021.jsonl`
- `programme_jamb_resource_evidence_2026-09-23_corrected_002_manifest.json`
- `programme_jamb_resource_evidence_2026-09-23_corrected_002_report.md`
- `programme_jamb_resource_evidence_2026-09-23_corrected_002_checkpoint.json`

No SQL, frontend, backend, live database, or browser-proof artifact was
edited or applied.

## Scope reconciliation note

The canonical source intentionally retains four case-distinct JAMB identities:
`ANTHROPOLOGY`/`Anthropology`, `LIBRARY SCIENCE`/`Library Science`, `LIBRARY
AND INFORMATION SCIENCE`/`Library and Information Science`, and
`METEOROLOGY`/`Meteorology`. They are four separate exact source identities,
so the resource scope remains 420/420. Their slug-derived `subject_id` values
collide case-insensitively; this is recorded in the separate append-only
reconciliation artifact and does not alter or overwrite the resource batches.

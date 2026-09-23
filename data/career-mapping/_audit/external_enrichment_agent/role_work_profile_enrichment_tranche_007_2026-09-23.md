# Role work-profile enrichment tranche 007 — 2026-09-23

Audit-only append-only enrichment for the 119-role missing work-profile lane.

## Counts

- Exact O*NET roles selected: **20**.
- Exact official identity matches: **20**.
- Source-backed profile candidates with extracted fields: **20**.
- Canonical work-profile rows added: **0**.
- Candidates retained review-required: **20**.
- ESCO-only roles retained review-only: **99**.
- Canonical work-profile rows still absent: **119**.
- Roles without a source-backed profile candidate: **99**.
- Genuinely unavailable roles proven: **0**.

## Disposition

The 20 exact O*NET roles now have audit-only candidate work-profile fields from the vendored O*NET 31.0 archive, with official summary URLs, local archive locators, checksums and access dates. They remain review-required because O*NET is a global/US proxy and does not establish Nigerian demand or local preparation requirements.

The remaining 99 ESCO-only roles retain their prior source-backed identity records and review-only state. No ESCO title was mapped to O*NET by name similarity, and no Nigerian mapping was invented.

## Files

- `role_work_profile_enrichment_tranche_007_2026-09-23.json` — complete candidate tranche and exact counts.
- `role_work_profile_enrichment_append_only_2026-09-23.jsonl` — one append-only candidate record per exact O*NET role.
- `role_work_profile_enrichment_tranche_007_checkpoint_2026-09-23.json` — machine-readable checkpoint.
- `role_work_profile_enrichment_tranche_007_checkpoint_2026-09-23.md` — human-readable checkpoint.
- `role_work_profile_enrichment_tranche_007_2026-09-23.py` — reproducible local builder.

No SQL, live database, frontend, browser proof, generated seed, or prior tranche artifact was changed.

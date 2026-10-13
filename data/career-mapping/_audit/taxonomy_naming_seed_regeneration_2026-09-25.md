# Taxonomy naming seed regeneration — 2026-09-25

## Result

Regenerated the career seed from the current checked-in working-tree sources and wrote a separate transport directory. The earlier `seed_career_v2_2026-09-25_taxonomy_names_parts_gz/` was left untouched.

- Source inputs: `domain_meta.json`, `domain_structure.json`, `role_library_v3_cleaned.json`, and the other canonical inputs consumed by `_gen_career_seed.py`.
- Generated SQL: temporary file `seed_career_v2_taxonomy_names_verified.sql` (668,307,146 bytes); it is not stored in the repository.
- Transport: `backend/seed_career_v2_2026-09-25_taxonomy_names_verified_parts_gz/` (23 numbered compressed SQL parts plus manifest).
- Generator totals: 160 domains, 545 subgroups, 5,093 roles, 5,090 work profiles, and 48,181 tools. Other seed totals are recorded in the generator output; these are generated-row counts, not a live database state.
- Integrity check: all 23 compressed-part byte lengths and SHA-256 hashes match `manifest.json`.
- Payload spot-check: the generated SQL contains `Marketing and Brand Management`, `Banking and Credit Services`, `Information and Communications Technology Professionals`, plus the student-facing role labels `Travel Service Attendant` and `Food and Beverage Service Supervisor`.
- SQL was not applied to Supabase; this is a local artifact refresh only.

The companion `taxonomy_naming_checkpoint_2026-09-25.md` documents the source-supported display-label edits and unresolved naming candidates. This regeneration confirms those names entered the seed payload; it does not resolve taxonomy membership or validate the JAMB-to-CCMAS audit.

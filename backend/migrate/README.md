# migrate - safe, automatic migrations (phase 1: plan only)

Today the order of the `backend/migration_*.sql` and seed files lives in prose
(`MIGRATION_RUNBOOK.md`, `CLAUDE.md`) and nothing records what is applied.
This package replaces the prose with an explicit manifest and read-only tools.
**Phase 1 never connects to a database and never executes SQL.**

## Phases

1. **Plan only (this change):** `manifest.toml`, lint, `plan`, `verify-manifest`,
   `checksums`, a `Ledger` interface, tests.
2. Ledger + runner: a `schema_migrations` table, one transaction per entry, an
   advisory lock, checksum-drift refusal, `--dry-run`, stop at the first error,
   verification queries that run *before* COMMIT so a failed check never commits.
3. Safety: `_bak` schema snapshots before destructive seed replacements, `down`
   (undo) scripts.
4. CI: apply the whole chain to a throwaway Postgres on every PR.
5. Production: approval-gated GitHub environment job.

## Commands (run from `backend/`)

```bash
uv run python -m migrate verify-manifest        # manifest vs files on disk; exit 1 on any error
uv run python -m migrate lint [--json out.json] # static SQL analysis, human table + JSON report
uv run python -m migrate plan                   # what would run (empty ledger)
uv run python -m migrate plan --applied applied.json   # ledger stand-in, flags checksum drift (exit 2)
uv run python -m migrate checksums --json > applied.json   # a file `plan --applied` accepts
```

`applied.json` is `{"applied": [{"id": "...", "checksum": "..."}]}` (or a plain
`{id: checksum}` map). Checksums are SHA-256 of the **decompressed** bytes; a
parts group hashes its `"<part> <sha256>"` lines in numeric order.

## Adding a migration

1. Create `backend/migration_<name>.sql` (or a seed). Prefer: one explicit
   `BEGIN; ... COMMIT;`, `IF [NOT] EXISTS` / `CREATE OR REPLACE` / `ON CONFLICT`.
2. Register it in `migrate/manifest.toml` - append an `[[entry]]` at its place in
   the apply order, with `requires` for real dependencies (ids that appear
   **earlier**). If you cannot state its order, add an `[[unordered]]` item with a
   reason instead. Never guess.
3. `kind = "destructive"` (drops, deletes without WHERE, replacement seeds) needs
   `manual_only = true` or an `approval = "..."` marker.
   A `requires` edge must be provable from the SQL (an ALTER/INSERT/REFERENCES on a table
   another **earlier ordered** entry creates); cite the file and line in a comment. If the
   dependency is an `[[unordered]]` file or an entry listed *later*, do not reorder: add
   `external_requires = [{ ref = "...", evidence = "file:line ..." }]`. `verify-manifest` and
   `plan` report it as an unresolved dependency (a warning; nothing is blocked or reordered).
   If the linter flags a `schema`/`seed` entry as destructive (e.g. `DROP POLICY IF EXISTS`
   before re-creating it), either mark it `destructive` or add `allow_destructive_reason`.
   Manifest paths must stay inside `backend/` (no `..`, no absolute paths).
4. `uv run pytest tests/test_migrate_repo_manifest.py` - it fails if any
   `migration_*.sql` (or seed/patch file or part directory) is in neither list.

## What is and is not automatic

- Entries in `[[entry]]` have a defined order, but in phase 1 nothing runs.
  Later phases run only `schema` and `seed` entries, never `manual_only`.
- `kind = "destructive"` entries with `approval` need a human, plus a `_bak`
  snapshot (phase 3). `migration_career_v2.sql` is `manual_only` forever: it
  drops the taxonomy tables.
- `[[unordered]]` files are never applied automatically until someone documents
  their order.
- `plan` halts at the first blocked entry: apply order is strict.
- Data-loading files named `migration_*` are `kind = "seed"`.

## Things phase 2 must handle

- 41 of 75 migrations have no `BEGIN/COMMIT`; the runner wraps each entry in its
  own transaction, so files that carry their own `BEGIN/COMMIT` (and seed parts
  that are "complete transactions") need that stripped or handled explicitly.
- Some `.sql` / `.sql.gz` pairs differ (CRLF vs LF, see `lint`); the manifest
  points at one file so the checksum is unambiguous.
- Production is the only database today (Supabase free plan, no PITR, no staging).
  Existing applied state must be recorded as a baseline in the ledger before the
  runner may touch it.

## Production secrets (to be created by the owner, not in this phase)

- Production applies will be approval-gated (a GitHub environment with required
  reviewers).
- The job needs a `DATABASE_URL` secret in that environment. GitHub runners are
  IPv4-only, so use the Supabase **Session pooler** connection string, not the
  direct `db.<ref>.supabase.co` host.
- Do not upload database dumps or snapshots as GitHub artifacts: this repository
  is public. Snapshots stay inside the database (`_bak` schema).

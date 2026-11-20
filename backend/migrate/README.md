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
uv run python -m migrate lint [--json out.json] # static SQL analysis + findings; exit 1 on any un-waived error
uv run python -m migrate plan                   # what would run (empty ledger)
uv run python -m migrate plan --applied applied.json   # ledger stand-in, flags checksum drift (exit 2)
uv run python -m migrate checksums --json > applied.json   # a file `plan --applied` accepts
uv run python -m migrate plan --dry-run         # same as plan; the flag only documents intent (CI uses it)
uv run python -m migrate plan --allow-rebuild --rebuild-approval REF   # show a rebuild as authorised (still manual)
uv run python -m migrate baseline --preflight preflight.json --entries ID [ID ...] --operator NAME --out applied.json
```

CI runs the same commands from the repository root as `python -m backend.migrate ...`
(`.github/workflows/migrations.yml`, no database, no secrets).

`applied.json` is `{"applied": [{"id": "...", "checksum": "...", "kind": "applied|baseline"}]}`
(or a plain `{id: checksum}` map). Checksums are SHA-256 of the **decompressed** bytes
with a leading UTF-8 BOM stripped and **CRLF normalised to LF** (a lone CR is kept), so a
Windows checkout (autocrlf) hashes the same as the Linux one; a parts group hashes its
`"<part> <sha256>"` lines in numeric order. This changes every checksum compared with the
first phase-1 revision of this package; nothing had been recorded against those yet.

## Entry kinds

| kind | meaning | automatic? |
|---|---|---|
| `schema`, `seed` | additive / idempotent | yes (phase 2) |
| `destructive` | drops structure or replaces a table's contents | no: needs `approval` (or `manual_only`) |
| `data_destructive` | `DELETE`/`TRUNCATE` rows without dropping and recreating that table (e.g. scoped delete-then-reinsert of a generated layer) | no: same approval gate as `destructive` |
| `rebuild` | drops and recreates the taxonomy (`migration_career_v2`) | never; needs `manual_only` **and** `approval`; `plan` shows it as `refused` unless `--allow-rebuild` plus `--rebuild-approval` are both given, and even then it stays manual |

The linter flags a `schema`/`seed` entry whose SQL is destructive or row-deleting
(`KIND_CONFLICT`) unless it carries an `allow_destructive_reason`.

## Duplicate sources (`.sql` vs `.sql.gz`)

Each manifest entry resolves to exactly one file. If both copies exist and are identical
after BOM/CRLF normalisation they are the same file. If they **differ**, `verify-manifest`
and `lint` fail (`DUPLICATE_SOURCE_DIFFERS`) until the entry pins one with
`authoritative = "sql"|"gz"` plus a written `authoritative_reason`; the ignored copy is
then a `STALE_DUPLICATE` warning, and if it would not parse it is also reported as
`STALE_COPY_BACKSLASH_QUOTE`. Findings on the repository as of this change (no file was modified):

| entry | differs how | chosen | evidence |
|---|---|---|---|
| `migration_guidance_ownership_and_sociology_resources_2026-09-11` | line 630: `''` in `.sql`, backslash-apostrophe in `.sql.gz` | `.sql` | the `.gz` line cannot parse with `standard_conforming_strings=on`; `.sql` is also the later commit (2026-10-23 vs 2026-10-22) |
| `migration_sociology_domain_tool_path_2026-09-18` | 10 resource VALUES rows (lines 163-172) | `.sql` | later commit (2026-10-22 vs 2026-10-18); `.gz` shortens the access column and appends `Access: ...` to the description |
| `seed_subject_catalog` | aliases and a header comment | `.sql` | later commit (2026-10-22 vs 2026-10-17); the local audits read the `.sql` |
| `seed_subject_options` | `parsed_at` stamps and 9378 vs 8781 INSERTs | `.sql` | later (2026-10-24 vs 2026-10-22), paired with the 2026-10-24 rule-record seed |
| `seed_subject_rule_records` | row content, same 1260 INSERTs | `.sql` | later (2026-10-24 vs 2026-10-17) |

Only **one** of the five contains a backslash-apostrophe. The other ten pairs
(`migration_career_resources_v1`, `..._contextual_career_items`, `..._guidance_all_programmes`,
`..._guidance_global`, `..._jamb_programme_learning_resources`, `..._programme_domain_review_corrections`,
`..._school_identity`, `..._student_pipeline_live`, `seed_career_pilot`, `patch_subject_catalog_streams`)
differ only by CRLF in the `.gz`, which normalisation now treats as identical.

## Lint findings (what makes `lint` exit 1)

`DUPLICATE_SOURCE_DIFFERS`, `BACKSLASH_QUOTE` (a backslash-apostrophe inside a normal,
non-`E''` string: the string ends there under Supabase's `standard_conforming_strings=on`),
`DROP_CONSTRAINT_NOT_READDED` (a `DROP CONSTRAINT x` with no `ADD CONSTRAINT x` in the same
file; a re-add inside `EXECUTE '...'` counts), and `KIND_CONFLICT`. A finding can be
acknowledged per entry with `lint_waivers = [{ code, reason }]`; it is still printed as
`WAIVED` and kept in the JSON. A waiver is a record that a human looked, not a fix.
`data_destructive` is counted as `DD` in the table; temp tables and a drop+create of the
same table in one file are not counted.

## Baseline (recording what production already has)

Production has no ledger. `baseline` writes `kind = "baseline"` rows only when the operator
names each entry (`--entries`, no `all`, no wildcard), supplies the saved output of a
read-only preflight (`--preflight`, only its SHA-256 is recorded), and an operator name.
It refuses `rebuild` entries and will not overwrite its output. Nothing is inferred from
file presence or table counts. The recorded checksum is the file's checksum at that moment,
so a later edit shows as drift. `plan --applied` shows baseline rows as `applied` with a
"baseline" note.

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

- Entries in `[[entry]]` have a defined order. `plan` and `lint` never run anything; `apply --apply`
  (phase 2) runs only `schema` and `seed` entries, plus approved destructive ones, never `manual_only`.
- `destructive` / `data_destructive` entries with `approval` need a human, plus a `_bak`
  snapshot (phase 3). `migration_career_v2.sql` is kind `rebuild` and `manual_only`
  forever: it drops the taxonomy tables.
- `[[unordered]]` files are never applied automatically until someone documents
  their order.
- `plan` halts at the first blocked entry: apply order is strict.
- Data-loading files named `migration_*` are `kind = "seed"`.

## Things phase 2 must handle

- 41 of 75 migrations have no `BEGIN/COMMIT`; the runner wraps each entry in its
  own transaction, so files that carry their own `BEGIN/COMMIT` (and seed parts
  that are "complete transactions") need that stripped or handled explicitly.
- `.sql` / `.sql.gz` pairs: see "Duplicate sources"; each entry has one authoritative file.
- A runner must refuse (not skip) a `.sql.gz` whose text contains a backslash-apostrophe.
- Production is the only database today (Supabase free plan, no PITR, no staging).
  Existing applied state must be recorded as a baseline in the ledger before the
  runner may touch it.

## Production secrets (to be created by the owner, not in this phase)

- Production applies will be approval-gated (a GitHub environment with required
  reviewers).
- The job needs a `DATABASE_URL` secret in that environment. GitHub runners are
  IPv4-only, so use the Supabase **Session pooler** connection string (port **5432**), not the
  direct `db.<ref>.supabase.co` host. The **transaction pooler (port 6543, or `?pgbouncer=true`)
  is refused**: it can move `BEGIN`, the migration and `COMMIT` to different backend
  connections, which would break both atomicity and the advisory lock.
- Do not upload database dumps or snapshots as GitHub artifacts: this repository
  is public. Snapshots stay inside the database (`_bak` schema).

## Phase 2: the runner (status, apply, import-baseline)

These commands connect to a database. The URL is read **only** from the environment
variable `MIGRATE_DATABASE_URL` (never a CLI argument, so it cannot reach logs or shell
history); the driver (`psycopg`) is imported lazily and is installed only in the
workflow's database jobs. Nothing in the test suite touches a real database: tests use a
sqlite-backed fake behind the `Executor` seam (`executor.py`).

| command | what it does |
|---|---|
| `status` | read-only (`BEGIN READ ONLY`): is the ledger there, how many rows, and the plan against it |
| `apply` | dry run by default (reads the ledger read-only, prints what would run). `--apply` executes |
| `import-baseline FILE` | dry run by default; `--apply` records the `baseline` rows from a `baseline` command file into the ledger. The file is hand-editable, so every row is re-checked against the manifest first: checksum must equal the files now, `rebuild` entries are refused, an operator and a 64-hex `preflight_sha256` are required |

`apply --apply` rules (each has a test in `tests/test_migrate_apply.py`):

- one runner at a time (`pg_try_advisory_lock`), released at the end;
- refuses on **checksum drift** (an applied entry's file changed), exit 2;
- refuses when the ledger is missing or empty unless `--empty-database` is passed, so a
  populated database with no ledger can never be "migrated from zero": record a baseline first.
  `--empty-database` is **verified, not trusted**: it is refused if the schema already holds any
  table, view or materialised view other than the ledger;
- refuses when the ledger holds ids the manifest does not know (a renamed entry would look pending
  and run a second time), unless `--allow-unknown-ledger-ids` is passed;
- the ledger is looked up with `to_regclass()` (not the information schema, which hides tables the
  role cannot read); after bootstrapping it must be visible and empty, or the run stops;
- the connection must stay the same backend (`pg_backend_pid()` is checked when the lock is
  taken, at the start of each entry and just before `COMMIT`); a change rolls the entry back;
- each entry runs with `SET LOCAL lock_timeout` (default 30 s) and `statement_timeout` (default
  15 min); change with `--lock-timeout-ms` / `--statement-timeout-ms`, `0` = none;
- only `schema` and `seed` entries run by themselves. `destructive` / `data_destructive`
  entries run only if named with `--approve ID ...` **and** `--approval-ref REF`; until then the
  run stops there (strict order) and later entries wait. A `schema`/`seed` entry whose SQL the
  linter flags as destructive (DROP, TRUNCATE, unqualified DELETE ...) is gated the same way and
  can be approved the same way. An `apply --apply` that stops for approval exits 0; a **dry run**
  that stops there exits **3**, so CI cannot read it as clean. `rebuild` and `manual_only`
  entries never run and cannot be approved. Entries that depend on a skipped (refused, manual,
  blocked) entry, or whose `external_requires` names a later ordered entry that is not applied,
  are skipped with the reason; independent entries still run;
- one transaction per entry (all parts of a group together) that also inserts the ledger row, so
  an entry is applied-and-recorded or neither; the first failure rolls back, stops the run and
  reports `ExceptionType: first line` (never the SQL);
- the file text is prepared first with one tokenizer shared with `lint` (`sqltx.py`): transaction
  control is recognised only as the first keyword of a top-level statement, so comments, strings and
  `$$` bodies are never touched and `COMMIT; -- done` is found. The file's own plain `BEGIN;` /
  `BEGIN WORK;` / `START TRANSACTION;` ... `COMMIT;` / `COMMIT WORK;` / `END;` pairs are removed (the
  runner owns the transaction; several pairs run inside the single runner transaction),
  session-level `SET x` lines outside the pair become `SET LOCAL`, and `RESET ALL` runs after each
  entry. Every other transaction-control statement (`ROLLBACK`, `ABORT`, `SAVEPOINT`, `RELEASE`,
  `COMMIT AND CHAIN`, `BEGIN ISOLATION LEVEL ...`, a close without an open, ...), statements outside a
  pair other than `SET`, and a backslash-apostrophe in a plain string are **refused** (nothing runs).
  A `BEGIN ATOMIC ... END;` function body has top-level semicolons and is refused too (use a `$$`
  body). If a commit acknowledgement is lost the message says the entry may have **committed**
  and to run `status`, never "rolled back";
- `.sql.gz` is decompressed in memory; nothing is written to disk or uploaded.

The ledger table is `skillup_dev.schema_migrations`; its DDL is `backend/migrate/ledger.sql`
(marked **PROPOSED, NOT APPLIED**, RLS on, `REVOKE ALL ... FROM anon, authenticated`). The runner
creates it itself the first time `apply --apply --empty-database` (or `import-baseline --apply`)
runs against a database without one.

Group entries (the 35 contextual seed parts) run as one transaction. If that proves too large for
the database, the group needs an owner decision (see the runbook).

### Onboarding an existing database (production)

1. `status` (needs `MIGRATE_DATABASE_URL`): ledger will show MISSING.
2. Run the read-only preflight, save its JSON, then
   `python -m backend.migrate baseline --preflight FILE --entries ID ... --operator NAME --out baseline.json`
   naming only entries the preflight proves are applied.
3. `import-baseline baseline.json` (dry run), then `--apply`.
4. `status` again: applied entries show as baseline; pending ones would run.

## CI (this change) and what the next phase needs

`.github/workflows/migrations.yml` runs on pull requests and pushes to `main` that touch
`backend/migrate/**`, `backend/migration_*.sql*`, `backend/seed_*.sql*` (and part
directories), `backend/patch_*.sql` or the migrate tests: `verify-manifest`, `lint` (fails on
any un-waived error), `plan --dry-run` (uploaded as the `migration-plan` artifact together
with the lint JSON) and `pytest tests/test_migrate_*.py`. It has no database job and no
secrets.

Next phase (not in this change), in order:

1. **Throwaway Postgres in CI**: a `postgres` service container (plus the Supabase roles
   and `skillup_dev` schema the files assume, `pg_cron` stubbed or skipped), apply the
   `schema`/`seed` chain with the phase 2 runner on every PR, run the manifest `verify`
   queries, then re-run the plan and expect "nothing to do". Needs: the runner itself,
   a decision on how to stub Supabase-only objects (`auth`, `storage`, `pg_cron`), and the
   35 contextual seed parts decompressed on the runner (a few hundred MB).
2. **Staging**: a separate Supabase project (the free plan has one database today), its
   own `DATABASE_URL` secret in a `staging` environment, session pooler (IPv4) string,
   `_bak` snapshots before `destructive`/`data_destructive` entries, and the
   `rebuild` entry exercised here, never in production.
3. **Production**: an approval-gated GitHub environment with required reviewers, the
   ledger table created and the baseline recorded from a saved read-only preflight
   (`baseline` command), an advisory lock, checksum-drift refusal, and a human sign-off
   per `destructive`/`data_destructive` entry. No dump or snapshot may be uploaded as an
   artifact (public repository).

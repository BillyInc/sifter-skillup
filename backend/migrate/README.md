# migrate - safe, automatic migrations

The order of the `backend/migration_*.sql` and seed files is an explicit manifest
(`manifest.toml`), and a runner can apply the missing ones and record them in a ledger.
`plan`, `lint`, `verify-manifest`, `checksums` and `baseline` never connect to a database;
`status`, `apply` and `import-baseline` do (URL from `MIGRATE_DATABASE_URL` only), and
`apply`/`import-baseline` are dry runs unless `--apply` is passed.

## Phases

1. **Plan only (done):** `manifest.toml`, lint, `plan`, `verify-manifest`, `checksums`, tests.
2. **Ledger + runner (done):** `schema_migrations` table, one transaction per entry, advisory
   lock, checksum-drift refusal, dry run by default, stop at the first error, `plan-sha`
   review protocol, approval groups, per-entry row-count checks before COMMIT.
3. **Production job (done, manual):** `.github/workflows/migrations.yml`, dispatch-only,
   `main`-only, behind the `production-db` environment.
4. Not built: `_bak` snapshots before destructive seed replacements (the runner takes **no
   backup**: take one yourself), `down` (undo) scripts, applying the whole chain to a
   throwaway Postgres on every PR.

## Commands

Run from `backend/` as `uv run python -m migrate ...`, or from the repository root as
`python -m backend.migrate ...` (what CI and the workflow use). They are the same code.
Examples below use the `backend/` form.

```bash
uv run python -m migrate verify-manifest        # manifest vs files on disk; exit 1 on any error
uv run python -m migrate lint [--json out.json] # static SQL analysis + findings; exit 1 on any un-waived error
uv run python -m migrate plan                   # what would run (empty ledger)
uv run python -m migrate plan --applied applied.json   # ledger stand-in, flags checksum drift (exit 2)
uv run python -m migrate checksums --json > applied.json   # a file `plan --applied` accepts
uv run python -m migrate plan --dry-run         # same as plan; the flag only documents intent (CI uses it)
uv run python -m migrate plan --allow-rebuild --rebuild-approval REF   # show a rebuild as authorised (still manual)
uv run python -m migrate baseline --preflight preflight.json --entries ID [ID ...] --operator NAME --out applied.json
uv run python -m migrate baseline ... --entries migration_career_v2 --reason "why the database already has it"
```

CI runs the same commands from the repository root as `python -m backend.migrate ...`
(`.github/workflows/migrations.yml`; the static job needs no database and no secrets).
`plan` always prints a `plan-sha:` line (see "Reviewing a run").

`applied.json` is `{"applied": [{"id": "...", "checksum": "...", "kind": "applied|baseline"}]}`
(or a plain `{id: checksum}` map). Checksums are SHA-256 of the **decompressed** bytes
with a leading UTF-8 BOM stripped and **CRLF normalised to LF** (a lone CR is kept), so a
Windows checkout (autocrlf) hashes the same as the Linux one; a parts group hashes its
`"<part> <sha256>"` lines in numeric order. This changes every checksum compared with the
first phase-1 revision of this package; nothing had been recorded against those yet.

## Entry kinds

| kind | meaning | automatic? |
|---|---|---|
| `schema`, `seed` | additive / idempotent | yes |
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
It will not overwrite its output. Nothing is inferred from file presence or table counts.
Two cases need care:

- A `rebuild` entry (`migration_career_v2`) can be recorded as already present **only** with
  `--reason "<why the database is known to have it>"`. The reason is stored in the ledger's
  `operator` text. This declares a fact about the database; it never makes the rebuild runnable,
  and it lets entries that depend on it proceed.
- An `[[unordered]]` file (for example `migration_admission_intelligence.sql`) can be named by its
  path in `--entries`: it is recorded as present (never run by the runner), which satisfies an
  `external_requires` on it. The recorded checksum is the file's checksum at that moment,
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
   `external_requires = [{ ref = "...", evidence = "file:line ..." }]`. `verify-manifest` reports
   it as an unresolved dependency (a warning) and `plan` **blocks** the entry (and, because apply
   order is strict, everything after it) until the ledger records `ref` as applied or baselined:
   running it earlier would fail on a fresh database.
   If the linter flags a `schema`/`seed` entry as destructive (e.g. `DROP POLICY IF EXISTS`
   before re-creating it), either mark it `destructive` or add `allow_destructive_reason`.
   Manifest paths must stay inside `backend/` (no `..`, no absolute paths).
4. `uv run pytest tests/test_migrate_repo_manifest.py` - it fails if any
   `migration_*.sql` (or seed/patch file or part directory) is in neither list.

## What is and is not automatic

- Entries in `[[entry]]` have a defined order. `plan` and `lint` never run anything; `apply --apply`
  runs only `schema` and `seed` entries, plus approved destructive ones, never `manual_only`.
- `destructive` / `data_destructive` entries with `approval` need a human, plus a `_bak`
  snapshot you take yourself (the runner takes none). `migration_career_v2.sql` is kind `rebuild` and `manual_only`
  forever: it drops the taxonomy tables.
- `[[unordered]]` files are never applied automatically until someone documents
  their order.
- `plan` halts at the first blocked entry: apply order is strict.
- Data-loading files named `migration_*` are `kind = "seed"`.

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
| `import-baseline FILE` | dry run by default; `--apply` records the `baseline` rows from a `baseline` command file into the ledger. The file is hand-editable, so every row is re-checked against the manifest first: checksum must equal the files now, a `rebuild` entry is accepted **only** if its `operator` text carries the `(rebuild baseline reason: <reason>)` marker that `baseline --reason` writes (it is still never run), an operator and a 64-hex `preflight_sha256` are required |

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
- a `plan-sha` from a dry run must be presented with `--plan-sha` (the CLI refuses `--apply`
  without it, and the run refuses if the plan changed since: see "Reviewing a run");
- an entry with `must_apply_with` (the two replacement subject seeds) is only run when its partner
  is approved in the same run or already in the ledger;
- an entry with `verify_rows` has each `SELECT count(*)` (optionally scoped with `where`) checked
  before COMMIT; a shortfall rolls the entry back and records nothing;
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

#### Large group entries: the 35 contextual seed parts run as ONE transaction

Decision (measured from the decompressed parts): 35 files, 696,420,888 bytes (about 664 MiB),
largest part 30.5 MB, writing 121,377 distinct `career_context_items` rows and 408,163
`career_item_relationships` rows. Every statement is an upsert (`ON CONFLICT ... DO UPDATE` /
`DO NOTHING`), the parts have no ordering dependency between them, and the entry has one ledger row.
The runner therefore applies all 35 parts in one transaction:

- **Exactness:** the group is applied-and-recorded or neither. Per-part transactions would leave
  a half-loaded table with no ledger row (the ledger records an entry, not a part).
- **Message size:** the runner sends each part as its own statement inside the one transaction, so no
  single message exceeds about 30.5 MB, far below PostgreSQL's 1 GB message limit.
- **Timeouts:** `statement_timeout` (15 minutes by default) applies per statement, that is per part.
  `lock_timeout` stops it waiting forever behind another session.
- **Cost, accepted:** the transaction is long (all parts' writes and WAL are held until COMMIT), and the runner
  holds the SQL in memory (about 1.5 GB peak on the CI runner). If the connection drops, the whole
  group rolls back and can be re-run safely because the parts are idempotent.
- **Verification:** `verify_rows` requires at least 121,377 rows in `career_context_items` before COMMIT
  (the relationship rows are not counted: their conflict key has no target, so duplicates cannot be counted).

If the database ever cannot hold this in one transaction, split the manifest entry into several
group entries (one ledger row each) rather than running parts outside the runner.

### Onboarding an existing database (production)

1. `status` (needs `MIGRATE_DATABASE_URL`): ledger will show MISSING.
2. Run the read-only preflight, save its JSON, then
   `python -m backend.migrate baseline --preflight FILE --entries ID ... --operator NAME --out baseline.json`
   naming only entries the preflight proves are applied.
3. `import-baseline baseline.json` (dry run), then `--apply`.
4. `status` again: applied entries show as baseline; pending ones would run.

## Student features and analytics (section D of the manifest)

The six migrations prepared in October and November 2026 are ordered at the end of the manifest.
Each edge below is proven by the SQL (file:line evidence is in `manifest.toml`):

1. `migration_display_name_2026-11-19`: needs `users` (base `supabase-schema.sql`, not a migration).
2. `migration_avatars_bucket_2026-11-19`: needs Supabase Storage (`storage.buckets`); it inserts the
   private bucket and creates no policies.
3. `migration_my_world_collections_2026-11-19`: requires `migration_career_v2` (`saved_items` is created
   only there; baseline it with a reason).
4. `migration_student_subject_grade_sets_2026-11-19`: requires `migration_student_pipeline_live`.
5. `migration_learning_interest_analytics_2026-10-26`: needs the unordered files
   `migration_provisioning.sql` (`student_affiliations`) and `migration_school_identity.sql`
   (`schools.state`, `schools.official_name`); baseline them if production already has them.
   **Enable Supabase Cron (`pg_cron`) first** (Dashboard, Database, Extensions): the file raises an
   exception at its end otherwise.
6. `migration_learning_interest_current_selections_2026-10-28`: requires #5 and the unordered
   `migration_account_lifecycle_patch.sql` (`users.is_deleted`); ship Terms and Privacy `2026-10-29.1`
   with it.

Decision recorded 2026-11-20: `migration_programme_curriculum_contract_general_2026-09-18` drops
`programme_curriculum_outcomes_display_group_check` on purpose and it is **not** re-added. The
Sociology migration's CHECK only allowed three Sociology labels, while the generic default is
`programme_core` (the generic curriculum seed writes 61,196 such rows, which that CHECK would reject).
The manifest entry carries the reason as a lint waiver.

## Reviewing a run (plan-sha)

`plan` and a dry-run `apply` print `plan-sha: <64 hex>`: a hash of the ordered list of pending and
approval-required entries with their file checksums. `apply --apply` needs `--plan-sha` with that
value and refuses if the manifest, a file or the ledger changed since the dry run, so a run cannot
be approved blind or after a later PR added an entry. The workflow does the same (`plan_sha` input).

## Approval groups and row checks

- `must_apply_with = ["other_id"]` (symmetric) binds entries that must deploy together.
  `seed_subject_rule_records` and `seed_subject_options` are paired: approving one alone is refused.
- `verify_rows = [{ table = "programme_subject_options", min_rows = N }]` asserts a minimum row
  count inside the entry's transaction. A seed that commits while writing nothing (row-level
  security, empty source) would otherwise be recorded as applied. `verify-manifest` warns
  (`SEED_NO_ROW_CHECK`) for each `seed_` entry without it. Every `seed_` entry now has one. Each
  minimum is a floor derived from the seed SQL itself (distinct conflict keys the file writes), with the
  derivation in a comment next to it; the manifest never invents counts. Counting is table-wide unless
  scoped: `where = [{ column = "context_level", op = "=", value = "role" }, { column = "context_key",
  op = "like", value = "D078|%" }, { column = "item_type", op = "in", values = ["tool"] }]` ANDs
  terms (ops `=`, `like`, `in`; values are bound parameters; columns must be lowercase identifiers).
  Use a scope whenever the table also holds rows from other seeds, otherwise they hide a seed that wrote
  nothing. Floors are lower bounds: re-running an idempotent seed never fails them. Left unchecked on
  purpose (no safe floor can be derived): `programme_subject_option_items` (UNIQUE key plus
  `ON CONFLICT DO NOTHING` can collapse rows), `career_item_relationships` of the contextual parts (no
  conflict target), and `school_programme_subject_option_items`.

## Fresh database or rebuilt taxonomy

`migration_career_v2` (rebuild) is never run by the runner, but several entries depend on it, and
`migration_student_pipeline_live` also waits on the `[[unordered]]` file
`migration_admission_intelligence.sql`. Onboarding an existing production database, in this order
(all `python -m migrate ...` commands run from `backend/`, e.g. `uv run python -m migrate ...`):

1. Take your own backup and save a read-only preflight result as `PREFLIGHT.json`.
2. Record everything the database already has. Name each entry (no wildcard):
   `baseline --preflight PREFLIGHT.json --entries <id> ... --operator NAME --out baseline.json`.
   Include `migration_career_v2` **with** `--reason "<why the database already has it>"`, and
   `--entries migration_admission_intelligence.sql` (an unordered file is named by its path).
   `plan` prints the exact `baseline` command for each unmet dependency.
3. `import-baseline baseline.json` (dry run), then again with `--apply`. A rebuild row is accepted
   only if it came from `baseline --reason` (the marker in its `operator` text); a hand-edited row
   without the marker is refused. The rebuild is recorded as present and never runs.
4. `db-status` (read-only), then a `db-apply` dry run: read its `plan-sha:` line.
5. A confirmed `db-apply` with that `plan_sha` (and `approve_ids` / `approval_ref` only for the
   entries a human has reviewed). The run refuses if the plan changed since the dry run.

Until the baselines are recorded `plan` shows the dependants as `blocked`, by design. A baselined
rebuild is not reported as "applied out of order".

## When something goes wrong

- **A failed entry** rolled back completely (SQL and ledger row): the ledger is unchanged. Fix the
  cause and run a dry run again; take the new `plan-sha`. If the error message says the commit
  acknowledgement failed, run `status` first: the entry may be recorded.
- **Checksum drift** (exit 2): a file changed after it was applied. The runner refuses everything
  until a human decides. There is deliberately no flag to accept drift. Either restore the file, or
  record the new content explicitly (an owner decision: delete that ledger row by hand after
  verifying the database really has the new behaviour, then `baseline` it again).
- **A stale advisory lock** after a cancelled run: the lock is session-level and the database
  releases it when the connection ends. If a run reports "another migration run holds the advisory
  lock", check for a live run (`pg_stat_activity`) before doing anything; do not start a second one.
- **The contextual seed group (35 parts)** runs as **one** transaction (all parts, one ledger row),
  not one per part as the runbook's manual instructions describe; see "Large group entries" above for
  the measurements and the reasoning. If a run fails, nothing from the group is committed: fix the cause
  and re-run (the parts are idempotent).

## Production setup (owner, one time)

1. GitHub > Settings > Environments > New environment **`production-db`** (not `production`, which
   `deploy-prod.yml` uses). Add **required reviewers**, turn **Prevent self-review** on, and limit
   deployment branches to `main`.
2. Add the environment secret **`DATABASE_URL`**: a Supabase **Session pooler** (port 5432) or
   direct connection string. GitHub runners are IPv4-only, so the direct `db.<ref>.supabase.co`
   host may not be reachable. Never the transaction pooler (port 6543): it can split `BEGIN` and
   `COMMIT` across connections and breaks the advisory lock.
3. Record the baseline (see "Onboarding an existing database"). `import-baseline` is not a
   workflow job: run it once from a trusted machine with `MIGRATE_DATABASE_URL` set, dry run first.
4. Do not upload database dumps or snapshots as GitHub artifacts: this repository is public.
   The runner takes **no** backup; back up the affected tables before approving a replacement seed.

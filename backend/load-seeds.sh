#!/usr/bin/env bash
#
# Load the JAMB subject + career-resource seeds into a LevelUp database.
#
# Runs ON storytime, which has psql 17 and a fast link to Supabase. Your laptop
# has no psql, no supabase CLI, and no docker access (not in the docker group,
# and sudo wants a password) — none of which matter, because the client is
# already here.
#
# The six DDL migrations are ALREADY APPLIED to dev (billy / igvizqgbrxmdtyaujbxu)
# as of 21 Aug 2026, along with seed_subject_catalog.sql. This script is the
# remaining ~119 MB of data that could not go through the Supabase MCP, which is
# one query per HTTP call.
#
#   Run it yourself: it needs the Supabase database password, which Claude does
#   not handle. Everything else is staged in ~/levelup-seed.
#
#     SRC_URL='postgresql://postgres:<PASSWORD>@db.igvizqgbrxmdtyaujbxu.supabase.co:5432/postgres' \
#       bash load-seeds.sh
#
#   Use the DIRECT connection (port 5432), not the pooler on 6543: these files
#   are single large transactions and the transaction pooler will not hold them.
#   Password: Supabase dashboard -> Project Settings -> Database.
#
# WHY A BACKUP STEP EXISTS: seed_subject_options.sql is NOT an additive seed. It
# opens with
#     DELETE FROM programme_subject_option_items;
#     DELETE FROM programme_subject_options;
# and rebuilds both from scratch (506 -> 740 options, 4,593 -> 7,246 items).
# Those tables are what the subject picker currently runs on, so this script
# dumps them first and tells you how to restore.
#
set -euo pipefail

SEED_DIR="${SEED_DIR:-$HOME/levelup-seed}"
PSQL=/usr/lib/postgresql/17/bin/psql
PGDUMP=/usr/lib/postgresql/17/bin/pg_dump
BACKUP="${BACKUP:-$HOME/levelup-seed-backup-$(date +%Y%m%d-%H%M%S).dump}"

[ -n "${SRC_URL:-}" ] || {
  cat >&2 <<'USAGE'
ERROR: SRC_URL is not set.

  SRC_URL='postgresql://postgres:<PASSWORD>@db.igvizqgbrxmdtyaujbxu.supabase.co:5432/postgres' \
    bash load-seeds.sh

Use the DIRECT connection (port 5432), not the pooler on 6543 — these files are
single large transactions and the transaction pooler will not hold them.
Password: Supabase dashboard -> Project Settings -> Database.
USAGE
  exit 1
}

say() { printf '\n=== %s\n' "$1"; }

# psql defaults to continuing after an error, which would leave a half-loaded
# table looking like a success. Every invocation below is strict.
run() {
  local file="$1"
  printf '    %-52s ' "$(basename "$file")"
  "$PSQL" "$SRC_URL" -q -v ON_ERROR_STOP=1 -f "$file"
  printf 'ok\n'
}

say "1/6  preflight"
"$PSQL" "$SRC_URL" -Atc \
  "select 'connected, postgres '||current_setting('server_version')"

MISSING=$("$PSQL" "$SRC_URL" -Atc "
  select string_agg(t, ', ')
  from unnest(array[
    'subject_catalog','jamb_programmes','programme_subject_requirements',
    'programme_subject_options','programme_subject_option_items',
    'programme_subject_rule_records','schools','school_programmes',
    'school_programme_requirement_exceptions','school_programme_subject_options',
    'school_programme_subject_option_items','career_learning_resources'
  ]) t
  where to_regclass('skillup_dev.'||t) is null")
if [ -n "$MISSING" ]; then
  echo "    ABORT: missing tables in skillup_dev: $MISSING" >&2
  echo "    Apply the six DDL migrations first (see CLAUDE.md)." >&2
  exit 1
fi
echo "    all target tables present"

for f in seed_subject_catalog.sql seed_career_pilot.sql \
         seed_subject_rule_records.sql seed_subject_options.sql; do
  [ -f "$SEED_DIR/$f" ] || { echo "    ABORT: $SEED_DIR/$f not found" >&2; exit 1; }
done
PARTS=$(ls "$SEED_DIR"/seed_career_resources_v1_parts/part-*.sql 2>/dev/null | sort)
[ -n "$PARTS" ] || { echo "    ABORT: no resource parts in $SEED_DIR" >&2; exit 1; }
echo "    $(echo "$PARTS" | wc -l) resource parts staged"

say "2/6  backup of the two tables seed_subject_options.sql replaces"
"$PGDUMP" "$SRC_URL" --data-only --format=custom \
  --table=skillup_dev.programme_subject_options \
  --table=skillup_dev.programme_subject_option_items \
  --file="$BACKUP"
echo "    -> $BACKUP"
echo "    restore with:"
echo "      pg_restore -d \"\$SRC_URL\" --data-only --disable-triggers $BACKUP"

say "3/6  subject catalog (idempotent upsert; already applied, re-run is a no-op)"
run "$SEED_DIR/seed_subject_catalog.sql"

say "4/6  career pilot — schools, JAMB programmes, offerings (24 MB, slow)"
run "$SEED_DIR/seed_career_pilot.sql"

say "5/6  typed rule records, then the national matcher replacement"
run "$SEED_DIR/seed_subject_rule_records.sql"
run "$SEED_DIR/seed_subject_options.sql"

say "6/6  career learning resources — 12 parts, ~160,914 rows"
# Each part carries its own BEGIN;/COMMIT;. Applied in numeric order because
# later parts reference rows inserted by earlier ones.
for p in $PARTS; do run "$p"; done

say "verification"
"$PSQL" "$SRC_URL" -c "
SELECT 'subject_catalog' AS t, COUNT(*) AS rows, 46     AS expected FROM skillup_dev.subject_catalog
UNION ALL SELECT 'jamb_programmes',                COUNT(*),    420 FROM skillup_dev.jamb_programmes
UNION ALL SELECT 'programme_subject_options',      COUNT(*),    740 FROM skillup_dev.programme_subject_options
UNION ALL SELECT 'programme_subject_option_items', COUNT(*),   7246 FROM skillup_dev.programme_subject_option_items
UNION ALL SELECT 'programme_subject_rule_records', COUNT(*),   1260 FROM skillup_dev.programme_subject_rule_records
UNION ALL SELECT 'school_programmes',              COUNT(*),   9130 FROM skillup_dev.school_programmes
UNION ALL SELECT 'career_learning_resources',      COUNT(*), 160914 FROM skillup_dev.career_learning_resources
ORDER BY 1;"

say "orphan foreign-key checks (all must be 0)"
"$PSQL" "$SRC_URL" -c "
SELECT 'resources with no domain' AS check, COUNT(*) AS bad
  FROM skillup_dev.career_learning_resources r
  LEFT JOIN skillup_dev.domains d ON d.id = r.domain_id
 WHERE r.domain_id IS NOT NULL AND d.id IS NULL
UNION ALL
SELECT 'option items with no option', COUNT(*)
  FROM skillup_dev.programme_subject_option_items i
  LEFT JOIN skillup_dev.programme_subject_options o ON o.id = i.option_id
 WHERE o.id IS NULL
UNION ALL
SELECT 'rule records with no programme', COUNT(*)
  FROM skillup_dev.programme_subject_rule_records rr
  LEFT JOIN skillup_dev.jamb_programmes jp ON jp.id = rr.jamb_programme_id
 WHERE jp.id IS NULL;"

say "done"
echo "Counts below the expected column mean a seed silently skipped rows —"
echo "most of these files use WHERE EXISTS guards, so a missing parent is not"
echo "an error, just a smaller table. Compare against"
echo "backend/COMPLETE_DATA_MIGRATION_2026-08-17.md before calling it green."

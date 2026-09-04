#!/usr/bin/env bash
#
# Load the 2026-08-31 career taxonomy seed into a LevelUp database.
#
# Runs ON storytime, for the same reason load-seeds.sh does: it has psql 17 and
# a fast link to Supabase, and the laptop has no psql at all. The parts are
# staged in ~/levelup-seed/seed_career_v2_2026-08-31_parts_gz.
#
#   Run it yourself: it needs the Supabase database password, which Claude does
#   not handle.
#
#     SRC_URL='postgresql://postgres:PASSWORD@db.igvizqgbrxmdtyaujbxu.supabase.co:5432/postgres' \
#       bash load-career-seed-2026-08-31.sh
#
#   Use the DIRECT connection (port 5432), not the pooler on 6543: each part is
#   one large single transaction and the transaction pooler will not hold it.
#   Password: Supabase dashboard -> Project Settings -> Database.
#
# WHY THIS IS NOT ADDITIVE: part-001 opens with
#     DELETE FROM domain_tools WHERE id IN (...)   -- 546 leaked rows
#     DELETE FROM jamb_programme_domain;
#     DELETE FROM domains;
# and rebuilds the whole taxonomy, moving it from 460 subgroups to 542. The
# DELETE on domains cascades into everything keyed off it, so the pre-seed state
# of all ten affected tables was copied to skillup_dev._bak_20260903_* on
# 3 Sep 2026 before this script was written. Restore is a plain INSERT ... SELECT
# from those tables; they carry no constraints, so it is a deliberate act rather
# than something that can happen by accident.
#
# The seed is generated development data. Its own header says "DEVELOPMENT
# PREVIEW: unresolved Nigerian evidence may remain; do not apply as the
# production seed." Do not point SRC_URL at production.
#
# Schema prerequisite: migration_source_backed_career_layers.sql. Applied to dev
# 3 Sep 2026 — it was the one file preflight proved missing, and it is what
# creates domain_role_work_profiles. migration_career_v2.sql is NOT required and
# must NOT be run: it DROPs domains/domain_roles/programme_domain CASCADE, and
# the schema it builds is already present.
#
set -euo pipefail

SEED_DIR="${SEED_DIR:-$HOME/levelup-seed/seed_career_v2_2026-08-31_parts_gz}"
PSQL=/usr/lib/postgresql/17/bin/psql

[ -n "${SRC_URL:-}" ] || {
  cat >&2 <<'USAGE'
ERROR: SRC_URL is not set.

  SRC_URL='postgresql://postgres:PASSWORD@db.igvizqgbrxmdtyaujbxu.supabase.co:5432/postgres' \
    bash load-career-seed-2026-08-31.sh

Use the DIRECT connection (port 5432), not the pooler on 6543 — each part is a
single large transaction and the transaction pooler will not hold it.
Password: Supabase dashboard -> Project Settings -> Database.
USAGE
  exit 1
}

say() { printf '\n=== %s\n' "$1"; }

say "1/4  preflight"
"$PSQL" "$SRC_URL" -Atc \
  "select 'connected, postgres '||current_setting('server_version')"

# The seed writes role-owned work profiles. Without this table part-01x aborts
# mid-run, leaving the taxonomy deleted and only partly rebuilt.
"$PSQL" "$SRC_URL" -Atc "
  select case
    when to_regclass('skillup_dev.domain_role_work_profiles') is null
      then 'FATAL: domain_role_work_profiles missing; apply backend/migration_source_backed_career_layers.sql first'
    else 'schema prerequisite ok'
  end" | tee /dev/stderr | grep -q '^schema prerequisite ok$'

say "2/4  pre-seed counts"
"$PSQL" "$SRC_URL" -c "
  select 'domains' t, count(*) from skillup_dev.domains
  union all select 'domain_subgroups', count(*) from skillup_dev.domain_subgroups
  union all select 'domain_roles',     count(*) from skillup_dev.domain_roles
  union all select 'domain_tools',     count(*) from skillup_dev.domain_tools
  union all select 'work_profiles',    count(*) from skillup_dev.domain_role_work_profiles
  order by 1"

say "3/4  applying 22 parts"
# Each part is one complete transaction and they are ordered by filename.
# ON_ERROR_STOP is what makes a failed part stop the run instead of leaving a
# half-rebuilt taxonomy that reads as success.
shopt -s nullglob
parts=("$SEED_DIR"/part-*.sql.gz)
[ "${#parts[@]}" -eq 22 ] || { echo "expected 22 parts, found ${#parts[@]} in $SEED_DIR" >&2; exit 1; }

for f in "${parts[@]}"; do
  printf '    %-24s ' "$(basename "$f")"
  zcat "$f" | "$PSQL" "$SRC_URL" -q -v ON_ERROR_STOP=1 -f -
  printf 'ok\n'
done

say "4/4  post-seed counts (expected 160 / 542 / 5050 / 48188 / 5050)"
"$PSQL" "$SRC_URL" -c "
  select 'domains' t, count(*) from skillup_dev.domains
  union all select 'domain_subgroups', count(*) from skillup_dev.domain_subgroups
  union all select 'domain_roles',     count(*) from skillup_dev.domain_roles
  union all select 'domain_tools',     count(*) from skillup_dev.domain_tools
  union all select 'work_profiles',    count(*) from skillup_dev.domain_role_work_profiles
  order by 1"

# An orphan here means a child row survived pointing at a domain the seed did
# not recreate, which is the signature of a partly-applied run.
say "orphan check (all zero expected)"
"$PSQL" "$SRC_URL" -c "
  select 'subgroups w/o domain' t, count(*) from skillup_dev.domain_subgroups s
    left join skillup_dev.domains d on d.id = s.domain_id where d.id is null
  union all select 'roles w/o domain', count(*) from skillup_dev.domain_roles r
    left join skillup_dev.domains d on d.id = r.domain_id where d.id is null
  union all select 'tools w/o domain', count(*) from skillup_dev.domain_tools tl
    left join skillup_dev.domains d on d.id = tl.domain_id where d.id is null"

printf '\nDone. Pre-seed state remains in skillup_dev._bak_20260903_*.\n'

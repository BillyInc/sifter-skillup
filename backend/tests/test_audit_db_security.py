"""Tests for backend/scripts/audit_db_security.py and the hardening migration it generates."""
from __future__ import annotations

import functools
import importlib.util
import json
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
SCRIPT = ROOT / "backend" / "scripts" / "audit_db_security.py"
MIGRATION = ROOT / "backend" / "migration_security_hardening_2026-11-21.sql"

_spec = importlib.util.spec_from_file_location("audit_db_security", SCRIPT)
audit = importlib.util.module_from_spec(_spec)
sys.modules[_spec.name] = audit  # dataclasses resolve annotations through sys.modules
_spec.loader.exec_module(audit)  # type: ignore[union-attr]


@functools.lru_cache(maxsize=None)
def repo_result(exclude: tuple = ()):
    """One parse of the real repository per distinct exclude set (about 10 s each)."""
    return audit.analyze(exclude=exclude).result()


def run(tmp_path, files: dict[str, str], base: dict[str, str] | None = None):
    """Write fixture SQL (backend/migration_*.sql applied in name order) and analyse it."""
    (tmp_path / "backend").mkdir(exist_ok=True)
    for name, sql in (base or {}).items():
        (tmp_path / name).write_text(sql, encoding="utf-8")
    for name, sql in files.items():
        (tmp_path / "backend" / name).write_text(sql, encoding="utf-8")
    return audit.analyze(tmp_path).result()


T = "CREATE TABLE skillup_dev.{n} (id uuid PRIMARY KEY);\n"
RLS = "ALTER TABLE skillup_dev.{n} ENABLE ROW LEVEL SECURITY;\n"
REV = "REVOKE ALL ON TABLE skillup_dev.{n} FROM anon, authenticated;\n"


# ------------------------------------------------------------------ tables
def test_table_without_rls_or_revoke_is_reported(tmp_path):
    r = run(tmp_path, {"migration_a.sql": T.format(n="notes")})
    assert r["tables_without_rls"] == ["notes"]
    assert r["relations_without_revoke_anon_authenticated"] == ["notes"]


def test_rls_and_revoke_in_the_same_file_clear_it(tmp_path):
    r = run(tmp_path, {"migration_a.sql": T.format(n="notes") + RLS.format(n="notes") + REV.format(n="notes")})
    assert r["tables_without_rls"] == [] and r["relations_without_revoke_anon_authenticated"] == []


def test_rls_and_revoke_in_a_later_file_clear_it(tmp_path):
    r = run(tmp_path, {
        "migration_a.sql": T.format(n="notes"),
        "migration_b.sql": RLS.format(n="notes") + REV.format(n="notes"),
    })
    assert r["tables_without_rls"] == [] and r["relations_without_revoke_anon_authenticated"] == []


def test_statements_before_the_table_exists_do_not_count(tmp_path):
    r = run(tmp_path, {
        "migration_a.sql": RLS.format(n="notes") + REV.format(n="notes"),
        "migration_b.sql": T.format(n="notes"),
    })
    assert r["tables_without_rls"] == ["notes"]
    assert r["relations_without_revoke_anon_authenticated"] == ["notes"]


def test_a_later_grant_reopens_access(tmp_path):
    r = run(tmp_path, {
        "migration_a.sql": T.format(n="notes") + RLS.format(n="notes") + REV.format(n="notes"),
        "migration_b.sql": "GRANT SELECT ON TABLE skillup_dev.notes TO anon;\n",
    })
    assert r["relations_without_revoke_anon_authenticated"] == ["notes"]


def test_revoke_of_only_one_role_is_not_enough(tmp_path):
    r = run(tmp_path, {"migration_a.sql": T.format(n="notes") + RLS.format(n="notes")
                       + "REVOKE ALL ON TABLE skillup_dev.notes FROM anon;\n"})
    assert r["relations_without_revoke_anon_authenticated"] == ["notes"]


def test_schema_wide_revoke_covers_only_tables_that_already_exist(tmp_path):
    r = run(tmp_path, {"migration_a.sql": (
        T.format(n="old") + RLS.format(n="old")
        + "REVOKE ALL ON ALL TABLES IN SCHEMA skillup_dev FROM anon, authenticated;\n"
        + T.format(n="new") + RLS.format(n="new"))})
    assert r["relations_without_revoke_anon_authenticated"] == ["new"]


def test_drop_and_recreate_loses_privileges_and_rls(tmp_path):
    r = run(tmp_path, {
        "migration_a.sql": T.format(n="notes") + RLS.format(n="notes") + REV.format(n="notes"),
        "migration_b.sql": "DROP TABLE IF EXISTS skillup_dev.notes CASCADE;\n" + T.format(n="notes"),
    })
    assert r["tables_without_rls"] == ["notes"]
    assert r["relations_without_revoke_anon_authenticated"] == ["notes"]


def test_views_need_a_revoke_but_not_rls(tmp_path):
    r = run(tmp_path, {"migration_a.sql": T.format(n="t") + RLS.format(n="t") + REV.format(n="t")
                       + "CREATE OR REPLACE VIEW skillup_dev.v_t AS SELECT * FROM skillup_dev.t;\n"})
    assert r["tables_without_rls"] == []
    assert r["relations_without_revoke_anon_authenticated"] == ["v_t"]
    assert r["views"] == 1 and r["tables"] == 1


def test_recreated_view_loses_its_revoke(tmp_path):
    r = run(tmp_path, {"migration_a.sql": (
        "CREATE VIEW skillup_dev.v_t AS SELECT 1;\n" + REV.format(n="v_t")
        + "DROP VIEW skillup_dev.v_t;\nCREATE VIEW skillup_dev.v_t AS SELECT 2;\n")})
    assert r["relations_without_revoke_anon_authenticated"] == ["v_t"]


def test_comments_strings_and_dollar_bodies_are_not_statements(tmp_path):
    sql = (
        T.format(n="notes")
        + "-- ALTER TABLE skillup_dev.notes ENABLE ROW LEVEL SECURITY;\n"
        + "/* REVOKE ALL ON TABLE skillup_dev.notes FROM anon, authenticated; */\n"
        + "COMMENT ON TABLE skillup_dev.notes IS 'ALTER TABLE skillup_dev.notes ENABLE ROW LEVEL SECURITY; REVOKE ALL ON TABLE skillup_dev.notes FROM anon, authenticated';\n"
        + "CREATE FUNCTION skillup_dev.f() RETURNS void LANGUAGE sql AS $$ SELECT 1; REVOKE ALL ON TABLE skillup_dev.notes FROM anon, authenticated; $$;\n"
    )
    r = run(tmp_path, {"migration_a.sql": sql})
    assert r["tables_without_rls"] == ["notes"]
    assert r["relations_without_revoke_anon_authenticated"] == ["notes"]


def test_quoted_and_unqualified_names_resolve_to_the_schema(tmp_path):
    r = run(tmp_path, {"migration_a.sql": 'CREATE TABLE IF NOT EXISTS "skillup_dev"."Notes" (id int);\n'
                       'CREATE TABLE users2 (id int);\nALTER TABLE users2 ENABLE ROW LEVEL SECURITY;\n'})
    assert r["tables_without_rls"] == ["notes"]


def test_tables_in_other_schemas_are_ignored(tmp_path):
    r = run(tmp_path, {"migration_a.sql": "CREATE TABLE storage.objects2 (id int);\n"})
    assert r["tables"] == 0 and r["tables_without_rls"] == []


def test_base_schema_files_are_read_first(tmp_path):
    r = run(tmp_path, {"migration_a.sql": RLS.format(n="notes") + REV.format(n="notes")},
            base={"supabase-schema.sql": T.format(n="notes")})
    assert r["tables_without_rls"] == []


# ------------------------------------------------------------------ exclusions
def test_anon_accessed_and_policy_tables_are_excluded_not_reported(tmp_path):
    r = run(tmp_path, {"migration_a.sql": (
        T.format(n="users") + T.format(n="portfolio_items") + RLS.format(n="portfolio_items")
        + 'CREATE POLICY own ON skillup_dev.portfolio_items FOR ALL USING (auth.uid() = id);\n'
        + T.format(n="plain"))})
    assert r["tables_without_rls"] == ["plain"]
    assert set(r["excluded_direct_access"]) == {"users", "portfolio_items"}


def test_anon_accessed_list_matches_the_code_that_uses_the_anon_key():
    """Every table reached with the backend anon client must be excluded from lockdown."""
    res = repo_result()
    protected = set(res["tables_without_rls"]) | set(res["relations_without_revoke_anon_authenticated"])
    used = set()
    for path in (ROOT / "backend").rglob("*.py"):
        if any(part in {".venv", "tests", "node_modules"} for part in path.parts):
            continue
        used |= set(re.findall(r'get_client\(\)\s*\.table\(\s*"(\w+)"', path.read_text(encoding="utf-8", errors="replace"), re.S))
    assert used, "expected to find anon-client table accesses in the backend"
    excluded = set(res["excluded_direct_access"]) | set(audit.ANON_ACCESSED)
    assert used <= excluded, f"anon-key table access not excluded: {sorted(used - excluded)}"
    assert not (used & protected)


# ------------------------------------------------------------------ functions
DEFINER = ("CREATE OR REPLACE FUNCTION skillup_dev.{n}(p uuid, amt integer) RETURNS integer "
           "LANGUAGE sql SECURITY DEFINER SET search_path = '' AS $$ SELECT 1; $$;\n")
INVOKER = "CREATE FUNCTION skillup_dev.{n}() RETURNS integer LANGUAGE sql AS $$ SELECT 1 $$;\n"


def names(r):
    return [f["name"] for f in r["security_definer_functions_executable_by_anon"]]


def test_definer_function_is_exposed_until_public_is_revoked(tmp_path):
    assert names(run(tmp_path, {"migration_a.sql": DEFINER.format(n="bump")})) == ["bump"]


def test_revoke_from_public_closes_it(tmp_path):
    sql = DEFINER.format(n="bump") + "REVOKE ALL ON FUNCTION skillup_dev.bump(uuid, integer) FROM PUBLIC;\n"
    assert names(run(tmp_path, {"migration_a.sql": sql})) == []


def test_revoking_only_anon_leaves_public_access(tmp_path):
    sql = DEFINER.format(n="bump") + "REVOKE ALL ON FUNCTION skillup_dev.bump(uuid, integer) FROM anon, authenticated;\n"
    assert names(run(tmp_path, {"migration_a.sql": sql})) == ["bump"]


def test_explicit_grant_to_anon_after_public_revoke_reopens_it(tmp_path):
    sql = (DEFINER.format(n="bump") + "REVOKE ALL ON FUNCTION skillup_dev.bump(uuid, integer) FROM PUBLIC;\n"
           "GRANT EXECUTE ON FUNCTION skillup_dev.bump(uuid, integer) TO anon;\n")
    assert names(run(tmp_path, {"migration_a.sql": sql})) == ["bump"]


def test_invoker_functions_are_not_reported(tmp_path):
    r = run(tmp_path, {"migration_a.sql": INVOKER.format(n="harmless")})
    assert names(r) == [] and r["functions_security_definer"] == 0


def test_dropped_function_is_not_reported(tmp_path):
    sql = DEFINER.format(n="bump") + "DROP FUNCTION IF EXISTS skillup_dev.bump(uuid, integer);\n"
    assert names(run(tmp_path, {"migration_a.sql": sql})) == []


def test_policy_helper_functions_are_flagged_so_they_are_never_revoked(tmp_path):
    sql = (T.format(n="t") + DEFINER.format(n="is_member")
           + "CREATE POLICY p ON skillup_dev.t USING (skillup_dev.is_member(id, 1) > 0);\n")
    f = run(tmp_path, {"migration_a.sql": sql})["security_definer_functions_executable_by_anon"][0]
    assert f["name"] == "is_member" and f["used_in_policy"] is True
    assert "is_member" not in audit.emit_sql(run(tmp_path, {"migration_a.sql": sql}))


def test_arg_type_parsing_ignores_names_defaults_and_aliases():
    assert audit.arg_types("p_user uuid, amt int DEFAULT 5, label text") == ("uuid", "integer", "text")
    assert audit.arg_types("uuid, integer") == ("uuid", "integer")
    assert audit.arg_types("ts timestamptz, x double precision") == ("timestamp with time zone", "double precision")
    assert audit.arg_types("") == ()


# ------------------------------------------------------------------ dynamic SQL
def test_literal_array_loop_is_recognised_as_proof(tmp_path):
    do = ("DO $$ DECLARE t text; BEGIN FOREACH t IN ARRAY ARRAY['notes'] LOOP "
          "EXECUTE format('ALTER TABLE skillup_dev.%I ENABLE ROW LEVEL SECURITY', t); "
          "EXECUTE format('REVOKE ALL ON TABLE skillup_dev.%I FROM anon, authenticated', t); END LOOP; END $$;\n")
    r = run(tmp_path, {"migration_a.sql": T.format(n="notes") + do})
    assert r["tables_without_rls"] == [] and r["relations_without_revoke_anon_authenticated"] == []
    assert r["tables_rls_unverified_dynamic_sql"] == []


def test_function_revoke_loop_is_recognised_as_proof(tmp_path):
    do = ("DO $$ DECLARE r record; BEGIN FOR r IN SELECT p.oid::regprocedure AS sig FROM pg_proc p "
          "WHERE p.proname = ANY (ARRAY['bump']) LOOP "
          "EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated', r.sig); END LOOP; END $$;\n")
    assert names(run(tmp_path, {"migration_a.sql": DEFINER.format(n="bump") + do})) == []


def test_loop_over_a_table_that_does_not_exist_yet_proves_nothing(tmp_path):
    do = ("DO $$ DECLARE t text; BEGIN FOREACH t IN ARRAY ARRAY['notes'] LOOP "
          "EXECUTE format('ALTER TABLE skillup_dev.%I ENABLE ROW LEVEL SECURITY', t); END LOOP; END $$;\n")
    r = run(tmp_path, {"migration_a.sql": do, "migration_b.sql": T.format(n="notes")})
    assert r["tables_without_rls"] == ["notes"]


def test_other_do_blocks_leave_tables_unverified_not_lacking(tmp_path):
    do = "DO $$ BEGIN PERFORM some_helper('notes'); EXECUTE 'ALTER TABLE skillup_dev.notes ENABLE ROW LEVEL SECURITY'; END $$;\n"
    r = run(tmp_path, {"migration_a.sql": T.format(n="notes") + do})
    assert r["tables_without_rls"] == []
    assert r["tables_rls_unverified_dynamic_sql"] == ["notes"]


# ------------------------------------------------------------------ inputs
def test_undo_and_superseded_scripts_are_never_replayed(tmp_path):
    r = run(tmp_path, {
        "migration_a.sql": T.format(n="notes") + RLS.format(n="notes") + REV.format(n="notes") + DEFINER.format(n="bump")
        + "REVOKE ALL ON FUNCTION skillup_dev.bump(uuid, integer) FROM PUBLIC;\n",
        "migration_v2_down.sql": "DROP TABLE skillup_dev.notes;\nDROP FUNCTION skillup_dev.bump(uuid, integer);\n",
        "migration_career_intelligence.sql": "CREATE TABLE skillup_dev.ghost (id int);\n",
        "migration_zz_down.sql": "DROP TABLE skillup_dev.notes;\n",
    })
    assert r["tables"] == 1 and r["tables_without_rls"] == [] and names(r) == []


def test_hardening_migrations_are_replayed_last(tmp_path):
    r = run(tmp_path, {
        "migration_security_hardening_2099.sql": (
            "DO $$ DECLARE t text; BEGIN FOREACH t IN ARRAY ARRAY['notes'] LOOP "
            "EXECUTE format('ALTER TABLE skillup_dev.%I ENABLE ROW LEVEL SECURITY', t); "
            "EXECUTE format('REVOKE ALL ON TABLE skillup_dev.%I FROM anon, authenticated', t); END LOOP; END $$;\n"),
        "migration_zzz_late_table.sql": T.format(n="notes"),
    })
    assert r["tables_without_rls"] == []


def test_manifest_order_is_followed(tmp_path):
    (tmp_path / "backend" / "migrate").mkdir(parents=True)
    (tmp_path / "backend" / "migrate" / "manifest.toml").write_text(
        '[[entry]]\nid = "b"\nkind = "schema"\npath = "migration_b.sql"\n\n[[entry]]\nid = "a"\nkind = "schema"\npath = "migration_a.sql"\n',
        encoding="utf-8")
    # b creates the table, a enables RLS: only manifest order (b then a) yields a clean result.
    r = run(tmp_path, {"migration_a.sql": RLS.format(n="notes") + REV.format(n="notes"),
                       "migration_b.sql": T.format(n="notes")})
    assert r["tables_without_rls"] == []


# ------------------------------------------------------------------ emitted SQL
def test_emit_sql_lists_names_and_types_empty_arrays(tmp_path):
    r = run(tmp_path, {"migration_a.sql": T.format(n="notes") + DEFINER.format(n="bump")})
    sql = audit.emit_sql(r)
    assert "'notes'" in sql and "'bump'" in sql
    assert "ENABLE ROW LEVEL SECURITY" in sql and "GRANT EXECUTE ON FUNCTION %s TO service_role" in sql
    clean = audit.emit_sql(run(tmp_path, {"migration_a.sql": ""}))
    assert "ARRAY[]::text[]" in clean and not re.search(r"ARRAY\[\s*\](?!::)", clean)


def test_cli_exit_code_and_json(tmp_path, capsys):
    run(tmp_path, {"migration_a.sql": T.format(n="notes")})
    assert audit.main(["--root", str(tmp_path), "--json", "--strict"]) == 1
    assert json.loads(capsys.readouterr().out)["tables_without_rls"] == ["notes"]
    (tmp_path / "backend" / "migration_a.sql").write_text(T.format(n="notes") + RLS.format(n="notes") + REV.format(n="notes"))
    assert audit.main(["--root", str(tmp_path), "--strict"]) == 0


# ------------------------------------------------------------------ the repository itself
def test_hardening_migration_is_proposed_idempotent_and_transactional():
    sql = MIGRATION.read_text(encoding="utf-8")
    assert "PROPOSED, NOT APPLIED" in sql.splitlines()[2]
    body = sql[sql.index("BEGIN;"):]
    assert body.startswith("BEGIN;") and body.rstrip().endswith("COMMIT;")
    assert "to_regclass(" in body and "pg_proc" in body       # guarded for absent objects
    assert not re.search(r"\b(DROP|DELETE|TRUNCATE)\b", re.sub(r"--.*", "", body), re.I)  # access only, no data


def test_committed_migration_matches_what_the_analyzer_generates():
    res = repo_result((MIGRATION.name,))
    expected = audit.emit_sql(res)
    assert expected in MIGRATION.read_text(encoding="utf-8"), (
        "backend/migration_security_hardening_2026-11-21.sql is stale: regenerate its body with "
        "`python backend/scripts/audit_db_security.py --exclude migration_security_hardening_2026-11-21.sql --emit-sql`")


def test_repository_has_no_unprotected_tables_or_exposed_definer_functions():
    """Gate: a new migration that adds a table without RLS and a REVOKE, or a SECURITY DEFINER
    function without revoking PUBLIC, fails here until it is fixed (or a follow-up hardening
    migration is added)."""
    r = repo_result()
    assert r["tables_without_rls"] == []
    assert r["relations_without_revoke_anon_authenticated"] == []
    assert [f for f in r["security_definer_functions_executable_by_anon"] if not f["used_in_policy"]] == []
    assert r["tables_rls_unverified_dynamic_sql"] == [] and r["relations_revoke_unverified_dynamic_sql"] == []

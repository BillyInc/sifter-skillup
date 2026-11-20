"""Findings from the independent review of the apply engine (fake database, no real DB)."""

import pytest

from migrate import apply as ap
from migrate import cli
from migrate import executor as ex_mod
from migrate import lint
from migrate import manifest as mf
from migrate import sqltx

from tests.test_migrate_apply import (
    FakeExecutor,
    basic,
    entry,
    ids,
    make_root,
    manifest_of,
    seeded,
)


@pytest.fixture
def sqlite_bootstrap(monkeypatch):
    """The real ledger DDL is Postgres; the fake gets a sqlite-compatible stand-in."""
    from tests.test_migrate_apply import LEDGER_TABLE

    def bootstrap(executor, schema):
        executor.begin()
        executor.db.execute(LEDGER_TABLE)
        executor.commit()

    monkeypatch.setattr(ap, "bootstrap_ledger", bootstrap)


# ------------------------------------------------- (1) tokenizer-based transaction control


@pytest.mark.parametrize(
    "text",
    [
        "SELECT 1;\nEND;\n",  # END with no BEGIN
        "SELECT 1;\nABORT;\n",
        "SELECT 1;\nCOMMIT WORK;\n",
        "SELECT 1;\nCOMMIT; -- done\n",  # a COMMIT with no BEGIN, comment must not hide it
        "BEGIN TRANSACTION;\nSELECT 1;\nROLLBACK TO x;\nCOMMIT;\n",
        "BEGIN;\nSELECT 1;\nROLLBACK;\n",
        "BEGIN;\nSAVEPOINT s;\nSELECT 1;\nRELEASE s;\nCOMMIT;\n",
        "BEGIN ISOLATION LEVEL SERIALIZABLE;\nSELECT 1;\nCOMMIT;\n",  # transaction modes
        "BEGIN;\nSELECT 1;\nCOMMIT AND CHAIN;\n",
        "BEGIN;\nSELECT 1;\nCOMMIT PREPARED 'x';\n",
        "BEGIN;\nSELECT 1;\nEND; COMMIT;\n",  # extra close on one line
    ],
)
def test_prepare_refuses_every_spelling_of_transaction_control(text):
    with pytest.raises(ap.RefusedError):
        ap.prepare_sql(text, "f")


@pytest.mark.parametrize(
    "text",
    [
        "BEGIN;\nSELECT 1;\nCOMMIT; -- done\n",
        "BEGIN WORK;\nSELECT 1;\nEND;\n",
        "START TRANSACTION;\nSELECT 1;\nCOMMIT TRANSACTION;\n",
        "begin;\nselect 1;\ncommit;\n",
    ],
)
def test_prepare_strips_the_files_own_plain_pair(text):
    body = ap.prepare_sql(text, "f")
    assert "SELECT 1" in body.upper() and not sqltx.transaction_statements(body)


def test_commit_inside_dollar_body_comment_or_string_is_left_alone():
    text = (
        "BEGIN;\n"
        "CREATE FUNCTION f() RETURNS void LANGUAGE plpgsql AS $$\n"
        "BEGIN\n  NULL;\nCOMMIT;\nEND $$;\n"
        "/* a note\nCOMMIT;\n*/\n"
        "INSERT INTO t VALUES ('x;\nCOMMIT;\ny');\n"
        "COMMIT;\n"
    )
    body = ap.prepare_sql(text, "f")
    assert body.count("COMMIT;") == 3  # body, comment and string are untouched
    assert "BEGIN\n  NULL;" in body


def test_lint_and_apply_share_one_detector():
    text = "BEGIN;\nSELECT 1;\nEND;\n"
    result = lint.analyse_sql(text)
    assert (result.begin_count, result.commit_count) == (1, 1)
    assert result.explicit_transaction
    assert (
        lint.analyse_sql("SELECT 'COMMIT;';\n-- COMMIT;\nSELECT 1;").commit_count == 0
    )
    assert lint.analyse_sql("SELECT 1;\nABORT;\n").rollback_count == 1


def test_unrecognised_spelling_never_reaches_the_database(tmp_path):
    root = make_root(
        tmp_path, {"e.sql": "CREATE TABLE skillup_dev.z (x INTEGER);\nEND;\n"}
    )
    ex = seeded(FakeExecutor())
    result = ap.run_apply(
        manifest_of(entry("e")), root, ex, apply=True, allow_unknown_ledger_ids=True
    )
    assert not result.ok and result.outcomes[0].status == "refused"
    assert not ex.has_table("z") and ex.executed == []


# ------------------------------------------------- (2) ids the manifest does not know


def test_apply_refuses_ledger_ids_unknown_to_the_manifest(tmp_path):
    root, manifest = basic(tmp_path)
    ex = seeded(FakeExecutor())  # ledger holds 'old', which is not in the manifest
    for apply_flag in (False, True):
        result = ap.run_apply(
            manifest, root, ex, apply=apply_flag, allow_unknown_ledger_ids=False
        )
        assert not result.ok and "does not know" in result.messages[0]
    assert not ex.has_table("a")
    ok = ap.run_apply(manifest, root, ex, apply=True, allow_unknown_ledger_ids=True)
    assert ok.ok and ex.has_table("a")


def test_renamed_entry_does_not_run_twice(tmp_path):
    root = make_root(
        tmp_path, {"new_name.sql": "CREATE TABLE skillup_dev.q (x INTEGER);\n"}
    )
    ex = FakeExecutor()
    ex.db.execute(
        "CREATE TABLE skillup_dev.q (x INTEGER)"
    )  # already applied under the old id
    ex.db.execute(
        "INSERT INTO skillup_dev.schema_migrations (id, checksum, kind) VALUES ('old_name', 'x', 'applied')"
    )
    result = ap.run_apply(
        manifest_of(entry("new_name")),
        root,
        ex,
        apply=True,
        allow_unknown_ledger_ids=False,
    )
    assert not result.ok and ex.executed == []


def test_cli_flag_allows_unknown_ledger_ids(tmp_path):
    basic(tmp_path)
    from tests.test_migrate_apply import run_cli

    assert run_cli(["apply"], seeded(FakeExecutor()), tmp_path) == 1
    assert (
        run_cli(
            ["apply", "--allow-unknown-ledger-ids"], seeded(FakeExecutor()), tmp_path
        )
        == 0
    )


# ------------------------------------------------- (3) --empty-database is verified


def test_empty_database_flag_refused_when_the_schema_already_has_tables(tmp_path):
    root, manifest = basic(tmp_path)
    ex = FakeExecutor(with_ledger=False)
    ex.db.execute("CREATE TABLE skillup_dev.users (id INTEGER)")
    result = ap.run_apply(manifest, root, ex, apply=True, empty_database=True)
    assert not result.ok and "--empty-database refused" in result.messages[0]
    assert "users" in result.messages[0]
    assert not ex.has_table("schema_migrations") and not ex.has_table("a")


def test_empty_database_flag_works_on_a_really_empty_schema(tmp_path, sqlite_bootstrap):
    root, manifest = basic(tmp_path)
    ex = FakeExecutor(with_ledger=False)
    result = ap.run_apply(manifest, root, ex, apply=True, empty_database=True)
    assert result.ok and ids(ex) == ["migration_a", "migration_b"]


def test_empty_database_flag_refuses_when_ledger_exists_but_schema_has_tables(tmp_path):
    root, manifest = basic(tmp_path)
    ex = FakeExecutor()  # empty ledger present
    ex.db.execute("CREATE TABLE skillup_dev.users (id INTEGER)")
    result = ap.run_apply(manifest, root, ex, apply=True, empty_database=True)
    assert not result.ok and not ex.has_table("a")


# ------------------------------------------------- (4) ledger detection and bootstrap


class HiddenLedgerExecutor(FakeExecutor):
    """The ledger table exists but the role cannot see it (information_schema-style)."""

    def table_exists(self, schema, name):
        return (
            False if name == "schema_migrations" else super().table_exists(schema, name)
        )


def test_a_ledger_that_stays_invisible_after_bootstrap_stops_the_run(
    tmp_path, sqlite_bootstrap
):
    root, manifest = basic(tmp_path)
    ex = HiddenLedgerExecutor(with_ledger=False)
    result = ap.run_apply(manifest, root, ex, apply=True, empty_database=True)
    assert not result.ok and "still not visible" in result.messages[0]
    assert not ex.has_table("a")


def test_psycopg_table_exists_uses_to_regclass_not_information_schema():
    import inspect

    source = inspect.getsource(ex_mod.PsycopgExecutor.table_exists)
    assert "to_regclass" in source and "information_schema" not in source
    assert "pg_class" in inspect.getsource(ex_mod.PsycopgExecutor.list_tables)


# ------------------------------------------------- (5) pooler URLs and one backend connection


@pytest.mark.parametrize(
    "url",
    [
        "postgresql://u:secretpw@aws-0-x.pooler.supabase.com:6543/postgres",
        "postgresql://u:secretpw@h:5432/postgres?pgbouncer=true",
    ],
)
def test_transaction_mode_pooler_urls_are_refused_without_echoing_the_url(url):
    with pytest.raises(ex_mod.ExecutorError) as raised:
        ex_mod.check_connection_url(url)
    assert "secretpw" not in str(raised.value) and "6543" in str(raised.value)
    with pytest.raises(ex_mod.ExecutorError):
        ex_mod.connect_from_env({ex_mod.URL_ENV: url})


@pytest.mark.parametrize(
    "url",
    [
        "postgresql://u:pw@aws-0-x.pooler.supabase.com:5432/postgres",  # session pooler
        "postgresql://u:pw@db.abc.supabase.co:5432/postgres",  # direct
    ],
)
def test_session_pooler_and_direct_urls_are_allowed(url):
    ex_mod.check_connection_url(url)


@pytest.mark.parametrize("change_after", [1, 2])
def test_a_changed_backend_connection_rolls_the_entry_back(tmp_path, change_after):
    root, manifest = basic(tmp_path)
    ex = seeded(FakeExecutor())
    ex.pid_change_after = (
        change_after  # pid calls: 1 = lock, 2 = entry start, 3 = before commit
    )
    result = ap.run_apply(manifest, root, ex, apply=True, allow_unknown_ledger_ids=True)
    assert not result.ok and "connection changed" in result.messages[0]
    assert not ex.has_table("a") and ids(ex) == ["old"]


# ------------------------------------------------- (6) destructive SQL in a schema/seed entry


def test_schema_entry_with_destructive_sql_needs_approval(tmp_path):
    root = make_root(
        tmp_path,
        {
            "d.sql": "CREATE TABLE skillup_dev.keep (x INTEGER);\nDROP TABLE skillup_dev.keep;\n",
            "after.sql": "CREATE TABLE skillup_dev.after (x INTEGER);\n",
        },
    )
    manifest = manifest_of(entry("d"), entry("after"))
    ex = seeded(FakeExecutor())
    result = ap.run_apply(manifest, root, ex, apply=True, allow_unknown_ledger_ids=True)
    assert result.outcomes[-1].status == "needs_approval" and result.ok
    assert "destructive" in result.outcomes[-1].detail
    assert ex.executed == [] and not ex.has_table("after")
    approved = ap.run_apply(
        manifest,
        root,
        ex,
        apply=True,
        approve=["d"],
        approval_ref="ticket 1",
        allow_unknown_ledger_ids=True,
    )
    assert approved.ok and ex.has_table("after")
    assert ex.query(
        "SELECT approval_ref FROM skillup_dev.schema_migrations WHERE id = 'd'"
    ) == [("ticket 1",)]


# ------------------------------------------------- (7) refused / manual entries halt dependents


def _rebuild_manifest(tmp_path):
    root = make_root(
        tmp_path,
        {
            "needs_r.sql": "CREATE TABLE skillup_dev.needs_r (x INTEGER);\n",
            "independent.sql": "CREATE TABLE skillup_dev.independent (x INTEGER);\n",
            "r.sql": "SELECT 1;\n",
        },
    )
    manifest = manifest_of(
        entry(
            "needs_r",
            external_requires=[{"ref": "r", "evidence": "needs a table r creates"}],
        ),
        entry("independent"),
        entry("r", kind="rebuild", manual_only=True, approval="staging only, by hand"),
    )
    return root, manifest


def test_entry_that_depends_on_a_refused_rebuild_is_blocked_but_others_run(tmp_path):
    root, manifest = _rebuild_manifest(tmp_path)
    ex = seeded(FakeExecutor())
    result = ap.run_apply(manifest, root, ex, apply=True, allow_unknown_ledger_ids=True)
    by_id = {o.id: o for o in result.outcomes}
    assert (
        by_id["needs_r"].status == "skipped"
        and "depends on r" in by_id["needs_r"].detail
    )
    assert by_id["independent"].status == "applied" and by_id["r"].status == "skipped"
    assert not ex.has_table("needs_r") and ex.has_table("independent")


# ------------------------------------------------- (8) commit acknowledgement failure


class CommitAckFails(FakeExecutor):
    def commit(self):
        super().commit()  # the database commits ...
        raise ex_mod.ExecutorError("connection reset")  # ... but the ack is lost


def test_commit_ack_failure_does_not_claim_a_rollback(tmp_path):
    root, manifest = basic(tmp_path)
    ex = seeded(CommitAckFails())
    result = ap.run_apply(manifest, root, ex, apply=True, allow_unknown_ledger_ids=True)
    assert not result.ok
    message = result.messages[0]
    assert (
        "COMMITTED" in message and "status" in message and "rolled back" not in message
    )
    assert ids(ex) == ["migration_a", "old"]


# ------------------------------------------------- (9) import-baseline re-verifies


def _baseline_file(tmp_path, root, manifest, **overrides):
    import json

    row = {
        "id": "migration_a",
        "checksum": mf.entry_checksum(manifest.entries[0], root),
        "kind": "baseline",
        "operator": "sam",
        "preflight_sha256": "ab" * 32,
    }
    row.update(overrides)
    path = tmp_path / "baseline.json"
    path.write_text(json.dumps({"applied": [row]}))
    return path


def test_import_baseline_refuses_a_checksum_that_does_not_match_the_manifest(
    tmp_path, capsys
):
    from tests.test_migrate_apply import run_cli

    root, manifest = basic(tmp_path)
    path = _baseline_file(tmp_path, root, manifest, checksum="0" * 64)
    assert (
        run_cli(["import-baseline", str(path), "--apply"], FakeExecutor(), tmp_path)
        == 1
    )
    assert "does not match" in capsys.readouterr().err


def test_import_baseline_refuses_bad_hash_or_missing_operator(tmp_path):
    from tests.test_migrate_apply import run_cli

    root, manifest = basic(tmp_path)
    for bad in ({"preflight_sha256": "ab"}, {"operator": " "}):
        path = _baseline_file(tmp_path, root, manifest, **bad)
        assert run_cli(["import-baseline", str(path)], FakeExecutor(), tmp_path) == 1


def test_import_baseline_refuses_rebuild_entries(tmp_path, capsys):
    import json

    root = make_root(
        tmp_path, {"migration_a.sql": "SELECT 1;\n", "migration_b.sql": "SELECT 2;\n"}
    )
    manifest_text = (
        '[[entry]]\nid = "migration_a"\nkind = "rebuild"\npath = "migration_a.sql"\n'
        '[[entry]]\nid = "migration_b"\nkind = "schema"\npath = "migration_b.sql"\n'
    )
    mpath = tmp_path / "manifest.toml"
    mpath.write_text(manifest_text)
    parsed = mf.load_manifest(mpath)
    row = {
        "id": "migration_a",
        "checksum": mf.entry_checksum(parsed.entries[0], root),
        "kind": "baseline",
        "operator": "sam",
        "preflight_sha256": "ab" * 32,
    }
    path = tmp_path / "b.json"
    path.write_text(json.dumps({"applied": [row]}))
    code = cli.main(
        ["--manifest", str(mpath), "--root", str(root), "import-baseline", str(path)],
        connect=lambda: FakeExecutor(),
    )
    assert code == 1 and "rebuild" in capsys.readouterr().err


# ------------------------------------------------- (10) timeouts


def test_each_entry_sets_local_timeouts_and_they_are_configurable(tmp_path):
    root, manifest = basic(tmp_path)
    ex = seeded(FakeExecutor())
    ap.run_apply(
        manifest,
        root,
        ex,
        apply=True,
        allow_unknown_ledger_ids=True,
        lock_timeout_ms=1234,
        statement_timeout_ms=5678,
    )
    assert ex.timeouts == [(1234, 5678), (1234, 5678)]
    ex2 = seeded(FakeExecutor())
    ap.run_apply(manifest, root, ex2, apply=True, allow_unknown_ledger_ids=True)
    assert (
        ex2.timeouts
        == [(ap.DEFAULT_LOCK_TIMEOUT_MS, ap.DEFAULT_STATEMENT_TIMEOUT_MS)] * 2
    )


def test_psycopg_timeouts_are_set_local():
    import inspect

    source = inspect.getsource(ex_mod.PsycopgExecutor.set_timeouts)
    assert (
        "SET LOCAL lock_timeout" in source and "SET LOCAL statement_timeout" in source
    )


# ------------------------------------------------- (11) a dry run that stops for approval is not clean


def test_dry_run_stopping_at_an_approval_entry_exits_nonzero(tmp_path):
    root = make_root(
        tmp_path,
        {"a.sql": "CREATE TABLE skillup_dev.a (x INTEGER);\n", "g.sql": "SELECT 1;\n"},
    )
    manifest = manifest_of(
        entry("a"), entry("g", kind="destructive", approval="ok to drop")
    )
    ex = seeded(FakeExecutor())
    dry = ap.run_apply(manifest, root, ex, apply=False, allow_unknown_ledger_ids=True)
    assert dry.ok and dry.exit_code == ap.EXIT_NEEDS_APPROVAL != 0
    assert [o.status for o in dry.outcomes] == ["would_run", "needs_approval"]
    clean = ap.run_apply(
        manifest_of(entry("a")), root, ex, apply=False, allow_unknown_ledger_ids=True
    )
    assert clean.exit_code == 0

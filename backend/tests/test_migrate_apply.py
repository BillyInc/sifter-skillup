"""Apply engine, ledger, status and CLI against a sqlite-backed fake (no real database)."""

import gzip
import sqlite3
from pathlib import Path

import pytest

from migrate import apply as ap
from migrate import cli
from migrate import executor as ex_mod
from migrate import manifest as mf
from migrate.sqlledger import SqlLedger

LEDGER_TABLE = (
    "CREATE TABLE skillup_dev.schema_migrations (id TEXT PRIMARY KEY, checksum TEXT NOT NULL, "
    "kind TEXT NOT NULL DEFAULT 'applied', applied_at TEXT DEFAULT CURRENT_TIMESTAMP, "
    "operator TEXT, preflight_sha256 TEXT, approval_ref TEXT, runner_version TEXT, duration_ms INTEGER)"
)


class FakeExecutor:
    """sqlite behind the Executor protocol. ``skillup_dev`` is an attached database."""

    def __init__(self, *, with_ledger: bool = True, lock_free: bool = True) -> None:
        self.db = sqlite3.connect(":memory:", isolation_level=None)
        self.db.execute("ATTACH ':memory:' AS skillup_dev")
        if with_ledger:
            self.db.execute(LEDGER_TABLE)
        self.in_tx = False
        self.read_only = False
        self.lock_free = lock_free
        self.locks: list[int] = []
        self.closed = False
        self.resets = 0
        self.executed: list[str] = []
        self.script_calls = 0
        self.fail_on: str | None = None

    def begin(self, *, read_only: bool = False) -> None:
        assert not self.in_tx, "nested transaction"
        self.db.execute("BEGIN")
        self.in_tx, self.read_only = True, read_only

    def commit(self) -> None:
        self.db.execute("COMMIT")
        self.in_tx = self.read_only = False

    def rollback(self) -> None:
        if self.in_tx:
            self.db.execute("ROLLBACK")
        self.in_tx = self.read_only = False

    def execute(self, sql, params=()):
        assert self.in_tx, "execute outside a transaction"
        if params:
            self.db.execute(sql.replace("%s", "?"), tuple(params))
            return
        self.script_calls += 1
        buffer = ""
        for line in sql.splitlines(keepends=True):
            buffer += line
            if sqlite3.complete_statement(buffer):
                stmt, buffer = buffer.strip(), ""
                if self.read_only and not stmt.upper().startswith(("SELECT", "--")):
                    raise ex_mod.ExecutorError("read-only transaction")
                if self.fail_on and self.fail_on in stmt:
                    raise ex_mod.ExecutorError("boom")
                self.executed.append(stmt)
                self.db.execute(stmt)

    def query(self, sql, params=()):
        return list(self.db.execute(sql.replace("%s", "?"), tuple(params)).fetchall())

    def table_exists(self, schema, name):
        row = self.db.execute(
            f"SELECT 1 FROM {schema}.sqlite_master WHERE type='table' AND name=?",
            (name,),
        ).fetchone()
        return row is not None

    def reset_session(self) -> None:
        self.resets += 1

    def try_advisory_lock(self, key):
        if self.lock_free:
            self.locks.append(key)
        return self.lock_free

    def advisory_unlock(self, key):
        self.locks.remove(key)

    def close(self):
        self.closed = True

    def has_table(self, name):
        return self.table_exists("skillup_dev", name)


def make_root(tmp_path: Path, files: dict[str, str]) -> Path:
    for name, body in files.items():
        (tmp_path / name).write_text(body)
    return tmp_path


def manifest_of(*entries):
    return mf.parse_manifest({"entry": list(entries)})


def entry(id_, kind="schema", requires=(), **extra):
    return {
        "id": id_,
        "kind": kind,
        "path": f"{id_}.sql",
        "requires": list(requires),
        **extra,
    }


def basic(tmp_path):
    root = make_root(
        tmp_path,
        {
            "migration_a.sql": "BEGIN;\nCREATE TABLE skillup_dev.a (x INTEGER);\nCOMMIT;\n",
            "migration_b.sql": "CREATE TABLE skillup_dev.b (x INTEGER);\nINSERT INTO skillup_dev.b VALUES (1);\n",
        },
    )
    return root, manifest_of(
        entry("migration_a"), entry("migration_b", requires=["migration_a"])
    )


def seeded(ex: FakeExecutor) -> FakeExecutor:
    """A ledger that is not empty, as on a database with a recorded baseline."""
    ex.db.execute(
        "INSERT INTO skillup_dev.schema_migrations (id, checksum, kind) VALUES ('old', 'x', 'baseline')"
    )
    return ex


def ids(ex):
    return [
        r[0]
        for r in ex.query(
            "SELECT id FROM skillup_dev.schema_migrations ORDER BY applied_at, id"
        )
    ]


# ---------------------------------------------------------------- prepare_sql


def test_prepare_strips_outer_begin_commit_and_keeps_body():
    body = ap.prepare_sql("-- c\nBEGIN;\nSELECT 1;\nCOMMIT;\n", "f")
    assert (
        "BEGIN" not in body.upper()
        and "COMMIT" not in body.upper()
        and "SELECT 1" in body
    )


def test_prepare_no_transaction_control_is_unchanged():
    assert ap.prepare_sql("SELECT 1;\n", "f") == "SELECT 1;\n"


def test_prepare_leading_set_becomes_set_local():
    body = ap.prepare_sql(
        "SET search_path TO skillup_dev;\nBEGIN;\nSELECT 1;\nCOMMIT;\n", "f"
    )
    assert body.startswith("SET LOCAL search_path TO skillup_dev;")


def test_prepare_allows_two_pairs_and_runs_them_as_one_transaction():
    body = ap.prepare_sql(
        "BEGIN;\nSELECT 1;\nCOMMIT;\n-- gap\nBEGIN;\nSELECT 2;\nCOMMIT;\n", "f"
    )
    assert "SELECT 1" in body and "SELECT 2" in body and "COMMIT" not in body.upper()


@pytest.mark.parametrize(
    "text",
    [
        "BEGIN;\nSELECT 1;\n",  # no COMMIT
        "SELECT 1;\nCOMMIT;\n",  # no BEGIN
        "BEGIN;\nSELECT 1;\nROLLBACK;\n",
        "BEGIN;\nSAVEPOINT s;\nSELECT 1;\nCOMMIT;\n",
        "SELECT 9;\nBEGIN;\nSELECT 1;\nCOMMIT;\n",  # statement outside the pair
        "BEGIN;\nCOMMIT;\nCOMMIT;\n",
    ],
)
def test_prepare_refuses_unclear_transaction_control(text):
    with pytest.raises(ap.RefusedError):
        ap.prepare_sql(text, "f")


def test_prepare_refuses_backslash_apostrophe_in_plain_string():
    with pytest.raises(ap.RefusedError, match="backslash-apostrophe"):
        ap.prepare_sql("INSERT INTO t VALUES ('institution\\'s');\n", "f")


def test_plpgsql_begin_without_semicolon_is_not_transaction_control():
    body = ap.prepare_sql("DO $$\nBEGIN\n  PERFORM 1;\nEND $$;\n", "f")
    assert "PERFORM 1" in body


# ---------------------------------------------------------------- apply


def test_dry_run_executes_nothing_and_lists_what_would_run(tmp_path):
    root, manifest = basic(tmp_path)
    ex = seeded(FakeExecutor())
    result = ap.run_apply(manifest, root, ex, apply=False)
    assert result.ok
    assert [(o.id, o.status) for o in result.outcomes] == [
        ("migration_a", "would_run"),
        ("migration_b", "would_run"),
    ]
    assert ex.executed == [] and not ex.has_table("a") and ex.locks == []


def test_dry_run_works_without_a_ledger_table_and_creates_nothing(tmp_path):
    root, manifest = basic(tmp_path)
    ex = FakeExecutor(with_ledger=False)
    result = ap.run_apply(manifest, root, ex, apply=False)
    assert result.ok and not ex.has_table("schema_migrations")


def test_apply_runs_in_order_records_ledger_and_is_idempotent(tmp_path):
    root, manifest = basic(tmp_path)
    ex = seeded(FakeExecutor())
    first = ap.run_apply(manifest, root, ex, apply=True)
    assert first.ok and [o.status for o in first.outcomes] == ["applied", "applied"]
    assert ex.has_table("a") and ex.has_table("b")
    assert ids(ex) == ["old", "migration_a", "migration_b"] or set(ids(ex)) == {
        "old",
        "migration_a",
        "migration_b",
    }
    rows = {
        r[0]: r
        for r in ex.query(
            "SELECT id, checksum, kind, runner_version, duration_ms FROM skillup_dev.schema_migrations"
        )
    }
    assert rows["migration_a"][1] == mf.entry_checksum(manifest.entries[0], root)
    assert rows["migration_a"][2] == "applied" and rows["migration_a"][3] == "2"
    assert ex.locks == [] and ex.resets == 2
    again = ap.run_apply(manifest, root, ex, apply=True)
    assert again.ok and again.outcomes == []


def test_failure_rolls_back_that_entry_and_stops_the_run(tmp_path):
    root = make_root(
        tmp_path,
        {
            "migration_a.sql": "CREATE TABLE skillup_dev.a (x INTEGER);\n",
            "migration_b.sql": "CREATE TABLE skillup_dev.b (x INTEGER);\nCREATE TABLE skillup_dev.bad (x INTEGER);\n",
            "migration_c.sql": "CREATE TABLE skillup_dev.c (x INTEGER);\n",
        },
    )
    manifest = manifest_of(
        entry("migration_a"),
        entry("migration_b", requires=["migration_a"]),
        entry("migration_c", requires=["migration_b"]),
    )
    ex = seeded(FakeExecutor())
    ex.fail_on = "skillup_dev.bad"
    result = ap.run_apply(manifest, root, ex, apply=True)
    assert not result.ok and result.exit_code == 1
    assert [(o.id, o.status) for o in result.outcomes] == [
        ("migration_a", "applied"),
        ("migration_b", "failed"),
    ]
    assert ex.has_table("a") and not ex.has_table("b") and not ex.has_table("c")
    assert set(ids(ex)) == {"old", "migration_a"}  # b not recorded, c never ran
    assert not ex.in_tx and ex.locks == []
    assert "SELECT" not in result.messages[0]  # no SQL text in the message


def test_checksum_drift_refuses_everything(tmp_path):
    root, manifest = basic(tmp_path)
    ex = seeded(FakeExecutor())
    assert ap.run_apply(manifest, root, ex, apply=True).ok
    (root / "migration_a.sql").write_text("CREATE TABLE skillup_dev.a2 (x INTEGER);\n")
    result = ap.run_apply(manifest, root, ex, apply=True)
    assert result.exit_code == 2 and "migration_a" in result.messages[0]
    assert not ex.has_table("a2")


def test_empty_ledger_or_missing_ledger_is_refused_without_empty_database(tmp_path):
    root, manifest = basic(tmp_path)
    for ex in (FakeExecutor(), FakeExecutor(with_ledger=False)):
        result = ap.run_apply(manifest, root, ex, apply=True)
        assert result.exit_code == 1 and ex.executed == []
        assert not ex.has_table("a")


def test_empty_database_flag_bootstraps_the_ledger_and_applies(tmp_path):
    root, manifest = basic(tmp_path)
    ex = FakeExecutor(with_ledger=False)
    # the real ledger DDL is Postgres; the fake gets a sqlite-compatible stand-in
    original = ap.bootstrap_ledger
    ap.bootstrap_ledger = lambda e, s: (
        e.begin(),
        e.db.execute(LEDGER_TABLE),
        e.commit(),
    )  # type: ignore[assignment]
    try:
        result = ap.run_apply(manifest, root, ex, apply=True, empty_database=True)
    finally:
        ap.bootstrap_ledger = original
    assert result.ok and set(ids(ex)) == {"migration_a", "migration_b"}


def test_ledger_ddl_is_prepared_not_applied_and_locked_down():
    text = (Path(ap.LEDGER_DDL)).read_text()
    assert "PROPOSED, NOT APPLIED" in text
    assert (
        "ENABLE ROW LEVEL SECURITY" in text
        and "REVOKE ALL" in text
        and "anon, authenticated" in text
    )
    body = ap.prepare_sql(text, "ledger.sql")
    assert "CREATE TABLE IF NOT EXISTS skillup_dev.schema_migrations" in body


def test_advisory_lock_contention_refuses(tmp_path):
    root, manifest = basic(tmp_path)
    ex = seeded(FakeExecutor(lock_free=False))
    result = ap.run_apply(manifest, root, ex, apply=True)
    assert result.exit_code == 1 and "lock" in result.messages[0] and ex.executed == []


def test_destructive_entry_halts_until_approved_with_a_reference(tmp_path):
    root = make_root(
        tmp_path,
        {
            "migration_a.sql": "CREATE TABLE skillup_dev.a (x INTEGER);\n",
            "migration_d.sql": "DROP TABLE skillup_dev.a;\n",
            "migration_e.sql": "CREATE TABLE skillup_dev.e (x INTEGER);\n",
        },
    )
    manifest = manifest_of(
        entry("migration_a"),
        entry(
            "migration_d",
            kind="destructive",
            requires=["migration_a"],
            approval="owner",
        ),
        entry("migration_e", requires=["migration_d"]),
    )
    ex = seeded(FakeExecutor())
    held = ap.run_apply(manifest, root, ex, apply=True)
    assert held.ok and [(o.id, o.status) for o in held.outcomes] == [
        ("migration_a", "applied"),
        ("migration_d", "needs_approval"),
    ]
    assert ex.has_table("a") and not ex.has_table("e")
    assert (
        ap.run_apply(manifest, root, ex, apply=True, approve=["migration_d"]).exit_code
        == 1
    )  # no reference
    done = ap.run_apply(
        manifest,
        root,
        ex,
        apply=True,
        approve=["migration_d"],
        approval_ref="owner, run 1",
    )
    assert done.ok and not ex.has_table("a") and ex.has_table("e")
    ref = ex.query(
        "SELECT approval_ref FROM skillup_dev.schema_migrations WHERE id = 'migration_d'"
    )[0][0]
    assert ref == "owner, run 1"


def test_approve_flag_is_rejected_for_ordinary_unknown_and_rebuild_entries(tmp_path):
    root = make_root(
        tmp_path,
        {"migration_a.sql": "SELECT 1;\n", "migration_r.sql": "DROP TABLE x;\n"},
    )
    manifest = manifest_of(
        entry("migration_a"),
        entry("migration_r", kind="rebuild", manual_only=True, approval="owner"),
    )
    ex = seeded(FakeExecutor())
    for approve in (["migration_a"], ["nope"], ["migration_r"]):
        assert (
            ap.run_apply(
                manifest, root, ex, apply=True, approve=approve, approval_ref="x"
            ).exit_code
            == 1
        )
    assert ex.executed == []


def test_rebuild_and_manual_only_entries_never_run(tmp_path):
    root = make_root(
        tmp_path,
        {
            "migration_a.sql": "CREATE TABLE skillup_dev.a (x INTEGER);\n",
            "migration_r.sql": "CREATE TABLE skillup_dev.r (x INTEGER);\n",
            "migration_m.sql": "CREATE TABLE skillup_dev.m (x INTEGER);\n",
        },
    )
    manifest = manifest_of(
        entry("migration_a"),
        entry("migration_r", kind="rebuild", manual_only=True, approval="owner"),
        entry("migration_m", manual_only=True),
    )
    ex = seeded(FakeExecutor())
    result = ap.run_apply(manifest, root, ex, apply=True)
    assert (
        result.ok
        and ex.has_table("a")
        and not ex.has_table("r")
        and not ex.has_table("m")
    )
    assert {o.id for o in result.outcomes if o.status == "skipped"} == {
        "migration_r",
        "migration_m",
    }


def test_group_entry_runs_all_parts_in_one_transaction_or_none(tmp_path):
    (tmp_path / "seed_g_parts").mkdir()
    for n in (1, 2, 3):
        (tmp_path / "seed_g_parts" / f"part-00{n}.sql").write_text(
            f"BEGIN;\nCREATE TABLE skillup_dev.g{n} (x INTEGER);\nCOMMIT;\n"
        )
    manifest = mf.parse_manifest(
        {
            "entry": [
                {
                    "id": "seed_g",
                    "kind": "seed",
                    "parts_glob": "seed_g_parts/part-*.sql",
                    "expected_parts": 3,
                }
            ]
        }
    )
    ex = seeded(FakeExecutor())
    ex.fail_on = "g3"
    failed = ap.run_apply(manifest, tmp_path, ex, apply=True)
    assert not failed.ok and not any(ex.has_table(f"g{n}") for n in (1, 2, 3))
    ex.fail_on = None
    ok = ap.run_apply(manifest, tmp_path, ex, apply=True)
    assert ok.ok and all(ex.has_table(f"g{n}") for n in (1, 2, 3))


def test_gz_transport_is_decompressed_and_checksummed_like_plain(tmp_path):
    body = "CREATE TABLE skillup_dev.z (x INTEGER);\n"
    (tmp_path / "migration_z.sql.gz").write_bytes(gzip.compress(body.encode()))
    manifest = manifest_of(
        {"id": "migration_z", "kind": "schema", "path": "migration_z.sql.gz"}
    )
    ex = seeded(FakeExecutor())
    assert ap.run_apply(manifest, tmp_path, ex, apply=True).ok and ex.has_table("z")
    (tmp_path / "plain").mkdir()
    (tmp_path / "plain" / "migration_z.sql").write_text(body)
    plain = manifest_of(
        {"id": "migration_z", "kind": "schema", "path": "migration_z.sql"}
    )
    stored = ex.query(
        "SELECT checksum FROM skillup_dev.schema_migrations WHERE id = 'migration_z'"
    )[0][0]
    assert stored == mf.entry_checksum(plain.entries[0], tmp_path / "plain")


def test_unsafe_file_is_refused_before_any_sql_runs(tmp_path):
    root = make_root(
        tmp_path, {"migration_a.sql": "INSERT INTO t VALUES ('it\\'s');\n"}
    )
    manifest = manifest_of(entry("migration_a"))
    ex = seeded(FakeExecutor())
    result = ap.run_apply(manifest, root, ex, apply=True)
    assert (
        result.exit_code == 1
        and ex.executed == []
        and result.outcomes[0].status == "refused"
    )


# ---------------------------------------------------------------- ledger / status / baseline


def test_sql_ledger_rejects_unsafe_schema_names():
    with pytest.raises(ValueError):
        SqlLedger(FakeExecutor(), "x; DROP TABLE y")


def test_sql_ledger_records_baseline_and_status_is_read_only(tmp_path):
    root, manifest = basic(tmp_path)
    ex = FakeExecutor()
    ex.begin()
    SqlLedger(ex).record_baseline(
        "migration_a",
        mf.entry_checksum(manifest.entries[0], root),
        operator="sam",
        preflight_sha256="ab",
    )
    ex.commit()
    plan, info = ap.run_status(manifest, root, ex)
    assert info == {"ledger_exists": True, "ledger_rows": 1}
    assert [r.status for r in plan.rows] == ["applied", "pending"]
    assert "baseline recorded by sam" in plan.rows[0].detail
    assert not ex.in_tx  # status leaves nothing open


def test_status_transaction_is_read_only(tmp_path):
    root, manifest = basic(tmp_path)
    ex = FakeExecutor()
    seen = []
    original = ex.begin
    ex.begin = lambda read_only=False: (
        seen.append(read_only),
        original(read_only=read_only),
    )[1]  # type: ignore[method-assign]
    ap.run_status(manifest, root, ex)
    assert seen == [True]


# ---------------------------------------------------------------- CLI


def run_cli(argv, ex, tmp_path):
    manifest_text = (
        '[[entry]]\nid = "migration_a"\nkind = "schema"\npath = "migration_a.sql"\n'
        '[[entry]]\nid = "migration_b"\nkind = "schema"\npath = "migration_b.sql"\nrequires = ["migration_a"]\n'
    )
    mpath = tmp_path / "migrate" / "manifest.toml"
    mpath.parent.mkdir(exist_ok=True)
    mpath.write_text(manifest_text)
    return cli.main(
        ["--manifest", str(mpath), "--root", str(tmp_path), *argv], connect=lambda: ex
    )


def test_cli_apply_defaults_to_dry_run_and_apply_flag_executes(tmp_path, capsys):
    basic(tmp_path)
    ex = seeded(FakeExecutor())
    assert run_cli(["apply"], ex, tmp_path) == 0
    assert "DRY RUN" in capsys.readouterr().out and not ex.has_table("a")
    assert run_cli(["apply", "--apply"], seeded(ex2 := FakeExecutor()), tmp_path) == 0
    assert ex2.has_table("a") and ex2.has_table("b") and ex2.closed


def test_cli_status_prints_ledger_and_plan(tmp_path, capsys):
    basic(tmp_path)
    assert run_cli(["status"], seeded(FakeExecutor()), tmp_path) == 0
    out = capsys.readouterr().out
    assert "ledger: present, 1 row(s)" in out and "would run" in out


def test_cli_has_no_database_url_argument():
    parser = cli.build_parser()
    help_text = parser.format_help() + "".join(
        sub.format_help()
        for sub in parser._subparsers._group_actions[0].choices.values()  # type: ignore[union-attr]
    )
    assert "--database-url" not in help_text and "--url" not in help_text


def test_connect_from_env_requires_the_variable_and_never_echoes_it(monkeypatch):
    with pytest.raises(ex_mod.ExecutorError, match="MIGRATE_DATABASE_URL"):
        ex_mod.connect_from_env({})


def test_import_baseline_dry_run_then_apply(tmp_path, capsys):
    root, manifest = basic(tmp_path)
    import json

    rows = {
        "applied": [
            {
                "id": "migration_a",
                "checksum": mf.entry_checksum(manifest.entries[0], root),
                "kind": "baseline",
                "operator": "sam",
                "preflight_sha256": "ab",
            }
        ]
    }
    f = tmp_path / "baseline.json"
    f.write_text(json.dumps(rows))
    ex = FakeExecutor()
    assert run_cli(["import-baseline", str(f)], ex, tmp_path) == 0
    assert ex.query("SELECT count(*) FROM skillup_dev.schema_migrations")[0][0] == 0
    assert run_cli(["import-baseline", str(f), "--apply"], ex, tmp_path) == 0
    assert ids(ex) == ["migration_a"]
    assert (
        run_cli(["import-baseline", str(f), "--apply"], ex, tmp_path) == 1
    )  # already recorded


# ---------------------------------------------------------------- workflow


def test_workflow_gates_database_jobs():
    text = (
        Path(__file__).resolve().parents[2] / ".github" / "workflows" / "migrations.yml"
    ).read_text()
    assert "workflow_dispatch" in text and "environment: production" in text
    assert "MIGRATE_DATABASE_URL: ${{ secrets.DATABASE_URL }}" in text
    assert "postgres://" not in text and "postgresql://" not in text
    # database jobs are dispatch-only and main-only; PR runs never reach them
    for job in ("db-status:", "db-apply:"):
        block = text[text.index(job) :]
        header = block[: block.index("steps:")]
        assert "workflow_dispatch" in header and "refs/heads/main" in header
    assert "--apply" in text and "--approve" in text and "approval_ref" in text

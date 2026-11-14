"""Hardening of the migrate tooling: lint false negatives, external_requires, path
containment, plan validation, out-of-order warnings and the needs-approval split
(synthetic files only, no database)."""

import gzip
import json
from pathlib import Path

import pytest

from migrate import cli, lint
from migrate import manifest as mf
from migrate import plan as pl
from migrate.ledger import InMemoryLedger


def make_root(tmp_path: Path, names=("migration_a.sql", "migration_b.sql")) -> Path:
    for name in names:
        (tmp_path / name).write_text("SELECT 1;\n")
    return tmp_path


def entry(entry_id, path=None, **extra):
    data = {
        "id": entry_id,
        "kind": "schema",
        "path": path or f"{entry_id}.sql",
        "requires": [],
    }
    data.update(extra)
    return data


def build(entries, unordered=()):
    return mf.parse_manifest({"entry": entries, "unordered": list(unordered)})


def codes(manifest, root):
    return {issue.code for issue in mf.validate(manifest, root)}


# ---------------------------------------------------------------------------
# Linter: false negatives (M5-M7 and the Low drop-statement list)
# ---------------------------------------------------------------------------


def _counts(sql):
    result = lint.analyse_sql(sql)
    return {
        n: getattr(result, n) for n in lint.DESTRUCTIVE_FIELDS if getattr(result, n)
    }


def test_dynamic_sql_inside_do_block_is_destructive():
    assert _counts("DO $$ BEGIN EXECUTE 'DROP TABLE x CASCADE'; END $$;") == {
        "dynamic_destructive": 2
    }
    assert lint.analyse_sql(
        "DO $f$ BEGIN EXECUTE format('DROP TABLE %I', 'x'); END $f$;"
    ).destructive
    assert lint.analyse_sql(
        "DO $$ BEGIN EXECUTE 'TRUNCATE t'; END $$ LANGUAGE plpgsql;"
    ).destructive
    assert lint.analyse_sql(
        "DO LANGUAGE plpgsql $$ BEGIN EXECUTE $q$DELETE FROM t$q$; END $$;"
    ).destructive


def test_harmless_dynamic_sql_and_messages_are_not_flagged():
    sql = (
        "DO $$ BEGIN EXECUTE 'CREATE INDEX i ON t(a)';"
        " RAISE NOTICE 'DROP TABLE not run'; END $$;"
    )
    assert not lint.analyse_sql(sql).destructive
    # inside a CREATE FUNCTION body the string is not run by the migration itself
    assert not lint.analyse_sql(
        "CREATE FUNCTION f() RETURNS void AS $$ BEGIN EXECUTE 'DROP TABLE x'; END $$"
        " LANGUAGE plpgsql;"
    ).destructive


def test_update_without_where_detected_and_upsert_ignored():
    assert _counts("UPDATE t SET a = 1;") == {"update_without_where": 1}
    assert _counts("UPDATE ONLY s.t AS x SET a = 1\n  FROM y;") == {
        "update_without_where": 1
    }
    assert not lint.analyse_sql("UPDATE t SET a = 1 WHERE b = 2;").destructive
    assert not lint.analyse_sql(
        "INSERT INTO t VALUES (1) ON CONFLICT (id) DO UPDATE SET a = 2;"
    ).destructive
    assert not lint.analyse_sql(
        "CREATE TRIGGER x BEFORE UPDATE ON t FOR EACH ROW EXECUTE FUNCTION f();"
        "\nSELECT * FROM t FOR UPDATE;"
    ).destructive


def test_other_drop_statements_detected():
    cases = {
        "DROP VIEW IF EXISTS v;": "drop_view",
        "DROP MATERIALIZED VIEW v;": "drop_view",
        "DROP FUNCTION f(int);": "drop_function",
        'DROP POLICY IF EXISTS "p" ON t;': "drop_policy",
        "DROP TRIGGER x ON t;": "drop_trigger",
        "DROP INDEX IF EXISTS i;": "drop_index",
        "ALTER TABLE t DROP CONSTRAINT c;": "drop_constraint",
        "DROP SCHEMA s;": "drop_schema",
        "DROP DATABASE d;": "drop_database",
        "DROP TYPE t;": "drop_type",
        "DROP SEQUENCE s;": "drop_other",
    }
    for sql, field in cases.items():
        result = lint.analyse_sql(sql)
        assert result.destructive and getattr(result, field) == 1, sql


def test_alter_table_drop_with_or_without_column_keyword():
    assert lint.analyse_sql("ALTER TABLE t DROP c;").drop_column == 1
    assert lint.analyse_sql("ALTER TABLE t DROP COLUMN c;").drop_column == 1
    assert (
        lint.analyse_sql("ALTER TABLE t DROP COLUMN IF EXISTS c, DROP d;").drop_column
        == 2
    )
    # loosening a column property is not dropping a column
    assert not lint.analyse_sql(
        "ALTER TABLE t ALTER COLUMN c DROP NOT NULL, ALTER COLUMN d DROP DEFAULT;"
    ).destructive


def test_cascade_detected_but_not_the_foreign_key_action():
    assert lint.analyse_sql("TRUNCATE t CASCADE;").cascade == 1
    assert lint.analyse_sql("REVOKE ALL ON t FROM r CASCADE;").cascade == 1
    fk = "CREATE TABLE a (b int REFERENCES c(id) ON DELETE CASCADE ON UPDATE CASCADE);"
    assert not lint.analyse_sql(fk).destructive
    assert not lint.analyse_sql("SELECT date_trunc('day', now());").destructive


def test_new_detections_ignore_comments_and_strings():
    sql = (
        "-- DROP VIEW v; UPDATE t SET a=1;\n/* DROP POLICY p */\n"
        "SELECT 'DROP INDEX i; UPDATE t SET a=1; CASCADE';"
    )
    assert not lint.analyse_sql(sql).destructive


def test_counterpart_comparison_is_memory_capped(tmp_path):
    (tmp_path / "migration_a.sql").write_bytes(b"SELECT 1;\n" * 50)
    with gzip.open(tmp_path / "migration_a.sql.gz", "wb") as handle:
        handle.write(b"SELECT 2;\n" * 50)
    capped = lint.lint_file(tmp_path / "migration_a.sql", tmp_path, max_bytes=100)
    assert capped.counterpart == "unverified"
    assert (
        lint.lint_file(tmp_path / "migration_a.sql", tmp_path).counterpart == "MISMATCH"
    )
    assert lint.summarise([capped])["migration"]["gz_counterpart_differs"] == 1


# ---------------------------------------------------------------------------
# Lint-vs-kind consistency (synthetic)
# ---------------------------------------------------------------------------


def test_kind_conflicts_flags_destructive_sql_registered_as_schema_or_seed(tmp_path):
    (tmp_path / "migration_a.sql").write_text("DROP TABLE t;\n")
    (tmp_path / "seed_b.sql").write_text("UPDATE t SET a = 1;\n")
    (tmp_path / "migration_c.sql").write_text("DROP VIEW v;\n")
    (tmp_path / "migration_d.sql").write_text("DROP TABLE t;\n")
    manifest = build(
        [
            entry("migration_a"),
            entry("seed_b", kind="seed"),
            entry("migration_c", allow_destructive_reason="re-created right after"),
            entry("migration_d", kind="destructive", approval="owner"),
        ]
    )
    found = {c.entry_id: c for c in lint.kind_conflicts(manifest, tmp_path)}
    assert set(found) == {"migration_a", "seed_b"}
    assert "DT1" in str(found["migration_a"])


# ---------------------------------------------------------------------------
# external_requires
# ---------------------------------------------------------------------------


def test_external_require_on_unordered_file_is_an_unresolved_warning(tmp_path):
    root = make_root(tmp_path, ("migration_a.sql", "migration_u.sql"))
    manifest = build(
        [
            entry(
                "migration_a",
                external_requires=[
                    {
                        "ref": "migration_u.sql",
                        "evidence": "migration_a.sql:1 ALTER TABLE t",
                    }
                ],
            )
        ],
        unordered=[{"path": "migration_u.sql", "reason": "order not documented"}],
    )
    issues = mf.validate(manifest, root)
    assert [(i.code, i.severity) for i in issues] == [
        ("UNRESOLVED_DEPENDENCY", "warning")
    ]
    assert "migration_u.sql" in issues[0].message
    assert "ALTER TABLE t" in issues[0].message


def test_external_require_on_later_ordered_entry_is_unresolved_not_an_error(tmp_path):
    root = make_root(tmp_path)
    manifest = build(
        [
            entry(
                "migration_a",
                external_requires=[{"ref": "migration_b", "evidence": "a.sql:3"}],
            ),
            entry("migration_b"),
        ]
    )
    assert [i.code for i in mf.validate(manifest, root)] == ["UNRESOLVED_DEPENDENCY"]


def test_external_require_must_be_a_real_target_and_not_an_earlier_entry(tmp_path):
    root = make_root(tmp_path)
    ghost = [{"ref": "ghost.sql", "evidence": "x"}]
    assert "EXTERNAL_REQUIRE" in codes(
        build([entry("migration_a", external_requires=ghost)]), root
    )
    earlier = build(
        [
            entry("migration_a"),
            entry(
                "migration_b",
                external_requires=[{"ref": "migration_a", "evidence": "x"}],
            ),
        ]
    )
    assert "EXTERNAL_REQUIRE" in codes(earlier, root)
    own = [{"ref": "migration_a", "evidence": "x"}]
    assert "EXTERNAL_REQUIRE" in codes(
        build([entry("migration_a", external_requires=own)]), root
    )


@pytest.mark.parametrize(
    "bad",
    [[{"ref": "x"}], [{"ref": "x", "evidence": "  "}], [{"evidence": "e"}], ["x"], "x"],
)
def test_external_require_shape_is_enforced(bad):
    with pytest.raises(mf.ManifestError, match="external_requires"):
        build([entry("migration_a", external_requires=bad)])


def test_allow_destructive_reason_must_be_non_empty():
    parsed = build([entry("migration_a", allow_destructive_reason="why")])
    assert parsed.entries[0].allow_destructive_reason == "why"
    with pytest.raises(mf.ManifestError, match="allow_destructive_reason"):
        build([entry("migration_a", allow_destructive_reason=" ")])


def test_plan_reports_unresolved_dependency_without_blocking(tmp_path):
    root = make_root(tmp_path, ("migration_a.sql", "migration_u.sql"))
    manifest = build(
        [
            entry(
                "migration_a",
                external_requires=[{"ref": "migration_u.sql", "evidence": "a.sql:1"}],
            )
        ],
        unordered=[{"path": "migration_u.sql", "reason": "r"}],
    )
    plan = pl.build_plan(manifest, InMemoryLedger(), pl.default_checksummer(root))
    assert [row.status for row in plan.rows] == [pl.PENDING]
    assert plan.rows[0].unresolved == ["migration_u.sql"]
    assert any("unresolved dependency on 'migration_u.sql'" in w for w in plan.warnings)
    assert "unresolved dependency: migration_u.sql" in pl.format_plan(plan)
    assert pl.plan_to_dict(plan)["unresolved_dependencies"] == {
        "migration_a": ["migration_u.sql"]
    }


# ---------------------------------------------------------------------------
# Manifest paths must stay inside backend/
# ---------------------------------------------------------------------------


@pytest.mark.parametrize(
    "rel", ["../secret.sql", "/etc/passwd", "sub/../../x.sql", "..\\x.sql", "C:/x.sql"]
)
def test_is_contained_rejects_escapes(tmp_path, rel):
    assert not mf.is_contained(tmp_path, rel)


def test_is_contained_accepts_normal_paths_and_rejects_symlink_escape(tmp_path):
    root = tmp_path / "backend"
    root.mkdir()
    (root / "ok.sql").write_text("SELECT 1;\n")
    outside = tmp_path / "outside"
    outside.mkdir()
    (outside / "x.sql").write_text("SELECT 1;\n")
    (root / "link").symlink_to(outside, target_is_directory=True)
    assert mf.is_contained(root, "ok.sql")
    assert mf.is_contained(root, "seed_x_parts/part-001.sql.gz")
    assert not mf.is_contained(root, "link/x.sql")


def test_paths_outside_root_are_rejected_by_validate_and_never_read(tmp_path):
    root = tmp_path / "backend"
    root.mkdir()
    (tmp_path / "evil.sql").write_text("DROP TABLE x;\n")
    manifest = build(
        [
            entry(
                "migration_a",
                path="../evil.sql",
                down="../evil.sql",
                verify=["../evil.sql"],
            )
        ],
        unordered=[{"path": "../evil.sql", "reason": "r"}],
    )
    escapes = [i for i in mf.validate(manifest, root) if i.code == "PATH_ESCAPES_ROOT"]
    assert len(escapes) == 4  # path, down, verify, unordered
    assert mf.entry_files(manifest.entries[0], root) == []
    glob_manifest = mf.parse_manifest(
        {"entry": [{"id": "seed_g", "kind": "seed", "parts_glob": "../*.sql"}]}
    )
    assert "PATH_ESCAPES_ROOT" in codes(glob_manifest, root)
    assert mf.entry_files(glob_manifest.entries[0], root) == []


# ---------------------------------------------------------------------------
# plan validates first and fails with messages, not tracebacks (M8)
# ---------------------------------------------------------------------------


def write_manifest(tmp_path: Path, text: str) -> list[str]:
    manifest_path = tmp_path / "manifest.toml"
    manifest_path.write_text(text)
    return ["--manifest", str(manifest_path), "--root", str(tmp_path)]


def toml_entry(entry_id, requires=()):
    deps = ", ".join(f'"{d}"' for d in requires)
    return (
        f'[[entry]]\nid = "{entry_id}"\nkind = "schema"\n'
        f'path = "{entry_id}.sql"\nrequires = [{deps}]\n\n'
    )


def test_plan_refuses_an_entry_whose_file_is_missing(tmp_path, capsys):
    make_root(tmp_path, ("migration_a.sql",))
    base = write_manifest(
        tmp_path, toml_entry("migration_a") + toml_entry("migration_b")
    )
    assert cli.main([*base, "plan"]) == 1
    err = capsys.readouterr().err
    assert "MISSING_PATH" in err and "migration_b" in err and "plan refused" in err


def test_plan_with_applied_entry_whose_file_vanished_is_a_message_not_a_traceback(
    tmp_path, capsys
):
    make_root(tmp_path, ("migration_a.sql",))
    base = write_manifest(tmp_path, toml_entry("migration_a"))
    applied = tmp_path / "applied.json"
    applied.write_text(json.dumps({"migration_a": "abc"}))
    (tmp_path / "migration_a.sql").unlink()
    assert cli.main([*base, "plan", "--applied", str(applied)]) == 1
    assert "MISSING_PATH" in capsys.readouterr().err


def test_plan_refuses_a_requires_cycle_and_names_it(tmp_path, capsys):
    make_root(tmp_path)
    base = write_manifest(
        tmp_path,
        toml_entry("migration_a", ["migration_b"])
        + toml_entry("migration_b", ["migration_a"]),
    )
    assert cli.main([*base, "plan"]) == 1
    err = capsys.readouterr().err
    assert "CYCLE" in err and "migration_a" in err


def test_plan_refuses_an_unknown_requires_id(tmp_path, capsys):
    make_root(tmp_path, ("migration_a.sql",))
    base = write_manifest(tmp_path, toml_entry("migration_a", ["migration_zzz"]))
    assert cli.main([*base, "plan"]) == 1
    assert "UNKNOWN_REQUIRE" in capsys.readouterr().err


def test_plan_reports_unreadable_applied_files_cleanly(tmp_path, capsys):
    make_root(tmp_path, ("migration_a.sql",))
    base = write_manifest(tmp_path, toml_entry("migration_a"))
    assert cli.main([*base, "plan", "--applied", str(tmp_path / "nope.json")]) == 1
    assert "cannot read --applied" in capsys.readouterr().err
    broken = tmp_path / "broken.json"
    broken.write_text("{not json")
    assert cli.main([*base, "plan", "--applied", str(broken)]) == 1
    assert "cannot read --applied" in capsys.readouterr().err
    listy = tmp_path / "list.json"
    listy.write_text("[1, 2]")
    assert cli.main([*base, "plan", "--applied", str(listy)]) == 1
    capsys.readouterr()


def test_plan_still_succeeds_on_a_valid_manifest(tmp_path, capsys):
    make_root(tmp_path, ("migration_a.sql",))
    base = write_manifest(tmp_path, toml_entry("migration_a"))
    assert cli.main([*base, "plan"]) == 0
    assert "would run automatically" in capsys.readouterr().out


# ---------------------------------------------------------------------------
# Out-of-order applied entries (M9)
# ---------------------------------------------------------------------------


def three(tmp_path):
    root = make_root(
        tmp_path, ("migration_a.sql", "migration_b.sql", "migration_c.sql")
    )
    manifest = build([entry("migration_a"), entry("migration_b"), entry("migration_c")])
    sums = {e.id: mf.entry_checksum(e, root) for e in manifest.entries}
    return root, manifest, sums


def test_applied_entry_after_a_pending_earlier_entry_warns_without_requires(tmp_path):
    root, manifest, sums = three(tmp_path)
    plan = pl.build_plan(
        manifest,
        InMemoryLedger({"migration_c": sums["migration_c"]}),
        pl.default_checksummer(root),
    )
    out_of_order = [w for w in plan.warnings if "out of order" in w]
    assert len(out_of_order) == 1
    assert "migration_c" in out_of_order[0]
    assert "migration_a" in out_of_order[0] and "migration_b" in out_of_order[0]


def test_in_order_prefix_does_not_warn(tmp_path):
    root, manifest, sums = three(tmp_path)
    plan = pl.build_plan(
        manifest,
        InMemoryLedger({"migration_a": sums["migration_a"]}),
        pl.default_checksummer(root),
    )
    assert not [w for w in plan.warnings if "out of order" in w]


def test_long_out_of_order_list_is_truncated(tmp_path):
    names = [f"migration_{i:02d}" for i in range(8)]
    root = make_root(tmp_path, [f"{n}.sql" for n in names])
    manifest = build([entry(n) for n in names])
    last = manifest.entries[-1]
    plan = pl.build_plan(
        manifest,
        InMemoryLedger({last.id: mf.entry_checksum(last, root)}),
        pl.default_checksummer(root),
    )
    (warning,) = [w for w in plan.warnings if "out of order" in w]
    assert "(+2 more)" in warning


# ---------------------------------------------------------------------------
# would_run no longer hides approval-required rows
# ---------------------------------------------------------------------------


def test_would_run_excludes_approval_rows_and_they_are_listed_separately(tmp_path):
    root = make_root(
        tmp_path, ("migration_a.sql", "migration_b.sql", "migration_c.sql")
    )
    manifest = build(
        [
            entry("migration_a"),
            entry("migration_b", kind="destructive", approval="owner + backup"),
            entry("migration_c", requires=["migration_b"]),
        ]
    )
    plan = pl.build_plan(manifest, InMemoryLedger(), pl.default_checksummer(root))
    assert [r.id for r in plan.would_run] == ["migration_a", "migration_c"]
    assert [r.id for r in plan.needs_approval] == ["migration_b"]
    assert "only after approval of migration_b" in plan.rows[2].detail
    data = pl.plan_to_dict(plan)
    assert data["would_run"] == ["migration_a", "migration_c"]
    assert data["needs_approval"] == ["migration_b"]
    summary = pl.format_plan(plan).splitlines()
    assert any("need approval first: 1" in line for line in summary)

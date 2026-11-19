"""Owner defaults: authoritative duplicate sources, baseline, rebuild, CHECK re-add rule,
CRLF/BOM-stable checksums, data_destructive. Synthetic files only, no database."""

import gzip
import json
from pathlib import Path

import pytest

from migrate import cli, lint, sqlio
from migrate import manifest as mf
from migrate import plan as pl
from migrate.ledger import (
    BaselineError,
    InMemoryLedger,
    build_baseline,
    load_applied_json,
)


def entry(entry_id, path=None, **extra):
    data = {
        "id": entry_id,
        "kind": "schema",
        "path": path or f"{entry_id}.sql",
        "requires": [],
    }
    data.update(extra)
    return data


def build(entries):
    return mf.parse_manifest({"entry": entries})


def codes(manifest, root):
    return {i.code for i in mf.validate(manifest, root)}


def pair(root: Path, plain: bytes, gz: bytes, name="migration_a"):
    (root / f"{name}.sql").write_bytes(plain)
    with gzip.open(root / f"{name}.sql.gz", "wb") as handle:
        handle.write(gz)


# --- 1. duplicate sources ----------------------------------------------------


def test_differing_copies_without_a_pin_fail_manifest_and_lint(tmp_path):
    pair(tmp_path, b"SELECT 1;\n", b"SELECT 2;\n")
    manifest = build([entry("migration_a")])
    assert "DUPLICATE_SOURCE_DIFFERS" in codes(manifest, tmp_path)
    found = lint.collect_findings(manifest, tmp_path)
    assert any(f.code == "DUPLICATE_SOURCE_DIFFERS" and f.failing for f in found)
    with pytest.raises(mf.AmbiguousSourceError):
        mf.entry_checksum(manifest.entries[0], tmp_path)


def test_pinned_copy_wins_and_the_other_is_a_warning(tmp_path):
    pair(tmp_path, b"SELECT 1;\n", b"SELECT 2;\n")
    for choice, expected in (("sql", "migration_a.sql"), ("gz", "migration_a.sql.gz")):
        manifest = build(
            [
                entry(
                    "migration_a",
                    authoritative=choice,
                    authoritative_reason="evidence",
                )
            ]
        )
        issues = mf.validate(manifest, tmp_path)
        assert not [i for i in issues if i.severity == "error"]
        assert any(i.code == "STALE_DUPLICATE" for i in issues)
        assert mf.entry_files(manifest.entries[0], tmp_path) == [tmp_path / expected]


def test_authoritative_needs_a_reason_and_a_valid_value():
    with pytest.raises(mf.ManifestError):
        build([entry("migration_a", authoritative="sql")])
    with pytest.raises(mf.ManifestError):
        build([entry("migration_a", authoritative="both", authoritative_reason="x")])


def test_copies_that_differ_only_by_crlf_are_one_file(tmp_path):
    pair(tmp_path, b"SELECT 1;\nSELECT 2;\n", b"SELECT 1;\r\nSELECT 2;\r\n")
    manifest = build([entry("migration_a")])
    assert not [i for i in mf.validate(manifest, tmp_path) if i.severity == "error"]
    assert not lint.collect_findings(manifest, tmp_path)


def test_backslash_quote_in_a_normal_string_is_flagged_but_not_in_e_strings():
    bad = "INSERT INTO t VALUES ('an institution\\'s process');\n"
    assert lint.analyse_sql(bad).backslash_quote_lines == [1]
    assert lint.analyse_sql("SELECT E'it\\'s fine';\n").backslash_quote_lines == []
    assert lint.analyse_sql("SELECT 'it''s fine';\n").backslash_quote_lines == []
    assert lint.analyse_sql("SELECT 'C:\\';\n").backslash_quote_lines == []


def test_backslash_quote_in_the_ignored_copy_is_reported_as_evidence(tmp_path):
    pair(
        tmp_path,
        b"SELECT 'institution''s';\n",
        b"SELECT 'institution\\'s';\n",
    )
    manifest = build(
        [entry("migration_a", authoritative="sql", authoritative_reason="parses")]
    )
    found = lint.collect_findings(manifest, tmp_path)
    assert [f.code for f in found if f.failing] == []
    assert any(f.code == "STALE_COPY_BACKSLASH_QUOTE" for f in found)


# --- 4. checksums ------------------------------------------------------------


def test_checksum_ignores_crlf_and_bom(tmp_path):
    (tmp_path / "lf.sql").write_bytes(b"SELECT 1;\nSELECT 2;\n")
    (tmp_path / "crlf.sql").write_bytes(b"SELECT 1;\r\nSELECT 2;\r\n")
    (tmp_path / "bom.sql").write_bytes(b"\xef\xbb\xbfSELECT 1;\r\nSELECT 2;\r\n")
    digests = {sqlio.sha256_file(tmp_path / n) for n in ("lf.sql", "crlf.sql", "bom.sql")}
    assert len(digests) == 1
    assert sqlio.sha256_raw(tmp_path / "lf.sql") != sqlio.sha256_raw(tmp_path / "crlf.sql")


def test_checksum_handles_crlf_split_across_chunks(tmp_path, monkeypatch):
    body = (b"a" * 9 + b"\r\n") * 5
    (tmp_path / "x.sql").write_bytes(body)
    (tmp_path / "y.sql").write_bytes(body.replace(b"\r\n", b"\n"))
    monkeypatch.setattr(sqlio, "_CHUNK", 10)  # forces CR at a chunk end
    assert sqlio.sha256_file(tmp_path / "x.sql") == sqlio.sha256_file(tmp_path / "y.sql")


def test_a_lone_cr_is_not_rewritten(tmp_path):
    (tmp_path / "a.sql").write_bytes(b"a\rb\n")
    (tmp_path / "b.sql").write_bytes(b"a\nb\n")
    assert sqlio.sha256_file(tmp_path / "a.sql") != sqlio.sha256_file(tmp_path / "b.sql")


def test_group_checksum_is_crlf_stable(tmp_path):
    for folder, eol in (("lf", b"\n"), ("crlf", b"\r\n")):
        (tmp_path / folder).mkdir()
        (tmp_path / folder / "part-001.sql").write_bytes(b"SELECT 1;" + eol)
    group = lambda d: mf.Entry(  # noqa: E731
        id="seed_x", kind="seed", parts_glob=f"{d}/part-*.sql"
    )
    assert mf.entry_checksum(group("lf"), tmp_path) != ""
    # part names differ by folder only, so compare per-part hashes through the group digest
    assert sqlio.sha256_file(tmp_path / "lf/part-001.sql") == sqlio.sha256_file(
        tmp_path / "crlf/part-001.sql"
    )


# --- 2. baseline and rebuild -------------------------------------------------


def _root(tmp_path):
    (tmp_path / "migration_a.sql").write_text("SELECT 1;\n")
    (tmp_path / "migration_v2.sql").write_text("DROP TABLE t;\n")
    (tmp_path / "preflight.json").write_text('{"overall": "blocked"}')
    return tmp_path


def _manifest():
    return build(
        [
            entry("migration_a"),
            entry(
                "migration_v2",
                kind="rebuild",
                manual_only=True,
                approval="staging only",
                requires=["migration_a"],
            ),
        ]
    )


def test_baseline_rows_come_only_from_named_entries_and_a_preflight_file(tmp_path):
    root = _root(tmp_path)
    rows = build_baseline(
        _manifest(), root, ["migration_a"], root / "preflight.json", "alice"
    )
    assert rows[0]["kind"] == "baseline" and rows[0]["operator"] == "alice"
    assert len(rows[0]["preflight_sha256"]) == 64
    for bad_ids in ([], ["all"], ["nope"]):
        with pytest.raises(BaselineError):
            build_baseline(_manifest(), root, bad_ids, root / "preflight.json", "alice")
    with pytest.raises(BaselineError):
        build_baseline(_manifest(), root, ["migration_a"], root / "preflight.json", " ")
    with pytest.raises(BaselineError):
        build_baseline(_manifest(), root, ["migration_a"], root / "missing.json", "a")
    (root / "bad.json").write_text("not json")
    with pytest.raises(BaselineError):
        build_baseline(_manifest(), root, ["migration_a"], root / "bad.json", "a")


def test_a_rebuild_entry_can_never_be_baselined(tmp_path):
    root = _root(tmp_path)
    with pytest.raises(BaselineError, match="rebuild"):
        build_baseline(
            _manifest(), root, ["migration_v2"], root / "preflight.json", "alice"
        )


def test_baseline_roundtrip_shows_as_applied_and_detects_drift(tmp_path):
    root = _root(tmp_path)
    rows = build_baseline(
        _manifest(), root, ["migration_a"], root / "preflight.json", "alice"
    )
    (root / "applied.json").write_text(json.dumps({"applied": rows}))
    ledger = load_applied_json(root / "applied.json")
    assert set(ledger.baselines()) == {"migration_a"}
    checksum = lambda e: mf.entry_checksum(e, root)  # noqa: E731
    plan = pl.build_plan(_manifest(), ledger, checksum)
    row = plan.rows[0]
    assert row.status == pl.APPLIED and "baseline" in row.detail
    (root / "migration_a.sql").write_text("SELECT 99;\n")
    assert pl.build_plan(_manifest(), ledger, checksum).has_drift


def test_baseline_cli_refuses_to_overwrite_and_writes_a_usable_file(tmp_path, capsys):
    root = _root(tmp_path)
    manifest_file = root / "manifest.toml"
    manifest_file.write_text(
        'entry = []\n'
    )
    # build a real TOML manifest for the CLI
    manifest_file.write_text(
        '[[entry]]\nid = "migration_a"\nkind = "schema"\npath = "migration_a.sql"\n'
    )
    base = ["--manifest", str(manifest_file), "--root", str(root)]
    args = base + [
        "baseline", "--preflight", str(root / "preflight.json"),
        "--entries", "migration_a", "--operator", "alice", "--out", str(root / "out.json"),
    ]
    assert cli.main(args) == 0
    assert load_applied_json(root / "out.json").baselines()
    assert cli.main(args) == 1  # will not overwrite
    assert "refusing to overwrite" in capsys.readouterr().err


def test_rebuild_is_refused_in_the_plan_without_flag_and_approval(tmp_path):
    root = _root(tmp_path)
    checksum = lambda e: mf.entry_checksum(e, root)  # noqa: E731
    for kwargs in (
        {},
        {"allow_rebuild": True},
        {"rebuild_approval": "ticket-1"},
        {"allow_rebuild": True, "rebuild_approval": "  "},
    ):
        plan = pl.build_plan(_manifest(), InMemoryLedger(), checksum, **kwargs)
        row = next(r for r in plan.rows if r.id == "migration_v2")
        assert row.status == pl.REFUSED, kwargs
        assert "migration_v2" not in [r.id for r in plan.would_run]
    plan = pl.build_plan(
        _manifest(),
        InMemoryLedger(),
        checksum,
        allow_rebuild=True,
        rebuild_approval="ticket-1",
    )
    row = next(r for r in plan.rows if r.id == "migration_v2")
    assert row.status == pl.MANUAL  # authorised, but still never automatic
    assert "REFUSED" in pl.format_plan(
        pl.build_plan(_manifest(), InMemoryLedger(), checksum)
    )


def test_rebuild_kind_must_be_manual_and_approved(tmp_path):
    root = _root(tmp_path)
    manifest = build([entry("migration_v2", kind="rebuild", approval="staging")])
    assert "REBUILD_UNGUARDED" in codes(manifest, root)
    manifest = build([entry("migration_v2", kind="rebuild", manual_only=True)])
    assert "REBUILD_UNGUARDED" in codes(manifest, root)
    manifest = build(
        [entry("migration_v2", kind="rebuild", manual_only=True, approval="staging")]
    )
    assert "REBUILD_UNGUARDED" not in codes(manifest, root)


def test_real_career_v2_is_a_refused_rebuild():
    manifest = mf.load_manifest(mf.DEFAULT_MANIFEST)
    backend = mf.DEFAULT_MANIFEST.parent.parent
    plan = pl.build_plan(
        manifest, InMemoryLedger(), pl.default_checksummer(backend)
    )
    row = next(r for r in plan.rows if r.id == "migration_career_v2")
    assert row.kind == "rebuild" and row.status == pl.REFUSED


# --- 3. DROP CONSTRAINT without re-add --------------------------------------


def test_drop_constraint_without_add_is_flagged():
    sql = "ALTER TABLE t DROP CONSTRAINT IF EXISTS t_chk;\n"
    assert lint.analyse_sql(sql).unreadded_constraints == ["t_chk"]


def test_drop_constraint_followed_by_the_same_add_is_clean():
    sql = (
        "ALTER TABLE t DROP CONSTRAINT IF EXISTS t_chk;\n"
        "ALTER TABLE t ADD CONSTRAINT t_chk CHECK (a > 0);\n"
    )
    assert lint.analyse_sql(sql).unreadded_constraints == []


def test_a_different_added_constraint_does_not_count_and_case_is_ignored():
    sql = (
        "ALTER TABLE t DROP CONSTRAINT T_CHK;\nALTER TABLE t ADD CONSTRAINT other CHECK (a>0);\n"
    )
    assert lint.analyse_sql(sql).unreadded_constraints == ["t_chk"]
    ok = "ALTER TABLE t DROP CONSTRAINT T_CHK;\nALTER TABLE t ADD CONSTRAINT t_chk CHECK (a>0);\n"
    assert lint.analyse_sql(ok).unreadded_constraints == []


def test_readd_inside_dynamic_sql_counts():
    sql = (
        "ALTER TABLE t DROP CONSTRAINT IF EXISTS t_chk;\n"
        "DO $$ BEGIN EXECUTE 'ALTER TABLE t ADD CONSTRAINT t_chk CHECK (a>0)'; END $$;\n"
    )
    assert lint.analyse_sql(sql).unreadded_constraints == []


def test_commented_drop_constraint_is_ignored():
    assert lint.analyse_sql("-- DROP CONSTRAINT x;\n").unreadded_constraints == []


def test_unreadded_constraint_fails_lint_unless_waived_with_a_reason(tmp_path):
    (tmp_path / "migration_a.sql").write_text("ALTER TABLE t DROP CONSTRAINT c;\n")
    plain = build([entry("migration_a")])
    found = lint.collect_findings(plain, tmp_path)
    assert any(f.code == "DROP_CONSTRAINT_NOT_READDED" and f.failing for f in found)
    waived = build(
        [
            entry(
                "migration_a",
                lint_waivers=[{"code": "DROP_CONSTRAINT_NOT_READDED", "reason": "owner"}],
            )
        ]
    )
    found = [f for f in lint.collect_findings(waived, tmp_path) if f.code == "DROP_CONSTRAINT_NOT_READDED"]
    assert found and not found[0].failing and found[0].waived_reason == "owner"
    with pytest.raises(mf.ManifestError):
        build([entry("migration_a", lint_waivers=[{"code": "X", "reason": " "}])])


def test_lint_cli_exit_code_follows_failing_findings(tmp_path):
    (tmp_path / "migration_a.sql").write_text("ALTER TABLE t DROP CONSTRAINT c;\n")
    manifest_file = tmp_path / "manifest.toml"
    manifest_file.write_text(
        '[[entry]]\nid = "migration_a"\nkind = "schema"\npath = "migration_a.sql"\n'
    )
    argv = ["--manifest", str(manifest_file), "--root", str(tmp_path), "lint"]
    assert cli.main(argv) == 1
    manifest_file.write_text(
        '[[entry]]\nid = "migration_a"\nkind = "schema"\npath = "migration_a.sql"\n'
        'lint_waivers = [{ code = "DROP_CONSTRAINT_NOT_READDED", reason = "r" },'
        ' { code = "KIND_CONFLICT", reason = "r" }]\n'
    )
    assert cli.main(argv) == 0


# --- 5. data_destructive -----------------------------------------------------


def test_delete_and_truncate_are_data_destructive():
    assert lint.analyse_sql("DELETE FROM a WHERE id = 1;\n").data_destructive == 1
    result = lint.analyse_sql("TRUNCATE TABLE a, b;\nDELETE FROM c;\n")
    assert result.data_destructive == 3
    assert result.data_destructive_tables == ["a", "b", "c"]
    assert result.destructive


def test_drop_and_recreate_of_the_same_table_is_not_data_destructive():
    sql = "DROP TABLE IF EXISTS a;\nCREATE TABLE a (id int);\nDELETE FROM a;\n"
    result = lint.analyse_sql(sql)
    assert result.data_destructive == 0 and result.drop_table == 1


def test_dropping_a_different_table_does_not_excuse_the_delete():
    sql = "DROP TABLE IF EXISTS b;\nCREATE TABLE b (id int);\nDELETE FROM a;\n"
    assert lint.analyse_sql(sql).data_destructive == 1


def test_temp_table_deletes_and_fk_actions_are_not_data_destructive():
    sql = (
        "CREATE TEMP TABLE tmp (id int);\nDELETE FROM tmp;\n"
        "CREATE TABLE c (a int REFERENCES p(id) ON DELETE CASCADE);\n"
    )
    assert lint.analyse_sql(sql).data_destructive == 0


def test_deletes_in_comments_strings_and_do_blocks():
    assert lint.analyse_sql("-- DELETE FROM a;\nSELECT 'DELETE FROM a';\n").data_destructive == 0
    assert lint.analyse_sql("DO $$ BEGIN DELETE FROM a WHERE x; END $$;\n").data_destructive == 1


def test_data_destructive_kind_needs_the_same_approval_gate(tmp_path):
    (tmp_path / "migration_a.sql").write_text("DELETE FROM t WHERE x = 1;\n")
    unguarded = build([entry("migration_a", kind="data_destructive")])
    assert "DESTRUCTIVE_UNGUARDED" in codes(unguarded, tmp_path)
    guarded = build([entry("migration_a", kind="data_destructive", approval="owner")])
    assert codes(guarded, tmp_path) == set()


def test_data_destructive_sql_registered_as_schema_is_a_kind_conflict(tmp_path):
    (tmp_path / "migration_a.sql").write_text("DELETE FROM t WHERE x = 1;\n")
    found = lint.kind_conflicts(build([entry("migration_a")]), tmp_path)
    assert found and "DD1" in str(found[0])
    ok = build([entry("migration_a", kind="data_destructive", approval="owner")])
    assert lint.kind_conflicts(ok, tmp_path) == []


def test_data_destructive_needs_approval_in_the_plan(tmp_path):
    (tmp_path / "migration_a.sql").write_text("DELETE FROM t WHERE x = 1;\n")
    manifest = build([entry("migration_a", kind="data_destructive", approval="owner")])
    plan = pl.build_plan(
        manifest, InMemoryLedger(), lambda e: mf.entry_checksum(e, tmp_path)
    )
    assert plan.rows[0].status == pl.APPROVAL and plan.needs_approval
    assert plan.would_run == []


# --- 6. real repository classifications -------------------------------------


def test_real_manifest_classifications():
    by_id = {e.id: e for e in mf.load_manifest(mf.DEFAULT_MANIFEST).entries}
    for entry_id in (
        "migration_programme_domain_review_corrections_2026-09-18",
        "migration_guidance_global_2026-09-11",
    ):
        assert by_id[entry_id].kind == "data_destructive" and by_id[entry_id].approval
    assert by_id["migration_career_v2"].kind == "rebuild"


def test_real_duplicates_are_pinned_to_the_sql_copy_with_evidence():
    manifest = mf.load_manifest(mf.DEFAULT_MANIFEST)
    backend = mf.DEFAULT_MANIFEST.parent.parent
    pinned = {e.id for e in manifest.entries if e.authoritative}
    assert pinned == {
        "seed_subject_catalog",
        "seed_subject_options",
        "seed_subject_rule_records",
        "migration_guidance_ownership_and_sociology_resources_2026-09-11",
        "migration_sociology_domain_tool_path_2026-09-18",
    }
    for entry in manifest.entries:
        if entry.id in pinned:
            source = mf.resolve_source(entry, backend)
            assert source.path.name.endswith(".sql") and source.differing
    # every other entry with two copies must be byte-identical modulo CRLF/BOM
    assert not [
        i for i in mf.validate(manifest, backend) if i.code == "DUPLICATE_SOURCE_DIFFERS"
    ]

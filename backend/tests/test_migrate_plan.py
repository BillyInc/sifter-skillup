"""Plan ordering, drift detection and the CLI (in-memory ledger, no database)."""

import json
from pathlib import Path

from migrate import cli
from migrate import manifest as mf
from migrate import plan as pl
from migrate.ledger import InMemoryLedger, Ledger, load_applied_json


def write_root(tmp_path: Path) -> Path:
    for name, body in {
        "migration_a.sql": "SELECT 1;",
        "migration_b.sql": "SELECT 2;",
        "migration_c.sql": "SELECT 3;",
        "migration_d.sql": "SELECT 4;",
    }.items():
        (tmp_path / name).write_text(body + "\n")
    return tmp_path


def manifest_for():
    return mf.parse_manifest(
        {
            "entry": [
                {"id": "migration_a", "kind": "schema", "path": "migration_a.sql"},
                {
                    "id": "migration_b",
                    "kind": "schema",
                    "path": "migration_b.sql",
                    "requires": ["migration_a"],
                },
                {
                    "id": "migration_c",
                    "kind": "destructive",
                    "path": "migration_c.sql",
                    "requires": ["migration_b"],
                    "approval": "owner + backup",
                },
                {
                    "id": "migration_d",
                    "kind": "schema",
                    "path": "migration_d.sql",
                    "requires": ["migration_c"],
                },
            ]
        }
    )


def checksums(root, manifest):
    return {e.id: mf.entry_checksum(e, root) for e in manifest.entries}


def run_plan(root, manifest, applied):
    return pl.build_plan(
        manifest, InMemoryLedger(applied), pl.default_checksummer(root)
    )


def statuses(plan):
    return {row.id: row.status for row in plan.rows}


def test_empty_ledger_plans_everything_in_manifest_order(tmp_path):
    root = write_root(tmp_path)
    plan = run_plan(root, manifest_for(), {})
    assert [r.id for r in plan.would_run] == [
        "migration_a",
        "migration_b",
        "migration_d",
    ]
    assert [r.id for r in plan.needs_approval] == ["migration_c"]
    assert statuses(plan)["migration_c"] == pl.APPROVAL
    assert not plan.has_drift


def test_partial_applied_set_only_plans_the_rest(tmp_path):
    root = write_root(tmp_path)
    manifest = manifest_for()
    sums = checksums(root, manifest)
    plan = run_plan(
        root,
        manifest,
        {"migration_a": sums["migration_a"], "migration_b": sums["migration_b"]},
    )
    assert statuses(plan) == {
        "migration_a": pl.APPLIED,
        "migration_b": pl.APPLIED,
        "migration_c": pl.APPROVAL,
        "migration_d": pl.PENDING,
    }
    assert [r.id for r in plan.would_run] == ["migration_d"]
    assert [r.id for r in plan.needs_approval] == ["migration_c"]


def test_drift_is_detected_when_an_applied_file_is_edited(tmp_path):
    root = write_root(tmp_path)
    manifest = manifest_for()
    sums = checksums(root, manifest)
    (root / "migration_a.sql").write_text("SELECT 1; -- edited after apply\n")
    plan = run_plan(root, manifest, {"migration_a": sums["migration_a"]})
    assert statuses(plan)["migration_a"] == pl.DRIFT
    assert plan.has_drift
    row = plan.rows[0]
    assert (
        row.applied_checksum == sums["migration_a"]
        and row.checksum != row.applied_checksum
    )
    assert "DRIFT" in pl.format_plan(plan)


def test_manual_only_entry_never_runs_and_blocks_dependents_and_everything_after(
    tmp_path,
):
    root = write_root(tmp_path)
    manifest = mf.parse_manifest(
        {
            "entry": [
                {
                    "id": "migration_a",
                    "kind": "destructive",
                    "path": "migration_a.sql",
                    "manual_only": True,
                },
                {
                    "id": "migration_b",
                    "kind": "schema",
                    "path": "migration_b.sql",
                    "requires": ["migration_a"],
                },
                {"id": "migration_c", "kind": "schema", "path": "migration_c.sql"},
            ]
        }
    )
    plan = run_plan(root, manifest, {})
    assert statuses(plan) == {
        "migration_a": pl.MANUAL,
        "migration_b": pl.BLOCKED,
        "migration_c": pl.BLOCKED,  # strict order: nothing runs after a blocked entry
    }
    assert plan.would_run == []


def test_manual_entry_applied_by_hand_unblocks_dependents(tmp_path):
    root = write_root(tmp_path)
    manifest = mf.parse_manifest(
        {
            "entry": [
                {
                    "id": "migration_a",
                    "kind": "destructive",
                    "path": "migration_a.sql",
                    "manual_only": True,
                },
                {
                    "id": "migration_b",
                    "kind": "schema",
                    "path": "migration_b.sql",
                    "requires": ["migration_a"],
                },
            ]
        }
    )
    a_sum = mf.entry_checksum(manifest.entries[0], root)
    plan = run_plan(root, manifest, {"migration_a": a_sum})
    assert statuses(plan) == {"migration_a": pl.APPLIED, "migration_b": pl.PENDING}


def test_unknown_applied_id_and_out_of_order_apply_warn(tmp_path):
    root = write_root(tmp_path)
    manifest = manifest_for()
    sums = checksums(root, manifest)
    plan = run_plan(root, manifest, {"ghost": "x", "migration_b": sums["migration_b"]})
    text = "\n".join(plan.warnings)
    assert "ghost" in text and "migration_b" in text and "requires unapplied" in text


def test_in_memory_ledger_satisfies_protocol_and_rejects_double_record():
    ledger = InMemoryLedger()
    assert isinstance(ledger, Ledger)
    ledger.record_applied("x", "abc")
    assert ledger.applied() == {"x": "abc"}
    try:
        ledger.record_applied("x", "abc")
    except ValueError:
        pass
    else:  # pragma: no cover
        raise AssertionError("double record should fail")


def test_load_applied_json_accepts_both_shapes(tmp_path):
    listed = tmp_path / "a.json"
    listed.write_text(json.dumps({"applied": [{"id": "x", "checksum": "1"}]}))
    mapped = tmp_path / "b.json"
    mapped.write_text(json.dumps({"x": "1"}))
    assert (
        load_applied_json(listed).applied()
        == load_applied_json(mapped).applied()
        == {"x": "1"}
    )


def test_cli_plan_exit_codes_and_checksums_roundtrip(tmp_path, capsys):
    root = write_root(tmp_path)
    manifest_path = tmp_path / "manifest.toml"
    manifest_path.write_text(
        "\n".join(
            f'[[entry]]\nid = "migration_{x}"\nkind = "schema"\npath = "migration_{x}.sql"\n'
            for x in "abcd"
        )
    )
    base = ["--manifest", str(manifest_path), "--root", str(root)]
    assert cli.main([*base, "verify-manifest"]) == 0
    capsys.readouterr()
    assert cli.main([*base, "checksums", "--json"]) == 0
    applied_file = tmp_path / "applied.json"
    applied_file.write_text(capsys.readouterr().out)
    assert cli.main([*base, "plan", "--applied", str(applied_file)]) == 0
    (root / "migration_b.sql").write_text("SELECT 'changed';\n")
    assert cli.main([*base, "plan", "--applied", str(applied_file)]) == 2

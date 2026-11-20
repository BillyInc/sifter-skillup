"""A rebuild entry is never run, but it can be recorded as already present: only from a
`baseline --reason` row, through `import-baseline`. Synthetic files, fake database."""

import json

import pytest

from migrate import apply as ap
from migrate import cli
from migrate import manifest as mf
from migrate import plan as pl
from migrate.ledger import InMemoryLedger
from tests.test_migrate_apply import FakeExecutor, ids, make_root
from tests.test_migrate_engine_review import sqlite_bootstrap  # noqa: F401

MANIFEST = (
    '[[entry]]\nid = "migration_base"\nkind = "schema"\npath = "migration_base.sql"\n'
    '[[entry]]\nid = "migration_career_v2"\nkind = "rebuild"\n'
    'path = "migration_career_v2.sql"\nmanual_only = true\napproval = "staging only"\n'
    'requires = ["migration_base"]\n'
    '[[entry]]\nid = "migration_after"\nkind = "schema"\npath = "migration_after.sql"\n'
    'requires = ["migration_career_v2"]\n'
)


def setup(tmp_path):
    root = make_root(
        tmp_path,
        {
            "migration_base.sql": "SELECT 1;\n",
            "migration_career_v2.sql": "SELECT 2;\n",
            "migration_after.sql": "SELECT 3;\n",
        },
    )
    mpath = tmp_path / "manifest.toml"
    mpath.write_text(MANIFEST)
    return root, mpath, mf.load_manifest(mpath)


def baseline_file(tmp_path, root, manifest, operator, **extra):
    row = {
        "id": "migration_career_v2",
        "checksum": mf.entry_checksum(manifest.entries[1], root),
        "kind": "baseline",
        "operator": operator,
        "preflight_sha256": "ab" * 32,
        **extra,
    }
    path = tmp_path / "b.json"
    path.write_text(json.dumps({"applied": [row]}))
    return path


def run(mpath, root, ex, *argv):
    return cli.main(
        ["--manifest", str(mpath), "--root", str(root), *argv], connect=lambda: ex
    )


def test_import_without_the_reason_marker_is_refused(tmp_path, capsys):
    root, mpath, manifest = setup(tmp_path)
    path = baseline_file(tmp_path, root, manifest, "sam")
    assert run(mpath, root, FakeExecutor(), "import-baseline", str(path)) == 1
    assert "rebuild" in capsys.readouterr().err


@pytest.mark.parametrize(
    "operator",
    [
        "sam rebuild baseline reason: seeded",  # no parentheses
        "sam (rebuild baseline reason: )",  # empty reason
        "sam (rebuild baseline reason:seeded)",  # wrong spacing
        "(rebuild baseline reason: seeded)",  # no operator
        "sam (Rebuild baseline reason: seeded)",  # wrong case
        "sam (rebuild baseline reason: a) trailing",  # trailing text
    ],
)
def test_forged_or_partial_marker_is_refused(tmp_path, operator):
    root, mpath, manifest = setup(tmp_path)
    path = baseline_file(tmp_path, root, manifest, operator)
    assert run(mpath, root, FakeExecutor(), "import-baseline", str(path)) == 1


def test_a_reason_in_a_separate_field_alone_does_not_count(tmp_path):
    root, mpath, manifest = setup(tmp_path)
    path = baseline_file(tmp_path, root, manifest, "sam", reason="seeded already")
    assert run(mpath, root, FakeExecutor(), "import-baseline", str(path)) == 1


def test_baseline_command_output_is_accepted_by_import(
    tmp_path, capsys, sqlite_bootstrap  # noqa: F811
):
    root, mpath, manifest = setup(tmp_path)
    pre = tmp_path / "preflight.json"
    pre.write_text(json.dumps({"ok": True}))
    out = tmp_path / "out.json"
    assert (
        run(
            mpath,
            root,
            FakeExecutor(),
            "baseline",
            "--preflight",
            str(pre),
            "--entries",
            "migration_career_v2",
            "--operator",
            "ana",
            "--reason",
            "taxonomy seeded 2026-09-01",
            "--out",
            str(out),
        )
        == 0
    )
    ex = FakeExecutor()
    assert run(mpath, root, ex, "import-baseline", str(out)) == 0  # dry run
    assert run(mpath, root, ex, "import-baseline", str(out), "--apply") == 0
    assert ids(ex) == ["migration_career_v2"]


def test_a_checksum_mismatch_is_still_refused_with_a_valid_marker(tmp_path):
    root, mpath, manifest = setup(tmp_path)
    path = baseline_file(
        tmp_path,
        root,
        manifest,
        "sam (rebuild baseline reason: seeded)",
        checksum="0" * 64,
    )
    assert run(mpath, root, FakeExecutor(), "import-baseline", str(path)) == 1


def test_a_baselined_rebuild_is_never_run_and_unblocks_its_dependants(tmp_path):
    root, mpath, manifest = setup(tmp_path)
    checksum = lambda e: mf.entry_checksum(e, root)  # noqa: E731
    base = mf.entry_checksum(manifest.entries[0], root)
    # pending rebuild: refused, never in would_run, dependants blocked
    plan = pl.build_plan(manifest, InMemoryLedger({"migration_base": base}), checksum)
    assert [r.status for r in plan.rows][1:] == [pl.REFUSED, pl.BLOCKED]
    assert "migration_career_v2" not in [r.id for r in plan.would_run]
    # allow_rebuild plus approval still does not make it runnable
    plan = pl.build_plan(
        manifest,
        InMemoryLedger({"migration_base": base}),
        checksum,
        allow_rebuild=True,
        rebuild_approval="ticket",
    )
    assert (
        next(r for r in plan.rows if r.id == "migration_career_v2").status == pl.MANUAL
    )
    assert "migration_career_v2" not in [r.id for r in plan.would_run]
    # once recorded, the dependant can run; the rebuild file is still not executed
    ledger = InMemoryLedger(
        {"migration_base": base, "migration_career_v2": checksum(manifest.entries[1])}
    )
    plan = pl.build_plan(manifest, ledger, checksum)
    assert [r.id for r in plan.would_run] == ["migration_after"]


def test_apply_never_executes_a_rebuild_entry(tmp_path, sqlite_bootstrap):  # noqa: F811
    root, _mpath, manifest = setup(tmp_path)
    checksum = lambda e: mf.entry_checksum(e, root)  # noqa: E731
    sha = pl.plan_sha(pl.build_plan(manifest, InMemoryLedger(), checksum))
    ex = FakeExecutor()
    ap.run_apply(
        manifest,
        root,
        ex,
        apply=True,
        empty_database=True,
        approve=["migration_career_v2"],
        approval_ref="ticket",
        expected_plan_sha=sha,
    )
    assert "migration_career_v2" not in ids(ex)
    assert "migration_after" not in ids(ex)  # its dependency was never satisfied


def test_plan_prints_the_exact_baseline_hint_for_unmet_external_requires(tmp_path):
    root = make_root(tmp_path, {"migration_x.sql": "SELECT 1;\n"})
    manifest = mf.parse_manifest(
        {
            "entry": [
                {
                    "id": "migration_x",
                    "kind": "schema",
                    "path": "migration_x.sql",
                    "requires": [],
                    "external_requires": [
                        {
                            "ref": "migration_admission_intelligence.sql",
                            "evidence": "x:1",
                        }
                    ],
                }
            ],
            "unordered": [
                {"path": "migration_admission_intelligence.sql", "reason": "r"}
            ],
        }
    )
    checksum = lambda e: mf.entry_checksum(e, root)  # noqa: E731
    plan = pl.build_plan(manifest, InMemoryLedger(), checksum)
    detail = plan.rows[0].detail
    assert plan.rows[0].status == pl.BLOCKED
    assert (
        "baseline --preflight PREFLIGHT.json --entries "
        "migration_admission_intelligence.sql --operator NAME" in detail
    )
    assert "--reason" not in detail

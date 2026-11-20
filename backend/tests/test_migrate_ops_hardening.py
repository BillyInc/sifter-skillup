"""Workflow/ops hardening of the migrate tooling: plan-sha, approval groups, row checks,
rebuild baselines, blocking external requirements and the workflow's injection gates.
Synthetic files and a sqlite-backed fake only; no database."""

import json
import re
from pathlib import Path

import pytest

from migrate import apply as ap
from migrate import cli
from migrate import manifest as mf
from migrate import plan as pl
from migrate.ledger import BaselineError, InMemoryLedger, build_baseline
from migrate.rowchecks import RowCheckError, run_row_checks
from tests.test_migrate_apply import (
    FakeExecutor,
    entry,
    make_root,
    manifest_of,
    seeded,
)

WORKFLOW = (
    Path(__file__).resolve().parents[2] / ".github" / "workflows" / "migrations.yml"
)


def two(tmp_path):
    root = make_root(
        tmp_path,
        {
            "seed_one.sql": "CREATE TABLE skillup_dev.one (x INTEGER);\nINSERT INTO skillup_dev.one VALUES (1);\n",
            "seed_two.sql": "CREATE TABLE skillup_dev.two (x INTEGER);\nINSERT INTO skillup_dev.two VALUES (1);\n",
        },
    )
    manifest = manifest_of(
        entry(
            "seed_one", kind="destructive", approval="a", must_apply_with=["seed_two"]
        ),
        entry(
            "seed_two", kind="destructive", approval="a", must_apply_with=["seed_one"]
        ),
    )
    return root, manifest


# ------------------------------------------------------------------ plan-sha


def build_pl(manifest, root, ledger=None):
    return pl.build_plan(
        manifest,
        ledger or InMemoryLedger(),
        pl.default_checksummer(root),
        checksum_pending=True,
    )


def test_plan_sha_is_stable_and_changes_with_file_or_ledger(tmp_path):
    root, manifest = two(tmp_path)
    first = pl.plan_sha(build_pl(manifest, root))
    assert re.fullmatch(r"[0-9a-f]{64}", first)
    assert pl.plan_sha(build_pl(manifest, root)) == first
    (tmp_path / "seed_two.sql").write_text("SELECT 2;\n")
    assert pl.plan_sha(build_pl(manifest, root)) != first
    ledger = InMemoryLedger({"seed_one": "x"})
    assert pl.plan_sha(build_pl(manifest, root, ledger)) != first


def test_plan_output_prints_sha_only_when_reliable(tmp_path):
    root, manifest = two(tmp_path)
    assert "plan-sha:" in pl.format_plan(build_pl(manifest, root))
    no_checksums = pl.build_plan(
        manifest, InMemoryLedger(), pl.default_checksummer(root)
    )
    assert "plan-sha:" not in pl.format_plan(no_checksums)
    assert pl.plan_to_dict(no_checksums)["plan_sha"] is None


def test_apply_refuses_a_stale_or_wrong_plan_sha_and_accepts_the_right_one(tmp_path):
    root = make_root(
        tmp_path, {"migration_a.sql": "CREATE TABLE skillup_dev.a (x INTEGER);\n"}
    )
    manifest = manifest_of(entry("migration_a"))
    ex = seeded(FakeExecutor())
    dry = ap.run_apply(manifest, root, ex)
    sha = pl.plan_sha(dry.plan)
    bad = ap.run_apply(
        manifest, root, seeded(FakeExecutor()), apply=True, expected_plan_sha="0" * 64
    )
    assert bad.exit_code == 1 and "plan-sha mismatch" in bad.messages[0]
    ex2 = seeded(FakeExecutor())
    ok = ap.run_apply(manifest, root, ex2, apply=True, expected_plan_sha=sha)
    assert ok.exit_code == 0 and ex2.has_table("a")
    # an edit after review changes the sha and refuses
    ex3 = seeded(FakeExecutor())
    (tmp_path / "migration_a.sql").write_text(
        "CREATE TABLE skillup_dev.a (y INTEGER);\n"
    )
    stale = ap.run_apply(manifest, root, ex3, apply=True, expected_plan_sha=sha)
    assert stale.exit_code == 1 and not ex3.has_table("a")


def test_cli_apply_refuses_without_plan_sha(tmp_path, capsys):
    from tests.test_migrate_apply import basic, run_cli

    basic(tmp_path)
    assert run_cli(["apply", "--apply"], seeded(FakeExecutor()), tmp_path) == 1
    assert "--plan-sha" in capsys.readouterr().err


# ------------------------------------------------------- must_apply_with group


def test_replacement_seeds_must_be_approved_together(tmp_path):
    root, manifest = two(tmp_path)
    alone = ap.run_apply(
        manifest,
        root,
        seeded(FakeExecutor()),
        apply=True,
        approve=["seed_one"],
        approval_ref="me",
    )
    assert alone.exit_code == 1 and "seed_two" in alone.messages[0]
    ex = seeded(FakeExecutor())
    both = ap.run_apply(
        manifest,
        root,
        ex,
        apply=True,
        approve=["seed_one", "seed_two"],
        approval_ref="me",
    )
    assert both.exit_code == 0 and ex.has_table("one") and ex.has_table("two")


def test_group_partner_already_in_ledger_counts_as_done():
    manifest = manifest_of(
        entry(
            "seed_one", kind="destructive", approval="a", must_apply_with=["seed_two"]
        ),
        entry(
            "seed_two", kind="destructive", approval="a", must_apply_with=["seed_one"]
        ),
    )
    assert pl.group_violations(manifest, ["seed_one"], ["seed_two"]) == []
    assert pl.group_violations(manifest, ["seed_one"], []) != []


def test_must_apply_with_must_be_known_and_symmetric(tmp_path):
    root = make_root(
        tmp_path, {"seed_a.sql": "SELECT 1;\n", "seed_b.sql": "SELECT 1;\n"}
    )
    unknown = manifest_of(entry("seed_a", must_apply_with=["nope"]))
    assert any(i.code == "MUST_APPLY_WITH" for i in mf.validate(unknown, root))
    lopsided = manifest_of(entry("seed_a", must_apply_with=["seed_b"]), entry("seed_b"))
    assert any(
        "does not list it back" in i.message for i in mf.validate(lopsided, root)
    )


def test_repo_manifest_pairs_the_two_replacement_subject_seeds():
    manifest = mf.load_manifest()
    by_id = {e.id: e for e in manifest.entries}
    assert by_id["seed_subject_rule_records"].must_apply_with == (
        "seed_subject_options",
    )
    assert by_id["seed_subject_options"].must_apply_with == (
        "seed_subject_rule_records",
    )


# ------------------------------------------------------------------ verify_rows


def test_verify_rows_parse_rejects_bad_shapes():
    with pytest.raises(mf.ManifestError):
        manifest_of(entry("seed_a", verify_rows=[{"table": "x.y", "min_rows": 1}]))
    with pytest.raises(mf.ManifestError):
        manifest_of(entry("seed_a", verify_rows=[{"table": "x", "min_rows": 0}]))
    ok = manifest_of(entry("seed_a", verify_rows=[{"table": "x", "min_rows": 2}]))
    assert ok.entries[0].verify_rows == (mf.RowCheck("x", 2),)


def test_seed_without_row_checks_gets_a_warning_not_an_error(tmp_path):
    root = make_root(tmp_path, {"seed_a.sql": "SELECT 1;\n"})
    issues = mf.validate(manifest_of(entry("seed_a")), root)
    assert any(
        i.code == "SEED_NO_ROW_CHECK" and i.severity == "warning" for i in issues
    )
    assert not [i for i in issues if i.severity == "error"]


def test_short_row_count_rolls_the_entry_back_and_records_nothing(tmp_path):
    root = make_root(
        tmp_path,
        {"seed_empty.sql": "CREATE TABLE skillup_dev.t (x INTEGER);\n"},
    )
    manifest = manifest_of(
        entry("seed_empty", verify_rows=[{"table": "t", "min_rows": 1}])
    )
    ex = seeded(FakeExecutor())
    result = ap.run_apply(manifest, root, ex, apply=True)
    assert result.exit_code == 1 and "expected at least 1" in result.messages[0]
    assert not ex.has_table("t")  # rolled back with the entry
    assert (
        ex.query(
            "SELECT count(*) FROM skillup_dev.schema_migrations WHERE id='seed_empty'"
        )[0][0]
        == 0
    )


def test_enough_rows_commits(tmp_path):
    root = make_root(
        tmp_path,
        {
            "seed_ok.sql": "CREATE TABLE skillup_dev.t (x INTEGER);\nINSERT INTO skillup_dev.t VALUES (1);\n"
        },
    )
    manifest = manifest_of(
        entry("seed_ok", verify_rows=[{"table": "t", "min_rows": 1}])
    )
    ex = seeded(FakeExecutor())
    assert ap.run_apply(manifest, root, ex, apply=True).exit_code == 0


def test_row_check_rejects_unsafe_names():
    ex = FakeExecutor()
    bad = mf.Entry(
        id="x", kind="seed", path="x.sql", verify_rows=(mf.RowCheck("a;drop", 1),)
    )
    with pytest.raises(RowCheckError):
        run_row_checks(ex, bad)
    with pytest.raises(RowCheckError):
        run_row_checks(ex, bad, "bad schema")


# ------------------------------------------- rebuild baselines / external requires


def _preflight(tmp_path):
    f = tmp_path / "preflight.json"
    f.write_text(json.dumps({"ok": True}))
    return f


def rebuild_manifest():
    return manifest_of(
        entry("migration_base"),
        entry(
            "migration_career_v2",
            kind="rebuild",
            requires=["migration_base"],
            manual_only=True,
            approval="x",
        ),
        entry(
            "migration_after",
            requires=["migration_base"],
            external_requires=[
                {"ref": "migration_career_v2", "evidence": "after.sql:1"}
            ],
        ),
    )


def rebuild_root(tmp_path):
    return make_root(
        tmp_path,
        {
            n: "SELECT 1;\n"
            for n in (
                "migration_base.sql",
                "migration_career_v2.sql",
                "migration_after.sql",
            )
        },
    )


def test_rebuild_baseline_needs_a_written_reason(tmp_path):
    root, manifest = rebuild_root(tmp_path), rebuild_manifest()
    with pytest.raises(BaselineError, match="--reason"):
        build_baseline(
            manifest, root, ["migration_career_v2"], _preflight(tmp_path), "ana"
        )
    rows = build_baseline(
        manifest,
        root,
        ["migration_career_v2"],
        _preflight(tmp_path),
        "ana",
        reason="taxonomy seeded on 2026-09-01 from the compressed career seed",
    )
    assert rows[0]["reason"].startswith("taxonomy seeded")
    assert "rebuild baseline reason" in rows[0]["operator"] and rows[0][
        "operator"
    ].startswith("ana")


def test_non_rebuild_baseline_ignores_reason(tmp_path):
    root, manifest = rebuild_root(tmp_path), rebuild_manifest()
    rows = build_baseline(
        manifest, root, ["migration_base"], _preflight(tmp_path), "ana", reason="x"
    )
    assert "reason" not in rows[0] and rows[0]["operator"] == "ana"


def test_dependant_of_a_rebuild_is_blocked_until_it_is_baselined(tmp_path):
    root, manifest = rebuild_root(tmp_path), rebuild_manifest()
    base_sum = mf.entry_checksum(manifest.entries[0], root)
    before = build_pl(manifest, root, InMemoryLedger({"migration_base": base_sum}))
    assert [r.status for r in before.rows] == [pl.APPLIED, pl.REFUSED, pl.BLOCKED]
    assert "migration_career_v2" in before.rows[2].detail
    rows = build_baseline(
        manifest,
        root,
        ["migration_career_v2"],
        _preflight(tmp_path),
        "ana",
        reason="why",
    )
    ledger = InMemoryLedger({"migration_base": base_sum})
    ledger.record_baseline(
        "migration_career_v2",
        rows[0]["checksum"],
        operator=rows[0]["operator"],
        preflight_sha256="h",
    )
    after = build_pl(manifest, root, ledger)
    assert [r.status for r in after.rows][2] == pl.PENDING
    # baselined out of manifest order: not reported as an out-of-order apply
    assert not any("out of order" in w for w in after.warnings)


def test_unordered_file_can_be_baselined_as_already_present(tmp_path):
    root = make_root(
        tmp_path, {"migration_a.sql": "SELECT 1;\n", "migration_u.sql": "SELECT 1;\n"}
    )
    manifest = mf.parse_manifest(
        {
            "entry": [entry("migration_a")],
            "unordered": [{"path": "migration_u.sql", "reason": "r"}],
        }
    )
    rows = build_baseline(
        manifest, root, ["migration_u.sql"], _preflight(tmp_path), "ana"
    )
    assert rows[0]["id"] == "migration_u.sql" and rows[0]["kind"] == "baseline"
    with pytest.raises(BaselineError):
        build_baseline(manifest, root, ["nope.sql"], _preflight(tmp_path), "ana")


def test_cli_baseline_takes_reason(tmp_path, capsys):
    rebuild_root(tmp_path)
    mpath = tmp_path / "manifest.toml"
    mpath.write_text(
        '[[entry]]\nid = "migration_career_v2"\nkind = "rebuild"\npath = "migration_career_v2.sql"\n'
        'manual_only = true\napproval = "x"\n'
    )
    out = tmp_path / "applied.json"
    argv = [
        "--manifest",
        str(mpath),
        "--root",
        str(tmp_path),
        "baseline",
        "--preflight",
        str(_preflight(tmp_path)),
        "--entries",
        "migration_career_v2",
        "--operator",
        "ana",
        "--out",
        str(out),
    ]
    assert cli.main(argv) == 1  # no --reason
    assert cli.main(argv + ["--reason", "seeded by hand"]) == 0
    assert json.loads(out.read_text())["applied"][0]["reason"] == "seeded by hand"


# ------------------------------------------------------------ workflow injection


def _run_blocks(text):
    return re.findall(r"run: \|\n((?:\s{10,}.*\n)+)|run: (.+)\n", text)


def test_no_dispatch_input_is_interpolated_into_a_shell_script():
    text = WORKFLOW.read_text()
    scripts = "\n".join(a or b for a, b in _run_blocks(text))
    assert "${{" not in scripts, "inputs/secrets must reach scripts via env: only"
    for name in (
        "approve_ids",
        "approval_ref",
        "confirm_apply",
        "empty_database",
        "plan_sha",
    ):
        assert f"inputs.{name}" in text
        assert re.search(rf"\$\{{\{{ inputs\.{name} \}}\}}", text)


def test_approve_ids_are_validated_and_split_without_globbing_or_flags():
    text = WORKFLOW.read_text()
    assert "read -ra approve_list" in text
    id_re = re.search(r"id_re='([^']+)'", text).group(1)
    ok = re.compile(id_re)
    for good in ("seed_a", "seed_a migration_b.c-1"):
        assert ok.fullmatch(good), good
    for evil in (
        "x --apply",
        "--apply",
        "-x",
        "x --empty-database",
        "*",
        "x;y",
        "x\ny --apply",
        "$(id)",
        "",
    ):
        assert ok.fullmatch(evil) is None, evil
    # the approval reference is passed as --flag=value so it can never be read as a flag
    assert '"--approval-ref=$APPROVAL_REF"' in text


def test_database_secret_is_step_scoped_and_environment_is_dedicated():
    text = WORKFLOW.read_text()
    assert re.findall(r"^    env:\n", text, re.M) == [], "no job-level env block"
    assert text.count("MIGRATE_DATABASE_URL: ${{ secrets.DATABASE_URL }}") == 2
    assert text.count("secrets.DATABASE_URL") == 2
    for match in re.finditer(
        r"MIGRATE_DATABASE_URL: \$\{\{ secrets.DATABASE_URL \}\}", text
    ):
        indent = len(text[text.rfind("\n", 0, match.start()) + 1 : match.start()])
        assert indent == 10, "the secret must sit under a step's env: (10 spaces)"
    # the pip install step is separate from (and earlier than) every step that has the secret
    assert text.index("psycopg[binary]==") < text.index("MIGRATE_DATABASE_URL: ${{")
    assert text.count("environment: production-db") == 2
    assert "environment: production\n" not in text


def test_concurrency_never_cancels_database_runs():
    text = WORKFLOW.read_text()
    assert "cancel-in-progress: ${{ github.event_name == 'pull_request' }}" in text
    assert "cancel-in-progress: true" not in text
    assert text.count("cancel-in-progress: false") == 2  # both db jobs


def test_third_party_actions_are_pinned_to_commit_shas():
    text = WORKFLOW.read_text()
    for use in re.findall(r"uses: (\S+)", text):
        assert re.fullmatch(r"[\w./-]+@[0-9a-f]{40}", use), use


def test_apply_step_requires_a_plan_sha_to_execute():
    text = WORKFLOW.read_text()
    assert "[0-9a-f]{64}" in text and "--plan-sha=" in text and "plan_sha" in text

"""Guards against the REAL repository manifest.

``test_every_migration_is_registered`` is the guard that a new
``backend/migration_*.sql`` (or seed/patch file) cannot be forgotten: it must be
added to ``backend/migrate/manifest.toml`` as an ordered entry or, when its
order is not documented, as an ``[[unordered]]`` item with a reason.
"""

from pathlib import Path

from migrate import cli
from migrate import manifest as mf
from migrate import sqlio

BACKEND = Path(__file__).resolve().parents[1]
MANIFEST = BACKEND / "migrate" / "manifest.toml"


def test_real_manifest_verifies():
    issues = mf.validate(mf.load_manifest(MANIFEST), BACKEND)
    assert issues == [], "\n".join(str(i) for i in issues)


def test_verify_manifest_cli_succeeds_on_the_real_repo(capsys):
    assert cli.main(["verify-manifest"]) == 0
    assert "0 errors" in capsys.readouterr().out


def test_every_migration_is_registered():
    manifest = mf.load_manifest(MANIFEST)
    registered: set[str] = set()
    for entry in manifest.entries:
        registered |= mf._covered_keys(entry.path or entry.parts_glob or "")
    for item in manifest.unordered:
        registered |= mf._covered_keys(item.path)
    on_disk = {path.name for path in BACKEND.glob("migration_*.sql")}
    forgotten = sorted(name for name in on_disk if sqlio.stem(name) not in registered)
    assert forgotten == [], (
        f"register these in backend/migrate/manifest.toml: {forgotten}"
    )


def test_career_v2_is_never_automatic_and_replacement_seeds_are_destructive():
    by_id = {entry.id: entry for entry in mf.load_manifest(MANIFEST).entries}
    career_v2 = by_id["migration_career_v2"]
    assert career_v2.kind == "destructive" and career_v2.manual_only
    assert by_id["seed_subject_options"].kind == "destructive"


def test_contextual_parts_group_is_the_documented_35():
    group = next(
        e
        for e in mf.load_manifest(MANIFEST).entries
        if e.id == "seed_career_context_items_v1_parts"
    )
    assert group.is_group and group.expected_parts == 35
    assert len(mf.entry_files(group, BACKEND)) == 35


def test_documented_orderings_hold():
    ids = [e.id for e in mf.load_manifest(MANIFEST).entries]
    before = lambda a, b: ids.index(a) < ids.index(b)  # noqa: E731
    assert before("migration_subject_catalog", "migration_career_pilot")
    assert before(
        "migration_school_subject_pass_conditions_2026-10-24", "seed_career_pilot"
    )
    assert before("seed_subject_rule_records", "seed_subject_options")
    # runbook: the domain-guidance seed UPDATEs a row the 35 contextual parts create.
    assert before(
        "seed_career_context_items_v1_parts",
        "seed_sociology_domain_guidance_2026-10-08",
    )
    assert before(
        "seed_d078_guided_content_2026-10-12",
        "seed_d078_role_item_contracts_2026-10-15",
    )
    assert before(
        "seed_d078_role_item_contracts_2026-10-15", "seed_d078_role_tools_2026-10-16"
    )

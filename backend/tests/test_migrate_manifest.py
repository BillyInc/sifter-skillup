"""Manifest parsing and validation rules (synthetic files, no database)."""

import gzip
from pathlib import Path

import pytest

from migrate import manifest as mf


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


def test_valid_manifest_has_no_issues(tmp_path):
    root = make_root(tmp_path)
    manifest = build(
        [entry("migration_a"), entry("migration_b", requires=["migration_a"])]
    )
    assert mf.validate(manifest, root) == []


@pytest.mark.parametrize(
    "bad, message",
    [
        ({"id": "x", "kind": "weird", "path": "x.sql"}, "kind"),
        ({"id": "x", "kind": "schema"}, "exactly one"),
        (
            {"id": "x", "kind": "schema", "path": "x.sql", "parts_glob": "p/*.gz"},
            "exactly one",
        ),
        ({"kind": "schema", "path": "x.sql"}, "id"),
        ({"id": "x", "kind": "schema", "path": "x.sql", "requires": "y"}, "requires"),
        (
            {"id": "x", "kind": "schema", "path": "x.sql", "manual_only": "yes"},
            "manual_only",
        ),
    ],
)
def test_structural_errors_raise(bad, message):
    with pytest.raises(mf.ManifestError, match=message):
        build([bad])


def test_missing_path_is_reported(tmp_path):
    root = make_root(tmp_path, names=("migration_a.sql",))
    manifest = build(
        [entry("migration_a"), entry("migration_gone", path="migration_gone.sql")]
    )
    issues = mf.validate(manifest, root)
    assert any(
        i.code == "MISSING_PATH" and "migration_gone.sql" in i.message for i in issues
    )


def test_duplicate_id_is_reported(tmp_path):
    root = make_root(tmp_path)
    manifest = build(
        [entry("migration_a"), entry("migration_a", path="migration_b.sql")]
    )
    assert "DUPLICATE_ID" in codes(manifest, root)


def test_unknown_requires_is_reported(tmp_path):
    root = make_root(tmp_path)
    manifest = build([entry("migration_a", requires=["nope"]), entry("migration_b")])
    assert "UNKNOWN_REQUIRE" in codes(manifest, root)


def test_requires_pointing_forward_is_an_order_error(tmp_path):
    root = make_root(tmp_path)
    manifest = build(
        [entry("migration_a", requires=["migration_b"]), entry("migration_b")]
    )
    assert "ORDER" in codes(manifest, root)


def test_cycle_is_detected(tmp_path):
    root = make_root(tmp_path)
    manifest = build(
        [
            entry("migration_a", requires=["migration_b"]),
            entry("migration_b", requires=["migration_a"]),
        ]
    )
    found = mf.validate(manifest, root)
    cycles = [i for i in found if i.code == "CYCLE"]
    assert (
        cycles
        and "migration_a" in cycles[0].message
        and "migration_b" in cycles[0].message
    )


def test_self_dependency_is_a_cycle(tmp_path):
    root = make_root(tmp_path)
    manifest = build(
        [entry("migration_a", requires=["migration_a"]), entry("migration_b")]
    )
    assert "CYCLE" in codes(manifest, root)


def test_destructive_requires_manual_only_or_approval(tmp_path):
    root = make_root(tmp_path)
    unguarded = build([entry("migration_a", kind="destructive"), entry("migration_b")])
    assert "DESTRUCTIVE_UNGUARDED" in codes(unguarded, root)
    manual = build(
        [
            entry("migration_a", kind="destructive", manual_only=True),
            entry("migration_b"),
        ]
    )
    assert "DESTRUCTIVE_UNGUARDED" not in codes(manual, root)
    approved = build(
        [
            entry("migration_a", kind="destructive", approval="owner + backup"),
            entry("migration_b"),
        ]
    )
    assert "DESTRUCTIVE_UNGUARDED" not in codes(approved, root)


def test_unregistered_migration_is_reported(tmp_path):
    root = make_root(
        tmp_path,
        names=("migration_a.sql", "migration_b.sql", "migration_forgotten.sql"),
    )
    manifest = build([entry("migration_a"), entry("migration_b")])
    issues = mf.validate(manifest, root)
    assert [i.message for i in issues if i.code == "UNREGISTERED_FILE"] == [
        "migration_forgotten.sql is neither in the manifest nor in [[unordered]] - register it"
    ]


def test_unordered_covers_a_file_and_needs_a_reason(tmp_path):
    root = make_root(tmp_path, names=("migration_a.sql", "migration_b.sql"))
    manifest = build(
        [entry("migration_a")],
        unordered=[{"path": "migration_b.sql", "reason": "order not documented"}],
    )
    assert mf.validate(manifest, root) == []
    no_reason = build([entry("migration_a")], unordered=[{"path": "migration_b.sql"}])
    assert "UNORDERED_REASON" in codes(no_reason, root)


def test_file_cannot_be_both_ordered_and_unordered(tmp_path):
    root = make_root(tmp_path)
    manifest = build(
        [entry("migration_a"), entry("migration_b")],
        unordered=[{"path": "migration_a.sql", "reason": "oops"}],
    )
    assert "DOUBLE_REGISTERED" in codes(manifest, root)


def test_gz_transport_counts_as_the_same_registration(tmp_path):
    (tmp_path / "migration_a.sql").write_text("SELECT 1;\n")
    with gzip.open(tmp_path / "migration_a.sql.gz", "wb") as handle:
        handle.write(b"SELECT 1;\n")
    manifest = build([entry("migration_a")])
    assert mf.validate(manifest, tmp_path) == []


def test_parts_group_numbering_and_expected_count(tmp_path):
    parts = tmp_path / "seed_x_parts"
    parts.mkdir()
    for number in (1, 2, 4):
        with gzip.open(parts / f"part-{number:03d}.sql.gz", "wb") as handle:
            handle.write(b"SELECT 1;\n")
    group = {
        "id": "seed_x_parts",
        "kind": "seed",
        "parts_glob": "seed_x_parts/part-*.sql.gz",
        "requires": [],
    }
    assert "PARTS_GAP" in codes(build([group]), tmp_path)
    with gzip.open(parts / "part-003.sql.gz", "wb") as handle:
        handle.write(b"SELECT 1;\n")
    assert mf.validate(build([group]), tmp_path) == []
    assert "PARTS_GAP" in codes(build([dict(group, expected_parts=5)]), tmp_path)


def test_missing_down_and_verify_files_are_reported(tmp_path):
    root = make_root(tmp_path)
    manifest = build(
        [
            entry(
                "migration_a",
                down="migration_a_down.sql",
                verify=["checks/a.sql", "SELECT 1"],
            ),
            entry("migration_b"),
        ]
    )
    found = [i.message for i in mf.validate(manifest, root) if i.code == "MISSING_PATH"]
    assert any("migration_a_down.sql" in m for m in found)
    assert any("checks/a.sql" in m for m in found)
    assert not any("SELECT 1" in m for m in found)


def test_group_checksum_changes_when_a_part_changes(tmp_path):
    parts = tmp_path / "seed_x_parts"
    parts.mkdir()
    for number in (1, 2):
        with gzip.open(parts / f"part-{number:03d}.sql.gz", "wb") as handle:
            handle.write(f"SELECT {number};\n".encode())
    group = build(
        [{"id": "g", "kind": "seed", "parts_glob": "seed_x_parts/part-*.sql.gz"}]
    ).entries[0]
    before = mf.entry_checksum(group, tmp_path)
    with gzip.open(parts / "part-002.sql.gz", "wb") as handle:
        handle.write(b"SELECT 99;\n")
    assert mf.entry_checksum(group, tmp_path) != before


def test_checksum_is_over_decompressed_bytes(tmp_path):
    plain = tmp_path / "migration_a.sql"
    plain.write_bytes(b"SELECT 1;\n")
    with gzip.open(tmp_path / "migration_b.sql.gz", "wb") as handle:
        handle.write(b"SELECT 1;\n")
    a = build([entry("migration_a")]).entries[0]
    b = build([entry("migration_b", path="migration_b.sql.gz")]).entries[0]
    assert mf.entry_checksum(a, tmp_path) == mf.entry_checksum(b, tmp_path)

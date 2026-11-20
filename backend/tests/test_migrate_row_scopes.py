"""Scoped verify_rows: a `where` narrows the count to the rows a seed owns, so a table that
already holds other rows cannot hide a seed that wrote nothing. sqlite fake only; no database."""

import re
from pathlib import Path

import pytest

from migrate import manifest as mf
from migrate import sqlio
from migrate.rowchecks import RowCheckError, run_row_checks
from tests.test_migrate_apply import FakeExecutor, entry, manifest_of


def _items_table() -> FakeExecutor:
    ex = FakeExecutor()
    ex.db.execute(
        "CREATE TABLE skillup_dev.items (context_level TEXT, context_key TEXT, item_type TEXT)"
    )
    rows = [("domain", "D078", "skill")] * 3 + [("role", "D078|a", "tool")] * 2
    rows += [("role", "D999|b", "tool")] * 5
    ex.db.executemany("INSERT INTO skillup_dev.items VALUES (?, ?, ?)", rows)
    return ex


def _check(**kw) -> mf.Entry:
    return mf.Entry(
        id="seed_x", kind="seed", path="x.sql", verify_rows=(mf.RowCheck(**kw),)
    )


def test_where_parses_all_three_ops():
    m = manifest_of(
        entry(
            "seed_a",
            verify_rows=[
                {
                    "table": "items",
                    "min_rows": 2,
                    "where": [
                        {"column": "context_level", "op": "=", "value": "role"},
                        {"column": "context_key", "op": "like", "value": "D078|%"},
                        {
                            "column": "item_type",
                            "op": "in",
                            "values": ["tool", "skill"],
                        },
                    ],
                }
            ],
        )
    )
    check = m.entries[0].verify_rows[0]
    assert check.where == (
        ("context_level", "=", ("role",)),
        ("context_key", "like", ("D078|%",)),
        ("item_type", "in", ("tool", "skill")),
    )


@pytest.mark.parametrize(
    "where",
    [
        [],
        "context_level = 'role'",
        [{"column": "Bad Col", "op": "=", "value": "x"}],
        [{"column": "c", "op": "!=", "value": "x"}],
        [{"column": "c", "op": "=", "value": ""}],
        [{"column": "c", "op": "=", "value": 3}],
        [{"column": "c", "op": "in", "values": []}],
        [{"column": "c", "op": "in", "values": ["ok", ""]}],
        [{"column": "c", "op": "in", "value": "x"}],
        ["not a table"],
    ],
)
def test_where_rejects_bad_shapes(where):
    with pytest.raises(mf.ManifestError):
        manifest_of(
            entry(
                "seed_a",
                verify_rows=[{"table": "items", "min_rows": 1, "where": where}],
            )
        )


def test_scoped_check_ignores_rows_outside_the_scope():
    ex = _items_table()
    scope = (("context_level", "=", ("role",)), ("context_key", "like", ("D078|%",)))
    run_row_checks(ex, _check(table="items", min_rows=2, where=scope))
    with pytest.raises(RowCheckError, match="matching the declared scope"):
        run_row_checks(ex, _check(table="items", min_rows=3, where=scope))


def test_unscoped_check_is_fooled_by_other_rows_which_is_why_scope_exists():
    ex = _items_table()
    run_row_checks(ex, _check(table="items", min_rows=10))  # whole table: passes
    scope = (("context_key", "like", ("D078|%",)), ("item_type", "=", ("tool",)))
    with pytest.raises(RowCheckError):
        run_row_checks(ex, _check(table="items", min_rows=3, where=scope))


def test_in_scope_counts_any_listed_value():
    ex = _items_table()
    scope = (("context_level", "in", ("domain", "subgroup")),)
    run_row_checks(ex, _check(table="items", min_rows=3, where=scope))
    with pytest.raises(RowCheckError):
        run_row_checks(ex, _check(table="items", min_rows=4, where=scope))


def test_values_are_bound_parameters_not_sql():
    ex = _items_table()
    hostile = (("context_key", "=", ("x' OR '1'='1",)),)
    with pytest.raises(RowCheckError):
        run_row_checks(ex, _check(table="items", min_rows=1, where=hostile))
    assert ex.db.execute("SELECT count(*) FROM skillup_dev.items").fetchone()[0] == 10


def test_unsafe_where_column_or_op_is_refused_at_run_time_too():
    ex = _items_table()
    with pytest.raises(RowCheckError):
        run_row_checks(
            ex, _check(table="items", min_rows=1, where=(("a;drop", "=", ("x",)),))
        )
    with pytest.raises(RowCheckError):
        run_row_checks(
            ex,
            _check(table="items", min_rows=1, where=(("context_key", "<>", ("x",)),)),
        )


# ------------------------------------------------- the real manifest's row checks

BACKEND = Path(__file__).resolve().parents[1]


def _real_manifest() -> mf.Manifest:
    return mf.load_manifest(BACKEND / "migrate" / "manifest.toml")


def test_every_seed_entry_has_a_row_check():
    missing = [
        e.id
        for e in _real_manifest().entries
        if e.id.startswith("seed_") and not e.verify_rows
    ]
    assert missing == [], f"seed entries without verify_rows: {missing}"


def test_each_row_check_table_is_written_by_its_own_entry():
    """Guards typos: the checked table must appear as an INSERT target in the entry's SQL.
    Only the first file of a group is read (every contextual part inserts into both tables)."""
    manifest = _real_manifest()
    for seed in manifest.entries:
        if not seed.verify_rows:
            continue
        first = mf.entry_files(seed, BACKEND)[0]
        text = sqlio.normalise_bytes(sqlio.read_bytes(first)).decode("utf-8")
        for check in seed.verify_rows:
            pattern = rf"INSERT\s+INTO\s+(?:skillup_dev\.)?{re.escape(check.table)}\b"
            assert re.search(pattern, text, re.I), (
                f"{seed.id}: no INSERT INTO {check.table}"
            )


def test_contextual_seed_is_one_group_entry_of_35_parts():
    entry = next(
        e
        for e in _real_manifest().entries
        if e.id == "seed_career_context_items_v1_parts"
    )
    assert entry.parts_glob and entry.expected_parts == 35
    assert [c.min_rows for c in entry.verify_rows] == [121377]

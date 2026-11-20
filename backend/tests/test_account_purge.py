"""Saved items and notes survive soft delete and are purged only on hard delete."""
import account_purge as ap
from tests.test_collections_routes import FakeDB, ME, OTHER


def _db(monkeypatch, tables=("collections", "collection_items", "saved_items", "user_notes")):
    f = FakeDB(tables=tables)
    monkeypatch.setattr(ap, "db", f)
    for u in (ME, OTHER):
        f.tables.get("saved_items", []).append({"id": f"s-{u}", "user_id": u})
        f.tables.get("user_notes", []).append({"id": f"n-{u}", "user_id": u})
        f.tables.get("collections", []).append({"id": f"c-{u}", "user_id": u})
        f.tables.get("collection_items", []).append({"id": f"ci-{u}", "collection_id": f"c-{u}"})
    return f


def test_hard_delete_removes_only_that_users_content(monkeypatch):
    f = _db(monkeypatch)
    out = ap.hard_delete_learner_content(ME)
    assert out == {"collections": "deleted", "saved_items": "deleted", "user_notes": "deleted"}
    assert [r["user_id"] for r in f.tables["saved_items"]] == [OTHER]
    assert [r["user_id"] for r in f.tables["user_notes"]] == [OTHER]
    assert [r["user_id"] for r in f.tables["collections"]] == [OTHER]
    assert [r["collection_id"] for r in f.tables["collection_items"]] == [f"c-{OTHER}"]


def test_missing_table_is_skipped_and_others_still_purged(monkeypatch):
    f = _db(monkeypatch, tables=("saved_items",))
    out = ap.hard_delete_learner_content(ME)
    assert out["user_notes"] == "missing_table" and out["collections"] == "missing_table"
    assert [r["user_id"] for r in f.tables["saved_items"]] == [OTHER]


def test_soft_delete_path_does_not_purge_saved_items_or_notes():
    import inspect
    import main
    src = inspect.getsource(main.delete_me)
    assert "hard_delete_learner_content" not in src
    assert "user_notes" not in src and "saved_items" not in src


def test_unclaimed_student_hard_delete_purges_content(monkeypatch):
    import routes.provisioning_routes as pr
    calls = []
    monkeypatch.setattr(pr, "hard_delete_learner_content", lambda uid: calls.append(("purge", uid)))

    class _Q:
        def __getattr__(self, _n):
            return lambda *a, **k: self
        def execute(self):
            calls.append(("db",))
    monkeypatch.setattr(pr, "_users", lambda: _Q())
    pr._delete_unclaimed_student(_Q(), "stu-1")
    assert ("purge", "stu-1") in calls
    assert calls.index(("purge", "stu-1")) < len(calls) - 1  # before the user row delete

"""
Tests for routes/collections_routes.py (My World collections, slice 1).

An in-memory PostgREST-style fake stands in for Supabase so ownership rules
are exercised for real: every query the route issues runs against rows that
belong to two different users. The router is mounted on its own FastAPI app
with Auth.get_current_user overridden, so no JWT/DB/seed data is needed.
"""
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

import routes.collections_routes as cr
from auth import Auth


class _Result:
    def __init__(self, data):
        self.data = data


class _Query:
    def __init__(self, db, name):
        self.db, self.name = db, name
        self.op, self.payload = "select", None
        self.filters = []
        self.order_by = []
        self.limit_n = None

    def select(self, *_a, **_k):
        self.op = "select"
        return self

    def insert(self, payload):
        self.op, self.payload = "insert", payload
        return self

    def update(self, payload):
        self.op, self.payload = "update", payload
        return self

    def delete(self):
        self.op = "delete"
        return self

    def eq(self, col, val):
        self.filters.append(lambda r, c=col, v=val: r.get(c) == v)
        return self

    def in_(self, col, vals):
        self.filters.append(lambda r, c=col, v=list(vals): r.get(c) in v)
        return self

    def is_(self, col, val):
        self.filters.append(lambda r, c=col: r.get(c) is None)
        return self

    def order(self, col, desc=False):
        self.order_by.append(col)
        return self

    def limit(self, n):
        self.limit_n = n
        return self

    def execute(self):
        if self.name not in self.db.tables:
            raise Exception(
                f"{{'code': 'PGRST205', 'message': \"Could not find the table 'skillup_dev.{self.name}' in the schema cache\"}}"
            )
        rows = self.db.tables[self.name]
        match = [r for r in rows if all(f(r) for f in self.filters)]
        if self.op == "insert":
            row = dict(self.payload)
            row.setdefault("id", f"{self.name}-{self.db.next_id()}")
            row.setdefault("created_at", "2026-11-19T00:00:00Z")
            row.setdefault("updated_at", "2026-11-19T00:00:00Z")
            rows.append(row)
            return _Result([row])
        if self.op == "update":
            for r in match:
                r.update(self.payload)
            return _Result([dict(r) for r in match])
        if self.op == "delete":
            for r in match:
                rows.remove(r)
            return _Result([dict(r) for r in match])
        for col in reversed(self.order_by):
            match.sort(key=lambda r: (r.get(col) is None, r.get(col) or 0))
        if self.limit_n:
            match = match[: self.limit_n]
        return _Result([dict(r) for r in match])


class FakeDB:
    def __init__(self, tables=("collections", "collection_items", "saved_items")):
        self.tables = {t: [] for t in tables}
        self._n = 0

    def next_id(self):
        self._n += 1
        return self._n

    def schema(self, _name):
        return self

    def table(self, name):
        return _Query(self, name)

    def get_service_client(self):
        return self


ME, OTHER = "user-me", "user-other"


def _saved(fake, sid, user, label="Item"):
    fake.tables["saved_items"].append({
        "id": sid, "user_id": user, "entity_type": "programme",
        "entity_id": f"prog-{sid}", "label": label, "created_at": "2026-11-18T00:00:00Z",
    })


@pytest.fixture
def fake(monkeypatch):
    f = FakeDB()
    monkeypatch.setattr(cr, "db", f)
    return f


@pytest.fixture
def as_user():
    app = FastAPI()
    app.include_router(cr.router)
    state = {"id": ME}
    app.dependency_overrides[Auth.get_current_user] = lambda: {"id": state["id"]}
    client = TestClient(app)
    client.switch = lambda uid: state.update(id=uid)
    return client


def _create(client, name="Shortlist", **extra):
    r = client.post("/api/career/collections", json={"name": name, **extra})
    assert r.status_code == 200, r.text
    return r.json()["data"]["data"]


def test_requires_auth(fake):
    app = FastAPI()
    app.include_router(cr.router)
    c = TestClient(app)
    assert c.get("/api/career/collections").status_code in (401, 403)
    assert c.post("/api/career/collections", json={"name": "x"}).status_code in (401, 403)


def test_create_list_rename_delete(fake, as_user):
    col = _create(as_user, "  My   list ")
    assert col["name"] == "My list" and col["kind"] == "custom" and col["itemCount"] == 0
    listed = as_user.get("/api/career/collections").json()["data"]
    assert listed["status"] == "real" and [c["name"] for c in listed["data"]] == ["My list"]
    r = as_user.patch(f"/api/career/collections/{col['id']}", json={"name": "Renamed"})
    assert r.json()["data"]["data"]["name"] == "Renamed"
    assert as_user.delete(f"/api/career/collections/{col['id']}").json()["data"]["status"] == "real"
    assert as_user.get("/api/career/collections").json()["data"]["data"] == []


def test_name_validation_and_duplicates(fake, as_user):
    assert as_user.post("/api/career/collections", json={"name": "   "}).status_code == 400
    assert as_user.post("/api/career/collections", json={"name": "x" * 61}).status_code == 400
    assert as_user.post("/api/career/collections", json={"name": "a\x00b"}).status_code == 400
    _create(as_user, "Ideas")
    assert as_user.post("/api/career/collections", json={"name": "ideas"}).status_code == 409
    other = _create(as_user, "Other")
    assert as_user.patch(f"/api/career/collections/{other['id']}", json={"name": "IDEAS"}).status_code == 409


def test_starters_are_suggestions_not_auto_created(fake, as_user):
    starters = as_user.get("/api/career/collections/starters").json()["data"]["data"]
    assert [s["name"] for s in starters] == [
        "My university options", "Career ideas", "Skills to learn", "My projects"]
    assert fake.tables["collections"] == []  # nothing created by suggesting
    col = _create(as_user, "My university options", starterKey="university_options")
    assert col["kind"] == "starter" and col["starterKey"] == "university_options"
    again = as_user.post("/api/career/collections", json={"name": "Different", "starterKey": "university_options"})
    assert again.status_code == 409
    assert as_user.post("/api/career/collections", json={"name": "x", "starterKey": "bogus"}).status_code == 400
    starters = as_user.get("/api/career/collections/starters").json()["data"]["data"]
    assert starters[0]["created"] is True and starters[1]["created"] is False


def test_add_resolve_and_item_in_several_collections(fake, as_user):
    _saved(fake, "s1", ME, "BSc Sociology")
    a, b = _create(as_user, "A"), _create(as_user, "B")
    for col in (a, b):
        r = as_user.post(f"/api/career/collections/{col['id']}/items", json={"savedItemIds": ["s1"]})
        assert r.json()["data"]["data"] == {"added": 1, "alreadyPresent": 0}
    again = as_user.post(f"/api/career/collections/{a['id']}/items", json={"savedItemIds": ["s1"]})
    assert again.json()["data"]["data"] == {"added": 0, "alreadyPresent": 1}
    items = as_user.get(f"/api/career/collections/{a['id']}/items").json()["data"]["data"]
    assert len(items) == 1 and items[0]["label"] == "BSc Sociology" and items[0]["entityType"] == "programme"
    assert len(fake.tables["saved_items"]) == 1  # canonical record not duplicated
    counts = {c["name"]: c["itemCount"] for c in as_user.get("/api/career/collections").json()["data"]["data"]}
    assert counts == {"A": 1, "B": 1}


def test_remove_and_delete_never_delete_saved_items(fake, as_user):
    _saved(fake, "s1", ME)
    _saved(fake, "s2", ME)
    a = _create(as_user, "A")
    as_user.post(f"/api/career/collections/{a['id']}/items", json={"savedItemIds": ["s1", "s2"]})
    as_user.delete(f"/api/career/collections/{a['id']}/items/s1")
    assert {r["id"] for r in fake.tables["saved_items"]} == {"s1", "s2"}
    assert [l["saved_item_id"] for l in fake.tables["collection_items"]] == ["s2"]
    as_user.delete(f"/api/career/collections/{a['id']}")
    assert {r["id"] for r in fake.tables["saved_items"]} == {"s1", "s2"}
    assert fake.tables["collection_items"] == [] and fake.tables["collections"] == []


def test_move_item(fake, as_user):
    _saved(fake, "s1", ME)
    a, b = _create(as_user, "A"), _create(as_user, "B")
    as_user.post(f"/api/career/collections/{a['id']}/items", json={"savedItemIds": ["s1"]})
    r = as_user.post(f"/api/career/collections/{a['id']}/items/s1/move", json={"toCollectionId": b["id"]})
    assert r.json()["data"]["data"] == {"moved": True}
    assert as_user.get(f"/api/career/collections/{a['id']}/items").json()["data"]["data"] == []
    assert len(as_user.get(f"/api/career/collections/{b['id']}/items").json()["data"]["data"]) == 1
    assert as_user.post(f"/api/career/collections/{b['id']}/items/s1/move", json={"toCollectionId": b["id"]}).status_code == 400
    assert as_user.post(f"/api/career/collections/{a['id']}/items/s1/move", json={"toCollectionId": b["id"]}).status_code == 404


class TestCrossUserAccessDenied:
    def _setup(self, fake, as_user):
        _saved(fake, "mine", ME)
        _saved(fake, "theirs", OTHER)
        col = _create(as_user, "Mine")
        as_user.post(f"/api/career/collections/{col['id']}/items", json={"savedItemIds": ["mine"]})
        as_user.switch(OTHER)
        theirs = _create(as_user, "Theirs")
        as_user.post(f"/api/career/collections/{theirs['id']}/items", json={"savedItemIds": ["theirs"]})
        return col, theirs

    def test_other_user_cannot_see_or_change_my_collection(self, fake, as_user):
        col, _ = self._setup(fake, as_user)  # now acting as OTHER
        cid = col["id"]
        assert as_user.get(f"/api/career/collections/{cid}/items").status_code == 404
        assert as_user.patch(f"/api/career/collections/{cid}", json={"name": "Hacked"}).status_code == 404
        assert as_user.delete(f"/api/career/collections/{cid}").status_code == 404
        assert as_user.delete(f"/api/career/collections/{cid}/items/mine").status_code == 404
        assert as_user.post(f"/api/career/collections/{cid}/items", json={"savedItemIds": ["theirs"]}).status_code == 404
        listed = as_user.get("/api/career/collections").json()["data"]["data"]
        assert [c["name"] for c in listed] == ["Theirs"]
        # My data is untouched.
        assert any(c["name"] == "Mine" for c in fake.tables["collections"])
        assert any(l["saved_item_id"] == "mine" for l in fake.tables["collection_items"])

    def test_cannot_add_someone_elses_saved_item_to_my_collection(self, fake, as_user):
        self._setup(fake, as_user)
        as_user.switch(ME)
        col = fake.tables["collections"][0]
        r = as_user.post(f"/api/career/collections/{col['id']}/items", json={"savedItemIds": ["mine", "theirs"]})
        assert r.status_code == 404
        assert [l["saved_item_id"] for l in fake.tables["collection_items"] if l["collection_id"] == col["id"]] == ["mine"]

    def test_cannot_move_into_someone_elses_collection(self, fake, as_user):
        col, theirs = self._setup(fake, as_user)
        as_user.switch(ME)
        r = as_user.post(f"/api/career/collections/{col['id']}/items/mine/move", json={"toCollectionId": theirs["id"]})
        assert r.status_code == 404
        assert any(l["saved_item_id"] == "mine" and l["collection_id"] == col["id"] for l in fake.tables["collection_items"])


def test_limits(fake, as_user, monkeypatch):
    monkeypatch.setattr(cr, "MAX_COLLECTIONS_PER_USER", 1)
    _create(as_user, "One")
    assert as_user.post("/api/career/collections", json={"name": "Two"}).status_code == 400
    assert as_user.post("/api/career/collections/x/items", json={"savedItemIds": []}).status_code == 400


def test_unsupported_when_tables_missing(monkeypatch, as_user):
    monkeypatch.setattr(cr, "db", FakeDB(tables=("saved_items",)))
    for method, path, body in [
        ("get", "/api/career/collections", None),
        ("get", "/api/career/collections/starters", None),
        ("post", "/api/career/collections", {"name": "Anything"}),
        ("get", "/api/career/collections/abc/items", None),
    ]:
        r = getattr(as_user, method)(path, **({"json": body} if body else {}))
        assert r.status_code == 200, (path, r.text)
        data = r.json()["data"]
        assert data["status"] == "coming_soon" and data["data"] is None
        assert data["meta"]["notice"] == cr.UNSUPPORTED_NOTICE


def test_other_errors_are_not_reported_as_unsupported(monkeypatch, as_user):
    class Boom(FakeDB):
        def table(self, name):
            raise RuntimeError("connection reset")
    monkeypatch.setattr(cr, "db", Boom())
    r = as_user.get("/api/career/collections")
    assert r.status_code == 200 and r.json()["success"] is False
    assert "reset" not in r.text


def test_purge_user_collections_only_touches_that_user(fake, as_user):
    _saved(fake, "s1", ME)
    _saved(fake, "s2", OTHER)
    mine = _create(as_user, "Mine")
    as_user.post(f"/api/career/collections/{mine['id']}/items", json={"savedItemIds": ["s1"]})
    as_user.switch(OTHER)
    theirs = _create(as_user, "Theirs")
    as_user.post(f"/api/career/collections/{theirs['id']}/items", json={"savedItemIds": ["s2"]})
    cr.purge_user_collections(ME)
    assert [c["name"] for c in fake.tables["collections"]] == ["Theirs"]
    assert [l["saved_item_id"] for l in fake.tables["collection_items"]] == ["s2"]
    assert len(fake.tables["saved_items"]) == 2


def test_purge_swallows_missing_tables(monkeypatch):
    monkeypatch.setattr(cr, "db", FakeDB(tables=()))
    cr.purge_user_collections(ME)  # must not raise

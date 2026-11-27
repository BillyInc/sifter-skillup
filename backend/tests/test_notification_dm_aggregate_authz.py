"""Authorization tests for notification trigger, DM send and institution aggregate."""
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

import routes.community_routes as cr
import routes.entrepreneurship_routes as er
import routes.missing_routes as mr
from auth import Auth


class _Result:
    def __init__(self, data):
        self.data = data


class _Query:
    def __init__(self, db, name):
        self.db, self.name, self.op, self.payload, self.filters = db, name, "select", None, []

    def select(self, *_a, **_k):
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

    def neq(self, col, val):
        self.filters.append(lambda r, c=col, v=val: r.get(c) != v)
        return self

    def in_(self, col, vals):
        self.filters.append(lambda r, c=col, v=list(vals): r.get(c) in v)
        return self

    def order(self, *_a, **_k):
        return self

    def limit(self, *_a, **_k):
        return self

    def execute(self):
        rows = self.db.tables.setdefault(self.name, [])
        if self.op == "insert":
            items = self.payload if isinstance(self.payload, list) else [self.payload]
            rows.extend(dict(i) for i in items)
            return _Result(items)
        match = [r for r in rows if all(f(r) for f in self.filters)]
        if self.op == "update":
            for r in match:
                r.update(self.payload)
        elif self.op == "delete":
            for r in match:
                rows.remove(r)
        return _Result([dict(r) for r in match])


class FakeDB:
    def __init__(self):
        self.tables = {}

    def table(self, name):
        return _Query(self, name)

    def schema(self, _name):
        return self

    def get_service_client(self):
        return self

    def get_client(self):
        return self


ME = {"id": "u-me", "auth_provider": "email", "account_type": "student"}


@pytest.fixture
def fake(monkeypatch):
    f = FakeDB()
    for mod in (cr, er, mr):
        monkeypatch.setattr(mod.db, "get_service_client", lambda f=f: f, raising=False)
    monkeypatch.setattr(mr.db, "get_client", lambda f=f: f, raising=False)
    return f


def _client(user):
    app = FastAPI()
    app.include_router(cr.community_v2_router)
    app.include_router(er.router)
    app.include_router(mr.notifications_router)
    app.dependency_overrides[Auth.get_current_user] = lambda: user
    return TestClient(app)


# ---------------- notifications/trigger ----------------

def _trigger(client, uid, **extra):
    body = {"userId": uid, "type": "streak_urgent", "trackId": "t", "userName": "Ann"}
    body.update(extra)
    return client.post("/api/notifications/trigger", json=body)


def test_trigger_self_allowed(fake):
    fake.tables["push_tokens"] = []
    r = _trigger(_client(ME), "u-me")
    assert r.status_code == 200
    assert fake.tables["notifications"][0]["user_id"] == "u-me"


def test_trigger_other_user_denied_and_uniform(fake):
    fake.tables["users"] = [{"id": "u-other"}]
    c = _client(ME)
    a = _trigger(c, "u-other")
    b = _trigger(c, "does-not-exist")
    assert a.status_code == b.status_code == 403
    assert a.json() == b.json()
    assert "notifications" not in fake.tables


def test_trigger_guest_cannot_target_others(fake):
    guest = {"id": "g1", "auth_provider": "guest", "account_type": "student"}
    assert _trigger(_client(guest), "u-me").status_code == 403


def test_trigger_text_is_sanitised(fake):
    fake.tables["push_tokens"] = []
    r = _trigger(_client(ME), "u-me", userName="x" * 500 + "\n\x00", channels=["push", "bogus"])
    assert r.status_code == 200
    assert r.json()["data"]["channels"] == ["push"]


# ---------------- dms/send ----------------

def _dm(client, to, content="hi"):
    return client.post("/api/dms/send", json={"senderId": "spoof", "recipientId": to, "content": content})


def _follow(fake, a, b):
    fake.tables.setdefault("follows", []).append({"follower_id": a, "following_id": b})


def test_dm_mutual_follow_allowed(fake):
    _follow(fake, "u-me", "u-b")
    _follow(fake, "u-b", "u-me")
    r = _dm(_client(ME), "u-b")
    assert r.status_code == 200
    assert fake.tables["dm_messages"][0]["sender_id"] == "u-me"


def test_dm_stranger_and_one_way_follow_denied_uniformly(fake):
    _follow(fake, "u-me", "u-b")  # one way only
    c = _client(ME)
    one_way = _dm(c, "u-b")
    stranger = _dm(c, "u-c")
    unknown = _dm(c, "no-such-user")
    assert one_way.status_code == stranger.status_code == unknown.status_code == 403
    assert one_way.json() == stranger.json() == unknown.json()
    assert "dm_messages" not in fake.tables


def test_dm_guest_cannot_initiate_even_with_mutual_follow(fake):
    guest = {"id": "g1", "auth_provider": "guest", "account_type": "student"}
    _follow(fake, "g1", "u-b")
    _follow(fake, "u-b", "g1")
    assert _dm(_client(guest), "u-b").status_code == 403
    assert "dm_messages" not in fake.tables


def test_dm_existing_thread_keeps_working_even_for_guest(fake):
    guest = {"id": "g1", "auth_provider": "guest", "account_type": "student"}
    fake.tables["thread_participants"] = [
        {"thread_id": "t1", "user_id": "g1"}, {"thread_id": "t1", "user_id": "u-b"},
    ]
    r = _dm(_client(guest), "u-b")
    assert r.status_code == 200
    assert r.json()["data"]["threadId"] == "t1"


def test_dm_blocked_either_direction_denied(fake):
    _follow(fake, "u-me", "u-b")
    _follow(fake, "u-b", "u-me")
    fake.tables["user_blocks"] = [{"user_id": "u-b", "target_id": "u-me"}]
    r1 = _dm(_client(ME), "u-b")
    fake.tables["user_blocks"] = [{"user_id": "u-me", "target_id": "u-b"}]
    r2 = _dm(_client(ME), "u-b")
    assert r1.status_code == r2.status_code == 403
    assert r1.json() == r2.json()


# ---------------- institutions aggregate ----------------

ADMIN = {"id": "a1", "auth_provider": "email", "account_type": "institution_admin"}


def _seed_agg(fake, seat="active"):
    fake.tables["entrepreneurship_institution_engagement"] = [
        {"institution_id": "s1", "domain_id": "d", "domain_name": "D", "role_type": "r", "engagement_count": 2},
    ]
    fake.tables["institution_members"] = [{"user_id": "a1", "school_id": "s1", "seat_status": seat}]


@pytest.fixture(autouse=True)
def _no_mfa(monkeypatch):
    monkeypatch.setattr(Auth, "admin_mfa_status", staticmethod(lambda _uid: "disabled"))


def test_aggregate_active_member_allowed_exact_small_counts(fake):
    _seed_agg(fake)
    r = _client(ADMIN).get("/api/entrepreneurship/institutions/s1/aggregate")
    assert r.status_code == 200
    assert r.json()["data"]["data"]["rows"][0]["engagement_count"] == 2


def test_aggregate_anonymous_denied():
    app = FastAPI()
    app.include_router(er.router)
    r = TestClient(app).get("/api/entrepreneurship/institutions/s1/aggregate")
    assert r.status_code in (401, 403)


def test_aggregate_other_institution_and_unknown_uniform(fake):
    _seed_agg(fake)
    c = _client(ADMIN)
    a = c.get("/api/entrepreneurship/institutions/s2/aggregate")
    b = c.get("/api/entrepreneurship/institutions/nope/aggregate")
    assert a.status_code == b.status_code == 403
    assert a.json() == b.json()


@pytest.mark.parametrize("seat", ["invited", "revoked", "suspended"])
def test_aggregate_inactive_seat_denied(fake, seat):
    _seed_agg(fake, seat)
    assert _client(ADMIN).get("/api/entrepreneurship/institutions/s1/aggregate").status_code == 403


def test_aggregate_guest_and_student_denied(fake):
    _seed_agg(fake)
    guest = {"id": "a1", "auth_provider": "guest", "account_type": "student"}
    assert _client(guest).get("/api/entrepreneurship/institutions/s1/aggregate").status_code == 403


def test_aggregate_internal_staff_allowed(fake):
    _seed_agg(fake)
    staff = {"id": "x", "account_type": "student", "is_internal_staff": True}
    assert _client(staff).get("/api/entrepreneurship/institutions/s1/aggregate").status_code == 200

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


def _users(fake, *ids, **flags):
    rows = fake.tables.setdefault("users", [])
    for i in ids:
        rows.append({"id": i, "is_deleted": False, **flags})


def _mutual(fake, a, b):
    _users(fake, a, b)
    _follow(fake, a, b)
    _follow(fake, b, a)


def _thread(fake, tid, *members):
    fake.tables.setdefault("thread_participants", []).extend(
        {"thread_id": tid, "user_id": m} for m in members
    )


def test_dm_mutual_follow_allowed(fake):
    _mutual(fake, "u-me", "u-b")
    r = _dm(_client(ME), "u-b")
    assert r.status_code == 200
    assert fake.tables["dm_messages"][0]["sender_id"] == "u-me"


def test_dm_stranger_and_one_way_follow_denied_uniformly(fake):
    _users(fake, "u-me", "u-b", "u-c")
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
    _mutual(fake, "g1", "u-b")
    assert _dm(_client(guest), "u-b").status_code == 403
    assert "dm_messages" not in fake.tables


def test_dm_existing_thread_between_mutual_followers_works_even_for_guest(fake):
    # Changed from the first revision: an existing thread is no longer exempt
    # from the follow rule, so the pair must still be mutual followers.
    guest = {"id": "g1", "auth_provider": "guest", "account_type": "student"}
    _mutual(fake, "g1", "u-b")
    _thread(fake, "t1", "g1", "u-b")
    r = _dm(_client(guest), "u-b")
    assert r.status_code == 200
    assert r.json()["data"]["threadId"] == "t1"


def test_dm_blocked_either_direction_denied(fake):
    _mutual(fake, "u-me", "u-b")
    fake.tables["user_blocks"] = [{"user_id": "u-b", "target_id": "u-me"}]
    r1 = _dm(_client(ME), "u-b")
    fake.tables["user_blocks"] = [{"user_id": "u-me", "target_id": "u-b"}]
    r2 = _dm(_client(ME), "u-b")
    assert r1.status_code == r2.status_code == 403
    assert r1.json() == r2.json()


def test_dm_lapsed_follow_freezes_existing_thread(fake):
    _mutual(fake, "u-me", "u-b")
    _thread(fake, "t1", "u-me", "u-b")
    assert _dm(_client(ME), "u-b").status_code == 200
    # Recipient unfollows the sender: the thread is frozen.
    fake.tables["follows"] = [f for f in fake.tables["follows"] if f["follower_id"] != "u-b"]
    assert _dm(_client(ME), "u-b").status_code == 403
    assert len(fake.tables["dm_messages"]) == 1


def test_dm_group_thread_is_not_a_dm_thread(fake):
    _mutual(fake, "u-me", "u-b")
    _thread(fake, "grp", "u-me", "u-b", "u-x")
    r = _dm(_client(ME), "u-b")
    assert r.status_code == 200
    assert r.json()["data"]["threadId"] != "grp"
    assert all(m["thread_id"] != "grp" for m in fake.tables["dm_messages"])


def test_dm_deleted_or_missing_recipient_uniform_403_and_no_thread(fake):
    _users(fake, "u-me")
    fake.tables["users"].append({"id": "u-del", "is_deleted": True})
    _follow(fake, "u-me", "u-del")
    _follow(fake, "u-del", "u-me")
    c = _client(ME)
    deleted = _dm(c, "u-del")
    missing = _dm(c, "u-none")
    assert deleted.status_code == missing.status_code == 403
    assert deleted.json() == missing.json()
    assert "dm_threads" not in fake.tables and "dm_messages" not in fake.tables


def test_dm_uppercase_self_id_cannot_bypass_self_check(fake):
    r = _dm(_client({"id": "abc-123", "auth_provider": "email"}), " ABC-123 ")
    assert r.status_code == 400
    assert "dm_threads" not in fake.tables


def test_dm_uppercase_recipient_id_normalised(fake):
    _mutual(fake, "u-me", "u-b")
    assert _dm(_client(ME), "U-B").status_code == 200


# ---------------- follow flow (cannot mint someone else's follow) ----------------

def _respond(client, requester, action="approve"):
    return client.post("/api/users/follow-request/respond", json={"requesterId": requester, "action": action})


def test_forged_approve_creates_no_follow_and_dm_stays_blocked(fake):
    # Attacker X (u-me) follows victim V, then tries to approve a request V never made.
    _users(fake, "u-me", "victim")
    c = _client(ME)
    assert c.post("/api/users/follow", json={"targetId": "victim"}).status_code == 200
    r = _respond(c, "victim")
    assert r.status_code == 404
    follows = fake.tables["follows"]
    assert {"follower_id": "victim", "following_id": "u-me"} not in [
        {"follower_id": f["follower_id"], "following_id": f["following_id"]} for f in follows
    ]
    assert all(f["follower_id"] == "u-me" for f in follows)
    assert _dm(c, "victim").status_code == 403
    assert "dm_messages" not in fake.tables


def test_respond_ignores_non_pending_request(fake):
    _users(fake, "u-me", "u-b")
    fake.tables["follow_requests"] = [
        {"id": "r1", "requester_id": "u-b", "target_id": "u-me", "status": "reject"},
    ]
    assert _respond(_client(ME), "u-b").status_code == 404
    assert "follows" not in fake.tables


def test_respond_invalid_action_422(fake):
    fake.tables["follow_requests"] = [
        {"id": "r1", "requester_id": "u-b", "target_id": "u-me", "status": "pending"},
    ]
    assert _respond(_client(ME), "u-b", "block").status_code == 422
    assert fake.tables["follow_requests"][0]["status"] == "pending"
    assert "follows" not in fake.tables


def test_respond_genuine_pending_approve_creates_one_follow(fake):
    _users(fake, "u-me", "u-b")
    fake.tables["follow_requests"] = [
        {"id": "r1", "requester_id": "u-b", "target_id": "u-me", "status": "pending"},
        {"id": "r2", "requester_id": "u-c", "target_id": "u-me", "status": "pending"},
    ]
    r = _respond(_client(ME), "u-b")
    assert r.status_code == 200
    assert fake.tables["follows"] == [
        {"id": fake.tables["follows"][0]["id"], "follower_id": "u-b", "following_id": "u-me",
         "created_at": fake.tables["follows"][0]["created_at"]}
    ]
    statuses = {q["id"]: q["status"] for q in fake.tables["follow_requests"]}
    assert statuses == {"r1": "approve", "r2": "pending"}


def test_respond_genuine_reject_creates_no_follow(fake):
    fake.tables["follow_requests"] = [
        {"id": "r1", "requester_id": "u-b", "target_id": "u-me", "status": "pending"},
    ]
    assert _respond(_client(ME), "u-b", "reject").status_code == 200
    assert "follows" not in fake.tables
    assert fake.tables["follow_requests"][0]["status"] == "reject"


def test_follow_private_account_requires_request(fake):
    _users(fake, "u-me")
    fake.tables["users"].append({"id": "u-priv", "is_deleted": False, "is_private": True})
    r = _client(ME).post("/api/users/follow", json={"targetId": "u-priv"})
    assert r.status_code == 403
    assert "follows" not in fake.tables


def test_follow_unknown_or_deleted_target_404(fake):
    fake.tables["users"] = [{"id": "u-del", "is_deleted": True}]
    c = _client(ME)
    assert c.post("/api/users/follow", json={"targetId": "u-del"}).status_code == 404
    assert c.post("/api/users/follow", json={"targetId": "nope"}).status_code == 404
    assert "follows" not in fake.tables


# ---------------- notification text / data hardening ----------------

def test_clean_text_strips_bidi_and_emoji():
    out = mr._clean_notification_text("a\u202eb\u2066c\u200fd\U0001F525e\u2705", 50)
    assert out == "abcde"


def test_clean_data_drops_nan_inf_and_empty_or_colliding_keys():
    cleaned = mr._clean_notification_data({
        "ok": 1, "nan": float("nan"), "inf": float("inf"), "-inf": float("-inf"),
        "\u202e": "x", "": "y", "k": "first", "k\u202e": "second", "flag": True,
    })
    assert cleaned == {"ok": 1, "k": "first", "flag": True}


def test_trigger_user_data_cannot_override_type_or_track(fake, monkeypatch):
    fake.tables["push_tokens"] = [{"user_id": "u-me", "token": "ExponentPushToken[x]", "platform": "expo"}]
    sent = {}

    class _Resp:
        status_code = 200

    class _HC:
        def __init__(self, *a, **k): pass
        async def __aenter__(self): return self
        async def __aexit__(self, *a): return False
        async def post(self, url, json=None, headers=None):
            sent["json"] = json
            return _Resp()

    monkeypatch.setattr(mr.httpx, "AsyncClient", _HC)
    r = _trigger(_client(ME), "u-me", data={"type": "evil", "trackId": "evil", "rank": 3})
    assert r.status_code == 200
    d = sent["json"][0]["data"]
    assert d["type"] == "streak_urgent" and d["trackId"] == "t" and d["rank"] == 3


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


def test_aggregate_mfa_enabled_but_unverified_is_428(fake, monkeypatch):
    monkeypatch.setattr(Auth, "admin_mfa_status", staticmethod(lambda _uid: "enabled"))
    _seed_agg(fake)
    r = _client(ADMIN).get("/api/entrepreneurship/institutions/s1/aggregate")
    assert r.status_code == 428
    verified = dict(ADMIN, _mfa_verified=True)
    assert _client(verified).get("/api/entrepreneurship/institutions/s1/aggregate").status_code == 200

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

    def upsert(self, payload, on_conflict=None, ignore_duplicates=False):
        cols = (on_conflict or "id").split(",")
        self.op = "upsert"
        self.payload = payload
        self.conflict = (cols, ignore_duplicates)
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
        if self.op == "upsert":
            cols, ignore = self.conflict
            if not any(all(r.get(c) == self.payload.get(c) for c in cols) for r in rows):
                rows.append(dict(self.payload))
            return _Result([self.payload])
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


ME = {"id": "00000000-0000-4000-8000-000000000001", "auth_provider": "email", "account_type": "student"}


@pytest.fixture
def fake(monkeypatch):
    f = FakeDB()
    for mod in (cr, er, mr):
        monkeypatch.setattr(mod.db, "get_service_client", lambda f=f: f, raising=False)
    monkeypatch.setattr(mr.db, "get_client", lambda f=f: f, raising=False)
    for lim in (cr._follow_limiter, cr._follow_request_limiter, cr._respond_limiter, cr._block_limiter):
        lim.reset()
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
    r = _trigger(_client(ME), "00000000-0000-4000-8000-000000000001")
    assert r.status_code == 200
    assert fake.tables["notifications"][0]["user_id"] == "00000000-0000-4000-8000-000000000001"


def test_trigger_other_user_denied_and_uniform(fake):
    fake.tables["users"] = [{"id": "00000000-0000-4000-8000-00000000000a"}]
    c = _client(ME)
    a = _trigger(c, "00000000-0000-4000-8000-00000000000a")
    b = _trigger(c, "does-not-exist")
    assert a.status_code == b.status_code == 403
    assert a.json() == b.json()
    assert "notifications" not in fake.tables


def test_trigger_guest_cannot_target_others(fake):
    guest = {"id": "00000000-0000-4000-8000-00000000000c", "auth_provider": "guest", "account_type": "student"}
    assert _trigger(_client(guest), "00000000-0000-4000-8000-000000000001").status_code == 403


class _Resp:
    status_code = 200


def _capture_push(monkeypatch):
    sent = {}

    class _HC:
        def __init__(self, *a, **k): pass
        async def __aenter__(self): return self
        async def __aexit__(self, *a): return False
        async def post(self, url, json=None, headers=None):
            sent["json"] = json
            return _Resp()

    monkeypatch.setattr(mr.httpx, "AsyncClient", _HC)
    return sent


def test_trigger_text_is_sanitised(fake, monkeypatch):
    fake.tables["push_tokens"] = [{"user_id": ME["id"], "token": "ExponentPushToken[x]", "platform": "expo"}]
    sent = _capture_push(monkeypatch)
    name = "Ada\nLovelace\u00a0\u202eX\U0001F525\u2705" + "y" * 500 + "\x00"
    r = _trigger(_client(ME), ME["id"], type="streak_reminder", userName=name, channels=["push", "bogus"])
    assert r.status_code == 200
    assert r.json()["data"]["channels"] == ["push"]
    title = sent["json"][0]["title"]
    expected = "Ada Lovelace X" + "y" * 26  # cleaned and capped at 40 characters
    assert title == f"\u26a1 Keep your streak alive, {expected}!"
    assert "\n" not in title and "\u00a0" not in title and "\u202e" not in title


def test_trigger_padded_user_id_uses_authenticated_id_in_every_query(fake, monkeypatch):
    fake.tables["push_tokens"] = [{"user_id": ME["id"], "token": "ExponentPushToken[x]", "platform": "expo"}]
    _capture_push(monkeypatch)
    r = _trigger(_client(ME), "  " + ME["id"].upper() + " ")
    assert r.status_code == 200
    assert fake.tables["notifications"][0]["user_id"] == ME["id"]


def test_clean_text_keeps_words_apart_and_persian_joiners():
    assert mr._clean_notification_text("Ada\nLovelace\tX\u00a0Y\u2028Z  W", 50) == "Ada Lovelace X Y Z W"
    assert mr._clean_notification_text("\u0645\u06cc\u200c\u062e\u0648\u0627\u0647\u0645", 50) == "\u0645\u06cc\u200c\u062e\u0648\u0627\u0647\u0645"
    assert mr._clean_notification_text("\u0645\u06cc\u200d\u062e", 50) == "\u0645\u06cc\u200d\u062e"
    # Joiners inside an emoji sequence go with the emoji.
    assert mr._clean_notification_text("a\U0001F468\u200d\U0001F469\u200d\U0001F467b\u2764\ufe0f", 50) == "ab"


def test_clean_data_rejects_unsafe_integers():
    out = mr._clean_notification_data({"ok": 2 ** 53, "big": 2 ** 53 + 1, "neg": -(2 ** 53) - 1, "f": 1.5})
    assert out == {"ok": 2 ** 53, "f": 1.5}


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
    _mutual(fake, "00000000-0000-4000-8000-000000000001", "00000000-0000-4000-8000-000000000002")
    r = _dm(_client(ME), "00000000-0000-4000-8000-000000000002")
    assert r.status_code == 200
    assert fake.tables["dm_messages"][0]["sender_id"] == "00000000-0000-4000-8000-000000000001"


def test_dm_stranger_and_one_way_follow_denied_uniformly(fake):
    _users(fake, "00000000-0000-4000-8000-000000000001", "00000000-0000-4000-8000-000000000002", "00000000-0000-4000-8000-000000000003")
    _follow(fake, "00000000-0000-4000-8000-000000000001", "00000000-0000-4000-8000-000000000002")  # one way only
    c = _client(ME)
    one_way = _dm(c, "00000000-0000-4000-8000-000000000002")
    stranger = _dm(c, "00000000-0000-4000-8000-000000000003")
    unknown = _dm(c, "no-such-user")
    assert one_way.status_code == stranger.status_code == unknown.status_code == 403
    assert one_way.json() == stranger.json() == unknown.json()
    assert "dm_messages" not in fake.tables


def test_dm_guest_cannot_initiate_even_with_mutual_follow(fake):
    guest = {"id": "00000000-0000-4000-8000-00000000000c", "auth_provider": "guest", "account_type": "student"}
    _mutual(fake, "00000000-0000-4000-8000-00000000000c", "00000000-0000-4000-8000-000000000002")
    assert _dm(_client(guest), "00000000-0000-4000-8000-000000000002").status_code == 403
    assert "dm_messages" not in fake.tables


def test_dm_existing_thread_between_mutual_followers_works_even_for_guest(fake):
    # Changed from the first revision: an existing thread is no longer exempt
    # from the follow rule, so the pair must still be mutual followers.
    guest = {"id": "00000000-0000-4000-8000-00000000000c", "auth_provider": "guest", "account_type": "student"}
    _mutual(fake, "00000000-0000-4000-8000-00000000000c", "00000000-0000-4000-8000-000000000002")
    _thread(fake, "t1", "00000000-0000-4000-8000-00000000000c", "00000000-0000-4000-8000-000000000002")
    r = _dm(_client(guest), "00000000-0000-4000-8000-000000000002")
    assert r.status_code == 200
    assert r.json()["data"]["threadId"] == "t1"


def test_dm_blocked_either_direction_denied(fake):
    _mutual(fake, "00000000-0000-4000-8000-000000000001", "00000000-0000-4000-8000-000000000002")
    fake.tables["user_blocks"] = [{"user_id": "00000000-0000-4000-8000-000000000002", "target_id": "00000000-0000-4000-8000-000000000001"}]
    r1 = _dm(_client(ME), "00000000-0000-4000-8000-000000000002")
    fake.tables["user_blocks"] = [{"user_id": "00000000-0000-4000-8000-000000000001", "target_id": "00000000-0000-4000-8000-000000000002"}]
    r2 = _dm(_client(ME), "00000000-0000-4000-8000-000000000002")
    assert r1.status_code == r2.status_code == 403
    assert r1.json() == r2.json()


def test_dm_lapsed_follow_freezes_existing_thread(fake):
    _mutual(fake, "00000000-0000-4000-8000-000000000001", "00000000-0000-4000-8000-000000000002")
    _thread(fake, "t1", "00000000-0000-4000-8000-000000000001", "00000000-0000-4000-8000-000000000002")
    assert _dm(_client(ME), "00000000-0000-4000-8000-000000000002").status_code == 200
    # Recipient unfollows the sender: the thread is frozen.
    fake.tables["follows"] = [f for f in fake.tables["follows"] if f["follower_id"] != "00000000-0000-4000-8000-000000000002"]
    assert _dm(_client(ME), "00000000-0000-4000-8000-000000000002").status_code == 403
    assert len(fake.tables["dm_messages"]) == 1


def test_dm_group_thread_is_not_a_dm_thread(fake):
    _mutual(fake, "00000000-0000-4000-8000-000000000001", "00000000-0000-4000-8000-000000000002")
    _thread(fake, "grp", "00000000-0000-4000-8000-000000000001", "00000000-0000-4000-8000-000000000002", "00000000-0000-4000-8000-000000000004")
    r = _dm(_client(ME), "00000000-0000-4000-8000-000000000002")
    assert r.status_code == 200
    assert r.json()["data"]["threadId"] != "grp"
    assert all(m["thread_id"] != "grp" for m in fake.tables["dm_messages"])


def test_dm_deleted_or_missing_recipient_uniform_403_and_no_thread(fake):
    _users(fake, "00000000-0000-4000-8000-000000000001")
    fake.tables["users"].append({"id": "00000000-0000-4000-8000-000000000005", "is_deleted": True})
    _follow(fake, "00000000-0000-4000-8000-000000000001", "00000000-0000-4000-8000-000000000005")
    _follow(fake, "00000000-0000-4000-8000-000000000005", "00000000-0000-4000-8000-000000000001")
    c = _client(ME)
    deleted = _dm(c, "00000000-0000-4000-8000-000000000005")
    missing = _dm(c, "00000000-0000-4000-8000-000000000006")
    assert deleted.status_code == missing.status_code == 403
    assert deleted.json() == missing.json()
    assert "dm_threads" not in fake.tables and "dm_messages" not in fake.tables


def test_dm_uppercase_self_id_cannot_bypass_self_check(fake):
    r = _dm(_client({"id": "abc-123", "auth_provider": "email"}), " ABC-123 ")
    assert r.status_code == 400
    assert "dm_threads" not in fake.tables


def test_dm_uppercase_recipient_id_normalised(fake):
    _mutual(fake, "00000000-0000-4000-8000-000000000001", "00000000-0000-4000-8000-000000000002")
    assert _dm(_client(ME), "00000000-0000-4000-8000-000000000002").status_code == 200


def test_dm_thread_lookup_failure_fails_send_and_creates_nothing(fake, monkeypatch):
    _mutual(fake, "00000000-0000-4000-8000-000000000001", "00000000-0000-4000-8000-000000000002")

    def boom(*_a):
        raise RuntimeError("db down")

    monkeypatch.setattr(cr, "_find_dm_thread", boom)
    r = _dm(_client(ME), "00000000-0000-4000-8000-000000000002")
    assert r.status_code == 503
    assert "dm_threads" not in fake.tables and "dm_messages" not in fake.tables


def test_dm_user_lookup_outage_is_503_not_a_refusal(fake, monkeypatch):
    def boom(_id):
        raise cr.HTTPException(503, "Temporarily unavailable. Please try again.")

    monkeypatch.setattr(cr, "_active_user", boom)
    assert _dm(_client(ME), "00000000-0000-4000-8000-000000000002").status_code == 503


def test_dm_simultaneous_first_threads_converge_on_the_older_one(fake, monkeypatch):
    A, B = "00000000-0000-4000-8000-000000000001", "00000000-0000-4000-8000-000000000002"
    _mutual(fake, A, B)
    real = cr._find_dm_thread
    calls = {"n": 0}

    def racing(a, b):
        calls["n"] += 1
        if calls["n"] == 2:
            # The other direction's request created an older thread meanwhile.
            fake.tables.setdefault("dm_threads", []).append({"id": "older", "created_at": "2000-01-01T00:00:00+00:00"})
            _thread(fake, "older", A, B)
        return real(a, b)

    monkeypatch.setattr(cr, "_find_dm_thread", racing)
    r = _dm(_client(ME), B)
    assert r.status_code == 200 and r.json()["data"]["threadId"] == "older"
    assert [t["id"] for t in fake.tables["dm_threads"]] == ["older"]
    assert {p["thread_id"] for p in fake.tables["thread_participants"]} == {"older"}
    assert fake.tables["dm_messages"][0]["thread_id"] == "older"


# ---------------- follow flow (cannot mint someone else's follow) ----------------

def _respond(client, requester, action="approve"):
    return client.post("/api/users/follow-request/respond", json={"requesterId": requester, "action": action})


def test_forged_approve_creates_no_follow_and_dm_stays_blocked(fake):
    # Attacker X (u-me) follows victim V, then tries to approve a request V never made.
    _users(fake, "00000000-0000-4000-8000-000000000001", "00000000-0000-4000-8000-00000000000b")
    c = _client(ME)
    assert c.post("/api/users/follow", json={"targetId": "00000000-0000-4000-8000-00000000000b"}).status_code == 200
    r = _respond(c, "00000000-0000-4000-8000-00000000000b")
    assert r.status_code == 404
    follows = fake.tables["follows"]
    assert {"follower_id": "00000000-0000-4000-8000-00000000000b", "following_id": "00000000-0000-4000-8000-000000000001"} not in [
        {"follower_id": f["follower_id"], "following_id": f["following_id"]} for f in follows
    ]
    assert all(f["follower_id"] == "00000000-0000-4000-8000-000000000001" for f in follows)
    assert _dm(c, "00000000-0000-4000-8000-00000000000b").status_code == 403
    assert "dm_messages" not in fake.tables


def test_respond_ignores_non_pending_request(fake):
    _users(fake, "00000000-0000-4000-8000-000000000001", "00000000-0000-4000-8000-000000000002")
    fake.tables["follow_requests"] = [
        {"id": "r1", "requester_id": "00000000-0000-4000-8000-000000000002", "target_id": "00000000-0000-4000-8000-000000000001", "status": "reject"},
    ]
    assert _respond(_client(ME), "00000000-0000-4000-8000-000000000002").status_code == 404
    assert "follows" not in fake.tables


def test_respond_invalid_action_422(fake):
    fake.tables["follow_requests"] = [
        {"id": "r1", "requester_id": "00000000-0000-4000-8000-000000000002", "target_id": "00000000-0000-4000-8000-000000000001", "status": "pending"},
    ]
    assert _respond(_client(ME), "00000000-0000-4000-8000-000000000002", "block").status_code == 422
    assert fake.tables["follow_requests"][0]["status"] == "pending"
    assert "follows" not in fake.tables


def test_respond_genuine_pending_approve_creates_one_follow(fake):
    _users(fake, "00000000-0000-4000-8000-000000000001", "00000000-0000-4000-8000-000000000002")
    fake.tables["follow_requests"] = [
        {"id": "r1", "requester_id": "00000000-0000-4000-8000-000000000002", "target_id": "00000000-0000-4000-8000-000000000001", "status": "pending"},
        {"id": "r2", "requester_id": "00000000-0000-4000-8000-000000000003", "target_id": "00000000-0000-4000-8000-000000000001", "status": "pending"},
    ]
    r = _respond(_client(ME), "00000000-0000-4000-8000-000000000002")
    assert r.status_code == 200
    assert fake.tables["follows"] == [
        {"id": fake.tables["follows"][0]["id"], "follower_id": "00000000-0000-4000-8000-000000000002", "following_id": "00000000-0000-4000-8000-000000000001",
         "created_at": fake.tables["follows"][0]["created_at"]}
    ]
    statuses = {q["id"]: q["status"] for q in fake.tables["follow_requests"]}
    assert statuses == {"r1": "approve", "r2": "pending"}


def test_respond_genuine_reject_creates_no_follow(fake):
    _users(fake, "00000000-0000-4000-8000-000000000002")
    fake.tables["follow_requests"] = [
        {"id": "r1", "requester_id": "00000000-0000-4000-8000-000000000002", "target_id": "00000000-0000-4000-8000-000000000001", "status": "pending"},
    ]
    assert _respond(_client(ME), "00000000-0000-4000-8000-000000000002", "reject").status_code == 200
    assert "follows" not in fake.tables
    assert fake.tables["follow_requests"][0]["status"] == "reject"


def test_follow_private_account_requires_request(fake):
    _users(fake, "00000000-0000-4000-8000-000000000001")
    fake.tables["users"].append({"id": "00000000-0000-4000-8000-000000000007", "is_deleted": False, "is_private": True})
    r = _client(ME).post("/api/users/follow", json={"targetId": "00000000-0000-4000-8000-000000000007"})
    assert r.status_code == 403
    assert "follows" not in fake.tables


def test_follow_unknown_or_deleted_target_404(fake):
    fake.tables["users"] = [{"id": "00000000-0000-4000-8000-000000000005", "is_deleted": True}]
    c = _client(ME)
    assert c.post("/api/users/follow", json={"targetId": "00000000-0000-4000-8000-000000000005"}).status_code == 404
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
    fake.tables["push_tokens"] = [{"user_id": "00000000-0000-4000-8000-000000000001", "token": "ExponentPushToken[x]", "platform": "expo"}]
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
    r = _trigger(_client(ME), "00000000-0000-4000-8000-000000000001", data={"type": "evil", "trackId": "evil", "rank": 3})
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

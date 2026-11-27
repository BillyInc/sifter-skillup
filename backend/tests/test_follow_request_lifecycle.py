"""Follow / follow-request lifecycle: re-follow, re-request, blocks, concurrency."""
from datetime import datetime, timedelta, timezone

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

import routes.community_routes as cr
from auth import Auth


class _Result:
    def __init__(self, data):
        self.data = data


class _Query:
    def __init__(self, db, name):
        self.db, self.name, self.op, self.payload, self.filters = db, name, "select", None, []
        self.upsert_opts = {}

    def select(self, *_a, **_k):
        return self

    def insert(self, payload):
        self.op, self.payload = "insert", payload
        return self

    def upsert(self, payload, on_conflict=None, ignore_duplicates=False):
        self.op, self.payload = "upsert", payload
        self.upsert_opts = {"on_conflict": on_conflict, "ignore": ignore_duplicates}
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

    def gte(self, col, val):
        self.filters.append(lambda r, c=col, v=val: str(r.get(c, "")) >= v)
        return self

    def limit(self, *_a, **_k):
        return self

    def order(self, *_a, **_k):
        return self

    def execute(self):
        rows = self.db.tables.setdefault(self.name, [])
        if self.op == "insert":
            if self.name == "follows" and self._dup(rows):
                raise RuntimeError("duplicate key value violates unique constraint")
            rows.append(dict(self.payload))
            return _Result([self.payload])
        if self.op == "upsert":
            cols = (self.upsert_opts["on_conflict"] or "id").split(",")
            dup = any(all(r.get(c) == self.payload.get(c) for c in cols) for r in rows)
            if dup and not self.upsert_opts["ignore"]:
                raise RuntimeError("duplicate key value violates unique constraint")
            if not dup:
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

    def _dup(self, rows):
        return any(
            r["follower_id"] == self.payload["follower_id"]
            and r["following_id"] == self.payload["following_id"]
            for r in rows
        )


class FakeDB:
    def __init__(self):
        self.tables = {}
        self.after_pending_lookup = None

    def table(self, name):
        return _Query(self, name)

    def get_service_client(self):
        return self


ME = {"id": "00000000-0000-4000-8000-000000000001", "auth_provider": "email", "account_type": "student"}
PRIV = "00000000-0000-4000-8000-000000000007"


@pytest.fixture
def fake(monkeypatch):
    f = FakeDB()
    f.tables["users"] = [
        {"id": "00000000-0000-4000-8000-000000000001", "is_private": False, "is_deleted": False},
        {"id": "00000000-0000-4000-8000-000000000008", "is_private": False, "is_deleted": False},
        {"id": PRIV, "is_private": True, "is_deleted": False},
        {"id": "00000000-0000-4000-8000-000000000009", "is_private": False, "is_deleted": True},
    ]
    monkeypatch.setattr(cr.db, "get_service_client", lambda: f, raising=False)
    monkeypatch.setattr(cr, "_create_notification", lambda *a, **k: f.tables.setdefault("notes", []).append(a))
    for lim in _LIMITERS:
        lim.reset()
    return f


_LIMITERS = (cr._follow_limiter, cr._follow_request_limiter, cr._respond_limiter, cr._block_limiter)


def _ago(days):
    return (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()


def _client(user):
    app = FastAPI()
    app.include_router(cr.community_v2_router)
    app.dependency_overrides[Auth.get_current_user] = lambda: user
    return TestClient(app)


def _post(c, path, **body):
    return c.post(f"/api/users/{path}", json=body)


def _req_status(fake, requester, target):
    rows = [r for r in fake.tables.get("follow_requests", []) if r["requester_id"] == requester and r["target_id"] == target]
    assert len(rows) == 1
    return rows[0]["status"]


def _approve(fake, requester, target, action="approve"):
    return _client({"id": target, "auth_provider": "email", "account_type": "student"}).post(
        "/api/users/follow-request/respond", json={"requesterId": requester, "action": action})


def test_refollow_after_approval_and_unfollow_resets_request(fake):
    c = _client(ME)
    assert _post(c, "follow-request", targetId=PRIV).json()["data"]["status"] == "pending"
    assert _approve(fake, "00000000-0000-4000-8000-000000000001", PRIV).status_code == 200
    assert len(fake.tables["follows"]) == 1
    assert _post(c, "unfollow", targetId=PRIV).status_code == 200
    assert fake.tables["follows"] == []
    # Re-follow must still work after approve + unfollow (the decided row stays
    # but is reopened, and the target can approve it again).
    assert _req_status(fake, ME["id"], PRIV) == "approve"
    # Can request again and be approved again.
    assert _post(c, "follow-request", targetId=PRIV).json()["data"]["status"] == "pending"
    assert _approve(fake, "00000000-0000-4000-8000-000000000001", PRIV).status_code == 200
    assert len(fake.tables["follows"]) == 1


def test_stale_approved_row_without_follow_is_reopened_as_pending(fake):
    fake.tables["follow_requests"] = [
        {"id": "r1", "requester_id": "00000000-0000-4000-8000-000000000001", "target_id": PRIV, "status": "approve", "created_at": "old"}
    ]
    r = _post(_client(ME), "follow-request", targetId=PRIV)
    assert r.status_code == 200 and r.json()["data"]["status"] == "pending"
    assert _req_status(fake, "00000000-0000-4000-8000-000000000001", PRIV) == "pending"
    assert any(n[1:] == ("00000000-0000-4000-8000-000000000001", "follow_request") or n[-1] == "follow_request" for n in fake.tables["notes"])
    # And the owner can now approve it.
    assert _approve(fake, "00000000-0000-4000-8000-000000000001", PRIV).status_code == 200


def test_reject_holds_for_cooldown_without_reopening_or_notifying(fake):
    c = _client(ME)
    _post(c, "follow-request", targetId=PRIV)
    assert _approve(fake, ME["id"], PRIV, "reject").json()["data"]["status"] == "reject"
    notes = len(fake.tables["notes"])
    for _ in range(3):
        assert _post(c, "follow-request", targetId=PRIV).json()["data"]["status"] == "reject"
    assert _req_status(fake, ME["id"], PRIV) == "reject"
    assert len(fake.tables["notes"]) == notes
    # Nothing for the owner to see either.
    assert _client({"id": PRIV, "auth_provider": "email"}).get("/api/users/follow-requests").json()["data"] == []


def test_unfollow_does_not_clear_a_rejection(fake):
    c = _client(ME)
    _post(c, "follow-request", targetId=PRIV)
    _approve(fake, ME["id"], PRIV, "reject")
    assert _post(c, "unfollow", targetId=PRIV).status_code == 200
    assert _req_status(fake, ME["id"], PRIV) == "reject"
    assert _post(c, "follow-request", targetId=PRIV).json()["data"]["status"] == "reject"


def test_rerequest_after_reject_cooldown_reopens(fake):
    c = _client(ME)
    _post(c, "follow-request", targetId=PRIV)
    _approve(fake, ME["id"], PRIV, "reject")
    fake.tables["follow_requests"][0]["created_at"] = _ago(8)
    assert _post(c, "follow-request", targetId=PRIV).json()["data"]["status"] == "pending"
    assert _req_status(fake, ME["id"], PRIV) == "pending"
    # Still inside the cooldown at 6 days.
    fake.tables["follow_requests"][0].update(status="reject", created_at=_ago(6))
    assert _post(c, "follow-request", targetId=PRIV).json()["data"]["status"] == "reject"


def test_request_unfollow_request_notifies_once(fake, monkeypatch):
    # Real notification writer, so the de-duplication reads real history.
    monkeypatch.undo()
    monkeypatch.setattr(cr.db, "get_service_client", lambda: fake, raising=False)
    c = _client(ME)
    for _ in range(4):
        assert _post(c, "follow-request", targetId=PRIV).json()["data"]["status"] == "pending"
        assert _post(c, "unfollow", targetId=PRIV).status_code == 200
    sent = [n for n in fake.tables["notifications"] if n["type"] == "follow_request"]
    assert len(sent) == 1
    # Past the cooldown a fresh request may notify again.
    sent[0]["created_at"] = _ago(8)
    _post(c, "follow-request", targetId=PRIV)
    assert len([n for n in fake.tables["notifications"] if n["type"] == "follow_request"]) == 2


def test_notification_history_failure_sends_nothing(fake, monkeypatch):
    monkeypatch.setattr(cr, "_follow_request_recently_notified", cr._follow_request_recently_notified)
    real = fake.table

    def boom(name):
        if name == "notifications":
            raise RuntimeError("down")
        return real(name)

    monkeypatch.setattr(fake, "table", boom)
    r = _post(_client(ME), "follow-request", targetId=PRIV)
    assert r.json()["data"]["status"] == "pending"
    assert fake.tables.get("notes", []) == []


def test_existing_pending_request_is_not_renotified(fake):
    c = _client(ME)
    _post(c, "follow-request", targetId=PRIV)
    n = len(fake.tables["notes"])
    assert _post(c, "follow-request", targetId=PRIV).json()["data"]["status"] == "pending"
    assert len(fake.tables["notes"]) == n


def test_approved_and_still_following_returns_status_without_reopening(fake):
    c = _client(ME)
    _post(c, "follow-request", targetId=PRIV)
    _approve(fake, "00000000-0000-4000-8000-000000000001", PRIV)
    assert _post(c, "follow-request", targetId=PRIV).json()["data"]["status"] == "approve"
    assert _req_status(fake, "00000000-0000-4000-8000-000000000001", PRIV) == "approve"


def test_respond_still_requires_a_pending_row(fake):
    fake.tables["follow_requests"] = [
        {"id": "r1", "requester_id": "00000000-0000-4000-8000-000000000001", "target_id": PRIV, "status": "reject", "created_at": "old"}
    ]
    assert _approve(fake, "00000000-0000-4000-8000-000000000001", PRIV).status_code == 404
    assert _approve(fake, "00000000-0000-4000-8000-000000000008", PRIV).status_code == 404
    assert fake.tables.get("follows", []) == []


@pytest.mark.parametrize("blocker,blocked", [("00000000-0000-4000-8000-000000000001", PRIV), (PRIV, "00000000-0000-4000-8000-000000000001"), ("00000000-0000-4000-8000-000000000001", "00000000-0000-4000-8000-000000000008"), ("00000000-0000-4000-8000-000000000008", "00000000-0000-4000-8000-000000000001")])
def test_block_either_direction_refuses_follow_and_request(fake, blocker, blocked):
    fake.tables["user_blocks"] = [{"id": "b", "user_id": blocker, "target_id": blocked}]
    c = _client(ME)
    target = PRIV if PRIV in (blocker, blocked) else "00000000-0000-4000-8000-000000000008"
    a = _post(c, "follow", targetId=target)
    b = _post(c, "follow-request", targetId=target)
    missing = _post(c, "follow", targetId="00000000-0000-4000-8000-000000000009")
    missing2 = _post(c, "follow-request", targetId="00000000-0000-4000-8000-000000000009")
    assert a.status_code == b.status_code == 404
    assert a.json() == b.json() == missing.json() == missing2.json()
    assert fake.tables.get("follows", []) == []
    assert fake.tables.get("follow_requests", []) == []


def test_block_refuses_respond_even_with_pending_request(fake):
    _post(_client(ME), "follow-request", targetId=PRIV)
    fake.tables["user_blocks"] = [{"id": "b", "user_id": PRIV, "target_id": "00000000-0000-4000-8000-000000000001"}]
    assert _approve(fake, "00000000-0000-4000-8000-000000000001", PRIV).status_code == 404
    assert fake.tables.get("follows", []) == []
    assert _req_status(fake, "00000000-0000-4000-8000-000000000001", PRIV) == "pending"


def test_block_clears_follows_and_requests_both_directions(fake):
    fake.tables["follows"] = [
        {"follower_id": "00000000-0000-4000-8000-000000000001", "following_id": "00000000-0000-4000-8000-000000000008"}, {"follower_id": "00000000-0000-4000-8000-000000000008", "following_id": "00000000-0000-4000-8000-000000000001"}
    ]
    fake.tables["follow_requests"] = [
        {"id": "1", "requester_id": "00000000-0000-4000-8000-000000000001", "target_id": "00000000-0000-4000-8000-000000000008", "status": "approve"},
        {"id": "2", "requester_id": "00000000-0000-4000-8000-000000000008", "target_id": "00000000-0000-4000-8000-000000000001", "status": "pending"},
    ]
    assert _post(_client(ME), "block", targetId="00000000-0000-4000-8000-000000000008").status_code == 200
    assert fake.tables["follows"] == []
    assert fake.tables["follow_requests"] == []


def test_unknown_follow_targets_are_indistinguishable(fake):
    c = _client(ME)
    responses = [_post(c, p, targetId=t) for p in ("follow", "follow-request") for t in ("00000000-0000-4000-8000-000000000009", "nobody")]
    assert {r.status_code for r in responses} == {404}
    assert len({r.text for r in responses}) == 1


def test_private_follow_keeps_distinct_403(fake):
    assert _post(_client(ME), "follow", targetId=PRIV).status_code == 403


def test_concurrent_approve_does_not_500(fake, monkeypatch):
    _post(_client(ME), "follow-request", targetId=PRIV)
    orig = cr._blocked_either_way

    def racing(a, b):
        # A second approval lands its follow row after this request's checks began.
        out = orig(a, b)
        fake.tables.setdefault("follows", []).append(
            {"id": "x", "follower_id": "00000000-0000-4000-8000-000000000001", "following_id": PRIV, "created_at": "t"})
        return out

    monkeypatch.setattr(cr, "_blocked_either_way", racing)
    r = _approve(fake, "00000000-0000-4000-8000-000000000001", PRIV)
    assert r.status_code == 200
    assert len(fake.tables["follows"]) == 1


def test_dm_messages_migration_is_prepared_not_applied_and_keeps_select():
    from pathlib import Path

    sql = (Path(__file__).resolve().parents[1] / "migration_dm_messages_service_write_only_2026-11-27.sql").read_text(encoding="utf-8")
    assert sql.lstrip().startswith("-- PROPOSED, NOT APPLIED")
    assert "DROP POLICY IF EXISTS dm_participant_insert ON skillup_dev.dm_messages" in sql
    assert "REVOKE ALL ON skillup_dev.dm_messages FROM anon, authenticated" in sql
    assert "REVOKE SELECT" not in sql
    # SELECT is re-granted only when a SELECT/ALL policy exists.
    assert "pg_policies" in sql and "GRANT SELECT ON skillup_dev.dm_messages TO anon, authenticated" in sql
    assert "defence in depth" in sql.lower()


def test_base_schema_no_longer_recreates_the_insert_policy():
    from pathlib import Path

    schema = (Path(__file__).resolve().parents[2] / "supabase-schema.sql").read_text(encoding="utf-8")
    assert "CREATE POLICY dm_participant_insert" not in schema
    assert "REVOKE INSERT, UPDATE, DELETE ON skillup_dev.dm_messages FROM anon, authenticated" in schema


# ---------------- guests, rate limits, validation, races ----------------

GUEST = {"id": "00000000-0000-4000-8000-0000000000aa", "auth_provider": "guest", "account_type": "student"}


def test_guest_cannot_follow_or_request_but_can_unfollow(fake):
    fake.tables["users"].append({"id": GUEST["id"], "is_private": False, "is_deleted": False})
    c = _client(GUEST)
    a = _post(c, "follow", targetId="00000000-0000-4000-8000-000000000008")
    b = _post(c, "follow-request", targetId=PRIV)
    missing = _post(_client(ME), "follow", targetId="00000000-0000-4000-8000-000000000009")
    assert a.status_code == b.status_code == 404
    assert a.json() == b.json() == missing.json()
    assert fake.tables.get("follows", []) == [] and fake.tables.get("follow_requests", []) == []
    assert _post(c, "unfollow", targetId=PRIV).status_code == 200


def test_follow_endpoints_are_rate_limited(fake):
    c = _client(ME)
    codes = [_post(c, "follow-request", targetId=PRIV).status_code for _ in range(25)]
    assert codes[:20] == [200] * 20 and codes[20:] == [429] * 5
    codes = [_post(c, "follow", targetId="00000000-0000-4000-8000-000000000008").status_code for _ in range(35)]
    assert codes[-1] == 429 and codes[0] == 200
    assert _post(c, "block", targetId="00000000-0000-4000-8000-000000000008").status_code == 200
    r = None
    for _ in range(40):
        r = _post(c, "block", targetId="00000000-0000-4000-8000-000000000008")
    assert r.status_code == 429 and "Retry-After" in r.headers


def test_respond_is_rate_limited(fake):
    c = _client({"id": PRIV, "auth_provider": "email"})
    codes = [c.post("/api/users/follow-request/respond", json={"requesterId": ME["id"], "action": "approve"}).status_code
             for _ in range(65)]
    assert 429 in codes


@pytest.mark.parametrize("path", ["unfollow", "block"])
def test_malformed_target_id_is_uniform_404_not_500(fake, path):
    c = _client(ME)
    bad = _post(c, path, targetId="not-a-uuid'); drop")
    unknown = _post(c, path, targetId="00000000-0000-4000-8000-0000000000ff") if path == "block" else bad
    assert bad.status_code == 404 and bad.json() == unknown.json()


def test_respond_malformed_deleted_and_unknown_requester_are_uniform_404(fake):
    c = _client({"id": PRIV, "auth_provider": "email"})
    out = [
        c.post("/api/users/follow-request/respond", json={"requesterId": r, "action": "approve"})
        for r in ("not-a-uuid", "00000000-0000-4000-8000-000000000009", "00000000-0000-4000-8000-0000000000ff")
    ]
    assert {o.status_code for o in out} == {404} and len({o.text for o in out}) == 1


def test_respond_to_pending_request_from_deleted_requester_is_refused(fake):
    _post(_client(ME), "follow-request", targetId=PRIV)
    fake.tables["users"][0]["is_deleted"] = True
    assert _approve(fake, ME["id"], PRIV).status_code == 404
    assert fake.tables.get("follows", []) == []


def test_concurrent_approve_and_reject_only_one_wins(fake, monkeypatch):
    _post(_client(ME), "follow-request", targetId=PRIV)
    orig = cr._blocked_either_way

    def racing(a, b):
        out = orig(a, b)
        # A concurrent reject lands after this approve passed its checks.
        for r in fake.tables["follow_requests"]:
            r["status"] = "reject"
        return out

    monkeypatch.setattr(cr, "_blocked_either_way", racing)
    assert _approve(fake, ME["id"], PRIV, "approve").status_code == 404
    assert fake.tables.get("follows", []) == []
    assert _req_status(fake, ME["id"], PRIV) == "reject"


def test_repeat_block_is_idempotent_and_uses_on_conflict(fake):
    c = _client(ME)
    seen = []
    orig = _Query.upsert

    def spy(self, payload, on_conflict=None, ignore_duplicates=False):
        seen.append((self.name, on_conflict))
        return orig(self, payload, on_conflict, ignore_duplicates)

    _Query.upsert = spy
    try:
        assert _post(c, "block", targetId="00000000-0000-4000-8000-000000000008").status_code == 200
        assert _post(c, "block", targetId="00000000-0000-4000-8000-000000000008").status_code == 200
    finally:
        _Query.upsert = orig
    assert ("user_blocks", "user_id,target_id") in seen
    assert len(fake.tables["user_blocks"]) == 1


def test_duplicate_follow_race_is_not_a_500(fake, monkeypatch):
    target = "00000000-0000-4000-8000-000000000008"
    orig = cr._blocked_either_way

    def racing(a, b):
        out = orig(a, b)
        fake.tables.setdefault("follows", []).append({"id": "x", "follower_id": a, "following_id": b})
        return out

    monkeypatch.setattr(cr, "_blocked_either_way", racing)
    r = _post(_client(ME), "follow", targetId=target)
    assert r.status_code == 200
    assert len(fake.tables["follows"]) == 1


def test_active_user_distinguishes_missing_column_from_outage(fake, monkeypatch):
    uid = "00000000-0000-4000-8000-000000000008"

    class Col(Exception):
        code = "42703"

    real = _Query.eq

    def eq_missing(self, col, val):
        if col == "is_deleted":
            raise Col("column users.is_deleted does not exist")
        return real(self, col, val)

    monkeypatch.setattr(_Query, "eq", eq_missing)
    assert cr._active_user(uid)["id"] == uid  # missing column: treated as not deleted
    monkeypatch.setattr(_Query, "eq", real)

    def eq_down(self, col, val):
        raise RuntimeError("connection refused")

    monkeypatch.setattr(_Query, "eq", eq_down)
    with pytest.raises(cr.HTTPException) as exc:
        cr._active_user(uid)
    assert exc.value.status_code == 503
    r = _post(_client(ME), "follow", targetId=uid)
    assert r.status_code == 503
    monkeypatch.setattr(_Query, "eq", real)
    assert cr._active_user("not-a-uuid") is None

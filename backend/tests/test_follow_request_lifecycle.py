"""Follow / follow-request lifecycle: re-follow, re-request, blocks, concurrency."""
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


ME = {"id": "u-me", "auth_provider": "email", "account_type": "student"}
PRIV = "u-priv"


@pytest.fixture
def fake(monkeypatch):
    f = FakeDB()
    f.tables["users"] = [
        {"id": "u-me", "is_private": False, "is_deleted": False},
        {"id": "u-pub", "is_private": False, "is_deleted": False},
        {"id": PRIV, "is_private": True, "is_deleted": False},
        {"id": "u-gone", "is_private": False, "is_deleted": True},
    ]
    monkeypatch.setattr(cr.db, "get_service_client", lambda: f, raising=False)
    monkeypatch.setattr(cr, "_create_notification", lambda *a, **k: f.tables.setdefault("notes", []).append(a))
    return f


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
    assert _approve(fake, "u-me", PRIV).status_code == 200
    assert len(fake.tables["follows"]) == 1
    assert _post(c, "unfollow", targetId=PRIV).status_code == 200
    assert fake.tables["follows"] == []
    assert fake.tables.get("follow_requests", []) == []
    # Can request again and be approved again.
    assert _post(c, "follow-request", targetId=PRIV).json()["data"]["status"] == "pending"
    assert _approve(fake, "u-me", PRIV).status_code == 200
    assert len(fake.tables["follows"]) == 1


def test_stale_approved_row_without_follow_is_reopened_as_pending(fake):
    fake.tables["follow_requests"] = [
        {"id": "r1", "requester_id": "u-me", "target_id": PRIV, "status": "approve", "created_at": "old"}
    ]
    r = _post(_client(ME), "follow-request", targetId=PRIV)
    assert r.status_code == 200 and r.json()["data"]["status"] == "pending"
    assert _req_status(fake, "u-me", PRIV) == "pending"
    assert any(n[1:] == ("u-me", "follow_request") or n[-1] == "follow_request" for n in fake.tables["notes"])
    # And the owner can now approve it.
    assert _approve(fake, "u-me", PRIV).status_code == 200


def test_rerequest_after_reject_works(fake):
    c = _client(ME)
    _post(c, "follow-request", targetId=PRIV)
    assert _approve(fake, "u-me", PRIV, "reject").json()["data"]["status"] == "reject"
    assert _req_status(fake, "u-me", PRIV) == "reject"
    r = _post(c, "follow-request", targetId=PRIV)
    assert r.json()["data"]["status"] == "pending"
    assert _req_status(fake, "u-me", PRIV) == "pending"


def test_existing_pending_request_is_not_renotified(fake):
    c = _client(ME)
    _post(c, "follow-request", targetId=PRIV)
    n = len(fake.tables["notes"])
    assert _post(c, "follow-request", targetId=PRIV).json()["data"]["status"] == "pending"
    assert len(fake.tables["notes"]) == n


def test_approved_and_still_following_returns_status_without_reopening(fake):
    c = _client(ME)
    _post(c, "follow-request", targetId=PRIV)
    _approve(fake, "u-me", PRIV)
    assert _post(c, "follow-request", targetId=PRIV).json()["data"]["status"] == "approve"
    assert _req_status(fake, "u-me", PRIV) == "approve"


def test_respond_still_requires_a_pending_row(fake):
    fake.tables["follow_requests"] = [
        {"id": "r1", "requester_id": "u-me", "target_id": PRIV, "status": "reject", "created_at": "old"}
    ]
    assert _approve(fake, "u-me", PRIV).status_code == 404
    assert _approve(fake, "u-pub", PRIV).status_code == 404
    assert fake.tables.get("follows", []) == []


@pytest.mark.parametrize("blocker,blocked", [("u-me", PRIV), (PRIV, "u-me"), ("u-me", "u-pub"), ("u-pub", "u-me")])
def test_block_either_direction_refuses_follow_and_request(fake, blocker, blocked):
    fake.tables["user_blocks"] = [{"id": "b", "user_id": blocker, "target_id": blocked}]
    c = _client(ME)
    target = PRIV if PRIV in (blocker, blocked) else "u-pub"
    a = _post(c, "follow", targetId=target)
    b = _post(c, "follow-request", targetId=target)
    missing = _post(c, "follow", targetId="u-gone")
    missing2 = _post(c, "follow-request", targetId="u-gone")
    assert a.status_code == b.status_code == 404
    assert a.json() == b.json() == missing.json() == missing2.json()
    assert fake.tables.get("follows", []) == []
    assert fake.tables.get("follow_requests", []) == []


def test_block_refuses_respond_even_with_pending_request(fake):
    _post(_client(ME), "follow-request", targetId=PRIV)
    fake.tables["user_blocks"] = [{"id": "b", "user_id": PRIV, "target_id": "u-me"}]
    assert _approve(fake, "u-me", PRIV).status_code == 404
    assert fake.tables.get("follows", []) == []
    assert _req_status(fake, "u-me", PRIV) == "pending"


def test_block_clears_follows_and_requests_both_directions(fake):
    fake.tables["follows"] = [
        {"follower_id": "u-me", "following_id": "u-pub"}, {"follower_id": "u-pub", "following_id": "u-me"}
    ]
    fake.tables["follow_requests"] = [
        {"id": "1", "requester_id": "u-me", "target_id": "u-pub", "status": "approve"},
        {"id": "2", "requester_id": "u-pub", "target_id": "u-me", "status": "pending"},
    ]
    assert _post(_client(ME), "block", targetId="u-pub").status_code == 200
    assert fake.tables["follows"] == []
    assert fake.tables["follow_requests"] == []


def test_unknown_follow_targets_are_indistinguishable(fake):
    c = _client(ME)
    responses = [_post(c, p, targetId=t) for p in ("follow", "follow-request") for t in ("u-gone", "nobody")]
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
            {"id": "x", "follower_id": "u-me", "following_id": PRIV, "created_at": "t"})
        return out

    monkeypatch.setattr(cr, "_blocked_either_way", racing)
    r = _approve(fake, "u-me", PRIV)
    assert r.status_code == 200
    assert len(fake.tables["follows"]) == 1


def test_dm_messages_migration_is_prepared_not_applied_and_keeps_select():
    from pathlib import Path

    sql = (Path(__file__).resolve().parents[1] / "migration_dm_messages_service_write_only_2026-11-27.sql").read_text(encoding="utf-8")
    assert sql.lstrip().startswith("-- PROPOSED, NOT APPLIED")
    assert "DROP POLICY IF EXISTS dm_participant_insert ON skillup_dev.dm_messages" in sql
    assert "REVOKE INSERT, UPDATE, DELETE ON skillup_dev.dm_messages FROM anon, authenticated" in sql
    assert "dm_participant_read" not in sql and "REVOKE SELECT" not in sql

"""Scheduled hard delete: eligibility, dry run, batch cap, failure isolation."""
from datetime import datetime, timedelta, timezone

import account_hard_delete as ahd

NOW = datetime(2026, 12, 1, tzinfo=timezone.utc)


def _iso(days_ago):
    return (NOW - timedelta(days=days_ago)).isoformat()


class _Q:
    def __init__(self, db, name):
        self.db, self.name = db, name
        self.filters, self._lt, self._limit, self._order, self._delete = [], None, None, None, False

    def select(self, *_a, **_k): return self
    def eq(self, k, v):
        self.filters.append((k, v))
        return self
    def lt(self, k, v):
        self._lt = (k, v)
        return self
    def order(self, k):
        self._order = k
        return self
    def limit(self, n):
        self._limit = n
        return self
    def delete(self):
        self._delete = True
        return self

    def _match(self, r):
        if any(r.get(k) != v for k, v in self.filters):
            return False
        if self._lt and not (r.get(self._lt[0]) and r[self._lt[0]] < self._lt[1]):
            return False
        return True

    def execute(self):
        rows = self.db.tables[self.name]
        hit = [r for r in rows if self._match(r)]
        if self._delete:
            self.db.tables[self.name] = [r for r in rows if r not in hit]
            return type("R", (), {"data": hit})()
        if self._order:
            hit.sort(key=lambda r: r[self._order])
        if self._limit:
            hit = hit[: self._limit]
        return type("R", (), {"data": hit})()


class FakeDB:
    def __init__(self, users):
        self.tables = {"users": users}

    def schema(self, _n): return self
    def table(self, n): return _Q(self, n)
    def get_service_client(self): return self


def _user(uid, days_ago, **extra):
    return {"id": uid, "is_deleted": True, "deletion_cooldown_until": _iso(days_ago), **extra}


def _setup(monkeypatch, users, enabled=True, batch=100, days=30):
    f = FakeDB(users)
    monkeypatch.setattr(ahd, "db", f)
    monkeypatch.setattr(ahd.settings, "ACCOUNT_HARD_DELETE_ENABLED", enabled, raising=False)
    monkeypatch.setattr(ahd.settings, "ACCOUNT_HARD_DELETE_RETENTION_DAYS", days, raising=False)
    monkeypatch.setattr(ahd.settings, "ACCOUNT_HARD_DELETE_BATCH_SIZE", batch, raising=False)
    purged = []
    monkeypatch.setattr(ahd, "hard_delete_learner_content", lambda uid: purged.append(uid))
    return f, purged


def test_only_accounts_past_retention_are_removed(monkeypatch):
    f, purged = _setup(monkeypatch, [
        _user("old", 45), _user("recent", 5),
        {"id": "active", "is_deleted": False, "deletion_cooldown_until": None},
    ])
    out = ahd.hard_delete_expired_accounts(NOW)
    assert out == {"dry_run": False, "eligible": 1, "deleted": 1, "failed": 0, "blocked": {}, "abandoned": 0}
    assert purged == ["old"]
    assert sorted(r["id"] for r in f.tables["users"]) == ["active", "recent"]


def test_dry_run_deletes_nothing(monkeypatch):
    f, purged = _setup(monkeypatch, [_user("old", 45)], enabled=False)
    out = ahd.hard_delete_expired_accounts(NOW)
    assert out["dry_run"] is True and out["eligible"] == 1 and out["deleted"] == 0
    assert purged == [] and len(f.tables["users"]) == 1


def test_unclaimed_shells_are_never_touched_but_claimed_provisioned_learners_are_purged(monkeypatch):
    f, purged = _setup(monkeypatch, [
        _user("shell", 90, provisioning_school_id="s1", claim_state="unclaimed"),
        _user("minor", 90, provisioning_school_id="s1", claim_state="claimed"),
        _user("claimed", 90, claim_state="claimed"),
        _user("self", 90),
        _user("minor-recent", 3, provisioning_school_id="s1", claim_state="claimed"),
    ])
    ahd.hard_delete_expired_accounts(NOW)
    assert sorted(purged) == ["claimed", "minor", "self"]
    # the retention window still applies to provisioned learners (never shortened)
    assert sorted(r["id"] for r in f.tables["users"]) == ["minor-recent", "shell"]


def test_expired_cooldown_rows_are_purged_even_in_a_dry_run(monkeypatch):
    f, purged = _setup(monkeypatch, [_user("old", 45)], enabled=False)
    f.tables["account_deletion_cooldowns"] = [
        {"user_id": "a", "available_at": _iso(2)},
        {"user_id": "b", "available_at": (NOW + timedelta(hours=5)).isoformat()},
    ]
    out = ahd.hard_delete_expired_accounts(NOW)
    assert out["dry_run"] is True and out["deleted"] == 0 and purged == []
    assert [r["user_id"] for r in f.tables["account_deletion_cooldowns"]] == ["b"]


def test_batch_cap_limits_each_run_and_the_rest_wait(monkeypatch):
    # Without the backoff columns the batch is a rotating slice (see the module
    # docstring), so which rows go first depends on the date. What matters: a
    # run never exceeds the cap, and repeated runs finish everything.
    f, purged = _setup(monkeypatch, [_user("a", 100), _user("b", 80), _user("c", 60)], batch=2)
    first = ahd.hard_delete_expired_accounts(NOW)["deleted"]
    assert 1 <= first <= 2 and len(purged) == first
    for _ in range(3):
        assert ahd.hard_delete_expired_accounts(NOW)["deleted"] <= 2
    assert f.tables["users"] == []
    assert sorted(purged) == ["a", "b", "c"]


def test_one_failure_does_not_stop_the_run(monkeypatch):
    f, _ = _setup(monkeypatch, [_user("bad", 100), _user("good", 90)])

    def purge(uid):
        if uid == "bad":
            raise RuntimeError("boom")
    monkeypatch.setattr(ahd, "hard_delete_learner_content", purge)
    out = ahd.hard_delete_expired_accounts(NOW)
    assert out["deleted"] == 1 and out["failed"] == 1
    assert [r["id"] for r in f.tables["users"]] == ["bad"]  # kept for the next run

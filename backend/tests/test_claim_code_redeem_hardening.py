"""Claim-code redemption: atomic single use, attempt limits, uniform errors."""
import asyncio
import threading
from types import SimpleNamespace

import pytest
from fastapi import HTTPException

import routes.provisioning_routes as pr
from routes.provisioning_routes import ClaimRequest, _gen_claim_code, claim_account

FUTURE = "2999-01-01T00:00:00+00:00"
PAST = "2000-01-01T00:00:00+00:00"


class _Query:
    def __init__(self, store, name, hook=None):
        self.store, self.name, self.hook = store, name, hook
        self.filters, self.op, self.values = [], "select", None

    def select(self, *_a):
        self.op = "select"
        return self

    def update(self, values):
        self.op, self.values = "update", values
        return self

    def eq(self, col, val):
        self.filters.append((col, "eq", val))
        return self

    def is_(self, col, val):
        self.filters.append((col, "is", val))
        return self

    def limit(self, _n):
        return self

    def _match(self, row):
        for col, kind, val in self.filters:
            cur = row.get(col)
            if kind == "is" and val == "null" and cur is not None:
                return False
            if kind == "eq" and cur != val:
                return False
        return True

    def execute(self):
        with self.store.lock:
            rows = [r for r in self.store.tables[self.name] if self._match(r)]
            if self.op == "update":
                for r in rows:
                    r.update(self.values)
            snapshot = [dict(r) for r in rows]
        if self.op == "update" and self.store.update_hook:
            self.store.update_hook(self, rows)  # may raise AFTER the write applied
        if self.op == "select" and self.hook:
            self.hook()  # lets a test hold two readers before either writes
        return SimpleNamespace(data=snapshot)


class _Store:
    def __init__(self, codes):
        self.tables = {"claim_codes": codes}
        self.lock = threading.Lock()
        self.select_hook = None
        self.update_hook = None

    def table(self, name):
        return _Query(self, name, self.select_hook)

    def schema(self, _name):
        return self


def _code_row(**over):
    row = {"id": "cc-1", "code": "ACME-SS1-ABCDEF12", "student_id": "prov-1",
           "school_id": "school-1", "expires_at": FUTURE,
           "redeemed_at": None, "revoked_at": None}
    row.update(over)
    return row


@pytest.fixture
def env(monkeypatch):
    store = _Store([_code_row()])
    merges, user_updates = [], []
    monkeypatch.setattr(pr, "_svc", lambda: store)

    claim_state = {}  # user id -> claim_state, as the real users table would hold it

    class _Users:
        def update(self, values):
            user_updates.append(values)

            def _eq(_col, uid):
                claim_state[uid] = values.get("claim_state", claim_state.get(uid))
                return SimpleNamespace(execute=lambda: None)

            return SimpleNamespace(eq=_eq)

        def select(self, *_a):
            q = SimpleNamespace(uid=None)
            q.eq = lambda _c, uid: (setattr(q, "uid", uid), q)[1]
            q.limit = lambda _n: q
            q.execute = lambda: SimpleNamespace(
                data=[{"claim_state": claim_state.get(q.uid)}])
            return q

    monkeypatch.setattr(pr, "_users", lambda: _Users())
    monkeypatch.setattr(pr, "merge_provisioned_into_student", lambda **kw: merges.append(kw) or {})
    pr.claim_limiter.reset()
    pr.claim_ip_limiter.reset()
    yield SimpleNamespace(store=store, merges=merges, user_updates=user_updates,
                          claim_state=claim_state)
    pr.claim_limiter.reset()
    pr.claim_ip_limiter.reset()


def _call(code, user_id="guest-1", user=None, request=None, **extra):
    user = user or {"id": user_id}
    return asyncio.run(claim_account(
        payload=ClaimRequest(code=code, **extra), request=request, current_user=user))


def _status(code, **kw):
    with pytest.raises(HTTPException) as caught:
        _call(code, **kw)
    return caught.value


def test_guest_merge_redeems_once_and_marks_code_used(env):
    res = _call("acme-ss1-abcdef12")  # case-insensitive
    assert res.data == {"claimed": True, "school_id": "school-1"}
    assert env.merges and env.merges[0]["real_student_id"] == "guest-1"
    assert env.store.tables["claim_codes"][0]["redeemed_at"] is not None
    # A second attempt (even the same user) gets the uniform rejection.
    assert _status("ACME-SS1-ABCDEF12").status_code == 404
    assert len(env.merges) == 1


def test_provisioned_account_claim_needs_identity_and_does_not_burn_code(env):
    err = _status("ACME-SS1-ABCDEF12", user_id="prov-1")
    assert err.status_code == 400
    assert env.store.tables["claim_codes"][0]["redeemed_at"] is None
    res = _call("ACME-SS1-ABCDEF12", user_id="prov-1", phone="0800")
    assert res.data["claimed"] is True
    assert env.user_updates[0]["claim_state"] == "claimed"


def test_two_concurrent_redeemers_cannot_both_succeed(env):
    barrier = threading.Barrier(2, timeout=5)
    env.store.select_hook = barrier.wait  # both read the live row before either writes
    results = {}

    def run(uid):
        try:
            results[uid] = _call("ACME-SS1-ABCDEF12", user_id=uid)
        except HTTPException as exc:
            results[uid] = exc

    threads = [threading.Thread(target=run, args=(u,)) for u in ("a", "b")]
    for t in threads:
        t.start()
    for t in threads:
        t.join(10)
    winners = [u for u, r in results.items() if not isinstance(r, HTTPException)]
    losers = [r for r in results.values() if isinstance(r, HTTPException)]
    assert len(winners) == 1 and len(losers) == 1
    assert losers[0].status_code == 404
    assert len(env.merges) == 1  # the merge ran for the winner only


def test_failed_merge_reopens_the_code_for_retry(env, monkeypatch):
    def boom(**_kw):
        raise RuntimeError("db down")

    monkeypatch.setattr(pr, "merge_provisioned_into_student", boom)
    assert _status("ACME-SS1-ABCDEF12").status_code == 500
    assert env.store.tables["claim_codes"][0]["redeemed_at"] is None
    monkeypatch.setattr(pr, "merge_provisioned_into_student", lambda **kw: env.merges.append(kw) or {})
    assert _call("ACME-SS1-ABCDEF12").data["claimed"] is True


def test_unknown_used_revoked_and_expired_codes_get_the_same_error(env):
    env.store.tables["claim_codes"] += [
        _code_row(id="u", code="ACME-SS1-USED0001", redeemed_at="2026-01-01"),
        _code_row(id="r", code="ACME-SS1-REVOKED1", revoked_at="2026-01-01"),
        _code_row(id="e", code="ACME-SS1-EXPIRED1", expires_at=PAST),
    ]
    seen = set()
    for code in ("NOPE-SS1-00000000", "ACME-SS1-USED0001",
                 "ACME-SS1-REVOKED1", "ACME-SS1-EXPIRED1"):
        err = _status(code)
        seen.add((err.status_code, err.detail))
    assert len(seen) == 1 and next(iter(seen))[0] == 404


def test_failed_guesses_are_limited_per_user(env):
    for i in range(pr.CLAIM_FAILURES_PER_WINDOW):
        assert _status(f"BAD-{i}").status_code == 404
    err = _status("BAD-next")
    assert err.status_code == 429 and "Retry-After" in err.headers
    # Even the correct code is refused while blocked, and another user is unaffected.
    assert _status("ACME-SS1-ABCDEF12").status_code == 429
    assert _call("ACME-SS1-ABCDEF12", user_id="other").data["claimed"] is True


def test_success_never_counts_toward_the_limit(env):
    n = pr.CLAIM_FAILURES_PER_WINDOW + 3
    env.store.tables["claim_codes"] = [
        _code_row(id=f"c{i}", code=f"ACME-SS1-OK{i:06d}") for i in range(n)
    ]
    for i in range(n):
        assert _call(f"ACME-SS1-OK{i:06d}", user_id=f"g{i}").data["claimed"] is True


def _req(peer="8.8.8.8"):
    return SimpleNamespace(client=SimpleNamespace(host=peer), headers={})


def _guest(i):
    return {"id": f"g{i}", "auth_provider": "guest"}


def _email_user(i):
    return {"id": f"u{i}", "auth_provider": "email"}


def test_address_limit_is_300_per_window_for_every_provider(env):
    assert pr.CLAIM_IP_FAILURES_PER_WINDOW >= 300
    n = pr.CLAIM_IP_FAILURES_PER_WINDOW
    for i in range(n):
        assert _status(f"BAD-{i}", user=_guest(i), request=_req()).status_code == 404
    assert _status("BAD-x", user=_guest("x"), request=_req()).status_code == 429
    # a single 15-minute window: no daily cap, so a lockout cannot outlast 15 min
    assert [w for (w, _m, _l) in pr.claim_ip_limiter._limits] == [900]
    # a different address is unaffected
    assert _status("BAD-x", user=_guest("y"), request=_req("1.1.1.1")).status_code == 404


@pytest.mark.parametrize("provider", ["email", "base", "telegram", "guest"])
def test_address_bucket_applies_to_non_guests(env, provider):
    n = pr.CLAIM_IP_FAILURES_PER_WINDOW
    for i in range(n):
        user = {"id": f"u{i}", "auth_provider": provider}
        assert _status(f"BAD-{i}", user=user, request=_req()).status_code == 404
    fresh = {"id": "fresh", "auth_provider": provider}
    # Documented trade-off: even a fresh non-guest with the correct code is held
    # (exempting zero-failure accounts would reopen the guessing hole).
    assert _status("ACME-SS1-ABCDEF12", user=fresh, request=_req()).status_code == 429
    assert _call("ACME-SS1-ABCDEF12", user=fresh, request=_req("1.1.1.1")).data["claimed"]


def test_non_guest_failures_fill_the_address_bucket_and_clear_after_15_min(env):
    for i in range(pr.CLAIM_IP_FAILURES_PER_WINDOW):
        _status("BAD", user=_email_user(i), request=_req())
    err = _status("BAD", user=_guest("z"), request=_req())
    assert err.status_code == 429
    assert int(err.headers["Retry-After"]) <= 900


def test_successes_never_count_toward_the_address_bucket(env):
    _call("ACME-SS1-ABCDEF12", user=_email_user(1), request=_req(), phone="0800")
    assert pr.claim_ip_limiter.check("ip:8.8.8.8") is None


def test_shared_proxy_address_never_locks_everyone_out(env):
    # Private/loopback peer = a proxy with no trusted forwarded address: no
    # per-address bucket, so one user's failures cannot block another user.
    proxy = _req("10.0.0.5")
    for i in range(pr.CLAIM_IP_FAILURES_PER_WINDOW + 20):
        _status(f"BAD-{i % 5}", user=_guest(i), request=proxy)
    assert _call("ACME-SS1-ABCDEF12", user_id="student", request=proxy).data["claimed"] is True


def test_empty_code_is_a_400_and_not_counted(env):
    assert _status("   ").status_code == 400
    for i in range(pr.CLAIM_FAILURES_PER_WINDOW):
        _status("  ")
    assert _status("BAD").status_code == 404


def test_new_codes_have_48_bit_suffix_and_old_codes_still_redeem(env):
    new = _gen_claim_code("Acme School", "ss1")
    assert len(new.rsplit("-", 1)[1]) == 12
    assert new == new.upper()
    env.store.tables["claim_codes"].append(_code_row(id="new", code=new))
    assert _call(new, user_id="g-new").data["claimed"] is True
    assert _call("ACME-SS1-ABCDEF12").data["claimed"] is True  # 8-char legacy code


def test_update_raising_after_it_applied_still_reopens_the_code(env):
    def apply_then_raise(query, _rows):
        if query.values.get("redeemed_at"):
            raise RuntimeError("connection lost after commit")

    env.store.update_hook = apply_then_raise
    assert _status("ACME-SS1-ABCDEF12").status_code == 500
    env.store.update_hook = None
    assert env.store.tables["claim_codes"][0]["redeemed_at"] is None
    assert _call("ACME-SS1-ABCDEF12").data["claimed"] is True


def test_reopen_does_not_clobber_another_callers_redemption(env, monkeypatch):
    def merge_fails_after_someone_else_redeemed(**_kw):
        # Another caller's redemption replaced ours before our cleanup runs.
        env.store.tables["claim_codes"][0]["redeemed_at"] = "OTHER-CALLER-STAMP"
        raise RuntimeError("merge failed")

    monkeypatch.setattr(pr, "merge_provisioned_into_student", merge_fails_after_someone_else_redeemed)
    assert _status("ACME-SS1-ABCDEF12").status_code == 500
    assert env.store.tables["claim_codes"][0]["redeemed_at"] == "OTHER-CALLER-STAMP"


def test_reopen_is_skipped_when_admin_reissued_a_newer_live_code(env, monkeypatch):
    def merge_fails_after_reissue(**_kw):
        env.store.tables["claim_codes"].append(
            _code_row(id="cc-2", code="ACME-SS1-NEWCODE12345"))
        raise RuntimeError("merge failed")

    monkeypatch.setattr(pr, "merge_provisioned_into_student", merge_fails_after_reissue)
    assert _status("ACME-SS1-ABCDEF12").status_code == 500
    old, new = env.store.tables["claim_codes"]
    assert old["redeemed_at"] is not None  # superseded code stays closed
    assert new["redeemed_at"] is None and new["revoked_at"] is None


def test_reopen_is_skipped_when_the_code_was_revoked(env, monkeypatch):
    def merge_fails_after_revoke(**_kw):
        env.store.tables["claim_codes"][0]["revoked_at"] = "2026-01-01"
        raise RuntimeError("merge failed")

    monkeypatch.setattr(pr, "merge_provisioned_into_student", merge_fails_after_revoke)
    assert _status("ACME-SS1-ABCDEF12").status_code == 500
    assert env.store.tables["claim_codes"][0]["redeemed_at"] is not None


def test_double_tap_by_the_same_user_is_idempotent_success(env):
    first = _call("ACME-SS1-ABCDEF12", user_id="prov-1", phone="0800")
    again = _call("ACME-SS1-ABCDEF12", user_id="prov-1", phone="0800")
    assert first.data == again.data == {"claimed": True, "school_id": "school-1"}
    assert len(env.user_updates) == 1  # nothing was redone
    # Not counted as a failure.
    for _ in range(pr.CLAIM_FAILURES_PER_WINDOW + 2):
        _call("ACME-SS1-ABCDEF12", user_id="prov-1", phone="0800")


def test_redeemed_code_is_not_an_oracle_for_other_callers(env):
    _call("ACME-SS1-ABCDEF12", user_id="prov-1", phone="0800")
    for uid in ("someone-else", "guest-9"):
        err = _status("ACME-SS1-ABCDEF12", user_id=uid)
        assert err.status_code == 404 and err.detail == pr._CLAIM_REJECTED
    unknown = _status("NOPE-SS1-00000000", user_id="someone-else")
    assert unknown.detail == pr._CLAIM_REJECTED


def test_revoked_code_is_not_idempotent_for_its_student(env):
    env.store.tables["claim_codes"][0].update(redeemed_at="2026-01-01", revoked_at="2026-01-02")
    assert _status("ACME-SS1-ABCDEF12", user_id="prov-1", phone="0800").status_code == 404


def test_idempotent_success_requires_claim_state_claimed(env):
    # Request 1 holds the stamp but has not finished (or failed): the user row is
    # not claimed, so a second request must NOT be told it succeeded.
    env.store.tables["claim_codes"][0]["redeemed_at"] = "2026-01-01"
    assert _status("ACME-SS1-ABCDEF12", user_id="prov-1", phone="0800").status_code == 404
    env.claim_state["prov-1"] = "claimed"
    res = _call("ACME-SS1-ABCDEF12", user_id="prov-1", phone="0800")
    assert res.data == {"claimed": True, "school_id": "school-1"}


def test_unknown_and_redeemed_codes_return_identical_bodies_and_same_lookups(env, monkeypatch):
    _call("ACME-SS1-ABCDEF12", user_id="prov-1", phone="0800")
    calls = []
    real = pr._already_claimed_by_caller
    monkeypatch.setattr(pr, "_already_claimed_by_caller",
                        lambda c, u: calls.append(c) or real(c, u))
    redeemed = _status("ACME-SS1-ABCDEF12", user_id="other")
    unknown = _status("NOPE-SS1-00000000", user_id="other")
    assert (redeemed.status_code, redeemed.detail) == (unknown.status_code, unknown.detail)
    assert len(calls) == 2  # the extra lookup runs for both

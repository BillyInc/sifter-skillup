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
        if self.op == "select" and self.hook:
            self.hook()  # lets a test hold two readers before either writes
        return SimpleNamespace(data=snapshot)


class _Store:
    def __init__(self, codes):
        self.tables = {"claim_codes": codes}
        self.lock = threading.Lock()
        self.select_hook = None

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

    class _Users:
        def update(self, values):
            user_updates.append(values)
            return SimpleNamespace(eq=lambda *a: SimpleNamespace(execute=lambda: None))

    monkeypatch.setattr(pr, "_users", lambda: _Users())
    monkeypatch.setattr(pr, "merge_provisioned_into_student", lambda **kw: merges.append(kw) or {})
    pr.claim_limiter.reset()
    pr.claim_ip_limiter.reset()
    yield SimpleNamespace(store=store, merges=merges, user_updates=user_updates)
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


def test_address_limit_is_looser_and_per_known_address(env):
    # Many different guests from one public address trip the address limit...
    for i in range(pr.CLAIM_IP_FAILURES_PER_WINDOW):
        assert _status(f"BAD-{i}", user_id=f"g{i}", request=_req()).status_code == 404
    assert _status("BAD-x", user_id="fresh", request=_req()).status_code == 429
    # ...a different address is unaffected.
    assert _status("BAD-x", user_id="fresh2", request=_req("1.1.1.1")).status_code == 404


def test_shared_proxy_address_never_locks_everyone_out(env):
    # Private/loopback peer = a proxy with no trusted forwarded address: no
    # per-address bucket, so one user's failures cannot block another user.
    proxy = _req("10.0.0.5")
    for i in range(pr.CLAIM_IP_FAILURES_PER_WINDOW + 20):
        _status(f"BAD-{i % 5}", user_id=f"g{i}", request=proxy)
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

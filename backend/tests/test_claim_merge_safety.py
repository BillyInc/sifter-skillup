"""Claim merge safety: a claimed account is never merged away, a mid-redeem
account is never reissued a code, and a reopened code never sits next to a new one."""
import asyncio
from types import SimpleNamespace

import pytest
from fastapi import HTTPException

import routes.provisioning_routes as pr
import services.provisioning_reconcile as rec
from routes.provisioning_routes import ClaimRequest, claim_account

FUTURE = "2999-01-01T00:00:00+00:00"


class _Q:
    def __init__(self, db, name):
        self.db, self.name = db, name
        self.filters, self.op, self.values = [], "select", None

    def select(self, *_a):
        self.op = "select"
        return self

    def update(self, values):
        self.op, self.values = "update", values
        return self

    def insert(self, values):
        self.op, self.values = "insert", values
        return self

    def delete(self):
        self.op = "delete"
        return self

    def upsert(self, values, **_kw):
        self.op, self.values = "noop", values
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
        rows = self.db.tables.setdefault(self.name, [])
        hook = self.db.hooks.get((self.name, self.op))
        if hook:
            hook(self)
        if self.op == "insert":
            rows.append(dict(self.values))
            return SimpleNamespace(data=[dict(self.values)])
        hit = [r for r in rows if self._match(r)]
        if self.op == "update":
            for r in hit:
                r.update(self.values)
        elif self.op == "delete":
            self.db.tables[self.name] = [r for r in rows if r not in hit]
        return SimpleNamespace(data=[dict(r) for r in hit])


class _DB:
    def __init__(self):
        self.tables = {}
        self.hooks = {}

    def table(self, name):
        return _Q(self, name)

    def schema(self, _n):
        return self


def _user(**over):
    row = {"id": "prov-1", "claim_state": "unclaimed", "provisioning_school_id": "school-1",
           "student_class": "SS1", "stream": None, "chosen_direction": None,
           "guardian_consent_at": None, "settings": {}}
    row.update(over)
    return row


def _code(**over):
    row = {"id": "cc-1", "code": "ACME-SS1-ABCDEF12", "student_id": "prov-1",
           "school_id": "school-1", "expires_at": FUTURE,
           "redeemed_at": None, "revoked_at": None}
    row.update(over)
    return row


@pytest.fixture
def db(monkeypatch):
    d = _DB()
    d.tables = {"users": [_user(), {"id": "guest-1", "claim_state": None}],
                "claim_codes": [_code()], "student_affiliations": [],
                "schools": [{"id": "school-1", "name": "Acme"}]}
    for mod in (pr, rec):
        monkeypatch.setattr(mod, "_svc", lambda d=d: d)
        monkeypatch.setattr(mod, "_users", lambda d=d: d.table("users"))
    pr.claim_limiter.reset()
    pr.claim_ip_limiter.reset()
    yield d
    pr.claim_limiter.reset()
    pr.claim_ip_limiter.reset()


def _users(d):
    return {r["id"]: r for r in d.tables["users"]}


def _redeem(code="ACME-SS1-ABCDEF12", uid="guest-1"):
    return asyncio.run(claim_account(
        payload=ClaimRequest(code=code), request=None, current_user={"id": uid}))


def _regen(d, uid="prov-1"):
    return asyncio.run(pr.regenerate_code(
        user_id=uid, current_user={"id": "admin", "school_id": "school-1"}))


@pytest.fixture(autouse=True)
def _admin_school(monkeypatch):
    monkeypatch.setattr(pr, "_require_school_role", lambda *_a, **_k: "school-1")


# -- merge guard --------------------------------------------------------------
def test_merge_refuses_a_claimed_target_and_deletes_nothing(db):
    _users(db)["prov-1"]["claim_state"] = "claimed"
    with pytest.raises(rec.MergeRefused):
        rec.merge_provisioned_into_student(
            provisioned_student_id="prov-1", real_student_id="guest-1", school_id="school-1")
    assert "prov-1" in _users(db)


def test_merge_rechecks_claim_state_right_before_deleting(db):
    # The student claims between the first read and the destructive step.
    def claim_now(_q):
        _users(db)["prov-1"]["claim_state"] = "claimed"

    db.hooks[("student_affiliations", "delete")] = claim_now
    with pytest.raises(rec.MergeRefused):
        rec.merge_provisioned_into_student(
            provisioned_student_id="prov-1", real_student_id="guest-1", school_id="school-1")
    assert "prov-1" in _users(db)


def test_merge_still_works_for_an_unclaimed_shell(db):
    rec.merge_provisioned_into_student(
        provisioned_student_id="prov-1", real_student_id="guest-1", school_id="school-1")
    assert "prov-1" not in _users(db)


def test_redeem_of_a_claimed_accounts_code_by_another_user_is_the_uniform_404(db):
    _users(db)["prov-1"]["claim_state"] = "claimed"
    with pytest.raises(HTTPException) as claimed:
        _redeem()
    with pytest.raises(HTTPException) as unknown:
        _redeem(code="NOPE-SS1-00000000")
    assert (claimed.value.status_code, claimed.value.detail) == (404, pr._CLAIM_REJECTED)
    assert (unknown.value.status_code, unknown.value.detail) == (404, pr._CLAIM_REJECTED)
    assert "prov-1" in _users(db)  # the claimed user was not deleted
    assert db.tables["claim_codes"][0]["redeemed_at"] is not None  # code stays closed


def test_admin_confirm_of_a_claimed_shell_is_a_409(db):
    _users(db)["prov-1"]["claim_state"] = "claimed"
    db.tables["student_merge_candidates"] = [{
        "id": "m1", "school_id": "school-1", "status": "pending",
        "provisioned_student_id": "prov-1", "real_student_id": "guest-1"}]
    with pytest.raises(HTTPException) as err:
        asyncio.run(pr.confirm_merge_candidate(
            candidate_id="m1", current_user={"id": "admin"}))
    assert err.value.status_code == 409
    assert "prov-1" in _users(db)


# -- regenerate during a redeem -----------------------------------------------
def test_regenerate_refuses_while_a_redeem_is_stamped(db):
    db.tables["claim_codes"][0]["redeemed_at"] = "2026-01-01"  # stamped, not yet claimed
    with pytest.raises(HTTPException) as err:
        _regen(db)
    assert err.value.status_code == 409
    assert len(db.tables["claim_codes"]) == 1  # no new code issued


def test_regenerate_refuses_a_claimed_account(db):
    _users(db)["prov-1"]["claim_state"] = "claimed"
    with pytest.raises(HTTPException) as err:
        _regen(db)
    assert err.value.status_code == 409


def test_regenerate_takes_the_new_code_back_if_a_redeem_lands_mid_flight(db):
    def redeem_lands(_q):
        # The student's redeem stamps the old code after our pre-check, just
        # before our revoke (so the revoke skips it) and the insert.
        db.tables["claim_codes"][0]["redeemed_at"] = "2026-01-01"
        db.hooks.pop(("claim_codes", "update"))

    db.hooks[("claim_codes", "update")] = redeem_lands
    with pytest.raises(HTTPException) as err:
        _regen(db)
    assert err.value.status_code == 409
    live = [c for c in db.tables["claim_codes"] if not c.get("redeemed_at") and not c.get("revoked_at")]
    assert live == []  # the new code was revoked again


def test_regenerate_still_issues_a_code_for_an_idle_unclaimed_account(db):
    res = _regen(db)
    assert res.data["claim_code"]
    live = [c for c in db.tables["claim_codes"] if not c.get("redeemed_at") and not c.get("revoked_at")]
    assert [c["code"] for c in live] == [res.data["claim_code"]]


# -- reopen atomicity ---------------------------------------------------------
def _failing_merge(monkeypatch):
    def boom(**_kw):
        raise RuntimeError("merge failed")

    monkeypatch.setattr(pr, "merge_provisioned_into_student", boom)


def test_reopen_revokes_itself_if_an_admin_regenerates_between_check_and_update(db, monkeypatch):
    _failing_merge(monkeypatch)

    def regenerate_between_check_and_reopen(q):
        # Only the reopen UPDATE (redeemed_at -> None) is interleaved.
        if q.values == {"redeemed_at": None}:
            db.tables["claim_codes"].append(_code(id="cc-2", code="ACME-SS1-NEWCODE12345"))
            db.hooks.pop(("claim_codes", "update"))

    db.hooks[("claim_codes", "update")] = regenerate_between_check_and_reopen
    with pytest.raises(HTTPException) as err:
        _redeem()
    assert err.value.status_code == 500
    old, new = db.tables["claim_codes"]
    live = [c for c in (old, new) if not c.get("redeemed_at") and not c.get("revoked_at")]
    assert [c["id"] for c in live] == ["cc-2"]  # exactly one live code: the newer one
    assert old["revoked_at"] is not None


def test_reopen_without_interleaving_leaves_the_code_live(db, monkeypatch):
    _failing_merge(monkeypatch)
    with pytest.raises(HTTPException):
        _redeem()
    c = db.tables["claim_codes"][0]
    assert c["redeemed_at"] is None and c["revoked_at"] is None

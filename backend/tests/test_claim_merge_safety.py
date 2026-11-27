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
        self.op, self.values = "upsert", values
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
        if self.op == "upsert":
            same = [r for r in rows if r.get("student_id") == self.values.get("student_id")
                    and r.get("school_id") == self.values.get("school_id")]
            if same:
                same[0].update(self.values)
            else:
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


def _redeem(code="ACME-SS1-ABCDEF12", uid="guest-1", **extra):
    return asyncio.run(claim_account(
        payload=ClaimRequest(code=code, **extra), request=None, current_user={"id": uid}))


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


def test_merge_refused_after_writes_rolls_the_real_user_back(db):
    # The shell is claimed AFTER the pre-write checks, while the real user's
    # writes are being applied: the guarded delete then removes nothing.
    _users(db)["prov-1"].update(student_class="SS2", stream="Science",
                                guardian_consent_at="2026-02-02T00:00:00+00:00")
    _users(db)["guest-1"].update(student_class="JSS3", stream=None, phone="0700")
    db.tables["student_affiliations"] = [
        {"id": "a-shell", "student_id": "prov-1", "school_id": "school-1", "source": "provisioned"}]

    def claim_now(_q):
        _users(db)["prov-1"]["claim_state"] = "claimed"
        db.hooks.pop(("student_affiliations", "upsert"))

    db.hooks[("student_affiliations", "upsert")] = claim_now  # the affiliation upsert
    with pytest.raises(rec.MergeRefused):
        rec.merge_provisioned_into_student(
            provisioned_student_id="prov-1", real_student_id="guest-1",
            school_id="school-1", phone="0801")
    assert "prov-1" in _users(db)
    guest = _users(db)["guest-1"]
    assert (guest["student_class"], guest["stream"], guest["phone"]) == ("JSS3", None, "0700")
    assert guest.get("guardian_consent_at") is None
    # the shell keeps its own affiliation; nothing was left on the guest
    assert [a["student_id"] for a in db.tables["student_affiliations"]] == ["prov-1"]


def test_merge_does_not_write_the_real_user_when_the_shell_is_already_claimed(db):
    _users(db)["prov-1"].update(student_class="SS2")
    _users(db)["prov-1"]["claim_state"] = "claimed"
    with pytest.raises(rec.MergeRefused):
        rec.merge_provisioned_into_student(
            provisioned_student_id="prov-1", real_student_id="guest-1", school_id="school-1")
    assert "student_class" not in _users(db)["guest-1"]
    assert db.tables["student_affiliations"] == []


def test_merge_refuses_when_the_conditional_delete_removes_zero_rows(db):
    # Claimed between the last read and the delete: the delete matches nothing.
    def claim_now(_q):
        _users(db)["prov-1"]["claim_state"] = "claimed"

    db.hooks[("users", "delete")] = claim_now
    with pytest.raises(rec.MergeRefused):
        rec.merge_provisioned_into_student(
            provisioned_student_id="prov-1", real_student_id="guest-1", school_id="school-1")
    assert "prov-1" in _users(db)


def test_claim_route_does_not_say_claimed_when_the_shell_survives(db):
    def claim_now(_q):
        _users(db)["prov-1"]["claim_state"] = "claimed"

    db.hooks[("users", "delete")] = claim_now
    with pytest.raises(HTTPException) as err:
        _redeem()
    assert (err.value.status_code, err.value.detail) == (404, pr._CLAIM_REJECTED)
    assert "prov-1" in _users(db)


def test_merge_retires_the_shell_affiliation_and_codes_only_after_the_delete(db):
    db.tables["student_affiliations"] = [
        {"id": "a-shell", "student_id": "prov-1", "school_id": "school-1", "source": "provisioned"}]
    rec.merge_provisioned_into_student(
        provisioned_student_id="prov-1", real_student_id="guest-1", school_id="school-1")
    assert "prov-1" not in _users(db)
    assert [a["student_id"] for a in db.tables["student_affiliations"]] == ["guest-1"]
    assert db.tables["claim_codes"][0]["revoked_at"] is not None


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


def test_admin_confirm_of_a_claimed_shell_is_a_409_and_retires_the_candidate(db):
    _users(db)["prov-1"]["claim_state"] = "claimed"
    db.tables["student_merge_candidates"] = [{
        "id": "m1", "school_id": "school-1", "status": "pending",
        "provisioned_student_id": "prov-1", "real_student_id": "guest-1"}]
    with pytest.raises(HTTPException) as err:
        asyncio.run(pr.confirm_merge_candidate(
            candidate_id="m1", current_user={"id": "admin"}))
    assert err.value.status_code == 409
    assert "prov-1" in _users(db)
    assert db.tables["student_merge_candidates"][0]["status"] == "dismissed"


# -- regenerate during a redeem -----------------------------------------------
def test_regenerate_refuses_while_a_redeem_is_stamped(db):
    db.tables["claim_codes"][0]["redeemed_at"] = pr._now()  # stamped just now, not yet claimed
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
        db.tables["claim_codes"][0]["redeemed_at"] = pr._now()
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


# -- stale stamps --------------------------------------------------------------
def _old_stamp(minutes=5):
    from datetime import datetime, timedelta, timezone
    return (datetime.now(timezone.utc) - timedelta(minutes=minutes)).isoformat()


def _live(d):
    return [c for c in d.tables["claim_codes"] if not c.get("revoked_at") and not c.get("redeemed_at")]


def test_a_stale_stamp_on_an_unclaimed_shell_is_not_a_claim_in_progress(db):
    # Worker killed between the stamp and the claim_state update.
    db.tables["claim_codes"][0]["redeemed_at"] = _old_stamp()
    assert pr._redeem_in_progress("prov-1") is False
    res = _regen(db)
    old = db.tables["claim_codes"][0]
    assert old["revoked_at"] is not None  # the dead stamped code is revoked
    assert [c["code"] for c in _live(db)] == [res.data["claim_code"]]


def test_a_stamp_just_inside_the_window_still_blocks_regenerate(db):
    db.tables["claim_codes"][0]["redeemed_at"] = _old_stamp(minutes=1)
    assert pr._redeem_in_progress("prov-1") is True
    with pytest.raises(HTTPException) as err:
        _regen(db)
    assert err.value.status_code == 409


def test_an_unparseable_stamp_fails_closed(db):
    db.tables["claim_codes"][0]["redeemed_at"] = "not-a-date"
    assert pr._redeem_in_progress("prov-1") is True


def test_crash_after_stamp_is_healed_by_regenerate_once_the_stamp_ages(db):
    db.tables["claim_codes"][0]["redeemed_at"] = pr._now()  # crash right after the stamp
    with pytest.raises(HTTPException):
        _regen(db)  # inside the window: 409, no new code
    assert len(db.tables["claim_codes"]) == 1
    db.tables["claim_codes"][0]["redeemed_at"] = _old_stamp()  # time passes
    _regen(db)
    assert len(_live(db)) == 1


def test_stamp_regenerate_then_merge_failure_ends_with_one_live_code(db, monkeypatch):
    """Scenario B: redeem stamps A, regenerate inserts B, the merge raises."""
    def merge_raises_after_regenerate(**_kw):
        db.tables["claim_codes"].append(_code(id="cc-2", code="ACME-SS1-NEWCODE12345"))
        # regenerate's recheck revokes B because the stamp is fresh
        db.tables["claim_codes"][1]["revoked_at"] = pr._now()
        raise RuntimeError("merge failed")

    monkeypatch.setattr(pr, "merge_provisioned_into_student", merge_raises_after_regenerate)
    with pytest.raises(HTTPException) as err:
        _redeem()
    assert err.value.status_code == 500
    # No newer LIVE code existed at reopen time, so A is reopened: one live code.
    assert [c["id"] for c in _live(db)] == ["cc-1"]


def test_stamp_regenerate_merge_failure_where_the_reopen_was_skipped_heals_after_the_window(db, monkeypatch):
    """The reopen saw B live and skipped; B was then revoked by regenerate's
    recheck: no live code and a stamped A. After the window it is reissuable."""
    def merge_raises(**_kw):
        db.tables["claim_codes"].append(_code(id="cc-2", code="ACME-SS1-NEWCODE12345"))
        raise RuntimeError("merge failed")

    monkeypatch.setattr(pr, "merge_provisioned_into_student", merge_raises)
    with pytest.raises(HTTPException):
        _redeem()
    old, new = db.tables["claim_codes"]
    new["revoked_at"] = pr._now()  # regenerate's recheck revokes B afterwards
    assert _live(db) == []
    with pytest.raises(HTTPException):
        _regen(db)  # stamp still fresh
    old["redeemed_at"] = _old_stamp()
    res = _regen(db)
    assert [c["code"] for c in _live(db)] == [res.data["claim_code"]]


def test_a_failed_reopen_update_is_logged_at_error_with_the_student_and_heals(db, monkeypatch):
    _failing_merge(monkeypatch)
    errors = []
    monkeypatch.setattr(pr, "log", SimpleNamespace(
        error=lambda msg, *a, **kw: errors.append((msg, kw)),
        warning=lambda *a, **kw: None, info=lambda *a, **kw: None))

    def reopen_fails(q):
        if q.values == {"redeemed_at": None}:
            raise RuntimeError("db down")

    db.hooks[("claim_codes", "update")] = reopen_fails
    with pytest.raises(HTTPException):
        _redeem()
    db.hooks.clear()
    assert db.tables["claim_codes"][0]["redeemed_at"] is not None
    reopen_logs = [kw for msg, kw in errors if "reopen failed" in msg]
    assert reopen_logs and reopen_logs[0]["student_id"] == "prov-1"
    db.tables["claim_codes"][0]["redeemed_at"] = _old_stamp()
    _regen(db)
    assert len(_live(db)) == 1


# -- regenerate ordering --------------------------------------------------------
def test_regenerate_keeps_the_old_code_live_if_the_insert_fails(db):
    def insert_fails(_q):
        raise RuntimeError("insert failed")

    db.hooks[("claim_codes", "insert")] = insert_fails
    with pytest.raises(HTTPException) as err:
        _regen(db)
    assert err.value.status_code == 500
    assert [c["id"] for c in _live(db)] == ["cc-1"]  # the student still has a code


# -- merge vs in-place claim --------------------------------------------------
def test_admin_merge_refuses_a_shell_with_a_fresh_redeem_stamp(db):
    db.tables["claim_codes"][0]["redeemed_at"] = pr._now()  # in-place claim mid-flight
    db.tables["users"].append({"id": "real-1", "claim_state": None})
    with pytest.raises(rec.MergeRefused):
        rec.merge_provisioned_into_student(
            provisioned_student_id="prov-1", real_student_id="real-1", school_id="school-1")
    assert "prov-1" in _users(db)
    assert "student_class" not in _users(db)["real-1"]  # nothing written to the real user


def test_a_stale_redeem_stamp_does_not_block_an_admin_merge(db):
    db.tables["claim_codes"][0]["redeemed_at"] = "2000-01-01T00:00:00+00:00"
    rec.merge_provisioned_into_student(
        provisioned_student_id="prov-1", real_student_id="guest-1", school_id="school-1")
    assert "prov-1" not in _users(db)


def test_a_merges_own_redeem_stamp_does_not_block_it(db):
    db.tables["claim_codes"][0]["redeemed_at"] = pr._now()
    rec.merge_provisioned_into_student(
        provisioned_student_id="prov-1", real_student_id="guest-1", school_id="school-1",
        own_claim_code_id="cc-1")
    assert "prov-1" not in _users(db)


def test_in_place_claim_never_says_claimed_when_the_shell_vanished(db):
    # An admin merge deletes the shell between the stamp and the claim update.
    def merge_lands(_q):
        db.tables["users"][:] = [u for u in db.tables["users"] if u["id"] != "prov-1"]
        db.hooks.pop(("users", "update"))

    db.hooks[("users", "update")] = merge_lands
    with pytest.raises(HTTPException) as err:
        _redeem(uid="prov-1", phone="0801")
    assert (err.value.status_code, err.value.detail) == (404, pr._CLAIM_REJECTED)
    assert db.tables["claim_codes"][0]["redeemed_at"] is None  # code reopened


def test_in_place_claim_still_succeeds_for_a_present_shell(db):
    res = _redeem(uid="prov-1", phone="0801")
    assert res.data == {"claimed": True, "school_id": "school-1"}
    assert _users(db)["prov-1"]["claim_state"] == "claimed"


# -- concurrent regenerates ---------------------------------------------------
def _live(db):
    return [c for c in db.tables["claim_codes"] if not c.get("redeemed_at") and not c.get("revoked_at")]


def test_concurrent_regenerates_leave_the_newest_code_live(db):
    # Another admin's regenerate inserts a NEWER code right after ours.
    def rival_inserts(q):
        if q.values and q.values.get("id") == "pending":
            return
        db.hooks.pop(("claim_codes", "insert"))
        db.tables["claim_codes"].append(_code(
            id="cc-rival", code="ACME-SS1-RIVAL000",
            created_at="2999-01-01T00:00:00+00:00"))

    db.hooks[("claim_codes", "insert")] = rival_inserts
    res = _regen(db)
    live = _live(db)
    assert {c["id"] for c in live} == {"cc-rival", next(
        c["id"] for c in db.tables["claim_codes"] if c["code"] == res.data["claim_code"])}
    # the original code is retired; neither new code was revoked by the other
    assert db.tables["claim_codes"][0]["revoked_at"] is not None


def test_retire_does_not_revoke_a_newer_code(db):
    db.tables["claim_codes"] = [
        _code(id="old", created_at="2026-01-01T00:00:00+00:00"),
        _code(id="mine", code="MINE", created_at="2026-01-02T00:00:00+00:00"),
        _code(id="newer", code="NEWER", created_at="2026-01-03T00:00:00+00:00"),
    ]
    pr._retire_superseded_codes("prov-1", "mine")
    assert {c["id"] for c in _live(db)} == {"mine", "newer"}


# -- affiliation rollback -------------------------------------------------------
def test_rollback_restores_a_pre_existing_affiliations_fields(db):
    db.tables["student_affiliations"] = [
        {"id": "a-real", "student_id": "guest-1", "school_id": "school-1",
         "source": "school_code", "self_reported": True}]

    def claim_now(_q):
        _users(db)["prov-1"]["claim_state"] = "claimed"

    db.hooks[("users", "delete")] = claim_now
    with pytest.raises(rec.MergeRefused):
        rec.merge_provisioned_into_student(
            provisioned_student_id="prov-1", real_student_id="guest-1", school_id="school-1")
    aff = [a for a in db.tables["student_affiliations"] if a["student_id"] == "guest-1"]
    assert len(aff) == 1
    assert (aff[0]["source"], aff[0]["self_reported"]) == ("school_code", True)

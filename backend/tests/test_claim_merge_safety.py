"""Claim merge safety: a claimed account is never merged away, a mid-redeem
account is never reissued a code, and a reopened code never sits next to a new one."""
import asyncio
from datetime import UTC, datetime, timedelta
from types import SimpleNamespace

import pytest
from fastapi import HTTPException

import routes.provisioning_routes as pr
import services.provisioning_reconcile as rec
from routes.provisioning_routes import ClaimRequest, claim_account

FUTURE = "2999-01-01T00:00:00+00:00"


def _ts(**delta):
    """A timestamp relative to now (no hardcoded calendar dates)."""
    return (datetime.now(UTC) + timedelta(**delta)).isoformat()


class _Q:
    def __init__(self, db, name):
        self.db, self.name = db, name
        self.filters, self.op, self.values = [], "select", None
        self.orders, self.max = [], None

    def order(self, col, desc=False):
        self.orders.append((col, desc))
        return self

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

    def limit(self, n):
        self.max = n
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
        if self.op == "select":
            for col, desc in reversed(self.orders):  # stable multi-key sort
                hit.sort(key=lambda r, c=col: str(r.get(c) or ""), reverse=desc)
            if self.max is not None:
                hit = hit[: self.max]
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
    assert len(pr.claim_limiter._events["user:prov-1"]) == 1  # counted like any rejection


def test_in_place_claim_still_succeeds_for_a_present_shell(db):
    res = _redeem(uid="prov-1", phone="0801")
    assert res.data == {"claimed": True, "school_id": "school-1"}
    assert _users(db)["prov-1"]["claim_state"] == "claimed"


# -- concurrent regenerates ---------------------------------------------------
def _live(db):
    return [c for c in db.tables["claim_codes"] if not c.get("redeemed_at") and not c.get("revoked_at")]


def test_concurrent_regenerates_leave_exactly_the_newest_code_live(db):
    # Another admin's regenerate inserts a NEWER code right after ours, and its
    # retire already ran: without a re-read both would stay live.
    def rival_inserts(q):
        if q.values and q.values.get("id") == "pending":
            return
        db.hooks.pop(("claim_codes", "insert"))
        db.tables["claim_codes"].append(_code(
            id="cc-rival", code="ACME-SS1-RIVAL000", created_at=_ts(seconds=30)))

    db.hooks[("claim_codes", "insert")] = rival_inserts
    with pytest.raises(HTTPException) as err:
        _regen(db)  # we lost: our code is revoked, so it is not returned
    assert err.value.status_code == 409
    assert [c["id"] for c in _live(db)] == ["cc-rival"]
    assert db.tables["claim_codes"][0]["revoked_at"] is not None


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


# -- retire: insert-order inversion, ties, bad created_at, paging ---------------
def test_retire_winner_revokes_the_loser_that_missed_its_insert(db):
    # Racer B (older created_at) committed and retired before A's insert was
    # visible; A (newest) now retires and must not leave B live.
    db.tables["claim_codes"] = [
        _code(id="old", created_at=_ts(days=-2)),
        _code(id="b", code="B", created_at=_ts(seconds=-5)),
        _code(id="a", code="A", created_at=_ts(seconds=-1)),
    ]
    assert pr._retire_superseded_codes("prov-1", "a") is True
    assert [c["id"] for c in _live(db)] == ["a"]


def test_retire_loser_revokes_its_own_code(db):
    db.tables["claim_codes"] = [
        _code(id="old", created_at=_ts(days=-2)),
        _code(id="mine", code="MINE", created_at=_ts(seconds=-5)),
        _code(id="newer", code="NEWER", created_at=_ts(seconds=-1)),
    ]
    assert pr._retire_superseded_codes("prov-1", "mine") is False
    assert [c["id"] for c in _live(db)] == ["newer"]


def test_retire_ties_break_deterministically_by_id_from_either_racer(db):
    same = _ts(minutes=-1)
    for runner in ("a", "b"):
        db.tables["claim_codes"] = [
            _code(id="a", code="A", created_at=same), _code(id="b", code="B", created_at=same)]
        pr._retire_superseded_codes("prov-1", runner)
        assert [c["id"] for c in _live(db)] == ["b"]


def test_retire_known_older_codes_go_even_when_their_clock_is_ahead(db):
    # Skew: a pre-existing code carries a database timestamp later than ours.
    db.tables["claim_codes"] = [
        _code(id="old", created_at=_ts(minutes=10)),
        _code(id="mine", code="MINE", created_at=_ts()),
    ]
    assert pr._retire_superseded_codes("prov-1", "mine", {"old"}) is True
    assert [c["id"] for c in _live(db)] == ["mine"]


@pytest.mark.parametrize("a_first", [True, False])
def test_skewed_racers_with_both_snapshots_leave_exactly_one_live_code(db, a_first):
    # O is live. B (clock ~10s ahead) inserts first. A snapshots known_older
    # AFTER B's insert (so it contains O and B), inserts, and both retire.
    db.tables["claim_codes"] = [
        _code(id="o", code="O", created_at=_ts(days=-2)),
        _code(id="b", code="B", created_at=_ts(seconds=10)),
        _code(id="a", code="A", created_at=_ts()),
    ]
    a_snap, b_snap = {"o", "b"}, {"o"}

    def run_a():
        return pr._retire_superseded_codes("prov-1", "a", a_snap)

    def run_b():
        return pr._retire_superseded_codes("prov-1", "b", b_snap)

    if a_first:
        a_ok, b_ok = run_a(), run_b()
    else:
        b_ok, a_ok = run_b(), run_a()
    live = [c["id"] for c in _live(db)]
    assert len(live) == 1
    # Exactly one racer is told success and it owns the live code; the other
    # gets False (the route turns that into the 409 "reissued at the same time").
    assert (a_ok, b_ok).count(True) == 1
    assert live == ["a" if a_ok else "b"]


def test_retire_never_reopens_a_code_revoked_by_someone_else(db):
    # No live code and nothing revoked by this call: a code that was revoked
    # for a reason elsewhere must stay revoked.
    db.tables["claim_codes"] = [
        _code(id="x", code="X", created_at=_ts(days=-1), revoked_at=_ts(minutes=-5)),
        _code(id="mine", code="MINE", created_at=_ts(), revoked_at=_ts(minutes=-1)),
    ]
    assert pr._retire_superseded_codes("prov-1", "mine") is False
    assert _live(db) == []


def test_retire_reopens_only_the_code_it_revoked_not_an_earlier_revoke(db):
    # keep was revoked by a racer; this call revokes "old"; "gone" was revoked
    # earlier by someone else and must not come back.
    db.tables["claim_codes"] = [
        _code(id="gone", code="G", created_at=_ts(days=-3), revoked_at=_ts(days=-1)),
        _code(id="old", code="OLD", created_at=_ts(days=-2)),
        _code(id="mine", code="MINE", created_at=_ts(), revoked_at=_ts(seconds=-1)),
    ]
    assert pr._retire_superseded_codes("prov-1", "mine", {"old"}) is False
    assert [c["id"] for c in _live(db)] == ["old"]


def test_retire_with_an_unparseable_keep_created_at_never_mass_revokes(db):
    for bad in (None, "not-a-date"):
        db.tables["claim_codes"] = [
            _code(id="n1", code="N1", created_at=_ts(days=-1)),
            _code(id="mine", code="MINE", created_at=bad),
            _code(id="n2", code="N2", created_at=_ts(days=-2)),
        ]
        pr._retire_superseded_codes("prov-1", "mine")
        # Exactly one live code remains and it is the newest parseable one,
        # not an empty set and not "everything but keep".
        assert [c["id"] for c in _live(db)] == ["n1"]


def test_retire_with_keep_outside_the_page_revokes_nothing(db, monkeypatch):
    db.tables["claim_codes"] = [
        _code(id="a", code="A", created_at=_ts(days=-1)),
        _code(id="b", code="B", created_at=_ts(days=-2)),
    ]
    warnings = []
    monkeypatch.setattr(pr, "log", SimpleNamespace(
        warning=lambda msg, *a, **kw: warnings.append(msg),
        error=lambda *a, **kw: None, info=lambda *a, **kw: None))
    assert pr._retire_superseded_codes("prov-1", "missing") is True
    assert {c["id"] for c in _live(db)} == {"a", "b"}
    assert warnings


def test_student_codes_are_read_newest_first(db):
    db.tables["claim_codes"] = [
        _code(id="a", created_at=_ts(days=-2)), _code(id="b", created_at=_ts(days=-1))]
    assert [r["id"] for r in pr._student_codes("prov-1")] == ["b", "a"]


# -- in-progress merge refusal is transient --------------------------------------
def test_admin_confirm_during_an_in_progress_claim_is_a_409_and_keeps_the_candidate(db):
    db.tables["claim_codes"][0]["redeemed_at"] = pr._now()  # student's claim mid-flight
    db.tables["student_merge_candidates"] = [{
        "id": "m1", "school_id": "school-1", "status": "pending",
        "provisioned_student_id": "prov-1", "real_student_id": "guest-1"}]
    with pytest.raises(HTTPException) as err:
        asyncio.run(pr.confirm_merge_candidate(
            candidate_id="m1", current_user={"id": "admin"}))
    assert err.value.status_code == 409
    assert "in progress" in err.value.detail
    assert db.tables["student_merge_candidates"][0]["status"] == "pending"
    assert "prov-1" in _users(db)


def test_merge_in_progress_is_a_merge_refused_subclass():
    assert issubclass(rec.MergeInProgress, rec.MergeRefused)


def test_claim_merge_blocked_by_another_fresh_stamp_reopens_own_code_and_is_not_counted(db):
    # The shell's other code is stamped by a different redeemer, mid-flight.
    db.tables["claim_codes"] = [
        _code(id="cc-1"),
        _code(id="cc-other", code="OTHER", redeemed_at=pr._now()),
    ]
    with pytest.raises(HTTPException) as err:
        _redeem()
    assert (err.value.status_code, err.value.detail) == (404, pr._CLAIM_REJECTED)
    assert db.tables["claim_codes"][0]["redeemed_at"] is None  # own code reopened
    assert db.tables["claim_codes"][1]["redeemed_at"] is not None  # theirs untouched
    assert pr.claim_limiter._events == {}  # not a failed guess
    assert "prov-1" in _users(db)

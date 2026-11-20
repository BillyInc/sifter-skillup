"""Fixes from the independent review of the institution-admin-authz PR.

Each test pins one reviewed finding:

B1  an existing member cannot change their own role, seat or verified flag by
    re-posting /verify (and a suspended or revoked member cannot reactivate)
B2  a school nobody administers yet (seeded registry rows, all members revoked)
    is claimed only as a PENDING seat: no roster, login-card, delete or invite
    rights until a reviewer activates it
M3  an invitation is consumed with a conditional update, so it cannot be used
    twice or after another request already took it; a failed consume fails the
    join instead of leaving a reusable invitation
M4  revoked seats stay revoked: the "older schema" fallback runs only on a real
    missing-column error, never when the first lookup is simply empty
M5  invitation by an authorised admin marks the new member verified; anyone
    else stays unverified; a verified member is never demoted by re-submitting
minor  rate limiter keys are evicted and capped; invitations are found by email
       rather than by scanning the first 200 rows
"""
import asyncio
from datetime import datetime, timedelta, timezone

import pytest
from fastapi import HTTPException

import routes.institutions_routes as ir
import routes.provisioning_routes as pr
from avatar_storage import UploadRateLimiter


class _Result:
    def __init__(self, data):
        self.data = data


class _Query:
    def __init__(self, svc, table):
        self._svc = svc
        self._table = table
        self._filters = []
        self._mode = "select"
        self._payload = None
        self._limit = None

    def select(self, *_a, **_k):
        self._mode = "select"
        return self

    def insert(self, payload):
        self._mode = "insert"
        self._payload = payload
        return self

    def update(self, payload):
        self._mode = "update"
        self._payload = payload
        return self

    def eq(self, column, value):
        self._filters.append(("eq", column, value))
        return self

    def neq(self, column, value):
        self._filters.append(("neq", column, value))
        return self

    def in_(self, column, values):
        self._filters.append(("in", column, list(values)))
        return self

    def ilike(self, column, value):
        self._filters.append(("ilike", column, value))
        return self

    def order(self, *_a, **_k):
        return self

    def limit(self, n):
        self._limit = n
        return self

    def _matches(self, row):
        for op, column, value in self._filters:
            have = row.get(column)
            if op == "eq" and have != value:
                return False
            if op == "neq" and have == value:
                return False
            if op == "in" and have not in value:
                return False
            if op == "ilike":
                wanted = str(value).replace("\\", "")
                if str(have or "").casefold() != wanted.casefold():
                    return False
        return True

    def execute(self):
        failure = self._svc.fail(self._table, self._mode, self._filters)
        if failure is not None:
            raise failure
        rows = self._svc.store.setdefault(self._table, [])
        if self._mode == "insert":
            row = dict(self._payload)
            row.setdefault("id", f"{self._table}-{len(rows) + 1}")
            rows.append(row)
            return _Result([dict(row)])
        matched = [r for r in rows if self._matches(r)]
        if self._mode == "update":
            for row in matched:
                row.update(self._payload)
            return _Result([dict(r) for r in matched])
        if self._limit is not None:
            matched = matched[: self._limit]
        return _Result([dict(r) for r in matched])


class _FakeSvc:
    def __init__(self):
        self.store = {}
        self.fail = lambda table, mode, filters: None

    def table(self, name):
        return _Query(self, name)


@pytest.fixture
def svc(monkeypatch):
    fake = _FakeSvc()
    monkeypatch.setattr(ir, "_svc", lambda: fake)
    monkeypatch.setattr(pr, "_svc", lambda: fake)
    monkeypatch.setattr(ir, "_require_school_identity_schema", lambda _svc: None)
    return fake


def _future(hours=24):
    return (datetime.now(timezone.utc) + timedelta(hours=hours)).isoformat()


GRANT = "2026-01-01T00:00:00+00:00"


def _user(uid, email=None):
    return {"id": uid, "email": email or f"{uid}@example.com", "admin_access_granted_at": GRANT}


def _school(svc, school_id="school-b", name="School B", address="1 Main Street, Lagos"):
    svc.store.setdefault("schools", []).append(
        {"id": school_id, "name": name, "institution_type": "secondary_school",
         "address": address, "school_code": f"CODE-{school_id}"}
    )


def _member(svc, uid, school_id="school-b", role="owner", seat="active", verified=True, invited_by=None):
    svc.store.setdefault("institution_members", []).append(
        {"id": f"m-{uid}-{school_id}", "user_id": uid, "school_id": school_id, "role": role,
         "seat_status": seat, "verified": verified, "invited_by": invited_by}
    )


def _members(svc, uid):
    return [m for m in svc.store.get("institution_members", []) if m["user_id"] == uid]


def _claim(**over):
    base = dict(
        organization_id="school-b", organization_type="secondary_school",
        organization_name="School B", address="1 Main Street, Lagos", role="owner",
    )
    base.update(over)
    return ir.VerificationClaim(**base)


def _verify(claim, user):
    return asyncio.run(ir.submit_verification(claim, user))


# --- B1: no self-escalation by an existing member --------------------------

class TestExistingMemberCannotEscalate:
    def test_role_seat_and_verified_are_kept(self, svc):
        _school(svc)
        _member(svc, "owner")
        _member(svc, "counsellor", role="counsellor", verified=True)
        _verify(_claim(role="owner"), _user("counsellor"))
        row = _members(svc, "counsellor")[0]
        assert row["role"] == "counsellor"
        assert row["verified"] is True  # a verified member is not demoted either
        assert row["seat_status"] == "active"

    def test_account_type_follows_the_stored_role_not_the_body(self, svc):
        _school(svc)
        _member(svc, "owner")
        _member(svc, "counsellor", role="counsellor", verified=False)
        _verify(_claim(role="owner", account_type="institution_admin"), _user("counsellor"))
        updates = [u for u in svc.store.get("users", [])]
        # whatever was written to the user row must not be the admin persona
        assert all(u.get("account_type") != "institution_admin" for u in updates)

    @pytest.mark.parametrize("seat", ["suspended", "revoked"])
    def test_suspended_or_revoked_member_cannot_reactivate(self, svc, seat):
        _school(svc)
        _member(svc, "owner")
        _member(svc, "removed", role="owner", seat=seat, verified=True)
        with pytest.raises(HTTPException) as exc:
            _verify(_claim(role="owner"), _user("removed"))
        assert exc.value.status_code in (403, 409)
        assert _members(svc, "removed")[0]["seat_status"] == seat


# --- B2: unowned schools are claimed as pending seats ----------------------

class TestUnownedSchoolIsPendingOnly:
    def test_first_claimant_of_a_seeded_school_gets_a_pending_seat(self, svc):
        _school(svc)
        _verify(_claim(role="owner"), _user("squatter"))
        row = _members(svc, "squatter")[0]
        assert row["seat_status"] == "invited"
        assert row["verified"] is False

    def test_pending_seat_grants_no_admin_scope(self, svc):
        _school(svc)
        _verify(_claim(role="owner"), _user("squatter"))
        user = _user("squatter")
        assert ir._membership_for_user(user) is None
        assert ir._resolve_org(user) is None
        assert pr._resolve_school_id(user) is None
        assert pr._resolve_school_id(user, "school-b") is None
        # ... but the pending claimant can still submit proof for review
        assert ir._membership_for_user(user, include_pending=True)["school_id"] == "school-b"

    def test_pending_seat_cannot_invite_others(self):
        member = {"role": "owner", "seat_status": "invited"}
        assert ir._can_invite_members(member, {"account_type": "educator"}) is False

    def test_a_second_claimant_is_not_locked_out_by_the_first(self, svc):
        _school(svc)
        _verify(_claim(role="owner"), _user("squatter"))
        _verify(_claim(role="owner"), _user("real-owner"))  # no 409
        assert _members(svc, "real-owner")[0]["seat_status"] == "invited"

    def test_pending_claimants_do_not_count_as_administrators(self, svc):
        _school(svc)
        _member(svc, "squatter", seat="invited", verified=False)
        assert ir._authorize_join(_user("real-owner"), "school-b") is None

    def test_creator_of_a_brand_new_school_is_active(self, svc):
        _verify(
            _claim(organization_id=None, organization_name="Brand New Academy",
                   address="12 New Road, Abuja"),
            _user("founder"),
        )
        row = _members(svc, "founder")[0]
        assert row["seat_status"] == "active"
        assert ir._membership_for_user(_user("founder"))["school_id"] == row["school_id"]

    def test_school_whose_members_were_all_revoked_is_pending_only(self, svc):
        _school(svc)
        _member(svc, "old-owner", seat="revoked")
        _verify(_claim(role="owner"), _user("newcomer"))
        assert _members(svc, "newcomer")[0]["seat_status"] == "invited"


# --- M3: invitation consumption is atomic ----------------------------------

class TestInviteConsumption:
    def _invite(self, svc, invited_by="owner", status="pending", email="guest@example.com"):
        svc.store.setdefault("institution_member_invites", []).append(
            {"id": "inv-1", "school_id": "school-b", "invited_email": email, "role": "counsellor",
             "status": status, "expires_at": _future(), "invited_by": invited_by}
        )

    def test_invite_is_consumed_once(self, svc):
        _school(svc)
        _member(svc, "owner")
        self._invite(svc)
        _verify(_claim(role="owner"), _user("guest", "guest@example.com"))
        assert svc.store["institution_member_invites"][0]["status"] == "accepted"
        row = _members(svc, "guest")[0]
        assert row["role"] == "counsellor" and row["seat_status"] == "active"

    def test_invite_already_taken_between_read_and_consume_is_refused(self, svc, monkeypatch):
        _school(svc)
        _member(svc, "owner")
        self._invite(svc, status="accepted")
        stale = dict(svc.store["institution_member_invites"][0], status="pending")
        monkeypatch.setattr(ir, "_invite_for_user", lambda user, school_id: stale)
        with pytest.raises(HTTPException) as exc:
            _verify(_claim(role="owner"), _user("guest", "guest@example.com"))
        assert exc.value.status_code == 409
        assert _members(svc, "guest") == []

    def test_a_failed_consume_fails_the_join(self, svc):
        _school(svc)
        _member(svc, "owner")
        self._invite(svc)

        def fail(table, mode, filters):
            if table == "institution_member_invites" and mode == "update":
                return RuntimeError("database unavailable")
            return None

        svc.fail = fail
        with pytest.raises(HTTPException) as exc:
            _verify(_claim(role="owner"), _user("guest", "guest@example.com"))
        assert exc.value.status_code == 503
        assert _members(svc, "guest") == []
        assert svc.store["institution_member_invites"][0]["status"] == "pending"

    def test_invite_is_restored_when_the_member_row_cannot_be_written(self, svc):
        _school(svc)
        _member(svc, "owner")
        self._invite(svc)

        def fail(table, mode, filters):
            if table == "institution_members" and mode == "insert":
                return RuntimeError("write failed")
            return None

        svc.fail = fail
        try:
            _verify(_claim(role="owner"), _user("guest", "guest@example.com"))
        except Exception:
            pass
        assert svc.store["institution_member_invites"][0]["status"] == "pending"

    def test_invitation_is_found_by_email_not_by_scanning_200_rows(self, svc):
        _school(svc)
        svc.store["institution_member_invites"] = [
            {"id": f"inv-{i}", "school_id": "school-b", "invited_email": f"other{i}@example.com",
             "role": "counsellor", "status": "pending", "expires_at": _future(), "invited_by": "owner"}
            for i in range(300)
        ] + [
            {"id": "inv-target", "school_id": "school-b", "invited_email": "Guest@Example.com",
             "role": "counsellor", "status": "pending", "expires_at": _future(), "invited_by": "owner"}
        ]
        found = ir._pending_invite(svc, "school-b", "guest@example.com")
        assert found and found["id"] == "inv-target"


# --- M5: verified follows who invited --------------------------------------

class TestInviteVerifiedFlag:
    def _invite(self, svc, invited_by):
        svc.store.setdefault("institution_member_invites", []).append(
            {"id": "inv-1", "school_id": "school-b", "invited_email": "guest@example.com",
             "role": "counsellor", "status": "pending", "expires_at": _future(), "invited_by": invited_by}
        )

    def test_invited_by_an_authorised_admin_is_verified(self, svc):
        _school(svc)
        svc.store["schools"][0]["verification_status"] = "verified"  # third review round, F1
        _member(svc, "owner", role="owner", verified=True)
        self._invite(svc, "owner")
        _verify(_claim(), _user("guest", "guest@example.com"))
        assert _members(svc, "guest")[0]["verified"] is True

    # An invitation from someone without admin authority, or from an admin who no
    # longer holds an active seat, is no longer merely "unverified": it is refused
    # and voided (second review round, finding R1).
    def test_invited_by_someone_without_authority_is_refused(self, svc):
        _school(svc)
        _member(svc, "owner", role="owner", verified=True)
        _member(svc, "viewer", role="data_viewer", verified=True)
        self._invite(svc, "viewer")
        with pytest.raises(HTTPException) as exc:
            _verify(_claim(), _user("guest", "guest@example.com"))
        assert exc.value.status_code == 403
        assert _members(svc, "guest") == []

    def test_invited_by_a_revoked_admin_is_refused(self, svc):
        _school(svc)
        _member(svc, "owner", role="owner", verified=True)
        _member(svc, "gone", role="owner", seat="revoked", verified=True)
        self._invite(svc, "gone")
        with pytest.raises(HTTPException) as exc:
            _verify(_claim(), _user("guest", "guest@example.com"))
        assert exc.value.status_code == 403
        assert _members(svc, "guest") == []


# --- M4: revoked seats stay revoked ----------------------------------------

class TestRevokedMembersKeepNoAccess:
    def test_institutions_lookup_does_not_fall_back_to_the_revoked_row(self, svc):
        _school(svc)
        _member(svc, "ex-admin", seat="revoked")
        assert ir._membership_for_user(_user("ex-admin")) is None
        assert ir._resolve_org(_user("ex-admin")) is None

    def test_provisioning_lookup_does_not_fall_back_to_the_revoked_row(self, svc):
        _school(svc)
        _member(svc, "ex-admin", seat="revoked")
        assert pr._resolve_school_id(_user("ex-admin")) is None

    def test_suspended_seat_has_no_scope(self, svc):
        _school(svc)
        _member(svc, "paused", seat="suspended")
        assert pr._resolve_school_id(_user("paused")) is None
        assert pr._resolve_school_id(_user("paused"), "school-b") is None

    def test_old_schema_without_seat_status_still_works(self, svc):
        _school(svc)
        svc.store["institution_members"] = [
            {"id": "m1", "user_id": "legacy", "school_id": "school-b", "role": "educator", "verified": True}
        ]

        def fail(table, mode, filters):
            if table == "institution_members" and any(f[1] == "seat_status" for f in filters):
                return Exception("column institution_members.seat_status does not exist")
            return None

        svc.fail = fail
        user = _user("legacy")
        assert ir._membership_for_user(user)["school_id"] == "school-b"
        assert pr._resolve_school_id(user) == "school-b"

    def test_other_database_errors_fail_closed(self, svc):
        _school(svc)
        _member(svc, "owner")

        def fail(table, mode, filters):
            if table == "institution_members":
                return Exception("connection reset by peer")
            return None

        svc.fail = fail
        assert ir._membership_for_user(_user("owner")) is None
        assert pr._resolve_school_id(_user("owner")) is None


# --- minor: limiter eviction and cap ---------------------------------------

class TestLimiterMemory:
    def test_checking_a_key_never_creates_it(self):
        limiter = UploadRateLimiter()
        for i in range(2000):
            assert limiter.check(f"ip-{i}") is None
        assert len(limiter._events) == 0

    def test_expired_keys_are_deleted(self):
        now = [1000.0]
        limiter = UploadRateLimiter(limits=((60, 2, "minute"),), clock=lambda: now[0])
        limiter.record("a")
        assert limiter.check("a") is None
        now[0] += 120
        assert limiter.check("a") is None
        assert "a" not in limiter._events

    def test_total_keys_are_capped(self):
        limiter = UploadRateLimiter(limits=((3600, 5, "hour"),), max_keys=100)
        for i in range(1000):
            limiter.record(f"user-{i}")
        assert len(limiter._events) <= 100

    def test_limits_still_work(self):
        now = [0.0]
        limiter = UploadRateLimiter(limits=((60, 2, "minute"),), clock=lambda: now[0])
        limiter.record("a")
        limiter.record("a")
        assert limiter.check("a") is not None
        now[0] += 61
        assert limiter.check("a") is None

"""Second review round of the institution-admin-authz PR.

Each test pins one finding:

R1  an invitation is only honoured while its inviter still holds an active
    admin seat; otherwise it is refused and voided
R2  an invitation never lowers an existing member's role, and nobody can invite
    their own address (or anyone) as `owner` unless they are an active owner
R3  analytics scope needs an ACTIVE seat, not merely "not revoked"
R6  a pending claimant is stored with the least-privileged role, can still
    submit proof, sees only its own submission, and never overwrites an
    already-decided school verification status
R8  provisioning routes enforce a role allow-list, not just "has an active seat"
"""
import asyncio

import pytest
from fastapi import HTTPException

import routes.institutions_routes as ir
import routes.provisioning_routes as pr
import tests.test_institution_review_fixes as base
from tests.test_institution_review_fixes import (
    _claim,
    _future,
    _member,
    _members,
    _school,
    _user,
    _verify,
)


@pytest.fixture
def svc(monkeypatch):
    fake = base._FakeSvc()
    monkeypatch.setattr(ir, "_svc", lambda: fake)
    monkeypatch.setattr(pr, "_svc", lambda: fake)
    monkeypatch.setattr(ir, "_require_school_identity_schema", lambda _svc: None)
    return fake


def _invite(svc, invited_by, role="counsellor", email="guest@example.com", inv_id="inv-1"):
    svc.store.setdefault("institution_member_invites", []).append(
        {"id": inv_id, "school_id": "school-b", "invited_email": email, "role": role,
         "status": "pending", "expires_at": _future(), "invited_by": invited_by}
    )


# --- R1: the inviter must still be an active admin --------------------------

class TestInviterMustStillBeAuthorised:
    @pytest.mark.parametrize("seat", ["revoked", "suspended", "invited"])
    def test_invite_from_a_removed_admin_is_refused_and_voided(self, svc, seat):
        _school(svc)
        _member(svc, "owner")
        _member(svc, "gone", role="admin", seat=seat)
        _invite(svc, invited_by="gone")
        with pytest.raises(HTTPException) as exc:
            _verify(_claim(role="owner"), _user("guest", "guest@example.com"))
        assert exc.value.status_code in (403, 409)
        assert _members(svc, "guest") == []
        assert svc.store["institution_member_invites"][0]["status"] == "revoked"

    def test_invite_from_a_deleted_inviter_is_refused(self, svc):
        _school(svc)
        _member(svc, "owner")
        _invite(svc, invited_by=None)
        with pytest.raises(HTTPException) as exc:
            _verify(_claim(role="owner"), _user("guest", "guest@example.com"))
        assert exc.value.status_code in (403, 409)
        assert _members(svc, "guest") == []

    def test_invite_from_a_non_admin_member_is_refused(self, svc):
        _school(svc)
        _member(svc, "owner")
        _member(svc, "viewer", role="data_viewer")
        _invite(svc, invited_by="viewer")
        with pytest.raises(HTTPException):
            _verify(_claim(role="owner"), _user("guest", "guest@example.com"))
        assert _members(svc, "guest") == []

    def test_invite_from_an_active_admin_still_works(self, svc):
        _school(svc)
        svc.store["schools"][0]["verification_status"] = "verified"  # third review round, F1
        _member(svc, "owner")
        _member(svc, "adm", role="admin")
        _invite(svc, invited_by="adm")
        _verify(_claim(role="owner"), _user("guest", "guest@example.com"))
        row = _members(svc, "guest")[0]
        assert row["role"] == "counsellor" and row["seat_status"] == "active"
        assert row["verified"] is True


# --- R2: no downgrade, no self-promotion via invites -----------------------

class TestInvitesCannotChangeRolesUpwardsOrDownwards:
    def test_invite_does_not_downgrade_an_existing_owner(self, svc):
        _school(svc)
        _member(svc, "owner")
        _member(svc, "boss", role="owner")
        _invite(svc, invited_by="owner", role="data_viewer", email="boss@example.com")
        _verify(_claim(role="owner"), _user("boss", "boss@example.com"))
        assert _members(svc, "boss")[0]["role"] == "owner"

    def test_admin_cannot_invite_their_own_address_as_owner(self, svc):
        _school(svc)
        _member(svc, "owner")
        _member(svc, "adm", role="admin")
        _invite(svc, invited_by="adm", role="owner", email="adm@example.com")
        try:
            _verify(_claim(role="owner"), _user("adm", "adm@example.com"))
        except HTTPException:
            pass
        assert _members(svc, "adm")[0]["role"] == "admin"

    def test_only_an_active_owner_can_issue_an_owner_invite(self, svc):
        _school(svc)
        _member(svc, "owner")
        _member(svc, "adm", role="admin")
        _invite(svc, invited_by="adm", role="owner", email="guest@example.com")
        with pytest.raises(HTTPException):
            _verify(_claim(role="owner"), _user("guest", "guest@example.com"))
        assert _members(svc, "guest") == []

    def test_an_active_owner_can_still_invite_an_owner(self, svc):
        _school(svc)
        _member(svc, "owner")
        _invite(svc, invited_by="owner", role="owner", email="guest@example.com")
        _verify(_claim(role="owner"), _user("guest", "guest@example.com"))
        assert _members(svc, "guest")[0]["role"] == "owner"

    def test_invite_does_not_lower_a_higher_ranked_member_to_admin(self, svc):
        _school(svc)
        _member(svc, "owner")
        _member(svc, "boss", role="owner")
        _invite(svc, invited_by="owner", role="admin", email="boss@example.com")
        _verify(_claim(role="owner"), _user("boss", "boss@example.com"))
        assert _members(svc, "boss")[0]["role"] == "owner"


# --- R3: analytics scope needs an ACTIVE seat ------------------------------

class _AnalyticsQuery:
    def __init__(self, rows):
        self.rows = rows
        self.filters = []

    def select(self, *_a, **_k):
        return self

    def eq(self, k, v):
        self.filters.append(("eq", k, v))
        return self

    def neq(self, k, v):
        self.filters.append(("neq", k, v))
        return self

    def in_(self, k, vs):
        self.filters.append(("in", k, list(vs)))
        return self

    def order(self, *_a, **_k):
        return self

    def limit(self, *_a, **_k):
        return self

    def execute(self):
        out = []
        for row in self.rows:
            ok = True
            for op, k, v in self.filters:
                have = row.get(k)
                if (op == "eq" and have != v) or (op == "neq" and have == v) or (op == "in" and have not in v):
                    ok = False
            if ok:
                out.append(dict(row))
        from types import SimpleNamespace
        return SimpleNamespace(data=out)


class _AnalyticsSvc:
    def __init__(self, members, schools):
        self.members, self.schools = members, schools

    def table(self, name):
        return _AnalyticsQuery(self.members if name == "institution_members" else self.schools)


@pytest.mark.parametrize("seat", ["invited", "suspended", "revoked"])
def test_analytics_scope_ignores_non_active_seats(monkeypatch, seat):
    import routes.learning_analytics_routes as la

    svc = _AnalyticsSvc(
        [{"user_id": "u1", "school_id": "s1", "role": "owner", "seat_status": seat, "verified": True}],
        [{"id": "s1", "name": "S1", "institution_type": "secondary_school"}],
    )
    monkeypatch.setattr(la, "_service", lambda: svc)
    assert la._verified_school_memberships("u1") == []


def test_analytics_scope_keeps_active_verified_seats(monkeypatch):
    import routes.learning_analytics_routes as la

    svc = _AnalyticsSvc(
        [{"user_id": "u1", "school_id": "s1", "role": "owner", "seat_status": "active", "verified": True}],
        [{"id": "s1", "name": "S1", "institution_type": "secondary_school"}],
    )
    monkeypatch.setattr(la, "_service", lambda: svc)
    assert [m["school_id"] for m in la._verified_school_memberships("u1")] == ["s1"]


# --- R6: pending claimants ------------------------------------------------

class TestPendingClaimant:
    def test_pending_seat_is_stored_with_the_least_privileged_role(self, svc):
        _school(svc)
        _verify(_claim(role="owner"), _user("squatter"))
        row = _members(svc, "squatter")[0]
        assert row["seat_status"] == "invited"
        assert row["role"] == "educator"

    def test_pending_seat_can_still_pass_the_proof_role_gate(self, svc):
        _school(svc)
        _verify(_claim(role="owner"), _user("squatter"))
        member = ir._membership_for_user(_user("squatter"), include_pending=True)
        assert ir._may_submit_proof(member) is True

    def test_active_non_admin_cannot_submit_proof(self):
        assert ir._may_submit_proof({"role": "data_viewer", "seat_status": "active"}) is False
        assert ir._may_submit_proof({"role": "admin", "seat_status": "active"}) is True

    def test_pending_seat_sees_only_its_own_submissions(self, svc):
        _school(svc)
        _verify(_claim(role="owner"), _user("squatter"))
        svc.store["institution_verification_submissions"] = [
            {"id": "sub-1", "school_id": "school-b", "submitted_by": "someone-else", "status": "rejected",
             "review_note": "internal reviewer note", "submitted_at": "2026-01-02T00:00:00+00:00"},
        ]
        data = asyncio.run(ir.get_verification_proof(_user("squatter"))).data
        assert data is None

    def test_pending_proof_does_not_overwrite_a_decided_school_status(self):
        assert ir._proof_may_change_school_status("verified", pending_seat=True) is False
        assert ir._proof_may_change_school_status("rejected", pending_seat=True) is False
        assert ir._proof_may_change_school_status("unverified", pending_seat=True) is True
        assert ir._proof_may_change_school_status("verified", pending_seat=False) is True


# --- R8: provisioning role allow-list ---------------------------------------

class TestProvisioningRoleAllowList:
    def _school_with(self, svc, role):
        _school(svc)
        _member(svc, "u1", role=role)

    @pytest.mark.parametrize("role", ["data_viewer", "counsellor", "course_advisor", "admissions_officer"])
    def test_read_only_and_advisory_roles_cannot_use_sensitive_routes(self, svc, role):
        self._school_with(svc, role)
        user = _user("u1")
        for allowed in (pr.PROVISIONING_WRITE_ROLES,):
            with pytest.raises(HTTPException) as exc:
                pr._require_school_role(user, allowed)
            assert exc.value.status_code == 403

    @pytest.mark.parametrize("role", ["owner", "institution_admin", "admin", "educator", "provisioning_manager"])
    def test_write_roles_pass(self, svc, role):
        self._school_with(svc, role)
        assert pr._require_school_role(_user("u1"), pr.PROVISIONING_WRITE_ROLES) == "school-b"

    def test_counsellors_may_write_guidance_but_viewers_may_not(self, svc):
        self._school_with(svc, "counsellor")
        assert pr._require_school_role(_user("u1"), pr.GUIDANCE_WRITE_ROLES) == "school-b"
        svc.store["institution_members"].clear()
        _member(svc, "u1", role="data_viewer")
        with pytest.raises(HTTPException) as exc:
            pr._require_school_role(_user("u1"), pr.GUIDANCE_WRITE_ROLES)
        assert exc.value.status_code == 403

    def test_pending_or_revoked_seats_never_pass(self, svc):
        _school(svc)
        _member(svc, "u1", role="owner", seat="invited")
        with pytest.raises(HTTPException):
            pr._require_school_role(_user("u1"), pr.PROVISIONING_WRITE_ROLES)

    @pytest.mark.parametrize("handler,args", [
        ("get_login_card", ("stu-1",)),
        ("regenerate_code", ("stu-1",)),
        ("delete_student_account", ("stu-1",)),
        ("confirm_merge_candidate", ("cand-1",)),
        ("dismiss_merge_candidate", ("cand-1",)),
    ])
    def test_sensitive_routes_reject_a_viewer_before_touching_data(self, svc, handler, args):
        self._school_with(svc, "data_viewer")
        fn = getattr(pr, handler)
        with pytest.raises(HTTPException) as exc:
            asyncio.run(fn(*args, current_user=_user("u1")))
        assert exc.value.status_code == 403

    def test_bulk_delete_rejects_a_viewer(self, svc):
        self._school_with(svc, "data_viewer")
        payload = pr.DeleteStudentsRequest(student_ids=["a"])
        with pytest.raises(HTTPException) as exc:
            asyncio.run(pr.delete_student_accounts(payload, current_user=_user("u1")))
        assert exc.value.status_code == 403

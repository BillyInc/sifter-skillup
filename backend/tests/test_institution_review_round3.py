"""Third review round of the institution-admin-authz PR (minor findings).

F1  an invited seat is `verified` only when the inviter's own seat is verified AND the
    school itself has been verified by a reviewer, so an unverified school creator cannot
    mint verified analytics access by inviting an alternate account
F2  the invite role is validated when the invitation is CREATED (known role, never above
    the inviter's own rank), and a database CHECK failure is not reported as "schema not
    applied"
F3  soft-deleting an account revokes its institution seats, so a deleted sole admin does
    not keep an active seat
"""
import asyncio
import types

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


def _set_school_status(svc, status):
    svc.store["schools"][0]["verification_status"] = status


def _create_invite(user, email="new@example.com", role="counsellor"):
    payload = ir.InviteMemberInput(invited_email=email, role=role)
    return asyncio.run(ir.invite_team_member(payload, user))


# --- F1: verified follows the inviter AND the school -----------------------

class TestInviteeVerifiedNeedsAVerifiedSchool:
    @pytest.mark.parametrize(
        "inviter_verified, school_status, expected",
        [
            (True, "verified", True),
            (False, "verified", False),   # an unverified creator cannot vouch
            (True, "claimed", False),     # the school was never verified
            (True, "pending", False),
            (True, None, False),
            (False, "pending", False),
        ],
    )
    def test_verified_flag(self, svc, inviter_verified, school_status, expected):
        _school(svc)
        _set_school_status(svc, school_status)
        _member(svc, "owner", verified=inviter_verified)
        _invite(svc, invited_by="owner")
        _verify(_claim(role="owner"), _user("guest", "guest@example.com"))
        row = _members(svc, "guest")[0]
        assert row["verified"] is expected
        assert row["seat_status"] == "active"  # the seat itself is still granted

    def test_an_unverified_creators_alt_account_gets_no_verified_analytics_access(self, svc):
        # The creator of a self-made school holds an unverified seat. Inviting an alternate
        # account must not turn that into verified access.
        _school(svc)
        _set_school_status(svc, "claimed")
        _member(svc, "creator", verified=False)
        _invite(svc, invited_by="creator", email="alt@example.com")
        _verify(_claim(role="owner"), _user("alt", "alt@example.com"))
        assert _members(svc, "alt")[0]["verified"] is False

    def test_an_existing_verified_member_is_not_demoted_by_an_invitation(self, svc):
        _school(svc)
        _set_school_status(svc, "claimed")
        _member(svc, "owner", verified=True)
        _member(svc, "boss", role="owner", verified=True)
        _invite(svc, invited_by="owner", role="owner", email="boss@example.com")
        _verify(_claim(role="owner"), _user("boss", "boss@example.com"))
        assert _members(svc, "boss")[0]["verified"] is True


# --- F2: invite role validated at creation ---------------------------------

class TestInviteRoleValidatedAtCreation:
    def _owner(self, svc, uid="owner", role="owner"):
        _school(svc)
        _member(svc, uid, role=role)
        return _user(uid)

    def test_unknown_role_is_refused_and_nothing_is_stored(self, svc):
        user = self._owner(svc)
        with pytest.raises(HTTPException) as exc:
            _create_invite(user, role="superuser")
        assert exc.value.status_code in (400, 422)
        assert svc.store.get("institution_member_invites", []) == []

    @pytest.mark.parametrize("role", ["owner", "institution_admin"])
    def test_admin_cannot_invite_above_their_own_rank(self, svc, role):
        user = self._owner(svc, "adm", role="admin")
        with pytest.raises(HTTPException) as exc:
            _create_invite(user, role=role)
        assert exc.value.status_code == 403
        assert svc.store.get("institution_member_invites", []) == []

    @pytest.mark.parametrize("role", ["admin", "educator", "counsellor", "data_viewer"])
    def test_admin_can_invite_at_or_below_their_rank(self, svc, role):
        user = self._owner(svc, "adm", role="admin")
        result = _create_invite(user, role=role)
        assert result.data is not None
        assert svc.store["institution_member_invites"][0]["role"] == role

    @pytest.mark.parametrize(
        "role",
        ["owner", "institution_admin", "admin", "educator", "provisioning_manager", "dean",
         "hod", "admissions_officer", "course_advisor", "counsellor", "data_viewer"],
    )
    def test_owner_can_invite_every_role_the_database_allows(self, svc, role):
        user = self._owner(svc)
        assert _create_invite(user, role=role).data is not None

    def test_role_allow_list_matches_the_database_check_constraint(self):
        import pathlib
        import re

        sql = (pathlib.Path(__file__).resolve().parents[1]
               / "migration_institution_team_access.sql").read_text()
        block = sql.split("institution_member_invites", 1)[1]
        check = re.search(r"role IN \((.*?)\)", block, re.S).group(1)
        allowed = set(re.findall(r"'([a-z_]+)'", check))
        assert allowed == set(ir._ROLE_RANK)

    def test_a_check_constraint_failure_is_not_reported_as_schema_not_applied(self, svc):
        user = self._owner(svc)

        def fail(table, mode, filters):
            if table == "institution_member_invites" and mode == "insert":
                return Exception(
                    'new row for relation "institution_member_invites" violates check '
                    'constraint "institution_member_invites_role_check" (code 23514)'
                )

        svc.fail = fail
        with pytest.raises(HTTPException) as exc:
            _create_invite(user, role="counsellor")
        assert exc.value.status_code in (400, 422)
        assert "schema" not in str(exc.value.detail).lower()

    @pytest.mark.parametrize(
        "message",
        [
            "Could not find the table 'skillup_dev.institution_member_invites' in the schema cache (PGRST205)",
            'relation "skillup_dev.institution_member_invites" does not exist (42P01)',
        ],
    )
    def test_a_missing_table_still_reports_the_schema_message(self, svc, message):
        user = self._owner(svc)
        svc.fail = lambda table, mode, filters: (
            Exception(message) if table == "institution_member_invites" else None
        )
        result = _create_invite(user, role="counsellor")
        assert result.data is None
        assert "schema" in (result.message or "").lower()

    def test_an_unexpected_failure_is_a_service_error_not_a_silent_success(self, svc):
        user = self._owner(svc)
        svc.fail = lambda table, mode, filters: (
            Exception("connection reset by peer")
            if table == "institution_member_invites" and mode == "insert" else None
        )
        with pytest.raises(HTTPException) as exc:
            _create_invite(user, role="counsellor")
        assert exc.value.status_code in (500, 502, 503)


# --- F3: deleting an account revokes its seats -----------------------------

class TestSeatsAreRevokedOnAccountDeletion:
    def test_helper_revokes_only_that_users_seats(self, svc):
        _school(svc)
        _member(svc, "gone", role="owner")
        _member(svc, "stays", role="admin")
        ir.revoke_user_seats("gone")
        assert _members(svc, "gone")[0]["seat_status"] == "revoked"
        assert _members(svc, "stays")[0]["seat_status"] == "active"

    def test_helper_never_raises(self, svc):
        svc.fail = lambda table, mode, filters: Exception("boom")
        ir.revoke_user_seats("anyone")  # best effort

    def test_helper_tolerates_a_schema_without_seat_status(self, svc):
        svc.fail = lambda table, mode, filters: (
            Exception('column "seat_status" of relation "institution_members" does not exist')
            if table == "institution_members" and mode == "update" else None
        )
        ir.revoke_user_seats("anyone")

    def test_a_revoked_sole_admin_no_longer_resolves_a_school(self, svc):
        _school(svc)
        _member(svc, "gone", role="owner")
        ir.revoke_user_seats("gone")
        assert ir._membership_for_user(_user("gone")) is None

    def test_delete_me_revokes_the_seats(self, svc, monkeypatch):
        import main
        import routes.collections_routes as cr

        _school(svc)
        _member(svc, "u1", role="owner")
        monkeypatch.setattr(main.db, "get_service_client", lambda: svc)
        monkeypatch.setattr(main, "_purge_avatar_objects", lambda keys: None)
        monkeypatch.setattr(
            main.avatar_storage, "get_storage",
            lambda: types.SimpleNamespace(list_keys=lambda uid: []),
        )
        monkeypatch.setattr(cr, "purge_user_collections", lambda uid: None)
        svc.store["users"] = [{"id": "u1", "email": "u1@example.com"}]
        asyncio.run(main.delete_me(None, {"id": "u1", "email": "u1@example.com"}, "dev-1"))
        assert _members(svc, "u1")[0]["seat_status"] == "revoked"

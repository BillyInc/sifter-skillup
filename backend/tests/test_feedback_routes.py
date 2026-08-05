"""
Tests for routes/feedback_routes.py — the internal-staff gate on the
feedback inbox (spec §7.8/§6A.4/§6A.5).

GET /api/feedback is Sifter-team tooling: it returns ALL feedback
platform-wide with no organisation filter, so institution/school/
tutorial-centre admins (account_type 'institution_admin'/'educator')
must get 403 unless their users row has is_internal_staff = true.

Style follows test_phase5_routes.py / test_student_pipeline_match.py:
monkeypatched service client, no live DB. The auth chain here is real
(JWT from Auth.create_jwt + mocked users lookup) so the actual
Auth.require_internal_staff dependency executes.
"""
import asyncio

from unittest.mock import MagicMock

import pytest
from fastapi import HTTPException

from auth import Auth


USER_ID = "test-user-123"  # matches the auth_header fixture's JWT sub


def _user_row(**overrides):
    row = {
        "id": USER_ID,
        "username": "FeedbackTester",
        "auth_provider": "guest",
        "account_type": "student",
    }
    row.update(overrides)
    return row


@pytest.fixture
def feedback_db(mock_db, monkeypatch):
    """Route the feedback module's captured `db` to the shared mock.

    routes.feedback_routes does `from database import db` at import time,
    and it is not in conftest's patch list, so patch it here explicitly.
    """
    import routes.feedback_routes as fr

    monkeypatch.setattr(fr, "db", mock_db, raising=False)
    sc = mock_db.get_service_client.return_value
    # skillup_dev.user_feedback inbox query → empty inbox
    (
        sc.schema.return_value.table.return_value.select.return_value
        .order.return_value.limit.return_value.execute.return_value
    ) = MagicMock(data=[])
    return mock_db


def _login_as(feedback_db, user_row):
    """Make auth.get_current_user's users lookup return `user_row`."""
    sc = feedback_db.get_service_client.return_value
    (
        sc.table.return_value.select.return_value.eq.return_value
        .single.return_value.execute.return_value
    ) = MagicMock(data=user_row)


class TestFeedbackInboxGate:
    def test_institution_admin_without_flag_gets_403(
        self, client, auth_header, feedback_db
    ):
        """A verified institution admin (require_admin would pass) is NOT
        internal staff → the platform-wide inbox must refuse with 403."""
        _login_as(feedback_db, _user_row(account_type="institution_admin"))
        r = client.get("/api/feedback", headers=auth_header)
        assert r.status_code == 403, r.text
        assert "Internal staff" in r.json()["detail"]

    def test_educator_without_flag_gets_403(self, client, auth_header, feedback_db):
        _login_as(feedback_db, _user_row(account_type="educator"))
        r = client.get("/api/feedback", headers=auth_header)
        assert r.status_code == 403, r.text

    def test_flag_absent_from_row_defaults_to_denied(
        self, client, auth_header, feedback_db
    ):
        """Legacy rows predating the migration have no is_internal_staff
        key at all — that must read as false, not crash or allow."""
        row = _user_row(account_type="institution_admin")
        assert "is_internal_staff" not in row
        _login_as(feedback_db, row)
        r = client.get("/api/feedback", headers=auth_header)
        assert r.status_code == 403, r.text

    def test_internal_staff_passes(self, client, auth_header, feedback_db):
        _login_as(
            feedback_db,
            _user_row(account_type="institution_admin", is_internal_staff=True),
        )
        r = client.get("/api/feedback", headers=auth_header)
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["success"] is True
        assert body["data"] == []

    def test_submit_feedback_still_open_to_any_user(
        self, client, auth_header, feedback_db
    ):
        """POST /api/feedback is untouched: plain students may submit."""
        _login_as(feedback_db, _user_row(account_type="student"))
        sc = feedback_db.get_service_client.return_value
        (
            sc.schema.return_value.table.return_value.insert.return_value
            .execute.return_value
        ) = MagicMock(data=[{"id": "fb-1"}])
        r = client.post(
            "/api/feedback",
            headers=auth_header,
            json={"type": "bug", "message": "hello"},
        )
        assert r.status_code == 200, r.text
        assert r.json()["success"] is True


class TestRequireInternalStaffDependency:
    """Direct unit coverage of the dependency itself (no HTTP layer)."""

    def test_truthy_but_not_true_is_denied(self):
        """Only boolean True passes — strings like 'true' must not."""
        with pytest.raises(HTTPException) as exc:
            asyncio.run(Auth.require_internal_staff(
                current_user=_user_row(is_internal_staff="true")
            ))
        assert exc.value.status_code == 403

    def test_false_flag_denied(self):
        with pytest.raises(HTTPException) as exc:
            asyncio.run(Auth.require_internal_staff(
                current_user=_user_row(
                    account_type="institution_admin", is_internal_staff=False
                )
            ))
        assert exc.value.status_code == 403

    def test_true_flag_returns_user(self):
        user = _user_row(is_internal_staff=True)
        assert asyncio.run(Auth.require_internal_staff(current_user=user)) is user

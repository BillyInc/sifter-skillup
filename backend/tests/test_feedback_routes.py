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
        """POST /api/feedback stays open to plain students (§6A.4).

        A category is now required for student submissions, so this sends one —
        what is under test here is the ACCOUNT type, not the payload shape.
        """
        _login_as(feedback_db, _user_row(account_type="student"))
        sc = feedback_db.get_service_client.return_value
        (
            sc.schema.return_value.table.return_value.insert.return_value
            .execute.return_value
        ) = MagicMock(data=[{"id": "fb-1"}])
        r = client.post(
            "/api/feedback",
            headers=auth_header,
            json={"type": "bug", "message": "hello", "studentCategory": "bug"},
        )
        assert r.status_code == 200, r.text
        assert r.json()["success"] is True


class TestFeedbackStorage:
    """The insert targeted skillup_dev.user_feedback, which did not exist —
    every submission failed and the broad except reported it as a storage
    hiccup. These lock in the payload the table must accept."""

    def _capture_insert(self, feedback_db):
        sc = feedback_db.get_service_client.return_value
        insert = sc.schema.return_value.table.return_value.insert
        insert.return_value.execute.return_value = MagicMock(data=[{"id": "fb-1"}])
        return insert

    def test_insert_targets_user_feedback_with_category(
        self, client, auth_header, feedback_db
    ):
        _login_as(feedback_db, _user_row(account_type="student"))
        insert = self._capture_insert(feedback_db)
        sc = feedback_db.get_service_client.return_value

        r = client.post(
            "/api/feedback",
            headers=auth_header,
            json={
                "type": "bug",
                "message": "blank screen on domain D011",
                "entityType": "domain",
                "entityId": "D011",
                "rating": 2,
                "studentCategory": "bug",
            },
        )
        assert r.status_code == 200, r.text
        assert r.json()["success"] is True

        sc.schema.return_value.table.assert_any_call("user_feedback")
        row = insert.call_args.args[0]
        assert row["student_category"] == "bug"
        assert row["entity_type"] == "domain"
        assert row["entity_id"] == "D011"
        assert row["rating"] == 2

    def test_student_must_choose_a_category(self, client, auth_header, feedback_db):
        """§6A.3 — free text alone does not let the team aggregate what
        students are actually reporting on, so the category is required."""
        _login_as(feedback_db, _user_row(account_type="student"))
        insert = self._capture_insert(feedback_db)
        r = client.post(
            "/api/feedback",
            headers=auth_header,
            json={"type": "bug", "message": "it broke"},
        )
        assert r.json()["success"] is False
        assert "what your feedback is about" in r.json()["message"]
        insert.assert_not_called()

    def test_unknown_category_rejected_before_the_db(
        self, client, auth_header, feedback_db
    ):
        """Rejected as a bad request, NOT swallowed by the storage except —
        otherwise a typo reads to the user as 'our servers are broken'."""
        _login_as(feedback_db, _user_row(account_type="student"))
        insert = self._capture_insert(feedback_db)
        r = client.post(
            "/api/feedback",
            headers=auth_header,
            json={"type": "bug", "message": "x", "studentCategory": "not_a_category"},
        )
        assert r.json()["success"] is False
        assert "Unknown feedback category" in r.json()["message"]
        insert.assert_not_called()

    def test_admin_may_submit_without_a_category(
        self, client, auth_header, feedback_db
    ):
        """Admin/educator submissions carry their structure via the
        mapping-flag form (§6A.2), so the requirement is student-only."""
        _login_as(feedback_db, _user_row(account_type="institution_admin"))
        insert = self._capture_insert(feedback_db)
        r = client.post(
            "/api/feedback",
            headers=auth_header,
            json={"type": "mapping", "message": "D011 mapping looks wrong"},
        )
        assert r.status_code == 200, r.text
        assert r.json()["success"] is True
        assert insert.call_args.args[0]["student_category"] is None


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

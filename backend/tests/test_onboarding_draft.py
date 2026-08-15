from unittest.mock import MagicMock

import pytest

from auth import Auth
from main import app


@pytest.fixture
def draft_user():
    return {"id": "draft-user-123", "account_type": "pending"}


def _use_user(draft_user):
    app.dependency_overrides[Auth.get_current_user] = lambda: draft_user


def _clear_override():
    app.dependency_overrides.pop(Auth.get_current_user, None)


def test_get_onboarding_draft_maps_server_profile_columns(client, mock_db, draft_user):
    _use_user(draft_user)
    try:
        table = MagicMock()
        mock_db.get_service_client.return_value.table.return_value = table
        table.select.return_value.eq.return_value.limit.return_value.execute.return_value.data = [{
            "user_id": draft_user["id"],
            "mode": "student",
            "choice": "ss2",
            "step": 2,
            "checkpoint": "student_setup",
            "student_profile": {"stream": "science"},
            "educator_profile": {},
            "admission_context": {},
            "updated_at": "2026-08-15T10:00:00+00:00",
        }]

        response = client.get("/api/users/onboarding-draft")

        assert response.status_code == 200
        assert response.json()["data"]["studentProfile"] == {"stream": "science"}
        table.select.return_value.eq.assert_called_once_with("user_id", draft_user["id"])
    finally:
        _clear_override()


def test_save_onboarding_draft_is_user_scoped_and_rejects_invalid_step(client, mock_db, draft_user):
    _use_user(draft_user)
    try:
        invalid = client.put(
            "/api/users/onboarding-draft",
            json={"mode": "student", "step": 101},
        )
        assert invalid.status_code == 400

        table = MagicMock()
        mock_db.get_service_client.return_value.table.return_value = table
        table.upsert.return_value.execute.return_value.data = [{
            "user_id": draft_user["id"],
            "mode": "student",
            "choice": "ss2",
            "step": 1,
            "checkpoint": None,
            "student_profile": {"classLevel": "ss2"},
            "educator_profile": {},
            "admission_context": {},
            "updated_at": "2026-08-15T10:00:00+00:00",
        }]

        response = client.put(
            "/api/users/onboarding-draft",
            json={
                "mode": "student",
                "choice": "ss2",
                "step": 1,
                "studentProfile": {"classLevel": "ss2"},
            },
        )

        assert response.status_code == 200
        payload = table.upsert.call_args.args[0]
        assert payload["user_id"] == draft_user["id"]
        assert payload["student_profile"] == {"classLevel": "ss2"}
        table.upsert.assert_called_once_with(payload, on_conflict="user_id")
    finally:
        _clear_override()


def test_delete_onboarding_draft_is_user_scoped(client, mock_db, draft_user):
    _use_user(draft_user)
    try:
        table = MagicMock()
        mock_db.get_service_client.return_value.table.return_value = table
        response = client.delete("/api/users/onboarding-draft")

        assert response.status_code == 200
        table.delete.return_value.eq.assert_called_once_with("user_id", draft_user["id"])
    finally:
        _clear_override()

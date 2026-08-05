# ============================================
# Regression tests: PUT /api/users/me must never
# allow self-service privilege escalation.
#
# Previously UserUpdate exposed `account_type`, so any authenticated
# user could send {"account_type": "institution_admin"} and then pass
# Auth.require_admin. These tests pin the fix:
#   1. UserUpdate no longer has an account_type field.
#   2. update_me strips privileged columns before writing.
#   3. password_hash never leaks in the update response.
# ============================================
from unittest.mock import MagicMock

from models import UserUpdate

USER_ID = "test-user-123"  # matches the auth_header fixture's JWT sub


def _student_row(**overrides):
    row = {
        "id": USER_ID,
        "username": "EscalationTester",
        "auth_provider": "guest",
        "account_type": "student",
        "password_hash": "supersecret-hash",
    }
    row.update(overrides)
    return row


def _login_as(mock_db, user_row):
    """Make auth.get_current_user's users lookup return `user_row`."""
    sc = mock_db.get_service_client.return_value
    (
        sc.table.return_value.select.return_value.eq.return_value
        .single.return_value.execute.return_value
    ) = MagicMock(data=user_row)


def _update_chain(mock_db, returned_row):
    """Wire the update chain used by main.update_me and return the
    update mock so its call args can be inspected."""
    c = mock_db.get_client.return_value
    update_mock = c.table.return_value.update
    (
        update_mock.return_value.eq.return_value.execute.return_value
    ) = MagicMock(data=[returned_row])
    return update_mock


class TestUserUpdateModel:
    def test_account_type_not_a_field(self):
        assert "account_type" not in UserUpdate.model_fields

    def test_account_type_in_payload_is_ignored(self):
        parsed = UserUpdate(username="x", account_type="institution_admin")
        assert "account_type" not in parsed.model_dump(exclude_unset=True)


class TestUpdateMeEscalation:
    def test_account_type_only_payload_writes_nothing(
        self, client, auth_header, mock_db
    ):
        """Sending only account_type must not touch the users table at all."""
        _login_as(mock_db, _student_row())
        update_mock = _update_chain(mock_db, _student_row())

        r = client.put(
            "/api/users/me",
            headers=auth_header,
            json={"account_type": "institution_admin"},
        )
        assert r.status_code == 200, r.text
        update_mock.assert_not_called()
        # Response reflects the unchanged (student) row, sans password_hash.
        body = r.json()["data"]
        assert body["account_type"] == "student"
        assert "password_hash" not in body

    def test_account_type_stripped_from_mixed_payload(
        self, client, auth_header, mock_db
    ):
        """Legitimate fields go through; account_type must not."""
        _login_as(mock_db, _student_row())
        update_mock = _update_chain(
            mock_db, _student_row(username="NewName")
        )

        r = client.put(
            "/api/users/me",
            headers=auth_header,
            json={"username": "NewName", "account_type": "educator"},
        )
        assert r.status_code == 200, r.text
        update_mock.assert_called_once()
        written = update_mock.call_args.args[0]
        assert written == {"username": "NewName"}

    def test_is_internal_staff_never_written(self, client, auth_header, mock_db):
        """The stricter require_internal_staff gate column is also blocked."""
        _login_as(mock_db, _student_row())
        update_mock = _update_chain(mock_db, _student_row())

        r = client.put(
            "/api/users/me",
            headers=auth_header,
            json={"is_internal_staff": True},
        )
        assert r.status_code == 200, r.text
        update_mock.assert_not_called()

    def test_password_hash_stripped_after_real_update(
        self, client, auth_header, mock_db
    ):
        _login_as(mock_db, _student_row())
        _update_chain(mock_db, _student_row(username="NewName"))

        r = client.put(
            "/api/users/me",
            headers=auth_header,
            json={"username": "NewName"},
        )
        assert r.status_code == 200, r.text
        assert "password_hash" not in r.json()["data"]

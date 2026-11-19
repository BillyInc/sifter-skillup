"""Optional display_name: validator, sign-up and PUT /api/users/me."""
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from models import UserUpdate
from profile_validation import DisplayNameError, validate_display_name

USER_ID = "test-user-123"


class TestValidator:
    @pytest.mark.parametrize("raw,expected", [
        ("Ada", "Ada"),
        ("  Ada   B  ", "Ada B"),
        ("O'Neil-Smith Jr.", "O'Neil-Smith Jr."),
        ("Chidi 2", "Chidi 2"),
        ("Zoë", "Zoë"),
        ("A" * 30, "A" * 30),
    ])
    def test_accepts(self, raw, expected):
        assert validate_display_name(raw) == expected

    @pytest.mark.parametrize("raw", [None, "", "   "])
    def test_empty_means_not_provided(self, raw):
        assert validate_display_name(raw) is None

    @pytest.mark.parametrize("raw", [
        "A", "A" * 31,
        "me@example.com", "ada@x", "https://x.com", "www.example", "site.com",
        "08012345678", "call 0801 234 5678",
        "Ada<script>", "Ada_B", "Ada!", "12", "..",
        "Admin", "Sifter Support", "f u c k", "sh1t", "System",
    ])
    def test_rejects(self, raw):
        with pytest.raises(DisplayNameError):
            validate_display_name(raw)

    def test_non_string_rejected(self):
        with pytest.raises(DisplayNameError):
            validate_display_name(123)


def _login_as(mock_db, row):
    sc = mock_db.get_service_client.return_value
    sc.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = MagicMock(data=row)


def _row(**kw):
    return {"id": USER_ID, "username": "Legal Name", "auth_provider": "guest", "account_type": "student", **kw}


class TestUpdateMe:
    def test_model_field(self):
        assert "display_name" in UserUpdate.model_fields

    def test_valid_name_written_and_returned(self, client, auth_header, mock_db):
        _login_as(mock_db, _row())
        c = mock_db.get_client.return_value
        c.table.return_value.update.return_value.eq.return_value.execute.return_value = MagicMock(data=[_row()])
        c.table.return_value.select.return_value.eq.return_value.limit.return_value.execute.return_value = MagicMock(data=[_row(display_name="Ada")])
        r = client.put("/api/users/me", headers=auth_header, json={"display_name": "  Ada "})
        assert r.status_code == 200, r.text
        c.table.return_value.update.assert_called_once_with({"display_name": "Ada"})
        assert r.json()["data"]["display_name"] == "Ada"

    def test_invalid_name_rejected_without_write(self, client, auth_header, mock_db):
        _login_as(mock_db, _row())
        c = mock_db.get_client.return_value
        r = client.put("/api/users/me", headers=auth_header, json={"display_name": "a@b.com"})
        assert r.status_code == 400
        c.table.return_value.update.assert_not_called()

    def test_omitted_display_name_not_written(self, client, auth_header, mock_db):
        _login_as(mock_db, _row())
        c = mock_db.get_client.return_value
        c.table.return_value.update.return_value.eq.return_value.execute.return_value = MagicMock(data=[_row()])
        c.table.return_value.select.return_value.eq.return_value.limit.return_value.execute.return_value = MagicMock(data=[_row()])
        r = client.put("/api/users/me", headers=auth_header, json={"username": "Zed"})
        assert r.status_code == 200, r.text
        c.table.return_value.update.assert_called_once_with({"username": "Zed"})

    def test_missing_column_is_409_not_500(self, client, auth_header, mock_db):
        _login_as(mock_db, _row())
        c = mock_db.get_client.return_value
        c.table.return_value.update.return_value.eq.return_value.execute.side_effect = Exception(
            "Could not find the 'display_name' column of 'users' in the schema cache")
        r = client.put("/api/users/me", headers=auth_header, json={"display_name": "Ada"})
        assert r.status_code == 409


class TestSignup:
    BODY = {"email": "kid@example.com", "password": "password123", "first_name": "Ada", "last_name": "Obi"}

    def _patches(self):
        return [
            patch("main._require_valid_email_code", new=AsyncMock()),
            patch("main._validated_signup_legal_acceptance", return_value={}),
            patch("main._attach_legal_acceptance", side_effect=lambda _c, u, _a: u),
            patch("main._post_auth_device_register", new=AsyncMock()),
        ]

    def _run(self, client, mock_db, body):
        sc = mock_db.get_service_client.return_value
        sc.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(data=[])
        sc.table.return_value.insert.return_value.execute.side_effect = lambda: MagicMock(
            data=[dict(sc.table.return_value.insert.call_args[0][0])])
        ps = self._patches()
        for p in ps:
            p.start()
        try:
            return client.post("/api/auth/signup", json=body), sc.table.return_value.insert
        finally:
            for p in ps:
                p.stop()

    def test_display_name_stored_and_returned(self, client, mock_db):
        r, ins = self._run(client, mock_db, {**self.BODY, "display_name": "Adaobi"})
        assert r.status_code == 200, r.text
        assert ins.call_args[0][0]["display_name"] == "Adaobi"
        assert r.json()["data"]["user"]["display_name"] == "Adaobi"

    def test_old_client_without_display_name_unchanged(self, client, mock_db):
        r, ins = self._run(client, mock_db, self.BODY)
        assert r.status_code == 200, r.text
        assert "display_name" not in ins.call_args[0][0]
        assert ins.call_args[0][0]["username"] == "Ada Obi"

    def test_invalid_display_name_400(self, client, mock_db):
        r, _ = self._run(client, mock_db, {**self.BODY, "display_name": "0801234567890"})
        assert r.status_code == 400

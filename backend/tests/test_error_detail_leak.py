"""A 500 body must never carry the underlying exception, DEBUG or not.

backend/.env ships DEBUG=true, so the old `f"... ({exc})" if settings.DEBUG`
branches in auth_signup and delete_me were live on every dev deployment: a
Postgres failure echoed the constraint name, the column name and the failing
row straight back to the client.

The assertions here are deliberately about ABSENCE. Checking only that the
friendly sentence is present passes just as well when the leaked text is
appended to it, which is exactly what the old code did. So the exception the
mocked call raises is Postgres-shaped — a postgrest APIError-style string
carrying a constraint name, a column name and a SQLSTATE — and each of those
tokens is asserted missing from the whole response body.
"""
import json
from unittest.mock import MagicMock

import pytest

import main
from config import settings
from main import CURRENT_PRIVACY_VERSION, CURRENT_TERMS_VERSION

USER_ID = "test-user-123"  # matches the auth_header fixture's JWT sub

CONSTRAINT = "users_account_type_check"
COLUMN = "account_type"
SQLSTATE = "23514"


class _APIError(Exception):
    """Shaped like postgrest.exceptions.APIError: the payload IS the message."""

    def __init__(self, message: str, code: str, details: str, hint=None):
        self.message = message
        self.code = code
        self.details = details
        self.hint = hint
        super().__init__(
            json.dumps(
                {"message": message, "code": code, "details": details, "hint": hint}
            )
        )


def _postgres_failure():
    return _APIError(
        message=(
            f'new row for relation "users" violates check constraint "{CONSTRAINT}"'
        ),
        code=SQLSTATE,
        details=(
            "Failing row contains (9f2c, ada@example.com, "
            f"{COLUMN}=not_a_real_type, $2b$12$hashedsecret)."
        ),
    )


def _assert_no_internals(body: str):
    lowered = body.lower()
    for leaked in (CONSTRAINT, COLUMN, SQLSTATE, "failing row", "relation", "$2b$12$"):
        assert leaked.lower() not in lowered, (
            f"500 body leaked {leaked!r} to the client: {body}"
        )


@pytest.fixture
def debug_on(monkeypatch):
    monkeypatch.setattr(settings, "DEBUG", True, raising=False)
    return settings


def test_signup_500_does_not_echo_the_postgres_error(
    client, mock_db, monkeypatch, debug_on
):
    # No existing account for this email, and the emailed code check is not
    # what is under test here.
    (
        mock_db.get_service_client.return_value.table.return_value
        .select.return_value.eq.return_value.execute.return_value
    ) = MagicMock(data=[])

    async def _no_code_check(email, code):
        return None

    monkeypatch.setattr(main, "_require_valid_email_code", _no_code_check)

    def _boom(**kwargs):
        raise _postgres_failure()

    monkeypatch.setattr(main, "_create_user", _boom)

    res = client.post(
        "/api/auth/signup",
        json={
            "email": "ada@example.com",
            "password": "supersecret",
            "email_code": "000000",
            "first_name": "Ada",
            "last_name": "Lovelace",
            "terms_version": CURRENT_TERMS_VERSION,
            "privacy_version": CURRENT_PRIVACY_VERSION,
        },
    )

    assert res.status_code == 500, res.text
    _assert_no_internals(res.text)
    assert "could not create your account" in res.json()["detail"].lower()


def test_account_deletion_500_does_not_echo_the_postgres_error(
    client, mock_db, auth_header, monkeypatch, debug_on
):
    (
        mock_db.get_service_client.return_value.table.return_value
        .select.return_value.eq.return_value.single.return_value.execute.return_value
    ) = MagicMock(data={
        "id": USER_ID,
        "username": "Ada",
        "email": "ada@example.com",
        "auth_provider": "email",
        "account_type": "student",
    })

    def _boom(service, user_id, updates):
        raise _postgres_failure()

    monkeypatch.setattr(main, "_soft_delete_user_compat", _boom)

    res = client.delete("/api/users/me", headers=auth_header)

    assert res.status_code == 500, res.text
    _assert_no_internals(res.text)
    assert "temporarily unavailable" in res.json()["detail"].lower()

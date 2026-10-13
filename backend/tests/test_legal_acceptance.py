from unittest.mock import MagicMock
import pytest

from models import LegalAcceptanceInput
from main import _validated_signup_legal_acceptance


def _login_as(mock_db, user_row):
    sc = mock_db.get_service_client.return_value
    sc.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = MagicMock(
        data=user_row
    )


def test_legal_acceptance_payload_is_explicit():
    payload = LegalAcceptanceInput(
        terms_version="2026-10-10",
        privacy_version="2026-10-10",
        analytics_consent=False,
    )
    assert payload.analytics_consent is False


def test_signup_requires_current_legal_versions():
    from fastapi import HTTPException

    with pytest.raises(HTTPException) as missing:
        _validated_signup_legal_acceptance({})
    assert missing.value.status_code == 400

    accepted = _validated_signup_legal_acceptance({
        "terms_version": "2026-10-10",
        "privacy_version": "2026-10-10",
        "analytics_consent": True,
    })
    assert accepted["analyticsConsent"] is True


def test_legal_acceptance_rejects_stale_document(client, auth_header, mock_db):
    _login_as(mock_db, {"id": "test-user-123", "settings": {}})
    response = client.post(
        "/api/users/legal-acceptance",
        headers=auth_header,
        json={
            "terms_version": "old",
            "privacy_version": "old",
            "analytics_consent": False,
        },
    )
    assert response.status_code == 409


def test_legal_acceptance_preserves_existing_settings(client, auth_header, mock_db):
    _login_as(mock_db, {"id": "test-user-123", "settings": {"theme": "light"}})
    service = mock_db.get_client.return_value
    updated = {"id": "test-user-123", "settings": {"theme": "light"}}
    service.table.return_value.select.return_value.eq.return_value.limit.return_value.execute.return_value = MagicMock(
        data=[updated]
    )

    response = client.post(
        "/api/users/legal-acceptance",
        headers=auth_header,
        json={
        "terms_version": "2026-10-10",
        "privacy_version": "2026-10-10",
            "analytics_consent": True,
        },
    )
    assert response.status_code == 200, response.text
    written = service.table.return_value.update.call_args.args[0]
    assert written["settings"]["theme"] == "light"
    assert written["settings"]["legalAcceptance"]["analyticsConsent"] is True

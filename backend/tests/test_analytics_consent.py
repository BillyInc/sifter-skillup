import asyncio
from unittest.mock import MagicMock

from routes.missing_routes import _analytics_consented
from services import offline_sync


def test_analytics_is_opt_in_only():
    assert not _analytics_consented({})
    assert not _analytics_consented({"settings": {"legalAcceptance": {"analyticsConsent": False}}})
    assert _analytics_consented({"settings": {"legalAcceptance": {"analyticsConsent": True}}})


def test_queued_analytics_is_dropped_for_opted_out_user(monkeypatch):
    service = MagicMock()
    monkeypatch.setattr(offline_sync.db, "get_service_client", lambda: service)
    result = asyncio.run(
        offline_sync._handle_analytics_event(
            {"event_type": "share", "event_data": {"x": 1}},
            {"id": "user-1", "settings": {"legalAcceptance": {"analyticsConsent": False}}},
            {},
        )
    )
    assert result == {"tracked": False, "reason": "analytics_opt_out"}
    service.table.assert_not_called()

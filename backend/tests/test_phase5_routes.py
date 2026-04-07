"""
Tests for phase5_routes.py — XP events, merch redeem, history pagination.
"""
from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient

import phase5_routes
from auth import Auth
from main import app


SAMPLE_USER = {
    "id": "user-p5-1",
    "username": "Phase5",
    "auth_provider": "guest",
    "points": 100,
}


@pytest.fixture
def auth_client():
    async def fake_user():
        return SAMPLE_USER

    app.dependency_overrides[Auth.get_current_user] = fake_user
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


class TestXPEvent:
    def test_xp_event_capped(self, auth_client):
        """xp_amount=10000 must be rejected (exceeds per-event cap)."""
        r = auth_client.post(
            "/api/v2/xp/event",
            json={
                "event_type": "share",
                "xp_amount": 10000,
                "metadata": {},
            },
        )
        assert r.status_code in (400, 422)

    def test_xp_event_uses_atomic_rpc(self, auth_client, mock_db):
        """xp_amount=100 → increment_user_points RPC called with delta=100."""
        sc = mock_db.get_service_client.return_value
        sc.rpc.return_value.execute.return_value = MagicMock(data=200)
        sc.table.return_value.insert.return_value.execute.return_value = MagicMock(data=[{"id": "x1"}])

        r = auth_client.post(
            "/api/v2/xp/event",
            json={
                "event_type": "share",
                "xp_amount": 100,
                "metadata": {},
            },
        )
        assert r.status_code == 200, r.text

        # Find the call to .rpc("increment_user_points", {...})
        rpc_calls = [c for c in sc.rpc.call_args_list if c.args and c.args[0] == "increment_user_points"]
        assert rpc_calls, f"increment_user_points RPC was not called. rpc calls: {sc.rpc.call_args_list}"
        params = rpc_calls[0].args[1]
        assert params["p_delta"] == 100
        assert params["p_user_id"] == SAMPLE_USER["id"]


class TestMerchRedeem:
    def _setup_item(self, mock_db, cost=500):
        sc = mock_db.get_service_client.return_value
        # First call: select merchandise_items → returns one item
        sc.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value = MagicMock(
            data=[{"id": "merch-1", "credit_cost": cost, "available": True, "name": "Hat"}]
        )
        return sc

    def test_insufficient_credits(self, auth_client, mock_db):
        sc = self._setup_item(mock_db, cost=99999)
        sc.rpc.return_value.execute.return_value = MagicMock(data=None)  # NULL → insufficient

        r = auth_client.post(
            "/api/v2/merch/redeem",
            json={"item_id": "merch-1", "shipping_address": {"line1": "x"}},
        )
        assert r.status_code == 400
        assert "insufficient" in r.text.lower()

    def test_success(self, auth_client, mock_db):
        sc = self._setup_item(mock_db, cost=500)
        sc.rpc.return_value.execute.return_value = MagicMock(data=1500)  # remaining credits
        sc.table.return_value.insert.return_value.execute.return_value = MagicMock(
            data=[{"id": "order-1"}]
        )

        r = auth_client.post(
            "/api/v2/merch/redeem",
            json={"item_id": "merch-1", "shipping_address": {"line1": "x"}},
        )
        assert r.status_code == 200, r.text
        data = r.json()["data"]
        assert data["order_id"] == "order-1"
        assert data["credits_spent"] == 500
        assert data["credits_remaining"] == 1500


class TestXPHistoryPagination:
    def test_limit_too_large_rejected(self, auth_client):
        r = auth_client.get("/api/v2/xp/history?limit=10000")
        assert r.status_code == 422

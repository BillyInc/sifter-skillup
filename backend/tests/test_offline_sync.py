"""
Tests for offline_sync.py — the /api/sync/drain endpoint.

All external calls (DB, RPCs) are mocked. We override
auth.Auth.get_current_user via FastAPI dependency override.
"""
from datetime import datetime, timedelta, timezone
from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient

import offline_sync
from auth import Auth
from main import app


SAMPLE_USER = {
    "id": "user-off-1",
    "username": "OffTester",
    "auth_provider": "guest",
    "points": 100,
    "current_level": 1,
    "completed_levels": [],
    "perfect_levels": [],
    "active_track": "crypto",
    "streak": 1,
}


def _now_iso(offset_seconds: int = 0) -> str:
    return (datetime.now(timezone.utc) + timedelta(seconds=offset_seconds)).isoformat()


def _xp_item(item_id: str, xp: int, priority: str = "normal", created_at: str = None) -> dict:
    return {
        "id": item_id,
        "priority": priority,
        "endpoint": "/api/game/xp-event",
        "method": "POST",
        "body": {"xp_amount": xp, "event_type": "share"},
        "created_at": created_at or _now_iso(),
        "attempts": 0,
        "device_id": "devA",
    }


@pytest.fixture
def auth_client():
    async def fake_user():
        return SAMPLE_USER

    app.dependency_overrides[Auth.get_current_user] = fake_user
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def setup_db(mock_db):
    """Default DB mocks: RPC echoes back what's requested, generic table ops succeed."""
    sc = mock_db.get_service_client.return_value

    def rpc_side_effect(name, params=None):
        rpc_obj = MagicMock()
        if name == "try_award_offline_xp":
            # Return what the user requested (capped per item)
            rpc_obj.execute.return_value = MagicMock(data=int((params or {}).get("p_request", 0)))
        elif name == "increment_user_points":
            rpc_obj.execute.return_value = MagicMock(data=200)
        elif name == "touch_user_streak":
            rpc_obj.execute.return_value = MagicMock(data=[{"streak": 1}])
        else:
            rpc_obj.execute.return_value = MagicMock(data=None)
        return rpc_obj

    sc.rpc.side_effect = rpc_side_effect

    # Generic table().insert/update/select chains
    sc.table.return_value.insert.return_value.execute.return_value = MagicMock(data=[{"id": "x"}])
    sc.table.return_value.update.return_value.eq.return_value.execute.return_value = MagicMock(data=[{}])
    sc.table.return_value.upsert.return_value.execute.return_value = MagicMock(data=[{}])
    return mock_db


# ─────────────────────────────────────────────────────────────
# Tests
# ─────────────────────────────────────────────────────────────


class TestDrainIdempotency:
    def test_drain_idempotency(self, auth_client, setup_db, monkeypatch):
        # First call returns False (not applied), second returns True
        toggle = {"called": 0}
        def fake_already_applied(item_id, user_id):
            toggle["called"] += 1
            return toggle["called"] > 1

        monkeypatch.setattr(offline_sync, "_already_applied", fake_already_applied)
        monkeypatch.setattr(offline_sync, "_mark_applied", lambda *a, **kw: None)

        item = _xp_item("item-1", xp=50)

        payload = {
            "device_id": "devA",
            "items": [item],
            "client_time": _now_iso(),
        }

        r1 = auth_client.post("/api/sync/drain", json=payload)
        assert r1.status_code == 200, r1.text
        assert r1.json()["results"][0]["status"] == "applied"

        r2 = auth_client.post("/api/sync/drain", json=payload)
        assert r2.status_code == 200
        # Second call: still APPLIED but with a "already_applied" note
        result2 = r2.json()["results"][0]
        assert result2["status"] == "applied"
        assert (result2.get("response") or {}).get("note") == "already_applied"


class TestDrainBatchSize:
    def test_batch_size_limit(self, auth_client, setup_db):
        items = [_xp_item(f"i-{i}", xp=10) for i in range(501)]
        r = auth_client.post(
            "/api/sync/drain",
            json={"device_id": "devA", "items": items, "client_time": _now_iso()},
        )
        assert r.status_code == 400


class TestDrainItemAge:
    def test_old_item_rejected(self, auth_client, setup_db, monkeypatch):
        monkeypatch.setattr(offline_sync, "_already_applied", lambda *a, **kw: False)
        monkeypatch.setattr(offline_sync, "_mark_applied", lambda *a, **kw: None)

        old_ts = (datetime.now(timezone.utc) - timedelta(hours=80)).isoformat()
        item = _xp_item("old-1", xp=10, created_at=old_ts)
        r = auth_client.post(
            "/api/sync/drain",
            json={"device_id": "devA", "items": [item], "client_time": _now_iso()},
        )
        assert r.status_code == 200
        result = r.json()["results"][0]
        assert result["status"] == "rejected"
        assert "old" in (result.get("error") or "").lower()


class TestDrainUnknownEndpoint:
    def test_unknown_endpoint_rejected(self, auth_client, setup_db, monkeypatch):
        monkeypatch.setattr(offline_sync, "_already_applied", lambda *a, **kw: False)
        monkeypatch.setattr(offline_sync, "_mark_applied", lambda *a, **kw: None)

        item = {
            "id": "u-1",
            "priority": "normal",
            "endpoint": "/api/unknown",
            "method": "POST",
            "body": {},
            "created_at": _now_iso(),
            "attempts": 0,
            "device_id": "devA",
        }
        r = auth_client.post(
            "/api/sync/drain",
            json={"device_id": "devA", "items": [item], "client_time": _now_iso()},
        )
        assert r.status_code == 200
        result = r.json()["results"][0]
        assert result["status"] == "rejected"
        assert "unknown" in (result.get("error") or "").lower()


class TestDrainXpAmountCapped:
    def test_xp_amount_capped_to_max_per_item(self, auth_client, setup_db, monkeypatch):
        monkeypatch.setattr(offline_sync, "_already_applied", lambda *a, **kw: False)
        monkeypatch.setattr(offline_sync, "_mark_applied", lambda *a, **kw: None)

        sc = setup_db.get_service_client.return_value
        observed = {}

        def rpc_side_effect(name, params=None):
            rpc_obj = MagicMock()
            if name == "try_award_offline_xp":
                observed["p_request"] = params.get("p_request")
                rpc_obj.execute.return_value = MagicMock(data=int(params["p_request"]))
            else:
                rpc_obj.execute.return_value = MagicMock(data=None)
            return rpc_obj

        sc.rpc.side_effect = rpc_side_effect

        item = _xp_item("cap-1", xp=10000)
        r = auth_client.post(
            "/api/sync/drain",
            json={"device_id": "devA", "items": [item], "client_time": _now_iso()},
        )
        assert r.status_code == 200, r.text
        # MAX_XP_PER_ITEM is 500
        assert observed.get("p_request") == offline_sync.MAX_XP_PER_ITEM == 500


class TestDrainClockSkew:
    def test_clock_skew_rejects_batch(self, auth_client, setup_db):
        future_time = (datetime.now(timezone.utc) + timedelta(hours=25)).isoformat()
        items = [_xp_item("c-1", xp=10), _xp_item("c-2", xp=10)]
        r = auth_client.post(
            "/api/sync/drain",
            json={"device_id": "devA", "items": items, "client_time": future_time},
        )
        assert r.status_code == 200
        body = r.json()
        assert body["clock_skew_seconds"] > offline_sync.MAX_CLOCK_SKEW_SECONDS
        for result in body["results"]:
            assert result["status"] == "rejected"
            assert "skew" in (result.get("error") or "").lower()


class TestDrainPriorityOrder:
    def test_priority_order_critical_first(self, auth_client, setup_db, monkeypatch):
        applied_order = []

        def fake_already_applied(item_id, user_id):
            return False

        def fake_mark_applied(item_id, user_id, endpoint):
            applied_order.append(item_id)

        monkeypatch.setattr(offline_sync, "_already_applied", fake_already_applied)
        monkeypatch.setattr(offline_sync, "_mark_applied", fake_mark_applied)

        items = [
            _xp_item("normal-1", xp=10, priority="normal"),
            _xp_item("critical-1", xp=10, priority="critical"),
            _xp_item("high-1", xp=10, priority="high"),
        ]

        r = auth_client.post(
            "/api/sync/drain",
            json={"device_id": "devA", "items": items, "client_time": _now_iso()},
        )
        assert r.status_code == 200, r.text
        # critical applied first, then high, then normal
        assert applied_order[0] == "critical-1"
        assert applied_order.index("high-1") < applied_order.index("normal-1")


class TestDrainPerBatchXpCap:
    def test_per_batch_cap_enforced(self, auth_client, setup_db, monkeypatch):
        monkeypatch.setattr(offline_sync, "_already_applied", lambda *a, **kw: False)
        monkeypatch.setattr(offline_sync, "_mark_applied", lambda *a, **kw: None)

        # 20 items × 500 XP each = 10000 requested, cap is 5000
        items = [_xp_item(f"x-{i}", xp=500) for i in range(20)]
        r = auth_client.post(
            "/api/sync/drain",
            json={"device_id": "devA", "items": items, "client_time": _now_iso()},
        )
        assert r.status_code == 200
        results = r.json()["results"]
        applied = [r for r in results if r["status"] == "applied"]
        rejected = [r for r in results if r["status"] == "rejected"]
        # MAX_XP_PER_BATCH = 5000 → only 10 items at 500 each fit
        assert len(applied) == 10, f"expected 10 applied, got {len(applied)}"
        assert len(rejected) == 10
        for r_ in rejected:
            assert "batch xp cap" in (r_.get("error") or "").lower()

"""
Tests for offline_sync.py — the /api/sync/drain endpoint.

All external calls (DB, RPCs) are mocked. We override
auth.Auth.get_current_user via FastAPI dependency override.
"""
from datetime import datetime, timedelta, timezone
from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient

# The app mounts services.offline_sync; import that (not the stale root shim)
# so monkeypatches and module-constant reads hit the live module.
import services.offline_sync as offline_sync
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
        if name == "try_award_offline_xp_idem":
            # Idempotent grant RPC: returns JSONB. Default fake grants what was
            # requested and never reports a duplicate.
            granted = int((params or {}).get("p_request", 0))
            rpc_obj.execute.return_value = MagicMock(data={
                "granted": granted,
                "already_applied": False,
                "capped": granted == 0,
                "new_points": 100 + granted,
            })
        elif name == "append_user_level_progress":
            rpc_obj.execute.return_value = MagicMock(
                data={"new_points": 200, "current_level": 2}
            )
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
            if name == "try_award_offline_xp_idem":
                observed["p_request"] = params.get("p_request")
                observed["p_item_id"] = params.get("p_item_id")
                rpc_obj.execute.return_value = MagicMock(data={
                    "granted": int(params["p_request"]),
                    "already_applied": False,
                    "capped": False,
                    "new_points": 600,
                })
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


# ─────────────────────────────────────────────────────────────
# Regression tests for the XP-economy fixes
# (idempotent grant RPC + server-derived natural keys + fail-closed timestamps)
# ─────────────────────────────────────────────────────────────


def _fake_ledger_rpc(ledger: dict, grants: list, raise_on_xp_event_insert=None):
    """
    Build an rpc side_effect that faithfully models the new
    `try_award_offline_xp_idem` semantics: the sync_log row is claimed in the
    SAME call as the grant, so a duplicate p_item_id grants nothing.

    `ledger` maps item_id -> True. `grants` accumulates every non-zero grant.
    """
    def rpc_side_effect(name, params=None):
        rpc_obj = MagicMock()
        params = params or {}
        if name == "try_award_offline_xp_idem":
            key = params["p_item_id"]
            if key in ledger:
                rpc_obj.execute.return_value = MagicMock(data={
                    "granted": 0, "already_applied": True,
                    "capped": False, "new_points": 100,
                })
            else:
                ledger[key] = True
                granted = int(params.get("p_request", 0))
                if granted > 0:
                    grants.append(granted)
                rpc_obj.execute.return_value = MagicMock(data={
                    "granted": granted, "already_applied": False,
                    "capped": granted == 0, "new_points": 100 + sum(grants),
                })
        elif name == "append_user_level_progress":
            rpc_obj.execute.return_value = MagicMock(
                data={"new_points": 100 + sum(grants), "current_level": 2}
            )
        else:
            rpc_obj.execute.return_value = MagicMock(data=None)
        return rpc_obj
    return rpc_side_effect


class TestGrantExactlyOnceOnRetry:
    def test_retry_after_post_grant_failure_grants_once(
        self, auth_client, setup_db, monkeypatch
    ):
        """
        Bug: the grant committed, then the xp_events insert and the sync_log
        marker ran as separate statements. A failure in between produced
        CONFLICT, the client retried the same item, the fast-path dedup still
        said "not applied" and the RPC re-granted.

        Here the fast-path dedup is forced to always MISS, so the only thing
        standing between the retry and a double grant is the RPC's
        in-transaction ledger claim.
        """
        ledger: dict = {}
        grants: list = []

        monkeypatch.setattr(offline_sync, "_already_applied", lambda *a, **kw: False)
        monkeypatch.setattr(offline_sync, "_mark_applied", lambda *a, **kw: None)

        sc = setup_db.get_service_client.return_value
        sc.rpc.side_effect = _fake_ledger_rpc(ledger, grants)

        # First attempt: the post-grant xp_events insert blows up.
        boom = {"n": 0}

        def table_side_effect(name):
            tbl = MagicMock()
            if name == "xp_events":
                boom["n"] += 1
                if boom["n"] == 1:
                    tbl.insert.return_value.execute.side_effect = RuntimeError(
                        "simulated post-grant failure"
                    )
            return tbl

        sc.table.side_effect = table_side_effect

        item = _xp_item("retry-1", xp=200)
        payload = {"device_id": "devA", "items": [item], "client_time": _now_iso()}

        r1 = auth_client.post("/api/sync/drain", json=payload)
        assert r1.status_code == 200, r1.text
        assert r1.json()["results"][0]["status"] == "conflict"
        assert grants == [200], f"first attempt should have granted once, got {grants}"

        # Client retries the very same item.
        r2 = auth_client.post("/api/sync/drain", json=payload)
        assert r2.status_code == 200, r2.text
        # Reported as applied so the client drops it...
        assert r2.json()["results"][0]["status"] == "applied"
        # ...and crucially, no second grant.
        assert grants == [200], f"retry must not re-grant XP, got {grants}"


class TestCompleteLevelReplay:
    def _level_item(self, item_id, level_id=5, perfect=False):
        return {
            "id": item_id,
            "priority": "normal",
            "endpoint": "/api/game/complete-level",
            "method": "POST",
            "body": {"level_id": level_id, "score": 200, "is_perfect": perfect,
                     "track": "crypto"},
            "created_at": _now_iso(),
            "attempts": 0,
            "device_id": "devA",
        }

    def test_replaying_completed_level_grants_no_extra_xp(
        self, auth_client, setup_db, monkeypatch
    ):
        """
        Bug: _handle_complete_level bypassed the capped/idempotent RPC and paid
        a flat 50 XP for every replay, keyed only on the client-generated
        item.id — so a fresh UUID per replay was unbounded free XP.

        Each replay below uses a DIFFERENT client item id; only the
        server-derived natural key stops it.
        """
        ledger: dict = {}
        grants: list = []

        monkeypatch.setattr(offline_sync, "_already_applied", lambda *a, **kw: False)
        monkeypatch.setattr(offline_sync, "_mark_applied", lambda *a, **kw: None)

        sc = setup_db.get_service_client.return_value
        sc.rpc.side_effect = _fake_ledger_rpc(ledger, grants)

        for n in range(5):
            r = auth_client.post("/api/sync/drain", json={
                "device_id": "devA",
                "items": [self._level_item(f"fresh-uuid-{n}", level_id=5)],
                "client_time": _now_iso(),
            })
            assert r.status_code == 200, r.text
            result = r.json()["results"][0]
            assert result["status"] == "applied"
            expected_xp = 100 if n == 0 else 0
            assert result["response"]["xp_earned"] == expected_xp, (
                f"replay #{n} paid {result['response']['xp_earned']}"
            )

        # LEVEL_COMPLETE_XP granted exactly once across 5 replays.
        assert grants == [100], f"expected a single grant, got {grants}"

    def test_perfect_bonus_still_payable_on_a_later_perfect_run(
        self, auth_client, setup_db, monkeypatch
    ):
        """Base completion and perfect bonus use separate natural keys, so a
        later perfect run earns the bonus once without re-earning base XP."""
        ledger: dict = {}
        grants: list = []

        monkeypatch.setattr(offline_sync, "_already_applied", lambda *a, **kw: False)
        monkeypatch.setattr(offline_sync, "_mark_applied", lambda *a, **kw: None)

        sc = setup_db.get_service_client.return_value
        sc.rpc.side_effect = _fake_ledger_rpc(ledger, grants)

        auth_client.post("/api/sync/drain", json={
            "device_id": "devA",
            "items": [self._level_item("run-1", level_id=7, perfect=False)],
            "client_time": _now_iso(),
        })
        r2 = auth_client.post("/api/sync/drain", json={
            "device_id": "devA",
            "items": [self._level_item("run-2", level_id=7, perfect=True)],
            "client_time": _now_iso(),
        })
        assert r2.json()["results"][0]["response"]["xp_earned"] == 250  # bonus only

        # A third perfect run pays nothing at all.
        r3 = auth_client.post("/api/sync/drain", json={
            "device_id": "devA",
            "items": [self._level_item("run-3", level_id=7, perfect=True)],
            "client_time": _now_iso(),
        })
        assert r3.json()["results"][0]["response"]["xp_earned"] == 0
        assert grants == [100, 250], f"got {grants}"

    def test_complete_level_respects_per_item_cap(self, auth_client, setup_db, monkeypatch):
        """complete-level now goes through the same capped RPC as xp-event."""
        observed = []
        monkeypatch.setattr(offline_sync, "_already_applied", lambda *a, **kw: False)
        monkeypatch.setattr(offline_sync, "_mark_applied", lambda *a, **kw: None)

        sc = setup_db.get_service_client.return_value

        def rpc_side_effect(name, params=None):
            rpc_obj = MagicMock()
            if name == "try_award_offline_xp_idem":
                observed.append(params["p_request"])
                rpc_obj.execute.return_value = MagicMock(data={
                    "granted": params["p_request"], "already_applied": False,
                    "capped": False, "new_points": 100,
                })
            else:
                rpc_obj.execute.return_value = MagicMock(data=None)
            return rpc_obj

        sc.rpc.side_effect = rpc_side_effect
        auth_client.post("/api/sync/drain", json={
            "device_id": "devA",
            "items": [self._level_item("cap-lvl", level_id=9, perfect=True)],
            "client_time": _now_iso(),
        })
        assert observed, "complete-level must call the capped grant RPC"
        for req in observed:
            assert req <= offline_sync.MAX_XP_PER_ITEM


class TestStreakCheck:
    """
    Regression tests for the streak-check fixes: server-side date, bonus only
    on a real advance, capped + idempotent payment, fail-closed on bad dates.
    """

    def _streak_item(self, item_id, date=None):
        body = {} if date is None else {"date": date}
        return {
            "id": item_id,
            "priority": "normal",
            "endpoint": "/api/users/streak",
            "method": "POST",
            "body": body,
            "created_at": _now_iso(),
            "attempts": 0,
            "device_id": "devA",
        }

    def _streak_rpc(self, ledger, grants, calls, streak_on_advance=2):
        """
        Models `touch_user_streak_v2`: the FIRST call of a (simulated) server
        day advances the streak; every later call the same day reports
        advanced=false, exactly like last_played already being CURRENT_DATE.
        """
        server_day = "2026-08-02"
        state = {"advanced_once": False, "streak": 1}
        base = _fake_ledger_rpc(ledger, grants)

        def rpc_side_effect(name, params=None):
            params = params or {}
            calls.append((name, params))
            if name == "touch_user_streak_v2":
                rpc_obj = MagicMock()
                if state["advanced_once"]:
                    advanced = False
                else:
                    state["advanced_once"] = True
                    state["streak"] = streak_on_advance
                    advanced = True
                rpc_obj.execute.return_value = MagicMock(data={
                    "streak": state["streak"],
                    "last_played": server_day,
                    "advanced": advanced,
                    "previous_last_played": "2026-08-01",
                })
                return rpc_obj
            return base(name, params)

        return rpc_side_effect

    def test_replaying_streak_check_pays_bonus_once(
        self, auth_client, setup_db, monkeypatch
    ):
        """
        Bug: the bonus was recomputed from the CURRENT streak value, so a replay
        where the streak did not move (diff == 0) still paid in full — with a
        fresh client item id each time, unboundedly.
        """
        ledger, grants, calls = {}, [], []
        monkeypatch.setattr(offline_sync, "_already_applied", lambda *a, **kw: False)
        monkeypatch.setattr(offline_sync, "_mark_applied", lambda *a, **kw: None)

        sc = setup_db.get_service_client.return_value
        sc.rpc.side_effect = self._streak_rpc(ledger, grants, calls, streak_on_advance=2)

        bonuses = []
        for n in range(4):
            r = auth_client.post("/api/sync/drain", json={
                "device_id": "devA",
                "items": [self._streak_item(f"fresh-streak-{n}")],
                "client_time": _now_iso(),
            })
            assert r.status_code == 200, r.text
            result = r.json()["results"][0]
            assert result["status"] == "applied", result
            # Response contract preserved.
            assert "streak" in result["response"]
            assert "bonus_earned" in result["response"]
            bonuses.append(result["response"]["bonus_earned"])

        # STREAK_BONUS[1] == 200 for streak 2, paid on the advance only.
        assert bonuses == [200, 0, 0, 0], bonuses
        assert grants == [200], f"bonus must be paid once per streak day, got {grants}"

    def test_client_date_cannot_inflate_streak(self, auth_client, setup_db, monkeypatch):
        """
        Bug: `today_str = body.get("date", ...)` let the client choose the date
        the streak was computed from. The date must never reach the streak
        calculation, and a future date is rejected outright.
        """
        ledger, grants, calls = {}, [], []
        monkeypatch.setattr(offline_sync, "_already_applied", lambda *a, **kw: False)
        monkeypatch.setattr(offline_sync, "_mark_applied", lambda *a, **kw: None)

        sc = setup_db.get_service_client.return_value
        sc.rpc.side_effect = self._streak_rpc(ledger, grants, calls, streak_on_advance=2)

        far_future = (datetime.now(timezone.utc) + timedelta(days=900)).date().isoformat()
        r = auth_client.post("/api/sync/drain", json={
            "device_id": "devA",
            "items": [self._streak_item("future-date", date=far_future)],
            "client_time": _now_iso(),
        })
        assert r.status_code == 200, r.text
        result = r.json()["results"][0]
        assert result["status"] == "rejected", result
        assert "future" in (result.get("error") or "").lower()

        # A backdated one — old enough to fabricate a gap — is also refused,
        # and in no case is a client date passed to the streak RPC.
        stale = (datetime.now(timezone.utc) - timedelta(days=30)).date().isoformat()
        r2 = auth_client.post("/api/sync/drain", json={
            "device_id": "devA",
            "items": [self._streak_item("stale-date", date=stale)],
            "client_time": _now_iso(),
        })
        assert r2.json()["results"][0]["status"] == "rejected"

        assert grants == [], "a rejected streak item must not pay a bonus"
        for name, params in calls:
            if name == "touch_user_streak_v2":
                assert set(params) == {"p_user_id"}, params

    def test_streak_bonus_respects_per_item_cap(self, auth_client, setup_db, monkeypatch):
        """A streak-7 bonus (1500) must be clamped to MAX_XP_PER_ITEM (500)."""
        ledger, grants, calls = {}, [], []
        monkeypatch.setattr(offline_sync, "_already_applied", lambda *a, **kw: False)
        monkeypatch.setattr(offline_sync, "_mark_applied", lambda *a, **kw: None)

        sc = setup_db.get_service_client.return_value
        sc.rpc.side_effect = self._streak_rpc(ledger, grants, calls, streak_on_advance=7)

        assert offline_sync.settings.STREAK_BONUS[6] > offline_sync.MAX_XP_PER_ITEM

        r = auth_client.post("/api/sync/drain", json={
            "device_id": "devA",
            "items": [self._streak_item("cap-streak")],
            "client_time": _now_iso(),
        })
        assert r.status_code == 200, r.text
        assert r.json()["results"][0]["status"] == "applied"

        awards = [p for n, p in calls if n == "try_award_offline_xp_idem"]
        assert awards, "streak bonus must go through the capped grant RPC"
        for params in awards:
            assert params["p_request"] <= offline_sync.MAX_XP_PER_ITEM
            # Server-derived key, never the client's queue-item id.
            assert params["p_item_id"] != "cap-streak"

    def test_unparseable_date_is_rejected(self, auth_client, setup_db, monkeypatch):
        """Fail closed, consistent with created_at / client_time handling."""
        ledger, grants, calls = {}, [], []
        monkeypatch.setattr(offline_sync, "_already_applied", lambda *a, **kw: False)
        monkeypatch.setattr(offline_sync, "_mark_applied", lambda *a, **kw: None)

        sc = setup_db.get_service_client.return_value
        sc.rpc.side_effect = self._streak_rpc(ledger, grants, calls)

        r = auth_client.post("/api/sync/drain", json={
            "device_id": "devA",
            "items": [self._streak_item("bad-date", date="yesterday-ish")],
            "client_time": _now_iso(),
        })
        assert r.status_code == 200, r.text
        result = r.json()["results"][0]
        assert result["status"] == "rejected", result
        assert "date" in (result.get("error") or "").lower()
        assert grants == []
        assert not any(n == "touch_user_streak_v2" for n, _ in calls)


class TestTimestampsFailClosed:
    def test_unparseable_created_at_is_rejected(self, auth_client, setup_db, monkeypatch):
        monkeypatch.setattr(offline_sync, "_already_applied", lambda *a, **kw: False)
        monkeypatch.setattr(offline_sync, "_mark_applied", lambda *a, **kw: None)

        item = _xp_item("bad-ts", xp=100, created_at="not-a-timestamp")
        r = auth_client.post("/api/sync/drain", json={
            "device_id": "devA", "items": [item], "client_time": _now_iso(),
        })
        assert r.status_code == 200, r.text
        result = r.json()["results"][0]
        assert result["status"] == "rejected"
        assert "created_at" in (result.get("error") or "")

        # And no XP was requested for it.
        sc = setup_db.get_service_client.return_value
        for call in sc.rpc.call_args_list:
            assert call.args[0] != "try_award_offline_xp_idem"

    def test_unparseable_client_time_rejects_batch(self, auth_client, setup_db):
        r = auth_client.post("/api/sync/drain", json={
            "device_id": "devA",
            "items": [_xp_item("ct-1", xp=100)],
            "client_time": "garbage",
        })
        assert r.status_code == 400
        assert "client_time" in r.text

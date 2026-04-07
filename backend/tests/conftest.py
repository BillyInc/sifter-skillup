import importlib

import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient


@pytest.fixture(autouse=True)
def patch_all_db_modules(monkeypatch):
    """
    Patch the module-level `db` reference in every backend module that does
    `from database import db`. New route modules capture the reference at
    import time, so simply patching `database.db` is not enough.
    Also disables SINGLE_DEVICE_ENFORCEMENT so middleware doesn't 401 on
    requests without an X-Device-Id header.
    """
    import database
    mock = MagicMock()
    mock.get_client.return_value = MagicMock()
    mock.get_service_client.return_value = MagicMock()
    monkeypatch.setattr(database, "db", mock)
    for mod_name in [
        "main",
        "auth",
        "starknet_routes",
        "device_sessions",
        "phase5_routes",
        "feed_routes",
        "social_rewards_routes",
        "interview_routes",
        "content_routes",
        "game_extra_routes",
        "offline_sync",
        "airtable_sync",
        "session_middleware",
        "portfolio_routes",
        "community_routes",
        "missing_routes",
    ]:
        try:
            mod = importlib.import_module(mod_name)
        except ImportError:
            continue
        if hasattr(mod, "db"):
            monkeypatch.setattr(f"{mod_name}.db", mock, raising=False)
    # Disable single-device enforcement for tests so middleware lets us through
    try:
        import session_middleware
        monkeypatch.setattr(session_middleware.settings, "SINGLE_DEVICE_ENFORCEMENT", False, raising=False)
    except Exception:
        pass
    return mock


@pytest.fixture
def mock_db(patch_all_db_modules):
    return patch_all_db_modules


@pytest.fixture
def mock_redis():
    mock = MagicMock()
    mock.get.return_value = None
    mock.setex.return_value = True
    mock.delete.return_value = True
    return mock


@pytest.fixture
def sample_user():
    return {
        "id": "test-user-123",
        "telegram_id": None,
        "wallet_address": None,
        "username": "TestUser",
        "avatar_url": None,
        "auth_provider": "guest",
        "points": 1000,
        "streak": 1,
        "last_played": "2026-03-13",
        "current_level": 1,
        "completed_levels": [],
        "perfect_levels": [],
        "python_chapters_completed": [],
        "active_track": "crypto",
        "boosters": {"hammer": 3, "lightning": 2, "shuffle": 5},
        "achievements": [],
        "settings": {"notifications": True, "sound": True, "haptics": True},
        "guild_id": None,
        "is_verified": False,
        "github_token": None,
        "github_username": None,
        "github_avatar": None,
        "push_token": None,
        "onboarding_completed": False,
    }


@pytest.fixture
def auth_header():
    from auth import Auth
    token = Auth.create_jwt("test-user-123")
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def client(mock_db):
    with patch("main.db", mock_db), \
         patch("auth.db", mock_db), \
         patch("portfolio_routes.db", mock_db), \
         patch("database.db", mock_db):
        from main import app
        yield TestClient(app)

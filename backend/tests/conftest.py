import sys

import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient


@pytest.fixture(autouse=True)
def patch_all_db_modules(monkeypatch):
    """
    Patch the module-level `db` reference in every backend module that did
    `from database import db`. Route/service/middleware modules capture the
    reference at import time, so patching `database.db` alone is not enough.

    We identify those modules by scanning `sys.modules` for any already-imported
    module whose `db` attribute *is* the original `database.db` singleton. This
    avoids a hardcoded module list that silently rots when code moves (the app
    now mounts `routes.starknet_routes`, `services.offline_sync`,
    `middleware.device_sessions`, etc. — the old bare-name list missed all of
    those, so the real modules kept a live Supabase client and the tests hit the
    network). Importing `main` at the top of each test module ensures every
    mounted route module is already in `sys.modules` by the time this runs.

    Also disables SINGLE_DEVICE_ENFORCEMENT (a settings singleton, so patching it
    once affects the middleware app-wide) so requests without an X-Device-Id
    header aren't 401'd.
    """
    import database
    original_db = database.db
    mock = MagicMock()
    mock.get_client.return_value = MagicMock()
    mock.get_service_client.return_value = MagicMock()
    monkeypatch.setattr(database, "db", mock)

    for module in list(sys.modules.values()):
        if module is None:
            continue
        try:
            if module.__dict__.get("db") is original_db:
                monkeypatch.setattr(module, "db", mock, raising=False)
        except (AttributeError, TypeError):
            continue

    # Disable single-device enforcement for tests so middleware lets us through.
    try:
        from config import settings
        monkeypatch.setattr(settings, "SINGLE_DEVICE_ENFORCEMENT", False, raising=False)
    except Exception:
        pass
    return mock


@pytest.fixture(autouse=True)
def reset_career_skill_index():
    """Never let a mocked skill index leak between tests.

    `routes.career_routes` caches the flattened career skill index in a module
    global for 900s. A test that builds it from mock rows would otherwise serve
    those rows to every later test in the session (and to any test that does
    not patch `_svc` at all), which is both a false pass and a false failure
    waiting to happen. Reset on both sides so the leak cannot come from an
    earlier test either.
    """
    try:
        import routes.career_routes as career_routes
    except Exception:  # pragma: no cover - the module may not be importable
        yield
        return
    def clear():
        career_routes._reset_skill_index_cache()
        # The stale-while-revalidate path parks a background refresh task, and
        # the build lock and thread limiters are event-loop-bound too. All of
        # them now live in the PER-LOOP state dict, so one call clears the lot;
        # left behind, a refresh handle from a closed loop is `done() == False`
        # forever and the next stale read silently declines to rebuild.
        career_routes._reset_skill_loop_state()

    clear()
    try:
        yield
    finally:
        clear()


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

import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient


@pytest.fixture
def mock_db():
    mock = MagicMock()
    mock.get_client.return_value = MagicMock()
    mock.get_service_client.return_value = MagicMock()
    return mock


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

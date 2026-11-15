import gzip
import shutil
import sys
from pathlib import Path

import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient


# ---------------------------------------------------------------------------
# D078 / career-mapping gz transport materialization
#
# Repository transport rule (see CLAUDE.md): generated audit JSON and
# generated seed SQL are committed only as `.json.gz` / `.sql.gz` transport
# artifacts; the raw counterparts are not part of the push package. The
# D078 guided-learning tests (and the production modules they import, e.g.
# `d078_guided_areas.py` / `d078_guided_content.py`) read the plain file
# directly, so a clean checkout needs those transports decompressed once
# before the suite runs. This mirrors the repo's existing decompress-before-
# use convention (see `data/career-mapping/split_large_artifacts.py` and
# `data/career-mapping/_role_tools_loader.py`), just automated for tests.
#
# The materialized files are written next to their `.gz` source (the exact
# path the production code expects) and are gitignored -- never commit them.
ROOT_DIR = Path(__file__).resolve().parents[2]
_GZ_TRANSPORT_PATHS = [
    ROOT_DIR / "data/career-mapping/domain_specialization_catalog.json",
    ROOT_DIR / "data/career-mapping/_audit/D078_PROGRAMME_TO_ROLE_LEARNING_PATH_GRAPH_2026_10_15.json",
    ROOT_DIR / "data/career-mapping/_audit/D078_PROGRAMME_TO_ROLE_LEARNING_PATH_GRAPH_2026_10_15.rebuilt.json",
    ROOT_DIR / "data/career-mapping/_audit/D078_MASTER_GUIDED_EXPERIENCE_RECONCILIATION_2026_10_12.json",
    ROOT_DIR / "data/career-mapping/_audit/D078_STUDENT_PROMOTION_GATE_2026_10_10.json",
    ROOT_DIR / "data/career-mapping/_audit/D078_ROLE_TOOL_ROUTE_ENRICHMENT_2026_10_16.json",
    ROOT_DIR / "data/career-mapping/_audit/D078_REQUIREMENT_LANE_DISPOSITION_2026_10_17.json",
    ROOT_DIR / "data/career-mapping/_audit/D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json",
    ROOT_DIR / "data/career-mapping/_audit/D078_RELATIONSHIP_RESOLUTION_2026_10_20.json",
    ROOT_DIR / "data/career-mapping/_audit/D078_REQUIREMENT_LANE_DISPOSITION_2026_10_20.json",
    ROOT_DIR / "data/career-mapping/_audit/D078_REQUIREMENT_LANE_REPAIR_SUMMARY_2026_10_20.json",
    ROOT_DIR / "backend/seed_d078_guided_content_2026-10-12.sql",
    ROOT_DIR / "backend/seed_d078_specialization_taxonomy_2026-10-12.sql",
    ROOT_DIR / "backend/seed_d078_role_tools_2026-10-16.sql",
    ROOT_DIR / "backend/seed_d078_role_item_contracts_2026-10-15.sql",
]


def _materialize_gz_transport(path: Path) -> None:
    """Decompress ``path``'s committed ``.gz`` transport, always overwriting
    any existing plain file. A session only runs this once per path, but a
    stale plain file can otherwise outlive the session that wrote it --
    gitignored, so it is never cleaned by git, and a later `.gz` regeneration
    would then be silently shadowed by old content. No-op if the `.gz` is
    absent (lets the caller's own FileNotFoundError surface normally)."""
    gz_path = path.with_name(path.name + ".gz")
    if not gz_path.exists():
        return
    with gzip.open(gz_path, "rb") as source, path.open("wb") as destination:
        shutil.copyfileobj(source, destination)


@pytest.fixture(scope="session", autouse=True)
def _d078_gz_transports():
    for path in _GZ_TRANSPORT_PATHS:
        _materialize_gz_transport(path)


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

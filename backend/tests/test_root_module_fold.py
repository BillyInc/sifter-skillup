"""Guards for folding the root-level backend modules into the package layout.

The Celery worker, the session middleware and the game-extra routes used to
import a second copy of several modules by bare name (``from device_sessions
import ...``). Those copies drifted from the ones ``main.py`` serves. These
tests pin the single canonical locations and the Celery task names.
"""
import ast
import importlib
from pathlib import Path

import pytest

BACKEND = Path(__file__).resolve().parents[1]

# Modules that must exist only under a package, never as a root-level copy.
_FOLDED = ("airtable_sync", "device_sessions", "fcm_service", "twitter_service")
# feed_routes keeps a root file (unserved candidate implementation, see PR
# description) but nothing may import it by bare name any more.
_NO_BARE_IMPORT = _FOLDED + ("feed_routes",)


def _python_files():
    for path in BACKEND.rglob("*.py"):
        parts = set(path.relative_to(BACKEND).parts)
        if ".venv" in parts or "__pycache__" in parts or "tests" in parts:
            continue
        yield path


def _bare_imports(path: Path):
    tree = ast.parse(path.read_text(encoding="utf-8"), filename=str(path))
    for node in ast.walk(tree):
        if isinstance(node, ast.ImportFrom) and node.level == 0 and node.module:
            if node.module.split(".")[0] in _NO_BARE_IMPORT and "." not in node.module:
                yield node.module
        elif isinstance(node, ast.Import):
            for alias in node.names:
                if alias.name in _NO_BARE_IMPORT:
                    yield alias.name


def test_no_module_imports_a_folded_root_module_by_bare_name():
    offenders = {
        str(p.relative_to(BACKEND)): sorted(set(_bare_imports(p)))
        for p in _python_files()
        if list(_bare_imports(p))
    }
    assert offenders == {}


@pytest.mark.parametrize("name", _FOLDED)
def test_folded_root_modules_are_gone(name):
    assert not (BACKEND / f"{name}.py").exists()


@pytest.mark.parametrize(
    "dotted",
    [
        "services.airtable_sync",
        "services.fcm_service",
        "services.twitter_service",
        "middleware.device_sessions",
        "middleware.session_middleware",
        "routes.feed_routes",
        "routes.game_extra_routes",
    ],
)
def test_canonical_modules_import(dotted):
    importlib.import_module(dotted)


_TASK_NAMES = [
    "celery_worker.check_enrichment_freshness",
    "celery_worker.cleanup_expired_sessions",
    "celery_worker.cleanup_notifications",
    "celery_worker.compile_admission_snapshot",
    "celery_worker.compute_elite_composite",
    "celery_worker.expire_old_sync_log",
    "celery_worker.fetch_labour_market_demand",
    "celery_worker.hard_delete_expired_accounts",
    "celery_worker.ingest_track_feeds",
    "celery_worker.process_withdrawals",
    "celery_worker.reconcile_student_merge_candidates",
    "celery_worker.reset_daily_quests",
    "celery_worker.sync_airtable",
    "celery_worker.update_guild_ranks",
]


def test_celery_worker_imports_and_keeps_task_names():
    celery_worker = importlib.import_module("celery_worker")
    names = sorted(n for n in celery_worker.celery.tasks if n.startswith("celery_worker."))
    # Task names are part of the beat schedule and the broker's queued messages.
    assert names == _TASK_NAMES
    scheduled = {v["task"] for v in celery_worker.celery.conf.beat_schedule.values()}
    assert scheduled <= set(celery_worker.celery.tasks)


def test_sync_airtable_task_runs_the_canonical_service(monkeypatch):
    import types

    from services import airtable_sync

    calls = []

    async def fake_run(tables=None):
        calls.append(tables)
        return [types.SimpleNamespace(records_synced=3, table="t", error=None)]

    monkeypatch.setattr(airtable_sync, "run_airtable_sync", fake_run)
    celery_worker = importlib.import_module("celery_worker")
    result = celery_worker.sync_airtable.run()
    assert result == {"status": "success", "records_synced": 3, "errors": []}
    assert calls == [None]


def test_feed_ingest_task_resolves_the_package_route_module():
    from routes import feed_routes

    # The task imports ingest_feed_for_track lazily from routes.feed_routes.
    assert callable(feed_routes.ingest_feed_for_track)
    import inspect

    celery_worker = importlib.import_module("celery_worker")
    assert "from routes.feed_routes import ingest_feed_for_track" in inspect.getsource(
        celery_worker.ingest_track_feeds
    )


def test_airtable_trigger_requires_the_is_admin_flag():
    import asyncio

    from fastapi import HTTPException

    from services import airtable_sync

    for user in ({"id": "u", "is_verified": True}, {"id": "u"}):
        with pytest.raises(HTTPException) as exc:
            asyncio.run(airtable_sync.trigger_airtable_sync(body=None, current_user=user))
        assert exc.value.status_code == 403


def test_airtable_sync_does_not_expose_the_upstream_body(monkeypatch):
    import inspect

    from services import airtable_sync

    source = inspect.getsource(airtable_sync)
    assert "resp.text[:200]" not in source
    assert "MAX_PAGES" in source

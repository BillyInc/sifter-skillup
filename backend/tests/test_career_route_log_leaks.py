"""Every unauthenticated `career_routes` handler, driven into a real DB failure.

The behavioural half of `test_log_safety_source.py` for the module that file's
own docstring admits was the weak spot: the enumerating test in
`test_career_search_skills.py` covers 9 of the 31 `except` blocks, and five of
the uncovered ones are UNAUTHENTICATED -- `get_opportunity`,
`list_elite_pathways`, `get_elite_pathway`, `get_bridge_plan` and skill
discovery. `get_opportunity` had no test of any kind: a mutation making it raise
`AttributeError` on every database failure -- a 500 on an unauthenticated
endpoint -- survived the whole suite.

A source check cannot be complete (five bypasses of the previous matcher were
demonstrated, two of them leaking), and an enumeration cannot be complete
either. This file is the second net, not the only one, and
`test_the_list_here_covers_every_unauthenticated_handler` is what keeps it from
going stale the way the 9-of-31 list did.

WHERE THE FAILURE IS INJECTED. `_ExplodesAtExecute` fails inside `.execute()` --
where PostgREST actually fails -- and builds its URL from the filters the
handler really passed, so the needle in the exception is the HANDLER'S OWN
INPUT rather than a hard-coded string. The sibling file's `_exploded_db` fails
at `get_service_client()`, before any filter exists, so nothing there proves the
user's term would have been in the URL.
"""

import asyncio
import inspect
import traceback
from contextlib import contextmanager
from urllib.parse import quote_plus

import pytest
from loguru import logger as loguru_logger

import routes.career_routes as cr

# The probe itself is `conftest.ExplodesAtExecute`, reached through the
# `exploding_client` FIXTURE: pytest 9 defaults to `importmode=importlib`, so
# test modules cannot import each other, and `test_public_route_log_leaks.py`
# needs the same probe.
#
# The live dev project ref is never written down in a test file. This branch
# exists to stop that ref reaching a log sink, and a checked-in fixture is a
# worse sink than a log file.
PROJECT_REF = "abcdefghijklmnop"
NEEDLE = "my secret search"


@contextmanager
def captured_logs(level="DEBUG"):
    """Capture at DEBUG and filter in the assertions.

    Capturing at WARNING cannot see an INFO-level leak, and
    `log_db_failure(..., level="info")` is in live use
    (`admission_routes.py`'s address enrichment), so a WARNING sink did not
    match the scope the assertions claimed.
    """
    records = []
    sink_id = loguru_logger.add(lambda message: records.append(message.record), level=level)
    try:
        yield records
    finally:
        loguru_logger.remove(sink_id)


def _formatted_exception(record):
    """The traceback text loguru would render, i.e. the third leak channel."""
    info = record.get("exception")
    if not info:
        return ""
    try:
        return "".join(traceback.format_exception(info.type, info.value, info.traceback))
    except Exception:  # noqa: BLE001
        return str(info)


def _blob(record):
    return f"{record['message']}|{record['extra']}|{_formatted_exception(record)}"


# Every unauthenticated handler in `career_routes`, with arguments carrying a
# recognisable needle wherever the endpoint accepts free text.
ROUTES = {
    "list_programmes": lambda: cr.list_programmes(q=NEEDLE, institution_type=None, limit=20),
    "get_programme": lambda: cr.get_programme(NEEDLE),
    "list_domain_clusters": lambda: cr.list_domain_clusters(),
    "get_domain": lambda: cr.get_domain(NEEDLE),
    "get_role": lambda: cr.get_role(NEEDLE),
    "list_opportunities": lambda: cr.list_opportunities(domain_id=NEEDLE, limit=20),
    "get_opportunity": lambda: cr.get_opportunity(NEEDLE),
    "list_elite_pathways": lambda: cr.list_elite_pathways(),
    "get_elite_pathway": lambda: cr.get_elite_pathway(NEEDLE),
    "get_bridge_plan": lambda: cr.get_bridge_plan(NEEDLE),
    "list_scholarships": lambda: cr.list_scholarships(limit=20),
    "list_application_windows": lambda: cr.list_application_windows(limit=20),
    "discover_by_skills": lambda: cr.discover_by_skills(
        skills=NEEDLE, match="both", intent="learned",
        category=None, user_type=None, admin_type=None,
    ),
    "discover_by_skills_post": lambda: cr.discover_by_skills_post({"skills": [NEEDLE]}),
    "search_career": lambda: cr.search_career(
        q=NEEDLE, intent=None, user_type=None, school_id=None
    ),
    "get_pivot": lambda: cr.get_pivot(NEEDLE),
    "get_pivot_gap": lambda: cr.get_pivot_gap(NEEDLE, to_domain_key=None, to_role_key=None),
    "get_jamb_domains": lambda: cr.get_jamb_domains(NEEDLE),
}


@pytest.fixture(autouse=True)
def _no_cached_skill_index():
    cr._reset_skill_index_cache()
    cr._reset_skill_loop_state()
    yield
    cr._reset_skill_index_cache()
    cr._reset_skill_loop_state()


def _run(name, exploding_client):
    exploded = exploding_client(PROJECT_REF)
    original = cr.db
    cr.db = exploded
    try:
        with captured_logs("DEBUG") as records:
            asyncio.run(ROUTES[name]())
    finally:
        cr.db = original
    return exploded, records


@pytest.mark.parametrize("name", sorted(ROUTES))
def test_no_unauthenticated_career_handler_logs_the_raw_exception(name, exploding_client):
    exploded, records = _run(name, exploding_client)
    assert exploded.urls, (
        f"{name} never reached `.execute()`, so this test proves nothing about "
        "what a failed query would have logged"
    )
    reported = [r for r in records if r["level"].no >= 20]  # INFO and above
    assert reported, f"{name} must still report the failure above DEBUG"
    for record in reported:
        blob = _blob(record)
        assert PROJECT_REF not in blob, f"{name} leaked the project ref: {blob}"
        assert "secret" not in blob, f"{name} leaked the user's input: {blob}"


@pytest.mark.parametrize("name", sorted(ROUTES))
def test_each_career_handler_still_reports_something_actionable(name, exploding_client):
    """Silence would pass the test above. The failure must still be visible."""
    _exploded, records = _run(name, exploding_client)
    reported = [r for r in records if r["level"].no >= 20]
    assert any(
        r["extra"].get("error_code") or r["extra"].get("error_type") for r in reported
    ), f"{name} reported nothing a reader could act on: {[r['message'] for r in reported]}"


@pytest.mark.parametrize("name", sorted(ROUTES))
def test_the_raw_detail_is_still_reachable_at_debug(name, exploding_client):
    """Classifying the error must not make it undebuggable."""
    _exploded, records = _run(name, exploding_client)
    debug = [r for r in records if r["level"].name == "DEBUG"]
    assert any(PROJECT_REF in _blob(r) for r in debug), (
        f"{name} dropped the detail line; the raw text has to stay at DEBUG"
    )


def test_the_needle_really_is_in_the_url_the_fixture_builds(exploding_client):
    """The positive control for the fixture itself.

    Without this, every assertion above could be passing because the user's term
    never reached the exception in the first place -- which is exactly the gap in
    the sibling file's `_exploded_db`, where the failure happens before any
    filter is built and the needle is hard-coded into the message.
    """
    exploded, _records = _run("list_programmes", exploding_client)
    assert any(quote_plus(NEEDLE) in url for url in exploded.urls), exploded.urls
    assert any(PROJECT_REF in url for url in exploded.urls)


def _public_handler_names(namespace: dict, module_name: str) -> set[str]:
    """Every unauthenticated, module-owned handler in `namespace`.

    The filter was `inspect.iscoroutinefunction` ALONE, which silently exempts
    a plain `def` route -- FastAPI accepts one and runs it in a threadpool, so
    the next unauthenticated handler written without the keyword would fall
    outside this file with nothing failing. Latent (every handler here is
    `async` today), which is why it is pinned by a control below rather than by
    a live failure.
    """
    public = set()
    for name, value in namespace.items():
        if not (inspect.iscoroutinefunction(value) or inspect.isfunction(value)):
            continue
        if getattr(value, "__module__", None) != module_name:
            continue
        if name.startswith("_"):
            # Internal helpers (`_skill_index`, `_search_skill_layers`, ...).
            # They are not routes and are exercised through the handlers that
            # call them; the source guard covers their `except` blocks.
            continue
        if "current_user" in inspect.signature(value).parameters:
            continue  # authenticated; a separate decision, see GUARDED_SOURCES
        public.add(name)
    return public


def test_the_list_here_covers_every_unauthenticated_handler():
    """A handler added later must not quietly fall outside this file."""
    missing = _public_handler_names(vars(cr), cr.__name__) - set(ROUTES)
    assert not missing, (
        f"career_routes has unlisted unauthenticated handlers: {sorted(missing)}. "
        "Add them to ROUTES (or say why they are exempt)."
    )


def test_the_staleness_filter_does_not_exempt_a_plain_def_handler():
    """POSITIVE CONTROL for the filter above.

    `async`-only was the shape it had, and no assertion could tell the
    difference, because `career_routes` happens to have no non-underscore
    plain-`def` at module level today. Synthesise one.
    """

    def new_public_route(entity_key: str):  # a FastAPI-legal sync handler
        return {"entity": entity_key}

    def authenticated_route(current_user: dict):
        return current_user

    async def _private_helper():
        return None

    new_public_route.__module__ = cr.__name__
    authenticated_route.__module__ = cr.__name__
    _private_helper.__module__ = cr.__name__
    namespace = {
        "new_public_route": new_public_route,
        "authenticated_route": authenticated_route,
        "_private_helper": _private_helper,
    }
    assert _public_handler_names(namespace, cr.__name__) == {"new_public_route"}

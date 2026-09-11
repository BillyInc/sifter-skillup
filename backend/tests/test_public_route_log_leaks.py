"""The ten unauthenticated admission/entrepreneurship endpoints must not leak.

`career_routes` was fixed and its `_error_summary` docstring then claimed the
guarantee was "an invariant of the whole module". It was an invariant of ONE
FILE. PROVEN: 30 distinct (path, level, needle) leaks at ERROR across these ten
paths, every one of them `log.error("...", error=str(exc))`:

    admission_routes.py:433  GET /api/admission/schools?q=<term>   (no Depends)
    admission_routes.py:464  GET /api/admission/programmes?q=<term>
    admission_routes.py:136, 148, 168, 226, 262, 306, 341
        -> /snapshot, /snapshot/history, /floor, /cutoffs,
           /formula?school_id=, /competitiveness, /jamb/{name}/insight
    entrepreneurship_routes.py:103, 120
        -> /api/entrepreneurship/opportunity-map,
           /institutions/{id}/aggregate

`logger.py`'s `Logger.error(self, message, error=None)` renders that as
`logger.error("{} | {}", message, error)`, so the raw text lands in the record
MESSAGE at ERROR -> `error.log` (added UNCONDITIONALLY, 30-day retention) and
stderr/journald. Captured sample:

    admission search_schools failed | Server error '500' for url
    'https://<PROJECT_REF>.supabase.co/rest/v1/schools?select=id&name=ilike...

(`<PROJECT_REF>` deliberately. The captured sample carried the live dev ref
verbatim, and a `git grep` found it nowhere else in the repo -- this file would
have been its first appearance in git history, on the branch whose purpose is to
stop it being logged. The test body has always used the placeholder
`abcdefghijklmnop`.)

`?q=**` (the unstripped PostgREST wildcard) was the cheap way to induce the 5xx
that triggers it.

The ~100 AUTHENTICATED sites in institutions/provisioning/starknet/guild/
feedback routes are out of scope for this change by decision, not by oversight.

This is the behavioural half. The source half -- which is what actually covers
handlers nobody remembered to list here -- is
`tests/test_log_safety_source.py`.
"""

import asyncio
import traceback
from urllib.parse import quote_plus
from contextlib import contextmanager
from unittest.mock import MagicMock, patch

import pytest
from loguru import logger as loguru_logger

import routes.admission_routes as ar
import routes.entrepreneurship_routes as er


# INFO counts: `log_db_failure(..., level="info")` is in live use at
# `admission_routes.py`'s address enrichment, so capturing at WARNING did not
# match the scope these assertions claim. Capture at DEBUG, filter on the level.
REPORTED_LEVEL = 20  # loguru INFO


@contextmanager
def captured_logs(level="DEBUG"):
    records = []
    sink_id = loguru_logger.add(lambda message: records.append(message.record), level=level)
    try:
        yield records
    finally:
        loguru_logger.remove(sink_id)


# The real shape, with the dev project ref replaced by a marker.
LEAK = (
    "Server error '500 Internal Server Error' for url "
    "'https://abcdefghijklmnop.supabase.co/rest/v1/schools"
    "?select=id&name=ilike.%25my+secret+search%25'"
)


def _formatted_exception(record):
    """The traceback text loguru would render, i.e. the third leak channel.

    `error=<Exception>` goes through `logger.opt(exception=exc)`, which puts the
    text in NEITHER `message` NOR `extra`.
    """
    info = record.get("exception")
    if not info:
        return ""
    try:
        return "".join(traceback.format_exception(info.type, info.value, info.traceback))
    except Exception:  # noqa: BLE001
        return str(info)


def _blob(records):
    return "".join(
        f"{r['message']}|{r['extra']}|{_formatted_exception(r)}" for r in records
    )


def _exploded_db(message=LEAK):
    """Fail at the database boundary however the handler reaches it."""
    exc = Exception(message)
    broken = MagicMock()
    broken.get_service_client.side_effect = exc
    broken.get_client.side_effect = exc
    return broken


# Every unauthenticated handler in the two modules, with arguments that carry a
# recognisable needle wherever the endpoint accepts free text.
ROUTES = [
    ("admission.get_active_snapshot", ar, lambda: ar.get_active_snapshot()),
    ("admission.get_snapshot_history", ar, lambda: ar.get_snapshot_history()),
    ("admission.get_jamb_floor", ar, lambda: ar.get_jamb_floor(year=2025)),
    ("admission.get_cutoffs", ar, lambda: ar.get_cutoffs(school_id="my secret search")),
    ("admission.get_school_formula", ar, lambda: ar.get_school_formula(school_id="my secret search")),
    ("admission.get_competitiveness", ar, lambda: ar.get_competitiveness(broad_course="my secret search")),
    ("admission.jamb_admission_insight", ar, lambda: ar.jamb_admission_insight("my secret search")),
    ("admission.search_schools", ar, lambda: ar.search_schools(q="my secret search")),
    ("admission.search_admission_programmes", ar, lambda: ar.search_admission_programmes(q="my secret search")),
    ("entrepreneurship.opportunity_map", er, lambda: er.opportunity_map(programme_name="my secret search")),
    ("entrepreneurship.institution_aggregate", er, lambda: er.institution_aggregate("my secret search")),
]


@pytest.mark.parametrize("name,module,call", ROUTES, ids=[r[0] for r in ROUTES])
def test_no_unauthenticated_sibling_route_logs_the_raw_exception(name, module, call):
    with patch.object(module, "db", _exploded_db()), captured_logs("DEBUG") as records:
        asyncio.run(call())
    records = [r for r in records if r["level"].no >= REPORTED_LEVEL]
    assert records, f"{name} must still report the failure"
    for record in records:
        # The MESSAGE first: that is where `Logger.error(message, error=str)`
        # actually puts the raw text. `extra` never sees it, which is how an
        # extra-only assertion stayed green through a real leak.
        assert "supabase.co" not in record["message"], f"{name} leaked the project ref"
        assert "secret" not in record["message"], f"{name} leaked the user's input"
    blob = _blob(records)
    assert "supabase.co" not in blob, f"{name} leaked the project ref"
    assert "secret" not in blob, f"{name} leaked the user's input"


@pytest.mark.parametrize("name,module,call", ROUTES, ids=[r[0] for r in ROUTES])
def test_each_sibling_route_still_reports_a_classified_summary(name, module, call):
    """Silence would also pass the test above. The failure must still be seen."""
    with patch.object(module, "db", _exploded_db(
        "{'code': '42501', 'message': 'permission denied for table "
        "skillup_dev.schools'} while requesting " + LEAK
    )), captured_logs("DEBUG") as records:
        asyncio.run(call())
    classified = [
        r for r in records
        if r["level"].no >= REPORTED_LEVEL and r["extra"].get("error_code")
    ]
    assert classified, f"{name} reported nothing a reader could act on"
    assert all(r["extra"]["error_code"] == "42501" for r in classified), (
        [r["extra"].get("error_code") for r in classified]
    )
    assert all(r["extra"]["error_type"] == "Exception" for r in classified)


def test_the_raw_text_is_still_reachable_at_debug():
    """Classifying the error must not make it undebuggable."""
    with patch.object(ar, "db", _exploded_db()), captured_logs("DEBUG") as records:
        asyncio.run(ar.search_schools(q="my secret search"))
    debug = [r for r in records if r["level"].name == "DEBUG"]
    assert any("supabase.co" in str(r["extra"].get("error", "")) for r in debug)


def test_a_failure_inside_execute_with_a_real_url_does_not_leak_either(exploding_client):
    """`_exploded_db` fails too early to prove anything about the URL.

    It raises from `get_service_client()`, i.e. before a single filter exists,
    so the needle in its message is hard-coded by this file rather than put
    there by the handler. This one fails inside `.execute()` -- where PostgREST
    actually fails -- with a URL built from the filters the handler really
    passed, so "the user's term would have been in that URL" is demonstrated
    instead of assumed.
    """
    needle, project_ref = "my secret search", "abcdefghijklmnop"
    exploded = exploding_client(project_ref)
    with patch.object(ar, "db", exploded), captured_logs("DEBUG") as records:
        # `limit` explicitly: the default is a FastAPI `Query` object, and
        # `min(limit, 50)` raises a TypeError on it before any query is built.
        asyncio.run(ar.search_schools(q=needle, limit=20, institution_type=None))
    assert any(quote_plus(needle) in url for url in exploded.urls), (
        f"the handler's own term never reached the URL: {exploded.urls}"
    )
    reported = [r for r in records if r["level"].no >= REPORTED_LEVEL]
    assert reported, "the failure must still be reported"
    for record in reported:
        assert project_ref not in _blob([record])
        assert "secret" not in _blob([record])


def test_the_route_list_here_covers_every_handler_in_both_modules():
    """A handler added later must not quietly fall outside this file.

    The enumerating test in `test_career_search_skills.py` covered 9 of 31
    call sites and read as though it covered them all; this at least fails
    when the list goes stale.
    """
    import inspect

    for module, prefix in ((ar, "admission"), (er, "entrepreneurship")):
        handlers = {
            attribute
            for attribute, value in vars(module).items()
            if inspect.iscoroutinefunction(value)
        }
        listed = {name.split(".", 1)[1] for name, mod, _ in ROUTES if mod is module}
        missing = handlers - listed
        assert not missing, (
            f"{prefix}_routes has unlisted async handlers: {sorted(missing)}. "
            "Add them to ROUTES (or say why they are exempt)."
        )

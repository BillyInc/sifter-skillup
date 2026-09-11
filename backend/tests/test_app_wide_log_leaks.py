"""The app-wide catch-all and the Celery tasks are log sinks too.

`diagnose=False` was the round-8 answer to "an Exception OBJECT passed as
`error=` leaks through the traceback". It is not a complete answer: `diagnose`
controls FRAME LOCALS only, and with `backtrace=True` the rendered record still
carries the exception VALUE line --

    httpx.HTTPStatusError: Server error '500 ...' for url
    'https://<PROJECT_REF>.supabase.co/rest/v1/programmes?select=id
     &name=ilike.%25<RAW TERM>%25'

-- so the channel was still open wherever an exception object reached a
warning-or-above call. The live consumers were not in a route module at all:

  * `main.unhandled_exception_handler` -- every route in the app converges here,
    INCLUDING the three modules the round-8 sweep fixed, and it wrote
    `log.error("Unhandled API exception", error=exc, ...)`. PROVEN with a
    validated probe: LEAK ['<ref>', 'supabase.co', 'secret'], and with real
    sinks at ENVIRONMENT=production, `project_ref_in_log=True` for BOTH
    `diagnose` settings.
  * `main.logging_middleware` -- the same, for anything that escapes the stack.
  * `celery_worker` -- four tasks wrote `error=e` with the exception object.

`main.py` and `celery_worker.py` were in neither `GUARDED_SOURCES` nor the
out-of-scope list, so the source guard was structurally blind to them. They are
in it now, and this file is the behavioural half for the three sinks above.
"""

import asyncio
import traceback
from contextlib import contextmanager

import pytest
from loguru import logger as loguru_logger
from starlette.requests import Request

import celery_worker
import main

PROJECT_REF = "abcdefghijklmnop"
LEAK = (
    "Server error '500 Internal Server Error' for url "
    f"'https://{PROJECT_REF}.supabase.co/rest/v1/programmes"
    "?select=id&name=ilike.%25my+secret+search%25'"
)


@contextmanager
def captured_logs(level="DEBUG"):
    records = []
    sink_id = loguru_logger.add(lambda message: records.append(message.record), level=level)
    try:
        yield records
    finally:
        loguru_logger.remove(sink_id)


def _blob(record):
    info = record.get("exception")
    rendered = ""
    if info:
        try:
            rendered = "".join(
                traceback.format_exception(info.type, info.value, info.traceback)
            )
        except Exception:  # noqa: BLE001
            rendered = str(info)
    return f"{record['message']}|{record['extra']}|{rendered}"


def _request():
    """A real Starlette request whose query string carries the needle."""
    return Request(
        {
            "type": "http",
            "http_version": "1.1",
            "method": "GET",
            "scheme": "http",
            "path": "/api/career/search",
            "raw_path": b"/api/career/search",
            "query_string": b"q=my+secret+search",
            "root_path": "",
            "headers": [],
            "server": ("testserver", 80),
            "client": ("test", 1234),
        }
    )


def _reported(records):
    return [r for r in records if r["level"].no >= 20]  # INFO and above


def _assert_no_leak(label, records):
    reported = _reported(records)
    assert reported, f"{label} must still report the failure above DEBUG"
    for record in reported:
        blob = _blob(record)
        assert PROJECT_REF not in blob, f"{label} leaked the project ref: {blob}"
        assert "supabase.co" not in blob, f"{label} leaked the project host: {blob}"
        assert "secret" not in blob, f"{label} leaked the user's input: {blob}"


def test_the_app_wide_catch_all_does_not_log_the_exception_text():
    exc = RuntimeError(LEAK)
    with captured_logs("DEBUG") as records:
        asyncio.run(main.unhandled_exception_handler(_request(), exc))
    _assert_no_leak("unhandled_exception_handler", records)


def test_the_access_log_middleware_does_not_log_the_exception_text():
    exc = RuntimeError(LEAK)

    async def call_next(_request):
        raise exc

    async def drive():
        with pytest.raises(RuntimeError):
            await main.logging_middleware(_request(), call_next)

    with captured_logs("DEBUG") as records:
        asyncio.run(drive())
    _assert_no_leak("logging_middleware", records)


def test_a_celery_task_does_not_log_the_exception_text(monkeypatch):
    class _Explodes:
        def __getattr__(self, _name):
            def chain(*_args, **_kwargs):
                return self

            return chain

        def execute(self):
            raise RuntimeError(LEAK)

    monkeypatch.setattr(celery_worker, "db", _Explodes())
    with captured_logs("DEBUG") as records:
        with pytest.raises(RuntimeError):
            celery_worker.reset_daily_quests()
    _assert_no_leak("reset_daily_quests", records)


@pytest.mark.parametrize(
    "label,drive",
    [
        ("catch-all", lambda: asyncio.run(main.unhandled_exception_handler(_request(), RuntimeError(LEAK)))),
    ],
)
def test_the_detail_is_still_reachable_at_debug(label, drive):
    """The classified summary must not make the failure undebuggable."""
    with captured_logs("DEBUG") as records:
        drive()
    debug = [r for r in records if r["level"].name == "DEBUG"]
    assert any(PROJECT_REF in _blob(r) for r in debug), (
        f"{label} dropped the DEBUG detail line"
    )


def test_the_probe_itself_can_see_a_leak():
    """POSITIVE CONTROL for every assertion above.

    A round-9 probe reported everything clean on its first run because
    `logger.remove()` inside `Logger.setup_logger()` had silently deleted its
    sink; only the control caught it. So: prove this sink sees BOTH shapes of
    the leak -- a `str` in the message and an exception OBJECT, which reaches
    neither `message` nor `extra` and is the shape `diagnose=False` was wrongly
    thought to close.
    """
    exc = RuntimeError(LEAK)
    with captured_logs("DEBUG") as records:
        main.log.error("control", error=str(exc))
    assert any(PROJECT_REF in _blob(r) for r in _reported(records)), "str leak invisible"

    with captured_logs("DEBUG") as records:
        main.log.error("control", error=exc)
    assert any(PROJECT_REF in _blob(r) for r in _reported(records)), (
        "an exception object must still be visible to this sink; if it is not, "
        "every assertion in this file is vacuous"
    )


# ── the traceback, restored ──────────────────────────────────────────────────
#
# Round 10 converted `log.error(msg, error=exc)` to `log_db_failure(msg, exc)`
# at these three sites, which closed the leak by deleting the STACK as well as
# the message. PROVED with a positive-controlled probe:
#
#   OLD log.error(msg, error=exc): level=ERROR, exception=True, 2 frames, names
#                                  the raiser, secret local NOT present
#   NEW log_db_failure(msg, exc):  level=ERROR, exception=False,
#                                  error_code='unclassified',
#                                  error_type='RuntimeError'
#
# For the one handler whose entire job is recording unexpected crashes,
# production got "a RuntimeError happened at /x" -- no file, no line, no stack,
# at any level. `log_safety.frames_only` keeps the frames and drops the message,
# so both halves hold at once.


def _raised_inside_a_recognisable_frame():
    """A RuntimeError with a REAL traceback, plus a secret in the raising frame.

    The frame local is the thing `diagnose=False` is responsible for, and it
    must stay out of the record; the frame NAME is the thing `backtrace=True` is
    responsible for, and it must appear.
    """
    def the_frame_that_actually_raised():
        service_key_in_a_frame_local = "sbp_" + LEAK  # noqa: F841
        raise RuntimeError(LEAK)

    try:
        the_frame_that_actually_raised()
    except RuntimeError as exc:
        return exc
    raise AssertionError("unreachable")


def test_the_catch_all_still_records_the_stack_of_an_unexpected_crash():
    exc = _raised_inside_a_recognisable_frame()
    with captured_logs("DEBUG") as records:
        asyncio.run(main.unhandled_exception_handler(_request(), exc))
    reported = _reported(records)
    with_stack = [r for r in reported if r.get("exception")]
    assert with_stack, (
        "the catch-all must attach a traceback; without one the record is "
        f"'a RuntimeError happened at /x': {[r['message'] for r in reported]}"
    )
    for record in with_stack:
        rendered = _blob(record)
        assert "the_frame_that_actually_raised" in rendered, rendered
        assert record["level"].name == "ERROR", record["level"].name
        assert record["extra"]["error_type"] == "RuntimeError"
        assert record["extra"]["error_code"] == "unclassified"


def test_the_access_log_middleware_still_records_the_stack():
    exc = _raised_inside_a_recognisable_frame()

    async def call_next(_request):
        raise exc

    async def drive():
        with pytest.raises(RuntimeError):
            await main.logging_middleware(_request(), call_next)

    with captured_logs("DEBUG") as records:
        asyncio.run(drive())
    with_stack = [r for r in _reported(records) if r.get("exception")]
    assert with_stack, "Request failed must still carry a stack"
    assert any("the_frame_that_actually_raised" in _blob(r) for r in with_stack)


@pytest.mark.parametrize(
    "label,make",
    [
        ("never raised", lambda: RuntimeError(LEAK)),
        ("really raised", _raised_inside_a_recognisable_frame),
    ],
)
def test_the_restored_stack_carries_neither_the_message_nor_a_frame_local(label, make):
    """The whole point: frames in, exception text and frame locals out."""
    with captured_logs("DEBUG") as records:
        asyncio.run(main.unhandled_exception_handler(_request(), make()))
    _assert_no_leak(f"unhandled_exception_handler ({label})", records)
    for record in _reported(records):
        assert "sbp_" not in _blob(record), (
            "diagnose=False must keep the raising frame's locals out of the record"
        )


def test_a_chained_exception_cannot_re_open_the_value_line():
    """`traceback` renders `__cause__`/`__context__` in full, so a stand-in that
    kept them would leak one link down. `frames_only` clears both."""
    try:
        try:
            raise RuntimeError(LEAK)
        except RuntimeError as inner:
            raise ValueError("outer, harmless") from inner
    except ValueError as outer:
        exc = outer

    with captured_logs("DEBUG") as records:
        asyncio.run(main.unhandled_exception_handler(_request(), exc))
    _assert_no_leak("a chained exception", records)


def test_the_stack_probe_itself_can_see_frames_and_a_leak():
    """POSITIVE CONTROL for the three assertions above.

    `_blob` reporting "no frame name found" would pass a test that asserted the
    absence of one, so prove this sink renders BOTH the frame name and, when the
    real exception object is handed over unmodified, the leak in its value line.
    A probe that cannot see the bad case cannot certify the good one.
    """
    exc = _raised_inside_a_recognisable_frame()
    with captured_logs("DEBUG") as records:
        main.log.error("control", error=exc)
    reported = _reported(records)
    assert any("the_frame_that_actually_raised" in _blob(r) for r in reported), (
        "this sink cannot see frame names, so the stack assertions are vacuous"
    )
    assert any(PROJECT_REF in _blob(r) for r in reported), (
        "this sink cannot see the value line, so the leak assertions are vacuous"
    )


# The three sites whose job is recording an UNEXPECTED crash. The first two are
# driven above; `auth_signup` cannot be driven here without standing up the
# whole email-code flow, so it is pinned at the source level -- which is also
# what stops a fourth site being added later without the stack.
TRACEBACK_SITES = {
    "Unhandled API exception": "the app-wide catch-all",
    "Request failed": "the access-log middleware",
    "Signup account creation failed": "signup",
}


@pytest.mark.parametrize("message", sorted(TRACEBACK_SITES))
def test_each_unexpected_crash_site_asks_for_the_stack(message):
    import ast
    import pathlib

    source = (pathlib.Path(main.__file__)).read_text(encoding="utf-8")
    calls = [
        node
        for node in ast.walk(ast.parse(source))
        if isinstance(node, ast.Call)
        and isinstance(node.func, ast.Name)
        and node.func.id == "log_db_failure"
        and node.args
        and isinstance(node.args[0], ast.Constant)
        and node.args[0].value == message
    ]
    assert len(calls) == 1, f"{message!r}: found {len(calls)} call sites"
    asked = [
        keyword
        for keyword in calls[0].keywords
        if keyword.arg == "with_traceback"
        and isinstance(keyword.value, ast.Constant)
        and keyword.value.value is True
    ]
    assert asked, (
        f"{TRACEBACK_SITES[message]} reports an unexpected crash; without "
        "`with_traceback=True` the record names no file, no line and no raiser "
        "at any level"
    )


def test_the_other_call_sites_are_left_on_the_plain_spelling():
    """POSITIVE CONTROL: the source check must be able to tell them apart.

    `main.py` has ~15 `log_db_failure` calls and only three are crash sites;
    if every call carried the flag the parametrisation above would prove
    nothing.
    """
    import ast
    import pathlib

    source = (pathlib.Path(main.__file__)).read_text(encoding="utf-8")
    plain = 0
    for node in ast.walk(ast.parse(source)):
        if (
            isinstance(node, ast.Call)
            and isinstance(node.func, ast.Name)
            and node.func.id == "log_db_failure"
            and not any(k.arg == "with_traceback" for k in node.keywords)
        ):
            plain += 1
    assert plain >= 5, f"only {plain} plain call sites; is this check still meaningful?"

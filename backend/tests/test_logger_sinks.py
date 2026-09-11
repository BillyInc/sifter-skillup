"""Which loguru sinks the backend installs, and at what level.

`_error_summary` deliberately keeps raw exception text OUT of the warning and
error lines and leaves it at DEBUG. That is only a real boundary if the DEBUG
sinks are development-only: for a PostgREST or httpx failure the raw string is
the Supabase project ref AND the user's raw search string, and `app.log` is
added UNCONDITIONALLY with a 10-day retention. At `level="DEBUG"` that put both
on disk in production, greppable, for the whole retention window -- while the
comment at the `_error_summary` docstring claimed "the sink is off by default".
"""

import os
import sys
from unittest.mock import patch

from loguru import logger as loguru_logger

from logger import Logger


def _installed_sinks(environment):
    """The `logger.add(...)` calls `setup_logger` makes, without installing them."""
    calls = []
    env = dict(os.environ)
    env.pop("ENVIRONMENT", None)
    if environment is not None:
        env["ENVIRONMENT"] = environment
    with patch.dict(os.environ, env, clear=True), \
            patch.object(loguru_logger, "add", lambda *a, **k: calls.append((a, k)) or 0), \
            patch.object(loguru_logger, "remove", lambda *a, **k: None):
        Logger().setup_logger()
    return calls


def _level_of(calls, filename):
    for args, kwargs in calls:
        target = args[0] if args else kwargs.get("sink")
        if isinstance(target, str) and target.endswith(filename):
            return kwargs.get("level")
    raise AssertionError(f"no sink for {filename}")


def test_app_log_is_debug_in_development():
    assert _level_of(_installed_sinks("development"), "app.log") == "DEBUG"


def test_app_log_is_not_debug_outside_development():
    # The debug detail lines carry raw exception text on purpose. Outside
    # development they must never reach a file.
    assert _level_of(_installed_sinks("production"), "app.log") == "INFO"


def test_app_log_is_not_debug_when_the_environment_is_unset():
    # Unset is the dangerous default: a missing ENVIRONMENT must not opt a
    # deployment into writing raw request URLs to disk.
    assert _level_of(_installed_sinks(None), "app.log") == "INFO"


def test_the_error_log_is_still_error_only():
    calls = _installed_sinks("production")
    assert _level_of(calls, "error.log") == "ERROR"


def _sink_name(args, kwargs):
    """A stable label per sink.

    Under pytest `sys.stdout` / `sys.stderr` are capture objects, so they can
    only be recognised by identity -- `.name` is a file descriptor, not
    "stdout".
    """
    target = args[0] if args else kwargs.get("sink")
    if isinstance(target, str):
        return target.rsplit("/", 1)[-1].rsplit("\\", 1)[-1]
    if target is sys.stdout:
        return "stdout"
    if target is sys.stderr:
        return "stderr"
    return repr(target)


def test_no_sink_dumps_frame_locals():
    """`diagnose=True` turns any logged Exception OBJECT into a locals dump.

    Loguru's `diagnose` appends the VALUE OF EVERY LOCAL in every traceback
    frame to the rendered record. `Logger.error(message, error=<Exception>)`
    goes through `logger.opt(exception=exc)`, so every such call wrote the
    frame locals of the whole raising stack -- and `backend/celery_worker.py`
    passes `error=e`, an object, at four sites today. `error.log` is
    ERROR-level, added UNCONDITIONALLY, and kept 30 days, so that was a
    durable on-disk channel for whatever those frames happened to hold; a
    secret held in a raising frame was PROVEN to come out this way with a
    positive control.

    Asserted for the console sinks too. On the deployed unit stdout/stderr are
    journald, which persists to disk and greps like any other log file, so
    "it's only the console" is not a boundary -- it is a statement about how
    the process is supervised.

    This file pinned sink LEVELS thoroughly and asserted nothing at all about
    `diagnose`, so flipping any of the four back was free.
    """
    for environment in ("development", "production", None):
        for args, kwargs in _installed_sinks(environment):
            assert kwargs.get("diagnose") is False, (
                f"sink {_sink_name(args, kwargs)} (ENVIRONMENT={environment!r}) "
                "must not render frame locals"
            )


def test_tracebacks_are_still_recorded():
    """The fix must not have thrown away diagnosability along with the locals.

    `backtrace` is the frame LIST and carries no values; turning it off too
    would be over-correcting, and a stack-free error record is how the next
    failure becomes unreproducible.
    """
    for args, kwargs in _installed_sinks("production"):
        assert kwargs.get("backtrace") is True, (
            f"sink {_sink_name(args, kwargs)} should still record the stack"
        )


def test_all_four_sinks_are_actually_installed():
    """Guards the loops above against passing by having nothing to check.

    `_installed_sinks` sees each sink twice: `Logger()` runs `setup_logger`
    from `__init__` and the helper then calls it again explicitly. What
    matters is that all four DISTINCT sinks are present, so the `diagnose`
    loop above is really covering the file sinks and the console sinks.
    """
    calls = _installed_sinks("production")
    names = {_sink_name(a, k) for a, k in calls}
    assert names == {"stdout", "stderr", "app.log", "error.log"}, names
    assert len(calls) == 2 * len(names), (
        f"expected each of {len(names)} sinks once per setup_logger run, saw {len(calls)}"
    )

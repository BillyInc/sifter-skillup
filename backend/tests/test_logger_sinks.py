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

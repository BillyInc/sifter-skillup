"""No `except` block may hand raw exception text to a warning/error log line.

This is a SOURCE check, and it is a source check on purpose.

The behavioural equivalent -- drive a handler into an exception and read the
records -- can only ever cover the handlers somebody remembered to enumerate.
Reverting each of the 31 `_log_db_failure` call sites in `career_routes.py` one
at a time to `log.error(..., error=str(exc))` killed 9 and left 22 ALIVE, and
the 9 were exactly the 9 routes listed in
`TestSiblingRoutesDoNotLeakTheProjectRefEither._routes()`. Among the survivors
were five UNAUTHENTICATED routes: `get_opportunity`, `list_elite_pathways`,
`get_elite_pathway`, `get_bridge_plan` and skill discovery. The helper itself
was well pinned; the CALL SITES were not constrained at all.

A parse of the file constrains all of them at once, and keeps constraining the
ones that have not been written yet -- which is the property the enumerating
test cannot have. It is the same technique as
`TestEveryOffLoopCallSitePassesItsOwnLimiter`, which is why the limiter call
sites are robust while these were not.

Why these levels, and what exactly is banned:

  * `logger.Logger.error(self, message, error=None, **kwargs)` takes `error` as
    a NAMED parameter and emits `logger.error("{} | {}", message, error)`. A
    `str` therefore lands in the record MESSAGE -- not in `extra` -- at ERROR
    level, which means `error.log` (added UNCONDITIONALLY, 30-day retention)
    and stderr/journald.
  * an Exception OBJECT is the same leak through the traceback instead
    (`logger.opt(exception=exc)`), which is neither `message` nor `extra`.
  * `log.debug` is the ONE sanctioned sink for the raw text, and `log_safety.
    log_db_failure` writes exactly one such line per failure. `app.log` is
    gated on ENVIRONMENT=development, so that line is not written to disk
    outside development.

WHAT THE EARLIER MATCHER MISSED. It looked only for an `ast.Attribute` whose
`.value` was an `ast.Name` with id in {"log", "logger"}, only directly inside an
`ast.ExceptHandler`, and flagged only an `error=` keyword or a second positional.
Five mutations at the unauthenticated `career_routes.get_opportunity` survived a
green suite, TWO of them proven to put the project ref and the user's search
term in an ERROR record:

    _lg = log; _lg.error(msg, error=str(exc))       PROVEN LEAK (alias)
    log.error(f"... failed: {exc}")                 PROVEN LEAK (first
                                                    positional -- invisible to
                                                    any keyword check)
    the leak moved into a module-level helper called from the handler
    the leak emitted from a `finally:` block
    logger.exception(...)   -- logs at ERROR *with* the traceback
    log.error("x", detail=str(exc))  -- any other kwarg name, lands in `extra`

So the rule is now stated over the DATA rather than over one spelling: for a
call at a banned level on anything that resolves to the logger, NO argument and
NO keyword value may reference a caught exception, and there may be at most one
positional argument. Perfect static analysis of this is impossible, which is why
`test_public_route_log_leaks.py` and `test_career_route_log_leaks.py` exist as
the behavioural net underneath it.

WHAT IS STILL NOT CAUGHT, recorded rather than implied. Four residual bypasses
were closed after round 11 -- the assignment taint (`detail = str(exc)` then
`log.error(detail)`, which was the realistic one, because the INLINE f-string
WAS caught and so the matcher taught "don't inline it" rather than "don't log
it"), `import logger as lg`, `traceback.format_exc()` under a bare `except
Exception:`, and `sys.exc_info()[1]`. All are in `BYPASSES`.

These are DECLINED, deliberately:

  * `getattr(log, "error")(...)` -- the level is a runtime string, so there is
    no `ast.Attribute` to read and no set of levels to compare it against.
  * the logger reached through a dict or an instance attribute
    (`self.log.error`, `SINKS["app"].error`) -- resolving either needs type
    inference, not a name table.
  * a logger call built by a lambda or `functools.partial` and invoked
    elsewhere.

Each of them requires real dataflow analysis to catch and each is a deliberate
act to write; the behavioural files are the net for them, and `log_safety.
log_db_failure` being the default spelling is what keeps the ordinary path off
them. `log_db_failure`'s own `emit = {...}.get(level, log.error)` dispatch is a
fifth blind spot of the same kind -- an `ast.Name` call, invisible here -- and
`test_log_safety.py` is what constrains the helper.
"""

import ast
import pathlib

import pytest

BACKEND = pathlib.Path(__file__).resolve().parents[1]

# Every module that reports a failure through `log_safety`. Derived, not
# curated: `test_every_module_that_imports_log_safety_is_guarded` fails if a
# module imports the helper and is missing here, and
# `test_every_guarded_module_actually_has_except_blocks_to_check` fails if one
# is listed but has nothing to check. Dropping `routes/career_routes.py` from
# this list used to report 505 passed and NO failure, which removed the only
# net over 31 handlers.
#
# The ~100 authenticated sites in institutions/provisioning/starknet/guild/
# feedback routes are a separate decision and are deliberately NOT listed; those
# modules do not import `log_safety`, which is what makes the derivation above
# match this list exactly.
GUARDED_SOURCES = [
    "celery_worker.py",
    "log_safety.py",
    "main.py",
    "routes/admission_routes.py",
    "routes/career_routes.py",
    "routes/entrepreneurship_routes.py",
    "routes/student_pipeline_routes.py",
]

# `log.debug(..., error=str(exc))` is the sanctioned detail channel.
# `exception` is in here because `logger.exception` logs at ERROR *and* attaches
# the traceback; it was not, and that was a bypass.
BANNED_LEVELS = {"error", "warning", "info", "critical", "exception"}

# The names the logger is reachable under before aliasing. Aliases are resolved
# from the source, so `_lg = log` then `_lg.error(...)` is caught too.
LOGGER_ROOTS = {"log", "logger"}


def _logger_aliases(tree: ast.AST) -> set[str]:
    """Every local name that resolves to the logger, to a fixed point."""
    aliases = set(LOGGER_ROOTS)
    for _ in range(10):
        before = len(aliases)
        for node in ast.walk(tree):
            if isinstance(node, ast.Assign) and isinstance(node.value, ast.Name):
                if node.value.id in aliases:
                    aliases.update(
                        target.id for target in node.targets if isinstance(target, ast.Name)
                    )
            elif isinstance(node, (ast.ImportFrom, ast.Import)):
                # `from logger import log as lg` AND `import logger as lg`.
                # Only the first was handled, so the second was a bypass.
                for alias in node.names:
                    if alias.name.split(".")[0] in LOGGER_ROOTS and alias.asname:
                        aliases.add(alias.asname)
        if len(aliases) == before:
            break
    return aliases


def _resolves_to_logger(node: ast.AST, aliases: set[str]) -> bool:
    """True for `log`, `_lg`, `log.bind(...)`, `logger.opt(...).bind(...)`, ..."""
    if isinstance(node, ast.Name):
        return node.id in aliases
    if isinstance(node, ast.Call):
        return _resolves_to_logger(node.func, aliases)
    if isinstance(node, ast.Attribute):
        return _resolves_to_logger(node.value, aliases)
    return False


def _exception_names(tree: ast.AST) -> set[str]:
    """Every name an `except ... as NAME` binds anywhere in the module."""
    return {
        node.name
        for node in ast.walk(tree)
        if isinstance(node, ast.ExceptHandler) and node.name
    }


def _called_names(node: ast.AST) -> set[str]:
    """Plain-function names called anywhere under `node`."""
    return {
        inner.func.id
        for inner in ast.walk(node)
        if isinstance(inner, ast.Call) and isinstance(inner.func, ast.Name)
    }


def _functions_by_name(tree: ast.AST) -> dict[str, list[ast.AST]]:
    out: dict[str, list[ast.AST]] = {}
    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            out.setdefault(node.name, []).append(node)
    return out


def _regions_to_check(tree: ast.AST, extra_reachable: set[str] = frozenset()) -> list[ast.AST]:
    """Every `except`/`finally` body, plus the functions they can reach.

    `ast.ExceptHandler` alone was the scope, and two of the five demonstrated
    bypasses were simply OUTSIDE it: a leak moved into a module-level helper
    that the handler calls, and a leak emitted from the `finally:` of the same
    `try`. A `finally` runs on the exception path and the exception name is
    still bound there, so it is the same sink.
    """
    regions: list[ast.AST] = []
    reachable: set[str] = set(extra_reachable)
    for node in ast.walk(tree):
        if isinstance(node, ast.ExceptHandler):
            regions.append(node)
            reachable |= _called_names(node)
        elif isinstance(node, ast.Try) and node.finalbody:
            regions.extend(node.finalbody)
            for statement in node.finalbody:
                reachable |= _called_names(statement)
    functions = _functions_by_name(tree)
    seen: set[str] = set()
    frontier = reachable
    while frontier:
        name = frontier.pop()
        if name in seen:
            continue
        seen.add(name)
        for definition in functions.get(name, []):
            regions.append(definition)
            frontier |= _called_names(definition) - seen
    return regions


# The two ways a caught exception may legitimately appear in a warning-or-above
# record: reduced to a shape-checked code by `log_safety.error_summary`, or to
# its class name. Both are classifications, not text, and four handlers in
# `career_routes.py` spell the classified summary inline because they vary the
# message or the fields.
SANCTIONED_CLASSIFIERS = {"error_summary", "_error_summary", "frames_only"}
# `frames_only` is the THIRD sanctioned spelling and it was added deliberately,
# not to make a failing test pass. It returns a stand-in exception carrying the
# original TRACEBACK with the message replaced by the classified summary and
# `__cause__`/`__context__` cleared, so `logger.opt(exception=...)` renders the
# frame list and nothing the failure said. `test_app_wide_log_leaks.py` is the
# behavioural proof, with a positive control that the sink can see both a frame
# name and the value line. Handing loguru a RAW exception object is still
# caught -- see BYPASSES["exception object"].
#
# NOTE a real blind spot this sanction does not create but does sit next to:
# `log_safety.log_db_failure` dispatches through `emit = {...}.get(level,
# log.error)` and then calls `emit(...)`, an `ast.Name` call. The matcher only
# looks at `ast.Attribute` calls, so nothing inside that helper is checked by
# this guard at all, sanctioned or not. `test_log_safety.py` and
# `test_app_wide_log_leaks.py` are what constrain the helper itself.


# Two ways to reach the LIVE exception without naming it. Both are ordinary
# Python and both were bypasses: `traceback.format_exc()` inside a bare
# `except Exception:` renders the whole traceback, value line included, and
# `sys.exc_info()[1]` is the exception object itself.
_AMBIENT_EXCEPTION_CALLS = {"format_exc", "format_exception", "exc_info", "print_exc"}


def _mentions(node: ast.AST, names: set[str]) -> bool:
    """True when `node` can carry a caught exception's TEXT into the record.

    A reference to the exception is not itself the leak -- `error_code=
    _error_summary(exc)[0]` and `error_type=type(exc).__name__` are the
    sanctioned summary and were false positives on the first cut of this
    matcher. Those two shapes are pruned; everything else that reaches an
    exception name counts, including `str(exc)`, an f-string, `%`, `.format`
    and plain concatenation.
    """
    if isinstance(node, ast.Call) and isinstance(node.func, ast.Name):
        if node.func.id in SANCTIONED_CLASSIFIERS:
            return False
    if isinstance(node, ast.Call):
        called = node.func
        name = called.attr if isinstance(called, ast.Attribute) else getattr(called, "id", "")
        if name in _AMBIENT_EXCEPTION_CALLS:
            # No exception NAME appears, so no name-based check could see it.
            return True
    if isinstance(node, ast.Attribute) and node.attr == "__name__":
        # `type(exc).__name__` / `exc.__class__.__name__`: a class name.
        #
        # THE ASSUMPTION THIS SANCTION RESTS ON, named so the next auditor can
        # check it: no exception class in the dependency set is CONSTRUCTED
        # from request data. A class name is only "not data" while that holds.
        # Falsify it with one `type(f"Error_{user_text}", (Exception,), {})`
        # anywhere on a request path -- httpx, postgrest-py, supabase-py,
        # pydantic and the route modules all build their exception types
        # statically today -- and `error_summary` would publish it: measured,
        # such a class reaches the record as
        # `error_type: 'Error_my_secret_search_<ref>'` at ERROR. Theoretical,
        # and not reachable from anything here.
        return False
    if isinstance(node, ast.Name):
        return node.id in names
    return any(_mentions(child, names) for child in ast.iter_child_nodes(node))


def _tainted_locals(region: ast.AST, names: set[str]) -> set[str]:
    """Names in `region` assigned FROM something that mentions a caught exception.

    The matcher's most realistic residual bypass, and the one it was actively
    teaching: the INLINE f-string (`log.error(f"...{exc}")`) is caught, so the
    lesson a reader takes from it is "don't inline it" rather than "don't log
    it" --

        detail = str(exc)
        log.error(detail)               # one positional, name not `exc`

    was NOT caught. Same for `msg = f"...{exc}"` and `'{}'.format(exc)`. The
    taint is followed to a fixed point, so a chain of assignments does not
    launder it either.

    `error_code, error_type = error_summary(exc)` does not taint anything:
    `_mentions` prunes the sanctioned classifiers, which is what makes that
    shape the way to carry a failure forward.
    """
    tainted: set[str] = set()
    for _ in range(10):
        before = len(tainted)
        for node in ast.walk(region):
            if isinstance(node, (ast.Assign, ast.AnnAssign, ast.AugAssign)):
                value = node.value
                if value is None or not _mentions(value, names | tainted):
                    continue
                targets = node.targets if isinstance(node, ast.Assign) else [node.target]
                for target in targets:
                    for leaf in ast.walk(target):
                        if isinstance(leaf, ast.Name):
                            tainted.add(leaf.id)
            elif isinstance(node, (ast.NamedExpr,)):
                if _mentions(node.value, names | tainted) and isinstance(
                    node.target, ast.Name
                ):
                    tainted.add(node.target.id)
        if len(tainted) == before:
            break
    return tainted


def offenders(source: str, *, extra_reachable: set[str] = frozenset()) -> list[str]:
    """Every place `source` routes a caught exception into a banned log level.

    Factored out so the self-test below can assert on THE LIST THE REAL TEST
    CONSUMES. The previous self-test re-derived its own hit counts from the
    helper, so deleting either offender branch of the real test passed the
    self-test and the whole suite -- with a real leak in place.
    """
    tree = ast.parse(source)
    aliases = _logger_aliases(tree)
    exception_names = _exception_names(tree)
    found: list[str] = []
    seen_calls: set[int] = set()
    for region in _regions_to_check(tree, extra_reachable):
        # A scanned function's own parameters can BE the exception (that is how
        # a leak moves out of the handler and into a helper).
        local_names = set(exception_names)
        if isinstance(region, (ast.FunctionDef, ast.AsyncFunctionDef)):
            local_names |= {
                argument.arg
                for argument in [*region.args.posonlyargs, *region.args.args, *region.args.kwonlyargs]
                if argument.arg in exception_names or argument.arg in {"exc", "e", "error"}
            }
        local_names |= _tainted_locals(region, local_names)
        for call in ast.walk(region):
            if not isinstance(call, ast.Call) or id(call) in seen_calls:
                continue
            func = call.func
            if not isinstance(func, ast.Attribute) or func.attr not in BANNED_LEVELS:
                continue
            if not _resolves_to_logger(func.value, aliases):
                continue
            seen_calls.add(id(call))
            where = f"line {call.lineno}: log.{func.attr}(...)"
            # `Logger.error(message, error)` accepts the raw text POSITIONALLY,
            # which no keyword check would see.
            if len(call.args) > 1:
                found.append(f"{where} has a second positional argument")
            for index, argument in enumerate(call.args):
                if _mentions(argument, local_names):
                    found.append(
                        f"{where} interpolates a caught exception into positional {index}"
                    )
            for keyword in call.keywords:
                if keyword.value is not None and _mentions(keyword.value, local_names):
                    found.append(
                        f"{where} passes a caught exception as {keyword.arg or '**kwargs'}="
                    )
            if func.attr == "exception":
                found.append(f"{where} logs at ERROR with the traceback attached")
    return sorted(set(found))


def _source(relative: str) -> str:
    path = BACKEND / relative
    assert path.exists(), f"{relative} is listed as guarded but does not exist"
    return path.read_text(encoding="utf-8")


def _all_handler_reachable_names() -> set[str]:
    """Function names called from an `except`/`finally` in ANY guarded module.

    `log_safety.log_db_failure` is called from `except` blocks in the route
    modules, not from one inside `log_safety.py`, so without this the helper's
    own body would be outside every scanned region.
    """
    names: set[str] = set()
    for relative in GUARDED_SOURCES:
        tree = ast.parse(_source(relative))
        for node in ast.walk(tree):
            if isinstance(node, ast.ExceptHandler):
                names |= _called_names(node)
            elif isinstance(node, ast.Try) and node.finalbody:
                for statement in node.finalbody:
                    names |= _called_names(statement)
    return names


@pytest.mark.parametrize("relative", GUARDED_SOURCES)
def test_no_except_block_logs_raw_exception_text_at_warning_or_above(relative):
    found = offenders(_source(relative), extra_reachable=_all_handler_reachable_names())
    assert not found, (
        f"{relative} routes a caught exception into a "
        f"{'/'.join(sorted(BANNED_LEVELS))} record. Use log_safety.log_db_failure, "
        "which logs a classified (error_code, error_type) at that level and "
        "leaves str(exc) at DEBUG.\n  " + "\n  ".join(found)
    )


# Every bypass from the round-9 review, as source. Each one survived the suite
# at 506 passed before the matcher was rewritten; two were proven to put the
# project ref and the user's query into an ERROR record.
BYPASSES = {
    "plain keyword": "log.error('boom', error=str(exc))",
    "exception object": "log.warning('boom', error=exc)",
    "second positional": "log.error('boom', exc)",
    # `Logger.error(self, message, error=None)` renders a second positional into
    # the record MESSAGE whatever it holds, so the positional-count branch is
    # about the SHAPE and not only about exceptions. Without this case that
    # branch is an equivalent mutant: deleting it left the suite green, because
    # `log.error('boom', exc)` is also caught as "an exception in positional 1".
    "second positional that is not the exception": "log.error('boom', detail_text)",
    "logger alias": "_lg = log\n_lg.error('boom', error=str(exc))",
    "f-string in the message": "log.error(f'boom: {exc}')",
    "percent format in the message": "log.error('boom: %s' % exc)",
    "str.format in the message": "log.error('boom: {}'.format(exc))",
    "concatenated message": "log.error('boom: ' + str(exc))",
    "any other kwarg name": "log.error('boom', detail=str(exc))",
    "bound logger": "log.bind(request='x').error('boom', error=str(exc))",
    "logger.exception": "logger.exception('boom')",
    # The round-11 residual: one assignment, then one positional whose NAME is
    # not the exception. The inline f-string form was caught and this was not,
    # so the matcher taught "don't inline it" instead of "don't log it".
    "stringified into a local first": "detail = str(exc)\nlog.error(detail)",
    "f-string into a local first": "message = f'boom: {exc}'\nlog.error(message)",
    "format() into a local first": "text = '{}'.format(exc)\nlog.error('boom', detail=text)",
    "laundered through two locals": (
        "first = str(exc)\nsecond = first\nlog.error(second)"
    ),
    "walrus in the message": "log.error(detail := str(exc))",
    # No exception NAME appears in either of these, so every name-based branch
    # of the matcher is blind to them by construction.
    "traceback.format_exc under a bare except": (
        "try:\n    pass\nexcept Exception:\n    log.error(traceback.format_exc())"
    ),
    "sys.exc_info()[1]": "log.error('boom', error=str(sys.exc_info()[1]))",
    "import logger as lg": "import logger as lg\nlg.error('boom', error=str(exc))",
}

ALLOWED = {
    "the classified summary": "log.error('boom', error_code='42501', error_type='X')",
    "the debug detail channel": "log.debug('boom detail', error=str(exc))",
    "the shared helper": "log_db_failure('boom', exc)",
    "a message with no exception in it": "log.error('boom', group='tools')",
    "the inline classified summary": (
        "log.warning('boom', error_code=_error_summary(exc)[0], "
        "error_type=type(exc).__name__)"
    ),
    "the classified summary carried through a local": (
        "code, kind = error_summary(exc)\nlog.error('boom', error_code=code, "
        "error_type=kind)"
    ),
    "the frame-list stand-in": (
        "log.error('boom', error=frames_only(exc), error_code='42501')"
    ),
}


def _handler(body: str) -> str:
    indented = "\n".join("    " + line if line.strip() else line for line in body.split("\n"))
    return "try:\n    pass\nexcept Exception as exc:\n" + indented + "\n"


@pytest.mark.parametrize("name", sorted(BYPASSES))
def test_the_guard_catches_every_known_bypass(name):
    """The check must fail on the things it claims to catch.

    Asserted on `offenders()` -- the function the real test calls -- so deleting
    a branch of it fails HERE as well as leaving the real test inert. The
    previous self-test recomputed its own counts and survived both deletions.
    """
    assert offenders(_handler(BYPASSES[name])), f"{name} is not caught"


@pytest.mark.parametrize("name", sorted(ALLOWED))
def test_the_guard_does_not_flag_the_sanctioned_spellings(name):
    assert offenders(_handler(ALLOWED[name])) == [], f"{name} must stay allowed"


def test_the_guard_follows_the_leak_out_of_the_handler():
    """Two bypasses were simply outside `ast.ExceptHandler`."""
    via_helper = (
        "def _report(exc):\n"
        "    log.error('boom', error=str(exc))\n"
        "\n"
        "def handler():\n"
        "    try:\n"
        "        pass\n"
        "    except Exception as exc:\n"
        "        _report(exc)\n"
    )
    assert offenders(via_helper), "a leak in a helper the handler calls must be caught"
    via_finally = (
        "def handler():\n"
        "    try:\n"
        "        pass\n"
        "    except Exception as exc:\n"
        "        pass\n"
        "    finally:\n"
        "        log.error('boom', error=str(exc))\n"
    )
    assert offenders(via_finally), "a leak in `finally:` must be caught"


def test_every_module_that_imports_log_safety_is_guarded():
    """`GUARDED_SOURCES` must not be able to shrink silently.

    Dropping `routes/career_routes.py` from the list reported 505 passed and NO
    failure -- one fewer parametrisation, which nothing compared against
    anything. The sibling file `test_public_route_log_leaks.py` has had a
    staleness guard the whole time; this one had none.
    """
    importers = set()
    for path in sorted(BACKEND.rglob("*.py")):
        relative = path.relative_to(BACKEND).as_posix()
        if relative.startswith((".venv/", "tests/", "scripts/", "migrations/")):
            continue
        source = path.read_text(encoding="utf-8")
        if relative == "log_safety.py" or "log_safety import" in source or "import log_safety" in source:
            importers.add(relative)
    assert importers == set(GUARDED_SOURCES), (
        "every module that reports through log_safety must be in GUARDED_SOURCES.\n"
        f"  missing from the list: {sorted(importers - set(GUARDED_SOURCES))}\n"
        f"  listed but not importers: {sorted(set(GUARDED_SOURCES) - importers)}"
    )


def test_every_guarded_module_actually_has_except_blocks_to_check():
    """A file that stopped parsing, or moved its handlers, must not pass by
    being empty of anything to look at."""
    for relative in GUARDED_SOURCES:
        tree = ast.parse(_source(relative))
        handlers = [n for n in ast.walk(tree) if isinstance(n, ast.ExceptHandler)]
        if relative == "log_safety.py":
            continue  # the helper itself has no handlers, by design
        assert handlers, f"{relative} has no except blocks; is this still the right file?"


def test_the_sibling_route_modules_use_the_shared_helper():
    """The scope claim in `log_safety`'s own docstring, made checkable.

    The previous wording -- "an invariant of the whole module" -- was true of
    ONE file while ten unauthenticated endpoints in these two still wrote
    `error=str(exc)` into the record message at ERROR.
    """
    for relative in (
        "routes/admission_routes.py",
        "routes/entrepreneurship_routes.py",
        "routes/student_pipeline_routes.py",
        "main.py",
        "celery_worker.py",
    ):
        source = _source(relative)
        assert "log_db_failure" in source, f"{relative} must report failures through the helper"
        tree = ast.parse(source)
        reporting = [
            handler
            for handler in ast.walk(tree)
            if isinstance(handler, ast.ExceptHandler)
            and any(
                isinstance(inner, ast.Call)
                and isinstance(inner.func, ast.Name)
                and inner.func.id == "log_db_failure"
                for inner in ast.walk(handler)
            )
        ]
        assert len(reporting) >= 2, (
            f"{relative} should still be reporting its database failures "
            f"(found {len(reporting)} handlers calling log_db_failure)"
        )


def test_there_is_exactly_one_celery_worker_module():
    """A SECOND, unconverted copy of the worker was invisible to this guard twice.

    `backend/workers/celery_worker.py` still wrote `log.error(..., error=e)` --
    the exception-OBJECT spelling, which `diagnose=False` does not close -- at
    four sites, plus four `error=str(e)`. It was outside `GUARDED_SOURCES`
    because it did not import `log_safety`, and
    `test_every_module_that_imports_log_safety_is_guarded` only checks the
    converse direction, so neither half of the guard could see it.

    It was also DEAD: `systemd/levelup-celery-worker.service` runs
    `-A celery_worker` with `WorkingDirectory=/home/ubuntu/levelup-backend`,
    which resolves to `backend/celery_worker.py`; the copy was last touched
    2026-07-31 and lacked the newer beat entries. It has been deleted. A
    duplicate is the failure mode this asserts against -- one file to convert,
    and the guard's blindness stops mattering.
    """
    copies = sorted(
        path.relative_to(BACKEND).as_posix()
        for path in BACKEND.rglob("celery_worker.py")
        if ".venv" not in path.parts
    )
    assert copies == ["celery_worker.py"], (
        "more than one celery_worker module exists; only the backend-root copy "
        f"is what systemd runs, so the others are unguarded dead code: {copies}"
    )

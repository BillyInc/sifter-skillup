"""Log-safe error reporting, public-search input cleaning, safe ILIKE search.

This lives OUTSIDE `routes/` on purpose. Both things in here were written as
private helpers of `routes/career_routes.py`, and the docstring there claimed
they were "an invariant of the whole module". They were an invariant of ONE
FILE: ten unauthenticated sibling endpoints in `routes/admission_routes.py` and
`routes/entrepreneurship_routes.py` still wrote `log.error(msg,
error=str(exc))`, which `logger.Logger.error` renders as
`logger.error("{} | {}", message, error)` -- so the raw text lands in the
record MESSAGE at ERROR level, i.e. in `error.log` (added UNCONDITIONALLY with
30-day retention) and in stderr/journald.

An invariant that has to be re-implemented per route file is not an invariant.
One module, imported by every route file that talks to PostgREST, is. The AST
check in `tests/test_log_safety_source.py` is what keeps it true as routes are
added: it reads the source of every participating route file and fails if any
`except` block hands raw exception text to a warning/error/info/critical log
call. Enumerating routes cannot do that -- 22 of the 31 `except` blocks in
`career_routes.py` were individually revertible with a green suite because the
behavioural test only knew about nine of them.
"""

from __future__ import annotations

import re
from collections.abc import Callable, Sequence
from typing import Any

from logger import log

# PostgREST codes are PGRSTnnn; Postgres SQLSTATEs are five alphanumerics.
# Shape alone is NOT enough for the SQLSTATE half: `?q=12345` has exactly that
# shape, and the URL of a failed request carries the query string -- so a bare
# five-character run would lift the user's own search term into `error_code`.
# A SQLSTATE is therefore only lifted where the text presents it AS a code:
# after a `code` key, or immediately before the `:` of a `42P01: ...` prefix.
# PGRSTnnn is distinctive enough to take anywhere.
_ERROR_CODE_SHAPE = re.compile(r"\A(?:PGRST\d{3}|[0-9][0-9A-Za-z]{4})\Z")
_ERROR_CODE_RE = re.compile(
    r"""['"]?\bcode['"]?\s*[:=]\s*['"]?(PGRST\d{3}|[0-9][0-9A-Za-z]{4})\b"""
    r"""|\b(PGRST\d{3})\b"""
    r"""|\b([0-9][0-9A-Za-z]{4})(?=\s*:)"""
)

# Every character Postgres `LIKE`/`ILIKE` treats as syntax rather than as text.
#
# `%` and `_` are the obvious two. `*` is the one that was missed, and it is
# the dangerous one: PostgREST maps `*` to `%` in its own `like`/`ilike`
# operators, so `?q=**` cleared the two-character floor and then matched
# everything. MEASURED against dev (read-only PostgREST, `skillup_dev`):
#
#     name=ilike.%zzzqqq%  -> 200, 0 rows       (control)
#     name=ilike.%*%       -> 206, 160 rows     (the whole domains table)
#     name=ilike.*         -> 206, 160 rows
#     name=ilike.%a*%      -> 206, 128 rows  == name=ilike.%a%  -> 206, 128
#
# `\` is Postgres's LIKE ESCAPE character, verified on the same project:
#
#     name=ilike.%a\%      -> 200, 0 rows   (matches the literal text "a%")
#     name=ilike.%a\\%     -> 200, 0 rows   (literal backslash, then wildcard)
#     name=ilike.%a\_%     -> 200, 0 rows   (literal underscore)
#     name=ilike.%a\       -> 400, SQLSTATE 22025
#                             "LIKE pattern must not end with escape character"
#
# That 400 is reachable with a HAND-BUILT pattern. An earlier revision of this
# comment went further and claimed it was reachable THROUGH
# `career_routes.get_jamb_domains`, because that route passed its path segment
# to `.ilike()` unwrapped. RE-TESTED at the route level with this cleaner
# disabled: segments `\` and `a\` both answer **200 with 0 rows**. The unwrapped
# probe matches nothing, and the route then falls through to a `%...%` fallback
# where the trailing `\` escapes the APPENDED `%` instead of dangling. The 5xx
# rationale was wrong and is withdrawn; nothing in this repo is known to reach
# 22025 from user input.
#
# `\` is still stripped, on the one rule this module enforces: the caller's
# pattern must contain no pattern syntax the USER supplied. A `\` can only ever
# NARROW a match, so it is not a scraping amplifier the way `*` is -- it is
# removed because it silently re-interprets the character after it, not because
# it was ever shown to produce a 5xx.
#
# Stripping is NOT free, and the earlier claim that it "costs nothing real" was
# audited over `\`, `%` and `_` only -- the three that really are absent. The
# audit could not have found a `*`, because it used escaped-literal `ilike`
# probes and `ilike` CANNOT EXPRESS a literal `*`: PostgREST rewrites `*` to `%`
# while building the operator, before Postgres sees the pattern, so `\*` arrives
# as `\%` (an escaped literal percent). Re-audited with `imatch` (`~*`, which
# PostgREST passes through verbatim) over the nine reachable searchable text
# columns on dev -- domain_tools.tool_name, domains.name, domain_roles.role_name,
# programmes.name/display_name, schools.name, jamb_programmes.jamb_name,
# subject_catalog.name, domain_certifications.name:
#
#     domain_tools.tool_name  =imatch.\*  -> 16 rows   of n=48,560
#         "ALK Technologies PC*Miler"
#         "Automotive and Accounting Software by R*KOM Invoice Writer"
#         "MedDataSolutions Regist*r"
#     every other column, and `\`, `%`, `_` everywhere  -> 0 rows
#
# So a user typing `PC*Miler` now matches nothing. That cost is ACCEPTED rather
# than fixed: the same PostgREST rewrite that makes `*` a wildcard also makes it
# inexpressible as a literal, so there is no escaping option here -- a literal
# `*` search would need a different operator (`imatch`/full-text), which is a
# product change, not a cleaning change.
_LIKE_METACHARACTERS = ("%", "_", "*", "\\")


def _extract_error_code(text: str) -> str:
    match = _ERROR_CODE_RE.search(text)
    if not match:
        return ""
    return next((group for group in match.groups() if group), "")


def error_summary(exc: BaseException) -> tuple[str, str]:
    """A log-safe ``(code, exception class)`` for a database/transport failure.

    ``str(exc)`` on a PostgREST error carries the message and hint -- schema and
    table names -- and on an ``httpx.HTTPStatusError`` it carries the request
    URL, which contains the Supabase project ref AND the raw user query string.
    These logs go to stdout/journald and to error.log with 30-day retention, so
    the classified summary is what gets logged at warning/error.

    The raw string stays at DEBUG. That is not "off by default": `logger.py`
    adds the app.log sink unconditionally, and it used to add it at DEBUG, so
    the project ref and the user's raw search string were greppable on disk for
    the retention window. The decision taken is that the DEBUG sink -- like the
    stdout one -- is gated on ENVIRONMENT=development; outside development
    app.log starts at INFO and these detail lines are never written.
    """
    # The attribute goes through the SAME shape check as the text: `exc.code`
    # is whatever the raising library put there, and passing it through
    # unvalidated is another way for free text to reach the log line.
    code = str(getattr(exc, "code", "") or "")
    if not _ERROR_CODE_SHAPE.match(code):
        code = _extract_error_code(str(getattr(exc, "args", None) or exc))
    return (code or "unclassified", type(exc).__name__)


class _ClassifiedFailure(Exception):
    """A stand-in that carries a raising STACK but not what the failure SAID."""


def frames_only(exc: BaseException) -> BaseException:
    """``exc``'s traceback with its message replaced by the classified summary.

    The thing `backtrace=True` is for is the FRAME LIST -- file, line, function,
    source line -- and the frame list is code, not data. What actually leaked
    through `logger.opt(exception=exc)` was the rendered VALUE line:

        httpx.HTTPStatusError: Server error '500 ...' for url
        'https://<PROJECT_REF>.supabase.co/rest/v1/programmes?...&name=ilike.
         %25<RAW TERM>%25'

    The round-10 answer was to stop passing the object at all, which removed
    the value line and the stack with it: `main.unhandled_exception_handler` --
    the ONE handler whose entire job is recording unexpected crashes -- went
    from "ERROR, 2 frames, names the raiser" to "a RuntimeError happened at
    /x", with no file and no line at any level. That trade was not necessary.
    Keeping the stack and dropping the message is both halves.

    THE CHAIN. `traceback` renders `__cause__`/`__context__`/`__notes__` in
    full, so a chained or annotated failure could re-open the value line one
    link down -- and this is the normal case, not a corner: `raise
    HTTPException(...) from exc` is everywhere. All three are dropped for the
    same reason: a freshly CONSTRUCTED exception has none of them (`__cause__`
    and `__context__` are only populated when one is raised; `__notes__` only
    exists once `add_note` is called), and `stand_in` is never raised, so
    building a new object rather than editing `exc` in place is what closes
    every one of those channels. Explicitly assigning `stand_in.__cause__ =
    None` here would be dead code -- it was written that way for one revision
    and no mutation could kill it.

    `__notes__` is named here because it is the third member of that family and
    the earlier version of this analysis silently omitted it. It is a LIVE
    channel, not a theoretical one: adding four lines that copy
    `exc.__notes__` onto `stand_in` survived the whole suite green and put
    `['<project-ref>', 'supabase.co', 'secret']` -- project ref plus the raw
    user term -- back into an ERROR record. All three are pinned by
    `test_the_chain_is_cleared_so_no_link_renders_the_value_line` and
    `test_a_note_added_to_the_exception_does_not_survive_either`, which fail
    the moment this function starts returning `exc` itself or copying its
    annotations across.

    `diagnose=False` (see `logger.py`) is what keeps frame LOCALS out; this
    function is what keeps the exception's own text out.
    """
    error_code, error_type = error_summary(exc)
    stand_in = _ClassifiedFailure(f"{error_type} [{error_code}]")
    stand_in.__traceback__ = getattr(exc, "__traceback__", None)
    return stand_in


def log_db_failure(
    message: str,
    exc: BaseException,
    *,
    level: str = "error",
    with_traceback: bool = False,
    **fields,
) -> None:
    """Report a database/transport failure without printing what it says.

    The DEFAULT spelling for an `except` block in every route module listed in
    `tests/test_log_safety_source.py::GUARDED_SOURCES`.

    Not the only spelling, and the docstring used to claim otherwise ("every
    `except` block routes through `_log_db_failure`, which is the only place
    allowed to pair a warning/error record with the raw text"). That sentence
    was false in both directions and would have misled the next auditor into
    thinking a grep for this function name was a complete audit. What is
    actually true:

      * most handlers call this helper;
      * four hand-inline the same classified summary because they need to vary
        the message or the fields -- `_safe_query`'s missing-relation split,
        the `/search` skill-layer handler, `/search`'s own top-level handler,
        and the stale-index refresh handler. Each pairs `error_summary(...)` at
        warning/error with `str(exc)` on a separate DEBUG record, i.e. exactly
        what this helper does;
      * many handlers log ONLY at `log.debug`. Those are already safe: DEBUG is
        the sanctioned channel for raw text and `app.log` is gated on
        ENVIRONMENT=development.

    The invariant is therefore "no `except` block puts raw exception text in a
    warning-or-above record", NOT "every `except` block calls this function",
    and it is enforced by parsing the source rather than by this docstring.

    What it replaces was `log.error("...", error=str(exc))`, and
    `Logger.error(self, message, error=None)` emits `logger.error("{} | {}",
    message, error)` -- so a `str` error lands in the record MESSAGE at ERROR
    level. That reaches error.log (30-day retention, added UNCONDITIONALLY, so
    the ENVIRONMENT gate on app.log does not help) and stderr/journald.

    `str(httpx.HTTPStatusError)` is, empirically:

        Server error '500 ...' for url 'https://<PROJECT_REF>.supabase.co
        /rest/v1/programmes?select=id&name=ilike.%25<RAW USER TERM>%25'

    Driving the UNAUTHENTICATED career, admission and entrepreneurship routes
    into that exception put the Supabase project ref and the user's raw search
    term verbatim into the record message. `error_summary` reduces it to a
    shape-checked SQLSTATE and an exception class name; the raw text stays at
    DEBUG (see `error_summary` for why that is a real gate and not a nominal
    one).

    Passing an Exception OBJECT rather than a string is the same leak by
    another route: `Logger.error` then calls `logger.opt(exception=exc)`, which
    puts the text in the traceback -- and, while any sink had
    `diagnose=True`, the frame locals of every frame with it. Neither `message`
    nor `extra` carries it, which is why the leak tests had to learn to read
    `record["exception"]` too. This helper never passes `exc` on as an object.
    """
    error_code, error_type = error_summary(exc)
    # Fails OPEN on an unrecognised `level`: a typo logs at ERROR rather than
    # raising. That is the safe direction for a logging helper (a mistyped
    # level must not take a request down), and the fallback is unreachable
    # today -- `"warning"` (x20), `"info"` (x1) and the `"error"` default are
    # the only values any caller passes, so a mutant that raises instead is
    # equivalent and no test can kill it.
    emit = {"warning": log.warning, "info": log.info, "critical": log.critical}.get(
        level, log.error
    )
    if with_traceback and level in ("error", "critical"):
        # `Logger.error`/`Logger.critical` are the only two that route an
        # exception through `logger.opt(exception=...)`; at warning/info the
        # object would just be stringified into `extra`, which is the
        # classified summary twice over and no stack at all.
        emit(
            message,
            error=frames_only(exc),
            error_code=error_code,
            error_type=error_type,
            **fields,
        )
    else:
        emit(message, error_code=error_code, error_type=error_type, **fields)
    log.debug(message + " detail", error=str(exc))


def clean_public_query(q: str | None) -> str:
    """Normalize public search text and remove every LIKE metacharacter.

    Public career and admission endpoints are intentionally sliced search
    endpoints, not bulk export endpoints -- `/search` says so in its own
    short-query notice ("Bulk graph listing is not exposed"). Removing `%`,
    `_`, `*` and `\\` is what makes that true: see `_LIKE_METACHARACTERS` for
    the measured behaviour of each one, including why `*` alone was enough to
    paginate the entire career graph out of these endpoints and why `\\` is
    stripped as a 5xx source rather than as a wildcard.

    This does not claim to bound the RESULT SET -- that is the caller's
    `.limit()` -- only that the caller's pattern contains no syntax the user
    supplied.
    """
    cleaned = q or ""
    for char in _LIKE_METACHARACTERS:
        cleaned = cleaned.replace(char, "")
    return cleaned.strip()


def ilike_any(
    build_query: Callable[[], Any],
    columns: Sequence[str],
    term: str,
    *,
    limit: int,
    order_by: str | None = None,
    key: str = "id",
) -> list[dict]:
    """Rows where ANY of ``columns`` matches ``%term%``, one read per column.

    This exists because of the spelling it replaces, which three public search
    handlers shared::

        like = f"%{clean_public_query(q)}%"
        query.or_(f"name.ilike.{like},display_name.ilike.{like}")

    `clean_public_query` removes LIKE metacharacters. It does NOT remove `,` or
    `.`, and it must not be asked to: those are not LIKE syntax, they are
    PostgREST FILTER-DSL separators, and the string above is a filter
    EXPRESSION rather than a parameter value. So the user got to write their own
    filter, on any column, and that filter never passed through any cleaner.
    MEASURED against dev before this helper existed:

        /api/career/programmes?q=zzzzqqqq        ->  0 rows   (control)
        /api/career/programmes?q=computer        ->  3 rows   (control)
        /api/career/programmes?q=zz,name.gt.A    -> 25 rows   Accounting,
                                                    Actuarial Science, ...
        /api/career/programmes?q=zz,name.like.*  -> 25 rows   -- the `*` lives
                                                    inside the INJECTED term,
                                                    so no cleaner ever sees it
        /api/career/programmes?q=zz,no_such_col.gt.1 -> degraded response,
                                                    i.e. a column-existence oracle
        /api/student/jamb-programmes?q=zz,jamb_name.gt.A -> 30 rows vs 0 control

    `name.gt.<last name on the page>` is keyset pagination, so 25 rows per
    request walked the entire `programmes` table out of an endpoint whose own
    short-query notice says "Bulk listing is not exposed."

    The fix is deliberately not a longer strip list. A strip list is a blocklist
    and the previous two rounds of this review each bypassed the last one. One
    `.ilike(column, pattern)` call per column hands the pattern over as a single
    ENCODED parameter value, so "the user cannot contribute filter syntax" is a
    property of the CALL SHAPE and not of a character inventory. `/api/career/
    search` was never vulnerable for exactly this reason (verified: `zz,name.gt.A`,
    `zz),or(name.gt.A` and `zz,domains.name.gt.A` all return 0 rows there).

    The cost is one round trip per column instead of one per query. These are
    two-column typeaheads, and both call sites already had a second fallback
    read on the same path.

    ``build_query()`` must return a FRESH builder on each call -- the per-column
    reads are separate requests, and a builder cannot be reused. EVERY column is
    read, for a full ``limit`` page each; the rows are then merged,
    de-duplicated on ``key``, ordered, and truncated to ``limit``.

    THE TWO BEHAVIOURAL DIFFERENCES FROM THE `or=` SPELLING, both stated rather
    than glossed. An earlier revision of this docstring announced "ONE" and then
    described the smaller of them, so:

    1. TRUNCATION WITH A COLUMN PREFERENCE -- REMOVED, it was not an edge case.
       This helper used to stop reading as soon as the first column filled the
       page, so a row matching only on `display_name` fell off a full page of
       `name` matches. Simulated against dev on `v_jamb_programme_details` at
       the default `limit=30`, versus the `or=` spelling:

           q=science    -> 6+ rows swapped out of the page (lost Agronomy,
                           Animal Breeding and Genetics, Computing and
                           Artificial Intelligence, ...)
           q=management -> 6+ (lost Aviation Business, Horticulture, ...)
           q=studies / e / o -> 2-6

       ~20% of a typeahead page for an ordinary query is not a corner. Reading
       every column and truncating the MERGED, ordered set removes the class
       outright, and costs at most one extra round trip on the paths that used
       to short-circuit -- both call sites are two-column typeaheads that
       already carried a second fallback read.

       That extra read is NOT free everywhere, and the honest version of the
       cost is: on dev, `programmes.display_name` is NULL for all 244 rows, so
       `/api/career/programmes`'s second read returns nothing and is pure
       latency today. It is paid anyway, because the column is in the schema
       and the alternative is a page whose contents depend on how full the
       first column's read happened to be. Both call sites now run their reads
       OFF the event loop on the search limiter, so the cost is latency on one
       request rather than a stall on the whole process.

    2. THE MERGE ORDER IS PYTHON'S, NOT THE DATABASE'S. Two ordered reads do
       not concatenate into one ordered list, so the merged set is re-ordered
       here. `str(...)` alone -- codepoint order -- is visibly NOT the server's
       collation. MEASURED on dev, `programmes` where `name=ilike.%comp%`:

           Postgres: Complementary and Alternative Medicine,
                     COMPUTER ENGINEERING, Computer Science
           str():    COMPUTER ENGINEERING,
                     Complementary and Alternative Medicine, Computer Science

       and because the sort runs BEFORE the truncation it also decides which
       rows survive the page. `casefold()` reproduces the server's answer for
       both of those and for every ASCII typeahead term these two endpoints
       serve; it is an APPROXIMATION of the database collation, not a
       reimplementation of it -- accents, punctuation and non-Latin scripts can
       still differ from ICU/libc. ``key`` breaks ties so the order is total.

       The `reads > 1` guard below counts columns ATTEMPTED, not columns that
       produced rows -- `reads += 1` fires before `.execute()`. Both call sites
       pass TWO columns unconditionally, so `reads` is always 2 there and the
       re-sort ALWAYS runs; a reader of an earlier version of this paragraph
       would have taken away the opposite ("a single read is returned in the
       server's own order"), which is unreachable from anything in this
       repository. The guard is kept because it is correct for a one-column
       caller, not because any caller reaches it.

       That is deliberately NOT made into a live short-circuit on "rows only
       came back from one column": the point of reading every column is that
       which column filled the page must not decide the contents, and a
       short-circuit keyed on the ROWS reintroduces exactly that dependence
       for the case where one column happens to be empty. Measured, the
       re-sort costs nothing today: `programmes.display_name` is non-null for
       0 rows on dev, and 12 terms diffed between Postgres `order=name` and
       `sorted(key=(casefold, id))` showed ZERO divergences.
    """
    merged: list[dict] = []
    seen: set = set()
    pattern = f"%{term}%"
    reads = 0
    for column in columns:
        query = build_query().ilike(column, pattern)
        if order_by:
            query = query.order(order_by)
        reads += 1
        for row in (query.limit(limit).execute().data or []):
            if key not in row:
                # `row.get(key)` would be `None` for every row, so `seen`
                # collapses the whole result to ONE row -- silently, and only
                # when a caller forgets to select its own key. Probed: 3 rows
                # in, 1 row out. Both call sites select their key; `key="id"`
                # defaulting quietly is what makes this worth refusing.
                raise ValueError(
                    f"ilike_any: every row must select the dedupe key {key!r}; "
                    f"got columns {sorted(row)!r}"
                )
            identity = row[key]
            if identity in seen:
                continue
            seen.add(identity)
            merged.append(row)
    if order_by and reads > 1:
        merged.sort(key=lambda row: (str(row.get(order_by) or "").casefold(), str(row[key])))
    return merged[:limit]


__all__ = [
    "clean_public_query",
    "error_summary",
    "frames_only",
    "ilike_any",
    "log_db_failure",
]

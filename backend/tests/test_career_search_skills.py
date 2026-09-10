"""GET /api/career/search — the `skills` group after the v2 taxonomy sweep.

migration_career_v2.sql dropped `domain_bridge_skills`, `role_bridge_skills`
and `adjacent_prerequisites` and did not recreate them: v2 keeps the same
skills as JSONB on `domains.foundation_skills`,
`domain_subgroups.cluster_skills` and `domain_roles.essential_skills` /
`optional_skills`. The search route still queried the dropped tables through a
`safe_query` helper that swallowed the missing-relation error, so the group
returned `[]` for every query instead of failing.

These tests pin the replacement: the group is answered from the JSONB layers,
the pipe-joined string shape that most seeded role rows use is split into real
skills, and a missing relation is logged loudly rather than at debug.
"""

import asyncio
import threading
import time
import tracemalloc
from contextlib import contextmanager
from unittest.mock import MagicMock, patch

import anyio
import anyio.to_thread
import pytest
from fastapi.concurrency import run_in_threadpool
from loguru import logger as loguru_logger

import routes.career_routes as cr


# The backend logs through loguru, which does not go through the stdlib
# `logging` tree, so pytest's `caplog` sees nothing. This is the equivalent:
# a temporary loguru sink that keeps the raw records.
@contextmanager
def captured_logs(level="DEBUG"):
    records = []
    sink_id = loguru_logger.add(lambda message: records.append(message.record), level=level)
    try:
        yield records
    finally:
        loguru_logger.remove(sink_id)


DOMAINS = [
    {
        "id": "d1",
        "domain_key": "D001",
        "name": "Software Engineering",
        "cluster": "ICT",
        "excluded": False,
        "foundation_skills": [
            {"skill": "computer programming", "prevalence": 0.4, "n": 9},
            {"skill": "software testing", "prevalence": 0.2, "n": 5},
        ],
    },
]
SUBGROUPS = [
    {
        "id": "s1",
        "domain_id": "d1",
        "label": "Application developers",
        "description": None,
        "cluster_skills": ["programming languages", "version control"],
    },
]
ROLES = [
    {
        "id": "r1",
        "role_key": "D001|Backend Developer",
        "role_name": "Backend Developer",
        "domain_id": "d1",
        "tier": "entry",
        # The shape 4395 of 5093 seeded rows actually use.
        "essential_skills": "API design | database programming | testing",
        "optional_skills": ["container orchestration"],
    },
]


class _Table:
    """One PostgREST request builder, modelled rather than stubbed.

    Three properties are load-bearing:

      * it has NO `.data`. Reading `.data` off the builder instead of calling
        `.execute()` is exactly the bug this branch fixes; a bare MagicMock
        auto-creates `.data` as a truthy mock that iterates empty, so the
        regression would come back green.
      * `MAX_ROWS` is the SERVER's `db-max-rows`, and it is deliberately
        INDEPENDENT of `cr._SKILL_PAGE_SIZE`. Pinning the two equal is what
        hid the silent truncation: when the pager never asks for more than the
        server will give, "this page was short" and "this was the last page"
        are the same statement, and code that confuses them looks correct.
        Keeping them apart makes the difference testable.
      * `count="exact"` is answered with the TOTAL row count, the way
        PostgREST answers it, so the build's cross-check is actually armed.
      * `.ilike()`, `.eq()` and `.in_()` are MODELLED, not stubbed. A `.ilike()`
        that returns every row makes every filter in the route invisible:
        `_search("zzzzzzzz")` came back with `Software Engineering`, and
        removing an `excluded` check from a PostgREST-side group changed no
        test result at all.
    """

    MAX_ROWS = 1000

    def __init__(self, rows, failing=None, count_override=None):
        self._rows = rows
        self._failing = failing
        self._count_override = count_override
        self.calls = 0
        self.ordered_by = None
        self.requested_ranges: list = []
        # One entry per `.select(..., count="exact")`. PostgREST runs a full
        # COUNT(*) for each of those, so a pager that asks on every page pays
        # for a count it only ever reads once.
        self.count_requests: list = []
        # (start, end, rows actually served) per call, so a test can assert the
        # pager never re-reads or skips a row even when the server clamps.
        self.window_log: list = []
        self._reset()

    def _reset(self):
        self._range = None
        self._limit = None
        self._count = False
        self._filters: list = []

    def select(self, *_a, **kwargs):
        self._count = kwargs.get("count") == "exact"
        if self._count:
            self.count_requests.append(True)
        return self

    def order(self, column, **_k):
        self.ordered_by = column
        return self

    def eq(self, column, value):
        self._filters.append(("eq", column, value))
        return self

    def ilike(self, column, pattern):
        # Only PostgREST's `%` wildcard is supported, which is all these
        # routes ever send.
        self._filters.append(("ilike", column, pattern))
        return self

    def in_(self, column, values):
        self._filters.append(("in", column, list(values)))
        return self

    def limit(self, n):
        self._limit = n
        return self

    def range(self, start, end):
        self._range = (start, end)
        self.requested_ranges.append((start, end))
        return self

    @staticmethod
    def _matches(kind, row, column, value):
        cell = row.get(column)
        if kind == "eq":
            return cell == value
        if kind == "in":
            return cell in value
        body = str(value)
        text = "" if cell is None else str(cell)
        if body.startswith("%") and body.endswith("%"):
            return body[1:-1].casefold() in text.casefold()
        return text.casefold() == body.casefold()

    def _filtered(self):
        rows = self._rows
        for kind, column, value in self._filters:
            rows = [row for row in rows if self._matches(kind, row, column, value)]
        return rows

    def _window(self, rows):
        if self._range is not None:
            start, end = self._range
            # The server clamps the window to db-max-rows and reports it only
            # in Content-Range, which the supabase client discards.
            return rows[start:start + min(end - start + 1, self.MAX_ROWS)]
        asked = self._limit if self._limit is not None else self.MAX_ROWS
        return rows[:min(asked, self.MAX_ROWS)]

    def execute(self):
        self.calls += 1
        want_count = self._count
        try:
            if self._failing is not None:
                raise self._failing
            if isinstance(self._rows, BaseException):
                raise self._rows
            matching = self._filtered()
            total = len(matching)
            data = list(self._window(matching))
            if self._range is not None:
                self.window_log.append((self._range[0], self._range[1], len(data)))
        finally:
            self._reset()
        result = MagicMock(data=data)
        if want_count:
            result.count = total if self._count_override is None else self._count_override
        else:
            result.count = None
        return result


def _svc_with(domains=DOMAINS, subgroups=SUBGROUPS, roles=ROLES, failing=None, tables=None):
    """A service client whose builders have no `.data` (see `_Table`).

    `failing` maps a table name to an exception raised by its `.execute()`, so
    a database-boundary failure travels through the real error handling.
    `tables` pins a specific `_Table` instance per name, for tests that need to
    count the calls a single builder received across pages.
    """
    failing = failing or {}
    pinned = tables or {}
    payloads = {
        "domains": domains,
        "domain_subgroups": subgroups,
        "domain_roles": roles,
    }

    def table(name):
        if name in pinned:
            return pinned[name]
        return _Table(payloads.get(name, []), failing=failing.get(name))

    return MagicMock(table=table)


def _search(q, svc=None) -> dict:
    cr._reset_skill_index_cache()
    with patch.object(cr, "_svc", lambda: svc or _svc_with()):
        data = asyncio.run(cr.search_career(q=q)).data
    cr._reset_skill_index_cache()
    assert data is not None
    return data


class TestSearchSkillLayers:
    def test_domain_foundation_skill_is_searchable(self):
        skills = _search("programming")["data"]["skills"]
        names = {s["name"] for s in skills}
        assert "computer programming" in names
        hit = next(s for s in skills if s["name"] == "computer programming")
        assert hit["domainId"] == "D001"
        assert hit["domainName"] == "Software Engineering"
        assert hit["context"] == "Foundation skill"

    def test_subgroup_cluster_skill_is_searchable(self):
        skills = _search("version")["data"]["skills"]
        assert [s["name"] for s in skills] == ["version control"]
        assert skills[0]["context"] == "Sub-group skill — Application developers"

    def test_pipe_joined_role_skills_are_split_into_separate_skills(self):
        skills = _search("database")["data"]["skills"]
        assert [s["name"] for s in skills] == ["database programming"]
        assert skills[0]["context"] == "Role skill — Backend Developer"

    def test_optional_role_skills_are_labelled_as_optional(self):
        skills = _search("orchestration")["data"]["skills"]
        assert skills[0]["context"] == "Role skill (optional) — Backend Developer"

    def test_one_skill_name_cannot_flood_the_group(self):
        shared = [
            {
                "id": f"d{i}",
                "domain_key": f"D00{i}",
                "name": f"Domain {i}",
                "cluster": "ICT",
                "foundation_skills": [{"skill": "financial statements"}],
            }
            for i in range(1, 5)
        ]
        svc = _svc_with(domains=shared, subgroups=[], roles=[])
        skills = _search("financial", svc=svc)["data"]["skills"]
        assert len(skills) == cr._MAX_DOMAINS_PER_SKILL
        assert {s["domainId"] for s in skills} == {"D001", "D002"}
        # ... and the response says so, rather than implying two is all there is.
        assert {s["otherDomainCount"] for s in skills} == {2}

    def test_two_unresolved_domains_do_not_collapse_into_one_skill_row(self):
        """The de-dup key falls back to `domain_id` when `domain_key` is unknown.

        Keying on `domain_key or ""` alone made every row whose domain did not
        resolve share the key `(name, "")`, so the second and subsequent ones
        were silently dropped. Removing the `or row.get("domain_id")` fallback
        changed no test result.
        """
        domains = [
            {"id": f"d{i}", "domain_key": None, "name": None, "cluster": None,
             "excluded": False, "foundation_skills": ["version control"]}
            for i in (1, 2)
        ]
        skills = _search(
            "version", svc=_svc_with(domains=domains, subgroups=[], roles=[])
        )["data"]["skills"]
        assert len(skills) == 2, "two distinct domains must not collapse into one row"
        assert {s["domainId"] for s in skills} == {None}

    def test_an_untruncated_skill_reports_no_hidden_domains(self):
        skills = _search("version")["data"]["skills"]
        assert [s["otherDomainCount"] for s in skills] == [0]

    def test_optional_groups_are_actually_executed(self):
        # `safe_query` used to read `.data` off the PostgREST request builder
        # without calling `.execute()`. That raised AttributeError into its own
        # except branch, so every optional group returned [] regardless of the
        # query. A populated sub-group here is the regression guard.
        data = _search("developers")["data"]
        assert [g["name"] for g in data["subgroups"]] == ["Application developers"]

    def test_no_match_returns_an_empty_group_not_an_error(self):
        assert _search("zzzzz")["data"]["skills"] == []

    def test_skill_layer_failure_does_not_break_the_whole_search(self):
        def boom(_svc):
            raise RuntimeError("skill index unavailable")

        with patch.object(cr, "_build_skill_index", boom):
            # `software` matches the DOMAIN NAME as well as a foundation skill,
            # so the surviving groups are a real assertion now that `.ilike()`
            # is modelled rather than stubbed.
            data = _search("software")["data"]
        assert data["skills"] == []
        # The rest of the search still answers.
        assert [d["id"] for d in data["domains"]] == ["D001"]

    def test_a_query_that_matches_nothing_names_no_domain(self):
        # The guard for the stubbed `.ilike()`: with a no-op filter every
        # PostgREST-side group returned every row, and `zzzzzzzz` answered with
        # `Software Engineering`.
        data = _search("zzzzzzzz")["data"]
        assert data["domains"] == []
        assert data["subgroups"] == []
        assert data["roles"] == []
        assert data["skills"] == []


class TestSkillTextSplitting:
    def test_pipe_joined_string_becomes_individual_skills(self):
        assert cr._skill_text("a | b | c") == ["a", "b", "c"]

    def test_semicolon_joined_string_becomes_individual_skills(self):
        assert cr._skill_text("laboratory safety; data logging") == [
            "laboratory safety",
            "data logging",
        ]

    def test_plain_string_is_unchanged(self):
        assert cr._skill_text("risk management") == ["risk management"]

    def test_list_and_dict_shapes_still_work(self):
        assert cr._skill_text(["x", {"skill": "y"}]) == ["x", "y"]

    def test_non_skill_shapes_are_dropped(self):
        assert cr._skill_text(None) == []
        assert cr._skill_text({"skill": "y"}) == []


class TestMissingRelationDetection:
    def test_postgrest_schema_cache_error_is_recognised(self):
        exc = Exception(
            "{'code': 'PGRST205', 'message': \"Could not find the table "
            "'skillup_dev.domain_bridge_skills' in the schema cache\"}"
        )
        assert cr._is_missing_relation(exc) is True

    def test_undefined_table_sqlstate_is_recognised(self):
        assert cr._is_missing_relation(Exception('42P01: relation "x" does not exist')) is True

    def test_an_ordinary_failure_is_not_a_missing_relation(self):
        assert cr._is_missing_relation(TimeoutError("connection timed out")) is False


class TestSkillIndexPagination:
    """`.limit(n)` is not a way to read a whole table through PostgREST.

    This project's PostgREST enforces `db-max-rows=1000`: the old
    `.limit(10000)` on `domain_roles` came back with 1000 rows and
    `Content-Range: 0-999/5093`, with no error and nothing in the logs. The
    supabase client discards the header, so the index was built from 15,298 of
    44,895 rows and 4,509 distinct skill names were unreachable by search.
    """

    @staticmethod
    def _roles(n):
        return [
            {
                "id": f"{i:08d}",
                "role_key": f"D001|Role {i}",
                "role_name": f"Role {i}",
                "domain_id": "d1",
                "essential_skills": f"skill {i}",
                "optional_skills": [],
            }
            for i in range(n)
        ]

    @staticmethod
    def _pages(rows):
        """How many `.execute()` calls a full read of `rows` rows should take.

        Derived from `cr._SKILL_PAGE_SIZE`, never hardcoded: the point of the
        fix is that the pager's page size and the server's cap are independent,
        so the expectation has to follow whichever is smaller plus the empty
        page that terminates the read.
        """
        step = min(cr._SKILL_PAGE_SIZE, _Table.MAX_ROWS)
        # Full pages, plus the empty page that terminates the read. Nothing
        # here may assume a SHORT page means the end of the data -- that
        # assumption is the bug.
        return -(-rows // step) + 1

    def test_a_table_larger_than_the_row_cap_is_read_in_full(self):
        table = _Table(self._roles(2500))
        rows, complete = cr._fetch_all_rows(
            MagicMock(table=lambda _n: table), "domain_roles", "*", "id"
        )
        assert len(rows) == 2500
        assert complete is True
        assert len({r["id"] for r in rows}) == 2500, "pages must not overlap"
        assert table.calls == self._pages(2500)

    def test_the_requested_windows_do_not_overlap_or_leave_holes(self):
        # `.range(start, start + PAGE_SIZE)` is an off-by-one that repeats one
        # row per page boundary. Asserting on the windows the pager ASKED for
        # catches it even when the server clamps the response.
        table = _Table(self._roles(2500))
        cr._fetch_all_rows(MagicMock(table=lambda _n: table), "domain_roles", "*", "id")
        received = 0
        for start, end, served in table.window_log:
            assert start == received, "each window must resume where the data actually ended"
            assert end >= start
            received += served

    def test_paging_is_ordered_so_the_pages_are_stable(self):
        # Without a total order PostgREST returns physical order, so pages can
        # overlap and leave holes, and which rows land where changes after any
        # UPDATE or VACUUM.
        table = _Table(self._roles(1500))
        cr._fetch_all_rows(MagicMock(table=lambda _n: table), "domain_roles", "*", "id")
        assert table.ordered_by == "id"

    def test_a_page_size_above_the_server_cap_still_reads_everything(self):
        """The regression that round 1's own pagination fix re-armed.

        `_SKILL_PAGE_SIZE` used to be hardcoded to today's `db-max-rows`, and
        the loop ended as soon as a page came back shorter than that. Raise the
        page size above the server's cap -- exactly what happens the day the
        cap is lowered -- and every clamped page looks short, so the FIRST page
        ends the read: 1000 of 5093 rows, `partial=False`, cached as
        authoritative for 900 s.
        """
        table = _Table(self._roles(5093))
        assert table.MAX_ROWS < 1500, "the server cap must stay below the page size here"
        with patch.object(cr, "_SKILL_PAGE_SIZE", 1500):
            rows, complete = cr._fetch_all_rows(
                MagicMock(table=lambda _n: table), "domain_roles", "*", "id"
            )
        assert len(rows) == 5093, "a clamped page is not the end of the data"
        assert complete is True

    def test_an_exact_multiple_of_the_page_size_terminates(self):
        table = _Table(self._roles(2000))
        rows, complete = cr._fetch_all_rows(
            MagicMock(table=lambda _n: table), "domain_roles", "*", "id"
        )
        assert len(rows) == 2000
        assert complete is True
        assert table.calls == self._pages(2000), "the last page comes back empty and ends the loop"

    def test_an_empty_table_is_one_call_and_is_complete(self):
        table = _Table([])
        rows, complete = cr._fetch_all_rows(
            MagicMock(table=lambda _n: table), "domain_roles", "*", "id"
        )
        assert rows == []
        assert complete is True
        assert table.calls == 1

    def test_exactly_one_full_page_is_read_in_full(self):
        table = _Table(self._roles(1000))
        rows, complete = cr._fetch_all_rows(
            MagicMock(table=lambda _n: table), "domain_roles", "*", "id"
        )
        assert len(rows) == 1000
        assert complete is True

    def test_one_row_past_a_full_page_is_read_in_full(self):
        table = _Table(self._roles(1001))
        rows, complete = cr._fetch_all_rows(
            MagicMock(table=lambda _n: table), "domain_roles", "*", "id"
        )
        assert len(rows) == 1001
        assert complete is True
        assert rows[-1]["id"] == f"{1000:08d}"

    def test_a_short_read_against_the_exact_count_is_reported_incomplete(self):
        # A reseed landing mid-pagination gives a short-but-non-empty read of
        # every layer. Page length alone cannot see it; the server's own count
        # can.
        table = _Table(self._roles(400), count_override=5093)
        rows, complete = cr._fetch_all_rows(
            MagicMock(table=lambda _n: table), "domain_roles", "*", "id"
        )
        assert len(rows) == 400
        assert complete is False, "a read that misses the server's own count is not complete"

    def test_a_server_without_a_count_leaves_the_cross_check_unarmed(self):
        # Failing closed on a missing count would mark every build partial.
        table = _Table(self._roles(10))
        table.select = lambda *_a, **_k: table  # never records count="exact"
        rows, complete = cr._fetch_all_rows(
            MagicMock(table=lambda _n: table), "domain_roles", "*", "id"
        )
        assert len(rows) == 10
        assert complete is True

    def test_hitting_the_page_bound_is_logged_loudly_and_is_not_complete(self):
        # A server that keeps returning full pages must not loop forever, but
        # stopping early is a bug and has to leave a trace -- silent truncation
        # is the exact bug class this code exists to remove.
        class Endless(_Table):
            def _window(self, _rows):
                return [{"id": str(i)} for i in range(self.MAX_ROWS)]

        table = Endless([])
        with captured_logs("WARNING") as records:
            rows, complete = cr._fetch_all_rows(
                MagicMock(table=lambda _n: table), "domain_roles", "*", "id"
            )
        assert table.calls == cr._SKILL_MAX_PAGES
        assert len(rows) == cr._SKILL_MAX_PAGES * _Table.MAX_ROWS
        assert complete is False, "a bound-truncated read must not be reported as complete"
        assert any(
            "page bound" in r["message"] and r["level"].name == "WARNING" for r in records
        )

    def test_every_layer_is_paged_not_limited(self):
        # domains (160) and domain_subgroups (542) are under the cap today.
        # They must not start truncating silently the day they grow past it.
        tables = {
            "domains": _Table([{"id": f"d{i}", "foundation_skills": []} for i in range(1200)]),
            "domain_subgroups": _Table([
                {"id": f"s{i}", "domain_id": "d0", "label": "x", "cluster_skills": []}
                for i in range(1100)
            ]),
            "domain_roles": _Table(self._roles(1050)),
        }
        cr._reset_skill_index_cache()
        cr._build_skill_index(_svc_with(tables=tables))
        cr._reset_skill_index_cache()
        assert tables["domains"].calls == self._pages(1200)
        assert tables["domain_subgroups"].calls == self._pages(1100)
        assert tables["domain_roles"].calls == self._pages(1050)


class TestSkillMatchRanking:
    """An exact name must be reachable, not buried under alphabetical noise.

    The index is ordered by skill name and the old search broke at the first
    `limit` substring hits, so `financial` returned twelve alphabetically-early
    `advise on financial ...` entries and the exact name `financial statements`
    -- which exists, and which `financial` matches alongside 56 other names --
    could never appear at all.
    """

    INDEX = [
        {"id": "a", "domain_id": "d1", "skill_name": "advise on financial matters", "category": "c"},
        {"id": "b", "domain_id": "d1", "skill_name": "analyse financial risk", "category": "c"},
        {"id": "c", "domain_id": "d1", "skill_name": "financial statements", "category": "c"},
        {"id": "d", "domain_id": "d1", "skill_name": "financial", "category": "c"},
    ]

    def test_exact_match_outranks_prefix_and_substring(self):
        out = cr._rank_skill_matches(self.INDEX, "financial", limit=2)
        assert [r["skill_name"] for r in out] == ["financial", "financial statements"]

    def test_prefix_outranks_substring(self):
        # Within a rank the shorter name wins: it is the tighter match for the
        # same query. The tie-break is then the name itself, so the order is
        # fully determined and cannot drift.
        out = cr._rank_skill_matches(self.INDEX, "financial", limit=4)
        assert [r["skill_name"] for r in out] == [
            "financial",
            "financial statements",
            "analyse financial risk",
            "advise on financial matters",
        ]

    def test_the_sort_key_is_actually_consulted(self):
        """Dropping `_skill_match_rank` from the sort key must change the answer.

        With `len(name)` alone as the key, a SHORT substring match outranks a
        longer prefix match -- so the pair below is the case that distinguishes
        the two sort keys and pins the rank as a real ordering input.
        """
        index = [
            {"id": "a", "domain_id": "d1", "skill_name": "bank risk",
             "skill_name_cf": "bank risk", "category": "c"},
            {"id": "b", "domain_id": "d1", "skill_name": "risk modelling",
             "skill_name_cf": "risk modelling", "category": "c"},
        ]
        out = cr._rank_skill_matches(index, "risk", limit=2)
        assert [r["skill_name"] for r in out] == ["risk modelling", "bank risk"], (
            "a prefix match must outrank a SHORTER substring match"
        )

    def test_an_equal_length_prefix_and_substring_pair_is_split_by_the_rank(self):
        index = [
            {"id": "a", "domain_id": "d1", "skill_name": "a risk pool",
             "skill_name_cf": "a risk pool", "category": "c"},
            {"id": "b", "domain_id": "d1", "skill_name": "risk analys",
             "skill_name_cf": "risk analys", "category": "c"},
        ]
        assert len("a risk pool") == len("risk analys")
        out = cr._rank_skill_matches(index, "risk", limit=2)
        assert [r["skill_name"] for r in out] == ["risk analys", "a risk pool"]

    def test_names_of_equal_rank_and_length_are_split_by_the_name(self):
        """Dropping the `name` tie-break must change the answer.

        Without it the two names below are indistinguishable to the heap and
        the order falls back to dict insertion order, so the response drifts
        with the index -- and `nsmallest` is not stable across equal keys.
        """
        pair = [
            {"id": "b", "domain_id": "d1", "skill_name": "risk beta",
             "skill_name_cf": "risk beta", "category": "c"},
            {"id": "a", "domain_id": "d1", "skill_name": "risk alfa",
             "skill_name_cf": "risk alfa", "category": "c"},
        ]
        assert len("risk beta") == len("risk alfa")
        forwards = cr._rank_skill_matches(pair, "risk", limit=2)
        backwards = cr._rank_skill_matches(list(reversed(pair)), "risk", limit=2)
        assert [r["skill_name"] for r in forwards] == ["risk alfa", "risk beta"]
        assert [r["skill_name"] for r in backwards] == ["risk alfa", "risk beta"]

    def test_the_rank_function_has_no_unreachable_exact_case(self):
        # An exact match IS a prefix match, and the shortest one, so `len(name)`
        # already puts it first. A separate "exact" rank was dead code: it could
        # be deleted without changing a single result.
        assert cr._skill_match_rank("risk", "risk") == cr._skill_match_rank("risky", "risk")
        assert cr._skill_match_rank("a risk", "risk") > cr._skill_match_rank("risk", "risk")

    def test_ranking_is_deterministic_regardless_of_index_order(self):
        first = cr._rank_skill_matches(self.INDEX, "financial", limit=4)
        second = cr._rank_skill_matches(list(reversed(self.INDEX)), "financial", limit=4)
        assert [r["skill_name"] for r in first] == [r["skill_name"] for r in second]

    def test_other_domain_count_reflects_what_was_actually_emitted(self):
        # `limit` can cut a name after ONE of its two allowed rows. Deriving
        # the count from `_MAX_DOMAINS_PER_SKILL` then understated the hidden
        # domains by one and the client's "and N other fields" was wrong.
        index = [
            {"id": f"r{i}", "domain_id": f"d{i}", "skill_name": "risk",
             "skill_name_cf": "risk", "category": "c"}
            for i in range(5)
        ]
        out = cr._rank_skill_matches(index, "risk", limit=1)
        assert len(out) == 1
        assert out[0]["other_domain_count"] == 4, "one of five shown means four withheld"

    def test_other_domain_count_is_zero_when_every_domain_is_shown(self):
        index = [
            {"id": "r0", "domain_id": "d0", "skill_name": "risk",
             "skill_name_cf": "risk", "category": "c"},
            {"id": "r1", "domain_id": "d1", "skill_name": "risk",
             "skill_name_cf": "risk", "category": "c"},
        ]
        out = cr._rank_skill_matches(index, "risk", limit=20)
        assert [row["other_domain_count"] for row in out] == [0, 0]

    def test_the_per_name_domain_cap_picks_the_same_domains_every_time(self):
        index = [
            {"id": f"r{i}", "domain_id": f"d{i}", "skill_name": "risk",
             "skill_name_cf": "risk", "category": "c"}
            for i in range(9, -1, -1)
        ]
        out = cr._rank_skill_matches(index, "risk", limit=20)
        assert [row["domain_id"] for row in out] == ["d0", "d1"]

    def test_ranking_does_not_materialise_a_row_per_match(self):
        """The scan must stay bounded by DISTINCT NAMES, not by matches.

        The previous ranking built a tuple for every match and sorted the lot
        before cutting to 20 -- 161-505 ms of event-loop time for `e` on a
        route with no auth and no rate limiter. Peak allocation is the
        deterministic way to see it: one tuple per match is megabytes, the
        capped per-name structure is kilobytes. A wall-clock assertion would
        say the same thing and flake on a loaded box.
        """
        index = [
            {"id": f"r{i}", "domain_id": f"d{i:06d}",
             "skill_name": f"risk analysis {i % 50}",
             "skill_name_cf": f"risk analysis {i % 50}", "category": "c"}
            for i in range(120000)
        ]
        tracemalloc.start()
        try:
            before = tracemalloc.get_traced_memory()[0]
            out = cr._rank_skill_matches(index, "risk", limit=20)
            peak = tracemalloc.get_traced_memory()[1]
        finally:
            tracemalloc.stop()
        assert len(out) == 20
        growth = peak - before
        assert growth < 1_000_000, (
            f"ranking 120k matches allocated {growth / 1e6:.1f} MB; it must retain at "
            f"most {cr._MAX_DOMAINS_PER_SKILL} rows per distinct name"
        )

    def test_an_exact_name_reaches_the_endpoint_response(self):
        domains = [{
            "id": "d1", "domain_key": "D001", "name": "Finance", "cluster": "Business",
            "foundation_skills": [{"skill": row["skill_name"]} for row in self.INDEX],
        }]
        skills = _search("financial", svc=_svc_with(domains=domains, subgroups=[], roles=[]))
        names = [s["name"] for s in skills["data"]["skills"]]
        assert names[0] == "financial"
        assert "financial statements" in names


class TestPartialBuildsAreNotCachedAsAuthoritative:
    """`.execute().data or []` makes a failure look like a successful empty.

    An RLS change or a mid-reseed truncate returns no rows without raising, so
    the endpoint answered `status: "real"` with `skills: []` -- indistinguishable
    from a genuine no-match -- for the whole 900s TTL. A SHORT read is the same
    class: every layer non-empty but truncated used to give `partial=False`.
    """

    def test_an_empty_role_layer_is_logged_and_cached_only_briefly(self):
        with captured_logs("WARNING") as records:
            cr._build_skill_index(_svc_with(roles=[]))
        assert cr._skill_index_cache is not None
        assert cr._skill_index_cache[2] is True, "the build is flagged partial"
        assert any("empty or short layer" in r["message"] for r in records)
        assert cr._SKILL_INDEX_EMPTY_TTL_SECONDS < cr._SKILL_INDEX_TTL_SECONDS

    def test_an_empty_domain_layer_alone_flags_the_build_partial(self):
        # The gate used to be exercised only through `roles=[]`, so the
        # mutation `partial = not roles` survived: an RLS change that hides
        # `domains` is the same silent-empty failure.
        cr._build_skill_index(_svc_with(domains=[]))
        assert cr._skill_index_cache[2] is True

    def test_an_empty_subgroup_layer_alone_flags_the_build_partial(self):
        cr._build_skill_index(_svc_with(subgroups=[]))
        assert cr._skill_index_cache[2] is True

    def test_a_short_layer_flags_the_build_partial_even_though_nothing_is_empty(self):
        # A reseed landing mid-pagination: every layer answers, none is empty,
        # and every one of them is short. `partial` was computed only from
        # emptiness, so this was 900 s of a confidently wrong index.
        tables = {"domain_roles": _Table(ROLES, count_override=5093)}
        with captured_logs("WARNING") as records:
            cr._build_skill_index(_svc_with(tables=tables))
        assert cr._skill_index_cache[2] is True, "a short read is not authoritative"
        assert any("empty or short layer" in r["message"] for r in records)

    def test_a_bound_truncated_layer_flags_the_build_partial(self):
        class Endless(_Table):
            def _window(self, _rows):
                return [{"id": str(i), "domain_id": "d1", "essential_skills": ""}
                        for i in range(self.MAX_ROWS)]

        cr._build_skill_index(_svc_with(tables={"domain_roles": Endless([])}))
        assert cr._skill_index_cache[2] is True, (
            "stopping at the page bound returns truncated rows; caching them as "
            "authoritative for 900 s is the bug"
        )

    def test_the_short_ttl_leaves_room_for_more_than_the_rebuild_itself(self):
        # A measured build is 10.0-16.4 s. "Longer than one build" is not the
        # bar: at the old 30 s the degraded state spent over half its wall time
        # re-reading domain_roles in full, forever. Require the rebuild to be
        # at most a quarter of the cycle.
        slowest_measured_build = 16.4
        assert cr._SKILL_INDEX_EMPTY_TTL_SECONDS >= 4 * slowest_measured_build
        assert cr._SKILL_INDEX_EMPTY_TTL_SECONDS < cr._SKILL_INDEX_TTL_SECONDS

    def test_a_stale_partial_index_is_rebuilt_rather_than_served(self):
        cr._build_skill_index(_svc_with(roles=[]))
        stamp, index, partial = cr._skill_index_cache
        # Age it past the short TTL but well inside the full one.
        cr._skill_index_cache = (
            stamp - (cr._SKILL_INDEX_EMPTY_TTL_SECONDS + 1), index, partial
        )
        builds = []

        def counting_build(svc):
            builds.append(1)
            return cr._skill_index_cache[1] if cr._skill_index_cache else []

        with patch.object(cr, "_build_skill_index", counting_build):
            asyncio.run(cr._skill_index(_svc_with()))
        assert builds, "a stale partial index must be rebuilt, not served"

    def test_a_complete_build_is_not_flagged_partial(self):
        cr._build_skill_index(_svc_with())
        assert cr._skill_index_cache[2] is False


class TestSkillIndexShape:
    """Properties of the built index that other code silently depends on."""

    def test_a_skill_seen_at_two_layers_keeps_its_widest_context(self):
        # `rows.setdefault(...)` -> `rows[key] = ...` survived every test: a
        # domain foundation skill is a better search answer than the same
        # string repeated on forty roles, and the LAST writer would win.
        domains = [dict(DOMAINS[0], foundation_skills=["testing"])]
        roles = [dict(ROLES[0], essential_skills="testing", optional_skills=[])]
        cr._build_skill_index(_svc_with(domains=domains, subgroups=[], roles=roles))
        index = cr._skill_index_cache[1]
        assert [row["category"] for row in index] == ["Foundation skill"], (
            "the widest layer must win, not the last one written"
        )

    def test_the_index_is_stamped_after_the_read_not_before_it(self):
        """`time.monotonic()` taken at the top charged the build against its own TTL.

        A full build MEASURES 8.0-16.4 s, so every index was born that stale --
        up to 13% of the 120 s partial TTL gone before the first request could
        be served from it.
        """
        def slow_fetch(_svc, _table, _columns, _order):
            time.sleep(0.05)
            return [], False

        started = cr.time.monotonic()
        with patch.object(cr, "_fetch_all_rows", slow_fetch):
            cr._build_skill_index(_svc_with())
        stamped = cr._skill_index_cache[0]
        assert stamped - started >= 0.12, (
            "the cache timestamp must be taken AFTER the read, not before it"
        )

    def test_the_index_is_sorted_by_name_then_domain(self):
        # The per-name domain cap picks the FIRST `_MAX_DOMAINS_PER_SKILL`
        # domains it meets, so an unsorted index makes the response depend on
        # dict order. Dropping the `sorted(...)` changed no test result.
        domains = [
            {"id": f"d{i}", "domain_key": f"D00{i}", "name": f"Domain {i}",
             "cluster": "ICT", "excluded": False,
             "foundation_skills": ["zebra husbandry", "alpha modelling"]}
            for i in (3, 1, 2)
        ]
        cr._build_skill_index(_svc_with(domains=domains, subgroups=[], roles=[]))
        index = cr._skill_index_cache[1]
        assert [(row["skill_name_cf"], row["domain_id"]) for row in index] == sorted(
            (row["skill_name_cf"], row["domain_id"]) for row in index
        )
        assert [row["domain_id"] for row in index][:3] == ["d1", "d2", "d3"]


class TestSkillIndexFreshnessAndStaleServing:
    """The cache must not turn one cold build into a stall for everybody.

    A full build MEASURED 10.0-16.4 s and a cold `/search` 41.6 s end to end.
    Rebuilding under the lock collapsed the herd correctly and then converted
    it into one shared 10-16 s stall every 900 s, while a perfectly serviceable
    expired index sat in memory unused.
    """

    INDEX = [{"id": "x", "domain_id": "d1", "skill_name": "programming",
              "skill_name_cf": "programming", "category": "Foundation skill"}]

    def _cache(self, age, partial=False, index=None):
        cr._skill_index_cache = (cr.time.monotonic() - age, index or self.INDEX, partial)

    def test_a_fresh_complete_index_is_served_without_rebuilding(self):
        self._cache(age=0)
        builds = []
        scheduled = []

        async def go():
            with patch.object(cr, "_build_skill_index", lambda svc: builds.append(1) or []):
                out = await cr._skill_index(_svc_with())
            scheduled.append(cr._loop_state().get("refresh"))
            return out

        out = asyncio.run(go())
        assert out is self.INDEX
        assert builds == [], "a fresh index inside its TTL must be served as-is"
        assert scheduled == [None]

    def test_a_complete_index_aged_past_the_short_ttl_is_still_fresh(self):
        # The short TTL belongs to PARTIAL builds only. Applying it to a
        # complete one would rebuild the whole index every two minutes.
        self._cache(age=cr._SKILL_INDEX_EMPTY_TTL_SECONDS + 1)
        builds = []
        with patch.object(cr, "_build_skill_index", lambda svc: builds.append(1) or []):
            out = asyncio.run(cr._skill_index(_svc_with()))
        assert out is self.INDEX
        assert builds == []

    def test_a_stale_complete_index_is_served_now_and_refreshed_behind(self):
        rebuilt = [{"id": "y", "domain_id": "d1", "skill_name": "refreshed",
                    "skill_name_cf": "refreshed", "category": "Foundation skill"}]
        builds = []

        def slow_build(svc):
            builds.append(1)
            cr._skill_index_cache = (cr.time.monotonic(), rebuilt, False)
            return rebuilt

        async def go():
            self._cache(age=cr._SKILL_INDEX_TTL_SECONDS + 1)
            with patch.object(cr, "_build_skill_index", slow_build):
                served = await cr._skill_index(_svc_with())
                # The request is answered from the expired index immediately;
                # blocking it on the rebuild is the 41.6 s cold `/search`.
                assert served is self.INDEX
                assert builds == [], "the caller must not wait for the rebuild"
                task = cr._loop_state()["refresh"]
                assert task is not None, "the refresh must actually be scheduled"
                await task
            assert builds == [1]
            assert cr._skill_index_cache[1] is rebuilt

        asyncio.run(go())

    def test_a_failed_rebuild_serves_the_expired_index_rather_than_nothing(self):
        self._cache(age=cr._SKILL_INDEX_EMPTY_TTL_SECONDS + 1, partial=True)

        def boom(svc):
            raise RuntimeError("database unreachable")

        with patch.object(cr, "_build_skill_index", boom):
            out = asyncio.run(cr._skill_index(_svc_with()))
        assert out is self.INDEX, "stale beats `skills: []`, which reads as a genuine no-match"

    def test_a_failed_cold_build_still_raises(self):
        cr._reset_skill_index_cache()

        def boom(svc):
            raise RuntimeError("database unreachable")

        async def go():
            with patch.object(cr, "_build_skill_index", boom):
                await cr._skill_index(_svc_with())

        with pytest.raises(RuntimeError):
            asyncio.run(go())


class TestSkillIndexDoesNotBlockTheEventLoop:
    """`search_career` is async and the supabase client is not.

    A cold rebuild MEASURED 10.0-16.4 s of synchronous client work -- on a
    typeahead endpoint that freezes every other request on the worker.
    """

    def test_the_build_runs_off_the_event_loop(self):
        threads = []

        def record_thread(svc):
            threads.append(threading.current_thread().name)
            return []

        async def go():
            with patch.object(cr, "_build_skill_index", record_thread):
                await cr._skill_index(_svc_with())

        asyncio.run(go())
        assert threads and threads[0] != threading.main_thread().name

    def test_the_ranking_runs_off_the_event_loop(self):
        """Ranking scans every one of ~44,895 rows.

        Removing the early truncation made the scan correct and moved
        22-612 ms of synchronous work per request onto the loop, on a route
        with no auth and no rate limiter.
        """
        threads = []
        real_rank = cr._rank_skill_matches

        def record_thread(index, term, limit):
            threads.append(threading.current_thread().name)
            return real_rank(index, term, limit)

        async def go():
            with patch.object(cr, "_rank_skill_matches", record_thread):
                await cr._search_skill_layers(_svc_with(), "programming", 20)

        asyncio.run(go())
        assert threads and threads[0] != threading.main_thread().name

    @staticmethod
    def _slow_build(builds, hold):
        """A build that is genuinely SLOW, which is what makes the gate testable.

        The previous mock set the cache and returned SYNCHRONOUSLY, so the
        unlocked re-check inside the guard always won the race and deleting the
        gate entirely still passed 6/6 full-suite runs. A build that stays open
        while the other waiters arrive leaves the gate as the only thing that
        can collapse them.
        """
        def build(_svc):
            builds.append(1)
            time.sleep(hold)
            index = [{"id": "x", "domain_id": "d1", "skill_name": "programming",
                      "skill_name_cf": "programming", "category": "Foundation skill"}]
            cr._skill_index_cache = (cr.time.monotonic(), index, False)
            return index

        return build

    def test_concurrent_cold_requests_build_the_index_once(self):
        builds = []

        async def go():
            with patch.object(cr, "_build_skill_index", self._slow_build(builds, 0.15)):
                await asyncio.gather(*[cr._skill_index(_svc_with()) for _ in range(5)])

        cr._reset_skill_index_cache()
        asyncio.run(go())
        assert len(builds) == 1, "the gate must collapse the herd into one build"

    def test_the_build_gate_survives_more_than_one_event_loop(self):
        """A module-global `asyncio.Lock` binds to the first loop that CONTENDS.

        Every loop after that gets `RuntimeError: ... is bound to a different
        event loop`, and in `search_career` that RuntimeError is swallowed by
        `except Exception` and becomes `skills: []` -- the silent-empty bug
        again. Uncontended acquires skip the binding on 3.12+, which is why a
        single contended test was not enough to catch it: the contention has to
        happen on more than one loop.
        """
        def one_loop():
            cr._reset_skill_index_cache()
            builds = []

            async def go():
                with patch.object(cr, "_build_skill_index", self._slow_build(builds, 0.15)):
                    await asyncio.gather(*[cr._skill_index(_svc_with()) for _ in range(5)])

            asyncio.run(go())
            return builds

        for attempt in range(3):
            assert len(one_loop()) == 1, f"loop {attempt} did not collapse the herd"

    def test_waiting_for_the_build_never_holds_a_shared_threadpool_thread(self):
        """The gate is held on the LOOP, not inside the threadpool.

        AnyIO's default limiter is 40 tokens shared by the WHOLE application --
        every sync route and every sync dependency. A `threading.Lock` taken
        INSIDE `run_in_threadpool` makes each waiter take a token and then
        block on the lock for the entire 8-16 s build: MEASURED, 45 concurrent
        cold calls made an unrelated `run_in_threadpool` wait 2.80 s. The
        default limiter is shrunk here so the same starvation is reproducible
        without 45 threads.
        """
        builds = []
        hold = 0.6

        async def go():
            limiter = anyio.to_thread.current_default_thread_limiter()
            original = limiter.total_tokens
            limiter.total_tokens = 3
            try:
                with patch.object(cr, "_build_skill_index", self._slow_build(builds, hold)):
                    waiters = [
                        asyncio.create_task(cr._skill_index(_svc_with())) for _ in range(8)
                    ]
                    await asyncio.sleep(0.05)
                    started = time.monotonic()
                    # Unrelated application work, on the shared threadpool.
                    await run_in_threadpool(lambda: None)
                    waited = time.monotonic() - started
                    await asyncio.gather(*waiters)
                return waited
            finally:
                limiter.total_tokens = original

        cr._reset_skill_index_cache()
        waited = asyncio.run(go())
        assert len(builds) == 1
        assert waited < hold / 3, (
            f"an unrelated threadpool call waited {waited:.2f}s behind the skill "
            f"index build; waiters must park on the event loop, not on a thread"
        )

    def test_the_skill_layer_has_its_own_bounded_thread_limiter(self):
        # It must never be able to consume the app-wide 40.
        async def go():
            _lock, build_limiter, rank_limiter = cr._skill_loop_gate()
            default = anyio.to_thread.current_default_thread_limiter()
            assert build_limiter is not default and rank_limiter is not default
            assert build_limiter.total_tokens == cr._SKILL_BUILD_THREADS
            assert rank_limiter.total_tokens == cr._SKILL_RANK_THREADS
            assert cr._SKILL_BUILD_THREADS + cr._SKILL_RANK_THREADS < default.total_tokens

        asyncio.run(go())

    def test_the_gate_is_per_loop_and_is_not_a_process_wide_thread_lock(self):
        seen = []

        async def go():
            lock, _b, _r = cr._skill_loop_gate()
            assert isinstance(lock, asyncio.Lock)
            seen.append(lock)

        asyncio.run(go())
        asyncio.run(go())
        assert seen[0] is not seen[1], "each loop needs its own gate"


class TestSkillSearchIsNotAnUnauthenticatedScan:
    """The skill layer is an in-process scan on a public, unthrottled route.

    The protection is NOT a higher character floor. A floor of three deleted
    `R` and `C#` (the only sub-three-character skill names) from the product
    entirely and returned nothing for `ai` (16 names), `go` (6), `bi` (16),
    `3d` (10), `ux`, `ml` and `js` -- silently, because `_MIN_PUBLIC_QUERY_LEN`
    is two, so the response was a populated payload with `skills: []` and no
    notice, indistinguishable from a real no-match. What bounds the scan
    instead is `_SKILL_PREFIX_ONLY_BELOW`: a short needle keeps prefix matches
    only, which bounds both the work and the result set.
    """

    SHORT = [{
        "id": "d1", "domain_key": "D001", "name": "Data", "cluster": "ICT",
        "excluded": False,
        "foundation_skills": [
            "AI ethics",           # prefix match for `ai`
            "C#",                  # a two-character NAME
            "explainable ai",      # substring-only match for `ai`
        ],
    }]

    def test_the_skill_floor_is_the_same_as_the_rest_of_search(self):
        assert cr._MIN_SKILL_QUERY_LEN == cr._MIN_PUBLIC_QUERY_LEN

    def test_a_two_character_prefix_query_still_finds_skills(self):
        skills = _search("ai", svc=_svc_with(domains=self.SHORT, subgroups=[], roles=[]))
        names = [row["name"] for row in skills["data"]["skills"]]
        assert "AI ethics" in names, "a real two-character prefix must not be deleted"

    def test_a_short_needle_keeps_prefix_matches_only(self):
        # The pathological case is the SUBSTRING scan (`e` matched 20k+ rows).
        # Prefix-only keeps the result set bounded without hiding a name a user
        # could plausibly be typing towards.
        skills = _search("ai", svc=_svc_with(domains=self.SHORT, subgroups=[], roles=[]))
        names = [row["name"] for row in skills["data"]["skills"]]
        assert "explainable ai" not in names

    def test_a_long_needle_still_matches_a_substring(self):
        skills = _search("explain", svc=_svc_with(domains=self.SHORT, subgroups=[], roles=[]))
        assert [row["name"] for row in skills["data"]["skills"]] == ["explainable ai"]

    def test_a_two_character_skill_name_is_reachable_again(self):
        skills = _search("c#", svc=_svc_with(domains=self.SHORT, subgroups=[], roles=[]))
        assert [row["name"] for row in skills["data"]["skills"]] == ["C#"]

    def test_the_natural_language_split_cannot_smuggle_a_one_letter_stem(self):
        # `_search_terms` splits on ` at|in|for|near `, so `e in zz` passes the
        # two-character public guard with the one-letter subject `e`.
        subject, _institution = cr._search_terms("e in zz")
        assert subject == "e"
        scans = []

        async def go():
            with patch.object(cr, "_skill_index", lambda svc: scans.append(1)):
                return await cr._search_skill_layers(_svc_with(), "e", 20)

        # `(rows, index_is_partial)`: the partial flag travels back so the
        # route can tell "the index is known incomplete" from "no match".
        assert asyncio.run(go()) == ([], False)
        assert scans == [], "the index must not even be consulted"

    def test_a_refused_skill_layer_says_so_instead_of_returning_a_bare_empty(self):
        # An empty group with no notice is indistinguishable from a genuine
        # no-match, which is what made the old floor invisible.
        data = _search("e in zz")["data"]
        assert data["skills"] == []
        # Truthiness alone let the copy be replaced with "Something went wrong."
        # -- which is exactly the ambiguity the notice exists to remove. Pin the
        # part that tells the user what actually happened.
        assert "at least two characters" in data["skillsNotice"]

    def test_a_normal_query_carries_no_notice(self):
        assert _search("programming")["data"]["skillsNotice"] is None

    def test_a_long_enough_subject_still_searches(self):
        assert _search("programming")["data"]["skills"], "the guard must not break real queries"


class TestSkillNamesAreFoldedAtBuildTime:
    def test_every_index_row_carries_a_precomputed_casefold(self):
        # Folding ~44,895 names per request is the difference between 22 ms and
        # 612 ms of event-loop time on an unauthenticated route.
        cr._build_skill_index(_svc_with())
        index = cr._skill_index_cache[1]
        assert index
        assert all(row["skill_name_cf"] == row["skill_name"].casefold() for row in index)

    def test_ranking_never_folds_a_name_it_was_given_folded(self):
        """Assert on the KEY THE SCAN ACTUALLY READS, not on an instrumented type.

        The previous probe subclassed `str` and overrode `casefold`, but the
        scan's fallback is `str(row.get("skill_name")).casefold()` and
        `str(subclass_instance)` returns a PLAIN `str` -- so the override was
        never reached and re-introducing the per-request refold passed. The
        only reliable probe is data: `skill_name` and `skill_name_cf` are given
        DIFFERENT values, so which one the scan read is visible in the answer.
        """
        index = [
            # `skill_name` says "banking", the precomputed fold says "risk".
            # Nothing here matches `risk` unless the precomputed fold is used.
            {"id": f"r{i}", "domain_id": f"d{i}", "skill_name": f"BANKING {i}",
             "skill_name_cf": f"risk analysis {i}", "category": "c"}
            for i in range(50)
        ]
        out = cr._rank_skill_matches(index, "risk", limit=5)
        assert len(out) == 5, "the scan must read `skill_name_cf`, not refold `skill_name`"

    def test_a_refold_of_the_raw_name_would_change_the_answer(self):
        # The other half of the same statement: a row whose raw name matches
        # but whose precomputed fold does not must NOT be returned.
        index = [{"id": "r0", "domain_id": "d0", "skill_name": "RISK analysis",
                  "skill_name_cf": "banking", "category": "c"}]
        assert cr._rank_skill_matches(index, "risk", limit=5) == []


class TestExcludedDomainsStayExcluded:
    """`excluded` is the publication switch that keeps D086 (gambling) hidden.

    ONE policy, applied everywhere: `excluded` HIDES THE CONTENT of a domain,
    it does not merely un-name it. Emitting a sub-group, tool, certification,
    role or role family with `domainId/domainName: null` leaves the LABEL --
    "Sports betting odds modelling" -- which is the leak the switch exists to
    prevent. A row whose domain merely failed to RESOLVE is a different case
    and is still emitted with a null domain.
    """

    EXCLUDED = [dict(DOMAINS[0], excluded=True)]

    def test_an_excluded_domains_foundation_skills_are_not_indexed(self):
        cr._build_skill_index(_svc_with(domains=self.EXCLUDED, subgroups=[], roles=[]))
        assert cr._skill_index_cache[1] == []

    def test_an_excluded_domains_subgroup_and_role_skills_are_not_indexed_either(self):
        # Dropping the domain is not enough if the other two layers still carry
        # its rows: they key on `domain_id`, not on the domain row.
        cr._build_skill_index(_svc_with(domains=self.EXCLUDED))
        assert cr._skill_index_cache[1] == []

    def test_an_excluded_domain_produces_no_skill_results(self):
        data = _search("programming", svc=_svc_with(domains=self.EXCLUDED))["data"]
        assert data["skills"] == []

    def test_an_excluded_domain_is_not_named_by_the_domains_group(self):
        # The PostgREST-side group. With a stubbed `.ilike()` this assertion
        # was vacuous, which is how `if not d.get("excluded")` survived being
        # deleted.
        data = _search("software", svc=_svc_with(domains=self.EXCLUDED))["data"]
        assert data["domains"] == []

    def test_an_excluded_domains_subgroup_is_dropped_not_merely_unnamed(self):
        # The label is the leak: "Sports betting odds modelling" identifies the
        # hidden domain perfectly well with `domainName: null`.
        data = _search("developers", svc=_svc_with(domains=self.EXCLUDED))["data"]
        assert data["subgroups"] == []

    def test_an_excluded_domains_tools_and_certifications_are_dropped_too(self):
        tables = {
            "domain_tools": _Table([
                {"id": "t1", "domain_id": "d1", "tool_name": "developers toolkit",
                 "tool_group": "core"},
            ]),
            "domain_certifications": _Table([
                {"id": "c1", "domain_id": "d1", "name": "developers certificate",
                 "level": "pro", "region": "NG"},
            ]),
        }
        data = _search(
            "developers", svc=_svc_with(domains=self.EXCLUDED, tables=tables)
        )["data"]
        assert data["tools"] == []
        assert data["certifications"] == []

    def test_a_role_whose_only_domain_is_excluded_is_not_emitted(self):
        # It used to survive as `{name, tier, domains: []}` -- named,
        # unroutable, and sourced entirely from the hidden domain.
        data = _search("backend", svc=_svc_with(domains=self.EXCLUDED))["data"]
        assert data["roles"] == []

    def test_a_role_family_cannot_name_an_excluded_domain(self):
        # The fifth door: `career_role_families` and
        # `career_role_family_domains` carry `domain_key` strings of their own,
        # so nothing checked upstream applied to them.
        tables = {
            "career_role_families": _Table([
                {"id": "f1", "family_key": "f1", "canonical_name": "betting analyst",
                 "primary_domain_key": "D001", "aliases": []},
                {"id": "f2", "family_key": "f2", "canonical_name": "betting engineer",
                 "primary_domain_key": "D999", "aliases": []},
            ]),
            "career_role_family_aliases": _Table([]),
            "career_role_family_domains": _Table([
                {"family_id": "f2", "domain_key": "D001", "relationship": "adjacent"},
                {"family_id": "f2", "domain_key": "D999", "relationship": "primary"},
            ]),
        }
        domains = [
            dict(DOMAINS[0], excluded=True),
            {"id": "d9", "domain_key": "D999", "name": "Other", "cluster": "ICT",
             "excluded": False, "foundation_skills": []},
        ]
        data = _search("betting", svc=_svc_with(domains=domains, tables=tables))["data"]
        families = data["roleFamilies"]
        # The family whose PRIMARY domain is excluded is gone entirely.
        assert [f["key"] for f in families] == ["f2"]
        # ... and the excluded link is gone from the one that survives.
        assert [link["domainKey"] for link in families[0]["domains"]] == ["D999"]

    def test_a_row_whose_domain_merely_failed_to_resolve_is_still_emitted(self):
        # "Excluded" and "unresolved" are different. Dropping on `domainId is
        # None` instead of on the excluded set would empty every secondary
        # group whenever the row pointed at a domain this response never read.
        #
        # This is the half that must KEEP emitting: the context query SUCCEEDED
        # and simply had nothing to say about `dX`. The other half -- the query
        # ERRORED, so the excluded set is unknown -- is pinned in
        # TestAnUnreadableDomainContextFailsClosed below, and the two must not
        # be collapsed back into one branch.
        orphan = [dict(SUBGROUPS[0], domain_id="dX")]
        data = _search("developers", svc=_svc_with(subgroups=orphan))["data"]
        assert [g["name"] for g in data["subgroups"]] == ["Application developers"]
        assert data["subgroups"][0]["domainName"] is None


class TestErrorLogsDoNotCarryTheRawMessage:
    """PostgREST messages name the schema and tables; an HTTPStatusError's
    string carries the request URL -- Supabase project ref plus the user's raw
    search string. Escalating these to warning/error moved them out of a
    debug-only sink into stdout/journald and error.log (30-day retention).

    Every assertion here checks the record MESSAGE as well as `extra`.
    `logger.py`'s `Logger.error(self, message, error=None, **kwargs)` treats
    `error` as a NAMED parameter and emits `logger.error("{} | {}", message,
    error)`: the raw text lands in the formatted MESSAGE and never reaches
    `extra` at all. An `extra`-only assertion was therefore blind to the exact
    leak it was written to prevent -- adding `error=str(exc)` back to either
    `log.error` site passed the whole suite while writing the project ref and
    the user's raw search string to error.log.
    """

    @staticmethod
    def _leak_blob(records):
        """Everything a record can carry the raw string in."""
        return "".join(f"{r['message']}|{r['extra']}" for r in records)

    def _boom(self):
        return Exception(
            "{'code': 'PGRST205', 'message': \"Could not find the table "
            "'skillup_dev.domain_tools' in the schema cache\", 'hint': "
            "'perhaps you meant skillup_dev.tools'} while requesting "
            "https://abcdefghijklmnop.supabase.co/rest/v1/domain_tools?q=my+secret+search"
        )

    def test_the_error_log_carries_a_code_not_the_message(self):
        svc = _svc_with(failing={"domain_tools": self._boom()})
        with captured_logs("WARNING") as records:
            _search("programming", svc=svc)
        escalated = [r for r in records if "relation that does not exist" in r["message"]]
        assert escalated, "a dropped relation must still be reported"
        for record in escalated:
            assert record["extra"].get("error_code") == "PGRST205"
            assert record["extra"].get("error_type") == "Exception"
            assert "error" not in record["extra"], "the raw message must not be logged here"
            # `Logger.error(message, error=...)` formats the raw text INTO the
            # message, so `extra` alone cannot see the leak.
            assert "supabase.co" not in record["message"]
        blob = self._leak_blob(records)
        assert "supabase.co" not in blob
        assert "secret" not in blob
        assert "perhaps you meant" not in blob

    def test_an_ordinary_group_failure_is_classified_too(self):
        # A statement timeout or a 42501 RLS denial takes the other branch, and
        # its PostgREST message names the schema and tables just the same.
        boom = Exception(
            "{'code': '42501', 'message': 'permission denied for table "
            "skillup_dev.domain_tools'} while requesting "
            "https://abcdefghijklmnop.supabase.co/rest/v1/domain_tools?q=my+secret+search"
        )
        svc = _svc_with(failing={"domain_tools": boom})
        with captured_logs("WARNING") as records:
            _search("programming", svc=svc)
        warned = [r for r in records if "optional career search group unavailable" in r["message"]]
        assert warned
        for record in warned:
            assert record["extra"].get("error_code") == "42501"
            assert record["extra"].get("error_type") == "Exception"
            assert "error" not in record["extra"], "the raw message must not be logged here"
            assert "supabase.co" not in record["message"]
        blob = self._leak_blob(records)
        assert "supabase.co" not in blob
        assert "secret" not in blob
        assert "permission denied" not in blob

    def test_the_raw_message_is_still_available_at_debug(self):
        svc = _svc_with(failing={"domain_tools": self._boom()})
        with captured_logs("DEBUG") as records:
            _search("programming", svc=svc)
        detail = [r for r in records if r["message"] == "career search group failure detail"]
        assert detail, "the raw text must remain reachable for debugging"
        assert detail[0]["level"].name == "DEBUG"
        assert "supabase.co" in str(detail[0]["extra"]["error"])

    def test_the_skill_layer_failure_log_is_classified_too(self):
        def boom(_svc):
            raise TimeoutError("statement timeout on https://abcdefghijklmnop.supabase.co/rest/v1/domains")

        with patch.object(cr, "_build_skill_index", boom), captured_logs("WARNING") as records:
            _search("programming")
        skill_logs = [r for r in records if "skill layer search unavailable" in r["message"]]
        assert skill_logs
        assert skill_logs[0]["extra"].get("error_type") == "TimeoutError"
        assert "supabase.co" not in self._leak_blob(records)

    def test_the_top_level_search_failure_log_carries_no_raw_text_either(self):
        # The second `log.error` site. `career search failed` is reached by any
        # unhandled failure, including one whose string is the request URL.
        boom = Exception(
            "server error while requesting "
            "https://abcdefghijklmnop.supabase.co/rest/v1/domains?q=my+secret+search"
        )
        svc = _svc_with(tables={"domains": _Table(DOMAINS, failing=boom)})
        with captured_logs("WARNING") as records:
            envelope = _search("software", svc=svc)
        assert envelope["status"] == "coming_soon"
        failed = [r for r in records if r["message"].startswith("career search failed")]
        assert failed
        assert "supabase.co" not in self._leak_blob(records)
        assert "secret" not in self._leak_blob(records)

    def test_a_five_character_query_token_is_not_lifted_into_the_error_code(self):
        # `?q=12345` has exactly the SQLSTATE shape, and a failed request's URL
        # carries the query string -- so a bare five-character run would put
        # the user's own search term in the log line as `error_code`.
        exc = Exception(
            "server error while requesting "
            "https://abcdefghijklmnop.supabase.co/rest/v1/domains?q=12345"
        )
        assert cr._error_summary(exc) == ("unclassified", "Exception")

    def test_an_exception_code_attribute_is_shape_checked_too(self):
        # `exc.code` is whatever the raising library put there.
        exc = TimeoutError("boom")
        exc.code = "my secret search"
        assert cr._error_summary(exc) == ("unclassified", "TimeoutError")

    def test_a_code_is_classified_from_an_exception_attribute_when_present(self):
        exc = TimeoutError("boom")
        exc.code = "57014"
        assert cr._error_summary(exc) == ("57014", "TimeoutError")

    def test_an_unclassifiable_failure_does_not_smuggle_the_message_through(self):
        code, kind = cr._error_summary(RuntimeError("could not reach my+secret+search"))
        assert code == "unclassified"
        assert kind == "RuntimeError"


class TestMissingRelationEscalation:
    """The mechanism that is meant to catch the NEXT silent regression.

    A dropped table used to be swallowed at `debug` by `safe_query`, which is
    how the skills group returned [] for every query for a whole release. It is
    now logged at `error` -- and that escalation itself needs a test, or
    disabling it changes no test result at all.
    """

    def test_a_pgrst205_from_a_group_is_logged_at_error_and_degrades(self):
        exc = Exception(
            "{'code': 'PGRST205', 'message': \"Could not find the table "
            "'skillup_dev.domain_tools' in the schema cache\"}"
        )
        svc = _svc_with(failing={"domain_tools": exc})
        with captured_logs("ERROR") as records:
            data = _search("software", svc=svc)["data"]
        # Degrades rather than 500-ing: the group is empty, the rest answers.
        assert data["tools"] == []
        assert [d["id"] for d in data["domains"]] == ["D001"]
        assert any(
            r["level"].name == "ERROR" and "relation that does not exist" in r["message"]
            for r in records
        ), "a dropped relation must be logged at error, not debug"

    def test_a_42p01_from_a_group_is_logged_at_error(self):
        svc = _svc_with(failing={"domain_tools": Exception('42P01: relation "domain_tools" does not exist')})
        with captured_logs("ERROR") as records:
            data = _search("software", svc=svc)["data"]
        assert data["tools"] == []
        assert any("relation that does not exist" in r["message"] for r in records)

    def test_an_ordinary_group_failure_is_a_warning_not_an_error(self):
        # Statement timeouts, 42501 RLS denials and PostgREST 5xx are the same
        # silent-empty class and must be visible at the default log level, but
        # they are not a schema regression and must not be reported as one.
        svc = _svc_with(failing={"domain_tools": TimeoutError("statement timeout")})
        with captured_logs("DEBUG") as records:
            data = _search("programming", svc=svc)["data"]
        assert data["tools"] == []
        levels = {
            r["level"].name
            for r in records
            if "optional career search group unavailable" in r["message"]
        }
        assert levels == {"WARNING"}
        assert not any("relation that does not exist" in r["message"] for r in records)

    def test_an_undefined_column_is_not_reported_as_a_missing_relation(self):
        assert cr._is_missing_relation(Exception('42703: column "x" does not exist')) is False

    def test_an_undefined_function_is_not_reported_as_a_missing_relation(self):
        assert cr._is_missing_relation(
            Exception('42883: function skillup_dev.f(text) does not exist')
        ) is False


class _CountingLimiterSpy:
    """Records every `anyio.to_thread.run_sync` call and its `limiter=`.

    `limiter=` being PRESENT at the call site is the whole point of having a
    dedicated limiter: `_rank_skill_matches` is not serialised by any lock, so
    dropping `limiter=rank_limiter` silently puts N concurrent searches onto
    the app-wide 40-token default. The existing limiter test asserted the
    limiters EXIST, are distinct and are bounded -- and every call site could
    still ignore them.
    """

    def __init__(self):
        self.calls: list = []
        self._real = anyio.to_thread.run_sync

    async def __call__(self, func, *args, **kwargs):
        self.calls.append((func, kwargs.get("limiter")))
        return await self._real(func, *args, **kwargs)

    def limiter_for(self, func):
        # Call sites may pass a `functools.partial` when the blocking function
        # takes keyword arguments; the limiter is what is being asserted, so
        # unwrap rather than miss the call entirely.
        return [
            limiter
            for called, limiter in self.calls
            if called is func or getattr(called, "func", None) is func
        ]


class TestEveryOffLoopCallSitePassesItsOwnLimiter:
    def test_the_build_and_rank_call_sites_pass_the_skill_limiters(self):
        spy = _CountingLimiterSpy()

        async def go():
            _lock, build_limiter, rank_limiter = cr._skill_loop_gate()
            cr._reset_skill_index_cache()
            with patch.object(anyio.to_thread, "run_sync", spy):
                await cr._search_skill_layers(_svc_with(), "programming", 20)
            return build_limiter, rank_limiter

        build_limiter, rank_limiter = asyncio.run(go())
        assert spy.limiter_for(cr._rank_skill_matches) == [rank_limiter], (
            "the rank scan must run on the skill layer's own limiter, not the "
            "app-wide default"
        )
        assert spy.limiter_for(cr._build_skill_index) == [build_limiter]

    def test_the_search_round_trips_pass_the_search_limiter(self):
        spy = _CountingLimiterSpy()

        async def go():
            limiter = cr._search_query_limiter()
            with patch.object(cr, "_svc", lambda: _svc_with()), \
                    patch.object(anyio.to_thread, "run_sync", spy):
                await cr.search_career(q="programming")
            return limiter

        limiter = asyncio.run(go())
        assert spy.limiter_for(cr._search_catalogue_blocking) == [limiter]
        assert spy.limiter_for(cr._search_domain_context_blocking) == [limiter]


class TestSearchNeverRunsItsQueriesOnTheEventLoop:
    """`/search` made ~15 sequential blocking PostgREST calls inside `async def`.

    MEASURED against dev with a WARM index: n=1 -> 5.06 s, n=5 -> 25.48 s
    (5.10 s/req), n=10 -> 55.64 s (5.56 s/req). Perfectly linear, i.e. ZERO
    concurrency, with a single event-loop stall of 3.77-5.12 s and loop-stall
    time equal to ~100% of wall clock. No auth, no rate limit, `--workers 2`:
    ~20 concurrent requests stalled both loops and took every other endpoint on
    the box down with them.
    """

    HOLD = 0.02  # per round-trip; ~14 round-trips per request

    def _slow_svc(self):
        hold = self.HOLD

        class _SlowTable(_Table):
            def execute(self):
                time.sleep(hold)
                return super().execute()

        payloads = {"domains": DOMAINS, "domain_subgroups": SUBGROUPS, "domain_roles": ROLES}
        return MagicMock(table=lambda name: _SlowTable(payloads.get(name, [])))

    def test_concurrent_searches_do_not_stall_the_loop_or_the_shared_pool(self):
        concurrent = 6
        svc = self._slow_svc()

        async def probe():
            # Ordinary application work on the SHARED threadpool, which is what
            # every other sync route and dependency draws on.
            await run_in_threadpool(lambda: None)

        async def go():
            default = anyio.to_thread.current_default_thread_limiter()
            original = default.total_tokens
            # Shrink the app-wide limiter so starvation is reproducible without
            # 40 threads. `/search` must not be able to touch these tokens.
            default.total_tokens = 3
            try:
                with patch.object(cr, "_svc", lambda: svc):
                    searches = [
                        asyncio.create_task(cr.search_career(q="programming"))
                        for _ in range(concurrent)
                    ]
                    # Created AFTER the searches, so it is behind all of them in
                    # the loop's ready queue: if a search body runs to
                    # completion without yielding, this cannot start until every
                    # one of them has finished.
                    started = time.monotonic()
                    await asyncio.create_task(probe())
                    waited = time.monotonic() - started
                    responses = await asyncio.gather(*searches)
                return waited, responses
            finally:
                default.total_tokens = original

        cr._reset_skill_index_cache()
        waited, responses = asyncio.run(go())
        cr._reset_skill_index_cache()

        # Still a correct answer, not just a fast one.
        for response in responses:
            assert response.data["status"] == "real"
            assert sorted(s["name"] for s in response.data["data"]["skills"]) == [
                "computer programming", "database programming", "programming languages"
            ]

        serial = concurrent * 10 * self.HOLD
        assert waited < serial / 4, (
            f"unrelated application work waited {waited:.2f}s behind {concurrent} "
            f"/search requests; the blocking round-trips must run in a thread on "
            f"the route's own limiter, not on the event loop"
        )


class TestTheRefreshHandleIsPerLoopToo:
    """Round 5 moved the lock and BOTH limiters into the per-loop dict and left
    the TASK HANDLE in a module global. A task handle is exactly as loop-bound
    as a lock: a refresh scheduled on loop A that never finished (loop A closed
    mid-build) stays `done() == False` forever, so every later `_skill_index()`
    on loop B declines to schedule its own rebuild and serves an arbitrarily
    old index -- with no log line naming the cause.
    """

    INDEX = [{"id": "x", "domain_id": "d1", "skill_name": "programming",
              "skill_name_cf": "programming", "category": "Foundation skill"}]

    def _stale(self):
        cr._skill_index_cache = (
            cr.time.monotonic() - (cr._SKILL_INDEX_TTL_SECONDS + 10_000), self.INDEX, False
        )

    def test_a_refresh_stranded_on_a_closed_loop_does_not_suppress_the_next_one(self):
        stranded = []

        async def never_finishes(svc):
            await asyncio.Event().wait()

        async def loop_a():
            self._stale()
            with patch.object(cr, "_refresh_skill_index", never_finishes):
                await cr._skill_index(_svc_with())
                stranded.append(cr._loop_state()["refresh"])

        # NOT `asyncio.run`: its shutdown cancels every pending task, which
        # makes the stranded handle `done()` and hides the bug. A worker whose
        # loop is torn down mid-build gets no such courtesy -- `run_until_complete`
        # plus `close()` is what that actually looks like.
        loop_one = asyncio.new_event_loop()
        try:
            loop_one.run_until_complete(loop_a())
        finally:
            loop_one.close()
        assert stranded and not stranded[0].done(), (
            "the fixture must actually strand a live-looking handle"
        )

        async def loop_b():
            self._stale()
            scheduled = []

            async def counting_refresh(svc):
                scheduled.append(1)

            with patch.object(cr, "_refresh_skill_index", counting_refresh):
                for _ in range(5):
                    await cr._skill_index(_svc_with())
                    await asyncio.sleep(0)
            return scheduled

        loop_two = asyncio.new_event_loop()
        try:
            scheduled = loop_two.run_until_complete(loop_b())
        finally:
            loop_two.close()
        assert scheduled, (
            "a fresh loop must schedule its own refresh; a handle stranded on a "
            "closed loop is never `done()` and silently suppressed every rebuild"
        )

    def test_a_burst_of_stale_reads_schedules_exactly_one_refresh(self):
        # The SWR test asserts A refresh is scheduled, never that a burst
        # schedules ONE, so `if _skill_refresh_task is None or ....done():`
        # could be replaced by `if True:` with 422/422 still passing. Counting
        # BUILDS cannot see it -- the lock's re-check collapses them anyway --
        # so count the refreshes actually started.
        async def go():
            self._stale()
            scheduled = []

            async def counting_refresh(svc):
                scheduled.append(1)
                cr._skill_index_cache = (cr.time.monotonic(), self.INDEX, False)

            with patch.object(cr, "_refresh_skill_index", counting_refresh):
                await asyncio.gather(*[cr._skill_index(_svc_with()) for _ in range(8)])
                await asyncio.sleep(0.05)
            return scheduled

        assert asyncio.run(go()) == [1]


class TestAnUnreadableDomainContextFailsClosed:
    """`excluded` must not fail OPEN when its own lookup breaks.

    `excluded_domain_ids` for the sub-group / tool / certification groups is
    populated ONLY by the "domain context" read. That read went through a
    helper that swallowed ANY failure into `[]`, so on failure the excluded set
    was EMPTY and every filter passed. Reproduced against dev with a statement
    timeout:

        subgroups:      [{"name": "Sportsbet odds desks",          "domainId": null}]
        tools:          [{"name": "Sportsbet Trading Terminal",    "domainId": null}]
        certifications: [{"name": "Sportsbet Certified Bookmaker", "domainId": null}]

    -- the LABEL leak the switch exists to prevent, reachable by a statement
    timeout, a 42501 RLS denial, a PostgREST 5xx or a flaky network. Only a
    WARNING was logged.

    "Unresolved" (the read succeeded and said nothing about this domain) still
    emits, and is pinned separately by
    `test_a_row_whose_domain_merely_failed_to_resolve_is_still_emitted`.
    """

    HIDDEN = [{
        "id": "d1", "domain_key": "D086", "name": "Gambling and betting",
        "cluster": "Other", "excluded": True, "foundation_skills": [],
    }]

    class _ContextFailingDomains(_Table):
        """Fails only the context lookup: a bare `.in_("id", ...)` with no
        `ilike`. The first `domains` read of the request (the `domains` group)
        must still succeed, or the whole route degrades and proves nothing."""

        def execute(self):
            is_context = any(
                kind == "in" and column == "id" for kind, column, _v in self._filters
            )
            if is_context:
                self._reset()
                raise TimeoutError("canceling statement due to statement timeout")
            return super().execute()

    def _svc(self):
        return _svc_with(
            domains=self.HIDDEN,
            subgroups=[{"id": "s1", "domain_id": "d1", "label": "Sportsbet odds desks",
                        "description": None, "cluster_skills": []}],
            roles=[],
            tables={
                "domains": self._ContextFailingDomains(self.HIDDEN),
                "domain_tools": _Table([
                    {"id": "t1", "domain_id": "d1", "tool_name": "Sportsbet Trading Terminal",
                     "tool_group": "core"},
                ]),
                "domain_certifications": _Table([
                    {"id": "c1", "domain_id": "d1", "name": "Sportsbet Certified Bookmaker",
                     "level": "pro", "region": "NG"},
                ]),
            },
        )

    def test_the_hidden_domains_labels_are_not_published_when_the_context_read_fails(self):
        data = _search("sportsbet", svc=self._svc())["data"]
        assert data["subgroups"] == [], "an unvetted row must not be published"
        assert data["tools"] == []
        assert data["certifications"] == []

    def test_the_failure_is_still_reported_rather_than_swallowed(self):
        with captured_logs("WARNING") as records:
            _search("sportsbet", svc=self._svc())
        assert any(
            r["extra"].get("group") == "domain context"
            and "optional career search group unavailable" in r["message"]
            for r in records
        )

    def test_a_skill_row_from_an_excluded_domain_is_dropped_at_the_route_too(self):
        """Defence in depth, pinned INDEPENDENTLY of the build-time filter.

        `_build_skill_index` already drops excluded domains, so the route's own
        `continue` could be deleted with 422/422 still green. Inject the row
        past the index to pin the second layer on its own.
        """
        async def smuggle(_svc, _term, _limit):
            return [{
                "id": "sk1", "domain_id": "d1", "skill_name": "Sportsbet odds modelling",
                "skill_name_cf": "sportsbet odds modelling",
                "category": "Foundation skill", "other_domain_count": 0,
            }], False

        with patch.object(cr, "_search_skill_layers", smuggle):
            data = _search("sportsbet", svc=_svc_with(domains=self.HIDDEN, subgroups=[], roles=[]))["data"]
        assert data["skills"] == [], (
            "a skill row reaching the route from an excluded domain must be "
            "dropped here too, not only at index build time"
        )


class TestTheSkillsNoticeCoversTheCasesItExistsFor:
    """`skillsNotice` was set ONLY for the short-subject gate.

    A skill-layer EXCEPTION produced `{"skills": [], "skillsNotice": null}` --
    byte-identical to a genuine no-match, which is precisely what the field was
    added to make distinguishable. The covered case (`?q=e in zz`) is exotic;
    the error case is the likely one in production. A KNOWN-PARTIAL index was
    the same: logged, and then reported to the client as an ordinary answer.
    """

    def test_a_failed_skill_layer_is_announced_not_silently_empty(self):
        def boom(_svc):
            raise TimeoutError("canceling statement due to statement timeout")

        with patch.object(cr, "_build_skill_index", boom):
            data = _search("programming")["data"]
        assert data["skills"] == []
        notice = data["skillsNotice"]
        assert notice, "a failed skill layer must not read as a genuine no-match"
        # Substring, not truthiness: the copy has to say WHICH case this is, or
        # "Something went wrong." passes and the field is useless again.
        assert "failed" in notice.lower()
        assert "at least two characters" not in notice

    def test_a_known_partial_index_is_announced_too(self):
        # A count mismatch is how a mid-reseed read is detected: the rows are
        # servable but known incomplete.
        svc = _svc_with(tables={"domains": _Table(DOMAINS, count_override=999)})
        data = _search("programming", svc=svc)["data"]
        assert "incomplete" in (data["skillsNotice"] or "").lower(), (
            "an index known to be missing rows must say so rather than pass its "
            "answer off as complete"
        )

    def test_the_two_notices_are_distinguishable_from_each_other(self):
        gated = _search("e in zz")["data"]["skillsNotice"]

        def boom(_svc):
            raise TimeoutError("statement timeout")

        with patch.object(cr, "_build_skill_index", boom):
            failed = _search("programming")["data"]["skillsNotice"]
        assert gated and failed and gated != failed


class TestSiblingRoutesDoNotLeakTheProjectRefEither:
    """`/search` was the only fixed handler in this module.

    31 sibling sites still wrote `log.error("...", error=str(exc))`, and
    `Logger.error(self, message, error=None)` emits `logger.error("{} | {}",
    message, error)` -- so the raw string lands in the record MESSAGE at ERROR.
    That is error.log (level ERROR, 30-day retention, added UNCONDITIONALLY, so
    the ENVIRONMENT gate on app.log does not help) and stderr/journald.

    `str(httpx.HTTPStatusError)` is, empirically:

        Server error '500 ...' for url 'https://<PROJECT_REF>.supabase.co/rest/
        v1/programmes?select=id&name=ilike.%25<RAW USER TERM>%25'

    Assertions here read `record["message"]`, NOT just `record["extra"]`. An
    extra-only assertion is why an earlier round's leak test passed while
    leaking.
    """

    LEAK = (
        "Server error '500 Internal Server Error' for url "
        "'https://abcdefghijklmnop.supabase.co/rest/v1/programmes"
        "?select=id&name=ilike.%25my+secret+search%25'"
    )

    def _routes(self):
        # Unauthenticated handlers, one per shape of `except` block in the file.
        return {
            "list_programmes": cr.list_programmes(q="my secret search"),
            "get_programme": cr.get_programme("p1"),
            "list_domain_clusters": cr.list_domain_clusters(),
            "get_domain": cr.get_domain("D001"),
            "get_role": cr.get_role("D001|dev"),
            "list_opportunities": cr.list_opportunities(),
            "list_scholarships": cr.list_scholarships(),
            "list_application_windows": cr.list_application_windows(),
            "get_jamb_domains": cr.get_jamb_domains("computer science"),
        }

    def _explode(self, message=None):
        """Fail at the database boundary however the handler reaches it.

        Some handlers go through `_svc()`, others call `db.get_service_client()`
        directly; both doors have to be shut or a route silently proves nothing.
        """
        exc = Exception(message or self.LEAK)
        svc = MagicMock()
        svc.table.side_effect = exc
        exploded_db = MagicMock()
        exploded_db.get_service_client.side_effect = exc
        exploded_db.get_client.side_effect = exc
        return svc, exploded_db

    def test_no_sibling_route_writes_the_raw_exception_into_a_warning_or_error(self):
        svc, exploded_db = self._explode()

        for name, coroutine in self._routes().items():
            with patch.object(cr, "_svc", lambda: svc), \
                    patch.object(cr, "db", exploded_db), \
                    captured_logs("WARNING") as records:
                asyncio.run(coroutine)
            assert records, f"{name} must still report the failure"
            for record in records:
                # The MESSAGE, which is where `Logger.error(message, error=str)`
                # actually puts the raw text -- `extra` never sees it.
                assert "supabase.co" not in record["message"], f"{name} leaked the project ref"
                assert "secret" not in record["message"], f"{name} leaked the user's query"
                assert "supabase.co" not in str(record["extra"]), name
                assert "secret" not in str(record["extra"]), name

    def test_the_raw_text_is_still_reachable_at_debug(self):
        svc, exploded_db = self._explode()
        with patch.object(cr, "_svc", lambda: svc), \
                patch.object(cr, "db", exploded_db), \
                captured_logs("DEBUG") as records:
            asyncio.run(cr.list_programmes(q="my secret search"))
        debug = [r for r in records if r["level"].name == "DEBUG"]
        assert any("supabase.co" in str(r["extra"].get("error", "")) for r in debug), (
            "classifying the error must not make it undebuggable"
        )

    def test_the_classified_summary_is_what_the_record_carries(self):
        svc, exploded_db = self._explode(
            "{'code': '42501', 'message': 'permission denied for table "
            "skillup_dev.programmes'} while requesting " + self.LEAK
        )
        with patch.object(cr, "_svc", lambda: svc), \
                patch.object(cr, "db", exploded_db), \
                captured_logs("ERROR") as records:
            asyncio.run(cr.list_programmes(q="my secret search"))
        assert [r["extra"].get("error_code") for r in records] == ["42501"]
        assert [r["extra"].get("error_type") for r in records] == ["Exception"]


class TestPagerDoesNotPayForACountItNeverReads:
    def test_the_exact_count_is_requested_once_per_table_not_once_per_page(self):
        rows = [
            {"id": f"d{i:05d}", "domain_key": f"D{i:05d}", "name": f"Domain {i}",
             "cluster": "ICT", "excluded": False, "foundation_skills": []}
            for i in range(2500)
        ]
        pinned = _Table(rows)
        cr._build_skill_index(
            _svc_with(domains=rows, subgroups=[], roles=[], tables={"domains": pinned})
        )
        assert len(pinned.requested_ranges) > 1, "the read must actually paginate"
        # `count="exact"` makes PostgREST run a full COUNT(*) per request, and
        # the cross-check only ever reads the FIRST page's count.
        assert len(pinned.count_requests) == 1

    def test_the_count_cross_check_is_still_armed(self):
        # Asking on the first page only must not disarm the mid-reseed guard.
        svc = _svc_with(tables={"domains": _Table(DOMAINS, count_override=999)})
        cr._build_skill_index(svc)
        assert cr._skill_index_cache[2] is True


class TestTheFoldedNameHasExactlyOneSpelling:
    def test_a_row_with_an_empty_precomputed_fold_does_not_raise(self):
        # The scan keyed `per_name` with `row.get("skill_name_cf") or <fallback>`
        # (falsy -> fallback) while the count-back read
        # `row["skill_name_cf"] if "skill_name_cf" in row else ...`
        # (present-but-falsy -> ""), so this row was counted under
        # "risk analysis" and looked up under "" -- `KeyError: ''`.
        index = [{
            "id": "x", "domain_id": "d1", "skill_name": "Risk analysis",
            "skill_name_cf": "", "category": "Foundation skill",
        }]
        out = cr._rank_skill_matches(index, "risk", 20)
        assert [row["skill_name"] for row in out] == ["Risk analysis"]
        assert out[0]["other_domain_count"] == 0

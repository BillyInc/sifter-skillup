"""`/api/career/jamb/{name}/domains`: what a mapping row is allowed to publish.

Three separate defects on one unauthenticated handler, none of which any test
in this repository could see, because the only fixture that reached the join
(`test_public_search_is_not_injectable.test_the_jamb_domain_join_reads_the_
excluded_flag`) asserted on the `select` string and on an empty response.

1. THE FAIL-CLOSED `match_type` GUARD WAS DELETED. `main` had, with a comment
   saying why::

       mt = str(r.get("match_type") or "").strip().lower()
       if mt not in _rank:
           continue

   The first commit on this branch replaced it with
   `mt = r.get("match_type") or "adjacent"` -- no validation, no normalisation
   -- and round 10 then rebuilt the function around that line. Eleven rounds of
   review did not notice; `grep -c "not evidence of an"` was 1 on `main` and 0
   on every revision of the branch.

   PROVED through the real route with the fixture below:

       match_type None      -> published as matchType "adjacent"
       match_type "Direct"  -> published verbatim, breaking the client enum
       "Direct" + "adjacent" on one domain -> DOWNGRADED to "adjacent",
                                              because "Direct" ranks 0

   Latent on dev today (0 NULL `match_type`, every sampled value canonical
   lowercase) -- which is precisely the argument this branch uses to justify
   its own `excluded` filter four lines further down, so it is treated as real
   here too.

2. `_JAMB_DOMAIN_LIMIT` TRUNCATED BEFORE RANKING (introduced by round 10).
   `ids = list(best.keys())[:50]` took the first fifty FIRST-SEEN ids and the
   rank sort ran afterwards, so sixty `adjacent` mappings followed by one
   `direct` mapping returned fifty domains with the `direct` match ABSENT --
   the opposite of what `_JAMB_MATCH_RANK` ("strongest match first, for
   display") is for.

3. `_JAMB_MAPPING_ROW_LIMIT` SLICED AN UNORDERED WINDOW (introduced by round
   10). Neither mapping read had an `.order()`, so which 200 of the matching
   rows arrived was whatever the planner produced. MEASURED on dev, distinct
   domains from all rows vs from the first 200: science 94 -> 57, a 111 -> 49,
   management 62 -> 35, studies 67 -> 37.
"""

from types import SimpleNamespace

import pytest

import routes.career_routes as cr


class _Tables:
    """Answers each `.table(name)` read from a canned row list, and records.

    Chains like the real builder (`get_service_client()`, `schema()`, `table()`
    and every filter return `self`), so the handler under test is the real one.
    """

    def __init__(self, rows: dict, counts: dict | None = None):
        self.rows = rows
        # What the SERVER says it matched, per table. `None` (the default) is
        # "no usable exact count", which `_read_may_be_truncated` treats as an
        # assumed truncation -- see its docstring for why that direction.
        self.counts = counts or {}
        self.table_name = None
        self.calls: list = []

    def __getattr__(self, name):
        def chain(*args, **kwargs):
            if name == "table":
                self.table_name = args[0] if args else None
            self.calls.append((name, self.table_name, args[0] if args else None))
            if name == "select":
                # The `count=` kwarg is the whole point of the truncation
                # check and is invisible in the positional slot above.
                self.calls.append(("select_count", self.table_name, kwargs.get("count")))
            return self

        return chain

    def execute(self):
        self.calls.append(("execute", self.table_name, None))
        return SimpleNamespace(
            data=list(self.rows.get(self.table_name, [])),
            count=self.counts.get(self.table_name),
        )

    def ordered(self, table):
        return [value for name, tbl, value in self.calls if name == "order" and tbl == table]

    def select_counts(self, table):
        return [value for name, tbl, value in self.calls
                if name == "select_count" and tbl == table]

    def limits(self, table):
        return [value for name, tbl, value in self.calls if name == "limit" and tbl == table]


def _domain(did, name=None):
    return {
        "id": did,
        "domain_key": did.upper(),
        "name": name or f"Domain {did}",
        "cluster": "Science",
        "elite_domain": False,
        "excluded": False,
    }


def _drive(mappings, domains, term="computer science", counts=None):
    import asyncio

    tables = _Tables(
        {"jamb_programme_domain": mappings, "domains": domains}, counts=counts
    )
    original = cr.db
    cr.db = tables
    try:
        response = asyncio.run(cr.get_jamb_domains(term))
    finally:
        cr.db = original
    return tables, response.data["data"]["domains"]


class _WarningLog:
    """Stands in for `career_routes.log`, recording only what it was told."""

    def __init__(self):
        self.warnings: list = []

    def warning(self, message, **fields):
        self.warnings.append((message, fields))

    def __getattr__(self, name):
        return lambda *a, **k: None


# ── 1. the fail-closed `match_type` guard ────────────────────────────────────

def test_a_missing_match_type_is_not_published_as_an_adjacent_relationship():
    """`mt = r.get("match_type") or "adjacent"` invents the relationship.

    A NULL mapping type is an unfinished row, not evidence that the domain is
    adjacent to the programme. The public route must drop it.
    """
    _tables, domains = _drive(
        [{"domain_id": "d1", "match_type": None}], [_domain("d1")]
    )
    assert domains == [], domains


@pytest.mark.parametrize("raw", ["sideways", "DIRECTISH", "", "  ", 0, "unknown"])
def test_an_unknown_match_type_is_dropped_rather_than_defaulted(raw):
    _tables, domains = _drive(
        [{"domain_id": "d1", "match_type": raw}], [_domain("d1")]
    )
    assert domains == [], f"{raw!r} was published as {domains}"


@pytest.mark.parametrize(
    "raw,expected",
    [("Direct", "direct"), ("  DIRECT ", "direct"), ("Functional", "functional"),
     ("ADJACENT", "adjacent")],
)
def test_a_non_canonical_spelling_is_normalised_not_passed_through(raw, expected):
    """Without `.strip().lower()`, `"Direct"` reached the client verbatim.

    The response field is a closed enum on the client side, so a capitalised
    value is a client bug, and it also ranks 0 -- see the downgrade test below.
    """
    _tables, domains = _drive(
        [{"domain_id": "d1", "match_type": raw}], [_domain("d1")]
    )
    assert [d["matchType"] for d in domains] == [expected], domains


def test_a_non_canonical_spelling_does_not_downgrade_a_real_match():
    """The compound failure: `"Direct"` ranks 0, so `adjacent` (rank 1) won.

    One domain, two mapping rows. With the guard gone the domain was published
    as `adjacent`; with it, `"Direct"` normalises to `direct` and wins.
    """
    _tables, domains = _drive(
        [
            {"domain_id": "d1", "match_type": "Direct"},
            {"domain_id": "d1", "match_type": "adjacent"},
        ],
        [_domain("d1")],
    )
    assert [d["matchType"] for d in domains] == ["direct"], domains


def test_a_row_set_that_is_entirely_invalid_answers_like_a_miss():
    _tables, domains = _drive(
        [{"domain_id": "d1", "match_type": "nonsense"}], [_domain("d1")]
    )
    assert domains == []


def test_a_canonical_mapping_is_still_published():
    """POSITIVE CONTROL: a fail-closed guard that closes on everything would
    pass every assertion above."""
    tables, domains = _drive(
        [{"domain_id": "d1", "match_type": "direct"}], [_domain("d1", "Computing")]
    )
    assert [(d["domainId"], d["matchType"], d["domainName"]) for d in domains] == [
        ("D1", "direct", "Computing")
    ], domains
    assert tables.calls, "the handler must actually have queried"


# ── 2. rank before truncate ──────────────────────────────────────────────────

def test_the_strongest_match_survives_the_domain_ceiling():
    """`list(best.keys())[:50]` truncated FIRST and ranked afterwards.

    Sixty `adjacent` mappings then one `direct` mapping: the `direct` domain is
    id 61 in first-seen order, so it fell outside the fifty-id slice and never
    reached the join at all.
    """
    mappings = [{"domain_id": f"d{i}", "match_type": "adjacent"} for i in range(60)]
    mappings.append({"domain_id": "winner", "match_type": "direct"})
    domains_rows = [_domain(f"d{i}") for i in range(60)] + [_domain("winner")]

    tables, domains = _drive(mappings, domains_rows)
    assert len(domains) == cr._JAMB_DOMAIN_LIMIT
    assert domains[0]["domainId"] == "WINNER", [d["domainId"] for d in domains[:3]]
    assert "WINNER" in {d["domainId"] for d in domains}


def test_the_published_order_is_strongest_match_first():
    """The rank sort has to be observable, or removing it is a free mutation."""
    mappings = [
        {"domain_id": "adj", "match_type": "adjacent"},
        {"domain_id": "fun", "match_type": "functional"},
        {"domain_id": "dir", "match_type": "direct"},
    ]
    _tables, domains = _drive(
        mappings, [_domain("adj"), _domain("fun"), _domain("dir")]
    )
    assert [d["matchType"] for d in domains] == ["direct", "functional", "adjacent"]


def test_equal_ranks_keep_their_first_seen_order():
    mappings = [{"domain_id": f"d{i}", "match_type": "direct"} for i in range(4)]
    _tables, domains = _drive(mappings, [_domain(f"d{i}") for i in range(4)])
    assert [d["domainId"] for d in domains] == ["D0", "D1", "D2", "D3"]


# ── 3. the mapping window is deterministic and bounded ───────────────────────

def test_both_mapping_reads_order_before_they_slice():
    """An unordered `.limit(n)` is an arbitrary n rows of the match set."""
    tables, _domains = _drive(
        [{"domain_id": "d1", "match_type": "direct"}], [_domain("d1")]
    )
    assert tables.ordered("jamb_programme_domain") == ["domain_id"], tables.calls
    assert tables.limits("jamb_programme_domain") == [cr._JAMB_MAPPING_ROW_LIMIT]


def test_the_ilike_fallback_read_is_ordered_and_bounded_too():
    """The exact probe misses, so the `%term%` fallback is the read that runs.

    The fixture answers every `jamb_programme_domain` read with the same rows,
    so drive the fallback by making the FIRST read miss: an empty mapping table
    returns early, which proves nothing. Instead assert that BOTH reads carry
    the order/limit pair by counting them on a term that misses the join.
    """
    tables = _Tables({"jamb_programme_domain": [], "domains": []})
    import asyncio

    original = cr.db
    cr.db = tables
    try:
        asyncio.run(cr.get_jamb_domains("no such programme"))
    finally:
        cr.db = original
    assert tables.ordered("jamb_programme_domain") == ["domain_id", "domain_id"], (
        "both the exact probe and the ilike fallback must order their window"
    )
    assert tables.limits("jamb_programme_domain") == [
        cr._JAMB_MAPPING_ROW_LIMIT,
        cr._JAMB_MAPPING_ROW_LIMIT,
    ], tables.calls


def test_the_domain_join_read_is_bounded():
    tables, _domains = _drive(
        [{"domain_id": "d1", "match_type": "direct"}], [_domain("d1")]
    )
    assert tables.limits("domains") == [cr._JAMB_DOMAIN_LIMIT], tables.calls


# ── 4. the mapping ceiling IS the server cap, so truncation must be detected ──
#
# `_JAMB_MAPPING_ROW_LIMIT = 1000` and the project's PostgREST `db-max-rows` is
# also exactly 1000: MEASURED live on dev, an unbounded read of
# `jamb_programme_domain` answers `206 Partial Content` with
# `Content-Range: 0-999/3163`. So `.limit(1000)` is indistinguishable from an
# unbounded read and the ceiling bounds nothing. 19 terms reachable through
# `/api/career/jamb/{name}/domains` -- a route with no minimum-length floor --
# exceed it TODAY, two-character ones included:
#
#     'a'  2638 rows -> 48 of >=107 domains | 'e'  2826 -> 44 of >=95
#     'en' 1476 rows -> 82 of >=123 domains | 'st' 1038 -> 104 of >=108
#
# and because the reads are `.order("domain_id")`ed, the 1,000 lowest domain-id
# UUIDs is a DETERMINISTIC window: a `direct` mapping whose domain sorts high is
# always absent. This branch BUILT `_read_may_be_truncated` for exactly this
# shape and applied it to the role-domain, family-domain and domain-context
# reads; these two were the ones it missed.


def test_both_mapping_reads_ask_the_server_for_an_exact_count(monkeypatch):
    """Without `count="exact"` there is nothing to compare `len(rows)` against.

    Driven on a term that misses, so BOTH the exact probe and the `%term%`
    fallback run.
    """
    monkeypatch.setattr(cr, "log", _WarningLog())
    tables, _domains = _drive([], [], term="no such programme")
    assert tables.select_counts("jamb_programme_domain") == ["exact", "exact"], (
        tables.calls
    )


def test_a_short_mapping_read_is_reported_rather_than_answered_silently(monkeypatch):
    """The server matched more rows than it returned -> one WARNING per read."""
    recorder = _WarningLog()
    monkeypatch.setattr(cr, "log", recorder)
    _tables, domains = _drive(
        [{"domain_id": "d1", "match_type": "direct"}],
        [_domain("d1")],
        counts={"jamb_programme_domain": 3163, "domains": 1},
    )
    mapping_warnings = [
        fields for message, fields in recorder.warnings
        if "jamb domain mapping read" in message
    ]
    assert len(mapping_warnings) == 1, recorder.warnings
    assert mapping_warnings[0]["rows"] == 1
    assert mapping_warnings[0]["expected"] == 3163
    assert mapping_warnings[0]["ceiling"] == cr._JAMB_MAPPING_ROW_LIMIT
    # WARNING ONLY, deliberately: this is a completeness problem, not a
    # disclosure one (the `excluded` filter still runs on whatever arrived),
    # and `_JAMB_DOMAIN_LIMIT` already truncates the published list with no
    # notice of its own. The response envelope is unchanged.
    assert [d["domainId"] for d in domains] == ["D1"], domains


def test_a_complete_mapping_read_is_not_reported(monkeypatch):
    """POSITIVE CONTROL: warning unconditionally would pass the test above.

    `count == len(rows)` is the server saying it returned everything it
    matched, which must stay quiet.
    """
    recorder = _WarningLog()
    monkeypatch.setattr(cr, "log", recorder)
    _tables, domains = _drive(
        [{"domain_id": "d1", "match_type": "direct"}],
        [_domain("d1")],
        counts={"jamb_programme_domain": 1, "domains": 1},
    )
    assert [
        message for message, _fields in recorder.warnings
        if "jamb domain mapping read" in message
    ] == [], recorder.warnings
    assert [d["domainId"] for d in domains] == ["D1"], domains


def test_the_fallback_read_is_checked_too(monkeypatch):
    """A miss on the exact probe runs the `%term%` read; both must be checked.

    Both reads answer from the same canned rows here, so a mapping table that
    is empty for the exact probe is empty for the fallback too -- which is
    exactly the case where each read reports its own short window.
    """
    recorder = _WarningLog()
    monkeypatch.setattr(cr, "log", recorder)
    _drive([], [], term="no such programme", counts={"jamb_programme_domain": 3163})
    probes = [
        fields["probe"] for message, fields in recorder.warnings
        if "jamb domain mapping read" in message
    ]
    assert probes == ["exact", "contains"], recorder.warnings


# ── 5. the all-invalid path is an early return, not a `.in_("id", [])` ───────

def test_the_all_invalid_path_makes_no_join_round_trip():
    """`if not best: return []` -- versus `main`'s fall-through to `domains`.

    Two things follow from the early return and both are asserted here because
    removing it SURVIVES every other test in this file:

      * no `domains` read at all, i.e. one fewer PostgREST request per call on
        an unauthenticated route;
      * the response is the labelled no-mapping state, not a bare empty list.
        `main` answered `domains: []` with NO notice here; the branch routes
        it through `get_jamb_domains`'s `if not domains:` so the all-invalid,
        all-excluded and genuine-miss cases are labelled identically. That is
        a deliberate envelope change (see the comment at the early return).
    """
    import asyncio

    tables = _Tables(
        {"jamb_programme_domain": [{"domain_id": "d1", "match_type": "nonsense"}],
         "domains": [_domain("d1")]}
    )
    original = cr.db
    cr.db = tables
    try:
        response = asyncio.run(cr.get_jamb_domains("computer science"))
    finally:
        cr.db = original
    assert [tbl for name, tbl, _v in tables.calls if name == "execute"] == [
        "jamb_programme_domain"
    ], tables.calls
    assert response.data["data"]["domains"] == []
    assert response.data["meta"]["notice"] == "No domains mapped to this JAMB name yet."


def test_a_resolvable_mapping_still_makes_the_join_round_trip():
    """POSITIVE CONTROL: returning `[]` unconditionally would pass the above."""
    tables, domains = _drive(
        [{"domain_id": "d1", "match_type": "direct"}], [_domain("d1")]
    )
    assert [tbl for name, tbl, _v in tables.calls if name == "execute"] == [
        "jamb_programme_domain",
        "domains",
    ], tables.calls
    assert [d["domainId"] for d in domains] == ["D1"], domains

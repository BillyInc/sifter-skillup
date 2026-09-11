"""User text may reach PostgREST as a VALUE, never as filter syntax.

Two separate defects, both proven against dev, both on unauthenticated routes.

1. THE `or=` FILTER INJECTION. Three handlers built their filter as a STRING:

       like = f"%{clean_public_query(q)}%"
       query.or_(f"name.ilike.{like},display_name.ilike.{like}")

   `clean_public_query` removes LIKE metacharacters. `,` and `.` are not LIKE
   metacharacters -- they are PostgREST's filter-DSL separators -- so the user
   got to append their own filter, on any column, and it passed through no
   cleaner at all:

       /api/career/programmes?q=zzzzqqqq            ->  0 rows  (control)
       /api/career/programmes?q=computer            ->  3 rows  (control)
       /api/career/programmes?q=zz,name.gt.A        -> 25 rows
       /api/career/programmes?q=zz,name.like.*      -> 25 rows  (the `*` is in
                                                       the INJECTED term)
       /api/career/programmes?q=zz,no_such_col.gt.1 -> degraded response, i.e. a
                                                       column-existence oracle
       /api/student/jamb-programmes?q=zz,jamb_name.gt.A -> 30 rows vs 0 control

   `name.gt.<last name on the page>` is keyset pagination, so 25 rows a request
   walked the whole table out of an endpoint whose own notice says "Bulk listing
   is not exposed." `/api/career/search` was never affected because it uses
   `.ilike(column, value)`, where the value is one encoded parameter.

   The fix is the CALL SHAPE, not a longer strip list: a strip list is a
   blocklist and each of the last two rounds bypassed the previous one. So the
   assertions here are about what the client is actually handed.

2. THE SANITIZER WAS NOT PINNED BEHAVIOURALLY on the routes whose exploits were
   measured. Replacing `clean_public_query(q)` with `(q or "").strip()` in
   `search_admission_programmes` and in `get_jamb_domains` SURVIVED the full
   suite at 506 passed, with `q="**"` reaching `.ilike()` as `%**%` -- the
   match-everything walk those routes' own comments document.
"""

import ast
import pathlib
import re
from types import SimpleNamespace

import pytest

import routes.admission_routes as ar
import routes.career_routes as cr
import routes.student_pipeline_routes as sp

NEEDLE = "zz,name.gt.A"

_FILTERS = {
    "ilike", "like", "eq", "neq", "gt", "gte", "lt", "lte", "in_", "is_",
    "contains", "match", "imatch", "cs", "ov", "filter", "or_",
}


class _Recorder:
    """Records the calls a handler makes and answers every read with no rows.

    Doubles as the `database.db` module object and as the request builder, the
    way the real chain does.
    """

    def __init__(self):
        self.calls: list = []

    def __getattr__(self, name):
        def chain(*args, **kwargs):
            if name in _FILTERS or name in {"table", "select", "limit", "order", "range"}:
                self.calls.append((name, args[0] if args else None,
                                   args[1] if len(args) > 1 else kwargs.get("count")))
            return self

        return chain

    def execute(self):
        self.calls.append(("execute", None, None))
        return SimpleNamespace(data=[], count=0)

    # ── readers ──
    def patterns(self, kind="ilike"):
        return [(column, value) for name, column, value in self.calls if name == kind]

    def expressions(self):
        return [column for name, column, _v in self.calls if name == "or_"]

    def tables(self):
        return [column for name, column, _v in self.calls if name == "table"]

    def unbounded_reads(self):
        """Tables whose `.execute()` had no `.limit()` since the `table()` call."""
        out, table, limited = [], None, False
        for name, column, _value in self.calls:
            if name == "table":
                table, limited = column, False
            elif name == "limit":
                limited = True
            elif name == "execute" and not limited:
                out.append(table)
        return out

    def page_sizes(self):
        """Every `(table, limit VALUE)` pair, in call order.

        Presence alone was all the bounded-page test looked at, and the
        presence check is blind to the number: `_JAMB_MAPPING_ROW_LIMIT` 200 ->
        1 and -> 100000 both survived it, and 100000 is above the project's
        1,000-row `db-max-rows` so the bound it names is nominal.
        """
        out, table = [], None
        for name, column, _value in self.calls:
            if name == "table":
                table = column
            elif name == "limit":
                out.append((table, column))
        return out


@pytest.fixture
def recorder(monkeypatch):
    rec = _Recorder()
    for module in (cr, ar, sp):
        monkeypatch.setattr(module, "db", rec, raising=False)
    # The reference cache is Redis-backed and would answer some of these reads
    # from an earlier run, which would record no calls at all.
    for module in (ar, sp):
        monkeypatch.setattr(module, "get_json", lambda *a, **k: None)
        monkeypatch.setattr(module, "set_json", lambda *a, **k: None)
    return rec


def _run(coroutine):
    import asyncio

    return asyncio.run(coroutine)


# ── 1. the `or=` injection ────────────────────────────────────────────────────

def test_career_programmes_hands_the_term_over_as_a_value_not_an_expression(recorder):
    _run(cr.list_programmes(q=NEEDLE, institution_type=None, limit=20))
    assert recorder.expressions() == [], (
        "a filter EXPRESSION built from user text is the injection itself; "
        f"got {recorder.expressions()}"
    )
    assert recorder.patterns() == [
        ("name", f"%{NEEDLE}%"),
        ("display_name", f"%{NEEDLE}%"),
    ], recorder.calls


def test_student_jamb_programmes_hands_the_term_over_as_a_value_too(recorder):
    """`==` on an ordered list, not `in`, for the same reason the career
    sibling above uses it: with membership assertions, REVERSING `columns` at
    the call site survived. Column order is not cosmetic -- it is the order the
    rows are merged in, and `log_safety.ilike_any` breaks ordering ties on it.
    """
    _run(sp.search_jamb_programmes(q=NEEDLE, limit=30))
    assert recorder.expressions() == [], recorder.expressions()
    assert recorder.patterns() == [
        ("jamb_name", f"%{NEEDLE}%"),
        ("canonical_programme_name", f"%{NEEDLE}%"),
    ], recorder.calls


def test_both_injection_sites_still_search_at_all(recorder):
    """The positive control: an assertion that nothing was built would also pass
    if the handler had stopped querying."""
    _run(cr.list_programmes(q="computer", institution_type=None, limit=20))
    assert recorder.patterns(), "the handler must still issue its search"
    assert "programmes" in recorder.tables()


# ── 2. the sanitizer, on the routes whose exploits were measured ──────────────

METACHARACTER_CASES = ["a*", "a%", "a_", "a\\", "*a*"]


def _pattern_body(value):
    """A `.ilike()` value with the ONE layer of wrapping the callers add removed.

    `.strip("%")` was what this used to be, and it is wrong in a way that made
    one of the four assertion dimensions inert: it eats EVERY leading and
    trailing `%`, and the needle list spelled the percent case `"%%"`, never
    `"%"`. So dropping `%` from `log_safety._LIKE_METACHARACTERS` left
    `test_no_like_metacharacter_survives_into_a_pattern` FULLY GREEN on all
    five parametrisations, `[a%]` included -- the wrapping absorbed the leak.
    (`_`, `*` and `\\` each did fail their matching case, and four other tests
    kill the `%` mutant, so it was never a live hole. The assertion simply did
    not do what it said.)

    Removing exactly the `%...%` the handlers themselves build leaves the BODY,
    which is the thing that must contain no pattern syntax at all.
    """
    body = value if isinstance(value, str) else ""
    if len(body) >= 2 and body.startswith("%") and body.endswith("%"):
        body = body[1:-1]
    return body


# The needle list is the TEST's, not `log_safety._LIKE_METACHARACTERS`.
# Reading the module constant makes the assertion circular: dropping `%` from
# the implementation also drops it from the check, so the mutation removes its
# own detector and the test stays green. Every character Postgres/PostgREST
# treats as `LIKE` syntax is listed here, independently.
LIKE_METACHARACTERS = ("%", "_", "*", "\\")


def test_the_sanitizer_still_strips_everything_this_file_checks_for():
    """...and the implementation must not be allowed to strip LESS than that."""
    from log_safety import _LIKE_METACHARACTERS

    assert set(LIKE_METACHARACTERS) <= set(_LIKE_METACHARACTERS), (
        "log_safety stopped stripping a metacharacter this file asserts about: "
        f"{sorted(set(LIKE_METACHARACTERS) - set(_LIKE_METACHARACTERS))}"
    )


def _metacharacter_offenders(patterns):
    """Every `(column, value, metacharacter)` where user syntax survived.

    Shared by the real assertion and by its positive control, so the control
    exercises THE CODE THE TEST USES rather than a hand-written literal.
    """
    return [
        (column, value, metacharacter)
        for column, value in patterns
        for metacharacter in LIKE_METACHARACTERS
        if metacharacter in _pattern_body(value)
    ]


@pytest.mark.parametrize("term", METACHARACTER_CASES)
def test_no_like_metacharacter_survives_into_a_pattern(term, recorder):
    """One assertion for every public search handler that reaches `.ilike()`."""
    _run(cr.list_programmes(q=term, institution_type=None, limit=20))
    _run(ar.search_admission_programmes(q=term, limit=20))
    _run(ar.search_schools(q=term, limit=20, institution_type=None))
    _run(cr.get_jamb_domains(term))
    _run(sp.list_subjects(q=term, stream=None, exam_type=None))
    _run(sp.search_jamb_programmes(q=term, limit=30))
    _run(sp.get_school_programmes("school-1", q=term))
    _run(ar.jamb_admission_insight(term))
    offenders = _metacharacter_offenders(recorder.patterns())
    assert not offenders, f"{term!r} leaked pattern syntax: {offenders}"


def test_the_metacharacter_assertion_can_fail(recorder, monkeypatch):
    """POSITIVE CONTROL for the test above, through a REAL handler.

    The previous version of this control asserted on a hand-written literal
    (`leaked = [("name", "%a*%")]`) and never drove anything, so it kept
    passing however inert the real assertion became: it survived all four
    mutations of the strip list, "strip nothing" included.

    This one reverts the sanitizer on the handler -- `(q or "").strip()`, the
    mutation that survived the suite at 506 passed -- and requires the shared
    offender finder to see every metacharacter come out the other side.
    """
    monkeypatch.setattr(cr, "_clean_public_query", lambda q: (q or "").strip())
    for term in METACHARACTER_CASES:
        _run(cr.list_programmes(q=term, institution_type=None, limit=20))
    offenders = _metacharacter_offenders(recorder.patterns())
    leaked = {metacharacter for _c, _v, metacharacter in offenders}
    assert leaked == set(LIKE_METACHARACTERS), (
        "the assertion shape above must see EVERY metacharacter it claims to "
        f"check; it only saw {sorted(leaked)}"
    )


@pytest.mark.parametrize("term", ["a*", "computer"])
def test_each_sanitized_route_still_builds_a_pattern(term, recorder):
    """...and each of those routes must still be searching."""
    for drive in (
        lambda: ar.search_admission_programmes(q=term, limit=20),
        lambda: sp.get_school_programmes("school-1", q=term),
        lambda: cr.get_jamb_domains("computer science"),
    ):
        before = len(recorder.patterns())
        _run(drive())
        assert len(recorder.patterns()) > before, f"{drive} issued no search"


# ── 3. a term that cleans to nothing must not become match-everything ─────────

EMPTY_AFTER_CLEANING = ["**", "%", "_", "\\", "   ", "%%", "***"]


@pytest.mark.parametrize("segment", EMPTY_AFTER_CLEANING)
def test_jamb_domains_refuses_a_term_that_cleans_to_nothing(segment, recorder):
    """`clean_public_query("*") == ""`, and the empty term used to fall through
    the exact-match probe into the `%{term}%` fallback -- `ilike.%%`, i.e. match
    everything, on a route with no minimum-length floor and no `.limit()`.

    MEASURED through the handler before the guard: each of these segments
    returned 61 domains / 8,285 bytes, against 0 domains / 157 bytes for a
    genuine miss. Stripping `*` did not close this hole, it moved it here.
    """
    response = _run(cr.get_jamb_domains(segment))
    assert recorder.patterns() == [], (
        f"segment {segment!r} still reached PostgREST: {recorder.calls}"
    )
    payload = response.data["data"]
    assert payload["domains"] == []
    assert "No domains mapped" in (response.data["meta"] or {}).get("notice", "")
    # The display string is what the student typed, not the cleaned pattern.
    assert payload["jambName"] == segment


@pytest.mark.parametrize("segment", EMPTY_AFTER_CLEANING)
def test_admission_insight_refuses_a_term_that_cleans_to_nothing(segment, recorder):
    """Same shape on the sibling that was missed: MEASURED before this, segment
    `zzzzqqqq` -> programmeCount 0 while `**` and `%` -> programmeCount 21."""
    response = _run(ar.jamb_admission_insight(segment))
    assert recorder.patterns(kind="ilike") == [], recorder.calls
    assert response.data["data"]["programmeCount"] == 0
    assert response.data["data"]["hasCutoffData"] is False


def test_a_real_jamb_name_is_still_looked_up(recorder):
    """The positive control for both refusals above."""
    _run(cr.get_jamb_domains("computer science"))
    assert ("jamb_name", "computer science") in recorder.patterns(), recorder.calls


# ── 4. every read on these paths is bounded ───────────────────────────────────

# The project's PostgREST `db-max-rows`, confirmed live on dev. A `.limit()`
# above it is a bound in name only: the server truncates to this number and
# reports the fact in a `Content-Range` header the supabase client discards.
_POSTGREST_DB_MAX_ROWS = 1000


class _Rows(_Recorder):
    """A recorder that ANSWERS reads, so a handler's later reads are reached.

    With `data=[]` (the plain `_Recorder`), both mapping reads in
    `get_jamb_domains` miss and the handler returns before the `domains` join
    -- so dropping the `.limit()` from that join, and un-slicing
    `ids = list(best.keys())[:50]`, were invisible to the bounded-page test.
    """

    def __init__(self, rows: dict):
        super().__init__()
        self.rows = rows
        self.table_name = None

    def __getattr__(self, name):
        parent = super().__getattr__(name)

        def chain(*args, **kwargs):
            if name == "table":
                self.table_name = args[0] if args else None
            return parent(*args, **kwargs)

        return chain

    def execute(self):
        self.calls.append(("execute", None, None))
        return SimpleNamespace(data=list(self.rows.get(self.table_name, [])), count=None)


@pytest.fixture
def answering_recorder(monkeypatch):
    rec = _Rows(
        {
            "jamb_programme_domain": [
                {"domain_id": "d1", "match_type": "direct"},
                {"domain_id": "d2", "match_type": "adjacent"},
            ],
            "domains": [
                {"id": "d1", "domain_key": "D1", "name": "Computing",
                 "cluster": "Science", "elite_domain": False, "excluded": False},
            ],
            "subject_catalog": [
                {"id": "s1", "code": "MTH", "name": "Mathematics",
                 "aliases": [], "category": "core", "stream_tags": []},
            ],
        }
    )
    for module in (cr, ar, sp):
        monkeypatch.setattr(module, "db", rec, raising=False)
    for module in (ar, sp):
        monkeypatch.setattr(module, "get_json", lambda *a, **k: None)
        monkeypatch.setattr(module, "set_json", lambda *a, **k: None)
    return rec


def test_every_read_on_the_repaired_paths_asks_for_a_bounded_page(answering_recorder):
    """`.limit()` on every read, not just the ones that looked expensive.

    `/api/student/subjects` had NO `.limit()` at all (`query.order("name").
    execute()`), and both reads in `get_jamb_domains` were unbounded against a
    3,163-row mapping table whose match-everything pattern returned the
    project's 1,000-row `db-max-rows` page.

    Driven with a recorder that RETURNS ROWS, so the `domains` join read on the
    far side of the mapping lookup is actually reached.
    """
    recorder = answering_recorder
    _run(sp.list_subjects(q="computer", stream=None, exam_type=None))
    _run(cr.get_jamb_domains("computer science"))
    _run(cr.list_programmes(q="computer", institution_type=None, limit=20))
    _run(ar.jamb_admission_insight("computer science"))
    assert recorder.unbounded_reads() == [], recorder.unbounded_reads()
    assert ("domains", cr._JAMB_DOMAIN_LIMIT) in recorder.page_sizes(), (
        "the jamb-domain join read was never reached, so this test says nothing "
        f"about it: {recorder.page_sizes()}"
    )


def test_no_read_asks_for_a_page_the_server_will_silently_truncate(answering_recorder):
    """A `.limit()` VALUE has to be inside the server's own ceiling.

    The presence check above is blind to the number, and every one of these
    survived it: `_JAMB_MAPPING_ROW_LIMIT` 200 -> 1 and -> 100000,
    `_JAMB_DOMAIN_LIMIT` 50 -> 1, `_SUBJECT_CATALOGUE_LIMIT` 500 -> 1 and ->
    100000, `_INSIGHT_PROGRAMME_LIMIT` 50 -> 1.
    """
    recorder = answering_recorder
    _run(sp.list_subjects(q="computer", stream=None, exam_type=None))
    _run(cr.get_jamb_domains("computer science"))
    _run(cr.list_programmes(q="computer", institution_type=None, limit=20))
    _run(sp.search_jamb_programmes(q="computer", limit=30))
    _run(ar.jamb_admission_insight("computer science"))
    pages = recorder.page_sizes()
    assert pages, "no `.limit()` was recorded at all"
    for table, size in pages:
        assert isinstance(size, int) and not isinstance(size, bool), (table, size)
        # No floor HERE: `.limit(1)` is the right read for a single-row lookup
        # (`admission_snapshot_version`) and these paths make several. The floor
        # belongs to the named page ceilings, which is what
        # `test_the_page_ceilings_are_the_values_they_were_measured_for` asserts.
        assert 1 <= size <= _POSTGREST_DB_MAX_ROWS, (
            f"{table} asked for {size} rows, above the server's db-max-rows "
            f"({_POSTGREST_DB_MAX_ROWS}), so the bound it names is nominal"
        )


# Every page ceiling on the repaired paths, as a VALUE. These are security
# bounds on unauthenticated endpoints, so changing one is a decision: change it
# here too, deliberately, and record the measurement that justifies it next to
# the constant.
#
# THIS DICT IS NOT CURATED BY HAND. It is checked against the set derived from
# the modules' own source by `test_the_page_ceiling_list_cannot_shrink_
# silently`, because a hand-curated list can shrink the same way
# `GUARDED_SOURCES` could (`test_log_safety_source.py` grew the same guard for
# the same reason). Dropping an entry here AND changing the constant survived
# green, 3 for 3, while nothing else in the file could see it:
#
#     drop `_JAMB_MAPPING_ROW_LIMIT` + set it to 200 -> SURVIVED (705 passed)
#     drop `_SUBJECT_CATALOGUE_LIMIT` + set it to 5  -> SURVIVED
#     drop `_INSIGHT_PROGRAMME_LIMIT` + set it to 5  -> SURVIVED
#
# and the first of those reinstates exactly the truncation this branch measured
# and fixed (science 94 -> 57, a 111 -> 49, management 62 -> 35).
# `test_every_read_..._asks_for_a_bounded_page` only requires *a* `.limit()`
# and `test_no_read_asks_for_a_page_the_server_will_silently_truncate` only
# requires `<= 1000`, so neither behavioural net catches a shrunk ceiling.
PAGE_CEILINGS = {
    "career_routes._JAMB_MAPPING_ROW_LIMIT": 1000,
    "career_routes._JAMB_DOMAIN_LIMIT": 50,
    "career_routes._PROGRAMME_SEARCH_LIMIT": 25,
    "career_routes._PUBLIC_SEARCH_LIMIT": 20,
    "student_pipeline_routes._SUBJECT_CATALOGUE_LIMIT": 500,
    "student_pipeline_routes._JAMB_PROGRAMME_PAGE_LIMIT": 80,
    "admission_routes._INSIGHT_PROGRAMME_LIMIT": 50,
    "admission_routes._TYPEAHEAD_PAGE_LIMIT": 50,
}

_CEILING_MODULES = {
    "career_routes": cr,
    "student_pipeline_routes": sp,
    "admission_routes": ar,
}

# The naming convention the derivation keys on: a module-level `_..._LIMIT`.
# It is a CONVENTION, so it is asserted rather than assumed -- if a new ceiling
# is spelled some other way the derived set will not see it, which is why
# `test_the_page_ceiling_list_cannot_shrink_silently` also names the modules'
# other int constants in its failure message.
_CEILING_NAME = re.compile(r"^_[A-Z0-9_]*_LIMIT$")


def _declared_page_ceilings() -> set[str]:
    """Every `module._..._LIMIT` assigned at module level, from the SOURCE.

    Read from the AST, not from `vars(module)`, so a `_..._LIMIT` IMPORTED
    from somewhere else is not mistaken for one this module owns.
    """
    found = set()
    for module_name, module in _CEILING_MODULES.items():
        tree = ast.parse(pathlib.Path(module.__file__).read_text(encoding="utf-8"))
        for node in tree.body:
            targets = (
                node.targets if isinstance(node, ast.Assign)
                else [node.target] if isinstance(node, ast.AnnAssign)
                else []
            )
            for target in targets:
                if isinstance(target, ast.Name) and _CEILING_NAME.match(target.id):
                    found.add(f"{module_name}.{target.id}")
    return found


def test_the_page_ceiling_list_cannot_shrink_silently():
    """`PAGE_CEILINGS` must cover every page ceiling these modules declare.

    Without this, dropping an entry and changing its constant is invisible:
    one fewer parametrisation, compared against nothing. Deleting a ceiling
    outright is caught by the parametrised value test below, which then raises
    AttributeError; this is the other direction.
    """
    declared = _declared_page_ceilings()
    assert declared == set(PAGE_CEILINGS), (
        "PAGE_CEILINGS is out of step with the ceilings the modules declare.\n"
        f"  declared but not pinned here: {sorted(declared - set(PAGE_CEILINGS))}\n"
        f"  pinned here but not declared: {sorted(set(PAGE_CEILINGS) - declared)}"
    )


def test_the_page_ceiling_derivation_actually_finds_them():
    """POSITIVE CONTROL: `declared == PAGE_CEILINGS` would also hold if the
    derivation returned nothing and the dict were emptied. It must find the
    ceilings by NAME, from source, in all three modules."""
    declared = _declared_page_ceilings()
    assert len(declared) >= 8, declared
    assert {
        "career_routes._JAMB_MAPPING_ROW_LIMIT",
        "student_pipeline_routes._SUBJECT_CATALOGUE_LIMIT",
        "admission_routes._TYPEAHEAD_PAGE_LIMIT",
    } <= declared, declared
    assert "career_routes._MIN_PUBLIC_QUERY_LEN" not in declared, (
        "the convention is a `_LIMIT` suffix; a minimum-length floor is not a page"
    )


@pytest.mark.parametrize("dotted", sorted(PAGE_CEILINGS))
def test_the_page_ceilings_are_the_values_they_were_measured_for(dotted):
    module_name, constant = dotted.split(".")
    actual = getattr(_CEILING_MODULES[module_name], constant)
    assert actual == PAGE_CEILINGS[dotted], (
        f"{dotted} is {actual}, not {PAGE_CEILINGS[dotted]}. If the change is "
        "deliberate, update PAGE_CEILINGS and the measurement beside the "
        "constant; a page ceiling on an unauthenticated route is not an "
        "incidental number."
    )
    assert 1 < actual <= _POSTGREST_DB_MAX_ROWS, (
        f"{dotted}={actual} is outside [2, {_POSTGREST_DB_MAX_ROWS}]; above the "
        "server's db-max-rows the bound is nominal, and a one-row page is not a page"
    )


def test_the_unbounded_read_detector_can_fail():
    """POSITIVE CONTROL: the detector must see a missing `.limit()`."""
    rec = _Recorder()
    rec.calls = [("table", "subject_catalog", None), ("order", "name", None), ("execute", None, None)]
    assert rec.unbounded_reads() == ["subject_catalog"]


def test_the_page_size_reader_can_see_a_bad_value():
    """POSITIVE CONTROL for `page_sizes()`: it must report the NUMBER."""
    rec = _Recorder()
    rec.calls = [
        ("table", "jamb_programme_domain", None),
        ("limit", 100000, None),
        ("execute", None, None),
    ]
    assert rec.page_sizes() == [("jamb_programme_domain", 100000)]
    assert not 100000 <= _POSTGREST_DB_MAX_ROWS


# ── 5. the excluded-domain filter on the jamb-domains join ────────────────────

def test_the_jamb_domain_join_reads_the_excluded_flag(recorder):
    """`excluded` HIDES THE CONTENT of a domain, and this join selected `name`
    and `cluster` without it -- an excluded domain reachable through
    `jamb_programme_domain` would have been published by name. Dev has 0
    excluded rows today, which is why it was latent rather than live."""
    rows = {"jamb_programme_domain": [{"domain_id": "d1", "match_type": "direct"}],
            "domains": [{"id": "d1", "domain_key": "D086", "name": "Gambling",
                         "cluster": "Other", "elite_domain": False, "excluded": True}]}

    class _Joining(_Recorder):
        def __init__(self):
            super().__init__()
            self.table_name = None

        def __getattr__(self, name):
            parent = super().__getattr__(name)

            def chain(*args, **kwargs):
                if name == "table":
                    self.table_name = args[0] if args else None
                return parent(*args, **kwargs)

            return chain

        def execute(self):
            self.calls.append(("execute", None, None))
            return SimpleNamespace(data=list(rows.get(self.table_name, [])), count=None)

    joining = _Joining()
    import routes.career_routes as module

    original = module.db
    module.db = joining
    try:
        response = _run(module.get_jamb_domains("gambling"))
    finally:
        module.db = original
    selected = [value for name, value, _c in joining.calls if name == "select"]
    assert any("excluded" in (value or "") for value in selected), selected
    assert response.data["data"]["domains"] == [], (
        "an excluded domain must not be published by name through this join"
    )


# ── 6. a hostile `?limit=` is clamped at BOTH ends ───────────────────────────

@pytest.mark.parametrize("hostile", [-1, 0, -1000])
def test_the_jamb_programme_typeahead_clamps_a_negative_page(hostile, recorder):
    """`min(limit, 80)` clamped the CEILING and left the FLOOR open.

    `?limit=-1` went to PostgREST as `limit=-1`, which 400s -- on the view read
    AND on the registry fallback -- so the endpoint answered `coming_soon` and
    wrote one ERROR record (30-day retention) per unauthenticated request. The
    sibling `career_routes.list_programmes` already spelled it
    `max(1, min(limit, ...))`.
    """
    _run(sp.search_jamb_programmes(q="computer", limit=hostile))
    sizes = [size for _table, size in recorder.page_sizes()]
    assert sizes, recorder.calls
    assert all(size >= 1 for size in sizes), sizes


@pytest.mark.parametrize("hostile", [-1, 0])
def test_the_career_programme_search_clamps_a_negative_page_too(hostile, recorder):
    """The sibling that already got it right, pinned so it stays right."""
    _run(cr.list_programmes(q="computer", institution_type=None, limit=hostile))
    sizes = [size for _table, size in recorder.page_sizes()]
    assert sizes, recorder.calls
    assert all(size >= 1 for size in sizes), sizes


def test_an_ordinary_page_request_is_not_clamped_away(recorder):
    """POSITIVE CONTROL: a clamp to a constant would pass both tests above."""
    _run(sp.search_jamb_programmes(q="computer", limit=12))
    assert ("v_jamb_programme_details", 12) in recorder.page_sizes(), (
        recorder.page_sizes()
    )


# `admission_routes` is the third module with a `?limit=` typeahead and it never
# got the floor: `min(limit, 50)` at four places in two handlers. EVERY route in
# that module is unauthenticated (no `current_user` appears in the file at all),
# so `?limit=-1` was an unauthenticated ERROR-record amplifier. MEASURED through
# the real handlers before the fix, the values that reached PostgREST:
#
#     /api/admission/schools?limit=-1    -> [-1, 1200]
#     /api/admission/programmes?limit=-1 -> [-1]
#
# Both handlers are driven here, and the school search is driven on BOTH of its
# branches: the `institution_type="university"` branch takes a different code
# path (SQL match + bounded registry) from the generic one, and only the first
# of the two carried the registry read.

@pytest.mark.parametrize("hostile", [-1, 0, -1000])
def test_the_admission_programme_typeahead_clamps_a_negative_page(hostile, recorder):
    _run(ar.search_admission_programmes(q="computer", limit=hostile))
    sizes = [size for _table, size in recorder.page_sizes()]
    assert sizes, recorder.calls
    assert all(size >= 1 for size in sizes), sizes


@pytest.mark.parametrize("hostile", [-1, 0, -1000])
def test_the_admission_university_search_clamps_a_negative_page(hostile, recorder):
    _run(ar.search_schools(q="lagos", limit=hostile, institution_type="university"))
    sizes = [size for _table, size in recorder.page_sizes()]
    assert sizes, recorder.calls
    assert all(size >= 1 for size in sizes), sizes


@pytest.mark.parametrize("hostile", [-1, 0, -1000])
def test_the_admission_school_search_clamps_a_negative_page_on_the_other_branch(
    hostile, recorder
):
    """The non-university branch, which skips the registry read entirely."""
    _run(ar.search_schools(q="lagos", limit=hostile, institution_type="polytechnic"))
    sizes = [size for _table, size in recorder.page_sizes()]
    assert sizes, recorder.calls
    assert all(size >= 1 for size in sizes), sizes


@pytest.mark.parametrize(
    "handler",
    [
        lambda: ar.search_admission_programmes(q="computer", limit=12),
        lambda: ar.search_schools(q="lagos", limit=12, institution_type="polytechnic"),
    ],
)
def test_an_ordinary_admission_page_request_is_not_clamped_away(handler, recorder):
    """POSITIVE CONTROL: `max(1, min(limit, 50))` must still honour the caller.

    A clamp to a constant -- `.limit(1)`, or `.limit(_TYPEAHEAD_PAGE_LIMIT)` --
    passes all three tests above.
    """
    _run(handler())
    assert 12 in [size for _table, size in recorder.page_sizes()], recorder.page_sizes()

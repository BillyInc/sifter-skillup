"""GET /api/career/domains — the Domain Explorer's data source.

This endpoint did not exist. `careerData.getDomainClusters()` was a stub that
returned a hardcoded `coming_soon`, so the Domain Explorer — linked from the
main Explore page as "Browse all clusters" — rendered an empty "Locked" panel
under a header that stated "168 domains across 37 clusters". Both numbers were
literals in the JSX, and both were wrong: the table holds 160 domains across
35 clusters, and had all along.

Route ORDER matters here: `/domains` is declared before `/domains/{domain_id}`
because FastAPI matches in definition order, and a literal path registered
after a parameterised sibling never gets reached.
"""

import asyncio
from unittest.mock import MagicMock, patch

import routes.career_routes as cr

DOMAINS = [
    {"id": "u1", "domain_key": "D001", "name": "Zebra Studies", "cluster": "ICT",
     "elite_domain": False, "excluded": False},
    {"id": "u2", "domain_key": "D002", "name": "Alpha Systems", "cluster": "ICT",
     "elite_domain": True, "excluded": False},
    {"id": "u3", "domain_key": "D003", "name": "Retired", "cluster": "ICT",
     "elite_domain": False, "excluded": True},
    {"id": "u4", "domain_key": "D004", "name": "Nursing", "cluster": "Health",
     "elite_domain": False, "excluded": False},
]
METRICS = [
    {"domain_id": "u1", "volume_score": 71.5, "demand_band": "medium"},
    {"domain_id": "u4", "volume_score": 20.0, "demand_band": "LOW "},
    {"domain_id": "u9", "volume_score": 3, "demand_band": "high"},  # orphan
]
# The elite gate reads this table. `elite_domain` on the domain row is an audit
# input, not publication evidence, so a domain is only shown as elite when it
# also has a published review here. u2 (Alpha Systems) is the published one.
#
# These rows carry `entity_level` and `decision` because the mock below is
# FILTER-AWARE: the noise rows are the point. A draft review for u2, and a
# published review for u2 at the wrong entity level, are both present, so the
# `.eq("decision", "published")` and `.eq("entity_level", ...)` filters in
# `_published_elite_entity_ids` are actually exercised. With the previous
# `t.eq.return_value = t` no-op mock, every row came back regardless of the
# filters and deleting `.eq("decision", "published")` -- the entire point of
# the gate -- turned no test red.
#
# The `decision` values are the ones the real CHECK constraint allows
# (`not_established | provisional | published`). "draft"/"rejected" read fine
# but could never reach the table, so a test built on them asserted the right
# behaviour through a row the database would have rejected.
REVIEWS = [
    {"entity_id": "u2", "domain_id": None, "entity_level": "domain", "decision": "published"},
    {"entity_id": "u1", "domain_id": None, "entity_level": "domain", "decision": "not_established"},
    {"entity_id": "u4", "domain_id": None, "entity_level": "domain", "decision": "provisional"},
    {"entity_id": "u1", "domain_id": None, "entity_level": "role", "decision": "published"},
]


class _FilterAwareTable:
    """A query builder that actually applies `.eq()`.

    `t.eq.return_value = t` is a no-op: it makes every filter invisible, so a
    test that "proves" the elite gate proves nothing -- the rows come back the
    same whether the route filters on `decision = published` or not. This
    records the `.eq()` pairs and applies them at `.execute()`, so removing a
    filter from the route changes the rows the route sees.
    """

    def __init__(self, rows):
        self._rows = rows
        self._filters: list[tuple[str, str, object]] = []
        self._range: tuple[int, int] | None = None

    def select(self, *_a, **_k):
        return self

    def order(self, *_a, **_k):
        return self

    def limit(self, *_a, **_k):
        return self

    def eq(self, column, value):
        self._filters.append(("eq", column, value))
        return self

    def ilike(self, column, pattern):
        # Modelled, not stubbed: a stub that returns every row turns a wrong
        # `.ilike()` into a green test. Only PostgREST's `%` wildcard is
        # supported, which is all this route ever sends.
        self._filters.append(("ilike", column, pattern))
        return self

    def in_(self, column, values):
        self._filters.append(("in", column, list(values)))
        return self

    def range(self, start, end):
        self._range = (start, end)
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

    def execute(self):
        if isinstance(self._rows, BaseException):
            raise self._rows
        rows = [
            row
            for row in self._rows
            if all(self._matches(kind, row, column, value)
                   for kind, column, value in self._filters)
        ]
        if self._range is not None:
            start, end = self._range
            rows = rows[start:end + 1]
        return MagicMock(data=rows)


def _svc_with(domains, metrics, reviews):
    # Table-aware on purpose. This used to return `metrics` for every table
    # that was not "domains", which meant the elite-evidence lookup was
    # silently answered with demand rows -- so the gate was being exercised
    # against the wrong data and whether it passed was an accident of which
    # uuids happened to appear in METRICS.
    def table(name):
        if name == "domains":
            payload = domains
        elif name == "elite_evidence_reviews":
            payload = reviews
        else:
            payload = metrics
        # Passing an exception makes that table's query raise, so a failure can
        # be injected at the database boundary and travel through the real
        # error handling instead of around it.
        return _FilterAwareTable(payload)

    return MagicMock(table=table)


def _call(domains=DOMAINS, metrics=METRICS, reviews=REVIEWS) -> dict:
    with patch.object(cr, "_svc", lambda: _svc_with(domains, metrics, reviews)):
        data = asyncio.run(cr.list_domain_clusters()).data
    assert data is not None
    return data


class TestDomainClusters:
    def test_tool_mapping_does_not_expose_unverified_demand_fields(self):
        mapped = cr._tool({
            "tool_name": "Example tool",
            "tool_group": "common",
            "hot": True,
            "in_demand": True,
            "demand_score": 0.9,
            "demand_source": "taxonomy_derived_baseline_v1",
            "demand_as_of": "2026-07-01",
            "role_freq": 4,
            "source": "onet",
        })
        assert mapped["tool"] == "Example tool"
        assert all(
            key not in mapped
            for key in ("hot", "inDemand", "demandScore", "demandSource", "demandAsOf")
        )

    def test_groups_by_cluster(self):
        out = _call()
        assert out["status"] == "real"
        assert [g["cluster"] for g in out["data"]] == ["Health", "ICT"]

    def test_excluded_domains_are_dropped(self):
        out = _call()
        ict = next(g for g in out["data"] if g["cluster"] == "ICT")
        assert [d["name"] for d in ict["domains"]] == ["Alpha Systems", "Zebra Studies"]

    def test_id_is_the_domain_key_the_detail_route_expects(self):
        # The domain route keys on domain_key ("D001"), not the uuid. Emitting
        # the uuid here would make every card on this screen a dead link.
        out = _call()
        ids = {d["id"] for g in out["data"] for d in g["domains"]}
        assert ids == {"D001", "D002", "D004"}

    def test_demand_score_is_not_presented_before_source_backed_ingestion(self):
        out = _call()
        by_name = {d["name"]: d for g in out["data"] for d in g["domains"]}
        assert "inDemandScore" not in by_name["Zebra Studies"]
        # Absent rather than 0 — a domain with no metric has no score, and 0
        # would read as "measured, and it is zero".
        assert "inDemandScore" not in by_name["Alpha Systems"]

    def test_demand_band_is_not_presented_before_source_backed_ingestion(self):
        # The band drives the meter. volume_score is on the source's own scale
        # (13..56 in production) and is NOT a percentage — a UI that treated it
        # as one drew every domain as full demand.
        out = _call()
        by_name = {d["name"]: d for g in out["data"] for d in g["domains"]}
        assert "demandBand" not in by_name["Zebra Studies"]
        assert "demandBand" not in by_name["Nursing"]
        assert "demandBand" not in by_name["Alpha Systems"]

    def test_elite_flag_survives(self):
        out = _call()
        by_name = {d["name"]: d for g in out["data"] for d in g["domains"]}
        assert by_name["Alpha Systems"]["eliteFlag"] is True
        assert by_name["Nursing"]["eliteFlag"] is False

    def test_elite_flag_requires_a_published_review(self):
        # The gate, stated directly: elite_domain alone must not surface a
        # domain as elite. Alpha Systems still has elite_domain=True here --
        # only the published review is gone.
        out = _call(reviews=[])
        by_name = {d["name"]: d for g in out["data"] for d in g["domains"]}
        assert by_name["Alpha Systems"]["eliteFlag"] is False

    def test_an_unpublished_review_does_not_make_a_domain_elite(self):
        # The filter under test, stated as data: u2 has a review, but it is a
        # draft. Dropping `.eq("decision", "published")` from the route makes
        # this test red.
        out = _call(reviews=[
            {"entity_id": "u2", "domain_id": None, "entity_level": "domain", "decision": "draft"},
        ])
        by_name = {d["name"]: d for g in out["data"] for d in g["domains"]}
        assert by_name["Alpha Systems"]["eliteFlag"] is False

    def test_a_published_review_at_another_entity_level_does_not_leak_across(self):
        # Dropping `.eq("entity_level", ...)` makes this test red: a published
        # ROLE review must not publish the domain of the same id.
        out = _call(reviews=[
            {"entity_id": "u2", "domain_id": None, "entity_level": "role", "decision": "published"},
        ])
        by_name = {d["name"]: d for g in out["data"] for d in g["domains"]}
        assert by_name["Alpha Systems"]["eliteFlag"] is False

    def test_elite_gate_matches_on_domain_key_as_well_as_uuid(self):
        # Reviews may key a domain either way, so both lookups have to work or
        # half the published set silently stops being elite.
        #
        # The domain KEY goes in `entity_id`, which is text. `domain_id` is a
        # uuid with an FK to domains(id), so "D002" could never be stored
        # there -- the behaviour under test is real, the column used to assert
        # it was not.
        out = _call(reviews=[
            {"entity_id": "D002", "domain_id": None, "entity_level": "domain",
             "decision": "published"},
        ])
        by_name = {d["name"]: d for g in out["data"] for d in g["domains"]}
        assert by_name["Alpha Systems"]["eliteFlag"] is True

    def test_elite_gate_failure_does_not_take_the_endpoint_down(self):
        # The failure is injected at the database boundary, not by patching
        # _published_elite_entity_ids -- patching the helper would jump over
        # the very error handling under test and would still pass if that
        # handling were deleted.
        #
        # The helper swallows a query error and returns an empty set, so the
        # explorer must still answer `real` and simply mark nothing elite:
        # fail closed on the flag, not on the whole screen. The regression this
        # file exists to catch was the opposite -- the elite lookup was missing
        # altogether, the NameError was swallowed by the endpoint's own except,
        # and every request answered `coming_soon`.
        out = _call(reviews=RuntimeError("elite_evidence_reviews unavailable"))
        assert out["status"] == "real"
        by_name = {d["name"]: d for g in out["data"] for d in g["domains"]}
        assert by_name["Alpha Systems"]["eliteFlag"] is False

    def test_empty_table_degrades_instead_of_lying(self):
        out = _call(domains=[], metrics=[])
        assert out["status"] == "coming_soon"

    def test_an_unrelated_table_failure_still_returns_domains(self):
        # Named for what it covers. It used to be called
        # `test_demand_failure_still_returns_domains`, but the demand query it
        # named was removed with `domain_demand_metrics`; the only non-domains
        # table this endpoint touches now is elite_evidence_reviews, so it was
        # an exact duplicate of the elite-gate failure test above under a name
        # that described a query that no longer exists.
        #
        # It is kept as the *shape* assertion its sibling does not make: the
        # excluded domain is still dropped and all three survivors are still
        # grouped and returned when a secondary lookup dies.
        out = _call(reviews=RuntimeError("elite_evidence_reviews unavailable"))
        assert out["status"] == "real"
        assert sum(len(g["domains"]) for g in out["data"]) == 3
        assert [g["cluster"] for g in out["data"]] == ["Health", "ICT"]


class TestRouteOrder:
    def test_literal_domains_route_precedes_the_parameterised_one(self):
        paths = [
            (r.path, r.name)
            for r in cr.router.routes
            if getattr(r, "path", "").startswith("/api/career/domains")
        ]
        literal = next(i for i, (p, _) in enumerate(paths) if p == "/api/career/domains")
        param = next(
            i for i, (p, _) in enumerate(paths) if p == "/api/career/domains/{domain_id}"
        )
        assert literal < param, (
            "/domains must be registered before /domains/{domain_id}; "
            "FastAPI matches in definition order"
        )

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
REVIEWS = [
    {"entity_id": "u2", "domain_id": None},
]


def _svc_with(domains, metrics, reviews):
    # Table-aware on purpose. This used to return `metrics` for every table
    # that was not "domains", which meant the elite-evidence lookup was
    # silently answered with demand rows -- so the gate was being exercised
    # against the wrong data and whether it passed was an accident of which
    # uuids happened to appear in METRICS.
    def table(name):
        t = MagicMock()
        t.select.return_value = t
        t.order.return_value = t
        t.eq.return_value = t
        if name == "domains":
            payload = domains
        elif name == "elite_evidence_reviews":
            payload = reviews
        else:
            payload = metrics
        # Passing an exception makes that table's query raise, so a failure can
        # be injected at the database boundary and travel through the real
        # error handling instead of around it.
        if isinstance(payload, BaseException):
            t.execute.side_effect = payload
        else:
            t.execute.return_value = MagicMock(data=payload)
        return t

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

    def test_elite_gate_matches_on_domain_key_as_well_as_uuid(self):
        # Reviews may key a domain either way, so both lookups have to work or
        # half the published set silently stops being elite.
        out = _call(reviews=[{"entity_id": None, "domain_id": "D002"}])
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

    def test_demand_failure_still_returns_domains(self):
        # Demand is enrichment; losing it must not empty the screen.
        def table(name):
            t = MagicMock()
            t.select.return_value = t
            t.order.return_value = t
            t.eq.return_value = t
            if name == "domains":
                t.execute.return_value = MagicMock(data=DOMAINS)
            else:
                t.execute.side_effect = RuntimeError("metrics unavailable")
            return t

        with patch.object(cr, "_svc", lambda: MagicMock(table=table)):
            out = asyncio.run(cr.list_domain_clusters()).data
        assert out is not None
        assert out["status"] == "real"
        assert sum(len(g["domains"]) for g in out["data"]) == 3


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

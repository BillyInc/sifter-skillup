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


def _svc_with(domains, metrics):
    def table(name):
        t = MagicMock()
        t.select.return_value = t
        t.order.return_value = t
        t.eq.return_value = t
        t.execute.return_value = MagicMock(
            data=domains if name == "domains" else metrics
        )
        return t

    return MagicMock(table=table)


def _call(domains=DOMAINS, metrics=METRICS) -> dict:
    with patch.object(cr, "_svc", lambda: _svc_with(domains, metrics)):
        data = asyncio.run(cr.list_domain_clusters()).data
    assert data is not None
    return data


class TestDomainClusters:
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

    def test_demand_score_is_attached_by_uuid(self):
        out = _call()
        by_name = {d["name"]: d for g in out["data"] for d in g["domains"]}
        assert by_name["Zebra Studies"]["inDemandScore"] == 71.5
        # Absent rather than 0 — a domain with no metric has no score, and 0
        # would read as "measured, and it is zero".
        assert "inDemandScore" not in by_name["Alpha Systems"]

    def test_demand_band_is_normalised(self):
        # The band drives the meter. volume_score is on the source's own scale
        # (13..56 in production) and is NOT a percentage — a UI that treated it
        # as one drew every domain as full demand.
        out = _call()
        by_name = {d["name"]: d for g in out["data"] for d in g["domains"]}
        assert by_name["Zebra Studies"]["demandBand"] == "medium"
        assert by_name["Nursing"]["demandBand"] == "low"  # "LOW " normalised
        assert "demandBand" not in by_name["Alpha Systems"]

    def test_elite_flag_survives(self):
        out = _call()
        by_name = {d["name"]: d for g in out["data"] for d in g["domains"]}
        assert by_name["Alpha Systems"]["eliteFlag"] is True
        assert by_name["Nursing"]["eliteFlag"] is False

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

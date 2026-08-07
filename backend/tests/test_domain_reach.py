"""
Tests for the §5.1 Domain Reach Audit and §5.5 Student Intelligence endpoints
in routes/institutions_routes.py.

Three things are being pinned here.

1. AUTHORISATION. All three surfaces are internal curriculum-planning /
   cohort views. A plain student must never reach them, and an admin must not
   be able to read another institution's id.

2. SHAPE. These endpoints back fixed dashboard layouts, so the client must
   always receive the full payload — including on the failure path. An audit
   that answers with half a body is worse than one that answers with zeros and
   a message.

3. PRIVACY. /student-intelligence is an AGGREGATE rollup. It must not carry a
   student id, name, class, claim code or any other per-row field — not merely
   "not today", but structurally: the response model has no such field.

Style follows test_institution_access.py: real auth chain (JWT + mocked users
lookup) so the actual dependency executes, mocked service client, no live DB.
"""
from unittest.mock import MagicMock

import pytest

USER_ID = "test-user-123"  # matches the auth_header fixture's JWT sub

LEAVES = [
    "domain-reach",
    "domain-reach/leaderboard",
    "student-intelligence",
]


def _user_row(**overrides):
    row = {
        "id": USER_ID,
        "username": "InstTester",
        "auth_provider": "guest",
        "account_type": "student",
    }
    row.update(overrides)
    return row


@pytest.fixture
def inst_db(mock_db, monkeypatch):
    """Point the institutions module's captured `db` at the shared mock."""
    import routes.institutions_routes as ir

    monkeypatch.setattr(ir, "db", mock_db, raising=False)
    sc = mock_db.get_service_client.return_value
    sc.schema.return_value.table.return_value.select.return_value.execute.return_value = MagicMock(data=[])
    return mock_db


def _login_as(inst_db, user_row):
    sc = inst_db.get_service_client.return_value
    (
        sc.table.return_value.select.return_value.eq.return_value
        .single.return_value.execute.return_value
    ) = MagicMock(data=user_row)


def _org_is(monkeypatch, org_id):
    import routes.institutions_routes as ir

    monkeypatch.setattr(ir, "_resolve_org", lambda _user: org_id, raising=False)


def _as_admin(inst_db, monkeypatch, org_id="school-1"):
    _login_as(inst_db, _user_row(account_type="institution_admin"))
    _org_is(monkeypatch, org_id)


class TestAccessControl:
    @pytest.mark.parametrize("leaf", LEAVES)
    def test_student_is_refused(self, client, auth_header, inst_db, monkeypatch, leaf):
        _login_as(inst_db, _user_row(account_type="student"))
        _org_is(monkeypatch, "school-1")
        r = client.get(f"/api/institutions/me/{leaf}", headers=auth_header)
        assert r.status_code == 403, f"{leaf} allowed a student: {r.status_code}"

    @pytest.mark.parametrize("leaf", LEAVES)
    def test_admin_is_allowed(self, client, auth_header, inst_db, monkeypatch, leaf):
        _as_admin(inst_db, monkeypatch)
        r = client.get(f"/api/institutions/me/{leaf}", headers=auth_header)
        assert r.status_code == 200, f"{leaf} refused an admin: {r.text}"

    @pytest.mark.parametrize("leaf", LEAVES)
    def test_educator_is_allowed(self, client, auth_header, inst_db, monkeypatch, leaf):
        """Educators are institution staff too — require_admin covers both."""
        _login_as(inst_db, _user_row(account_type="educator"))
        _org_is(monkeypatch, "school-1")
        r = client.get(f"/api/institutions/me/{leaf}", headers=auth_header)
        assert r.status_code == 200, f"{leaf} refused an educator: {r.text}"

    @pytest.mark.parametrize("leaf", LEAVES)
    def test_another_institutions_id_is_refused(
        self, client, auth_header, inst_db, monkeypatch, leaf
    ):
        _as_admin(inst_db, monkeypatch, org_id="school-1")
        r = client.get(f"/api/institutions/school-999/{leaf}", headers=auth_header)
        assert r.status_code == 403, f"{leaf} served another institution's id"

    @pytest.mark.parametrize("leaf", LEAVES)
    def test_own_id_is_accepted(self, client, auth_header, inst_db, monkeypatch, leaf):
        _as_admin(inst_db, monkeypatch, org_id="school-1")
        r = client.get(f"/api/institutions/school-1/{leaf}", headers=auth_header)
        assert r.status_code == 200, r.text

    @pytest.mark.parametrize("leaf", LEAVES)
    def test_admin_with_no_org_cannot_probe_ids(
        self, client, auth_header, inst_db, monkeypatch, leaf
    ):
        """An admin with no membership must not walk ids looking for one that
        answers."""
        _as_admin(inst_db, monkeypatch, org_id=None)
        r = client.get(f"/api/institutions/school-1/{leaf}", headers=auth_header)
        assert r.status_code == 403, r.text


class TestDomainReachShape:
    AUDIT_KEYS = {
        "institutionId",
        "programmeCount",
        "totalDomains",
        "directDomains",
        "functionalDomains",
        "adjacentDomains",
        "unreachedDomains",
        "domainUniverse",
        "nationalRank",
        "totalInstitutions",
        "programmeBreakdown",
        "unreachedByCluster",
    }

    def test_payload_carries_every_audit_field(
        self, client, auth_header, inst_db, monkeypatch
    ):
        _as_admin(inst_db, monkeypatch)
        r = client.get("/api/institutions/me/domain-reach", headers=auth_header)
        assert r.status_code == 200, r.text
        data = r.json()["data"]
        assert self.AUDIT_KEYS <= set(data), self.AUDIT_KEYS - set(data)
        assert isinstance(data["programmeBreakdown"], list)
        assert isinstance(data["unreachedByCluster"], list)

    def test_reports_the_resolved_org_not_the_url(
        self, client, auth_header, inst_db, monkeypatch
    ):
        """`institutionId` must be the caller's resolved school, never the
        literal 'me' from the URL."""
        _as_admin(inst_db, monkeypatch, org_id="school-1")
        r = client.get("/api/institutions/me/domain-reach", headers=auth_header)
        assert r.json()["data"]["institutionId"] == "school-1"

    def test_no_data_is_zeroed_and_unknown_rank_is_none(
        self, client, auth_header, inst_db, monkeypatch
    ):
        """House rule: absent data is zeros/None plus a message, never an
        invented count or a fabricated #1 ranking."""
        _as_admin(inst_db, monkeypatch)
        r = client.get("/api/institutions/me/domain-reach", headers=auth_header)
        data = r.json()["data"]
        assert data["totalDomains"] == 0
        assert data["directDomains"] == 0
        assert data["programmeCount"] == 0
        assert data["nationalRank"] is None
        assert data["totalInstitutions"] is None
        assert r.json()["message"], "a zeroed audit must explain itself"

    def test_breakdown_rows_have_the_four_counts(
        self, client, auth_header, inst_db, monkeypatch
    ):
        import routes.institutions_routes as ir

        monkeypatch.setattr(
            ir, "_school_programmes",
            lambda _user, cap=100: [
                {"id": "p1", "name": "Computer Science"},
                {"id": "p2", "name": "Law"},
            ],
            raising=False,
        )
        monkeypatch.setattr(
            ir, "_programme_domain_rows",
            lambda ids, cap=4000: [
                {"programme_id": "p1", "domain_id": "d1", "match_type": "direct"},
                {"programme_id": "p1", "domain_id": "d2", "match_type": "functional"},
                {"programme_id": "p2", "domain_id": "d2", "match_type": "adjacent"},
            ],
            raising=False,
        )
        monkeypatch.setattr(
            ir, "_all_domains",
            lambda cap=1000: [
                {"id": "d1", "domain_key": "D001", "name": "Software", "cluster": "Tech"},
                {"id": "d2", "domain_key": "D002", "name": "Legal", "cluster": "Law"},
                {"id": "d3", "domain_key": "D003", "name": "Nursing", "cluster": "Health"},
            ],
            raising=False,
        )
        _as_admin(inst_db, monkeypatch)
        r = client.get("/api/institutions/me/domain-reach", headers=auth_header)
        data = r.json()["data"]
        assert data["programmeCount"] == 2
        assert data["totalDomains"] == 2
        assert data["directDomains"] == 1
        assert data["functionalDomains"] == 1
        assert data["adjacentDomains"] == 1
        assert data["domainUniverse"] == 3
        assert data["unreachedDomains"] == 1
        rows = {row["programmeName"]: row for row in data["programmeBreakdown"]}
        assert rows["Computer Science"]["total"] == 2
        assert rows["Computer Science"]["direct"] == 1
        assert rows["Law"]["adjacent"] == 1
        clusters = {c["cluster"]: c for c in data["unreachedByCluster"]}
        assert list(clusters) == ["Health"]
        assert clusters["Health"]["domains"][0]["domainKey"] == "D003"


class TestLeaderboard:
    def test_returns_a_list(self, client, auth_header, inst_db, monkeypatch):
        _as_admin(inst_db, monkeypatch)
        r = client.get(
            "/api/institutions/me/domain-reach/leaderboard", headers=auth_header
        )
        assert r.status_code == 200, r.text
        assert isinstance(r.json()["data"], list)

    def test_rows_carry_rank_and_the_reach_split(
        self, client, auth_header, inst_db, monkeypatch
    ):
        import routes.institutions_routes as ir

        monkeypatch.setattr(
            ir, "_national_reach_index",
            lambda: (
                {
                    "school-1": {
                        "direct": {"d1"}, "functional": set(),
                        "adjacent": set(), "all": {"d1"},
                    },
                    "school-2": {
                        "direct": {"d1"}, "functional": {"d2"},
                        "adjacent": set(), "all": {"d1", "d2"},
                    },
                },
                {
                    "school-1": {"id": "school-1", "name": "Alpha University",
                                 "institution_type": "university"},
                    "school-2": {"id": "school-2", "name": "Beta University",
                                 "institution_type": "university"},
                },
            ),
            raising=False,
        )
        _as_admin(inst_db, monkeypatch, org_id="school-1")
        r = client.get(
            "/api/institutions/me/domain-reach/leaderboard", headers=auth_header
        )
        rows = r.json()["data"]
        assert [row["institutionName"] for row in rows] == [
            "Beta University", "Alpha University",
        ]
        assert [row["nationalRank"] for row in rows] == [1, 2]
        assert rows[1]["isSelf"] is True
        assert rows[0]["isSelf"] is False
        assert rows[0]["totalDomains"] == 2
        assert rows[0]["functionalDomains"] == 1
        # `control` and `state` are not recorded in the registry — they must be
        # reported as unknown, never inferred from the institution's name.
        assert rows[0]["control"] is None
        assert rows[0]["state"] is None

    @pytest.mark.parametrize("value", ["federal", "state", "private"])
    def test_control_filter_is_refused_honestly(
        self, client, auth_header, inst_db, monkeypatch, value
    ):
        """No ownership column exists, so the only honest answer is an empty
        list plus an explanation — not a name-guessed classification."""
        _as_admin(inst_db, monkeypatch)
        r = client.get(
            f"/api/institutions/me/domain-reach/leaderboard?filter={value}",
            headers=auth_header,
        )
        assert r.status_code == 200, r.text
        assert r.json()["data"] == []
        assert "not recorded" in r.json()["message"]

    def test_unknown_filter_is_rejected(
        self, client, auth_header, inst_db, monkeypatch
    ):
        _as_admin(inst_db, monkeypatch)
        r = client.get(
            "/api/institutions/me/domain-reach/leaderboard?filter=nonsense",
            headers=auth_header,
        )
        assert r.status_code == 422


class TestStudentIntelligenceIsAggregateOnly:
    ROLLUP_KEYS = {
        "totalAffiliated",
        "selfSignedUp",
        "provisionedByYou",
        "unclaimedCodes",
        "topDomains",
    }

    def test_payload_carries_every_rollup_field(
        self, client, auth_header, inst_db, monkeypatch
    ):
        _as_admin(inst_db, monkeypatch)
        r = client.get(
            "/api/institutions/me/student-intelligence", headers=auth_header
        )
        assert r.status_code == 200, r.text
        data = r.json()["data"]
        assert self.ROLLUP_KEYS <= set(data), self.ROLLUP_KEYS - set(data)
        assert isinstance(data["topDomains"], list)

    def test_no_individual_student_data_is_returned(
        self, client, auth_header, inst_db, monkeypatch
    ):
        """Even with a populated cohort the response must stay a rollup: no
        student ids, names, classes, claim codes or per-row list."""
        import routes.institutions_routes as ir

        students = [
            {"id": f"stu-{i}", "provenance": "self" if i < 4 else "provisioned",
             "chosen_direction": {"domain_key": "D001"},
             "username": "Ada Lovelace", "student_class": "SS2"}
            for i in range(6)
        ]

        class _Q:
            """Minimal query stub: records the table, answers the three reads
            student-intelligence performs."""

            def __init__(self, table):
                self.table_name = table

            def select(self, *_a, **_k):
                return self

            def eq(self, *_a, **_k):
                return self

            def is_(self, *_a, **_k):
                return self

            def in_(self, *_a, **_k):
                return self

            def limit(self, *_a, **_k):
                return self

            def execute(self):
                if self.table_name == "student_affiliations":
                    return MagicMock(
                        data=[{"student_id": s["id"]} for s in students]
                    )
                if self.table_name == "users":
                    return MagicMock(data=students)
                if self.table_name == "claim_codes":
                    return MagicMock(data=[{"id": "c1"}, {"id": "c2"}])
                if self.table_name == "domains":
                    return MagicMock(
                        data=[{"domain_key": "D001", "name": "Software Engineering"}]
                    )
                return MagicMock(data=[])

        class _Svc:
            def table(self, name):
                return _Q(name)

        monkeypatch.setattr(ir, "_svc", lambda: _Svc(), raising=False)
        _as_admin(inst_db, monkeypatch, org_id="school-1")

        r = client.get(
            "/api/institutions/me/student-intelligence", headers=auth_header
        )
        assert r.status_code == 200, r.text
        payload = r.json()
        data = payload["data"]

        assert data["totalAffiliated"] == 6
        assert data["selfSignedUp"] == 4
        assert data["provisionedByYou"] == 2
        assert data["unclaimedCodes"] == 2
        assert data["belowThreshold"] is False
        assert data["topDomains"] == [
            {"domainKey": "D001", "label": "Software Engineering", "pct": 100.0}
        ]

        # Structural check: nothing student-identifying anywhere in the body.
        body = r.text
        for leak in ("stu-0", "stu-5", "Ada Lovelace", "SS2", "students", "userId"):
            assert leak not in body, f"individual student data leaked: {leak!r}"
        forbidden = {
            "students", "roster", "userId", "fullName", "studentClass",
            "claimState", "claimCode", "phone", "email",
        }
        assert not (forbidden & set(data)), forbidden & set(data)

    def test_small_cohort_suppresses_the_domain_mix(
        self, client, auth_header, inst_db, monkeypatch
    ):
        """Below the k-anonymity threshold the per-domain mix would point at
        named individuals, so it is withheld."""
        import routes.institutions_routes as ir

        students = [
            {"id": "stu-a", "provenance": "self",
             "chosen_direction": {"domain_key": "D001"}},
            {"id": "stu-b", "provenance": "provisioned",
             "chosen_direction": {"domain_key": "D002"}},
        ]

        class _Q:
            def __init__(self, table):
                self.table_name = table

            def select(self, *_a, **_k):
                return self

            def eq(self, *_a, **_k):
                return self

            def is_(self, *_a, **_k):
                return self

            def in_(self, *_a, **_k):
                return self

            def limit(self, *_a, **_k):
                return self

            def execute(self):
                if self.table_name == "student_affiliations":
                    return MagicMock(
                        data=[{"student_id": s["id"]} for s in students]
                    )
                if self.table_name == "users":
                    return MagicMock(data=students)
                return MagicMock(data=[])

        class _Svc:
            def table(self, name):
                return _Q(name)

        monkeypatch.setattr(ir, "_svc", lambda: _Svc(), raising=False)
        _as_admin(inst_db, monkeypatch, org_id="school-1")

        r = client.get(
            "/api/institutions/me/student-intelligence", headers=auth_header
        )
        data = r.json()["data"]
        assert data["totalAffiliated"] == 2
        assert data["belowThreshold"] is True
        assert data["topDomains"] == []
        assert "suppressed" in r.json()["message"]

    def test_empty_cohort_is_zeroed_with_a_message(
        self, client, auth_header, inst_db, monkeypatch
    ):
        _as_admin(inst_db, monkeypatch)
        r = client.get(
            "/api/institutions/me/student-intelligence", headers=auth_header
        )
        data = r.json()["data"]
        assert data["totalAffiliated"] == 0
        assert data["selfSignedUp"] == 0
        assert data["provisionedByYou"] == 0
        assert data["topDomains"] == []
        assert r.json()["message"]

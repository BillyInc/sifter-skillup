# ============================================================
# Sifter LevelUp — Institutional / Administrator Routes
#
# SCAFFOLDING for the institutional (educator / institution-admin)
# side. NO institutional data exists yet — every endpoint returns a
# well-typed EMPTY / "coming_soon" response. NOTHING is fabricated:
# lists come back empty, the summary comes back zeroed-but-honest,
# and a `data_status: "coming_soon"` flag tells the client the
# underlying market data has not been ingested.
#
# When institutional ingestion lands, only these method bodies change
# (they start reading skillup_dev.organizations / market tables) — the
# paths, query params and field names already mirror src/types/institution.ts
# (the canonical frontend contract) so the UI needs no changes.
#
# PRIVACY MODEL (enforced here and in institutions-schema.sql):
#   - Institutional Intelligence is AGGREGATE only. No student PII is
#     ever returned by any endpoint in this module.
#   - There is INTENTIONALLY no endpoint that returns an individual
#     student roster. Individual visibility is consent-gated and stays
#     gated (aggregate-only until a guardian consent is recorded).
#   - Affiliation counts are k-anonymised: suppressed below threshold.
#
# Endpoints (all auth-protected via Auth.get_current_user), prefix /api/institutions:
#   GET  /me                              — current educator's Organization
#   POST /verify                          — accept a verification claim (status -> pending/claimed)
#   GET  /{institution_id}/summary        — InstitutionSummary
#   GET  /{institution_id}/programme-demand   — list[ProgrammeDemandRow]
#   GET  /{institution_id}/domain-ranking?scope=nigerian|global|remote — list[DomainRankItem]
#   GET  /{institution_id}/alerts         — list[IntelligenceAlert]
#   GET  /{institution_id}/skills-gap     — list[SkillGapRow]
#   GET  /{institution_id}/role-demand    — list[RoleDemandRow]
#   GET  /{institution_id}/peers          — list[PeerInstitutionRow]
#   GET  /{institution_id}/affiliation    — AffiliationStats (aggregate, k-anonymised)
# ============================================================
from typing import List, Literal, Optional

from fastapi import APIRouter, Body, Depends
from pydantic import BaseModel, ConfigDict, Field

from auth import Auth
from database import db
from logger import log
from models import ResponseModel

router = APIRouter(prefix="/api/institutions", tags=["institutions"])

_SCHEMA = "skillup_dev"
_K_ANON_THRESHOLD = 5
_SPARKLINE_BUCKETS = 6


# ─────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────

def _svc():
    return db.get_service_client().schema(_SCHEMA)


def _resolve_org(current_user: dict) -> Optional[str]:
    """Return the school id the current user administers, or None.

    Resolves via institution_members (educator/institution_admin → school). The
    name is kept as _resolve_org for call-site stability, but the identity it
    returns is a skillup_dev.schools id.
    """
    try:
        res = _svc().table("institution_members").select("school_id").eq(
            "user_id", current_user["id"]
        ).limit(1).execute()
        if res.data:
            return res.data[0]["school_id"]
    except Exception as exc:
        log.warning("institutions: school membership lookup skipped", error=str(exc))
    return None


def _institution_programme_ids(school_id: Optional[str]) -> Optional[list]:
    """CCMAS programme ids reachable from a school, or None for the all-programmes
    fallback.

    Chain: school → school_programmes (jamb_programme_id) → programme_mapping
    (jamb_programme_id → CCMAS programme_id) → programmes. The domain links
    (programme_domain) hang off the CCMAS programme, so this is the join that
    turns "the school's offered programmes" into "the CCMAS programmes that
    carry domain data".
    """
    if not school_id:
        return None
    try:
        svc = _svc()
        sp = (
            svc.table("school_programmes")
            .select("jamb_programme_id")
            .eq("school_id", school_id)
            .limit(2000)
            .execute()
        )
        jamb_ids = [r["jamb_programme_id"] for r in (sp.data or []) if r.get("jamb_programme_id")]
        if not jamb_ids:
            return None
        pm = (
            svc.table("programme_mapping")
            .select("programme_id")
            .in_("jamb_programme_id", jamb_ids)
            .limit(2000)
            .execute()
        )
        prog_ids = list({r["programme_id"] for r in (pm.data or []) if r.get("programme_id")})
        return prog_ids or None
    except Exception as exc:
        log.warning("institutions: school→CCMAS programme join skipped", error=str(exc))
        return None


def _latest_demand(domain_id: str, rank_lens: str) -> dict:
    """Latest populated demand row for (domain, lens); {} when none ingested."""
    try:
        res = _svc().table("domain_demand_metrics").select(
            "postings_count, postings_yoy, remote_pct, "
            "entry_salary_local_ngn, entry_salary_remote_usd, "
            "top_employers, top_certs, plain_label, month"
        ).eq("domain_id", domain_id).eq("rank_lens", rank_lens).order(
            "month", desc=True
        ).limit(1).execute()
        return (res.data or [{}])[0]
    except Exception as exc:
        log.warning("institutions: demand read skipped", error=str(exc))
        return {}


def _demand_series(domain_id: str, rank_lens: str, buckets: int = _SPARKLINE_BUCKETS) -> List[float]:
    """Last N monthly postings counts (oldest first) for a sparkline; [] if none."""
    try:
        res = _svc().table("domain_demand_metrics").select(
            "postings_count, month"
        ).eq("domain_id", domain_id).eq("rank_lens", rank_lens).order(
            "month", desc=True
        ).limit(buckets).execute()
        pts = [float((r.get("postings_count") or 0)) for r in (res.data or [])]
        pts.reverse()
        return pts
    except Exception:
        return []


def _trend_from_series(series: List[float]) -> tuple:
    """Derive (trendPct, trendDirection) from a sparkline; (None, 'flat') if
    insufficient points. Never invents."""
    if len(series) < 2 or not series[-1]:
        return None, "flat"
    prev = series[-2] or 0
    cur = series[-1] or 0
    if prev == 0:
        return (None, "up" if cur > 0 else "flat")
    pct = round(((cur - prev) / prev) * 100.0, 2)
    direction = "up" if pct > 0 else "down" if pct < 0 else "flat"
    return pct, direction


def _domain_map(domain_ids: list) -> dict:
    """id -> {domain_key, name, cluster} for a list of domain ids."""
    if not domain_ids:
        return {}
    res = _svc().table("domains").select("id, domain_key, name, cluster").in_(
        "id", list(set(domain_ids))
    ).execute()
    return {d["id"]: d for d in (res.data or [])}


def _school_programmes(institution_id: str, current_user: dict, cap: int = 100) -> list:
    """Programme rows for the current admin's institution.

    Resolves via org membership; when that's unavailable (no org row yet) falls
    back to a bounded ALL-programmes sample so the endpoint still demonstrates
    real taxonomy structure rather than an empty list.
    """
    svc = _svc()
    org_id = _resolve_org(current_user)
    prog_ids = _institution_programme_ids(org_id)
    try:
        query = svc.table("programmes").select("id, name, discipline, qualification")
        if prog_ids:
            query = query.in_("id", prog_ids)
        return (query.limit(cap).execute().data) or []
    except Exception as exc:  # noqa: BLE001
        log.warning("institutions: school programmes read skipped", error=str(exc))
        return []


def _programme_domain_rows(programme_ids: list, cap: int = 4000) -> list:
    """programme_domain rows for a set of programmes (bounded)."""
    if not programme_ids:
        return []
    try:
        return (
            _svc()
            .table("programme_domain")
            .select("programme_id, domain_id, match_type, in_demand_score, elite_flag")
            .in_("programme_id", programme_ids)
            .limit(cap)
            .execute()
            .data
        ) or []
    except Exception as exc:  # noqa: BLE001
        log.warning("institutions: programme_domain read skipped", error=str(exc))
        return []


# ─────────────────────────────────────────────────────────────
# Pydantic v2 response models — field-compatible with
# src/types/institution.ts (snake_case; names kept obvious).
# ─────────────────────────────────────────────────────────────

class Organization(BaseModel):
    id: str
    type: str  # secondary_school | university | tutorial_centre | jamb_cafe
    name: str
    jamb_code: Optional[str] = None
    nuc_code: Optional[str] = None
    moe_approval_no: Optional[str] = None
    cac_no: Optional[str] = None
    state: Optional[str] = None
    school_code: Optional[str] = None
    verification_status: str = "unverified"  # unverified|claimed|pending|verified|rejected
    verification_method: Optional[str] = None
    # True for tutorial_centre/jamb_cafe: provider/session only, never a roster.
    provider_session_only: bool = False


class VerificationClaim(BaseModel):
    """Payload mirroring EducatorProfile from institution.ts."""
    account_type: Optional[str] = None  # educator | institution_admin
    organization_type: Optional[str] = None
    organization_name: Optional[str] = None
    organization_id: Optional[str] = None
    role: Optional[str] = None
    work_email: Optional[str] = None
    registry_code: Optional[str] = None
    provider_session_only: bool = False
    verification_method: Optional[str] = None


class InstitutionSummary(BaseModel):
    institution_name: str
    institution_code: str
    active_programmes: int = 0
    faculty_count: Optional[int] = None
    domains_accessible: int = 0
    domains_delta: Optional[int] = None
    ng_postings_per_month: int = 0
    ng_postings_yoy_pct: Optional[float] = None
    skills_gaps_flagged: int = 0
    skills_gap_programmes: Optional[int] = None
    remote_eligible_pct: float = 0
    remote_eligible_prev_pct: Optional[float] = None
    data_as_of: Optional[str] = None
    # Honest scaffolding flag: numbers above are zeroed, not real, until ingestion.
    data_status: Literal["coming_soon"] = "coming_soon"


class ProgrammeDomainBadge(BaseModel):
    domain_id: str
    short_label: str
    match_type: str  # direct | functional | adjacent


class DemandSkill(BaseModel):
    name: str
    in_curriculum: bool
    note: Optional[str] = None


class ProgrammeDemandDetail(BaseModel):
    top_skills: List[DemandSkill] = Field(default_factory=list)
    top_certifications: List[DemandSkill] = Field(default_factory=list)
    top_employers: List[str] = Field(default_factory=list)


class ProgrammeDemandRow(BaseModel):
    id: str
    programme_name: str
    jamb_name: str
    qualification: Optional[str] = None
    mapping_source: str  # ccmas | custom
    domains: List[ProgrammeDomainBadge] = Field(default_factory=list)
    domain_overflow: Optional[int] = None
    ng_postings_per_month: int = 0
    sparkline: Optional[List[float]] = None
    trend_pct: Optional[float] = None
    trend_direction: Optional[str] = None  # up | down | flat
    entry_salary_min: Optional[int] = None
    entry_salary_max: Optional[int] = None
    skills_gap_count: int = 0
    detail: Optional[ProgrammeDemandDetail] = None


class DomainRankItem(BaseModel):
    rank: int
    domain_id: str
    domain_name: str
    route_note: Optional[str] = None
    postings_per_month: int = 0
    bar_ratio: Optional[float] = None
    trend_pct: Optional[float] = None
    trend_direction: Optional[str] = None


class IntelligenceAlert(BaseModel):
    id: str
    severity: str  # info | opportunity | warning | critical
    title: str
    body: str


class SkillGapRow(BaseModel):
    programme_name: str
    domain_name: str
    skill: str
    demand_pct: Optional[float] = None
    in_curriculum: bool = False


class RoleDemandRow(BaseModel):
    role_id: str
    role_name: str
    domain_name: Optional[str] = None
    ng_postings: Optional[int] = None
    global_postings: Optional[int] = None
    remote_pct: Optional[float] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    trend_pct: Optional[float] = None


class PeerInstitutionRow(BaseModel):
    institution_name: str
    domains_accessible: int = 0
    unique_domains: Optional[List[str]] = None


class AffiliationStats(BaseModel):
    organization_id: str
    # Self-reported affiliations; suppressed below the k-anonymity threshold.
    affiliated_students: Optional[int] = None
    below_threshold: bool = True
    school_code: str


class NationalBenchmarkRow(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="ignore")
    metric: str
    label: str
    myValue: Optional[float] = Field(default=None, alias="my_value")
    nationalAvg: Optional[float] = Field(default=None, alias="national_avg")
    unit: Optional[str] = None
    direction: Optional[Literal["up", "down", "flat"]] = None


# ─────────────────────────────────────────────────────────────
# Institution context (educator-owned)
# ─────────────────────────────────────────────────────────────

@router.get("/me", response_model=ResponseModel)
async def get_my_organization(current_user: dict = Depends(Auth.get_current_user)):
    """The current educator's organisation.

    Scaffolding: no organisations exist yet, so this returns data=None with a
    coming_soon notice. Returns 200 (not 404) so the client can branch cleanly.
    """
    # TODO(institutions): read skillup_dev.organization_members + organizations
    log.info("Institution /me (stub)", user_id=current_user["id"])
    return ResponseModel(
        data=None,
        message="Your institution profile comes online with the institutional rollout.",
    )


@router.post("/verify", response_model=ResponseModel)
async def submit_verification(
    claim: VerificationClaim = Body(default_factory=VerificationClaim),
    current_user: dict = Depends(Auth.get_current_user),
):
    """Accept a verification claim payload.

    Scaffolding: no real review pipeline yet. We echo back an Organization with
    status 'claimed' (or 'pending' if a verification method was supplied). No
    write is performed — this just acknowledges the claim shape.
    """
    # TODO(institutions): persist claim to skillup_dev.organizations and queue review
    log.info("Institution verify claim (stub)", user_id=current_user["id"])
    status = "pending" if claim.verification_method else "claimed"
    org = Organization(
        id="",  # assigned once a real record is created
        type=claim.organization_type or "university",
        name=claim.organization_name or "",
        school_code=None,
        verification_status=status,
        verification_method=claim.verification_method,
        provider_session_only=claim.provider_session_only,
    )
    return ResponseModel(
        data=org.model_dump(),
        message="Verification review comes online with the institutional rollout.",
    )


# ─────────────────────────────────────────────────────────────
# Aggregate intelligence (AGGREGATE ONLY — no student PII)
# Each GET reads from Supabase when data exists; until then it
# returns empty collections / a zeroed-but-honest summary. No
# demand numbers are invented.
# ─────────────────────────────────────────────────────────────

@router.get("/{institution_id}/summary", response_model=ResponseModel)
async def get_institution_summary(
    institution_id: str,
    current_user: dict = Depends(Auth.get_current_user),
):
    """InstitutionSummary — the boardroom stat cards.

    Programme + domain counts are REAL (from the taxonomy); demand/salary/gap
    numbers stay zeroed with data_status='coming_soon' until ingestion.
    """
    try:
        programmes = _school_programmes(institution_id, current_user, cap=1000)
        prog_ids = [p["id"] for p in programmes]
        pd_rows = _programme_domain_rows(prog_ids)
        domains_accessible = len({r["domain_id"] for r in pd_rows})
        summary = InstitutionSummary(
            institution_name="",
            institution_code=institution_id,
            active_programmes=len(programmes),
            domains_accessible=domains_accessible,
        )
        return ResponseModel(data=summary.model_dump())
    except Exception as exc:  # noqa: BLE001
        log.error("institutions summary failed", error=str(exc))
        summary = InstitutionSummary(institution_name="", institution_code=institution_id)
        return ResponseModel(data=summary.model_dump())


@router.get("/{institution_id}/programme-demand", response_model=ResponseModel)
async def get_programme_demand(
    institution_id: str,
    discipline: Optional[str] = None,
    has_gaps: Optional[bool] = None,
    high_demand: Optional[bool] = None,
    custom_mapping: Optional[bool] = None,
    query: Optional[str] = None,
    current_user: dict = Depends(Auth.get_current_user),
):
    """list[ProgrammeDemandRow] — real programme→domain structure; demand fields
    stay 0/None until ingestion (no fabricated numbers)."""
    try:
        programmes = _school_programmes(institution_id, current_user, cap=100)
        if discipline:
            programmes = [p for p in programmes if (p.get("discipline") or "") == discipline]
        if query:
            ql = query.lower()
            programmes = [p for p in programmes if ql in (p.get("name") or "").lower()]
        prog_ids = [p["id"] for p in programmes]
        pd_rows = _programme_domain_rows(prog_ids)
        dmap = _domain_map([r["domain_id"] for r in pd_rows])
        by_prog: dict = {}
        for r in pd_rows:
            by_prog.setdefault(r["programme_id"], []).append(r)

        rows: List[ProgrammeDemandRow] = []
        for p in programmes:
            links = by_prog.get(p["id"], [])
            badges = [
                ProgrammeDomainBadge(
                    domain_id=(dmap.get(link["domain_id"], {}).get("domain_key") or link["domain_id"]),
                    short_label=(dmap.get(link["domain_id"], {}).get("name") or "—"),
                    match_type=link.get("match_type") or "adjacent",
                )
                for link in links[:6]
            ]
            rows.append(
                ProgrammeDemandRow(
                    id=p["id"],
                    programme_name=p.get("name") or "",
                    jamb_name=p.get("name") or "",
                    qualification=p.get("qualification"),
                    mapping_source="ccmas",
                    domains=badges,
                    domain_overflow=(len(links) - 6) if len(links) > 6 else None,
                )
            )
        return ResponseModel(data=[r.model_dump() for r in rows])
    except Exception as exc:  # noqa: BLE001
        log.error("institutions programme_demand failed", error=str(exc))
        return ResponseModel(data=[])


@router.get("/{institution_id}/domain-ranking", response_model=ResponseModel)
async def get_domain_ranking(
    institution_id: str,
    scope: Literal["nigerian", "global", "remote"] = "nigerian",
    current_user: dict = Depends(Auth.get_current_user),
):
    """list[DomainRankItem] — ranked by a structural PROXY (how many of the
    school's programmes feed each domain), since posting volume isn't ingested.
    postings_per_month stays 0; bar_ratio comes from the feeder count."""
    try:
        programmes = _school_programmes(institution_id, current_user, cap=1000)
        prog_ids = [p["id"] for p in programmes]
        pd_rows = _programme_domain_rows(prog_ids)
        # Feeder count + best in_demand_score per domain.
        feeders: dict = {}
        demand: dict = {}
        for r in pd_rows:
            did = r["domain_id"]
            feeders[did] = feeders.get(did, 0) + 1
            score = r.get("in_demand_score")
            if score is not None:
                try:
                    demand[did] = max(demand.get(did, 0.0), float(score))
                except (TypeError, ValueError):
                    pass
        if not feeders:
            return ResponseModel(data=[])
        dmap = _domain_map(list(feeders.keys()))
        max_feeders = max(feeders.values())
        ranked = sorted(
            feeders.items(),
            key=lambda kv: (kv[1], demand.get(kv[0], 0.0)),
            reverse=True,
        )[:50]
        rows = [
            DomainRankItem(
                rank=i + 1,
                domain_id=(dmap.get(did, {}).get("domain_key") or did),
                domain_name=(dmap.get(did, {}).get("name") or "—"),
                route_note=f"{n} programme(s) feed this domain",
                postings_per_month=0,
                bar_ratio=round(n / max_feeders, 3) if max_feeders else None,
            )
            for i, (did, n) in enumerate(ranked)
        ]
        return ResponseModel(data=[r.model_dump() for r in rows])
    except Exception as exc:  # noqa: BLE001
        log.error("institutions domain_ranking failed", error=str(exc))
        return ResponseModel(data=[])


@router.get("/{institution_id}/alerts", response_model=ResponseModel)
async def get_alerts(
    institution_id: str,
    current_user: dict = Depends(Auth.get_current_user),
):
    """list[IntelligenceAlert] — empty until ingestion."""
    # TODO(institutions): surface gaps / drift / opportunity signals
    rows: List[IntelligenceAlert] = []
    return ResponseModel(data=[r.model_dump() for r in rows])


@router.get("/{institution_id}/skills-gap", response_model=ResponseModel)
async def get_skills_gap(
    institution_id: str,
    current_user: dict = Depends(Auth.get_current_user),
):
    """list[SkillGapRow] — the top foundation skills of each programme's direct/
    functional domains. in_curriculum stays False (the programmes table carries
    no skills column to verify coverage against); demand_pct None until ingest."""
    try:
        programmes = _school_programmes(institution_id, current_user, cap=60)
        prog_ids = [p["id"] for p in programmes]
        pd_rows = [
            r for r in _programme_domain_rows(prog_ids)
            if r.get("match_type") in ("direct", "functional")
        ]
        prog_by_id = {p["id"]: p for p in programmes}
        domain_ids = list({r["domain_id"] for r in pd_rows})
        # Fetch foundation_skills for the involved domains.
        dfound: dict = {}
        if domain_ids:
            dres = (
                _svc()
                .table("domains")
                .select("id, name, foundation_skills")
                .in_("id", domain_ids)
                .execute()
            )
            dfound = {d["id"]: d for d in (dres.data or [])}

        rows: List[SkillGapRow] = []
        for r in pd_rows:
            if len(rows) >= 100:
                break
            prog = prog_by_id.get(r["programme_id"])
            dom = dfound.get(r["domain_id"])
            if not prog or not dom:
                continue
            for s in (dom.get("foundation_skills") or [])[:5]:
                skill_name = s.get("skill") if isinstance(s, dict) else str(s)
                if not skill_name:
                    continue
                rows.append(
                    SkillGapRow(
                        programme_name=prog.get("name") or "",
                        domain_name=dom.get("name") or "",
                        skill=skill_name,
                        demand_pct=None,
                        in_curriculum=False,
                    )
                )
                if len(rows) >= 100:
                    break
        return ResponseModel(data=[r.model_dump() for r in rows])
    except Exception as exc:  # noqa: BLE001
        log.error("institutions skills_gap failed", error=str(exc))
        return ResponseModel(data=[])


@router.get("/{institution_id}/role-demand", response_model=ResponseModel)
async def get_role_demand(
    institution_id: str,
    current_user: dict = Depends(Auth.get_current_user),
):
    """list[RoleDemandRow] — roles reachable from the school's domains. Demand
    and salary fields stay None until ingestion (no fabricated numbers)."""
    try:
        programmes = _school_programmes(institution_id, current_user, cap=1000)
        prog_ids = [p["id"] for p in programmes]
        pd_rows = _programme_domain_rows(prog_ids)
        domain_ids = list({r["domain_id"] for r in pd_rows})
        if not domain_ids:
            return ResponseModel(data=[])
        dmap = _domain_map(domain_ids)
        rres = (
            _svc()
            .table("domain_roles")
            .select("role_key, role_name, domain_id")
            .in_("domain_id", domain_ids)
            .limit(200)
            .execute()
        )
        rows = [
            RoleDemandRow(
                role_id=r.get("role_key") or "",
                role_name=r.get("role_name") or "",
                domain_name=(dmap.get(r.get("domain_id"), {}).get("name")),
            )
            for r in (rres.data or [])
        ]
        return ResponseModel(data=[r.model_dump() for r in rows])
    except Exception as exc:  # noqa: BLE001
        log.error("institutions role_demand failed", error=str(exc))
        return ResponseModel(data=[])


@router.get("/{institution_id}/peers", response_model=ResponseModel)
async def get_peers(
    institution_id: str,
    current_user: dict = Depends(Auth.get_current_user),
):
    """list[PeerInstitutionRow] — empty until ingestion."""
    # TODO(institutions): peer-institution domain-coverage comparison
    rows: List[PeerInstitutionRow] = []
    return ResponseModel(data=[r.model_dump() for r in rows])


# ─────────────────────────────────────────────────────────────
# Affiliation (aggregate attribution, self-reported, k-anonymised)
# NOTE: this exposes a COUNT only. No individual student rows are
# ever returned — by design there is no roster endpoint.
# ─────────────────────────────────────────────────────────────

@router.get("/{institution_id}/affiliation", response_model=ResponseModel)
async def get_affiliation_stats(
    institution_id: str,
    current_user: dict = Depends(Auth.get_current_user),
):
    """AffiliationStats — aggregate, k-anonymised.

    Until ingestion: affiliated_students=None + below_threshold=True placeholder.
    No individual student data is exposed here or anywhere in this module.
    """
    # TODO(institutions): COUNT self-reported affiliations, suppress below k
    stats = AffiliationStats(
        organization_id=institution_id,
        affiliated_students=None,
        below_threshold=True,
        school_code="",
    )
    return ResponseModel(data=stats.model_dump())


# ─────────────────────────────────────────────────────────────
# Vs National — institution aggregate vs national benchmark
# ─────────────────────────────────────────────────────────────

_RANK_LENS = {
    "nigerian": "ng_local",
    "global": "global",
    "remote": "ng_remote",
}


@router.get("/me/vs-national", response_model=ResponseModel)
async def get_vs_national(
    scope: Literal["nigerian", "global", "remote"] = "nigerian",
    current_user: dict = Depends(Auth.get_current_user),
):
    """NationalBenchmarkRow rows — institution vs national aggregate.

    Computes three comparisons (postings per month, entry salary, remote %)
    across the institution's reachable domains vs the national average for
    the given scope. Returns empty rows with a notice when no demand data
    has been ingested — never fabricated.
    """
    try:
        org_id = _resolve_org(current_user)
        rank_lens = _RANK_LENS[scope]

        # Resolve the institution's reachable domain ids.
        reachable_domain_ids: list = []
        if org_id:
            prog_ids = _institution_programme_ids(org_id) or []
            if prog_ids:
                pd = _svc().table("programme_domain").select("domain_id").in_(
                    "programme_id", prog_ids
                ).execute().data or []
                reachable_domain_ids = list({x["domain_id"] for x in pd})

        if not reachable_domain_ids:
            return ResponseModel(
                data=[
                    NationalBenchmarkRow(
                        metric="postings_per_month",
                        label="Monthly Job Postings",
                        my_value=None,
                        national_avg=None,
                        unit="postings",
                        direction=None,
                    ).model_dump(by_alias=True),
                    NationalBenchmarkRow(
                        metric="salary_min",
                        label="Entry Salary (NGN)",
                        my_value=None,
                        national_avg=None,
                        unit=chr(8358),
                        direction=None,
                    ).model_dump(by_alias=True),
                    NationalBenchmarkRow(
                        metric="remote_pct",
                        label="Remote Eligible (%)",
                        my_value=None,
                        national_avg=None,
                        unit="%",
                        direction=None,
                    ).model_dump(by_alias=True),
                ],
                message="Link your institution's programmes to see how your demand coverage compares to the national aggregate.",
            )

        # Pull latest demand row per domain for the given scope, deduped.
        q = _svc().table("domain_demand_metrics").select(
            "domain_id, postings_count, entry_salary_local_ngn, "
            "entry_salary_remote_usd, remote_pct"
        ).eq("rank_lens", rank_lens).order("month", desc=True).limit(2000).execute()
        my_deduped: dict = {}
        for r in (q.data or []):
            did = r["domain_id"]
            if did in my_deduped:
                continue
            if did not in reachable_domain_ids:
                continue
            my_deduped[did] = r

        # Also pull the national aggregate (all domains, same scope + deduped).
        q_nat = _svc().table("domain_demand_metrics").select(
            "domain_id, postings_count, entry_salary_local_ngn, "
            "entry_salary_remote_usd, remote_pct"
        ).eq("rank_lens", rank_lens).order("month", desc=True).limit(2000).execute()
        nat_deduped: dict = {}
        for r in (q_nat.data or []):
            did = r["domain_id"]
            if did in nat_deduped:
                continue
            nat_deduped[did] = r

        if not my_deduped or not nat_deduped:
            return ResponseModel(
                data=[
                    NationalBenchmarkRow(
                        metric="postings_per_month",
                        label="Monthly Job Postings",
                        my_value=None,
                        national_avg=None,
                        unit="postings",
                        direction=None,
                    ).model_dump(by_alias=True),
                    NationalBenchmarkRow(
                        metric="salary_min",
                        label="Entry Salary (NGN)",
                        my_value=None,
                        national_avg=None,
                        unit=chr(8358),
                        direction=None,
                    ).model_dump(by_alias=True),
                    NationalBenchmarkRow(
                        metric="remote_pct",
                        label="Remote Eligible (%)",
                        my_value=None,
                        national_avg=None,
                        unit="%",
                        direction=None,
                    ).model_dump(by_alias=True),
                ],
                message="National benchmark data is being populated this month.",
            )

        # Compute benchmarks.
        # 1. Postings per month: sum of my domain postings vs national avg per domain
        my_postings_sum = sum(
            int(r.get("postings_count") or 0) for r in my_deduped.values()
        )
        nat_postings_sum = sum(
            int(r.get("postings_count") or 0) for r in nat_deduped.values()
        )
        nat_postings_avg = round(
            nat_postings_sum / len(nat_deduped), 1
        ) if nat_deduped else 0.0

        # 2. Salary min: average of entry salary (local NGN for nigerian/remote, USD for global)
        my_salaries = []
        for r in my_deduped.values():
            s = r.get("entry_salary_local_ngn" if scope in ("nigerian", "remote") else "entry_salary_remote_usd")
            if s is not None:
                my_salaries.append(float(s))
        my_salary_avg = round(sum(my_salaries) / len(my_salaries), 0) if my_salaries else None

        nat_salaries = []
        for r in nat_deduped.values():
            s = r.get("entry_salary_local_ngn" if scope in ("nigerian", "remote") else "entry_salary_remote_usd")
            if s is not None:
                nat_salaries.append(float(s))
        nat_salary_avg = round(sum(nat_salaries) / len(nat_salaries), 0) if nat_salaries else None

        # 3. Remote %: average remote_pct for my domains vs national average
        my_remote_pcts = [
            float(r.get("remote_pct") or 0) for r in my_deduped.values()
            if r.get("remote_pct") is not None
        ]
        my_remote_avg = round(
            sum(my_remote_pcts) / len(my_remote_pcts), 1
        ) if my_remote_pcts else None

        nat_remote_pcts = [
            float(r.get("remote_pct") or 0) for r in nat_deduped.values()
            if r.get("remote_pct") is not None
        ]
        nat_remote_avg = round(
            sum(nat_remote_pcts) / len(nat_remote_pcts), 1
        ) if nat_remote_pcts else None

        # Derive direction for each metric (my value vs national average).
        def _direction(my: Optional[float], nat: Optional[float]) -> Optional[Literal["up", "down", "flat"]]:
            if my is None or nat is None or nat == 0:
                return None
            ratio = (my - nat) / nat
            if ratio > 0.05:
                return "up"
            if ratio < -0.05:
                return "down"
            return "flat"

        salary_unit = "$" if scope == "global" else chr(8358)
        salary_label = "Entry Salary (USD)" if scope == "global" else "Entry Salary (NGN)"

        rows = [
            NationalBenchmarkRow(
                metric="postings_per_month",
                label="Monthly Job Postings",
                my_value=float(my_postings_sum),
                national_avg=nat_postings_avg,
                unit="postings",
                direction=_direction(float(my_postings_sum), nat_postings_avg),
            ).model_dump(by_alias=True),
            NationalBenchmarkRow(
                metric="salary_min",
                label=salary_label,
                my_value=my_salary_avg,
                national_avg=nat_salary_avg,
                unit=salary_unit,
                direction=_direction(my_salary_avg, nat_salary_avg),
            ).model_dump(by_alias=True),
            NationalBenchmarkRow(
                metric="remote_pct",
                label="Remote Eligible (%)",
                my_value=my_remote_avg,
                national_avg=nat_remote_avg,
                unit="%",
                direction=_direction(my_remote_avg, nat_remote_avg),
            ).model_dump(by_alias=True),
        ]
        return ResponseModel(data=rows)
    except Exception as exc:
        log.error("institutions /me/vs-national failed", error=str(exc))
        return ResponseModel(
            data=[
                NationalBenchmarkRow(
                    metric="postings_per_month",
                    label="Monthly Job Postings",
                    my_value=None, national_avg=None, unit="postings", direction=None,
                ).model_dump(by_alias=True),
                NationalBenchmarkRow(
                    metric="salary_min",
                    label="Entry Salary (NGN)",
                    my_value=None, national_avg=None, unit=chr(8358), direction=None,
                ).model_dump(by_alias=True),
                NationalBenchmarkRow(
                    metric="remote_pct",
                    label="Remote Eligible (%)",
                    my_value=None, national_avg=None, unit="%", direction=None,
                ).model_dump(by_alias=True),
            ],
            message="National benchmark is temporarily unavailable.",
        )

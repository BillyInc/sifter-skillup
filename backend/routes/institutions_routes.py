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
from pydantic import BaseModel, Field

from auth import Auth
from logger import log
from models import ResponseModel

router = APIRouter(prefix="/api/institutions", tags=["institutions"])


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

    Returns a zeroed-but-honest summary flagged data_status='coming_soon'.
    """
    # TODO(institutions): aggregate from market tables for this institution
    summary = InstitutionSummary(
        institution_name="",
        institution_code=institution_id,
    )
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
    """list[ProgrammeDemandRow] — empty until ingestion (no fabricated demand)."""
    # TODO(institutions): read programme x domain x demand rows
    rows: List[ProgrammeDemandRow] = []
    return ResponseModel(data=[r.model_dump() for r in rows])


@router.get("/{institution_id}/domain-ranking", response_model=ResponseModel)
async def get_domain_ranking(
    institution_id: str,
    scope: Literal["nigerian", "global", "remote"] = "nigerian",
    current_user: dict = Depends(Auth.get_current_user),
):
    """list[DomainRankItem] — empty until ingestion (no fabricated rankings)."""
    # TODO(institutions): rank domains by posting volume for the given scope
    rows: List[DomainRankItem] = []
    return ResponseModel(data=[r.model_dump() for r in rows])


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
    """list[SkillGapRow] — empty until ingestion."""
    # TODO(institutions): cross-programme skills-gap report
    rows: List[SkillGapRow] = []
    return ResponseModel(data=[r.model_dump() for r in rows])


@router.get("/{institution_id}/role-demand", response_model=ResponseModel)
async def get_role_demand(
    institution_id: str,
    current_user: dict = Depends(Auth.get_current_user),
):
    """list[RoleDemandRow] — empty until ingestion (no fabricated demand)."""
    # TODO(institutions): role-level demand ranking
    rows: List[RoleDemandRow] = []
    return ResponseModel(data=[r.model_dump() for r in rows])


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

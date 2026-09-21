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
#   GET  /{institution_id}/programme-skill-coverage — programme → domain → resource bridge
#   GET  /{institution_id}/skills-gap     — legacy demand-shaped compatibility route (empty)
#   GET  /{institution_id}/role-demand    — list[RoleDemandRow]
#   GET  /{institution_id}/peers          — list[PeerInstitutionRow]
#   GET  /{institution_id}/affiliation    — AffiliationStats (aggregate, k-anonymised)
#   GET  /{institution_id}/domain-reach   — DomainReachAudit (§5.1)
#   GET  /{institution_id}/domain-reach/leaderboard?filter=all|federal|state|private
#   GET  /{institution_id}/student-intelligence — StudentIntelligence rollup (§5.5)
# ============================================================
from datetime import datetime, timedelta, timezone
import hmac
import re
from uuid import uuid4
from typing import List, Literal, Optional

from fastapi import APIRouter, Body, Depends, File, Form, HTTPException, Query, UploadFile
from pydantic import BaseModel, ConfigDict, Field

from auth import Auth
from config import settings
from database import db
from logger import log
from models import ResponseModel

router = APIRouter(prefix="/api/institutions", tags=["institutions"])

_SCHEMA = "skillup_dev"
_K_ANON_THRESHOLD = 5
_SPARKLINE_BUCKETS = 6
_VERIFICATION_BUCKET = "verification-proofs"
_MAX_VERIFICATION_PROOF_BYTES = 10 * 1024 * 1024
_ALLOWED_VERIFICATION_TYPES = {
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
}

# The live rows are taxonomy-derived baselines, not source-backed labour-market
# ingestion. Keep demand-only institution views unavailable until that pipeline
# is explicitly approved and enabled.
_DEMAND_INGESTION_READY = False


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
    member = _membership_for_user(current_user)
    return (member or {}).get("school_id")


def _membership_for_user(current_user: dict) -> Optional[dict]:
    """Best institution_members row for the current user, or None.

    Prefer live, verified, newest memberships. Fall back for older schemas that
    may not yet have seat_status or verified columns.
    """
    try:
        res = (
            _svc()
            .table("institution_members")
            .select("*")
            .eq("user_id", current_user["id"])
            .neq("seat_status", "revoked")
            .order("verified", desc=True)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        if res.data:
            return res.data[0]
    except Exception as exc:
        log.warning("institutions: active membership lookup skipped", error=str(exc))
    try:
        res = (
            _svc()
            .table("institution_members")
            .select("*")
            .eq("user_id", current_user["id"])
            .order("verified", desc=True)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        return (res.data or [None])[0]
    except Exception as exc:
        log.warning("institutions: membership lookup skipped", error=str(exc))
        return None


def _can_invite_members(member: Optional[dict], current_user: dict) -> bool:
    role = (member or {}).get("role") or current_user.get("account_type")
    return role in {"owner", "institution_admin", "admin"}


def _org_from_school(school_id: str) -> Optional["Organization"]:
    try:
        row = (_svc().table("schools").select("*").eq("id", school_id).limit(1).execute().data or [None])[0]
        if not row:
            return None
        raw_type = row.get("institution_type") or "university"
        org_type = raw_type if raw_type in {"secondary_school", "university", "tutorial_centre", "jamb_cafe"} else "university"
        return Organization(
            id=row.get("id") or school_id,
            type=org_type,
            name=row.get("name") or "",
            official_name=row.get("official_name") or row.get("full_name"),
            short_name=row.get("short_name") or row.get("abbreviation"),
            jamb_code=row.get("jamb_code"),
            nuc_code=row.get("nuc_code"),
            state=row.get("state"),
            address=row.get("address"),
            city=row.get("city"),
            country=row.get("country"),
            school_code=row.get("school_code"),
            verification_status=row.get("verification_status") or "unverified",
            provider_session_only=bool(row.get("provider_session_only") or org_type in {"tutorial_centre", "jamb_cafe"}),
            verification_proof_submitted_at=row.get("verification_proof_submitted_at"),
        )
    except Exception as exc:
        log.warning("institutions: school profile read skipped", error=str(exc))
        return None


def _normal_org_type(raw: Optional[str]) -> str:
    if raw in {"secondary_school", "university", "tutorial_centre", "jamb_cafe"}:
        return raw
    return "university"


def _normal_account_type(raw: Optional[str], role: Optional[str]) -> str:
    if raw in {"educator", "institution_admin"}:
        return raw
    if role in {"owner", "dean", "institution_admin", "admin"}:
        return "institution_admin"
    return "educator"


def _code_slug(value: str) -> str:
    words = re.findall(r"[a-z0-9]+", (value or "").lower())
    compact = "".join(words)
    return (compact[:12] or "school").upper()


def _school_affiliation_code(svc, name: str, address: str, school_id: str) -> str:
    """Create a readable but record-scoped code.

    The UUID-derived suffix prevents same-name/same-initial schools from ever
    sharing a live code. The name prefix remains useful in referral links and
    printed cards; the address is part of the school identity, not the code.
    """
    prefix = _code_slug(name)
    suffix = re.sub(r"[^A-F0-9]", "", school_id.replace("-", "").upper())[:8]
    return f"{prefix}-{suffix}"


def _require_school_identity_schema(svc) -> None:
    """Fail clearly when the address/code migration is not applied.

    Admin identity must never be accepted while the database silently drops the
    address or school-code fields. The migration is intentionally checked before
    any school lookup or insert so a stale environment returns an actionable
    setup error instead of a misleading generic signup failure.
    """
    try:
        (
            svc.table("schools")
            .select("id, name, institution_type, address, city, state, country, school_code")
            .limit(1)
            .execute()
        )
    except Exception as exc:  # noqa: BLE001
        log.error("institutions: school identity migration is unavailable", error=str(exc))
        raise HTTPException(
            status_code=503,
            detail="School identity setup is unavailable. Apply the school identity migration before creating admin access.",
        ) from exc


def _find_or_create_school(claim: "VerificationClaim") -> Optional["Organization"]:
    name = (claim.organization_name or "").strip()
    if not name:
        return None
    org_type = _normal_org_type(claim.organization_type)
    address = (claim.address or "").strip()
    # The address requirement applies to the developer access code too.
    #
    # This flipped three times: #98 dropped the dev bypass (leaving
    # _is_developer_admin_route defined but uncalled), #100 restored it, and
    # #103 wrote tests asserting the bypass is gone -- but its route change was
    # lost to a merge conflict resolution, so the tests failed against the
    # restored bypass. Settled here in favour of no bypass, and the helper is
    # deleted rather than left dangling so it cannot come back a fourth time.
    #
    # The cost is dev-only: the bypass never applied in production, since it
    # required DEVELOPER_ACCESS_ENABLED. A local admin now supplies an address
    # like everyone else.
    if not claim.organization_id and len(address) < 8:
        raise HTTPException(
            status_code=400,
            detail="A full organisation address is required for admin access.",
        )
    svc = _svc()
    _require_school_identity_schema(svc)
    if claim.organization_id:
        selected = (
            svc.table("schools")
            .select("*")
            .eq("id", claim.organization_id)
            .eq("institution_type", org_type)
            .limit(1)
            .execute()
            .data
            or []
        )
        if selected:
            selected_row = selected[0]
            existing_address = (selected_row.get("address") or "").strip()
            effective_address = address or existing_address
            # Selecting an existing school creates no row, but an admin grant
            # against a school with no address on file is still an unverified
            # claim, so it is refused here as well as on the create path.
            if len(effective_address) < 8:
                raise HTTPException(
                    status_code=400,
                    detail="A full organisation address is required for admin access.",
                )
            if address and existing_address and existing_address.casefold() != address.casefold():
                raise HTTPException(status_code=409, detail="That school name is registered at a different address. Select the matching school or use its exact address.")
            school_id = selected_row.get("id")
            updates = {}
            if address and not existing_address:
                updates["address"] = address
            for key, value in (("city", claim.city), ("state", claim.state), ("country", claim.country)):
                if (value or "").strip():
                    updates[key] = value.strip()
            if updates:
                try:
                    svc.table("schools").update(updates).eq("id", school_id).execute()
                except Exception as exc:  # noqa: BLE001
                    log.warning("institutions: selected school metadata update skipped", error=str(exc))
            if not selected_row.get("school_code"):
                code = _school_affiliation_code(
                    svc,
                    selected_row.get("name") or name,
                    effective_address,
                    school_id,
                )
                try:
                    svc.table("schools").update({"school_code": code}).eq("id", school_id).execute()
                except Exception as exc:  # noqa: BLE001
                    log.warning("institutions: selected school code update skipped", error=str(exc))
            return _org_from_school(school_id)
    existing_rows = (
        svc.table("schools")
        .select("*")
        .ilike("name", name)
        .eq("institution_type", org_type)
        .limit(50)
        .execute()
        .data
        or []
    )
    normalized_address = address.casefold()
    row = next(
        (
            candidate for candidate in existing_rows
            if (candidate.get("address") or "").strip().casefold() == normalized_address
        ),
        None,
    )
    existing_address = (row.get("address") or "").strip() if row else ""
    if not row:
        row = (
            svc.table("schools")
            .insert(
                {
                    "name": name,
                    "institution_type": org_type,
                    "address": address or None,
                    "city": (claim.city or "").strip() or None,
                    "state": (claim.state or "").strip() or None,
                    "country": (claim.country or "Nigeria").strip() or "Nigeria",
                    "ibass_verified": False,
                }
            )
            .execute()
            .data
            or [None]
        )[0]
    elif address and not existing_address:
        try:
            svc.table("schools").update({
                "address": address,
                "city": (claim.city or "").strip() or None,
                "state": (claim.state or "").strip() or None,
                "country": (claim.country or "Nigeria").strip() or "Nigeria",
            }).eq("id", row.get("id")).execute()
            row["address"] = address
        except Exception as exc:  # noqa: BLE001
            log.warning("institutions: organisation metadata update skipped", error=str(exc))
    if not row:
        return None
    school_id = row.get("id")
    if not row.get("school_code"):
        try:
            code = _school_affiliation_code(svc, row.get("name") or name, row.get("address") or address, school_id)
            svc.table("schools").update({"school_code": code}).eq("id", school_id).execute()
            row["school_code"] = code
        except Exception as exc:  # noqa: BLE001
            log.warning("institutions: school code generation skipped", error=str(exc))
    if claim.provider_session_only:
        try:
            svc.table("schools").update({"provider_session_only": True}).eq(
                "id", school_id
            ).execute()
            row["provider_session_only"] = True
        except Exception as exc:  # noqa: BLE001
            log.warning("institutions: provider flag update skipped", error=str(exc))
    return _org_from_school(school_id)


def _attach_member(
    current_user: dict,
    school_id: str,
    account_type: str,
    role: Optional[str],
) -> None:
    svc = _svc()
    existing = (
        svc.table("institution_members")
        .select("id")
        .eq("user_id", current_user["id"])
        .eq("school_id", school_id)
        .limit(1)
        .execute()
        .data
        or []
    )
    member_role = role or account_type
    if existing:
        try:
            svc.table("institution_members").update(
                {"role": member_role, "verified": False, "seat_status": "active"}
            ).eq("id", existing[0]["id"]).execute()
            return
        except Exception as exc:  # noqa: BLE001
            log.warning("institutions: member update with seat_status skipped", error=str(exc))
            svc.table("institution_members").update(
                {"role": account_type, "verified": False}
            ).eq("id", existing[0]["id"]).execute()
            return
    try:
        svc.table("institution_members").insert(
            {
                "user_id": current_user["id"],
                "school_id": school_id,
                "role": member_role,
                "verified": False,
                "seat_status": "active",
            }
        ).execute()
    except Exception as exc:  # noqa: BLE001
        log.warning("institutions: member insert with full role skipped", error=str(exc))
        svc.table("institution_members").insert(
            {
                "user_id": current_user["id"],
                "school_id": school_id,
                "role": account_type,
                "verified": False,
            }
        ).execute()


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
            "top_employers, top_certs, plain_label, month, "
            "value_band, quadrant, interpretation, source_confidence"
        ).eq("domain_id", domain_id).eq("rank_lens", rank_lens).order(
            "month", desc=True
        ).limit(1).execute()
        return (res.data or [{}])[0]
    except Exception as exc:
        log.warning("institutions: demand read skipped", error=str(exc))
        return {}


def _latest_role_demand(role_key: str, rank_lens: str) -> dict:
    """Latest populated role demand row; {} when none ingested."""
    try:
        res = _svc().table("role_demand_metrics").select(
            "postings_count, postings_yoy, remote_pct, salary_min, salary_max, "
            "top_employers, top_certs, trend_pct, value_band, "
            "quadrant, interpretation, source_confidence, month"
        ).eq("role_id", role_key).eq("rank_lens", rank_lens).order(
            "month", desc=True
        ).limit(1).execute()
        return (res.data or [{}])[0]
    except Exception as exc:
        log.warning("institutions: role demand read skipped", error=str(exc))
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


def _assert_own_institution(institution_id: str, current_user: dict) -> str:
    """Resolve the caller's institution, refusing to serve anyone else's id.

    These routes take an `{institution_id}` path parameter that the handlers
    then ignored entirely — every read resolved the org from `current_user`.
    That is not a data leak (you always got your own institution back), but the
    API lied: a request for institution X returned the caller's own numbers
    stamped `institution_code: "X"`, which is worse than an error because it
    reads as real cross-institution data.

    Now the parameter means what it says. "me" is accepted as the caller's own
    institution — the frontend has always called `/api/institutions/me/...`,
    which only ever worked because the value was discarded.
    """
    org_id = _resolve_org(current_user)
    if institution_id in ("me", "self"):
        if not org_id:
            raise HTTPException(
                status_code=403,
                detail="You must be linked to an institution before viewing its intelligence.",
            )
        return org_id
    if org_id and str(institution_id) == str(org_id):
        return org_id
    # Deliberately 403, not 404: whether an institution id exists is not a
    # secret, but which one the caller administers is not the requester's to
    # probe either. A caller with no org at all also lands here.
    raise HTTPException(
        status_code=403,
        detail="You can only read data for the institution you administer.",
    )


def _school_programmes(current_user: dict, cap: int = 100) -> list:
    """Programme rows for the current admin's institution.

    Resolves via org membership. It never falls back to an all-programmes sample:
    institution intelligence must remain institution-scoped.

    NOTE: this used to take an `institution_id` argument that it never read.
    Callers must gate on _assert_own_institution first; the identity used here
    is always the caller's own.
    """
    svc = _svc()
    org_id = _resolve_org(current_user)
    if not org_id:
        return []
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
    """programme_domain rows, with the closest relationship first.

    This ordering is part of the programme-intelligence contract: direct
    connections are reviewed before functional extensions and adjacent
    exploration. Consumers still retain ``match_type`` and must not infer a
    curriculum requirement from ordering alone.
    """
    if not programme_ids:
        return []
    try:
        rows = (
            _svc()
            .table("programme_domain")
            .select("programme_id, domain_id, match_type, elite_flag")
            .in_("programme_id", programme_ids)
            .limit(cap)
            .execute()
            .data
        ) or []
        priority = {"direct": 0, "functional": 1, "adjacent": 2}
        return sorted(
            rows,
            key=lambda row: (
                priority.get(str(row.get("match_type") or ""), 3),
                str(row.get("domain_id") or ""),
            ),
        )
    except Exception as exc:  # noqa: BLE001
        log.warning("institutions: programme_domain read skipped", error=str(exc))
        return []


# ─────────────────────────────────────────────────────────────
# Domain Reach Audit helpers (§5.1)
#
# SCHEMA NOTE — the spec's SQL names three tables that DO NOT EXIST in
# skillup_dev. The real chain, verified against migration_career_pilot.sql and
# migration_career_v2.sql, is:
#
#   spec name                  real name
#   ─────────────────────────  ─────────────────────────────────────────────
#   institution_programmes     school_programmes(school_id, jamb_programme_id)
#   programme_domain_mappings  programme_domain(programme_id, domain_id, match_type)
#   (spec joins pdm straight   programme_mapping(jamb_programme_id → programme_id)
#    to jamb_programme_id)     is the missing hop: programme_domain hangs off the
#                              CCMAS programme, never off the JAMB programme.
#
# `domains` and `schools` DO exist; `domains` carries `cluster` (singular), not
# `cluster_name`, and `domain_key` ('D001…'), not `domain_code`. `schools` has
# NO `state` column and NO federal/state/private ownership column at all — see
# _leaderboard_rows for how that is reported honestly rather than guessed.
# ─────────────────────────────────────────────────────────────

# Documented size of the CCMAS 2022–2023 domain universe. Only used as a
# fallback label when the domains table cannot be read; the live row count wins.
_CCMAS_DOMAIN_UNIVERSE = 168
_NATIONAL_SCAN_CAP = 20000


def _all_domains(cap: int = 1000) -> list:
    """Every domain row (id, domain_key, name, cluster); [] when unreadable."""
    try:
        return (
            _svc()
            .table("domains")
            .select("id, domain_key, name, cluster")
            .limit(cap)
            .execute()
            .data
        ) or []
    except Exception as exc:  # noqa: BLE001
        log.warning("institutions: domains read skipped", error=str(exc))
        return []


def _reach_buckets(pd_rows: list) -> dict:
    """Split programme_domain rows into distinct-domain sets per match_type.

    Mirrors the spec's COUNT(DISTINCT CASE WHEN match_type = …) — a domain
    reached by one programme directly and another functionally counts in BOTH
    buckets, so direct+functional+adjacent can exceed `all`.
    """
    buckets = {"direct": set(), "functional": set(), "adjacent": set(), "all": set()}
    for r in pd_rows:
        did = r.get("domain_id")
        if not did:
            continue
        buckets["all"].add(did)
        mt = r.get("match_type")
        if mt in buckets:
            buckets[mt].add(did)
    return buckets


def _national_reach_index() -> tuple:
    """(reach_by_school, schools_by_id) for every school in the registry.

    Computed with four bounded bulk reads rather than per-school queries:
    school_programmes → programme_mapping → programme_domain, plus the school
    registry itself. Returns ({}, {}) when any leg is unreadable — an empty
    index means "we could not rank", never a fabricated ranking.
    """
    try:
        svc = _svc()
        sp = (
            svc.table("school_programmes")
            .select("school_id, jamb_programme_id")
            .limit(_NATIONAL_SCAN_CAP)
            .execute()
            .data
        ) or []
        if not sp:
            return {}, {}
        jamb_ids = list({r["jamb_programme_id"] for r in sp if r.get("jamb_programme_id")})
        pm = (
            svc.table("programme_mapping")
            .select("jamb_programme_id, programme_id")
            .in_("jamb_programme_id", jamb_ids)
            .limit(_NATIONAL_SCAN_CAP)
            .execute()
            .data
        ) or []
        ccmas_by_jamb = {
            r["jamb_programme_id"]: r["programme_id"]
            for r in pm
            if r.get("jamb_programme_id") and r.get("programme_id")
        }
        prog_ids = list(set(ccmas_by_jamb.values()))
        pd_rows = _programme_domain_rows(prog_ids, cap=_NATIONAL_SCAN_CAP)
        links_by_prog: dict = {}
        for r in pd_rows:
            links_by_prog.setdefault(r.get("programme_id"), []).append(r)

        reach: dict = {}
        for row in sp:
            school_id = row.get("school_id")
            ccmas_id = ccmas_by_jamb.get(row.get("jamb_programme_id"))
            if not school_id or not ccmas_id:
                continue
            reach.setdefault(school_id, []).extend(links_by_prog.get(ccmas_id, []))
        reach_by_school = {sid: _reach_buckets(rows) for sid, rows in reach.items()}

        # select("*"): `state` is read opportunistically because the column is
        # not in any migration — naming it explicitly would 400 on a schema
        # that never had it.
        schools = (
            svc.table("schools").select("*").limit(5000).execute().data
        ) or []
        schools_by_id = {s["id"]: s for s in schools if s.get("id")}
        return reach_by_school, schools_by_id
    except Exception as exc:  # noqa: BLE001
        log.warning("institutions: national reach index skipped", error=str(exc))
        return {}, {}


def _rank_of(school_id: Optional[str], reach_by_school: dict) -> tuple:
    """(national_rank, total_institutions) by distinct domain reach.

    Standard competition ranking (ties share a rank). (None, count) when the
    school has no reach row — we know the cohort size but not its place in it.
    """
    if not reach_by_school:
        return None, None
    totals = sorted(
        ((sid, len(b["all"])) for sid, b in reach_by_school.items()),
        key=lambda kv: kv[1],
        reverse=True,
    )
    total_institutions = len(totals)
    if not school_id or school_id not in reach_by_school:
        return None, total_institutions
    mine = len(reach_by_school[school_id]["all"])
    rank = sum(1 for _sid, n in totals if n > mine) + 1
    return rank, total_institutions


# ─────────────────────────────────────────────────────────────
# Pydantic v2 response models — field-compatible with
# src/types/institution.ts. Internally we keep snake_case; over the wire we
# accept and emit camelCase so the TypeScript contracts line up.
# ─────────────────────────────────────────────────────────────

def _to_camel(name: str) -> str:
    head, *tail = name.split("_")
    return head + "".join(part[:1].upper() + part[1:] for part in tail)


def _canonical_item_key(value: str) -> str:
    """Return a conservative identity key for curriculum comparisons.

    This only normalises punctuation, spacing and the common ``&`` spelling.
    It deliberately does not invent semantic synonyms: an unrecognised
    equivalent remains reviewable instead of being silently counted as taught.
    """
    text = value.casefold().replace("&", " and ")
    return re.sub(r"[^a-z0-9]+", " ", text).strip()


def _source_aliases(row: dict) -> list[str]:
    """Read aliases only when the source row explicitly provides them."""
    for key in ("aliases", "source_aliases", "also_known_as"):
        value = row.get(key)
        if isinstance(value, str) and value.strip():
            return [value.strip()]
        if isinstance(value, list):
            return [str(item).strip() for item in value if str(item).strip()]
    return []


def _provenance_value(row: dict, *keys: str) -> Optional[str]:
    provenance = row.get("source_provenance")
    for key in keys:
        value = row.get(key)
        if value not in (None, ""):
            return str(value)
        if isinstance(provenance, dict) and provenance.get(key) not in (None, ""):
            return str(provenance[key])
    return None


class _InstitutionBase(BaseModel):
    model_config = ConfigDict(
        alias_generator=_to_camel,
        populate_by_name=True,
        extra="ignore",
    )


class Organization(_InstitutionBase):
    id: str
    type: str  # secondary_school | university | tutorial_centre | jamb_cafe
    name: str
    official_name: Optional[str] = None
    short_name: Optional[str] = None
    jamb_code: Optional[str] = None
    nuc_code: Optional[str] = None
    moe_approval_no: Optional[str] = None
    cac_no: Optional[str] = None
    state: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    school_code: Optional[str] = None
    verification_status: str = "unverified"  # unverified|claimed|pending|verified|rejected
    verification_method: Optional[str] = None
    verification_proof_submitted_at: Optional[str] = None
    # True for tutorial_centre/jamb_cafe: provider/session only, never a roster.
    provider_session_only: bool = False


class OrganizationMember(_InstitutionBase):
    id: str
    organization_id: str
    user_id: str
    role: str
    seat_status: str = "active"
    display_name: Optional[str] = None
    email: Optional[str] = None
    title: Optional[str] = None
    invited_by: Optional[str] = None
    accepted_at: Optional[str] = None
    last_active_at: Optional[str] = None


class OrganizationInvite(_InstitutionBase):
    id: str
    organization_id: str
    invited_email: str
    role: str
    status: str = "pending"
    invited_by: Optional[str] = None
    expires_at: Optional[str] = None
    created_at: str


class OrganizationTeam(_InstitutionBase):
    organization: Optional[Organization] = None
    members: List[OrganizationMember] = Field(default_factory=list)
    invites: List[OrganizationInvite] = Field(default_factory=list)
    can_invite: bool = False


class InviteMemberInput(_InstitutionBase):
    invited_email: str
    role: str = "counsellor"


class VerificationClaim(_InstitutionBase):
    """Payload mirroring EducatorProfile from institution.ts."""
    account_type: Optional[str] = None  # educator | institution_admin
    organization_type: Optional[str] = None
    organization_name: Optional[str] = None
    organization_id: Optional[str] = None
    role: Optional[str] = None
    work_email: Optional[str] = None
    registry_code: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    provider_session_only: bool = False
    verification_method: Optional[str] = None
    access_code: Optional[str] = None


class AdminAccessCodeRequest(_InstitutionBase):
    """Owner-issued gate code for educator/institution admin mode.

    This is deliberately separate from verification proof, school codes, and
    student claim codes. It allows controlled admin-mode access while the full
    verification review pipeline is still manual.
    """

    code: str
    organization_type: Optional[str] = None
    organization_name: Optional[str] = None


class InstitutionSummary(_InstitutionBase):
    institution_name: str
    institution_official_name: Optional[str] = None
    institution_short_name: Optional[str] = None
    institution_address: Optional[str] = None
    institution_city: Optional[str] = None
    institution_state: Optional[str] = None
    institution_country: Optional[str] = None
    institution_type: Optional[str] = None
    verification_status: Optional[str] = None
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


class ProgrammeDomainBadge(_InstitutionBase):
    domain_id: str
    short_label: str
    match_type: str  # direct | functional | adjacent


class DemandSkill(_InstitutionBase):
    name: str
    in_curriculum: bool
    note: Optional[str] = None


class ProgrammeDemandDetail(_InstitutionBase):
    top_skills: List[DemandSkill] = Field(default_factory=list)
    top_certifications: List[DemandSkill] = Field(default_factory=list)
    top_employers: List[str] = Field(default_factory=list)


class ProgrammeDemandRow(_InstitutionBase):
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


class ProgrammeIntelligenceRow(_InstitutionBase):
    """Institution-scoped programme structure, independent of labour demand."""

    id: str
    programme_name: str
    discipline: Optional[str] = None
    qualification: Optional[str] = None
    mapping_source: str = "ccmas"
    domains: List[ProgrammeDomainBadge] = Field(default_factory=list)
    domain_overflow: Optional[int] = None
    direct_domains: int = 0
    functional_domains: int = 0
    adjacent_domains: int = 0
    source_status: str = "recorded"


class DomainRankItem(_InstitutionBase):
    rank: int
    domain_id: str
    domain_name: str
    route_note: Optional[str] = None
    postings_per_month: int = 0
    bar_ratio: Optional[float] = None
    trend_pct: Optional[float] = None
    trend_direction: Optional[str] = None
    value_band: Optional[str] = None
    quadrant: Optional[str] = None
    interpretation: Optional[str] = None


class IntelligenceAlert(_InstitutionBase):
    id: str
    severity: str  # info | opportunity | warning | critical
    title: str
    body: str


class SkillGapRow(_InstitutionBase):
    programme_name: str
    domain_name: str
    skill: str
    demand_pct: Optional[float] = None
    in_curriculum: bool = False


class ProgrammeResourceEvidence(_InstitutionBase):
    """One sourced market/practice item compared with CCMAS teaching."""

    name: str
    kind: Literal["skill", "tool", "certification"]
    source: Literal["domain", "subgroup", "role"]
    scope_name: Optional[str] = None
    role_name: Optional[str] = None
    canonical_key: Optional[str] = None
    aliases: List[str] = Field(default_factory=list)
    state: Literal["covered", "bridge"]
    curriculum_state: Literal["taught", "partly_evidenced", "not_evidenced", "source_review"] = "source_review"
    market_state: Literal["market_practice_evidence", "insufficient_evidence", "source_review"] = "source_review"
    url: Optional[str] = None
    provider: Optional[str] = None
    description: Optional[str] = None
    explanation: Optional[str] = None
    resource_type: Optional[str] = None
    source_confidence: Optional[str] = None
    data_state: Optional[str] = None
    evidence_source: Optional[str] = None
    observed_at: Optional[str] = None
    geography: Optional[str] = None


class ProgrammeDomainSkillCoverage(_InstitutionBase):
    """A programme-first skill bridge for one mapped domain.

    ``bridge`` means a sourced market/practice item not evidenced by the
    programme's recorded CCMAS/JAMB outcome list. It is not an accreditation
    instruction. Employment postings remain a separate signal.
    """

    domain_id: str
    domain_name: str
    match_type: str
    curriculum_skills: List[str] = Field(default_factory=list)
    resources: List[ProgrammeResourceEvidence] = Field(default_factory=list)
    covered_count: int = 0
    bridge_count: int = 0
    coverage_status: Literal["complete", "source_missing", "review_only"] = "source_missing"
    explanation: str
    priority: Optional[Literal[1, 2, 3]] = None
    market_state: Literal["market_practice_evidence", "insufficient_evidence", "source_review"] = "source_review"


class ProgrammeSkillCoverage(_InstitutionBase):
    """Programme intelligence arranged as programme → mapped domains."""

    programme_id: str
    programme_name: str
    curriculum_skills: List[str] = Field(default_factory=list)
    curriculum_technical: List[str] = Field(default_factory=list)
    curriculum_transferable: List[str] = Field(default_factory=list)
    curriculum_status: Literal["complete", "source_missing"] = "source_missing"
    domains: List[ProgrammeDomainSkillCoverage] = Field(default_factory=list)


class RoleDemandRow(_InstitutionBase):
    role_id: str
    role_name: str
    domain_name: Optional[str] = None
    ng_postings: Optional[int] = None
    global_postings: Optional[int] = None
    remote_pct: Optional[float] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    trend_pct: Optional[float] = None
    rank_lens: Optional[str] = None
    value_band: Optional[str] = None
    quadrant: Optional[str] = None
    interpretation: Optional[str] = None
    top_employers: List[str] = Field(default_factory=list)
    top_certifications: List[str] = Field(default_factory=list)


class PeerInstitutionRow(_InstitutionBase):
    institution_name: str
    domains_accessible: int = 0
    unique_domains: Optional[List[str]] = None
    # Peer comparison axes (Phase 6.8): structural coverage on domains + roles.
    roles_accessible: int = 0
    is_self: bool = False


class AffiliationStats(_InstitutionBase):
    organization_id: str
    # Self-reported affiliations; suppressed below the k-anonymity threshold.
    affiliated_students: Optional[int] = None
    below_threshold: bool = True
    school_code: str


class DomainRef(_InstitutionBase):
    domain_key: str
    name: str


class ProgrammeDomainReachRow(_InstitutionBase):
    programme_id: str
    programme_name: str
    direct: int = 0
    functional: int = 0
    adjacent: int = 0
    total: int = 0


class UnreachedClusterRow(_InstitutionBase):
    cluster: str
    domains: List[DomainRef] = Field(default_factory=list)


class DomainReachAudit(_InstitutionBase):
    institution_id: str
    programme_count: int = 0
    total_domains: int = 0
    direct_domains: int = 0
    functional_domains: int = 0
    adjacent_domains: int = 0
    unreached_domains: int = 0
    # Size of the CCMAS domain universe the counts above are "out of" — the
    # live domains row count when readable, else the documented 168.
    domain_universe: int = _CCMAS_DOMAIN_UNIVERSE
    # None (not 0, not 1) when the national index could not be built: an
    # unknown rank is reported as unknown.
    national_rank: Optional[int] = None
    total_institutions: Optional[int] = None
    programme_breakdown: List[ProgrammeDomainReachRow] = Field(default_factory=list)
    unreached_by_cluster: List[UnreachedClusterRow] = Field(default_factory=list)


class DomainReachLeaderboardRow(_InstitutionBase):
    institution_id: str
    institution_name: str
    # `control` is federal|state|private. NOT RECORDED in skillup_dev.schools —
    # always None until an ownership column exists. institution_type is the
    # registry's real column (university|secondary_school|…).
    control: Optional[str] = None
    institution_type: Optional[str] = None
    state: Optional[str] = None
    total_domains: int = 0
    direct_domains: int = 0
    functional_domains: int = 0
    adjacent_domains: int = 0
    national_rank: int
    is_self: bool = False


class StudentIntelligenceDomain(_InstitutionBase):
    domain_key: str
    label: str
    pct: float


class StudentIntelligence(_InstitutionBase):
    """AGGREGATE rollup only — §5.5. Never carries a student id, name, class,
    claim code or any other per-row field."""

    organization_id: str
    total_affiliated: int = 0
    self_signed_up: int = 0
    provisioned_by_you: int = 0
    unclaimed_codes: int = 0
    top_domains: List[StudentIntelligenceDomain] = Field(default_factory=list)
    # True when the cohort is under the k-anonymity threshold; the mix is
    # suppressed rather than published.
    below_threshold: bool = True


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
    member = _membership_for_user(current_user)
    school_id = (member or {}).get("school_id")
    if school_id:
        org = _org_from_school(school_id)
        if org:
            return ResponseModel(data=org.model_dump(by_alias=True))
    log.info("Institution /me empty", user_id=current_user["id"])
    return ResponseModel(
        data=None,
        message="Claim or verify an institution to create your organisation profile.",
    )


@router.get("/me/team", response_model=ResponseModel)
async def get_my_team(current_user: dict = Depends(Auth.require_admin)):
    """Organisation profile + team seats for the current admin context."""
    member = _membership_for_user(current_user)
    school_id = (member or {}).get("school_id")
    if not school_id:
        team = OrganizationTeam(organization=None, members=[], invites=[], can_invite=False)
        return ResponseModel(data=team.model_dump(by_alias=True))

    org = _org_from_school(school_id)
    can_invite = _can_invite_members(member, current_user)

    members: List[OrganizationMember] = []
    try:
        rows = _svc().table("institution_members").select("*").eq(
            "school_id", school_id
        ).order("created_at", desc=False).limit(200).execute().data or []
        user_ids = [r.get("user_id") for r in rows if r.get("user_id")]
        users_by_id = {}
        if user_ids:
            user_rows = _svc().table("users").select(
                "id, username, email, last_login"
            ).in_("id", user_ids).limit(200).execute().data or []
            users_by_id = {u.get("id"): u for u in user_rows}
        for row in rows:
            user_row = users_by_id.get(row.get("user_id"), {})
            members.append(
                OrganizationMember(
                    id=row.get("id") or f"{school_id}:{row.get('user_id')}",
                    organization_id=school_id,
                    user_id=row.get("user_id") or "",
                    role=row.get("role") or "educator",
                    seat_status=row.get("seat_status") or ("active" if row.get("verified", True) else "invited"),
                    display_name=user_row.get("username"),
                    email=user_row.get("email"),
                    title=row.get("title"),
                    invited_by=row.get("invited_by"),
                    accepted_at=row.get("accepted_at"),
                    last_active_at=user_row.get("last_login"),
                )
            )
    except Exception as exc:
        log.warning("institutions: team members read skipped", error=str(exc))

    invites: List[OrganizationInvite] = []
    try:
        rows = _svc().table("institution_member_invites").select("*").eq(
            "school_id", school_id
        ).order("created_at", desc=True).limit(100).execute().data or []
        for row in rows:
            invites.append(
                OrganizationInvite(
                    id=row.get("id"),
                    organization_id=school_id,
                    invited_email=row.get("invited_email") or "",
                    role=row.get("role") or "counsellor",
                    status=row.get("status") or "pending",
                    invited_by=row.get("invited_by"),
                    expires_at=row.get("expires_at"),
                    created_at=row.get("created_at") or "",
                )
            )
    except Exception as exc:
        log.warning("institutions: team invites read skipped", error=str(exc))

    team = OrganizationTeam(
        organization=org,
        members=members,
        invites=invites,
        can_invite=can_invite,
    )
    return ResponseModel(data=team.model_dump(by_alias=True))


@router.post("/me/invites", response_model=ResponseModel)
async def invite_team_member(
    payload: InviteMemberInput,
    current_user: dict = Depends(Auth.require_admin),
):
    """Create an invitation for another official from the same organisation."""
    member = _membership_for_user(current_user)
    school_id = (member or {}).get("school_id")
    if not school_id or not _can_invite_members(member, current_user):
        return ResponseModel(
            data=None,
            message="Only verified owners/admins can invite officials.",
        )

    invited_email = (payload.invited_email or "").strip().lower()
    if not invited_email:
        return ResponseModel(data=None, message="Invitation email is required.")

    expires = datetime.now(timezone.utc) + timedelta(days=14)
    row = {
        "school_id": school_id,
        "invited_email": invited_email,
        "role": payload.role,
        "status": "pending",
        "invited_by": current_user["id"],
        "expires_at": expires.isoformat(),
    }
    try:
        created = _svc().table("institution_member_invites").insert(row).execute().data[0]
        invite = OrganizationInvite(
            id=created.get("id"),
            organization_id=school_id,
            invited_email=created.get("invited_email") or invited_email,
            role=created.get("role") or payload.role,
            status=created.get("status") or "pending",
            invited_by=created.get("invited_by"),
            expires_at=created.get("expires_at"),
            created_at=created.get("created_at") or "",
        )
        return ResponseModel(data=invite.model_dump(by_alias=True))
    except Exception as exc:
        log.warning("institutions: team invite create skipped", error=str(exc))
        return ResponseModel(
            data=None,
            message="Team invitations are not active until the institution team schema is applied.",
        )


@router.post("/access-code/validate", response_model=ResponseModel)
async def validate_admin_access_code(
    payload: AdminAccessCodeRequest = Body(...),
    current_user: dict = Depends(Auth.get_current_user),
):
    """Validate an owner-issued admin access code.

    The code unlocks controlled admin-mode entry for institutions/tutorial
    centres while proof review remains manual. It does not verify ownership,
    create an institution membership, or replace school/student claim codes.
    """
    submitted = (payload.code or "").strip().upper()
    ok = bool(submitted) and any(
        hmac.compare_digest(submitted, configured)
        for configured in settings.EDUCATOR_ACCESS_CODES
    )
    if not ok:
        log.info(
            "Institution access code rejected",
            user_id=current_user["id"],
            organization_type=payload.organization_type,
        )
        return ResponseModel(
            success=False,
            message="Invalid or expired admin access code.",
            data=None,
        )

    # PERSIST the grant. This endpoint used to validate the code and then store
    # nothing — the "accepted" flag lived only in the client's local state, so
    # the documented "owner-issued code required before entering admin mode"
    # gate could be skipped entirely by calling POST /verify directly. The
    # server now remembers, and /verify refuses without it.
    try:
        svc = _svc()
        # PostgREST does not raise when an UPDATE matches no row — it returns an
        # empty result. Catching only exceptions would therefore report
        # accepted=true for a write that changed nothing, and /verify would then
        # refuse the same user: exactly the contradiction this block exists to
        # prevent. An empty result is a failure.
        #
        # The check must read the UPDATE's own result. A follow-up SELECT for
        # the user only proves the row exists, which it always does for an
        # authenticated caller — so the grant appeared to succeed even when
        # nothing was written.
        written = svc.table("users").update(
            {"admin_access_granted_at": datetime.now(timezone.utc).isoformat()}
        ).eq("id", current_user["id"]).execute()
        if not (getattr(written, "data", None) or []):
            raise RuntimeError("admin access grant matched no user row")
    except Exception as exc:  # noqa: BLE001
        # A local developer can continue before the optional grant migration is
        # applied. Production still fails closed because the persisted grant is
        # required for every later verification request.
        if settings.DEVELOPER_ACCESS_ENABLED and submitted == "LEVELUP-EDU-DEV":
            log.warning(
                "institutions: admin access grant persistence skipped in debug",
                user_id=current_user["id"],
                error=str(exc),
            )
            return ResponseModel(
                data={
                    "accepted": True,
                    "accessTier": "owner_code",
                    "notice": "Development access accepted; apply the admin access migration before production use.",
                },
            )
        # Fail CLOSED: if we cannot record the grant we must not report success,
        # or the user is told they are unlocked while /verify will refuse them.
        log.error(
            "institutions: could not record admin access grant",
            user_id=current_user["id"],
            error=str(exc),
        )
        return ResponseModel(
            success=False,
            message="Could not unlock admin access right now. Please try again.",
            data=None,
        )

    log.info(
        "Institution access code accepted",
        user_id=current_user["id"],
        organization_type=payload.organization_type,
        organization_name=payload.organization_name,
    )
    return ResponseModel(
        data={
            "accepted": True,
            "accessTier": "owner_code",
            "notice": (
                "Admin access unlocked by owner code. Organisation is claimed; "
                "submit proof when you are ready to request review."
            ),
        }
    )


@router.post("/verify", response_model=ResponseModel)
async def submit_verification(
    claim: VerificationClaim = Body(default_factory=VerificationClaim),
    current_user: dict = Depends(Auth.get_current_user),
):
    """Accept a verification claim payload.

    Owner-code access and proof review stay separate: this creates/reuses the
    organisation shell and links the current user so admin/provisioning routes
    can scope correctly. Selecting a method alone does not start review; the
    organisation remains claimed until a proof file is submitted.
    """
    # ── The owner-code gate, enforced server-side ──────────────
    # Without this, /verify is a one-request privilege escalation: any
    # authenticated account could post an arbitrary organisation name, receive
    # account_type 'educator', and thereby satisfy Auth.require_admin on every
    # institution endpoint — including the eight gated in this same change.
    # The code itself has always been validated by
    # POST /access-code/validate; it simply was not remembered.
    has_persisted_grant = bool(current_user.get("admin_access_granted_at"))
    debug_code_valid = bool(
        settings.DEVELOPER_ACCESS_ENABLED
        and claim.access_code
        and claim.access_code.strip().upper() == "LEVELUP-EDU-DEV"
        and any(
            hmac.compare_digest(claim.access_code.strip().upper(), configured)
            for configured in settings.EDUCATOR_ACCESS_CODES
        )
    )
    if not has_persisted_grant and not debug_code_valid:
        log.warning(
            "institutions: verify claim refused, no owner-code grant",
            user_id=current_user["id"],
        )
        raise HTTPException(
            status_code=403,
            detail=(
                "Admin access requires an owner-issued access code. "
                "Enter your code first, then claim your organisation."
            ),
        )

    # Selecting a verification method is not submitting proof. Keep the
    # organisation claimed until the proof-upload endpoint records a file;
    # only that endpoint is allowed to move the school to pending review.
    status = "claimed"
    account_type = _normal_account_type(claim.account_type, claim.role)
    try:
        org = _find_or_create_school(claim)
        if not org:
            return ResponseModel(
                data=None,
                message="Organisation name is required to create the admin workspace.",
            )
        _attach_member(current_user, org.id, account_type, claim.role)
        try:
            _svc().table("users").update(
                {
                    "account_type": account_type,
                    "account_type_selected_at": datetime.now(timezone.utc).isoformat(),
                    "onboarding_completed": True,
                }
            ).eq("id", current_user["id"]).execute()
        except Exception as exc:  # noqa: BLE001
            log.warning("institutions: user account_type update skipped", error=str(exc))

        org.verification_status = status
        org.verification_method = claim.verification_method
        org.provider_session_only = claim.provider_session_only or org.provider_session_only
        log.info(
            "Institution verify claim linked",
            user_id=current_user["id"],
            school_id=org.id,
            account_type=account_type,
        )
        return ResponseModel(
            data=org.model_dump(by_alias=True),
            message="Admin workspace linked. Submit verification proof to request review.",
        )
    except Exception as exc:  # noqa: BLE001
        log.error("Institution verify claim failed", user_id=current_user["id"], error=str(exc))
        return ResponseModel(
            success=False,
            message="Could not create the institution workspace.",
            data=None,
        )


def _proof_org_for_user(current_user: dict) -> tuple[dict, Optional[dict]]:
    """Resolve the caller's own school before accepting a proof file."""
    member = _membership_for_user(current_user)
    school_id = (member or {}).get("school_id")
    if not school_id:
        raise HTTPException(status_code=409, detail="Link your organisation before submitting verification proof.")
    org = _org_from_school(school_id)
    if not org:
        raise HTTPException(status_code=404, detail="Your organisation could not be found.")
    return {"id": school_id, "type": org.type, "name": org.name}, member


def _proof_filename(filename: Optional[str], content_type: str) -> str:
    raw = (filename or "proof").replace("\\", "/").split("/")[-1]
    safe = re.sub(r"[^A-Za-z0-9._-]+", "_", raw).strip("._")[:120]
    if safe and "." in safe:
        return safe
    extension = {"application/pdf": ".pdf", "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}.get(content_type, ".bin")
    return f"{safe or 'proof'}{extension}"


@router.get("/verification-proof", response_model=ResponseModel)
async def get_verification_proof(current_user: dict = Depends(Auth.get_current_user)):
    """Return metadata for the caller's latest private proof submission."""
    org, _member = _proof_org_for_user(current_user)
    try:
        row = (
            _svc()
            .table("institution_verification_submissions")
            .select("id, file_name, content_type, file_size, verification_method, status, submitted_at, reviewed_at, review_note")
            .eq("school_id", org["id"])
            .order("submitted_at", desc=True)
            .limit(1)
            .execute()
            .data
            or []
        )
        return ResponseModel(data=row[0] if row else None)
    except Exception as exc:  # noqa: BLE001
        log.warning("institutions: verification proof metadata unavailable", error=str(exc))
        raise HTTPException(status_code=503, detail="Verification proof storage is not ready. Apply the institution verification migration first.")


@router.post("/verification-proof", response_model=ResponseModel)
async def submit_verification_proof(
    proof: UploadFile = File(...),
    verification_method: str = Form("document_upload"),
    current_user: dict = Depends(Auth.get_current_user),
):
    """Store one private proof file and atomically move the organisation to review."""
    org, member = _proof_org_for_user(current_user)
    if (member or {}).get("role") not in {"owner", "institution_admin", "admin"}:
        raise HTTPException(status_code=403, detail="Only an organisation owner or administrator can submit verification proof.")

    content_type = (proof.content_type or "").lower().strip()
    if content_type not in _ALLOWED_VERIFICATION_TYPES:
        raise HTTPException(status_code=415, detail="Upload a PDF, JPG, PNG, or WEBP proof document.")
    method = (verification_method or "document_upload").strip().lower()
    if method not in {"document_upload", "email_domain", "cac_registration", "registry_match", "manual"}:
        raise HTTPException(status_code=422, detail="Unsupported verification method.")

    content = await proof.read(_MAX_VERIFICATION_PROOF_BYTES + 1)
    if not content:
        raise HTTPException(status_code=422, detail="The proof file is empty.")
    if len(content) > _MAX_VERIFICATION_PROOF_BYTES:
        raise HTTPException(status_code=413, detail="Verification proof must be 10 MB or smaller.")

    filename = _proof_filename(proof.filename, content_type)
    storage_path = f"{org['id']}/{current_user['id']}/{uuid4().hex}_{filename}"
    storage = db.get_service_client().storage.from_(_VERIFICATION_BUCKET)
    try:
        storage.upload(storage_path, content, {"content-type": content_type, "upsert": "false"})
    except Exception as exc:  # noqa: BLE001
        log.error("institutions: verification proof upload failed", error=str(exc), school_id=org["id"])
        raise HTTPException(status_code=503, detail="Verification proof storage is unavailable. Try again after the backend migration is applied.")

    submitted_at = datetime.now(timezone.utc).isoformat()
    try:
        inserted = (
            _svc()
            .table("institution_verification_submissions")
            .insert({
                "school_id": org["id"],
                "submitted_by": current_user["id"],
                "storage_path": storage_path,
                "file_name": filename,
                "content_type": content_type,
                "file_size": len(content),
                "verification_method": method,
                "status": "pending",
                "submitted_at": submitted_at,
            })
            .execute()
            .data
            or []
        )
        if not inserted:
            raise RuntimeError("verification proof insert returned no row")
        updated = (
            _svc()
            .table("schools")
            .update({
                "verification_status": "pending",
                "verification_method": method,
                "verification_proof_submitted_at": submitted_at,
            })
            .eq("id", org["id"])
            .select("id")
            .execute()
        )
        if not updated.data:
            raise RuntimeError("school verification status update returned no row")
    except Exception as exc:  # noqa: BLE001
        try:
            storage.remove([storage_path])
        except Exception:
            pass
        log.error("institutions: verification proof record failed", error=str(exc), school_id=org["id"])
        raise HTTPException(status_code=503, detail="The proof could not be recorded. No review was started; please try again.")

    row = inserted[0]
    return ResponseModel(
        data={
            "id": row.get("id"),
            "file_name": filename,
            "content_type": content_type,
            "file_size": len(content),
            "verification_method": method,
            "status": "pending",
            "submitted_at": submitted_at,
        },
        message="Proof submitted. Your organisation is now under review.",
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
    current_user: dict = Depends(Auth.require_admin),
):
    """InstitutionSummary — the boardroom stat cards.

    Programme + domain counts are REAL (from the taxonomy); demand/salary/gap
    numbers stay zeroed with data_status='coming_soon' until ingestion.
    """
    # The RESOLVED org, never the raw path value. Echoing the URL back is how
    # `institution_code: "me"` used to reach the client as if it were real.
    org_id = _assert_own_institution(institution_id, current_user)
    org = _org_from_school(org_id) if org_id else None
    institution_name = (org.official_name or org.name) if org else ""
    institution_code = (org.school_code or org_id or "") if org else (org_id or "")
    try:
        programmes = _school_programmes(current_user, cap=1000)
        prog_ids = [p["id"] for p in programmes]
        pd_rows = _programme_domain_rows(prog_ids)
        domains_accessible = len({r["domain_id"] for r in pd_rows})
        summary = InstitutionSummary(
            institution_name=institution_name,
            institution_official_name=org.official_name if org else None,
            institution_short_name=org.short_name if org else None,
            institution_address=org.address if org else None,
            institution_city=org.city if org else None,
            institution_state=org.state if org else None,
            institution_country=org.country if org else None,
            institution_type=org.type if org else None,
            verification_status=org.verification_status if org else None,
            institution_code=institution_code,
            active_programmes=len(programmes),
            domains_accessible=domains_accessible,
        )
        return ResponseModel(data=summary.model_dump(by_alias=True))
    except Exception as exc:  # noqa: BLE001
        log.error("institutions summary failed", error=str(exc))
        summary = InstitutionSummary(
            institution_name=institution_name,
            institution_official_name=org.official_name if org else None,
            institution_short_name=org.short_name if org else None,
            institution_address=org.address if org else None,
            institution_city=org.city if org else None,
            institution_state=org.state if org else None,
            institution_country=org.country if org else None,
            institution_type=org.type if org else None,
            verification_status=org.verification_status if org else None,
            institution_code=institution_code,
        )
        return ResponseModel(data=summary.model_dump(by_alias=True))


@router.get("/{institution_id}/programme-demand", response_model=ResponseModel)
async def get_programme_demand(
    institution_id: str,
    discipline: Optional[str] = None,
    has_gaps: Optional[bool] = None,
    high_demand: Optional[bool] = None,
    custom_mapping: Optional[bool] = None,
    query: Optional[str] = None,
    current_user: dict = Depends(Auth.require_admin),
):
    """list[ProgrammeDemandRow] — real programme→domain structure; demand fields
    stay 0/None until ingestion (no fabricated numbers)."""
    _assert_own_institution(institution_id, current_user)
    if not _DEMAND_INGESTION_READY:
        return ResponseModel(data=[])
    try:
        programmes = _school_programmes(current_user, cap=100)
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
        return ResponseModel(data=[r.model_dump(by_alias=True) for r in rows])
    except Exception as exc:  # noqa: BLE001
        log.error("institutions programme_demand failed", error=str(exc))
        return ResponseModel(data=[])


@router.get("/{institution_id}/programme-intelligence", response_model=ResponseModel)
async def get_programme_intelligence(
    institution_id: str,
    query: Optional[str] = None,
    discipline: Optional[str] = None,
    current_user: dict = Depends(Auth.require_admin),
):
    """Return recorded programme-to-domain structure, not labour demand."""
    _assert_own_institution(institution_id, current_user)
    try:
        programmes = _school_programmes(current_user, cap=2000)
        if query:
            q = query.strip().casefold()
            programmes = [row for row in programmes if q in str(row.get("name") or "").casefold()]
        if discipline:
            programmes = [row for row in programmes if str(row.get("discipline") or "") == discipline]
        programme_ids = [str(row["id"]) for row in programmes if row.get("id")]
        links = _programme_domain_rows(programme_ids, cap=20000)
        by_programme: dict[str, list[dict]] = {}
        for link in links:
            if link.get("programme_id"):
                by_programme.setdefault(str(link["programme_id"]), []).append(link)
        domain_map = _domain_map([str(link["domain_id"]) for link in links if link.get("domain_id")])
        rows: list[ProgrammeIntelligenceRow] = []
        for programme in programmes:
            programme_id = str(programme.get("id"))
            programme_links = by_programme.get(programme_id, [])
            badges = [
                ProgrammeDomainBadge(
                    domain_id=(domain_map.get(str(link.get("domain_id")), {}).get("domain_key") or str(link.get("domain_id") or "")),
                    short_label=(domain_map.get(str(link.get("domain_id")), {}).get("name") or "Unlabelled domain"),
                    match_type=str(link.get("match_type") or "adjacent"),
                )
                for link in programme_links
                if link.get("domain_id")
            ]
            counts = {
                kind: sum(1 for link in programme_links if str(link.get("match_type") or "adjacent") == kind)
                for kind in ("direct", "functional", "adjacent")
            }
            rows.append(
                ProgrammeIntelligenceRow(
                    id=programme_id,
                    programme_name=str(programme.get("name") or ""),
                    discipline=programme.get("discipline"),
                    qualification=programme.get("qualification"),
                    domains=badges[:8],
                    domain_overflow=max(len(badges) - 8, 0) or None,
                    direct_domains=counts["direct"],
                    functional_domains=counts["functional"],
                    adjacent_domains=counts["adjacent"],
                    source_status="recorded" if programme_links else "no_mapping_recorded",
                )
            )
        return ResponseModel(data=[row.model_dump(by_alias=True) for row in rows])
    except Exception as exc:  # noqa: BLE001
        log.error("institutions programme_intelligence failed", error=str(exc))
        return ResponseModel(data=[], message="Programme intelligence is temporarily unavailable.")


@router.get("/{institution_id}/domain-ranking", response_model=ResponseModel)
async def get_domain_ranking(
    institution_id: str,
    scope: Literal["nigerian", "global", "remote"] = "nigerian",
    current_user: dict = Depends(Auth.require_admin),
):
    """list[DomainRankItem] — ranked by a structural PROXY (how many of the
    school's programmes feed each domain), since posting volume isn't ingested.
    postings_per_month stays 0; bar_ratio comes from the feeder count."""
    _assert_own_institution(institution_id, current_user)
    if not _DEMAND_INGESTION_READY:
        return ResponseModel(data=[])
    try:
        programmes = _school_programmes(current_user, cap=1000)
        rank_lens = _RANK_LENS[scope]
        prog_ids = [p["id"] for p in programmes]
        pd_rows = _programme_domain_rows(prog_ids)
        # Structural feeder count per domain. This is not a demand ranking.
        feeders: dict = {}
        for r in pd_rows:
            did = r["domain_id"]
            feeders[did] = feeders.get(did, 0) + 1
        if not feeders:
            return ResponseModel(data=[])
        dmap = _domain_map(list(feeders.keys()))
        max_feeders = max(feeders.values())
        ranked = sorted(
            feeders.items(),
            key=lambda kv: kv[1],
            reverse=True,
        )[:50]
        rows = []
        for i, (did, n) in enumerate(ranked):
            latest = _latest_demand(did, rank_lens)
            postings = int(latest.get("postings_count") or 0)
            rows.append(
                DomainRankItem(
                    rank=i + 1,
                    domain_id=(dmap.get(did, {}).get("domain_key") or did),
                    domain_name=(dmap.get(did, {}).get("name") or "—"),
                    route_note=f"{n} programme(s) feed this domain",
                    postings_per_month=postings,
                    bar_ratio=round(n / max_feeders, 3) if max_feeders else None,
                    trend_pct=latest.get("postings_yoy"),
                    trend_direction=(
                        "up"
                        if (latest.get("postings_yoy") or 0) > 0
                        else "down"
                        if (latest.get("postings_yoy") or 0) < 0
                        else "flat"
                    ) if latest else None,
                    value_band=latest.get("value_band"),
                    quadrant=latest.get("quadrant"),
                    interpretation=latest.get("interpretation") or latest.get("plain_label"),
                )
            )
        return ResponseModel(data=[r.model_dump(by_alias=True) for r in rows])
    except Exception as exc:  # noqa: BLE001
        log.error("institutions domain_ranking failed", error=str(exc))
        return ResponseModel(data=[])


@router.get("/{institution_id}/alerts", response_model=ResponseModel)
async def get_alerts(
    institution_id: str,
    current_user: dict = Depends(Auth.require_admin),
):
    """list[IntelligenceAlert] — empty until ingestion."""
    _assert_own_institution(institution_id, current_user)
    # TODO(institutions): surface gaps / drift / opportunity signals
    rows: List[IntelligenceAlert] = []
    return ResponseModel(data=[r.model_dump(by_alias=True) for r in rows])


@router.get("/{institution_id}/programme-skill-coverage", response_model=ResponseModel)
async def get_programme_skill_coverage(
    institution_id: str,
    current_user: dict = Depends(Auth.require_admin),
):
    """Return CCMAS teaching versus sourced market/practice evidence.

    The programme curriculum is the teaching baseline. Domain, subgroup and
    role skills, tools and certifications are the sourced market/practice
    comparison layer. A ``bridge`` item is therefore a gap candidate when it
    is not evidenced in the programme profile; it is not an accreditation
    instruction. Employment-posting, salary and vacancy metrics remain owned
    by the separate Market Intelligence route.
    """
    _assert_own_institution(institution_id, current_user)
    try:
        svc = _svc()
        programmes = _school_programmes(current_user, cap=2000)
        programme_ids = [str(row.get("id")) for row in programmes if row.get("id")]
        if not programme_ids:
            return ResponseModel(data=[])

        mappings = (
            svc.table("programme_mapping")
            .select("programme_id, jamb_programme_id")
            .in_("programme_id", programme_ids)
            .limit(20000)
            .execute()
            .data
        ) or []
        jamb_ids = list({str(row.get("jamb_programme_id")) for row in mappings if row.get("jamb_programme_id")})
        jamb_by_programme: dict[str, list[str]] = {}
        for row in mappings:
            if row.get("programme_id") and row.get("jamb_programme_id"):
                jamb_by_programme.setdefault(str(row["programme_id"]), []).append(str(row["jamb_programme_id"]))

        jamb_rows = (
            svc.table("jamb_programmes")
            .select("id, skills_technical, skills_transferable")
            .in_("id", jamb_ids)
            .limit(20000)
            .execute()
            .data
        ) or [] if jamb_ids else []
        jamb_skills = {str(row.get("id")): row for row in jamb_rows if row.get("id")}

        domain_links = _programme_domain_rows(programme_ids, cap=20000)
        domain_ids = list({str(row.get("domain_id")) for row in domain_links if row.get("domain_id")})
        domain_rows = (
            svc.table("domains")
            .select("id, domain_key, name, foundation_skills")
            .in_("id", domain_ids)
            .limit(20000)
            .execute()
            .data
        ) or [] if domain_ids else []
        domain_by_id = {str(row.get("id")): row for row in domain_rows if row.get("id")}

        subgroup_rows = (
            svc.table("domain_subgroups")
            .select("id, domain_id, label, cluster_skills")
            .in_("domain_id", domain_ids)
            .limit(20000)
            .execute()
            .data
        ) or [] if domain_ids else []
        subgroup_by_domain: dict[str, list[dict]] = {}
        subgroup_names: dict[str, str] = {}
        for row in subgroup_rows:
            if row.get("id"):
                subgroup_names[str(row["id"])] = str(row.get("label") or "")
            if row.get("domain_id"):
                subgroup_by_domain.setdefault(str(row["domain_id"]), []).append(row)

        role_rows = (
            svc.table("domain_roles")
            .select("id, role_key, domain_id, subgroup_id, role_name, essential_skills, optional_skills")
            .in_("domain_id", domain_ids)
            .limit(40000)
            .execute()
            .data
        ) or [] if domain_ids else []
        roles_by_domain: dict[str, list[dict]] = {}
        for row in role_rows:
            if row.get("domain_id"):
                roles_by_domain.setdefault(str(row["domain_id"]), []).append(row)

        # The domain, subgroup and role resource tables are already consumed by
        # the public detail routes. Read them here as optional evidence layers;
        # if an additive table is absent on an older test database, that layer
        # stays unavailable instead of becoming invented data.
        def optional_rows(builder) -> list[dict]:
            try:
                return builder().execute().data or []
            except Exception as resource_exc:  # noqa: BLE001
                log.debug("institutions curriculum resource layer unavailable", error=str(resource_exc))
                return []

        domain_bridge_rows = optional_rows(lambda: svc.table("domain_bridge_skills").select("domain_id, skill_name, category").in_("domain_id", domain_ids).limit(40000)) if domain_ids else []
        role_bridge_rows = optional_rows(lambda: svc.table("role_bridge_skills").select("domain_id, role_id, skill_name, category").in_("domain_id", domain_ids).limit(80000)) if domain_ids else []
        tool_rows = optional_rows(lambda: svc.table("domain_tools").select("*").in_("domain_id", domain_ids).limit(80000)) if domain_ids else []
        certification_rows = optional_rows(lambda: svc.table("domain_certifications").select("*").in_("domain_id", domain_ids).limit(80000)) if domain_ids else []
        role_tool_rows = optional_rows(lambda: svc.table("domain_tools").select("*").in_("domain_id", domain_ids).eq("scope", "role").limit(80000)) if domain_ids else []
        role_cert_rows = optional_rows(lambda: svc.table("role_certifications").select("*").limit(80000))
        learning_resource_rows = optional_rows(
            lambda: svc.table("career_learning_resources")
            .select("*")
            .in_("domain_id", domain_ids)
            .limit(150000)
        ) if domain_ids else []

        programme_names = {str(row.get("id")): str(row.get("name") or "") for row in programmes if row.get("id")}
        links_by_programme: dict[str, list[dict]] = {}
        for link in domain_links:
            if link.get("programme_id") and link.get("domain_id"):
                links_by_programme.setdefault(str(link["programme_id"]), []).append(link)

        def skill_names(value: object) -> list[str]:
            if not isinstance(value, list):
                return []
            return [str(item).strip() for item in value if isinstance(item, str) and item.strip()]

        def unique(values: list[str]) -> list[str]:
            seen: set[str] = set()
            result: list[str] = []
            for value in values:
                key = " ".join(value.casefold().split())
                if key and key not in seen:
                    seen.add(key)
                    result.append(value)
            return result

        def resource_details(kind: str, value: str, row: dict | None = None) -> dict:
            """Build the comparison metadata without inventing equivalence."""
            source_row = row or {}
            aliases = _source_aliases(source_row)
            identities = {_canonical_item_key(value)} | {
                _canonical_item_key(alias) for alias in aliases
            }
            taught = kind == "skill" and bool(identities & curriculum_keys)
            data_state = str(source_row.get("data_state") or "").strip() or None
            source_confidence = str(source_row.get("source_confidence") or "").strip() or None
            market_state = (
                "source_review"
                if data_state in {"unsourced", "partial", "review", "source_review"}
                else "market_practice_evidence"
            )
            curriculum_state = "taught" if taught else "not_evidenced"
            if market_state == "source_review":
                curriculum_state = "source_review"
            explanation = (
                "This canonical skill identity is evidenced in the CCMAS outcome profile."
                if taught
                else "This sourced market/practice item is not evidenced by the programme outcome profile. Review the curriculum and source before treating it as a teaching change."
            )
            return {
                "canonical_key": _canonical_item_key(value) or None,
                "aliases": aliases,
                "state": "covered" if taught else "bridge",
                "curriculum_state": curriculum_state,
                "market_state": market_state,
                "explanation": explanation,
                "source_confidence": source_confidence,
                "data_state": data_state,
                "evidence_source": _provenance_value(source_row, "source_url", "provider", "source"),
                "observed_at": _provenance_value(source_row, "observed_at", "as_of", "checked_at", "updated_at", "price_as_of"),
                "geography": str(source_row.get("region") or source_row.get("geography") or "").strip() or None,
            }

        def resource_state(kind: str, value: str) -> Literal["covered", "bridge"]:
            return resource_details(kind, value)["state"]

        def make_resource(
            name: str,
            kind: Literal["skill", "tool", "certification"],
            source: Literal["domain", "subgroup", "role"],
            *,
            row: dict | None = None,
            scope_name: str | None = None,
            role_name: str | None = None,
            url: str | None = None,
            provider: str | None = None,
            description: str | None = None,
            resource_type: str | None = None,
        ) -> ProgrammeResourceEvidence:
            source_row = row or {}
            details = resource_details(kind, name, source_row)
            return ProgrammeResourceEvidence(
                name=name,
                kind=kind,
                source=source,
                scope_name=scope_name,
                role_name=role_name,
                url=url,
                provider=provider,
                description=description,
                resource_type=resource_type,
                **details,
            )

        def learning_kind(resource_type: object) -> Literal["skill", "tool", "certification"] | None:
            kind = str(resource_type or "").strip().casefold()
            if kind in {"skill_reference", "skill_learning", "competency_reference"}:
                return "skill"
            if kind == "tool_learning":
                return "tool"
            if kind in {"certification_exam", "professional_body"}:
                return "certification"
            # Domain and role overview links explain the route but are not one
            # of the three resource kinds in this coverage report.
            return None

        reports: list[ProgrammeSkillCoverage] = []
        for programme_id in programme_ids:
            technical: list[str] = []
            transferable: list[str] = []
            for jamb_id in jamb_by_programme.get(programme_id, []):
                row = jamb_skills.get(jamb_id) or {}
                technical.extend(skill_names(row.get("skills_technical")))
                transferable.extend(skill_names(row.get("skills_transferable")))
            technical = unique(technical)
            transferable = unique(transferable)
            curriculum = unique(technical + transferable)
            curriculum_keys = {_canonical_item_key(value) for value in curriculum}
            coverage_domains: list[ProgrammeDomainSkillCoverage] = []
            for link in links_by_programme.get(programme_id, []):
                domain_id = str(link["domain_id"])
                domain = domain_by_id.get(domain_id) or {}
                domain_resources: list[ProgrammeResourceEvidence] = []

                def add_learning_resource(row: dict, source: Literal["domain", "subgroup", "role"], *, scope_name: str | None = None, role_name: str | None = None) -> None:
                    kind = learning_kind(row.get("resource_type"))
                    value = str(row.get("target_name") or "").strip()
                    url = str(row.get("url") or "").strip()
                    if not kind or not value or not url:
                        return
                    domain_resources.append(make_resource(
                        value,
                        kind,
                        source,
                        row=row,
                        scope_name=scope_name,
                        role_name=role_name,
                        url=url,
                        provider=str(row.get("provider") or "").strip() or None,
                        description=str(row.get("description") or "").strip() or None,
                        resource_type=str(row.get("resource_type") or "").strip() or None,
                    ))

                for value in skill_names(domain.get("foundation_skills")):
                    domain_resources.append(make_resource(value, "skill", "domain"))
                for row in domain_bridge_rows:
                    if str(row.get("domain_id")) == domain_id and row.get("skill_name"):
                        value = str(row["skill_name"]).strip()
                        domain_resources.append(make_resource(value, "skill", "domain", row=row))
                for row in tool_rows:
                    if str(row.get("domain_id")) == domain_id and row.get("scope") == "domain" and row.get("tool_name"):
                        value = str(row["tool_name"]).strip()
                        domain_resources.append(make_resource(value, "tool", "domain", row=row, url=str(row.get("tool_url") or "").strip() or None, provider=str(row.get("source") or "").strip() or None))
                for row in certification_rows:
                    if str(row.get("domain_id")) == domain_id and row.get("placement") in {"gateway", "role_hint"} and row.get("name"):
                        value = str(row["name"]).strip()
                        domain_resources.append(make_resource(value, "certification", "domain", row=row, url=str(row.get("official_url") or "").strip() or None, description=str(row.get("body") or "").strip() or None))
                for row in learning_resource_rows:
                    if str(row.get("domain_id")) == domain_id and not row.get("subgroup_id") and not row.get("role_id"):
                        add_learning_resource(row, "domain")
                for subgroup in subgroup_by_domain.get(domain_id, []):
                    subgroup_name = str(subgroup.get("label") or "") or None
                    for value in skill_names(subgroup.get("cluster_skills")):
                        domain_resources.append(make_resource(value, "skill", "subgroup", row=subgroup, scope_name=subgroup_name))
                    for row in tool_rows:
                        if str(row.get("domain_id")) == domain_id and str(row.get("subgroup_id")) == str(subgroup.get("id")) and row.get("tool_name"):
                            value = str(row["tool_name"]).strip()
                            domain_resources.append(make_resource(value, "tool", "subgroup", row=row, scope_name=subgroup_name, url=str(row.get("tool_url") or "").strip() or None, provider=str(row.get("source") or "").strip() or None))
                    for row in certification_rows:
                        if str(row.get("domain_id")) == domain_id and str(row.get("subgroup_id")) == str(subgroup.get("id")) and row.get("placement") == "subgroup" and row.get("name"):
                            value = str(row["name"]).strip()
                            domain_resources.append(make_resource(value, "certification", "subgroup", row=row, scope_name=subgroup_name, url=str(row.get("official_url") or "").strip() or None, description=str(row.get("body") or "").strip() or None))
                    for row in learning_resource_rows:
                        if str(row.get("domain_id")) == domain_id and str(row.get("subgroup_id")) == str(subgroup.get("id")) and not row.get("role_id"):
                            add_learning_resource(row, "subgroup", scope_name=subgroup_name)
                for role in roles_by_domain.get(domain_id, []):
                    role_name = str(role.get("role_name") or "") or None
                    subgroup_name = subgroup_names.get(str(role.get("subgroup_id"))) or None
                    for value in skill_names(role.get("essential_skills")) + skill_names(role.get("optional_skills")):
                        domain_resources.append(make_resource(value, "skill", "role", scope_name=subgroup_name, role_name=role_name))
                    for row in role_bridge_rows:
                        if str(row.get("domain_id")) == domain_id and str(row.get("role_id")) in {str(role.get("id")), str(role.get("role_key"))} and row.get("skill_name"):
                            value = str(row["skill_name"]).strip()
                            domain_resources.append(make_resource(value, "skill", "role", row=row, scope_name=subgroup_name, role_name=role_name))
                    for row in role_tool_rows:
                        if str(row.get("domain_id")) == domain_id and str(row.get("role_id")) == str(role.get("id")) and row.get("tool_name"):
                            value = str(row["tool_name"]).strip()
                            domain_resources.append(make_resource(value, "tool", "role", row=row, scope_name=subgroup_name, role_name=role_name, url=str(row.get("tool_url") or "").strip() or None, provider=str(row.get("source") or "").strip() or None))
                    role_key = str(role.get("role_key") or "")
                    for row in role_cert_rows:
                        if str(row.get("role_key")) == role_key and row.get("name"):
                            value = str(row["name"]).strip()
                            domain_resources.append(make_resource(value, "certification", "role", row=row, scope_name=subgroup_name, role_name=role_name, url=str(row.get("official_url") or "").strip() or None, description=str(row.get("body") or "").strip() or None, provider=str(row.get("source") or "").strip() or None))
                    for row in learning_resource_rows:
                        if str(row.get("domain_id")) == domain_id and str(row.get("role_id")) == str(role.get("id")):
                            add_learning_resource(row, "role", scope_name=subgroup_name, role_name=role_name)

                # Keep the evidence list readable without losing the domain
                # grouping. The same skill can legitimately appear at more
                # than one level, so dedupe by skill + evidence scope.
                seen_evidence: set[tuple[str, str, str, str, str]] = set()
                deduped: list[ProgrammeResourceEvidence] = []
                for evidence in domain_resources:
                    key = (evidence.canonical_key or _canonical_item_key(evidence.name), evidence.kind, evidence.source, evidence.scope_name or "", evidence.role_name or "")
                    if key not in seen_evidence:
                        seen_evidence.add(key)
                        deduped.append(evidence)
                covered_count = sum(1 for evidence in deduped if evidence.state == "covered")
                bridge_count = sum(1 for evidence in deduped if evidence.state == "bridge")
                match_type = str(link.get("match_type") or "review_only")
                status = "complete" if curriculum and deduped else "source_missing"
                if match_type not in {"direct", "functional", "adjacent"}:
                    status = "review_only"
                if not curriculum:
                    explanation = "The programme learning-outcome profile is not recorded, so no bridge can be calculated yet."
                elif not deduped:
                    explanation = "This mapped domain does not yet have source-backed skill evidence to compare."
                else:
                    explanation = "Sourced market/practice resources are domain, subgroup and role skills, tools and certifications. Items not evidenced by the programme outcome profile are gap candidates for review; exact-name skill overlap is only an initial evidence check, and tools/certifications remain candidates unless programme evidence is added."
                coverage_domains.append(ProgrammeDomainSkillCoverage(
                    domain_id=str(domain.get("domain_key") or domain_id),
                    domain_name=str(domain.get("name") or "Domain not named"),
                    match_type=match_type,
                    curriculum_skills=curriculum,
                    resources=deduped,
                    covered_count=covered_count,
                    bridge_count=bridge_count,
                    coverage_status=status,
                    explanation=explanation,
                    priority={"direct": 1, "functional": 2, "adjacent": 3}.get(match_type),
                    market_state=(
                        "market_practice_evidence"
                        if any(evidence.market_state == "market_practice_evidence" for evidence in deduped)
                        else "source_review" if deduped else "insufficient_evidence"
                    ),
                ))
            reports.append(ProgrammeSkillCoverage(
                programme_id=programme_id,
                programme_name=programme_names.get(programme_id) or "Programme not named",
                curriculum_skills=curriculum,
                curriculum_technical=technical,
                curriculum_transferable=transferable,
                curriculum_status="complete" if curriculum else "source_missing",
                domains=coverage_domains,
            ))
        return ResponseModel(data=[report.model_dump(by_alias=True) for report in reports])
    except Exception as exc:  # noqa: BLE001
        log.error("institutions curriculum skill coverage failed", error=str(exc))
        return ResponseModel(data=[])


@router.get("/{institution_id}/skills-gap", response_model=ResponseModel)
async def get_legacy_skills_gap(
    institution_id: str,
    current_user: dict = Depends(Auth.require_admin),
):
    """Retained compatibility route for the former demand-shaped response.

    It intentionally returns no rows: demand-shaped skill gaps are not the
    programme curriculum view and there is no approved labour-market feed.
    Clients should use ``programme-skill-coverage`` instead.
    """
    _assert_own_institution(institution_id, current_user)
    return ResponseModel(data=[])


@router.get("/{institution_id}/role-demand", response_model=ResponseModel)
async def get_role_demand(
    institution_id: str,
    current_user: dict = Depends(Auth.require_admin),
):
    """list[RoleDemandRow] — roles reachable from the school's domains. Demand
    and salary fields stay None until ingestion (no fabricated numbers)."""
    _assert_own_institution(institution_id, current_user)
    if not _DEMAND_INGESTION_READY:
        return ResponseModel(data=[])
    try:
        programmes = _school_programmes(current_user, cap=1000)
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
        rows = []
        for r in (rres.data or []):
            role_key = r.get("role_key") or ""
            local = _latest_role_demand(role_key, "ng_local")
            global_row = _latest_role_demand(role_key, "global")
            remote = _latest_role_demand(role_key, "ng_remote")
            primary = local or remote or global_row or {}
            rows.append(
                RoleDemandRow(
                    role_id=role_key,
                    role_name=r.get("role_name") or "",
                    domain_name=(dmap.get(r.get("domain_id"), {}).get("name")),
                    ng_postings=local.get("postings_count"),
                    global_postings=global_row.get("postings_count"),
                    remote_pct=remote.get("remote_pct") or local.get("remote_pct"),
                    salary_min=primary.get("salary_min"),
                    salary_max=primary.get("salary_max"),
                    trend_pct=primary.get("trend_pct") or primary.get("postings_yoy"),
                    rank_lens="nigerian" if local else "remote" if remote else "global" if global_row else None,
                    value_band=primary.get("value_band"),
                    quadrant=primary.get("quadrant"),
                    interpretation=primary.get("interpretation"),
                    top_employers=primary.get("top_employers") or [],
                    top_certifications=primary.get("top_certs") or [],
                )
            )
        return ResponseModel(data=[r.model_dump(by_alias=True) for r in rows])
    except Exception as exc:  # noqa: BLE001
        log.error("institutions role_demand failed", error=str(exc))
        return ResponseModel(data=[])


@router.get("/{institution_id}/peers", response_model=ResponseModel)
async def get_peers(
    institution_id: str,
    current_user: dict = Depends(Auth.require_admin),
):
    """Peer-institution comparison (ADMIN-ONLY, Phase 6.8).

    Compares schools on DOMAIN coverage + ROLE coverage. Each
    school resolves to its reachable-domain set via school → school_programmes →
    programme_mapping → CCMAS programme → programme_domain → domains. Role
    coverage = distinct roles in those domains. `unique_domains` = domains the
    current school covers that a peer does not.
    """
    _assert_own_institution(institution_id, current_user)
    try:
        svc = _svc()
        # Resolve the current admin's school (may be None → all-programmes self).
        self_school_id = _resolve_org(current_user)

        # A bounded peer set: universities with the most school_programmes rows.
        # (Cheap proxy for "biggest portfolios" without a heavy aggregate.)
        schools_res = (
            svc.table("schools")
            .select("id, name, institution_type")
            .eq("institution_type", "university")
            .limit(15)
            .execute()
        )
        peer_schools = schools_res.data or []
        # Ensure the current school is included even if outside the sample.
        if self_school_id and all(s["id"] != self_school_id for s in peer_schools):
            me = svc.table("schools").select("id, name, institution_type").eq("id", self_school_id).limit(1).execute()
            if me.data:
                peer_schools = [me.data[0], *peer_schools][:15]

        def _reachable_domains(school_id: str) -> set:
            prog_ids = _institution_programme_ids(school_id)
            if not prog_ids:
                return set()
            pd = _programme_domain_rows(prog_ids)
            return {r["domain_id"] for r in pd}

        # Compute each peer's domain set once.
        coverage: dict = {}
        all_domain_ids: set = set()
        for s in peer_schools:
            dset = _reachable_domains(s["id"])
            coverage[s["id"]] = dset
            all_domain_ids |= dset

        # Domain attributes: name only; this is a structural comparison.
        dmeta = _domain_map(list(all_domain_ids))
        # Role counts per domain (bounded single query over the involved domains).
        role_counts: dict = {}
        if all_domain_ids:
            rc = (
                svc.table("domain_roles")
                .select("domain_id")
                .in_("domain_id", list(all_domain_ids))
                .limit(5000)
                .execute()
            )
            for r in (rc.data or []):
                did = r.get("domain_id")
                role_counts[did] = role_counts.get(did, 0) + 1
        my_domains = coverage.get(self_school_id, set()) if self_school_id else set()
        rows: List[PeerInstitutionRow] = []
        for s in peer_schools:
            dset = coverage.get(s["id"], set())
            is_self = bool(self_school_id and s["id"] == self_school_id)
            # Domains I have that this peer lacks (only meaningful vs self).
            unique = None
            if self_school_id and not is_self:
                diff = [dmeta.get(d, {}).get("name") for d in (my_domains - dset)]
                unique = [n for n in diff if n][:12] or None
            rows.append(
                PeerInstitutionRow(
                    institution_name=s.get("name") or "",
                    domains_accessible=len(dset),
                    roles_accessible=sum(role_counts.get(d, 0) for d in dset),
                    unique_domains=unique,
                    is_self=is_self,
                )
            )
        # Strongest coverage first.
        rows.sort(key=lambda r: r.domains_accessible, reverse=True)
        return ResponseModel(data=[r.model_dump(by_alias=True) for r in rows])
    except Exception as exc:  # noqa: BLE001
        log.error("institutions peers failed", error=str(exc))
        return ResponseModel(data=[])


# ─────────────────────────────────────────────────────────────
# Affiliation (aggregate attribution, self-reported, k-anonymised)
# NOTE: this exposes a COUNT only. No individual student rows are
# ever returned — by design there is no roster endpoint.
# ─────────────────────────────────────────────────────────────

@router.get("/{institution_id}/affiliation", response_model=ResponseModel)
async def get_affiliation_stats(
    institution_id: str,
    current_user: dict = Depends(Auth.require_admin),
):
    """AffiliationStats — aggregate, k-anonymised.

    Until ingestion: affiliated_students=None + below_threshold=True placeholder.
    No individual student data is exposed here or anywhere in this module.
    """
    org_id = _assert_own_institution(institution_id, current_user)
    school_row = (
        _svc()
        .table("schools")
        .select("school_code")
        .eq("id", org_id or institution_id)
        .limit(1)
        .execute()
        .data
        or [None]
    )[0]
    # Keep the aggregate endpoint honest when an older/mocked registry client
    # returns an unexpected value instead of a school row.
    school = school_row if isinstance(school_row, dict) else {}
    count = 0
    try:
        result = _svc().table("student_affiliations").select("student_id", count="exact", head=True).eq("school_id", org_id or institution_id).execute()
        count = int(result.count or 0)
    except Exception as exc:  # noqa: BLE001
        log.warning("institutions: affiliation count unavailable", error=str(exc))
    stats = AffiliationStats(
        # The caller's resolved org, not the raw path value — echoing back
        # whatever was in the URL is how "me" ended up as an institution code.
        organization_id=org_id or institution_id,
        affiliated_students=count if count >= 5 else None,
        below_threshold=count < 5,
        school_code=school.get("school_code") or "",
    )
    return ResponseModel(data=stats.model_dump(by_alias=True))


# ─────────────────────────────────────────────────────────────
# Domain Reach Audit (§5.1) — CURRICULUM STRUCTURE ONLY.
# Every number here comes from the CCMAS mapping tables. Nothing in
# this section is market/demand data, and nothing is estimated: when a
# table cannot be read the counts stay 0 and rank stays None, with a
# message saying so.
# ─────────────────────────────────────────────────────────────

@router.get("/{institution_id}/domain-reach", response_model=ResponseModel)
async def get_domain_reach(
    institution_id: str,
    current_user: dict = Depends(Auth.require_admin),
):
    """DomainReachAudit — how much of the CCMAS domain universe this
    institution's programme portfolio reaches, and what it misses."""
    org_id = _assert_own_institution(institution_id, current_user)
    try:
        programmes = _school_programmes(current_user, cap=1000)
        prog_ids = [p["id"] for p in programmes]
        pd_rows = _programme_domain_rows(prog_ids)
        buckets = _reach_buckets(pd_rows)
        reached = buckets["all"]

        domains = _all_domains()
        universe = len(domains) or _CCMAS_DOMAIN_UNIVERSE

        by_prog: dict = {}
        for r in pd_rows:
            by_prog.setdefault(r.get("programme_id"), []).append(r)
        breakdown: List[ProgrammeDomainReachRow] = []
        for p in programmes:
            b = _reach_buckets(by_prog.get(p["id"], []))
            breakdown.append(
                ProgrammeDomainReachRow(
                    programme_id=p["id"],
                    programme_name=p.get("name") or "",
                    direct=len(b["direct"]),
                    functional=len(b["functional"]),
                    adjacent=len(b["adjacent"]),
                    total=len(b["all"]),
                )
            )
        breakdown.sort(key=lambda r: r.total, reverse=True)

        clusters: dict = {}
        for d in domains:
            if d.get("id") in reached:
                continue
            clusters.setdefault(d.get("cluster") or "Unclassified", []).append(
                DomainRef(domain_key=d.get("domain_key") or "", name=d.get("name") or "")
            )
        unreached_by_cluster = [
            UnreachedClusterRow(
                cluster=cluster,
                domains=sorted(refs, key=lambda x: x.domain_key),
            )
            for cluster, refs in sorted(clusters.items())
        ]
        unreached_count = (
            sum(len(c.domains) for c in unreached_by_cluster)
            if domains
            else max(universe - len(reached), 0)
        )

        reach_by_school, _schools = _national_reach_index()
        national_rank, total_institutions = _rank_of(org_id, reach_by_school)

        audit = DomainReachAudit(
            institution_id=org_id or "",
            programme_count=len(programmes),
            total_domains=len(reached),
            direct_domains=len(buckets["direct"]),
            functional_domains=len(buckets["functional"]),
            adjacent_domains=len(buckets["adjacent"]),
            unreached_domains=unreached_count,
            domain_universe=universe,
            national_rank=national_rank,
            total_institutions=total_institutions,
            programme_breakdown=breakdown,
            unreached_by_cluster=unreached_by_cluster,
        )
        message = None
        if not reached:
            message = (
                "No CCMAS domain mappings are linked to this institution's "
                "programmes yet, so domain reach cannot be computed."
            )
        elif national_rank is None:
            message = (
                "National rank is unavailable: the cross-institution reach "
                "index could not be built."
            )
        return ResponseModel(data=audit.model_dump(by_alias=True), message=message)
    except Exception as exc:  # noqa: BLE001
        log.error("institutions domain_reach failed", error=str(exc))
        audit = DomainReachAudit(institution_id=org_id or "")
        return ResponseModel(
            data=audit.model_dump(by_alias=True),
            message="Domain reach is temporarily unavailable.",
        )


@router.get("/{institution_id}/domain-reach/leaderboard", response_model=ResponseModel)
async def get_domain_reach_leaderboard(
    institution_id: str,
    filter_: Literal["all", "federal", "state", "private"] = Query(
        "all", alias="filter"
    ),
    current_user: dict = Depends(Auth.require_admin),
):
    """National leaderboard by domain reach.

    IMPORTANT — the federal/state/private filter cannot be honoured: the
    `schools` registry records `institution_type` (university /
    secondary_school / …) but has NO ownership/control column and no `state`
    column. Rather than guess a control from the name, those filters return an
    empty list with a message, and `control`/`state` stay None on every row.
    """
    org_id = _assert_own_institution(institution_id, current_user)
    if filter_ != "all":
        return ResponseModel(
            data=[],
            message=(
                "Institution control (federal/state/private) is not recorded "
                "in the school registry, so this filter cannot be applied. "
                "Use filter=all."
            ),
        )
    try:
        reach_by_school, schools_by_id = _national_reach_index()
        if not reach_by_school:
            return ResponseModel(
                data=[],
                message=(
                    "The cross-institution domain reach index could not be "
                    "built, so no leaderboard is available."
                ),
            )

        ordered = sorted(
            reach_by_school.items(), key=lambda kv: len(kv[1]["all"]), reverse=True
        )
        # Standard competition ranking in one pass: equal totals share a rank.
        ranks: dict = {}
        prev_total = None
        for idx, (_sid, b) in enumerate(ordered):
            total = len(b["all"])
            if total != prev_total:
                ranks[total] = idx + 1
                prev_total = total

        rows: List[DomainReachLeaderboardRow] = []
        for school_id, b in ordered[:200]:
            school = schools_by_id.get(school_id) or {}
            total = len(b["all"])
            rank = ranks.get(total, 1)
            rows.append(
                DomainReachLeaderboardRow(
                    institution_id=school_id,
                    institution_name=school.get("name") or "",
                    control=None,  # not recorded — see docstring
                    institution_type=school.get("institution_type"),
                    state=school.get("state"),
                    total_domains=total,
                    direct_domains=len(b["direct"]),
                    functional_domains=len(b["functional"]),
                    adjacent_domains=len(b["adjacent"]),
                    national_rank=rank,
                    is_self=bool(org_id and school_id == org_id),
                )
            )
        return ResponseModel(data=[r.model_dump(by_alias=True) for r in rows])
    except Exception as exc:  # noqa: BLE001
        log.error("institutions domain_reach_leaderboard failed", error=str(exc))
        return ResponseModel(
            data=[], message="The domain reach leaderboard is temporarily unavailable."
        )


# ─────────────────────────────────────────────────────────────
# Student Intelligence (§5.5) — AGGREGATE ROLLUP ONLY.
# Groups the existing affiliation/roster data by users.provenance. There
# is deliberately no per-student field on the response model, so no
# individual record can leak through this endpoint even by accident;
# the domain mix is additionally suppressed below the k threshold.
# ─────────────────────────────────────────────────────────────

@router.get("/{institution_id}/student-intelligence", response_model=ResponseModel)
async def get_student_intelligence(
    institution_id: str,
    current_user: dict = Depends(Auth.require_admin),
):
    """StudentIntelligence — affiliated / self-signed-up / provisioned counts
    plus the aggregate domain mix. No individual student data, ever."""
    org_id = _assert_own_institution(institution_id, current_user)
    try:
        svc = _svc()
        aff = (
            svc.table("student_affiliations")
            .select("student_id")
            .eq("school_id", org_id)
            .limit(20000)
            .execute()
            .data
        ) or []
        student_ids = [a["student_id"] for a in aff if a.get("student_id")]
        total_affiliated = len(student_ids)
        if not total_affiliated:
            stats = StudentIntelligence(organization_id=org_id or "")
            return ResponseModel(
                data=stats.model_dump(by_alias=True),
                message="No students are affiliated with this institution yet.",
            )

        self_count = 0
        provisioned_count = 0
        domain_counts: dict = {}
        directions_seen = 0
        for i in range(0, len(student_ids), 500):
            chunk = student_ids[i:i + 500]
            rows = (
                svc.table("users")
                .select("id, provenance, chosen_direction")
                .in_("id", chunk)
                .execute()
                .data
            ) or []
            for u in rows:
                if (u.get("provenance") or "self") == "provisioned":
                    provisioned_count += 1
                else:
                    self_count += 1
                direction = u.get("chosen_direction") or {}
                key = direction.get("domain_key") if isinstance(direction, dict) else None
                if key:
                    directions_seen += 1
                    domain_counts[key] = domain_counts.get(key, 0) + 1

        unclaimed_codes = 0
        try:
            codes = (
                svc.table("claim_codes")
                .select("id")
                .eq("school_id", org_id)
                .is_("redeemed_at", "null")
                .is_("revoked_at", "null")
                .limit(20000)
                .execute()
                .data
            ) or []
            unclaimed_codes = len(codes)
        except Exception as exc:  # noqa: BLE001
            log.warning("institutions: unclaimed claim_codes read skipped", error=str(exc))

        below_threshold = total_affiliated < _K_ANON_THRESHOLD
        top_domains: List[StudentIntelligenceDomain] = []
        if not below_threshold and directions_seen:
            labels: dict = {}
            try:
                drows = (
                    svc.table("domains")
                    .select("domain_key, name")
                    .in_("domain_key", list(domain_counts.keys()))
                    .execute()
                    .data
                ) or []
                labels = {d["domain_key"]: d.get("name") for d in drows if d.get("domain_key")}
            except Exception as exc:  # noqa: BLE001
                log.warning("institutions: domain label read skipped", error=str(exc))
            ranked = sorted(domain_counts.items(), key=lambda kv: kv[1], reverse=True)[:5]
            top_domains = [
                StudentIntelligenceDomain(
                    domain_key=key,
                    label=labels.get(key) or key,
                    pct=round((n / directions_seen) * 100.0, 1),
                )
                for key, n in ranked
            ]

        stats = StudentIntelligence(
            organization_id=org_id or "",
            total_affiliated=total_affiliated,
            self_signed_up=self_count,
            provisioned_by_you=provisioned_count,
            unclaimed_codes=unclaimed_codes,
            top_domains=top_domains,
            below_threshold=below_threshold,
        )
        message = None
        if below_threshold:
            # The counts themselves are already visible to this admin via the
            # roster totals; it is the per-domain mix that re-identifies a tiny
            # cohort, so only that is withheld.
            message = (
                f"Fewer than {_K_ANON_THRESHOLD} affiliated students — the "
                "domain mix is suppressed."
            )
        elif not directions_seen:
            message = "No affiliated student has chosen a career direction yet."
        return ResponseModel(data=stats.model_dump(by_alias=True), message=message)
    except Exception as exc:  # noqa: BLE001
        log.error("institutions student_intelligence failed", error=str(exc))
        stats = StudentIntelligence(organization_id=org_id or "")
        return ResponseModel(
            data=stats.model_dump(by_alias=True),
            message="Student intelligence is temporarily unavailable.",
        )


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
    current_user: dict = Depends(Auth.require_admin),
):
    """NationalBenchmarkRow rows — institution vs national aggregate.

    Computes three comparisons (postings per month, entry salary, remote %)
    across the institution's reachable domains vs the national average for
    the given scope. Returns empty rows with a notice when no demand data
    has been ingested — never fabricated.
    """
    if not _DEMAND_INGESTION_READY:
        return ResponseModel(
            data=[],
            message="National market benchmarks are unavailable until source-backed labour-market ingestion is added.",
        )
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

# ============================================================
# Sifter LevelUp — Career Intelligence Routes
# READ stubs for the career-intelligence module.
#
# No data ships in this phase — every endpoint returns a
# `coming_soon` DataState envelope: {status, data, meta}.
# Paths, query params and return keys mirror src/types/career.ts
# (the canonical contract). Real NCE/CCMAS rows are imported
# later with zero UI changes.
#
# Public (READ):
#   GET /api/career/programmes               — search (q, institution_type)
#   GET /api/career/programmes/{programme_id}
#   GET /api/career/domains/{domain_id}
#   GET /api/career/roles/{role_id}
#   GET /api/career/opportunities            — filter (programme_id, domain_id, institution_type)
#
# User-owned (auth required, READ-only for now):
#   GET/POST/DELETE /api/career/saved
#   GET/POST        /api/career/notes
#   GET/POST/DELETE /api/career/subscriptions
# ============================================================
from typing import Any, Optional
from datetime import datetime, timezone

from fastapi import APIRouter, Body, Depends

from auth import Auth
from database import db
from logger import log
from models import ResponseModel

router = APIRouter(prefix="/api/career", tags=["career"])

_SCHEMA = "skillup_dev"
_MIN_PUBLIC_QUERY_LEN = 2
_PUBLIC_SEARCH_LIMIT = 20
_PROGRAMME_SEARCH_LIMIT = 25


def _coming_soon(notice: Optional[str] = None) -> dict:
    """Return a `coming_soon` DataState envelope mirroring career.ts comingSoon()."""
    return {
        "status": "coming_soon",
        "data": None,
        "meta": ({"notice": notice} if notice else None),
    }


def _real(data: Any, notice: Optional[str] = None) -> dict:
    """Return a `real` DataState envelope mirroring career.ts real()."""
    return {
        "status": "real",
        "data": data,
        "meta": ({"notice": notice} if notice else None),
    }


def _svc():
    """Service client scoped to the career schema."""
    return db.get_service_client().schema(_SCHEMA)


def _clean_public_query(q: Optional[str]) -> str:
    """Normalize public search text and remove wildcard characters.

    Public career endpoints are intentionally sliced search endpoints, not bulk
    export endpoints. Removing `%` and `_` prevents wildcard-only scraping.
    """
    return (q or "").replace("%", "").replace("_", "").strip()


def _num(v: Any) -> Optional[float]:
    """Coerce a NUMERIC (which PostgREST may hand back as a string) to float."""
    if v is None:
        return None
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


def _now_iso() -> str:
    """UTC now as an ISO-8601 string, for updated_at stamps."""
    return datetime.now(timezone.utc).isoformat()


def _date_str(v: Any) -> Optional[str]:
    """Render a DATE/datetime value as an ISO string, or None."""
    if v is None:
        return None
    return str(v)


# ── Enrichment-aware row mappers (Phase 9) ────────────────────
# Each emits the camelCase shape declared in src/types/career.ts:
#   CertificationV2Enriched, ToolV2Enriched.

def _cert(row: dict) -> dict:
    """Map a domain_certifications row → CertificationV2Enriched (camelCase)."""
    return {
        "name": row.get("name"),
        "body": row.get("body"),
        "region": row.get("region"),
        "level": row.get("level"),
        "gateReason": row.get("gate_reason"),
        # Phase 9 enrichment
        "officialUrl": row.get("official_url"),
        "seniorityTier": row.get("seniority_tier"),
        "tierType": row.get("tier_type"),
        "price": _num(row.get("price")),
        "currency": row.get("currency"),
        "priceAsOf": _date_str(row.get("price_as_of")),
        "priceSource": row.get("price_source"),
    }


def _tool(row: dict) -> dict:
    """Map a domain_tools row → ToolV2Enriched (camelCase)."""
    return {
        "tool": row.get("tool_name"),
        "group": row.get("tool_group"),
        "hot": bool(row.get("hot")),
        "inDemand": bool(row.get("in_demand")),
        "roleFreq": row.get("role_freq"),
        "source": row.get("source"),
        # Phase 9 enrichment
        "demandScore": _num(row.get("demand_score")),
        "demandSource": row.get("demand_source"),
        "demandAsOf": _date_str(row.get("demand_as_of")),
        "toolUrl": row.get("tool_url"),
    }


def _tool_groups(rows: list[dict]) -> dict:
    """Split tool rows into distinctive/common ToolGroups(Enriched)."""
    distinctive: list[dict] = []
    common: list[dict] = []
    for r in rows or []:
        mapped = _tool(r)
        if r.get("tool_group") == "distinctive":
            distinctive.append(mapped)
        else:
            common.append(mapped)
    return {"distinctive": distinctive, "common": common}


def _foundation_skills(domain: dict) -> list[dict]:
    """Domain foundation_skills JSONB + parallel foundation_skill_uris map →
    FoundationSkillEnriched[] (skill/prevalence/n + ESCO uri by name)."""
    uris = domain.get("foundation_skill_uris") or {}
    out: list[dict] = []
    for s in (domain.get("foundation_skills") or []):
        name = s.get("skill")
        out.append(
            {
                "skill": name,
                "prevalence": _num(s.get("prevalence")),
                "n": s.get("n"),
                "uri": uris.get(name) if isinstance(uris, dict) else None,
            }
        )
    return out


def _uri_at(uris: Any, idx: int) -> Optional[str]:
    """Defensive index into a parallel URI array (JSONB list)."""
    if isinstance(uris, list) and 0 <= idx < len(uris):
        return uris[idx]
    return None


# ── Public READ endpoints ─────────────────────────────────────

@router.get("/programmes", response_model=ResponseModel)
async def list_programmes(
    q: Optional[str] = None,
    institution_type: Optional[str] = None,
    limit: int = _PROGRAMME_SEARCH_LIMIT,
):
    """Search the canonical programme registry. Returns ProgrammeSearchResult[]."""
    term = _clean_public_query(q)
    safe_limit = max(1, min(limit, _PROGRAMME_SEARCH_LIMIT))
    if len(term) < _MIN_PUBLIC_QUERY_LEN:
        return ResponseModel(
            data=_real(
                [],
                "Type at least two characters to search programmes. Bulk listing is not exposed.",
            )
        )
    try:
        query = (
            db.get_service_client()
            .schema(_SCHEMA)
            .table("programmes")
            .select("id, name, display_name, institution_type, discipline")
        )
        like = f"%{term}%"
        query = query.or_(f"name.ilike.{like},display_name.ilike.{like}")
        if institution_type:
            query = query.eq("institution_type", institution_type)
        res = query.order("name").limit(safe_limit).execute()
        items = [
            {
                "id": r["id"],
                "name": r["name"],
                "institutionType": r.get("institution_type") or "university",
                "discipline": r.get("discipline"),
            }
            for r in (res.data or [])
        ]
        return ResponseModel(data=_real(items))
    except Exception as exc:  # noqa: BLE001 — degrade gracefully to the UI's pending state
        log.error("career list_programmes failed", error=str(exc))
        return ResponseModel(data=_coming_soon("Programme search is temporarily unavailable."))


def _dedup(values: Any) -> list[str]:
    """Order-preserving dedup of a JSONB string list."""
    if not isinstance(values, list):
        return []
    seen: set[str] = set()
    out: list[str] = []
    for v in values:
        if not isinstance(v, str):
            continue
        s = v.strip()
        key = s.lower()
        if s and key not in seen:
            seen.add(key)
            out.append(s)
    return out


def _programme_skills(svc: Any, programme_id: str) -> dict:
    """"What this degree teaches", for a CANONICAL programme.

    The skills profile lives on `jamb_programmes` (built from CCMAS course
    learning outcomes), and a programme reaches it through `programme_mapping`.
    This endpoint never made that hop, so ProgrammeOverviewScreen — the main
    place a student reads "what this degree teaches" — rendered the component's
    "not been mapped yet" empty state for EVERY programme, including the 133 of
    239 that do have a profile. The honest empty state was hiding a wiring gap
    rather than a data gap, which is the one thing it must not do.

    80 programmes have more than one JAMB name mapped to them. Their outcomes
    are unioned: the canonical programme is what those names collapse into, so
    the union is what studying it covers. Deduped case-insensitively, because
    shared CCMAS courses repeat verbatim across names.

    Degrades to an empty profile rather than failing the page.
    """
    try:
        pm = (
            svc.table("programme_mapping")
            .select("jamb_programme_id")
            .eq("programme_id", programme_id)
            .execute()
        )
        jamb_ids = [x["jamb_programme_id"] for x in (pm.data or []) if x.get("jamb_programme_id")]
        if not jamb_ids:
            return {"skillsTechnical": [], "skillsTransferable": [], "skillsCount": 0}
        jp = (
            svc.table("jamb_programmes")
            .select("skills_technical, skills_transferable")
            .in_("id", jamb_ids)
            .execute()
        )
        technical: list[str] = []
        transferable: list[str] = []
        for row in jp.data or []:
            technical.extend(_dedup(row.get("skills_technical")))
            transferable.extend(_dedup(row.get("skills_transferable")))
        technical = _dedup(technical)
        transferable = _dedup(transferable)
        return {
            "skillsTechnical": technical,
            "skillsTransferable": transferable,
            "skillsCount": len(technical) + len(transferable),
        }
    except Exception as exc:  # noqa: BLE001
        log.warning("programme skills lookup skipped", error=str(exc))
        return {"skillsTechnical": [], "skillsTransferable": [], "skillsCount": 0}


@router.get("/programmes/{programme_id}", response_model=ResponseModel)
async def get_programme(programme_id: str):
    """Programme detail incl. its domain links (grouped/sorted client-side).

    Reads `programme_domain` (match_type, in_demand_score, elite_flag) joined to
    `domains` for names, so ProgrammeOverviewScreen can render the Direct →
    Functional → Adjacent domain tiers. Degrades to `coming_soon` on miss/error.
    """
    try:
        svc = _svc()
        res = (
            svc.table("programmes")
            .select("*")
            .eq("id", programme_id)
            .limit(1)
            .execute()
        )
        if not res.data:
            return ResponseModel(data=_coming_soon("Programme not found."))
        r = res.data[0]
        duration = r.get("duration_years")

        # Domain links for this programme (Phase 2 mapping).
        pd_res = (
            svc.table("programme_domain")
            .select("domain_id, match_type, in_demand_score, elite_flag")
            .eq("programme_id", programme_id)
            .execute()
        )
        links = pd_res.data or []
        domains: list = []
        if links:
            domain_ids = [link["domain_id"] for link in links]
            dres = (
                svc.table("domains")
                .select("id, domain_key, name")
                .in_("id", domain_ids)
                .execute()
            )
            by_id = {d["id"]: d for d in (dres.data or [])}
            for link in links:
                d = by_id.get(link["domain_id"])
                if not d:
                    continue
                domains.append(
                    {
                        # domainId is the stable domain_key the domain route expects.
                        "domainId": d.get("domain_key") or d["id"],
                        "domainName": d.get("name"),
                        "matchType": link.get("match_type") or "adjacent",
                        "inDemandScore": _num(link.get("in_demand_score")),
                        "eliteFlag": bool(link.get("elite_flag")),
                    }
                )

        programme = {
            "id": r["id"],
            "name": r["name"],
            "displayName": r.get("display_name"),
            "institutionType": r.get("institution_type") or "university",
            "discipline": r.get("discipline"),
            "qualification": r.get("qualification"),
            "durationYears": float(duration) if duration is not None else None,
            "domains": domains,
            **_programme_skills(svc, programme_id),
        }
        notice = None if domains else "Domain links are being populated."
        return ResponseModel(data=_real(programme, notice=notice))
    except Exception as exc:  # noqa: BLE001
        log.error("career get_programme failed", error=str(exc))
        return ResponseModel(data=_coming_soon("Programme detail is temporarily unavailable."))


# Declared BEFORE /domains/{domain_id} — FastAPI matches in definition order,
# and a literal path registered after a parameterised sibling is unreachable.
@router.get("/domains", response_model=ResponseModel)
async def list_domain_clusters():
    """Every domain, grouped by cluster — the context-free Domain Explorer.

    This endpoint did not exist. `careerData.getDomainClusters()` was a stub
    returning a hardcoded `coming_soon`, so the Domain Explorer — linked from
    the main Explore page as "Browse all clusters" — was permanently empty,
    under a header that asserted "168 domains across 37 clusters". The data was
    there the whole time (160 domains, 35 clusters); nothing read it.

    `inDemandScore` is the ng_local volume score. The three lenses (ng_local,
    ng_remote, global) are kept separate by product rule — local is the right
    default for the Nigerian student this screen serves — so this deliberately
    does NOT blend them.
    """
    try:
        svc = _svc()
        res = (
            svc.table("domains")
            .select("id, domain_key, name, cluster, elite_domain, excluded")
            .order("cluster")
            .execute()
        )
        rows = [r for r in (res.data or []) if not r.get("excluded")]
        if not rows:
            return ResponseModel(data=_coming_soon("Domains are being populated."))

        scores: dict[str, float] = {}
        try:
            dm = (
                svc.table("domain_demand_metrics")
                .select("domain_id, volume_score")
                .eq("rank_lens", "ng_local")
                .execute()
            )
            for m in dm.data or []:
                v = _num(m.get("volume_score"))
                if v is not None:
                    scores[m["domain_id"]] = v
        except Exception as exc:  # noqa: BLE001
            # Demand is an enrichment, not the point of the screen.
            log.warning("domain demand lookup skipped", error=str(exc))

        grouped: dict[str, list] = {}
        for r in rows:
            entry = {
                # The domain route keys on domain_key, not the uuid.
                "id": r.get("domain_key") or r["id"],
                "name": r.get("name"),
                "eliteFlag": bool(r.get("elite_domain")),
            }
            score = scores.get(r["id"])
            if score is not None:
                entry["inDemandScore"] = score
            grouped.setdefault(r.get("cluster") or "Other", []).append(entry)

        out = [
            {"cluster": cluster, "domains": sorted(domains, key=lambda d: d["name"] or "")}
            for cluster, domains in sorted(grouped.items())
        ]
        return ResponseModel(data=_real(out))
    except Exception as exc:  # noqa: BLE001
        log.error("career list_domain_clusters failed", error=str(exc))
        return ResponseModel(data=_coming_soon("The domain explorer is temporarily unavailable."))


@router.get("/domains/{domain_id}", response_model=ResponseModel)
async def get_domain(domain_id: str):
    """Domain detail (foundation skills, subgroups, tools, certs) with Phase 9
    enrichment. `{domain_id}` is the stable domain_key (e.g. "D001"). Returns a
    `real` DomainV2Enriched envelope, degrading to `coming_soon` on miss/error."""
    try:
        svc = _svc()
        dres = (
            svc.table("domains")
            .select("*")
            .eq("domain_key", domain_id)
            .limit(1)
            .execute()
        )
        if not dres.data:
            return ResponseModel(data=_coming_soon("Domain not found."))
        domain = dres.data[0]
        domain_uuid = domain["id"]

        # Subgroups, roles, tools, certs (each scoped to the domain).
        sg_res = (
            svc.table("domain_subgroups")
            .select("*")
            .eq("domain_id", domain_uuid)
            .execute()
        )
        role_res = (
            svc.table("domain_roles")
            .select(
                "role_key, role_name, also_known_as, tier, subgroup_id, elite_status, elite_flag"
            )
            .eq("domain_id", domain_uuid)
            .execute()
        )
        tool_res = (
            svc.table("domain_tools")
            .select("*")
            .eq("domain_id", domain_uuid)
            .execute()
        )
        cert_res = (
            svc.table("domain_certifications")
            .select("*")
            .eq("domain_id", domain_uuid)
            .execute()
        )

        tool_rows = tool_res.data or []
        cert_rows = cert_res.data or []

        # Domain-scoped tools (subgroup tools attach to their subgroup below).
        domain_tools = [t for t in tool_rows if t.get("scope") == "domain"]

        # Certs split by placement; subgroup certs attach to their subgroup.
        gateway = [_cert(c) for c in cert_rows if c.get("placement") == "gateway"]
        role_hint = [_cert(c) for c in cert_rows if c.get("placement") == "role_hint"]

        # Subgroups — each carries its cluster skills, tools and specialisation certs.
        subgroups = []
        for sg in (sg_res.data or []):
            sg_id = sg["id"]
            sg_tools = [t for t in tool_rows if t.get("subgroup_id") == sg_id]
            sg_certs = [
                _cert(c)
                for c in cert_rows
                if c.get("subgroup_id") == sg_id and c.get("placement") == "subgroup"
            ]
            subgroups.append(
                {
                    "id": sg_id,
                    "iscoSubmajor": sg.get("isco_submajor"),
                    "name": sg.get("label"),
                    "description": sg.get("description"),
                    "roleCount": sg.get("role_count"),
                    "clusterSkills": sg.get("cluster_skills") or [],
                    "clusterSkillUris": sg.get("cluster_skill_uris") or {},
                    "tools": _tool_groups(sg_tools),
                    "certifications": sg_certs,
                }
            )

        roles = [
            {
                "key": r.get("role_key"),
                "name": r.get("role_name"),
                "tier": r.get("tier"),
                "alsoKnownAs": r.get("also_known_as") or [],
                "subgroupId": r.get("subgroup_id"),
                "eliteStatus": r.get("elite_status"),
            }
            for r in (role_res.data or [])
        ]

        data = {
            "id": domain.get("domain_key"),
            "name": domain.get("name"),
            "cluster": domain.get("cluster"),
            "clusters": domain.get("clusters") or [],
            "description": domain.get("description"),
            "institutionType": domain.get("institution_type") or [],
            "eliteDomain": bool(domain.get("elite_domain")),
            "foundationSkills": _foundation_skills(domain),
            "foundationSkillUris": domain.get("foundation_skill_uris") or {},
            "roleCount": domain.get("role_count"),
            "tools": _tool_groups(domain_tools),
            "gatewayCertifications": gateway,
            "roleHintCertifications": role_hint,
            "subgroups": subgroups,
            "roles": roles,
        }
        return ResponseModel(data=_real(data))
    except Exception as exc:  # noqa: BLE001 — degrade gracefully to the UI's pending state
        log.error("career get_domain failed", error=str(exc))
        return ResponseModel(data=_coming_soon("Domain detail is temporarily unavailable."))


@router.get("/roles/{role_id}", response_model=ResponseModel)
async def get_role(role_id: str):
    """Role detail (essential/optional skills + ESCO URIs, tier, appearsIn,
    currency status) with Phase 9 enrichment. `{role_id}` is the stable role_key
    (e.g. "D001|securities trader"). Returns a `real` DomainRoleV2Enriched
    envelope, degrading to `coming_soon` on miss/error."""
    try:
        svc = _svc()
        rres = (
            svc.table("domain_roles")
            .select("*")
            .eq("role_key", role_id)
            .limit(1)
            .execute()
        )
        if not rres.data:
            return ResponseModel(data=_coming_soon("Role not found."))
        role = rres.data[0]

        essential = role.get("essential_skills") or []
        optional = role.get("optional_skills") or []
        essential_uris = role.get("essential_skill_uris") or []
        optional_uris = role.get("optional_skill_uris") or []

        # Parallel URI arrays are index-aligned; be defensive about length mismatch.
        essential_uri_list = [_uri_at(essential_uris, i) for i in range(len(essential))]
        optional_uri_list = [_uri_at(optional_uris, i) for i in range(len(optional))]

        # appearsIn — the same role_name may be reachable from several domains.
        appears_in: list[dict] = []
        role_name = role.get("role_name")
        if role_name:
            same = (
                svc.table("domain_roles")
                .select("role_key, domain_id")
                .eq("role_name", role_name)
                .execute()
            )
            rows = same.data or []
            domain_ids = list({r["domain_id"] for r in rows if r.get("domain_id")})
            dmap: dict[str, dict] = {}
            if domain_ids:
                dref = (
                    svc.table("domains")
                    .select("id, domain_key, name")
                    .in_("id", domain_ids)
                    .execute()
                )
                dmap = {d["id"]: d for d in (dref.data or [])}
            for r in rows:
                d = dmap.get(r.get("domain_id"))
                if d:
                    appears_in.append(
                        {
                            "domainId": d.get("domain_key"),
                            "domainName": d.get("name"),
                            "roleKey": r.get("role_key"),
                        }
                    )

        data = {
            "key": role.get("role_key"),
            "name": role.get("role_name"),
            "tier": role.get("tier"),
            "alsoKnownAs": role.get("also_known_as") or [],
            "iscoGroup": role.get("isco_group"),
            "escoCode": role.get("esco_code"),
            "eliteStatus": role.get("elite_status"),
            "essentialSkills": essential,
            "optionalSkills": optional,
            "essentialSkillUris": essential_uri_list,
            "optionalSkillUris": optional_uri_list,
            "appearsIn": appears_in,
            # Phase 9 currency status
            "currencyStatus": role.get("currency_status"),
            "currencyVerifiedAt": _date_str(role.get("currency_verified_at")),
            "currencySource": role.get("currency_source"),
        }
        return ResponseModel(data=_real(data))
    except Exception as exc:  # noqa: BLE001
        log.error("career get_role failed", error=str(exc))
        return ResponseModel(data=_coming_soon("Role detail is temporarily unavailable."))


# ── Phase 7 content: opportunities · elite pathways · scholarships ─
# Tables ship empty (live data only); every list endpoint degrades to a
# coming_soon envelope until content rows exist.

def _opportunity_out(r: dict, org: Optional[dict]) -> dict:
    return {
        "id": r.get("id"),
        "title": r.get("title"),
        "organisation": {
            "id": (org or {}).get("id") or r.get("organisation_id") or "",
            "name": (org or {}).get("name") or "",
            "sector": (org or {}).get("sector"),
            "country": (org or {}).get("country"),
            "nigeriaOffice": (org or {}).get("nigeria_office"),
            "likelihood": (org or {}).get("likelihood"),
        },
        "type": r.get("opp_type"),
        "scope": r.get("scope"),
        "workMode": r.get("work_mode"),
        "eligibleInstitutionTypes": r.get("eligible_institution_types") or [],
        "domainIds": r.get("domain_keys") or [],
        "roleIds": r.get("role_keys") or [],
        "country": r.get("country"),
        "salaryNgnMin": _num(r.get("salary_ngn_min")),
        "salaryNgnMax": _num(r.get("salary_ngn_max")),
        "applicationWindow": r.get("application_window"),
        "applicationDeadline": _date_str(r.get("application_deadline")),
        "careersUrl": r.get("careers_url"),
        "visaRoute": r.get("visa_route"),
        "likelihood": r.get("likelihood"),
        "description": r.get("description"),
        "skills": r.get("skills") or [],
        "certifications": r.get("certifications") or [],
    }


def _orgs_by_id(rows: list) -> dict:
    ids = list({r.get("organisation_id") for r in rows if r.get("organisation_id")})
    if not ids:
        return {}
    res = _svc().table("organisations").select("*").in_("id", ids).execute()
    return {o["id"]: o for o in (res.data or [])}


@router.get("/opportunities", response_model=ResponseModel)
async def list_opportunities(
    domain_id: Optional[str] = None,
    institution_type: Optional[str] = None,
    scope: Optional[str] = None,
    opp_type: Optional[str] = None,
    work_mode: Optional[str] = None,
    likelihood: Optional[str] = None,
    region: Optional[str] = None,
    limit: int = 60,
):
    """Opportunities hub list. Filters mirror OpportunityFilter in career.ts."""
    try:
        query = _svc().table("opportunities").select("*").eq("active", True)
        if domain_id:
            query = query.contains("domain_keys", [domain_id])
        if institution_type:
            query = query.contains("eligible_institution_types", [institution_type])
        if scope:
            query = query.eq("scope", scope)
        if opp_type:
            query = query.eq("opp_type", opp_type)
        if work_mode:
            query = query.eq("work_mode", work_mode)
        if likelihood:
            query = query.eq("likelihood", likelihood)
        if region:
            query = query.eq("region", region)
        rows = query.order("created_at", desc=True).limit(min(limit, 100)).execute().data or []
        if not rows:
            return ResponseModel(data=_coming_soon("Opportunities are coming soon."))
        orgs = _orgs_by_id(rows)
        return ResponseModel(data=_real([_opportunity_out(r, orgs.get(r.get("organisation_id"))) for r in rows]))
    except Exception as exc:  # noqa: BLE001
        log.error("career list_opportunities failed", error=str(exc))
        return ResponseModel(data=_coming_soon("Opportunities are temporarily unavailable."))


@router.get("/opportunities/{opportunity_id}", response_model=ResponseModel)
async def get_opportunity(opportunity_id: str):
    try:
        res = _svc().table("opportunities").select("*").eq("id", opportunity_id).limit(1).execute()
        row = (res.data or [None])[0]
        if not row:
            return ResponseModel(data=_coming_soon("This opportunity is no longer available."))
        orgs = _orgs_by_id([row])
        return ResponseModel(data=_real(_opportunity_out(row, orgs.get(row.get("organisation_id")))))
    except Exception as exc:  # noqa: BLE001
        log.error("career get_opportunity failed", error=str(exc))
        return ResponseModel(data=_coming_soon("Opportunity detail is temporarily unavailable."))


@router.get("/elite-pathways", response_model=ResponseModel)
async def list_elite_pathways():
    """ElitePathwaySummary[] for the elite hub."""
    try:
        rows = (
            _svc().table("elite_pathways")
            .select("id, name, cluster, firms, compensation_label, selectivity_label, nigerian_advantage")
            .eq("active", True).order("name").execute().data or []
        )
        if not rows:
            return ResponseModel(data=_coming_soon("Elite pathways are coming soon."))
        return ResponseModel(data=_real([
            {
                "id": r["id"], "name": r["name"], "cluster": r.get("cluster"),
                "firms": r.get("firms") or [],
                "compensationLabel": r.get("compensation_label"),
                "selectivityLabel": r.get("selectivity_label"),
                "nigerianAdvantage": bool(r.get("nigerian_advantage")),
                "eliteFlag": True,
            }
            for r in rows
        ]))
    except Exception as exc:  # noqa: BLE001
        log.error("career list_elite_pathways failed", error=str(exc))
        return ResponseModel(data=_coming_soon("Elite pathways are temporarily unavailable."))


@router.get("/elite-pathways/{pathway_id}", response_model=ResponseModel)
async def get_elite_pathway(pathway_id: str):
    try:
        res = _svc().table("elite_pathways").select("*").eq("id", pathway_id).limit(1).execute()
        r = (res.data or [None])[0]
        if not r:
            return ResponseModel(data=_coming_soon("This elite pathway is not published yet."))
        return ResponseModel(data=_real({
            "id": r["id"], "name": r["name"], "cluster": r.get("cluster"),
            "firms": r.get("firms") or [],
            "compensationLabel": r.get("compensation_label"),
            "selectivityLabel": r.get("selectivity_label"),
            "nigerianAdvantage": bool(r.get("nigerian_advantage")),
            "eliteFlag": True,
            "description": r.get("description"),
            "formation": r.get("formation") or [],
            "pinnacle": r.get("pinnacle") or [],
            "bridgePlanId": r.get("bridge_plan_id"),
        }))
    except Exception as exc:  # noqa: BLE001
        log.error("career get_elite_pathway failed", error=str(exc))
        return ResponseModel(data=_coming_soon("Elite pathway detail is temporarily unavailable."))


@router.get("/bridge-plans/{plan_id}", response_model=ResponseModel)
async def get_bridge_plan(plan_id: str):
    try:
        res = _svc().table("bridge_plans").select("*").eq("id", plan_id).limit(1).execute()
        r = (res.data or [None])[0]
        if not r:
            return ResponseModel(data=_coming_soon("This bridge plan is not published yet."))
        return ResponseModel(data=_real({
            "id": r["id"], "from": r.get("from_label"), "to": r.get("to_label"),
            "layers": r.get("layers") or [],
            "coveredUserTypes": r.get("covered_user_types") or [],
        }))
    except Exception as exc:  # noqa: BLE001
        log.error("career get_bridge_plan failed", error=str(exc))
        return ResponseModel(data=_coming_soon("Bridge plan is temporarily unavailable."))


@router.get("/scholarships", response_model=ResponseModel)
async def list_scholarships(limit: int = 60):
    try:
        rows = (
            _svc().table("scholarships").select("*").eq("active", True)
            .order("name").limit(min(limit, 100)).execute().data or []
        )
        if not rows:
            return ResponseModel(data=_coming_soon("Scholarships are coming soon."))
        return ResponseModel(data=_real([
            {
                "id": r["id"], "name": r["name"], "funded": r.get("funded"),
                "level": r.get("level_label"), "destination": r.get("destination"),
                "disciplines": r.get("disciplines") or [],
                "opensLabel": r.get("opens_label"), "url": r.get("url"),
            }
            for r in rows
        ]))
    except Exception as exc:  # noqa: BLE001
        log.error("career list_scholarships failed", error=str(exc))
        return ResponseModel(data=_coming_soon("Scholarships are temporarily unavailable."))


@router.get("/application-windows", response_model=ResponseModel)
async def list_application_windows(limit: int = 60):
    """Windows with status DERIVED from opens_at/closes_at so rows never go stale."""
    try:
        rows = (
            _svc().table("application_windows").select("*")
            .order("closes_at", desc=False).limit(min(limit, 100)).execute().data or []
        )
        if not rows:
            return ResponseModel(data=_coming_soon("Application windows are coming soon."))
        today = datetime.now(timezone.utc).date()
        out = []
        for r in rows:
            opens = r.get("opens_at")
            closes = r.get("closes_at")
            opens_d = datetime.fromisoformat(str(opens)).date() if opens else None
            closes_d = datetime.fromisoformat(str(closes)).date() if closes else None
            if closes_d and closes_d < today:
                status = "closed"
            elif opens_d and opens_d > today:
                status = "opening_soon"
            elif closes_d and (closes_d - today).days <= 14:
                status = "closing_soon"
            else:
                status = "open"
            out.append({
                "id": r["id"], "title": r["title"],
                "organisationName": r.get("organisation_name"),
                "status": status,
                "whenLabel": r.get("when_label")
                or (f"Closes {closes_d.isoformat()}" if closes_d else (f"Opens {opens_d.isoformat()}" if opens_d else "Dates TBC")),
                "opportunityId": r.get("opportunity_id"),
            })
        return ResponseModel(data=_real(out))
    except Exception as exc:  # noqa: BLE001
        log.error("career list_application_windows failed", error=str(exc))
        return ResponseModel(data=_coming_soon("Application windows are temporarily unavailable."))


@router.get("/search", response_model=ResponseModel)
async def search_career(q: Optional[str] = None):
    """Grouped disambiguation search → CareerSearchResult (domains/roles/programmes)."""
    term = _clean_public_query(q)
    if len(term) < _MIN_PUBLIC_QUERY_LEN:
        return ResponseModel(
            data=_real(
                {"domains": [], "roles": [], "programmes": []},
                "Type at least two characters to search. Bulk graph listing is not exposed.",
            )
        )
    try:
        svc = _svc()
        like = f"%{term}%"

        dres = (
            svc.table("domains")
            .select("domain_key, name, cluster")
            .ilike("name", like)
            .order("name")
            .limit(_PUBLIC_SEARCH_LIMIT)
            .execute()
        )
        domains = [
            {"id": d.get("domain_key"), "name": d.get("name"), "cluster": d.get("cluster")}
            for d in (dres.data or [])
        ]

        # Roles: group by role_name, collect the domains each resolves to.
        rres = (
            svc.table("domain_roles")
            .select("role_key, role_name, tier, domain_id")
            .ilike("role_name", like)
            .limit(_PUBLIC_SEARCH_LIMIT * 2)
            .execute()
        )
        role_rows = rres.data or []
        domain_ids = list({r["domain_id"] for r in role_rows if r.get("domain_id")})
        dmap: dict[str, dict] = {}
        if domain_ids:
            dref = (
                svc.table("domains")
                .select("id, domain_key, name")
                .in_("id", domain_ids)
                .execute()
            )
            dmap = {d["id"]: d for d in (dref.data or [])}
        grouped: dict[str, dict] = {}
        for r in role_rows:
            name = r.get("role_name")
            if name is None:
                continue
            entry = grouped.setdefault(name, {"name": name, "tier": r.get("tier"), "domains": []})
            d = dmap.get(r.get("domain_id"))
            if d:
                entry["domains"].append(
                    {
                        "domainId": d.get("domain_key"),
                        "domainName": d.get("name"),
                        "roleKey": r.get("role_key"),
                    }
                )
        roles = list(grouped.values())

        pres = (
            svc.table("programmes")
            .select("id, name, institution_type, discipline")
            .ilike("name", like)
            .order("name")
            .limit(_PUBLIC_SEARCH_LIMIT)
            .execute()
        )
        programmes = [
            {
                "id": p.get("id"),
                "name": p.get("name"),
                "institutionType": p.get("institution_type") or "university",
                "discipline": p.get("discipline"),
            }
            for p in (pres.data or [])
        ]

        return ResponseModel(data=_real({"domains": domains, "roles": roles, "programmes": programmes}))
    except Exception as exc:  # noqa: BLE001
        log.error("career search failed", error=str(exc))
        return ResponseModel(data=_coming_soon("Search is temporarily unavailable."))


@router.get("/pivot", response_model=ResponseModel)
async def get_pivot(from_domain_key: str):
    """Career-changer pivot → PivotResult: domains ranked by transferable-skill
    overlap with `from_domain_key` (from the domain_overlap matrix)."""
    try:
        svc = _svc()
        dres = (
            svc.table("domains")
            .select("id, domain_key, name")
            .eq("domain_key", from_domain_key)
            .limit(1)
            .execute()
        )
        if not dres.data:
            return ResponseModel(data=_coming_soon("Source field not found."))
        src = dres.data[0]

        ores = (
            svc.table("domain_overlap")
            .select("domain_id_b, overlap_score, shared_skills")
            .eq("domain_id_a", src["id"])
            .order("overlap_score", desc=True)
            .limit(20)
            .execute()
        )
        overlap_rows = ores.data or []
        target_ids = list({o["domain_id_b"] for o in overlap_rows if o.get("domain_id_b")})
        dmap: dict[str, dict] = {}
        if target_ids:
            dref = (
                svc.table("domains")
                .select("id, domain_key, name, cluster, elite_domain")
                .in_("id", target_ids)
                .execute()
            )
            dmap = {d["id"]: d for d in (dref.data or [])}
        moves = []
        for o in overlap_rows:
            d = dmap.get(o.get("domain_id_b"))
            if not d:
                continue
            moves.append(
                {
                    "domainId": d.get("domain_key"),
                    "domainName": d.get("name"),
                    "cluster": d.get("cluster"),
                    "eliteFlag": bool(d.get("elite_domain")),
                    "overlapScore": _num(o.get("overlap_score")),
                    "sharedSkills": o.get("shared_skills") or [],
                }
            )

        data = {
            "fromDomain": {"id": src.get("domain_key"), "name": src.get("name")},
            "moves": moves,
        }
        return ResponseModel(data=_real(data))
    except Exception as exc:  # noqa: BLE001
        log.error("career pivot failed", error=str(exc))
        return ResponseModel(data=_coming_soon("Pivot suggestions are temporarily unavailable."))


def _domain_skill_set(svc, domain_uuid: str) -> set:
    """Union of a domain's role essential skills (lowercased) — the skill
    footprint used for have-vs-bridge gap analysis."""
    rres = (
        svc.table("domain_roles")
        .select("essential_skills")
        .eq("domain_id", domain_uuid)
        .execute()
    )
    skills: set = set()
    for r in (rres.data or []):
        for s in (r.get("essential_skills") or []):
            if isinstance(s, str) and s.strip():
                skills.add(s.strip().lower())
    return skills


@router.get("/pivot/gap", response_model=ResponseModel)
async def get_pivot_gap(
    from_domain_key: str,
    to_domain_key: Optional[str] = None,
    to_role_key: Optional[str] = None,
):
    """Career-changer gap analysis (Scenario B1/B2).

    B1: target a domain (`to_domain_key`) → have-vs-bridge on the domain's role
    skills. B2: target a role (`to_role_key`) → gap on that role's essential
    skills. "Have" = skills already in the source domain's footprint; "bridge" =
    the rest (what LevelUp targets). Uses domain_overlap for the headline score.
    """
    try:
        svc = _svc()
        src = (
            svc.table("domains")
            .select("id, domain_key, name")
            .eq("domain_key", from_domain_key)
            .limit(1)
            .execute()
        )
        if not src.data:
            return ResponseModel(data=_coming_soon("Source field not found."))
        src_row = src.data[0]
        have = _domain_skill_set(svc, src_row["id"])

        target_label = None
        target_skills: list = []
        overlap_score = None

        if to_role_key:
            rres = (
                svc.table("domain_roles")
                .select("role_name, essential_skills, domain_id")
                .eq("role_key", to_role_key)
                .limit(1)
                .execute()
            )
            if not rres.data:
                return ResponseModel(data=_coming_soon("Target role not found."))
            role = rres.data[0]
            target_label = role.get("role_name")
            target_skills = [s for s in (role.get("essential_skills") or []) if isinstance(s, str)]
        elif to_domain_key:
            dres = (
                svc.table("domains")
                .select("id, name")
                .eq("domain_key", to_domain_key)
                .limit(1)
                .execute()
            )
            if not dres.data:
                return ResponseModel(data=_coming_soon("Target field not found."))
            tgt = dres.data[0]
            target_label = tgt.get("name")
            target_skills = sorted(_domain_skill_set(svc, tgt["id"]))
            ov = (
                svc.table("domain_overlap")
                .select("overlap_score")
                .eq("domain_id_a", src_row["id"])
                .eq("domain_id_b", tgt["id"])
                .limit(1)
                .execute()
            )
            if ov.data:
                overlap_score = _num(ov.data[0].get("overlap_score"))
        else:
            return ResponseModel(success=False, message="Provide to_domain_key or to_role_key.", data=None)

        have_skills = [s for s in target_skills if s.strip().lower() in have]
        bridge_skills = [s for s in target_skills if s.strip().lower() not in have]
        coverage = (len(have_skills) / len(target_skills)) if target_skills else None

        data = {
            "fromDomain": {"id": src_row.get("domain_key"), "name": src_row.get("name")},
            "target": {"label": target_label, "kind": "role" if to_role_key else "domain"},
            "overlapScore": overlap_score,
            "coverage": coverage,
            "haveSkills": have_skills,
            "bridgeSkills": bridge_skills,
        }
        return ResponseModel(data=_real(data))
    except Exception as exc:  # noqa: BLE001
        log.error("career pivot_gap failed", error=str(exc))
        return ResponseModel(data=_coming_soon("Gap analysis is temporarily unavailable."))


@router.post("/saved/prior-field", response_model=ResponseModel)
async def save_prior_field(
    body: dict = Body(default_factory=dict),
    current_user: dict = Depends(Auth.get_current_user),
):
    """Persist the user's prior-field domain (onboarding for career-changers).

    Stores `prior_field_domain_key` on the user row so the CareerChanger flow can
    seed its `from` domain. Body: {domainKey}.
    """
    domain_key = body.get("domainKey") or body.get("domain_key")
    if not domain_key:
        return ResponseModel(success=False, message="domainKey is required.", data=None)
    try:
        db.get_service_client().table("users").update(
            {"prior_field_domain_key": domain_key}
        ).eq("id", current_user["id"]).execute()
        return ResponseModel(data=_real({"priorFieldDomainKey": domain_key}))
    except Exception as exc:  # noqa: BLE001
        log.error("career save_prior_field failed", error=str(exc))
        return ResponseModel(success=False, message="Could not save your prior field.", data=None)


@router.get("/jamb/{jamb_name:path}/domains", response_model=ResponseModel)
async def get_jamb_domains(jamb_name: str):
    """JAMB name → domains (the student's entry point).

    Reads `jamb_programme_domain` (seeded from the union-of-components mapping)
    and joins `domains` for names/cluster/elite. Returns a JambDomainResult
    shape. Case-insensitive exact match on jamb_name, then a broad ilike
    fallback so partial student input still resolves.
    """
    try:
        svc = _svc()
        # Exact (case-insensitive) first; fall back to ilike contains.
        jres = (
            svc.table("jamb_programme_domain")
            .select("domain_id, match_type")
            .ilike("jamb_name", jamb_name)
            .execute()
        )
        rows = jres.data or []
        if not rows:
            jres = (
                svc.table("jamb_programme_domain")
                .select("domain_id, match_type")
                .ilike("jamb_name", f"%{jamb_name}%")
                .execute()
            )
            rows = jres.data or []
        if not rows:
            return ResponseModel(
                data=_real({"jambName": jamb_name, "domains": []},
                           notice="No domains mapped to this JAMB name yet.")
            )

        # Dedup by domain, keeping the strongest match_type.
        _rank = {"direct": 3, "functional": 2, "adjacent": 1}
        best: dict[str, str] = {}
        for r in rows:
            did = r["domain_id"]
            mt = r.get("match_type") or "adjacent"
            if did not in best or _rank.get(mt, 0) > _rank.get(best[did], 0):
                best[did] = mt

        dref = (
            svc.table("domains")
            .select("id, domain_key, name, cluster, elite_domain")
            .in_("id", list(best.keys()))
            .execute()
        )
        dmap = {d["id"]: d for d in (dref.data or [])}
        domains = []
        for did, mt in best.items():
            d = dmap.get(did)
            if not d:
                continue
            domains.append(
                {
                    "domainId": d.get("domain_key") or did,
                    "domainName": d.get("name"),
                    "cluster": d.get("cluster"),
                    "matchType": mt,
                    "eliteFlag": bool(d.get("elite_domain")),
                }
            )
        # Strongest tiers first for display.
        domains.sort(key=lambda x: _rank.get(x["matchType"], 0), reverse=True)
        return ResponseModel(data=_real({"jambName": jamb_name, "domains": domains}))
    except Exception as exc:  # noqa: BLE001
        log.error("career jamb_domains failed", error=str(exc))
        return ResponseModel(data=_coming_soon("JAMB domain lookup is temporarily unavailable."))


# ── User-owned endpoints (auth required) ──────────────────────


def _saved_out(r: dict) -> dict:
    """Serialise a saved_items row to the SavedItem contract (camelCase)."""
    return {
        "id": r["id"],
        "entityType": r.get("entity_type"),
        "entityId": r.get("entity_id"),
        "label": r.get("label"),
        "createdAt": r.get("created_at"),
    }


@router.get("/saved", response_model=ResponseModel)
async def list_saved(
    current_user: dict = Depends(Auth.get_current_user),
):
    """List the current user's saved items, newest first."""
    try:
        res = (
            _svc()
            .table("saved_items")
            .select("*")
            .eq("user_id", current_user["id"])
            .order("created_at", desc=True)
            .execute()
        )
        return ResponseModel(data=_real([_saved_out(r) for r in (res.data or [])]))
    except Exception as exc:  # noqa: BLE001
        log.error("career list_saved failed", error=str(exc))
        return ResponseModel(data=_coming_soon("Saved items are temporarily unavailable."))


@router.post("/saved", response_model=ResponseModel)
async def create_saved(
    body: dict = Body(default_factory=dict),
    current_user: dict = Depends(Auth.get_current_user),
):
    """Save an item (idempotent per user+entity). Body: {entityType, entityId, label?}."""
    entity_type = body.get("entityType") or body.get("entity_type")
    entity_id = body.get("entityId") or body.get("entity_id")
    if not entity_type or not entity_id:
        return ResponseModel(success=False, message="entityType and entityId are required.", data=None)
    try:
        svc = _svc()
        # Idempotent: if it already exists, return it rather than duplicating.
        existing = (
            svc.table("saved_items")
            .select("*")
            .eq("user_id", current_user["id"])
            .eq("entity_type", entity_type)
            .eq("entity_id", str(entity_id))
            .limit(1)
            .execute()
        )
        if existing.data:
            return ResponseModel(data=_real(_saved_out(existing.data[0])))
        res = (
            svc.table("saved_items")
            .insert(
                {
                    "user_id": current_user["id"],
                    "entity_type": entity_type,
                    "entity_id": str(entity_id),
                    "label": body.get("label"),
                }
            )
            .execute()
        )
        return ResponseModel(data=_real(_saved_out((res.data or [{}])[0])))
    except Exception as exc:  # noqa: BLE001
        log.error("career create_saved failed", error=str(exc))
        return ResponseModel(success=False, message="Could not save that item.", data=None)


@router.delete("/saved/{saved_item_id}", response_model=ResponseModel)
async def delete_saved(
    saved_item_id: str,
    current_user: dict = Depends(Auth.get_current_user),
):
    """Remove one of the current user's saved items."""
    try:
        (
            _svc()
            .table("saved_items")
            .delete()
            .eq("id", saved_item_id)
            .eq("user_id", current_user["id"])
            .execute()
        )
        return ResponseModel(data=_real(None))
    except Exception as exc:  # noqa: BLE001
        log.error("career delete_saved failed", error=str(exc))
        return ResponseModel(success=False, message="Could not remove that item.", data=None)


def _note_out(r: dict) -> dict:
    """Serialise a user_notes row to the Note contract (camelCase)."""
    return {
        "id": r["id"],
        "entityType": r.get("entity_type"),
        "entityId": r.get("entity_id"),
        "body": r.get("body"),
        "category": r.get("category"),
        "entityLabel": r.get("entity_label"),
        "createdAt": r.get("created_at"),
        "updatedAt": r.get("updated_at"),
    }


@router.get("/notes", response_model=ResponseModel)
async def list_notes(
    entity_type: Optional[str] = None,
    entity_id: Optional[str] = None,
    current_user: dict = Depends(Auth.get_current_user),
):
    """List the user's notes. Scoped to one entity when entity_type+entity_id
    given (detail screen); otherwise ALL notes (My World hub, category-sorted)."""
    try:
        query = (
            _svc()
            .table("user_notes")
            .select("*")
            .eq("user_id", current_user["id"])
        )
        if entity_type and entity_id:
            query = query.eq("entity_type", entity_type).eq("entity_id", entity_id)
        res = query.order("updated_at", desc=True).execute()
        return ResponseModel(data=_real([_note_out(r) for r in (res.data or [])]))
    except Exception as exc:  # noqa: BLE001
        log.error("career list_notes failed", error=str(exc))
        return ResponseModel(data=_coming_soon("Notes are temporarily unavailable."))


@router.post("/notes", response_model=ResponseModel)
async def upsert_note(
    body: dict = Body(default_factory=dict),
    current_user: dict = Depends(Auth.get_current_user),
):
    """Create or update a note. Body: {id?, entityType, entityId, body, category?,
    entityLabel?}. With `id` → update that note; without → insert a new one."""
    note_body = body.get("body")
    if not note_body:
        return ResponseModel(success=False, message="Note body is required.", data=None)
    try:
        svc = _svc()
        note_id = body.get("id")
        payload = {
            "entity_type": body.get("entityType") or body.get("entity_type"),
            "entity_id": body.get("entityId") or body.get("entity_id"),
            "body": note_body,
            "category": body.get("category"),
            "entity_label": body.get("entityLabel") or body.get("entity_label"),
            "updated_at": _now_iso(),
        }
        if note_id:
            res = (
                svc.table("user_notes")
                .update(payload)
                .eq("id", note_id)
                .eq("user_id", current_user["id"])
                .execute()
            )
        else:
            payload["user_id"] = current_user["id"]
            res = svc.table("user_notes").insert(payload).execute()
        return ResponseModel(data=_real(_note_out((res.data or [{}])[0])))
    except Exception as exc:  # noqa: BLE001
        log.error("career upsert_note failed", error=str(exc))
        return ResponseModel(success=False, message="Could not save that note.", data=None)


@router.delete("/notes/{note_id}", response_model=ResponseModel)
async def delete_note(
    note_id: str,
    current_user: dict = Depends(Auth.get_current_user),
):
    """Delete one of the current user's notes."""
    try:
        (
            _svc()
            .table("user_notes")
            .delete()
            .eq("id", note_id)
            .eq("user_id", current_user["id"])
            .execute()
        )
        return ResponseModel(data=_real(None))
    except Exception as exc:  # noqa: BLE001
        log.error("career delete_note failed", error=str(exc))
        return ResponseModel(success=False, message="Could not delete that note.", data=None)


def _sub_out(r: dict) -> dict:
    """Serialise an opportunity_subscriptions row to the Subscription contract."""
    return {
        "id": r["id"],
        "target": r.get("target"),
        "targetId": r.get("target_id"),
        "createdAt": r.get("created_at"),
    }


@router.get("/subscriptions", response_model=ResponseModel)
async def list_subscriptions(
    current_user: dict = Depends(Auth.get_current_user),
):
    """List the current user's opportunity subscriptions."""
    try:
        res = (
            _svc()
            .table("opportunity_subscriptions")
            .select("*")
            .eq("user_id", current_user["id"])
            .order("created_at", desc=True)
            .execute()
        )
        return ResponseModel(data=_real([_sub_out(r) for r in (res.data or [])]))
    except Exception as exc:  # noqa: BLE001
        log.error("career list_subscriptions failed", error=str(exc))
        return ResponseModel(data=_coming_soon("Subscriptions are temporarily unavailable."))


@router.post("/subscriptions", response_model=ResponseModel)
async def create_subscription(
    body: dict = Body(default_factory=dict),
    current_user: dict = Depends(Auth.get_current_user),
):
    """Subscribe to a target (idempotent). Body: {target, targetId}."""
    target = body.get("target")
    target_id = body.get("targetId") or body.get("target_id")
    if not target or not target_id:
        return ResponseModel(success=False, message="target and targetId are required.", data=None)
    try:
        svc = _svc()
        existing = (
            svc.table("opportunity_subscriptions")
            .select("*")
            .eq("user_id", current_user["id"])
            .eq("target", target)
            .eq("target_id", str(target_id))
            .limit(1)
            .execute()
        )
        if existing.data:
            return ResponseModel(data=_real(_sub_out(existing.data[0])))
        res = (
            svc.table("opportunity_subscriptions")
            .insert(
                {
                    "user_id": current_user["id"],
                    "target": target,
                    "target_id": str(target_id),
                }
            )
            .execute()
        )
        return ResponseModel(data=_real(_sub_out((res.data or [{}])[0])))
    except Exception as exc:  # noqa: BLE001
        log.error("career create_subscription failed", error=str(exc))
        return ResponseModel(success=False, message="Could not subscribe.", data=None)


@router.delete("/subscriptions/{subscription_id}", response_model=ResponseModel)
async def delete_subscription(
    subscription_id: str,
    current_user: dict = Depends(Auth.get_current_user),
):
    """Remove one of the current user's subscriptions."""
    try:
        (
            _svc()
            .table("opportunity_subscriptions")
            .delete()
            .eq("id", subscription_id)
            .eq("user_id", current_user["id"])
            .execute()
        )
        return ResponseModel(data=_real(None))
    except Exception as exc:  # noqa: BLE001
        log.error("career delete_subscription failed", error=str(exc))
        return ResponseModel(success=False, message="Could not unsubscribe.", data=None)


# ── Mapping feedback (expert review + per-edge flag) ──────────

@router.get("/feedback", response_model=ResponseModel)
async def list_feedback(
    current_user: dict = Depends(Auth.get_current_user),
):
    """Recent mapping feedback (per-edge confirm/flag/suggest), newest first."""
    try:
        res = (
            _svc()
            .table("mapping_feedback")
            .select("*")
            .order("created_at", desc=True)
            .limit(200)
            .execute()
        )
        items = [
            {
                "id": r["id"],
                "edgeType": r.get("edge_type"),
                "sourceId": r.get("source_id"),
                "targetId": r.get("target_id"),
                "feedbackType": r.get("feedback_type"),
                "notes": r.get("notes"),
                "trustWeight": _num(r.get("trust_weight")),
                "expertVerified": bool(r.get("expert_verified")),
                "createdAt": r.get("created_at"),
                "resolvedAt": r.get("resolved_at"),
            }
            for r in (res.data or [])
        ]
        return ResponseModel(data=_real(items))
    except Exception as exc:  # noqa: BLE001
        log.error("career list_feedback failed", error=str(exc))
        return ResponseModel(data=_coming_soon("Feedback is temporarily unavailable."))


@router.post("/feedback", response_model=ResponseModel)
async def create_mapping_feedback(
    body: dict = Body(default_factory=dict),
    current_user: dict = Depends(Auth.get_current_user),
):
    """Submit per-edge mapping feedback. Body: {edgeType, sourceId, targetId,
    feedbackType (confirm|flag|suggest), notes?}. Educators/admins get a higher
    trust weight + expert_verified flag so confirmations raise displayed confidence."""
    edge_type = body.get("edgeType") or body.get("edge_type")
    source_id = body.get("sourceId") or body.get("source_id")
    target_id = body.get("targetId") or body.get("target_id")
    feedback_type = body.get("feedbackType") or body.get("feedback_type")
    if not all([edge_type, source_id, target_id, feedback_type]):
        return ResponseModel(success=False, message="edgeType, sourceId, targetId, feedbackType are required.", data=None)
    if feedback_type not in ("confirm", "flag", "suggest"):
        return ResponseModel(success=False, message="feedbackType must be confirm|flag|suggest.", data=None)
    try:
        is_expert = current_user.get("account_type") in ("institution_admin", "educator")
        res = (
            _svc()
            .table("mapping_feedback")
            .insert(
                {
                    "user_id": current_user["id"],
                    "edge_type": edge_type,
                    "source_id": str(source_id),
                    "target_id": str(target_id),
                    "feedback_type": feedback_type,
                    "notes": body.get("notes"),
                    "trust_weight": 3.0 if is_expert else 1.0,
                    "expert_verified": is_expert,
                }
            )
            .execute()
        )
        return ResponseModel(data=_real((res.data or [{}])[0]), notice="Thanks — your feedback was recorded.")
    except Exception as exc:  # noqa: BLE001
        log.error("career create_mapping_feedback failed", error=str(exc))
        return ResponseModel(success=False, message="Could not record feedback.", data=None)

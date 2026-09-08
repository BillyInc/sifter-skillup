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
import re
from datetime import datetime, timezone

from fastapi import APIRouter, Body, Depends, HTTPException, Query

from auth import Auth
from database import db
from logger import log
from models import ResponseModel

router = APIRouter(prefix="/api/career", tags=["career"])

_SCHEMA = "skillup_dev"
_MIN_PUBLIC_QUERY_LEN = 2
_PUBLIC_SEARCH_LIMIT = 20
_PROGRAMME_SEARCH_LIMIT = 25
_SEARCH_INTENT_COPY = {
    "programme_guidance": (
        "Find a programme",
        "Start with the programme preview, then choose a university and review its requirements.",
    ),
    "university_requirements": (
        "Check a university",
        "Review the university's programmes, location, and admission requirements.",
    ),
    "career_exploration": (
        "Understand a domain or role",
        "Follow the field from domain to subgroup and role, including what to learn next.",
    ),
    "skills_and_tools": (
        "Find skills or tools",
        "See what each item does in its domain, subgroup, or role context.",
    ),
    "opportunities": (
        "Find opportunities",
        "Review relevant opportunities, eligibility, and the next action.",
    ),
}


def _search_intent_copy(intent_key: Optional[str], user_type: Optional[str]) -> Optional[dict[str, str]]:
    """Return plain-language search guidance for the selected persona.

    A current undergraduate is already enrolled, so programme and university
    searches must lead to learning-to-career guidance rather than an admission
    requirements decision.
    """
    if not intent_key or intent_key not in _SEARCH_INTENT_COPY:
        return None
    if user_type == "student" and intent_key == "programme_guidance":
        return {
            "label": "Find your programme",
            "guidance": "See what your programme teaches, then follow it through domains, subgroups, roles, and what to learn next.",
        }
    if user_type == "student" and intent_key == "university_requirements":
        return {
            "label": "Explore your university",
            "guidance": "See the programmes connected to your university and open one to follow its career guidance.",
        }
    label, guidance = _SEARCH_INTENT_COPY[intent_key]
    return {"label": label, "guidance": guidance}
_UNIVERSITY_ALIASES = {
    "unilag": "university of lagos",
    "lasu": "lagos state university",
    "ui": "university of ibadan",
    "unn": "university of nigeria",
    "oau": "obafemi awolowo university",
    "uniben": "university of benin",
    "abu": "ahmadu bello university",
}

_CERT_LIFECYCLE_OVERRIDES = {
    "tensorflow developer certificate": {
        "credential_type": "certification_or_qualification",
        "availability_status": "temporarily_unavailable",
        "current_recommendation": False,
        "retain_in_catalogue": True,
        "reopen_possible": True,
        "availability_note": "The provider has closed the exam while evaluating the next step. Existing credentials remain valid for three years from the date passed. Check the provider for a future route.",
        "official_url": "https://www.tensorflow.org/certificate",
        "status_source_url": "https://www.tensorflow.org/certificate",
    },
    "aws certified machine learning specialty": {
        "credential_type": "certification_or_qualification",
        "availability_status": "retired",
        "current_recommendation": False,
        "retain_in_catalogue": True,
        "reopen_possible": False,
        "availability_note": "AWS retired this exam on 31 March 2026. Existing certifications remain active for three years from the date earned. New learners should consider AWS Certified Machine Learning Engineer - Associate.",
        "official_url": "https://aws.amazon.com/certification/certified-machine-learning-specialty/",
        "status_source_url": "https://aws.amazon.com/certification/certified-machine-learning-specialty/",
        "replacement_name": "AWS Certified Machine Learning Engineer - Associate",
        "replacement_url": "https://aws.amazon.com/certification/certified-machine-learning-engineer-associate/",
    },
    "microsoft certified azure data engineer associate": {
        "credential_type": "certification_or_qualification",
        "availability_status": "retired",
        "current_recommendation": False,
        "retain_in_catalogue": True,
        "reopen_possible": False,
        "availability_note": "Microsoft retired this certification and its renewal assessment on 31 March 2025. Existing badges may remain valid until their individual expiry, but new learners should use the current Microsoft Fabric data-engineering route.",
        "official_url": "https://learn.microsoft.com/en-us/credentials/certifications/azure-data-engineer/renew/",
        "status_source_url": "https://learn.microsoft.com/en-us/credentials/certifications/azure-data-engineer/renew/",
        "replacement_name": "Microsoft Certified: Fabric Data Engineer Associate",
        "replacement_url": "https://learn.microsoft.com/en-us/credentials/certifications/fabric-data-engineer-associate/",
    },
    "microsoft certified azure ai engineer associate": {
        "credential_type": "certification_or_qualification",
        "availability_status": "retired",
        "current_recommendation": False,
        "retain_in_catalogue": True,
        "reopen_possible": False,
        "availability_note": "Microsoft retired this certification on 30 June 2026. Existing credentials follow Microsoft's retirement and expiry rules; new learners should use the current Azure AI applications and agents route.",
        "official_url": "https://learn.microsoft.com/en-us/credentials/support/credential-retirement",
        "status_source_url": "https://learn.microsoft.com/en-us/credentials/support/credential-retirement",
        "replacement_name": "Microsoft Certified: Azure AI Apps and Agents Developer Associate",
        "replacement_url": "https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-apps-and-agents-developer-associate",
    },
    "microsoft certified azure developer associate": {
        "credential_type": "certification_or_qualification",
        "availability_status": "retired",
        "current_recommendation": False,
        "retain_in_catalogue": True,
        "reopen_possible": False,
        "availability_note": "Microsoft retired this certification on 31 July 2026. Existing credentials follow Microsoft's retirement and expiry rules; new learners should use the current Azure AI cloud developer route where it matches their goal.",
        "official_url": "https://learn.microsoft.com/en-us/credentials/certifications/azure-developer/renew/",
        "status_source_url": "https://learn.microsoft.com/en-us/credentials/certifications/azure-developer/renew/",
        "replacement_name": "Microsoft Certified: Azure AI Cloud Developer Associate",
        "replacement_url": "https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-cloud-developer-associate/",
    },
    "salesforce certified associate retail crm adjacent": {
        "credential_type": "certification_or_qualification",
        "availability_status": "superseded",
        "current_recommendation": False,
        "retain_in_catalogue": True,
        "reopen_possible": False,
        "availability_note": "Salesforce now presents this entry-level route as Salesforce Certified Platform Foundations. The older Associate name is retained as historical identity, while new learners should follow the current Platform Foundations route.",
        "official_url": "https://trailhead.salesforce.com/en/credentials/associate",
        "status_source_url": "https://trailhead.salesforce.com/en/credentials/associate",
        "replacement_name": "Salesforce Certified Platform Foundations",
        "replacement_url": "https://trailhead.salesforce.com/en/credentials/associate",
    },
}


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


def _published_elite_entity_ids(entity_level: str) -> set[str]:
    """Return only explicitly published elite records.

    The legacy ``elite_domain`` and ``elite_flag`` columns are retained as
    audit inputs, but they are not publication evidence. During a rolling
    migration this helper safely returns an empty set until the evidence-gate
    table exists and contains a published review.
    """
    try:
        rows = (
            _svc().table("elite_evidence_reviews")
            .select("entity_id, domain_id")
            .eq("entity_level", entity_level)
            .eq("decision", "published")
            .execute().data or []
        )
        ids: set[str] = set()
        for row in rows:
            for key in ("entity_id", "domain_id"):
                if row.get(key):
                    ids.add(str(row[key]))
        return ids
    except Exception as exc:  # noqa: BLE001
        log.debug("elite evidence gate unavailable", entity_level=entity_level, error=str(exc))
        return set()


def _clean_public_query(q: Optional[str]) -> str:
    """Normalize public search text and remove wildcard characters.

    Public career endpoints are intentionally sliced search endpoints, not bulk
    export endpoints. Removing `%` and `_` prevents wildcard-only scraping.
    """
    return (q or "").replace("%", "").replace("_", "").strip()


def _search_terms(term: str) -> tuple[str, str]:
    """Return the subject and institution parts of a natural-language query.

    This keeps searches such as ``Computer Science at UNILAG`` coherent: the
    career catalogue receives ``Computer Science`` while the university group
    receives ``UNILAG``. Descriptors such as ``roles`` and ``universities`` are
    not treated as entity names.
    """
    parts = re.split(r"\s+(?:at|in|for|near)\s+", term, maxsplit=1, flags=re.IGNORECASE)
    subject = parts[0].strip()
    institution = parts[1].strip() if len(parts) > 1 else term
    subject = re.sub(
        r"\b(programme|programmes|university|universities|role|roles|skill|skills|tool|tools|job|jobs)\b$",
        "",
        subject,
        flags=re.IGNORECASE,
    ).strip()
    if not subject:
        subject = institution if len(parts) > 1 else term
    return subject, institution


def _student_programme_name(value: Any) -> Optional[str]:
    """Keep source JAMB names intact while making composite labels readable."""
    if value is None:
        return None
    raw = str(value).strip()
    if not raw:
        return None
    parts = [part.strip() for part in raw.split("/")]
    if len(parts) == 2 and parts[0] and parts[1].lower().startswith(f"{parts[0].lower()} "):
        return parts[0]
    return raw


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


def _skill_text(value: Any) -> list[str]:
    """Flatten the JSON/text shapes used by imported skills data."""
    if isinstance(value, str):
        return [value.strip()] if value.strip() else []
    if isinstance(value, list):
        out: list[str] = []
        for item in value:
            if isinstance(item, str) and item.strip():
                out.append(item.strip())
            elif isinstance(item, dict):
                for key in ("skill", "name", "label", "term"):
                    if isinstance(item.get(key), str) and item[key].strip():
                        out.append(item[key].strip())
                        break
        return out
    return []


def _contains_skill(values: list[str], term: str) -> bool:
    needle = term.casefold()
    return any(needle in value.casefold() or value.casefold() in needle for value in values)


def _guidance_evidence(context: Any) -> dict:
    """Map checked context into safe student-facing evidence states.

    This deliberately does not expose demand scores, ranks, salaries or a
    licensing conclusion. The source-backed resolver already separates local
    Nigerian evidence from global enrichment; remote work needs its own signal
    and must not be inferred from either one.
    """
    value = context if isinstance(context, dict) else {}
    actual = value.get("actual_enrichment") or {}
    global_data = value.get("global_enrichment") or {}
    local_sources = value.get("source_summaries") or []
    global_sources = value.get("global_source_summaries") or []

    def evidence_sources(summaries: list[dict]) -> list[dict]:
        """Expose only labelled HTTPS source links owned by this evidence lens."""
        links: list[dict] = []
        seen: set[str] = set()
        for summary in summaries:
            if not isinstance(summary, dict):
                continue
            label = str(summary.get("name") or summary.get("id") or "Source").strip()
            urls = summary.get("urls") or []
            if isinstance(urls, str):
                urls = [urls]
            for url in urls:
                if not isinstance(url, str) or not url.startswith("https://") or url in seen:
                    continue
                seen.add(url)
                links.append({
                    "id": str(summary.get("id") or url),
                    "label": label,
                    "url": url,
                })
        return links
    local_items = sum(
        len(actual.get(key) or [])
        for key in ("skills", "tools", "competencies", "certifications", "regulatory_requirements")
    )
    global_items = sum(
        len(global_data.get(key) or [])
        for key in ("skills", "tools", "competencies", "certifications", "regulatory_requirements")
    )

    if local_items:
        nigeria_state = "source_backed"
        nigeria_explanation = "Checked Nigerian professional, sector or regulatory evidence is available for this route."
    elif local_sources:
        nigeria_state = "context_only"
        nigeria_explanation = "Nigerian professional or sector context is available, but a role-level requirement is not established."
    else:
        nigeria_state = "not_available"
        nigeria_explanation = "No checked Nigerian context is attached to this route yet."

    if global_items:
        global_state = "source_backed"
        global_explanation = "Separate international occupational or professional evidence is available."
    elif value.get("global_profile_ids"):
        global_state = "context_only"
        global_explanation = "A global role-family context is available; it is not a local demand or licensing claim."
    else:
        global_state = "not_available"
        global_explanation = "No separate global evidence is attached to this route yet."

    return {
        "nigeria": {
            "state": nigeria_state,
            "explanation": nigeria_explanation,
            "sourceCount": len(local_sources),
            "sources": evidence_sources(local_sources),
        },
        "remote": {
            "state": "not_available",
            "explanation": "A remote-work signal is not attached here; it must be verified separately rather than inferred from global evidence.",
        },
        "global": {
            "state": global_state,
            "explanation": global_explanation,
            "sourceCount": len(global_sources),
            "sources": evidence_sources(global_sources),
        },
        "limitations": [
            "These signals explain evidence scope; they do not claim current vacancy volume, salary or automatic licensing.",
        ],
    }


# ── Enrichment-aware row mappers (Phase 9) ────────────────────
# Each emits the camelCase shape declared in src/types/career.ts:
#   CertificationV2Enriched, ToolV2Enriched.

def _cert(row: dict) -> dict:
    """Map a domain_certifications row → CertificationV2Enriched (camelCase)."""
    key = re.sub(r"[^a-z0-9]+", " ", str(row.get("name") or "").lower()).strip()
    override = _CERT_LIFECYCLE_OVERRIDES.get(key) or {}
    return {
        "name": row.get("name"),
        "body": row.get("body"),
        "region": row.get("region"),
        "level": row.get("level"),
        "gateReason": row.get("gate_reason"),
        # Phase 9 enrichment
        "officialUrl": override.get("official_url") or row.get("official_url"),
        "seniorityTier": row.get("seniority_tier"),
        "tierType": row.get("tier_type"),
        "price": _num(row.get("price")),
        "currency": row.get("currency"),
        "priceAsOf": _date_str(row.get("price_as_of")),
        "priceSource": row.get("price_source"),
        # Evergreen lifecycle fields. A retained record is not necessarily a
        # currently actionable recommendation (for example, a closed exam).
        "credentialType": override.get("credential_type") or row.get("credential_type"),
        "availabilityStatus": override.get("availability_status") or row.get("availability_status") or "active",
        "currentRecommendation": override.get("current_recommendation") if "current_recommendation" in override else row.get("current_recommendation", True),
        "retainInCatalogue": override.get("retain_in_catalogue") if "retain_in_catalogue" in override else row.get("retain_in_catalogue", True),
        "reopenPossible": override.get("reopen_possible") if "reopen_possible" in override else row.get("reopen_possible"),
        "availabilityNote": override.get("availability_note") or row.get("availability_note"),
        "statusSourceUrl": override.get("status_source_url") or row.get("status_source_url"),
        "statusCheckedAt": _date_str(row.get("status_checked_at")) or override.get("status_checked_at") or ("2026-09-04" if override else None),
        "replacementName": override.get("replacement_name") or row.get("replacement_name"),
        "replacementUrl": override.get("replacement_url") or row.get("replacement_url"),
    }


def _tool(row: dict) -> dict:
    """Map a domain_tools row → ToolV2Enriched (camelCase).

    Labour-market demand fields are intentionally not exposed until a
    source-backed ingestion pipeline is available. The taxonomy seed's
    ``hot``/``in_demand`` values are not current market evidence.
    """
    return {
        "tool": row.get("tool_name"),
        "group": row.get("tool_group"),
        "roleFreq": row.get("role_freq"),
        "source": row.get("source"),
        "elementName": row.get("element_name"),
        "elementId": row.get("element_id"),
        "sourceConfidence": row.get("source_confidence"),
        "dataState": row.get("data_state"),
        "sourceProvenance": row.get("source_provenance") or {},
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


def _career_resource(row: dict) -> dict:
    """Map a normalized learning/professional resource to the API contract."""
    return {
        "id": row.get("id"),
        "domainId": row.get("domain_id"),
        "subgroupId": row.get("subgroup_id"),
        "roleId": row.get("role_id"),
        "resourceType": row.get("resource_type"),
        "targetName": row.get("target_name"),
        "provider": row.get("provider"),
        "region": row.get("region"),
        "accessType": row.get("access_type"),
        "delivery": row.get("delivery"),
        "url": row.get("url"),
        "price": _num(row.get("price")),
        "currency": row.get("currency"),
        "pricePeriod": row.get("price_period"),
        "priceAsOf": _date_str(row.get("price_as_of")),
        "priceSource": row.get("price_source"),
        "sourceUrl": row.get("source_url"),
        "description": row.get("description"),
        "sourceConfidence": row.get("source_confidence"),
        "dataState": row.get("data_state"),
        "sourceProvenance": row.get("source_provenance") or {},
    }


def _career_resources(
    svc: Any,
    *,
    domain_id: Optional[str] = None,
    role_id: Optional[str] = None,
    include_role: bool = True,
) -> list[dict]:
    """Read the additive resource layer without breaking older databases."""
    try:
        query = svc.table("career_learning_resources").select("*")
        if domain_id:
            query = query.eq("domain_id", domain_id)
        if role_id:
            query = query.eq("role_id", role_id)
        elif not include_role:
            query = query.is_("role_id", "null")
        rows = query.order("resource_type").order("target_name").execute().data or []
        return [_career_resource(row) for row in rows]
    except Exception as exc:  # noqa: BLE001
        log.debug("career resource layer unavailable", error=str(exc))
        return []


def _context_item(row: dict) -> dict:
    """Map a source-backed contextual item row to the frontend contract."""
    return {
        "contextLevel": row.get("context_level"),
        "contextKey": row.get("context_key"),
        "domainId": row.get("domain_key"),
        "itemType": row.get("item_type"),
        "itemKey": row.get("item_key"),
        "name": row.get("name"),
        "plainMeaning": row.get("plain_meaning"),
        "contextualUse": row.get("contextual_use"),
        "expectedOutput": row.get("expected_output"),
        "priority": row.get("priority"),
        "priorityReason": row.get("priority_reason"),
        "prerequisites": row.get("prerequisites") or [],
        "relatedItems": row.get("related_items") or [],
        "sourceIds": row.get("source_ids") or [],
        "sourceReferences": row.get("source_references") or [],
        "sourceLocators": row.get("source_locators") or [],
        "geographicScope": row.get("geographic_scope"),
        "evidenceLimitations": row.get("evidence_limitations") or [],
        "evidenceType": row.get("evidence_type") or "source_supported_synthesis",
        "sourceConfidence": row.get("source_confidence"),
        "dataState": row.get("data_state") or "source_backed",
        "verifiedAt": _date_str(row.get("verified_at")),
    }


def _career_context_items(
    svc: Any,
    *,
    context_level: str,
    context_key: str,
) -> list[dict]:
    """Read the additive context catalogue without breaking older databases."""
    try:
        rows = (
            svc.table("career_context_items")
            .select("*")
            .eq("context_level", context_level)
            .eq("context_key", context_key)
            .order("priority")
            .order("item_type")
            .order("name")
            .execute()
            .data
            or []
        )
        return [_context_item(row) for row in rows]
    except Exception as exc:  # noqa: BLE001
        # The migration is additive. A pre-migration installation keeps the
        # existing domain/role view rather than failing the whole endpoint.
        log.debug("career contextual item layer unavailable", error=str(exc))
        return []


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
        if not res.data and institution_type == "university":
            # Some earlier programme imports did not set institution_type.
            # Keep the student surface useful for those rows while still
            # excluding records explicitly marked as non-university.
            fallback = db.get_service_client().schema(_SCHEMA).table(
                "programmes"
            ).select("id, name, display_name, institution_type, discipline").or_(
                f"name.ilike.{like},display_name.ilike.{like}"
            ).is_("institution_type", "null").order("name").limit(safe_limit).execute()
            res = fallback
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

    Reads `programme_domain` (match_type, elite_flag) joined to
    `domains` for names, so ProgrammeOverviewScreen can render the Direct →
    Functional → Adjacent domain tiers. Degrades to `coming_soon` on miss/error.
    """
    try:
        svc = _svc()
        published_domain_ids = _published_elite_entity_ids("domain")
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
        published_domain_ids = _published_elite_entity_ids("domain")

        # Domain links for this programme (Phase 2 mapping).
        pd_res = (
            svc.table("programme_domain")
            .select("domain_id, match_type, elite_flag")
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
                        "eliteFlag": bool(link.get("elite_flag")) and (
                            str(link.get("domain_id")) in published_domain_ids
                            or str(d.get("domain_key")) in published_domain_ids
                        ),
                    }
                )

        programme = {
            "id": r["id"],
            "name": r["name"],
            "displayName": r.get("display_name"),
            "studentName": None,
            "institutionType": r.get("institution_type") or "university",
            "discipline": r.get("discipline"),
            "qualification": r.get("qualification"),
            "durationYears": float(duration) if duration is not None else None,
            "overview": r.get("description"),
            "domains": domains,
            **_programme_skills(svc, programme_id),
        }
        # The canonical programme row is mapping infrastructure. Resolve a
        # student-facing JAMB name separately so the UI never uses the CCMAS
        # name as a course heading when a source-backed JAMB name exists.
        try:
            mapping = (
                svc.table("programme_mapping")
                .select("jamb_programme_id")
                .eq("programme_id", programme_id)
                .execute()
            ).data or []
            jamb_ids = [row.get("jamb_programme_id") for row in mapping if row.get("jamb_programme_id")]
            if jamb_ids:
                names = (
                    svc.table("jamb_programmes")
                    .select("id, jamb_name")
                    .in_("id", jamb_ids)
                    .execute()
                ).data or []
                student_names = [
                    _student_programme_name(row.get("jamb_name"))
                    for row in names
                    if _student_programme_name(row.get("jamb_name"))
                ]
                if student_names:
                    programme["studentName"] = student_names[0]
                    programme["studentNames"] = list(dict.fromkeys(student_names))
        except Exception as exc:  # noqa: BLE001
            log.warning("programme student naming lookup skipped", error=str(exc))
        notice = None if domains else "Domain links are not available for this programme yet."
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

    Demand scores/bands are deliberately omitted until a source-backed labour
    market ingestion is available. Taxonomy-derived baseline rows are not
    presented as current demand.
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
            return ResponseModel(data=_coming_soon("No domains are available yet."))

        # Labour-market demand is NOT exposed here, matching the same policy
        # `_tool` documents: the seeded values are taxonomy-derived
        # (`taxonomy_derived_baseline_v1`), not measured market evidence, so
        # presenting them would assert a fact the data does not support.
        #
        # This previously read `domain_demand_metrics` and attached
        # `inDemandScore` / `demandBand`. The lookup is removed rather than
        # merely unused: keeping a query whose result is discarded is a
        # per-request round trip that buys nothing, and it reads as though the
        # field were still live.
        #
        # Restore both together when a source-backed ingestion lands. Note the
        # scale trap recorded at the time: volume_score is on the source's own
        # scale (13..56 in production), not a percentage -- a meter that
        # assumed 0..10 drew all 160 domains as full demand, including the 108
        # the data calls low. Ship the source's own band, not a derived bar.
        grouped: dict[str, list] = {}
        for r in rows:
            entry = {
                # The domain route keys on domain_key, not the uuid.
                "id": r.get("domain_key") or r["id"],
                "name": r.get("name"),
                "eliteFlag": bool(r.get("elite_domain"))
                and str(r.get("id")) in published_domain_ids
                or (bool(r.get("elite_domain")) and str(r.get("domain_key")) in published_domain_ids),
            }
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
        published_domain_ids = _published_elite_entity_ids("domain")
        published_role_ids = _published_elite_entity_ids("role")

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
                "id, role_key, role_name, description, also_known_as, tier, subgroup_id, elite_status, elite_flag"
            )
            .eq("domain_id", domain_uuid)
            .execute()
        )

        role_context_by_key: dict[str, dict] = {}
        try:
            role_context_rows = (
                svc.table("domain_roles")
                .select("role_key, nigerian_context")
                .eq("domain_id", domain_uuid)
                .execute().data or []
            )
            role_context_by_key = {
                row.get("role_key"): row.get("nigerian_context") or {}
                for row in role_context_rows
                if row.get("role_key")
            }
        except Exception as context_exc:  # noqa: BLE001
            log.debug("career role Nigerian context unavailable", error=str(context_exc))
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

        method_rows: list[dict] = []
        try:
            method_rows = (
                svc.table("computational_method_evidence")
                .select(
                    "subgroup_id, method_name, classification, competence_status, esco_id, description, evidence_roles, source_provenance, data_state"
                )
                .eq("domain_id", domain_uuid)
                .order("method_name")
                .execute().data or []
            )
        except Exception as method_exc:  # noqa: BLE001
            log.debug("career computational method evidence unavailable", error=str(method_exc))

        methods_by_subgroup: dict[str, list[dict]] = {}
        for method in method_rows:
            methods_by_subgroup.setdefault(method.get("subgroup_id"), []).append({
                "name": method.get("method_name"),
                "classification": method.get("classification") or "unknown",
                "competenceStatus": method.get("competence_status") or "unknown",
                "escoId": method.get("esco_id"),
                "description": method.get("description"),
                "evidenceRoles": method.get("evidence_roles") or [],
                "sourceProvenance": method.get("source_provenance") or {},
                "dataState": method.get("data_state"),
            })

        computational_links_by_role: dict[str, list[dict]] = {}
        try:
            computational_links = (
                svc.table("computational_role_subgroup_links")
                .select("role_key, subgroup_id, relationship, evidence_skills")
                .eq("domain_id", domain_uuid)
                .execute().data or []
            )
            subgroup_names = {
                row.get("id"): row.get("label")
                for row in (sg_res.data or [])
                if row.get("id")
            }
            for link in computational_links:
                computational_links_by_role.setdefault(link.get("role_key"), []).append({
                    "id": link.get("subgroup_id"),
                    "name": subgroup_names.get(link.get("subgroup_id")),
                    "relationship": link.get("relationship"),
                    "evidenceSkills": link.get("evidence_skills") or [],
                })
        except Exception as computational_exc:  # noqa: BLE001
            log.debug("career computational subgroup enrichment unavailable", error=str(computational_exc))

        tool_rows = tool_res.data or []
        cert_rows = cert_res.data or []
        resource_rows = _career_resources(svc, domain_id=domain_uuid, include_role=False)
        domain_context_items = _career_context_items(
            svc, context_level="domain", context_key=domain_id
        )
        resources_by_subgroup: dict[str, list[dict]] = {}
        resources_by_role: dict[str, list[dict]] = {}
        domain_resources: list[dict] = []
        for resource in resource_rows:
            if resource.get("roleId"):
                resources_by_role.setdefault(resource["roleId"], []).append(resource)
            elif resource.get("subgroupId"):
                resources_by_subgroup.setdefault(resource["subgroupId"], []).append(resource)
            else:
                domain_resources.append(resource)

        # Optional cross-domain role-family enrichment. The migration is
        # additive, so older databases still render the domain without it.
        family_by_role: dict[str, dict] = {}
        try:
            family_members = (
                svc.table("career_role_family_members")
                .select("role_key, family_id")
                .eq("domain_id", domain_uuid)
                .execute().data or []
            )
            family_ids = list({row.get("family_id") for row in family_members if row.get("family_id")})
            if family_ids:
                families = svc.table("career_role_families").select(
                    "id, family_key, canonical_name, primary_domain_key, aliases, source_confidence, data_state"
                ).in_("id", family_ids).execute().data or []
                family_map = {row.get("id"): row for row in families}
                for member in family_members:
                    family = family_map.get(member.get("family_id"))
                    if family and member.get("role_key"):
                        family_by_role[member["role_key"]] = family
        except Exception as family_exc:  # noqa: BLE001
            log.debug("career domain role-family enrichment unavailable", error=str(family_exc))

        # Domain-scoped tools (subgroup tools attach to their subgroup below).
        domain_tools = [t for t in tool_rows if t.get("scope") == "domain"]

        # Certs split by placement; subgroup certs attach to their subgroup.
        gateway = [_cert(c) for c in cert_rows if c.get("placement") == "gateway"]
        role_hint = [_cert(c) for c in cert_rows if c.get("placement") == "role_hint"]

        # Subgroups — each carries its cluster skills, tools and specialisation certs.
        subgroups = []
        for sg in sorted(
            (sg_res.data or []),
            key=lambda row: (
                row.get("display_order") is None,
                row.get("display_order") if row.get("display_order") is not None else 0,
                (row.get("label") or "").casefold(),
            ),
        ):
            sg_id = sg["id"]
            sg_tools = [
                t for t in tool_rows
                if t.get("subgroup_id") == sg_id and t.get("scope") == "subgroup"
            ]
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
                     "whatPeopleDo": sg.get("what_people_do"),
                     "workContext": sg.get("work_context") or [],
                     "roleCount": sg.get("role_count"),
                     "clusterSkills": sg.get("cluster_skills") or [],
                     "clusterSkillUris": sg.get("cluster_skill_uris") or {},
                     "sourceConfidence": sg.get("source_confidence"),
                     "dataState": sg.get("data_state"),
                     "displayOrder": sg.get("display_order"),
                     "nigerianContext": sg.get("nigerian_context") or {},
                     "guidanceEvidence": _guidance_evidence(sg.get("nigerian_context") or {}),
                     "skillSources": sg.get("skill_sources") or {},
                     "methodEvidence": methods_by_subgroup.get(sg_id, []),
                      "tools": _tool_groups(sg_tools),
                     "certifications": sg_certs,
                      "resources": resources_by_subgroup.get(sg_id, []),
                      "contextItems": _career_context_items(
                          svc, context_level="subgroup", context_key=f"{domain_id}|sg:{sg.get('isco_submajor')}"
                      ),
                  }
            )

        roles = [
            {
                "key": r.get("role_key"),
                "name": r.get("role_name"),
                "description": r.get("description"),
                "tier": r.get("tier"),
                "alsoKnownAs": r.get("also_known_as") or [],
                "subgroupId": r.get("subgroup_id"),
                "nigerianContext": role_context_by_key.get(r.get("role_key"), {}),
                "guidanceEvidence": _guidance_evidence(role_context_by_key.get(r.get("role_key"), {})),
                "computationalSubgroups": computational_links_by_role.get(r.get("role_key"), []),
                "eliteStatus": (
                    r.get("elite_status")
                    if str(r.get("role_key")) in published_role_ids
                    else "deferred"
                ),
                 "crossDomainFamily": (
                    {
                        "key": family_by_role[r["role_key"]].get("family_key"),
                        "name": family_by_role[r["role_key"]].get("canonical_name"),
                        "primaryDomainKey": family_by_role[r["role_key"]].get("primary_domain_key"),
                        "aliases": family_by_role[r["role_key"]].get("aliases") or [],
                        "sourceConfidence": family_by_role[r["role_key"]].get("source_confidence"),
                        "dataState": family_by_role[r["role_key"]].get("data_state"),
                    }
                     if r.get("role_key") in family_by_role else None
                 ),
                 "resources": resources_by_role.get(r.get("id"), []),
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
            "eliteDomain": bool(domain.get("elite_domain")) and (
                str(domain.get("id")) in published_domain_ids
                or str(domain.get("domain_key")) in published_domain_ids
            ),
            "foundationSkills": _foundation_skills(domain),
            "foundationSkillUris": domain.get("foundation_skill_uris") or {},
             "sourceConfidence": domain.get("source_confidence"),
             "dataState": domain.get("data_state"),
             "sourceProvenance": domain.get("source_provenance") or {},
             "nigerianContext": domain.get("nigerian_context") or {},
            "guidanceEvidence": _guidance_evidence(domain.get("nigerian_context") or {}),
            "foundationSkillSources": domain.get("foundation_skill_sources") or {},
            "roleCount": domain.get("role_count"),
            "tools": _tool_groups(domain_tools),
            "gatewayCertifications": gateway,
            "roleHintCertifications": role_hint,
            "subgroups": subgroups,
             "roles": roles,
             "resources": domain_resources,
             "contextItems": domain_context_items,
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
        published_role_ids = _published_elite_entity_ids("role")
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
        resource_rows = _career_resources(svc, role_id=role.get("id"))
        role_context_items = _career_context_items(
            svc, context_level="role", context_key=role_id
        )
        role_tools: list[dict] = []
        role_certs: list[dict] = []
        role_work_profile: dict | None = None
        try:
            role_tools = (
                svc.table("domain_tools")
                .select("tool_name, tool_group, role_freq, score, source, element_name, element_id, source_confidence, data_state, source_provenance")
                .eq("role_id", role.get("id"))
                .eq("scope", "role")
                .order("tool_group")
                .order("tool_name")
                .execute().data or []
            )
            role_certs = (
                svc.table("role_certifications").select("*")
                .eq("role_key", role_id).order("name").execute().data or []
            )
        except Exception as enrichment_exc:  # noqa: BLE001
            # The role enrichment migration is additive. Existing installations
            # can still render role skills while the patch is being applied.
            log.warning("career role enrichment unavailable", error=str(enrichment_exc))

        try:
            work_profile_rows = (
                svc.table("domain_role_work_profiles")
                .select(
                    "source_record_status, onet_occupation_codes, activities, work_activities, "
                    "job_zones, education_signals, work_context, related_occupations, "
                    "wef_signals, source_links, source_provenance, limitations, data_state"
                )
                .eq("role_id", role.get("id"))
                .limit(1)
                .execute()
                .data
                or []
            )
            if work_profile_rows:
                role_work_profile = work_profile_rows[0]
        except Exception as work_profile_exc:  # noqa: BLE001
            # The work-profile table is additive; role meaning and skills remain
            # usable while an older installation is being migrated.
            log.debug("career role work profile unavailable", error=str(work_profile_exc))

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

        role_families: list[dict] = []
        try:
            member_rows = svc.table("career_role_family_members").select(
                "family_id"
            ).eq("role_key", role_id).execute().data or []
            family_ids = list({row.get("family_id") for row in member_rows if row.get("family_id")})
            if family_ids:
                family_rows = svc.table("career_role_families").select(
                    "id, family_key, canonical_name, primary_domain_key, aliases, source_confidence, data_state, source_provenance, nigerian_context"
                ).in_("id", family_ids).execute().data or []
                link_rows = svc.table("career_role_family_domains").select(
                    "family_id, domain_key, relationship"
                ).in_("family_id", family_ids).execute().data or []
                links_by_family: dict[str, list] = {}
                for link in link_rows:
                    links_by_family.setdefault(link.get("family_id"), []).append({
                        "domainKey": link.get("domain_key"),
                        "relationship": link.get("relationship"),
                    })
                for family in family_rows:
                    role_families.append({
                        "key": family.get("family_key"),
                        "name": family.get("canonical_name"),
                        "primaryDomainKey": family.get("primary_domain_key"),
                        "aliases": family.get("aliases") or [],
                        "domains": links_by_family.get(family.get("id"), []),
                        "sourceConfidence": family.get("source_confidence"),
                        "dataState": family.get("data_state"),
                        "sourceProvenance": family.get("source_provenance") or {},
                        "nigerianContext": family.get("nigerian_context") or {},
                    })
        except Exception as family_exc:  # noqa: BLE001
            log.debug("career role-family detail unavailable", error=str(family_exc))

        computational_subgroups: list[dict] = []
        try:
            link_rows = svc.table("computational_role_subgroup_links").select(
                "subgroup_id, relationship, evidence_skills"
            ).eq("role_id", role.get("id")).execute().data or []
            subgroup_ids = list({row.get("subgroup_id") for row in link_rows if row.get("subgroup_id")})
            subgroup_map = {}
            if subgroup_ids:
                subgroup_map = {
                    row.get("id"): row
                    for row in svc.table("domain_subgroups").select("id, label, domain_id").in_("id", subgroup_ids).execute().data or []
                }
            computational_subgroups = [
                {
                    "id": row.get("subgroup_id"),
                    "name": (subgroup_map.get(row.get("subgroup_id")) or {}).get("label"),
                    "relationship": row.get("relationship"),
                    "evidenceSkills": row.get("evidence_skills") or [],
                }
                for row in link_rows
            ]
        except Exception as computational_exc:  # noqa: BLE001
            log.debug("career role computational subgroup enrichment unavailable", error=str(computational_exc))

        computational_methods: list[dict] = []
        try:
            method_subgroup_ids = {
                role.get("subgroup_id"),
                *(item.get("id") for item in computational_subgroups),
            }
            method_subgroup_ids.discard(None)
            if method_subgroup_ids:
                method_rows = svc.table("computational_method_evidence").select(
                    "subgroup_id, method_name, classification, competence_status, esco_id, description, evidence_roles, source_provenance, data_state"
                ).eq("domain_id", role.get("domain_id")).in_("subgroup_id", list(method_subgroup_ids)).order("method_name").execute().data or []
                computational_methods = [
                    {
                        "subgroupId": row.get("subgroup_id"),
                        "name": row.get("method_name"),
                        "classification": row.get("classification") or "unknown",
                        "competenceStatus": row.get("competence_status") or "unknown",
                        "escoId": row.get("esco_id"),
                        "description": row.get("description"),
                        "evidenceRoles": row.get("evidence_roles") or [],
                        "sourceProvenance": row.get("source_provenance") or {},
                        "dataState": row.get("data_state"),
                    }
                    for row in method_rows
                ]
        except Exception as method_exc:  # noqa: BLE001
            log.debug("career role computational method evidence unavailable", error=str(method_exc))

        data = {
            "key": role.get("role_key"),
            "name": role.get("role_name"),
            "description": role.get("description"),
            "subgroupId": role.get("subgroup_id"),
            "computationalSubgroups": computational_subgroups,
            "computationalMethods": computational_methods,
            "tier": role.get("tier"),
            "alsoKnownAs": role.get("also_known_as") or [],
            "iscoGroup": role.get("isco_group"),
            "escoCode": role.get("esco_code"),
            "eliteStatus": (
                role.get("elite_status")
                if str(role.get("role_key")) in published_role_ids
                else "deferred"
            ),
            "escoOccupationUris": role.get("esco_occupation_uris") or [],
            "onetOccupationCodes": role.get("onet_occupation_codes") or [],
            "onetEssentialSkills": [
                {
                    "elementId": item.get("element_id"),
                    "elementName": item.get("element_name"),
                    "importance": item.get("importance"),
                    "source": item.get("source"),
                    "sourceConfidence": item.get("source_confidence"),
                    "dataState": item.get("data_state"),
                }
                for item in (role.get("onet_essential_skills") or [])
                if item.get("element_id") and item.get("element_name")
            ],
            "sourceConfidence": role.get("source_confidence"),
            "dataState": role.get("data_state"),
            "nigerianContext": role.get("nigerian_context") or {},
            "guidanceEvidence": _guidance_evidence(role.get("nigerian_context") or {}),
            "sourceProvenance": role.get("source_provenance") or {},
            "workProfile": {
                "sourceRecordStatus": role_work_profile.get("source_record_status"),
                "onetOccupationCodes": role_work_profile.get("onet_occupation_codes") or [],
                "activities": role_work_profile.get("activities") or [],
                "workActivities": role_work_profile.get("work_activities") or [],
                "jobZones": role_work_profile.get("job_zones") or [],
                "educationSignals": role_work_profile.get("education_signals") or [],
                "workContext": role_work_profile.get("work_context") or [],
                "relatedOccupations": role_work_profile.get("related_occupations") or [],
                "wefSignals": role_work_profile.get("wef_signals") or [],
                "sourceLinks": role_work_profile.get("source_links") or [],
                "sourceProvenance": role_work_profile.get("source_provenance") or {},
                "limitations": role_work_profile.get("limitations") or [],
                "dataState": role_work_profile.get("data_state"),
            } if role_work_profile else None,
            "essentialSkills": essential,
            "optionalSkills": optional,
            "tools": [
                {
                    "name": t.get("tool_name"),
                    "group": t.get("tool_group"),
                    "description": None,
                    "roleFreq": t.get("role_freq"),
                    "score": t.get("score"),
                    "source": t.get("source"),
                    "elementName": t.get("element_name"),
                    "elementId": t.get("element_id"),
                    "sourceConfidence": t.get("source_confidence"),
                    "dataState": t.get("data_state"),
                    "sourceProvenance": t.get("source_provenance") or {},
                }
                for t in role_tools if t.get("tool_name")
            ],
            "certifications": [
                {**_cert(c), "source": c.get("source")}
                for c in role_certs if c.get("name")
            ],
            "essentialSkillUris": essential_uri_list,
            "optionalSkillUris": optional_uri_list,
            "appearsIn": appears_in,
            "roleFamilies": role_families,
            # Phase 9 currency status
            "currencyStatus": role.get("currency_status"),
            "currencyVerifiedAt": _date_str(role.get("currency_verified_at")),
            "currencySource": role.get("currency_source"),
            "resources": resource_rows,
            "contextItems": role_context_items,
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


@router.get("/skills/discover", response_model=ResponseModel)
async def discover_by_skills(
    skills: Optional[str] = Query(None),
    match: str = Query("both"),
    intent: str = Query("learned"),
    category: Optional[str] = Query(None),
    user_type: Optional[str] = Query(None),
    admin_type: Optional[str] = Query(None),
):
    """Map one or more known/intended skills back through the career graph.

    This is deliberately computed from the imported domain/role/tool/cert
    tables. It does not invent domain counts, demand figures, or curated
    combinations. ``both`` is an intersection (Python + C++ means the same
    domain must match both); ``either`` is a union for exploration.
    """
    learner_rules = {
        "secondary_school": ("ss1", "ss2", "ss3"),
        "tutorial_centre": ("jamb",),
        "jamb_cafe": ("jamb",),
        "university": ("undergraduate",),
    }
    normalized_admin_type = (admin_type or "").strip().lower() or None
    normalized_user_type = (user_type or "").strip().lower() or None
    allowed_user_types = learner_rules.get(normalized_admin_type, ())
    if normalized_user_type and allowed_user_types and normalized_user_type not in allowed_user_types:
        raise HTTPException(
            status_code=400,
            detail=f"{normalized_admin_type} guidance supports: {', '.join(allowed_user_types)}.",
        )

    terms = list(dict.fromkeys(
        item.strip() for item in (skills or "").split(",")
        if item and item.strip()
    ))
    match_mode = (match or "both").strip().lower()
    if match_mode not in {"both", "either"}:
        return ResponseModel(success=False, message="Match must be both or either.", data=None)
    intent_mode = (intent or "learned").strip().lower()
    if intent_mode not in {"learned", "intended"}:
        return ResponseModel(success=False, message="Skill intent must be learned or intended.", data=None)
    if category:
        category = category.strip().casefold()
    try:
        svc = _svc()
        domains = svc.table("domains").select(
            "id, domain_key, name, cluster, description, institution_type, foundation_skills"
        ).limit(1000).execute().data or []
        roles = svc.table("domain_roles").select(
            "role_key, role_name, domain_id, subgroup_id, essential_skills, optional_skills, tier"
        ).limit(10000).execute().data or []
        subgroups = svc.table("domain_subgroups").select(
            "id, domain_id, label, cluster_skills"
        ).limit(5000).execute().data or []
        tools = svc.table("domain_tools").select(
            "domain_id, subgroup_id, tool_name, tool_group"
        ).limit(10000).execute().data or []
        certs = svc.table("domain_certifications").select(
            "domain_id, subgroup_id, name, body, level"
        ).limit(10000).execute().data or []

        domain_by_id = {row.get("id"): row for row in domains if row.get("id")}
        roles_by_domain: dict[str, list[dict]] = {}
        for row in roles:
            if row.get("domain_id"):
                roles_by_domain.setdefault(row["domain_id"], []).append(row)
        groups_by_domain: dict[str, list[dict]] = {}
        for row in subgroups:
            if row.get("domain_id"):
                groups_by_domain.setdefault(row["domain_id"], []).append(row)
        tools_by_domain: dict[str, list[dict]] = {}
        for row in tools:
            if row.get("domain_id"):
                tools_by_domain.setdefault(row["domain_id"], []).append(row)
        certs_by_domain: dict[str, list[dict]] = {}
        for row in certs:
            if row.get("domain_id"):
                certs_by_domain.setdefault(row["domain_id"], []).append(row)

        categories = sorted({
            str(row.get("cluster")).strip() for row in domains
            if row.get("cluster") and str(row.get("cluster")).strip()
        })
        if category:
            domains = [row for row in domains if str(row.get("cluster") or "").casefold() == category]
        elif not terms:
            # The empty state is a category browser, not a bulk graph export.
            # A category click supplies the scope for the next read.
            domains = []

        def domain_terms(domain: dict) -> list[str]:
            values = _skill_text(domain.get("foundation_skills"))
            for group in groups_by_domain.get(domain.get("id"), []):
                values.extend(_skill_text(group.get("cluster_skills")))
            for role in roles_by_domain.get(domain.get("id"), []):
                values.extend(_skill_text(role.get("essential_skills")))
                values.extend(_skill_text(role.get("optional_skills")))
            values.extend(str(row.get("tool_name")) for row in tools_by_domain.get(domain.get("id"), []) if row.get("tool_name"))
            values.extend(str(row.get("name")) for row in certs_by_domain.get(domain.get("id"), []) if row.get("name"))
            return values

        def matches(domain: dict) -> list[str]:
            values = domain_terms(domain)
            return [term for term in terms if _contains_skill(values, term)]

        def unique(values: list[str]) -> list[str]:
            seen: set[str] = set()
            result: list[str] = []
            for value in values:
                clean = value.strip()
                key = clean.casefold()
                if clean and key not in seen:
                    seen.add(key)
                    result.append(clean)
            return result

        def match_label(score: float, direct: bool = False) -> str:
            if score >= 0.999 and direct:
                return "Direct match"
            if score >= 0.75:
                return "Strong match"
            if score > 0:
                return "Partial match"
            return "Related addition"

        def score_for(found: list[str]) -> float:
            return round(len(found) / len(terms), 3) if terms else 0.0

        matched_domains = []
        for domain in domains:
            matched = matches(domain)
            if terms and ((match_mode == "both" and len(matched) != len(terms)) or (match_mode == "either" and not matched)):
                continue
            matched_domains.append((domain, matched))
        matched_ids = {domain.get("id") for domain, _ in matched_domains}

        contextual_rows: list[dict] = []
        if matched_domains and terms:
            try:
                contextual_rows = (
                    svc.table("career_context_items")
                    .select(
                        "context_level, context_key, domain_key, item_type, item_key, name, "
                        "plain_meaning, contextual_use, expected_output, priority, priority_reason, "
                        "source_references, geographic_scope, data_state"
                    )
                    .in_("domain_key", [domain.get("domain_key") for domain, _ in matched_domains])
                    .limit(5000)
                    .execute()
                    .data
                    or []
                )
            except Exception as exc:  # noqa: BLE001
                # This additive layer may not exist on older installations.
                log.debug("career skill contextual suggestions unavailable", error=str(exc))

        role_out = []
        tool_out = []
        cert_out = []
        subgroup_out = []
        domain_out = []
        for domain, matched in matched_domains:
            domain_id = domain.get("id")
            domain_key = domain.get("domain_key")
            foundation = _skill_text(domain.get("foundation_skills"))
            subgroup_skills = [
                skill
                for group in groups_by_domain.get(domain_id, [])
                for skill in _skill_text(group.get("cluster_skills"))
            ]
            required_domain_skills = unique(foundation + subgroup_skills + [
                skill
                for role in roles_by_domain.get(domain_id, [])
                for skill in _skill_text(role.get("essential_skills"))
            ])
            domain_direct = [term for term in terms if _contains_skill(foundation + subgroup_skills, term)]
            domain_gaps = [skill for skill in required_domain_skills if not any(_contains_skill([term], skill) for term in terms)]
            domain_score = round((0.7 * score_for(matched)) + (0.3 * score_for(domain_direct)), 3) if terms else 0.0
            domain_out.append({
                "id": domain.get("domain_key"),
                "name": domain.get("name"),
                "cluster": domain.get("cluster"),
                "description": domain.get("description"),
                "matchedSkills": matched,
                "unmatchedSkills": [term for term in terms if term not in matched],
                "gaps": domain_gaps,
                "matchScore": domain_score,
                "matchLabel": match_label(domain_score, len(matched) == len(terms) and bool(domain_direct)),
                "matchExplanation": (
                    "Matches every selected skill." if len(matched) == len(terms) and terms
                    else f"Matches {len(matched)} of {len(terms)} selected skills; review the gaps below."
                ) if terms else "Shown while browsing the graph.",
            })
            for group in groups_by_domain.get(domain_id, []):
                group_values = _skill_text(group.get("cluster_skills"))
                group_matches = [term for term in terms if _contains_skill(group_values, term)]
                if not terms or group_matches:
                    subgroup_out.append({
                        "id": group.get("id"),
                        "name": group.get("label"),
                        "domainId": domain_key,
                        "domainName": domain.get("name"),
                        "matchedSkills": group_matches,
                        "unmatchedSkills": [term for term in terms if term not in group_matches],
                        "gaps": [skill for skill in group_values if not any(_contains_skill([term], skill) for term in terms)],
                        "matchScore": score_for(group_matches),
                        "matchLabel": match_label(score_for(group_matches), len(group_matches) == len(terms) and bool(group_matches)),
                        "matchExplanation": (
                            "Matches every selected skill." if match_mode == "both"
                            else f"Matches {len(group_matches)} of {len(terms)} selected skills."
                        ) if terms else "Shown while browsing the graph.",
                    })
            for role in roles_by_domain.get(domain_id, []):
                role_values = _skill_text(role.get("essential_skills")) + _skill_text(role.get("optional_skills"))
                role_matches = [term for term in terms if _contains_skill(role_values, term)]
                if not terms or (match_mode == "both" and len(role_matches) == len(terms)) or (match_mode == "either" and bool(role_matches)):
                    role_required = _skill_text(role.get("essential_skills"))
                    role_gaps = [skill for skill in role_required if not any(_contains_skill([term], skill) for term in terms)]
                    role_out.append({
                        "key": role.get("role_key"),
                        "name": role.get("role_name"),
                        "domainId": domain_key,
                        "domainName": domain.get("name"),
                        "tier": role.get("tier"),
                        "matchedSkills": role_matches,
                        "unmatchedSkills": [term for term in terms if term not in role_matches],
                        "gaps": role_gaps,
                        "matchScore": score_for(role_matches),
                        "matchLabel": match_label(score_for(role_matches), len(role_matches) == len(terms) and bool(role_matches)),
                        "matchExplanation": (
                            "Matches every selected skill in this role." if len(role_matches) == len(terms) and terms
                            else f"Matches {len(role_matches)} of {len(terms)} selected skills; review the gaps below."
                        ) if terms else "Shown while browsing the graph.",
                    })
            for tool in tools_by_domain.get(domain_id, []):
                tool_matches = [term for term in terms if _contains_skill([str(tool.get("tool_name") or "")], term)]
                if not terms or tool_matches:
                    tool_out.append({"name": tool.get("tool_name"), "group": tool.get("tool_group"), "domainId": domain_key, "domainName": domain.get("name"), "matchedSkills": tool_matches, "matchScore": score_for(tool_matches), "matchLabel": match_label(score_for(tool_matches), bool(tool_matches))})
            for cert in certs_by_domain.get(domain_id, []):
                cert_matches = [term for term in terms if _contains_skill([str(cert.get("name") or "")], term)]
                if not terms or cert_matches:
                    cert_out.append({"name": cert.get("name"), "body": cert.get("body"), "level": cert.get("level"), "domainId": domain_key, "domainName": domain.get("name"), "matchedSkills": cert_matches, "matchScore": score_for(cert_matches), "matchLabel": match_label(score_for(cert_matches), bool(cert_matches))})

        domain_out.sort(key=lambda row: row.get("matchScore", 0), reverse=True)
        subgroup_out.sort(key=lambda row: row.get("matchScore", 0), reverse=True)
        role_out.sort(key=lambda row: row.get("matchScore", 0), reverse=True)
        tool_out.sort(key=lambda row: row.get("matchScore", 0), reverse=True)
        cert_out.sort(key=lambda row: row.get("matchScore", 0), reverse=True)

        # A skill match is more useful when it explains the route it opens.
        # These routes are composed only from the stored domain, subgroup, and
        # role relationships; no role is invented from the free-form query.
        subgroup_by_id = {
            row.get("id"): row
            for row in subgroups
            if row.get("id")
        }
        tier_order = {"entry": 0, "junior": 0, "mid": 1, "senior": 2}
        paths: list[dict] = []
        for domain, matched in matched_domains:
            domain_id = domain.get("id")
            domain_key = domain.get("domain_key")
            domain_score = next(
                (row.get("matchScore", 0) for row in domain_out if row.get("id") == domain_key),
                0,
            )
            candidate_roles = []
            for role in roles_by_domain.get(domain_id, []):
                role_values = _skill_text(role.get("essential_skills")) + _skill_text(role.get("optional_skills"))
                role_matches = [term for term in terms if _contains_skill(role_values, term)]
                role_required = _skill_text(role.get("essential_skills"))
                role_gaps = [
                    skill for skill in role_required
                    if not any(_contains_skill([term], skill) for term in terms)
                ]
                candidate_roles.append((role, role_matches, role_gaps))
            candidate_roles.sort(
                key=lambda item: (
                    -score_for(item[1]),
                    tier_order.get(str(item[0].get("tier") or "").casefold(), 3),
                    str(item[0].get("role_name") or ""),
                )
            )
            for role, role_matches, role_gaps in candidate_roles[:8]:
                group = subgroup_by_id.get(role.get("subgroup_id"))
                role_name = role.get("role_name")
                group_name = group.get("label") if group else None
                if role_matches:
                    explanation = "Your selected skills are used in this route; build the listed gaps next."
                else:
                    explanation = "Your skills connect to this domain; this is a possible specialization, but its foundation still needs to be built."
                paths.append({
                    "domainId": domain_key,
                    "domainName": domain.get("name"),
                    "domainMatchScore": domain_score,
                    "subgroupId": role.get("subgroup_id"),
                    "subgroupName": group_name,
                    "roleKey": role.get("role_key"),
                    "roleName": role_name,
                    "tier": role.get("tier"),
                    "matchedSkills": role_matches,
                    "gaps": role_gaps,
                    "matchScore": score_for(role_matches),
                    "matchLabel": match_label(score_for(role_matches), len(role_matches) == len(terms) and bool(role_matches)),
                    "explanation": explanation,
                })

        # Turn a match into a small, actionable next-step route. Suggestions
        # come only from skills already attached to a matched domain/role; they
        # are not generated from free-form model text. Essential role skills
        # are shown before optional skills, and duplicates are removed.
        suggestions: list[dict] = []
        seen_suggestions: set[tuple[str, ...]] = set()
        priority_order = {"start_here": 0, "build_next": 1, "useful_later": 2, "optional": 3}
        for row in sorted(
            contextual_rows,
            key=lambda item: (
                priority_order.get(str(item.get("priority") or "optional"), 4),
                {"domain": 0, "subgroup": 1, "role": 2}.get(str(item.get("context_level") or "role"), 3),
                str(item.get("name") or ""),
            ),
        ):
            name = str(row.get("name") or "").strip()
            if not name or any(_contains_skill([name], term) for term in terms):
                continue
            identity = (str(row.get("context_key") or ""), str(row.get("item_type") or ""), name.casefold())
            if identity in seen_suggestions:
                continue
            seen_suggestions.add(identity)
            references = row.get("source_references") or []
            suggestions.append({
                "name": name,
                "itemType": row.get("item_type") or "skill",
                "contextLevel": row.get("context_level") or "domain",
                "contextKey": row.get("context_key") or row.get("domain_key"),
                "domainId": row.get("domain_key"),
                "domainName": next(
                    (domain.get("name") for domain, _ in matched_domains if domain.get("domain_key") == row.get("domain_key")),
                    None,
                ),
                "priority": row.get("priority") or "useful_later",
                "why": row.get("priority_reason") or row.get("contextual_use") or "It is connected to this route in the source-backed catalogue.",
                "sourceBacked": row.get("data_state") == "source_backed" and bool(references),
                "plainMeaning": row.get("plain_meaning"),
                "contextualUse": row.get("contextual_use"),
                "expectedOutput": row.get("expected_output"),
                "sourceReferences": references,
                "geographicScope": row.get("geographic_scope"),
            })
            if len(suggestions) >= 18:
                break
        for domain, matched in matched_domains:
            domain_id = domain.get("id")
            domain_key = domain.get("domain_key")
            foundation = unique(_skill_text(domain.get("foundation_skills")))
            for skill in foundation:
                if any(_contains_skill([skill], term) for term in terms):
                    continue
                identity = ("domain", skill.casefold())
                if identity in seen_suggestions:
                    continue
                seen_suggestions.add(identity)
                suggestions.append({
                    "name": skill,
                    "itemType": "skill",
                    "contextLevel": "domain",
                    "contextKey": domain_key,
                    "domainId": domain_key,
                    "domainName": domain.get("name"),
                    "priority": "start_here",
                    "why": f"It is part of the foundation for {domain.get('name')}; build it before narrowing into a role.",
                    "sourceBacked": True,
                })
                if len(suggestions) >= 12:
                    break
            if len(suggestions) >= 12:
                break
        if len(suggestions) < 18:
            for domain, _matched in matched_domains:
                domain_id = domain.get("id")
                domain_key = domain.get("domain_key")
                ranked_roles = sorted(roles_by_domain.get(domain_id, []), key=lambda row: ({"entry": 0, "mid": 1, "senior": 2}.get(row.get("tier"), 3), row.get("role_name") or ""))
                for role in ranked_roles[:5]:
                    for skill in _skill_text(role.get("essential_skills")):
                        if any(_contains_skill([skill], term) for term in terms):
                            continue
                        identity = ("role", skill.casefold())
                        if identity in seen_suggestions:
                            continue
                        seen_suggestions.add(identity)
                        suggestions.append({
                            "name": skill,
                            "itemType": "skill",
                            "contextLevel": "role",
                            "contextKey": role.get("role_key"),
                            "domainId": domain_key,
                            "domainName": domain.get("name"),
                            "roleName": role.get("role_name"),
                            "priority": "build_next",
                            "why": f"It is essential preparation for the entry-first role route {role.get('role_name')}.",
                            "sourceBacked": True,
                        })
                        if len(suggestions) >= 18:
                            break
                    if len(suggestions) >= 18:
                        break
                if len(suggestions) >= 18:
                    break

        audience = "student"
        if normalized_admin_type == "university":
            audience = "university_curriculum"
        elif normalized_admin_type in {"tutorial_centre", "jamb_cafe"}:
            audience = "provider_guidance"
        elif normalized_admin_type == "secondary_school":
            audience = "school_guidance"
        return ResponseModel(data=_real({
            "terms": terms,
            "matchMode": match_mode,
            "intent": intent_mode,
            "userType": normalized_user_type,
            "adminType": normalized_admin_type,
            "allowedUserTypes": list(allowed_user_types),
            "streamOptions": ["science", "commercial", "art"] if normalized_admin_type == "secondary_school" else [],
            "streamRequired": normalized_admin_type == "secondary_school",
            "audience": audience,
            "categories": categories,
            "domains": domain_out,
            "subgroups": subgroup_out,
            "roles": role_out,
            "tools": tool_out,
            "certifications": cert_out,
            "paths": paths,
            "suggestedNext": suggestions,
        }, "No matching graph evidence is available for those skills yet." if terms and not matched_domains else None))
    except Exception as exc:  # noqa: BLE001
        log.error("career skill discovery failed", error=str(exc))
        return ResponseModel(data=_coming_soon("Skill discovery is temporarily unavailable."))


@router.post("/skills/discover", response_model=ResponseModel)
async def discover_by_skills_post(payload: dict = Body(...)):
    """JSON transport for large skill sets; the graph logic is shared with GET."""
    raw_skills = payload.get("skills") if isinstance(payload, dict) else []
    skills = raw_skills if isinstance(raw_skills, list) else str(raw_skills or "").split(",")
    return await discover_by_skills(
        skills=",".join(str(item) for item in skills if str(item).strip()),
        match=str(payload.get("match") or "both"),
        intent=str(payload.get("intent") or "learned"),
        category=payload.get("category"),
        user_type=payload.get("userType") or payload.get("user_type"),
        admin_type=payload.get("adminType") or payload.get("admin_type"),
    )


@router.get("/search", response_model=ResponseModel)
async def search_career(
    q: Optional[str] = None,
    intent: Optional[str] = Query(None),
    user_type: Optional[str] = Query(None),
    school_id: Optional[str] = Query(None),
):
    """Public, grouped search across the connected career catalogue.

    The result deliberately keeps entity types separate. A query such as
    ``computer science`` can therefore show the programme as the primary
    interpretation while still exposing related domains, skills and roles
    without mixing them into one ambiguous list. Optional enrichment tables
    are read defensively because this endpoint must remain usable during a
    rolling migration.
    """
    term = _clean_public_query(q)
    intent_key = intent if intent in _SEARCH_INTENT_COPY else None
    intent_copy = _search_intent_copy(intent_key, user_type)
    if len(term) < _MIN_PUBLIC_QUERY_LEN:
        return ResponseModel(
            data=_real(
                {
                    "searchIntent": intent_key,
                    "userType": user_type,
                    "schoolId": school_id,
                    "searchContext": intent_copy,
                    "domains": [], "roles": [], "programmes": [],
                },
                "Type at least two characters to search. Bulk graph listing is not exposed.",
            )
        )
    try:
        svc = _svc()
        subject_term, institution_term = _search_terms(term)
        like = f"%{subject_term}%"
        institution_like = f"%{institution_term}%"

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

        # Search canonical cross-domain families and their source-backed
        # aliases (for example, third-party/vendor/supplier cyber risk).
        role_families: list[dict] = []
        try:
            family_rows = svc.table("career_role_families").select(
                "id, family_key, canonical_name, primary_domain_key, aliases, source_confidence, data_state, source_provenance, nigerian_context"
            ).ilike("canonical_name", like).limit(_PUBLIC_SEARCH_LIMIT).execute().data or []
            alias_rows = svc.table("career_role_family_aliases").select(
                "family_id"
            ).ilike("alias", like).limit(_PUBLIC_SEARCH_LIMIT * 2).execute().data or []
            alias_family_ids = {row.get("family_id") for row in alias_rows if row.get("family_id")}
            if alias_family_ids:
                alias_families = svc.table("career_role_families").select(
                    "id, family_key, canonical_name, primary_domain_key, aliases, source_confidence, data_state, source_provenance, nigerian_context"
                ).in_("id", list(alias_family_ids)).execute().data or []
                family_rows.extend(alias_families)
            deduped_families = {row.get("id"): row for row in family_rows if row.get("id")}
            family_ids = list(deduped_families)
            links_by_family: dict[str, list] = {}
            if family_ids:
                link_rows = svc.table("career_role_family_domains").select(
                    "family_id, domain_key, relationship"
                ).in_("family_id", family_ids).execute().data or []
                for link in link_rows:
                    links_by_family.setdefault(link.get("family_id"), []).append({
                        "domainKey": link.get("domain_key"),
                        "relationship": link.get("relationship"),
                    })
            role_families = [
                {
                    "key": family.get("family_key"),
                    "name": family.get("canonical_name"),
                    "primaryDomainKey": family.get("primary_domain_key"),
                    "aliases": family.get("aliases") or [],
                    "domains": links_by_family.get(family.get("id"), []),
                    "sourceConfidence": family.get("source_confidence"),
                    "dataState": family.get("data_state"),
                    "sourceProvenance": family.get("source_provenance") or {},
                    "nigerianContext": family.get("nigerian_context") or {},
                }
                for family in deduped_families.values()
            ]
        except Exception as family_exc:  # noqa: BLE001
            log.debug("career role-family search unavailable", error=str(family_exc))

        programme_query = (
            svc.table("programmes")
            .select("id, name, institution_type, discipline")
            .ilike("name", like)
        )
        if user_type == "student" and school_id:
            # An undergraduate's programme search is anchored to the
            # university already recorded in their starting point. The
            # school_programmes -> programme_mapping hop turns the JAMB
            # offering identity into the canonical programme id used by the
            # career detail route. This prevents a national programme hit
            # from silently opening a course that their university does not
            # offer.
            try:
                offering_rows = (
                    svc.table("school_programmes")
                    .select("jamb_programme_id")
                    .eq("school_id", school_id)
                    .execute()
                ).data or []
                jamb_ids = [
                    row.get("jamb_programme_id")
                    for row in offering_rows
                    if row.get("jamb_programme_id")
                ]
                canonical_ids: list[str] = []
                if jamb_ids:
                    mapping_rows = (
                        svc.table("programme_mapping")
                        .select("programme_id")
                        .in_("jamb_programme_id", jamb_ids)
                        .execute()
                    ).data or []
                    canonical_ids = list(dict.fromkeys(
                        row.get("programme_id")
                        for row in mapping_rows
                        if row.get("programme_id")
                    ))
                # Fail closed for an enrolled student when the selected
                # university has no mapped offering for the query. A national
                # result would misrepresent their actual university context.
                programme_query = programme_query.in_(
                    "id",
                    canonical_ids or ["00000000-0000-0000-0000-000000000000"],
                )
            except Exception as programme_scope_exc:  # noqa: BLE001
                log.debug("undergraduate programme scope unavailable", error=str(programme_scope_exc))
                programme_query = programme_query.in_("id", ["00000000-0000-0000-0000-000000000000"])
        pres = programme_query.order("name").limit(_PUBLIC_SEARCH_LIMIT).execute()
        programmes = [
            {
                "id": p.get("id"),
                "name": p.get("name"),
                "institutionType": p.get("institution_type") or "university",
                "discipline": p.get("discipline"),
            }
            for p in (pres.data or [])
        ]

        def safe_query(label: str, builder):
            try:
                return builder().data or []
            except Exception as query_exc:  # noqa: BLE001
                log.debug("optional career search group unavailable", group=label, error=str(query_exc))
                return []

        subgroup_rows = safe_query(
            "subgroups",
            lambda: svc.table("domain_subgroups")
            .select("id, domain_id, label, description")
            .ilike("label", like)
            .order("label")
            .limit(_PUBLIC_SEARCH_LIMIT),
        )
        tool_rows = safe_query(
            "tools",
            lambda: svc.table("domain_tools")
            .select("id, domain_id, tool_name, tool_group")
            .ilike("tool_name", like)
            .order("tool_name")
            .limit(_PUBLIC_SEARCH_LIMIT),
        )
        certification_rows = safe_query(
            "certifications",
            lambda: svc.table("domain_certifications")
            .select("id, domain_id, name, level, region")
            .ilike("name", like)
            .order("name")
            .limit(_PUBLIC_SEARCH_LIMIT),
        )
        bridge_skill_rows = safe_query(
            "skills",
            lambda: svc.table("domain_bridge_skills")
            .select("id, domain_id, skill_name, category")
            .ilike("skill_name", like)
            .order("skill_name")
            .limit(_PUBLIC_SEARCH_LIMIT),
        )
        role_bridge_skill_rows = safe_query(
            "role skills",
            lambda: svc.table("role_bridge_skills")
            .select("id, domain_id, skill_name, category")
            .ilike("skill_name", like)
            .order("skill_name")
            .limit(_PUBLIC_SEARCH_LIMIT),
        )
        adjacent_skill_rows = safe_query(
            "adjacent skills",
            lambda: svc.table("adjacent_prerequisites")
            .select("id, domain_id, skill_name, category")
            .ilike("skill_name", like)
            .order("skill_name")
            .limit(_PUBLIC_SEARCH_LIMIT),
        )
        university_rows = safe_query(
            "universities",
            lambda: svc.table("schools")
            .select("id, name, institution_type")
            .eq("institution_type", "university")
            .ilike("name", institution_like)
            .order("name")
            .limit(_PUBLIC_SEARCH_LIMIT),
        )
        if not university_rows:
            alias_target = _UNIVERSITY_ALIASES.get(institution_term.lower().replace(" ", ""))
            if alias_target:
                university_rows = safe_query(
                    "university alias",
                    lambda: svc.table("schools")
                    .select("id, name, institution_type")
                    .eq("institution_type", "university")
                    .ilike("name", f"%{alias_target}%")
                    .order("name")
                    .limit(_PUBLIC_SEARCH_LIMIT),
                )
        opportunity_rows = safe_query(
            "opportunities",
            lambda: svc.table("opportunities")
            .select("id, title, opp_type, scope, region")
            .eq("active", True)
            .ilike("title", like)
            .order("title")
            .limit(_PUBLIC_SEARCH_LIMIT),
        )

        # Resolve the domain context for secondary search groups. The context
        # is what makes a result such as ``risk analysis`` actionable rather
        # than just another unlabelled keyword hit.
        context_ids = {
            row.get("domain_id")
            for row in [*subgroup_rows, *tool_rows, *certification_rows,
                        *bridge_skill_rows, *role_bridge_skill_rows,
                        *adjacent_skill_rows]
            if row.get("domain_id")
        }
        if context_ids:
            context_rows = safe_query(
                "domain context",
                lambda: svc.table("domains")
                .select("id, domain_key, name")
                .in_("id", list(context_ids)),
            )
            dmap.update({row.get("id"): row for row in context_rows if row.get("id")})

        subgroups = [
            {
                "id": row.get("id"),
                "name": row.get("label"),
                "domainId": (dmap.get(row.get("domain_id")) or {}).get("domain_key"),
                "domainName": (dmap.get(row.get("domain_id")) or {}).get("name"),
            }
            for row in subgroup_rows
            if row.get("id") and row.get("label")
        ]
        tools = [
            {
                "id": row.get("id"),
                "name": row.get("tool_name"),
                "domainId": (dmap.get(row.get("domain_id")) or {}).get("domain_key"),
                "domainName": (dmap.get(row.get("domain_id")) or {}).get("name"),
                "group": row.get("tool_group"),
            }
            for row in tool_rows
            if row.get("id") and row.get("tool_name")
        ]
        certifications = [
            {
                "id": row.get("id"),
                "name": row.get("name"),
                "domainId": (dmap.get(row.get("domain_id")) or {}).get("domain_key"),
                "domainName": (dmap.get(row.get("domain_id")) or {}).get("name"),
                "level": row.get("level"),
                "region": row.get("region"),
            }
            for row in certification_rows
            if row.get("id") and row.get("name")
        ]

        skill_source_rows = [*bridge_skill_rows, *role_bridge_skill_rows, *adjacent_skill_rows]
        seen_skills: set[tuple[str, str]] = set()
        skills = []
        for row in skill_source_rows:
            name = row.get("skill_name")
            domain = dmap.get(row.get("domain_id")) or {}
            key = (str(name or "").strip().lower(), str(domain.get("domain_key") or ""))
            if not name or key in seen_skills:
                continue
            seen_skills.add(key)
            skills.append({
                "id": row.get("id"),
                "name": name,
                "domainId": domain.get("domain_key"),
                "domainName": domain.get("name"),
                "context": row.get("category"),
            })

        universities = [
            {
                "id": row.get("id"),
                "name": row.get("name"),
                "institutionType": row.get("institution_type") or "university",
            }
            for row in university_rows
            if row.get("id") and row.get("name")
        ]
        opportunities = [
            {
                "id": row.get("id"),
                "title": row.get("title"),
                "type": row.get("opp_type"),
                "scope": row.get("scope"),
                "region": row.get("region"),
            }
            for row in opportunity_rows
            if row.get("id") and row.get("title")
        ]

        return ResponseModel(data=_real({
            "searchIntent": intent_key,
            "userType": user_type,
            "schoolId": school_id,
            "searchContext": intent_copy,
            "domains": domains,
            "subgroups": subgroups,
            "roles": roles,
            "roleFamilies": role_families,
            "programmes": programmes,
            "universities": universities,
            "skills": skills,
            "tools": tools,
            "certifications": certifications,
            "opportunities": opportunities,
        }))
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

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
import asyncio
import functools
import heapq
import re
import time
import weakref
from datetime import datetime, timezone

import anyio
import anyio.to_thread
from fastapi import APIRouter, Body, Depends, HTTPException, Query

from auth import Auth
from database import db
from logger import log
# `error_summary` / `log_db_failure` / `clean_public_query` used to be private
# helpers of THIS file, and the docstring here claimed they were an invariant
# of "the whole module". They now live in `log_safety` because the same
# invariant has to hold for `admission_routes` and `entrepreneurship_routes`,
# whose unauthenticated handlers were still writing `error=str(exc)` into the
# record message at ERROR. The underscore aliases keep the in-file spelling
# (and the existing tests that read `career_routes._error_summary`) unchanged.
from log_safety import (
    clean_public_query as _clean_public_query,
    error_summary as _error_summary,
    ilike_any as _ilike_any,
    log_db_failure as _log_db_failure,
)
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


_SKILL_DELIMITERS = re.compile(r"[|;]")


def _split_skill_string(value: str) -> list[str]:
    """Split the delimiter-joined skill strings used by part of the v2 seed.

    ``domain_roles.essential_skills`` is a JSONB array for some rows and a
    single delimiter-joined ``"a | b | c"`` string for most of them. Measured
    against dev (5,093 role rows): 4,395 string-typed ``essential_skills``,
    511 arrays and 187 nulls; ``optional_skills`` is 3,831 strings, 511 arrays
    and 751 nulls. Treating a joined string as one skill produced
    200-character pseudo-skills, so the delimiters are honoured here rather
    than at every call site. No seeded skill name contains either character in
    its own right.
    """
    return [part.strip() for part in _SKILL_DELIMITERS.split(value) if part.strip()]


def _skill_text(value: Any) -> list[str]:
    """Flatten the JSON/text shapes used by imported skills data."""
    if isinstance(value, str):
        return _split_skill_string(value)
    if isinstance(value, list):
        out: list[str] = []
        for item in value:
            if isinstance(item, str) and item.strip():
                out.extend(_split_skill_string(item))
            elif isinstance(item, dict):
                for key in ("skill", "name", "label", "term"):
                    if isinstance(item.get(key), str) and item[key].strip():
                        out.extend(_split_skill_string(item[key]))
                        break
        return out
    return []


def _is_missing_relation(exc: BaseException) -> bool:
    """True when a PostgREST/Postgres error is 'relation does not exist'.

    Undefined-table is SQLSTATE 42P01; PostgREST reports it as ``PGRST205``
    ("Could not find the table ... in the schema cache") when the schema cache
    has already been reloaded without it.
    """
    text = str(getattr(exc, "args", None) or exc)
    code = str(getattr(exc, "code", "") or "")
    haystack = f"{code} {text}".casefold()
    if any(marker in haystack for marker in ("42p01", "pgrst205", "could not find the table")):
        return True
    # A bare "does not exist" is not enough: an undefined COLUMN (42703) and an
    # undefined FUNCTION (42883) word their messages the same way, and calling
    # either a schema regression would put a typo in the error log under a
    # message that says the table is gone.
    return "does not exist" in haystack and "relation" in haystack


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

def _list_programmes_blocking(
    term: str, institution_type: Optional[str], safe_limit: int
) -> list[dict]:
    """The programme typeahead's PostgREST round trips, off the event loop.

    BLOCKING, and it used to run directly on the loop inside an `async def`.
    That was pre-existing on `main`, but round 10 turned 1-2 synchronous round
    trips into 2-4 (one read per column, per fallback) on the same
    unauthenticated GET, and this branch's own `_jamb_domains_blocking`
    docstring measures what that costs: stall time was 100% of wall clock,
    n=10 concurrent, i.e. a whole-box outage from an unauthenticated search.
    Leaving the one public search path the branch did not off-load while
    arguing at length that this is the risk is not a position worth defending.

    Runs on `/search`'s own PER-LOOP bounded limiter, never the app-wide
    AnyIO default of 40 -- see `_search_query_limiter`.

    `.or_("name.ilike.%term%,display_name.ilike.%term%")` is what used to be
    here, and it put the user's text inside a PostgREST FILTER EXPRESSION
    rather than passing it as a parameter value. `,` and `.` are the DSL's
    separators and are not LIKE metacharacters, so `_clean_public_query`
    neither removed them nor should: `?q=zz,name.gt.A` supplied its own filter
    on its own column, and 25 rows per request of `name.gt.<cursor>` keyset
    pagination walked the whole table out of an endpoint whose own notice says
    "Bulk listing is not exposed." `_ilike_any` reads one column at a time so
    the term is always a single encoded parameter. See `log_safety.ilike_any`
    for the measurements.
    """

    def _programmes(untyped_only: bool = False):
        query = (
            db.get_service_client()
            .schema(_SCHEMA)
            .table("programmes")
            .select("id, name, display_name, institution_type, discipline")
        )
        if untyped_only:
            return query.is_("institution_type", "null")
        if institution_type:
            return query.eq("institution_type", institution_type)
        return query

    rows = _ilike_any(
        _programmes,
        ("name", "display_name"),
        term,
        limit=safe_limit,
        order_by="name",
    )
    if not rows and institution_type == "university":
        # Some earlier programme imports did not set institution_type.
        # Keep the student surface useful for those rows while still
        # excluding records explicitly marked as non-university.
        rows = _ilike_any(
            functools.partial(_programmes, True),
            ("name", "display_name"),
            term,
            limit=safe_limit,
            order_by="name",
        )
    return rows


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
        rows = await anyio.to_thread.run_sync(
            functools.partial(
                _list_programmes_blocking, term, institution_type, safe_limit
            ),
            limiter=_search_query_limiter(),
        )
        items = [
            {
                "id": r["id"],
                "name": r["name"],
                "institutionType": r.get("institution_type") or "university",
                "discipline": r.get("discipline"),
            }
            for r in rows
        ]
        return ResponseModel(data=_real(items))
    except Exception as exc:  # noqa: BLE001 — degrade gracefully to the UI's pending state
        _log_db_failure("career list_programmes failed", exc)
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
        _log_db_failure("programme skills lookup skipped", exc, level="warning")
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
            _log_db_failure("programme student naming lookup skipped", exc, level="warning")
        notice = None if domains else "Domain links are not available for this programme yet."
        return ResponseModel(data=_real(programme, notice=notice))
    except Exception as exc:  # noqa: BLE001
        _log_db_failure("career get_programme failed", exc)
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
        # The elite gate: legacy `elite_domain` is an audit input, not
        # publication evidence, so it is only honoured for domains that also
        # have a published review. This lookup MUST stay: the `eliteFlag`
        # expression below reads `published_domain_ids`, and without the
        # assignment the resulting NameError is swallowed by the `except` at
        # the end of this function -- so the endpoint answers `coming_soon` on
        # every request and the Domain Explorer this function exists to fill
        # goes permanently empty, with nothing in the logs naming the cause.
        # This has now regressed twice; test_domain_clusters.py guards it.
        published_domain_ids = _published_elite_entity_ids("domain")

        grouped: dict[str, list] = {}
        for r in rows:
            entry = {
                # The domain route keys on domain_key, not the uuid.
                "id": r.get("domain_key") or r["id"],
                "name": r.get("name"),
                # `A and B or (A and C)` distributes to `A and (B or C)`: a
                # domain may be keyed by either uuid or domain_key in the
                # reviews table, hence both lookups.
                "eliteFlag": bool(r.get("elite_domain"))
                and (
                    str(r.get("id")) in published_domain_ids
                    or str(r.get("domain_key")) in published_domain_ids
                ),
            }
            grouped.setdefault(r.get("cluster") or "Other", []).append(entry)

        out = [
            {"cluster": cluster, "domains": sorted(domains, key=lambda d: d["name"] or "")}
            for cluster, domains in sorted(grouped.items())
        ]
        return ResponseModel(data=_real(out))
    except Exception as exc:  # noqa: BLE001
        _log_db_failure("career list_domain_clusters failed", exc)
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
        _log_db_failure("career get_domain failed", exc)
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
            _log_db_failure("career role enrichment unavailable", enrichment_exc, level="warning")

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
        _log_db_failure("career get_role failed", exc)
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
        _log_db_failure("career list_opportunities failed", exc)
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
        _log_db_failure("career get_opportunity failed", exc)
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
        _log_db_failure("career list_elite_pathways failed", exc)
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
        _log_db_failure("career get_elite_pathway failed", exc)
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
        _log_db_failure("career get_bridge_plan failed", exc)
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
        _log_db_failure("career list_scholarships failed", exc)
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
        _log_db_failure("career list_application_windows failed", exc)
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
        _log_db_failure("career skill discovery failed", exc)
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


_SKILL_INDEX_TTL_SECONDS = 900.0
# A build whose layers came back empty or short is almost never the truth about
# a static taxonomy: it is an RLS change, a mid-reseed truncate, a page bound or
# a transport failure that did not raise. Such a build is still cached (so a
# genuinely empty table does not turn every keystroke into three full-table
# scans) but only briefly, and loudly, so it cannot be served as authoritative
# for the full TTL.
#
# This MUST stay above the measured cost of one build (10.0-16.4 s against
# dev). At the old 30 s a degraded index spent roughly half its wall time
# rebuilding, so a single RLS mistake turned into three full-table reads of
# domain_roles every half minute, forever.
_SKILL_INDEX_EMPTY_TTL_SECONDS = 120.0
# How many rows to ASK for per page. This is deliberately NOT tied to the
# server's `db-max-rows`: PostgREST clamps a larger request to its own cap and
# says so only in `Content-Range`, which the supabase client discards. The
# pager below therefore never infers anything from the size of a page -- it
# advances by the number of rows it actually received and stops on an empty
# one -- so this value is a throughput knob, not a correctness input.
_SKILL_PAGE_SIZE = 1000
# A bound on total pages so a pathological response (a server that keeps
# returning rows) cannot loop forever. Hitting it is a bug, not a normal
# outcome: it is logged at warning AND marks the build partial.
_SKILL_MAX_PAGES = 64
# Skill search scans the whole in-memory index, so its floor is higher than the
# two characters the rest of /search accepts. `_search_terms` splits on
# ` at|in|for|near `, so `?q=e in zz` reaches the skill layer as the one-letter
# subject `e` -- which matched 20k+ rows on an unauthenticated, unthrottled
# route.
_MIN_SKILL_QUERY_LEN = 2
# Below this length the scan keeps only PREFIX matches. `ai`, `go`, `bi`, `ux`
# and `3d` are real skill-name prefixes with 6-16 names each, and `R` and `C#`
# are real names, so a hard floor of three silently deleted them from /search.
# A two-character SUBSTRING needle is the pathological case (`e` matched 20k+
# rows and grew a per-name dict that large); a two-character PREFIX needle
# matches tens of names, so the scan stays a cheap `startswith` over the index
# and the result set is bounded by construction.
_SKILL_PREFIX_ONLY_BELOW = 3
_skill_index_cache: Optional[tuple[float, list[dict], bool]] = None

# How many threadpool threads the skill layer may ever hold. `run_in_threadpool`
# draws on AnyIO's DEFAULT limiter -- 40 tokens shared by the WHOLE app, every
# sync route and dependency included -- so the skill layer gets its own bounded
# limiters and can never starve anything else.
_SKILL_BUILD_THREADS = 1
_SKILL_RANK_THREADS = 8
# The same reasoning for /search's own blocking round-trips. `search_career` is
# `async def` and the supabase client is synchronous, so its ~15 sequential
# PostgREST calls used to run INSIDE the loop: MEASURED against dev with a warm
# index, n=1 -> 5.06 s and n=10 -> 55.64 s (5.56 s/req), a single event-loop
# stall of 3.77-5.12 s, and loop-stall time equal to ~100% of wall clock. The
# route has no auth and no rate limit and the unit runs `--workers 2`, so ~20
# concurrent requests took EVERY endpoint on the box down with it. The work now
# runs in a thread on its own bounded limiter -- never the app-wide 40.
#
# WHAT IS FIXED, measured after the change: n=10 wall 55.64 s -> 9.29 s; max
# event-loop stall 3.77-5.12 s -> 0.331 s; stall time 100% -> 3.6% of wall. The
# cross-endpoint blast radius is gone too -- `/api/career/scholarships` answers
# in 0.626 s idle and 0.579 s under 10 concurrent searches. Cancellation frees
# threads cleanly (`borrowed_tokens == 0` after abandoning a request).
#
# WHAT IS NOT FIXED, and is a deliberate non-goal here: there is no admission
# control in front of this limiter. `anyio.CapacityLimiter.acquire()` queues
# waiters WITHOUT bound and nothing sheds load, so concurrency past 8 turns
# into latency rather than into an error. Modelled: n=50 -> all served, last at
# 21.2 s; n=200 -> all served, last at 76.5 s, peak traced memory 10.6 MB
# (~53 KB per pending request). So this is a LATENCY/holding exposure, not
# memory exhaustion. `/search` is unauthenticated and unrated at ~4.6 s of real
# DB time over 10-15 round trips, and because `run_sync` uses the default
# `abandon_on_cancel=False` a client that disconnects immediately still costs a
# full thread-slot for the whole 4.6 s (cost asymmetry).
#
# Two things were done about it rather than building a rate limiter, which is a
# product decision that has not been made: the cheapest amplifier was removed
# (`log_safety.clean_public_query` now strips `*`, so `?q=**` no longer turns
# one request into a full-table scan), and the residual is written down here.
# A real fix is admission control or authentication on this route.
_SEARCH_QUERY_THREADS = 8

# Per-EVENT-LOOP build state, keyed weakly so a closed loop is collected.
#
# Neither of the two obvious spellings works here:
#
#   * a module-global `asyncio.Lock` binds to whichever loop first CONTENDS on
#     it and raises "... is bound to a different event loop" on every loop
#     after that. In `search_career` that RuntimeError was swallowed by
#     `except Exception` and became `skills: []` -- the silent-empty bug.
#   * a module-global `threading.Lock` is loop-independent but is acquired
#     INSIDE the threadpool: each waiter takes one of the shared 40 tokens and
#     then blocks on the lock for the whole 8-16 s build. MEASURED: 45 cold
#     calls made an unrelated `run_in_threadpool` wait 2.80 s.
#
# A per-loop `asyncio.Lock` has both properties: waiters park on the loop
# (holding no thread), and exactly ONE thread ever enters the pool to build.
_skill_loop_state: "weakref.WeakKeyDictionary[Any, dict]" = weakref.WeakKeyDictionary()


def _loop_state() -> dict:
    """The running loop's build lock, thread limiters and refresh handle.

    Created lazily: `anyio.CapacityLimiter()` needs a running async backend, so
    it cannot be built at import time.

    EVERYTHING that is bound to a loop lives here, including the
    stale-while-revalidate refresh TASK. A task handle is as loop-bound as a
    lock is: parked in a module global, a refresh scheduled on loop A that
    never finished (because loop A closed mid-build) stays `done() == False`
    forever, and every later `_skill_index()` call on loop B therefore declines
    to schedule its own rebuild and serves an arbitrarily old index with no log
    line naming the cause.
    """
    loop = asyncio.get_running_loop()
    state = _skill_loop_state.get(loop)
    if state is None:
        state = {
            "lock": asyncio.Lock(),
            "build": anyio.CapacityLimiter(_SKILL_BUILD_THREADS),
            "rank": anyio.CapacityLimiter(_SKILL_RANK_THREADS),
            "search": anyio.CapacityLimiter(_SEARCH_QUERY_THREADS),
            "refresh": None,
        }
        _skill_loop_state[loop] = state
    return state


def _skill_loop_gate() -> tuple["asyncio.Lock", Any, Any]:
    """The running loop's `(build lock, build limiter, rank limiter)`."""
    state = _loop_state()
    return state["lock"], state["build"], state["rank"]


def _search_query_limiter() -> Any:
    """The running loop's limiter for /search's blocking round-trips."""
    return _loop_state()["search"]


def _reset_skill_loop_state() -> None:
    """Drop every per-loop gate, limiter and refresh handle (tests only)."""
    _skill_loop_state.clear()


def _reset_skill_index_cache() -> None:
    """Drop the cached skill index (used by tests and after a reseed)."""
    global _skill_index_cache
    _skill_index_cache = None


def _skill_index_is_fresh(cached: Optional[tuple[float, list[dict], bool]]) -> bool:
    """True while `cached` may still be served without a rebuild."""
    if not cached:
        return False
    ttl = _SKILL_INDEX_EMPTY_TTL_SECONDS if cached[2] else _SKILL_INDEX_TTL_SECONDS
    return (time.monotonic() - cached[0]) < ttl


def _fetch_all_rows(svc, table: str, columns: str, order_column: str) -> tuple[list[dict], bool]:
    """Read an entire table through PostgREST. Returns ``(rows, complete)``.

    `.limit(n)` is NOT a way to read a whole table here: PostgREST caps the
    response at its own `db-max-rows` (1000 on this project) and reports the
    truncation only in the `Content-Range` header, which the supabase client
    discards. The result is a silently partial index — measured at 15,298 of
    44,895 index rows and 5,820 of 10,329 distinct skill names.

    Two rules keep this independent of the server's cap rather than hardcoded
    to today's value of it:

      * the loop advances by ``len(chunk)``, never by ``_SKILL_PAGE_SIZE``, and
        terminates on an EMPTY chunk. Inferring "that was the last page" from a
        short page is what re-armed the silent truncation: raise
        ``_SKILL_PAGE_SIZE`` above the server cap and every clamped page looks
        short, so the very first one ends the read.
      * the row total is cross-checked against ``count="exact"``. A read that
        does not match the server's own count is reported as incomplete, which
        is what stops a reseed landing mid-pagination from being cached as
        authoritative for 900 s.

    `complete` is False on a count mismatch or on hitting `_SKILL_MAX_PAGES`;
    the caller turns that into the index-wide `partial` flag. A server that
    does not return a count (or a mock that does not model one) leaves the
    cross-check unarmed rather than failing closed.

    The `.order()` is load-bearing, not cosmetic: without a total order the
    pages are cut out of unspecified physical order, so they can overlap and
    leave holes, and which rows land in which page changes after any UPDATE or
    VACUUM. `order_column` must be unique (every one used here is a primary
    key).
    """
    rows: list[dict] = []
    expected: Optional[int] = None
    for page in range(_SKILL_MAX_PAGES):
        # `count="exact"` makes PostgREST run a full COUNT(*) for the request,
        # so asking for it on every page charged a six-page build six counts of
        # the same static table. The cross-check only ever reads the FIRST
        # page's count, so that is the only page that asks for it.
        select_kwargs = {"count": "exact"} if page == 0 else {}
        res = (
            svc.table(table)
            .select(columns, **select_kwargs)
            .order(order_column)
            .range(len(rows), len(rows) + _SKILL_PAGE_SIZE - 1)
            .execute()
        )
        chunk = getattr(res, "data", None) or []
        if page == 0:
            count = getattr(res, "count", None)
            # A MagicMock (or a PostgREST build without the count header) must
            # not be mistaken for a total of zero.
            expected = count if isinstance(count, int) else None
        if not chunk:
            break
        rows.extend(chunk)
    else:
        log.warning(
            "skill layer fetch stopped at its page bound rather than at the end of the data",
            table=table,
            pages=_SKILL_MAX_PAGES,
            rows=len(rows),
        )
        return rows, False
    if expected is not None and len(rows) != expected:
        log.warning(
            "skill layer row count does not match the server's exact count",
            table=table,
            rows=len(rows),
            expected=expected,
        )
        return rows, False
    return rows, True


def _build_skill_index(svc) -> list[dict]:
    """Flatten the v2 JSONB skill layers into searchable rows.

    ``domain_bridge_skills`` and ``role_bridge_skills`` were dropped by
    migration_career_v2.sql; v2 stores the same information as JSONB on the
    taxonomy rows instead of as its own tables:

      * ``domains.foundation_skills``        — L1, the domain-wide skills
        (the successor of domain_bridge_skills)
      * ``domain_subgroups.cluster_skills``  — L2, the sub-group delta layer
        (new in v2, no pre-sweep equivalent)
      * ``domain_roles.essential_skills`` / ``optional_skills`` — L3, the
        per-role skills (the successor of role_bridge_skills)

    PostgREST cannot substring-match inside a JSONB array, so the three layers
    are flattened once and searched in memory. The taxonomy is static seed
    data, so the flattened index is cached for ``_SKILL_INDEX_TTL_SECONDS``
    rather than refetched on every keystroke. Measured cost of one full build
    against dev: 160 domains (~0.34 MB), 542 sub-groups (~0.24 MB) and 5,093
    roles (~3.7 MB) — roughly 4.2 MB and a MEASURED 10.0-16.4 s of blocking
    client work, which is why the caller runs it in a threadpool under a lock
    and serves the previous index while it runs.

    Excluded domains are dropped here rather than at query time. `excluded` is
    the publication switch `list_domain_clusters` uses to keep D086 (gambling)
    out of the explorer; skipping it here put the same domain's skills into
    /search, named and counted, by another door. Sub-group and role rows are
    dropped with their domain, so no layer can reintroduce one.

    Each row carries a pre-casefolded ``skill_name_cf``: `_rank_skill_matches`
    scans all ~44,895 rows per request, and casefolding them per request put
    22-612 ms of synchronous work on a public, unauthenticated route.

    This is synchronous and blocking (the supabase client is). Call it through
    ``_skill_index`` rather than directly from a request handler.
    """
    global _skill_index_cache

    domains, domains_ok = _fetch_all_rows(svc, "domains", "id, excluded, foundation_skills", "id")
    subgroups, subgroups_ok = _fetch_all_rows(
        svc, "domain_subgroups", "id, domain_id, label, cluster_skills", "id"
    )
    roles, roles_ok = _fetch_all_rows(
        svc,
        "domain_roles",
        "id, role_key, role_name, domain_id, essential_skills, optional_skills",
        "id",
    )

    # The publication policy, applied once. Everything downstream keys off
    # `allowed`, so a new layer cannot bypass it by forgetting a filter.
    allowed = {str(d.get("id")) for d in domains if d.get("id") and not d.get("excluded")}

    rows: dict[tuple[str, str], dict] = {}

    def add(skill: str, domain_id: Optional[str], context: str, ident: str) -> None:
        name = (skill or "").strip()
        if not name or not domain_id or str(domain_id) not in allowed:
            return
        folded = name.casefold()
        key = (folded, str(domain_id))
        # A skill that appears at more than one layer keeps its first (widest)
        # context: a domain foundation skill is a better search answer than the
        # same string repeated on forty roles.
        rows.setdefault(key, {
            "id": ident,
            "domain_id": domain_id,
            "skill_name": name,
            "skill_name_cf": folded,
            "category": context,
        })

    for domain in domains:
        did = domain.get("id")
        for skill in _skill_text(domain.get("foundation_skills")):
            add(skill, did, "Foundation skill", f"foundation:{did}:{skill.casefold()}")
    for group in subgroups:
        did = group.get("domain_id")
        label = group.get("label") or "Sub-group"
        for skill in _skill_text(group.get("cluster_skills")):
            add(skill, did, f"Sub-group skill — {label}", f"subgroup:{group.get('id')}:{skill.casefold()}")
    for role in roles:
        did = role.get("domain_id")
        role_name = role.get("role_name") or "role"
        role_key = role.get("role_key")
        for skill in _skill_text(role.get("essential_skills")):
            add(skill, did, f"Role skill — {role_name}", f"role:{role_key}:{skill.casefold()}")
        for skill in _skill_text(role.get("optional_skills")):
            add(skill, did, f"Role skill (optional) — {role_name}", f"role:{role_key}:{skill.casefold()}")

    # Sorted by (name, domain) so the per-name domain cap below picks the same
    # domains on every request instead of whichever the dict happened to hold.
    index = sorted(rows.values(), key=lambda r: (r["skill_name_cf"], str(r["domain_id"])))

    empty_layer = not domains or not subgroups or not roles
    short_layer = not (domains_ok and subgroups_ok and roles_ok)
    partial = empty_layer or short_layer
    if partial:
        # Not an exception: `.execute().data or []` turns an RLS change or a
        # mid-reseed truncate into a perfectly successful empty answer, and the
        # endpoint would then serve `status: "real"` with `skills: []` — which
        # a client cannot tell apart from a genuine no-match — for the full
        # TTL. A SHORT read is the same class and used not to be caught at all:
        # every layer non-empty but truncated gave `partial=False` and 900 s of
        # a confidently wrong index.
        log.warning(
            "career skill index built from an empty or short layer; caching it only briefly",
            domains=len(domains),
            subgroups=len(subgroups),
            roles=len(roles),
            domains_complete=domains_ok,
            subgroups_complete=subgroups_ok,
            roles_complete=roles_ok,
            index_rows=len(index),
        )
    # Stamped AFTER the read, not before it: taking `time.monotonic()` at the
    # top charged the 8-16 s build against the index's own TTL, so every index
    # was born that stale -- up to 13% of the 120 s partial TTL gone before the
    # first request could be served from it.
    _skill_index_cache = (time.monotonic(), index, partial)
    return index


async def _build_skill_index_guarded(svc) -> list[dict]:
    """`_build_skill_index` behind the running loop's gate, with a re-check.

    The gate is held on the EVENT LOOP, not inside the threadpool: waiters park
    on the loop holding no thread, and only the winner crosses into a thread.
    The re-check under the gate is what collapses a thundering herd of cold
    requests into one build rather than N.
    """
    lock, build_limiter, _rank_limiter = _skill_loop_gate()
    async with lock:
        cached = _skill_index_cache
        if _skill_index_is_fresh(cached):
            return cached[1]  # type: ignore[index]
        return await anyio.to_thread.run_sync(
            _build_skill_index, svc, limiter=build_limiter
        )


async def _refresh_skill_index(svc) -> None:
    """Background rebuild for the stale-while-revalidate path.

    Never raises into the caller: if the rebuild fails the previous index stays
    in the cache and keeps being served, which is the whole point.
    """
    try:
        await _build_skill_index_guarded(svc)
    except Exception as refresh_exc:  # noqa: BLE001
        log.warning(
            "career skill index background refresh failed",
            error_code=_error_summary(refresh_exc)[0],
            error_type=type(refresh_exc).__name__,
        )
        log.debug("career skill index background refresh detail", error=str(refresh_exc))
    finally:
        _loop_state()["refresh"] = None


async def _skill_index(svc) -> list[dict]:
    """Return the cached skill index, building it off the event loop.

    ``search_career`` is ``async def`` and the supabase client is synchronous,
    so a cold rebuild blocks the whole worker — MEASURED at 10.0-16.4 s for a
    full paged build, and 41.6 s end-to-end for a cold ``/search``.

    A COMPLETE index that has merely aged past its TTL is served immediately
    and refreshed behind the request (stale-while-revalidate). The lock used to
    collapse the herd correctly and then convert it into one shared 10-16 s
    stall every 900 s, while a perfectly serviceable expired index sat in
    memory unused.

    A PARTIAL index is not eligible for that: it is known to be wrong, so it is
    rebuilt synchronously once its short TTL is up. If that rebuild raises, the
    expired index is served anyway — stale beats `skills: []`, which a client
    cannot tell apart from a genuine no-match.
    """
    cached = _skill_index_cache
    if _skill_index_is_fresh(cached):
        return cached[1]  # type: ignore[index]
    if cached and not cached[2]:
        # Stale but complete: answer now, refresh behind. The handle is kept in
        # the RUNNING LOOP's state, so a burst schedules exactly one refresh and
        # a handle left over from a closed loop can never suppress the next one.
        state = _loop_state()
        task = state.get("refresh")
        if task is None or task.done():
            state["refresh"] = asyncio.create_task(_refresh_skill_index(svc))
        return cached[1]
    try:
        return await _build_skill_index_guarded(svc)
    except Exception:
        stale = _skill_index_cache
        if stale is not None:
            log.warning("career skill index rebuild failed; serving the expired index")
            return stale[1]
        raise


# One skill name may legitimately be attached to dozens of domains. Capping how
# many domains a single name contributes keeps the group varied instead of
# spending the whole 20-result budget on one string; `otherDomainCount` on the
# emitted row tells the client how many were withheld so it can say "and N
# other fields" rather than implying the two shown are all of them.
_MAX_DOMAINS_PER_SKILL = 2


def _skill_match_rank(name: str, needle: str) -> int:
    """0 = prefix, 1 = substring elsewhere. Lower sorts first.

    There is deliberately no separate "exact" rank. An exact match IS a prefix
    match and is the SHORTEST possible one, so the `len(name)` tie-break in the
    sort key already puts it first; a third rank was unreachable as an ordering
    input and could be deleted without changing a single result.
    """
    return 0 if name.startswith(needle) else 1


def _rank_skill_matches(index: list[dict], term: str, limit: int) -> list[dict]:
    """Rank substring matches before truncating them.

    The index is ordered by skill name, so taking the first `limit` hits in
    index order answered ``financial`` with twelve alphabetically-early
    ``advise on financial …`` entries and never reached ``financial
    statements`` — an exact name that exists (``financial`` matches 57 distinct
    names). Matches are ranked prefix → substring -- there is deliberately no
    separate exact rank, see `_skill_match_rank` -- and only then cut.

    The ORDER is identical to a full sort on
    ``(rank, len(name), name, domain_id)`` followed by the per-name domain cap,
    but nothing here is O(matches log matches):

      * names are folded once at build time (`skill_name_cf`), not per request;
      * the per-name domain cap is applied DURING the scan, so at most
        `_MAX_DOMAINS_PER_SKILL` rows per distinct name are ever retained;
      * the top `limit` names are chosen with a bounded heap over distinct
        names, not by sorting every matching row.

    That matters because this runs on a public route with no auth and no rate
    limiter: `?q=e in zz` reaches here as the subject `e`, and the previous
    full scan + full sort measured 161-505 ms of event-loop time per request.
    """
    needle = (term or "").strip().casefold()
    if not needle or limit <= 0:
        return []
    # A short needle keeps PREFIX matches only. `e` as a substring matched 20k+
    # rows and grew a per-name dict that large on an unauthenticated route; `e`
    # as a prefix matches tens. `startswith` is also cheaper per row than `in`.
    prefix_only = len(needle) < _SKILL_PREFIX_ONLY_BELOW
    # name -> [total rows seen, [(domain_id, row), ...] capped and sorted]
    per_name: dict[str, list] = {}
    for row in index:
        name = row.get("skill_name_cf") or str(row.get("skill_name") or "").casefold()
        if not (name.startswith(needle) if prefix_only else needle in name):
            continue
        entry = per_name.get(name)
        if entry is None:
            entry = per_name[name] = [0, []]
        entry[0] += 1
        kept = entry[1]
        domain = str(row.get("domain_id"))
        if len(kept) < _MAX_DOMAINS_PER_SKILL:
            kept.append((domain, row))
            kept.sort(key=lambda pair: pair[0])
        elif domain < kept[-1][0]:
            kept[-1] = (domain, row)
            kept.sort(key=lambda pair: pair[0])
    if not per_name:
        return []

    # Rows of one name are contiguous under the full-sort key, so choosing the
    # best `limit` NAMES and expanding them in order is the same answer.
    best_names = heapq.nsmallest(
        limit, per_name, key=lambda name: (_skill_match_rank(name, needle), len(name), name)
    )

    out: list[dict] = []
    emitted: dict[str, int] = {}
    for name in best_names:
        total, kept = per_name[name]
        for _domain, row in kept:
            out.append(dict(row, other_domain_count=0))
            emitted[name] = emitted.get(name, 0) + 1
            if len(out) >= limit:
                break
        if len(out) >= limit:
            break
    # `other_domain_count` is "how many further domains carry this name and are
    # NOT in this response". Deriving it from `_MAX_DOMAINS_PER_SKILL` was off
    # by one whenever `limit` cut a name after its first row, so the count is
    # taken from what was actually emitted.
    for row in out:
        # EXACTLY the spelling the scan above used to key `per_name`. The two
        # used to disagree: the scan read `row.get("skill_name_cf") or
        # <fallback>` (falsy -> fallback) while this read
        # `row["skill_name_cf"] if "skill_name_cf" in row else ...`
        # (present-but-falsy -> ""), so a row carrying `skill_name_cf: ""` was
        # counted under its fallback name and then looked up under "" --
        # `KeyError: ''` on a public route.
        name = row.get("skill_name_cf") or str(row.get("skill_name") or "").casefold()
        row["other_domain_count"] = max(0, per_name[name][0] - emitted.get(name, 0))
    return out


async def _search_skill_layers(svc, term: str, limit: int) -> tuple[list[dict], bool]:
    """Ranked substring search over the flattened v2 skill layers.

    Returns ``(rows, index_is_partial)``.

    Both halves run off the event loop, on the skill layer's OWN capacity
    limiters rather than the app-wide 40: the build (10-16 s cold) and the rank
    (a scan of ~44,895 rows).

    The floor is the same two characters the rest of /search accepts. A higher
    floor was not a security control, it was a silent deletion: `R` and `C#`
    are real skill names, `ai`/`go`/`bi`/`ux`/`3d` are real prefixes, and the
    response carried no notice, so a gated query was indistinguishable from a
    genuine no-match. What the scan is protected by instead is
    `_SKILL_PREFIX_ONLY_BELOW`: below three characters only prefix matches are
    kept, which bounds the work AND the result set without hiding anything a
    user could reasonably be looking for. A ONE-character subject (reachable as
    `?q=e in zz`, which `_search_terms` splits) is still refused, and
    `search_career` says so in the response notice.
    """
    stem = (term or "").strip()
    if len(stem) < _MIN_SKILL_QUERY_LEN:
        return [], False
    index = await _skill_index(svc)
    # A KNOWN-PARTIAL index used to be logged and then handed to the client as
    # an ordinary answer, so "we could only read part of the taxonomy" and
    # "this really is everything" were the same response. The flag travels back
    # with the rows so `search_career` can say which one it is.
    cached = _skill_index_cache
    partial = bool(cached and cached[2])
    _lock, _build_limiter, rank_limiter = _skill_loop_gate()
    rows = await anyio.to_thread.run_sync(
        _rank_skill_matches, index, stem, limit, limiter=rank_limiter
    )
    return rows, partial


def _read_may_be_truncated(response, rows: list) -> bool:
    """True unless the server's own exact count says this read was complete.

    The discriminator between the two "succeeded but told me less than
    everything" cases, which a row count alone CANNOT tell apart:

      * TRUNCATED -- a project-level PostgREST `db-max-rows` below the number
        of rows the filter actually matches. PostgREST answers 200 with a
        partial `Content-Range`, so `count` exceeds `len(rows)`.
      * genuinely absent -- a dangling foreign key. The filter matched fewer
        rows than the caller asked about, and `count == len(rows)` says so.

    Only the first is a failure. Comparing `len(rows)` against the number of
    IDS REQUESTED conflates them, and conflating them is not a safe default in
    either direction: it turns every unresolved row into an "unknown" and
    empties the secondary groups whenever a row points at a domain this
    response never read (which `_search_domain_context_blocking`'s caller
    deliberately still publishes, with a null domain).

    WHAT A MISSING COUNT MEANS. An earlier version of this returned
    `isinstance(count, int) and len(rows) < count`, i.e. a non-`int` count was
    "no opinion" and therefore `ok=True` -- a genuinely truncated read was
    indistinguishable from a complete one AND NOTHING WAS LOGGED. That failed
    OPEN on the one fact the caller derives a SECURITY decision from. PROVEN
    against the real route with the excluded-domain fixture:

        data=[], count=1     -> 0 hidden labels published, warned     (correct)
        data=[], count=None  -> 3 hidden labels published, NO warning
        data=[], count="1"   -> 3 published, no warning
        data=[], count=0     -> 3 published, no warning
        data=[row], count=1  -> 0 published (genuine success control)

    So "no opinion" is now an ASSUMED truncation: no usable count means the
    caller does not know what it did not see, which is the same position a
    failed read leaves it in. A MagicMock reaching here is a FIXTURE that
    forgot to state a count, and the place to fix that is the fixture -- not by
    loosening production logic until the mock looks complete.

    ACCEPTED LIMITATION: `count=0` with non-empty `rows` is impossible, and
    `count=0` with empty `rows` is indistinguishable from a real empty read, so
    a server that reports 0 for a truncated read cannot be caught here.
    `count=False` is the SAME case, not a second one: `bool` is a subclass of
    `int`, so `isinstance(False, int)` is True and `len(rows) < False` is
    `len(rows) < 0`. Both therefore answer "complete" on an empty read, and the
    gap above is the whole of it.
    """
    count = getattr(response, "count", None)
    if not isinstance(count, int):
        return True
    return len(rows) < count


def _safe_query(label: str, builder, *, count_checked: bool = False) -> tuple[list[dict], bool]:
    """Run one optional /search group query. Returns ``(rows, ok)``.

    `builder()` returns a PostgREST request builder, which has no `.data`:
    reading it instead of calling `.execute()` raised AttributeError straight
    into the route's own handler, so every optional group here (sub-groups,
    tools, certifications, universities, opportunities and the domain context
    lookup) returned [] whatever the query.

    ``ok`` is the half that used to be thrown away, and throwing it away was a
    SECURITY bug, not a tidiness one. The caller derives the excluded-domain set
    from the "domain context" read; a swallowed failure made that set EMPTY, so
    every `excluded` filter downstream passed and a hidden domain's sub-groups,
    tools and certifications were emitted -- named, with a null domain, which is
    exactly the label leak the switch exists to prevent. "This query returned
    nothing" and "this query failed, so I know nothing" are different facts and
    are now reported as different facts.

    ``count_checked`` adds the third fact. A read whose caller derives a
    SECURITY decision from the rows it did not see cannot treat "the server cut
    me off" as "that is everything": pass `count="exact"` in the select and
    `count_checked=True`, and a truncated read reports ``ok=False`` exactly as
    a failed one does. See `_read_may_be_truncated`.
    """
    try:
        response = builder().execute()
        rows = getattr(response, "data", None) or []
        if count_checked and _read_may_be_truncated(response, rows):
            log.warning(
                "career search group is not verifiably complete (no usable "
                "exact count, or fewer rows than it)",
                group=label,
                rows=len(rows),
                expected=getattr(response, "count", None),
            )
            return rows, False
        return rows, True
    except Exception as query_exc:  # noqa: BLE001
        # A missing relation is a schema regression, not an optional
        # enrichment table that has not been migrated yet: it means the
        # endpoint is silently serving an empty group forever. Log it
        # loudly while still degrading rather than 500-ing.
        # A classified summary, never `str(exc)`: the PostgREST message
        # and hint name the schema and tables, and an HTTPStatusError
        # carries the request URL -- project ref plus the user's raw
        # search string. Escalating these to warning/error moved them
        # out of a debug-only sink and into stdout/journald and
        # error.log (30-day retention), so the raw text stays at debug
        # -- which is written to disk in development only (logger.py).
        error_code, error_type = _error_summary(query_exc)
        if _is_missing_relation(query_exc):
            log.error(
                "career search group queries a relation that does not exist",
                group=label,
                error_code=error_code,
                error_type=error_type,
            )
        else:
            # Still the silent-empty class: a statement timeout, a
            # 42501 RLS denial or a PostgREST 5xx all end here and the
            # group just disappears from the response. Warning, not
            # debug, so it is visible at the default log level.
            log.warning(
                "optional career search group unavailable",
                group=label,
                error_code=error_code,
                error_type=error_type,
            )
        log.debug("career search group failure detail", group=label, error=str(query_exc))
        return [], False


def _search_catalogue_blocking(
    svc,
    *,
    like: str,
    institution_like: str,
    institution_term: str,
    user_type: Optional[str],
    school_id: Optional[str],
) -> dict:
    """Every blocking PostgREST round-trip /search needs, in ONE synchronous call.

    This is deliberately a plain `def`. The supabase client is synchronous, so
    each of these ~14 sequential round-trips parked the whole worker's event
    loop when they ran inside `async def search_career`. MEASURED against dev
    with a WARM index: n=1 -> 5.06 s, n=5 -> 25.48 s, n=10 -> 55.64 s -- exactly
    linear, i.e. zero concurrency -- with a single event-loop stall of
    3.77-5.12 s and loop-stall time equal to ~100% of wall clock. A guaranteed
    no-match (`q=zzzzzzzzzz`) still cost 3.25 s. The route has no auth and no
    rate limit and the unit runs `--workers 2`, so ~20 concurrent requests
    stalled both loops and took every other endpoint on the box with them.

    `search_career` runs this through `anyio.to_thread.run_sync` on the
    PER-LOOP `_search_query_limiter()`. Per-loop, and never a module global:
    a module-global `asyncio.Lock` binds to one loop, and a module-global
    `threading.Lock` is taken inside the pool and starves the app-wide 40-token
    default limiter. Both were shipped and both had to be taken back out.

    Call it through the route, not directly from a handler.
    """
    # THE EXCLUDED POLICY, in one place: `excluded` HIDES THE CONTENT of a
    # domain, it does not merely un-name it. `list_domain_clusters` uses the
    # same switch to keep D086 (gambling) out of the explorer; emitting its
    # sub-groups, tools, certifications, roles or role families with the
    # domain nulled leaves the LABEL -- "Sports betting odds modelling" --
    # which is the leak the switch exists to prevent. Every group below
    # therefore DROPS rows belonging to an excluded domain, and a row whose
    # domain merely failed to resolve (never read, no error) is kept with a
    # null domain, which is a different thing.
    excluded_domain_ids: set = set()
    excluded_domain_keys: set = set()

    dres = (
        svc.table("domains")
        .select("domain_key, name, cluster, excluded")
        .ilike("name", like)
        .order("name")
        .limit(_PUBLIC_SEARCH_LIMIT)
        .execute()
    )
    # `excluded` is applied at EVERY point /search can name or describe a
    # domain: this group, the role context map, the role-family group, the
    # secondary-group context lookup and the skill index.
    domain_rows = dres.data or []
    excluded_domain_keys.update(
        str(d.get("domain_key")) for d in domain_rows if d.get("excluded") and d.get("domain_key")
    )
    domains = [
        {"id": d.get("domain_key"), "name": d.get("name"), "cluster": d.get("cluster")}
        for d in domain_rows
        if not d.get("excluded")
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
            .select("id, domain_key, name, excluded", count="exact")
            .in_("id", domain_ids)
            .execute()
        )
        role_domain_rows = dref.data or []
        excluded_domain_ids.update(
            str(d["id"]) for d in role_domain_rows if d.get("excluded") and d.get("id")
        )
        # Same missing-`.limit()` shape as the domain-context read, so the same
        # guard. Only a read the SERVER says it truncated fails closed here: an
        # id that is simply absent from `domains` stays "unresolved" and its
        # role is still emitted, which is the round-6 policy. Left open, a
        # truncated read put an excluded domain's role back in the response as
        # `{name, tier, domains: []}` -- named, unroutable, and sourced
        # entirely from the domain that was meant to be hidden, which is
        # exactly what the `continue` below was added to stop.
        if _read_may_be_truncated(dref, role_domain_rows):
            log.warning(
                "career search role domain lookup is not verifiably complete "
                "(no usable exact count, or fewer rows than it)",
                rows=len(role_domain_rows),
                expected=getattr(dref, "count", None),
            )
            returned_ids = {str(d["id"]) for d in role_domain_rows if d.get("id")}
            excluded_domain_ids.update(
                str(domain_id) for domain_id in domain_ids if str(domain_id) not in returned_ids
            )
        excluded_domain_keys.update(
            str(d.get("domain_key"))
            for d in role_domain_rows
            if d.get("excluded") and d.get("domain_key")
        )
        dmap = {d["id"]: d for d in role_domain_rows if not d.get("excluded")}
    grouped: dict[str, dict] = {}
    for r in role_rows:
        name = r.get("role_name")
        if name is None:
            continue
        # Hide the content: a role reached only through an excluded domain
        # is not emitted at all. It used to survive as
        # `{name, tier, domains: []}` -- named, unroutable, and sourced
        # entirely from the domain that was meant to be hidden.
        if str(r.get("domain_id")) in excluded_domain_ids:
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
        # The fifth door onto a domain name. `career_role_families` and
        # `career_role_family_domains` carry `domain_key` strings of their
        # own, so nothing checked upstream applies to them: an excluded
        # domain was named here as `primaryDomainKey` and inside
        # `domains[].domainKey` with no filter at all. Same policy as
        # everywhere else -- hide the content: a family whose PRIMARY
        # domain is excluded is dropped, and an excluded link is dropped
        # from `domains`.
        referenced_keys = {
            key
            for family in deduped_families.values()
            for key in [family.get("primary_domain_key")]
            if key
        } | {
            link.get("domainKey")
            for links in links_by_family.values()
            for link in links
            if link.get("domainKey")
        }
        if referenced_keys:
            family_domain_response = svc.table("domains").select(
                "domain_key, excluded", count="exact"
            ).in_("domain_key", list(referenced_keys)).execute()
            family_domain_rows = family_domain_response.data or []
            excluded_domain_keys.update(
                str(row.get("domain_key"))
                for row in family_domain_rows
                if row.get("excluded") and row.get("domain_key")
            )
            # Same guard as the role domain lookup above, for the same reason.
            if _read_may_be_truncated(family_domain_response, family_domain_rows):
                log.warning(
                    "career search family domain lookup is not verifiably "
                    "complete (no usable exact count, or fewer rows than it)",
                    rows=len(family_domain_rows),
                    expected=getattr(family_domain_response, "count", None),
                )
                returned_keys = {
                    str(row.get("domain_key"))
                    for row in family_domain_rows
                    if row.get("domain_key")
                }
                excluded_domain_keys.update(
                    str(key) for key in referenced_keys if str(key) not in returned_keys
                )
        role_families = [
            {
                "key": family.get("family_key"),
                "name": family.get("canonical_name"),
                "primaryDomainKey": family.get("primary_domain_key"),
                "aliases": family.get("aliases") or [],
                "domains": [
                    link
                    for link in links_by_family.get(family.get("id"), [])
                    if str(link.get("domainKey")) not in excluded_domain_keys
                ],
                "sourceConfidence": family.get("source_confidence"),
                "dataState": family.get("data_state"),
                "sourceProvenance": family.get("source_provenance") or {},
                "nigerianContext": family.get("nigerian_context") or {},
            }
            for family in deduped_families.values()
            if str(family.get("primary_domain_key")) not in excluded_domain_keys
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

    # Why five of the six `ok` flags below are discarded, on purpose.
    #
    # `_safe_query`'s docstring frames `ok` as load-bearing, and for its one
    # SECURITY consumer -- the domain-context read, whose result decides
    # whether a hidden domain's labels may be published -- it is. For these
    # groups `ok` would only feed a per-group client notice, and the response
    # contract has no field for one: `skillsNotice` is singular and
    # skills-specific, and the mapper (`src/lib/searchResults.ts`) carries
    # exactly one `notice` per group with no backend source for the other
    # nine. Adding `groupNotices` means a change to the envelope, the TS types,
    # the mapper, the overlay and their tests, which is a larger change than
    # the defect justifies in this pass.
    #
    # So the silent-empty ambiguity DOES still exist for these five groups, and
    # that is a known gap rather than a solved problem. What it is not is
    # invisible: `_safe_query` already logs every failure at warning (or error
    # for a missing relation) with the group name, so the operator-facing half
    # is covered; only the user-facing half is missing. Recommended follow-up.
    subgroup_rows, _subgroups_ok = _safe_query(
        "subgroups",
        lambda: svc.table("domain_subgroups")
        .select("id, domain_id, label, description")
        .ilike("label", like)
        .order("label")
        .limit(_PUBLIC_SEARCH_LIMIT),
    )
    tool_rows, _tools_ok = _safe_query(
        "tools",
        lambda: svc.table("domain_tools")
        .select("id, domain_id, tool_name, tool_group")
        .ilike("tool_name", like)
        .order("tool_name")
        .limit(_PUBLIC_SEARCH_LIMIT),
    )
    certification_rows, _certifications_ok = _safe_query(
        "certifications",
        lambda: svc.table("domain_certifications")
        .select("id, domain_id, name, level, region")
        .ilike("name", like)
        .order("name")
        .limit(_PUBLIC_SEARCH_LIMIT),
    )
    university_rows, _universities_ok = _safe_query(
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
            university_rows, _alias_ok = _safe_query(
                "university alias",
                lambda: svc.table("schools")
                .select("id, name, institution_type")
                .eq("institution_type", "university")
                .ilike("name", f"%{alias_target}%")
                .order("name")
                .limit(_PUBLIC_SEARCH_LIMIT),
            )
    opportunity_rows, _opportunities_ok = _safe_query(
        "opportunities",
        lambda: svc.table("opportunities")
        .select("id, title, opp_type, scope, region")
        .eq("active", True)
        .ilike("title", like)
        .order("title")
        .limit(_PUBLIC_SEARCH_LIMIT),
    )

    return {
        "domains": domains,
        "roles": roles,
        "role_families": role_families,
        "programmes": programmes,
        "subgroup_rows": subgroup_rows,
        "tool_rows": tool_rows,
        "certification_rows": certification_rows,
        "university_rows": university_rows,
        "opportunity_rows": opportunity_rows,
        "dmap": dmap,
        "excluded_domain_ids": excluded_domain_ids,
        "excluded_domain_keys": excluded_domain_keys,
    }


def _search_domain_context_blocking(svc, context_ids: list) -> tuple[list[dict], bool]:
    """Resolve the domain context for the secondary /search groups.

    Synchronous and blocking for the same reason as
    `_search_catalogue_blocking`; the route runs it in a thread. Returns
    ``(rows, ok)`` -- see `_safe_query` for why `ok` is not optional here.

    `count="exact"` and `count_checked=True` are load-bearing, not telemetry.
    This read has no `.limit()` and its ceiling is 4 groups x
    `_PUBLIC_SEARCH_LIMIT` = 80 ids, so a project-level PostgREST `db-max-rows`
    below that truncates it with a 200 and a partial `Content-Range`. On the
    old two-mode switch that read as "succeeded, and said nothing about this
    domain": the hidden domain's key was in neither `excluded_domain_ids` nor
    `resolved_domain_ids`, `domain_is_publishable` returned True, and all three
    hidden labels published with `domainId: null` -- byte-identical to the leak
    the switch exists to prevent, with no error anywhere. `ok=False` on a
    truncated read is what makes the fail-closed branch cover it.
    """
    return _safe_query(
        "domain context",
        lambda: svc.table("domains")
        .select("id, domain_key, name, excluded", count="exact")
        .in_("id", list(context_ids)),
        count_checked=True,
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

    Nothing that touches the database runs on the event loop. The blocking
    round-trips live in `_search_catalogue_blocking` and
    `_search_domain_context_blocking`, the skill layer in
    `_search_skill_layers`; each is dispatched to a thread on one of this
    loop's own bounded capacity limiters.
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
        # `_search_terms` splits on ` at|in|for|near `, so a query that clears
        # the public two-character floor can still reach the skill layer with a
        # one-character subject (`?q=e in zz`). That is refused -- and SAID, so
        # an empty `skills` group is not silently indistinguishable from a
        # genuine no-match.
        skills_notice = (
            None
            if len(subject_term.strip()) >= _MIN_SKILL_QUERY_LEN
            else "Skill matching needs at least two characters, so the skills group was skipped."
        )

        query_limiter = _search_query_limiter()
        catalogue = await anyio.to_thread.run_sync(
            functools.partial(
                _search_catalogue_blocking,
                svc,
                like=like,
                institution_like=institution_like,
                institution_term=institution_term,
                user_type=user_type,
                school_id=school_id,
            ),
            limiter=query_limiter,
        )
        domains = catalogue["domains"]
        roles = catalogue["roles"]
        role_families = catalogue["role_families"]
        programmes = catalogue["programmes"]
        subgroup_rows = catalogue["subgroup_rows"]
        tool_rows = catalogue["tool_rows"]
        certification_rows = catalogue["certification_rows"]
        university_rows = catalogue["university_rows"]
        opportunity_rows = catalogue["opportunity_rows"]
        dmap: dict = catalogue["dmap"]
        excluded_domain_ids: set = catalogue["excluded_domain_ids"]
        excluded_domain_keys: set = catalogue["excluded_domain_keys"]

        # Skills: the pre-sweep domain_bridge_skills / role_bridge_skills /
        # adjacent_prerequisites tables were dropped by migration_career_v2.
        # The v2 taxonomy carries the same skills as JSONB on domains,
        # domain_subgroups and domain_roles, so all three groups are answered
        # from the flattened index over those layers.
        try:
            skill_rows, skill_index_partial = await _search_skill_layers(
                svc, subject_term, _PUBLIC_SEARCH_LIMIT
            )
        except Exception as skill_exc:  # noqa: BLE001
            log.warning(
                "career skill layer search unavailable",
                error_code=_error_summary(skill_exc)[0],
                error_type=type(skill_exc).__name__,
            )
            log.debug("career skill layer failure detail", error=str(skill_exc))
            skill_rows = []
            # The notice exists precisely so an empty `skills` group is never
            # indistinguishable from a genuine no-match -- and this is the path
            # that produces an empty group in production. Leaving it None here
            # made the error case byte-identical to a real no-match, i.e. the
            # exact ambiguity the field was added to remove.
            skills_notice = skills_notice or (
                "Skill matching failed for this query, so the skills group is "
                "missing rather than empty. Try again shortly."
            )
        else:
            if skill_index_partial:
                skills_notice = skills_notice or (
                    "The skill index is incomplete right now, so the skills "
                    "group may be missing matches."
                )

        # Resolve the domain context for secondary search groups. The context
        # is what makes a result such as ``risk analysis`` actionable rather
        # than just another unlabelled keyword hit.
        context_ids = {
            row.get("domain_id")
            for row in [*subgroup_rows, *tool_rows, *certification_rows,
                        *skill_rows]
            if row.get("domain_id")
        }
        # True when the excluded set is unknown, for EITHER reason: the context
        # read failed, or it succeeded and came back TRUNCATED.
        context_unknown = False
        if context_ids:
            context_rows, context_ok = await anyio.to_thread.run_sync(
                _search_domain_context_blocking, svc, list(context_ids),
                limiter=query_limiter,
            )
            context_unknown = not context_ok
            # Same policy as the rest of the response (see the note above the
            # `domains` group): an excluded domain's rows are DROPPED below,
            # not emitted with the domain nulled.
            excluded_domain_ids.update(
                str(row.get("id")) for row in context_rows if row.get("excluded") and row.get("id")
            )
            excluded_domain_keys.update(
                str(row.get("domain_key"))
                for row in context_rows
                if row.get("excluded") and row.get("domain_key")
            )
            dmap.update({
                row.get("id"): row
                for row in context_rows
                if row.get("id") and not row.get("excluded")
            })

        resolved_domain_ids = {str(key) for key in dmap}

        def domain_is_publishable(domain_id: Any) -> bool:
            """May a row belonging to `domain_id` be named in the response?

            Two DIFFERENT failure modes, deliberately answered differently:

              * the domain was never read -- no error, the row just points
                somewhere this response did not look. It is emitted with a null
                domain, exactly as before; "unresolved" is not "excluded".
              * the domain context read ERRORED. Then the excluded set is not
                merely empty, it is UNKNOWN, and the old code treated the two as
                the same thing: `_safe_query` swallowed the failure into `[]`,
                so every filter passed and an excluded domain's sub-groups,
                tools and certifications were published with the domain nulled
                -- "Sportsbet odds desks", "Sportsbet Trading Terminal",
                "Sportsbet Certified Bookmaker". That is the label leak the
                switch exists to prevent, reachable by a statement timeout, a
                42501 denial, a PostgREST 5xx or a flaky network. Fail CLOSED:
                while the set is unknown, only a domain some OTHER read already
                resolved may be published.
            """
            if domain_id is None:
                return True
            key = str(domain_id)
            if key in excluded_domain_ids:
                return False
            return not (context_unknown and key not in resolved_domain_ids)

        subgroups = [
            {
                "id": row.get("id"),
                "name": row.get("label"),
                "domainId": (dmap.get(row.get("domain_id")) or {}).get("domain_key"),
                "domainName": (dmap.get(row.get("domain_id")) or {}).get("name"),
            }
            for row in subgroup_rows
            if row.get("id") and row.get("label")
            and domain_is_publishable(row.get("domain_id"))
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
            and domain_is_publishable(row.get("domain_id"))
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
            and domain_is_publishable(row.get("domain_id"))
        ]

        skill_source_rows = skill_rows
        seen_skills: set[tuple[str, str]] = set()
        skills = []
        for row in skill_source_rows:
            name = row.get("skill_name")
            domain = dmap.get(row.get("domain_id")) or {}
            # Falling back to the raw domain_id matters when `dmap` has no row
            # for the domain (an excluded or unreadable one): keying on
            # `domain_key or ""` collapsed two genuinely different rows into one
            # and silently dropped the second.
            key = (
                str(name or "").strip().lower(),
                str(domain.get("domain_key") or row.get("domain_id") or ""),
            )
            if not name or key in seen_skills:
                continue
            # Defence in depth, and it is NOT redundant with the build-time
            # `allowed` filter in `_build_skill_index`: that one protects rows
            # that came from the index, this one protects the response from any
            # row that reaches here by another door (a cached index built before
            # a domain was excluded, or a future caller that assembles skill
            # rows itself).
            if not domain_is_publishable(row.get("domain_id")):
                continue
            seen_skills.add(key)
            skills.append({
                "id": row.get("id"),
                "name": name,
                "domainId": domain.get("domain_key"),
                "domainName": domain.get("name"),
                "context": row.get("category"),
                # How many further domains carry this same skill name and were
                # withheld by _MAX_DOMAINS_PER_SKILL, so the client can say
                # "and N other fields" instead of implying these are all.
                "otherDomainCount": row.get("other_domain_count") or 0,
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
            # Non-null when the skill layer was skipped, failed, or answered
            # from a known-incomplete index, so an empty `skills` group is
            # never silently indistinguishable from a real no-match.
            "skillsNotice": skills_notice,
        }))
    except Exception as exc:  # noqa: BLE001
        log.error(
            "career search failed",
            error_code=_error_summary(exc)[0],
            error_type=type(exc).__name__,
        )
        log.debug("career search failure detail", error=str(exc))
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
        _log_db_failure("career pivot failed", exc)
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
        _log_db_failure("career pivot_gap failed", exc)
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
        _log_db_failure("career save_prior_field failed", exc)
        return ResponseModel(success=False, message="Could not save your prior field.", data=None)


# A JAMB name maps to a handful of domains. `jamb_programme_domain` holds 3,163
# rows in dev and BOTH reads below were unbounded, so a match-everything pattern
# returned 1,000 of them -- the project's `db-max-rows`, confirmed live -- per
# request. Every read on this path is bounded now, so the response size tracks
# the question rather than the table.
#
# The mapping ceiling is the SERVER's own `db-max-rows`, not a smaller number.
# It was 200 for one round, and 200 rows of an UNORDERED read is an arbitrary
# slice of the match set -- neither read below had an `.order()`, so which 200
# arrived was whatever the planner produced. MEASURED on dev, distinct domains
# reachable from all matching rows vs from the first 200:
#
#     science 94 -> 57 | a 111 -> 49 | management 62 -> 35 | studies 67 -> 37
#
# i.e. it silently dropped up to 60% of the mappings on the path whose own
# docstring says "partial student input still resolves". Two changes: the reads
# are `.order()`ed so the window is deterministic, and the ceiling is raised to
# the 1,000-row server cap. The bound that keeps the RESPONSE small is
# `_JAMB_DOMAIN_LIMIT`, applied after ranking.
#
# THIS CEILING IS THE SERVER CAP ITSELF, SO IT CANNOT BOUND ANYTHING. An earlier
# revision of this comment claimed the cap is one "which every real term
# measured is far under"; the data contradicts that. MEASURED on dev, an
# unbounded read of `jamb_programme_domain` answers `206 Partial Content` with
# `Content-Range: 0-999/3163`, i.e. `db-max-rows` is exactly 1000 -- so
# `.limit(1000)` is indistinguishable from an unbounded read and 19 terms
# reachable through `/api/career/jamb/{name}/domains` (a route with no
# minimum-length floor, see `get_jamb_domains`) exceed it TODAY:
#
#     'a'  2638 rows -> 48 of >=107 domains | 'e'  2826 -> 44 of >=95
#     'en' 1476 rows -> 82 of >=123 domains | 'st' 1038 -> 104 of >=108
#
# Because the reads are `.order("domain_id")`ed, the window is the 1,000 lowest
# domain-id UUIDs, so a `direct` mapping whose domain sorts high is dropped
# DETERMINISTICALLY. This is NOT a regression -- `main` received exactly 1,000
# rows too, unordered -- and it is a COMPLETENESS problem, not a disclosure one:
# the `excluded` filter still runs on whatever arrives, so nothing hidden can
# be published by a short read. So the treatment here is the one the shape
# warrants and no more: `count="exact"` + `_read_may_be_truncated`, which turns
# a silent short read into a WARNING naming the term-independent numbers.
# Deliberately NOT a client notice: `_JAMB_DOMAIN_LIMIT` already truncates the
# published list without one, and adding a second, differently-worded partial
# marker on an unauthenticated route is an envelope change with no security
# content. Raising the ceiling is not an option either -- 1000 IS the ceiling;
# the real fix is a server-side aggregate, which is a product change.
_JAMB_MAPPING_ROW_LIMIT = 1000
_JAMB_DOMAIN_LIMIT = 50

# Strongest match first, for display.
_JAMB_MATCH_RANK = {"direct": 3, "functional": 2, "adjacent": 1}


def _warn_if_mapping_read_is_short(probe: str, response, rows: list) -> None:
    """Say so when a mapping read did not see everything it matched.

    `_read_may_be_truncated` is the same discriminator the role-domain,
    family-domain and domain-context reads use; it was simply never applied
    here, which left `_JAMB_MAPPING_ROW_LIMIT`'s no-op ceiling (see the comment
    on the constant) SILENT. No exact count is treated as a truncation, for the
    reason spelled out in that helper: "I cannot tell" is not "I saw it all".

    Warning only -- the response is unchanged. See `_JAMB_MAPPING_ROW_LIMIT`.
    """
    if not _read_may_be_truncated(response, rows):
        return
    log.warning(
        "jamb domain mapping read is not verifiably complete "
        "(no usable exact count, or fewer rows than it); the domain list "
        "for this term may be missing mappings",
        probe=probe,
        rows=len(rows),
        expected=getattr(response, "count", None),
        ceiling=_JAMB_MAPPING_ROW_LIMIT,
    )


def _jamb_domains_blocking(svc, term: str) -> list[dict]:
    """Resolve a cleaned JAMB name to its mapped, non-excluded domains.

    BLOCKING: every line here is a PostgREST round trip, and this used to run
    DIRECTLY ON THE EVENT LOOP -- `get_jamb_domains` was an `async def` that was
    never off-loaded the way `_search_catalogue_blocking` was. MEASURED, n=10
    concurrent, before this split:

        /api/career/jamb/zzzzqqqq/domains -> wall  9.89 s, max loop stall 9.867 s
        /api/career/jamb/**/domains       -> wall 14.02 s, max loop stall 14.000 s
        /api/career/search (already off-loaded, same n) -> 9.21 s / 0.308 s

    i.e. stall time was 100% of wall clock on an unauthenticated GET, which is
    the whole-box outage the `/search` off-loading was done to stop. Removing
    `*` from the cleaner did not remove the cheapest amplifier, it moved it here.
    This now runs in a thread on `/search`'s own bounded limiter.
    """
    # Exact (case-insensitive) first; fall back to an ilike contains so partial
    # student input still resolves.
    exact = (
        svc.table("jamb_programme_domain")
        .select("domain_id, match_type", count="exact")
        .ilike("jamb_name", term)
        .order("domain_id")
        .limit(_JAMB_MAPPING_ROW_LIMIT)
        .execute()
    )
    rows = exact.data or []
    _warn_if_mapping_read_is_short("exact", exact, rows)
    if not rows:
        contains = (
            svc.table("jamb_programme_domain")
            .select("domain_id, match_type", count="exact")
            .ilike("jamb_name", f"%{term}%")
            .order("domain_id")
            .limit(_JAMB_MAPPING_ROW_LIMIT)
            .execute()
        )
        rows = contains.data or []
        _warn_if_mapping_read_is_short("contains", contains, rows)
    if not rows:
        return []

    # Dedup by domain, keeping the strongest match_type.
    #
    # FAIL-CLOSED on `match_type`. A missing or unknown mapping type is not
    # evidence of an adjacent relationship. Keep the public route fail-closed.
    #
    # This guard was deleted by the first commit on this branch, which wrote
    # `mt = r.get("match_type") or "adjacent"` -- no validation, no
    # normalisation. PROVED through the real route: a NULL `match_type` was
    # published as a genuine `matchType: "adjacent"` relationship; a
    # non-canonical `"Direct"` went to the client verbatim, breaking its enum;
    # and because `"Direct"` then ranked 0, a domain holding BOTH `"Direct"`
    # and `"adjacent"` was DOWNGRADED to `adjacent`. Dev has 0 NULL and only
    # canonical lowercase values today -- the same "latent, not live" argument
    # the `excluded` filter below is justified by.
    best: dict[str, str] = {}
    for r in rows:
        did = r["domain_id"]
        mt = str(r.get("match_type") or "").strip().lower()
        if mt not in _JAMB_MATCH_RANK:
            continue
        if did not in best or _JAMB_MATCH_RANK[mt] > _JAMB_MATCH_RANK[best[did]]:
            best[did] = mt
    if not best:
        # AN ENVELOPE CHANGE VERSUS `main`, stated rather than glossed. `main`
        # fell through to `.in_("id", [])`, i.e. a real round trip to
        # `domains?id=in.()`, and answered `domains: []` with NO notice. The
        # early return routes this case into `get_jamb_domains`'s `if not
        # domains:` branch, which attaches "No domains mapped to this JAMB name
        # yet." -- the same notice a genuine miss and the all-excluded case get.
        # A client that branched on "empty list, no notice" sees a notice now.
        # That is the improvement (the three empty states are labelled the same
        # way), and it is a real contract change worth naming in the PR body.
        #
        # The round trip it saves is the other half: removing this return is
        # behaviour-preserving apart from the notice and SURVIVES the suite,
        # while costing one extra PostgREST request per call on an
        # unauthenticated route whose stated justification is cutting round
        # trips. `test_the_all_invalid_path_makes_no_join_round_trip` pins it.
        return []

    # RANK FIRST, THEN TRUNCATE. `list(best.keys())[:50]` took the first fifty
    # FIRST-SEEN ids and left the rank sort to run afterwards, so 60 `adjacent`
    # mappings followed by one `direct` mapping returned fifty domains with the
    # `direct` match ABSENT -- the exact opposite of what `_JAMB_MATCH_RANK`
    # ("strongest match first, for display") exists to produce. Python's sort
    # is stable, so equal ranks keep their first-seen order.
    ids = sorted(best, key=lambda did: -_JAMB_MATCH_RANK[best[did]])[:_JAMB_DOMAIN_LIMIT]

    # `excluded` HIDES THE CONTENT of a domain (see `_search_domain_context_
    # blocking` for the policy in one place). This read selected `name` and
    # `cluster` with NO `excluded` filter, so an excluded domain still reachable
    # through `jamb_programme_domain` would have been published BY NAME here --
    # the one door left into the data the rest of this branch closed. Dev has 0
    # excluded rows today, which is exactly why it survived every earlier round.
    dref = (
        svc.table("domains")
        .select("id, domain_key, name, cluster, elite_domain, excluded")
        .in_("id", ids)
        .limit(_JAMB_DOMAIN_LIMIT)
        .execute()
    )
    dmap = {d["id"]: d for d in (dref.data or []) if not d.get("excluded")}
    domains = []
    for did in ids:
        d = dmap.get(did)
        if not d:
            continue
        domains.append(
            {
                "domainId": d.get("domain_key") or did,
                "domainName": d.get("name"),
                "cluster": d.get("cluster"),
                "matchType": best[did],
                "eliteFlag": bool(d.get("elite_domain")),
            }
        )
    # No trailing `domains.sort(...)`: `ids` is already in rank order and this
    # loop preserves it. A second sort here would be a no-op that no mutation
    # could ever kill, which is worse than no sort at all -- the ordering is
    # pinned at the one place that also decides which domains survive
    # `_JAMB_DOMAIN_LIMIT`.
    return domains


@router.get("/jamb/{jamb_name:path}/domains", response_model=ResponseModel)
async def get_jamb_domains(jamb_name: str):
    """JAMB name → domains (the student's entry point).

    Reads `jamb_programme_domain` (seeded from the union-of-components mapping)
    and joins `domains` for names/cluster/elite. Returns a JambDomainResult
    shape. Case-insensitive exact match on jamb_name, then a broad ilike
    fallback so partial student input still resolves.
    """
    # Deliberately NOT rebound onto `jamb_name`. The cleaned value is a PATTERN
    # INPUT; `jambName` in the response is the display string for what the
    # student typed, and rebinding made every cleaned-to-empty segment answer
    # `jambName: ""`.
    term = _clean_public_query(jamb_name)
    if not term:
        # `*`, `%`, `_`, `\` and whitespace all clean to "". The empty term then
        # missed the exact-match probe and fell into the `%{term}%` fallback --
        # `ilike.%%`, match-everything -- on a route with no minimum-length
        # floor. MEASURED through the handler before this guard: segments `**`,
        # `%`, `_`, `\` and `%20%20` each returned 61 domains / 8,285 bytes,
        # against 0 domains / 157 bytes for a genuine miss. Answering the
        # no-mapping notice is what an unmatchable term actually means.
        return ResponseModel(
            data=_real(
                {"jambName": jamb_name, "domains": []},
                notice="No domains mapped to this JAMB name yet.",
            )
        )
    try:
        domains = await anyio.to_thread.run_sync(
            functools.partial(_jamb_domains_blocking, _svc(), term),
            limiter=_search_query_limiter(),
        )
    except Exception as exc:  # noqa: BLE001
        _log_db_failure("career jamb_domains failed", exc)
        return ResponseModel(data=_coming_soon("JAMB domain lookup is temporarily unavailable."))
    if not domains:
        return ResponseModel(
            data=_real(
                {"jambName": jamb_name, "domains": []},
                notice="No domains mapped to this JAMB name yet.",
            )
        )
    return ResponseModel(data=_real({"jambName": jamb_name, "domains": domains}))


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
        _log_db_failure("career list_saved failed", exc)
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
        _log_db_failure("career create_saved failed", exc)
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
        _log_db_failure("career delete_saved failed", exc)
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
        _log_db_failure("career list_notes failed", exc)
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
        _log_db_failure("career upsert_note failed", exc)
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
        _log_db_failure("career delete_note failed", exc)
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
        _log_db_failure("career list_subscriptions failed", exc)
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
        _log_db_failure("career create_subscription failed", exc)
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
        _log_db_failure("career delete_subscription failed", exc)
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
        _log_db_failure("career list_feedback failed", exc)
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
        _log_db_failure("career create_mapping_feedback failed", exc)
        return ResponseModel(success=False, message="Could not record feedback.", data=None)

from __future__ import annotations

from typing import Any, Optional

from fastapi import APIRouter, Query

from database import db
from logger import log
from models import ResponseModel

router = APIRouter(prefix="/api/entrepreneurship", tags=["entrepreneurship"])
_SCHEMA = "skillup_dev"


def _svc():
    return db.get_service_client().schema(_SCHEMA)


def _real(data: Any, notice: Optional[str] = None) -> dict:
    return {
        "status": "real",
        "data": data,
        "meta": {"notice": notice, "verification": "verified"} if notice else {"verification": "verified"},
    }


def _coming_soon(notice: str) -> dict:
    return {
        "status": "coming_soon",
        "data": None,
        "meta": {"notice": notice, "verification": "pending"},
    }


def _evidence(row: dict) -> dict:
    status = row.get("evidence_status") or "not_yet_evidenced"
    return {
        "status": status,
        "sources": row.get("sources") or [],
        "lastReviewed": row.get("last_reviewed"),
        "note": row.get("evidence_note"),
    }


@router.get("/opportunity-map", response_model=ResponseModel)
async def opportunity_map(
    entry_mode: str = Query("domain"),
    domain_id: Optional[str] = Query(None),
    programme_name: Optional[str] = Query(None),
):
    try:
        svc = _svc()
        domains_res = svc.table("entrepreneurship_domain_coverage").select("*").limit(168).execute()
        roles_res = svc.table("entrepreneurship_roles").select("*").eq("approved", True).limit(200).execute()
        domains = domains_res.data or []
        roles = roles_res.data or []
        if not domains and not roles:
            return ResponseModel(data=_coming_soon("Entrepreneurship evidence-backed content has not been imported yet."))
        return ResponseModel(data=_real({
            "context": {
                "entryMode": entry_mode,
                "domainId": domain_id,
                "domainName": None,
                "programmeName": programme_name,
            },
            "domains": [
                {
                    "id": row.get("domain_id"),
                    "name": row.get("domain_name"),
                    "rank": row.get("rank"),
                    "evidence": _evidence(row),
                }
                for row in domains
            ],
            "roles": [
                {
                    "id": row.get("id"),
                    "title": row.get("title"),
                    "roleType": row.get("role_type"),
                    "summary": row.get("summary") or "",
                    "domainIds": row.get("domain_ids") or [],
                    "ventureModes": row.get("venture_modes") or [],
                    "lenses": row.get("opportunity_lenses") or [],
                    "entryModes": row.get("entry_modes") or [],
                    "capabilityLayers": row.get("capability_layers") or [],
                    "partnerRequirements": row.get("partner_requirements") or [],
                    "regulationNotes": row.get("regulation_notes") or [],
                    "nigeriaContext": row.get("nigeria_context") or "Not yet evidenced.",
                    "globalContext": row.get("global_context") or "Not yet evidenced.",
                    "evidence": _evidence(row),
                    "marketSignals": [],
                }
                for row in roles
            ],
            "entitlements": {
                "canSave": False,
                "canCompare": False,
                "canExport": False,
                "canViewFullMap": False,
            },
        }))
    except Exception as exc:  # noqa: BLE001
        log.error("entrepreneurship opportunity_map failed", error=str(exc))
        return ResponseModel(data=_coming_soon("Opportunity Map is temporarily unavailable."))


@router.get("/institutions/{institution_id}/aggregate", response_model=ResponseModel)
async def institution_aggregate(institution_id: str):
    try:
        rows = (
            _svc()
            .table("entrepreneurship_institution_engagement")
            .select("domain_id, domain_name, role_type, engagement_count")
            .eq("institution_id", institution_id)
            .limit(200)
            .execute()
        ).data or []
        return ResponseModel(data=_real({"rows": rows}))
    except Exception as exc:  # noqa: BLE001
        log.error("entrepreneurship institution aggregate failed", error=str(exc))
        return ResponseModel(data=_coming_soon("Institution aggregate entrepreneurship data is unavailable."))

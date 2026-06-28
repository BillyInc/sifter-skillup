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
from typing import Optional

from fastapi import APIRouter, Body, Depends

from auth import Auth
from logger import log
from models import ResponseModel

router = APIRouter(prefix="/api/career", tags=["career"])


def _coming_soon(notice: Optional[str] = None) -> dict:
    """Return a `coming_soon` DataState envelope mirroring career.ts comingSoon()."""
    return {
        "status": "coming_soon",
        "data": None,
        "meta": ({"notice": notice} if notice else None),
    }


# ── Public READ endpoints ─────────────────────────────────────

@router.get("/programmes", response_model=ResponseModel)
async def list_programmes(
    q: Optional[str] = None,
    institution_type: Optional[str] = None,
):
    """Search programmes. Returns a coming_soon list envelope (no data yet)."""
    # TODO(career-data): implement against skillup_dev once data is imported
    return ResponseModel(data=_coming_soon("Programme search is coming soon."))


@router.get("/programmes/{programme_id}", response_model=ResponseModel)
async def get_programme(programme_id: str):
    """Programme detail (with domain links). Returns coming_soon envelope."""
    # TODO(career-data): implement against skillup_dev once data is imported
    return ResponseModel(data=_coming_soon("Programme detail is coming soon."))


@router.get("/domains/{domain_id}", response_model=ResponseModel)
async def get_domain(domain_id: str):
    """Domain detail (bridge skills + roles). Returns coming_soon envelope."""
    # TODO(career-data): implement against skillup_dev once data is imported
    return ResponseModel(data=_coming_soon("Domain detail is coming soon."))


@router.get("/roles/{role_id}", response_model=ResponseModel)
async def get_role(role_id: str):
    """Role detail (role-level bridge skills, ladder). Returns coming_soon envelope."""
    # TODO(career-data): implement against skillup_dev once data is imported
    return ResponseModel(data=_coming_soon("Role detail is coming soon."))


@router.get("/opportunities", response_model=ResponseModel)
async def list_opportunities(
    programme_id: Optional[str] = None,
    domain_id: Optional[str] = None,
    institution_type: Optional[str] = None,
):
    """Filter opportunities. Returns a coming_soon list envelope (no data yet)."""
    # TODO(career-data): implement against skillup_dev once data is imported
    return ResponseModel(data=_coming_soon("Opportunities are coming soon."))


# ── User-owned endpoints (auth required, no writes performed) ──

@router.get("/saved", response_model=ResponseModel)
async def list_saved(
    current_user: dict = Depends(Auth.get_current_user),
):
    """List the user's saved items. Returns coming_soon envelope."""
    # TODO(career-data): implement against skillup_dev once data is imported
    return ResponseModel(data=_coming_soon("Saved items are coming soon."))


@router.post("/saved", response_model=ResponseModel)
async def create_saved(
    body: dict = Body(default_factory=dict),
    current_user: dict = Depends(Auth.get_current_user),
):
    """Save an item. No write performed yet — returns coming_soon envelope."""
    # TODO(career-data): implement against skillup_dev once data is imported
    log.info("Career saved create (stub)", user_id=current_user["id"])
    return ResponseModel(data=_coming_soon("Saving items is coming soon."))


@router.delete("/saved/{saved_item_id}", response_model=ResponseModel)
async def delete_saved(
    saved_item_id: str,
    current_user: dict = Depends(Auth.get_current_user),
):
    """Remove a saved item. No write performed yet — returns coming_soon envelope."""
    # TODO(career-data): implement against skillup_dev once data is imported
    log.info("Career saved delete (stub)", user_id=current_user["id"], saved_item_id=saved_item_id)
    return ResponseModel(data=_coming_soon("Removing saved items is coming soon."))


@router.get("/notes", response_model=ResponseModel)
async def list_notes(
    entity_type: Optional[str] = None,
    entity_id: Optional[str] = None,
    current_user: dict = Depends(Auth.get_current_user),
):
    """List the user's notes. Returns coming_soon envelope."""
    # TODO(career-data): implement against skillup_dev once data is imported
    return ResponseModel(data=_coming_soon("Notes are coming soon."))


@router.post("/notes", response_model=ResponseModel)
async def create_note(
    body: dict = Body(default_factory=dict),
    current_user: dict = Depends(Auth.get_current_user),
):
    """Create a note. No write performed yet — returns coming_soon envelope."""
    # TODO(career-data): implement against skillup_dev once data is imported
    log.info("Career note create (stub)", user_id=current_user["id"])
    return ResponseModel(data=_coming_soon("Notes are coming soon."))


@router.get("/subscriptions", response_model=ResponseModel)
async def list_subscriptions(
    current_user: dict = Depends(Auth.get_current_user),
):
    """List the user's subscriptions. Returns coming_soon envelope."""
    # TODO(career-data): implement against skillup_dev once data is imported
    return ResponseModel(data=_coming_soon("Subscriptions are coming soon."))


@router.post("/subscriptions", response_model=ResponseModel)
async def create_subscription(
    body: dict = Body(default_factory=dict),
    current_user: dict = Depends(Auth.get_current_user),
):
    """Create a subscription. No write performed yet — returns coming_soon envelope."""
    # TODO(career-data): implement against skillup_dev once data is imported
    log.info("Career subscription create (stub)", user_id=current_user["id"])
    return ResponseModel(data=_coming_soon("Subscriptions are coming soon."))


@router.delete("/subscriptions/{subscription_id}", response_model=ResponseModel)
async def delete_subscription(
    subscription_id: str,
    current_user: dict = Depends(Auth.get_current_user),
):
    """Remove a subscription. No write performed yet — returns coming_soon envelope."""
    # TODO(career-data): implement against skillup_dev once data is imported
    log.info("Career subscription delete (stub)", user_id=current_user["id"], subscription_id=subscription_id)
    return ResponseModel(data=_coming_soon("Removing subscriptions is coming soon."))

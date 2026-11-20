# ============================================================
# Sifter LevelUp — My World collections (slice 1)
#
# Named collections of the student's saved items.
#
#   GET    /api/career/collections                    list own collections
#   GET    /api/career/collections/starters           suggested names (not created)
#   POST   /api/career/collections                    create {name, starterKey?}
#   PATCH  /api/career/collections/{id}               rename {name}
#   DELETE /api/career/collections/{id}               delete the collection only
#   GET    /api/career/collections/{id}/items         members, saved object resolved
#   POST   /api/career/collections/{id}/items         add {savedItemIds: [...]}
#   DELETE /api/career/collections/{id}/items/{sid}   remove from this collection
#   PATCH  /api/career/collections/{id}/items/{sid}   set or clear a private note {note}
#   PATCH  /api/career/collections/{id}/order         reorder {savedItemIds: [...all members]}
#   POST   /api/career/collections/{id}/items/{sid}/move  {toCollectionId}
#
# Invariants
#   * Auth required; every query is filtered by the caller's user id. A
#     collection or saved item owned by someone else is reported as not found.
#   * saved_items is the canonical reference. Deleting a collection or removing
#     an item here only deletes join rows; it never deletes a saved item or any
#     programme / role / task item.
#   * Tables are created by backend/migration_my_world_collections_2026-11-19.sql
#     (PROPOSED, NOT APPLIED). Until it is applied every endpoint returns a
#     `coming_soon` DataState instead of a 500.
#   * Notes are private to the owner. Every endpoint is owner-only and there is
#     no sharing endpoint; if sharing is ever added it must not return `note`.
#   * Ordering and notes use the `position` / `note` columns that the same
#     migration creates, so no further schema change is needed.
# Not in this slice: sharing.
# ============================================================
import re
import unicodedata
from typing import Any, Callable, Optional

from fastapi import APIRouter, Body, Depends, HTTPException

from auth import Auth
from database import db
from logger import log
from models import ResponseModel

router = APIRouter(prefix="/api/career/collections", tags=["collections"])

_SCHEMA = "skillup_dev"
MAX_NAME_LEN = 60
MAX_COLLECTIONS_PER_USER = 50
MAX_ITEMS_PER_COLLECTION = 200
MAX_IDS_PER_REQUEST = 50
MAX_NOTE_LEN = 500

# Suggestions only. Nothing is created until the student picks one (blueprint
# p.9: "suggested starter collections").
STARTER_COLLECTIONS = [
    {"starterKey": "university_options", "name": "My university options",
     "description": "Programmes and schools you are comparing."},
    {"starterKey": "career_ideas", "name": "Career ideas",
     "description": "Roles and domains you want to keep an eye on."},
    {"starterKey": "skills_to_learn", "name": "Skills to learn",
     "description": "Skills, tools and learning resources for later."},
    {"starterKey": "my_projects", "name": "My projects",
     "description": "Project ideas and things you want to build."},
]
_STARTERS_BY_KEY = {s["starterKey"]: s for s in STARTER_COLLECTIONS}

_UNSUPPORTED_MARKERS = (
    "pgrst205", "pgrst200", "42p01", "does not exist", "schema cache",
    "could not find the table", "could not find a relationship",
)
UNSUPPORTED_NOTICE = "Collections are not available yet."


class _Unsupported(Exception):
    """The collections tables are not deployed."""


def _coming_soon(notice: str) -> dict:
    return {"status": "coming_soon", "data": None, "meta": {"notice": notice}}


def _real(data: Any, notice: Optional[str] = None) -> dict:
    return {"status": "real", "data": data, "meta": ({"notice": notice} if notice else None)}


def _svc():
    return db.get_service_client().schema(_SCHEMA)


def _is_missing_table(exc: Exception) -> bool:
    text = f"{type(exc).__name__} {exc} {getattr(exc, 'code', '')}".lower()
    return any(marker in text for marker in _UNSUPPORTED_MARKERS)


def _run(label: str, fn: Callable[[], Any]) -> ResponseModel:
    """Run a handler body: map missing tables to coming_soon, keep HTTP errors."""
    try:
        return ResponseModel(data=fn())
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        if isinstance(exc, _Unsupported) or _is_missing_table(exc):
            return ResponseModel(data=_coming_soon(UNSUPPORTED_NOTICE))
        log.error(f"collections {label} failed", error=str(exc))
        return ResponseModel(
            success=False,
            message="Collections are temporarily unavailable. Try again.",
            data=None,
        )


def clean_name(raw: Any) -> str:
    """Normalise a collection name; raises HTTP 400 with a kind message."""
    if not isinstance(raw, str):
        raise HTTPException(status_code=400, detail="Give the collection a name.")
    name = unicodedata.normalize("NFKC", raw)
    name = re.sub(r"\s+", " ", name).strip()
    if not name:
        raise HTTPException(status_code=400, detail="Give the collection a name.")
    if len(name) > MAX_NAME_LEN:
        raise HTTPException(
            status_code=400,
            detail=f"Collection names can be up to {MAX_NAME_LEN} characters.",
        )
    if any(unicodedata.category(ch).startswith("C") for ch in name):
        raise HTTPException(status_code=400, detail="That name has characters we cannot use.")
    return name


def clean_note(raw: Any) -> Optional[str]:
    """Normalise a private note. None or blank clears it; raises HTTP 400 if invalid."""
    if raw is None:
        return None
    if not isinstance(raw, str):
        raise HTTPException(status_code=400, detail="A note must be text.")
    text = unicodedata.normalize("NFKC", raw).replace("\r\n", "\n").replace("\r", "\n")
    text = "\n".join(line.rstrip() for line in text.split("\n")).strip()
    if not text:
        return None
    if len(text) > MAX_NOTE_LEN:
        raise HTTPException(
            status_code=400,
            detail=f"Notes can be up to {MAX_NOTE_LEN} characters.",
        )
    if any(unicodedata.category(ch).startswith("C") and ch != "\n" for ch in text):
        raise HTTPException(status_code=400, detail="That note has characters we cannot use.")
    return text


def _collection_out(row: dict, item_count: int = 0) -> dict:
    return {
        "id": row["id"],
        "name": row.get("name"),
        "kind": row.get("kind") or "custom",
        "starterKey": row.get("starter_key"),
        "itemCount": item_count,
        "createdAt": row.get("created_at"),
        "updatedAt": row.get("updated_at"),
    }


def _saved_out(row: dict, link: dict) -> dict:
    return {
        "savedItemId": row["id"],
        "entityType": row.get("entity_type"),
        "entityId": row.get("entity_id"),
        "label": row.get("label"),
        "savedAt": row.get("created_at"),
        "sourceContext": row.get("source_context"),
        "position": link.get("position", 0),
        "note": link.get("note"),
        "addedAt": link.get("added_at"),
    }


def _user_collections(svc, user_id: str) -> list[dict]:
    res = (
        svc.table("collections")
        .select("*")
        .eq("user_id", user_id)
        .is_("archived_at", "null")
        .order("sort_index")
        .order("created_at")
        .execute()
    )
    return list(res.data or [])


def _owned_collection(svc, user_id: str, collection_id: str) -> dict:
    """The caller's collection, or 404 (also for someone else's)."""
    res = (
        svc.table("collections")
        .select("*")
        .eq("id", collection_id)
        .eq("user_id", user_id)
        .limit(1)
        .execute()
    )
    rows = res.data or []
    if not rows or rows[0].get("archived_at"):
        raise HTTPException(status_code=404, detail="Collection not found.")
    return rows[0]


def _owned_saved_items(svc, user_id: str, ids: list[str]) -> list[dict]:
    res = (
        svc.table("saved_items")
        .select("*")
        .eq("user_id", user_id)
        .in_("id", ids)
        .execute()
    )
    return list(res.data or [])


def _links(svc, collection_id: str) -> list[dict]:
    res = (
        svc.table("collection_items")
        .select("*")
        .eq("collection_id", collection_id)
        .order("position")
        .execute()
    )
    return list(res.data or [])


def _id_list(body: dict, key: str) -> list[str]:
    raw = body.get(key)
    if not isinstance(raw, list) or not raw:
        raise HTTPException(status_code=400, detail="Choose at least one saved item.")
    ids = []
    for value in raw:
        if not isinstance(value, str) or not value.strip():
            raise HTTPException(status_code=400, detail="Choose valid saved items.")
        if value not in ids:
            ids.append(value)
    if len(ids) > MAX_IDS_PER_REQUEST:
        raise HTTPException(
            status_code=400,
            detail=f"Add up to {MAX_IDS_PER_REQUEST} items at a time.",
        )
    return ids


# ── Endpoints ─────────────────────────────────────────────────


@router.get("/starters", response_model=ResponseModel)
async def list_starters(current_user: dict = Depends(Auth.get_current_user)):
    """Suggested starter names. Marks the ones the student already created."""
    def body():
        existing = {c.get("starter_key") for c in _user_collections(_svc(), current_user["id"])}
        return _real([{**s, "created": s["starterKey"] in existing} for s in STARTER_COLLECTIONS])

    return _run("starters", lambda: body())


@router.get("", response_model=ResponseModel)
async def list_collections(current_user: dict = Depends(Auth.get_current_user)):
    def body():
        svc = _svc()
        rows = _user_collections(svc, current_user["id"])
        counts: dict[str, int] = {}
        if rows:
            res = (
                svc.table("collection_items")
                .select("collection_id")
                .in_("collection_id", [r["id"] for r in rows])
                .execute()
            )
            for link in res.data or []:
                counts[link["collection_id"]] = counts.get(link["collection_id"], 0) + 1
        return _real([_collection_out(r, counts.get(r["id"], 0)) for r in rows])

    return _run("list", body)


@router.post("", response_model=ResponseModel)
async def create_collection(
    body: dict = Body(default_factory=dict),
    current_user: dict = Depends(Auth.get_current_user),
):
    """Create {name, starterKey?}. A starterKey records which suggestion it was."""
    starter_key = body.get("starterKey") or body.get("starter_key")
    if starter_key is not None and starter_key not in _STARTERS_BY_KEY:
        raise HTTPException(status_code=400, detail="Unknown starter collection.")
    name = clean_name(body.get("name") if body.get("name") is not None else (
        _STARTERS_BY_KEY[starter_key]["name"] if starter_key else None))

    def work():
        svc = _svc()
        uid = current_user["id"]
        rows = _user_collections(svc, uid)
        if len(rows) >= MAX_COLLECTIONS_PER_USER:
            raise HTTPException(
                status_code=400,
                detail=f"You can have up to {MAX_COLLECTIONS_PER_USER} collections.",
            )
        if any((r.get("name") or "").casefold() == name.casefold() for r in rows):
            raise HTTPException(status_code=409, detail="You already have a collection with that name.")
        if starter_key and any(r.get("starter_key") == starter_key for r in rows):
            raise HTTPException(status_code=409, detail="You already created that starter collection.")
        res = (
            svc.table("collections")
            .insert({
                "user_id": uid,
                "name": name,
                "kind": "starter" if starter_key else "custom",
                "starter_key": starter_key,
                "sort_index": len(rows),
            })
            .execute()
        )
        return _real(_collection_out((res.data or [{}])[0]))

    return _run("create", work)


@router.patch("/{collection_id}", response_model=ResponseModel)
async def rename_collection(
    collection_id: str,
    body: dict = Body(default_factory=dict),
    current_user: dict = Depends(Auth.get_current_user),
):
    name = clean_name(body.get("name"))

    def work():
        svc = _svc()
        uid = current_user["id"]
        row = _owned_collection(svc, uid, collection_id)
        others = [r for r in _user_collections(svc, uid) if r["id"] != row["id"]]
        if any((r.get("name") or "").casefold() == name.casefold() for r in others):
            raise HTTPException(status_code=409, detail="You already have a collection with that name.")
        res = (
            svc.table("collections")
            .update({"name": name})
            .eq("id", collection_id)
            .eq("user_id", uid)
            .execute()
        )
        updated = (res.data or [row])[0]
        return _real(_collection_out({**row, **updated}, len(_links(svc, collection_id))))

    return _run("rename", work)


@router.delete("/{collection_id}", response_model=ResponseModel)
async def delete_collection(
    collection_id: str,
    current_user: dict = Depends(Auth.get_current_user),
):
    """Delete the collection. Its saved items stay in My World (join rows only)."""
    def work():
        svc = _svc()
        uid = current_user["id"]
        _owned_collection(svc, uid, collection_id)
        # Explicit membership delete (also done by ON DELETE CASCADE) so the
        # behaviour does not depend on the constraint being present.
        svc.table("collection_items").delete().eq("collection_id", collection_id).execute()
        svc.table("collections").delete().eq("id", collection_id).eq("user_id", uid).execute()
        return _real(None)

    return _run("delete", work)


@router.get("/{collection_id}/items", response_model=ResponseModel)
async def list_collection_items(
    collection_id: str,
    current_user: dict = Depends(Auth.get_current_user),
):
    def work():
        svc = _svc()
        uid = current_user["id"]
        _owned_collection(svc, uid, collection_id)
        links = _links(svc, collection_id)
        if not links:
            return _real([])
        saved = {r["id"]: r for r in _owned_saved_items(svc, uid, [link["saved_item_id"] for link in links])}
        # A membership whose saved item is not the caller's is never returned.
        return _real([_saved_out(saved[link["saved_item_id"]], link) for link in links if link["saved_item_id"] in saved])

    return _run("items", work)


@router.post("/{collection_id}/items", response_model=ResponseModel)
async def add_collection_items(
    collection_id: str,
    body: dict = Body(default_factory=dict),
    current_user: dict = Depends(Auth.get_current_user),
):
    """Add saved items {savedItemIds: [...]}. Idempotent; no saved item is copied."""
    ids = _id_list(body, "savedItemIds")

    def work():
        svc = _svc()
        uid = current_user["id"]
        _owned_collection(svc, uid, collection_id)
        owned = _owned_saved_items(svc, uid, ids)
        if len(owned) != len(ids):
            # Some id is not the caller's saved item: reveal nothing about which.
            raise HTTPException(status_code=404, detail="Saved item not found.")
        links = _links(svc, collection_id)
        present = {link["saved_item_id"] for link in links}
        fresh = [i for i in ids if i not in present]
        if len(links) + len(fresh) > MAX_ITEMS_PER_COLLECTION:
            raise HTTPException(
                status_code=400,
                detail=f"A collection can hold up to {MAX_ITEMS_PER_COLLECTION} items.",
            )
        position = max((link.get("position") or 0 for link in links), default=-1) + 1
        for offset, saved_id in enumerate(fresh):
            svc.table("collection_items").insert({
                "collection_id": collection_id,
                "saved_item_id": saved_id,
                "position": position + offset,
            }).execute()
        return _real({"added": len(fresh), "alreadyPresent": len(ids) - len(fresh)})

    return _run("add_items", work)


@router.delete("/{collection_id}/items/{saved_item_id}", response_model=ResponseModel)
async def remove_collection_item(
    collection_id: str,
    saved_item_id: str,
    current_user: dict = Depends(Auth.get_current_user),
):
    """Remove from this collection only. The saved item itself is untouched."""
    def work():
        svc = _svc()
        _owned_collection(svc, current_user["id"], collection_id)
        (
            svc.table("collection_items")
            .delete()
            .eq("collection_id", collection_id)
            .eq("saved_item_id", saved_item_id)
            .execute()
        )
        return _real(None)

    return _run("remove_item", work)


@router.patch("/{collection_id}/items/{saved_item_id}", response_model=ResponseModel)
async def set_item_note(
    collection_id: str,
    saved_item_id: str,
    body: dict = Body(default_factory=dict),
    current_user: dict = Depends(Auth.get_current_user),
):
    """Set or clear the private note on one item {note}. Blank or null clears it."""
    if "note" not in body:
        raise HTTPException(status_code=400, detail="Send a note, or null to clear it.")
    note = clean_note(body.get("note"))

    def work():
        svc = _svc()
        uid = current_user["id"]
        _owned_collection(svc, uid, collection_id)
        if not any(link["saved_item_id"] == saved_item_id for link in _links(svc, collection_id)):
            raise HTTPException(status_code=404, detail="That item is not in this collection.")
        if not _owned_saved_items(svc, uid, [saved_item_id]):
            raise HTTPException(status_code=404, detail="Saved item not found.")
        (
            svc.table("collection_items")
            .update({"note": note})
            .eq("collection_id", collection_id)
            .eq("saved_item_id", saved_item_id)
            .execute()
        )
        return _real({"savedItemId": saved_item_id, "note": note})

    return _run("set_note", work)


@router.patch("/{collection_id}/order", response_model=ResponseModel)
async def reorder_collection_items(
    collection_id: str,
    body: dict = Body(default_factory=dict),
    current_user: dict = Depends(Auth.get_current_user),
):
    """Reorder {savedItemIds: [...]}. Must list every current member exactly once."""
    ids = _id_list(body, "savedItemIds")

    def work():
        svc = _svc()
        uid = current_user["id"]
        _owned_collection(svc, uid, collection_id)
        links = _links(svc, collection_id)
        members = {link["saved_item_id"] for link in links}
        if set(ids) != members or len(ids) != len(members):
            raise HTTPException(
                status_code=409,
                detail="This collection changed. Reload it and try again.",
            )
        for index, saved_id in enumerate(ids):
            (
                svc.table("collection_items")
                .update({"position": index})
                .eq("collection_id", collection_id)
                .eq("saved_item_id", saved_id)
                .execute()
            )
        return _real({"count": len(ids)})

    return _run("reorder", work)


@router.post("/{collection_id}/items/{saved_item_id}/move", response_model=ResponseModel)
async def move_collection_item(
    collection_id: str,
    saved_item_id: str,
    body: dict = Body(default_factory=dict),
    current_user: dict = Depends(Auth.get_current_user),
):
    """Move one item to another of the caller's collections {toCollectionId}."""
    target_id = body.get("toCollectionId")
    if not isinstance(target_id, str) or not target_id or target_id == collection_id:
        raise HTTPException(status_code=400, detail="Choose a different collection.")

    def work():
        svc = _svc()
        uid = current_user["id"]
        _owned_collection(svc, uid, collection_id)
        _owned_collection(svc, uid, target_id)
        if not _owned_saved_items(svc, uid, [saved_item_id]):
            raise HTTPException(status_code=404, detail="Saved item not found.")
        source_links = _links(svc, collection_id)
        if not any(link["saved_item_id"] == saved_item_id for link in source_links):
            raise HTTPException(status_code=404, detail="That item is not in this collection.")
        target_links = _links(svc, target_id)
        if not any(link["saved_item_id"] == saved_item_id for link in target_links):
            if len(target_links) >= MAX_ITEMS_PER_COLLECTION:
                raise HTTPException(
                    status_code=400,
                    detail=f"A collection can hold up to {MAX_ITEMS_PER_COLLECTION} items.",
                )
            svc.table("collection_items").insert({
                "collection_id": target_id,
                "saved_item_id": saved_item_id,
                "position": max((link.get("position") or 0 for link in target_links), default=-1) + 1,
            }).execute()
        (
            svc.table("collection_items")
            .delete()
            .eq("collection_id", collection_id)
            .eq("saved_item_id", saved_item_id)
            .execute()
        )
        return _real({"moved": True})

    return _run("move_item", work)


def purge_user_collections(user_id: str) -> None:
    """Delete every collection (and membership) the user owns.

    Called from account deletion. Best effort: a missing table or any other
    error is logged and swallowed so deletion itself never fails because of
    collections. Saved items are not touched here.
    """
    try:
        svc = _svc()
        rows = (svc.table("collections").select("id").eq("user_id", user_id).execute().data or [])
        ids = [r["id"] for r in rows]
        if ids:
            svc.table("collection_items").delete().in_("collection_id", ids).execute()
        svc.table("collections").delete().eq("user_id", user_id).execute()
    except Exception as exc:  # noqa: BLE001
        if not _is_missing_table(exc):
            log.warning("Collections purge skipped during deletion", error=str(exc))

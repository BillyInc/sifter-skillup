# ============================================
# Sifter Skill_Up — Starknet RPC Proxy
#
# All Starknet RPC calls from the app go through
# here — never directly from the client.
# Benefits:
#   - API keys never exposed in client bundle
#   - Round-robin across multiple RPC endpoints
#     (no single provider becomes a bottleneck)
#   - Rate limit shielding
#   - Request logging for debugging simulator failures
#   - Starknet email auth (Privy integration)
# ============================================
import itertools
import uuid
from datetime import date, datetime
from typing import Optional

import httpx
import jwt
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from auth import Auth
from config import settings
from database import db
from logger import log
from models import ResponseModel, StarknetAuthRequest, StarknetRPCRequest

# Auth providers that are safe to overwrite when a user completes Privy-backed
# Starknet login (e.g. a guest session upgrading to a real identity). Anything
# not in this set is preserved so we don't clobber a legitimate existing login.
_OVERWRITABLE_AUTH_PROVIDERS = {"", "guest", None}

router = APIRouter(prefix="/api/starknet", tags=["starknet"])


def _build_privy_jwks_url(app_id: str) -> str:
    """Privy JWKS URL is derived from the app id at call time — no config constant."""
    return f"https://auth.privy.io/api/v1/apps/{app_id}/jwks.json"

# Optional-auth helper: returns the user dict when a valid Bearer JWT is
# present, otherwise None. Used by /auth/email so unauthenticated callers
# (primary auth via Privy) can hit it while legacy/demo callers still work.
_optional_security = HTTPBearer(auto_error=False)


async def _optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_optional_security),
) -> Optional[dict]:
    if not credentials:
        return None
    try:
        payload = Auth.decode_jwt(credentials.credentials)
        user_id = payload.get("sub")
        if not user_id:
            return None
        result = (
            db.get_service_client()
            .table("users")
            .select("*")
            .eq("id", user_id)
            .single()
            .execute()
        )
        return result.data or None
    except Exception:
        return None


# Cached Privy JWKS client — lazily constructed so missing PRIVY_APP_ID
# doesn't crash startup. Keyed by app_id to survive unlikely app_id changes
# (e.g. tests that monkeypatch settings.PRIVY_APP_ID) without restart.
_privy_jwk_clients: dict = {}


def _get_privy_jwk_client() -> Optional[jwt.PyJWKClient]:
    if not settings.PRIVY_APP_ID:
        return None
    client = _privy_jwk_clients.get(settings.PRIVY_APP_ID)
    if client is None:
        jwks_url = _build_privy_jwks_url(settings.PRIVY_APP_ID)
        client = jwt.PyJWKClient(jwks_url)
        _privy_jwk_clients[settings.PRIVY_APP_ID] = client
    return client


def _looks_like_jwt(token: Optional[str]) -> bool:
    """Heuristic gate: real Privy tokens are ES256 JWTs — three segments, > 100 chars."""
    return bool(token) and token.count(".") == 2 and len(token) > 100


def _verify_privy_token(token: str) -> Optional[dict]:
    """
    Verify a Privy access token (JWT signed with ES256 via JWKS).
    Returns the decoded claims dict on success, or None on any failure.
    A token that doesn't look like a JWT returns None so the caller can
    fall through to the legacy/demo path.
    """
    if not _looks_like_jwt(token):
        return None
    client = _get_privy_jwk_client()
    if client is None:
        return None
    try:
        signing_key = client.get_signing_key_from_jwt(token).key
        claims = jwt.decode(
            token,
            signing_key,
            algorithms=["ES256"],
            audience=settings.PRIVY_APP_ID,
            issuer="privy.io",
        )
        return claims
    except Exception as e:
        log.warning("Privy JWT verification failed", error=str(e))
        return None

# ─────────────────────────────────────────────────────────────
# RPC endpoint pool — round-robin
# ─────────────────────────────────────────────────────────────

_sepolia_pool  = itertools.cycle(settings.STARKNET_SEPOLIA_RPCS)
_mainnet_pool  = itertools.cycle(settings.STARKNET_MAINNET_RPCS)

def _next_rpc(network: str) -> str:
    return next(_sepolia_pool) if network == "sepolia" else next(_mainnet_pool)


# ─────────────────────────────────────────────────────────────
# RPC Proxy
# ─────────────────────────────────────────────────────────────

@router.post("/rpc", response_model=ResponseModel)
async def starknet_rpc(
    body: StarknetRPCRequest,
    current_user: dict = Depends(Auth.get_current_user),
):
    """
    Proxy a Starknet JSON-RPC call.
    Client sends { network, method, params }.
    We pick the next healthy RPC endpoint and forward.
    """
    rpc_url = _next_rpc(body.network)

    rpc_payload = {
        "jsonrpc": "2.0",
        "id":      1,
        "method":  body.method,
        "params":  body.params,
    }

    log.debug(
        "Starknet RPC forwarding",
        user_id=current_user["id"],
        network=body.network,
        method=body.method,
        rpc_url=rpc_url,
    )

    # Try up to 3 endpoints on failure
    last_error: Optional[str] = None
    for _ in range(3):
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.post(
                    rpc_url,
                    json=rpc_payload,
                    headers={"Content-Type": "application/json"},
                )
            if resp.status_code == 200:
                data = resp.json()
                return ResponseModel(data=data.get("result"), message=None)
            last_error = f"RPC {rpc_url} returned {resp.status_code}"
        except httpx.TimeoutException:
            last_error = f"RPC {rpc_url} timed out"
        except Exception as e:
            last_error = str(e)

        # Try next endpoint in pool
        rpc_url = _next_rpc(body.network)
        log.warning("RPC failed, trying next", error=last_error, next_rpc=rpc_url)

    log.error("All RPC endpoints failed", method=body.method, network=body.network, error=last_error)
    raise HTTPException(503, f"Starknet RPC unavailable: {last_error}")


# ─────────────────────────────────────────────────────────────
# Starknet email auth (Privy integration)
# ─────────────────────────────────────────────────────────────

@router.post("/auth/email", response_model=ResponseModel)
async def starknet_auth_email(
    body: StarknetAuthRequest,
    background_tasks: BackgroundTasks,
    existing_user: Optional[dict] = Depends(_optional_current_user),
):
    """
    PRIMARY auth entry point for Privy-backed Starknet sessions.

    Two supported call shapes:

    1. Real flow (production):
         { email, privy_token: <ES256 JWT>, starknet_address: "0x..." }
       The JWT is verified against Privy's JWKS; audience must equal our
       PRIVY_APP_ID and issuer must be "privy.io". The Privy user DID is
       extracted from the `sub` claim. The client-provided Starknet
       address is trusted once the JWT is verified (Privy binds the
       wallet to the DID on its side; the JWT itself does not embed it).

    2. Legacy/demo flow:
         { email, privy_token: <opaque address> }
       Preserved so existing demo builds keep booting. Triggered when
       `privy_token` does not look like a JWT (fewer than two dots or
       under 100 chars).

    On success the user row is upserted (keyed by email since the
    schema has no `privy_did` column) and a Sifter JWT is issued so the
    client can call other authenticated routes immediately.
    """
    email = body.email.strip().lower()
    if not email or "@" not in email:
        raise HTTPException(400, "Valid email required")

    privy_token = body.privy_token or ""
    starknet_address: Optional[str] = None
    privy_did: Optional[str] = None
    verified_via_jwt = False

    if _looks_like_jwt(privy_token):
        # ── Real verify path ───────────────────────────────────
        if not settings.PRIVY_APP_ID:
            raise HTTPException(503, "Starknet auth not configured (PRIVY_APP_ID missing)")

        claims = _verify_privy_token(privy_token)
        if not claims:
            raise HTTPException(401, "Invalid Privy token")

        privy_did = claims.get("sub")
        if not privy_did:
            raise HTTPException(401, "Privy token missing subject (DID)")

        verified_via_jwt = True

        # Client-supplied address required in the real flow — Privy's JWT
        # doesn't embed the wallet, but the wallet is bound to the DID on
        # Privy's side so we accept whatever the client sends alongside a
        # valid JWT.
        supplied = (body.starknet_address or "").strip()
        if not supplied or not supplied.startswith("0x") or len(supplied) < 3:
            raise HTTPException(400, "Valid starknet_address (0x…) required")
        # Basic hex sanity check on the 0x-stripped tail.
        try:
            int(supplied[2:], 16)
        except ValueError:
            raise HTTPException(400, "starknet_address must be hex")
        starknet_address = supplied
    else:
        # ── Legacy/demo path ───────────────────────────────────
        # The client historically sent its generated address in the
        # privy_token field. Keep that working so old builds don't break.
        starknet_address = (body.starknet_address or privy_token or "").strip() or None
        if not starknet_address:
            raise HTTPException(400, "starknet_address required")

    # ── Upsert the user ────────────────────────────────────────
    # Schema has no privy_did column; we key by email (the v2 migration
    # adds a UNIQUE index on users.email). If an authenticated Sifter
    # session already exists on the request, prefer that row so we don't
    # accidentally fork identities.
    service = db.get_service_client()
    user_row: Optional[dict] = existing_user

    if user_row is None:
        lookup = (
            service.table("users")
            .select("*")
            .eq("email", email)
            .limit(1)
            .execute()
        )
        if lookup.data:
            user_row = lookup.data[0]

    if user_row is None:
        # New user — match the shape used by _create_user in main.py so
        # downstream code that reads these columns keeps working.
        user_id = str(uuid.uuid4())
        new_payload = {
            "id": user_id,
            "email": email,
            "username": email.split("@")[0] or f"Learner_{user_id[:6]}",
            "auth_provider": "privy_starknet",
            "starknet_address": starknet_address,
            "starknet_auth": True,
            "starknet_email": email,
            "points": settings.WELCOME_BONUS,
            "streak": 1,
            "last_played": date.today().isoformat(),
            "current_level": 1,
            "completed_levels": [],
            "perfect_levels": [],
            "python_chapters_completed": [],
            "active_track": "crypto",
            "boosters": {"hammer": 3, "lightning": 2, "shuffle": 5},
            "achievements": [],
            "settings": {"notifications": True, "sound": True, "haptics": True},
            "created_at": datetime.now().isoformat(),
            "last_login": datetime.now().isoformat(),
        }
        inserted = service.table("users").insert(new_payload).execute()
        user_row = inserted.data[0] if inserted.data else new_payload
    else:
        # Existing user — update Starknet fields. Only claim auth_provider
        # when the existing value is guest/empty/null so we don't clobber
        # a returning Telegram/Base/email user.
        update_fields: dict = {
            "starknet_address": starknet_address,
            "starknet_auth": True,
            "starknet_email": email,
            "last_login": datetime.now().isoformat(),
        }
        current_provider = user_row.get("auth_provider")
        if current_provider in _OVERWRITABLE_AUTH_PROVIDERS:
            update_fields["auth_provider"] = "privy_starknet"

        service.table("users").update(update_fields).eq("id", user_row["id"]).execute()

    # Re-read so we return the canonical row (including any DB defaults).
    fresh = (
        service.table("users")
        .select("*")
        .eq("id", user_row["id"])
        .single()
        .execute()
    )
    updated_user = fresh.data or user_row

    user_id = updated_user["id"]

    # ── Unlock Starknet Island (Island 18) immediately ─────────
    background_tasks.add_task(_unlock_starknet_island, user_id)

    # ── Issue Sifter JWT ───────────────────────────────────────
    sifter_jwt = Auth.create_jwt(user_id)

    log.info(
        "Starknet auth completed",
        user_id=user_id,
        verified_via_jwt=verified_via_jwt,
        privy_did=privy_did,
        address=(starknet_address[:10] + "…") if starknet_address else None,
    )

    return ResponseModel(data={"token": sifter_jwt, "user": updated_user})


async def _unlock_starknet_island(user_id: str):
    """Background: ensure Starknet Island (Island 18) is accessible."""
    try:
        db.get_service_client().table("users").update({
            "active_track":   "crypto",
            "active_field_id": "starknet",
        }).eq("id", user_id).execute()
        log.info("Starknet island unlocked", user_id=user_id)
    except Exception as e:
        log.error("Starknet island unlock failed", user_id=user_id, error=str(e))


# ─────────────────────────────────────────────────────────────
# Starknet session status
# ─────────────────────────────────────────────────────────────

@router.get("/status", response_model=ResponseModel)
async def starknet_status(current_user: dict = Depends(Auth.get_current_user)):
    """Return whether the user has a connected Starknet wallet."""
    return ResponseModel(data={
        "connected":         bool(current_user.get("starknet_auth")),
        "address":           current_user.get("starknet_address"),
        "island_18_unlocked": bool(current_user.get("starknet_auth")),
    })


# ─────────────────────────────────────────────────────────────
# Transaction logging (simulator lessons record tx hashes)
# ─────────────────────────────────────────────────────────────

@router.post("/transactions", response_model=ResponseModel)
async def log_starknet_transaction(
    body: dict,
    current_user: dict = Depends(Auth.get_current_user),
):
    """
    Client calls this after every successful StarkZap SDK transaction
    to persist the explorer-verifiable hash. Used for portfolio evidence.
    """
    tx_hash    = body.get("hash", "")
    network    = body.get("network", "sepolia")
    tx_type    = body.get("type", "unknown")    # swap, stake, lend, dca, bridge
    lesson_id  = body.get("lesson_id")
    lab_id     = body.get("lab_id")
    amount     = body.get("amount")
    token      = body.get("token")

    if not tx_hash:
        raise HTTPException(400, "tx hash required")

    db.get_service_client().table("starknet_transactions").insert({
        "id":         str(uuid.uuid4()),
        "user_id":    current_user["id"],
        "tx_hash":    tx_hash,
        "network":    network,
        "tx_type":    tx_type,
        "lesson_id":  lesson_id,
        "lab_id":     lab_id,
        "amount":     str(amount) if amount else None,
        "token":      token,
        "explorer_url": f"https://{'sepolia.' if network == 'sepolia' else ''}voyager.online/tx/{tx_hash}",
        "created_at": datetime.utcnow().isoformat(),
    }).execute()

    log.info(
        "Starknet transaction logged",
        user_id=current_user["id"],
        tx_type=tx_type,
        network=network,
        hash=tx_hash[:16] + "…",
    )

    return ResponseModel(data={
        "logged": True,
        "explorer_url": f"https://{'sepolia.' if network == 'sepolia' else ''}voyager.online/tx/{tx_hash}",
    })

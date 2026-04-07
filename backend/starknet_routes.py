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
from datetime import datetime
from typing import Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse

from auth import Auth
from config import settings
from database import db
from logger import log
from models import ResponseModel, StarknetAuthRequest, StarknetRPCRequest

router = APIRouter(prefix="/api/starknet", tags=["starknet"])

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
    current_user: dict = Depends(Auth.get_current_user),
):
    """
    Register Starknet address for authenticated user.
    Called AFTER the user has a JWT (via email signup or any other auth method).
    The client generates the wallet address (via Privy SDK or demo generation).
    """

    """
    Complete Starknet onboarding for an authenticated user.
    Client has already gone through Privy email flow and received
    a starknet_address. This endpoint records that address on the user.

    Flow on client:
      1. Privy.createWallet(email) → starknet_address
      2. POST /api/starknet/auth/email { email, starknet_address }
      3. Server records address, returns updated user

    This is NOT a primary auth endpoint. The user must already
    have a JWT from the standard auth flow.
    """
    email = body.email.strip().lower()
    if not email or "@" not in email:
        raise HTTPException(400, "Valid email required")

    # In production: verify privy_token against Privy's API
    # For now: trust the authenticated user, just record the association
    starknet_address = body.privy_token  # client sends address as privy_token field

    if not starknet_address:
        raise HTTPException(400, "starknet_address required (pass as privy_token)")

    db.get_service_client().table("users").update({
        "starknet_address": starknet_address,
        "starknet_auth":    True,
        "starknet_email":   email,
    }).eq("id", current_user["id"]).execute()

    # Unlock Island 19 immediately
    background_tasks.add_task(_unlock_starknet_island, current_user["id"])

    log.info(
        "Starknet auth completed",
        user_id=current_user["id"],
        address=starknet_address[:10] + "…",
    )

    updated = db.get_service_client().table("users").select("*") \
        .eq("id", current_user["id"]).single().execute().data

    return ResponseModel(data=updated)


async def _unlock_starknet_island(user_id: str):
    """Background: ensure Starknet Island (Island 19) is accessible."""
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
        "island_19_unlocked": bool(current_user.get("starknet_auth")),
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

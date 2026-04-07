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
import re
import uuid
from datetime import datetime, timezone
from typing import Optional

import httpx
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from auth import Auth
from config import settings
from database import db
from logger import log
from models import (
    ResponseModel,
    StarknetAuthRequest,
    StarknetRPCRequest,
    StarknetTransactionLog,
)

router = APIRouter(prefix="/api/starknet", tags=["starknet"])


# ─────────────────────────────────────────────────────────────
# Rate limiter — per authenticated user, falls back to IP
# ─────────────────────────────────────────────────────────────

def _user_or_ip_key(request: Request) -> str:
    user_id = getattr(request.state, "user_id", None)
    if user_id:
        return f"user:{user_id}"
    return f"ip:{get_remote_address(request)}"


limiter = Limiter(key_func=_user_or_ip_key)


# ─────────────────────────────────────────────────────────────
# RPC endpoint pool — round-robin
# ─────────────────────────────────────────────────────────────

_sepolia_pool  = itertools.cycle(settings.STARKNET_SEPOLIA_RPCS)
_mainnet_pool  = itertools.cycle(settings.STARKNET_MAINNET_RPCS)

def _next_rpc(network: str) -> str:
    return next(_sepolia_pool) if network == "sepolia" else next(_mainnet_pool)


# Tx hash format: 0x followed by 1..64 hex chars
_TX_HASH_RE = re.compile(r"^0x[0-9a-fA-F]{1,64}$")


# ─────────────────────────────────────────────────────────────
# RPC Proxy
# ─────────────────────────────────────────────────────────────

@router.post("/rpc", response_model=ResponseModel)
@limiter.limit("30/minute")
async def starknet_rpc(
    request: Request,
    body: StarknetRPCRequest,
    current_user: dict = Depends(Auth.get_current_user),
):
    """
    Proxy a Starknet JSON-RPC call.
    Client sends { network, method, params }.
    We pick the next healthy RPC endpoint and forward.
    """
    # Make user_id available to the rate-limiter key function
    request.state.user_id = current_user["id"]

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

    # Try up to 3 endpoints on failure (single client for the lifetime of the request)
    last_error: Optional[str] = None
    async with httpx.AsyncClient(timeout=15.0) as client:
        for _ in range(3):
            try:
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

async def _verify_privy_token(privy_token: str) -> Optional[str]:
    """
    Verify a Privy access token against Privy's API and return the
    associated Starknet wallet address (or None if not found).
    Raises on transport / verification errors.
    """
    if not settings.PRIVY_APP_ID:
        raise RuntimeError("PRIVY_APP_ID not configured")

    headers = {
        "Authorization": f"Bearer {privy_token}",
        "privy-app-id":  settings.PRIVY_APP_ID,
    }
    if getattr(settings, "PRIVY_APP_SECRET", ""):
        # Privy supports basic auth with app-id:app-secret as well; harmless to send both.
        headers["privy-app-secret"] = settings.PRIVY_APP_SECRET

    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get("https://auth.privy.io/api/v1/users/me", headers=headers)

    if resp.status_code != 200:
        raise RuntimeError(f"Privy verification failed: HTTP {resp.status_code}")

    data = resp.json() or {}
    # Look for a Starknet wallet in the linked accounts
    accounts = data.get("linked_accounts") or data.get("linkedAccounts") or []
    for acc in accounts:
        chain_type = (acc.get("chain_type") or acc.get("chainType") or "").lower()
        wallet_type = (acc.get("type") or "").lower()
        if "starknet" in chain_type or "starknet" in wallet_type:
            addr = acc.get("address") or acc.get("wallet_address")
            if addr:
                return addr
    # Fallback: top-level wallet field
    wallet = data.get("wallet") or {}
    if isinstance(wallet, dict) and wallet.get("address"):
        return wallet["address"]
    return None


@router.post("/auth/email", response_model=ResponseModel)
async def starknet_auth_email(
    request: Request,
    body: StarknetAuthRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(Auth.get_current_user),
):
    """
    Complete Starknet onboarding for an authenticated user.
    Client has gone through Privy email flow and provides a Privy access token.
    Backend verifies the token with Privy and extracts the wallet address.
    """
    request.state.user_id = current_user["id"]

    email = body.email.strip().lower()
    if not email or "@" not in email:
        raise HTTPException(400, "Valid email required")

    starknet_address: Optional[str] = None

    if not settings.PRIVY_APP_ID:
        if settings.DEBUG:
            log.warning(
                "PRIVY_APP_ID not set — falling back to trust-the-client mode (DEBUG only)",
                user_id=current_user["id"],
            )
            starknet_address = body.privy_token  # legacy demo behavior
        else:
            raise HTTPException(503, "Starknet auth not configured (PRIVY_APP_ID missing)")
    else:
        try:
            starknet_address = await _verify_privy_token(body.privy_token)
        except Exception as e:
            log.error("Privy verification error", user_id=current_user["id"], error=str(e))
            if settings.DEBUG:
                log.warning("DEBUG fallback: trusting client-provided address", user_id=current_user["id"])
                starknet_address = body.privy_token
            else:
                raise HTTPException(503, "Starknet auth verification unavailable")

    if not starknet_address:
        raise HTTPException(400, "No Starknet wallet found for this Privy account")

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
    request: Request,
    body: StarknetTransactionLog,
    current_user: dict = Depends(Auth.get_current_user),
):
    """
    Client calls this after every successful StarkZap SDK transaction
    to persist the explorer-verifiable hash. Used for portfolio evidence.
    """
    request.state.user_id = current_user["id"]

    tx_hash = body.hash
    if not _TX_HASH_RE.match(tx_hash):
        raise HTTPException(400, "Invalid tx hash format (expected 0x + up to 64 hex chars)")

    network   = body.network
    tx_type   = body.type
    lesson_id = body.lessonId
    lab_id    = body.labId
    amount    = body.amount
    token     = body.token

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
        "created_at": datetime.now(timezone.utc).isoformat(),
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

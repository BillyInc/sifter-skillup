import itertools
import uuid
from datetime import date, datetime
from typing import Optional

import httpx
import jwt
from cryptography.hazmat.primitives import serialization
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from auth import Auth
from config import settings
from database import db
from logger import log
from models import ResponseModel, StarknetAuthRequest, StarknetRPCRequest
from services.privy_starknet import create_starknet_wallet, get_user_wallets


_OVERWRITABLE_AUTH_PROVIDERS = {"", "guest", None}
_privy_bearer = HTTPBearer(auto_error=True)
_optional_security = HTTPBearer(auto_error=False)

starknet_router = APIRouter(prefix="/api/starknet", tags=["starknet"])
wallets_router = APIRouter(prefix="/api/wallets", tags=["wallets"])
router = APIRouter()


def _build_privy_jwks_url(app_id: str) -> str:
    return f"https://auth.privy.io/api/v1/apps/{app_id}/jwks.json"


_privy_jwk_clients: dict[str, jwt.PyJWKClient] = {}
_privy_public_keys: dict[str, object] = {}


def _get_privy_jwk_client() -> Optional[jwt.PyJWKClient]:
    if not settings.PRIVY_APP_ID:
        return None
    client = _privy_jwk_clients.get(settings.PRIVY_APP_ID)
    if client is None:
        client = jwt.PyJWKClient(_build_privy_jwks_url(settings.PRIVY_APP_ID))
        _privy_jwk_clients[settings.PRIVY_APP_ID] = client
    return client


def _normalise_verification_key(raw_key: str) -> str:
    key = raw_key.strip()
    if not key:
        return key
    if len(key) >= 2 and key[0] == key[-1] and key[0] in {'"', "'"}:
        key = key[1:-1].strip()
    if "BEGIN PUBLIC KEY" in key:
        return key

    compact = "".join(key.split())
    lines = [compact[i:i + 64] for i in range(0, len(compact), 64)]
    return "-----BEGIN PUBLIC KEY-----\n" + "\n".join(lines) + "\n-----END PUBLIC KEY-----"


def _get_privy_public_key() -> Optional[object]:
    raw_key = settings.PRIVY_VERIFICATION_KEY.strip()
    if not raw_key:
        return None

    cache_key = raw_key
    cached = _privy_public_keys.get(cache_key)
    if cached is not None:
        return cached

    try:
        key = serialization.load_pem_public_key(
            _normalise_verification_key(raw_key).encode("utf-8"),
        )
        _privy_public_keys[cache_key] = key
        return key
    except Exception as exc:
        log.warning("Failed to load Privy verification key", error=str(exc))
        return None


def _looks_like_jwt(token: Optional[str]) -> bool:
    return bool(token) and token.count(".") == 2 and len(token) > 100


def _decode_privy_jwt(token: str, signing_key: object, alg: str) -> dict:
    return jwt.decode(
        token,
        signing_key,
        algorithms=[alg],
        audience=settings.PRIVY_APP_ID,
        issuer="privy.io",
        leeway=60,
    )


def _verify_privy_token(token: str) -> Optional[dict]:
    if not _looks_like_jwt(token):
        return None
    try:
        header = jwt.get_unverified_header(token)
        alg = header.get("alg", "ES256")
        if alg not in {"ES256", "EdDSA"}:
            log.warning("Unsupported Privy JWT alg", alg=alg)
            return None

        configured_key = _get_privy_public_key()
        if configured_key is not None:
            try:
                return _decode_privy_jwt(token, configured_key, alg)
            except Exception as exc:
                log.warning(
                    "Privy JWT verification with configured key failed; falling back to JWKS",
                    error=str(exc),
                    alg=alg,
                    kid=header.get("kid"),
                )

        client = _get_privy_jwk_client()
        if client is None:
            return None

        signing_key = client.get_signing_key_from_jwt(token).key
        return _decode_privy_jwt(token, signing_key, alg)
    except Exception as exc:
        try:
            header = jwt.get_unverified_header(token)
        except Exception:
            header = {}
        log.warning(
            "Privy JWT verification failed",
            error=str(exc),
            alg=header.get("alg"),
            kid=header.get("kid"),
        )
        return None


def _extract_starknet_wallet(wallets: list[dict]) -> Optional[dict]:
    for wallet in wallets:
        if wallet.get("chain_type") == "starknet" and wallet.get("address"):
            return wallet
    return None


async def _verified_privy_claims(
    credentials: HTTPAuthorizationCredentials = Depends(_privy_bearer),
) -> dict:
    if not settings.PRIVY_APP_ID or not settings.PRIVY_APP_SECRET:
        raise HTTPException(503, "Privy Starknet wallet creation is not configured")

    claims = _verify_privy_token(credentials.credentials)
    if not claims:
        raise HTTPException(401, "Invalid Privy token")
    if not claims.get("sub"):
        raise HTTPException(401, "Privy token missing subject (DID)")
    return claims


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


def _wallet_response(wallet: dict, created: bool) -> dict:
    return {
        "created": created,
        "address": wallet.get("address"),
        "wallet_id": wallet.get("id"),
        "public_key": wallet.get("public_key"),
        "chain_type": wallet.get("chain_type"),
    }


def _update_user_wallet_fields(service, user_id: str, wallet: dict, email: Optional[str] = None) -> None:
    update_fields = {
        "starknet_address": wallet.get("address"),
        "starknet_auth": True,
        "last_login": datetime.now().isoformat(),
    }
    if email:
        update_fields["starknet_email"] = email

    try:
        extended_fields = {
            **update_fields,
            "starknet_wallet_id": wallet.get("id"),
            "starknet_public_key": wallet.get("public_key"),
        }
        service.table("users").update(extended_fields).eq("id", user_id).execute()
    except Exception as exc:
        log.warning("Falling back to minimal Starknet wallet field update", user_id=user_id, error=str(exc))
        service.table("users").update(update_fields).eq("id", user_id).execute()


async def _ensure_privy_starknet_wallet(privy_user_id: str) -> tuple[dict, bool]:
    try:
        existing_wallets = await get_user_wallets(privy_user_id)
    except httpx.HTTPStatusError as exc:
        if exc.response.status_code != 404:
            raise
        existing_wallets = []

    existing_wallet = _extract_starknet_wallet(existing_wallets)
    if existing_wallet:
        return existing_wallet, False

    wallet = await create_starknet_wallet(privy_user_id)
    return wallet, True


_sepolia_pool = itertools.cycle(settings.STARKNET_SEPOLIA_RPCS)
_mainnet_pool = itertools.cycle(settings.STARKNET_MAINNET_RPCS)


def _next_rpc(network: str) -> str:
    return next(_sepolia_pool) if network == "sepolia" else next(_mainnet_pool)


@wallets_router.post("/create-starknet", response_model=ResponseModel)
async def create_starknet(
    claims: dict = Depends(_verified_privy_claims),
):
    privy_user_id = claims["sub"]
    service = db.get_service_client()

    user_lookup = (
        service.table("users")
        .select("*")
        .eq("privy_did", privy_user_id)
        .limit(1)
        .execute()
    )
    user_row = user_lookup.data[0] if user_lookup.data else None

    if user_row and user_row.get("starknet_address") and user_row.get("starknet_wallet_id"):
        return ResponseModel(data={
            "created": False,
            "address": user_row.get("starknet_address"),
            "wallet_id": user_row.get("starknet_wallet_id"),
            "public_key": user_row.get("starknet_public_key"),
            "chain_type": "starknet",
        })

    try:
        wallet, created = await _ensure_privy_starknet_wallet(privy_user_id)
    except httpx.HTTPStatusError as exc:
        raise HTTPException(500, f"Failed to ensure Starknet wallet: {exc.response.text}") from exc
    except Exception as exc:
        raise HTTPException(500, f"Failed to ensure Starknet wallet: {exc}") from exc

    if user_row:
        _update_user_wallet_fields(service, user_row["id"], wallet, user_row.get("email"))

    return ResponseModel(data=_wallet_response(wallet, created))


@starknet_router.post("/rpc", response_model=ResponseModel)
async def starknet_rpc(
    body: StarknetRPCRequest,
    current_user: dict = Depends(Auth.get_current_user),
):
    rpc_url = _next_rpc(body.network)
    rpc_payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": body.method,
        "params": body.params,
    }

    log.debug(
        "Starknet RPC forwarding",
        user_id=current_user["id"],
        network=body.network,
        method=body.method,
        rpc_url=rpc_url,
    )

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
        except Exception as exc:
            last_error = str(exc)

        rpc_url = _next_rpc(body.network)
        log.warning("RPC failed, trying next", error=last_error, next_rpc=rpc_url)

    log.error("All RPC endpoints failed", method=body.method, network=body.network, error=last_error)
    raise HTTPException(503, f"Starknet RPC unavailable: {last_error}")


@starknet_router.post("/auth/email", response_model=ResponseModel)
async def starknet_auth_email(
    body: StarknetAuthRequest,
    background_tasks: BackgroundTasks,
    existing_user: Optional[dict] = Depends(_optional_current_user),
):
    email = body.email.strip().lower()
    if not email or "@" not in email:
        raise HTTPException(400, "Valid email required")

    privy_token = body.privy_token or ""
    if not _looks_like_jwt(privy_token):
        raise HTTPException(400, "A valid Privy access token is required")

    if not settings.PRIVY_APP_ID or not settings.PRIVY_APP_SECRET:
        raise HTTPException(503, "Starknet auth is not configured")

    claims = _verify_privy_token(privy_token)
    if not claims:
        raise HTTPException(401, "Invalid Privy token")

    privy_did = claims.get("sub")
    if not privy_did:
        raise HTTPException(401, "Privy token missing subject (DID)")

    try:
        wallet, _ = await _ensure_privy_starknet_wallet(privy_did)
    except httpx.HTTPStatusError as exc:
        raise HTTPException(500, f"Failed to ensure Starknet wallet: {exc.response.text}") from exc
    except Exception as exc:
        raise HTTPException(500, f"Failed to ensure Starknet wallet: {exc}") from exc

    service = db.get_service_client()
    user_row: Optional[dict] = existing_user
    matched_by_did = False

    if user_row is None:
        did_lookup = (
            service.table("users")
            .select("*")
            .eq("privy_did", privy_did)
            .limit(1)
            .execute()
        )
        if did_lookup.data:
            user_row = did_lookup.data[0]
            matched_by_did = True

    if user_row is None:
        email_lookup = (
            service.table("users")
            .select("*")
            .eq("email", email)
            .limit(1)
            .execute()
        )
        if email_lookup.data:
            user_row = email_lookup.data[0]

    if user_row is None:
        user_id = str(uuid.uuid4())
        new_payload = {
            "id": user_id,
            "email": email,
            "username": email.split("@")[0] or f"Learner_{user_id[:6]}",
            "auth_provider": "privy_starknet",
            "starknet_address": wallet.get("address"),
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
            "privy_did": privy_did,
        }
        inserted = service.table("users").insert(new_payload).execute()
        user_row = inserted.data[0] if inserted.data else new_payload
        _update_user_wallet_fields(service, user_row["id"], wallet, email)
    else:
        update_fields = {
            "last_login": datetime.now().isoformat(),
        }
        current_provider = user_row.get("auth_provider")
        if current_provider in _OVERWRITABLE_AUTH_PROVIDERS:
            update_fields["auth_provider"] = "privy_starknet"

        existing_did = user_row.get("privy_did")
        if existing_did and existing_did != privy_did:
            raise HTTPException(409, "Email is linked to a different Privy account")

        if not existing_did:
            update_fields["privy_did"] = privy_did

        if update_fields:
            service.table("users").update(update_fields).eq("id", user_row["id"]).execute()

        _update_user_wallet_fields(service, user_row["id"], wallet, email)

    fresh = (
        service.table("users")
        .select("*")
        .eq("id", user_row["id"])
        .single()
        .execute()
    )
    updated_user = fresh.data or user_row
    user_id = updated_user["id"]

    background_tasks.add_task(_unlock_starknet_island, user_id)
    sifter_jwt = Auth.create_jwt(user_id)

    log.info(
        "Starknet auth completed",
        user_id=user_id,
        privy_did_fp=privy_did[:12],
        matched_by_did=matched_by_did,
        address=(wallet.get("address", "")[:10] + "...") if wallet.get("address") else None,
    )

    return ResponseModel(data={"token": sifter_jwt, "user": updated_user})


async def _unlock_starknet_island(user_id: str):
    try:
        db.get_service_client().table("users").update({
            "active_track": "crypto",
            "active_field_id": "starknet",
        }).eq("id", user_id).execute()
        log.info("Starknet island unlocked", user_id=user_id)
    except Exception as exc:
        log.error("Starknet island unlock failed", user_id=user_id, error=str(exc))


@starknet_router.get("/status", response_model=ResponseModel)
async def starknet_status(current_user: dict = Depends(Auth.get_current_user)):
    return ResponseModel(data={
        "connected": bool(current_user.get("starknet_auth")),
        "address": current_user.get("starknet_address"),
        "island_18_unlocked": bool(current_user.get("starknet_auth")),
    })


@starknet_router.post("/transactions", response_model=ResponseModel)
async def log_starknet_transaction(
    body: dict,
    current_user: dict = Depends(Auth.get_current_user),
):
    tx_hash = body.get("hash", "")
    network = body.get("network", "sepolia")
    tx_type = body.get("type", "unknown")
    lesson_id = body.get("lesson_id")
    lab_id = body.get("lab_id")
    amount = body.get("amount")
    token = body.get("token")

    if not tx_hash:
        raise HTTPException(400, "tx hash required")

    db.get_service_client().table("starknet_transactions").insert({
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        "tx_hash": tx_hash,
        "network": network,
        "tx_type": tx_type,
        "lesson_id": lesson_id,
        "lab_id": lab_id,
        "amount": str(amount) if amount else None,
        "token": token,
        "explorer_url": f"https://{'sepolia.' if network == 'sepolia' else ''}voyager.online/tx/{tx_hash}",
        "created_at": datetime.utcnow().isoformat(),
    }).execute()

    log.info(
        "Starknet transaction logged",
        user_id=current_user["id"],
        tx_type=tx_type,
        network=network,
        hash=tx_hash[:16] + "...",
    )

    return ResponseModel(data={
        "logged": True,
        "explorer_url": f"https://{'sepolia.' if network == 'sepolia' else ''}voyager.online/tx/{tx_hash}",
    })


router.include_router(starknet_router)
router.include_router(wallets_router)

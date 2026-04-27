import os
from typing import Any, Optional

import httpx


PRIVY_APP_ID = os.getenv("PRIVY_APP_ID", "")
PRIVY_APP_SECRET = os.getenv("PRIVY_APP_SECRET", "")
PRIVY_BASE_URL = "https://api.privy.io/v1"


def _headers() -> dict[str, str]:
    return {
        "privy-app-id": PRIVY_APP_ID,
        "Content-Type": "application/json",
    }


def _pick_wallet(payload: Any) -> Optional[dict]:
    if isinstance(payload, dict):
        wallets = payload.get("wallets")
        if isinstance(wallets, list):
            for wallet in wallets:
                if isinstance(wallet, dict) and wallet.get("chain_type") == "starknet":
                    return wallet

        linked_accounts = payload.get("linked_accounts")
        if isinstance(linked_accounts, list):
            for account in linked_accounts:
                if (
                    isinstance(account, dict)
                    and account.get("chain_type") == "starknet"
                    and account.get("address")
                ):
                    return account

        if payload.get("chain_type") == "starknet" and payload.get("address"):
            return payload

        data = payload.get("data")
        if isinstance(data, dict):
            return _pick_wallet(data)

    if isinstance(payload, list):
        for item in payload:
            wallet = _pick_wallet(item)
            if wallet:
                return wallet

    return None


def _pick_email(payload: Any) -> Optional[str]:
    if isinstance(payload, dict):
        email = payload.get("email")
        if isinstance(email, dict):
            address = email.get("address")
            if isinstance(address, str) and address:
                return address

        linked_accounts = payload.get("linked_accounts")
        if isinstance(linked_accounts, list):
            for account in linked_accounts:
                if (
                    isinstance(account, dict)
                    and account.get("type") == "email"
                    and isinstance(account.get("address"), str)
                    and account.get("address")
                ):
                    return account["address"]

        data = payload.get("data")
        if isinstance(data, dict):
            return _pick_email(data)

    if isinstance(payload, list):
        for item in payload:
            email = _pick_email(item)
            if email:
                return email

    return None


async def get_privy_user(privy_user_id: str) -> dict:
    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(
            f"{PRIVY_BASE_URL}/users/{privy_user_id}",
            auth=(PRIVY_APP_ID, PRIVY_APP_SECRET),
            headers={"privy-app-id": PRIVY_APP_ID},
        )
        response.raise_for_status()
        return response.json()


async def create_starknet_wallet(privy_user_id: str) -> dict:
    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.post(
            f"{PRIVY_BASE_URL}/users/{privy_user_id}/wallets",
            auth=(PRIVY_APP_ID, PRIVY_APP_SECRET),
            headers=_headers(),
            json={
                "wallets": [
                    {
                        "chain_type": "starknet",
                    }
                ],
            },
        )
        response.raise_for_status()
        wallet = _pick_wallet(response.json())
        if not wallet:
            raise RuntimeError("Privy wallet creation response did not include a Starknet wallet")
        return wallet


async def get_user_wallets(privy_user_id: str) -> list[dict]:
    data = await get_privy_user(privy_user_id)
    linked_accounts = data.get("linked_accounts", [])
    return [
        account
        for account in linked_accounts
        if isinstance(account, dict) and account.get("chain_type") == "starknet"
    ]


async def get_user_email(privy_user_id: str) -> Optional[str]:
    data = await get_privy_user(privy_user_id)
    return _pick_email(data)

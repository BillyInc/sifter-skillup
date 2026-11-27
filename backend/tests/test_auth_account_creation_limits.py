"""Per-address limits on guest and base-wallet account creation."""
import asyncio
from types import SimpleNamespace

import pytest
from fastapi import HTTPException

import auth_rate_limit
import main


def _req(peer="8.8.8.8"):
    async def _json():
        return {}
    return SimpleNamespace(client=SimpleNamespace(host=peer), headers={}, json=_json)


def _query(rows):
    q = SimpleNamespace()
    q.select = lambda *a: q
    q.eq = lambda *a: q
    q.execute = lambda: SimpleNamespace(data=rows)
    return q


@pytest.fixture(autouse=True)
def stubs(monkeypatch):
    auth_rate_limit.reset_all()
    created = []

    def fake_create(**kw):
        created.append(kw)
        return {"id": f"u{len(created)}", "token_version": 0}

    async def noop(*a, **k):
        return None

    monkeypatch.setattr(main, "_create_user", fake_create)
    monkeypatch.setattr(main, "_post_auth_device_register", noop)
    monkeypatch.setattr(main, "sanitize_user_row", lambda u: u)
    monkeypatch.setattr(main.Auth, "verify_base_wallet", lambda *a, **k: True)
    monkeypatch.setattr(main.Auth, "create_jwt", lambda *a, **k: "t")
    monkeypatch.setattr(main.db, "get_service_client",
                        lambda: SimpleNamespace(table=lambda _n: _query([])))
    yield created
    auth_rate_limit.reset_all()


def _guest(peer="8.8.8.8"):
    return asyncio.run(main.auth_guest(_req(peer)))


def _wallet(i, peer="8.8.8.8"):
    return asyncio.run(main.auth_base_wallet(
        {"walletAddress": f"0x{i:040x}", "signature": "s"}, _req(peer)))


def _limit(bucket):
    return auth_rate_limit.LIMITS[bucket][1]


@pytest.mark.parametrize("bucket", ["guest_create_ip", "wallet_create_ip"])
def test_limits_are_generous_and_capped(bucket):
    assert _limit(bucket) >= 60
    assert auth_rate_limit.BACKOFF_CAPS[bucket] <= 15 * 60


def test_guest_creation_is_limited_per_address(stubs):
    for _ in range(_limit("guest_create_ip")):
        _guest()
    with pytest.raises(HTTPException) as e:
        _guest()
    assert e.value.status_code == 429
    assert 1 <= int(e.value.headers["Retry-After"]) <= 900
    assert len(stubs) == _limit("guest_create_ip")  # nothing minted past the cap
    _guest("1.1.1.1")  # another address is unaffected


def test_base_wallet_creation_is_limited_per_address(stubs):
    for i in range(_limit("wallet_create_ip")):
        _wallet(i)
    with pytest.raises(HTTPException) as e:
        _wallet(10_000)
    assert e.value.status_code == 429 and "Retry-After" in e.value.headers
    _wallet(10_001, "1.1.1.1")


def test_limits_skipped_when_address_unknown(stubs):
    for _ in range(_limit("guest_create_ip") + 5):
        _guest("10.0.0.5")  # private proxy peer: client_ip is None
    for i in range(_limit("wallet_create_ip") + 5):
        _wallet(i, "10.0.0.5")


def test_existing_wallet_login_is_never_limited(stubs, monkeypatch):
    for i in range(_limit("wallet_create_ip")):
        _wallet(i)
    monkeypatch.setattr(main.db, "get_service_client", lambda: SimpleNamespace(
        table=lambda _n: _query([{"id": "old", "token_version": 0}])))
    assert _wallet(1)  # returning wallet, same address, past the creation cap

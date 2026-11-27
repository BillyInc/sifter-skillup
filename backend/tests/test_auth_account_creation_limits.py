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


def test_limit_numbers():
    assert _limit("guest_create_ip") == 600  # a school shares one address
    assert _limit("wallet_create_ip") == 60
    for bucket in ("guest_create_ip", "wallet_create_ip"):
        assert auth_rate_limit.BACKOFF_CAPS[bucket] == 15 * 60


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


def test_failed_guest_creation_does_not_count(stubs, monkeypatch):
    def boom(**kw):
        raise RuntimeError("db down")

    monkeypatch.setattr(main, "_create_user", boom)
    for _ in range(_limit("guest_create_ip") + 5):
        with pytest.raises(RuntimeError):
            _guest()
    monkeypatch.setattr(main, "_create_user", lambda **kw: {"id": "u", "token_version": 0})
    assert _guest()  # allowance untouched by the failures


def test_failed_wallet_creation_does_not_count(stubs, monkeypatch):
    def boom(**kw):
        raise RuntimeError("db down")

    monkeypatch.setattr(main, "_create_user", boom)
    for i in range(_limit("wallet_create_ip") + 5):
        with pytest.raises(RuntimeError):
            _wallet(i)
    monkeypatch.setattr(main, "_create_user", lambda **kw: {"id": "u", "token_version": 0})
    assert _wallet(999)


def _fwd_req(xff, peer="10.0.0.5"):
    async def _json():
        return {}
    return SimpleNamespace(client=SimpleNamespace(host=peer),
                           headers={"x-forwarded-for": xff}, json=_json)


def test_spoofed_leftmost_xff_is_ignored_when_proxy_trusted(stubs, monkeypatch):
    monkeypatch.setattr(main.settings, "TRUST_PROXY_HEADERS", True, raising=False)
    monkeypatch.setattr(auth_rate_limit.settings, "TRUST_PROXY_HEADERS", True, raising=False)
    monkeypatch.setattr(auth_rate_limit.settings, "TRUSTED_PROXY_HOPS", 1, raising=False)
    # the proxy appended 8.8.8.8; the attacker rotates the leftmost entry
    for i in range(_limit("guest_create_ip")):
        asyncio.run(main.auth_guest(_fwd_req(f"1.2.3.{i % 250 + 1}, 8.8.8.8")))
    with pytest.raises(HTTPException) as e:
        asyncio.run(main.auth_guest(_fwd_req("9.9.9.9, 8.8.8.8")))
    assert e.value.status_code == 429
    asyncio.run(main.auth_guest(_fwd_req("9.9.9.9, 1.1.1.1")))  # different real address


def test_xff_ignored_entirely_when_proxy_not_trusted(stubs, monkeypatch):
    monkeypatch.setattr(auth_rate_limit.settings, "TRUST_PROXY_HEADERS", False, raising=False)
    # private peer, spoofed public XFF: no address is known, so no limit applies
    assert auth_rate_limit.client_ip(_fwd_req("8.8.8.8")) is None
    for _ in range(_limit("guest_create_ip") + 5):
        asyncio.run(main.auth_guest(_fwd_req("8.8.8.8")))
    # public peer: the header cannot change the key
    assert auth_rate_limit.client_ip(_fwd_req("1.1.1.1", peer="8.8.8.8")) == "8.8.8.8"

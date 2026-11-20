"""Profile photo upload: validation, ownership, signed URLs and deletion purge."""
import io
from unittest.mock import MagicMock

import pytest
from PIL import Image

import avatar_storage
from avatar_storage import AvatarError, InMemoryAvatarStorage, process_avatar_image

USER_ID = "test-user-123"
OTHER_ID = "other-user-999"


def _img(fmt="PNG", size=(300, 200), mode="RGB", exif=False):
    buf = io.BytesIO()
    im = Image.new(mode, size, (200, 30, 30) if mode == "RGB" else (200, 30, 30, 128))
    kw = {}
    if exif and fmt == "JPEG":
        e = Image.Exif()
        e[0x010F] = "SecretCamera"
        e[0x8825] = {1: "N"}  # GPS IFD
        kw["exif"] = e.tobytes()
    im.save(buf, format=fmt, **kw)
    return buf.getvalue()


@pytest.fixture
def storage():
    s = InMemoryAvatarStorage()
    avatar_storage.set_storage(s)
    yield s
    avatar_storage.set_storage(None)


def _login_as(mock_db, **kw):
    row = {"id": USER_ID, "username": "L", "auth_provider": "guest", "account_type": "student", **kw}
    sc = mock_db.get_service_client.return_value
    sc.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = MagicMock(data=row)
    return sc


def _post(client, auth_header, data, name="a.png", ctype="image/png"):
    return client.post("/api/users/me/avatar", headers=auth_header, files={"file": (name, data, ctype)})


class TestProcessing:
    @pytest.mark.parametrize("fmt", ["JPEG", "PNG", "WEBP"])
    def test_accepts_and_reencodes_to_512_webp(self, fmt):
        out = process_avatar_image(_img(fmt))
        im = Image.open(io.BytesIO(out))
        assert im.format == "WEBP" and im.size == (512, 512)

    def test_exif_and_gps_stripped(self):
        src = _img("JPEG", exif=True)
        assert b"SecretCamera" in src
        out = process_avatar_image(src)
        im = Image.open(io.BytesIO(out))
        assert not im.getexif() and b"SecretCamera" not in out and b"EXIF" not in out

    def test_transparency_flattened(self):
        out = process_avatar_image(_img("PNG", mode="RGBA"))
        assert Image.open(io.BytesIO(out)).mode == "RGB"

    @pytest.mark.parametrize("data", [b"", b"hello world not an image", b"GIF89a" + b"\0" * 50,
                                      b"<svg xmlns='http://www.w3.org/2000/svg'/>", b"%PDF-1.4"])
    def test_wrong_type_rejected(self, data):
        with pytest.raises(AvatarError):
            process_avatar_image(data)

    def test_oversize_rejected(self):
        with pytest.raises(AvatarError, match="2 MB"):
            process_avatar_image(b"\xff\xd8\xff" + b"0" * (avatar_storage.MAX_UPLOAD_BYTES + 1))

    def test_truncated_rejected(self):
        full = _img("PNG", size=(400, 400))
        with pytest.raises(AvatarError):
            process_avatar_image(full[: len(full) // 2])

    def test_truncated_jpeg_rejected(self):
        full = _img("JPEG", size=(600, 600))
        with pytest.raises(AvatarError):
            process_avatar_image(full[: len(full) // 2])

    def test_format_mismatch_with_magic_rejected(self):
        # PNG bytes are fine, but a JPEG header on non-JPEG content must fail.
        with pytest.raises(AvatarError):
            process_avatar_image(b"\xff\xd8\xff" + _img("PNG")[3:])

    def test_dimensions(self):
        with pytest.raises(AvatarError, match="too small"):
            process_avatar_image(_img("PNG", size=(100, 400)))
        with pytest.raises(AvatarError, match="too large"):
            process_avatar_image(_img("PNG", size=(4097, 128)))


class TestAvatarUrlValidation:
    @pytest.mark.parametrize("v", [None, "", "preset:icon-star", "preset:initial-blue"])
    def test_accepts(self, v):
        assert avatar_storage.validate_avatar_url(v, USER_ID) == (v or None)

    def test_accepts_own_upload(self):
        v = f"upload:{USER_ID}/12345678-1234-1234-1234-123456789abc.webp"
        assert avatar_storage.validate_avatar_url(v, USER_ID) == v

    @pytest.mark.parametrize("v", [
        "https://evil.example/x.png", "javascript:alert(1)", "preset:", "preset:../x", "preset:A B",
        f"upload:{OTHER_ID}/12345678-1234-1234-1234-123456789abc.webp",
        f"upload:{USER_ID}/../{OTHER_ID}/12345678-1234-1234-1234-123456789abc.webp",
        f"upload:{USER_ID}/notauuid.webp", "upload:", "data:image/png;base64,AAAA",
    ])
    def test_rejects(self, v):
        with pytest.raises(AvatarError):
            avatar_storage.validate_avatar_url(v, USER_ID)

    def test_public_value_hides_uploads(self):
        assert avatar_storage.public_avatar_url("upload:x/y.webp") is None
        assert avatar_storage.public_avatar_url("preset:icon-star") == "preset:icon-star"


class TestUploadEndpoint:
    def test_success_stores_webp_and_sets_reference(self, client, auth_header, mock_db, storage):
        sc = _login_as(mock_db)
        r = _post(client, auth_header, _img("JPEG", exif=True), "p.jpg", "image/jpeg")
        assert r.status_code == 200, r.text
        data = r.json()["data"]
        assert data["avatar_url"].startswith(f"upload:{USER_ID}/") and data["avatar_url"].endswith(".webp")
        assert data["avatar_display_url"].startswith("https://storage.test/sign/")
        (key, blob), = storage.objects.items()
        assert key == data["avatar_url"][len("upload:"):]
        assert Image.open(io.BytesIO(blob)).size == (512, 512)
        assert storage.content_types[key] == "image/webp"
        sc.table.return_value.update.assert_called_with({"avatar_url": data["avatar_url"]})

    def test_spoofed_extension_and_mime_use_magic_bytes(self, client, auth_header, mock_db, storage):
        _login_as(mock_db)
        r = _post(client, auth_header, b"MZ\x90\x00 not an image", "evil.png", "image/png")
        assert r.status_code == 400 and not storage.objects
        # Real PNG sent as .exe with a bogus MIME is still accepted (type from bytes).
        assert _post(client, auth_header, _img("PNG"), "x.exe", "application/octet-stream").status_code == 200

    def test_svg_and_gif_rejected(self, client, auth_header, mock_db, storage):
        _login_as(mock_db)
        assert _post(client, auth_header, b"<svg onload=alert(1)/>", "a.png").status_code == 400
        assert _post(client, auth_header, b"GIF89a\x01\x00\x01\x00", "a.gif", "image/gif").status_code == 400
        assert not storage.objects

    def test_oversize_400_nothing_stored(self, client, auth_header, mock_db, storage):
        _login_as(mock_db)
        r = _post(client, auth_header, b"\x89PNG\r\n\x1a\n" + b"0" * (2 * 1024 * 1024 + 10))
        assert r.status_code in (400, 413) and not storage.objects

    def test_truncated_400(self, client, auth_header, mock_db, storage):
        _login_as(mock_db)
        full = _img("PNG", size=(500, 500))
        assert _post(client, auth_header, full[: len(full) // 3]).status_code == 400
        assert not storage.objects

    def test_requires_auth(self, client, storage):
        r = client.post("/api/users/me/avatar", files={"file": ("a.png", _img(), "image/png")})
        assert r.status_code in (401, 403)

    def test_replacing_deletes_previous_object(self, client, auth_header, mock_db, storage):
        old = f"{USER_ID}/11111111-1111-1111-1111-111111111111.webp"
        storage.objects[old] = b"old"
        _login_as(mock_db, avatar_url=f"upload:{old}")
        r = _post(client, auth_header, _img())
        assert r.status_code == 200
        assert old not in storage.objects and len(storage.objects) == 1

    def test_db_failure_rolls_back_object(self, client, auth_header, mock_db, storage):
        sc = _login_as(mock_db)
        sc.table.return_value.update.return_value.eq.return_value.execute.side_effect = RuntimeError("db")
        r = _post(client, auth_header, _img())
        assert r.status_code == 500 and not storage.objects

    def test_storage_failure_503_without_leak(self, client, auth_header, mock_db, storage):
        _login_as(mock_db)
        storage.upload = MagicMock(side_effect=RuntimeError("secret-internal"))
        r = _post(client, auth_header, _img())
        assert r.status_code == 503 and "secret-internal" not in r.text


class TestRemoveEndpoint:
    def test_remove_clears_reference_and_objects(self, client, auth_header, mock_db, storage):
        key = f"{USER_ID}/22222222-2222-2222-2222-222222222222.webp"
        storage.objects[key] = b"x"
        storage.objects[f"{OTHER_ID}/33333333-3333-3333-3333-333333333333.webp"] = b"y"
        sc = _login_as(mock_db, avatar_url=f"upload:{key}")
        r = client.delete("/api/users/me/avatar", headers=auth_header)
        assert r.status_code == 200
        assert r.json()["data"] == {"avatar_url": None, "avatar_display_url": None}
        assert list(storage.objects) == [f"{OTHER_ID}/33333333-3333-3333-3333-333333333333.webp"]
        sc.table.return_value.update.assert_called_with({"avatar_url": None})

    def test_remove_does_not_touch_preset(self, client, auth_header, mock_db, storage):
        sc = _login_as(mock_db, avatar_url="preset:icon-star")
        assert client.delete("/api/users/me/avatar", headers=auth_header).status_code == 200
        sc.table.return_value.update.assert_not_called()


class TestUpdateMeOwnership:
    def _setup(self, mock_db, **kw):
        _login_as(mock_db, **kw)
        c = mock_db.get_client.return_value
        c.table.return_value.update.return_value.eq.return_value.execute.return_value = MagicMock(data=[])
        c.table.return_value.select.return_value.eq.return_value.limit.return_value.execute.return_value = MagicMock(
            data=[{"id": USER_ID, "avatar_url": "preset:icon-star"}])
        return c

    def test_preset_still_works(self, client, auth_header, mock_db, storage):
        c = self._setup(mock_db)
        r = client.put("/api/users/me", headers=auth_header, json={"avatar_url": "preset:icon-star"})
        assert r.status_code == 200, r.text
        c.table.return_value.update.assert_called_once_with({"avatar_url": "preset:icon-star"})

    def test_null_still_works(self, client, auth_header, mock_db, storage):
        c = self._setup(mock_db)
        assert client.put("/api/users/me", headers=auth_header, json={"avatar_url": None}).status_code == 200
        c.table.return_value.update.assert_called_once_with({"avatar_url": None})

    @pytest.mark.parametrize("v", [
        "https://x.example/a.png",
        f"upload:{OTHER_ID}/12345678-1234-1234-1234-123456789abc.webp",
    ])
    def test_foreign_or_arbitrary_rejected(self, client, auth_header, mock_db, storage, v):
        c = self._setup(mock_db)
        r = client.put("/api/users/me", headers=auth_header, json={"avatar_url": v})
        assert r.status_code == 400
        c.table.return_value.update.assert_not_called()

    def test_switching_to_preset_purges_old_upload(self, client, auth_header, mock_db, storage):
        key = f"{USER_ID}/44444444-4444-4444-4444-444444444444.webp"
        storage.objects[key] = b"x"
        self._setup(mock_db, avatar_url=f"upload:{key}")
        r = client.put("/api/users/me", headers=auth_header, json={"avatar_url": "preset:icon-star"})
        assert r.status_code == 200 and not storage.objects


class TestGetMe:
    def test_signed_url_for_owner_only(self, client, auth_header, mock_db, storage):
        key = f"{USER_ID}/55555555-5555-5555-5555-555555555555.webp"
        storage.objects[key] = b"x"
        _login_as(mock_db, avatar_url=f"upload:{key}")
        d = client.get("/api/users/me", headers=auth_header).json()["data"]
        assert d["avatar_display_url"].startswith("https://storage.test/sign/")

    def test_foreign_key_never_signed(self):
        s = InMemoryAvatarStorage()
        avatar_storage.set_storage(s)
        try:
            k = f"{OTHER_ID}/55555555-5555-5555-5555-555555555555.webp"
            s.objects[k] = b"x"
            assert avatar_storage.avatar_display_url(f"upload:{k}", USER_ID) is None
        finally:
            avatar_storage.set_storage(None)

    def test_storage_outage_does_not_break_me(self, client, auth_header, mock_db, storage):
        key = f"{USER_ID}/66666666-6666-6666-6666-666666666666.webp"
        _login_as(mock_db, avatar_url=f"upload:{key}")
        storage.signed_url = MagicMock(side_effect=RuntimeError("down"))
        r = client.get("/api/users/me", headers=auth_header)
        assert r.status_code == 200 and r.json()["data"]["avatar_display_url"] is None

    def test_scrub_hides_upload_from_others(self):
        rows = [{"users": {"id": "a", "avatar_url": "upload:a/x.webp"}}, {"users": {"avatar_url": "preset:icon-star"}}, {"x": 1}]
        out = avatar_storage.scrub_embedded_avatars(rows)
        assert out[0]["users"]["avatar_url"] is None
        assert out[1]["users"]["avatar_url"] == "preset:icon-star" and out[2] == {"x": 1}


class TestAccountDeletionPurge:
    def test_delete_account_purges_photo_and_clears_reference(self, client, auth_header, mock_db, storage):
        k1 = f"{USER_ID}/77777777-7777-7777-7777-777777777777.webp"
        k2 = f"{USER_ID}/88888888-8888-8888-8888-888888888888.webp"
        keep = f"{OTHER_ID}/99999999-9999-9999-9999-999999999999.webp"
        for k in (k1, k2, keep):
            storage.objects[k] = b"x"
        sc = _login_as(mock_db, avatar_url=f"upload:{k1}")
        r = client.delete("/api/users/me", headers=auth_header)
        assert r.status_code == 200, r.text
        assert list(storage.objects) == [keep]
        updates = [c.args[0] for c in sc.table.return_value.update.call_args_list]
        assert any(u.get("avatar_url") is None and u.get("is_deleted") for u in updates)

    def test_storage_outage_does_not_block_deletion(self, client, auth_header, mock_db, storage):
        _login_as(mock_db)
        storage.list_keys = MagicMock(side_effect=RuntimeError("down"))
        assert client.delete("/api/users/me", headers=auth_header).status_code == 200


class TestUploadRateLimit:
    @pytest.fixture(autouse=True)
    def _reset(self):
        avatar_storage.upload_limiter.reset()
        yield
        avatar_storage.upload_limiter.reset()

    def test_limiter_blocks_after_hourly_cap_and_resets(self):
        t = [1000.0]
        lim = avatar_storage.UploadRateLimiter(clock=lambda: t[0])
        for _ in range(5):
            assert lim.check("u") is None
            lim.record("u")
        wait = lim.check("u")
        assert wait and 0 < wait <= 3601
        t[0] += 3601
        assert lim.check("u") is None

    def test_limiter_daily_cap(self):
        t = [0.0]
        lim = avatar_storage.UploadRateLimiter(clock=lambda: t[0])
        for _ in range(20):
            t[0] += 1000  # keeps each hour under 5 uploads
            assert lim.check("u") is None
            lim.record("u")
        assert lim.check("u") is not None

    def test_limiter_is_per_user(self):
        lim = avatar_storage.UploadRateLimiter()
        for _ in range(5):
            lim.record("a")
        assert lim.check("a") is not None
        assert lim.check("b") is None

    def test_endpoint_returns_429_with_retry_after(self, client, auth_header, mock_db, storage):
        _login_as(mock_db)
        for _ in range(5):
            assert _post(client, auth_header, _img()).status_code == 200
        r = _post(client, auth_header, _img())
        assert r.status_code == 429
        assert int(r.headers["Retry-After"]) > 0

    def test_rejected_files_do_not_count(self, client, auth_header, mock_db, storage):
        _login_as(mock_db)
        for _ in range(8):
            assert _post(client, auth_header, b"not an image").status_code == 400
        assert _post(client, auth_header, _img()).status_code == 200

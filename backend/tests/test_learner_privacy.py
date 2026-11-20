"""Learner privacy on account deletion: hashed cooldown rows, anonymised user
row, hard delete that never drops the user row after a failed purge, and a
claim-code QR that never leaves the server."""
import asyncio
import sys
import types

import pytest

import account_hard_delete as ahd

EMAIL = "Kid.Learner@Example.com"
DEVICE = "device-abc-123"


class _Result:
    def __init__(self, data):
        self.data = data


class _Table:
    def __init__(self, svc, name):
        self.svc, self.name = svc, name
        self._in = None
        self._gt = None
        self._eq = None
        self._insert = None
        self._update = None
        self._delete = False
        self._lt = None

    def select(self, *_a, **_k): return self
    def order(self, *_a, **_k): return self
    def limit(self, *_a, **_k): return self
    def in_(self, k, vals):
        self._in = (k, list(vals))
        return self
    def eq(self, k, v):
        self._eq = (k, v)
        return self
    def gt(self, k, v):
        self._gt = (k, v)
        return self
    def lt(self, k, v):
        self._lt = (k, v)
        return self
    def insert(self, row):
        self._insert = row
        return self
    def update(self, row):
        self._update = row
        return self
    def delete(self):
        self._delete = True
        return self

    def execute(self):
        rows = self.svc.tables.setdefault(self.name, [])
        if self._insert is not None:
            rows.append(dict(self._insert))
            self.svc.writes.append((self.name, "insert", dict(self._insert)))
            return _Result([self._insert])
        if self._update is not None:
            self.svc.writes.append((self.name, "update", dict(self._update)))
            return _Result([])
        hit = rows
        if self._in:
            hit = [r for r in hit if r.get(self._in[0]) in self._in[1]]
        if self._eq:
            hit = [r for r in hit if r.get(self._eq[0]) == self._eq[1]]
        if self._gt:
            hit = [r for r in hit if r.get(self._gt[0]) and r[self._gt[0]] > self._gt[1]]
        if self._lt:
            hit = [r for r in hit if r.get(self._lt[0]) and r[self._lt[0]] < self._lt[1]]
        if self._delete:
            self.svc.tables[self.name] = [r for r in rows if r not in hit]
            self.svc.writes.append((self.name, "delete", len(hit)))
        return _Result(list(hit))


class FakeSvc:
    def __init__(self, tables=None):
        self.tables = tables or {}
        self.writes = []

    def table(self, name): return _Table(self, name)
    def schema(self, _n): return self
    def get_service_client(self): return self


# --- hashing helpers ---------------------------------------------------------

def test_hash_is_stable_salted_and_not_the_raw_value():
    import privacy
    a = privacy.privacy_hash(EMAIL, "email")
    assert a == privacy.privacy_hash("  kid.learner@example.com ", "email")  # normalised
    assert EMAIL.lower() not in a and a.startswith("h1:")
    assert a != privacy.privacy_hash(EMAIL, "device")  # purpose-separated


def test_hash_depends_on_the_server_secret(monkeypatch):
    import privacy
    monkeypatch.setattr(privacy.settings, "ACCOUNT_DELETION_HASH_SECRET", "one", raising=False)
    first = privacy.privacy_hash(DEVICE, "device")
    monkeypatch.setattr(privacy.settings, "ACCOUNT_DELETION_HASH_SECRET", "two", raising=False)
    assert first != privacy.privacy_hash(DEVICE, "device")


# --- soft delete -------------------------------------------------------------

def _run_delete_me(monkeypatch, user=None):
    import main
    svc = FakeSvc()
    monkeypatch.setattr(main.db, "get_service_client", lambda: svc)
    monkeypatch.setattr(main, "_purge_avatar_objects", lambda keys: None)
    monkeypatch.setattr(main.avatar_storage, "get_storage",
                        lambda: types.SimpleNamespace(list_keys=lambda uid: []))
    import routes.collections_routes as cr
    monkeypatch.setattr(cr, "purge_user_collections", lambda uid: None)
    user = user or {"id": "u1", "email": EMAIL, "username": "Ada Lovelace",
                    "display_name": "Ada", "phone": "+2348000000000",
                    "date_of_birth": "2012-05-01", "first_name": "Ada", "last_name": "Lovelace"}
    out = asyncio.run(main.delete_me(None, user, DEVICE))
    return svc, out


def test_soft_delete_stores_only_hashes_in_the_cooldown_row(monkeypatch):
    svc, out = _run_delete_me(monkeypatch)
    assert out.data["deleted"] is True
    cooldown = [w for w in svc.writes if w[0] == "account_deletion_cooldowns" and w[1] == "insert"][0][2]
    assert cooldown["email"].startswith("h1:") and cooldown["device_id"].startswith("h1:")
    blob = repr(cooldown).lower()
    assert "example.com" not in blob and "device-abc" not in blob


def test_soft_delete_anonymises_personal_fields_on_the_user_row(monkeypatch):
    svc, _ = _run_delete_me(monkeypatch)
    update = [w for w in svc.writes if w[0] == "users" and w[1] == "update"][0][2]
    for field in ("display_name", "phone", "date_of_birth", "first_name", "middle_name", "last_name", "avatar_url"):
        assert update.get(field) is None, field
    assert update["username"] == "Deleted learner"
    assert update["email"].endswith("@deleted.invalid") and "kid.learner" not in update["email"].lower()
    assert str(update["deleted_device_id"]).startswith("h1:")  # no raw device id kept
    assert update["is_deleted"] is True and update["password_hash"] is None


# --- cooldown check keeps working -------------------------------------------

def test_signup_cooldown_matches_hashed_and_legacy_raw_rows():
    import privacy
    future = "2999-01-01T00:00:00"
    hashed = FakeSvc({"account_deletion_cooldowns": [
        {"device_id": privacy.privacy_hash(DEVICE, "device"), "available_at": future}]})
    legacy = FakeSvc({"account_deletion_cooldowns": [{"device_id": DEVICE, "available_at": future}]})
    other = FakeSvc({"account_deletion_cooldowns": [
        {"device_id": privacy.privacy_hash("someone-else", "device"), "available_at": future}]})
    assert privacy.device_cooldown_active(hashed, DEVICE, "2026-01-01T00:00:00") is True
    assert privacy.device_cooldown_active(legacy, DEVICE, "2026-01-01T00:00:00") is True
    assert privacy.device_cooldown_active(other, DEVICE, "2026-01-01T00:00:00") is False
    assert privacy.device_cooldown_active(hashed, DEVICE, "3000-01-01T00:00:00") is False  # expired


# --- hard delete never drops the user row after a failed purge ---------------

def _hd_setup(monkeypatch, outcome):
    svc = FakeSvc({"users": [{"id": "u1", "is_deleted": True,
                              "deletion_cooldown_until": "2026-01-01T00:00:00+00:00"}]})
    monkeypatch.setattr(ahd, "db", svc)
    monkeypatch.setattr(ahd.settings, "ACCOUNT_HARD_DELETE_ENABLED", True, raising=False)
    monkeypatch.setattr(ahd.settings, "ACCOUNT_HARD_DELETE_RETENTION_DAYS", 30, raising=False)
    monkeypatch.setattr(ahd.settings, "ACCOUNT_HARD_DELETE_BATCH_SIZE", 10, raising=False)
    monkeypatch.setattr(ahd, "hard_delete_learner_content", lambda uid: outcome)
    return svc


@pytest.mark.parametrize("bad", [
    {"collections": "deleted", "saved_items": "error", "user_notes": "deleted"},
    {"collections": "skipped", "saved_items": "skipped", "user_notes": "skipped"},
])
def test_user_row_is_kept_when_any_purge_step_failed(monkeypatch, bad):
    svc = _hd_setup(monkeypatch, bad)
    out = ahd.hard_delete_expired_accounts()
    assert out["deleted"] == 0 and out["failed"] == 1
    assert [r["id"] for r in svc.tables["users"]] == ["u1"]  # left for the next run


def test_user_row_is_deleted_when_the_purge_is_clean(monkeypatch):
    svc = _hd_setup(monkeypatch, {"collections": "deleted", "saved_items": "deleted", "user_notes": "missing_table"})
    out = ahd.hard_delete_expired_accounts()
    assert out["deleted"] == 1 and svc.tables["users"] == []


def test_expired_cooldown_rows_are_purged_by_the_job(monkeypatch):
    svc = _hd_setup(monkeypatch, {"collections": "deleted"})
    svc.tables["account_deletion_cooldowns"] = [
        {"device_id": "h1:a", "available_at": "2020-01-01T00:00:00"},
        {"device_id": "h1:b", "available_at": "2999-01-01T00:00:00"},
    ]
    ahd.hard_delete_expired_accounts()
    assert [r["device_id"] for r in svc.tables["account_deletion_cooldowns"]] == ["h1:b"]


# --- claim-code QR stays on the server --------------------------------------

def test_login_card_never_sends_the_claim_code_to_a_third_party():
    from services import report_gen
    html = report_gen.build_login_card_html("Ada", "ABC123XYZ", school_name="S", student_class="SS1")
    assert "qrserver" not in html and "<img" not in html.replace("<img class=\"qr\" src=\"data:", "")
    assert "ABC123XYZ" in html
    assert "levelup.com.ng/settings/my-school?claim=ABC123XYZ" in html  # printable fallback


def test_report_access_block_never_sends_the_code_to_a_third_party():
    from services import report_gen
    html = report_gen._report_access_block("ABC123XYZ")
    assert "qrserver" not in html and "http://" not in html.replace("https://levelup.com.ng", "")
    assert "ABC123XYZ" in html


def test_local_qr_is_embedded_as_a_data_uri_when_segno_is_available(monkeypatch):
    class _QR:
        def __init__(self, text): self.text = text
        def svg_data_uri(self, **_k): return "data:image/svg+xml;base64,AAAA"
    fake = types.SimpleNamespace(make=lambda text, **_k: _QR(text))
    monkeypatch.setitem(sys.modules, "segno", fake)
    from services import report_gen
    html = report_gen.build_login_card_html("Ada", "ABC123XYZ")
    assert 'src="data:image/svg+xml;base64,AAAA"' in html and "qrserver" not in html

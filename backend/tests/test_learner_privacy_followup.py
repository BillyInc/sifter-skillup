"""Follow-up to the learner-privacy review (PR #320).

Covers: full anonymisation of the users row, scrubbing of device sessions and
push tokens, purge of learner free text that outlives the user row (FK is
SET NULL), blocked deletions (FK is NO ACTION), device-id normalisation, no
stored email hash, hard-delete starvation and backoff, the retention floor and
the hash-secret report.

Nothing here touches a database: a small fake enforces column and table
existence so the missing-migration paths are exercised too.
"""
from datetime import datetime, timedelta, timezone

import account_hard_delete as ahd
import account_purge as ap
import privacy

NOW = datetime(2026, 12, 1, 12, 0, tzinfo=timezone.utc)


def _iso(days_ago, now=NOW):
    return (now - timedelta(days=days_ago)).isoformat()


# --- a fake PostgREST that knows about missing tables and columns -------------

class _Res:
    def __init__(self, data):
        self.data = data


class _Q:
    def __init__(self, svc, name):
        self.svc, self.name = svc, name
        self.cols, self.filters, self.orders = [], [], []
        self.lim = None
        self.mode, self.payload = "select", None

    def select(self, cols="*", **_k):
        if cols and cols != "*":
            self.cols += [c.strip() for c in cols.split(",")]
        return self

    def _f(self, op, col, val):
        self.filters.append((op, col, val))
        self.cols.append(col)
        return self

    def eq(self, c, v): return self._f("eq", c, v)
    def neq(self, c, v): return self._f("neq", c, v)
    def in_(self, c, v): return self._f("in", c, list(v))
    def is_(self, c, v): return self._f("is", c, v)
    def lt(self, c, v): return self._f("lt", c, v)
    def gte(self, c, v): return self._f("gte", c, v)
    def gt(self, c, v): return self._f("gt", c, v)

    def or_(self, spec):
        # only the shape the hard-delete job sends: "<col>.is.null,<col>.neq.<value>"
        col = spec.split(",")[0].split(".")[0]
        self.filters.append(("or_null_or_neq", col, spec.split(",")[1].split(".neq.")[1]))
        self.cols.append(col)
        return self

    def order(self, col, desc=False, nullsfirst=None, **_k):
        self.orders.append((col, desc, nullsfirst))
        self.cols.append(col)
        return self

    def limit(self, n):
        self.lim = n
        return self

    def insert(self, row):
        self.mode, self.payload = "insert", row
        return self

    def update(self, row):
        self.mode, self.payload = "update", row
        self.cols += list(row)
        return self

    def delete(self):
        self.mode = "delete"
        return self

    _OPS = {
        "eq": lambda x, v: x == v,
        "neq": lambda x, v: x != v,
        "in": lambda x, v: x in v,
        "is": lambda x, v: x is None and v == "null",
        "lt": lambda x, v: x is not None and x < v,
        "gte": lambda x, v: x is not None and x >= v,
        "gt": lambda x, v: x is not None and x > v,
        "or_null_or_neq": lambda x, v: x is None or x != v,
    }

    def _match(self, r):
        return all(self._OPS[op](r.get(c), v) for op, c, v in self.filters)

    def execute(self):
        svc = self.svc
        svc.calls.append((self.name, self.mode, list(self.filters), list(self.orders)))
        if self.name in svc.missing_tables:
            raise Exception(f"PGRST205 Could not find the table 'skillup_dev.{self.name}' in the schema cache")
        for c in self.cols:
            if c in svc.missing_columns.get(self.name, set()):
                raise Exception(f"PGRST204 Could not find the '{c}' column of '{self.name}' in the schema cache")
        rows = svc.tables.setdefault(self.name, [])
        if self.mode == "insert":
            rows.append(dict(self.payload))
            return _Res([self.payload])
        hit = [r for r in rows if self._match(r)]
        if self.mode == "update":
            for r in hit:
                r.update(self.payload)
            return _Res(list(hit))
        if self.mode == "delete":
            svc.tables[self.name] = [r for r in rows if r not in hit]
            return _Res(list(hit))
        for col, desc, nullsfirst in reversed(self.orders):
            first = bool(nullsfirst)
            hit.sort(
                key=lambda r, c=col, f=first: ((r.get(c) is not None) == f, r.get(c) if r.get(c) is not None else ""),
                reverse=desc,
            )
        if self.lim:
            hit = hit[: self.lim]
        return _Res([dict(r) for r in hit])


class FakeSvc:
    def __init__(self, tables=None, missing_tables=(), missing_columns=None):
        self.tables = {k: [dict(r) for r in v] for k, v in (tables or {}).items()}
        self.missing_tables = set(missing_tables)
        self.missing_columns = {k: set(v) for k, v in (missing_columns or {}).items()}
        self.calls = []

    def table(self, name): return _Q(self, name)
    def schema(self, _n): return self
    def get_service_client(self): return self


# --- 1. the users row is fully anonymised ------------------------------------

PERSONAL_NULLED = (
    "telegram_id", "wallet_address", "starknet_address", "starknet_wallet_id", "starknet_email",
    "starknet_public_key", "github_token", "github_username", "github_avatar", "last_seen_device_id",
    "chosen_direction", "last_post_auth_path", "student_class", "stream", "phone", "date_of_birth",
    "first_name", "middle_name", "last_name", "display_name", "avatar_url", "privy_did", "guardian_consent_at",
)


def test_deletion_fields_clear_every_personal_identifier():
    fields = privacy.deletion_user_fields("u1", "dev-1", "t0", "t1")
    for key in PERSONAL_NULLED:
        assert key in fields and fields[key] is None, key
    assert fields["settings"] == {}  # also withdraws analytics consent stored in settings
    assert fields["username"] == "Deleted learner"
    assert fields["email"].endswith("@deleted.invalid")


def test_deletion_fields_leave_not_null_and_guard_columns_alone():
    fields = privacy.deletion_user_fields("u1", "dev-1", "t0", "t1")
    # NOT NULL columns, or the markers the hard-delete guard relies on.
    for key in ("provenance", "claim_state", "provisioning_school_id", "account_type", "auth_provider",
                "is_admin", "is_internal_staff", "created_at"):
        assert key not in fields, key


# --- 2. device sessions and push tokens are scrubbed on soft delete ----------

def _sessions():
    return FakeSvc({
        "active_sessions": [
            {"id": "s1", "user_id": "u1", "device_id": "dev-A", "device_name": "Ada's iPhone",
             "platform": "ios", "push_token": "tok-1", "fcm_token": "fcm-1", "is_active": True},
            {"id": "s2", "user_id": "u1", "device_id": "dev-B", "device_name": "Ada's laptop",
             "push_token": None, "fcm_token": None, "is_active": True},
            {"id": "s3", "user_id": "u2", "device_id": "dev-C", "device_name": "Bola's phone",
             "push_token": "tok-3", "fcm_token": "fcm-3", "is_active": True},
        ],
        "push_tokens": [{"user_id": "u1", "token": "t1"}, {"user_id": "u2", "token": "t2"}],
    })


def test_sessions_are_scrubbed_and_push_token_removed():
    svc = _sessions()
    privacy.scrub_deleted_sessions(svc, "u1")
    mine = [r for r in svc.tables["active_sessions"] if r["user_id"] == "u1"]
    assert len(mine) == 2
    for r in mine:
        assert r["device_id"].startswith("h1:") and r["device_name"] == "Deleted device"
        assert r["push_token"] is None and r["fcm_token"] is None and r["is_active"] is False
    assert len({r["device_id"] for r in mine}) == 2  # still distinct per device
    other = [r for r in svc.tables["active_sessions"] if r["user_id"] == "u2"][0]
    assert other["device_id"] == "dev-C" and other["push_token"] == "tok-3"
    assert [r["user_id"] for r in svc.tables["push_tokens"]] == ["u2"]


def test_scrub_works_without_the_fcm_column_and_never_raises():
    svc = _sessions()
    svc.missing_columns = {"active_sessions": {"fcm_token"}}
    privacy.scrub_deleted_sessions(svc, "u1")
    r1 = [r for r in svc.tables["active_sessions"] if r["id"] == "s1"][0]
    assert r1["push_token"] is None and r1["device_name"] == "Deleted device"
    gone = FakeSvc(missing_tables={"active_sessions", "push_tokens"})
    privacy.scrub_deleted_sessions(gone, "u1")  # tables absent on an old schema: no error


def test_delete_me_scrubs_sessions(monkeypatch):
    import main
    from tests.test_learner_privacy import _run_delete_me

    seen = []
    monkeypatch.setattr(main, "scrub_deleted_sessions", lambda svc, uid: seen.append(uid), raising=False)
    _run_delete_me(monkeypatch)
    assert seen == ["u1"]


# --- 3. the cooldown row holds no email hash ---------------------------------

def test_cooldown_row_stores_no_email_in_any_form():
    row = privacy.cooldown_row("u1", "dev-1", "t0", "t1")
    assert row.get("email") is None and row["device_id"].startswith("h1:")
    assert "dev-1" not in repr(row)


# --- 4. device ids are bounded and filter-safe -------------------------------

def test_valid_device_id_is_kept_and_odd_ones_are_hashed():
    assert privacy.normalize_device_id("abc-123_DEF:9") == "abc-123_DEF:9"
    for raw in ("x" * 10_000, "a,b", 'a"b', "a b", "a)b(c", "é-ü", "a\nb"):
        out = privacy.normalize_device_id(raw)
        assert out != raw and len(out) <= 128 and out.startswith("h1:"), raw
        assert not any(ch in out for ch in ',()" \n'), raw
    assert privacy.normalize_device_id("") == "" and privacy.normalize_device_id(None) == ""


def test_odd_device_ids_still_hit_the_cooldown_and_raw_is_never_sent_to_the_filter():
    weird = 'bad,id"with)stuff' + "y" * 500
    row = privacy.cooldown_row("u1", weird, "2000-01-01T00:00:00", "2999-01-01T00:00:00")
    svc = FakeSvc({"account_deletion_cooldowns": [row]})
    assert privacy.device_cooldown_active(svc, weird, "2026-01-01T00:00:00") is True
    in_values = [v for (_n, _m, flt, _o) in svc.calls for (op, _c, v) in flt if op == "in"][0]
    assert weird not in in_values and all(len(v) <= 128 for v in in_values)
    # a well-formed legacy raw row is still matched
    legacy = FakeSvc({"account_deletion_cooldowns": [{"device_id": "dev-1", "available_at": "2999-01-01T00:00:00"}]})
    assert privacy.device_cooldown_active(legacy, "dev-1", "2026-01-01T00:00:00") is True


# --- 5. the purge covers learner text that outlives the user row -------------

def _purge_db(monkeypatch, **kw):
    svc = FakeSvc(**kw)
    monkeypatch.setattr(ap, "db", svc)
    return svc


def test_purge_removes_feedback_and_events_of_only_that_user(monkeypatch):
    tables = {t: [{"id": f"{t}-1", "user_id": "u1"}, {"id": f"{t}-2", "user_id": "u2"}]
              for t in ("collections", "saved_items", "user_notes", "user_feedback", "feedback",
                        "mapping_feedback", "app_reviews", "analytics_events")}
    svc = _purge_db(monkeypatch, tables=tables)
    out = ap.hard_delete_learner_content("u1")
    for t in ("user_feedback", "feedback", "mapping_feedback", "app_reviews", "analytics_events"):
        assert out[t] == "deleted", t
        assert [r["user_id"] for r in svc.tables[t]] == ["u2"], t
    assert out["guilds"] == "clear" and out["institution_verification_submissions"] == "clear"
    assert out["notifications"] == "clear"


def test_purge_reports_missing_tables_cleanly(monkeypatch):
    _purge_db(monkeypatch, missing_tables={"user_feedback", "guilds"})
    out = ap.hard_delete_learner_content("u1")
    assert out["user_feedback"] == "missing_table" and out["guilds"] == "missing_table"


def test_an_owned_guild_with_no_other_members_is_removed(monkeypatch):
    svc = _purge_db(monkeypatch, tables={
        "guilds": [{"id": "g1", "owner_id": "u1"}],
        "guild_members": [{"guild_id": "g1", "user_id": "u1"}],
    })
    out = ap.hard_delete_learner_content("u1")
    assert out["guilds"] == "deleted" and svc.tables["guilds"] == []


def test_an_owned_guild_with_other_members_is_transferred_not_blocked(monkeypatch):
    svc = _purge_db(monkeypatch, tables={
        "guilds": [{"id": "g1", "owner_id": "u1"}],
        "guild_members": [
            {"guild_id": "g1", "user_id": "u1", "joined_at": "2026-01-01"},
            {"guild_id": "g1", "user_id": "u3", "joined_at": "2026-03-01"},
            {"guild_id": "g1", "user_id": "u2", "joined_at": "2026-02-01"},
        ],
    })
    out = ap.hard_delete_learner_content("u1")
    assert out["guilds"] == "transferred" and "blocked" not in out.values()
    assert svc.tables["guilds"] == [{"id": "g1", "owner_id": "u2"}]  # longest-standing other member


def test_guild_owned_by_someone_else_is_untouched(monkeypatch):
    svc = _purge_db(monkeypatch, tables={
        "guilds": [{"id": "g9", "owner_id": "u2"}],
        "guild_members": [{"guild_id": "g9", "user_id": "u1"}, {"guild_id": "g9", "user_id": "u2"}],
    })
    assert ap.hard_delete_learner_content("u1")["guilds"] == "clear"
    assert svc.tables["guilds"] == [{"id": "g9", "owner_id": "u2"}]


def test_notifications_triggered_by_the_user_are_deleted_before_the_user_row(monkeypatch):
    svc = _purge_db(monkeypatch, tables={"notifications": [
        {"id": "n1", "recipient_id": "u2", "actor_id": "u1"},
        {"id": "n2", "recipient_id": "u1", "actor_id": "u2"},  # u1's own inbox: cascades with the user
        {"id": "n3", "recipient_id": "u3", "actor_id": "u2"},
    ]})
    out = ap.hard_delete_learner_content("u1")
    assert out["notifications"] == "deleted"
    assert [n["id"] for n in svc.tables["notifications"]] == ["n2", "n3"]
    assert ap.hard_delete_learner_content("u1")["notifications"] == "clear"  # idempotent


def test_a_schema_without_actor_id_does_not_fail_the_purge(monkeypatch):
    _purge_db(monkeypatch, tables={"notifications": []}, missing_columns={"notifications": {"actor_id"}})
    assert ap.hard_delete_learner_content("u1")["notifications"] == "clear"


class _Storage:
    def __init__(self, fail=False):
        self.removed, self.fail = [], fail

    def from_(self, bucket):
        assert bucket == "verification-proofs"
        return self

    def remove(self, paths):
        if self.fail:
            raise RuntimeError("storage down")
        self.removed += list(paths)


def _with_storage(svc, storage):
    svc.storage = storage
    return svc


def test_verification_proof_files_and_rows_are_purged(monkeypatch):
    svc = _purge_db(monkeypatch, tables={"institution_verification_submissions": [
        {"id": "v1", "submitted_by": "u1", "storage_path": "org/u1/a.pdf"},
        {"id": "v2", "submitted_by": "u1", "storage_path": "org/u1/b.png"},
        {"id": "v3", "submitted_by": "u2", "storage_path": "org/u2/c.pdf"},
    ]})
    storage = _with_storage(svc, _Storage()).storage
    out = ap.hard_delete_learner_content("u1")
    assert out["institution_verification_submissions"] == "deleted"
    assert sorted(storage.removed) == ["org/u1/a.pdf", "org/u1/b.png"]
    assert [r["id"] for r in svc.tables["institution_verification_submissions"]] == ["v3"]


def test_a_storage_failure_keeps_the_submission_rows_for_a_retry(monkeypatch):
    svc = _purge_db(monkeypatch, tables={"institution_verification_submissions": [
        {"id": "v1", "submitted_by": "u1", "storage_path": "org/u1/a.pdf"}]})
    _with_storage(svc, _Storage(fail=True))
    out = ap.hard_delete_learner_content("u1")
    assert out["institution_verification_submissions"] == "error"
    assert len(svc.tables["institution_verification_submissions"]) == 1


def test_a_user_with_every_blocker_gets_a_clean_purge_and_the_row_can_go(monkeypatch):
    svc = _purge_db(monkeypatch, tables={
        "notifications": [{"id": "n1", "recipient_id": "u2", "actor_id": "u1"}],
        "guilds": [{"id": "g1", "owner_id": "u1"}],
        "guild_members": [{"guild_id": "g1", "user_id": "u1"}],
        "institution_verification_submissions": [{"id": "v1", "submitted_by": "u1", "storage_path": "p"}],
    })
    _with_storage(svc, _Storage())
    out = ap.hard_delete_learner_content("u1")
    assert not any(v in ahd._BLOCKING_OUTCOMES for v in out.values()), out
    assert svc.tables["notifications"] == [] and svc.tables["guilds"] == []


# --- 6. hard-delete job: blocked rows, starvation, backoff, floor ------------

def _job(monkeypatch, users, *, missing_columns=None, batch=10, days=30, purge=None):
    svc = FakeSvc({"users": users}, missing_columns=missing_columns)
    monkeypatch.setattr(ahd, "db", svc)
    for k, v in (("ACCOUNT_HARD_DELETE_ENABLED", True), ("ACCOUNT_HARD_DELETE_RETENTION_DAYS", days),
                 ("ACCOUNT_HARD_DELETE_BATCH_SIZE", batch)):
        monkeypatch.setattr(ahd.settings, k, v, raising=False)
    purged = []

    def default_purge(uid):
        purged.append(uid)
        return {"collections": "deleted"}

    monkeypatch.setattr(ahd, "hard_delete_learner_content", purge or default_purge)
    return svc, purged


def _u(uid, days_ago, **extra):
    # purge_attempts is NOT NULL DEFAULT 0 once the backoff migration is applied.
    return {"id": uid, "is_deleted": True, "deletion_cooldown_until": _iso(days_ago),
            "purge_attempts": 0, "last_purge_attempt_at": None, **extra}


def test_a_blocked_purge_keeps_the_user_row(monkeypatch):
    svc, _ = _job(monkeypatch, [_u("a", 90)], purge=lambda uid: {"guilds": "blocked"})
    out = ahd.hard_delete_expired_accounts(NOW)
    assert out["deleted"] == 0 and out["failed"] == 1
    assert [r["id"] for r in svc.tables["users"]] == ["a"]


def test_unclaimed_shells_filtered_in_the_database_cannot_starve_the_rest(monkeypatch):
    users = [_u(f"shell{i}", 200 - i, provisioning_school_id="s1", claim_state="unclaimed") for i in range(150)]
    users += [_u(f"plain{i}", 60 - i) for i in range(20)]
    svc, purged = _job(monkeypatch, users, batch=10)
    out = ahd.hard_delete_expired_accounts(NOW)
    assert out["deleted"] == 10 and all(p.startswith("plain") for p in purged)
    assert any(op == "or_null_or_neq" and c == "claim_state" and v == "unclaimed"
               for (_n, _m, flt, _o) in svc.calls for (op, c, v) in flt)
    assert sum(1 for r in svc.tables["users"] if r["id"].startswith("shell")) == 150  # never touched


def test_failed_rows_go_to_the_back_so_healthy_rows_are_not_starved(monkeypatch):
    stuck = [_u(f"stuck{i}", 100 - i) for i in range(3)]
    healthy = [_u(f"ok{i}", 50 - i) for i in range(5)]
    purged = []

    def purge(uid):
        purged.append(uid)
        return {"collections": "error"} if uid.startswith("stuck") else {"collections": "deleted"}

    svc, _ = _job(monkeypatch, stuck + healthy, batch=3, purge=purge)
    ahd.hard_delete_expired_accounts(NOW)  # takes the three oldest: all stuck, all fail
    by_id = {r["id"]: r for r in svc.tables["users"]}
    assert all(by_id[f"stuck{i}"]["purge_attempts"] == 1 and by_id[f"stuck{i}"]["last_purge_attempt_at"]
               for i in range(3))
    out = ahd.hard_delete_expired_accounts(NOW + timedelta(days=1))
    assert out["deleted"] == 3  # the next run reaches healthy rows first
    out = ahd.hard_delete_expired_accounts(NOW + timedelta(days=2))
    assert out["deleted"] == 2
    assert sorted(r["id"] for r in svc.tables["users"]) == ["stuck0", "stuck1", "stuck2"]


def test_rows_that_exhausted_their_attempts_are_skipped_and_reported(monkeypatch):
    warned = []
    monkeypatch.setattr(ahd.log, "warning", lambda msg, **kw: warned.append((msg, kw)))
    svc, purged = _job(monkeypatch, [_u("given-up", 90, purge_attempts=20, last_purge_attempt_at=_iso(1)),
                                     _u("fresh", 90)])
    out = ahd.hard_delete_expired_accounts(NOW)
    assert purged == ["fresh"] and out["eligible"] == 1
    assert any("abandon" in m.lower() or "exhaust" in m.lower() for m, _ in warned)
    assert "given-up" in [r["id"] for r in svc.tables["users"]]


def test_without_the_backoff_columns_the_batch_rotates_by_date(monkeypatch):
    stuck = [_u(f"stuck{i}", 200 - i) for i in range(30)]
    healthy = [_u(f"ok{i}", 100 - i) for i in range(20)]
    cols = {"users": {"purge_attempts", "last_purge_attempt_at"}}

    def purge(uid):
        return {"collections": "error"} if uid.startswith("stuck") else {"collections": "deleted"}

    svc, _ = _job(monkeypatch, stuck + healthy, missing_columns=cols, batch=10, purge=purge)
    for day in range(8):
        ahd.hard_delete_expired_accounts(NOW + timedelta(days=day))
    left = [r["id"] for r in svc.tables["users"]]
    assert not any(i.startswith("ok") for i in left), "healthy rows were starved behind stuck ones"
    assert len(left) == 30


def test_retention_floor_is_seven_days(monkeypatch):
    svc, purged = _job(monkeypatch, [_u("three", 3), _u("eight", 8)], days=0)
    ahd.hard_delete_expired_accounts(NOW)
    assert purged == ["eight"]
    svc, purged = _job(monkeypatch, [_u("neg", 5)], days=-30)
    ahd.hard_delete_expired_accounts(NOW)
    assert purged == []


# --- 7. the hash secret is reported loudly in production ---------------------

def test_weak_deletion_secret_is_reported_in_production_only():
    weak = privacy.check_deletion_secret(debug=False, hash_secret="", jwt_secret="change-me-in-production")
    assert weak and "ACCOUNT_DELETION_HASH_SECRET" in weak
    assert privacy.check_deletion_secret(debug=False, hash_secret="", jwt_secret="short") is not None
    assert privacy.check_deletion_secret(debug=True, hash_secret="", jwt_secret="change-me-in-production") is None
    assert privacy.check_deletion_secret(debug=False, hash_secret="x" * 32, jwt_secret="change-me-in-production") is None
    # unset but a strong JWT secret to fall back on: fine, only a note elsewhere
    assert privacy.check_deletion_secret(debug=False, hash_secret="", jwt_secret="j" * 40) is None


def test_deleting_with_a_weak_secret_logs_loudly_but_still_works(monkeypatch):
    errors = []
    monkeypatch.setattr(privacy.log, "error", lambda msg, **kw: errors.append(msg))
    monkeypatch.setattr(privacy.settings, "DEBUG", False, raising=False)
    monkeypatch.setattr(privacy.settings, "ACCOUNT_DELETION_HASH_SECRET", "", raising=False)
    monkeypatch.setattr(privacy.settings, "JWT_SECRET", "change-me-in-production", raising=False)
    monkeypatch.setattr(privacy, "_warned", False)
    assert privacy.privacy_hash("x@y.z", "email").startswith("h1:")  # deletion is never blocked
    assert errors and "ACCOUNT_DELETION_HASH_SECRET" in errors[0]


# --- 8. the claim QR is rendered locally with the real library ---------------

def test_real_segno_renders_the_claim_qr_locally():
    import segno  # a declared dependency now: a missing install must fail, not skip

    assert segno.make("https://example.test/x", error="m").svg_data_uri(scale=4, border=2).startswith("data:image/svg+xml")
    from services import report_gen

    html = report_gen.build_login_card_html("Ada", "ABC123XYZ", school_name="S", student_class="SS1")
    assert '<img class="qr" src="data:image/svg+xml' in html
    assert "qrserver" not in html and "http://" not in html.replace("https://levelup.com.ng", "")
    assert "levelup.com.ng/settings/my-school?claim=ABC123XYZ" in html  # printable fallback stays


# --- 9. FK blockers: end to end through the job -------------------------------

def _real_purge_job(monkeypatch, users, tables, **kw):
    svc = FakeSvc({"users": users, **tables}, **kw)
    monkeypatch.setattr(ahd, "db", svc)
    monkeypatch.setattr(ap, "db", svc)
    for k, v in (("ACCOUNT_HARD_DELETE_ENABLED", True), ("ACCOUNT_HARD_DELETE_RETENTION_DAYS", 30),
                 ("ACCOUNT_HARD_DELETE_BATCH_SIZE", 10)):
        monkeypatch.setattr(ahd.settings, k, v, raising=False)
    svc.storage = _Storage()
    return svc


def test_a_user_who_triggered_notifications_and_owns_a_guild_is_deleted(monkeypatch):
    svc = _real_purge_job(
        monkeypatch, [_u("u1", 90)],
        {"notifications": [{"id": "n1", "recipient_id": "u2", "actor_id": "u1"}],
         "guilds": [{"id": "g1", "owner_id": "u1"}],
         "guild_members": [{"guild_id": "g1", "user_id": "u1", "joined_at": "1"},
                           {"guild_id": "g1", "user_id": "u2", "joined_at": "2"}]},
    )
    out = ahd.hard_delete_expired_accounts(NOW)
    assert out["deleted"] == 1 and out["failed"] == 0 and out["blocked"] == {}
    assert svc.tables["users"] == [] and svc.tables["notifications"] == []
    assert svc.tables["guilds"][0]["owner_id"] == "u2"


def test_a_provisioned_minor_who_claimed_and_deleted_is_purged_with_proof_files(monkeypatch):
    svc = _real_purge_job(
        monkeypatch,
        [_u("minor", 90, provisioning_school_id="s1", claim_state="claimed", provenance="provisioned")],
        {"saved_items": [{"id": "s1", "user_id": "minor"}],
         "institution_verification_submissions": [{"id": "v1", "submitted_by": "minor", "storage_path": "o/minor/x.pdf"}]},
    )
    out = ahd.hard_delete_expired_accounts(NOW)
    assert out["deleted"] == 1 and svc.tables["users"] == []
    assert svc.tables["saved_items"] == [] and svc.storage.removed == ["o/minor/x.pdf"]


def test_a_persistent_failure_is_retried_then_abandoned_with_pii_intact(monkeypatch):
    svc = _real_purge_job(
        monkeypatch, [_u("u1", 90)],
        {"institution_verification_submissions": [{"id": "v1", "submitted_by": "u1", "storage_path": "p"}]},
    )
    svc.storage = _Storage(fail=True)
    for day in range(ahd.MAX_PURGE_ATTEMPTS):
        out = ahd.hard_delete_expired_accounts(NOW + timedelta(days=day))
        assert out["failed"] == 1 and out["deleted"] == 0
    assert svc.tables["users"][0]["purge_attempts"] == ahd.MAX_PURGE_ATTEMPTS
    out = ahd.hard_delete_expired_accounts(NOW + timedelta(days=99))
    assert out["eligible"] == 0 and out["abandoned"] == 1  # stops retrying, reported
    # once storage recovers an operator can reset attempts and the same row completes
    svc.storage = _Storage()
    svc.tables["users"][0]["purge_attempts"] = 0
    assert ahd.hard_delete_expired_accounts(NOW + timedelta(days=100))["deleted"] == 1

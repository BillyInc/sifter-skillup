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

import pytest

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
        # HAND-WRITTEN STUB: it parses only the exact string the hard-delete job
        # sends. It proves that string, not that PostgREST accepts it. Only the shape: "<col>.is.null,<col>.neq.<value>"
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

    off = 0

    def range(self, lo, hi):
        self.off, self.lim = lo, hi - lo + 1
        self.cols_checked = True
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
            hit = hit[self.off : self.off + self.lim]
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
    "first_name", "middle_name", "last_name", "display_name", "avatar_url", "guardian_consent_at",
)


def test_deletion_fields_clear_every_personal_identifier():
    fields = privacy.deletion_user_fields("u1", "dev-1", "t0", "t1")
    for key in PERSONAL_NULLED:
        assert key in fields and fields[key] is None, key
    assert fields["settings"] == {}  # also withdraws analytics consent stored in settings
    assert fields["username"] == "Deleted learner"
    assert fields["email"].endswith("@deleted.invalid")


def test_privy_did_is_kept_through_soft_delete_so_a_returning_user_stays_locked_out():
    fields = privacy.deletion_user_fields("u1", "dev-1", "t0", "t1")
    assert "privy_did" not in fields  # released only by the hard delete of the row


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
        "users": [{"id": u, "is_deleted": False, "guild_id": "g1"} for u in ("u2", "u3")],
    })
    out = ap.hard_delete_learner_content("u1")
    assert out["guilds"] == "transferred" and "blocked" not in out.values()
    assert svc.tables["guilds"] == [{"id": "g1", "owner_id": "u2"}]  # longest-standing other member


def _guild_users(**extra):
    users = [{"id": uid, "is_deleted": False, "claim_state": None, "guild_id": "g1"} for uid in ("u1", "u2", "u3", "u4")]
    for u in users:
        u.update(extra.get(u["id"], {}))
    return users


def _guild_tables(members, users):
    return {"guilds": [{"id": "g1", "owner_id": "u1"}], "guild_members": members, "users": users}


def test_a_deleted_or_unclaimed_member_never_inherits_the_guild(monkeypatch):
    svc = _purge_db(monkeypatch, tables=_guild_tables(
        [
            {"guild_id": "g1", "user_id": "u2", "joined_at": "2026-01-01"},  # deleted
            {"guild_id": "g1", "user_id": "u3", "joined_at": "2026-02-01"},  # unclaimed shell
            {"guild_id": "g1", "user_id": "u4", "joined_at": "2026-03-01"},
        ],
        _guild_users(u2={"is_deleted": True}, u3={"claim_state": "unclaimed"}),
    ))
    assert ap.hard_delete_learner_content("u1")["guilds"] == "transferred"
    assert svc.tables["guilds"][0]["owner_id"] == "u4"


def test_a_guild_whose_only_other_members_are_deleted_is_removed(monkeypatch):
    svc = _purge_db(monkeypatch, tables=_guild_tables(
        [{"guild_id": "g1", "user_id": "u2", "joined_at": "2026-01-01"}],
        _guild_users(u2={"is_deleted": True}, u3={"guild_id": None}, u4={"guild_id": None}),
    ))
    assert ap.hard_delete_learner_content("u1")["guilds"] == "deleted"
    assert svc.tables["guilds"] == []


def test_an_admin_member_is_preferred_over_an_older_member(monkeypatch):
    svc = _purge_db(monkeypatch, tables=_guild_tables(
        [
            {"guild_id": "g1", "user_id": "u2", "role": "member", "joined_at": "2026-01-01"},
            {"guild_id": "g1", "user_id": "u3", "role": "admin", "joined_at": "2026-05-01"},
        ],
        _guild_users(),
    ))
    ap.hard_delete_learner_content("u1")
    assert svc.tables["guilds"][0]["owner_id"] == "u3"


def test_real_membership_on_users_guild_id_keeps_the_guild(monkeypatch):
    # guild_members is not maintained by the app: the only member is on users.guild_id
    svc = _purge_db(monkeypatch, tables=_guild_tables([], _guild_users(u2={"guild_id": "g1"})))
    out = ap.hard_delete_learner_content("u1")
    assert out["guilds"] == "transferred"
    assert svc.tables["guilds"] == [{"id": "g1", "owner_id": "u2"}]


def test_a_deleted_user_on_guild_id_does_not_keep_the_guild(monkeypatch):
    _purge_db(monkeypatch, tables=_guild_tables(
        [], _guild_users(u2={"is_deleted": True}, u3={"guild_id": None}, u4={"guild_id": None})))
    assert ap.hard_delete_learner_content("u1")["guilds"] == "deleted"


def test_a_stale_guild_members_row_never_inherits_a_guild_the_user_left(monkeypatch):
    svc = _purge_db(monkeypatch, tables=_guild_tables(
        [
            # u2 is the longest-standing admin on paper but now belongs to another guild
            {"guild_id": "g1", "user_id": "u2", "role": "admin", "joined_at": "2026-01-01"},
            {"guild_id": "g1", "user_id": "u3", "role": "member", "joined_at": "2026-06-01"},
        ],
        _guild_users(u2={"guild_id": "g2"}, u4={"guild_id": None}),
    ))
    assert ap.hard_delete_learner_content("u1")["guilds"] == "transferred"
    assert svc.tables["guilds"][0]["owner_id"] == "u3"


def test_a_member_with_a_null_guild_id_is_not_an_heir_and_a_stale_only_guild_is_deleted(monkeypatch):
    svc = _purge_db(monkeypatch, tables=_guild_tables(
        [{"guild_id": "g1", "user_id": "u2", "role": "admin", "joined_at": "2026-01-01"}],
        _guild_users(u2={"guild_id": None}, u3={"guild_id": "g2"}, u4={"guild_id": None}),
    ))
    assert ap.hard_delete_learner_content("u1")["guilds"] == "deleted"
    assert svc.tables["guilds"] == []


def test_guild_members_is_only_a_tiebreak_between_real_members(monkeypatch):
    svc = _purge_db(monkeypatch, tables=_guild_tables(
        [{"guild_id": "g1", "user_id": "u4", "role": "admin", "joined_at": "2026-09-01"},
         {"guild_id": "g1", "user_id": "u3", "role": "member", "joined_at": "2026-01-01"}],
        _guild_users(u2={"guild_id": "g1"}, u3={"guild_id": "g1"}, u4={"guild_id": "g1"}),  # u2: no guild_members row
    ))
    ap.hard_delete_learner_content("u1")
    assert svc.tables["guilds"][0]["owner_id"] == "u4"  # admin first, among real members


def test_a_missing_guild_members_table_is_an_empty_member_list_not_a_retry_loop(monkeypatch):
    svc = _purge_db(monkeypatch, missing_tables={"guild_members"}, tables={
        "guilds": [{"id": "g1", "owner_id": "u1"}, {"id": "g2", "owner_id": "u1"}],
        "users": [{"id": "u2", "is_deleted": False, "claim_state": None, "guild_id": "g2"}],
    })
    out = ap.hard_delete_learner_content("u1")
    assert out["guilds"] == "deleted_and_transferred" and "error" not in out.values()
    assert [g["id"] for g in svc.tables["guilds"]] == ["g2"]  # g1 empty: deleted; g2 handed over
    assert svc.tables["guilds"][0]["owner_id"] == "u2"


def test_a_guild_with_more_than_one_page_of_members_is_still_handed_over(monkeypatch):
    # 1000 ineligible rows fill the first page; the live member is on the second.
    users = [{"id": f"d{i:04d}", "is_deleted": True, "claim_state": None, "guild_id": "g1"} for i in range(ap._MEMBER_PAGE)]
    users.append({"id": "z-live", "is_deleted": False, "claim_state": None, "guild_id": "g1"})
    svc = _purge_db(monkeypatch, tables={"guilds": [{"id": "g1", "owner_id": "u1"}], "users": users})
    assert ap.hard_delete_learner_content("u1")["guilds"] == "transferred"
    assert svc.tables["guilds"][0]["owner_id"] == "z-live"


def test_a_guild_whose_every_page_is_ineligible_up_to_the_cap_is_kept_and_reported_as_error(monkeypatch):
    monkeypatch.setattr(ap, "_MAX_GUILD_PAGES", 2)
    monkeypatch.setattr(ap, "_MEMBER_PAGE", 3)
    users = [{"id": f"d{i}", "is_deleted": True, "claim_state": None, "guild_id": "g1"} for i in range(6)]
    svc = _purge_db(monkeypatch, tables={"guilds": [{"id": "g1", "owner_id": "u1"}], "users": users})
    assert ap.hard_delete_learner_content("u1")["guilds"] == "error"  # the user row is kept, the guild too
    assert svc.tables["guilds"] == [{"id": "g1", "owner_id": "u1"}]


def test_an_admin_on_a_later_page_beats_an_ordinary_member_on_the_first(monkeypatch):
    monkeypatch.setattr(ap, "_MEMBER_PAGE", 3)
    users = [{"id": f"u{i}", "is_deleted": False, "claim_state": None, "guild_id": "g1"} for i in range(2, 9)]
    svc = _purge_db(monkeypatch, tables=_guild_tables(
        [{"guild_id": "g1", "user_id": "u8", "role": "admin", "joined_at": "2026-09-01"},
         {"guild_id": "g1", "user_id": "u2", "role": "member", "joined_at": "2026-01-01"}], users))
    assert ap.hard_delete_learner_content("u1")["guilds"] == "transferred"
    assert svc.tables["guilds"][0]["owner_id"] == "u8"  # page 3, admin


def test_a_member_scan_that_hits_the_cap_keeps_the_guild_even_with_eligible_members(monkeypatch):
    monkeypatch.setattr(ap, "_MAX_GUILD_PAGES", 2)
    monkeypatch.setattr(ap, "_MEMBER_PAGE", 3)
    users = [{"id": f"u{i}", "is_deleted": False, "claim_state": None, "guild_id": "g1"} for i in range(2, 9)]
    svc = _purge_db(monkeypatch, tables=_guild_tables([], users))
    assert ap.hard_delete_learner_content("u1")["guilds"] == "error"
    assert svc.tables["guilds"] == [{"id": "g1", "owner_id": "u1"}]


def test_transfer_is_reported_only_if_the_update_matched_a_row(monkeypatch):
    svc = _purge_db(monkeypatch, tables=_guild_tables(
        [{"guild_id": "g1", "user_id": "u2", "joined_at": "2026-01-01"}], _guild_users()))
    orig_table = svc.table

    def table(name):
        q = orig_table(name)
        if name == "guilds" and q.mode == "select":
            orig_update = q.update

            def update(row):  # ownership moved between the read and the write
                svc.tables["guilds"][0]["owner_id"] = "someone-else"
                return orig_update(row)
            q.update = update
        return q
    monkeypatch.setattr(svc, "table", table)
    assert ap._purge_owned_guilds(svc, "u1") == "clear"
    assert svc.tables["guilds"][0]["owner_id"] == "someone-else"



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
    def __init__(self, fail=False, fail_paths=(), objects=(), fail_list=False):
        self.removed, self.fail, self.fail_paths = [], fail, set(fail_paths)
        self.objects, self.fail_list = list(objects), fail_list  # objects with no row
        self.list_calls = []

    def _entries(self, prefix):
        # Models Supabase list(): direct children only; a nested path comes back as a
        # folder entry with a null id, a file with an id. Not verified against a real bucket.
        out, seen = [], set()
        for o in self.objects:
            if not o.startswith(prefix + "/") or o in self.removed:
                continue
            rest = o[len(prefix) + 1:]
            head = rest.split("/")[0]
            if head in seen:
                continue
            seen.add(head)
            out.append({"name": head, "id": None} if "/" in rest else {"name": head, "id": "id-" + head})
        return out

    def list(self, prefix, options=None):
        self.list_calls.append(prefix)
        if self.fail_list:
            raise RuntimeError(self.fail_list if isinstance(self.fail_list, str) else "storage list down")
        o = options or {}
        return self._entries(prefix)[o.get("offset", 0): o.get("offset", 0) + o.get("limit", 100)]

    def from_(self, bucket):
        assert bucket == "verification-proofs"
        return self

    def remove(self, paths):
        if self.fail:
            raise RuntimeError("storage down")
        if self.fail_paths & set(paths):
            raise RuntimeError("storage rejected a file")
        self.removed += list(paths)


def _with_storage(svc, storage):
    svc.storage = storage
    return svc


def test_verification_proof_files_and_rows_are_purged(monkeypatch):
    svc = _purge_db(monkeypatch, tables={"institution_verification_submissions": [
        {"id": "v1", "school_id": "org", "submitted_by": "u1", "storage_path": "org/u1/a.pdf"},
        {"id": "v2", "school_id": "org", "submitted_by": "u1", "storage_path": "org/u1/b.png"},
        {"id": "v3", "school_id": "org", "submitted_by": "u2", "storage_path": "org/u2/c.pdf"},
    ]})
    storage = _with_storage(svc, _Storage()).storage
    out = ap.hard_delete_learner_content("u1")
    assert out["institution_verification_submissions"] == "deleted"
    assert sorted(storage.removed) == ["org/u1/a.pdf", "org/u1/b.png"]
    assert [r["id"] for r in svc.tables["institution_verification_submissions"]] == ["v3"]


def test_a_storage_failure_keeps_the_submission_rows_for_a_retry(monkeypatch):
    svc = _purge_db(monkeypatch, tables={"institution_verification_submissions": [
        {"id": "v1", "school_id": "org", "submitted_by": "u1", "storage_path": "org/u1/a.pdf"}]})
    _with_storage(svc, _Storage(fail=True))
    out = ap.hard_delete_learner_content("u1")
    assert out["institution_verification_submissions"] == "error"
    assert len(svc.tables["institution_verification_submissions"]) == 1


def test_a_proof_path_outside_the_server_built_shape_is_never_removed(monkeypatch):
    rows = [
        {"id": "ok", "school_id": "org", "submitted_by": "u1", "storage_path": "org/u1/a.pdf"},
        {"id": "other-user", "school_id": "org", "submitted_by": "u1", "storage_path": "org/u2/b.pdf"},
        {"id": "other-school", "school_id": "org", "submitted_by": "u1", "storage_path": "evil/u1/c.pdf"},
        {"id": "traversal", "school_id": "org", "submitted_by": "u1", "storage_path": "../org/u1/d.pdf"},
        {"id": "no-school", "school_id": None, "submitted_by": "u1", "storage_path": "org/u1/e.pdf"},
    ]
    svc = _purge_db(monkeypatch, tables={"institution_verification_submissions": rows})
    storage = _with_storage(svc, _Storage()).storage
    out = ap.hard_delete_learner_content("u1")
    assert out["institution_verification_submissions"] == "error"
    assert storage.removed == ["org/u1/a.pdf"]  # only the conforming path
    # the conforming row's file is gone so it is deleted; the four odd rows stay for review
    assert sorted(r["id"] for r in svc.tables["institution_verification_submissions"]) == [
        "no-school", "other-school", "other-user", "traversal"]


def test_more_than_one_page_of_submissions_all_files_and_rows_are_purged(monkeypatch):
    n = ap._MEMBER_PAGE + 5
    rows = [{"id": f"v{i:05d}", "school_id": "org", "submitted_by": "u1", "storage_path": f"org/u1/{i}.pdf"}
            for i in range(n)]
    rows.append({"id": "keep", "school_id": "org", "submitted_by": "u2", "storage_path": "org/u2/x.pdf"})
    svc = _purge_db(monkeypatch, tables={"institution_verification_submissions": rows})
    storage = _with_storage(svc, _Storage()).storage
    out = ap.hard_delete_learner_content("u1")
    assert out["institution_verification_submissions"] == "deleted"
    assert len(storage.removed) == n and len(set(storage.removed)) == n
    assert [r["id"] for r in svc.tables["institution_verification_submissions"]] == ["keep"]
    assert ap.hard_delete_learner_content("u1")["institution_verification_submissions"] == "clear"


def test_one_failing_file_keeps_only_its_row_and_blocks(monkeypatch):
    rows = [{"id": f"v{i}", "school_id": "org", "submitted_by": "u1", "storage_path": f"org/u1/{i}.pdf"}
            for i in range(3)]
    svc = _purge_db(monkeypatch, tables={"institution_verification_submissions": rows})
    storage = _with_storage(svc, _Storage(fail_paths={"org/u1/1.pdf"})).storage
    out = ap.hard_delete_learner_content("u1")
    assert out["institution_verification_submissions"] == "error"
    assert sorted(storage.removed) == ["org/u1/0.pdf", "org/u1/2.pdf"]
    assert [r["id"] for r in svc.tables["institution_verification_submissions"]] == ["v1"]
    storage.fail_paths.clear()  # retry succeeds
    assert ap.hard_delete_learner_content("u1")["institution_verification_submissions"] == "deleted"
    assert svc.tables["institution_verification_submissions"] == []


def test_submission_scan_cap_deletes_nothing(monkeypatch):
    monkeypatch.setattr(ap, "_MAX_GUILD_PAGES", 2)
    monkeypatch.setattr(ap, "_MEMBER_PAGE", 3)
    rows = [{"id": f"v{i}", "school_id": "org", "submitted_by": "u1", "storage_path": f"org/u1/{i}.pdf"}
            for i in range(6)]
    svc = _purge_db(monkeypatch, tables={"institution_verification_submissions": rows})
    storage = _with_storage(svc, _Storage()).storage
    assert ap.hard_delete_learner_content("u1")["institution_verification_submissions"] == "error"
    assert storage.removed == [] and len(svc.tables["institution_verification_submissions"]) == 6


def test_a_proof_object_with_no_row_is_found_by_prefix_and_removed(monkeypatch):
    # the upload succeeded, the insert failed and the route's own cleanup failed too
    svc = _purge_db(monkeypatch, tables={
        "institution_members": [{"id": "im1", "user_id": "u1", "school_id": "org", "role": "owner",
                                 "seat_status": "revoked"}],
        "student_affiliations": [{"id": "sa1", "student_id": "u1", "school_id": "org2"}],
    })
    storage = _with_storage(svc, _Storage(objects=["org/u1/orphan.pdf", "org2/u1/o2.pdf", "org/u2/other.pdf"])).storage
    out = ap.hard_delete_learner_content("u1")
    assert out["institution_verification_submissions"] == "deleted"
    # never another user's prefix, and never a school the user was merely affiliated with
    assert storage.removed == ["org/u1/orphan.pdf"]
    assert storage.list_calls == ["org/u1"]
    assert ap.hard_delete_learner_content("u1")["institution_verification_submissions"] == "clear"


def test_a_failed_prefix_listing_is_an_error_so_the_user_row_is_kept(monkeypatch):
    svc = _purge_db(monkeypatch, tables={"institution_members": [
        {"id": "im1", "user_id": "u1", "school_id": "org", "role": "admin"}]})
    _with_storage(svc, _Storage(fail_list=True))
    assert ap.hard_delete_learner_content("u1")["institution_verification_submissions"] == "error"


def test_a_user_with_no_school_and_no_rows_never_touches_storage(monkeypatch):
    svc = _purge_db(monkeypatch, tables={})
    svc.storage = None  # any storage access would raise
    assert ap.hard_delete_learner_content("u1")["institution_verification_submissions"] == "clear"


def test_traversal_empty_segment_and_backslash_paths_are_rejected_even_after_a_valid_prefix(monkeypatch):
    bad = ["org/u1/../u2/x.pdf", "org/u1//x.pdf", "org/u1/a\\b.pdf"]
    rows = [{"id": f"b{i}", "school_id": "org", "submitted_by": "u1", "storage_path": p} for i, p in enumerate(bad)]
    rows.append({"id": "ok", "school_id": "org", "submitted_by": "u1", "storage_path": "org/u1/fine.pdf"})
    svc = _purge_db(monkeypatch, tables={"institution_verification_submissions": rows})
    storage = _with_storage(svc, _Storage()).storage
    out = ap.hard_delete_learner_content("u1")
    assert out["institution_verification_submissions"] == "error"
    assert storage.removed == ["org/u1/fine.pdf"]
    assert sorted(r["id"] for r in svc.tables["institution_verification_submissions"]) == ["b0", "b1", "b2"]


def test_a_leftover_avatar_is_removed_by_the_hard_delete_purge(monkeypatch):
    import avatar_storage

    _purge_db(monkeypatch, tables={})
    store = avatar_storage.InMemoryAvatarStorage()
    store.objects.update({"u1/a.webp": b"x", "u1/b.webp": b"x", "u2/c.webp": b"x"})
    avatar_storage.set_storage(store)
    assert ap.hard_delete_learner_content("u1")["avatars"] == "deleted"
    assert list(store.objects) == ["u2/c.webp"]  # another user's photo untouched
    assert ap.hard_delete_learner_content("u1")["avatars"] == "clear"


def test_an_avatar_removal_failure_is_an_error_not_clear(monkeypatch):
    import avatar_storage

    _purge_db(monkeypatch, tables={})
    store = avatar_storage.InMemoryAvatarStorage()
    store.objects["u1/a.webp"] = b"x"
    store.delete = lambda keys: (_ for _ in ()).throw(RuntimeError("storage down"))
    avatar_storage.set_storage(store)
    assert ap.hard_delete_learner_content("u1")["avatars"] == "error"


def test_a_missing_avatar_bucket_counts_as_clear(monkeypatch):
    import avatar_storage

    _purge_db(monkeypatch, tables={})

    class _NoBucket(avatar_storage.InMemoryAvatarStorage):
        def list_keys(self, user_id):
            raise RuntimeError("Bucket not found")

    avatar_storage.set_storage(_NoBucket())
    assert ap.hard_delete_learner_content("u1")["avatars"] == "clear"


def test_a_storage_client_that_cannot_be_built_is_an_error_not_clear(monkeypatch):
    # get_storage() never raises (lazy adapter): a broken client fails in list_keys.
    import avatar_storage

    _purge_db(monkeypatch, tables={})

    class _Broken(avatar_storage.InMemoryAvatarStorage):
        def list_keys(self, user_id):
            raise RuntimeError("supabase not configured")

    avatar_storage.set_storage(_Broken())
    assert ap.hard_delete_learner_content("u1")["avatars"] == "error"


def test_more_than_a_page_of_collections_is_read_in_pages_and_deleted_in_chunks(monkeypatch):
    # NOTE on the fake: it does not enforce PostgREST's 1000-row cap or URL length,
    # so this proves the paging/chunking shape (range() used, bounded in.() lists),
    # not the real server limits.
    n = ap._MEMBER_PAGE + 250
    svc = _purge_db(monkeypatch, tables={
        "collections": [{"id": f"c{i:05d}", "user_id": "u1"} for i in range(n)] + [{"id": "cx", "user_id": "u2"}],
        "collection_items": [{"id": f"i{i}", "collection_id": f"c{i:05d}"} for i in range(n)]
        + [{"id": "ix", "collection_id": "cx"}],
    })
    out = ap.hard_delete_learner_content("u1")
    assert out["collections"] == "deleted"
    assert [r["id"] for r in svc.tables["collections"]] == ["cx"]
    assert [r["id"] for r in svc.tables["collection_items"]] == ["ix"]
    sizes = [len(v) for name, mode, filters, _o in svc.calls if name == "collection_items" and mode == "delete"
             for op, _c, v in filters if op == "in"]
    assert sizes and max(sizes) <= ap._IN_CHUNK and sum(sizes) == n


def test_collections_scan_that_hits_the_page_cap_fails_closed(monkeypatch):
    monkeypatch.setattr(ap, "_MAX_GUILD_PAGES", 2)
    monkeypatch.setattr(ap, "_MEMBER_PAGE", 3)
    svc = _purge_db(monkeypatch, tables={"collections": [{"id": f"c{i}", "user_id": "u1"} for i in range(6)]})
    assert ap.hard_delete_learner_content("u1")["collections"] == "error"
    assert len(svc.tables["collections"]) == 6


def test_guild_outcome_reports_both_deleted_and_transferred_when_both_happen(monkeypatch):
    svc = _purge_db(monkeypatch, tables={
        "guilds": [{"id": "g1", "owner_id": "u1"}, {"id": "g2", "owner_id": "u1"}],
        "users": [{"id": "u2", "is_deleted": False, "guild_id": "g1"}],
    })
    assert ap.hard_delete_learner_content("u1")["guilds"] == "deleted_and_transferred"
    assert svc.tables["guilds"] == [{"id": "g1", "owner_id": "u2"}]


def test_owned_guilds_are_read_in_pages(monkeypatch):
    monkeypatch.setattr(ap, "_MEMBER_PAGE", 2)
    svc = _purge_db(monkeypatch, tables={"guilds": [{"id": f"g{i}", "owner_id": "u1"} for i in range(5)]})
    assert ap.hard_delete_learner_content("u1")["guilds"] == "deleted" and svc.tables["guilds"] == []
    monkeypatch.setattr(ap, "_MAX_GUILD_PAGES", 2)
    svc = _purge_db(monkeypatch, tables={"guilds": [{"id": f"g{i}", "owner_id": "u1"} for i in range(5)]})
    assert ap.hard_delete_learner_content("u1")["guilds"] == "error" and len(svc.tables["guilds"]) == 5


def test_an_account_that_uses_its_last_attempt_is_logged_at_error_once_with_failing_steps(monkeypatch):
    svc = _real_purge_job(
        monkeypatch, [_u("u1", 90, purge_attempts=ahd.MAX_PURGE_ATTEMPTS - 1)],
        {"institution_verification_submissions": [{"id": "v1", "school_id": "o", "submitted_by": "u1", "storage_path": "o/u1/p"}]},
    )
    svc.storage = _Storage(fail=True)
    errors = []
    monkeypatch.setattr(ahd.log, "error", lambda msg, **kw: errors.append((msg, kw)))
    ahd.hard_delete_expired_accounts(NOW)
    assert len(errors) == 1
    assert errors[0][1]["user_id"] == "u1" and errors[0][1]["failing_steps"] == ["institution_verification_submissions"]
    ahd.hard_delete_expired_accounts(NOW + timedelta(days=1))  # now abandoned: not retried, not re-logged
    assert len(errors) == 1


# --- school-side copies of a claimed (possibly minor) learner's identity -----

def test_claimed_minor_drafts_are_scrubbed_and_pending_candidates_deleted(monkeypatch):
    svc = _purge_db(monkeypatch, tables={
        "student_provision_drafts": [
            {"id": "d1", "generated_user_id": "u1", "full_name": "Ada", "guardian_name": "Mum",
             "student_class": "SS2", "stream": "science", "guardian_consent": True, "status": "generated"},
            {"id": "d2", "generated_user_id": "u2", "full_name": "Bola", "status": "generated"},
            {"id": "d3", "generated_user_id": None, "full_name": "Chi", "status": "draft"},
        ],
        "student_merge_candidates": [
            {"id": "m1", "provisioned_student_id": "u1", "real_student_id": "u9", "status": "pending"},
            {"id": "m3", "provisioned_student_id": "u2", "real_student_id": "u3", "status": "pending"},
        ],
    })
    out = ap.hard_delete_learner_content("u1")
    assert out["student_provision_drafts"] == "scrubbed" and out["student_merge_candidates"] == "scrubbed"
    # the draft row stays (generate skips status != 'draft'), with no personal field left
    d1 = [r for r in svc.tables["student_provision_drafts"] if r["id"] == "d1"][0]
    assert d1["status"] == "generated" and d1["generated_user_id"] is None
    assert d1["full_name"] is None and d1["guardian_name"] is None
    assert d1["student_class"] is None and d1["stream"] is None and d1["guardian_consent"] is False
    untouched = {r["id"]: r for r in svc.tables["student_provision_drafts"]}
    assert untouched["d2"]["full_name"] == "Bola" and untouched["d3"]["full_name"] == "Chi"
    assert [r["id"] for r in svc.tables["student_merge_candidates"]] == ["m3"]
    again = ap.hard_delete_learner_content("u1")  # idempotent
    assert again["student_provision_drafts"] == "clear" and again["student_merge_candidates"] == "clear"


def test_confirmed_and_dismissed_merge_candidates_keep_the_decision_but_lose_the_identity(monkeypatch):
    snap = {"id": "x", "username": "Ada", "email": "ada@example.com", "phone": "080"}
    rows = [
        {"id": "m1", "provisioned_student_id": "u1", "real_student_id": "u9", "status": "confirmed",
         "match_key": "email:ada@example.com", "provisioned_snapshot": snap, "real_snapshot": snap,
         "evidence": {"deterministic": True}, "confirmed_by": "admin"},
        {"id": "m2", "provisioned_student_id": "u8", "real_student_id": "u1", "status": "dismissed",
         "match_key": "phone:080", "provisioned_snapshot": snap, "real_snapshot": snap,
         "evidence": {"k": 1}, "dismissed_by": "admin"},
        {"id": "m3", "provisioned_student_id": "u1", "real_student_id": "u9", "status": "pending", "match_key": "k"},
        {"id": "m4", "provisioned_student_id": "u8", "real_student_id": "u9", "status": "confirmed",
         "match_key": "name:bola", "provisioned_snapshot": snap},
    ]
    svc = _purge_db(monkeypatch, tables={"student_merge_candidates": rows})
    out = ap.hard_delete_learner_content("u1")
    assert out["student_merge_candidates"] == "scrubbed"
    by = {r["id"]: r for r in svc.tables["student_merge_candidates"]}
    assert set(by) == {"m1", "m2", "m4"}  # pending m3 deleted, decided rows kept
    assert by["m1"]["status"] == "confirmed" and by["m1"]["confirmed_by"] == "admin"
    assert by["m1"]["provisioned_student_id"] is None and by["m1"]["real_student_id"] == "u9"
    assert by["m2"]["status"] == "dismissed" and by["m2"]["real_student_id"] is None
    assert by["m2"]["provisioned_student_id"] == "u8"  # the counterpart's column is kept
    for k in ("m1", "m2"):
        assert by[k]["provisioned_snapshot"] == {} and by[k]["real_snapshot"] == {} and by[k]["evidence"] == {}
        assert by[k]["match_key"] == "scrubbed"
        assert "ada@example.com" not in repr(by[k]) and "080" not in repr(by[k])
    assert by["m4"]["provisioned_snapshot"] == snap  # an unrelated row is untouched
    assert ap.hard_delete_learner_content("u1")["student_merge_candidates"] == "clear"


def test_missing_school_tables_or_columns_count_as_clear(monkeypatch):
    _purge_db(monkeypatch, missing_tables={"student_provision_drafts"},
              missing_columns={"student_merge_candidates": {"real_student_id"}},
              tables={"student_merge_candidates": [
                  {"id": "m1", "provisioned_student_id": "u1", "status": "pending"}]})
    out = ap.hard_delete_learner_content("u1")
    assert out["student_provision_drafts"] == "missing_table"
    assert out["student_merge_candidates"] == "scrubbed"


def test_a_user_with_every_blocker_gets_a_clean_purge_and_the_row_can_go(monkeypatch):
    svc = _purge_db(monkeypatch, tables={
        "notifications": [{"id": "n1", "recipient_id": "u2", "actor_id": "u1"}],
        "guilds": [{"id": "g1", "owner_id": "u1"}],
        "guild_members": [{"guild_id": "g1", "user_id": "u1"}],
        "institution_verification_submissions": [
            {"id": "v1", "school_id": "org", "submitted_by": "u1", "storage_path": "org/u1/p"}],
        "student_provision_drafts": [{"id": "d1", "generated_user_id": "u1", "full_name": "Ada"}],
        "student_merge_candidates": [{"id": "m1", "real_student_id": "u1", "status": "pending"}],
    })
    storage = _with_storage(svc, _Storage()).storage
    out = ap.hard_delete_learner_content("u1")
    assert not any(v in ahd._BLOCKING_OUTCOMES for v in out.values()), out
    assert svc.tables["notifications"] == [] and svc.tables["guilds"] == []
    assert svc.tables["institution_verification_submissions"] == [] and storage.removed == ["org/u1/p"]
    assert svc.tables["student_provision_drafts"][0]["full_name"] is None
    assert svc.tables["student_merge_candidates"] == []


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
        monkeypatch, [_u("u1", 90), _u("u2", 1, is_deleted=False, guild_id="g1")],
        {"notifications": [{"id": "n1", "recipient_id": "u2", "actor_id": "u1"}],
         "guilds": [{"id": "g1", "owner_id": "u1"}],
         "guild_members": [{"guild_id": "g1", "user_id": "u1", "joined_at": "1"},
                           {"guild_id": "g1", "user_id": "u2", "joined_at": "2"}]},
    )
    out = ahd.hard_delete_expired_accounts(NOW)
    assert out["deleted"] == 1 and out["failed"] == 0 and out["blocked"] == {}
    assert [r["id"] for r in svc.tables["users"]] == ["u2"] and svc.tables["notifications"] == []
    assert svc.tables["guilds"][0]["owner_id"] == "u2"


def test_a_provisioned_minor_who_claimed_and_deleted_is_purged_with_proof_files(monkeypatch):
    svc = _real_purge_job(
        monkeypatch,
        [_u("minor", 90, provisioning_school_id="s1", claim_state="claimed", provenance="provisioned")],
        {"saved_items": [{"id": "s1", "user_id": "minor"}],
         "institution_verification_submissions": [{"id": "v1", "school_id": "o", "submitted_by": "minor",
                                                       "storage_path": "o/minor/x.pdf"}],
         "student_provision_drafts": [{"id": "d1", "generated_user_id": "minor", "full_name": "Ada", "guardian_name": "Mum"}],
         "student_merge_candidates": [{"id": "m1", "provisioned_student_id": "minor", "real_student_id": "other",
                                       "provisioned_snapshot": {"name": "Ada"}, "status": "pending"}]},
    )
    out = ahd.hard_delete_expired_accounts(NOW)
    assert out["deleted"] == 1 and svc.tables["users"] == []
    assert svc.tables["saved_items"] == [] and svc.storage.removed == ["o/minor/x.pdf"]
    # the school-side copies of the minor's identity go with the account
    assert svc.tables["student_provision_drafts"][0]["full_name"] is None
    assert svc.tables["student_merge_candidates"] == []
    assert svc.tables["institution_verification_submissions"] == []


def test_a_persistent_failure_is_retried_then_abandoned_with_pii_intact(monkeypatch):
    svc = _real_purge_job(
        monkeypatch, [_u("u1", 90)],
        {"institution_verification_submissions": [{"id": "v1", "school_id": "o", "submitted_by": "u1", "storage_path": "o/u1/p"}]},
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


# --- hard-delete foreign-key migrations (PR #326) ------------------------------

def test_hard_delete_fk_migrations_add_not_valid_then_validate_separately():
    from pathlib import Path

    from migrate import manifest as mf

    backend = Path(__file__).resolve().parents[1]
    first = (backend / "migration_hard_delete_fk_2026-11-27.sql").read_text()
    second = (backend / "migration_hard_delete_fk_validate_2026-11-27.sql").read_text()

    # the first file must not scan tables while it holds the DROP CONSTRAINT lock
    assert "ON DELETE SET NULL NOT VALID" in first
    assert "VALIDATE CONSTRAINT" not in first.split("BEGIN;", 1)[1]

    # the second exists, is prepared not applied, and only validates unvalidated keys
    assert second.lstrip().startswith("-- PROPOSED, NOT APPLIED")
    body = second.split("BEGIN;", 1)[1]
    assert "VALIDATE CONSTRAINT" in body and "NOT c.convalidated" in body
    assert "DROP " not in body and "DELETE " not in body

    entries = {e.id: e for e in mf.load_manifest(backend / "migrate" / "manifest.toml").entries}
    entry = entries["migration_hard_delete_fk_validate_2026-11-27"]
    assert entry.path == "migration_hard_delete_fk_validate_2026-11-27.sql"
    assert "migration_hard_delete_fk_2026-11-27" in entry.requires


def test_hard_delete_migrations_set_a_lock_timeout_inside_the_transaction_before_any_ddl():
    # Structural check of the SQL text only (no database is available in the unit
    # suite). The proof that both files run, and run twice, is the scratch
    # PostgreSQL 16 run recorded in the PR notes.
    import re
    from pathlib import Path

    backend = Path(__file__).resolve().parents[1]
    for name in ("migration_hard_delete_fk_2026-11-27.sql", "migration_hard_delete_fk_validate_2026-11-27.sql"):
        sql = re.sub(r"--[^\n]*", "", (backend / name).read_text())
        begin = sql.index("BEGIN;")
        lock = sql.index("SET LOCAL lock_timeout = '5s';")
        ddl = min(i for i in (sql.find("ALTER TABLE"), sql.find("DO $$")) if i != -1)
        assert begin < lock < ddl, name
        assert sql.count("BEGIN;") == 1 and sql.count("COMMIT;") == 1, name
        assert "statement_timeout" not in sql, name


# --- PR #326 re-review: avatar convergence, proof listing scope, folders, ids -----

def test_an_avatar_listing_that_never_empties_is_an_error_after_one_repeat_and_logs_keys(monkeypatch):
    import avatar_storage

    _purge_db(monkeypatch, tables={})
    logged = []
    monkeypatch.setattr(ap.log, "warning", lambda msg, **kw: logged.append((msg, kw)))

    class _Sticky(avatar_storage.InMemoryAvatarStorage):
        deletes = 0

        def list_keys(self, user_id):
            return [f"{user_id}/stuck.webp"]

        def delete(self, keys):
            self.deletes += 1  # accepted but the object stays

    store = _Sticky()
    avatar_storage.set_storage(store)
    assert ap.hard_delete_learner_content("u1")["avatars"] == "error"
    assert store.deletes == 1  # second identical listing stops the loop; no 20 retries
    assert ("Avatar purge made no progress", {"keys": ["u1/stuck.webp"], "count": 1}) in logged


def test_supabase_avatar_listing_skips_folder_entries(monkeypatch):
    import avatar_storage

    class _Bucket:
        def list(self, prefix):
            return [{"name": "a.webp", "id": "i1"}, {"name": "sub", "id": None}]

    store = avatar_storage.SupabaseAvatarStorage()
    monkeypatch.setattr(store, "_bucket", lambda: _Bucket())
    assert store.list_keys("u1") == ["u1/a.webp"]


def test_a_learner_only_affiliated_with_a_school_never_lists_the_proof_bucket(monkeypatch):
    svc = _purge_db(monkeypatch, tables={
        "student_affiliations": [{"id": "sa1", "student_id": "u1", "school_id": "org"}],
        "institution_members": [{"id": "im1", "user_id": "u1", "school_id": "org3", "role": "student",
                                 "seat_status": "active"}],
    })
    svc.storage = None  # any storage access would raise
    assert ap.hard_delete_learner_content("u1")["institution_verification_submissions"] == "clear"


def test_a_storage_outage_does_not_block_a_learner_who_could_not_upload(monkeypatch):
    svc = _purge_db(monkeypatch, tables={"student_affiliations": [{"id": "sa1", "student_id": "u1", "school_id": "org"}]})
    _with_storage(svc, _Storage(fail_list="403 Forbidden"))
    assert ap.hard_delete_learner_content("u1")["institution_verification_submissions"] == "clear"


@pytest.mark.parametrize("member", [
    {"role": "owner", "seat_status": "active"},
    {"role": "institution_admin", "seat_status": "suspended"},
    {"role": "educator", "seat_status": "invited"},  # a pending claimant can submit proof
])
def test_a_seat_that_could_upload_is_listed_and_a_listing_failure_blocks(monkeypatch, member):
    svc = _purge_db(monkeypatch, tables={"institution_members": [
        {"id": "im1", "user_id": "u1", "school_id": "org", **member}]})
    storage = _with_storage(svc, _Storage(objects=["org/u1/p.pdf"])).storage
    assert ap.hard_delete_learner_content("u1")["institution_verification_submissions"] == "deleted"
    assert storage.list_calls == ["org/u1"]
    storage.fail_list = "503 Service Unavailable"
    assert ap.hard_delete_learner_content("u1")["institution_verification_submissions"] == "error"


def test_the_submission_rows_school_is_listed_even_without_a_seat(monkeypatch):
    svc = _purge_db(monkeypatch, tables={"institution_verification_submissions": [
        {"id": "v1", "school_id": "org", "submitted_by": "u1", "storage_path": None}]})
    storage = _with_storage(svc, _Storage(objects=["org/u1/o.pdf"])).storage
    assert ap.hard_delete_learner_content("u1")["institution_verification_submissions"] == "deleted"
    assert storage.removed == ["org/u1/o.pdf"]


def test_the_proof_roles_match_the_route_that_accepts_uploads():
    import routes.institutions_routes as ir

    assert ap._PROOF_SUBMIT_ROLES == ir._ADMIN_ROLES
    assert ap._PENDING_SEAT == ir._PENDING_SEAT


@pytest.mark.parametrize("message", [
    "Bucket not found", "The related resource does not exist", "404 Not Found", "No such bucket", "not_found",
])
def test_bucket_missing_variants_are_recognised(message):
    assert ap._is_bucket_missing(RuntimeError(message))
    assert not ap._is_bucket_missing(RuntimeError("403 Forbidden"))
    assert not ap._is_bucket_missing(RuntimeError("503 Service Unavailable"))


def test_folders_in_a_proof_prefix_are_followed_and_never_reported_as_removed_objects(monkeypatch):
    svc = _purge_db(monkeypatch, tables={"institution_members": [
        {"id": "im1", "user_id": "u1", "school_id": "org", "role": "owner"}]})
    storage = _with_storage(svc, _Storage(objects=["org/u1/a.pdf", "org/u1/sub/b.pdf", "org/u1/sub/deeper/c.pdf"])).storage
    out = ap.hard_delete_learner_content("u1")
    assert out["institution_verification_submissions"] == "deleted"
    assert sorted(storage.removed) == ["org/u1/a.pdf", "org/u1/sub/b.pdf", "org/u1/sub/deeper/c.pdf"]
    assert not any(k in storage.removed for k in ("org/u1/sub", "org/u1/sub/deeper"))


def test_a_folder_only_prefix_removes_nothing_and_is_not_reported_deleted(monkeypatch):
    class _OnlyFolder(_Storage):
        def _entries(self, prefix):
            return [{"name": "ghost", "id": None}] if prefix == "org/u1" else []

    svc = _purge_db(monkeypatch, tables={"institution_members": [
        {"id": "im1", "user_id": "u1", "school_id": "org", "role": "owner"}]})
    storage = _with_storage(svc, _OnlyFolder()).storage
    assert ap.hard_delete_learner_content("u1")["institution_verification_submissions"] == "clear"
    assert storage.removed == []


def test_folder_nesting_beyond_the_bound_fails_closed(monkeypatch):
    deep = "/".join(["org/u1"] + ["d"] * (ap._MAX_PREFIX_DEPTH + 2) + ["x.pdf"])
    svc = _purge_db(monkeypatch, tables={"institution_members": [
        {"id": "im1", "user_id": "u1", "school_id": "org", "role": "owner"}]})
    storage = _with_storage(svc, _Storage(objects=[deep])).storage
    assert ap.hard_delete_learner_content("u1")["institution_verification_submissions"] == "error"
    assert storage.removed == []


@pytest.mark.parametrize("bad", ["", "   ", None, 7, "a/b", "..", "a\\b"])
def test_an_invalid_user_id_never_reaches_the_database_or_storage(monkeypatch, bad):
    import avatar_storage

    svc = _purge_db(monkeypatch, tables={})
    svc.storage = None
    store = avatar_storage.InMemoryAvatarStorage()
    store.list_keys = lambda uid: (_ for _ in ()).throw(AssertionError("storage touched"))
    avatar_storage.set_storage(store)
    out = ap.hard_delete_learner_content(bad)
    assert set(out.values()) == {"error"} and svc.calls == []


def test_an_empty_id_is_refused_by_the_prefix_lister_and_the_avatar_adapter():
    with pytest.raises(ValueError):
        ap._list_prefix(_Storage(), "")
    with pytest.raises(ValueError):
        ap._list_prefix(_Storage(), "/u1")
    with pytest.raises(ValueError):
        ap._list_prefix(_Storage(), "org/")
    import avatar_storage

    with pytest.raises(ValueError):
        avatar_storage.SupabaseAvatarStorage().list_keys("")


def test_an_empty_school_id_on_a_member_row_is_skipped_not_listed(monkeypatch):
    svc = _purge_db(monkeypatch, tables={"institution_members": [
        {"id": "im1", "user_id": "u1", "school_id": "a/b", "role": "owner"}]})
    storage = _with_storage(svc, _Storage()).storage
    ap.hard_delete_learner_content("u1")
    assert storage.list_calls == []

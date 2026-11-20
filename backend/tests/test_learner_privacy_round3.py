"""Final review round of the learner-privacy PR (minor findings).

4  soft delete withdraws analytics consent through the users row, which fires the DB trigger
   that clears the learner's current-selection snapshot
5  delete_me soft-deletes first and writes the cooldown row afterwards, once
6  PGRST204 (missing column) counts as a missing table only when the message names the table
7  the purge logs only the exception type and the table, never raw exception text
8  the hard-delete result reports blocked and abandoned counts
"""
import asyncio

import pytest
from fastapi import HTTPException

import account_hard_delete as ahd
import account_purge as ap
import privacy
from tests.test_learner_privacy import FakeSvc, _run_delete_me, _hd_setup


# --- 4 ------------------------------------------------------------------------

def test_soft_delete_resets_settings_and_flags_the_row_so_the_consent_trigger_fires():
    fields = privacy.deletion_user_fields("u1", "dev", "2026-01-01T00:00:00", "2026-01-02T00:00:00")
    assert fields["is_deleted"] is True
    assert fields["settings"] == {}


def test_migration_trigger_fires_on_the_columns_soft_delete_changes():
    import pathlib
    sql = (pathlib.Path(__file__).resolve().parents[1]
           / "migration_learning_interest_current_selections_2026-10-28.sql").read_text()
    assert "trg_clear_learning_interest_snapshot_on_consent_change" in sql
    assert "is_deleted" in sql and "settings" in sql


# --- 5 ------------------------------------------------------------------------

def test_cooldown_row_is_written_after_the_soft_delete(monkeypatch):
    svc, _ = _run_delete_me(monkeypatch)
    order = [(t, m) for t, m, *_ in svc.writes if (t, m) in (("users", "update"), ("account_deletion_cooldowns", "insert"))]
    assert order == [("users", "update"), ("account_deletion_cooldowns", "insert")]


def test_a_failed_soft_delete_leaves_no_cooldown_row(monkeypatch):
    import main

    svc = FakeSvc()
    monkeypatch.setattr(main.db, "get_service_client", lambda: svc)
    monkeypatch.setattr(main, "_purge_avatar_objects", lambda keys: None)
    monkeypatch.setattr(main, "_soft_delete_user_compat",
                        lambda *a, **k: (_ for _ in ()).throw(RuntimeError("db down")))
    with pytest.raises(HTTPException) as exc:
        asyncio.run(main.delete_me(None, {"id": "u1", "email": "a@b.co"}, "dev-1"))
    assert exc.value.status_code == 500
    assert not [w for w in svc.writes if w[0] == "account_deletion_cooldowns"]


def test_retrying_deletion_does_not_duplicate_the_cooldown_row(monkeypatch):
    svc, _ = _run_delete_me(monkeypatch)
    # same user deletes again (retry after a client timeout) against the same fake
    import main
    monkeypatch.setattr(main.db, "get_service_client", lambda: svc)
    asyncio.run(main.delete_me(None, {"id": "u1", "email": "a@b.co"}, "dev-1"))
    assert len([r for r in svc.tables["account_deletion_cooldowns"] if r["user_id"] == "u1"]) == 1


# --- 6 ------------------------------------------------------------------------

@pytest.mark.parametrize("message, expected", [
    ("Could not find the table 'skillup_dev.user_feedback' in the schema cache (PGRST205)", True),
    ('relation "skillup_dev.user_feedback" does not exist (42P01)', True),
    ("PGRST204 Could not find the 'x' column of 'user_feedback' in the schema cache", True),
    ("PGRST204 Could not find the 'x' column of 'other_table' in the schema cache", False),
    ('column "user_id" does not exist (42703)', False),
    ('relation "skillup_dev.other_table" does not exist (42P01)', False),
])
def test_missing_table_needs_the_message_to_name_the_table(message, expected):
    assert ap._is_missing_table(Exception(message), "user_feedback") is expected


def test_an_unrelated_missing_column_error_is_reported_as_error(monkeypatch):
    from tests.test_learner_privacy_followup import FakeSvc as PSvc
    svc = PSvc(tables={"user_feedback": [{"user_id": "u1"}]})
    monkeypatch.setattr(ap, "db", svc)
    real = svc.table

    def raising(name):
        if name == "user_feedback":
            raise Exception("PGRST204 Could not find the 'x' column of 'other_table' in the schema cache")
        return real(name)

    monkeypatch.setattr(svc, "table", raising)
    assert ap.hard_delete_learner_content("u1")["user_feedback"] == "error"


# --- 7 ------------------------------------------------------------------------

def test_purge_logs_only_the_exception_type_and_table(monkeypatch):
    from tests.test_learner_privacy_followup import FakeSvc as PSvc
    calls = []
    monkeypatch.setattr(ap.log, "warning", lambda msg, **kw: calls.append(kw))
    svc = PSvc(tables={"user_feedback": [{"user_id": "u1"}]})
    monkeypatch.setattr(ap, "db", svc)
    real = svc.table

    def boom(name):
        if name == "user_feedback":
            raise RuntimeError("secret learner text a@b.co")
        return real(name)

    monkeypatch.setattr(svc, "table", boom)
    out = ap.hard_delete_learner_content("u1")
    assert out["user_feedback"] == "error"
    assert calls and all("secret" not in repr(c) and "a@b.co" not in repr(c) for c in calls)
    assert any(c.get("error") == "RuntimeError" and c.get("table") == "user_feedback" for c in calls)


# --- 8 ------------------------------------------------------------------------

def test_result_reports_blocked_counts_by_reason(monkeypatch):
    _hd_setup(monkeypatch, {"guilds": "blocked", "institution_verification_submissions": "blocked",
                                  "collections": "deleted"})
    out = ahd.hard_delete_expired_accounts()
    assert out["failed"] == 1
    assert out["blocked"] == {"guilds": 1, "institution_verification_submissions": 1}
    assert out["abandoned"] == 0


def test_result_reports_abandoned_accounts(monkeypatch):
    _hd_setup(monkeypatch, {"collections": "deleted"})
    monkeypatch.setattr(ahd, "_abandoned_count", lambda s: 3)
    monkeypatch.setattr(ahd, "_eligible_batch", lambda *a, **k: ([], True))
    out = ahd.hard_delete_expired_accounts()
    assert out["abandoned"] == 3


def test_dry_run_result_has_the_same_keys(monkeypatch):
    _hd_setup(monkeypatch, {"collections": "deleted"})
    monkeypatch.setattr(ahd.settings, "ACCOUNT_HARD_DELETE_ENABLED", False, raising=False)
    out = ahd.hard_delete_expired_accounts()
    assert {"dry_run", "eligible", "deleted", "failed", "blocked", "abandoned"} <= set(out)

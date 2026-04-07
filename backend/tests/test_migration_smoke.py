"""
Smoke tests for migration SQL files. No real DB — just parse the SQL text
and verify structure (transaction wrappers, expected tables/functions).
"""
import os
import re

import pytest

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V2_SQL = os.path.join(BACKEND_DIR, "migration_v2.sql")
V2_DOWN_SQL = os.path.join(BACKEND_DIR, "migration_v2_down.sql")
V2_ATOMIC_SQL = os.path.join(BACKEND_DIR, "migration_v2_atomic.sql")


def _read(path: str) -> str:
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def _strip_leading_comments(sql: str) -> str:
    """Remove leading SQL line comments and blank lines so we can check
    that the first statement is BEGIN;."""
    lines = sql.splitlines()
    out = []
    started = False
    for line in lines:
        if not started and (line.strip() == "" or line.strip().startswith("--")):
            continue
        started = True
        out.append(line)
    return "\n".join(out)


class TestMigrationV2:
    def test_migration_v2_has_transaction_wrapper(self):
        sql = _read(V2_SQL)
        body = _strip_leading_comments(sql).strip()
        assert body.startswith("BEGIN;"), "migration_v2.sql must start with BEGIN;"
        assert body.rstrip().endswith("COMMIT;"), "migration_v2.sql must end with COMMIT;"

    def test_migration_v2_down_exists_and_wrapped(self):
        assert os.path.exists(V2_DOWN_SQL)
        sql = _read(V2_DOWN_SQL)
        body = _strip_leading_comments(sql).strip()
        assert body.startswith("BEGIN;"), "down migration must start with BEGIN;"
        assert body.rstrip().endswith("COMMIT;"), "down migration must end with COMMIT;"

    def test_atomic_helpers_migration_exists(self):
        assert os.path.exists(V2_ATOMIC_SQL), "migration_v2_atomic.sql is missing"
        sql = _read(V2_ATOMIC_SQL)
        assert len(sql) > 0

    def test_migration_v2_creates_expected_tables(self):
        sql = _read(V2_SQL)
        found = set(
            re.findall(
                r"CREATE TABLE IF NOT EXISTS\s+skillup_dev\.([a-zA-Z_][a-zA-Z0-9_]*)",
                sql,
            )
        )
        expected = {
            "active_sessions",
            "sync_log",
            "xp_events",
            "badges",
            "user_badges",
            "feed_items",
            "challenges",
            "challenge_participants",
            "social_shares",
            "portfolio_attributions",
            "starknet_transactions",
            "merchandise_items",
            "merchandise_orders",
            "notification_prefs",
            "referrals",
            "interview_sessions",
        }
        missing = expected - found
        assert not missing, f"migration_v2.sql is missing expected tables: {missing}"

    def test_atomic_helpers_create_required_functions(self):
        sql = _read(V2_ATOMIC_SQL)
        required = [
            "increment_user_points",
            "decrement_merch_credits",
            "try_award_offline_xp",
            "try_award_social_xp",
            "touch_user_streak",
            "increment_feed_counter",
            "decrement_feed_counter",
        ]
        for fn in required:
            pattern = re.compile(
                r"CREATE\s+(OR\s+REPLACE\s+)?FUNCTION\s+(skillup_dev\.)?"
                + re.escape(fn)
                + r"\s*\(",
                re.IGNORECASE,
            )
            assert pattern.search(sql), f"missing function definition: {fn}"

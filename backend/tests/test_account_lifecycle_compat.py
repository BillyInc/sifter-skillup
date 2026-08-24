from pathlib import Path
from types import SimpleNamespace

import pytest

from main import _soft_delete_user_compat


class _FakeUsersTable:
    def __init__(self):
        self.calls = []

    def update(self, payload):
        self.calls.append(dict(payload))
        return self

    def eq(self, *_args):
        return self

    def execute(self):
        payload = self.calls[-1]
        if "deleted_device_id" in payload:
            raise RuntimeError("'deleted_device_id' column does not exist")
        return SimpleNamespace(data=[])


class _FakeService:
    def __init__(self):
        self.users = _FakeUsersTable()

    def table(self, name):
        assert name == "users"
        return self.users


def test_soft_delete_retries_without_optional_columns_on_old_schema():
    service = _FakeService()
    _soft_delete_user_compat(
        service,
        "user-1",
        {
            "is_deleted": True,
            "deleted_at": "2026-08-24T00:00:00",
            "deletion_cooldown_until": "2026-08-25T00:00:00",
            "deleted_device_id": "device-1",
            "email": "deleted-user@deleted.invalid",
            "password_hash": None,
            "onboarding_completed": False,
        },
    )

    assert len(service.users.calls) == 2
    assert "deleted_device_id" in service.users.calls[0]
    assert "deleted_device_id" not in service.users.calls[1]
    assert service.users.calls[1]["email"] == "deleted-user@deleted.invalid"
    assert service.users.calls[1]["password_hash"] is None


def test_soft_delete_does_not_drop_required_identity_fields():
    class MissingEmailService(_FakeService):
        def table(self, name):
            table = super().table(name)

            def execute_with_missing_required():
                raise RuntimeError("'email' column does not exist")

            table.execute = execute_with_missing_required
            return table

    with pytest.raises(RuntimeError, match="email"):
        _soft_delete_user_compat(
            MissingEmailService(),
            "user-1",
            {"email": "deleted-user@deleted.invalid", "password_hash": None},
        )


def test_lifecycle_migration_declares_device_cooldown_contract():
    sql = Path(__file__).parents[1].joinpath("migration_account_lifecycle_patch.sql").read_text(encoding="utf-8")
    assert "CREATE TABLE IF NOT EXISTS skillup_dev.account_deletion_cooldowns" in sql
    assert "device_id TEXT NOT NULL" in sql
    assert "available_at TIMESTAMPTZ NOT NULL" in sql

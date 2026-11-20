"""``Ledger`` backed by ``<schema>.schema_migrations`` through an ``Executor``.

The runner writes ledger rows inside the same transaction as the migration, so a
migration is either applied and recorded or neither.
"""

from __future__ import annotations

import re
from pathlib import Path
from typing import Mapping

from .executor import Executor

RUNNER_VERSION = "2"
TABLE = "schema_migrations"
LEDGER_DDL = Path(__file__).with_name("ledger.sql")
_IDENT = re.compile(r"[a-z_][a-z0-9_]*\Z")


class SqlLedger:
    def __init__(self, executor: Executor, schema: str = "skillup_dev") -> None:
        if not _IDENT.match(schema):
            raise ValueError(f"unsafe schema name: {schema!r}")
        self._ex = executor
        self.schema = schema
        self._table = f"{schema}.{TABLE}"

    def exists(self) -> bool:
        return self._ex.table_exists(self.schema, TABLE)

    def applied(self) -> Mapping[str, str]:
        if not self.exists():
            return {}
        return {
            str(row[0]): str(row[1])
            for row in self._ex.query(f"SELECT id, checksum FROM {self._table}")
        }

    def baselines(self) -> Mapping[str, Mapping[str, str]]:
        if not self.exists():
            return {}
        rows = self._ex.query(
            f"SELECT id, operator, preflight_sha256 FROM {self._table} "
            "WHERE kind = 'baseline'"
        )
        return {
            str(r[0]): {
                "operator": str(r[1] or ""),
                "preflight_sha256": str(r[2] or ""),
            }
            for r in rows
        }

    def row_count(self) -> int:
        if not self.exists():
            return 0
        return int(self._ex.query(f"SELECT count(*) FROM {self._table}")[0][0])

    def record_applied(
        self,
        entry_id: str,
        checksum: str,
        *,
        approval_ref: str | None = None,
        duration_ms: int | None = None,
    ) -> None:
        self._ex.execute(
            f"INSERT INTO {self._table} "
            "(id, checksum, kind, approval_ref, runner_version, duration_ms) "
            "VALUES (%s, %s, 'applied', %s, %s, %s)",
            (entry_id, checksum, approval_ref, RUNNER_VERSION, duration_ms),
        )

    def record_baseline(
        self, entry_id: str, checksum: str, *, operator: str, preflight_sha256: str
    ) -> None:
        self._ex.execute(
            f"INSERT INTO {self._table} "
            "(id, checksum, kind, operator, preflight_sha256, runner_version) "
            "VALUES (%s, %s, 'baseline', %s, %s, %s)",
            (entry_id, checksum, operator, preflight_sha256, RUNNER_VERSION),
        )

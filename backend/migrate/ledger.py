"""Ledger interface for the (future) ``schema_migrations`` table.

Phase 1 never talks to a database. ``Ledger`` is the seam phase 2 will fill
with a real adapter; ``InMemoryLedger`` is used by tests and by
``plan --applied FILE``.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Mapping, Protocol, runtime_checkable


@runtime_checkable
class Ledger(Protocol):
    def applied(self) -> Mapping[str, str]:
        """Return ``{entry_id: checksum}`` for every recorded migration."""
        ...

    def record_applied(self, entry_id: str, checksum: str) -> None:
        """Record a successful apply (the phase 2 runner calls this in-transaction)."""
        ...


class InMemoryLedger:
    def __init__(self, applied: Mapping[str, str] | None = None) -> None:
        self._applied: dict[str, str] = dict(applied or {})

    def applied(self) -> Mapping[str, str]:
        return dict(self._applied)

    def record_applied(self, entry_id: str, checksum: str) -> None:
        if entry_id in self._applied:
            raise ValueError(f"{entry_id} is already recorded")
        self._applied[entry_id] = checksum


def load_applied_json(path: Path) -> InMemoryLedger:
    """Read ``{"applied": [{"id": ..., "checksum": ...}]}`` or ``{id: checksum}``."""
    data = json.loads(path.read_text(encoding="utf-8"))
    applied: dict[str, str] = {}
    if isinstance(data, dict) and isinstance(data.get("applied"), list):
        for row in data["applied"]:
            applied[str(row["id"])] = str(row.get("checksum", ""))
    elif isinstance(data, dict):
        applied = {str(key): str(value) for key, value in data.items()}
    else:
        raise ValueError("applied file must be a JSON object")
    return InMemoryLedger(applied)

"""Ledger interface for the (future) ``schema_migrations`` table.

Phase 1 never talks to a database. ``Ledger`` is the seam phase 2 will fill
with a real adapter; ``InMemoryLedger`` is used by tests and by
``plan --applied FILE``.

Rows have a ``kind``: ``applied`` (the runner executed it) or ``baseline`` (the
operator declared it already present in the database, from a read-only preflight
result; nothing was executed). A baseline is never inferred: see ``build_baseline``.
"""

from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Any, Mapping, Protocol, Sequence, runtime_checkable

from . import manifest as mf

BASELINE = "baseline"
APPLIED_KIND = "applied"


@runtime_checkable
class Ledger(Protocol):
    def applied(self) -> Mapping[str, str]:
        """Return ``{entry_id: checksum}`` for every recorded migration (any kind)."""
        ...

    def baselines(self) -> Mapping[str, Mapping[str, str]]:
        """Return ``{entry_id: metadata}`` for rows recorded as ``baseline``."""
        ...

    def record_applied(
        self,
        entry_id: str,
        checksum: str,
        *,
        approval_ref: str | None = None,
        duration_ms: int | None = None,
    ) -> None:
        """Record a successful apply (the runner calls this inside the entry's transaction)."""
        ...

    def record_baseline(
        self, entry_id: str, checksum: str, *, operator: str, preflight_sha256: str
    ) -> None:
        """Record that ``entry_id`` was already present (explicit operator input)."""
        ...


class InMemoryLedger:
    def __init__(self, applied: Mapping[str, str] | None = None) -> None:
        self._applied: dict[str, str] = dict(applied or {})
        self._baselines: dict[str, dict[str, str]] = {}

    def applied(self) -> Mapping[str, str]:
        return dict(self._applied)

    def baselines(self) -> Mapping[str, Mapping[str, str]]:
        return {key: dict(value) for key, value in self._baselines.items()}

    def record_applied(
        self,
        entry_id: str,
        checksum: str,
        *,
        approval_ref: str | None = None,
        duration_ms: int | None = None,
    ) -> None:
        if entry_id in self._applied:
            raise ValueError(f"{entry_id} is already recorded")
        self._applied[entry_id] = checksum

    def record_baseline(
        self, entry_id: str, checksum: str, *, operator: str, preflight_sha256: str
    ) -> None:
        self.record_applied(entry_id, checksum)
        self._baselines[entry_id] = {
            "operator": operator,
            "preflight_sha256": preflight_sha256,
        }


def load_applied_json(path: Path) -> InMemoryLedger:
    """Read ``{"applied": [{"id": ..., "checksum": ..., "kind": ...}]}`` or ``{id: checksum}``."""
    data = json.loads(path.read_text(encoding="utf-8"))
    ledger = InMemoryLedger()
    if isinstance(data, dict) and isinstance(data.get("applied"), list):
        for row in data["applied"]:
            entry_id, checksum = str(row["id"]), str(row.get("checksum", ""))
            if row.get("kind") == BASELINE:
                ledger.record_baseline(
                    entry_id,
                    checksum,
                    operator=str(row.get("operator", "")),
                    preflight_sha256=str(row.get("preflight_sha256", "")),
                )
            else:
                ledger.record_applied(entry_id, checksum)
    elif isinstance(data, dict):
        for key, value in data.items():
            ledger.record_applied(str(key), str(value))
    else:
        raise ValueError("applied file must be a JSON object")
    return ledger


class BaselineError(ValueError):
    """The requested baseline is not allowed."""


def build_baseline(
    manifest: mf.Manifest,
    root: Path,
    entry_ids: Sequence[str],
    preflight_file: Path,
    operator: str,
    reason: str | None = None,
) -> list[dict[str, Any]]:
    """Baseline rows for entries the operator names explicitly.

    The preflight file is the saved output of a read-only preflight; only its hash is
    recorded (proof of which evidence the operator relied on). Nothing is inferred:
    there is no "all" and no wildcard, ``rebuild`` entries are refused, and every id
    must exist in the manifest (an ordered entry id, or the path of an ``[[unordered]]``
    file, which can be recorded as already present but is never run by the runner).
    The recorded checksum is the file's checksum now, so later edits show up as drift.

    A ``rebuild`` entry (``migration_career_v2``) can be recorded as present only with a
    written ``reason``: it declares that the database already has that taxonomy, it
    never makes the entry runnable, and the reason is kept in the ledger's operator
    text. Other entries ignore ``reason``.
    """
    if not operator.strip():
        raise BaselineError("an operator name is required")
    if not entry_ids:
        raise BaselineError("name the entries explicitly (--entries ID ...)")
    try:
        raw = preflight_file.read_bytes()
        json.loads(raw)
    except (OSError, ValueError) as exc:
        raise BaselineError(f"cannot read preflight result {preflight_file}: {exc}")
    by_id = {entry.id: entry for entry in manifest.entries}
    for item in manifest.unordered:
        by_id.setdefault(item.path, mf.Entry(id=item.path, kind="schema", path=item.path))
    preflight_sha = hashlib.sha256(raw).hexdigest()
    rows: list[dict[str, Any]] = []
    for entry_id in dict.fromkeys(entry_ids):
        entry = by_id.get(entry_id)
        if entry is None:
            raise BaselineError(f"'{entry_id}' is not a manifest entry")
        recorded_by = operator.strip()
        if entry.kind == "rebuild":
            if not (reason and reason.strip()):
                raise BaselineError(
                    f"'{entry_id}' is a rebuild entry: recording it as already present "
                    "needs --reason (why the database is known to have it); it never "
                    "makes the rebuild runnable"
                )
            recorded_by = f"{recorded_by} (rebuild baseline reason: {reason.strip()})"
        try:
            checksum = mf.entry_checksum(entry, root)
        except FileNotFoundError as exc:
            raise BaselineError(str(exc))
        rows.append(
            {
                "id": entry_id,
                "checksum": checksum,
                "kind": BASELINE,
                "operator": recorded_by,
                "preflight_sha256": preflight_sha,
                **({"reason": reason.strip()} if entry.kind == "rebuild" else {}),
            }
        )
    return rows

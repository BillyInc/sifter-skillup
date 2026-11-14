"""Compute what *would* run, given a manifest and a ledger. Never touches a database."""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Callable

from . import manifest as mf
from .ledger import Ledger

# Statuses of a plan row.
APPLIED = "applied"  # recorded in the ledger, checksum matches
DRIFT = "drift"  # recorded, but the file on disk changed since
PENDING = "pending"  # would run automatically
APPROVAL = (
    "approval"  # would run only after explicit approval (destructive replacement)
)
MANUAL = "manual"  # manual_only: never automatic
BLOCKED = "blocked"  # a required entry is neither applied nor going to run


@dataclass
class PlanRow:
    position: int
    id: str
    kind: str
    status: str
    detail: str = ""
    checksum: str | None = None
    applied_checksum: str | None = None
    unresolved: list[str] = field(default_factory=list)


@dataclass
class Plan:
    rows: list[PlanRow] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)

    def with_status(self, *statuses: str) -> list[PlanRow]:
        return [row for row in self.rows if row.status in statuses]

    @property
    def would_run(self) -> list[PlanRow]:
        """Rows a future runner would execute automatically, in order.

        Approval-required rows are *not* here (see ``needs_approval``); rows after one
        carry a note that they only run once it has been approved.
        """
        return self.with_status(PENDING)

    @property
    def needs_approval(self) -> list[PlanRow]:
        """Destructive rows that run only after explicit human approval."""
        return self.with_status(APPROVAL)

    @property
    def unresolved_dependencies(self) -> list[PlanRow]:
        """Rows with a dependency the manifest cannot order (``external_requires``)."""
        return [row for row in self.rows if row.unresolved]

    @property
    def has_drift(self) -> bool:
        return bool(self.with_status(DRIFT))


Checksummer = Callable[[mf.Entry], str]


def build_plan(
    manifest: mf.Manifest,
    ledger: Ledger,
    checksum_of: Checksummer,
    *,
    checksum_pending: bool = False,
) -> Plan:
    """Walk the manifest in order and classify every entry.

    Apply order is strict: once an entry is blocked, every later unapplied
    entry is blocked too (a runner stops at the first problem). ``manual_only``
    entries do not halt the walk; only their dependents are blocked.

    ``checksum_of`` hashes an entry's files; it is only called for entries the
    ledger knows (to detect drift), or for every entry with ``checksum_pending``.
    """
    applied = dict(ledger.applied())
    plan = Plan()
    ids = {entry.id for entry in manifest.entries}
    for unknown in sorted(set(applied) - ids):
        plan.warnings.append(f"ledger has '{unknown}', which is not in the manifest")

    satisfied: set[str] = set()
    awaiting_approval: list[str] = []
    halted_by: str | None = (
        None  # first blocked entry: later entries must not run out of order
    )
    for position, entry in enumerate(manifest.entries, start=1):
        row = PlanRow(position=position, id=entry.id, kind=entry.kind, status=PENDING)
        row.unresolved = [ext.ref for ext in entry.external_requires]
        plan.rows.append(row)
        if entry.id in applied:
            row.applied_checksum = applied[entry.id]
            row.checksum = checksum_of(entry)
            missing = [dep for dep in entry.requires if dep not in applied]
            if missing:
                plan.warnings.append(
                    f"{entry.id} is recorded as applied but requires unapplied {missing}"
                )
            if row.checksum == row.applied_checksum:
                row.status = APPLIED
            else:
                row.status = DRIFT
                row.detail = (
                    "file changed after it was applied; do not re-run, review the edit"
                )
            satisfied.add(entry.id)
            continue

        if checksum_pending:
            row.checksum = checksum_of(entry)
        if entry.manual_only:
            row.status = MANUAL
            row.detail = "manual_only: never run automatically"
            if entry.approval:
                row.detail += f" ({entry.approval})"
            continue
        unmet = [dep for dep in entry.requires if dep not in satisfied]
        if unmet:
            row.status = BLOCKED
            row.detail = "waiting on " + ", ".join(unmet)
            halted_by = halted_by or entry.id
            continue
        if halted_by is not None:
            row.status = BLOCKED
            row.detail = f"halted: earlier entry {halted_by} is blocked and apply order is strict"
            continue
        if entry.kind == "destructive":
            row.status = APPROVAL
            row.detail = f"destructive: {entry.approval}"
            awaiting_approval.append(entry.id)
        elif awaiting_approval:
            row.detail = "only after approval of " + ", ".join(awaiting_approval)
        satisfied.add(entry.id)

    # Strict order: an applied entry must not follow an entry that is not applied.
    first_missing: list[str] = []
    for entry in manifest.entries:
        if entry.id in applied:
            if first_missing:
                shown = ", ".join(first_missing[:5])
                more = (
                    f" (+{len(first_missing) - 5} more)"
                    if len(first_missing) > 5
                    else ""
                )
                plan.warnings.append(
                    f"{entry.id} is recorded as applied out of order: earlier manifest "
                    f"entries are not applied: {shown}{more}"
                )
        else:
            first_missing.append(entry.id)

    for entry in manifest.entries:
        for ext in entry.external_requires:
            plan.warnings.append(
                f"{entry.id} has an unresolved dependency on '{ext.ref}' "
                f"(not an earlier ordered entry): {ext.evidence}"
            )
    return plan


def format_plan(plan: Plan) -> str:
    lines = []
    for row in plan.rows:
        flag = {
            APPLIED: "applied ",
            DRIFT: "DRIFT   ",
            PENDING: "would run",
            APPROVAL: "APPROVAL",
            MANUAL: "MANUAL  ",
            BLOCKED: "blocked ",
        }[row.status]
        suffix = f"  - {row.detail}" if row.detail else ""
        if row.unresolved:
            suffix += "  [unresolved dependency: " + ", ".join(row.unresolved) + "]"
        lines.append(f"{row.position:>3}  {flag:<9}  [{row.kind:<11}] {row.id}{suffix}")
    lines.append("")
    counts = {
        status: len(plan.with_status(status))
        for status in (APPLIED, PENDING, APPROVAL, MANUAL, BLOCKED, DRIFT)
    }
    lines.append(
        "summary: "
        + ", ".join(f"{count} {status}" for status, count in counts.items())
        + f" | would run automatically, in order: {len(plan.would_run)}"
        + f" | need approval first: {len(plan.needs_approval)}"
        + f" | unresolved dependencies: {len(plan.unresolved_dependencies)}"
    )
    for warning in plan.warnings:
        lines.append(f"warning: {warning}")
    if plan.has_drift:
        lines.append(
            "DRIFT detected: applied migrations were edited on disk (exit status 2)."
        )
    return "\n".join(lines)


def plan_to_dict(plan: Plan) -> dict:
    return {
        "rows": [row.__dict__ for row in plan.rows],
        "would_run": [row.id for row in plan.would_run],
        "needs_approval": [row.id for row in plan.needs_approval],
        "unresolved_dependencies": {
            row.id: row.unresolved for row in plan.unresolved_dependencies
        },
        "warnings": plan.warnings,
        "has_drift": plan.has_drift,
    }


def default_checksummer(root: Path) -> Checksummer:
    return lambda entry: mf.entry_checksum(entry, root)

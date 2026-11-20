"""Compute what *would* run, given a manifest and a ledger. Never touches a database."""

from __future__ import annotations

import hashlib
from dataclasses import dataclass, field
from pathlib import Path
from typing import Callable, Iterable

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
REFUSED = "refused"  # rebuild entry: never runs without an explicit flag plus approval


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
    allow_rebuild: bool = False,
    rebuild_approval: str | None = None,
) -> Plan:
    """Walk the manifest in order and classify every entry.

    Apply order is strict: once an entry is blocked, every later unapplied
    entry is blocked too (a runner stops at the first problem). ``manual_only``
    entries do not halt the walk; only their dependents are blocked.

    ``checksum_of`` hashes an entry's files; it is only called for entries the
    ledger knows (to detect drift), or for every entry with ``checksum_pending``.
    """
    applied = dict(ledger.applied())
    baselines = dict(ledger.baselines())
    plan = Plan()
    ids = {entry.id for entry in manifest.entries} | {
        item.path for item in manifest.unordered
    }
    for unknown in sorted(set(applied) - ids):
        plan.warnings.append(f"ledger has '{unknown}', which is not in the manifest")

    satisfied: set[str] = set()
    awaiting_approval: list[str] = []
    halted_by: str | None = (
        None  # first blocked entry: later entries must not run out of order
    )
    for position, entry in enumerate(manifest.entries, start=1):
        row = PlanRow(position=position, id=entry.id, kind=entry.kind, status=PENDING)
        row.unresolved = [
            ext.ref for ext in entry.external_requires if ext.ref not in applied
        ]
        plan.rows.append(row)
        if entry.id in applied:
            row.applied_checksum = applied[entry.id]
            row.checksum = checksum_of(entry)
            missing = [dep for dep in entry.requires if dep not in applied]
            if missing:
                plan.warnings.append(
                    f"{entry.id} is recorded as applied but requires unapplied {missing}"
                )
            if entry.id in baselines:
                row.detail = f"baseline recorded by {baselines[entry.id].get('operator', '?')} (not run by the runner)"
                if entry.kind == "rebuild":
                    plan.warnings.append(f"{entry.id} is a rebuild entry recorded as baseline")
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
        if entry.kind == "rebuild":
            if allow_rebuild and rebuild_approval and rebuild_approval.strip():
                row.status = MANUAL
                row.detail = (
                    f"rebuild authorised ({rebuild_approval.strip()}); still never "
                    "automatic: staging or an empty database, by hand, after a backup"
                )
            else:
                row.status = REFUSED
                row.detail = (
                    "refused: rebuild drops and recreates the taxonomy; needs "
                    "--allow-rebuild plus --rebuild-approval and a backup"
                )
            continue
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
        if row.unresolved:
            # A dependency the manifest cannot order is only satisfied once the ledger
            # records it (applied, or baselined with the operator's evidence). Without
            # that, running this entry would fail on a fresh database.
            row.status = BLOCKED
            row.detail = (
                "needs " + ", ".join(row.unresolved) + " recorded in the ledger first "
                "(apply it by hand, then record a baseline)"
            )
            halted_by = halted_by or entry.id
            continue
        if halted_by is not None:
            row.status = BLOCKED
            row.detail = f"halted: earlier entry {halted_by} is blocked and apply order is strict"
            continue
        if entry.kind in mf.GUARDED_KINDS:
            row.status = APPROVAL
            row.detail = f"{entry.kind}: {entry.approval}"
            awaiting_approval.append(entry.id)
        elif awaiting_approval:
            row.detail = "only after approval of " + ", ".join(awaiting_approval)
        satisfied.add(entry.id)

    # Strict order: an applied entry must not follow an entry that is not applied.
    first_missing: list[str] = []
    for entry in manifest.entries:
        if entry.id in applied:
            if entry.kind == "rebuild" and entry.id in baselines:
                continue  # prerequisite declared by the operator; see MIGRATION_RUNBOOK
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
            if ext.ref in applied:
                continue
            plan.warnings.append(
                f"{entry.id} has an unresolved dependency on '{ext.ref}' "
                f"(not an earlier ordered entry): {ext.evidence}"
            )
    return plan


def plan_sha(plan: Plan) -> str:
    """Stable fingerprint of what a run would execute (pending and approval rows, in order).

    It hashes each row's id, status and file checksum, so it changes when the manifest,
    a file's contents or the ledger state changes. A reviewer dry-runs, reads the sha
    from the output, and the real run must present the same sha: approving a run
    blind, or after a later PR added an entry, fails.
    """
    digest = hashlib.sha256()
    for row in plan.rows:
        if row.status in (PENDING, APPROVAL):
            digest.update(f"{row.id}:{row.status}:{row.checksum or ''}\n".encode())
    return digest.hexdigest()


def _sha_is_reliable(plan: Plan) -> bool:
    """The sha needs every pending/approval row's checksum (``checksum_pending=True``)."""
    return all(
        row.checksum for row in plan.rows if row.status in (PENDING, APPROVAL)
    )


def group_violations(
    manifest: mf.Manifest, approved: Iterable[str], applied: Iterable[str]
) -> list[str]:
    """Entries that must be applied together (``must_apply_with``) but were not approved together.

    A partner already recorded in the ledger counts as done.
    """
    approved_set, applied_set = set(approved), set(applied)
    by_id = {entry.id: entry for entry in manifest.entries}
    problems: list[str] = []
    for entry_id in sorted(approved_set):
        entry = by_id.get(entry_id)
        if entry is None:
            continue
        missing = [
            partner
            for partner in entry.must_apply_with
            if partner not in approved_set and partner not in applied_set
        ]
        if missing:
            problems.append(
                f"{entry_id} must be applied in the same run as "
                + ", ".join(missing)
                + ": approve them together"
            )
    return problems


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
            REFUSED: "REFUSED ",
        }[row.status]
        suffix = f"  - {row.detail}" if row.detail else ""
        if row.unresolved:
            suffix += "  [unresolved dependency: " + ", ".join(row.unresolved) + "]"
        lines.append(f"{row.position:>3}  {flag:<9}  [{row.kind:<16}] {row.id}{suffix}")
    lines.append("")
    counts = {
        status: len(plan.with_status(status))
        for status in (APPLIED, PENDING, APPROVAL, MANUAL, REFUSED, BLOCKED, DRIFT)
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
    if _sha_is_reliable(plan):
        lines.append(f"plan-sha: {plan_sha(plan)}")
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
        "refused": [row.id for row in plan.with_status(REFUSED)],
        "unresolved_dependencies": {
            row.id: row.unresolved for row in plan.unresolved_dependencies
        },
        "warnings": plan.warnings,
        "plan_sha": plan_sha(plan) if _sha_is_reliable(plan) else None,
        "has_drift": plan.has_drift,
    }


def default_checksummer(root: Path) -> Checksummer:
    return lambda entry: mf.entry_checksum(entry, root)

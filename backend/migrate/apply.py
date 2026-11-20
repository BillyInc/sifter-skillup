"""Apply engine: run pending manifest entries, one transaction each, in manifest order.

Safety rules (each has a test):
  * dry run unless ``apply=True``;
  * one runner at a time (advisory lock);
  * refuses if any applied entry's file changed (checksum drift);
  * refuses on an empty ledger unless the operator says the database is empty
    (so a production database with no ledger can never be "migrated from zero");
  * runs only ``schema``/``seed`` entries automatically; ``destructive`` and
    ``data_destructive`` entries need ``--approve ID`` plus an approval reference;
    ``rebuild`` and ``manual_only`` entries never run;
  * strict order: stops at the first entry that fails or needs approval (a dry run that
    stops there exits 3); entries that depend on a refused/manual/unapplied one are skipped;
  * each entry (all parts of a group) runs in a single transaction together with
    its ledger row: applied and recorded, or neither;
  * the file text is checked first: a backslash-apostrophe in a plain string or
    transaction control other than one leading BEGIN and one trailing COMMIT is refused.
"""

from __future__ import annotations

import re
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterable

from . import lint as lint_mod
from . import manifest as mf
from . import plan as plan_mod
from . import sqlio
from . import sqltx
from .executor import ADVISORY_LOCK_KEY, Executor, ExecutorError
from .sqlledger import LEDGER_DDL, SqlLedger

_SET_STMT = re.compile(r"SET[ \t]+(?!LOCAL\b|SESSION\b)([^;]+);", re.I)


DEFAULT_LOCK_TIMEOUT_MS = (
    30_000  # wait at most 30 s for a lock while holding the advisory lock
)
DEFAULT_STATEMENT_TIMEOUT_MS = 900_000  # 15 min per statement; 0 disables
EXIT_NEEDS_APPROVAL = 3  # the run stopped at an entry that needs --approve


class RefusedError(Exception):
    """The runner refuses to run; nothing was executed for this reason."""


def _outside_only_sets(segment: str, label: str) -> list[str]:
    """Text between transactions may hold only comments and ``SET x TO y;``."""
    rest = sqltx.strip_comments(segment).strip()
    sets: list[str] = []
    while rest:
        match = _SET_STMT.match(rest)
        if not match:
            raise RefusedError(
                f"{label}: statements outside BEGIN/COMMIT ({rest[:60]!r}...); "
                "only SET lines may sit there"
            )
        sets.append(f"SET LOCAL {match.group(1).strip()};")
        rest = rest[match.end() :].strip()
    return sets


def prepare_sql(text: str, label: str) -> str:
    """Return the script with the file's own BEGIN/COMMIT lines removed.

    The runner supplies one transaction per entry. A file may hold one or several
    BEGIN...COMMIT pairs (they then run inside the single runner transaction, which is
    only stronger); ROLLBACK, SAVEPOINT, unbalanced pairs and statements outside a pair
    are refused rather than guessed. Session-level ``SET x`` lines outside the pair
    (``SET search_path TO skillup_dev;``) become ``SET LOCAL`` so they cannot leak into
    later entries on the same connection.
    """
    matches = sqltx.transaction_statements(text)
    if not matches:
        bad = lint_mod._backslash_quote_lines(text)
        _refuse_backslash(bad, label)
        return text
    # Only the file's own outer BEGIN ... COMMIT pairs are stripped, and only in their
    # plain spellings. Every other transaction-control statement (ROLLBACK, ABORT,
    # SAVEPOINT, RELEASE, COMMIT AND CHAIN, BEGIN ISOLATION LEVEL ..., a COMMIT with no
    # BEGIN, ...) is refused: the runner owns the transaction.
    for index, stmt in enumerate(matches):
        want_open = index % 2 == 0
        if stmt.family == "other" or stmt.family == "rollback":
            raise RefusedError(
                f"{label}: {stmt.text.split()[0].upper()} at line {stmt.line}; "
                "the runner owns the transaction"
            )
        if want_open and not stmt.is_plain_open:
            raise RefusedError(
                f"{label}: unbalanced BEGIN/COMMIT (found {stmt.text!r} where a plain "
                f"BEGIN was expected at line {stmt.line}; transaction modes are refused)"
            )
        if not want_open and not stmt.is_plain_close:
            raise RefusedError(
                f"{label}: unbalanced BEGIN/COMMIT (found {stmt.text!r} where a plain "
                f"COMMIT was expected at line {stmt.line})"
            )
    if len(matches) % 2:
        raise RefusedError(f"{label}: BEGIN without a closing COMMIT")
    outside: list[str] = []
    inside: list[str] = []
    cursor = 0
    for open_m, close_m in zip(matches[0::2], matches[1::2]):
        outside.extend(_outside_only_sets(text[cursor : open_m.start], label))
        inside.append(text[open_m.stop : close_m.start])
        cursor = close_m.stop
    outside.extend(_outside_only_sets(text[cursor:], label))
    body = "\n".join(outside + inside)
    _refuse_backslash(lint_mod._backslash_quote_lines(body), label)
    return body


def _refuse_backslash(lines: list[int], label: str) -> None:
    if lines:
        raise RefusedError(
            f"{label}: backslash-apostrophe inside a plain string at line(s) "
            f"{', '.join(map(str, lines[:5]))}; with standard_conforming_strings=on "
            "this is a syntax error"
        )


@dataclass
class EntryOutcome:
    id: str
    status: str  # applied | skipped | would_run | needs_approval | failed | refused
    detail: str = ""


@dataclass
class ApplyResult:
    outcomes: list[EntryOutcome] = field(default_factory=list)
    ok: bool = True
    exit_code: int = 0
    messages: list[str] = field(default_factory=list)
    plan: plan_mod.Plan | None = None

    def fail(self, code: int, message: str) -> "ApplyResult":
        self.ok = False
        self.exit_code = code
        self.messages.append(message)
        return self


def bootstrap_ledger(executor: Executor, schema: str) -> None:
    """Create the ledger table by running ``ledger.sql`` as its own transaction."""
    body = prepare_sql(LEDGER_DDL.read_text(encoding="utf-8"), "ledger.sql")
    if schema != "skillup_dev":
        body = body.replace("skillup_dev.", f"{schema}.")
    executor.begin()
    try:
        executor.execute(body)
        executor.commit()
    except Exception:
        executor.rollback()
        raise


def _entry_scripts(entry: mf.Entry, root: Path) -> list[tuple[str, str]]:
    scripts: list[tuple[str, str]] = []
    for path in mf.entry_files(entry, root):
        raw = sqlio.normalise_bytes(sqlio.read_bytes(path)).decode("utf-8")
        scripts.append((path.name, prepare_sql(raw, f"{entry.id}/{path.name}")))
    return scripts


def run_apply(
    manifest: mf.Manifest,
    root: Path,
    executor: Executor,
    *,
    apply: bool = False,
    approve: Iterable[str] = (),
    approval_ref: str | None = None,
    empty_database: bool = False,
    schema: str = "skillup_dev",
    allow_unknown_ledger_ids: bool = False,
    lock_timeout_ms: int = DEFAULT_LOCK_TIMEOUT_MS,
    statement_timeout_ms: int = DEFAULT_STATEMENT_TIMEOUT_MS,
) -> ApplyResult:
    result = ApplyResult()
    approved = set(approve)
    errors = [i for i in mf.validate(manifest, root) if i.severity == "error"]
    if errors:
        return result.fail(
            1,
            "manifest has errors; run verify-manifest: "
            + "; ".join(str(e) for e in errors[:3]),
        )
    by_id = {e.id: e for e in manifest.entries}
    # schema/seed entries whose SQL looks destructive (DROP, TRUNCATE, unqualified
    # DELETE ...) need the same explicit approval as a destructive entry.
    conflicts = {c.entry_id: c for c in lint_mod.kind_conflicts(manifest, root)}
    unknown = sorted(approved - set(by_id))
    if unknown:
        return result.fail(1, f"--approve names unknown entries: {', '.join(unknown)}")
    guarded_approved = [
        i for i in approved if by_id[i].kind in mf.GUARDED_KINDS or i in conflicts
    ]
    if approved - set(guarded_approved):
        return result.fail(
            1,
            "--approve is only for destructive/data_destructive entries or entries whose "
            "SQL contains destructive statements: "
            + ", ".join(sorted(approved - set(guarded_approved))),
        )
    if any(by_id[i].kind == "rebuild" for i in approved):
        return result.fail(
            1, "rebuild entries can never be approved for automatic apply"
        )
    if approved and not (approval_ref and approval_ref.strip()):
        return result.fail(
            1, "--approve needs --approval-ref (who approved, and where)"
        )

    locked = False
    lock_pid = 0
    try:
        if apply:
            if not executor.try_advisory_lock(ADVISORY_LOCK_KEY):
                return result.fail(1, "another migration run holds the advisory lock")
            locked = True
            lock_pid = executor.backend_pid()
        ledger = SqlLedger(executor, schema)
        ledger_exists = ledger.exists()
        if apply and not ledger_exists:
            if not empty_database:
                return result.fail(
                    1,
                    "no ledger table. If this database already has migrations applied, record "
                    "a baseline first (see MIGRATION_RUNBOOK.md); only pass --empty-database "
                    "for a database you know is empty",
                )
        if apply and empty_database and ledger.row_count() == 0:
            # --empty-database is verified, not trusted: any other table or view in the
            # schema means this is not an empty database and everything would re-run.
            others = [
                t for t in executor.list_tables(schema) if t != "schema_migrations"
            ]
            if others:
                shown = ", ".join(others[:5]) + (
                    f" (+{len(others) - 5} more)" if len(others) > 5 else ""
                )
                return result.fail(
                    1,
                    f"--empty-database refused: schema {schema} already has {len(others)} "
                    f"table(s)/view(s) ({shown}). Record a baseline instead",
                )
        if apply and not ledger_exists:
            bootstrap_ledger(executor, schema)
            if not ledger.exists():
                return result.fail(
                    1, "ledger table is still not visible after bootstrap; stopping"
                )
            ledger_exists = True
            if ledger.row_count() != 0:
                return result.fail(
                    1, "ledger table has rows right after bootstrap; stopping"
                )
        if ledger_exists:
            foreign = sorted(set(ledger.applied()) - set(by_id))
            if foreign and not allow_unknown_ledger_ids:
                return result.fail(
                    1,
                    "the ledger holds id(s) the manifest does not know: "
                    + ", ".join(foreign[:5])
                    + (f" (+{len(foreign) - 5} more)" if len(foreign) > 5 else "")
                    + ". A renamed entry would look pending and its SQL would run a second "
                    "time. Fix the manifest, or pass --allow-unknown-ledger-ids if these "
                    "rows are deliberate",
                )
        if apply and ledger.row_count() == 0 and not empty_database:
            return result.fail(
                1,
                "the ledger is empty. Record a baseline of what is already applied, or pass "
                "--empty-database if this database really is empty",
            )
        if not apply:
            executor.begin(read_only=True)
        try:
            plan = plan_mod.build_plan(
                manifest,
                ledger,
                plan_mod.default_checksummer(root),
                checksum_pending=True,
            )
        except FileNotFoundError as exc:
            return result.fail(1, f"cannot plan: {exc}")
        finally:
            if not apply:
                executor.rollback()
        result.plan = plan
        if plan.has_drift:
            drifted = [r.id for r in plan.with_status(plan_mod.DRIFT)]
            return result.fail(
                2, "checksum drift in applied entries: " + ", ".join(drifted)
            )
        applied_bad = [
            w
            for w in plan.warnings
            if "applied out of order" in w or "requires unapplied" in w
        ]
        if applied_bad:
            return result.fail(1, applied_bad[0])

        skipped: dict[str, str] = {}  # refused / manual / blocked entries seen so far
        done = {r.id for r in plan.rows if r.status == plan_mod.APPLIED}
        ordered_ids = set(by_id)
        for row in plan.rows:
            entry = by_id[row.id]
            if row.status == plan_mod.APPLIED:
                continue
            if row.status in (plan_mod.MANUAL, plan_mod.REFUSED, plan_mod.BLOCKED):
                skipped[row.id] = row.status
                result.outcomes.append(
                    EntryOutcome(row.id, "skipped", f"{row.status}: {row.detail}")
                )
                continue
            blocker = _unmet_dependency(entry, skipped, done, ordered_ids)
            if blocker:
                skipped[row.id] = plan_mod.BLOCKED
                why = skipped.get(blocker) or "not applied"
                result.outcomes.append(
                    EntryOutcome(
                        row.id,
                        "skipped",
                        f"blocked: depends on {blocker} ({why}), which is not applied",
                    )
                )
                result.messages.append(
                    f"{row.id} not run: it depends on {blocker} ({why}); apply it or "
                    "record it as a baseline first"
                )
                continue
            needs_approval = row.status == plan_mod.APPROVAL or row.id in conflicts
            if needs_approval and row.id not in approved:
                why = row.detail or ""
                if row.id in conflicts:
                    why = (
                        f"{entry.kind} entry with destructive SQL: {conflicts[row.id]}"
                    )
                result.outcomes.append(EntryOutcome(row.id, "needs_approval", why))
                result.messages.append(
                    f"stopped: {row.id} needs approval (--approve {row.id} --approval-ref ...); "
                    "apply order is strict, so later entries wait"
                )
                if not apply:
                    result.exit_code = (
                        EXIT_NEEDS_APPROVAL  # a dry run must not read as clean
                    )
                return result  # halt: ok stays True, nothing failed
            if not apply:
                result.outcomes.append(EntryOutcome(row.id, "would_run", entry.kind))
                done.add(
                    row.id
                )  # a dry run treats it as applied, so dependents show up
                continue
            try:
                scripts = _entry_scripts(entry, root)
                if mf.entry_checksum(entry, root) != row.checksum:
                    raise RefusedError(
                        f"{row.id}: files changed while the plan was running"
                    )
            except RefusedError as exc:
                result.outcomes.append(EntryOutcome(row.id, "refused", str(exc)))
                return result.fail(1, str(exc))
            started = time.monotonic()
            committed = False
            executor.begin()
            try:
                if executor.backend_pid() != lock_pid:
                    raise ExecutorError(
                        "the connection changed since the advisory lock was taken "
                        "(transaction-mode pooler?); refusing to continue"
                    )
                executor.set_timeouts(lock_timeout_ms, statement_timeout_ms)
                for _name, body in scripts:
                    executor.execute(body)
                ledger.record_applied(
                    row.id,
                    row.checksum or "",
                    approval_ref=approval_ref if row.id in approved else None,
                    duration_ms=int((time.monotonic() - started) * 1000),
                )
                if executor.backend_pid() != lock_pid:
                    raise ExecutorError(
                        "the connection changed during the transaction; rolling back"
                    )
                committed = True  # from here a failure may follow a successful COMMIT
                executor.commit()
                executor.reset_session()
            except (ExecutorError, Exception) as exc:  # noqa: BLE001 - rolled back and reported
                try:
                    executor.rollback()
                    executor.reset_session()
                except Exception:  # noqa: BLE001
                    pass
                detail = f"{type(exc).__name__}: {str(exc).splitlines()[0][:200] if str(exc) else ''}"
                if committed:
                    message = (
                        f"{row.id}: the database may have COMMITTED this entry but the "
                        f"runner did not get a clean acknowledgement ({detail}). Do not "
                        "re-run: run `status` to see whether the ledger has the row"
                    )
                else:
                    message = f"{row.id} failed and was rolled back: {detail}"
                result.outcomes.append(EntryOutcome(row.id, "failed", message))
                return result.fail(1, message)
            result.outcomes.append(EntryOutcome(row.id, "applied", entry.kind))
            done.add(row.id)
        return result
    finally:
        if locked:
            try:
                executor.advisory_unlock(ADVISORY_LOCK_KEY)
            except Exception:  # noqa: BLE001
                pass


def _unmet_dependency(
    entry: mf.Entry,
    skipped: dict[str, str],
    done: set[str],
    ordered_ids: set[str],
) -> str | None:
    """An id this entry depends on that is skipped or not applied, else ``None``.

    ``requires`` ids the runner skipped (refused / manual_only / blocked) block it, and so
    does an ``external_requires`` reference to a *later ordered* entry that is not applied:
    that is a dependency the manifest cannot order (for example an entry that needs a table
    created by a ``rebuild`` entry listed after it). References to unordered files stay
    warnings, because the ledger cannot say whether they were applied.
    """
    for dep in entry.requires:
        if dep in skipped:
            return dep
    for ext in entry.external_requires:
        if ext.ref in ordered_ids and ext.ref not in done:
            return ext.ref
    return None


def run_status(
    manifest: mf.Manifest, root: Path, executor: Executor, schema: str = "skillup_dev"
) -> tuple[plan_mod.Plan, dict]:
    """Read-only: ledger state and the plan against it."""
    executor.begin(read_only=True)
    try:
        ledger = SqlLedger(executor, schema)
        exists = ledger.exists()
        count = ledger.row_count()
        plan = plan_mod.build_plan(
            manifest, ledger, plan_mod.default_checksummer(root), checksum_pending=False
        )
    finally:
        executor.rollback()
    return plan, {"ledger_exists": exists, "ledger_rows": count}

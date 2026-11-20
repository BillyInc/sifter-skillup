"""``python -m migrate plan|lint|verify-manifest|checksums|baseline`` never touch a database.

``status``, ``apply`` and ``import-baseline`` do, through ``executor.connect_from_env``
(URL only from the environment). ``apply`` and ``import-baseline`` are dry runs unless
``--apply`` is passed.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Callable, Sequence

from . import apply as apply_mod
from . import executor as ex_mod
from . import lint as lint_mod
from . import manifest as mf
from . import plan as plan_mod
from .ledger import BaselineError, InMemoryLedger, build_baseline, load_applied_json


def _load(args: argparse.Namespace) -> tuple[mf.Manifest, Path]:
    manifest_path = Path(args.manifest)
    root = Path(args.root) if args.root else manifest_path.resolve().parent.parent
    return mf.load_manifest(manifest_path), root


def cmd_verify_manifest(args: argparse.Namespace) -> int:
    manifest, root = _load(args)
    issues = mf.validate(manifest, root)
    errors = [i for i in issues if i.severity == "error"]
    for issue in issues:
        print(issue)
    ordered = len(manifest.entries)
    unordered = len(manifest.unordered)
    print(
        f"manifest: {ordered} ordered entries, {unordered} unordered, {len(errors)} errors"
    )
    return 1 if errors else 0


def cmd_lint(args: argparse.Namespace) -> int:
    manifest, root = _load(args)
    files = lint_mod.discover(root, manifest)
    cache: lint_mod.ReportCache = {}
    limit = args.max_mib * 1024 * 1024
    report = lint_mod.build_report(files, root, max_bytes=limit, cache=cache)
    print(lint_mod.format_table(report))
    findings = lint_mod.collect_findings(manifest, root, max_bytes=limit, cache=cache)
    if args.json:
        report["findings"] = [f.__dict__ | {"failing": f.failing} for f in findings]
        Path(args.json).write_text(lint_mod.to_json(report), encoding="utf-8")
        print(f"wrote {args.json}", file=sys.stderr)
    failing = [f for f in findings if f.failing]
    print()
    for finding in findings:
        print(finding)
    print(
        f"lint: {len(failing)} error(s), "
        f"{sum(1 for f in findings if f.waived_reason)} waived, "
        f"{sum(1 for f in findings if f.severity == 'warning')} warning(s)"
    )
    return 1 if failing else 0


def cmd_plan(args: argparse.Namespace) -> int:
    manifest, root = _load(args)
    errors = [i for i in mf.validate(manifest, root) if i.severity == "error"]
    if errors:
        for issue in errors:
            print(issue, file=sys.stderr)
        print(
            f"plan refused: the manifest has {len(errors)} error(s); "
            "fix them (see 'verify-manifest') first",
            file=sys.stderr,
        )
        return 1
    try:
        ledger = (
            load_applied_json(Path(args.applied)) if args.applied else InMemoryLedger()
        )
    except (OSError, ValueError, KeyError, TypeError) as exc:
        print(f"cannot read --applied file '{args.applied}': {exc}", file=sys.stderr)
        return 1
    try:
        plan = plan_mod.build_plan(
            manifest,
            ledger,
            plan_mod.default_checksummer(root),
            checksum_pending=args.checksums,
            allow_rebuild=args.allow_rebuild,
            rebuild_approval=args.rebuild_approval,
        )
    except FileNotFoundError as exc:
        print(f"plan failed: {exc}", file=sys.stderr)
        return 1
    if args.json:
        print(json.dumps(plan_mod.plan_to_dict(plan), indent=2))
    else:
        print(plan_mod.format_plan(plan))
    return 2 if plan.has_drift else 0


def cmd_baseline(args: argparse.Namespace) -> int:
    manifest, root = _load(args)
    out = Path(args.out)
    if out.exists():
        print(f"refusing to overwrite {out}", file=sys.stderr)
        return 1
    try:
        rows = build_baseline(
            manifest, root, args.entries, Path(args.preflight), args.operator
        )
    except BaselineError as exc:
        print(f"baseline refused: {exc}", file=sys.stderr)
        return 1
    out.write_text(json.dumps({"applied": rows}, indent=2), encoding="utf-8")
    print(f"wrote {len(rows)} baseline row(s) to {out}")
    return 0


Connect = Callable[[], ex_mod.Executor]


def _print_outcomes(result: apply_mod.ApplyResult) -> None:
    for outcome in result.outcomes:
        extra = f"  - {outcome.detail}" if outcome.detail else ""
        print(f"{outcome.status:<14} {outcome.id}{extra}")
    for message in result.messages:
        print(message, file=sys.stderr)


def cmd_status(args: argparse.Namespace, connect: Connect) -> int:
    manifest, root = _load(args)
    try:
        executor = connect()
    except ex_mod.ExecutorError as exc:
        print(f"cannot connect: {exc}", file=sys.stderr)
        return 1
    try:
        plan, info = apply_mod.run_status(manifest, root, executor, args.schema)
    except ex_mod.ExecutorError as exc:
        print(f"status failed: {exc}", file=sys.stderr)
        return 1
    finally:
        executor.close()
    print(
        f"ledger: {'present' if info['ledger_exists'] else 'MISSING'}, "
        f"{info['ledger_rows']} row(s)"
    )
    print(plan_mod.format_plan(plan))
    return 2 if plan.has_drift else 0


def cmd_apply(args: argparse.Namespace, connect: Connect) -> int:
    manifest, root = _load(args)
    try:
        executor = connect()
    except ex_mod.ExecutorError as exc:
        print(f"cannot connect: {exc}", file=sys.stderr)
        return 1
    try:
        result = apply_mod.run_apply(
            manifest,
            root,
            executor,
            apply=args.apply,
            approve=args.approve or (),
            approval_ref=args.approval_ref,
            empty_database=args.empty_database,
            schema=args.schema,
            allow_unknown_ledger_ids=args.allow_unknown_ledger_ids,
            lock_timeout_ms=args.lock_timeout_ms,
            statement_timeout_ms=args.statement_timeout_ms,
        )
    except (ex_mod.ExecutorError, apply_mod.RefusedError) as exc:
        print(f"apply failed: {exc}", file=sys.stderr)
        return 1
    finally:
        executor.close()
    mode = "APPLY" if args.apply else "DRY RUN (nothing executed; pass --apply to run)"
    print(f"mode: {mode}")
    _print_outcomes(result)
    applied = sum(1 for o in result.outcomes if o.status == "applied")
    print(
        f"summary: {applied} applied, {len(result.outcomes)} considered, exit {result.exit_code}"
    )
    return result.exit_code


def cmd_import_baseline(args: argparse.Namespace, connect: Connect) -> int:
    manifest, root = _load(args)
    try:
        ledger_file = load_applied_json(Path(args.file))
    except (OSError, ValueError, KeyError, TypeError) as exc:
        print(f"cannot read {args.file}: {exc}", file=sys.stderr)
        return 1
    rows = ledger_file.baselines()
    if not rows:
        print("no baseline rows in file", file=sys.stderr)
        return 1
    ids = {entry.id for entry in manifest.entries}
    unknown = sorted(set(rows) - ids)
    if unknown:
        print(
            f"unknown entries in baseline file: {', '.join(unknown)}", file=sys.stderr
        )
        return 1
    # The file is hand-editable: re-verify every row against the manifest as it is now.
    by_id = {entry.id: entry for entry in manifest.entries}
    applied_by = ledger_file.applied()
    for entry_id, meta in rows.items():
        entry = by_id[entry_id]
        if entry.kind == "rebuild":
            print(
                f"baseline import refused: '{entry_id}' is a rebuild entry and can "
                "never be baselined",
                file=sys.stderr,
            )
            return 1
        try:
            current = mf.entry_checksum(entry, root)
        except FileNotFoundError as exc:
            print(f"baseline import refused: {exc}", file=sys.stderr)
            return 1
        if applied_by.get(entry_id) != current:
            print(
                f"baseline import refused: checksum for '{entry_id}' in the file does not "
                "match the manifest's files now (edited file or stale baseline)",
                file=sys.stderr,
            )
            return 1
        sha = str(meta.get("preflight_sha256", ""))
        if (
            not re.fullmatch(r"[0-9a-f]{64}", sha)
            or not str(meta.get("operator", "")).strip()
        ):
            print(
                f"baseline import refused: '{entry_id}' lacks an operator or a "
                "64-hex preflight_sha256",
                file=sys.stderr,
            )
            return 1
    if not args.apply:
        print(f"DRY RUN: would record {len(rows)} baseline row(s): {', '.join(rows)}")
        return 0
    from .sqlledger import SqlLedger

    try:
        executor = connect()
    except ex_mod.ExecutorError as exc:
        print(f"cannot connect: {exc}", file=sys.stderr)
        return 1
    try:
        if not executor.try_advisory_lock(ex_mod.ADVISORY_LOCK_KEY):
            print("another migration run holds the advisory lock", file=sys.stderr)
            return 1
        ledger = SqlLedger(executor, args.schema)
        if not ledger.exists():
            apply_mod.bootstrap_ledger(executor, args.schema)
        existing = ledger.applied()
        executor.begin()
        try:
            for entry_id, meta in rows.items():
                if entry_id in existing:
                    raise ValueError(f"{entry_id} is already in the ledger")
                ledger.record_baseline(
                    entry_id,
                    applied_by[entry_id],
                    operator=meta.get("operator", ""),
                    preflight_sha256=meta.get("preflight_sha256", ""),
                )
            executor.commit()
        except Exception as exc:  # noqa: BLE001
            executor.rollback()
            print(f"baseline import rolled back: {exc}", file=sys.stderr)
            return 1
        executor.advisory_unlock(ex_mod.ADVISORY_LOCK_KEY)
    except ex_mod.ExecutorError as exc:
        print(f"baseline import failed: {exc}", file=sys.stderr)
        return 1
    finally:
        executor.close()
    print(f"recorded {len(rows)} baseline row(s)")
    return 0


def cmd_checksums(args: argparse.Namespace) -> int:
    manifest, root = _load(args)
    result = {entry.id: mf.entry_checksum(entry, root) for entry in manifest.entries}
    if args.json:
        print(
            json.dumps(
                {"applied": [{"id": k, "checksum": v} for k, v in result.items()]},
                indent=2,
            )
        )
    else:
        for entry_id, digest in result.items():
            print(f"{digest}  {entry_id}")
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="python -m migrate", description=__doc__)
    parser.add_argument(
        "--manifest", default=str(mf.DEFAULT_MANIFEST), help="path to manifest.toml"
    )
    parser.add_argument(
        "--root",
        help="directory holding the SQL files (default: parent of the manifest dir)",
    )
    sub = parser.add_subparsers(dest="command", required=True)

    verify = sub.add_parser(
        "verify-manifest", help="validate the manifest against the files on disk"
    )
    verify.set_defaults(func=cmd_verify_manifest)

    lint = sub.add_parser("lint", help="static analysis of every migration/seed file")
    lint.add_argument(
        "--json", metavar="FILE", help="also write the machine-readable report to FILE"
    )
    lint.add_argument(
        "--max-mib", type=int, default=lint_mod.MAX_ANALYSE_BYTES // (1024 * 1024)
    )
    lint.set_defaults(func=cmd_lint)

    plan = sub.add_parser("plan", help="show what would run (never touches a database)")
    plan.add_argument(
        "--applied",
        metavar="FILE",
        help="JSON of already-applied ids+checksums (ledger stand-in)",
    )
    plan.add_argument(
        "--checksums",
        action="store_true",
        help="also hash entries that are not applied yet",
    )
    plan.add_argument("--json", action="store_true", help="machine-readable output")
    plan.add_argument(
        "--dry-run",
        action="store_true",
        help="accepted for CI clarity: plan never connects to a database or runs SQL",
    )
    plan.add_argument(
        "--allow-rebuild",
        action="store_true",
        help="show rebuild entries as authorised (needs --rebuild-approval; still never automatic)",
    )
    plan.add_argument(
        "--rebuild-approval",
        metavar="REF",
        help="who/what approved the rebuild (recorded, not verified)",
    )
    plan.set_defaults(func=cmd_plan)

    baseline = sub.add_parser(
        "baseline",
        help="write ledger baseline rows for entries the operator names (never inferred)",
    )
    baseline.add_argument(
        "--preflight",
        required=True,
        metavar="FILE",
        help="saved read-only preflight JSON",
    )
    baseline.add_argument("--entries", nargs="+", required=True, metavar="ID")
    baseline.add_argument("--operator", required=True)
    baseline.add_argument(
        "--out", required=True, metavar="FILE", help="applied.json to write"
    )
    baseline.set_defaults(func=cmd_baseline)

    db_note = (
        f"reads the database URL from ${ex_mod.URL_ENV} only (never a CLI argument)"
    )
    status = sub.add_parser("status", help=f"read-only ledger + plan; {db_note}")
    status.add_argument("--schema", default="skillup_dev")
    status.set_defaults(func=cmd_status, db=True)

    apply = sub.add_parser(
        "apply", help=f"run pending entries; dry run unless --apply; {db_note}"
    )
    apply.add_argument(
        "--apply", action="store_true", help="actually execute (default: dry run)"
    )
    apply.add_argument(
        "--approve", nargs="+", metavar="ID", help="approve these destructive entries"
    )
    apply.add_argument(
        "--approval-ref",
        metavar="REF",
        help="who approved, and where (required with --approve)",
    )
    apply.add_argument(
        "--empty-database",
        action="store_true",
        help="the database is known to be empty: allow an empty ledger to start from zero",
    )
    apply.add_argument(
        "--allow-unknown-ledger-ids",
        action="store_true",
        help="do not refuse when the ledger holds ids the manifest does not know "
        "(normally a renamed entry, which would run twice)",
    )
    apply.add_argument(
        "--lock-timeout-ms",
        type=int,
        default=apply_mod.DEFAULT_LOCK_TIMEOUT_MS,
        help="SET LOCAL lock_timeout per entry (default %(default)s; 0 = wait forever)",
    )
    apply.add_argument(
        "--statement-timeout-ms",
        type=int,
        default=apply_mod.DEFAULT_STATEMENT_TIMEOUT_MS,
        help="SET LOCAL statement_timeout per entry (default %(default)s; 0 = none)",
    )
    apply.add_argument("--schema", default="skillup_dev")
    apply.set_defaults(func=cmd_apply, db=True)

    imp = sub.add_parser(
        "import-baseline",
        help="record baseline rows from a 'baseline' command file into the ledger (--apply to write)",
    )
    imp.add_argument("file", metavar="FILE")
    imp.add_argument("--apply", action="store_true")
    imp.add_argument("--schema", default="skillup_dev")
    imp.set_defaults(func=cmd_import_baseline, db=True)

    checksums = sub.add_parser(
        "checksums", help="print the checksum of every manifest entry"
    )
    checksums.add_argument(
        "--json", action="store_true", help="emit a file usable with 'plan --applied'"
    )
    checksums.set_defaults(func=cmd_checksums)
    return parser


def main(argv: Sequence[str] | None = None, connect: Connect | None = None) -> int:
    args = build_parser().parse_args(argv)
    try:
        if getattr(args, "db", False):
            return args.func(args, connect or ex_mod.connect_from_env)
        return args.func(args)
    except mf.ManifestError as exc:
        print(f"manifest error: {exc}", file=sys.stderr)
        return 1

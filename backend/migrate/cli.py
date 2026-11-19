"""``python -m migrate plan|lint|verify-manifest|checksums`` (run from ``backend/``).

Every command is read-only with respect to databases: there is no connection
code in this package.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Sequence

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
        "--preflight", required=True, metavar="FILE", help="saved read-only preflight JSON"
    )
    baseline.add_argument("--entries", nargs="+", required=True, metavar="ID")
    baseline.add_argument("--operator", required=True)
    baseline.add_argument("--out", required=True, metavar="FILE", help="applied.json to write")
    baseline.set_defaults(func=cmd_baseline)

    checksums = sub.add_parser(
        "checksums", help="print the checksum of every manifest entry"
    )
    checksums.add_argument(
        "--json", action="store_true", help="emit a file usable with 'plan --applied'"
    )
    checksums.set_defaults(func=cmd_checksums)
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    try:
        return args.func(args)
    except mf.ManifestError as exc:
        print(f"manifest error: {exc}", file=sys.stderr)
        return 1

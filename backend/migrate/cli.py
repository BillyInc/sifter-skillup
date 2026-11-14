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
from .ledger import InMemoryLedger, load_applied_json


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
    report = lint_mod.build_report(files, root, max_bytes=args.max_mib * 1024 * 1024)
    if args.json:
        Path(args.json).write_text(lint_mod.to_json(report), encoding="utf-8")
        print(f"wrote {args.json}", file=sys.stderr)
    print(lint_mod.format_table(report))
    return 0


def cmd_plan(args: argparse.Namespace) -> int:
    manifest, root = _load(args)
    ledger = load_applied_json(Path(args.applied)) if args.applied else InMemoryLedger()
    plan = plan_mod.build_plan(
        manifest,
        ledger,
        plan_mod.default_checksummer(root),
        checksum_pending=args.checksums,
    )
    if args.json:
        print(json.dumps(plan_mod.plan_to_dict(plan), indent=2))
    else:
        print(plan_mod.format_plan(plan))
    return 2 if plan.has_drift else 0


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
    plan.set_defaults(func=cmd_plan)

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

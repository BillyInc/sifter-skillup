"""Explicit, ordered migration manifest (``manifest.toml``) and its validation.

The manifest is the only source of apply order. File order in the manifest is
the apply order; ``requires`` records documented hard dependencies and must
only point backwards. Files whose order is not documented unambiguously go in
``[[unordered]]`` with a reason; they are never applied automatically.
"""

from __future__ import annotations

import hashlib
import tomllib
from dataclasses import dataclass
from pathlib import Path, PurePosixPath
from typing import Any

from . import sqlio

KINDS = ("schema", "seed", "destructive")
DEFAULT_MANIFEST = Path(__file__).with_name("manifest.toml")

# Top-level names in backend/ that must be registered (entry or unordered).
REGISTRABLE_PREFIXES = ("migration_", "seed_", "patch_")


class ManifestError(ValueError):
    """The manifest file is structurally unusable (not just semantically wrong)."""


@dataclass(frozen=True)
class ExternalRequire:
    """A dependency the manifest cannot express as an ordered ``requires`` edge.

    ``ref`` is either the ``path`` of an ``[[unordered]]`` item, or the ``id`` of an
    ordered entry that is listed *after* the requiring entry. It is reported as an
    unresolved dependency by ``verify-manifest`` and ``plan``; it never reorders
    anything. ``evidence`` must cite the SQL (file and line) that proves the need.
    """

    ref: str
    evidence: str


@dataclass(frozen=True)
class Entry:
    id: str
    kind: str
    path: str | None = None
    parts_glob: str | None = None
    expected_parts: int | None = None
    requires: tuple[str, ...] = ()
    external_requires: tuple[ExternalRequire, ...] = ()
    allow_destructive_reason: str | None = None
    verify: tuple[str, ...] = ()
    down: str | None = None
    manual_only: bool = False
    approval: str | None = None
    note: str = ""
    source: str = ""

    @property
    def is_group(self) -> bool:
        return self.parts_glob is not None


@dataclass(frozen=True)
class Unordered:
    path: str
    reason: str


@dataclass(frozen=True)
class Manifest:
    entries: tuple[Entry, ...]
    unordered: tuple[Unordered, ...] = ()


@dataclass(frozen=True)
class Issue:
    code: str
    message: str
    severity: str = "error"  # "error" | "warning"

    def __str__(self) -> str:
        return f"{self.severity.upper()} {self.code}: {self.message}"


def _str_list(value: Any, field_name: str, where: str) -> tuple[str, ...]:
    if value is None:
        return ()
    if not isinstance(value, list) or not all(isinstance(v, str) and v for v in value):
        raise ManifestError(
            f"{where}: '{field_name}' must be a list of non-empty strings"
        )
    return tuple(value)


def _external_requires(value: Any, where: str) -> tuple[ExternalRequire, ...]:
    if value is None:
        return ()
    if not isinstance(value, list):
        raise ManifestError(f"{where}: 'external_requires' must be an array of tables")
    result: list[ExternalRequire] = []
    for item in value:
        if (
            not isinstance(item, dict)
            or not isinstance(item.get("ref"), str)
            or not item["ref"]
            or not isinstance(item.get("evidence"), str)
            or not item["evidence"].strip()
        ):
            raise ManifestError(
                f"{where}: each external_requires item needs a non-empty 'ref' and 'evidence'"
            )
        result.append(ExternalRequire(ref=item["ref"], evidence=item["evidence"]))
    return tuple(result)


def parse_manifest(data: dict[str, Any]) -> Manifest:
    """Build a ``Manifest`` from parsed TOML, raising ``ManifestError`` on bad shapes."""
    raw_entries = data.get("entry", [])
    if not isinstance(raw_entries, list):
        raise ManifestError("'entry' must be an array of tables ([[entry]])")
    entries: list[Entry] = []
    for index, raw in enumerate(raw_entries, start=1):
        if not isinstance(raw, dict):
            raise ManifestError(f"entry #{index} is not a table")
        where = f"entry #{index} ({raw.get('id', '?')})"
        entry_id = raw.get("id")
        if not isinstance(entry_id, str) or not entry_id:
            raise ManifestError(f"{where}: 'id' must be a non-empty string")
        kind = raw.get("kind")
        if kind not in KINDS:
            raise ManifestError(f"{where}: 'kind' must be one of {KINDS}, got {kind!r}")
        path = raw.get("path")
        glob = raw.get("parts_glob")
        if (path is None) == (glob is None):
            raise ManifestError(
                f"{where}: exactly one of 'path' or 'parts_glob' is required"
            )
        for key, value in (("path", path), ("parts_glob", glob)):
            if value is not None and (not isinstance(value, str) or not value):
                raise ManifestError(f"{where}: '{key}' must be a non-empty string")
        manual_only = raw.get("manual_only", False)
        if not isinstance(manual_only, bool):
            raise ManifestError(f"{where}: 'manual_only' must be a boolean")
        approval = raw.get("approval")
        if approval is not None and not isinstance(approval, str):
            raise ManifestError(f"{where}: 'approval' must be a string")
        expected = raw.get("expected_parts")
        if expected is not None and (
            not isinstance(expected, int) or isinstance(expected, bool) or expected < 1
        ):
            raise ManifestError(f"{where}: 'expected_parts' must be a positive integer")
        down = raw.get("down")
        if down is not None and not isinstance(down, str):
            raise ManifestError(f"{where}: 'down' must be a path string")
        allow_reason = raw.get("allow_destructive_reason")
        if allow_reason is not None and (
            not isinstance(allow_reason, str) or not allow_reason.strip()
        ):
            raise ManifestError(
                f"{where}: 'allow_destructive_reason' must be a non-empty string"
            )
        entries.append(
            Entry(
                id=entry_id,
                kind=kind,
                path=path,
                parts_glob=glob,
                expected_parts=expected,
                requires=_str_list(raw.get("requires"), "requires", where),
                external_requires=_external_requires(
                    raw.get("external_requires"), where
                ),
                allow_destructive_reason=allow_reason,
                verify=_str_list(raw.get("verify"), "verify", where),
                down=down,
                manual_only=manual_only,
                approval=approval or None,
                note=str(raw.get("note", "")),
                source=str(raw.get("source", "")),
            )
        )
    raw_unordered = data.get("unordered", [])
    if not isinstance(raw_unordered, list):
        raise ManifestError("'unordered' must be an array of tables ([[unordered]])")
    unordered: list[Unordered] = []
    for index, raw in enumerate(raw_unordered, start=1):
        if (
            not isinstance(raw, dict)
            or not isinstance(raw.get("path"), str)
            or not raw["path"]
        ):
            raise ManifestError(
                f"unordered #{index}: 'path' must be a non-empty string"
            )
        unordered.append(
            Unordered(path=raw["path"], reason=str(raw.get("reason", "")).strip())
        )
    return Manifest(entries=tuple(entries), unordered=tuple(unordered))


def load_manifest(path: Path = DEFAULT_MANIFEST) -> Manifest:
    try:
        with path.open("rb") as handle:
            data = tomllib.load(handle)
    except tomllib.TOMLDecodeError as exc:
        raise ManifestError(f"{path}: invalid TOML: {exc}") from exc
    return parse_manifest(data)


# ---------------------------------------------------------------------------
# File resolution
# ---------------------------------------------------------------------------


def is_contained(root: Path, rel: str) -> bool:
    """True if manifest path ``rel`` stays inside ``root`` (the ``backend/`` directory).

    Absolute paths and any ``..`` component are rejected outright; the resolved
    location must also be inside ``root`` so a symlink cannot lead out of it.
    """
    pure = PurePosixPath(rel.replace("\\", "/"))
    if pure.is_absolute() or rel.startswith(("/", "\\")) or ".." in pure.parts:
        return False
    if len(rel) > 1 and rel[1] == ":":  # Windows drive letter
        return False
    return (root / rel).resolve().is_relative_to(root.resolve())


def entry_files(entry: Entry, root: Path) -> list[Path]:
    """Existing files for an entry (a single file, or the numeric-ordered parts).

    Paths that escape ``root`` yield no files; ``validate`` reports them.
    """
    target = entry.path if entry.path is not None else entry.parts_glob
    assert target is not None
    if not is_contained(root, target):
        return []
    if entry.path is not None:
        candidate = root / entry.path
        return [candidate] if candidate.is_file() else []
    assert entry.parts_glob is not None
    root_resolved = root.resolve()
    return sorted(
        (
            p
            for p in root.glob(entry.parts_glob)
            if p.is_file() and p.resolve().is_relative_to(root_resolved)
        ),
        key=sqlio.part_sort_key,
    )


def entry_checksum(entry: Entry, root: Path) -> str:
    """Checksum recorded in the ledger for an entry.

    Single file: SHA-256 of the decompressed bytes. Group: SHA-256 of
    ``"<part name> <part sha256>\\n"`` lines in numeric part order, so editing,
    adding, removing or reordering any part changes the group checksum.
    """
    files = entry_files(entry, root)
    if not files:
        raise FileNotFoundError(f"{entry.id}: no files found")
    if not entry.is_group:
        return sqlio.sha256_file(files[0])
    digest = hashlib.sha256()
    for part in files:
        digest.update(f"{part.name} {sqlio.sha256_file(part)}\n".encode())
    return digest.hexdigest()


def registrable_items(root: Path) -> dict[str, Path]:
    """Everything in ``root`` that must be in the manifest, keyed by stem.

    ``migration_x.sql`` and ``migration_x.sql.gz`` share one key; so do
    transport directories (``seed_*_parts*``), keyed by directory name.
    """
    items: dict[str, Path] = {}
    for child in sorted(root.iterdir()):
        if not child.name.startswith(REGISTRABLE_PREFIXES):
            continue
        if child.is_dir():
            items.setdefault(child.name, child)
        elif child.name.endswith((".sql", ".sql.gz")):
            items.setdefault(sqlio.stem(child.name), child)
    return items


def _covered_keys(path: str) -> set[str]:
    """Registrable keys a manifest ``path``/``parts_glob`` accounts for."""
    parts = Path(path).parts
    if len(parts) > 1:
        return {
            parts[0]
        }  # a file/glob inside a transport directory covers the directory
    return {sqlio.stem(parts[0])}


# ---------------------------------------------------------------------------
# Validation
# ---------------------------------------------------------------------------


def _find_cycle(graph: dict[str, tuple[str, ...]]) -> list[str] | None:
    white, grey, black = 0, 1, 2
    colour = {node: white for node in graph}
    stack: list[str] = []

    def visit(node: str) -> list[str] | None:
        colour[node] = grey
        stack.append(node)
        for dep in graph[node]:
            if dep not in graph:
                continue
            if colour[dep] == grey:
                return stack[stack.index(dep) :] + [dep]
            if colour[dep] == white:
                found = visit(dep)
                if found:
                    return found
        stack.pop()
        colour[node] = black
        return None

    for node in graph:
        if colour[node] == white:
            found = visit(node)
            if found:
                return found
    return None


def validate(manifest: Manifest, root: Path) -> list[Issue]:
    """Return every problem found; an empty list means the manifest is sound."""
    issues: list[Issue] = []
    err = lambda code, msg: issues.append(Issue(code, msg))  # noqa: E731

    # Duplicate ids.
    seen: dict[str, int] = {}
    for position, entry in enumerate(manifest.entries):
        if entry.id in seen:
            err("DUPLICATE_ID", f"id '{entry.id}' is used more than once")
        seen.setdefault(entry.id, position)

    # Per-entry checks.
    for entry in manifest.entries:
        for label, value in (
            ("path", entry.path),
            ("parts_glob", entry.parts_glob),
            ("down", entry.down),
        ):
            if value is not None and not is_contained(root, value):
                err(
                    "PATH_ESCAPES_ROOT",
                    f"{entry.id}: {label} '{value}' must stay inside the backend directory",
                )
        for check in entry.verify:
            if check.endswith(".sql") and not is_contained(root, check):
                err(
                    "PATH_ESCAPES_ROOT",
                    f"{entry.id}: verify file '{check}' must stay inside the backend directory",
                )
        files = entry_files(entry, root)
        if entry.path is not None and not files and is_contained(root, entry.path):
            err("MISSING_PATH", f"{entry.id}: path '{entry.path}' does not exist")
        if entry.is_group:
            if not files:
                if is_contained(root, entry.parts_glob or ""):
                    err(
                        "MISSING_PATH",
                        f"{entry.id}: parts_glob '{entry.parts_glob}' matches no files",
                    )
            else:
                numbers = [sqlio.part_number(p) for p in files]
                if None in numbers:
                    err(
                        "PARTS_GAP",
                        f"{entry.id}: every part name must contain a number",
                    )
                elif numbers != list(range(1, len(files) + 1)):
                    err(
                        "PARTS_GAP",
                        f"{entry.id}: parts must be numbered 1..N without gaps, got {numbers}",
                    )
                if (
                    entry.expected_parts is not None
                    and len(files) != entry.expected_parts
                ):
                    err(
                        "PARTS_GAP",
                        f"{entry.id}: expected {entry.expected_parts} parts, found {len(files)}",
                    )
        if (
            entry.down is not None
            and is_contained(root, entry.down)
            and not (root / entry.down).is_file()
        ):
            err(
                "MISSING_PATH", f"{entry.id}: down script '{entry.down}' does not exist"
            )
        for check in entry.verify:
            if (
                check.endswith(".sql")
                and is_contained(root, check)
                and not (root / check).is_file()
            ):
                err("MISSING_PATH", f"{entry.id}: verify file '{check}' does not exist")
        if entry.kind == "destructive" and not (entry.manual_only or entry.approval):
            err(
                "DESTRUCTIVE_UNGUARDED",
                f"{entry.id}: destructive entries need manual_only = true or a non-empty 'approval' marker",
            )

    # Requires: unknown ids, self reference, forward references, cycles.
    positions = {entry.id: index for index, entry in enumerate(manifest.entries)}
    for entry in manifest.entries:
        for dep in entry.requires:
            if dep == entry.id:
                err("CYCLE", f"{entry.id} requires itself")
            elif dep not in positions:
                err("UNKNOWN_REQUIRE", f"{entry.id} requires unknown id '{dep}'")
            elif positions[dep] > positions[entry.id]:
                err("ORDER", f"{entry.id} requires '{dep}', which is listed after it")
    unordered_paths = {item.path for item in manifest.unordered}
    for entry in manifest.entries:
        for ext in entry.external_requires:
            if ext.ref == entry.id:
                err("EXTERNAL_REQUIRE", f"{entry.id} lists itself in external_requires")
            elif ext.ref in positions and positions[ext.ref] < positions[entry.id]:
                err(
                    "EXTERNAL_REQUIRE",
                    f"{entry.id}: '{ext.ref}' is ordered earlier, express it in 'requires'",
                )
            elif ext.ref in positions or ext.ref in unordered_paths:
                issues.append(
                    Issue(
                        "UNRESOLVED_DEPENDENCY",
                        f"{entry.id} depends on '{ext.ref}', which has no earlier ordered "
                        f"position ({ext.evidence})",
                        severity="warning",
                    )
                )
            else:
                err(
                    "EXTERNAL_REQUIRE",
                    f"{entry.id}: external_requires '{ext.ref}' is neither an "
                    "[[unordered]] path nor a later ordered id",
                )
    graph = {entry.id: entry.requires for entry in manifest.entries}
    cycle = _find_cycle(graph)
    if cycle:
        err("CYCLE", "dependency cycle: " + " -> ".join(cycle))

    # Unordered section.
    ordered_paths: dict[str, str] = {}
    for entry in manifest.entries:
        target = entry.path or entry.parts_glob or ""
        for key in _covered_keys(target):
            if key in ordered_paths and ordered_paths[key] != entry.id:
                err(
                    "DOUBLE_REGISTERED",
                    f"'{key}' is covered by both {ordered_paths[key]} and {entry.id}",
                )
            ordered_paths[key] = entry.id
    unordered_keys: dict[str, str] = {}
    for item in manifest.unordered:
        if not item.reason:
            err("UNORDERED_REASON", f"[[unordered]] '{item.path}' needs a reason")
        if not is_contained(root, item.path):
            err(
                "PATH_ESCAPES_ROOT",
                f"[[unordered]] path '{item.path}' must stay inside the backend directory",
            )
        elif not (root / item.path).exists():
            err("MISSING_PATH", f"[[unordered]] path '{item.path}' does not exist")
        key = sqlio.stem(Path(item.path).name)
        if key in unordered_keys:
            err("DOUBLE_REGISTERED", f"'{item.path}' is listed twice in [[unordered]]")
        unordered_keys[key] = item.path
        if key in ordered_paths:
            err(
                "DOUBLE_REGISTERED",
                f"'{item.path}' is both ordered ({ordered_paths[key]}) and unordered",
            )

    # Coverage: nothing on disk may be forgotten.
    if root.is_dir():
        for key, path in registrable_items(root).items():
            if key not in ordered_paths and key not in unordered_keys:
                err(
                    "UNREGISTERED_FILE",
                    f"{path.name} is neither in the manifest nor in [[unordered]] - register it",
                )
    return issues

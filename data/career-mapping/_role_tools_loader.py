"""Load the canonical role-tools object from its repository transport."""

from __future__ import annotations

import gzip
import json
from pathlib import Path


HERE = Path(__file__).resolve().parent


def load_role_tools() -> dict:
    """Load role tools from an uncompressed file or ordered gzip parts.

    The uncompressed ``role_tools.json`` is intentionally not stored in the
    repository.  Build and audit scripts must therefore use the same compact
    transport that is checked in, while still accepting a local uncompressed
    artifact when one exists.
    """
    direct = HERE / "role_tools.json"
    if direct.exists():
        return json.loads(direct.read_text(encoding="utf-8"))

    parts_dir = HERE / "role_tools_parts_gz"
    manifest_path = parts_dir / "manifest.json"
    if not manifest_path.exists():
        raise FileNotFoundError(
            "Neither role_tools.json nor role_tools_parts_gz/manifest.json exists"
        )
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    result: dict = {}
    for part in manifest.get("parts") or []:
        with gzip.open(parts_dir / part["path"], "rt", encoding="utf-8") as handle:
            result.update(json.load(handle))
    return result

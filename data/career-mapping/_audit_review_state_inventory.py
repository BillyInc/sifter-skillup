"""Inventory review, unresolved, and unavailable states across career data.

The inventory is intentionally descriptive.  It does not turn a review flag
into a failure or a pass; it makes every remaining queue visible before the
final source and SQL gates are evaluated.
"""

from __future__ import annotations

import json
import re
from collections import Counter
from pathlib import Path


HERE = Path(__file__).resolve().parent
AUDIT = HERE / "_audit"
OUT_JSON = AUDIT / "review_state_inventory_2026-09-01.json"
OUT_MD = AUDIT / "REVIEW_STATE_INVENTORY_2026-09-01.md"

TOKENS = (
    "review_required",
    "under_review",
    "requires_review",
    "manual_review",
    "needs_review",
    "unresolved",
    "pending",
    "not_established",
    "source_record_missing",
    "no_direct_local_counterpart",
    "no_direct_match",
    "unavailable",
    "partial",
    "candidate_requires_boundary_review",
    "specialist_source_review_required",
    "review_required_unmatched_or_aggregate",
    "unresolved_source",
)
SKIP_PARTS = {"learning_resource_population_parts", "role_tools_parts_gz"}
SKIP_DIRS = {"_source_downloads", "_source_extracts", "_prof_bodies"}
LARGE_FILE_BYTES = 25_000_000
MAX_SCAN_FILE_BYTES = 20_000_000
SKIP_FILES = {
    "domain_skill_provenance.json",
    "source_backed_layer_report.json",
    "jamb_skills_nuance.json",
    # These audit outputs already carry an explicit disposition for every
    # finding; counting their copied before-state labels again would inflate
    # the live queue.
    "jamb_brochure_source_rules_2026-08-19.json",
    "wef_role_normalization_2026-09-01.json",
    "review_state_dispositions_2026-09-01.json",
}
# This is the preserved before-state diagnostic for the Nigerian CCMAS queue.
# Its review_required values are intentionally historical; the completed
# disposition is audited in ccmas_nigerian_reviewed_links_2026-09-01.json and
# materialized into jamb_domain_map.json.
HISTORICAL_BEFORE_STATE_FILES = {
    "ccmas_external_domain_complements_2026-09-01.json",
    "jamb_ccmas_inheritance_canonical_2026-08-17.json",
}


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def token_for(value: str) -> str | None:
    normalized = re.sub(r"[^a-z0-9_]+", "_", value.lower()).strip("_")
    for token in TOKENS:
        if normalized == token or token in normalized:
            return token
    return None


def walk(value, path: str, keys: list[str], values: Counter, samples: list[dict]):
    if isinstance(value, dict):
        for key, child in value.items():
            key_token = token_for(str(key))
            if key_token:
                keys.append(key_token)
                if len(samples) < 12:
                    samples.append({"path": f"{path}.{key}", "kind": "key", "token": key_token, "value": child if isinstance(child, (str, bool, int, float)) else type(child).__name__})
            walk(child, f"{path}.{key}", keys, values, samples)
    elif isinstance(value, list):
        for index, child in enumerate(value):
            walk(child, f"{path}[{index}]", keys, values, samples)
    elif isinstance(value, str):
        value_token = token_for(value)
        if value_token:
            values[value_token] += 1
            if len(samples) < 12:
                samples.append({"path": path, "kind": "value", "token": value_token, "value": value[:240]})


def data_paths() -> list[Path]:
    # The product's authoritative JSON is concentrated in these directories.
    # Raw source downloads/extracts and generated resource payloads are not
    # review-state authorities and made the original recursive scan take
    # several minutes without improving the disposition queue.
    paths: list[Path] = []
    for directory in (HERE, HERE / "_audit", HERE / "ccmas", HERE / "enrichment", HERE / "jamb", HERE / "taxonomies"):
        if not directory.exists():
            continue
        for path in directory.glob("*.json"):
            if path.name in SKIP_FILES or path.name in HISTORICAL_BEFORE_STATE_FILES or path.stat().st_size > MAX_SCAN_FILE_BYTES:
                continue
            paths.append(path)
    return sorted(set(paths))


def exact_state_counts(value, counts: Counter) -> None:
    """Count only exact status values, avoiding substring inflation."""
    if isinstance(value, dict):
        for child in value.values():
            exact_state_counts(child, counts)
    elif isinstance(value, list):
        for child in value:
            exact_state_counts(child, counts)
    elif isinstance(value, str):
        normalized = value.strip().lower()
        if normalized in TOKENS:
            counts[normalized] += 1


def main() -> None:
    files = []
    total_tokens = Counter()
    parse_errors = []
    for path in data_paths():
        try:
            root = load(path)
        except (OSError, json.JSONDecodeError) as exc:
            parse_errors.append({"file": str(path.relative_to(HERE)), "error": str(exc)})
            continue
        values: Counter = Counter()
        exact_state_counts(root, values)
        counts = values
        if not counts:
            continue
        total_tokens.update(counts)
        files.append({
            "file": str(path.relative_to(HERE)),
            "finding_count": sum(counts.values()),
            "token_counts": dict(counts),
            "samples": [],
            "scan_mode": "structured_exact_state_values",
            "file_size": path.stat().st_size,
        })
    files.sort(key=lambda row: (-row["finding_count"], row["file"]))
    out = {
        "schema_version": "2026-09-01.review-state-inventory.v1",
        "purpose": "Repository-wide inventory of explicit review, unresolved, pending, partial and unavailable states before source completion and final SQL generation.",
        "scan_boundary": {
            "root": str(HERE.relative_to(HERE.parent)),
            "json_files_with_findings": len(files),
            "parse_error_count": len(parse_errors),
            "excluded_directories": sorted(SKIP_PARTS | SKIP_DIRS),
            "max_scanned_file_bytes": MAX_SCAN_FILE_BYTES,
            "excluded_files": sorted(SKIP_FILES),
            "historical_before_state_files": sorted(HISTORICAL_BEFORE_STATE_FILES),
            "excluded_large_projections": True,
        },
        "total_token_counts": dict(total_tokens),
        "parse_errors": parse_errors,
        "files": files,
    }
    AUDIT.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# Review-state inventory — 2026-09-01",
        "",
        "This is a repository-wide visibility report. A finding is not automatically an error: it is a state that must have a source, a disposition, or an explicit product boundary before final SQL generation. The preserved Nigerian CCMAS complement snapshot is excluded from current-state totals because it is a historical before-state; its completed disposition is counted in the reviewed-links artifact.",
        "",
        f"- JSON files scanned with findings: **{len(files)}**",
        f"- Parse errors: **{len(parse_errors)}**",
        f"- Total findings: **{sum(total_tokens.values())}**",
        "",
        "## Token totals",
        "",
        "| State token | Count |",
        "|---|---:|",
    ]
    for token, count in sorted(total_tokens.items(), key=lambda item: (-item[1], item[0])):
        lines.append(f"| `{token}` | {count} |")
    lines += [
        "",
        "## Files requiring disposition",
        "",
        "| File | Findings | States |",
        "|---|---:|---|",
    ]
    for row in files:
        states = ", ".join(f"`{k}`={v}" for k, v in sorted(row["token_counts"].items()))
        lines.append(f"| `{row['file']}` | {row['finding_count']} | {states} |")
    lines += [
        "",
        "## Disposition rule",
        "",
        "Each finding must be classified as source-completed, explicitly out of scope, intentionally unavailable, or unresolved and excluded from certified seed output. The inventory must be rerun after the source and taxonomy reviews; it is not a substitute for those reviews.",
        "",
        "## Reproducibility",
        "",
        "```text",
        "python data/career-mapping/_audit_review_state_inventory.py",
        "```",
    ]
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({"files": len(files), "total_findings": sum(total_tokens.values()), "parse_errors": len(parse_errors), "tokens": dict(total_tokens)}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

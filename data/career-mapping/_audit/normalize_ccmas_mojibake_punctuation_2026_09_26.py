"""Normalize the known UTF-8 replacement-sequence punctuation artifact."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ACCESS_DATE = "2026-09-26"
# The extracted JSON contains the Unicode replacement character.  We replace
# only that encoding artifact with a neutral en dash; no course wording is
# inferred or rewritten.
BAD = "\ufffd"
REPLACEMENT = "\u2013"


def normalize_value(value):
    if isinstance(value, str):
        return value.replace(BAD, REPLACEMENT), value.count(BAD)
    if isinstance(value, dict):
        normalized = {}
        count = 0
        for key, item in value.items():
            normalized_item, item_count = normalize_value(item)
            normalized[key] = normalized_item
            count += item_count
        return normalized, count
    if isinstance(value, list):
        changed = []
        count = 0
        for item in value:
            normalized, item_count = normalize_value(item)
            changed.append(normalized)
            count += item_count
        return changed, count
    return value, 0


def main() -> None:
    changed_files = []
    changed_rows = []
    occurrence_count = 0
    for path in sorted((ROOT / "ccmas").glob("*.json")):
        document = json.loads(path.read_text(encoding="utf-8"))
        document, file_count = normalize_value(document)
        if file_count:
            occurrence_count += file_count
            changed_rows.append({
                "source_file": path.name,
                "occurrences": file_count,
                "scope": "all JSON string values",
            })
        if file_count:
            path.write_text(json.dumps(document, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            changed_files.append({"source_file": path.name, "occurrences": file_count})

    log_path = ROOT / "_audit" / "ccmas_mojibake_normalization_2026-09-26.json"
    log_path.write_text(
        json.dumps(
            {
                "status": "encoding_only_normalization",
                "accessed_on": ACCESS_DATE,
                "replacement": {"from": BAD, "to": REPLACEMENT},
                "occurrence_count": occurrence_count,
                "changed_files": changed_files,
                "changed_rows": changed_rows,
                "rule": "This replaces the visible UTF-8 replacement-sequence artifact with a neutral en dash. It does not assert the original punctuation, change words, or infer course content.",
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    print(json.dumps({"occurrence_count": occurrence_count, "changed_files": len(changed_files), "log": str(log_path)}, indent=2))


if __name__ == "__main__":
    main()

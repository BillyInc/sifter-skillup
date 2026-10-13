"""Normalize the D001-only patch against its verified pre-edit HEAD text.

The initial guarded writer changed indentation within affected objects. This
repair restores the exact D001 source-object formatting, then inserts only the
review fields. It refuses if HEAD and the original D001 identity set differ.
"""
from __future__ import annotations

import json
import subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = Path(__file__).resolve().parents[5]
ROLE_LIBRARY = ROOT / "data/career-mapping/role_library_v3_cleaned.json"


def keyed_objects(text: str) -> dict[str, tuple[int, int, dict]]:
    decoder = json.JSONDecoder()
    start = text.find("[")
    cursor = start + 1
    found = {}
    while cursor < len(text):
        while cursor < len(text) and text[cursor] in " \t\r\n,":
            cursor += 1
        if cursor >= len(text) or text[cursor] == "]":
            break
        obj, end = decoder.raw_decode(text, cursor)
        key = f"{obj.get('domain_id')}|{obj.get('role_name')}"
        found[key] = (cursor, end, obj)
        cursor = end
    return found


def add_fields(raw: str, fields: dict) -> str:
    close = len(raw.rstrip()) - 1
    insert_at = raw.rfind("\n", 0, close)
    assert insert_at >= 0 and raw[insert_at + 1:close].strip() == "", "unexpected JSON object layout"
    last_content = insert_at - 1
    while raw[last_content].isspace():
        last_content -= 1
    prefix = raw[:last_content + 1] + ","
    fields_text = "\n" + ",\n".join(
        "  " + json.dumps(name, ensure_ascii=False) + ": " + json.dumps(value, ensure_ascii=False, allow_nan=True)
        for name, value in fields.items()
    )
    return prefix + fields_text + raw[insert_at:]


def main() -> None:
    current = ROLE_LIBRARY.read_text(encoding="utf-8")
    head_text = subprocess.run(
        ["git", "show", "HEAD:data/career-mapping/role_library_v3_cleaned.json"],
        cwd=ROOT, check=True, capture_output=True, text=True, encoding="utf-8",
    ).stdout
    now = keyed_objects(current)
    before = keyed_objects(head_text)
    keys = {key for key, (_, _, row) in now.items() if row.get("domain_id") == "D001"}
    head_keys = {key for key, (_, _, row) in before.items() if row.get("domain_id") == "D001"}
    assert keys == head_keys and len(keys) == 37, "D001 source identity set changed; refusing normalization"

    edits = []
    for key in keys:
        _, _, current_row = now[key]
        _, _, baseline_row = before[key]
        fields = {name: value for name, value in current_row.items() if name not in baseline_row}
        # Existing keys intentionally changed only for the five exclusions.
        for name in ("student_path_status", "student_path_exclusion_reason"):
            if current_row.get(name) != baseline_row.get(name):
                fields[name] = current_row[name]
        assert fields.get("domain_fit_review_status"), f"missing reviewed status for {key}"
        start, end, _ = now[key]
        base_start, base_end, _ = before[key]
        raw_baseline = head_text[base_start:base_end]
        edits.append((start, end, add_fields(raw_baseline, fields)))

    for start, end, replacement in sorted(edits, reverse=True):
        current = current[:start] + replacement + current[end:]
    json.loads(current)
    ROLE_LIBRARY.write_text(current, encoding="utf-8", newline="")
    print(f"Rewrote only {len(edits)} D001 role objects using their pre-edit source formatting.")


if __name__ == "__main__":
    main()

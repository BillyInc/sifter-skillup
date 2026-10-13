"""Recover the parseable portion of the D078 087-173 placement checkpoint.

This is a lossless audit repair, not a canonical promotion. Records without a
queue position are isolated as orphans and missing positions are reported;
nothing is invented or silently assigned.
"""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
SOURCE = ROOT / "data/career-mapping/_audit/d078_role_item_placement_lane_087-173_checkpoint_2026_10_09.json"
OUTPUT = ROOT / "data/career-mapping/_audit/D078_ROLE_ITEM_PLACEMENT_087-173_RECOVERY_2026_10_09.json"
MARKDOWN = ROOT / "docs/manual-review/D078_ROLE_ITEM_PLACEMENT_087-173_RECOVERY_2026_10_09.md"


def main() -> None:
    payload = json.loads(SOURCE.read_text(encoding="utf-8"))
    records = list(payload.get("records", []))
    positioned: list[dict] = []
    orphans: list[dict] = []
    for record in records:
        position = record.get("queue_position")
        if isinstance(position, int) and 87 <= position <= 173:
            positioned.append(record)
        else:
            orphans.append(record)

    by_position: dict[int, list[dict]] = {}
    for record in positioned:
        by_position.setdefault(record["queue_position"], []).append(record)
    duplicates = sorted(position for position, values in by_position.items() if len(values) > 1)
    unique_positions = sorted(by_position)
    expected = set(range(87, 174))
    missing = sorted(expected - set(unique_positions))

    recovered = dict(payload)
    recovered["schema_version"] = "2026-10-09.d078.role-item-placement-recovery.v1"
    recovered["status"] = "recovery_incomplete"
    recovered["source_artifact"] = str(SOURCE.relative_to(ROOT)).replace("\\", "/")
    recovered["records"] = [record for position in unique_positions for record in by_position[position]]
    recovered["orphan_records"] = orphans
    recovered["recovery_audit"] = {
        "source_record_count": len(records),
        "positioned_record_count": len(positioned),
        "unique_position_count": len(unique_positions),
        "orphan_record_count": len(orphans),
        "duplicate_positions": duplicates,
        "missing_positions": missing,
        "invented_records": 0,
        "student_display_approved": False,
    }
    OUTPUT.write_text(json.dumps(recovered, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    lines = [
        "# D078 placement checkpoint recovery — 087–173",
        "",
        "This is a local, lossless recovery artifact. It is not canonical and does not approve student display.",
        "",
        f"- Source records read: **{len(records)}**",
        f"- Positioned records preserved: **{len(positioned)}**",
        f"- Unique queue positions preserved: **{len(unique_positions)}**",
        f"- Orphan records isolated: **{len(orphans)}**",
        f"- Duplicate positions: **{', '.join(map(str, duplicates)) or 'none'}**",
        f"- Missing positions: **{', '.join(map(str, missing)) or 'none'}**",
        "- Invented records: **0**",
        "- Student display approval: **false**",
        "",
        "The orphan record is retained under `orphan_records` and must not be assigned a queue position without source evidence. Missing positions remain unresolved. Local schema normalization and dependency-graph construction must wait for complete agent lanes.",
        "",
    ]
    MARKDOWN.write_text("\n".join(lines), encoding="utf-8")


if __name__ == "__main__":
    main()

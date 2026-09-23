"""Read-only frequency selector for the full-population enrichment tranche.

The JSON catalogue in this checkout has a truncated gzip trailer. The numbered
SQL transport remains intact, so this helper reads only its item tuple prefix;
it never writes or changes generated transport.
"""

from __future__ import annotations

import collections
import gzip
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[4]
PARTS = ROOT / "backend" / "seed_career_context_items_v1_parts"
ITEM_PREFIX = re.compile(
    r"\((?:'((?:''|[^'])*)'|NULL),\s*"
    r"(?:'((?:''|[^'])*)'|NULL),\s*"
    r"(?:'((?:''|[^'])*)'|NULL),\s*"
    r"(?:'((?:''|[^'])*)'|NULL),\s*"
    r"(?:'((?:''|[^'])*)'|NULL),\s*"
    r"(?:'((?:''|[^'])*)'|NULL),"
)


def unquote(value: str | None) -> str:
    return (value or "").replace("''", "'")


def main() -> None:
    counts: collections.Counter[tuple[str, str]] = collections.Counter()
    examples: dict[tuple[str, str], tuple[str, str, str, str]] = {}
    rows = 0
    for part in sorted(PARTS.glob("part-*.sql.gz")):
        with gzip.open(part, "rt", encoding="utf-8") as handle:
            text = handle.read()
        item_sql = text.split("INSERT INTO skillup_dev.career_item_relationships", 1)[0]
        for match in ITEM_PREFIX.finditer(item_sql):
            level, context_key, domain_key, item_type, item_key, name = (
                unquote(value) for value in match.groups()
            )
            if context_key == "D078" or context_key.startswith("D078|"):
                continue
            rows += 1
            key = (item_type, name.casefold())
            counts[key] += 1
            examples.setdefault(key, (level, context_key, item_key, name))
    print({"rows": rows, "unique_item_names": len(counts)})
    for (item_type, normalized), frequency in counts.most_common(60):
        print(
            frequency,
            item_type,
            examples[(item_type, normalized)],
        )


if __name__ == "__main__":
    main()

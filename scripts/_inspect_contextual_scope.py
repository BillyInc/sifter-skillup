from __future__ import annotations

import gzip
import json
import sys


path = sys.argv[1] if len(sys.argv) > 1 else "data/career-mapping/contextual_guidance_items.json.gz"
with gzip.open(path, "rt", encoding="utf-8") as handle:
    data = json.load(handle)

rows = [
    row
    for row in data["items"]
    if row.get("context_key") == "D078" or str(row.get("context_key", "")).startswith("D078|")
]
print("items", len(rows))
for row in rows:
    print(
        row.get("context_level"),
        "|",
        row.get("context_key"),
        "|",
        row.get("item_type"),
        "|",
        row.get("item_key"),
        "|",
        row.get("name"),
        "| prereq=",
        row.get("prerequisites"),
        "| related=",
        row.get("related_items"),
    )

print("relationships", len(data.get("relationships", [])))
for edge in data.get("relationships", []):
    if edge.get("context_key") == "D078" or str(edge.get("context_key", "")).startswith("D078|"):
        print(
            "EDGE",
            edge.get("context_level"),
            edge.get("context_key"),
            edge.get("from_item_type"),
            edge.get("from_name"),
            edge.get("relationship_type"),
            edge.get("to_item_type"),
            edge.get("to_name"),
            edge.get("data_state"),
        )

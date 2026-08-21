"""Remove stale Direct-only provenance after tier demotions."""

import json
from pathlib import Path


path = Path(__file__).parent / "programme_domain_final.json"
mapping = json.loads(path.read_text(encoding="utf-8"))
cleaned = 0
for programme in mapping.values():
    for link in programme.get("links", []):
        if link.get("match_type") != "direct" and "direct_source" in link:
            del link["direct_source"]
            cleaned += 1
path.write_text(json.dumps(mapping, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
print(f"Removed {cleaned} stale direct_source fields.")

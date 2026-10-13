"""Remove a Speech-Language Therapy PST 503 row from Physiotherapy."""

from __future__ import annotations

import json
from pathlib import Path

SOURCE = Path(__file__).resolve().parents[1] / "ccmas" / "allied_health.json"
FOREIGN = ("PST 503", "Rehabilitation and Functional Training")


def main() -> None:
    document = json.loads(SOURCE.read_text(encoding="utf-8"))
    physio = [p for p in document["programmes"] if p.get("name") == "Physiotherapy"]
    if len(physio) != 1:
        raise SystemExit(f"Expected one Physiotherapy package; got {len(physio)}")
    matches = [c for c in physio[0]["courses"] if (c.get("code"), c.get("title")) == FOREIGN]
    if len(matches) != 1:
        raise SystemExit(f"Expected exactly one foreign PST 503 in Physiotherapy; got {len(matches)}")
    physio[0]["courses"] = [
        c for c in physio[0]["courses"] if (c.get("code"), c.get("title")) != FOREIGN
    ]
    if any((c.get("code"), c.get("title")) == FOREIGN for c in physio[0]["courses"]):
        raise SystemExit("PST 503 still present after attempted removal")
    SOURCE.write_text(json.dumps(document, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print("Removed Speech-Language Therapy PST 503 from Physiotherapy only.")


if __name__ == "__main__":
    main()

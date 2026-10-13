"""Repair duplicated/malformed FIP 211 outcomes and page spill."""

from __future__ import annotations

import json
from pathlib import Path

SOURCE = Path(__file__).resolve().parents[1] / "ccmas" / "arts.json"
URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf"
OUTCOMES = [
    "analyze the film value chain",
    "illustrate how all the discrete units of film combine into one seamless whole; and",
    "execute a film project from script to screen",
]
CONTENT = (
    "The class is split into groups so every member actively participates in the joint project. "
    "Each group executes an approximately 30-minute film through all production stages: the "
    "pro-filmic idea, script development, pre-production, production, post-production and exhibition. "
    "Completed projects are analysed in detail."
)


def main() -> None:
    document = json.loads(SOURCE.read_text(encoding="utf-8"))
    packages = [p for p in document["programmes"] if p.get("name") == "Film Production"]
    if len(packages) != 1:
        raise SystemExit(f"Expected one Film Production package; got {len(packages)}")
    rows = [c for c in packages[0]["courses"] if c.get("code") == "FIP 211"]
    if len(rows) != 1:
        raise SystemExit(f"Expected one FIP 211; got {len(rows)}")
    row = rows[0]
    if len(row.get("skills_learned", [])) != 5 or not str(row.get("content_summary", "")).startswith("New Arts 255"):
        raise SystemExit("FIP 211 no longer has the audited extraction shape; refusing edit")
    row.update(
        units=2,
        status="C",
        lh=0,
        ph=90,
        skills_learned=OUTCOMES,
        content_summary=CONTENT,
        source_url=URL,
        source_locator="Film Production FIP 211 course structure printed p. 244; outcomes/content printed pp. 254-255",
        source_accessed_on="2026-09-26",
    )
    SOURCE.write_text(json.dumps(document, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print("Repaired FIP 211 duplicate outcomes and page spill.")


if __name__ == "__main__":
    main()

"""Move weak CCMAS -> domain links out of active guidance.

The domain map remains the source of active guidance.  Links that have no
source-backed CCMAS course anchor, or a direct link supported by only one
ambiguous anchor, are retained under ``unverified_links`` for audit but are no
longer inherited by JAMB or university offerings.
"""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).parents[1]
MAPPING = ROOT / "data" / "career-mapping" / "programme_domain_final.json"
EVIDENCE = ROOT / "data" / "career-mapping" / "_audit" / "programme_domain_evidence_2026-08-17.json"


def main() -> None:
    mapping = json.loads(MAPPING.read_text(encoding="utf-8"))
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    removed = 0

    for programme_key, value in mapping.items():
        if not isinstance(value, dict):
            continue
        active = []
        unverified = list(value.get("unverified_links") or [])
        for link in value.get("links") or []:
            record = evidence.get(f"{programme_key}::{link.get('domain_id')}") or {}
            weak = record.get("course_anchor_quality") == "weak"
            ambiguous_direct = (
                link.get("match_type") == "direct"
                and record.get("course_anchor_quality") == "moderate"
            )
            if weak or ambiguous_direct:
                item = dict(link)
                item["review_exclusion_reason"] = (
                    "no source-backed CCMAS course anchor"
                    if weak
                    else "direct mapping has only one ambiguous CCMAS course anchor"
                )
                unverified.append(item)
                removed += 1
            else:
                active.append(link)
        value["links"] = active
        if unverified:
            value["unverified_links"] = unverified

    MAPPING.write_text(json.dumps(mapping, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Moved {removed} unverified programme-domain links out of active guidance.")


if __name__ == "__main__":
    main()

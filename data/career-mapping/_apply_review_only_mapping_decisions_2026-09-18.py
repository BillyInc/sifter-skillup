"""Apply the reviewed 2026-09-18 programme-to-domain decisions.

The seven entries in this manifest were labelled Adjacent by the old mapping
pass, but their CCMAS evidence either has no target-domain anchor or only a
generic communication/title hit.  They must not be shown as student-facing
career connections.  They are moved to ``unverified_links`` so the source
decision remains auditable and can be reconsidered later.
"""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).parent
MAPPING_PATH = ROOT / "programme_domain_final.json"
AUDIT_REF = "review_only_mapping_decisions_2026-09-18"
REASON = "removed from active guidance: adjacent mapping has no sufficient CCMAS target-domain evidence"

DECISIONS = {
    ("Administration and Management::Project Management", "D001"),
    ("Administration and Management::Securities and Investments Management", "D010"),
    ("Architecture::Naval Architecture", "D021"),
    ("Arts::African Languages and Literature Yoruba", "D168"),
    ("Education::Chemistry", "D122"),
    ("Sciences::Medicinal Chemistry", "D122"),
    ("Sciences::Zoology", "D122"),
}


def main() -> None:
    mapping = json.loads(MAPPING_PATH.read_text(encoding="utf-8"))
    moved: list[tuple[str, str]] = []

    for programme_key, domain_id in sorted(DECISIONS):
        record = mapping.get(programme_key)
        if not record:
            raise SystemExit(f"Missing programme in authoritative mapping: {programme_key}")
        active = [link for link in record.get("links", []) if link.get("domain_id") == domain_id]
        if len(active) != 1:
            raise SystemExit(
                f"Expected exactly one active link for {programme_key} -> {domain_id}; found {len(active)}"
            )
        link = dict(active[0])
        if link.get("match_type") != "adjacent":
            raise SystemExit(
                f"Expected Adjacent for {programme_key} -> {domain_id}; found {link.get('match_type')!r}"
            )

        record["links"] = [item for item in record.get("links", []) if item.get("domain_id") != domain_id]
        unverified = list(record.get("unverified_links") or [])
        link["review_exclusion_reason"] = REASON
        link["audit_ref"] = AUDIT_REF
        link["src"] = link.get("src") or "reconcile"
        if not any(item.get("domain_id") == domain_id for item in unverified):
            unverified.append(link)
        record["unverified_links"] = sorted(
            unverified,
            key=lambda item: (str(item.get("domain_id") or ""), str(item.get("match_type") or "")),
        )
        moved.append((programme_key, domain_id))

    MAPPING_PATH.write_text(json.dumps(mapping, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"Moved {len(moved)} review-only mappings out of active guidance.")
    for programme_key, domain_id in moved:
        print(f"  {programme_key} -> {domain_id}")


if __name__ == "__main__":
    main()

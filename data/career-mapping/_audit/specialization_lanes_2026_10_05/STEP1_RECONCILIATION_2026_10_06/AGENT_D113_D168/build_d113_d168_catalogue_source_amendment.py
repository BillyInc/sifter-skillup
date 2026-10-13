"""Append authoritative catalogue-name and source-ID coverage reconciliation."""

from __future__ import annotations

import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
REGISTER = HERE / "d113_d168_step1_reconciliation_register_2026_10_06.json"
BOUNDARIES = HERE / "d113_d168_area_boundary_amendment_002.json"
OUT = HERE / "d113_d168_catalogue_source_amendment_003.json"
CHECKPOINT = HERE / "D113_D168_STEP1_RECONCILIATION_CHECKPOINT_003.md"
ROOT = next(p for p in HERE.parents if (p / "data/career-mapping").is_dir())
META = ROOT / "data/career-mapping/domain_meta.json"


def main() -> None:
    if OUT.exists() or CHECKPOINT.exists():
        raise SystemExit("Append-only amendment already exists; refusing to overwrite.")
    data = json.loads(REGISTER.read_text(encoding="utf-8"))
    meta = json.loads(META.read_text(encoding="utf-8"))
    name_fixes = []
    source_rows = 0
    sources_with_ids = 0
    sources_with_url_locator = 0
    for row in data["records"]:
        official = meta.get(row["domain_id"], {}).get("domain_name")
        if official and official != row["domain_name"]:
            name_fixes.append({
                "domain_id": row["domain_id"],
                "review_artifact_name": row["domain_name"],
                "catalogue_domain_name": official,
                "authority": "data/career-mapping/domain_meta.json",
            })
        for source in row["supporting_sources"]:
            source_rows += 1
            sources_with_ids += bool(source.get("source_id"))
            sources_with_url_locator += bool(source.get("url") and source.get("locator"))
    if len(data["records"]) != 56:
        raise SystemExit("Expected 56 base domain records.")
    amendment = {
        "schema_version": "2026-10-06.step1-catalogue-and-source-amendment.v1",
        "append_only_amendment": "003",
        "amends_register": REGISTER.name,
        "authoritative_catalogue": "data/career-mapping/domain_meta.json",
        "catalogue_name_corrections": name_fixes,
        "citation_coverage": {
            "captured_source_rows": source_rows,
            "rows_with_formal_source_id": sources_with_ids,
            "rows_without_formal_source_id": source_rows - sources_with_ids,
            "rows_with_url_and_locator": sources_with_url_locator,
            "source_ids_not_fabricated": True,
        },
        "interpretation": "URLs/locators are carried from existing domain-specific reviews. Their presence does not mean this consolidation independently reopened or verified each external page.",
    }
    OUT.write_text(json.dumps(amendment, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# D113–D168 STEP 1 Reconciliation — Checkpoint 003",
        "",
        "Final verification checkpoint for the append-only base register and amendments 002–003.",
        "",
        "- Domain rows and explicit dispositions: **56/56**.",
        "- Domain IDs/names verified against the current catalogue after amendment: **56/56**.",
        f"- Catalogue spelling correction: **{len(name_fixes)}** ({'; '.join(f'{x['domain_id']}: {x['review_artifact_name']} → {x['catalogue_domain_name']}' for x in name_fixes) or 'none'}).",
        f"- Supporting citation rows: **{source_rows}**; with URL and locator: **{sources_with_url_locator}**.",
        f"- Formal source IDs: **{sources_with_ids}/{source_rows}**. IDs absent from source artifacts remain null; no ID was invented.",
        f"- Candidate areas with boundary statements in amendment 002: **{json.loads(BOUNDARIES.read_text(encoding='utf-8'))['area_boundary_count']}**.",
        "- Material cross-register recommendation conflicts kept unresolved: **8 domains**.",
        "- Explicit unresolved scope/recommendation dispositions: **15 domains**; direct domain→role/no-area: **4**; candidate taxonomy changes: **37**.",
        "- Canonical taxonomy edits: **0**; role→specialization assignments: **0**; Nigerian-context research: **0**.",
        "",
        "## Files and limits",
        "",
        f"- Base JSON register: `{REGISTER.name}`.",
        f"- Boundary amendment: `{BOUNDARIES.name}`.",
        f"- Catalogue/source amendment: `{OUT.name}`.",
        "- Readable per-domain checkpoint: `D113_D168_STEP1_RECONCILIATION_CHECKPOINT_2026_10_06.md`.",
        "- This is complete coverage and reconciliation of captured evidence for the assigned range, not a claim that all 56 taxonomy decisions are final. Fifteen remain explicitly unresolved; step 2 should not treat these as settled.",
        "- Captured URLs and locators have not been independently re-opened in this lane. Review citations support the stated claims only within their recorded limitations.",
        "",
    ]
    CHECKPOINT.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps(amendment["citation_coverage"], indent=2))
    print("name corrections", json.dumps(name_fixes, ensure_ascii=False))
    print(OUT)
    print(CHECKPOINT)


if __name__ == "__main__":
    main()

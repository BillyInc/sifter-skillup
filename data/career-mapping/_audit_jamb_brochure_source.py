"""Check the current JAMB bridge against the supplied original brochure PDFs.

This is a source-completeness audit only.  It does not change the JAMB bridge:
the brochure contains the names offered in the source catalogue, while the
CCMAS inheritance contract remains governed by the repository mapping files.
"""

from __future__ import annotations

import json
import re
import unicodedata
from pathlib import Path

from pypdf import PdfReader


ROOT = Path(__file__).parent
BROCHURE_ROOT = Path(r"C:\Users\USER\Downloads\jamb brochure")
PROGRAMME_MAPPING = ROOT / "programme_mapping.json"
REPORT_JSON = ROOT / "_audit" / "jamb_brochure_source_audit_2026-08-17.json"
REPORT_MD = ROOT / "_audit" / "jamb_brochure_source_audit_2026-08-17.md"

CATALOGUE_FILES = [
    "Administration.pdf",
    "Agriculture.pdf",
    "Arts _ Humanities.pdf",
    "Education.pdf",
    "Engineering _ Enviromental _ Technology.pdf",
    "Law.pdf",
    "Medica_Pharmaceutical Health Science.pdf",
    "Sciences.pdf",
    "Social Management Science.pdf",
]

# These are deliberately audit aliases, not silent renames in the bridge.
# They account for annotations, slash-combined labels, and wording variants
# visible in the supplied PDFs.  Alias hits remain reviewable in the report.
SOURCE_ALIASES = {
    "Criminology and Security Studies (printed under Law faculty block)": ["Criminology and Security Studies"],
    "Economics with/and Operation Research": ["Economics and Operation Research"],
    "Industrial Relations / Industrial and Labour Relations": ["Industrial Relations", "Industrial and Labour Relations"],
    "Industrial Relations and Personnel Management / Industrial Relations and Human Resource Management": ["Industrial Relations and Personnel Management", "Industrial Relations"],
    "Office and Information Technology / Information Resource Management": ["Office and Information Management", "Information Resource Management"],
    "Employment and Human Resource Management": ["Human Resources Management"],
    "Mathematics with Statistics / Mathematics/Statistics / Mathematics and Statistics": ["Mathematics with Statistics", "Mathematics/Statistics"],
    "Applied Microbiology and Brewing / Applied Microbiology": ["Applied Microbiology and Brewing", "Applied Microbiology"],
    "Mathematics and Economics / Mathematics with Economics": ["Mathematics and Economics"],
    "Physics with Computational Modeling": ["Physics / Computational Modeling"],
    "Physical Sciences (with options in i. Industrial Physics, ii. Physics with Electronics)": ["Physical Sciences", "Industrial Physics", "Physics with Electronics"],
    "Marine Science and Technology": ["Marine Science"],
    "Arabic Language and Literature Studies": ["Arabic Language and Literature"],
    "Environmental Science and Technology": ["Environmental Technology"],
    "Environmental Management and Technology": ["Environmental Management Technology"],
    "Sport Management (Education)": ["Sport Management"],
}


def normalize(value: str) -> str:
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode()
    value = value.lower().replace("&", " and ")
    return re.sub(r"[^a-z0-9]+", "", value)


def main() -> None:
    mappings = json.loads(PROGRAMME_MAPPING.read_text(encoding="utf-8")).get("mappings") or []
    if not BROCHURE_ROOT.exists():
        report = {
            "status": "source_directory_missing",
            "source_directory": str(BROCHURE_ROOT),
            "mapping_rows": len(mappings),
        }
        REPORT_JSON.parent.mkdir(exist_ok=True)
        REPORT_JSON.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
        REPORT_MD.write_text("# JAMB brochure source audit\n\nSource directory was not available.\n", encoding="utf-8")
        return

    pages_by_file: dict[str, list[str]] = {}
    for filename in CATALOGUE_FILES:
        path = BROCHURE_ROOT / filename
        if not path.exists():
            continue
        pages_by_file[filename] = [page.extract_text() or "" for page in PdfReader(str(path)).pages]

    source_matches = []
    for row in mappings:
        jamb_name = row["jamb_name"]
        needle = normalize(jamb_name)
        hits = []
        matched_name = jamb_name if any(
            needle and needle in normalize(page)
            for pages in pages_by_file.values()
            for page in pages
        ) else None
        aliases = SOURCE_ALIASES.get(jamb_name, [])
        for filename, pages in pages_by_file.items():
            page_numbers = [index + 1 for index, page in enumerate(pages) if needle and needle in normalize(page)]
            if page_numbers:
                hits.append({"file": filename, "pages": page_numbers})
        alias_hits = []
        if not matched_name:
            for alias in aliases:
                alias_needle = normalize(alias)
                for filename, pages in pages_by_file.items():
                    page_numbers = [index + 1 for index, page in enumerate(pages) if alias_needle and alias_needle in normalize(page)]
                    if page_numbers:
                        alias_hits.append({"alias": alias, "file": filename, "pages": page_numbers})
            if alias_hits:
                matched_name = aliases[0]
        source_matches.append({
            "jamb_name": jamb_name,
            "mapping_type": row.get("mapping_type"),
            "source_status": "matched_in_catalogue" if hits else (
                "matched_via_declared_alias" if alias_hits else "not_exactly_matched_in_catalogue"
            ),
            "source_hits": hits,
            "source_alias_hits": alias_hits,
            "mapping_note": row.get("mapping_note"),
        })

    matched = [row for row in source_matches if row["source_status"] == "matched_in_catalogue"]
    alias_matched = [row for row in source_matches if row["source_status"] == "matched_via_declared_alias"]
    unmatched = [row for row in source_matches if row["source_status"] == "not_exactly_matched_in_catalogue"]
    by_type = {}
    for row in source_matches:
        by_type.setdefault(row["mapping_type"], {"rows": 0, "exact": 0, "alias": 0, "unmatched": 0})
        by_type[row["mapping_type"]]["rows"] += 1
        bucket = {
            "matched_in_catalogue": "exact",
            "matched_via_declared_alias": "alias",
            "not_exactly_matched_in_catalogue": "unmatched",
        }[row["source_status"]]
        by_type[row["mapping_type"]][bucket] += 1

    report = {
        "schema_version": 1,
        "status": "complete",
        "source_directory": str(BROCHURE_ROOT),
        "source_files": list(pages_by_file),
        "source_contract": "The brochure proves catalogue-name presence only; CCMAS inheritance and domain links come from repository mapping artifacts.",
        "mapping_rows": len(source_matches),
        "exact_catalogue_matches": len(matched),
        "declared_alias_matches": len(alias_matched),
        "not_exactly_matched_catalogue_rows": len(unmatched),
        "coverage_percent": round(((len(matched) + len(alias_matched)) / len(source_matches)) * 100, 2) if source_matches else 0,
        "coverage_by_mapping_type": by_type,
        "rows": source_matches,
        "unmatched_rows": unmatched,
    }
    REPORT_JSON.parent.mkdir(exist_ok=True)
    REPORT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# JAMB brochure source audit — 2026-08-17",
        "",
        f"Source: `{BROCHURE_ROOT}`",
        "",
        "This audit checks whether each current JAMB bridge name appears in the supplied programme-catalogue PDFs. It does not treat a name match as proof of CCMAS curriculum inheritance.",
        "",
        f"- Bridge rows checked: **{len(source_matches)}**",
        f"- Exact normalized catalogue matches: **{len(matched)}** ({round((len(matched) / len(source_matches)) * 100, 2)}%)",
        f"- Resolved with exact name or declared alias: **{len(matched) + len(alias_matched)}** ({report['coverage_percent']}%)",
        f"- Declared alias matches requiring manual confirmation: **{len(alias_matched)}**",
        f"- Rows with no exact or declared-alias hit: **{len(unmatched)}**",
        "",
        "## Rows needing review",
        "",
    ]
    for row in alias_matched:
        aliases = ", ".join(f"`{item['alias']}`" for item in row["source_alias_hits"])
        lines.append(f"- `{row['jamb_name']}` — declared source alias: {aliases}")
    if alias_matched:
        lines.extend(["", "These aliases still require manual confirmation because the bridge label is not an exact brochure string.", ""])
    for row in unmatched:
        lines.append(f"- `{row['jamb_name']}` — {row.get('mapping_note') or 'no mapping note'}")
    lines.extend([
        "",
        "Declared aliases are not silent bridge renames: they are source references for annotations, slash-combined labels, and wording variants. They remain manual-review items before being treated as exact brochure names.",
        "",
    ])
    REPORT_MD.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps({
        "status": report["status"],
        "mapping_rows": len(source_matches),
        "exact_catalogue_matches": len(matched),
        "not_exactly_matched_catalogue_rows": len(unmatched),
        "coverage_percent": report["coverage_percent"],
    }, indent=2))


if __name__ == "__main__":
    main()

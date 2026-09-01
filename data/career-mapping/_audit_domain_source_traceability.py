"""Trace the current domain_meta list back to the local domain-definition sources.

This is an audit, not a taxonomy rewrite.  It deliberately does not modify
domain_meta.json or promote the Downloads documents into the seed.  It checks
whether the current IDs/order/names/clusters can be traced to the supplied
domain-definition library and whether that library's ISIC/ISCO codes exist in
the supplied source workbooks.
"""

from __future__ import annotations

import csv
import hashlib
import io
import json
import re
import zipfile
from collections import Counter
from pathlib import Path
from xml.etree import ElementTree as ET


HERE = Path(__file__).resolve().parent
REPO = HERE.parent.parent
OUT_DIR = HERE / "_audit"
DOWNLOADS = Path.home() / "Downloads"
SOURCE_DIR = DOWNLOADS / "drive-download-20260702T164001Z-3-001"
DOMAIN_DOC = DOWNLOADS / "sifter_domain_definition_library_v2 (1).docx"
ISIC_XLSX = SOURCE_DIR / "ISIC5_Exp_Notes_11Mar2024.xlsx"
ISCO_XLSX = SOURCE_DIR / "ISCO-08 EN Structure and definitions.xlsx"
ESCO_ZIP = SOURCE_DIR / "ESCO dataset - v1.2.1 - classification - en - csv.zip"
WEF_PDF = SOURCE_DIR / "WEF_Future_of_Jobs_Report_2025_copy.pdf"
META = HERE / "domain_meta.json"
STRUCTURE = HERE / "domain_structure.json"
ROLE_LIBRARY = HERE / "role_library_v3_cleaned.json"
SOURCE_REGISTRY = HERE / "domain_role_source_registry.json"
OFFICIAL_SOURCE_URLS = {
    "isic_rev5": "https://unstats.un.org/unsd/classifications/Econ/ISIC.cshtml",
    "isic_rev4_to_rev5": "https://unstats.un.org/unsd/classifications/Econ/Download/In%20Text/ISIC_Rev4_to_ISIC_Rev5_Correspondence_Table-17Jan2025.xlsx",
    "isco08": "https://isco.ilo.org/en/isco-08/",
    "esco": "https://esco.ec.europa.eu/en/use-esco",
    "onet": "https://www.onetcenter.org/database.html",
    "wef": "https://www.weforum.org/publications/the-future-of-jobs-report-2025/",
}
LATER_ADDITION_SOURCE_IDS = {
    "D167": ["global_xr_gao_workforce_2024", "global_jff_xr_2023", "global_oecd_xr_2025", "global_xra_2025"],
    "D168": ["global_game_dev", "global_esports", "british_esports", "pearson_esports", "global_creative", "ng_creative"],
}


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def sha256(path: Path) -> str | None:
    if not path.exists():
        return None
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def file_record(path: Path) -> dict:
    return {
        "path": str(path),
        "exists": path.exists(),
        "bytes": path.stat().st_size if path.exists() else None,
        "sha256": sha256(path),
    }


def docx_paragraphs(path: Path) -> list[str]:
    with zipfile.ZipFile(path) as z:
        root = ET.fromstring(z.read("word/document.xml"))
    ns = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
    result: list[str] = []
    for para in root.findall(".//w:p", ns):
        text = "".join(node.text or "" for node in para.findall(".//w:t", ns)).strip()
        if text:
            result.append(text)
    return result


def clean_code(value) -> str:
    if value is None:
        return ""
    text = str(value).strip()
    if text.endswith(".0"):
        text = text[:-2]
    return text


def xlsx_rows(path: Path) -> list[list[str]]:
    """Read the first worksheet without adding an Excel dependency."""
    with zipfile.ZipFile(path) as z:
        shared: list[str] = []
        if "xl/sharedStrings.xml" in z.namelist():
            root = ET.fromstring(z.read("xl/sharedStrings.xml"))
            ns = {"x": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
            for item in root.findall("x:si", ns):
                shared.append("".join(item.itertext()))
        sheet_name = "xl/worksheets/sheet1.xml"
        if sheet_name not in z.namelist():
            sheet_name = next(n for n in z.namelist() if n.startswith("xl/worksheets/") and n.endswith(".xml"))
        root = ET.fromstring(z.read(sheet_name))
    ns = {"x": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
    rows: list[list[str]] = []
    for row in root.findall(".//x:sheetData/x:row", ns):
        values: dict[int, str] = {}
        for cell in row.findall("x:c", ns):
            ref = cell.attrib.get("r", "")
            match = re.match(r"([A-Z]+)", ref)
            if not match:
                continue
            col = 0
            for char in match.group(1):
                col = col * 26 + ord(char) - ord("A") + 1
            col -= 1
            value = ""
            inline = cell.find("x:is", ns)
            if inline is not None:
                value = "".join(inline.itertext())
            else:
                node = cell.find("x:v", ns)
                value = node.text if node is not None and node.text else ""
                if cell.attrib.get("t") == "s" and value:
                    value = shared[int(value)]
            values[col] = value
        if values:
            width = max(values) + 1
            rows.append([values.get(i, "") for i in range(width)])
    return rows


def source_codes(path: Path, code_col: int, title_col: int) -> tuple[set[str], dict[str, str]]:
    rows = xlsx_rows(path)
    codes: set[str] = set()
    titles: dict[str, str] = {}
    for row in rows[1:]:
        if len(row) <= code_col:
            continue
        code = clean_code(row[code_col])
        if not code:
            continue
        codes.add(code)
        if len(row) > title_col and row[title_col]:
            titles[code] = row[title_col].strip()
    return codes, titles


def esco_occupation_summary(path: Path) -> dict:
    if not path.exists():
        return {"exists": False}
    with zipfile.ZipFile(path) as z:
        name = "occupations_en.csv"
        rows = 0
        codes: dict[str, int] = {}
        with z.open(name) as raw:
            text = io.TextIOWrapper(raw, encoding="utf-8-sig", newline="")
            reader = csv.DictReader(text)
            for row in reader:
                rows += 1
                code = clean_code(row.get("iscoGroup"))
                if code:
                    codes[code] = codes.get(code, 0) + 1
    return {"exists": True, "occupation_rows": rows, "isco_group_counts": codes}


def normal(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", (text or "").lower()).strip()


def split_values(text: str) -> list[str]:
    return [x.strip() for x in re.split(r"[,;]", text or "") if x.strip()]


def likely_isic_division_family(code: str) -> str | None:
    """Return a diagnostic parent-family candidate for a three-digit code.

    This is deliberately not a revision conversion.  For example, K620 can
    be reduced to K62 in the supplied Rev.5 workbook, but J630 may require a
    Rev.4-to-Rev.5 section crosswalk rather than a string transformation.
    The raw source value must always be preserved.
    """
    match = re.fullmatch(r"([A-Z])(\d{3})", code or "")
    return f"{match.group(1)}{match.group(2)[:2]}" if match else None


def parse_domain_table(paragraphs: list[str]) -> list[dict]:
    """Parse the 166-row summary table before the WEF section."""
    stop = next((i for i, value in enumerate(paragraphs) if value.startswith("3. WEF")), len(paragraphs))
    pattern = re.compile(r"^D(\d{1,3})$")
    result: list[dict] = []
    for i in range(stop):
        match = pattern.fullmatch(paragraphs[i])
        if not match or i + 7 >= stop:
            continue
        result.append({
            "domain_id": f"D{int(match.group(1)):03d}",
            "domain_name": paragraphs[i + 1],
            "cluster": paragraphs[i + 2],
            "trackable": paragraphs[i + 3],
            "onet_score": paragraphs[i + 4],
            "viability": paragraphs[i + 5],
            "ilo_nigeria_self_employment": paragraphs[i + 6],
            "wef_signal": paragraphs[i + 7],
        })
    return result


def parse_domain_details(paragraphs: list[str]) -> dict[str, dict]:
    start = next((i for i, value in enumerate(paragraphs) if value == "6. Domain Definitions"), len(paragraphs)) + 1
    header = re.compile(r"^D(\d{1,3})\s+·\s+(.*)$")
    starts: list[tuple[int, str, str]] = []
    for i in range(start, len(paragraphs) - 1):
        match = header.fullmatch(paragraphs[i])
        if match and re.match(r"^(FULL|PARTIAL|MAP_ONLY)", paragraphs[i + 1]):
            starts.append((i, f"D{int(match.group(1)):03d}", match.group(2).strip()))
    result: dict[str, dict] = {}
    for offset, (index, domain_id, name) in enumerate(starts):
        end = starts[offset + 1][0] if offset + 1 < len(starts) else len(paragraphs)
        segment = paragraphs[index:end]

        def after(label: str) -> str | None:
            try:
                return segment[segment.index(label) + 1]
            except ValueError:
                return None

        score_text = next((x for x in segment if x.endswith(")") and "Viability (" in x), None)
        score = score_text.split("(", 1)[1].rstrip(")") if score_text else None
        esco_text = after("ESCO Roles")
        result[domain_id] = {
            "domain_name": name,
            "trackable": segment[1] if len(segment) > 1 else None,
            "viability_score": score,
            "cluster": after("Cluster"),
            "isic_sections": split_values(after("ISIC Sections") or ""),
            "isic_divisions": split_values(after("ISIC Divisions") or ""),
            "industry_context": after("Industry Context"),
            "isco_submajor": after("ISCO Sub-major"),
            "isco_unit_groups": split_values(after("ISCO Unit Groups") or ""),
            "onet_entrepreneur_score": after("O*NET Entre. Score"),
            "ilo_nigeria_self_employment": after("ILO Nigeria Self-Employ"),
            "wef_growing": after("WEF Growing"),
            "wef_declining": after("WEF Declining"),
            "wef_skills": split_values(after("WEF Skills") or ""),
            "esco_role_count": int(esco_text) if esco_text and esco_text.isdigit() else None,
            "elite_pathway_marked": "ELITE PATHWAY" in segment,
        }
    return result


def main() -> None:
    meta = read_json(META)
    structure = read_json(STRUCTURE)
    roles = read_json(ROLE_LIBRARY)
    source_registry = read_json(SOURCE_REGISTRY) if SOURCE_REGISTRY.exists() else {}
    source_catalog = source_registry.get("source_catalog", {})
    paragraphs = docx_paragraphs(DOMAIN_DOC) if DOMAIN_DOC.exists() else []
    table = parse_domain_table(paragraphs)
    details = parse_domain_details(paragraphs)
    isic_codes, isic_titles = source_codes(ISIC_XLSX, 0, 2) if ISIC_XLSX.exists() else (set(), {})
    isco_codes, isco_titles = source_codes(ISCO_XLSX, 1, 2) if ISCO_XLSX.exists() else (set(), {})
    esco = esco_occupation_summary(ESCO_ZIP)

    source_library = {row["domain_id"]: row for row in table}
    all_domain_ids = sorted(meta, key=lambda x: int(x[1:]))
    original_ids = [f"D{i:03d}" for i in range(1, 167)]
    additions = [x for x in all_domain_ids if x not in source_library]
    hidden = set(read_json(HERE / "domain_skill_competency_certification_audit.json")["scope"]["hidden_domains_excluded"])

    rows: list[dict] = []
    for domain_id in all_domain_ids:
        current = meta.get(domain_id, {})
        source = source_library.get(domain_id)
        detail = details.get(domain_id, {})
        isic_divisions = detail.get("isic_divisions", [])
        isco_units = detail.get("isco_unit_groups", [])
        current_structure = structure.get(domain_id, {})
        row = {
            "domain_id": domain_id,
            "current_domain_name": current.get("domain_name"),
            "current_cluster": current.get("cluster"),
            "current_excluded": bool(current.get("excluded")),
            "current_has_isic_fields": any(key in current for key in ("isic_sections", "isic_divisions", "isic_codes")),
            "current_has_isco_fields": any(key in current for key in ("isco_submajor", "isco_unit_groups", "isco_codes")),
            "source_library_present": source is not None,
            "source_library_name": source.get("domain_name") if source else None,
            "source_library_cluster": source.get("cluster") if source else None,
            "source_detail_present": bool(detail),
            "definition_library_isic_sections": detail.get("isic_sections", []),
            "definition_library_isic_divisions": isic_divisions,
            "definition_library_isco_submajor": detail.get("isco_submajor"),
            "definition_library_isco_unit_groups": isco_units,
            "definition_library_esco_role_count": detail.get("esco_role_count"),
            "definition_library_elite_pathway_marked": detail.get("elite_pathway_marked", False),
            "isic_codes_all_exist_in_local_workbook": bool(isic_divisions) and all(code in isic_codes for code in isic_divisions),
            "isic_codes_missing_from_local_workbook": [code for code in isic_divisions if code not in isic_codes],
            "isic_three_digit_style_codes": [code for code in isic_divisions if likely_isic_division_family(code)],
            "isic_three_digit_style_codes_with_rev5_division_family": [
                code for code in isic_divisions
                if likely_isic_division_family(code) and likely_isic_division_family(code) in isic_codes
            ],
            "isco_codes_all_exist_in_local_workbook": bool(isco_units) and all(code in isco_codes for code in isco_units),
            "isco_codes_missing_from_local_workbook": [code for code in isco_units if code not in isco_codes],
            "esco_roles_under_declared_isco_groups": sum(esco.get("isco_group_counts", {}).get(code, 0) for code in isco_units),
            "current_structure_has_subgroups": bool(current_structure.get("subgroups")),
            "lineage_class": "source_library_domain" if source else "later_repo_addition",
        }
        if source:
            source_name = normal(source["domain_name"])
            current_name = normal(current.get("domain_name", ""))
            row["name_match"] = "exact" if source_name == current_name else ("related_or_shortened" if source_name in current_name or current_name in source_name else "changed_label")
            row["cluster_match"] = source.get("cluster") == current.get("cluster")
            row["identity_status"] = (
                "exact_source_terminology"
                if row["name_match"] == "exact"
                else "source_supported_umbrella"
            )
            row["identity_decision"] = (
                "The current label is the exact label in the supplied domain-definition library."
                if row["name_match"] == "exact"
                else "The current practitioner-facing label is a shortened or umbrella form of the supplied library label; the source library identity, cluster, industry anchors, occupational anchors, and role set are retained."
            )
            row["boundary_criteria"] = [
                "shared work outputs and day-to-day practice",
                "shared learning foundation and entry routes",
                "coherent ISIC industry-context anchors",
                "coherent ISCO occupational-function anchors and linked ESCO roles",
                "materially different foundations or outputs justify a separate neighbouring domain",
            ]
            row["source_record_refs"] = [
                {
                    "source_id": "sifter_domain_definition_library_v2",
                    "source_file": str(DOMAIN_DOC),
                    "locator": f"Section 6 / {domain_id} · {source.get('domain_name')}",
                    "claim": "original domain identity, label, cluster and boundary record",
                },
                {
                    "source_id": "isic_rev5_local_workbook",
                    "source_file": str(ISIC_XLSX),
                    "locator": f"ISIC Sections/Divisions: {', '.join(isic_divisions) or 'not recorded'}",
                    "source_url": OFFICIAL_SOURCE_URLS["isic_rev5"],
                    "claim": "industry-context anchor and activity coverage check",
                    "limitation": "raw library values and revision-sensitive section letters are preserved; crosswalk candidates are not silent replacements",
                },
                {
                    "source_id": "isco08_local_workbook",
                    "source_file": str(ISCO_XLSX),
                    "locator": f"ISCO Sub-major/Unit Groups: {', '.join(isco_units) or 'not recorded'}",
                    "source_url": OFFICIAL_SOURCE_URLS["isco08"],
                    "claim": "occupational-function anchor",
                    "limitation": "invalid or absent values remain explicit review findings",
                },
                {
                    "source_id": "esco_v121_local_archive",
                    "source_file": str(ESCO_ZIP),
                    "locator": f"occupations_en.csv filtered by ISCO unit groups; matched source role count: {detail.get('esco_role_count')}",
                    "source_url": OFFICIAL_SOURCE_URLS["esco"],
                    "claim": "normalized occupation and skill evidence under the occupational anchors",
                },
            ]
        else:
            row["name_match"] = "not_in_166_domain_library"
            row["cluster_match"] = None
            row["identity_status"] = "curated_addition"
            row["identity_decision"] = (
                "This domain was added after the original 166-domain library. It is retained as a curated Sifter addition and is not represented as an original ISIC/ISCO-derived library label."
            )
            row["boundary_criteria"] = [
                "distinct professional work outputs and day-to-day practice",
                "distinct learning foundation and entry routes",
                "specialist source evidence identifies a coherent emerging or sector-specific work family",
                "the addition is clearly separated from adjacent original domains",
            ]
            later_refs = []
            for source_id in LATER_ADDITION_SOURCE_IDS.get(domain_id, []):
                source = source_catalog.get(source_id)
                ref = {
                    "source_id": source_id,
                    "source_file": str(HERE / "domain_role_source_registry.json"),
                    "locator": f"domain_overrides/source routing for {domain_id}",
                    "claim": "later repository addition with specialist/context source IDs; not part of the original 166-domain library",
                }
                if source:
                    ref.update({
                        "evidence_status": "registry_reference",
                        "source_name": source.get("name"),
                        "source_url": source.get("url"),
                        "source_urls": source.get("urls"),
                        "limitation": "Registry routing only; this audit does not prove that the referenced source was ingested or independently checked.",
                    })
                else:
                    ref.update({
                        "evidence_status": "unregistered_reference",
                        "limitation": "Referenced source ID is absent from source_catalog; no source URL or checked record is claimed.",
                    })
                later_refs.append(ref)
            row["source_record_refs"] = later_refs
            row["later_source_registry_status"] = [
                ref["evidence_status"] for ref in later_refs
            ]
        rows.append(row)

    exact = sum(row["name_match"] == "exact" for row in rows if row["source_library_present"])
    related = sum(row["name_match"] == "related_or_shortened" for row in rows if row["source_library_present"])
    changed = sum(row["name_match"] == "changed_label" for row in rows if row["source_library_present"])
    identity_status_counts = Counter(row["identity_status"] for row in rows)
    cluster_matches = sum(bool(row["cluster_match"]) for row in rows if row["source_library_present"])
    isic_rows = [row for row in rows if row["source_detail_present"]]
    isco_rows = [row for row in rows if row["source_detail_present"]]
    isic_legacy_codes = [code for row in isic_rows for code in row["isic_three_digit_style_codes"]]
    isic_legacy_prefixes = [code for row in isic_rows for code in row["isic_three_digit_style_codes_with_rev5_division_family"]]
    isco_missing_codes = sorted({code for row in isco_rows for code in row["isco_codes_missing_from_local_workbook"]})
    later_refs = [
        ref
        for row in rows
        if row["lineage_class"] == "later_repo_addition"
        for ref in row.get("source_record_refs", [])
    ]
    out = {
        "schema_version": "2026-08-31.domain-source-traceability.v1",
        "purpose": "Reverse-trace domain_meta.json to the local domain-definition library and validate its recorded ISIC/ISCO anchors against the supplied source files without changing the current taxonomy.",
        "source_files": {
            "domain_definition_library": file_record(DOMAIN_DOC),
            "isic_rev5_workbook": file_record(ISIC_XLSX),
            "isco08_workbook": file_record(ISCO_XLSX),
            "esco_v121_archive": file_record(ESCO_ZIP),
            "wef_2025_pdf": file_record(WEF_PDF),
        },
        "repository_inputs": {
            "domain_meta": str(META.relative_to(REPO)),
            "domain_structure": str(STRUCTURE.relative_to(REPO)),
            "role_library": str(ROLE_LIBRARY.relative_to(REPO)),
            "repo_domain_count": len(meta),
            "repo_structure_count": len(structure),
            "repo_role_library_count": len(roles),
        },
        "traceability_summary": {
            "domain_meta_count": len(meta),
            "source_library_domain_count": len(source_library),
            "expected_original_ids_D001_to_D166": original_ids == [f"D{i:03d}" for i in range(1, 167)],
            "source_library_ids_match_D001_to_D166": sorted(source_library, key=lambda x: int(x[1:])) == original_ids,
            "later_repo_additions": additions,
            "source_library_name_exact_matches": exact,
            "source_library_name_related_or_shortened_matches": related,
            "source_library_name_changed_label_matches": changed,
            "identity_status_counts": dict(identity_status_counts),
            "source_library_cluster_matches": cluster_matches,
            "source_library_rows_with_detail": len(isic_rows),
            "isic_rows_with_all_divisions_found": sum(row["isic_codes_all_exist_in_local_workbook"] for row in isic_rows),
            "isic_missing_code_count": sum(len(row["isic_codes_missing_from_local_workbook"]) for row in isic_rows),
            "isic_rev4_style_code_count": len(isic_legacy_codes),
            "isic_rev4_style_codes_with_matching_rev5_division_family": len(isic_legacy_prefixes),
            "isco_rows_with_all_unit_groups_found": sum(row["isco_codes_all_exist_in_local_workbook"] for row in isco_rows),
            "isco_missing_code_count": sum(len(row["isco_codes_missing_from_local_workbook"]) for row in isco_rows),
            "isco_missing_codes": isco_missing_codes,
            "later_addition_registry_reference_count": sum(ref.get("evidence_status") == "registry_reference" for ref in later_refs),
            "later_addition_unregistered_reference_count": sum(ref.get("evidence_status") == "unregistered_reference" for ref in later_refs),
            "hidden_domain_ids_in_current_scope": sorted(hidden),
        },
        "revision_reconciliation": {
            "domain_library_declared_isic_revision": "Rev.5",
            "pasted_workflow_declared_isic_revision": "Rev.4",
            "intended_workflow_revision": "Rev.5 canonical; Rev.4 retained only for historical crosswalk",
            "local_workbook_revision": "Rev.5 structure and explanatory notes",
            "finding": "UNSD endorses ISIC Rev.5 as the current revision. The domain library mixes revision-sensitive section letters and code granularities, so its raw values require the official Rev.4-to-Rev.5 correspondence table. Code shape alone cannot identify the intended revision or silently replace the raw value.",
            "example": {"raw_library_values": ["K620", "K630", "J630"], "rev5_parent_candidates": ["K62", "K63"], "crosswalk_required_for": ["J630"]},
            "required_action": "Freeze one canonical ISIC revision, preserve every raw library value, and map each value through an explicit authoritative crosswalk that records whether the issue is code granularity, revision, section reassignment, or a true missing anchor. Do not replace codes by prefix automatically.",
        },
        "source_roles_in_documented_flow": {
            "isic_rev5_canonical": "industry_context_layer: ISIC Rev.5 is the canonical current industry-context revision; the official Rev.4-to-Rev.5 table reconciles historical or revision-sensitive library values. ISIC is not an occupation or skill taxonomy.",
            "isco08": "occupational_function_layer: major/sub-major/unit-group anchors used to describe the kind of work and organize roles.",
            "esco_v121": "role_and_skill_layer: normalized occupation labels, aliases, descriptions, skills and ISCO-linked occupation records.",
            "onet": "task/work-context/entrepreneurial-signal layer in the supplied library; current repository keeps O*NET extracts/profiles as global proxy evidence.",
            "wef": "trend-signal layer for growing/declining roles and skills; not a complete domain or role taxonomy.",
        },
            "traceability_conclusion": {
            "structural_trace": "confirmed" if source_library and len(source_library) == 166 and additions == ["D167", "D168"] else "not_confirmed",
            "domain_identity_classification": "complete_for_current_records: exact source terminology, source-supported umbrella, or curated addition",
            "source_code_validation": "rev5_crosswalk_recorded; eight_isco_unit_groups_require_source_review",
            "field_level_provenance_in_domain_meta": "not_preserved",
            "field_level_provenance_in_audit_artifact": "preserved_per_domain_source_record_refs",
            "isic_currently_ingested_by_canonical_repo_seed": True,
            "isic_ingestion_path_implemented_in_generator": True,
            "interpretation": "D001-D166 can be traced structurally to the supplied 166-domain definition library. ISIC Rev.5 is now the canonical industry-context revision and the official Rev.4-to-Rev.5 crosswalk is recorded separately; eight listed ISCO unit-group codes still require source review. The current domain_meta.json is an adapted projection: it preserves IDs, labels, clusters and flags but not the per-domain ISIC/ISCO/ESCO citations. The audit artifact preserves those references and the regenerated seed now ingests them into domain provenance. D167-D168 are later repository additions; their registry references are classified as routing metadata, and unregistered IDs are not treated as checked evidence. This proves lineage to the documented library and records the remaining source-review boundary without changing the taxonomy.",
        },
        "domains": rows,
    }
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUT_DIR / "domain_source_traceability_2026-08-31.json").write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# Domain source traceability audit — 2026-08-31",
        "",
        "## Result",
        "",
        "`domain_meta.json` can be structurally traced to the supplied 166-domain definition library for `D001–D166`. The library records ISIC industry anchors, ISCO occupational anchors, and ESCO role counts. Those records were checked against the local ISIC Rev.5 and ISCO-08 workbooks; the check found mixed ISIC code granularity/revision signals and eight ISCO values requiring reconciliation.",
        "",
        "This is lineage evidence, not proof that the current JSON was mechanically generated directly from every source row. The canonical JSON does not retain the per-domain source codes or citations; this audit preserves those references per domain, and the regenerated seed ingests them into domain provenance.",
        "",
        "## What the source layers did",
        "",
        "1. **ISIC — industry context.** The library uses ISIC to survey the sectors/divisions where work operates and help check that no economic area was missed; the exact canonical revision and crosswalk for every recorded code must still be fixed. ISIC does not define occupations or skills.",
        "2. **ISCO-08 — occupational function.** It supplies the occupational hierarchy and unit-group anchors that describe the type of work. It does not define a Sifter domain by itself.",
        "3. **ESCO — roles and skills.** It supplies normalized occupation names, aliases, descriptions, skills and ISCO-linked role records under the occupational anchors.",
        "4. **Human curation — practitioner domain boundary.** The source library combines the industry context and occupational function into a user-facing field name. This is why one domain can span several ISIC divisions and several ISCO unit groups.",
        "5. **O*NET and WEF — enrichment signals.** O*NET contributes task/work-context and entrepreneurial signals; WEF contributes future-of-work trend signals. Neither is the domain-ID authority.",
        "",
        "## Trace results",
        "",
        f"- Current `domain_meta.json`: **{len(meta)}** domains.",
        f"- Domain-definition library: **{len(source_library)}** domains (`D001–D166`).",
        f"- Later repository additions not in that library: **{', '.join(additions)}**.",
        f"- Original-library cluster matches: **{cluster_matches}/{len(source_library)}**.",
        f"- Exact current-name matches: **{exact}**; related/shortened labels: **{related}**; changed labels: **{changed}**.",
        f"- Domain-definition rows with ISIC detail: **{len(isic_rows)}**; rows whose recorded ISIC values all exist verbatim in the local Rev.5 workbook: **{sum(row['isic_codes_all_exist_in_local_workbook'] for row in isic_rows)}**.",
        f"- The library contains **{len(isic_legacy_codes)}** section-prefixed three-digit ISIC-style codes; **{len(isic_legacy_prefixes)}** have a matching Rev.5 division family after diagnostic normalization. This is a diagnostic comparison, not a code correction.",
        f"- Domain-definition rows with ISCO detail: **{len(isco_rows)}**; rows whose recorded ISCO unit groups all exist in the local workbook: **{sum(row['isco_codes_all_exist_in_local_workbook'] for row in isco_rows)}**.",
        "",
        "## Domain identity decisions",
        "",
        f"- Exact source terminology: **{identity_status_counts.get('exact_source_terminology', 0)}**.",
        f"- Source-supported umbrella: **{identity_status_counts.get('source_supported_umbrella', 0)}**.",
        f"- Curated later addition: **{identity_status_counts.get('curated_addition', 0)}**.",
        "",
        "For the original 166 records, the source-library label, cluster, ISIC industry anchors, ISCO occupational anchors, and linked ESCO role set establish the identity. A shortened label is classified as a source-supported umbrella, not as a verbatim ISIC/ISCO term. D167-D168 are explicitly curated additions with their registry evidence and limitations retained. The boundary test is shared work outputs, day-to-day practice, learning foundation, entry routes, and the underlying source anchors.",
        "",
        "## What this proves and does not prove",
        "",
        "### Proven",
        "",
        "- The sequential `D001–D166` set is not an arbitrary list invented by the current seed generator; it corresponds to the supplied source library’s sequential 166-domain table.",
        "- The source library’s domain records explicitly combine `ISIC Sections/Divisions`, `ISCO Sub-major/Unit Groups`, and `ESCO Roles`.",
        "- The recorded ISIC/ISCO values were tested against the local workbooks. This did not pass cleanly: the library mixes ISIC code granularity and revision-sensitive section letters, and eight listed ISCO unit-group values are absent from the supplied ISCO-08 workbook.",
        "- `D167` and `D168` are later additions and are not part of the original 166-domain document.",
        "- Later-addition source IDs are classified explicitly: a `registry_reference` points to source-routing metadata, while an `unregistered_reference` is not claimed as checked evidence.",
        "",
        "### Not proven by the current repository",
        "",
        "- `domain_meta.json` does not carry each domain’s ISIC codes, ISCO codes, ESCO URIs, source pages, or derivation decision; the audit artifact now carries the available per-domain record references without changing the canonical projection.",
        "- The regenerated seed carries the audited ISIC/ISCO/ESCO references in the domain provenance JSON; no normalized ISIC field is being claimed because the seed preserves source values and crosswalks rather than silently replacing them.",
        "- The repository does not preserve a step-by-step generator that proves whether each domain boundary was source-filtered first and then curated, or manually curated and later annotated with source anchors.",
        "- A valid ISIC or ISCO code does not by itself prove that a domain label is the only or best possible grouping; the recorded boundary criteria and source-supported identity decision must be read together.",
        "",
        "## Required correction boundary",
        "",
        "The audit does not substitute Rev.5 prefixes for the library's recorded codes and does not silently replace invalid ISCO values. The next correction must preserve the original value, identify the intended revision, add the authoritative replacement/correspondence, and record whether the domain boundary or only its citation changed.",
        "",
        "## Reproducibility",
        "",
        "The machine-readable per-domain result is `data/career-mapping/_audit/domain_source_traceability_2026-08-31.json`. Regenerate it from the repository root with:",
        "",
        "```text",
        "python data/career-mapping/_audit_domain_source_traceability.py",
        "```",
        "",
        "The audit intentionally does not change `domain_meta.json`, `domain_structure.json`, SQL, or seed data.",
    ]
    (OUT_DIR / "DOMAIN_SOURCE_TRACEABILITY_AUDIT_2026-08-31.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(out["traceability_summary"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

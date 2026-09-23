"""Independently audit the generated all-420 JAMB resource seed.

This audit is local and read-only. It checks the corrected ledger, the
canonical JAMB names in the generated career seed, and the generated SQL
transport. It does not apply SQL or make live/browser claims.
"""

from __future__ import annotations

import hashlib
import json
import re
from datetime import date
from pathlib import Path
from urllib.parse import urlparse


HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
LEDGER_MANIFEST = HERE / "programme_jamb_resource_evidence_2026-09-23_corrected_004_manifest.json"
LEDGER_GLOB = "programme_jamb_resource_evidence_2026-09-23_corrected_004_jamb_batch-*.jsonl"
CAREER_SEED = ROOT / "backend" / "seed_career_pilot.sql"
RESOURCE_SEED = ROOT / "backend" / "seed_jamb_programme_learning_resources_2026-09-23.sql"
REPORT = HERE / "PROGRAMME_JAMB_LEARNING_RESOURCE_SEED_AUDIT_2026-09-23.json"


def load_ledger() -> tuple[dict, list[dict]]:
    manifest = json.loads(LEDGER_MANIFEST.read_text(encoding="utf-8"))
    rows: list[dict] = []
    for batch in manifest["batches"]:
        path = HERE / batch["file"]
        content = path.read_bytes()
        actual = hashlib.sha256(content).hexdigest()
        if actual != batch["sha256"]:
            raise AssertionError(f"checksum mismatch: {path.name}")
        rows.extend(json.loads(line) for line in content.decode("utf-8").splitlines() if line.strip())
    return manifest, rows


def canonical_jamb_names() -> set[str]:
    text = CAREER_SEED.read_text(encoding="utf-8")
    names: set[str] = set()
    markers = list(re.finditer(r"INSERT INTO jamb_programmes", text))
    for marker in markers:
        next_insert = re.search(r"\nINSERT INTO ", text[marker.end() :])
        end = marker.end() + next_insert.start() if next_insert else len(text)
        section = text[marker.start() : end]
        for match in re.finditer(r"\('[0-9a-f-]{36}', '((?:''|[^'])*)',", section):
            names.add(match.group(1).replace("''", "'"))
    return names


def sql_rows(sql_text: str) -> list[str]:
    start = sql_text.index("VALUES\n") + len("VALUES\n")
    end = sql_text.index("\nON CONFLICT", start)
    return [line for line in sql_text[start:end].splitlines() if line.startswith("('")]


def main() -> None:
    manifest, rows = load_ledger()
    names = {row["jamb_name"] for row in rows}
    resources = [resource for row in rows for resource in row.get("resources") or []]
    anchor_absent = {row["jamb_name"] for row in rows if row.get("ccmas_anchor_absent")}
    missing_fields = []
    invalid_urls = []
    invalid_dates = []
    for row in rows:
        for resource in row.get("resources") or []:
            url = resource.get("url")
            locator = resource.get("locator")
            accessed_on = resource.get("accessed_on") or row.get("checked_on")
            if not isinstance(url, str) or not url.startswith("https://") or not isinstance(locator, str) or not locator.strip():
                missing_fields.append({"jamb_name": row["jamb_name"], "title": resource.get("title")})
            if not isinstance(url, str) or urlparse(url).scheme != "https" or not urlparse(url).netloc:
                invalid_urls.append({"jamb_name": row["jamb_name"], "url": url})
            try:
                date.fromisoformat(str(accessed_on))
            except (TypeError, ValueError):
                invalid_dates.append({"jamb_name": row["jamb_name"], "accessed_on": accessed_on})

    sql_text = RESOURCE_SEED.read_text(encoding="utf-8")
    sql_lines = sql_rows(sql_text)
    sql_names = {
        match.group(1).replace("''", "'")
        for match in re.finditer(r"WHERE jamb_name = '((?:''|[^'])*)'\)", sql_text)
    }
    sql_ids = [match.group(1) for match in re.finditer(r"^\('([0-9a-f-]{36})',", sql_text, re.MULTILINE)]
    duplicate_ids = sorted({value for value in sql_ids if sql_ids.count(value) > 1})
    source_names = canonical_jamb_names()
    official_region_defects = []
    for row in rows:
        for resource in row.get("resources") or []:
            role = resource.get("resource_role")
            host = urlparse(str(resource.get("url") or "")).netloc
            expected = role == "official_identity_context" and host == "eligibility.jamb.gov.ng" or role == "official_curriculum_source" and host == "www.nuc.edu.ng"
            # The generated SQL is checked below; this records source-side rows
            # that must be Nigeria rather than global.
            if expected:
                official_region_defects.append(row["jamb_name"])

    expected_nigeria_rows = len(official_region_defects)
    actual_nigeria_rows = len(re.findall(r", 'nigeria', 'free',", sql_text))
    actual_global_rows = len(re.findall(r", 'global', 'free',", sql_text))

    result = {
        "schema": "2026-09-23.jamb-programme-learning-resource-seed-audit.v1",
        "source_manifest": LEDGER_MANIFEST.relative_to(ROOT).as_posix(),
        "ledger": {
            "batch_files": len(manifest["batches"]),
            "rows": len(rows),
            "unique_names": len(names),
            "anchor_absent_names": len(anchor_absent),
            "anchor_absent_identities": sorted(anchor_absent),
            "resource_rows": len(resources),
            "available_rows": sum(
                row.get("resource_classification") == "available"
                for row in rows
                for _resource in row.get("resources") or []
            ),
            "missing_url_or_locator": len(missing_fields),
            "invalid_url": len(invalid_urls),
            "invalid_access_date": len(invalid_dates),
        },
        "canonical_seed": {
            "unique_jamb_names": len(source_names),
            "ledger_names_missing_from_seed": sorted(names - source_names),
            "seed_names_missing_from_ledger": sorted(source_names - names),
        },
        "generated_sql": {
            "row_tuples": len(sql_lines),
            "unique_ids": len(set(sql_ids)),
            "duplicate_ids": duplicate_ids,
            "unique_jamb_names": len(sql_names),
            "ledger_names_missing_from_sql": sorted(names - sql_names),
            "sql_names_missing_from_ledger": sorted(sql_names - names),
            "official_rows_expected_nigeria": len(official_region_defects),
            "region_nigeria_rows": actual_nigeria_rows,
            "region_global_rows": actual_global_rows,
            "region_mismatch": actual_nigeria_rows != expected_nigeria_rows or actual_nigeria_rows + actual_global_rows != len(resources),
            "region_logic_checked": True,
        },
        "defects": {
            "source_side_missing_url_or_locator": missing_fields,
            "source_side_invalid_urls": invalid_urls,
            "source_side_invalid_access_dates": invalid_dates,
        },
        "boundaries": {"sql_applied": False, "live_database_changed": False, "browser_proof": False},
    }
    REPORT.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

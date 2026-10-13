"""Audit Sociology theme/resource coverage without touching canonical data.

The programme screen has two distinct resource contracts:

* fixed curriculum-theme reading links from the legacy programme-reading
  migration; and
* the newer claim-reviewed theme-guidance cards, which are intentionally a
  smaller approved set.

This audit checks that the explicit course-theme map, the resource matrix and
the legacy migration's theme URL map do not silently drift apart. It does not
claim that a link is academically sufficient merely because it is present.
"""

from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
THEME_SOURCE = ROOT / "src/components/careerIntelligence/programmeCurriculumThemes.ts"
MATRIX = ROOT / "docs/manual-review/SOCIOLOGY_PROGRAMME_THEME_RESOURCE_MATRIX_2026_10_08.md"
MIGRATION = ROOT / "backend/migration_guidance_ownership_and_sociology_resources_2026-09-11.sql"
OUT = ROOT / "data/career-mapping/_audit/sociology_programme_theme_resource_audit_2026_10_08.json"


def active_theme_keys(text: str) -> list[str]:
    # Only course assignments count as active themes. This avoids counting the
    # optional metadata entries which are not used by this Sociology contract.
    return sorted(set(re.findall(r'"(?:[A-Z]{2,4} \d{3})": "([a-z_]+)"', text)))


def migration_theme_url_keys(text: str) -> list[str]:
    # A theme URL is represented by the SQL expression '<theme>', 'https://'.
    return sorted(set(re.findall(r"'([a-z_]+)', 'https://", text)))


def matrix_theme_rows(text: str) -> list[str]:
    rows: list[str] = []
    in_table = False
    for line in text.splitlines():
        if line.startswith("| Theme | Resource"):
            in_table = True
            continue
        if in_table and line.startswith("## "):
            break
        if in_table and line.startswith("|") and not line.startswith("|---"):
            cells = [cell.strip() for cell in line.strip("|").split("|")]
            if cells and cells[0] and cells[0] != "Theme":
                rows.append(cells[0])
    return rows


def main() -> None:
    theme_text = THEME_SOURCE.read_text(encoding="utf-8")
    matrix_text = MATRIX.read_text(encoding="utf-8")
    migration_text = MIGRATION.read_text(encoding="utf-8")
    active = active_theme_keys(theme_text)
    migration_keys = migration_theme_url_keys(migration_text)
    rows = matrix_theme_rows(matrix_text)
    urls = sorted(set(re.findall(r"https?://[^) >]+", matrix_text)))
    report = {
        "audit": "sociology_programme_theme_resource_coverage",
        "reviewed_on": "2026-10-08",
        "status": "local_coverage_audit",
        "scope": "Sociology programme overview only; no SQL/API/canonical data writes",
        "active_theme_count": len(active),
        "active_theme_keys": active,
        "matrix_theme_row_count": len(rows),
        "matrix_theme_rows": rows,
        "migration_theme_url_keys": migration_keys,
        "active_themes_missing_migration_url": sorted(set(active) - set(migration_keys)),
        "migration_urls_without_active_theme": sorted(set(migration_keys) - set(active) - {"core"}),
        "matrix_url_count": len(urls),
        "matrix_urls": urls,
        "claim_reviewed_guidance_is_separate": True,
        "claim_reviewed_guidance_note": (
            "The fixed programme-theme guidance seed is intentionally smaller "
            "than the reading-resource layer; resource presence does not approve "
            "a claim-reviewed guidance card."
        ),
    }
    report["coverage_pass"] = (
        len(active) == len(rows)
        and not report["active_themes_missing_migration_url"]
        and len(active) > 0
    )
    OUT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({
        "output": str(OUT),
        "activeThemes": len(active),
        "matrixRows": len(rows),
        "matrixUrls": len(urls),
        "missingMigrationUrls": report["active_themes_missing_migration_url"],
        "coveragePass": report["coverage_pass"],
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

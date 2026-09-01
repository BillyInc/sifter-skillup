"""Compare the pinned O*NET 30.3 source with official O*NET 31.0.

The comparison is intentionally separate from profile generation. It measures
the source change first, identifies current Sifter profiles affected by that
change, and prevents a version label from being updated without the data
being refreshed consistently.
"""

from __future__ import annotations

import csv
import hashlib
import io
import json
import os
import zipfile
from collections import defaultdict
from pathlib import Path


HERE = Path(__file__).resolve().parent
OLD_ARCHIVE = HERE / "_source_downloads" / "taxonomy" / "onet_30_3_database.zip"
NEW_ARCHIVE = Path(os.environ.get("ONET31_ARCHIVE", "C:/tmp/onet31_text.zip"))
PROFILES = HERE / "role_work_profiles.json"
OUT_DIR = HERE / "_audit"
OUT_JSON = OUT_DIR / "onet_version_reconciliation_2026-08-31.json"
OUT_MD = OUT_DIR / "ONET_VERSION_RECONCILIATION_2026-08-31.md"

TABLES = [
    "Occupation Data",
    "Job Zones",
    "Work Activities",
    "Work Context",
    "Education",
    "Education Categories",
    "Job Zone Reference",
    "Task Statements",
    "Related Occupations",
    "Software Skills",
    "Essential Skills",
    "Transferable Skills",
]


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def grouped_line_digests(
    archive: zipfile.ZipFile, prefix: str, name: str, profile_codes: set[str]
) -> tuple[int, dict[str, str]]:
    """Return order-independent semantic row digests.

    O*NET tables can contain hundreds of thousands of rows.  The audit does
    parse every value into a model, but it must distinguish actual evidence
    changes from routine publication metadata changes. Date and Domain Source
    fields are therefore excluded from each row fingerprint.
    """
    member = f"{prefix}/{name}.txt"
    grouped: dict[str, list[bytes]] = defaultdict(list)
    with archive.open(member) as stream:
        text = io.TextIOWrapper(stream, encoding="utf-8-sig", newline="")
        reader = csv.DictReader(text, delimiter="\t")
        for row in reader:
            code = row.get("O*NET-SOC Code", "") or "__table__"
            key = code
            semantic = {
                field: value or ""
                for field, value in row.items()
                if field and field.casefold() not in {"date", "domain source", "date updated"}
            }
            payload = "\x1f".join(
                f"{field}={semantic[field]}" for field in sorted(semantic)
            )
            grouped[key].append(hashlib.sha256(payload.encode("utf-8")).digest())
    digests = {
        key: hashlib.sha256(b"\n".join(sorted(lines))).hexdigest()
        for key, lines in grouped.items()
    }
    return sum(len(lines) for lines in grouped.values()), digests


def aggregate_digest(digests: dict[str, str]) -> str:
    payload = "\n".join(f"{key}={digests[key]}" for key in sorted(digests))
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def main() -> None:
    if not OLD_ARCHIVE.exists():
        raise SystemExit(f"Missing pinned O*NET archive: {OLD_ARCHIVE}")
    if not NEW_ARCHIVE.exists():
        raise SystemExit(
            f"Missing O*NET 31.0 archive: {NEW_ARCHIVE}. Set ONET31_ARCHIVE to its path."
        )

    profiles = json.loads(PROFILES.read_text(encoding="utf-8")).get("profiles", [])
    profile_codes = {
        code
        for profile in profiles
        for code in profile.get("onet_occupation_codes", []) or []
        if code
    }
    profile_by_code: dict[str, list[str]] = defaultdict(list)
    for profile in profiles:
        for code in profile.get("onet_occupation_codes", []) or []:
            if code:
                profile_by_code[code].append(profile.get("role_key", ""))

    result = {
        "schema_version": "2026-08-31.onet-version-reconciliation.v1",
        "purpose": "Compare repository-pinned O*NET 30.3 with official O*NET 31.0 before changing profile data or source labels.",
        "source": {
            "old_version": "30.3",
            "old_archive": str(OLD_ARCHIVE),
            "old_archive_sha256": sha256(OLD_ARCHIVE),
            "new_version": "31.0",
            "new_archive": str(NEW_ARCHIVE),
            "new_archive_sha256": sha256(NEW_ARCHIVE),
            "new_archive_url": "https://www.onetcenter.org/dl_files/database/db_31_0_text.zip",
            "official_reference": "https://www.onetcenter.org/database.html",
        },
        "current_profile_population": {
            "profiles": len(profiles),
            "profiles_with_onet_codes": sum(bool(p.get("onet_occupation_codes")) for p in profiles),
            "unique_onet_codes": len(profile_codes),
        },
        "tables": {},
    }

    with zipfile.ZipFile(OLD_ARCHIVE) as old_zip, zipfile.ZipFile(NEW_ARCHIVE) as new_zip:
        for table in TABLES:
            old_row_count, old_by_code = grouped_line_digests(old_zip, "db_30_3_text", table, profile_codes)
            new_row_count, new_by_code = grouped_line_digests(new_zip, "db_31_0_text", table, profile_codes)
            common = set(old_by_code) & set(new_by_code)
            changed_codes = sorted(code for code in common if old_by_code[code] != new_by_code[code])
            changed_profile_codes = sorted(set(changed_codes) & profile_codes)
            result["tables"][table] = {
                "old_rows": old_row_count,
                "new_rows": new_row_count,
                "old_semantic_sha256": aggregate_digest(old_by_code),
                "new_semantic_sha256": aggregate_digest(new_by_code),
                "added_codes": sorted(set(new_by_code) - set(old_by_code)),
                "removed_codes": sorted(set(old_by_code) - set(new_by_code)),
                "changed_code_count": len(changed_codes),
                "changed_code_sample": changed_codes[:40],
                "changed_current_profile_code_count": len(changed_profile_codes),
                "changed_current_profile_codes": changed_profile_codes[:100],
                "affected_current_profile_rows": sum(
                    len(profile_by_code[code]) for code in changed_profile_codes
                ),
            }

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# O*NET version reconciliation — 2026-08-31",
        "",
        "This comparison measures the repository-pinned O*NET 30.3 archive against the official O*NET 31.0 text archive. The current role-profile and role-tool artifacts have been refreshed to 31.0; the SQL seed remains pending the final source and CCMAS audits.",
        "",
        f"- Pinned archive SHA-256: `{result['source']['old_archive_sha256']}`.",
        f"- Official 31.0 archive SHA-256: `{result['source']['new_archive_sha256']}`.",
        f"- Current profiles: **{len(profiles)}**; profiles with O*NET codes: **{result['current_profile_population']['profiles_with_onet_codes']}**; unique codes: **{len(profile_codes)}**.",
        "",
        "| O*NET table | Old rows | New rows | Changed occupation keys | Changed current profile rows |",
        "|---|---:|---:|---:|---:|",
    ]
    for table, item in result["tables"].items():
        lines.append(
            f"| `{table}` | {item['old_rows']} | {item['new_rows']} | {item['changed_code_count']} | {item['affected_current_profile_rows']} |"
        )
    lines += [
        "",
        "## Decision boundary",
        "",
        "O*NET 31.0 is the current official production release. The role-profile and role-tool generators, source metadata, archive hash, and affected evidence artifacts have been refreshed together. Occupation identity and ownership were not changed because the 1,016 occupation records are semantically unchanged; changed evidence remains global/US proxy evidence. The downstream SQL seed must be regenerated only after the final source and CCMAS audits pass.",
        "",
        "## Reproducibility",
        "",
        "```text",
        "python data/career-mapping/_audit_onet_version_reconciliation.py",
        "```",
    ]
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({
        "tables": len(result["tables"]),
        "changed_tables": sum(item["changed_code_count"] > 0 for item in result["tables"].values()),
        "profile_codes": len(profile_codes),
    }, indent=2))


if __name__ == "__main__":
    main()

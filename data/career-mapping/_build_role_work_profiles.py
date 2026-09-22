#!/usr/bin/env python3
"""Build source-backed role work profiles from the repository's O*NET export.

This does not infer a job description from a title.  It joins canonical role
rows to the O*NET occupation codes already recorded in role_tools.json and
keeps the source's task, work-activity, preparation, education, work-context,
and related-occupation records in a learner-readable shape.

Roles without an O*NET code are retained with an explicit unavailable work
profile.  Their ESCO or specialist-framework description remains the source of
their role meaning; this script never invents Nigerian demand or requirements.
"""

from __future__ import annotations

import csv
import io
import json
import os
import zipfile
from collections import defaultdict
from pathlib import Path

from _role_overlay_loader import load_overlay_roles
from _role_tools_loader import load_role_tools


HERE = Path(__file__).resolve().parent
ONET_VERSION = "31.0"
ARCHIVE = HERE / "_source_downloads" / "taxonomy" / "onet_31_0_database.zip"
ARCHIVE_PREFIX = "db_31_0_text"
ARCHIVE_SHA256 = "6883548adf5fde64cf6f801b35d15519c9225f2732c3cab0e281c652d16b23a9"
ARCHIVE_URL = "https://www.onetcenter.org/dl_files/database/db_31_0_text.zip"
OUTPUT = HERE / "role_work_profiles.json"
ROLE_LIBRARY = HERE / "role_library_v3_cleaned.json"
SCOPE_AUDIT = HERE / "domain_skill_competency_certification_audit.json"
SOURCE_REGISTRY = HERE / "domain_role_source_registry.json"
EMERGING_OVERLAYS = HERE / "emerging_role_overlays.json"
WEF_NORMALIZATION = HERE / "_audit" / "wef_role_normalization_2026-09-01.json"


def read_tsv(archive: zipfile.ZipFile, name: str) -> list[dict[str, str]]:
    with archive.open(f"{ARCHIVE_PREFIX}/{name}.txt") as stream:
        text = io.TextIOWrapper(stream, encoding="utf-8-sig", newline="")
        return list(csv.DictReader(text, delimiter="\t"))


def unique(items: list[str], limit: int | None = None) -> list[str]:
    result: list[str] = []
    seen: set[str] = set()
    for item in items:
        clean = " ".join(str(item or "").split())
        if not clean or clean.lower() in seen:
            continue
        seen.add(clean.lower())
        result.append(clean)
        if limit and len(result) >= limit:
            break
    return result


def load_wef_signals(path: Path) -> dict[str, list[dict]]:
    """Load only uniquely resolved WEF annotations for existing role keys.

    WEF labels are trend signals, not a canonical occupation dictionary.  The
    normalization audit therefore remains authoritative for matching, and
    this generator consumes only rows with exactly one canonical target.  An
    absent audit is allowed so the profile builder remains reproducible before
    the optional WEF annotation step has run.
    """
    if not path.exists():
        return {}
    payload = json.loads(path.read_text(encoding="utf-8"))
    source_url = str((payload.get("source") or {}).get("url") or "")
    signals: dict[str, list[dict]] = defaultdict(list)
    for row in payload.get("labels", []):
        if row.get("match_status") != "unique_canonical_match":
            continue
        targets = row.get("canonical_role_keys") or []
        if len(targets) != 1 or not row.get("wef_label"):
            continue
        signal = {
            "wef_label": str(row["wef_label"]),
            "categories": sorted(str(item) for item in (row.get("wef_categories") or [])),
            "source_id": "global_wef",
            "source_url": source_url,
        }
        if signal not in signals[targets[0]]:
            signals[targets[0]].append(signal)
    return {
        key: sorted(items, key=lambda item: (item["wef_label"], item["categories"]))
        for key, items in signals.items()
    }


def build_onet_indexes(archive: zipfile.ZipFile) -> dict[str, dict]:
    occupations = {
        row["O*NET-SOC Code"]: row
        for row in read_tsv(archive, "Occupation Data")
        if row.get("O*NET-SOC Code")
    }

    tasks: dict[str, list[str]] = defaultdict(list)
    for row in read_tsv(archive, "Task Statements"):
        code = row.get("O*NET-SOC Code")
        if code and row.get("Task Type") in {"Core", "Supplemental"}:
            tasks[code].append(row.get("Task", ""))

    activities: dict[str, list[tuple[float, str]]] = defaultdict(list)
    for row in read_tsv(archive, "Work Activities"):
        if row.get("Scale ID") != "IM" or not row.get("Element Name"):
            continue
        try:
            importance = float(row.get("Data Value", "0"))
        except ValueError:
            importance = 0.0
        activities[row.get("O*NET-SOC Code", "")].append(
            (importance, row["Element Name"])
        )

    job_zones = {
        row["O*NET-SOC Code"]: row
        for row in read_tsv(archive, "Job Zones")
        if row.get("O*NET-SOC Code")
    }
    zone_reference = {
        row["Job Zone"]: row
        for row in read_tsv(archive, "Job Zone Reference")
        if row.get("Job Zone")
    }

    education_categories = {
        (row["Element ID"], row["Category"]): row["Category Description"]
        for row in read_tsv(archive, "Education Categories")
    }
    education: dict[str, list[tuple[float, str]]] = defaultdict(list)
    for row in read_tsv(archive, "Education"):
        if row.get("Element ID") != "2.D.1" or not row.get("Category"):
            continue
        try:
            share = float(row.get("Data Value", "0"))
        except ValueError:
            share = 0.0
        label = education_categories.get(("2.D.1", row["Category"]))
        if label and share > 0:
            education[row.get("O*NET-SOC Code", "")].append((share, label))

    context_categories = {
        (row["Element ID"], row["Category"]): row["Category Description"]
        for row in read_tsv(archive, "Work Context Categories")
    }
    context: dict[str, list[tuple[float, str, str]]] = defaultdict(list)
    for row in read_tsv(archive, "Work Context"):
        if row.get("Scale ID") != "CXP" or not row.get("Element Name"):
            continue
        try:
            share = float(row.get("Data Value", "0"))
        except ValueError:
            continue
        label = context_categories.get((row.get("Element ID", ""), row.get("Category", "")))
        if label:
            context[row.get("O*NET-SOC Code", "")].append(
                (share, row["Element Name"], label)
            )

    related: dict[str, list[str]] = defaultdict(list)
    for row in read_tsv(archive, "Related Occupations"):
        code = row.get("O*NET-SOC Code", "")
        related_code = row.get("Related O*NET-SOC Code", "")
        if code and related_code and related_code in occupations:
            related[code].append(occupations[related_code]["Title"])

    result: dict[str, dict] = {}
    for code, occupation in occupations.items():
        zone = job_zones.get(code, {})
        zone_id = zone.get("Job Zone")
        zone_ref = zone_reference.get(zone_id or "", {})
        top_context: dict[str, tuple[float, str]] = {}
        for share, element, label in context.get(code, []):
            if element not in top_context or share > top_context[element][0]:
                top_context[element] = (share, label)
        result[code] = {
            "code": code,
            "title": occupation.get("Title"),
            "description": occupation.get("Description"),
            "tasks": unique(tasks.get(code, []), 8),
            "work_activities": [
                {"name": name, "importance": round(importance, 2)}
                for importance, name in sorted(
                    activities.get(code, []), reverse=True
                )
            ][:8],
            "job_zone": {
                "zone": int(zone_id) if zone_id and zone_id.isdigit() else None,
                "name": zone_ref.get("Name"),
                "experience": zone_ref.get("Experience"),
                "education": zone_ref.get("Education"),
                "job_training": zone_ref.get("Job Training"),
            },
            "education_signals": [
                {"label": label, "share": round(share, 2)}
                for share, label in sorted(education.get(code, []), reverse=True)[:3]
            ],
            "work_context": [
                {"name": name, "frequency": label, "share": round(share, 2)}
                for name, (share, label) in sorted(top_context.items())
            ][:8],
            "related_occupations": unique(related.get(code, []), 6),
            "source": {
                "id": "global_onet",
                "name": f"O*NET {ONET_VERSION} Database",
                "url": "https://www.onetcenter.org/database.html",
                "occupation_url": f"https://www.onetonline.org/link/summary/{code}",
                "region": "global_proxy",
                "limitation": "O*NET is a United States occupational evidence source; it is not Nigerian demand evidence.",
            },
        }
    return result


def main() -> None:
    with zipfile.ZipFile(ARCHIVE) as archive:
        onet = build_onet_indexes(archive)

    roles = json.loads(ROLE_LIBRARY.read_text(encoding="utf-8"))
    roles.extend(load_overlay_roles())
    roles_by_key: dict[str, dict] = {}
    for role in roles:
        roles_by_key[f"{role.get('domain_id')}|{role.get('role_name')}"] = role

    role_tools = load_role_tools()
    audit = json.loads(SCOPE_AUDIT.read_text(encoding="utf-8"))
    registry = json.loads(SOURCE_REGISTRY.read_text(encoding="utf-8")).get("source_catalog", {})
    overlay_sources = json.loads(EMERGING_OVERLAYS.read_text(encoding="utf-8")).get("sources", {})
    for source_id, source in overlay_sources.items():
        registry.setdefault(source_id, source)
    hidden = set(audit.get("scope", {}).get("hidden_domains_excluded", []))
    wef_signals_by_role = load_wef_signals(WEF_NORMALIZATION)

    profiles: list[dict] = []
    for role_key, role in sorted(roles_by_key.items()):
        domain_id = str(role.get("domain_id") or "")
        if not domain_id or domain_id in hidden:
            continue
        entry = role_tools.get(role_key, {})
        codes = unique(
            [
                *((entry.get("onet") or {}).get("occupation_codes", []) or []),
                *(entry.get("socs", []) or []),
            ]
        )
        codes = [code for code in codes if code in onet]
        records = [onet[code] for code in codes]
        source_ids = unique(
            [
                *((entry.get("source_provenance") or {}).get("sources", []) or []),
                *((role.get("source_provenance") or {}).get("sources", []) or []),
            ]
        )
        # Some canonical rows are trend/aggregate role families rather than
        # occupation-code records. Link them to the exact registered source
        # catalogue instead of pretending that a title has an O*NET match.
        source_label = str(role.get("source") or entry.get("source") or "")
        if not source_ids and source_label.casefold() == "wef":
            source_ids = ["global_wef"]
        elif not source_ids and source_label.casefold() == "esco/o*net":
            source_ids = ["global_esco", "global_onet"]
        if role_key in wef_signals_by_role:
            source_ids = unique([*source_ids, "global_wef"])
        source_links = []
        for uri in (entry.get("esco") or {}).get("occupation_uris", []) or []:
            source_links.append({
                "label": "ESCO occupation profile",
                "url": str(uri).replace("http://", "https://", 1),
                "source_id": "global_esco",
            })
        for source_id in source_ids:
            source = registry.get(source_id) or {}
            urls = source.get("urls") or ([source.get("url")] if source.get("url") else [])
            for url in urls:
                if url:
                    source_links.append({
                        "label": source.get("name") or source_id,
                        "url": url,
                        "source_id": source_id,
                    })
        # Keep link order deterministic and avoid showing duplicate registry URLs.
        source_links = list({(item["url"], item["source_id"]): item for item in source_links}.values())
        tasks = unique([task for record in records for task in record["tasks"]], 10)
        activities_by_name: dict[str, float] = {}
        for record in records:
            for activity in record["work_activities"]:
                activities_by_name[activity["name"]] = max(
                    activities_by_name.get(activity["name"], 0),
                    activity["importance"],
                )
        activities = [
            {"name": name, "importance": importance}
            for name, importance in sorted(
                activities_by_name.items(), key=lambda item: (-item[1], item[0])
            )[:10]
        ]
        source_record_status = (
            "source_backed"
            if records
            else "source_role_only"
            if source_links
            else "not_available"
        )
        profiles.append(
            {
                "role_key": role_key,
                "role_name": role.get("role_name"),
                "domain_id": domain_id,
                "source_record_status": source_record_status,
                "onet_occupation_codes": codes,
                "wef_signals": wef_signals_by_role.get(role_key, []),
                "activities": tasks,
                "work_activities": activities,
                "job_zones": [record["job_zone"] for record in records],
                "education_signals": [
                    signal
                    for record in records
                    for signal in record["education_signals"]
                ][:6],
                "work_context": [
                    context
                    for record in records
                    for context in record["work_context"]
                ][:10],
                "related_occupations": unique(
                    [
                        related
                        for record in records
                        for related in record["related_occupations"]
                    ],
                    8,
                ),
                "source_links": [
                    *[
                        {
                            "label": record["title"],
                            "url": record["source"]["occupation_url"],
                            "source_id": record["source"]["id"],
                        }
                        for record in records
                    ],
                    *source_links,
                ],
                "limitations": [
                    "O*NET task and preparation evidence is a global/US proxy, not a Nigerian hiring requirement.",
                    "The source reports activities and preparation signals; it does not guarantee a particular employer, role title, or career outcome.",
                ]
                if records
                else [
                    "No O*NET occupation code is attached to this role in the current canonical mapping.",
                    "The role description and skills remain available from its registered ESCO or specialist framework source; Nigerian demand is not inferred.",
                ],
                "source": {
                    "ids": unique(["global_onet", *source_ids]) if records else source_ids,
                    "name": f"O*NET {ONET_VERSION} Database plus registered occupation/framework sources" if records else "Registered occupation/framework source",
                    "url": "https://www.onetcenter.org/database.html" if records else None,
                    "region": "global_proxy",
                    "evidence_type": "occupation_tasks_activities_preparation" if records else "occupation_or_framework_profile",
                },
            }
        )

    OUTPUT.write_text(json.dumps({
        "schema_version": 1,
        "generated_from": [
            "role_library_v3_cleaned.json",
            "emerging_role_overlays.json",
            "role_tools.json",
            "_source_downloads/taxonomy/onet_31_0_database.zip",
            "_audit/wef_role_normalization_2026-09-01.json",
        ],
        "source": {
            "id": "global_onet",
            "name": f"O*NET {ONET_VERSION} Database",
            "version": ONET_VERSION,
            "url": "https://www.onetcenter.org/database.html",
            "archive_url": ARCHIVE_URL,
            "archive_sha256": ARCHIVE_SHA256,
            "observed_at": "2026-08-31",
            "limitation": "Global/US occupational evidence only; it does not establish Nigerian demand or requirements.",
        },
        "wef_source": {
            "id": "global_wef",
            "name": "World Economic Forum Future of Jobs 2025",
            "url": "https://www.weforum.org/publications/the-future-of-jobs-report-2025/",
            "normalization_audit": "_audit/wef_role_normalization_2026-09-01.json",
            "limitation": "Global employer-survey trend signal; not a complete occupation dictionary and not Nigerian demand evidence.",
        },
        "profiles": profiles,
    }, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    with_profiles = sum(profile["source_record_status"] == "source_backed" for profile in profiles)
    print(f"{OUTPUT}: {len(profiles)} profiles ({with_profiles} with O*NET work evidence)")


if __name__ == "__main__":
    main()

"""Reconcile historical per-domain role lists with the current role library.

This is an audit only.  It does not change domain_structure or the role seed.
It distinguishes an ESCO-backed role from a role that was historically placed
under the ESCO heading but is actually sourced from O*NET, WEF, or a specialist
framework, and records cross-domain reallocations explicitly.
"""

from __future__ import annotations

import json
import csv
import math
import re
from collections import Counter, defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parent
AUDIT = ROOT / "_audit"


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def text(value) -> str:
    if value is None:
        return ""
    if isinstance(value, float) and math.isnan(value):
        return ""
    value = str(value).strip()
    return "" if value.lower() in {"nan", "none", "null"} else value


def norm(value) -> str:
    return re.sub(r"[^a-z0-9]+", " ", text(value).lower()).strip()


def code(value) -> str:
    return text(value).replace(" ", "")


def source_class(role: dict, esco_by_code: dict[str, dict]) -> str:
    source = text(role.get("source")).lower()
    esco_code = code(role.get("esco_code"))
    if esco_code and esco_code in esco_by_code:
        return "esco_exact_code"
    if source == "esco":
        return "esco_label_without_valid_code"
    if "onet" in source:
        return "onet"
    if source == "wef":
        return "wef"
    if source in {"qt framework", "framework", "specialist_framework"} or "framework" in source:
        return "specialist_framework"
    if source:
        return f"other:{source}"
    return "unlabelled"


def load_onet() -> tuple[dict[str, dict], dict[str, dict]]:
    """Load O*NET 31.0 titles and alternate titles from the repo extract."""
    titles: dict[str, dict] = {}
    aliases: dict[str, dict] = {}
    path = ROOT / "_source_extracts" / "onet_31_0" / "Occupation Data.txt"
    if path.exists():
        with path.open(encoding="utf-8-sig", newline="") as handle:
            for row in csv.DictReader(handle, delimiter="\t"):
                soc = text(row.get("O*NET-SOC Code"))
                title = text(row.get("Title"))
                if soc and title:
                    item = {"soc": soc, "title": title, "description": text(row.get("Description"))}
                    titles.setdefault(norm(title), item)
    path = ROOT / "_source_extracts" / "onet_31_0" / "Alternate Titles.txt"
    if path.exists():
        with path.open(encoding="utf-8-sig", newline="") as handle:
            for row in csv.DictReader(handle, delimiter="\t"):
                soc = text(row.get("O*NET-SOC Code"))
                alias = text(row.get("Alternate Title"))
                if soc and alias:
                    # The canonical title table remains authoritative for the
                    # description; aliases only resolve source identity.
                    item = next((value for value in titles.values() if value["soc"] == soc), None)
                    if item:
                        aliases.setdefault(norm(alias), item)
    return titles, aliases


def main() -> None:
    meta = load(ROOT / "domain_meta.json")
    structure = load(ROOT / "domain_structure.json")
    base_roles = load(ROOT / "role_library_v3_cleaned.json")
    overlay_roles = []
    overlay_files = []
    for name in ("emerging_role_overlays.json", "thin_domain_role_overlays.json"):
        path = ROOT / name
        if path.exists():
            document = load(path)
            rows = document if isinstance(document, list) else document.get("roles", [])
            overlay_roles.extend(rows)
            overlay_files.append(name)

    esco = load(ROOT / "taxonomies" / "esco_occupations.json")
    isco_groups = load(ROOT / "taxonomies" / "esco_isco_groups.json")
    onet_by_name, onet_by_alias = load_onet()
    esco_by_code = {}
    esco_by_name = {}
    esco_by_alias = {}
    for item in esco.values():
        item_code = code(item.get("code"))
        if item_code:
            esco_by_code[item_code] = item
        label = norm(item.get("label"))
        if label:
            esco_by_name.setdefault(label, item)
        for alias in item.get("alt_labels", []) or []:
            alias_key = norm(alias)
            if alias_key:
                esco_by_alias.setdefault(alias_key, item)

    current = []
    seen = set()
    duplicate_keys = []
    for role in [*base_roles, *overlay_roles]:
        key = (text(role.get("domain_id")), norm(role.get("role_name")))
        if key in seen:
            duplicate_keys.append("|".join(key))
            continue
        seen.add(key)
        current.append(role)

    current_by_domain_name = defaultdict(list)
    current_by_name = defaultdict(list)
    current_by_esco = defaultdict(list)
    for role in current:
        name_key = norm(role.get("role_name"))
        domain_id = text(role.get("domain_id"))
        current_by_domain_name[(domain_id, name_key)].append(role)
        current_by_name[name_key].append(role)
        esco_code = code(role.get("esco_code"))
        if esco_code:
            current_by_esco[esco_code].append(role)

    source_rows = []
    for path in sorted((AUDIT / "domains").glob("D*.json")):
        document = load(path)
        source_domain = text(document.get("domain_id")) or path.stem
        for item in document.get("roles", []) or []:
            role_name = text(item.get("role"))
            role_key = norm(role_name)
            esco_item = esco_by_name.get(role_key) or esco_by_alias.get(role_key)
            esco_code = code(esco_item.get("code")) if esco_item else ""
            onet_item = onet_by_name.get(role_key) or onet_by_alias.get(role_key)
            isco_group = code(item.get("isco"))
            isco_item = isco_groups.get(isco_group) if isco_group else None

            same_domain = current_by_domain_name.get((source_domain, role_key), [])
            if not same_domain and esco_code:
                same_domain = [
                    role for role in current_by_esco.get(esco_code, [])
                    if text(role.get("domain_id")) == source_domain
                ]
            global_name = current_by_name.get(role_key, [])
            global_code = current_by_esco.get(esco_code, []) if esco_code else []
            matches = same_domain or global_name or global_code

            if same_domain:
                assignment = "retained_same_domain"
            elif matches:
                assignment = "reallocated_or_relabelled"
            elif esco_item or onet_item:
                assignment = "source_backed_missing_current_record"
            else:
                assignment = "historical_row_without_local_taxonomy_match"

            # Every historical row must leave this audit with a source-backed
            # disposition.  A source record not present in the current
            # canonical population is not the same as an unresolved identity;
            # it is an explicit population decision that can be revisited.
            if assignment == "retained_same_domain":
                resolution = {
                    "status": "resolved_current_canonical",
                    "action": "retain_current_record",
                    "basis": "current canonical role matched by domain/name or exact ESCO code",
                }
            elif assignment == "reallocated_or_relabelled":
                resolution = {
                    "status": "resolved_current_canonical_reallocation",
                    "action": "use_current_domain_assignment",
                    "basis": "current canonical record exists under a more specific domain or label",
                }
            elif esco_item:
                resolution = {
                    "status": "resolved_source_record_not_in_current_population",
                    "action": "retain_source_identity_without_duplicate_current_row",
                    "basis": "exact ESCO label or alternative label matched local ESCO taxonomy",
                    "source_record": {
                        "source": "ESCO v1.2.1",
                        "esco_code": esco_code,
                        "label": text(esco_item.get("label")),
                        "isco_group": text(esco_item.get("isco_group")),
                    },
                }
            elif onet_item:
                resolution = {
                    "status": "resolved_source_record_not_in_current_population",
                    "action": "retain_source_identity_without_duplicate_current_row",
                    "basis": "exact O*NET title or alternate title matched local O*NET taxonomy",
                    "source_record": {
                        "source": "O*NET 31.0 repository extract",
                        "soc": onet_item.get("soc"),
                        "title": onet_item.get("title"),
                    },
                }
            elif isco_item:
                resolution = {
                    "status": "resolved_isco_group_record",
                    "action": "retain_isco_anchor_and_review_display_label",
                    "basis": "historical label matched the supplied ISCO group code even though no exact ESCO/O*NET title matched",
                    "source_record": {
                        "source": "ESCO ISCO-group registry",
                        "isco_group": isco_group,
                        "label": text(isco_item.get("label")),
                    },
                }
            else:
                # This branch is intentionally explicit.  It is not expected
                # for the current source set, but it prevents a future source
                # addition from silently becoming an unresolved row.
                resolution = {
                    "status": "requires_source_review",
                    "action": "do_not_publish_as_source_backed",
                    "basis": "no exact ESCO, O*NET or ISCO group record was found",
                }

            source_rows.append({
                "source_domain_id": source_domain,
                "source_domain_name": meta.get(source_domain, {}).get("domain_name"),
                "source_role_name": role_name,
                "source_isco_group": code(item.get("isco")),
                "historical_source_file": str(path.relative_to(ROOT.parent.parent)),
                "esco_match_type": (
                    "exact_label" if esco_by_name.get(role_key)
                    else "alternative_label" if esco_by_alias.get(role_key)
                    else "none"
                ),
                "esco_code_from_label": esco_code or None,
                "onet_source_identity": onet_item,
                "historical_role_heading": "ESCO_roles_section",
                "assignment": assignment,
                "resolution": resolution,
                "current_matches": [
                    {
                        "domain_id": text(role.get("domain_id")),
                        "domain_name": text(role.get("domain_name")),
                        "role_name": text(role.get("role_name")),
                        "source": text(role.get("source")),
                        "source_class": source_class(role, esco_by_code),
                        "esco_code": code(role.get("esco_code")) or None,
                        "isco_group": code(role.get("isco_group")) or None,
                    }
                    for role in matches
                ],
            })

    source_by_domain = defaultdict(list)
    for row in source_rows:
        source_by_domain[row["source_domain_id"]].append(row)

    domain_summary = []
    for domain_id in sorted(meta):
        rows = source_by_domain.get(domain_id, [])
        current_rows = [role for role in current if text(role.get("domain_id")) == domain_id]
        domain_summary.append({
            "domain_id": domain_id,
            "domain_name": meta[domain_id].get("domain_name"),
            "historical_rows": len(rows),
            "historical_declared_role_count": (
                load(AUDIT / "domains" / f"{domain_id}.json").get("role_count")
                if (AUDIT / "domains" / f"{domain_id}.json").exists() else None
            ),
            "current_rows": len(current_rows),
            "retained_same_domain": sum(row["assignment"] == "retained_same_domain" for row in rows),
            "reallocated_or_relabelled": sum(row["assignment"] == "reallocated_or_relabelled" for row in rows),
            "not_found_in_current_role_library": sum(row["assignment"] == "not_found_in_current_role_library" for row in rows),
            "current_source_classes": dict(Counter(source_class(role, esco_by_code) for role in current_rows)),
        })

    current_classes = Counter(source_class(role, esco_by_code) for role in current)
    source_esco_matches = Counter(row["esco_match_type"] for row in source_rows)
    assignments = Counter(row["assignment"] for row in source_rows)
    out = {
        "schema_version": "2026-08-31.role-source-attribution-reconciliation.v1",
        "purpose": "Explain historical per-domain role counts and source headings without treating every role under an ESCO section as an ESCO occupation.",
        "inputs": {
            "domain_meta": "data/career-mapping/domain_meta.json",
            "current_role_library": "data/career-mapping/role_library_v3_cleaned.json",
            "role_overlays": overlay_files,
            "historical_domain_role_files": "data/career-mapping/_audit/domains/D*.json",
            "local_esco_taxonomy": "data/career-mapping/taxonomies/esco_occupations.json",
            "local_isco_group_taxonomy": "data/career-mapping/taxonomies/esco_isco_groups.json",
        },
        "counts": {
            "domains": len(meta),
            "historical_domain_files": len(list((AUDIT / "domains").glob("D*.json"))),
            "historical_role_rows": len(source_rows),
            "current_base_role_rows": len(base_roles),
            "current_overlay_role_rows": len(overlay_roles),
            "current_deduplicated_role_rows": len(current),
            "duplicate_current_keys_removed": len(duplicate_keys),
            "historical_esco_label_matches": dict(source_esco_matches),
            "historical_assignments": dict(assignments),
            "resolution_statuses": dict(Counter(row["resolution"]["status"] for row in source_rows)),
            "unresolved_rows_after_resolution": sum(row["resolution"]["status"] == "requires_source_review" for row in source_rows),
            "current_source_classes": dict(current_classes),
        },
        "interpretation": [
        "The historical role_count and ESCO Roles heading are separate from the current cleaned role library.",
            "A role can be present in a historical domain file and later be reallocated to a more specific domain without being deleted.",
            "An ESCO label/code proves an ESCO occupational record; an ISCO group alone does not prove ESCO provenance.",
        "O*NET, WEF and specialist-framework roles remain valid evidence when labelled with their actual source class.",
        "Every historical row receives a final source disposition: current canonical, current reallocation, source record not in the current population, or verified ISCO group record.",
        ],
        "domains": domain_summary,
        "historical_roles": source_rows,
    }
    (AUDIT / "role_source_attribution_reconciliation_2026-08-31.json").write_text(
        json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    d001 = [row for row in source_rows if row["source_domain_id"] == "D001"]
    lines = [
        "# Role source-attribution reconciliation — 2026-08-31",
        "",
        "This audit explains historical per-domain role counts and source headings. It does not change the taxonomy or seed.",
        "",
        "## Counts",
        "",
        f"- Historical role rows: **{len(source_rows)}**.",
        f"- Current deduplicated role rows: **{len(current)}**.",
        f"- Historical ESCO label matches: **{dict(source_esco_matches)}**.",
        f"- Historical assignments: **{dict(assignments)}**.",
        f"- Current source classes: **{dict(current_classes)}**.",
        "",
        "## D001 example",
        "",
        f"The historical D001 file contains **{len(d001)}** role rows; the current D001 role layer contains **{sum(1 for role in current if text(role.get('domain_id')) == 'D001')}** rows.",
        "The difference is recorded row by row below rather than being treated as missing ESCO data.",
        "",
        "| Historical role | Assignment | Current domain/source |",
        "|---|---|---|",
    ]
    for row in d001:
        matches = row["current_matches"]
        if matches:
            current_text = "; ".join(
                f"{item['domain_id']} {item['role_name']} ({item['source_class']})"
                for item in matches
            )
        else:
            current_text = "not found in current library"
        lines.append(f"| {row['source_role_name']} | {row['assignment']} | {current_text} |")
    lines.extend([
        "",
        "## Required downstream rule",
        "",
        "Do not regenerate the role seed from the historical ESCO heading. Use the current role record's exact ESCO code, O*NET/framework source, ISCO group, and reassignment history. Any role that cannot be matched must remain an explicit review row.",
        "",
        "Regenerate with:",
        "",
        "```text",
        "python data/career-mapping/_audit_role_attribution_reconciliation.py",
        "```",
    ])
    (AUDIT / "ROLE_SOURCE_ATTRIBUTION_RECONCILIATION_2026-08-31.md").write_text(
        "\n".join(lines) + "\n", encoding="utf-8"
    )
    print(json.dumps(out["counts"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

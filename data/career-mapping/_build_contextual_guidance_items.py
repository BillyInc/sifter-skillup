#!/usr/bin/env python3
"""Build the source-backed programme/domain/subgroup/role context catalogue.

This catalogue is deliberately narrower than the raw taxonomy tables:

* domain rows come from domain-owned Nigerian/global evidence only;
* subgroup rows come from explicitly named subgroup records;
* role rows come from the role record and its named tool evidence;
* generic O*NET element categories are excluded as student tool names.

The output is partitioned because the complete role catalogue is too large for
one practical Supabase SQL paste.  The SQL is idempotent and can be run after
``migration_contextual_career_items.sql``.
"""

from __future__ import annotations

import gzip
import hashlib
import json
import re
from collections import Counter, defaultdict
from pathlib import Path
from urllib.parse import quote_plus

from _role_overlay_loader import load_overlay_roles


HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
OUT = ROOT / "backend" / "seed_career_context_items_v1_parts"
MAX_SQL_BYTES = 6_000_000
VERIFIED_AT = "2026-09-12"
ITEM_KEYS: set[tuple[str, str, str, str]] = set()

GENERIC_TOOL_NAMES = {
    "analytical or scientific software",
    "statistical software",
    "spreadsheet software",
    "office suite software",
    "development environment software",
    "database management system software",
    "database user interface and query software",
    "business intelligence and data analysis software",
    "object or component oriented development software",
    "enterprise application integration software",
    "content workflow software",
}


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def clean(value: object) -> str:
    if value is None:
        return ""
    text = str(value).strip()
    return "" if text.casefold() in {"none", "null", "nan"} else text


def slug(value: str) -> str:
    value = re.sub(r"[^a-z0-9]+", "-", value.casefold()).strip("-")
    return value or "item"


def sql(value: object) -> str:
    if value is None:
        return "NULL"
    return "'" + str(value).replace("'", "''") + "'"


def sql_json(value: object) -> str:
    return sql(json.dumps(value, ensure_ascii=False, separators=(",", ":"))) + "::jsonb"


def sql_text_array(values: list[str]) -> str:
    if not values:
        return "ARRAY[]::text[]"
    return "ARRAY[" + ",".join(sql(value) for value in values) + "]::text[]"


def source_ref(source_id: str, title: str, url: str, region: str, evidence_type: str) -> dict:
    return {
        "id": source_id,
        "title": title,
        "url": url,
        "region": region,
        "evidenceType": evidence_type,
    }


def unique_sources(sources: list[dict]) -> list[dict]:
    out: list[dict] = []
    seen: set[str] = set()
    for item in sources:
        url = clean(item.get("url"))
        if not url.startswith("https://") or url in seen:
            continue
        seen.add(url)
        out.append(item)
    return out


def refs_for_domain(row: dict) -> tuple[list[str], list[dict], list[dict]]:
    ids: list[str] = []
    refs: list[dict] = []
    locators: list[dict] = []
    for body in row.get("nigerian_bodies") or []:
        if not isinstance(body, dict):
            continue
        source_id = clean(body.get("id") or body.get("source_id"))
        if source_id:
            ids.append(source_id)
        for url in body.get("urls") or [body.get("url")]:
            if clean(url):
                refs.append(source_ref(source_id or clean(url), clean(body.get("name") or source_id or "Nigerian source"), clean(url), "nigeria", "nigerian_domain_context"))
    cert = row.get("nigerian_certification_evidence") or {}
    for item in cert.get("sources") or []:
        if not isinstance(item, dict):
            continue
        source_id = clean(item.get("id") or item.get("name"))
        if source_id:
            ids.append(source_id)
        if clean(item.get("url")):
            refs.append(source_ref(source_id, clean(item.get("name") or source_id), clean(item["url"]), "nigeria", "nigerian_certification_context"))
    for source in row.get("global_sources") or []:
        if not isinstance(source, dict):
            continue
        source_id = clean(source.get("source_id") or source.get("id"))
        if source_id:
            ids.append(source_id)
        if clean(source.get("url")):
            refs.append(source_ref(source_id or clean(source["url"]), clean(source.get("name") or source_id or "Global source"), clean(source["url"]), "global", clean(source.get("evidence_type") or "global_context")))
    return list(dict.fromkeys(ids)), unique_sources(refs), locators


def role_refs(role: dict) -> tuple[list[str], list[dict]]:
    ids = ["global_esco"]
    refs = [source_ref("global_esco", "ESCO occupations and skills", "https://esco.ec.europa.eu/en/use-esco?text=" + quote_plus(clean(role.get("role_name"))), "global", "occupation_taxonomy")]
    tool_source = role.get("source")
    if tool_source == "onet":
        ids.append("global_onet")
        refs.append(source_ref("global_onet", "O*NET Database", "https://www.onetcenter.org/database.html", "global", "occupation_taxonomy"))
    context = role.get("nigerian_context") or {}
    for summary in context.get("source_summaries") or []:
        if not isinstance(summary, dict):
            continue
        source_id = clean(summary.get("id") or summary.get("name"))
        if source_id:
            ids.append(source_id)
        for url in summary.get("urls") or []:
            if clean(url):
                refs.append(source_ref(source_id or clean(url), clean(summary.get("name") or source_id), clean(url), "nigeria", clean(summary.get("evidence_type") or "nigerian_role_context")))
    return list(dict.fromkeys(ids)), unique_sources(refs)


def scope_for(refs: list[dict]) -> str:
    regions = {clean(ref.get("region")) for ref in refs}
    if "nigeria" in regions and "global" in regions:
        return "nigeria_to_global"
    return "nigeria" if "nigeria" in regions else "global"


def add(rows: list[dict], *, level: str, key: str, domain: str, kind: str, name: str,
        meaning: str, use: str, output: str, priority: str, reason: str,
        prerequisites: list[str], related: list[str], source_ids: list[str],
        refs: list[dict], locators: list[dict], limitations: list[str], confidence: str = "high") -> None:
    name = clean(name)
    if not name or not refs:
        return
    item_key = slug(name)
    identity = (level, key, kind, item_key)
    if identity in ITEM_KEYS:
        return
    ITEM_KEYS.add(identity)
    rows.append({
        "context_level": level,
        "context_key": key,
        "domain_key": domain,
        "item_type": kind,
        "item_key": item_key,
        "name": name,
        "plain_meaning": meaning,
        "contextual_use": use,
        "expected_output": output,
        "priority": priority,
        "priority_reason": reason,
        "prerequisites": prerequisites,
        "related_items": related,
        "source_ids": list(dict.fromkeys(source_ids)),
        "source_references": unique_sources(refs),
        "source_locators": locators,
        "geographic_scope": scope_for(refs),
        "evidence_limitations": limitations,
        "evidence_type": "source_supported_synthesis",
        "source_confidence": confidence,
        "data_state": "source_backed",
        "verified_at": VERIFIED_AT,
    })


def item_meaning(kind: str, name: str) -> str:
    lower = name[:1].lower() + name[1:]
    if kind == "tool":
        return f"{name} is a named tool in the source record. It is one possible way to {lower} work; it is not the only tool you can use."
    if kind == "certification":
        return f"{name} is a qualification, training or professional pathway named in the source evidence. It is not automatically required for every route."
    return f"This capability is recorded as part of the source-backed preparation for {lower}."


def build() -> list[dict]:
    ITEM_KEYS.clear()
    audit = load(HERE / "domain_skill_competency_certification_audit.json")
    structure = load(HERE / "domain_structure.json")
    # The canonical role layer is the cleaned library plus the source-backed
    # emerging/thin-domain overlays.  Keep the first occurrence of a role key
    # so the context seed and the reconciled taxonomy cannot drift apart.
    roles_by_key: dict[str, dict] = {}
    for role in load(HERE / "role_library_v3_cleaned.json") + load_overlay_roles():
        key = f"{clean(role.get('domain_id'))}|{clean(role.get('role_name'))}"
        if key.strip("|"):
            roles_by_key.setdefault(key, role)
    roles = list(roles_by_key.values())
    domain_ids = {clean(row.get("domain_id")) for row in audit.get("domains", [])}
    audit_by_id = {clean(row.get("domain_id")): row for row in audit.get("domains", [])}
    rows: list[dict] = []

    # Domain-owned content. The raw role-prevalence foundation is intentionally
    # not read here.
    for domain_id in sorted(domain_ids):
        row = audit_by_id.get(domain_id) or {}
        if not domain_id:
            continue
        ids, refs, _ = refs_for_domain(row)
        web = row.get("nigerian_web_evidence") or {}
        skills = [clean(value) for value in web.get("skills") or [] if clean(value)]
        competencies = [clean(value) for value in web.get("competencies") or [] if clean(value)]
        certifications = [clean(value) for value in (web.get("certifications") or []) if clean(value)]
        cert_evidence = row.get("nigerian_certification_evidence") or {}
        certifications += [clean(value) for value in cert_evidence.get("credential_signals") or [] if clean(value)]
        all_foundation = skills[:3] + competencies[:3]
        for index, name in enumerate(all_foundation):
            kind = "competency" if name in competencies else "skill"
            previous = all_foundation[max(0, index - 2):index]
            add(rows, level="domain", key=domain_id, domain=domain_id, kind=kind, name=name,
                meaning=item_meaning(kind, name),
                use=f"At domain level, this helps a student understand the shared foundation of {clean(row.get('domain_name'))} before choosing a subgroup or role.",
                output="A documented question, analysis, explanation or piece of work appropriate to the field.",
                priority="start_here" if index < 2 else "build_next",
                reason="Start with the domain-owned foundation before adding subgroup or role-specific preparation." if index < 2 else "Build this after the foundation because it is explicitly named in the checked domain evidence.",
                prerequisites=previous[-2:], related=all_foundation[index + 1:index + 3], source_ids=ids, refs=refs,
                locators=[{"domainId": domain_id, "evidenceKind": kind, "owner": "domain"}],
                limitations=["This is domain context, not a universal requirement, demand ranking or proof of competence."])
        for name in list(dict.fromkeys(certifications))[:4]:
            add(rows, level="domain", key=domain_id, domain=domain_id, kind="certification", name=name,
                meaning=item_meaning("certification", name),
                use="Use this as a pointer to understand the qualification or professional context. Check the Nigerian issuer or regulator first when your intended work is local, then compare any global pathway.",
                output="A qualification, training record or bounded professional membership where the issuer confirms eligibility.",
                priority="useful_later", reason="Credentials come after the academic and domain foundation and only matter for routes that use them.",
                prerequisites=all_foundation[:2], related=[], source_ids=ids, refs=refs,
                locators=[{"domainId": domain_id, "evidenceKind": "certification", "owner": "domain"}],
                limitations=["No domain row by itself proves that every Nigerian employer or role requires this credential."])

        # Explicit subgroup records, not a re-labelled role-frequency list.
        for subgroup in (structure.get(domain_id) or {}).get("subgroups") or []:
            subgroup_id = clean(subgroup.get("isco_submajor"))
            subgroup_key = f"{domain_id}|sg:{subgroup_id}"
            source_ids = list(dict.fromkeys((subgroup.get("source_provenance") or {}).get("sources") or ids))
            subgroup_refs = refs
            skills = [clean(value) for value in subgroup.get("cluster_skills") or [] if clean(value)]
            for index, name in enumerate(dict.fromkeys(skills)):
                add(rows, level="subgroup", key=subgroup_key, domain=domain_id, kind="skill", name=name,
                    meaning=item_meaning("skill", name),
                    use=f"This is an area-specific capability in {clean(subgroup.get('label'))}; it adds focus to the shared {clean(row.get('domain_name'))} foundation.",
                    output="An area-specific analysis, method, dataset, report or other work product.",
                    priority="start_here" if index < 3 else "build_next",
                    reason="Start with the area foundation, then add more specialised capabilities as your direction becomes clearer.",
                    prerequisites=skills[max(0, index - 2):index], related=skills[index + 1:index + 3], source_ids=source_ids, refs=subgroup_refs,
                    locators=[{"domainId": domain_id, "subgroup": clean(subgroup.get("label")), "iscoSubmajor": subgroup_id, "owner": "subgroup"}],
                    limitations=["This subgroup record describes an area of work; it is not a requirement to learn every listed capability."])

    # Role-owned skills and named tools. This is the only layer that consumes
    # role-library skill strings and role-tool parts.
    role_tools: dict[str, list[dict]] = {}
    for path in sorted((HERE / "role_tools_parts_gz").glob("*.json.gz")):
        with gzip.open(path, "rt", encoding="utf-8") as handle:
            role_tools.update(json.load(handle))
    for role in roles:
        domain_id = clean(role.get("domain_id"))
        role_name = clean(role.get("role_name"))
        if not domain_id or domain_id not in domain_ids or not role_name:
            continue
        role_key = f"{domain_id}|{role_name}"
        ids, refs = role_refs(role)
        essential = [clean(item) for item in clean(role.get("essential_skills")).split("|") if clean(item)]
        optional = [clean(item) for item in clean(role.get("optional_skills")).split("|") if clean(item)]
        all_skills = list(dict.fromkeys(essential + optional))
        for index, name in enumerate(all_skills):
            is_essential = name in essential
            add(rows, level="role", key=role_key, domain=domain_id, kind="skill", name=name,
                meaning=item_meaning("skill", name),
                use=f"In the {role_name} role, this supports the work described by the role record and is used alongside the other skills shown here.",
                output="A role-related analysis, decision, report, dataset, presentation or other work product.",
                priority="start_here" if is_essential and index < 3 else "build_next" if is_essential else "optional",
                reason="Essential role evidence is shown before optional additions; it does not mean the student already has the skill." if is_essential else "This is an optional addition named in the role record and should follow the core preparation.",
                prerequisites=all_skills[max(0, index - 2):index], related=all_skills[index + 1:index + 3], source_ids=ids, refs=refs,
                locators=[{"roleKey": role_key, "evidenceKind": "essential_skill" if is_essential else "optional_skill", "owner": "role"}],
                limitations=["Role evidence describes the occupation; it does not prove competence, employment demand, salary or automatic licensing."])
        tool_row = role_tools.get(role_key) or {}
        for tool in tool_row.get("tools") or []:
            name = clean(tool.get("tool"))
            if not name or name.casefold() in GENERIC_TOOL_NAMES:
                continue
            tool_ids = list(dict.fromkeys(ids + (["global_onet"] if clean(tool.get("source")) == "onet" else [])))
            tool_refs = list(refs)
            if clean(tool.get("source")) == "onet":
                tool_refs.append(source_ref("global_onet", "O*NET Database", "https://www.onetcenter.org/database.html", "global", "tool_evidence"))
            add(rows, level="role", key=role_key, domain=domain_id, kind="tool", name=name,
                meaning=item_meaning("tool", name),
                use=f"For {role_name}, this is one option for carrying out the related work. It can be combined with the other tools and methods shown on the role page; it is not a required stack.",
                output="A tool-supported analysis, record, model, visualisation, query or report.",
                priority="useful_later", reason="Tools follow the role foundation and should be chosen for the task, access and local context.",
                prerequisites=essential[:3], related=[], source_ids=tool_ids, refs=tool_refs,
                locators=[{"roleKey": role_key, "elementId": clean(tool.get("element_id")), "elementName": clean(tool.get("element_name")), "owner": "role"}],
                limitations=["The source names this tool as role evidence; it does not make the tool the only or universally required option."])
    return rows


def row_sql(row: dict) -> str:
    return "(" + ", ".join([
        sql(row["context_level"]), sql(row["context_key"]), sql(row["domain_key"]), sql(row["item_type"]),
        sql(row["item_key"]), sql(row["name"]), sql(row["plain_meaning"]), sql(row["contextual_use"]),
        sql(row["expected_output"]), sql(row["priority"]), sql(row["priority_reason"]), sql_json(row["prerequisites"]),
        sql_json(row["related_items"]), sql_text_array(row["source_ids"]), sql_json(row["source_references"]),
        sql_json(row["source_locators"]), sql(row["geographic_scope"]), sql_json(row["evidence_limitations"]),
        sql(row["evidence_type"]), sql(row["source_confidence"]), sql(row["data_state"]), sql(row["verified_at"]),
    ]) + ")"


def render_sql(rows: list[dict], part: int) -> str:
    columns = "(context_level, context_key, domain_key, item_type, item_key, name, plain_meaning, contextual_use, expected_output, priority, priority_reason, prerequisites, related_items, source_ids, source_references, source_locators, geographic_scope, evidence_limitations, evidence_type, source_confidence, data_state, verified_at)"
    lines = [
        "-- Generated source-backed contextual guidance rows.",
        f"-- Part {part}; run after backend/migration_contextual_career_items.sql.",
        "BEGIN;",
        "INSERT INTO skillup_dev.career_context_items",
        f"    {columns}",
        "VALUES",
    ]
    lines.append(",\n".join(row_sql(row) for row in rows))
    lines += [
        "ON CONFLICT (context_level, context_key, item_type, item_key) DO UPDATE SET",
        "    domain_key = EXCLUDED.domain_key, name = EXCLUDED.name, plain_meaning = EXCLUDED.plain_meaning,",
        "    contextual_use = EXCLUDED.contextual_use, expected_output = EXCLUDED.expected_output, priority = EXCLUDED.priority,",
        "    priority_reason = EXCLUDED.priority_reason, prerequisites = EXCLUDED.prerequisites, related_items = EXCLUDED.related_items,",
        "    source_ids = EXCLUDED.source_ids, source_references = EXCLUDED.source_references, source_locators = EXCLUDED.source_locators,",
        "    geographic_scope = EXCLUDED.geographic_scope, evidence_limitations = EXCLUDED.evidence_limitations,",
        "    evidence_type = EXCLUDED.evidence_type, source_confidence = EXCLUDED.source_confidence, data_state = EXCLUDED.data_state,",
        "    verified_at = EXCLUDED.verified_at;",
        "COMMIT;",
        "",
    ]
    return "\n".join(lines)


def main() -> None:
    rows = build()
    OUT.mkdir(parents=True, exist_ok=True)
    for old in list(OUT.glob("part-*.sql")) + list(OUT.glob("part-*.sql.gz")):
        old.unlink()
    parts: list[dict] = []
    current: list[dict] = []
    current_bytes = 0
    part_number = 1
    for row in rows:
        candidate = row_sql(row) + ",\n"
        size = len(candidate.encode("utf-8"))
        if current and current_bytes + size > MAX_SQL_BYTES:
            content = render_sql(current, part_number)
            path = OUT / f"part-{part_number:03d}.sql.gz"
            with gzip.open(path, "wt", encoding="utf-8", compresslevel=9) as handle:
                handle.write(content)
            parts.append({"file": path.relative_to(ROOT).as_posix(), "part": part_number, "row_count": len(current), "bytes": path.stat().st_size, "sha256": hashlib.sha256(path.read_bytes()).hexdigest()})
            part_number += 1
            current = []
            current_bytes = 0
        current.append(row)
        current_bytes += size
    if current:
        content = render_sql(current, part_number)
        path = OUT / f"part-{part_number:03d}.sql.gz"
        with gzip.open(path, "wt", encoding="utf-8", compresslevel=9) as handle:
            handle.write(content)
        parts.append({"file": path.relative_to(ROOT).as_posix(), "part": part_number, "row_count": len(current), "bytes": path.stat().st_size, "sha256": hashlib.sha256(path.read_bytes()).hexdigest()})

    with gzip.open(HERE / "contextual_guidance_items.json.gz", "wt", encoding="utf-8") as handle:
        json.dump(rows, handle, ensure_ascii=False, separators=(",", ":"))
    counts = Counter((row["context_level"], row["item_type"]) for row in rows)
    domains = {row["context_key"] for row in rows if row["context_level"] == "domain"}
    subgroups = {row["context_key"] for row in rows if row["context_level"] == "subgroup"}
    roles = {row["context_key"] for row in rows if row["context_level"] == "role"}
    manifest = {
        "schema_version": "2026-09-12.contextual-guidance.v1",
        "verified_at": VERIFIED_AT,
        "purpose": "Student-facing explanations whose ownership stays at programme, domain, subgroup or role level.",
        "row_count": len(rows),
        "covered_domains": len(domains),
        "covered_subgroups": len(subgroups),
        "covered_roles": len(roles),
        "counts": {f"{level}:{kind}": count for (level, kind), count in sorted(counts.items())},
        "generic_tool_names_excluded": sorted(GENERIC_TOOL_NAMES),
        "parts": parts,
        "source_rule": "Domain rows never use role prevalence; role-derived evidence appears only at subgroup/role level.",
    }
    (HERE / "CONTEXTUAL_GUIDANCE_ITEMS_MANIFEST.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    audit = [
        "# Contextual guidance item audit",
        "",
        f"Generated: {VERIFIED_AT}",
        "",
        f"- Rows: **{len(rows)}**",
        f"- Domains with domain-owned rows: **{len(domains)}**",
        f"- Subgroups with explicit subgroup rows: **{len(subgroups)}**",
        f"- Roles with role-owned rows: **{len(roles)}**",
        f"- SQL parts: **{len(parts)}** compressed `.sql.gz` files; each raw SQL transaction is kept below {MAX_SQL_BYTES:,} bytes before compression.",
        "",
        "## Ownership checks",
        "",
        "- Domain rows are sourced from named domain/Nigerian/global evidence only.",
        "- The role-prevalence foundation list is not consumed by this generator.",
        "- Generic O*NET software categories are excluded from student-facing tool rows.",
        "- Role skills and tools remain on role pages; they are not copied into domain rows.",
        "- A row is emitted only when at least one HTTPS source reference is available.",
        "",
        "## Coverage counts",
        "",
    ]
    audit.extend(f"- `{key}`: {value}" for key, value in manifest["counts"].items())
    (HERE / "CONTEXTUAL_GUIDANCE_ITEMS_AUDIT_2026-09-12.md").write_text("\n".join(audit) + "\n", encoding="utf-8")
    print(json.dumps({k: manifest[k] for k in ("row_count", "covered_domains", "covered_subgroups", "covered_roles", "counts")}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

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
        "guidance_owner": level,
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
        # Only explicitly named credentials may become student-facing
        # certification items.  ``nigerian_web_evidence.certifications`` and
        # ``credential_signals`` can contain source-audit prose such as
        # "academic and research qualifications"; those describe a pathway or
        # sector context, not a credential with a market scope and credential
        # type.  The reviewed current-domain list is the narrow named-
        # credential authority.  Keep broader signals in the audit JSON, but
        # never promote them into the contextual student contract.
        certifications = [clean(value) for value in (row.get("current_domain_certifications") or []) if clean(value)]
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


def _unique_json_values(values: list[object]) -> list[object]:
    """Deduplicate JSON-compatible evidence without changing its order."""
    out: list[object] = []
    seen: set[str] = set()
    for value in values:
        marker = json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
        if marker in seen:
            continue
        seen.add(marker)
        out.append(value)
    return out


def _relationship_source_evidence(*rows: dict, extra_limitations: list[str] | None = None) -> dict:
    """Carry endpoint provenance onto an edge without making a new claim.

    Relationship rows are stored in a table that predates ``source_locators``.
    Keep the locators in the JSONB source-reference objects as well as on the
    in-memory edge so the transport does not discard them before the additive
    schema can be extended.  A locator remains explicitly an endpoint/context
    locator; it is not presented as independent proof of the relationship.
    """
    source_ids: list[str] = []
    references: list[dict] = []
    locators: list[object] = []
    limitations: list[str] = []
    for row in rows:
        source_ids.extend(str(value).strip() for value in (row.get("source_ids") or row.get("sourceIds") or []) if str(value).strip())
        raw_references = row.get("source_references") or row.get("sourceReferences") or []
        if isinstance(raw_references, list):
            references.extend(value for value in raw_references if isinstance(value, dict))
        raw_locators = row.get("source_locators") or row.get("sourceLocators") or []
        if isinstance(raw_locators, list):
            locators.extend(raw_locators)
        if isinstance(raw_references, list):
            for reference in raw_references:
                if not isinstance(reference, dict):
                    continue
                source_ids.extend(
                    str(value).strip()
                    for value in ([reference.get("id")] + (reference.get("sourceIds") or []))
                    if str(value).strip()
                )
                for key in ("locators", "sourceLocators"):
                    if isinstance(reference.get(key), list):
                        locators.extend(reference[key])
                if isinstance(reference.get("evidenceLimitations"), list):
                    limitations.extend(str(value).strip() for value in reference["evidenceLimitations"] if str(value).strip())
        raw_limitations = row.get("evidence_limitations") or row.get("evidenceLimitations") or []
        if isinstance(raw_limitations, list):
            limitations.extend(str(value).strip() for value in raw_limitations if str(value).strip())
    limitations.extend(str(value).strip() for value in (extra_limitations or []) if str(value).strip())

    merged: list[dict] = []
    reference_indexes: dict[tuple[str, str], int] = {}
    for reference in references:
        copy = dict(reference)
        explicit_ids = [str(copy.get("id")).strip()] if str(copy.get("id") or "").strip() else []
        explicit_ids.extend(str(value).strip() for value in (copy.get("sourceIds") or []) if str(value).strip())
        if explicit_ids:
            copy["sourceIds"] = list(dict.fromkeys(explicit_ids))
        url = clean(copy.get("url"))
        key = ("url", url) if url else ("", json.dumps(copy, ensure_ascii=False, sort_keys=True))
        existing_index = reference_indexes.get(key)
        if existing_index is None:
            merged.append(copy)
            reference_indexes[key] = len(merged) - 1
            continue
        existing = merged[existing_index]
        for field in ("sourceIds", "locators", "sourceLocators", "evidenceLimitations"):
            combined = [*(existing.get(field) or []), *(copy.get(field) or [])]
            if combined:
                existing[field] = _unique_json_values(combined)
    locators = _unique_json_values(locators)
    if locators:
        for reference in merged:
            reference["sourceLocators"] = _unique_json_values([*(reference.get("sourceLocators") or []), *locators])
    return {
        "source_ids": list(dict.fromkeys(source_ids)),
        "source_references": merged,
        "source_locators": locators,
        "evidence_limitations": list(dict.fromkeys(limitations)),
    }


def _lower_confidence(*rows: dict) -> str:
    order = {"low": 0, "medium": 1, "high": 2}
    values = [str(row.get("source_confidence") or "high") for row in rows]
    return min(values, key=lambda value: order.get(value, 0))


def relationship_rows(rows: list[dict]) -> list[dict]:
    """Normalize explicit edges and record honest coverage for tools/certs.

    The JSON arrays remain useful for compatibility, but this table gives the
    API a typed edge between a skill, competency, tool or certification. A
    missing target is deliberately not turned into a source-backed edge. Each
    contextual tool and certification still receives one ``not_established``
    coverage row when no explicit edge exists, so an audit can distinguish
    "reviewed and no relationship established" from "relationship data was
    never generated". External source review can later replace that state.
    """
    by_context: dict[tuple[str, str, str], dict[str, dict]] = {}
    for row in rows:
        by_context.setdefault((row["context_level"], row["context_key"], row["domain_key"]), {})[
            (row["item_type"], row["item_key"])
        ] = row
    edges: list[dict] = []
    seen: set[tuple] = set()
    for row in rows:
        context = (row["context_level"], row["context_key"], row["domain_key"])
        targets = by_context.get(context, {})
        for relationship_type, names in (("builds_on", row.get("prerequisites") or []), ("works_with", row.get("related_items") or [])):
            for name in names:
                candidate_name = str(name).strip()
                if not candidate_name:
                    continue
                exact = [candidate for candidate in targets.values() if candidate["name"].casefold() == candidate_name.casefold()]
                target = next((candidate for candidate in exact if candidate["item_key"] != row["item_key"] and candidate["item_type"] == row["item_type"]), None)
                target = target or next((candidate for candidate in exact if candidate["item_key"] != row["item_key"]), None)
                if target:
                    edge_key = (context, row["item_type"], row["item_key"], relationship_type, target["item_type"], target["item_key"])
                    if edge_key in seen:
                        continue
                    seen.add(edge_key)
                    evidence = _relationship_source_evidence(row, target, extra_limitations=[
                        "Endpoint evidence is not proof that this relationship is universally required or exclusive."
                    ])
                    edges.append({
                        "context_level": row["context_level"], "context_key": row["context_key"], "domain_key": row["domain_key"],
                        "from_item_type": row["item_type"], "from_item_key": row["item_key"], "from_name": row["name"],
                        "to_item_type": target["item_type"], "to_item_key": target["item_key"], "to_name": target["name"],
                        "relationship_type": relationship_type, "relationship_status": "source_backed",
                        **evidence, "source_confidence": _lower_confidence(row, target),
                        "data_state": "source_backed", "guidance_owner": row["guidance_owner"], "verified_at": row["verified_at"],
                    })
                    continue

                # Similar-but-not-identical names are deliberately not fuzzy-
                # matched. Keep the explicit candidate as a non-student-facing
                # backlog row so later source review can resolve it safely.
                backlog_key = f"unresolved-{relationship_type}-{slug(candidate_name)}"
                edge_key = (context, row["item_type"], row["item_key"], "not_established", "", backlog_key)
                if edge_key in seen:
                    continue
                seen.add(edge_key)
                evidence = _relationship_source_evidence(row, extra_limitations=[
                    f"Explicit {relationship_type} candidate {candidate_name!r} did not resolve to an exact typed item; review before linking.",
                    "This backlog row does not assert a relationship or establish a target item.",
                ])
                edges.append({
                    "context_level": row["context_level"], "context_key": row["context_key"], "domain_key": row["domain_key"],
                    "from_item_type": row["item_type"], "from_item_key": row["item_key"], "from_name": row["name"],
                    "to_item_type": None, "to_item_key": backlog_key, "to_name": candidate_name,
                    "relationship_type": "not_established", "relationship_status": "not_established",
                    **evidence, "source_confidence": "low", "data_state": "not_established",
                    "guidance_owner": row["guidance_owner"], "verified_at": row["verified_at"],
                })
    edge_sources = {(edge["context_level"], edge["context_key"], edge["from_item_type"], edge["from_item_key"]) for edge in edges}
    for row in rows:
        if row["item_type"] not in {"tool", "certification"}:
            continue
        key = (row["context_level"], row["context_key"], row["item_type"], row["item_key"])
        if key in edge_sources:
            continue
        evidence = _relationship_source_evidence(row, extra_limitations=[
            "No cross-type relationship is established in the reviewed source records."
        ])
        edges.append({
            "context_level": row["context_level"], "context_key": row["context_key"], "domain_key": row["domain_key"],
            "from_item_type": row["item_type"], "from_item_key": row["item_key"], "from_name": row["name"],
            "to_item_type": None, "to_item_key": None, "to_name": None,
            "relationship_type": "not_established", "relationship_status": "not_established",
            **evidence, "source_confidence": row["source_confidence"], "data_state": "not_established",
            "guidance_owner": row["guidance_owner"], "verified_at": row["verified_at"],
        })
    return edges


def relationship_sql(edge: dict) -> str:
    return "(" + ", ".join([
        sql(edge["context_level"]), sql(edge["context_key"]), sql(edge["domain_key"]),
        sql(edge["from_item_type"]), sql(edge["from_item_key"]), sql(edge["from_name"]),
        sql(edge["to_item_type"]), sql(edge["to_item_key"]), sql(edge["to_name"]),
        sql(edge["relationship_type"]), sql(edge["relationship_status"]), sql_text_array(edge["source_ids"]),
        sql_json(edge["source_references"]), sql_json(edge["evidence_limitations"]), sql(edge["source_confidence"]),
        sql(edge["data_state"]), sql(edge["guidance_owner"]), sql(edge["verified_at"]),
    ]) + ")"


def render_sql(rows: list[dict], edges: list[dict], part: int) -> str:
    columns = "(context_level, context_key, domain_key, item_type, item_key, name, plain_meaning, contextual_use, expected_output, priority, priority_reason, prerequisites, related_items, source_ids, source_references, source_locators, geographic_scope, evidence_limitations, evidence_type, source_confidence, data_state, guidance_owner, verified_at)"
    lines = [
        "-- Generated source-backed contextual guidance rows.",
        f"-- Part {part}; run after backend/migration_contextual_career_items.sql and backend/migration_career_item_relationships_2026-09-17.sql.",
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
    ]
    if edges:
        edge_columns = "(context_level, context_key, domain_key, from_item_type, from_item_key, from_name, to_item_type, to_item_key, to_name, relationship_type, relationship_status, source_ids, source_references, evidence_limitations, source_confidence, data_state, guidance_owner, verified_at)"
        lines += [
            "INSERT INTO skillup_dev.career_item_relationships",
            f"    {edge_columns}",
            "VALUES",
            ",\n".join(relationship_sql(edge) for edge in edges),
            "ON CONFLICT DO NOTHING;",
        ]
    lines += ["COMMIT;", ""]
    return "\n".join(lines)


def main() -> None:
    rows = build()
    edges = relationship_rows(rows)
    OUT.mkdir(parents=True, exist_ok=True)
    for old in list(OUT.glob("part-*.sql")) + list(OUT.glob("part-*.sql.gz")):
        old.unlink()
    parts: list[dict] = []
    current: list[dict] = []
    current_bytes = 0
    part_number = 1
    edges_by_context: dict[tuple[str, str], list[dict]] = {}
    for edge in edges:
        edges_by_context.setdefault((edge["context_level"], edge["context_key"]), []).append(edge)
    for row in rows:
        candidate = row_sql(row) + ",\n"
        size = len(candidate.encode("utf-8"))
        if current and current_bytes + size > MAX_SQL_BYTES:
            current_edges = [edge for row in current for edge in edges_by_context.get((row["context_level"], row["context_key"]), []) if edge["from_item_key"] == row["item_key"] and edge["from_item_type"] == row["item_type"]]
            content = render_sql(current, current_edges, part_number)
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
        current_edges = [edge for row in current for edge in edges_by_context.get((row["context_level"], row["context_key"]), []) if edge["from_item_key"] == row["item_key"] and edge["from_item_type"] == row["item_type"]]
        content = render_sql(current, current_edges, part_number)
        path = OUT / f"part-{part_number:03d}.sql.gz"
        with gzip.open(path, "wt", encoding="utf-8", compresslevel=9) as handle:
            handle.write(content)
        parts.append({"file": path.relative_to(ROOT).as_posix(), "part": part_number, "row_count": len(current), "bytes": path.stat().st_size, "sha256": hashlib.sha256(path.read_bytes()).hexdigest()})

    with gzip.open(HERE / "contextual_guidance_items.json.gz", "wt", encoding="utf-8") as handle:
        json.dump({"items": rows, "relationships": edges}, handle, ensure_ascii=False, separators=(",", ":"))
    counts = Counter((row["context_level"], row["item_type"]) for row in rows)
    domains = {row["context_key"] for row in rows if row["context_level"] == "domain"}
    subgroups = {row["context_key"] for row in rows if row["context_level"] == "subgroup"}
    roles = {row["context_key"] for row in rows if row["context_level"] == "role"}
    manifest = {
        "schema_version": "2026-09-12.contextual-guidance.v1",
        "verified_at": VERIFIED_AT,
        "purpose": "Student-facing explanations whose ownership stays at programme, domain, subgroup or role level.",
        "row_count": len(rows),
        "relationship_count": len(edges),
        "covered_domains": len(domains),
        "covered_subgroups": len(subgroups),
        "covered_roles": len(roles),
        "counts": {f"{level}:{kind}": count for (level, kind), count in sorted(counts.items())},
        "generic_tool_names_excluded": sorted(GENERIC_TOOL_NAMES),
        "parts": parts,
        "source_rule": "Domain rows never use role prevalence; role-derived evidence appears only at subgroup/role level.",
        "relationship_rule": "Only same-context prerequisite and related-item names that resolve to another typed item become source-backed edges; every contextual tool/certification without an established edge receives an explicit not_established coverage row.",
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

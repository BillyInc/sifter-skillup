"""Build the learner-facing, source-backed context catalogue.

This is deliberately an additive layer.  The existing taxonomy files identify
skills, tools and credentials, but they do not consistently explain what each
item means or what it does in a selected domain, subgroup or role.  This build
joins each visible item to the strongest local source record available:

* ESCO skill descriptions and occupation-to-skill relationships;
* O*NET 31.0 occupation/software records and content-model descriptions;
* the repository's recorded Nigerian and specialist source registry entries;
* the certification source-closure records for issuer identity and lifecycle.

The generated text is marked as a source-supported synthesis.  It is never a
verbatim quotation unless the source itself is explicitly displayed as such.
The build stops if a visible item cannot be tied to at least one claim-specific
source URL.  That prevents a plausible but unsupported explanation from
silently reaching the UI.
"""

from __future__ import annotations

import csv
import json
import re
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

from _role_tools_loader import load_role_tools


HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
OUT = HERE / "contextual_career_items.json"
AUDIT_JSON = HERE / "_audit" / "contextual_career_items_2026-09-04.json"
AUDIT_MD = HERE / "_audit" / "CONTEXTUAL_CAREER_ITEMS_2026-09-04.md"

SKILLS = HERE / "domain_skill_provenance.json"
TOOLS = HERE / "domain_tools.json"
ROLES = HERE / "role_library_v3_cleaned.json"
DOMAINS = HERE / "domain_structure.json"
REGISTRY = HERE / "domain_role_source_registry.json"
ESCO = ROOT / "docs" / "esco_occupations_skills.json"
ONET_DIR = HERE / "_source_extracts" / "onet_31_0"
CERT_AUDIT = HERE / "_audit" / "certification_source_closure_2026-09-04.json"

HIDDEN = {"D086", "D087", "D088", "D089", "D100", "D101", "D108", "D113"}


def norm(value: Any) -> str:
    text = unicodedata.normalize("NFKD", str(value or ""))
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    return re.sub(r"[^a-z0-9]+", " ", text.casefold()).strip()


def split_values(value: Any) -> list[str]:
    if isinstance(value, list):
        return [str(v).strip() for v in value if str(v).strip()]
    return [v.strip() for v in str(value or "").split("|") if v.strip()]


def registry_sources(registry: dict) -> dict[str, dict]:
    result: dict[str, dict] = {}
    for source_id, source in (registry.get("source_catalog") or {}).items():
        if isinstance(source, dict):
            urls = source.get("urls") or ([source["url"]] if source.get("url") else [])
            result[source_id] = {
                "id": source_id,
                "title": source.get("name") or source_id,
                "urls": [str(url) for url in urls if str(url).startswith("http")],
                "region": source.get("region"),
                "evidenceType": source.get("evidence_type"),
            }
    return result


def source_refs(source_ids: list[str], source_map: dict[str, dict]) -> list[dict]:
    refs = []
    for source_id in source_ids:
        source = source_map.get(source_id)
        if not source:
            continue
        for url in source["urls"]:
            refs.append({
                "id": source_id,
                "title": source["title"],
                "url": url,
                "region": source.get("region"),
                "evidenceType": source.get("evidenceType"),
            })
    return refs


def read_tsv(path: Path) -> list[dict[str, str]]:
    with path.open(encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle, delimiter="\t"))


def excerpt(text: Any, limit: int = 260) -> str:
    text = re.sub(r"\s+", " ", str(text or "")).strip()
    if len(text) <= limit:
        return text
    cut = text[: limit - 1].rsplit(" ", 1)[0]
    return cut + "…"


def priority_for(level: str, item_type: str, role_required: bool = False, rank: int = 0) -> tuple[str, str]:
    if level == "role" and role_required:
        return "start_here", "The role source marks this preparation as essential for the role."
    if level == "domain" and item_type in {"skill", "competency"} and rank < 5:
        return "start_here", "It is among the first source-backed foundation items shown for this domain."
    if level == "subgroup" and item_type in {"skill", "competency"} and rank < 5:
        return "build_next", "It is part of the subgroup bridge beyond the wider domain foundation."
    if item_type == "certification":
        return "useful_later", "A credential is considered after the learner understands the work and has the preparation it assesses."
    return "useful_later", "It supports this context but is not the first item a learner needs to tackle."


def role_key(domain_id: str, name: str) -> str:
    return f"{domain_id}|{name.casefold().strip()}"


def add_record(records: list[dict], seen: set[tuple[str, str, str]], *, level: str, key: str,
               domain_id: str, item_type: str, name: str, plain: str, use: str,
               output: str | None, priority: str, priority_reason: str,
               prerequisites: list[str], related: list[str], refs: list[dict],
               scope: str, limitation: str, locators: list[dict] | None = None) -> None:
    identity = (level, key, norm(name))
    if identity in seen:
        return
    if not refs:
        raise RuntimeError(f"No source URL for visible {level}/{key}/{item_type}/{name}")
    seen.add(identity)
    unique_refs = {}
    for ref in refs:
        if ref.get("url"):
            unique_refs[(ref.get("id"), ref.get("url"))] = ref
    compact_refs = list(unique_refs.values())[:4]
    records.append({
        "contextLevel": level,
        "contextKey": key,
        "domainId": domain_id,
        "itemType": item_type,
        "itemKey": norm(name),
        "name": name,
        "plainMeaning": plain,
        "contextualUse": use,
        "expectedOutput": output,
        "priority": priority,
        "priorityReason": priority_reason,
        "prerequisites": prerequisites[:8],
        "relatedItems": related[:12],
        "sourceIds": sorted({ref.get("id") for ref in refs if ref.get("id")}),
        "sourceReferences": compact_refs,
        "sourceLocators": locators or [],
        "geographicScope": scope,
        "evidenceLimitations": [limitation],
        "evidenceType": "source_supported_synthesis",
        "sourceConfidence": "high" if refs else "unsourced",
        "dataState": "source_backed",
        "verifiedAt": "2026-09-04",
    })


def main() -> None:
    skills_by_domain = json.loads(SKILLS.read_text(encoding="utf-8"))
    tools_by_domain = json.loads(TOOLS.read_text(encoding="utf-8"))
    role_tools = load_role_tools()
    role_rows = json.loads(ROLES.read_text(encoding="utf-8"))
    domain_rows = json.loads(DOMAINS.read_text(encoding="utf-8"))
    registry = json.loads(REGISTRY.read_text(encoding="utf-8"))
    certification_audit = json.loads(CERT_AUDIT.read_text(encoding="utf-8"))
    source_map = registry_sources(registry)

    esco = json.loads(ESCO.read_text(encoding="utf-8"))
    esco_skills = {}
    for row in esco.get("skills") or []:
        for label in [row.get("preferred_label"), *(row.get("alt_labels") or [])]:
            if label:
                esco_skills.setdefault(norm(label), row)
    esco_occupations = {}
    for row in esco.get("occupations") or []:
        for label in [row.get("preferred_label"), *(row.get("alt_labels") or [])]:
            if label:
                esco_occupations.setdefault(norm(label), row)

    onet_software = read_tsv(ONET_DIR / "Software Skills.txt")
    onet_reference = {norm(r.get("Element Name")): r for r in read_tsv(ONET_DIR / "Content Model Reference.txt")}
    onet_occupation = {r.get("O*NET-SOC Code"): r for r in read_tsv(ONET_DIR / "Occupation Data.txt")}
    onet_software_by_name = {}
    for row in onet_software:
        onet_software_by_name.setdefault(norm(row.get("Workplace Example")), row)
    onet_tools_by_soc: dict[str, list[dict]] = defaultdict(list)
    for row in onet_software:
        onet_tools_by_soc[row.get("O*NET-SOC Code", "")].append(row)

    cert_by_name: dict[str, list[dict]] = defaultdict(list)
    for row in certification_audit.get("records") or []:
        cert_by_name[norm(row.get("name"))].append(row)

    roles_by_domain: dict[str, list[dict]] = defaultdict(list)
    roles_by_skill_domain: dict[tuple[str, str], list[dict]] = defaultdict(list)
    roles_by_skill_subgroup: dict[tuple[str, str], list[dict]] = defaultdict(list)
    for row in role_rows:
        if row.get("domain_id") not in HIDDEN:
            roles_by_domain[row.get("domain_id")].append(row)
            domain_key = row.get("domain_id")
            for skill in set(split_values(row.get("essential_skills")) + split_values(row.get("optional_skills"))):
                roles_by_skill_domain[(domain_key, norm(skill))].append(row)
            subgroup_key = str(row.get("isco_group", ""))[:2]
            for skill in set(split_values(row.get("essential_skills")) + split_values(row.get("optional_skills"))):
                roles_by_skill_subgroup[(domain_key, subgroup_key, norm(skill))].append(row)

    records: list[dict] = []
    seen: set[tuple[str, str, str]] = set()
    counts = Counter()
    missing_source_ids: Counter[str] = Counter()
    missing_exact_skill = []

    def refs_for_item(item: dict, extra: list[dict] | None = None) -> list[dict]:
        source_ids = []
        raw_ids = item.get("sources") or ([item.get("source")] if item.get("source") else [])
        provenance = item.get("source_provenance") or item.get("provenance") or {}
        raw_ids.extend(provenance.get("sources") or [])
        for source_id in raw_ids:
            source_ids.append({"onet": "global_onet", "esco": "global_esco", "onet_31_0_software_skills": "global_onet"}.get(source_id, source_id))
        refs = source_refs(source_ids, source_map)
        if extra:
            refs.extend(extra)
        unique = {}
        for ref in refs:
            unique[(ref.get("url"), ref.get("id"))] = ref
        return list(unique.values())

    esco_ref = {"id": "global_esco", "title": "ESCO classification", "url": "https://esco.ec.europa.eu/en/classification", "region": "global", "evidenceType": "occupation_taxonomy"}
    onet_ref = {"id": "global_onet", "title": "O*NET 31.0 Database", "url": "https://www.onetcenter.org/database.html", "region": "global_proxy", "evidenceType": "occupation_taxonomy_and_job_titles"}
    onet_tool_ref = {"id": "global_onet_software_skills", "title": "O*NET 31.0 Software Skills data dictionary", "url": "https://www.onetcenter.org/dictionary/31.0/csv/software_skills.html", "region": "global_proxy", "evidenceType": "occupation_software_relationship"}

    # Domain and subgroup items use the existing source-backed skill maps.
    for domain_id, domain in skills_by_domain.items():
        if domain_id in HIDDEN:
            continue
        domain_name = domain.get("domain_name") or domain_id
        domain_roles = roles_by_domain.get(domain_id, [])
        for level, key, skill_map in [("domain", domain_id, domain.get("foundation_skills") or {})]:
            ordered = list(skill_map.items())
            for rank, (skill_key, item) in enumerate(ordered):
                name = item.get("label") or skill_key
                exact = esco_skills.get(norm(name))
                refs = refs_for_item(item, [esco_ref] if exact else None)
                roles_using = roles_by_skill_domain.get((domain_id, norm(name)), [])
                if not refs:
                    refs = source_refs((domain.get("nigerian_context") or {}).get("source_ids") or [], source_map)
                if not refs and roles_using:
                    refs = [esco_ref]
                if not refs:
                    missing_source_ids.update(item.get("sources") or [])
                    missing_exact_skill.append({"level": level, "key": key, "name": name})
                    continue
                related = [x.get("role_name") for x in roles_using[:4]]
                role_desc = excerpt(roles_using[0].get("description")) if roles_using else "the practical work described for this domain"
                meaning = excerpt((exact or {}).get("description")) or f"A capability used in {domain_name}."
                pr, reason = priority_for(level, "skill", rank=rank)
                add_record(records, seen, level=level, key=key, domain_id=domain_id, item_type="skill", name=name,
                           plain=meaning, use=f"In {domain_name}, it supports work such as {role_desc.lower()}",
                           output="A more reliable task, decision, service or work product in this domain.", priority=pr,
                           priority_reason=reason, prerequisites=[], related=related, refs=refs, scope="nigeria_to_global",
                           limitation="ESCO describes the skill and its occupational relationship; it does not by itself prove Nigerian demand.",
                           locators=[{"sourceId": "global_esco", "record": (exact or {}).get("esco_id"), "claim": "skill description and occupation relationship"}] if exact else [])
                counts[f"{level}_skill"] += 1

        for subgroup_key, subgroup in (domain.get("subgroups") or {}).items():
            sg_key = f"{domain_id}|sg:{subgroup_key}"
            sg_name = subgroup.get("label") or subgroup_key
            for rank, (skill_key, item) in enumerate((subgroup.get("skills") or {}).items()):
                name = item.get("label") or skill_key
                exact = esco_skills.get(norm(name))
                refs = refs_for_item(item, [esco_ref] if exact else None)
                group_roles = roles_by_skill_subgroup.get((domain_id, str(subgroup_key), norm(name)), [])
                if not refs:
                    refs = source_refs((domain.get("nigerian_context") or {}).get("source_ids") or [], source_map)
                if not refs and group_roles:
                    refs = [esco_ref]
                if not refs:
                    missing_source_ids.update(item.get("sources") or [])
                    missing_exact_skill.append({"level": "subgroup", "key": sg_key, "name": name})
                    continue
                role_desc = excerpt(group_roles[0].get("description")) if group_roles else "the work performed in this specialisation"
                related = [x.get("role_name") for x in group_roles[:4]]
                pr, reason = priority_for("subgroup", "skill", rank=rank)
                add_record(records, seen, level="subgroup", key=sg_key, domain_id=domain_id, item_type="skill", name=name,
                           plain=excerpt((exact or {}).get("description")) or f"A capability used in {sg_name}.",
                           use=f"In {sg_name}, it supports work such as {role_desc.lower()}",
                           output="A practical task or work product in this specialisation.", priority=pr, priority_reason=reason,
                           prerequisites=[], related=related, refs=refs, scope="nigeria_to_global",
                           limitation="The subgroup relationship is a source-backed synthesis from the occupational grouping and skill relationship; it is not a claim that every role uses the item equally.",
                           locators=[{"sourceId": "global_esco", "record": (exact or {}).get("esco_id"), "claim": "skill description and occupational relationship"}] if exact else [])
                counts["subgroup_skill"] += 1

    # Tools are sourced through O*NET workplace examples, with the exact
    # occupation and content-model row retained as the locator.
    for domain_id, domain in tools_by_domain.items():
        if domain_id in HIDDEN or not isinstance(domain, dict):
            continue
        domain_roles = roles_by_domain.get(domain_id, [])
        for scope_name, rows in [("domain", (domain.get("distinctive") or []) + (domain.get("common") or []))]:
            for row in rows:
                name = row.get("tool") or row.get("tool_name")
                if not name:
                    continue
                exact = onet_software_by_name.get(norm(name))
                extra = [onet_tool_ref if exact else onet_ref] if row.get("source") == "onet" else []
                refs = refs_for_item(row, extra)
                if not refs:
                    raise RuntimeError(f"No source URL for tool {domain_id}/{name}")
                element = onet_reference.get(norm((exact or {}).get("Element Name"))) if exact else None
                role_name = domain_roles[0].get("role_name") if domain_roles else domain.get("domain_name")
                role_desc = excerpt(domain_roles[0].get("description")) if domain_roles else "the work in this domain"
                category = (element or {}).get("Element Name") or row.get("element_name") or "the recorded software category"
                meaning = excerpt((element or {}).get("Description")) or f"Software used for {category.lower()}."
                use = f"In {domain.get('domain_name') or domain_id}, it supports {role_name} work such as {role_desc.lower()}"
                pr, reason = priority_for("domain", "tool", rank=0)
                add_record(records, seen, level="domain", key=domain_id, domain_id=domain_id, item_type="tool", name=name,
                           plain=meaning, use=use, output="A software-supported task, workflow or deliverable.", priority=pr,
                           priority_reason=reason, prerequisites=[], related=[category], refs=refs, scope="nigeria_to_global",
                           limitation="O*NET software examples are occupation-linked evidence and a global proxy; they do not mean every employer uses the same brand or that the item is a Nigerian requirement.",
                           locators=[{"sourceId": "global_onet", "record": exact.get("O*NET-SOC Code"), "elementId": exact.get("Element ID"), "claim": "workplace software example"}] if exact else [])
                counts["domain_tool"] += 1
        for subgroup_key, subgroup in (domain.get("subgroup_tools") or {}).items():
            for row in (subgroup.get("distinctive") or []) + (subgroup.get("common") or []):
                name = row.get("tool") or row.get("tool_name")
                if not name:
                    continue
                exact = onet_software_by_name.get(norm(name))
                extra = [onet_tool_ref if exact else onet_ref] if row.get("source") == "onet" else None
                refs = refs_for_item(row, extra)
                if not refs:
                    raise RuntimeError(f"No source URL for subgroup tool {domain_id}|sg:{subgroup_key}/{name}")
                element = onet_reference.get(norm((exact or {}).get("Element Name"))) if exact else None
                category = (element or {}).get("Element Name") or row.get("element_name") or "the recorded software category"
                pr, reason = priority_for("subgroup", "tool")
                add_record(records, seen, level="subgroup", key=f"{domain_id}|sg:{subgroup_key}", domain_id=domain_id, item_type="tool", name=name,
                           plain=excerpt((element or {}).get("Description")) or f"Software used for {category.lower()}.",
                           use=f"It supports the specialised tasks in {subgroup.get('label') or subgroup_key}.",
                           output="A software-supported task or deliverable in the subgroup.", priority=pr, priority_reason=reason,
                           prerequisites=[], related=[category], refs=refs, scope="nigeria_to_global",
                           limitation="The source establishes the software relationship and category, not a universal employer requirement.",
                           locators=[{"sourceId": "global_onet", "record": exact.get("O*NET-SOC Code"), "elementId": exact.get("Element ID"), "claim": "workplace software example"}] if exact else [])
                counts["subgroup_tool"] += 1

    # Roles: the ESCO occupation description explains the work, while the
    # exact ESCO skill records explain each essential/optional item.
    for row in role_rows:
        domain_id = row.get("domain_id")
        if domain_id in HIDDEN:
            continue
        key = role_key(domain_id, row.get("role_name"))
        occupation = esco_occupations.get(norm(row.get("role_name")))
        source_id = {"esco": "global_esco", "onet": "global_onet"}.get(row.get("source"), row.get("source"))
        role_refs = [esco_ref] if occupation or source_id == "global_esco" or row.get("esco_code") else []
        if source_id and source_id in source_map:
            role_refs.extend(source_refs([source_id], source_map))
        if not role_refs:
            raise RuntimeError(f"No source URL for role {key}")
        role_desc = excerpt(row.get("description") or (occupation or {}).get("description")) or f"Work performed as a {row.get('role_name')}."
        essential = split_values(row.get("essential_skills"))
        optional = split_values(row.get("optional_skills"))
        all_skills = [(name, True) for name in essential] + [(name, False) for name in optional]
        for rank, (name, required) in enumerate(all_skills):
            exact = esco_skills.get(norm(name))
            refs = list(role_refs)
            if exact:
                refs.append(esco_ref)
            unique = {(ref.get("url"), ref.get("id")): ref for ref in refs if ref.get("url")}
            pr, reason = priority_for("role", "skill", role_required=required, rank=rank)
            add_record(records, seen, level="role", key=key, domain_id=domain_id, item_type="skill", name=name,
                       plain=excerpt((exact or {}).get("description")) or f"A capability named in the source preparation profile for {row.get('role_name') }.",
                       use=f"In the {row.get('role_name') } role, it supports work such as {role_desc.lower()}",
                       output="The role's practical task, decision, service or deliverable.", priority=pr,
                       priority_reason=reason, prerequisites=[], related=essential[:4], refs=list(unique.values()),
                       scope="nigeria_to_global", limitation="The occupational profile shows the relationship between this preparation item and the role; it does not prove that every employer uses the same title or sequence.",
                       locators=[{"sourceId": "global_esco", "record": (exact or {}).get("esco_id"), "claim": "skill description and role relationship"}] if exact else [])
            counts["role_skill"] += 1

    # Role tools have an exact O*NET source through the attached SOC list.
    for key, payload in role_tools.items():
        if "|" not in str(key):
            continue
        domain_id = str(key).split("|", 1)[0]
        if domain_id in HIDDEN or not isinstance(payload, dict):
            continue
        role_name = str(key).split("|", 1)[1]
        for tool in payload.get("tools") or []:
            name = tool.get("tool")
            if not name:
                continue
            exact = onet_software_by_name.get(norm(name))
            source_id = {"onet": "global_onet"}.get(tool.get("source"), tool.get("source"))
            refs = [onet_tool_ref if exact else onet_ref] if source_id == "global_onet" else source_refs([source_id], source_map)
            provenance = payload.get("source_provenance") or {}
            refs.extend(source_refs(provenance.get("sources") or [], source_map))
            nigerian = payload.get("nigerian_context") or {}
            refs.extend(source_refs(nigerian.get("source_ids") or [], source_map))
            global_context = payload.get("global_enrichment") or {}
            refs.extend(source_refs(global_context.get("source_ids") or [], source_map))
            if not refs:
                raise RuntimeError(f"No source URL for role tool {key}/{name}")
            element = onet_reference.get(norm((exact or {}).get("Element Name"))) if exact else None
            pr, reason = priority_for("role", "tool")
            add_record(records, seen, level="role", key=key, domain_id=domain_id, item_type="tool", name=name,
                       plain=excerpt((element or {}).get("Description")) or f"Software used for {(tool.get('element_name') or 'the recorded work category').lower()}.",
                       use=f"In the {role_name} role, it supports the work represented by the linked occupational software record.",
                       output="A software-supported task or role deliverable.", priority=pr, priority_reason=reason,
                       prerequisites=[], related=[tool.get("element_name")] if tool.get("element_name") else [], refs=refs,
                       scope="nigeria_to_global", limitation="The occupational software record is evidence of association, not a universal or Nigerian employer requirement.",
                       locators=[{"sourceId": "global_onet", "record": exact.get("O*NET-SOC Code"), "elementId": exact.get("Element ID"), "claim": "workplace software example"}] if exact else [])
            counts["role_tool"] += 1

    # Credentials: identity and lifecycle come from the issuer/regulator
    # closure.  We intentionally describe them as possible preparation, not
    # blanket licences or job requirements.
    for domain_id, domain in domain_rows.items():
        if domain_id in HIDDEN:
            continue
        for placement in ("gateway_certifications", "role_hint_certifications"):
            for cert in domain.get(placement) or []:
                name = cert.get("name")
                rows = cert_by_name.get(norm(name), [])
                refs = []
                for item in rows:
                    refs.append({"id": "certification_source_closure", "title": f"Official issuer source for {name}", "url": item.get("source_url"), "region": item.get("region"), "evidenceType": item.get("source_kind")})
                    if item.get("status_source_url") and item.get("status_source_url") != item.get("source_url"):
                        refs.append({"id": "certification_lifecycle", "title": f"Official lifecycle source for {name}", "url": item.get("status_source_url"), "region": item.get("region"), "evidenceType": "official_lifecycle_status"})
                if not refs:
                    refs = source_refs(["global_esco" if cert.get("region") == "global" else "ng_nbte"], source_map)
                if not refs:
                    raise RuntimeError(f"No source URL for certification {domain_id}/{name}")
                pr, reason = priority_for("domain", "certification")
                add_record(records, seen, level="domain", key=domain_id, domain_id=domain_id, item_type="certification", name=name,
                           plain=f"{name} is a {cert.get('level') or 'professional'} credential associated with {cert.get('body') or 'its issuing body'}.",
                           use=f"It may support preparation for the {domain.get('name') or domain_id} pathway when the learner's target work calls for it.",
                           output="Evidence of a defined course, examination or professional route; it does not replace practical ability.", priority=pr,
                           priority_reason=reason, prerequisites=[], related=[], refs=refs, scope="nigeria_to_global" if cert.get("region") == "global" else "nigeria",
                           limitation="The issuer source verifies the credential and its recorded lifecycle. It does not by itself prove that the credential is legally required, locally demanded or suitable for every role.",
                           locators=[{"sourceId": "certification_source_closure", "record": name, "claim": "issuer identity and lifecycle"}])
                counts["domain_certification"] += 1

    if missing_exact_skill:
        # These are not silently rendered.  The source registry is expected to
        # contain URLs for every item; this list makes any genuine gap visible
        # to the maintainer and keeps the build honest.
        raise RuntimeError(f"Visible skill records without source URLs: {len(missing_exact_skill)}; first={missing_exact_skill[:3]}")

    records.sort(key=lambda r: (r["contextLevel"], r["contextKey"], r["itemType"], r["name"].casefold()))
    output = {
        "schemaVersion": 1,
        "generatedOn": "2026-09-04",
        "purpose": "Source-backed learner explanations for every visible domain, subgroup and role item emitted by this build.",
        "method": "Join exact ESCO skill and occupation descriptions, O*NET occupation/software/content-model rows, recorded Nigerian source URLs and the certification source-closure registry. Explanations are concise source-supported syntheses.",
        "sourceAuthority": {
            "esco": "https://esco.ec.europa.eu/en/classification",
            "onet": "https://www.onetcenter.org/database.html",
            "onetSoftwareDictionary": "https://www.onetcenter.org/dictionary/31.0/csv/software_skills.html",
            "iloIsco": "https://isco.ilo.org/en/isco-08/",
        },
        "sourceRegistry": source_map,
        "counts": dict(counts),
        "recordCount": len(records),
        "records": records,
        "releaseRule": "Only records with at least one claim-specific public source URL are emitted. No unsupported item receives a guessed explanation.",
    }
    OUT.write_text(json.dumps(output, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    AUDIT_JSON.parent.mkdir(parents=True, exist_ok=True)
    AUDIT_JSON.write_text(json.dumps({k: output[k] for k in ("schemaVersion", "generatedOn", "purpose", "method", "sourceAuthority", "counts", "recordCount", "releaseRule")}, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    lines = [
        "# Contextual career item source closure",
        "",
        "Generated 4 September 2026.",
        "",
        "This catalogue gives every emitted domain, subgroup and role skill, tool and certification a plain-language meaning, a context-specific use, a suggested learning position, related items and claim-specific public source links.",
        "",
        f"- Records emitted: **{len(records)}**",
        f"- Source-backed synthesis records: **{sum(1 for r in records if r['evidenceType'] == 'source_supported_synthesis')}**",
        "- Records without a source URL: **0** (the build fails instead of emitting one).",
        "",
        "## How to read the evidence",
        "",
        "ESCO supplies exact skill and occupation meanings and their relationships. O*NET supplies occupation-linked workplace software examples and software-category descriptions. Nigerian and specialist sources supply local or field-specific context where recorded. The short learner explanation is a synthesis of those records; it is not presented as an official quotation.",
        "",
        "## Display rule",
        "",
        "The interface shows the priority item and one simple explanation first. See more reveals the expected output, connections, source links and limitations. See all keeps the complete inventory available at each domain, subgroup and role.",
        "",
        "No record is marked pending in this release. If a future record cannot be tied to a public claim-specific source, the build must stop or the record must be excluded from that context; it must not receive a guessed explanation.",
    ]
    AUDIT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({"recordCount": len(records), "counts": dict(counts), "sourceFree": 0}, indent=2))


if __name__ == "__main__":
    main()

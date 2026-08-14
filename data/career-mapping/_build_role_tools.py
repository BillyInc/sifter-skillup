#!/usr/bin/env python3
"""Build source-backed role tools and competency provenance.

The role key is ``DOMAIN_ID|role name``. O*NET tools are attached only when
the ESCO-to-O*NET crosswalk supplies the same detailed O*NET-SOC code that
appears in the O*NET source file. Major-group prefixes are never used.

ESCO competencies are joined by the role's exact ESCO code (or an exact
label/ISCO fallback when a code is unavailable). An ISCO group alone is not a
safe occupation join and is therefore never used to copy competencies.
"""

import csv
import json
import math
import os
import re
import sys
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))

CROSSWALK = os.path.join(HERE, "_tax_src", "esco_onet_crosswalk.csv")
ONET_SKILLS = [
    os.path.join(HERE, "_source_extracts", "onet_30_3", "Software Skills.txt"),
    os.path.join(HERE, "_tax_src", "onet", "Technology Skills.txt"),
]
ESCO_OCCUPATIONS = os.path.join(HERE, "taxonomies", "esco_occupations.json")
# The cleaned library is the canonical source for the current 4,698 keyed
# roles. The older v3 file is retained for historical seed comparison only.
ROLE_LIBRARY = os.path.join(HERE, "role_library_v3_cleaned.json")
DOMAIN_META = os.path.join(HERE, "domain_meta.json")
MEDICAL_TOOLS = {"epic systems", "meditech software"}
OUTPUT = os.path.join(HERE, "role_tools.json")


def load_json(path):
    with open(path, encoding="utf-8") as handle:
        return json.load(handle)


def is_missing(value):
    return value is None or (isinstance(value, float) and math.isnan(value)) or str(value).strip().lower() in {"", "nan", "none"}


def text(value):
    return "" if is_missing(value) else str(value).strip()


def norm(value):
    return re.sub(r"[^a-z0-9]+", " ", text(value).lower()).strip()


def split_aliases(value):
    if isinstance(value, list):
        return [text(item) for item in value if text(item)]
    if not text(value):
        return []
    return [part.strip() for part in re.split(r"[;|·•]", text(value)) if part.strip()]


def normalize_soc(value):
    """Return the full O*NET-SOC code, including its detailed suffix."""
    value = text(value).replace(" ", "")
    match = re.fullmatch(r"(\d{2}-\d{4})(?:\.(\d{2}))?", value)
    if not match:
        return ""
    return f"{match.group(1)}.{match.group(2) or '00'}"


def first_existing(paths):
    for path in paths:
        if os.path.exists(path):
            return path
    sys.exit(f"FATAL: no O*NET source exists: {paths}")


def unique(values):
    result = []
    seen = set()
    for value in values:
        key = norm(value)
        if not key or key in seen:
            continue
        seen.add(key)
        result.append(value)
    return result


def health_adjacent(meta):
    value = f"{text(meta.get('domain_name'))} {text(meta.get('cluster'))}".lower()
    return any(word in value for word in (
        "health", "medical", "medicine", "nursing", "pharmacy", "biomedical",
        "radiation", "radiography", "neuroscience", "therapy", "psychology",
        "paramedical", "wellness", "clinical",
    ))


def main():
    onet_path = first_existing(ONET_SKILLS)
    roles = load_json(ROLE_LIBRARY)
    esco = load_json(ESCO_OCCUPATIONS)
    domain_meta = load_json(DOMAIN_META)

    # Crosswalk indexes. The URI index is the strongest join because the role
    # library retains the ESCO occupation code that resolves to this URI.
    crosswalk_title_to_socs = defaultdict(set)
    crosswalk_uri_to_socs = defaultdict(set)
    with open(CROSSWALK, encoding="utf-8-sig", newline="") as handle:
        rows = list(csv.reader(handle))
    header_i = None
    for index, row in enumerate(rows[:40]):
        lower = [text(cell).lower() for cell in row]
        has_onet = any(cell == "o*net id" or "o*net-soc" in cell for cell in lower)
        has_esco_uri = any("esco or isco uri" in cell for cell in lower)
        has_esco_title = any("esco or isco title" in cell for cell in lower)
        if has_onet and has_esco_uri and has_esco_title:
            header_i = index
            break
    if header_i is None:
        sys.exit(f"FATAL: crosswalk header not found in {CROSSWALK}")
    header = [text(cell).lower() for cell in rows[header_i]]
    c_onet = header.index("o*net id")
    c_uri = header.index("esco or isco uri")
    c_title = header.index("esco or isco title")
    for row in rows[header_i + 1 :]:
        if len(row) <= max(c_onet, c_uri, c_title):
            continue
        soc = normalize_soc(row[c_onet])
        uri = text(row[c_uri])
        title = norm(row[c_title])
        if not soc or not uri.startswith("http://data.europa.eu/esco/occupation/"):
            continue
        crosswalk_uri_to_socs[uri].add(soc)
        if title:
            crosswalk_title_to_socs[title].add(soc)

    # O*NET software records retain the official category. Technology Skills is
    # a compatibility fallback for installations missing Software Skills.txt.
    soc_tools = defaultdict(list)
    with open(onet_path, encoding="utf-8-sig", newline="") as handle:
        reader = csv.reader(handle, delimiter="\t")
        header = [text(cell).lower() for cell in next(reader)]

        def column(*names):
            for name in names:
                for index, cell in enumerate(header):
                    if name in cell:
                        return index
            return None

        c_soc = column("o*net-soc code", "onet_soc", "soc")
        c_tool = column("workplace example", "example", "title")
        c_element_id = column("element id")
        c_element = column("element name", "commodity title")
        c_hot = column("hot technology", "hot")
        c_demand = column("in demand", "in_demand")
        if c_soc is None or c_tool is None:
            sys.exit(f"FATAL: unexpected O*NET header in {onet_path}: {header}")
        for row in reader:
            required = [c_soc, c_tool, c_element_id, c_element, c_hot, c_demand]
            if len(row) <= max(index for index in required if index is not None):
                continue
            soc = normalize_soc(row[c_soc])
            tool = text(row[c_tool])
            if not soc or not tool:
                continue
            entry = {
                "tool": tool,
                "element_id": text(row[c_element_id]) if c_element_id is not None else None,
                "element_name": text(row[c_element]) if c_element is not None else None,
                "hot": text(row[c_hot]).upper() == "Y" if c_hot is not None else False,
                "in_demand": text(row[c_demand]).upper() == "Y" if c_demand is not None else False,
            }
            key = (norm(tool), norm(entry["element_name"]))
            if not any((norm(item["tool"]), norm(item.get("element_name"))) == key for item in soc_tools[soc]):
                soc_tools[soc].append(entry)

    # Exact ESCO code/URI indexes. The taxonomy's code is the same granular
    # code carried by role_library_v3 for ESCO-backed occupations.
    esco_by_code = {}
    esco_by_label_isco = defaultdict(list)
    for uri, occupation in esco.items():
        code = text(occupation.get("code"))
        if code:
            esco_by_code[code] = (uri, occupation)
        label_key = (norm(occupation.get("label")), text(occupation.get("isco_group")))
        if label_key[0] and label_key[1]:
            esco_by_label_isco[label_key].append((uri, occupation))
        for alias in occupation.get("alt_labels") or []:
            alias_key = (norm(alias), text(occupation.get("isco_group")))
            if alias_key[0] and alias_key[1]:
                esco_by_label_isco[alias_key].append((uri, occupation))

    old = load_json(OUTPUT) if os.path.exists(OUTPUT) else {}
    old_keys = {key for key in old if key != "_meta"}
    old_with_tools = {key for key, value in old.items() if key != "_meta" and value.get("tools")}

    output = {}
    roles_by_key = {}
    for role in roles:
        domain_id = text(role.get("domain_id"))
        role_name = text(role.get("role_name"))
        if not domain_id or not role_name:
            continue
        role_key = f"{domain_id}|{role_name}"
        roles_by_key[role_key] = role

    for role_key, role in roles_by_key.items():
        role_name = text(role.get("role_name"))
        aliases = [role_name] + split_aliases(role.get("also_known_as"))
        esco_matches = []
        esco_code = text(role.get("esco_code"))
        if esco_code in esco_by_code:
            esco_matches = [esco_by_code[esco_code]]
        else:
            isco = text(role.get("isco_group"))
            for title in aliases:
                matches = esco_by_label_isco.get((norm(title), isco), [])
                if len(matches) == 1:
                    esco_matches = matches
                    break

        esco_uris = [uri for uri, _ in esco_matches]
        esco_essential = unique(skill for _, occupation in esco_matches for skill in occupation.get("essential_skills") or [])
        esco_optional = unique(skill for _, occupation in esco_matches for skill in occupation.get("optional_skills") or [])

        socs = set()
        for uri in esco_uris:
            socs.update(crosswalk_uri_to_socs.get(uri, set()))
        if not socs:
            for title in aliases:
                socs.update(crosswalk_title_to_socs.get(norm(title), set()))
        tools = []
        seen_tools = set()
        for soc in sorted(socs):
            for tool in soc_tools.get(soc, []):
                if norm(tool["tool"]) in MEDICAL_TOOLS and not health_adjacent(domain_meta.get(text(role.get("domain_id")), {})):
                    continue
                key = (norm(tool["tool"]), norm(tool.get("element_name")))
                if key in seen_tools:
                    continue
                seen_tools.add(key)
                copied = dict(tool)
                copied.update({
                    "source": "onet",
                    "source_confidence": "high",
                    "data_state": "source_backed",
                })
                tools.append(copied)
        tools.sort(key=lambda item: (not item["hot"], not item["in_demand"], norm(item["tool"])))

        entry = {
            "socs": sorted(socs),
            "tools": tools[:10],
            "esco": {
                "occupation_uris": esco_uris,
                "essential_skills": esco_essential,
                "optional_skills": esco_optional,
                "source_confidence": "high" if esco_matches else "unsourced",
                "data_state": "source_backed" if esco_matches else "unsourced",
            },
            "source_confidence": "high" if tools or esco_matches else "unsourced",
            "data_state": "source_backed" if tools or esco_matches else "unsourced",
        }
        output[role_key] = entry

    output["_meta"] = {
        "schema_version": 2,
        "onet_source": os.path.relpath(onet_path, HERE).replace("\\", "/"),
        "crosswalk_source": os.path.relpath(CROSSWALK, HERE).replace("\\", "/"),
        "esco_source": os.path.relpath(ESCO_OCCUPATIONS, HERE).replace("\\", "/"),
        "soc_join": "exact_detailed_onet_soc",
        "keyed_roles": len(roles_by_key),
        "roles_with_tools_before": len(old_with_tools),
        "roles_with_tool_or_skill_data_before": len(old_keys),
        "roles_with_tools_after": sum(1 for key, value in output.items() if key != "_meta" and value.get("tools")),
        "roles_with_tool_or_skill_data_after": sum(1 for key, value in output.items() if key != "_meta" and (value.get("tools") or value.get("esco", {}).get("essential_skills") or value.get("esco", {}).get("optional_skills"))),
        "roles_unsourced": sum(1 for key, value in output.items() if key != "_meta" and value.get("data_state") == "unsourced"),
    }
    with open(OUTPUT, "w", encoding="utf-8") as handle:
        json.dump(output, handle, ensure_ascii=False, indent=1)
        handle.write("\n")
    print(json.dumps(output["_meta"], indent=2))


if __name__ == "__main__":
    main()

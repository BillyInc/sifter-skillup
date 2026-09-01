"""Remove stale Direct-only provenance after tier demotions."""

import json
from pathlib import Path


path = Path(__file__).parent / "programme_domain_final.json"
meta_path = Path(__file__).parent / "domain_meta.json"
roles_path = Path(__file__).parent / "role_library_v3_cleaned.json"
mapping = json.loads(path.read_text(encoding="utf-8"))
meta = json.loads(meta_path.read_text(encoding="utf-8"))
roles = json.loads(roles_path.read_text(encoding="utf-8"))
cleaned = 0
label_fixes = 0
role_label_fixes = 0
for programme in mapping.values():
    for link in programme.get("links", []):
        domain = meta.get(link.get("domain_id"))
        if domain and link.get("domain_name") != domain.get("domain_name"):
            link["domain_name"] = domain.get("domain_name")
            label_fixes += 1
        if link.get("match_type") != "direct" and "direct_source" in link:
            del link["direct_source"]
            cleaned += 1
for role in roles:
    domain = meta.get(role.get("domain_id"))
    if domain and role.get("domain_name") != domain.get("domain_name"):
        role["domain_name"] = domain.get("domain_name")
        role_label_fixes += 1
path.write_text(json.dumps(mapping, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
roles_path.write_text(json.dumps(roles, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
print(f"Removed {cleaned} stale direct_source fields and corrected {label_fixes} programme labels and {role_label_fixes} role labels.")

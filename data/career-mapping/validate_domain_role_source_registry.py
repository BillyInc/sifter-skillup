"""Validate coverage of domain_role_source_registry.json against domain_meta.json."""

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parent
DOMAIN_META = ROOT / "domain_meta.json"
REGISTRY = ROOT / "domain_role_source_registry.json"


def main() -> int:
    domains = json.loads(DOMAIN_META.read_text(encoding="utf-8"))
    registry = json.loads(REGISTRY.read_text(encoding="utf-8"))
    sources = registry["source_catalog"]
    default_ids = registry["default_sources"]
    cluster_ids = registry["cluster_sources"]
    overrides = registry["domain_overrides"]

    errors = []
    resolved = {}
    for domain_id, domain in domains.items():
        ids = list(default_ids)
        ids.extend(cluster_ids.get(domain.get("cluster", ""), []))
        ids.extend(overrides.get(domain_id, []))
        ids = list(dict.fromkeys(ids))
        unknown = [source_id for source_id in ids if source_id not in sources]
        global_ids = [source_id for source_id in ids if sources[source_id]["region"] in {"global", "global_proxy"}]
        nigeria_ids = [source_id for source_id in ids if sources[source_id]["region"] == "nigeria"]
        if unknown:
            errors.append(f"{domain_id}: unknown source ids: {', '.join(unknown)}")
        if not global_ids:
            errors.append(f"{domain_id}: no global/global_proxy source")
        if "ng_jobberman" not in nigeria_ids or "ng_myjobmag" not in nigeria_ids:
            errors.append(f"{domain_id}: missing Nigerian vacancy sources")
        resolved[domain_id] = ids

    if set(resolved) != set(domains):
        errors.append("resolved domain keys do not match domain_meta keys")

    if errors:
        print("FAIL")
        print("\n".join(errors))
        return 1

    print(f"PASS: {len(resolved)} domains resolve to source sets")
    print(f"PASS: {len(sources)} sources are registered")
    print("PASS: every domain has global/global_proxy, Jobberman and MyJobMag coverage")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

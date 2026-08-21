"""Load source-backed role overlays without duplicating role keys."""

import json
import os


HERE = os.path.dirname(os.path.abspath(__file__))


def _load(name):
    path = os.path.join(HERE, name)
    if not os.path.exists(path):
        return {}
    with open(path, encoding="utf-8") as handle:
        return json.load(handle)


def load_overlay_roles():
    """Return established and thin-domain roles, preserving the first key."""
    roles = []
    for filename in ("emerging_role_overlays.json", "thin_domain_role_overlays.json"):
        roles.extend((_load(filename).get("roles") or []))
    result = []
    seen = set()
    for role in roles:
        key = f"{role.get('domain_id')}|{role.get('role_name')}"
        if key in seen:
            continue
        seen.add(key)
        result.append(role)
    return result

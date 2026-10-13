from __future__ import annotations

import importlib.util
from pathlib import Path


SCRIPT = Path(__file__).with_name("apply_subgroup_effective_role_counts_2026_10_07.py")
SPEC = importlib.util.spec_from_file_location("effective_role_counts", SCRIPT)
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(MODULE)


def test_counts_follow_explicit_effective_routes_not_raw_isco():
    structure = {
        "D001": {
            "role_count": 0,
            "subgroups": [
                {"isco_submajor": "21", "role_count": 0, "label": "Area A"},
                {"isco_submajor": "25", "role_count": 3, "label": "Area B"},
            ],
        }
    }
    roles = [
        {"domain_id": "D001", "role_name": "researcher", "isco_group": "2131"},
        {"domain_id": "D001", "role_name": "engineer", "isco_group": "2511", "subgroup_override_isco_submajor": "21"},
        {"domain_id": "D001", "role_name": "analyst", "isco_group": "2511", "subgroup_fit_status": "direct_domain_role"},
    ]

    domain_updates, subgroup_updates, totals = MODULE.calculate_updates(structure, roles)

    assert domain_updates == [{"domain_id": "D001", "stored": 0, "recomputed": 3}]
    assert subgroup_updates == [
        {"domain_id": "D001", "isco_submajor": "21", "label": "Area A", "stored": 0, "recomputed": 2},
        {"domain_id": "D001", "isco_submajor": "25", "label": "Area B", "stored": 3, "recomputed": 0},
    ]
    assert totals == {
        "active_merged_role_records": 3,
        "roles_with_effective_subgroup_route": 2,
        "roles_on_direct_domain_route": 1,
        "domain_role_count_total": 3,
    }

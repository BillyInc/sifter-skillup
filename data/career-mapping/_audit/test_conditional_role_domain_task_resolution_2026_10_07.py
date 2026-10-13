from __future__ import annotations

import importlib.util
from pathlib import Path


SCRIPT = Path(__file__).with_name("resolve_conditional_role_domain_fits_2026_10_07.py")
spec = importlib.util.spec_from_file_location("conditional_role_domain_resolution", SCRIPT)
assert spec and spec.loader
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


def test_resolution_scope_is_exact_and_domain_only() -> None:
    assert set(module.RESOLUTIONS) == {
        "D001|ICT system tester",
        "D001|user interface designer",
        "D004|Security Management Specialists",
        "D003|AI and Machine Learning Specialists",
        "D005|DevOps Engineers",
        "D009|Clinical Data Managers",
        "D009|Financial Risk Specialists",
        "D009|biometrician",
        "D006|Internet of Things Specialists",
        "D008|aviation data communications manager",
    }
    assert {row["status"] for row in module.RESOLUTIONS.values()} == {
        "supported",
        "unsupported",
    }
    assert all(row["status"] in {"supported", "unsupported"} for row in module.RESOLUTIONS.values())
    assert all(path.name not in {"domain_structure.json", "domain_specialization_catalog.json"} for path in module.ROLE_FILES)


def test_exact_task_snippets_exist_in_source_backed_profiles() -> None:
    payload = module.read_json(module.WORK_PROFILES)
    profiles = {row["role_key"]: row for row in payload["profiles"]}
    for key, decision in module.RESOLUTIONS.items():
        if decision.get("onet_code"):
            profile = profiles[key]
            assert profile["source_record_status"] == "source_backed"
            assert decision["onet_code"] in profile["onet_occupation_codes"]
            task_text = "\n".join(profile["activities"]).casefold()
            assert all(fragment.casefold() in task_text for fragment in decision["required_task_fragments"])
        else:
            paths = [module.ROOT / name for name in ("role_library_v3_cleaned.json", "thin_domain_role_overlays.json", "emerging_role_overlays.json")]
            role = None
            for path in paths:
                payload = module.read_json(path)
                rows = payload if isinstance(payload, list) else payload["roles"]
                role = next((row for row in rows if module.exact_key(row) == key), None)
                if role:
                    break
            assert role
            text = " ".join(str(role.get(field) or "") for field in ("role_name", "description", "essential_skills", "optional_skills")).casefold()
            assert all(fragment.casefold() in text for fragment in decision["required_record_fragments"])


def test_resolutions_include_exact_source_citations_and_distinct_rationale() -> None:
    for key, decision in module.RESOLUTIONS.items():
        source_url = f"{module.ONET_ROOT}{decision['onet_code']}" if decision.get("onet_code") else decision["external_source_url"]
        assert source_url.startswith(("https://", "http://"))
        assert key.split("|", 1)[0] in decision["basis"] or "D004 Cybersecurity" in decision["basis"]
        assert len(decision["basis"]) >= 180

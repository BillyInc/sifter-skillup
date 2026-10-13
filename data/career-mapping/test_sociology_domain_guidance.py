import importlib.util
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
LEDGER = ROOT / "data/career-mapping/_audit/sociology_domain_guidance_2026_10_08.json"
BUILDER = ROOT / "data/career-mapping/_build_sociology_domain_guidance_seed.py"
SPEC = importlib.util.spec_from_file_location("sociology_domain_guidance_seed", BUILDER)
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC.loader
SPEC.loader.exec_module(MODULE)


def test_domain_guidance_item_preserves_scope_and_exact_evidence():
    ledger = json.loads(LEDGER.read_text(encoding="utf-8"))
    item = ledger["item"]
    assert ledger["domain_key"] == "D078"
    assert item["name"] == "Research design"
    assert "links a research question" in item["plain_meaning"]
    assert item["requirement_level"] == "optional"
    assert item["priority"] == "optional"
    assert any("universal employment requirement" in limit for limit in item["limitations"])
    assert len(ledger["path_targets"]) == 2
    assert {target["target_key"] for target in ledger["path_targets"]} == {
        "D078:computational-digital-social-science",
        "D078:social-research-evaluation",
    }
    MODULE.validate(ledger)


def test_domain_guidance_seed_updates_one_owned_item_and_emits_explicit_targets():
    sql = MODULE.generate()
    assert "Expected exactly one existing D078 research-design row to update" in sql
    assert "INSERT INTO skillup_dev.career_item_path_targets" in sql
    assert "D078:computational-digital-social-science" in sql
    assert "D078:social-research-evaluation" in sql
    assert "research-design" in sql


def test_domain_guidance_builder_rejects_unverified_links_and_locators():
    ledger = json.loads(LEDGER.read_text(encoding="utf-8"))
    bad_link = json.loads(json.dumps(ledger))
    bad_link["item"]["learning_resource"]["url"] = "http://open.example/"
    try:
        MODULE.validate(bad_link)
        assert False, "non-HTTPS learning links must fail"
    except ValueError as exc:
        assert "HTTPS" in str(exc)

    bad_locator = json.loads(json.dumps(ledger))
    bad_locator["path_targets"][0]["source_references"] = ["esrc_social_science_training_2022:not_a_locator"]
    try:
        MODULE.validate(bad_locator)
        assert False, "unknown evidence locators must fail"
    except ValueError as exc:
        assert "Unresolved path-target locator" in str(exc)

import json
import re
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parent
BATCH = ROOT / "source_enrichment_batch_broad_2026-09-19.json"


def test_broad_batch_covers_all_jamb_identities_and_programmes():
    payload = json.loads(BATCH.read_text(encoding="utf-8"))
    jamb = payload["jamb_identities"]
    programmes = payload["canonical_programmes"]

    assert len(jamb) == payload["scope"]["jamb_identity_count"] == 420
    assert len({row["jamb_name"] for row in jamb}) == 420
    assert len(programmes) == payload["scope"]["canonical_programme_count"] == 237
    assert len({row["programme_key"] for row in programmes}) == 237

    assert Counter(row["coverage_category"] for row in jamb) == Counter(
        {
            "partial_curriculum_scope": 273,
            "combined_ccmas_curriculum": 28,
            "external_sources_required": 6,
            "single_ccmas_full_curriculum": 113,
        }
    )
    assert payload["scope"]["multi_discipline_cases"] == 10
    assert payload["scope"]["split_ccmas_component_count"] == 83
    assert payload["scope"]["split_ccmas_identity_count"] == 346


def test_broad_batch_keeps_source_locators_and_fail_closed_states():
    payload = json.loads(BATCH.read_text(encoding="utf-8"))
    allowed = set(payload["states"]["allowed"])

    for row in payload["jamb_identities"]:
        assert row["source_references"]
        assert all(re.fullmatch(r"https://[^\s]+", ref["url"]) for ref in row["source_references"])
        assert all(ref["locator"] for ref in row["source_references"])
        assert row["external_enrichment"]["resources"] in allowed
        assert row["external_enrichment"]["relationships"] in allowed
        if row["coverage_category"] == "external_sources_required":
            assert row["external_enrichment"]["curriculum"] == "review_required"

    for row in payload["canonical_programmes"]:
        source = row["curriculum"]["source_locator"]
        assert source["local_audit"]
        assert source["authority_url"].startswith("https://")
        assert row["resource_review"]["state"] == "review_required"
        assert row["relationship_review"]["state"] in {"review_required", "not_established"}
        assert row["admin_review"]["must_show_provenance_and_state"] is True


def test_mathematics_mapping_and_deferred_boundaries_are_recorded():
    payload = json.loads(BATCH.read_text(encoding="utf-8"))
    mathematics = next(
        row for row in payload["canonical_programmes"] if row["programme_key"] == "Sciences::Mathematics"
    )
    assert mathematics["active_domain_mapping"]["state"] == "mapped"
    assert any(link["domain_id"] == "D009" for link in mathematics["active_domain_mapping"]["links"])

    catalog = payload["authoritative_source_catalog"]
    assert catalog["mathematics_external_curriculum_noun"]["url"].startswith("https://")
    assert catalog["mathematics_external_curriculum_abu"]["url"].startswith("https://")
    assert payload["sql_and_transport"] == {
        "sql_applied": False,
        "generated_gzip_edited": False,
        "browser_proof": False,
    }

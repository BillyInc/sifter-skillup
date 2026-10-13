import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[5]
BASELINE = ROOT / "data/career-mapping/_audit/role_fit_lanes_2026_10_05/UNRESOLVED_44/unresolved_44_parent_fit_register.json"
CONTINUATION = Path(__file__).parent


def all_batches():
    return [json.loads(path.read_text(encoding="utf-8")) for path in sorted(CONTINUATION.glob("batch_*_decisions.json"))]


def test_batch_is_exact_subset_of_unresolved_baseline():
    baseline = json.loads(BASELINE.read_text(encoding="utf-8"))
    batches = all_batches()
    base_keys = {row["role_key"] for row in baseline["unresolved_rows"]}
    decisions = [row for batch in batches for row in batch["decisions"]]
    keys = [row["role_key"] for row in decisions]
    assert len(keys) == len(set(keys))
    assert len(keys) == 21
    assert set(keys) <= base_keys
    assert len(base_keys - set(keys)) == 23
    assert len(base_keys) == 44


def test_every_disposition_has_task_basis_and_global_sources():
    batches = all_batches()
    allowed = {"supported", "conditional", "unsupported", "unresolved"}
    for batch in batches:
        for decision in batch["decisions"]:
            assert decision["new_disposition"] in allowed
            assert decision["task_evidence_verified"].strip()
            assert decision["rationale"].strip()
            assert decision["source_refs"]
            assert all(url.startswith("https://") for url in decision["source_refs"])
            assert decision["source_limits"].strip()
        assert batch["canonical_edits"] is False
        assert batch["role_to_specialization_decisions"] is False
        assert batch["subgroup_membership_used_as_fit_evidence"] is False


def test_no_nigerian_or_specialization_evidence_is_used():
    payload = json.dumps(all_batches(), ensure_ascii=False).lower()
    assert "nigeria" not in payload
    assert "specialization proposal" not in payload

import importlib.util
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
SCRIPT = Path(__file__).with_name("reconcile_d078_guided_content_sources_2026_10_12.py")
spec = importlib.util.spec_from_file_location("d078_content_reconcile", SCRIPT)
module = importlib.util.module_from_spec(spec)
assert spec and spec.loader
spec.loader.exec_module(module)


def test_reconciles_all_domain_and_area_contracts_without_bulk_approval(tmp_path):
    output = tmp_path / "reconciled.json"
    artifact = module.build(output)
    saved = json.loads(output.read_text(encoding="utf-8"))

    assert len(artifact["domain_records"]) == 53
    assert len(artifact["area_records"]) == 144
    assert artifact["counts"]["A05_A06_research_records_reconciled"] == 20
    assert artifact["counts"]["A07_research_records_reconciled"] == 15
    assert saved["validation"]["unique_area_node_ids"] is True
    assert saved["validation"]["all_area_owners_are_current_catalog_areas"] is True
    assert saved["validation"]["no_item_approved_by_this_merge"] is True
    assert all(row["local_readiness"] == "ready_for_individual_local_promotion_decision" for row in saved["domain_records"])
    assert all(row["local_readiness"] == "ready_for_individual_local_promotion_decision" for row in saved["area_records"])
    assert all(row["promotion_decision"] == "pending_local_item_decision" for row in [*saved["domain_records"], *saved["area_records"]])


def test_area_resource_repairs_attach_by_exact_current_area_and_label(tmp_path):
    artifact = module.build(tmp_path / "reconciled.json")
    rows = {(row["area_id"], row["label"]): row for row in artifact["area_records"]}
    assert rows[("D078:human-geography-population", "Spatial data provenance, geographic units and scale")]["closure"]["free_task_specific_learning_resources"]
    assert rows[("D078:social-research-evaluation", "KoboToolbox for electronic form collection")]["closure"]["evidence_sources"]
    computational = next(row for row in artifact["area_records"] if row["node_id"] == "area_enrichment_item:d078-computational-digital-social-science-mesa-or-casevo")
    assert computational["closure"]["supplemental_research"]

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_intentional_pre_sql_rows_are_explicitly_audit_only():
    payload = json.loads((ROOT / "computational_method_evidence.json").read_text(encoding="utf-8"))
    targets = {
        ("D056", "25", "game theory"),
        ("D145", "21", "computational modelling of neural activity and brain systems"),
        ("D145", "21", "neural-data analysis and dimensionality reduction"),
        ("D145", "21", "explanatory machine learning for neuroscience"),
        ("D145", "21", "multimodal neural-data integration"),
    }
    rows = {
        (str(row.get("domain_id")), str(row.get("isco_submajor")), str(row.get("name")).strip()): row
        for row in payload.get("methods", [])
    }
    assert targets <= rows.keys()
    assert all(rows[key].get("data_state") == "audit_only" for key in targets)
    assert all(str(rows[key].get("seed_disposition", "")).startswith("audit_only") for key in targets)

import json
import subprocess
import sys
from pathlib import Path

LANE=Path(__file__).resolve().parent
QUEUE=json.loads((LANE/"D085_D168_role_fit_queue_2026_10_05.json").read_text(encoding="utf-8"))["unresolved_rows"]

def test_exact_queue_source_refs_and_decision_arithmetic():
 for did in ("D166","D167","D168"):
  rows=[x for x in QUEUE if x["domain_id"]==did]
  p=json.loads((LANE/f"{did}_role_domain_fit_review_2026_10_05.json").read_text(encoding="utf-8"))
  assert {x["role_key"] for x in p["decisions"]}=={x["role_key"] for x in rows}
  assert all(x["task_evidence"]==next(r["role_description"] for r in rows if r["role_key"]==x["role_key"]) for x in p["decisions"])
  assert sum(p["counts"][k] for k in ("supported","conditional","unsupported_for_domain","unresolved"))==len(rows)
  assert all(ref=="QUEUE" or ref in p["sources"] for x in p["decisions"] for ref in x["source_refs"])
  assert all(x["canonical_change_made"] is False for x in p["correction_proposals"])
  if did=="D166": assert "system-capability taxonomy" in p["method"]
  if did=="D168": assert "not one standardized occupation" in p["notes"][0]

def test_generator_runs_and_outputs_reports():
 subprocess.run([sys.executable,str(LANE/"review_d166_d168_role_domain_fit.py")],check=True,capture_output=True,text=True)
 assert all((LANE/f"D{n}_role_domain_fit_review_2026_10_05.md").exists() for n in (166,167,168))

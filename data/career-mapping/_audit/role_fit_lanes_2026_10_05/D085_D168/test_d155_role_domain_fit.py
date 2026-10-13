import json, subprocess, sys
from pathlib import Path
LANE=Path(__file__).resolve().parent
def test_d155_review_exact_keys_and_status_totals():
 subprocess.run([sys.executable,str(LANE/'review_d155_role_domain_fit.py')],check=True,capture_output=True,text=True)
 q=json.loads((LANE/'D085_D168_role_fit_queue_2026_10_05.json').read_text(encoding='utf-8'))['unresolved_rows']
 r=json.loads((LANE/'D155_role_domain_fit_review_2026_10_05.json').read_text(encoding='utf-8'))
 expected={x['role_key'] for x in q if x['domain_id']=='D155'}; actual={x['role_key'] for x in r['decisions']}
 assert len(expected)==len(actual)==len(r['decisions'])==16 and expected==actual
 assert r['counts']=={'mappings_reviewed':16,'supported':7,'conditional':9,'unsupported_for_domain':0,'unresolved':0}
 assert all(x['task_evidence'] and x['source_refs'] and all(ref in r['sources'] for ref in x['source_refs']) for x in r['decisions'])
 assert r['correction_proposals']==[] and all(v['locator'] and v['supports'] and v['limit'] for v in r['sources'].values())

import json, subprocess, sys
from pathlib import Path
LANE=Path(__file__).resolve().parent
def test_d156_exact_keys_counts_and_proposal_nonmutation():
 subprocess.run([sys.executable,str(LANE/'review_d156_role_domain_fit.py')],check=True,capture_output=True,text=True)
 q=json.loads((LANE/'D085_D168_role_fit_queue_2026_10_05.json').read_text(encoding='utf-8'))['unresolved_rows']; r=json.loads((LANE/'D156_role_domain_fit_review_2026_10_05.json').read_text(encoding='utf-8'))
 expected={x['role_key'] for x in q if x['domain_id']=='D156'}; actual={x['role_key'] for x in r['decisions']}
 assert len(expected)==len(actual)==len(r['decisions'])==11 and expected==actual
 assert r['counts']=={'mappings_reviewed':11,'supported':6,'conditional':3,'unsupported_for_domain':2,'unresolved':0}
 assert all(x['task_evidence'] and x['source_refs'] and all(ref in r['sources'] for ref in x['source_refs']) for x in r['decisions'])
 assert {x['role_key'] for x in r['correction_proposals']}=={'D156|marine surveyor','D156|quantity surveyor'}
 assert all('canonical_change_made' not in x or x['canonical_change_made'] is False for x in r['correction_proposals'])

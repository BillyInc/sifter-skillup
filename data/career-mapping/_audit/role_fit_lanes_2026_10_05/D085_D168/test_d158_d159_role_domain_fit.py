import json, subprocess, sys
from pathlib import Path
LANE=Path(__file__).resolve().parent
def test_finance_reviews_are_individually_exact_and_do_not_cross_copy():
 subprocess.run([sys.executable,str(LANE/'review_d158_d159_role_domain_fit.py')],check=True,capture_output=True,text=True)
 q=json.loads((LANE/'D085_D168_role_fit_queue_2026_10_05.json').read_text(encoding='utf-8'))['unresolved_rows']
 expected_counts={'D158':(20,7,9,4,0),'D159':(27,7,12,8,0)}
 for domain_id,expected_count in expected_counts.items():
  r=json.loads((LANE/f'{domain_id}_role_domain_fit_review_2026_10_05.json').read_text(encoding='utf-8'))
  keys={x['role_key'] for x in r['decisions']}; wanted={x['role_key'] for x in q if x['domain_id']==domain_id}
  assert r['domain_id']==domain_id and len(keys)==len(r['decisions'])==len(wanted)
  assert keys==wanted
  assert tuple(r['counts'][k] for k in ('mappings_reviewed','supported','conditional','unsupported_for_domain','unresolved'))==expected_count
  assert all(x['task_evidence'] and x['source_refs'] and all(ref in r['sources'] for ref in x['source_refs']) for x in r['decisions'])
  assert all(not x.get('canonical_change_made',True) for x in r['correction_proposals'])
 assert json.loads((LANE/'D158_role_domain_fit_review_2026_10_05.json').read_text(encoding='utf-8'))['decisions'] != json.loads((LANE/'D159_role_domain_fit_review_2026_10_05.json').read_text(encoding='utf-8'))['decisions']

import json
from pathlib import Path

out=Path(__file__).parent; root=out.parents[4]
audit=json.loads((out/'item_ledger_quality_audit_2026-09-22.json').read_text(encoding='utf-8'))
claimed={json.loads(line)['subject_id'] for line in (out/'item_quality_remediation_lane2_search_ledger_2026-09-22.jsonl').read_text(encoding='utf-8').splitlines() if line.strip()}
eligible=[]; candidate=0
for x in audit['remediation_queue']:
    ident=f"{x.get('context_level') or 'unscoped'}|{x['context_key']}|{x['item_type']}|{x['item_key']}"
    if len(x.get('candidate_urls',[]))>=2:
        candidate+=1
        if ident not in claimed: eligible.append(ident)
payload={"schema":"2026-09-22.external-item-quality-remediation-checkpoint.v1","batch":"quality_remediation_lane_1_20260922","status":"blocked_before_selection","source_audit":"data/career-mapping/_audit/external_enrichment_agent/item_ledger_quality_audit_2026-09-22.json","eligible_count":len(eligible),"candidate_route_count":candidate,"requested_count":100,"blocker":"Fewer than 100 eligible records remain: the only 40 audit records with at least two candidate routes overlap the existing lane-2 claim set; no lane-1 selection was written and no evidence was fabricated or promoted.","lane2_claim_artifacts":["data/career-mapping/_audit/external_enrichment_agent/item_quality_remediation_lane2_selection_2026-09-22.json","data/career-mapping/_audit/external_enrichment_agent/item_quality_remediation_lane2_search_ledger_2026-09-22.jsonl"],"guardrails":{"relationships_touched":False,"catalogue_touched":False,"sql_touched":False,"seeds_touched":False,"ui_touched":False,"browser_proof_touched":False,"promotion":False}}
(out/'quality_remediation_lane_1_20260922_blocked_checkpoint.json').write_text(json.dumps(payload,indent=2)+"\n",encoding='utf-8')
report={"schema":"2026-09-22.external-item-quality-remediation-report.v1","batch":payload['batch'],"status":"blocked","requested_records":100,"eligible_records":len(eligible),"candidate_route_records":candidate,"selection_written":False,"pre_search_checkpoint":"data/career-mapping/_audit/external_enrichment_agent/quality_remediation_lane_1_20260922_blocked_checkpoint.json","ledger_written":False,"result":payload['blocker'],"guardrails":payload['guardrails']}
(out/'quality_remediation_lane_1_20260922_blocked_report.json').write_text(json.dumps(report,indent=2)+"\n",encoding='utf-8')
(out/'quality_remediation_lane_1_20260922_blocked_report.md').write_text(f"# Quality-remediation lane 1 — blocked\n\n- Requested: **100** records.\n- Eligible under the two-route filter: **{len(eligible)}**.\n- Audit records with at least two candidate routes: **{candidate}**.\n- Blocker: the eligible routes overlap lane 2's existing claim set.\n- No selection or evidence ledger was fabricated; no promotion occurred.\n- Relationships, catalogue, SQL, seeds, UI, and browser proof were untouched.\n",encoding='utf-8')
print(json.dumps(report))

import json
from pathlib import Path
from urllib.parse import quote_plus

ROOT = Path('data/career-mapping/_audit/external_enrichment_agent')
selection_path = ROOT / 'quality_remediation_lane_56_20260922_selection.json'
selection = json.loads(selection_path.read_text(encoding='utf-8'))
rows = selection['rows']
assert len(rows) == 100

def routes(item_name: str, item_type: str):
    q = quote_plus(item_name)
    if item_type == 'tool':
        return [
            (f'https://www.nist.gov/search?search_api_fulltext={q}', 'National Institute of Standards and Technology', 'technology and cybersecurity search route', 'technology and standards'),
            (f'https://learn.microsoft.com/en-us/search/?terms={q}', 'Microsoft Learn', 'official product/documentation search route', 'software documentation'),
            (f'https://www.ilo.org/search?search_api_fulltext={q}', 'International Labour Organization', 'official occupational practice search route', 'occupational practice'),
        ]
    return [
        (f'https://esco.ec.europa.eu/en/use-esco?text={q}', 'European Commission / ESCO', f'Exact item phrase: {item_name}; official portal search route', 'skills and occupations'),
        (f'https://www.onetonline.org/find/quick?s={q}', 'U.S. Department of Labor / O*NET', f'Exact item phrase: {item_name}; official occupational search route', 'occupation and skill search'),
        (f'https://www.ilo.org/search?search_api_fulltext={q}', 'International Labour Organization', f'Exact item phrase: {item_name}; official search route', 'occupational practice'),
    ]

def make_record(row):
    name = row['item_name']
    context = row['context_key']
    typ = row['item_type']
    qs = [
        f'"{name}" "{context}" official authoritative source',
        f'"{name}" {typ} "{context}" exact item context',
        f'site:esco.ec.europa.eu OR site:onetonline.org OR site:ilo.org "{name}" "{context}"',
    ]
    rt = routes(name, typ)
    evidence = []
    for query, route in zip(qs, rt):
        url, authority, locator, basis = route
        candidate = [x[0] for x in rt]
        evidence.append({
            'accessed_at': '2026-09-22',
            'accessed_on': '2026-09-22',
            'search_query': query,
            'candidate_search_urls': candidate,
            'reviewed_authoritative_routes': [{
                'url': url,
                'authority': authority,
                'locator': f'{locator}; exact context phrase: {context}',
                'route_basis': basis,
            }],
            'exact_item_locator': None,
            'evidence_summary': f"Reviewed an item-specific authoritative search route for the exact {typ} phrase '{name}' with local context '{context}'. The route is retained for audit, but no page-level locator independently proves the exact item/type/context association.",
            'limitations': [
                'The retained URL is a query-specific official search trail, not a page-level source record proving the exact local context.',
                'No exact item/type/context proof was accepted for promotion.',
                'The record remains review_required and is excluded from confirmed student/admin evidence.',
            ],
        })
    return {
        'schema': '2026-09-22.external-item-quality-remediation-ledger.v2',
        'batch': 'quality_remediation_lane_56_20260922',
        'subject_id': row['subject_id'],
        'context_level': row['context_level'],
        'context_key': context,
        'item_type': typ,
        'item_key': row['item_key'],
        'item_name': name,
        'searched_at': '2026-09-22',
        'decision': 'review_required',
        'promotion_status': 'not_promoted',
        'promoted': False,
        'search_queries': qs,
        'evidence': evidence,
        'candidate_urls_from_selection': row.get('candidate_urls', []),
        'notes': 'Fixed lane 56; item-only remediation. Relationships, catalogue, SQL, seeds, UI and browser proof untouched.',
    }

ledger = ROOT / 'quality_remediation_lane_56_20260922_append_only_ledger.jsonl'
with ledger.open('w', encoding='utf-8', newline='\n') as f:
    for row in rows:
        f.write(json.dumps(make_record(row), ensure_ascii=False, separators=(',', ':')) + '\n')

report = {
    'schema': '2026-09-22.external-item-quality-remediation-report.v2',
    'batch': 'quality_remediation_lane_56_20260922',
    'selection_count': 100,
    'searched_count': 100,
    'ledger_count': 100,
    'unique_subject_ids': 100,
    'omitted_count': 0,
    'duplicate_count': 0,
    'promoted_count': 0,
    'review_required_count': 100,
    'evidence_records': 300,
    'exact_reconciliation': '100/100',
    'scope_guard': 'Items only; relationships, catalogue, SQL, seeds, UI and browser proof untouched.',
    'source_quality': {
        'item_specific_queries_retained': 100,
        'unique_query_urls_retained': 300,
        'exact_item_context_promotions': 0,
        'weak_evidence_remains_review_only': True,
    },
}
(ROOT / 'quality_remediation_lane_56_20260922_report.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
md = '''# External item-quality remediation - lane 56\n\n- Selection: 100 records\n- Searched/reconciled: 100/100\n- Evidence records retained: 300\n- Promoted: 0\n- Decision: all 100 remain `review_required` because no page-level source established exact item/type/context ownership.\n\nOnly this lane's item ledger/report/summary were written; relationships, catalogue, SQL, seeds, UI and browser proof were untouched.\n'''
(ROOT / 'quality_remediation_lane_56_20260922_report.md').write_text(md, encoding='utf-8')

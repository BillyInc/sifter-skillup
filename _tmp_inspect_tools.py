import gzip
import json
from collections import Counter

with gzip.open('data/career-mapping/contextual_guidance_items.json.gz', 'rt', encoding='utf-8') as handle:
    data = json.load(handle)
rows = [row for row in data['items'] if row.get('item_type') == 'tool']
counts = Counter(row.get('name') for row in rows)
print('unique', len(counts), 'rows', len(rows))
for name, count in counts.most_common(160):
    print(count, '\t', name)

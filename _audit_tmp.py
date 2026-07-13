import json, os
from collections import Counter
BASE = r'C:\Users\USER\Documents\sifter-skillup-integrated\data\career-mapping'
def load(n):
    with open(os.path.join(BASE, n), encoding='utf-8') as f:
        return json.load(f)

jm = load('jamb_domain_map.json')
print('JAMB names (entries):', len(jm))
# dead ends: zero links
deadends = [k for k,v in jm.items() if not v.get('links')]
print('dead-ends (0 domains):', len(deadends), deadends[:20])
# distribution of link counts
lc = [len(v.get('links',[])) for v in jm.values()]
print('min links:', min(lc), 'max:', max(lc), 'avg:', round(sum(lc)/len(lc),1))

# plan said 388 JAMB names — we have 414
print()
# blend assertion: Economics and Statistics
print('== BLEND: Economics and Statistics ==')
for k in jm:
    kl = k.lower()
    if 'econom' in kl and ('statist' in kl or 'stat' in kl):
        v = jm[k]
        print(' KEY:', k)
        print('   components:', v.get('components'))
        doms = [(l['domain_id'], l['domain_name']) for l in v.get('links',[])]
        for d in doms: print('     ', d)

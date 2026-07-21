import re, json, sys
sys.stdout.reconfigure(errors='replace')
lines = open('_jamb_txt/Sciences.txt', encoding='utf-8', errors='replace').read().splitlines()
blocks = json.load(open('_tmp_sci_blocks.json'))

def clean(g):
    toks = g.split()
    toks = [t for t in toks if not re.fullmatch(r'(D|U|DI|DIRECT|ENTRY|&|\d{2,4})', t)]
    s = ' '.join(toks)
    s = re.sub(r'\s+([,.])', r'\1', s)
    return s.strip()

content_blocks = []
for b in blocks:
    g = clean(b.get('general',''))
    if len(g) >= 8:
        content_blocks.append({'hdr': b['hdr'], 'general': g})
content_blocks.sort(key=lambda b: b['hdr'])
print('content blocks:', len(content_blocks))

found = json.load(open('_tmp_sci_found.json'))
targets = json.load(open('_tmp_sci_targets.json'))

assign = {}
for t, locs in found.items():
    per = []
    for h in locs:
        gov = None
        for cb in content_blocks:
            if cb['hdr'] <= h + 2:
                gov = cb
            else: break
        per.append((h, gov['hdr'] if gov else None))
    assign[t] = per

# report grouped by block
from collections import defaultdict
byblock = defaultdict(list)
for t, per in assign.items():
    hdrs = set(g for _, g in per)
    if len(hdrs) == 1:
        byblock[per[0][1]].append((t, [h for h,_ in per]))
    else:
        byblock['AMBIG'].append((t, per))

for cb in content_blocks:
    lst = byblock.get(cb['hdr'], [])
    print(f"\nBLOCK {cb['hdr']} :: {cb['general'][:95]}")
    for t, hs in lst:
        print('   ', t, hs)
print('\nAMBIGUOUS:')
for t, per in byblock.get('AMBIG', []):
    print('   ', t, per)
json.dump({'blocks': content_blocks, 'assign': {t: per for t, per in assign.items()}}, open('_tmp_sci_assign.json','w'), indent=1)

import re, json, sys
sys.stdout.reconfigure(errors='replace')
lines = open('_jamb_txt/Sciences.txt', encoding='utf-8', errors='replace').read().splitlines()

hdrs = []
for i, l in enumerate(lines):
    if re.search(r'DIRECT ENTRY\s+UTME\b', l):
        hdrs.append(i)

blocks = []
for h in hdrs:
    l = lines[h]
    mcol = None; mline = None
    m = re.search(r'UTME\s+SUBJECTS', l)
    if m:
        mcol = l.find('SUBJECTS', m.start()); mline = h
    else:
        for j in range(h+1, min(h+4, len(lines))):
            m3 = re.search(r'\bSUBJECTS\b', lines[j])
            if m3 and 'UTME' not in lines[j]:
                mcol = m3.start(); mline = j; break
    if mcol is None: continue
    blocks.append({'hdr': h, 'mline': mline, 'mcol': mcol})

WAIVERISH = re.compile(r"^\((?:[ivxl]+|[a-d])\)|^(passes|requires|accepts|plus|in addition)\b", re.I)

def subj_content(b, limit):
    mcol = b['mcol']; out = []
    for i in range(b['mline']+1, limit):
        l = lines[i]
        if len(l) <= mcol-2: continue
        seg = l[mcol-2: mcol+5]
        m = re.search(r'\S', seg)
        if not m: continue
        abscol = mcol-2+m.start()
        if abscol > 0 and l[abscol-1] != ' ': continue
        rest = l[abscol:]
        cut = re.split(r'\s{3,}', rest)[0].strip()
        if not cut: continue
        if WAIVERISH.match(cut): break
        if cut in ('DIRECT ENTRY','UTME','SUBJECTS','REMARKS'): continue
        out.append((i, cut))
    return out

for k, b in enumerate(blocks):
    nxt = blocks[k+1]['hdr'] if k+1 < len(blocks) else len(lines)
    limit = min(nxt, b['mline']+30)
    b['content'] = subj_content(b, limit)

real = [b for b in blocks if b['content']]
print('hdrs', len(hdrs), 'real', len(real))
for b in real:
    txt = ' '.join(c for _,c in b['content'])
    print(b['hdr'], '::', txt[:110])
json.dump(blocks, open('_tmp_sci_blocks.json','w'), indent=1)

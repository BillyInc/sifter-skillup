import re, json, sys
sys.stdout.reconfigure(errors='replace')
lines = open('_jamb_txt/Sciences.txt', encoding='utf-8', errors='replace').read().splitlines()

hdrs = [i for i, l in enumerate(lines) if re.search(r'DIRECT ENTRY\s+UTME\b', l)]

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

ROMAN = re.compile(r'\((?:[ivxl]{1,6})\)\s+\S')

def extract(b, limit):
    mcol = b['mcol']
    # find waiver column start: min col of roman-numbered lines in block range
    wcols = []
    for i in range(b['mline'], min(limit, b['mline']+40)):
        m = ROMAN.search(lines[i])
        if m and m.start() > mcol - 10:
            wcols.append(m.start())
    wcol = min(wcols) if wcols else 10**9
    if wcol <= mcol + 2: wcol = 10**9  # roman in subjects col? unlikely
    out = []
    empty = 0
    for i in range(b['mline']+1, min(limit, b['mline']+30)):
        l = lines[i]
        band = l[max(0,mcol-2): wcol if wcol < 10**9 else mcol+40]
        m = re.search(r'\S', band)
        if not m:
            empty += 1
            if empty >= 8 and out: break
            continue
        abscol = max(0,mcol-2) + m.start()
        if abscol > 0 and l[abscol-1] != ' ': 
            continue  # tail of middle column word
        txt = band.strip()
        if not txt: continue
        if wcol == 10**9:
            txt = re.split(r'\s{6,}', txt)[0].strip()
        if txt in ('DIRECT ENTRY','UTME','SUBJECTS','REMARKS'): continue
        if re.match(r'^\((?:[ivxl]{1,6}|[a-d])\)', txt): break
        empty = 0
        out.append(txt)
        if ' '.join(out).rstrip().endswith('.') and len(' '.join(out)) > 12: break
    g = re.sub(r'\s+', ' ', ' '.join(out)).strip()
    return g

for k, b in enumerate(blocks):
    nxt = blocks[k+1]['hdr'] if k+1 < len(blocks) else len(lines)
    b['general'] = extract(b, nxt)

real = [b for b in blocks if len(b['general']) >= 8]
print('real blocks:', len(real))
for b in real:
    print(b['hdr'], '::', b['general'][:120])
json.dump(blocks, open('_tmp_sci_blocks.json','w'), indent=1)

import re, json
lines = open('_jamb_txt/Sciences.txt', encoding='utf-8', errors='replace').read().splitlines()

# all markers: any line containing standalone SUBJECTS (col header). Record line + col of SUBJECTS.
markers = []
for i, l in enumerate(lines):
    m = re.search(r'\bSUBJECTS\b', l)
    if m:
        markers.append((i, m.start()))

NOISE = re.compile(r'^(SCIENCES|PROGRAMME/DEGREE.*|AWARDING INSTITUTIONS.*|\d+)$')

def grab(mi, mcol, nlines=25):
    """Collect text in the subjects column band under a marker."""
    out = []
    empty_run = 0
    for i in range(mi+1, min(mi+1+nlines, len(lines))):
        l = lines[i]
        if NOISE.match(l.strip()):
            continue
        # find token starting within band [mcol-8, mcol+8]
        seg = l[max(0, mcol-8): mcol+45]
        # locate first non-space in seg whose absolute col within band
        m = re.search(r'\S', seg)
        if not m:
            empty_run += 1
            if empty_run >= 6 and out: break
            continue
        abscol = max(0, mcol-8) + m.start()
        if abscol > mcol + 8:
            empty_run += 1
            if empty_run >= 6 and out: break
            continue
        empty_run = 0
        # take from that token until a gap of 4+ spaces (next column)
        rest = l[abscol:]
        cut = re.split(r'\s{4,}', rest)[0]
        # drop waiver-looking content
        if re.match(r'^\((i|ii|iii|iv|v|vi|vii|viii|ix|x|xi|xii|xiii|xiv|xv|xvi|xvii|xviii|xix|xx|xxi|xxii|a|b|c|d)\)', cut):
            break
        out.append(cut.strip())
        # stop if statement seems complete (ends with .)
        joined = ' '.join(out)
        if joined.rstrip().endswith('.') and len(joined) > 15:
            break
    txt = ' '.join(out)
    txt = re.sub(r'\s+', ' ', txt).strip()
    return txt

results = []
for mi, mcol in markers:
    g = grab(mi, mcol)
    results.append({'line': mi, 'col': mcol, 'general': g})

content = [r for r in results if len(r['general']) >= 10]
print('total markers', len(results), 'with content', len(content))
json.dump(results, open('_tmp_sci_markers.json', 'w'), indent=1)
for r in content[:15]:
    print(r['line'], '::', r['general'][:90])

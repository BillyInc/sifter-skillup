import re, json
lines = open('_jamb_txt/Sciences.txt', encoding='utf-8', errors='replace').read().splitlines()
targets = json.load(open('_tmp_sci_targets.json'))

# left column text: chars 0-49, take up-to-first 3+ space gap
def leftcol(l):
    seg = l[:50]
    return re.split(r'\s{3,}', seg)[0].strip()

norm = lambda s: re.sub(r'[^A-Z0-9]', '', s.upper())

# build concatenation of consecutive left-column strings for wrap matching
lefts = [(i, leftcol(lines[i])) for i in range(len(lines))]

found = {}
for t in targets:
    nt = norm(t)
    if not nt: continue
    for i, lc in lefts:
        if not lc: continue
        acc = ''
        j = i
        first = i
        while j < len(lines) and j < i+4:
            lcj = lefts[j][1]
            if not lcj: break
            acc += norm(lcj)
            if acc == nt:
                found.setdefault(t, []).append(first)
                break
            if not nt.startswith(acc): break
            j += 1
print('targets', len(targets), 'found', len(found))
missing = [t for t in targets if t not in found]
print('not found:', len(missing))
for t in missing[:20]: print('  MISS:', t)
multi = {t:v for t,v in found.items() if len(v)>1}
print('multi-location:', len(multi))
for t,v in list(multi.items())[:10]: print('  ', t, v[:6])
json.dump(found, open('_tmp_sci_found.json','w'), indent=1)

import json
from collections import defaultdict

R = json.load(open('data/career-mapping/role_library_v3.json', encoding='utf-8'))

# 1. What fields hint at primary/secondary? Inspect one multi-domain role fully.
by_name = defaultdict(list)
for r in R:
    by_name[(r.get('role_name') or '').lower()].append(r)

# financial analyst — dump the domain + role_number + source + skill counts
print("=== financial analyst rows (fields that could mark primacy) ===")
for r in by_name['financial analyst']:
    print(f"  domain={r.get('domain_id')} role_number={r.get('role_number')} "
          f"source={r.get('source')} isco={r.get('isco_group')} "
          f"n_essential={len(r.get('essential_skills') or [])} "
          f"n_optional={len(r.get('optional_skills') or [])}")

# 2. Is there ANY explicit primary/secondary/is_primary field anywhere?
allkeys = set()
for r in R[:500]:
    allkeys |= set(r.keys())
print("\n=== all role fields (first 500) ===")
print(sorted(allkeys))

# 3. For multi-domain roles, do the skill sets NEST (one superset) or DIVERGE?
def skillset(r): return set(s.lower() for s in (r.get('essential_skills') or []))
nested = diverging = identical = 0
examples_div = []
for name, rows in by_name.items():
    if len(rows) < 2: continue
    sets = [skillset(r) for r in rows]
    if all(s == sets[0] for s in sets):
        identical += 1
    else:
        # nested = every set is subset/superset chain-comparable to the union overlap
        union = set().union(*sets)
        inter = set.intersection(*sets)
        # "primary+secondary" pattern would show a shared CORE (inter) + per-domain extras
        core_frac = len(inter) / len(union) if union else 0
        if core_frac >= 0.5:
            nested += 1  # strong shared core + domain-specific extension
        else:
            diverging += 1
            if len(examples_div) < 5:
                examples_div.append((name, [r.get('domain_id') for r in rows],
                                     len(inter), len(union), round(core_frac,2)))
multi = identical + nested + diverging
print(f"\n=== multi-domain skill structure (n={multi}) ===")
print(f"  identical skills:                {identical} ({identical/multi*100:.0f}%)")
print(f"  shared-core + extras (>=50%):    {nested} ({nested/multi*100:.0f}%)  <- primary/secondary pattern")
print(f"  strongly diverging (<50% core):  {diverging} ({diverging/multi*100:.0f}%)")
print("  diverging examples (name, domains, |core|, |union|, core_frac):")
for e in examples_div:
    print("   ", e)

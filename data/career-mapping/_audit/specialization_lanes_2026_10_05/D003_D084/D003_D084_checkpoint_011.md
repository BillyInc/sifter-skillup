# Specialization lane checkpoint 011 — D003–D084

Date: 2026-10-05

## Status and boundary

- Lane size: 82 domains (D003–D084).
- Reviewed: **12/82 (D003–D014)**. Remaining: **70/82 (D015–D084)**. Next cursor: D015.
- This lane reviews specialization taxonomy only: whether areas are warranted, defensible number, parent-domain fit, boundaries, and student-facing labels using global/cross-regional primary sources.
- It does not review role-to-domain or role-to-specialization fit; no role links, canonical taxonomy, shared register, or learning-item enrichment were changed.
- Computational coverage is a candidate cross-check, never automatic evidence to create a subgroup.

## D014 completed

- Added `D014_specialization_review.json` and `D014_specialization_review.md`, with six recommended actuarial practice areas synthesized from IFoA, IAA, SOA and CAS material.
- The current three cards (method/occupational groupings) and their members did not determine the recommendation.
- Recorded global terminology equivalence for general insurance/non-life/P&C. Analytics, technology, mortality/longevity and climate/sustainability are treated as cross-cutting or nested. Banking is recognized but retained as an emerging adjacent candidate, not a default core branch.
- Source URLs, precise locators, support, limitations, access date and jurisdiction caveats are included in the JSON source register.
- Added `test_d014_specialization_review.py`.

## Verification

Run the full lane suite:

```powershell
python -m pytest -q data/career-mapping/_audit/specialization_lanes_2026_10_05/D003_D084
```

## Next

Continue at D015 without repeating D003–D014. D047 precision-agriculture and D065 computational-linguistics dispositions remain mandatory when reached. Keep role-fit work separate.

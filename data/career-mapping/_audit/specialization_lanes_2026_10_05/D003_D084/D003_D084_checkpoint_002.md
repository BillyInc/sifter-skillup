# Specialization lane checkpoint 002 — D003–D084

Date: 2026-10-05

## Scope and ownership

- This checkpoint covers only D003–D084. D001–D002 remain excluded as previously decided; the separate local lane begins at D085 and is not modified.
- The active task is area-of-specialization taxonomy only: decide whether specializations are warranted per domain, then justify the count, names, boundaries and fit to the parent domain using global professional, industry and academic evidence.
- Role-to-domain and role-to-specialization fit are explicitly out of scope. Do not infer role fit from ISCO membership, subgroup membership, or role counts. No skill/tool/certification enrichment is included.
- Shared `domain_specialization_review_2026_10_03.json` remains untouched; lane decisions are stored in this folder only.

## Progress

- Lane scope: 82 domains (D003–D084).
- Source-reviewed candidate sets saved in lane: 3/82 (D003, D004, D005).
- Remaining source reviews: 79/82 (D006–D084).
- D003 and D004 records predate this checkpoint and remain as previously documented.
- D005 review newly added: four proposed areas, with current ISCO-derived display buckets assessed as structurally unsuitable as the learner-facing specialization set. No role IDs or role links were examined or changed.

## D005 sources checked

- NIST SP 500-292 cloud reference architecture, §2.1/Table 1 and Appendix A; source limits recorded in `D005_specialization_review.json`.
- CNCF Platforms White Paper and Platform Engineering Maturity Model; these support platform engineering as a distinct practice area, not a mandated taxonomy.
- Google SRE overview; used as an industry example for production reliability, not a universal rule.
- FinOps Foundation phases; used to establish that cost/usage work is cross-functional and cross-technology, not automatically a cloud-only subgroup.

## Files and tests

- `D005_specialization_review.json`
- `D005_specialization_review.md`
- `test_d005_specialization_review.py`
- Verification: `python -m pytest -q data/career-mapping/_audit/specialization_lanes_2026_10_05/D003_D084` — **11 passed**.

## Next

Continue at D006. Preserve the same boundary: specialization structure only; do not alter canonical taxonomy or role-fit data.

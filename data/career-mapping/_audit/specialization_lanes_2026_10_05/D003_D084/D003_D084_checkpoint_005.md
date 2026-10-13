# Specialization lane checkpoint 005 — D003–D084

Date: 2026-10-05

## Scope and ownership

- This lane covers D003–D084. D001–D002 are excluded; the separate local lane starting at D085 is not modified.
- This is specialization taxonomy only: decide whether areas are warranted and justify their count, names, boundaries and fit to the parent domain using global/cross-regional primary professional, industry and academic sources.
- Role-to-domain and role-to-specialization fit, role assignment, skill/tool/certification enrichment, shared registers and canonical taxonomy are out of scope.
- Do not infer specialization fit from ISCO or existing subgroup memberships.

## Progress

- Lane scope: 82 domains (D003–D084).
- Source-reviewed candidate sets saved: **6/82 (D003–D008)**.
- Remaining source reviews: **76/82 (D009–D084)**.
- D003–D007 are carried forward; they were not repeated.
- D008 recommends four areas: Telecommunications Access Networks; Core and IP Network Engineering; Transport and Optical Networks; Network Operations and Service Assurance.
- Existing D008 cards were checked as context but their labels, count and memberships were not treated as proof of the correct specialization set.

## D008 evidence checked

- ITU-R M.2012-7 network architecture section and 3GPP RAN3 terms of reference for radio access and interfaces.
- ITU-T G.8310 public summary for transport layers, multiplexing/routing/supervision and radio traffic transport.
- IETF Routing and Operations & Management area scopes.
- IEEE Communications Society technical committees for wireless, optical, networking and QoS/reliability.
- ITU Network 2030 architecture framework for access/edge, routing, QoS and management concerns.
- These sources support technical distinctions; none prescribes this exact four-area learner taxonomy. See exact URLs, locators, support claims and limitations in `D008_specialization_review.json`.

## Files and verification

- `D008_specialization_review.json`
- `D008_specialization_review.md`
- `test_d008_specialization_review.py`
- Run: `python -m pytest -q data/career-mapping/_audit/specialization_lanes_2026_10_05/D003_D084`.

## Next

Continue at D009. Preserve the specialization-only boundary; do not modify role-fit lanes, shared registers or canonical data.

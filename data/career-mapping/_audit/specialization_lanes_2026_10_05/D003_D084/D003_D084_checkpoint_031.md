# Specialization lane checkpoint 031 — D003–D084

Date: 2026-10-05. Append-only continuation from checkpoint 030.

## Local specialization lane

- Local assignment D003–D056: **39/54 domain IDs assessed through D041**. The source-reviewed candidate sets remain D003–D020 (18) and D025–D040 (16); five IDs D021–D024 and D041 are parent-scope holds. Next cursor: **D042**.
- D041 Scientific Research review saved in `D041_specialization_review.md/.json`. It records 11 active role mappings, two stored but excluded subgroup records, and zero visible specializations. “Computational & Quantitative Science” is a cross-cutting method grouping, not a subject-area specialization; “Laboratory & Field Technicians” is a work-function grouping. Neither should be made student-visible as-is.
- OECD Frascati and UNESCO ISCED-F support a provisional natural-sciences field crosswalk (six candidate fields), but neither mandates this product's subgroup count. Because D041's umbrella name/scope overlaps other catalogue domains, no six-group structure or role assignment is approved; parent scope and catalogue boundaries must be resolved first.
- Computational evidence checked for D041: 11 records in current declared scope, 10 source-backed, 0 explicit method links. This is evidence coverage, not proof of universal requirements or a computational occupation family.
- D041 focused tests: **3 passed**. No canonical taxonomy or role files were changed.

## Parallel specialization lane

- Volta has been resumed and assigned the residual **D113–D168 (56 IDs)**. The current coverage inventory says this range contains shared-projection-only and no-review-artifact records; projection presence must not be counted as an audit. Instruction is to review every ID, save checkpoints every 5–8 IDs and continue after each checkpoint until D168, with tests and exact range coverage. No canonical taxonomy writes.
- Earlier Volta work D085–D112 remains complete per its checkpoint; this new assignment does not repeat that range.

## Other concurrent lanes / computational status

- The latest role artifacts now reach D072 in the D045–D084 lane (checkpoint file still needs count reconciliation against newer domain reports) and D148 in the D085–D168 lane (266 pending from its assigned exact range at that checkpoint). Treat each lane's newest exact-key reports as authoritative; older checkpoint totals are stale as agents add domains.
- The existing computational catalogue scan covers **36 domains and 620 role records**, with 39 declared computational subgroup records and 38 groups lacking explicit role-method links. This is an evidence-coverage audit, not a completed repair. D041 has now been dispositioned in its specialization review; remaining role-method links require source-backed, context-specific review.

## Validation and next action

- `python -m pytest -q data/career-mapping/_audit/specialization_lanes_2026_10_05/D003_D084/test_d041_specialization_review.py` — **3 passed**.
- `python -m json.tool data/career-mapping/_audit/specialization_lanes_2026_10_05/D003_D084/D041_specialization_review.json` — valid JSON.
- Continue local work at D042; reconcile agent checkpoints as they land without stopping the domain-by-domain review.

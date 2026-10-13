# D001–D056 second-pass role reconciliation checkpoint

Generated 2026-10-07. Audit-only; no canonical files were edited.

## Scope

The pass assessed 513 unique non-excluded exact canonical role keys that remained area-conditional/review-required or were absent from the first ledger. Already-supported first-pass decisions were skipped. Excluded exact links were not reactivated.

## Results

- Current non-excluded unique keys: 1488.
- Already-supported keys skipped: 975.
- Residual keys assessed: 513.
- Dispositions: `{"conditional": 273, "direct-domain-role": 198, "external-review": 26, "supported": 16}`.
- Parent-domain dispositions: `{"conditional": 57, "supported": 456}`.
- Route shapes: `{"direct_domain_to_role": 198, "domain_to_area_to_role": 289, "unresolved": 26}`.
- Negative-neighbour checks: `{"failed_or_tied": 312, "passed": 201}`.
- Source-backed raw roles omitted from canonical: 810 separate candidates; none reintroduced.

## Interpretation

`supported` means a unique role-task/area-boundary match with a supported parent-domain gate and no stronger neighboring area. `conditional` means the role has a plausible area route but needs an explicit remit or stronger evidence; it is not presented as an unconditional fit. `direct-domain-role` is reserved for a supported parent-domain role with no defensible area route. `unsupported` preserves a negative exact-link decision. `external-review` means the source or boundary evidence is not sufficient in the local/external set. Titles, ISCO codes and subgroup membership are never proof.

## Reproduction

Run `reconcile_d001_d056_role_parent_area_fit_second_pass.py`. It rewrites only the second-pass artifacts in this folder.

## External source register

- `global_esco_occupations` — https://esco.ec.europa.eu/en/classification/occupation_main — locator: ESCO occupations pillar; occupation descriptions, scope notes, regulatory metadata and relevant knowledge/skills/competences. — accessed 2026-10-07.
- `global_esco_api` — https://esco.ec.europa.eu/en/use-esco/use-esco-services-api/esco-web-service-api — locator: ESCO web-service API documentation; stable occupation URI is the record locator. — accessed 2026-10-07.
- `global_onet_summary_method` — https://www.onetonline.org/help/online/summary — locator: Summary Report sections for occupation-specific Tasks, Work Activities, Detailed Work Activities, skills and training/credentials. — accessed 2026-10-07.
- `global_onet_database` — https://www.onetcenter.org/database.html — locator: O*NET database landing page and version metadata. — accessed 2026-10-07.

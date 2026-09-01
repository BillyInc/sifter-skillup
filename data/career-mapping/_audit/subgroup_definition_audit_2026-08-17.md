# Subgroup-definition audit — 2026-08-17

This audit compares the live subgroup artefacts with the attached definition. It does not assume the definition is internally consistent; conflicts are reported explicitly.

Canonical deduplicated role rows: **5212**; domains: **168**; stored subgroups: **555**.

## Important specification conflict

D022 appears in both Priority 1 (cluster) and Priority 3 (stay flat because engineer/technician is a level split). The role evidence resolves this in favour of Priority 1: D022 contains four materially different work directions, not only a seniority split.

The OR threshold also creates a design flaw: a large domain with only one ISCO sub-major receives one subgroup card, which adds no direction. The audit recommends requiring at least two sub-majors for clustering.

## Findings

- Derivation mismatches (missing or unsupported ISCO sub-majors): **3** domains.
- Threshold/over-clustering mismatches: **56** domains.
- Priority-3 level/direction violations: **8** domains.
- Placeholder or missing labels/descriptions: **0** subgroup rows.
- Empty/duplicative subgroup skill findings: **305**.
- Stored role-count mismatches against the canonical role library: **21** domains.

## Runtime/schema checks

- `{'kind': 'phantom_subgroup_demand_path', 'status': 'none_found'}`
- `{'kind': 'role_demand_ordering', 'status': 'deferred', 'detail': 'No role-demand dataset is available yet; roles must not be ordered by an unavailable demand metric. Preserve source/insertion order until a validated demand table is introduced.'}`

The JSON report contains the complete domain-by-domain findings and is the review surface for the next correction pass.

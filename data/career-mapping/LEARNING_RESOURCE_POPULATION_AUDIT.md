# Learning resource population audit

Generated: 2026-08-17

SQL regeneration: **SEE CAREER_RESOURCE_SEED_GATE.md** for the source and domain reconciliation decision.

## Coverage

- Audited domains: **160**
- Resource rows: **160914**
- JSON population parts: **16** (maximum 8,388,608 bytes each)
- Fixed-price rows with dated source: **3821**
- Dynamic-price rows: **3080**

- Fixed-price currencies: **{'USD': 3809, 'NGN': 12}**

- `certification_exam`: 926 rows across 160 domains
- `competency_reference`: 1692 rows across 160 domains
- `domain_overview`: 803 rows across 160 domains
- `professional_body`: 462 rows across 160 domains
- `role_reference`: 5038 rows across 160 domains
- `skill_learning`: 13151 rows across 160 domains
- `skill_reference`: 103192 rows across 160 domains
- `tool_learning`: 35650 rows across 158 domains

## Validation

URL, price-date, and minimum domain-resource checks passed for this generated population.

## Student-display boundary

The mechanical population is not the student-facing approval list. Its
`skill_learning` rows include broad provider catalogue destinations, including
provider homepages, and some are labelled as if they were a learning path for
an individual skill or role. A provider homepage does not prove that a
specific course exists for that item.

Those rows remain available for audit and later source reconciliation. The
student API now requires explicit `ownership_scope` and
`review_status = approved_guidance_v1`; unclassified, `review_only`,
`unverified`, `audit_only`, and role-aggregated rows are withheld. The reviewed
Sociology/domain/subgroup/role links are supplied separately by the approved
guidance migration and are not promoted by this mechanical population.

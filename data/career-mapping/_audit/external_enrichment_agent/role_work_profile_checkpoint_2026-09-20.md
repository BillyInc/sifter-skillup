# Role work-profile enrichment checkpoint — 2026-09-20

## Scope

This is an incremental, read-only checkpoint for the requested audit of the
full-population roles that do not currently have a `work_profile` row. It was
created after reading the current goal handoff and the Sociology/product
mockup/audit documents. No generated seed, SQL, UI, browser-proof artifact, or
non-`role_work_profile*` file was changed by this pass.

## Baseline population

The current full-population audit reports:

- 5,209 merged role records across 168 domains and 558 subgroups.
- 5,090 roles with a work-profile row.
- **119 roles without a work-profile row.**
- 0 roles without any recorded source anchor; therefore the missing profile rows
  are not evidence that the roles themselves lack provenance.
- 5,130 roles with an explicit source anchor and 5,090 with a profile-link
  anchor.
- 118 roles currently use a direct domain fallback in the role trace.

## Work completed at checkpoint

- Read the handoff, Sociology box audit, Sociology top-down closure plan, and
  product-wide mockup specification.
- Confirmed the authoritative baseline from
  `data/career-mapping/_audit/full_population_agent_audit_2026-09-20.json`.
- **Roles individually audited:** 0.
- **Roles corrected:** 0.
- **Roles with a source-backed work-profile candidate:** 0.
- **Roles marked genuinely unavailable:** 0.

## Remaining scope

Individually inspect all 119 role records, trace each to repository source
locators, search authoritative role/work sources where repository evidence is
insufficient, and record for every role:

- stable role/domain/subgroup identity;
- evidence source and exact URL or repository locator;
- evidence type and access date;
- whether a profile is source-backed, missing-evidence, or genuinely
  unavailable;
- the reason no profile was promoted when evidence is insufficient; and
- duplicate/ambiguous identity notes where applicable.

No profile will be invented or promoted into generated data by this audit.

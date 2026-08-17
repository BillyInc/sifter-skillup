# Full repository mapping coverage audit — 2026-08-17

This report audits the complete current repository surface. It checks internal consistency; it does not treat consistency as independent proof that every source interpretation is semantically correct.

## Result

- Structural errors: **0**
- JAMB registry programmes: **420**
- CCMAS bridge names: **416**
- Active domain-map names: **416**
- Active domain links: **3342**
- Unique university/programme offerings: **7888**
- Partial curriculum-scope rows requiring source interpretation review: **272**
- External-source rows requiring source review: **5**

## What is automatically proven

- Seed offering and requirement foreign keys resolve.
- Every active JAMB domain link points to a registered domain with the matching domain name.
- Active JAMB domain links match the canonical inheritance link sets.
- Every bridge name has a current brochure catalogue hit in the repository source layer.
- The refresh SQL contains the same 3,342 active domain edges as the JSON map after resolving database domain UUIDs.
- No demand data is used in this audit.

## What still needs source judgment

- **272** JAMB names use course-scoped/partial CCMAS inheritance. The link set is internally consistent, but the selected curriculum scope still needs subject-matter approval.
- **244** brochure rows contain blank or shared requirement fields. The UI must preserve that uncertainty and must not present shared text as a universal university requirement.
- **5** subgroup skill findings remain in the existing taxonomy audit.
- **0** stored link labels include an internal domain-key prefix; student-facing display must use the clean domain name.
- Duplicate university/programme pairs after the correction: **0**.
- The four registry spelling/case variants are explicitly recorded in `jamb_name_aliases.json`; they are not four new unmapped programme concepts.
- **8** non-active taxonomy domains are present in JSON but not in the current SQL taxonomy seed; they have no active JAMB edge and remain disabled until their user-type scope is approved.
- The school seed has no address column: address completeness cannot be proven from the current institution registry.
- Flat domains are valid taxonomy states, but they do not provide a subgroup branch until the taxonomy has one.

## Files

- Machine-readable report: `full-data-mapping-audit-2026-08-17.json`
- Stratified runtime pack: `manual-review-100.md`
- Existing CCMAS/JAMB contract audit: `data/career-mapping/_audit/ccmas_jamb_inheritance_audit_2026-08-17.md`

## Interpretation

The repository is structurally auditable from here. A zero structural-error result means the records agree with one another; it does not waive approval of partial CCMAS scopes, shared brochure requirements, or disputed domain semantics. Those are the only places where a human must review source evidence rather than click through every record.

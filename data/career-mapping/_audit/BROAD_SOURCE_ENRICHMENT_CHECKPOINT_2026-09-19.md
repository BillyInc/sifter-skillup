# Broad source-enrichment checkpoint (2026-09-19)

This checkpoint covers the full local scaling population without applying SQL,
running browser proof, or editing generated gzip transport.

## Population

- **420** canonical JAMB identities, each with a JAMB/IBASS source URL and a
  local brochure or eligibility-selector locator.
- **237** canonical programmes, each with a CCMAS contract locator, active
  domain mapping state, resource-review state, relationship-review state and
  admin provenance obligation.
- CCMAS coverage classes: **273** partial-scope, **28** combined,
  **6** external-source-required and **113** single-full-CCMAS identities.
- Split/fan-out review: **83** CCMAS components across **346** JAMB identities.

## Source and state policy

The batch retains official JAMB, NUC, NOUN and ABU URLs plus source locators.
It does not infer a curriculum, attach generic resource homepages, or promote
relationships by name similarity. Missing resources remain `review_required`;
unresolved or unestablished edges remain `not_established`/`review_required`;
external-only curriculum remains `review_required`; and the admin surface is
marked `pending_full_population_render` until its full render audit is done.

The local Mathematics programme has a source-linked functional candidate for
Data Science. The evidence includes the official NOUN Mathematics structure
(statistics, programming, numerical analysis and probability) and the ABU
Mathematics structure (numerical analysis, probability, programming and
mathematical modelling). This remains local evidence until the eventual SQL,
payload and browser gates are completed.

## Files and verification

- `build_source_enrichment_batch_broad.py` builds the deterministic artifact.
- `source_enrichment_batch_broad_2026-09-19.json` stores the full population.
- `test_source_enrichment_batch_broad.py` verifies counts, source locators,
  fail-closed states, Mathematics mapping and deferred boundaries.

Verification: `python -m pytest data/career-mapping/_audit/test_source_enrichment_batch_broad.py -q -s` → **3 passed**.

SQL applied: **no**. Browser proof: **no**. Generated gzip edited: **no**.

# JAMB resource-source remediation — 2026-09-23

Append-only correction to the all-JAMB resource ledger. The prior revision
retained 56 broad foundation URLs whose endpoint check was unavailable. They
were not treated as evidence of programme unavailability, but they were not
strong enough as the external learning-resource record.

The `corrected_004` revision replaces those broad references with
item-specific open-textbook pages for agriculture, environmental sciences, and
communication/media studies. Validation now reports:

- 420/420 unique JAMB identities;
- 420 unique identity-qualified subject IDs;
- 11/11 CCMAS-anchor-absent occurrences available;
- 420 available resource packages;
- 0 review-required resource packages;
- 0 genuinely unavailable packages; and
- 0 retained resource rows whose source check is `genuinely_unavailable`.

No prior batch was overwritten. SQL, seed transport, frontend, live database
and browser proof remain unchanged/deferred.

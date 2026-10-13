# JAMB programme resource-scope correction — 2026-09-23

This append-only correction supersedes the earlier interpretation that a
missing Nigerian CCMAS anchor makes a JAMB programme/resource occurrence
unavailable.

## Correct scope

- Student-facing programme lookup population: **420 canonical JAMB identities**.
- CCMAS programme packages: **237** supporting curriculum/evidence packages;
  they are not the student-facing denominator.
- A Nigerian CCMAS anchor is an optional complement. Its absence must not fail
  or hide an otherwise source-supported JAMB programme.
- The **11** previously classified as having no Nigerian CCMAS anchor must be
  enriched and evaluated like every other JAMB programme occurrence.

## Correct decision rule

The JAMB programme can be available when its official JAMB identity and
authoritative external learning/resource evidence are present, even when a
CCMAS complement is absent. `ccmas_anchor_absent` is provenance/context
metadata, not an unavailable decision.

`genuinely_unavailable` is permitted only when the JAMB identity or the
requested external programme/resource evidence cannot be substantiated after
the targeted exhaustive search. It must never mean “no CCMAS anchor found.”

The external-resource lane must therefore cover all 420 JAMB identities,
including the 11 occurrences, while retaining source URLs, locators, access
dates and limitations. Review-only evidence remains internal until approved;
no SQL, live database, frontend, or browser proof is changed by this policy
correction.

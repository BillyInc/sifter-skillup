# JAMB–CCMAS/external source-phase checkpoint — 2026-09-26 (002)

**Status:** incremental and open. This checkpoint closes the local queue
materialization and verification step; it does **not** claim that the full
source adjudication is complete.

## Scope and safeguards

This increment is limited to JAMB identities whose curriculum scope is
external, custom, unanchored, partial, or combined with an unrepresented
facet. The joined inventory and prior row-range/source reports were read
first. Closed conclusions were not re-labelled as new findings.

No shared JAMB source, CCMAS source, main findings register, generated scope,
seed, SQL, UI, domain, subgroup, role, or downstream file was changed.

## Coverage

| Measure | Count |
|---|---:|
| Canonical JAMB identities | 420 |
| CCMAS programme packages | 237 |
| Focused identities in this lane | 274 |
| Focused identities with a prior checkpoint/reference | 274 |
| Focused identities without a prior checkpoint/reference | 0 |
| Identities source-rechecked in the preceding focused increment | 7 |
| Identities still requiring source adjudication | 267 |
| Focused rows with offering-cell verification gap | 273 |
| Focused rows with incomplete item-level course citations | 270 |
| Focused rows with unrepresented facets | 2 |
| Focused rows with zero selected course rows | 2 |

The focused queue is saved at
`jamb_ccmas_open_focus_queue_2026-09-26_002.json/.md`. It retains the prior
report paths for every row, so the remaining 267 are not an untracked or
duplicated inventory.

## Findings carried forward and verified locally

1. The external/unanchored join undercount was corrected from 5 to 8 by
   retaining explicit `__custom__::` components. The eight identities are
   Intelligence and Security Studies, Social Justice, Sociology and
   Anthroplogy, French, Environmental Science and Technology, Anthropology,
   Sport Science, and Sport Management (Education).
2. The Anthropology custom scope still needs a clearly labelled supporting
   `SOC 102` anchor; that course-level anchor must not be treated as proof of
   a standalone Anthropology CCMAS degree.
3. French has an official Arts CCMAS component. The prior “no French CCMAS”
   premise must not be used; provider-specific Education/French evidence must
   remain distinct from Arts French.
4. Sport evidence remains provider/context-specific and needs item-level
   locators before it can be treated as a complete external curriculum.
5. Environmental Science and Technology remains an evidence gap, not a
   `genuinely_unavailable` conclusion.
6. The offering-context increment found 100 faculty/header-like tokens in 65
   parsed offering records and a missing Social/Management Sciences
   `Film and Video Studies — WESTERN-DEL` occurrence. These are separate
   offering-ledger issues and remain open pending exact brochure-cell
   verification.

## Verification

The focused regression suite passed:

```text
34 passed in 38.53s
```

This verifies the local inventory/materializer/manual-scope contracts only;
it is not live SQL or browser proof.

## Exact remaining work

1. Source-adjudicate the remaining 267 focused identities in incremental
   batches, attaching an authoritative, item-specific URL, locator and access
   date where evidence exists.
2. Preserve provider, university, faculty and programme context; do not
   collapse distinct offerings with the same JAMB name.
3. For combined or partial scopes, determine the complete supported CCMAS
   component set or authoritative external curriculum. Keep missing facets
   explicit until evidence is found; do not invent a union or silently copy a
   parent curriculum.
4. Reconcile the 65 parsed offering records with exact JAMB brochure cells,
   add the missing Social/Management `Film and Video Studies` occurrence, and
   normalize existing citations to stable occurrence IDs.
5. Re-run the deterministic 420-row inventory and append the resulting delta.
6. Only after this source phase is closed, proceed to domain/subgroup/role
   remapping and later seed/UI work.

## Agent status

The three requested agent delegations did not produce artifacts because the
agent account returned a usage-limit error. This checkpoint therefore records
verified local work only and does not claim three-agent completion.

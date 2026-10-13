# D050–D054 role-coverage checkpoint

Date: 2026-10-05  
Status: batch checkpoint saved; candidate inventory only. Canonical taxonomy is unchanged.

## Rebuilt current counts

Counts come from current `domain_structure.json` and were cross-checked against the exact D045–D084 role-fit worklist. Active role mappings are not conflated with the broader, unpromoted `role_library_v3.json` pool.

| Domain | Active mappings | Evidence-led coverage disposition |
|---|---:|---|
| D050 Industrial Automation | 0 | Zero-role. ISA/IEC scope supports automation/control engineering and industrial control-system integration/commissioning candidate families. |
| D051 Real Estate | 8 | Sparse. Existing eight include brokers, business valuer and facilities manager. RICS evidence supports property valuation, property/tenancy management and real-estate investment/development functions; overlap with business valuer/facilities manager needs exact-task comparison. |
| D052 Construction Management | 0 | Zero-role. CIOB/RICS/ILO evidence supports construction project management, site management and quantity surveying/construction cost management. Title boundaries vary by organization and procurement model. |
| D053 Hospitality Services and Management | 0 | Zero-role. Hotel/lodging operations management and guest-services/front-office families are plausible; source coverage and appropriate role granularity remain open, so these are not sign-off-ready additions. |
| D054 Oil and Gas Operations | 0 | Zero-role. SPE/ILO/SLB evidence supports petroleum geoscience, drilling engineering, reservoir engineering and production engineering as distinguishable technical families. |

The five domains account for 8 currently active mappings. Across D045–D054, 84 active mappings have been counted (D045–D049: 76; D050–D054: 8). The full completed role-fit lane remains 563 active mappings across 29 domains; that is a separate fit-review count, not a role-completeness finding.

## Source-based details and limitations

- Industrial automation: ISA's Certified Automation Professional scope covers direction, definition, design, development/application, deployment, documentation and support of industrial control and manufacturing information systems. IEC 62443 distinguishes asset-owner, maintenance-provider and integration-provider responsibilities. Candidate families are function-level until duplicate boundaries and title prevalence are checked.
- Real estate: RICS materials describe valuation, property management, agency, investment, development and real-estate finance. This supports looking beyond brokerage, but it does not justify multiplying titles where tasks overlap. Property management is not automatically the same as facilities management; business valuation is not automatically property valuation.
- Construction: CIOB describes project managers' coordination of budget, schedules, people, procurement, progress, client needs and safety; site management is operational site coordination. RICS describes quantity surveyors as cost managers handling estimates, tendering, cost control, valuation, claims and accounts. CIOB notes construction titles/responsibilities can vary.
- Hospitality: the parent includes hotels, restaurants, resorts, events, guest service and management. Current candidates are provisional; the consulted ILO/AHLA material supports hotel-management and hotel-career contexts, but the inventory still needs more internationally representative task evidence before final role granularity is recommended.
- Oil and gas: SPE describes drilling, completions, reservoir/geoscience and production operations as core disciplines. SLB role descriptions add concrete reservoir-engineering tasks. They are linked here because the parent explicitly covers petroleum discovery, well planning, production, offshore facilities and refining—not because of generic title resemblance.

No candidate in this batch has a verified Nigeria-specific variant. That means no direct Nigerian source was used to assert a local title; it does not imply that Nigerian variants do not exist.

## Tests and controls

`test_role_coverage_candidate_register.py` now validates D045–D054 exact domain keys, current per-domain counts against `domain_structure.json` and the role-fit worklist, duplicate candidate keys, source coverage, tasks/title/parent-fit fields, and the no-subgroup/no-canonical-edit boundary. Run:

```powershell
python -m unittest data.career-mapping._audit.role_coverage_lanes_2026_10_05.D045_D084.test_role_coverage_candidate_register -v
```

Completed candidate and evidence details are in `role_coverage_candidate_register.json`. The D045–D049 findings are separately checkpointed in `D045_D049_coverage_checkpoint.md`.

## Next batch

Proceed with D055–D059, rebuild the counts at that point, and checkpoint after the five-domain batch. D055–D084 still require explicit coverage dispositions. D084's four unsupported role-link correction proposals remain separate and unapplied in the role-fit report. Role→specialization and subgroup assignments remain deferred.

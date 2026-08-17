# CCMAS programme → domain high-confidence sweep

Audit date: 2026-08-17  
Scope: remaining Direct-tier links after the approved first correction pass.

## Why this second sweep was necessary

The first audit isolated 40 high-confidence recommendations. A post-implementation review of the remaining Direct tier found additional cases where a programme was being presented as the target profession even though its CCMAS curriculum was broader, preparatory, teacher-oriented, or a neighbouring specialisation.

Examples included:

- a language degree presented as Direct Higher Education rather than a subject degree with a possible teaching/lecturing pathway;
- Software Engineering presented as Direct FinTech, Robotics, and Internet of Things without those specialist curricula;
- Mathematics presented as Direct Actuarial Science/Data Science;
- Environmental Health presented as Direct Environmental Engineering;
- Occupational Therapy presented as Direct Occupational Health and Safety;
- Social Work presented as Functional Psychology while its own Social Work domain was not Direct;
- research-support subjects presented as Direct Scientific Research.

## Applied result

The guarded script `_apply_high_confidence_mapping_sweep.py` applied:

- 8 removals;
- 90 high-confidence tier corrections;
- 1 missing core relationship promoted: Social Sciences :: Social Work → D046 Social Work, Functional → Direct.

The current authoritative mapping contains:

| Tier | Links |
|---|---:|
| Direct | 226 |
| Functional | 2,136 |
| Adjacent | 134 |
| Total | 2,496 |

All changed links carry `audit_ref: programme_domain_mapping_sweep_2026-08-17` and `evidence_status: curriculum_reviewed_high_confidence`. Stale `direct_source` fields were removed from demoted links.

## Interpretation boundary

This sweep intentionally corrected only high-confidence tier errors. It did not automatically delete every Functional link with generic evidence. The remaining review queue includes broad clusters such as Digital Health, Data Science, Public Administration, Legal Practice, Marketing, Business Intelligence, and technical engineering domains. Those require programme-specific evidence review before SQL reseeding.

The next audit must test every remaining link against named CCMAS courses/learning outcomes and the target domain’s definition/foundation skills, then attach verifiable evidence rather than relying on scorer provenance alone.

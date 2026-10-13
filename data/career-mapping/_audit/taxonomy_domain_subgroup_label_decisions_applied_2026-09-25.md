# Domain and subgroup student-label audit — resolutions applied (2026-09-25)

## Coverage and evidence

- Domains: all 168 individually reviewed against source identity, definitions, lineage and recorded scope. The 11 formerly uncertain cases were resolved against the original definition library and authoritative sources: 5 supported keep, 6 supported rename, 0 unsupported. The first-pass audit had 20 additional refinements; 26 domain labels have now been refined in total. No domain ID or domain mapping was changed.
- Subgroups: all 558 domain+ISCO pairs reviewed against official ISCO-08 definitions, domain scope, provenance and exact recorded members. The 8 formerly uncertain cases were resolved: four student-label refinements, three subgroup-code corrections, and one unsupported domain path removal. The first-pass audit had 9 additional label refinements.

Detailed evidence and locators: [full domain audit](domain_display_label_source_audit_checkpoint_2026-09-25.md), [domain uncertainty resolution](domain_display_label_uncertain_investigation_final_2026-09-25.md), [full subgroup audit](domain_subgroup_label_checkpoint_2026-09-25.json), and [subgroup uncertainty resolution](domain_subgroup_uncertain_pairs_review_2026-09-25.md). The subgroup classification reference is [ILO ISCO-08](https://isco.ilo.org/en/isco-08/).

## Uncertainty resolutions

Domain label decisions:

- Renamed D086 to “Gambling, Betting & Lottery Operations” and restored its source-backed “Retail, Sales & Commerce” cluster. It remains excluded from the student catalogue; no missing definition was invented from its title.
- Restored the omitted source scope in D087 “Hairdressing, Barbering & Hair Technology,” D088 “Beauty Therapy, Aesthetics & Spa Services,” D100 “Plumbing, Pipefitting & HVAC Technology,” and D101 “Painting, Decorating & Surface Treatment.”
- Reconciled D133’s broad luxury-craft description with its source scope, “Luxury & Bespoke Specialist Interiors,” by making the student description specific to bespoke interiors in aviation, maritime and automotive settings.
- Kept D089, D108, D113, D167 and D168. Evidence supports their labels; the audit records the limits of what those sources establish. No uncertain domain was removed.

Subgroup decisions:

- D107/31 now describes footwear/leather production, technical, quality and supervisory work.
- D111/72, /75 and /81 now use textile-specific names that match their recorded members.
- D129 now has subgroup keys `01`, `02`, `03` and the exact source titles “Commissioned Armed Forces Officers,” “Non-commissioned Armed Forces Officers,” and “Armed Forces Occupations, Other Ranks.” Its 21 role names are unchanged, and source unit codes retain their leading zeroes (`0110`, `0210`, `0310`). This corrects the previous false matches to ISCO groups 11, 21 and 31.
- Removed only the unsupported D143/21 path: its generic science members had no forensic specialization evidence. Astronomer, cosmologist and physicist remain in their supported D041 paths. The residual O*NET role “Life Scientists, All Other” is retained in [the internal-only unassigned-role queue](unassigned_role_review_queue_2026-09-25.json), not deleted, assigned to a guessed domain, or exposed to students.

## Seed and student-card behavior

`domain_meta.json`, `domain_structure.json`, and `_apply_emerging_domain_structure.py` hold the taxonomy inputs and repeatable subgroup materialization rules. The local regenerated seed has 160 visible domains, 544 subgroups, 5,089 roles and 1,707 JAMB-domain rows. Its 23 compressed SQL parts match all manifest sizes and SHA-256 checksums, and contain the corrected military codes and labels. This is local seed preparation only; no SQL was applied.

Domain, subgroup and role selection cards prefer the entity’s own student orientation or description. The domain-list endpoint supplies summary fields without exposing raw provenance. Role names were not rewritten in this naming pass; one unsupported domain association was replaced with an internal-only unassigned record.

The source-backed layer, role-completeness and resource-seed gates passed before generation. These gates validate seed structure and source/resource coverage; they do not complete the separate full 420-JAMB/237-CCMAS offering-and-curriculum mapping audit.

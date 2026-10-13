# Specialization lane checkpoint 016 — D057–D091

Date: 2026-10-05. Resumed from checkpoint 015. This pass targeted only its seven listed evidence findings; it did not repeat the earlier review of the full assigned domain range.

## Exact progress

- Assigned domains: **35** (D057–D091 inclusive).
- Prior source/count review: **35/35 covered**; **0 unexamined**. The exact domain set is the contiguous range D057 through D091.
- Targeted follow-up findings: **7/7 investigated** (D064, D067, D075, D076, D077, D080, D091), with primary-source URL, locator, support boundary and limitation recorded in `source_specialization_audit_016.json` and `.md`.
- No domain's canonical subgroup taxonomy was changed. Review conclusions and proposed counts remain lane evidence, not implemented taxonomy.
- Checkpoint 015's shared-register count was stale. Read-only comparison confirms **D070 and D071 already exist and exactly match the lane projection**; therefore **16** of D067–D084 are actually absent. A no-write preflight finds **15/16 additive-ready** and one D077 source-record collision (`UNESCO_SPORT_CHARTER`). No shared-register write was performed. See `shared_register_preflight_017.json`.
- Provisional/unresolved records carried from checkpoint 015: **8**. These remain unresolved by design where international sources support practice areas but do not mandate an exact learner-facing subgroup count or parent-domain boundary.
- Explicit exact global subgroup counts established by authoritative bodies: **0**.
- Role-to-specialization assignments: **none**; role-to-domain fit remains a separate lane.

## Decisions advanced

- D077's emergency/fire/rescue candidate is now explicitly **not supported under the current Security Services parent** by the cited source set. ISO 18788 scopes private security operations; ISO 22320 scopes multi-organization incident management. This supports a parent-split candidate, not a subgroup approval.
- D080 now has a stronger interior-design scope boundary from CIDQ paired with IFI. Keep its four partitions diagnostic and the approved subgroup count at zero until root-domain scope is reconciled.
- D076 now has a direct IMO treaty locator distinguishing civilian maritime convention scope from warships/naval auxiliaries. Four civilian learner areas remain an internal synthesis; naval/military is not counted under the civilian set.
- D075 has stronger international evidence for textile material testing and value-chain/traceability learning. Four remains an internal synthesis rather than a formal count.
- D064 and D067 received explicit recognition-framework crosswalk/completeness notes. Their broad learner groupings must not be called globally exhaustive or equated with recognized credentials.
- D091's learner routes are explicitly separated from local instructor recognition and vehicle-class licensing.

## Validation

`python -m pytest -q data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D091` — expected **68 passing tests** (checkpoint 015 had 64; this checkpoint adds four focused follow-up tests). Passing validates lane artifact structure and guardrails, not external academic sign-off.

Next work, if this lane is continued: the 15 clean records could be reconciled only when shared-register writes are in scope; resolve the D077 bibliographic-record collision without losing its narrower evidence limitation; retain the 8 provisional/unresolved dispositions until parent-boundary or evidence gaps are genuinely resolved. No assigned domain remains unexamined.

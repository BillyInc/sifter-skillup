# Partition 01 acceptance addendum — 2026-09-25

This append-only addendum applies to all JAMB identities in rows 1–140, including identities in increment 016. It records the user’s additional acceptance rule; it does not alter mappings, scopes, seeds, or prior dispositions.

## Evidence gate

- If a CCMAS package/course/outcome is absent or insufficient for a proposed connection, perform item-specific research against authoritative primary sources. A search snippet, generic source homepage, broad job-family page, or title similarity is not evidence.
- Each external-source record must include the direct URL, exact section/course/standard/paragraph/page locator, access date, source authority/version or jurisdiction when applicable, and the precise claim it supports. State what it does **not** support.
- Keep `confirmed_defect`, `evidence_needed`, `unsupported`, and `student_path_confirmed` as separate decisions. An unresolved candidate is not a confirmed defect; an unsupported student route is not a confirmed path.
- For every JAMB→domain edge, inspect the active domain’s relevant subgroups and roles against the scoped course/outcome evidence. Record whether evidence supports (a) the domain only, (b) named subgroup(s), or (c) named role(s). If only the domain is supported, explicitly block subgroup/role exposure pending evidence.
- A direct/functional/adjacent tier must describe the strength and breadth of the programme-to-domain connection; it does not independently prove that every downstream item is relevant. No subgroup or role is student-confirmed by inheriting the parent-domain tier.
- Where authoritative external research does not establish context-specific fit, leave the item unresolved or unsupported for student display and retain its source/search trail in the internal audit.

## Increment 016 closure effect

Increment 016 is an initial evidence checkpoint for rows 96–105, not a completed semantic audit. Its listed “overreach candidates” remain candidates until each affected link is checked against scoped learning outcomes and the relevant domain descendants. Any proposed retention of links whose CCMAS coverage is missing or thin must receive the item-specific external evidence above; otherwise do not confirm the student path. External evidence may explain a context or learning route, but must not be used to imply that an unstudied curriculum component or professional qualification is already included in the programme.

## Required fields to append for each such external finding

`row`, `jamb_name`, `source_offering_context`, `domain_id`, `subgroup_id`/`role_id` if supported, candidate item or claim, decision, source title/organization, direct URL, exact locator, version/jurisdiction, access date, supported claim, limits, query trail, and student-display decision.

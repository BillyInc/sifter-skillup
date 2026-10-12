# Partition 02 — increment 010: rows 157–166 map-snapshot reconciliation

Recorded: 2026-09-25 (Africa/Lagos), after the canonical fail-closed regeneration. Append-only correction and delta record; increment 009 remains the accurate description of the earlier 3,163-link snapshot, not current map truth. No maps, seeds, SQL or application files were edited here.

## Current baseline

The active `data/career-mapping/jamb_domain_map.json` now contains 420 identities and 1,727 links. The preserved comparison snapshot is `data/career-mapping/_audit/jamb_domain_map_before_fail_closed_2026-09-25.json` (420 identities / 3,163 links). I compared both snapshots with `data/career-mapping/_audit/jamb_domain_map_ccmas_derived_2026-08-17.json` (canonical candidate set) for rows 157–166. Current active rows are `ready_partial`, not zero-link/quarantined. None of these ten names intersects the 86-identity overlay-conflict ledger.

## Exact set delta and evidence disposition

| Row | Identity | Removed from prior snapshot | Current/canonical candidate added | Disposition against reviewed scope/outcomes |
|---:|---|---|---|---|
| 157 | INFORMATION SYSTEMS AND TECHNOLOGY | D033 Product Management | D010 (current canonical label: verify locally before presentation) | D033 was overbroad: innovation/e-business courses do not establish product-management tasks. Review whether D010 is genuinely supported by INS 207/INS 322/DTS 404; do not auto-restore to student guidance without naming its subgroup/roles and direct evidence. |
| 158 | CYBER SECURITY SCIENCE | D001, D009, D033 | — | Matches prior unsupported dispositions: these cybersecurity courses do not establish software-engineering, data-science or product-management career routes. D004 direct remains the supported domain-level path; other current candidates still require branch-level review. |
| 159 | PURE AND APPLIED BIOLOGY | D122 | — | Matches prior unsupported disposition: biology lab/molecular courses do not establish medical-laboratory qualification or clinical specimen workflows. |
| 160 | APPLIED BIOLOGY AND BIOTECHNOLOGY | D048, D122 | — | D122 exclusion aligns with the qualification boundary. D048 removal needs narrower review: BTG 309 Food Biotechnology is in the scope and supports a food-biotechnology facet, but not every Food Science subgroup/role. If evidence supports a narrow subpath, candidate set may need a scoped correction rather than treating the domain as wholly irrelevant. |
| 161 | MARINE BIOLOGY | D076 | — | Removal aligns with evidence: Marine Science CCMAS does not prepare for ship design, navigation, deck/crew or maritime operations. |
| 162 | Physics Electronics | D094, D006 | D017 | D094 was a plausible electronics domain candidate, but the current canonical candidate set excludes it; reconcile only if relevant electronics-specific subgroup/role evidence justifies adding it. D006 removal aligns: digital electronics alone is not IoT. D017 mechanical is newly present in current set and not supported by the inspected PHE course slice; do not expose as a path without mechanical-design/task evidence. |
| 163 | Physics/Industrial Physics | D006 | D155 | D006 removal aligns: solid-state physics is not IoT systems preparation. D155 is newly present; the IPH curriculum has materials/solid-state content, so it is a plausible narrow domain candidate, but nanoscience/fabrication roles are not established by that alone. Need per-subgroup/role disposition before display. |
| 164 | Applied Physics | — | — | Link set unchanged. Prior per-link dispositions still apply; they remain provisional pending exact JAMB source context and descendant checks. |
| 165 | Applied Biochemistry | D122, D048, D009 | D055 | Removed links align with the reviewed slice: it omits BCH 407 Bioinformatics and its current scoped course anchor is BCH 408 entrepreneurship. D055 Chemical Engineering is newly present but no chemical-process/engineering course is in the 11-course applied-biochemistry scope; unsupported absent institution-specific course evidence. |
| 166 | Chemistry and Industrial Chemistry | — | — | Link set unchanged. The scope does contain industrial-process and chemical-process courses, but the broad electrical/mechanical/renewable/nanomaterials destinations remain unsubstantiated as noted in increment 009. |

Across rows 157–166, the old snapshot had 72 link occurrences and the active map has 62: **14 prior links removed, four canonical candidates restored/added, net −10**. Current link counts by identity are 6, 6, 9, 6, 5, 7, 8, 6, 1, 8 respectively. This is a derived-map delta, not a source-backed student-approval decision. In particular, a removed link does not prove its domain is semantically wrong; it signals that evidence must be resolved before any candidate is restored.

## Closure status after reconciliation

Rows 157–166 remain **0/10 fully closed**. The map delta is now incorporated into the evidence queue, but does not cure the missing exact JAMB printed table locators/institution associations, verify each institution’s local 30% curriculum, or complete every retained candidate’s subgroup/role checks. Prior row-by-row dispositions in increment 009 must be read together with these snapshot corrections. Do not use the rollback snapshot as active truth.

## Files compared

- `data/career-mapping/jamb_domain_map.json` — current active, fail-closed derived map
- `data/career-mapping/_audit/jamb_domain_map_before_fail_closed_2026-09-25.json` — prior preserved snapshot, comparison only
- `data/career-mapping/_audit/jamb_domain_map_ccmas_derived_2026-08-17.json` — canonical candidate links
- `data/career-mapping/_audit/jamb_nigerian_review_overlay_conflicts_2026-09-25.json` — conflict identity check
- `data/career-mapping/_audit/jamb_curriculum_scopes_2026-08-17.json` — component/course scope
- `data/career-mapping/ccmas/` — component course/outcome records

Next systematic slice remains rows 167–176.

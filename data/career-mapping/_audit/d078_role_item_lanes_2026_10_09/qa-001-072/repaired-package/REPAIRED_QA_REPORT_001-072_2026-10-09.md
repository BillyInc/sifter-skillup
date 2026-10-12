# D078 role-item repaired QA report — replacement lane 001–072

Date: 2026-10-09  
Scope: content/source QA and reconciliation of the saved `replacement-001-072` package only.  
Derived artifact: `d078_role_item_repaired_qa_package_001-072_2026-10-09.json`.

## Handoff result

The source lane remains read-only. This repaired package fixes the machine-readable defects that could be fixed without changing role fit, taxonomy, the common ledger, builder, canonical/API/SQL, subject matching, or student routes.

- 72 pair records audited; 143 source occurrences; 137 retained QA occurrences.
- Six `philosopher` occurrences are explicitly excluded from D078 QA provenance and routes. The six affected pair records remain present only as source records with filtered QA provenance; no D078 area route and no D039 reassignment is made.
- 72/72 records now have the same normalized fields and a structured `free_learning_resource` state.
- 65 learning entries are `candidate_review_only`; 7 are `none_found_review_only`. No candidate is promoted or student-approved.
- 16 confirmed dead URLs were re-audited: 13 have bounded replacements in the derived package; 3 retain exact residuals because no equivalent claim-scope source was verified.
- The repaired lane gate passes structural checks with review-only residuals. No role-fit adjudication was performed.

## Repairs made in the derived package

| Defect | Before | Derived-package result |
|---|---:|---|
| Missing structured free-learning fields | 50 | 0; all 72 have `state`, URL or explicit null, locator, scope, limits and access disposition |
| Learning locator precision flags | 50 | 0 for the repaired learning fields; remaining source-evidence identity/locator gaps are separately recorded |
| Schema variants | 2 | 0; `meaning_and_task_output`/`role_task_rationale` are normalized to `meaning_task_output`/`task_use_output` |
| Confirmed dead URLs | 16 | 13 replaced; 3 exact-equivalent residuals retained with explicit review-only status |
| Duplicate/parallel provenance | 1 unresolved class | Preserved source and filtered QA provenance; Herschel/Locke/Leibniz identity equivalence remains unproven |
| Philosopher scope | 6 raw occurrences | 6 excluded from QA occurrence counts/routes; no reassignment |

The repair does not claim that a bounded candidate resource proves item identity, direct task use, checkpoint fit, or Nigerian applicability. Those are separate gates and remain review-only.

## Dead-link repair ledger

The repair pass rechecked each URL directly, searched saved package alternatives, and searched the relevant official domain. “Replaced bounded” means the replacement is usable only for the narrower locator/scope stated in the JSON; it is not evidence of role fit.

| Original URL | Disposition | Replacement or exact residual |
|---|---|---|
| `ocw.mit.edu/courses/21a-01-how-culture-works-spring-2012/` | replaced bounded | American Anthropological Association, *Introduction to Anthropology* PDF |
| `placng.org/.../Constitution-of-the-Federal-Republic-of-Nigeria-1999-as-amended-2011.pdf` | residual | No verified complete current equivalent selected for the Nigerian constitutional claim |
| `research.unilag.edu.ng/.../UNILAG-Research-Ethics-Policy.pdf` | replaced bounded | ABU research policy; Nigerian institutional scope only |
| `aeaweb.org/resources/students/careers/undergraduate/math` | replaced bounded | NOUN ECO 256 Mathematics for Economists II |
| `aeaweb.org/resources/students/careers/undergraduate/research` | replaced bounded | OpenLearn research-methodology course |
| `bbc.co.uk/academy/.../art20130702112133615` | replaced bounded | UNESCO journalism Model Curricula PDF |
| `cfainstitute.org/.../equity-valuation-applications-and-processes` | replaced bounded | OpenStax finance role/financial-information section |
| `cipd.org/.../policies-factsheet/` | replaced bounded | OpenStax management planning section |
| `cipd.org/.../strategic-planning-factsheet/` | replaced bounded | OpenStax management planning-process section |
| `du.ac.in/index.php?page=academics` | residual | No exact Sanskrit learner page verified; institution context is not substituted |
| `nsf.gov/pubs/2002/nsf02172/nsf0201.htm` | replaced bounded | OpenLearn research-methodology course |
| `nuc.edu.ng/.../SOCIAL-SCIENCES.pdf` | replaced current | NUC revised Social Sciences CCMAS PDF (2026 path) |
| `saa.org/about-archaeology` | replaced current | SAA current “What is Archaeology?” page |
| `saa.org/about-archaeology/what-is-archaeology` | replaced current | SAA current “What is Archaeology?” page |
| `un.org/en/climatechange/science/climate-issues/economics` | replaced bounded | World Bank environmental-economics topic page |
| `unesco.org/en/culture/conventions/1970` | residual | No exact current equivalent selected for the international legal claim |

The three residuals are not silently treated as unsupported. Their original claims remain explicit unresolved review items with the missing-equivalence reason in `dead_link_repair_audit`.

## Reconciliation and duplicate detection

The eight saved batch JSON files parse. Manifest keys match the 72 pair records; duplicate pair keys, missing keys, extra keys and occurrence-count mismatches are zero. Five same-label priority twins remain separate by exact pair key (essential/optional); they were not merged.

The shared continuation checkpoint attributes rows 001–030 to Herschel and rows 031 onward to Locke. User-provided context says Leibniz also reported all 72, but no separate immutable Leibniz artifact is present in this workspace. The lane JSON has no author/version field, so byte-level or item-level identity among the three reports cannot be proven. The repaired package therefore retains `source_occurrence_provenance`, adds filtered `qa_occurrence_provenance`, and keeps parallel-provenance reconciliation review-only.

Earlier checkpoint prose has stale batch-count assertions; final JSON and `checkpoint-072.md` are the count authority. The repaired package records that disposition without editing those source checkpoints.

## Evidence boundaries and unresolved gates

- Exact source identity/URI/type/version: unresolved for 72/72.
- Concrete role task/use/output: unresolved for 72/72; inventory occurrence is not task evidence.
- Programme/domain/area/role checkpoint fit: unresolved for 72/72; no role-fit audit was reopened.
- Nigeria-specific evidence: global and Nigerian evidence remain separate. Nine retained pairs have no Nigerian source entry; no Nigerian evidence is inferred. Nigerian entries are bounded to the named source and locator, including the ABU and NOUN examples.
- Prerequisites, complements, alternatives and limits are carried forward in every normalized record; they do not constitute approval.
- Learning resources: candidates remain review-only, with exact locator/scope/limits. Seven records explicitly state none found. A none-found state is not a claim that no resource exists anywhere; it records the result of the assigned repair search.
- Retired Mathematician, Historian and Biometrician paths remain outside this slice. No route, crosswalk or D039 reassignment was created.
- D078 Social Behaviour and Interaction remains bounded to social behaviour/interaction in groups, institutions and communities; clinical/professional psychology material is not promoted.

## Saved artifacts

- [Repaired package JSON](d078_role_item_repaired_qa_package_001-072_2026-10-09.json)
- [Repaired lane gate](repaired-lane-gate-2026-10-09.json)
- [QA checkpoint](../checkpoint-qa-001-072.md)
- [Original QA issue ledger](../qa-001-072.json)

The repaired JSON is a derived QA/package artifact. The primary replacement lane and all common/canonical/runtime artifacts remain unchanged.

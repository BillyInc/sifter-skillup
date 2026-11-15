# D078 Role Prerequisite and Foundation Reconciliation

**Date:** 2026-11-03  
**Scope:** The current 19 D078 roles, their role-task context nodes, and all 173 role-item ledger records. This closes the role-prerequisite decision stage only; alternatives and UI progression remain later work.

## Decision

For the current graph, each role continues from the learner's selected, supported area/task context into the role's task context. The reviewed evidence does not establish a separate role-wide learning foundation before those task contexts. Therefore the graph has zero role-foundation nodes and zero approved role-item prerequisite edges. This is an explicit evidence-based decision, not a stale `false` flag or an assumption that role items do not matter.

Role-owned items remain downstream of the selected domain → method or named design → area → role route, and are grouped beneath the role-task context. Their preparation notes are retained on the exact item nodes as context; they do not become a universal sequence, compulsory learning gate, or detached role choice.

## Audit evidence

- The task-set source has 21 role records; 19 join to roles in the current D078 graph. The two research-only records without a current D078 role route are not projected as student routes.
- Each of the 21 source role records has one task-family record. Its `prerequisites` field contains the same generic task-condition wording: appropriate subject knowledge, evidence access, permissions and method competence for the chosen project, with no universal entry qualification inferred. It does not specify a role-specific learning node or before/after relationship.
- All 19 active graph roles have a role-task context, at least one reviewed area-task-family → role-task context link, and a role-task → role link. The graph has 49 area-task-family-to-role-task context links and 220 role-task-to-role-item context links. Those are context links, not sequence edges.
- The role-item ledger has 173 records, 405 preparation-note entries and 382 distinct note phrases. The graph now preserves every note on its corresponding item node as `preparation_context_notes`, with its source locator and an explicit rule that it is not a sequence edge.
- The recorded source evidence supports item identity, occupational scope, or bounded task context. It does not provide an exact prerequisite target plus relationship-level evidence for a D078 learning order. An archaeological workflow source describes survey/excavation stages, but the current D078 archaeology context is explicitly bounded to documentary/secondary evidence; the candidate preparation terms do not resolve to an exact archaeological-survey learning node on that route. No edge was invented from that mismatch.

The external source review confirms the distinction. ESCO organizes occupations and linked knowledge/skill concepts; its handbook describes occupation links and skill contextualisation, not a temporal D078 teaching sequence. O*NET profiles list occupation tasks and worker/occupational requirement information, but that is not a D078 learning prerequisite graph. They are useful for role/work scope, not by themselves proof of what a learner must study first. [ESCO classification](https://esco.ec.europa.eu/en/classification), [ESCO handbook](https://esco.ec.europa.eu/system/files/2021-07/Handbook.pdf), [O*NET Sociologists](https://www.onetonline.org/link/summary/19-3041.00), [O*NET Anthropologists and Archeologists](https://www.onetonline.org/link/details/19-3091.00).

## Graph contract now materialized

- `role_prerequisite_reconciliation` contains one explicit decision for each of the 19 active roles, the linked area-task contexts, the role task node, and the role-owned items in that context.
- Role-task source text formerly named `prerequisites` is represented in the graph as `task_conditions`, explicitly classified as contextual conditions—not role learning prerequisites.
- Every role-item ledger note is represented as `preparation_context_notes`, with a source locator. A future ordered relationship requires an exact graph target, route condition, and a source that supports the before/after relationship.
- No role route is blocked by these notes. Legal authorization, safeguarding, privacy, clinical scope, permissions and supervised practice remain activity-specific safeguards; they are not converted into student learning blockers.
- `role_learning_sequence_contract` records this audit status and note policy. The separate student UI/release gate remains unchanged.

## Verification gate

The focused graph regression test must prove all 19 role decisions exist; all 173 role item records and 405 preparation notes are preserved; every role remains connected to a selected area/task context; and no preparation note has been promoted into a sequence edge. This role decision does not close the alternatives audit, UI progression implementation, browser acceptance, or end-to-end test packs.

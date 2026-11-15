# D166 Agent 2 Workpack — Independent Reconciliation (2026-10-24 snapshot)

**Historical snapshot, superseded by the live workpack reconciliation dated 2026-10-26.** This review captured the source workpack on 2026-10-24 and is retained for audit history; its counts and open-cell inventory below are not current. The current source of truth is `D166_AGENT2_SOURCE_WORKPACK_2026_10_24.json` and its matching Markdown report.

Current 2026-10-26 status: 45/96 cells have mapped candidates, 51 cells remain open, and all 24 task tracks remain nonterminal. Area counts are Planning 15/24, Control/Dynamics 9/24, Integration 12/24 and Safety/V&V 9/24. All four areas remain open. Do not interpret either mapped candidates or this historical reconciliation as closure.

## Result

- At the 2026-10-24 snapshot: four canonical areas; 96 cells total. **22 unique mapped claims; 74 cells without a mapped claim at that date.**
- Area counts: Automated Driving Planning 5/24; Vehicle Control and Dynamics 6/24; Vehicle Interface and System Integration 5/24; ADS Safety Verification and Validation 6/24.
- **At that snapshot, all four areas and all 24 task tracks remained open.** No task was complete, not applicable, or bounded no-hit.
- 11 role task records remain conditional; role fit/ownership and routes are unchanged. Six cross-area candidates remain unapproved.
- Four query logs and four counter-search records document a bounded pass, not source saturation.

## Mapped claims

Each row below is a narrow claim attached to one cell. It does not close its area or task track. Relationship annotations describe source/context relationships; they do not approve graph blockers or learning-sequence edges.

| ID | Area | Family | Horizon | Claim |
|---|---|---|---|---|
| `D166-B-MAP-001` | D166:automated-driving-planning | `foundations_knowledge_and_competencies` | established/traditional | Classical AV design decomposes route planning, behavior decision, motion planning and vehicle control; planners must account for environment structure, vehicle model and computational constraints. |
| `D166-B-MAP-002` | D166:automated-driving-planning | `methods_and_designs` | current | Current benchmark designs distinguish open-loop imitation from closed-loop evaluation; reactive-agent assumptions alter interaction and can alter planner rankings. |
| `D166-B-MAP-003` | D166:automated-driving-planning | `tools_software_and_data` | current | Autoware publishes a sequence of spatial/velocity/acceleration trajectory points and turn/hazard commands for downstream consumers; nuPlan supplies planner-specific metrics and scenario evaluation. |
| `D166-B-MAP-004` | D166:automated-driving-planning | `outputs_and_downstream_role_context` | current | A selected behavior is converted into a feasible reference path/trajectory; feedback control tracks it and corrects execution error, so the planned motion and control command are separate outputs. |
| `D166-B-MAP-005` | D166:automated-driving-planning | `techniques_estimators_and_algorithms` | emerging | Learning-based reactive multi-agent traffic simulation is a research benchmark alternative to rule-based IDM and reports improved interaction diversity; diffusion/world-model approaches remain benchmark-specific evidence here. |
| `D166-B-MAP-006` | D166:automated-driving-planning | `standards_credentials_and_learning_resources` | current | Historical snapshot claim, corrected in the current workpack: ISO 34502:2022 is published with limited-access-highway scope; ISO 34505:2025 is published for scenario-based ADS test-case generation/evaluation. The earlier DIS-stage label is not current. |
| `D166-B-MAP-007` | D166:vehicle-control-and-dynamics | `foundations_knowledge_and_competencies` | established/traditional | Control design depends on vehicle-motion definitions/model and lateral/longitudinal dynamics; reference trajectory tracking is a separate functional responsibility from trajectory generation. |
| `D166-B-MAP-008` | D166:vehicle-control-and-dynamics | `methods_and_designs` | current | Maintained Autoware implementations document geometric pure-pursuit tracking, model-based MPC tracking, and a Smart MPC option using iLQR/MPPI with learned residual models; these illustrate alternatives and a hybrid extension, not a winner. |
| `D166-B-MAP-009` | D166:vehicle-control-and-dynamics | `techniques_estimators_and_algorithms` | emerging | Research on learned residual/model components and risk-aware MPC/RL examines adaptation under vehicle-model uncertainty, while competition/racing conditions bound transfer claims. |
| `D166-B-MAP-010` | D166:vehicle-control-and-dynamics | `tools_software_and_data` | current | Autoware MPC documentation specifies vehicle model, state/path input and steering-command output; simulation/toolbox support can aid design and testing but is not deployment validation. |
| `D166-B-MAP-011` | D166:vehicle-control-and-dynamics | `outputs_and_downstream_role_context` | current | Autoware control outputs a motion control command based on a reference trajectory; the vehicle interface consumes it and converts normalized intent for platform-specific actuation. |
| `D166-B-MAP-012` | D166:vehicle-interface-and-system-integration | `foundations_knowledge_and_competencies` | current | Integration requires consistent message semantics, units/frames, timestamps, communication and feedback status; control intent is not the same as measured actuation or mode. |
| `D166-B-MAP-013` | D166:vehicle-interface-and-system-integration | `methods_and_designs` | current | Vehicle adapters may pass generalized steering/speed/acceleration commands or map them into vehicle-specific torque, voltage, pressure or pedal inputs, and translate platform status back to normalized messages. |
| `D166-B-MAP-014` | D166:vehicle-interface-and-system-integration | `tools_software_and_data` | current | AUTOSAR Adaptive R25-11 lists services including communication, diagnostics, time synchronization, sensor interfaces, health management and update/configuration management for high-performance vehicle applications. |
| `D166-B-MAP-015` | D166:vehicle-interface-and-system-integration | `outputs_and_downstream_role_context` | current | Vehicle interface emits vehicle-specific commands and returns velocity, steering, actuation and control-mode status; loss/unknown status is diagnosable and mode transition has latency. |
| `D166-B-MAP-016` | D166:ads-safety-verification-and-validation | `foundations_knowledge_and_competencies` | current | ISO 26262 and ISO 21448 address different risk causes: E/E malfunctions versus hazards from intended-function insufficiency/performance limits and reasonably foreseeable misuse; 21448 excludes 26262 faults and cybersecurity. |
| `D166-B-MAP-017` | D166:ads-safety-verification-and-validation | `methods_and_designs` | current | Scenario-based safety evaluation links scenario sets to requirements, ODD and test objectives; test-case generation and execution validity are explicit concerns, but simulation validity must be evaluated rather than presumed. |
| `D166-B-MAP-018` | D166:ads-safety-verification-and-validation | `tools_software_and_data` | current | nuPlan and scenario-oriented standards/tools support repeatable benchmark or virtual evidence; they do not establish on-road safety or regulatory approval. |
| `D166-B-MAP-019` | D166:ads-safety-verification-and-validation | `standards_credentials_and_learning_resources` | current | NHTSA describes ADS voluntary guidance and VSSA submissions as optional; UNECE current activities include ALKS under UN R157 and developing broader ADS instruments, which are not all adopted law. |
| `D166-B-MAP-020` | D166:ads-safety-verification-and-validation | `outputs_and_downstream_role_context` | current | Safety V&V work outputs include requirements-linked test plans/results, scenario and ODD coverage, evidence for safety arguments and approval dossiers; employer postings document such tasks conditionally for ADS QA, integration and homologation assignments. |
| `D166-B-MAP-021` | D166:vehicle-control-and-dynamics | `techniques_estimators_and_algorithms` | established/traditional | Established trajectory-tracking techniques include geometric path followers (for example Pure Pursuit/Stanley), feedback control (PID), optimal/state-feedback methods (LQR) and model-predictive control; the selected model fidelity and controller depend on speed, lateral dynamics, vehicle characteristics and computational limits. Path tracking is spatial, whereas trajectory tracking follows a time-indexed reference. |
| `D166-B-MAP-022` | D166:ads-safety-verification-and-validation | `techniques_estimators_and_algorithms` | current | A 2026 systematic review classifies current safety-oriented MPC research across collision/risk mitigation, trajectory tracking/path following, and intersection/coordination, including robust, risk-aware, hierarchical and learning-enhanced formulations. It reports that much of the evidence is simulation-based, with inconsistent safety metrics and limited validation under uncertainty and computational constraints. |

## Reconciliation findings

- Added stable mapping IDs for 22 unique area/family/horizon cells as of the 2026-10-24 snapshot; later workpack updates add further mappings.
- Filled the four previously empty task-level evidence lists with relevant source IDs. Those tasks remain open because their source evidence covers only part of the stated scope.
- Corrected the stale noncanonical prediction destination to `D166:perception-and-scene-understanding`; prediction remains a function/context and was not introduced as a new area.
- Retained explicit access limits for the two replacement reviews. They support high-level review claims from indexed excerpts, not study-level comparison or performance ranking.
- Relationship annotations (including prerequisites, complements, alternatives and output handoffs) are contextual source interpretations only. They do not define approved learner selection blockers or a complete sequence graph.

## Remaining work

At the 2026-10-24 snapshot, the review still needed broader evidence for 74 cells and all 24 open task tracks. This historical gap description is superseded by the dated current register and counter-searches in the source workpack; it is not a current inventory. The original cautions about evidence breadth, jurisdiction, and source limits remain relevant.

## Validation

Snapshot validation run on 2026-10-24: JSON parsed; source IDs in mappings, task evidence and role evidence resolved against the index or source additions; 22 mapping IDs and cell keys were unique; all 24 task records had traceable evidence IDs and remained open; all four areas remained open. Current validation is reported in the source workpack; this historical run is not current verification. No software tests were run.

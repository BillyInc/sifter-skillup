# D166 Agent 1 Source Workpack - 2026-10-24

> **Closure packet:** All four assigned areas have 24 terminal cell dispositions each; all 24 task tracks are terminal. `bounded_no_hit` is a final searched-scope result, not a pending task. The coordinator has integrated these dispositions into the canonical D011/D166 source index; see `D166_AGENT1_COORDINATOR_RECONCILIATION_2026_10_24.md` for the integration check.

## Scope and outcome

| Area | Mapped | Bounded no-hit | Not applicable | Tracks complete | Tracks bounded |
|---|---:|---:|---:|---:|---:|
| Vehicle Sensing and Sensor Calibration | 16 | 8 | 0 | 5 | 1 |
| Perception and Scene Understanding | 18 | 6 | 0 | 4 | 2 |
| High-Definition Mapping and Map Data | 14 | 10 | 0 | 4 | 2 |
| Localization and Vehicle State Estimation | 11 | 13 | 0 | 4 | 2 |

**Total:** 96 cells: 59 mapped, 37 bounded no-hit, 0 not applicable; 24 tasks: 17 complete, 7 bounded no-hit, 0 not applicable; **0 open**. Distinct cell-linked mappings: **65**. **Distinct cell-linked claim mappings:** 65. Queries: 15; new source cards: 24; existing-source rechecks: 5; conditional role-task records: 6; cross-area candidates: 5.

Scope stayed within sensing/calibration, perception, HD mapping, and localization/state estimation. No graph, taxonomy, role fit, routes, SQL, migrations, UI, sequence, inventory, or canonical index changed.

## Vehicle Sensing and Sensor Calibration (`D166:vehicle-sensing-and-sensor-calibration`)

**Boundary:** Acquire, synchronize, calibrate and preprocess sensor signals and maintain the sensor hardware/data interfaces used by automated-driving systems.

| Family | Horizon | Disposition | Mapping IDs | Query IDs |
|---|---|---|---|---|
| `foundations_knowledge_and_competencies` | established/traditional | `mapped` | `D166-A1-SENSING-FOUNDATIONS-ESTABLISHED` | `D166-Q047`, `D166-A-QPACK-CLOSE-005` |
| `foundations_knowledge_and_competencies` | current | `mapped` | `D166-A-MAP-002` | `D166-Q047` |
| `foundations_knowledge_and_competencies` | emerging | `mapped` | `D166-A-MAP-003` | `D166-Q047` |
| `foundations_knowledge_and_competencies` | future/futuristic | `bounded_no_hit` |  | `D166-Q047`, `D166-A-QPACK-CLOSE-005` |
| `methods_and_designs` | established/traditional | `mapped` | `D166-A-MAP-014` | `D166-Q047`, `D166-A-QPACK-CLOSE-001`, `D166-A-QPACK-CLOSE-005` |
| `methods_and_designs` | current | `mapped` | `D166-A-MAP-005` | `D166-Q047` |
| `methods_and_designs` | emerging | `mapped` | `D166-A-MAP-006` | `D166-Q047` |
| `methods_and_designs` | future/futuristic | `bounded_no_hit` |  | `D166-A-QPACK-CLOSE-005` |
| `techniques_estimators_and_algorithms` | established/traditional | `mapped` | `D166-A1-SENSING-CLOSE-ALGO-EST` | `D166-Q047`, `D166-A-QPACK-CLOSE-001` |
| `techniques_estimators_and_algorithms` | current | `mapped` | `D166-A1-SENSING-TECHNIQUES-CURRENT` | `D166-Q047`, `D166-A-QPACK-CLOSE-005` |
| `techniques_estimators_and_algorithms` | emerging | `mapped` | `D166-A-MAP-009` | `D166-Q047` |
| `techniques_estimators_and_algorithms` | future/futuristic | `bounded_no_hit` |  | `D166-Q047`, `D166-A-QPACK-CLOSE-005` |
| `tools_software_and_data` | established/traditional | `mapped` | `D166-A1-SENSING-TOOLS-ESTABLISHED` | `D166-A-QPACK-CLOSE-005` |
| `tools_software_and_data` | current | `mapped` | `D166-A-MAP-010`, `D166-A-MAP-016`, `D166-A1-SENSING-CLOSE-OPENCALIB-TOOL`, `D166-A1-SENSING-TOOLS-CURRENT-FRAUNHOFER` | `D166-Q047`, `D166-A-QPACK-CLOSE-001`, `D166-A-QPACK-CLOSE-005` |
| `tools_software_and_data` | emerging | `bounded_no_hit` |  | `D166-A-QPACK-CLOSE-005`, `D166-Q047` |
| `tools_software_and_data` | future/futuristic | `bounded_no_hit` |  | `D166-Q047`, `D166-A-QPACK-CLOSE-005` |
| `standards_credentials_and_learning_resources` | established/traditional | `mapped` | `D166-A1-SENSING-LEARNING-ESTABLISHED` | `D166-A-QPACK-CLOSE-005` |
| `standards_credentials_and_learning_resources` | current | `mapped` | `D166-A-MAP-012`, `D166-A1-SENSING-NBTE-LEARNING-CURRENT`, `D166-A1-SENSING-SON-RESOURCE-CURRENT` | `D166-Q057`, `D166-A-QPACK-CLOSE-005` |
| `standards_credentials_and_learning_resources` | emerging | `bounded_no_hit` |  | `D166-Q057`, `D166-A-QPACK-CLOSE-005` |
| `standards_credentials_and_learning_resources` | future/futuristic | `bounded_no_hit` |  | `D166-A-QPACK-CLOSE-005` |
| `outputs_and_downstream_role_context` | established/traditional | `mapped` | `D166-A1-SENSING-OUTPUT-ESTABLISHED` | `D166-A-QPACK-CLOSE-005` |
| `outputs_and_downstream_role_context` | current | `mapped` | `D166-A-MAP-013` | `D166-Q047` |
| `outputs_and_downstream_role_context` | emerging | `mapped` | `D166-A1-SENSING-OUTPUT-EMERGING` | `D166-Q047`, `D166-A-QPACK-CLOSE-005` |
| `outputs_and_downstream_role_context` | future/futuristic | `bounded_no_hit` |  | `D166-A-QPACK-CLOSE-005` |

### Cell-by-cell claims and no-hit scope

#### `foundations_knowledge_and_competencies` / `established/traditional` - `mapped`

Candidate source IDs: `D166-AUTOWARE-SENSOR-CALIBRATION-TUTORIAL`, `D166-ROS-REP-145-IMU-CONVENTIONS`, `D166-IEEE-SENSOR-TEMPORAL-MISALIGNMENT-2024`, `D166-ROS-REP-103-COORDINATE-CONVENTIONS`. Query IDs: `D166-Q047`, `D166-A-QPACK-CLOSE-005`.

- **D166-A1-SENSING-FOUNDATIONS-ESTABLISHED:** A foundational sensing integration concept is that sensor data must have defined coordinate conventions/transforms before it can be combined; ROS REP 103 documents standard units, coordinate frames and axis conventions, while Autoware places sensor transforms in its vehicle/sensor model. **Item type:** knowledge/competency concept. **Inputs:** Not applicable as a computational interface; the cited item is a knowledge, standard, or learning-resource claim. **Outputs:** The source-supported knowledge/criterion/learning scope is the claim text itself; no software output or interface is inferred. **Assumptions/limits:** Source-specific conditions and non-generalization limits: REP 103 is a ROS convention; it does not specify every automotive coordinate frame or calibration method. **Source(s):** `D166-ROS-REP-103-COORDINATE-CONVENTIONS`. **Exact locator:** ROS REP 103 coordinate conventions (official ROS Enhancement Proposal, page opened in prior pass) and Autoware calibration overview lines 677?679. **Relationship evidence:** `context_only`; Specific calibration knowledge, tool or output only; no general learner dependency or role-fit inference. Source(s): `D166-ROS-REP-103-COORDINATE-CONVENTIONS`; locator: ROS REP 103 coordinate conventions (official ROS Enhancement Proposal, page opened in prior pass) and Autoware calibration overview lines 677?679..

#### `foundations_knowledge_and_competencies` / `current` - `mapped`

Candidate source IDs: `D166-AUTOWARE-SENSOR-CALIBRATION-TUTORIAL`, `D166-ROS-REP-145-IMU-CONVENTIONS`, `D166-IEEE-SENSOR-TEMPORAL-MISALIGNMENT-2024`. Query IDs: `D166-Q047`.

- **D166-A-MAP-002:** Autoware calibration workflows produce sensor transforms and aligned sensor inputs for integration; the tutorial documents supported LiDAR, camera and IMU pairings and configuration-specific procedures. **Item type:** knowledge/competency concept. **Inputs:** Not applicable as a computational interface; the cited item is a knowledge, standard, or learning-resource claim. **Outputs:** The source-supported knowledge/criterion/learning scope is the claim text itself; no software output or interface is inferred. **Assumptions/limits:** Source-specific conditions and non-generalization limits: Autoware-specific workflows and supported hardware/configuration; does not establish that every sensor stack uses identical procedures or calibrations. **Source(s):** `D166-AUTOWARE-SENSOR-CALIBRATION-TUTORIAL`. **Exact locator:** Current integration tutorial and linked lidar-lidar, ground-plane/lidar, intrinsic-camera, lidar-camera and lidar-IMU calibration workflows; inspected 2026-10-23. **Relationship evidence:** `context_only`; This mapping connects one source claim to one area/family/horizon cell; it asserts no item-to-item prerequisite, alternative, complement or producer-consumer relationship. Source(s): `D166-AUTOWARE-SENSOR-CALIBRATION-TUTORIAL`; locator: Current integration tutorial and linked lidar-lidar, ground-plane/lidar, intrinsic-camera, lidar-camera and lidar-IMU calibration workflows; inspected 2026-10-23..

#### `foundations_knowledge_and_competencies` / `emerging` - `mapped`

Candidate source IDs: `D166-MEASUREMENT-SENSOR-CALIBRATION-SURVEY-2026`, `D166-MEASUREMENT-SENSOR-CALIBRATION-SURVEY-2026`. Query IDs: `D166-Q047`.

- **D166-A-MAP-003:** The survey abstract classifies calibration knowledge into target-based and targetless geometry, learning-assisted alignment, cooperative calibration and online spatiotemporal estimation; it is a methods taxonomy, not a foundational skill standard. **Item type:** knowledge/competency concept. **Inputs:** Not applicable as a computational interface; the cited item is a knowledge, standard, or learning-resource claim. **Outputs:** The source-supported knowledge/criterion/learning scope is the claim text itself; no software output or interface is inferred. **Assumptions/limits:** Source-specific conditions and non-generalization limits: Detailed study counts, accuracy comparisons, maturity and performance claims are not used from the abstract. Review appears broad but full-text methods and references need inspection; V2X calibration is conditional on cooperative-sensing architecture. **Source(s):** `D166-MEASUREMENT-SENSOR-CALIBRATION-SURVEY-2026`. **Exact locator:** Publisher record and abstract inspected 2026-10-23; full text is paywalled. Abstract categorizes target-based and targetless geometric calibration, learned alignment, cooperative V2X calibration and online spatiotemporal estimation. **Relationship evidence:** `context_only`; This mapping connects one source claim to one area/family/horizon cell; it asserts no item-to-item prerequisite, alternative, complement or producer-consumer relationship. Source(s): `D166-MEASUREMENT-SENSOR-CALIBRATION-SURVEY-2026`; locator: Publisher record and abstract inspected 2026-10-23; full text is paywalled. Abstract categorizes target-based and targetless geometric calibration, learned alignment, cooperative V2X calibration and online spatiotemporal estimation..

#### `foundations_knowledge_and_competencies` / `future/futuristic` - `bounded_no_hit`

Candidate source IDs: `D166-MEASUREMENT-SENSOR-CALIBRATION-SURVEY-2026`. Query IDs: `D166-Q047`, `D166-A-QPACK-CLOSE-005`.

- **Bounded rationale:** Search included 2026 calibration-survey preview, 2026 sensor-centric review result, automotive sensor roadmaps, official frame standards and current calibration documents; full future technical claims were not inferred from abstracts.

- **Bounded rationale:** Limits: bounded English-language search on 2026-10-24; not a claim that no such future work/resource exists.

#### `methods_and_designs` / `established/traditional` - `mapped`

Candidate source IDs: `D166-AUTOWARE-SENSOR-CALIBRATION-TUTORIAL`, `D166-MEASUREMENT-SENSOR-CALIBRATION-SURVEY-2026`, `D166-IEEE-SENSOR-TEMPORAL-MISALIGNMENT-2024`, `D166-A1-BILESCHI-LIDAR-VIDEO-2009`. Query IDs: `D166-Q047`, `D166-A-QPACK-CLOSE-001`, `D166-A-QPACK-CLOSE-005`.

- **D166-A-MAP-014:** A historical vehicle-focused design estimates the geometric mapping between LiDAR and video without calibration objects, using staged parameter estimation; the evidence is one 2009 conference method. **Item type:** method/system design. **Inputs:** Source-named input/context terms: lidar, map. These terms come from the claim; no additional input is inferred. **Outputs:** Source claim: A historical vehicle-focused design estimates the geometric mapping between LiDAR and video without calibration objects, using staged parameter estimation; the evidence is one 2009 conference method. **Assumptions/limits:** Source-specific conditions and non-generalization limits: Abstract-only; no full method derivation, convergence conditions, quantitative comparison or reproducibility review. One study does not establish universal targetless calibration practice. **Source(s):** `D166-A1-BILESCHI-LIDAR-VIDEO-2009`. **Exact locator:** MIT DSpace record, final-published-version metadata and abstract, especially lines 52?55; full paper not inspected. **Relationship evidence:** `context_only`; The method estimates a transform useful to align two sensor streams; the abstract does not claim a prerequisite, alternative equivalence or learner-sequence dependency. Source(s): `D166-A1-BILESCHI-LIDAR-VIDEO-2009`; locator: MIT DSpace record, final-published-version metadata and abstract, especially lines 52?55; full paper not inspected..

#### `methods_and_designs` / `current` - `mapped`

Candidate source IDs: `D166-AUTOWARE-SENSOR-CALIBRATION-TUTORIAL`, `D166-MEASUREMENT-SENSOR-CALIBRATION-SURVEY-2026`, `D166-IEEE-SENSOR-TEMPORAL-MISALIGNMENT-2024`. Query IDs: `D166-Q047`.

- **D166-A-MAP-005:** The Autoware tutorial presents an implementation workflow for selecting a supported sensor pair, configuring calibration nodes and validating the resulting transform within that stack. **Item type:** method/system design. **Inputs:** Source-named input/context terms: sensor. These terms come from the claim; no additional input is inferred. **Outputs:** No separate output/interface is stated in the inspected claim/locator; none is inferred. **Assumptions/limits:** Source-specific conditions and non-generalization limits: Autoware-specific workflows and supported hardware/configuration; does not establish that every sensor stack uses identical procedures or calibrations. **Source(s):** `D166-AUTOWARE-SENSOR-CALIBRATION-TUTORIAL`. **Exact locator:** Current integration tutorial and linked lidar-lidar, ground-plane/lidar, intrinsic-camera, lidar-camera and lidar-IMU calibration workflows; inspected 2026-10-23. **Relationship evidence:** `context_only`; This mapping connects one source claim to one area/family/horizon cell; it asserts no item-to-item prerequisite, alternative, complement or producer-consumer relationship. Source(s): `D166-AUTOWARE-SENSOR-CALIBRATION-TUTORIAL`; locator: Current integration tutorial and linked lidar-lidar, ground-plane/lidar, intrinsic-camera, lidar-camera and lidar-IMU calibration workflows; inspected 2026-10-23..

#### `methods_and_designs` / `emerging` - `mapped`

Candidate source IDs: `D166-AUTOWARE-SENSOR-CALIBRATION-TUTORIAL`, `D166-MEASUREMENT-SENSOR-CALIBRATION-SURVEY-2026`, `D166-IEEE-SENSOR-TEMPORAL-MISALIGNMENT-2024`, `D166-A1-CALIBREFINE-ARXIV-2025`, `D166-MEASUREMENT-SENSOR-CALIBRATION-SURVEY-2026`. Query IDs: `D166-Q047`.

- **D166-A-MAP-006:** CalibRefine is a proposed online targetless LiDAR-camera calibration design: object correspondences initialize a coarse homography, followed by iterative and attention-driven refinement as frames arrive. **Item type:** method/system design. **Inputs:** Source-named input/context terms: camera, lidar. These terms come from the claim; no additional input is inferred. **Outputs:** No separate output/interface is stated in the inspected claim/locator; none is inferred. **Assumptions/limits:** Source-specific conditions and non-generalization limits: Abstract-only and preprint evidence. Dataset names, protocol, baselines, metrics, ablations, failure modes and reproducibility were not verified from the paper; abstract-reported superiority is not independently assessed and does not establish production maturity or a universal calibration method. **Source(s):** `D166-A1-CALIBREFINE-ARXIV-2025`. **Exact locator:** arXiv abstract lines 3-7: four-stage feature matching, homography initialization, iterative update and attention-based refinement; abstract reports experiments on two urban traffic datasets. **Relationship evidence:** `context_only`; This mapping connects one source claim to one area/family/horizon cell; it asserts no item-to-item prerequisite, alternative, complement or producer-consumer relationship. Source(s): `D166-A1-CALIBREFINE-ARXIV-2025`; locator: arXiv abstract lines 3-7: four-stage feature matching, homography initialization, iterative update and attention-based refinement; abstract reports experiments on two urban traffic datasets..

#### `methods_and_designs` / `future/futuristic` - `bounded_no_hit`

Candidate source IDs: . Query IDs: `D166-A-QPACK-CLOSE-005`.

- **Bounded rationale:** Counter-search covered future 2030/2035 sensor-roadmap and calibration/self-calibration queries plus current primary documentation; future method claims remain forecasts/research directions.

- **Bounded rationale:** Limits: bounded English-language search on 2026-10-24; not a claim that no such future work/resource exists.

#### `techniques_estimators_and_algorithms` / `established/traditional` - `mapped`

Candidate source IDs: `D166-AUTOWARE-SENSOR-CALIBRATION-TUTORIAL`, `D166-MEASUREMENT-SENSOR-CALIBRATION-SURVEY-2026`, `D166-IEEE-SENSOR-TEMPORAL-MISALIGNMENT-2024`, `D166-A1-BILESCHI-LIDAR-VIDEO-2009`. Query IDs: `D166-Q047`, `D166-A-QPACK-CLOSE-001`.

- **D166-A1-SENSING-CLOSE-ALGO-EST:** The Bileschi abstract reports staged bootstrap estimation of a targetless LiDAR?video association, estimating camera pose, focal parameters and radial distortion. **Item type:** technique/estimator/algorithm. **Inputs:** Source-named input/context terms: camera, lidar. These terms come from the claim; no additional input is inferred. **Outputs:** Source claim: The Bileschi abstract reports staged bootstrap estimation of a targetless LiDAR?video association, estimating camera pose, focal parameters and radial distortion. **Assumptions/limits:** Source-specific conditions and non-generalization limits: Abstract-only; exact solver, observability, objective, measured errors and failure cases are unreviewed. **Source(s):** `D166-A1-BILESCHI-LIDAR-VIDEO-2009`. **Exact locator:** MIT DSpace final paper record, Abstract lines 52?55; full paper not inspected. **Relationship evidence:** `context_only`; No universal prerequisite or student sequence is inferred. Source(s): `D166-A1-BILESCHI-LIDAR-VIDEO-2009`; locator: MIT DSpace final paper record, Abstract lines 52?55; full paper not inspected..

#### `techniques_estimators_and_algorithms` / `current` - `mapped`

Candidate source IDs: `D166-AUTOWARE-SENSOR-CALIBRATION-TUTORIAL`, `D166-MEASUREMENT-SENSOR-CALIBRATION-SURVEY-2026`, `D166-IEEE-SENSOR-TEMPORAL-MISALIGNMENT-2024`. Query IDs: `D166-Q047`, `D166-A-QPACK-CLOSE-005`.

- **D166-A1-SENSING-TECHNIQUES-CURRENT:** Autoware documentation identifies a current LiDAR?LiDAR calibration technique based on local mapping and GICP, a LiDAR?IMU continuous-time batch optimization jointly minimizing IMU-based and LiDAR point-to-surfel costs, and automatic base?LiDAR roll/pitch/z ground-plane estimation. **Item type:** technique/estimator/algorithm. **Inputs:** Source-named input/context terms: lidar, imu, map. These terms come from the claim; no additional input is inferred. **Outputs:** No separate output/interface is stated in the inspected claim/locator; none is inferred. **Assumptions/limits:** Source-specific conditions and non-generalization limits: Technique selection and applicability are package/sensor/configuration-specific; no independent comparative accuracy analysis was run. **Source(s):** `D166-AUTOWARE-SENSOR-CALIBRATION-TUTORIAL`. **Exact locator:** Official Autoware calibration tutorial, lines 703?746, opened 2026-10-24. **Relationship evidence:** `context_only`; Specific calibration knowledge, tool or output only; no general learner dependency or role-fit inference. Source(s): `D166-AUTOWARE-SENSOR-CALIBRATION-TUTORIAL`; locator: Official Autoware calibration tutorial, lines 703?746, opened 2026-10-24..

#### `techniques_estimators_and_algorithms` / `emerging` - `mapped`

Candidate source IDs: `D166-AUTOWARE-SENSOR-CALIBRATION-TUTORIAL`, `D166-MEASUREMENT-SENSOR-CALIBRATION-SURVEY-2026`, `D166-IEEE-SENSOR-TEMPORAL-MISALIGNMENT-2024`, `D166-A1-CALIBREFINE-ARXIV-2025`, `D166-MEASUREMENT-SENSOR-CALIBRATION-SURVEY-2026`. Query IDs: `D166-Q047`.

- **D166-A-MAP-009:** The CalibRefine abstract identifies feature matching, homography initialization, iterative updates and attention-based post-refinement as the algorithmic steps; detailed performance and failure modes remain unverified. **Item type:** technique/estimator/algorithm. **Inputs:** No concrete input is stated in the inspected claim/locator; none is inferred. **Outputs:** No separate output/interface is stated in the inspected claim/locator; none is inferred. **Assumptions/limits:** Source-specific conditions and non-generalization limits: Abstract-only and preprint evidence. Dataset names, protocol, baselines, metrics, ablations, failure modes and reproducibility were not verified from the paper; abstract-reported superiority is not independently assessed and does not establish production maturity or a universal calibration method. **Source(s):** `D166-A1-CALIBREFINE-ARXIV-2025`. **Exact locator:** arXiv abstract lines 3-7: four-stage feature matching, homography initialization, iterative update and attention-based refinement; abstract reports experiments on two urban traffic datasets. **Relationship evidence:** `context_only`; This mapping connects one source claim to one area/family/horizon cell; it asserts no item-to-item prerequisite, alternative, complement or producer-consumer relationship. Source(s): `D166-A1-CALIBREFINE-ARXIV-2025`; locator: arXiv abstract lines 3-7: four-stage feature matching, homography initialization, iterative update and attention-based refinement; abstract reports experiments on two urban traffic datasets..

#### `techniques_estimators_and_algorithms` / `future/futuristic` - `bounded_no_hit`

Candidate source IDs: `D166-MEASUREMENT-SENSOR-CALIBRATION-SURVEY-2026`. Query IDs: `D166-Q047`, `D166-A-QPACK-CLOSE-005`.

- **Bounded rationale:** Counter-search included future online self-calibration, learned corrections and sensor-horizon sources; no future validated algorithm was supported within the examined sources.

- **Bounded rationale:** Limits: bounded English-language search on 2026-10-24; not a claim that no such future work/resource exists.

#### `tools_software_and_data` / `established/traditional` - `mapped`

Candidate source IDs: `D166-A1-CMU-LASER-CAMERA-TOOLBOX-2006`. Query IDs: `D166-A-QPACK-CLOSE-005`.

- **D166-A1-SENSING-TOOLS-ESTABLISHED:** CMU?s Matlab Laser-Camera Calibration Toolbox v1.1 is a historical graphical tool for camera-to-laser extrinsic calibration, with source, documentation, sample/test data and explicit axis assumptions; last updated in 2006. **Item type:** software/tool/platform. **Inputs:** Source-named input/context terms: camera. These terms come from the claim; no additional input is inferred. **Outputs:** No separate output/interface is stated in the inspected claim/locator; none is inferred. **Assumptions/limits:** Source-specific conditions and non-generalization limits: Not maintained evidence; old MATLAB compatibility, camera?laser scope and coordinate assumptions limit relevance to current AV stacks. **Source(s):** `D166-A1-CMU-LASER-CAMERA-TOOLBOX-2006`. **Exact locator:** Official CMU LCCT project page, What and Why, Software, FAQ and Changelist; opened 2026-10-24. **Relationship evidence:** `context_only`; Specific calibration knowledge, tool or output only; no general learner dependency or role-fit inference. Source(s): `D166-A1-CMU-LASER-CAMERA-TOOLBOX-2006`; locator: Official CMU LCCT project page, What and Why, Software, FAQ and Changelist; opened 2026-10-24..

#### `tools_software_and_data` / `current` - `mapped`

Candidate source IDs: `D166-AUTOWARE-SENSOR-CALIBRATION-TUTORIAL`, `D166-NIST-LIDAR-EVALUATION-2025`, `D166-A1-RAINSENSE-ZENODO-2025`, `D166-A1-OPENCALIB-ARXIV-2022`, `D166-A1-FRAUNHOFER-MULTISENSOR-CALIBRATION-2025`. Query IDs: `D166-Q047`, `D166-A-QPACK-CLOSE-001`, `D166-A-QPACK-CLOSE-005`.

- **D166-A-MAP-010:** A versioned public record describes a RainSense package containing camera, LiDAR and radar data and rainfall-intensity annotation files, with a 493 MB archive and linked v1.0.0 repository. **Item type:** dataset/benchmark. **Inputs:** Source-named input/context terms: camera, lidar, radar. These terms come from the claim; no additional input is inferred. **Outputs:** No separate output/interface is stated in the inspected claim/locator; none is inferred. **Assumptions/limits:** Source-specific conditions and non-generalization limits: The Zenodo Rights/License field is not populated in the opened record; download/access conditions and redistribution rights require checking the linked repository and files before use. Repository metadata does not prove annotation quality or benchmark representativeness. **Source(s):** `D166-A1-RAINSENSE-ZENODO-2025`. **Exact locator:** Zenodo record v1.0.0, Description, Files and External resources: camera/LiDAR/radar, rainfall-intensity labels, example cases, archive and linked GitHub v1.0.0. **Relationship evidence:** `context_only`; This mapping connects one source claim to one area/family/horizon cell; it asserts no item-to-item prerequisite, alternative, complement or producer-consumer relationship. Source(s): `D166-A1-RAINSENSE-ZENODO-2025`; locator: Zenodo record v1.0.0, Description, Files and External resources: camera/LiDAR/radar, rainfall-intensity labels, example cases, archive and linked GitHub v1.0.0..

- **D166-A-MAP-016:** The current Autoware integration documentation enumerates concrete calibration software workflows: manual/interactive/tag-based LiDAR?camera, LiDAR?LiDAR, ground-plane?LiDAR, intrinsic-camera and LiDAR?IMU tools, including linked package/tool references. **Item type:** software/tool/platform. **Inputs:** Source-named input/context terms: camera, lidar, imu. These terms come from the claim; no additional input is inferred. **Outputs:** No separate output/interface is stated in the inspected claim/locator; none is inferred. **Assumptions/limits:** Source-specific conditions and non-generalization limits: One open-source stack?s current documentation; package maintenance/version/license, performance and support beyond the described workflow were not separately audited. It does not establish a universal toolchain. **Source(s):** `D166-AUTOWARE-SENSOR-CALIBRATION-TUTORIAL`. **Exact locator:** Official Autoware ?Calibrating your sensors? documentation opened 2026-10-24; page navigation/workflow sections for calibration tools; specific LiDAR?camera instructions link to launch configuration and point selection. **Relationship evidence:** `context_only`; The tools estimate/configure sensor transforms used by downstream stack components; no student prerequisite or universal tool dependency is asserted. Source(s): `D166-AUTOWARE-SENSOR-CALIBRATION-TUTORIAL`; locator: Official Autoware ?Calibrating your sensors? documentation opened 2026-10-24; page navigation/workflow sections for calibration tools; specific LiDAR?camera instructions link to launch configuration and point selection..

- **D166-A1-SENSING-CLOSE-OPENCALIB-TOOL:** OpenCalib authors describe an open-source calibration toolbox with manual, automatic, factory and online tool variants and an associated calibration benchmark dataset. **Item type:** dataset/benchmark. **Inputs:** No concrete input is stated in the inspected claim/locator; none is inferred. **Outputs:** No separate output/interface is stated in the inspected claim/locator; none is inferred. **Assumptions/limits:** Source-specific conditions and non-generalization limits: Abstract-only; current repository status, license, installability, modality support and benchmark contents were not checked. **Source(s):** `D166-A1-OPENCALIB-ARXIV-2022`. **Exact locator:** arXiv:2205.14087 abstract lines 16?18; full paper/code repository not inspected. **Relationship evidence:** `context_only`; No universal prerequisite or student sequence is inferred. Source(s): `D166-A1-OPENCALIB-ARXIV-2022`; locator: arXiv:2205.14087 abstract lines 16?18; full paper/code repository not inspected..

- **D166-A1-SENSING-TOOLS-CURRENT-FRAUNHOFER:** Fraunhofer IOSB documents an actively maintained BSD-3-Clause toolbox for assisted target-based camera/LiDAR, LiDAR/LiDAR, reference and prototype LiDAR/vehicle calibration, with ROS 2 apt installation. **Item type:** software/tool/platform. **Inputs:** Source-named input/context terms: camera, lidar. These terms come from the claim; no additional input is inferred. **Outputs:** No separate output/interface is stated in the inspected claim/locator; none is inferred. **Assumptions/limits:** Source-specific conditions and non-generalization limits: Developed for large-scale off-road robotics; LiDAR?vehicle support is prototype and not road-vehicle qualification. **Source(s):** `D166-A1-FRAUNHOFER-MULTISENSOR-CALIBRATION-2025`. **Exact locator:** Official Fraunhofer IOSB toolbox documentation, About/License/Getting Started/Maintainer sections, lines 4?41. **Relationship evidence:** `context_only`; Specific calibration knowledge, tool or output only; no general learner dependency or role-fit inference. Source(s): `D166-A1-FRAUNHOFER-MULTISENSOR-CALIBRATION-2025`; locator: Official Fraunhofer IOSB toolbox documentation, About/License/Getting Started/Maintainer sections, lines 4?41..

#### `tools_software_and_data` / `emerging` - `bounded_no_hit`

Candidate source IDs: `D166-AUTOWARE-SENSOR-CALIBRATION-TUTORIAL`, `D166-NIST-LIDAR-EVALUATION-2025`, `D166-MEASUREMENT-SENSOR-CALIBRATION-SURVEY-2026`, `D166-A1-RAINSENSE-ZENODO-2025`. Query IDs: `D166-A-QPACK-CLOSE-005`, `D166-Q047`.

- **Bounded rationale:** Bounded no-hit for tools_software_and_data at emerging. Checked: D166-AUTOWARE-SENSOR-CALIBRATION-TUTORIAL: checked as Autoware calibration workflows produce sensor transforms and aligned sensor inputs for integration; the tutorial documents supported LiDAR, camera and IMU pairings and configuratio; limit: Autoware-specific workflows and supported hardware/configuration; does not establish that every sensor stack uses identical proced | D166-NIST-LIDAR-EVALUATION-2025: checked as NIST?s 2025 paper abstract says an automotive LiDAR testbed and static evaluation procedures were developed to assess perception sensors against needs including high-fidelity data,; limit: Abstract-only; exact measurement procedures, metrics, test matrix and downloadable testbed/software were not inspected; no thresho | D166-MEASUREMENT-SENSOR-CALIBRATION-SURVEY-2026: checked as The survey abstract classifies calibration knowledge into target-based and targetless geometry, learning-assisted alignment, cooperative calibration and online spatiotemporal estim; limit: Detailed study counts, accuracy comparisons, maturity and performance claims are not used from the abstract. Review appears broad  | D166-A1-RAINSENSE-ZENODO-2025: checked as A versioned public record describes a RainSense package containing camera, LiDAR and radar data and rainfall-intensity annotation files, with a 493 MB archive and linked v1.0.0 rep; limit: The Zenodo Rights/License field is not populated in the opened record; download/access conditions and redistribution rights requir. Query IDs: D166-A-QPACK-CLOSE-005, D166-Q047. The candidates support other source types, current contexts, or limited abstracts as stated above; none supports a distinct, correctly typed claim for this exact cell. Search is bounded to the linked opened records and dates, not global absence.

#### `tools_software_and_data` / `future/futuristic` - `bounded_no_hit`

Candidate source IDs: `D166-MEASUREMENT-SENSOR-CALIBRATION-SURVEY-2026`. Query IDs: `D166-Q047`, `D166-A-QPACK-CLOSE-005`.

- **Bounded rationale:** Search examined Autoware, Fraunhofer, CMU, NIST, standards and future sensor-roadmap records; absent item claim is limited to those opened sources.

- **Bounded rationale:** Limits: bounded English-language search on 2026-10-24; not a claim that no such future work/resource exists.

#### `standards_credentials_and_learning_resources` / `established/traditional` - `mapped`

Candidate source IDs: `D166-ROS-REP-103-COORDINATE-CONVENTIONS`. Query IDs: `D166-A-QPACK-CLOSE-005`.

- **D166-A1-SENSING-LEARNING-ESTABLISHED:** ROS REP 103 is an established robotics reference for standard SI units and coordinate conventions used to keep sensor poses and measurements interpretable across components. **Item type:** standard/regulatory reference. **Inputs:** Not applicable as a computational interface; the cited item is a knowledge, standard, or learning-resource claim. **Outputs:** The source-supported knowledge/criterion/learning scope is the claim text itself; no software output or interface is inferred. **Assumptions/limits:** Source-specific conditions and non-generalization limits: ROS convention is not a vehicle regulation or calibration credential; automotive stacks may define additional frames. **Source(s):** `D166-ROS-REP-103-COORDINATE-CONVENTIONS`. **Exact locator:** Official ROS REP 103 page, coordinate conventions; opened 2026-10-23/24. **Relationship evidence:** `context_only`; Specific calibration knowledge, tool or output only; no general learner dependency or role-fit inference. Source(s): `D166-ROS-REP-103-COORDINATE-CONVENTIONS`; locator: Official ROS REP 103 page, coordinate conventions; opened 2026-10-23/24..

#### `standards_credentials_and_learning_resources` / `current` - `mapped`

Candidate source IDs: `D166-ISO-23150-20-SENSOR-INTERFACES-2026`, `D166-IEEE-1588-2019-PTP`, `D166-ROS-REP-103-COORDINATE-CONVENTIONS`, `D166-IEEE-3184-1-ROADSIDE-CALIBRATION-2025`, `D166-A1-NBTE-NSQ-ADAS-CALIBRATION-2024`, `D166-A1-SON-NMI-CALIBRATION-SCOPE-2026`. Query IDs: `D166-Q057`, `D166-A-QPACK-CLOSE-005`.

- **D166-A-MAP-012:** Current vehicle-specific interface standard connecting sensor performance/health/calibration metadata and input contracts to downstream perception/fusion systems. **Item type:** standard/regulatory reference. **Inputs:** Not applicable as a computational interface; the cited item is a knowledge, standard, or learning-resource claim. **Outputs:** The source-supported knowledge/criterion/learning scope is the claim text itself; no software output or interface is inferred. **Assumptions/limits:** Source-specific conditions and non-generalization limits: Paid standard; abstract-level content only. Does not set sensor performance acceptance thresholds or electrical/mechanical interfaces; check exact platform adoption and parts/edition before implementation. **Source(s):** `D166-ISO-23150-20-SENSOR-INTERFACES-2026`. **Exact locator:** Official ISO committee catalogue/abstract inspected 2026-10-24; published 2026-06 for road vehicles with automated driving functions. Specifies sensor performance, health and calibration interfaces and a common sensor input interface; explicitly excludes electrical/mechanical interface specifications. **Relationship evidence:** `context_only`; This mapping connects one source claim to one area/family/horizon cell; it asserts no item-to-item prerequisite, alternative, complement or producer-consumer relationship. Source(s): `D166-ISO-23150-20-SENSOR-INTERFACES-2026`; locator: Official ISO committee catalogue/abstract inspected 2026-10-24; published 2026-06 for road vehicles with automated driving functions. Specifies sensor performance, health and calibration interfaces and a common sensor input interface; explicitly excludes electrical/mechanical interface specifications..

- **D166-A1-SENSING-NBTE-LEARNING-CURRENT:** Nigeria?s NBTE NSQ Level 3 Digital Automotive Diagnosis includes an ADAS diagnostics unit; its learning criteria cover target alignment for radar/camera/LiDAR, OEM software, dynamic calibration and post-calibration accuracy/function checks. **Item type:** credential/learning resource. **Inputs:** Not applicable as a computational interface; the cited item is a knowledge, standard, or learning-resource claim. **Outputs:** The source-supported knowledge/criterion/learning scope is the claim text itself; no software output or interface is inferred. **Assumptions/limits:** Source-specific conditions and non-generalization limits: Technician-level ADAS diagnosis/repair, not autonomous-driving sensor-fusion engineering, university curriculum, formal AV type approval or a canonical D166 role route. **Source(s):** `D166-A1-NBTE-NSQ-ADAS-CALIBRATION-2024`. **Exact locator:** Official NBTE/Digital NBTE 60-page NSQ Level 3 PDF, pp. 1?4 and 46?48, especially criteria 3.1?3.4 and 4.3; opened 2026-10-24. **Relationship evidence:** `context_only`; Specific calibration knowledge, tool or output only; no general learner dependency or role-fit inference. Source(s): `D166-A1-NBTE-NSQ-ADAS-CALIBRATION-2024`; locator: Official NBTE/Digital NBTE 60-page NSQ Level 3 PDF, pp. 1?4 and 46?48, especially criteria 3.1?3.4 and 4.3; opened 2026-10-24..

- **D166-A1-SENSING-SON-RESOURCE-CURRENT:** SON?s National Metrology Institute states its current calibration service fields as mass, length, temperature and pressure and identifies national measurement-standard/traceability functions; the listed page does not identify automotive AV sensor calibration. **Item type:** standard/regulatory reference. **Inputs:** Not applicable as a computational interface; the cited item is a knowledge, standard, or learning-resource claim. **Outputs:** The source-supported knowledge/criterion/learning scope is the claim text itself; no software output or interface is inferred. **Assumptions/limits:** Source-specific conditions and non-generalization limits: Does not prove no local private sensor-calibration provider exists; generic metrology fields are not AV sensor calibration. **Source(s):** `D166-A1-SON-NMI-CALIBRATION-SCOPE-2026`. **Exact locator:** Official SON NMI page, current calibration fields and functions; opened 2026-10-24. **Relationship evidence:** `context_only`; Specific calibration knowledge, tool or output only; no general learner dependency or role-fit inference. Source(s): `D166-A1-SON-NMI-CALIBRATION-SCOPE-2026`; locator: Official SON NMI page, current calibration fields and functions; opened 2026-10-24..

#### `standards_credentials_and_learning_resources` / `emerging` - `bounded_no_hit`

Candidate source IDs: `D166-ISO-23150-20-SENSOR-INTERFACES-2026`, `D166-IEEE-1588-2019-PTP`, `D166-ROS-REP-103-COORDINATE-CONVENTIONS`, `D166-IEEE-3184-1-ROADSIDE-CALIBRATION-2025`. Query IDs: `D166-Q057`, `D166-A-QPACK-CLOSE-005`.

- **Bounded rationale:** Checked official ISO/IEEE standards pages, ROS conventions, NBTE national skill qualification, SON/NMI, NITT calendar and institutional curriculum/credentials; no additional emerging onboard AV calibration standard/resource was verified.

- **Bounded rationale:** Limits: bounded English-language search on 2026-10-24; not a claim that no such future work/resource exists.

#### `standards_credentials_and_learning_resources` / `future/futuristic` - `bounded_no_hit`

Candidate source IDs: . Query IDs: `D166-A-QPACK-CLOSE-005`.

- **Bounded rationale:** Checked official ISO/IEEE records and Nigerian NBTE/SON/NITT source pages plus future sensor-roadmap pages; scope is bounded to opened/indexed records.

- **Bounded rationale:** Limits: bounded English-language search on 2026-10-24; not a claim that no such future work/resource exists.

#### `outputs_and_downstream_role_context` / `established/traditional` - `mapped`

Candidate source IDs: `D166-A1-BILESCHI-LIDAR-VIDEO-2009`. Query IDs: `D166-A-QPACK-CLOSE-005`.

- **D166-A1-SENSING-OUTPUT-ESTABLISHED:** The historical LiDAR?video calibration design outputs a geometric association plus camera rotation/position, focal-length parameters and radial-distortion estimates that can align the two streams for multimodal interpretation. **Item type:** system output/downstream role-task context. **Inputs:** Source-named input/context terms: camera, lidar. These terms come from the claim; no additional input is inferred. **Outputs:** Source claim: The historical LiDAR?video calibration design outputs a geometric association plus camera rotation/position, focal-length parameters and radial-distortion estimates that can align the two streams for multimodal interpretation. **Assumptions/limits:** Source-specific conditions and non-generalization limits: Abstract-only; no exact consumer API, uncertainty format or generalized output contract was reviewed. **Source(s):** `D166-A1-BILESCHI-LIDAR-VIDEO-2009`. **Exact locator:** MIT DSpace record Abstract lines 52?55. **Relationship evidence:** `context_only`; Specific calibration knowledge, tool or output only; no general learner dependency or role-fit inference. Source(s): `D166-A1-BILESCHI-LIDAR-VIDEO-2009`; locator: MIT DSpace record Abstract lines 52?55..

#### `outputs_and_downstream_role_context` / `current` - `mapped`

Candidate source IDs: `D166-AUTOWARE-SENSOR-CALIBRATION-TUTORIAL`, `D166-NIST-LIDAR-EVALUATION-2025`. Query IDs: `D166-Q047`.

- **D166-A-MAP-013:** The calibration tutorial?s downstream product is a configured transform between supported sensor frames that downstream localization or perception components can consume in the documented Autoware setup. **Item type:** system output/downstream role-task context. **Inputs:** Source-named input/context terms: sensor. These terms come from the claim; no additional input is inferred. **Outputs:** No separate output/interface is stated in the inspected claim/locator; none is inferred. **Assumptions/limits:** Source-specific conditions and non-generalization limits: Autoware-specific workflows and supported hardware/configuration; does not establish that every sensor stack uses identical procedures or calibrations. **Source(s):** `D166-AUTOWARE-SENSOR-CALIBRATION-TUTORIAL`. **Exact locator:** Current integration tutorial and linked lidar-lidar, ground-plane/lidar, intrinsic-camera, lidar-camera and lidar-IMU calibration workflows; inspected 2026-10-23. **Relationship evidence:** `context_only`; This mapping connects one source claim to one area/family/horizon cell; it asserts no item-to-item prerequisite, alternative, complement or producer-consumer relationship. Source(s): `D166-AUTOWARE-SENSOR-CALIBRATION-TUTORIAL`; locator: Current integration tutorial and linked lidar-lidar, ground-plane/lidar, intrinsic-camera, lidar-camera and lidar-IMU calibration workflows; inspected 2026-10-23..

#### `outputs_and_downstream_role_context` / `emerging` - `mapped`

Candidate source IDs: `D166-AUTOWARE-SENSOR-CALIBRATION-TUTORIAL`, `D166-NIST-LIDAR-EVALUATION-2025`. Query IDs: `D166-Q047`, `D166-A-QPACK-CLOSE-005`.

- **D166-A1-SENSING-OUTPUT-EMERGING:** NIST?s 2025 paper abstract says an automotive LiDAR testbed and static evaluation procedures were developed to assess perception sensors against needs including high-fidelity data, low uncertainty/latency and robustness; these are evaluation outputs, not a vehicle?s runtime sensor interface. **Item type:** system output/downstream role-task context. **Inputs:** Source-named input/context terms: lidar, sensor. These terms come from the claim; no additional input is inferred. **Outputs:** Source claim: NIST?s 2025 paper abstract says an automotive LiDAR testbed and static evaluation procedures were developed to assess perception sensors against needs including high-fidelity data, low uncertainty/latency and robustness; these are evaluation outputs, not a vehicle?s runtime sensor interface. **Assumptions/limits:** Source-specific conditions and non-generalization limits: Abstract-only; exact measurement procedures, metrics, test matrix and downloadable testbed/software were not inspected; no threshold or compliance test is inferred. **Source(s):** `D166-NIST-LIDAR-EVALUATION-2025`. **Exact locator:** Official NIST publication page, title/authors/abstract and DOI; opened 2026-10-24. Full paper PDF download returned a 16.2 MB content-size fetch error. **Relationship evidence:** `context_only`; Specific calibration knowledge, tool or output only; no general learner dependency or role-fit inference. Source(s): `D166-NIST-LIDAR-EVALUATION-2025`; locator: Official NIST publication page, title/authors/abstract and DOI; opened 2026-10-24. Full paper PDF download returned a 16.2 MB content-size fetch error..

#### `outputs_and_downstream_role_context` / `future/futuristic` - `bounded_no_hit`

Candidate source IDs: . Query IDs: `D166-A-QPACK-CLOSE-005`.

- **Bounded rationale:** Searched ISO vehicle sensor interface, Autoware component documentation, NIST testbed abstract and future survey/roadmap sources; no future schema or accepted consumer contract was identified.

- **Bounded rationale:** Limits: bounded English-language search on 2026-10-24; not a claim that no such future work/resource exists.

### Six task tracks

#### `foundation_and_prerequisites` - `complete`

**Topic focus:** Sensor physics and measurement uncertainty; coordinate frames, rigid-body transforms, time synchronization, calibration targets, vehicle geometry, sampling and basic estimation/fusion prerequisites.
**Gap filler:** Search the area's source-defined task and skill requirements; extract underlying concepts, inputs, outputs and prerequisites. Separate true prerequisites from topics that are merely co-taught or often used together.
**Categories/horizons:** knowledge, competencies/skills, methods; established/traditional, current.
**Mapped cells:** foundations_knowledge_and_competencies / established/traditional; foundations_knowledge_and_competencies / current; methods_and_designs / established/traditional; methods_and_designs / current
**Assessed cells:** foundations_knowledge_and_competencies / established/traditional; foundations_knowledge_and_competencies / current; methods_and_designs / established/traditional; methods_and_designs / current
**Evidence IDs:** `D166-AUTOWARE-SENSOR-CALIBRATION-TUTORIAL`, `D166-ROS-REP-145-IMU-CONVENTIONS`, `D166-IEEE-SENSOR-TEMPORAL-MISALIGNMENT-2024`, `D166-ROS-REP-103-COORDINATE-CONVENTIONS`, `D166-MEASUREMENT-SENSOR-CALIBRATION-SURVEY-2026`, `D166-A1-BILESCHI-LIDAR-VIDEO-2009`
**Query IDs:** `D166-A-QPACK-01`, `D166-A-QPACK-03`, `D166-A-QPACK-05`, `D166-A-QPACK-07`, `D166-A-QPACK-CLOSE-001`, `D166-A-QPACK-CLOSE-005`
**Closure rationale:** Terminal complete disposition within original topic scope: reviewed 4 applicable cells (mapped=4). Mapped evidence is restricted to the linked claims; bounded no-hit cells record source/type/horizon exclusions and query limits. The dated area counter-search found no further supportable claim within this track.

**Counter-search tests/results:**

- NIST LiDAR evaluation paper PDF exceeded the browser fetch limit; only its abstract supports a testbed/evaluation claim.

- Nigeria official ADAS vocational sensor-calibration criteria

- Nigerian evidence is a technician ADAS qualification and general metrology scope, not AV sensor-engineering curriculum or an exhaustive calibration-provider directory.

- Nigerian metrology service scope versus AV sensor calibration

- No full-text comparative calibration survey was accessible; targetless/online/cooperative alternatives remain research-level where only abstracts were available.

- camera/LiDAR/radar and broader modality performance under rain/adverse visibility

- clock and frame conventions

- future calibration methods/tools versus forecasts and abstracts

- historical GUI toolbox versus actively maintained ROS 2 package

- intrinsic/extrinsic versus temporal calibration

- onboard versus roadside calibration boundary

- sensor-health/calibration interface status

- target-based versus targetless and online drift/self-calibration

#### `methods_techniques_and_alternatives` - `complete`

**Topic focus:** Camera intrinsics/extrinsics, LiDAR/radar/IMU calibration, target-based and targetless calibration, temporal calibration, sensor-health diagnostics, cross-modal fusion and traditional versus learned calibration; compare observability and failure limits.
**Gap filler:** Search for named method families and their sub-techniques; compare alternatives by task, assumptions, data, output, validation and limitations. Record combinations only where the documented design requires a handoff.
**Categories/horizons:** methods/designs, techniques/estimators/algorithms; established/traditional, current, emerging.
**Mapped cells:** methods_and_designs / established/traditional; methods_and_designs / current; methods_and_designs / emerging; techniques_estimators_and_algorithms / established/traditional; techniques_estimators_and_algorithms / current; techniques_estimators_and_algorithms / emerging
**Assessed cells:** methods_and_designs / established/traditional; methods_and_designs / current; methods_and_designs / emerging; techniques_estimators_and_algorithms / established/traditional; techniques_estimators_and_algorithms / current; techniques_estimators_and_algorithms / emerging
**Evidence IDs:** `D166-AUTOWARE-SENSOR-CALIBRATION-TUTORIAL`, `D166-MEASUREMENT-SENSOR-CALIBRATION-SURVEY-2026`, `D166-IEEE-SENSOR-TEMPORAL-MISALIGNMENT-2024`, `D166-A1-BILESCHI-LIDAR-VIDEO-2009`, `D166-A1-CALIBREFINE-ARXIV-2025`
**Query IDs:** `D166-A-QPACK-01`, `D166-A-QPACK-03`, `D166-A-QPACK-05`, `D166-A-QPACK-07`, `D166-A-QPACK-CLOSE-001`, `D166-A-QPACK-CLOSE-005`
**Closure rationale:** Terminal complete disposition within original topic scope: reviewed 6 applicable cells (mapped=6). Mapped evidence is restricted to the linked claims; bounded no-hit cells record source/type/horizon exclusions and query limits. The dated area counter-search found no further supportable claim within this track.

**Counter-search tests/results:**

- NIST LiDAR evaluation paper PDF exceeded the browser fetch limit; only its abstract supports a testbed/evaluation claim.

- Nigeria official ADAS vocational sensor-calibration criteria

- Nigerian evidence is a technician ADAS qualification and general metrology scope, not AV sensor-engineering curriculum or an exhaustive calibration-provider directory.

- Nigerian metrology service scope versus AV sensor calibration

- No full-text comparative calibration survey was accessible; targetless/online/cooperative alternatives remain research-level where only abstracts were available.

- camera/LiDAR/radar and broader modality performance under rain/adverse visibility

- clock and frame conventions

- documented official calibration software versus paper-described toolbox

- future calibration methods/tools versus forecasts and abstracts

- historical GUI toolbox versus actively maintained ROS 2 package

- historical targetless LiDAR?video method

- intrinsic/extrinsic versus temporal calibration

- onboard versus roadside calibration boundary

- online/factory calibration software claim versus current maintenance evidence

- sensor-health/calibration interface status

- target-based versus targetless and online drift/self-calibration

#### `tools_data_and_implementation` - `complete`

**Topic focus:** Calibration rigs/targets, ROS/Autoware and OEM/supplier toolchains, sensor SDKs, calibration datasets and evaluation tools; verify official support, vehicle mounting, coordinate conventions, repeatability and data access.
**Gap filler:** Find current tools, instruments, platforms and datasets actually used for the area's methods. Record exact use/context, alternatives, input/output compatibility, access/licensing and limitations; do not infer a tool from a method name.
**Categories/horizons:** tools/software/platforms, datasets/instruments/data standards; current, emerging.
**Mapped cells:** tools_software_and_data / current
**Assessed cells:** tools_software_and_data / current; tools_software_and_data / emerging
**Evidence IDs:** `D166-AUTOWARE-SENSOR-CALIBRATION-TUTORIAL`, `D166-NIST-LIDAR-EVALUATION-2025`, `D166-A1-RAINSENSE-ZENODO-2025`, `D166-A1-OPENCALIB-ARXIV-2022`, `D166-A1-FRAUNHOFER-MULTISENSOR-CALIBRATION-2025`, `D166-MEASUREMENT-SENSOR-CALIBRATION-SURVEY-2026`
**Query IDs:** `D166-A-QPACK-01`, `D166-A-QPACK-03`, `D166-A-QPACK-05`, `D166-A-QPACK-07`, `D166-A-QPACK-CLOSE-001`, `D166-A-QPACK-CLOSE-005`
**Closure rationale:** Terminal complete disposition within original topic scope: reviewed 2 applicable cells (mapped=1, bounded_no_hit=1). Mapped evidence is restricted to the linked claims; bounded no-hit cells record source/type/horizon exclusions and query limits. The dated area counter-search found no further supportable claim within this track.

**Counter-search tests/results:**

- NIST LiDAR evaluation paper PDF exceeded the browser fetch limit; only its abstract supports a testbed/evaluation claim.

- Nigeria official ADAS vocational sensor-calibration criteria

- Nigerian evidence is a technician ADAS qualification and general metrology scope, not AV sensor-engineering curriculum or an exhaustive calibration-provider directory.

- Nigerian metrology service scope versus AV sensor calibration

- No full-text comparative calibration survey was accessible; targetless/online/cooperative alternatives remain research-level where only abstracts were available.

- camera/LiDAR/radar and broader modality performance under rain/adverse visibility

- clock and frame conventions

- future calibration methods/tools versus forecasts and abstracts

- historical GUI toolbox versus actively maintained ROS 2 package

- intrinsic/extrinsic versus temporal calibration

- onboard versus roadside calibration boundary

- sensor-health/calibration interface status

- target-based versus targetless and online drift/self-calibration

#### `emerging_and_future_frontier` - `bounded_no_hit`

**Topic focus:** Online/self-calibration, learning-based calibration, foundation-model-assisted perception/calibration and novel sensor modalities only where supported by peer-reviewed or accountable project evidence; separate demonstrations from production use.
**Gap filler:** Search recent work and credible roadmaps for material emerging methods/tools. Distinguish demonstrated research, pilot use, deployed practice and speculation; mark future/no-hit only after recording the actual query and evidence boundary.
**Categories/horizons:** knowledge, methods, techniques, tools; emerging, future/futuristic.
**Mapped cells:** foundations_knowledge_and_competencies / emerging; methods_and_designs / emerging; techniques_estimators_and_algorithms / emerging
**Assessed cells:** foundations_knowledge_and_competencies / emerging; foundations_knowledge_and_competencies / future/futuristic; methods_and_designs / emerging; methods_and_designs / future/futuristic; techniques_estimators_and_algorithms / emerging; techniques_estimators_and_algorithms / future/futuristic; tools_software_and_data / emerging; tools_software_and_data / future/futuristic
**Evidence IDs:** `D166-MEASUREMENT-SENSOR-CALIBRATION-SURVEY-2026`, `D166-AUTOWARE-SENSOR-CALIBRATION-TUTORIAL`, `D166-IEEE-SENSOR-TEMPORAL-MISALIGNMENT-2024`, `D166-A1-CALIBREFINE-ARXIV-2025`, `D166-NIST-LIDAR-EVALUATION-2025`, `D166-A1-RAINSENSE-ZENODO-2025`
**Query IDs:** `D166-A-QPACK-01`, `D166-A-QPACK-03`, `D166-A-QPACK-05`, `D166-A-QPACK-07`, `D166-A-QPACK-CLOSE-001`, `D166-A-QPACK-CLOSE-005`
**Closure rationale:** Terminal bounded_no_hit within original topic scope: reviewed 8 applicable cells (mapped=3, bounded_no_hit=5). The dated counter-search found no defensible additional claim for this track after source and type/horizon limits were checked. Bounded result: No validated future calibration algorithm, selectable software/data product, credential or output contract was found; the 2026 survey was abstract-only and roadmaps were prospective. This closes the searched scope, not global absence.

**Counter-search tests/results:**

- NIST LiDAR evaluation paper PDF exceeded the browser fetch limit; only its abstract supports a testbed/evaluation claim.

- Nigeria official ADAS vocational sensor-calibration criteria

- Nigerian evidence is a technician ADAS qualification and general metrology scope, not AV sensor-engineering curriculum or an exhaustive calibration-provider directory.

- Nigerian metrology service scope versus AV sensor calibration

- No full-text comparative calibration survey was accessible; targetless/online/cooperative alternatives remain research-level where only abstracts were available.

- camera/LiDAR/radar and broader modality performance under rain/adverse visibility

- clock and frame conventions

- documented official calibration software versus paper-described toolbox

- future calibration methods/tools versus forecasts and abstracts

- historical GUI toolbox versus actively maintained ROS 2 package

- historical targetless LiDAR?video method

- intrinsic/extrinsic versus temporal calibration

- onboard versus roadside calibration boundary

- online/factory calibration software claim versus current maintenance evidence

- sensor-health/calibration interface status

- target-based versus targetless and online drift/self-calibration

**Bounded remaining finding:**

- No validated future calibration algorithm, selectable software/data product, credential or output contract was found; the 2026 survey was abstract-only and roadmaps were prospective.

#### `standards_credentials_and_learning_resources` - `complete`

**Topic focus:** Applicable sensor/metrology, time/coordinate, functional-safety and vehicle test standards; specialist calibration instruction and credentials where verified; record edition and vehicle/market scope.
**Gap filler:** Search applicable laws, standards, professional frameworks, credentials and structured learning materials. Verify scope, edition/status, jurisdiction and prerequisites; mark not-applicable only with a short source-backed reason.
**Categories/horizons:** standards/regulation, certifications/credentials, learning resources; current, emerging.
**Mapped cells:** standards_credentials_and_learning_resources / current
**Assessed cells:** standards_credentials_and_learning_resources / current; standards_credentials_and_learning_resources / emerging
**Evidence IDs:** `D166-ISO-23150-20-SENSOR-INTERFACES-2026`, `D166-IEEE-1588-2019-PTP`, `D166-ROS-REP-103-COORDINATE-CONVENTIONS`, `D166-IEEE-3184-1-ROADSIDE-CALIBRATION-2025`, `D166-A1-NBTE-NSQ-ADAS-CALIBRATION-2024`, `D166-A1-SON-NMI-CALIBRATION-SCOPE-2026`
**Query IDs:** `D166-A-QPACK-01`, `D166-A-QPACK-03`, `D166-A-QPACK-05`, `D166-A-QPACK-07`, `D166-A-QPACK-CLOSE-001`, `D166-A-QPACK-CLOSE-005`
**Closure rationale:** Terminal complete disposition within original topic scope: reviewed 2 applicable cells (mapped=1, bounded_no_hit=1). Mapped evidence is restricted to the linked claims; bounded no-hit cells record source/type/horizon exclusions and query limits. The dated area counter-search found no further supportable claim within this track.

**Counter-search tests/results:**

- NIST LiDAR evaluation paper PDF exceeded the browser fetch limit; only its abstract supports a testbed/evaluation claim.

- Nigeria official ADAS vocational sensor-calibration criteria

- Nigerian evidence is a technician ADAS qualification and general metrology scope, not AV sensor-engineering curriculum or an exhaustive calibration-provider directory.

- Nigerian metrology service scope versus AV sensor calibration

- No full-text comparative calibration survey was accessible; targetless/online/cooperative alternatives remain research-level where only abstracts were available.

- camera/LiDAR/radar and broader modality performance under rain/adverse visibility

- clock and frame conventions

- future calibration methods/tools versus forecasts and abstracts

- historical GUI toolbox versus actively maintained ROS 2 package

- intrinsic/extrinsic versus temporal calibration

- onboard versus roadside calibration boundary

- sensor-health/calibration interface status

- target-based versus targetless and online drift/self-calibration

#### `outputs_and_downstream_role_context` - `complete`

**Topic focus:** Calibrated extrinsics/intrinsics/time offsets, uncertainty and sensor-health signals consumed by perception, localization and integration; map conditional work to sensing, mechatronics, optomechanical and software tasks.
**Gap filler:** Trace what the area produces, who consumes it downstream, and which roles use it under what conditions. Map item-to-task/output evidence with boundaries and counterexamples; keep role evidence separate from area-definition evidence and do not change canonical fit.
**Categories/horizons:** work outputs, role tasks/skills, downstream area links; current, emerging.
**Mapped cells:** outputs_and_downstream_role_context / current; outputs_and_downstream_role_context / emerging
**Assessed cells:** outputs_and_downstream_role_context / current; outputs_and_downstream_role_context / emerging
**Evidence IDs:** `D166-AUTOWARE-SENSOR-CALIBRATION-TUTORIAL`, `D166-NIST-LIDAR-EVALUATION-2025`
**Query IDs:** `D166-A-QPACK-01`, `D166-A-QPACK-03`, `D166-A-QPACK-05`, `D166-A-QPACK-07`, `D166-A-QPACK-CLOSE-001`, `D166-A-QPACK-CLOSE-005`
**Closure rationale:** Terminal complete disposition within original topic scope: reviewed 2 applicable cells (mapped=2). Mapped evidence is restricted to the linked claims; bounded no-hit cells record source/type/horizon exclusions and query limits. The dated area counter-search found no further supportable claim within this track.

**Counter-search tests/results:**

- NIST LiDAR evaluation paper PDF exceeded the browser fetch limit; only its abstract supports a testbed/evaluation claim.

- Nigeria official ADAS vocational sensor-calibration criteria

- Nigerian evidence is a technician ADAS qualification and general metrology scope, not AV sensor-engineering curriculum or an exhaustive calibration-provider directory.

- Nigerian metrology service scope versus AV sensor calibration

- No full-text comparative calibration survey was accessible; targetless/online/cooperative alternatives remain research-level where only abstracts were available.

- camera/LiDAR/radar and broader modality performance under rain/adverse visibility

- clock and frame conventions

- future calibration methods/tools versus forecasts and abstracts

- historical GUI toolbox versus actively maintained ROS 2 package

- intrinsic/extrinsic versus temporal calibration

- onboard versus roadside calibration boundary

- sensor-health/calibration interface status

- target-based versus targetless and online drift/self-calibration

## Perception and Scene Understanding (`D166:perception-and-scene-understanding`)

**Boundary:** Interpret sensor and map inputs to detect, classify, track and predict road users, obstacles, traffic controls and relevant scene conditions.

| Family | Horizon | Disposition | Mapping IDs | Query IDs |
|---|---|---|---|---|
| `foundations_knowledge_and_competencies` | established/traditional | `mapped` | `D166-A1-PERCEPTION-CLOSE-FOUND-ESTABLISHED` | `D166-Q046`, `D166-A-QPACK-CLOSE-003` |
| `foundations_knowledge_and_competencies` | current | `mapped` | `D166-A-MAP-015` | `D166-Q046` |
| `foundations_knowledge_and_competencies` | emerging | `mapped` | `D166-A1-PERCEPTION-CLOSE-FOUND-EMERGING` | `D166-Q046`, `D166-A-QPACK-CLOSE-002` |
| `foundations_knowledge_and_competencies` | future/futuristic | `bounded_no_hit` |  | `D166-Q046`, `D166-A-QPACK-CLOSE-004` |
| `methods_and_designs` | established/traditional | `mapped` | `D166-A1-PERCEPTION-CLOSE-METHOD-ESTABLISHED` | `D166-Q046`, `D166-A-QPACK-CLOSE-003` |
| `methods_and_designs` | current | `mapped` | `D166-A-MAP-037` | `D166-Q046`, `D166-A-QPACK-CLOSE-002` |
| `methods_and_designs` | emerging | `mapped` | `D166-A-MAP-017` | `D166-Q046` |
| `methods_and_designs` | future/futuristic | `bounded_no_hit` |  | `D166-A-QPACK-CLOSE-004` |
| `techniques_estimators_and_algorithms` | established/traditional | `mapped` | `D166-A1-PERCEPTION-CLOSE-ALGO-ESTABLISHED` | `D166-Q046`, `D166-A-QPACK-CLOSE-003` |
| `techniques_estimators_and_algorithms` | current | `mapped` | `D166-A1-PERCEPTION-CLOSE-ALGO-CURRENT` | `D166-Q046`, `D166-A-QPACK-CLOSE-002` |
| `techniques_estimators_and_algorithms` | emerging | `mapped` | `D166-A-MAP-018` | `D166-Q046` |
| `techniques_estimators_and_algorithms` | future/futuristic | `bounded_no_hit` |  | `D166-Q046`, `D166-A-QPACK-CLOSE-004` |
| `tools_software_and_data` | established/traditional | `mapped` | `D166-A1-PERCEPTION-CLOSE-KITTI-TOOLS-ESTABLISHED` | `D166-A-QPACK-CLOSE-004` |
| `tools_software_and_data` | current | `mapped` | `D166-A-MAP-026` | `D166-Q046`, `D166-A-QPACK-CLOSE-002` |
| `tools_software_and_data` | emerging | `mapped` | `D166-A1-PERCEPTION-CLOSE-WAYMO-ASSET-DATA-EMERGING` | `D166-Q046`, `D166-A-QPACK-CLOSE-004` |
| `tools_software_and_data` | future/futuristic | `bounded_no_hit` |  | `D166-Q046`, `D166-A-QPACK-CLOSE-004` |
| `standards_credentials_and_learning_resources` | established/traditional | `bounded_no_hit` |  | `D166-A-QPACK-CLOSE-004` |
| `standards_credentials_and_learning_resources` | current | `mapped` | `D166-A-MAP-020`, `D166-A1-PERCEPTION-CLOSE-LEARNING-CURRENT` | `D166-Q058`, `D166-A-QPACK-CLOSE-003` |
| `standards_credentials_and_learning_resources` | emerging | `mapped` | `D166-A1-PERCEPTION-CLOSE-AI-STANDARD-EMERGING` | `D166-Q058`, `D166-A-QPACK-CLOSE-004` |
| `standards_credentials_and_learning_resources` | future/futuristic | `mapped` | `D166-A1-PERCEPTION-CLOSE-STANDARD-FUTURE` | `D166-A-QPACK-CLOSE-003` |
| `outputs_and_downstream_role_context` | established/traditional | `mapped` | `D166-A1-PERCEPTION-CLOSE-OUTPUT-ESTABLISHED` | `D166-A-QPACK-CLOSE-003` |
| `outputs_and_downstream_role_context` | current | `mapped` | `D166-A-MAP-021` | `D166-Q046` |
| `outputs_and_downstream_role_context` | emerging | `mapped` | `D166-A-MAP-022` | `D166-Q046` |
| `outputs_and_downstream_role_context` | future/futuristic | `bounded_no_hit` |  | `D166-A-QPACK-CLOSE-004` |

### Cell-by-cell claims and no-hit scope

#### `foundations_knowledge_and_competencies` / `established/traditional` - `mapped`

Candidate source IDs: `D166-AUTOWARE-PERCEPTION-2026-10-22`, `D166-AUTOWARE-PERCEPTION-REFERENCE-2026`, `D166-AUTOWARE-SENSOR-CALIBRATION-TUTORIAL`, `D166-A1-ARNOLD-3D-DETECTION-SURVEY-2019`. Query IDs: `D166-Q046`, `D166-A-QPACK-CLOSE-003`.

- **D166-A1-PERCEPTION-CLOSE-FOUND-ESTABLISHED:** The survey grounds AV perception as transforming sensory input into semantic information such as road-agent identity/class, position/velocity, lane marking, drivable area and traffic-sign information; it distinguishes 2D image-plane boxes from 3D object size/location/depth. **Item type:** knowledge/competency concept. **Inputs:** Not applicable as a computational interface; the cited item is a knowledge, standard, or learning-resource claim. **Outputs:** The source-supported knowledge/criterion/learning scope is the claim text itself; no software output or interface is inferred. **Assumptions/limits:** Source-specific conditions and non-generalization limits: Secondary synthesis; 2019-era survey and 3D-detection focus, not a comprehensive curriculum or current architecture. **Source(s):** `D166-A1-ARNOLD-3D-DETECTION-SURVEY-2019`. **Exact locator:** Accepted manuscript pp.1?2, abstract/Introduction and Table I. **Relationship evidence:** `context_only`; No universal prerequisite or D166 learner sequence is inferred. Source(s): `D166-A1-ARNOLD-3D-DETECTION-SURVEY-2019`; locator: Accepted manuscript pp.1?2, abstract/Introduction and Table I..

#### `foundations_knowledge_and_competencies` / `current` - `mapped`

Candidate source IDs: `D166-AUTOWARE-PERCEPTION-2026-10-22`, `D166-AUTOWARE-PERCEPTION-REFERENCE-2026`, `D166-AUTOWARE-SENSOR-CALIBRATION-TUTORIAL`. Query IDs: `D166-Q046`.

- **D166-A-MAP-015:** Autoware defines perception as processing sensor inputs into object/scene outputs; this supports a current system-boundary concept, not a complete foundational curriculum. **Item type:** knowledge/competency concept. **Inputs:** Not applicable as a computational interface; the cited item is a knowledge, standard, or learning-resource claim. **Outputs:** The source-supported knowledge/criterion/learning scope is the claim text itself; no software output or interface is inferred. **Assumptions/limits:** Source-specific conditions and non-generalization limits: Reference architecture; algorithm choices and boundaries vary across systems. **Source(s):** `D166-AUTOWARE-PERCEPTION-2026-10-22`. **Exact locator:** Perception receives sensing, localization, and map inputs, adds semantic information such as object recognition, obstacle segmentation and traffic-light recognition, then passes outputs to planning. **Relationship evidence:** `context_only`; This mapping connects one source claim to one area/family/horizon cell; it asserts no item-to-item prerequisite, alternative, complement or producer-consumer relationship. Source(s): `D166-AUTOWARE-PERCEPTION-2026-10-22`; locator: Perception receives sensing, localization, and map inputs, adds semantic information such as object recognition, obstacle segmentation and traffic-light recognition, then passes outputs to planning..

#### `foundations_knowledge_and_competencies` / `emerging` - `mapped`

Candidate source IDs: `D166-AUTOWARE-ARCH-V2-GENERATOR-SELECTOR`, `D166-OCCUPANCY-PERCEPTION-SURVEY-2024`, `D166-TPAMI-IMAGE-3D-DETECTION-SURVEY-2024`, `D166-A1-NIST-PERCEPTION-SENSITIVITY-2026`, `D166-A1-FOUNDATION-PERCEPTION-SURVEY-2025`. Query IDs: `D166-Q046`, `D166-A-QPACK-CLOSE-002`.

- **D166-A1-PERCEPTION-CLOSE-FOUND-EMERGING:** An emerging capability framing for AV perception groups foundation-model work around generalized knowledge, spatial understanding, multi-sensor robustness and temporal reasoning, while highlighting real-time and reliability constraints. **Item type:** knowledge/competency concept. **Inputs:** Not applicable as a computational interface; the cited item is a knowledge, standard, or learning-resource claim. **Outputs:** The source-supported knowledge/criterion/learning scope is the claim text itself; no software output or interface is inferred. **Assumptions/limits:** Source-specific conditions and non-generalization limits: Abstract-only; no detailed evidence synthesis, specific model, benchmark outcome or production readiness reviewed. **Source(s):** `D166-A1-FOUNDATION-PERCEPTION-SURVEY-2025`. **Exact locator:** arXiv:2509.08302 abstract, lines 16?20; full survey not inspected. **Relationship evidence:** `context_only`; No universal prerequisite or learner sequence is inferred. Source(s): `D166-A1-FOUNDATION-PERCEPTION-SURVEY-2025`; locator: arXiv:2509.08302 abstract, lines 16?20; full survey not inspected..

#### `foundations_knowledge_and_competencies` / `future/futuristic` - `bounded_no_hit`

Candidate source IDs: `D166-AUTOWARE-ARCH-V2-GENERATOR-SELECTOR`, `D166-OCCUPANCY-PERCEPTION-SURVEY-2024`, `D166-TPAMI-IMAGE-3D-DETECTION-SURVEY-2024`. Query IDs: `D166-Q046`, `D166-A-QPACK-CLOSE-004`.

- **Bounded rationale:** Searches included 2025?2026 peer-reviewed/author research direction, official AI safety work items and AESIN sensor roadmap; future concepts remain speculative and not a validated competency framework.

- **Bounded rationale:** Limits: bounded English-language indexed/open-web search on 2026-10-24; not a claim that no such future work exists.

#### `methods_and_designs` / `established/traditional` - `mapped`

Candidate source IDs: `D166-AUTOWARE-PERCEPTION-REFERENCE-2026`, `D166-TPAMI-IMAGE-3D-DETECTION-SURVEY-2024`, `D166-OCCUPANCY-PERCEPTION-SURVEY-2024`, `D166-NUSCENES-TRACKING-METRICS`, `D166-A1-ARNOLD-3D-DETECTION-SURVEY-2019`. Query IDs: `D166-Q046`, `D166-A-QPACK-CLOSE-003`.

- **D166-A1-PERCEPTION-CLOSE-METHOD-ESTABLISHED:** A traditional object-detection pipeline is described as segmentation/proposal generation, hand-engineered feature extraction and classification; the survey contrasts these staged pipelines with end-to-end learned detection. **Item type:** method/system design. **Inputs:** No concrete input is stated in the inspected claim/locator; none is inferred. **Outputs:** No separate output/interface is stated in the inspected claim/locator; none is inferred. **Assumptions/limits:** Source-specific conditions and non-generalization limits: The survey summarizes earlier literature and does not establish the best contemporary design. **Source(s):** `D166-A1-ARNOLD-3D-DETECTION-SURVEY-2019`. **Exact locator:** Accepted manuscript pp.1?2, Introduction; traditional pipeline examples at lines/paragraph around the 2D-versus-3D comparison. **Relationship evidence:** `context_only`; No universal prerequisite or D166 learner sequence is inferred. Source(s): `D166-A1-ARNOLD-3D-DETECTION-SURVEY-2019`; locator: Accepted manuscript pp.1?2, Introduction; traditional pipeline examples at lines/paragraph around the 2D-versus-3D comparison..

#### `methods_and_designs` / `current` - `mapped`

Candidate source IDs: `D166-AUTOWARE-PERCEPTION-REFERENCE-2026`, `D166-TPAMI-IMAGE-3D-DETECTION-SURVEY-2024`, `D166-OCCUPANCY-PERCEPTION-SURVEY-2024`, `D166-NUSCENES-TRACKING-METRICS`. Query IDs: `D166-Q046`, `D166-A-QPACK-CLOSE-002`.

- **D166-A-MAP-037:** Autoware?s reference architecture uses a modular perception design: base 3D detection, optional near-object and far-range branches, object merging/tracking, trajectory prediction and separate obstacle/occupancy functions; choices are conditional on sensor reliability and compute constraints. **Item type:** method/system design. **Inputs:** Source-named input/context terms: sensor. These terms come from the claim; no additional input is inferred. **Outputs:** No separate output/interface is stated in the inspected claim/locator; none is inferred. **Assumptions/limits:** Source-specific conditions and non-generalization limits: This is one current Autoware design. The document marks some functions optional/TBD and warns that fusion reliability and processing cost vary with sensor data stability and input volume. **Source(s):** `D166-AUTOWARE-PERCEPTION-REFERENCE-2026`. **Exact locator:** Official Autoware reference implementation design, sections Base 3D Detection, Near-Object 3D Detection, Radar-Only Faraway Detection, Cluster-Based Detection and Multi-Object Tracking v2; opened 2026-10-24. **Relationship evidence:** `context_only`; Source-specific mapping only; no universal prerequisite or learner sequence is inferred. Source(s): `D166-AUTOWARE-PERCEPTION-REFERENCE-2026`; locator: Official Autoware reference implementation design, sections Base 3D Detection, Near-Object 3D Detection, Radar-Only Faraway Detection, Cluster-Based Detection and Multi-Object Tracking v2; opened 2026-10-24..

#### `methods_and_designs` / `emerging` - `mapped`

Candidate source IDs: `D166-AUTOWARE-PERCEPTION-REFERENCE-2026`, `D166-TPAMI-IMAGE-3D-DETECTION-SURVEY-2024`, `D166-OCCUPANCY-PERCEPTION-SURVEY-2024`, `D166-NUSCENES-TRACKING-METRICS`, `D166-A1-NIST-PERCEPTION-SENSITIVITY-2026`. Query IDs: `D166-Q046`.

- **D166-A-MAP-017:** The NIST abstract evaluates perception sensitivity using ensemble uncertainty across simulated and real-driving scenarios; this is an assessment design, not a general perception architecture. **Item type:** method/system design. **Inputs:** Source-named input/context terms: imu. These terms come from the claim; no additional input is inferred. **Outputs:** No separate output/interface is stated in the inspected claim/locator; none is inferred. **Assumptions/limits:** Source-specific conditions and non-generalization limits: Abstract-only evidence; detailed methods, sample sizes, model configuration, statistical strength and generalization cannot be checked from the abstract. It does not establish a production-ready method, sensor requirement, safety guarantee or performance threshold. **Source(s):** `D166-A1-NIST-PERCEPTION-SENSITIVITY-2026`. **Exact locator:** NIST page, record metadata and abstract, especially abstract lines describing ensemble uncertainty evaluation across simulated and real adverse conditions, fog/low sun/occlusions and object-distance effects. **Relationship evidence:** `context_only`; This mapping connects one source claim to one area/family/horizon cell; it asserts no item-to-item prerequisite, alternative, complement or producer-consumer relationship. Source(s): `D166-A1-NIST-PERCEPTION-SENSITIVITY-2026`; locator: NIST page, record metadata and abstract, especially abstract lines describing ensemble uncertainty evaluation across simulated and real adverse conditions, fog/low sun/occlusions and object-distance effects..

#### `methods_and_designs` / `future/futuristic` - `bounded_no_hit`

Candidate source IDs: . Query IDs: `D166-A-QPACK-CLOSE-004`.

- **Bounded rationale:** Searches covered foundation-model surveys, complex-scenario perception trend review result, Autoware reference design and industry sensor roadmap; no future validated design was found within that scope.

- **Bounded rationale:** Limits: bounded English-language indexed/open-web search on 2026-10-24; not a claim that no such future work exists.

#### `techniques_estimators_and_algorithms` / `established/traditional` - `mapped`

Candidate source IDs: `D166-AUTOWARE-PERCEPTION-REFERENCE-2026`, `D166-TPAMI-IMAGE-3D-DETECTION-SURVEY-2024`, `D166-OCCUPANCY-PERCEPTION-SURVEY-2024`, `D166-NUSCENES-TRACKING-METRICS`, `D166-A1-ARNOLD-3D-DETECTION-SURVEY-2019`. Query IDs: `D166-Q046`, `D166-A-QPACK-CLOSE-003`.

- **D166-A1-PERCEPTION-CLOSE-ALGO-ESTABLISHED:** The surveyed traditional pipeline includes segmentation or voxel clustering, hand-engineered features and discriminative classifiers; examples include HOG/SVM and optical-flow/motion cues. **Item type:** technique/estimator/algorithm. **Inputs:** No concrete input is stated in the inspected claim/locator; none is inferred. **Outputs:** No separate output/interface is stated in the inspected claim/locator; none is inferred. **Assumptions/limits:** Source-specific conditions and non-generalization limits: Examples summarize cited literature and do not provide a reproducible algorithm specification or universally applicable performance. **Source(s):** `D166-A1-ARNOLD-3D-DETECTION-SURVEY-2019`. **Exact locator:** Accepted manuscript pp.1?2 and referenced traditional detector discussion; survey abstract/introduction and cited pipeline summary. **Relationship evidence:** `context_only`; No universal prerequisite or D166 learner sequence is inferred. Source(s): `D166-A1-ARNOLD-3D-DETECTION-SURVEY-2019`; locator: Accepted manuscript pp.1?2 and referenced traditional detector discussion; survey abstract/introduction and cited pipeline summary..

#### `techniques_estimators_and_algorithms` / `current` - `mapped`

Candidate source IDs: `D166-AUTOWARE-PERCEPTION-REFERENCE-2026`, `D166-TPAMI-IMAGE-3D-DETECTION-SURVEY-2024`, `D166-OCCUPANCY-PERCEPTION-SURVEY-2024`, `D166-NUSCENES-TRACKING-METRICS`. Query IDs: `D166-Q046`, `D166-A-QPACK-CLOSE-002`.

- **D166-A1-PERCEPTION-CLOSE-ALGO-CURRENT:** The Autoware reference design names CenterPoint, TransFusion-L and BEVFusion-L for 3D detection and Euclidean clustering with image-region fusion as a supplementary path; it warns against fusion under frequent sensor-data drops. **Item type:** technique/estimator/algorithm. **Inputs:** Source-named input/context terms: image, sensor. These terms come from the claim; no additional input is inferred. **Outputs:** No separate output/interface is stated in the inspected claim/locator; none is inferred. **Assumptions/limits:** Source-specific conditions and non-generalization limits: No independent benchmark was run; performance and operational cautions are implementation-specific. **Source(s):** `D166-AUTOWARE-PERCEPTION-REFERENCE-2026`. **Exact locator:** Autoware reference design, Base 3D Detection and Cluster-Based 3D Detection, opened 2026-10-24. **Relationship evidence:** `context_only`; No universal prerequisite or learner sequence is inferred. Source(s): `D166-AUTOWARE-PERCEPTION-REFERENCE-2026`; locator: Autoware reference design, Base 3D Detection and Cluster-Based 3D Detection, opened 2026-10-24..

#### `techniques_estimators_and_algorithms` / `emerging` - `mapped`

Candidate source IDs: `D166-AUTOWARE-PERCEPTION-REFERENCE-2026`, `D166-TPAMI-IMAGE-3D-DETECTION-SURVEY-2024`, `D166-OCCUPANCY-PERCEPTION-SURVEY-2024`, `D166-NUSCENES-TRACKING-METRICS`, `D166-AUTOWARE-ARCH-V2-GENERATOR-SELECTOR`, `D166-A1-NIST-PERCEPTION-SENSITIVITY-2026`. Query IDs: `D166-Q046`.

- **D166-A-MAP-018:** The NIST abstract uses ensemble uncertainty to examine changes in perception performance under lighting, occlusion, weather and distance conditions; paper-level protocol and reproducibility remain unchecked. **Item type:** technique/estimator/algorithm. **Inputs:** No concrete input is stated in the inspected claim/locator; none is inferred. **Outputs:** No separate output/interface is stated in the inspected claim/locator; none is inferred. **Assumptions/limits:** Source-specific conditions and non-generalization limits: Abstract-only evidence; detailed methods, sample sizes, model configuration, statistical strength and generalization cannot be checked from the abstract. It does not establish a production-ready method, sensor requirement, safety guarantee or performance threshold. **Source(s):** `D166-A1-NIST-PERCEPTION-SENSITIVITY-2026`. **Exact locator:** NIST page, record metadata and abstract, especially abstract lines describing ensemble uncertainty evaluation across simulated and real adverse conditions, fog/low sun/occlusions and object-distance effects. **Relationship evidence:** `context_only`; This mapping connects one source claim to one area/family/horizon cell; it asserts no item-to-item prerequisite, alternative, complement or producer-consumer relationship. Source(s): `D166-A1-NIST-PERCEPTION-SENSITIVITY-2026`; locator: NIST page, record metadata and abstract, especially abstract lines describing ensemble uncertainty evaluation across simulated and real adverse conditions, fog/low sun/occlusions and object-distance effects..

#### `techniques_estimators_and_algorithms` / `future/futuristic` - `bounded_no_hit`

Candidate source IDs: `D166-AUTOWARE-ARCH-V2-GENERATOR-SELECTOR`, `D166-OCCUPANCY-PERCEPTION-SURVEY-2024`, `D166-TPAMI-IMAGE-3D-DETECTION-SURVEY-2024`. Query IDs: `D166-Q046`, `D166-A-QPACK-CLOSE-004`.

- **Bounded rationale:** Searches covered scholarly foundation-model direction, industry roadmap sensor topics and official stack methods; no validated future algorithm claim was substantiated.

- **Bounded rationale:** Limits: bounded English-language indexed/open-web search on 2026-10-24; not a claim that no such future work exists.

#### `tools_software_and_data` / `established/traditional` - `mapped`

Candidate source IDs: `D166-A1-KITTI-PERCEPTION-OBJECT-BENCHMARK`. Query IDs: `D166-A-QPACK-CLOSE-004`.

- **D166-A1-PERCEPTION-CLOSE-KITTI-TOOLS-ESTABLISHED:** The KITTI object benchmark provides a long-running driving dataset and evaluation/devkit: 7,481 labeled training images, 7,518 test images, camera/LiDAR/calibration resources, precision-recall and orientation metrics, and MATLAB/C++ utilities. **Item type:** dataset/benchmark. **Inputs:** Source-named input/context terms: camera, lidar, image. These terms come from the claim; no additional input is inferred. **Outputs:** Source claim: The KITTI object benchmark provides a long-running driving dataset and evaluation/devkit: 7,481 labeled training images, 7,518 test images, camera/LiDAR/calibration resources, precision-recall and orientation metrics, and MATLAB/C++ utilities. **Assumptions/limits:** Source-specific conditions and non-generalization limits: Its Karlsruhe/rural/highway collection, sensor setup, task definitions and CC BY-NC-SA 3.0 license bound transfer and commercial use. **Source(s):** `D166-A1-KITTI-PERCEPTION-OBJECT-BENCHMARK`. **Exact locator:** Official KITTI object evaluation and project homepage, opened 2026-10-24. **Relationship evidence:** `context_only`; The item supports study or evaluation of perception and is not a prerequisite or algorithm. Source(s): `D166-A1-KITTI-PERCEPTION-OBJECT-BENCHMARK`; locator: Official KITTI object evaluation and project homepage, opened 2026-10-24..

#### `tools_software_and_data` / `current` - `mapped`

Candidate source IDs: `D166-WAYMO-PERCEPTION-DATA-SPECS`, `D166-NUSCENES-TRACKING-METRICS`, `D166-AUTOWARE-PERCEPTION-REFERENCE-2026`, `D166-A1-RAINSENSE-ZENODO-2025`. Query IDs: `D166-Q046`, `D166-A-QPACK-CLOSE-002`.

- **D166-A-MAP-026:** Waymo Open Dataset Perception provides a concrete multimodal perception dataset with LiDAR/camera data, maps, 2D/3D boxes, tracking IDs, keypoints, 2D-to-3D correspondences and semantic/panoptic segmentation labels. **Item type:** dataset/benchmark. **Inputs:** Source-named input/context terms: camera, lidar, map. These terms come from the claim; no additional input is inferred. **Outputs:** Source claim: Waymo Open Dataset Perception provides a concrete multimodal perception dataset with LiDAR/camera data, maps, 2D/3D boxes, tracking IDs, keypoints, 2D-to-3D correspondences and semantic/panoptic segmentation labels. **Assumptions/limits:** Source-specific conditions and non-generalization limits: Dataset access requires sign-in; license/terms, downloadable contents and regional coverage were not fully checked. Labels and sensors have stated limits, including unestablished 2D-to-3D correspondences under occlusion/FOV differences and range truncation. **Source(s):** `D166-WAYMO-PERCEPTION-DATA-SPECS`. **Exact locator:** Official Waymo Perception dataset page, Overview and Data Labels sections; opened 2026-10-24. Coordinate-system and sensor limitations are stated in the same page. **Relationship evidence:** `context_only`; Dataset labels support training/evaluation of detection, tracking and segmentation methods; dataset availability does not establish a method prerequisite. Source(s): `D166-WAYMO-PERCEPTION-DATA-SPECS`; locator: Official Waymo Perception dataset page, Overview and Data Labels sections; opened 2026-10-24. Coordinate-system and sensor limitations are stated in the same page..

#### `tools_software_and_data` / `emerging` - `mapped`

Candidate source IDs: `D166-WAYMO-PERCEPTION-DATA-SPECS`, `D166-NUSCENES-TRACKING-METRICS`, `D166-AUTOWARE-PERCEPTION-REFERENCE-2026`, `D166-AUTOWARE-ARCH-V2-GENERATOR-SELECTOR`, `D166-OCCUPANCY-PERCEPTION-SURVEY-2024`, `D166-TPAMI-IMAGE-3D-DETECTION-SURVEY-2024`, `D166-A1-RAINSENSE-ZENODO-2025`. Query IDs: `D166-Q046`, `D166-A-QPACK-CLOSE-004`.

- **D166-A1-PERCEPTION-CLOSE-WAYMO-ASSET-DATA-EMERGING:** Waymo?s newer object-assets release adds 1.2M object frames from 31K vehicle/pedestrian instances, using camera/LiDAR data and annotations to support 3D shape reconstruction and object-centric simulation assets. **Item type:** software/tool/platform. **Inputs:** Source-named input/context terms: camera, lidar, imu. These terms come from the claim; no additional input is inferred. **Outputs:** No separate output/interface is stated in the inspected claim/locator; none is inferred. **Assumptions/limits:** Source-specific conditions and non-generalization limits: Limited to two classes and selected ranges; labels include auto-labels/refinements and generated simulation assets. Access terms were not fully reviewed; this is a data product, not a perception algorithm. **Source(s):** `D166-WAYMO-PERCEPTION-DATA-SPECS`. **Exact locator:** Official Waymo perception page, Object Assets section, especially lines 146?157, opened 2026-10-24. **Relationship evidence:** `context_only`; The item supports study or evaluation of perception and is not a prerequisite or algorithm. Source(s): `D166-WAYMO-PERCEPTION-DATA-SPECS`; locator: Official Waymo perception page, Object Assets section, especially lines 146?157, opened 2026-10-24..

#### `tools_software_and_data` / `future/futuristic` - `bounded_no_hit`

Candidate source IDs: `D166-AUTOWARE-ARCH-V2-GENERATOR-SELECTOR`, `D166-OCCUPANCY-PERCEPTION-SURVEY-2024`, `D166-TPAMI-IMAGE-3D-DETECTION-SURVEY-2024`. Query IDs: `D166-Q046`, `D166-A-QPACK-CLOSE-004`.

- **Bounded rationale:** Searches covered Waymo, KITTI, Autoware, arXiv and AESIN/TechWorks future technology descriptions; future products are beyond what the examined sources document.

- **Bounded rationale:** Limits: bounded English-language indexed/open-web search on 2026-10-24; not a claim that no such future work exists.

#### `standards_credentials_and_learning_resources` / `established/traditional` - `bounded_no_hit`

Candidate source IDs: . Query IDs: `D166-A-QPACK-CLOSE-004`.

- **Bounded rationale:** Scoped search covered official ISO/SAE standards records, established benchmark/documentation searches and formal course catalogues; no earlier perception-specific credential or standard was substantiated.

- **Bounded rationale:** Limits: absence is bounded to opened/indexed English sources; broader historical/professional credential catalogs were not exhaustively enumerated.

#### `standards_credentials_and_learning_resources` / `current` - `mapped`

Candidate source IDs: `D166-ISO-21448`, `D166-ISO-23150-20-SENSOR-INTERFACES-2026`, `D166-ROS-REP-103-COORDINATE-CONVENTIONS`, `D166-WAYMO-PERCEPTION-DATA-SPECS`, `D166-NUSCENES-TRACKING-METRICS`, `D166-A1-ETH-AUTONOMOUS-CAR-VISION-COURSE-2025`. Query IDs: `D166-Q058`, `D166-A-QPACK-CLOSE-003`.

- **D166-A-MAP-020:** Safety work for performance insufficiencies and situational awareness, including ADS/ADAS contexts. **Item type:** credential/learning resource. **Inputs:** Not applicable as a computational interface; the cited item is a knowledge, standard, or learning-resource claim. **Outputs:** The source-supported knowledge/criterion/learning scope is the claim text itself; no software output or interface is inferred. **Assumptions/limits:** Source-specific conditions and non-generalization limits: Scope excludes ISO 26262 faults and cybersecurity; check revision status before teaching as current. Paid standard, not an individual credential. **Source(s):** `D166-ISO-21448`. **Exact locator:** Abstract defines SOTIF, covers design, verification, validation and operation for functions relying on complex sensors/processing; page says standard is to be revised. **Relationship evidence:** `context_only`; This mapping connects one source claim to one area/family/horizon cell; it asserts no item-to-item prerequisite, alternative, complement or producer-consumer relationship. Source(s): `D166-ISO-21448`; locator: Abstract defines SOTIF, covers design, verification, validation and operation for functions relying on complex sensors/processing; page says standard is to be revised..

- **D166-A1-PERCEPTION-CLOSE-LEARNING-CURRENT:** ETH Zurich?s recurring autonomous-car vision course teaches sensor/model fundamentals, detection/segmentation, multimodal and temporal perception, research evaluation, and hands-on projects including sensor calibration and LiDAR 3D detection. **Item type:** credential/learning resource. **Inputs:** Not applicable as a computational interface; the cited item is a knowledge, standard, or learning-resource claim. **Outputs:** The source-supported knowledge/criterion/learning scope is the claim text itself; no software output or interface is inferred. **Assumptions/limits:** Source-specific conditions and non-generalization limits: One recurring ETH course, not a universal credential, professional license or Nigerian curriculum mandate. **Source(s):** `D166-A1-ETH-AUTONOMOUS-CAR-VISION-COURSE-2025`. **Exact locator:** Official ETH catalogue, course abstract/outcomes/content/prerequisites, lines 14?65; Autumn Semester 2025. **Relationship evidence:** `context_only`; No universal prerequisite or D166 learner sequence is inferred. Source(s): `D166-A1-ETH-AUTONOMOUS-CAR-VISION-COURSE-2025`; locator: Official ETH catalogue, course abstract/outcomes/content/prerequisites, lines 14?65; Autumn Semester 2025..

#### `standards_credentials_and_learning_resources` / `emerging` - `mapped`

Candidate source IDs: `D166-ISO-21448`, `D166-ISO-23150-20-SENSOR-INTERFACES-2026`, `D166-ROS-REP-103-COORDINATE-CONVENTIONS`, `D166-WAYMO-PERCEPTION-DATA-SPECS`, `D166-NUSCENES-TRACKING-METRICS`, `D166-A1-ISO-PAS-8800-2024`. Query IDs: `D166-Q058`, `D166-A-QPACK-CLOSE-004`.

- **D166-A1-PERCEPTION-CLOSE-AI-STANDARD-EMERGING:** ISO/PAS 8800:2024 is a published automotive AI safety specification that includes vehicle-level risks from AI output insufficiencies and gives object detection as a safety-relevant example, while excluding specific AI tools guidance. **Item type:** standard/regulatory reference. **Inputs:** Not applicable as a computational interface; the cited item is a knowledge, standard, or learning-resource claim. **Outputs:** The source-supported knowledge/criterion/learning scope is the claim text itself; no software output or interface is inferred. **Assumptions/limits:** Source-specific conditions and non-generalization limits: Paid full text not reviewed; the PAS is vehicle-level AI safety context, not a perception-specific algorithm standard or credential. **Source(s):** `D166-A1-ISO-PAS-8800-2024`. **Exact locator:** Official ISO record, abstract, status and scope; full text not inspected. **Relationship evidence:** `context_only`; The item supports study or evaluation of perception and is not a prerequisite or algorithm. Source(s): `D166-A1-ISO-PAS-8800-2024`; locator: Official ISO record, abstract, status and scope; full text not inspected..

#### `standards_credentials_and_learning_resources` / `future/futuristic` - `mapped`

Candidate source IDs: `D166-A1-ISO-AWI-8800-1-2026`. Query IDs: `D166-A-QPACK-CLOSE-003`.

- **D166-A1-PERCEPTION-CLOSE-STANDARD-FUTURE:** As of 2026-10-24, ISO/AWI 8800-1 is an approved, early-stage work item to define concepts for vehicle AI safety, including risk from vehicle-level AI errors; it is not a published standard. **Item type:** standard/regulatory reference. **Inputs:** Not applicable as a computational interface; the cited item is a knowledge, standard, or learning-resource claim. **Outputs:** The source-supported knowledge/criterion/learning scope is the claim text itself; no software output or interface is inferred. **Assumptions/limits:** Source-specific conditions and non-generalization limits: Future-horizon evidence only. It does not provide current compliance obligations, specific perception requirements, algorithm guidance or performance thresholds. **Source(s):** `D166-A1-ISO-AWI-8800-1-2026`. **Exact locator:** Official ISO record, abstract and life-cycle status; stage 20.00, project registered 2026-10-07. **Relationship evidence:** `context_only`; No universal prerequisite or D166 learner sequence is inferred. Source(s): `D166-A1-ISO-AWI-8800-1-2026`; locator: Official ISO record, abstract and life-cycle status; stage 20.00, project registered 2026-10-07..

#### `outputs_and_downstream_role_context` / `established/traditional` - `mapped`

Candidate source IDs: `D166-A1-ARNOLD-3D-DETECTION-SURVEY-2019`. Query IDs: `D166-A-QPACK-CLOSE-003`.

- **D166-A1-PERCEPTION-CLOSE-OUTPUT-ESTABLISHED:** The source distinguishes image-plane 2D boxes from 3D detections that add depth, object size and world-coordinate position; it identifies planning and collision avoidance as downstream tasks that use this 3D information. **Item type:** system output/downstream role-task context. **Inputs:** Source-named input/context terms: image. These terms come from the claim; no additional input is inferred. **Outputs:** No separate output/interface is stated in the inspected claim/locator; none is inferred. **Assumptions/limits:** Source-specific conditions and non-generalization limits: Conceptual relationship stated by a survey; no exact software interface or mandatory learner sequence is established. **Source(s):** `D166-A1-ARNOLD-3D-DETECTION-SURVEY-2019`. **Exact locator:** Accepted manuscript pp.1?2, abstract, Introduction and Table I. **Relationship evidence:** `context_only`; No universal prerequisite or D166 learner sequence is inferred. Source(s): `D166-A1-ARNOLD-3D-DETECTION-SURVEY-2019`; locator: Accepted manuscript pp.1?2, abstract, Introduction and Table I..

#### `outputs_and_downstream_role_context` / `current` - `mapped`

Candidate source IDs: `D166-AUTOWARE-PERCEPTION-2026-10-22`, `D166-AUTOWARE-PERCEPTION-REFERENCE-2026`, `D166-WAYMO-PERCEPTION-DATA-SPECS`. Query IDs: `D166-Q046`.

- **D166-A-MAP-021:** In the documented Autoware stack, perception publishes object and scene representations for downstream planning components; message details remain implementation-specific. **Item type:** system output/downstream role-task context. **Inputs:** No concrete input is stated in the inspected claim/locator; none is inferred. **Outputs:** Source claim: In the documented Autoware stack, perception publishes object and scene representations for downstream planning components; message details remain implementation-specific. **Assumptions/limits:** Source-specific conditions and non-generalization limits: Reference architecture; algorithm choices and boundaries vary across systems. **Source(s):** `D166-AUTOWARE-PERCEPTION-2026-10-22`. **Exact locator:** Perception receives sensing, localization, and map inputs, adds semantic information such as object recognition, obstacle segmentation and traffic-light recognition, then passes outputs to planning. **Relationship evidence:** `context_only`; This mapping connects one source claim to one area/family/horizon cell; it asserts no item-to-item prerequisite, alternative, complement or producer-consumer relationship. Source(s): `D166-AUTOWARE-PERCEPTION-2026-10-22`; locator: Perception receives sensing, localization, and map inputs, adds semantic information such as object recognition, obstacle segmentation and traffic-light recognition, then passes outputs to planning..

#### `outputs_and_downstream_role_context` / `emerging` - `mapped`

Candidate source IDs: `D166-AUTOWARE-PERCEPTION-2026-10-22`, `D166-AUTOWARE-PERCEPTION-REFERENCE-2026`, `D166-WAYMO-PERCEPTION-DATA-SPECS`, `D166-A1-NIST-PERCEPTION-SENSITIVITY-2026`. Query IDs: `D166-Q046`.

- **D166-A-MAP-022:** The NIST abstract reports uncertainty/performance variation across selected scenario conditions, an evaluation output that can inform test prioritization but does not establish a safety threshold. **Item type:** system output/downstream role-task context. **Inputs:** No concrete input is stated in the inspected claim/locator; none is inferred. **Outputs:** Source claim: The NIST abstract reports uncertainty/performance variation across selected scenario conditions, an evaluation output that can inform test prioritization but does not establish a safety threshold. **Assumptions/limits:** Source-specific conditions and non-generalization limits: Abstract-only evidence; detailed methods, sample sizes, model configuration, statistical strength and generalization cannot be checked from the abstract. It does not establish a production-ready method, sensor requirement, safety guarantee or performance threshold. **Source(s):** `D166-A1-NIST-PERCEPTION-SENSITIVITY-2026`. **Exact locator:** NIST page, record metadata and abstract, especially abstract lines describing ensemble uncertainty evaluation across simulated and real adverse conditions, fog/low sun/occlusions and object-distance effects. **Relationship evidence:** `context_only`; This mapping connects one source claim to one area/family/horizon cell; it asserts no item-to-item prerequisite, alternative, complement or producer-consumer relationship. Source(s): `D166-A1-NIST-PERCEPTION-SENSITIVITY-2026`; locator: NIST page, record metadata and abstract, especially abstract lines describing ensemble uncertainty evaluation across simulated and real adverse conditions, fog/low sun/occlusions and object-distance effects..

#### `outputs_and_downstream_role_context` / `future/futuristic` - `bounded_no_hit`

Candidate source IDs: . Query IDs: `D166-A-QPACK-CLOSE-004`.

- **Bounded rationale:** Searches covered Autoware official design/interfaces, ISO AI-safety work items and future perception/sensor roadmaps; no concrete future output schema/consumer contract was identified.

- **Bounded rationale:** Limits: bounded English-language indexed/open-web search on 2026-10-24; not a claim that no such future work exists.

### Six task tracks

#### `foundation_and_prerequisites` - `complete`

**Topic focus:** Computer vision, geometry, probability, sensor characteristics and time/coordinate alignment; distinguish object/scene evidence from the perception outputs consumed by planning.
**Gap filler:** Search the area's source-defined task and skill requirements; extract underlying concepts, inputs, outputs and prerequisites. Separate true prerequisites from topics that are merely co-taught or often used together.
**Categories/horizons:** knowledge, competencies/skills, methods; established/traditional, current.
**Mapped cells:** foundations_knowledge_and_competencies / established/traditional; foundations_knowledge_and_competencies / current; methods_and_designs / established/traditional; methods_and_designs / current
**Assessed cells:** foundations_knowledge_and_competencies / established/traditional; foundations_knowledge_and_competencies / current; methods_and_designs / established/traditional; methods_and_designs / current
**Evidence IDs:** `D166-AUTOWARE-PERCEPTION-2026-10-22`, `D166-AUTOWARE-PERCEPTION-REFERENCE-2026`, `D166-AUTOWARE-SENSOR-CALIBRATION-TUTORIAL`, `D166-A1-ARNOLD-3D-DETECTION-SURVEY-2019`, `D166-TPAMI-IMAGE-3D-DETECTION-SURVEY-2024`, `D166-OCCUPANCY-PERCEPTION-SURVEY-2024`, `D166-NUSCENES-TRACKING-METRICS`
**Query IDs:** `D166-A-QPACK-01`, `D166-A-QPACK-05`, `D166-A-QPACK-07`, `D166-A-QPACK-08`, `D166-A-QPACK-CLOSE-002`, `D166-A-QPACK-CLOSE-003`, `D166-A-QPACK-CLOSE-004`
**Closure rationale:** Terminal complete disposition within original topic scope: reviewed 4 applicable cells (mapped=4). Mapped evidence is restricted to the linked claims; bounded no-hit cells record source/type/horizon exclusions and query limits. The dated area counter-search found no further supportable claim within this track.

**Counter-search tests/results:**

- Future work-item and survey claims remain work-item/abstract-level and do not prove deployed future methods or products.

- No licensed and directly inspected Nigerian road-perception dataset was established; global datasets have their own geography/access constraints.

- Role examples are employer-specific conditional tasks; canonical Software Developer fit and area routes remain unsupported/empty.

- camera/LiDAR/radar cross-modal differences

- dataset geography/labels/license limits

- future/model architecture claims versus deployed implementations

- historical staged versus end-to-end detection methods

- official university teaching outcomes and prerequisites

- published SOTIF/scenario standards versus AI-safety work items under development

- uncertainty-based evaluation and outputs

- weather/lighting and occlusion sensitivity

#### `methods_techniques_and_alternatives` - `complete`

**Topic focus:** Detection, classification, segmentation, tracking, occupancy/BEV, scene graphs, fusion and prediction-facing representations; compare classical vision, CNN, transformer, temporal and multimodal methods with metrics and ODD limits.
**Gap filler:** Search for named method families and their sub-techniques; compare alternatives by task, assumptions, data, output, validation and limitations. Record combinations only where the documented design requires a handoff.
**Categories/horizons:** methods/designs, techniques/estimators/algorithms; established/traditional, current, emerging.
**Mapped cells:** methods_and_designs / established/traditional; methods_and_designs / current; methods_and_designs / emerging; techniques_estimators_and_algorithms / established/traditional; techniques_estimators_and_algorithms / current; techniques_estimators_and_algorithms / emerging
**Assessed cells:** methods_and_designs / established/traditional; methods_and_designs / current; methods_and_designs / emerging; techniques_estimators_and_algorithms / established/traditional; techniques_estimators_and_algorithms / current; techniques_estimators_and_algorithms / emerging
**Evidence IDs:** `D166-AUTOWARE-PERCEPTION-REFERENCE-2026`, `D166-TPAMI-IMAGE-3D-DETECTION-SURVEY-2024`, `D166-OCCUPANCY-PERCEPTION-SURVEY-2024`, `D166-NUSCENES-TRACKING-METRICS`, `D166-A1-ARNOLD-3D-DETECTION-SURVEY-2019`, `D166-A1-NIST-PERCEPTION-SENSITIVITY-2026`, `D166-AUTOWARE-ARCH-V2-GENERATOR-SELECTOR`
**Query IDs:** `D166-A-QPACK-01`, `D166-A-QPACK-05`, `D166-A-QPACK-07`, `D166-A-QPACK-08`, `D166-A-QPACK-CLOSE-002`, `D166-A-QPACK-CLOSE-003`, `D166-A-QPACK-CLOSE-004`
**Closure rationale:** Terminal complete disposition within original topic scope: reviewed 6 applicable cells (mapped=6). Mapped evidence is restricted to the linked claims; bounded no-hit cells record source/type/horizon exclusions and query limits. The dated area counter-search found no further supportable claim within this track.

**Counter-search tests/results:**

- Future work-item and survey claims remain work-item/abstract-level and do not prove deployed future methods or products.

- No licensed and directly inspected Nigerian road-perception dataset was established; global datasets have their own geography/access constraints.

- Role examples are employer-specific conditional tasks; canonical Software Developer fit and area routes remain unsupported/empty.

- camera/LiDAR/radar cross-modal differences

- dataset geography/labels/license limits

- dataset labels/coordinates/annotation limits

- foundation-model perception capability claims versus actual deployable tools

- future/model architecture claims versus deployed implementations

- historical staged versus end-to-end detection methods

- multimodal input and planning-output boundaries

- official university teaching outcomes and prerequisites

- published SOTIF/scenario standards versus AI-safety work items under development

- stack-specific algorithm and modular design alternatives

- uncertainty-based evaluation and outputs

- weather/lighting and occlusion sensitivity

#### `tools_data_and_implementation` - `bounded_no_hit`

**Topic focus:** Perception frameworks, sensor datasets, annotation/evaluation tools, simulation and deployment runtimes; compare official stacks, dataset coverage/labels, compute, latency and benchmark limitations.
**Gap filler:** Find current tools, instruments, platforms and datasets actually used for the area's methods. Record exact use/context, alternatives, input/output compatibility, access/licensing and limitations; do not infer a tool from a method name.
**Categories/horizons:** tools/software/platforms, datasets/instruments/data standards; current, emerging.
**Mapped cells:** tools_software_and_data / current; tools_software_and_data / emerging
**Assessed cells:** tools_software_and_data / current; tools_software_and_data / emerging
**Evidence IDs:** `D166-WAYMO-PERCEPTION-DATA-SPECS`, `D166-NUSCENES-TRACKING-METRICS`, `D166-AUTOWARE-PERCEPTION-REFERENCE-2026`, `D166-A1-RAINSENSE-ZENODO-2025`, `D166-AUTOWARE-ARCH-V2-GENERATOR-SELECTOR`, `D166-OCCUPANCY-PERCEPTION-SURVEY-2024`, `D166-TPAMI-IMAGE-3D-DETECTION-SURVEY-2024`
**Query IDs:** `D166-A-QPACK-01`, `D166-A-QPACK-05`, `D166-A-QPACK-07`, `D166-A-QPACK-08`, `D166-A-QPACK-CLOSE-002`, `D166-A-QPACK-CLOSE-003`, `D166-A-QPACK-CLOSE-004`
**Closure rationale:** Terminal bounded_no_hit within original topic scope: reviewed 2 applicable cells (mapped=2). The dated counter-search found no defensible additional claim for this track after source and type/horizon limits were checked. Bounded result: No directly verified Nigerian road-perception dataset with inspected data files, license and sensor/label coverage was established; global datasets and their geographic/access limits were recorded. This closes the searched scope, not global absence.

**Counter-search tests/results:**

- AI safety standard status and scope

- Future work-item and survey claims remain work-item/abstract-level and do not prove deployed future methods or products.

- No licensed and directly inspected Nigerian road-perception dataset was established; global datasets have their own geography/access constraints.

- Role examples are employer-specific conditional tasks; canonical Software Developer fit and area routes remain unsupported/empty.

- camera/LiDAR/radar cross-modal differences

- dataset geography/labels/license limits

- dataset labels/coordinates/annotation limits

- foundation-model perception capability claims versus actual deployable tools

- future/model architecture claims versus deployed implementations

- long-horizon future sources versus emergent tools/data products

- multimodal input and planning-output boundaries

- official evaluation software and license restrictions

- stack-specific algorithm and modular design alternatives

- uncertainty-based evaluation and outputs

- weather/lighting and occlusion sensitivity

**Bounded remaining finding:**

- No directly verified Nigerian road-perception dataset with inspected data files, license and sensor/label coverage was established; global datasets and their geographic/access limits were recorded.

#### `emerging_and_future_frontier` - `bounded_no_hit`

**Topic focus:** Vision-language/foundation models, self-supervised and continual learning, neural scene representations and end-to-end perception only where current primary research or maintained projects support the claim; document safety and domain-shift limits.
**Gap filler:** Search recent work and credible roadmaps for material emerging methods/tools. Distinguish demonstrated research, pilot use, deployed practice and speculation; mark future/no-hit only after recording the actual query and evidence boundary.
**Categories/horizons:** knowledge, methods, techniques, tools; emerging, future/futuristic.
**Mapped cells:** foundations_knowledge_and_competencies / emerging; methods_and_designs / emerging; techniques_estimators_and_algorithms / emerging; tools_software_and_data / emerging
**Assessed cells:** foundations_knowledge_and_competencies / emerging; foundations_knowledge_and_competencies / future/futuristic; methods_and_designs / emerging; methods_and_designs / future/futuristic; techniques_estimators_and_algorithms / emerging; techniques_estimators_and_algorithms / future/futuristic; tools_software_and_data / emerging; tools_software_and_data / future/futuristic
**Evidence IDs:** `D166-AUTOWARE-ARCH-V2-GENERATOR-SELECTOR`, `D166-OCCUPANCY-PERCEPTION-SURVEY-2024`, `D166-TPAMI-IMAGE-3D-DETECTION-SURVEY-2024`, `D166-A1-NIST-PERCEPTION-SENSITIVITY-2026`, `D166-A1-FOUNDATION-PERCEPTION-SURVEY-2025`, `D166-AUTOWARE-PERCEPTION-REFERENCE-2026`, `D166-NUSCENES-TRACKING-METRICS`, `D166-WAYMO-PERCEPTION-DATA-SPECS`, `D166-A1-RAINSENSE-ZENODO-2025`
**Query IDs:** `D166-A-QPACK-01`, `D166-A-QPACK-05`, `D166-A-QPACK-07`, `D166-A-QPACK-08`, `D166-A-QPACK-CLOSE-002`, `D166-A-QPACK-CLOSE-003`, `D166-A-QPACK-CLOSE-004`
**Closure rationale:** Terminal bounded_no_hit within original topic scope: reviewed 8 applicable cells (mapped=4, bounded_no_hit=4). The dated counter-search found no defensible additional claim for this track after source and type/horizon limits were checked. Bounded result: No future validated perception method/tool/data product, curriculum/credential or output contract was confirmed; research and roadmap claims remain distinct from deployment. This closes the searched scope, not global absence.

**Counter-search tests/results:**

- AI safety standard status and scope

- Future work-item and survey claims remain work-item/abstract-level and do not prove deployed future methods or products.

- No licensed and directly inspected Nigerian road-perception dataset was established; global datasets have their own geography/access constraints.

- Role examples are employer-specific conditional tasks; canonical Software Developer fit and area routes remain unsupported/empty.

- camera/LiDAR/radar cross-modal differences

- dataset geography/labels/license limits

- dataset labels/coordinates/annotation limits

- foundation-model perception capability claims versus actual deployable tools

- future/model architecture claims versus deployed implementations

- long-horizon future sources versus emergent tools/data products

- multimodal input and planning-output boundaries

- official evaluation software and license restrictions

- stack-specific algorithm and modular design alternatives

- uncertainty-based evaluation and outputs

- weather/lighting and occlusion sensitivity

**Bounded remaining finding:**

- No future validated perception method/tool/data product, curriculum/credential or output contract was confirmed; research and roadmap claims remain distinct from deployment.

#### `standards_credentials_and_learning_resources` - `complete`

**Topic focus:** Applicable data, AI governance, safety and performance-evaluation standards; verified curriculum, credentials and instructional materials for perception engineering; label open research versus accepted practice.
**Gap filler:** Search applicable laws, standards, professional frameworks, credentials and structured learning materials. Verify scope, edition/status, jurisdiction and prerequisites; mark not-applicable only with a short source-backed reason.
**Categories/horizons:** standards/regulation, certifications/credentials, learning resources; current, emerging.
**Mapped cells:** standards_credentials_and_learning_resources / current; standards_credentials_and_learning_resources / emerging
**Assessed cells:** standards_credentials_and_learning_resources / current; standards_credentials_and_learning_resources / emerging
**Evidence IDs:** `D166-ISO-21448`, `D166-ISO-23150-20-SENSOR-INTERFACES-2026`, `D166-ROS-REP-103-COORDINATE-CONVENTIONS`, `D166-WAYMO-PERCEPTION-DATA-SPECS`, `D166-NUSCENES-TRACKING-METRICS`, `D166-A1-ETH-AUTONOMOUS-CAR-VISION-COURSE-2025`, `D166-A1-ISO-PAS-8800-2024`
**Query IDs:** `D166-A-QPACK-01`, `D166-A-QPACK-05`, `D166-A-QPACK-07`, `D166-A-QPACK-08`, `D166-A-QPACK-CLOSE-002`, `D166-A-QPACK-CLOSE-003`, `D166-A-QPACK-CLOSE-004`
**Closure rationale:** Terminal complete disposition within original topic scope: reviewed 2 applicable cells (mapped=2). Mapped evidence is restricted to the linked claims; bounded no-hit cells record source/type/horizon exclusions and query limits. The dated area counter-search found no further supportable claim within this track.

**Counter-search tests/results:**

- AI safety standard status and scope

- Future work-item and survey claims remain work-item/abstract-level and do not prove deployed future methods or products.

- No licensed and directly inspected Nigerian road-perception dataset was established; global datasets have their own geography/access constraints.

- Role examples are employer-specific conditional tasks; canonical Software Developer fit and area routes remain unsupported/empty.

- camera/LiDAR/radar cross-modal differences

- dataset geography/labels/license limits

- future/model architecture claims versus deployed implementations

- historical staged versus end-to-end detection methods

- long-horizon future sources versus emergent tools/data products

- official evaluation software and license restrictions

- official university teaching outcomes and prerequisites

- published SOTIF/scenario standards versus AI-safety work items under development

- uncertainty-based evaluation and outputs

- weather/lighting and occlusion sensitivity

#### `outputs_and_downstream_role_context` - `complete`

**Topic focus:** Objects/tracks, free-space/occupancy, semantics, confidence and prediction inputs used by localization, mapping and planning; conditional role context for perception/ML/software tasks from direct evidence.
**Gap filler:** Trace what the area produces, who consumes it downstream, and which roles use it under what conditions. Map item-to-task/output evidence with boundaries and counterexamples; keep role evidence separate from area-definition evidence and do not change canonical fit.
**Categories/horizons:** work outputs, role tasks/skills, downstream area links; current, emerging.
**Mapped cells:** outputs_and_downstream_role_context / current; outputs_and_downstream_role_context / emerging
**Assessed cells:** outputs_and_downstream_role_context / current; outputs_and_downstream_role_context / emerging
**Evidence IDs:** `D166-AUTOWARE-PERCEPTION-2026-10-22`, `D166-AUTOWARE-PERCEPTION-REFERENCE-2026`, `D166-WAYMO-PERCEPTION-DATA-SPECS`, `D166-A1-NIST-PERCEPTION-SENSITIVITY-2026`
**Query IDs:** `D166-A-QPACK-01`, `D166-A-QPACK-05`, `D166-A-QPACK-07`, `D166-A-QPACK-08`, `D166-A-QPACK-CLOSE-002`, `D166-A-QPACK-CLOSE-003`, `D166-A-QPACK-CLOSE-004`
**Closure rationale:** Terminal complete disposition within original topic scope: reviewed 2 applicable cells (mapped=2). Mapped evidence is restricted to the linked claims; bounded no-hit cells record source/type/horizon exclusions and query limits. The dated area counter-search found no further supportable claim within this track.

**Counter-search tests/results:**

- Future work-item and survey claims remain work-item/abstract-level and do not prove deployed future methods or products.

- No licensed and directly inspected Nigerian road-perception dataset was established; global datasets have their own geography/access constraints.

- Role examples are employer-specific conditional tasks; canonical Software Developer fit and area routes remain unsupported/empty.

- camera/LiDAR/radar cross-modal differences

- dataset geography/labels/license limits

- dataset labels/coordinates/annotation limits

- foundation-model perception capability claims versus actual deployable tools

- future/model architecture claims versus deployed implementations

- historical staged versus end-to-end detection methods

- multimodal input and planning-output boundaries

- official university teaching outcomes and prerequisites

- published SOTIF/scenario standards versus AI-safety work items under development

- stack-specific algorithm and modular design alternatives

- uncertainty-based evaluation and outputs

- weather/lighting and occlusion sensitivity

## High-Definition Mapping and Map Data (`D166:high-definition-mapping`)

**Boundary:** Build, maintain and use road-network, lane-level, vector and point-cloud map data that supports localization, route planning and scene interpretation.

| Family | Horizon | Disposition | Mapping IDs | Query IDs |
|---|---|---|---|---|
| `foundations_knowledge_and_competencies` | established/traditional | `mapped` | `D166-A-MAP-023` | `D166-Q045` |
| `foundations_knowledge_and_competencies` | current | `mapped` | `D166-A-MAP-024` | `D166-Q045` |
| `foundations_knowledge_and_competencies` | emerging | `mapped` | `D166-A-MAP-025` | `D166-Q045` |
| `foundations_knowledge_and_competencies` | future/futuristic | `bounded_no_hit` |  | `D166-A-QPACK-CLOSE-006`, `D166-Q045` |
| `methods_and_designs` | established/traditional | `mapped` | `D166-A1-HDMAP-METHOD-ESTABLISHED` | `D166-A-QPACK-CLOSE-006` |
| `methods_and_designs` | current | `mapped` | `D166-A1-HDMAP-METHOD-CURRENT` | `D166-A-QPACK-CLOSE-006` |
| `methods_and_designs` | emerging | `mapped` | `D166-A-MAP-028` | `D166-Q045` |
| `methods_and_designs` | future/futuristic | `bounded_no_hit` |  | `D166-A-QPACK-CLOSE-006` |
| `techniques_estimators_and_algorithms` | established/traditional | `mapped` | `D166-A1-HDMAP-TECH-ESTABLISHED` | `D166-A-QPACK-CLOSE-006` |
| `techniques_estimators_and_algorithms` | current | `mapped` | `D166-A1-HDMAP-TECH-CURRENT` | `D166-A-QPACK-CLOSE-006` |
| `techniques_estimators_and_algorithms` | emerging | `mapped` | `D166-A-MAP-031` | `D166-Q045` |
| `techniques_estimators_and_algorithms` | future/futuristic | `bounded_no_hit` |  | `D166-A-QPACK-CLOSE-006`, `D166-Q045` |
| `tools_software_and_data` | established/traditional | `bounded_no_hit` |  | `D166-A-QPACK-CLOSE-006` |
| `tools_software_and_data` | current | `mapped` | `D166-A-MAP-032` | `D166-Q045` |
| `tools_software_and_data` | emerging | `bounded_no_hit` |  | `D166-A-QPACK-CLOSE-006`, `D166-Q045` |
| `tools_software_and_data` | future/futuristic | `bounded_no_hit` |  | `D166-A-QPACK-CLOSE-006`, `D166-Q045` |
| `standards_credentials_and_learning_resources` | established/traditional | `bounded_no_hit` |  | `D166-A-QPACK-CLOSE-006` |
| `standards_credentials_and_learning_resources` | current | `mapped` | `D166-A-MAP-034` | `D166-Q045` |
| `standards_credentials_and_learning_resources` | emerging | `bounded_no_hit` |  | `D166-A-QPACK-CLOSE-006`, `D166-Q045` |
| `standards_credentials_and_learning_resources` | future/futuristic | `bounded_no_hit` |  | `D166-A-QPACK-CLOSE-006` |
| `outputs_and_downstream_role_context` | established/traditional | `mapped` | `D166-A1-HDMAP-OUTPUT-ESTABLISHED` | `D166-A-QPACK-CLOSE-006` |
| `outputs_and_downstream_role_context` | current | `mapped` | `D166-A-MAP-035` | `D166-Q045` |
| `outputs_and_downstream_role_context` | emerging | `mapped` | `D166-A-MAP-036` | `D166-Q045` |
| `outputs_and_downstream_role_context` | future/futuristic | `bounded_no_hit` |  | `D166-A-QPACK-CLOSE-006` |

### Cell-by-cell claims and no-hit scope

#### `foundations_knowledge_and_competencies` / `established/traditional` - `mapped`

Candidate source IDs: `D166-ASAM-OPENDRIVE-2026`, `D166-LANELET2-MAP-FRAMEWORK-PRIMARY`, `D166-LANELET2-ROUTING-AND-RULES`, `D166-APOLLO-MAP-LANE-SCHEMA`. Query IDs: `D166-Q045`.

- **D166-A-MAP-023:** OpenDRIVE represents static road-network content for simulation and traffic-simulation exchange; its established format concepts are distinct from an onboard production HD-map contract. **Item type:** knowledge/competency concept. **Inputs:** Not applicable as a computational interface; the cited item is a knowledge, standard, or learning-resource claim. **Outputs:** The source-supported knowledge/criterion/learning scope is the claim text itself; no software output or interface is inferred. **Assumptions/limits:** Source-specific conditions and non-generalization limits: ASAM standard scope and participating-industry context; it represents a technical exchange format, not a complete map-making task taxonomy, proof of map correctness, safety validation by itself, or legal requirement unless adopted. Verify revision status before implementation. **Source(s):** `D166-ASAM-OPENDRIVE-2026`. **Exact locator:** Official datasheet lists OpenDRIVE 1.9.0 released 2026-05-19; scope is static road-network description for driving/traffic simulation. The page says OpenDRIVE road networks, OpenCRG road surfaces and OpenSCENARIO dynamic content complement one another for in-the-loop vehicle simulation; the standard is free to view/download. **Relationship evidence:** `context_only`; This mapping connects one source claim to one area/family/horizon cell; it asserts no item-to-item prerequisite, alternative, complement or producer-consumer relationship. Source(s): `D166-ASAM-OPENDRIVE-2026`; locator: Official datasheet lists OpenDRIVE 1.9.0 released 2026-05-19; scope is static road-network description for driving/traffic simulation. The page says OpenDRIVE road networks, OpenCRG road surfaces and OpenSCENARIO dynamic content complement one another for in-the-loop vehicle simulation; the standard is free to view/download..

#### `foundations_knowledge_and_competencies` / `current` - `mapped`

Candidate source IDs: `D166-ASAM-OPENDRIVE-2026`, `D166-LANELET2-MAP-FRAMEWORK-PRIMARY`, `D166-LANELET2-ROUTING-AND-RULES`, `D166-APOLLO-MAP-LANE-SCHEMA`. Query IDs: `D166-Q045`.

- **D166-A-MAP-024:** The current ASAM OpenDRIVE specification is version 1.9.0 (released 2026-05); its scope remains static road-network description for simulation, not dynamic scene state. **Item type:** knowledge/competency concept. **Inputs:** Not applicable as a computational interface; the cited item is a knowledge, standard, or learning-resource claim. **Outputs:** The source-supported knowledge/criterion/learning scope is the claim text itself; no software output or interface is inferred. **Assumptions/limits:** Source-specific conditions and non-generalization limits: ASAM standard scope and participating-industry context; it represents a technical exchange format, not a complete map-making task taxonomy, proof of map correctness, safety validation by itself, or legal requirement unless adopted. Verify revision status before implementation. **Source(s):** `D166-ASAM-OPENDRIVE-2026`. **Exact locator:** Official datasheet lists OpenDRIVE 1.9.0 released 2026-05-19; scope is static road-network description for driving/traffic simulation. The page says OpenDRIVE road networks, OpenCRG road surfaces and OpenSCENARIO dynamic content complement one another for in-the-loop vehicle simulation; the standard is free to view/download. **Relationship evidence:** `context_only`; This mapping connects one source claim to one area/family/horizon cell; it asserts no item-to-item prerequisite, alternative, complement or producer-consumer relationship. Source(s): `D166-ASAM-OPENDRIVE-2026`; locator: Official datasheet lists OpenDRIVE 1.9.0 released 2026-05-19; scope is static road-network description for driving/traffic simulation. The page says OpenDRIVE road networks, OpenCRG road surfaces and OpenSCENARIO dynamic content complement one another for in-the-loop vehicle simulation; the standard is free to view/download..

#### `foundations_knowledge_and_competencies` / `emerging` - `mapped`

Candidate source IDs: `D166-ONLINE-TEMPORAL-VECTORIZED-MAP-CONSTRUCTION-2025`, `D166-E2E-MAP-GENERATION-SURVEY-2026`, `D166-CROWD-MAP-QUALITY-2026`, `D166-TAICS-HD-MAP-STANDARDS-REGISTER-2025`. Query IDs: `D166-Q045`.

- **D166-A-MAP-025:** The reviewed survey describes emerging automation directions for HD-map generation beyond classical surveying, point-cloud processing and manual annotation; it does not establish deployment maturity. **Item type:** knowledge/competency concept. **Inputs:** Not applicable as a computational interface; the cited item is a knowledge, standard, or learning-resource claim. **Outputs:** The source-supported knowledge/criterion/learning scope is the claim text itself; no software output or interface is inferred. **Assumptions/limits:** Source-specific conditions and non-generalization limits: Abstract-level in this pass and research survey; cannot establish actual industrial scale, production quality, or superiority over modular pipelines without the full article and referenced industrial evidence. **Source(s):** `D166-E2E-MAP-GENERATION-SURVEY-2026`. **Exact locator:** 2026 article metadata and English abstract inspected; published 2026-08-15/issue 2026-08-19. Covers lane-network generation, lane-topology prediction, direct structured map outputs and emerging large-model/VLM/agent research. **Relationship evidence:** `context_only`; This mapping connects one source claim to one area/family/horizon cell; it asserts no item-to-item prerequisite, alternative, complement or producer-consumer relationship. Source(s): `D166-E2E-MAP-GENERATION-SURVEY-2026`; locator: 2026 article metadata and English abstract inspected; published 2026-08-15/issue 2026-08-19. Covers lane-network generation, lane-topology prediction, direct structured map outputs and emerging large-model/VLM/agent research..

#### `foundations_knowledge_and_competencies` / `future/futuristic` - `bounded_no_hit`

Candidate source IDs: `D166-ONLINE-TEMPORAL-VECTORIZED-MAP-CONSTRUCTION-2025`, `D166-E2E-MAP-GENERATION-SURVEY-2026`, `D166-CROWD-MAP-QUALITY-2026`, `D166-TAICS-HD-MAP-STANDARDS-REGISTER-2025`. Query IDs: `D166-A-QPACK-CLOSE-006`, `D166-Q045`.

- **Bounded rationale:** Bounded no-hit for foundations_knowledge_and_competencies at future/futuristic. Checked: D166-ONLINE-TEMPORAL-VECTORIZED-MAP-CONSTRUCTION-2025: candidate named in the cell ledger and checked under its linked query; source-specific limit is in that query log. | D166-E2E-MAP-GENERATION-SURVEY-2026: checked as The reviewed survey describes emerging automation directions for HD-map generation beyond classical surveying, point-cloud processing and manual annotation; it does not establish d; limit: Abstract-level in this pass and research survey; cannot establish actual industrial scale, production quality, or superiority over | D166-CROWD-MAP-QUALITY-2026: candidate named in the cell ledger and checked under its linked query; source-specific limit is in that query log. | D166-TAICS-HD-MAP-STANDARDS-REGISTER-2025: candidate named in the cell ledger and checked under its linked query; source-specific limit is in that query log.. Query IDs: D166-A-QPACK-CLOSE-006, D166-Q045. The candidates support other source types, current contexts, or limited abstracts as stated above; none supports a distinct, correctly typed claim for this exact cell. Search is bounded to the linked opened records and dates, not global absence.

#### `methods_and_designs` / `established/traditional` - `mapped`

Candidate source IDs: `D166-TSUSHIMA-ETAL-HD-MAP-PRODUCTION-2020`. Query IDs: `D166-A-QPACK-CLOSE-006`.

- **D166-A1-HDMAP-METHOD-ESTABLISHED:** A documented production workflow uses mobile-mapping-system surveying, 3D plotting, feature-attribute editing and road-network topology building, format conversion, then quality assurance; it is a source-specific production design, not a universal prescribed pipeline. **Item type:** method/system design. **Inputs:** Source-named input/context terms: map. These terms come from the claim; no additional input is inferred. **Outputs:** No separate output/interface is stated in the inspected claim/locator; none is inferred. **Assumptions/limits:** Source-specific conditions and non-generalization limits: One 2020 case/pipeline; no universal method, global operational prevalence or current provider service inferred. **Source(s):** `D166-TSUSHIMA-ETAL-HD-MAP-PRODUCTION-2020`. **Exact locator:** Full open ISPRS Archives article, pp. 415-420; five production steps described in abstract and paper, DOI 10.5194/isprs-archives-XLIII-B4-2020-415-2020. **Relationship evidence:** `context_only`; The paper explicitly lists five sequential production stages; sequence here is a production pipeline claim, not a learner prerequisite. Source(s): `D166-TSUSHIMA-ETAL-HD-MAP-PRODUCTION-2020`; locator: Full open ISPRS Archives article, pp. 415-420; five production steps described in abstract and paper, DOI 10.5194/isprs-archives-XLIII-B4-2020-415-2020..

#### `methods_and_designs` / `current` - `mapped`

Candidate source IDs: `D166-AUTOWARE-MAP-CREATION-TUTORIAL-2026`. Query IDs: `D166-A-QPACK-CLOSE-006`.

- **D166-A1-HDMAP-METHOD-CURRENT:** Autoware's current documented workflow separates point-cloud map creation from vector-map authoring: a LiDAR SLAM package can create a PCD map and a vector-map editor can create Lanelet2 OSM; the system then loads the prepared files. **Item type:** method/system design. **Inputs:** Source-named input/context terms: lidar, map. These terms come from the claim; no additional input is inferred. **Outputs:** No separate output/interface is stated in the inspected claim/locator; none is inferred. **Assumptions/limits:** Source-specific conditions and non-generalization limits: Official stack-specific tutorial; it does not establish vendor-neutral best practice or production-scale map-service availability. **Source(s):** `D166-AUTOWARE-MAP-CREATION-TUTORIAL-2026`. **Exact locator:** Official Autoware tutorial, map creation and map loading sections; opened 2026-10-24. **Relationship evidence:** `context_only`; Point-cloud and vector map outputs are separate inputs to the map subsystem; no co-occurrence-based prerequisite asserted. Source(s): `D166-AUTOWARE-MAP-CREATION-TUTORIAL-2026`; locator: Official Autoware tutorial, map creation and map loading sections; opened 2026-10-24..

#### `methods_and_designs` / `emerging` - `mapped`

Candidate source IDs: `D166-TSUSHIMA-ETAL-HD-MAP-PRODUCTION-2020`, `D166-ARGOVERSE-MAP-CHANGE-DATASET`, `D166-ONLINE-TEMPORAL-VECTORIZED-MAP-CONSTRUCTION-2025`, `D166-ASRAT-CHO-HD-MAP-SURVEY-2024`, `D166-A1-IMPERIAL-ROADWORKS-HD-MAP-2026`. Query IDs: `D166-Q045`.

- **D166-A-MAP-028:** The Imperial study proposes a roadworks-to-map-update workflow using monocular imagery and a CLIP-based vision-language model, evaluated on UK motorway data; full text was not reviewed. **Item type:** method/system design. **Inputs:** Source-named input/context terms: image, map. These terms come from the claim; no additional input is inferred. **Outputs:** No separate output/interface is stated in the inspected claim/locator; none is inferred. **Assumptions/limits:** Source-specific conditions and non-generalization limits: Full methods and experimental details were not reviewed. Results are one published system and UK motorway evaluation; they do not prove production deployment, global transfer or replacement of survey/map-QA processes. **Source(s):** `D166-A1-IMPERIAL-ROADWORKS-HD-MAP-2026`. **Exact locator:** Imperial Spiral record abstract and publication/licence metadata; abstract describes monocular-camera roadworks-sign recognition and incremental OpenDRIVE updates, with reported UK motorway trials. **Relationship evidence:** `context_only`; This mapping connects one source claim to one area/family/horizon cell; it asserts no item-to-item prerequisite, alternative, complement or producer-consumer relationship. Source(s): `D166-A1-IMPERIAL-ROADWORKS-HD-MAP-2026`; locator: Imperial Spiral record abstract and publication/licence metadata; abstract describes monocular-camera roadworks-sign recognition and incremental OpenDRIVE updates, with reported UK motorway trials..

#### `methods_and_designs` / `future/futuristic` - `bounded_no_hit`

Candidate source IDs: . Query IDs: `D166-A-QPACK-CLOSE-006`.

- **Bounded rationale:** No supported methods_and_designs item was found for future/futuristic. The exact counter-search scope and result are: D166-A-QPACK-CLOSE-006 (2026-10-24): actual searches: HD map production mapping workflow surveying point cloud manual annotation autonomous driving Tsushima 2020 open access; site:argoverse.org HD map API lane segment map data dataset map change detection; site:github.com Autoware Lanelet2 map validation tool map creation official Autoware mapping; Nigeria Africa autonomous driving high definition map road dataset OpenStreetMap roads open data HD map; autonomous driving HD map future methods tools standards credentials 2030 roadmap mapless localization; opened: https://autowarefoundation.github.io/autoware_core/latest/map/autoware_map_loader/; https://github.com/autowarefoundation/autoware-documentation/blob/main/docs/tutorials/integrating-autoware/overview.md; https://github.com/tier4/autoware_lanelet2_map_validator; https://www.asam.net/standards/detail/opendrive/; https://isprs-archives.copernicus.org/articles/XLIII-B4-2020/415/2020/index.html; https://essd.copernicus.org/articles/18/267/2026/index.html; https://roads.anambrastate.gov.ng/open-data; findings: Directly inspected the 2020 production workflow (mobile mapping survey, 3D plotting, feature attributes/topology, conversion, QA), current Autoware mapping/load interfaces, Lanelet2 validation tool, and ASAM OpenDRIVE 1.9.0. The Africa road-surface dataset and Anambra public works register are useful regional road context but are not onboard AV HD lane maps, and their access/licence scopes do not establish a local AV map product. Search results surfaced research forecasts and map-generation papers, but no validated future map method/tool/standard/credential/output contract.; limits: The Imperial 2026 paper is abstract-only for methods/deployment; research papers do not establish production map services. The Africa road-surface dataset is regional road-surface context, not lane-level HD data. Anambra Road Tracker covers public works projects, not AV maps. The English-language official/research search cannot prove no private or non-English regional provider exists.. The inspected evidence supports other horizons/item types or does not expose enough content for this cell; no unsupported claim is substituted. This is a bounded search disposition, not a pending track or global absence claim.

#### `techniques_estimators_and_algorithms` / `established/traditional` - `mapped`

Candidate source IDs: `D166-TSUSHIMA-ETAL-HD-MAP-PRODUCTION-2020`. Query IDs: `D166-A-QPACK-CLOSE-006`.

- **D166-A1-HDMAP-TECH-ESTABLISHED:** The reviewed production workflow identifies MMS survey, 3D plotting, semantic feature editing, topology construction, format conversion and QA as concrete HD-map production techniques; the source does not specify a general estimator or algorithm. **Item type:** technique/estimator/algorithm. **Inputs:** Source-named input/context terms: map. These terms come from the claim; no additional input is inferred. **Outputs:** No separate output/interface is stated in the inspected claim/locator; none is inferred. **Assumptions/limits:** Source-specific conditions and non-generalization limits: These are techniques, not a universal automated estimator; no quantitative generalization claim is made. **Source(s):** `D166-TSUSHIMA-ETAL-HD-MAP-PRODUCTION-2020`. **Exact locator:** Full open ISPRS Archives article, pp. 415-420; methods/production-line sections describing survey, plotting, attributes/topology, conversion and QA. **Relationship evidence:** `context_only`; QA is the final described stage after authoring/conversion in the source-specific pipeline; no graph or learner sequence is implied. Source(s): `D166-TSUSHIMA-ETAL-HD-MAP-PRODUCTION-2020`; locator: Full open ISPRS Archives article, pp. 415-420; methods/production-line sections describing survey, plotting, attributes/topology, conversion and QA..

#### `techniques_estimators_and_algorithms` / `current` - `mapped`

Candidate source IDs: `D166-AUTOWARE-MAP-CREATION-TUTORIAL-2026`. Query IDs: `D166-A-QPACK-CLOSE-006`.

- **D166-A1-HDMAP-TECH-CURRENT:** The current Autoware tutorial describes creating point-cloud maps with third-party LiDAR SLAM and creating Lanelet2 vector maps with a vector-map editor; it demonstrates a tool-mediated workflow rather than a single estimator. **Item type:** technique/estimator/algorithm. **Inputs:** Source-named input/context terms: lidar, map. These terms come from the claim; no additional input is inferred. **Outputs:** No separate output/interface is stated in the inspected claim/locator; none is inferred. **Assumptions/limits:** Source-specific conditions and non-generalization limits: Technique-level description; it does not support universal precision, update cadence or deployment claims. **Source(s):** `D166-AUTOWARE-MAP-CREATION-TUTORIAL-2026`. **Exact locator:** Official tutorial, 'Create pointcloud map' and 'Create vector map' sections; opened 2026-10-24. **Relationship evidence:** `context_only`; The two map representations feed the documented map subsystem; the tutorial does not state that every deployment requires both in every operating mode. Source(s): `D166-AUTOWARE-MAP-CREATION-TUTORIAL-2026`; locator: Official tutorial, 'Create pointcloud map' and 'Create vector map' sections; opened 2026-10-24..

#### `techniques_estimators_and_algorithms` / `emerging` - `mapped`

Candidate source IDs: `D166-TSUSHIMA-ETAL-HD-MAP-PRODUCTION-2020`, `D166-ARGOVERSE-MAP-CHANGE-DATASET`, `D166-ONLINE-TEMPORAL-VECTORIZED-MAP-CONSTRUCTION-2025`, `D166-ASRAT-CHO-HD-MAP-SURVEY-2024`, `D166-E2E-MAP-GENERATION-SURVEY-2026`, `D166-CROWD-MAP-QUALITY-2026`, `D166-TAICS-HD-MAP-STANDARDS-REGISTER-2025`, `D166-A1-IMPERIAL-ROADWORKS-HD-MAP-2026`. Query IDs: `D166-Q045`.

- **D166-A-MAP-031:** The Imperial abstract?s specific emerging technique is vision-language detection of roadworks signs followed by incremental OpenDRIVE map updates; generalization and operational readiness are unverified. **Item type:** technique/estimator/algorithm. **Inputs:** Source-named input/context terms: map. These terms come from the claim; no additional input is inferred. **Outputs:** No separate output/interface is stated in the inspected claim/locator; none is inferred. **Assumptions/limits:** Source-specific conditions and non-generalization limits: Full methods and experimental details were not reviewed. Results are one published system and UK motorway evaluation; they do not prove production deployment, global transfer or replacement of survey/map-QA processes. **Source(s):** `D166-A1-IMPERIAL-ROADWORKS-HD-MAP-2026`. **Exact locator:** Imperial Spiral record abstract and publication/licence metadata; abstract describes monocular-camera roadworks-sign recognition and incremental OpenDRIVE updates, with reported UK motorway trials. **Relationship evidence:** `context_only`; This mapping connects one source claim to one area/family/horizon cell; it asserts no item-to-item prerequisite, alternative, complement or producer-consumer relationship. Source(s): `D166-A1-IMPERIAL-ROADWORKS-HD-MAP-2026`; locator: Imperial Spiral record abstract and publication/licence metadata; abstract describes monocular-camera roadworks-sign recognition and incremental OpenDRIVE updates, with reported UK motorway trials..

#### `techniques_estimators_and_algorithms` / `future/futuristic` - `bounded_no_hit`

Candidate source IDs: `D166-ONLINE-TEMPORAL-VECTORIZED-MAP-CONSTRUCTION-2025`, `D166-E2E-MAP-GENERATION-SURVEY-2026`, `D166-CROWD-MAP-QUALITY-2026`, `D166-TAICS-HD-MAP-STANDARDS-REGISTER-2025`. Query IDs: `D166-A-QPACK-CLOSE-006`, `D166-Q045`.

- **Bounded rationale:** Bounded no-hit for techniques_estimators_and_algorithms at future/futuristic. Checked: D166-ONLINE-TEMPORAL-VECTORIZED-MAP-CONSTRUCTION-2025: candidate named in the cell ledger and checked under its linked query; source-specific limit is in that query log. | D166-E2E-MAP-GENERATION-SURVEY-2026: checked as The reviewed survey describes emerging automation directions for HD-map generation beyond classical surveying, point-cloud processing and manual annotation; it does not establish d; limit: Abstract-level in this pass and research survey; cannot establish actual industrial scale, production quality, or superiority over | D166-CROWD-MAP-QUALITY-2026: candidate named in the cell ledger and checked under its linked query; source-specific limit is in that query log. | D166-TAICS-HD-MAP-STANDARDS-REGISTER-2025: candidate named in the cell ledger and checked under its linked query; source-specific limit is in that query log.. Query IDs: D166-A-QPACK-CLOSE-006, D166-Q045. The candidates support other source types, current contexts, or limited abstracts as stated above; none supports a distinct, correctly typed claim for this exact cell. Search is bounded to the linked opened records and dates, not global absence.

#### `tools_software_and_data` / `established/traditional` - `bounded_no_hit`

Candidate source IDs: . Query IDs: `D166-A-QPACK-CLOSE-006`.

- **Bounded rationale:** No supported tools_software_and_data item was found for established/traditional. The exact counter-search scope and result are: D166-A-QPACK-CLOSE-006 (2026-10-24): actual searches: HD map production mapping workflow surveying point cloud manual annotation autonomous driving Tsushima 2020 open access; site:argoverse.org HD map API lane segment map data dataset map change detection; site:github.com Autoware Lanelet2 map validation tool map creation official Autoware mapping; Nigeria Africa autonomous driving high definition map road dataset OpenStreetMap roads open data HD map; autonomous driving HD map future methods tools standards credentials 2030 roadmap mapless localization; opened: https://autowarefoundation.github.io/autoware_core/latest/map/autoware_map_loader/; https://github.com/autowarefoundation/autoware-documentation/blob/main/docs/tutorials/integrating-autoware/overview.md; https://github.com/tier4/autoware_lanelet2_map_validator; https://www.asam.net/standards/detail/opendrive/; https://isprs-archives.copernicus.org/articles/XLIII-B4-2020/415/2020/index.html; https://essd.copernicus.org/articles/18/267/2026/index.html; https://roads.anambrastate.gov.ng/open-data; findings: Directly inspected the 2020 production workflow (mobile mapping survey, 3D plotting, feature attributes/topology, conversion, QA), current Autoware mapping/load interfaces, Lanelet2 validation tool, and ASAM OpenDRIVE 1.9.0. The Africa road-surface dataset and Anambra public works register are useful regional road context but are not onboard AV HD lane maps, and their access/licence scopes do not establish a local AV map product. Search results surfaced research forecasts and map-generation papers, but no validated future map method/tool/standard/credential/output contract.; limits: The Imperial 2026 paper is abstract-only for methods/deployment; research papers do not establish production map services. The Africa road-surface dataset is regional road-surface context, not lane-level HD data. Anambra Road Tracker covers public works projects, not AV maps. The English-language official/research search cannot prove no private or non-English regional provider exists.. The inspected evidence supports other horizons/item types or does not expose enough content for this cell; no unsupported claim is substituted. This is a bounded search disposition, not a pending track or global absence claim.

#### `tools_software_and_data` / `current` - `mapped`

Candidate source IDs: `D166-AUTOWARE-MAP-CREATION-TUTORIAL-2026`, `D166-LANELET2-MAP-VALIDATION`, `D166-ARGOVERSE-HD-MAP-API`, `D166-ARGOVERSE-MAP-CHANGE-DATASET`, `D166-ASAM-OPENDRIVE-2026`. Query IDs: `D166-Q045`.

- **D166-A-MAP-032:** Autoware documents concrete vector-map creation tools: its recommended free web-based Vector Map Builder authors lanes and regulatory elements against a point-cloud map; MapToolbox and JOSM are open-source options. The tutorial limits bag2lanelet to single-lane maps. **Item type:** software/tool/platform. **Inputs:** Source-stated input: point-cloud map; bag2lanelet additionally uses self-location data from a rosbag. **Outputs:** Source-stated outputs: Lanelet2 vector map with lanes and regulatory elements; bag2lanelet output is limited to simple single-lane maps. **Assumptions/limits:** The tool choice assumes the learner is creating an Autoware-compatible vector map and has a point-cloud reference; tool/provider, map compatibility and coverage vary by implementation. **Source(s):** `D166-AUTOWARE-MAP-CREATION-TUTORIAL-2026`. **Exact locator:** Official Autoware Foundation ?Creating maps? documentation, lines 686-691 (Vector Map Builder, MapToolbox, JOSM and limits); lines 682-685 (bag2lanelet single-lane limit), opened 2026-10-24. **Relationship evidence:** `complement`; Autoware requires point-cloud and vector maps for its operating environment; Vector Map Builder authors vector lanes/regulatory elements using the point cloud as reference. Source(s): `D166-AUTOWARE-MAP-CREATION-TUTORIAL-2026`; locator: Official Autoware Foundation Creating maps, lines 673, 686-691, accessed 2026-10-24..

#### `tools_software_and_data` / `emerging` - `bounded_no_hit`

Candidate source IDs: `D166-AUTOWARE-MAP-CREATION-TUTORIAL-2026`, `D166-LANELET2-MAP-VALIDATION`, `D166-ARGOVERSE-HD-MAP-API`, `D166-ARGOVERSE-MAP-CHANGE-DATASET`, `D166-ASAM-OPENDRIVE-2026`, `D166-ONLINE-TEMPORAL-VECTORIZED-MAP-CONSTRUCTION-2025`, `D166-E2E-MAP-GENERATION-SURVEY-2026`, `D166-CROWD-MAP-QUALITY-2026`, `D166-TAICS-HD-MAP-STANDARDS-REGISTER-2025`, `D166-A1-IMPERIAL-ROADWORKS-HD-MAP-2026`. Query IDs: `D166-A-QPACK-CLOSE-006`, `D166-Q045`.

- **Bounded rationale:** Bounded no-hit for tools_software_and_data at emerging. Checked: D166-AUTOWARE-MAP-CREATION-TUTORIAL-2026: checked as Concrete map acquisition, point-cloud/vector construction, semantic regulatory-element authoring and format integration workflow for one AV stack.; limit: Autoware-compatible workflow, not a universal production process. The lightweight bag2lanelet path is explicitly limited and shoul | D166-LANELET2-MAP-VALIDATION: candidate named in the cell ledger and checked under its linked query; source-specific limit is in that query log. | D166-ARGOVERSE-HD-MAP-API: candidate named in the cell ledger and checked under its linked query; source-specific limit is in that query log. | D166-ARGOVERSE-MAP-CHANGE-DATASET: candidate named in the cell ledger and checked under its linked query; source-specific limit is in that query log. | D166-ASAM-OPENDRIVE-2026: checked as Official ASAM page lists version 1.9.0 released 2026-05-19, with scope as static road-network description for simulation/traffic simulation.; limit: Simulation road-network exchange format; not proof of a production AV map, localization quality or universally adopted onboard map | D166-ONLINE-TEMPORAL-VECTORIZED-MAP-CONSTRUCTION-2025: candidate named in the cell ledger and checked under its linked query; source-specific limit is in that query log. | D166-E2E-MAP-GENERATION-SURVEY-2026: checked as The reviewed survey describes emerging automation directions for HD-map generation beyond classical surveying, point-cloud processing and manual annotation; it does not establish d; limit: Abstract-level in this pass and research survey; cannot establish actual industrial scale, production quality, or superiority over | D166-CROWD-MAP-QUALITY-2026: candidate named in the cell ledger and checked under its linked query; source-specific limit is in that query log. | D166-TAICS-HD-MAP-STANDARDS-REGISTER-2025: candidate named in the cell ledger and checked under its linked query; source-specific limit is in that query log. | D166-A1-IMPERIAL-ROADWORKS-HD-MAP-2026: checked as The abstract reports a research pipeline using monocular images and a CLIP-based vision-language model to identify roadworks signs and make incremental OpenDRIVE map updates; it re; limit: Full methods and experimental details were not reviewed. Results are one published system and UK motorway evaluation; they do not . Query IDs: D166-A-QPACK-CLOSE-006, D166-Q045. The candidates support other source types, current contexts, or limited abstracts as stated above; none supports a distinct, correctly typed claim for this exact cell. Search is bounded to the linked opened records and dates, not global absence.

#### `tools_software_and_data` / `future/futuristic` - `bounded_no_hit`

Candidate source IDs: `D166-ONLINE-TEMPORAL-VECTORIZED-MAP-CONSTRUCTION-2025`, `D166-E2E-MAP-GENERATION-SURVEY-2026`, `D166-CROWD-MAP-QUALITY-2026`, `D166-TAICS-HD-MAP-STANDARDS-REGISTER-2025`. Query IDs: `D166-A-QPACK-CLOSE-006`, `D166-Q045`.

- **Bounded rationale:** Bounded no-hit for tools_software_and_data at future/futuristic. Checked: D166-ONLINE-TEMPORAL-VECTORIZED-MAP-CONSTRUCTION-2025: candidate named in the cell ledger and checked under its linked query; source-specific limit is in that query log. | D166-E2E-MAP-GENERATION-SURVEY-2026: checked as The reviewed survey describes emerging automation directions for HD-map generation beyond classical surveying, point-cloud processing and manual annotation; it does not establish d; limit: Abstract-level in this pass and research survey; cannot establish actual industrial scale, production quality, or superiority over | D166-CROWD-MAP-QUALITY-2026: candidate named in the cell ledger and checked under its linked query; source-specific limit is in that query log. | D166-TAICS-HD-MAP-STANDARDS-REGISTER-2025: candidate named in the cell ledger and checked under its linked query; source-specific limit is in that query log.. Query IDs: D166-A-QPACK-CLOSE-006, D166-Q045. The candidates support other source types, current contexts, or limited abstracts as stated above; none supports a distinct, correctly typed claim for this exact cell. Search is bounded to the linked opened records and dates, not global absence.

#### `standards_credentials_and_learning_resources` / `established/traditional` - `bounded_no_hit`

Candidate source IDs: . Query IDs: `D166-A-QPACK-CLOSE-006`.

- **Bounded rationale:** No supported standards_credentials_and_learning_resources item was found for established/traditional. The exact counter-search scope and result are: D166-A-QPACK-CLOSE-006 (2026-10-24): actual searches: HD map production mapping workflow surveying point cloud manual annotation autonomous driving Tsushima 2020 open access; site:argoverse.org HD map API lane segment map data dataset map change detection; site:github.com Autoware Lanelet2 map validation tool map creation official Autoware mapping; Nigeria Africa autonomous driving high definition map road dataset OpenStreetMap roads open data HD map; autonomous driving HD map future methods tools standards credentials 2030 roadmap mapless localization; opened: https://autowarefoundation.github.io/autoware_core/latest/map/autoware_map_loader/; https://github.com/autowarefoundation/autoware-documentation/blob/main/docs/tutorials/integrating-autoware/overview.md; https://github.com/tier4/autoware_lanelet2_map_validator; https://www.asam.net/standards/detail/opendrive/; https://isprs-archives.copernicus.org/articles/XLIII-B4-2020/415/2020/index.html; https://essd.copernicus.org/articles/18/267/2026/index.html; https://roads.anambrastate.gov.ng/open-data; findings: Directly inspected the 2020 production workflow (mobile mapping survey, 3D plotting, feature attributes/topology, conversion, QA), current Autoware mapping/load interfaces, Lanelet2 validation tool, and ASAM OpenDRIVE 1.9.0. The Africa road-surface dataset and Anambra public works register are useful regional road context but are not onboard AV HD lane maps, and their access/licence scopes do not establish a local AV map product. Search results surfaced research forecasts and map-generation papers, but no validated future map method/tool/standard/credential/output contract.; limits: The Imperial 2026 paper is abstract-only for methods/deployment; research papers do not establish production map services. The Africa road-surface dataset is regional road-surface context, not lane-level HD data. Anambra Road Tracker covers public works projects, not AV maps. The English-language official/research search cannot prove no private or non-English regional provider exists.. The inspected evidence supports other horizons/item types or does not expose enough content for this cell; no unsupported claim is substituted. This is a bounded search disposition, not a pending track or global absence claim.

#### `standards_credentials_and_learning_resources` / `current` - `mapped`

Candidate source IDs: `D166-ASAM-OPENDRIVE-2026`, `D166-ASAM-OPENCRG-ROAD-SURFACE`, `D166-ASAM-OPENSCENARIO-STATIC-DYNAMIC-CONTENT`, `D166-TAICS-HD-MAP-STANDARDS-REGISTER-2025`. Query IDs: `D166-Q045`.

- **D166-A-MAP-034:** HD map data representation and simulation-infrastructure context; explains how static road-network data connects with road surface and dynamic-scenario standards for testing and simulation workflows. **Item type:** standard/regulatory reference. **Inputs:** Not applicable as a computational interface; the cited item is a knowledge, standard, or learning-resource claim. **Outputs:** The source-supported knowledge/criterion/learning scope is the claim text itself; no software output or interface is inferred. **Assumptions/limits:** Source-specific conditions and non-generalization limits: ASAM standard scope and participating-industry context; it represents a technical exchange format, not a complete map-making task taxonomy, proof of map correctness, safety validation by itself, or legal requirement unless adopted. Verify revision status before implementation. **Source(s):** `D166-ASAM-OPENDRIVE-2026`. **Exact locator:** Official datasheet lists OpenDRIVE 1.9.0 released 2026-05-19; scope is static road-network description for driving/traffic simulation. The page says OpenDRIVE road networks, OpenCRG road surfaces and OpenSCENARIO dynamic content complement one another for in-the-loop vehicle simulation; the standard is free to view/download. **Relationship evidence:** `context_only`; This mapping connects one source claim to one area/family/horizon cell; it asserts no item-to-item prerequisite, alternative, complement or producer-consumer relationship. Source(s): `D166-ASAM-OPENDRIVE-2026`; locator: Official datasheet lists OpenDRIVE 1.9.0 released 2026-05-19; scope is static road-network description for driving/traffic simulation. The page says OpenDRIVE road networks, OpenCRG road surfaces and OpenSCENARIO dynamic content complement one another for in-the-loop vehicle simulation; the standard is free to view/download..

#### `standards_credentials_and_learning_resources` / `emerging` - `bounded_no_hit`

Candidate source IDs: `D166-ASAM-OPENDRIVE-2026`, `D166-ASAM-OPENCRG-ROAD-SURFACE`, `D166-ASAM-OPENSCENARIO-STATIC-DYNAMIC-CONTENT`, `D166-TAICS-HD-MAP-STANDARDS-REGISTER-2025`. Query IDs: `D166-A-QPACK-CLOSE-006`, `D166-Q045`.

- **Bounded rationale:** Bounded no-hit for standards_credentials_and_learning_resources at emerging. Checked: D166-ASAM-OPENDRIVE-2026: checked as Official ASAM page lists version 1.9.0 released 2026-05-19, with scope as static road-network description for simulation/traffic simulation.; limit: Simulation road-network exchange format; not proof of a production AV map, localization quality or universally adopted onboard map | D166-ASAM-OPENCRG-ROAD-SURFACE: candidate named in the cell ledger and checked under its linked query; source-specific limit is in that query log. | D166-ASAM-OPENSCENARIO-STATIC-DYNAMIC-CONTENT: candidate named in the cell ledger and checked under its linked query; source-specific limit is in that query log. | D166-TAICS-HD-MAP-STANDARDS-REGISTER-2025: candidate named in the cell ledger and checked under its linked query; source-specific limit is in that query log.. Query IDs: D166-A-QPACK-CLOSE-006, D166-Q045. The candidates support other source types, current contexts, or limited abstracts as stated above; none supports a distinct, correctly typed claim for this exact cell. Search is bounded to the linked opened records and dates, not global absence.

#### `standards_credentials_and_learning_resources` / `future/futuristic` - `bounded_no_hit`

Candidate source IDs: . Query IDs: `D166-A-QPACK-CLOSE-006`.

- **Bounded rationale:** No supported standards_credentials_and_learning_resources item was found for future/futuristic. The exact counter-search scope and result are: D166-A-QPACK-CLOSE-006 (2026-10-24): actual searches: HD map production mapping workflow surveying point cloud manual annotation autonomous driving Tsushima 2020 open access; site:argoverse.org HD map API lane segment map data dataset map change detection; site:github.com Autoware Lanelet2 map validation tool map creation official Autoware mapping; Nigeria Africa autonomous driving high definition map road dataset OpenStreetMap roads open data HD map; autonomous driving HD map future methods tools standards credentials 2030 roadmap mapless localization; opened: https://autowarefoundation.github.io/autoware_core/latest/map/autoware_map_loader/; https://github.com/autowarefoundation/autoware-documentation/blob/main/docs/tutorials/integrating-autoware/overview.md; https://github.com/tier4/autoware_lanelet2_map_validator; https://www.asam.net/standards/detail/opendrive/; https://isprs-archives.copernicus.org/articles/XLIII-B4-2020/415/2020/index.html; https://essd.copernicus.org/articles/18/267/2026/index.html; https://roads.anambrastate.gov.ng/open-data; findings: Directly inspected the 2020 production workflow (mobile mapping survey, 3D plotting, feature attributes/topology, conversion, QA), current Autoware mapping/load interfaces, Lanelet2 validation tool, and ASAM OpenDRIVE 1.9.0. The Africa road-surface dataset and Anambra public works register are useful regional road context but are not onboard AV HD lane maps, and their access/licence scopes do not establish a local AV map product. Search results surfaced research forecasts and map-generation papers, but no validated future map method/tool/standard/credential/output contract.; limits: The Imperial 2026 paper is abstract-only for methods/deployment; research papers do not establish production map services. The Africa road-surface dataset is regional road-surface context, not lane-level HD data. Anambra Road Tracker covers public works projects, not AV maps. The English-language official/research search cannot prove no private or non-English regional provider exists.. The inspected evidence supports other horizons/item types or does not expose enough content for this cell; no unsupported claim is substituted. This is a bounded search disposition, not a pending track or global absence claim.

#### `outputs_and_downstream_role_context` / `established/traditional` - `mapped`

Candidate source IDs: `D166-TSUSHIMA-ETAL-HD-MAP-PRODUCTION-2020`. Query IDs: `D166-A-QPACK-CLOSE-006`.

- **D166-A1-HDMAP-OUTPUT-ESTABLISHED:** The production paper treats the validated HD map as the pipeline output after surveying, 3D plotting, feature/topology editing and conversion, with QA as an explicit release check. **Item type:** system output/downstream role-task context. **Inputs:** Source-named input/context terms: map. These terms come from the claim; no additional input is inferred. **Outputs:** No separate output/interface is stated in the inspected claim/locator; none is inferred. **Assumptions/limits:** Source-specific conditions and non-generalization limits: No universal acceptance threshold, runtime interface, or production operation is inferred. **Source(s):** `D166-TSUSHIMA-ETAL-HD-MAP-PRODUCTION-2020`. **Exact locator:** Full open ISPRS Archives article, pp. 415-420; production-line and QA descriptions. **Relationship evidence:** `context_only`; Paper states HD maps support localization/detection/prediction/planning; this is contextual downstream use, not a claim that each consumer requires every map field. Source(s): `D166-TSUSHIMA-ETAL-HD-MAP-PRODUCTION-2020`; locator: Full open ISPRS Archives article, pp. 415-420; production-line and QA descriptions..

#### `outputs_and_downstream_role_context` / `current` - `mapped`

Candidate source IDs: `D166-LANELET2-ROUTING-AND-RULES`, `D166-AUTOWARE-MAP-INTERFACE-2026`, `D166-ARGOVERSE-HD-MAP-API`, `D166-ONLINE-TEMPORAL-VECTORIZED-MAP-CONSTRUCTION-2025`. Query IDs: `D166-Q045`.

- **D166-A-MAP-035:** Lanelet2 routing consumes vector-map topology and regulatory semantics to compute route/path choices under user-type and cost rules; this is a documented downstream interface. **Item type:** system output/downstream role-task context. **Inputs:** Source-named input/context terms: map. These terms come from the claim; no additional input is inferred. **Outputs:** Source claim: Lanelet2 routing consumes vector-map topology and regulatory semantics to compute route/path choices under user-type and cost rules; this is a documented downstream interface. **Assumptions/limits:** Source-specific conditions and non-generalization limits: Lanelet2 API behavior and configured traffic rules; not a map-production standard or guarantee that map tags are complete/correct. **Source(s):** `D166-LANELET2-ROUTING-AND-RULES`. **Exact locator:** Routing README inspected 2026-10-23; routing graph depends on lane map, participant-specific traffic rules and optional routing-cost modules; distinguishes route, path and lane sequence and lane-change relations. **Relationship evidence:** `context_only`; This mapping connects one source claim to one area/family/horizon cell; it asserts no item-to-item prerequisite, alternative, complement or producer-consumer relationship. Source(s): `D166-LANELET2-ROUTING-AND-RULES`; locator: Routing README inspected 2026-10-23; routing graph depends on lane map, participant-specific traffic rules and optional routing-cost modules; distinguishes route, path and lane sequence and lane-change relations..

#### `outputs_and_downstream_role_context` / `emerging` - `mapped`

Candidate source IDs: `D166-LANELET2-ROUTING-AND-RULES`, `D166-AUTOWARE-MAP-INTERFACE-2026`, `D166-ARGOVERSE-HD-MAP-API`, `D166-ONLINE-TEMPORAL-VECTORIZED-MAP-CONSTRUCTION-2025`, `D166-A1-IMPERIAL-ROADWORKS-HD-MAP-2026`. Query IDs: `D166-Q045`.

- **D166-A-MAP-036:** The Imperial paper reports updated OpenDRIVE map content as an output of its evaluated roadworks workflow; this is a research result, not evidence of production fleet publication. **Item type:** system output/downstream role-task context. **Inputs:** Source-named input/context terms: map. These terms come from the claim; no additional input is inferred. **Outputs:** Source claim: The Imperial paper reports updated OpenDRIVE map content as an output of its evaluated roadworks workflow; this is a research result, not evidence of production fleet publication. **Assumptions/limits:** Source-specific conditions and non-generalization limits: Full methods and experimental details were not reviewed. Results are one published system and UK motorway evaluation; they do not prove production deployment, global transfer or replacement of survey/map-QA processes. **Source(s):** `D166-A1-IMPERIAL-ROADWORKS-HD-MAP-2026`. **Exact locator:** Imperial Spiral record abstract and publication/licence metadata; abstract describes monocular-camera roadworks-sign recognition and incremental OpenDRIVE updates, with reported UK motorway trials. **Relationship evidence:** `context_only`; This mapping connects one source claim to one area/family/horizon cell; it asserts no item-to-item prerequisite, alternative, complement or producer-consumer relationship. Source(s): `D166-A1-IMPERIAL-ROADWORKS-HD-MAP-2026`; locator: Imperial Spiral record abstract and publication/licence metadata; abstract describes monocular-camera roadworks-sign recognition and incremental OpenDRIVE updates, with reported UK motorway trials..

#### `outputs_and_downstream_role_context` / `future/futuristic` - `bounded_no_hit`

Candidate source IDs: . Query IDs: `D166-A-QPACK-CLOSE-006`.

- **Bounded rationale:** No supported outputs_and_downstream_role_context item was found for future/futuristic. The exact counter-search scope and result are: D166-A-QPACK-CLOSE-006 (2026-10-24): actual searches: HD map production mapping workflow surveying point cloud manual annotation autonomous driving Tsushima 2020 open access; site:argoverse.org HD map API lane segment map data dataset map change detection; site:github.com Autoware Lanelet2 map validation tool map creation official Autoware mapping; Nigeria Africa autonomous driving high definition map road dataset OpenStreetMap roads open data HD map; autonomous driving HD map future methods tools standards credentials 2030 roadmap mapless localization; opened: https://autowarefoundation.github.io/autoware_core/latest/map/autoware_map_loader/; https://github.com/autowarefoundation/autoware-documentation/blob/main/docs/tutorials/integrating-autoware/overview.md; https://github.com/tier4/autoware_lanelet2_map_validator; https://www.asam.net/standards/detail/opendrive/; https://isprs-archives.copernicus.org/articles/XLIII-B4-2020/415/2020/index.html; https://essd.copernicus.org/articles/18/267/2026/index.html; https://roads.anambrastate.gov.ng/open-data; findings: Directly inspected the 2020 production workflow (mobile mapping survey, 3D plotting, feature attributes/topology, conversion, QA), current Autoware mapping/load interfaces, Lanelet2 validation tool, and ASAM OpenDRIVE 1.9.0. The Africa road-surface dataset and Anambra public works register are useful regional road context but are not onboard AV HD lane maps, and their access/licence scopes do not establish a local AV map product. Search results surfaced research forecasts and map-generation papers, but no validated future map method/tool/standard/credential/output contract.; limits: The Imperial 2026 paper is abstract-only for methods/deployment; research papers do not establish production map services. The Africa road-surface dataset is regional road-surface context, not lane-level HD data. Anambra Road Tracker covers public works projects, not AV maps. The English-language official/research search cannot prove no private or non-English regional provider exists.. The inspected evidence supports other horizons/item types or does not expose enough content for this cell; no unsupported claim is substituted. This is a bounded search disposition, not a pending track or global absence claim.

### Six task tracks

#### `foundation_and_prerequisites` - `complete`

**Topic focus:** Geodesy/coordinate reference systems, road topology, map layers, localization/perception interfaces, geometry and data-quality concepts; distinguish HD maps from navigation maps and sensor maps.
**Gap filler:** Search the area's source-defined task and skill requirements; extract underlying concepts, inputs, outputs and prerequisites. Separate true prerequisites from topics that are merely co-taught or often used together.
**Categories/horizons:** knowledge, competencies/skills, methods; established/traditional, current.
**Mapped cells:** foundations_knowledge_and_competencies / established/traditional; foundations_knowledge_and_competencies / current; methods_and_designs / established/traditional; methods_and_designs / current
**Assessed cells:** foundations_knowledge_and_competencies / established/traditional; foundations_knowledge_and_competencies / current; methods_and_designs / established/traditional; methods_and_designs / current
**Evidence IDs:** `D166-ASAM-OPENDRIVE-2026`, `D166-LANELET2-MAP-FRAMEWORK-PRIMARY`, `D166-LANELET2-ROUTING-AND-RULES`, `D166-APOLLO-MAP-LANE-SCHEMA`, `D166-TSUSHIMA-ETAL-HD-MAP-PRODUCTION-2020`, `D166-AUTOWARE-MAP-CREATION-TUTORIAL-2026`
**Query IDs:** `D166-A-QPACK-03`, `D166-A-QPACK-04`, `D166-A-QPACK-07`, `D166-A-QPACK-CLOSE-006`
**Closure rationale:** Terminal complete disposition within original topic scope: reviewed 4 applicable cells (mapped=4). Mapped evidence is restricted to the linked claims; bounded no-hit cells record source/type/horizon exclusions and query limits. The dated area counter-search found no further supportable claim within this track.

**Counter-search tests/results:**

- Africa road-surface and Anambra public-works data are not lane-level AV HD maps; no public Nigerian AV HD-map service/data product was verified in the bounded search.

- Mapless localization and operational freshness are alternatives/requirements that depend on route and ODD; no universal production comparison or freshness contract was found.

- The new Imperial roadworks paper is abstract-only and does not establish deployable map-update software or fleet release.

- map change/freshness and update pipelines

- map formats versus production maps

- map update geography and deployment claims

- roadworks sign data and incremental updates

- survey/vehicle-sensor map creation versus simulation format

#### `methods_techniques_and_alternatives` - `complete`

**Topic focus:** Survey-based and fleet/crowd-sourced map creation, lane/topology extraction, SLAM/map matching, vector/raster/neural representations, change detection, freshness and QA; compare map-light and map-based autonomy designs.
**Gap filler:** Search for named method families and their sub-techniques; compare alternatives by task, assumptions, data, output, validation and limitations. Record combinations only where the documented design requires a handoff.
**Categories/horizons:** methods/designs, techniques/estimators/algorithms; established/traditional, current, emerging.
**Mapped cells:** methods_and_designs / established/traditional; methods_and_designs / current; methods_and_designs / emerging; techniques_estimators_and_algorithms / established/traditional; techniques_estimators_and_algorithms / current; techniques_estimators_and_algorithms / emerging
**Assessed cells:** methods_and_designs / established/traditional; methods_and_designs / current; methods_and_designs / emerging; techniques_estimators_and_algorithms / established/traditional; techniques_estimators_and_algorithms / current; techniques_estimators_and_algorithms / emerging
**Evidence IDs:** `D166-TSUSHIMA-ETAL-HD-MAP-PRODUCTION-2020`, `D166-AUTOWARE-MAP-CREATION-TUTORIAL-2026`, `D166-ARGOVERSE-MAP-CHANGE-DATASET`, `D166-ONLINE-TEMPORAL-VECTORIZED-MAP-CONSTRUCTION-2025`, `D166-ASRAT-CHO-HD-MAP-SURVEY-2024`, `D166-A1-IMPERIAL-ROADWORKS-HD-MAP-2026`, `D166-E2E-MAP-GENERATION-SURVEY-2026`, `D166-CROWD-MAP-QUALITY-2026`, `D166-TAICS-HD-MAP-STANDARDS-REGISTER-2025`
**Query IDs:** `D166-A-QPACK-03`, `D166-A-QPACK-04`, `D166-A-QPACK-07`, `D166-A-QPACK-CLOSE-006`
**Closure rationale:** Terminal complete disposition within original topic scope: reviewed 6 applicable cells (mapped=6). Mapped evidence is restricted to the linked claims; bounded no-hit cells record source/type/horizon exclusions and query limits. The dated area counter-search found no further supportable claim within this track.

**Counter-search tests/results:**

- Africa road-surface and Anambra public-works data are not lane-level AV HD maps; no public Nigerian AV HD-map service/data product was verified in the bounded search.

- Mapless localization and operational freshness are alternatives/requirements that depend on route and ODD; no universal production comparison or freshness contract was found.

- The new Imperial roadworks paper is abstract-only and does not establish deployable map-update software or fleet release.

- map change/freshness and update pipelines

- map formats versus production maps

- map update geography and deployment claims

- roadworks sign data and incremental updates

- survey/vehicle-sensor map creation versus simulation format

#### `tools_data_and_implementation` - `bounded_no_hit`

**Topic focus:** Lanelet2, OpenDRIVE/ASAM, Apollo/Autoware map tools, public HD-map datasets and GIS/point-cloud pipelines; verify schema, routing/validation, licensing, update lifecycle and downstream compatibility.
**Gap filler:** Find current tools, instruments, platforms and datasets actually used for the area's methods. Record exact use/context, alternatives, input/output compatibility, access/licensing and limitations; do not infer a tool from a method name.
**Categories/horizons:** tools/software/platforms, datasets/instruments/data standards; current, emerging.
**Mapped cells:** tools_software_and_data / current
**Assessed cells:** tools_software_and_data / current; tools_software_and_data / emerging
**Evidence IDs:** `D166-AUTOWARE-MAP-CREATION-TUTORIAL-2026`, `D166-LANELET2-MAP-VALIDATION`, `D166-ARGOVERSE-HD-MAP-API`, `D166-ARGOVERSE-MAP-CHANGE-DATASET`, `D166-ASAM-OPENDRIVE-2026`, `D166-ONLINE-TEMPORAL-VECTORIZED-MAP-CONSTRUCTION-2025`, `D166-E2E-MAP-GENERATION-SURVEY-2026`, `D166-CROWD-MAP-QUALITY-2026`, `D166-TAICS-HD-MAP-STANDARDS-REGISTER-2025`, `D166-A1-IMPERIAL-ROADWORKS-HD-MAP-2026`
**Query IDs:** `D166-A-QPACK-03`, `D166-A-QPACK-04`, `D166-A-QPACK-07`, `D166-A-QPACK-CLOSE-006`
**Closure rationale:** Terminal bounded_no_hit within original topic scope: reviewed 2 applicable cells (mapped=1, bounded_no_hit=1). The dated counter-search found no defensible additional claim for this track after source and type/horizon limits were checked. Bounded result: No public Nigerian lane-level AV HD map data service/product was verified; Anambra public-works files and Africa road-surface data are adjacent road context, not AV HD maps. This closes the searched scope, not global absence.

**Counter-search tests/results:**

- Africa road-surface and Anambra public-works data are not lane-level AV HD maps; no public Nigerian AV HD-map service/data product was verified in the bounded search.

- Mapless localization and operational freshness are alternatives/requirements that depend on route and ODD; no universal production comparison or freshness contract was found.

- The new Imperial roadworks paper is abstract-only and does not establish deployable map-update software or fleet release.

- map change/freshness and update pipelines

- map formats versus production maps

- map update geography and deployment claims

- roadworks sign data and incremental updates

- survey/vehicle-sensor map creation versus simulation format

**Bounded remaining finding:**

- No public Nigerian lane-level AV HD map data service/product was verified; Anambra public-works files and Africa road-surface data are adjacent road context, not AV HD maps.

#### `emerging_and_future_frontier` - `bounded_no_hit`

**Topic focus:** Automated map generation, online mapping, crowdsourced change updates, learned/neural map representations and mapless alternatives when evidenced; distinguish production maps, research datasets and simulation formats.
**Gap filler:** Search recent work and credible roadmaps for material emerging methods/tools. Distinguish demonstrated research, pilot use, deployed practice and speculation; mark future/no-hit only after recording the actual query and evidence boundary.
**Categories/horizons:** knowledge, methods, techniques, tools; emerging, future/futuristic.
**Mapped cells:** foundations_knowledge_and_competencies / emerging; methods_and_designs / emerging; techniques_estimators_and_algorithms / emerging
**Assessed cells:** foundations_knowledge_and_competencies / emerging; foundations_knowledge_and_competencies / future/futuristic; methods_and_designs / emerging; methods_and_designs / future/futuristic; techniques_estimators_and_algorithms / emerging; techniques_estimators_and_algorithms / future/futuristic; tools_software_and_data / emerging; tools_software_and_data / future/futuristic
**Evidence IDs:** `D166-ONLINE-TEMPORAL-VECTORIZED-MAP-CONSTRUCTION-2025`, `D166-E2E-MAP-GENERATION-SURVEY-2026`, `D166-CROWD-MAP-QUALITY-2026`, `D166-TAICS-HD-MAP-STANDARDS-REGISTER-2025`, `D166-TSUSHIMA-ETAL-HD-MAP-PRODUCTION-2020`, `D166-ARGOVERSE-MAP-CHANGE-DATASET`, `D166-ASRAT-CHO-HD-MAP-SURVEY-2024`, `D166-A1-IMPERIAL-ROADWORKS-HD-MAP-2026`, `D166-AUTOWARE-MAP-CREATION-TUTORIAL-2026`, `D166-LANELET2-MAP-VALIDATION`, `D166-ARGOVERSE-HD-MAP-API`, `D166-ASAM-OPENDRIVE-2026`
**Query IDs:** `D166-A-QPACK-03`, `D166-A-QPACK-04`, `D166-A-QPACK-07`, `D166-A-QPACK-CLOSE-006`
**Closure rationale:** Terminal bounded_no_hit within original topic scope: reviewed 8 applicable cells (mapped=3, bounded_no_hit=5). The dated counter-search found no defensible additional claim for this track after source and type/horizon limits were checked. Bounded result: No validated future HD map method, selectable tool/data product, credential/standard or output contract was established; abstract-only and roadmap claims remain research/forecast. This closes the searched scope, not global absence.

**Counter-search tests/results:**

- Africa road-surface and Anambra public-works data are not lane-level AV HD maps; no public Nigerian AV HD-map service/data product was verified in the bounded search.

- Mapless localization and operational freshness are alternatives/requirements that depend on route and ODD; no universal production comparison or freshness contract was found.

- The new Imperial roadworks paper is abstract-only and does not establish deployable map-update software or fleet release.

- map change/freshness and update pipelines

- map formats versus production maps

- map update geography and deployment claims

- roadworks sign data and incremental updates

- survey/vehicle-sensor map creation versus simulation format

**Bounded remaining finding:**

- No validated future HD map method, selectable tool/data product, credential/standard or output contract was established; abstract-only and roadmap claims remain research/forecast.

#### `standards_credentials_and_learning_resources` - `complete`

**Topic focus:** Map/road-network data standards and exchange formats, geospatial training and professional curricula; record version, regional applicability, licensing and standards adoption status.
**Gap filler:** Search applicable laws, standards, professional frameworks, credentials and structured learning materials. Verify scope, edition/status, jurisdiction and prerequisites; mark not-applicable only with a short source-backed reason.
**Categories/horizons:** standards/regulation, certifications/credentials, learning resources; current, emerging.
**Mapped cells:** standards_credentials_and_learning_resources / current
**Assessed cells:** standards_credentials_and_learning_resources / current; standards_credentials_and_learning_resources / emerging
**Evidence IDs:** `D166-ASAM-OPENDRIVE-2026`, `D166-ASAM-OPENCRG-ROAD-SURFACE`, `D166-ASAM-OPENSCENARIO-STATIC-DYNAMIC-CONTENT`, `D166-TAICS-HD-MAP-STANDARDS-REGISTER-2025`
**Query IDs:** `D166-A-QPACK-03`, `D166-A-QPACK-04`, `D166-A-QPACK-07`, `D166-A-QPACK-CLOSE-006`
**Closure rationale:** Terminal complete disposition within original topic scope: reviewed 2 applicable cells (mapped=1, bounded_no_hit=1). Mapped evidence is restricted to the linked claims; bounded no-hit cells record source/type/horizon exclusions and query limits. The dated area counter-search found no further supportable claim within this track.

**Counter-search tests/results:**

- Africa road-surface and Anambra public-works data are not lane-level AV HD maps; no public Nigerian AV HD-map service/data product was verified in the bounded search.

- Mapless localization and operational freshness are alternatives/requirements that depend on route and ODD; no universal production comparison or freshness contract was found.

- The new Imperial roadworks paper is abstract-only and does not establish deployable map-update software or fleet release.

- map change/freshness and update pipelines

- map formats versus production maps

- map update geography and deployment claims

- roadworks sign data and incremental updates

- survey/vehicle-sensor map creation versus simulation format

#### `outputs_and_downstream_role_context` - `complete`

**Topic focus:** Versioned road geometry/topology/semantics, map-change events, localization priors and planning constraints; map conditional use to mapping software, data, localization and infrastructure role tasks.
**Gap filler:** Trace what the area produces, who consumes it downstream, and which roles use it under what conditions. Map item-to-task/output evidence with boundaries and counterexamples; keep role evidence separate from area-definition evidence and do not change canonical fit.
**Categories/horizons:** work outputs, role tasks/skills, downstream area links; current, emerging.
**Mapped cells:** outputs_and_downstream_role_context / current; outputs_and_downstream_role_context / emerging
**Assessed cells:** outputs_and_downstream_role_context / current; outputs_and_downstream_role_context / emerging
**Evidence IDs:** `D166-LANELET2-ROUTING-AND-RULES`, `D166-AUTOWARE-MAP-INTERFACE-2026`, `D166-ARGOVERSE-HD-MAP-API`, `D166-ONLINE-TEMPORAL-VECTORIZED-MAP-CONSTRUCTION-2025`, `D166-A1-IMPERIAL-ROADWORKS-HD-MAP-2026`
**Query IDs:** `D166-A-QPACK-03`, `D166-A-QPACK-04`, `D166-A-QPACK-07`, `D166-A-QPACK-CLOSE-006`
**Closure rationale:** Terminal complete disposition within original topic scope: reviewed 2 applicable cells (mapped=2). Mapped evidence is restricted to the linked claims; bounded no-hit cells record source/type/horizon exclusions and query limits. The dated area counter-search found no further supportable claim within this track.

**Counter-search tests/results:**

- Africa road-surface and Anambra public-works data are not lane-level AV HD maps; no public Nigerian AV HD-map service/data product was verified in the bounded search.

- Mapless localization and operational freshness are alternatives/requirements that depend on route and ODD; no universal production comparison or freshness contract was found.

- The new Imperial roadworks paper is abstract-only and does not establish deployable map-update software or fleet release.

- map change/freshness and update pipelines

- map formats versus production maps

- map update geography and deployment claims

- roadworks sign data and incremental updates

- survey/vehicle-sensor map creation versus simulation format

## Localization and Vehicle State Estimation (`D166:localization-and-vehicle-state-estimation`)

**Boundary:** Estimate vehicle pose, velocity, acceleration and uncertainty by combining sensors and map references within the intended operational design domain.

| Family | Horizon | Disposition | Mapping IDs | Query IDs |
|---|---|---|---|---|
| `foundations_knowledge_and_competencies` | established/traditional | `bounded_no_hit` |  | `D166-A-QPACK-CLOSE-007`, `D166-Q040` |
| `foundations_knowledge_and_competencies` | current | `mapped` | `D166-A-MAP-038` | `D166-Q040` |
| `foundations_knowledge_and_competencies` | emerging | `bounded_no_hit` |  | `D166-Q062` |
| `foundations_knowledge_and_competencies` | future/futuristic | `bounded_no_hit` |  | `D166-A-QPACK-CLOSE-007`, `D166-Q062` |
| `methods_and_designs` | established/traditional | `mapped` | `D166-A-MAP-040` | `D166-Q040` |
| `methods_and_designs` | current | `mapped` | `D166-A-MAP-041` | `D166-Q040` |
| `methods_and_designs` | emerging | `mapped` | `D166-A1-LOC-METHOD-EMERGING` | `D166-A-QPACK-CLOSE-007` |
| `methods_and_designs` | future/futuristic | `bounded_no_hit` |  | `D166-A-QPACK-CLOSE-007` |
| `techniques_estimators_and_algorithms` | established/traditional | `mapped` | `D166-A1-LOC-TECH-ESTABLISHED` | `D166-A-QPACK-CLOSE-007` |
| `techniques_estimators_and_algorithms` | current | `mapped` | `D166-A-MAP-043` | `D166-Q040` |
| `techniques_estimators_and_algorithms` | emerging | `mapped` | `D166-A-MAP-044` | `D166-Q040`, `D166-Q062` |
| `techniques_estimators_and_algorithms` | future/futuristic | `bounded_no_hit` |  | `D166-A-QPACK-CLOSE-007`, `D166-Q062` |
| `tools_software_and_data` | established/traditional | `mapped` | `D166-A1-LOC-TOOLS-ESTABLISHED` | `D166-A-QPACK-CLOSE-007` |
| `tools_software_and_data` | current | `mapped` | `D166-A-MAP-045` | `D166-Q040` |
| `tools_software_and_data` | emerging | `bounded_no_hit` |  | `D166-A-QPACK-CLOSE-007`, `D166-Q040`, `D166-Q062` |
| `tools_software_and_data` | future/futuristic | `bounded_no_hit` |  | `D166-A-QPACK-CLOSE-007`, `D166-Q062` |
| `standards_credentials_and_learning_resources` | established/traditional | `mapped` | `D166-A1-LOC-FOUNDATIONS-ESTABLISHED` | `D166-A-QPACK-CLOSE-007` |
| `standards_credentials_and_learning_resources` | current | `bounded_no_hit` |  | `D166-Q061` |
| `standards_credentials_and_learning_resources` | emerging | `bounded_no_hit` |  | `D166-A-QPACK-CLOSE-007`, `D166-Q061` |
| `standards_credentials_and_learning_resources` | future/futuristic | `bounded_no_hit` |  | `D166-A-QPACK-CLOSE-007` |
| `outputs_and_downstream_role_context` | established/traditional | `bounded_no_hit` |  | `D166-A-QPACK-CLOSE-007` |
| `outputs_and_downstream_role_context` | current | `mapped` | `D166-A-MAP-048` | `D166-Q040` |
| `outputs_and_downstream_role_context` | emerging | `bounded_no_hit` |  | `D166-A-QPACK-CLOSE-007`, `D166-Q040` |
| `outputs_and_downstream_role_context` | future/futuristic | `bounded_no_hit` |  | `D166-A-QPACK-CLOSE-007` |

### Cell-by-cell claims and no-hit scope

#### `foundations_knowledge_and_competencies` / `established/traditional` - `bounded_no_hit`

Candidate source IDs: `D166-AUTOWARE-EKF-LOCALIZER-DOCS-2026`, `D166-AUTOWARE-LOCALIZATION-OUTPUT-CONTRACT`. Query IDs: `D166-A-QPACK-CLOSE-007`, `D166-Q040`.

- **Bounded rationale:** Bounded no-hit for foundations_knowledge_and_competencies at established/traditional. Checked: D166-AUTOWARE-EKF-LOCALIZER-DOCS-2026: checked as Autoware?s EKF localizer documents current implementation prerequisites including timestamp quality, frames/units, motion and noise assumptions, outlier handling and covariance int; limit: This documents one implementation and explicitly warns covariance accuracy can be limited. Parameters and thresholds are not trans | D166-AUTOWARE-LOCALIZATION-OUTPUT-CONTRACT: checked as Autoware's documented localization design estimates vehicle pose, velocity and acceleration, exposes timestamped covariance-bearing state outputs and diagnostics to planning/contro; limit: Stack-specific design documentation and evolving implementation; does not establish universal output contracts, map necessity or p. Query IDs: D166-A-QPACK-CLOSE-007, D166-Q040. The candidates support other source types, current contexts, or limited abstracts as stated above; none supports a distinct, correctly typed claim for this exact cell. Search is bounded to the linked opened records and dates, not global absence.

#### `foundations_knowledge_and_competencies` / `current` - `mapped`

Candidate source IDs: `D166-AUTOWARE-EKF-LOCALIZER-DOCS-2026`, `D166-AUTOWARE-LOCALIZATION-OUTPUT-CONTRACT`. Query IDs: `D166-Q040`.

- **D166-A-MAP-038:** Autoware?s EKF localizer documents current implementation prerequisites including timestamp quality, frames/units, motion and noise assumptions, outlier handling and covariance interpretation. **Item type:** knowledge/competency concept. **Inputs:** Not applicable as a computational interface; the cited item is a knowledge, standard, or learning-resource claim. **Outputs:** The source-supported knowledge/criterion/learning scope is the claim text itself; no software output or interface is inferred. **Assumptions/limits:** Source-specific conditions and non-generalization limits: This documents one implementation and explicitly warns covariance accuracy can be limited. Parameters and thresholds are not transferable defaults; calibrate and validate on the target system. **Source(s):** `D166-AUTOWARE-EKF-LOCALIZER-DOCS-2026`. **Exact locator:** Parameter/tuning documentation for pose/twist delay compensation, smoothing, covariance, process noise, Mahalanobis gating and limitations in covariance estimation. **Relationship evidence:** `context_only`; This mapping connects one source claim to one area/family/horizon cell; it asserts no item-to-item prerequisite, alternative, complement or producer-consumer relationship. Source(s): `D166-AUTOWARE-EKF-LOCALIZER-DOCS-2026`; locator: Parameter/tuning documentation for pose/twist delay compensation, smoothing, covariance, process noise, Mahalanobis gating and limitations in covariance estimation..

#### `foundations_knowledge_and_competencies` / `emerging` - `bounded_no_hit`

Candidate source IDs: `D166-IEEE-V2X-SIDELINK-LOCALIZATION-2024`, `D166-IEEE-ROADCODE-GNSS-DENIED-COOPERATIVE-2025`, `D166-COOPERATIVE-MULTIVEHICLE-LOCALIZATION-ISCIF-2024`, `D166-IEEE-SENSOR-TEMPORAL-MISALIGNMENT-2024`, `D166-ROBOT-LOCALIZATION-SURVEY-2026`. Query IDs: `D166-Q062`.

- **Bounded rationale:** The 2026 localization survey was checked but its research taxonomy is not a verified competency framework, course outcome, or foundational knowledge standard. Autoware docs support current implementation assumptions only. No horizon-specific emerging competency record was substantiated in the opened sources.

#### `foundations_knowledge_and_competencies` / `future/futuristic` - `bounded_no_hit`

Candidate source IDs: `D166-IEEE-V2X-SIDELINK-LOCALIZATION-2024`, `D166-IEEE-ROADCODE-GNSS-DENIED-COOPERATIVE-2025`, `D166-COOPERATIVE-MULTIVEHICLE-LOCALIZATION-ISCIF-2024`, `D166-IEEE-SENSOR-TEMPORAL-MISALIGNMENT-2024`, `D166-ROBOT-LOCALIZATION-SURVEY-2026`. Query IDs: `D166-A-QPACK-CLOSE-007`, `D166-Q062`.

- **Bounded rationale:** Bounded no-hit for foundations_knowledge_and_competencies at future/futuristic. Checked: D166-IEEE-V2X-SIDELINK-LOCALIZATION-2024: candidate named in the cell ledger and checked under its linked query; source-specific limit is in that query log. | D166-IEEE-ROADCODE-GNSS-DENIED-COOPERATIVE-2025: candidate named in the cell ledger and checked under its linked query; source-specific limit is in that query log. | D166-COOPERATIVE-MULTIVEHICLE-LOCALIZATION-ISCIF-2024: candidate named in the cell ledger and checked under its linked query; source-specific limit is in that query log. | D166-IEEE-SENSOR-TEMPORAL-MISALIGNMENT-2024: candidate named in the cell ledger and checked under its linked query; source-specific limit is in that query log. | D166-ROBOT-LOCALIZATION-SURVEY-2026: checked as The localization survey maps emerging learned components as augmentations to classical localization pipelines; individual methods and evidence strength vary and require item-level ; limit: Robotics-wide rather than road-AV-only; a survey taxonomy does not establish a universal sequence or method performance.. Query IDs: D166-A-QPACK-CLOSE-007, D166-Q062. The candidates support other source types, current contexts, or limited abstracts as stated above; none supports a distinct, correctly typed claim for this exact cell. Search is bounded to the linked opened records and dates, not global absence.

#### `methods_and_designs` / `established/traditional` - `mapped`

Candidate source IDs: `D166-LVI-SAM-ICRA-2021`, `D166-AUTOWARE-EKF-LOCALIZER-DOCS-2026`, `D166-KITTI-ODOMETRY-BENCHMARK`, `D166-A1-CMU-NAVIGATION-KALMAN-1994`. Query IDs: `D166-Q040`.

- **D166-A-MAP-040:** A 1994 vehicle-navigation design formulates an asynchronous 3D state-space Kalman filter for autonomous-vehicle position estimation, with sensor integration options including dead reckoning, INS/GPS, landmarks and map matching. **Item type:** method/system design. **Inputs:** Source-named input/context terms: gps, map, sensor. These terms come from the claim; no additional input is inferred. **Outputs:** No separate output/interface is stated in the inspected claim/locator; none is inferred. **Assumptions/limits:** Source-specific conditions and non-generalization limits: Abstract-only; no detailed Kalman equations, measured performance or field validation claimed. **Source(s):** `D166-A1-CMU-NAVIGATION-KALMAN-1994`. **Exact locator:** CMU Robotics Institute technical-report repository, abstract lines 27-31; report CMU-RI-TR-94-19 (May 1994). Full PDF fetch timed out. **Relationship evidence:** `context_only`; The abstract describes an estimation design and possible map-matching use; it does not establish a universal prerequisite or learner sequence. Source(s): `D166-A1-CMU-NAVIGATION-KALMAN-1994`; locator: CMU Robotics Institute technical-report repository, abstract lines 27-31; report CMU-RI-TR-94-19 (May 1994). Full PDF fetch timed out..

#### `methods_and_designs` / `current` - `mapped`

Candidate source IDs: `D166-LVI-SAM-ICRA-2021`, `D166-AUTOWARE-EKF-LOCALIZER-DOCS-2026`, `D166-KITTI-ODOMETRY-BENCHMARK`. Query IDs: `D166-Q040`.

- **D166-A-MAP-041:** The 2021 LVI-SAM system is a concrete current-era research design combining visual-inertial and LiDAR-inertial subsystems; the paper?s tested conditions limit transfer claims. **Item type:** method/system design. **Inputs:** Source-named input/context terms: lidar. These terms come from the claim; no additional input is inferred. **Outputs:** No separate output/interface is stated in the inspected claim/locator; none is inferred. **Assumptions/limits:** Source-specific conditions and non-generalization limits: The published abstract is inspected; full paper not reviewed here. This is one research system and does not prove all sensors must be combined, that each subsystem is independently adequate for an AV ODD, or that its results transfer to production safety claims. **Source(s):** `D166-LVI-SAM-ICRA-2021`. **Exact locator:** IEEE abstract and method description; factor-graph design combines visual-inertial and LiDAR-inertial subsystems with cross-initialization, depth assistance and loop closures. **Relationship evidence:** `context_only`; This mapping connects one source claim to one area/family/horizon cell; it asserts no item-to-item prerequisite, alternative, complement or producer-consumer relationship. Source(s): `D166-LVI-SAM-ICRA-2021`; locator: IEEE abstract and method description; factor-graph design combines visual-inertial and LiDAR-inertial subsystems with cross-initialization, depth assistance and loop closures..

#### `methods_and_designs` / `emerging` - `mapped`

Candidate source IDs: `D166-ROBOT-LOCALIZATION-SURVEY-2026`. Query IDs: `D166-A-QPACK-CLOSE-007`.

- **D166-A1-LOC-METHOD-EMERGING:** The 2026 open localization survey identifies semantic/cognitive and language-guided localization, learning-augmented filters, differentiable or neuromorphic SLAM, and cross-modal localization as emerging research directions; it does not establish road-vehicle deployment. **Item type:** method/system design. **Inputs:** No concrete input is stated in the inspected claim/locator; none is inferred. **Outputs:** No separate output/interface is stated in the inspected claim/locator; none is inferred. **Assumptions/limits:** Source-specific conditions and non-generalization limits: Secondary survey across robotics; does not establish maturity, vehicle validation, selectable software, or future certainty. **Source(s):** `D166-ROBOT-LOCALIZATION-SURVEY-2026`. **Exact locator:** Open-access 2026 survey, emerging directions and limitations sections; full article inspected in prior workpack pass and rechecked 2026-10-24. **Relationship evidence:** `context_only`; Survey reports complementary research directions; it does not demonstrate that one is a replacement for geometric localization. Source(s): `D166-ROBOT-LOCALIZATION-SURVEY-2026`; locator: Open-access 2026 survey, emerging directions and limitations sections; full article inspected in prior workpack pass and rechecked 2026-10-24..

#### `methods_and_designs` / `future/futuristic` - `bounded_no_hit`

Candidate source IDs: . Query IDs: `D166-A-QPACK-CLOSE-007`.

- **Bounded rationale:** No supported methods_and_designs item was found for future/futuristic. The exact counter-search scope and result are: D166-A-QPACK-CLOSE-007 (2026-10-24): actual searches: site:autowarefoundation.github.io/autoware_core localization EKF pose twist covariance diagnostics time delay Mahalanobis; official KITTI odometry benchmark dataset ground truth trajectories evaluation terms license; Boreas autonomous driving dataset official localization benchmark license all weather; Nigeria vehicle positioning localization dataset GNSS denied IO-VNBD smartphone CAN country coverage terms; autonomous vehicle localization future 2035 roadmap cooperative localization standards future algorithm official 2025 2026; site:iso.org vehicle localization autonomous driving GNSS positioning standard committee 2026 work item; official university course autonomous vehicle localization state estimation curriculum 2025; site:publications.ri.cmu.edu navigation Kalman filter autonomous vehicles 1994 state space; opened: https://autowarefoundation.github.io/autoware_core/pr-482/localization/autoware_ekf_localizer/; https://autowarefoundation.github.io/autoware_core/pr-689/localization/autoware_ekf_localizer/; https://www.cvlibs.net/datasets/kitti/eval_odometry.php; https://www.cvlibs.net/datasets/kitti/raw_data.php; https://registry.opendata.aws/boreas/; https://link.springer.com/article/10.1007/s41315-026-00528-9; https://www.coursera.org/learn/state-estimation-localization-self-driving-cars; https://opas.peppi.utu.fi/en/course/DTEK2102/106565?period=2024-2027; https://www.weforum.org/publications/autonomous-vehicles-timeline-and-roadmap-ahead; https://publications.ri.cmu.edu/a-3d-space-formulation-of-a-navigation-kalman-filter-for-autonomous-vehicles; findings: Autoware docs directly specify pose/twist inputs, covariance, time-delay handling, yaw-bias correction, Mahalanobis gating and pose/twist/odometry/covariance/diagnostics outputs. KITTI provides 22 odometry sequences, training ground truth, evaluation-only sequences and translation/rotation metrics; Boreas provides multimodal year-round weather data under CC BY 4.0. Open 2026 localization survey and course catalogues identify current/emerging learning-augmented and semantic approaches plus course outcomes. No inspectable future road-vehicle localization standard, future selectable tool/data product, credential or output contract was confirmed. Nigeria-related IO-VNBD evidence remains smartphone positioning, not Nigerian vehicle CAN/AV deployment. Opened the CMU Robotics Institute 1994 technical-report record. Its abstract describes a 3D asynchronous state-space navigation Kalman filter for autonomous-vehicle position estimation, including sensor integration, dead reckoning, INS/GPS, landmarks and map matching. The linked full PDF timed out, so the claim is limited to the abstract.; limits: Autoware pages document one stack and include PR-version pages; they do not establish universal contracts. KITTI is academic-use only and European data; Boreas has Canadian geography and CC BY 4.0. IO-VNBD country/sensor caveat remains. WEF roadmap is adoption forecast, not technical validation. Future and legal searches are bounded; they cannot prove universal absence. CMU report body was not available after a PDF fetch timeout; no equations, performance or full-text comparisons are claimed.. The inspected evidence supports other horizons/item types or does not expose enough content for this cell; no unsupported claim is substituted. This is a bounded search disposition, not a pending track or global absence claim.

#### `techniques_estimators_and_algorithms` / `established/traditional` - `mapped`

Candidate source IDs: `D166-LVI-SAM-ICRA-2021`, `D166-ROBOT-LOCALIZATION-SURVEY-2026`. Query IDs: `D166-A-QPACK-CLOSE-007`.

- **D166-A1-LOC-TECH-ESTABLISHED:** The 2026 review classifies Kalman filtering as a linear-Gaussian estimator under linear dynamics/observation models with additive Gaussian noise, and EKF as the nonlinear extension that linearizes around the current estimate. It identifies Gaussian approximations, observability/nonlinearity and EKF-SLAM scaling as limitations. **Item type:** technique/estimator/algorithm. **Inputs:** Motion/control inputs and noisy sensor observations/measurements; KF assumes linear dynamics/observation models with additive Gaussian noise, while EKF handles nonlinear models by local linearization. **Outputs:** Recursive robot/vehicle-state belief, typically mean and covariance; the source describes pose/state estimates and uncertainty. **Assumptions/limits:** KF linear-Gaussian model assumptions; EKF local linearization around current estimate. Source limitations include inconsistency with strong nonlinearities or large uncertainty and EKF-SLAM quadratic growth with landmark count. **Source(s):** `D166-ROBOT-LOCALIZATION-SURVEY-2026`. **Exact locator:** Alipourvarmazabadi & Ebner, Robot localization: a comprehensive survey from classical methods to intelligent autonomy, ??2.2, lines 139-152 (published 2026-03-30; open access; opened 2026-10-24). **Relationship evidence:** `alternative`; KF/EKF filtering and sample-based Bayesian estimators are reviewed as alternative representations for localization state estimation, with different uncertainty and scaling behavior; the review does not state a universal choice. Source(s): `D166-ROBOT-LOCALIZATION-SURVEY-2026`; locator: Survey ??2.2-2.3, lines 139-160..

#### `techniques_estimators_and_algorithms` / `current` - `mapped`

Candidate source IDs: `D166-LVI-SAM-ICRA-2021`, `D166-AUTOWARE-EKF-LOCALIZER-DOCS-2026`, `D166-KITTI-ODOMETRY-BENCHMARK`. Query IDs: `D166-Q040`.

- **D166-A-MAP-043:** LVI-SAM?s implementation uses subsystem initialization and depth/scan-matching information exchange; its reported resilience is bounded to the paper?s evaluated settings. **Item type:** technique/estimator/algorithm. **Inputs:** No concrete input is stated in the inspected claim/locator; none is inferred. **Outputs:** No separate output/interface is stated in the inspected claim/locator; none is inferred. **Assumptions/limits:** Source-specific conditions and non-generalization limits: The published abstract is inspected; full paper not reviewed here. This is one research system and does not prove all sensors must be combined, that each subsystem is independently adequate for an AV ODD, or that its results transfer to production safety claims. **Source(s):** `D166-LVI-SAM-ICRA-2021`. **Exact locator:** IEEE abstract and method description; factor-graph design combines visual-inertial and LiDAR-inertial subsystems with cross-initialization, depth assistance and loop closures. **Relationship evidence:** `context_only`; This mapping connects one source claim to one area/family/horizon cell; it asserts no item-to-item prerequisite, alternative, complement or producer-consumer relationship. Source(s): `D166-LVI-SAM-ICRA-2021`; locator: IEEE abstract and method description; factor-graph design combines visual-inertial and LiDAR-inertial subsystems with cross-initialization, depth assistance and loop closures..

#### `techniques_estimators_and_algorithms` / `emerging` - `mapped`

Candidate source IDs: `D166-LVI-SAM-ICRA-2021`, `D166-AUTOWARE-EKF-LOCALIZER-DOCS-2026`, `D166-KITTI-ODOMETRY-BENCHMARK`, `D166-IEEE-V2X-SIDELINK-LOCALIZATION-2024`, `D166-IEEE-ROADCODE-GNSS-DENIED-COOPERATIVE-2025`, `D166-COOPERATIVE-MULTIVEHICLE-LOCALIZATION-ISCIF-2024`, `D166-IEEE-SENSOR-TEMPORAL-MISALIGNMENT-2024`, `D166-ROBOT-LOCALIZATION-SURVEY-2026`. Query IDs: `D166-Q040`, `D166-Q062`.

- **D166-A-MAP-044:** The review classifies learning-augmented estimators as components that learn measurement models, priors or end-to-end pose regressors, and describes semantic/cognitive and language-guided localization as emerging research directions. It presents learned components as composable with classical probabilistic/optimization back-ends, not a validated replacement. **Item type:** technique/estimator/algorithm. **Inputs:** Sensor observations and/or measurement models, priors, spatial/semantic cues, or data used to learn pose regressors, as described in the cited taxonomy; the review does not specify one implementation contract. **Outputs:** Learned measurement models, learned priors, end-to-end pose regressors, or semantic/contextual localization cues; no single deployed output interface is asserted. **Assumptions/limits:** These are emerging directions requiring method-/dataset-specific evidence; composition with classical back-ends is a research/system-design option, not a prerequisite or universal architecture. **Source(s):** `D166-ROBOT-LOCALIZATION-SURVEY-2026`. **Exact locator:** Alipourvarmazabadi & Ebner, 2026 open-access review, abstract and ??1.1-1.2, lines 42-43, 78-95 and 118-125; opened 2026-10-24. **Relationship evidence:** `complement`; Learning-augmented estimators may learn measurements, priors or pose regressors and be composed with classical probabilistic/optimization back-ends; research taxonomy only. Source(s): `D166-ROBOT-LOCALIZATION-SURVEY-2026`; locator: Survey ??1.1-1.2, lines 78-95 and 118-125..

#### `techniques_estimators_and_algorithms` / `future/futuristic` - `bounded_no_hit`

Candidate source IDs: `D166-IEEE-V2X-SIDELINK-LOCALIZATION-2024`, `D166-IEEE-ROADCODE-GNSS-DENIED-COOPERATIVE-2025`, `D166-COOPERATIVE-MULTIVEHICLE-LOCALIZATION-ISCIF-2024`, `D166-IEEE-SENSOR-TEMPORAL-MISALIGNMENT-2024`, `D166-ROBOT-LOCALIZATION-SURVEY-2026`. Query IDs: `D166-A-QPACK-CLOSE-007`, `D166-Q062`.

- **Bounded rationale:** Bounded no-hit for techniques_estimators_and_algorithms at future/futuristic. Checked: D166-IEEE-V2X-SIDELINK-LOCALIZATION-2024: candidate named in the cell ledger and checked under its linked query; source-specific limit is in that query log. | D166-IEEE-ROADCODE-GNSS-DENIED-COOPERATIVE-2025: candidate named in the cell ledger and checked under its linked query; source-specific limit is in that query log. | D166-COOPERATIVE-MULTIVEHICLE-LOCALIZATION-ISCIF-2024: candidate named in the cell ledger and checked under its linked query; source-specific limit is in that query log. | D166-IEEE-SENSOR-TEMPORAL-MISALIGNMENT-2024: candidate named in the cell ledger and checked under its linked query; source-specific limit is in that query log. | D166-ROBOT-LOCALIZATION-SURVEY-2026: checked as The localization survey maps emerging learned components as augmentations to classical localization pipelines; individual methods and evidence strength vary and require item-level ; limit: Robotics-wide rather than road-AV-only; a survey taxonomy does not establish a universal sequence or method performance.. Query IDs: D166-A-QPACK-CLOSE-007, D166-Q062. The candidates support other source types, current contexts, or limited abstracts as stated above; none supports a distinct, correctly typed claim for this exact cell. Search is bounded to the linked opened records and dates, not global absence.

#### `tools_software_and_data` / `established/traditional` - `mapped`

Candidate source IDs: `D166-KITTI-ODOMETRY-BENCHMARK`. Query IDs: `D166-A-QPACK-CLOSE-007`.

- **D166-A1-LOC-TOOLS-ESTABLISHED:** The KITTI odometry benchmark provides 22 stereo driving sequences, with ground truth for sequences 00-10 and held-out evaluation sequences 11-21; its evaluation reports translational and rotational trajectory error over defined subsequence lengths. **Item type:** dataset/benchmark. **Inputs:** Source-named input/context terms: odometry. These terms come from the claim; no additional input is inferred. **Outputs:** Source claim: The KITTI odometry benchmark provides 22 stereo driving sequences, with ground truth for sequences 00-10 and held-out evaluation sequences 11-21; its evaluation reports translational and rotational trajectory error over defined subsequence lengths. **Assumptions/limits:** Source-specific conditions and non-generalization limits: Dataset is academic-use only; geography and sequences are specific; benchmark scores do not establish real-world road-fleet performance. **Source(s):** `D166-KITTI-ODOMETRY-BENCHMARK`. **Exact locator:** Official KITTI odometry benchmark page, dataset and evaluation sections; accessed 2026-10-24. **Relationship evidence:** `context_only`; This is evaluation context for localization algorithms, not a method or required learning tool. Source(s): `D166-KITTI-ODOMETRY-BENCHMARK`; locator: Official KITTI odometry benchmark page, dataset and evaluation sections; accessed 2026-10-24..

#### `tools_software_and_data` / `current` - `mapped`

Candidate source IDs: `D166-KITTI-ODOMETRY-BENCHMARK`, `D166-BOREAS-MULTISEASON-DATASET-2023`, `D166-OXFORD-ROBOTCAR-DATASET-PAPER`, `D166-AUTOWARE-LOCALIZATION-OUTPUT-CONTRACT`, `D166-A1-IOVNBD-2021`. Query IDs: `D166-Q040`.

- **D166-A-MAP-045:** IO-VNBD is a documented inertial/odometry vehicle-positioning dataset with road/motion contexts and GPS outages; its Nigeria records are smartphone IMU/GPS, not Nigerian vehicle CAN or AV deployment evidence. **Item type:** dataset/benchmark. **Inputs:** Source-named input/context terms: imu, gps, odometry. These terms come from the claim; no additional input is inferred. **Outputs:** No separate output/interface is stated in the inspected claim/locator; none is inferred. **Assumptions/limits:** Source-specific conditions and non-generalization limits: Nigeria-specific evidence is smartphone IMU/GPS data, not the vehicle CAN/ECU subset; the paper does not describe Nigeria-specific LiDAR/camera/radar, HD maps, ADS deployment or AV test operations. Dataset coverage is an older, bounded research collection and cannot generalize to current Nigerian road distribution or production AV performance. Separate data-file license terms were not verified. **Source(s):** `D166-A1-IOVNBD-2021`. **Exact locator:** Abstract/specification (PDF pp. 1-3); data accessibility and sensor/location details (PDF pp. 2-3); vehicle-vs-smartphone coverage caveat (PDF p. 3); scenarios and sensor fields (PDF pp. 5-7). **Relationship evidence:** `context_only`; This mapping connects one source claim to one area/family/horizon cell; it asserts no item-to-item prerequisite, alternative, complement or producer-consumer relationship. Source(s): `D166-A1-IOVNBD-2021`; locator: Abstract/specification (PDF pp. 1-3); data accessibility and sensor/location details (PDF pp. 2-3); vehicle-vs-smartphone coverage caveat (PDF p. 3); scenarios and sensor fields (PDF pp. 5-7)..

#### `tools_software_and_data` / `emerging` - `bounded_no_hit`

Candidate source IDs: `D166-KITTI-ODOMETRY-BENCHMARK`, `D166-BOREAS-MULTISEASON-DATASET-2023`, `D166-OXFORD-ROBOTCAR-DATASET-PAPER`, `D166-AUTOWARE-LOCALIZATION-OUTPUT-CONTRACT`, `D166-IEEE-V2X-SIDELINK-LOCALIZATION-2024`, `D166-IEEE-ROADCODE-GNSS-DENIED-COOPERATIVE-2025`, `D166-COOPERATIVE-MULTIVEHICLE-LOCALIZATION-ISCIF-2024`, `D166-IEEE-SENSOR-TEMPORAL-MISALIGNMENT-2024`, `D166-ROBOT-LOCALIZATION-SURVEY-2026`, `D166-A1-IOVNBD-2021`. Query IDs: `D166-A-QPACK-CLOSE-007`, `D166-Q040`, `D166-Q062`.

- **Bounded rationale:** Bounded no-hit for tools_software_and_data at emerging. Checked: D166-KITTI-ODOMETRY-BENCHMARK: checked as The KITTI odometry benchmark provides 22 stereo driving sequences, with ground truth for sequences 00-10 and held-out evaluation sequences 11-21; its evaluation reports translation; limit: Dataset is academic-use only; geography and sequences are specific; benchmark scores do not establish real-world road-fleet perfor | D166-BOREAS-MULTISEASON-DATASET-2023: candidate named in the cell ledger and checked under its linked query; source-specific limit is in that query log. | D166-OXFORD-ROBOTCAR-DATASET-PAPER: candidate named in the cell ledger and checked under its linked query; source-specific limit is in that query log. | D166-AUTOWARE-LOCALIZATION-OUTPUT-CONTRACT: checked as Autoware's documented localization design estimates vehicle pose, velocity and acceleration, exposes timestamped covariance-bearing state outputs and diagnostics to planning/contro; limit: Stack-specific design documentation and evolving implementation; does not establish universal output contracts, map necessity or p | D166-IEEE-V2X-SIDELINK-LOCALIZATION-2024: candidate named in the cell ledger and checked under its linked query; source-specific limit is in that query log. | D166-IEEE-ROADCODE-GNSS-DENIED-COOPERATIVE-2025: candidate named in the cell ledger and checked under its linked query; source-specific limit is in that query log. | D166-COOPERATIVE-MULTIVEHICLE-LOCALIZATION-ISCIF-2024: candidate named in the cell ledger and checked under its linked query; source-specific limit is in that query log. | D166-IEEE-SENSOR-TEMPORAL-MISALIGNMENT-2024: candidate named in the cell ledger and checked under its linked query; source-specific limit is in that query log. | D166-ROBOT-LOCALIZATION-SURVEY-2026: checked as The localization survey maps emerging learned components as augmentations to classical localization pipelines; individual methods and evidence strength vary and require item-level ; limit: Robotics-wide rather than road-AV-only; a survey taxonomy does not establish a universal sequence or method performance. | D166-A1-IOVNBD-2021: checked as The paper documents an inertial/odometry vehicle-positioning dataset and road/motion contexts, GPS outages and sensor signals. It reports that vehicle CAN/ECU records were collecte; limit: Nigeria-specific evidence is smartphone IMU/GPS data, not the vehicle CAN/ECU subset; the paper does not describe Nigeria-specific. Query IDs: D166-A-QPACK-CLOSE-007, D166-Q040, D166-Q062. The candidates support other source types, current contexts, or limited abstracts as stated above; none supports a distinct, correctly typed claim for this exact cell. Search is bounded to the linked opened records and dates, not global absence.

#### `tools_software_and_data` / `future/futuristic` - `bounded_no_hit`

Candidate source IDs: `D166-IEEE-V2X-SIDELINK-LOCALIZATION-2024`, `D166-IEEE-ROADCODE-GNSS-DENIED-COOPERATIVE-2025`, `D166-COOPERATIVE-MULTIVEHICLE-LOCALIZATION-ISCIF-2024`, `D166-IEEE-SENSOR-TEMPORAL-MISALIGNMENT-2024`, `D166-ROBOT-LOCALIZATION-SURVEY-2026`. Query IDs: `D166-A-QPACK-CLOSE-007`, `D166-Q062`.

- **Bounded rationale:** Bounded no-hit for tools_software_and_data at future/futuristic. Checked: D166-IEEE-V2X-SIDELINK-LOCALIZATION-2024: candidate named in the cell ledger and checked under its linked query; source-specific limit is in that query log. | D166-IEEE-ROADCODE-GNSS-DENIED-COOPERATIVE-2025: candidate named in the cell ledger and checked under its linked query; source-specific limit is in that query log. | D166-COOPERATIVE-MULTIVEHICLE-LOCALIZATION-ISCIF-2024: candidate named in the cell ledger and checked under its linked query; source-specific limit is in that query log. | D166-IEEE-SENSOR-TEMPORAL-MISALIGNMENT-2024: candidate named in the cell ledger and checked under its linked query; source-specific limit is in that query log. | D166-ROBOT-LOCALIZATION-SURVEY-2026: checked as The localization survey maps emerging learned components as augmentations to classical localization pipelines; individual methods and evidence strength vary and require item-level ; limit: Robotics-wide rather than road-AV-only; a survey taxonomy does not establish a universal sequence or method performance.. Query IDs: D166-A-QPACK-CLOSE-007, D166-Q062. The candidates support other source types, current contexts, or limited abstracts as stated above; none supports a distinct, correctly typed claim for this exact cell. Search is bounded to the linked opened records and dates, not global absence.

#### `standards_credentials_and_learning_resources` / `established/traditional` - `mapped`

Candidate source IDs: `D166-ROS-REP-103-COORDINATE-CONVENTIONS`. Query IDs: `D166-A-QPACK-CLOSE-007`.

- **D166-A1-LOC-FOUNDATIONS-ESTABLISHED:** ROS REP-103 and REP-105 provide stable coordinate-convention and mobile-platform frame references used to specify how localization poses and transforms are represented; they are robotics conventions, not automotive regulations. **Item type:** standard/regulatory reference. **Inputs:** Not applicable as a computational interface; the cited item is a knowledge, standard, or learning-resource claim. **Outputs:** The source-supported knowledge/criterion/learning scope is the claim text itself; no software output or interface is inferred. **Assumptions/limits:** Source-specific conditions and non-generalization limits: Community robotics conventions, not a formal vehicle certification standard or universal stack mandate. **Source(s):** `D166-ROS-REP-103-COORDINATE-CONVENTIONS`. **Exact locator:** Official ROS REP 103 coordinate-frame and unit conventions; REP-105 mobile-platform frame tree; source pages already reviewed in the workpack. **Relationship evidence:** `context_only`; Frame conventions provide interface context for pose/transform use; they do not by themselves require a particular estimator. Source(s): `D166-ROS-REP-103-COORDINATE-CONVENTIONS`; locator: Official ROS REP 103 coordinate-frame and unit conventions; REP-105 mobile-platform frame tree; source pages already reviewed in the workpack..

#### `standards_credentials_and_learning_resources` / `current` - `bounded_no_hit`

Candidate source IDs: `D166-ISO-23150-20-SENSOR-INTERFACES-2026`, `D166-IEEE-1588-2019-PTP`, `D166-ROS-REP-103-COORDINATE-CONVENTIONS`, `D166-ROS-REP-105-MOBILE-PLATFORM-FRAMES`. Query IDs: `D166-Q061`.

- **Bounded rationale:** ISO 23150-20 was removed because its scope is sensor performance/health interfaces for perception and fusion, not a localization-specific standard or credential. The opened ROS frame references and IEEE timing records define conventions but do not establish a localization-specific current credential/standard claim in this cell.

#### `standards_credentials_and_learning_resources` / `emerging` - `bounded_no_hit`

Candidate source IDs: `D166-ISO-23150-20-SENSOR-INTERFACES-2026`, `D166-IEEE-1588-2019-PTP`, `D166-ROS-REP-103-COORDINATE-CONVENTIONS`, `D166-ROS-REP-105-MOBILE-PLATFORM-FRAMES`. Query IDs: `D166-A-QPACK-CLOSE-007`, `D166-Q061`.

- **Bounded rationale:** Bounded no-hit for standards_credentials_and_learning_resources at emerging. Checked: D166-ISO-23150-20-SENSOR-INTERFACES-2026: checked as Official ISO committee catalogue identifies Edition 1, published June 2026, stage 60.60; abstract covers sensor performance, health, calibration and common sensor-input interfaces ; limit: Full standard is paid; only official catalogue status and abstract were inspected. This is a logical interface standard, not a cal | D166-IEEE-1588-2019-PTP: checked as IEEE Standards Association lists IEEE 1588-2019 as active and amendments including 1588h-2026; page describes network clock synchronization and sub-microsecond capability under pro; limit: Generic networked measurement/control timing, not an automotive sensor-fusion implementation or safety result; full standard requi | D166-ROS-REP-103-COORDINATE-CONVENTIONS: checked as A foundational sensing integration concept is that sensor data must have defined coordinate conventions/transforms before it can be combined; ROS REP 103 documents standard units, ; limit: REP 103 is a ROS convention; it does not specify every automotive coordinate frame or calibration method. | D166-ROS-REP-105-MOBILE-PLATFORM-FRAMES: candidate named in the cell ledger and checked under its linked query; source-specific limit is in that query log.. Query IDs: D166-A-QPACK-CLOSE-007, D166-Q061. The candidates support other source types, current contexts, or limited abstracts as stated above; none supports a distinct, correctly typed claim for this exact cell. Search is bounded to the linked opened records and dates, not global absence.

#### `standards_credentials_and_learning_resources` / `future/futuristic` - `bounded_no_hit`

Candidate source IDs: . Query IDs: `D166-A-QPACK-CLOSE-007`.

- **Bounded rationale:** No supported standards_credentials_and_learning_resources item was found for future/futuristic. The exact counter-search scope and result are: D166-A-QPACK-CLOSE-007 (2026-10-24): actual searches: site:autowarefoundation.github.io/autoware_core localization EKF pose twist covariance diagnostics time delay Mahalanobis; official KITTI odometry benchmark dataset ground truth trajectories evaluation terms license; Boreas autonomous driving dataset official localization benchmark license all weather; Nigeria vehicle positioning localization dataset GNSS denied IO-VNBD smartphone CAN country coverage terms; autonomous vehicle localization future 2035 roadmap cooperative localization standards future algorithm official 2025 2026; site:iso.org vehicle localization autonomous driving GNSS positioning standard committee 2026 work item; official university course autonomous vehicle localization state estimation curriculum 2025; site:publications.ri.cmu.edu navigation Kalman filter autonomous vehicles 1994 state space; opened: https://autowarefoundation.github.io/autoware_core/pr-482/localization/autoware_ekf_localizer/; https://autowarefoundation.github.io/autoware_core/pr-689/localization/autoware_ekf_localizer/; https://www.cvlibs.net/datasets/kitti/eval_odometry.php; https://www.cvlibs.net/datasets/kitti/raw_data.php; https://registry.opendata.aws/boreas/; https://link.springer.com/article/10.1007/s41315-026-00528-9; https://www.coursera.org/learn/state-estimation-localization-self-driving-cars; https://opas.peppi.utu.fi/en/course/DTEK2102/106565?period=2024-2027; https://www.weforum.org/publications/autonomous-vehicles-timeline-and-roadmap-ahead; https://publications.ri.cmu.edu/a-3d-space-formulation-of-a-navigation-kalman-filter-for-autonomous-vehicles; findings: Autoware docs directly specify pose/twist inputs, covariance, time-delay handling, yaw-bias correction, Mahalanobis gating and pose/twist/odometry/covariance/diagnostics outputs. KITTI provides 22 odometry sequences, training ground truth, evaluation-only sequences and translation/rotation metrics; Boreas provides multimodal year-round weather data under CC BY 4.0. Open 2026 localization survey and course catalogues identify current/emerging learning-augmented and semantic approaches plus course outcomes. No inspectable future road-vehicle localization standard, future selectable tool/data product, credential or output contract was confirmed. Nigeria-related IO-VNBD evidence remains smartphone positioning, not Nigerian vehicle CAN/AV deployment. Opened the CMU Robotics Institute 1994 technical-report record. Its abstract describes a 3D asynchronous state-space navigation Kalman filter for autonomous-vehicle position estimation, including sensor integration, dead reckoning, INS/GPS, landmarks and map matching. The linked full PDF timed out, so the claim is limited to the abstract.; limits: Autoware pages document one stack and include PR-version pages; they do not establish universal contracts. KITTI is academic-use only and European data; Boreas has Canadian geography and CC BY 4.0. IO-VNBD country/sensor caveat remains. WEF roadmap is adoption forecast, not technical validation. Future and legal searches are bounded; they cannot prove universal absence. CMU report body was not available after a PDF fetch timeout; no equations, performance or full-text comparisons are claimed.. The inspected evidence supports other horizons/item types or does not expose enough content for this cell; no unsupported claim is substituted. This is a bounded search disposition, not a pending track or global absence claim.

#### `outputs_and_downstream_role_context` / `established/traditional` - `bounded_no_hit`

Candidate source IDs: . Query IDs: `D166-A-QPACK-CLOSE-007`.

- **Bounded rationale:** No supported outputs_and_downstream_role_context item was found for established/traditional. The exact counter-search scope and result are: D166-A-QPACK-CLOSE-007 (2026-10-24): actual searches: site:autowarefoundation.github.io/autoware_core localization EKF pose twist covariance diagnostics time delay Mahalanobis; official KITTI odometry benchmark dataset ground truth trajectories evaluation terms license; Boreas autonomous driving dataset official localization benchmark license all weather; Nigeria vehicle positioning localization dataset GNSS denied IO-VNBD smartphone CAN country coverage terms; autonomous vehicle localization future 2035 roadmap cooperative localization standards future algorithm official 2025 2026; site:iso.org vehicle localization autonomous driving GNSS positioning standard committee 2026 work item; official university course autonomous vehicle localization state estimation curriculum 2025; site:publications.ri.cmu.edu navigation Kalman filter autonomous vehicles 1994 state space; opened: https://autowarefoundation.github.io/autoware_core/pr-482/localization/autoware_ekf_localizer/; https://autowarefoundation.github.io/autoware_core/pr-689/localization/autoware_ekf_localizer/; https://www.cvlibs.net/datasets/kitti/eval_odometry.php; https://www.cvlibs.net/datasets/kitti/raw_data.php; https://registry.opendata.aws/boreas/; https://link.springer.com/article/10.1007/s41315-026-00528-9; https://www.coursera.org/learn/state-estimation-localization-self-driving-cars; https://opas.peppi.utu.fi/en/course/DTEK2102/106565?period=2024-2027; https://www.weforum.org/publications/autonomous-vehicles-timeline-and-roadmap-ahead; https://publications.ri.cmu.edu/a-3d-space-formulation-of-a-navigation-kalman-filter-for-autonomous-vehicles; findings: Autoware docs directly specify pose/twist inputs, covariance, time-delay handling, yaw-bias correction, Mahalanobis gating and pose/twist/odometry/covariance/diagnostics outputs. KITTI provides 22 odometry sequences, training ground truth, evaluation-only sequences and translation/rotation metrics; Boreas provides multimodal year-round weather data under CC BY 4.0. Open 2026 localization survey and course catalogues identify current/emerging learning-augmented and semantic approaches plus course outcomes. No inspectable future road-vehicle localization standard, future selectable tool/data product, credential or output contract was confirmed. Nigeria-related IO-VNBD evidence remains smartphone positioning, not Nigerian vehicle CAN/AV deployment. Opened the CMU Robotics Institute 1994 technical-report record. Its abstract describes a 3D asynchronous state-space navigation Kalman filter for autonomous-vehicle position estimation, including sensor integration, dead reckoning, INS/GPS, landmarks and map matching. The linked full PDF timed out, so the claim is limited to the abstract.; limits: Autoware pages document one stack and include PR-version pages; they do not establish universal contracts. KITTI is academic-use only and European data; Boreas has Canadian geography and CC BY 4.0. IO-VNBD country/sensor caveat remains. WEF roadmap is adoption forecast, not technical validation. Future and legal searches are bounded; they cannot prove universal absence. CMU report body was not available after a PDF fetch timeout; no equations, performance or full-text comparisons are claimed.. The inspected evidence supports other horizons/item types or does not expose enough content for this cell; no unsupported claim is substituted. This is a bounded search disposition, not a pending track or global absence claim.

#### `outputs_and_downstream_role_context` / `current` - `mapped`

Candidate source IDs: `D166-AUTOWARE-LOCALIZATION-OUTPUT-CONTRACT`, `D166-AUTOWARE-EKF-LOCALIZER-DOCS-2026`, `D166-LVI-SAM-ICRA-2021`. Query IDs: `D166-Q040`.

- **D166-A-MAP-048:** Autoware?s localization output contract provides timestamped pose, twist and acceleration with covariance, frame transforms and diagnostics for downstream consumers; rates and conventions are stack-specific. **Item type:** system output/downstream role-task context. **Inputs:** No concrete input is stated in the inspected claim/locator; none is inferred. **Outputs:** Source claim: Autoware?s localization output contract provides timestamped pose, twist and acceleration with covariance, frame transforms and diagnostics for downstream consumers; rates and conventions are stack-specific. **Assumptions/limits:** Source-specific conditions and non-generalization limits: This is the Autoware architecture contract, not a universal AV interface standard or proof that a stack meets a safety target. Frequencies, frame conventions, estimator architecture and diagnostics must be verified against the actual vehicle/ODD and applicable standards. **Source(s):** `D166-AUTOWARE-LOCALIZATION-OUTPUT-CONTRACT`. **Exact locator:** Localization component inputs/outputs and recommended pose estimator, twist/acceleration estimator, fusion filter, diagnostics and TF architecture. **Relationship evidence:** `context_only`; This mapping connects one source claim to one area/family/horizon cell; it asserts no item-to-item prerequisite, alternative, complement or producer-consumer relationship. Source(s): `D166-AUTOWARE-LOCALIZATION-OUTPUT-CONTRACT`; locator: Localization component inputs/outputs and recommended pose estimator, twist/acceleration estimator, fusion filter, diagnostics and TF architecture..

#### `outputs_and_downstream_role_context` / `emerging` - `bounded_no_hit`

Candidate source IDs: `D166-AUTOWARE-LOCALIZATION-OUTPUT-CONTRACT`, `D166-AUTOWARE-EKF-LOCALIZER-DOCS-2026`, `D166-LVI-SAM-ICRA-2021`. Query IDs: `D166-A-QPACK-CLOSE-007`, `D166-Q040`.

- **Bounded rationale:** Bounded no-hit for outputs_and_downstream_role_context at emerging. Checked: D166-AUTOWARE-LOCALIZATION-OUTPUT-CONTRACT: checked as Autoware's documented localization design estimates vehicle pose, velocity and acceleration, exposes timestamped covariance-bearing state outputs and diagnostics to planning/contro; limit: Stack-specific design documentation and evolving implementation; does not establish universal output contracts, map necessity or p | D166-AUTOWARE-EKF-LOCALIZER-DOCS-2026: checked as Autoware?s EKF localizer documents current implementation prerequisites including timestamp quality, frames/units, motion and noise assumptions, outlier handling and covariance int; limit: This documents one implementation and explicitly warns covariance accuracy can be limited. Parameters and thresholds are not trans | D166-LVI-SAM-ICRA-2021: checked as The 2021 LVI-SAM system is a concrete current-era research design combining visual-inertial and LiDAR-inertial subsystems; the paper?s tested conditions limit transfer claims.; limit: The published abstract is inspected; full paper not reviewed here. This is one research system and does not prove all sensors must. Query IDs: D166-A-QPACK-CLOSE-007, D166-Q040. The candidates support other source types, current contexts, or limited abstracts as stated above; none supports a distinct, correctly typed claim for this exact cell. Search is bounded to the linked opened records and dates, not global absence.

#### `outputs_and_downstream_role_context` / `future/futuristic` - `bounded_no_hit`

Candidate source IDs: . Query IDs: `D166-A-QPACK-CLOSE-007`.

- **Bounded rationale:** No supported outputs_and_downstream_role_context item was found for future/futuristic. The exact counter-search scope and result are: D166-A-QPACK-CLOSE-007 (2026-10-24): actual searches: site:autowarefoundation.github.io/autoware_core localization EKF pose twist covariance diagnostics time delay Mahalanobis; official KITTI odometry benchmark dataset ground truth trajectories evaluation terms license; Boreas autonomous driving dataset official localization benchmark license all weather; Nigeria vehicle positioning localization dataset GNSS denied IO-VNBD smartphone CAN country coverage terms; autonomous vehicle localization future 2035 roadmap cooperative localization standards future algorithm official 2025 2026; site:iso.org vehicle localization autonomous driving GNSS positioning standard committee 2026 work item; official university course autonomous vehicle localization state estimation curriculum 2025; site:publications.ri.cmu.edu navigation Kalman filter autonomous vehicles 1994 state space; opened: https://autowarefoundation.github.io/autoware_core/pr-482/localization/autoware_ekf_localizer/; https://autowarefoundation.github.io/autoware_core/pr-689/localization/autoware_ekf_localizer/; https://www.cvlibs.net/datasets/kitti/eval_odometry.php; https://www.cvlibs.net/datasets/kitti/raw_data.php; https://registry.opendata.aws/boreas/; https://link.springer.com/article/10.1007/s41315-026-00528-9; https://www.coursera.org/learn/state-estimation-localization-self-driving-cars; https://opas.peppi.utu.fi/en/course/DTEK2102/106565?period=2024-2027; https://www.weforum.org/publications/autonomous-vehicles-timeline-and-roadmap-ahead; https://publications.ri.cmu.edu/a-3d-space-formulation-of-a-navigation-kalman-filter-for-autonomous-vehicles; findings: Autoware docs directly specify pose/twist inputs, covariance, time-delay handling, yaw-bias correction, Mahalanobis gating and pose/twist/odometry/covariance/diagnostics outputs. KITTI provides 22 odometry sequences, training ground truth, evaluation-only sequences and translation/rotation metrics; Boreas provides multimodal year-round weather data under CC BY 4.0. Open 2026 localization survey and course catalogues identify current/emerging learning-augmented and semantic approaches plus course outcomes. No inspectable future road-vehicle localization standard, future selectable tool/data product, credential or output contract was confirmed. Nigeria-related IO-VNBD evidence remains smartphone positioning, not Nigerian vehicle CAN/AV deployment. Opened the CMU Robotics Institute 1994 technical-report record. Its abstract describes a 3D asynchronous state-space navigation Kalman filter for autonomous-vehicle position estimation, including sensor integration, dead reckoning, INS/GPS, landmarks and map matching. The linked full PDF timed out, so the claim is limited to the abstract.; limits: Autoware pages document one stack and include PR-version pages; they do not establish universal contracts. KITTI is academic-use only and European data; Boreas has Canadian geography and CC BY 4.0. IO-VNBD country/sensor caveat remains. WEF roadmap is adoption forecast, not technical validation. Future and legal searches are bounded; they cannot prove universal absence. CMU report body was not available after a PDF fetch timeout; no equations, performance or full-text comparisons are claimed.. The inspected evidence supports other horizons/item types or does not expose enough content for this cell; no unsupported claim is substituted. This is a bounded search disposition, not a pending track or global absence claim.

### Six task tracks

#### `foundation_and_prerequisites` - `complete`

**Topic focus:** Coordinate frames, kinematics/dynamics, sensor models, uncertainty/probability, linear algebra, state-space models and map/sensor calibration prerequisites.
**Gap filler:** Search the area's source-defined task and skill requirements; extract underlying concepts, inputs, outputs and prerequisites. Separate true prerequisites from topics that are merely co-taught or often used together.
**Categories/horizons:** knowledge, competencies/skills, methods; established/traditional, current.
**Mapped cells:** foundations_knowledge_and_competencies / current; methods_and_designs / established/traditional; methods_and_designs / current
**Assessed cells:** foundations_knowledge_and_competencies / established/traditional; foundations_knowledge_and_competencies / current; methods_and_designs / established/traditional; methods_and_designs / current
**Evidence IDs:** `D166-AUTOWARE-EKF-LOCALIZER-DOCS-2026`, `D166-AUTOWARE-LOCALIZATION-OUTPUT-CONTRACT`, `D166-LVI-SAM-ICRA-2021`, `D166-KITTI-ODOMETRY-BENCHMARK`, `D166-A1-CMU-NAVIGATION-KALMAN-1994`
**Query IDs:** `D166-A-QPACK-02`, `D166-A-QPACK-03`, `D166-A-QPACK-06`, `D166-A-QPACK-07`, `D166-A-QPACK-CLOSE-007`
**Closure rationale:** Terminal complete disposition within original topic scope: reviewed 4 applicable cells (mapped=3, bounded_no_hit=1). Mapped evidence is restricted to the linked claims; bounded no-hit cells record source/type/horizon exclusions and query limits. The dated area counter-search found no further supportable claim within this track.

**Counter-search tests/results:**

- Current stack output contracts and research surveys are not universal requirements; role-task records remain conditional and canonical role fit/routes remain unchanged.

- GNSS-denied/odometry positioning data

- IO-VNBD Nigeria records are smartphone positioning and do not establish Nigerian vehicle CAN/AV localization coverage; no verified local AV deployment or map-linked localization dataset was found.

- Nigeria-specific road-vehicle regulation search boundary

- No future road-vehicle localization standard, credential or selectable product/output contract was verified in the bounded official/research search.

- country and sensor-subset coverage

- map-based and cooperative localization versus local vehicle-state evidence

- time/frame interface status

#### `methods_techniques_and_alternatives` - `complete`

**Topic focus:** GNSS/INS, wheel odometry, Kalman/EKF/UKF and particle filters, scan matching/NDT, visual/LiDAR odometry, factor-graph SLAM, map matching and learned estimators; compare observability, drift, outages and compute.
**Gap filler:** Search for named method families and their sub-techniques; compare alternatives by task, assumptions, data, output, validation and limitations. Record combinations only where the documented design requires a handoff.
**Categories/horizons:** methods/designs, techniques/estimators/algorithms; established/traditional, current, emerging.
**Mapped cells:** methods_and_designs / established/traditional; methods_and_designs / current; methods_and_designs / emerging; techniques_estimators_and_algorithms / established/traditional; techniques_estimators_and_algorithms / current; techniques_estimators_and_algorithms / emerging
**Assessed cells:** methods_and_designs / established/traditional; methods_and_designs / current; methods_and_designs / emerging; techniques_estimators_and_algorithms / established/traditional; techniques_estimators_and_algorithms / current; techniques_estimators_and_algorithms / emerging
**Evidence IDs:** `D166-LVI-SAM-ICRA-2021`, `D166-AUTOWARE-EKF-LOCALIZER-DOCS-2026`, `D166-KITTI-ODOMETRY-BENCHMARK`, `D166-A1-CMU-NAVIGATION-KALMAN-1994`, `D166-ROBOT-LOCALIZATION-SURVEY-2026`, `D166-IEEE-V2X-SIDELINK-LOCALIZATION-2024`, `D166-IEEE-ROADCODE-GNSS-DENIED-COOPERATIVE-2025`, `D166-COOPERATIVE-MULTIVEHICLE-LOCALIZATION-ISCIF-2024`, `D166-IEEE-SENSOR-TEMPORAL-MISALIGNMENT-2024`
**Query IDs:** `D166-A-QPACK-02`, `D166-A-QPACK-03`, `D166-A-QPACK-06`, `D166-A-QPACK-07`, `D166-A-QPACK-CLOSE-007`
**Closure rationale:** Terminal complete disposition within original topic scope: reviewed 6 applicable cells (mapped=6). Mapped evidence is restricted to the linked claims; bounded no-hit cells record source/type/horizon exclusions and query limits. The dated area counter-search found no further supportable claim within this track.

**Counter-search tests/results:**

- Current stack output contracts and research surveys are not universal requirements; role-task records remain conditional and canonical role fit/routes remain unchanged.

- GNSS-denied/odometry positioning data

- IO-VNBD Nigeria records are smartphone positioning and do not establish Nigerian vehicle CAN/AV localization coverage; no verified local AV deployment or map-linked localization dataset was found.

- Nigeria-specific road-vehicle regulation search boundary

- No future road-vehicle localization standard, credential or selectable product/output contract was verified in the bounded official/research search.

- country and sensor-subset coverage

- map-based and cooperative localization versus local vehicle-state evidence

- time/frame interface status

#### `tools_data_and_implementation` - `bounded_no_hit`

**Topic focus:** Autoware/Apollo localization modules, ROS/GTSAM and comparable maintained libraries, GNSS/IMU/LiDAR/camera datasets and evaluation metrics; compare official docs, coordinate conventions and benchmark limitations.
**Gap filler:** Find current tools, instruments, platforms and datasets actually used for the area's methods. Record exact use/context, alternatives, input/output compatibility, access/licensing and limitations; do not infer a tool from a method name.
**Categories/horizons:** tools/software/platforms, datasets/instruments/data standards; current, emerging.
**Mapped cells:** tools_software_and_data / current
**Assessed cells:** tools_software_and_data / current; tools_software_and_data / emerging
**Evidence IDs:** `D166-KITTI-ODOMETRY-BENCHMARK`, `D166-BOREAS-MULTISEASON-DATASET-2023`, `D166-OXFORD-ROBOTCAR-DATASET-PAPER`, `D166-AUTOWARE-LOCALIZATION-OUTPUT-CONTRACT`, `D166-A1-IOVNBD-2021`, `D166-IEEE-V2X-SIDELINK-LOCALIZATION-2024`, `D166-IEEE-ROADCODE-GNSS-DENIED-COOPERATIVE-2025`, `D166-COOPERATIVE-MULTIVEHICLE-LOCALIZATION-ISCIF-2024`, `D166-IEEE-SENSOR-TEMPORAL-MISALIGNMENT-2024`, `D166-ROBOT-LOCALIZATION-SURVEY-2026`
**Query IDs:** `D166-A-QPACK-02`, `D166-A-QPACK-03`, `D166-A-QPACK-06`, `D166-A-QPACK-07`, `D166-A-QPACK-CLOSE-007`
**Closure rationale:** Terminal bounded_no_hit within original topic scope: reviewed 2 applicable cells (mapped=1, bounded_no_hit=1). The dated counter-search found no defensible additional claim for this track after source and type/horizon limits were checked. Bounded result: No Nigerian vehicle-CAN/AV localization dataset was verified; IO-VNBD Nigeria records are smartphone IMU/GPS, while KITTI/Boreas have non-Nigerian collection geographies. This closes the searched scope, not global absence.

**Counter-search tests/results:**

- Current stack output contracts and research surveys are not universal requirements; role-task records remain conditional and canonical role fit/routes remain unchanged.

- GNSS-denied/odometry positioning data

- IO-VNBD Nigeria records are smartphone positioning and do not establish Nigerian vehicle CAN/AV localization coverage; no verified local AV deployment or map-linked localization dataset was found.

- Nigeria-specific road-vehicle regulation search boundary

- No future road-vehicle localization standard, credential or selectable product/output contract was verified in the bounded official/research search.

- country and sensor-subset coverage

- map-based and cooperative localization versus local vehicle-state evidence

- time/frame interface status

**Bounded remaining finding:**

- No Nigerian vehicle-CAN/AV localization dataset was verified; IO-VNBD Nigeria records are smartphone IMU/GPS, while KITTI/Boreas have non-Nigerian collection geographies.

#### `emerging_and_future_frontier` - `bounded_no_hit`

**Topic focus:** Tightly coupled multi-sensor/semantic fusion, learned localization, map-light approaches and novel positioning assistance where evidenced; distinguish experimental robustness claims from validated vehicle deployments.
**Gap filler:** Search recent work and credible roadmaps for material emerging methods/tools. Distinguish demonstrated research, pilot use, deployed practice and speculation; mark future/no-hit only after recording the actual query and evidence boundary.
**Categories/horizons:** knowledge, methods, techniques, tools; emerging, future/futuristic.
**Mapped cells:** methods_and_designs / emerging; techniques_estimators_and_algorithms / emerging
**Assessed cells:** foundations_knowledge_and_competencies / emerging; foundations_knowledge_and_competencies / future/futuristic; methods_and_designs / emerging; methods_and_designs / future/futuristic; techniques_estimators_and_algorithms / emerging; techniques_estimators_and_algorithms / future/futuristic; tools_software_and_data / emerging; tools_software_and_data / future/futuristic
**Evidence IDs:** `D166-IEEE-V2X-SIDELINK-LOCALIZATION-2024`, `D166-IEEE-ROADCODE-GNSS-DENIED-COOPERATIVE-2025`, `D166-COOPERATIVE-MULTIVEHICLE-LOCALIZATION-ISCIF-2024`, `D166-IEEE-SENSOR-TEMPORAL-MISALIGNMENT-2024`, `D166-ROBOT-LOCALIZATION-SURVEY-2026`, `D166-LVI-SAM-ICRA-2021`, `D166-AUTOWARE-EKF-LOCALIZER-DOCS-2026`, `D166-KITTI-ODOMETRY-BENCHMARK`, `D166-BOREAS-MULTISEASON-DATASET-2023`, `D166-OXFORD-ROBOTCAR-DATASET-PAPER`, `D166-AUTOWARE-LOCALIZATION-OUTPUT-CONTRACT`, `D166-A1-IOVNBD-2021`
**Query IDs:** `D166-A-QPACK-02`, `D166-A-QPACK-03`, `D166-A-QPACK-06`, `D166-A-QPACK-07`, `D166-A-QPACK-CLOSE-007`
**Closure rationale:** Terminal bounded_no_hit within original topic scope: reviewed 8 applicable cells (mapped=2, bounded_no_hit=6). The dated counter-search found no defensible additional claim for this track after source and type/horizon limits were checked. Bounded result: No future validated road-vehicle localization method/tool/data product, credential/standard or output contract was established; current research directions are not deployment forecasts. This closes the searched scope, not global absence.

**Counter-search tests/results:**

- Current stack output contracts and research surveys are not universal requirements; role-task records remain conditional and canonical role fit/routes remain unchanged.

- GNSS-denied/odometry positioning data

- IO-VNBD Nigeria records are smartphone positioning and do not establish Nigerian vehicle CAN/AV localization coverage; no verified local AV deployment or map-linked localization dataset was found.

- Nigeria-specific road-vehicle regulation search boundary

- No future road-vehicle localization standard, credential or selectable product/output contract was verified in the bounded official/research search.

- country and sensor-subset coverage

- map-based and cooperative localization versus local vehicle-state evidence

- time/frame interface status

**Bounded remaining finding:**

- No future validated road-vehicle localization method/tool/data product, credential/standard or output contract was established; current research directions are not deployment forecasts.

#### `standards_credentials_and_learning_resources` - `complete`

**Topic focus:** Positioning, coordinate/time, automotive safety and vehicle test standards; geospatial/robotics curricula and training; check applicability to road vehicles and regional GNSS infrastructure.
**Gap filler:** Search applicable laws, standards, professional frameworks, credentials and structured learning materials. Verify scope, edition/status, jurisdiction and prerequisites; mark not-applicable only with a short source-backed reason.
**Categories/horizons:** standards/regulation, certifications/credentials, learning resources; current, emerging.
**Mapped cells:** none
**Assessed cells:** standards_credentials_and_learning_resources / current; standards_credentials_and_learning_resources / emerging
**Evidence IDs:** `D166-ISO-23150-20-SENSOR-INTERFACES-2026`, `D166-IEEE-1588-2019-PTP`, `D166-ROS-REP-103-COORDINATE-CONVENTIONS`, `D166-ROS-REP-105-MOBILE-PLATFORM-FRAMES`
**Query IDs:** `D166-A-QPACK-02`, `D166-A-QPACK-03`, `D166-A-QPACK-06`, `D166-A-QPACK-07`, `D166-A-QPACK-CLOSE-007`
**Closure rationale:** Terminal complete disposition within original topic scope: reviewed 2 applicable cells (bounded_no_hit=2). Mapped evidence is restricted to the linked claims; bounded no-hit cells record source/type/horizon exclusions and query limits. The dated area counter-search found no further supportable claim within this track.

**Counter-search tests/results:**

- Current stack output contracts and research surveys are not universal requirements; role-task records remain conditional and canonical role fit/routes remain unchanged.

- GNSS-denied/odometry positioning data

- IO-VNBD Nigeria records are smartphone positioning and do not establish Nigerian vehicle CAN/AV localization coverage; no verified local AV deployment or map-linked localization dataset was found.

- Nigeria-specific road-vehicle regulation search boundary

- No future road-vehicle localization standard, credential or selectable product/output contract was verified in the bounded official/research search.

- country and sensor-subset coverage

- map-based and cooperative localization versus local vehicle-state evidence

- time/frame interface status

#### `outputs_and_downstream_role_context` - `complete`

**Topic focus:** Pose, velocity, bias, covariance/confidence and localization health consumed by planning/control/safety; map conditional role use to localization, robotics, software and vehicle-integration tasks.
**Gap filler:** Trace what the area produces, who consumes it downstream, and which roles use it under what conditions. Map item-to-task/output evidence with boundaries and counterexamples; keep role evidence separate from area-definition evidence and do not change canonical fit.
**Categories/horizons:** work outputs, role tasks/skills, downstream area links; current, emerging.
**Mapped cells:** outputs_and_downstream_role_context / current
**Assessed cells:** outputs_and_downstream_role_context / current; outputs_and_downstream_role_context / emerging
**Evidence IDs:** `D166-AUTOWARE-LOCALIZATION-OUTPUT-CONTRACT`, `D166-AUTOWARE-EKF-LOCALIZER-DOCS-2026`, `D166-LVI-SAM-ICRA-2021`
**Query IDs:** `D166-A-QPACK-02`, `D166-A-QPACK-03`, `D166-A-QPACK-06`, `D166-A-QPACK-07`, `D166-A-QPACK-CLOSE-007`
**Closure rationale:** Terminal complete disposition within original topic scope: reviewed 2 applicable cells (mapped=1, bounded_no_hit=1). Mapped evidence is restricted to the linked claims; bounded no-hit cells record source/type/horizon exclusions and query limits. The dated area counter-search found no further supportable claim within this track.

**Counter-search tests/results:**

- Current stack output contracts and research surveys are not universal requirements; role-task records remain conditional and canonical role fit/routes remain unchanged.

- GNSS-denied/odometry positioning data

- IO-VNBD Nigeria records are smartphone positioning and do not establish Nigerian vehicle CAN/AV localization coverage; no verified local AV deployment or map-linked localization dataset was found.

- Nigeria-specific road-vehicle regulation search boundary

- No future road-vehicle localization standard, credential or selectable product/output contract was verified in the bounded official/research search.

- country and sensor-subset coverage

- map-based and cooperative localization versus local vehicle-state evidence

- time/frame interface status

## Dated area counter-searches

### D166:vehicle-sensing-and-sensor-calibration

Query IDs: `D166-A-QPACK-01`, `D166-A-QPACK-03`, `D166-A-QPACK-05`, `D166-A-QPACK-CLOSE-001`, `D166-A-QPACK-CLOSE-005`.

Tested omissions:

- intrinsic/extrinsic versus temporal calibration

- target-based versus targetless and online drift/self-calibration

- clock and frame conventions

- camera/LiDAR/radar and broader modality performance under rain/adverse visibility

- sensor-health/calibration interface status

- onboard versus roadside calibration boundary

- established targetless calibration algorithms and maintained/offline tool alternatives

- national Nigeria vocational ADAS sensor calibration qualifications

- Nigeria National Metrology Institute calibration capability and traceability limits

- future horizon: forecast sensor hardware versus validated algorithm/tool/output/credential items

- NIST automotive LiDAR testbed versus maintained downloadable software status


**Result:** Full NBTE national qualification and official SON metrology pages were inspected; local evidence covers technician-level ADAS radar/camera/LiDAR target/dynamic calibration and general national metrology traceability, not AV sensor-engineering routes or local automotive sensor calibration services. Direct tool docs verified historical CMU LCCT and current Fraunhofer ROS2 toolbox. NIST 2025 abstract describes an evaluation testbed, but PDF exceeded browser-tool fetch size, so no detailed metric/tool claims were made. Future no-hit cells are bounded to the named source families. Dated close search D166-A-QPACK-CLOSE-005 directly reconciled the remaining family/horizon candidates, region-specific evidence, future claims and role boundaries. All candidate cells now have a supported narrow mapping or a bounded no-hit disposition.

### D166:perception-and-scene-understanding

Query IDs: `D166-A-QPACK-01`, `D166-A-QPACK-05`, `D166-A-QPACK-08`, `D166-A-QPACK-CLOSE-003`, `D166-A-QPACK-CLOSE-004`.

Tested omissions:

- weather/lighting and occlusion sensitivity

- camera/LiDAR/radar cross-modal differences

- uncertainty-based evaluation and outputs

- dataset geography/labels/license limits

- future/model architecture claims versus deployed implementations

- employer perception-task scope versus canonical software-developer role title

- long-horizon perception foundations/designs/algorithms/products/output contracts

- official AI-safety work-item status and distinction between published PAS and work item

- established benchmark/devkit scope and non-commercial license

- formal university learning outcomes and stated prerequisites


**Result:** Opened full Warwick accepted survey, official ETH catalogue, ISO 21448/34502/8800 and ISO/AWI 8800-1 records, official KITTI and Waymo perception datasets, Autoware design pages, and AESIN/WEF roadmaps. Mapped current/historical evidence where exact item claims were supported; future-horizon no-hit rows are limited to unsupported future competence, design, algorithm, tool/data product and output contract claims. ISO/AWI 8800-1 is mapped as a work item, not a published requirement. Dated close search D166-A-QPACK-CLOSE-004 directly reconciled the remaining family/horizon candidates, region-specific evidence, future claims and role boundaries. All candidate cells now have a supported narrow mapping or a bounded no-hit disposition.

### D166:high-definition-mapping

Query IDs: `D166-A-QPACK-03`, `D166-A-QPACK-04`, `D166-A-QPACK-CLOSE-006`.

Tested omissions:

- map formats versus production maps

- map change/freshness and update pipelines

- survey/vehicle-sensor map creation versus simulation format

- roadworks sign data and incremental updates

- map update geography and deployment claims


**Result:** Official ASAM status confirms OpenDRIVE 1.9.0 is a simulation/static-road-network format; a new 2026 Imperial abstract adds a monocular roadworks-sign to incremental OpenDRIVE update research example. Existing Argoverse map-change, Autoware/Lanelet2 and survey records supply distinct data, implementation and method contexts. Dated close search D166-A-QPACK-CLOSE-006 directly reconciled the remaining family/horizon candidates, region-specific evidence, future claims and role boundaries. All candidate cells now have a supported narrow mapping or a bounded no-hit disposition.

### D166:localization-and-vehicle-state-estimation

Query IDs: `D166-A-QPACK-02`, `D166-A-QPACK-03`, `D166-A-QPACK-06`, `D166-A-QPACK-CLOSE-007`.

Tested omissions:

- GNSS-denied/odometry positioning data

- country and sensor-subset coverage

- map-based and cooperative localization versus local vehicle-state evidence

- time/frame interface status

- Nigeria-specific road-vehicle regulation search boundary


**Result:** IO-VNBD full text adds a limited Nigeria-related positioning dataset but distinguishes Nigerian smartphone records from England-only CAN/ECU records. Existing indexed sources cover EKF, LVI-SAM, odometry/map matching and cooperative-method research; official searches did not surface a current Nigerian ADS public-road test/approval instrument. Dated close search D166-A-QPACK-CLOSE-007 directly reconciled the remaining family/horizon candidates, region-specific evidence, future claims and role boundaries. All candidate cells now have a supported narrow mapping or a bounded no-hit disposition.

## Query log

### `D166-A-QPACK-01` - Perception robustness and sensor behavior under natural/adversarial weather using recent primary sources.

**Date:** 2026-10-24
**Target families/sites:** NIST CSRC public research, SAE Mobilus technical papers, Zenodo versioned dataset records

**Actual searches:**

- `site:csrc.nist.gov autonomous vehicle perception sensitivity assessment 2026 NIST`

- `RainSense autonomous driving environmental perception dataset rain intensity annotations 2025 SAE 2025-01-7311`

**Pages/papers opened:**

- https://csrc.nist.gov/pubs/other/2026/01/30/on-the-assessment-of-sensitivity-of-autonomous-veh/final

- https://saemobilus.sae.org/papers/rainsense-autonomous-driving-environmental-perception-dataset-rain-intensity-annotations-2025-01-7311

- https://zenodo.org/records/17231190


**Findings:** Added NIST perception-sensitivity abstract, SAE RainSense paper and separate Zenodo dataset record. NIST describes ensemble uncertainty assessment in real and simulated adverse conditions; RainSense reports a small controlled natural-rain collection with camera/LiDAR/4D radar, labels and abstract-level modality comparison; Zenodo supplies versioned dataset metadata.
**Limits:** NIST and SAE papers assessed at abstract level; Zenodo has no populated license field. RainSense’s dummy-target/campus setup and NIST paper limits generalization. No universal sensor ranking or safety assurance follows.
**Disposition effect:** No canonical area definition or graph changed. Added evidence to workpack perception robustness, sensing/data and evaluation cells.

### `D166-A-QPACK-02` - Regional localization/road-perception evidence and Nigerian road-vehicle AV regulation/data availability.

**Date:** 2026-10-24
**Target families/sites:** FRSC and Nigerian government/regulator pages, peer-reviewed Nigerian/regional vehicle data papers, university repositories, official dataset/project pages

**Actual searches:**

- `Nigeria autonomous vehicle regulation testing policy road safety agency AV`

- `Africa autonomous vehicle perception dataset localization GNSS denied Nigerian roads research dataset`

- `site:frsc.gov.ng "autonomous vehicle" OR "self-driving"`

- `site:gov.ng autonomous vehicle regulation Nigeria self-driving vehicle testing road`

- `Nigeria autonomous vehicle legal framework public roads regulator automated driving system`

- `"IO-VNBD" "Inertial and Odometry" dataset DOI`

- `"Vehicle Tracking Dataset" Nigeria inertial odometry benchmark dataset 40 h 1300 km`

- `site:imatge.upc.edu/web/resources/useful-dataset USEFUL dataset license`

**Pages/papers opened:**

- https://frsc.gov.ng/about-us/who-we-are/

- https://pure.coventry.ac.uk/ws/portalfiles/portal/40741559/Binder8.pdf

- https://pubmed.ncbi.nlm.nih.gov/33665271/

- https://imatge.upc.edu/web/resources/useful-dataset (search result examined; direct open timed out)


**Findings:** IO-VNBD full text reports Nigeria among smartphone IMU/GPS collection locations but explicitly says vehicle CAN/ECU records were collected only in England. FRSC agency page describes road-safety functions, not an ADS test/approval rule. A purported AV dataset search result was not accepted without verifiable accountable primary data/paper.
**Limits:** Bounded search did not establish that Nigeria has no applicable AV law; no current official road-vehicle ADS testing/approval instrument surfaced. FRSC 2020 magazine result is dated commentary, not law. IO-VNBD is not a Nigeria AV sensor-suite dataset. USEFUL page direct open timed out and access/license remains unresolved.
**Disposition effect:** No canonical area or role route changed; added bounded IO-VNBD evidence and recorded local-data/regulatory scope gaps.

### `D166-A-QPACK-03` - Sensor calibration alternatives, online/self-calibration, clock/frame standards and map formats.

**Date:** 2026-10-24
**Target families/sites:** ISO official catalogue and browsing platform, IEEE Standards Association, ASAM standards catalogue, peer-reviewed calibration and map-maintenance research

**Actual searches:**

- `autonomous vehicle online self calibration sensor calibration targetless methods temporal calibration review 2025`

- `automotive sensor time synchronization IEEE 1588 vehicle sensor clocks camera lidar radar official standard`

- `site:asam.net OpenDRIVE 1.9.0 release 2026 road network static map format`

- `HD map change detection mapless autonomous driving production fleet update map freshness survey 2025`

- `site:iso.org "23150-20" ISO 2026 sensor interfaces`

- `ISO 23150-20 2026 sensor interfaces published DIS status official catalogue`

- `site:iso.org/standard "23150-20"`

**Pages/papers opened:**

- https://committee.iso.org/standard/87976.html?browse=ics

- https://standards.ieee.org/ieee/1547/6825/

- https://www.asam.net/standards/detail/opendrive/

- https://www.sciencedirect.com/science/article/pii/S0263224126022013 (publisher abstract only; full text paywalled)


**Findings:** ISO catalogue confirms ISO 23150-20:2026 is published, not DIS; abstract specifies performance, health, calibration and common sensor-input interfaces. IEEE lists 1588-2019 active with amendments through 2026. ASAM lists OpenDRIVE 1.9.0 released 2026-05-19 for static road-network/simulation scope. The indexed 2026 calibration-survey abstract covers target-based, targetless, learning-based, V2X and online estimation themes but does not establish deployment.
**Limits:** Standards claims are abstract/catalogue-level; full standard PDFs not accessed. Survey is paywalled. OpenDRIVE is simulation-oriented, not a production onboard-map contract.
**Disposition effect:** No canonical map or graph changed; confirmed standard status in workpack and refined limits for calibration/timing/map-format evidence.

### `D166-A-QPACK-04` - Recent roadworks-driven HD-map update methods and map/data-interface scope.

**Date:** 2026-10-24
**Target families/sites:** Imperial College London repository, peer-reviewed intelligent transport and AV mapping research

**Actual searches:**

- `real-time roadworks detection and high definition HD map updates autonomous vehicles 2026 monocular camera OpenDRIVE`

- `HD map change detection roadworks update incremental OpenDRIVE autonomous vehicles institutional repository`

**Pages/papers opened:**

- https://spiral.imperial.ac.uk/entities/publication/8a761c15-e955-4cbf-9e1d-87c4439fb02d


**Findings:** Added a 2026 journal article abstract describing monocular-camera/CLIP roadworks sign recognition feeding incremental OpenDRIVE map updates and UK motorway trials.
**Limits:** Repository abstract only; linked PDF not inspected. One research system and UK evaluation do not prove production deployment, global transfer or replacement of survey/map QA.
**Disposition effect:** No canonical map or graph changed; added an emerging map-maintenance evidence candidate.

### `D166-A-QPACK-05` - Multimodal adverse-visibility datasets and access/rights gaps.

**Date:** 2026-10-24
**Target families/sites:** University-maintained dataset pages, dataset repositories, peer-reviewed dataset papers

**Actual searches:**

- `site:imatge.upc.edu/web/resources/useful-dataset USEFUL dataset license`

- `USEFUL multimodal autonomous driving dataset paper 2026 sensor streams DOI 10.57967/hf/8147`

- `multi sensor autonomous driving dataset camera lidar radar adverse weather 2025 open access`

**Pages/papers opened:**

- https://imatge.upc.edu/web/resources/useful-dataset (search result inspected; direct open timed out)

- https://www.sciencedirect.com/science/article/pii/S2352340925002847 (search-result abstract only; not added)


**Findings:** Search results surfaced the 2026 USEFUL adverse-visibility dataset and a 2025 multi-sensor radar/IR dataset; neither was added because the accountable project/full source and usable access/license evidence were not verified. RainSense is supported separately by SAE and Zenodo records.
**Limits:** USEFUL direct page timed out and license/access were not confirmed; the other source was only a search-result abstract and was not converted into a full source claim.
**Disposition effect:** No map change. These remain unverified leads, not source additions.

### `D166-A-QPACK-06` - Regional localization dataset verification and vehicle-versus-smartphone scope.

**Date:** 2026-10-24
**Target families/sites:** Coventry University repository full text, PubMed bibliographic record, peer-reviewed Data in Brief data paper

**Actual searches:**

- `"IO-VNBD" Nigeria public roads github dataset license 10.1016/j.dib.2021.106885`

- `IO-VNBD Inertial and Odometry Benchmark Dataset Nigeria sensor subset article full text`

**Pages/papers opened:**

- https://pure.coventry.ac.uk/ws/portalfiles/portal/40741559/Binder8.pdf

- https://pubmed.ncbi.nlm.nih.gov/33665271/


**Findings:** Full article details country and platform scope. Smartphone IMU/GPS includes England, France and Nigeria; vehicle CAN/ECU is England-only. It records varied road/motion conditions, GPS outages and vehicle/smartphone signals.
**Limits:** Do not describe Nigeria smartphone records as multimodal AV sensor data, Nigerian ECU recordings or HD-map/ADS deployment evidence. Dataset file license and current repository contents were not checked.
**Disposition effect:** No area/role fit changed; added this bounded regional source to localization tools/data and kept regional claims open.

### `D166-A-QPACK-07` - Open targetless/online LiDAR-camera calibration methods and official localization output interfaces.

**Date:** 2026-10-24
**Target families/sites:** arXiv primary research preprint, Autoware Foundation maintained project documentation

**Actual searches:**

- `CalibRefine online automatic targetless LiDAR camera calibration arXiv 2502.17648`

- `Autoware localization architecture outputs covariance diagnostic frames map-only GNSS-only official documentation`

- `Autoware EKF localizer measurement time delay covariance topics official docs`

**Pages/papers opened:**

- https://arxiv.org/abs/2502.17648

- https://docs.autoware.org/main/design/autoware-architecture-v1/components/localization/

- https://docs.autoware.org/main/design/autoware-architecture-v1/interfaces/components/localization/

- https://autowarefoundation.github.io/autoware_core/pr-248/localization/autoware_ekf_localizer/


**Findings:** Added an abstract-only 2025 targetless/online calibration preprint and directly inspected current Autoware localization architecture/interface and EKF docs. Autoware documents map-based versus GNSS-only cases, explicit frame and sensor inputs, pose/twist/acceleration covariance outputs, diagnostics, and time-delay compensation. These are implementation-specific task and interface examples.
**Limits:** CalibRefine PDF was not reviewed and is a preprint. Autoware documentation is one maintained implementation, not a universal localization contract or credential/curriculum. No task is closed by one implementation example.
**Disposition effect:** No canonical map, graph or role fit changed. Added narrow emerging calibration evidence and strengthened source notes for localization outputs and map-conditional inputs.

### `D166-A-QPACK-08` - Professional learning resource and employer perception-task context.

**Date:** 2026-10-24
**Target families/sites:** Tel Aviv University official course catalog, Caterpillar Careers employer-hosted job description

**Actual searches:**

- `official university course syllabus mapping perception sensor fusion localization autonomous robot prerequisites`

- `Caterpillar Autonomy Engineering Specialist Perception job tasks 2026`

**Pages/papers opened:**

- https://careers.caterpillar.com/en/jobs/r0000397079/autonomy-engineering-specialist-perception/


**Findings:** Opened the Caterpillar posting and recorded a bounded perception-software task example for a conditional software-development assignment. The official Tel Aviv University search result describes a 2021 Mapping and Perception for an Autonomous Robot course, but direct page retrieval failed; it was excluded as a fully assessed source and is not used to map curriculum or prerequisites.
**Limits:** Caterpillar is one off-road specialist role and does not map the canonical title or establish role fit. The university result is snippet-only/direct-open failure, so it cannot support a source card or curriculum claim.
**Disposition effect:** No canonical area/role route or graph changed. Added only itemized task evidence with a title/scope boundary; kept curriculum gap open.

### `D166-A-QPACK-CLOSE-001` - Sensing calibration historical/current method and selectable-software counter-search; distinguish paper-described algorithms from documented tools.

**Date:** 2026-10-24
**Target families/sites:** MIT DSpace repository / peer-reviewed conference paper, Autoware official maintained documentation, arXiv author preprint / software description, CVF Open Access primary conference paper (direct access check)

**Actual searches:**

- `site:dspace.mit.edu fully automatic calibration LIDAR video vehicle Bileschi 2009`

- `site:docs.autoware.org calibrating sensors TIER IV CalibrationTools lidar camera lidar IMU intrinsic camera`

- `site:arxiv.org/abs/2205.14087 OpenCalib multi-sensor calibration toolbox autonomous driving`

- `site:openaccess.thecvf.com WACV 2025 generic vehicle-to-sensor calibration framework E3DC`

**Pages/papers opened:**

- https://dspace.mit.edu/entities/publication/a271becb-90a3-4144-858b-e9293fd332b0

- https://docs.autoware.org/main/tutorials/integrating-autoware/creating-vehicle-and-sensor-model/calibrating-sensors/

- https://arxiv.org/abs/2205.14087

- https://openaccess.thecvf.com/content/WACV2025/html/Hu_A_Generic_Vehicle-to-Sensor_Calibration_Framework_WACV_2025_paper.html


**Findings:** MIT abstract documents one historical targetless LiDAR?video method and its estimated camera parameters; current Autoware documentation lists selectable calibration workflows for camera intrinsics, LiDAR?LiDAR, LiDAR?camera, LiDAR?IMU and base?LiDAR; OpenCalib author abstract describes open-source manual/automatic/factory/online calibration tools and a benchmark. The WACV E3DC primary page returned 403 and was not used as cell evidence.
**Limits:** MIT and OpenCalib full papers/code were not inspected; Autoware documentation demonstrates one maintained ecosystem only, not universal practice. WACV direct page failed (403); the surfaced search-result abstract is discovery-only here. No license, current tool maintenance, regional availability or full comparative performance was established.
**Disposition effect:** Adds evidence-supported sensing methods/algorithm cells and tool-specific current cell evidence; no canonical index, graph, taxonomy or role fit changed.

### `D166-A-QPACK-CLOSE-002` - Perception: counter-search traditional/current designs and algorithms, official stack interfaces and maintained datasets; emerging foundation-model claims bounded to inspectable author abstracts.

**Date:** 2026-10-24
**Target families/sites:** Autoware Foundation official design/reference documentation, Waymo Open Dataset primary data specifications, arXiv author survey record / accepted venue metadata, official standards/curriculum search results (no future perception-specific credential/standard confirmed in this pass)

**Actual searches:**

- `site:docs.autoware.org perception component design inputs outputs object recognition obstacle segmentation occupancy tracking prediction supported functions`

- `site:docs.autoware.org perception reference implementation CenterPoint TransFusion-L BEVFusion clustering tracking merger`

- `Waymo Open Dataset perception labels 3D boxes tracking IDs semantic segmentation data official`

- `autonomous driving perception foundation models survey generalized knowledge spatial understanding temporal reasoning arxiv 2025`

- `autonomous driving perception future deployment standard credential learning resource future benchmark 2025 2026`

**Pages/papers opened:**

- https://docs.autoware.org/pr-803/design/autoware-architecture-v1/components/perception/

- https://docs.autoware.org/main/design/autoware-architecture-v1/components/perception/reference_implementation/

- https://waymo.com/intl/fil/open/data/perception/

- https://arxiv.org/abs/2509.08302

- https://www.nuscenes.org/tracking/


**Findings:** Autoware official design specifies sensing/localization/map inputs, semantic/object/obstacle/occupancy/traffic-signal outputs and supported detector/tracker/prediction functions; its reference design names CenterPoint, TransFusion-L, BEVFusion-L, clustering, optional camera-LiDAR fusion and limitations when sensor data drops. Waymo?s official data page specifies multimodal annotations, tracking IDs, segmentation and coordinate/calibration conventions. The 2025 foundation-model survey abstract gives an emerging capability taxonomy and deployment caveats. nuScenes tracking direct page rendered only a JavaScript shell in this browser tool.
**Limits:** Autoware design page is architecture-specific and one listed page is a PR branch; current reference page was also opened. Waymo benchmark access terms and dataset download were not checked. Foundation-model evidence is abstract-only. No future standard/credential was confirmed; the search did not establish that none exists globally.
**Disposition effect:** Supports specific current design, algorithm, data and emerging foundation-capability cells; no canonical taxonomy/index/graph or role-fit data changed.

### `D166-A-QPACK-CLOSE-003` - Perception counter-search for inspectable historical methods, formal training, and current/future safety standards.

**Date:** 2026-10-24
**Target families/sites:** University of Warwick repository full-text peer-reviewed survey, ETH Zurich official course catalogue, ISO official standard/work-item records

**Actual searches:**

- `A Survey on 3D Object Detection Methods for Autonomous Driving Applications Arnold 2019 Warwick full text`

- `ETH Zurich course computer vision artificial intelligence autonomous cars visual perception curriculum prerequisites 2025`

- `site:iso.org ISO/AWI 8800-1 AI safety road vehicles status perception`

**Pages/papers opened:**

- https://wrap.warwick.ac.uk/id/eprint/114314/1/WRAP-survey-3D-object-detection-methods-autonomous-driving-applications-Arnold-2019.pdf

- https://www.vorlesungen.ethz.ch/Vorlesungsverzeichnis/lerneinheit.view?ansicht=KATALOGDATEN&lang=en&lerneinheitId=194653&semkez=2025W

- https://www.iso.org/standard/94070.html

- https://www.iso.org/standard/77490.html

- https://www.iso.org/standard/78951.html


**Findings:** Full 2019 accepted manuscript supports established sensor/detection concepts, feature-based/traditional pipeline, 2D vs 3D outputs, modality tradeoffs and dataset limits. ETH Zurich course catalogue verifies formal current learning objectives and projects. ISO records show ISO 21448:2022 and ISO 34502:2022 are published, while ISO/AWI 8800-1 is only an approved work item at stage 20.00.
**Limits:** Survey is secondary and from 2019; direct methods evidence here describes reviewed literature. ETH is one institution outside Nigeria. ISO work item is not a published requirement; full standard texts remain paid and were not reviewed.
**Disposition effect:** Adds evidence for established foundations/methods/output, formal learning-resource, and future-horizon safety-standard cells. No canonical graph, roles or routes changed.

### `D166-A-QPACK-CLOSE-004` - Perception future-horizon counter-search: separate emerging research and sensor-roadmap forecasts from future validated methods, tools, outputs, curriculum and standards.

**Date:** 2026-10-24
**Target families/sites:** ISO official standard/work-item pages, Autoware Foundation maintained architecture docs, Waymo official dataset page, AESIN/TechWorks industry report, World Economic Forum/BCG forecast, arXiv author survey / peer-reviewed horizon reviews

**Actual searches:**

- `autonomous vehicle perception 2035 speculative future technology beyond foundation models 2030 research roadmap`

- `future autonomous driving perception quantum sensing neuromorphic event camera 2030 roadmap`

- `site:iso.org future perception standard autonomous driving AI perception development work item 2026`

- `autonomous driving perception future benchmark software 2030 emerging tools roadmaps`

**Pages/papers opened:**

- https://www.iso.org/standard/94070.html

- https://www.iso.org/standard/83303.html

- https://committee.iso.org/cms/live/live/en/sites/isoorg/contents/data/standard/09/35/93508.html?browse=tc

- https://techworks.org.uk/roadmaps-and-standards-landscape-of-perception-sensors-and-simulation/

- https://www.weforum.org/publications/autonomous-vehicles-timeline-and-roadmap-ahead

- https://arxiv.org/abs/2509.08302

- https://docs.autoware.org/main/design/autoware-architecture-v1/components/perception/reference_implementation/

- https://waymo.com/intl/fil/open/data/perception/


**Findings:** Searches surfaced early-stage ISO AI-safety work, published standards, emerging/foundation-model research, event-based camera/solid-state LiDAR/4D-radar roadmap topics and forecasts. They did not yield a verified future perception algorithm, selectable future software/data product, future curriculum/credential or future perception-output contract. The exact, source-backed ISO AI safety work item was mapped to the future standards cell.
**Limits:** Industry and WEF roadmaps are forecasts, not validated technical methods or product roadmaps. Foundation-model evidence is research direction, not proof of future capability. Search was bounded to the named source families and English-language web records; it cannot establish universal non-existence.
**Disposition effect:** Closes only bounded future-horizon rows for which no supported item was found; maps the exact ISO work item separately.

### `D166-A-QPACK-CLOSE-005` - Sensing: historical/current tools, method and role-specific Nigerian vocational calibration curriculum, SON metrology scope, and future horizon counter-search.

**Date:** 2026-10-24
**Target families/sites:** CMU official software project, Fraunhofer IOSB official maintained software documentation, NBTE Digital National Skills Qualification curriculum, Standards Organisation of Nigeria/National Metrology Institute, ROS REP conventions, current and future peer-reviewed sensor calibration sources, official automotive standards searches

**Actual searches:**

- `autonomous driving sensor calibration future 2035 roadmap self calibration solid state lidar event camera official`

- `automotive sensor self calibration future methods online drift tracking future roadmap 2030`

- `site:docs.ros.org REP 103 coordinate conventions REP 145 IMU conventions`

- `historical camera lidar calibration toolbox software CMU LCCT sensor calibration`

- `Nigeria autonomous vehicle sensor calibration course lidar radar camera curriculum Nigeria university 2025`

- `Nigeria automotive sensor calibration standards autonomous vehicles NITDA SON vehicle sensors`

- `automotive sensor calibration future industry roadmap self calibration safety certification official`

**Pages/papers opened:**

- https://www.cs.cmu.edu/~ranjith/lcct.html

- https://fraunhoferiosb.github.io/multisensor_calibration/

- https://www.digitalnbte.nbte.gov.ng/Public/DownloadCurriculum/U69847727e09fec4c32737ad7ab3d2f16.pdf

- https://son.gov.ng/metrology-instrumentation/

- https://son.gov.ng/calibration/

- https://nitt.gov.ng/short-term-training-programmes/

- https://docs.ros.org/en/reps/rep-0103.html

- https://docs.ros.org/en/independent/api/rep/html/rep-0103.html

- https://www.iso.org/standard/87976.html

- https://www.cvlibs.net/datasets/kitti/eval_object.php

- https://www.nist.gov/publications/methods-evaluate-3d-lidars-used-automated-driving

- https://www.sciencedirect.com/science/article/pii/S0263224126022013


**Findings:** Directly verified an established 2006 CMU camera?laser toolbox and a maintained Fraunhofer ROS 2 assisted target-based toolbox. Full NBTE 2024 NSQ Level 3 curriculum provides Nigeria-specific ADAS radar/camera/LiDAR target/dynamic calibration, OEM software, and post-check criteria. SON NMI lists mass/length/temperature/pressure calibration and traceability, but not automotive AV sensor services. The 2026 sensor-calibration review search result describes ongoing online/self-calibration challenges; direct full article was not opened. Future sources returned roadmaps and prospective needs, not a verifiable future calibration competency, tool, algorithm or output interface.
**Limits:** Fraunhofer evidence comes from off-road robotics, and the NBTE qualification is technician ADAS work, not AV sensor engineering. SON service page is not a complete provider directory. 2026 survey is publisher preview/abstract-level; no full methods comparison. Future no-hit scope is bounded to searched English-language pages and named official/project sources.
**Disposition effect:** Supports historical/current tools, an established method, Nigerian learning and calibration-traceability context; no graph, roles, routes, SQL or canonical index changed.

### `D166-A-QPACK-CLOSE-006` - HD mapping: verify established and current map-production methods, maintained tooling/data, standards, regional road data and future-horizon claims.

**Date:** 2026-10-24
**Target families/sites:** Autoware Foundation official map loader and map-creation docs, ASAM official standard pages, peer-reviewed ISPRS map-production article, official/maintained Lanelet2 validator repository, Argoverse dataset/API, official Nigerian transport/geodata and Africa road-data sources, future map research and roadmap sources

**Actual searches:**

- `HD map production mapping workflow surveying point cloud manual annotation autonomous driving Tsushima 2020 open access`

- `site:argoverse.org HD map API lane segment map data dataset map change detection`

- `site:github.com Autoware Lanelet2 map validation tool map creation official Autoware mapping`

- `Nigeria Africa autonomous driving high definition map road dataset OpenStreetMap roads open data HD map`

- `autonomous driving HD map future methods tools standards credentials 2030 roadmap mapless localization`

- `site:docs.autoware.org/main/tutorials/integrating-autoware/creating-maps Vector Map Builder MapToolbox JOSM bag2lanelet limitations`

**Pages/papers opened:**

- https://autowarefoundation.github.io/autoware_core/latest/map/autoware_map_loader/

- https://github.com/autowarefoundation/autoware-documentation/blob/main/docs/tutorials/integrating-autoware/overview.md

- https://github.com/tier4/autoware_lanelet2_map_validator

- https://www.asam.net/standards/detail/opendrive/

- https://isprs-archives.copernicus.org/articles/XLIII-B4-2020/415/2020/index.html

- https://essd.copernicus.org/articles/18/267/2026/index.html

- https://roads.anambrastate.gov.ng/open-data

- https://docs.autoware.org/main/tutorials/integrating-autoware/creating-maps/


**Findings:** Directly inspected the 2020 production workflow (mobile mapping survey, 3D plotting, feature attributes/topology, conversion, QA), current Autoware mapping/load interfaces, Lanelet2 validation tool, and ASAM OpenDRIVE 1.9.0. The Africa road-surface dataset and Anambra public works register are useful regional road context but are not onboard AV HD lane maps, and their access/licence scopes do not establish a local AV map product. Search results surfaced research forecasts and map-generation papers, but no validated future map method/tool/standard/credential/output contract. Directly opened the current Autoware Foundation map-creation documentation at lines 673-708. It states both point-cloud and vector-map layers are required by Autoware; identifies Vector Map Builder (free web tool) as recommended for authoring lanes/regulatory elements over a point cloud, MapToolbox and JOSM as open-source options, and limits bag2lanelet to single-lane maps. It also lists three compatible map providers and notes TomTom AutoStream conversion limitations. These specifics support a tool/data-interface cell claim; no provider coverage or adoption is inferred.
**Limits:** The Imperial 2026 paper is abstract-only for methods/deployment; research papers do not establish production map services. The Africa road-surface dataset is regional road-surface context, not lane-level HD data. Anambra Road Tracker covers public works projects, not AV maps. The English-language official/research search cannot prove no private or non-English regional provider exists. Autoware-specific tutorial, not independent comparative quality or safety testing; provider listing does not establish availability or coverage in Nigeria.
**Disposition effect:** Adds direct support for historical/current production workflow, mapping techniques and QA; closes weak/future/regional cells as bounded no-hit where a well-typed AV map claim was not supported. No canonical index, graph, role fit or route changed. Strengthens the current HD-map tools cell with directly inspected tool names, input/output, single-lane and compatibility limits.

### `D166-A-QPACK-CLOSE-007` - Localization: confirm estimator inputs/outputs and benchmark/data terms, formal learning outcomes, regional dataset boundaries, standards scope and future-horizon claims.

**Date:** 2026-10-24
**Target families/sites:** Autoware Foundation current maintained implementation docs, KITTI benchmark owner, Boreas dataset registry/owner, IO-VNBD paper and dataset record, ISO official catalogue, official university course catalogues, peer-reviewed open localization survey and official roadmaps, Nigeria/regional dataset and regulator searches

**Actual searches:**

- `site:autowarefoundation.github.io/autoware_core localization EKF pose twist covariance diagnostics time delay Mahalanobis`

- `official KITTI odometry benchmark dataset ground truth trajectories evaluation terms license`

- `Boreas autonomous driving dataset official localization benchmark license all weather`

- `Nigeria vehicle positioning localization dataset GNSS denied IO-VNBD smartphone CAN country coverage terms`

- `autonomous vehicle localization future 2035 roadmap cooperative localization standards future algorithm official 2025 2026`

- `site:iso.org vehicle localization autonomous driving GNSS positioning standard committee 2026 work item`

- `official university course autonomous vehicle localization state estimation curriculum 2025`

- `site:publications.ri.cmu.edu navigation Kalman filter autonomous vehicles 1994 state space`

- `Robot localization comprehensive survey classical methods intelligent autonomy Kalman EKF UKF semantic learning augmented estimators 2026`

**Pages/papers opened:**

- https://autowarefoundation.github.io/autoware_core/pr-482/localization/autoware_ekf_localizer/

- https://autowarefoundation.github.io/autoware_core/pr-689/localization/autoware_ekf_localizer/

- https://www.cvlibs.net/datasets/kitti/eval_odometry.php

- https://www.cvlibs.net/datasets/kitti/raw_data.php

- https://registry.opendata.aws/boreas/

- https://link.springer.com/article/10.1007/s41315-026-00528-9

- https://www.coursera.org/learn/state-estimation-localization-self-driving-cars

- https://opas.peppi.utu.fi/en/course/DTEK2102/106565?period=2024-2027

- https://www.weforum.org/publications/autonomous-vehicles-timeline-and-roadmap-ahead

- https://publications.ri.cmu.edu/a-3d-space-formulation-of-a-navigation-kalman-filter-for-autonomous-vehicles


**Findings:** Autoware docs directly specify pose/twist inputs, covariance, time-delay handling, yaw-bias correction, Mahalanobis gating and pose/twist/odometry/covariance/diagnostics outputs. KITTI provides 22 odometry sequences, training ground truth, evaluation-only sequences and translation/rotation metrics; Boreas provides multimodal year-round weather data under CC BY 4.0. Open 2026 localization survey and course catalogues identify current/emerging learning-augmented and semantic approaches plus course outcomes. No inspectable future road-vehicle localization standard, future selectable tool/data product, credential or output contract was confirmed. Nigeria-related IO-VNBD evidence remains smartphone positioning, not Nigerian vehicle CAN/AV deployment. Opened the CMU Robotics Institute 1994 technical-report record. Its abstract describes a 3D asynchronous state-space navigation Kalman filter for autonomous-vehicle position estimation, including sensor integration, dead reckoning, INS/GPS, landmarks and map matching. The linked full PDF timed out, so the claim is limited to the abstract. Directly inspected the full open-access 2026 Springer survey, including ?2.2 lines 139-152: KF linear-Gaussian assumptions, EKF linearization, uncertainty outputs, limitations and sample-based/graph alternatives. ??1.1-1.2 and lines 118-125 define learning-augmented estimators (learned measurements/priors/pose regressors) and semantic/cognitive directions, with composition alongside classical back-ends. This supports an established KF/EKF techniques claim and a separate emerging learned-estimator claim; it does not support future deployment claims.
**Limits:** Autoware pages document one stack and include PR-version pages; they do not establish universal contracts. KITTI is academic-use only and European data; Boreas has Canadian geography and CC BY 4.0. IO-VNBD country/sensor caveat remains. WEF roadmap is adoption forecast, not technical validation. Future and legal searches are bounded; they cannot prove universal absence. CMU report body was not available after a PDF fetch timeout; no equations, performance or full-text comparisons are claimed. The survey is secondary evidence; reported comparisons are heterogeneous, no unified performance ranking is warranted, and its research directions do not establish deployed vehicle products.
**Disposition effect:** Adds concrete established/current dataset, estimator, learning-resource and output evidence; future and Nigeria-specific road-vehicle claims remain bounded no-hit. Canonical role fit/routes and graph unchanged. Adds abstract-limited 1994 primary vehicle-navigation design evidence to the established methods cell. Replaces an overbroad survey-only technique description with precise established KF/EKF assumptions/limits and specific emerging learned estimator types; the 2021 LVI-SAM source is no longer used as established evidence.

## Source additions and existing-source rechecks

### `D166-A1-NIST-PERCEPTION-SENSITIVITY-2026` - On the Assessment of Sensitivity of Autonomous Vehicle Perception

**Publisher/author:** Apostol Vassilev, Munawar Hasan, Edward Griffor, Honglan Jin, Pavel Piliptchak, Mahima Arora and Thoshitha Gamage; National Institute of Standards and Technology (NIST)

**URL:** https://csrc.nist.gov/pubs/other/2026/01/30/on-the-assessment-of-sensitivity-of-autonomous-veh/final

**Source family/type:** Public-agency-authored technical research / arXiv preprint record

**Version/status:** NIST CSRC record “Other 2602.00314v1”; published 2026-01-30; linked to arXiv:2602.00314v1.

**Access date:** 2026-10-24

**Access inspected:** Official NIST page and complete abstract opened; the linked paper itself was not downloaded or inspected.

**Locator:** NIST page, record metadata and abstract, especially abstract lines describing ensemble uncertainty evaluation across simulated and real adverse conditions, fog/low sun/occlusions and object-distance effects.

**Supported claim:** The abstract proposes and evaluates a perception-sensitivity assessment using ensemble uncertainty across simulated and real driving scenarios; it reports that poor lighting, occlusion, weather combinations and distance can increase uncertainty or reduce model performance.

**Claim limit:** Abstract-only evidence; detailed methods, sample sizes, model configuration, statistical strength and generalization cannot be checked from the abstract. It does not establish a production-ready method, sensor requirement, safety guarantee or performance threshold.

**Credibility:** NIST is an attributable public research institution and the page exposes the publication record and abstract. The narrow claim is credible as a summary of the named paper; abstract-only access limits assessment of methods and evidential strength.

### `D166-A1-SAE-RAINSENSE-2025` - RainSense: An Autonomous Driving Environmental Perception Dataset with Rain Intensity Annotations

**Publisher/author:** Tian Xia, Xingbo Yang, Tianrui Chen, Longgao Zhang, Shaolingfen Ye and Junyi Chen; SAE International / Tongji University School of Automotive Studies

**URL:** https://saemobilus.sae.org/papers/rainsense-autonomous-driving-environmental-perception-dataset-rain-intensity-annotations-2025-01-7311

**Source family/type:** SAE technical paper / dataset paper; publisher abstract

**Version/status:** SAE 2025 Intelligent and Connected Vehicles Symposium technical paper 2025-01-7311; publication date 2025-12-31; publisher page marks paper access locked.

**Access date:** 2026-10-24

**Access inspected:** Publisher record and complete abstract opened; full technical paper not accessible in this pass.

**Locator:** SAE Mobilus record abstract: natural rainfall collection setup, 728 cases, sensor modalities, labels and abstract-reported modality performance.

**Supported claim:** The abstract describes a synchronized camera, LiDAR and 4D-radar dataset with rainfall-intensity labels across nine campus-intersection scenarios and 728 cases; it reports modality-specific degradation under heavy/torrential rain and more stable radar signals in this experiment.

**Claim limit:** One campus, a single dummy target, limited scenario diversity and abstract-only performance evidence. The radar comparison must not be generalized to all sensors, weather, deployments or ODDs. It does not establish operational safety or a general sensor ranking.

**Credibility:** SAE is the accountable publisher of a named technical paper with identifiable authors and event details. The publisher abstract is suitable for describing the dataset and reported result, but paywall access prevents detailed method appraisal.

### `D166-A1-RAINSENSE-ZENODO-2025` - IVtest-Lab/RainSense: RainSense Dataset v1.0.0

**Publisher/author:** IVtest-Lab; creator Peiyi Wang, Tongji University; Zenodo record

**URL:** https://zenodo.org/records/17231190

**Source family/type:** Versioned research dataset deposit / repository metadata

**Version/status:** Zenodo version 1.0.0, published 2025-09-30; record lists a 493.0 MB archive and links the versioned GitHub release.

**Access date:** 2026-10-24

**Access inspected:** Zenodo metadata and record opened; download was not performed. The visible License field is blank.

**Locator:** Zenodo record v1.0.0, Description, Files and External resources: camera/LiDAR/radar, rainfall-intensity labels, example cases, archive and linked GitHub v1.0.0.

**Supported claim:** A versioned public record describes a RainSense package containing camera, LiDAR and radar data and rainfall-intensity annotation files, with a 493 MB archive and linked v1.0.0 repository.

**Claim limit:** The Zenodo Rights/License field is not populated in the opened record; download/access conditions and redistribution rights require checking the linked repository and files before use. Repository metadata does not prove annotation quality or benchmark representativeness.

**Credibility:** Zenodo provides a versioned, citable repository record and file metadata. It is credible for the existence and stated contents of that deposit, not for scientific performance or unlisted legal terms.

### `D166-A1-IOVNBD-2021` - IO-VNBD: Inertial and Odometry benchmark dataset for ground vehicle positioning

**Publisher/author:** Uche Onyekpe, Vasile Palade, Stratis Kanarachos and Alicja Szkolnik; Data in Brief / Coventry University Repository

**URL:** https://pure.coventry.ac.uk/ws/portalfiles/portal/40741559/Binder8.pdf

**Source family/type:** Peer-reviewed open-access data paper / vehicle-positioning dataset

**Version/status:** Data in Brief 35 (2021), article 106885; DOI 10.1016/j.dib.2021.106885; published version deposited in Coventry University Repository; article states CC BY.

**Access date:** 2026-10-24

**Access inspected:** Full 19-page published PDF opened. Dataset repository link is identified in the paper; dataset download and its separate data license were not checked.

**Locator:** Abstract/specification (PDF pp. 1-3); data accessibility and sensor/location details (PDF pp. 2-3); vehicle-vs-smartphone coverage caveat (PDF p. 3); scenarios and sensor fields (PDF pp. 5-7).

**Supported claim:** The paper documents an inertial/odometry vehicle-positioning dataset and road/motion contexts, GPS outages and sensor signals. It reports that vehicle CAN/ECU records were collected in England, while smartphone sensor/GPS records include England, France and Nigeria; signals include smartphone IMU/GPS and vehicle wheel-speed/steering/state quantities.

**Claim limit:** Nigeria-specific evidence is smartphone IMU/GPS data, not the vehicle CAN/ECU subset; the paper does not describe Nigeria-specific LiDAR/camera/radar, HD maps, ADS deployment or AV test operations. Dataset coverage is an older, bounded research collection and cannot generalize to current Nigerian road distribution or production AV performance. Separate data-file license terms were not verified.

**Credibility:** Peer-reviewed Data in Brief data article with full text in the university repository, explicit acquisition details and a cited data repository. Its bounded regional and sensor-subset claims are credible; temporal, platform and geography limits constrain transfer.

### `D166-A1-IMPERIAL-ROADWORKS-HD-MAP-2026` - Real-time roadworks detection and high definition (HD) map updates for autonomous vehicles

**Publisher/author:** Shaofan Sheng, Nicolette Formosa, Yuxiang Feng and Mohammed Quddus; Engineering Applications of Artificial Intelligence / Imperial College London repository

**URL:** https://spiral.imperial.ac.uk/entities/publication/8a761c15-e955-4cbf-9e1d-87c4439fb02d

**Source family/type:** Peer-reviewed journal article / institutional repository record

**Version/status:** Engineering Applications of Artificial Intelligence 171 (2026), article 114321; DOI 10.1016/j.engappai.2026.114321; published online 2026-02-26; repository record says published version and CC BY.

**Access date:** 2026-10-24

**Access inspected:** Institutional repository metadata and full abstract opened; linked published PDF was not downloaded or inspected.

**Locator:** Imperial Spiral record abstract and publication/licence metadata; abstract describes monocular-camera roadworks-sign recognition and incremental OpenDRIVE updates, with reported UK motorway trials.

**Supported claim:** The abstract reports a research pipeline using monocular images and a CLIP-based vision-language model to identify roadworks signs and make incremental OpenDRIVE map updates; it reports UK motorway trials and benchmark results on the paper’s test data.

**Claim limit:** Full methods and experimental details were not reviewed. Results are one published system and UK motorway evaluation; they do not prove production deployment, global transfer or replacement of survey/map-QA processes.

**Credibility:** Peer-reviewed journal publication with publisher DOI, published-version repository record, named authors and open-access licence. The repository abstract is inspectable, while performance and deployment claims remain limited to its stated trial scope.

### `D166-A1-CALIBREFINE-ARXIV-2025` - CalibRefine: Deep Learning-Based Online Automatic Targetless LiDAR-Camera Calibration with Iterative and Attention-Driven Post-Refinement

**Publisher/author:** Lei Cheng, Lihao Guo, Tianya Zhang, Tam Bang, Austin Harris, Mustafa Hajij, Mina Sartipi and Siyang Cao; arXiv

**URL:** https://arxiv.org/abs/2502.17648

**Source family/type:** Research preprint / primary method paper

**Version/status:** arXiv:2502.17648, submitted 2025-02-24; preprint status, no peer-review publication verified in this pass.

**Access date:** 2026-10-24

**Access inspected:** Full arXiv abstract page opened; linked PDF was not downloaded or inspected.

**Locator:** arXiv abstract lines 3-7: four-stage feature matching, homography initialization, iterative update and attention-based refinement; abstract reports experiments on two urban traffic datasets.

**Supported claim:** The preprint proposes a fully automatic, targetless, online LiDAR-camera calibration pipeline that uses object-level correspondences, coarse homography calibration and iterative/attention-driven refinement as new frames arrive; its abstract reports experiments on two urban traffic datasets.

**Claim limit:** Abstract-only and preprint evidence. Dataset names, protocol, baselines, metrics, ablations, failure modes and reproducibility were not verified from the paper; abstract-reported superiority is not independently assessed and does not establish production maturity or a universal calibration method.

**Credibility:** Named authors and a stable arXiv record make this an attributable primary research preprint. It is not treated as peer-reviewed or independently validated; only its abstract was inspected.

### `D166-A1-CATERPILLAR-PERCEPTION-ROLE-2026` - Autonomy Engineering Specialist - Perception

**Publisher/author:** Caterpillar Inc.; Caterpillar Careers

**URL:** https://careers.caterpillar.com/en/jobs/r0000397079/autonomy-engineering-specialist-perception/

**Source family/type:** Employer-hosted job description

**Version/status:** Official career page lists posting date 2026-10-19, application deadline 2026-10-25 and requisition R0000397079; live vacancy status can change.

**Access date:** 2026-10-24

**Access inspected:** Employer career page opened and role responsibilities/requirements inspected.

**Locator:** Responsibilities and qualifications, lines 56-94: design/implement/test sensor fusion, detection, tracking and classification; work with camera, LiDAR, 4D radar, IMU/GNSS and machine-state data; develop and validate perception software.

**Supported claim:** This single off-road autonomy perception posting assigns software design, implementation, testing, sensor fusion, object detection/tracking/classification, data analysis and verification/validation tasks, with camera, LiDAR, 4D radar, IMU and GNSS inputs.

**Claim limit:** One specialist job in mobile off-road machinery; it is not a canonical D166 role profile, does not prove software-developer role fit, and cannot establish universal method, sensor or credential requirements.

**Credibility:** Primary employer-hosted requisition with dated, attributable task text and location. It is credible evidence of this employer?s stated work only; off-road scope, seniority and vacancy period limit generalization.

### `D166-A1-BILESCHI-LIDAR-VIDEO-2009` - Fully automatic calibration of LIDAR and video streams from a vehicle

**Publisher/author:** Stanley M. Bileschi; ICCV Workshops 2009, deposited at MIT DSpace

**URL:** https://dspace.mit.edu/entities/publication/a271becb-90a3-4144-858b-e9293fd332b0

**Source family/type:** Peer-reviewed conference paper; author repository record

**Version/status:** ICCV Workshops 2009; MIT record lists final published version and DOI 10.1109/ICCVW.2009.5457439.

**Access date:** 2026-10-24

**Access inspected:** MIT repository metadata and abstract opened; repository lists a 2.88 MB PDF, but the PDF full text was not inspected.

**Locator:** MIT DSpace record, Abstract; especially statements on no calibration objects, parameter estimates and multi-stage bootstrap, lines 52?55.

**Supported claim:** The abstract reports an automatic targetless geometric calibration between vehicle LiDAR and video, estimating pinhole-camera parameters and radial distortion with a multi-stage bootstrap; evaluated using DARPA Urban Challenge data.

**Claim limit:** Abstract-only evidence. Details of objective, assumptions, calibration observability, quantitative results, comparison baselines and reproducibility were not inspected. This is one historical camera?LiDAR method, not a universal method or maintained tool.

**Credibility:** MIT repository identifies the final published ICCV Workshops paper and DOI and exposes its abstract. Bibliographic provenance is strong; method appraisal remains limited because the full paper was not inspected.

### `D166-A1-OPENCALIB-ARXIV-2022` - OpenCalib: A Multi-sensor Calibration Toolbox for Autonomous Driving

**Publisher/author:** Guohang Yan et al.; arXiv cs.RO/cs.CV

**URL:** https://arxiv.org/abs/2205.14087

**Source family/type:** Research paper / original software description; open-access preprint record

**Version/status:** Submitted 2022-05-27; revised v2 2022-05-30; paper describes a GitHub code release.

**Access date:** 2026-10-24

**Access inspected:** arXiv abstract and metadata opened; the linked code repository and paper full text were not inspected.

**Locator:** arXiv abstract, lines 16?18: intrinsic/extrinsic distinction; manual, automatic, factory and online tools; benchmark dataset and open-source code claim.

**Supported claim:** The paper abstract describes OpenCalib as an open-source autonomous-driving calibration toolbox covering manual, automatic, factory and online calibration tools and an associated benchmark dataset.

**Claim limit:** Abstract-only software claim. Current repository state, installation, license, maintenance, modality-by-modality support, methods, benchmark scope and performance were not checked. Do not call it a currently maintained tool or infer every sensor modality from the title.

**Credibility:** The attributable author preprint record provides versioned metadata and an abstract with a GitHub code link. It is primary author evidence of the described software, but not independent verification of current usability or maintenance.

### `D166-A1-FOUNDATION-PERCEPTION-SURVEY-2025` - Foundation Models for Autonomous Driving Perception: A Survey Through Core Capabilities

**Publisher/author:** Rajendramayavan Sathyam and Yueqi Li; IEEE Open Journal of Vehicular Technology acceptance recorded on arXiv

**URL:** https://arxiv.org/abs/2509.08302

**Source family/type:** Open author preprint / survey (accepted venue stated on arXiv record)

**Version/status:** arXiv v1 submitted 2025-09-10; arXiv page says accepted at IEEE Open Journal of Vehicular Technology and links DOI 10.1109/OJVT.2025.3604823.

**Access date:** 2026-10-24

**Access inspected:** arXiv metadata and abstract opened; full paper not inspected.

**Locator:** arXiv abstract lines 16?20: four capabilities (generalized knowledge, spatial understanding, multi-sensor robustness, temporal reasoning) and open deployment challenges.

**Supported claim:** The authors frame foundation models for autonomous-driving perception around generalized knowledge, spatial understanding, multi-sensor robustness and temporal reasoning, while identifying real-time scalability, reliability, hallucination and out-of-distribution concerns.

**Claim limit:** Survey abstract only; no individual model, performance comparison, software artifact, safety assurance or maturity/deployment level established.

**Credibility:** Attributable author preprint with an accepted-venue statement and DOI; abstract is directly inspectable. Detailed survey evidence and claim-by-claim source trail were not reviewed.

### `D166-A1-ARNOLD-3D-DETECTION-SURVEY-2019` - A Survey on 3D Object Detection Methods for Autonomous Driving Applications

**Publisher/author:** Eduardo Arnold, Omar Y. Al-Jarrah, Mehrdad Dianati, Saber Fallah, David Oxtoby and Alex Mouzakitis; IEEE Transactions on Intelligent Transportation Systems; accepted version deposited by University of Warwick

**URL:** https://wrap.warwick.ac.uk/id/eprint/114314/1/WRAP-survey-3D-object-detection-methods-autonomous-driving-applications-Arnold-2019.pdf

**Source family/type:** Peer-reviewed journal survey, author-accepted manuscript in institutional repository

**Version/status:** IEEE T-ITS 20(10), 2019, pp. 3782?3795, DOI 10.1109/TITS.2019.2892405; WRAP copy identifies accepted manuscript and reuse terms.

**Access date:** 2026-10-24

**Access inspected:** Full 15-page author-accepted manuscript opened and inspected.

**Locator:** Pages 1?4: perception definition, 2D/3D detection distinctions, traditional pipelines, sensor properties, target-based/targetless calibration and KITTI dataset details; full paper contains modality and method taxonomy.

**Supported claim:** The survey defines perception outputs and compares 2D/3D object detection, modalities, traditional pipelines, datasets and benchmark limitations; the full manuscript explicitly describes segmentation/features/classification stages, modality strengths/limits, and KITTI labels/conditions.

**Claim limit:** Survey is from 2019 and focuses on 3D object detection; claims describe reviewed literature and cited datasets, not a current universal architecture or current benchmark terms.

**Credibility:** Peer-reviewed IEEE survey in an institutional repository; complete accepted manuscript directly inspected. It provides a synthesis rather than a primary method evaluation.

### `D166-A1-ETH-AUTONOMOUS-CAR-VISION-COURSE-2025` - Computer Vision and Artificial Intelligence for Autonomous Cars (227-0560-00L)

**Publisher/author:** ETH Zurich official Course Catalogue; lecturer C. Sakaridis

**URL:** https://www.vorlesungen.ethz.ch/Vorlesungsverzeichnis/lerneinheit.view?ansicht=KATALOGDATEN&lang=en&lerneinheitId=194653&semkez=2025W

**Source family/type:** Official university course catalogue / learning resource

**Version/status:** Autumn Semester 2025; yearly recurring course; catalogue version dated 2026-09-24.

**Access date:** 2026-10-24

**Access inspected:** Official course catalogue fully opened; detailed learning objectives, topics, practical projects and prerequisites inspected.

**Locator:** Catalogue lines 14?20 and 28?65: learning outcomes, segmentation/detection/tracking/prediction/fusion topics, project methods, prerequisites and Python/PyTorch.

**Supported claim:** A current university-level learning resource explicitly teaches visual perception fundamentals, detection/segmentation, multimodal and temporal methods, evaluation/reproduction, and hands-on sensor calibration and LiDAR 3D detection projects with math, vision/ML and programming prerequisites.

**Claim limit:** One Zurich university course offering, not a universal credential or Nigerian curriculum requirement. The course covers visual perception plus localization/prediction; the mapping is limited to its perception content.

**Credibility:** Direct official ETH course catalogue with semester, yearly recurrence, learning objectives and topic list.

### `D166-A1-ISO-AWI-8800-1-2026` - ISO/AWI 8800-1 Road Vehicles ? AI Safety ? Part 1: Definitions and concepts

**Publisher/author:** International Organization for Standardization, ISO/TC 22/SC 32

**URL:** https://www.iso.org/standard/94070.html

**Source family/type:** Official standards body work-item record

**Version/status:** Approved work item registered 2026-10-07, stage 20.00; working group draft initiated; not a published standard.

**Access date:** 2026-10-24

**Access inspected:** Official ISO work-item record and abstract opened.

**Locator:** ISO official record, abstract and life-cycle stage: vehicle AI safety scope and terminology/concepts; stages dated 2026-10-07.

**Supported claim:** ISO has an approved work item to develop common definitions/concepts for safety-related AI systems in production road vehicles; abstract includes vehicle-level undesired behavior due to AI errors.

**Claim limit:** Not published guidance, does not specify perception algorithms or performance thresholds, and applies to production road-vehicle E/E systems. It must not be presented as a current compliance requirement.

**Credibility:** Official ISO record provides status, stage, scope and abstract; item is explicitly at work-item stage.

### `D166-A1-KITTI-PERCEPTION-OBJECT-BENCHMARK` - KITTI Vision Benchmark Suite ? Object Detection Evaluation 2012

**Publisher/author:** Andreas Geiger, Philip Lenz, Christoph Stiller and Raquel Urtasun; Karlsruhe Institute of Technology and Toyota Technological Institute at Chicago

**URL:** https://www.cvlibs.net/datasets/kitti/eval_object.php

**Source family/type:** Official project benchmark/data specification

**Version/status:** Object benchmark released 2012; currently operated benchmark page notes server restoration on 2026-09-07.

**Access date:** 2026-10-24

**Access inspected:** Official benchmark and project pages directly opened; dataset details, metrics, devkit links, license and limitations inspected.

**Locator:** Object Detection Evaluation 2012 sections: training/test counts, precision-recall/orientation metrics, devkit, data modalities and evaluation caveats; project homepage copyright/license and task list.

**Supported claim:** KITTI is a long-running real-world driving benchmark with 7,481 training and 7,518 test images, LiDAR/stereo options, calibration, labeled objects, an evaluation metric and MATLAB/C++ devkit; its page documents category/occlusion thresholds and benchmark policies.

**Claim limit:** Benchmark captures Karlsruhe/rural/highway routes with a particular sensor setup and annotation protocol; it does not establish broad global or Nigerian representativeness. Commercial use is restricted under the stated CC BY-NC-SA 3.0 license.

**Credibility:** Primary project pages identify KIT and TTIC, publish exact data/metric details and license, and link the benchmark paper.

### `D166-A1-ISO-PAS-8800-2024` - ISO/PAS 8800:2024 Road vehicles ? Safety and artificial intelligence

**Publisher/author:** International Organization for Standardization, ISO/TC 22/SC 32

**URL:** https://www.iso.org/standard/83303.html

**Source family/type:** Official published automotive AI safety specification record

**Version/status:** Published 2024-12-13, edition 1, Publicly Available Specification; current ISO record says published.

**Access date:** 2026-10-24

**Access inspected:** Official ISO abstract, scope, publication status and lifecycle opened; paid full text not inspected.

**Locator:** ISO abstract and General Information: production-road-vehicle AI safety scope, output insufficiency/systematic/random hardware errors, externally generated object detection example and explicit tool-guidance exclusion.

**Supported claim:** ISO/PAS 8800:2024 provides an automotive AI safety property/assurance framework for production-vehicle E/E systems; it identifies object-detection outputs as potentially safety-relevant but does not prescribe specific perception methods or tools.

**Claim limit:** Paid full standard not inspected; applies at vehicle-level AI safety, not specifically perception algorithms or a perception performance threshold. It is a PAS, not a credential.

**Credibility:** Official ISO publication record with status, scope, lifecycle and abstract; full text is priced at CHF 227.

### `D166-A1-CMU-LASER-CAMERA-TOOLBOX-2006` - The Laser-Camera Calibration Toolbox (LCCT)

**Publisher/author:** Ranjith (CMU Robotics Institute) / Carnegie Mellon University

**URL:** https://www.cs.cmu.edu/~ranjith/lcct.html

**Source family/type:** Official university research software documentation

**Version/status:** Version 1.1; latest update 2006-11-10; page lists source, documentation, sample/test data and tested MATLAB versions.

**Access date:** 2026-10-24

**Access inspected:** Full official project documentation opened, including software versions, coordinate assumptions, test environment and change history.

**Locator:** Project What and Why, Software latest version/date and FAQ coordinate convention/tested MATLAB platforms.

**Supported claim:** LCCT is a Matlab GUI toolbox for camera-to-laser external calibration; v1.1 was last updated in 2006, provides source/docs/sample/test data and assumes a stated LiDAR coordinate convention that must be adapted if different.

**Claim limit:** Historical, camera?laser only, Matlab/version-specific and not evidence of current maintenance, automotive certification, radar/IMU calibration or production use.

**Credibility:** Direct official CMU project page gives concrete versions, files and assumptions; the age and test platforms are explicit.

### `D166-A1-FRAUNHOFER-MULTISENSOR-CALIBRATION-2025` - Multi-Sensor Calibration Toolbox for Large-Scale Offroad Robotics

**Publisher/author:** Fraunhofer Institute for Optronics, System Technologies and Image Exploitation (IOSB), Autonomous Robotic Systems group

**URL:** https://fraunhoferiosb.github.io/multisensor_calibration/

**Source family/type:** Official maintained software documentation / ROS package

**Version/status:** Official documentation states current maintenance, ROS 2 apt package and cites 2025 German Robotics Conference paper; ROS 1 no longer receives official release.

**Access date:** 2026-10-24

**Access inspected:** Official documentation opened; supported calibration pairings, license, ROS release and maintenance statements inspected.

**Locator:** About, software license, Getting Started and Support sections, lines 4?41.

**Supported claim:** Fraunhofer?s maintained BSD-3-Clause toolbox supports assisted target-based camera?LiDAR, camera?reference, LiDAR?LiDAR, LiDAR?reference and prototype LiDAR?vehicle extrinsic calibration; ROS 2 installation is documented.

**Claim limit:** Developed for large-scale off-road robotics; the LiDAR?vehicle feature is prototype. It is not a universal automotive/OEM tool or evidence of on-road qualification.

**Credibility:** Institutional documentation identifies publisher, maintained status, supported pairings, license and ROS package information.

### `D166-A1-NBTE-NSQ-ADAS-CALIBRATION-2024` - NSQ Level 3: Digital Automotive Diagnosis

**Publisher/author:** National Board for Technical Education (NBTE), Nigeria; National Skills Qualification

**URL:** https://www.digitalnbte.nbte.gov.ng/Public/DownloadCurriculum/U69847727e09fec4c32737ad7ab3d2f16.pdf

**Source family/type:** Official Nigerian national vocational skills qualification curriculum

**Version/status:** National Skills Qualification, Level 3, year 2024; Digital Automotive Diagnosis; 60-page PDF.

**Access date:** 2026-10-24

**Access inspected:** Full 60-page official PDF opened; qualification purpose, outcomes, unit structure and ADAS calibration criteria inspected.

**Locator:** PDF pp. 1?4 qualification purpose/objectives/mandatory unit ICT/DAD/010/L3; pp. 46?48, learning objective 3 and criteria 3.1?3.4, plus 4.3.

**Supported claim:** The Nigerian NSQ Level 3 qualification includes an Advanced Driver Assistance Systems diagnostics unit; its criteria cover aligning radar/camera/LiDAR to calibration targets, OEM-specific calibration software, dynamic calibration under specified driving conditions, post-calibration accuracy/function checks and laser alignment/calibration boards.

**Claim limit:** National vocational ADAS diagnosis/repair curriculum for technician work. It does not establish autonomous-driving sensor-fusion engineering, university curriculum, vehicle approval requirements, current course availability or a canonical D166 role route.

**Credibility:** NBTE-hosted national qualification PDF with unit IDs, learning outcomes, performance criteria and page numbers; full PDF inspected.

### `D166-A1-SON-NMI-CALIBRATION-SCOPE-2026` - National Metrology Institute ? calibration capabilities and traceability

**Publisher/author:** Standards Organisation of Nigeria (SON), National Metrology Institute

**URL:** https://son.gov.ng/metrology-instrumentation/

**Source family/type:** Official Nigerian metrology institution scope/service page

**Version/status:** Current institutional page states NMI designation and present calibration service areas; no sensor-specific calibration scope listed.

**Access date:** 2026-10-24

**Access inspected:** Official SON page opened; NMI role, current calibration fields and stated functions inspected.

**Locator:** Institutional service page, overview/functions: current calibration services are mass, length, temperature and pressure; NMI is national primary measurement custodian and source of traceability.

**Supported claim:** SON?s National Metrology Institute identifies itself as Nigeria?s national primary measurement custodian and states current service calibration fields of mass, length, temperature and pressure; the page does not list automotive camera/LiDAR/radar calibration services.

**Claim limit:** The page?s stated scope is generic metrology services; omission of AV sensor calibration from this page cannot prove no private/local provider or capability exists. Do not equate industrial metrology calibration with AV sensor calibration.

**Credibility:** Official SON institutional page names NMI functions and presently listed fields; scope is as stated and not an exhaustive provider directory.

### `D166-AUTOWARE-LOCALIZATION-OUTPUT-CONTRACT` - Localization Component Interface / Design

**Publisher/author:** Autoware Foundation

**URL:** https://docs.autoware.org/main/design/autoware-architecture-v1/interfaces/components/localization/

**Source family/type:** Maintained official autonomous-driving stack documentation

**Version/status:** Current Autoware documentation page; retrieved 2026-10-24.

**Access date:** 2026-10-24

**Access inspected:** Official documentation page opened from Autoware documentation index; component interface and design sections inspected.

**Locator:** Inputs/Outputs, recommended architecture, TF tree, ideal functionality and KPI sections. Lists pose, velocity and acceleration with covariance and timestamps; diagnostics; map-to-base_link transform; pose estimator, twist/accel estimator, fusion filter and diagnostics.

**Supported claim:** Autoware's documented localization design estimates vehicle pose, velocity and acceleration, exposes timestamped covariance-bearing state outputs and diagnostics to planning/control/perception, and describes a recommended component architecture; the page notes map data is not required for some cases such as GNSS-only localization.

**Claim limit:** Stack-specific design documentation and evolving implementation; does not establish universal output contracts, map necessity or performance thresholds. The page identifies some KPI details as TBD.

**Credibility:** Official Autoware project documentation; primary for its own intended architecture and interface only.

### `D166-AUTOWARE-PERCEPTION-2026-10-22` - Perception Component Design

**Publisher/author:** Autoware Foundation

**URL:** https://docs.autoware.org/pr-803/design/autoware-architecture-v1/components/perception/

**Source family/type:** Official open-source stack design documentation (pull-request branch)

**Version/status:** PR-803 documentation branch; opened 2026-10-24; not treated as stable release documentation.

**Access date:** 2026-10-24

**Access inspected:** Official Autoware documentation page opened; overview, interfaces and supported functions inspected.

**Locator:** Overview, component inputs/outputs and Supported Functions tables. Lists camera/LiDAR/radar inputs; outputs dynamic objects, obstacle segmentation, occupancy grid and traffic-light state to planning; specific detector/tracker/prediction functions.

**Supported claim:** This Autoware design page specifies its perception component's multimodal inputs, semantic and obstacle outputs, and supported functions including detection, tracking, prediction and occupancy; it also states that complete/error-free capability is a non-goal.

**Claim limit:** PR branch and stack-specific design; claims are not universal system requirements or guarantees, and page notes WIP areas.

**Credibility:** Official project documentation; direct source for the documented Autoware design, with branch status disclosed.

### `D166-ISO-21448` - ISO 21448:2022 Road vehicles ? Safety of the intended functionality

**Publisher/author:** International Organization for Standardization (ISO)

**URL:** https://www.iso.org/standard/77490.html

**Source family/type:** Official published international standard catalogue and abstract

**Version/status:** Published Edition 1 (2022-06); catalogue status 90.92 indicates to be revised (as inspected 2026-10-24). Full standard is paid.

**Access date:** 2026-10-24

**Access inspected:** Official ISO page and abstract inspected; full normative text not accessed.

**Locator:** Official ISO catalogue abstract, applicability/exclusions and lifecycle status.

**Supported claim:** ISO 21448:2022 provides SOTIF framework and design, verification, validation and operational guidance for road-vehicle functions requiring situational awareness from complex sensors and processing algorithms; ISO lists it as published and to be revised.

**Claim limit:** Abstract-level scope only; full normative clauses not reviewed. It is not a perception algorithm, credential or proof of local legal adoption.

**Credibility:** Official ISO status and abstract; normative detail remains behind paid access.

### `D166-LANELET2-MAP-FRAMEWORK-PRIMARY` - Lanelet2 ? map handling library for automated driving

**Publisher/author:** FZI Research Center for Information Technology / Lanelet2 maintainers

**URL:** https://fzi-forschungszentrum-informatik.github.io/Lanelet2/

**Source family/type:** Maintained project documentation

**Version/status:** Project documentation; BSD 3-Clause license and ROS 1/ROS 2 support stated on page; accessed 2026-10-24.

**Access date:** 2026-10-24

**Access inspected:** Project documentation page opened; overview and feature summary inspected.

**Locator:** Overview/Features: 2D/3D map support, lane changes and routing, participant-specific routing, geographic projection, OSM IO and Python bindings.

**Supported claim:** Lanelet2 is a C++ library for high-definition map handling in automated driving, with map primitives, routing, projection and OSM IO features; the project states BSD-3-Clause licensing and ROS 1/ROS 2 support.

**Claim limit:** Project self-description; it supports map handling, not map collection accuracy, completeness, freshness, or an AV deployment claim.

**Credibility:** Maintainer documentation is primary for project features and license; adoption/performance is not independently established.

### `D166-A1-CMU-NAVIGATION-KALMAN-1994` - A 3D Space Formulation of a Navigation Kalman Filter for Autonomous Vehicles

**Publisher/author:** Alonzo Kelly / Carnegie Mellon University Robotics Institute

**URL:** https://publications.ri.cmu.edu/a-3d-space-formulation-of-a-navigation-kalman-filter-for-autonomous-vehicles

**Source family/type:** University technical report; primary research

**Version/status:** Technical Report CMU-RI-TR-94-19, May 1994; abstract opened 2026-10-24.

**Access date:** 2026-10-24

**Access inspected:** Direct repository page and abstract inspected; linked PDF fetch timed out, report body not inspected.

**Locator:** Repository abstract lines 27-31: 3D asynchronous state-space Kalman filter for autonomous-vehicle position estimation; sensor integration, dead reckoning, INS/GPS, landmarks and map matching.

**Supported claim:** A 1994 vehicle-navigation design formulated a general asynchronous state-space Kalman filter for autonomous-vehicle position estimation and sensor integration, with possible INS/GPS, dead-reckoning and map-matching uses.

**Claim limit:** Abstract-only. Supports historical method/design context but not detailed algorithm, derivation, performance, or implementation.

**Credibility:** Primary institutional repository and author technical-report record; direct abstract only.

### Existing source `D166-ISO-23150-20-SENSOR-INTERFACES-2026` - ISO 23150-20:2026 — Supportive and sensor input interfaces

**URL:** https://committee.iso.org/standard/87976.html?browse=ics

**Recheck:** Official ISO committee catalogue identifies Edition 1, published June 2026, stage 60.60; abstract covers sensor performance, health, calibration and common sensor-input interfaces for road vehicles with automated-driving functions. Electrical/mechanical interfaces and raw data are excluded.

**Claim limit:** Full standard is paid; only official catalogue status and abstract were inspected. This is a logical interface standard, not a calibration procedure, credential or universal requirement.

**Status note:** A stale ISO OBP copy still labelled ISO/DIS was seen in the earlier source review; the current official catalogue settles status as published. Do not call the DIS copy current.

### Existing source `D166-IEEE-1588-2019-PTP` - IEEE 1588-2019 — Precision Clock Synchronization Protocol

**URL:** https://standards.ieee.org/ieee/1547/6825/

**Recheck:** IEEE Standards Association lists IEEE 1588-2019 as active and amendments including 1588h-2026; page describes network clock synchronization and sub-microsecond capability under properly designed conditions.

**Claim limit:** Generic networked measurement/control timing, not an automotive sensor-fusion implementation or safety result; full standard requires access.

### Existing source `D166-ASAM-OPENDRIVE-2026` - ASAM OpenDRIVE

**URL:** https://www.asam.net/standards/detail/opendrive/

**Recheck:** Official ASAM page lists version 1.9.0 released 2026-05-19, with scope as static road-network description for simulation/traffic simulation.

**Claim limit:** Simulation road-network exchange format; not proof of a production AV map, localization quality or universally adopted onboard map schema.

### Existing source `D166-AUTOWARE-MAP-CREATION-TUTORIAL-2026` - Creating maps ? Autoware Documentation

**URL:** https://docs.autoware.org/main/tutorials/integrating-autoware/creating-maps/

**Recheck:** Official documentation opened 2026-10-24, lines 673-708. Autoware map layers and named point-cloud/vector-map tools, providers and specific scope/compatibility limits directly checked.

**Claim limit:** Stack-specific instructions, not a comparative safety/quality assessment or proof of global adoption/provider coverage.

**Status note:** Source supports current tools/software/data classification, not the production output claim alone; keep provider availability and MapToolbox/JOSM compatibility conditions explicit.

### Existing source `D166-ROBOT-LOCALIZATION-SURVEY-2026` - Robot localization: a comprehensive survey from classical methods to intelligent autonomy

**URL:** https://link.springer.com/article/10.1007/s41315-026-00528-9

**Recheck:** Full open-access 2026 review directly inspected 2026-10-24; abstract, ??1.1-1.2 and ?2.2 were opened. Lines 139-152 discuss KF/EKF model assumptions/limitations and estimator alternatives; lines 118-125 and 78-95 discuss learned and semantic approaches.

**Claim limit:** Review-level secondary evidence; comparisons are heterogeneous, not a universal ranking or evidence of deployment.

**Status note:** Supports specific established KF/EKF technique classes and emerging learning-augmented types; do not use the survey to claim future products or production maturity.

## Conditional role-task evidence

Employer examples are conditional tasks only. They do not establish canonical role equivalence, role fit or route membership.

### `D166|mechatronics engineer` - Mechatronics Engineer (D166:vehicle-sensing-and-sensor-calibration)

**Task evidence:** Reviewed task record: Conditional when the work mounts, interfaces, characterizes, calibrates or validates LiDAR/camera/radar/other sensing hardware and its coordinate/health outputs.

**Conditional applicability:** Conditional when the work mounts, interfaces, characterizes, calibrates or validates LiDAR/camera/radar/other sensing hardware and its coordinate/health outputs.

**Boundary:** Sensor-system tasks are supported; perception-algorithm ownership is not implied by sensor integration or calibration alone.

**Role-fit effect:** None. Current canonical role record remains domain_fit_status=unsupported with no area route; this is task-level conditional evidence only.

- `D166-RIVIAN-AUTONOMY-SENSING-SYSTEMS-2026-10-23` ? Autonomy Sensing Systems Engineer; https://careers.rivian.com/careers-home/jobs/29594?lang=en-us; locator: Official Rivian posting inspected 2026-10-23; system requirements and validation responsibilities cover cameras, radar, LiDAR, IMU, GNSS and interfaces including packaging, timing and calibration.; limit: This is a dedicated autonomy sensing systems engineer role, not a canonical mechatronics engineer profile. Apply only where the existing role's assigned work includes sensor packaging/integration/testing; do not infer a general route or title equivalence.

- `D166-MOBILEYE-SENSOR-CALIBRATION-2026-10-23` ? Sensor Calibration Engineer; https://careers.mobileye.com/jobs/sensor-calibration-engineer/3e08463f-6b23-40bb-996c-c61fe1ad5e10; locator: Current employer role page inspected 2026-10-23; intrinsic/extrinsic and spatiotemporal calibration across camera/LiDAR/IMU, online drift tracking, nonlinear optimization, residual analysis and calibrated transforms delivered to perception/localization/control.; limit: One employer's specialist software-heavy job posting, not universal AV sensor practice or canonical role equivalence. Apply only to matching calibration work.

- `D166-AEVA-LIDAR-CHARACTERIZATION-2026-10-23` ? Systems Engineer, LiDAR Characterization; https://jobs.lever.co/aeva/bab05e15-d7ce-430a-a91c-e0f1a1034d62; locator: Aeva current employer-hosted posting inspected 2026-10-23; lab/on-vehicle LiDAR characterization, automated data collection, instrumentation, calibration procedures and result reporting.; limit: Aeva-specific LiDAR technology and one systems-engineering posting; its task mix is not representative of every modality or AV sensor team.

### `D166|optomechanical engineer` - Optomechanical Engineer (D166:vehicle-sensing-and-sensor-calibration)

**Task evidence:** Reviewed task record: Conditional when optical/LiDAR module design, characterization, packaging, alignment or calibration affects the performance of an AV sensor.

**Conditional applicability:** Conditional when optical/LiDAR module design, characterization, packaging, alignment or calibration affects the performance of an AV sensor.

**Boundary:** The evidence concerns sensor hardware/measurement; it does not establish perception software or localization ownership.

**Role-fit effect:** None. Current canonical role record remains domain_fit_status=unsupported with no area route; this is task-level conditional evidence only.

- `D166-GM-OPTICAL-SENSOR-TEST-2026-10-23` ? Senior Advanced Optical Sensor Test & Development Engineer; https://search-careers.gm.com/en/jobs/jr-202621090/senor-advanced-optical-sensor-test-development-engineer/; locator: Current GM posting JR-202621090, posted 2026-10-21; camera/LiDAR optical components, image quality, lens/packaging, lab instrumentation, calibration, sensor interface latency/FPS and vehicle integration responsibilities.; limit: Senior GM sensor-development role with software, imaging and systems tasks; not a general optomechanical-engineering profile or evidence that every optical-mechanical task belongs to AV sensing.

- `D166-AEVA-LIDAR-CHARACTERIZATION-2026-10-23` ? Systems Engineer, LiDAR Characterization; https://jobs.lever.co/aeva/bab05e15-d7ce-430a-a91c-e0f1a1034d62; locator: Aeva current employer-hosted posting inspected 2026-10-23; lab/on-vehicle LiDAR characterization, automated data collection, instrumentation, calibration procedures and result reporting.; limit: Aeva-specific LiDAR technology and one systems-engineering posting; its task mix is not representative of every modality or AV sensor team.

### `D166|software developer` - Software Developer (D166:perception-and-scene-understanding)

**Task evidence:** Reviewed task record: Conditional when software work develops or evaluates multimodal detection, tracking, scene representation or perception models.

**Conditional applicability:** Conditional when software work develops or evaluates multimodal detection, tracking, scene representation or perception models.

**Boundary:** Employer examples show distinct model-development and perception-evaluation assignments; methods and sensors vary by stack.

**Role-fit effect:** None. Current canonical role record remains domain_fit_status=unsupported with no area route; this is task-level conditional evidence only.

- `D166-WAYMO-PERCEPTION-ML-2026` ? Perception Machine Learning Engineer; https://careers.withwaymo.com/jobs/perception-machine-learning-engineer-mountain-view-california-united-states-san-francisco; locator: Role summary and responsibilities; opened 2026-10-23.; limit: One employer role example, not exact canonical-title equivalence or universal tool/method requirement; page is dynamic and should be date-checked.

- `D166-WAYMO-PERCEPTION-EVALUATION-2026` ? Software Engineer, Perception Scaling Evaluation; https://careers.withwaymo.com/jobs/software-engineer-perception-evaluation-mountain-view-california-united-states-san-francisco; locator: Role summary and responsibilities; opened 2026-10-23.; limit: Employer posting for a specialized evaluation role; not automatic role-fit evidence for a general canonical title or universal requirement.

### `D166|software developer` - Software Developer (D166:high-definition-mapping)

**Task evidence:** Reviewed task record: Conditional when software builds map representations, map reconstruction/update pipelines, map infrastructure or map serving used by AV systems.

**Conditional applicability:** Conditional when software builds map representations, map reconstruction/update pipelines, map infrastructure or map serving used by AV systems.

**Boundary:** Map data/software roles vary between map creation, ML reconstruction, data contracts and infrastructure; the route depends on assigned component and consumer.

**Role-fit effect:** None. Current canonical role record remains domain_fit_status=unsupported with no area route; this is task-level conditional evidence only.

- `D166-GM-STAFF-ML-MAPPING-ROLE-2026-10-23` ? Staff Machine Learning Engineer - Mapping; https://search-careers.gm.com/en/jobs/jr-202602984/staff-machine-learning-engineer-mapping/; locator: Current employer posting opened 2026-10-23; multi-modal map reconstruction/maintenance, data mining/labeling, ML training/evaluation/deployment and localization/perception/simulation interfaces.; limit: Staff-level job at one automaker; it does not make ML obligatory for all mapping tasks or every software developer.

- `D166-ZOOX-MAPPING-DATA-ROLE-2026-10-23` ? Software Engineer - Mapping Data Software; https://jobs.lever.co/zoox/8102c816-7ce1-49c8-8093-f46c8074652c; locator: Current posting opened 2026-10-23; road-network data definitions/products, geometry algorithms, topology, data formats, validation, post-processing and downstream consumer interfaces.; limit: One Zoox team and job design; it does not establish the same separation or format for every autonomy stack.

- `D166-WAABI-MAPPING-SOFTWARE-ROLE-2026-10-23` ? Senior/Staff Software Engineer, Mapping; https://jobs.lever.co/waabi/0e0ba69c-ea22-4bff-ac40-8e3e5674ff90; locator: Current posting inspected 2026-10-23; scalable AI-driven mapping infrastructure, data ingestion to real-time serving, automated create/validate/maintain/visualize pipelines and rigorous experimentation.; limit: Single employer and senior/staff job scope; promotional AI-first wording is not independent proof of system quality or industry prevalence.

- `D166-APPLIED-MAPS-INFRASTRUCTURE-ROLE-2026-10-23` ? Senior Software Engineer - Maps Infrastructure; https://jobs.ashbyhq.com/applied/366ad3c0-3988-4a94-a825-8fe6238a2a9a/; locator: Employer job text indexed 2026-10-23; HD-map creation/ingestion/lifecycle, sensor-fleet data, change detection, simulation workflows and publishing to vehicle fleets.; limit: Page renderer requires JavaScript; indexed employer text only. One senior, multi-sector employer role and promotional claims do not establish universal deployment practice.

- `D166-NVIDIA-MAPPING-SOFTWARE-ROLE-2026-10-23` ? Systems Software Engineer, Autonomous Systems Mapping - New College Graduate 2026; https://nvidia.wd5.myworkdayjobs.com/en-US/NVIDIAExternalCareerSite/job/US-CA-Santa-Clara/Systems-Software-Engineer--Autonomous-Systems-Mapping---New-College-Graduate-2026_JR2020838; locator: Official NVIDIA career search result text indexed 2026-10-23; map data collection/creation/consumption, GPS/IMU spatiotemporal analysis, camera/LiDAR/radar integrity and map visualization software.; limit: New-graduate 2026 posting and official indexed text; direct detail page/current vacancy status was not verified during this pass.

### `D166|software developer` - Software Developer (D166:localization-and-vehicle-state-estimation)

**Task evidence:** Reviewed task record: Conditional when software implements localization, inertial/odometry fusion, pose estimation, map matching or localization evaluation.

**Conditional applicability:** Conditional when software implements localization, inertial/odometry fusion, pose estimation, map matching or localization evaluation.

**Boundary:** The cited postings are specialist localization assignments; general software development does not imply these estimation methods.

**Role-fit effect:** None. Current canonical role record remains domain_fit_status=unsupported with no area route; this is task-level conditional evidence only.

- `D166-AURORA-LOCALIZATION-ROLE-2026-10-23` ? Senior Software Engineer, Localization; https://aurora.tech/careers/f9fb3e3a-e5c1-418b-99c8-53e97b2f64f6; locator: Current employer posting inspected 2026-10-23; high-rate multi-sensor pose estimates, state estimation, Kalman/nonlinear estimation, SLAM, spatial transforms and rigorous fleet safety/efficiency evaluation.; limit: One specialist posting and employer; it does not equate the canonical role title with localization engineer or establish universal requirements.

- `D166-WAABI-LOCALIZATION-ROLE-2026-10-23` ? Senior/Staff Software Engineer, Localization; https://jobs.lever.co/waabi/ca67aa9c-d647-41d5-a45b-38d94304344a; locator: Current posting inspected 2026-10-23; IMU/LiDAR/radar/camera/GNSS/wheel sensing, factor graphs/Kalman, maps/semantic landmarks, fleet/track evaluation; learned localization listed as a bonus.; limit: Single employer's senior/staff posting; learned localization is a posting-specific bonus, not a general requirement or evidence of superiority.

- `D166-KODIAK-LOCALIZATION-ROLE-2026-10-23` ? Staff Autonomy Software Engineer, Localization; https://job-boards.greenhouse.io/kodiak/jobs/4412485009; locator: Current employer-hosted posting inspected 2026-10-23; localization/state estimation, inertial navigation and sensed odometry task context.; limit: One staff-level employer posting; only a brief task summary is used here and it does not establish universal role duties.

### `D166|software developer` - Software Developer (D166:perception-and-scene-understanding)

**Task evidence:** Employer-posted specialist role directly assigns perception software design, implementation, integration, testing and validation tasks using multimodal inputs.

**Conditional applicability:** Only where a canonical software developer is assigned to develop/evaluate these perception modules and interfaces.

**Boundary:** The source describes one off-road specialist position, not a canonical job title profile or an automatic role-fit decision.

**Role-fit effect:** None. Existing canonical role fit remains unsupported and area routes remain empty.

- `D166-A1-CATERPILLAR-PERCEPTION-ROLE-2026` ? Autonomy Engineering Specialist - Perception; https://careers.caterpillar.com/en/jobs/r0000397079/autonomy-engineering-specialist-perception/; locator: Employer responsibilities and qualifications, lines 56-94: develop/test sensor fusion, detection, tracking and classification modules; integrate perception software with hardware; validate using camera, LiDAR, 4D-radar, IMU/GNSS and machine-state data.; limit: One specialist job in mobile off-road machinery; it is not a canonical D166 role profile, does not prove software-developer role fit, and cannot establish universal method, sensor or credential requirements.

## Cross-area relationship candidates

Candidates remain unapproved for coordinator reconciliation; no route or sequence changes are implied.

- **D166:vehicle-sensing-and-sensor-calibration ? D166:perception-and-scene-understanding / output_dependency:** In the Autoware reference architecture, sensing acquires/preprocesses sensor streams and perception consumes sensor inputs to produce scene representations. Candidate only for this named architecture/interface, not a universal fixed sequence. Condition: Only when the configured perception stack consumes the corresponding sensing outputs. Sources: `D166-AUTOWARE-SENSING-2026-10-22`, `D166-AUTOWARE-PERCEPTION-2026-10-22`, `D166-AUTOWARE-PERCEPTION-REFERENCE-2026`. Limit: Autoware-specific component architecture; exact message contracts and sensor set vary by implementation.. Status: `candidate_only_unapproved`.

- **D166:vehicle-sensing-and-sensor-calibration ? D166:localization-and-vehicle-state-estimation / output_dependency:** GNSS/INS/IMU measurements are inputs to documented localization configurations; calibration/timing are prerequisites only for fusions that require aligned modalities. Preserve sensor measurement production versus estimator design. Condition: Only for an estimator configuration consuming those sensor streams. Sources: `D166-AUTOWARE-SENSING-2026-10-22`, `D166-AUTOWARE-LOCALIZATION-2026-10-22`, `D166-AUTOWARE-EKF-LOCALIZER-DOCS-2026`. Limit: Specific implementation; single-sensor, alternate-sensor and ODD-specific configurations may differ.. Status: `candidate_only_unapproved`.

- **D166:high-definition-mapping ? D166:localization-and-vehicle-state-estimation / output_dependency:** A map-based localization configuration consumes map geometry/semantics as a reference; point-cloud matching and lane/road-network priors are different representations and not universal requirements. Condition: Only for map-based localization or map matching when compatible map coverage exists. Sources: `D166-AUTOWARE-MAP-INTERFACE-2026`, `D166-AUTOWARE-LOCALIZATION-OUTPUT-CONTRACT`, `D166-AUTOWARE-LOCALIZATION-2026-10-22`, `D166-LANELET2-ROUTING-AND-RULES`. Limit: Other configurations may rely on GNSS, inertial/odometry or visual methods; map freshness and semantics remain implementation/ODD-specific.. Status: `candidate_only_unapproved`.

- **D166:high-definition-mapping ? D166:perception-and-scene-understanding / output_dependency:** Autoware perception lists map information among its inputs; this is a specific implementation input path, not proof every perception task requires an HD map. Condition: Only for perception functions configured to use map context or localization/map alignment. Sources: `D166-AUTOWARE-MAP-INTERFACE-2026`, `D166-AUTOWARE-PERCEPTION-2026-10-22`. Limit: Perception can operate without the same map inputs; map type, freshness and coordinate alignment matter.. Status: `candidate_only_unapproved`.

- **D166:vehicle-sensing-and-sensor-calibration ? D166:perception-and-scene-understanding / prerequisite:** Spatial/temporal calibration is a technical prerequisite for specific multi-sensor fusion methods whose inputs must be aligned; not a prerequisite for single-sensor perception or every route. Condition: Only when the selected method fuses modalities or depends on cross-sensor geometry/timing. Sources: `D166-AUTOWARE-SENSOR-CALIBRATION-TUTORIAL`, `D166-MEASUREMENT-SENSOR-CALIBRATION-SURVEY-2026`, `D166-IEEE-SENSOR-TEMPORAL-MISALIGNMENT-2024`, `D166-ISO-23150-20-SENSOR-INTERFACES-2026`. Limit: The calibration survey is abstract-only; ISO 23150-20 is interface-focused and does not prescribe calibration procedures. Candidate only.. Status: `candidate_only_unapproved`.

## Access and scope limits

These limitations are recorded with affected cells/tasks terminal; none is an unresolved closure blocker.

- **four_area_closure (`documented_scope_limit_not_a_closure_blocker`).** Checked: Earlier reconciliation snapshot and all four 24-cell matrices, All 24 task tracks and final area counter-search records, Final source/query references and per-cell dispositions. Missing/contradictory evidence: The earlier register marked these tracks open before the final close pass; that interim state was superseded by the linked area-specific counter-searches and terminal cell/task dispositions.. Closure effect: It limits the strength or geographic/generalization of a specific claim but does not prevent a bounded terminal disposition; the affected cell/task is closed with the limitation recorded.. Next action: No action required for this closure. Reopen only if the exact source or access condition changes and yields inspectable evidence..

- **sensor_calibration_survey (`documented_scope_limit_not_a_closure_blocker`).** Checked: Current index abstract-level card, Publisher abstract for DOI 10.1016/j.measurement.2026.122492. Missing/contradictory evidence: Full article is paywalled; detailed inclusion criteria, comparative evidence, limits and future-direction substantiation were not examined.. Closure effect: It limits the strength or geographic/generalization of a specific claim but does not prevent a bounded terminal disposition; the affected cell/task is closed with the limitation recorded.. Next action: No action required for this closure. Reopen only if the exact source or access condition changes and yields inspectable evidence..

- **USEFUL_and_other_multimodal_datasets (`documented_scope_limit_not_a_closure_blocker`).** Checked: UPCatalonia USEFUL dataset search result, Direct open attempt for official project page, Search-result abstract for a 2025 CMHT dataset. Missing/contradictory evidence: USEFUL page timed out on direct open and its license/data access were not verified; CMHT was only seen as a search result.. Closure effect: It limits the strength or geographic/generalization of a specific claim but does not prevent a bounded terminal disposition; the affected cell/task is closed with the limitation recorded.. Next action: No action required for this closure. Reopen only if the exact source or access condition changes and yields inspectable evidence..

- **Nigeria_and_regional_context (`documented_scope_limit_not_a_closure_blocker`).** Checked: FRSC official agency page, Targeted official Nigeria/FRSC/Government AV searches, Full IO-VNBD paper and PubMed record. Missing/contradictory evidence: No current official Nigerian road-vehicle ADS test/approval instrument surfaced in this bounded search; FRSC 2020 magazine result is commentary, not law. IO-VNBD Nigeria records are smartphone data; vehicle CAN/ECU is England-only.. Closure effect: It limits the strength or geographic/generalization of a specific claim but does not prevent a bounded terminal disposition; the affected cell/task is closed with the limitation recorded.. Next action: No action required for this closure. Reopen only if the exact source or access condition changes and yields inspectable evidence..

- **role_fit_and_area_routes (`documented_scope_limit_not_a_closure_blocker`).** Checked: Current canonical D166 role library (nine roles), Current index role records and role_area_routes, Conditional task-evidence rows for all D166 roles. Missing/contradictory evidence: Canonical roles remain domain_fit_status=unsupported with empty role_area_routes. Catalog role_keys do not establish fit. Five sourced conditional task records connect mechatronics engineer, optomechanical engineer and software developer to this lane.. Closure effect: It limits the strength or geographic/generalization of a specific claim but does not prevent a bounded terminal disposition; the affected cell/task is closed with the limitation recorded.. Next action: No action required for this closure. Reopen only if the exact source or access condition changes and yields inspectable evidence..

- **professional_curriculum_and_credentials (`documented_scope_limit_not_a_closure_blocker`).** Checked: Current D166 source index and its standards/learning-resource records, Official Tel Aviv University 2021 Mapping and Perception for an Autonomous Robot course search result, Direct open attempt for the university course catalog, Current Autoware tutorials and interfaces, Caterpillar employer posting opened for a bounded perception-task example. Missing/contradictory evidence: The university result exposes only a search summary; direct retrieval failed, and it is a 2021 course without a full syllabus. No verified current professional credential or complete curriculum for these four areas was established in this pass.. Closure effect: It limits the strength or geographic/generalization of a specific claim but does not prevent a bounded terminal disposition; the affected cell/task is closed with the limitation recorded.. Next action: No action required for this closure. Reopen only if the exact source or access condition changes and yields inspectable evidence..

## Validation

Command:
```powershell
python data/career-mapping/_audit/agent_workpacks/validate_D166_AGENT1_SOURCE_WORKPACK_2026_10_24.py
```

PASS: UTF-8 JSON parse
PASS: 4 areas; 96 unique cells; terminal cell counts {'mapped': 59, 'bounded_no_hit': 37}
PASS: 24 unique terminal task tracks {'complete': 17, 'bounded_no_hit': 7}
PASS: source/query references resolve; unique mapping IDs; cell-mapping ownership/counts reconcile
PASS: task-to-cell family/horizon scopes match gap-filler categories; no generic bounded-no-hit rationales or duplicate claims
PASS: every mapped claim carries item type, inputs/outputs, assumptions/limits, exact locator, and sourced relationship context
PASS: Markdown counts match JSON; no stale open labels or trailing whitespace
PASS: 6 role-task evidence records retain canonical IDs; no role fit/routes changed No browser rendering, graph integration, sequence, UI, deployment, or SQL verification is claimed.

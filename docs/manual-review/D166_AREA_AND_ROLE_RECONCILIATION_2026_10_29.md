# D166 Area and Conditional Role Reconciliation

**Date:** 2026-10-29  
**Disposition:** Eight detailed sourced areas selected; four older broad proposals superseded; task-conditioned role-area links reconciled.  
**Authority:** D166 area source cards and relationship notes in the D011/D166 source index, Agent 1 and Agent 2 workpacks, and the current D166 role records.

## Area decision

The selected D166 area set is the eight detailed areas covered by the bounded source reviews. The same eight IDs occur in the source index and specialization catalog. They now replace the four broader records in `domain_structure.json`:

| Superseded broad proposal | Selected areas replacing it |
|---|---|
| Perception, Sensing and Scene Understanding | Vehicle Sensing and Sensor Calibration; Perception and Scene Understanding |
| Localization, Mapping and Vehicle State Estimation | High-Definition Mapping and Map Data; Localization and Vehicle State Estimation |
| Planning, Control and Automated Driving Software | Automated Driving Planning; Vehicle Control and Dynamics |
| Vehicle Integration, Safety and Verification | Vehicle Interface and System Integration; ADS Safety, Verification and Validation |

The former four entries are retained with their original descriptions, boundaries, and source references in `domain_structure.json` under `areas_of_specialization_superseded` and in `data/career-mapping/_audit/D166_SUPERSEDED_BROAD_AREA_PROPOSALS_2026_10_29.json`, with their replacements recorded. They are not active areas or student destinations. The eight current area IDs, titles, boundaries, evidence, and task-specific role links are in both `domain_specialization_catalog.json` and `domain_structure.json`.

The four retired ISCO-derived subgroup records have been removed from active D166 `domain_structure.json` and preserved in the audit-only file `data/career-mapping/_audit/D166_RETIRED_ISCO_SUBGROUPS_2026_10_29.json`. They are distinct from the old four broad area proposals; none was used as an area or promoted by this reconciliation.

All eight area records remain `student_visible: false` pending the existing student contract/UI approval. This is an approval state, not an open source-search gate: all eight bounded area searches are recorded as terminal in the master source index.

## Conditional role decision

“Conditional” means that the canonical occupation is useful in D166 only for the stated assignment. It does not make the whole occupation an ADS specialty or imply that the person performs all methods in the area. The conditional task, boundary, source IDs, and source references are stored on the relevant area records.

| Measure | Resolved count |
|---|---:|
| Current canonical D166 role records | 9 |
| Conditional role-area task assignments | 20 |
| Distinct roles with at least one conditional task assignment | 9 / 9 |
| Assignments by area | 2, 1, 1, 1, 1, 3, 7, 4 |

Before reconciliation, the source index had 18 task records and the workpack comparison exposed two additional assignments in Agent 2's packet: Software Developer to Vehicle Control and Dynamics, and Software Developer to ADS Safety, Verification and Validation. Both were added to the source-index generator and the regenerated index now contains all 20 reconciled assignments.

Role-area resolution also corrects the earlier catalog summary:

- Removed Software Analyst → Vehicle Interface and System Integration because the source records did not establish that conditional task.
- Added Optomechanical Engineer → Vehicle Interface and System Integration because reviewed sensor-component sources support that link only when the optical module must be integrated with vehicle mounting, thermal, electrical, or data-acquisition interfaces.
- Retained four task-supported assignments present in the index but absent from the workpack pair list: Automotive Engineer → Safety/V&V; Mechanical Engineer → Integration; Powertrain Engineer → Control; and Optomechanical Engineer → Integration. A workpack omission does not negate a separately resolved, source-backed task record.
- Kept task boundaries narrow for all roles. For example, Telecommunications Engineer links to in-vehicle/vehicle-cloud communications; Homologation Engineer links to ADS/ADAS approval tasks; Software Developer links only to the named software assignment.

The canonical role library now records these nine roles as **conditional D166 fits**, with conditional domain and area routes whose evidence contains the applicable task conditions, boundaries, and source references. This makes the roles available only for the supported assignment context; the generic occupation tasks outside that context remain outside D166. The D166 role count in `domain_structure.json` is corrected from 14 to the 9 current canonical records in `role_library_v3_cleaned.json` and the source index.

Some conditional evidence has specific limits. In particular, the Software Developer control task retains a historical Tesla role record whose direct page is no longer available; the link is limited to the narrow control-software task and must not be shown as a current vacancy or universal requirement. Other employer task records retain their own source and access limits in the per-area references.

## Data changes

- `data/career-mapping/domain_structure.json`: replaced D166's active four-area list with the selected eight; preserved the former four in an audit-only superseded field; corrected role count to 9; added per-area conditional task records and evidence; left the four ISCO-derived subgroups excluded.
- `data/career-mapping/domain_specialization_catalog.json`: aligned each D166 area's role keys/count with the 20 task-conditioned assignments, removed the unsupported software-analyst/integration pair, and added the sourced optomechanical/integration pair.
- `data/career-mapping/role_library_v3_cleaned.json`: changed the nine D166 roles from blanket `unsupported`/excluded to `conditional` fit with active-but-qualified domain and area routes; each route embeds its conditional assignment and evidence. No role is unconditionally assigned to D166.
- `data/career-mapping/_audit/D166_RETIRED_ISCO_SUBGROUPS_2026_10_29.json`: preserves the four removed ISCO subgroup records for audit; these are not active specialization areas.
- `data/career-mapping/_audit/D166_SUPERSEDED_BROAD_AREA_PROPOSALS_2026_10_29.json`: preserves the four replaced broad proposals, including their original evidence and descriptions.
- `data/career-mapping/_audit/index_D011_D166_in_depth_sources_2026_10_23.json` and `.md`: regenerated after adding the two workpack-specific Software Developer task records to the source-index generator.
- `data/career-mapping/_audit/index_D011_D166_in_depth_sources_2026_10_23.py`: records those two task assignments and their source limitations for reproducibility.
- `data/career-mapping/_audit/reconcile_d166_areas_and_conditional_roles_2026_10_29.py`: idempotent data reconciliation that asserts the 8-area set, role record denominator, task sources, and excluded subgroup state.
- [Provisional learning graph](D166_AUTONOMOUS_DRIVING_PROVISIONAL_LEARNING_GRAPH_2026_10_29.md): updated to use the selected eight areas and the reconciled conditional-role assignments.

## Validation

Ran:

```text
python data/career-mapping/_audit/index_D011_D166_in_depth_sources_2026_10_23.py
python data/career-mapping/_audit/reconcile_d166_areas_and_conditional_roles_2026_10_29.py
```

Results:

- The source-index generator completed and reported **8 D166 areas, 9 canonical D166 roles, 20 conditional role-area assignments**, and all D166 conditional-role checks passed, including role identity, canonical area IDs, and coverage of all roles.
- The reconciliation script passed its assertions: **8 retained areas; 4 superseded proposals mapped; 9 canonical roles; 20 source-resolved conditional assignments**; all role references point to the selected areas and resolve to indexed/workpack source cards.
- No D166 ISCO subgroup remains in the active structure; the four historical records are archived. The nine role fits/routes are conditional on the documented tasks. Area student visibility remains behind the existing contract/UI approval gate.

No frontend, SQL, migration, route projection, or live database changes were made. The data reflects the selected area set and task-conditioned role associations; the existing student approval/visibility gate remains in place.

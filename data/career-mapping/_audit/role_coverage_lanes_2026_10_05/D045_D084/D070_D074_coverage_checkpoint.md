# Global role coverage inventory checkpoint: D070–D074

Date: 2026-10-06

## Scope and controls

This is the D070–D074 batch in the D045–D084 global role-coverage-gap inventory. D045–D069 are already registered and were not re-audited. This is an evidence-led candidate inventory, not a canonical taxonomy change. The completed D045–D084 role-to-parent fit lane remains separate (563/563 mappings); any corrections from that fit review remain proposals and unapplied. No role-to-subgroup or role-to-specialization assignments are made.

## Current active counts

Counts were rebuilt from `domain_structure.json` and cross-checked against exact keys in the completed role-fit worklist. The inactive candidate library is not counted as active mappings.

| Domain | Active mappings | Finding |
|---|---:|---|
| D070 Performing Arts and Entertainment | 15 | Active roles cover acting, dance, production and technical work; ILO's musician/singer/composer family is absent from the active lane despite music being explicit in the domain. |
| D071 Sports Management | 0 | Zero active mappings. Candidate families: coach, sports administrator, performance analyst, talent scout and referee/match official. The current role library is not counted as active coverage. |
| D072 Geospatial Science and Geographic Information Systems | 18 | Surveying, mapping, GIS and earth sciences are covered; geospatial analyst and Earth-observation/remote-sensing tasks merit exact-key overlap review. |
| D073 Libraries, Archives and Information Management | 15 | Existing roles cover library, archive, collection, conservation and information management; digital preservation/data curation are retained as cross-cutting specializations, not asserted as new globally distinct role families. |
| D074 Occupational Health and Safety | 20 | General OSH, engineering and inspection are represented; occupational hygiene exposure-science tasks merit exact-key review against active OSH-specialist profiles. |
| **Batch total** | **68** | |

Running total: 30/40 domains recorded (D045–D074); 10 remain (D075–D084). The 30 recorded domains contain 434 active mappings. This is a current active-mapping count, not a count of proposed candidates.

## Evidence and disposition

- D070: ILO ISCO-08 Unit Group 2652 identifies musicians, singers and composers and describes composition, arrangement, conducting and performance tasks. This candidate is separated from existing audio/sound technician work. Existing task keys must be checked before proposing canonical additions.
- D071: the International Sport Coaching Framework supports coaching as an established family; the Olympic sport-administration manual supports sport-organization administration; ASPA supports sports performance analysis as a professional family; FIFA's 2026 talent-identification guide and scout course support scout tasks; World Athletics documents technical officials/referees and their training pathway. These candidates reflect the domain description but remain unpromoted pending exact-key/current-task comparison. Sport-specific certification and job titles vary; no Nigeria-specific variants were asserted.
- D072: the UN Generic Geospatial Job Profiles list geospatial analyst and Earth-observation specialist alongside GIS data management, systems, development and surveying profiles; FIG describes the global geomatics/geospatial practice scope. Proposed candidates are limited to analyst and Earth-observation tasks that may be missing; exact overlap with existing GIS and remote-sensing records must be checked.
- D073: IFLA and ICA sources describe modern digital-library and digital-archival work as evolving skills/specializations. On this evidence, no standalone role is proposed; current archivist, librarian and related roles may already own the tasks.
- D074: IOHA defines occupational hygiene as anticipating, recognizing, evaluating and controlling workplace health hazards; its competency document specifies exposure assessment and control tasks. This supports a distinct candidate family, while requiring comparison with the active OSH specialist role before addition.

## Nigeria-specific context

No candidate-specific Nigerian title or occupational variant is evidenced in this batch. This does not prove that none exists; it means none is asserted without direct local source evidence. Earlier domain descriptions with Nigerian licensing language remain jurisdictional notes and do not define global role requirements.

## Validation

Run:

```powershell
python -m unittest data.career-mapping._audit.role_coverage_lanes_2026_10_05.D045_D084.test_role_coverage_candidate_register -v
```

Next: D075–D079. Do not repeat D045–D074.

# Career role completeness report

This report measures the cleaned canonical role library and the exact source joins in role_tools.json.
A role is not treated as complete merely because it has a name: source ownership, tools and competencies are measured separately.

## Overall coverage

- Canonical role keys: **5166**
- Exact ESCO occupation matches: **4735 (91.7%)**
- Exact detailed O*NET tool matches: **4236 (82.0%)**
- Exact detailed O*NET competency matches: **4200 (81.3%)**
- ESCO skill records: **4735 (91.7%)**
- Specialist framework signals: **560 (10.8%)**
- Any source signal: **5166 (100.0%)**
- Roles without a source signal: **0**

ESCO and O*NET are kept as separate evidence. O*NET joins use exact detailed SOC codes; ISCO groups are used only for subgroup placement, never for copying competencies.

## Priority domains

| Domain | Canonical roles | Structure roles | Subgroups | ESCO | O*NET tools | O*NET competencies | Framework | Any signal |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| D139 Game Design | 41 | 41 | 3 | 27 | 23 | 22 | 14 | 41 |
| D140 Robotics Engineering, Systems Design | 20 | 20 | 4 | 15 | 15 | 15 | 14 | 20 |
| D141 Quantum Computing, Quantum Information | 19 | 19 | 5 | 0 | 0 | 0 | 19 | 19 |
| D155 Nanotechnology, Advanced Materials | 12 | 12 | 3 | 5 | 7 | 6 | 8 | 12 |
| D163 Intellectual Property Law, Patents | 7 | 7 | 5 | 7 | 5 | 5 | 5 | 7 |
| D167 XR & Immersive Technology | 13 | 13 | 7 | 7 | 5 | 5 | 13 | 13 |
| D168 Esports & Creator Economy | 15 | 15 | 6 | 4 | 5 | 5 | 15 | 15 |

Interpretation:
- D139 and D140 now reconcile their structure counts with the cleaned role layer; the new roles are framework-backed and remain separate from ESCO/O*NET matches.
- D141 is backed by the European Competence Framework for Quantum Technologies v3.0; its framework evidence remains separate from ESCO/O*NET joins.
- D167 and D168 now have canonical framework-backed roles and subgroups; their roles are not incorrectly labelled as ESCO/O*NET occupations.
- D155 and D163 are thin-domain review candidates and should not receive guessed roles or inherited tools.

## Domains requiring review

The following domains are flagged because they have fewer than five roles, a source gap, or a role-count mismatch between structure and canonical data. Domains without a supported subgroup taxonomy intentionally use direct domain-to-role navigation.

| Domain | Roles | Structure roles | Subgroups | Any source | Reason |
|---|---:|---:|---:|---:|---|

## Source strategy

1. Use ESCO and O*NET as the broad occupation/competency baseline, with exact identifiers and provenance.
2. Use domain-specific frameworks for emerging fields where ESCO/O*NET is incomplete; do not force those roles into unrelated ISCO groups.
3. Use Nigerian bodies and local programme/credential sources for local naming, training and regulatory context, not to invent missing global competencies.
4. Keep source-backed, partial and unsourced states visible to the API and UI.

### Next population sources

- Gaming: TESDA Philippine Skills Framework for Game Development and Gamebadges competence map.
- Quantum: European Competence Framework for Quantum Technologies v3.0 (Quantum Flagship/QUCATS).
- XR/VR: Jobs for the Future XR and Immersive Learning Career Pathways Framework, then Unity/OpenXR material for implementation vocabulary.
- Robotics: ARM RoboticsCareer pathways and Skills England Robotics Engineer / Advanced Robotics Engineer occupational maps.
- Esports/creator economy: keep certifications empty unless a recognized issuer is verified; use a separate source review for roles and skills.

### References

- https://www.tesda.gov.ph/Uploads/File/Philippine%20Skills%20Framework/PSF%20-%20Game%20Development.pdf
- https://map.gamebadges.eu/
- https://www.jff.org/idea/immersive-learning-xr-technology-skills-and-careers/
- https://www.roboticscareer.org/careers
- https://occupational-maps.skillsengland.education.gov.uk/maps/occupation/OCC1381
- https://occupational-maps.skillsengland.education.gov.uk/maps/occupation/OCC1317
- https://qt.eu/media/pdf/Competence_Framework_for_QT_v3.0_2025_official-version.pdf

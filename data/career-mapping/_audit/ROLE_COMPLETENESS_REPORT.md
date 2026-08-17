# Career role completeness report

This report measures the cleaned canonical role library and the exact source joins in role_tools.json.
A role is not treated as complete merely because it has a name: source ownership, tools and competencies are measured separately.

## Overall coverage

- Canonical role keys: **5154**
- Exact ESCO occupation matches: **4735 (91.9%)**
- Exact detailed O*NET tool matches: **4236 (82.2%)**
- Exact detailed O*NET competency matches: **4200 (81.5%)**
- ESCO skill records: **4735 (91.9%)**
- Specialist framework signals: **548 (10.6%)**
- Any source signal: **5154 (100.0%)**
- Roles without a source signal: **0**

ESCO and O*NET are kept as separate evidence. O*NET joins use exact detailed SOC codes; ISCO groups are used only for subgroup placement, never for copying competencies.

## Priority domains

| Domain | Canonical roles | Structure roles | Subgroups | ESCO | O*NET tools | O*NET competencies | Framework | Any signal |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| D139 Game Design | 29 | 29 | 3 | 27 | 23 | 22 | 2 | 29 |
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

The following domains are flagged because they have fewer than five roles, no subgroups, a source gap, or a role-count mismatch between structure and canonical data.

| Domain | Roles | Structure roles | Subgroups | Any source | Reason |
|---|---:|---:|---:|---:|---|
| D003 Artificial Intelligence | 5 | 5 | 0 | 5 | no subgroups |
| D144 Climate Science, Meteorology | 5 | 5 | 0 | 5 | no subgroups |
| D091 Driving Instruction | 7 | 7 | 0 | 7 | no subgroups |
| D132 Space Science, Exploration | 8 | 8 | 0 | 8 | no subgroups |
| D123 Radiography, Medical Imaging | 11 | 11 | 0 | 11 | no subgroups |
| D126 Complementary, Alternative | 11 | 11 | 0 | 11 | no subgroups |
| D084 Payroll, Bookkeeping | 14 | 14 | 0 | 14 | no subgroups |
| D105 Handicraft, Basketry, Textile Craft | 14 | 14 | 0 | 14 | no subgroups |
| D090 Animal Care, Grooming | 15 | 15 | 0 | 15 | no subgroups |
| D004 Cybersecurity | 16 | 16 | 0 | 16 | no subgroups |
| D082 Customer Service, Contact Centre | 17 | 17 | 0 | 17 | no subgroups |
| D124 Community Health Extension | 17 | 17 | 0 | 17 | no subgroups |
| D157 Tax Advisory, Transfer Pricing | 17 | 17 | 0 | 17 | no subgroups |
| D072 Geospatial Science | 18 | 18 | 0 | 18 | no subgroups |
| D148 Offshore, Subsea | 18 | 18 | 0 | 18 | no subgroups |
| D109 Metal Processing, Foundry | 19 | 19 | 0 | 19 | no subgroups |
| D019 Renewable Energy Engineering | 20 | 20 | 0 | 20 | no subgroups |
| D020 Environmental Engineering | 20 | 20 | 0 | 20 | no subgroups |
| D116 Heavy Equipment, Earthmoving | 20 | 20 | 0 | 20 | no subgroups |
| D093 Electrical Installation, Wiring | 21 | 21 | 0 | 21 | no subgroups |
| D021 Architecture | 22 | 22 | 0 | 22 | no subgroups |
| D083 Travel, Tourism | 22 | 22 | 0 | 22 | no subgroups |
| D112 Wood Processing, Pulp | 22 | 22 | 0 | 22 | no subgroups |
| D080 Interior Design | 23 | 23 | 0 | 23 | no subgroups |
| D118 Crop Production, Horticulture | 23 | 23 | 0 | 23 | no subgroups |
| D078 Social Sciences | 24 | 24 | 0 | 24 | no subgroups |
| D104 Pottery, Ceramics, Glass | 24 | 24 | 0 | 24 | no subgroups |
| D002 Data Engineering | 25 | 25 | 0 | 25 | no subgroups |
| D056 Blockchain | 25 | 25 | 0 | 25 | no subgroups |
| D007 UI/UX Design | 26 | 26 | 0 | 26 | no subgroups |
| D094 Electronics Servicing, ICT Equipment | 26 | 26 | 0 | 26 | no subgroups |
| D159 Credit Analysis, Structured Finance | 27 | 27 | 0 | 27 | no subgroups |
| D106 Garment Making, Tailoring, Dressmaking | 28 | 28 | 0 | 28 | no subgroups |
| D115 Road Transport Operations (Drivers | 28 | 28 | 0 | 28 | no subgroups |
| D016 Electrical | 35 | 35 | 0 | 35 | no subgroups |
| D142 Bioinformatics, Computational Biology | 36 | 36 | 0 | 36 | no subgroups |
| D001 Software Engineering | 37 | 37 | 0 | 37 | no subgroups |
| D024 Nursing | 38 | 38 | 0 | 38 | no subgroups |
| D068 Allied Health | 38 | 38 | 0 | 38 | no subgroups |
| D041 Scientific Research | 43 | 43 | 0 | 43 | no subgroups |
| D114 Assembly, Packaging | 43 | 43 | 0 | 43 | no subgroups |
| D017 Mechanical | 45 | 45 | 0 | 45 | no subgroups |
| D030 Marketing, Brand | 46 | 46 | 0 | 46 | no subgroups |
| D023 Medicine | 49 | 49 | 0 | 49 | no subgroups |
| D110 Chemical, Rubber | 56 | 56 | 0 | 56 | no subgroups |
| D043 Journalism | 62 | 62 | 0 | 62 | no subgroups |
| D097 Welding, Fabrication, Blacksmithing | 63 | 63 | 0 | 63 | no subgroups |
| D018 Civil | 67 | 67 | 0 | 67 | no subgroups |
| D085 Retail Sales, Shop Operations | 70 | 70 | 0 | 70 | no subgroups |

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

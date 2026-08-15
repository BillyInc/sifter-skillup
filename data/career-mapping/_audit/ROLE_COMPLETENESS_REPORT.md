# Career role completeness report

This report measures the cleaned canonical role library and the exact source joins in role_tools.json.
A role is not treated as complete merely because it has a name: source ownership, tools and competencies are measured separately.

## Overall coverage

- Canonical role keys: **4735**
- Exact ESCO occupation matches: **4409 (93.1%)**
- Exact detailed O*NET tool matches: **3883 (82.0%)**
- Exact detailed O*NET competency matches: **3817 (80.6%)**
- ESCO skill records: **4409 (93.1%)**
- Specialist framework signals: **49 (1.0%)**
- Any source signal: **4649 (98.2%)**
- Roles without a source signal: **86**

ESCO and O*NET are kept as separate evidence. O*NET joins use exact detailed SOC codes; ISCO groups are used only for subgroup placement, never for copying competencies.

## Priority domains

| Domain | Canonical roles | Structure roles | Subgroups | ESCO | O*NET tools | O*NET competencies | Framework | Any signal |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| D139 Game Design | 29 | 29 | 3 | 27 | 23 | 22 | 2 | 29 |
| D140 Robotics Engineering, Systems Design | 11 | 11 | 2 | 8 | 7 | 7 | 5 | 11 |
| D141 Quantum Computing, Quantum Information | 12 | 12 | 4 | 0 | 0 | 0 | 12 | 12 |
| D155 Nanotechnology, Advanced Materials | 9 | 9 | 2 | 4 | 4 | 3 | 0 | 4 |
| D163 Intellectual Property Law, Patents | 2 | 5 | 0 | 2 | 2 | 2 | 0 | 2 |
| D167 XR & Immersive Technology | 6 | 6 | 4 | 0 | 0 | 0 | 6 | 6 |
| D168 Esports & Creator Economy | 9 | 9 | 5 | 0 | 0 | 0 | 9 | 9 |

Interpretation:
- D139 and D140 now reconcile their structure counts with the cleaned role layer; the new roles are framework-backed and remain separate from ESCO/O*NET matches.
- D141 is backed by the European Competence Framework for Quantum Technologies v3.0; its framework evidence remains separate from ESCO/O*NET joins.
- D167 and D168 now have canonical framework-backed roles and subgroups; their roles are not incorrectly labelled as ESCO/O*NET occupations.
- D155 and D163 are thin-domain review candidates and should not receive guessed roles or inherited tools.

## Domains requiring review

The following domains are flagged because they have fewer than five roles, no subgroups, a source gap, or a role-count mismatch between structure and canonical data.

| Domain | Roles | Structure roles | Subgroups | Any source | Reason |
|---|---:|---:|---:|---:|---|
| D132 Space Science, Exploration | 1 | 7 | 0 | 1 | thin role count, structure mismatch, no subgroups |
| D059 Space Technology | 2 | 6 | 0 | 2 | thin role count, structure mismatch, no subgroups |
| D163 Intellectual Property Law, Patents | 2 | 5 | 0 | 2 | thin role count, structure mismatch, no subgroups |
| D058 EdTech | 3 | 7 | 0 | 3 | thin role count, structure mismatch, no subgroups |
| D137 Medical Physics, Radiation Therapy | 3 | 4 | 0 | 3 | thin role count, structure mismatch, no subgroups |
| D146 Building Services Engineering — Mechanical, Electrical | 3 | 9 | 0 | 3 | thin role count, structure mismatch, no subgroups |
| D161 Humanitarian Aid, Emergency Response | 3 | 5 | 0 | 3 | thin role count, structure mismatch, no subgroups |
| D135 Nuclear Engineering, Radiation Science | 4 | 8 | 0 | 4 | thin role count, structure mismatch, no subgroups |
| D144 Climate Science, Meteorology | 4 | 4 | 1 | 4 | thin role count |
| D150 Religious Ministry, Theology | 4 | 6 | 0 | 4 | thin role count, structure mismatch, no subgroups |
| D003 Artificial Intelligence | 5 | 5 | 1 | 4 | unsourced roles |
| D067 Dentistry | 5 | 6 | 0 | 5 | structure mismatch, no subgroups |
| D128 Social Welfare, Youth Services | 5 | 8 | 0 | 5 | structure mismatch, no subgroups |
| D160 Fashion Styling, Image Consulting | 5 | 7 | 2 | 5 | structure mismatch |
| D162 Immigration Law, Asylum | 5 | 8 | 2 | 5 | structure mismatch |
| D091 Driving Instruction | 6 | 6 | 0 | 6 | no subgroups |
| D096 Agricultural | 6 | 10 | 3 | 6 | structure mismatch |
| D130 Recruitment, Employment | 6 | 7 | 0 | 3 | structure mismatch, no subgroups, unsourced roles |
| D126 Complementary, Alternative | 7 | 8 | 0 | 6 | structure mismatch, no subgroups, unsourced roles |
| D136 Aeronautical | 7 | 9 | 2 | 7 | structure mismatch |
| D145 Neuroscience, Cognitive Science | 7 | 11 | 2 | 7 | structure mismatch |
| D152 Museum Curation, Cultural Heritage, Archives | 7 | 12 | 2 | 7 | structure mismatch |
| D012 FinTech Engineering | 8 | 8 | 2 | 7 | unsourced roles |
| D065 Translation, Interpretation | 8 | 10 | 0 | 8 | structure mismatch, no subgroups |
| D117 Railway | 8 | 8 | 0 | 8 | no subgroups |
| D121 Forestry, Wildlife Management | 8 | 11 | 0 | 8 | structure mismatch, no subgroups |
| D151 Criminology, Criminal Justice | 8 | 10 | 3 | 8 | structure mismatch |
| D005 Cloud Computing | 9 | 9 | 2 | 8 | unsourced roles |
| D123 Radiography, Medical Imaging | 9 | 8 | 0 | 3 | structure mismatch, no subgroups, unsourced roles |
| D155 Nanotechnology, Advanced Materials | 9 | 9 | 2 | 4 | unsourced roles |
| D074 Occupational Health, Safety | 10 | 11 | 0 | 10 | structure mismatch, no subgroups |
| D084 Payroll, Bookkeeping | 10 | 12 | 0 | 10 | structure mismatch, no subgroups |
| D127 Early Childhood Education, Nursery | 10 | 12 | 3 | 10 | structure mismatch |
| D006 Internet of Things | 11 | 11 | 2 | 4 | unsourced roles |
| D061 Insurance | 11 | 13 | 2 | 11 | structure mismatch |
| D095 Motor Vehicle Mechanics, Repairs | 11 | 12 | 0 | 11 | structure mismatch, no subgroups |
| D134 Naval Architecture, Marine Engineering | 11 | 12 | 2 | 11 | structure mismatch |
| D154 Exercise Science, Sports Therapy | 11 | 20 | 3 | 11 | structure mismatch |
| D051 Real Estate | 12 | 16 | 0 | 12 | structure mismatch, no subgroups |
| D057 Digital Health | 12 | 12 | 4 | 7 | unsourced roles |
| D165 Wellness Coaching, Lifestyle Medicine | 12 | 14 | 2 | 12 | structure mismatch |
| D103 Jewellery Making, Goldsmithing | 13 | 10 | 0 | 13 | structure mismatch, no subgroups |
| D105 Handicraft, Basketry, Textile Craft | 13 | 13 | 0 | 13 | no subgroups |
| D122 Medical Laboratory Technology | 13 | 11 | 0 | 5 | structure mismatch, no subgroups, unsourced roles |
| D025 Pharmacy | 14 | 15 | 2 | 9 | structure mismatch, unsourced roles |
| D064 Psychology, Counselling | 14 | 16 | 0 | 14 | structure mismatch, no subgroups |
| D099 Masonry, Bricklaying, Tiling, Plastering | 14 | 14 | 0 | 14 | no subgroups |
| D119 Livestock, Poultry, Dairy | 14 | 16 | 2 | 14 | structure mismatch |
| D073 Library, Archive | 15 | 14 | 2 | 15 | structure mismatch |
| D090 Animal Care, Grooming | 15 | 15 | 0 | 15 | no subgroups |
| D014 Actuarial Science | 16 | 16 | 3 | 15 | unsourced roles |
| D029 Human Resources | 16 | 17 | 2 | 16 | structure mismatch |
| D082 Customer Service, Contact Centre | 17 | 18 | 2 | 17 | structure mismatch |
| D124 Community Health Extension | 17 | 12 | 2 | 16 | structure mismatch, unsourced roles |
| D157 Tax Advisory, Transfer Pricing | 17 | 15 | 0 | 17 | structure mismatch, no subgroups |
| D054 Oil | 18 | 21 | 4 | 18 | structure mismatch |
| D148 Offshore, Subsea | 18 | 20 | 2 | 18 | structure mismatch |
| D109 Metal Processing, Foundry | 19 | 21 | 0 | 19 | structure mismatch, no subgroups |
| D019 Renewable Energy Engineering | 20 | 23 | 3 | 20 | structure mismatch |
| D020 Environmental Engineering | 20 | 23 | 3 | 20 | structure mismatch |
| D116 Heavy Equipment, Earthmoving | 20 | 16 | 0 | 20 | structure mismatch, no subgroups |
| D120 Fisheries, Aquaculture | 20 | 21 | 2 | 20 | structure mismatch |
| D158 Corporate Finance, Investment Banking | 20 | 19 | 0 | 20 | structure mismatch, no subgroups |
| D060 Banking, Credit | 21 | 24 | 5 | 21 | structure mismatch |
| D066 Veterinary Science | 21 | 23 | 3 | 21 | structure mismatch |
| D092 Culinary Arts, Catering | 21 | 23 | 3 | 21 | structure mismatch |
| D093 Electrical Installation, Wiring | 21 | 22 | 0 | 21 | structure mismatch, no subgroups |
| D153 Music Production | 21 | 30 | 3 | 21 | structure mismatch |
| D015 Accounting | 22 | 24 | 3 | 22 | structure mismatch |
| D021 Architecture | 22 | 13 | 2 | 21 | structure mismatch, unsourced roles |
| D083 Travel, Tourism | 22 | 23 | 2 | 22 | structure mismatch |
| D076 Maritime | 23 | 25 | 4 | 23 | structure mismatch |
| D080 Interior Design | 23 | 13 | 2 | 23 | structure mismatch |
| D098 Precision Engineering, Toolmaking | 23 | 24 | 3 | 23 | structure mismatch |
| D104 Pottery, Ceramics, Glass | 24 | 14 | 0 | 23 | structure mismatch, no subgroups, unsourced roles |
| D002 Data Engineering | 25 | 25 | 1 | 23 | unsourced roles |
| D007 UI/UX Design | 26 | 26 | 2 | 24 | unsourced roles |
| D026 Public Health | 26 | 26 | 5 | 19 | unsourced roles |
| D131 Motorsport Engineering | 26 | 19 | 2 | 26 | structure mismatch |
| D143 Forensic Science, Digital Forensics | 26 | 26 | 5 | 23 | unsourced roles |
| D069 Aviation | 27 | 29 | 3 | 27 | structure mismatch |
| D159 Credit Analysis, Structured Finance | 27 | 25 | 2 | 27 | structure mismatch |
| D106 Garment Making, Tailoring, Dressmaking | 28 | 21 | 0 | 27 | structure mismatch, no subgroups, unsourced roles |
| D115 Road Transport Operations (Drivers | 28 | 19 | 0 | 25 | structure mismatch, no subgroups, unsourced roles |
| D062 Trading | 29 | 28 | 2 | 29 | structure mismatch |
| D071 Sports Management | 31 | 46 | 2 | 31 | structure mismatch |
| D133 Luxury | 33 | 36 | 4 | 33 | structure mismatch |
| D016 Electrical | 35 | 33 | 2 | 33 | structure mismatch, unsourced roles |
| D040 Vocational | 35 | 36 | 3 | 35 | structure mismatch |
| D013 Investment Analysis | 36 | 38 | 2 | 35 | structure mismatch, unsourced roles |
| D102 Carpentry, Joinery, Wood Technology | 36 | 30 | 3 | 35 | structure mismatch, unsourced roles |
| D001 Software Engineering | 37 | 37 | 1 | 35 | unsourced roles |
| D009 Data Science | 38 | 38 | 3 | 36 | unsourced roles |
| D024 Nursing | 38 | 20 | 3 | 37 | structure mismatch, unsourced roles |
| D032 Project Management | 38 | 39 | 3 | 38 | structure mismatch |
| D044 Graphic Design | 38 | 36 | 3 | 38 | structure mismatch |
| D068 Allied Health | 38 | 40 | 2 | 38 | structure mismatch |
| D010 Business Intelligence | 39 | 39 | 4 | 37 | unsourced roles |
| D049 Automotive Engineering | 41 | 38 | 3 | 41 | structure mismatch |
| D053 Hospitality | 42 | 46 | 4 | 42 | structure mismatch |
| D041 Scientific Research | 43 | 45 | 2 | 42 | structure mismatch, unsourced roles |
| D111 Textile, Garment | 43 | 45 | 5 | 43 | structure mismatch |
| D114 Assembly, Packaging | 43 | 39 | 2 | 42 | structure mismatch, unsourced roles |
| D028 General Management | 45 | 44 | 3 | 45 | structure mismatch |
| D030 Marketing, Brand | 46 | 48 | 2 | 46 | structure mismatch |
| D075 Fashion, Textiles | 46 | 47 | 3 | 46 | structure mismatch |
| D023 Medicine | 49 | 12 | 3 | 48 | structure mismatch, unsourced roles |
| D055 Chemical Engineering | 49 | 50 | 3 | 49 | structure mismatch |
| D033 Product Management | 51 | 40 | 3 | 51 | structure mismatch |
| D110 Chemical, Rubber | 56 | 57 | 0 | 56 | structure mismatch, no subgroups |
| D022 Mining | 60 | 49 | 4 | 57 | structure mismatch, unsourced roles |
| D043 Journalism | 62 | 34 | 0 | 61 | structure mismatch, no subgroups, unsourced roles |
| D097 Welding, Fabrication, Blacksmithing | 63 | 63 | 0 | 63 | no subgroups |
| D107 Leather Technology, Shoemaking | 68 | 64 | 7 | 68 | structure mismatch |
| D085 Retail Sales, Shop Operations | 70 | 23 | 0 | 70 | structure mismatch, no subgroups |
| D045 Public Administration | 74 | 59 | 3 | 74 | structure mismatch |
| D046 Social Work | 77 | 75 | 3 | 77 | structure mismatch |
| D038 Compliance, Regulation | 78 | 65 | 4 | 78 | structure mismatch |
| D052 Construction Management | 83 | 84 | 4 | 83 | structure mismatch |
| D042 Media Production | 109 | 91 | 3 | 106 | structure mismatch, unsourced roles |
| D031 Sales | 122 | 59 | 4 | 122 | structure mismatch |
| D079 Customs, Trade | 137 | 23 | 2 | 137 | structure mismatch |
| D035 Logistics | 143 | 51 | 4 | 143 | structure mismatch |
| D034 Supply Chain Management | 157 | 60 | 4 | 157 | structure mismatch |
| D036 Procurement | 170 | 38 | 3 | 170 | structure mismatch |

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

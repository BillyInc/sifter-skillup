# Career role completeness report

This report measures the cleaned canonical role library and the exact source joins in role_tools.json.
A role is not treated as complete merely because it has a name: source ownership, tools and competencies are measured separately.

## Overall coverage

- Canonical role keys: **3969**
- Exact ESCO occupation matches: **3507 (88.4%)**
- Exact detailed O*NET tool matches: **3173 (79.9%)**
- Exact detailed O*NET competency matches: **3185 (80.2%)**
- ESCO skill records: **3507 (88.4%)**
- Specialist framework signals: **561 (14.1%)**
- Any source signal: **3969 (100.0%)**
- Roles without a source signal: **0**

ESCO and O*NET are kept as separate evidence. O*NET joins use exact detailed SOC codes; ISCO groups are used only for subgroup placement, never for copying competencies.

## Priority domains

| Domain | Canonical roles | Structure roles | Subgroups | ESCO | O*NET tools | O*NET competencies | Framework | Any signal |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| D139 Game Design | 42 | 9 | 3 | 27 | 23 | 23 | 14 | 42 |
| D140 Robotics Engineering and Systems Design | 20 | 3 | 4 | 15 | 14 | 15 | 13 | 20 |
| D141 Quantum Computing and Quantum Information | 19 | 7 | 5 | 0 | 0 | 0 | 19 | 19 |
| D155 Nanotechnology and Advanced Materials | 16 | 1 | 3 | 8 | 7 | 7 | 8 | 16 |
| D163 Intellectual Property Law and Patent Practice | 7 | 2 | 5 | 6 | 3 | 4 | 5 | 7 |
| D167 Extended Reality (XR) and Immersive Technology | 13 | 1 | 7 | 7 | 5 | 5 | 13 | 13 |
| D168 Esports and Creator Economy | 15 | 7 | 6 | 4 | 5 | 5 | 15 | 15 |

Interpretation:
- D139 and D140 now reconcile their structure counts with the cleaned role layer; the new roles are framework-backed and remain separate from ESCO/O*NET matches.
- D141 is backed by the European Competence Framework for Quantum Technologies v3.0; its framework evidence remains separate from ESCO/O*NET joins.
- D167 and D168 now have canonical framework-backed roles and subgroups; their roles are not incorrectly labelled as ESCO/O*NET occupations.
- D155 and D163 are thin-domain review candidates and should not receive guessed roles or inherited tools.

## Domains requiring review

The following domains are flagged because they have fewer than five roles, a source gap, or a role-count mismatch between structure and canonical data. Domains without a supported subgroup taxonomy intentionally use direct domain-to-role navigation.

| Domain | Roles | Structure roles | Subgroups | Any source | Reason |
|---|---:|---:|---:|---:|---|
| D037 Legal Practice | 0 | 0 | 3 | 0 | thin role count, empty canonical role layer |
| D039 Higher Education and Academic Research | 0 | 0 | 2 | 0 | thin role count, empty canonical role layer |
| D040 Vocational and Technical Training | 0 | 0 | 3 | 0 | thin role count, empty canonical role layer |
| D045 Public Administration and Policy | 0 | 0 | 3 | 0 | thin role count, empty canonical role layer |
| D049 Automotive Engineering | 0 | 0 | 3 | 0 | thin role count, empty canonical role layer |
| D050 Industrial Automation | 0 | 0 | 3 | 0 | thin role count, empty canonical role layer |
| D052 Construction Management | 0 | 0 | 4 | 0 | thin role count, empty canonical role layer |
| D053 Hospitality Services and Management | 0 | 0 | 3 | 0 | thin role count, empty canonical role layer |
| D054 Oil and Gas Operations | 0 | 0 | 4 | 0 | thin role count, empty canonical role layer |
| D071 Sports Management | 0 | 0 | 4 | 0 | thin role count, empty canonical role layer |
| D075 Fashion and Textiles | 0 | 0 | 7 | 0 | thin role count, empty canonical role layer |
| D076 Maritime and Naval Operations | 0 | 0 | 4 | 0 | thin role count, empty canonical role layer |
| D079 Customs and International Trade | 0 | 0 | 2 | 0 | thin role count, empty canonical role layer |
| D080 Interior and Spatial Design | 0 | 0 | 2 | 0 | thin role count, empty canonical role layer |
| D153 Music Production | 0 | 0 | 3 | 0 | thin role count, empty canonical role layer |
| D157 Tax Advisory and Transfer Pricing | 0 | 0 | 2 | 0 | thin role count, empty canonical role layer |
| D038 Compliance, Regulation and Governance | 1 | 1 | 4 | 1 | thin role count |
| D055 Chemical Engineering | 3 | 3 | 3 | 3 | thin role count |
| D065 Translation, Interpretation and Linguistics | 4 | 4 | 4 | 4 | thin role count |
| D163 Intellectual Property Law and Patent Practice | 7 | 2 | 5 | 7 | structure mismatch |
| D051 Real Estate | 8 | 2 | 4 | 8 | structure mismatch |
| D132 Space Science and Exploration | 8 | 0 | 2 | 8 | structure mismatch |
| D162 Immigration Law and Asylum | 8 | 1 | 4 | 8 | structure mismatch |
| D137 Medical Physics and Radiation Therapy | 9 | 3 | 4 | 9 | structure mismatch |
| D150 Religious Ministry, Theology and Interfaith Leadership | 9 | 2 | 3 | 9 | structure mismatch |
| D125 Medical Secretarial | 10 | 3 | 3 | 10 | structure mismatch |
| D059 Space Technology and Satellite Systems | 11 | 7 | 3 | 11 | structure mismatch |
| D156 Land Surveying and Cadastral Mapping | 11 | 3 | 3 | 11 | structure mismatch |
| D041 Scientific Research | 12 | 10 | 2 | 12 | structure mismatch |
| D044 Graphic Design | 12 | 4 | 3 | 12 | structure mismatch |
| D046 Social Work and Community Development | 12 | 10 | 3 | 12 | structure mismatch |
| D067 Dentistry | 12 | 11 | 3 | 12 | structure mismatch |
| D126 Complementary, Alternative and Traditional Medicine | 12 | 10 | 2 | 12 | structure mismatch |
| D145 Neuroscience, Cognitive Science and Brain-Computer Interfaces | 12 | 0 | 3 | 12 | structure mismatch |
| D149 Diplomacy and International Relations | 12 | 3 | 3 | 12 | structure mismatch |
| D160 Fashion Styling, Image Consulting and Personal Shopping | 12 | 0 | 6 | 12 | structure mismatch |
| D123 Radiography and Medical Imaging | 13 | 6 | 2 | 13 | structure mismatch |
| D146 Building Services Engineering (Mechanical and Electrical Systems) | 13 | 8 | 5 | 13 | structure mismatch |
| D152 Museums, Cultural Heritage, Archives and Archaeology | 13 | 2 | 8 | 13 | structure mismatch |
| D167 Extended Reality (XR) and Immersive Technology | 13 | 1 | 7 | 13 | structure mismatch |
| D012 FinTech Engineering | 14 | 9 | 4 | 14 | structure mismatch |
| D057 Digital Health and Health Technology | 14 | 12 | 4 | 14 | structure mismatch |
| D144 Climate Science and Meteorology | 14 | 0 | 2 | 14 | structure mismatch |
| D166 Autonomous Vehicles and Self-Driving Systems | 14 | 0 | 4 | 14 | structure mismatch |
| D008 Telecommunications and Network Engineering | 15 | 12 | 4 | 15 | structure mismatch |
| D084 Payroll and Bookkeeping | 15 | 11 | 2 | 15 | structure mismatch |
| D096 Agricultural Machinery and Farm Operations | 15 | 11 | 3 | 15 | structure mismatch |
| D105 Handicrafts, Basketry and Textile Crafts | 15 | 10 | 1 | 15 | structure mismatch |
| D135 Nuclear Engineering and Radiation Science | 15 | 6 | 4 | 15 | structure mismatch |
| D138 Biomedical Engineering | 15 | 4 | 5 | 15 | structure mismatch |
| D147 Industrial Process Automation (SCADA and PLC Systems) | 15 | 3 | 5 | 15 | structure mismatch |
| D165 Wellness Coaching and Lifestyle Medicine | 15 | 0 | 3 | 15 | structure mismatch |
| D168 Esports and Creator Economy | 15 | 7 | 6 | 15 | structure mismatch |
| D014 Actuarial Science | 16 | 14 | 3 | 16 | structure mismatch |
| D155 Nanotechnology and Advanced Materials | 16 | 1 | 3 | 16 | structure mismatch |
| D004 Cybersecurity | 17 | 15 | 2 | 17 | structure mismatch |
| D005 Cloud Computing and DevOps | 17 | 15 | 3 | 17 | structure mismatch |
| D063 Economics and Policy Analysis | 17 | 16 | 3 | 17 | structure mismatch |
| D082 Customer Service and Contact Centre Operations | 17 | 13 | 2 | 17 | structure mismatch |
| D124 Community Health Extension | 17 | 11 | 2 | 17 | structure mismatch |
| D130 Recruitment and Employment Services | 17 | 3 | 6 | 17 | structure mismatch |
| D154 Exercise Science and Sports Therapy | 17 | 1 | 3 | 17 | structure mismatch |
| D148 Offshore and Subsea Engineering | 18 | 0 | 2 | 18 | structure mismatch |
| D161 Humanitarian Aid, Emergency Response and International Development | 18 | 3 | 10 | 18 | structure mismatch |
| D141 Quantum Computing and Quantum Information | 19 | 7 | 5 | 19 | structure mismatch |
| D025 Pharmacy | 20 | 17 | 6 | 20 | structure mismatch |
| D058 Education Technology and Learning Experience Design | 20 | 2 | 4 | 20 | structure mismatch |
| D064 Psychology and Counselling | 20 | 19 | 4 | 20 | structure mismatch |
| D081 Office Administration and Secretarial Services | 20 | 17 | 5 | 20 | structure mismatch |
| D095 Motor Vehicle Mechanics and Repairs | 20 | 11 | 5 | 20 | structure mismatch |
| D099 Masonry, Bricklaying, Tiling and Plastering | 20 | 18 | 3 | 20 | structure mismatch |
| D103 Jewellery Making and Goldsmithing | 20 | 16 | 7 | 20 | structure mismatch |
| D116 Heavy Equipment and Earthmoving Operations | 20 | 5 | 1 | 20 | structure mismatch |
| D117 Railway | 20 | 10 | 8 | 20 | structure mismatch |
| D122 Medical Laboratory Technology | 20 | 1 | 4 | 20 | structure mismatch |
| D127 Early Childhood Education, Nursery and Childcare | 20 | 1 | 5 | 20 | structure mismatch |
| D128 Social Welfare and Youth Services | 20 | 10 | 5 | 20 | structure mismatch |
| D134 Naval Architecture and Marine Engineering | 20 | 4 | 6 | 20 | structure mismatch |
| D136 Aeronautical and Aerospace Engineering | 20 | 0 | 7 | 20 | structure mismatch |
| D140 Robotics Engineering and Systems Design | 20 | 3 | 4 | 20 | structure mismatch |
| D151 Criminology, Criminal Justice and Corrections | 20 | 0 | 7 | 20 | structure mismatch |
| D164 Urban Mobility and Smart City Systems | 20 | 4 | 5 | 20 | structure mismatch |
| D047 Agricultural Science | 21 | 18 | 4 | 21 | structure mismatch |
| D061 Insurance | 21 | 15 | 6 | 21 | structure mismatch |
| D119 Livestock, Poultry and Dairy Production | 21 | 15 | 6 | 21 | structure mismatch |
| D121 Forestry and Wildlife Management | 21 | 2 | 13 | 21 | structure mismatch |
| D158 Corporate Finance and Investment Banking | 21 | 1 | 2 | 21 | structure mismatch |
| D015 Accounting | 22 | 21 | 3 | 22 | structure mismatch |
| D060 Banking and Credit Services | 22 | 19 | 4 | 22 | structure mismatch |
| D143 Forensic Science, Digital Forensics and Criminal Investigation | 22 | 1 | 4 | 22 | structure mismatch |
| D021 Architecture and Urban Planning | 23 | 21 | 2 | 23 | structure mismatch |
| D120 Fisheries and Aquaculture | 23 | 2 | 3 | 23 | structure mismatch |
| D078 Social Sciences | 24 | 20 | 2 | 24 | structure mismatch |
| D083 Travel and Tourism | 24 | 22 | 2 | 24 | structure mismatch |
| D098 Precision Engineering and Toolmaking | 24 | 11 | 3 | 24 | structure mismatch |
| D104 Pottery, Ceramics and Glasswork | 24 | 17 | 1 | 24 | structure mismatch |
| D002 Data Engineering and Architecture | 25 | 14 | 1 | 25 | structure mismatch |
| D020 Environmental Engineering | 25 | 24 | 3 | 25 | structure mismatch |
| D056 Blockchain and Decentralised Systems | 25 | 2 | 1 | 25 | structure mismatch |
| D118 Crop Production and Horticulture | 25 | 2 | 2 | 25 | structure mismatch |
| D007 User Interface and User Experience Design | 26 | 21 | 2 | 26 | structure mismatch |
| D026 Public Health | 26 | 25 | 5 | 26 | structure mismatch |
| D131 Motorsport Engineering | 26 | 0 | 3 | 26 | structure mismatch |
| D069 Aviation and Aerospace Operations | 27 | 26 | 3 | 27 | structure mismatch |
| D159 Credit Analysis and Structured Finance | 27 | 5 | 2 | 27 | structure mismatch |
| D106 Garment Making, Tailoring and Dressmaking | 28 | 25 | 1 | 28 | structure mismatch |
| D115 Road Transport and Driving Operations | 28 | 1 | 1 | 28 | structure mismatch |
| D062 Trading | 30 | 27 | 2 | 30 | structure mismatch |
| D077 Security Services | 31 | 29 | 2 | 31 | structure mismatch |
| D133 Luxury & Bespoke Specialist Interiors | 33 | 10 | 4 | 33 | structure mismatch |
| D013 Investment Analysis and Asset Management | 36 | 32 | 2 | 36 | structure mismatch |
| D102 Carpentry, Joinery, Wood Technology and Furniture Making | 36 | 30 | 3 | 36 | structure mismatch |
| D142 Bioinformatics and Computational Biology | 36 | 0 | 1 | 36 | structure mismatch |
| D001 Software Engineering | 37 | 31 | 1 | 37 | structure mismatch |
| D009 Data Science | 38 | 25 | 3 | 38 | structure mismatch |
| D016 Electrical Engineering | 38 | 37 | 2 | 38 | structure mismatch |
| D024 Nursing | 38 | 35 | 3 | 38 | structure mismatch |
| D068 Allied Health and Rehabilitation Therapies | 38 | 31 | 2 | 38 | structure mismatch |
| D010 Business Intelligence and Analytics | 39 | 27 | 4 | 39 | structure mismatch |
| D032 Project and Programme Management | 40 | 29 | 3 | 40 | structure mismatch |
| D139 Game Design | 42 | 9 | 3 | 42 | structure mismatch |
| D111 Textile and Garment Machine Operations | 43 | 40 | 6 | 43 | structure mismatch |
| D114 Assembly and Packaging Operations | 43 | 0 | 1 | 43 | structure mismatch |
| D048 Food Science | 44 | 40 | 4 | 44 | structure mismatch |
| D017 Mechanical Engineering | 45 | 40 | 2 | 45 | structure mismatch |
| D028 General Management | 45 | 38 | 3 | 45 | structure mismatch |
| D027 Biomedical Science | 46 | 26 | 3 | 46 | structure mismatch |
| D030 Marketing and Brand Management | 47 | 42 | 2 | 47 | structure mismatch |
| D023 Medicine | 49 | 47 | 3 | 49 | structure mismatch |
| D036 Procurement and Contract Management | 49 | 16 | 3 | 49 | structure mismatch |
| D033 Product Management | 51 | 24 | 3 | 51 | structure mismatch |
| D110 Chemical, Rubber and Plastics Plant Operations | 56 | 50 | 1 | 56 | structure mismatch |
| D022 Mining and Geosciences | 62 | 58 | 4 | 62 | structure mismatch |
| D043 Journalism and Digital Publishing | 62 | 36 | 1 | 62 | structure mismatch |
| D097 Welding, Fabrication and Blacksmithing | 63 | 57 | 1 | 63 | structure mismatch |
| D018 Civil Engineering | 67 | 59 | 2 | 67 | structure mismatch |
| D107 Leatherworking, Shoemaking and Leather Goods | 68 | 62 | 11 | 68 | structure mismatch |
| D085 Retail Sales and Shop Operations | 70 | 69 | 1 | 70 | structure mismatch |
| D042 Media Production and Broadcasting | 103 | 95 | 6 | 103 | structure mismatch |
| D031 Sales and Business Development | 124 | 108 | 4 | 124 | structure mismatch |
| D035 Logistics and Transportation Operations | 144 | 136 | 4 | 144 | structure mismatch |
| D034 Supply Chain Management | 158 | 132 | 4 | 158 | structure mismatch |

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

# Domain learning-journey evidence checkpoint — 2026-10-03

This is a progress checkpoint, not a sign-off. The existing catalogue is treated as unverified input. It does not audit subgroup/role taxonomy fit, and it does not regenerate seeds or apply SQL.

- Active domains scanned: **167**
- Explicit domain-owned foundation records currently approved in the source ledger: **136**
- Role-aggregated foundation records excluded from domain requirements: **30,477**
- Domain student items emitted by the corrected builder: **136**
- Of those, item-specific learning links: **1**
- Active domains with no generated domain-owned items: **145**
- Unreviewed named credential candidates: **240**
- Domain tool candidates still needing ownership/use-case review: **3866**

## Work completed in this tranche

- Removed the builder’s arbitrary ‘first three skills + first three competencies’ domain promotion and list-order prerequisite edges.
- Domain-owned foundation candidates now require an approved, source-backed domain ownership record and a resolvable source reference.
- Domain foundations are not presented as a ranked sequence until a source supports the order or relationship.
- Domain credential candidates now require an exact domain-and-credential source review before student-context emission; a broad domain source is insufficient.
- Added tests for ownership, source references, credential evidence, and fabricated ordering.

## Still required for the intended learner journey

This tranche does **not** yet provide the requested complete journey. The source search and structured enrichment must establish, for every active domain and downstream path: the learning stages, why each item matters, the category (skill / competency / tool / certification), whether it is needed or useful/optional, which items work together or build on others, and an authoritative item-specific learning source. The current 136 approved foundation rows span only a subset of domains, and 135 currently have no item-specific learning link. No default priority, popularity count, skill name, or legacy category is proof of a student requirement.

The exact per-domain coverage queue is in the accompanying JSON. This should be enriched by domain in source-backed batches, then joined to each JAMB programme through its verified CCMAS/external scope. Do not promote the current item list as complete or actionable until that reconciliation and display audit passes.

## Authoritative source checks started

- Computer-science curriculum structure: ACM/IEEE-CS/AAAI CS2023 identifies knowledge areas and core/recommended topics; it is curriculum guidance, not a universal job checklist: https://csed.acm.org/ and https://csed.acm.org/knowledge-areas/.
- Quantitative-finance learning example: CFA Institute’s official Practical Skills Modules describe Python fundamentals, financial modeling, Python/data science/AI, and portfolio construction, with stated prerequisites and practical outputs: https://www.cfainstitute.org/programs/cfa-program/candidate-resources/practical-skills-modules and https://www.cfainstitute.org/programs/cfa-program/candidate-resources/practical-skills-modules/python-data-science-and-ai.
- Automated-driving example: SAE J3016 defines driving-automation levels as a system taxonomy; it does not prescribe a student sequence: https://www.sae.org/standards/content/j3016_201609/.
- Standards boundary: ISO 26262 is a functional-safety standard, not a personal certification: https://www.iso.org/standard/68384.html.
- Platform boundary: NVIDIA describes TensorRT as NVIDIA/CUDA-based inference tooling; it is an optional platform route, not a universal autonomy prerequisite: https://developer.nvidia.com/tensorrt.
- Simulation/project context: CARLA documents simulated driving scenarios, sensors, traffic, and Python/C++ APIs: https://carla.readthedocs.io/en/latest/start_introduction/ and https://carla.readthedocs.io/en/latest/adv_agents/.
- These sources validate examples and the evidence method; they do not close the all-domain external-source audit.

## Per-domain deterministic coverage

| Domain | Approved domain foundations | Role-aggregated foundations excluded | Generated items | Learning links | Credential candidates | Tool candidates |
|---|---:|---:|---:|---:|---:|---:|
| D001 Software Engineering | 6 | 170 | 6 | 0 | 6 | 33 |
| D002 Data Engineering and Architecture | 6 | 149 | 6 | 0 | 5 | 34 |
| D003 Artificial Intelligence and Machine Learning | 6 | 45 | 6 | 0 | 6 | 33 |
| D004 Cybersecurity | 7 | 69 | 7 | 0 | 6 | 32 |
| D005 Cloud Computing and DevOps | 6 | 135 | 6 | 0 | 6 | 33 |
| D006 Internet of Things and Embedded Systems | 6 | 142 | 6 | 0 | 5 | 34 |
| D007 User Interface and User Experience Design | 0 | 163 | 0 | 0 | 0 | 32 |
| D008 Telecommunications and Network Engineering | 0 | 129 | 0 | 0 | 1 | 32 |
| D009 Data Science | 6 | 214 | 6 | 0 | 1 | 35 |
| D010 Business Intelligence and Analytics | 5 | 250 | 5 | 0 | 1 | 33 |
| D011 Quantitative Finance and Financial Engineering | 5 | 111 | 5 | 0 | 0 | 33 |
| D012 FinTech Engineering | 6 | 142 | 6 | 0 | 5 | 33 |
| D013 Investment Analysis and Asset Management | 0 | 141 | 0 | 0 | 0 | 32 |
| D014 Actuarial Science | 5 | 88 | 5 | 0 | 3 | 32 |
| D015 Accounting | 0 | 152 | 0 | 0 | 4 | 28 |
| D016 Electrical Engineering | 0 | 171 | 0 | 0 | 3 | 32 |
| D017 Mechanical Engineering | 0 | 212 | 0 | 0 | 2 | 32 |
| D018 Civil Engineering | 0 | 445 | 0 | 0 | 4 | 32 |
| D019 Renewable Energy Engineering | 0 | 130 | 0 | 0 | 1 | 32 |
| D020 Environmental Engineering | 0 | 171 | 0 | 0 | 1 | 32 |
| D021 Architecture and Urban Planning | 0 | 128 | 0 | 0 | 2 | 32 |
| D022 Mining and Geosciences | 0 | 280 | 0 | 0 | 2 | 32 |
| D023 Medicine | 0 | 107 | 0 | 0 | 1 | 28 |
| D024 Nursing | 0 | 164 | 0 | 0 | 3 | 22 |
| D025 Pharmacy | 0 | 196 | 0 | 0 | 1 | 13 |
| D026 Public Health | 0 | 181 | 0 | 0 | 1 | 23 |
| D027 Biomedical Science | 0 | 298 | 0 | 0 | 2 | 32 |
| D028 General Management | 0 | 344 | 0 | 0 | 2 | 32 |
| D029 Human Resources | 0 | 121 | 0 | 0 | 0 | 31 |
| D030 Marketing and Brand Management | 0 | 290 | 0 | 0 | 0 | 32 |
| D031 Sales and Business Development | 0 | 455 | 0 | 0 | 0 | 32 |
| D032 Project and Programme Management | 0 | 332 | 0 | 0 | 0 | 32 |
| D033 Product Management | 0 | 407 | 0 | 0 | 0 | 32 |
| D034 Supply Chain Management | 0 | 524 | 0 | 0 | 1 | 31 |
| D035 Logistics and Transportation Operations | 0 | 445 | 0 | 0 | 0 | 31 |
| D036 Procurement and Contract Management | 0 | 423 | 0 | 0 | 0 | 31 |
| D037 Legal Practice | 0 | 184 | 0 | 0 | 1 | 31 |
| D038 Compliance, Regulation and Governance | 0 | 516 | 0 | 0 | 0 | 32 |
| D039 Higher Education and Academic Research | 0 | 511 | 0 | 0 | 1 | 30 |
| D040 Vocational and Technical Training | 0 | 197 | 0 | 0 | 1 | 31 |
| D041 Scientific Research | 5 | 256 | 5 | 0 | 0 | 32 |
| D042 Media Production and Broadcasting | 0 | 454 | 0 | 0 | 0 | 32 |
| D043 Journalism and Digital Publishing | 0 | 295 | 0 | 0 | 6 | 28 |
| D044 Graphic Design | 0 | 248 | 0 | 0 | 0 | 32 |
| D045 Public Administration and Policy | 0 | 443 | 0 | 0 | 1 | 32 |
| D046 Social Work and Community Development | 0 | 264 | 0 | 0 | 3 | 21 |
| D047 Agricultural Science | 0 | 338 | 0 | 0 | 1 | 32 |
| D048 Food Science | 0 | 400 | 0 | 0 | 1 | 32 |
| D049 Automotive Engineering | 0 | 235 | 0 | 0 | 2 | 32 |
| D050 Industrial Automation | 0 | 275 | 0 | 0 | 1 | 32 |
| D051 Real Estate | 0 | 197 | 0 | 0 | 3 | 22 |
| D052 Construction Management | 0 | 460 | 0 | 0 | 4 | 32 |
| D053 Hospitality Services and Management | 0 | 245 | 0 | 0 | 1 | 27 |
| D054 Oil and Gas Operations | 0 | 141 | 0 | 0 | 2 | 17 |
| D055 Chemical Engineering | 0 | 364 | 0 | 0 | 2 | 32 |
| D056 Blockchain and Decentralised Systems | 6 | 175 | 6 | 0 | 3 | 32 |
| D057 Digital Health and Health Technology | 0 | 70 | 0 | 0 | 0 | 32 |
| D058 Education Technology and Learning Experience Design | 0 | 182 | 0 | 0 | 3 | 23 |
| D059 Space Technology and Satellite Systems | 0 | 97 | 0 | 0 | 3 | 21 |
| D060 Banking and Credit Services | 0 | 147 | 0 | 0 | 0 | 31 |
| D061 Insurance | 0 | 145 | 0 | 0 | 2 | 25 |
| D062 Trading | 0 | 117 | 0 | 0 | 0 | 32 |
| D063 Economics and Policy Analysis | 6 | 105 | 6 | 0 | 2 | 22 |
| D064 Psychology and Counselling | 0 | 200 | 0 | 0 | 1 | 19 |
| D065 Translation, Interpretation and Linguistics | 0 | 123 | 0 | 0 | 4 | 8 |
| D066 Veterinary Science | 0 | 100 | 0 | 0 | 2 | 13 |
| D067 Dentistry | 0 | 71 | 0 | 0 | 2 | 7 |
| D068 Allied Health and Rehabilitation Therapies | 0 | 253 | 0 | 0 | 0 | 27 |
| D069 Aviation and Aerospace Operations | 0 | 160 | 0 | 0 | 0 | 18 |
| D070 Performing Arts and Entertainment | 7 | 62 | 7 | 0 | 0 | 36 |
| D071 Sports Management | 0 | 192 | 0 | 0 | 0 | 21 |
| D072 Geospatial Science and Geographic Information Systems | 0 | 125 | 0 | 0 | 5 | 32 |
| D073 Libraries, Archives and Information Management | 0 | 134 | 0 | 0 | 1 | 23 |
| D074 Occupational Health and Safety | 0 | 163 | 0 | 0 | 5 | 23 |
| D075 Fashion and Textiles | 0 | 212 | 0 | 0 | 0 | 23 |
| D076 Maritime and Naval Operations | 0 | 173 | 0 | 0 | 1 | 32 |
| D077 Security Services | 0 | 224 | 0 | 0 | 0 | 30 |
| D078 Social Sciences | 7 | 130 | 7 | 1 | 0 | 33 |
| D079 Customs and International Trade | 0 | 299 | 0 | 0 | 1 | 27 |
| D080 Interior and Spatial Design | 0 | 165 | 0 | 0 | 0 | 32 |
| D081 Office Administration and Secretarial Services | 0 | 180 | 0 | 0 | 0 | 30 |
| D082 Customer Service and Contact Centre Operations | 0 | 145 | 0 | 0 | 0 | 30 |
| D083 Travel and Tourism | 0 | 135 | 0 | 0 | 0 | 18 |
| D084 Payroll and Bookkeeping | 0 | 94 | 0 | 0 | 4 | 26 |
| D085 Retail Sales and Shop Operations | 0 | 224 | 0 | 0 | 4 | 23 |
| D087 Hairdressing, Barbering and Hair Technology | 0 | 0 | 0 | 0 | 0 | 9 |
| D088 Beauty Therapy, Aesthetics and Spa Services | 0 | 0 | 0 | 0 | 0 | 9 |
| D089 Funeral and Mortuary Services | 0 | 0 | 0 | 0 | 0 | 7 |
| D090 Animal Care, Grooming and Pet Services | 0 | 72 | 0 | 0 | 1 | 14 |
| D091 Driving Instruction | 0 | 34 | 0 | 0 | 1 | 0 |
| D092 Culinary Arts, Catering and Food Service | 0 | 141 | 0 | 0 | 0 | 12 |
| D093 Electrical Installation, Wiring and Maintenance | 0 | 138 | 0 | 0 | 2 | 17 |
| D094 Electronics and ICT Equipment Servicing, Smart Systems Installation | 0 | 195 | 0 | 0 | 0 | 32 |
| D095 Motor Vehicle Mechanics and Repairs | 0 | 165 | 0 | 0 | 2 | 15 |
| D096 Agricultural Machinery and Farm Operations | 0 | 158 | 0 | 0 | 0 | 9 |
| D097 Welding, Fabrication and Blacksmithing | 0 | 296 | 0 | 0 | 4 | 18 |
| D098 Precision Engineering and Toolmaking | 0 | 176 | 0 | 0 | 0 | 32 |
| D099 Masonry, Bricklaying, Tiling and Plastering | 0 | 143 | 0 | 0 | 2 | 15 |
| D100 Plumbing, Pipefitting and Building Climate Systems | 0 | 0 | 0 | 0 | 0 | 13 |
| D101 Painting, Decorating and Surface Treatment | 0 | 0 | 0 | 0 | 0 | 6 |
| D102 Carpentry, Joinery, Wood Technology and Furniture Making | 0 | 226 | 0 | 0 | 0 | 13 |
| D103 Jewellery Making and Goldsmithing | 0 | 184 | 0 | 0 | 2 | 7 |
| D104 Pottery, Ceramics and Glasswork | 0 | 115 | 0 | 0 | 0 | 10 |
| D105 Handicrafts, Basketry and Textile Crafts | 0 | 135 | 0 | 0 | 0 | 6 |
| D106 Garment Making, Tailoring and Dressmaking | 0 | 121 | 0 | 0 | 0 | 14 |
| D107 Leatherworking, Shoemaking and Leather Goods | 0 | 204 | 0 | 0 | 0 | 32 |
| D108 Printing, Pre-press and Print Finishing | 0 | 0 | 0 | 0 | 0 | 12 |
| D109 Metal Processing, Foundry and Casting Operations | 0 | 100 | 0 | 0 | 0 | 9 |
| D110 Chemical, Rubber and Plastics Plant Operations | 0 | 357 | 0 | 0 | 3 | 9 |
| D111 Textile and Garment Machine Operations | 0 | 194 | 0 | 0 | 1 | 17 |
| D112 Wood, Pulp and Paper Processing | 0 | 95 | 0 | 0 | 0 | 13 |
| D113 Glass, Ceramics, Building Materials and Boiler Operations | 0 | 0 | 0 | 0 | 0 | 10 |
| D114 Assembly and Packaging Operations | 0 | 228 | 0 | 0 | 0 | 11 |
| D115 Road Transport and Driving Operations | 0 | 149 | 0 | 0 | 2 | 9 |
| D116 Heavy Equipment and Earthmoving Operations | 0 | 115 | 0 | 0 | 3 | 7 |
| D117 Railway | 0 | 198 | 0 | 0 | 1 | 10 |
| D118 Crop Production and Horticulture | 0 | 135 | 0 | 0 | 0 | 14 |
| D119 Livestock, Poultry and Dairy Production | 0 | 177 | 0 | 0 | 1 | 12 |
| D120 Fisheries and Aquaculture | 0 | 131 | 0 | 0 | 1 | 14 |
| D121 Forestry and Wildlife Management | 0 | 306 | 0 | 0 | 1 | 23 |
| D122 Medical Laboratory Technology | 0 | 153 | 0 | 0 | 3 | 15 |
| D123 Radiography and Medical Imaging | 0 | 90 | 0 | 0 | 2 | 10 |
| D124 Community Health Extension | 0 | 107 | 0 | 0 | 1 | 20 |
| D125 Medical Secretarial | 0 | 96 | 0 | 0 | 0 | 28 |
| D126 Complementary, Alternative and Traditional Medicine | 0 | 94 | 0 | 0 | 1 | 8 |
| D127 Early Childhood Education, Nursery and Childcare | 0 | 161 | 0 | 0 | 1 | 8 |
| D128 Social Welfare and Youth Services | 0 | 183 | 0 | 0 | 0 | 8 |
| D129 Military and Armed Forces Careers | 0 | 99 | 0 | 0 | 0 | 10 |
| D130 Recruitment and Employment Services | 0 | 159 | 0 | 0 | 4 | 28 |
| D131 Motorsport Engineering | 0 | 159 | 0 | 0 | 2 | 32 |
| D132 Space Science and Exploration | 0 | 75 | 0 | 0 | 0 | 27 |
| D133 Luxury and Bespoke Specialist Interiors | 0 | 233 | 0 | 0 | 0 | 20 |
| D134 Naval Architecture and Marine Engineering | 0 | 247 | 0 | 0 | 2 | 15 |
| D135 Nuclear Engineering and Radiation Science | 0 | 144 | 0 | 0 | 3 | 14 |
| D136 Aeronautical and Aerospace Engineering | 0 | 164 | 0 | 0 | 2 | 32 |
| D137 Medical Physics and Radiation Therapy | 0 | 126 | 0 | 0 | 1 | 17 |
| D138 Biomedical Engineering | 0 | 236 | 0 | 0 | 2 | 32 |
| D139 Game Design | 0 | 271 | 0 | 0 | 0 | 32 |
| D140 Robotics Engineering and Systems Design | 6 | 169 | 6 | 0 | 2 | 35 |
| D141 Quantum Computing and Quantum Information | 9 | 34 | 9 | 0 | 0 | 12 |
| D142 Bioinformatics and Computational Biology | 7 | 248 | 7 | 0 | 2 | 32 |
| D143 Forensic Science, Digital Forensics and Criminal Investigation | 0 | 132 | 0 | 0 | 0 | 32 |
| D144 Climate Science and Meteorology | 6 | 93 | 6 | 0 | 2 | 17 |
| D145 Neuroscience, Cognitive Science and Brain-Computer Interfaces | 0 | 112 | 0 | 0 | 0 | 19 |
| D146 Building Services Engineering (Mechanical and Electrical Systems) | 0 | 181 | 0 | 0 | 3 | 32 |
| D147 Industrial Process Automation (SCADA and PLC Systems) | 0 | 262 | 0 | 0 | 1 | 14 |
| D148 Offshore and Subsea Engineering | 0 | 132 | 0 | 0 | 2 | 32 |
| D149 Diplomacy and International Relations | 0 | 119 | 0 | 0 | 0 | 24 |
| D150 Religious Ministry, Theology and Interfaith Leadership | 0 | 70 | 0 | 0 | 0 | 10 |
| D151 Criminology, Criminal Justice and Corrections | 0 | 195 | 0 | 0 | 0 | 26 |
| D152 Museums, Cultural Heritage, Archives and Archaeology | 0 | 287 | 0 | 0 | 1 | 22 |
| D153 Music Production | 0 | 145 | 0 | 0 | 0 | 17 |
| D154 Exercise Science and Sports Therapy | 0 | 96 | 0 | 0 | 0 | 15 |
| D155 Nanotechnology and Advanced Materials | 0 | 135 | 0 | 0 | 1 | 13 |
| D156 Land Surveying and Cadastral Mapping | 0 | 109 | 0 | 0 | 5 | 32 |
| D157 Tax Advisory and Transfer Pricing | 0 | 136 | 0 | 0 | 6 | 28 |
| D158 Corporate Finance and Investment Banking | 0 | 158 | 0 | 0 | 5 | 30 |
| D159 Credit Analysis and Structured Finance | 0 | 183 | 0 | 0 | 2 | 31 |
| D160 Fashion Styling, Image Consulting and Personal Shopping | 0 | 195 | 0 | 0 | 0 | 17 |
| D161 Humanitarian Aid, Emergency Response and International Development | 0 | 303 | 0 | 0 | 2 | 7 |
| D162 Immigration Law and Asylum | 0 | 105 | 0 | 0 | 1 | 17 |
| D163 Intellectual Property Law and Patent Practice | 0 | 84 | 0 | 0 | 1 | 10 |
| D164 Urban Mobility and Smart City Systems | 0 | 219 | 0 | 0 | 5 | 31 |
| D165 Wellness Coaching and Lifestyle Medicine | 0 | 121 | 0 | 0 | 0 | 17 |
| D166 Autonomous Vehicles and Self-Driving Systems | 0 | 129 | 0 | 0 | 0 | 32 |
| D167 Extended Reality (XR) and Immersive Technology | 6 | 138 | 6 | 0 | 0 | 12 |
| D168 Esports and Creator Economy | 7 | 153 | 7 | 0 | 0 | 11 |

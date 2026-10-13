# JAMB compound display-name classification (2026-09-30)

This checkpoint covers only the 191 JAMB discovery candidates whose titles contain a compound separator or conjunction. It does not audit or modify downstream domains, subgroups, roles, UI, or SQL.

## Counts

- `compound_candidates`: **191**
- `dispositions`: **{'confirmed_combined_curriculum': 30, 'single_package_embedded_facet': 28, 'title_only_false_positive': 47, 'unresolved_named_component': 19, 'unresolved_named_facet': 62, 'unresolved_no_curriculum_evidence': 2, 'unsupported_named_facet': 3}**
- `rows_with_missing_exact_ccmas_alias`: **19**
- `rows_eligible_for_safe_annotation`: **191**
- `component_refs_added`: **0**

## Guardrail

A title is not treated as proof of a combined curriculum. A component is considered evidenced only when the current scope has selected course rows carrying that CCMAS package. Missing named packages are left unresolved; unsupported facets are recorded explicitly.

## Row dispositions

| Order | JAMB name | Disposition | Current components | Missing exact aliases | Source context |
|---:|---|---|---|---|---|
| 2 | Islamic Law/Sharia Law | `unresolved_named_facet` | Law::Common and Islamic Law | none | Law; 5 institutions |
| 3 | Common and Islamic Law | `title_only_false_positive` | Law::Common and Islamic Law | none | Law; 10 institutions |
| 4 | Public and International Law | `title_only_false_positive` | Law::Law | none | Law; 2 institutions |
| 5 | Criminology and Security Studies (printed under Law faculty block) | `title_only_false_positive` | Social Sciences::Criminology and Security Studies | none | Law; 1 institutions |
| 7 | Criminology and Penology | `single_package_embedded_facet` | Social Sciences::Criminology and Security Studies | none | Social/Management Sciences; 2 institutions |
| 9 | Criminology and Security Studies | `title_only_false_positive` | Social Sciences::Criminology and Security Studies | none | Social/Management Sciences; 63 institutions |
| 10 | Demography and Social Statistics | `title_only_false_positive` | Social Sciences::Demography and Social Statistics | none | Social/Management Sciences; 5 institutions |
| 11 | Demography and Statistics | `title_only_false_positive` | Social Sciences::Demography and Social Statistics | none | Social/Management Sciences; 1 institutions |
| 12 | Demography and Social Studies | `title_only_false_positive` | Social Sciences::Demography and Social Statistics | none | Social/Management Sciences; 1 institutions |
| 14 | Economics and Statistics | `confirmed_combined_curriculum` | Social Sciences::Economics, Sciences::Statistics | none | Social/Management Sciences; 1 institutions |
| 15 | Economics and Development Studies | `confirmed_combined_curriculum` | Social Sciences::Economics, Social Sciences::Development Studies | none | Social/Management Sciences; 2 institutions |
| 16 | Economics with/and Operation Research | `confirmed_combined_curriculum` | Social Sciences::Economics, Sciences::Industrial Mathematics | none | Social/Management Sciences; 1 institutions |
| 17 | Peace and Development Studies | `confirmed_combined_curriculum` | Social Sciences::Development Studies, Social Sciences::Peace Studies and Conflict Resolution | none | Social/Management Sciences; 2 institutions |
| 18 | Industrial Relations / Industrial and Labour Relations | `unresolved_named_facet` | Administration and Management::Employment and Human Resource Management | none | Social/Management Sciences; 3 institutions |
| 19 | Industrial Relations and Personnel Management / Industrial Relations and Human Resource Management | `single_package_embedded_facet` | Administration and Management::Employment and Human Resource Management | none | Social/Management Sciences; 6 institutions |
| 20 | Intelligence and Security Studies | `title_only_false_positive` | __custom__::Intelligence and Security Studies | none | Social/Management Sciences; 4 institutions |
| 22 | International Relations and Diplomacy | `single_package_embedded_facet` | Social Sciences::International Relations | none | Social/Management Sciences; 14 institutions |
| 23 | International Relations and Diplomatic Studies | `unresolved_named_facet` | Social Sciences::International Relations | none | Social/Management Sciences; 1 institutions |
| 25 | International Studies and Diplomacy | `unresolved_named_facet` | Social Sciences::International Relations | none | Administration, Social/Management Sciences; 2 institutions |
| 26 | International and Comparative Politics | `confirmed_combined_curriculum` | Social Sciences::International Relations, Social Sciences::Political Science | none | Social/Management Sciences; 1 institutions |
| 27 | International Relationship & Strategic Studies | `unresolved_named_facet` | Social Sciences::International Relations | none | Social/Management Sciences; 2 institutions |
| 28 | History and International Relations | `confirmed_combined_curriculum` | Social Sciences::International Relations, Arts::History/History and Diplomatic Studies | none | Social/Management Sciences; 1 institutions |
| 29 | History and International Studies | `confirmed_combined_curriculum` | Social Sciences::International Relations, Arts::History/History and Diplomatic Studies | none | Social/Management Sciences; 3 institutions |
| 30 | Policy and Strategic Studies | `single_package_embedded_facet` | Social Sciences::Political Science | none | Social/Management Sciences; 1 institutions |
| 31 | Policy and Administrative Studies | `confirmed_combined_curriculum` | Social Sciences::Political Science, Administration and Management::Public Administration | none | Social/Management Sciences; 1 institutions |
| 34 | Political Science / International Law and Diplomacy | `unsupported_named_facet` | Social Sciences::Political Science, Social Sciences::International Relations | none | Social/Management Sciences; 1 institutions |
| 35 | Political Science and Diplomacy | `confirmed_combined_curriculum` | Social Sciences::Political Science, Social Sciences::International Relations | none | Social/Management Sciences; 1 institutions |
| 36 | Political Science and Public Administration | `confirmed_combined_curriculum` | Social Sciences::Political Science, Administration and Management::Public Administration | none | Social/Management Sciences; 7 institutions |
| 37 | Political and Administrative Studies | `unresolved_named_facet` | Social Sciences::Political Science | none | Social/Management Sciences; 1 institutions |
| 38 | Political Science and International Relations | `confirmed_combined_curriculum` | Social Sciences::Political Science, Social Sciences::International Relations | none | Social/Management Sciences; 9 institutions |
| 39 | Political Science and International Studies | `confirmed_combined_curriculum` | Social Sciences::Political Science, Social Sciences::International Relations | none | Social/Management Sciences; 1 institutions |
| 40 | Political Science and Conflict Resolution | `confirmed_combined_curriculum` | Social Sciences::Political Science, Social Sciences::Peace Studies and Conflict Resolution | none | Social/Management Sciences; 1 institutions |
| 41 | Political Science and Defence Studies | `unresolved_named_facet` | Social Sciences::Political Science | none | Social/Management Sciences; 1 institutions |
| 42 | Peace Studies and Conflict Resolution | `title_only_false_positive` | Social Sciences::Peace Studies and Conflict Resolution | none | Social/Management Sciences; 22 institutions |
| 43 | Peace Strategic and Conflict Resolution | `confirmed_combined_curriculum` | Social Sciences::Peace Studies and Conflict Resolution, Social Sciences::International Relations | none | Social/Management Sciences; 1 institutions |
| 44 | Peace and Conflict Studies | `title_only_false_positive` | Social Sciences::Peace Studies and Conflict Resolution | none | Social/Management Sciences; 8 institutions |
| 47 | Public Administration and Local Govt | `unresolved_named_facet` | Administration and Management::Public Administration | none | Social/Management Sciences; 1 institutions |
| 48 | Public Administration and Policy Studies | `unresolved_named_facet` | Administration and Management::Public Administration | none | Social/Management Sciences; 2 institutions |
| 49 | Government and Public Administration | `confirmed_combined_curriculum` | Social Sciences::Political Science, Administration and Management::Public Administration | none | Social/Management Sciences; 2 institutions |
| 50 | Sociology and Anthroplogy | `unresolved_no_curriculum_evidence` | Social Sciences::Sociology, __custom__::Anthropology | none | Social/Management Sciences; 13 institutions |
| 52 | Sociology and Social Studies | `confirmed_combined_curriculum` | Social Sciences::Sociology, Social Sciences::Development Studies | none | Social/Management Sciences; 1 institutions |
| 53 | Banking and Finance | `title_only_false_positive` | Administration and Management::Finance / Banking and Finance | none | Administration; 55 institutions |
| 59 | Industrial Relations and Personnel Management | `single_package_embedded_facet` | Administration and Management::Employment and Human Resource Management | none | Administration; 14 institutions |
| 60 | Hotel and Tourism Management | `single_package_embedded_facet` | Administration and Management::Hospitality and Tourism Management | none | Administration; 2 institutions |
| 72 | Accounting and Finance | `confirmed_combined_curriculum` | Administration and Management::Finance / Banking and Finance, Administration and Management::Accounting | none | Administration, Social/Management Sciences; 2 institutions |
| 73 | Cooperative and Rural Development | `single_package_embedded_facet` | Administration and Management::Co-operative and Rural Development | none | Administration; 4 institutions |
| 74 | Logistics and Supply Chain Management | `title_only_false_positive` | Administration and Management::Logistics and Supply Chain Management | none | Administration; 4 institutions |
| 75 | Development and Communication Studies | `unresolved_named_facet` | Social Sciences::Development Studies | none | Administration; 4 institutions |
| 76 | Transport and Logistics Management | `single_package_embedded_facet` | Administration and Management::Transport Management | none | Administration; 3 institutions |
| 77 | Insurance and Actuarial Science | `confirmed_combined_curriculum` | Administration and Management::Insurance, Administration and Management::Actuarial Science | none | Administration; 3 institutions |
| 78 | Office and Information Technology / Information Resource Management | `unresolved_named_facet` | Administration and Management::Information Resource Management | none | Administration; 3 institutions |
| 79 | Accountancy and Forensic Studies | `unresolved_named_facet` | Administration and Management::Accounting | none | Administration; 2 institutions |
| 80 | Finance and Investment | `single_package_embedded_facet` | Administration and Management::Finance / Banking and Finance | none | Administration; 2 institutions |
| 81 | Securities and Investment | `title_only_false_positive` | Administration and Management::Securities and Investments Management | none | Administration; 2 institutions |
| 83 | Entrepreneurship and Innovation | `single_package_embedded_facet` | Administration and Management::Entrepreneurship | none | Administration; 2 institutions |
| 86 | Employment and Human Resource Management | `title_only_false_positive` | Administration and Management::Employment and Human Resource Management | none | Administration; 2 institutions |
| 87 | Accounting and Data Analytics | `unresolved_named_facet` | Administration and Management::Accounting | none | Administration; 1 institutions |
| 88 | Finance and Financial Technology | `single_package_embedded_facet` | Administration and Management::Finance / Banking and Finance | none | Administration; 1 institutions |
| 89 | Agribusiness and Economics | `unresolved_named_facet` | Social Sciences::Economics | none | Administration; 1 institutions |
| 91 | Cooperative Economics and Management | `single_package_embedded_facet` | Administration and Management::Co-operative and Rural Development | none | Administration; 1 institutions |
| 92 | Social Innovation and Entrepreneurship | `unresolved_named_facet` | Administration and Management::Entrepreneurship | none | Administration; 1 institutions |
| 93 | Entrepreneurship and Business Management | `title_only_false_positive` | Administration and Management::Entrepreneurship | none | Administration; 1 institutions |
| 94 | Transport and Tourism | `single_package_embedded_facet` | Administration and Management::Transport Management | none | Administration; 1 institutions |
| 98 | Industrial Relations and Human Resources Management | `unresolved_named_facet` | Administration and Management::Employment and Human Resource Management | none | Administration; 1 institutions |
| 99 | International Relations and Strategic Studies | `title_only_false_positive` | Social Sciences::International Relations | none | Administration; 1 institutions |
| 100 | Marketing and Consumer Studies | `unresolved_named_facet` | Administration and Management::Marketing | none | Administration; 1 institutions |
| 116 | Plant Science and Biotechnology | `unresolved_named_facet` | Sciences::Biotechnology | none | Sciences; 27 institutions |
| 122 | Environmental Management and Toxicology | `title_only_false_positive` | Sciences::Environmental Management and Toxicology | none | Sciences; 21 institutions |
| 126 | Animal and Environmental Biology | `unresolved_named_component` | Sciences::Zoology | Sciences::Biology | Sciences; 15 institutions |
| 129 | Mathematics with Statistics / Mathematics/Statistics / Mathematics and Statistics | `unresolved_named_component` | Sciences::Statistics | Sciences::Mathematics | Sciences; 11 institutions |
| 131 | Pure and Industrial Chemistry | `title_only_false_positive` | Sciences::Industrial Chemistry | none | Sciences; 7 institutions |
| 134 | Geology and Mining | `single_package_embedded_facet` | Sciences::Geology | none | Sciences; 5 institutions |
| 135 | Mathematics with Computer Science | `confirmed_combined_curriculum` | Computing::Computer Science, Sciences::Mathematics | none | Sciences; 5 institutions |
| 136 | Applied Microbiology and Brewing / Applied Microbiology | `unresolved_named_facet` | Sciences::Microbiology | none | Sciences; 5 institutions |
| 137 | Pure and Applied Chemistry | `title_only_false_positive` | Sciences::Chemistry | none | Sciences; 4 institutions |
| 140 | Genetics and Biotechnology | `single_package_embedded_facet` | Sciences::Biotechnology | none | Sciences; 4 institutions |
| 141 | Pure and Applied Mathematics | `title_only_false_positive` | Sciences::Mathematics | none | Sciences; 4 institutions |
| 142 | Computer Science and Information Technology | `unresolved_named_component` | Computing::Information Technology | Computing::Computer Science | Sciences; 4 institutions |
| 152 | Statistics and Data Sciences | `unresolved_named_component` | Computing::Data Science | Sciences::Statistics | Sciences; 3 institutions |
| 153 | Data Science and Analytics | `single_package_embedded_facet` | Computing::Data Science | none | Sciences; 3 institutions |
| 163 | Physics/Industrial Physics | `title_only_false_positive` | Sciences::Industrial Physics | none | Sciences; 2 institutions |
| 166 | Chemistry and Industrial Chemistry | `confirmed_combined_curriculum` | Sciences::Industrial Chemistry, Sciences::Chemistry | none | Sciences; 2 institutions |
| 168 | Plant Biology and Biotechnology | `unresolved_named_component` | Sciences::Biotechnology | Sciences::Biology | Sciences; 2 institutions |
| 171 | Mathematics and Economics / Mathematics with Economics | `unresolved_named_component` | Social Sciences::Economics | Sciences::Mathematics | Sciences; 2 institutions |
| 172 | Computer Science and Information Science | `title_only_false_positive` | Computing::Computer Science | none | Sciences; 2 institutions |
| 184 | CELL BIOLOGY & GENETICS | `single_package_embedded_facet` | Sciences::Biology | none | Sciences; 1 institutions |
| 186 | MARINE BIOLOGY & FISHERIES | `unresolved_named_component` | Sciences::Marine Science | Agricultural Science::Fisheries and Aquaculture, Sciences::Biology | Sciences; 1 institutions |
| 188 | Physics and Computer Electronic | `unresolved_named_facet` | Sciences::Physics with Electronics | none | Sciences; 1 institutions |
| 189 | Physics with Solar Energy | `unresolved_named_facet` | Sciences::Physics | none | Sciences; 1 institutions |
| 190 | Physics and Energy Studies | `unresolved_named_facet` | Sciences::Physics | none | Sciences; 1 institutions |
| 191 | Physics with Computational Modeling | `unresolved_named_facet` | Sciences::Physics | none | Sciences; 1 institutions |
| 192 | Physics/Astrology | `unresolved_named_facet` | Sciences::Physics | none | Sciences; 1 institutions |
| 193 | Physical Sciences (with options in i. Industrial Physics, ii. Physics with Electronics) | `confirmed_combined_curriculum` | Sciences::Industrial Physics, Sciences::Physics with Electronics | none | Sciences; 1 institutions |
| 194 | Physics and Applied Physics | `title_only_false_positive` | Sciences::Physics | none | Sciences; 1 institutions |
| 195 | Pure and Applied Physics | `title_only_false_positive` | Sciences::Physics | none | Sciences; 1 institutions |
| 197 | Pure and Industrial Physics | `title_only_false_positive` | Sciences::Industrial Physics | none | Sciences; 1 institutions |
| 198 | Industrial Physics with Renewable Energy | `unresolved_named_facet` | Sciences::Industrial Physics | none | Sciences; 1 institutions |
| 199 | Industrial Physics with Applied Geophysics | `confirmed_combined_curriculum` | Sciences::Applied Geophysics, Sciences::Industrial Physics | none | Sciences; 1 institutions |
| 200 | Industrial Physics with Electronics and IT Application | `unsupported_named_facet` | Sciences::Industrial Physics, Sciences::Physics with Electronics | none | Sciences; 1 institutions |
| 201 | Industrial Mathematics and Computer Science | `confirmed_combined_curriculum` | Sciences::Industrial Mathematics, Computing::Computer Science | none | Sciences; 1 institutions |
| 202 | Industrial Mathematics /Applied Statistics | `unresolved_named_component` | Sciences::Industrial Mathematics | Sciences::Statistics | Sciences; 1 institutions |
| 203 | Applied Mathematics with Statistics | `unresolved_named_component` | Sciences::Statistics | Sciences::Mathematics | Sciences; 1 institutions |
| 205 | Industral Mathematics/Computer | `unresolved_named_facet` | Sciences::Industrial Mathematics | none | Sciences; 1 institutions |
| 206 | Industrial Chemistry and Chemical Entrepreneurship | `unresolved_named_facet` | Sciences::Industrial Chemistry | none | Sciences; 1 institutions |
| 207 | Industrial and Environmental Chemistry | `title_only_false_positive` | Sciences::Chemistry | none | Sciences; 1 institutions |
| 208 | Brewing Science and Technology | `title_only_false_positive` | Sciences::Brewing Science and Technology | none | Sciences; 1 institutions |
| 210 | Geology and Mineral Sciences | `unresolved_named_facet` | Sciences::Geology | none | Sciences; 1 institutions |
| 211 | Geology and Geophysics | `unresolved_named_component` | Sciences::Applied Geophysics | Sciences::Geology | Sciences; 1 institutions |
| 212 | Geology and Applied Geophysics | `unresolved_named_component` | Sciences::Applied Geophysics | Sciences::Geology | Sciences; 1 institutions |
| 213 | Geology and Petroleum Studies | `unresolved_named_facet` | Sciences::Geology | none | Sciences; 1 institutions |
| 214 | Geology and Mineral Science | `unresolved_named_facet` | Sciences::Geology | none | Sciences; 1 institutions |
| 216 | Statistics with Demography | `title_only_false_positive` | Social Sciences::Demography and Social Statistics | none | Sciences; 1 institutions |
| 218 | Botany and Ecological Studies | `unresolved_named_facet` | Sciences::Botany | none | Sciences; 1 institutions |
| 219 | Plant Science and Forestry | `unresolved_named_component` | Sciences::Botany | Agricultural Science::Forest Resources and Wildlife Management | Sciences; 1 institutions |
| 220 | Plant Science and Microbiology | `unresolved_named_facet` | Sciences::Microbiology | none | Sciences; 1 institutions |
| 221 | Biotechnology and Food Technology | `unresolved_named_facet` | Sciences::Biotechnology | none | Sciences; 1 institutions |
| 222 | Zoology and Aquaculture | `single_package_embedded_facet` | Sciences::Zoology | none | Sciences; 1 institutions |
| 223 | Animal Biology and Environment | `unresolved_named_component` | Sciences::Zoology | Sciences::Biology | Sciences; 1 institutions |
| 225 | Conservation and Environmental Biology | `unresolved_named_facet` | Sciences::Biology | none | Sciences; 1 institutions |
| 227 | Environmental Biology and Fisheries | `unresolved_named_component` | Sciences::Biology | Agricultural Science::Fisheries and Aquaculture | Sciences; 1 institutions |
| 228 | Marine Science and Technology | `title_only_false_positive` | Sciences::Marine Science | none | Sciences; 1 institutions |
| 230 | Microbiology and Biotechnology | `unresolved_named_component` | Sciences::Biotechnology | Sciences::Microbiology | Sciences; 1 institutions |
| 231 | Microbiology/Parasitology | `unresolved_named_facet` | Sciences::Microbiology | none | Sciences; 1 institutions |
| 232 | Biology/Biotechnology | `unresolved_named_component` | Sciences::Biotechnology | Sciences::Biology | Sciences; 1 institutions |
| 233 | Microbiology and Industrial Biotechnology | `unresolved_named_component` | Sciences::Biotechnology | Sciences::Microbiology | Sciences; 1 institutions |
| 235 | Environmental Chemistry and Toxicology | `unresolved_named_facet` | Sciences::Chemistry | none | Sciences; 1 institutions |
| 236 | Computer, Information and Communication Science | `unresolved_named_facet` | Computing::Information and Communication Technology | none | Sciences; 1 institutions |
| 237 | Computer Science and Informatics | `unresolved_named_facet` | Computing::Computer Science | none | Sciences; 1 institutions |
| 238 | Computing and Artificial Intelligence | `single_package_embedded_facet` | Computing::Computer Science | none | Sciences; 1 institutions |
| 239 | Computer with Electronics | `unresolved_named_facet` | Computing::Computer Science | none | Sciences; 1 institutions |
| 240 | Software Engineering and Digital Entrepreneurship | `unresolved_named_facet` | Computing::Software Engineering | none | Sciences; 1 institutions |
| 245 | Dentistry and Dental Technology | `confirmed_combined_curriculum` | Medicine and Dentistry::Bachelor of Dental Surgery (BDS/BChD), Allied Health Sciences::Dental Technology | none | Medical/Pharmaceutical/Health; 33 institutions |
| 246 | Human Nutrition and Dietetics | `title_only_false_positive` | Allied Health Sciences::Human Nutrition and Dietetics | none | Medical/Pharmaceutical/Health; 34 institutions |
| 247 | Medical Laboratory Technology/Science | `title_only_false_positive` | Allied Health Sciences::Medical Laboratory Science | none | Medical/Pharmaceutical/Health; 133 institutions |
| 250 | Medicine and Surgery (Human Medicine) | `title_only_false_positive` | Medicine and Dentistry::Bachelor of Medicine and Bachelor of Surgery (MBBS/MBChB) | none | Medical/Pharmaceutical/Health; 103 institutions |
| 260 | Animal Breeding and Genetics | `single_package_embedded_facet` | Agricultural Science::Animal Science | none | Agriculture; 1 institutions |
| 264 | Family, Nutrition and Consumer Sciences | `unresolved_named_facet` | Agricultural Science::Family and Consumer Sciences | none | Agriculture; 1 institutions |
| 265 | Food Science with Business | `title_only_false_positive` | Agricultural Science::B.Sc./B.Tech Food Science and Technology | none | Agriculture; 1 institutions |
| 266 | Forestry and Fisheries | `confirmed_combined_curriculum` | Agricultural Science::Forest Resources and Wildlife Management, Agricultural Science::Fisheries and Aquaculture | none | Agriculture; 21 institutions |
| 267 | Forestry, Wildlife & Fisheries | `confirmed_combined_curriculum` | Agricultural Science::Forest Resources and Wildlife Management, Agricultural Science::Fisheries and Aquaculture | none | Agriculture; 2 institutions |
| 268 | Plant Breeding and Seed Technology | `unresolved_named_facet` | Agricultural Science::Crop Science | none | Agriculture; 2 institutions |
| 270 | Hotel Management & Tourism | `single_package_embedded_facet` | Administration and Management::Hospitality and Tourism Management | none | Agriculture; 6 institutions |
| 271 | Home Science, Nutrition and Dietetics | `unresolved_named_facet` | Agricultural Science::Family and Consumer Sciences | none | Agriculture; 1 institutions |
| 272 | Home Science & Management | `unresolved_named_facet` | Agricultural Science::Family and Consumer Sciences | none | Agriculture; 2 institutions |
| 274 | Arabic Language and Literature Studies | `title_only_false_positive` | Arts::Arabic | none | Arts and Humanities; 19 institutions |
| 280 | Linguistics/Edo | `single_package_embedded_facet` | Arts::Linguistics | none | Arts and Humanities; 1 institutions |
| 281 | English and Literary Studies | `title_only_false_positive` | Arts::English Language and Literature | none | Arts and Humanities; 36 institutions |
| 285 | Portuguese/English | `unsupported_named_facet` | Arts::English Language and Literature | none | Arts and Humanities; 6 institutions |
| 287 | French and German/Russian | `unresolved_named_component` | Arts::Modern European Languages B.A (French) | Arts::Modern European Languages (Russian), Arts::Modern European Languages B.A (German) | Arts and Humanities; 4 institutions |
| 288 | International Studies and | `unresolved_named_facet` | Social Sciences::International Relations | none | Arts and Humanities; 84 institutions |
| 290 | History and Strategic Studies | `confirmed_combined_curriculum` | Arts::History/History and Diplomatic Studies, Social Sciences::International Relations | none | Arts and Humanities; 8 institutions |
| 292 | African and Asian Studies | `unresolved_named_facet` | Arts::History/History and Diplomatic Studies | none | Arts and Humanities; 6 institutions |
| 295 | Russian with French/German | `unresolved_named_component` | Arts::Modern European Languages (Russian) | Arts::Modern European Languages B.A (French), Arts::Modern European Languages B.A (German) | Arts and Humanities; 3 institutions |
| 306 | Political Science and Conflict | `confirmed_combined_curriculum` | Social Sciences::Political Science, Social Sciences::Peace Studies and Conflict Resolution | none | Arts and Humanities; 12 institutions |
| 310 | Computer and Information Science | `title_only_false_positive` | Computing::Computer Science | none | Engineering/Environmental/Technology; 4 institutions |
| 311 | Polymer and Textile Engineering | `unresolved_named_facet` | Engineering::MATERIALS ENGINEERING | none | Engineering/Environmental/Technology; 2 institutions |
| 312 | Water Resources and Environmental Engr | `unresolved_named_facet` | Engineering::WATER RESOURCES ENGINEERING | none | Engineering/Environmental/Technology; 3 institutions |
| 313 | Petroleum and Gas Engineering | `title_only_false_positive` | Engineering::PETROLEUM AND GAS ENGINEERING | none | Engineering/Environmental/Technology; 12 institutions |
| 317 | Food Science and Engineering | `single_package_embedded_facet` | Engineering::FOOD SCIENCE AND TECHNOLOGY | none | Engineering/Environmental/Technology; 1 institutions |
| 322 | Urban and Regional Planning | `title_only_false_positive` | Environmental Sciences::Urban and Regional Planning | none | Engineering/Environmental/Technology; 60 institutions |
| 325 | Hotel Management and Tourism | `single_package_embedded_facet` | Administration and Management::Hospitality and Tourism Management | none | Engineering/Environmental/Technology; 1 institutions |
| 326 | Home Economics and Food Management | `unresolved_named_facet` | Agricultural Science::Family and Consumer Sciences | none | Engineering/Environmental/Technology; 1 institutions |
| 332 | Environmental Science and Technology | `unresolved_no_curriculum_evidence` | none | none | Sciences; 1 institutions |
| 335 | Food Science & Nutrition | `unresolved_named_facet` | Agricultural Science::B.Sc./B.Tech Food Science and Technology | none | Sciences; 1 institutions |
| 336 | Food Science and Technology | `title_only_false_positive` | Agricultural Science::B.Sc./B.Tech Food Science and Technology | none | Sciences; 6 institutions |
| 337 | Geography and Environmental Management | `confirmed_combined_curriculum` | Environmental Sciences::Geography, Environmental Sciences::Environmental Management | none | Sciences; 1 institutions |
| 338 | Geography and Geosciences | `confirmed_combined_curriculum` | Environmental Sciences::Geography, Sciences::Geology | none | Sciences; 2 institutions |
| 342 | Information and Media Studies | `title_only_false_positive` | Communication and Media Studies::INFORMATION AND MEDIA STUDIES — P12, P13, P14 | none | Administration; 1 institutions |
| 345 | Public Relations and Advertising | `single_package_embedded_facet` | Communication and Media Studies::PUBLIC RELATIONS — P12, P13, P14 | none | Administration; 4 institutions |
| 348 | Surveying and Geoinformatics | `title_only_false_positive` | Environmental Sciences::Surveying and Geoinformatics | none | Sciences; 1 institutions |
| 349 | Textile Science and Technology | `title_only_false_positive` | Environmental Sciences::Clothing and Textile Design | none | Sciences; 1 institutions |
| 350 | Film and Video Studies | `unresolved_named_facet` | Communication and Media Studies::FILM & MULTIMEDIA — P12, P13, P14 | none | Administration, Social/Management Sciences; 1 institutions |
| 356 | Ecology and Environmental Studies | `unresolved_named_facet` | Sciences::Biology | none | Sciences; 1 institutions |
| 357 | Parasitology and Entomology | `single_package_embedded_facet` | Sciences::Zoology | none | Sciences; 1 institutions |
| 361 | Applied and Renewable Energy | `unresolved_named_facet` | Sciences::Physics | none | Sciences; 1 institutions |
| 363 | Energy and Petroleum Studies | `unresolved_named_facet` | Sciences::Petroleum Chemistry | none | Sciences; 1 institutions |
| 382 | Home Economics and Hotel Management | `unresolved_named_facet` | Education::Home Economics | none | Education; 201 institutions |
| 385 | Library and Information Science | `title_only_false_positive` | Education::Library and Information Science | none | Education; 212 institutions |
| 386 | Education and Business Administration | `unresolved_named_facet` | Education::Business Education | none | Education; 3 institutions |
| 389 | Nursing/Nursing Science | `title_only_false_positive` | Allied Health Sciences::Nursing Sciences | none | Medical/Pharmaceutical/Health; 153 institutions |
| 393 | Electrical/Electronic Engineering | `title_only_false_positive` | Engineering::ELECTRICAL AND ELECTRONIC ENGINEERING | none | Engineering/Environmental/Technology; 87 institutions |
| 400 | Agricultural and Bio-Resources Engineering | `unresolved_named_facet` | Engineering::AGRICULTURAL AND BIOSYSTEMS ENGINEERING | none | Engineering/Environmental/Technology; 5 institutions |
| 405 | Drama/Dramatic Arts/Performing Arts | `unresolved_named_facet` | Arts::Theatre Arts | none | Arts and Humanities; 62 institutions |
| 406 | Fine Art/Fine and Applied Arts | `unresolved_named_facet` | Environmental Sciences::Fine and Applied Arts | none | Arts and Humanities; 18 institutions |
| 409 | Modern Language and Translation | `unresolved_named_facet` | Arts::Modern European Languages B.A (German) | none | Arts and Humanities; 4 institutions |
| 410 | Geography and Environmental Studies | `title_only_false_positive` | Environmental Sciences::Geography | none | Arts and Humanities; 4 institutions |
| 414 | Pasture & Range Management | `single_package_embedded_facet` | Agricultural Science::Animal Science | none | Agriculture; 1 institutions |
| 415 | Farm Management & Agric. Extension | `unresolved_named_facet` | Agricultural Science::Agricultural Extension | none | Agriculture; 4 institutions |
| 416 | Eco-Tourism and Wildlife Management | `unresolved_named_facet` | Agricultural Science::Forest Resources and Wildlife Management | none | Agriculture; 3 institutions |
| 417 | Environmental Management and Technology | `title_only_false_positive` | Environmental Sciences::Environmental Management | none | Agriculture; 2 institutions |
| 420 | Transport Planning and Management | `single_package_embedded_facet` | Administration and Management::Transport Management | none | Education; 1 institutions |

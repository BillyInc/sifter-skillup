# JAMB source-offering context inventory

This inventory preserves parsed offering occurrences as context rows; it does not assert that OCR/parser institution tokens are correct. Verify source faculty, exact programme spelling, and awarding institutions against the relevant official JAMB PDF table before updating mappings.

- Canonical identities: **420**.
- Parsed offering occurrences: **443** across **9** parsed source files.
- Manually source-confirmed occurrences: **1**.
- Total occurrence records: **444**; official-PDF verified: **340**.
- Exact canonical names without a parsed source occurrence: **0**.
- Parsed source names without an exact canonical identity: **0**.
- Identities with multiple parsed faculty contexts: **22**.
- Canonical mapping faculty absent from the parsed contexts: **29** (triage only; not a confirmed discrepancy until source table verification).

Full occurrence-level records, parser-token arrays, verified institution codes, source locators, and stable context IDs are in [`jamb_offering_context_inventory_2026-09-25.json`](jamb_offering_context_inventory_2026-09-25.json). Each occurrence carries its own `offering_row_verified_against_pdf` value and locator.

## Identities with multiple parsed faculty contexts

| JAMB identity | Mapping faculty | Parsed source contexts (faculty — source — institution tokens) |
|---|---|---|
| International Relations | Social/Management Sciences | Administration — Administration.pdf — 1 institution codes<br>Social/Management Sciences — Social Management Science.pdf — 59 institution codes |
| International Studies and Diplomacy | Social/Management Sciences | Administration — Administration.pdf — 1 institution codes<br>Social/Management Sciences — Social Management Science.pdf — 1 institution codes |
| Psychology | Social/Management Sciences | Arts and Humanities — arts_hum.txt — 4 institution codes<br>Social/Management Sciences — Social Management Science.pdf — 57 institution codes |
| Public Administration | Social/Management Sciences | Administration — Administration.pdf — 41 institution codes<br>Social/Management Sciences — Social Management Science.pdf — 75 institution codes |
| Public Administration and Local Govt | Social/Management Sciences | Social/Management Sciences — Social Management Science.pdf — 1 institution codes<br>Administration — Administration.pdf — 1 institution codes |
| Actuarial Science | Administration | Administration — Administration.pdf — 9 institution codes<br>Social/Management Sciences — Social Management Science.pdf — 9 institution codes |
| Accounting and Finance | Administration | Administration — Administration.pdf — 1 institution codes<br>Social/Management Sciences — Social Management Science.pdf — 1 institution codes |
| Computer Science | Sciences | Engineering/Environmental/Technology — engineering.txt — 126 institution codes<br>Sciences — Sciences.pdf — 224 institution codes |
| Statistics | Sciences | Engineering/Environmental/Technology — engineering.txt — 47 institution codes<br>Sciences — Sciences.pdf — 99 institution codes |
| Software Engineering | Sciences | Engineering/Environmental/Technology — engineering.txt — 14 institution codes<br>Sciences — Sciences.pdf — 86 institution codes |
| Biotechnology | Sciences | Agriculture — agriculture.txt — 21 institution codes<br>Sciences — Sciences.pdf — 24 institution codes |
| Plant Science | Sciences | Agriculture — agriculture.txt — 2 institution codes<br>Sciences — Sciences.pdf — 4 institution codes |
| Fisheries | Agriculture | Agriculture — agriculture.txt — 30 institution codes<br>Sciences — Sciences.pdf — 2 institution codes |
| Economics | Arts and Humanities | Administration — Administration.pdf — 7 institution codes<br>Arts and Humanities — arts_hum.txt — 21 institution codes<br>Engineering/Environmental/Technology — engineering.txt — 1 institution codes<br>Social/Management Sciences — Social Management Science.pdf — 192 institution codes |
| Mass Communication | Arts and Humanities | Administration — Administration.pdf — 8 institution codes<br>Arts and Humanities — arts_hum.txt — 13 institution codes |
| Sociology | Arts and Humanities | Arts and Humanities — arts_hum.txt — 12 institution codes<br>Social/Management Sciences — Social Management Science.pdf — 94 institution codes |
| Geography | Engineering/Environmental/Technology | Engineering/Environmental/Technology — engineering.txt — 10 institution codes<br>Sciences — Sciences.pdf — 11 institution codes |
| INFORMATION SCIENCE AND MEDIA STUDIES | unset | Sciences — Sciences.pdf — 2 institution codes<br>Social/Management Sciences — Social Management Science.pdf — 1 institution codes |
| Optometry | unset | Medical/Pharmaceutical/Health — medical.txt — 17 institution codes<br>Sciences — Sciences.pdf — 1 institution codes |
| Film and Video Studies | unset | Administration — Administration.pdf — 1 institution codes<br>Social/Management Sciences — Social Management Science.pdf — 1 institution codes |
| LIBRARY AND INFORMATION SCIENCE | Social/Management Sciences | Sciences — Sciences.pdf — 11 institution codes<br>Social/Management Sciences — Social Management Science.pdf — 16 institution codes |
| Sport Science | Education | Education — education.txt — 20 institution codes<br>Sciences — Sciences.pdf — 1 institution codes |

## Canonical faculty labels absent from parsed source contexts

These are source-reconciliation leads, not confirmed mapping errors. The original JAMB brochure heading and the specific awarding-institution table must be checked before deciding whether this is a naming normalization, parser issue, or wrong canonical faculty.

| JAMB identity | Canonical mapping faculty | Parsed faculty — source — institution-token count |
|---|---|---|
| Nursing/Nursing Science | Allied Health Sciences | Medical/Pharmaceutical/Health — medical.txt — 153 tokens |
| Pharmacy | Pharmacy and Pharmaceutical Sciences | Medical/Pharmaceutical/Health — medical.txt — 36 tokens |
| Physiology | Basic Medical Sciences | Medical/Pharmaceutical/Health — medical.txt — 60 tokens |
| Electrical Engineering | Engineering | Engineering/Environmental/Technology — engineering.txt — 19 tokens |
| Electrical/Electronic Engineering | Engineering | Engineering/Environmental/Technology — engineering.txt — 87 tokens |
| Electronics Engineering | Engineering | Engineering/Environmental/Technology — engineering.txt — 5 tokens |
| Mechanical Engineering | Engineering | Engineering/Environmental/Technology — engineering.txt — 96 tokens |
| Chemical Engineering | Engineering | Engineering/Environmental/Technology — engineering.txt — 53 tokens |
| Biomedical Engineering | Engineering | Engineering/Environmental/Technology — engineering.txt — 12 tokens |
| Mechatronics Engineering | Engineering | Engineering/Environmental/Technology — engineering.txt — 39 tokens |
| Agricultural Engineering | Engineering | Engineering/Environmental/Technology — engineering.txt — 33 tokens |
| Agricultural and Bio-Resources Engineering | Engineering | Engineering/Environmental/Technology — engineering.txt — 5 tokens |
| Production Engineering | Engineering | Engineering/Environmental/Technology — engineering.txt — 2 tokens |
| ICT Engineering | Engineering | Engineering/Environmental/Technology — engineering.txt — 1 tokens |
| Communication Technology | Engineering | Engineering/Environmental/Technology — engineering.txt — 2 tokens |
| Land Surveying | Environmental Sciences | Engineering/Environmental/Technology — engineering.txt — 4 tokens |
| Drama/Dramatic Arts/Performing Arts | Arts | Arts and Humanities — arts_hum.txt — 62 tokens |
| Fine Art/Fine and Applied Arts | Environmental Sciences | Arts and Humanities — arts_hum.txt — 18 tokens |
| Hausa | Arts | Arts and Humanities — arts_hum.txt — 22 tokens |
| Igbo | Arts | Arts and Humanities — arts_hum.txt — 16 tokens |
| Modern Language and Translation | Arts | Arts and Humanities — arts_hum.txt — 4 tokens |
| Geography and Environmental Studies | Environmental Sciences | Arts and Humanities — arts_hum.txt — 4 tokens |
| Crop Protection | Agricultural Science | Agriculture — agriculture.txt — 2 tokens |
| Animal Physiology | Agricultural Science | Agriculture — agriculture.txt — 1 tokens |
| Livestock Production Technology | Agricultural Science | Agriculture — agriculture.txt — 1 tokens |
| Pasture & Range Management | Agricultural Science | Agriculture — agriculture.txt — 1 tokens |
| Farm Management & Agric. Extension | Agricultural Science | Agriculture — agriculture.txt — 4 tokens |
| Eco-Tourism and Wildlife Management | Agricultural Science | Agriculture — agriculture.txt — 3 tokens |
| Environmental Management and Technology | Environmental Sciences | Agriculture — agriculture.txt — 2 tokens |

## Exact-name coverage gaps

Canonical names without any exact parsed source occurrence: none.

Parsed offering names without an exact canonical identity: none.

# D041 — Scientific Research: specialization review

**Disposition:** the two stored subgroup records are not student-visible (both are `excluded`) and neither represents an area of specialization as the user defines it. Do not expose either as-is. The natural-sciences field classifications below provide a provisional subject-field crosswalk, not a mandated six-subgroup answer. Resolve the root-domain scope and overlaps with the rest of the catalogue before canonicalizing any set.

## Current state

| Stored subgroup | Stored role count | Visibility | Audit finding |
|---|---:|---|---|
| Computational & Quantitative Science | 10 | Excluded | A cross-cutting methodology family, not a subject-matter specialization. Methods such as statistics, mathematical modelling and computation should attach to a field/role route only when source-backed. |
| Laboratory & Field Technicians | 1 | Excluded | A work-function/occupational grouping, not a subject-matter specialization. Laboratory and field methods belong inside the relevant disciplinary route unless the product deliberately creates a separate occupation taxonomy. |

The live inventory records **11 active role mappings**, **2 stored subgroup records**, and **0 visible subgroups**. Counts are state diagnostics, not evidence of the correct number of specializations. The parent description refers to research into the natural world, but “Scientific Research” can imply social, health, agricultural, engineering and humanities research too; several of those fields already have their own catalogue domains.

## Provisional subject-field crosswalk

OECD Frascati’s natural-sciences R&D classification and UNESCO ISCED-F’s subject-matter classification support checking these field families:

1. Mathematical and Statistical Sciences
2. Computer and Information Sciences Research
3. Physical Sciences Research
4. Chemical Sciences Research
5. Earth and Environmental Sciences Research
6. Biological Sciences Research

These six are candidates for an overlap/boundary review, not an approved count. Frascati also has an “other natural sciences” residual category; that statistical catch-all is not itself a student-facing specialization. The classification families may overlap with dedicated catalogue domains (computing, geospatial/climate/environmental, biomedical, bioinformatics, veterinary, agriculture and engineering). They must not be duplicated as learner paths until each boundary is reconciled.

## Computational coverage

The current computational report lists **11 role records**, **10 source-backed records**, and **0 explicit computational method links** for D041. Those numbers describe the present evidence coverage; they do not establish a computational subgroup, universal computational foundation, or role fit. Computational/statistical methods should be represented as contextual capabilities under the natural-science field and role where the actual task requires them. Computational research is not a role title unless a recognized occupation source establishes that occupation.

## Recommended next decision

First determine whether D041 is truly limited to **natural-sciences research**. If so, review a clearer student-facing parent name such as “Natural Sciences Research” and crosswalk candidate fields against every neighbouring domain. If not, keep a parent-scope hold and redesign its boundaries; do not use subgroups to conceal an over-broad parent. Role-to-domain and role-to-specialization fit are explicitly **not decided** in this artifact.

## Sources and limits

- [OECD, Frascati Manual 2015](https://www.oecd.org/en/publications/frascati-manual-2015_9789264239012-en.html), Chapter 2, Table 2.2: internationally used R&D statistical methodology; natural-sciences field families include mathematics, computer/information sciences, physical, chemical, earth/environmental, biological and other natural sciences. This is not a prescribed product taxonomy or an occupational classification.
- [UNESCO Institute for Statistics, ISCED-F 2013](https://uis.unesco.org/sites/default/files/documents/isced-fields-of-education-and-training-2013-en.pdf), fields 051–054 and classification criteria: subject-matter fields are grouped by closeness in theoretical content, purpose, objects, methods and tools. This classifies education fields, not jobs or this catalogue’s domains.
- [U.S. Department of Labor, O*NET: Life, Physical, and Social Science Occupations](https://www.onetonline.org/find/family?f=19): a U.S.-specific occupational comparator listing scientific occupations such as chemists, physicists, geoscientists, hydrologists and biological/environmental scientists. It does not establish global completeness, Nigerian roles/demand, or fit for this domain without task-level review.

No canonical domain, subgroup, role, or student-display record was changed. Machine-readable evidence and test: [`D041_specialization_review.json`](D041_specialization_review.json), [`test_d041_specialization_review.py`](test_d041_specialization_review.py).

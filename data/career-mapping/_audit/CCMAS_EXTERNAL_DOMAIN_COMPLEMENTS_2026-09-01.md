# CCMAS/JAMB external domain complements — 2026-09-01

This artifact supplements, but does not promote, the CCMAS/JAMB links that remain under review.

## Finding

- **86 JAMB rows** remain `review_required` in the canonical inheritance audit.
- They contain **559 unique CCMAS-component/domain pairs** and **711 domain-link occurrences**.
- External domain/occupational references with a URL were attached to **711** occurrences; **0** have a source reference without a URL; **0** lack a source record.
- The linked Nigerian CCMAS extracts provide **4287 exact course records** across the affected occurrences. Their status is recorded per link as sufficient, present-but-insufficient, or missing.
- The **6 genuinely non-CCMAS rows** are a separate category; **6** already have an explicit reviewed external curriculum scope.

The 86 rows are therefore not accurately described as ‘no CCMAS curriculum’. They have a resolved full CCMAS parent, but their domain-link evidence is not yet strong enough for certification. External domain sources make the target domain explainable and auditable; they do not turn one weak course anchor into two.

## Required treatment

1. Treat `nigerian_curriculum_evidence` as the programme-fit evidence shown to reviewers.
2. Keep the mapping `review_required` until every exposed candidate link satisfies the active gate or is explicitly removed from the candidate set after review.
3. For a genuinely non-CCMAS programme, use an external Nigerian curriculum source with exact course/outcome text, URL or page, and a reviewed scope; do not inherit a neighbouring CCMAS programme wholesale.
4. Do not use global domain references to certify a Nigerian programme-to-domain link.
5. Do not regenerate or apply SQL from this artifact. It is an evidence handoff for the final frozen generation step.

## Reproducibility

```text
python data/career-mapping/_audit_ccmas_external_complements.py
```

## Affected JAMB rows

| JAMB name | CCMAS component | Link occurrences | External refs attached | Status remains |
|---|---|---:|---:|---|
| Common and Islamic Law | Law::Common and Islamic Law | 5 | 5 | `retain_review_required` |
| Criminology and Security Studies (printed under Law faculty block) | Social Sciences::Criminology and Security Studies | 8 | 8 | `retain_review_required` |
| Criminology and Security Studies | Social Sciences::Criminology and Security Studies | 8 | 8 | `retain_review_required` |
| Demography and Social Statistics | Social Sciences::Demography and Social Statistics | 9 | 9 | `retain_review_required` |
| Political Science | Social Sciences::Political Science | 8 | 8 | `retain_review_required` |
| Psychology | Social Sciences::Psychology | 10 | 10 | `retain_review_required` |
| Social Work | Social Sciences::Social Work | 10 | 10 | `retain_review_required` |
| Business Administration | Administration and Management::Business Administration | 17 | 17 | `retain_review_required` |
| Marketing | Administration and Management::Marketing | 11 | 11 | `retain_review_required` |
| Entrepreneurship | Administration and Management::Entrepreneurship | 14 | 14 | `retain_review_required` |
| Taxation | Administration and Management::Taxation | 11 | 11 | `retain_review_required` |
| Insurance | Administration and Management::Insurance | 12 | 12 | `retain_review_required` |
| Procurement Management | Administration and Management::Procurement Management | 12 | 12 | `retain_review_required` |
| Actuarial Science | Administration and Management::Actuarial Science | 15 | 15 | `retain_review_required` |
| Social Standards | Social Sciences::Social Standards | 9 | 9 | `retain_review_required` |
| Project Management | Administration and Management::Project Management | 8 | 8 | `retain_review_required` |
| Logistics and Supply Chain Management | Administration and Management::Logistics and Supply Chain Management | 14 | 14 | `retain_review_required` |
| Transport Management | Administration and Management::Transport Management | 12 | 12 | `retain_review_required` |
| Employment and Human Resource Management | Administration and Management::Employment and Human Resource Management | 11 | 11 | `retain_review_required` |
| Aviation Management | Administration and Management::Aviation Management | 15 | 15 | `retain_review_required` |
| Computer Science | Computing::Computer Science | 8 | 8 | `retain_review_required` |
| Microbiology | Sciences::Microbiology | 9 | 9 | `retain_review_required` |
| Mathematics | Sciences::Mathematics | 3 | 3 | `retain_review_required` |
| BIOLOGY | Sciences::Biology | 11 | 11 | `retain_review_required` |
| Statistics | Sciences::Statistics | 4 | 4 | `retain_review_required` |
| Software Engineering | Computing::Software Engineering | 13 | 13 | `retain_review_required` |
| PHYSICS WITH ELECTRONICS | Sciences::Physics with Electronics | 10 | 10 | `retain_review_required` |
| Geology | Sciences::Geology | 6 | 6 | `retain_review_required` |
| INFORMATION TECHNOLOGY | Computing::Information Technology | 10 | 10 | `retain_review_required` |
| Zoology | Sciences::Zoology | 7 | 7 | `retain_review_required` |
| Industrial Mathematics | Sciences::Industrial Mathematics | 5 | 5 | `retain_review_required` |
| Science Laboratory Technology | Sciences::Science Laboratory Technology | 7 | 7 | `retain_review_required` |
| Biotechnology | Sciences::Biotechnology | 9 | 9 | `retain_review_required` |
| Environmental Management and Toxicology | Sciences::Environmental Management and Toxicology | 10 | 10 | `retain_review_required` |
| FORENSIC SCIENCE | Sciences::Forensic Science | 6 | 6 | `retain_review_required` |
| Industrial Physics | Sciences::Industrial Physics | 10 | 10 | `retain_review_required` |
| Petroleum Chemistry | Sciences::Petroleum Chemistry | 9 | 9 | `retain_review_required` |
| Marine Science | Sciences::Marine Science | 8 | 8 | `retain_review_required` |
| Brewing Science and Technology | Sciences::Brewing Science and Technology | 5 | 5 | `retain_review_required` |
| Biochemistry | Sciences::Biochemistry | 11 | 11 | `retain_review_required` |
| Human Nutrition and Dietetics | Allied Health Sciences::Human Nutrition and Dietetics | 7 | 7 | `retain_review_required` |
| Physiotherapy | Allied Health Sciences::Physiotherapy | 5 | 5 | `retain_review_required` |
| Pharmacology | Allied Health Sciences::Pharmacology | 10 | 10 | `retain_review_required` |
| Radiography | Allied Health Sciences::Radiography | 11 | 11 | `retain_review_required` |
| Animal Science | Agricultural Science::Animal Science | 8 | 8 | `retain_review_required` |
| Archaeology | Arts::Archaeology | 6 | 6 | `retain_review_required` |
| Economics | Social Sciences::Economics | 13 | 13 | `retain_review_required` |
| Linguistics | Arts::Linguistics | 6 | 6 | `retain_review_required` |
| Music | Arts::Music | 5 | 5 | `retain_review_required` |
| Philosophy | Arts::Philosophy | 3 | 3 | `retain_review_required` |
| Sociology | Social Sciences::Sociology | 7 | 7 | `retain_review_required` |
| Systems Engineering | Engineering::SYSTEMS ENGINEERING | 6 | 6 | `retain_review_required` |
| Architecture | Architecture::Architecture | 8 | 8 | `retain_review_required` |
| Quantity Surveying | Environmental Sciences::Quantity Surveying | 7 | 7 | `retain_review_required` |
| Urban and Regional Planning | Environmental Sciences::Urban and Regional Planning | 6 | 6 | `retain_review_required` |
| Industrial Design | Environmental Sciences::Industrial Design | 2 | 2 | `retain_review_required` |
| Environmental Health Science | Allied Health Sciences::Environmental Health Science | 11 | 11 | `retain_review_required` |
| Environmental Management | Environmental Sciences::Environmental Management | 7 | 7 | `retain_review_required` |
| Environmental Standards | Environmental Sciences::ENVIRONMENTAL STANDARDS | 10 | 10 | `retain_review_required` |
| Islamic Studies | Arts::Islamic Studies | 4 | 4 | `retain_review_required` |
| Optometry | Allied Health Sciences::Optometry | 9 | 9 | `retain_review_required` |
| Surveying and Geoinformatics | Environmental Sciences::Surveying and Geoinformatics | 5 | 5 | `retain_review_required` |
| OCEANOGRAPHY | Sciences::Marine Science | 8 | 8 | `retain_review_required` |
| Earth Science | Sciences::Geology | 6 | 6 | `retain_review_required` |
| Geoscience | Sciences::Geology | 6 | 6 | `retain_review_required` |
| Ecology | Sciences::Biology | 11 | 11 | `retain_review_required` |
| Applied Ecology | Sciences::Biology | 11 | 11 | `retain_review_required` |
| Ecology and Environmental Studies | Sciences::Biology | 11 | 11 | `retain_review_required` |
| Parasitology and Entomology | Sciences::Zoology | 7 | 7 | `retain_review_required` |
| BIOINFORMATICS | Sciences::Biotechnology | 9 | 9 | `retain_review_required` |
| OPERATIONS RESEARCH | Sciences::Industrial Mathematics | 5 | 5 | `retain_review_required` |
| BIOLOGICAL SCIENCE(S) | Sciences::Biology | 11 | 11 | `retain_review_required` |
| Energy and Petroleum Studies | Sciences::Petroleum Chemistry | 9 | 9 | `retain_review_required` |
| Electrons | Sciences::Physics with Electronics | 10 | 10 | `retain_review_required` |
| ELECTRONICS AND COMMUNICATIONS | Engineering::ELECTRONIC ENGINEERING | 9 | 9 | `retain_review_required` |
| COMMUNICATIONS TECHNOLOGY | Engineering::TELECOMMUNICATIONS ENGINEERING | 4 | 4 | `retain_review_required` |
| COMMUNICATION AND WIRELESS TECHNOLOGY | Engineering::TELECOMMUNICATIONS ENGINEERING | 4 | 4 | `retain_review_required` |
| TELECOMMUNICATION AND WIRELESS TECHNOLOGY | Engineering::TELECOMMUNICATIONS ENGINEERING | 4 | 4 | `retain_review_required` |
| TELECOMMUNICATION SCIENCE | Engineering::TELECOMMUNICATIONS ENGINEERING | 4 | 4 | `retain_review_required` |
| TELECOMMUNICATION MANAGEMENT | Engineering::TELECOMMUNICATIONS ENGINEERING | 4 | 4 | `retain_review_required` |
| NATURAL AND ENVIRONMENTAL SCIENCE | Environmental Sciences::Environmental Management | 7 | 7 | `retain_review_required` |
| ANTHROPOLOGY | Sciences::Biology | 11 | 11 | `retain_review_required` |
| ARCHEAOLOGY | Arts::Archaeology | 6 | 6 | `retain_review_required` |
| LIBRARY AND INFORMATION SCIENCE | Social Sciences::Library and Information Science | 5 | 5 | `retain_review_required` |
| Library and Information Science | Education::Library and Information Science | 3 | 3 | `retain_review_required` |
| Business Education | Education::Business Education | 10 | 10 | `retain_review_required` |

## Interpretation boundary

A domain source answers ‘what is this professional world and what work belongs inside it?’ A CCMAS source answers ‘what does this programme teach?’ The programme-to-domain decision requires both sides and must retain the specific course/outcome anchors that connect them.

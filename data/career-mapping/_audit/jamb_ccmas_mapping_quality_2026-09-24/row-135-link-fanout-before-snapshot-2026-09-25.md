# Row 135 before-snapshot — Mathematics with Computer Science

Captured 2026-09-25 before the row-local link correction. Canonical identity remains row 135 of `programme_mapping.json`. This snapshot is append-only evidence and records the exact pre-correction link set; it is not a student-facing recommendation.

## Source scope before correction

`jamb_curriculum_scopes_2026-08-17.json` has one primary component, `Computing::Computer Science`, and 11 selected course rows:

| Course | Source outcome summary relevant to this audit |
|---|---|
| MTH 101 Elementary Mathematics I | Sets, algebra, trigonometry, numbers and binomial theorem. |
| MTH 102 Elementary Mathematics II | Differentiation, integration, functions, limits and applications of definite integrals. |
| COS 101 Introduction to Computing Sciences | Computer components, applications, information processing, internet, computing specializations and practical computer use. |
| MTH 201 Mathematical Methods I | Real-valued functions, mean-value theorem, Taylor series and line/surface/volume integrals. |
| COS 201 Computer Programming I | Programming paradigms, types/strings, control flow, object-oriented classes, exceptions, file I/O and arrays. |
| COS 202 Computer Programming II | Object-oriented problem solving, modules/namespaces, APIs, searching/sorting, recursion, multithreading and GUI applications. |
| IFT 212 Computer Architecture and Organisation | Von Neumann architecture, assembly, machine-level implementation, control, memory hierarchy and interrupts. |
| SEN 201 Introduction to Software Engineering | Software lifecycle; requirements, design, development, testing and maintenance; development models; UML; architecture; quality and project tasks. |
| CSC 322 Computer Science Innovation and New Technologies | IT business models, entrepreneurship, feasibility, strategy, marketing, ethics and law. |
| CSC 401 Algorithms and Complexity Analysis | Algorithmic strategies, asymptotic time/space analysis, recurrences, searching/sorting, graphs and numerical approximation. |
| CSC 402 Ethics and Legal Issues in Computer Science | Computing ethics, applicable laws/regulations, professional codes and resolution of ethical conflicts. |

These course/outcome records are checked against the official NUC [Computing CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf); key printed locators include COS 201–202 (pp. 38–39), IFT 212 and SEN 201 (pp. 40–42), CSC 322 (p. 45), and CSC 401–402 (pp. 49–50). Page numbering is the document's printed “Computing” page number, not the PDF viewer index.

## Pre-correction artifact states

| Artifact | Stored row-135 link IDs | Status / summary |
|---|---|---|
| Saved scope `jamb_curriculum_scopes_2026-08-17.json` | D001 only | 3 scoped course titles: COS 201, COS 202, SEN 201. |
| Canonical `jamb_ccmas_inheritance_canonical_2026-08-17.json` | D001, D003, D005, D056, D140 | `current_jamb_domain_link_count: 5`; status `ready_partial`; candidate list duplicates the five exposed links. |
| Derived `jamb_domain_map_ccmas_derived_2026-08-17.json` | D001, D003, D005, D056, D140 | Status `ready_partial`; same five destinations. |
| Active `jamb_domain_map.json` | D001, D003, D005, D056, D140 | Status `ready_partial`; same five destinations. |

The exact pre-correction link evidence shared by canonical/derived/active was:

| ID | Type | Stored course-title anchors | Scope count |
|---|---|---|---:|
| D001 Software Engineering | direct | Computer Programming I; Computer Programming II; Introduction to Software Engineering | 3 |
| D003 Artificial Intelligence | direct | Computer Programming I; Computer Programming II; Algorithms and Complexity Analysis | 3 |
| D005 Cloud Computing | functional | Computer Programming I; Computer Programming II | 2 |
| D056 Blockchain | functional | Computer Programming I; Computer Programming II | 2 |
| D140 Robotics Engineering and Systems Design | functional | Elementary Mathematics I; Elementary Mathematics II; Introduction to Software Engineering | 3 |

## Planned row-local adjudication

Keep D001 as the only scoped student domain: SEN 201 explicitly teaches the software lifecycle, requirements/design/development/testing/maintenance, UML, architecture, quality and maintenance; COS 201–202 add programming implementation. Retain D003, D005, D056 and D140 in canonical non-student candidate evidence with explicit “not supported by this scoped course set” dispositions. Programming/algorithms and mathematics can be prerequisites for later learning, but this scope does not teach AI, cloud systems, blockchain, robotics/control or embedded systems. Do not edit role records or regenerate any global seed.

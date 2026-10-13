# Sparse-role disposition checkpoint — 2026-10-06

This is an audit-only, global-first reconciliation after the global role-domain apply. It does not edit canonical role, overlay, domain, or subgroup files, and it does not perform SQL or deployment work.

## Coverage result

- Candidate records reconciled: **145** across **79 domains**.
- Net-new role targets proposed: **40**.
- Candidate rows safe to activate with an existing subgroup route: **22**.
- Existing inactive links safe to activate: **0**.
- No-active-role domains covered explicitly: **16**.
- Role-enrichment domain: **D071 Sports Management**.
- Nigerian-only context used: **no**.

| Final disposition | Count |
|---|---:|
| already_active_exact_role_closed | 2 |
| duplicate_or_overlap_hold | 2 |
| duplicate_or_overlap_resolved | 32 |
| net_new_role_proposal | 40 |
| no_addition_specialization_or_family | 25 |
| ownership_or_parent_scope_hold | 43 |
| source_count_reconciliation_hold | 1 |

## Safe role-level activation candidates

These are proposals whose target parent domain has an active subgroup route in the current structure. The register still marks semantic subgroup sign-off as required; no canonical row was written.

| Candidate | Proposed role | Parent | Subgroup route |
|---|---|---|---|
| `D046|qualified social worker practice family` | `D046|social worker` | `D046` | 26 Social Workers & Counsellors |
| `D047|agricultural extension adviser` | `D047|agricultural extension adviser` | `D047` | 21 Agricultural & Life Scientists |
| `D047|agricultural research scientist` | `D047|agricultural research scientist` | `D047` | 21 Agricultural & Life Scientists |
| `D047|agronomist` | `D047|agronomist` | `D047` | 21 Agricultural & Life Scientists |
| `D047|soil scientist` | `D047|soil scientist` | `D047` | 21 Agricultural & Life Scientists |
| `D048|food engineer` | `D048|food engineer` | `D048` | 21 Food Scientists & Biotechnologists |
| `D048|food scientist or technologist` | `D048|food scientist` | `D048` | 21 Food Scientists & Biotechnologists |
| `D048|food sensory scientist` | `D048|food sensory scientist` | `D048` | 21 Food Scientists & Biotechnologists |
| `D051|property asset and tenancy manager` | `D051|property asset manager` | `D051` | 12 Administrative and commercial managers |
| `D051|real estate valuation surveyor` | `D051|real estate valuation surveyor` | `D051` | 24 Business and administration professionals |
| `D057|health data analyst` | `D057|health data analyst` | `D057` | 25 Health Informatics & Development |
| `D058|instructional designer` | `D058|instructional designer` | `D058` | 23 Teaching professionals |
| `D058|learning management system administrator` | `D058|learning management system administrator` | `D058` | 24 Business and administration professionals |
| `D059|spacecraft operations engineer` | `D059|spacecraft operations engineer` | `D059` | 21 Science and engineering professionals |
| `D070|musician singer composer family` | `D070|musician` | `D070` | 26 Performers & Creative Directors |
| `D121|forester_inactive` | `D121|forester` | `D121` | 21 Science and engineering professionals |
| `D128|social_work_assistant_inactive` | `D128|social work assistant` | `D128` | 34 Legal, social, cultural and related associate professionals |
| `D128|youth_worker_inactive` | `D128|youth worker` | `D128` | 34 Legal, social, cultural and related associate professionals |
| `D134|electro_technical_officer_missing` | `D134|electro-technical officer` | `D134` | 74 Electrical and electronic trades workers |
| `D136|flight_test_engineer_missing` | `D136|flight test engineer` | `D136` | 21 Aircraft & Aerospace Engineering |
| `D143|forensic_reporting_scientist_family` | `D143|forensic reporting scientist` | `D143` | 31 Laboratory Science Technicians |
| `D143|scene_of_crime_examiner_family` | `D143|scene-of-crime examiner` | `D143` | 33 Criminal Investigation |

## Net-new role proposals blocked by taxonomy route

These are source-backed role-level proposals, but their current parent domain has no active role route or their exact subgroup is excluded. They are not safe for student activation until the indicated route is repaired.

| Candidate | Proposed role | Parent | Gate |
|---|---|---|---|
| `D045|policy administration professional` | `D045|policy analyst` | `D045` | blocked_domain_has_no_active_role_route |
| `D050|industrial automation engineer` | `D050|industrial automation engineer` | `D050` | blocked_domain_has_no_active_role_route |
| `D052|construction project manager` | `D052|construction project manager` | `D052` | blocked_domain_has_no_active_role_route |
| `D052|construction site manager` | `D052|construction site manager` | `D052` | blocked_domain_has_no_active_role_route |
| `D052|quantity surveyor` | `D052|quantity surveyor` | `D052` | blocked_domain_has_no_active_role_route |
| `D053|hotel operations manager` | `D053|hotel operations manager` | `D053` | blocked_domain_has_no_active_role_route |
| `D054|drilling engineer` | `D054|drilling engineer` | `D054` | blocked_domain_has_no_active_role_route |
| `D054|petroleum production engineer` | `D054|petroleum production engineer` | `D054` | blocked_domain_has_no_active_role_route |
| `D054|reservoir engineer` | `D054|reservoir engineer` | `D054` | blocked_domain_has_no_active_role_route |
| `D055|chemical process engineer` | `D055|chemical process engineer` | `D055` | blocked_subgroup_route_excluded |
| `D065|interpreter` | `D065|interpreter` | `D065` | blocked_subgroup_route_excluded |
| `D068|prosthetist orthotist` | `D068|prosthetist-orthotist` | `D068` | blocked_subgroup_route_excluded |
| `D068|radiation therapist` | `D068|radiation therapist` | `D068` | blocked_subgroup_route_excluded |
| `D071|sport administrator` | `D071|sport administrator` | `D071` | blocked_domain_has_no_active_role_route |
| `D071|sports performance analyst` | `D071|sports performance analyst` | `D071` | blocked_domain_has_no_active_role_route |
| `D071|sports referee match official` | `D071|sports referee` | `D071` | blocked_domain_has_no_active_role_route |
| `D072|geospatial analyst` | `D072|geospatial analyst` | `D072` | blocked_subgroup_route_excluded |
| `D075|textile and clothing technologist` | `D075|textile and clothing technologist` | `D075` | blocked_domain_has_no_active_role_route |

## The 16 no-active-role domains

| Domain | Current route | Proposed net-new candidates | Current subgroup implication |
|---|---|---:|---|
| `D037` Legal Practice | unresolved_ownership_and_role_enrichment | 0 | 26 Lawyers & Legal Advisers (excluded); 33 Legal Records & Admin (excluded); 34 Court & Enforcement Officers (excluded) |
| `D039` Higher Education and Academic Research | unresolved_ownership_and_role_enrichment | 0 | 13 Deans & School Principals (excluded); 23 Lecturers & Vocational Teachers (excluded) |
| `D040` Vocational and Technical Training | unresolved_ownership_and_role_enrichment | 0 | 23 Vocational & Skills Instructors (excluded); 24 Corporate Trainers & Coaches (excluded); 53 Classroom Teaching Assistants (excluded) |
| `D045` Public Administration and Policy | unresolved_ownership_and_role_enrichment | 1 | 11 Government & Elected Leadership (excluded); 24 Policy & Programme Officers (excluded); 33 Inspection & Enforcement Officers (excluded) |
| `D049` Automotive Engineering | unresolved_ownership_and_role_enrichment | 0 | 21 Vehicle & Mechanical Engineering (excluded); 31 Automotive Engineering Technicians (excluded); 72 Vehicle Repair & Mechanics (excluded) |
| `D050` Industrial Automation | unresolved_ownership_and_role_enrichment | 1 | 21 Automation & Mechatronics Engineers (excluded); 31 Production Line Supervisors (excluded); 82 Machinery & Electronics Assembly (excluded) |
| `D052` Construction Management | unresolved_ownership_and_role_enrichment | 3 | 13 Construction & Site Managers (excluded); 21 Civil & Infrastructure Engineers (excluded); 31 Site Supervisors & Inspectors (excluded); 71 Building Trade Workers (excluded) |
| `D053` Hospitality Services and Management | unresolved_ownership_and_role_enrichment | 1 | 14 Hospitality & Venue Management (excluded); 34 Professional Chefs (excluded); 51 Food & Beverage Service (excluded) |
| `D054` Oil and Gas Operations | unresolved_ownership_and_role_enrichment | 3 | 13 Oil & Gas Production Managers (excluded); 21 Petroleum Engineers & Geologists (excluded); 31 Refinery & Plant Operators (excluded); 81 Rig & Drilling Crew (excluded) |
| `D071` Sports Management | needs_role_enrichment_before_subgroup_decision | 3 | 13 Production and specialised services managers (excluded); 14 Sports Facility & Event Directors (excluded); 26 Legal, social and cultural professionals (excluded); 34 Coaches & Fitness Instructors (excluded) |
| `D075` Fashion and Textiles | unresolved_ownership_and_role_enrichment | 1 | 14 Hospitality, retail and other services managers (excluded); 21 Fashion & Textile Technology (excluded); 24 Business and administration professionals (excluded); 33 Business and administration associate professionals (excluded); 52 Sales workers (excluded); 75 Garment & Footwear Making (excluded); 81 Textile Machine Operation (excluded) |
| `D076` Maritime and Naval Operations | unresolved_ownership_and_role_enrichment | 0 | 21 Marine Engineering & Design (excluded); 31 Ship Navigation & Command (excluded); 75 Commercial Diving (excluded); 83 Deck & Crew Operations (excluded) |
| `D079` Customs and International Trade | unresolved_ownership_and_role_enrichment | 0 | 13 Transport & Supply Chain Managers (excluded); 33 Customs & Freight Officers (excluded) |
| `D080` Interior and Spatial Design | unresolved_ownership_and_role_enrichment | 0 | 21 Science and Engineering Professionals (excluded); 34 Legal, Social, Cultural and Related Associate Professionals (excluded) |
| `D153` Music Production | unresolved_ownership_and_role_enrichment | 0 | 26 Musicians & Music Producers (excluded); 34 Legal, social, cultural and related associate professionals (excluded); 35 Sound & Audio Engineers (excluded) |
| `D157` Tax Advisory and Transfer Pricing | unresolved_ownership_and_role_enrichment | 0 | 24 Business and Administration Professionals (excluded); 33 Business and Administration Associate Professionals (excluded) |

D037, D039 and D040 have no candidate rows in the current 145-row input. They remain explicit global source-review gaps; no title is inferred from the domain label.

## D071 role enrichment

D071 has three source-backed net-new role proposals: sport administrator, sports performance analyst, and sports referee. Sports coach is retained as a no-addition family decision, and sports talent scout remains an ownership hold. All four current D071 subgroup routes are excluded, so none is student-safe to activate yet.

## Boundary

Duplicate and overlap findings are resolved to explicit target roles where the target is safe to name. Ownership conflicts, source-count conflicts, specializations, and globally excluded or route-pending inactive records remain held with exact parent/subgroup implications in the JSON register. The register is a review artifact, not a seed or deployment claim.

Machine-readable register: `sparse_role_disposition_register_2026_10_06.json`.
Reproducible builder: `reconcile_sparse_role_dispositions_2026_10_06.py`.

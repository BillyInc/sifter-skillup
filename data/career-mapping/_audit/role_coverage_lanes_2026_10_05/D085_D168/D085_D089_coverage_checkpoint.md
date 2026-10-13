# D085–D089 role-coverage checkpoint

Date: 2026-10-06
Lane: D085–D168; distinct from completed role→parent-domain fit decisions.
State: first five domains assessed; no canonical taxonomy changes.

## Reconciled baseline

- D085–D168: **84 domains**, **1713 active role links** in `domain_structure.json`.
- Zero-role domains: **2** — D153 Music Production, D157 Tax Advisory and Transfer Pricing.
- Sparse domains (1–12 links): **16**. This is a triage cohort only, not proof of missing occupations.
- D086 has stored mappings but is excluded from the student-facing catalogue; no student-facing additions proposed.
- D119’s 20 stored roles were not in the role-fit queue because that domain was handled separately. It remains included in the active-count baseline and must be reviewed from its own exact source records in its coverage batch.

## D085–D089 dispositions

| Domain | Active links | Coverage finding | Candidate families |
|---|---:|---|---|
| D085 Retail Sales and Shop Operations | 70 | two source-backed candidate families identified; one partly overlaps the existing shop-supervisor record and requires duplicate/scope reconciliation before recommending any net-new title | Retail/shop trade manager; Retail merchandise buyer / buyer for resale |
| D086 Gaming, Betting and Lottery Operations | 13 | domain is explicitly excluded from the student-facing catalogue by domain_meta; preserve its 13 stored links for audit, but do not propose student-facing role additions while exclusion stands | None established in this pass |
| D087 Hairdressing, Barbering and Hair Technology | 5 | sparse count (5), but the checked tasks cover the core barbering, hairdressing, assistance and performance-hair functions; no additional globally distinct occupational family is established by this source pass | None established in this pass |
| D088 Beauty Therapy, Aesthetics and Spa Services | 12 | 12 active roles cover the listed beauty/aesthetic/spa service functions; count alone does not prove a gap, and no net-new global occupational family is established in this batch | None established in this pass |
| D089 Funeral and Mortuary Services | 4 | sparse count (4); global ILO funeral/embalming tasks broadly overlap the existing funeral-services director, embalmer and attendant records. A separate crematory-operator family is evidenced only in the U.S. source pass and must not be generalized globally | Crematory operator / cremator |
| D090 Animal Care, Grooming and Pet Services | 15 | 15 active roles span animal care, grooming, training, breeding, shelter, boarding and zoo functions; ILO ISCO-08 5164 substantially matches that scope. This source pass establishes no clear omitted global occupational family; veterinary-clinical roles remain outside this non-clinical parent unless its boundary is deliberately revised. | None established in this pass |
| D091 Driving Instruction | 7 | 7 active roles cover car, bus, truck, motorcycle, vessel and occupational driving instruction. ILO ISCO-08 5165 recognizes driving instructors; no distinct global instructional family omitted from this parent was established. Licensing/exam authority roles are jurisdiction-dependent and not inferred as generic instructors. | None established in this pass |
| D092 Culinary Arts, Catering and Food Service | 21 | 21 active role links cover cooking, food service, beverage service and quick-service operations. D092 chef and pastry-cook records exist in the role library but are not active in the exact role queue; reconcile those existing records and cross-domain duplicates rather than inventing titles. | Chef / head chef; Pastry cook / pastry chef |
| D093 Electrical Installation, Wiring and Maintenance | 21 | 21 active roles cover electrical installation, distribution, equipment maintenance and specialized settings. The exact role library also has an inactive D093 electrical engineering technician record. ILO ISCO-08 3113 recognizes a distinct technician-level family, but this trade/install/maintenance parent requires task-level review before activation. | Electrical engineering technician |
| D094 Electronics and ICT Equipment Servicing, Smart Systems Installation | 26 | 26 active roles cover electronics/ICT installation, repair and maintenance across telecommunications, computing hardware, consumer devices, instrumentation, smart systems, alarms, fibre and transport electronics. ESCO/ISCO 7422 families substantially overlap this active set; no source-supported missing global family was established here. | None established in this pass |

## Candidate findings and boundaries

- **D085 retail/shop trade manager:** global ISCO-08 group 1420 supports an established role family. The existing `shop supervisor` task profile partially overlaps, so first compare actual scope; likely outcome may be expanding/clarifying that record rather than adding a duplicate.
- **D085 retail merchandise buyer:** global ISCO-08 group 3323 includes buying goods for resale by retail establishments. No buyer/purchaser title appears among D085's 70 active role keys. This is a candidate for exact-key and overlap review, not a canonical addition.
- **D089 crematory operator:** BLS establishes this as a distinct U.S. occupation. ILO funeral/embalming definitions do not, from this review, establish it as a separate global occupation; it remains U.S.-labelled pending evidence from other jurisdictions.
- **D087 and D088:** low counts do not justify padding. The current roles already cover the principal globally described barbering, hairdressing, beauty, aesthetics, spa and personal-care service families checked here; no net-new global family is established by this batch.
- **D086:** gambling/betting domain is explicitly excluded. Coverage is documented, but no student-facing role additions are proposed.

## Source records

- **ILO_ISCO08 — International Labour Organization (ILO)** ([source](https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf)); scope: International occupational classification; global statistical standard. Supports: Task-defined occupational groups for retail and wholesale trade managers (ISCO-08 1420), restaurant managers (1412), buyers (3323), hairdressers/beauticians (5141/5142), and funeral/embalming work (5163). Limit: Classification supports occupational-family existence and task boundaries, not domain assignment or proof of a missing link by itself.
- **BLS_CREMATORY_OPERATORS — U.S. Bureau of Labor Statistics (BLS), Occupational Employment and Wage Statistics** ([source](https://www.bls.gov/oes/2023/may/oes394012.htm)); scope: United States only. Supports: A separately classified Crematory Operator occupation and task profile in the U.S. SOC/OEWS, including operating crematory equipment and preparing remains. Limit: Does not establish that the same title, employment scale, training route or separate occupation exists globally or in Nigeria.
- **BLS_FUNERAL_WORKERS — U.S. Bureau of Labor Statistics (BLS), Occupational Outlook Handbook** ([source](https://www.bls.gov/ooh/personal-care-and-service/funeral-service-occupations.htm)); scope: United States only. Supports: Distinguishes funeral-service coordination from the technical work of crematory operators and embalmers in U.S. occupational reporting. Limit: U.S. occupational categories and regulation are not generalized to other jurisdictions.
- **ILO_ISCO08_ELECTRICAL_AND_SERVICE_GROUPS — International Labour Organization (ILO), ISCO-08 Volume I** ([source](https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf)); scope: International occupational classification; global statistical standard. Supports: Unit groups 3113 electrical engineering technicians, 3434 chefs, 5164 pet groomers and animal care workers, 5165 driving instructors, and 7512 bakers, pastry-cooks and confectionery makers, with task definitions and occupational boundaries. Limit: ISCO establishes classification/task families, not whether a role belongs in this product's particular domain or should be active; inspect task overlap and domain scope separately.
- **ONET_CHEFS_HEAD_COOKS — U.S. Department of Labor, O*NET OnLine** ([source](https://www.onetonline.org/link/summary/35-1011.00)); scope: United States occupational taxonomy and task evidence. Supports: Chef/head-cook tasks include preparing food, menu planning/pricing, ordering supplies and supervising food-preparation work. Limit: U.S.-specific occupational taxonomy; corroborative only, not proof of global or Nigeria-specific title prevalence or regulation.
- **ESCO_ICT_INSTALLERS_SERVICERS — European Commission, European Skills, Competences, Qualifications and Occupations (ESCO)** ([source](https://esco.ec.europa.eu/en/classification/occupation?uri=http%3A%2F%2Fdata.europa.eu%2Fesco%2Fisco%2FC7422)); scope: European occupational classification; internationally useful comparator, not a universal legal taxonomy. Supports: ISCO/ESCO 7422 ICT installers and servicers and narrower families including computer hardware repair, fibre-optic installation, radio, security-alarm, mobile-device and telecommunications service occupations. Limit: A taxonomy category does not establish this product's domain assignment; compare task records and avoid duplicates.

## Resume point

Next disjoint batch: D090–D094. Continue five domains at a time, save the updated register/checkpoint and rerun tests before proceeding. Keep role coverage separate from role fit; no ISCO/subgroup inference and no canonical edits.

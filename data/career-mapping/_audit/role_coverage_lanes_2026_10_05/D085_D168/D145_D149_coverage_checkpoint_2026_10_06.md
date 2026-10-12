# D145-D149 global role-coverage checkpoint

Date: 2026-10-06  
Lane: D085-D168. Coverage inventory is separate from role-to-parent-domain fit and subgroup mapping.

## Exact range and counts

- This batch covers D145-D149, the first uncovered range after the existing D140-D144 checkpoint.
- The role-fit queue contains 60 exact active role keys across these five domains; their per-domain counts are 12, 13, 15, 18, and 12 respectively. These counts are cross-checks, not a measure of occupational completeness.
- `data/career-mapping/_audit/domains/D145.json` etc. are broader role-library inventories, not active mappings. Their counts differ materially from active counts; do not treat inactive library rows as current coverage.
- No canonical domain, subgroup, or role data was changed. No Nigerian sources were used.

## Per-domain dispositions

| ID | Domain | Active roles | Coverage assessment |
|---|---|---:|---|
| D145 | Neuroscience, Cognitive Science and Brain-Computer Interfaces | 12 | Active records cover clinical neurology/neuropsychology, psychology, physiology and sensory-science tasks, but the parent also names BCI. BCI Society sources establish a multidisciplinary research/engineering community and a neural-engineering skill profile, not a stable globally standardized occupation title. Keep “neural engineer / BCI research engineer” as an emerging, task-defined coverage candidate; do not promote it as a canonical globally established role without stronger cross-jurisdiction title evidence. |
| D146 | Building Services Engineering (Mechanical and Electrical Systems) | 13 | Active records cover HVAC engineering/technician work, electrical and electromechanical engineering, fire protection, smart-home systems, and relevant equipment distribution. ASHRAE distinguishes building commissioning functions and building automation systems, but those are project functions that may be performed by existing engineers/commissioning professionals. Keep building commissioning professional/authority and building-automation controls engineer as exact-task overlap candidates, not automatic additions. |
| D147 | Industrial Process Automation (SCADA and PLC Systems) | 15 | Active records span automation and instrumentation engineers/technicians, control-room operators, robot controllers, automation technicians, and process-control programming. ISA describes automation as a cross-industry profession spanning design, application engineering, implementation, integration, installation, maintenance and management. No distinct globally missing role family is established by this pass; do not turn each automation technology or ISA credential pathway into a separate occupation. |
| D148 | Offshore and Subsea Engineering | 18 | Active records cover drilling, petroleum, production, rotating equipment, surface and welding engineering plus relevant plant operations. IMCA publishes separate competence frameworks/e-portfolios for Offshore Survey and Remote Systems/ROV roles, including ROV Pilot/Technician. Retain ROV Pilot/Technician and offshore surveyor as exact parent-fit and duplicate-ownership candidates; the source establishes real task-role families but does not alone settle whether D148 or another offshore domain should own them. |
| D149 | Diplomacy and International Relations | 12 | Active records cover ambassador, consul, diplomat, embassy counsellor, foreign-affairs and political-affairs roles, international-relations officer, correspondent, humanitarian adviser, intelligence and trade roles. UN sources establish Political Affairs Officer as a real job family and UN job profile. This is already represented in active data; no net-new role is indicated. Vienna Convention materials establish consular functions, but exact additional consular titles should not be duplicated without comparing current consul tasks. |

## Candidate decisions carried forward

1. D145 — neural engineer / BCI research engineer: emerging task-defined candidate; title standardization and active-path overlap unresolved.
2. D146 — building commissioning professional/authority and building-automation controls engineer: candidate functions; compare exact current engineer/technician tasks before deciding whether a separate role record is useful.
3. D148 — ROV Pilot/Technician and offshore surveyor: source-established role/competence families; exact parent ownership and overlap remain unresolved.
4. D147 and D149 — no additional globally missing role family established in this pass; this is a provisional disposition, not proof of exhaustive global absence.

These are coverage findings only. Parent-domain fit must be independently task-audited; subgroup membership is not evidence of fit. No titles are approved for canonical addition by this checkpoint.

## Sources

- BCI Society, [BCI definition](https://bcisociety.org/bci-definition/): defines the technical scope of brain-computer interfaces, not occupational-title standardization.
- BCI Society, [Trainee Collaboration Projects](https://bcisociety.org/trainee-collaboration-projects/): lists neural engineering among needed skill profiles; not a global occupational classification.
- BCI Society, [engineering/postdoctoral BCI position notice](https://bcisociety.org/wp-content/uploads/2020/12/PostDocEngineerRecruitingFlier.pdf): demonstrates an employer/research role instance; one posting does not establish global title prevalence.
- ASHRAE, [certification types](https://www.ashrae.org/professional-development/ashrae-certification/certification-types): defines building commissioning, energy assessment/modeling and HVAC design competency scopes; certifications are not role titles.
- ASHRAE, [building automation fundamentals](https://handbook.ashrae.org/Handbooks/F25/IP/f25_Ch07/f25_Ch07_ip.aspx): documents building automation system design/control scope and multidisciplinary responsibility.
- ISA, [what is automation](https://www.isa.org/about-isa/what-is-automation): describes cross-industry automation work and role functions; broad professional-society scope, not a per-domain role list.
- IMCA, [offshore survey competence framework](https://www.imca-int.com/resources/technical-library/document/c95ac45a-c55b-ee11-8def-6045bdd2c3b2/): source-backed competence criteria for offshore survey roles; not a universal national licensing scheme.
- IMCA, [freelance competence e-portfolios](https://www.imca-int.com/skills/freelance-portfolios/): separate Offshore Survey and Remote Systems/ROV competence roles; supports role families, not exclusive domain ownership.
- UN Careers, [Political Affairs Officer role profile](https://careers.un.org/talentpipeline/description/67efa8cb80ebc3000b4d1817): global-institution employer-specific job profile; not a universal diplomatic service taxonomy.
- United Nations Treaty Collection, [Vienna Convention on Consular Relations materials](https://treaties.un.org/doc/Publication/UNTS/Volume%201464/v1464.pdf): defines consular officer functions; does not establish an additional distinct title beyond current records.

## Resume point

Next batch: D150-D154. First verify no newer exact-ID coverage checkpoint/register entries exist, then add only the uncovered IDs and rerun the lane tests.

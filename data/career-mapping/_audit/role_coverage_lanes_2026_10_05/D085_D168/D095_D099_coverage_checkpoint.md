# D095-D099 role-coverage checkpoint

Date: 2026-10-06
Lane: D085-D168; coverage audit is distinct from completed role-to-parent-fit decisions.
Progress: 15/84 domains have evidence-based dispositions. No canonical data changed.

## Catalogue baseline

- Active role links in scope: 1713.
- Zero-role domains: 2 (D153, D157).
- Sparse domains (1-12 active links): 16; triage only, not proof of omissions.
- D119 remains included in the count baseline and is audited from its exact records; it was excluded from the prior fit queue.

## This batch

| Domain | Active links | Coverage disposition | Existing-library candidates |
|---|---:|---|---|
| D095 Motor Vehicle Mechanics and Repairs | 20 | 20 active links cover powertrain, general vehicle service, tires/brakes, restoration, assembly and related mechanics. An exact D095 motor vehicle body repairer record exists in the role library but is inactive. O*NET task evidence distinguishes panel/body repair and refinishing from mechanical servicing; check overlap with coachbuilder and body assembler before deciding activation. | Motor vehicle body repairer / automotive body repairer |
| D096 Agricultural Machinery and Farm Operations | 15 | 15 active links are concentrated in agricultural/forestry/mining machinery and heavy-equipment work. The role library also contains inactive D096 records for crop farmer, mixed crop-and-livestock farmer, agronomist and farmworker/agricultural labourer. Because the parent explicitly says 'Farm Operations' as well as machinery, these are material coverage/scope-boundary candidates; do not activate them until the parent definition and each exact task profile establish fit or justify separating/relocating the scope. | Crop farmer / field-crop grower; Mixed crop and livestock farmer; Agronomist / farming adviser; Farmworker / agricultural labourer |
| D097 Welding, Fabrication and Blacksmithing | 63 | 63 active roles cover a broad range of joining, forging, casting, cutting, forming, fitting, welding, sheet-metal, blacksmithing, tool-and-die and related fabrication tasks. The current exact library comparison in this batch establishes no additional distinct global family absent from both active roles and same-domain library records; the high count is not itself a completeness proof. | None established in this pass |
| D098 Precision Engineering and Toolmaking | 23 | 23 active links cover precision inspection, instruments, tool/die making, repair and quality control. An exact D098 machinist/CNC machinist record exists in the library but is inactive. O*NET documents precision machining tasks that may differ from general CNC machine tending; reconcile with D097 machine operators and D098 tool-and-die maker before deciding activation. | Machinist / CNC machinist |
| D099 Masonry, Bricklaying, Tiling and Plastering | 20 | 20 active roles span bricklaying, masonry, plaster/stucco, tile/floor laying, ceilings, insulation, glass and concrete finishing. No clear, source-supported global occupational family missing from this parent was established in this batch; further review should target any exact source-defined task family not already represented, not inflate the catalogue with material or title variants. | None established in this pass |

## Important reconciliation notes

- Any candidate labelled `existing_role_library_record_inactive` exists in the role library but is absent from active links for that exact domain. These are reconciliation candidates, not newly invented titles or approved links.
- Candidate status does not establish parent fit. Compare the exact role record tasks, boundaries and duplicate assignments before deciding whether to activate, relocate, merge or exclude.
- ILO/ISCO supports occupational-family definitions; O*NET is explicitly U.S.-specific; ESCO is a European classification comparator. None alone determines this product's domain ownership.

## Sources

- **ILO_ISCO08_ELECTRICAL_AND_SERVICE_GROUPS — International Labour Organization (ILO), ISCO-08 Volume I** ([source](https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf)). Unit groups 3113 electrical engineering technicians, 3434 chefs, 5164 pet groomers and animal care workers, 5165 driving instructors, 6111 field crop and vegetable growers, 6130 mixed crop and animal producers, 2132 farming/forestry/fisheries advisers, 7112 bricklayers, 7122 floor layers and tile setters, 7123 plasterers, and 7512 bakers/pastry-cooks, with task definitions and occupational boundaries. Limitation: ISCO establishes classification/task families, not whether a role belongs in this product's particular domain or should be active; inspect task overlap and domain scope separately.
- **ONET_AUTOMOTIVE_BODY_REPAIRERS — U.S. Department of Labor, O*NET OnLine** ([source](https://www.onetonline.org/link/summary/49-3021.00)). Automotive body repair tasks include removing damaged body sections, fitting/welding replacement parts, smoothing and refinishing panels, and inspecting completed body repairs. Limitation: U.S.-specific task taxonomy; use to distinguish body repair from mechanical service, not to infer global/Nigerian title prevalence or credentials.
- **ONET_CROP_FARMWORKERS — U.S. Department of Labor, O*NET OnLine** ([source](https://www.onetonline.org/link/details/45-2092.00)). Manual crop, nursery and greenhouse production work, including planting, cultivation, harvest, crop records, packing and loading. Limitation: U.S.-specific occupational taxonomy; corroborative task evidence only, not Nigerian role prevalence or a basis for assigning a role to D096.
- **ONET_MACHINISTS — U.S. Department of Labor, O*NET OnLine** ([source](https://www.onetonline.org/link/details/51-4041.00)). Machinists set up/program/operate machine tools, produce precision parts to specifications, inspect tolerances and maintain tooling; includes CNC machinist titles. Limitation: U.S.-specific taxonomy; corroborative task evidence only, and its tasks overlap machine-tool operators and tool-and-die makers that must be checked for duplicates.

## Resume point

Next exact batch: D100-D104. Append evidence and exact-domain dispositions without repeating completed IDs. Keep coverage separate from fit; do not infer from ISCO subgroup membership or assign specializations.

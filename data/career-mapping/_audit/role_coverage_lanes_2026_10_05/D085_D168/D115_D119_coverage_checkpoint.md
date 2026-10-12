# D115-D119 role-coverage checkpoint

Date: 2026-10-06
Lane: D085-D168; coverage audit is distinct from completed role-to-parent-fit decisions.
Progress: 35/84 domains have evidence-based dispositions. No canonical data changed.

## Catalogue baseline

- Active role links in scope: 1713.
- Zero-role domains: 2 (D153, D157).
- Sparse domains (1-12 active links): 16; triage only, not proof of omissions.
- D119 remains included in the count baseline and is audited from its exact records; it was excluded from the prior fit queue.

## This batch

| Domain | Active links | Coverage disposition | Existing-library candidates |
|---|---:|---|---|
| D115 Road Transport and Driving Operations | 28 | 28 active links cover passenger and freight road transport, including buses, heavy/light delivery, taxis, motorcycles, refuse, emergency, dangerous-goods and specialist vehicle transport. ILO groups 8331-8332 align with bus/tram and heavy-truck work; no materially distinct global road-driving family absent from the active titles was established. Some exact role-library variants remain alias-level rather than separate occupations. | None established in this pass |
| D116 Heavy Equipment and Earthmoving Operations | 20 | 20 active roles cover cranes, excavators, bulldozers, graders, rollers, dredging, pile-driving, forklifts and related earthmoving/construction equipment. ILO groups 8342-8343 identify earthmoving and crane operators; the exact library roles are represented in the active set. No distinct global equipment-operator family absent from this scope was established. | None established in this pass |
| D117 Railway | 20 | 20 active roles cover train driving, dispatch, signalling, switching, level crossings, shunting, train preparation, rolling-stock engineering and conductors. ILO groups 8311-8312 align with locomotive and rail signal/switch tasks. An inactive exact-library `railway conductor` title is likely covered by the active `Railroad Conductors and Yardmasters` family but requires task-level alias reconciliation; no separate global family is established here. | None established in this pass |
| D118 Crop Production and Horticulture | 23 | 23 active roles cover crop and horticulture production, field work, farm management, fruit/vegetable harvesting, horticulture, vineyards, arboriculture and inspection/crop protection. The two exact library extras (`agricultural inspector`, `crop protection / pesticide applicator`) have active counterparts (`Agricultural Inspectors`, `Pesticide Handlers, Sprayers, and Applicators, Vegetation`), so they are title/task reconciliation items, not evidence of missing families. ILO 611x grower families are represented; no additional global family was established in this pass. | None established in this pass |
| D119 Livestock, Poultry and Dairy Production | 20 | Coverage cannot be signed off because source counts disagree: `domain_structure.json` declares 20 links, while the exact D119 audit inventory lists 17 roles; the fit queue excludes D119 and the role library contains 14 corresponding active-title records plus two inactive candidates. The inventory does not explicitly list a dairy farmer although dairy is in the parent scope; the inactive exact-domain dairy-farmer record and ILO livestock/dairy producer family make it a source-backed candidate. Reconcile the exact active-role source and tasks before deciding whether the family is missing or represented under another title. | Dairy farmer / dairy producer |

## Important reconciliation notes

- Any candidate labelled `existing_role_library_record_inactive` exists in the role library but is absent from active links for that exact domain. These are reconciliation candidates, not newly invented titles or approved links.
- Candidate status does not establish parent fit. Compare the exact role record tasks, boundaries and duplicate assignments before deciding whether to activate, relocate, merge or exclude.
- ILO/ISCO supports occupational-family definitions; O*NET is explicitly U.S.-specific; ESCO is a European classification comparator. None alone determines this product's domain ownership.

## Sources

- **ILO_ISCO08_TRANSPORT_AGRICULTURE — International Labour Organization (ILO), ISCO-08 Volume I** ([source](https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf)). ISCO-08 unit groups 6111-6113 crop and horticultural growers; 6121 livestock and dairy producers, 6122 poultry producers, 6123 apiary/sericulture workers and 6129 animal producers not elsewhere classified; 8311 locomotive-engine drivers, 8312 railway-brake/signal/switch operators, 8331 bus/tram drivers, 8332 heavy-truck drivers, and 8342-8343 earthmoving/crane operators. Limitation: International family definitions support coverage checks, not automatic domain ownership. Local vehicle licensing, employer titles, regulatory work and overlapping production/transport tasks are not inferred.

## Resume point

Next exact batch: D120-D124. Append evidence and exact-domain dispositions without repeating completed IDs. Keep coverage separate from fit; do not infer from ISCO subgroup membership or assign specializations.

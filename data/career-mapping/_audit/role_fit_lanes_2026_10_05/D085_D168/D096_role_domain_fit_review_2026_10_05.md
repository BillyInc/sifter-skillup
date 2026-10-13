# D096 role-to-parent-domain fit review

Audit date: 2026-10-05  
Scope: role-task fit against **Agricultural Machinery and Farm Operations** only. No subgroup/specialization fit is assessed and canonical mappings are not changed.

## Result

Reviewed **15/15** lane mappings: **8 supported, 4 conditional, 3 unsupported, 0 unresolved**.

Supported tasks explicitly serve agricultural production, farm equipment, or forestry machinery. The parent also lists equipment dealers as an operating context, so the agricultural machinery distribution manager is supported as an equipment-sector role, not as a farm operator.

Conditional cases are heavy/tractor-trailer truck driver, industrial truck and tractor operator, roadside vehicle technician, and vehicle technician. Their descriptions are generic transport/vehicle/material-handling duties without evidence that the vehicles are farm vehicles or that the work serves agricultural operations. Unsupported cases are mobile heavy equipment mechanic (construction/logging/mining equipment per task text), mining equipment mechanic, and rotating equipment mechanic (generic industrial plant equipment).

Four queue records have no stored ESCO URI: Farm Equipment Mechanics and Service Technicians; Heavy and Tractor-Trailer Truck Drivers; Industrial Truck and Tractor Operators; Mobile Heavy Equipment Mechanics, Except Engines. The JSON retains null URI values and identifies the checked-in queue task as the source; it does not fabricate source metadata.

## Sources and limits

- BLS differentiates farm-equipment mechanics (tractors/harvesters) from mobile heavy-equipment mechanics serving construction and surface mining. [BLS: Heavy Vehicle and Mobile Equipment Service Technicians](https://www.bls.gov/ooh/installation-maintenance-and-repair/heavy-vehicle-and-mobile-equipment-service-technicians.htm)
- BLS describes logging equipment operators' use of machinery to harvest and move timber. [BLS: Logging Workers](https://www.bls.gov/ooh/farming-fishing-and-forestry/logging-workers.htm)
- BLS describes heavy truck driving as goods transport, without an agricultural task implied by the occupation itself. [BLS: Heavy and Tractor-Trailer Truck Drivers](https://www.bls.gov/ooh/transportation-and-material-moving/heavy-and-tractor-trailer-truck-drivers.htm)
- BLS describes automotive repair as a separate generic vehicle-service context. [BLS: Automotive Service Technicians and Mechanics](https://www.bls.gov/ooh/installation-maintenance-and-repair/automotive-service-technicians-and-mechanics.htm)

All BLS sources are US-specific corroboration, not global occupational taxonomy. Exact task evidence, role URIs where present, and source limitations are recorded per row in [`D096_role_domain_fit_review_2026_10_05.json`](D096_role_domain_fit_review_2026_10_05.json).

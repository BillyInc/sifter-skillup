# D093 role-to-parent-domain fit review

Audit date: 2026-10-05  
Scope: compare role tasks only with **Electrical Installation, Wiring and Maintenance**. No subgroup or specialization fit is assessed; no canonical mapping is changed.

## Result

Reviewed **21/21** exact queued D093 mappings: **18 supported, 3 conditional, 0 unsupported, 0 unresolved**.

Most tasks directly involve installing, maintaining, testing, or repairing electrical wiring/equipment in buildings, vehicles, industrial sites, utility networks, temporary sites, or lighting systems—all contexts consistent with the parent description. The three conditional cases are:

- **Geothermal technician:** the task text includes geothermal plants and heating installations but does not establish that the role's defining work is electrical rather than broader thermal/mechanical plant work.
- **Household appliances repair technician:** the task spans electrical and gas appliances; the checked-in profile does not isolate the electrical portion as the occupation's defining scope.
- **Lift technician:** the work combines mechanical lift installation with electrical controls/connections; the available task profile does not establish that electrical installation is the role's principal remit.

They remain conditional rather than being promoted or removed on title/code alone.

## Sources and limits

The JSON artifact records the exact ESCO URI and task excerpt for each row. The local profile text is the source actually inspected; individual ESCO pages were not re-fetched during this pass, and visibly truncated descriptions were not reconstructed by guesswork.

- U.S. BLS describes electricians' installation, maintenance, inspection, diagnosis, and repair of wiring, controls, and lighting systems. [BLS: Electricians](https://www.bls.gov/ooh/construction-and-extraction/electricians.htm)
- BLS describes electrical power-line workers installing/repairing cables and wires in power/distribution systems. [BLS: Electrical Power-Line Installers and Repairers](https://www.bls.gov/ooh/installation-maintenance-and-repair/line-installers-and-repairers.htm)
- BLS documents electrical/electronic equipment work in manufacturing and transportation settings. [BLS: Electrical and Electronics Installers and Repairers](https://www.bls.gov/ooh/installation-maintenance-and-repair/electrical-and-electronics-installers-and-repairers.htm)
- BLS confirms lift roles include electrical wiring/control work alongside mechanical assembly and repair, which is why the D093 disposition remains conditional. [BLS: Elevator and Escalator Installers and Repairers](https://www.bls.gov/ooh/construction-and-extraction/elevator-installers-and-repairers.htm)
- BLS describes solar PV installers connecting panels to the electrical grid. [BLS: Solar Photovoltaic Installers](https://www.bls.gov/ooh/construction-and-extraction/solar-photovoltaic-installers.htm)

All BLS material is U.S.-specific corroboration, not a global occupational taxonomy. Detailed role evidence and source limitations are in [`D093_role_domain_fit_review_2026_10_05.json`](D093_role_domain_fit_review_2026_10_05.json).

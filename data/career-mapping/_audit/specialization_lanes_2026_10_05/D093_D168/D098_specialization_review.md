# D098 — Precision Engineering and Toolmaking: specialization review

**Disposition:** Recommend four candidate student-facing areas, with the standalone metrology card left as the main taxonomy uncertainty. No canonical subgroup edit and no role assignment is made in this review.

## Current structure and scope issue

The three current subgroup labels—Toolmakers & CNC Machinists, Precision Instrument Makers, and Product Quality Inspectors—are ISCO-derived occupational buckets, not a verified student taxonomy. The first combines component machining with production-tool construction; the second points to a recognizable instrument/optical-device practice; the third is too broad because product inspection occurs across industries. Current member counts were not used to decide the proposed count.

The parent description itself needs a later scope reconciliation: it centers on small, precise components and instruments, but also includes inspection of electronics and generic products. This review therefore does not use those generic inspection links as proof of D098 role fit. Every role-to-parent-domain mapping remains a separate task-based decision.

## Proposed areas

1. **Precision Machining and Component Manufacturing** — plan and produce accurately dimensioned components through precision machining, CNC processes and in-process measurement.
2. **Tool, Die and Mould Making** — design, machine, assemble, try out, maintain and repair production tooling, jigs and fixtures.
3. **Precision Instruments and Optical Devices** — design, assemble, test, calibrate, service or repair precision measurement, optical and related mechanical instruments.
4. **Dimensional Metrology and Measurement Systems** — develop, select, operate and validate dimensional measurement methods and instruments, including calibration, uncertainty and traceability.

WorldSkills’ international CNC Turning and CNC Milling standards distinguish precision component-production workflows, including process planning, machine programming/setup and dimensional verification. Official curricula and occupational frameworks in China, Japan, India and the UK independently corroborate tool/die making, precision instrument education and optical-device manufacture/repair. NIST describes dimensional metrology as a technical practice supporting precision manufacturing. These sources establish recognizable practices—not a universal four-card taxonomy. [CNC Turning](https://worldskills.org/what/projects/wsos/2024/events/579/skills/1658/), [CNC Milling](https://worldskills.org/what/projects/wsos/2024/events/579/skills/1661/), [Tsinghua Precision Instrument education](https://www.tsinghua.edu.cn/dpien/Education/Education_Overview.htm), [University of Tokyo Precision Engineering curriculum](https://www.pe.t.u-tokyo.ac.jp/en/curriculum.html), [NIST Dimensional Metrology](https://www.nist.gov/pml/sensor-science/dimensional-metrology).

## Why four, and what remains uncertain

Four is the current recommendation because the principal outputs differ: accurately made components; production tooling; precision instruments/devices; and measurement systems/results. Metrology is both cross-cutting and a distinct technical practice. NIST, Tsinghua and Tokyo support its distinctness, but this evidence does not yet prove that learners need a separate D098 card rather than metrology themes shared across the other paths. The three-area alternative (merge metrology into the other areas) remains viable pending broader comparative curricula and a clearer D098 parent boundary.

Generic quality assurance/inspection is not proposed as an area: it is cross-industry. Keep dimensional measurement, calibration and traceability visible as relevant learning, without reclassifying every quality inspector into D098. Do not split out each CNC process, machine, instrument type or inspection method absent a distinct learner route.

## Computational cross-check

The catalogue scanner reports **2 lexical hits** across algorithm/optimization and statistics/quantitative categories. Both occur in role-competency text (product assembly inspection and tool-and-die making); they describe statistical analysis and quality/cycle-time optimization. This is candidate-scan evidence only. It does **not** establish a computational specialization. CAD/CAM, CNC programming, optimization and statistics are task-linked methods/tools within appropriate areas. No dedicated computational card is recommended for D098 from this evidence.

## Geographic and evidence limits

WorldSkills is an international occupational benchmark, not an accreditor. Tsinghua and Tokyo are institution-specific curricula (China and Japan); DGT India and Skills England standards are country-specific training/occupational sources, used only to corroborate practice boundaries. The UK spectacle-maker standard is retired; it is not current qualification guidance. NIST is a U.S. national metrology institute: its technical field description is relevant, but it does not establish global workforce prevalence or universal requirements. Full locators, claim limits and alternatives are machine-readable in `D098_specialization_review.json`.

## State and verification

- Candidate recommendation: **4 areas**.
- Explicit residual: whether Dimensional Metrology merits its own card or is a shared theme (**1 unresolved taxonomy boundary**).
- Generic product QA as a D098 specialization: **rejected**.
- Role→domain review: **separate / not completed by this artifact**.
- Role→specialization review: **deferred** until the specialization catalogue is complete.
- Canonical data changed: **no**.
- Computational candidate count: **2 hits, no computational specialization recommendation**.

Run `python -m pytest -q data/career-mapping/_audit/specialization_lanes_2026_10_05/D093_D168/test_d098_specialization_review.py`.

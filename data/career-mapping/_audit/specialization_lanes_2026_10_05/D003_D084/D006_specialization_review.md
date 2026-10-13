# D006 — Internet of Things and Embedded Systems

Status: source-reviewed candidate set recommended; no role placement or canonical taxonomy implementation in this review.

## Finding

The current display has two broad SFIA-derived subgroup labels and one raw ISCO heading. The first joins IoT engineering with sensing; the second combines IoT software and systems; neither states a crisp student-facing boundary. “Science and engineering associate professionals” is an occupational aggregation, not a specialization name. This review does not use current role counts or ISCO membership to set the candidate count and does not decide any member role’s fit.

## Proposed student-facing areas

| Area | Plain-language scope | Boundary |
|---|---|---|
| Embedded Systems and Firmware Engineering | Build software close to device hardware, including microcontrollers, hardware interfaces, constrained resources, timing behavior and device-level testing. | Device-level implementation; not every sensor discipline or an end-to-end IoT backend. |
| IoT Architecture and Systems Integration | Connect devices, gateways, communications, data services and applications into an interoperable IoT system. | Whole-system structure and integration; detailed telecom/network engineering and cybersecurity are not duplicated wholesale. |
| IoT Edge Computing Systems | Place and operate computation and services near devices/network access when latency, bandwidth, resilience or local autonomy require it. | A compute-placement/system specialization, not a synonym for embedded firmware, cloud, or IoT architecture as a whole. |

Three is an internal synthesis, not a count mandated by a source. The areas are separated by their primary boundary: device implementation, end-to-end IoT integration, and compute placement at the edge.

## Evidence and limits

- [ISO/IEC 30141:2024](https://www.iso.org/standard/88800.html), public abstract and edition information: current international IoT reference architecture standard; its public table of contents separates functional, trustworthiness and construction viewpoints and includes architecture/design patterns. Supports system architecture as a distinct concern, not three learner subgroups.
- [NIST SP 800-183, Networks of 'Things](https://csrc.nist.gov/pubs/sp/800/183/final), publication abstract: treats sensing, computing, communication and actuation as core IoT primitives and notes distributed-system concerns such as heterogeneity, timing, reliability and security. These are system functions/concerns, not automatically separate specialization cards.
- [NIST SP 1500-201, Framework for Cyber-Physical Systems](https://www.nist.gov/publications/framework-cyber-physical-systems-volume-1-overview), abstract and framework summary: defines interacting digital, analog, physical and human components; distinguishes conceptualization, realization and assurance; treats manufacturing, transport, energy and healthcare as application domains. Supports embedded/CPS engineering context, not a fixed subgroup count.
- [ETSI white paper on MEC in IoT](https://www.etsi.org/images/files/ETSIWhitePapers/ETSI-WP59-Enabling-Multi-access-Edge-Computing-in-iot.pdf), introduction and Figure 1, printed pp. 4–5: distinguishes devices, edge nodes/network edge, core network and cloud and explains the latency/bandwidth motivation for moving compute toward the edge. Supports edge as a distinguishable deployment concern, not a universally required subgroup.
- [Arm Keil MDK guide](https://documentation-service.arm.com/static/68877744da264e793aeec228), §5: describes modular components used to build software for microcontroller families and embedded platforms. This is vendor technical guidance illustrating device-level embedded development, not a neutral occupational standard.

## Boundary decisions

- Sensing and actuation remain fundamental IoT functions that can occur in device and system work; current evidence does not require a separate card.
- IoT communications remain part of system integration, while broad network engineering belongs to the separate Telecommunications domain when that is the primary scope.
- Security, privacy, safety and trustworthiness are cross-cutting concerns, not an automatic extra IoT subgroup; Cybersecurity is separately represented in the catalogue.
- Healthcare, energy, manufacturing and transport are application contexts, not automatically engineering specializations.
- No role IDs or links were reviewed or approved. A later role-domain audit must stand independently; specialization placement follows only after the area taxonomy is settled.

This is an internal recommendation, not academic accreditation or external sign-off. Source locators, claim limits and the full decision record are in `D006_specialization_review.json`.

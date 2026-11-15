# D006 Internet of Things — bounded source capture (2026-10-29)

Status: source capture in progress; candidate area taxonomy and canonical role routes are unchanged. The fixed packet is 3 areas × 24 cells and 6 task tracks per area. This source capture does not resolve role fit.

## Sources captured

| ID | Source | Area | Finding | Limit |
|---|---|---|---|---|
| D006-S01 | [ISO/IEC 30141:2024 IoT reference architecture](https://www.iso.org/standard/88800.html) | Architecture/integration | Current IoT reference architecture; supports systems architecture as an explicit engineering concern. | Public abstract does not prescribe specializations or roles. |
| D006-S02 | [NIST SP 800-183 Networks of Things](https://csrc.nist.gov/pubs/sp/800/183/final) | Architecture; embedded | IoT system model spans sensing, computing, communication, actuation and distributed system concerns. | Technical model, not a curriculum or occupation taxonomy. |
| D006-S03 | [NIST CPS Framework Vol. 1](https://www.nist.gov/publications/framework-cyber-physical-systems-volume-1-overview) | Embedded/firmware | CPS connects digital, physical and human components and includes realization and assurance concerns. | Framework categories do not dictate a fixed specialization count. |
| D006-S04 | [Arm Keil MDK guide](https://documentation-service.arm.com/static/68877744da264e793aeec228) | Embedded/firmware | Illustrates microcontroller firmware and modular embedded software components. | Vendor implementation guidance. |
| D006-S05 | [ETSI MEC in IoT white paper](https://www.etsi.org/images/files/ETSIWhitePapers/ETSI-WP59-Enabling-Multi-access-Edge-Computing-in-iot.pdf) | Edge; architecture | Describes device, edge, network and cloud placement; edge computing responds to latency, bandwidth and service requirements. | Practitioner/standards-community paper, not neutral taxonomy or universal architecture. |
| D006-S06 | [NISTIR 8259 Rev. 1 (2026)](https://csrc.nist.gov/pubs/ir/8259/r1/final) | Device lifecycle/security | Current manufacturer lifecycle activities for secure IoT product development and support. | Recommended guidance; applicability depends on product/customer/risk profile. |
| D006-S07 | [NISTIR 8259A/B capability catalog](https://pages.nist.gov/IoT-Device-Cybersecurity-Requirement-Catalogs/) | Device lifecycle/security | Device identity/configuration, data protection, interface access, updates and state awareness; manufacturer documentation/support capabilities. | Capability baseline is not a claim every device implements every feature. |
| D006-S08 | [NIST SP 800-213 series](https://www.nist.gov/itl/applied-cybersecurity/nist-cybersecurity-iot-program/sp-800-213-series) | Architecture/security | Connects organizational requirements to IoT device capabilities and profiles. | Federal context and profiles must not be universalized. |
| D006-S09 | [IETF RFC 7252 CoAP](https://datatracker.ietf.org/doc/rfc7252/) | Embedded/network | Constrained application protocol for low-power/lossy networks and constrained nodes; one option alongside other protocols. | Proposed Standard with updates/errata; protocol choice is use-case specific. |
| D006-S10 | [oneM2M developer basics](https://onem2m.org/using-onem2m/developers/basics) | Architecture/integration | Service layer sits between IoT applications and connectivity; common services include device management, registration and security. | oneM2M architecture is one standards ecosystem, not a required stack. |
| D006-S11 | [OPC UA core and companion specifications](https://opcfoundation.org/about/opc-technologies/opc-ua/ua-companion-specifications/) | Industrial integration | Information models and services support industrial device/system interoperability, including IIoT. | Industrial context and access/licensing of specifications vary. |
| D006-S12 | [AWS IoT Greengrass architecture](https://docs.aws.amazon.com/greengrass/v2/developerguide/how-it-works.html) | Edge | Runs components locally, processes/filters data, supports MQTT and remote fleet management. | AWS-specific architecture; components and cloud service are optional. |
| D006-S13 | [AWS Greengrass component deployment and dependency resolution](https://docs.aws.amazon.com/greengrass/v2/developerguide/manage-deployments.html) | Edge; integration | Deployment targets device fleets and resolves platform/component version dependencies. | Product documentation; not a general edge orchestration standard. |
| D006-S14 | [Zephyr Project documentation](https://docs.zephyrproject.org/latest/) | Embedded/firmware | RTOS kernel, device drivers, board bring-up, application and production paths. | Open-source project docs; supported targets and APIs are version-specific. |
| D006-S15 | [Zephyr OTA / MCUboot guidance](https://docs.zephyrproject.org/latest/zephyr.pdf) | Embedded; device lifecycle | Firmware updates use signed images and bootloader/partition processes; update security is a system design concern. | One implementation path; product risk and hardware constrain update design. |
| D006-S16 | [Thread overview](https://threadgroup.org/What-is-Thread/Overview) | Architecture/connectivity | IPv6-based low-power mesh networking and device-to-device/cloud connectivity for home/building IoT. | Thread focuses on a network technology; application layer and certification choices remain separate. |
| D006-S17 | [Thread 1.4 features](https://threadgroup.org/resources) | Architecture; emerging/current | Credential sharing, commissioning at scale, network diagnostics and infrastructure connectivity. | Vendor/industry group claims; specific features depend on version and product certification. |
| D006-S18 | [Thread Group Sub-GHz project (2026)](https://threadgroup.org/newsroom/blog/thread-group-is-bringing-thread-to-sub-ghz) | Emerging connectivity | New work to extend IP mesh networking to Sub-GHz for industrial/commercial range needs. | Work is underway, not a published specification or deployed capability guarantee. |
| D006-S19 | [Arduino Cloud documentation](https://docs.arduino.cc/arduino-cloud/) | Tools; device/cloud integration | Device provisioning, dashboards, APIs, OTA and telemetry workflows for connected-device projects. | Vendor platform example; not a universal IoT cloud stack. |
| D006-S20 | [NIST IoT device definition FAQ](https://www.nist.gov/itl/applied-cybersecurity/nist-cybersecurity-iot-program/faqs) | Domain foundations | Device combines physical-world transducer capability with a network interface; may operate independently or depend on systems. | NIST scoping definition, not a universal legal or academic definition. |

## Bounded search findings and open reconciliation

- The three proposed areas have distinct outputs: firmware/device behavior; end-to-end system architecture and integration; and compute placement/services near devices. Edge may be an architecture choice inside an IoT system and should be optional unless latency, bandwidth, resilience or autonomy needs justify it.
- Protocols and platforms are alternatives/complements by layer: CoAP vs MQTT are messaging choices in some contexts; Thread is a low-power IP network, while oneM2M/OPC UA occupy service/information-model contexts; AWS Greengrass is an optional edge runtime; Zephyr/MCUboot are embedded firmware options. They are not substitutes across layers.
- Role denominator mismatch: D006 domain export lists 18 roles; its fit review has 17 records (4 supported, 6 conditional, 7 unresolved, 0 unsupported) and includes six candidate names absent from the domain export. Seven domain-list names are not represented in that fit review: deck officer, helmsman, maritime pilot, officer of the watch, ship captain, skipper, telecommunications engineer. Preserve as a role crosswalk issue; do not infer fit from title/ISCO or rewrite dispositions here.
- No local Nigerian employment search is recorded in this source batch yet. Do not claim local demand or no-hit until an explicit bounded local search is added.

## Terminal gate

Still open pending the generated matrix/task index, one targeted counter-search per area, local evidence check, and verification that all source/cell/task/role references resolve. Fixed closeout is 72 cells and 18 task tracks. No source-volume target; reopen only affected cells if counter-search finds material omitted evidence.

## Focused counter-search additions

| ID | Source | Area | Finding | Limit |
|---|---|---|---|---|
| D006-S21 | [Zephyr Device Firmware Upgrade](https://docs.zephyrproject.org/latest/services/device_mgmt/dfu.html) | Embedded/firmware | Device Firmware Upgrade handles image and bootloader interactions; transport/management protocol remains a separate concern. | Zephyr-specific implementation. |
| D006-S22 | [Zephyr Trusted Firmware-M overview](https://docs.zephyrproject.org/latest/services/tfm/overview.html) | Embedded/security | Secure services include isolation, embedded cryptography, secret management, signed firmware verification and attestation. | Platform support and security tradeoffs vary. |
| D006-S23 | [Azure IoT Edge ML inference architecture](https://learn.microsoft.com/en-us/azure/architecture/guide/iot/machine-learning-inference-iot-edge) | Edge/ML | Model inference can run locally; model deployment/update design must account for offline devices, bandwidth and image size. | Microsoft/Azure example; not a universal edge ML pattern. |
| D006-S24 | [Azure IoT Edge GPU tutorial](https://learn.microsoft.com/en-us/azure/iot-edge/configure-connect-verify-gpu) | Edge/ML | GPU-backed inference is a concrete current deployment option on supported hardware/software. | Specific Azure and GPU VM configuration; not a device baseline. |
| D006-S25 | [NITDA National Centre for AI and Robotics](https://nitda.gov.ng/ncair/) | Nigeria context; edge/IoT | Official Nigerian R&D centre lists IoT, robotics, AI, digital fabrication and applied research as focus areas. | Institutional remit is evidence of an R&D ecosystem, not job demand or national capacity. |
| D006-S26 | [USPF Emerging Technologies Center](https://uspf.gov.ng/programmes/access/117-etc-emerging-technologies-center) | Nigeria context; edge/IoT | Public programme describes an Ogun State institute pilot and planned IoT, AI, edge-computing and training activities. | Programme description/project scope; not proof that every listed capability is operational or a labor-market estimate. |

## Counter-search scope added

- Embedded: firmware update transport is distinct from image management/bootloader; secure boot, device identity/attestation and firmware lifecycle add concrete prerequisites.
- Edge: local inference adds model packaging, hardware acceleration, intermittent connectivity and model-update concerns; this is optional specialization depth tied to workload constraints.
- Nigeria: NITDA and USPF provide official activity examples; these do not establish prevalence or hiring demand.

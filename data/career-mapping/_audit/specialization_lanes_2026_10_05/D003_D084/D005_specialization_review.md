# D005 — Cloud Computing and DevOps

Status: source-reviewed candidate set recommended; no role placement or canonical taxonomy implementation in this review.

## Finding

The checked-in structure has three visible subgroup cards, all sourced from ISCO-derived records: “Cloud Infrastructure & Development and Operations,” “Cloud Technical Support,” and “Electrical and electronic trades workers.” These are not a coherent set of student-facing areas of specialization: one combines multiple functions, one is a support-function label, and one is an occupational family label. This structural judgment does not determine whether any individual role belongs under D005; role-to-domain and role-to-area fit remain out of scope here.

## Proposed student-facing areas

| Area | Plain-language scope | Boundary |
|---|---|---|
| Cloud Architecture and Infrastructure | Design cloud environments and provision compute, storage, networking and service components. | NIST IaaS/PaaS/SaaS are service models, not specialization cards. |
| Cloud Platform Engineering | Build and evolve shared cloud-native platforms and self-service capabilities for application teams. | Not merely a cloud provider's managed services or a list of infrastructure products. |
| DevOps and Software Delivery | Automate and connect build, test, integration, deployment and release practices across development and operations. | A practice area, not a role family; do not create a card for each pipeline tool. |
| Cloud Operations and Reliability Engineering | Operate cloud services and improve availability, performance, capacity, observability, incident readiness and resilience. | Distinct from infrastructure design and delivery automation. |

Four is an internal display synthesis, not a count required by any source. No role count or ISCO group determined it.

## Evidence and limits

- [NIST SP 500-292, *Cloud Computing Reference Architecture*](https://nvlpubs.nist.gov/nistpubs/legacy/sp/nistspecialpublication500-292.pdf), §2.1 and Table 1, printed pp. 3–4 / PDF pp. 9–10, distinguishes cloud consumers, providers, carriers, auditors and brokers; Appendix A, printed pp. 20–21 / PDF pp. 26–27, defines SaaS, PaaS and IaaS. This supports architectural/service distinctions, not the four-card taxonomy. It is an older US reference, not a global job or academic taxonomy.
- [CNCF Platforms White Paper announcement and paper](https://www.cncf.io/blog/2023/04/11/announcing-a-white-paper-on-platforms-for-cloud-native-computing/), overview and linked white paper: internal platforms provide common capabilities to application/product teams. Practitioner evidence for a distinct platform-engineering area; not a role-assignment or academic mandate.
- [CNCF Platform Engineering Maturity Model](https://tag-app-delivery.cncf.io/whitepapers/platform-eng-maturity-model/), “What is platform engineering?” and “How to use this model”: platform engineering plans/provides computing platforms, while implementations vary and model aspects are evaluated independently. It corroborates the area but does not prescribe subgroup count.
- [Google SRE](https://sre.google/), “What is Site Reliability Engineering?” and “What we do as SRE”: production reliability concerns include availability, latency, performance and capacity. This is a strong industry example, not a universal standard.
- [FinOps Foundation Framework Phases](https://www.finops.org/framework/phases/), Inform/Optimize/Operate: cloud cost and usage optimization is collaborative across engineering, finance and business and spans technology categories. That argues against making FinOps a cloud-only specialization by default.

## Boundary decisions

- Cloud security and privacy remain important cross-cutting topics; do not add a D005 fifth area solely because they matter to cloud work, especially since Cybersecurity is a separate parent domain. Any overlap needs the independent role/domain audit.
- FinOps is cross-technology and cross-functional, not cloud-only.
- IaaS/PaaS/SaaS and public/private/hybrid cloud are service or deployment models, not student specialization labels.
- No role IDs or links were evaluated, approved, or changed here.

## Limits

This is an internal, evidence-backed recommendation, not academic accreditation or external sign-off. The sources establish meaningful functional distinctions but do not prescribe a universal subgroup taxonomy or exact count. The candidate set is not claimed to exhaust every emerging cloud practice.

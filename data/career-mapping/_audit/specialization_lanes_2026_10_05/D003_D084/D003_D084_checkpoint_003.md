# Specialization lane checkpoint 003 — D003–D084

Date: 2026-10-05

## Scope and ownership

- This checkpoint covers D003–D084. D001–D002 remain excluded; the separate local lane beginning at D085 is not modified.
- The active task is area-of-specialization taxonomy only: assess whether areas are warranted, and justify count, names, boundaries and fit to the parent domain with global/cross-regional professional, industry and academic evidence.
- Role-to-domain and role-to-specialization fit are out of scope. Do not infer fit from ISCO or subgroup membership. No skill/tool/certification enrichment is included.
- Shared `domain_specialization_review_2026_10_03.json` and canonical taxonomy remain untouched. Decisions stay in this lane folder.

## Progress

- Lane scope: 82 domains (D003–D084).
- Source-reviewed candidate sets: 4/82 (D003, D004, D005, D006).
- Remaining source reviews: 78/82 (D007–D084).
- D003–D005 are carried forward from checkpoints 001–002; not repeated here.
- D006 review recommends three synthesized student-facing areas: Embedded Systems and Firmware Engineering; IoT Architecture and Systems Integration; IoT Edge Computing Systems. This is an internal taxonomy recommendation, not a source-mandated count.
- D006's two broad SFIA-derived visible labels and one raw ISCO heading were assessed as display structure only. No role assignments or individual role fits were reviewed.

## D006 evidence checked

- ISO/IEC 30141:2024 public abstract and table of contents: IoT reference architecture and functional, trustworthiness and construction viewpoints; full standard content was not assumed from the public listing.
- NIST SP 800-183: sensing, computing, communication and actuation as IoT system primitives.
- NIST SP 1500-201: cyber-physical system components, engineering facets/aspects, and application domains.
- ETSI MEC/IoT white paper, introduction and Figure 1, printed pp. 4–5: devices, edge, network and cloud placement; latency/bandwidth rationale.
- Arm Keil MDK guide §5: modular microcontroller/embedded software components; used only as illustrative vendor technical evidence.

## Files and verification

- `D006_specialization_review.json`
- `D006_specialization_review.md`
- `test_d006_specialization_review.py`
- Verification: `python -m pytest -q data/career-mapping/_audit/specialization_lanes_2026_10_05/D003_D084` — **15 passed**.

## Next

Continue at D007. Preserve the specialization-only boundary; do not alter canonical data, shared registers, or role-fit lanes.

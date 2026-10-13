# Global area-of-specialization canonical apply — 2026-10-07

Applied the 708 reconciled recommendations into `domain_structure.json` as `areas_of_specialization`, preserving the existing subgroup records and all other domain fields.

**Terminology:** subgroup = area of specialization = area of practice.

This is a canonical source-data application, but it is not a student release: student visibility remains off until role routes, area-linked evidence, and seed/API migration are complete.

- Domains: 168
- Areas applied: 708
- No-area decisions: 4
- Area records without an exact area-linked source reference: 435
- Domains with open source/review notes: 49
- Domains with parent/root/neighbor-scope-related notes (text-screened, not adjudicated): 8
- Active unique roles: 3391
- Current parent-domain status counts: `{"conditional": 1012, "supported": 2379}`
- Latest complete role-area lane status counts: `{"alias_existing": 3, "direct_domain_role": 2, "direct_or_supported_route": 43, "review_required": 3312, "supported": 10, "supported_manual_task_and_area_evidence": 21}`

The machine-readable report lists every remaining evidence gap and domain disposition. No role files or runtime/API code were changed by this apply.

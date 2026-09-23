# Full-population admin/report audit tranche

Generated: 2026-09-21
Mode: read-only local audit; no existing inventory, seed, SQL, UI or browser-proof file was changed.

## Bounded tranche

Selection: first 20 canonical programme keys after lexical sort.
- Programmes audited: **20**.
- JAMB identities referencing these programme components: **54**.
- Full-population reference: **237 programmes / 420 JAMB identities**.

## Gate results

- `curriculum_contract_gate`: **PASS**.
- `active_mapping_gate`: **PASS**.
- `ownership_provenance_gate`: **PASS**.
- `resource_review_gate`: **FAIL / DEFERRED**.
- `relationship_review_gate`: **FAIL / DEFERRED**.
- `admin_render_gate`: **FAIL / DEFERRED**.
- `admin_static_surface_gate`: **PASS**.
- `jamb_component_source_gate`: **PASS**.
- `jamb_review_queue_closed`: **FAIL / DEFERRED**.
- `browser_proof_gate`: **FAIL / DEFERRED**.
- `live_sql_gate`: **FAIL / DEFERRED**.

## Per-programme queue findings

| Programme | Curriculum | Active links | Resource queue | Relationship queue | Unresolved | Admin queue |
|---|---:|---:|---|---|---:|---|
| Administration and Management::Accounting | yes | 11 | `review_required` | `not_established` | 80 | `pending_full_population_render` |
| Administration and Management::Actuarial Science | yes | 11 | `review_required` | `not_established` | 198 | `pending_full_population_render` |
| Administration and Management::Aviation Management | yes | 9 | `review_required` | `not_established` | 20 | `pending_full_population_render` |
| Administration and Management::Business Administration | yes | 14 | `review_required` | `not_established` | 180 | `pending_full_population_render` |
| Administration and Management::Business Information Technology | yes | 8 | `review_required` | `not_established` | 176 | `pending_full_population_render` |
| Administration and Management::Co-operative and Rural Development | yes | 13 | `review_required` | `not_established` | 60 | `pending_full_population_render` |
| Administration and Management::Employment and Human Resource Management | yes | 6 | `review_required` | `not_established` | 140 | `pending_full_population_render` |
| Administration and Management::Entrepreneurship | yes | 8 | `review_required` | `not_established` | 80 | `pending_full_population_render` |
| Administration and Management::Finance / Banking and Finance | yes | 16 | `review_required` | `not_established` | 258 | `pending_full_population_render` |
| Administration and Management::Hospitality and Tourism Management | yes | 6 | `review_required` | `not_established` | 20 | `pending_full_population_render` |
| Administration and Management::Information Resource Management | yes | 7 | `review_required` | `not_established` | 80 | `pending_full_population_render` |
| Administration and Management::Insurance | yes | 10 | `review_required` | `not_established` | 60 | `pending_full_population_render` |
| Administration and Management::Local Government and Development Studies | yes | 12 | `review_required` | `not_established` | 80 | `pending_full_population_render` |
| Administration and Management::Logistics and Supply Chain Management | yes | 9 | `review_required` | `not_established` | 138 | `pending_full_population_render` |
| Administration and Management::Marketing | yes | 9 | `review_required` | `not_established` | 138 | `pending_full_population_render` |
| Administration and Management::Office and Information Management | yes | 4 | `review_required` | `not_established` | 60 | `pending_full_population_render` |
| Administration and Management::Petroleum Information Management | yes | 11 | `review_required` | `not_established` | 294 | `pending_full_population_render` |
| Administration and Management::Procurement Management | yes | 6 | `review_required` | `not_established` | 60 | `pending_full_population_render` |
| Administration and Management::Project Management | yes | 3 | `review_required` | `not_established` | 20 | `pending_full_population_render` |
| Administration and Management::Public Administration | yes | 4 | `review_required` | `not_established` | 80 | `pending_full_population_render` |

## Admin/report surfaces audited

- `admin_client_programme_intelligence`: **PASS** (src/lib/adminData.ts).
- `admin_skills_gap_render`: **PASS** (src/screens/admin/SkillsGapScreen.tsx).
- `admin_evidence_queue_render`: **PASS** (src/components/admin/AdminGuidanceEvidencePanel.tsx).
- `admin_api_scope_and_contract`: **PASS** (backend/routes/institutions_routes.py).
- `report_route_context_gate`: **PASS** (backend/routes/student_pipeline_routes.py).
- `report_review_ui_gate`: **PASS** (src/screens/careerIntelligence/GuidedFieldSelectionScreen.tsx).
- `report_button_gate`: **PASS** (src/components/careerIntelligence/GuidanceReportButton.tsx).
- `report_generation_boundary`: **PASS** (backend/services/guidance_report.py).

## Exact failing gates

- `resource_queue_closed` failed for **20/20** programmes.
- `relationship_queue_closed` failed for **20/20** programmes.
- `admin_render_queue_closed` failed for **20/20** programmes.
- `jamb_component_source_gate` passed for all 54 linked JAMB identities.
- `jamb_review_queue_closed` failed for 10 JAMB identities: Business Administration, Marketing, Entrepreneurship, Insurance, Procurement Management, Actuarial Science, Project Management, Logistics and Supply Chain Management, Employment and Human Resource Management, Aviation Management.

The resource and relationship failures are explicit review queues, not evidence that generic links or inferred edges are acceptable. `browser_proof_gate` and `live_sql_gate` are deferred by instruction and are not claimed complete.

## Smallest concrete local fixes before final browser/SQL phase

1. Close or explicitly enrich each tranche programme's resource review queue with item-specific authoritative evidence; retain review_required when evidence is absent.
2. Resolve the tranche's not_established/review_required relationship rows only from exact endpoint evidence; do not infer edges from names or source frequency.
3. Replace pending_full_population_render with a recorded per-programme admin render acceptance artifact after exercising the admin route against the deployed contract.
4. Run the same deterministic tranche audit against live payloads after manual SQL, then run browser proof; local static checks alone cannot close those gates.

## JAMB subset

- Industrial Relations / Industrial and Labour Relations: `partial_curriculum_scope`, `ready_partial`, 1 matching component reference(s), 2 source reference(s).
- Industrial Relations and Personnel Management / Industrial Relations and Human Resource Management: `partial_curriculum_scope`, `ready_partial`, 1 matching component reference(s), 2 source reference(s).
- Policy and Administrative Studies: `combined_ccmas_curriculum`, `ready`, 1 matching component reference(s), 2 source reference(s).
- Political Science and Public Administration: `combined_ccmas_curriculum`, `ready`, 1 matching component reference(s), 2 source reference(s).
- Public Administration: `partial_curriculum_scope`, `ready_partial`, 1 matching component reference(s), 2 source reference(s).
- Public Administration and Local Govt: `partial_curriculum_scope`, `ready_partial`, 1 matching component reference(s), 2 source reference(s).
- Public Administration and Policy Studies: `partial_curriculum_scope`, `ready_partial`, 1 matching component reference(s), 2 source reference(s).
- Government and Public Administration: `combined_ccmas_curriculum`, `ready`, 1 matching component reference(s), 2 source reference(s).
- Banking and Finance: `partial_curriculum_scope`, `ready_partial`, 1 matching component reference(s), 2 source reference(s).
- Business Administration: `single_ccmas_full_curriculum`, `review_required`, 1 matching component reference(s), 2 source reference(s).
- Marketing: `single_ccmas_full_curriculum`, `review_required`, 1 matching component reference(s), 2 source reference(s).
- Entrepreneurship: `single_ccmas_full_curriculum`, `review_required`, 1 matching component reference(s), 2 source reference(s).
- Business Management: `partial_curriculum_scope`, `ready_partial`, 1 matching component reference(s), 2 source reference(s).
- Industrial Relations and Personnel Management: `partial_curriculum_scope`, `ready_partial`, 1 matching component reference(s), 2 source reference(s).
- Hotel and Tourism Management: `partial_curriculum_scope`, `ready_partial`, 1 matching component reference(s), 2 source reference(s).
- Insurance: `single_ccmas_full_curriculum`, `review_required`, 1 matching component reference(s), 2 source reference(s).
- Procurement Management: `single_ccmas_full_curriculum`, `review_required`, 1 matching component reference(s), 2 source reference(s).
- Finance: `partial_curriculum_scope`, `ready_partial`, 1 matching component reference(s), 2 source reference(s).
- Actuarial Science: `single_ccmas_full_curriculum`, `review_required`, 1 matching component reference(s), 2 source reference(s).
- Procurement: `partial_curriculum_scope`, `ready_partial`, 1 matching component reference(s), 2 source reference(s).
- Secretarial Administration: `partial_curriculum_scope`, `ready_partial`, 1 matching component reference(s), 2 source reference(s).
- Management: `partial_curriculum_scope`, `ready_partial`, 1 matching component reference(s), 2 source reference(s).
- Human Resources Management: `partial_curriculum_scope`, `ready_partial`, 1 matching component reference(s), 2 source reference(s).
- Project Management: `single_ccmas_full_curriculum`, `review_required`, 1 matching component reference(s), 2 source reference(s).
- Local Government Studies: `partial_curriculum_scope`, `ready_partial`, 1 matching component reference(s), 2 source reference(s).
- Accounting and Finance: `partial_curriculum_scope`, `ready_partial`, 1 matching component reference(s), 2 source reference(s).
- Cooperative and Rural Development: `partial_curriculum_scope`, `ready_partial`, 1 matching component reference(s), 2 source reference(s).
- Logistics and Supply Chain Management: `single_ccmas_full_curriculum`, `review_required`, 1 matching component reference(s), 2 source reference(s).
- Insurance and Actuarial Science: `partial_curriculum_scope`, `ready_partial`, 1 matching component reference(s), 2 source reference(s).
- Office and Information Technology / Information Resource Management: `partial_curriculum_scope`, `ready_partial`, 1 matching component reference(s), 2 source reference(s).
- Accountancy and Forensic Studies: `partial_curriculum_scope`, `ready_partial`, 1 matching component reference(s), 2 source reference(s).
- Finance and Investment: `partial_curriculum_scope`, `ready_partial`, 1 matching component reference(s), 2 source reference(s).
- Management Studies: `partial_curriculum_scope`, `ready_partial`, 1 matching component reference(s), 2 source reference(s).
- Entrepreneurship and Innovation: `partial_curriculum_scope`, `ready_partial`, 1 matching component reference(s), 2 source reference(s).
- Tourism Studies: `partial_curriculum_scope`, `ready_partial`, 1 matching component reference(s), 2 source reference(s).
- Employment and Human Resource Management: `single_ccmas_full_curriculum`, `review_required`, 1 matching component reference(s), 2 source reference(s).
- Accounting and Data Analytics: `partial_curriculum_scope`, `ready_partial`, 1 matching component reference(s), 2 source reference(s).
- Finance and Financial Technology: `partial_curriculum_scope`, `ready_partial`, 1 matching component reference(s), 2 source reference(s).
- Cooperative Management: `partial_curriculum_scope`, `ready_partial`, 1 matching component reference(s), 2 source reference(s).
- Cooperative Economics and Management: `partial_curriculum_scope`, `ready_partial`, 1 matching component reference(s), 2 source reference(s).
- Social Innovation and Entrepreneurship: `partial_curriculum_scope`, `ready_partial`, 1 matching component reference(s), 2 source reference(s).
- Entrepreneurship and Business Management: `partial_curriculum_scope`, `ready_partial`, 1 matching component reference(s), 2 source reference(s).
- Aviation Management: `single_ccmas_full_curriculum`, `review_required`, 1 matching component reference(s), 2 source reference(s).
- Aviation Security: `partial_curriculum_scope`, `ready_partial`, 1 matching component reference(s), 2 source reference(s).
- Personnel Management: `partial_curriculum_scope`, `ready_partial`, 1 matching component reference(s), 2 source reference(s).
- Industrial Relations and Human Resources Management: `partial_curriculum_scope`, `ready_partial`, 1 matching component reference(s), 2 source reference(s).
- Marketing and Consumer Studies: `partial_curriculum_scope`, `ready_partial`, 1 matching component reference(s), 2 source reference(s).
- Industrial Chemistry and Chemical Entrepreneurship: `partial_curriculum_scope`, `ready_partial`, 1 matching component reference(s), 2 source reference(s).
- Digital Entrepreneurship: `partial_curriculum_scope`, `ready_partial`, 1 matching component reference(s), 2 source reference(s).
- Aviation Business: `partial_curriculum_scope`, `ready_partial`, 1 matching component reference(s), 2 source reference(s).
- Hotel Management & Tourism: `partial_curriculum_scope`, `ready_partial`, 1 matching component reference(s), 2 source reference(s).
- Hotel Management and Tourism: `partial_curriculum_scope`, `ready_partial`, 1 matching component reference(s), 2 source reference(s).
- Supply Chain Management: `partial_curriculum_scope`, `ready_partial`, 1 matching component reference(s), 2 source reference(s).
- Transport Planning and Management: `partial_curriculum_scope`, `ready_partial`, 1 matching component reference(s), 2 source reference(s).

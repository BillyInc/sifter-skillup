# All-programme integration gap matrix (2026-09-19)

This is a compact, read-only integration checkpoint. It reconciles the
Sociology safeguards with the product-wide contract across all **237 parsed
programmes** (236 generic plus Sociology). It adds no implementation or SQL
changes, does not fetch URLs, and does not approve live exposure.

## Verified checkpoint register

| Checkpoint | Evidence | Boundary |
| --- | --- | --- |
| Sociology enrichment | `c0fe9ab` | Two source-linked learning resources; Docker remains `review_required`. |
| Generic enrichment | `a390022` | Psychology and Political Science candidates have retained official URLs; Common and Islamic Law remains `review_required`. |
| Downstream population | `c458064` | One audit record per 237 programmes; Sociology, Nursing and Accounting are smoke fixtures only. |
| Admin evidence | `57327c8`, `96cad64`, `627385b` | Admin/institution evidence and smoke gates; not a full 237-route render. |

## Gap matrix

| Surface | Full-population evidence | Current decision | Remaining gate |
| --- | --- | --- | --- |
| Programme population | 237 unique programme records; 236 generic + 1 Sociology | **PASS — audit coverage** | Render/API acceptance for every programme. |
| Curriculum | 81,429 course-outcome rows; 237 contracts; curriculum locator/state/count gaps are 0 | **PARTIAL — contract** | Render review and source-page reachability. |
| Programme → domain | 1,343 active evidence rows; 1 programme has no active mapping | **OPEN** | Review the unmapped programme and verify programme-specific explanations. |
| Context ownership/state | 126,414 typed rows; ownership/state/source-reference/locator gaps are 0; role-aggregate candidates are 0 | **PARTIAL — structural** | Record-level student review across all contexts. |
| Item resources/link state | Sociology: 51 reviewed URLs, 27 exact item matches, 698 honest no-link states; generic full inventory is incomplete | **OPEN** | Enrich with authoritative item-specific URLs; retain `no_link` when none is established. |
| Relationships | 422,739 catalogue rows; 2,305 unresolved/not-established rows; expanded programme view reports 21,238 unresolved and 21,238 not-established rows | **OPEN** | Research authoritative sources; promote only verified same-context endpoints with retained URLs/locators. |
| Source states | Source-backed rows may be student-visible only when ownership and evidence pass; review-only/not-established/audit-only rows remain staff evidence | **FAIL-CLOSED** | `review_required` and `not_established` stay out of student payloads until independently verified. |
| Student/admin boundary | Admin checkpoints cover provenance/review evidence; student contract excludes staff-only rows | **PARTIAL** | Full all-237 admin render plus student-leak negative checks. |
| Entry and downstream UI | 15 route-helper transitions across Sociology, Nursing and Accounting; population audit covers all 237 records | **PARTIAL — smoke only** | Browser/API traversal for every entry variant and programme; helpers are not browser proof. |
| Report gating | Local smoke proves Review gates print/download/share and relocks after path changes | **PARTIAL** | Live Supabase and browser report E2E. |
| SQL/live deployment | No SQL applied; local generation is not deployment evidence | **DEFERRED** | User applies documented migrations/seeds, then read-only preflight and count comparison. |
| Browser acceptance | No usable browser/dev-server surface in this environment | **BLOCKED / DEFERRED** | Capture rendered routes, Back/context behavior and unavailable states in a browser. |

## Source-linked, review-required and no-link contract

- A verified source record retains its authoritative HTTPS URL, locator and
  evidence limitation; a source reference alone does not promote a relationship.
- `review_required`, `not_established` and `audit_only` are explicit non-student
  states. They may appear in bounded admin/audit views only.
- `no_link` means no item-specific trusted destination was established. It is
  not permission to attach a generic homepage, and it is not evidence that the
  underlying item is invalid.
- The current all-programme catalogue has **126,414** rows without an explicit
  item-level link/no-link label. This is a schema/data-contract gap, not a claim
  that 126,414 links were disproved.
- External enrichment applies to curriculum, programme/domain evidence,
  resources, contextual items and relationships. Name similarity alone never
  creates a relationship.

## Deferred gates and handoff

The local scaling phase may continue with source-linked audits and fail-closed
UI work. Live SQL application, live payload verification, URL reachability,
browser acceptance and final all-programme admin/report approval remain
end-of-scaling gates. The authoritative local inputs are:

- `data/career-mapping/_audit/programme_scaling_contract_2026-09-19.json`
- `data/career-mapping/_audit/sociology_student_guidance_contract_2026-09-19.json`
- `data/career-mapping/_audit/relationship_backlog_inventory.json`
- `data/career-mapping/_audit/source_enrichment_batch_generic_2026-09-19.json`

No implementation or SQL file was changed by this audit checkpoint.

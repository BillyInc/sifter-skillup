# External-source enrichment agent inventory

Generated: `2026-09-21T13:34:46.357500+00:00`. This is a read-only design/inventory pass.

## Scope and exact remaining queues

The canonical contextual catalogue contains **126,414 item rows** and **422,739 relationship rows**. Because no canonical search ledger exists, every row still requires reconciliation against an authoritative, item-specific source—even rows currently marked linked or source-backed.

| Queue | Rows | Meaning |
|---|---:|---|
| Items — discovery | 116,124 | Current `no_link`, `missing` or `review_required` item states needing search |
| Items — verification | 5,253 | Existing linked states needing item-specific URL/locator/access-date verification |
| Relationships — discovery | 2,305 | `not_established`, unresolved, review-only or missing edges needing exact-edge search |
| Relationships — verification | 405,858 | Existing source-backed edges needing exact typed-endpoint verification |
| **All canonical rows pending ledger evidence** | **529,540** | Items plus relationships; no rows are silently treated as searched |

Current item states: `linked` 5,253, `no_link` 116,116, `review_required` 8.
Current relationship states: `not_established` 2,305, `source_backed` 405,858.

## Why the previous counts were misleading

`no_link` means the catalogue currently has no attached link; it does not mean an exhaustive internet search found nothing. `not_established` means the normalized relationship contract did not establish an exact edge; it does not mean every authoritative source was searched. The prior batch JSON files contain 36 candidate records, but they are not a canonical ledger and are therefore not deducted from the queues.

Prior batch claims on disk: **36** across 5 files; canonical ledger rows: **0**.

## Search protocol

1. Create a stable subject ID from context level, context key, typed item key, and (for edges) typed source/target keys plus relationship type.
2. Search exact name plus context using quoted phrases, official-domain filters and recorded aliases. Repeat with source identifiers, course codes, credential codes, product/version names and Nigerian institution/authority terms where applicable.
3. Open the candidate page or document. A search-result snippet, generic homepage, category page, search URL, unrelated provider page or co-occurrence is not evidence.
4. Record the authority, HTTPS URL, page/PDF section or stable anchor, access date, evidence summary, search queries, candidate URLs, context, confidence and limitations.
5. For a relationship, require one source (or a clearly joined evidence set) to identify both typed endpoints, the same context, and the specific `builds_on`/`works_with`/other relationship type. Technology definitions alone do not establish a role-specific edge.
6. Set `linked` only when the item or exact edge passes the evidence gate. Set `review_required` when the search was attempted but the evidence is generic, incomplete, conflicting, stale, or only supports one endpoint. Set `genuinely_unavailable` only after the minimum search attempts are fully recorded and no acceptable source exists.
7. Keep the ledger append-only and idempotent. A later source can supersede an earlier candidate, but it must not erase the earlier query, URL, locator, access date or decision.

## Authority routing

- Programme identity, eligibility and subject combinations: JAMB IBASS/brochure records; retain the exact programme locator.
- CCMAS curriculum: NUC CCMAS documents and official Nigerian university curriculum/course pages or PDFs; retain course code, page and row/section.
- Skills and competencies: the issuing standards body, official professional framework, official university teaching material or official public-sector guidance; a broad taxonomy landing page is supporting evidence, not automatically an item link.
- Tools and methods: official vendor documentation, standards/specification pages, official manuals or maintained project documentation for the exact named tool/method/version.
- Certifications and qualifications: the issuing body’s exact credential page and exam/eligibility guide; record whether it is a licence, examination, qualification, training route or reference body.
- Relationships: curriculum, workflow, standard or role-specific source that names both endpoints and the relationship in the current context. Never create an edge from frequency, adjacency, name similarity or a generic source category.

## Safety boundary

This pass writes only the new agent inventory/design artifacts. It does not modify SQL, generated gzip, UI, the canonical data catalogue, or browser proof. Student exposure remains fail-closed until the ledger, source review and downstream acceptance checks agree.

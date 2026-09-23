# External-source enrichment design and inventory contract

Status: design and inventory only. This pass does not apply SQL, modify
generated gzip, change UI code, or claim browser proof.

## Why a new contract is needed

The contextual catalogue has a current data state for each item and edge, but
those states are not an internet-search ledger. `no_link` means that no link is
currently attached. `not_established` means that the normalized relationship
contract did not establish an exact typed edge. Neither state proves that every
authoritative source was searched.

The existing batch artifacts are useful candidate evidence, but they are not a
canonical ledger: they do not reconcile every candidate to the current full
catalogue, and there is no append-only record containing one stable subject ID,
all queries, candidate URLs, selected evidence, locators, access dates and the
final decision. The inventory therefore keeps every current row in a queue.

The generated inventory is:

`data/career-mapping/_audit/external_enrichment_agent/external_enrichment_inventory_2026-09-20.json`

Its companion readable report is:

`data/career-mapping/_audit/external_enrichment_agent/external_enrichment_inventory_2026-09-20.md`

## Exact queues at this pass

The scan found:

| Queue | Rows | Why it remains open |
|---|---:|---|
| Item discovery | 125,414 | Current item state is `no_link`, `missing` or `review_required`; search has not been proven. |
| Item verification | 1,000 | Current item state is already linked, but no canonical ledger verifies the URL against the exact item. |
| Relationship discovery | 2,305 | Current edge is `not_established`, unresolved, review-only or missing. |
| Relationship verification | 420,434 | Current edge is source-backed, but no canonical ledger verifies the exact typed endpoints, context and relationship type. |
| **All rows requiring canonical search evidence** | **549,153** | 126,414 items + 422,739 relationships. |

Current catalogue totals are 126,414 contextual item rows and 422,739
relationship rows. The 237 canonical programmes and 420 canonical JAMB
identities remain the population boundary; they are not a substitute for the
contextual item/edge queue.

The relationship scan also reports 2,305 edges with a missing target/source
item type and 2,297 with a missing target/source item key. These are not
promotable relationships. They require endpoint resolution or a recorded
review/unavailable decision.

## Stable subject IDs

The agent must never identify work only by display name. Use:

```text
item:
  {context_level}|{context_key}|{item_type}|{item_key}

relationship:
  {context_level}|{context_key}|{from_item_type}|{from_item_key}|
  {to_item_type}|{to_item_key}|{relationship_type}
```

The ID is paired with a snapshot hash of the normalized subject fields. If a
name, context, type or endpoint changes, create a new revision and retain the
old decision rather than silently mutating the historical evidence.

## Search protocol for every item

Every item gets a recorded search attempt, including an item that already has
a link in the catalogue:

1. Normalize the exact name, context level/key, item type, domain/programme
   context, source IDs and source locators. Preserve the original display name
   and use aliases only as additional query terms.
2. Run an exact-name search with the context, then an official-domain search
   for the appropriate authority. Repeat with source identifiers, course codes,
   credential codes, product/version names, acronyms and Nigerian context when
   those fields exist.
3. Open candidate pages/documents. A result snippet, generic homepage, search
   URL, category landing page, unrelated course, or page that merely mentions
   a neighbouring concept is not item-specific evidence.
4. For a candidate to become `linked`, record the exact HTTPS URL, authority,
   page/PDF section or stable anchor, access date, evidence summary, context,
   link role and confidence. A source may be supporting evidence without being
   the item’s primary learning/official destination; record those roles
   separately.
5. For skills and competencies, prefer the issuing standards body, official
   professional framework, official university teaching material, or official
   public-sector guidance. A broad taxonomy landing page is supporting
   provenance, not automatically an item link.
6. For tools and methods, prefer the exact vendor documentation, official
   specification, maintained project documentation or official manual for the
   named product/method/version.
7. For certifications/qualifications, use the issuer’s exact credential page
   and exam/eligibility guide. Record whether it is a licence, examination,
   qualification, training route or reference body; do not turn an association
   or source category into a certification.

Minimum recorded search fields:

```json
{
  "subject_id": "...",
  "subject_kind": "item",
  "context": {"level": "role", "key": "D078|Sociologist"},
  "searched_at": "2026-09-20T...Z",
  "accessed_on": "2026-09-20",
  "queries": ["exact quoted query", "official-domain query"],
  "candidate_urls": ["https://..."],
  "decision": "linked|review_required|genuinely_unavailable",
  "evidence": [{
    "url": "https://...",
    "authority": "...",
    "locator": "page 4, section ... or HTML anchor ...",
    "accessed_on": "2026-09-20",
    "link_role": "learning|documentation|official_information|evidence",
    "confidence": "high|medium|low",
    "evidence_summary": "..."
  }],
  "limitation": "..."
}
```

`candidate_urls` records what was inspected; `evidence.url` records only a
source that passed the item-specific gate. Never replace a failed candidate
with a generic provider homepage.

For `genuinely_unavailable`, the minimum item search is three distinct query
forms (exact name plus context, alias/identifier form, and an authority-specific
form) and checks against at least two appropriate authoritative source routes,
unless the item type has only one legitimate issuing authority, which must be
recorded as a limitation. The searcher must open or inspect each usable
candidate and record why it failed. A timeout, robots denial or search-engine
failure is not evidence of unavailability; it remains `review_required` until
the search can be completed.

## Search protocol for every relationship

Relationships require a stricter pass than item links. Search the exact source
and target names together with the context and relationship vocabulary. Use
the local source locator only to find the relevant authority; it cannot itself
promote the edge.

An edge can be `linked` only if the evidence establishes all of the following:

- both typed endpoints resolve to the exact records in the same context;
- the source or joined evidence set states the relationship, not merely that
  both things occur on the same page;
- the relationship type is the one recorded (`builds_on`, `works_with`, or the
  approved typed relation); and
- the URL, locator, authority and access date are retained.

Examples of insufficient evidence:

- official documentation defining Python and a separate page defining C++;
- an occupation page listing a tool without naming the skill it supports;
- a tool appearing frequently beside another tool;
- a generic source category inherited from O*NET/ESCO;
- a programme curriculum that mentions a field but not the proposed downstream
  role or capability edge.

If the source supports both items but not the edge, record
`review_required`; do not promote it. If the source cannot resolve one or both
endpoints, retain the unresolved candidate and record the endpoint problem.

For `genuinely_unavailable`, the minimum relationship search is three distinct
query forms (exact source/target/context with the relation verb, alias or
identifier form, and an authority/source-locator follow-up) plus inspection of
at least two appropriate authoritative source routes. The record must explain
why each candidate failed to establish both typed endpoints, the same context
and the relation type. If one endpoint is unresolved, the final state cannot be
`linked`; it is `review_required` or `genuinely_unavailable` only after the
minimum endpoint search is complete.

Relationship record shape:

```json
{
  "subject_id": "...typed source and target...",
  "subject_kind": "relationship",
  "from": {"type": "skill", "key": "...", "name": "..."},
  "to": {"type": "tool", "key": "...", "name": "..."},
  "context": {"level": "role", "key": "..."},
  "relationship_type": "works_with",
  "queries": ["..."],
  "candidate_urls": ["..."],
  "decision": "linked|review_required|genuinely_unavailable",
  "evidence": [{"url": "...", "authority": "...", "locator": "...", "accessed_on": "..."}],
  "limitation": "..."
}
```

## Decision states

The agent uses these final decisions:

- `linked`: evidence passed the item or exact-edge gate. This is the only
  state eligible to become a student-facing verified link/relationship after
  the normal API and downstream checks.
- `review_required`: searches were attempted, but the result is generic,
  incomplete, conflicting, stale, only supports one endpoint, or needs a
  human decision. It remains staff/audit-only.
- `genuinely_unavailable`: the minimum search protocol completed, every query
  and candidate URL is recorded, and no acceptable authoritative item-specific
  destination or exact relationship evidence exists. It is an honest terminal
  result, not a shortcut.
- `not_searched`: internal queue state only. It must never be rendered as
  `no_link` or `genuinely_unavailable`.

For compatibility with current catalogue fields, `linked` can be mapped to an
approved `link_state=linked` or source-backed relationship only after the
ledger validator passes. `review_required` and `genuinely_unavailable` remain
out of student guidance. `not_established` is a current relationship data
state, not the final result of an exhaustive search.

## Authority routing and source retention

The searcher should route by claim type:

| Claim | Preferred authority / starting point | Locator requirement |
|---|---|---|
| JAMB identity/eligibility | JAMB IBASS (`https://eligibility.jamb.gov.ng/`) and official brochure | programme selector, brochure file/page/table |
| CCMAS curriculum | NUC CCMAS (`https://www.nuc.edu.ng/ccmas/`) and official Nigerian university course pages/PDFs | course code, page, section/table row |
| Skill/competency meaning | issuing standards body, official framework, university or public-sector source | named section, clause, page or anchor |
| Tool/method | official vendor/specification/project documentation | exact product/version, section or anchor |
| Certification | issuing body credential and exam/eligibility page | credential heading, exam guide section |
| Relationship edge | source naming both endpoints and the relation in context | exact paragraph/table/diagram/page |

Retain source URL, source title, authority, locator, access date, query,
evidence summary, confidence and limitation. Supporting provenance and the
student-openable item link are distinct fields. O*NET/ESCO/other taxonomies may
remain staff provenance, but legacy taxonomy URLs are not automatically
approved student item links.

The O*NET database (`https://www.onetcenter.org/database.html`) is a useful
occupation-data provenance source, but it is not a blanket student-facing link
for every role tool, skill or relationship. The exact item/edge gate still
applies.

## Incremental batching and reconciliation

Use deterministic queue order `(context_level, context_key, item/edge subject
ID)`. Partition each queue by a stable hash or fixed ID ranges, and write one
append-only batch plus a checksum after each completed batch. A batch is not
accepted until every record is one of the three final decisions and validates:

- HTTPS URL syntax and non-generic path for each evidence URL;
- authority, locator and access date present;
- item context/type/key exact match;
- relationship typed endpoints and relation exact match;
- no duplicate subject revision in the canonical ledger; and
- no promotion from a source that only defines one endpoint or a generic
  category.

The inventory deliberately does not create a false completion ledger. The next
enrichment pass should first create the canonical append-only ledger in the
permitted agent area, reconcile the 36 prior batch claims as candidates, then
process discovery and verification queues in deterministic shards. Only after
the full ledger and downstream audits agree should any later transport/SQL/UI
work consume the results.

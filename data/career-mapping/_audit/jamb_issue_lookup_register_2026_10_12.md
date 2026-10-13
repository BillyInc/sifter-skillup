# JAMB programme/institution issue lookup register — 2026-10-12

> Documentation only. Do not repair or promote JAMB records during the D078 Sociology guided-experience pass. Fixes are deferred until that pass is complete.

## Purpose and lookup

This register puts the existing JAMB completeness findings, unverified offering occurrences, and institution-scoped source-resolution residuals behind one shared issue list. Use the JSON index to start from either an institution or a programme, then follow its issue IDs to every associated issue type and evidence note.

- **420** canonical programme identities; **443** parsed programme/faculty source occurrences.
- **8117** generated institution–programme pairs; **690** normalized institution codes in this lookup index.
- Existing completeness ledger: **895** rows (national requirement layers and offering-occurrence verification).
- Existing institution-scoped source-resolution queue: **127** residual candidates, kept separate from national requirements.
- Joined lookup register: **772** issue/evidence records; see status and issue-type counts below.

## Current evidence counts

- National requirement blanks after existing overlays: **253** across UTME, O'Level and Direct Entry source text.
- National UTME/O'Level text needing structuring review: **50 UTME** and **137 O'Level** records. This means the current parser has not fully represented the text; it does not prove JAMB's wording is wrong.
- Offering occurrences without exact official PDF cell verification: **175/443**.
- Institution-scoped source candidates: **149** total; **22** exact rows; **127** residuals.
- Extracted institution tokens rejected by the current seed's code shape: **30** suspected token records. These are not automatically confirmed false schools; verify against the source cell.

### Register records by status

- `confirmed_local_data_gap`: **253**
- `review_required_not_proven_wrong`: **362**
- `review_required_source_candidate_not_executable_or_not_exact`: **127**
- `suspected_source_extraction_or_identity_issue`: **30**

### Register records by issue type

- `institution_scoped_requirement_source_resolution_residual`: **127**
- `national_requirement_missing`: **253**
- `national_requirement_needs_structuring_review`: **187**
- `offering_occurrence_lacks_exact_official_cell_verification`: **175**
- `suspected_institution_roster_token_contamination`: **30**

## Important interpretation rules

1. A blank effective national field is a confirmed gap in the local record, not proof that JAMB has no published requirement. Check the source before deciding the repair.
2. ‘Needs structuring review’ means the requirement text exists but the current matcher/parser has not fully represented its conditions. Do not label it incorrect without source adjudication.
3. A programme’s national requirement issue is linked to its listed institutions for lookup convenience only. The institution-specific rule may differ; inspect the local exception and official institution cell separately.
4. A roster occurrence lacking exact PDF verification is unverified, not automatically a wrong offering. Confirm the exact programme title and full awarder cell before changing a school/programme pair.
5. Scoped-source residuals are not promoted into national rules. Keep exam type and institution scope intact.
6. Deterministic IDs match the current seed generator: programme `uid('jamb', jamb_name)`, institution `uid('school', normalized_code)`, and offering `uid('sp', normalized_code, jamb_name)`. The canonical institution display name is currently the code; no long-form name is guessed.

## User-provided matcher questions — unverified; source validation required

The following context was supplied by the user for later research. It records hypotheses and questions, **not verified JAMB policy or an approved interpretation**:

- The user reports that phrases such as “any relevant subject” or “any suitable subject” may remain general in the IBASS brochure, and that a student may need to consult an institution-specific official bulletin or waiver to determine the applicable subjects.
- The user asks whether faculty/stream subject pools can help resolve those phrases to actual subjects for a particular programme, institution and stream, separately for UTME and O’Level. The pasted faculty/stream lists are presented as purportedly complete pools across both exam layers, but their completeness and authority have not been established.
- The user asks how the matcher should represent uncertainty and source provenance when the national wording is broad but an institution-specific source may narrow or alter the rule.

### Validation safeguards

- Do **not** treat the pasted faculty/stream lists as authoritative or complete subject pools. Do not treat a claim that a requirement is “exactly four subjects” as authoritative. Do not treat general search results, education aggregators, or summaries of brochure wording as proof of the applicable rule.
- Use those claims only as leads for a later source check. Verify each resolved subject pool against the source that actually governs that programme and exam layer: distinguish the national JAMB/IBASS requirement from an institution-specific official bulletin, prospectus, or documented waiver/exception.
- A resolved matcher rule must retain the exact source/authority, URL or repository locator, relevant page/table/cell or other precise locator, programme identity, institution scope (national or named institution), exam layer (UTME or O’Level), and the wording or evidence supporting each subject/pool. Do not silently convert a faculty-wide pool into a programme-specific or institution-specific rule.
- If authoritative sources do not establish which subjects satisfy “relevant/suitable,” preserve the ambiguity as review-required; do not guess from the programme name, faculty label, stream, or an aggregator.

### Questions for the deferred verification pass

1. In the official national source, what does “relevant” or “suitable” mean for each affected programme and exam layer, and does the source define a permitted subject pool?
2. Does an official institution source add, narrow, waive, or otherwise differ from the national rule for that programme? If so, what exact wording and institution scope support the exception?
3. Are any faculty/stream pools genuinely authoritative and exhaustive, or are they only explanatory search aids? Verify this independently for UTME and O’Level rather than assuming one pool applies to both.
4. What source-backed state should the matcher return when neither the national source nor an applicable institution source resolves the phrase? Preserve that uncertainty and show the governing source/provenance rather than presenting an inferred subject as confirmed.

No JAMB requirement, offering, subject option, matcher behavior, SQL/seed, or canonical record was changed by adding this note. Resolution is deferred to the later JAMB verification/fix pass.

## Coverage and limitations

The register joins local offering source JSON, the generated completeness ledger, the current institution-scoped resolution residuals, and the exact-occurrence inventory. It is not an official JAMB source re-verification, not a live database audit, and not a matcher test. A missing issue row is not proof that the underlying record is correct: the audit's current occurrence verification remains incomplete, and the source-specific residuals remain open.

## Reproduction

```powershell
python data/career-mapping/_audit/build_jamb_issue_lookup_register_2026_10_12.py
```

Machine-readable register: `data/career-mapping/_audit/jamb_issue_lookup_register_2026_10_12.json`.
Inputs: `jamb_data_completeness_ledger_2026_10_12.json`, `jamb_subject_scoped_resolution_2026_10_08.json`, `jamb_offering_context_inventory_2026-09-25.json`, and the nine `jamb/*_offerings.json` files.

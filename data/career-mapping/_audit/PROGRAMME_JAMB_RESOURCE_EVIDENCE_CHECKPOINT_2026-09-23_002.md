# Programme/JAMB resource-evidence checkpoint 002 — 2026-09-23

Append-only local checkpoint. This checkpoint records the state immediately
before the next enrichment ledger is written. No SQL, live database, frontend,
backend implementation, generated seed, or browser acceptance proof was
changed.

## Reconciled scope

| Queue | Count | Current state |
|---|---:|---|
| Canonical programmes | 237 | Reconciled against the existing 12 programme JSONL batches |
| Programme review records | 237 | Existing records are `review_required`; official NUC curriculum evidence retained |
| Programme resource rows in catalogue | 473 | Existing NUC CCMAS and open-foundation inputs retained |
| Canonical JAMB identities | 420 | Reconciled against the canonical inheritance audit |
| JAMB identities requiring external-domain review | 86 | Reconciled against `mapping_status=review_required` |
| JAMB/domain link occurrences in the 86-row slice | 711 | Existing CCMAS/domain evidence retained |
| JAMB/domain component pairs | 559 | Existing programme/component/domain boundary retained |
| JAMB link occurrences with sufficient Nigerian CCMAS anchors | 547 | Candidate for link-level confirmation only; enclosing identities remain under review |
| JAMB link occurrences with insufficient anchors | 153 | `review_only` |
| JAMB link occurrences with no Nigerian CCMAS anchor | 11 | `genuinely_unavailable` for programme-fit evidence |

## Files already present and used as inputs

- `data/career-mapping/_audit/programme_jamb_resource_evidence_2026-09-23_programme_batch-001.jsonl` through `-012.jsonl` — 237 rows.
- `data/career-mapping/_audit/programme_jamb_resource_evidence_2026-09-23_jamb_batch-001.jsonl` through `-005.jsonl` — 86 rows / 711 links.
- `data/career-mapping/_audit/programme_jamb_resource_evidence_2026-09-23_manifest.json`.
- `data/career-mapping/_audit/ccmas_external_domain_complements_2026-09-01.json` — source-bearing prior JAMB/domain evidence.
- `data/career-mapping/_audit/jamb_ccmas_inheritance_canonical_2026-08-17.json` — 420-identity canonical boundary.
- `data/career-mapping/PROGRAMME_GUIDANCE_CATALOG_MANIFEST.json` and `PROGRAMME_GUIDANCE_CATALOG_AUDIT_2026-09-12.md` — 237-programme / 473-resource boundary.

## External-source checks completed for the next ledger

- NUC CCMAS hub and its 17 discipline download routes were checked; direct
  NUC PDF URLs and programme/local locators will be retained per programme.
- JAMB IBASS identity/programme selector was checked and remains the identity
  authority.
- The discipline-level reference endpoints were checked where available. Two
  open-reference endpoints returned access/fetch failures during this audit;
  they are recorded as source-endpoint limitations, not as a reason to discard
  the NUC curriculum evidence.
- The reviewed Sociology programme-resource URLs were checked against their
  publisher or education-provider pages and will be retained as item-specific
  evidence. This is local source review, not live deployment or browser proof.
- Representative authoritative JAMB/domain evidence sources were checked,
  including ILO ISCO, EU ESCO, O*NET, NUC, NBTE, CPN, SEC Nigeria, NMCN,
  MDCN, NAICOM, CFA Institute and PMI. Existing candidate URLs/locators and
  prior access-date states will be preserved; dates absent from the prior
  artifact will not be invented.

## Next action

Write a new append-only enrichment ledger and manifest that:

1. keeps all 237 programme records and all 86 JAMB identity records;
2. restores the nested external URLs/locators from the prior complement
   artifact instead of dropping them;
3. records source confirmation separately from programme/domain suitability;
4. classifies package/link evidence as `confirmed`, `review_only`, or
   `genuinely_unavailable`; and
5. keeps student exposure blocked and records `sql_applied=false`,
   `live_database_changed=false`, and `browser_proof=false`.


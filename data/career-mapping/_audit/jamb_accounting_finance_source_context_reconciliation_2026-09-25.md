# JAMB Accounting and Finance offering-context reconciliation — 2026-09-25

## Finding

The single canonical display name **Accounting and Finance** represents at least two distinct JAMB source offerings:

| JAMB source faculty | Programme / institution | Source evidence |
|---|---|---|
| Administration | Accounting and Finance — BCU | Administration brochure printed p. 48 lists the preceding Accounting institution block through UYO, VISION-UNI, WELLSPRING and WESTERN-DEL; it then starts a new `ACCOUNTING AND FINANCE` row and names BCU. The official [JAMB Administration brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf) search-indexed text confirms the transition and BCU. The repository text extraction `data/career-mapping/_jamb_txt/Administration.txt`, printed p. 48, preserves the same row sequence. |
| Social/Management Sciences | Accounting and Finance — FEDOTUOKE | The official [JAMB Social Sciences brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf), printed p. 576, places `ACCOUNTING AND FINANCE` immediately with `FEDOTUOKE`; the repository extraction `data/career-mapping/_jamb_txt/Social Management Science.txt`, printed p. 576, also contains the row-specific UTME, O’Level and Direct Entry requirements. FUOTUOKE’s [official institutional history](https://fuotuoke.edu.ng/about/) independently names Accounting and Finance among its founding programmes in Humanities and Social Sciences. |

The previous Administration parser attached the four preceding Accounting institutions to Accounting and Finance and assigned it Administration’s shared waiver notes. The two parsed records now preserve the source distinction: Administration → BCU (requirements blank in the parsed record); Social/Management Sciences → FEDOTUOKE (requirements retained from its own brochure row). Exact brochure table locators are printed-page locators; the JAMB PDF browser endpoint exposes a JavaScript shell, so the repository's checked-in brochure text extraction and the official indexed source text were used together. Access date: 2026-09-25.

## Mapping consequence

`programme_mapping.json`, the canonical curriculum-scope ledger and `jamb_domain_map.json` key this name as one identity and cannot presently assign separate CCMAS components/course scopes/domain links to the BCU and FEDOTUOKE source offerings. The existing map used one 20-course Finance/Banking and Finance (FIN) slice and 16 domain links. That does not establish that the same FIN-only slice correctly represents both source contexts, nor that it accounts for the Accounting part of either offering.

The canonical name-keyed map is therefore set to `review_required` with no active links until the source-context model can preserve each offering and the two scopes are separately reconciled against CCMAS Accounting and Finance/Accounting and Finance coursework (or authoritative external curriculum evidence where CCMAS is inadequate). Candidate evidence remains in the canonical candidate ledger; no combined curriculum is inferred from the title. This is an interim fail-closed correction, not a claim that either programme lacks a relationship.

## Files and verification

- Source extractor records corrected in `data/career-mapping/jamb/administration_offerings.json` and `data/career-mapping/jamb/social_management_offerings.json`.
- Canonical JAMB map row quarantined in `data/career-mapping/_audit/jamb_ccmas_inheritance_canonical_2026-08-17.json`.
- Rebuilt occurrence inventory: 420 canonical names, 440 parsed source occurrences, 18 multi-faculty identities; Accounting and Finance now has two occurrences and two source faculties. Inventory still marks both exact PDF table row verification flags false—the separate institutional evidence noted above does not substitute for a future rendered-PDF verification.
- Active local map regenerated: Accounting and Finance is `review_required` with zero published domain links.
- Byte-exact pre-change backups are in `data/career-mapping/_audit/accounting_finance_context_before_2026-09-25/`.
- Regression coverage asserts that the two faculty/institution contexts stay distinct and that the name-keyed student map fails closed.
- No SQL/database, endpoint, UI, or career seed transport was changed.

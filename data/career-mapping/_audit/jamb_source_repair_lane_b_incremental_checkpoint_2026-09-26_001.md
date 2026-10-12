# JAMB source repair Lane B checkpoint 001 — 2026-09-26

**Status:** progress checkpoint saved before new Lane B source edits  
**Lane:** exact official IBASS brochure-cell verification for four offering files  
**Bounded scope:** `arts_hum_offerings.json`, `social_management_offerings.json`,
`medical_offerings.json`, and `law_offerings.json` only  
**Access date:** 2026-09-26 (Africa/Lagos)

## Current occurrence counts

The four files contain **117 offering occurrence records** in total:

| State already present | Count | Meaning |
|---|---:|---|
| `source_verification.verified_against_pdf == true` | 1 | Existing exact PDF verification: Social/Management Sciences `Accounting and Finance` / `FEDOTUOKE`. |
| `source_context_status == source_text_confirmed` | 2 | Existing Lane A source-text/context confirmations: `Political Science / International Law and Diplomacy` and `Sociology and Anthropology`; these are retained and are not counted as new Lane B PDF-cell verification. |
| `source_verification.verified_against_pdf == false` | 1 | Existing explicit evidence hold: Social/Management Sciences `Film and Video Studies` / `WESTERN-DEL`; printed PDF cell still requires reconciliation. |
| No Lane B state yet | 113 | Pending bounded exact-cell review. |

These are current file-state counts before this increment. No offering source
file was edited for this checkpoint. Existing contexts, aliases, source URLs,
locators, dates, and the prior Lane A repairs remain unchanged.

## Resume boundary

Continue in bounded increments from the four target files. For each reviewed
occurrence, add an official IBASS URL, precise printed-page/table or equivalent
cell locator, and access date only after the programme/institution cell is
verified. If the cell or institution boundary cannot be proven, add an explicit
evidence hold with the official URL, review locator, date, and reason. Do not
infer availability from neighbouring rows or shared requirement text.

No CCMAS, mappings, scopes, seeds, SQL, taxonomy, roles, or UI files are in
scope.

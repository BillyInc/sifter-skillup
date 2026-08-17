# Nigerian body web evidence audit

Supplemental review date: **2026-08-17**

The 85 assigned body IDs have now received a review disposition. A disposition is not a blanket endorsement: it records whether the catalog URL was directly useful, whether an official alternate page was used, or whether the source was unavailable, under maintenance, or only corroborated by an authoritative secondary/government reference.

## Review summary

- Assigned body IDs reviewed in this supplemental pass: **85**
- Assigned body IDs still awaiting a disposition: **0**
- Verified direct catalog pages: **45**
- Verified official alternate/search pages: **32**
- Official pages reachable without extractable text: **5**
- Official pages under maintenance: **1**
- Official domains with secondary/government corroboration only: **2**

## Exceptions retained explicitly

| Body ID | Status | Reviewed destination | Note |
|---|---|---|---|
| `ng_crffn` | `official_page_reachable_no_extractable_text` | https://crffn.gov.ng/ | The official domain was reachable but returned no extractable page text; official search evidence confirms the CRFFN Act, freight-forwarding regulation, competence standards and capacity-building remit. |
| `ng_fan` | `official_domain_unavailable_secondary_evidence` | https://fan.org.ng/ | The catalog domain did not provide a reliable direct page during review. Forestry context was corroborated through an official Federal Ministry of Information reference and sector-university references; body-specific credentials remain unclaimed. |
| `ng_lrcn` | `official_domain_unavailable_secondary_evidence` | https://lrcn.gov.ng/ | The catalog domain was unavailable. Registration context was corroborated by government/NLA material, but no live official LRCN page was available for direct extraction. |
| `ng_nanta` | `official_page_reachable_no_extractable_text` | https://nanta.org.ng/ | The official domain was reachable but returned no extractable page text; the current official site and membership portal were checked for identity and membership context, without inferring a licence. |
| `ng_nba` | `official_page_reachable_no_extractable_text` | https://nigerianbar.org.ng/ | The official NBA domain was reached after redirect but returned no extractable page text; no legal-practice credential claim was inferred from the association URL. |
| `ng_nbc` | `official_page_maintenance` | https://www.nbc.gov.ng/ | The official catalog domain was reachable but displayed a maintenance notice; no competency or credential claims were extracted from it. |
| `ng_nmdpra` | `official_page_reachable_no_extractable_text` | https://www.nmdpra.gov.ng/ | The official regulator domain was reachable but returned only minimal extractable text; the authority identity was checked without inventing competency or certification claims. |
| `ng_nnra` | `official_page_reachable_no_extractable_text` | https://nnra.gov.ng/ | The official regulator domain was reachable but returned no extractable page text; regulator identity was retained, but no additional skills or credential claims were inferred. |

## Safety rule

The former Nigerian Library Association catalog URL (`https://nla.ng/`) was found to serve unrelated gambling content. It is retained only as historical catalog metadata and is not a trusted destination; the current official NLA destination is `https://nla.org.ng/about/objective`.

No resource row should infer a licence, examination, or credential merely from an association membership page. The source fields remain limited to claims explicitly supported by the reviewed source audit.

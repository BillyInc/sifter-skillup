# JAMB source lane A local progress checkpoint 002

**Date:** 2026-09-26 (Africa/Lagos)  
**Scope:** `administration_offerings.json` current bounded progress

The source file now carries item-specific verification metadata for these
bounded exact-cell records: Banking and Finance, Business Administration,
Public Administration, Marketing, Entrepreneurship, Business Management,
Taxation, Industrial Relations and Personnel Management, and Insurance.

`Hotel and Tourism Management` is explicitly held because the extracted source
window combines its awarders with later related headings; it is not promoted.

The Administration `Accounting and Finance` occurrence was corrected to the
distinct source row listing `BCU`. The preceding `UYO`, `VISION-UNI`,
`WELLSPRING`, and `WESTERN-DEL` tokens belong to the preceding Accounting
continuation, while the Social/Management Sciences `Accounting and Finance`
occurrence remains a separate `FEDOTUOKE` context. This is an offering-context
repair only; curriculum and downstream mappings remain untouched.

Focused validation remains `test_jamb_source_offering_repairs.py`; broader lane
verification is still open.

# JAMB↔CCMAS source audit — lane 1 residual locator/code-hit records

This append-only checkpoint covers only the 198 unique records classified as `locator:code_hit_without_same_page_title_candidate`.
The 2,189 same-page candidates and 55 code-not-located records were excluded. No canonical mapping, curriculum JSON, seed, or SQL was changed.

## Scope and result

- Records targeted: **198**
- Records processed: **198**
- Same-page candidates excluded: **2,189**
- Code-not-located records excluded: **55**
- Official PDF URL, extracted page/line, and source snippet are retained per record in the JSON checkpoint.

## Dispositions

- `genuine_title_conflict_candidate`: **76**
- `normalized_title_variant`: **52**
- `wrapped_or_continuation_candidate_needs_visual_confirmation`: **70**

## Interpretation

Normalized or wrapped matches are locator-level findings, not permission to overwrite stored content or outcomes. Genuine conflicts remain explicit source-adjudication candidates and must be resolved against the official PDF/package context before any canonical repair.

### 1. administration_management.json — Accounting — GST 212

- Stored title: `philosophy, logic & human exist.`
- Disposition: `normalized_title_variant`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `108`, line `5420`
- Snippet: `GST 212  Philosophy, Logic and Human Existence  C  2   30   -`
- Rationale: The extracted code-row title matches after punctuation, ampersand, abbreviation, or OCR normalization.

### 2. administration_management.json — Actuarial Science — GST 212

- Stored title: `philosophy, logic & human exist.`
- Disposition: `normalized_title_variant`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `108`, line `5420`
- Snippet: `GST 212  Philosophy, Logic and Human Existence  C  2   30   -`
- Rationale: The extracted code-row title matches after punctuation, ampersand, abbreviation, or OCR normalization.

### 3. administration_management.json — Aviation Management — AVM 102

- Stored title: `aviation meteorology`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `84`, line `4156`
- Snippet: `AVM 102: Basic Concepts in Economics       (3 Units C: LH 45)`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 4. administration_management.json — Aviation Management — AVM 203

- Stored title: `aviation safety and security`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `88`, line `4381`
- Snippet: `AVM 203:  Air Transport Operation         (3 Units C: LH 45)`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 5. administration_management.json — Aviation Management — AVM 204

- Stored title: `aviation law and regulation`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `79`, line `3919`
- Snippet: `AVM 204  Basic Life Support  2  C  -  90`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 6. administration_management.json — Aviation Management — AVM 210

- Stored title: `elements of marketing`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `79`, line `3924`
- Snippet: `AVM 210  Element of Marketing  2    C    30  -`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 7. administration_management.json — Aviation Management — AVM 303

- Stored title: `aviation finance and economics`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `94`, line `4647`
- Snippet: `AVM 303:  Air Transport Environmental Planning     (2 Units C: LH 30)`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 8. administration_management.json — Aviation Management — AVM 304

- Stored title: `aviation ground handling operations`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `94`, line `4667`
- Snippet: `AVM 304:  Airport Strategic Planning        (2 Units C: LH 30)`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 9. administration_management.json — Aviation Management — AVM 305

- Stored title: `aviation it & communication systems`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `94`, line `4686`
- Snippet: `AVM 305:  Aviation Law            (3 Units C: LH 45)`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 10. administration_management.json — Aviation Management — AVM 307

- Stored title: `research methods in aviation mgt.`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `80`, line `3939`
- Snippet: `AVM307  Customer Relationship Management  2  C  30  -`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 11. administration_management.json — Aviation Management — AVM 401

- Stored title: `aviation policy and planning`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `80`, line `3953`
- Snippet: `AVM401  Risk Management in Aviation  3  C  45  -`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 12. administration_management.json — Aviation Management — AVM 405

- Stored title: `aviation industry environment`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `99`, line `4936`
- Snippet: `AVM 405:  Project             (4 Units C: PH 180)`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 13. administration_management.json — Business Administration — BUA 201

- Stored title: `principles of business admin. i`
- Disposition: `normalized_title_variant`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `133`, line `6758`
- Snippet: `BUA 201  Principles of Business Administration I  3  C  45  -`
- Rationale: The extracted code-row title matches after punctuation, ampersand, abbreviation, or OCR normalization.

### 14. administration_management.json — Business Administration — BUA 202

- Stored title: `principles of business admin. ii`
- Disposition: `normalized_title_variant`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `133`, line `6759`
- Snippet: `BUA 202  Principles of Business Administration II  3  C  45  -`
- Rationale: The extracted code-row title matches after punctuation, ampersand, abbreviation, or OCR normalization.

### 15. administration_management.json — Business Administration — BUA 216

- Stored title: `introduction to financial mgt.`
- Disposition: `normalized_title_variant`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `134`, line `6766`
- Snippet: `BUA 216  Introduction to Financial Management  3  C  45  -`
- Rationale: The extracted code-row title matches after punctuation, ampersand, abbreviation, or OCR normalization.

### 16. administration_management.json — Business Administration — BUA 310

- Stored title: `production and operations mgt.`
- Disposition: `normalized_title_variant`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `146`, line `7407`
- Snippet: `BUA 310: Production and Operations Management    (3 Units C: LH 45)`
- Rationale: The extracted code-row title matches after punctuation, ampersand, abbreviation, or OCR normalization.

### 17. administration_management.json — Business Administration — BUA 401

- Stored title: `business policy & strategic mgt.`
- Disposition: `normalized_title_variant`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `149`, line `7554`
- Snippet: `BUA 401: Business Policy and Strategic Management  (3 Units C: LH 45)`
- Rationale: The extracted code-row title matches after punctuation, ampersand, abbreviation, or OCR normalization.

### 18. administration_management.json — Business Administration — BUA 402

- Stored title: `strategic thinking & problem solving`
- Disposition: `normalized_title_variant`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `134`, line `6791`
- Snippet: `BUA 402  Strategic Thinking and Problem Solving  3  C  45  -`
- Rationale: The extracted code-row title matches after punctuation, ampersand, abbreviation, or OCR normalization.

### 19. administration_management.json — Co-operative and Rural Development — CRD 102

- Stored title: `organization & mgt. of cooperatives`
- Disposition: `normalized_title_variant`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `163`, line `8272`
- Snippet: `CRD 102:  Organization and Management of Cooperatives  (2 Units C: LH 30)`
- Rationale: The extracted code-row title matches after punctuation, ampersand, abbreviation, or OCR normalization.

### 20. administration_management.json — Co-operative and Rural Development — CRD 301

- Stored title: `advanced cooperative mgt cost analytics 1`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `173`, line `8776`
- Snippet: `CRD 301: Advanced Cooperative Management Costs Analytics 1 (3 Units C: LH 45)`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 21. administration_management.json — Co-operative and Rural Development — CRD 402

- Stored title: `cooperative auditing and cash mgt.`
- Disposition: `normalized_title_variant`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `177`, line `8987`
- Snippet: `CRD 402:  Cooperative Auditing and Cash Management   (2 Units C: LH  30)`
- Rationale: The extracted code-row title matches after punctuation, ampersand, abbreviation, or OCR normalization.

### 22. administration_management.json — Co-operative and Rural Development — CRD 405

- Stored title: `project planning, mgt., m&e`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `178`, line `9064`
- Snippet: `CRD 405: Project Planning, Management, Monitoring & Evaluation (2 Units C: LH  30)`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 23. administration_management.json — Co-operative and Rural Development — CRD 406

- Stored title: `cooperative communication & info sys.`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `179`, line `9089`
- Snippet: `CRD 406: Cooperative Communication and Information System (2 Units C: LH  30)`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 24. administration_management.json — Employment and Human Resource Management — EHR 101

- Stored title: `introduction to hrm`
- Disposition: `normalized_title_variant`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `191`, line `9722`
- Snippet: `EHR 101:  Introduction to Human Resource Management    (2 Units C: LH 30)`
- Rationale: The extracted code-row title matches after punctuation, ampersand, abbreviation, or OCR normalization.

### 25. administration_management.json — Employment and Human Resource Management — EHR 201

- Stored title: `hr planning and administration`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `193`, line `9828`
- Snippet: `EHR 201: Human Resource Planning and Administration     (2 Units C: LH 30)`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 26. administration_management.json — Employment and Human Resource Management — EHR 203

- Stored title: `trade unions and employers' assoc.`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `193`, line `9866`
- Snippet: `EHR 203: Trade Unions and Employers’ Associations   (2 Units C: LH 30)`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 27. administration_management.json — Employment and Human Resource Management — EHR 204

- Stored title: `communication in hrm & empl. rel.`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `194`, line `9895`
- Snippet: `EHR 204: Communication in Human Resource Management and Employment`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 28. administration_management.json — Employment and Human Resource Management — EHR 207

- Stored title: `public sector hrm`
- Disposition: `normalized_title_variant`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `195`, line `9960`
- Snippet: `EHR 207:  Public Sector Human Resource Management.  (2 Units C: LH 30)`
- Rationale: The extracted code-row title matches after punctuation, ampersand, abbreviation, or OCR normalization.

### 29. administration_management.json — Employment and Human Resource Management — EHR 301

- Stored title: `collective bargaining & negotiation`
- Disposition: `normalized_title_variant`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `187`, line `9520`
- Snippet: `EHR 301  Collective Bargaining and Negotiation Skills  2  C  30  -`
- Rationale: The extracted code-row title matches after punctuation, ampersand, abbreviation, or OCR normalization.

### 30. administration_management.json — Employment and Human Resource Management — EHR 307

- Stored title: `comparative hrm and empl. relations`
- Disposition: `normalized_title_variant`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `201`, line `10245`
- Snippet: `EHR 307:  Comparative Human Resource Management and Employment Relations`
- Rationale: The extracted code-row title matches after punctuation, ampersand, abbreviation, or OCR normalization.

### 31. administration_management.json — Employment and Human Resource Management — EHR 308

- Stored title: `industrial visit on hrm & er practices`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `201`, line `10264`
- Snippet: `EHR 308: Industrial Visit on Human Resource Management and Employment`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 32. administration_management.json — Employment and Human Resource Management — EHR 312

- Stored title: `entrepreneurship in ehr management`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `187`, line `9536`
- Snippet: `EHR 312  Entrepreneurship in Employee Relations and`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 33. administration_management.json — Employment and Human Resource Management — EHR 402

- Stored title: `multinational hrm and employment`
- Disposition: `normalized_title_variant`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `203`, line `10388`
- Snippet: `EHR 402:  Multinational Human Resource Management and Employment (2Units C:`
- Rationale: The extracted code-row title matches after punctuation, ampersand, abbreviation, or OCR normalization.

### 34. administration_management.json — Employment and Human Resource Management — EHR 403

- Stored title: `hrm and employment theories`
- Disposition: `normalized_title_variant`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `204`, line `10413`
- Snippet: `EHR 403: Human Resource Management and Employment Theories  (2 Units C:  LH`
- Rationale: The extracted code-row title matches after punctuation, ampersand, abbreviation, or OCR normalization.

### 35. administration_management.json — Employment and Human Resource Management — EHR 407

- Stored title: `gender issues in hrm & empl. relations`
- Disposition: `normalized_title_variant`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `205`, line `10488`
- Snippet: `EHR 407: Gender Issues in HRM and Employment Relations   (2 Units C: LH 30)`
- Rationale: The extracted code-row title matches after punctuation, ampersand, abbreviation, or OCR normalization.

### 36. administration_management.json — Employment and Human Resource Management — GST 212

- Stored title: `philosophy, logic & human exist.`
- Disposition: `normalized_title_variant`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `108`, line `5420`
- Snippet: `GST 212  Philosophy, Logic and Human Existence  C  2   30   -`
- Rationale: The extracted code-row title matches after punctuation, ampersand, abbreviation, or OCR normalization.

### 37. administration_management.json — Finance / Banking and Finance — FIN 215

- Stored title: `applications of computers in fin/banking`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `234`, line `12015`
- Snippet: `FIN 215  Applications of Computer in Finance`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 38. administration_management.json — Finance / Banking and Finance — FIN 317

- Stored title: `entrepreneurship in finance`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `235`, line `12038`
- Snippet: `FIN 317  Entrepreneurship of Finance  2  C  30  -`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 39. administration_management.json — Finance / Banking and Finance — FIN 409

- Stored title: `financial technology (fintech)`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `235`, line `12045`
- Snippet: `FIN 409  Financial Technology (FINTEC)  3  C  45  -`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 40. administration_management.json — Finance / Banking and Finance — FIN 410

- Stored title: `investment analysis & portfolio mgt.`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `235`, line `12046`
- Snippet: `FIN 410  Investment Analysis and Portfolio`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 41. administration_management.json — Finance / Banking and Finance — GST 212

- Stored title: `philosophy, logic & human exist.`
- Disposition: `normalized_title_variant`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `108`, line `5420`
- Snippet: `GST 212  Philosophy, Logic and Human Existence  C  2   30   -`
- Rationale: The extracted code-row title matches after punctuation, ampersand, abbreviation, or OCR normalization.

### 42. administration_management.json — Hospitality and Tourism Management — HTM 203

- Stored title: `intro. to tourism & hospitality mgt.`
- Disposition: `normalized_title_variant`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `267`, line `13782`
- Snippet: `HTM 203: Introduction to Tourism and Hospitality Management (2 Units C: LH 30)`
- Rationale: The extracted code-row title matches after punctuation, ampersand, abbreviation, or OCR normalization.

### 43. administration_management.json — Hospitality and Tourism Management — HTM 205

- Stored title: `introductory tour operations mgt.`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `259`, line `13338`
- Snippet: `HTM 205  Introductory  tour  operations`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 44. administration_management.json — Hospitality and Tourism Management — HTM 212

- Stored title: `tourism resources & destinations`
- Disposition: `normalized_title_variant`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `259`, line `13344`
- Snippet: `HTM 212  Tourism Resources and Destinations in`
- Rationale: The extracted code-row title matches after punctuation, ampersand, abbreviation, or OCR normalization.

### 45. administration_management.json — Hospitality and Tourism Management — HTM 305

- Stored title: `tourism organization & travel mgt.`
- Disposition: `normalized_title_variant`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `272`, line `14019`
- Snippet: `HTM 305:  Tourism Organization and Travel management      (2 Units C: LH 30)`
- Rationale: The extracted code-row title matches after punctuation, ampersand, abbreviation, or OCR normalization.

### 46. administration_management.json — Hospitality and Tourism Management — HTM 307

- Stored title: `ecotourism and protected area mgt.`
- Disposition: `normalized_title_variant`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `272`, line `14036`
- Snippet: `HTM 307: Ecotourism and Protected Area Management   (2 Units C: LH 30)`
- Rationale: The extracted code-row title matches after punctuation, ampersand, abbreviation, or OCR normalization.

### 47. administration_management.json — Hospitality and Tourism Management — HTM 311

- Stored title: `entrepreneurship education in htm`
- Disposition: `normalized_title_variant`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `259`, line `13362`
- Snippet: `HTM 311  Entrepreneurship  education  in`
- Rationale: The extracted code-row title matches after punctuation, ampersand, abbreviation, or OCR normalization.

### 48. administration_management.json — Hospitality and Tourism Management — HTM 402

- Stored title: `catering and hotel business mgt.`
- Disposition: `normalized_title_variant`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `275`, line `14192`
- Snippet: `HTM 402: Catering and Hotel Business Management         (2 Units C: LH 30)`
- Rationale: The extracted code-row title matches after punctuation, ampersand, abbreviation, or OCR normalization.

### 49. administration_management.json — Hospitality and Tourism Management — TRM 408

- Stored title: `tourism economics, trade & marketing`
- Disposition: `normalized_title_variant`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `279`, line `14361`
- Snippet: `TRM 408: Tourism Economics, trade and Marketing           (2 Units C: LH 30)`
- Rationale: The extracted code-row title matches after punctuation, ampersand, abbreviation, or OCR normalization.

### 50. administration_management.json — Information Resource Management — IRM 106

- Stored title: `intro. to records and information mgt.`
- Disposition: `normalized_title_variant`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `294`, line `15178`
- Snippet: `IRM 106:  Introduction to Records and Information Management`
- Rationale: The extracted code-row title matches after punctuation, ampersand, abbreviation, or OCR normalization.

### 51. administration_management.json — Information Resource Management — IRM 107

- Stored title: `fundamentals of info. resources mgt.`
- Disposition: `normalized_title_variant`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `295`, line `15200`
- Snippet: `IRM 107: Fundamentals of Information Resources Management`
- Rationale: The extracted code-row title matches after punctuation, ampersand, abbreviation, or OCR normalization.

### 52. administration_management.json — Information Resource Management — IRM 108

- Stored title: `intro. to reference sources and services`
- Disposition: `normalized_title_variant`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `294`, line `15161`
- Snippet: `IRM 108: Introduction to Reference Sources and Services     (3 Units C: LH 45)  Learning`
- Rationale: The extracted code-row title matches after punctuation, ampersand, abbreviation, or OCR normalization.

### 53. administration_management.json — Information Resource Management — IRM 202

- Stored title: `information system analysis, design, eval`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `297`, line `15318`
- Snippet: `IRM 202: Conservation and Preservation of Information Resources (3 Units C: LH`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 54. administration_management.json — Information Resource Management — IRM 218

- Stored title: `knowledge management tools & technologies`
- Disposition: `normalized_title_variant`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `297`, line `15336`
- Snippet: `IRM 218: Knowledge Management Tools and Technologies       (3 Units C: LH 45)`
- Rationale: The extracted code-row title matches after punctuation, ampersand, abbreviation, or OCR normalization.

### 55. administration_management.json — Information Resource Management — IRM 311

- Stored title: `administration of libraries & info ctrs`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `299`, line `15445`
- Snippet: `IRM 311: Administration of Libraries and Information Centers      (3 Units C: LH`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 56. administration_management.json — Information Resource Management — IRM 415

- Stored title: `legal & ethical issues in irm`
- Disposition: `normalized_title_variant`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `290`, line `14970`
- Snippet: `IRM 415  Legal and Ethical Issues in IRM  3  C  45`
- Rationale: The extracted code-row title matches after punctuation, ampersand, abbreviation, or OCR normalization.

### 57. administration_management.json — Insurance — ACS 402

- Stored title: `pension funds & social insurance`
- Disposition: `normalized_title_variant`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `55`, line `2683`
- Snippet: `ACS 402  Pension funds and Social Insurance  3  C  45  -`
- Rationale: The extracted code-row title matches after punctuation, ampersand, abbreviation, or OCR normalization.

### 58. administration_management.json — Insurance — GST 212

- Stored title: `philosophy, logic & human exist.`
- Disposition: `normalized_title_variant`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `108`, line `5420`
- Snippet: `GST 212  Philosophy, Logic and Human Existence  C  2   30   -`
- Rationale: The extracted code-row title matches after punctuation, ampersand, abbreviation, or OCR normalization.

### 59. administration_management.json — Insurance — INS 102

- Stored title: `principles & practice of insurance`
- Disposition: `normalized_title_variant`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `310`, line `16012`
- Snippet: `INS 102  Principles and practice of Insurance  3  C  45  -`
- Rationale: The extracted code-row title matches after punctuation, ampersand, abbreviation, or OCR normalization.

### 60. administration_management.json — Local Government and Development Studies — LGD 304

- Stored title: `local government finance & budgeting`
- Disposition: `normalized_title_variant`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `346`, line `17916`
- Snippet: `LGD 304: Local Government Finance and Budgeting    (2 Units C: LH 30)`
- Rationale: The extracted code-row title matches after punctuation, ampersand, abbreviation, or OCR normalization.

### 61. administration_management.json — Local Government and Development Studies — LGD 404

- Stored title: `workshop in local govt admin.`
- Disposition: `normalized_title_variant`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `349`, line `18098`
- Snippet: `LGD404: Workshop in Local Government Administration  (2 Units C: LH 30)`
- Rationale: The extracted code-row title matches after punctuation, ampersand, abbreviation, or OCR normalization.

### 62. administration_management.json — Logistics and Supply Chain Management — LCM 403

- Stored title: `reverse logistics & sustainable s.chains`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `375`, line `19444`
- Snippet: `LCM 403: Reverse Logistics and Sustainable Supply Chains  (2 Units C: LH 30)`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 63. administration_management.json — Logistics and Supply Chain Management — LSM 101

- Stored title: `introduction to logistics & scm`
- Disposition: `normalized_title_variant`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `362`, line `18749`
- Snippet: `LSM 101: Introduction to Logistics and Supply Chain Management  (3 Units C: LH 45)`
- Rationale: The extracted code-row title matches after punctuation, ampersand, abbreviation, or OCR normalization.

### 64. administration_management.json — Logistics and Supply Chain Management — LSM 207

- Stored title: `ict in logistics and scm`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `367`, line `19011`
- Snippet: `LSM 207: Information and Communication Technology in Logistics and Supply Chain`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 65. administration_management.json — Logistics and Supply Chain Management — LSM 303

- Stored title: `analytical techniques in lscm`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `358`, line `18548`
- Snippet: `LSM 303  Analytical Techniques in Logistics and`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 66. administration_management.json — Logistics and Supply Chain Management — LSM 309

- Stored title: `research methodology in lscm`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `373`, line `19340`
- Snippet: `LSM 309: Research Methodology in Logistics and Supply Chain Management (3`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 67. administration_management.json — Logistics and Supply Chain Management — LSM 404

- Stored title: `case studies & contemp. issues in lscm`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `376`, line `19467`
- Snippet: `LSM 404: Case Studies and Contemporary Issues in Logistics and Supply Chain Management`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 68. administration_management.json — Marketing — MKT 121

- Stored title: `applied mathematics for marketing`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `384`, line `19873`
- Snippet: `MKT 121  Marketing of Financial Services  2  C  30  -`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 69. administration_management.json — Marketing — MKT 211

- Stored title: `consumer behaviour`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `390`, line `20215`
- Snippet: `MKT 211: Principles Of Marketing Management    (2 Units C: LH 30)`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 70. administration_management.json — Marketing — MKT 212

- Stored title: `marketing communication`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `384`, line `19885`
- Snippet: `MKT 212  Business to Business Marketing  2  C  30  -`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 71. administration_management.json — Marketing — MKT 213

- Stored title: `marketing research & decision analysis`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `384`, line `19886`
- Snippet: `MKT 213  Entrepreneurial Marketing   2  C  30  -`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 72. administration_management.json — Marketing — MKT 220

- Stored title: `food and agricultural marketing`
- Disposition: `normalized_title_variant`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `384`, line `19887`
- Snippet: `MKT 220  Food & Agricultural Marketing  2  C  30  -`
- Rationale: The extracted code-row title matches after punctuation, ampersand, abbreviation, or OCR normalization.

### 73. administration_management.json — Marketing — MKT 221

- Stored title: `retailing and wholesaling`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `384`, line `19888`
- Snippet: `MKT 221  Service and Social Marketing  2  C  30  -`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 74. administration_management.json — Marketing — MKT 223

- Stored title: `marketing of agricultural products`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `384`, line `19890`
- Snippet: `MKT 223  Online Public Relations & Reputation`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 75. administration_management.json — Marketing — MKT 303

- Stored title: `industrial and institutional marketing`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `384`, line `19899`
- Snippet: `MKT 303  Legal Aspects of Marketing  3  C  45`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 76. administration_management.json — Marketing — MKT 304

- Stored title: `international marketing`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `384`, line `19900`
- Snippet: `MKT 304  Marketing Theory  2  C  30  -`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 77. administration_management.json — Marketing — MKT 311

- Stored title: `public relations and brand management`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `384`, line `19901`
- Snippet: `MKT 311  Digital Marketing Management  3`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 78. administration_management.json — Marketing — MKT 321

- Stored title: `consumer behaviour ii`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `384`, line `19906`
- Snippet: `MKT 321  Consumer Behavior  3  C  45  -`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 79. administration_management.json — Marketing — MKT 323

- Stored title: `sales promotions`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `399`, line `20659`
- Snippet: `Mkt 323: Marketing Research & Analytics      (3 Units C: LH 45)`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 80. administration_management.json — Marketing — MKT 324

- Stored title: `energy marketing`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `384`, line `19909`
- Snippet: `MKT 324  Marketing Operations Management  2  C  30`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 81. administration_management.json — Marketing — MKT 326

- Stored title: `political marketing`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `384`, line `19910`
- Snippet: `MKT 326  Sales Management  2  C  30`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 82. administration_management.json — Marketing — MKT 412

- Stored title: `non-profit marketing`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `385`, line `19919`
- Snippet: `MKT  412  Contemporary Issues in Marketing`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 83. administration_management.json — Marketing — MKT 416

- Stored title: `marketing of industrial products`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `385`, line `19925`
- Snippet: `MKT 416  Marketing Persuasions  2  C  30  -`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 84. administration_management.json — Marketing — MKT 421

- Stored title: `entrepreneurship in marketing`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `385`, line `19926`
- Snippet: `MKT 421  Political Marketing  2  C  30  -`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 85. administration_management.json — Marketing — MKT 422

- Stored title: `marketing of banking & financial svcs`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `385`, line `19927`
- Snippet: `MKT 422  Energy Marketing  2  C  30 -`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 86. administration_management.json — Marketing — MKT 425

- Stored title: `strategic marketing`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `385`, line `19930`
- Snippet: `MKT 425  Integrated Marketing Communications  2  C  30  -`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 87. administration_management.json — Office and Information Management — OIM 313

- Stored title: `secretarial administration`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `410`, line `21265`
- Snippet: `OIM 313  Information Management  3  C  45  -`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 88. administration_management.json — Office and Information Management — OIM 315

- Stored title: `entrepreneurship in oim`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Extracted locator: page `429`, line `22228`
- Snippet: `1. apply the knowledge gained from research design and methodology course oim 315 to`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 89. agricultural_science.json — B.Sc./B.Tech Food Science and Technology — FST 402

- Stored title: `industry-based supervisor's assessment (siwes)`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Agriculture-2023.pdf
- Extracted locator: page `307`, line `13812`
- Snippet: `FST 402 Industry-based Supervisor’s Assessment (SIWES) (4 Units C: PH 180)`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 90. agricultural_science.json — B.Sc./B.Tech Food Science and Technology — FST 405

- Stored title: `students' reports and practical presentation (siwes)`
- Disposition: `normalized_title_variant`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Agriculture-2023.pdf
- Extracted locator: page `307`, line `13814`
- Snippet: `FST 405 Students’ Reports and Practical Presentation (SIWES)  (4 Units C: PH 180)`
- Rationale: The extracted code-row title matches after punctuation, ampersand, abbreviation, or OCR normalization.

### 91. agricultural_science.json — B.Sc./B.Tech Food Science and Technology — FST 502

- Stored title: `meat and fish technology`
- Disposition: `normalized_title_variant`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Agriculture-2023.pdf
- Extracted locator: page `287`, line `12947`
- Snippet: `FST 502 Meat Science & Fish Science & Technology 3 C 30 45`
- Rationale: The extracted code-row title matches after punctuation, ampersand, abbreviation, or OCR normalization.

### 92. agricultural_science.json — Family and Consumer Sciences — FCS 411

- Stored title: `organisation of family and child welfare programmes`
- Disposition: `normalized_title_variant`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Agriculture-2023.pdf
- Extracted locator: page `243`, line `10864`
- Snippet: `FCS 411: Organisation of Family & Child Welfare Programmes (2 Units C: LH 30)`
- Rationale: The extracted code-row title matches after punctuation, ampersand, abbreviation, or OCR normalization.

### 93. agricultural_science.json — Family and Consumer Sciences — FCS 423

- Stored title: `advanced clothing construction and tailoring techniques`
- Disposition: `normalized_title_variant`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Agriculture-2023.pdf
- Extracted locator: page `246`, line `10972`
- Snippet: `FCS 423: Advanced Clothing Construction & Tailoring Techniques (2 Units C: LH`
- Rationale: The extracted code-row title matches after punctuation, ampersand, abbreviation, or OCR normalization.

### 94. agricultural_science.json — Fisheries and Aquaculture — FAA 404

- Stored title: `fish fry and fingerlings production; hatchery management; fish production, management and fish food nutrition`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Agriculture-2023.pdf
- Extracted locator: page `275`, line `12329`
- Snippet: `FAA 404: Fish Fry and Fingerlings production; (Hatchery management; Fish`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 95. agricultural_science.json — Fisheries and Aquaculture — FAA 405

- Stored title: `fish marketing and marketing management, accounting practices and economics`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Agriculture-2023.pdf
- Extracted locator: page `275`, line `12364`
- Snippet: `FAA 405: Fish Marketing and Marketing Management , Accounting Practices and`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 96. agricultural_science.json — Forest Resources and Wildlife Management — FWM 407

- Stored title: `wood products processing and utilization`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Agriculture-2023.pdf
- Extracted locator: page `320`, line `14418`
- Snippet: `FWM 407 Natural & Man-made Forest Plantation`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 97. agricultural_science.json — Horticulture and Landscape Management — HLM 301

- Stored title: `nursery/seedling production and management (practical)`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Agriculture-2023.pdf
- Extracted locator: page `365`, line `16465`
- Snippet: `HLM 301: Nursery/Seedling Production & Management (2 Units C: PH 90)`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 98. agricultural_science.json — Horticulture and Landscape Management — HLM 304

- Stored title: `principles of floriculture and landscape design`
- Disposition: `normalized_title_variant`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Agriculture-2023.pdf
- Extracted locator: page `364`, line `16424`
- Snippet: `HLM 304: Principles of Floriculture & Landscape Design (2 Units C LH 15; PH 45)`
- Rationale: The extracted code-row title matches after punctuation, ampersand, abbreviation, or OCR normalization.

### 99. arts.json — African Languages and Literature Yoruba — YOU 101

- Stored title: `introduction to yor–b– people, language and culture`
- Disposition: `normalized_title_variant`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf
- Extracted locator: page `646`, line `35220`
- Snippet: `YOU 101: Introduction to Yor�b� People, Language and Culture  (2 Units C:`
- Rationale: The extracted code-row title matches after punctuation, ampersand, abbreviation, or OCR normalization.

### 100. communication_media.json — FILM & MULTIMEDIA — P12, P13, P14 — FMM 206

- Stored title: `introduction to film production`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf
- Extracted locator: page `111`, line `5823`
- Snippet: `FMM 206: Elements of Multimedia Production  (2 Units C: LH 15; PH 45)`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 101. communication_media.json — FILM & MULTIMEDIA — P12, P13, P14 — FMM 301

- Stored title: `intermediate film production`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf
- Extracted locator: page `114`, line `5980`
- Snippet: `FMM 301: Film Scripting & Directing I             (2 Units C: LH 15; PH 45)`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 102. communication_media.json — FILM & MULTIMEDIA — P12, P13, P14 — FMM 304

- Stored title: `post-production and editing`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf
- Extracted locator: page `116`, line `6061`
- Snippet: `FMM 304: Cinematography, Motion Picture Sound & Digital Technology II`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 103. communication_media.json — FILM & MULTIMEDIA — P12, P13, P14 — FMM 305

- Stored title: `film sound design`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf
- Extracted locator: page `117`, line `6089`
- Snippet: `FMM 305: Film & Multimedia Production Design & Editing I`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 104. communication_media.json — FILM & MULTIMEDIA — P12, P13, P14 — FMM 306

- Stored title: `multimedia design and production`
- Disposition: `normalized_title_variant`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf
- Extracted locator: page `117`, line `6121`
- Snippet: `FMM 306: Film & Multimedia Production Design & Editing II`
- Rationale: The extracted code-row title matches after punctuation, ampersand, abbreviation, or OCR normalization.

### 105. communication_media.json — FILM & MULTIMEDIA — P12, P13, P14 — FMM 307

- Stored title: `digital media production`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf
- Extracted locator: page `118`, line `6150`
- Snippet: `FMM 307: Capstone Projects I--Film & Multimedia (3 Units: LH 15; PH 90)`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 106. communication_media.json — FILM & MULTIMEDIA — P12, P13, P14 — FMM 308

- Stored title: `film & multimedia industry internship`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf
- Extracted locator: page `118`, line `6184`
- Snippet: `FMM 308: Capstone Projects II--Film & Multimedia (3 Units C: LH 15; PH 90)`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 107. communication_media.json — FILM & MULTIMEDIA — P12, P13, P14 — FMM 401

- Stored title: `advanced film production`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf
- Extracted locator: page `121`, line `6303`
- Snippet: `FMM 401: Film Scripting & Directing II      (2 Units C: LH 15; PH 45)`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 108. communication_media.json — FILM & MULTIMEDIA — P12, P13, P14 — FMM 402

- Stored title: `film distribution and exhibition`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf
- Extracted locator: page `121`, line `6335`
- Snippet: `FMM 402: Digital Storytelling II            (2 Units C: LH 15; PH 45)`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 109. communication_media.json — FILM & MULTIMEDIA — P12, P13, P14 — FMM 403

- Stored title: `film and multimedia policy & law`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf
- Extracted locator: page `122`, line `6371`
- Snippet: `FMM 403: Cinematography, Motion Picture Sound & Digital Technology III`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 110. communication_media.json — FILM & MULTIMEDIA — P12, P13, P14 — FMM 404

- Stored title: `documentary film production`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf
- Extracted locator: page `122`, line `6402`
- Snippet: `FMM 404: Cinematography, Motion Picture Sound & Digital Technology IV`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 111. communication_media.json — FILM & MULTIMEDIA — P12, P13, P14 — FMM 405

- Stored title: `film & multimedia entrepreneurship`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf
- Extracted locator: page `123`, line `6435`
- Snippet: `FMM 405: Film & Multimedia Production Design & Editing III`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 112. communication_media.json — FILM & MULTIMEDIA — P12, P13, P14 — FMM 406

- Stored title: `research methods in film & multimedia`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf
- Extracted locator: page `124`, line `6466`
- Snippet: `FMM 406: Film & Multimedia Production Design & Editing IV`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 113. communication_media.json — FILM & MULTIMEDIA — P12, P13, P14 — FMM 407

- Stored title: `film criticism and analysis`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf
- Extracted locator: page `124`, line `6493`
- Snippet: `FMM 407: Capstone Projects III--Film & Multimedia (3 Units C: LH 15; PH 90)`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 114. communication_media.json — FILM & MULTIMEDIA — P12, P13, P14 — FMM 408

- Stored title: `final film/multimedia project i`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf
- Extracted locator: page `125`, line `6530`
- Snippet: `FMM 408: Capstone Projects IV--Film & Multimedia (3 Units C: LH 15; PH 90)`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 115. communication_media.json — FILM & MULTIMEDIA — P12, P13, P14 — FMM 410

- Stored title: `final film/multimedia project ii`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf
- Extracted locator: page `125`, line `6564`
- Snippet: `FMM 410: Final Project                      (4 Units C: PH 180)`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 116. communication_media.json — INFORMATION AND MEDIA STUDIES — P12, P13, P14 — CMS 111

- Stored title: `introduction to human communication`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf
- Extracted locator: page `28`, line `1207`
- Snippet: `CMS 111 Introduction to Human               2  C          30`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 117. communication_media.json — INFORMATION AND MEDIA STUDIES — P12, P13, P14 — CMS 312

- Stored title: `foundations of communication research`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf
- Extracted locator: page `135`, line `6997`
- Snippet: `4 CMS 312       Theories of Communication    2         C  30`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 118. communication_media.json — INFORMATION AND MEDIA STUDIES — P12, P13, P14 — CMS 313

- Stored title: `data analysis in communication research`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf
- Extracted locator: page `135`, line `6999`
- Snippet: `5 CMS 313       Foundation of Communication 2          C  30`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 119. communication_media.json — INFORMATION AND MEDIA STUDIES — P12, P13, P14 — ISM 112

- Stored title: `introduction to media studies`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf
- Extracted locator: page `138`, line `7206`
- Snippet: `ISM 112: Basic Computer Tools and Programming Packages (2 Units C: LH 30)`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 120. communication_media.json — INFORMATION AND MEDIA STUDIES — P12, P13, P14 — ISM 312

- Stored title: `social media and emerging platforms`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf
- Extracted locator: page `148`, line `7695`
- Snippet: `ISM 312: Computer Animation Production          (2 Units C: LH 15; PH 45)`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 121. communication_media.json — INFORMATION AND MEDIA STUDIES — P12, P13, P14 — ISM 313

- Stored title: `multimedia production`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf
- Extracted locator: page `148`, line `7724`
- Snippet: `ISM 313: Introduction to Social Media Networks  (2 Units C: LH 30)`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 122. communication_media.json — INFORMATION AND MEDIA STUDIES — P12, P13, P14 — ISM 314

- Stored title: `information policy and ethics`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf
- Extracted locator: page `148`, line `7758`
- Snippet: `ISM 314: E-commerce and Business Communication  (2 Units C: LH 30)`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 123. communication_media.json — INFORMATION AND MEDIA STUDIES — P12, P13, P14 — ISM 411

- Stored title: `media management and entrepreneurship`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf
- Extracted locator: page `151`, line `7913`
- Snippet: `ISM 411: Media Production Management     (2 Units C: LH 30)`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 124. communication_media.json — INFORMATION AND MEDIA STUDIES — P12, P13, P14 — ISM 412

- Stored title: `information security and privacy`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf
- Extracted locator: page `135`, line `7048`
- Snippet: `4 ISM 412 Media Ethics                                 C  30`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 125. communication_media.json — INFORMATION AND MEDIA STUDIES — P12, P13, P14 — ISM 413

- Stored title: `advanced digital media production`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf
- Extracted locator: page `135`, line `7050`
- Snippet: `5 ISM 413 Media Law & Policy                 2         C  30`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 126. communication_media.json — INFORMATION AND MEDIA STUDIES — P12, P13, P14 — ISM 414

- Stored title: `big data and media analytics`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf
- Extracted locator: page `153`, line `7996`
- Snippet: `ISM 414: 3D Modelling and Technology and Digital Rendering`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 127. communication_media.json — INFORMATION AND MEDIA STUDIES — P12, P13, P14 — ISM 421

- Stored title: `media and information seminar`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf
- Extracted locator: page `135`, line `7055`
- Snippet: `7 ISM 421 New Media, Politics and 2                    C  30`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 128. communication_media.json — MASS COMMUNICATION — P12, P13, P14 — MCM 101

- Stored title: `introduction to mass communication`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf
- Extracted locator: page `184`, line `9731`
- Snippet: `MCM 101      Foundations of Broadcasting and     3`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 129. communication_media.json — MASS COMMUNICATION — P12, P13, P14 — MCM 102

- Stored title: `communication skills for mass media`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf
- Extracted locator: page `190`, line `10154`
- Snippet: `MCM 102: Principles of Public Relations        (2 Units C: LH 30)`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 130. communication_media.json — MASS COMMUNICATION — P12, P13, P14 — MCM 103

- Stored title: `history of mass communication`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf
- Extracted locator: page `184`, line `9734`
- Snippet: `MCM 103      Introduction to Advertising         2      C 30`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 131. communication_media.json — MASS COMMUNICATION — P12, P13, P14 — MCM 104

- Stored title: `media and society`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf
- Extracted locator: page `191`, line `10204`
- Snippet: `MCM 104: Introduction to News Writing      (2 Units C: LH 30)`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 132. communication_media.json — MASS COMMUNICATION — P12, P13, P14 — MCM 204

- Stored title: `photojournalism`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf
- Extracted locator: page `196`, line `10452`
- Snippet: `MCM 204: Advanced and Specialised Reporting                   (2 Units C: LH 30)`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 133. communication_media.json — MASS COMMUNICATION — P12, P13, P14 — MCM 205

- Stored title: `feature and editorial writing`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf
- Extracted locator: page `185`, line `9770`
- Snippet: `MCM 205  Feature Writing                                       Majo`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 134. communication_media.json — MASS COMMUNICATION — P12, P13, P14 — MCM 206

- Stored title: `online journalism`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf
- Extracted locator: page `197`, line `10499`
- Snippet: `MCM 206: Manuscript Editing, Layout and Design in Book Publishing`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 135. communication_media.json — MASS COMMUNICATION — P12, P13, P14 — MCM 210

- Stored title: `introduction to film production`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf
- Extracted locator: page `198`, line `10587`
- Snippet: `MCM 210: Presentation and Performance            (2 Units C: LH 30)`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 136. communication_media.json — MASS COMMUNICATION — P12, P13, P14 — MCM 216

- Stored title: `digital marketing`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf
- Extracted locator: page `186`, line `9834`
- Snippet: `MCM 216      Fundamentals of Media Relations     2                   D`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 137. communication_media.json — MASS COMMUNICATION — P12, P13, P14 — MCM 301

- Stored title: `investigative reporting`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf
- Extracted locator: page `203`, line `10866`
- Snippet: `MCM 301: Mass Communication and Politics          (2 Units C: LH 30)`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 138. communication_media.json — MASS COMMUNICATION — P12, P13, P14 — MCM 302

- Stored title: `science, health and environment reporting`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf
- Extracted locator: page `204`, line `10888`
- Snippet: `MCM 302: Online Journalism              (2 Units C: LH 30)`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 139. communication_media.json — MASS COMMUNICATION — P12, P13, P14 — MCM 303

- Stored title: `business and economic reporting`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf
- Extracted locator: page `204`, line `10906`
- Snippet: `MCM 303: Gender and Communication       (2 Units C: LH 30)`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 140. communication_media.json — MASS COMMUNICATION — P12, P13, P14 — MCM 304

- Stored title: `political reporting`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf
- Extracted locator: page `205`, line `10956`
- Snippet: `MCM 304: Foreign Correspondence               (2 Units C: LH 30)`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 141. communication_media.json — MASS COMMUNICATION — P12, P13, P14 — MCM 305

- Stored title: `media management`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf
- Extracted locator: page `205`, line `10975`
- Snippet: `MCM 305: Newspaper Management and Production  (2 Units C: LH 30)`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 142. communication_media.json — MASS COMMUNICATION — P12, P13, P14 — MCM 306

- Stored title: `journalism internship`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf
- Extracted locator: page `206`, line `10993`
- Snippet: `MCM 306: Investigative Journalism       (2 Units C: LH 30)`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 143. communication_media.json — MASS COMMUNICATION — P12, P13, P14 — MCM 307

- Stored title: `media law and ethics`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf
- Extracted locator: page `206`, line `11009`
- Snippet: `MCM 307: Photojournalism Research and Management (2 Units C: LH 30)`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 144. communication_media.json — MASS COMMUNICATION — P12, P13, P14 — MCM 308

- Stored title: `data journalism`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf
- Extracted locator: page `186`, line `9852`
- Snippet: `MCM 308      Peace and Conflict Resolution    2      C 30`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 145. communication_media.json — PUBLIC RELATIONS — P12, P13, P14 — PRS 205

- Stored title: `public relations for not-for-profit sector`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf
- Extracted locator: page `222`, line `11900`
- Snippet: `PRS 205 Public Relations for not-for -Profit sector2     C      30`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 146. communication_media.json — PUBLIC RELATIONS — P12, P13, P14 — PRS 209

- Stored title: `public relations in a multi-cultural society`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf
- Extracted locator: page `222`, line `11908`
- Snippet: `PRS 209 Public Relations in a Multi-cultural2            C      30`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 147. communication_media.json — STRATEGIC COMMUNICATION — P12, P13, P14 — CMS 102

- Stored title: `introduction to communication ii [table: writing for the media]`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf
- Extracted locator: page `52`, line `2494`
- Snippet: `CMS 102 Writing for the Media                 2   C  30`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 148. communication_media.json — STRATEGIC COMMUNICATION — P12, P13, P14 — CMS 302

- Stored title: `foundation of communication research`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf
- Extracted locator: page `52`, line `2550`
- Snippet: `CMS 302 Foundation of Communication           2   C  30`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 149. communication_media.json — STRATEGIC COMMUNICATION — P12, P13, P14 — STC 202

- Stored title: `writing for strategic communication`
- Disposition: `normalized_title_variant`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf
- Extracted locator: page `252`, line `13646`
- Snippet: `STC 202: Writing for of Strategic Communication  (2 Unit C: LH 30)`
- Rationale: The extracted code-row title matches after punctuation, ampersand, abbreviation, or OCR normalization.

### 150. computing.json — Cybersecurity — CYB 322

- Stored title: `cybersecurity innovation and new technologies`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf
- Extracted locator: page `59`, line `2862`
- Snippet: `CYB 322    Cybersecurity Innovation and New 2          C  15 45`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 151. computing.json — Data Science — DTS 204

- Stored title: `statistical computing inference and modelling`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf
- Extracted locator: page `106`, line `5516`
- Snippet: `DTS 204: Statistical Computing II           (3 Units C: LH 45)`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 152. computing.json — Data Science — DTS 322

- Stored title: `data science innovation and entrepreneurship`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf
- Extracted locator: page `96`, line `4938`
- Snippet: `DTS 322`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 153. computing.json — Information Systems — ICT 305

- Stored title: `data communications system and networking`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf
- Extracted locator: page `151`, line `8002`
- Snippet: `ICT 305 Data Communications System and 3            C          30 45`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 154. computing.json — Information Systems — INS 322

- Stored title: `information systems innovation and new technologies`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf
- Extracted locator: page `166`, line `8860`
- Snippet: `INS 322: Information Systems Innovation and Entrepreneurship (2 Units C: LH`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 155. computing.json — Information and Communication Technology — ICT 309

- Stored title: `mobile communication & network`
- Disposition: `normalized_title_variant`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf
- Extracted locator: page `138`, line `7246`
- Snippet: `ICT 309: Mobile Communication& Network                   (3 Units C: LH 30; PH 45)`
- Rationale: The extracted code-row title matches after punctuation, ampersand, abbreviation, or OCR normalization.

### 156. computing.json — Software Engineering — SEN 401

- Stored title: `software configuration management and maintenance`
- Disposition: `normalized_title_variant`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf
- Extracted locator: page `222`, line `12052`
- Snippet: `SEN401: Software Configuration Management & Maintenance                     (2 Units`
- Rationale: The extracted code-row title matches after punctuation, ampersand, abbreviation, or OCR normalization.

### 157. education.json — Primary Education — PED 412

- Stored title: `education laws, policies and child’s`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf
- Extracted locator: page `940`, line `52684`
- Snippet: `PED 412    Education Laws, Policies and Child's 2     C  30 -`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 158. engineering.json — AGRICULTURAL AND BIOSYSTEMS ENGINEERING — ABE 102

- Stored title: `introduction to agricultural and biosystem engineering`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf
- Extracted locator: page `87`, line `5050`
- Snippet: `ABE 102: Introduction to Agricultural and Biosystems Engineering`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 159. engineering.json — CHEMICAL ENGINEERING — TCH 301

- Stored title: `transfer processes i 2 c 15 tut`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf
- Extracted locator: page `221`, line `13496`
- Snippet: `TCH 301: Transfer Processes I                          (2 Units C: LH 15; PH 45)`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 160. engineering.json — CHEMICAL ENGINEERING — TCH 305

- Stored title: `chemical engineering laboratories i`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf
- Extracted locator: page `223`, line `13605`
- Snippet: `TCH 305: Chemical Engineering Laboratory I                  (1 Unit C: PH 45)`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 161. engineering.json — CHEMICAL ENGINEERING — TCH 555

- Stored title: `chemical engineering research project recommendation: tch 555 – chemical engineering research project be taken/taught over the two semesters of the final year.`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf
- Extracted locator: page `203`, line `12401`
- Snippet: `RECOMMENDATION: TCH 555 � Chemical Engineering Research Project be`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 162. engineering.json — ELECTRONIC ENGINEERING — ELE 101

- Stored title: `introduction to electronic design and 2 с 15 45 practice`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf
- Extracted locator: page `360`, line `22062`
- Snippet: `ELE 101: Introduction to Electronic Design and Practice`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 163. engineering.json — ELECTRONIC ENGINEERING — ELE 405

- Stored title: `engineering system modeling and simulation`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf
- Extracted locator: page `375`, line `22958`
- Snippet: `ELE 405: Engineering System Modelling and Simulation (3 Units C: LH 45)`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 164. engineering.json — ELECTRONIC ENGINEERING — ELE 407

- Stored title: `data communications and networking`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf
- Extracted locator: page `376`, line `22993`
- Snippet: `ELE 407: Data Communication and Networking            (3 Units C: LH 30; PH 45)`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 165. engineering.json — ELECTRONIC ENGINEERING — ELE 507

- Stored title: `digital signal processing and applications`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf
- Extracted locator: page `355`, line `21721`
- Snippet: `ELE 507    Digital Signal Processing and 3        C                45 -`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 166. engineering.json — ELECTRONIC ENGINEERING — GET 307

- Stored title: `introductionn to artificial intelligence, machine learning and convergent technologies`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf
- Extracted locator: page `58`, line `3189`
- Snippet: `GET 307: Introduction to Artificial Intelligence, Machine Learning and Convergent`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 167. engineering.json — FOOD SCIENCE AND TECHNOLOGY — FST 102

- Stored title: `introduction to food science and technology`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf
- Extracted locator: page `510`, line `31245`
- Snippet: `FST 102: Introduction to Food Technology    (2 Units C: LH 30)`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 168. engineering.json — FOOD SCIENCE AND TECHNOLOGY — FST 204

- Stored title: `introduction to sample and data handling in food analysis and quality 30 control`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf
- Extracted locator: page `516`, line `31596`
- Snippet: `FST 204: Introduction to Sample and Data Handling in Food Analysis and Quality`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 169. engineering.json — FOOD SCIENCE AND TECHNOLOGY — FST 300

- Stored title: `laboratory practical i (instrumentation and chemical analyses of foods)`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf
- Extracted locator: page `521`, line `31879`
- Snippet: `FST 300: Laboratory Practical (Instrumentation and chemical analyses of foods`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 170. engineering.json — FOOD SCIENCE AND TECHNOLOGY — FST 331

- Stored title: `transport phenomena and thermo- dynamics i`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf
- Extracted locator: page `503`, line `30785`
- Snippet: `FST 331         Transport Phenomena and Thermo- 2                      C      30 -`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 171. engineering.json — FOOD SCIENCE AND TECHNOLOGY — FST 513

- Stored title: `seminar on special topic in food science & technology`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf
- Extracted locator: page `531`, line `32469`
- Snippet: `FST 513: Final Year Research Project       (3 Units C: PH 135)`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 172. engineering.json — FOOD SCIENCE AND TECHNOLOGY — MME 202

- Stored title: `engineering materials /food packaging materials`
- Disposition: `genuine_title_conflict_candidate`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf
- Extracted locator: page `515`, line `31531`
- Snippet: `MME 202: Engineering Materials: Structure and Properties (3 Units C: LH 45)`
- Rationale: The best official-extract code-row candidate does not support the stored title; the package/course identity requires source adjudication.

### 173. engineering.json — INDUSTRIAL AND PRODUCTION ENGINEERING — IPE 421

- Stored title: `production and inventory systems design`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf
- Extracted locator: page `603`, line `36868`
- Snippet: `IPE 421: Production and Inventory Design  (3 Units C: LH 45)`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 174. engineering.json — MECHATRONICS ENGINEERING — MCE 403

- Stored title: `micro controller and embedded systems`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf
- Extracted locator: page `801`, line `48758`
- Snippet: `MCE 403: Microcontroller and Embedded Systems (2 Units C: PH 30)`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 175. engineering.json — NATURAL GAS ENGINEERING — GNG 113

- Stored title: `introduction to natural gas resources technology 30 -`
- Disposition: `normalized_title_variant`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf
- Extracted locator: page `943`, line `57571`
- Snippet: `GNG 113: Introduction to Natural Gas Resources Technology (2 Units C: LH 30)`
- Rationale: The extracted code-row title matches after punctuation, ampersand, abbreviation, or OCR normalization.

### 176. engineering.json — WATER RESOURCES ENGINEERING — GET 299

- Stored title: `siwes i 300level`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf
- Extracted locator: page `39`, line `2057`
- Snippet: `GET 299                     SIWES I                       3         C      9 weeks`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 177. engineering.json — WATER RESOURCES ENGINEERING — WRE 101

- Stored title: `introduction to water resources engineering 30 -`
- Disposition: `normalized_title_variant`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf
- Extracted locator: page `1278`, line `77695`
- Snippet: `WRE 101: Introduction to Water Resources Engineering (2 Units C: LH 30)`
- Rationale: The extracted code-row title matches after punctuation, ampersand, abbreviation, or OCR normalization.

### 178. law.json — Common and Islamic Law — ICL 503

- Stored title: `murafa'at (islamic law of evidence & procedure`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Law-ALL.pdf
- Extracted locator: page `81`, line `3678`
- Snippet: `ICL 503: Islamic Law of Procedure & Evidence (Murafa’at) (3 units C: LH 45)`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 179. social_sciences.json — Criminology and Security Studies — CSS 204

- Stored title: `applied statistics in criminology and security studies`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf
- Extracted locator: page `34`, line `1960`
- Snippet: `CSS 204: Applied Statistical Methods in Criminology and Security Studies (2`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 180. social_sciences.json — Demography and Social Statistics — DSS 308

- Stored title: `labour force — theoretical considerations`
- Disposition: `normalized_title_variant`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf
- Extracted locator: page `63`, line `3567`
- Snippet: `DSS 308: Labour Force - theoretical Considerations (2 Units C: LH 30)`
- Rationale: The extracted code-row title matches after punctuation, ampersand, abbreviation, or OCR normalization.

### 181. social_sciences.json — Economics — ECO 102

- Stored title: `principles of economics ii`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf
- Extracted locator: page `96`, line `5460`
- Snippet: `ECO 102 Principles of Economics ll 2 C 30`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 182. social_sciences.json — Economics — ECO 104

- Stored title: `introductory mathematics ii`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf
- Extracted locator: page `96`, line `5461`
- Snippet: `ECO 104 Introductory Mathematics ll 2 C 30`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 183. social_sciences.json — Economics — ECO 201

- Stored title: `introduction to microeconomics i`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf
- Extracted locator: page `96`, line `5470`
- Snippet: `ECO 201 Introduction to Microeconomics l 2 C 30`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 184. social_sciences.json — Economics — ECO 202

- Stored title: `introduction to microeconomics ii`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf
- Extracted locator: page `96`, line `5475`
- Snippet: `ECO 202 Introduction to Microeconomics ll 2 C 30`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 185. social_sciences.json — Economics — ECO 203

- Stored title: `introduction to macroeconomics i`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf
- Extracted locator: page `96`, line `5471`
- Snippet: `ECO  203 Introduction to Macroeconomics l 2 C 30`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 186. social_sciences.json — Economics — ECO 204

- Stored title: `introduction to macroeconomics ii`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf
- Extracted locator: page `96`, line `5476`
- Snippet: `ECO 204 Introduction to Macroeconomics ll 2 C 30`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 187. social_sciences.json — Economics — ECO 205

- Stored title: `structure of the nigerian economy`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf
- Extracted locator: page `96`, line `5472`
- Snippet: `ECO 205 Structure of the Nigerian 2 C 30`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 188. social_sciences.json — Economics — ECO 301

- Stored title: `intermediate microeconomic theory i`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf
- Extracted locator: page `106`, line `6004`
- Snippet: `ECO 301: Intermediate Microeconomic Theory l (2 Units C: LH 30)`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 189. social_sciences.json — Economics — ECO 302

- Stored title: `intermediate microeconomics ii`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf
- Extracted locator: page `97`, line `5489`
- Snippet: `ECO 302 Intermediate Microeconomics ll 2 C 30`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 190. social_sciences.json — Economics — ECO 303

- Stored title: `intermediate macroeconomic theory i`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf
- Extracted locator: page `106`, line `6026`
- Snippet: `ECO 303: Intermediate Macroeconomic Theory l (2 Units C: LH 30)`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 191. social_sciences.json — Economics — ECO 304

- Stored title: `intermediate macroeconomics ii`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf
- Extracted locator: page `97`, line `5490`
- Snippet: `ECO 304 Intermediate Macroeconomics ll 2 C 30`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 192. social_sciences.json — Economics — ECO 402

- Stored title: `advanced microeconomics ii`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf
- Extracted locator: page `97`, line `5502`
- Snippet: `ECO 402 Advanced Microeconomics ll 2 C 30`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 193. social_sciences.json — Economics — ECO 403

- Stored title: `advanced macroeconomics i`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf
- Extracted locator: page `227`, line `12898`
- Snippet: `ECO 403 Advanced Macroeconomics 2 C 30`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 194. social_sciences.json — Economics — ECO 404

- Stored title: `advanced macroeconomics ii`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf
- Extracted locator: page `97`, line `5503`
- Snippet: `ECO 404 Advanced Macroeconomics ll 2 C 30`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 195. social_sciences.json — Library and Information Science — LIS 416

- Stored title: `introduction to archives and records management`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf
- Extracted locator: page `141`, line `8004`
- Snippet: `LIS 416 Introduction   to   Archives   and   Records 2 C  30 -`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 196. social_sciences.json — Library and Information Science — LIS 418

- Stored title: `preservation, conservation and security of library and information resources`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf
- Extracted locator: page `141`, line `8007`
- Snippet: `LIS 418 Preservation,  Conservation  and  Security  of 2 C  30`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 197. social_sciences.json — Peace Studies and Conflict Resolution — PCR 305

- Stored title: `international systems of peace and conflict management`
- Disposition: `wrapped_or_continuation_candidate_needs_visual_confirmation`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf
- Extracted locator: page `176`, line `10003`
- Snippet: `PCR 305: The International System of Peace and Conflict Resolution (2 Units`
- Rationale: Several expected title tokens occur near the code, but the extracted text is incomplete or abbreviated; retain for visual/source confirmation.

### 198. social_sciences.json — Peace Studies and Conflict Resolution — PCR 309

- Stored title: `peace building, monitoring and evaluation`
- Disposition: `normalized_title_variant`
- PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf
- Extracted locator: page `178`, line `10101`
- Snippet: `PCR 309: Peace Building, Project Monitoring, and Evaluation (2 Units C: LH 30)`
- Rationale: The extracted code-row title matches after punctuation, ampersand, abbreviation, or OCR normalization.

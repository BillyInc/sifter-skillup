# Residual CCMAS locator lane 2 checkpoint 001 — 2026-09-29

This append-only checkpoint searches only the 55 records classified `code_not_located_in_extracted_source`.
It excludes the 2,189 same-page candidates and 198 code-only candidates, and it edits no canonical mapping.

## Counts

- Records searched: **55**
- `extraction_limitation_candidate`: **5**
- `extraction_limitation_missing_local_text`: **31**
- `extraction_or_scope_mismatch_candidate`: **2**
- `source_title_present_code_or_scope_mismatch_candidate`: **17**

## Interpretation

A `source_omission_candidate` is not an unavailable decision. It means the exact row was not found in the current extracted official PDF text and needs visual/source retrieval adjudication.

### `administration_management.json::Aviation Management :: AVM 211`

- Title: aviation human factors
- JAMB contexts: Aviation Business, Aviation Security
- Disposition: **`extraction_limitation_candidate`**
- Official source: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Rationale: Title tokens occur in a split/nearby form, but the exact course row is not established; inspect PDF layout or adjacent continuation pages.
- Candidate physical page 80 (title_tokens_split_or_normalized_candidate, title ratio 1.0, window ratio 1.0):
  - line 9: `AVM308 Aviation Labour Relations 2 C 30 - AVM309 Airline Fleet Planning 3 C 45 - AVM310 Human Resource Management in`
  - line 10: `AVM309 Airline Fleet Planning 3 C 45 - AVM310 Human Resource Management in Aviation`
- Candidate physical page 101 (title_tokens_split_or_normalized_candidate, title ratio 1.0, window ratio 1.0):
  - line 9: `transport environment; 2. develop the knowledge and understanding of human error and error defenses; 3. develop knowledge and understanding of performance shaping factors; and`
  - line 10: `2. develop the knowledge and understanding of human error and error defenses; 3. develop knowledge and understanding of performance shaping factors; and 4. develop knowledge and understanding of error management (EM).`

### `administration_management.json::Aviation Management :: AVM 306`

- Title: aviation strategic planning
- JAMB contexts: Aviation Business, Aviation Security
- Disposition: **`extraction_limitation_candidate`**
- Official source: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Rationale: Title tokens occur in a split/nearby form, but the exact course row is not established; inspect PDF layout or adjacent continuation pages.
- Candidate physical page 80 (title_tokens_split_or_normalized_candidate, title ratio 1.0, window ratio 1.0):
  - line 4: `AVM303 Air Transport Environmental Planning 2 C 30 - AVM304 Airport Strategic Planning 2 C 30 -`
  - line 5: `AVM303 Air Transport Environmental Planning 2 C 30 - AVM304 Airport Strategic Planning 2 C 30 - AVM305 Aviation Law 3 C 45 -`
- Candidate physical page 94 (weak_title_token_candidate, title ratio 1.0, window ratio 0.667):
  - line 24: `annoyance. Community relation. Case studies. AVM 304: Airport Strategic Planning (2 Units C: LH 30)`
  - line 25: `AVM 304: Airport Strategic Planning (2 Units C: LH 30)`

### `administration_management.json::Aviation Management :: AVM 490`

- Title: research project
- JAMB contexts: Aviation Business, Aviation Security
- Disposition: **`source_title_present_code_or_scope_mismatch_candidate`**
- Official source: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Rationale: The title is present in the extracted official source, but the expected code is not an exact hit; investigate source code variation, cross-listed rows, or a local scope error.
- Candidate physical page 93 (title_candidate_without_code, title ratio 1.0, window ratio 1.0):
  - line 3: `93 development: business planning, market research, etc. Entrepreneurial finance: venture`
  - line 4: `development: business planning, market research, etc. Entrepreneurial finance: venture capital, equity finance. Micro finance, personal savings, small business investment`
- Candidate physical page 109 (title_candidate_without_code, title ratio 1.0, window ratio 1.0):
  - line 13: `C 3 45 45 BIT 413 Seminar & Workshop in BIT C 3 - 45 BIT 423 Research Project (On-going) I C 3 - 45`
  - line 14: `BIT 413 Seminar & Workshop in BIT C 3 - 45 BIT 423 Research Project (On-going) I C 3 - 45 BIT 421 Business Data Communications and`

### `administration_management.json::Entrepreneurship :: ENP 201`

- Title: entrepreneurial financing
- JAMB contexts: Digital Entrepreneurship, Entrepreneurship and Business Management, Entrepreneurship and Innovation, Social Innovation and Entrepreneurship
- Disposition: **`source_title_present_code_or_scope_mismatch_candidate`**
- Official source: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Rationale: The title is present in the extracted official source, but the expected code is not an exact hit; investigate source code variation, cross-listed rows, or a local scope error.
- Candidate physical page 213 (title_candidate_without_code, title ratio 1.0, window ratio 1.0):
  - line 7: `2 C 30 ENT 211 Entrepreneurship and Innovation 2 C 30 - ENT 223 Introduction to Entrepreneurial`
  - line 8: `ENT 211 Entrepreneurship and Innovation 2 C 30 - ENT 223 Introduction to Entrepreneurial Financing`
- Candidate physical page 220 (title_candidate_without_code, title ratio 1.0, window ratio 1.0):
  - line 15: `3. analyze the importance of micro and small businesses in wealth creation, employment, and financial independence; 4. engage in entrepreneurial thinking;`
  - line 16: `and financial independence; 4. engage in entrepreneurial thinking; 5. identify key elements in innovation;`

### `administration_management.json::Entrepreneurship :: ENP 202`

- Title: entrepreneurial environment
- JAMB contexts: Digital Entrepreneurship, Entrepreneurship and Business Management, Entrepreneurship and Innovation, Social Innovation and Entrepreneurship
- Disposition: **`source_title_present_code_or_scope_mismatch_candidate`**
- Official source: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Rationale: The title is present in the extracted official source, but the expected code is not an exact hit; investigate source code variation, cross-listed rows, or a local scope error.
- Candidate physical page 71 (title_candidate_without_code, title ratio 1.0, window ratio 1.0):
  - line 4: `Concept of entrepreneurship in the actuarial profession Actuaryprenuer. Nigerian entrepreneurial environment- challenges and opportunities. Opportunity scouting/discovery.`
  - line 5: `Concept of entrepreneurship in the actuarial profession Actuaryprenuer. Nigerian entrepreneurial environment- challenges and opportunities. Opportunity scouting/discovery. Risk-taking and risk- taking behavior. Creative thinking. The importance of Actuarial control`
- Candidate physical page 212 (title_candidate_without_code, title ratio 1.0, window ratio 1.0):
  - line 40: `venture Creation 3 C 30 45 ENT 122 The Nigerian Entrepreneurial`
  - line 41: `3 C 30 45 ENT 122 The Nigerian Entrepreneurial Environment`

### `administration_management.json::Entrepreneurship :: ENP 203`

- Title: marketing for new ventures
- JAMB contexts: Digital Entrepreneurship, Entrepreneurship and Business Management, Entrepreneurship and Innovation, Social Innovation and Entrepreneurship
- Disposition: **`extraction_limitation_candidate`**
- Official source: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Rationale: Title tokens occur in a split/nearby form, but the exact course row is not established; inspect PDF layout or adjacent continuation pages.
- Candidate physical page 221 (title_tokens_split_or_normalized_candidate, title ratio 1.0, window ratio 1.0):
  - line 27: `At the end of this course, students should be able to: 1. students will state the importance of marketing to start ups and small businesses; 2. students will analyze traditional and technology-based methods of marketing new ventures`
  - line 28: `1. students will state the importance of marketing to start ups and small businesses; 2. students will analyze traditional and technology-based methods of marketing new ventures and generating customers and clients;`
- Candidate physical page 391 (title_tokens_split_or_normalized_candidate, title ratio 1.0, window ratio 1.0):
  - line 47: `Learning Outcomes: Upon the completion of this course, the student should be able to: 1. design new products/services for marketing;`
  - line 48: `Upon the completion of this course, the student should be able to: 1. design new products/services for marketing; 2. create new ventures and marketing strategies for their operation;`

### `administration_management.json::Entrepreneurship :: ENP 204`

- Title: theories of entrepreneurship
- JAMB contexts: Digital Entrepreneurship, Entrepreneurship and Business Management, Entrepreneurship and Innovation, Social Innovation and Entrepreneurship
- Disposition: **`source_title_present_code_or_scope_mismatch_candidate`**
- Official source: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Rationale: The title is present in the extracted official source, but the expected code is not an exact hit; investigate source code variation, cross-listed rows, or a local scope error.
- Candidate physical page 37 (title_candidate_without_code, title ratio 1.0, window ratio 1.0):
  - line 5: `Learning Outcomes At the end of this course, students should be able to: 1. explain the concepts and theories of entrepreneurship, intrapreneurship, opportunity seeking,`
  - line 6: `At the end of this course, students should be able to: 1. explain the concepts and theories of entrepreneurship, intrapreneurship, opportunity seeking, new value creation, and risk taking;`
- Candidate physical page 61 (title_candidate_without_code, title ratio 1.0, window ratio 1.0):
  - line 6: `philosophy and human conduct, philosophy and religion, philosophy and human values, philosophy and character molding, etc. ENT 211: Entrepreneurship and Innovation (2 Units C: LH 15; PH 45)`
  - line 7: `philosophy and character molding, etc. ENT 211: Entrepreneurship and Innovation (2 Units C: LH 15; PH 45) Learning Outcomes`

### `administration_management.json::Entrepreneurship :: ENP 205`

- Title: industrial learning and tours i
- JAMB contexts: Digital Entrepreneurship, Entrepreneurship and Business Management, Entrepreneurship and Innovation, Social Innovation and Entrepreneurship
- Disposition: **`source_title_present_code_or_scope_mismatch_candidate`**
- Official source: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Rationale: The title is present in the extracted official source, but the expected code is not an exact hit; investigate source code variation, cross-listed rows, or a local scope error.
- Candidate physical page 222 (title_candidate_without_code, title ratio 1.0, window ratio 1.0):
  - line 10: `and thinking. ENT 232: Industrial Learning and Tours I (3 Units C: LH 15; PH 90)`
  - line 11: `ENT 232: Industrial Learning and Tours I (3 Units C: LH 15; PH 90)`
- Candidate physical page 226 (title_candidate_without_code, title ratio 0.667, window ratio 0.667):
  - line 18: `studies and Business Case. Marketing research, feasibility studies, business case development. ENT 336: Iindustrial Learning and Tours II (3 Units C: LH 15; PH 90)`
  - line 19: `ENT 336: Iindustrial Learning and Tours II (3 Units C: LH 15; PH 90)`

### `administration_management.json::Entrepreneurship :: ENP 301`

- Title: business opportunity scouting
- JAMB contexts: Digital Entrepreneurship, Entrepreneurship and Business Management, Entrepreneurship and Innovation, Social Innovation and Entrepreneurship
- Disposition: **`source_title_present_code_or_scope_mismatch_candidate`**
- Official source: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Rationale: The title is present in the extracted official source, but the expected code is not an exact hit; investigate source code variation, cross-listed rows, or a local scope error.
- Candidate physical page 213 (title_candidate_without_code, title ratio 1.0, window ratio 1.0):
  - line 25: `GST 312 Peace and Conflict resolution 2 C 30 - ENT 312 Venture Creation 2 C 30 - ENT 315 Business Opportunity Scouting and`
  - line 26: `ENT 312 Venture Creation 2 C 30 - ENT 315 Business Opportunity Scouting and Evaluation`
- Candidate physical page 224 (title_candidate_without_code, title ratio 1.0, window ratio 1.0):
  - line 7: `Course Contents Opportunity identification: sources of business opportunities in Nigeria, environmental`
  - line 8: `Course Contents Opportunity identification: sources of business opportunities in Nigeria, environmental scanning. Demand and supply gap/unmet needs/market gaps/market research. Unutilised`

### `administration_management.json::Entrepreneurship :: ENP 302`

- Title: sociology of entrepreneurship
- JAMB contexts: Digital Entrepreneurship, Entrepreneurship and Business Management, Entrepreneurship and Innovation, Social Innovation and Entrepreneurship
- Disposition: **`source_title_present_code_or_scope_mismatch_candidate`**
- Official source: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Rationale: The title is present in the extracted official source, but the expected code is not an exact hit; investigate source code variation, cross-listed rows, or a local scope error.
- Candidate physical page 213 (title_candidate_without_code, title ratio 1.0, window ratio 1.0):
  - line 6: `Existence 2 C 30 ENT 211 Entrepreneurship and Innovation 2 C 30 -`
  - line 7: `2 C 30 ENT 211 Entrepreneurship and Innovation 2 C 30 - ENT 223 Introduction to Entrepreneurial`
- Candidate physical page 224 (title_candidate_without_code, title ratio 1.0, window ratio 1.0):
  - line 3: `224 8. apply a wide variety of emerging technological solutions to entrepreneurship, and`
  - line 4: `8. apply a wide variety of emerging technological solutions to entrepreneurship, and 9. appreciate why ventures fail due to lack of planning and poor implementation.`

### `administration_management.json::Entrepreneurship :: ENP 303`

- Title: small scale business management
- JAMB contexts: Digital Entrepreneurship, Entrepreneurship and Business Management, Entrepreneurship and Innovation, Social Innovation and Entrepreneurship
- Disposition: **`source_title_present_code_or_scope_mismatch_candidate`**
- Official source: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Rationale: The title is present in the extracted official source, but the expected code is not an exact hit; investigate source code variation, cross-listed rows, or a local scope error.
- Candidate physical page 213 (title_candidate_without_code, title ratio 1.0, window ratio 1.0):
  - line 29: `2 C 30 - ENT 323 Sociology of Entrepreneurship 2 C 30 - ENT 325 Small Scale Business Management 2 C 30 -`
  - line 30: `ENT 323 Sociology of Entrepreneurship 2 C 30 - ENT 325 Small Scale Business Management 2 C 30 - ENT 328 Family Business and Succession Plan 2 C 30 -`
- Candidate physical page 225 (title_candidate_without_code, title ratio 1.0, window ratio 1.0):
  - line 7: `in developing societies. Social enablers. Constraints to entrepreneurs. Creating entrepreneurial society. ENT 325: Small Scale Business Management (2 Units C: LH 30)`
  - line 8: `society. ENT 325: Small Scale Business Management (2 Units C: LH 30)`

### `administration_management.json::Entrepreneurship :: ENP 304`

- Title: family business & succession planning
- JAMB contexts: Digital Entrepreneurship, Entrepreneurship and Business Management, Entrepreneurship and Innovation, Social Innovation and Entrepreneurship
- Disposition: **`source_title_present_code_or_scope_mismatch_candidate`**
- Official source: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Rationale: The title is present in the extracted official source, but the expected code is not an exact hit; investigate source code variation, cross-listed rows, or a local scope error.
- Candidate physical page 225 (title_candidate_without_code, title ratio 1.0, window ratio 1.0):
  - line 21: `managing small business. Startups challenges. ENT 328: FAMILY BUSINESS AND SUCCESSION PLANNING (2 Units C: LH 30)`
  - line 22: `ENT 328: FAMILY BUSINESS AND SUCCESSION PLANNING (2 Units C: LH 30)`
- Candidate physical page 213 (title_tokens_split_or_normalized_candidate, title ratio 1.0, window ratio 1.0):
  - line 30: `ENT 323 Sociology of Entrepreneurship 2 C 30 - ENT 325 Small Scale Business Management 2 C 30 - ENT 328 Family Business and Succession Plan 2 C 30 -`
  - line 31: `ENT 325 Small Scale Business Management 2 C 30 - ENT 328 Family Business and Succession Plan 2 C 30 - ENT 332 Feasibilities and Business Planning 3 C 30 45`

### `administration_management.json::Entrepreneurship :: ENP 305`

- Title: feasibilities and business planning
- JAMB contexts: Digital Entrepreneurship, Entrepreneurship and Business Management, Entrepreneurship and Innovation, Social Innovation and Entrepreneurship
- Disposition: **`source_title_present_code_or_scope_mismatch_candidate`**
- Official source: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Rationale: The title is present in the extracted official source, but the expected code is not an exact hit; investigate source code variation, cross-listed rows, or a local scope error.
- Candidate physical page 213 (title_candidate_without_code, title ratio 1.0, window ratio 1.0):
  - line 31: `ENT 325 Small Scale Business Management 2 C 30 - ENT 328 Family Business and Succession Plan 2 C 30 - ENT 332 Feasibilities and Business Planning 3 C 30 45`
  - line 32: `ENT 328 Family Business and Succession Plan 2 C 30 - ENT 332 Feasibilities and Business Planning 3 C 30 45 ENT 334 Research Methods 3 C 45 -`
- Candidate physical page 225 (title_candidate_without_code, title ratio 1.0, window ratio 1.0):
  - line 21: `managing small business. Startups challenges. ENT 328: FAMILY BUSINESS AND SUCCESSION PLANNING (2 Units C: LH 30)`
  - line 22: `ENT 328: FAMILY BUSINESS AND SUCCESSION PLANNING (2 Units C: LH 30)`

### `administration_management.json::Entrepreneurship :: ENP 306`

- Title: research methods
- JAMB contexts: Digital Entrepreneurship, Entrepreneurship and Business Management, Entrepreneurship and Innovation, Social Innovation and Entrepreneurship
- Disposition: **`source_title_present_code_or_scope_mismatch_candidate`**
- Official source: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Rationale: The title is present in the extracted official source, but the expected code is not an exact hit; investigate source code variation, cross-listed rows, or a local scope error.
- Candidate physical page 79 (title_candidate_without_code, title ratio 1.0, window ratio 1.0):
  - line 39: `GST 312 Peace and Conflict Resolution 2 C 30 - ENT 312 Venture Creation 2 C 15 45 AVM301 Research Methods in Aviation 3 C 45 -`
  - line 40: `ENT 312 Venture Creation 2 C 15 45 AVM301 Research Methods in Aviation 3 C 45 - AVM302 Air Transport Management 3 C 30 -`
- Candidate physical page 93 (title_candidate_without_code, title ratio 1.0, window ratio 1.0):
  - line 3: `93 development: business planning, market research, etc. Entrepreneurial finance: venture`
  - line 4: `development: business planning, market research, etc. Entrepreneurial finance: venture capital, equity finance. Micro finance, personal savings, small business investment`

### `administration_management.json::Entrepreneurship :: ENP 307`

- Title: industrial learning and tours ii
- JAMB contexts: Digital Entrepreneurship, Entrepreneurship and Business Management, Entrepreneurship and Innovation, Social Innovation and Entrepreneurship
- Disposition: **`source_title_present_code_or_scope_mismatch_candidate`**
- Official source: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Rationale: The title is present in the extracted official source, but the expected code is not an exact hit; investigate source code variation, cross-listed rows, or a local scope error.
- Candidate physical page 226 (title_candidate_without_code, title ratio 0.667, window ratio 0.667):
  - line 18: `studies and Business Case. Marketing research, feasibility studies, business case development. ENT 336: Iindustrial Learning and Tours II (3 Units C: LH 15; PH 90)`
  - line 19: `ENT 336: Iindustrial Learning and Tours II (3 Units C: LH 15; PH 90)`
- Candidate physical page 213 (title_tokens_split_or_normalized_candidate, title ratio 1.0, window ratio 1.0):
  - line 15: `ENT 225 Entrepreneurial Marketing 2 C 30 - ENT 227 Theories of Entrepreneurship 2 C 30 - ENT 232 Industrial Learning and Tours 1 3 C 15 90`
  - line 16: `ENT 227 Theories of Entrepreneurship 2 C 30 - ENT 232 Industrial Learning and Tours 1 3 C 15 90 ENT 234 Biographical Studies of Entrepreneurial`

### `administration_management.json::Entrepreneurship :: ENP 401`

- Title: social entrepreneurship & comm. dev.
- JAMB contexts: Digital Entrepreneurship, Entrepreneurship and Business Management, Entrepreneurship and Innovation, Social Innovation and Entrepreneurship
- Disposition: **`extraction_limitation_candidate`**
- Official source: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Rationale: Title tokens occur in a split/nearby form, but the exact course row is not established; inspect PDF layout or adjacent continuation pages.
- Candidate physical page 210 (weak_title_token_candidate, title ratio 0.5, window ratio 0.5):
  - line 10: `The major objectives of the degree programme in Entrepreneurship are to: 1. develop entrepreneurial spirit among the new generation of students with the hope of creating new and greater social and economic value for the sustainable development of`
  - line 12: `creating new and greater social and economic value for the sustainable development of the society; 2. nurture entrepreneurship knowledge among students through entrepreneurship studies`
- Candidate physical page 213 (weak_title_token_candidate, title ratio 0.5, window ratio 0.5):
  - line 38: `400 Level Course Code Course title Units Status LH PH ENT 416 Social Entrepreneurship and`
  - line 39: `Course Code Course title Units Status LH PH ENT 416 Social Entrepreneurship and Community Development`

### `administration_management.json::Entrepreneurship :: ENP 402`

- Title: technological entrepreneurship & ipr
- JAMB contexts: Digital Entrepreneurship, Entrepreneurship and Business Management, Entrepreneurship and Innovation, Social Innovation and Entrepreneurship
- Disposition: **`extraction_limitation_candidate`**
- Official source: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Rationale: Title tokens occur in a split/nearby form, but the exact course row is not established; inspect PDF layout or adjacent continuation pages.
- Candidate physical page 41 (weak_title_token_candidate, title ratio 0.667, window ratio 0.667):
  - line 3: `41 8. apply a wide variety of emerging technological solutions to entrepreneurship;`
  - line 4: `8. apply a wide variety of emerging technological solutions to entrepreneurship; and 9. appreciate why ventures fail due to lack of planning and poor`
- Candidate physical page 66 (weak_title_token_candidate, title ratio 0.667, window ratio 0.667):
  - line 33: `enterprises; 7. conduct entrepreneurial marketing and e-commerce; 8. apply a wide variety of emerging technological solutions to entrepreneurship;`
  - line 34: `7. conduct entrepreneurial marketing and e-commerce; 8. apply a wide variety of emerging technological solutions to entrepreneurship; and 9. appreciate why ventures fail due to lack of planning and poor`

### `administration_management.json::Entrepreneurship :: ENP 403`

- Title: management of creativity & innovation
- JAMB contexts: Digital Entrepreneurship, Entrepreneurship and Business Management, Entrepreneurship and Innovation, Social Innovation and Entrepreneurship
- Disposition: **`source_title_present_code_or_scope_mismatch_candidate`**
- Official source: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Rationale: The title is present in the extracted official source, but the expected code is not an exact hit; investigate source code variation, cross-listed rows, or a local scope error.
- Candidate physical page 213 (title_candidate_without_code, title ratio 1.0, window ratio 1.0):
  - line 44: `Intellectual Property Rights 2 C 30 - ENT 424 Management of Creativity and`
  - line 45: `2 C 30 - ENT 424 Management of Creativity and Innovation`
- Candidate physical page 227 (title_candidate_without_code, title ratio 1.0, window ratio 1.0):
  - line 22: `to protect original ideas, concepts and products from piracy. ENT 424: Management of Creativity and Innovation (2 Units C: LH 30)`
  - line 23: `ENT 424: Management of Creativity and Innovation (2 Units C: LH 30)`

### `administration_management.json::Entrepreneurship :: ENP 404`

- Title: e-business
- JAMB contexts: Digital Entrepreneurship, Entrepreneurship and Business Management, Entrepreneurship and Innovation, Social Innovation and Entrepreneurship
- Disposition: **`source_title_present_code_or_scope_mismatch_candidate`**
- Official source: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Rationale: The title is present in the extracted official source, but the expected code is not an exact hit; investigate source code variation, cross-listed rows, or a local scope error.
- Candidate physical page 41 (title_candidate_without_code, title ratio 1.0, window ratio 1.0):
  - line 8: `Course Contents Opportunity identification: sources of business opportunities in Nigeria, environmental`
  - line 9: `Course Contents Opportunity identification: sources of business opportunities in Nigeria, environmental scanning. Demand and supply gap/unmet needs/market gaps/market research. Unutilised`
- Candidate physical page 53 (title_candidate_without_code, title ratio 1.0, window ratio 1.0):
  - line 36: `or its equivalent including English Language and Mathematics and any three of the following subjects: Further Mathematics, Economics, Geography, Chemistry, Physics, Computer Studies, Biology, Financial Accounting, Commerce, Business Methods and Statistics at not`
  - line 37: `subjects: Further Mathematics, Economics, Geography, Chemistry, Physics, Computer Studies, Biology, Financial Accounting, Commerce, Business Methods and Statistics at not more than two sittings.`

### `administration_management.json::Entrepreneurship :: ENP 405`

- Title: entrepreneurship and gender issues
- JAMB contexts: Digital Entrepreneurship, Entrepreneurship and Business Management, Entrepreneurship and Innovation, Social Innovation and Entrepreneurship
- Disposition: **`source_title_present_code_or_scope_mismatch_candidate`**
- Official source: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Rationale: The title is present in the extracted official source, but the expected code is not an exact hit; investigate source code variation, cross-listed rows, or a local scope error.
- Candidate physical page 213 (title_candidate_without_code, title ratio 1.0, window ratio 1.0):
  - line 48: `2 C 30 - ENT 427 E-Business 2 C 30 ENT 428 Entrepreneurship and Gender Issues 2 C 30 -`
  - line 49: `ENT 427 E-Business 2 C 30 ENT 428 Entrepreneurship and Gender Issues 2 C 30 - ENT 429 Strategic Thinking, Problem Solving and`
- Candidate physical page 227 (title_candidate_without_code, title ratio 1.0, window ratio 1.0):
  - line 48: `Online sales. e- Payments. Bitcoin. Crowd funding, etc. ENT 428: Entrepreneurship and Gender Issues (2 Units C: LH 30)`
  - line 49: `ENT 428: Entrepreneurship and Gender Issues (2 Units C: LH 30)`

### `administration_management.json::Entrepreneurship :: ENP 407`

- Title: risk management and insurance
- JAMB contexts: Social Innovation and Entrepreneurship
- Disposition: **`source_title_present_code_or_scope_mismatch_candidate`**
- Official source: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Rationale: The title is present in the extracted official source, but the expected code is not an exact hit; investigate source code variation, cross-listed rows, or a local scope error.
- Candidate physical page 213 (title_candidate_without_code, title ratio 1.0, window ratio 1.0):
  - line 52: `Negotiation Skills 2 C 30 - ENT 432 Risk Management and Insurance 3 C 30 45`
  - line 53: `2 C 30 - ENT 432 Risk Management and Insurance 3 C 30 45`
- Candidate physical page 228 (title_candidate_without_code, title ratio 1.0, window ratio 1.0):
  - line 31: `Problem solving and negotiation skills. ENT 432: Risk Management and Insurance (3 Units C: LH 30; PH 45)`
  - line 32: `ENT 432: Risk Management and Insurance (3 Units C: LH 30; PH 45)`

### `administration_management.json::Entrepreneurship :: ENP 408`

- Title: research for enterprise
- JAMB contexts: Digital Entrepreneurship, Entrepreneurship and Business Management, Entrepreneurship and Innovation, Social Innovation and Entrepreneurship
- Disposition: **`source_title_present_code_or_scope_mismatch_candidate`**
- Official source: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Rationale: The title is present in the extracted official source, but the expected code is not an exact hit; investigate source code variation, cross-listed rows, or a local scope error.
- Candidate physical page 214 (title_candidate_without_code, title ratio 1.0, window ratio 1.0):
  - line 3: `214 ENT 442 Research for Enterprise 4 C 30 90`
  - line 4: `ENT 442 Research for Enterprise 4 C 30 90 Total 19`
- Candidate physical page 228 (title_candidate_without_code, title ratio 1.0, window ratio 1.0):
  - line 8: `2. students are exposed to binding constraints to women social and economic empowerment; and 3. students can demonstrate an approach- social or economic enterprise, to help in reducing`
  - line 9: `and 3. students can demonstrate an approach- social or economic enterprise, to help in reducing gender gap in their localities.`

### `administration_management.json::Transport Management :: TPM 400/401`

- Title: research methods in transport
- JAMB contexts: Transport Planning and Management, Transport and Logistics Management, Transport and Tourism
- Disposition: **`extraction_or_scope_mismatch_candidate`**
- Official source: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
- Rationale: The extracted source contains a normalized code/title candidate; inspect the exact programme table and continuation before changing the record.
- Candidate physical page 604 (exact_code_and_title_candidate, title ratio 1.0, window ratio 1.0):
  - line 15: `400 LEVEL TPM 400: Research Methods in Transport (6 units C: PH 270)`
  - line 16: `TPM 400: Research Methods in Transport (6 units C: PH 270)`
- Candidate physical page 358 (code_candidate_title_not_exact, title ratio 1.0, window ratio 0.667):
  - line 34: `SCM 2 C 30 - LSM 309 Research Methods in Logistics and`
  - line 35: `2 C 30 - LSM 309 Research Methods in Logistics and Supply Chain Management`

### `arts.json::English Language and Literature :: LIT306`

- Title: nigerian oral literatures in english translation ( to include field work
- JAMB contexts: English Studies, English and Literary Studies, Literature in English
- Disposition: **`extraction_limitation_missing_local_text`**
- Official source: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf
- Rationale: The official source URL is known, but this source PDF has no local extracted-text corpus in the current workspace. Retrieve/extract it before distinguishing source omission from a code/title mismatch.

### `communication_media.json::FILM & MULTIMEDIA — P12, P13, P14 :: FMM 207`

- Title: film, multimedia & culture ii
- JAMB contexts: Film and Video Studies
- Disposition: **`extraction_limitation_missing_local_text`**
- Official source: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf
- Rationale: The official source URL is known, but this source PDF has no local extracted-text corpus in the current workspace. Retrieve/extract it before distinguishing source omission from a code/title mismatch.

### `communication_media.json::INFORMATION AND MEDIA STUDIES — P12, P13, P14 :: ISM 201`

- Title: information systems and networks
- JAMB contexts: INFORMATION AND MEDIA SCIENCE, INFORMATION SCIENCE AND MEDIA STUDIES, Information and Media Studies
- Disposition: **`extraction_limitation_missing_local_text`**
- Official source: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf
- Rationale: The official source URL is known, but this source PDF has no local extracted-text corpus in the current workspace. Retrieve/extract it before distinguishing source omission from a code/title mismatch.

### `communication_media.json::INFORMATION AND MEDIA STUDIES — P12, P13, P14 :: ISM 202`

- Title: media production and management
- JAMB contexts: INFORMATION AND MEDIA SCIENCE, INFORMATION SCIENCE AND MEDIA STUDIES, Information and Media Studies
- Disposition: **`extraction_limitation_missing_local_text`**
- Official source: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf
- Rationale: The official source URL is known, but this source PDF has no local extracted-text corpus in the current workspace. Retrieve/extract it before distinguishing source omission from a code/title mismatch.

### `communication_media.json::INFORMATION AND MEDIA STUDIES — P12, P13, P14 :: ISM 203`

- Title: digital media and culture
- JAMB contexts: INFORMATION AND MEDIA SCIENCE, INFORMATION SCIENCE AND MEDIA STUDIES, Information and Media Studies
- Disposition: **`extraction_limitation_missing_local_text`**
- Official source: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf
- Rationale: The official source URL is known, but this source PDF has no local extracted-text corpus in the current workspace. Retrieve/extract it before distinguishing source omission from a code/title mismatch.

### `communication_media.json::INFORMATION AND MEDIA STUDIES — P12, P13, P14 :: ISM 204`

- Title: introduction to data management
- JAMB contexts: INFORMATION AND MEDIA SCIENCE, INFORMATION SCIENCE AND MEDIA STUDIES, Information and Media Studies
- Disposition: **`extraction_limitation_missing_local_text`**
- Official source: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf
- Rationale: The official source URL is known, but this source PDF has no local extracted-text corpus in the current workspace. Retrieve/extract it before distinguishing source omission from a code/title mismatch.

### `communication_media.json::INFORMATION AND MEDIA STUDIES — P12, P13, P14 :: ISM 205`

- Title: information literacy and research
- JAMB contexts: INFORMATION AND MEDIA SCIENCE, INFORMATION SCIENCE AND MEDIA STUDIES, Information and Media Studies
- Disposition: **`extraction_limitation_missing_local_text`**
- Official source: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf
- Rationale: The official source URL is known, but this source PDF has no local extracted-text corpus in the current workspace. Retrieve/extract it before distinguishing source omission from a code/title mismatch.

### `communication_media.json::INFORMATION AND MEDIA STUDIES — P12, P13, P14 :: ISM 206`

- Title: media economics
- JAMB contexts: INFORMATION AND MEDIA SCIENCE, INFORMATION SCIENCE AND MEDIA STUDIES, Information and Media Studies
- Disposition: **`extraction_limitation_missing_local_text`**
- Official source: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf
- Rationale: The official source URL is known, but this source PDF has no local extracted-text corpus in the current workspace. Retrieve/extract it before distinguishing source omission from a code/title mismatch.

### `communication_media.json::INFORMATION AND MEDIA STUDIES — P12, P13, P14 :: ISM 315`

- Title: media content analysis
- JAMB contexts: INFORMATION AND MEDIA SCIENCE, INFORMATION SCIENCE AND MEDIA STUDIES, Information and Media Studies
- Disposition: **`extraction_limitation_missing_local_text`**
- Official source: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf
- Rationale: The official source URL is known, but this source PDF has no local extracted-text corpus in the current workspace. Retrieve/extract it before distinguishing source omission from a code/title mismatch.

### `communication_media.json::INFORMATION AND MEDIA STUDIES — P12, P13, P14 :: ISM 316`

- Title: database management systems
- JAMB contexts: INFORMATION AND MEDIA SCIENCE, INFORMATION SCIENCE AND MEDIA STUDIES, Information and Media Studies
- Disposition: **`extraction_limitation_missing_local_text`**
- Official source: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf
- Rationale: The official source URL is known, but this source PDF has no local extracted-text corpus in the current workspace. Retrieve/extract it before distinguishing source omission from a code/title mismatch.

### `communication_media.json::INFORMATION AND MEDIA STUDIES — P12, P13, P14 :: ISM 415`

- Title: media law and policy
- JAMB contexts: INFORMATION AND MEDIA SCIENCE, INFORMATION SCIENCE AND MEDIA STUDIES, Information and Media Studies
- Disposition: **`extraction_limitation_missing_local_text`**
- Official source: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf
- Rationale: The official source URL is known, but this source PDF has no local extracted-text corpus in the current workspace. Retrieve/extract it before distinguishing source omission from a code/title mismatch.

### `environmental_sciences.json::Environmental Management :: EVM102`

- Title: introduction to natural environment
- JAMB contexts: Environmental Management and Technology
- Disposition: **`extraction_limitation_missing_local_text`**
- Official source: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Environmental-Sciences-CCMAS-2023-FINAL.pdf
- Rationale: The official source URL is known, but this source PDF has no local extracted-text corpus in the current workspace. Retrieve/extract it before distinguishing source omission from a code/title mismatch.

### `environmental_sciences.json::Environmental Management :: EVM302`

- Title: environmental protection
- JAMB contexts: Environmental Management and Technology
- Disposition: **`extraction_limitation_missing_local_text`**
- Official source: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Environmental-Sciences-CCMAS-2023-FINAL.pdf
- Rationale: The official source URL is known, but this source PDF has no local extracted-text corpus in the current workspace. Retrieve/extract it before distinguishing source omission from a code/title mismatch.

### `environmental_sciences.json::Environmental Management :: EVM304`

- Title: quantitative techniques in environmental management
- JAMB contexts: Environmental Management and Technology
- Disposition: **`extraction_limitation_missing_local_text`**
- Official source: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Environmental-Sciences-CCMAS-2023-FINAL.pdf
- Rationale: The official source URL is known, but this source PDF has no local extracted-text corpus in the current workspace. Retrieve/extract it before distinguishing source omission from a code/title mismatch.

### `environmental_sciences.json::Environmental Management :: EVM306`

- Title: population and environmental change
- JAMB contexts: Environmental Management and Technology
- Disposition: **`extraction_limitation_missing_local_text`**
- Official source: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Environmental-Sciences-CCMAS-2023-FINAL.pdf
- Rationale: The official source URL is known, but this source PDF has no local extracted-text corpus in the current workspace. Retrieve/extract it before distinguishing source omission from a code/title mismatch.

### `environmental_sciences.json::Environmental Management :: EVM308`

- Title: computer application in environmental management
- JAMB contexts: Environmental Management and Technology
- Disposition: **`extraction_limitation_missing_local_text`**
- Official source: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Environmental-Sciences-CCMAS-2023-FINAL.pdf
- Rationale: The official source URL is known, but this source PDF has no local extracted-text corpus in the current workspace. Retrieve/extract it before distinguishing source omission from a code/title mismatch.

### `environmental_sciences.json::Environmental Management :: EVM313`

- Title: landscaping and environmental design
- JAMB contexts: Environmental Management and Technology
- Disposition: **`extraction_limitation_missing_local_text`**
- Official source: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Environmental-Sciences-CCMAS-2023-FINAL.pdf
- Rationale: The official source URL is known, but this source PDF has no local extracted-text corpus in the current workspace. Retrieve/extract it before distinguishing source omission from a code/title mismatch.

### `environmental_sciences.json::Environmental Management :: EVM315`

- Title: energy and environment
- JAMB contexts: Environmental Management and Technology
- Disposition: **`extraction_limitation_missing_local_text`**
- Official source: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Environmental-Sciences-CCMAS-2023-FINAL.pdf
- Rationale: The official source URL is known, but this source PDF has no local extracted-text corpus in the current workspace. Retrieve/extract it before distinguishing source omission from a code/title mismatch.

### `environmental_sciences.json::Environmental Management :: EVM401`

- Title: research method i
- JAMB contexts: Environmental Management and Technology
- Disposition: **`extraction_limitation_missing_local_text`**
- Official source: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Environmental-Sciences-CCMAS-2023-FINAL.pdf
- Rationale: The official source URL is known, but this source PDF has no local extracted-text corpus in the current workspace. Retrieve/extract it before distinguishing source omission from a code/title mismatch.

### `environmental_sciences.json::Environmental Management :: EVM402`

- Title: waste management
- JAMB contexts: Environmental Management and Technology
- Disposition: **`extraction_limitation_missing_local_text`**
- Official source: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Environmental-Sciences-CCMAS-2023-FINAL.pdf
- Rationale: The official source URL is known, but this source PDF has no local extracted-text corpus in the current workspace. Retrieve/extract it before distinguishing source omission from a code/title mismatch.

### `environmental_sciences.json::Environmental Management :: EVM405`

- Title: environmental and planning law
- JAMB contexts: Environmental Management and Technology
- Disposition: **`extraction_limitation_missing_local_text`**
- Official source: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Environmental-Sciences-CCMAS-2023-FINAL.pdf
- Rationale: The official source URL is known, but this source PDF has no local extracted-text corpus in the current workspace. Retrieve/extract it before distinguishing source omission from a code/title mismatch.

### `environmental_sciences.json::Environmental Management :: EVM406`

- Title: resource use and conservation
- JAMB contexts: Environmental Management and Technology
- Disposition: **`extraction_limitation_missing_local_text`**
- Official source: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Environmental-Sciences-CCMAS-2023-FINAL.pdf
- Rationale: The official source URL is known, but this source PDF has no local extracted-text corpus in the current workspace. Retrieve/extract it before distinguishing source omission from a code/title mismatch.

### `environmental_sciences.json::Environmental Management :: EVM411`

- Title: project design and evaluation
- JAMB contexts: Environmental Management and Technology
- Disposition: **`extraction_limitation_missing_local_text`**
- Official source: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Environmental-Sciences-CCMAS-2023-FINAL.pdf
- Rationale: The official source URL is known, but this source PDF has no local extracted-text corpus in the current workspace. Retrieve/extract it before distinguishing source omission from a code/title mismatch.

### `environmental_sciences.json::Environmental Management :: EVM412`

- Title: environmental management systems
- JAMB contexts: Environmental Management and Technology
- Disposition: **`extraction_limitation_missing_local_text`**
- Official source: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Environmental-Sciences-CCMAS-2023-FINAL.pdf
- Rationale: The official source URL is known, but this source PDF has no local extracted-text corpus in the current workspace. Retrieve/extract it before distinguishing source omission from a code/title mismatch.

### `environmental_sciences.json::Environmental Management :: EVM414`

- Title: experimental pesticide chemistry and residue analysis
- JAMB contexts: Environmental Management and Technology
- Disposition: **`extraction_limitation_missing_local_text`**
- Official source: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Environmental-Sciences-CCMAS-2023-FINAL.pdf
- Rationale: The official source URL is known, but this source PDF has no local extracted-text corpus in the current workspace. Retrieve/extract it before distinguishing source omission from a code/title mismatch.

### `environmental_sciences.json::Environmental Management :: EVM507`

- Title: environmental management seminar
- JAMB contexts: Environmental Management and Technology
- Disposition: **`extraction_limitation_missing_local_text`**
- Official source: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Environmental-Sciences-CCMAS-2023-FINAL.pdf
- Rationale: The official source URL is known, but this source PDF has no local extracted-text corpus in the current workspace. Retrieve/extract it before distinguishing source omission from a code/title mismatch.

### `environmental_sciences.json::Environmental Management :: EVM508`

- Title: environmental impact assessment
- JAMB contexts: Environmental Management and Technology
- Disposition: **`extraction_limitation_missing_local_text`**
- Official source: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Environmental-Sciences-CCMAS-2023-FINAL.pdf
- Rationale: The official source URL is known, but this source PDF has no local extracted-text corpus in the current workspace. Retrieve/extract it before distinguishing source omission from a code/title mismatch.

### `environmental_sciences.json::Environmental Management :: EVM510`

- Title: environmental engineering services
- JAMB contexts: Environmental Management and Technology
- Disposition: **`extraction_limitation_missing_local_text`**
- Official source: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Environmental-Sciences-CCMAS-2023-FINAL.pdf
- Rationale: The official source URL is known, but this source PDF has no local extracted-text corpus in the current workspace. Retrieve/extract it before distinguishing source omission from a code/title mismatch.

### `environmental_sciences.json::Environmental Management :: EVM511`

- Title: environmental monitoring and audit
- JAMB contexts: Environmental Management and Technology
- Disposition: **`extraction_limitation_missing_local_text`**
- Official source: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Environmental-Sciences-CCMAS-2023-FINAL.pdf
- Rationale: The official source URL is known, but this source PDF has no local extracted-text corpus in the current workspace. Retrieve/extract it before distinguishing source omission from a code/title mismatch.

### `environmental_sciences.json::Environmental Management :: EVM515`

- Title: environmental biotechnology
- JAMB contexts: Environmental Management and Technology
- Disposition: **`extraction_limitation_missing_local_text`**
- Official source: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Environmental-Sciences-CCMAS-2023-FINAL.pdf
- Rationale: The official source URL is known, but this source PDF has no local extracted-text corpus in the current workspace. Retrieve/extract it before distinguishing source omission from a code/title mismatch.

### `environmental_sciences.json::Geography :: IDC407`

- Title: ceramics for building and environment
- JAMB contexts: Geography and Environmental Studies
- Disposition: **`extraction_limitation_missing_local_text`**
- Official source: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Environmental-Sciences-CCMAS-2023-FINAL.pdf
- Rationale: The official source URL is known, but this source PDF has no local extracted-text corpus in the current workspace. Retrieve/extract it before distinguishing source omission from a code/title mismatch.

### `law.json::Law :: ISLAMIC LAW OF TRANSACTIONS`

- Title: islamic law of transactions
- JAMB contexts: Civil Law
- Disposition: **`extraction_or_scope_mismatch_candidate`**
- Official source: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Law-ALL.pdf
- Rationale: The extracted source contains a normalized code/title candidate; inspect the exact programme table and continuation before changing the record.
- Candidate physical page 53 (exact_code_and_title_candidate, title ratio 1.0, window ratio 1.0):
  - line 27: `8. Conveyancing 8 9. Criminology 8 10. Introduction to Islamic Law 8`
  - line 28: `9. Criminology 8 10. Introduction to Islamic Law 8 11. Law of Banking 8`
- Candidate physical page 73 (exact_code_and_title_candidate, title ratio 1.0, window ratio 1.0):
  - line 26: `and agent. Termination of agency. Relationship of principal and agents to third parties. 301: Mu’amalat (Islamic Law of Transactions) (3 units C: LH 45)`
  - line 27: `301: Mu’amalat (Islamic Law of Transactions) (3 units C: LH 45)`

## Limits

- Physical-page ordinals are extraction positions, not printed-page citations.
- Candidate evidence still requires exact programme/table context adjudication.
- No canonical mapping or CCMAS source record was changed.

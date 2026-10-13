from repair_all_ccmas_empty_details_from_original_pdfs_2026_09_30 import (
    course_blocks,
    course_identity,
    exact_title_course_blocks,
    longest_source_consensus,
    matching_course_blocks,
    parse_block,
    parse_grouped_outcome_blocks,
    restrict_candidates_to_programme_range,
    title_identity,
    unique_candidate_by_source_neighbors,
    unique_candidate_between_programme_anchors,
    unique_ordered_candidate_assignments,
)


def test_page_break_continuation_is_kept_inside_gst_111_course_block():
    pages = [
        """GST 111: Communication in English (2 Units C: LH15; PH 45)
Learning Outcomes
1. identify possible sound patterns in English Language;
2. list notable language skills;
3. classify word-formation processes;
4. construct simple sentences;
5. apply critical reasoning;
6. demonstrate public speaking; and
7. write reports.
Course Contents
Sound patterns in English. Grammar and usage.
New
Computing 60
""",
        """Ethical considerations and copyright. Writing activities and proofreading.
Comprehension strategies, ICT in language learning, public speaking and report writing.

GST 112: Nigerian Peoples and Culture (2 Units C: LH 30)
Learning Outcomes
1. analyse Nigerian culture.
""",
    ]

    block = next(b for b in course_blocks(pages) if b["code"] == "GST 111")
    detail = parse_block(block)

    assert len(detail["learning_outcomes"]) == 7
    assert "Ethical considerations" in detail["content_summary"]
    assert "GST 112" not in detail["content_summary"]
    assert block["page_start"] == 1
    assert block["page_end"] == 2


def test_course_code_on_previous_page_and_ocr_misspelled_contents_heading_are_parsed():
    pages = [
        """ANS 304:
Non-Ruminant Animal Production (2 Units C: LH 30)
Learning Outcomes
At the end of this course students should be able to:
1. explain poultry, swine and rabbit production;
2. identify the attributes and problems of each species.
""",
        """Coursse Contents
Poultry production. Swine production. Rabbit production. Health management.
ANS 305: Ruminant Animal Production (2 Units C: LH 30)
""",
    ]

    block = next(b for b in course_blocks(pages) if b["code"] == "ANS 304")
    detail = parse_block(block)

    assert detail["learning_outcomes"] == [
        "explain poultry, swine and rabbit production",
        "identify the attributes and problems of each species.",
    ]
    assert detail["content_summary"].startswith("Poultry production.")
    assert "ANS 305" not in detail["content_summary"]


def test_cours_contents_ocr_variant_is_parsed_as_course_summary_boundary():
    pages = [
        """GST 111: Communication in English (2 Units C: LH 15; PH 45)
Learning Outcome
1. identify possible sound patterns in English;
2. write simple reports.
Cours Contents
Sound patterns, grammar, writing, comprehension and ICT in language learning.
GST 112: Nigerian Peoples and Culture (2 Units C: LH 30)
""",
    ]

    block = next(b for b in course_blocks(pages) if b["code"] == "GST 111")
    detail = parse_block(block)

    assert len(detail["learning_outcomes"]) == 2
    assert detail["content_summary"].startswith("Sound patterns")


def test_explicit_unheaded_practical_expectation_is_retained_as_one_source_outcome():
    pages = [
        """MLS 307: Practical Exercise I (2 Units C: LH 15; PH 45)
The student is expected to carry out practical exercises in all the disciplines:
Clinical Chemistry: titration, volumetric analysis and chloride determination.
Haematology: blood film, WBC count and haemoglobin estimation.
MLS 308: Laboratory Posting II (2 Units C: LH 15; PH 45)
""",
    ]

    block = next(b for b in course_blocks(pages) if b["code"] == "MLS 307")
    detail = parse_block(block)

    assert detail["learning_outcomes"] == [
        "The student is expected to carry out practical exercises in all the disciplines"
    ]
    assert "Clinical Chemistry" not in detail["learning_outcomes"][0]


def test_grouped_course_code_header_shares_only_its_explicit_outcomes():
    pages = [
        """POT 303, POT 305, POT 306
Learning Outcomes
At the end of the course, student should be able to:
1. compare and contrast strategies for clinical assessment;
2. describe appropriate investigative techniques;

POT 303: Lower Limb Orthotics I (1 Unit C: LH 15)
Course Contents
Bending orthotic materials and making holes in orthoses.
POT 304: Lower Limb Orthotics II (2 Units C: LH 30)
Course Contents
Transfer of patterns and fabrication of arch support.
"""
    ]

    grouped = parse_grouped_outcome_blocks(pages)

    assert grouped["pot303"][0]["learning_outcomes"] == [
        "compare and contrast strategies for clinical assessment",
        "describe appropriate investigative techniques",
    ]
    assert grouped["pot305"] == grouped["pot303"]
    assert "pot304" not in grouped
    assert grouped["pot303"][0]["page_start"] == 1


def test_programme_page_range_prefers_overlapping_source_block_without_guessing_when_empty():
    candidates = [
        {"page_start": 31, "page_end": 32},
        {"page_start": 322, "page_end": 323},
        {"page_start": 345, "page_end": 345},
    ]

    assert restrict_candidates_to_programme_range(candidates, (318, 339)) == [candidates[1]]
    assert restrict_candidates_to_programme_range(candidates, (400, 410)) == candidates
    assert restrict_candidates_to_programme_range(candidates, None) == candidates


def test_course_outcomes_can_be_completed_from_the_source_block():
    pages = [
        """ENT 312: Venture Creation (2 Units C: LH 15; PH 45)
Learning Outcomes
At the end of this course students should:
1. describe the key steps in venture creation;
2. spot opportunities in problems;
3. develop original products;
4. build a business concept;
5. identify entrepreneurial finance;
6. establish small enterprises;
7. conduct entrepreneurial marketing;
8. apply technology solutions; and
9. explain why ventures fail.
Course Contents
Opportunity identification, business planning, finance, marketing and venture management.

CSC 301: Data Structures (3 Units C: LH 30)
"""
    ]

    block = next(b for b in course_blocks(pages) if b["code"] == "ENT 312")
    detail = parse_block(block)

    assert len(detail["learning_outcomes"]) == 9
    assert detail["content_summary"].startswith("Opportunity identification")


def test_bare_code_header_without_colon_ends_previous_course_contents():
    pages = [
        """ENT 312: Venture Creation (2 Units C: LH 15)
Learning Outcomes
1. describe venture creation.
Course Contents
Planning, finance, and small-business management.

DTS 304 Data Management I (2 Units C: LH 15)
Learning Outcomes
1. describe database systems.
Course Contents
Database concepts and SQL.
"""
    ]

    block = next(b for b in course_blocks(pages) if b["code"] == "ENT 312")
    detail = parse_block(block)

    assert detail["content_summary"] == "Planning, finance, and small-business management."


def test_course_description_without_contents_heading_is_retained_as_summary():
    pages = [
        """CRD 307: Field Administration for Cooperatives (3 Units C: LH 45; PH 360)
This will entail a two months practical work experience during the long vacation preceding the final year of the program. Students should work with a cooperative group in a rural setting.
400 Level Courses
Course Code Course Title Units Status LH PH

CRD 308: Cooperative Management (2 Units C: LH 30)
"""
    ]

    block = next(b for b in course_blocks(pages) if b["code"] == "CRD 307")
    detail = parse_block(block)

    assert detail["content_summary"].startswith("This will entail a two months practical work experience")
    assert "400 Level" not in detail["content_summary"]
    assert "CRD 308" not in detail["content_summary"]


def test_ocr_singular_learning_outcome_can_continue_across_page_break():
    pages = [
        """RUS 331: African Literature in Translation (2 Units C: LH 30)
Learning Outcome
""",
        """After the course the students will know how to translate African Literature written in Russian.
Course Contents
General introduction to major authors and works in African Literature.

RUS 333: Introduction to Russian Prose (2 Units C: LH 30)
""",
    ]

    block = next(b for b in course_blocks(pages) if b["code"] == "RUS 331")
    detail = parse_block(block)

    assert detail["learning_outcomes"] == [
        "After the course the students will know how to translate African Literature written in Russian."
    ]


def test_repeated_source_outcomes_choose_longest_only_when_shorter_are_prefixes():
    full = ["identify the concept", "apply the concept", "evaluate the result"]
    prefix = ["identify the concept", "apply the concept"]
    candidates = [(prefix, {"page_start": 1}), (full, {"page_start": 2})]

    assert longest_source_consensus(candidates, "skills_learned")[0] == full
    conflicting = [(prefix, {}), (["identify another concept"], {})]
    assert longest_source_consensus(conflicting, "skills_learned") is None


def test_repeated_course_source_is_selected_only_when_exact_package_anchors_isolate_one_block():
    candidates = [
        {"source_order": 10, "page_start": 40},
        {"source_order": 20, "page_start": 66},
        {"source_order": 30, "page_start": 86},
    ]
    anchors = [(2, 19), (4, 21)]

    assert unique_candidate_between_programme_anchors(candidates, anchors, 3) == candidates[1]
    assert unique_candidate_between_programme_anchors(candidates, [(2, 19)], 3) is None
    assert unique_candidate_between_programme_anchors(candidates, [(2, 9)], 3) is None


def test_ordered_package_candidates_resolve_only_assignments_forced_by_sequence():
    first = [{"source_order": 10}, {"source_order": 20}]
    second = [{"source_order": 15}, {"source_order": 25}]
    last = [{"source_order": 22}]

    assert unique_ordered_candidate_assignments([first, second, last]) == [first[0], second[0], last[0]]
    assert unique_ordered_candidate_assignments([first, second]) == [None, None]


def test_repeated_source_candidate_requires_unique_exact_neighbor_match():
    candidates = [
        {"source_order": 10, "previous_code": "ICT 399", "previous_title": "Work Placement", "next_code": "CYB 301", "next_title": "Cryptography"},
        {"source_order": 20, "previous_code": "CSC 301", "previous_title": "Data Structures", "next_code": "COS 409", "next_title": "Research Methods"},
    ]
    previous = {"code": "CSC 301", "title": "Data Structures"}

    assert unique_candidate_by_source_neighbors(candidates, previous, None) == candidates[1]
    assert unique_candidate_by_source_neighbors(candidates, None, None) is None


def test_sos_303_outcomes_and_contents_continue_across_pages():
    pages = [
        """SOS 303: Introductory Pedology and Soil Physics (2 Units C: LH 30)
Learning Outcomes
Students will be able to:
1. decipher differences between soil and land;
2. determine how soils are formed and differentiated;
3. explain the soil system as a natural, disperse, and open system;
""",
        """4. describe peds, soil structure, and pore volume;
5. discuss soils as the bedrock of agriculture and food security;
6. characterize soils and manage problem soils for food production;
7. explain soil constituents and their relationship to crop growth;
8. explain soil mechanics and physical conditions for optimal production.
Course Contents
Soil, land and landscape. Soil formation, soil physics, soil water, and soil fertility.
""",
        """89
New
Agricultural Science
400 Level

AGE 404: Farm Records and Accounting (2 Units C: PH 90)
""",
    ]

    block = next(b for b in course_blocks(pages) if b["code"] == "SOS 303")
    detail = parse_block(block)

    assert len(detail["learning_outcomes"]) == 8
    assert detail["learning_outcomes"][3].startswith("describe peds")
    assert detail["content_summary"].startswith("Soil, land and landscape")
    assert "SOS 304" not in detail["content_summary"]
    assert block["page_start"] == 1
    assert block["page_end"] == 2


def test_exact_title_match_discards_nearby_fuzzy_same_code_candidate():
    exact = {"code": "SOS 303", "title": "Introductory Pedology and Soil Physics", "page_start": 87}
    fuzzy = {"code": "SOS 303", "title": "Introductory Pedology, Soil Physics and Management", "page_start": 250}

    assert matching_course_blocks(exact["title"], [fuzzy, exact]) == [exact]


def test_long_source_block_requires_exact_title_not_table_row_fuzzy_match():
    exact = {"title": "International Trade and Finance"}
    table_noise = {"title": "416 International Trade and Finance."}

    assert exact_title_course_blocks("International Trade and Finance", [table_noise, exact]) == [exact]


def test_course_contents_stop_before_following_facilities_sections():
    pages = [
        """ENT 312: Venture Creation (2 Units C: LH 15)
Course Contents
Opportunity identification, business planning, finance and small-business management.
Equipment
Computers, projectors, fire-proof cabinets and laboratory facilities.
B.Sc. Hospitality and Tourism Management Overview
This programme overview must not be copied into the course summary.
"""
    ]

    block = next(item for item in course_blocks(pages) if item["code"] == "ENT 312")
    detail = parse_block(block)

    assert detail["content_summary"] == "Opportunity identification, business planning, finance and small-business management."


def test_reused_course_code_with_different_titles_are_distinct_identities():
    assert course_identity("allied_health.json", "Pharmacology", {
        "code": "PHA 312", "title": "Introductory Pharmacology"
    }) != course_identity("allied_health.json", "Pharmacology", {
        "code": "PHA 312", "title": "Students' Industrial Work Experience"
    })


def test_course_title_identity_normalizes_punctuation_and_stop_word_variants():
    assert title_identity("Nigerian Peoples and Culture") == title_identity("Nigerian Peoples & Culture")


def test_slash_suffix_course_header_stops_previous_summary():
    pages = [
        """EHO 315: Advanced Clothing Design and Construction (2 Units C: LH 15; PH 45)
Learning Outcomes
1. experiment with diverse fabrics.
Course Contents
Experimentation with diverse fabrics. Advanced tailoring techniques.
""",
        """EHO 316/HSM: Pregnancy and Child Development (2 Units C: LH 30)
Learning Outcomes
1. list the signs of pregnancy.
Course Contents
Community nutrition and post-natal care.
""",
    ]

    eho315, eho316 = course_blocks(pages)
    detail = parse_block(eho315)

    assert eho316["code"] == "EHO 316"
    assert eho315["page_end"] == 1
    assert detail["content_summary"] == "Experimentation with diverse fabrics. Advanced tailoring techniques."
    assert "Community nutrition" not in detail["content_summary"]


def test_dotted_course_heading_stops_preceding_contents():
    pages = [
        """PHY 108: General Practical Physics II (1 Unit C: PH 45)
Learning Outcomes
1. conduct practical physics measurements.
Course Contents
Measurement errors, graphical analysis, and practical techniques.
GST 212. Philosophy, Logic And Human Existence (2 Units C: LH 30)
Learning Outcomes
1. understand basic philosophy.
Course Contents
Logic and philosophical reasoning.
""",
    ]

    physics, philosophy = course_blocks(pages)
    detail = parse_block(physics)

    assert philosophy["code"] == "GST 212"
    assert detail["content_summary"] == "Measurement errors, graphical analysis, and practical techniques."
    assert "Philosophy" not in detail["content_summary"]


def test_inline_compound_and_letter_suffix_headings_stop_summary():
    from repair_all_ccmas_empty_details_from_original_pdfs_2026_09_30 import parse_block

    compound = {
        "text": "Course Contents\nPhysics topics through conservation laws. PHY 207/208: General Practical Physics III & IV (2 Units C: PH 90) Learning Outcomes next.",
        "title": "General Physics VII",
        "page_start": 1,
        "page_end": 1,
    }
    letter_suffix = {
        "text": "Course Contents\nPhilosophy and character molding. ANA 202a: Gross Anatomy of Thorax and Abdomen (2 Units C: LH 30) Learning Outcomes next.",
        "title": "Philosophy, Logic and Human Existence",
        "page_start": 1,
        "page_end": 1,
    }

    assert parse_block(compound)["content_summary"] == "Physics topics through conservation laws"
    assert parse_block(letter_suffix)["content_summary"] == "Philosophy and character molding"

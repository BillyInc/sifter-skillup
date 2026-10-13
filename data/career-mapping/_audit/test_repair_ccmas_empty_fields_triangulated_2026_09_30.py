from repair_ccmas_empty_fields_triangulated_2026_09_30 import layout_segments


def test_outcomes_do_not_leak_from_the_next_course():
    page = """ITH 503: Individual Project I\nFinal year student project\n\nITH 504: Individual Project II\nFinal year student project\n\nITH 505: Data Mining and Data Warehousing\nLearning Outcomes\n1. describe data mining; and\n2. identify warehouse systems.\n\nCourse Contents\nData mining and warehousing.\n"""

    first = layout_segments(page, {"title": "Individual Project I"}, ["ITH 503"])
    second = layout_segments(page, {"title": "Individual Project II"}, ["ITH 504"])

    assert first == ("", "Final year student project")
    assert second == ("", "Final year student project")


def test_corrupted_outcome_block_is_not_promoted():
    page = """FAC 301: Research Methods in the Arts\nLearning Outcomes\n1. explain research methods;\n2. ẹv. tify the essential variables in re\n3. write a research report.\n\nMeaning and characteristics of research.\n"""

    result = layout_segments(page, {"title": "Research Methods in the Arts"}, ["FAC 301"])

    assert result == ("", "")


def test_course_contents_are_bounded_to_the_matching_course():
    page = """ENS 407: Field Work\nStudents gain field experience in environmental standards.\n\nENS 408: Environmental Standards Seminar\nStudents present a seminar on an environmental topic.\n\nENS 409: Sustainable Development\nLearning Outcomes\n1. explain sustainable development; and\n2. discuss environmental goals.\n\nCourse Contents\nSustainability, conservation and resettlement planning.\n"""

    field_work = layout_segments(page, {"title": "Field Work"}, ["ENS 407"])
    seminar = layout_segments(page, {"title": "Environmental Standards Seminar"}, ["ENS 408"])
    sustainable_dev = layout_segments(page, {"title": "Sustainable Development"}, ["ENS 409"])

    assert field_work == ("", "Students gain field experience in environmental standards.")
    assert seminar == ("", "Students present a seminar on an environmental topic.")
    assert sustainable_dev == (
        "1. explain sustainable development; and\n2. discuss environmental goals.",
        "Sustainability, conservation and resettlement planning.",
    )

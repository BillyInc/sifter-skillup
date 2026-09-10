"""The student API must preserve exact JAMB/source programme names."""

from routes import career_routes
from routes import student_pipeline_routes


def test_student_pipeline_does_not_shorten_source_name():
    assert student_pipeline_routes._student_programme_name("Library Science") == "Library Science"
    assert student_pipeline_routes._student_programme_name("Library and Information Science") == "Library and Information Science"
    assert student_pipeline_routes._student_programme_name("Nursing/Nursing Science") == "Nursing/Nursing Science"


def test_career_search_does_not_shorten_source_name():
    assert career_routes._student_programme_name("Library Science") == "Library Science"
    assert career_routes._student_programme_name("Library and Information Science") == "Library and Information Science"
    assert career_routes._student_programme_name("Nursing/Nursing Science") == "Nursing/Nursing Science"

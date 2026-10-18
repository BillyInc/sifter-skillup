from routes.career_routes import _student_guidance_resources

# Every row a student may see must be source_backed. That gate was added to
# _student_guidance_resources in 018cd6a8 and these fixtures predate it, so
# they carry dataState explicitly — without it every row is filtered and the
# assertions below pass vacuously against an empty list.
SOURCE_BACKED = "source_backed"


def test_student_resources_require_explicit_approved_ownership():
    rows = [
        {"url": "https://example.test/legacy", "ownershipScope": None, "reviewStatus": None,
         "dataState": SOURCE_BACKED},
        {"url": "https://example.test/review", "ownershipScope": "domain", "reviewStatus": "review_only",
         "dataState": SOURCE_BACKED},
        {"url": "https://example.test/audit", "ownershipScope": "audit_only", "reviewStatus": "approved_guidance_v1",
         "dataState": SOURCE_BACKED},
        {"url": "https://example.test/approved", "ownershipScope": "domain", "reviewStatus": "approved_guidance_v1",
         "dataState": SOURCE_BACKED},
    ]

    visible = _student_guidance_resources(rows, expected_scope="domain")

    assert [row["url"] for row in visible] == ["https://example.test/approved"]


def test_student_resources_reject_wrong_scope():
    rows = [
        {"url": "https://example.test/programme", "ownershipScope": "programme",
         "reviewStatus": "approved_guidance_v1", "dataState": SOURCE_BACKED},
        {"url": "https://example.test/domain", "ownershipScope": "domain",
         "reviewStatus": "approved_guidance_v1", "dataState": SOURCE_BACKED},
    ]

    visible = _student_guidance_resources(rows, expected_scope="domain")

    assert [row["url"] for row in visible] == ["https://example.test/domain"]


def test_student_resources_require_source_backed_data_state():
    """Pins the gate that broke the two tests above — it had no test of its own.

    An otherwise perfect row (owned, approved, right scope) must still be
    withheld when its data state is anything but source_backed. Without this,
    the gate could be removed and the suite would stay green.
    """
    rows = [
        {"url": "https://example.test/unverified", "ownershipScope": "domain",
         "reviewStatus": "approved_guidance_v1", "dataState": "bounded_local"},
        {"url": "https://example.test/absent", "ownershipScope": "domain",
         "reviewStatus": "approved_guidance_v1"},
        {"url": "https://example.test/backed", "ownershipScope": "domain",
         "reviewStatus": "approved_guidance_v1", "dataState": SOURCE_BACKED},
    ]

    visible = _student_guidance_resources(rows, expected_scope="domain")

    assert [row["url"] for row in visible] == ["https://example.test/backed"]

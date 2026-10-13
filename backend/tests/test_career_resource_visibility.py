from routes.career_routes import _student_guidance_resources


def test_student_resources_require_explicit_approved_ownership():
    rows = [
        {"url": "https://example.test/legacy", "ownershipScope": None, "reviewStatus": None},
        {"url": "https://example.test/review", "ownershipScope": "domain", "reviewStatus": "review_only"},
        {"url": "https://example.test/audit", "ownershipScope": "audit_only", "reviewStatus": "approved_guidance_v1"},
        {"url": "https://example.test/approved", "ownershipScope": "domain", "reviewStatus": "approved_guidance_v1"},
    ]

    visible = _student_guidance_resources(rows, expected_scope="domain")

    assert [row["url"] for row in visible] == ["https://example.test/approved"]


def test_student_resources_reject_wrong_scope():
    rows = [
        {"url": "https://example.test/programme", "ownershipScope": "programme", "reviewStatus": "approved_guidance_v1"},
        {"url": "https://example.test/domain", "ownershipScope": "domain", "reviewStatus": "approved_guidance_v1"},
    ]

    visible = _student_guidance_resources(rows, expected_scope="domain")

    assert [row["url"] for row in visible] == ["https://example.test/domain"]

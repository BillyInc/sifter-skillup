from routes import student_pipeline_routes as spr


class _Result:
    def __init__(self, data):
        self.data = data


class _Query:
    def __init__(self, data):
        self.data = list(data)

    def select(self, *args, **kwargs):
        return self

    def eq(self, *args, **kwargs):
        if len(args) >= 2:
            key, value = args[0], args[1]
            self.data = [row for row in self.data if row.get(key) == value]
        return self

    def order(self, *args, **kwargs):
        return self

    def execute(self):
        return _Result(self.data)


class _Service:
    def __init__(self, data):
        self.data = data

    def table(self, name):
        assert name == "jamb_programme_learning_resources"
        return _Query(self.data)


def test_jamb_resources_require_approved_available_identity_evidence():
    rows = [
        {
            "id": "approved",
            "jamb_programme_id": "jamb-1",
            "resource_type": "external_learning_reference",
            "target_name": "Approved resource",
            "provider": "Provider",
            "region": "global",
            "access_type": "free",
            "url": "https://example.test/approved",
            "source_url": "https://example.test/approved",
            "authority": "Provider",
            "resource_role": "external_learning_reference",
            "source_status": "confirmed",
            "source_locator": "item page",
            "accessed_on": "2026-09-23",
            "resource_classification": "available",
            "decision": "resource_available",
            "review_status": "approved_guidance_v1",
        },
        {
            "id": "review",
            "jamb_programme_id": "jamb-1",
            "resource_type": "external_learning_reference",
            "target_name": "Review resource",
            "resource_classification": "available",
            "decision": "resource_available",
            "review_status": "review_only",
        },
        {
            "id": "unavailable",
            "jamb_programme_id": "jamb-1",
            "resource_type": "external_learning_reference",
            "target_name": "Unavailable resource",
            "resource_classification": "genuinely_unavailable",
            "decision": "genuinely_unavailable",
            "review_status": "approved_guidance_v1",
        },
    ]

    visible = spr._jamb_programme_resources_for_student(_Service(rows), "jamb-1")

    assert [row["id"] for row in visible] == ["approved"]
    assert visible[0]["jambProgrammeId"] == "jamb-1"
    assert visible[0]["reviewStatus"] == "approved_guidance_v1"


def test_jamb_resource_layer_is_optional_until_its_migration_is_live():
    class _MissingTableService:
        def table(self, name):
            raise RuntimeError(f"missing table: {name}")

    assert spr._jamb_programme_resources_for_student(_MissingTableService(), "jamb-1") == []


def test_student_resource_merge_deduplicates_source_ids():
    merged = spr._merge_student_resources(
        [{"id": "same", "targetName": "CCMAS"}],
        [{"id": "same", "targetName": "JAMB"}, {"id": "new", "targetName": "Open"}],
    )

    assert [row["id"] for row in merged] == ["same", "new"]
    assert merged[0]["targetName"] == "CCMAS"

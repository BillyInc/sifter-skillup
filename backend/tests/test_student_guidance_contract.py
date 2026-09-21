from routes import student_pipeline_routes as spr


class _Result:
    def __init__(self, data):
        self.data = data


class _Query:
    def __init__(self, rows):
        self._rows = rows

    def select(self, *args, **kwargs):
        return self

    def eq(self, *args, **kwargs):
        return self

    def order(self, *args, **kwargs):
        return self

    def execute(self):
        return _Result(self._rows)


class _Service:
    def __init__(self, rows):
        self._rows = rows

    def table(self, name):
        assert name == "career_context_items"
        return _Query(self._rows)


def test_jamb_context_items_require_programme_ownership_and_explicit_source_state():
    rows = [
        {
            "name": "Approved programme item",
            "guidance_owner": "programme",
            "data_state": "source_backed",
        },
        {
            "name": "Role aggregate",
            "guidance_owner": "role_aggregated",
            "data_state": "source_backed",
        },
        {
            "name": "Review item",
            "guidance_owner": "programme",
            "data_state": "review_only",
        },
        {
            "name": "Unclassified legacy item",
            "guidance_owner": "programme",
        },
        {
            "name": "Wrong context item",
            "guidance_owner": "domain",
            "data_state": "source_backed",
        },
    ]

    visible = spr._programme_context_items_for_student(_Service(rows), "programme-1")

    assert [item["name"] for item in visible] == ["Approved programme item"]
    assert visible[0]["guidanceOwner"] == "programme"
    assert visible[0]["dataState"] == "source_backed"

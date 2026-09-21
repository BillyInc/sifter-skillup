from _sociology_preflight import REQUIRED_GATES, verify_sociology_contract


class _Result:
    count = 0


class _Query:
    def __init__(self, service, table):
        self.service = service
        self.table_name = table
        self.columns = ()

    def select(self, *columns, **kwargs):
        self.columns = columns
        self.service.select_calls.append((self.table_name, columns, kwargs))
        return self

    def limit(self, value):
        self.service.limit_calls.append((self.table_name, value))
        return self

    def execute(self):
        if self.table_name not in self.service.tables:
            raise RuntimeError(f"PGRST205 table {self.table_name} not found")
        if self.columns != ("*",):
            missing = [column for column in self.columns if column not in self.service.tables[self.table_name]]
            if missing:
                raise RuntimeError(f"column {missing[0]} does not exist")
        return _Result()


class _Service:
    def __init__(self, tables):
        self.tables = tables
        self.select_calls = []
        self.limit_calls = []

    def table(self, name):
        return _Query(self, name)


def _complete_tables():
    return {table: set(columns) for tables in REQUIRED_GATES.values() for table, columns in tables.items()}


def test_sociology_contract_preflight_reports_ready_without_writes():
    service = _Service(_complete_tables())

    report = verify_sociology_contract(service)

    assert report["readOnly"] is True
    assert report["overall"] == "ready"
    assert report["missingGates"] == []
    assert all(category["status"] == "ready" for category in report["categories"].values())
    assert len(service.limit_calls) == sum(
        len(columns) for tables in REQUIRED_GATES.values() for columns in tables.values()
    )


def test_sociology_contract_preflight_names_missing_table_and_column():
    tables = _complete_tables()
    tables["career_context_items"].remove("guidance_owner")
    del tables["career_item_relationships"]
    service = _Service(tables)

    report = verify_sociology_contract(service)

    assert report["overall"] == "blocked"
    assert "contextual_ownership.career_context_items.guidance_owner" in report["missingGates"]
    assert "relationships.career_item_relationships" in report["missingGates"]
    assert report["categories"]["contextual_ownership"]["tables"]["career_context_items"]["missingColumns"] == [
        "guidance_owner"
    ]
    assert report["categories"]["relationships"]["tables"]["career_item_relationships"]["missingColumns"] == list(
        REQUIRED_GATES["relationships"]["career_item_relationships"]
    )
    assert service.select_calls
    assert all(columns for _, columns, _ in service.select_calls)

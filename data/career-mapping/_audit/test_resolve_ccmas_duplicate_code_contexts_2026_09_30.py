import importlib.util
import json
from copy import deepcopy
from pathlib import Path


SCRIPT = Path(__file__).with_name("resolve_ccmas_duplicate_code_contexts_2026_09_30.py")
SPEC = importlib.util.spec_from_file_location("ccmas_context_resolution", SCRIPT)
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


def test_transfer_moves_only_the_source_owned_course_and_preserves_details():
    row = {
        "level": 300,
        "code": "X 301",
        "title": "Verified Course",
        "units": 2,
        "status": "C",
        "lh": 30,
        "ph": None,
        "content_summary": "original source content",
        "skills_learned": ["original source outcome"],
    }
    operation = {
        "file": "test.json",
        "from": "Wrong Owner",
        "to": "Right Owner",
        "code": "X 301",
        "title": "Verified Course",
        "units": 2,
        "row_hash": MODULE.row_preimage(row),
        "pdf_pages": [1],
        "locator": "source PDF p. 1",
    }
    document = {
        "programmes": [
            {"name": "Wrong Owner", "courses": [deepcopy(row)]},
            {"name": "Right Owner", "courses": []},
        ]
    }

    assert MODULE.resolve_transfer(operation, {"test.json": document}, {"test.json": ["X 301 Verified Course"]}) == "moved"
    source, target = document["programmes"]
    assert source["courses"] == []
    moved = target["courses"][0]
    assert {key: moved[key] for key in ("content_summary", "skills_learned", "units", "lh", "ph")} == {
        key: row[key] for key in ("content_summary", "skills_learned", "units", "lh", "ph")
    }
    assert moved["source_state"] == "source_reconciled_original_pdf"
    assert moved["source_locator"] == "source PDF p. 1"


def test_transfer_refuses_changed_course_preimage():
    row = {"code": "X 301", "title": "Verified Course", "units": 2, "content_summary": "changed"}
    operation = {
        "file": "test.json", "from": "Wrong Owner", "to": "Right Owner",
        "code": "X 301", "title": "Verified Course", "units": 2,
        "row_hash": "not-the-current-preimage", "pdf_pages": [1], "locator": "source PDF p. 1",
    }
    document = {"programmes": [
        {"name": "Wrong Owner", "courses": [row]},
        {"name": "Right Owner", "courses": []},
    ]}

    try:
        MODULE.resolve_transfer(operation, {"test.json": document}, {"test.json": ["X 301 Verified Course"]})
    except RuntimeError as error:
        assert "preimage guard failed" in str(error)
    else:
        raise AssertionError("A changed row must not be moved using a stale checkpoint")


def test_htm_option_contexts_are_distinct_and_source_authored_duplicates_preserved():
    specifications = [item for item in MODULE.CONTEXT_ANNOTATIONS if item["code"] == "HTM 403"]
    assert len(specifications) == 2
    assert {item["option"] for item in specifications} == {
        "Hospitality and Tourism Management standard course structure",
        "Tourism Management Option",
    }
    assert {item["title"] for item in specifications} == {
        "Tourism and Foodservice Management",
        "Foodservice and Tourism Management",
    }


def test_source_code_conflicts_are_documented_not_rekeyed_or_deleted():
    assert len(MODULE.SOURCE_CONFLICTS) == 2
    by_key = {item["key"]: item for item in MODULE.SOURCE_CONFLICTS}
    assert by_key["allied_health.json::Nursing Sciences::NSC 406::Mental Health Nursing II"]["disposition"] == "owner_resolved_code_conflict_preserved"
    assert by_key["arts.json::Modern European Languages (Russian)::RUS 361::Oral Expression and comprehension in Russian"]["disposition"] == "owner_resolved_table_detail_identity_conflict_preserved"
    assert all("preserved" in item["disposition"] for item in MODULE.SOURCE_CONFLICTS)


def test_all_transfer_preimages_match_latest_source_review_checkpoint():
    checkpoint = json.loads(MODULE.SOURCE_REVIEW.read_text(encoding="utf-8"))
    members = {}
    for group in checkpoint["duplicate_code_groups"]:
        for row in group["records"]:
            members[row["source_record_hash"]] = (group["source_file"], group["programme"], row)
    assert len(MODULE.TRANSFERS) == 20
    for operation in MODULE.TRANSFERS:
        filename, source_owner, row = members[operation["row_hash"]]
        assert filename == operation["file"]
        assert source_owner == operation["from"]
        assert row["title"] == operation["title"]
        assert row["units"] == operation["units"]


def test_all_decisions_are_bound_to_verified_original_pdf_pages():
    pages = MODULE.load_verified_pages()
    for operation in MODULE.TRANSFERS:
        MODULE.verify_source_row(operation, pages)
    for operation in MODULE.CONTEXT_ANNOTATIONS:
        MODULE.verify_source_row(operation, pages)


def test_remaining_groups_have_explicit_context_dispositions():
    assert len(MODULE.REMAINING_GROUP_DISPOSITIONS) == 5
    assert all("::" in key and disposition for key, disposition in MODULE.REMAINING_GROUP_DISPOSITIONS.items())

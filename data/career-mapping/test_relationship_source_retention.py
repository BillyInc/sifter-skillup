"""Focused tests for contextual relationship provenance and review backlog."""

from __future__ import annotations

import importlib.util
import sys
from pathlib import Path


HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
SPEC = importlib.util.spec_from_file_location(
    "contextual_relationship_builder",
    HERE / "_build_contextual_guidance_items.py",
)
assert SPEC and SPEC.loader
BUILDER = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(BUILDER)


def _item(
    *,
    item_type: str,
    item_key: str,
    name: str,
    prerequisites: list[str] | None = None,
    related_items: list[str] | None = None,
    source_id: str,
    locator: dict,
    limitation: str,
    source_url: str = "https://example.test/framework",
) -> dict:
    return {
        "context_level": "domain",
        "context_key": "D078",
        "domain_key": "D078",
        "item_type": item_type,
        "item_key": item_key,
        "name": name,
        "prerequisites": prerequisites or [],
        "related_items": related_items or [],
        "source_ids": [source_id],
        "source_references": [{
            "id": source_id,
            "title": f"Source {source_id}",
            "url": source_url,
            "region": "global",
            "evidenceType": "framework",
        }],
        "source_locators": [locator],
        "evidence_limitations": [limitation],
        "source_confidence": "high",
        "guidance_owner": "domain",
        "verified_at": "2026-09-19",
    }


def test_resolved_relationship_keeps_endpoint_provenance_and_serialized_locators():
    source = _item(
        item_type="skill",
        item_key="research-analysis",
        name="Research analysis",
        prerequisites=["Research design"],
        source_id="source-analysis",
        locator={"sourceId": "source-analysis", "page": "12"},
        limitation="The skill is not a universal employment requirement.",
    )
    target = _item(
        item_type="skill",
        item_key="research-design",
        name="Research design",
        source_id="source-design",
        locator={"sourceId": "source-design", "page": "8"},
        limitation="The source describes preparation, not demonstrated competence.",
    )

    edge = next(edge for edge in BUILDER.relationship_rows([source, target]) if edge["relationship_type"] == "builds_on")

    assert edge["relationship_status"] == "source_backed"
    assert edge["source_ids"] == ["source-analysis", "source-design"]
    assert edge["source_locators"] == [
        {"sourceId": "source-analysis", "page": "12"},
        {"sourceId": "source-design", "page": "8"},
    ]
    assert "The skill is not a universal employment requirement." in edge["evidence_limitations"]
    assert "The source describes preparation, not demonstrated competence." in edge["evidence_limitations"]
    assert edge["source_references"][0]["sourceIds"] == ["source-analysis", "source-design"]
    assert all(reference["sourceLocators"] == edge["source_locators"] for reference in edge["source_references"])

    sql = BUILDER.relationship_sql(edge)
    assert '"sourceLocators"' in sql
    assert '"sourceId":"source-design"' in sql


def test_unresolved_similar_name_becomes_explicit_non_student_backlog_row():
    source = _item(
        item_type="skill",
        item_key="quantitative-analysis",
        name="Quantitative analysis",
        prerequisites=["Research methods (qualitative)"],
        source_id="source-analysis",
        locator={"sourceId": "source-analysis", "section": "methods"},
        limitation="The source is a bounded domain context.",
    )
    near_match = _item(
        item_type="skill",
        item_key="research-methods",
        name="Research methods",
        source_id="source-methods",
        locator={"sourceId": "source-methods", "section": "methods"},
        limitation="The source does not establish a dependency.",
    )

    edge = next(edge for edge in BUILDER.relationship_rows([source, near_match]) if edge["to_name"] == "Research methods (qualitative)")

    assert edge["relationship_type"] == "not_established"
    assert edge["relationship_status"] == "not_established"
    assert edge["data_state"] == "not_established"
    assert edge["to_item_type"] is None
    assert edge["to_item_key"].startswith("unresolved-builds_on-")
    assert "did not resolve to an exact typed item" in " ".join(edge["evidence_limitations"])
    assert edge["source_ids"] == ["source-analysis"]
    assert edge["source_locators"] == [{"sourceId": "source-analysis", "section": "methods"}]

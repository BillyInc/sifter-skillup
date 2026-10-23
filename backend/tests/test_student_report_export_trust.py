"""Focused trust-boundary coverage for authenticated HTML/DOCX exports."""
from __future__ import annotations

import asyncio
import io
import xml.etree.ElementTree as ET
import zipfile

import pytest
from fastapi import HTTPException

from routes import student_pipeline_routes as student_routes


class Query:
    def __init__(self, rows):
        self.rows = list(rows)

    def select(self, *_args, **_kwargs):
        return self

    def eq(self, key, value):
        self.rows = [row for row in self.rows if row.get(key) == value]
        return self

    def in_(self, key, values):
        accepted = set(values)
        self.rows = [row for row in self.rows if row.get(key) in accepted]
        return self

    def is_(self, key, value):
        if value == "null":
            self.rows = [row for row in self.rows if row.get(key) is None]
        return self

    def order(self, *_args, **_kwargs):
        return self

    def limit(self, value):
        self.rows = self.rows[:value]
        return self

    def execute(self):
        return self

    @property
    def data(self):
        return self.rows


class Service:
    def __init__(self, tables):
        self.tables = tables

    def table(self, name):
        return Query(self.tables.get(name, []))


def _docx_text(response_body: bytes) -> tuple[str, str]:
    with zipfile.ZipFile(io.BytesIO(response_body)) as archive:
        document = archive.read("word/document.xml").decode("utf-8")
    root = ET.fromstring(document)
    return document, "".join(root.itertext())


def test_student_exports_use_own_saved_d078_route_and_authenticated_username(monkeypatch):
    own_snapshot = {
        "snapshotId": "own-snapshot",
        "dataVersion": "guided-experience-d078-v1",
        "d078RouteStackIds": ["d078-route-1"],
        "d078SelectionsByRoute": {
            "sociology-programme::D078": {
                "methodIds": ["domain-item:d078-interviews"],
                "combinationIds": [],
                "componentMethodIds": {},
                "areaId": "D078:social-research-evaluation",
                "roleId": "role:D078:18:statistician",
                "addedItemIds": [],
            },
        },
        "reportPathContext": {
            "programme": {
                "id": "sociology-programme",
                "name": "Sociology <script>alert(1)</script>",
            },
        },
    }
    other_snapshot = {
        "snapshotId": "other-student-snapshot",
        "dataVersion": "guided-experience-d078-v1",
        "d078RouteStackIds": ["d078-route-1"],
        "d078SelectionsByRoute": {
            "another-programme::D078": {
                "methodIds": ["domain-item:d078-spatial-social-analysis"],
                "combinationIds": [],
                "componentMethodIds": {},
                "areaId": "D078:computational-digital-social-science",
                "addedItemIds": [],
            },
        },
        "reportPathContext": {"programme": {"id": "another-programme", "name": "Other learner's route"}},
    }
    service = Service({
        # Put another student's record first so a missing owner filter fails.
        "guidance_report_paths": [
            {"student_id": "student-B", "path": {"learningPlanSnapshots": [other_snapshot]}},
            {"student_id": "student-A", "path": {
                "studentName": "Forged saved-path identity",
                    # Explicit student-profile/report attachment; independent
                    # of the programme and D078's university-free route.
                    "attachedInstitution": {
                        "institutionType": "university",
                        "institutionTypeLabel": "University",
                        "name": "Registered University",
                    },
                "learningPlanSnapshots": [own_snapshot],
            }},
        ],
        "claim_codes": [],
        "student_starting_points": [],
        "student_subject_choices": [],
        "student_affiliations": [],
        "schools": [],
        "domains": [],
    })
    stored_username = 'ada"\r\nInjected: yes<script>alert(1)</script>\x00'
    monkeypatch.setattr(student_routes, "_svc", lambda: service)
    monkeypatch.setattr(student_routes, "_users", lambda: Query([
        {"id": "student-A", "username": stored_username},
        {"id": "student-B", "username": "other-student"},
    ]))
    monkeypatch.setattr(student_routes, "_require_career_report_exports_enabled", lambda: None)

    # The endpoint accepts an archive selector, not identity or route fields.
    # A conflicting value in the auth dependency and saved path cannot replace
    # the authenticated user's username or route.
    current_user = {"id": "student-A", "username": "untrusted-request-username"}
    html_response = asyncio.run(student_routes.get_my_guidance_report_html(
        snapshot_id="own-snapshot", current_user=current_user,
    ))
    docx_response = asyncio.run(student_routes.get_my_guidance_report_docx(
        snapshot_id="own-snapshot", current_user=current_user,
    ))
    html = html_response.body.decode("utf-8")
    docx_xml, docx_text = _docx_text(docx_response.body)

    assert "Username:" in html
    assert "Username:" in docx_text
    assert "ada&quot;" in html
    assert "&lt;script&gt;alert(1)&lt;/script&gt;" in html
    assert "<script>alert(1)</script>" not in html
    assert "Sociology &lt;script&gt;alert(1)&lt;/script&gt;" in html
    assert "Forged saved-path identity" not in html
    assert "untrusted-request-username" not in html
    assert "Interviews" in html
    assert "Social Research and Evaluation" in html
    assert "Statistician" in html
    assert "Attached institution" in html
    assert "University: Registered University" in html
    assert "Spatial analysis and mapping with suitable social data" not in html
    assert "Current guidance path: Sociology" in html
    assert "University-specific admission requirements are not included" in html

    # XML parsing proves user text is escaped as text, not injected markup.
    assert "<script>alert(1)</script>" not in docx_xml
    assert "ada\"" in docx_text
    assert "Sociology <script>alert(1)</script>" in docx_text
    assert "Forged saved-path identity" not in docx_text
    assert "untrusted-request-username" not in docx_text
    assert "Interviews" in docx_text
    assert "Social Research and Evaluation" in docx_text
    assert "Statistician" in docx_text
    assert "Attached institution" in docx_text
    assert "University: Registered University" in docx_text
    assert "Spatial analysis and mapping with suitable social data" not in docx_text
    assert "Programme: Sociology" in docx_text
    assert "University-specific admission requirements are not included" in docx_text
    assert "\r" not in docx_response.headers["content-disposition"]
    assert "\n" not in docx_response.headers["content-disposition"]

    with pytest.raises(HTTPException) as missing_foreign_snapshot:
        student_routes._current_guidance_report_context(current_user, "other-student-snapshot")
    assert missing_foreign_snapshot.value.status_code == 404


def test_docx_text_encoder_removes_xml_forbidden_control_characters():
    from services.report_gen import _xml

    encoded = _xml("A\x00B\x01C\tD")
    assert encoded == "ABC\tD"
    ET.fromstring(f"<root>{encoded}</root>")

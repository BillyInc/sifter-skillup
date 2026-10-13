"""Complete scope-level provenance for the external Anthropology component.

The repair only promotes URLs already present on selected course rows into the
scope evidence ledger.  It does not invent curriculum outcomes, approve the
scope, or alter downstream links.
"""

from __future__ import annotations

import copy
import json
from datetime import date
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
SCOPES = AUDIT / "jamb_curriculum_scopes_2026-08-17.json"
REPORT = AUDIT / "sociology_anthropology_scope_provenance_repair_2026-09-29.json"


def authority_for(url: str) -> str:
    host = urlparse(url).netloc.lower()
    if "unizik.edu.ng" in host:
        return "Nnamdi Azikiwe University, Department of Sociology and Anthropology"
    if "unn.edu.ng" in host:
        return "University of Nigeria, Nsukka, Department of Sociology and Anthropology"
    return host


def main() -> None:
    payload = json.loads(SCOPES.read_text(encoding="utf-8"))
    row = next(item for item in payload["rows"] if item.get("jamb_name") == "Sociology and Anthroplogy")
    before = copy.deepcopy(row.get("scope_evidence", []))

    evidence_by_key = {(item.get("source_kind"), item.get("source_url")): item for item in before}
    external_courses = [
        course
        for course in row.get("selected_courses", [])
        if course.get("source_kind") == "external_curriculum" and course.get("source_url")
    ]
    for course in external_courses:
        key = ("external_curriculum", course["source_url"])
        item = evidence_by_key.setdefault(
            key,
            {
                "source_kind": "external_curriculum",
                "source_url": course["source_url"],
                "source_locator": course.get("source_locator"),
                "source_accessed_on": course.get("source_accessed_on"),
                "supports": "external Anthropology course identity and published course content",
            },
        )
        item["authority"] = authority_for(course["source_url"])
        item["source_locator"] = item.get("source_locator") or course.get("source_locator")
        item["source_accessed_on"] = item.get("source_accessed_on") or course.get("source_accessed_on")

    for item in evidence_by_key.values():
        if item.get("source_kind") == "ccmas_related":
            item["authority"] = "National Universities Commission"
        elif item.get("source_kind") == "external_curriculum":
            item["authority"] = item.get("authority") or authority_for(item.get("source_url", ""))

    row["scope_evidence"] = list(evidence_by_key.values())
    row["scope_reason"] = (
        (row.get("scope_reason") or "").rstrip()
        + " Scope-level authority metadata now mirrors the existing selected-course external URLs;"
        " external outcomes and offering-specific evidence remain pending."
    )
    report = {
        "schema": "2026-09-29.sociology-anthropology-scope-provenance-repair.v1",
        "generated_on": date.today().isoformat(),
        "jamb_name": row["jamb_name"],
        "mode": "apply",
        "before_evidence_count": len(before),
        "after_evidence_count": len(row["scope_evidence"]),
        "external_course_rows_used": len(external_courses),
        "scope_status_unchanged": row.get("scope_status"),
        "domain_links_changed": False,
        "evidence": row["scope_evidence"],
    }
    SCOPES.write_text(json.dumps(payload, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({k: report[k] for k in ("before_evidence_count", "after_evidence_count", "external_course_rows_used", "scope_status_unchanged")}, indent=2))


if __name__ == "__main__":
    main()

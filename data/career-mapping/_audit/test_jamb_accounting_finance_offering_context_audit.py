"""Protect the two distinct JAMB Accounting and Finance source occurrences."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
JAMB = ROOT / "jamb"
AUDIT = ROOT / "_audit" / "jamb_accounting_finance_offering_context_audit_2026-09-28_001.md"


def test_accounting_and_finance_occurrences_remain_distinct_and_locator_is_corrected() -> None:
    administration = json.loads((JAMB / "administration_offerings.json").read_text(encoding="utf-8"))
    social = json.loads((JAMB / "social_management_offerings.json").read_text(encoding="utf-8"))
    admin_rows = [row for row in administration["programmes"] if row.get("jamb_name") == "Accounting and Finance"]
    social_rows = [row for row in social["programmes"] if row.get("jamb_name") == "Accounting and Finance"]
    assert len(admin_rows) == len(social_rows) == 1
    assert admin_rows[0]["institutions"] == ["BCU"]
    assert social_rows[0]["institutions"] == ["FEDOTUOKE"]
    assert administration["faculty"] == "Administration"
    assert social["faculty"] == "Social/Management Sciences"
    assert "printed p. 48" in admin_rows[0]["source_verification"]["pdf_table_locator"]
    assert "printed p. 576" in social_rows[0]["source_verification"]["pdf_table_locator"]
    assert social_rows[0]["source_verification"]["verification_date"] == "2026-09-28"
    assert "printed p. 577" not in social_rows[0]["note"]
    audit_text = AUDIT.read_text(encoding="utf-8")
    assert "Administration" in audit_text and "BCU" in audit_text
    assert "Social Sciences" in audit_text and "FEDOTUOKE" in audit_text
    assert "printed p. 576" in audit_text

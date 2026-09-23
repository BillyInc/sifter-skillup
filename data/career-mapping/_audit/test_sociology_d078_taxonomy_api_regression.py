"""Focused D078 regression audit for taxonomy ownership and API boundaries.

This is intentionally local and source-only.  It does not apply SQL, fetch
URLs, or inspect the browser.  The audit protects the Sociology contract while
the generated seed and live database remain deferred.
"""

from __future__ import annotations

import importlib.util
import json
import sys
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
DATA = ROOT / "data" / "career-mapping"


def load_json(name: str):
    return json.loads((DATA / name).read_text(encoding="utf-8"))


def load_career_routes():
    backend = ROOT / "backend"
    if str(backend) not in sys.path:
        sys.path.insert(0, str(backend))
    spec = importlib.util.spec_from_file_location(
        "career_routes_d078_regression", backend / "routes" / "career_routes.py"
    )
    if spec is None or spec.loader is None:
        raise RuntimeError("Unable to load career_routes.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class SociologyD078TaxonomyApiRegression(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.tools = load_json("domain_tools.json")["D078"]
        cls.layers = load_json("emerging_group_layers.json")
        cls.skill_provenance = load_json("domain_skill_provenance.json")["D078"]
        cls.routes = load_career_routes()

    def test_subgroup_tool_overlay_is_not_a_role_copy(self) -> None:
        subgroup_rows = [
            row
            for subgroup in self.layers["subgroups"]
            if subgroup.get("domain_id") == "D078"
            for row in subgroup.get("tools") or []
        ]
        self.assertEqual(subgroup_rows, [])
        for subgroup in self.layers["subgroups"]:
            if subgroup.get("domain_id") == "D078":
                self.assertEqual(
                    subgroup.get("tool_ownership"), "review_only_role_aggregate"
                )

    def test_legacy_tools_and_duplicate_inheritance_are_audit_only(self) -> None:
        domain_rows = [
            row
            for group in ("distinctive_tools", "common_tools")
            for row in self.tools.get(group, [])
        ]
        domain_names = {row["tool"].casefold() for row in domain_rows}
        self.assertTrue(
            any(row["tool"] == "Microsoft Office software" for row in domain_rows)
        )
        for row in domain_rows:
            provenance = row.get("provenance") or {}
            self.assertEqual(provenance.get("ownership"), "role_aggregated")
            self.assertEqual(provenance.get("student_visibility"), "review_only")
            self.assertEqual(
                provenance.get("guidance_layer"), "legacy_role_software_inventory_v1"
            )

        for subgroup in (self.tools.get("subgroup_tools") or {}).values():
            for group in ("distinctive", "common"):
                for row in subgroup.get(group, []):
                    if row["tool"].casefold() in domain_names:
                        provenance = row.get("provenance") or {}
                        self.assertTrue(provenance.get("inherited_from_domain_scope"))
                        self.assertEqual(provenance.get("student_visibility"), "review_only")

    def test_role_skill_ownership_is_explicit(self) -> None:
        for layer in [self.skill_provenance["foundation_skills"]] + [
            subgroup["skills"]
            for subgroup in self.skill_provenance["subgroups"].values()
        ]:
            self.assertTrue(layer)
            for metadata in layer.values():
                self.assertIn(metadata.get("ownership"), {"domain", "subgroup", "role_aggregated"})
                self.assertIn(metadata.get("student_visibility"), {"approved", "review_only"})
                if metadata.get("ownership") == "role_aggregated":
                    self.assertEqual(metadata.get("student_visibility"), "review_only")

    def test_api_rejects_legacy_scope_and_accepts_only_explicit_overlay(self) -> None:
        routes = self.routes
        legacy = {
            "tool_name": "Microsoft Office software",
            "guidance_owner": "domain",
            "data_state": "source_backed",
            "source_provenance": {
                "ownership": "role_aggregated",
                "guidance_layer": "legacy_role_software_inventory_v1",
            },
        }
        self.assertFalse(routes._student_visible_tool_row(legacy, domain_key="D078", scope="domain"))
        self.assertFalse(
            routes._student_visible_tool_row(
                {**legacy, "guidance_owner": "subgroup"},
                domain_key="D078",
                scope="subgroup",
            )
        )
        approved = {
            "tool_name": "Python",
            "guidance_owner": "domain",
            "data_state": "source_backed",
            "source_provenance": {
                "ownership": "domain_owned_optional",
                "guidance_layer": "social_sciences_domain_tool_path_v1",
            },
        }
        self.assertTrue(routes._student_visible_tool_row(approved, domain_key="D078", scope="domain"))
        self.assertEqual(
            routes._student_layer_skills(
                ["Statistics", "Critical thinking"],
                {
                    "statistics": {
                        "label": "Statistics",
                        "ownership": "domain",
                        "student_visibility": "approved",
                    },
                    "critical thinking": {
                        "label": "Critical thinking",
                        "ownership": "role_aggregated",
                        "student_visibility": "review_only",
                    },
                },
                domain_key="D078",
                scope="domain",
            ),
            ["Statistics"],
        )

    def test_student_payload_filters_legacy_occupation_sources(self) -> None:
        routes = self.routes
        links = routes._student_source_links(
            [
                {"title": "legacy", "url": "https://www.onetonline.org/link/summary/1"},
                {"title": "approved", "url": "https://example.org/guide"},
            ]
        )
        self.assertEqual([item["title"] for item in links], ["approved"])
        provenance = routes._student_source_provenance(
            {
                "onet_occupation_codes": ["11-1011.00"],
                "source_links": [{"url": "https://www.onetonline.org/link/summary/1"}],
                "review": "source-backed",
            }
        )
        self.assertNotIn("onet_occupation_codes", provenance)
        self.assertNotIn("source_links", provenance)
        self.assertEqual(provenance.get("review"), "source-backed")


if __name__ == "__main__":
    unittest.main()

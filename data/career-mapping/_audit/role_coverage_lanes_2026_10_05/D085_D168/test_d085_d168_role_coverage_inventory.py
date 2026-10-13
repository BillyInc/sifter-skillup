import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[5]
OUT = Path(__file__).resolve().parent
STRUCTURE = ROOT / "data/career-mapping/domain_structure.json"
QUEUE = ROOT / "data/career-mapping/_audit/role_fit_lanes_2026_10_05/D085_D168/D085_D168_role_fit_queue_2026_10_05.json"
LIBRARY = ROOT / "data/career-mapping/role_library_v3.json"


class RoleCoverageInventoryTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.register = json.loads((OUT / "role_coverage_candidate_register.json").read_text(encoding="utf-8"))
        cls.structure = json.loads(STRUCTURE.read_text(encoding="utf-8"))
        cls.queue = json.loads(QUEUE.read_text(encoding="utf-8"))["unresolved_rows"]
        cls.library = json.loads(LIBRARY.read_text(encoding="utf-8"))
        cls.by_domain = {row["domain_id"]: row for row in cls.register["domains"]}
        cls.queue_by_domain = {}
        for row in cls.queue:
            cls.queue_by_domain.setdefault(row["domain_id"], set()).add(row["role_key"])

    def test_register_is_exact_incremental_range_without_canonical_edits(self):
        self.assertEqual([f"D{i:03}" for i in range(85, 169)], [d["domain_id"] for d in self.register["domains"]])
        self.assertFalse(self.register["scope"]["canonical_edits"])
        self.assertEqual(1713, self.register["count_method"]["canonical_active_role_links"])

    def test_each_current_active_count_matches_structure_and_fit_queue(self):
        for did, row in self.by_domain.items():
            self.assertEqual(self.structure[did]["role_count"], row["active_role_count"], did)
            if did != "D119":
                self.assertEqual(row["active_role_count"], len(self.queue_by_domain.get(did, set())), did)

    def test_inactive_library_candidates_are_not_active_domain_links(self):
        active_titles = {(r["domain_id"], r["role_name"]) for r in self.queue}
        for did, title in (
            ("D092", "chef"), ("D092", "pastry cook"),
            ("D093", "electrical engineering technician"),
            ("D095", "motor vehicle body repairer"),
            ("D096", "crop farmer"), ("D096", "mixed crop and livestock farmer"),
            ("D096", "agronomist"), ("D096", "farmworker / agricultural labourer"),
            ("D098", "machinist / CNC machinist"),
            ("D100", "pipefitter / steamfitter"),
            ("D108", "printing engineer"), ("D108", "print production manager"),
            ("D109", "foundry moulder"), ("D109", "metallurgical technician"),
            ("D110", "chemical engineering technician"),
            ("D111", "tailor"), ("D111", "clothing/textile industrial engineer"),
            ("D114", "packaging and filling machine operator"),
            ("D114", "labelling machine operator"), ("D114", "cartoning machine operator"),
            ("D131", "race engineer"),
        ):
            self.assertTrue(any(r["domain_id"] == did and r["role_name"] == title for r in self.library))
            self.assertNotIn((did, title), active_titles)

    def test_candidate_sources_resolve_and_are_not_student_or_taxonomy_assignments(self):
        sources = self.register["sources"]
        for did in ("D092", "D093", "D095", "D096", "D098"):
            for candidate in self.by_domain[did]["candidates"]:
                self.assertTrue(candidate["source_refs"], candidate["candidate_key"])
                self.assertTrue(all(ref in sources for ref in candidate["source_refs"]))
                self.assertIn("existing_role_library_record_inactive", candidate["recommendation_status"])
        self.assertIn("no such links inferred", self.register["scope"]["subgroup_or_specialization_assignment"])

    def test_all_domains_in_current_batch_have_dispositions(self):
        for did in (f"D{i:03}" for i in range(110, 120)):
            self.assertTrue(self.by_domain[did]["coverage_disposition"])
            self.assertEqual("completed", self.by_domain[did]["coverage_batch_status"])
        for did in (f"D{i:03}" for i in range(120, 125)):
            self.assertTrue(self.by_domain[did]["coverage_disposition"])
            self.assertEqual("completed", self.by_domain[did]["coverage_batch_status"])
        for did in (f"D{i:03}" for i in range(125, 130)):
            self.assertTrue(self.by_domain[did]["coverage_disposition"])
            self.assertEqual("completed", self.by_domain[did]["coverage_batch_status"])
        for did in (f"D{i:03}" for i in range(130, 135)):
            self.assertTrue(self.by_domain[did]["coverage_disposition"])
            self.assertEqual("completed", self.by_domain[did]["coverage_batch_status"])
        for did in (f"D{i:03}" for i in range(135, 140)):
            self.assertTrue(self.by_domain[did]["coverage_disposition"])
            self.assertEqual("completed", self.by_domain[did]["coverage_batch_status"])
        for did in (f"D{i:03}" for i in range(140, 145)):
            self.assertTrue(self.by_domain[did]["coverage_disposition"])
            self.assertEqual("completed", self.by_domain[did]["coverage_batch_status"])
        for did in (f"D{i:03}" for i in range(145, 150)):
            self.assertTrue(self.by_domain[did]["coverage_disposition"])
            self.assertEqual("completed", self.by_domain[did]["coverage_batch_status"])
        for did in (f"D{i:03}" for i in range(150, 155)):
            self.assertTrue(self.by_domain[did]["coverage_disposition"])
            self.assertEqual("completed", self.by_domain[did]["coverage_batch_status"])
        for did in (f"D{i:03}" for i in range(155, 160)):
            self.assertTrue(self.by_domain[did]["coverage_disposition"])
            self.assertEqual("completed", self.by_domain[did]["coverage_batch_status"])
        for did in (f"D{i:03}" for i in range(160, 165)):
            self.assertTrue(self.by_domain[did]["coverage_disposition"])
            self.assertEqual("completed", self.by_domain[did]["coverage_batch_status"])
        for did in (f"D{i:03}" for i in range(165, 169)):
            self.assertTrue(self.by_domain[did]["coverage_disposition"])
            self.assertEqual("completed", self.by_domain[did]["coverage_batch_status"])
        for did in (f"D{i:03}" for i in range(90, 169)):
            self.assertTrue(self.by_domain[did]["source_refs"], did)
            self.assertTrue(all(ref in self.register["sources"] for ref in self.by_domain[did]["source_refs"]))

    def test_d155_d159_candidate_boundaries_and_zero_role_domain(self):
        d155 = self.by_domain["D155"]
        self.assertEqual(16, d155["active_role_count"])
        self.assertIn("ISO_TC229_NANOTECHNOLOGY_SCOPE", d155["source_refs"])
        self.assertIn("existing_inactive_library_records", d155["candidates"][0]["recommendation_status"])
        d156 = self.by_domain["D156"]
        self.assertEqual(11, d156["active_role_count"])
        self.assertEqual({"D156|geodesist_inactive", "D156|photogrammetrist_inactive"}, {c["candidate_key"] for c in d156["candidates"]})
        d157 = self.by_domain["D157"]
        self.assertEqual(0, d157["active_role_count"])
        self.assertEqual(2, len(d157["candidates"]))
        self.assertIn("no active role path", d157["coverage_disposition"])
        d158 = self.by_domain["D158"]
        self.assertEqual(20, d158["active_role_count"])
        self.assertEqual({"D158|investment_banker_inactive", "D158|corporate_treasurer_inactive"}, {c["candidate_key"] for c in d158["candidates"]})
        d159 = self.by_domain["D159"]
        self.assertEqual(27, d159["active_role_count"])
        self.assertEqual("D159|structured_finance_analyst_inactive", d159["candidates"][0]["candidate_key"])
        self.assertFalse(self.register["scope"]["canonical_edits"])

    def test_d160_d164_source_bounded_dispositions(self):
        d160 = self.by_domain["D160"]
        self.assertEqual(12, d160["active_role_count"])
        self.assertEqual("D160|fashion_stylist_and_personal_shopper_inactive", d160["candidates"][0]["candidate_key"])
        d161 = self.by_domain["D161"]
        self.assertEqual(18, d161["active_role_count"])
        self.assertEqual(2, len(d161["candidates"]))
        self.assertTrue(all("no canonical addition" in c["recommendation_status"] for c in d161["candidates"]))
        d162 = self.by_domain["D162"]
        self.assertEqual(8, d162["active_role_count"])
        self.assertIn("UNHCR_PROTECTION_AND_RSD_FUNCTIONS", d162["source_refs"])
        d163 = self.by_domain["D163"]
        self.assertEqual(6, d163["active_role_count"])
        self.assertIn("title, qualification and legal powers vary", d163["coverage_disposition"])
        d164 = self.by_domain["D164"]
        self.assertEqual(20, d164["active_role_count"])
        self.assertEqual([], d164["candidates"])

    def test_d165_d168_final_batch_is_complete_and_noncanonical(self):
        d165 = self.by_domain["D165"]
        self.assertEqual(15, d165["active_role_count"])
        self.assertIn("NBHWC_HEALTH_WELLNESS_COACH_COMPETENCIES", d165["source_refs"])
        self.assertIn("no canonical addition", d165["candidates"][0]["recommendation_status"])
        d166 = self.by_domain["D166"]
        self.assertEqual(14, d166["active_role_count"])
        self.assertIn("WAYMO_PERCEPTION_ENGINEERING_ROLE_PROFILE", d166["source_refs"])
        self.assertIn("emerging_task_family_candidate", d166["candidates"][0]["recommendation_status"])
        d167 = self.by_domain["D167"]
        self.assertEqual(13, d167["active_role_count"])
        self.assertIn("GOOGLE_XR_INTERACTION_DESIGNER_ROLE", d167["source_refs"])
        d168 = self.by_domain["D168"]
        self.assertEqual(15, d168["active_role_count"])
        self.assertEqual([], d168["candidates"])
        self.assertFalse(self.register["scope"]["canonical_edits"])

    def test_d150_d154_coverage_uses_exact_parent_scope_and_keeps_candidates_bounded(self):
        d150 = self.by_domain["D150"]
        self.assertEqual(9, d150["active_role_count"])
        self.assertEqual([], d150["candidates"])
        d151 = self.by_domain["D151"]
        self.assertEqual({"D151|criminal_prosecutor_family", "D151|criminal_judge_magistrate_family"}, {c["candidate_key"] for c in d151["candidates"]})
        self.assertTrue(all("no canonical addition" in c["recommendation_status"] for c in d151["candidates"]))
        d152 = self.by_domain["D152"]
        self.assertEqual(3, len(d152["candidates"]))
        self.assertIn("D152|archaeologist_and_site_manager_family", {c["candidate_key"] for c in d152["candidates"]})
        d153 = self.by_domain["D153"]
        self.assertEqual(0, d153["active_role_count"])
        self.assertEqual(3, len(d153["candidates"]))
        self.assertIn("zero active role links", d153["coverage_disposition"])
        d154 = self.by_domain["D154"]
        self.assertEqual(17, d154["active_role_count"])
        self.assertEqual(2, len(d154["candidates"]))
        self.assertTrue(all("no canonical addition" in c["recommendation_status"] for c in d154["candidates"]))

    def test_packaging_overlap_is_flagged_without_canonical_reassignment(self):
        d113 = self.by_domain["D113"]
        d114 = self.by_domain["D114"]
        self.assertIn("cross-domain ownership conflict", d113["coverage_disposition"])
        self.assertIn("overlap", d114["candidates"][0]["recommendation_status"])
        self.assertFalse(self.register["scope"]["canonical_edits"])

    def test_d119_active_source_count_conflict_is_explicit(self):
        d119 = self.by_domain["D119"]
        self.assertEqual(20, d119["active_role_count"])
        self.assertEqual(17, d119["source_inventory_role_count"])
        self.assertEqual(17, len(d119["role_keys"]))
        self.assertIn("counts disagree", d119["coverage_disposition"])
        self.assertIn("blocker", d119["candidates"][0]["recommendation_status"])

    def test_next_batch_global_candidates_and_localized_deferments_are_scoped(self):
        d120 = self.by_domain["D120"]
        self.assertEqual("D120|aquaculture_production_manager_inactive", d120["candidates"][0]["candidate_key"])
        self.assertIn("ILO_ISCO08_TRANSPORT_AGRICULTURE", d120["candidates"][0]["source_refs"])
        d121 = self.by_domain["D121"]
        self.assertEqual(2, len(d121["candidates"]))
        d122 = self.by_domain["D122"]
        self.assertIn("specialization_not_role", d122["candidates"][1]["recommendation_status"])
        self.assertIn("WHO_GLOBAL_BLOOD_SAFETY", d122["candidates"][1]["source_refs"])
        self.assertIn("national cadre labels", self.by_domain["D124"]["coverage_disposition"])

    def test_d125_d129_families_are_source_linked_and_specializations_not_overstated(self):
        d125 = self.by_domain["D125"]["candidates"][0]
        self.assertIn("ILO_ISCO08_ADMIN_SOCIAL", d125["source_refs"])
        d126 = self.by_domain["D126"]
        self.assertEqual(2, len(d126["candidates"]))
        self.assertIn("WHO_GLOBAL_TCIM_STRATEGY", d126["source_refs"])
        d128 = self.by_domain["D128"]
        self.assertEqual(3, len(d128["candidates"]))
        self.assertIn("manager/director", d128["coverage_disposition"])
        self.assertIn("national service variants remain deferred", self.by_domain["D129"]["coverage_disposition"])

    def test_d130_d134_candidate_boundaries_and_global_sources(self):
        self.assertEqual([], self.by_domain["D130"]["candidates"])
        d131 = self.by_domain["D131"]
        self.assertEqual("D131|race_engineer_inactive", d131["candidates"][0]["candidate_key"])
        self.assertIn("vehicle dynamics and composites engineering are engineering specialisms", d131["coverage_disposition"])
        d132 = self.by_domain["D132"]["candidates"][0]
        self.assertIn("ESA_SPACE_MISSION_CONTROL_ROLES", d132["source_refs"])
        d134 = self.by_domain["D134"]
        self.assertEqual(2, len(d134["candidates"]))
        self.assertIn("IMO_STCW_ELECTROTECHNICAL_OFFICER", d134["candidates"][0]["source_refs"])
        self.assertIn("internationally standardized", d134["candidates"][0]["title_status"].lower())

    def test_d135_d139_distinguish_role_candidates_from_specialties(self):
        self.assertEqual([], self.by_domain["D135"]["candidates"])
        self.assertEqual("D136|flight_test_engineer_missing", self.by_domain["D136"]["candidates"][0]["candidate_key"])
        d137 = self.by_domain["D137"]["candidates"][0]
        self.assertIn("North American", d137["title_status"])
        self.assertEqual([], self.by_domain["D138"]["candidates"])
        d139 = self.by_domain["D139"]
        self.assertEqual(["D139|game_environment_artist_family"], [c["candidate_key"] for c in d139["candidates"]])
        self.assertIn("SCREENSKILLS_GAME_ROLE_PROFILES", d139["candidates"][0]["source_refs"])
        self.assertIn("not automatically add", d139["candidates"][0]["recommendation_status"])
        self.assertIn("Gameplay Engineer / Gameplay Programmer", d139["coverage_disposition"])
        self.assertIn("Technical Artist (Games)", d139["coverage_disposition"])

    def test_d140_d144_compares_distinct_forensic_and_observer_functions(self):
        self.assertEqual([], self.by_domain["D140"]["candidates"])
        self.assertEqual([], self.by_domain["D141"]["candidates"])
        self.assertEqual([], self.by_domain["D142"]["candidates"])
        d143 = self.by_domain["D143"]
        self.assertEqual(2, len(d143["candidates"]))
        self.assertTrue(all("ENFSI_FORENSIC_PRACTITIONER_ROLES" in c["source_refs"] for c in d143["candidates"]))
        d144 = self.by_domain["D144"]["candidates"][0]
        self.assertIn("WMO_METEOROLOGICAL_OBSERVER_FRAMEWORK", d144["source_refs"])
        self.assertIn("vary by country", d144["title_status"])


if __name__ == "__main__":
    unittest.main()

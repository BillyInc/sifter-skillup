import json
from pathlib import Path


LANE_DIR = Path(__file__).resolve().parent
QUEUE_PATH = LANE_DIR / "D085_D168_role_fit_queue_2026_10_05.json"
REVIEWED_DOMAINS = ("D086", "D087", "D088", "D089", "D090", "D091", "D092", "D093", "D094", "D095", "D096", "D097", "D098", "D099", "D100", "D101", "D102", "D103", "D104", "D105", "D106", "D107", "D108", "D109", "D110", "D111", "D112", "D113", "D114", "D115", "D116", "D117", "D118", "D120", "D121", "D122", "D123", "D124", "D125", "D126", "D127", "D128", "D129", "D130", "D131", "D132", "D133", "D134", "D135", "D136", "D137", "D138", "D139", "D140", "D141", "D142", "D143", "D144", "D145", "D146", "D147", "D148", "D149", "D150", "D151", "D152", "D154", "D155", "D156", "D158", "D159", "D160", "D161", "D162", "D163", "D164", "D165", "D166", "D167", "D168")
SPECIALIZATION_FIELDS = {
    "specialization_fit",
    "specialization_fit_status",
    "specialization_key",
    "candidate_specialization",
    "subgroup_fit",
    "subgroup_key",
}


def test_domain_only_lane_reviews_match_exact_queued_role_keys():
    queue = json.loads(QUEUE_PATH.read_text(encoding="utf-8"))
    queued = queue["unresolved_rows"]
    all_reviewed_keys = []

    for domain_id in REVIEWED_DOMAINS:
        path = LANE_DIR / f"{domain_id}_role_domain_fit_review_2026_10_05.json"
        review = json.loads(path.read_text(encoding="utf-8"))
        expected = {
            row["role_key"] for row in queued if row["domain_id"] == domain_id
        }
        decisions = review["decisions"]
        actual = {row["role_key"] for row in decisions}

        assert len(actual) == len(decisions)
        assert actual == expected
        assert review["counts"]["mappings_reviewed"] == len(expected)
        assert review["domain_id"] != "D119"
        assert all(row["task_evidence"] and row["source_refs"] for row in decisions)
        statuses = [row["domain_fit"] for row in decisions]
        assert set(statuses) <= {"supported", "conditional", "unsupported", "unsupported_for_domain", "unresolved"}
        assert len(statuses) == sum(review["counts"][key] for key in (
            "supported", "conditional", "unsupported_for_domain", "unresolved"
        ))
        assert review["counts"]["mappings_reviewed"] == len(statuses)
        assert sum(row["domain_fit"] == "supported" for row in decisions) == review["counts"]["supported"]
        assert sum(row["domain_fit"] == "conditional" for row in decisions) == review["counts"]["conditional"]
        assert sum(row["domain_fit"] in {"unsupported", "unsupported_for_domain"} for row in decisions) == review["counts"]["unsupported_for_domain"]
        assert sum(row["domain_fit"] == "unresolved" for row in decisions) == review["counts"]["unresolved"]
        all_reviewed_keys.extend(actual)
        assert all(
            source_ref in review["sources"]
            for row in decisions
            for source_ref in row["source_refs"]
        )
        assert not any(
            SPECIALIZATION_FIELDS.intersection(row) for row in decisions
        )

    assert len(all_reviewed_keys) == len(set(all_reviewed_keys))


def test_requested_range_progress_is_exact_and_excludes_d119():
    queue = json.loads(QUEUE_PATH.read_text(encoding="utf-8"))["unresolved_rows"]
    target = {
        row["role_key"] for row in queue
        if 89 <= int(row["domain_id"][1:]) <= 168 and row["domain_id"] != "D119"
    }
    reviewed = set()
    for domain_id in REVIEWED_DOMAINS:
        if not (89 <= int(domain_id[1:]) <= 168) or domain_id == "D119":
            continue
        review = json.loads((LANE_DIR / f"{domain_id}_role_domain_fit_review_2026_10_05.json").read_text(encoding="utf-8"))
        reviewed.update(row["role_key"] for row in review["decisions"])
    assert len(target) == 1593
    assert len(reviewed) == 1593
    assert reviewed <= target
    assert len(target - reviewed) == 0


def test_user_assigned_d097_d168_lane_progress_is_exact_and_excludes_d119():
    queue = json.loads(QUEUE_PATH.read_text(encoding="utf-8"))["unresolved_rows"]
    target = {
        row["role_key"] for row in queue
        if 97 <= int(row["domain_id"][1:]) <= 168 and row["domain_id"] != "D119"
    }
    reviewed = set()
    for domain_id in REVIEWED_DOMAINS:
        if 97 <= int(domain_id[1:]) <= 168 and domain_id != "D119":
            review = json.loads((LANE_DIR / f"{domain_id}_role_domain_fit_review_2026_10_05.json").read_text(encoding="utf-8"))
            reviewed.update(row["role_key"] for row in review["decisions"])
    assert len(target) == 1464
    assert len(reviewed) == 1464
    assert reviewed <= target
    assert len(target - reviewed) == 0


def test_new_domain_fit_decision_counts_are_reproducible():
    expected_counts = {
        "D086": (13, 13, 0, 0, 0),
        "D087": (5, 5, 0, 0, 0),
        "D088": (12, 7, 1, 4, 0),
        "D089": (4, 4, 0, 0, 0),
        "D090": (15, 12, 3, 0, 0),
        "D091": (7, 7, 0, 0, 0),
        "D092": (21, 20, 1, 0, 0),
        "D093": (21, 18, 3, 0, 0),
        "D094": (26, 18, 8, 0, 0),
        "D095": (20, 10, 1, 9, 0),
        "D096": (15, 8, 4, 3, 0),
        "D097": (63, 52, 5, 6, 0),
        "D098": (23, 9, 2, 12, 0),
        "D099": (20, 14, 4, 2, 0),
        "D100": (15, 8, 5, 2, 0),
        "D101": (6, 6, 0, 0, 0),
        "D102": (36, 26, 4, 6, 0),
        "D103": (20, 13, 3, 4, 0),
        "D104": (24, 10, 7, 7, 0),
        "D105": (15, 8, 2, 5, 0),
        "D106": (28, 20, 4, 3, 1),
        "D107": (68, 53, 9, 6, 0),
        "D108": (20, 17, 2, 1, 0),
        "D109": (19, 16, 3, 0, 0),
        "D110": (56, 41, 12, 3, 0),
        "D111": (43, 35, 5, 3, 0),
        "D112": (22, 20, 2, 0, 0),
        "D113": (41, 15, 12, 14, 0),
        "D114": (43, 37, 4, 1, 1),
        "D115": (28, 21, 1, 3, 3),
        "D116": (20, 14, 4, 2, 0),
        "D117": (20, 20, 0, 0, 0),
        "D118": (23, 18, 5, 0, 0),
        "D120": (20, 20, 0, 0, 0),
        "D121": (20, 13, 4, 3, 0),
        "D122": (20, 11, 2, 6, 1),
        "D123": (13, 12, 0, 1, 0),
        "D124": (17, 11, 2, 3, 1),
        "D125": (10, 8, 1, 1, 0),
        "D126": (11, 8, 2, 0, 1),
        "D127": (20, 16, 3, 1, 0),
        "D128": (20, 20, 0, 0, 0),
        "D129": (21, 21, 0, 0, 0),
        "D130": (17, 14, 3, 0, 0),
        "D131": (26, 0, 20, 6, 0),
        "D132": (8, 7, 1, 0, 0),
        "D133": (33, 3, 7, 23, 0),
        "D134": (20, 14, 2, 4, 0),
        "D135": (15, 13, 1, 1, 0),
        "D136": (20, 13, 3, 4, 0),
        "D137": (9, 5, 2, 2, 0),
        "D138": (15, 6, 5, 4, 0),
        "D139": (41, 17, 20, 4, 0),
        "D140": (20, 13, 5, 2, 0),
        "D141": (19, 19, 0, 0, 0),
        "D142": (36, 1, 17, 18, 0),
        "D143": (22, 4, 15, 3, 0),
        "D144": (14, 10, 3, 1, 0),
        "D145": (12, 9, 1, 2, 0),
        "D146": (13, 6, 4, 3, 0),
        "D147": (15, 11, 2, 2, 0),
        "D148": (18, 4, 10, 4, 0),
        "D149": (12, 7, 4, 1, 0),
        "D150": (9, 7, 1, 0, 1),
        "D151": (20, 17, 2, 1, 0),
        "D152": (13, 7, 3, 3, 0),
        "D154": (17, 11, 6, 0, 0),
        "D155": (16, 7, 9, 0, 0),
        "D156": (11, 6, 3, 2, 0),
        "D158": (20, 7, 9, 4, 0),
        "D159": (27, 7, 12, 8, 0),
        "D160": (12, 4, 8, 0, 0),
        "D161": (18, 4, 13, 1, 0),
        "D162": (8, 2, 2, 4, 0),
        "D163": (6, 3, 2, 1, 0),
        "D164": (20, 7, 6, 7, 0),
        "D165": (15, 9, 5, 1, 0),
        "D166": (14, 0, 14, 0, 0),
        "D167": (13, 6, 5, 2, 0),
        "D168": (15, 9, 5, 1, 0),
    }

    for domain_id, expected in expected_counts.items():
        review = json.loads(
            (LANE_DIR / f"{domain_id}_role_domain_fit_review_2026_10_05.json")
            .read_text(encoding="utf-8")
        )
        counts = review["counts"]
        actual = (
            counts["mappings_reviewed"],
            counts["supported"],
            counts["conditional"],
            counts["unsupported_for_domain"],
            counts["unresolved"],
        )
        assert actual == expected

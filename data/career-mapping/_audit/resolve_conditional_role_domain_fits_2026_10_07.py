"""Apply narrowly guarded, task-source resolutions to conditional role/domain links.

This is an exact-key correction pass. Each override cites a role-specific
occupational task profile and is guarded by exact current status, source code,
and task snippets from the checked-in O*NET 31.0 source-derived work profiles.
No subgroup/area-fit fields or taxonomy files are touched.
"""

from __future__ import annotations

import argparse
import json
from collections import Counter
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
ROLE_FILES = (
    ROOT / "role_library_v3_cleaned.json",
    ROOT / "thin_domain_role_overlays.json",
    ROOT / "emerging_role_overlays.json",
)
WORK_PROFILES = ROOT / "role_work_profiles.json"
REPORT = AUDIT / "conditional_role_domain_task_resolution_2026_10_07.json"
REPORT_MD = AUDIT / "CONDITIONAL_ROLE_DOMAIN_TASK_RESOLUTION_2026_10_07.md"
APPLY_DATE = "2026-10-07"

ONET_ROOT = "https://www.onetonline.org/link/summary/"

# Individual determinations. Keep this table deliberately explicit; do not
# generalize the rule to other roles based on title/subgroup/ISCO similarity.
RESOLUTIONS: dict[str, dict[str, Any]] = {
    "D001|ICT system tester": {
        "status": "supported",
        "onet_code": "15-1253.00",
        "required_task_fragments": (
            "Document software defects",
            "Develop testing programs",
            "Install, maintain, or use software testing programs",
        ),
        "basis": (
            "O*NET 31.0 task statements resolve the former software-versus-ICT-"
            "hardware ambiguity for this linked occupation: the specified tasks "
            "are diagnosing program-function defects, documenting software defects, "
            "designing software test programs, and using software-testing programs. "
            "These are direct software testing and quality tasks within D001 Software "
            "Engineering; the link is supported for the occupation profile, not inferred "
            "from ISCO membership."
        ),
    },
    "D001|user interface designer": {
        "status": "supported",
        "onet_code": "15-1255.00",
        "required_task_fragments": (
            "Design, build, or maintain Web sites",
            "Write supporting code for Web applications or Web sites",
            "Perform Web site tests",
        ),
        "basis": (
            "O*NET 31.0 defines this occupation's tasks to include building and "
            "maintaining websites, writing supporting code for web applications, and "
            "testing websites after product revisions. Those are concrete software "
            "implementation/testing activities within D001 Software Engineering, even "
            "though the role also has a design remit and may fit design domains. This "
            "supports a multi-domain link; it does not claim that every UI designer's "
            "work is exclusively software engineering."
        ),
    },
    "D004|Security Management Specialists": {
        "status": "unsupported",
        "onet_code": "13-1199.07",
        "required_task_fragments": (
            "physical security threats",
            "physical security design features",
            "physical security or staff safety",
        ),
        "basis": (
            "The exact O*NET 31.0 Security Management Specialists profile describes "
            "physical-security threats, physical-security design, and staff/facility "
            "safety; its task set does not establish cybersecurity, protection of "
            "information systems, or cyber-incident work. Therefore this generic "
            "security-management occupation is not supported as a D004 Cybersecurity "
            "role. This excludes only this exact role-to-domain link; it does not "
            "remove or globally reclassify the occupation."
        ),
    },
    "D003|AI and Machine Learning Specialists": {
        "status": "supported",
        "external_source_url": "https://cloud.google.com/learn/certification/machine-learning-engineer",
        "required_record_fragments": (
            "artificial neural networks",
            "algorithms",
        ),
        "basis": (
            "The role record names AI and Machine Learning Specialists and lists "
            "artificial neural networks and algorithms among the role skills. Google's "
            "Professional Machine Learning Engineer role standard describes designing, "
            "building, evaluating, deploying, monitoring, and optimizing ML solutions. "
            "That is direct work in D003 Artificial Intelligence and Machine Learning, "
            "not merely using AI tools. This supports the role-category link; the Google "
            "standard is task evidence, not a claim that all employers use Google's stack."
        ),
    },
    "D005|DevOps Engineers": {
        "status": "supported",
        "external_source_url": "https://cloud.google.com/learn/certification/cloud-devops-engineer",
        "required_record_fragments": (
            "DevOps",
            "cloud technologies",
            "cloud monitoring and reporting",
        ),
        "basis": (
            "The canonical role record names DevOps Engineers and includes cloud "
            "technologies and cloud monitoring among its skills. Google's Professional "
            "Cloud DevOps Engineer task standard explicitly covers CI/CD for application "
            "and infrastructure workloads, SRE, observability, troubleshooting, and "
            "production optimization. These are direct D005 Cloud Computing and DevOps "
            "activities, resolving the former role-trend-only limitation with an "
            "authoritative task profile. The provider-specific examples do not make its "
            "toolchain mandatory or imply Nigerian market demand."
        ),
    },
    "D009|Clinical Data Managers": {
        "status": "supported",
        "external_source_url": f"{ONET_ROOT}15-2051.02",
        "expected_onet_code": "15-2051.02",
        "required_record_fragments": (
            "analyze clinical data",
            "identify and report trends",
        ),
        "basis": (
            "The exact O*NET occupation profile for Clinical Data Managers states that "
            "they analyze clinical data and identify/report trends; its task list also "
            "includes statistical analysis of clinical data, analysis listings, and "
            "data-analysis reports. This is substantive data analysis within D009 Data "
            "Science, not database stewardship alone. The role retains its clinical-data "
            "specialty; this decision supports the parent-domain fit without asserting "
            "that it is a general-purpose data scientist."
        ),
    },
    "D009|Financial Risk Specialists": {
        "status": "supported",
        "external_source_url": f"{ONET_ROOT}13-2054.00",
        "expected_onet_code": "13-2054.00",
        "required_record_fragments": (
            "Analyze and measure exposure to credit and market risk",
        ),
        "basis": (
            "The exact O*NET Financial Risk Specialists profile includes statistical "
            "analyses using statistical software/econometric models, development of "
            "risk-assessment models, scenario analysis, and interpreting financial data "
            "to forecast conditions. Those are concrete statistical/modeling tasks "
            "within D009 Data Science; this resolves the concern that risk work might "
            "be only oversight or compliance. It does not claim every risk-specialist "
            "job uses identical models."
        ),
    },
    "D009|biometrician": {
        "status": "supported",
        "onet_code": "15-2041.01",
        "required_task_fragments": (
            "Draw conclusions or make predictions, based on data summaries or statistical analyses.",
            "Analyze clinical or survey data, using statistical approaches",
        ),
        "basis": (
            "O*NET's Biostatisticians profile explicitly lists Biometrician as a sample "
            "job title and assigns statistical analysis/modeling tasks, including "
            "clinical or survey-data analysis and inference from statistical summaries. "
            "That role-task evidence fits D009 Data Science's statistics-and-computing "
            "scope; the result corrects the earlier assumption that biometric work "
            "might be measurement-only. The occupation remains specifically "
            "biometric/biostatistical, not a general data-science role."
        ),
    },
    "D006|Internet of Things Specialists": {
        "status": "supported",
        "external_source_url": "https://www.itu.int/net/ITU-R/asp/terminology-definition.asp?lang=en&rlink=%7B42AA741E-A0A7-48C4-905B-AAAFDA29E5F2%7D",
        "required_record_fragments": (
            "Internet of Things",
            "embedded systems",
            "hardware testing methods",
        ),
        "basis": (
            "The canonical role is explicitly named Internet of Things Specialists and its "
            "role-specific skills include embedded systems, IoT, hardware platforms and "
            "hardware testing. ITU defines IoT as interconnecting physical and virtual "
            "things through interoperable ICT, which is the exact scope of D006 Internet "
            "of Things and Embedded Systems. The fit is therefore directly supported by "
            "the role identity and task-relevant skill profile, not merely by the WEF growth "
            "signal or a neighbouring subgroup."
        ),
    },
    "D008|aviation data communications manager": {
        "status": "supported",
        "external_source_url": "http://data.europa.eu/esco/occupation/591c5063-69ce-4551-ba60-e2304111130f",
        "required_record_fragments": (
            "planning, implementation and maintenance of data transmission networks",
            "data processing systems",
        ),
        "basis": (
            "The exact ESCO occupation description says this role plans, implements and "
            "maintains data-transmission networks and supports data-processing systems "
            "linking user agencies to central computers. Those are core telecommunications "
            "and network-engineering tasks in D008; aviation identifies the operating sector, "
            "not a conflicting occupational domain. This supports the parent-domain link "
            "without asserting that every aviation communications post has identical duties."
        ),
    },
}


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def write_json(path: Path, value: Any) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def rows_in(payload: Any) -> list[dict[str, Any]]:
    if isinstance(payload, list):
        return payload
    if isinstance(payload, dict) and isinstance(payload.get("roles"), list):
        return payload["roles"]
    raise ValueError("Unsupported canonical role JSON shape")


def exact_key(row: dict[str, Any]) -> str:
    return f"{row.get('domain_id')}|{row.get('role_name')}"


def append_unique(values: Any, value: str) -> list[str]:
    existing = values if isinstance(values, list) else []
    return list(dict.fromkeys([str(item) for item in existing if str(item).strip()] + [value]))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="apply the guarded exact-key corrections")
    args = parser.parse_args()

    profile_payload = read_json(WORK_PROFILES)
    profiles = {
        row.get("role_key"): row
        for row in profile_payload.get("profiles", [])
        if isinstance(row, dict) and row.get("role_key")
    }
    containers: dict[Path, Any] = {}
    locations: dict[str, list[tuple[Path, dict[str, Any]]]] = {}
    for path in ROLE_FILES:
        payload = read_json(path)
        containers[path] = payload
        for row in rows_in(payload):
            locations.setdefault(exact_key(row), []).append((path, row))

    duplicate_keys = {key: len(rows) for key, rows in locations.items() if len(rows) > 1}
    if any(key in duplicate_keys for key in RESOLUTIONS):
        raise ValueError(f"Duplicate current target keys: {duplicate_keys}")

    changes: list[dict[str, Any]] = []
    missing: list[str] = []
    conditional_before = sum(
        1 for rows in locations.values()
        if rows and rows[0][1].get("domain_fit_review_status") == "conditional"
    )
    for key, decision in RESOLUTIONS.items():
        matches = locations.get(key, [])
        if len(matches) != 1:
            missing.append(key)
            continue
        path, row = matches[0]
        profile = profiles.get(key)
        if decision.get("onet_code"):
            if not profile or profile.get("source_record_status") != "source_backed":
                raise ValueError(f"No source-backed O*NET work profile for {key}")
            codes = set(profile.get("onet_occupation_codes") or [])
            if decision["onet_code"] not in codes:
                raise ValueError(f"O*NET code guard failed for {key}: {codes}")
            task_text = "\n".join(profile.get("activities") or [])
            absent = [fragment for fragment in decision["required_task_fragments"] if fragment.casefold() not in task_text.casefold()]
            if absent:
                raise ValueError(f"O*NET task guard failed for {key}: {absent}")
        else:
            if decision.get("expected_onet_code"):
                if not profile or decision["expected_onet_code"] not in set(profile.get("onet_occupation_codes") or []):
                    raise ValueError(f"O*NET profile-code guard failed for {key}")
            profile_fragments = decision.get("required_profile_task_fragments", [])
            if profile_fragments:
                profile_text = "\n".join(profile.get("activities") or []) if profile else ""
                absent_profile = [fragment for fragment in profile_fragments if fragment.casefold() not in profile_text.casefold()]
                if absent_profile:
                    raise ValueError(f"O*NET profile task guard failed for {key}: {absent_profile}")
            canonical_text = "\n".join(
                str(row.get(field) or "")
                for field in ("role_name", "description", "essential_skills", "optional_skills")
            )
            absent = [fragment for fragment in decision["required_record_fragments"] if fragment.casefold() not in canonical_text.casefold()]
            if absent:
                raise ValueError(f"Canonical role evidence guard failed for {key}: {absent}")
        current_status = row.get("domain_fit_review_status")
        if current_status not in {"conditional", decision["status"]}:
            raise ValueError(f"Unexpected current status for {key}: {current_status!r}")

        refs = (
            [f"{ONET_ROOT}{decision['onet_code']}"]
            if decision.get("onet_code")
            else [decision["external_source_url"]]
        )
        before = {
            field: row.get(field)
            for field in (
                "domain_fit_review_status",
                "domain_fit_review_basis",
                "domain_fit_review_source_refs",
                "role_domain_lane_review_status",
                "student_path_status",
                "student_path_exclusion_reason",
            )
        }
        changed = current_status == "conditional"
        if args.apply and changed:
            row["domain_fit_review_status"] = decision["status"]
            row["domain_fit_review_basis"] = (
                (str(row.get("domain_fit_review_basis") or "").strip() + " ")
                + "Targeted task-source resolution 2026-10-07: "
                + decision["basis"]
            ).strip()
            row["domain_fit_review_source_refs"] = list(dict.fromkeys(
                (row.get("domain_fit_review_source_refs") or []) + refs
            ))
            row["role_domain_lane_review_date"] = APPLY_DATE
            row["role_domain_lane_review_status"] = f"reviewed_{decision['status']}"
            provenance = (
                f"O*NET 31.0 task profile {decision['onet_code']}"
                if decision.get("onet_code")
                else f"Professional task standard: {decision['external_source_url']}"
            )
            row["role_domain_lane_review_sources"] = append_unique(
                row.get("role_domain_lane_review_sources"),
                provenance,
            )
            if decision["status"] == "unsupported":
                row["student_path_status"] = "excluded"
                exclusion = (
                    "Exact parent-domain link excluded after task-source review: "
                    "the occupation task profile does not establish cybersecurity work."
                )
                row["student_path_exclusion_reason"] = exclusion
            elif row.get("student_path_status") == "excluded" and "role-to-domain reconciliation" in str(row.get("student_path_exclusion_reason") or "").casefold():
                row["student_path_status"] = "active"
                row.pop("student_path_exclusion_reason", None)

        after = {
            field: row.get(field)
            for field in (
                "domain_fit_review_status",
                "domain_fit_review_basis",
                "domain_fit_review_source_refs",
                "role_domain_lane_review_status",
                "student_path_status",
                "student_path_exclusion_reason",
            )
        }
        changes.append({
            "role_key": key,
            "source_file": str(path.relative_to(ROOT)),
            "status_before": current_status,
            "status_after": decision["status"] if args.apply else current_status,
            "action": "applied" if args.apply and changed else "already_applied" if current_status == decision["status"] else "dry_run_candidate",
            "onet_code": decision.get("onet_code"),
            "required_task_fragments_verified": list(decision.get("required_task_fragments", [])),
            "required_record_fragments_verified": list(decision.get("required_record_fragments", [])),
            "required_profile_task_fragments_verified": list(decision.get("required_profile_task_fragments", [])),
            "source_refs": refs,
            "before": before,
            "after": after,
        })

    if missing:
        raise ValueError(f"Exact targets absent from current role sources: {missing}")

    if args.apply:
        changed_paths = {
            ROOT / row["source_file"] for row in changes if row["action"] == "applied"
        }
        for path in changed_paths:
            write_json(path, containers[path])

    conditional_after = sum(
        1 for rows in locations.values()
        if rows and rows[0][1].get("domain_fit_review_status") == "conditional"
    )
    count_after = Counter(row["status_after"] for row in changes)
    report = {
        "schema_version": "2026-10-07.conditional-role-domain-task-resolution.v1",
        "mode": "APPLIED" if args.apply else "DRY_RUN",
        "scope": "Exact source-confirmed parent-domain metadata corrections only; no taxonomy, subgroup, specialization-fit, or role-area fields edited.",
        "conditional_before": conditional_before,
        "targeted_case_count": len(changes),
        "newly_repaired": sum(row["action"] == "applied" for row in changes),
        "already_applied": sum(row["action"] == "already_applied" for row in changes),
        "conditional_after": conditional_after,
        "remaining_conditional_estimate": conditional_after,
        "resulting_target_status_counts": dict(count_after),
        "changes": changes,
        "guards": {
            "exact_role_domain_key_only": True,
            "source_backed_profile_required": True,
            "occupation_code_guarded": True,
            "task_fragments_guarded": True,
            "status_must_be_conditional_or_same_target_status": True,
            "no_domain_or_subgroup_taxonomy_edit": True,
            "no_role_area_or_specialization_fit_edit": True,
            "unsupported_excludes_only_exact_parent_link": True,
            "no_keyword_or_ISCO_only_inference": True,
        },
    }
    write_json(REPORT, report)
    repaired = report["newly_repaired"]
    REPORT_MD.write_text(
        "\n".join([
            "# Conditional role-to-domain task-source resolution — 2026-10-07",
            "",
            f"Mode: **{report['mode']}**.",
            f"Exact guarded cases: **{len(changes)}**; newly repaired: **{repaired}**; "
            f"already applied: **{report['already_applied']}**; remaining conditional estimate: **{report['remaining_conditional_estimate']}**.",
            "",
            "Repairs use official O*NET occupation task profiles and exact task-fragment guards. "
            "No ISCO/subgroup inference or blanket status promotion is used.",
            "",
            "See the JSON report for per-role task snippets, exact source URLs, and before/after fields.",
        ]) + "\n",
        encoding="utf-8",
    )
    print(json.dumps({key: report[key] for key in (
        "mode", "targeted_case_count", "newly_repaired", "already_applied",
        "remaining_conditional_estimate", "resulting_target_status_counts",
    )}, indent=2))


if __name__ == "__main__":
    main()
